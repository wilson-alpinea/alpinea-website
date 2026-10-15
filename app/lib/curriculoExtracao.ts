// Extração de texto puro de um currículo enviado (PDF ou DOCX) — usado só
// em código de servidor (app/api/empregos-candidatura/route.ts) pra
// alimentar o motor de pontuação (app/lib/candidaturaScoring.ts). Sem IA:
// isso é só leitura de texto do arquivo, não interpretação de conteúdo.
//
// Só importar isto de código de servidor — puxa pdf-parse/mammoth
// (Node-only, usam `fs`/`http`/`https`). As constantes de tipo aceito
// (usadas também no Client Component app/empregos/page.tsx) ficam em
// app/lib/curriculoConstantes.ts, sem essa dependência — corrige erro
// de build no Vercel, 25/set/2026 ("Module not found: Can't resolve
// 'fs'").
//
// Formatos aceitos: PDF (pdf-parse) e DOCX (mammoth). .doc antigo (Word
// 97-2003) e imagem escaneada sem texto (PDF "imagem") não têm extração
// confiável sem OCR/IA — nesses casos a extração retorna string vazia, e
// o critério "currículo completo e legível" da pontuação naturalmente
// zera, o que ainda deixa a candidatura registrada pra revisão manual
// (não trava o envio).

// O Postgres não aceita o caractere nulo (\u0000) nem "metade" de um par
// de surrogates em colunas text/jsonb — e o pdf-parse às vezes devolve os
// dois em PDFs gerados por certos editores. Um único caractere desses fazia
// o INSERT da candidatura falhar inteiro (15/out/2026: "todas as vagas
// estão com erro"). Remove só esses caracteres; o resto do texto fica.
export function limparTextoParaBanco(texto: string): string {
  return texto
    .replace(/\u0000/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
}

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
      return limparTextoParaBanco(dados.text || "").trim();
    }
    if (ehDocx) {
      const mammoth = await import("mammoth");
      const resultado = await mammoth.extractRawText({ buffer });
      return limparTextoParaBanco(resultado.value || "").trim();
    }
  } catch (error) {
    console.error("Erro ao extrair texto do currículo:", error);
    return "";
  }

  // .doc antigo ou formato não suportado — sem extração confiável sem IA.
  return "";
}

