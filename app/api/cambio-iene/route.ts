import { NextResponse } from "next/server";
import {
  CidadeCambioIeneSlug,
  cidadeCambioIeneValida,
  COTACAO_FALLBACK_BRL_POR_JPY,
  extrairCotacaoPapelMoeda,
} from "../../lib/cambioIene";

export const runtime = "nodejs";

// Cotação por cidade muda pouco ao longo do dia — revalida a cada 15 min
// pra não bater no melhorcambio.com a cada troca de cidade/valor na tela
// (mesmo critério usado em /api/cambio pro dólar).
export const revalidate = 900;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cidadeParam = searchParams.get("cidade");
  const cidade: CidadeCambioIeneSlug = cidadeCambioIeneValida(cidadeParam) ? cidadeParam : "sao-paulo";

  const url = `https://www.melhorcambio.com/cotacao/compra/iene/${cidade}`;

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
      fonte: "melhorcambio.com — papel moeda",
      fallback: false,
    });
  } catch (error) {
    console.error("Erro ao consultar cotação do iene no melhorcambio.com:", error);

    return NextResponse.json({
      cotacaoBRLPorJPY: COTACAO_FALLBACK_BRL_POR_JPY,
      cidade,
      fonte: "estimativa — melhorcambio.com indisponível ou fora do padrão esperado no momento",
      fallback: true,
    });
  }
}
