"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { SLUG_PARCEIRO, isPapelCrm } from "@/lib/crm/unidades";

// Gestão de acessos do CRM (Wilson, 21/out/2026): parceiros da agência,
// empreiteiras, usuários e vagas de cada empreiteira. Só admin. Usa service
// role porque mexe em auth.users e em perfis.

export type ResultadoAcesso = { ok: boolean; mensagem: string; senha?: string; email?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function gerarSenha() {
  // 14 caracteres sem ambíguos (0/O, 1/l/I).
  const alfabeto = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(14);
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

function slugDe(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

function revalidar() {
  revalidatePath("/crm/acessos");
}

export async function criarParceiro(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  await garantirAdmin();
  const nome = String(formData.get("nome") || "").trim().slice(0, 120);
  const tipo = String(formData.get("tipo") || "");
  if (nome.length < 2) return { ok: false, mensagem: "Informe o nome." };
  if (tipo !== "agencia" && tipo !== "empreiteira") return { ok: false, mensagem: "Escolha o tipo." };
  let slug = slugDe(String(formData.get("slug") || "") || nome);
  if (!SLUG_PARCEIRO.test(slug)) return { ok: false, mensagem: "Código do link inválido (use letras, números e hífen)." };

  const admin = createAdminClient();
  const { data: existe } = await admin.from("parceiros").select("id").eq("slug", slug).maybeSingle();
  if (existe) slug = `${slug.slice(0, 34)}-${randomBytes(2).toString("hex")}`;
  const { error } = await admin.from("parceiros").insert({ nome, tipo, slug });
  if (error) {
    console.error("Erro ao criar parceiro:", error);
    return { ok: false, mensagem: "Não foi possível salvar." };
  }
  revalidar();
  return { ok: true, mensagem: `${tipo === "agencia" ? "Parceiro" : "Empreiteira"} "${nome}" cadastrado.` };
}

export async function alternarParceiroAtivo(parceiroId: string, ativo: boolean) {
  await garantirAdmin();
  if (!UUID.test(parceiroId)) return;
  const { error } = await createAdminClient().from("parceiros").update({ ativo }).eq("id", parceiroId);
  if (error) console.error("Erro ao alterar parceiro:", error);
  revalidar();
}

function validarPapel(papelBruto: string, parceiroBruto: string, tipos: Map<string, string>) {
  const papel = papelBruto === "sem_acesso" ? null : isPapelCrm(papelBruto) ? papelBruto : undefined;
  if (papel === undefined) return { erro: "Escolha o tipo de acesso." } as const;
  if (papel === "admin" || papel === null) return { papel, parceiroId: null } as const;
  const esperado = papel === "parceiro_agencia" ? "agencia" : "empreiteira";
  if (!UUID.test(parceiroBruto) || tipos.get(parceiroBruto) !== esperado) {
    return { erro: papel === "parceiro_agencia" ? "Escolha o parceiro da agência." : "Escolha a empreiteira." } as const;
  }
  return { papel, parceiroId: parceiroBruto } as const;
}

async function tiposParceiros() {
  const { data } = await createAdminClient().from("parceiros").select("id, tipo");
  return new Map((data ?? []).map((p) => [p.id as string, p.tipo as string]));
}

export async function criarUsuario(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  await garantirAdmin();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim().slice(0, 120);
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, mensagem: "E-mail inválido." };
  const v = validarPapel(String(formData.get("papel") || ""), String(formData.get("parceiro_id") || ""), await tiposParceiros());
  if ("erro" in v) return { ok: false, mensagem: v.erro! };

  const admin = createAdminClient();
  const senha = gerarSenha();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: nome || undefined },
  });
  if (error || !data.user) {
    const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, mensagem: jaExiste ? "Já existe um usuário com esse e-mail — altere o acesso dele na lista abaixo." : "Não foi possível criar o usuário." };
  }
  const { error: erroPerfil } = await admin
    .from("perfis")
    .upsert({ id: data.user.id, email, nome: nome || email.split("@")[0], papel: v.papel, parceiro_id: v.parceiroId }, { onConflict: "id" });
  if (erroPerfil) {
    console.error("Erro ao gravar perfil:", erroPerfil);
    return { ok: false, mensagem: "Usuário criado, mas não foi possível definir o acesso. Ajuste na lista abaixo." };
  }
  revalidar();
  return { ok: true, mensagem: "Usuário criado. Envie o e-mail e a senha abaixo para a pessoa — a senha não aparece de novo.", senha, email };
}

export async function alterarAcessoUsuario(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  const acesso = await garantirAdmin();
  const userId = String(formData.get("user_id") || "");
  if (!UUID.test(userId)) return { ok: false, mensagem: "Usuário inválido." };
  if (userId === acesso.userId) return { ok: false, mensagem: "Você não pode alterar o seu próprio acesso." };
  const v = validarPapel(String(formData.get("papel") || ""), String(formData.get("parceiro_id") || ""), await tiposParceiros());
  if ("erro" in v) return { ok: false, mensagem: v.erro! };
  const { error } = await createAdminClient().from("perfis").update({ papel: v.papel, parceiro_id: v.parceiroId }).eq("id", userId);
  if (error) {
    console.error("Erro ao alterar acesso:", error);
    return { ok: false, mensagem: "Não foi possível salvar." };
  }
  revalidar();
  return { ok: true, mensagem: "Acesso atualizado." };
}

export async function redefinirSenhaUsuario(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  const acesso = await garantirAdmin();
  const userId = String(formData.get("user_id") || "");
  if (!UUID.test(userId)) return { ok: false, mensagem: "Usuário inválido." };
  if (userId === acesso.userId) return { ok: false, mensagem: "Troque a sua própria senha pelo Supabase." };
  const senha = gerarSenha();
  const { data, error } = await createAdminClient().auth.admin.updateUserById(userId, { password: senha });
  if (error) return { ok: false, mensagem: "Não foi possível redefinir a senha." };
  return { ok: true, mensagem: "Nova senha gerada — ela não aparece de novo.", senha, email: data.user?.email ?? undefined };
}

export async function definirEmpreiteiraDaVaga(vagaId: string, parceiroId: string | null): Promise<{ ok: boolean }> {
  await garantirAdmin();
  const { VAGAS } = await import("@/app/lib/vagasCatalogo");
  if (!VAGAS.some((v) => v.id === vagaId)) return { ok: false };
  const admin = createAdminClient();
  if (!parceiroId) {
    const { error } = await admin.from("vagas_empreiteira").delete().eq("vaga_id", vagaId);
    revalidar();
    return { ok: !error };
  }
  if (!UUID.test(parceiroId) || (await tiposParceiros()).get(parceiroId) !== "empreiteira") return { ok: false };
  const { error } = await admin
    .from("vagas_empreiteira")
    .upsert({ vaga_id: vagaId, parceiro_id: parceiroId, updated_at: new Date().toISOString() }, { onConflict: "vaga_id" });
  if (error) console.error("Erro ao vincular vaga:", error);
  revalidar();
  return { ok: !error };
}
