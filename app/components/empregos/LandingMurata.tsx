"use client";

// Landing page de recrutamento Murata (Izumo e Echizen) — Wilson,
// 07/out/2026: páginas que abrem ao clicar nos banners "Trabalhe e More em
// Echizen/Izumo" de /empregos. Conceito "Japanese quiet luxury": off-white,
// grafite, verde japonês profundo e vermelho discreto só nos CTAs; muito
// espaço em branco, ícones lineares, mobile-first com CTA fixo no rodapé.
// Conteúdo e regras de compliance em app/lib/landingsMurata.ts.

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AUXILIO_EMBARQUE_BRL, type ConfigLanding, type IconeLanding } from "../../lib/landingsMurata";

const WHATSAPP_NUMBER = "5511930300101";
const linkWhatsapp = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;


const PATHS: Record<IconeLanding, ReactNode> = {
  aviao: <path d="M2.5 13.5l19-8-5.5 15-3.5-6.5-10-0.5zM12.5 14l3.5-4" />,
  documento: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9.5 12h6M9.5 15.5h6M9.5 9h2.5" />
    </>
  ),
  assessoria: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 6.5h5v4h-2l-1.5 1.5v-1.5h-1.5z" />
    </>
  ),
  mala: (
    <>
      <rect x="4.5" y="7.5" width="15" height="12" rx="1.5" />
      <path d="M9 7.5V5h6v2.5M9 11v5M15 11v5" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  fabrica: (
    <>
      <path d="M3 20.5V10l5 3V10l5 3V5h3v15.5z" />
      <path d="M3 20.5h18M16 5h3v15.5M7 17h2M11 17h2" />
    </>
  ),
  casa: (
    <>
      <path d="M3.5 11L12 4l8.5 7" />
      <path d="M6 9.5v10.5h12V9.5M10 20v-5h4v5" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5" />
    </>
  ),
  natureza: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c-4 0-6-2.5-6-6 3 0 6 1.5 6 6zM12 15c4 0 6-2.5 6-6-3 0-6 1.5-6 6z" />
    </>
  ),
  mar: <path d="M2.5 9c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 3-1.5M2.5 14c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 3-1.5M2.5 19c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 3-1.5" />,
  montanha: <path d="M2.5 19.5l6.5-11 4 6.5 2.5-3.5 6 8zM7 12.5l2 1.5 1.5-1" />,
  santuario: (
    <>
      <path d="M3 6.5c3 .8 15 .8 18 0M5 10h14M7 6.9V20.5M17 6.9V20.5M12 6.9V10" />
    </>
  ),
  onsen: (
    <>
      <path d="M4 15.5c0 2.8 3.6 5 8 5s8-2.2 8-5" />
      <path d="M4 15.5h16M8.5 12c-1-1.5 1-2.5 0-4.5M12 12c-1-1.5 1-2.5 0-4.5M15.5 12c-1-1.5 1-2.5 0-4.5" />
    </>
  ),
  comercio: (
    <>
      <path d="M3.5 4.5h2.5l2 11h10.5l2-8H7" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </>
  ),
  saude: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  transporte: (
    <>
      <rect x="5" y="3.5" width="14" height="13" rx="2.5" />
      <path d="M5 10.5h14M8.5 20.5l1.5-4M15.5 20.5l-1.5-4" />
      <circle cx="8.5" cy="13.5" r=".8" />
      <circle cx="15.5" cy="13.5" r=".8" />
    </>
  ),
  cidade: (
    <>
      <path d="M3 20.5h18M5 20.5V9h5v11.5M10 20.5V4h7v16.5M17 20.5V12h3v8.5" />
      <path d="M12.5 7.5h2M12.5 11h2M12.5 14.5h2M7 12h1M7 15.5h1" />
    </>
  ),
  kit: (
    <>
      <path d="M4 9.5h16v11H4z" />
      <path d="M2.5 6.5h19v3h-19zM12 6.5v14M12 6.5c-1.5-3-5-3.5-5-1.5s3.5 1.5 5 1.5zM12 6.5c1.5-3 5-3.5 5-1.5s-3.5 1.5-5 1.5z" />
    </>
  ),
};

