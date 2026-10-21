import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPapelCrm, type PapelCrm } from "./unidades";

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
    .select("nome, email, papel, parceiro_id")
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
  };
}

/** Para páginas, layouts e route handlers da equipe. */
export async function exigirAdmin(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  if (acesso.papel !== "admin") redirect("/crm/sem-acesso");
  return acesso;
}

/** Para server actions: lança erro em vez de redirecionar. */
export async function garantirAdmin(): Promise<Acesso> {
  const acesso = await obterAcesso();
  if (!acesso || acesso.papel !== "admin") throw new Error("Acesso negado.");
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
