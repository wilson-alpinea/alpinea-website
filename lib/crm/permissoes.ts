// Permissões do perfil Consultor (Wilson, 29/out/2026) — migração 030.
// Sem dependências de servidor (usado no proxy, nas telas e nas actions).
import { PRODUTOS_PRINCIPAIS, PRODUTOS_SECUNDARIOS } from "./produtos";
import { isUnidadeCrm, type UnidadeCrm } from "./unidades";

export type Permissoes = {
  crms: UnidadeCrm[];
  /** Produtos visíveis por CRM. Ausente ou vazio = todos. */
  produtos: Partial<Record<UnidadeCrm, string[]>>;
  /** Pode criar registros novos (cliente, nota, arquivo), sem editar os existentes. */
  cadastrar: boolean;
  editar: boolean;
  deletar: boolean;
};

// Níveis de ação (Wilson, 29/out/2026: "SOMENTE CADASTRAR, SEM ACESSO DE EDIÇÃO / SOMENTE VISUALIZAR").
export const NIVEIS_ACAO = [
  { valor: "ver", label: "Somente visualizar" },
  { valor: "cadastrar", label: "Somente cadastrar (sem edição)" },
  { valor: "editar", label: "Cadastrar e editar" },
  { valor: "deletar", label: "Cadastrar, editar e deletar" },
] as const;
export type NivelAcao = (typeof NIVEIS_ACAO)[number]["valor"];
export const nivelDe = (p: Permissoes): NivelAcao => (p.deletar ? "deletar" : p.editar ? "editar" : p.cadastrar ? "cadastrar" : "ver");
export const acoesDoNivel = (n: string) => ({
  cadastrar: n === "cadastrar" || n === "editar" || n === "deletar",
  editar: n === "editar" || n === "deletar",
  deletar: n === "deletar",
});

/** Produtos que dá para restringir em cada CRM (nível 3). */
export const PRODUTOS_POR_CRM: Partial<Record<UnidadeCrm, { valor: string; label: string }[]>> = {
  agencia: PRODUTOS_PRINCIPAIS.map((p) => ({ valor: p.valor, label: p.label })),
  documentacao: [
    { valor: "visto", label: "Visto específico" },
    { valor: "elegibilidade", label: "Certificado de Elegibilidade" },
    { valor: "pet", label: "Exportação de pet" },
  ],
};

/** Todos os serviços de todos os CRMs, agrupados, para escolher o que o
 * parceiro/afiliado pode ver (Wilson, 29/out/2026: "todos os serviços de
 * todos os CRMs devem aparecer"). Os valores da Agência são os mesmos de
 * produto_principal/produto_secundario dos clientes; os de Documentação têm
 * prefixo doc_ para não colidir. */
const SECUNDARIOS = (v: string[]) => PRODUTOS_SECUNDARIOS.filter((p) => v.includes(p.valor)).map((p) => ({ valor: p.valor, label: p.label }));
export const PRODUTOS_PARCEIRO_GRUPOS: { unidade: UnidadeCrm; crm: string; produtos: { valor: string; label: string }[] }[] = [
  {
    unidade: "agencia",
    crm: "Viagens (Agência)",
    produtos: [
      ...PRODUTOS_PRINCIPAIS.map((p) => ({ valor: p.valor, label: p.label })),
      ...SECUNDARIOS(["passagem_aerea", "hoteis", "guia", "transporte_privado", "transfer_aeroporto_hotel", "jr_pass", "reserva_restaurantes", "ajisai_shopping"]),
    ],
  },
  { unidade: "seguro", crm: "Seguro Viagem & eSIM", produtos: SECUNDARIOS(["seguro_viagem", "esim"]) },
  { unidade: "cambio", crm: "Câmbio", produtos: SECUNDARIOS(["cambio"]) },
  {
    unidade: "documentacao",
    crm: "Documentação",
    produtos: [
      { valor: "doc_visto", label: "Visto específico" },
      { valor: "doc_elegibilidade", label: "Certificado de Elegibilidade" },
      { valor: "doc_pet", label: "Exportação de pet" },
    ],
  },
  { unidade: "empregos", crm: "Empregos", produtos: [{ valor: "empregos", label: "Vagas de emprego no Japão" }] },
];

