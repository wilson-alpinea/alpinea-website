import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ListaDocumentacao, type LinhaDoc } from "./ListaDocumentacao";
import { SinoUnidade } from "../components/SinoUnidade";

// CRM de Documentação — lista de processos (Wilson, 29/out/2026).
export const metadata: Metadata = {
  title: "Processos — CRM Documentação",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function DocumentacaoCrmPage() {
  await exigirAdmin();
  const { data, error } = await createAdminClient()
    .from("documentacao_processos")
    .select("id, created_at, updated_at, servico, etapa, nome, email, telefone, resumo, campos, valor_referencia_brl, valor_final, valor_total, ficha_enviada_em, contrato_aceito_em, motivo_saida")
    .order("updated_at", { ascending: false })
    .limit(3000);
  if (error) console.error("Erro ao ler documentacao_processos:", error);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#25211E]" style={{ fontSize: 26, fontWeight: 600 }}>
            Processos de documentação
          </h1>
          <p className="mt-1 text-sm text-[#6B635D]">Visto específico, Certificado de Elegibilidade e exportação de pet — onde cada processo está e qual é a próxima ação.</p>
        </div>
        {/* Sino e botões rápidos (Wilson, 29/out/2026). */}
        <div className="flex flex-wrap items-center gap-2">
          <SinoUnidade unidade="documentacao" />
          <Link href="/crm/documentacao/visao-geral" className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50">Visão geral</Link>
          <a href="/documentacao" target="_blank" rel="noreferrer" className="rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480]">
            Página de venda ↗
          </a>
        </div>
      </div>
      <Suspense>
        <ListaDocumentacao processos={(data ?? []) as LinhaDoc[]} erro={!!error} />
      </Suspense>
    </div>
  );
}
