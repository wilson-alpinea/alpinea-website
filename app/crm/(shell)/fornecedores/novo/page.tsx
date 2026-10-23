import type { Metadata } from "next";
import { VoltarLista } from "../../components/VoltarLista";
import { NovoFornecedor } from "./NovoFornecedor";

export const metadata: Metadata = {
  title: "Novo fornecedor — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Rota preservada (o cadastro principal agora é o painel lateral da lista).
export default function NovoFornecedorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <VoltarLista chave="crm.fornecedores.retorno" base="/crm/fornecedores" rotulo="Fornecedores" className="text-[13px] text-[#626B75] transition hover:text-[#24476B]" />
      <h1 className="text-[#20252B]">Novo fornecedor</h1>
      <section className="rounded-2xl border border-t-[3px] border-[#E4E7EB] border-t-[#24476B] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
        <NovoFornecedor />
      </section>
    </div>
  );
}
