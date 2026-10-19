"use client";

// Hot site da campanha custo zero — /empregos/custo-zero (banner 1 do
// carrossel de /empregos). Wilson, 18/out/2026: "porque as vagas do banner
// 1 não tem página própria especial? é pra criar".
//
// Mesmo template das landings Murata (LandingMurata.tsx / padrão de
// /produtos/passagens-aereas): barra fixa azul-marinho, hero em cartão com
// foto, faixa de resumo, títulos em Bodoni, botões azuis e barra de ação
// fixa no celular. Diferença: é uma campanha com várias vagas, então o
// centro da página é a comparação entre elas.
//
// Dados: fichas "Proposta de trabalho" e regulamento da campanha
// (15/10/2026 a 28/02/2027). COMPLIANCE:
// - Marca AJISAI só. Não citar a empreiteira da campanha.
// - Nunca publicar shoukai, bônus promocional, margem ou sousai (regras da
//   agência, não do candidato).
// - Custo zero sempre com a ressalva de elegibilidade e com as condições
//   de período e permanência mínima de 6 meses.
// - Candidatura só pela vaga (sem formulário próprio na landing).

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { display } from "../../produtos/page";
import { inter, IconeCheck } from "../transporte/compartilhado";
import { CONDICAO_CUSTO_ZERO } from "../../lib/landingsMurata";
import { AUXILIO_EMBARQUE_PANASONIC_UNNAN, localVaga, type Vaga } from "../../lib/vagasCatalogo";

const classeBotao =
  "flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] disabled:opacity-60";
const kicker = "text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70";

const PERIODO = "15/10/2026 a 28/02/2027";
const DESPESAS_INICIAIS_JPY = "¥250.000";

// Resumo curto de cada vaga para a comparação (o detalhe completo fica na
// página da vaga).
const RESUMO_VAGA: Record<string, { produz: string; turno: string; escala: string; aluguel: string; ponto: string }> = {
  "niticon-ohno": {
    produz: "Capacitores eletrônicos",
    turno: "Diurno e noturno, alternados por semana",
    escala: "4x2",
    aluguel: "¥36.000–45.000",
    ponto: "Menor aluguel da campanha",
  },
  "zest-higashiomi": {
    produz: "Tecido de fibra de vidro em rolos",
    turno: "3 turnos de 7 a 8h15, alternados a cada 2 dias",
    escala: "6x2",
    aluguel: "¥45.000–50.000",
    ponto: "Prêmio de admissão de ¥20.000",
  },
  "sun-denshi-masuda": {
    produz: "Componentes para geradores fotovoltaicos",
    turno: "3 meses só diurno; depois turnos de 12 horas",
    escala: "3x3",
    aluguel: "¥50.000–75.000",
    ponto: "3 dias de folga a cada 3 trabalhados",
  },
  "sun-denshi-izumo": {
    produz: "Componentes para geradores fotovoltaicos",
    turno: "3 meses só diurno; depois diurno ou noturno",
    escala: "5x2",
    aluguel: "¥50.000–75.000",
    ponto: "Transporte gratuito na área central",
  },
  "hichifuku-konan": {
    produz: "Treliças e andaimes — abastecimento de robô de solda",
    turno: "Diurno e noturno, alternados por semana",
    escala: "5x2, folga sábado e domingo",
    aluguel: "¥40.000–55.000",
    ponto: "45 a 60 horas extras por mês",
  },
};

const RESUMO = [
  { rotulo: "Salário", valor: "¥1.400–1.450/h", detalhe: "valor inicial por hora" },
  { rotulo: "Custos iniciais", valor: "Pagos pela empresa", detalhe: "passagem, visto e seguro-viagem" },
  { rotulo: "Embarque", valor: "Até 28/02/2027", detalhe: "desembarque a partir de 15/10/2026" },
  { rotulo: "Vagas", valor: "5 fábricas", detalhe: "Shimane, Fukui e Shiga" },
];

const PROCESSO = ["Candidatura pela vaga", "Análise do perfil e entrevista", "Documentação e visto", "Embarque para o Japão", "Início na fábrica"];

