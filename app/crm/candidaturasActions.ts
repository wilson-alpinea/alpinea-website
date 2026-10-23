"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";

// Exclusão em lote de candidaturas (Wilson, 23/out/2026). Apaga a linha em
// candidaturas_vagas — as pré-entrevistas ligadas saem junto (on delete
// cascade, migração 017) — e, depois, o currículo e a foto nos buckets
// privados. Irreversível; a confirmação fica na tela.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResultadoExclusao =
  | { ok: true; excluidas: number; naoEncontradas: number; arquivosPendentes: number }
  | { ok: false; erro: string };

export async function excluirCandidaturas(ids: string[]): Promise<ResultadoExclusao> {
  await garantirAdmin();
  const validos = [...new Set((ids ?? []).filter((id) => typeof id === "string" && UUID.test(id)))];
  if (validos.length === 0) return { ok: false, erro: "Nenhuma candidatura válida selecionada." };
  if (validos.length > 500) return { ok: false, erro: "Selecione no máximo 500 candidaturas por vez." };

  const supabase = await createClient();
  const { data: linhas, error: erroLeitura } = await supabase.from("candidaturas_vagas").select("id, curriculo_path, foto_path").in("id", validos);
  if (erroLeitura) {
    console.error("Erro ao ler candidaturas para excluir:", erroLeitura);
    return { ok: false, erro: "Não foi possível ler as candidaturas. Nada foi excluído." };
  }
  const existentes = (linhas ?? []).map((l) => l.id as string);
  if (existentes.length === 0) return { ok: false, erro: "As candidaturas selecionadas não existem mais." };

  const { error } = await supabase.from("candidaturas_vagas").delete().in("id", existentes);
  if (error) {
    console.error("Erro ao excluir candidaturas:", error);
    return { ok: false, erro: "Não foi possível excluir. Nada foi alterado." };
  }

  // Arquivos: melhor esforço — a candidatura já saiu; um arquivo que falhe
  // fica órfão no bucket privado e é informado na tela.
  let arquivosPendentes = 0;
  const curriculos = (linhas ?? []).map((l) => l.curriculo_path as string | null).filter((p): p is string => !!p);
  const fotos = (linhas ?? []).map((l) => l.foto_path as string | null).filter((p): p is string => !!p);
  try {
    const admin = createAdminClient();
    for (const [bucket, caminhos] of [
      ["curriculos-candidatos", curriculos],
      ["fotos-candidatos", fotos],
    ] as const) {
      if (caminhos.length === 0) continue;
      const { error: e } = await admin.storage.from(bucket).remove(caminhos);
      if (e) {
        console.error(`Erro ao remover arquivos de ${bucket}:`, e);
        arquivosPendentes += caminhos.length;
      }
    }
  } catch (e) {
    console.error("Erro ao remover arquivos das candidaturas:", e);
    arquivosPendentes = curriculos.length + fotos.length;
  }

  revalidatePath("/crm/empregos");
  revalidatePath("/crm/empregos/agenda");
  revalidatePath("/crm/empregos/vagas");
  return { ok: true, excluidas: existentes.length, naoEncontradas: validos.length - existentes.length, arquivosPendentes };
}
