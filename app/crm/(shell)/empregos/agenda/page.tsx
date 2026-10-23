import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CONFIG_PADRAO, hojeBrasilia, type ConfigAgenda } from "@/app/lib/agendaEntrevista";
import { horariosDisponiveis } from "@/lib/empregos/agendaServidor";
import { AgendaPagina, type BloqueioGrupo, type EntrevistaAgenda, type JanelaAgenda } from "./AgendaPagina";

// Agenda de pré-entrevistas (redesenho 23/out/2026). Compromissos primeiro;
// disponibilidade e regras numa aba própria. A prévia usa exatamente o mesmo
// cálculo do agendamento público (horariosDisponiveis).

export const metadata: Metadata = {
  title: "Agenda de pré-entrevistas — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const supabase = await createClient();
  const hoje = hojeBrasilia();
  const [rCfg, rJanelas, rBloqueios, rEntrevistas, previa] = await Promise.all([
    supabase.from("entrevista_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("entrevista_janelas").select("*").order("dia_semana").order("inicio"),
    supabase.from("entrevista_bloqueios").select("*").gte("data", hoje).order("data").order("inicio"),
    supabase
      .from("entrevistas_agendadas")
      .select("id, inicio, fim, status, candidatura_id, candidaturas_vagas(nome, sobrenome, vaga_id, vaga_titulo, vaga_empresa, telefone, email)")
      .order("inicio", { ascending: true })
      .limit(3000),
    horariosDisponiveis().catch((e) => {
      console.error("Erro ao calcular a prévia da agenda:", e);
      return null;
    }),
  ]);
  const config: ConfigAgenda = { ...CONFIG_PADRAO, ...(rCfg.data ?? {}) };

  const entrevistas: EntrevistaAgenda[] = (rEntrevistas.data ?? []).map((e) => {
    const c = (Array.isArray(e.candidaturas_vagas) ? e.candidaturas_vagas[0] : e.candidaturas_vagas) as
      | { nome?: string; sobrenome?: string; vaga_id?: string; vaga_titulo?: string; vaga_empresa?: string; telefone?: string; email?: string }
      | null;
    return {
      id: e.id,
      inicio: e.inicio,
      status: e.status,
      candidaturaId: e.candidatura_id,
      candidato: c ? `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim() : "Candidato",
      telefone: c?.telefone ?? null,
      email: c?.email ?? null,
      vagaId: c?.vaga_id ?? "",
      vagaEmpresa: c?.vaga_empresa ?? "",
      vagaTitulo: c?.vaga_titulo ?? "",
    };
  });

  // Período de vários dias = uma linha por dia no banco; agrupa para exibir.
  const bloqueios: BloqueioGrupo[] = [];
  for (const b of rBloqueios.data ?? []) {
    const ultimo = bloqueios.at(-1);
    const proximoDia = ultimo ? new Date(Date.parse(`${ultimo.ate}T12:00:00Z`) + 86400000).toISOString().slice(0, 10) : null;
    if (ultimo && proximoDia === b.data && ultimo.inicio === (b.inicio ?? null) && ultimo.fim === (b.fim ?? null) && ultimo.motivo === (b.motivo ?? null)) {
      ultimo.ate = b.data;
      ultimo.ids.push(b.id);
    } else {
      bloqueios.push({ ids: [b.id], de: b.data, ate: b.data, inicio: b.inicio ?? null, fim: b.fim ?? null, motivo: b.motivo ?? null });
    }
  }

  // Vagas restantes por horário da prévia (capacidade − agendadas no instante).
  const ocupacao: Record<string, number> = {};
  for (const e of entrevistas) if (e.status === "agendada") ocupacao[new Date(e.inicio).toISOString()] = (ocupacao[new Date(e.inicio).toISOString()] ?? 0) + 1;

  return (
    <Suspense fallback={null}>
      <AgendaPagina
        hoje={hoje}
        config={config}
        janelas={(rJanelas.data ?? []) as JanelaAgenda[]}
        bloqueios={bloqueios}
        entrevistas={entrevistas}
        previa={previa ? previa.horarios.map((h) => ({ data: h.data, hora: h.hora, restantes: config.vagas_por_horario - (ocupacao[h.inicio] ?? 0) })) : null}
        erros={{ config: !!rCfg.error, janelas: !!rJanelas.error, bloqueios: !!rBloqueios.error, entrevistas: !!rEntrevistas.error }}
      />
    </Suspense>
  );
}
