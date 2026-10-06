import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_DOCUMENTOS_JRPASS, CAMINHO_DOCUMENTO_JRPASS_REGEX } from "@/lib/supabase/documentosJrPass";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abre o documento (passaporte/passagem) que o cliente anexou no checkout
// do JR Pass — Wilson, 01/out/2026: "o passaporte anexado não aparece no
// CRM ao entrar na oportunidade". O bucket é privado (nunca tem URL
// pública), então o card em Arquivos aponta pra cá: a rota confere a
// sessão do CRM, gera uma URL assinada de curta duração e redireciona.
// Fica sob /crm/* de propósito — o proxy.ts já exige login; a checagem
// abaixo é uma segunda camada.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/crm/login", request.url));
  }

  const caminho = request.nextUrl.searchParams.get("path") ?? "";
  if (!CAMINHO_DOCUMENTO_JRPASS_REGEX.test(caminho)) {
    return NextResponse.json({ error: "Caminho de documento inválido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET_DOCUMENTOS_JRPASS)
    .createSignedUrl(caminho, 60);

  if (error || !data?.signedUrl) {
    console.error("Erro ao gerar URL assinada do documento JR Pass:", error);
    return NextResponse.json({ error: "Documento não encontrado no Storage." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
