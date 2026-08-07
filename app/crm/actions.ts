"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isEstagio } from "@/lib/crm/estagios";
import { isProdutoPrincipal, isProdutoSecundario } from "@/lib/crm/produtos";
import { isTipoArquivo } from "@/lib/crm/arquivos";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/crm/login");
}

function numeroOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  const numero = Number(texto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function textoOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

function produtoPrincipalOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return isProdutoPrincipal(texto) ? texto : null;
}

function produtosSecundarios(formData: FormData) {
  return formData
    .getAll("produto_secundario")
    .map((v) => String(v))
    .filter(isProdutoSecundario);
}

export async function createCliente(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) {
    redirect("/crm/clientes/novo?erro=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome,
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      origem: textoOuNull(formData.get("origem")),
      valor_proposta: numeroOuNull(formData.get("valor_proposta")),
      produto_principal: produtoPrincipalOuNull(formData.get("produto_principal")),
      produto_secundario: produtosSecundarios(formData),
      data_viagem: textoOuNull(formData.get("data_viagem")),
      estagio: "novo_lead",
      responsavel_id: user?.id ?? null,
      observacoes: textoOuNull(formData.get("observacoes")),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao criar cliente:", error);
    redirect("/crm/clientes/novo?erro=1");
  }

  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
  redirect(`/crm/clientes/${data.id}`);
}

export async function updateCliente(clienteId: string, formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const estagioBruto = String(formData.get("estagio") || "");

  const supabase = await createClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      nome: nome || undefined,
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      origem: textoOuNull(formData.get("origem")),
      valor_proposta: numeroOuNull(formData.get("valor_proposta")),
      produto_principal: produtoPrincipalOuNull(formData.get("produto_principal")),
      produto_secundario: produtosSecundarios(formData),
      data_viagem: textoOuNull(formData.get("data_viagem")),
      estagio: isEstagio(estagioBruto) ? estagioBruto : undefined,
      observacoes: textoOuNull(formData.get("observacoes")),
    })
    .eq("id", clienteId);

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    redirect(`/crm/clientes/${clienteId}?erro=1`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm");
  redirect(`/crm/clientes/${clienteId}`);
}

export async function moveEstagio(clienteId: string, formData: FormData) {
  const novoEstagio = String(formData.get("estagio") || "");
  if (!isEstagio(novoEstagio)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ estagio: novoEstagio })
    .eq("id", clienteId);

  if (error) {
    console.error("Erro ao mover estágio:", error);
  }

  revalidatePath("/crm/pipeline");
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
}

export async function addInteracao(clienteId: string, formData: FormData) {
  const conteudo = String(formData.get("conteudo") || "").trim();
  if (!conteudo) {
    redirect(`/crm/clientes/${clienteId}?erro=2`);
  }

  const tipo = String(formData.get("tipo") || "nota");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("interacoes").insert({
    cliente_id: clienteId,
    autor_id: user?.id ?? null,
    tipo,
    conteudo,
  });

  if (error) {
    console.error("Erro ao registrar interação:", error);
    redirect(`/crm/clientes/${clienteId}?erro=2`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  redirect(`/crm/clientes/${clienteId}`);
}

export async function deleteInteracao(clienteId: string, interacaoId: string, formData: FormData) {
  void formData;
  const supabase = await createClient();
  const { error } = await supabase.from("interacoes").delete().eq("id", interacaoId);

  if (error) {
    console.error("Erro ao excluir interação:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}

function normalizarUrl(valor: string) {
  const texto = valor.trim();
  if (!texto) return "";
  if (texto.startsWith("http://") || texto.startsWith("https://") || texto.startsWith("/")) {
    return texto;
  }
  return `/${texto}`;
}

export async function addArquivo(clienteId: string, formData: FormData) {
  const label = String(formData.get("label") || "").trim();
  const urlBruta = String(formData.get("url") || "").trim();
  const tipoBruto = String(formData.get("tipo") || "roteiro_draft");

  if (!label || !urlBruta) {
    redirect(`/crm/clientes/${clienteId}?erro=3`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("arquivos_cliente").insert({
    cliente_id: clienteId,
    tipo: isTipoArquivo(tipoBruto) ? tipoBruto : "roteiro_draft",
    label,
    url: normalizarUrl(urlBruta),
  });

  if (error) {
    console.error("Erro ao adicionar arquivo:", error);
    redirect(`/crm/clientes/${clienteId}?erro=3`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  redirect(`/crm/clientes/${clienteId}`);
}

export async function deleteArquivo(clienteId: string, arquivoId: string, formData: FormData) {
  void formData;
  const supabase = await createClient();
  const { error } = await supabase.from("arquivos_cliente").delete().eq("id", arquivoId);

  if (error) {
    console.error("Erro ao excluir arquivo:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}
