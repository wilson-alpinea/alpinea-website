import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TIPO_INTERACAO_LABEL } from "@/lib/crm/interacoes";
import { carregarPainel, falhou } from "@/lib/crm/painel";
import { FalhaCarregar, IconeAtividade, ROTULO_ATIVIDADE, SOMBRA, TIPOS_MANUAIS, Vazio, dataHora } from "../components/PainelUi";

export const metadata: Metadata = {
  title: "Atividade — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

// Histórico geral (Visão geral → "Ver histórico"/"Ver todas"): só eventos
// registrados no sistema — interações, mudanças de etapa e financeiro.
const FILTROS = [
  { id: "todas", label: "Tudo" },
  { id: "interacoes", label: "Interações" },
  { id: "etapas", label: "Mudanças de etapa" },
  { id: "financeiro", label: "Financeiro" },
] as const;

export default async function AtividadePage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo: t } = await searchParams;
  const tipo = FILTROS.some((x) => x.id === t) ? t! : "todas";
  const supabase = await createClient();
  const d = await carregarPainel(supabase, { eventos: 200 });
  const lista = falhou(d.eventos)
    ? []
    : d.eventos.filter((e) =>
        tipo === "interacoes"
          ? TIPOS_MANUAIS.includes(e.tipo)
          : tipo === "etapas"
            ? e.tipo.startsWith("mudanca_estagio")
            : tipo === "financeiro"
              ? e.tipo.startsWith("financeiro:") || e.tipo === "pagamento"
              : true,
      );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/crm" className="text-[13px] text-[#626B75] hover:text-[#24476B]">
          ← Visão geral
        </Link>
        <h1 className="mt-1 text-[#20252B]">Atividade</h1>
        <p className="mt-0.5 text-sm text-[#626B75]">Os 200 eventos mais recentes registrados no CRM.</p>
      </div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-[#E6E9ED]">
        {FILTROS.map((x) => (
          <Link
            key={x.id}
            role="tab"
            aria-selected={tipo === x.id}
            href={x.id === "todas" ? "/crm/atividade" : `/crm/atividade?tipo=${x.id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tipo === x.id ? "border-[#24476B] text-[#24476B]" : "border-transparent text-[#626B75] hover:text-[#20252B]"}`}
          >
            {x.label}
          </Link>
        ))}
      </div>
      {falhou(d.eventos) ? (
        <FalhaCarregar oque="a atividade" />
      ) : lista.length === 0 ? (
        <Vazio>Nenhum evento neste filtro.</Vazio>
      ) : (
        <ul className={`divide-y divide-[#EEF0F2] rounded-2xl border border-black/[0.06] bg-white px-5 ${SOMBRA}`}>
          {lista.map((e) => (
            <li key={e.id} className="flex gap-3 py-3.5">
              <IconeAtividade tipo={e.tipo} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium text-[#20252B]">{ROTULO_ATIVIDADE[e.tipo] ?? TIPO_INTERACAO_LABEL[e.tipo] ?? e.tipo}</span>
                  <span className="text-[#626B75]"> · </span>
                  <Link href={`/crm/clientes/${e.clienteId}`} className="font-semibold text-[#20252B] hover:underline">
                    {e.clienteNome}
                  </Link>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-[#20252B]">{e.resumo}</p>
                <p className="mt-0.5 text-[13px] tabular-nums text-[#626B75]">
                  {dataHora(e.quando)}
                  {e.autor && ` · ${e.autor}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
