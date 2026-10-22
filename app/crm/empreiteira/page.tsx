import type { Metadata } from "next";
import Link from "next/link";
import { exigirParceiro } from "@/lib/crm/acesso";
import { COLUNAS_EMPREITEIRA, candidatosDaEmpreiteira } from "@/lib/crm/portalEmpreiteira";
import { PortalShell } from "../PortalShell";

// Portal da empreiteira (Wilson, 21/out/2026): pipeline dos candidatos das
// vagas dela, etapa atual e data de embarque. Somente leitura.

export const metadata: Metadata = {
  title: "Candidatos — Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const dataBR = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : null);

export default async function PortalEmpreiteiraPage({ searchParams }: { searchParams: Promise<{ vaga?: string }> }) {
  const acesso = await exigirParceiro("empreiteira");
  const { vaga } = await searchParams;
  const todos = await candidatosDaEmpreiteira(acesso.parceiro.id);
  const vagas = [...new Map(todos.map((c) => [c.vagaId, `${c.vagaTitulo} — ${c.vagaEmpresa}`])).entries()];
  const lista = vaga ? todos.filter((c) => c.vagaId === vaga) : todos;
  const comEmbarque = lista.filter((c) => c.dataEmbarque).sort((a, b) => a.dataEmbarque!.localeCompare(b.dataEmbarque!));

  return (
    <PortalShell titulo="Empreiteiras" empresa={acesso.parceiro.nome} usuario={acesso.email}>
      <p className="mb-2 text-[13px] text-[#626B75]">Candidatos das suas vagas</p>
      <h1 className={`text-3xl font-medium md:text-4xl`}>Pipeline de candidatos</h1>

      {vagas.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/crm/empreiteira" className={`rounded-full px-3 py-1 text-[13px] ${!vaga ? "bg-black text-white" : "border border-black/10 bg-white text-[#626B75]"}`}>
            Todas as vagas ({todos.length})
          </Link>
          {vagas.map(([id, nome]) => (
            <Link
              key={id}
              href={`/crm/empreiteira?vaga=${encodeURIComponent(id)}`}
              className={`rounded-full px-3 py-1 text-[13px] ${vaga === id ? "bg-black text-white" : "border border-black/10 bg-white text-[#626B75]"}`}
            >
              {nome} ({todos.filter((c) => c.vagaId === id).length})
            </Link>
          ))}
        </div>
      )}

      {todos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-[#626B75]">
          Ainda não há candidatos nas suas vagas. Assim que alguém se candidatar, aparece aqui.
        </p>
      ) : (
        <>
          {comEmbarque.length > 0 && (
            <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4">
              <h2 className="text-[13px] font-medium text-[#626B75]">Próximos embarques</h2>
              <ul className="mt-2 divide-y divide-black/5 text-sm">
                {comEmbarque.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link href={`/crm/empreiteira/${c.id}`} className="text-[#20252B] hover:underline">
                      {c.nome}
                    </Link>
                    <span className="text-[13px] text-[#626B75]">
                      {c.vagaTitulo} · embarque {dataBR(c.dataEmbarque)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUNAS_EMPREITEIRA.map((col) => {
              const daColuna = lista.filter((c) => c.coluna === col.key);
              return (
                <div key={col.key} className="rounded-2xl border border-black/5 bg-white">
                  <div className="flex items-center justify-between border-b border-black/10 px-3 py-3">
                    <span className="text-[13px] font-medium text-[#20252B]">{col.label}</span>
                    <span className="text-[13px] text-[#626B75]">{daColuna.length}</span>
                  </div>
                  <div className="space-y-2 p-2.5">
                    {daColuna.length === 0 && <p className="py-3 text-center text-[13px] text-black/20">Vazio</p>}
                    {daColuna.map((c) => (
                      <Link key={c.id} href={`/crm/empreiteira/${c.id}`} className="block rounded-xl border border-black/10 p-3 transition hover:border-black/30">
                        <p className="text-sm font-medium">{c.nome}</p>
                        <p className="text-[13px] text-[#626B75]">{c.vagaTitulo}</p>
                        <p className="mt-1 text-[13px] text-[#626B75]">{c.status}</p>
                        {c.dataEmbarque && <p className="mt-1 text-[13px] font-medium text-[#1C3A5E]">Embarque: {dataBR(c.dataEmbarque)}</p>}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PortalShell>
  );
}
