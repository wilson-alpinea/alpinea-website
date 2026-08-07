// Tipos selecionáveis manualmente no formulário "Nova interação".
export const TIPOS_INTERACAO: { valor: string; label: string }[] = [
  { valor: "nota", label: "Nota interna" },
  { valor: "ligacao", label: "Ligação" },
  { valor: "whatsapp", label: "WhatsApp" },
  { valor: "email", label: "E-mail" },
  { valor: "reuniao", label: "Reunião" },
  { valor: "proposta", label: "Proposta enviada" },
];

// Todos os tipos possíveis no histórico, incluindo os gerados
// automaticamente pelo sistema (mudança de estágio).
export const TIPO_INTERACAO_LABEL: Record<string, string> = {
  nota: "Nota interna",
  ligacao: "Ligação",
  whatsapp: "WhatsApp",
  email: "E-mail",
  reuniao: "Reunião",
  proposta: "Proposta enviada",
  mudanca_estagio: "Mudança de estágio",
};

// Cor por tipo de interação — usada no ícone e no rótulo do histórico.
// Sempre hex de 6 dígitos (o card do histórico soma um sufixo de alpha).
export const TIPO_INTERACAO_COR: Record<string, string> = {
  nota: "#57534E",
  ligacao: "#2f5aa8",
  whatsapp: "#279E52",
  email: "#C97A3A",
  reuniao: "#7c4fd1",
  proposta: "#1F8A8C",
  mudanca_estagio: "#1C3A5E",
};