/** Remuneração por produto (migração 032). */
export type RegraRemuneracao = { tipo: "percentual" | "fixo"; valor: number };
export type RemuneracaoProdutos = Record<string, RegraRemuneracao>;
export function lerRemuneracaoProdutos(v: unknown): RemuneracaoProdutos {
  const out: RemuneracaoProdutos = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, r] of Object.entries(v as Record<string, unknown>)) {
    const o = (r ?? {}) as { tipo?: unknown; valor?: unknown };
    const valor = Number(o.valor);
    if ((o.tipo === "percentual" || o.tipo === "fixo") && valor > 0) out[k] = { tipo: o.tipo, valor };
  }
  return out;
}

/** Unidades de negócio liberadas ao parceiro (empresa ou usuário). Vazio = todas. */
export function lerUnidadesParceiro(v: unknown): UnidadeCrm[] {
  return Array.isArray(v) ? v.filter(isUnidadeCrm) : [];
}

/** Lista do parceiro gravada em perfis.permissoes (usuário). */
export function lerAcessoUsuarioParceiro(v: unknown): { unidades: UnidadeCrm[]; produtos: string[] } {
  const o = (v && typeof v === "object" ? v : {}) as { crms?: unknown; produtosParceiro?: unknown; produtos?: { agencia?: unknown } };
  return { unidades: lerUnidadesParceiro(o.crms), produtos: lerProdutosParceiro(o.produtosParceiro ?? o.produtos?.agencia) };
}

/** Unidade liberada? (lista vazia = todas) */
export const unidadeLiberada = (unidades: UnidadeCrm[], u: UnidadeCrm) => unidades.length === 0 || unidades.includes(u);

/** Produtos liberados a um parceiro/afiliado (empresa ou usuário). Vazio = todos. */
export function lerProdutosParceiro(v: unknown): string[] {
  const validos = PRODUTOS_PARCEIRO_GRUPOS.flatMap((g) => g.produtos.map((p) => p.valor));
  return Array.isArray(v) ? v.map(String).filter((x) => validos.includes(x)) : [];
}

/** Interseção empresa × usuário (lista vazia = sem restrição naquele nível). */
export function produtosLiberadosParceiro(empresa: string[], usuario: string[]): string[] | null {
  if (!empresa.length && !usuario.length) return null;
  if (!empresa.length) return usuario;
  if (!usuario.length) return empresa;
  return empresa.filter((p) => usuario.includes(p));
}

export const PERMISSOES_VAZIAS: Permissoes = { crms: [], produtos: {}, cadastrar: false, editar: false, deletar: false };

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
  const editar = Boolean(o.editar) || deletar;
  return { crms, produtos, cadastrar: Boolean(o.cadastrar) || editar, editar, deletar };
}

/** Produto `valor` visível no CRM? (null/undefined = item sem produto → visível) */
export function produtoVisivel(p: Permissoes | null, crm: UnidadeCrm, valor: string | null | undefined): boolean {
  if (!p) return true; // admin
  const lista = p.produtos[crm];
  if (!lista || lista.length === 0) return true;
  return !!valor && lista.includes(valor);
}

export function resumoPermissoes(p: Permissoes, rotuloCrm: (u: UnidadeCrm) => string): string {
  const acoes = NIVEIS_ACAO.find((n) => n.valor === nivelDe(p))!.label.toLowerCase();
  const crms = p.crms.length ? p.crms.map((u) => {
    const prods = p.produtos[u];
    const nomes = prods?.length ? ` (${prods.map((v) => PRODUTOS_POR_CRM[u]?.find((x) => x.valor === v)?.label ?? v).join(", ")})` : "";
    return `${rotuloCrm(u)}${nomes}`;
  }).join(" · ") : "nenhum CRM";
  return `${crms} — ${acoes}`;
}
