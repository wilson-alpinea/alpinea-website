import type { Metadata } from "next";
import { exigirSomenteAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { valoresNoAr } from "@/app/lib/parametrosPreco";
import { CATEGORIAS, PRODUTOS, listarParametros, descrever } from "./catalogo";
import { PrecosPagina, type HistoricoPreco, type ParametroTela } from "./PrecosPagina";

// Preços e margens de todos os cálculos do site (Wilson, 04/nov/2026):
// "acessível somente aos ADMIN wilson e vinicius [...] ao mudar, todo site
// muda o cálculo". Só admin abre a página (exigirSomenteAdmin); as ações
// conferem de novo no servidor (app/crm/precosActions.ts).

export const metadata: Metadata = {
  title: "Preços e margens — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function PrecosPage() {
  await exigirSomenteAdmin();
  const db = createAdminClient();
  const [rSalvos, rHist] = await Promise.all([
    db.from("precos_parametros").select("id, valor, updated_at, updated_by_email"),
    db.from("precos_parametros_historico").select("parametro_id, valor_anterior, valor_novo, alterado_em, alterado_por_email").order("alterado_em", { ascending: false }).limit(40),
  ]);
  const erroBanco = !!rSalvos.error;
  if (rSalvos.error) console.error("precos_parametros:", rSalvos.error);

  const salvos = new Map((rSalvos.data ?? []).map((r) => [r.id as string, { valor: Number(r.valor), em: r.updated_at as string, por: (r.updated_by_email as string | null) ?? null }]));
  const noAr = valoresNoAr();
  const parametros: ParametroTela[] = listarParametros().map((p) => ({
    ...p,
    noAr: noAr[p.id] ?? p.padrao,
    salvo: salvos.get(p.id)?.valor ?? null,
    salvoEm: salvos.get(p.id)?.em ?? null,
    salvoPor: salvos.get(p.id)?.por ?? null,
  }));
  const historico: HistoricoPreco[] = (rHist.data ?? []).map((h) => {
    const d = descrever(h.parametro_id as string);
    return {
      rotulo: d ? [PRODUTOS.find((g) => g.id === d.grupo)?.nome, d.secao, d.rotulo, d.coluna].filter(Boolean).join(" · ") : (h.parametro_id as string),
      unidade: d?.unidade ?? "num",
      anterior: h.valor_anterior == null ? null : Number(h.valor_anterior),
      novo: h.valor_novo == null ? null : Number(h.valor_novo),
      em: h.alterado_em as string,
      por: (h.alterado_por_email as string | null) ?? null,
    };
  });

  return (
    <PrecosPagina
      categorias={CATEGORIAS}
      produtos={PRODUTOS.map((g) => ({ ...g }))}
      parametros={parametros}
      historico={historico}
      erroBanco={erroBanco}
      hookConfigurado={!!process.env.VERCEL_DEPLOY_HOOK_PRECOS}
    />
  );
}
