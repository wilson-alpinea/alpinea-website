// Permissões do perfil Consultor (Wilson, 29/out/2026) — migração 030.
// Sem dependências de servidor (usado no proxy, nas telas e nas actions).
import { PRODUTOS_PRINCIPAIS } from "./produtos";
import { isUnidadeCrm, type UnidadeCrm } from "./unidades";

export type Permissoes = {
  crms: UnidadeCrm[];
  /** Produtos visíveis por CRM. Ausente ou vazio = todos. */
  produtos: Partial<Record<UnidadeCrm, string[]>>;
  editar: boolean;
  deletar: boolean;
};

/** Produtos que dá para restringir em cada CRM (nível 3). */
export const PRODUTOS_POR_CRM: Partial<Record<UnidadeCrm, { valor: string; label: string }[]>> = {
  agencia: PRODUTOS_PRINCIPAIS.map((p) => ({ valor: p.valor, label: p.label })),
  documentacao: [
    { valor: "visto", label: "Visto específico" },
    { valor: "elegibilidade", label: "Certificado de Elegibilidade" },
    { valor: "pet", label: "Exportação de pet" },
  ],
};

export const PERMISSOES_VAZIAS: Permissoes = { crms: [], produtos: {}, editar: false, deletar: false };

export function lerPermissoes(v: unknown): Permissoes {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Permissoes>;
  const crms = Array.isArray(o.crms) ? o.crms.filter(isUnidadeCrm) : [];
  const produtos: Permissoes["produtos"] = {};
  if (o.produtos && typeof o.produtos === "object") {
    for (const [k, lista] of Object.entries(o.produtos)) {
      const validos = PRODUTOS_POR_CRM[k as UnidadeCrm]?.map((p) => p.valor) ?? [];
      if (isUnidadeCrm(k) && Array.isArray(lista)) produtos[k] = lista.filter((x) => validos.includes(String(x))).map(String);
    }
  }
  const deletar = Boolean(o.deletar);
  return { crms, produtos, editar: Boolean(o.editar) || deletar, deletar };
}

/** Produto `valor` visível no CRM? (null/undefined = item sem produto → visível) */
export function produtoVisivel(p: Permissoes | null, crm: UnidadeCrm, valor: string | null | undefined): boolean {
  if (!p) return true; // admin
  const lista = p.produtos[crm];
  if (!lista || lista.length === 0) return true;
  return !!valor && lista.includes(valor);
}

export function resumoPermissoes(p: Permissoes, rotuloCrm: (u: UnidadeCrm) => string): string {
  const acoes = p.deletar ? "ver, editar e deletar" : p.editar ? "ver e editar" : "somente ver";
  const crms = p.crms.length ? p.crms.map((u) => {
    const prods = p.produtos[u];
    const nomes = prods?.length ? ` (${prods.map((v) => PRODUTOS_POR_CRM[u]?.find((x) => x.valor === v)?.label ?? v).join(", ")})` : "";
    return `${rotuloCrm(u)}${nomes}`;
  }).join(" · ") : "nenhum CRM";
  return `${crms} — ${acoes}`;
}
