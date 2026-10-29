import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirDespachante } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { etapaDoc, servicoDoc, type EventoDoc } from "@/lib/crm/documentacao";
import { documentosServico, linhasFichaDoc, parseFichaDoc, type DocumentoEnviado } from "@/app/documentacao/processo";
import { pessoasDoProcesso } from "@/lib/documentacao/processoPublico";
import { PortalShell } from "../../PortalShell";

// Processo no portal do despachante (Wilson, 29/out/2026). Só o que é
// preciso para o trabalho: cadastro, ficha, documentos e mudanças de etapa.
// NUNCA mostra valores, pagamentos, contrato ou notas internas da equipe.
export const metadata: Metadata = {
  title: "Processo — Despachante Ajisai",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const FINANCEIRO = /valor|pre[cç]o|r\$|¥|pagamento|pago|parcela|ptax|cota[cç][aã]o/i;
const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="text-sm font-semibold text-[#20252B]">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
function Linhas({ linhas }: { linhas: [string, string][] }) {
  return (
    <dl className="divide-y divide-black/[0.06] text-sm">
      {linhas.map(([k, v], i) => (
        <div key={`${k}-${i}`} className="grid grid-cols-[minmax(0,42%)_1fr] gap-3 py-2">
          <dt className="text-[#626B75]">{k}</dt>
          <dd className="min-w-0 break-words text-[#20252B]">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ProcessoDespachantePage({ params }: { params: Promise<{ id: string }> }) {
  const acesso = await exigirDespachante();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: p } = await createAdminClient()
    .from("documentacao_processos")
    .select("id, nome, email, telefone, servico, etapa, created_at, respostas, campos, ficha, ficha_enviada_em, documentos, historico, despachante_id")
    .eq("id", id)
    .maybeSingle();
  if (!p || p.despachante_id !== acesso.userId) notFound();

  const servico = p.servico as "visto" | "elegibilidade" | "pet";
  const e = etapaDoc(p.etapa);
  // Respostas do cadastro sem nenhuma linha de valor/pagamento.
  const respostas = ((Array.isArray(p.respostas) ? p.respostas : []) as [string, string][]).filter(([k, v]) => !FINANCEIRO.test(k) && !FINANCEIRO.test(String(v)));
  const ficha = p.ficha ? linhasFichaDoc(servico, parseFichaDoc(servico, p.ficha, pessoasDoProcesso(p.campos as Record<string, string>, servico) || 1)) : [];
  const docs = (Array.isArray(p.documentos) ? p.documentos : []) as DocumentoEnviado[];
  const tipos = documentosServico(servico);
  const etapas = ((Array.isArray(p.historico) ? p.historico : []) as EventoDoc[]).filter((h) => h.tipo === "etapa" && h.para).reverse();

  return (
    <PortalShell titulo="Documentação" empresa="Despachante" usuario={acesso.email}>
      <Link href="/crm/despachante" className="text-[13px] text-[#626B75] hover:text-[#20252B]">← Processos</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[#20252B]">{p.nome}</h1>
          <p className="mt-1 text-sm text-[#626B75]">{servicoDoc(servico).label} · cadastro em {new Date(p.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: e.fundo, color: e.cor }}>{e.label}</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          {ficha.length > 0 ? (
            ficha.map((b) => (
              <Bloco key={b.titulo} titulo={b.titulo}>
                <Linhas linhas={b.linhas} />
              </Bloco>
            ))
          ) : (
            <Bloco titulo="Ficha completa">
              <p className="text-sm text-[#626B75]">O cliente ainda não enviou a ficha completa.</p>
            </Bloco>
          )}
          <Bloco titulo="Respostas do cadastro">
            <Linhas linhas={respostas} />
          </Bloco>
        </div>
        <div className="min-w-0 space-y-5">
          <Bloco titulo="Contato do cliente">
            <Linhas linhas={[["E-mail", p.email ?? ""], ["WhatsApp", p.telefone ?? ""]]} />
          </Bloco>
          <Bloco titulo="Documentos">
            <ul className="space-y-3 text-sm">
              {tipos.map((t) => {
                const deste = docs.filter((d) => d.tipo === t.id);
                return (
                  <li key={t.id}>
                    <p className={deste.length ? "text-[#20252B]" : "text-[#626B75]"}>
                      {deste.length ? "✓ " : "○ "}
                      {t.rotulo}
                    </p>
                    {deste.map((d) => (
                      <a key={d.id} href={`/crm/despachante/arquivo?path=${encodeURIComponent(d.path)}`} target="_blank" rel="noopener" className="ml-4 block truncate text-[13px] text-[#24476B] underline underline-offset-2">
                        {d.nome}
                      </a>
                    ))}
                  </li>
                );
              })}
            </ul>
          </Bloco>
          <Bloco titulo="Andamento">
            {etapas.length === 0 ? (
              <p className="text-sm text-[#626B75]">Sem mudanças de etapa registradas.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {etapas.map((h, i) => (
                  <li key={`${h.em}-${i}`}>
                    <span className="text-[#20252B]">{etapaDoc(h.para!).label}</span>
                    <span className="block text-[13px] text-[#626B75]">{dataHora(h.em)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
        </div>
      </div>
    </PortalShell>
  );
}
