import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS_FORNECEDOR } from "@/lib/crm/fornecedores";
import { FornecedoresTable } from "./FornecedoresTable";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fornecedores — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const busca = (params.q ?? "").trim();
  const categoriaFiltro = params.categoria ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("fornecedores")
    .select("id, nome, categoria, cidade, telefone, email, created_at")
    .order("created_at", { ascending: false });

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,telefone.ilike.%${busca}%`);
  }
  if (categoriaFiltro) {
    query = query.eq("categoria", categoriaFiltro);
  }

  const { data: fornecedores, error } = await query;
  if (error) console.error("Erro ao carregar fornecedores:", error);

  const lista = fornecedores ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">
            {lista.length} {lista.length === 1 ? "fornecedor" : "fornecedores"}
          </p>
          <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
            Fornecedores
          </h1>
        </div>
        <Link
          href="/crm/fornecedores/novo"
          className="rounded-full bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#254a73]"
        >
          + Novo fornecedor
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
          name="categoria"
          defaultValue={categoriaFiltro}
          className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none transition focus:border-black/40"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS_FORNECEDOR.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl border border-black/15 px-5 py-2.5 text-sm text-black/70 transition hover:border-black/40 hover:text-black"
        >
          Filtrar
        </button>
        {(busca || categoriaFiltro) && (
          <Link
            href="/crm/fornecedores"
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
              Nenhum fornecedor encontrado.
            </p>
          </div>
        ) : (
          <FornecedoresTable fornecedores={lista} />
        )}
      </div>
    </div>
  );
}
