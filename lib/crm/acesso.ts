import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { isPapelCrm, isUnidadeCrm, type PapelCrm, type UnidadeCrm } from "./unidades";
import { lerPermissoes, type Permissoes } from "./permissoes";

// Quem está logado no CRM e o que pode ver (Wilson, 21/out/2026).
// O papel vem de perfis.papel (migração 021). Quem não tem papel não
// acessa nada.

export type ParceiroAcesso = { id: string; nome: string; slug: string; tipo: "agencia" | "empreiteira"; ativo: boolean };
export type Acesso = {
  userId: string;
  email: string;
  nome: string;
  papel: PapelCrm | null;
  parceiro: ParceiroAcesso | null;
  /** Só para consultor (migração 030); null para os demais papéis. */
  permissoes: Permissoes | null;
  cargo: string | null;
};

export async function obterAcesso(): Promise<Acesso | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Lido com service role para não depender de RLS na própria leitura.
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const papel = isPapelCrm(perfil?.papel) ? perfil!.papel : null;
  let parceiro: ParceiroAcesso | null = null;
  if (perfil?.parceiro_id) {
    const { data } = await admin
      .from("parceiros")
      .select("id, nome, slug, tipo, ativo")
      .eq("id", perfil.parceiro_id)
      .maybeSingle();
    if (data) parceiro = data as ParceiroAcesso;
  }

  return {
    userId: user.id,
    email: user.email ?? perfil?.email ?? "",
    nome: perfil?.nome || user.email || "",
    papel,
    parceiro,
    permissoes: papel === "consultor" ? lerPermissoes(perfil?.permissoes) : null,
    cargo: (perfil?.cargo as string | null) ?? null,
  };
}

/** Admin ou consultor — a equipe interna. */
export const ehEquipe = (a: Acesso | null | undefined) => a?.papel === "admin" || a?.papel === "consultor";

async function unidadeAtual(): Promise<UnidadeCrm> {
  const h = (await headers()).get("x-crm-unidade");
  return isUnidadeCrm(h) ? h : "agencia";
}

/** Consultor pode abrir este CRM? (admin sempre pode) */
export function podeCrm(a: Acesso, unidade: UnidadeCrm) {
  return a.papel === "admin" || (a.papel === "consultor" && !!a.permissoes?.crms.includes(unidade));
}

/** Para páginas, layouts e route handlers da equipe. Consultor entra se o
 * CRM da página (header x-crm-unidade, do proxy) estiver liberado para ele. */
export async function exigirAdmin(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  if (acesso.papel === "admin") return acesso;
  if (acesso.papel === "consultor" && podeCrm(acesso, await unidadeAtual())) return acesso;
  redirect("/crm/sem-acesso");
}

/** Só administradores (ex.: Acessos). */
export async function exigirSomenteAdmin(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  if (acesso.papel !== "admin") redirect("/crm/sem-acesso");
  return acesso;
}

/** Para server actions que ALTERAM dados: admin, ou consultor com "editar"
 * (ou "deletar", quando `deletar`). Lança erro em vez de redirecionar. */
export async function garantirAdmin(opcoes: { deletar?: boolean } = {}): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (acesso?.papel === "admin") return acesso;
  if (acesso?.papel === "consultor" && acesso.permissoes) {
    const ok = opcoes.deletar ? acesso.permissoes.deletar : acesso.permissoes.editar;
    if (ok) return acesso;
    throw new Error(opcoes.deletar ? "Seu acesso não permite excluir." : "Seu acesso é somente leitura.");
  }
  throw new Error("Acesso negado.");
}

/** Leitura da equipe (admin ou consultor), para actions que não alteram dados. */
export async function garantirEquipe(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!ehEquipe(acesso)) throw new Error("Acesso negado.");
  return acesso!;
}

/** Só administradores, em server actions (Acessos). */
export async function garantirSomenteAdmin(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (acesso?.papel !== "admin") throw new Error("Acesso negado.");
  return acesso;
}

/** Portal do parceiro: exige papel + parceiro ativo do tipo certo. */
export async function exigirParceiro(tipo: "agencia" | "empreiteira"): Promise<Acesso & { parceiro: ParceiroAcesso }> {
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  const papelEsperado = tipo === "agencia" ? "parceiro_agencia" : "empreiteira";
  if (acesso.papel !== papelEsperado || !acesso.parceiro || acesso.parceiro.tipo !== tipo || !acesso.parceiro.ativo) {
    redirect("/crm/sem-acesso");
  }
  return acesso as Acesso & { parceiro: ParceiroAcesso };
}

/** Portal do despachante (Documentação) — Wilson, 29/out/2026. */
export async function exigirDespachante(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  if (acesso.papel !== "despachante") redirect("/crm/sem-acesso");
  return acesso;
}
