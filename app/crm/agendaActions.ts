"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { garantirAdmin } from "@/lib/crm/acesso";
import { CONFIG_PADRAO } from "@/app/lib/agendaEntrevista";

// Agenda da pré-entrevista (redesenho 23/out/2026). Mesmas tabelas e regras
// de antes (migração 017), agora devolvendo { ok, erro } para os painéis.
// Nada aqui mexe em entrevistas já marcadas: bloqueios e regras só afetam os
// horários oferecidos daqui em diante; conflitos são mostrados antes.

export type EntrevistaAfetada = { id: string; inicio: string; candidato: string };
export type ResultadoAgenda =
  | { ok: true; mensagem: string }
  | { ok: false; erro: string; campo?: string; afetadas?: EntrevistaAfetada[]; precisaConfirmar?: boolean };

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const min = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const revalidar = () => {
  revalidatePath("/crm/empregos/agenda");
  revalidatePath("/crm/empregos");
};
const diaSP = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const horaSP = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const hojeSP = () => diaSP(new Date().toISOString());

// ── Horários semanais ────────────────────────────────────────────
async function conflitoJanela(supabase: Awaited<ReturnType<typeof createClient>>, dias: number[], inicio: string, fim: string, ignorarId?: string) {
  const { data } = await supabase.from("entrevista_janelas").select("id, dia_semana, inicio, fim").in("dia_semana", dias);
  const choque = (data ?? []).find((j) => j.id !== ignorarId && min(inicio) < min(String(j.fim)) && min(fim) > min(String(j.inicio)));
  return choque ? `Já existe atendimento na ${DIAS[choque.dia_semana]} das ${String(choque.inicio).slice(0, 5)} às ${String(choque.fim).slice(0, 5)}, que se sobrepõe a esse horário.` : null;
}

