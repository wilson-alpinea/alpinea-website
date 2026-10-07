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

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { display, WHATSAPP_NUMBER } from "../../produtos/page";
import { inter, IconeCheck } from "../transporte/compartilhado";
import { AUXILIO_EMBARQUE_BRL, CONDICAO_CUSTO_ZERO, type ConfigLanding } from "../../lib/landingsMurata";

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

function irParaFormulario() {
  document.getElementById("pre-analise")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Formulário de pré-candidatura (2 etapas) ──
function Opcoes({ valor, opcoes, onChange, nome }: { valor: string; opcoes: { v: string; r: string }[]; onChange: (v: string) => void; nome: string }) {
  return (
    <div role="radiogroup" aria-label={nome} className="mt-2 flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={valor === o.v}
          onClick={() => onChange(o.v)}
          className={`min-h-[44px] rounded-full border px-4 text-sm transition ${
            valor === o.v ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 bg-white text-black/70 hover:border-black/35"
          }`}
        >
          {o.r}
        </button>
      ))}
    </div>
  );
}

const SIM_NAO = [
  { v: "sim", r: "Sim" },
  { v: "nao", r: "Não" },
];

function Formulario({ config, reentrySinal }: { config: ConfigLanding; reentrySinal: number }) {
  const estadoSeparado = config.formulario.campos.includes("estadoSeparado");
  const perguntaOndeEsta = config.formulario.campos.includes("ondeEsta");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [idade, setIdade] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [jaMorou, setJaMorou] = useState("");
  const [reentry, setReentry] = useState("");
  const [ondeEsta, setOndeEsta] = useState("");
  const [composicao, setComposicao] = useState("");
  const [embarque, setEmbarque] = useState("");
  const [tentou, setTentou] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // "Tenho reentry" na página pré-marca a resposta (ajuste de estado no
  // render, sem useEffect).
  const [sinalVisto, setSinalVisto] = useState(reentrySinal);
  if (reentrySinal !== sinalVisto) {
    setSinalVisto(reentrySinal);
    setReentry("reentry");
  }

  const idadeNum = Number(idade);
  const etapa1Ok =
    nome.trim().split(/\s+/).length >= 2 &&
    whatsapp.replace(/\D/g, "").length >= 10 &&
    idadeNum >= 18 &&
    idadeNum <= 80 &&
    cidade.trim().length >= 2 &&
    (!estadoSeparado || estado.trim().length >= 2);
  const etapa2Ok = jaMorou !== "" && reentry !== "" && composicao !== "" && embarque !== "" && (!perguntaOndeEsta || ondeEsta !== "");

  const opcoesReentry = estadoSeparado
    ? [
        { v: "reentry", r: "Tenho reentry válido" },
        { v: "visto", r: "Tenho visto" },
        { v: "nao", r: "Não tenho" },
      ]
    : [
        { v: "reentry", r: "Sim" },
        { v: "nao", r: "Não" },
      ];

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!etapa2Ok) {
      setTentou(true);
      return;
    }
    setStatus("enviando");
    setErro("");
    try {
      const r = await fetch("/api/empregos-pre-candidatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landing: config.slug, nome, whatsapp, idade: idadeNum, cidade, estado, jaMorouJapao: jaMorou, reentry, ondeEsta, composicao, embarque }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(d.error || "Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.");
      setStatus("erro");
    }
  }

  const classeInput =
    "mt-1.5 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base text-black placeholder:text-black/35 focus:border-[#1f6fb8] focus:outline-none focus:ring-2 focus:ring-[#1f6fb8]/15 md:text-sm";
  const rotulo = "block text-[11px] font-medium uppercase tracking-[0.12em] text-black/70";

  if (status === "enviado") {
    return (
      <div className="rounded-2xl border border-black/10 p-6 text-center md:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
          <IconeCheck className="h-6 w-6" />
        </span>
        <p className={`${display.className} mt-5 text-2xl font-medium text-black`}>Recebemos sua pré-candidatura</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70">
          Nossa equipe vai analisar seu perfil e falar com você pelo WhatsApp informado. A participação está sujeita à análise de
          elegibilidade e à disponibilidade da vaga.
        </p>
        <a
          href={linkWhatsapp(`Olá! Enviei minha pré-candidatura para a vaga da Murata em ${config.cidade} (${nome}).`)}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
        >
          Continuar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="rounded-2xl border border-black/10 p-5 md:p-8">
      <div className="flex items-center justify-between">
        <p className={kicker}>Pré-análise gratuita</p>
        <p className="text-xs text-black/50">Etapa {etapa} de 2</p>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-black/[0.06]">
        <div className="h-1 rounded-full bg-[#1f6fb8] transition-all" style={{ width: etapa === 1 ? "50%" : "100%" }} />
      </div>

      {etapa === 1 ? (
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className={rotulo}>Nome completo</span>
            <input className={classeInput} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Nome e sobrenome" />
          </label>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
            <label className="block">
              <span className={rotulo}>WhatsApp</span>
              <input className={classeInput} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" />
            </label>
            <label className="block">
              <span className={rotulo}>Idade</span>
              <input className={classeInput} value={idade} onChange={(e) => setIdade(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder="30" />
            </label>
          </div>
          <div className={`grid gap-4 ${estadoSeparado ? "sm:grid-cols-[minmax(0,1fr)_120px]" : ""}`}>
            <label className="block">
              <span className={rotulo}>{estadoSeparado ? "Cidade" : "Cidade / Estado"}</span>
              <input className={classeInput} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder={estadoSeparado ? "Sua cidade" : "Ex.: Londrina / PR"} />
            </label>
            {estadoSeparado && (
              <label className="block">
                <span className={rotulo}>Estado</span>
                <input className={classeInput} value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="PR" maxLength={30} />
              </label>
            )}
          </div>
          {tentou && !etapa1Ok && <p className="text-sm text-[#b42318]">Preencha nome e sobrenome, WhatsApp com DDD, idade e cidade.</p>}
          <button
            type="button"
            onClick={() => {
              if (etapa1Ok) {
                setTentou(false);
                setEtapa(2);
              } else setTentou(true);
            }}
            className={`${classeBotao} mt-1`}
          >
            Continuar
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          <div>
            <span className={rotulo}>{estadoSeparado ? "Já trabalhou no Japão?" : "Já morou no Japão?"}</span>
            <Opcoes nome="Já morou no Japão" valor={jaMorou} opcoes={SIM_NAO} onChange={setJaMorou} />
          </div>
          <div>
            <span className={rotulo}>{estadoSeparado ? "Possui visto ou reentry?" : "Possui reentry válido?"}</span>
            <Opcoes nome="Reentry" valor={reentry} opcoes={opcoesReentry} onChange={setReentry} />
          </div>
          {perguntaOndeEsta && (
            <div>
              <span className={rotulo}>Onde você está agora?</span>
              <Opcoes
                nome="Onde está"
                valor={ondeEsta}
                opcoes={[
                  { v: "brasil", r: "No Brasil" },
                  { v: "japao", r: "No Japão" },
                ]}
                onChange={setOndeEsta}
              />
            </div>
          )}
          <div>
            <span className={rotulo}>Vai sozinho ou acompanhado?</span>
            <Opcoes
              nome="Composição"
              valor={composicao}
              opcoes={[
                { v: "sozinho", r: "Sozinho(a)" },
                { v: "casal", r: "Com cônjuge" },
                { v: "familia", r: "Com família" },
              ]}
              onChange={setComposicao}
            />
          </div>
          <div>
            <span className={rotulo}>Quando poderia embarcar?</span>
            <Opcoes
              nome="Embarque"
              valor={embarque}
              opcoes={[
                { v: "imediato", r: "Imediatamente" },
                { v: "30-dias", r: "Até 30 dias" },
                { v: "1-3-meses", r: "1 a 3 meses" },
                { v: "mais-3-meses", r: "Mais de 3 meses" },
              ]}
              onChange={setEmbarque}
            />
          </div>
          {tentou && !etapa2Ok && <p className="text-sm text-[#b42318]">Responda todas as perguntas para enviar.</p>}
          {erro && <p className="text-sm text-[#b42318]">{erro}</p>}
          <button type="submit" disabled={status === "enviando"} className={classeBotao}>
            {status === "enviando" ? "Enviando…" : config.formulario.botao}
          </button>
          <button type="button" onClick={() => setEtapa(1)} className="text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
            Voltar
          </button>
        </div>
      )}
      <p className="mt-5 text-[11px] leading-5 text-black/45">
        Sem compromisso. Seus dados são usados só para esta análise, conforme a{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}

// ── Página ──
export default function LandingMurata({ config: s }: { config: ConfigLanding }) {
  const [reentrySinal, setReentrySinal] = useState(0);
  const [formVisivel, setFormVisivel] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => setFormVisivel(entries.some((e) => e.isIntersecting)), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const msgWhats = `Olá! Vi a vaga da Murata em ${s.cidade} no site da Ajisai e quero saber mais.`;

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-28 pt-14 text-black lg:pb-16">
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

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-14">
          {/* Resumo — no celular aparece aqui; no desktop vai para a lateral */}
          <section className="grid grid-cols-2 gap-3 lg:hidden" aria-label="Resumo da vaga">
            {s.resumo.map((r) => (
              <div key={r.rotulo} className="rounded-xl border border-black/10 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">{r.rotulo}</p>
                <p className={`${inter.className} mt-1 text-lg font-semibold text-[#0A2540]`}>{r.valor}</p>
                {r.detalhe && <p className="text-xs text-black/55">{r.detalhe}</p>}
              </div>
            ))}
          </section>

          {/* A vaga */}
          <section aria-labelledby="t-vaga">
            <p className={kicker}>A vaga</p>
            <div className="mt-2">
              <TituloSecao id="t-vaga">{s.vaga.titulo}</TituloSecao>
            </div>
            <p className="mt-3 text-[15px] leading-7 text-black/70">{s.vaga.texto}</p>
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
                    onClick={() => {
                      setReentrySinal((n) => n + 1);
                      irParaFormulario();
                    }}
                    className="mt-2 text-sm font-semibold text-[#9cc8ef] underline decoration-[#9cc8ef]/40 underline-offset-2"
                  >
                    Tenho reentry →
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
            <p className="mt-3 text-[15px] leading-7 text-black/70">{s.moradia.texto}</p>
            {s.moradia.imagem && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
                <Image src={s.moradia.imagem.src} alt={s.moradia.imagem.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/85">Imagem ilustrativa</span>
              </div>
            )}
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
            <p className="mt-5 text-[15px] leading-7 text-black/70">{s.cidadeSecao.texto}</p>
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

          {/* Formulário */}
          <section id="pre-analise" ref={formRef} aria-labelledby="t-form" className="scroll-mt-20">
            <TituloSecao id="t-form">Verifique sua elegibilidade</TituloSecao>
            <p className="mb-5 mt-2 text-sm text-black/65">Leva cerca de 1 minuto. Nossa equipe responde pelo WhatsApp.</p>
            <Formulario config={s} reentrySinal={reentrySinal} />
          </section>
        </div>

        {/* Resumo lateral (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-black/10 p-6 shadow-[0_8px_30px_rgba(10,37,64,0.06)]">
            <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Resumo da vaga</p>
            <p className="mt-1 text-xs text-black/55">{s.fabrica}</p>
            <dl className="mt-4 divide-y divide-black/10 border-y border-black/10">
              {s.resumo.map((r) => (
                <div key={r.rotulo} className="flex items-baseline justify-between gap-3 py-3">
                  <dt className="text-sm text-black/65">{r.rotulo}</dt>
                  <dd className="text-right">
                    <span className={`${inter.className} block text-sm font-semibold text-black`}>{r.valor}</span>
                    {r.detalhe && <span className="block text-[11px] text-black/50">{r.detalhe}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={irParaFormulario} className={`${classeBotao} mt-5`}>
              Verificar elegibilidade
            </button>
            <a
              href={linkWhatsapp(msgWhats)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-black/15 text-sm font-semibold text-[#0A2540] transition hover:border-black/35"
            >
              Falar no WhatsApp
            </a>
            <p className="mt-3 text-[11px] leading-5 text-black/50">{CONDICAO_CUSTO_ZERO}</p>
          </div>
        </aside>
      </div>

      {/* Barra fixa no celular */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform lg:hidden ${
          formVisivel ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex gap-2">
          <button type="button" onClick={irParaFormulario} className={`${classeBotao} flex-1`}>
            Verificar elegibilidade
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
    </main>
  );
}
