import {
  type CambioIene,
  type CidadeCambioIeneSlug,
  COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
  COTACAO_FALLBACK_BRL_POR_JPY_VENDA,
  type DirecaoCambioIene,
  extrairCotacaoPapelMoeda,
} from "./cambioIene";

// Busca da cotação de papel-moeda do iene (melhorcambio.com) — SÓ
// servidor. Extraída de app/api/cambio-iene/route.ts em 29/set/2026 pra
// ser reaproveitada por /api/cambio-selfservice, que recalcula o valor do
// pedido antes de gerar a cobrança Pix na Stone (nunca confia no valor
// enviado pelo navegador). Mesmo cache de 15 min da rota original, então
// a tela e a cobrança normalmente usam a mesma cotação.
export async function buscarCotacaoIene(
  cidade: CidadeCambioIeneSlug,
  direcao: DirecaoCambioIene,
): Promise<CambioIene> {
  // "aeroporto-guarulhos" não tem página própria no melhorcambio.com —
  // usa a cotação de São Paulo (ver app/lib/cambioIene.ts).
  const cidadeFonte = cidade === "aeroporto-guarulhos" ? "sao-paulo" : cidade;
  const url = `https://www.melhorcambio.com/cotacao/${direcao}/iene/${cidadeFonte}`;
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 900 },
    });
    if (!resp.ok) throw new Error(`melhorcambio.com respondeu ${resp.status}`);
    const cotacao = extrairCotacaoPapelMoeda(await resp.text());
    if (cotacao === null) throw new Error("Não encontrou a cotação de papel-moeda no HTML da página");
    return {
      cotacaoBRLPorJPY: cotacao,
      cidade,
      direcao,
      fonte: `melhorcambio.com — papel moeda (${direcao})`,
      fallback: false,
    };
  } catch (error) {
    console.error("Erro ao consultar cotação do iene no melhorcambio.com:", error);
    return {
      cotacaoBRLPorJPY: direcao === "venda" ? COTACAO_FALLBACK_BRL_POR_JPY_VENDA : COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
      cidade,
      direcao,
      fonte: "estimativa — melhorcambio.com indisponível ou fora do padrão esperado no momento",
      fallback: true,
    };
  }
}
