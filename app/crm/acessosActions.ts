"use server";

import { PERMISSOES_VAZIAS, PRODUTOS_PARCEIRO_GRUPOS, acoesDoNivel, lerPermissoes, lerProdutosParceiro, lerUnidadesParceiro, type RemuneracaoProdutos } from "@/lib/crm/permissoes";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirSomenteAdmin as garantirAdmin } from "@/lib/crm/acesso";
import { SLUG_PARCEIRO, isPapelCrm, isUnidadeCrm } from "@/lib/crm/unidades";

// Gestão de acessos do CRM (Wilson, 21/out/2026): parceiros da agência,
// empreiteiras, usuários e vagas de cada empreiteira. Só admin. Usa service
// role porque mexe em auth.users e em perfis.

// `campo` indica qual campo do formulário mostra o erro (Acessos, 23/out/2026).
export type ResultadoAcesso = { ok: boolean; mensagem: string; senha?: string; email?: string; campo?: string };

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
  if (nome.length < 2) return { ok: false, mensagem: "Informe o nome da empresa.", campo: "nome" };
  if (tipo !== "agencia" && tipo !== "empreiteira" && tipo !== "afiliado") return { ok: false, mensagem: "Escolha o tipo.", campo: "tipo" };
  // Código personalizado: valida como está (sem "consertar" em silêncio).
  // Código automático: vem do nome e ganha um sufixo se já existir.
  const slugInformado = String(formData.get("slug") || "").trim().toLowerCase();
  let slug = slugInformado || slugDe(nome);
  if (!SLUG_PARCEIRO.test(slug)) {
    return { ok: false, mensagem: "Use só letras minúsculas, números e hífen (sem acentos ou espaços), até 40 caracteres.", campo: "slug" };
  }

  const admin = createAdminClient();
  const { data: existe } = await admin.from("parceiros").select("id").eq("slug", slug).maybeSingle();
  if (existe) {
    if (slugInformado) return { ok: false, mensagem: "Esse código já está em uso por outra empresa.", campo: "slug" };
    slug = `${slug.slice(0, 34)}-${randomBytes(2).toString("hex")}`;
  }
  const rem = remuneracaoDoForm(formData);
  if ("erro" in rem) return { ok: false, mensagem: rem.erro, campo: "remuneracao_valor" };
  const remP = remuneracaoProdutosDoForm(formData);
  if ("erro" in remP) return { ok: false, mensagem: remP.erro, campo: "remuneracao_valor" };
  const { data: criado, error } = await admin.from("parceiros").insert({ nome, tipo, slug, ...rem, produtos: tipo !== "empreiteira" ? produtosParceiroDoForm(formData) : null, unidades: tipo !== "empreiteira" && unidadesParceiroDoForm(formData).length ? unidadesParceiroDoForm(formData) : null, remuneracao_produtos: Object.keys(remP.regras).length ? remP.regras : null }).select("id").single();
  if (error || !criado) {
    console.error("Erro ao criar parceiro:", error);
    return { ok: false, mensagem: "Não foi possível salvar (a migração 030 já rodou no Supabase?)." };
  }
  const logo = await salvarLogoParceiro(criado.id, formData);
  if (logo && "erro" in logo) {
    revalidar();
    return { ok: false, mensagem: `Empresa cadastrada, mas o logo não foi salvo: ${logo.erro} Envie de novo em “Editar”.`, campo: "logo" };
  }
  if (logo) await admin.from("parceiros").update({ logo_url: logo.url }).eq("id", criado.id);
  revalidar();
  return { ok: true, mensagem: `${tipo === "agencia" ? "Parceiro" : tipo === "afiliado" ? "Afiliado" : "Empreiteira"} "${nome}" cadastrado${tipo !== "empreiteira" ? ` · código ${slug}` : ""}.` };
}