const FAQ = [
  {
    pergunta: "Preciso pagar a passagem aérea e o visto?",
    resposta: `Não, para quem desembarcar no Japão de ${PERIODO}: a empresa paga a passagem aérea, o seguro-viagem e o visto. ${CONDICAO_CUSTO_ZERO}`,
  },
  {
    pergunta: "E se eu sair da fábrica antes de 6 meses?",
    resposta: `A permanência mínima é de 6 meses. Quem sair antes tem desconto de ${DESPESAS_INICIAIS_JPY}, referente às despesas iniciais pagas pela empresa.`,
  },
  {
    pergunta: "E se o meu desembarque for depois de 28/02/2027?",
    resposta: `Fora do período da campanha, a passagem e o visto (${DESPESAS_INICIAIS_JPY}) não são pagos pela empresa: são descontados do salário em 5 parcelas.`,
  },
  {
    pergunta: "O apartamento é gratuito?",
    resposta:
      "Não. O aluguel, a água, o gás e a luz são pagos pelo trabalhador. Também não é obrigatório morar no apartamento da empresa — dá para alugar um imóvel por conta própria.",
  },
  {
    pergunta: "Posso pedir um adiantamento no começo?",
    resposta: "Sim. Depois de 2 semanas de trabalho, dá para pedir um vale de até ¥30.000.",
  },
  {
    pergunta: "Posso ir com a minha família?",
    resposta:
      "Sim. Casais com filhos podem ter um período de adaptação (konarashi) para um dos responsáveis. As despesas desse período são pagas no Brasil e devolvidas na folha de pagamento depois do início do trabalho.",
  },
];

function TituloSecao({ id, children, claro }: { id?: string; children: ReactNode; claro?: boolean }) {
  return (
    <h2 id={id} className={`${display.className} text-2xl font-medium md:text-[28px] ${claro ? "text-white" : "text-[#0A2540]"}`}>
      {children}
    </h2>
  );
}

function irParaVagas() {
  document.getElementById("vagas")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CardVaga({ v }: { v: Vaga }) {
  const r = RESUMO_VAGA[v.id];
  return (
    <li className="flex flex-col rounded-2xl border border-black/10 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f6fb8]">{v.empresa}</p>
          <p className="mt-0.5 text-xs text-black/55">{localVaga(v)}</p>
        </div>
        {v.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.logo} alt={v.empresa} className="h-6 max-w-[96px] shrink-0 object-contain" />
        )}
      </div>
      <p className={`${display.className} mt-3 text-lg font-medium leading-snug text-[#0A2540]`}>{r?.produz ?? v.titulo}</p>
      <p className={`${inter.className} mt-2 text-xl font-semibold text-black`}>{v.salario.split(" (")[0]}</p>
      {r && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-black/45">Turno</dt>
          <dd className="text-black/75">{r.turno}</dd>
          <dt className="text-black/45">Escala</dt>
          <dd className="text-black/75">{r.escala}</dd>
          <dt className="text-black/45">Aluguel</dt>
          <dd className="text-black/75">{r.aluguel}/mês (1 quarto)</dd>
        </dl>
      )}
      {r && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-[#f4f7fb] px-3 py-2 text-xs font-medium text-[#0A2540]">
          <IconeCheck className="h-3.5 w-3.5 shrink-0 text-[#1f6fb8]" />
          {r.ponto}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 md:mt-auto md:pt-5">
        <Link href={`/empregos/candidatura/${v.id}`} className={`${classeBotao} w-full sm:w-auto`}>
          Candidatar-se
        </Link>
        <Link href={`/empregos/vagas/${v.id}`} className="text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
          Detalhes da vaga
        </Link>
      </div>
    </li>
  );
}

