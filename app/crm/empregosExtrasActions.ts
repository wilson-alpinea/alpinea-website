"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { lerAndamentoManual } from "@/lib/crm/andamentoManual";
import {
  MOTIVO_ELIMINACAO_BLACKLIST,
  anularCandidaturasExistentes,
  apenasDigitos,
  normalizarEmail,
  normalizarNome,
  type EntradaBlacklist,
} from "@/lib/empregos/blacklist";

// CRM de Empregos — pedidos do Wilson, 04/nov/2026:
// - anotações gerais (thread livre no card do candidato);
// - anotação curta na foto/arquivo (ex.: "visto vencido");
// - follow-ups manuais com alerta no CRM + e-mail (migração 037);
// - blacklist de candidatos (migração 037).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function operador() {
  await garantirAdmin();
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return user?.email ?? "equipe";
}

function voltarCandidato(id: string, erro?: string, ancora = ""): never {
  redirect(`/crm/empregos/${id}${erro ? `?erro=${encodeURIComponent(erro)}` : "?salvo=1"}${ancora}`);
}

async function lerAndamento(id: string) {
  const { data, error } = await createAdminClient().from("candidaturas_vagas").select("andamento_manual").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return lerAndamentoManual(data.andamento_manual);
}

async function gravarAndamento(id: string, andamento: ReturnType<typeof lerAndamentoManual>) {
  const { error } = await createAdminClient()
    .from("candidaturas_vagas")
    .update({ andamento_manual: andamento, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Erro ao salvar andamento_manual:", error.message);
  return !error;
}

// ── Anotações gerais ────────────────────────────────────────────────
export async function adicionarAnotacaoGeral(candidaturaId: string, formData: FormData) {
  if (!UUID.test(candidaturaId)) voltarCandidato(candidaturaId, "Candidatura inválida.");
  const por = await operador();
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 4000);
  if (!texto) voltarCandidato(candidaturaId, "Escreva a anotação.", "#anotacoes");
  const andamento = await lerAndamento(candidaturaId);
  if (!andamento) voltarCandidato(candidaturaId, "Não foi possível salvar a anotação.", "#anotacoes");
  andamento.anotacoes.push({ em: new Date().toISOString(), por, texto });
  if (!(await gravarAndamento(candidaturaId, andamento))) voltarCandidato(candidaturaId, "Não foi possível salvar a anotação.", "#anotacoes");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  voltarCandidato(candidaturaId, undefined, "#anotacoes");
}

// ── Anotação curta da foto / arquivo ────────────────────────────────
export async function salvarNotaArquivo(candidaturaId: string, chave: string, formData: FormData) {
  if (!UUID.test(candidaturaId) || !chave || chave.length > 400) voltarCandidato(candidaturaId, "Arquivo inválido.");
  const por = await operador();
  const texto = String(formData.get("nota") ?? "").trim().slice(0, 80);
  const andamento = await lerAndamento(candidaturaId);
  if (!andamento) voltarCandidato(candidaturaId, "Não foi possível salvar a anotação do arquivo.");
  if (texto) andamento.notasArquivos[chave] = { em: new Date().toISOString(), por, texto };
  else delete andamento.notasArquivos[chave];
  if (!(await gravarAndamento(candidaturaId, andamento))) voltarCandidato(candidaturaId, "Não foi possível salvar a anotação do arquivo.");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  voltarCandidato(candidaturaId);
}

// ── Follow-ups ──────────────────────────────────────────────────────
const hojeSP = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export async function criarFollowUp(candidaturaId: string, formData: FormData) {
  if (!UUID.test(candidaturaId)) voltarCandidato(candidaturaId, "Candidatura inválida.");
  const por = await operador();
  const dias = Number(formData.get("dias"));
  let data = String(formData.get("data") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    if (!Number.isInteger(dias) || dias < 1 || dias > 730) voltarCandidato(candidaturaId, "Informe a data do follow-up ou em quantos dias.", "#followup");
    const base = new Date(`${hojeSP()}T12:00:00Z`);
    base.setUTCDate(base.getUTCDate() + dias);
    data = base.toISOString().slice(0, 10);
  }
  if (data < hojeSP()) voltarCandidato(candidaturaId, "A data do follow-up já passou.", "#followup");
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 500) || null;
  const { error } = await createAdminClient().from("empregos_followups").insert({ candidatura_id: candidaturaId, data_alvo: data, nota, created_by_email: por });
  if (error) {
    console.error("Erro ao criar follow-up:", error.message);
    voltarCandidato(candidaturaId, "Não foi possível agendar o follow-up. A migração 037 já rodou no Supabase?", "#followup");
  }
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empregos");
  voltarCandidato(candidaturaId, undefined, "#followup");
}

