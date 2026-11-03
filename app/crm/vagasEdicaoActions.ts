"use server";

import { revalidatePath } from "next/cache";
import { garantirAdmin } from "@/lib/crm/acesso";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VAGAS, encontrarVaga } from "@/app/lib/vagasCatalogo";
import { diferencaDoOriginal, lerEdicao, proximoCodigoVaga, slugVaga, type EdicaoVaga } from "@/app/lib/vagasEdicao";

// Vagas pelo CRM (Wilson, 03/nov/2026):
// - Vaga do catálogo do código: edição grava em public.vagas_edicoes
//   (migração 033) só o que difere do código.
// - Vaga nova ("Nova vaga"): mora inteira em public.vagas_novas (034).
// Tudo revalida as páginas públicas de /empregos.

type Resultado = { ok: true; campos: number; vagaId?: string } | { ok: false; erro: string };

const TIPOS_LOGO: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

function revalidar(vagaId: string) {
  revalidatePath("/empregos", "layout");
  revalidatePath(`/empregos/vagas/${vagaId}`);
  revalidatePath(`/empregos/candidatura/${vagaId}`);
  revalidatePath("/crm/empregos/vagas");
}

async function admin(): Promise<{ email: string | null } | { erro: string }> {
  try {
    await garantirAdmin();
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Acesso negado." };
  }
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return { email: user?.email ?? null };
}

/** Lê e valida o formulário. Logo: "manter" quando não veio arquivo nem pedido de remoção. */
async function lerFormulario(formData: FormData, pastaLogo: string): Promise<{ edicao: EdicaoVaga; logo: "manter" | "trocado" } | { erro: string }> {
  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("dados") ?? "{}"));
  } catch {
    return { erro: "Dados inválidos." };
  }
  const edicao = lerEdicao(bruto);
  if (!edicao.empresa || !edicao.titulo || !edicao.cidade || !edicao.regiao || !edicao.salario) {
    return { erro: "Empresa, função, cidade, província e salário são obrigatórios." };
  }
  if (!edicao.publico?.length) return { erro: "Marque pelo menos um público (Brasil ou Japão)." };
  if (!edicao.publicadaEm) return { erro: "Informe a data de publicação." };

  delete edicao.logo;
  if (formData.get("remover_logo") === "1") {
    edicao.logo = null;
    return { edicao, logo: "trocado" };
  }
  const arquivo = formData.get("logo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { edicao, logo: "manter" };
  const ext = TIPOS_LOGO[arquivo.type];
  if (!ext) return { erro: "Envie o logo em PNG, JPG ou WebP." };
  if (arquivo.size > 2 * 1024 * 1024) return { erro: "O logo pode ter até 2 MB." };
  const caminho = `${pastaLogo}/logo-${Date.now()}.${ext}`;
  const sb = createAdminClient();
  const { error } = await sb.storage.from("logos-vagas").upload(caminho, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type, upsert: true });
  if (error) {
    console.error("Erro ao enviar logo da vaga:", error);
    return { erro: "Não foi possível enviar o logo (a migração 033 já rodou no Supabase?)." };
  }
  edicao.logo = sb.storage.from("logos-vagas").getPublicUrl(caminho).data.publicUrl;
  return { edicao, logo: "trocado" };
}

export async function salvarEdicaoVaga(vagaId: string, formData: FormData): Promise<Resultado> {
  const quem = await admin();
  if ("erro" in quem) return { ok: false, erro: quem.erro };
  const sb = createAdminClient();
  const lido = await lerFormulario(formData, vagaId);
  if ("erro" in lido) return { ok: false, erro: lido.erro };
  const { edicao } = lido;
  const agora = new Date().toISOString();

  // Vaga criada no CRM: regrava os dados inteiros.
  const original = encontrarVaga(vagaId);
  if (!original) {
    const { data: atual } = await sb.from("vagas_novas").select("dados").eq("vaga_id", vagaId).maybeSingle();
    if (!atual) return { ok: false, erro: "Vaga não encontrada." };
    if (lido.logo === "manter") {
      const anterior = lerEdicao(atual.dados);
      if (anterior.logo) edicao.logo = anterior.logo;
    }
    const { error } = await sb.from("vagas_novas").update({ dados: edicao, updated_at: agora, updated_by_email: quem.email }).eq("vaga_id", vagaId);
    if (error) {
      console.error("Erro ao salvar vagas_novas:", error);
      return { ok: false, erro: "Não foi possível salvar." };
    }
    revalidar(vagaId);
    return { ok: true, campos: 1 };
  }

  // Vaga do catálogo do código: guarda só a diferença.
  if (lido.logo === "manter") {
    const { data: atual } = await sb.from("vagas_edicoes").select("dados").eq("vaga_id", vagaId).maybeSingle();
    const anterior = lerEdicao(atual?.dados);
    if ("logo" in anterior) edicao.logo = anterior.logo;
  }
  const diferenca = diferencaDoOriginal(original, edicao);
  const campos = Object.keys(diferenca).length + (diferenca.info ? Object.keys(diferenca.info).length - 1 : 0);
  const { error } =
    campos === 0
      ? await sb.from("vagas_edicoes").delete().eq("vaga_id", vagaId)
      : await sb
          .from("vagas_edicoes")
          .upsert({ vaga_id: vagaId, dados: diferenca, updated_at: agora, updated_by_email: quem.email }, { onConflict: "vaga_id" });
  if (error) {
    console.error("Erro ao salvar vagas_edicoes:", error);
    return { ok: false, erro: "Não foi possível salvar. A migração 033 já rodou no Supabase?" };
  }
  revalidar(vagaId);
  return { ok: true, campos };
}

