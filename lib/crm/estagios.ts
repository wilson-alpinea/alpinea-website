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

// Cor sutil por estágio, coerente com a paleta neutra do site (sem gold).
export const ESTAGIO_COR: Record<Estagio, string> = {
  novo_lead: "rgba(255,255,255,0.4)",
  qualificacao: "rgba(118,150,168,0.9)",
  proposta_enviada: "rgba(196,148,110,0.9)",
  negociacao: "rgba(224,168,88,0.9)",
  fechado_ganho: "rgba(122,178,120,0.9)",
  fechado_perdido: "rgba(200,90,90,0.7)",
};

export function isEstagio(valor: string): valor is Estagio {
  return ESTAGIOS.some((e) => e.valor === valor);
}
