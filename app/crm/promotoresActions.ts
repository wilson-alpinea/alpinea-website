"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin, garantirSomenteAdmin } from "@/lib/crm/acesso";
import { carregarComissaoPromotor } from "@/lib/crm/portalComissoes";
import { isNivelPromotor, valorUnitario, type TipoComissaoPromotor } from "@/lib/crm/programaPromotores";

// Programa de Promotores (Wilson, 27/nov/2026 — migração 042):
// - a equipe lança a comissão do lead do promotor (tipo e quantidade no
//   cliente; vaga incentivada na candidatura); só admin aprova, e a
//   aprovação grava o nível e o valor unitário daquele momento;
// - cancelamento (viagem) e saída antes de 30 dias (emprego) ficam
//   registrados e mudam as parcelas sozinhos;
// - o admin marca o pagamento do extrato mensal de cada beneficiário.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

type Origem = "cliente" | "candidatura";

async function emailAtual() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return user?.email ?? "equipe";
}

const destino = (origem: Origem, id: string) => (origem === "cliente" ? `/crm/clientes/${id}` : `/crm/empregos/${id}`);

function voltar(origem: Origem, id: string, erro?: string): never {
  redirect(`${destino(origem, id)}${erro ? `?promotorErro=${encodeURIComponent(erro)}` : "?promotorOk=1"}#comissao-promotor`);
}

/** Promotor dono do lead (cliente ou candidatura). */
async function promotorDoLead(origem: Origem, id: string) {
  const admin = createAdminClient();
  const { data: lead } = await admin.from(origem === "cliente" ? "clientes" : "candidaturas_vagas").select("parceiro_id").eq("id", id).maybeSingle();
  if (!lead?.parceiro_id) return null;
  const { data: p } = await admin.from("parceiros").select("id, nome, tipo, nivel_promotor").eq("id", lead.parceiro_id).maybeSingle();
  return p?.tipo === "promotor" ? p : null;
}

function lerForm(origem: Origem, formData: FormData) {
  const tipoBruto = String(formData.get("tipo") ?? "");
  const tipo: TipoComissaoPromotor | null = origem === "candidatura" ? "contratacao" : tipoBruto === "pacote" || tipoBruto === "passagem" ? tipoBruto : null;
  const qtd = origem === "candidatura" ? 1 : Number(String(formData.get("quantidade") ?? "").trim());
  const data = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return DATA.test(v) ? v : null;
  };
  return {
    tipo,
    quantidade: Number.isInteger(qtd) && qtd >= 1 && qtd <= 99 ? qtd : null,
    vaga_incentivada: origem === "candidatura" && formData.get("vaga_incentivada") === "on",
    cancelado_em: origem === "cliente" ? data("cancelado_em") : null,
    desligado_em: origem === "candidatura" ? data("desligado_em") : null,
    observacao: String(formData.get("observacao") ?? "").trim().slice(0, 1000) || null,
  };
}

async function gravar(origem: Origem, id: string, formData: FormData, aprovar: boolean) {
  if (!UUID.test(id)) voltar(origem, id, "Registro inválido.");
  if (aprovar) {
    try {
      await garantirSomenteAdmin();
    } catch {
      voltar(origem, id, "Só administradores aprovam comissões.");
    }
  } else {
    try {
      await garantirAdmin();
    } catch (e) {
      voltar(origem, id, e instanceof Error ? e.message : "Acesso negado.");
    }
  }
  const promotor = await promotorDoLead(origem, id);
  if (!promotor) voltar(origem, id, "Este lead não está atribuído a um promotor.");
  const admin = createAdminClient();
  const chave = origem === "cliente" ? { cliente_id: id } : { candidatura_id: id };
  const atual = await carregarComissaoPromotor(chave, admin);
  if (atual && "erro" in atual) voltar(origem, id, "Rode a migração 042 no Supabase para usar o Programa de Promotores.");
  const f = lerForm(origem, formData);

  // Depois de aprovada, só cancelamento/desligamento e observação mudam —
  // tipo, quantidade e valor ficam congelados até o admin reabrir.
  if (atual?.status === "aprovada" && !aprovar) {
    const { error } = await admin
      .from("promotor_comissoes")
      .update({ cancelado_em: f.cancelado_em, desligado_em: f.desligado_em, observacao: f.observacao, updated_at: new Date().toISOString(), updated_by_email: await emailAtual() })
      .eq("id", atual.id);
    if (error) voltar(origem, id, "Não foi possível salvar.");
    revalidatePath(destino(origem, id));
    voltar(origem, id);
  }
  if (atual?.status === "aprovada" && aprovar) voltar(origem, id, "A comissão já está aprovada.");
  if (!f.tipo) voltar(origem, id, "Escolha se é pacote completo ou passagem avulsa.");
  if (!f.quantidade) voltar(origem, id, origem === "cliente" ? "Informe o número de passageiros (pacote) ou de bilhetes (passagem), de 1 a 99." : "Quantidade inválida.");

  const nivel = isNivelPromotor(promotor.nivel_promotor) ? promotor.nivel_promotor : "bronze";
  const agora = new Date().toISOString();
  const por = await emailAtual();
  const { error } = await admin.from("promotor_comissoes").upsert(
    {
      ...chave,
      parceiro_id: promotor.id,
      tipo: f.tipo,
      quantidade: f.quantidade,
      vaga_incentivada: f.vaga_incentivada,
      cancelado_em: f.cancelado_em,
      desligado_em: f.desligado_em,
      observacao: f.observacao,
      status: aprovar ? "aprovada" : "rascunho",
      nivel: aprovar ? nivel : null,
      valor_unitario_jpy: aprovar ? valorUnitario(nivel, f.tipo, f.vaga_incentivada) : null,
      aprovado_em: aprovar ? agora : null,
      aprovado_por_email: aprovar ? por : null,
      updated_at: agora,
      updated_by_email: por,
    },
    { onConflict: origem === "cliente" ? "cliente_id" : "candidatura_id" },
  );
  if (error) {
    console.error("Erro ao salvar comissão do promotor:", error.message);
    voltar(origem, id, "Não foi possível salvar a comissão.");
  }
  revalidatePath(destino(origem, id));
  voltar(origem, id);
}