/** Nova vaga (migração 034): id = slug empresa-cidade, código AJ-xxxx seguinte ao maior em uso. */
export async function criarVaga(formData: FormData): Promise<Resultado> {
  const quem = await admin();
  if ("erro" in quem) return { ok: false, erro: quem.erro };
  const sb = createAdminClient();
  const { data: existentes, error: erroLer } = await sb.from("vagas_novas").select("vaga_id, codigo");
  if (erroLer) {
    console.error("Erro ao ler vagas_novas:", erroLer);
    return { ok: false, erro: "Não foi possível criar. A migração 034 já rodou no Supabase?" };
  }
  const ids = new Set([...VAGAS.map((v) => v.id), ...(existentes ?? []).map((l) => String(l.vaga_id))]);
  const codigos = [...VAGAS.map((v) => v.codigo), ...(existentes ?? []).map((l) => String(l.codigo))];

  // Pasta do logo com nome provisório: o id só existe depois de validar o formulário.
  const lido = await lerFormulario(formData, `nova-${Date.now()}`);
  if ("erro" in lido) return { ok: false, erro: lido.erro };
  const { edicao } = lido;
  if (!edicao.logo) delete edicao.logo;
  const vagaId = slugVaga(edicao.empresa!, edicao.cidade!, ids);
  const codigo = proximoCodigoVaga(codigos);
  const agora = new Date().toISOString();

  const { error } = await sb
    .from("vagas_novas")
    .insert({ vaga_id: vagaId, codigo, dados: edicao, created_at: agora, created_by_email: quem.email, updated_at: agora, updated_by_email: quem.email });
  if (error) {
    console.error("Erro ao criar vaga:", error);
    return { ok: false, erro: error.code === "23505" ? "Outra vaga acabou de usar este código — tente salvar de novo." : "Não foi possível criar a vaga." };
  }
  // Publicar agora ou deixar oculta (vaga sem linha em vagas_status = visível).
  if (formData.get("publicar") !== "1") {
    await sb.from("vagas_status").upsert({ vaga_id: vagaId, ativa: false, updated_at: agora }, { onConflict: "vaga_id" });
  }
  revalidar(vagaId);
  return { ok: true, campos: 0, vagaId };
}

/** Exclui uma vaga criada no CRM — só sem candidaturas (com candidaturas, oculte). */
export async function excluirVagaNova(vagaId: string): Promise<Resultado> {
  const quem = await admin();
  if ("erro" in quem) return { ok: false, erro: quem.erro };
  if (encontrarVaga(vagaId)) return { ok: false, erro: "Vagas do catálogo do código não podem ser excluídas — use o switch para ocultar." };
  const sb = createAdminClient();
  const { count } = await sb.from("candidaturas_vagas").select("id", { count: "exact", head: true }).eq("vaga_id", vagaId);
  if (count) return { ok: false, erro: "Esta vaga já tem candidaturas. Oculte pelo switch em vez de excluir." };
  const { error } = await sb.from("vagas_novas").delete().eq("vaga_id", vagaId);
  if (error) return { ok: false, erro: "Não foi possível excluir." };
  await sb.from("vagas_status").delete().eq("vaga_id", vagaId);
  revalidar(vagaId);
  return { ok: true, campos: 0 };
}

/** Desfaz todas as edições do CRM — a vaga volta a ser igual ao código. */
export async function restaurarVagaOriginal(vagaId: string): Promise<Resultado> {
  const quem = await admin();
  if ("erro" in quem) return { ok: false, erro: quem.erro };
  const { error } = await createAdminClient().from("vagas_edicoes").delete().eq("vaga_id", vagaId);
  if (error) {
    console.error("Erro ao restaurar vaga:", error);
    return { ok: false, erro: "Não foi possível restaurar." };
  }
  revalidar(vagaId);
  return { ok: true, campos: 0 };
}
