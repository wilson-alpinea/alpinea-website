import { NextResponse, type NextRequest } from "next/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { arquivoDaEmpreiteira } from "@/lib/crm/portalEmpreiteira";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Documento de candidato para a empreiteira (Wilson, 21/out/2026): confere
// que a candidatura é de uma vaga dela, resolve a chave para o caminho no
// storage (o caminho nunca vem do navegador) e redireciona para uma URL
// assinada de 60s.
export async function GET(request: NextRequest) {
  const acesso = await obterAcesso();
  if (!acesso) return NextResponse.redirect(new URL("/crm/login", request.url));
  if (acesso.papel !== "empreiteira" || !acesso.parceiro?.ativo || acesso.parceiro.tipo !== "empreiteira") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const candidaturaId = request.nextUrl.searchParams.get("c") ?? "";
  const chave = request.nextUrl.searchParams.get("k") ?? "";
  const arquivo = await arquivoDaEmpreiteira(acesso.parceiro.id, candidaturaId, chave);
  if (!arquivo) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const { data, error } = await createAdminClient().storage.from(arquivo.bucket).createSignedUrl(arquivo.path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
