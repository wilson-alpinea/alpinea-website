import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKETS_CANDIDATO } from "@/lib/crm/empregos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abre currículo, certificado JLPT/BJT, certidão da PF ou foto de um
// candidato — mesmo padrão de /crm/documento-jrpass: confere a sessão do
// CRM, gera URL assinada de 60s no bucket privado e redireciona.
const CAMINHO_SEGURO = /^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)?$/;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/crm/login", request.url));

  const bucket = request.nextUrl.searchParams.get("bucket") ?? "";
  const caminho = request.nextUrl.searchParams.get("path") ?? "";
  if (!(BUCKETS_CANDIDATO as readonly string[]).includes(bucket) || !CAMINHO_SEGURO.test(caminho)) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  const { data, error } = await createAdminClient().storage.from(bucket).createSignedUrl(caminho, 60);
  if (error || !data?.signedUrl) {
    console.error("Erro ao gerar URL assinada (crm/empregos/arquivo):", error);
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl);
}
