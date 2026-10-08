import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { VAGAS, type Vaga } from "@/app/lib/vagasCatalogo";

// Vagas ligadas/desligadas pelo CRM (/crm/empregos/vagas) — Wilson,
// 07/out/2026. Tabela public.vagas_status (migração 018): vaga sem linha
// = ativa. Só servidor.
//
// Usa um cliente sem cookies (chave publishable + policy de leitura
// pública) para as páginas públicas continuarem estáticas/ISR — o CRM
// chama revalidatePath("/empregos", "layout") ao salvar, então a mudança
// aparece no site na hora.
//
// Se a consulta falhar (migração não rodou, Supabase fora do ar), devolve
// conjunto vazio: o site mostra todas as vagas em vez de esconder tudo.
export const idsVagasInativas = cache(async function idsVagasInativas(): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return new Set();
  try {
    const supabase = createSupabaseClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from("vagas_status").select("vaga_id").eq("ativa", false);
    if (error) {
      console.error("Erro ao ler vagas_status:", error.message);
      return new Set();
    }
    return new Set((data ?? []).map((l) => String(l.vaga_id)));
  } catch (err) {
    console.error("Erro ao ler vagas_status:", err);
    return new Set();
  }
});

export async function vagasAtivas(): Promise<Vaga[]> {
  const inativas = await idsVagasInativas();
  return VAGAS.filter((v) => !inativas.has(v.id));
}

export async function vagaEstaAtiva(id: string): Promise<boolean> {
  return !(await idsVagasInativas()).has(id);
}

// Vagas listadas num hot site (landing de recrutamento): a vaga da própria
// landing primeiro e, depois, as outras vagas ativas da mesma empresa.
export async function vagasDoHotsite(vagaPrincipalId: string): Promise<Vaga[]> {
  const ativas = await vagasAtivas();
  const principal = VAGAS.find((v) => v.id === vagaPrincipalId);
  if (!principal) return [];
  const daEmpresa = ativas.filter((v) => v.empresa === principal.empresa);
  return [...daEmpresa.filter((v) => v.id === principal.id), ...daEmpresa.filter((v) => v.id !== principal.id)];
}
