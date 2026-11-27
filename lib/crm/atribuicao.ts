import type { SupabaseClient } from "@supabase/supabase-js";
import { COOKIE_INDICACAO, COOKIE_INDICACAO_EM, SLUG_PARCEIRO } from "./unidades";
import { COOKIE_UTM, canalDaCampanha, lerCookieCampanha } from "./canal";
import { JANELA_ATRIBUICAO_DIAS } from "./programaPromotores";

// Atribuição do lead criado pelos formulários do site (Wilson, 21/out/2026):
// parceiro (link ?parceiro=slug) e canal de origem (Google Ads, Meta, busca
// orgânica...). Lê os cookies gravados pelo proxy.ts. Uso:
//   .insert({ ...await atribuicaoDaRequisicao(req, supabase), nome, ... })
//
// Programa de Promotores (Wilson, 27/nov/2026): vale para agência, afiliado
// e promotor (antes só a agência era reconhecida — o link do afiliado não
// marcava o lead), e também para a candidatura de empregos. Janela contada
// do dia em que o código foi registrado: emprego 60 dias; viagem 90 dias
// para promotor e 30 para agência/afiliado (regra anterior).

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

export type LinhaAtribuicao = "viagem" | "emprego";

function diasDesde(iso: string | null): number | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return Math.floor((Date.now() - Date.parse(`${iso}T00:00:00Z`)) / 86_400_000);
}

export async function atribuicaoDaRequisicao(req: Request, supabaseAdmin: SupabaseClient, linha: LinhaAtribuicao = "viagem"): Promise<Atribuicao> {
  const campanha = lerCookieCampanha(lerCookie(req, COOKIE_UTM));
  const { canal, detalhe } = canalDaCampanha(campanha);
  const base: Atribuicao = { parceiro_id: null, canal, canal_detalhe: detalhe, utm: campanha };

  const slug = (lerCookie(req, COOKIE_INDICACAO) || "").toLowerCase();
  if (!SLUG_PARCEIRO.test(slug)) return base;
  try {
    const { data } = await supabaseAdmin
      .from("parceiros")
      .select("id, nome, tipo")
      .eq("slug", slug)
      .in("tipo", ["agencia", "afiliado", "promotor"])
      .eq("ativo", true)
      .maybeSingle();
    if (!data) return base;
    // Cookie antigo (sem data) segue valendo pelo próprio prazo do cookie.
    const dias = diasDesde(lerCookie(req, COOKIE_INDICACAO_EM));
    const janela = linha === "emprego" ? JANELA_ATRIBUICAO_DIAS.emprego : data.tipo === "promotor" ? JANELA_ATRIBUICAO_DIAS.viagem : 30;
    if (dias !== null && dias > janela) return base;
    return { ...base, parceiro_id: data.id, canal: "parceiro", canal_detalhe: data.nome };
  } catch {
    return base;
  }
}
