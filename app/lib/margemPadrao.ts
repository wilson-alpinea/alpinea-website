// Multiplicador padrão de preço (imposto + margem) — extraído de
// app/components/CustomPackageCard.tsx em 29/set/2026 pra poder ser
// usado também do lado do servidor (rotas de API) sem importar um
// componente "use client". CustomPackageCard continua exportando
// `comMargemEImposto` (re-export), então nada que já importava de lá
// muda.
//
// Todo preço do calculador do Personalizado precisa embutir imposto +
// margem de lucro (pedido do Wilson, 25/ago/2026) — margem calculada por
// cima do valor já com imposto: primeiro soma-se o imposto sobre o lucro
// (15% — referência Lucro Presumido pra agência de viagem: IRPJ+CSLL na
// base presumida de 32%, mais PIS/COFINS e ISS; ajuste aqui se sua
// contabilidade usar uma alíquota efetiva diferente), depois 30% de
// margem sobre esse valor. Fórmula: preço final = custo × 1,15 × 1,30.
export const IMPOSTO_SOBRE_LUCRO = 1.15;
export const MARGEM_SOBRE_IMPOSTO = 1.3;
export const MULTIPLICADOR_PRECO_FINAL = IMPOSTO_SOBRE_LUCRO * MARGEM_SOBRE_IMPOSTO; // 1,495

export function comMargemEImposto(custo: number) {
  return Math.round(custo * MULTIPLICADOR_PRECO_FINAL);
}
