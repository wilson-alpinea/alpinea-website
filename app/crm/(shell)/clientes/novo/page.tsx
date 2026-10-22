import type { Metadata } from "next";
import { createCliente } from "../../../actions";
import { ClienteForm } from "../ClienteForm";
import { createClient } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/crm/acesso";

export const metadata: Metadata = {
  title: "Novo cliente — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;
  const acesso = await exigirAdmin();
  const supabase = await createClient();
  const { data: parceiros } = await supabase
    .from("parceiros")
    .select("id, nome, ativo")
    .eq("tipo", "agencia")
    .eq("ativo", true)
    .order("nome");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-[13px] text-[#626B75]">Novo cadastro</p>
      <h1 className={`text-3xl font-medium text-[#20252B] md:text-4xl`}>
        Novo cliente
      </h1>

      {params.erro === "1" && (
        <p className="mt-4 text-sm text-red-600">
          Não foi possível salvar o cliente. Verifique os campos e tente novamente.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6 md:p-8">
        <ClienteForm action={createCliente} submitLabel="Cadastrar cliente" parceiros={parceiros ?? []} consultorEmailPadrao={acesso.email} />
      </div>
    </div>
  );
}
