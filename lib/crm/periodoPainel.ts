// Período da seção "Resultados do período" das Visões gerais de Seguro e
// Documentação (Wilson, 29/out/2026) — mesma regra da Visão geral da Agência.
import { hojeCRM } from "./financeiro";

export const addDias = (iso: string, n: number) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
};

export type BuscaPeriodo = { periodo?: string; de?: string; ate?: string };
const valida = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const curta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

export function resolverPeriodo(params: BuscaPeriodo, hoje = hojeCRM()) {
  let periodo = params.periodo ?? "30";
  let de: string;
  let ate = hoje;
  if (periodo === "custom" && valida(params.de) && valida(params.ate) && params.de! <= params.ate!) {
    de = params.de!;
    ate = params.ate!;
  } else {
    if (!["7", "30", "90"].includes(periodo)) periodo = "30";
    de = addDias(hoje, -(Number(periodo) - 1));
  }
  const rotulo = periodo === "custom" ? `${curta(de)} a ${curta(ate)}` : `Últimos ${periodo} dias`;
  return { periodo, de, ate, rotulo, hoje };
}

/** Todos os dias de `de` a `ate` (AAAA-MM-DD), no máximo 400. */
export function diasDoIntervalo(de: string, ate: string): string[] {
  const r: string[] = [];
  for (let d = de; d <= ate && r.length < 400; d = addDias(d, 1)) r.push(d);
  return r;
}

/** Dia (AAAA-MM-DD) de um timestamp no fuso do CRM. */
export const diaDe = (iso: string | null | undefined) => (iso ? hojeCRM(new Date(iso)) : null);

export const dentro = (dia: string | null, de: string, ate: string) => !!dia && dia >= de && dia <= ate;

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
/** Valor em reais (não em centavos). */
export const reais = (v: number) => BRL.format(v).replace(/ /g, " ");
export const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : null);
