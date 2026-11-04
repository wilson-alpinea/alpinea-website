import { Suspense } from "react";
import { donoObrigatorio, obterAcesso } from "@/lib/crm/acesso";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isClassificacao, progressoCandidatura } from "@/lib/crm/empregos";
import { ultimaReclassificacao } from "@/lib/crm/andamentoManual";
import { ListaCandidaturas, type CandidaturaLista } from "./ListaCandidaturas";
import { SinoUnidade } from "../components/SinoUnidade";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { followUpsVencidos, rotuloPrazo } from "@/lib/empregos/followups";

// Candidatos (CRM de Empregos) — redesenho 23/out/2026. O servidor entrega
// as candidaturas (só admin, via RLS) já com a etapa calculada pela mesma
// regra de antes (progressoCandidatura); busca, filtros, ordenação e
// paginação acontecem na tela e ficam na URL.

export const metadata: Metadata = {
  title: "Candidatos — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function CandidatosPage() {
  const supabase = await createClient();
  // Consultor: só os candidatos dele (migração 030).
  const dono = donoObrigatorio(await obterAcesso());
  let consulta = supabase.from("candidaturas_vagas").select("*").order("created_at", { ascending: false }).limit(5000);
  if (dono) consulta = consulta.eq("responsavel_id", dono);
  const [rCand, rEntrevistas] = await Promise.all([
    // "*" para funcionar antes e depois das migrações 016/020.
    consulta,
    supabase.from("entrevistas_agendadas").select("candidatura_id, inicio").eq("status", "agendada"),
  ]);
  if (rCand.error) console.error("Erro ao carregar candidaturas:", rCand.error);
  const entrevistaDe = new Map((rEntrevistas.data ?? []).map((e) => [e.candidatura_id as string, e.inicio as string]));

  // Anuladas pela blacklist (migração 037) não contam como ativas.
  const anuladas = (rCand.data ?? []).filter((c) => c.anulada_em).length;
  // Follow-ups que vencem hoje ou estão atrasados (migração 037).
  const followUps = dono ? [] : await followUpsVencidos(createAdminClient());

  const lista: CandidaturaLista[] = (rCand.data ?? []).filter((c) => !c.anulada_em).map((c) => {
    const p = progressoCandidatura(c, entrevistaDe.get(c.id));
    const r = ultimaReclassificacao(c.andamento_manual);
    return {
      id: c.id,
      nome: `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim(),
      email: c.email ?? null,
      telefone: c.telefone ?? null,
      vagaId: c.vaga_id,
      vagaEmpresa: c.vaga_empresa ?? "",
      vagaTitulo: c.vaga_titulo ?? "",
      pontuacao: typeof c.pontuacao === "number" ? c.pontuacao : null,
      classificacao: isClassificacao(c.classificacao) ? c.classificacao : null,
      motivos: (c.motivos_eliminacao ?? []) as string[],
      pontosRevisar: (c.pontos_revisar ?? []) as string[],
      status: c.status ?? "novo",
      etapa: p.etapa,
      etapaLabel: p.label,
      reclassificadoPor: r ? `${r.para === "eliminado" ? "Eliminado" : "Elegível"} manualmente por ${r.por}` : null,
      criadoEm: c.created_at,
    };
  });

  return (
    <>
      {followUps.length > 0 && (
        <section className="mb-6 rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#B42318] bg-[#FDF3F2] p-4">
          <h2 className="text-base text-[#B42318]">Follow-ups para hoje ({followUps.length})</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {followUps.map((f) => (
              <li key={f.id}>
                <Link href={`/crm/empregos/${f.candidatura_id}#followup`} className="font-medium text-[#202B28] underline-offset-2 hover:underline">
                  {f.nome}
                </Link>
                <span className="text-[#626E69]">
                  {" "}
                  · {rotuloPrazo(f.data_alvo)}
                  {f.nota ? ` — ${f.nota}` : f.vaga ? ` — ${f.vaga}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Suspense fallback={null}>
        <ListaCandidaturas
          candidaturas={lista}
          erro={!!rCand.error}
          acoes={
            dono ? null : (
              <>
                <SinoUnidade unidade="empregos" />
                <Link href="/crm/empregos/blacklist" className="rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] transition hover:border-[#B42318]/50" title="Candidaturas anuladas pela blacklist não aparecem nesta lista">
                  Blacklist{anuladas ? ` (${anuladas} anuladas)` : ""}
                </Link>
              </>
            )
          }
        />
      </Suspense>
    </>
  );
}
