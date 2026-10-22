import Link from "next/link";
import type { Estatisticas } from "@/lib/crm/estatisticasPipeline";

// Painel de estatísticas do funil — inclui leads arquivados (Wilson,
// 21/out/2026). Cálculo em lib/crm/estatisticasPipeline.ts.

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 1000) / 10}%`);
const dias = (v: number | null) => (v === null ? "—" : `${Math.round(v)} ${Math.round(v) === 1 ? "dia" : "dias"}`);
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const PERIODOS_ESTATISTICA = [
  { valor: "30", label: "30 dias" },
  { valor: "90", label: "90 dias" },
  { valor: "365", label: "12 meses" },
  { valor: "todos", label: "Tudo" },
] as const;

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4">
      <p className="text-[13px] text-[#626B75]">{rotulo}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums text-[#20252B]">{valor}</p>
      {detalhe && <p className="mt-0.5 text-[13px] text-[#626B75]">{detalhe}</p>}
    </div>
  );
}

export function EstatisticasPipeline({ est, periodo, sufixoUrl }: { est: Estatisticas; periodo: string; sufixoUrl: string }) {
  const maxAlcance = Math.max(1, ...est.etapas.map((e) => e.alcancaram));
  return (
    <section className="mt-8 rounded-2xl border border-black/5 bg-[#F3F1EC] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[#20252B]">Conversão do funil</h2>
          <p className="text-[13px] text-[#626B75]">Leads criados no período, incluindo arquivados. Pedidos de teste ficam de fora.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS_ESTATISTICA.map((p) => (
            <Link
              key={p.valor}
              href={`/crm/pipeline?periodo=${p.valor}${sufixoUrl}`}
              className={`rounded-full px-3 py-1 text-[13px] transition ${periodo === p.valor ? "bg-black text-white" : "border border-black/10 bg-white text-[#626B75] hover:text-[#20252B]"}`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Indicador rotulo="Leads" valor={String(est.total)} detalhe={`${est.abertos} em aberto · ${est.arquivados} arquivados`} />
        <Indicador rotulo="Conversão" valor={pct(est.conversao)} detalhe={`${est.ganhos} ganhos de ${est.total} leads`} />
        <Indicador rotulo="Taxa de vitória" valor={pct(est.taxaVitoria)} detalhe={`${est.ganhos} ganhos × ${est.perdidos} perdidos`} />
        <Indicador rotulo="Tempo até fechar" valor={dias(est.diasMedioAteFechar)} detalhe={`mediana ${dias(est.diasMedianaAteFechar)}`} />
        <Indicador rotulo="Valor ganho" valor={brl(est.valorGanho)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-medium text-[#626B75]">Onde estão desistindo</h3>
          <div className="mt-2 overflow-x-auto rounded-xl border border-black/5 bg-white">
            <table className="w-full min-w-[420px] text-left text-[13px]">
              <thead className="text-[#626B75]">
                <tr>
                  <th className="px-3 py-2 font-medium">Etapa</th>
                  <th className="px-3 py-2 font-medium">Chegaram</th>
                  <th className="px-3 py-2 font-medium">Perdidos aqui</th>
                  <th className="px-3 py-2 font-medium">Arquivados aqui</th>
                  <th className="px-3 py-2 font-medium">Tempo p/ chegar</th>
                </tr>
              </thead>
              <tbody>
                {est.etapas.map((e) => (
                  <tr key={e.estagio} className="border-t border-black/5">
                    <td className="px-3 py-2 text-[#20252B]">
                      {e.label}
                      <span className="mt-1 block h-1 rounded-full bg-black/5">
                        <span className="block h-1 rounded-full bg-[#1C3A5E]" style={{ width: `${(e.alcancaram / maxAlcance) * 100}%` }} />
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {e.alcancaram} <span className="text-[#626B75]">({pct(est.total ? e.alcancaram / est.total : null)})</span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-red-700/80">{e.estagio === "fechado_ganho" ? "—" : e.perdidos}</td>
                    <td className="px-3 py-2 tabular-nums text-[#626B75]">{e.estagio === "fechado_ganho" ? "—" : e.arquivados}</td>
                    <td className="px-3 py-2 tabular-nums text-[#626B75]">{e.estagio === "novo_lead" ? "—" : dias(e.diasMedioAteChegar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-medium text-[#626B75]">Por origem</h3>
          <div className="mt-2 overflow-x-auto rounded-xl border border-black/5 bg-white">
            <table className="w-full min-w-[420px] text-left text-[13px]">
              <thead className="text-[#626B75]">
                <tr>
                  <th className="px-3 py-2 font-medium">Origem</th>
                  <th className="px-3 py-2 font-medium">Leads</th>
                  <th className="px-3 py-2 font-medium">Ganhos</th>
                  <th className="px-3 py-2 font-medium">Conversão</th>
                  <th className="px-3 py-2 font-medium">Tempo até fechar</th>
                  <th className="px-3 py-2 text-right font-medium">Valor ganho</th>
                </tr>
              </thead>
              <tbody>
                {est.canais.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-[#626B75]">Nenhum lead no período.</td>
                  </tr>
                )}
                {est.canais.map((c) => (
                  <tr key={c.canal} className="border-t border-black/5">
                    <td className="px-3 py-2 text-[#20252B]">{c.label}</td>
                    <td className="px-3 py-2 tabular-nums">{c.leads}</td>
                    <td className="px-3 py-2 tabular-nums">{c.ganhos}</td>
                    <td className="px-3 py-2 tabular-nums">{pct(c.conversao)}</td>
                    <td className="px-3 py-2 tabular-nums text-[#626B75]">{dias(c.diasMedioAteFechar)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-[#20252B]">{brl(c.valorGanho)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
