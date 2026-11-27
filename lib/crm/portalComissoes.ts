// Comissões no portal do parceiro e do promotor (Wilson, 27/nov/2026:
// "garantir que os usuários cadastrados como promotores e agências terão
// acesso claro a todas as informações dos leads deles, bem como pagamento e
// prazo de pagamento, tanto para empregos quanto turismo").
//
// O que o parceiro vê é a MESMA base do extrato mensal e do pagamento —
// sem planilha paralela:
// - Promotor: comissão aprovada por lead (promotor_comissoes, migração 042),
//   com as parcelas do programa (lib/crm/programaPromotores.ts) e prazo até
//   o dia 15 do mês seguinte, em ienes.
// - Agência/afiliado: comissão aprovada no card do cliente (comissoes_vendas,
//   migração 038), no mês da aprovação, com prazo até o 10º dia útil do mês
//   seguinte (lib/crm/comissoes.ts).
// - Pago/não pago: comissoes_pagamentos (migração 042), marcado pelo admin.
// Só servidor (service role).
import { createAdminClient } from "@/lib/supabase/admin";
import { lerAndamentoManual } from "./andamentoManual";
import { prazoComissao } from "./comissoes";
import {
  isNivelPromotor,
  parcelaEmprego,
  parcelasViagem,
  prazoPromotor,
  type FatosEmprego,
  type FatosViagem,
  type NivelPromotor,
  type ParcelaPromotor,
  type TipoComissaoPromotor,
} from "./programaPromotores";

type Admin = ReturnType<typeof createAdminClient>;

const semTabela = (e: { code?: string } | null) => !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "42703" || e.code === "PGRST204");
const mesSP = (iso: string) => new Date(Date.parse(iso) - 3 * 3600_000).toISOString().slice(0, 7);
export const hojeSP = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export type ComissaoPromotorLinha = {
  id: string;
  parceiro_id: string;
  cliente_id: string | null;
  candidatura_id: string | null;
  tipo: TipoComissaoPromotor;
  quantidade: number;
  vaga_incentivada: boolean;
  status: "rascunho" | "aprovada";
  nivel: NivelPromotor | null;
  valor_unitario_jpy: number | null;
  cancelado_em: string | null;
  desligado_em: string | null;
  observacao: string | null;
  aprovado_em: string | null;
  aprovado_por_email: string | null;
  updated_at: string;
  updated_by_email: string | null;
};

function lerLinha(r: Record<string, unknown>): ComissaoPromotorLinha {
  return {
    ...(r as unknown as ComissaoPromotorLinha),
    quantidade: Number(r.quantidade) || 0,
    vaga_incentivada: Boolean(r.vaga_incentivada),
    nivel: isNivelPromotor(r.nivel) ? r.nivel : null,
    valor_unitario_jpy: r.valor_unitario_jpy == null ? null : Number(r.valor_unitario_jpy),
  };
}

export async function carregarComissaoPromotor(
  origem: { cliente_id: string } | { candidatura_id: string },
  admin: Admin = createAdminClient(),
): Promise<ComissaoPromotorLinha | null | { erro: true }> {
  const [col, val] = "cliente_id" in origem ? ["cliente_id", origem.cliente_id] : ["candidatura_id", origem.candidatura_id];
  const { data, error } = await admin.from("promotor_comissoes").select("*").eq(col, val).maybeSingle();
  if (error) return semTabela(error) ? { erro: true } : null;
  return data ? lerLinha(data) : null;
}

/** Dia em que cada cliente quitou: recebido acumulado (recebimentos − estornos) ≥ valor contratado. */
export async function datasQuitacao(clientes: { id: string; valor_contratado?: number | null }[], admin: Admin = createAdminClient()): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  const alvo = new Map<string, number>();
  for (const c of clientes) {
    const v = Math.round((Number(c.valor_contratado) || 0) * 100);
    out.set(c.id, null);
    if (v > 0) alvo.set(c.id, v);
  }
  if (!alvo.size) return out;
  const { data, error } = await admin.from("recebimentos").select("cliente_id, tipo, valor, data").in("cliente_id", [...alvo.keys()]).order("data", { ascending: true });
  if (error) return out;
  const acumulado = new Map<string, number>();
  for (const r of data ?? []) {
    const id = r.cliente_id as string;
    const sinal = r.tipo === "recebimento" ? 1 : r.tipo === "estorno" ? -1 : 0;
    const total = (acumulado.get(id) ?? 0) + sinal * Math.round(Number(r.valor) * 100);
    acumulado.set(id, total);
    if (out.get(id) == null && total >= alvo.get(id)!) out.set(id, String(r.data).slice(0, 10));
    // Estorno depois da quitação desfaz a quitação.
    if (out.get(id) != null && total < alvo.get(id)!) out.set(id, null);
  }
  return out;
}

