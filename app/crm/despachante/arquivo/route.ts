import { NextResponse, type NextRequest } from "next/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Documento de um processo para o despachante (Wilson, 29/out/2026): só se o
// processo (1º trecho do caminho) estiver atribuído a ele. URL assinada de 60 s.
const CAMINHO_SEGURO = /^([0-9a-f-]{36})\/[a-z_]+\/[A-Za-z0-9._-]+$/;

export async function GET(request: NextRequest) {
  const acesso = await obterAcesso();
  if (acesso?.papel !== "despachante") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const caminho = request.nextUrl.searchParams.get("path") ?? "";
  const m = CAMINHO_SEGURO.exec(caminho);
  if (!m) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  const admin = createAdminClient();
  const { data: p } = await admin.from("documentacao_processos").select("despachante_id").eq("id", m[1]).maybeSingle();
  if (!p || p.despachante_id !== acesso.userId) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { data, error } = await admin.storage.from("documentos-processos").createSignedUrl(caminho, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
