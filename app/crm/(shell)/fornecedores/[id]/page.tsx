import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updateFornecedor } from "../../../actions";
import { FornecedorForm } from "../FornecedorForm";
import { DeleteFornecedorButton } from "./DeleteFornecedorButton";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fornecedor — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function FornecedorDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();

  const { data: fornecedor, error } = await supabase
    .from("fornecedores")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("Erro ao carregar fornecedor:", error);
  if (!fornecedor) notFound();

  const updateFornecedorComId = updateFornecedor.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/crm/fornecedores"
        className="text-xs uppercase tracking-[0.2em] text-black/40 transition hover:text-black"
      >
        ← Fornecedores
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
          {fornecedor.nome}
        </h1>
        <DeleteFornecedorButton id={id} />
      </div>

      {sp.erro === "1" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível salvar as alterações.</p>
      )}

      <div className="mt-8 rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6 md:p-8">
        <FornecedorForm
          action={updateFornecedorComId}
          fornecedor={fornecedor}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
