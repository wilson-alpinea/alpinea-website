export type TipoPagamento =
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia"
  | "boleto"
  | "dinheiro"
  | "outro";

export const TIPOS_PAGAMENTO: { valor: TipoPagamento; label: string }[] = [
  { valor: "pix", label: "Pix" },
  { valor: "cartao_credito", label: "Cartão de crédito" },
  { valor: "cartao_debito", label: "Cartão de débito" },
  { valor: "transferencia", label: "Transferência" },
  { valor: "boleto", label: "Boleto" },
  { valor: "dinheiro", label: "Dinheiro" },
  { valor: "outro", label: "Outro" },
];

export const TIPO_PAGAMENTO_LABEL: Record<TipoPagamento, string> = TIPOS_PAGAMENTO.reduce(
  (acc, t) => ({ ...acc, [t.valor]: t.label }),
  {} as Record<TipoPagamento, string>,
);

export function isTipoPagamento(valor: string): valor is TipoPagamento {
  return TIPOS_PAGAMENTO.some((t) => t.valor === valor);
}

export type StatusPagamento = "pendente" | "pago" | "atrasado" | "cancelado";

export const STATUS_PAGAMENTO: { valor: StatusPagamento; label: string }[] = [
  { valor: "pendente", label: "Pendente" },
  { valor: "pago", label: "Pago" },
  { valor: "atrasado", label: "Atrasado" },
  { valor: "cancelado", label: "Cancelado" },
];

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = STATUS_PAGAMENTO.reduce(
  (acc, s) => ({ ...acc, [s.valor]: s.label }),
  {} as Record<StatusPagamento, string>,
);

// Sempre hex de 6 dígitos — o card de pagamento soma um sufixo de alpha,
// mesmo padrão usado em TIPO_INTERACAO_COR.
export const STATUS_PAGAMENTO_COR: Record<StatusPagamento, string> = {
  pendente: "#C97A3A",
  pago: "#279E52",
  atrasado: "#C0392B",
  cancelado: "#57534E",
};

export function isStatusPagamento(valor: string): valor is StatusPagamento {
  return STATUS_PAGAMENTO.some((s) => s.valor === valor);
}
