// Extração de texto puro de um currículo enviado (PDF ou DOCX) — usado só
// em código de servidor (app/api/empregos-candidatura/route.ts) pra
// alimentar o motor de pontuação (app/lib/candidaturaScoring.ts). Sem IA:
// isso é só leitura de texto do arquivo, não interpretação de conteúdo.
//
// Formatos aceitos: PDF (pdf-parse) e DOCX (mammoth). .doc antigo (Word
// 97-2003) e imagem escaneada sem texto (PDF "imagem") não têm extração
// confiável sem OCR/IA — nesses casos a extração retorna string vazia, e
// o critério "currículo completo e legível" da pontuação naturalmente
// zera, o que ainda deixa a candidatura registrada pra revisão manual
// (não trava o envio).

export async function extrairTextoCurriculo(buffer: Buffer, nomeArquivo: string, mimeType: string): Promise<string> {
  const nome = nomeArquivo.toLowerCase();
  const ehPdf = mimeType === "application/pdf" || nome.endsWith(".pdf");
  const ehDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    nome.endsWith(".docx");

  try {
    if (ehPdf) {
      const pdfParse = (await import("pdf-parse")).default;
      const dados = await pdfParse(buffer);
      return (dados.text || "").trim();
    }
    if (ehDocx) {
      const mammoth = await import("mammoth");
      const resultado = await mammoth.extractRawText({ buffer });
      return (resultado.value || "").trim();
    }
  } catch (error) {
    console.error("Erro ao extrair texto do currículo:", error);
    return "";
  }

  // .doc antigo ou formato não suportado — sem extração confiável sem IA.
  return "";
}

export const TIPOS_CURRICULO_ACEITOS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const EXTENSOES_CURRICULO_ACEITAS = ".pdf,.docx";
