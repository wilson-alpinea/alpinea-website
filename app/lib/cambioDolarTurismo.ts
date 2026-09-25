// Tipos/constantes puras do dólar turismo — sem "use client" nem imports
// de next/server, pra poder ser usado tanto pelo hook (client) quanto
// pela rota da API (server) sem misturar os dois mundos. Mesmo padrão já
// usado pro câmbio de ienes (ver app/lib/cambioIene.ts).
//
// Pedido do Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar o
// valor de dólar turismo" (em vez do PTAX, usado no resto do site) +
// "adicionar spread cambial também" — confirmado via AskUserQuestion:
// 20%, mesmo spread já usado na página pública de Câmbio de ienes
// (SPREAD_CAMBIO_IENE_PUBLICO_COMPRA, em
// app/lib/calculadoraCatalogoPublico.ts — SPREAD_DOLAR_TURISMO_PUBLICO
// está lá também, perto do spread do iene). Só o JR Pass usa esse valor
// por enquanto — o resto do site (Hotéis, Transporte Privado, Seguro
// Viagem, Câmbio) continua no PTAX (useCambioUSD).
//
// Confirmado via WebFetch, 25/set/2026, que o melhorcambio.com tem
// página própria de dólar turismo (/cotacao/compra/dolar-turismo/
// <cidade>), no mesmo formato "Papel Moeda" já usado pro iene — cotação
// observada em São Paulo: R$ 5,54 (contra R$ 5,18 do PTAX no mesmo dia).
// Sem seletor de cidade aqui (diferente do câmbio de ienes) — o JR Pass
// não pede cidade de retirada, então usamos São Paulo como referência
// nacional, igual o PTAX faz.
export type CambioDolarTurismo = {
  cotacao: number;
  data: string | null;
  fonte: string;
  fallback: boolean;
};

// Usado só se a raspagem falhar (site fora do ar, layout mudou etc.) — a
// tela nunca quebra, mas o valor SEMPRE vem marcado como "fallback" pra
// nunca ser confundido com cotação real. Observado em São Paulo,
// 25/set/2026, via WebFetch em melhorcambio.com/cotacao/compra/
// dolar-turismo/sao-paulo.
export const COTACAO_FALLBACK_DOLAR_TURISMO = 5.54;

// Extrai o valor de "papel moeda" (dinheiro físico) do HTML da página do
// melhorcambio.com — mesma técnica de app/lib/cambioIene.ts
// (extrairCotacaoPapelMoeda), só que o dólar turismo fica numa faixa de
// valor bem diferente da do iene (~R$ 3 a R$ 15 por dólar, em vez de
// menos de R$ 1 por iene), então a validação de faixa muda.
export function extrairCotacaoDolarTurismo(html: string): number | null {
  const normalizado = html.replace(/&nbsp;/g, " ");

  // Estratégia 1: número logo antes do rótulo "Papel Moeda" (mesma ordem
  // observada na página do iene).
  const combinada = normalizado.match(/R\$\s*([\d]+,[\d]+)[^R$]{0,80}?Papel\s*Moeda/i);
  if (combinada) {
    const valor = Number(combinada[1].replace(",", "."));
    if (Number.isFinite(valor) && valor > 2 && valor < 15) return valor;
  }

  // Estratégia 2 (fallback mais solto): primeiro "R$ X,XX" dentro da
  // faixa plausível de dólar em reais.
  const solta = normalizado.match(/R\$\s*([\d]{1,2},[\d]{2,4})\b/);
  if (solta) {
    const valor = Number(solta[1].replace(",", "."));
    if (Number.isFinite(valor) && valor > 2 && valor < 15) return valor;
  }

  return null;
}
