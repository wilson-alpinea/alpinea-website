import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 900;

// PTAX do iene (reais por ¥1, venda, boletim de fechamento) — usado no
// checkout em reais do Certificado de Elegibilidade (parceiro, 29/out/2026:
// "pode usar PTAX para o câmbio em real"). Mesma API do Banco Central de
// /api/cambio (dólar), trocando para CotacaoMoedaPeriodo com moeda JPY.

// Só se o Banco Central falhar — sempre marcado como fallback, nunca
// apresentado como cotação oficial. Referência: proposta do parceiro
// (¥149.000 = R$ 5.016,27 → ~0,0337).
const COTACAO_FALLBACK = 0.034;

function paraMMDDYYYY(data: Date) {
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${data.getFullYear()}`;
}

export async function GET() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 10);

  const url =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
    "CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
    `?@moeda='JPY'&@dataInicial='${paraMMDDYYYY(inicio)}'&@dataFinalCotacao='${paraMMDDYYYY(hoje)}'` +
    "&$top=1&$orderby=dataHoraCotacao%20desc&$filter=tipoBoletim%20eq%20'Fechamento'&$format=json";

  try {
    const resp = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 900 } });
    if (!resp.ok) throw new Error(`BCB respondeu ${resp.status}`);
    const json = await resp.json();
    const cotacao = json?.value?.[0];
    if (!cotacao || typeof cotacao.cotacaoVenda !== "number") throw new Error("Resposta da BCB sem cotação válida");
    return NextResponse.json({
      brlPorJPY: cotacao.cotacaoVenda,
      data: new Date(cotacao.dataHoraCotacao).toLocaleDateString("pt-BR"),
      fonte: "PTAX — Banco Central do Brasil",
      fallback: false,
    });
  } catch (error) {
    console.error("Erro ao consultar PTAX do iene:", error);
    return NextResponse.json({
      brlPorJPY: COTACAO_FALLBACK,
      data: null,
      fonte: "estimativa — PTAX indisponível no momento",
      fallback: true,
    });
  }
}
