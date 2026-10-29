import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin, donoObrigatorio } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { HOST_AGENCIA } from "@/lib/crm/unidades";

// eSIM dentro do CRM de Seguro Viagem — "CRM de Seguro Viagem & eSIM"
// (Wilson, 29/out/2026). Lê pedidos_esim (migração 024), um por celular.
export const metadata: Metadata = {
  title: "eSIM — CRM Seguro Viagem & eSIM",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const STATUS: Record<string, { t: string; fundo: string; cor: string }> = {
  aguardando_pagamento: { t: "Aguardando pagamento", fundo: "#F2F3F5", cor: "#4A525C" },
  processando: { t: "Processando", fundo: "#E8EEF7", cor: "#24476B" },
  pedido_criado: { t: "eSIM emitido", fundo: "#E8F1EE", cor: "#28665D" },
  erro: { t: "Erro — verificar", fundo: "#FDECEA", cor: "#B42318" },
  cancelado: { t: "Cancelado", fundo: "#F2F3F5", cor: "#626B75" },
};
const FILTROS = [
  { v: "todos", t: "Todos" },
  { v: "erro", t: "Com erro" },
  { v: "processando", t: "Processando" },
  { v: "pedido_criado", t: "Emitidos" },
  { v: "aguardando_pagamento", t: "Aguardando pagamento" },
] as const;
const brl = (v: number | null) => (v ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—");
const data = (iso: string | null) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");

type Pedido = {
  id: string;
  created_at: string;
  cliente_id: string;
  plano_nome: string | null;
  plano_id: string;
  dias: number;
  data_inicio: string;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente: string | null;
  preco_brl: number | null;
  status: string;
  simpremium_order_number: string | null;
  iccid: string | null;
  erro: string | null;
};

export default async function EsimPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const acesso = await exigirAdmin();
  const { f } = await searchParams;
  const filtro = FILTROS.some((x) => x.v === f) ? f! : "todos";
  // pedidos_esim não tem responsável: consultor não vê esta lista.
  const semAcesso = !!donoObrigatorio(acesso);
  const { data: brutos, error } = semAcesso
    ? { data: [], error: null }
    : await createAdminClient().from("pedidos_esim").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) console.error("Erro ao ler pedidos_esim:", error);
  const todos = (brutos ?? []) as Pedido[];
  const lista = filtro === "todos" ? todos : todos.filter((p) => p.status === filtro);
  const emitidos = todos.filter((p) => p.status === "pedido_criado");
  const cards = [
    ["eSIMs emitidos", String(emitidos.length)],
    ["Receita (emitidos)", brl(emitidos.reduce((s, p) => s + Number(p.preco_brl ?? 0), 0))],
    ["Processando", String(todos.filter((p) => p.status === "processando").length)],
    ["Com erro", String(todos.filter((p) => p.status === "erro").length)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#24212A]" style={{ fontSize: 28, fontWeight: 600 }}>
            Pedidos de eSIM
          </h1>
          <p className="mt-1 text-sm text-[#67626F]">Um pedido por celular. Depois do pagamento, o eSIM é emitido automaticamente na Simpremium.</p>
        </div>
        <a href="/produtos/esim" target="_blank" rel="noreferrer" className="rounded-xl bg-[#75608B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#63507A]">
          Página do eSIM ↗
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([t, v]) => (
          <div key={t} className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[13px] text-[#67626F]">{t}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[#24212A]">{v}</p>
          </div>
        ))}
      </div>

      <nav aria-label="Filtros" className="flex flex-wrap gap-2">
        {FILTROS.map((x) => (
          <Link
            key={x.v}
            href={`/crm/seguro/esim?f=${x.v}`}
            aria-current={filtro === x.v ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filtro === x.v ? "border-transparent bg-[#75608B] text-white" : "border-[#D5DAE0] bg-white text-[#24212A] hover:border-[#75608B]/50"}`}
          >
            {x.t}
          </Link>
        ))}
      </nav>

      {semAcesso ? (
        <p className="rounded-xl bg-[#F2F3F5] px-4 py-3 text-sm text-[#4A525C]">Os pedidos de eSIM ficam visíveis só para a equipe administradora.</p>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">Não foi possível carregar os pedidos de eSIM (a migração 024 já rodou no Supabase?).</p>
      ) : lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#D5DAE0] bg-white px-4 py-10 text-center text-sm text-[#67626F]">Nenhum pedido de eSIM neste filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[#F7F6FA] text-left text-[13px] text-[#67626F]">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Início</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Pedido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {lista.map((p) => {
                const st = STATUS[p.status] ?? { t: p.status, fundo: "#F2F3F5", cor: "#4A525C" };
                return (
                  <tr key={p.id} className="align-top hover:bg-[#FAF8FC]">
                    <td className="px-4 py-3">
                      <a href={`https://${HOST_AGENCIA}/crm/clientes/${p.cliente_id}`} className="font-medium text-[#24212A] hover:underline">
                        {p.nome_cliente}
                      </a>
                      <span className="block text-[13px] text-[#67626F]">{p.email_cliente}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.plano_nome ?? p.plano_id}
                      <span className="block text-[13px] text-[#67626F]">{p.dias} dias{p.iccid ? ` · ICCID ${p.iccid}` : ""}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{data(p.data_inicio)}</td>
                    <td className="px-4 py-3 tabular-nums">{brl(p.preco_brl)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ backgroundColor: st.fundo, color: st.cor }}>{st.t}</span>
                      {p.simpremium_order_number && <span className="mt-1 block text-[12px] text-[#67626F]">Pedido {p.simpremium_order_number}</span>}
                      {p.status === "erro" && p.erro && <span className="mt-1 block max-w-[260px] text-[12px] text-[#B42318]">{p.erro}</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#67626F]">{data(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
