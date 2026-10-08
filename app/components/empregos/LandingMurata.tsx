"use client";

// Landing de recrutamento Murata (Izumo e Echizen) — v2, 07/out/2026.
// Wilson: "reformule a página, está fora dos nossos padrões, por exemplo
// nossa página de produtos/passagens aéreas; falta o logo da empresa [...]
// simplifique a página e use as imagens". Mesmo template de
// /produtos/passagens-aereas: barra fixa azul-marinho com Voltar + título +
// logo Ajisai, hero em cartão com foto à direita, títulos em Bodoni,
// botões azuis, cartão de resumo fixo na lateral (desktop) e barra de
// ação fixa no rodapé (celular). Conteúdo/compliance em
// app/lib/landingsMurata.ts.
//
// 07/out/2026 (mais tarde) — Wilson: "remover [o formulário de pré-análise],
// o candidato tem que se candidatar pelas vagas que já estão no site, não
// existe caminho especial; listar nos hot sites as vagas". O formulário
// curto saiu; no lugar, a lista das vagas do catálogo (só as ativas no
// CRM), com a mesma candidatura de /empregos (CandidaturaModal) e link para
// a página própria de cada vaga.

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { display, WHATSAPP_NUMBER } from "../../produtos/page";
import { inter, IconeCheck } from "../transporte/compartilhado";
import { COTACAO_FALLBACK_BRL_POR_JPY_COMPRA, COTACAO_FALLBACK_BRL_POR_JPY_VENDA } from "../../lib/cambioIene";
import { formatBRL, formatJPY } from "../../lib/currency";
import { AUXILIO_EMBARQUE_BRL, CONDICAO_CUSTO_ZERO, type ConfigLanding, type Planta } from "../../lib/landingsMurata";
import type { Vaga } from "../../lib/vagasCatalogo";
import { CandidaturaModal } from "../../empregos/EmpregosCliente";

const linkWhatsapp = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const classeBotao =
  "flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] disabled:opacity-60";
const kicker = "text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70";

function TituloSecao({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className={`${display.className} text-2xl font-medium text-[#0A2540] md:text-[28px]`}>
      {children}
    </h2>
  );
}

