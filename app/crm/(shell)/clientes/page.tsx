import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS, ESTAGIO_COR, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import type { Estagio } from "@/lib/crm/types";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Clientes — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

function formatBRL(valor: number | null) {
  if (valor === null) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

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
    .select("id, nome, email, telefone, estagio, valor_estimado, destino_interesse, created_at")
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
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/85"
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

      <div className="mt-8 overflow-hidden rounded-2xl border border-black/10">
        {lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-black/40">
            Nenhum cliente encontrado.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02] text-xs uppercase tracking-[0.15em] text-black/40">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Destino</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Estágio</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Valor estimado</th>
                <th className="px-5 py-3 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="px-5 py-4">
                    <Link href={`/crm/clientes/${c.id}`} className="text-black hover:underline">
                      {c.nome}
                    </Link>
                    <p className="mt-0.5 text-xs text-black/40">{c.email || c.telefone || "—"}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-black/60 md:table-cell">
                    {c.destino_interesse || "—"}
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs text-black/70"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: ESTAGIO_COR[c.estagio as Estagio] }}
                      />
                      {ESTAGIO_LABEL[c.estagio as Estagio]}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-black/60 lg:table-cell">
                    {formatBRL(c.valor_estimado)}
                  </td>
                  <td className="px-5 py-4 text-black/40">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
