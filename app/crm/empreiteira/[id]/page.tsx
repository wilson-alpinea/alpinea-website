import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirParceiro } from "@/lib/crm/acesso";
import { COLUNAS_EMPREITEIRA, candidatoDaEmpreiteira } from "@/lib/crm/portalEmpreiteira";
import { linhasFicha, type FichaCadastral } from "@/app/lib/fichaCadastral";
import { PortalShell, displayPortal } from "../../PortalShell";

// Ficha do candidato no portal da empreiteira (Wilson, 21/out/2026):
// documentos, data de embarque e etapa. Sem nota de triagem, classificação
// ou comentários internos da equipe.

export const metadata: Metadata = {
  title: "Candidato — Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const dataBR = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "A definir");

export default async function CandidatoEmpreiteiraPage({ params }: { params: Promise<{ id: string }> }) {
  const acesso = await exigirParceiro("empreiteira");
  const { id } = await params;
  const c = await candidatoDaEmpreiteira(acesso.parceiro.id, id);
  if (!c) notFound();
  const coluna = COLUNAS_EMPREITEIRA.find((k) => k.key === c.coluna)?.label ?? "";

  return (
    <PortalShell titulo="Empreiteiras" empresa={acesso.parceiro.nome} usuario={acesso.email}>
      <Link href="/crm/empreiteira" className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black">
        ← Candidatos
      </Link>
      <h1 className={`${displayPortal.className} mt-3 text-3xl font-medium md:text-4xl`}>{c.nome}</h1>
      <p className="mt-1 text-sm text-black/55">
        {c.vagaTitulo} — {c.vagaEmpresa}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">Etapa</p>
          <p className="mt-1 text-sm font-medium">{coluna}</p>
          <p className="text-xs text-black/50">{c.status}</p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">Data prevista de embarque</p>
          <p className="mt-1 text-sm font-medium">{dataBR(c.dataEmbarque)}</p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">Candidatura</p>
          <p className="mt-1 text-sm font-medium">{new Date(c.criadoEm).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {linhasFicha((c.ficha ?? null) as FichaCadastral | null).map((g) => (
            <section key={g.grupo} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-medium">{g.grupo}</h2>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {g.linhas.map(([k, v], i) => (
                  <div key={`${k}-${i}`} className="grid gap-1 py-2 sm:grid-cols-[180px_1fr] sm:gap-3">
                    <dt className="text-black/45">{k}</dt>
                    <dd className="break-words text-black/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {!c.ficha && (
            <p className="rounded-2xl border border-black/5 bg-white p-5 text-sm text-black/50">O candidato ainda não enviou a ficha cadastral.</p>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium">Documentos</h2>
            {c.documentos.length === 0 ? (
              <p className="mt-2 text-xs text-black/45">Nenhum documento ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {c.documentos.map((d) => (
                  <li key={d.chave}>
                    <a
                      href={`/crm/empreiteira/arquivo?c=${c.id}&k=${encodeURIComponent(d.chave)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-[#1C3A5E] underline"
                    >
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium">Andamento</h2>
            <ol className="mt-3 space-y-3">
              {c.linhaTempo.map((e) => (
                <li key={e.label} className="flex gap-2.5 text-xs">
                  <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${e.ok ? "bg-emerald-600" : "border border-black/20"}`} />
                  <span>
                    <span className={e.ok ? "text-black/80" : "text-black/45"}>{e.label}</span>
                    {e.quando && <span className="block text-black/40">{e.quando}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </PortalShell>
  );
}
