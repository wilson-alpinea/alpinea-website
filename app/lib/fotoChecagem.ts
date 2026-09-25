// Checagem automática da foto de candidatura — só o que dá pra medir com
// processamento de imagem puro (sharp), sem IA de visão computacional:
// resolução mínima, proporção de retrato e se o fundo é claro (amostragem
// de pixel nas bordas). NÃO checa boné, óculos escuros, enquadramento do
// rosto — isso exigiria reconhecimento visual de verdade, que fica fora
// do escopo (decisão do Wilson, 25/set/2026: sem IA paga). Esses itens
// ficam só no autocertificado do candidato (ver foto_checklist na
// migração 011 e o formulário em CandidaturaModal), com revisão manual da
// equipe depois.

import sharp from "sharp";

export type CriterioFoto = {
  chave: string;
  label: string;
  aprovado: boolean;
  detalhe: string;
};

export type ChecagemFoto = {
  aprovado: boolean;
  criterios: CriterioFoto[];
};

const LARGURA_MINIMA = 400;
const ALTURA_MINIMA = 500;
const PROPORCAO_MIN = 0.6; // largura/altura — retrato, não quadrado nem paisagem
const PROPORCAO_MAX = 0.95;
const BRILHO_MINIMO_FUNDO = 200; // escala 0-255 (média de R/G/B das amostras de borda)

export async function checarFotoAutomatica(buffer: Buffer): Promise<ChecagemFoto> {
  const criterios: CriterioFoto[] = [];
  const imagem = sharp(buffer);
  const metadata = await imagem.metadata();
  const largura = metadata.width ?? 0;
  const altura = metadata.height ?? 0;

  const resolucaoOk = largura >= LARGURA_MINIMA && altura >= ALTURA_MINIMA;
  criterios.push({
    chave: "resolucao",
    label: "Resolução mínima",
    aprovado: resolucaoOk,
    detalhe: resolucaoOk
      ? `Resolução ${largura}x${altura}px — dentro do esperado.`
      : `Resolução ${largura}x${altura}px está baixa — envie uma foto de pelo menos ${LARGURA_MINIMA}x${ALTURA_MINIMA}px.`,
  });

  const proporcao = altura > 0 ? largura / altura : 0;
  const proporcaoOk = proporcao >= PROPORCAO_MIN && proporcao <= PROPORCAO_MAX;
  criterios.push({
    chave: "proporcao",
    label: "Enquadramento (retrato)",
    aprovado: proporcaoOk,
    detalhe: proporcaoOk
      ? "Proporção da foto é compatível com um retrato tipo 3x4."
      : "A foto não parece estar no formato retrato (mais alta que larga) esperado para uma foto tipo documento.",
  });

  // Fundo claro — reduz a imagem a 100x100 e amostra pixels no topo e nas
  // laterais da metade superior (região que tende a ser só fundo, acima
  // dos ombros), evitando o centro/base onde normalmente está o rosto e o
  // corpo.
  let fundoClaro = false;
  let detalheFundo = "Não foi possível analisar o fundo da foto — verifique o arquivo enviado.";
  try {
    const { data, info } = await imagem
      .resize(100, 100, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const canais = info.channels;
    const w = info.width;
    const h = info.height;
    const amostras: number[] = [];
    const amostrarPixel = (x: number, y: number) => {
      const idx = (y * w + x) * canais;
      amostras.push((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
    };
    for (let x = 0; x < w; x += 5) amostrarPixel(x, 2);
    for (let y = 0; y < Math.floor(h / 2); y += 5) {
      amostrarPixel(2, y);
      amostrarPixel(w - 3, y);
    }
    if (amostras.length > 0) {
      const media = amostras.reduce((s, v) => s + v, 0) / amostras.length;
      fundoClaro = media >= BRILHO_MINIMO_FUNDO;
      detalheFundo = fundoClaro
        ? "O fundo da foto parece claro."
        : "O fundo da foto não parece claro/branco o suficiente — use um fundo liso e bem iluminado.";
    }
  } catch (error) {
    console.error("Erro ao analisar fundo da foto:", error);
  }
  criterios.push({
    chave: "fundoClaro",
    label: "Fundo claro",
    aprovado: fundoClaro,
    detalhe: detalheFundo,
  });

  return { aprovado: criterios.every((c) => c.aprovado), criterios };
}
