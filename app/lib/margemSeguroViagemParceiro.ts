// Margem do Seguro Viagem do parceiro (Real Seguro Viagem) — Wilson,
// 26/out/2026: "margem fixa de 50% até 60 anos e depois de 60 anos
// aumentar gradativamente até 80 anos de acordo com preços praticados no
// mercado". Módulo puro (página + servidor).
//
// Como ficou:
// - até 60 anos: 50% sobre o custo da agência;
// - de 61 a 80 anos: sobe em linha reta até MARGEM_80_ANOS;
// - acima de 80 anos: não vende online (fale com a equipe);
// - "de acordo com preços praticados no mercado": a margem de um plano
//   nunca deixa o preço passar do preço de balcão do próprio plano
//   (preco_em_reais, a tabela pública do fornecedor).
// O fornecedor recebe UMA margem por pedido: a média das margens dos
// viajantes (cada um pela sua idade).
// ⚠️ MARGEM_80_ANOS é um ponto de partida — ajustar com o Wilson.

export const MARGEM_ATE_60_ANOS = 50;
export const MARGEM_80_ANOS = 100;
export const IDADE_MAXIMA_ONLINE = 80;

export function margemPorIdade(idade: number): number {
  if (idade <= 60) return MARGEM_ATE_60_ANOS;
  const t = Math.min(1, (idade - 60) / (IDADE_MAXIMA_ONLINE - 60));
  return Math.round((MARGEM_ATE_60_ANOS + (MARGEM_80_ANOS - MARGEM_ATE_60_ANOS) * t) * 10) / 10;
}

export function margemDoGrupo(idades: number[]): number {
  if (idades.length === 0) return MARGEM_ATE_60_ANOS;
  const soma = idades.reduce((s, i) => s + margemPorIdade(i), 0);
  return Math.round((soma / idades.length) * 10) / 10;
}

/** Margem final do plano: a do grupo, limitada para o preço não passar do
 * balcão do fornecedor e, se configurado, ao teto da agência. */
export function margemDoPlano(params: { idades: number[]; custo: number; balcao: number; teto?: number | null }): number {
  let m = margemDoGrupo(params.idades);
  if (params.custo > 0 && params.balcao > params.custo) {
    m = Math.min(m, Math.floor(((params.balcao / params.custo - 1) * 100) * 10) / 10);
  }
  if (params.teto != null && params.teto >= 0) m = Math.min(m, params.teto);
  return Math.max(0, m);
}

export const comMargem = (custo: number, margem: number) => Math.round(custo * (1 + margem / 100) * 100) / 100;

/** Idade completa na data de início da viagem ("AAAA-MM-DD"). */
export function idadeNaData(nascimento: string, data: string): number | null {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nascimento);
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!n || !d) return null;
  let idade = Number(d[1]) - Number(n[1]);
  if (Number(d[2]) < Number(n[2]) || (Number(d[2]) === Number(n[2]) && Number(d[3]) < Number(n[3]))) idade -= 1;
  return idade >= 0 && idade < 120 ? idade : null;
}

// ── Formato público dos níveis (o que a página recebe — sem custo) ──
export type NivelSeguro = "essencial" | "recomendado" | "premium";
export type DestaqueCobertura = { rotulo: string; valor: string };
export type PlanoNivel = {
  nivel: NivelSeguro;
  token: string; // assinado pelo servidor; volta no checkout
  nome: string;
  seguradora: string;
  assistencia: string | null;
  logo: string | null;
  contrato: string | null;
  coberturaMedica: string;
  destaques: DestaqueCobertura[];
  precoPix: number;
  precoCartao: number;
  parcelasMax: number | null;
};

export const NIVEIS: { id: NivelSeguro; titulo: string; descricao: string; minUsd: number; maxUsd: number }[] = [
  { id: "essencial", titulo: "Essencial", descricao: "Cobertura médica a partir de US$ 60 mil", minUsd: 60_000, maxUsd: 99_999 },
  { id: "recomendado", titulo: "Recomendado", descricao: "Cobertura médica de US$ 100 a 249 mil", minUsd: 100_000, maxUsd: 249_999 },
  { id: "premium", titulo: "Premium", descricao: "Cobertura médica de US$ 250 mil ou mais", minUsd: 250_000, maxUsd: Number.POSITIVE_INFINITY },
];
