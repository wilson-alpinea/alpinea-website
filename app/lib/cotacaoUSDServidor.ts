// Cotação PTAX do dólar (venda) para uso no servidor — mesma consulta de
// app/api/cambio/route.ts, extraída para as rotas que precisam converter
// um preço em dólar antes de cobrar em reais (eSIM, Wilson, 26/out/2026).
// Nunca lança: se o Banco Central falhar, devolve a cotação de fallback
// marcada como tal.
import { COTACAO_FALLBACK } from "./currency";

function paraMMDDYYYY(data: Date) {
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${data.getFullYear()}`;
}

export async function buscarCotacaoUSD(): Promise<{ cotacao: number; fallback: boolean }> {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 10);
  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(` +
    `dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
    `?@dataInicial='${paraMMDDYYYY(inicio)}'&@dataFinalCotacao='${paraMMDDYYYY(hoje)}'` +
    `&$top=1&$orderby=dataHoraCotacao desc&$format=json`;
  try {
    const resp = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 900 } });
    if (!resp.ok) throw new Error(`BCB respondeu ${resp.status}`);
    const json = await resp.json();
    const valor = json?.value?.[0]?.cotacaoVenda;
    if (typeof valor !== "number" || !(valor > 0)) throw new Error("sem cotação válida");
    return { cotacao: valor, fallback: false };
  } catch (erro) {
    console.error("Cotação PTAX indisponível (servidor):", erro);
    return { cotacao: COTACAO_FALLBACK.cotacao, fallback: true };
  }
}
