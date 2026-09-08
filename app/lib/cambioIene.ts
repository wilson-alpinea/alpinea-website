// Tipos/constantes puras do câmbio de iene por cidade — sem "use client"
// nem imports de next/server, pra poder ser usado tanto pelo hook
// (client) quanto pela rota da API (server) sem misturar os dois mundos.
// Ver app/api/cambio-iene/route.ts (busca a cotação) e
// app/hooks/useCambioIene.ts (usa no cliente).

// Cidades cobertas — confirmadas como páginas existentes no
// melhorcambio.com em 08/set/2026 (melhorcambio.com/cotacao/compra/iene/
// <slug>). Adicionar uma cidade nova aqui exige confirmar antes que a
// página realmente existe lá.
export const CIDADES_CAMBIO_IENE = [
  { slug: "sao-paulo", nome: "São Paulo" },
  { slug: "rio-de-janeiro", nome: "Rio de Janeiro" },
  { slug: "belo-horizonte", nome: "Belo Horizonte" },
  { slug: "brasilia", nome: "Brasília" },
  { slug: "curitiba", nome: "Curitiba" },
] as const;

export type CidadeCambioIeneSlug = (typeof CIDADES_CAMBIO_IENE)[number]["slug"];

export type CambioIene = {
  cotacaoBRLPorJPY: number;
  cidade: CidadeCambioIeneSlug;
  fonte: string;
  fallback: boolean;
};

export function cidadeCambioIeneValida(valor: string | null): valor is CidadeCambioIeneSlug {
  return CIDADES_CAMBIO_IENE.some((c) => c.slug === valor);
}

// Usado só se a raspagem falhar (site fora do ar, layout mudou e o regex
// não encontra mais o valor, etc.) — a tela nunca quebra, mas o valor
// SEMPRE vem marcado como "fallback" pra nunca ser confundido com
// cotação real. Baseado na cotação de papel-moeda em São Paulo observada
// em 08/set/2026 (~R$ 0,037/JPY) — revisar periodicamente.
export const COTACAO_FALLBACK_BRL_POR_JPY = 0.037;

// Extrai o valor de "papel moeda" (dinheiro físico) do HTML da página do
// melhorcambio.com — não há API pública nem JSON estruturado lá, então
// isso depende do formato de texto da página continuar parecido com
// "R$ 0,0368 ... Papel Moeda". Se o valor mostrado na página for
// renderizado só no navegador (client-side, via JavaScript), esse fetch
// (que não executa JavaScript) não vai encontrar nada — é exatamente
// esse caso que o fallback em route.ts cobre.
export function extrairCotacaoPapelMoeda(html: string): number | null {
  const normalizado = html.replace(/&nbsp;/g, " ");

  // Estratégia 1: número logo antes do rótulo "Papel Moeda" (ordem
  // observada na página em 08/set/2026).
  const combinada = normalizado.match(/R\$\s*([\d]+,[\d]+)[^R$]{0,80}?Papel\s*Moeda/i);
  if (combinada) {
    const valor = Number(combinada[1].replace(",", "."));
    if (Number.isFinite(valor) && valor > 0 && valor < 1) return valor;
  }

  // Estratégia 2 (fallback mais solto): primeiro "R$ 0,0XXX" — a
  // cotação de iene em reais é sempre um valor pequeno (< R$ 1 por
  // iene), o que distingue esse número de outros valores em reais na
  // página.
  const solta = normalizado.match(/R\$\s*(0,0[\d]{2,4})\b/);
  if (solta) {
    const valor = Number(solta[1].replace(",", "."));
    if (Number.isFinite(valor) && valor > 0 && valor < 1) return valor;
  }

  return null;
}
