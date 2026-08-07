import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS, ESTAGIO_COR } from "@/lib/crm/estagios";
import type { Estagio } from "@/lib/crm/types";
import { moveEstagio } from "../../actions";
import { EstagioSelect } from "./EstagioSelect";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pipeline — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

function formatBRL(valor: number | null) {
  if (!valor) return null;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function PipelinePage() {
  const supabase = await createClient();

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, nome, estagio, valor_estimado, destino_interesse, tier")
    .order("created_at", { ascending: false });

  if (error) console.error("Erro ao carregar pipeline:", error);

  const lista = clientes ?? [];

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">Funil comercial</p>
      <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
        Pipeline
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ESTAGIOS.map((estagio) => {
          const clientesDoEstagio = lista.filter((c) => c.estagio === estagio.valor);
          return (
            <div key={estagio.valor} className="flex flex-col rounded-2xl border border-black/10 bg-black/[0.015]">
              <div className="flex items-center justify-between gap-2 border-b border-black/10 px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: ESTAGIO_COR[estagio.valor as Estagio] }}
                  />
                  <h2 className="text-[10px] font-medium uppercase leading-tight tracking-[0.08em] text-black/70">
                    {estagio.label}
                  </h2>
                </div>
                <span className="shrink-0 text-xs text-black/30">{clientesDoEstagio.length}</span>
              </div>

              <div className="flex-1 space-y-2.5 p-2.5">
                {clientesDoEstagio.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-black/20">Vazio</p>
                )}
                {clientesDoEstagio.map((c) => {
                  const valor = formatBRL(c.valor_estimado);
                  return (
                    <div
                      key={c.id}
                      className="space-y-2 rounded-xl border border-black/10 bg-white p-3 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)] transition hover:border-black/25"
                    >
                      <Link href={`/crm/clientes/${c.id}`} className="block">
                        <p className="text-sm font-medium text-black hover:underline">{c.nome}</p>
                        {c.destino_interesse && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-black/45">
                            {c.destino_interesse}
                          </p>
                        )}
                        {valor && <p className="mt-1.5 text-xs text-black/55">{valor}</p>}
                      </Link>
                      <EstagioSelect
                        action={moveEstagio.bind(null, c.id)}
                        estagioAtual={c.estagio}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
