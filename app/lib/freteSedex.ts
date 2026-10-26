// Frete SEDEX do voucher do JR Pass — pedido do Wilson, 06/out/2026:
// "adicionar SLA de entrega, prazo de postagem são 3 dias úteis, prazo de
// entrega varia da disponibilidade dos correios SEDEX, adicionar cálculo do
// custo de frete e SEDEX (adicionar valor do frete)". Confirmado via
// AskUserQuestion: tabela estimada por região (UF), a partir de São
// Paulo-SP, sem depender de contrato com os Correios.
//
// ⚠️ Valores ESTIMADOS de SEDEX balcão para envelope de até 300 g saindo da
// capital de SP (referência out/2026). Revisar quando os Correios
// reajustarem a tabela ou se o local de postagem mudar. Usado no navegador
// (página) e no servidor (/api/jrpass-selfservice recalcula pelo CEP/UF,
// nunca confia no valor vindo do cliente).

export const PRAZO_POSTAGEM_DIAS_UTEIS = 3;

// Prazo de entrega do SEDEX após a postagem — único para todo o Brasil:
// 1 a 10 dias úteis (Wilson, 26/out/2026). O máximo também entra na data
// mínima de embarque da página do JR Pass (postagem + entrega).
const PRAZO_ENTREGA_MIN = 1;
const PRAZO_ENTREGA_MAX = 10;

export type FaixaFrete = {
  id: string;
  nome: string;
  valorBRL: number;
  prazoMinDiasUteis: number;
  prazoMaxDiasUteis: number;
};

const FAIXAS: Record<string, FaixaFrete> = {
  spCapital: { id: "spCapital", nome: "São Paulo capital e Grande SP", valorBRL: 25, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  spInterior: { id: "spInterior", nome: "Interior de São Paulo", valorBRL: 32, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  sudeste: { id: "sudeste", nome: "RJ, MG, ES e PR", valorBRL: 42, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  sul: { id: "sul", nome: "SC e RS", valorBRL: 48, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  centroOeste: { id: "centroOeste", nome: "DF, GO e MS", valorBRL: 55, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  centroNorte: { id: "centroNorte", nome: "MT e TO", valorBRL: 62, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  nordeste: { id: "nordeste", nome: "Nordeste", valorBRL: 68, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
  norte: { id: "norte", nome: "Norte", valorBRL: 78, prazoMinDiasUteis: PRAZO_ENTREGA_MIN, prazoMaxDiasUteis: PRAZO_ENTREGA_MAX },
};

const UF_FAIXA: Record<string, keyof typeof FAIXAS> = {
  RJ: "sudeste", MG: "sudeste", ES: "sudeste", PR: "sudeste",
  SC: "sul", RS: "sul",
  DF: "centroOeste", GO: "centroOeste", MS: "centroOeste",
  MT: "centroNorte", TO: "centroNorte",
  BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste", PB: "nordeste", RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
  PA: "norte", AP: "norte", AM: "norte", RR: "norte", RO: "norte", AC: "norte",
};

/** Faixa de frete pelo CEP + UF. null enquanto não dá pra saber. */
export function faixaFreteSedex(cep: string, uf: string): FaixaFrete | null {
  const digitos = cep.replace(/\D/g, "");
  const ufNorm = uf.trim().toUpperCase();
  if (ufNorm === "SP") {
    if (digitos.length !== 8) return null;
    // CEPs 01000-000 a 09999-999 = capital e Grande São Paulo.
    return Number(digitos.slice(0, 2)) <= 9 ? FAIXAS.spCapital : FAIXAS.spInterior;
  }
  const chave = UF_FAIXA[ufNorm];
  return chave ? FAIXAS[chave] : null;
}

/** Soma dias úteis (seg–sex; não considera feriados) a uma data ISO. */
export function somarDiasUteis(isoInicio: string, dias: number): string {
  const d = new Date(`${isoInicio}T00:00:00`);
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) restantes -= 1;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "1 dia útil", "3 dias úteis" ou "1 a 2 dias úteis" — evita "1 a 1 dias
 * úteis" quando o prazo mínimo e o máximo são iguais (Wilson, 26/out/2026). */
export function textoPrazoSedex(faixa: { prazoMinDiasUteis: number; prazoMaxDiasUteis: number }): string {
  const { prazoMinDiasUteis: min, prazoMaxDiasUteis: max } = faixa;
  if (min === max) return max === 1 ? "1 dia útil" : `${max} dias úteis`;
  return `${min} a ${max} dias úteis`;
}
