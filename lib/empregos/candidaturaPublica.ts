import { createAdminClient } from "@/lib/supabase/admin";
import { fichaLiberada } from "@/app/lib/fichaCadastral";

// Carrega a candidatura pelas páginas públicas das etapas 2–4 (só servidor).
// Confere o token do link e a liberação da etapa 2 — sem isso, null.
export async function carregarCandidaturaPublica(id: string, token: string | undefined) {
  if (!token || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createAdminClient();
  const { data: c } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
  if (!c || c.ficha_token !== token || !fichaLiberada(c)) return null;
  return c;
}
