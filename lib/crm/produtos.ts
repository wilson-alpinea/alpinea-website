export type ProdutoPrincipal =
  | "roteiro_personalizado"
  | "revisao_roteiro"
  | "caravana"
  | "semi_full_service"
  | "full_service";

export const PRODUTOS_PRINCIPAIS: { valor: ProdutoPrincipal; label: string; detalhe?: string }[] = [
  { valor: "roteiro_personalizado", label: "Roteiro Personalizado" },
  { valor: "revisao_roteiro", label: "Revisão de Roteiro" },
  { valor: "caravana", label: "Caravana", detalhe: "Aéreo + Hotel + Guia" },
  { valor: "semi_full_service", label: "Semi-Full Service", detalhe: "Aéreo sem Hotel, por exemplo" },
  { valor: "full_service", label: "Full-Service", detalhe: "Aéreo + Hotel + Roteiro" },
];

export const PRODUTO_PRINCIPAL_LABEL: Record<ProdutoPrincipal, string> = PRODUTOS_PRINCIPAIS.reduce(
  (acc, p) => ({ ...acc, [p.valor]: p.label }),
  {} as Record<ProdutoPrincipal, string>,
);

export type ProdutoSecundario =
  | "jr_pass"
  | "seguro_viagem"
  | "guia"
  | "motorista_particular"
  | "reserva_restaurantes"
  | "acompanhamento_restaurantes"
  | "acompanhamento_compras";

export const PRODUTOS_SECUNDARIOS: { valor: ProdutoSecundario; label: string }[] = [
  { valor: "jr_pass", label: "JR Pass" },
  { valor: "seguro_viagem", label: "Seguro Viagem" },
  { valor: "guia", label: "Guia" },
  { valor: "motorista_particular", label: "Motorista Particular" },
  { valor: "reserva_restaurantes", label: "Reserva de Restaurantes" },
  { valor: "acompanhamento_restaurantes", label: "Acompanhamento Presencial Restaurantes" },
  { valor: "acompanhamento_compras", label: "Acompanhamento Presencial Compras" },
];

export function isProdutoPrincipal(valor: string): valor is ProdutoPrincipal {
  return PRODUTOS_PRINCIPAIS.some((p) => p.valor === valor);
}

export function isProdutoSecundario(valor: string): valor is ProdutoSecundario {
  return PRODUTOS_SECUNDARIOS.some((p) => p.valor === valor);
}
