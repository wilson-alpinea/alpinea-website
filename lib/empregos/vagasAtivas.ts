import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { VAGAS, type Vaga } from "@/app/lib/vagasCatalogo";
import { aplicarEdicoes, lerEdicao, type MapaEdicoes } from "@/app/lib/vagasEdicao";

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

function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return null;
  return createSupabaseClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Edições feitas no CRM (Wilson, 03/nov/2026) — tabela public.vagas_edicoes
// (migração 033), aplicadas por cima do catálogo do código. Se a consulta
// falhar, o site segue com o catálogo do código.
export const edicoesVagas = cache(async function edicoesVagas(): Promise<MapaEdicoes> {
  const supabase = clientePublico();
  if (!supabase) return {};
  try {
    const { data, error } = await supabase.from("vagas_edicoes").select("vaga_id, dados");
    if (error) {
      console.error("Erro ao ler vagas_edicoes:", error.message);
      return {};
    }
    const mapa: MapaEdicoes = {};
    for (const l of data ?? []) mapa[String(l.vaga_id)] = lerEdicao(l.dados);
    return mapa;
  } catch (err) {
    console.error("Erro ao ler vagas_edicoes:", err);
    return {};
  }
});

/** Catálogo completo (ativas e ocultas) já com as edições do CRM. */
export async function catalogoVagas(): Promise<Vaga[]> {
  return aplicarEdicoes(VAGAS, await edicoesVagas());
}

/** encontrarVaga() com as edições do CRM — use no servidor no lugar do original. */
export async function vagaAtual(id: string): Promise<Vaga | null> {
  return (await catalogoVagas()).find((v) => v.id === id) ?? null;
}

export async function vagasAtivas(): Promise<Vaga[]> {
  const [inativas, catalogo] = await Promise.all([idsVagasInativas(), catalogoVagas()]);
  return catalogo.filter((v) => !inativas.has(v.id));
}

export async function vagaEstaAtiva(id: string): Promise<boolean> {
  return !(await idsVagasInativas()).has(id);
}

// Vagas listadas num hot site (landing de recrutamento): a vaga da própria
// landing primeiro e, depois, as outras vagas ativas da mesma empresa.
export async function vagasDoHotsite(vagaPrincipalId: string): Promise<Vaga[]> {
  const [ativas, principal] = await Promise.all([vagasAtivas(), vagaAtual(vagaPrincipalId)]);
  if (!principal) return [];
  const daEmpresa = ativas.filter((v) => v.empresa === principal.empresa);
  return [...daEmpresa.filter((v) => v.id === principal.id), ...daEmpresa.filter((v) => v.id !== principal.id)];
}
