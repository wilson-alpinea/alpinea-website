// CRM de Câmbio (Wilson, 29/out/2026). Os pedidos vêm do formulário
// /produtos/cambio e ficam em `clientes` com produto_secundario ["cambio"].
// A direção (compra × venda de ienes) está no resumo gravado em observações.
export type DirecaoCambio = "compra" | "venda";
export const direcaoCambio = (obs: string | null | undefined): DirecaoCambio => (/Venda de ienes/i.test(obs ?? "") ? "venda" : "compra");
export const DIRECAO_LABEL: Record<DirecaoCambio, string> = { compra: "Compra de ienes", venda: "Venda de ienes" };

/** Primeiro valor em ienes citado no resumo (ex.: "¥ 100.000" ou "100.000 ienes"). */
export function ienesDoResumo(obs: string | null | undefined): number | null {
  const m = (obs ?? "").match(/(?:¥|JPY)\s*([\d.,]+)|([\d.,]+)\s*(?:ienes|JPY)/i);
  const bruto = m?.[1] ?? m?.[2];
  if (!bruto) return null;
  const n = Number(bruto.replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Valor de uma linha "Rótulo: valor" do resumo. */
export function campoResumo(obs: string | null | undefined, rotulo: string): string | null {
  const linha = (obs ?? "").split("\n").find((l) => l.toLowerCase().startsWith(`${rotulo.toLowerCase()}:`));
  return linha ? linha.slice(rotulo.length + 1).trim() || null : null;
}
