export const TIPOS_INTERACAO: { valor: string; label: string }[] = [
  { valor: "nota", label: "Nota interna" },
  { valor: "ligacao", label: "Ligação" },
  { valor: "whatsapp", label: "WhatsApp" },
  { valor: "email", label: "E-mail" },
  { valor: "reuniao", label: "Reunião" },
  { valor: "proposta", label: "Proposta enviada" },
];

export const TIPO_INTERACAO_LABEL: Record<string, string> = TIPOS_INTERACAO.reduce(
  (acc, t) => ({ ...acc, [t.valor]: t.label }),
  {} as Record<string, string>,
);