function Icone({ nome, className = "h-6 w-6" }: { nome: IconeLanding; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[nome]}
    </svg>
  );
}

function Kicker({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${claro ? "text-white/60" : "text-[#1E3B30]/70"}`}>{children}</p>
  );
}

function Titulo({ children, claro = false, className = "" }: { children: ReactNode; claro?: boolean; className?: string }) {
  return (
    <h2 className={`mt-3 text-[28px] font-light leading-[1.15] tracking-[-0.02em] md:text-[42px] ${claro ? "text-white" : "text-[#24262A]"} ${className}`}>
      {children}
    </h2>
  );
}

function BotaoCta({ children, onClick, variante = "vermelho", className = "" }: { children: ReactNode; onClick: () => void; variante?: "vermelho" | "contorno" | "branco"; className?: string }) {
  const estilos =
    variante === "vermelho"
      ? "bg-[#B5372B] text-white hover:bg-[#9e2f24]"
      : variante === "branco"
        ? "bg-white text-[#1E3B30] hover:bg-white/90"
        : "border border-current text-current hover:bg-black/[0.04]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[52px] items-center justify-center rounded-full px-7 text-[13px] font-semibold uppercase tracking-[0.12em] transition ${estilos} ${className}`}
    >
      {children}
    </button>
  );
}

