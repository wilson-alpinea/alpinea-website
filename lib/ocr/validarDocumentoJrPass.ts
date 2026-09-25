import { createWorker } from "tesseract.js";

// Validador simples de foto pro checkout do JR Pass — pedido do Wilson,
// 25/set/2026: "criar um validador de foto script simples de checagem" +
// confirmado via AskUserQuestion (25/set/2026): usar OCR pra confirmar
// que a imagem parece mesmo um passaporte ou uma passagem/itinerário.
//
// Importante — isso é best-effort e NUNCA bloqueia o cliente: mesmo se o
// OCR falhar, der timeout, ou não reconhecer nada, o upload já aconteceu
// (ver app/api/jrpass-documento/route.ts) e o pedido segue normalmente —
// a equipe da Alpinea sempre revisa o documento manualmente antes de
// emitir o passe. O validador só dá um retorno rápido pro cliente
// ("documento recebido" vs. "não conseguimos confirmar, vamos revisar")
// e uma dica pra equipe interna, nunca uma decisão final.
export type ConfiancaValidacao = "alta" | "baixa" | "indisponivel";

export type ResultadoValidacaoDocumento = {
  ok: boolean;
  confianca: ConfiancaValidacao;
  motivo: string;
};

const TIMEOUT_OCR_MS = 15000;

// Palavras-chave que costumam aparecer nos dois tipos de documento —
// texto em maiúsculas porque o OCR de documentos de viagem (passaporte,
// bilhete aéreo) é quase sempre impresso em caixa alta.
const PALAVRAS_PASSAPORTE = [
  "PASSPORT",
  "PASSAPORTE",
  "REPUBLICA",
  "REPUBLIC",
  "TYPE",
  "AUTHORITY",
  "NATIONALITY",
  "NACIONALIDADE",
];

const PALAVRAS_PASSAGEM = [
  "BOARDING PASS",
  "CARTAO DE EMBARQUE",
  "E-TICKET",
  "ETICKET",
  "ITINERARY",
  "ITINERARIO",
  "FLIGHT",
  "VOO",
  "PASSENGER",
  "PASSAGEIRO",
  "DEPARTURE",
  "PARTIDA",
  "BOOKING",
  "RESERVA",
];

// Zona de leitura da máquina (MRZ) do passaporte: duas linhas de 44
// caracteres em maiúsculas/números/"<" — um sinal bem forte de que a
// imagem é mesmo um passaporte, mesmo se o resto do OCR sair ruim.
const REGEX_LINHA_MRZ = /[A-Z0-9<]{20,44}/g;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toUpperCase();
}

function pareceMrz(textoNormalizado: string): boolean {
  const candidatas = textoNormalizado.match(REGEX_LINHA_MRZ) ?? [];
  return candidatas.some((linha) => (linha.match(/</g)?.length ?? 0) >= 3);
}

async function reconhecerTexto(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng", 1, {
    cachePath: "/tmp",
  });
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text || "";
  } finally {
    await worker.terminate();
  }
}

export async function validarDocumentoJrPass(
  buffer: Buffer,
  tipoEsperado: "passaporte" | "passagem",
): Promise<ResultadoValidacaoDocumento> {
  try {
    const textoBruto = await Promise.race([
      reconhecerTexto(buffer),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_OCR_MS),
      ),
    ]);

    const texto = normalizar(textoBruto);

    if (tipoEsperado === "passaporte") {
      const bateuPalavra = PALAVRAS_PASSAPORTE.some((p) => texto.includes(p));
      const bateuMrz = pareceMrz(texto);
      if (bateuMrz || bateuPalavra) {
        return {
          ok: true,
          confianca: bateuMrz ? "alta" : "baixa",
          motivo: bateuMrz
            ? "Zona de leitura de máquina (MRZ) do passaporte reconhecida."
            : "Termos característicos de passaporte encontrados no texto.",
        };
      }
      return {
        ok: false,
        confianca: "baixa",
        motivo: "Não encontramos termos ou MRZ de passaporte na imagem — nossa equipe vai revisar manualmente.",
      };
    }

    // passagem / itinerário
    const bateuPalavra = PALAVRAS_PASSAGEM.some((p) => texto.includes(p));
    if (bateuPalavra) {
      return {
        ok: true,
        confianca: "alta",
        motivo: "Termos característicos de passagem/itinerário encontrados no texto.",
      };
    }
    return {
      ok: false,
      confianca: "baixa",
      motivo: "Não encontramos termos de passagem/itinerário na imagem — nossa equipe vai revisar manualmente.",
    };
  } catch (erro) {
    console.error("Erro/timeout no OCR do documento JR Pass:", erro);
    return {
      ok: false,
      confianca: "indisponivel",
      motivo: "Não foi possível rodar a checagem automática agora — o documento foi recebido e nossa equipe vai revisar.",
    };
  }
}
