// Tag de origem dos leads registrados automaticamente pela calculadora pública
// (/viagem_personalizada_selfservice). Gravada no início de `clientes.origem`
// — sem migração de banco — e exibida como selo no CRM.
export const TAG_SELF_SERVICE = "SELF-SERVICE";

export function ehSelfService(origem: string | null | undefined) {
  return !!origem && origem.toUpperCase().startsWith(TAG_SELF_SERVICE);
}

// Registro de teste com identificação explícita: a página de pagamento de
// teste (app/api/pagamento-teste) grava a origem "TESTE — pagamento R$ 1…".
// Nunca deduzir teste pelo nome do cliente.
export function ehRegistroTeste(origem: string | null | undefined) {
  return /^TESTE\s*—/i.test(origem ?? "");
}
