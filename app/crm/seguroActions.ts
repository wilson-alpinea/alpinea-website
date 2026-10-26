"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { etapaSeguro, isEtapaSeguro, type EventoSeguro } from "@/lib/crm/seguro";

// Ações do CRM de Seguro Viagem (Wilson, 26/out/2026). Nada aqui envia
// mensagem ao cliente — a equipe registra o que fez fora do sistema.

export type ResultadoSeguro = { ok: true; mensagem: string } | { ok: false; erro: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function carregar(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("seguro_pedidos").select("id, etapa, historico, pago_em, apolice_recebida_em, apolice_enviada_em, numero_apolice, notas, email, telefone").eq("id", id).maybeSingle();
  return { admin, pedido: data, error };
}

function revalidar(id: string) {
  revalidatePath("/crm/seguro");
  revalidatePath(`/crm/seguro/${id}`);
}

export async function mudarEtapaSeguro(id: string, etapa: string, motivo?: string): Promise<ResultadoSeguro> {
  const acesso = await garantirAdmin();
  if (!UUID.test(id) || !isEtapaSeguro(etapa)) return { ok: false, erro: "Pedido ou etapa inválidos." };
  const { admin, pedido, error } = await carregar(id);
  if (error || !pedido) return { ok: false, erro: "Pedido não encontrado." };
  if (pedido.etapa === etapa) return { ok: false, erro: "O pedido já está nessa etapa." };

  const agora = new Date().toISOString();
  const update: Record<string, unknown> = { etapa, updated_at: agora };
  // Datas de cada marco: gravadas na primeira vez, nunca sobrescritas.
  if (["pago", "apolice_recebida", "apolice_enviada", "concluido"].includes(etapa) && !pedido.pago_em) update.pago_em = agora;
  if (["apolice_recebida", "apolice_enviada", "concluido"].includes(etapa) && !pedido.apolice_recebida_em) update.apolice_recebida_em = agora;
  if (["apolice_enviada", "concluido"].includes(etapa) && !pedido.apolice_enviada_em) update.apolice_enviada_em = agora;
  const motivoLimpo = (motivo ?? "").trim().slice(0, 500);
  if (etapa === "cancelado") update.motivo_cancelamento = motivoLimpo || null;

  const evento: EventoSeguro = { em: agora, por: acesso.nome || acesso.email, tipo: "etapa", de: pedido.etapa, para: etapa, ...(motivoLimpo ? { texto: motivoLimpo } : {}) };
  update.historico = [...((pedido.historico as EventoSeguro[]) ?? []), evento];

  const { error: e } = await admin.from("seguro_pedidos").update(update).eq("id", id).eq("etapa", pedido.etapa);
  if (e) {
    console.error("Erro ao mudar etapa do seguro:", e);
    return { ok: false, erro: "Não foi possível salvar. Nada foi alterado." };
  }
  revalidar(id);
  return { ok: true, mensagem: `Etapa alterada para “${etapaSeguro(etapa).label}”.` };
}

export async function salvarDadosSeguro(id: string, dados: { numero_apolice: string; email: string; telefone: string }): Promise<ResultadoSeguro> {
  const acesso = await garantirAdmin();
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const numero = dados.numero_apolice.trim().slice(0, 80);
  const email = dados.email.trim().slice(0, 160);
  const telefone = dados.telefone.trim().slice(0, 30);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, erro: "E-mail inválido." };
  const { admin, pedido, error } = await carregar(id);
  if (error || !pedido) return { ok: false, erro: "Pedido não encontrado." };

  const mudou: string[] = [];
  if ((pedido.numero_apolice ?? "") !== numero) mudou.push("número da apólice");
  if ((pedido.email ?? "") !== email) mudou.push("e-mail");
  if ((pedido.telefone ?? "") !== telefone) mudou.push("telefone");
  if (mudou.length === 0) return { ok: true, mensagem: "Nada mudou." };

  const agora = new Date().toISOString();
  const evento: EventoSeguro = { em: agora, por: acesso.nome || acesso.email, tipo: "edicao", texto: `Alterou ${mudou.join(", ")}.` };
  const { error: e } = await admin
    .from("seguro_pedidos")
    .update({ numero_apolice: numero || null, email: email || null, telefone: telefone || null, updated_at: agora, historico: [...((pedido.historico as EventoSeguro[]) ?? []), evento] })
    .eq("id", id);
  if (e) {
    console.error("Erro ao salvar dados do seguro:", e);
    return { ok: false, erro: "Não foi possível salvar." };
  }
  revalidar(id);
  return { ok: true, mensagem: "Dados salvos." };
}

export async function adicionarNotaSeguro(id: string, texto: string): Promise<ResultadoSeguro> {
  const acesso = await garantirAdmin();
  const t = texto.trim().slice(0, 2000);
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  if (!t) return { ok: false, erro: "Escreva a nota." };
  const { admin, pedido, error } = await carregar(id);
  if (error || !pedido) return { ok: false, erro: "Pedido não encontrado." };
  const agora = new Date().toISOString();
  const evento: EventoSeguro = { em: agora, por: acesso.nome || acesso.email, tipo: "nota", texto: t };
  const { error: e } = await admin.from("seguro_pedidos").update({ updated_at: agora, historico: [...((pedido.historico as EventoSeguro[]) ?? []), evento] }).eq("id", id);
  if (e) return { ok: false, erro: "Não foi possível salvar a nota." };
  revalidar(id);
  return { ok: true, mensagem: "Nota registrada." };
}