// Editar empresa: nome e (em opções avançadas) o código do link. O tipo não
// muda depois de criado — os usuários vinculados dependem dele. Mudar o nome
// NÃO mexe no código.
export async function editarParceiro(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  await garantirAdmin();
  const id = String(formData.get("id") || "");
  if (!UUID.test(id)) return { ok: false, mensagem: "Empresa inválida." };
  const nome = String(formData.get("nome") || "").trim().slice(0, 120);
  if (nome.length < 2) return { ok: false, mensagem: "Informe o nome da empresa.", campo: "nome" };
  const admin = createAdminClient();
  const { data: atual } = await admin.from("parceiros").select("id, slug, tipo").eq("id", id).maybeSingle();
  if (!atual) return { ok: false, mensagem: "Empresa não encontrada." };
  const rem = remuneracaoDoForm(formData);
  if ("erro" in rem) return { ok: false, mensagem: rem.erro, campo: "remuneracao_valor" };
  const remP = remuneracaoProdutosDoForm(formData);
  if ("erro" in remP) return { ok: false, mensagem: remP.erro, campo: "remuneracao_valor" };
  const update: Record<string, unknown> = { nome, ...rem, remuneracao_produtos: Object.keys(remP.regras).length ? remP.regras : null };
  if (atual.tipo !== "empreiteira") {
    update.produtos = produtosParceiroDoForm(formData);
    const unidades = unidadesParceiroDoForm(formData);
    update.unidades = unidades.length ? unidades : null;
  }
  const logo = await salvarLogoParceiro(id, formData);
  if (logo && "erro" in logo) return { ok: false, mensagem: logo.erro, campo: "logo" };
  if (logo) update.logo_url = logo.url;
  const slugNovo = String(formData.get("slug") || "").trim().toLowerCase();
  if (atual.tipo !== "empreiteira" && slugNovo && slugNovo !== atual.slug) {
    if (!SLUG_PARCEIRO.test(slugNovo)) {
      return { ok: false, mensagem: "Use só letras minúsculas, números e hífen (sem acentos ou espaços), até 40 caracteres.", campo: "slug" };
    }
    const { data: existe } = await admin.from("parceiros").select("id").eq("slug", slugNovo).neq("id", id).maybeSingle();
    if (existe) return { ok: false, mensagem: "Esse código já está em uso por outra empresa.", campo: "slug" };
    update.slug = slugNovo;
  }
  const { error } = await admin.from("parceiros").update(update).eq("id", id);
  if (error) {
    console.error("Erro ao editar parceiro:", error);
    return { ok: false, mensagem: "Não foi possível salvar (a migração 030 já rodou no Supabase?)." };
  }
  revalidar();
  return { ok: true, mensagem: "Empresa atualizada." };
}

export async function alternarParceiroAtivo(parceiroId: string, ativo: boolean): Promise<ResultadoAcesso> {
  await garantirAdmin();
  if (!UUID.test(parceiroId)) return { ok: false, mensagem: "Empresa inválida." };
  const { error } = await createAdminClient().from("parceiros").update({ ativo }).eq("id", parceiroId);
  if (error) {
    console.error("Erro ao alterar parceiro:", error);
    return { ok: false, mensagem: "Não foi possível alterar a situação." };
  }
  revalidar();
  return { ok: true, mensagem: ativo ? "Empresa reativada." : "Empresa desativada." };
}

function validarPapel(papelBruto: string, parceiroBruto: string, tipos: Map<string, string>) {
  const papel = papelBruto === "sem_acesso" ? null : isPapelCrm(papelBruto) ? papelBruto : undefined;
  if (papel === undefined) return { erro: "Escolha o perfil de acesso.", campo: "papel" } as const;
  if (papel === "admin" || papel === "despachante" || papel === "consultor" || papel === null) return { papel, parceiroId: null } as const;
  const esperado = papel === "parceiro_agencia" ? "agencia" : "empreiteira";
  const tipoEmpresa = tipos.get(parceiroBruto);
  const confere = tipoEmpresa === esperado || (esperado === "agencia" && tipoEmpresa === "afiliado");
  if (!UUID.test(parceiroBruto) || !confere) {
    return { erro: papel === "parceiro_agencia" ? "Escolha o parceiro ou afiliado." : "Escolha a empreiteira.", campo: "parceiro_id" } as const;
  }
  return { papel, parceiroId: parceiroBruto } as const;
}

// Remuneração do parceiro (migração 030): percentual da receita líquida ou
// valor fixo por venda. Vazio = não definida.
function remuneracaoDoForm(formData: FormData): { remuneracao_tipo: string | null; remuneracao_valor: number | null } | { erro: string } {
  const tipo = String(formData.get("remuneracao_tipo") ?? "");
  if (tipo !== "percentual" && tipo !== "fixo") return { remuneracao_tipo: null, remuneracao_valor: null };
  // Aceita "50", "50%", "10,5", "R$ 1.500,00" (Wilson digitou "50%" e não salvava).
  let texto = String(formData.get("remuneracao_valor") ?? "").replace(/[^\d.,]/g, "");
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
  const valor = Number(texto);
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Informe o valor da remuneração." };
  if (tipo === "percentual" && valor > 100) return { erro: "O percentual vai de 0 a 100." };
  return { remuneracao_tipo: tipo, remuneracao_valor: Math.round(valor * 100) / 100 };
}

