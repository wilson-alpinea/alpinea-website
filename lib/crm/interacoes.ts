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
  mudanca_estagio_entrega: "Mudança de etapa da execução",
  // Gerado automaticamente quando um cliente externo preenche e envia a
  // calculadora self-service (ver app/api/viagem-personalizada-selfservice).
  simulacao: "Simulação (self-service)",
  // Gerado automaticamente quando o gateway de pagamento (Pagar.me)
  // confirma que um pedido self-checkout foi pago (ver
  // app/api/webhooks/pagarme).
  pagamento: "Pagamento confirmado",
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
  mudanca_estagio: "#24476B",
  mudanca_estagio_entrega: "#28665D",
  simulacao: "#6ec3d9",
  pagamento: "#279E52",
};

// Destaque das mudanças de etapa no Histórico (Wilson, 22/out/2026): fundo
// suave + borda na cor do processo (mesmas cores dos cards Comercial e
// Execução da viagem), para não se perderem entre notas e mensagens.
export const DESTAQUE_INTERACAO: Record<string, { fundo: string; borda: string }> = {
  mudanca_estagio: { fundo: "#EAF1F8", borda: "#24476B" },
  mudanca_estagio_entrega: { fundo: "#E6F2EF", borda: "#28665D" },
};
