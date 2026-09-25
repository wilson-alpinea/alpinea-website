import { NextResponse } from "next/server";
import {
  CidadeCambioIeneSlug,
  cidadeCambioIeneValida,
  COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
  COTACAO_FALLBACK_BRL_POR_JPY_VENDA,
  type DirecaoCambioIene,
  extrairCotacaoPapelMoeda,
} from "../../lib/cambioIene";

export const runtime = "nodejs";

// Cotação por cidade muda pouco ao longo do dia — revalida a cada 15 min
// pra não bater no melhorcambio.com a cada troca de cidade/valor na tela
// (mesmo critério usado em /api/cambio pro dólar).
export const revalidate = 900;

// Direção (compra/venda) — pedido do Wilson, 25/set/2026: "deixar
// disponivel tanto compra quanto venda de iene" na página pública de
// Câmbio. Cada direção é uma página separada no melhorcambio.com
// (/cotacao/compra/iene/<cidade> e /cotacao/venda/iene/<cidade>), com
// valor diferente — confirmado via WebFetch em 25/set/2026.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cidadeParam = searchParams.get("cidade");
  const cidade: CidadeCambioIeneSlug = cidadeCambioIeneValida(cidadeParam) ? cidadeParam : "sao-paulo";
  const direcaoParam = searchParams.get("direcao");
  const direcao: DirecaoCambioIene = direcaoParam === "venda" ? "venda" : "compra";

  const url = `https://www.melhorcambio.com/cotacao/${direcao}/iene/${cidade}`;

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

    const html = await resp.text();
    const cotacao = extrairCotacaoPapelMoeda(html);

    if (cotacao === null) {
      throw new Error("Não encontrou a cotação de papel-moeda no HTML da página");
    }

    return NextResponse.json({
      cotacaoBRLPorJPY: cotacao,
      cidade,
      direcao,
      fonte: `melhorcambio.com — papel moeda (${direcao})`,
      fallback: false,
    });
  } catch (error) {
    console.error("Erro ao consultar cotação do iene no melhorcambio.com:", error);

    return NextResponse.json({
      cotacaoBRLPorJPY: direcao === "venda" ? COTACAO_FALLBACK_BRL_POR_JPY_VENDA : COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
      cidade,
      direcao,
      fonte: "estimativa — melhorcambio.com indisponível ou fora do padrão esperado no momento",
      fallback: true,
    });
  }
}
