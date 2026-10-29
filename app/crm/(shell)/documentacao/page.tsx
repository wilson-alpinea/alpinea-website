import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListaDocumentacao, type LinhaDoc } from "./ListaDocumentacao";

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
      <div>
        <h1 className="text-[#25211E]" style={{ fontSize: 26, fontWeight: 600 }}>
          Processos de documentação
        </h1>
        <p className="mt-1 text-sm text-[#6B635D]">Visto específico, Certificado de Elegibilidade e exportação de pet — onde cada processo está e qual é a próxima ação.</p>
      </div>
      <Suspense>
        <ListaDocumentacao processos={(data ?? []) as LinhaDoc[]} erro={!!error} />
      </Suspense>
    </div>
  );
}
