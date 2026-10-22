import type { Estagio, EstagioEntrega } from "./types";

// Cards de processo da ficha do cliente (Wilson, 22/out/2026): os dois
// fluxogramas com bolinhas viraram dois cards compactos, "Comercial" e
// "Execução da viagem". Este módulo só traduz o status gravado no banco
// (clientes.estagio / clientes.estagio_entrega) para o que o card mostra.
// Nada aqui inventa datas, tarefas ou responsáveis.

export type SituacaoProcesso = "aguardando" | "andamento" | "concluido" | "perdido";

export type ResumoProcesso = {
  situacao: SituacaoProcesso;
  // Índice (0–4) da etapa atual; -1 quando a execução não começou.
  indiceAtual: number;
  // Só para "perdido": última etapa alcançada antes da perda, segundo o
  // histórico (-1 quando o histórico não diz).
  indiceAlcancado: number;
  etapaAtual: string;
  proximaEtapa: string | null;
};

export type EventoHistorico = {
  id: string;
  // Data informada pela equipe (data_evento) ou, em registros antigos, a
  // data em que o registro foi salvo.
  data: string;
  dataInformada: boolean;
  titulo: string;
  conteudo: string | null;
  autor: string | null;
};

export const ETAPAS_COMERCIAL = [
  "Novo lead",
  "Qualificação",
  "Proposta enviada",
  "Em negociação",
  "Fechado",
] as const;

export const ETAPAS_EXECUCAO = [
  "Roteiro em elaboração",
  "Roteiro entregue",
  "Reservas confirmadas",
  "Viagem em andamento",
  "Concluída",
] as const;

const INDICE_COMERCIAL: Record<Estagio, number> = {
  novo_lead: 0,
  qualificacao: 1,
  proposta_enviada: 2,
  negociacao: 3,
  fechado_ganho: 4,
  fechado_perdido: 4,
};

const INDICE_EXECUCAO: Record<EstagioEntrega, number> = {
  roteiro_elaboracao: 0,
  roteiro_entregue: 1,
  reservas_confirmadas: 2,
  viagem_andamento: 3,
  concluida: 4,
};

export function indiceComercial(estagio: string): number {
  return INDICE_COMERCIAL[estagio as Estagio] ?? -1;
}

export function resumoComercial(estagio: Estagio, estagiosAlcancados: string[]): ResumoProcesso {
  const i = INDICE_COMERCIAL[estagio] ?? 0;
  if (estagio === "fechado_ganho") {
    return { situacao: "concluido", indiceAtual: 4, indiceAlcancado: 4, etapaAtual: "Fechado — ganho", proximaEtapa: null };
  }
  if (estagio === "fechado_perdido") {
    const alcancado = estagiosAlcancados
      .map(indiceComercial)
      .filter((n) => n >= 0 && n < 4)
      .reduce((max, n) => Math.max(max, n), -1);
    return { situacao: "perdido", indiceAtual: 4, indiceAlcancado: alcancado, etapaAtual: "Fechado — perdido", proximaEtapa: null };
  }
  return {
    situacao: "andamento",
    indiceAtual: i,
    indiceAlcancado: i,
    etapaAtual: ETAPAS_COMERCIAL[i],
    proximaEtapa: ETAPAS_COMERCIAL[i + 1] ?? null,
  };
}

// A coluna estagio_entrega nasce com default "roteiro_elaboracao" para todo
// cliente, então o valor sozinho não prova que a execução começou.
// Consideramos iniciada só quando há registro: a etapa já avançou ou existe
// alguma mudança de etapa de execução gravada. (Até 22/out/2026 um negócio
// ganho contava como iniciado automaticamente; agora fica "Aguardando
// início" até a equipe registrar o começo — Visão geral separa os dois.)
export function execucaoIniciada(estagioEntrega: EstagioEntrega, temHistoricoExecucao: boolean): boolean {
  return estagioEntrega !== "roteiro_elaboracao" || temHistoricoExecucao;
}

export function resumoExecucao(estagioEntrega: EstagioEntrega, iniciada: boolean): ResumoProcesso {
  if (!iniciada) {
    return { situacao: "aguardando", indiceAtual: -1, indiceAlcancado: -1, etapaAtual: "Aguardando início", proximaEtapa: ETAPAS_EXECUCAO[0] };
  }
  const i = INDICE_EXECUCAO[estagioEntrega] ?? 0;
  if (estagioEntrega === "concluida") {
    return { situacao: "concluido", indiceAtual: 4, indiceAlcancado: 4, etapaAtual: "Concluída", proximaEtapa: null };
  }
  return {
    situacao: "andamento",
    indiceAtual: i,
    indiceAlcancado: i,
    etapaAtual: ETAPAS_EXECUCAO[i],
    proximaEtapa: ETAPAS_EXECUCAO[i + 1] ?? null,
  };
}

// Datas: data_evento vem como "AAAA-MM-DD" (sem hora). new Date() leria como
// UTC e mostraria o dia anterior no horário de Brasília — por isso o
// tratamento separado.
export function formatarDataCurta(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1].slice(2)}`;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Sao_Paulo" });
}
