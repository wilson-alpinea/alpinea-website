// Cálculos da "Análise da vaga" (app/components/empregos/AnaliseVaga.tsx).
// Wilson, 08/out/2026: "precisamos melhorar essa parte de analytics, está
// básico demais". Tudo sai do próprio catálogo (VAGAS) — nenhum número
// inventado. Se um texto de salário não puder ser lido, a vaga só fica fora
// da comparação; nunca entra com valor errado.

import { VAGAS, type SetorKey, type Vaga } from "./vagasCatalogo";

// Valor-base em ¥/hora a partir do texto livre de `salario`. Ignora o que
// está entre parênteses (extra, noturno, reajustes), o que vem depois de
// "até" e o que vem depois de ";" (alternativa secundária, ex.: "diurno
// fixo" em Echizen). Faixa "¥1.250–1.530" → ponto médio; dois valores
// (ex.: Kitz, mulheres/homens) → média.
export function salarioBaseHora(salario: string): number | null {
  const principal = salario.replace(/\([^)]*\)/g, "").split(";")[0];
  const regex = /¥([\d.]+)(?:\s*[–-]\s*¥?([\d.]+))?\s*\/\s*hora/gi;
  const valores: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(principal))) {
    const antes = principal.slice(Math.max(0, m.index - 15), m.index).toLowerCase();
    if (antes.includes("até") || antes.includes("ate ")) continue;
    const a = parseFloat(m[1].replace(/\./g, ""));
    const b = m[2] ? parseFloat(m[2].replace(/\./g, "")) : null;
    valores.push(b !== null ? (a + b) / 2 : a);
  }
  if (valores.length === 0) return null;
  return valores.reduce((s, v) => s + v, 0) / valores.length;
}

export type PontoSalario = { id: string; codigo: string; empresa: string; cidade: string; regiao: string; setor: SetorKey; base: number };

export const PONTOS_SALARIO: PontoSalario[] = VAGAS.flatMap((v) => {
  const base = salarioBaseHora(v.salario);
  return base === null ? [] : [{ id: v.id, codigo: v.codigo, empresa: v.empresa, cidade: v.cidade, regiao: v.regiao, setor: v.setor, base }];
});

export function mediana(valores: number[]): number {
  const o = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(o.length / 2);
  return o.length % 2 ? o[meio] : (o[meio - 1] + o[meio]) / 2;
}

// Itens que uma ficha completa deve informar. A nota de transparência é
// quantos deles a vaga traz.
export function itensFicha(vaga: Vaga): { rotulo: string; ok: boolean }[] {
  const ut = vaga.fonteContrato === "ut-suriemu";
  return [
    { rotulo: "Salário por hora", ok: salarioBaseHora(vaga.salario) !== null },
    { rotulo: "Turno e escala", ok: /\d\s*x\s*\d|turno/i.test(vaga.turno) },
    { rotulo: "Moradia e aluguel", ok: Boolean(vaga.info.moradia) || ut },
    { rotulo: "Benefícios", ok: vaga.info.beneficios.length > 0 },
    { rotulo: "Kit de boas-vindas", ok: Boolean(vaga.info.kitBoasVindas) },
    { rotulo: "Diferenciais da hospedagem", ok: vaga.info.diferenciaisHospedagem.length > 0 },
    { rotulo: "Condução ao trabalho", ok: Boolean(vaga.conducao) || vaga.info.beneficios.some((b) => /ônibus|fretad|transporte|bicicleta|van/i.test(b)) },
    { rotulo: "Sobre a cidade", ok: Boolean(vaga.info.sobreCidade) },
    { rotulo: "Requisitos (perfil e japonês)", ok: Boolean(vaga.perfil || vaga.idioma) },
    { rotulo: "Seguro social e exame médico", ok: ut || vaga.info.beneficios.some((b) => /seguro|shakai/i.test(b)) },
  ];
}

export function notaFicha(vaga: Vaga): number {
  return itensFicha(vaga).filter((i) => i.ok).length;
}

export const MEDIA_NOTA_FICHA = VAGAS.reduce((s, v) => s + notaFicha(v), 0) / VAGAS.length;

export type AnaliseCalculada = {
  base: number | null;
  setorNome: SetorKey;
  setorQtd: number;
  setorMediana: number | null;
  difSetorPct: number | null;
  catalogoQtd: number;
  // Quantas vagas do catálogo pagam menos que esta (0 a catalogoQtd-1).
  acimaDe: number;
  brutoMensalJPY: number | null;
  nota: number;
  similares: (PontoSalario & { dif: number })[];
};

// Bruto mensal de referência: 160 h normais (8 h × 20 dias), sem horas
// extras, adicional noturno nem bônus — o piso do mês, não promessa.
export const HORAS_MES_REFERENCIA = 160;

export function analisarVaga(vaga: Vaga): AnaliseCalculada {
  const base = salarioBaseHora(vaga.salario);
  const doSetor = PONTOS_SALARIO.filter((p) => p.setor === vaga.setor && p.id !== vaga.id);
  const setorMediana = doSetor.length >= 3 ? mediana(doSetor.map((p) => p.base)) : null;
  const outros = PONTOS_SALARIO.filter((p) => p.id !== vaga.id);
  return {
    base,
    setorNome: vaga.setor,
    setorQtd: doSetor.length,
    setorMediana,
    difSetorPct: base !== null && setorMediana ? Math.round(((base - setorMediana) / setorMediana) * 100) : null,
    catalogoQtd: outros.length + (base !== null ? 1 : 0),
    acimaDe: base === null ? 0 : outros.filter((p) => p.base < base).length,
    brutoMensalJPY: base !== null ? base * HORAS_MES_REFERENCIA : null,
    nota: notaFicha(vaga),
    similares:
      base === null
        ? []
        : doSetor
            .map((p) => ({ ...p, dif: p.base - base }))
            .sort((a, b) => Math.abs(a.dif) - Math.abs(b.dif) || b.base - a.base)
            .slice(0, 3),
  };
}
