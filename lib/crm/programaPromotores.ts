// Programa de Promotores Ajisai (Wilson, 27/nov/2026 — apresentação
// executiva de nov/2026, migração 042). Módulo puro: usado pelo CRM da
// equipe (revisão e aprovação) e pelo portal do promotor.
//
// Regras do programa:
// - Paga só por resultado validado, com valor fixo por nível.
// - Viagem: pacote completo (no mínimo aéreo, roteiro, hospedagem e seguro
//   viagem) paga por passageiro; sem algum desses itens, só o aéreo paga,
//   como passagem avulsa (por bilhete). Grupo/família: cada passageiro conta.
// - Liberação da viagem em duas partes: 50% quando o cliente quita a
//   viagem; 50% no mês seguinte ao embarque.
// - Cancelamento: a 2ª metade não é paga e a 1ª, se já liberada, é
//   descontada da próxima comissão. Remarcação não cancela.
// - Emprego: paga quando o contratado completa 30 dias de trabalho; vaga
//   incentivada tem valor próprio (+¥10 mil). Candidatura sozinha não paga.
// - Pagamento pela Ajisai Japan, em ienes, até o dia 15 do mês seguinte ao
//   mês em que a parcela foi liberada.
// - Janela de atribuição: 90 dias para viagem, 60 para emprego.

export type NivelPromotor = "bronze" | "prata" | "ouro";
export type TipoComissaoPromotor = "pacote" | "passagem" | "contratacao";

export const NIVEIS_PROMOTOR: { id: NivelPromotor; label: string; meta: string }[] = [
  { id: "bronze", label: "Bronze", meta: "Entrada: todo promotor começa aqui." },
  { id: "prata", label: "Prata", meta: "3+ passageiros em pacote ou 5+ contratações no trimestre." },
  { id: "ouro", label: "Ouro", meta: "8+ passageiros em pacote ou 12+ contratações no trimestre." },
];
export const isNivelPromotor = (v: unknown): v is NivelPromotor => v === "bronze" || v === "prata" || v === "ouro";
export const rotuloNivel = (v: unknown) => NIVEIS_PROMOTOR.find((n) => n.id === v)?.label ?? "Bronze";

/** Valores fixos em ienes por nível (slide "Níveis e valores"). */
export const VALORES_PROMOTOR: Record<NivelPromotor, { pacote: number; passagem: number; contratacao: number; incentivada: number }> = {
  bronze: { pacote: 15000, passagem: 3000, contratacao: 10000, incentivada: 20000 },
  prata: { pacote: 20000, passagem: 3500, contratacao: 15000, incentivada: 25000 },
  ouro: { pacote: 25000, passagem: 4000, contratacao: 20000, incentivada: 30000 },
};

export const TIPO_COMISSAO_LABEL: Record<TipoComissaoPromotor, { label: string; unidade: string }> = {
  pacote: { label: "Pacote completo", unidade: "passageiro" },
  passagem: { label: "Passagem avulsa", unidade: "bilhete" },
  contratacao: { label: "Contratação", unidade: "pessoa" },
};

export const JANELA_ATRIBUICAO_DIAS = { viagem: 90, emprego: 60 } as const;
export const DIAS_EMPREGO_PARA_PAGAR = 30;
export const DIA_PAGAMENTO_PROMOTOR = 15;

export function valorUnitario(nivel: NivelPromotor, tipo: TipoComissaoPromotor, incentivada = false): number {
  const v = VALORES_PROMOTOR[nivel];
  if (tipo === "contratacao") return incentivada ? v.incentivada : v.contratacao;
  return v[tipo];
}

// ── Datas ────────────────────────────────────────────────────────────
const ISO = /^\d{4}-\d{2}-\d{2}$/;
export const dataValida = (v: unknown): v is string => typeof v === "string" && ISO.test(v.slice(0, 10));

/** Mês seguinte a `dataISO` (AAAA-MM). */
export function mesSeguinte(dataISO: string): string {
  const [a, m] = dataISO.slice(0, 7).split("-").map(Number);
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
}
/** Prazo de pagamento do promotor: dia 15 do mês seguinte ao mês do extrato. */
export const prazoPromotor = (mesExtrato: string) => `${mesSeguinte(`${mesExtrato}-01`)}-${String(DIA_PAGAMENTO_PROMOTOR).padStart(2, "0")}`;