export async function concluirFollowUp(candidaturaId: string, followupId: string) {
  if (!UUID.test(candidaturaId) || !UUID.test(followupId)) voltarCandidato(candidaturaId, "Follow-up inválido.");
  const por = await operador();
  const { error } = await createAdminClient()
    .from("empregos_followups")
    .update({ concluido_em: new Date().toISOString(), concluido_por: por })
    .eq("id", followupId)
    .eq("candidatura_id", candidaturaId);
  if (error) voltarCandidato(candidaturaId, "Não foi possível concluir o follow-up.", "#followup");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empregos");
  voltarCandidato(candidaturaId, undefined, "#followup");
}

export async function excluirFollowUp(candidaturaId: string, followupId: string) {
  if (!UUID.test(candidaturaId) || !UUID.test(followupId)) voltarCandidato(candidaturaId, "Follow-up inválido.");
  await garantirAdmin({ deletar: true });
  const { error } = await createAdminClient().from("empregos_followups").delete().eq("id", followupId).eq("candidatura_id", candidaturaId).is("concluido_em", null);
  if (error) voltarCandidato(candidaturaId, "Não foi possível excluir o follow-up.", "#followup");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empregos");
  voltarCandidato(candidaturaId, undefined, "#followup");
}

// ── Blacklist ───────────────────────────────────────────────────────
function voltarBlacklist(msg: { erro?: string; ok?: string }): never {
  const p = new URLSearchParams();
  if (msg.erro) p.set("erro", msg.erro);
  if (msg.ok) p.set("ok", msg.ok);
  redirect(`/crm/empregos/blacklist?${p.toString()}`);
}

