import { comMargemEImposto } from "./margemPadrao";
import { P } from "./parametrosPreco";

// Preço do Roteiro Personalizado — fonte única (Wilson, 03/nov/2026: "usar o
// mesmo valor para ambos, usar o maior valor"). Vale para o roteiro avulso
// (/produtos/roteiro-personalizado, /ajisairoteiros, /api/roteiro-selfservice)
// e para o roteiro dentro da Viagem Personalizada / Calculadora Reversa.
// Já com imposto + margem: R$ 1.500 × 1,495 = R$ 2.243 até 15 dias e
// R$ 120 × 1,495 = R$ 179 por dia extra. No pacote ainda entra o fator do
// perfil do viajante (precificacaoPerfil.ts); o avulso usa o equilibrado (×1).
export const ROTEIRO_BASE_DIAS = 15;
export const ROTEIRO_PRECO_BASE = comMargemEImposto(P("roteiro.baseCusto", 1500));
export const ROTEIRO_PRECO_DIA_EXTRA = comMargemEImposto(P("roteiro.diaExtraCusto", 120));
// Roteiro avulso (/ajisairoteiros, /produtos/roteiro-personalizado e
// /api/roteiro-selfservice): taxa de US$ 80 a cada 2 pessoas acima de 3.
export const ROTEIRO_PESSOAS_SEM_TAXA = 3;
export const ROTEIRO_TAXA_USD_A_CADA_2 = P("roteiro.taxaUSDCada2Pessoas", 80);

export function precoRoteiroBRL(dias: number): number {
  return ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
}
