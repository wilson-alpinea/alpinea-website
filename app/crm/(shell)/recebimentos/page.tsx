import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITUACAO_COR, SITUACAO_LABEL, nomeParcela } from "@/lib/crm/financeiro";
import { addDias, carregarPainel, falhou } from "@/lib/crm/painel";
import { FalhaCarregar, SOMBRA, Vazio, brl, dataCurta } from "../components/PainelUi";

export const metadata: Metadata = {
  title: "Recebimentos — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

// Parcelas em aberto de todos os clientes ativos (Visão geral, 22/out/2026).
// Só saldo devido de parcelas cadastradas — propostas não entram.
const FILTROS = [
  { id: "vencidas", label: "Vencidas" },
  { id: "7dias", label: "Próximos 7 dias" },
  { id: "abertas", label: "Todas em aberto" },
] as const;

export default async function RecebimentosPage({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { filtro: f } = await searchParams;
  const filtro = FILTROS.some((x) => x.id === f) ? f! : "abertas";
  const supabase = await createClient();
  const d = await carregarPainel(supabase, { eventos: 1 });

  const limite = addDias(d.hoje, 7);
  const abertas = falhou(d.parcelas) ? [] : d.parcelas.filter((p) => p.saldoC > 0 && p.situacao !== "cancelada");
  const contagem = {
    vencidas: abertas.filter((p) => p.atrasada).length,
    "7dias": abertas.filter((p) => p.data_vencimento && p.data_vencimento >= d.hoje && p.data_vencimento <= limite).length,
    abertas: abertas.length,
  } as Record<string, number>;
  const lista = abertas
    .filter((p) => (filtro === "vencidas" ? p.atrasada : filtro === "7dias" ? !!p.data_vencimento && p.data_vencimento >= d.hoje && p.data_vencimento <= limite : true))
    .sort((a, b) => (a.data_vencimento ?? "9999") < (b.data_vencimento ?? "9999") ? -1 : 1);
  const totalC = lista.reduce((s, p) => s + p.saldoC, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/crm" className="text-[13px] text-[#626B75] hover:text-[#24476B]">
          ← Visão geral
        </Link>
        <h1 className="mt-1 text-[#20252B]">Recebimentos</h1>
        <p className="mt-0.5 text-sm text-[#626B75]">Saldo devido das parcelas em aberto dos clientes ativos.</p>
      </div>

      <div role="tablist" className="flex flex-wrap gap-1 border-b border-[#E6E9ED]">
        {FILTROS.map((x) => (
          <Link
            key={x.id}
            role="tab"
            aria-selected={filtro === x.id}
            href={`/crm/recebimentos?filtro=${x.id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium tabular-nums ${filtro === x.id ? "border-[#24476B] text-[#24476B]" : "border-transparent text-[#626B75] hover:text-[#20252B]"}`}
          >
            {x.label} <span className="text-[#8A929B]">{falhou(d.parcelas) ? "—" : contagem[x.id]}</span>
          </Link>
        ))}
      </div>

      {falhou(d.parcelas) ? (
        <FalhaCarregar oque="as parcelas" />
      ) : lista.length === 0 ? (
        <Vazio>Nenhuma parcela neste filtro.</Vazio>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border border-black/[0.06] bg-white ${SOMBRA}`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F5F6F7] text-[13px] text-[#626B75]">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Parcela</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 text-right font-medium">Saldo devido</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F9FB]">
                  <td className="px-4 py-3">
                    <Link href={`/crm/clientes/${p.clienteId}#financeiro`} className="font-semibold text-[#20252B] hover:underline">
                      {p.clienteNome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#20252B]">{nomeParcela(p)}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#20252B]">{p.data_vencimento ? dataCurta(p.data_vencimento) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: SITUACAO_COR[p.situacao].texto, backgroundColor: SITUACAO_COR[p.situacao].fundo }}>
                      {SITUACAO_LABEL[p.situacao]}
                    </span>
                    {p.situacao === "parcial" && p.atrasada && <span className="ml-1.5 text-[13px] font-medium text-[#B42318]">em atraso</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[#20252B]">{brl(p.saldoC)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {!d.financeiroSemMigracao && (
                      <Link href={`/crm/clientes/${p.clienteId}?receber=${p.id}#financeiro`} className="rounded-lg bg-[#24476B] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#2C5480]">
                        Registrar recebimento
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E6E9ED]">
                <td colSpan={4} className="px-4 py-3 text-sm text-[#626B75]">
                  {lista.length} {lista.length === 1 ? "parcela" : "parcelas"}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#20252B]">{brl(totalC)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