export default function LandingCustoZero({ vagas, panasonicAtiva }: { vagas: Vaga[]; panasonicAtiva: boolean }) {
  const [vagasVisivel, setVagasVisivel] = useState(false);
  const vagasRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = vagasRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => setVagasVisivel(entries.some((e) => e.isIntersecting)), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-28 pt-14 text-black">
      {/* Barra fixa — padrão das páginas de produto */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link href="/empregos" className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Campanha custo zero</p>
        <div className="flex-1" />
        <Link href="/empregos" aria-label="Ajisai Empregos — página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
        </Link>
      </div>

      {/* Hero em cartão — a foto (pessoa à direita) ocupa o lado direito */}
      <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 md:pt-8">
        <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
          <div className="relative h-56 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
            <Image
              src="/images/empregos-destaque-custo-zero.webp"
              alt="Operadora de uniforme e luvas montando placas eletrônicas numa fábrica no Japão"
              fill
              priority
              sizes="(min-width: 640px) 760px, 100vw"
              className="object-cover object-[72%_40%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
            />
          </div>
          <div className="relative -mt-10 px-5 pb-7 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[44%] sm:flex-col sm:justify-center sm:px-10 sm:py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">Shimane · Fukui · Shiga</p>
            <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
              Trabalhe no Japão com passagem, visto e seguro pagos
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              5 vagas em fábricas de eletrônicos e materiais, de ¥1.400 a ¥1.450 por hora, para quem desembarcar no Japão até 28/02/2027.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={irParaVagas} className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-[#0A2540] transition hover:bg-white/90">
                Ver as 5 vagas
              </button>
              <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-white/20">
                Campanha até 28/02/2027
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <div className="min-w-0 space-y-14">
          {/* Resumo */}
          <section aria-label="Resumo da campanha" className="rounded-2xl border border-black/10 p-4 shadow-[0_8px_30px_rgba(10,37,64,0.06)] md:p-6">
            <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Resumo da campanha</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {RESUMO.map((r) => (
                <div key={r.rotulo} className="rounded-xl bg-[#f4f7fb] p-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">{r.rotulo}</dt>
                  <dd>
                    <span className={`${inter.className} mt-1 block text-lg font-semibold text-[#0A2540]`}>{r.valor}</span>
                    <span className="block text-xs text-black/55">{r.detalhe}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] leading-5 text-black/50">
              {CONDICAO_CUSTO_ZERO} Desembarque de {PERIODO} e permanência mínima de 6 meses na fábrica.
            </p>
          </section>

          {/* Vagas — o centro da página */}
          <section id="vagas" ref={vagasRef} aria-labelledby="t-vagas" className="scroll-mt-20">
            <p className={kicker}>Candidatura</p>
            <div className="mt-2">
              <TituloSecao id="t-vagas">Compare as vagas da campanha</TituloSecao>
            </div>
            <p className="mb-5 mt-2 text-sm text-black/65">
              Todas com passagem, visto e seguro-viagem pagos. Escolha a vaga e envie sua candidatura — nossa equipe analisa o perfil e responde pelo WhatsApp.
            </p>
            {vagas.length > 0 ? (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vagas.map((v) => (
                  <CardVaga key={v.id} v={v} />
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-black/10 p-6 text-sm leading-6 text-black/70 md:p-8">
                <p className="font-medium text-black">No momento as vagas desta campanha estão fechadas.</p>
                <p className="mt-1">
                  Veja as outras vagas no{" "}
                  <Link href="/empregos#vagas" className="font-semibold text-[#1f6fb8] underline underline-offset-2">
                    catálogo da Ajisai
                  </Link>
                  .
                </p>
              </div>
            )}
            {panasonicAtiva && (
              <Link
                href="/empregos/vagas/panasonic-unnan"
                className="mt-4 flex flex-col gap-1 rounded-2xl bg-[#f4f7fb] p-5 transition hover:bg-[#eaf0f7] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f6fb8]">Também com custo zero</span>
                  <span className={`${display.className} mt-1 block text-lg font-medium text-[#0A2540]`}>
                    Panasonic em Unnan, Shimane — ¥1.500/h e auxílio embarque de {AUXILIO_EMBARQUE_PANASONIC_UNNAN}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#1f6fb8]">Ver a vaga →</span>
              </Link>
            )}
          </section>

          {/* Regras da campanha */}
          <section aria-labelledby="t-regras" className="rounded-2xl bg-[#0A2540] px-5 py-7 text-white md:px-10 md:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Como funciona a campanha</p>
            <div className="mt-2">
              <TituloSecao id="t-regras" claro>
                O que é pago e quais são as condições
              </TituloSecao>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
              <div>
                <p className="text-sm font-semibold text-white">A empresa paga</p>
                <ul className="mt-3 space-y-2">
                  {["Passagem aérea", "Visto", "Seguro-viagem"].map((i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <IconeCheck className="h-4 w-4 shrink-0 text-[#7fb6e6]" />
                      {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-5 text-white/55">Valor de referência dessas despesas: {DESPESAS_INICIAIS_JPY}.</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Condições</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-white/80">
                  <li>
                    <span className="font-semibold text-white">Período:</span> vale para quem desembarcar no Japão de {PERIODO}.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Permanência mínima de 6 meses:</span> quem sair antes tem desconto de {DESPESAS_INICIAIS_JPY}, referente às despesas iniciais.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Casais com filhos:</span> pode haver um período de adaptação (konarashi) para um dos responsáveis; as despesas desse período são pagas no Brasil e devolvidas na folha depois do início do trabalho.
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-xs text-white/55">{CONDICAO_CUSTO_ZERO}</p>
          </section>

          {/* Custos do dia a dia — iguais nas 5 vagas */}
          <section aria-labelledby="t-custos">
            <p className={kicker}>No Japão</p>
            <div className="mt-2">
              <TituloSecao id="t-custos">Moradia e custos do dia a dia</TituloSecao>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 p-5">
                <p className="text-sm font-semibold text-[#0A2540]">Moradia</p>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  Apartamento da empresa de 1 quarto, de ¥36.000 a ¥75.000 por mês conforme a cidade. Não é obrigatório morar nele — dá para alugar por conta própria.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 p-5">
                <p className="text-sm font-semibold text-[#0A2540]">Contas e eletrodomésticos</p>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  Água, gás e luz por conta do trabalhador. Eletrodomésticos alugados: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês. Futon opcional: ¥7.700.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 p-5">
                <p className="text-sm font-semibold text-[#0A2540]">Benefícios</p>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  Seguro saúde, previdência e seguro-desemprego desde a admissão. Vale de até ¥30.000 depois de 2 semanas. Refeitório na fábrica.
                </p>
              </div>
            </div>
          </section>

          {/* Como funciona */}
          <section aria-labelledby="t-processo">
            <p className={kicker}>Como funciona</p>
            <div className="mt-2">
              <TituloSecao id="t-processo">Do Brasil à fábrica</TituloSecao>
            </div>
            <ol className="mt-5 space-y-3">
              {PROCESSO.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-sm text-black">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f6fb8] text-xs font-semibold text-white">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section aria-labelledby="t-faq">
            <TituloSecao id="t-faq">Perguntas frequentes</TituloSecao>
            <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
              {FAQ.map((f) => (
                <details key={f.pergunta} className="group">
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-black [&::-webkit-details-marker]:hidden">
                    {f.pergunta}
                    <span aria-hidden="true" className="text-xl font-light text-[#1f6fb8] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-4 pr-8 text-sm leading-6 text-black/70">{f.resposta}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link href="/empregos#vagas" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                Ver todas as vagas da Ajisai
              </Link>
            </p>
          </section>
        </div>
      </div>

      {/* Barra fixa no celular (some quando a lista de vagas está na tela) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform ${
          vagasVisivel ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 md:justify-end md:px-4">
          <p className={`${display.className} mr-auto hidden text-base text-[#0A2540] md:block`}>
            Campanha custo zero <span className="ml-2 text-sm text-black/50">até 28/02/2027</span>
          </p>
          <button type="button" onClick={irParaVagas} className={`${classeBotao} flex-1 md:w-auto md:flex-none`}>
            Ver vagas
          </button>
        </div>
      </div>
    </main>
  );
}