export async function salvarComissaoPromotor(origem: Origem, id: string, formData: FormData) {
  await gravar(origem, id, formData, false);
}

export async function aprovarComissaoPromotor(origem: Origem, id: string, formData: FormData) {
  await gravar(origem, id, formData, true);
}

/** Reabrir (só admin): volta para rascunho e sai do extrato. */
export async function reabrirComissaoPromotor(origem: Origem, id: string) {
  if (!UUID.test(id)) voltar(origem, id, "Registro inválido.");
  try {
    await garantirSomenteAdmin();
  } catch {
    voltar(origem, id, "Só administradores reabrem comissões.");
  }
  const { error } = await createAdminClient()
    .from("promotor_comissoes")
    .update({ status: "rascunho", nivel: null, valor_unitario_jpy: null, aprovado_em: null, aprovado_por_email: null, updated_at: new Date().toISOString(), updated_by_email: await emailAtual() })
    .eq(origem === "cliente" ? "cliente_id" : "candidatura_id", id);
  if (error) voltar(origem, id, "Não foi possível reabrir.");
  revalidatePath(destino(origem, id));
  voltar(origem, id);
}

/** Atribuir a candidatura a um parceiro/promotor (etiqueta do primeiro contato no WhatsApp). */
export async function definirParceiroCandidatura(candidaturaId: string, formData: FormData) {
  if (!UUID.test(candidaturaId)) voltar("candidatura", candidaturaId, "Candidatura inválida.");
  try {
    await garantirAdmin();
  } catch (e) {
    voltar("candidatura", candidaturaId, e instanceof Error ? e.message : "Acesso negado.");
  }
  const bruto = String(formData.get("parceiro_id") ?? "");
  const parceiroId = UUID.test(bruto) ? bruto : null;
  const admin = createAdminClient();
  let detalhe: string | null = null;
  if (parceiroId) {
    const { data } = await admin.from("parceiros").select("nome, tipo").eq("id", parceiroId).maybeSingle();
    if (!data || data.tipo === "empreiteira") voltar("candidatura", candidaturaId, "Parceiro inválido.");
    detalhe = data.nome;
  }
  const { data: comissao } = await admin.from("promotor_comissoes").select("status").eq("candidatura_id", candidaturaId).maybeSingle();
  if (comissao?.status === "aprovada") voltar("candidatura", candidaturaId, "A comissão já foi aprovada para o parceiro atual. Reabra a comissão antes de trocar o parceiro.");
  const { error } = await admin
    .from("candidaturas_vagas")
    .update(parceiroId ? { parceiro_id: parceiroId, canal: "parceiro", canal_detalhe: detalhe } : { parceiro_id: null })
    .eq("id", candidaturaId);
  if (error) voltar("candidatura", candidaturaId, "Não foi possível salvar (a migração 042 já rodou?).");
  if (!parceiroId || comissao) await admin.from("promotor_comissoes").delete().eq("candidatura_id", candidaturaId).eq("status", "rascunho");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  voltar("candidatura", candidaturaId);
}

// ── Pagamento do extrato mensal (só admin) ──────────────────────────
function voltarComissoes(msg: { ok?: string; erro?: string }): never {
  const p = new URLSearchParams();
  if (msg.ok) p.set("ok", msg.ok);
  if (msg.erro) p.set("erro", msg.erro);
  redirect(`/crm/comissoes?${p.toString()}#extratos`);
}

export async function marcarPagamentoComissao(beneficiario: string, mes: string, moeda: "JPY" | "BRL", valor: number, formData: FormData) {
  await garantirSomenteAdmin();
  if (!/^[eu]:[0-9a-f-]{36}$/i.test(beneficiario) || !/^\d{4}-\d{2}$/.test(mes) || (moeda !== "JPY" && moeda !== "BRL") || !(valor >= 0)) voltarComissoes({ erro: "Dados inválidos." });
  const pagoEm = String(formData.get("pago_em") ?? "").trim();
  if (!DATA.test(pagoEm)) voltarComissoes({ erro: "Informe a data do pagamento." });
  const { error } = await createAdminClient()
    .from("comissoes_pagamentos")
    .upsert(
      { beneficiario, mes, moeda, valor, pago_em: pagoEm, observacao: String(formData.get("observacao") ?? "").trim().slice(0, 500) || null, created_by_email: await emailAtual() },
      { onConflict: "beneficiario,mes" },
    );
  if (error) {
    console.error("Erro ao marcar pagamento:", error.message);
    voltarComissoes({ erro: "Não foi possível salvar (a migração 042 já rodou?)." });
  }
  revalidatePath("/crm/comissoes");
  voltarComissoes({ ok: "Pagamento registrado. O parceiro já vê no portal." });
}

export async function desfazerPagamentoComissao(beneficiario: string, mes: string) {
  await garantirSomenteAdmin();
  const { error } = await createAdminClient().from("comissoes_pagamentos").delete().eq("beneficiario", beneficiario).eq("mes", mes);
  if (error) voltarComissoes({ erro: "Não foi possível desfazer." });
  revalidatePath("/crm/comissoes");
  voltarComissoes({ ok: "Pagamento desfeito." });
}
