// Tag de origem dos leads registrados automaticamente pela calculadora pública
// (/viagem_personalizada_selfservice). Gravada no início de `clientes.origem`
// — sem migração de banco — e exibida como selo no CRM.
export const TAG_SELF_SERVICE = "SELF-SERVICE";

export function ehSelfService(origem: string | null | undefined) {
  return !!origem && origem.toUpperCase().startsWith(TAG_SELF_SERVICE);
}
