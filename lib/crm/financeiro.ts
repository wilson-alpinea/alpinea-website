// Financeiro da ficha do cliente (Wilson, 22/out/2026).
// Regras puras (sem banco) — valores sempre em CENTAVOS (inteiros) para não
// acumular erro de ponto flutuante. Ver migração 023.

export const FUSO_CRM = "America/Sao_Paulo";

export type Parcela = {
  id: string;
  descricao: string | null;
  servico: string | null;
  numero_parcela: number;
  total_parcelas: number;
  valor: number; // reais (numeric do banco)
  status: string; // pendente | pago | atrasado | cancelado
  data_vencimento: string | null; // AAAA-MM-DD
  observacoes: string | null;
  gateway: string | null;
  created_at: string;
};

export type Lancamento = {
  id: string;
  pagamento_id: string | null;
  tipo: "recebimento" | "estorno" | "reembolso";
  valor: number;
  data: string | null;
  forma_pagamento: string | null;
  comprovante_arquivo_id: string | null;
  observacoes: string | null;
  motivo: string | null;
  estorno_de: string | null;
  origem: "manual" | "gateway" | "legado";
  autor: string | null;
  created_at: string;
};

export type EventoFinanceiro = {
  id: string;
  acao: string;
  descricao: string;
  motivo: string | null;
  autor: string | null;
  created_at: string;
};

export type Situacao = "a_vencer" | "vence_hoje" | "vencida" | "parcial" | "recebida" | "cancelada" | "sem_vencimento";

export const SITUACAO_LABEL: Record<Situacao, string> = {
  a_vencer: "A vencer",
  vence_hoje: "Vence hoje",
  vencida: "Vencida",
  parcial: "Parcialmente recebida",
  recebida: "Recebida",
  cancelada: "Cancelada",
  sem_vencimento: "Sem vencimento",
};

// Cores de status (texto + fundo suave). Sempre acompanhadas do texto.
export const SITUACAO_COR: Record<Situacao, { texto: string; fundo: string }> = {
  a_vencer: { texto: "#24476B", fundo: "#EAF1F8" },
  vence_hoje: { texto: "#946200", fundo: "#FFF4DB" },
  vencida: { texto: "#B42318", fundo: "#FDECEA" },
  parcial: { texto: "#946200", fundo: "#FFF4DB" },
  recebida: { texto: "#28665D", fundo: "#E6F2EF" },
  cancelada: { texto: "#626B75", fundo: "#EEF0F2" },
  sem_vencimento: { texto: "#626B75", fundo: "#EEF0F2" },
};

export const centavos = (reais: number | string | null | undefined): number =>
  Math.round(Number(reais ?? 0) * 100);

export const reais = (c: number): number => c / 100;

const FORMATO_BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarBRL = (c: number): string => FORMATO_BRL.format(c / 100).replace(/ /g, " ");

/** "1.160,00" / "1160,5" / "1160.50" → centavos. null se inválido. */
export function lerValorBRL(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, "");
  if (!limpo) return null;
  let normal = limpo;
  if (limpo.includes(",")) normal = limpo.replace(/\./g, "").replace(",", ".");
  // Sem vírgula: "1.234.567" ou "1.160" (ponto de milhar) → inteiro.
  else if ((limpo.match(/\./g) ?? []).length > 1 || /^\d{1,3}\.\d{3}$/.test(limpo)) normal = limpo.replace(/\./g, "");
  if (!/^-?\d+(\.\d{0,2})?$/.test(normal)) return null;
  return Math.round(Number(normal) * 100);
}

/** Hoje (AAAA-MM-DD) no fuso do CRM. */
export function hojeCRM(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_CRM, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

/** AAAA-MM-DD → 25/10/2026 (sem conversão de fuso). */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO_CRM });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: FUSO_CRM,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Soma meses/semanas a uma data AAAA-MM-DD, segurando o fim do mês (31/01 + 1 mês = 28/02). */
export function somarPeriodo(iso: string, periodicidade: "mensal" | "quinzenal" | "semanal", n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (periodicidade === "mensal") {
    const alvo = new Date(Date.UTC(a, m - 1 + n, 1));
    const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
    alvo.setUTCDate(Math.min(d, ultimoDia));
    return alvo.toISOString().slice(0, 10);
  }
  const dias = periodicidade === "quinzenal" ? 15 : 7;
  const alvo = new Date(Date.UTC(a, m - 1, d + dias * n));
  return alvo.toISOString().slice(0, 10);
}

/** Divide o total em n partes; a última absorve a diferença de centavos. */
export function dividirCentavos(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const partes = Array.from({ length: n }, () => base);
  partes[n - 1] = total - base * (n - 1);
  return partes;
}

