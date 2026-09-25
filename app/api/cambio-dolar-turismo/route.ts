import { NextResponse } from "next/server";
import { COTACAO_FALLBACK_DOLAR_TURISMO, extrairCotacaoDolarTurismo } from "../../lib/cambioDolarTurismo";

export const runtime = "nodejs";

// Cotação muda pouco ao longo do dia — mesmo critério de revalidação já
// usado em /api/cambio (PTAX) e /api/cambio-iene (melhorcambio.com).
export const revalidate = 900;

// Pedido do Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar o
// valor de dólar turismo" — ver app/lib/cambioDolarTurismo.ts pro
// contexto completo. Sem parâmetro de cidade (diferente de
// /api/cambio-iene) — usa São Paulo como referência nacional, mesmo
// critério do PTAX.
export async function GET() {
  const url = "https://www.melhorcambio.com/cotacao/compra/dolar-turismo/sao-paulo";

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
    const cotacao = extrairCotacaoDolarTurismo(html);

    if (cotacao === null) {
      throw new Error("Não encontrou a cotação de papel-moeda no HTML da página");
    }

    const hoje = new Date().toLocaleDateString("pt-BR");

    return NextResponse.json({
      cotacao,
      data: hoje,
      fonte: "Dólar Turismo — melhorcambio.com",
      fallback: false,
    });
  } catch (error) {
    console.error("Erro ao consultar dólar turismo no melhorcambio.com:", error);

    return NextResponse.json({
      cotacao: COTACAO_FALLBACK_DOLAR_TURISMO,
      data: null,
      fonte: "estimativa — dólar turismo indisponível no momento",
      fallback: true,
    });
  }
}
