import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/crm/acesso";
import { produtoVisivel } from "@/lib/crm/permissoes";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PagamentoDoc, ProcessoDoc } from "@/lib/crm/documentacao";
import { DetalheDocumentacao } from "./DetalheDocumentacao";

export const metadata: Metadata = {
  title: "Processo — CRM Documentação",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function ProcessoDocPage({ params }: { params: Promise<{ id: string }> }) {
  const acesso = await exigirAdmin();
  const { id } = await params;
  const valido = /^[0-9a-f-]{36}$/i.test(id);
  const { data, error } = valido ? await createAdminClient().from("documentacao_processos").select("*").eq("id", id).maybeSingle() : { data: null, error: null };
  if (error) console.error("Erro ao ler processo de documentação:", error);
  if (!data) {
    return (
      <div className="rounded-2xl border border-[#EAE2DB] bg-white p-8 text-center">
        <p className="text-base font-semibold text-[#25211E]">{error ? "Não foi possível carregar o processo." : "Processo não encontrado."}</p>
        <Link href="/crm/documentacao" className="mt-3 inline-block text-sm font-medium text-[#8A5A3C] hover:underline">
          Voltar para os processos
        </Link>
      </div>
    );
  }
  if (!produtoVisivel(acesso.permissoes, "documentacao", data.servico)) {
    return <div className="rounded-2xl border border-[#EAE2DB] bg-white p-8 text-center text-sm text-[#6B635D]">Seu acesso não inclui este serviço.</div>;
  }
  const processo = {
    ...data,
    respostas: Array.isArray(data.respostas) ? data.respostas : [],
    campos: data.campos && typeof data.campos === "object" ? data.campos : {},
    aceites: Array.isArray(data.aceites) ? data.aceites : [],
    historico: Array.isArray(data.historico) ? data.historico : [],
  } as ProcessoDoc;
  const { data: pagamentos } = await createAdminClient().from("documentacao_pagamentos").select("id, created_at, parcela, valor_brl, valor_jpy, cotacao_brl_por_jpy, status, forma_pagamento, pago_em, gateway_pedido_id").eq("processo_id", id).order("created_at", { ascending: false });
  // Despachantes cadastrados em Acessos (migração 029).
  const { data: despachantes } = await createAdminClient().from("perfis").select("id, nome, email").eq("papel", "despachante").order("nome");
  return (
    <DetalheDocumentacao
      processo={processo}
      pagamentos={(pagamentos ?? []) as PagamentoDoc[]}
      despachantes={(despachantes ?? []).map((d) => ({ id: d.id as string, nome: (d.nome as string) || (d.email as string) }))}
    />
  );
}
