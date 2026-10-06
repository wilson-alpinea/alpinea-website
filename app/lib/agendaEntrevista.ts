// Etapa 4 — agenda da pré-entrevista (Wilson, 06/out/2026): a equipe
// define janelas semanais e restrições em /crm/empregos/agenda; o
// candidato escolhe um horário livre. Tudo em horário de Brasília (UTC−3,
// sem horário de verão desde 2019). Módulo puro: a API recalcula os
// horários antes de gravar, então nunca dá pra marcar fora da agenda.

export const OFFSET_BRASILIA = "-03:00";
export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export type ConfigAgenda = {
  duracao_min: number;
  intervalo_min: number;
  antecedencia_horas: number;
  horizonte_dias: number;
  vagas_por_horario: number;
  link_reuniao: string | null;
};
export type Janela = { id?: string; dia_semana: number; inicio: string; fim: string };
export type Bloqueio = { id?: string; data: string; inicio: string | null; fim: string | null; motivo?: string | null };
export type Horario = { inicio: string; fim: string; data: string; hora: string }; // inicio/fim ISO UTC

export const CONFIG_PADRAO: ConfigAgenda = {
  duracao_min: 30,
  intervalo_min: 0,
  antecedencia_horas: 24,
  horizonte_dias: 21,
  vagas_por_horario: 1,
  link_reuniao: null,
};

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** "AAAA-MM-DD" de hoje em Brasília. */
export function hojeBrasilia(agora = new Date()) {
  return new Date(agora.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function gerarHorarios(p: {
  config: ConfigAgenda;
  janelas: Janela[];
  bloqueios: Bloqueio[];
  ocupados: string[]; // ISO de inícios já agendados (status agendada)
  agora?: Date;
}): Horario[] {
  const agora = p.agora ?? new Date();
  const limiteMin = agora.getTime() + p.config.antecedencia_horas * 3600 * 1000;
  const ocupacao = new Map<number, number>();
  for (const o of p.ocupados) {
    const t = new Date(o).getTime();
    ocupacao.set(t, (ocupacao.get(t) ?? 0) + 1);
  }
  const passo = p.config.duracao_min + p.config.intervalo_min;
  const hoje = hojeBrasilia(agora);
  const out: Horario[] = [];

  for (let i = 0; i <= p.config.horizonte_dias; i++) {
    const data = somarDias(hoje, i);
    const dia = new Date(`${data}T12:00:00Z`).getUTCDay();
    const bloqueiosDia = p.bloqueios.filter((b) => b.data === data);
    if (bloqueiosDia.some((b) => !b.inicio)) continue; // dia inteiro bloqueado
    for (const j of p.janelas.filter((x) => x.dia_semana === dia)) {
      for (let m = minutos(j.inicio); m + p.config.duracao_min <= minutos(j.fim); m += passo) {
        const fimMin = m + p.config.duracao_min;
        if (bloqueiosDia.some((b) => b.inicio && b.fim && m < minutos(b.fim) && fimMin > minutos(b.inicio))) continue;
        const inicio = new Date(`${data}T${hhmm(m)}:00${OFFSET_BRASILIA}`);
        if (inicio.getTime() < limiteMin) continue;
        if ((ocupacao.get(inicio.getTime()) ?? 0) >= p.config.vagas_por_horario) continue;
        out.push({
          inicio: inicio.toISOString(),
          fim: new Date(inicio.getTime() + p.config.duracao_min * 60000).toISOString(),
          data,
          hora: hhmm(m),
        });
      }
    }
  }
  // Janelas sobrepostas não geram horário duplicado.
  return out.filter((h, i, arr) => arr.findIndex((x) => x.inicio === h.inicio) === i).sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function formatarDataHoraBrasilia(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
