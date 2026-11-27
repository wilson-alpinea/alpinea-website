"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { CAMPOS_EDITAVEIS, isStatusAgencia, type Agencia, type Alteracao } from "./dados";

// Grava o andamento de uma agência do checklist (Wilson, 27/nov/2026).
// Página interna em link privado, sem login: só os campos de andamento são
// aceitos; os dados da pesquisa (conta, porte, fontes) não mudam por aqui.

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE: Record<string, number> = { contato_nome: 120, contato_email: 160, proximo_passo: 300, responsavel: 60, observacoes: 4000 };

export async function salvarAgencia(ordem: number, alteracao: Alteracao, autor: string): Promise<{ ok: true; agencia: Agencia } | { ok: false; erro: string }> {
  if (!Number.isInteger(ordem) || ordem < 1 || ordem > 10000) return { ok: false, erro: "Agência inválida." };
  const update: Record<string, string | null> = {};
  for (const campo of CAMPOS_EDITAVEIS) {
    if (!(campo in alteracao)) continue;
    const bruto = alteracao[campo];
    const v = typeof bruto === "string" ? bruto.trim() : null;
    if (campo === "status") {
      if (!isStatusAgencia(v)) return { ok: false, erro: "Status inválido." };
      update.status = v;
    } else if (campo.endsWith("_em")) {
      if (v && !DATA.test(v)) return { ok: false, erro: "Data inválida." };
      update[campo] = v || null;
    } else if (campo === "contato_email") {
      if (v && !EMAIL.test(v)) return { ok: false, erro: "E-mail do contato inválido." };
      update[campo] = v ? v.toLowerCase() : null;
    } else {
      update[campo] = v ? v.slice(0, LIMITE[campo] ?? 500) : null;
    }
  }
  if (!Object.keys(update).length) return { ok: false, erro: "Nada para salvar." };
  update.updated_at = new Date().toISOString();
  update.updated_by = autor.trim().slice(0, 60) || null;

  const { data, error } = await createAdminClient().from("agencias_prospeccao").update(update).eq("ordem", ordem).select("*").maybeSingle();
  if (error || !data) {
    console.error("Erro ao salvar agência:", error?.message);
    return { ok: false, erro: error?.code === "42P01" || error?.code === "PGRST205" ? "Rode a migração 043 no Supabase." : "Não foi possível salvar. Tente de novo." };
  }
  return { ok: true, agencia: data as Agencia };
}
