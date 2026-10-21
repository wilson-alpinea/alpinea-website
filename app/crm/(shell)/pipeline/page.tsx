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

function inicioDoPeriodo(periodo: string): string | null {
  return periodo === "todos" ? null : new Date(Date.now() - Number(periodo) * 86_400_000).toISOString();
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ testes?: string; periodo?: string }>;
}) {
  const { testes, periodo: periodoParam } = await searchParams;
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
    .select("id, nome, origem, estagio, valor_proposta, produto_principal, canal, canal_detalhe")
    // Leads arquivados (inativos) não entram no funil — Wilson, 21/out/2026.
    .is("arquivado_em", null)
    .order("created_at", { ascending: false });

  if (error) console.error("Erro ao carregar pipeline:", error);

  const todos = clientes ?? [];
  const qtdTestes = todos.filter(ehTeste).length;
  const lista = mostrarTestes ? todos : todos.filter((c) => !ehTeste(c));

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

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ESTAGIOS.map((estagio) => {
          const clientesDoEstagio = lista.filter((c) => c.estagio === estagio.valor);
          return (
            <div key={estagio.valor} className="flex flex-col rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
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
                  const valor = formatBRL(c.valor_proposta);
                  return (
                    <div
                      key={c.id}
                      className="space-y-2 rounded-xl border border-black/10 bg-white p-3 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)] transition hover:border-black/25"
                    >
                      <Link href={`/crm/clientes/${c.id}`} className="block">
                        <p className="text-sm font-medium text-black hover:underline">{c.nome}</p>
                        {c.produto_principal && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-black/45">
                            {PRODUTO_PRINCIPAL_LABEL[c.produto_principal as ProdutoPrincipal]}
                          </p>
                        )}
                        {valor && <p className="mt-1.5 text-xs text-black/55">{valor}</p>}
                        <p className="mt-1 line-clamp-2 text-[11px] text-black/40">{rotuloOrigem(c.canal, c.canal_detalhe)}</p>
                      </Link>
                      <EstagioSelect
                        action={moveEstagio.bind(null, c.id)}
                        estagios={ESTAGIOS}
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
