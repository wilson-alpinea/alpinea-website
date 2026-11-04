// Parâmetros de preço editáveis pelo CRM (/crm/precos) — Wilson, 04/nov/2026:
// "dentro do CRM, deixar uma parte com todos os preços e margens aplicadas
// em todos os cálculos do site alpinea.io, acessível somente aos ADMIN
// [...] ao mudar, todo site muda o cálculo".
//
// Como funciona (opção "republicar automático", escolhida pelo Wilson):
// - Cada número de preço/margem do site passa por P(id, padrão). O padrão
//   continua aqui no código, ao lado de onde é usado.
// - O CRM grava só o que foi alterado na tabela precos_parametros (migração
//   035) e dispara o Deploy Hook do Vercel.
// - No build, scripts/gerar-parametros-preco.mjs lê a tabela e gera
//   parametrosPreco.valores.ts (fora do git). Todo o site — páginas,
//   calculadoras, Calculadora Reversa e as rotas que recalculam antes de
//   cobrar na Stone — usa os mesmos valores daquele build.
// Módulo puro (sem "use client"): roda no navegador e no servidor.
import { VALORES_PARAMETROS_PRECO } from "./parametrosPreco.valores";

const PADROES = new Map<string, number>();

/** Valor do parâmetro `id` (o alterado no CRM, ou `padrao`). */
export function P(id: string, padrao: number): number {
  const anterior = PADROES.get(id);
  if (anterior === undefined) PADROES.set(id, padrao);
  else if (anterior !== padrao && process.env.NODE_ENV !== "production")
    console.warn(`[preços] Parâmetro "${id}" usado com padrões diferentes (${anterior} e ${padrao}).`);
  const v = (VALORES_PARAMETROS_PRECO as Record<string, unknown>)[id];
  return typeof v === "number" && Number.isFinite(v) ? v : padrao;
}

/** Todos os parâmetros já lidos por P() neste processo, com o padrão do código. */
export function padroesRegistrados(): Map<string, number> {
  return PADROES;
}

/** Valores que estão no ar (os do build atual). */
export function valoresNoAr(): Record<string, number> {
  return { ...(VALORES_PARAMETROS_PRECO as Record<string, number>) };
}

/** Aplica P() a cada valor de uma tabela: { chave: padrão } → { chave: valor }. */
export function tabelaP<K extends string>(prefixo: string, padroes: Record<K, number>): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const k of Object.keys(padroes) as K[]) out[k] = P(`${prefixo}.${k}`, padroes[k]);
  return out;
}
