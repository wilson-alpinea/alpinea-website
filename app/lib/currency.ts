// Funções puras de formatação de moeda — sem "use client" de propósito, pra
// poderem ser chamadas tanto de componentes cliente quanto de código que
// roda no servidor (ex.: app/pacotes/page.tsx, que monta os preços dos
// pacotes Sakura em tempo de build/render no servidor). O hook
// useCambioUSD (que precisa de useState/useEffect, esse sim client-only)
// re-exporta tudo daqui em ../hooks/useCambioUSD pra não quebrar imports
// existentes.

export type Cambio = {
  cotacao: number;
  data: string | null;
  fonte: string;
  fallback: boolean;
};

export const COTACAO_FALLBACK: Cambio = {
  cotacao: 5.3,
  data: null,
  fonte: "estimativa — cotação indisponível",
  fallback: true,
};

// "US$ X.XXX" (convenção brasileira) em vez do "$X,XXX" padrão do
// Intl/en-US — evita ambiguidade com outros símbolos de dólar e casa com o
// "R$" usado no resto do site.
export function formatUSD(valor: number): string {
  return `US$ ${Math.round(valor).toLocaleString("en-US")}`;
}

// Converte um valor em reais pra dólar usando a cotação carregada — "…"
// enquanto a cotação ainda não chegou (evita mostrar um valor errado por
// um instante).
export function brlParaUSDLabel(valorBRL: number, cambio: Cambio | null): string {
  if (!cambio) return "…";
  return formatUSD(valorBRL / cambio.cotacao);
}

// "R$ X.XXX" no formato brasileiro — usado ao lado do preço em dólar, já
// que o valor de referência interno de todo preço é sempre em reais.
export function formatBRL(valor: number): string {
  return `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
}
