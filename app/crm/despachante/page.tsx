import type { Metadata } from "next";
import Link from "next/link";
import { exigirDespachante } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { etapaDoc, servicoDoc } from "@/lib/crm/documentacao";
import { PortalShell } from "../PortalShell";

// Portal do despachante (Wilson, 29/out/2026: "um determinado despachante vai
// ter acesso somente a esse cadastro ... não enxergarem informações do
// financeiro"). Lista só os processos atribuídos a ele no CRM de Documentação.
export const metadata: Metadata = {
  title: "Processos — Despachante Ajisai",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function DespachantePage() {
  const acesso = await exigirDespachante();
  const { data, error } = await createAdminClient()
    .from("documentacao_processos")
    .select("id, nome, servico, etapa, updated_at, resumo")
    .eq("despachante_id", acesso.userId)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) console.error("Erro no portal do despachante:", error);
  const lista = data ?? [];

  return (
    <PortalShell titulo="Despachante" empresa={acesso.nome} usuario={acesso.email} crm={{ nome: "Documentação", cor: "#8A5A3C" }}>
      <h1 className="text-[#20252B]">Processos atribuídos a você</h1>
      <p className="mt-1 text-sm text-[#626B75]">Dados do cadastro, ficha e documentos de cada processo. Para dúvidas, fale com a equipe Ajisai.</p>
      {lista.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center text-sm text-[#626B75]">Nenhum processo atribuído a você no momento.</p>
      ) : (
        <ul className="mt-6 divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/10 bg-white">
          {lista.map((p) => {
            const e = etapaDoc(p.etapa);
            return (
              <li key={p.id}>
                <Link href={`/crm/despachante/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-black/[0.02]">
                  <span className="min-w-0">
                    <span className="block font-semibold text-[#20252B]">{p.nome}</span>
                    <span className="block text-[13px] text-[#626B75]">
                      {servicoDoc(p.servico).label}
                      {p.resumo ? ` · ${p.resumo}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ backgroundColor: e.fundo, color: e.cor }}>{e.label}</span>
                    <span className="text-[13px] tabular-nums text-[#626B75]">{new Date(p.updated_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PortalShell>
  );
}
