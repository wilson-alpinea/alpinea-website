import type { SupabaseClient } from "@supabase/supabase-js";
import { COOKIE_INDICACAO, SLUG_PARCEIRO } from "./unidades";
import { COOKIE_UTM, canalDaCampanha, lerCookieCampanha } from "./canal";

// Atribuição do lead criado pelos formulários do site (Wilson, 21/out/2026):
// parceiro (link ?parceiro=slug) e canal de origem (Google Ads, Meta, busca
// orgânica...). Lê os cookies gravados pelo proxy.ts. Uso:
//   .insert({ ...await atribuicaoDaRequisicao(req, supabase), nome, ... })

function lerCookie(req: Request, nome: string): string | null {
  const header = req.headers.get("cookie") || "";
  for (const parte of header.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nome) return v.join("=");
  }
  return null;
}

export type Atribuicao = {
  parceiro_id: string | null;
  canal: string;
  canal_detalhe: string | null;
  utm: Record<string, string> | null;
};

export async function atribuicaoDaRequisicao(req: Request, supabaseAdmin: SupabaseClient): Promise<Atribuicao> {
  const campanha = lerCookieCampanha(lerCookie(req, COOKIE_UTM));
  const { canal, detalhe } = canalDaCampanha(campanha);
  const base: Atribuicao = { parceiro_id: null, canal, canal_detalhe: detalhe, utm: campanha };

  const slug = (lerCookie(req, COOKIE_INDICACAO) || "").toLowerCase();
  if (!SLUG_PARCEIRO.test(slug)) return base;
  try {
    const { data } = await supabaseAdmin
      .from("parceiros")
      .select("id, nome")
      .eq("slug", slug)
      .eq("tipo", "agencia")
      .eq("ativo", true)
      .maybeSingle();
    if (!data) return base;
    return { ...base, parceiro_id: data.id, canal: "parceiro", canal_detalhe: data.nome };
  } catch {
    return base;
  }
}
