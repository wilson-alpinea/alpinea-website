import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bodoni_Moda } from "next/font/google";
import { createAdminClient } from "@/lib/supabase/admin";
import { carregarCandidaturaPublica } from "@/lib/empregos/candidaturaPublica";
import { horariosDisponiveis } from "@/lib/empregos/agendaServidor";
import { proximaEtapa, urlEtapa } from "@/app/lib/etapasCandidatura";
import { WHATSAPP_AJISAI_NUMERO } from "@/lib/email/templateCliente";
import AgendamentoForm from "./AgendamentoForm";

// Etapa 4 — agendamento da pré-entrevista (Wilson, 06/out/2026).

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Pré-entrevista — Alpinea Empregos",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function AgendamentoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  const c = await carregarCandidaturaPublica(id, t);
  if (!c || !t) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 text-center">
        <div>
          <h1 className={`${display.className} text-2xl text-black`}>Link inválido</h1>
          <Link href="/empregos" className="mt-4 inline-block text-sm text-[#2f80c9] underline">
            Ver vagas
          </Link>
        </div>
      </main>
    );
  }
  const etapa = proximaEtapa(c);
  if (etapa !== "agendamento") redirect(urlEtapa(etapa, c.id, t));

  const supabase = createAdminClient();
  const { data: atual } = await supabase
    .from("entrevistas_agendadas")
    .select("inicio")
    .eq("candidatura_id", c.id)
    .eq("status", "agendada")
    .maybeSingle();
  const { config, horarios } = await horariosDisponiveis();
  const whatsapp = `https://wa.me/${WHATSAPP_AJISAI_NUMERO}?text=${encodeURIComponent(
    `[EMPREGOS · PRÉ-ENTREVISTA · #${c.id.slice(0, 8)}]\nOlá, equipe Ajisai! Sou ${c.nome} ${c.sobrenome}, candidato(a) à vaga ${c.vaga_titulo} (${c.vaga_empresa}). Preciso de ajuda com o horário da pré-entrevista.`,
  )}`;

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f80c9]">Etapa 4 · {c.vaga_empresa}</p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium text-black sm:text-4xl`}>Agende sua pré-entrevista</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">
          {c.nome}, escolha o melhor dia e horário (horário de Brasília). A conversa dura cerca de {config.duracao_min} minutos e
          é online.
        </p>
        <AgendamentoForm
          candidaturaId={c.id}
          token={t}
          horarios={horarios}
          agendadoEm={atual?.inicio ?? null}
          linkReuniao={config.link_reuniao}
          whatsapp={whatsapp}
        />
      </div>
    </main>
  );
}
