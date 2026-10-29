import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProcessoDoc } from "@/lib/crm/documentacao";
import { DetalheDocumentacao } from "./DetalheDocumentacao";

export const metadata: Metadata = {
  title: "Processo — CRM Documentação",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function ProcessoDocPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
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
  const processo = {
    ...data,
    respostas: Array.isArray(data.respostas) ? data.respostas : [],
    campos: data.campos && typeof data.campos === "object" ? data.campos : {},
    aceites: Array.isArray(data.aceites) ? data.aceites : [],
    historico: Array.isArray(data.historico) ? data.historico : [],
  } as ProcessoDoc;
  return <DetalheDocumentacao processo={processo} />;
}
