import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { createCliente } from "../../../actions";
import { ClienteForm } from "../ClienteForm";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/40">Novo cadastro</p>
      <h1 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>
        Novo cliente
      </h1>

      {params.erro === "1" && (
        <p className="mt-4 text-sm text-red-400">
          Não foi possível salvar o cliente. Verifique os campos e tente novamente.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <ClienteForm action={createCliente} submitLabel="Cadastrar cliente" />
      </div>
    </div>
  );
}
