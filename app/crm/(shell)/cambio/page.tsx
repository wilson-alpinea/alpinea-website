import type { Metadata } from "next";
import Link from "next/link";
import { donoObrigatorio, exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { DIRECAO_LABEL, campoResumo, direcaoCambio, ienesDoResumo } from "@/lib/crm/cambio";
import { ehRegistroTeste } from "@/lib/crm/origem";
import type { Estagio } from "@/lib/crm/types";
import { SinoUnidade } from "../components/SinoUnidade";

// CRM de Câmbio — lista de pedidos (Wilson, 29/out/2026: "criar um CRM novo para câmbio").
export const metadata: Metadata = {
  title: "Pedidos — CRM Câmbio",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const COR = "#9A6B12";
const brl = (v: number | null) => (v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—");
const iene = (v: number | null) => (v ? `¥${v.toLocaleString("pt-BR")}` : "—");
const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const FILTROS = [
  { v: "abertos", t: "Em aberto" },
  { v: "compra", t: "Compra" },
  { v: "venda", t: "Venda" },
  { v: "fechados", t: "Fechados" },
  { v: "todos", t: "Todos" },
] as const;

type Linha = { id: string; nome: string; email: string | null; telefone: string | null; estagio: Estagio; valor_proposta: number | null; observacoes: string | null; origem: string | null; created_at: string; arquivado_em: string | null };

export default async function CambioPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const acesso = await exigirAdmin();
  const dono = donoObrigatorio(acesso);
  const { f } = await searchParams;
  const filtro = FILTROS.some((x) => x.v === f) ? (f as (typeof FILTROS)[number]["v"]) : "abertos";

  let consulta = createAdminClient()
    .from("clientes")
    .select("*")
    .contains("produto_secundario", ["cambio"])
    .order("created_at", { ascending: false })
    .limit(2000);
  if (dono) consulta = consulta.eq("responsavel_id", dono);
  const { data: brutos, error } = await consulta;
  if (error) console.error("Erro ao ler pedidos de câmbio:", error);
  const todos = ((brutos ?? []) as Linha[])
    .filter((c) => !c.arquivado_em && !ehRegistroTeste(c.origem))
    .map((c) => ({ ...c, direcao: direcaoCambio(c.observacoes), ienes: ienesDoResumo(c.observacoes), cidade: campoResumo(c.observacoes, "Cidade") }));

  const aberto = (e: Estagio) => e !== "fechado_ganho" && e !== "fechado_perdido";
  const lista = todos.filter((c) =>
    filtro === "abertos" ? aberto(c.estagio) : filtro === "fechados" ? !aberto(c.estagio) : filtro === "todos" ? true : c.direcao === filtro,
  );
  const ganhos = todos.filter((c) => c.estagio === "fechado_ganho");
  const cards = [
    ["Pedidos em aberto", String(todos.filter((c) => aberto(c.estagio)).length)],
    ["Compras (ienes)", iene(todos.filter((c) => c.direcao === "compra" && aberto(c.estagio)).reduce((s, c) => s + (c.ienes ?? 0), 0))],
    ["Vendas em aberto", String(todos.filter((c) => c.direcao === "venda" && aberto(c.estagio)).length)],
    ["Fechados (R$)", brl(ganhos.reduce((s, c) => s + Number(c.valor_proposta ?? 0), 0))],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]" style={{ fontSize: 28, fontWeight: 600 }}>
            Pedidos de câmbio
          </h1>
          <p className="mt-1 text-sm text-[#626B75]">Compra e venda de ienes feitas pelo site. Pix e entrega combinados pelo WhatsApp.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!dono && <SinoUnidade unidade="cambio" />}
          <a href="/produtos/cambio" target="_blank" rel="noreferrer" className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: COR }}>
            Página de câmbio ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([t, v]) => (
          <div key={t} className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[13px] text-[#626B75]">{t}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[#20252B]">{v}</p>
          </div>
        ))}
      </div>

      <nav aria-label="Filtros" className="flex flex-wrap gap-2">
        {FILTROS.map((x) => (
          <Link
            key={x.v}
            href={`/crm/cambio?f=${x.v}`}
            aria-current={filtro === x.v ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filtro === x.v ? "border-transparent text-white" : "border-[#D5DAE0] bg-white text-[#20252B] hover:border-[#9A6B12]/50"}`}
            style={filtro === x.v ? { backgroundColor: COR } : undefined}
          >
            {x.t}
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="rounded-xl bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">Não foi possível carregar os pedidos.</p>
      ) : lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#D5DAE0] bg-white px-4 py-10 text-center text-sm text-[#626B75]">Nenhum pedido neste filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[#F7F9FB] text-left text-[13px] text-[#626B75]">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Direção</th>
                <th className="px-4 py-3 font-medium">Ienes</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Pedido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {lista.map((c) => (
                <tr key={c.id} className="hover:bg-[#FBF8F1]">
                  <td className="px-4 py-3">
                    <Link href={`/crm/cambio/${c.id}`} className="font-medium text-[#20252B] hover:underline">
                      {c.nome}
                    </Link>
                    <span className="block text-[13px] text-[#626B75]">{[c.cidade, c.telefone].filter(Boolean).join(" · ") || c.email || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${c.direcao === "compra" ? "bg-[#F6EEDC] text-[#7A5410]" : "bg-[#E8F1EE] text-[#28665D]"}`}>{DIRECAO_LABEL[c.direcao]}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{iene(c.ienes)}</td>
                  <td className="px-4 py-3 tabular-nums">{brl(c.valor_proposta)}</td>
                  <td className="px-4 py-3">{ESTAGIO_LABEL[c.estagio] ?? c.estagio}</td>
                  <td className="px-4 py-3 tabular-nums text-[#626B75]">{data(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[13px] text-[#626B75]">Etapas: {ESTAGIOS.map((e) => e.label).join(" → ")}.</p>
    </div>
  );
}
