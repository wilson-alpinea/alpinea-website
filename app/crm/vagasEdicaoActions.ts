"use server";

import { revalidatePath } from "next/cache";
import { garantirAdmin } from "@/lib/crm/acesso";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encontrarVaga } from "@/app/lib/vagasCatalogo";
import { diferencaDoOriginal, lerEdicao } from "@/app/lib/vagasEdicao";

// Edição das vagas pelo CRM (Wilson, 03/nov/2026) — grava em
// public.vagas_edicoes (migração 033) só o que difere do catálogo do código
// e revalida as páginas públicas de /empregos.

type Resultado = { ok: true; campos: number } | { ok: false; erro: string };

const TIPOS_LOGO: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

function revalidar(vagaId: string) {
  revalidatePath("/empregos", "layout");
  revalidatePath(`/empregos/vagas/${vagaId}`);
  revalidatePath(`/empregos/candidatura/${vagaId}`);
  revalidatePath("/crm/empregos/vagas");
}

export async function salvarEdicaoVaga(vagaId: string, formData: FormData): Promise<Resultado> {
  try {
    await garantirAdmin();
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Acesso negado." };
  }
  const original = encontrarVaga(vagaId);
  if (!original) return { ok: false, erro: "Vaga não encontrada no catálogo." };

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("dados") ?? "{}"));
  } catch {
    return { ok: false, erro: "Dados inválidos." };
  }
  const edicao = lerEdicao(bruto);
  if (!edicao.empresa || !edicao.titulo || !edicao.cidade || !edicao.regiao || !edicao.salario) {
    return { ok: false, erro: "Empresa, função, cidade, província e salário são obrigatórios." };
  }
  if (!edicao.publico?.length) return { ok: false, erro: "Marque pelo menos um público (Brasil ou Japão)." };

  const admin = createAdminClient();

  // Logo: arquivo novo vai para o bucket logos-vagas; "remover" volta para sem logo.
  const arquivo = formData.get("logo");
  if (formData.get("remover_logo") === "1") edicao.logo = null;
  else if (arquivo instanceof File && arquivo.size > 0) {
    const ext = TIPOS_LOGO[arquivo.type];
    if (!ext) return { ok: false, erro: "Envie o logo em PNG, JPG ou WebP." };
    if (arquivo.size > 2 * 1024 * 1024) return { ok: false, erro: "O logo pode ter até 2 MB." };
    const caminho = `${vagaId}/logo-${Date.now()}.${ext}`;
    const { error } = await admin.storage.from("logos-vagas").upload(caminho, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type, upsert: true });
    if (error) {
      console.error("Erro ao enviar logo da vaga:", error);
      return { ok: false, erro: "Não foi possível enviar o logo (a migração 033 já rodou no Supabase?)." };
    }
    edicao.logo = admin.storage.from("logos-vagas").getPublicUrl(caminho).data.publicUrl;
  } else {
    delete edicao.logo; // sem mudança de logo: mantém o que já estava
    const { data: atual } = await admin.from("vagas_edicoes").select("dados").eq("vaga_id", vagaId).maybeSingle();
    const anterior = lerEdicao(atual?.dados);
    if ("logo" in anterior) edicao.logo = anterior.logo;
  }

  const diferenca = diferencaDoOriginal(original, edicao);
  const campos = Object.keys(diferenca).length + (diferenca.info ? Object.keys(diferenca.info).length - 1 : 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } =
    campos === 0
      ? await admin.from("vagas_edicoes").delete().eq("vaga_id", vagaId)
      : await admin.from("vagas_edicoes").upsert(
          { vaga_id: vagaId, dados: diferenca, updated_at: new Date().toISOString(), updated_by: user?.id ?? null, updated_by_email: user?.email ?? null },
          { onConflict: "vaga_id" },
        );
  if (error) {
    console.error("Erro ao salvar vagas_edicoes:", error);
    return { ok: false, erro: "Não foi possível salvar. A migração 033 já rodou no Supabase?" };
  }
  revalidar(vagaId);
  return { ok: true, campos };
}

/** Desfaz todas as edições do CRM — a vaga volta a ser igual ao código. */
export async function restaurarVagaOriginal(vagaId: string): Promise<Resultado> {
  try {
    await garantirAdmin();
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Acesso negado." };
  }
  const { error } = await createAdminClient().from("vagas_edicoes").delete().eq("vaga_id", vagaId);
  if (error) {
    console.error("Erro ao restaurar vaga:", error);
    return { ok: false, erro: "Não foi possível restaurar." };
  }
  revalidar(vagaId);
  return { ok: true, campos: 0 };
}
