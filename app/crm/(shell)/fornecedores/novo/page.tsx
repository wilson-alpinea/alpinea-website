import type { Metadata } from "next";
import { createFornecedor } from "../../../actions";
import { FornecedorForm } from "../FornecedorForm";

export const metadata: Metadata = {
  title: "Novo fornecedor — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function NovoFornecedorPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-[13px] text-[#626B75]">Novo cadastro</p>
      <h1 className={`text-3xl font-medium text-[#20252B] md:text-4xl`}>
        Novo fornecedor
      </h1>

      {params.erro === "1" && (
        <p className="mt-4 text-sm text-red-600">
          Não foi possível salvar o fornecedor. Verifique os campos e tente novamente.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6 md:p-8">
        <FornecedorForm action={createFornecedor} submitLabel="Cadastrar fornecedor" />
      </div>
    </div>
  );
}
