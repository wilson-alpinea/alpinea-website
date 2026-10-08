"use client";

// Layout de checkout: barra fixa enxuta (sem menu do site), resumo da vaga
// no topo e formulário abaixo, em coluna única. Wilson, 08/out/2026: "na
// candidatura o painel lateral deve sair da lateral" — o resumo deixou de
// ser coluna à direita no desktop e vale o mesmo layout do celular.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarDataPostagem, type Vaga } from "../../../lib/vagasCatalogo";
import { CandidaturaModal, display } from "../../EmpregosCliente";

function Resumo({ vaga }: { vaga: Vaga }) {
  const linhas: { rotulo: string; valor: string }[] = [
    { rotulo: "Local", valor: `${vaga.cidade}, ${vaga.regiao}` },
    { rotulo: "Salário", valor: vaga.salario },
    { rotulo: "Turno", valor: vaga.turno },
    { rotulo: "Contrato", valor: vaga.contrato },
  ];
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f9fc] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f6fb8]">{vaga.empresa}</p>
          <p className={`${display.className} mt-1 text-lg font-medium leading-snug text-[#0A2540]`}>{vaga.titulo}</p>
        </div>
        {vaga.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vaga.logo} alt={vaga.empresa} className="h-6 max-w-[90px] shrink-0 object-contain" />
        )}
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2.5 border-t border-black/10 pt-4 text-sm sm:grid-cols-2 md:grid-cols-4">
        {linhas.map((l) => (
          <div key={l.rotulo}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">{l.rotulo}</dt>
            <dd className={`mt-0.5 ${l.rotulo === "Salário" ? "font-semibold text-[#0A2540]" : "text-black/75"}`}>{l.valor}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-black/10 pt-3">
        <p className="text-[11px] text-black/45">
          Vaga <span className="font-mono font-semibold text-black/60">{vaga.codigo}</span> · Publicada em {formatarDataPostagem(vaga.publicadaEm)}
        </p>
        <Link href={`/empregos/vagas/${vaga.id}`} className="text-xs font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
          Ver detalhes da vaga
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutCandidatura({ vaga, ativa }: { vaga: Vaga; ativa: boolean }) {
  const router = useRouter();
  const voltar = () => router.push(`/empregos/vagas/${vaga.id}`);

  return (
    <main className="min-h-screen bg-white pb-16 pt-14 text-black">
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link
          href={`/empregos/vagas/${vaga.id}`}
          className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Vaga
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate text-base font-medium text-white sm:text-lg`}>Candidatura</p>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-white/55 sm:flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Dados protegidos
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
        <h1 className={`${display.className} text-2xl font-medium text-[#0A2540] md:text-3xl`}>Candidatura</h1>
        <p className="mt-1 text-sm text-black/55">Preencha seus dados, responda a triagem e envie o currículo. Leva poucos minutos.</p>

        {!ativa ? (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Esta vaga não está recebendo candidaturas no momento.</p>
            <p className="mt-1">
              Veja as vagas abertas no{" "}
              <Link href="/empregos#vagas" className="font-semibold underline underline-offset-2">
                catálogo da Ajisai
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <Resumo vaga={vaga} />
            <CandidaturaModal vaga={vaga} onFechar={voltar} pagina />
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-black/40">
          Seus dados são usados só para esta candidatura, conforme a{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
