// PTAX do iene (reais por ¥1, venda, boletim de fechamento) no servidor —
// usada na tela do COE (/api/cambio-iene-ptax) e para recalcular o valor em
// reais de cada parcela antes de abrir a Stone (Wilson, 29/out/2026: "pode
// usar PTAX para o câmbio em real").

// Só se o Banco Central falhar — sempre marcado como fallback.
export const PTAX_IENE_FALLBACK = 0.034;

function paraMMDDYYYY(data: Date) {
  return `${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}-${data.getFullYear()}`;
}

export async function buscarPtaxIene(): Promise<{ brlPorJPY: number; data: string | null; fonte: string; fallback: boolean }> {
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
    const cotacao = (await resp.json())?.value?.[0];
    if (!cotacao || typeof cotacao.cotacaoVenda !== "number") throw new Error("Resposta da BCB sem cotação válida");
    return { brlPorJPY: cotacao.cotacaoVenda, data: new Date(cotacao.dataHoraCotacao).toLocaleDateString("pt-BR"), fonte: "PTAX — Banco Central do Brasil", fallback: false };
  } catch (error) {
    console.error("Erro ao consultar PTAX do iene:", error);
    return { brlPorJPY: PTAX_IENE_FALLBACK, data: null, fonte: "estimativa — PTAX indisponível no momento", fallback: true };
  }
}
