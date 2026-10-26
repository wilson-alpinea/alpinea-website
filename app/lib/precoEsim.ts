// Motor de preço do eSIM (Simpremium) — módulo puro, usado pela rota
// /api/esim-planos (o que a página mostra) e por /api/esim-selfservice
// (que RECALCULA antes de cobrar na Stone). Wilson, 26/out/2026.
//
// Preço Ajisai = NET da Simpremium para a faixa de dias × imposto + margem
// padrão (comMargemEImposto, a mesma regra dos outros produtos), em dólar;
// em reais pela PTAX do dia.
import { comMargemEImposto } from "./margemPadrao";

export type FaixaPreco = { minDays: number; maxDays: number; priceUsd: number };

export const MAX_DIAS_ESIM = 90;
export const MAX_ESIMS_POR_PEDIDO = 10;

/** Dias de eSIM para um período, contando o dia da chegada e o da partida
 * ("AAAA-MM-DD"). 0 se inválido. */
export function diasEsim(chegada: string, partida: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(chegada) || !/^\d{4}-\d{2}-\d{2}$/.test(partida)) return 0;
  const ms = Date.parse(`${partida}T00:00:00Z`) - Date.parse(`${chegada}T00:00:00Z`);
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms / 86_400_000) + 1;
}

/** Faixa da tabela que cobre a viagem e quantos dias pedir à Simpremium
 * (a API só aceita dias que existam na tabela). Se não houver faixa exata,
 * usa a menor faixa maior que a viagem. */
export function faixaParaViagem(faixas: FaixaPreco[], diasViagem: number): { faixa: FaixaPreco; diasPedido: number } | null {
  if (!(diasViagem > 0)) return null;
  const ordenadas = [...faixas].sort((a, b) => a.minDays - b.minDays);
  const exata = ordenadas.find((f) => diasViagem >= f.minDays && diasViagem <= f.maxDays);
  if (exata) return { faixa: exata, diasPedido: diasViagem };
  const maior = ordenadas.find((f) => f.minDays > diasViagem);
  return maior ? { faixa: maior, diasPedido: maior.minDays } : null;
}

export function precoAjisaiUSD(netUsd: number): number {
  return comMargemEImposto(netUsd);
}

export function emReais(usd: number, cotacao: number): number {
  return Math.round(usd * cotacao * 100) / 100;
}
