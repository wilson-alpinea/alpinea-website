import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIA_FORNECEDOR_LABEL, COR_CATEGORIA_FORNECEDOR, type CategoriaFornecedor } from "@/lib/crm/fornecedores";
import { FornecedorForm } from "../FornecedorForm";
import { VoltarLista } from "../../components/VoltarLista";
import { DeleteFornecedorButton } from "./DeleteFornecedorButton";

export const metadata: Metadata = {
  title: "Fornecedor — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function FornecedorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: fornecedor, error } = await supabase.from("fornecedores").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("Erro ao carregar fornecedor:", error);
    return (
      <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
        Não foi possível carregar o fornecedor. Recarregue a página.
      </p>
    );
  }
  if (!fornecedor) notFound();
  const cor = COR_CATEGORIA_FORNECEDOR[(fornecedor.categoria as CategoriaFornecedor) ?? "sem_categoria"] ?? COR_CATEGORIA_FORNECEDOR.sem_categoria;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <VoltarLista chave="crm.fornecedores.retorno" base="/crm/fornecedores" rotulo="Fornecedores" className="text-[13px] text-[#626B75] transition hover:text-[#24476B]" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-[#20252B]">{fornecedor.nome}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#626B75]">
            <span className="inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: cor.cor, backgroundColor: cor.fundo }}>
              {fornecedor.categoria ? CATEGORIA_FORNECEDOR_LABEL[fornecedor.categoria as CategoriaFornecedor] ?? fornecedor.categoria : "Categoria não informada"}
            </span>
            {fornecedor.cidade && <span>{fornecedor.cidade}</span>}
          </p>
        </div>
        <DeleteFornecedorButton id={id} />
      </div>
      <section className="rounded-2xl border border-t-[3px] border-[#E4E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]" style={{ borderTopColor: cor.cor }}>
        <h2 className="mb-5 text-[#20252B]">Dados do fornecedor</h2>
        <FornecedorForm fornecedor={fornecedor} />
      </section>
    </div>
  );
}
