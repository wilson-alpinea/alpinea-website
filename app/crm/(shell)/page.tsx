import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS, ESTAGIO_COR } from "@/lib/crm/estagios";
import type { Estagio } from "@/lib/crm/types";
import { NovosClientesChart } from "./components/NovosClientesChart";
import { FunilChart } from "./components/FunilChart";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dashboard — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function KpiCard({ label, valor, sublabel }: { label: string; valor: string; sublabel?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-black/40">{label}</p>
      <p className={`${display.className} mt-3 text-3xl font-medium text-black`}>{valor}</p>
      {sublabel && <p className="mt-1 text-xs text-black/40">{sublabel}</p>}
    </div>
  );
}

export default async function CrmDashboardPage() {
  const supabase = await createClient();

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, created_at, estagio, valor_estimado");

  if (error) {
    console.error("Erro ao carregar dashboard:", error);
  }

  const lista = clientes ?? [];

  const hoje = new Date();
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 6);
  seteDiasAtras.setHours(0, 0, 0, 0);

  const novosUltimos7Dias = lista.filter((c) => new Date(c.created_at) >= seteDiasAtras).length;

  const abertos = lista.filter((c) => c.estagio !== "fechado_ganho" && c.estagio !== "fechado_perdido");
  const valorEmPipeline = abertos.reduce((soma, c) => soma + (c.valor_estimado ?? 0), 0);

  const ganhos = lista.filter((c) => c.estagio === "fechado_ganho").length;
  const perdidos = lista.filter((c) => c.estagio === "fechado_perdido").length;
  const taxaConversao =
    ganhos + perdidos > 0 ? `${Math.round((ganhos / (ganhos + perdidos)) * 100)}%` : "—";

  // Novos clientes por dia — últimos 30 dias
  const dias: { data: string; total: number }[] = [];
  const contagemPorDia = new Map<string, number>();
  for (const c of lista) {
    const chave = new Date(c.created_at).toISOString().slice(0, 10);
    contagemPorDia.set(chave, (contagemPorDia.get(chave) ?? 0) + 1);
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const chave = d.toISOString().slice(0, 10);
    dias.push({
      data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      total: contagemPorDia.get(chave) ?? 0,
    });
  }

  const funil = ESTAGIOS.map((e) => ({
    estagio: e.valor,
    label: e.label,
    total: lista.filter((c) => c.estagio === e.valor).length,
    cor: ESTAGIO_COR[e.valor as Estagio],
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">Visão geral</p>
          <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
            Dashboard
          </h1>
        </div>
        <Link
          href="/crm/clientes/novo"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/85"
        >
          + Novo cliente
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clientes cadastrados" valor={String(lista.length)} />
        <KpiCard label="Novos — últimos 7 dias" valor={String(novosUltimos7Dias)} />
        <KpiCard
          label="Em pipeline aberto"
          valor={formatBRL(valorEmPipeline)}
          sublabel={`${abertos.length} propostas ativas`}
        />
        <KpiCard
          label="Taxa de conversão"
          valor={taxaConversao}
          sublabel={`${ganhos} ganhos · ${perdidos} perdidos`}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 lg:col-span-3">
          <h2 className={`${display.className} text-lg font-medium text-black`}>
            Novos clientes por dia
          </h2>
          <p className="mt-1 text-xs text-black/40">Últimos 30 dias</p>
          <div className="mt-4">
            <NovosClientesChart dados={dias} />
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 lg:col-span-2">
          <h2 className={`${display.className} text-lg font-medium text-black`}>
            Funil comercial
          </h2>
          <p className="mt-1 text-xs text-black/40">Clientes por estágio</p>
          <div className="mt-4">
            <FunilChart dados={funil} />
          </div>
        </div>
      </div>

      {lista.length === 0 && (
        <p className="mt-10 text-sm text-black/40">
          Nenhum cliente cadastrado ainda. Comece criando o primeiro em{" "}
          <Link href="/crm/clientes/novo" className="text-black underline underline-offset-4">
            + Novo cliente
          </Link>
          .
        </p>
      )}
    </div>
  );
}
