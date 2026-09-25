import type { SupabaseClient } from "@supabase/supabase-js";

// Bucket privado pros documentos que o cliente anexa no checkout do JR
// Pass (foto do passaporte ou da passagem) — pedido do Wilson, 25/set/2026:
// "aqui o finalizar compra vai gerar uma nova tela que precisa capturar a
// foto do passaporte do cliente [...]" + depois "foto do passaporte ou
// foto da passagem, a o JR pass só pode ser emitido se ele estiver no
// Japao em até 90 dias" — pedimos um dos dois documentos porque é isso
// que confirma a elegibilidade "Temporary Visitor" (ver ELEGIBILIDADE em
// JrPassModal, app/produtos/page.tsx): o passaporte mostra o carimbo de
// entrada no Japão, a passagem/itinerário mostra a data do voo — dá pra
// conferir a janela de 90 dias com qualquer um dos dois.
//
// Privado (public: false) porque é documento de identidade — nunca gera
// URL pública; só acessível via createAdminClient() (service role) no
// servidor, nunca do navegador. Ver lib/supabase/admin.ts.
export const BUCKET_DOCUMENTOS_JRPASS = "documentos-jrpass";

const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10MB
const TIPOS_MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/heic", "image/webp", "application/pdf"];

// Idempotente — cria o bucket só na primeira vez que alguém chama (não dá
// pra rodar isso como script avulso: o ambiente de automação usado nesta
// conversa não tem acesso de rede pro Supabase, só o Vercel em produção
// tem, então o bucket nasce sozinho na primeira chamada real da rota).
export async function ensureBucketDocumentosJrPass(admin: SupabaseClient) {
  const { data: buckets, error: erroListar } = await admin.storage.listBuckets();
  if (erroListar) {
    throw new Error(`Não foi possível verificar buckets do Storage: ${erroListar.message}`);
  }
  const jaExiste = buckets?.some((b) => b.name === BUCKET_DOCUMENTOS_JRPASS);
  if (jaExiste) return;

  const { error: erroCriar } = await admin.storage.createBucket(BUCKET_DOCUMENTOS_JRPASS, {
    public: false,
    fileSizeLimit: TAMANHO_MAXIMO_BYTES,
    allowedMimeTypes: TIPOS_MIME_PERMITIDOS,
  });
  // "already exists" pode acontecer numa corrida entre duas requisições
  // simultâneas criando o bucket ao mesmo tempo — não é erro de verdade.
  if (erroCriar && !/already exists/i.test(erroCriar.message)) {
    throw new Error(`Não foi possível criar o bucket do Storage: ${erroCriar.message}`);
  }
}

export function extensaoPorContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/heic":
      return "heic";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export { TAMANHO_MAXIMO_BYTES, TIPOS_MIME_PERMITIDOS };