/** Início do trabalho: etapa "Início das atividades" marcada no andamento da candidatura. */
export function inicioTrabalho(andamento: unknown): string | null {
  const em = lerAndamentoManual(andamento).etapas.inicio?.em;
  return em ? new Date(Date.parse(em) - 3 * 3600_000).toISOString().slice(0, 10) : null;
}

export const totalAprovado = (c: ComissaoPromotorLinha) => (c.status === "aprovada" && c.valor_unitario_jpy != null ? c.valor_unitario_jpy * c.quantidade : 0);

/** Fatos do lead: quitação/embarque (viagem) ou início do trabalho (emprego).
 * Cancelamento e saída vêm da própria comissão. */
export type FatosLead = { quitadoEm?: string | null; embarque?: string | null; inicioEm?: string | null };

export function parcelasDaComissao(c: ComissaoPromotorLinha, fatos: FatosLead, hoje = hojeSP()): ParcelaPromotor[] {
  if (c.status !== "aprovada") return [];
  const total = totalAprovado(c);
  if (c.tipo === "contratacao") {
    const f: FatosEmprego = { inicioEm: fatos.inicioEm ?? null, desligadoEm: c.desligado_em };
    return parcelaEmprego(total, f, hoje);
  }
  const f: FatosViagem = { quitadoEm: fatos.quitadoEm ?? null, embarque: fatos.embarque ?? null, canceladoEm: c.cancelado_em };
  return parcelasViagem(total, f, hoje);
}

export type Pagamento = { mes: string; moeda: "JPY" | "BRL"; valor: number; pago_em: string; observacao: string | null };

export async function pagamentosDo(beneficiario: string, admin: Admin = createAdminClient()): Promise<{ pagamentos: Map<string, Pagamento>; erro: boolean }> {
  const { data, error } = await admin.from("comissoes_pagamentos").select("mes, moeda, valor, pago_em, observacao").eq("beneficiario", beneficiario);
  const pagamentos = new Map<string, Pagamento>();
  for (const p of data ?? []) pagamentos.set(p.mes as string, { ...(p as Pagamento), valor: Number(p.valor) });
  return { pagamentos, erro: !!error };
}

export type MesExtrato = {
  mes: string;
  moeda: "JPY" | "BRL";
  total: number;
  prazo: string;
  pago: Pagamento | null;
  itens: { lead: string; descricao: string; valor: number }[];
};

/** Extrato mensal a partir das parcelas liberadas (promotor). */
export function extratoPromotor(itens: { lead: string; parcelas: ParcelaPromotor[] }[], pagamentos: Map<string, Pagamento>): MesExtrato[] {
  const meses = new Map<string, MesExtrato>();
  for (const { lead, parcelas } of itens)
    for (const p of parcelas) {
      if (!p.mesExtrato || (p.situacao !== "liberada" && p.situacao !== "desconto")) continue;
      let m = meses.get(p.mesExtrato);
      if (!m) meses.set(p.mesExtrato, (m = { mes: p.mesExtrato, moeda: "JPY", total: 0, prazo: prazoPromotor(p.mesExtrato), pago: pagamentos.get(p.mesExtrato) ?? null, itens: [] }));
      m.total += p.valorJPY;
      m.itens.push({ lead, descricao: p.descricao, valor: p.valorJPY });
    }
  // Desconto maior que o mês: o saldo negativo passa para o próximo mês
  // ainda não pago ("descontado da próxima comissão").
  const crescente = [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes));
  let saldo = 0;
  for (const m of crescente) {
    if (m.pago) continue;
    if (saldo < 0) {
      m.total += saldo;
      m.itens.push({ lead: "Saldo anterior", descricao: "Desconto que não coube no mês anterior", valor: saldo });
      saldo = 0;
    }
    if (m.total < 0) {
      saldo = m.total;
      m.itens.push({ lead: "Saldo", descricao: "Passa para o próximo extrato", valor: -m.total });
      m.total = 0;
    }
  }
  return crescente.reverse();
}

