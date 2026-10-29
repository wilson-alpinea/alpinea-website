import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { donoObrigatorio, exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { DIRECAO_LABEL, direcaoCambio } from "@/lib/crm/cambio";
import { moverEtapaCambio, notaCambio } from "../../../cambioActions";
import type { Estagio } from "@/lib/crm/types";

// CRM de Câmbio — ficha do pedido (Wilson, 29/out/2026).
export const metadata: Metadata = {
  title: "Pedido — CRM Câmbio",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const COR = "#9A6B12";
const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function PedidoCambioPage({ params }: { params: Promise<{ id: string }> }) {
  const acesso = await exigirAdmin();
  const dono = donoObrigatorio(acesso);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const admin = createAdminClient();
  const [{ data: c }, { data: notas }] = await Promise.all([
    admin.from("clientes").select("*").eq("id", id).contains("produto_secundario", ["cambio"]).maybeSingle(),
    admin.from("interacoes").select("id, conteudo, created_at").eq("cliente_id", id).order("created_at", { ascending: false }).limit(100),
  ]);
  if (!c || (dono && c.responsavel_id !== dono)) notFound();
  const direcao = direcaoCambio(c.observacoes);
  const linhas = String(c.observacoes ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes(": ") && !l.startsWith("["));

  return (
    <div className="space-y-6">
      <Link href="/crm/cambio" className="text-sm font-medium text-[#626B75] hover:text-[#20252B]">
        ← Pedidos de câmbio
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium" style={{ color: COR }}>{DIRECAO_LABEL[direcao]}</p>
          <h1 className="text-[#20252B]" style={{ fontSize: 28, fontWeight: 600 }}>{c.nome}</h1>
          <p className="mt-1 text-sm text-[#626B75]">Pedido em {quando(c.created_at)} · {ESTAGIO_LABEL[c.estagio as Estagio] ?? c.estagio}</p>
        </div>
        {c.telefone && (
          <a
            href={`https://wa.me/${String(c.telefone).replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: COR }}
          >
            WhatsApp ↗
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-black/[0.06] border-t-[3px] bg-white p-6" style={{ borderTopColor: COR }}>
          <h2 className="font-semibold text-[#20252B]">Dados do pedido</h2>
          <dl className="mt-4 divide-y divide-[#EEF0F2] text-sm">
            {linhas.map((l, i) => {
              const k = l.indexOf(": ");
              return (
                <div key={i} className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr]">
                  <dt className="text-[#626B75]">{l.slice(0, k)}</dt>
                  <dd className="text-[#20252B]">{l.slice(k + 2)}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <h2 className="font-semibold text-[#20252B]">Etapa</h2>
            <form action={moverEtapaCambio.bind(null, id)} className="mt-3 flex gap-2">
              <label htmlFor="estagio" className="sr-only">Etapa</label>
              <select id="estagio" name="estagio" defaultValue={c.estagio} className="min-h-[44px] flex-1 rounded-xl border border-[#D5DAE0] bg-white px-3 text-sm">
                {ESTAGIOS.map((e) => (
                  <option key={e.valor} value={e.valor}>{e.label}</option>
                ))}
              </select>
              <button className="min-h-[44px] rounded-xl px-4 text-sm font-medium text-white" style={{ backgroundColor: COR }}>Salvar</button>
            </form>
          </section>

          <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <h2 className="font-semibold text-[#20252B]">Notas</h2>
            <form action={notaCambio.bind(null, id)} className="mt-3 space-y-2">
              <label htmlFor="conteudo" className="sr-only">Nova nota</label>
              <textarea id="conteudo" name="conteudo" rows={3} required placeholder="Ex.: Pix recebido, ienes separados para entrega." className="w-full rounded-xl border border-[#D5DAE0] px-3 py-2 text-sm" />
              <button className="min-h-[44px] w-full rounded-xl border border-[#D5DAE0] text-sm font-medium text-[#20252B] hover:border-[#9A6B12]/60">Adicionar nota</button>
            </form>
            <ul className="mt-4 space-y-3">
              {(notas ?? []).map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="whitespace-pre-wrap text-[#20252B]">{n.conteudo.length > 400 ? `${n.conteudo.slice(0, 400)}…` : n.conteudo}</p>
                  <p className="text-[12px] text-[#626B75]">{quando(n.created_at)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
