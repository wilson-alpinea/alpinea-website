import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS } from "@/lib/crm/estagios";
import { ClientesTable } from "./ClientesTable";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Clientes — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estagio?: string }>;
}) {
  const params = await searchParams;
  const busca = (params.q ?? "").trim();
  const estagioFiltro = params.estagio ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("id, nome, email, telefone, estagio, valor_proposta, produto_principal, created_at")
    .order("created_at", { ascending: false });

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,telefone.ilike.%${busca}%`);
  }
  if (estagioFiltro) {
    query = query.eq("estagio", estagioFiltro);
  }

  const { data: clientes, error } = await query;
  if (error) console.error("Erro ao carregar clientes:", error);

  const lista = clientes ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">
            {lista.length} {lista.length === 1 ? "cliente" : "clientes"}
          </p>
          <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
            Clientes
          </h1>
        </div>
        <Link
          href="/crm/clientes/novo"
          className="rounded-full bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#254a73]"
        >
          + Novo cliente
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome, e-mail ou telefone…"
          className="min-w-[240px] flex-1 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
        />
        <select
          name="estagio"
          defaultValue={estagioFiltro}
          className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none transition focus:border-black/40"
        >
          <option value="">Todos os estágios</option>
          {ESTAGIOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl border border-black/15 px-5 py-2.5 text-sm text-black/70 transition hover:border-black/40 hover:text-black"
        >
          Filtrar
        </button>
        {(busca || estagioFiltro) && (
          <Link
            href="/crm/clientes"
            className="rounded-xl px-5 py-2.5 text-sm text-black/40 transition hover:text-black"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-8">
        {lista.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-black/10">
            <p className="p-8 text-center text-sm text-black/40">
              Nenhum cliente encontrado.
            </p>
          </div>
        ) : (
          <ClientesTable clientes={lista} />
        )}
      </div>
    </div>
  );
}
