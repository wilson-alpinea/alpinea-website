import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS } from "@/lib/crm/estagios";
import { ClientesTable } from "./ClientesTable";

export const metadata: Metadata = {
  title: "Clientes — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estagio?: string; arquivados?: string }>;
}) {
  const params = await searchParams;
  const busca = (params.q ?? "").trim();
  const estagioFiltro = params.estagio ?? "";
  // Leads arquivados ficam fora da lista; ?arquivados=1 mostra só eles.
  const verArquivados = params.arquivados === "1";

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("id, nome, email, telefone, estagio, valor_proposta, produto_principal, origem, created_at")
    .order("created_at", { ascending: false });

  query = verArquivados ? query.not("arquivado_em", "is", null) : query.is("arquivado_em", null);

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,telefone.ilike.%${busca}%,origem.ilike.%${busca}%`);
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
          <p className="mb-2 text-[13px] text-[#626B75]">
            {lista.length} {lista.length === 1 ? "cliente" : "clientes"}
          </p>
          <h1 className={`text-3xl font-medium text-[#20252B] md:text-4xl`}>
            {verArquivados ? "Leads arquivados" : "Clientes"}
          </h1>
          <Link
            href={verArquivados ? "/crm/clientes" : "/crm/clientes?arquivados=1"}
            className="mt-1 inline-block text-[13px] text-[#626B75] underline hover:text-[#20252B]"
          >
            {verArquivados ? "← Voltar para os ativos" : "Ver leads arquivados"}
          </Link>
        </div>
        <Link
          href="/crm/clientes/novo"
          className="rounded-full bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] hover:shadow-md hover:shadow-[#1C3A5E]/30"
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
          className="min-w-[240px] flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
        />
        {verArquivados && <input type="hidden" name="arquivados" value="1" />}
        <select
          name="estagio"
          defaultValue={estagioFiltro}
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#20252B] outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
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
          className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm text-[#20252B] transition hover:border-[#1C3A5E]/40 hover:text-[#1C3A5E]"
        >
          Filtrar
        </button>
        {(busca || estagioFiltro) && (
          <Link
            href="/crm/clientes"
            className="rounded-xl px-5 py-2.5 text-sm text-[#626B75] transition hover:text-[#20252B]"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-8">
        {lista.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <p className="p-8 text-center text-sm text-[#626B75]">
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
