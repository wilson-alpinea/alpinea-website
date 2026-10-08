"use client";

// Página própria da vaga (ver page.tsx ao lado). Mesmo padrão visual das
// landings de recrutamento (barra azul-marinho fixa, títulos em Bodoni,
// botões azuis) e os mesmos blocos de detalhe do pop-up de /empregos.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Vaga } from "../../../lib/vagasCatalogo";
import {
  AnaliseVaga,
  CandidaturaModal,
  DetalhesVaga,
  InfoObrigatoriaVaga,
  SETOR_NOME,
  STATUS_LABEL,
  display,
  linkWhatsapp,
} from "../../EmpregosCliente";

const classeBotao =
  "flex h-12 items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9]";
const kicker = "text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70";

export default function VagaPagina({ vaga, ativa, hotsite }: { vaga: Vaga; ativa: boolean; hotsite: string | null }) {
  const [candidatando, setCandidatando] = useState(false);

  useEffect(() => {
    if (!candidatando) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [candidatando]);

  const msgWhats = `Olá! Vi a vaga ${vaga.titulo} — ${vaga.empresa}, ${vaga.cidade}/${vaga.regiao} no site da Ajisai e quero saber mais.`;

  const resumo: { rotulo: string; valor: string }[] = [
    { rotulo: "Salário", valor: vaga.salario },
    { rotulo: "Turno", valor: vaga.turno },
    { rotulo: "Contrato", valor: vaga.contrato },
    ...(vaga.idioma ? [{ rotulo: "Japonês", valor: vaga.idioma }] : []),
    ...(vaga.perfil ? [{ rotulo: "Perfil", valor: vaga.perfil }] : []),
  ];

  return (
    <main className={`min-h-screen overflow-x-clip bg-white pt-14 text-black ${ativa ? "pb-28 md:pb-16" : "pb-16"}`}>
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link href="/empregos#vagas" className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Vagas
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>
          {vaga.empresa} · {vaga.cidade}
        </p>
        <div className="flex-1" />
        <Link href="/" aria-label="Ajisai — página inicial" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-5 pt-8 md:px-8 md:pt-12">
        {!ativa && (
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Esta vaga não está recebendo candidaturas no momento.</p>
            <p className="mt-1">
              Veja as vagas abertas no{" "}
              <Link href="/empregos#vagas" className="font-semibold underline underline-offset-2">
                catálogo da Ajisai
              </Link>
              .
            </p>
          </div>
        )}

        {/* Cabeçalho da vaga */}
        <section aria-labelledby="t-vaga">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/50">
                {SETOR_NOME[vaga.setor]}
              </span>
              {vaga.status === "consulta" && (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                  {STATUS_LABEL.consulta}
                </span>
              )}
            </div>
            {vaga.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vaga.logo} alt={vaga.empresa} className="h-8 max-w-[130px] shrink-0 object-contain" />
            )}
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f6fb8]">{vaga.empresa}</p>
          <h1 id="t-vaga" className={`${display.className} mt-1 text-[28px] font-medium leading-tight text-[#0A2540] md:text-4xl`}>
            {vaga.titulo}
          </h1>
          <p className="mt-2 text-sm text-black/55">
            {vaga.cidade}, {vaga.regiao} — Japão
          </p>

          <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
            {resumo.map((r) => (
              <div key={r.rotulo} className="grid gap-1 py-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-0.5">{r.rotulo}</dt>
                <dd className={`text-sm ${r.rotulo === "Salário" ? "font-semibold text-[#0A2540]" : "text-black"}`}>{r.valor}</dd>
              </div>
            ))}
          </dl>

          {ativa && (
            <div className="mt-6 hidden gap-2 md:flex">
              <button type="button" onClick={() => setCandidatando(true)} className={classeBotao}>
                Iniciar candidatura
              </button>
              <a
                href={linkWhatsapp(msgWhats)}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center rounded-xl border border-black/15 px-6 text-sm font-semibold text-[#0A2540] transition hover:border-black/35"
              >
                Falar no WhatsApp
              </a>
            </div>
          )}
        </section>

        {hotsite && (
          <Link
            href={hotsite}
            className="mt-10 flex items-center justify-between gap-4 rounded-2xl bg-[#0A2540] p-5 text-white transition hover:bg-[#0d2f52] md:p-6"
          >
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Trabalhe e more em {vaga.cidade}</span>
              <span className={`${display.className} mt-1 block text-xl`}>Moradia, cidade e simulação de ganhos</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        )}

        <section aria-label="Análise da vaga" className="mt-10">
          <AnaliseVaga vaga={vaga} />
        </section>

        <section aria-labelledby="t-detalhes" className="mt-10">
          <p className={kicker}>Detalhes</p>
          <h2 id="t-detalhes" className={`${display.className} mt-2 text-2xl font-medium text-[#0A2540]`}>
            Moradia, benefícios e cidade
          </h2>
          <div className="mt-5">
            <InfoObrigatoriaVaga vaga={vaga} />
          </div>
        </section>

        <section aria-labelledby="t-condicoes" className="mt-10 border-t border-black/10 pt-8">
          <h2 id="t-condicoes" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
            Outras condições
          </h2>
          <div className="mt-4">
            <DetalhesVaga vaga={vaga} />
          </div>
        </section>

        {ativa && (
          <section className="mt-12 rounded-2xl border border-black/10 p-6 text-center md:p-8">
            <p className={`${display.className} text-2xl font-medium text-[#0A2540]`}>Quer esta vaga?</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/65">
              A candidatura leva poucos minutos: seus dados, algumas perguntas de triagem e o currículo.
            </p>
            <button type="button" onClick={() => setCandidatando(true)} className={`${classeBotao} mx-auto mt-5 w-full sm:w-auto`}>
              Iniciar candidatura
            </button>
          </section>
        )}
      </div>

      {ativa && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCandidatando(true)} className={`${classeBotao} flex-1`}>
              Iniciar candidatura
            </button>
            <a
              href={linkWhatsapp(msgWhats)}
              target="_blank"
              rel="noreferrer"
              aria-label="Falar no WhatsApp"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/15 text-[#0A2540]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {candidatando && <CandidaturaModal vaga={vaga} onFechar={() => setCandidatando(false)} />}
    </main>
  );
}
