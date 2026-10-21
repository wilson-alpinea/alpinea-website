import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS, ESTAGIO_COR } from "@/lib/crm/estagios";
import { PRODUTO_PRINCIPAL_LABEL, type ProdutoPrincipal } from "@/lib/crm/produtos";
import type { Estagio } from "@/lib/crm/types";
import { moveEstagio } from "../../actions";
import { EstagioSelect } from "./EstagioSelect";
import { EstatisticasPipeline, PERIODOS_ESTATISTICA } from "./EstatisticasPipeline";
import { calcularEstatisticas, type LeadEstatistica, type MudancaEstagio } from "@/lib/crm/estatisticasPipeline";
import { rotuloOrigem } from "@/lib/crm/canal";

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

// Pedidos de teste (nome "[TESTE] …" ou origem "TESTE …") ficam fora do
// pipeline — Wilson, 21/out/2026. Aparecem só com ?testes=1.
function ehTeste(c: { nome: string | null; origem: string | null }) {
  return /^\s*\[TESTE\]/i.test(c.nome ?? "") || /^\s*TESTE\b/i.test(c.origem ?? "");
}

function calcularDiasNaEtapa(lista: { id: string; created_at: string }[], entrada: Map<string, number>) {
  const agora = Date.now();
  return new Map(lista.map((c) => [c.id, Math.max(0, Math.floor((agora - (entrada.get(c.id) ?? Date.parse(c.created_at))) / 86_400_000))]));
}

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });

