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

// Fallback do euro — mesma lógica do COTACAO_FALLBACK acima, só usado se
// /api/cambio-eur (PTAX Banco Central) falhar. Estimativa de 25/set/2026,
// revisar periodicamente.
export const COTACAO_FALLBACK_EUR: Cambio = {
  cotacao: 6.1,
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

// Moeda de exibição escolhida pelo vendedor — pedido do Wilson, 14/set/2026:
// "criar botões para transformar tudo em BRL, USD ou IENE". O valor de
// referência interno de todo preço continua sempre em reais (BRL); isso
// aqui só controla em que moeda ele é mostrado (tela, PDF, Word,
// WhatsApp).
export type MoedaExibicao = "BRL" | "USD" | "JPY";

// "¥ X.XXX" — sem casas decimais (o iene não tem subunidade de uso
// corrente), com separador de milhar no padrão japonês.
export function formatJPY(valor: number): string {
  return `¥ ${Math.round(valor).toLocaleString("ja-JP")}`;
}

// "€ X.XXX" — separador de milhar no padrão europeu (de-DE), pra página de
// Câmbio pública (Wilson, 25/set/2026: "deixar pelo menos 3 moedas
// disponiveis para transação Real, Euro e Dolar").
export function formatEUR(valor: number): string {
  return `€ ${Math.round(valor).toLocaleString("de-DE")}`;
}

// Converte um valor cujo valor de referência interno é sempre em reais
// (BRL) pra moeda de exibição escolhida. cambioCotacao = reais por dólar
// (useCambioUSD, PTAX do Banco Central); brlPorJPY = reais por iene
// (useCambioIene — mesma cotação já usada na seção "Câmbio no Brasil" da
// calculadora, reaproveitada aqui só como referência de conversão).
export function formatValor(
  valorBRL: number,
  moeda: MoedaExibicao,
  cambioCotacao: number,
  brlPorJPY: number,
): string {
  if (moeda === "USD") return formatUSD(valorBRL / cambioCotacao);
  if (moeda === "JPY") return formatJPY(valorBRL / brlPorJPY);
  return formatBRL(valorBRL);
}