export type ComissaoAgencia = { clienteId: string; mes: string; totalJPY: number; totalBRL: number; aprovadoEm: string; prazo: string };

/** Comissões aprovadas da empresa (agência/afiliado) por cliente — comissoes_vendas (migração 038). */
export async function comissoesAgencia(parceiroId: string, admin: Admin = createAdminClient()): Promise<Map<string, ComissaoAgencia>> {
  const chave = `e:${parceiroId}`;
  const { data, error } = await admin.from("comissoes_vendas").select("cliente_id, aprovado_em, snapshot").eq("status", "aprovada").limit(10000);
  const out = new Map<string, ComissaoAgencia>();
  if (error) return out;
  for (const v of data ?? []) {
    const snap = v.snapshot as { beneficiarios?: { chave: string; totalJPY: number; totalBRL: number }[] } | null;
    const b = snap?.beneficiarios?.find((x) => x.chave === chave);
    if (!b || !v.aprovado_em) continue;
    const mes = mesSP(v.aprovado_em as string);
    out.set(v.cliente_id as string, { clienteId: v.cliente_id as string, mes, totalJPY: Number(b.totalJPY), totalBRL: Number(b.totalBRL), aprovadoEm: v.aprovado_em as string, prazo: prazoComissao(mes) });
  }
  return out;
}

/** Extrato mensal da agência/afiliado (em reais, pelo câmbio da aprovação). */
export function extratoAgencia(comissoes: { lead: string; c: ComissaoAgencia }[], pagamentos: Map<string, Pagamento>): MesExtrato[] {
  const meses = new Map<string, MesExtrato>();
  for (const { lead, c } of comissoes) {
    let m = meses.get(c.mes);
    if (!m) meses.set(c.mes, (m = { mes: c.mes, moeda: "BRL", total: 0, prazo: c.prazo, pago: pagamentos.get(c.mes) ?? null, itens: [] }));
    m.total = Math.round((m.total + c.totalBRL) * 100) / 100;
    m.itens.push({ lead, descricao: "Comissão aprovada", valor: c.totalBRL });
  }
  return [...meses.values()].sort((a, b) => b.mes.localeCompare(a.mes));
}

// ── Carga em lote (portal e /crm/comissoes) ─────────────────────────
export type ItemPromotor = {
  comissao: ComissaoPromotorLinha;
  lead: string;
  parcelas: ParcelaPromotor[];
};