function rolarPara(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Formulário de pré-candidatura (2 etapas) ──
type Resposta = "sim" | "nao" | "";
function Opcoes({ valor, opcoes, onChange, nome }: { valor: string; opcoes: { v: string; r: string }[]; onChange: (v: string) => void; nome: string }) {
  return (
    <div role="radiogroup" aria-label={nome} className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {opcoes.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={valor === o.v}
          onClick={() => onChange(o.v)}
          className={`min-h-[48px] rounded-xl border px-4 text-sm transition ${
            valor === o.v ? "border-[#1E3B30] bg-[#1E3B30] text-white" : "border-black/15 bg-white text-[#24262A] hover:border-black/35"
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

function FormularioPreCandidatura({ config, reentrySinal }: { config: ConfigLanding; reentrySinal: number }) {
  const estadoSeparado = config.formulario.campos.includes("estadoSeparado");
  const perguntaOndeEsta = config.formulario.campos.includes("ondeEsta");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [idade, setIdade] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [jaMorou, setJaMorou] = useState<Resposta>("");
  const [reentry, setReentry] = useState<string>("");
  const [ondeEsta, setOndeEsta] = useState("");
  const [composicao, setComposicao] = useState("");
  const [embarque, setEmbarque] = useState("");
  const [tentou, setTentou] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // "Tenho reentry" na página pré-marca a resposta (padrão de ajustar
  // estado durante o render, sem useEffect).
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
        body: JSON.stringify({
          landing: config.slug,
          nome,
          whatsapp,
          idade: idadeNum,
          cidade,
          estado,
          jaMorouJapao: jaMorou,
          reentry,
          ondeEsta,
          composicao,
          embarque,
        }),
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
    "h-[52px] w-full rounded-xl border border-black/15 bg-white px-4 text-base text-[#24262A] placeholder:text-black/35 focus:border-[#1E3B30] focus:outline-none focus:ring-2 focus:ring-[#1E3B30]/15";
  const rotulo = "text-[12px] font-medium uppercase tracking-[0.12em] text-[#24262A]/70";

  if (status === "enviado") {
    return (
      <div className="rounded-3xl bg-white p-7 text-center shadow-[0_30px_80px_-40px_rgba(30,59,48,0.45)] md:p-10">
        <p className={rotulo}>Pré-candidatura recebida</p>
        <p className="mt-3 text-2xl font-light text-[#24262A]">Obrigado, {nome.split(" ")[0]}.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#24262A]/70">
          Nossa equipe vai analisar seu perfil e entrar em contato pelo WhatsApp informado. A participação está sujeita à
          análise de elegibilidade e à disponibilidade da vaga.
        </p>
        <a
          href={linkWhatsapp(`Olá! Enviei minha pré-candidatura para a vaga da Murata em ${config.cidade} (${nome}).`)}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#1E3B30] px-7 text-[13px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-3xl bg-white p-6 shadow-[0_30px_80px_-40px_rgba(30,59,48,0.45)] md:p-10" noValidate>
      <div className="flex items-center justify-between">
        <p className={rotulo}>{config.formulario.titulo === config.final.titulo ? "Pré-análise gratuita" : config.formulario.titulo}</p>
        <p className="text-xs text-[#24262A]/50">Etapa {etapa} de 2</p>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-black/[0.06]">
        <div className="h-1 rounded-full bg-[#1E3B30] transition-all" style={{ width: etapa === 1 ? "50%" : "100%" }} />
      </div>
      <p className="mt-4 text-sm text-[#24262A]/60">{config.formulario.texto}</p>

      {etapa === 1 ? (
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className={rotulo}>{estadoSeparado ? "Nome completo" : "Nome"}</span>
            <input className={`${classeInput} mt-2`} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Nome e sobrenome" />
          </label>
          <label className="block">
            <span className={rotulo}>WhatsApp</span>
            <input
              className={`${classeInput} mt-2`}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
            />
          </label>
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <label className="block">
              <span className={rotulo}>Idade</span>
              <input className={`${classeInput} mt-2`} value={idade} onChange={(e) => setIdade(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder="30" />
            </label>
            <label className="block">
              <span className={rotulo}>{estadoSeparado ? "Cidade" : "Cidade / Estado"}</span>
              <input className={`${classeInput} mt-2`} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder={estadoSeparado ? "Sua cidade" : "Ex.: Londrina / PR"} />
            </label>
          </div>
          {estadoSeparado && (
            <label className="block">
              <span className={rotulo}>Estado</span>
              <input className={`${classeInput} mt-2`} value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex.: PR" maxLength={30} />
            </label>
          )}
          {tentou && !etapa1Ok && <p className="text-sm text-[#B5372B]">Preencha nome e sobrenome, WhatsApp com DDD, idade e cidade.</p>}
          <BotaoCta
            onClick={() => {
              if (etapa1Ok) {
                setTentou(false);
                setEtapa(2);
              } else setTentou(true);
            }}
            className="mt-2 w-full"
          >
            Continuar
          </BotaoCta>
        </div>
      ) : (
        <div className="mt-6 grid gap-6">
          <div>
            <span className={rotulo}>{estadoSeparado ? "Já trabalhou no Japão?" : "Já morou no Japão?"}</span>
            <Opcoes nome="Já morou no Japão" valor={jaMorou} opcoes={SIM_NAO} onChange={(v) => setJaMorou(v as Resposta)} />
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
            <span className={rotulo}>{estadoSeparado ? "Vai sozinho ou acompanhado?" : "Vai sozinho ou com família?"}</span>
            <Opcoes
              nome="Composição"
              valor={composicao}
              opcoes={[
                { v: "sozinho", r: "Sozinho(a)" },
                { v: "casal", r: "Com cônjuge" },
                { v: "familia", r: "Com família / filhos" },
              ]}
              onChange={setComposicao}
            />
          </div>
          <div>
            <span className={rotulo}>{estadoSeparado ? "Disponibilidade de embarque" : "Quando poderia embarcar?"}</span>
            <Opcoes
              nome="Embarque"
              valor={embarque}
              opcoes={[
                { v: "imediato", r: "Imediatamente" },
                { v: "30-dias", r: "Em até 30 dias" },
                { v: "1-3-meses", r: "Em 1 a 3 meses" },
                { v: "mais-3-meses", r: "Mais de 3 meses" },
              ]}
              onChange={setEmbarque}
            />
          </div>
          {tentou && !etapa2Ok && <p className="text-sm text-[#B5372B]">Responda todas as perguntas para enviar.</p>}
          {erro && <p className="text-sm text-[#B5372B]">{erro}</p>}
          <button
            type="submit"
            disabled={status === "enviando"}
            className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#B5372B] px-7 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9e2f24] disabled:opacity-60"
          >
            {status === "enviando" ? "Enviando…" : config.formulario.botao}
          </button>
          <button type="button" onClick={() => setEtapa(1)} className="text-sm text-[#24262A]/60 underline underline-offset-4">
            Voltar
          </button>
        </div>
      )}
      <p className="mt-6 text-[11px] leading-5 text-[#24262A]/45">
        Seus dados são usados apenas para a análise desta oportunidade, conforme a nossa{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Política de Privacidade
        </Link>
        . Sem compromisso.
      </p>
    </form>
  );
}

// ── Página ──
export default function LandingMurata({ config }: { config: ConfigLanding }) {
  const [reentrySinal, setReentrySinal] = useState(0);
  const [formVisivel, setFormVisivel] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => setFormVisivel(entries.some((e) => e.isIntersecting)), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const irParaFormulario = (comReentry = false) => {
    if (comReentry) setReentrySinal((n) => n + 1);
    rolarPara("pre-analise");
  };

  const s = config;

  return (
    <main className={`min-h-screen overflow-x-clip bg-[#F6F4EF] pb-24 text-[#24262A] md:pb-0`}>
      {/* ── Topo ── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/empregos" className="flex min-h-[44px] items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-white/85 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Vagas
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">Recrutamento Jutsai</p>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-[#1E3B30] md:min-h-[88vh] md:items-center">
        <Image src={s.hero.imagem} alt={s.hero.imagemAlt} fill priority sizes="100vw" className={`-z-10 object-cover ${s.hero.posicaoMobile} md:object-center`} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#13261f] via-[#13261f]/55 to-[#13261f]/10 md:bg-gradient-to-r md:from-[#13261f]/90 md:via-[#13261f]/55 md:via-40% md:to-transparent md:to-70%"
        />
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-28 md:px-8 md:py-32">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">{s.hero.eyebrow}</p>
            <h1 className="mt-4 text-[38px] font-light leading-[1.05] tracking-[-0.03em] text-white md:text-[64px]">{s.hero.titulo}</h1>
            <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/80 md:text-lg">{s.hero.subtitulo}</p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-2 pl-2 pr-4 backdrop-blur-sm">
              <span className="rounded-full bg-[#B5372B] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Custo inicial zero</span>
              <span className="text-xs text-white/80">para candidatos elegíveis</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotaoCta onClick={() => irParaFormulario()}>{s.hero.ctaPrimario}</BotaoCta>
              <BotaoCta onClick={() => rolarPara(s.hero.ctaSecundarioAlvo)} variante="contorno" className="text-white">
                {s.hero.ctaSecundario}
              </BotaoCta>
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-white/55">Murata × Fujiarte · Recrutamento Jutsai</p>
          </div>
        </div>
      </section>

      {/* ── DESTAQUES ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Kicker>{s.destaques.kicker}</Kicker>
        <Titulo className="max-w-3xl">{s.destaques.titulo}</Titulo>
        {s.destaques.texto && <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#24262A]/65">{s.destaques.texto}</p>}
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {s.destaques.cards.map((c) => (
            <div key={c.titulo} className="bg-[#F6F4EF] p-7 md:p-8">
              <Icone nome={c.icone} className="h-8 w-8 text-[#1E3B30]" />
              <p className="mt-6 text-[17px] font-medium text-[#24262A]">{c.titulo}</p>
              <p className="mt-2 text-sm leading-6 text-[#24262A]/65">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── A VAGA + SALÁRIO ── */}
      <section id="vaga" className="scroll-mt-4 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:order-2">
            <Image src={s.vaga.imagem} alt={s.vaga.imagemAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div>
            <Kicker>A vaga</Kicker>
            <Titulo>{s.vaga.titulo}</Titulo>
            {s.vaga.texto && <p className="mt-5 text-[16px] leading-7 text-[#24262A]/65">{s.vaga.texto}</p>}
            <dl className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {s.vaga.itens.map((i) => (
                <div key={i.rotulo} className="grid gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <dt className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#24262A]/50">{i.rotulo}</dt>
                  <dd className="text-[15px] text-[#24262A]">{i.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.14em] text-[#24262A]/50">Componentes usados em</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.vaga.usos.map((u) => (
                <span key={u} className="rounded-full border border-black/10 px-4 py-2 text-sm text-[#24262A]/80">
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Salário */}
        <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
          <div className="rounded-3xl bg-[#F6F4EF] p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end">
              <div>
                <Kicker>Remuneração</Kicker>
                <p className="mt-3 text-[22px] font-light leading-snug text-[#24262A] md:text-[28px]">{s.salario.titulo}</p>
                <p className="mt-6 text-[64px] font-light leading-none tracking-[-0.04em] text-[#1E3B30] md:text-[88px]">{s.salario.valor}</p>
                <p className="mt-2 text-sm text-[#24262A]/60">{s.salario.legenda}</p>
              </div>
              <div>
                {s.salario.progressao && (
                  <>
                    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {s.salario.progressao.map((p, i) => (
                        <li key={p.faixa} className="rounded-2xl bg-white p-4">
                          <div className="flex items-end gap-1" aria-hidden="true">
                            {s.salario.progressao!.map((_, j) => (
                              <span key={j} className={`w-2 rounded-sm ${j <= i ? "bg-[#1E3B30]" : "bg-black/10"}`} style={{ height: 8 + j * 6 }} />
                            ))}
                          </div>
                          <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#24262A]/50">{p.faixa}</p>
                          <p className="mt-1 text-lg font-medium text-[#24262A]">{p.valor}</p>
                        </li>
                      ))}
                    </ol>
                    {s.salario.notaProgressao && <p className="mt-3 text-xs leading-5 text-[#24262A]/50">{s.salario.notaProgressao}</p>}
                  </>
                )}
                <p className="mt-6 text-sm leading-6 text-[#24262A]/70">{s.salario.textoAdicionais}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                  {s.salario.adicionais.map((a) => (
                    <li key={a.rotulo} className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm">
                      <span className="text-[#24262A]/80">{a.rotulo}</span>
                      {a.valor && <span className="font-semibold text-[#1E3B30]">{a.valor}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TURNOS ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Kicker>Turnos</Kicker>
            <Titulo>{s.turnos.titulo}</Titulo>
            <p className="mt-5 max-w-lg text-[16px] leading-7 text-[#24262A]/65">{s.turnos.texto}</p>
            {s.turnos.unidades && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.turnos.unidades.map((u) => (
                  <div key={u.nome} className="rounded-2xl border border-black/[0.08] bg-white p-5">
                    <p className="text-sm font-medium text-[#24262A]">{u.nome}</p>
                    {u.horarios.map((h) => (
                      <p key={h.rotulo} className="mt-2 flex justify-between text-sm text-[#24262A]/70">
                        <span>{h.rotulo}</span>
                        <span className="font-medium tabular-nums text-[#24262A]">{h.horario}</span>
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-5 text-xs text-[#24262A]/50">{s.turnos.nota}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 md:p-8">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#24262A]/50">Escala de referência · 4 × 2</p>
            <ol className="mt-5 grid grid-cols-6 gap-2">
              {s.turnos.escala.map((d, i) => (
                <li key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[#24262A]/40">Dia {i + 1}</span>
                  <span
                    className={`flex h-20 w-full items-center justify-center rounded-xl text-[9px] font-semibold uppercase tracking-[0.08em] sm:h-28 sm:text-[11px] ${
                      d === "trabalho" ? "bg-[#1E3B30] text-white" : "border border-dashed border-[#1E3B30]/30 text-[#1E3B30]"
                    }`}
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {d === "trabalho" ? "Trabalho" : "Folga"}
                  </span>
                </li>
              ))}
            </ol>
            {s.turnos.alternado ? (
              <div className="mt-6 grid grid-cols-2 gap-2 text-center text-xs">
                <p className="rounded-lg bg-[#F6F4EF] py-2 text-[#24262A]/70">Período diurno</p>
                <p className="rounded-lg bg-[#24262A] py-2 text-white/85">Período noturno</p>
                <p className="col-span-2 text-[#24262A]/50">Os ciclos alternam entre diurno e noturno.</p>
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-[#E6ECE8] px-4 py-3 text-center text-sm text-[#1E3B30]">Turno fixo — sem alternar entre dia e noite.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── CUSTO ZERO ── */}
      <section className="bg-[#1E3B30] text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Kicker claro>Campanha custo zero</Kicker>
          <Titulo claro className="max-w-3xl">
            {s.custoZero.titulo}
          </Titulo>
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[96px] font-extralight leading-none tracking-[-0.05em] md:text-[150px]">R$ 0</p>
              <p className="mt-3 text-lg font-light text-white/85">de custo inicial de embarque</p>
              <p className="text-sm uppercase tracking-[0.18em] text-white/55">para candidatos elegíveis</p>
            </div>
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10">
              {(
                [
                  ["aviao", "Passagem aérea"],
                  ["documento", "Documentação"],
                  ["assessoria", "Assessoria"],
                  ["mala", "Preparação para embarque"],
                ] as [IconeLanding, string][]
              ).map(([ic, t]) => (
                <li key={t} className="bg-[#1E3B30] p-6 md:p-8">
                  <Icone nome={ic} className="h-8 w-8 text-white/90" />
                  <p className="mt-5 text-[15px] font-medium">{t}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 text-sm leading-6 text-white/65">
            {s.custoZero.condicoes.length > 1 ? (
              <p>
                A campanha depende de: {s.custoZero.condicoes.map((c) => c.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " e $1")}.
              </p>
            ) : (
              <p>{s.custoZero.condicoes[0]}</p>
            )}
          </div>
          {s.custoZero.cta && (
            <BotaoCta onClick={() => irParaFormulario()} className="mt-8">
              {s.custoZero.cta}
            </BotaoCta>
          )}
        </div>
      </section>

      {/* ── REENTRY ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-[#B5372B]/25 bg-white p-7 md:p-14">
          <span aria-hidden="true" className="absolute right-0 top-0 h-full w-1.5 bg-[#B5372B]" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B5372B]">Campanha exclusiva Jutsai</p>
              <Titulo>{s.reentry.titulo}</Titulo>
              <p className="mt-5 text-[16px] leading-7 text-[#24262A]/65">{s.reentry.texto}</p>
              <BotaoCta onClick={() => irParaFormulario(true)} className="mt-8">
                Tenho reentry
              </BotaoCta>
            </div>
            <div className="rounded-2xl bg-[#F6F4EF] p-7 text-center">
              <p className="text-[56px] font-light leading-none tracking-[-0.04em] text-[#24262A] md:text-[72px]">{AUXILIO_EMBARQUE_BRL}</p>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-[#B5372B]">Auxílio Embarque Jutsai</p>
              <p className="mt-3 text-xs leading-5 text-[#24262A]/55">
                Para candidatos elegíveis com reentry válido e prontos para embarcar, conforme as condições da campanha vigente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MORADIA ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>Moradia organizada</Kicker>
              <Titulo className="max-w-3xl">{s.moradia.titulo}</Titulo>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#24262A]/65">{s.moradia.texto}</p>
          <div className="mt-10 flex flex-wrap gap-2">
            {s.moradia.tipos.map((t) => (
              <span key={t} className="rounded-full border border-[#1E3B30]/20 px-5 py-2 text-sm font-medium tracking-[0.08em] text-[#1E3B30]">
                {t}
              </span>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {s.moradia.valores.map((v) => (
              <li key={v.rotulo} className="rounded-2xl bg-[#F6F4EF] p-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#24262A]/55">{v.rotulo}</p>
                <p className="mt-3 text-2xl font-light tracking-[-0.02em] text-[#24262A]">{v.valor}</p>
                <p className="mt-1 text-xs text-[#24262A]/45">aluguel mensal aproximado</p>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-1.5 text-sm leading-6 text-[#24262A]/65">
            {s.moradia.notas.map((n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#1E3B30]" />
                {n}
              </li>
            ))}
          </ul>
          {s.kit && (
            <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-black/[0.08] p-6 md:flex-row md:items-center md:p-8">
              <Icone nome="kit" className="h-9 w-9 shrink-0 text-[#1E3B30]" />
              <div>
                <p className="text-[15px] font-medium text-[#24262A]">{s.kit.titulo}</p>
                <p className="mt-1 text-sm text-[#24262A]/65">
                  {s.kit.texto} {s.kit.itens.join(", ").toLowerCase()}.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CIDADE ── */}
      <section id={s.cidadeSecao.id} className="scroll-mt-4">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image src={s.cidadeSecao.imagem} alt={s.cidadeSecao.imagemAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div>
            <Kicker>{s.cidadeSecao.kicker}</Kicker>
            <Titulo>{s.cidadeSecao.titulo}</Titulo>
            {s.cidadeSecao.texto.map((t) => (
              <p key={t} className="mt-5 text-[16px] leading-7 text-[#24262A]/65">
                {t}
              </p>
            ))}
            <ul className={`mt-10 grid gap-x-6 gap-y-7 ${s.cidadeSecao.blocos.length > 3 ? "grid-cols-2" : "grid-cols-1"}`}>
              {s.cidadeSecao.blocos.map((b) => (
                <li key={b.titulo} className="flex gap-4">
                  <Icone nome={b.icone} className="h-7 w-7 shrink-0 text-[#1E3B30]" />
                  <span>
                    <span className={`block font-medium text-[#24262A] ${s.cidadeSecao.blocos.length > 3 ? "text-[15px]" : "text-[13px] uppercase tracking-[0.18em]"}`}>
                      {b.titulo}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#24262A]/60">{b.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── APOIO ── */}
      {s.apoio && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
            <Kicker>Suporte</Kicker>
            <Titulo>{s.apoio.titulo}</Titulo>
            <div className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-4">
              {s.apoio.cards.map((c) => (
                <div key={c.titulo} className="bg-white p-7">
                  <Icone nome={c.icone} className="h-7 w-7 text-[#1E3B30]" />
                  <p className="mt-5 text-[16px] font-medium text-[#24262A]">{c.titulo}</p>
                  <p className="mt-2 text-sm leading-6 text-[#24262A]/65">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROCESSO ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Kicker>Processo</Kicker>
        <Titulo>{s.processo.titulo}</Titulo>
        <ol className={`mt-12 grid gap-8 sm:grid-cols-2 ${s.processo.passos.length > 4 ? "lg:grid-cols-6 lg:gap-4" : "lg:grid-cols-4"}`}>
          {s.processo.passos.map((p, i) => (
            <li key={p.titulo} className="border-t border-[#1E3B30]/25 pt-5">
              <p className="text-[13px] font-semibold tabular-nums text-[#B5372B]">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-[16px] font-medium leading-snug text-[#24262A]">{p.titulo}</p>
              {p.texto && <p className="mt-2 text-sm leading-6 text-[#24262A]/60">{p.texto}</p>}
            </li>
          ))}
        </ol>
        <BotaoCta onClick={() => irParaFormulario()} className="mt-12 w-full sm:w-auto">
          {s.processo.cta}
        </BotaoCta>
      </section>

      {/* ── MURATA ── */}
      {s.murata && (
        <section className="bg-[#24262A] text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-16">
            <Icone nome="chip" className="h-14 w-14 text-white/70" />
            <div>
              <Kicker claro>Quem é a Murata</Kicker>
              <Titulo claro>{s.murata.titulo}</Titulo>
              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-white/65">{s.murata.texto}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
        <Kicker>Perguntas frequentes</Kicker>
        <Titulo>Antes de se candidatar.</Titulo>
        <div className="mt-10 divide-y divide-black/[0.08] border-y border-black/[0.08]">
          {s.faq.map((f) => (
            <details key={f.pergunta} className="group py-1">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-[#24262A] [&::-webkit-details-marker]:hidden">
                {f.pergunta}
                <span aria-hidden="true" className="text-2xl font-light text-[#1E3B30] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-7 text-[#24262A]/65">{f.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL + FORMULÁRIO ── */}
      <section id="pre-analise" className="scroll-mt-4 bg-[#1E3B30]">
        <div ref={formRef} className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-start">
          <div className="text-white lg:sticky lg:top-10">
            <Kicker claro>Pré-análise gratuita</Kicker>
            <h2 className="mt-3 text-[32px] font-light leading-[1.1] tracking-[-0.02em] md:text-[48px]">{s.final.titulo}</h2>
            <p className="mt-5 text-[16px] leading-7 text-white/70">{s.final.texto}</p>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/50">{s.final.rodape}</p>
            <ul className="mt-10 space-y-3 text-sm text-white/70">
              {["Custo inicial zero de embarque para candidatos elegíveis", "Contratação pela Fujiarte, alocação na Murata", "Atendimento em português pelo WhatsApp"].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B5372B]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <FormularioPreCandidatura config={s} reentrySinal={reentrySinal} />
        </div>
      </section>

      <footer className="bg-[#13261f] px-5 py-10 text-center text-[11px] leading-5 text-white/45 md:px-8">
        <p>
          Recrutamento no Brasil: Jutsai. Contratação no Japão: Fujiarte, com alocação na operação da {s.fabrica}. Murata, Fujiarte e
          Jutsai são empresas independentes.
        </p>
        <p className="mt-2">
          Participação sujeita à análise de elegibilidade, aprovação no processo, documentação e disponibilidade da vaga. Valores de
          referência sujeitos à confirmação na contratação.
        </p>
      </footer>

      {/* ── CTA fixo no celular ── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#F6F4EF]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform md:hidden ${
          formVisivel ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => irParaFormulario()}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-[#B5372B] text-[12px] font-semibold uppercase tracking-[0.12em] text-white"
          >
            Verificar elegibilidade
          </button>
          <a
            href={linkWhatsapp(`Olá! Vi a vaga da Murata em ${s.cidade} e quero saber mais.`)}
            target="_blank"
            rel="noreferrer"
            aria-label="Falar no WhatsApp"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#1E3B30]/25 text-[#1E3B30]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z" />
            </svg>
          </a>
        </div>
      </div>

      {/* WhatsApp flutuante — desktop */}
      <a
        href={linkWhatsapp(`Olá! Vi a vaga da Murata em ${s.cidade} e quero saber mais.`)}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#1E3B30] text-white shadow-lg transition hover:scale-105 md:flex"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z" />
        </svg>
      </a>
    </main>
  );
}

