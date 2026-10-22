import type { Metadata } from "next";
import { exigirParceiro } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ESTAGIOS, ESTAGIO_COR } from "@/lib/crm/estagios";
import { PRODUTO_PRINCIPAL_LABEL, type ProdutoPrincipal } from "@/lib/crm/produtos";
import type { Estagio } from "@/lib/crm/types";
import { PortalShell } from "../PortalShell";

// Portal do parceiro da agência (Wilson, 21/out/2026): vê SOMENTE os leads
// gerados por ele, sem editar. Leitura com service role, filtrando pelo
// parceiro do usuário logado e devolvendo só as colunas liberadas (sem
// contato do cliente, pagamentos ou notas internas).

export const metadata: Metadata = {
  title: "Meus leads — Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

type LeadParceiro = {
  id: string;
  nome: string;
  estagio: Estagio;
  produto_principal: string | null;
  valor_proposta: number | null;
  data_viagem: string | null;
  created_at: string;
  arquivado_em: string | null;
};

const brl = (v: number | null) => (v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "—");
const data = (iso: string | null) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");

export default async function PortalParceiroPage() {
  const acesso = await exigirParceiro("agencia");
  const { data: brutos, error } = await createAdminClient()
    .from("clientes")
    .select("id, nome, estagio, produto_principal, valor_proposta, data_viagem, created_at, arquivado_em")
    .eq("parceiro_id", acesso.parceiro.id)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) console.error("Erro ao carregar leads do parceiro:", error);
  const leads = ((brutos ?? []) as LeadParceiro[]).filter((l) => !/^\s*\[TESTE\]/i.test(l.nome));

  const ativos = leads.filter((l) => !l.arquivado_em);
  const ganhos = leads.filter((l) => l.estagio === "fechado_ganho").length;
  const emAndamento = ativos.filter((l) => l.estagio !== "fechado_ganho" && l.estagio !== "fechado_perdido").length;
  const link = `https://www.alpinea.io/?parceiro=${acesso.parceiro.slug}`;

  return (
    <PortalShell titulo="Parceiros" empresa={acesso.parceiro.nome} usuario={acesso.email}>
      <p className="mb-2 text-[13px] text-[#626B75]">Leads indicados por você</p>
      <h1 className={`text-3xl font-medium md:text-4xl`}>Meus leads</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Leads", String(leads.length)],
          ["Em andamento", String(emAndamento)],
          ["Fechados", String(ganhos)],
          ["Conversão", leads.length ? `${Math.round((ganhos / leads.length) * 100)}%` : "—"],
        ].map(([r, v]) => (
          <div key={r} className="rounded-xl border border-black/5 bg-white p-4">
            <p className="text-[13px] text-[#626B75]">{r}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-black/5 bg-white p-4 text-sm">
        <p className="text-[13px] text-[#626B75]">Seu link de indicação</p>
        <code className="mt-1 block break-all text-[13px] text-[#1C3A5E]">{link}</code>
        <p className="mt-1 text-[13px] text-[#626B75]">
          Todo pedido feito no site em até 30 dias depois de abrir o seu link aparece aqui. O parâmetro funciona em qualquer página, ex.:
          alpinea.io/produtos/jrpass?parceiro={acesso.parceiro.slug}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {ESTAGIOS.map((e) => {
          const doEstagio = ativos.filter((l) => l.estagio === e.valor);
          return (
            <div key={e.valor} className="rounded-2xl border border-black/5 bg-white">
              <div className="flex items-center justify-between border-b border-black/10 px-3 py-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ESTAGIO_COR[e.valor] }} />
                  <span className="text-[13px] font-medium text-[#20252B]">{e.label}</span>
                </span>
                <span className="text-[13px] text-[#626B75]">{doEstagio.length}</span>
              </div>
              <div className="space-y-2 p-2.5">
                {doEstagio.length === 0 && <p className="py-3 text-center text-[13px] text-black/20">Vazio</p>}
                {doEstagio.map((l) => (
                  <div key={l.id} className="rounded-xl border border-black/10 p-3">
                    <p className="text-sm font-medium">{l.nome}</p>
                    {l.produto_principal && (
                      <p className="text-[13px] text-[#626B75]">{PRODUTO_PRINCIPAL_LABEL[l.produto_principal as ProdutoPrincipal] ?? l.produto_principal}</p>
                    )}
                    <p className="mt-1 text-[13px] text-[#626B75]">{brl(l.valor_proposta)}</p>
                    <p className="text-[13px] text-[#626B75]">Entrou em {data(l.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {leads.some((l) => l.arquivado_em) && (
        <p className="mt-6 text-[13px] text-[#626B75]">
          {leads.filter((l) => l.arquivado_em).length} lead(s) arquivado(s) por inatividade não aparecem no quadro, mas contam nos números acima.
        </p>
      )}
    </PortalShell>
  );
}
