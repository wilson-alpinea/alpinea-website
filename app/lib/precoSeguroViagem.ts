import { comMargemEImposto } from "./margemPadrao";
import { P } from "./parametrosPreco";

// Motor de preço do Seguro Viagem — módulo "puro" (sem React, sem "use
// client"), usado tanto pela página /produtos/seguro-viagem quanto pela
// rota /api/seguro-viagem-selfservice, que RECALCULA o valor no servidor
// antes de criar a cobrança na Stone/Pagar.me (nunca confia no valor
// enviado pelo navegador). Criado em 29/set/2026, quando o Seguro Viagem
// passou a ter pagamento self-service de verdade (pedido do Wilson:
// "aqui também será inserido o processo de pagamento self-service da
// Stone"). As constantes abaixo continuam sendo re-exportadas por
// CustomPackageCard.tsx / calculadoraCatalogoPublico.ts, então a
// Calculadora Reversa e o resto do site usam exatamente os mesmos números.

// Seguro Viagem: valor por pessoa/dia. Nativo em REAIS (ao contrário de
// guia/motorista/JR Pass/câmbio-aeroporto, que são nativos em dólar) —
// confirmado pelo Wilson, 25/set/2026: "o custo diario de seguro viagem
// até 64 anos é de cerca de 29 reais por dia" (custo puro, antes de
// imposto+margem). NÃO multiplicar por cotação de câmbio.
export const DIARIA_SEGURO_VIAGEM = comMargemEImposto(P("seguro.diariaCusto", 29));

// Seguro viagem por faixa etária (mesma tabela da Calculadora Reversa).
export const IDADE_LIMITE_SEGURO = 82;
export const FAIXAS_SEGURO_IDADE: { idadeMax: number; multiplicador: number }[] = [
  { idadeMax: 60, multiplicador: P("seguro.idade.ate60", 1) },
  { idadeMax: 65, multiplicador: P("seguro.idade.ate65", 2) },
  { idadeMax: 70, multiplicador: P("seguro.idade.ate70", 2.5) },
  { idadeMax: 75, multiplicador: P("seguro.idade.ate75", 3) },
  { idadeMax: 80, multiplicador: P("seguro.idade.ate80", 4) },
  { idadeMax: IDADE_LIMITE_SEGURO, multiplicador: P("seguro.idade.ate82", 5) },
];
export function multiplicadorSeguroPorIdade(idade: number): number | null {
  if (idade > IDADE_LIMITE_SEGURO) return null;
  return FAIXAS_SEGURO_IDADE.find((f) => idade <= f.idadeMax)?.multiplicador ?? null;
}

/** "até 60 anos, valor padrão; 61–65, 2x; …" — texto das faixas atuais. */
export function textoFaixasSeguroIdade(): string {
  const x = (m: number) => `${String(m).replace(".", ",")}x`;
  return FAIXAS_SEGURO_IDADE.map((f, i) => {
    if (i === 0) return `até ${f.idadeMax} anos, ${f.multiplicador === 1 ? "valor padrão" : x(f.multiplicador)}`;
    return `${FAIXAS_SEGURO_IDADE[i - 1].idadeMax + 1}–${f.idadeMax}, ${x(f.multiplicador)}`;
  }).join("; ");
}

/** Ajuste interno quando o roteiro inclui outro país além do destino
 * principal (deixa de ser "destino único" e passa a precisar de cobertura
 * mundial/multidestino). Pedido do Wilson, 25/set/2026 — ver comentário
 * completo em app/produtos/seguro-viagem/seguradoras.ts. */
export const MULTIPLICADOR_ROTEIRO_MULTIDESTINO = P("seguro.multidestino", 1.12);

/** Dias de cobertura entre duas datas "AAAA-MM-DD" (0 se inválido ou se o
 * fim não vier depois do início). */
export function diasEntreDatas(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;
  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T00:00:00`);
  const diffMs = dataFim.getTime() - dataInicio.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0;
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** Valor total do Seguro Viagem em reais — `null` quando não dá pra
 * calcular automaticamente (sem datas válidas, sem idades, ou algum
 * viajante acima de IDADE_LIMITE_SEGURO, que precisa de cotação direta
 * com a seguradora e por isso não pode ser cobrado no self-checkout). */
export function calcularValorSeguroViagemBRL(params: {
  dias: number;
  idades: number[];
  multidestino: boolean;
}): number | null {
  const { dias, idades, multidestino } = params;
  if (!(dias > 0) || idades.length === 0) return null;
  let somaMultiplicadores = 0;
  for (const idade of idades) {
    const m = multiplicadorSeguroPorIdade(idade);
    if (m === null) return null;
    somaMultiplicadores += m;
  }
  const multiplicadorDestino = multidestino ? MULTIPLICADOR_ROTEIRO_MULTIDESTINO : 1;
  return Math.round(DIARIA_SEGURO_VIAGEM * dias * somaMultiplicadores * multiplicadorDestino * 100) / 100;
}
