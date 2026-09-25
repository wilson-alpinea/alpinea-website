import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import {
  BUCKET_DOCUMENTOS_JRPASS,
  ensureBucketDocumentosJrPass,
  extensaoPorContentType,
  TAMANHO_MAXIMO_BYTES,
  TIPOS_MIME_PERMITIDOS,
} from "../../../lib/supabase/documentosJrPass";
import { validarDocumentoJrPass } from "../../../lib/ocr/validarDocumentoJrPass";

export const runtime = "nodejs";

// Upload + validação best-effort do documento (passaporte ou passagem) no
// checkout do JR Pass — pedido do Wilson, 25/set/2026: "precisa capturar
// a foto do passaporte do cliente, criar um validador de foto script
// simples de checagem" + "foto do passaporte ou foto da passagem, a o JR
// pass só pode ser emitido se ele estiver no Japao em até 90 dias".
//
// Bucket privado (nunca gera URL pública — ver
// lib/supabase/documentosJrPass.ts). A "referencia" é um id gerado no
// navegador antes do lead existir no CRM (o cliente pode anexar o
// documento antes de preencher nome/e-mail) — /api/jrpass-selfservice
// recebe esse mesmo caminho de Storage e grava no lead, pra equipe achar
// o arquivo depois.
const TIPOS_VALIDOS = ["passaporte", "passagem"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const referencia = String(body.referencia || "").trim();
    const tipoBruto = String(body.tipo || "").trim();
    const arquivoBase64 = String(body.arquivoBase64 || "");
    const contentType = String(body.contentType || "").trim();

    if (!referencia || !/^[a-zA-Z0-9-]{6,80}$/.test(referencia)) {
      return NextResponse.json({ error: "Referência inválida." }, { status: 400 });
    }
    if (!(TIPOS_VALIDOS as readonly string[]).includes(tipoBruto)) {
      return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 });
    }
    const tipo = tipoBruto as (typeof TIPOS_VALIDOS)[number];

    if (!TIPOS_MIME_PERMITIDOS.includes(contentType)) {
      return NextResponse.json(
        { error: "Formato de arquivo não aceito — use foto (JPG/PNG/HEIC/WEBP) ou PDF." },
        { status: 400 },
      );
    }

    const match = arquivoBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.byteLength === 0 || buffer.byteLength > TAMANHO_MAXIMO_BYTES) {
      return NextResponse.json(
        { error: "Arquivo vazio ou maior que 10MB." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    await ensureBucketDocumentosJrPass(admin);

    const extensao = extensaoPorContentType(contentType);
    const caminho = `${referencia}/${tipo}-${Date.now()}.${extensao}`;

    const { error: erroUpload } = await admin.storage
      .from(BUCKET_DOCUMENTOS_JRPASS)
      .upload(caminho, buffer, { contentType, upsert: false });

    if (erroUpload) {
      console.error("Erro ao subir documento JR Pass:", erroUpload);
      return NextResponse.json(
        { error: "Não foi possível enviar o documento agora. Tente de novo ou anexe depois." },
        { status: 500 },
      );
    }

    // OCR é best-effort e nunca bloqueia — mesmo se falhar/der timeout,
    // o upload já aconteceu e o pedido segue (ver
    // lib/ocr/validarDocumentoJrPass.ts). PDF não passa pelo Tesseract
    // (que só lê imagem) — nesse caso, fica como "indisponível" e a
    // equipe revisa manualmente.
    const validacao =
      contentType === "application/pdf"
        ? { ok: false, confianca: "indisponivel" as const, motivo: "PDF recebido — revisão manual necessária." }
        : await validarDocumentoJrPass(buffer, tipo);

    return NextResponse.json({ success: true, path: caminho, validacao }, { status: 200 });
  } catch (error) {
    console.error("Erro no upload de documento JR Pass:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente de novo ou anexe o documento depois." },
      { status: 500 },
    );
  }
}
