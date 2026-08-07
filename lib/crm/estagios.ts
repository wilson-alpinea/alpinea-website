import type { Estagio } from "./types";

// Ordem do funil e metadados de exibição de cada estágio — usado no
// dashboard, no pipeline (kanban) e na ficha do cliente.
export const ESTAGIOS: { valor: Estagio; label: string }[] = [
  { valor: "novo_lead", label: "Novo Lead" },
  { valor: "qualificacao", label: "Qualificação" },
  { valor: "proposta_enviada", label: "Proposta Enviada" },
  { valor: "negociacao", label: "Em Negociação" },
  { valor: "fechado_ganho", label: "Fechado — Ganho" },
  { valor: "fechado_perdido", label: "Fechado — Perdido" },
];

export const ESTAGIO_LABEL: Record<Estagio, string> = ESTAGIOS.reduce(
  (acc, e) => ({ ...acc, [e.valor]: e.label }),
  {} as Record<Estagio, string>,
);

// Cor sutil por estágio — tons compatíveis com fundo claro (identidade
// branca dos painéis de roteiro: azul #2f5aa8, roxo #7c4fd1).
export const ESTAGIO_COR: Record<Estagio, string> = {
  novo_lead: "rgba(0,0,0,0.35)",
  qualificacao: "#2f5aa8",
  proposta_enviada: "#7c4fd1",
  negociacao: "#C9A03A",
  fechado_ganho: "rgba(58,140,90,0.9)",
  fechado_perdido: "rgba(190,70,70,0.8)",
};

export function isEstagio(valor: string): valor is Estagio {
  return ESTAGIOS.some((e) => e.valor === valor);
}
