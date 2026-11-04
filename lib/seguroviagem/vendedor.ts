import { createAdminClient } from "@/lib/supabase/admin";
import { MULT_SEGURO_VENDEDOR } from "@/app/lib/margemSeguroViagemParceiro";

// Vendedor do link de seguro (/produtos/seguro-viagem/direto?vendedor=...)
// — Wilson, 04/nov/2026 (migração 038). "u-<perfil_id>" = consultor/usuário,
// "e-<parceiro_id>" = empresa parceira. Preço final = custo × N% do vendedor
// (perfis/parceiros.margem_seguro_mult) ou o padrão de Preços (250%).

const FORMATO = /^([ue])-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export type VendedorSeguro = { chave: string; margem: number; perfilId: string | null; parceiroId: string | null; nome: string };

export async function vendedorSeguro(bruto: unknown): Promise<VendedorSeguro | null> {
  const m = FORMATO.exec(String(bruto ?? "").trim());
  if (!m) return null;
  const empresa = m[1].toLowerCase() === "e";
  const { data, error } = await createAdminClient()
    .from(empresa ? "parceiros" : "perfis")
    .select("*")
    .eq("id", m[2])
    .maybeSingle();
  if (error || !data) return null;
  if (empresa && data.ativo === false) return null;
  const mult = Number(data.margem_seguro_mult);
  const percentual = Number.isFinite(mult) && mult >= 100 ? mult : MULT_SEGURO_VENDEDOR;
  return {
    chave: `${m[1].toLowerCase()}-${m[2].toLowerCase()}`,
    margem: Math.round((percentual - 100) * 10) / 10,
    perfilId: empresa ? null : m[2],
    parceiroId: empresa ? m[2] : null,
    nome: (empresa ? data.nome : data.nome || data.email) ?? "Vendedor",
  };
}
