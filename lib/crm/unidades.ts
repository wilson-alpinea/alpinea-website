// Unidades de negócio do CRM (Wilson, 21/out/2026): "1 CRM somente agência
// de viagens e 1 somente para empregos", cada um com URL própria.
// Sem dependências de servidor — usado também pelo proxy.ts.

// + Seguro Viagem (Wilson, 26/out/2026): terceiro CRM, seguro.alpinea.io.
// + Documentação (Wilson, 29/out/2026): quarto CRM, documentos.alpinea.io —
//   visto específico, Certificado de Elegibilidade e exportação de pet.
export type UnidadeCrm = "agencia" | "empregos" | "seguro" | "documentacao";
export const UNIDADES_CRM: UnidadeCrm[] = ["agencia", "empregos", "seguro", "documentacao"];
export const UNIDADE_LABEL: Record<UnidadeCrm, string> = { agencia: "Agência", empregos: "Empregos", seguro: "Seguro Viagem", documentacao: "Documentação" };
/** Rótulo curto no botão de troca de CRM do cabeçalho. */
export const UNIDADE_CURTO: Record<UnidadeCrm, string> = { agencia: "Agência", empregos: "Empregos", seguro: "Seguro", documentacao: "Documentos" };
/** Cor principal de cada CRM (botões de troca, cards de escolha). */
export const UNIDADE_COR: Record<UnidadeCrm, string> = { agencia: "#24476B", empregos: "#27675B", seguro: "#75608B", documentacao: "#8A5A3C" };
export const isUnidadeCrm = (v: unknown): v is UnidadeCrm => v === "agencia" || v === "empregos" || v === "seguro" || v === "documentacao";
export type PapelCrm = "admin" | "parceiro_agencia" | "empreiteira";

export const isPapelCrm = (v: unknown): v is PapelCrm =>
  v === "admin" || v === "parceiro_agencia" || v === "empreiteira";

export const PAPEL_LABEL: Record<PapelCrm, string> = {
  admin: "Admin (equipe)",
  parceiro_agencia: "Parceiro da agência",
  empreiteira: "Empreiteira",
};

// Domínios de cada CRM. Podem ser trocados por variável de ambiente sem
// mexer no código. O CRM continua acessível em alpinea.io/crm (admin).
export const HOST_AGENCIA = (process.env.CRM_HOST_AGENCIA || "crm.alpinea.io").toLowerCase();
export const HOST_EMPREGOS = (process.env.CRM_HOST_EMPREGOS || "empregos.alpinea.io").toLowerCase();
export const HOST_SEGURO = (process.env.CRM_HOST_SEGURO || "seguro.alpinea.io").toLowerCase();
export const HOST_DOCUMENTACAO = (process.env.CRM_HOST_DOCUMENTACAO || "documentos.alpinea.io").toLowerCase();
export const HOST_UNIDADE: Record<UnidadeCrm, string> = { agencia: HOST_AGENCIA, empregos: HOST_EMPREGOS, seguro: HOST_SEGURO, documentacao: HOST_DOCUMENTACAO };

export function unidadeDoHost(host: string | null | undefined): UnidadeCrm | null {
  const h = (host || "").toLowerCase().split(":")[0];
  if (h === HOST_AGENCIA) return "agencia";
  if (h === HOST_EMPREGOS) return "empregos";
  if (h === HOST_SEGURO) return "seguro";
  if (h === HOST_DOCUMENTACAO) return "documentacao";
  return null;
}

// Rotas compartilhadas (servem a todas as unidades).
const ROTAS_COMPARTILHADAS = ["/crm/login", "/crm/acessos", "/crm/sem-acesso", "/crm/unidades"];

export function unidadeDaRota(pathname: string): UnidadeCrm | "compartilhada" {
  if (ROTAS_COMPARTILHADAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return "compartilhada";
  if (pathname === "/crm/empregos" || pathname.startsWith("/crm/empregos/")) return "empregos";
  if (pathname === "/crm/empreiteira" || pathname.startsWith("/crm/empreiteira/")) return "empregos";
  if (pathname === "/crm/seguro" || pathname.startsWith("/crm/seguro/")) return "seguro";
  if (pathname === "/crm/documentacao" || pathname.startsWith("/crm/documentacao/")) return "documentacao";
  return "agencia";
}

export const INICIO_UNIDADE: Record<UnidadeCrm, string> = {
  agencia: "/crm",
  empregos: "/crm/empregos",
  seguro: "/crm/seguro",
  documentacao: "/crm/documentacao",
};

// Página inicial de cada papel.
export function inicioDoPapel(papel: PapelCrm | null, unidade: UnidadeCrm | null): string {
  if (papel === "parceiro_agencia") return "/crm/parceiro";
  if (papel === "empreiteira") return "/crm/empreiteira";
  // Admin no domínio principal (alpinea.io/crm) escolhe qual CRM abrir.
  if (papel === "admin") return unidade ? INICIO_UNIDADE[unidade] : "/crm/unidades";
  return "/crm/sem-acesso";
}

// Rotas que cada papel não-admin pode abrir (além de login/sem-acesso).
export function rotaPermitida(papel: PapelCrm | null, pathname: string): boolean {
  if (pathname === "/crm/login" || pathname === "/crm/sem-acesso") return true;
  if (papel === "admin") return true;
  const dentro = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (papel === "parceiro_agencia") return dentro("/crm/parceiro");
  if (papel === "empreiteira") return dentro("/crm/empreiteira");
  return false;
}

/** Endereço completo do início de cada CRM no domínio próprio. */
export function urlUnidade(unidade: UnidadeCrm): string {
  return `https://${HOST_UNIDADE[unidade]}${INICIO_UNIDADE[unidade]}`;
}

// Cookie do link de indicação (?parceiro=<slug>).
export const COOKIE_INDICACAO = "alpinea_parceiro";
export const SLUG_PARCEIRO = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
