import { comMargemEImposto } from "./margemPadrao";
import type { CidadeCambioIeneSlug, DirecaoCambioIene } from "./cambioIene";

// Motor de preço do Câmbio de ienes da página pública — módulo "puro"
// (sem React, sem "use client"), usado pela página /produtos/cambio e
// pela rota /api/cambio-selfservice, que RECALCULA o valor no servidor
// antes de criar a cobrança Pix na Stone/Pagar.me (pedido do Wilson,
// 29/set/2026: câmbio com o mesmo tratamento do JR Pass/Seguro Viagem,
// "cambio só tem PIX"). As constantes abaixo continuam re-exportadas por
// CustomPackageCard.tsx / calculadoraCatalogoPublico.ts com os mesmos
// nomes e valores — nada muda pra Calculadora Reversa nem pro
// /viagem_personalizada_selfservice.

// Taxa de serviço do câmbio (logística de entrega/recolhimento em
// espécie) — custo R$ 150 com imposto+margem padrão.
export const PRECO_CAMBIO_BRASIL = comMargemEImposto(150);
// Entrega no Aeroporto de Guarulhos — pedido do Wilson, 25/set/2026:
// "custo de entrega para entrega no aeroporto de guarulhos de R$ 190.00
// caso cliente opte por isso". Valor final já em reais.
export const CUSTO_ENTREGA_AEROPORTO_CAMBIO = 190;

// Margem pública (exclusiva da página pública, nunca exibida) — pedido do
// Wilson, 25/set/2026. Compra: cotação de rua × 1,20. Venda: × 0,80.
export const SPREAD_CAMBIO_IENE_PUBLICO_COMPRA = 1.2;
export const SPREAD_CAMBIO_IENE_PUBLICO_VENDA = 0.8;

// Piso mínimo (Wilson, 08/set/2026) — mesmo da Calculadora Reversa.
export const CAMBIO_IENES_MINIMO = 100000;
export const CAMBIO_IENES_MINIMO_PUBLICO = CAMBIO_IENES_MINIMO;
// Entrega/retirada no aeroporto: mínimo maior (Wilson, 06/out/2026: "valor
// mínimo de aeroporto sobe para 300,000 ienes").
export const CAMBIO_IENES_MINIMO_AEROPORTO = 300000;
export function minimoIenesPorCidade(cidade: string): number {
  return cidade === "aeroporto-guarulhos" ? CAMBIO_IENES_MINIMO_AEROPORTO : CAMBIO_IENES_MINIMO_PUBLICO;
}
// Prazo de entrega dos ienes (Wilson, 06/out/2026): 3 dias úteis após a
// confirmação do pagamento.
export const PRAZO_ENTREGA_CAMBIO_DIAS_UTEIS = 3;

export type PrecoCambioIene = {
  cotacaoFinalBRLporJPY: number;
  valorIenesBRL: number;
  taxaServicoBRL: number;
  taxaAeroportoBRL: number;
  totalBRL: number;
};

/** Valor em reais do pedido de câmbio.
 * - Compra (cliente paga à Ajisai, via Pix Stone): valor dos ienes com a
 *   margem pública + taxa de serviço + taxa de aeroporto, se for o caso.
 * - Venda (Ajisai compra os ienes do cliente — fluxo MANUAL, Wilson,
 *   29/set/2026: "no caso de nós comprarmos o iene do cliente é fluxo
 *   manual"): valor que o cliente RECEBE = ienes com a margem pública
 *   MENOS as taxas. Até 29/set/2026 a página somava as taxas também na
 *   venda, o que aumentava o valor a pagar ao cliente — corrigido aqui. */
export function calcularPrecoCambioIene(params: {
  cotacaoRuaBRLporJPY: number;
  direcao: DirecaoCambioIene;
  cidade: CidadeCambioIeneSlug;
  quantidadeIenes: number;
}): PrecoCambioIene {
  const spread =
    params.direcao === "compra" ? SPREAD_CAMBIO_IENE_PUBLICO_COMPRA : SPREAD_CAMBIO_IENE_PUBLICO_VENDA;
  const cotacaoFinalBRLporJPY = params.cotacaoRuaBRLporJPY * spread;
  const valorIenesBRL = params.quantidadeIenes * cotacaoFinalBRLporJPY;
  const taxaAeroportoBRL = params.cidade === "aeroporto-guarulhos" ? CUSTO_ENTREGA_AEROPORTO_CAMBIO : 0;
  const taxas = PRECO_CAMBIO_BRASIL + taxaAeroportoBRL;
  const bruto = params.direcao === "compra" ? valorIenesBRL + taxas : Math.max(0, valorIenesBRL - taxas);
  const totalBRL = Math.round(bruto * 100) / 100;
  return {
    cotacaoFinalBRLporJPY,
    valorIenesBRL,
    taxaServicoBRL: PRECO_CAMBIO_BRASIL,
    taxaAeroportoBRL,
    totalBRL,
  };
}