export async function adicionarHorarios(dias: number[], inicio: string, fim: string): Promise<ResultadoAgenda> {
  await garantirAdmin();
  const lista = [...new Set(dias)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  if (!lista.length) return { ok: false, erro: "Escolha pelo menos um dia.", campo: "dias" };
  if (!HORA.test(inicio) || !HORA.test(fim)) return { ok: false, erro: "Informe início e término.", campo: "horario" };
  if (fim <= inicio) return { ok: false, erro: "O término precisa ser depois do início.", campo: "horario" };
  const supabase = await createClient();
  const choque = await conflitoJanela(supabase, lista, inicio, fim);
  if (choque) return { ok: false, erro: choque, campo: "horario" };
  const { error } = await supabase.from("entrevista_janelas").insert(lista.map((d) => ({ dia_semana: d, inicio, fim })));
  if (error) {
    console.error("Erro ao adicionar janela:", error);
    return { ok: false, erro: "Não foi possível adicionar os horários." };
  }
  revalidar();
  return { ok: true, mensagem: "Horários adicionados." };
}

export async function editarHorario(id: string, inicio: string, fim: string): Promise<ResultadoAgenda> {
  await garantirAdmin();
  if (!UUID.test(id)) return { ok: false, erro: "Horário inválido." };
  if (!HORA.test(inicio) || !HORA.test(fim)) return { ok: false, erro: "Informe início e término.", campo: "horario" };
  if (fim <= inicio) return { ok: false, erro: "O término precisa ser depois do início.", campo: "horario" };
  const supabase = await createClient();
  const { data: atual } = await supabase.from("entrevista_janelas").select("dia_semana").eq("id", id).maybeSingle();
  if (!atual) return { ok: false, erro: "Horário não encontrado." };
  const choque = await conflitoJanela(supabase, [atual.dia_semana], inicio, fim, id);
  if (choque) return { ok: false, erro: choque, campo: "horario" };
  const { error } = await supabase.from("entrevista_janelas").update({ inicio, fim }).eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível salvar." };
  revalidar();
  return { ok: true, mensagem: "Horário atualizado." };
}

export async function removerHorario(id: string): Promise<ResultadoAgenda> {
  await garantirAdmin({ deletar: true });
  if (!UUID.test(id)) return { ok: false, erro: "Horário inválido." };
  const { error } = await (await createClient()).from("entrevista_janelas").delete().eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível remover." };
  revalidar();
  return { ok: true, mensagem: "Horário removido." };
}

// ── Bloqueios ────────────────────────────────────────────────────
// Regra existente: um período de vários dias vira uma linha por dia; se não
// for "dia inteiro", o MESMO intervalo de horas vale em cada um dos dias.
export async function salvarBloqueio(
  dados: { dataInicio: string; dataFim: string; diaInteiro: boolean; inicio: string; fim: string; motivo: string },
  confirmar: boolean,
): Promise<ResultadoAgenda> {
  await garantirAdmin();
  const dataFim = dados.dataFim || dados.dataInicio;
  if (!DATA.test(dados.dataInicio)) return { ok: false, erro: "Informe a data inicial.", campo: "datas" };
  if (dados.dataInicio < hojeSP()) return { ok: false, erro: "A data inicial não pode estar no passado.", campo: "datas" };
  if (!DATA.test(dataFim) || dataFim < dados.dataInicio) return { ok: false, erro: "A data final precisa ser igual ou posterior à inicial.", campo: "datas" };
  if (!dados.diaInteiro && (!HORA.test(dados.inicio) || !HORA.test(dados.fim) || dados.fim <= dados.inicio)) {
    return { ok: false, erro: "Informe o horário bloqueado (término depois do início).", campo: "horario" };
  }
  const dias: string[] = [];
  for (let d = new Date(`${dados.dataInicio}T12:00:00Z`); d.toISOString().slice(0, 10) <= dataFim && dias.length < 90; d.setUTCDate(d.getUTCDate() + 1)) {
    dias.push(d.toISOString().slice(0, 10));
  }
  const supabase = await createClient();

  // Entrevistas já marcadas dentro do bloqueio: mostra antes de salvar.
  const { data: marcadas } = await supabase
    .from("entrevistas_agendadas")
    .select("id, inicio, fim, candidaturas_vagas(nome, sobrenome)")
    .eq("status", "agendada")
    .gte("inicio", new Date(`${dias[0]}T00:00:00-03:00`).toISOString())
    .lt("inicio", new Date(new Date(`${dias[dias.length - 1]}T00:00:00-03:00`).getTime() + 86400000).toISOString());
  const afetadas: EntrevistaAfetada[] = (marcadas ?? [])
    .filter((e) => {
      if (!dias.includes(diaSP(e.inicio))) return false;
      if (dados.diaInteiro) return true;
      const ini = min(horaSP(e.inicio));
      const fimE = e.fim ? min(horaSP(e.fim)) : ini + 1;
      return ini < min(dados.fim) && fimE > min(dados.inicio);
    })
    .map((e) => {
      const c = (Array.isArray(e.candidaturas_vagas) ? e.candidaturas_vagas[0] : e.candidaturas_vagas) as { nome?: string; sobrenome?: string } | null;
      return { id: e.id, inicio: e.inicio, candidato: c ? `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim() : "Candidato" };
    });
  if (afetadas.length && !confirmar) {
    return {
      ok: false,
      precisaConfirmar: true,
      afetadas,
      erro: `${afetadas.length} ${afetadas.length === 1 ? "entrevista já marcada fica" : "entrevistas já marcadas ficam"} dentro deste bloqueio. Elas não serão canceladas nem remarcadas.`,
    };
  }

  const motivo = dados.motivo.trim().slice(0, 200) || null;
  const { error } = await supabase
    .from("entrevista_bloqueios")
    .insert(dias.map((data) => ({ data, inicio: dados.diaInteiro ? null : dados.inicio, fim: dados.diaInteiro ? null : dados.fim, motivo })));
  if (error) {
    console.error("Erro ao adicionar bloqueio:", error);
    return { ok: false, erro: "Não foi possível salvar o bloqueio." };
  }
  revalidar();
  return { ok: true, mensagem: dias.length > 1 ? `Bloqueio salvo em ${dias.length} dias.` : "Bloqueio salvo." };
}

/** Remove todas as linhas de um bloqueio (um período de vários dias = várias linhas). */
export async function removerBloqueio(ids: string[]): Promise<ResultadoAgenda> {
  await garantirAdmin({ deletar: true });
  const validos = ids.filter((i) => UUID.test(i));
  if (!validos.length) return { ok: false, erro: "Bloqueio inválido." };
  const { error } = await (await createClient()).from("entrevista_bloqueios").delete().in("id", validos);
  if (error) return { ok: false, erro: "Não foi possível remover." };
  revalidar();
  return { ok: true, mensagem: "Bloqueio removido." };
}

// ── Regras ───────────────────────────────────────────────────────
export async function salvarRegras(
  r: { duracao_min: number; intervalo_min: number; antecedencia_horas: number; horizonte_dias: number; vagas_por_horario: number; link_reuniao: string },
  confirmar: boolean,
): Promise<ResultadoAgenda> {
  await garantirAdmin();
  const inteiro = (v: number, a: number, b: number, campo: string, rotulo: string) =>
    !Number.isInteger(v) || v < a || v > b ? { ok: false as const, erro: `${rotulo}: use um número inteiro entre ${a} e ${b}.`, campo } : null;
  const erro =
    inteiro(r.duracao_min, 10, 180, "duracao_min", "Duração") ??
    inteiro(r.intervalo_min, 0, 120, "intervalo_min", "Intervalo") ??
    inteiro(r.antecedencia_horas, 0, 720, "antecedencia_horas", "Antecedência") ??
    inteiro(r.horizonte_dias, 1, 120, "horizonte_dias", "Disponibilidade futura") ??
    inteiro(r.vagas_por_horario, 1, 20, "vagas_por_horario", "Candidatos por horário");
  if (erro) return erro;
  const link = r.link_reuniao.trim();
  if (link && !/^https?:\/\/\S+$/.test(link)) return { ok: false, erro: "O link precisa começar com https:// (ou http://).", campo: "link_reuniao" };

  const supabase = await createClient();
  // Capacidade abaixo das reservas futuras já existentes → mostra o conflito.
  const { data: futuras } = await supabase.from("entrevistas_agendadas").select("id, inicio").eq("status", "agendada").gte("inicio", new Date().toISOString());
  const porHorario = new Map<string, number>();
  for (const f of futuras ?? []) porHorario.set(f.inicio, (porHorario.get(f.inicio) ?? 0) + 1);
  const acima = [...porHorario.entries()].filter(([, n]) => n > r.vagas_por_horario);
  if (acima.length && !confirmar) {
    return {
      ok: false,
      precisaConfirmar: true,
      campo: "vagas_por_horario",
      erro: `${acima.length} ${acima.length === 1 ? "horário futuro já tem" : "horários futuros já têm"} mais candidatos do que a nova capacidade. As entrevistas existentes continuam marcadas; só novos agendamentos respeitam o novo limite.`,
    };
  }
  const { error } = await supabase.from("entrevista_config").upsert({ id: 1, ...r, link_reuniao: link || null, updated_at: new Date().toISOString() });
  if (error) {
    console.error("Erro ao salvar regras da agenda:", error);
    return { ok: false, erro: "Não foi possível salvar as regras." };
  }
  revalidar();
  return { ok: true, mensagem: "Regras salvas. A prévia já considera os novos valores." };
}

// ── Situação da entrevista ───────────────────────────────────────
export async function atualizarSituacaoEntrevista(id: string, status: string): Promise<ResultadoAgenda> {
  await garantirAdmin();
  if (!UUID.test(id) || !["agendada", "cancelada", "realizada", "faltou"].includes(status)) return { ok: false, erro: "Situação inválida." };
  const supabase = await createClient();
  if (status === "agendada") {
    // Voltar para "agendada" não pode passar da capacidade do horário.
    const { data: e } = await supabase.from("entrevistas_agendadas").select("inicio").eq("id", id).maybeSingle();
    const { data: cfg } = await supabase.from("entrevista_config").select("vagas_por_horario").eq("id", 1).maybeSingle();
    if (e) {
      const { count } = await supabase.from("entrevistas_agendadas").select("id", { count: "exact", head: true }).eq("inicio", e.inicio).eq("status", "agendada").neq("id", id);
      if ((count ?? 0) >= (cfg?.vagas_por_horario ?? CONFIG_PADRAO.vagas_por_horario)) return { ok: false, erro: "Esse horário já está com a capacidade cheia." };
    }
  }
  const { error } = await supabase.from("entrevistas_agendadas").update({ status }).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar entrevista:", error);
    return { ok: false, erro: "Não foi possível atualizar (o candidato já tem outra entrevista agendada?)." };
  }
  revalidar();
  return { ok: true, mensagem: "Situação atualizada." };
}
