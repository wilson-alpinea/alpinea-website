import { NextResponse, type NextRequest } from "next/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abre um documento enviado no portal de Documentação — mesmo padrão de
// /crm/empregos/arquivo: só admin, URL assinada de 60 s no bucket privado.
const CAMINHO_SEGURO = /^[0-9a-f-]{36}\/[a-z_]+\/[A-Za-z0-9._-]+$/;

export async function GET(request: NextRequest) {
  if ((await obterAcesso())?.papel !== "admin") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const caminho = request.nextUrl.searchParams.get("path") ?? "";
  if (!CAMINHO_SEGURO.test(caminho)) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  const { data, error } = await createAdminClient().storage.from("documentos-processos").createSignedUrl(caminho, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