export function somarDias(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// ── Parcelas ─────────────────────────────────────────────────────────
export type SituacaoParcela = "aguardando" | "liberada" | "nao_paga" | "desconto";

export type ParcelaPromotor = {
  id: "viagem_1" | "viagem_2" | "estorno" | "emprego";
  descricao: string;
  valorJPY: number; // negativo no desconto por cancelamento
  situacao: SituacaoParcela;
  /** O que falta para liberar (situacao "aguardando") ou por que não paga. */
  motivo?: string;
  /** Dia em que a parcela foi liberada. */
  liberadaEm?: string;
  /** Mês do extrato em que a parcela entra (AAAA-MM). */
  mesExtrato?: string;
  /** Pagamento até (AAAA-MM-DD). */
  pagamentoAte?: string;
};

export type FatosViagem = {
  /** Dia em que o cliente quitou a viagem (null = ainda não quitou). */
  quitadoEm: string | null;
  /** Data de embarque (clientes.data_viagem). */
  embarque: string | null;
  canceladoEm: string | null;
};
export type FatosEmprego = {
  /** Início das atividades (etapa "inicio" do andamento). */
  inicioEm: string | null;
  desligadoEm: string | null;
};

const liberar = (p: Omit<ParcelaPromotor, "situacao" | "mesExtrato" | "pagamentoAte">, em: string, hoje: string): ParcelaPromotor => {
  if (em > hoje) return { ...p, situacao: "aguardando", motivo: `Libera em ${formatarDataCurta(em)}` };
  const mesExtrato = em.slice(0, 7);
  return { ...p, situacao: "liberada", liberadaEm: em, mesExtrato, pagamentoAte: prazoPromotor(mesExtrato) };
};

/** Parcelas de uma comissão de viagem (pacote ou passagem), já aprovada. */
export function parcelasViagem(totalJPY: number, f: FatosViagem, hoje: string): ParcelaPromotor[] {
  const metade1 = Math.round(totalJPY / 2);
  const metade2 = totalJPY - metade1;
  const out: ParcelaPromotor[] = [];

  // 1ª metade: na quitação (se a quitação veio antes do cancelamento).
  const quitouAntes = f.quitadoEm && (!f.canceladoEm || f.quitadoEm <= f.canceladoEm);
  const p1base = { id: "viagem_1" as const, descricao: "50% na quitação da viagem", valorJPY: metade1 };
  const p1 = quitouAntes ? liberar(p1base, f.quitadoEm!, hoje) : null;
  if (p1) out.push(p1);
  else if (f.canceladoEm) out.push({ ...p1base, situacao: "nao_paga", motivo: "Viagem cancelada antes da quitação" });
  else out.push({ ...p1base, situacao: "aguardando", motivo: "Aguardando o cliente quitar a viagem" });

  // 2ª metade: no mês seguinte ao embarque.
  const p2base = { id: "viagem_2" as const, descricao: "50% no mês seguinte ao embarque", valorJPY: metade2 };
  if (f.canceladoEm) out.push({ ...p2base, situacao: "nao_paga", motivo: "Viagem cancelada" });
  else if (!f.embarque) out.push({ ...p2base, situacao: "aguardando", motivo: "Data de embarque a definir" });
  // Libera no embarque e entra no extrato do mês do embarque: o pagamento
  // (dia 15 do mês seguinte) cai no mês seguinte ao embarque.
  else out.push(liberar(p2base, f.embarque.slice(0, 10), hoje));

  // Cancelamento depois da 1ª metade liberada: desconto na próxima comissão.
  if (f.canceladoEm && p1?.situacao === "liberada" && f.canceladoEm <= hoje) {
    const mesExtrato = f.canceladoEm.slice(0, 7) > p1.mesExtrato! ? f.canceladoEm.slice(0, 7) : mesSeguinte(`${p1.mesExtrato!}-01`);
    out.push({
      id: "estorno",
      descricao: "Desconto: viagem cancelada (50% já liberados)",
      valorJPY: -metade1,
      situacao: "desconto",
      liberadaEm: f.canceladoEm,
      mesExtrato,
      pagamentoAte: prazoPromotor(mesExtrato),
    });
  }
  return out;
}

/** Parcela única de uma contratação (emprego), já aprovada. */
export function parcelaEmprego(totalJPY: number, f: FatosEmprego, hoje: string): ParcelaPromotor[] {
  const base = { id: "emprego" as const, descricao: `Contratado completa ${DIAS_EMPREGO_PARA_PAGAR} dias de trabalho`, valorJPY: totalJPY };
  if (!f.inicioEm) return [{ ...base, situacao: "aguardando", motivo: "Aguardando o início do trabalho" }];
  const libera = somarDias(f.inicioEm, DIAS_EMPREGO_PARA_PAGAR);
  if (f.desligadoEm && f.desligadoEm < libera) return [{ ...base, situacao: "nao_paga", motivo: `Saiu antes de completar ${DIAS_EMPREGO_PARA_PAGAR} dias` }];
  return [liberar(base, libera, hoje)];
}

// ── Formatação ───────────────────────────────────────────────────────
export const formatarIeneP = (v: number) => `${v < 0 ? "−" : ""}¥${Math.abs(Math.round(v)).toLocaleString("pt-BR")}`;
export function formatarDataCurta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
export function rotuloMes(mes: string): string {
  const t = new Date(`${mes}-15T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const SITUACAO_PARCELA_LABEL: Record<SituacaoParcela, string> = {
  aguardando: "Aguardando",
  liberada: "Liberada",
  nao_paga: "Não paga",
  desconto: "Desconto",
};

/** Código do promotor a partir do nome: AJISAI-NOME (só letras/números). */
export function codigoPromotorDoNome(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 20);
  return `AJISAI-${base || "PROMOTOR"}`;
}
export const CODIGO_PROMOTOR = /^AJISAI-[A-Z0-9]{2,24}$/;