/** Comissões do promotor (ou de todos) com as parcelas já calculadas. */
export async function itensPromotores(admin: Admin = createAdminClient(), parceiroId?: string): Promise<{ itens: ItemPromotor[]; erro: boolean }> {
  let q = admin.from("promotor_comissoes").select("*");
  if (parceiroId) q = q.eq("parceiro_id", parceiroId);
  const { data, error } = await q.limit(5000);
  if (error) return { itens: [], erro: true };
  const linhas = (data ?? []).map(lerLinha);
  const idsCli = linhas.map((l) => l.cliente_id).filter(Boolean) as string[];
  const idsCand = linhas.map((l) => l.candidatura_id).filter(Boolean) as string[];
  const [rCli, rCand] = await Promise.all([
    idsCli.length ? admin.from("clientes").select("id, nome, valor_contratado, data_viagem").in("id", idsCli) : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    idsCand.length ? admin.from("candidaturas_vagas").select("id, nome, sobrenome, andamento_manual").in("id", idsCand) : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);
  const clientes = new Map((rCli.data ?? []).map((c) => [c.id as string, c]));
  const candidaturas = new Map((rCand.data ?? []).map((c) => [c.id as string, c]));
  const quitacao = await datasQuitacao((rCli.data ?? []).map((c) => ({ id: c.id as string, valor_contratado: c.valor_contratado as number | null })), admin);
  const hoje = hojeSP();
  const itens = linhas.map((comissao) => {
    if (comissao.cliente_id) {
      const c = clientes.get(comissao.cliente_id);
      return {
        comissao,
        lead: (c?.nome as string) ?? "Cliente",
        parcelas: parcelasDaComissao(comissao, { quitadoEm: quitacao.get(comissao.cliente_id) ?? null, embarque: (c?.data_viagem as string | null) ?? null }, hoje),
      };
    }
    const c = candidaturas.get(comissao.candidatura_id!);
    return {
      comissao,
      lead: c ? `${c.nome} ${c.sobrenome ?? ""}`.trim() : "Candidato",
      parcelas: parcelasDaComissao(comissao, { inicioEm: inicioTrabalho(c?.andamento_manual) }, hoje),
    };
  });
  return { itens, erro: false };
}

export type ExtratoBeneficiario = { chave: string; nome: string; tipo: "promotor" | "empresa" | "usuario"; meses: MesExtrato[] };

/** Extratos de todos os beneficiários: promotores (¥, dia 15) e quem recebe pela tabela por serviço (R$, 10º dia útil). */
export async function extratosGerais(admin: Admin = createAdminClient()): Promise<{ extratos: ExtratoBeneficiario[]; erro: boolean }> {
  const [{ itens, erro }, rPar, rVend, rPag] = await Promise.all([
    itensPromotores(admin),
    admin.from("parceiros").select("id, nome, tipo"),
    admin.from("comissoes_vendas").select("cliente_id, aprovado_em, snapshot, clientes(nome)").eq("status", "aprovada").limit(10000),
    admin.from("comissoes_pagamentos").select("beneficiario, mes, moeda, valor, pago_em, observacao"),
  ]);
  const pagos = new Map<string, Map<string, Pagamento>>();
  for (const p of rPag.data ?? []) {
    const m = pagos.get(p.beneficiario as string) ?? new Map<string, Pagamento>();
    m.set(p.mes as string, { ...(p as unknown as Pagamento), valor: Number(p.valor) });
    pagos.set(p.beneficiario as string, m);
  }
  const nomes = new Map((rPar.data ?? []).map((p) => [p.id as string, p.nome as string]));
  const out: ExtratoBeneficiario[] = [];

  const porPromotor = new Map<string, ItemPromotor[]>();
  for (const i of itens) porPromotor.set(i.comissao.parceiro_id, [...(porPromotor.get(i.comissao.parceiro_id) ?? []), i]);
  for (const [pid, lista] of porPromotor) {
    const chave = `e:${pid}`;
    const meses = extratoPromotor(lista, pagos.get(chave) ?? new Map());
    if (meses.length) out.push({ chave, nome: nomes.get(pid) ?? "Promotor", tipo: "promotor", meses });
  }

  const porChave = new Map<string, { nome: string; tipo: "empresa" | "usuario"; itens: { lead: string; c: ComissaoAgencia }[] }>();
  for (const v of rVend.data ?? []) {
    const snap = v.snapshot as { beneficiarios?: { chave: string; nome: string; tipo: "empresa" | "usuario"; totalJPY: number; totalBRL: number }[] } | null;
    if (!v.aprovado_em) continue;
    const mes = mesSP(v.aprovado_em as string);
    const lead = ((v.clientes as unknown as { nome?: string } | null)?.nome) ?? "Cliente";
    for (const b of snap?.beneficiarios ?? []) {
      const g = porChave.get(b.chave) ?? { nome: b.nome, tipo: b.tipo, itens: [] };
      g.itens.push({ lead, c: { clienteId: v.cliente_id as string, mes, totalJPY: Number(b.totalJPY), totalBRL: Number(b.totalBRL), aprovadoEm: v.aprovado_em as string, prazo: prazoComissao(mes) } });
      porChave.set(b.chave, g);
    }
  }
  for (const [chave, g] of porChave) out.push({ chave, nome: g.nome, tipo: g.tipo, meses: extratoAgencia(g.itens, pagos.get(chave) ?? new Map()) });

  return { extratos: out.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), erro: erro || !!rPag.error };
}
