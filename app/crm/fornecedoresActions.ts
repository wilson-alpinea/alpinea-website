"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { garantirAdmin } from "@/lib/crm/acesso";
import { isCategoriaFornecedor } from "@/lib/crm/fornecedores";

// Cadastro/edição de fornecedor (redesenho, 23/out/2026). Mesmos campos e
// regras de antes (só o nome é obrigatório), agora devolvendo o resultado
// para o formulário mostrar erros junto ao campo — usado no painel lateral
// da lista e nas páginas /novo e /[id]. Fornecedor NÃO recebe acesso ao CRM.

export type ResultadoFornecedor = { ok: boolean; mensagem: string; campo?: string; id?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const texto = (v: FormDataEntryValue | null, max = 300) => {
  const t = String(v ?? "").trim().slice(0, max);
  return t || null;
};

export async function salvarFornecedor(_: ResultadoFornecedor | null, formData: FormData): Promise<ResultadoFornecedor> {
  await garantirAdmin();
  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim().slice(0, 160);
  if (!nome) return { ok: false, mensagem: "Informe o nome do fornecedor.", campo: "nome" };
  const email = texto(formData.get("email"), 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, mensagem: "Informe um e-mail válido ou deixe em branco.", campo: "email" };
  const telefone = texto(formData.get("telefone"), 60);
  if (telefone && !/\d{6,}/.test(telefone.replace(/\D/g, ""))) {
    return { ok: false, mensagem: "O telefone parece incompleto. Inclua o código do país quando não for do Brasil (ex.: +81).", campo: "telefone" };
  }
  const categoriaBruta = String(formData.get("categoria") || "").trim();
  const dados = {
    nome,
    categoria: isCategoriaFornecedor(categoriaBruta) ? categoriaBruta : null,
    contato_nome: texto(formData.get("contato_nome"), 160),
    email,
    telefone,
    cidade: texto(formData.get("cidade"), 120),
    observacoes: texto(formData.get("observacoes"), 4000),
  };

  const supabase = await createClient();
  if (id) {
    if (!UUID.test(id)) return { ok: false, mensagem: "Fornecedor inválido." };
    const { error } = await supabase.from("fornecedores").update(dados).eq("id", id);
    if (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      return { ok: false, mensagem: "Não foi possível salvar as alterações." };
    }
    revalidatePath("/crm/fornecedores");
    revalidatePath(`/crm/fornecedores/${id}`);
    return { ok: true, mensagem: "Fornecedor atualizado.", id };
  }
  const { data, error } = await supabase.from("fornecedores").insert(dados).select("id").single();
  if (error || !data) {
    console.error("Erro ao criar fornecedor:", error);
    return { ok: false, mensagem: "Não foi possível salvar o fornecedor." };
  }
  revalidatePath("/crm/fornecedores");
  return { ok: true, mensagem: `Fornecedor "${nome}" cadastrado.`, id: data.id };
}
