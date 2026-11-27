"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { CIDADES_GUIA_CRM, IDIOMAS_GUIA } from "@/lib/crm/guias";

// Cadastro dos guias (Wilson, 27/nov/2026 — migração 044). Só a equipe com
// permissão de editar; excluir pede permissão de excluir.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const texto = (v: FormDataEntryValue | null, max = 300) => {
  const t = String(v ?? "").trim().slice(0, max);
  return t || null;
};

function voltar(msg: { ok?: string; erro?: string }, ancora = ""): never {
  const p = new URLSearchParams();
  if (msg.ok) p.set("ok", msg.ok);
  if (msg.erro) p.set("erro", msg.erro);
  redirect(`/crm/guias?${p.toString()}${ancora}`);
}

async function permissao(opcoes: { deletar?: boolean } = {}) {
  try {
    return await garantirAdmin(opcoes);
  } catch (e) {
    voltar({ erro: e instanceof Error ? e.message : "Acesso negado." });
  }
}

export async function salvarGuia(formData: FormData) {
  const acesso = await permissao();
  const id = String(formData.get("id") || "");
  if (id && !UUID.test(id)) voltar({ erro: "Guia inválido." });
  const nome = String(formData.get("nome") || "").trim().slice(0, 160);
  if (!nome) voltar({ erro: "Informe o nome do guia." });
  const email = texto(formData.get("email"), 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) voltar({ erro: "E-mail do guia inválido." });
  const diariaBruta = String(formData.get("diaria_jpy") || "").replace(/[^\d]/g, "");
  const tipo = formData.get("tipo") === "local" ? "local" : "brasileiro";
  const outrosIdiomas = (texto(formData.get("outros_idiomas"), 200) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const outrasCidades = (texto(formData.get("outras_cidades"), 300) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const idiomas = [...formData.getAll("idiomas").map(String).filter((v) => (IDIOMAS_GUIA as readonly string[]).includes(v)), ...outrosIdiomas];
  const cidades = [...formData.getAll("cidades").map(String).filter((v) => (CIDADES_GUIA_CRM as readonly string[]).includes(v)), ...outrasCidades];

  const dados = {
    nome,
    tipo,
    idiomas: Array.from(new Set(idiomas)).slice(0, 12),
    cidades: Array.from(new Set(cidades)).slice(0, 20),
    base_cidade: texto(formData.get("base_cidade"), 120),
    telefone: texto(formData.get("telefone"), 60),
    email,
    line_id: texto(formData.get("line_id"), 80),
    diaria_jpy: diariaBruta ? Math.min(Number(diariaBruta), 9_999_999) : null,
    licenciado: formData.get("licenciado") === "on",
    ativo: id ? formData.get("ativo") === "on" : true,
    observacoes: texto(formData.get("observacoes"), 4000),
    updated_at: new Date().toISOString(),
    updated_by_email: acesso.email,
  };
  const admin = createAdminClient();
  // Foto (migração 045): miniatura circular. Guia novo ganha o id aqui para
  // a foto já ir para a pasta dele.
  const idGuia = id || randomUUID();
  const foto = await salvarFotoGuia(idGuia, formData);
  if (foto && "erro" in foto) voltar({ erro: foto.erro }, id ? `#guia-${id}` : "");
  const comFoto = foto ? { ...dados, foto_url: foto.url } : dados;
  const { data, error } = id
    ? await admin.from("guias").update(comFoto).eq("id", id).select("id").maybeSingle()
    : await admin.from("guias").insert({ ...comFoto, id: idGuia }).select("id").single();
  if (error || !data) {
    console.error("Erro ao salvar guia:", error?.message);
    voltar({ erro: error?.code === "42P01" || error?.code === "PGRST205" ? "Rode a migração 044 no Supabase." : "Não foi possível salvar o guia." });
  }
  revalidatePath("/crm/guias");
  voltar({ ok: id ? `Guia "${nome}" atualizado.` : `Guia "${nome}" cadastrado.` }, `#guia-${data.id}`);
}

const TIPOS_FOTO: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** null = sem mudança; { url: null } = remover; { url } = nova foto. */
async function salvarFotoGuia(guiaId: string, formData: FormData): Promise<{ url: string | null } | { erro: string } | null> {
  if (formData.get("remover_foto") === "on") return { url: null };
  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) return null;
  const ext = TIPOS_FOTO[arquivo.type];
  if (!ext) return { erro: "Envie a foto em JPG, PNG ou WebP." };
  if (arquivo.size > 2 * 1024 * 1024) return { erro: "A foto pode ter até 2 MB." };
  const caminho = `${guiaId}/foto-${randomUUID().slice(0, 8)}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("fotos-guias").upload(caminho, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type, upsert: true });
  if (error) {
    console.error("Erro ao enviar foto do guia:", error.message);
    return { erro: "Não foi possível enviar a foto (a migração 045 já rodou no Supabase?)." };
  }
  return { url: admin.storage.from("fotos-guias").getPublicUrl(caminho).data.publicUrl };
}

export async function excluirGuia(id: string) {
  await permissao({ deletar: true });
  if (!UUID.test(id)) voltar({ erro: "Guia inválido." });
  const admin = createAdminClient();
  const { count } = await admin.from("clientes").select("id", { count: "exact", head: true }).eq("guia_id", id);
  if (count) voltar({ erro: `Este guia está em ${count} oportunidade(s). Marque como inativo em vez de excluir.` });
  const { error } = await admin.from("guias").delete().eq("id", id);
  if (error) voltar({ erro: "Não foi possível excluir o guia." });
  revalidatePath("/crm/guias");
  voltar({ ok: "Guia excluído." });
}
