import { NextResponse, type NextRequest } from "next/server";
import { ehEquipe, obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_NF } from "@/lib/crm/notasFiscais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abre uma nota fiscal anexada (só a equipe): URL assinada de 60 s.
export async function GET(request: NextRequest) {
  if (!ehEquipe(await obterAcesso())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  const db = createAdminClient();
  const { data: nf } = await db.from("notas_fiscais").select("caminho, nome_arquivo").eq("id", id).maybeSingle();
  if (!nf) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  const baixar = request.nextUrl.searchParams.get("baixar") === "1";
  const { data, error } = await db.storage.from(BUCKET_NF).createSignedUrl(nf.caminho, 60, baixar ? { download: nf.nome_arquivo } : undefined);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