// Consultor (migração 030): nível 2 CRMs, nível 3 produtos, nível 4 ações, nível 5 cargo.
function permissoesDoForm(formData: FormData) {
  const crms = formData.getAll("crms").map(String).filter(isUnidadeCrm);
  const produtos: Record<string, string[]> = {};
  for (const u of crms) {
    const lista = formData.getAll(`prod_${u}`).map(String);
    if (lista.length) produtos[u] = lista;
  }
  const permissoes = lerPermissoes({ crms, produtos, ...acoesDoNivel(String(formData.get("nivel") ?? "ver")) });
  const cargo = String(formData.get("cargo") ?? "").trim().slice(0, 80) || null;
  return { permissoes, cargo };
}

// Logo do parceiro (Wilson, 29/out/2026) — migração 032, bucket público
// logos-parceiros. PNG, JPG ou WebP até 2 MB (sem SVG: pode carregar script).
const TIPOS_LOGO: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
async function salvarLogoParceiro(parceiroId: string, formData: FormData): Promise<{ url: string | null } | { erro: string } | null> {
  if (formData.get("remover_logo") === "1") return { url: null };
  const arquivo = formData.get("logo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return null; // sem mudança
  const ext = TIPOS_LOGO[arquivo.type];
  if (!ext) return { erro: "Envie o logo em PNG, JPG ou WebP." };
  if (arquivo.size > 2 * 1024 * 1024) return { erro: "O logo pode ter até 2 MB." };
  const caminho = `${parceiroId}/logo-${Date.now()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("logos-parceiros").upload(caminho, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type, upsert: true });
  if (error) {
    console.error("Erro ao enviar logo do parceiro:", error);
    return { erro: "Não foi possível enviar o logo (a migração 032 já rodou no Supabase?)." };
  }
  return { url: admin.storage.from("logos-parceiros").getPublicUrl(caminho).data.publicUrl };
}

// Produtos liberados ao parceiro/afiliado (Wilson, 29/out/2026). Vazio = todos.
// Unidades de negócio marcadas acima dos produtos; só valem produtos das unidades marcadas.
function unidadesParceiroDoForm(formData: FormData) {
  return lerUnidadesParceiro(formData.getAll("unidades_parceiro").map(String));
}
function produtosParceiroDoForm(formData: FormData): string[] | null {
  const unidades = unidadesParceiroDoForm(formData);
  const daUnidade = new Map(PRODUTOS_PARCEIRO_GRUPOS.flatMap((g) => g.produtos.map((p) => [p.valor, g.unidade] as const)));
  const lista = lerProdutosParceiro(formData.getAll("produtos_parceiro")).filter((p) => unidades.length === 0 || unidades.includes(daUnidade.get(p)!));
  return lista.length ? lista : null;
}

// Remuneração por produto (Wilson, 29/out/2026): campos remp_tipo_<produto> e
// remp_valor_<produto>, só dos produtos marcados. "padrao" = usa a regra geral.
function remuneracaoProdutosDoForm(formData: FormData): { regras: RemuneracaoProdutos } | { erro: string } {
  const out: RemuneracaoProdutos = {};
  for (const p of lerProdutosParceiro(formData.getAll("produtos_parceiro"))) {
    const tipo = String(formData.get(`remp_tipo_${p}`) ?? "padrao");
    if (tipo !== "percentual" && tipo !== "fixo") continue;
    const bruto = String(formData.get(`remp_valor_${p}`) ?? "").replace(/[^\d.,]/g, "");
    const valor = Number(bruto.includes(",") ? bruto.replace(/\./g, "").replace(",", ".") : bruto);
    if (!Number.isFinite(valor) || valor <= 0) return { erro: "Informe o valor da remuneração de cada produto com regra própria." };
    if (tipo === "percentual" && valor > 100) return { erro: "O percentual vai de 0 a 100." };
    out[p] = { tipo, valor: Math.round(valor * 100) / 100 };
  }
  return { regras: out };
}

function permissoesParceiroDoForm(formData: FormData) {
  const unidades = unidadesParceiroDoForm(formData);
  const lista = produtosParceiroDoForm(formData);
  return { permissoes: { ...PERMISSOES_VAZIAS, crms: unidades, produtos: {}, produtosParceiro: lista ?? [] } };
}

async function tiposParceiros() {
  const { data } = await createAdminClient().from("parceiros").select("id, tipo");
  return new Map((data ?? []).map((p) => [p.id as string, p.tipo as string]));
}

export async function criarUsuario(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  await garantirAdmin();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim().slice(0, 120);
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, mensagem: "Informe um e-mail válido.", campo: "email" };
  const v = validarPapel(String(formData.get("papel") || ""), String(formData.get("parceiro_id") || ""), await tiposParceiros());
  if ("erro" in v) return { ok: false, mensagem: v.erro!, campo: v.campo };
  if (v.papel === "consultor" && permissoesDoForm(formData).permissoes.crms.length === 0) return { ok: false, mensagem: "Escolha pelo menos um CRM.", campo: "crms" };
  const remU = remuneracaoDoForm(formData);
  if ("erro" in remU) return { ok: false, mensagem: remU.erro, campo: "remuneracao_valor" };
  const remPUx = remuneracaoProdutosDoForm(formData);
  if ("erro" in remPUx) return { ok: false, mensagem: remPUx.erro, campo: "remuneracao_valor" };
  const remPU = Object.keys(remPUx.regras).length ? remPUx.regras : null;

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
    return {
      ok: false,
      mensagem: jaExiste ? "Já existe um usuário com esse e-mail. Use “Editar acesso” na lista." : "Não foi possível criar o usuário.",
      campo: jaExiste ? "email" : undefined,
    };
  }
  const { error: erroPerfil } = await admin
    .from("perfis")
    .upsert(
      {
        id: data.user.id,
        email,
        nome: nome || email.split("@")[0],
        papel: v.papel,
        parceiro_id: v.parceiroId,
        ...(v.papel === "consultor" ? permissoesDoForm(formData) : {}),
        ...(v.papel === "parceiro_agencia" ? permissoesParceiroDoForm(formData) : {}),
        ...(v.papel && v.papel !== "admin" ? remU : {}),
        ...(v.papel === "parceiro_agencia" ? { remuneracao_produtos: remPU } : {}),
      },
      { onConflict: "id" },
    );
  if (erroPerfil) {
    console.error("Erro ao gravar perfil:", erroPerfil);
    return { ok: false, mensagem: "Usuário criado, mas não foi possível definir o acesso (a migração 030 já rodou no Supabase?). Ajuste na lista abaixo." };
  }
  revalidar();
  return { ok: true, mensagem: "Usuário criado. Envie o e-mail e a senha para a pessoa — a senha não aparece de novo.", senha, email };
}

export async function alterarAcessoUsuario(_: ResultadoAcesso | null, formData: FormData): Promise<ResultadoAcesso> {
  const acesso = await garantirAdmin();
  const userId = String(formData.get("user_id") || "");
  if (!UUID.test(userId)) return { ok: false, mensagem: "Usuário inválido." };
  if (userId === acesso.userId) return { ok: false, mensagem: "Você não pode alterar o seu próprio acesso." };
  const v = validarPapel(String(formData.get("papel") || ""), String(formData.get("parceiro_id") || ""), await tiposParceiros());
  if ("erro" in v) return { ok: false, mensagem: v.erro!, campo: v.campo };
  const remU = remuneracaoDoForm(formData);
  if ("erro" in remU) return { ok: false, mensagem: remU.erro, campo: "remuneracao_valor" };
  const remPUx = remuneracaoProdutosDoForm(formData);
  if ("erro" in remPUx) return { ok: false, mensagem: remPUx.erro, campo: "remuneracao_valor" };
  const update: Record<string, unknown> = { ...(v.papel === "parceiro_agencia" ? { remuneracao_produtos: Object.keys(remPUx.regras).length ? remPUx.regras : null } : {}), papel: v.papel, parceiro_id: v.parceiroId, ...(v.papel === "consultor" ? permissoesDoForm(formData) : {}), ...(v.papel === "parceiro_agencia" ? permissoesParceiroDoForm(formData) : {}), ...(v.papel && v.papel !== "admin" ? remU : {}) };
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 120);
  if (nome) update.nome = nome;
  const { error } = await createAdminClient().from("perfis").update(update).eq("id", userId);
  if (error) {
    console.error("Erro ao alterar acesso:", error);
    return { ok: false, mensagem: "Não foi possível salvar (a migração 030 já rodou no Supabase?)." };
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