async function inserirNaBlacklist(dados: { nome: string; cpf: string; email: string; telefone: string; motivo: string }, por: string) {
  const cpf = apenasDigitos(dados.cpf);
  const telefone = apenasDigitos(dados.telefone);
  const email = normalizarEmail(dados.email);
  const nome = dados.nome.trim().replace(/\s+/g, " ").slice(0, 160);
  const nomeNorm = normalizarNome(nome);
  const motivo = dados.motivo.trim().slice(0, 1000);
  if (!motivo) return { erro: "Escreva o motivo." };
  if (cpf && cpf.length !== 11) return { erro: "CPF deve ter 11 dígitos." };
  if (telefone && telefone.length < 10) return { erro: "Telefone com DDD (mín. 10 dígitos)." };
  if (email && !/\S+@\S+\.\S+/.test(email)) return { erro: "E-mail inválido." };
  if (nomeNorm && !nomeNorm.includes(" ")) return { erro: "Use o nome completo (nome e sobrenome)." };
  if (!cpf && !telefone && !email && !nomeNorm) return { erro: "Informe pelo menos um dado: nome completo, CPF, e-mail ou telefone." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("empregos_blacklist")
    .insert({ nome_completo: nome || null, nome_normalizado: nomeNorm || null, cpf: cpf || null, email: email || null, telefone: telefone || null, motivo, created_by_email: por })
    .select("*")
    .single();
  if (error || !data) {
    console.error("Erro ao incluir na blacklist:", error?.message);
    return { erro: "Não foi possível salvar. A migração 037 já rodou no Supabase?" };
  }
  const anuladas = await anularCandidaturasExistentes(data as EntradaBlacklist, por, admin);
  revalidatePath("/crm/empregos", "layout");
  return { anuladas };
}

export async function adicionarBlacklist(formData: FormData) {
  const por = await operador();
  const r = await inserirNaBlacklist(
    {
      nome: String(formData.get("nome") ?? ""),
      cpf: String(formData.get("cpf") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefone: String(formData.get("telefone") ?? ""),
      motivo: String(formData.get("motivo") ?? ""),
    },
    por,
  );
  if ("erro" in r) voltarBlacklist({ erro: r.erro });
  voltarBlacklist({ ok: `Incluído na blacklist.${r.anuladas ? ` ${r.anuladas} ${r.anuladas === 1 ? "candidatura anulada" : "candidaturas anuladas"}.` : ""}` });
}

/** Pela tela do candidato: usa os dados dele (nome, e-mail, telefone e CPF da ficha). */
export async function adicionarCandidatoBlacklist(candidaturaId: string, formData: FormData) {
  if (!UUID.test(candidaturaId)) voltarCandidato(candidaturaId, "Candidatura inválida.");
  const por = await operador();
  const { data: c } = await createAdminClient().from("candidaturas_vagas").select("nome, sobrenome, email, telefone, ficha").eq("id", candidaturaId).maybeSingle();
  if (!c) voltarCandidato(candidaturaId, "Candidatura não encontrada.");
  const usar = (k: string) => formData.get(`usar_${k}`) === "1";
  const cpf = apenasDigitos(String((c.ficha as { valores?: Record<string, unknown> } | null)?.valores?.cpf ?? ""));
  const r = await inserirNaBlacklist(
    {
      nome: usar("nome") ? `${c.nome ?? ""} ${c.sobrenome ?? ""}` : "",
      cpf: usar("cpf") && cpf.length === 11 ? cpf : "",
      email: usar("email") ? (c.email ?? "") : "",
      telefone: usar("telefone") ? (c.telefone ?? "") : "",
      motivo: String(formData.get("motivo") ?? ""),
    },
    por,
  );
  if ("erro" in r) voltarCandidato(candidaturaId, r.erro, "#blacklist");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  voltarCandidato(candidaturaId, undefined, "#blacklist");
}

/** Tira da blacklist e reativa as candidaturas que ela anulou (a classificação
 * continua "eliminado" — a equipe reclassifica no candidato se quiser). */
export async function removerBlacklist(entradaId: string) {
  if (!UUID.test(entradaId)) voltarBlacklist({ erro: "Registro inválido." });
  const por = await operador();
  const admin = createAdminClient();
  const agora = new Date().toISOString();
  const { error } = await admin.from("empregos_blacklist").update({ removido_em: agora, removido_por: por }).eq("id", entradaId);
  if (error) voltarBlacklist({ erro: "Não foi possível remover." });
  const { data: anuladas } = await admin.from("candidaturas_vagas").select("id, motivos_eliminacao").eq("blacklist_id", entradaId);
  for (const c of anuladas ?? []) {
    await admin
      .from("candidaturas_vagas")
      .update({
        blacklist_id: null,
        anulada_em: null,
        motivos_eliminacao: ((c.motivos_eliminacao ?? []) as string[]).filter((m) => m !== MOTIVO_ELIMINACAO_BLACKLIST),
        updated_at: agora,
      })
      .eq("id", c.id);
  }
  revalidatePath("/crm/empregos", "layout");
  voltarBlacklist({ ok: `Removido da blacklist.${anuladas?.length ? ` ${anuladas.length} ${anuladas.length === 1 ? "candidatura voltou" : "candidaturas voltaram"} a aparecer como eliminada(s) — reclassifique no candidato se for o caso.` : ""}` });
}