export type ParcelaCalculada = Parcela & {
  valorC: number;
  recebidoC: number;
  saldoC: number;
  situacao: Situacao;
  atrasada: boolean; // saldo aberto e vencimento < hoje (vale também para "parcial")
  lancamentos: Lancamento[];
  incompleta: boolean; // lançamento sem data ou sem forma (registros antigos)
};

export function calcularParcela(p: Parcela, lancamentos: Lancamento[], hoje: string): ParcelaCalculada {
  const meus = lancamentos.filter((l) => l.pagamento_id === p.id);
  const recebidoC =
    meus.filter((l) => l.tipo === "recebimento").reduce((s, l) => s + centavos(l.valor), 0) -
    meus.filter((l) => l.tipo === "estorno").reduce((s, l) => s + centavos(l.valor), 0);
  const valorC = centavos(p.valor);
  const saldoC = Math.max(0, valorC - recebidoC);
  const cancelada = p.status === "cancelado";
  const venc = p.data_vencimento;
  const atrasada = !cancelada && saldoC > 0 && !!venc && venc < hoje;

  let situacao: Situacao;
  if (cancelada) situacao = "cancelada";
  else if (saldoC === 0) situacao = "recebida";
  else if (recebidoC > 0) situacao = "parcial";
  else if (!venc) situacao = "sem_vencimento";
  else if (venc < hoje) situacao = "vencida";
  else if (venc === hoje) situacao = "vence_hoje";
  else situacao = "a_vencer";

  const incompleta = meus.some((l) => l.tipo === "recebimento" && (!l.data || !l.forma_pagamento));
  return { ...p, valorC, recebidoC, saldoC, situacao, atrasada, lancamentos: meus, incompleta };
}

export type ResumoFinanceiro = {
  contratadoC: number | null;
  recebidoC: number; // recebimentos − estornos
  reembolsadoC: number;
  aReceberC: number;
  aReceberBaseParcelas: boolean; // true quando não há valor contratado
  emAtrasoC: number;
  distribuidoC: number; // soma das parcelas não canceladas
  naoDistribuidoC: number | null; // contratado − distribuído (pode ser negativo)
};

export function resumir(
  contratado: number | null,
  parcelas: ParcelaCalculada[],
  lancamentos: Lancamento[],
): ResumoFinanceiro {
  const ativas = parcelas.filter((p) => p.situacao !== "cancelada");
  const recebidoC =
    lancamentos.filter((l) => l.tipo === "recebimento").reduce((s, l) => s + centavos(l.valor), 0) -
    lancamentos.filter((l) => l.tipo === "estorno").reduce((s, l) => s + centavos(l.valor), 0);
  const reembolsadoC = lancamentos.filter((l) => l.tipo === "reembolso").reduce((s, l) => s + centavos(l.valor), 0);
  const contratadoC = contratado === null || contratado === undefined ? null : centavos(contratado);
  const distribuidoC = ativas.reduce((s, p) => s + p.valorC, 0);
  const saldoParcelasC = ativas.reduce((s, p) => s + p.saldoC, 0);
  return {
    contratadoC,
    recebidoC,
    reembolsadoC,
    aReceberC: contratadoC === null ? saldoParcelasC : Math.max(0, contratadoC - recebidoC),
    aReceberBaseParcelas: contratadoC === null,
    emAtrasoC: ativas.filter((p) => p.atrasada).reduce((s, p) => s + p.saldoC, 0),
    distribuidoC,
    naoDistribuidoC: contratadoC === null ? null : contratadoC - distribuidoC,
  };
}

/** Em aberto primeiro (por vencimento; sem data no fim), depois as quitadas e canceladas. */
export function ordenarParcelas(lista: ParcelaCalculada[]): ParcelaCalculada[] {
  const peso = (p: ParcelaCalculada) => (p.situacao === "cancelada" ? 2 : p.saldoC > 0 ? 0 : 1);
  return [...lista].sort((a, b) => {
    const d = peso(a) - peso(b);
    if (d) return d;
    const va = a.data_vencimento ?? "9999-12-31";
    const vb = b.data_vencimento ?? "9999-12-31";
    if (va !== vb) return va < vb ? -1 : 1;
    return a.created_at < b.created_at ? -1 : 1;
  });
}

export function nomeParcela(p: Pick<Parcela, "descricao" | "numero_parcela" | "total_parcelas">): string {
  return p.descricao?.trim() || `Parcela ${p.numero_parcela}/${p.total_parcelas}`;
}
