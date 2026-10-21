import { NextResponse, type NextRequest } from "next/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_ARQUIVOS_CLIENTE, PREFIXO_STORAGE } from "@/lib/crm/arquivosStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abre um arquivo enviado na ficha do cliente: confere que é admin, busca o
// caminho pelo id do registro e redireciona para uma URL assinada de 60s.
export async function GET(request: NextRequest) {
  if ((await obterAcesso())?.papel !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });

  const admin = createAdminClient();
  const { data: registro } = await admin.from("arquivos_cliente").select("url, label").eq("id", id).maybeSingle();
  if (!registro?.url?.startsWith(PREFIXO_STORAGE)) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const caminho = registro.url.slice(PREFIXO_STORAGE.length);
  const baixar = request.nextUrl.searchParams.get("baixar") === "1";
  const { data, error } = await admin.storage
    .from(BUCKET_ARQUIVOS_CLIENTE)
    .createSignedUrl(caminho, 60, baixar ? { download: caminho.split("__").slice(1).join("__") || true } : undefined);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
