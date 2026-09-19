import type { EstagioEntrega } from "./types";

// Fluxo de ENTREGA do serviço — pedido do Wilson, 19/set/2026 ("um novo
// fluxograma de entrega abaixo do de vendas"), taxonomia confirmada por ele
// (Roteiro em Elaboração → Roteiro Entregue → Reservas Confirmadas → Viagem
// em Andamento → Concluída). Paralelo ao funil de vendas (Estagio, em
// lib/crm/estagios.ts) — ver o comentário em lib/crm/types.ts.
export const ESTAGIOS_ENTREGA: { valor: EstagioEntrega; label: string }[] = [
  { valor: "roteiro_elaboracao", label: "Roteiro em Elaboração" },
  { valor: "roteiro_entregue", label: "Roteiro Entregue" },
  { valor: "reservas_confirmadas", label: "Reservas Confirmadas" },
  { valor: "viagem_andamento", label: "Viagem em Andamento" },
  { valor: "concluida", label: "Concluída" },
];

export const ESTAGIO_ENTREGA_LABEL: Record<EstagioEntrega, string> = ESTAGIOS_ENTREGA.reduce(
  (acc, e) => ({ ...acc, [e.valor]: e.label }),
  {} as Record<EstagioEntrega, string>,
);

export function isEstagioEntrega(valor: string): valor is EstagioEntrega {
  return ESTAGIOS_ENTREGA.some((e) => e.valor === valor);
}