function inicioDoPeriodo(periodo: string): string | null {
  return periodo === "todos" ? null : new Date(Date.now() - Number(periodo) * 86_400_000).toISOString();
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ testes?: string; periodo?: string; etapa?: string }>;
}) {
  const { testes, periodo: periodoParam, etapa: etapaParam } = await searchParams;
  const etapaFiltro = ESTAGIOS.some((e) => e.valor === etapaParam) ? etapaParam! : null;
  const mostrarTestes = testes === "1";
  const periodo = PERIODOS_ESTATISTICA.some((p) => p.valor === periodoParam) ? periodoParam! : "90";
  const supabase = await createClient();

  // ── Estatísticas: todos os leads do período, INCLUSIVE arquivados ──
  const desde = inicioDoPeriodo(periodo);
  const leadsEst: (LeadEstatistica & { nome: string | null; origem: string | null })[] = [];
  for (let de = 0; ; de += 1000) {
    let q = supabase
      .from("clientes")
      .select("id, nome, origem, created_at, estagio, canal, arquivado_em, valor_proposta")
      .order("created_at", { ascending: true })
      .range(de, de + 999);
    if (desde) q = q.gte("created_at", desde);
    const { data, error: erroEst } = await q;
    if (erroEst) {
      console.error("Erro ao carregar estatísticas do pipeline:", erroEst);
      break;
    }
    leadsEst.push(...((data ?? []) as typeof leadsEst));
    if (!data || data.length < 1000) break;
  }
  const leadsValidos = leadsEst.filter((c) => !ehTeste(c));
  const idsValidos = new Set(leadsValidos.map((c) => c.id));
  const mudancas: MudancaEstagio[] = [];
  for (let de = 0; ; de += 1000) {
    let q = supabase
      .from("interacoes")
      .select("cliente_id, estagio_destino, data_evento, created_at")
      .eq("tipo", "mudanca_estagio")
      .order("created_at", { ascending: true })
      .range(de, de + 999);
    if (desde) q = q.gte("created_at", desde);
    const { data } = await q;
    mudancas.push(...((data ?? []) as MudancaEstagio[]).filter((m) => idsValidos.has(m.cliente_id)));
    if (!data || data.length < 1000) break;
  }
  const estatisticas = calcularEstatisticas(leadsValidos, mudancas);

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, nome, origem, estagio, valor_proposta, produto_principal, canal, canal_detalhe, created_at")
    // Leads arquivados (inativos) não entram no funil — Wilson, 21/out/2026.
    .is("arquivado_em", null)
    .order("created_at", { ascending: false });

  if (error) console.error("Erro ao carregar pipeline:", error);

  const todos = clientes ?? [];
  const qtdTestes = todos.filter(ehTeste).length;
  const lista = mostrarTestes ? todos : todos.filter((c) => !ehTeste(c));
  const listaVisivel = etapaFiltro ? lista.filter((c) => c.estagio === etapaFiltro) : lista;

  // Dias desde que o lead entrou na etapa atual (última mudança registrada
  // para essa etapa; sem registro, desde o cadastro).
  const entradaNaEtapa = new Map<string, number>();
  const idsLista = lista.map((c) => c.id);
  for (let i = 0; i < idsLista.length; i += 200) {
    const { data: mud } = await supabase
      .from("interacoes")
      .select("cliente_id, estagio_destino, data_evento, created_at")
      .eq("tipo", "mudanca_estagio")
      .in("cliente_id", idsLista.slice(i, i + 200));
    for (const m of mud ?? []) {
      const c = lista.find((x) => x.id === m.cliente_id);
      if (!c || m.estagio_destino !== c.estagio) continue;
      const t = Date.parse(m.data_evento ? `${String(m.data_evento).slice(0, 10)}T12:00:00Z` : m.created_at);
      if (Number.isFinite(t)) entradaNaEtapa.set(c.id, Math.max(entradaNaEtapa.get(c.id) ?? 0, t));
    }
  }
  const diasNaEtapa = calcularDiasNaEtapa(lista, entradaNaEtapa);
  const linkPipeline = (etapa: string | null) =>
    `/crm/pipeline?periodo=${periodo}${mostrarTestes ? "&testes=1" : ""}${etapa ? `&etapa=${etapa}` : ""}`;

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">Funil comercial</p>
      <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
        Pipeline
      </h1>
      {qtdTestes > 0 && (
        <p className="mt-2 text-xs text-black/45">
          {mostrarTestes
            ? `Mostrando ${qtdTestes} ${qtdTestes === 1 ? "pedido de teste" : "pedidos de teste"}. `
            : `${qtdTestes} ${qtdTestes === 1 ? "pedido de teste oculto" : "pedidos de teste ocultos"}. `}
          <Link href={mostrarTestes ? `/crm/pipeline?periodo=${periodo}` : `/crm/pipeline?periodo=${periodo}&testes=1`} className="underline hover:text-black">
            {mostrarTestes ? "Ocultar testes" : "Mostrar testes"}
          </Link>
        </p>
      )}

      <EstatisticasPipeline est={estatisticas} periodo={periodo} sufixoUrl={mostrarTestes ? "&testes=1" : ""} />

      {/* Pipeline em faixas por etapa (Wilson, 21/out/2026: o kanban de 6
          colunas ficava "caótico, extremamente vertical"). Resumo do funil
          em cima (clicável para filtrar) e, embaixo, uma lista por etapa,
          uma linha por lead. */}
      <section className="mt-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ESTAGIOS.map((e) => {
            const doEstagio = lista.filter((c) => c.estagio === e.valor);
            const soma = doEstagio.reduce((t, c) => t + (c.valor_proposta ?? 0), 0);
            const ativo = etapaFiltro === e.valor;
            return (
              <Link
                key={e.valor}
                href={linkPipeline(ativo ? null : e.valor)}
                className={`rounded-xl border bg-white px-3 py-2.5 transition hover:border-black/30 ${ativo ? "border-[#1C3A5E] ring-1 ring-[#1C3A5E]" : "border-black/5"}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ESTAGIO_COR[e.valor as Estagio] }} />
                  <span className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-black/60">{e.label}</span>
                </span>
                <span className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-xl font-medium tabular-nums text-black">{doEstagio.length}</span>
                  <span className="truncate text-xs tabular-nums text-black/45">{formatBRL(soma) ?? "—"}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-black/50">
          <span>
            {etapaFiltro ? `Mostrando só ${ESTAGIOS.find((e) => e.valor === etapaFiltro)?.label}` : "Todas as etapas"} · {listaVisivel.length}{" "}
            {listaVisivel.length === 1 ? "lead" : "leads"}
          </span>
          {etapaFiltro && (
            <Link href={linkPipeline(null)} className="underline hover:text-black">
              Ver todas as etapas
            </Link>
          )}
        </div>

        <div className="mt-2 space-y-4">
          {ESTAGIOS.filter((e) => !etapaFiltro || e.valor === etapaFiltro).map((e) => {
            const doEstagio = listaVisivel.filter((c) => c.estagio === e.valor);
            if (doEstagio.length === 0) return null;
            return (
              <div key={e.valor} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between gap-2 border-b border-black/5 bg-[#FAF9F6] px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: ESTAGIO_COR[e.valor as Estagio] }} />
                    <span className="text-xs font-medium uppercase tracking-[0.1em] text-black/70">{e.label}</span>
                    <span className="text-xs text-black/35">{doEstagio.length}</span>
                  </span>
                  <span className="text-xs tabular-nums text-black/45">
                    {formatBRL(doEstagio.reduce((t, c) => t + (c.valor_proposta ?? 0), 0)) ?? ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-[0.08em] text-black/40">
                      <tr>
                        <th className="px-4 py-2 font-medium">Cliente</th>
                        <th className="px-4 py-2 font-medium">Produto</th>
                        <th className="px-4 py-2 font-medium">Origem</th>
                        <th className="px-4 py-2 text-right font-medium">Valor</th>
                        <th className="px-4 py-2 font-medium">Na etapa</th>
                        <th className="w-48 px-4 py-2 font-medium">Mover para</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doEstagio.map((c) => {
                        const dias = diasNaEtapa.get(c.id) ?? 0;
                        return (
                          <tr key={c.id} className="border-t border-black/5 align-top hover:bg-black/[0.015]">
                            <td className="px-4 py-2.5">
                              <Link href={`/crm/clientes/${c.id}`} className="font-medium text-black hover:underline">
                                {c.nome}
                              </Link>
                              <span className="block text-[11px] text-black/40">entrou em {dataCurta(c.created_at)}</span>
                            </td>
                            <td className="px-4 py-2.5 text-black/60">
                              {c.produto_principal ? PRODUTO_PRINCIPAL_LABEL[c.produto_principal as ProdutoPrincipal] ?? c.produto_principal : "—"}
                            </td>
                            <td className="max-w-[200px] px-4 py-2.5 text-xs text-black/55">{rotuloOrigem(c.canal, c.canal_detalhe)}</td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-black/80">{formatBRL(c.valor_proposta) ?? "—"}</td>
                            <td className="whitespace-nowrap px-4 py-2.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                                  e.valor === "fechado_ganho" || e.valor === "fechado_perdido"
                                    ? "text-black/40"
                                    : dias > 14
                                      ? "bg-red-50 text-red-700"
                                      : dias > 7
                                        ? "bg-amber-50 text-amber-800"
                                        : "text-black/55"
                                }`}
                              >
                                {dias} {dias === 1 ? "dia" : "dias"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <EstagioSelect action={moveEstagio.bind(null, c.id)} estagios={ESTAGIOS} estagioAtual={c.estagio} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {listaVisivel.length === 0 && (
            <p className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-black/40">Nenhum lead nesta etapa.</p>
          )}
        </div>
        <p className="mt-3 text-[11px] text-black/40">
          &quot;Na etapa&quot; conta os dias desde a última mudança de etapa: amarelo a partir de 8 dias, vermelho a partir de 15.
        </p>
      </section>
    </div>
  );
}
