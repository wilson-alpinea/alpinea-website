"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { SAIDAS_DOC, etapaDoc, isEtapaDoc, servicoDoc, type EventoDoc } from "@/lib/crm/documentacao";
import { enviarEmailDoc, URL_SITE } from "@/lib/documentacao/processoPublico";
import { urlPortal } from "@/app/documentacao/processo";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "@/lib/email/templateCliente";

// Ações do CRM de Documentação (Wilson, 29/out/2026). Mesmo padrão do CRM de
// Seguro: nada aqui envia mensagem ao cliente — a equipe registra o que fez.

export type ResultadoDoc = { ok: true; mensagem: string } | { ok: false; erro: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABELA = "documentacao_processos";

async function carregar(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from(TABELA).select("id, etapa, historico, pago_em, protocolado_em, concluido_em, valor_final, email, telefone, nome, servico, acesso_token, ficha_enviada_em, liberado_contrato_em").eq("id", id).maybeSingle();
  return { admin, processo: data, error };
}

function revalidar(id: string) {
  revalidatePath("/crm/documentacao");
  revalidatePath(`/crm/documentacao/${id}`);
}

export async function mudarEtapaDoc(id: string, etapa: string, motivo?: string): Promise<ResultadoDoc> {
  const acesso = await garantirAdmin();
  if (!UUID.test(id) || !isEtapaDoc(etapa)) return { ok: false, erro: "Processo ou etapa inválidos." };
  const { admin, processo, error } = await carregar(id);
  if (error || !processo) return { ok: false, erro: "Processo não encontrado." };
  if (processo.etapa === etapa) return { ok: false, erro: "O processo já está nessa etapa." };

  // Pré-aprovar libera o contrato no portal: precisa da ficha e do valor final.
  if (etapa === "pre_aprovado") {
    if (!processo.ficha_enviada_em) return { ok: false, erro: "O cliente ainda não enviou a ficha completa e os documentos." };
    if (!processo.valor_final) return { ok: false, erro: "Informe o valor final antes de pré-aprovar — ele vai no contrato." };
  }

  const agora = new Date().toISOString();
  const update: Record<string, unknown> = { etapa, updated_at: agora };
  if (etapa === "pre_aprovado" && !processo.liberado_contrato_em) update.liberado_contrato_em = agora;
  // Datas de cada marco: gravadas na primeira vez, nunca sobrescritas.
  if (["contratado", "documentacao", "protocolado", "concluido"].includes(etapa) && !processo.pago_em) update.pago_em = agora;
  if (["protocolado", "concluido"].includes(etapa) && !processo.protocolado_em) update.protocolado_em = agora;
  if (etapa === "concluido" && !processo.concluido_em) update.concluido_em = agora;
  const motivoLimpo = (motivo ?? "").trim().slice(0, 500);
  if (SAIDAS_DOC.includes(etapa)) update.motivo_saida = motivoLimpo || null;

  const evento: EventoDoc = { em: agora, por: acesso.nome || acesso.email, tipo: "etapa", de: processo.etapa, para: etapa, ...(motivoLimpo ? { texto: motivoLimpo } : {}) };
  update.historico = [...((processo.historico as EventoDoc[]) ?? []), evento];

  const { error: e } = await admin.from(TABELA).update(update).eq("id", id).eq("etapa", processo.etapa);
  if (e) {
    console.error("Erro ao mudar etapa (documentação):", e);
    return { ok: false, erro: "Não foi possível salvar. Nada foi alterado." };
  }
  revalidar(id);

  // Portal online: avisa o cliente por e-mail quando o contrato é liberado e
  // quando o pagamento é confirmado (as demais etapas ele vê no link).
  if ((etapa === "pre_aprovado" || etapa === "contratado") && processo.email && processo.acesso_token) {
    const nomeServico = servicoDoc(processo.servico).label;
    const link = `${URL_SITE}${urlPortal(processo.id, processo.acesso_token)}`;
    const email: EmailClienteParams = {
      nome: processo.nome,
      titulo: etapa === "pre_aprovado" ? `Seu caso foi pré-aprovado — ${nomeServico}` : `Pagamento confirmado — ${nomeServico}`,
      intro:
        etapa === "pre_aprovado"
          ? `Analisamos sua ficha e seus documentos. O contrato com o valor final (${processo.valor_final}) já está disponível para aceite online no seu link de acesso.`
          : "Recebemos seu pagamento e o processo começou. Você acompanha cada etapa pelo seu link de acesso.",
      etapas: [{ titulo: "Cadastro" }, { titulo: "Ficha e documentos" }, { titulo: "Análise da equipe" }, { titulo: "Contrato", texto: etapa === "pre_aprovado" ? `Aceite em ${link}` : undefined }, { titulo: "Pagamento" }, { titulo: "Processo em andamento" }],
      etapaAtual: etapa === "pre_aprovado" ? 3 : 5,
      status: etapa === "pre_aprovado" ? "Aguardando o aceite do contrato" : "Processo em andamento",
      extras: [`Seu link de acesso: ${link}`, "Lembrete: o pagamento e o envio dos documentos não garantem a aprovação — a decisão é das autoridades."],
      mensagemWhatsapp: `Olá! Tenho uma dúvida sobre meu processo de ${nomeServico}.`,
      rotuloAndamento: "Andamento do seu processo",
    };
    await enviarEmailDoc({ para: [processo.email], assunto: `${email.titulo} (Ajisai)`, texto: emailClienteTexto(email), html: emailClienteHtml(email) });
  }
  return { ok: true, mensagem: `Etapa alterada para “${etapaDoc(etapa).label}”.${etapa === "pre_aprovado" ? " O cliente recebeu o contrato por e-mail." : ""}` };
}

export async function salvarDadosDoc(id: string, dados: { valor_final: string; email: string; telefone: string }): Promise<ResultadoDoc> {
  const acesso = await garantirAdmin();
  if (!UUID.test(id)) return { ok: false, erro: "Processo inválido." };
  const valor = dados.valor_final.trim().slice(0, 80);
  const email = dados.email.trim().slice(0, 160);
  const telefone = dados.telefone.trim().slice(0, 30);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, erro: "E-mail inválido." };
  const { admin, processo, error } = await carregar(id);
  if (error || !processo) return { ok: false, erro: "Processo não encontrado." };

  const mudou: string[] = [];
  if ((processo.valor_final ?? "") !== valor) mudou.push("valor final");
  if ((processo.email ?? "") !== email) mudou.push("e-mail");
  if ((processo.telefone ?? "") !== telefone) mudou.push("telefone");
  if (mudou.length === 0) return { ok: true, mensagem: "Nada mudou." };

  const agora = new Date().toISOString();
  const evento: EventoDoc = { em: agora, por: acesso.nome || acesso.email, tipo: "edicao", texto: `Alterou ${mudou.join(", ")}.` };
  const { error: e } = await admin
    .from(TABELA)
    .update({ valor_final: valor || null, email: email || null, telefone: telefone || null, updated_at: agora, historico: [...((processo.historico as EventoDoc[]) ?? []), evento] })
    .eq("id", id);
  if (e) {
    console.error("Erro ao salvar dados (documentação):", e);
    return { ok: false, erro: "Não foi possível salvar." };
  }
  revalidar(id);
  return { ok: true, mensagem: "Dados salvos." };
}

export async function adicionarNotaDoc(id: string, texto: string): Promise<ResultadoDoc> {
  const acesso = await garantirAdmin();
  const t = texto.trim().slice(0, 2000);
  if (!UUID.test(id)) return { ok: false, erro: "Processo inválido." };
  if (!t) return { ok: false, erro: "Escreva a nota." };
  const { admin, processo, error } = await carregar(id);
  if (error || !processo) return { ok: false, erro: "Processo não encontrado." };
  const agora = new Date().toISOString();
  const evento: EventoDoc = { em: agora, por: acesso.nome || acesso.email, tipo: "nota", texto: t };
  const { error: e } = await admin.from(TABELA).update({ updated_at: agora, historico: [...((processo.historico as EventoDoc[]) ?? []), evento] }).eq("id", id);
  if (e) return { ok: false, erro: "Não foi possível salvar a nota." };
  revalidar(id);
  return { ok: true, mensagem: "Nota registrada." };
}