function irParaVagas() {
  document.getElementById("vagas")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Vagas do catálogo nesta landing ──
function ListaVagas({ vagas, vagaPrincipalId, cidade, onCandidatar }: { vagas: Vaga[]; vagaPrincipalId: string; cidade: string; onCandidatar: (v: Vaga) => void }) {
  if (vagas.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 p-6 text-sm leading-6 text-black/70 md:p-8">
        <p className="font-medium text-black">No momento não há vagas abertas em {cidade}.</p>
        <p className="mt-1">
          Veja as outras vagas no{" "}
          <Link href="/empregos#vagas" className="font-semibold text-[#1f6fb8] underline underline-offset-2">
            catálogo da Ajisai
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {vagas.map((v) => (
        <li key={v.id} className={`flex flex-col rounded-2xl border p-5 md:p-6 ${v.id === vagaPrincipalId ? "border-[#1f6fb8] ring-1 ring-[#1f6fb8]" : "border-black/10"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f6fb8]">{v.empresa}</p>
              <p className="mt-0.5 text-xs text-black/55">
                {v.cidade}, {v.regiao}
              </p>
            </div>
            {v.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.logo} alt={v.empresa} className="h-6 max-w-[96px] shrink-0 object-contain" />
            )}
          </div>
          <p className={`${display.className} mt-3 text-lg font-medium leading-snug text-[#0A2540]`}>{v.titulo}</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div>
              <dt className="sr-only">Salário</dt>
              <dd className={`${inter.className} font-semibold text-black`}>{v.salario}</dd>
            </div>
            <div>
              <dt className="sr-only">Turno</dt>
              <dd className="text-black/65">{v.turno}</dd>
            </div>
            {v.perfil && (
              <div>
                <dt className="sr-only">Perfil</dt>
                <dd className="text-black/65">Perfil: {v.perfil}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 md:mt-auto md:pt-5">
            <button type="button" onClick={() => onCandidatar(v)} className={`${classeBotao} w-full sm:w-auto`}>
              Candidatar-se
            </button>
            <Link href={`/empregos/vagas/${v.id}`} className="text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
              Detalhes da vaga
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Plantas — galeria no estilo de imobiliária de alto padrão (Wilson,
// 07/out/2026: "parecido com imobiliária de alto padrão como Cyrela").
// Abas por tipologia, planta grande sobre fundo claro, ficha técnica ao
// lado e "ampliar" em tela cheia (createPortal — learnings Safari iOS). ──
function Plantas({ plantas }: { plantas: Planta[] }) {
  const [i, setI] = useState(0);
  const [aberta, setAberta] = useState(false);
  const p = plantas[i];
  const total = plantas.length;
  const mudar = (d: number) => setI((n) => (n + d + total) % total);

  useEffect(() => {
    if (!aberta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(false);
      if (e.key === "ArrowRight") setI((n) => (n + 1) % total);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + total) % total);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [aberta, total]);

  const seta = (dir: "esq" | "dir") => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d={dir === "esq" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );

  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0A2540]/60">Tipos de acomodação disponíveis</p>
          <p className={`${display.className} mt-1 text-xl font-medium text-[#0A2540]`}>Escolha sua planta</p>
        </div>
        <p className={`${inter.className} hidden text-xs tabular-nums text-black/45 sm:block`}>
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      {/* Miniaturas das plantas no lugar dos botões de texto (Wilson,
          07/out/2026: "quero miniaturas das imagens em vez de botão 1K, 2DK"). */}
      <div role="tablist" aria-label="Tipologias" className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {plantas.map((pl, n) => (
          <button
            key={pl.tipo}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={`Planta ${pl.tipo} — ${pl.titulo}`}
            onClick={() => setI(n)}
            className={`group w-24 shrink-0 overflow-hidden rounded-xl border bg-white text-left transition sm:w-auto ${
              n === i ? "border-[#0A2540] ring-2 ring-[#0A2540]" : "border-black/10 opacity-75 hover:border-black/30 hover:opacity-100"
            }`}
          >
            <span className="relative block aspect-square bg-[#f6f5f2]">
              <Image src={pl.imagem.src} alt="" fill sizes="(min-width: 640px) 180px, 96px" className="object-cover object-[50%_55%] transition duration-300 group-hover:scale-105" />
            </span>
            <span className={`block px-2.5 py-2 text-center text-[12px] tracking-[0.12em] ${n === i ? "font-semibold text-[#0A2540]" : "text-black/65"}`}>{pl.tipo}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid overflow-hidden rounded-2xl border border-black/10 bg-white md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => setAberta(true)}
          className="group relative aspect-[4/5] bg-[#f6f5f2]"
          aria-label={`Ampliar planta ${p.tipo}`}
        >
          <Image key={p.imagem.src} src={p.imagem.src} alt={p.imagem.alt} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-contain p-3 transition duration-500 group-hover:scale-[1.02]" />
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0A2540] shadow-sm ring-1 ring-black/5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
            </svg>
          </span>
        </button>
        <div className="flex flex-col p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-black/45">Tipologia</p>
          <p className={`${display.className} mt-1 text-5xl font-medium leading-none text-[#0A2540]`}>{p.tipo}</p>
          <p className="mt-3 text-[15px] text-black/75">{p.titulo}</p>
          <dl className="mt-6 divide-y divide-black/10 border-y border-black/10 text-sm">
            <div className="py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">Ambientes</dt>
              <dd className="mt-1 text-black/80">{p.ambientes}</dd>
            </div>
            <div className="py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">Indicado para</dt>
              <dd className="mt-1 text-black/80">{p.indicado}</dd>
            </div>
            <div className="py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">Aluguel de referência</dt>
              <dd className={`${inter.className} mt-1 font-semibold tabular-nums text-[#0A2540]`}>
                {p.aluguel}
                <span className="font-normal text-black/45"> /mês</span>
              </dd>
            </div>
          </dl>
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <button type="button" onClick={() => setAberta(true)} className="text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
              Ampliar planta
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => mudar(-1)} aria-label="Planta anterior" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#0A2540] hover:border-black/40">
                {seta("esq")}
              </button>
              <button type="button" onClick={() => mudar(1)} aria-label="Próxima planta" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#0A2540] hover:border-black/40">
                {seta("dir")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-black/50">
        Plantas conceituais, apenas como referência. Imóvel, metragem e disposição variam conforme a disponibilidade no momento da alocação.
      </p>

      {aberta &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label={`Planta ${p.tipo}`} className="fixed inset-0 z-[100] flex flex-col bg-[#0A2540]/95 backdrop-blur-sm" onClick={() => setAberta(false)}>
            <div className="flex h-14 shrink-0 items-center justify-between px-4 text-white md:px-8">
              <p className={`${display.className} text-lg`}>
                Planta {p.tipo} <span className="ml-2 text-sm text-white/60">{p.titulo}</span>
              </p>
              <button type="button" onClick={() => setAberta(false)} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-0 flex-1 px-4 pb-4 md:px-20 md:pb-8" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-white">
                <Image key={p.imagem.src} src={p.imagem.src} alt={p.imagem.alt} fill sizes="100vw" className="object-contain p-2" />
              </div>
              <button type="button" onClick={() => mudar(-1)} aria-label="Planta anterior" className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0A2540] shadow md:left-5">
                {seta("esq")}
              </button>
              <button type="button" onClick={() => mudar(1)} aria-label="Próxima planta" className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0A2540] shadow md:right-5">
                {seta("dir")}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Simulador de ganhos (Wilson, 07/out/2026: "estimativa de quanto
// dinheiro um trabalhador consegue gerar em reais e em ienes [...] deduzir
// gastos com moradia ou algo que seja obrigatório"). Premissas abaixo são
// ESTIMATIVAS de referência — ficam todas explícitas na tela. ──
const SIM_DIAS_MES_PADRAO = 20; // escala 4×2 ≈ 20 dias trabalhados por mês (config.simulacao.diasMes sobrescreve)
const SIM_HORAS_NORMAIS_DIA = 8;
const SIM_HORAS_NOTURNAS_POR_TURNO = 6; // 22h–5h, descontado o intervalo
const SIM_ADICIONAL_EXTRA = 0.25; // mínimo legal no Japão (e valor informado em Echizen)
const SIM_ADICIONAL_NOTURNO = 0.25;
const SIM_SEGURO_SOCIAL = 0.15; // saúde + previdência (kōsei nenkin) + seguro-desemprego ≈ 15%
const SIM_IR = 0.03; // imposto de renda retido na fonte, aprox.
const SIM_RESIDENCIAL = 0.06; // jūminzei, a partir do 2º ano (sobre a renda do ano anterior), aprox.

function useCotacaoIeneReferencia() {
  const [cot, setCot] = useState<{ valor: number; fallback: boolean }>({
    valor: (COTACAO_FALLBACK_BRL_POR_JPY_COMPRA + COTACAO_FALLBACK_BRL_POR_JPY_VENDA) / 2,
    fallback: true,
  });
  useEffect(() => {
    let vivo = true;
    Promise.all(
      (["compra", "venda"] as const).map((d) =>
        fetch(`/api/cambio-iene?direcao=${d}`)
          .then((r) => r.json())
          .catch(() => null),
      ),
    ).then(([c, v]) => {
      const a = Number(c?.cotacaoBRLPorJPY);
      const b = Number(v?.cotacaoBRLPorJPY);
      if (vivo && a > 0 && b > 0) setCot({ valor: (a + b) / 2, fallback: Boolean(c?.fallback || v?.fallback) });
    });
    return () => {
      vivo = false;
    };
  }, []);
  return cot;
}

function Segmentos<T extends string | number>({ valor, opcoes, onChange, nome }: { valor: T; opcoes: { v: T; r: string }[]; onChange: (v: T) => void; nome: string }) {
  return (
    <div role="radiogroup" aria-label={nome} className="mt-2 flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          role="radio"
          aria-checked={valor === o.v}
          onClick={() => onChange(o.v)}
          className={`min-h-[40px] rounded-full border px-4 text-[13px] transition ${
            valor === o.v ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 text-black/65 hover:border-black/35"
          }`}
        >
          {o.r}
        </button>
      ))}
    </div>
  );
}

function SimuladorGanhos({ config }: { config: ConfigLanding }) {
  const sim = config.simulacao;
  const SIM_DIAS_MES = sim.diasMes ?? SIM_DIAS_MES_PADRAO;
  const [iHora, setIHora] = useState(0);
  const [noturno, setNoturno] = useState(false);
  const [extras, setExtras] = useState(20);
  const [iMoradia, setIMoradia] = useState(0);
  const [segundoAno, setSegundoAno] = useState(false);
  const cot = useCotacaoIeneReferencia();

  const hora = sim.valoresHora[iHora].valor;
  const horasNoturnas =
    sim.turno === "alternado" ? (SIM_DIAS_MES / 2) * SIM_HORAS_NOTURNAS_POR_TURNO : noturno ? SIM_DIAS_MES * SIM_HORAS_NOTURNAS_POR_TURNO : 0;
  const base = hora * SIM_HORAS_NORMAIS_DIA * SIM_DIAS_MES;
  const vExtras = hora * (1 + SIM_ADICIONAL_EXTRA) * extras;
  const vNoturno = hora * SIM_ADICIONAL_NOTURNO * horasNoturnas;
  const bruto = base + vExtras + vNoturno;
  const social = bruto * SIM_SEGURO_SOCIAL;
  const ir = (bruto - social) * SIM_IR;
  const residencial = segundoAno ? (bruto - social) * SIM_RESIDENCIAL : 0;
  const moradia = sim.moradias[iMoradia];
  const liquido = bruto - social - ir - residencial - moradia.aluguel - moradia.contas;
  const brl = (jpy: number) => formatBRL(jpy * cot.valor);

  const linhas: { rotulo: string; valor: number; detalhe?: string }[] = [
    { rotulo: "Seguro social e previdência", valor: social, detalhe: "≈ 15%" },
    { rotulo: "Imposto de renda", valor: ir, detalhe: "≈ 3%" },
    ...(segundoAno ? [{ rotulo: "Imposto residencial", valor: residencial, detalhe: "a partir do 2º ano" }] : []),
    { rotulo: "Aluguel", valor: moradia.aluguel, detalhe: moradia.rotulo },
    { rotulo: "Água, luz e gás", valor: moradia.contas, detalhe: "estimativa" },
  ];

  const rotulo = "block text-[11px] font-medium uppercase tracking-[0.12em] text-black/70";

  return (
    <section aria-labelledby="t-simulacao">
      <p className={kicker}>Simulação</p>
      <div className="mt-2">
        <TituloSecao id="t-simulacao">Quanto pode sobrar por mês</TituloSecao>
      </div>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-black/70">
        Ajuste as opções e veja uma estimativa do valor que sobra depois dos descontos obrigatórios, do aluguel e das contas da casa.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-5 rounded-2xl border border-black/10 p-5">
          {sim.valoresHora.length > 1 && (
            <div>
              <span className={rotulo}>Tempo de empresa</span>
              <Segmentos nome="Tempo de empresa" valor={iHora} onChange={setIHora} opcoes={sim.valoresHora.map((h, n) => ({ v: n, r: h.rotulo }))} />
            </div>
          )}
          {sim.turno === "fixo" ? (
            <div>
              <span className={rotulo}>Turno fixo</span>
              <Segmentos
                nome="Turno"
                valor={noturno ? "n" : "d"}
                onChange={(v) => setNoturno(v === "n")}
                opcoes={[
                  { v: "d", r: "Diurno" },
                  { v: "n", r: "Noturno (+25%)" },
                ]}
              />
            </div>
          ) : (
            <div>
              <span className={rotulo}>Turno</span>
              <p className="mt-2 text-sm text-black/65">Alternado: metade dos dias no período noturno, com adicional de 25% nas horas entre 22h e 5h.</p>
            </div>
          )}
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className={rotulo}>Horas extras no mês</span>
              <span className={`${inter.className} text-sm font-semibold tabular-nums text-[#0A2540]`}>{extras}h</span>
            </span>
            <input
              type="range"
              min={0}
              max={45}
              step={5}
              value={extras}
              onChange={(e) => setExtras(Number(e.target.value))}
              className="mt-3 w-full accent-[#1f6fb8]"
              aria-label="Horas extras no mês"
            />
            <span className="mt-1 flex justify-between text-[11px] text-black/45">
              <span>0h</span>
              <span>45h</span>
            </span>
          </label>
          <div>
            <span className={rotulo}>Moradia</span>
            <Segmentos nome="Moradia" valor={iMoradia} onChange={setIMoradia} opcoes={sim.moradias.map((m, n) => ({ v: n, r: m.rotulo }))} />
          </div>
          <div>
            <span className={rotulo}>Período</span>
            <Segmentos
              nome="Período"
              valor={segundoAno ? "2" : "1"}
              onChange={(v) => setSegundoAno(v === "2")}
              opcoes={[
                { v: "1", r: "1º ano" },
                { v: "2", r: "A partir do 2º ano" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0A2540] p-5 text-white md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Disponível estimado por mês</p>
          <p className={`${inter.className} mt-2 text-4xl font-semibold tabular-nums tracking-[-0.02em]`}>{brl(liquido)}</p>
          <p className={`${inter.className} mt-1 text-lg tabular-nums text-white/75`}>{formatJPY(liquido)}</p>

          <dl className="mt-6 space-y-2 border-t border-white/15 pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/80">Salário bruto</dt>
              <dd className={`${inter.className} tabular-nums`}>{formatJPY(bruto)}</dd>
            </div>
            {linhas.map((l) => (
              <div key={l.rotulo} className="flex items-baseline justify-between gap-3">
                <dt className="text-white/65">
                  − {l.rotulo}
                  {l.detalhe && <span className="ml-1 text-[11px] text-white/40">({l.detalhe})</span>}
                </dt>
                <dd className={`${inter.className} shrink-0 tabular-nums text-white/80`}>{formatJPY(l.valor)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 border-t border-white/15 pt-2 font-semibold">
              <dt>Disponível</dt>
              <dd className={`${inter.className} tabular-nums`}>{formatJPY(liquido)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-white/[0.07] px-4 py-3 text-sm text-white/80">
            Em 12 meses: <span className={`${inter.className} font-semibold text-white`}>{brl(liquido * 12)}</span>
            <span className="text-white/50"> · {formatJPY(liquido * 12)}</span>
          </p>
          <p className="mt-3 text-[11px] leading-5 text-white/45">
            Cotação de referência: R$ {cot.valor.toFixed(4).replace(".", ",")} por iene{cot.fallback ? " (estimada)" : ""}. Alimentação, transporte e gastos pessoais não estão incluídos.
          </p>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-black/50">
        Simulação ilustrativa, não é promessa de renda. Premissas: escala 4×2 com cerca de {SIM_DIAS_MES} dias e {SIM_HORAS_NORMAIS_DIA} horas normais por dia;
        hora extra e horário noturno com adicional de 25%; descontos de seguro social, previdência e impostos estimados por percentuais médios; aluguel pelo valor médio
        da faixa e contas de consumo estimadas. Os valores reais dependem da jornada, da alocação, do imóvel e da legislação vigente.
      </p>
    </section>
  );
}

// ── Página ──
export default function LandingMurata({ config: s, vagas }: { config: ConfigLanding; vagas: Vaga[] }) {
  const [candidatura, setCandidatura] = useState<Vaga | null>(null);
  const [vagasVisivel, setVagasVisivel] = useState(false);
  const vagasRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!candidatura) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [candidatura]);

  useEffect(() => {
    const el = vagasRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => setVagasVisivel(entries.some((e) => e.isIntersecting)), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const msgWhats = `Olá! Vi a vaga da Murata em ${s.cidade} no site da Ajisai e quero saber mais.`;

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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Vaga em {s.cidade}</p>
        <div className="flex-1" />
        <Link href="/" aria-label="Ajisai — página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
        </Link>
      </div>

      {/* Hero em cartão */}
      <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 md:pt-8">
        <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
          <div className="relative h-52 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
            <Image src={s.hero.imagem.src} alt={s.hero.imagem.alt} fill priority sizes="(min-width: 640px) 760px, 100vw" className="object-cover" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
            />
          </div>
          <div className="relative -mt-10 px-5 pb-7 sm:mt-0 sm:flex sm:min-h-[300px] sm:max-w-[40%] sm:flex-col sm:justify-center sm:px-10 sm:py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">{s.hero.kicker}</p>
            <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>{s.hero.titulo}</h1>
            <p className="mt-3 text-sm leading-6 text-white/75">{s.hero.subtitulo}</p>
            <span className="mt-5 inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-white/20">
              Custo inicial zero · candidatos elegíveis
            </span>
          </div>
        </section>
      </div>

      {/* Wilson, 07/out/2026: "integrar menu que está na direita dentro do
          corpo do site, perdemos muito espaço com ele no canto direito" —
          sem coluna lateral; o resumo virou uma faixa no topo do conteúdo. */}
      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <div className="min-w-0 space-y-14">
          {/* Resumo da vaga */}
          <section aria-label="Resumo da vaga" className="rounded-2xl border border-black/10 p-4 shadow-[0_8px_30px_rgba(10,37,64,0.06)] md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Resumo da vaga</p>
              <p className="text-xs text-black/55">{s.fabrica}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {s.resumo.map((r) => (
                <div key={r.rotulo} className="rounded-xl bg-[#f4f7fb] p-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">{r.rotulo}</dt>
                  <dd>
                    <span className={`${inter.className} mt-1 block text-lg font-semibold text-[#0A2540]`}>{r.valor}</span>
                    {r.detalhe && <span className="block text-xs text-black/55">{r.detalhe}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 hidden items-center justify-between gap-4 md:flex">
              <p className="text-[11px] leading-5 text-black/50">{CONDICAO_CUSTO_ZERO}</p>
              <div className="flex shrink-0 gap-2">
                <a
                  href={linkWhatsapp(msgWhats)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 items-center justify-center rounded-xl border border-black/15 px-6 text-sm font-semibold text-[#0A2540] transition hover:border-black/35"
                >
                  Falar no WhatsApp
                </a>
                <button type="button" onClick={irParaVagas} className={`${classeBotao} w-auto`}>
                  Ver vagas
                </button>
              </div>
            </div>
          </section>

          {/* A vaga */}
          <section aria-labelledby="t-vaga">
            <p className={kicker}>A vaga</p>
            <div className="mt-2">
              <TituloSecao id="t-vaga">{s.vaga.titulo}</TituloSecao>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-black/70">{s.vaga.texto}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image src={s.vaga.imagem.src} alt={s.vaga.imagem.alt} fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
              </div>
              {s.vaga.imagemDetalhe && (
                <div className="relative hidden overflow-hidden rounded-2xl sm:block">
                  <Image src={s.vaga.imagemDetalhe.src} alt={s.vaga.imagemDetalhe.alt} fill sizes="260px" className="object-cover object-[55%_50%]" />
                </div>
              )}
            </div>
            <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
              {s.vaga.itens.map((i) => (
                <div key={i.rotulo} className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-0.5">{i.rotulo}</dt>
                  <dd className="text-sm text-black">{i.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Salário e turnos */}
          <section aria-labelledby="t-salario">
            <p className={kicker}>Salário e turnos</p>
            <div className="mt-2">
              <TituloSecao id="t-salario">
                {s.salario.legenda}: {s.salario.valor}
              </TituloSecao>
            </div>
            {s.salario.progressao && (
              <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {s.salario.progressao.map((p) => (
                  <li key={p.faixa} className="rounded-xl bg-[#f4f7fb] p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-black/55">{p.faixa}</p>
                    <p className={`${inter.className} mt-1 text-lg font-semibold text-[#0A2540]`}>
                      {p.valor}
                      <span className="text-xs font-normal text-black/50">/h</span>
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-sm leading-6 text-black/70">{s.salario.adicionais}</p>
            <p className="mt-4 text-sm leading-6 text-black/70">{s.turnos.texto}</p>
            {s.turnos.imagem && (
              <div className="relative mt-5 aspect-[16/8] overflow-hidden rounded-2xl">
                <Image src={s.turnos.imagem.src} alt={s.turnos.imagem.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A2540]">Diurno</span>
                <span className="absolute bottom-3 right-3 rounded-full bg-[#0A2540]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Noturno</span>
              </div>
            )}
            {s.turnos.unidades && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {s.turnos.unidades.map((u) => (
                  <div key={u.nome} className="rounded-xl border border-black/10 p-4 text-sm">
                    <p className="font-medium text-black">{u.nome}</p>
                    <p className="mt-2 flex justify-between text-black/65">
                      Diurno <span className={`${inter.className} font-medium tabular-nums text-black`}>{u.diurno}</span>
                    </p>
                    <p className="mt-1 flex justify-between text-black/65">
                      Noturno <span className={`${inter.className} font-medium tabular-nums text-black`}>{u.noturno}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <SimuladorGanhos config={s} />

          {/* Custo inicial zero + reentry */}
          <section aria-labelledby="t-custo" className="overflow-hidden rounded-2xl bg-[#0A2540] text-white">
            {s.custoZero.imagem && (
              <div className="relative aspect-[16/7]">
                <Image src={s.custoZero.imagem.src} alt={s.custoZero.imagem.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover object-[60%_50%]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A2540] to-transparent" />
              </div>
            )}
            <div className="px-5 pb-6 pt-2 md:px-8 md:pb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Campanha</p>
              <h2 id="t-custo" className={`${display.className} mt-2 text-2xl font-medium md:text-[28px]`}>
                {s.custoZero.titulo}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/75">{s.custoZero.texto}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {s.custoZero.itens.map((i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <IconeCheck className="h-4 w-4 shrink-0 text-[#7fb6e6]" />
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-white/55">{CONDICAO_CUSTO_ZERO}</p>
              <div className="mt-6 rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/15 md:flex md:items-center md:gap-6 md:p-5">
                <div className="shrink-0">
                  <p className={`${inter.className} text-2xl font-semibold`}>{AUXILIO_EMBARQUE_BRL}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/60">Auxílio Embarque Ajisai</p>
                </div>
                <div className="mt-3 md:mt-0">
                  <p className="text-sm leading-6 text-white/80">{s.reentry}</p>
                  <button
                    type="button"
                    onClick={irParaVagas}
                    className="mt-2 text-sm font-semibold text-[#9cc8ef] underline decoration-[#9cc8ef]/40 underline-offset-2"
                  >
                    Ver vagas →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Moradia */}
          <section aria-labelledby="t-moradia">
            <p className={kicker}>Moradia</p>
            <div className="mt-2">
              <TituloSecao id="t-moradia">Chegue sabendo onde vai morar</TituloSecao>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-black/70">{s.moradia.texto}</p>
            {s.moradia.imagem && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
                <Image src={s.moradia.imagem.src} alt={s.moradia.imagem.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/85">Imagem ilustrativa</span>
              </div>
            )}
            {s.moradia.plantas && s.moradia.plantas.length > 0 && <Plantas plantas={s.moradia.plantas} />}
            <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
              {s.moradia.valores.map((v) => (
                <div key={v.rotulo} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                  <span className="text-black/70">{v.rotulo}</span>
                  <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{v.valor}</span>
                </div>
              ))}
            </div>
            {s.moradia.notas.map((n) => (
              <p key={n} className="mt-3 text-xs leading-5 text-black/55">
                {n}
              </p>
            ))}
          </section>

          {/* Cidade */}
          <section aria-labelledby="t-cidade">
            <p className={kicker}>{s.provincia} · Japão</p>
            <div className="mt-2">
              <TituloSecao id="t-cidade">{s.cidadeSecao.titulo}</TituloSecao>
            </div>
            <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={s.cidadeSecao.imagem.src} alt={s.cidadeSecao.imagem.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            </div>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-black/70">{s.cidadeSecao.texto}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {s.cidadeSecao.destaques.map((d) => (
                <li key={d.titulo} className="rounded-xl border border-black/10 p-4">
                  <p className="text-sm font-medium text-[#0A2540]">{d.titulo}</p>
                  <p className="mt-1 text-xs leading-5 text-black/60">{d.texto}</p>
                </li>
              ))}
            </ul>
            {s.cidadeSecao.extra && (
              <div className="mt-5 grid overflow-hidden rounded-2xl border border-black/10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <div className="relative aspect-[16/9] sm:aspect-auto sm:min-h-[200px]">
                  <Image src={s.cidadeSecao.extra.imagem.src} alt={s.cidadeSecao.extra.imagem.alt} fill sizes="(min-width: 640px) 400px, 100vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-[#0A2540]">{s.cidadeSecao.extra.titulo}</p>
                  <p className="mt-1.5 text-sm leading-6 text-black/65">{s.cidadeSecao.extra.texto}</p>
                </div>
              </div>
            )}
          </section>

          {/* Como funciona */}
          <section aria-labelledby="t-processo">
            <p className={kicker}>Como funciona</p>
            <div className="mt-2">
              <TituloSecao id="t-processo">Do Brasil à fábrica</TituloSecao>
            </div>
            <ol className="mt-5 space-y-3">
              {s.processo.map((p, i) => (
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
              {s.faq.map((f) => (
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
          </section>

          {/* Vagas (no lugar do antigo formulário de pré-análise) */}
          <section id="vagas" ref={vagasRef} aria-labelledby="t-vagas" className="scroll-mt-20">
            <p className={kicker}>Candidatura</p>
            <div className="mt-2">
              <TituloSecao id="t-vagas">Vagas abertas</TituloSecao>
            </div>
            <p className="mb-5 mt-2 text-sm text-black/65">
              Escolha a vaga e envie sua candidatura. Nossa equipe analisa o perfil e responde pelo WhatsApp.
            </p>
            <ListaVagas vagas={vagas} vagaPrincipalId={s.vagaId} cidade={s.cidade} onCandidatar={setCandidatura} />
            <p className="mt-4 text-sm">
              <Link href="/empregos#vagas" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                Ver todas as vagas da Ajisai
              </Link>
            </p>
          </section>
        </div>

      </div>

      {/* Barra fixa no celular */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform ${
          vagasVisivel ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 md:justify-end md:px-4">
          <p className={`${display.className} mr-auto hidden text-base text-[#0A2540] md:block`}>
            {s.hero.titulo} <span className="ml-2 text-sm text-black/50">{s.resumo[0]?.valor}</span>
          </p>
          <button type="button" onClick={irParaVagas} className={`${classeBotao} flex-1 md:w-auto md:flex-none`}>
            Ver vagas
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

      {candidatura && <CandidaturaModal vaga={candidatura} onFechar={() => setCandidatura(null)} />}
    </main>
  );
}
