import { createAdminClient } from "@/lib/supabase/admin";

// Follow-ups manuais do CRM de Empregos (Wilson, 04/nov/2026: "configurar
// alertas de follow up manuais, ex. follow up com candidato daqui a 20 dias.
// Algum tipo de alerta que gera um e-mail e uma notificação no CRM").
// Tabela empregos_followups (migração 037). Na data marcada o follow-up
// vira alerta fixo no sino do CRM de Empregos (até ser concluído) e o cron
// diário (/api/cron/empregos-followups) manda o e-mail.

export type FollowUp = {
  id: string;
  candidatura_id: string;
  data_alvo: string;
  nota: string | null;
  created_at: string;
  created_by_email: string | null;
  concluido_em: string | null;
  concluido_por: string | null;
  email_enviado_em: string | null;
};

export type FollowUpComCandidato = FollowUp & { nome: string; vaga: string };

/** Data de hoje no fuso de São Paulo (AAAA-MM-DD). */
export const hojeSP = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export const dataBR = (d: string) => {
  const [a, m, dia] = d.split("-");
  return `${dia}/${m}/${a}`;
};

/** Dias entre hoje (SP) e a data: negativo = atrasado. */
export function diasAte(data: string) {
  return Math.round((Date.parse(`${data}T12:00:00Z`) - Date.parse(`${hojeSP()}T12:00:00Z`)) / 86400000);
}

export function rotuloPrazo(data: string) {
  const d = diasAte(data);
  if (d === 0) return "hoje";
  if (d === 1) return "amanhã";
  if (d === -1) return "atrasado 1 dia";
  return d < 0 ? `atrasado ${-d} dias` : `em ${d} dias`;
}

type Admin = ReturnType<typeof createAdminClient>;

/** Pendentes com data até `ate` (padrão: hoje) — os que já viraram alerta. */
export async function followUpsVencidos(admin: Admin = createAdminClient(), ate: string = hojeSP()): Promise<FollowUpComCandidato[]> {
  const { data, error } = await admin.from("empregos_followups").select("*").is("concluido_em", null).lte("data_alvo", ate).order("data_alvo", { ascending: true }).limit(200);
  if (error) {
    if (error.code !== "42P01" && error.code !== "PGRST205") console.error("Erro ao ler follow-ups:", error.message);
    return [];
  }
  const lista = (data ?? []) as FollowUp[];
  if (!lista.length) return [];
  const ids = Array.from(new Set(lista.map((f) => f.candidatura_id)));
  const { data: cands } = await admin.from("candidaturas_vagas").select("id, nome, sobrenome, vaga_empresa, vaga_titulo").in("id", ids);
  const de = new Map((cands ?? []).map((c) => [c.id as string, c]));
  return lista.map((f) => {
    const c = de.get(f.candidatura_id);
    return {
      ...f,
      nome: c ? `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim() || "Candidato" : "Candidato",
      vaga: c ? [c.vaga_empresa, c.vaga_titulo].filter(Boolean).join(" — ") : "",
    };
  });
}

export async function followUpsDaCandidatura(candidaturaId: string, admin: Admin = createAdminClient()): Promise<FollowUp[] | null> {
  const { data, error } = await admin.from("empregos_followups").select("*").eq("candidatura_id", candidaturaId).order("data_alvo", { ascending: true }).limit(100);
  if (error) return null;
  return (data ?? []) as FollowUp[];
}
