"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página nova — pedido do Wilson, 16/set/2026 (colado de um e-mail que ele
// recebeu, com uma visão bem mais ampla do que só esta página: catálogo de
// vagas ao vivo, sistema de match, bot de WhatsApp pra qualificar leads,
// testes online). Alinhado com ele via AskUserQuestion antes de começar:
// construir agora a página completa (template visual de /produtos) com
// vagas GENÉRICAS de placeholder — o catálogo real, o motor de match, o
// bot de WhatsApp e os testes (visão, foto) ficam para uma fase seguinte,
// são sistemas à parte. Logos das empresas em texto por enquanto (Wilson
// ainda não tem os arquivos PNG/SVG à mão).
const WHATSAPP_NUMBER = "5511930300101";

function linkWhatsapp(mensagem: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

// ── Os 2 tipos de serviço (público-alvo) ──
type PublicoKey = "brasil" | "japao";
const PUBLICOS: { key: PublicoKey; nome: string; descricao: string; cta: string }[] = [
  {
    key: "brasil",
    nome: "Emprego no Japão para quem está no Brasil",
    descricao:
      "Você está no Brasil e quer um emprego formal no Japão, com contrato, moradia e todo o processo de mudança organizado do início ao fim.",
    cta: "Ver vagas para quem vem do Brasil",
  },
  {
    key: "japao",
    nome: "Troca de emprego para quem já está no Japão",
    descricao:
      "Você já mora e trabalha no Japão e quer uma vaga melhor — mais perto de casa, com salário maior ou em outro setor.",
    cta: "Ver vagas para quem já está no Japão",
  },
];

// ── Setores ──
type SetorKey = "automotivo" | "eletronicos" | "alimenticio";
const SETORES: { key: SetorKey; nome: string; descricao: string }[] = [
  {
    key: "automotivo",
    nome: "Automobilístico",
    descricao: "Linhas de montagem, componentes e logística para montadoras e fornecedoras do setor automotivo.",
  },
  {
    key: "eletronicos",
    nome: "Componentes Eletrônicos",
    descricao: "Fabricação, montagem e controle de qualidade de componentes eletrônicos e semicondutores.",
  },
  {
    key: "alimenticio",
    nome: "Alimentício",
    descricao: "Produção, embalagem e logística em fábricas de alimentos e bebidas.",
  },
];

function IconSetor({ setor, className }: { setor: SetorKey; className?: string }) {
  if (setor === "automotivo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13" />
        <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    );
  }
  if (setor === "eletronicos") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" />
        <path d="M9 3v2.5M12 3v2.5M15 3v2.5M9 18.5V21M12 18.5V21M15 18.5V21M3 9h2.5M3 12h2.5M3 15h2.5M18.5 9H21M18.5 12H21M18.5 15H21" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3v6a3 3 0 0 0 3 3v9" />
      <path d="M6 3v6M9 3v6" />
      <path d="M17 3c-1.7 0-3 2-3 5s1.3 5 3 5" />
      <path d="M17 3v18" />
    </svg>
  );
}

// ── Regiões — polos industriais reais do Japão (não as cidades turísticas
// usadas no resto do site) ──
const REGIOES = [
  "Aichi",
  "Shizuoka",
  "Gunma",
  "Mie",
  "Gifu",
  "Kanagawa",
  "Saitama",
  "Ibaraki",
  "Nagano",
] as const;
type RegiaoKey = (typeof REGIOES)[number];

// ── Vagas — dados GENÉRICOS de placeholder, pedido explícito do Wilson,
// 16/set/2026 ("coloque vagas genericas só como placeholder por hora") —
// o catálogo real (com integração ao vivo) chega numa fase seguinte, com
// os arquivos que ele ainda vai enviar. Nomes de empresa aqui são
// fictícios/genéricos de propósito — não usar nomes reais de clientes
// corporativos nas vagas (ver carrossel de logos mais abaixo, esse sim
// com os nomes reais que o Wilson passou).
type Vaga = {
  id: string;
  titulo: string;
  setor: SetorKey;
  regiao: RegiaoKey;
  publico: PublicoKey[];
  turno: string;
  contrato: string;
  idioma: string;
};

const VAGAS_PLACEHOLDER: Vaga[] = [
  { id: "v1", titulo: "Operador de linha de montagem", setor: "automotivo", regiao: "Aichi", publico: ["brasil", "japao"], turno: "Diurno, escala 5x2", contrato: "CLT japonesa (seishain)", idioma: "N4 ou básico com intérprete" },
  { id: "v2", titulo: "Auxiliar de produção automotiva", setor: "automotivo", regiao: "Shizuoka", publico: ["brasil"], turno: "Turno noturno", contrato: "Contrato temporário (haken)", idioma: "N5 ou nenhum" },
  { id: "v3", titulo: "Inspetor de qualidade — autopeças", setor: "automotivo", regiao: "Gunma", publico: ["japao"], turno: "Diurno", contrato: "CLT japonesa (seishain)", idioma: "N3" },
  { id: "v4", titulo: "Operador de solda robotizada", setor: "automotivo", regiao: "Mie", publico: ["brasil", "japao"], turno: "Turno rotativo", contrato: "Contrato temporário (haken)", idioma: "N4" },
  { id: "v5", titulo: "Montador de placas eletrônicas", setor: "eletronicos", regiao: "Kanagawa", publico: ["brasil", "japao"], turno: "Diurno, escala 5x2", contrato: "Contrato temporário (haken)", idioma: "N5 ou nenhum" },
  { id: "v6", titulo: "Técnico de controle de qualidade — componentes", setor: "eletronicos", regiao: "Nagano", publico: ["japao"], turno: "Diurno", contrato: "CLT japonesa (seishain)", idioma: "N3" },
  { id: "v7", titulo: "Operador de sala limpa (semicondutores)", setor: "eletronicos", regiao: "Mie", publico: ["brasil"], turno: "Turno rotativo", contrato: "Contrato temporário (haken)", idioma: "N4" },
  { id: "v8", titulo: "Auxiliar de montagem eletrônica", setor: "eletronicos", regiao: "Saitama", publico: ["brasil", "japao"], turno: "Turno noturno", contrato: "Contrato temporário (haken)", idioma: "N5 ou nenhum" },
  { id: "v9", titulo: "Operador de produção alimentícia", setor: "alimenticio", regiao: "Ibaraki", publico: ["brasil", "japao"], turno: "Diurno, escala 5x2", contrato: "Contrato temporário (haken)", idioma: "N5 ou nenhum" },
  { id: "v10", titulo: "Auxiliar de embalagem e logística", setor: "alimenticio", regiao: "Gifu", publico: ["brasil"], turno: "Turno noturno", contrato: "Contrato temporário (haken)", idioma: "N5 ou nenhum" },
  { id: "v11", titulo: "Líder de linha — alimentos", setor: "alimenticio", regiao: "Aichi", publico: ["japao"], turno: "Diurno", contrato: "CLT japonesa (seishain)", idioma: "N3" },
  { id: "v12", titulo: "Operador de forno industrial", setor: "alimenticio", regiao: "Shizuoka", publico: ["brasil", "japao"], turno: "Turno rotativo", contrato: "Contrato temporário (haken)", idioma: "N4" },
];

const SETOR_NOME: Record<SetorKey, string> = {
  automotivo: "Automobilístico",
  eletronicos: "Componentes Eletrônicos",
  alimenticio: "Alimentício",
};

// ── Jornada do cliente — 5 etapas, conteúdo do e-mail do Wilson,
// 16/set/2026 (processo real de hoje; o que muda com o tempo é só o quanto
// disso fica automatizado por trás — catálogo ao vivo, match automático,
// bot de WhatsApp). ──
const JORNADA = [
  {
    numero: "01",
    titulo: "Escolha as vagas",
    texto:
      "Veja todas as vagas abertas dentro do site, filtre por região e por setor, e monte sua lista com quantas vagas quiser — como um carrinho de compras.",
  },
  {
    numero: "02",
    titulo: "Candidatura e match",
    texto:
      "Você faz um cadastro inicial. Comparamos seu perfil com o que cada empresa procura — se o match for positivo, você recebe a ficha específica daquela vaga (definida pela própria empresa) para preencher.",
  },
  {
    numero: "03",
    titulo: "Testes",
    texto:
      "Etapas como teste de visão online e checagem de foto, para confirmar que você está dentro do padrão exigido pela empresa antes da entrevista.",
  },
  {
    numero: "04",
    titulo: "Entrevista por WhatsApp",
    texto: "Nosso time entra em contato direto com você pelo WhatsApp, passando todos os detalhes da entrevista.",
  },
  {
    numero: "05",
    titulo: "Passagem, visto e documentação",
    texto:
      "Damos suporte completo em passagem, visto e toda a documentação necessária, até o seu primeiro dia no novo emprego no Japão.",
  },
];

const DIFERENCIAIS = [
  {
    titulo: "+12 anos de presença no Japão",
    texto: "Mais de uma década de operação própria no Japão, com equipe local e experiência real com o mercado de trabalho japonês.",
  },
  {
    titulo: "Rede direta com fábricas e fornecedoras",
    texto: "Relacionamento direto com empresas dos setores automotivo, eletrônico e alimentício — sem intermediários entre você e a vaga.",
  },
  {
    titulo: "Processo cuidadoso, do match à mudança",
    texto: "Acompanhamos cada etapa: candidatura, match com a empresa, testes, entrevista, passagem, visto e documentação.",
  },
  {
    titulo: "Atendimento em português, do Brasil ao Japão",
    texto: "Suporte em português por WhatsApp durante toda a jornada, antes e depois da sua chegada ao Japão.",
  },
];

// ── Logos. Pedido do Wilson, 17/set/2026: "na pagina de empregos, vamos
// adicionar os logos que estao indicados no rodapé da pagina" — enviou os
// 4 arquivos das empresas parceiras (Fujiarte, Avance Authent, Brexa, UT
// Sumi-emu) e os 9 logos dos clientes corporativos, todos enviados em
// 17/set/2026 (a Fujifilm veio por último — um print 3840×2160 recortado e
// com o fundo branco tornado transparente aqui). Duplicado 2x dentro do
// componente Marquee pra criar o loop infinito sem buraco no CSS. ──
type ItemMarquee = { nome: string; logo?: string };

const EMPRESAS_PARCEIRAS: ItemMarquee[] = [
  { nome: "Fujiarte", logo: "/images/logo-parceiro-fujiarte.png" },
  { nome: "Avance Authent", logo: "/images/logo-parceiro-authent.png" },
  { nome: "Brexa", logo: "/images/logo-parceiro-brexa.png" },
  { nome: "UT Sumi-emu", logo: "/images/logo-parceiro-ut.png" },
];
const CLIENTES_CORPORATIVOS: ItemMarquee[] = [
  { nome: "Murata", logo: "/images/logo-cliente-murata.png" },
  { nome: "Yamaha", logo: "/images/logo-cliente-yamaha.png" },
  { nome: "Sony", logo: "/images/logo-cliente-sony.png" },
  { nome: "Panasonic", logo: "/images/logo-cliente-panasonic.png" },
  { nome: "Yokohama Tyres", logo: "/images/logo-cliente-yokohama-tyres.png" },
  { nome: "Mitsubishi Denki", logo: "/images/logo-cliente-mitsubishi-denki.png" },
  { nome: "Fujifilm", logo: "/images/logo-cliente-fujifilm.png" },
  { nome: "Aisin", logo: "/images/logo-cliente-aisin.png" },
  { nome: "Subaru", logo: "/images/logo-cliente-subaru.png" },
];

function Marquee({ itens }: { itens: ItemMarquee[] }) {
  const lista = [...itens, ...itens];
  return (
    <div className="marquee-viewport">
      <div className="marquee-track">
        {lista.map((item, i) =>
          item.logo ? (
            <div
              key={`${item.nome}-${i}`}
              className="mx-6 flex h-14 w-36 shrink-0 items-center justify-center"
            >
              <img
                src={item.logo}
                alt={item.nome}
                className="max-h-8 w-auto object-contain md:max-h-9"
              />
            </div>
          ) : (
            <span
              key={`${item.nome}-${i}`}
              className="mx-4 shrink-0 rounded-full border border-black/10 bg-black/[0.02] px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] text-black/55"
            >
              {item.nome}
            </span>
          ),
        )}
      </div>
      <style jsx>{`
        .marquee-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 32s linear infinite;
        }
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function EmpregosPage() {
  const [publicoFiltro, setPublicoFiltro] = useState<PublicoKey | "todos">("todos");
  const [setorFiltro, setSetorFiltro] = useState<SetorKey | "todos">("todos");
  const [regioesFiltro, setRegioesFiltro] = useState<Set<RegiaoKey>>(new Set());
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  function irParaVagas(ajustes?: { publico?: PublicoKey | "todos"; setor?: SetorKey | "todos" }) {
    if (ajustes?.publico !== undefined) setPublicoFiltro(ajustes.publico);
    if (ajustes?.setor !== undefined) setSetorFiltro(ajustes.setor);
    document.getElementById("vagas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function alternarRegiao(regiao: RegiaoKey) {
    setRegioesFiltro((atual) => {
      const novo = new Set(atual);
      if (novo.has(regiao)) novo.delete(regiao);
      else novo.add(regiao);
      return novo;
    });
  }

  function alternarSelecao(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const vagasFiltradas = useMemo(() => {
    return VAGAS_PLACEHOLDER.filter((vaga) => {
      if (publicoFiltro !== "todos" && !vaga.publico.includes(publicoFiltro)) return false;
      if (setorFiltro !== "todos" && vaga.setor !== setorFiltro) return false;
      if (regioesFiltro.size > 0 && !regioesFiltro.has(vaga.regiao)) return false;
      return true;
    });
  }, [publicoFiltro, setorFiltro, regioesFiltro]);

  const vagasSelecionadas = VAGAS_PLACEHOLDER.filter((v) => selecionadas.has(v.id));

  function mensagemCandidatura() {
    const linhas = [
      "Olá! Tenho interesse nas vagas abaixo (catálogo Ajisai Empregos):",
      "",
      ...vagasSelecionadas.map((v) => `• ${v.titulo} — ${v.regiao} (${SETOR_NOME[v.setor]})`),
      "",
      "Podem me passar os próximos passos?",
    ];
    return linhas.join("\n");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* ── HEADER ── */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
          <Link href="/">
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-10 w-auto object-contain md:h-11" />
          </Link>
          <a
            href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#2f80c9] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3b91dc]"
          >
            Falar no WhatsApp
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative border-b border-black/10 bg-[#0A2540] pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#6ec3d9]">Ajisai Empregos</p>
          <h1 className={`${display.className} mt-4 text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.1] text-white`}>
            Emprego formal no Japão, do primeiro contato até a mudança
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-6 text-white/65 md:text-base">
            Vagas nos setores automobilístico, de componentes eletrônicos e alimentício — para quem
            está no Brasil e quer vir para o Japão, ou para quem já está no Japão e quer mudar de
            emprego.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => irParaVagas()}
              className="rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3b91dc]"
            >
              Ver vagas
            </button>
            <a
              href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/25 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/50"
            >
              Falar com a Ajisai
            </a>
          </div>
        </div>
      </section>

      {/* ── OS 2 TIPOS DE SERVIÇO ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>
            Qual é a sua situação?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PUBLICOS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => irParaVagas({ publico: p.key })}
                className="group flex flex-col rounded-2xl border border-black/10 bg-black/[0.02] p-7 text-left transition hover:border-black/25 hover:bg-black/[0.04] md:p-8"
              >
                <h3 className={`${display.className} text-xl font-medium text-black md:text-2xl`}>{p.nome}</h3>
                <p className="mt-3 flex-1 text-sm font-light leading-6 text-black/55">{p.descricao}</p>
                <span className="mt-5 inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f80c9]">
                  {p.cta} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS AJISAI ── */}
      <section className="border-b border-black/10 bg-black/[0.02] px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Por que a Ajisai</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            Diferenciais Ajisai
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((d) => (
              <div key={d.titulo} className="rounded-2xl border border-black/10 bg-white p-6">
                <h3 className="text-sm font-semibold text-black">{d.titulo}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 CARDS DE SETOR ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>Setores</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SETORES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => irParaVagas({ setor: s.key })}
                className="group flex flex-col items-start rounded-2xl border border-black/10 bg-black/[0.02] p-7 text-left transition hover:border-[#2f80c9]/50 hover:bg-[#2f80c9]/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
                  <IconSetor setor={s.key} className="h-6 w-6" />
                </span>
                <h3 className={`${display.className} mt-4 text-lg font-medium text-black`}>{s.nome}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{s.descricao}</p>
                <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f80c9]">
                  Ver vagas →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO DE VAGAS ── */}
      <section id="vagas" className="scroll-mt-24 border-b border-black/10 bg-black/[0.02] px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Catálogo</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Vagas</h2>
          <p className="mt-2 max-w-2xl text-sm font-light leading-6 text-black/55">
            Selecione a região e o setor para filtrar, marque quantas vagas quiser e aplique de uma
            vez — como um carrinho de compras.
          </p>

          {/* Aviso de placeholder — pedido do Wilson, 16/set/2026: "coloque
              vagas genericas só como placeholder por hora". Fica visível
              pro visitante pra não passar a impressão de vaga real aberta
              antes do catálogo de verdade estar integrado. */}
          <p className="mt-4 w-fit rounded-full border border-amber-300 bg-amber-50/70 px-4 py-1.5 text-[11px] font-medium text-amber-800">
            ⚠️ Vagas de exemplo — o catálogo real será integrado em breve.
          </p>

          {/* Filtro por público */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPublicoFiltro("todos")}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                publicoFiltro === "todos" ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
              }`}
            >
              Todos os públicos
            </button>
            {PUBLICOS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPublicoFiltro(p.key)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  publicoFiltro === p.key ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
                }`}
              >
                {p.key === "brasil" ? "Vindo do Brasil" : "Já no Japão"}
              </button>
            ))}
          </div>

          {/* Filtro por setor */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSetorFiltro("todos")}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                setorFiltro === "todos" ? "border-[#0A2540] bg-[#0A2540] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
              }`}
            >
              Todos os setores
            </button>
            {SETORES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSetorFiltro(s.key)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  setorFiltro === s.key ? "border-[#0A2540] bg-[#0A2540] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
                }`}
              >
                {s.nome}
              </button>
            ))}
          </div>

          {/* Filtro por região — modelo "Tabelog": grade de chips de região,
              multi-seleção, sem região marcada = mostra todas. */}
          <div className="mt-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-black/40">Região</p>
            <div className="flex flex-wrap gap-2">
              {REGIOES.map((r) => {
                const marcado = regioesFiltro.has(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => alternarRegiao(r)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      marcado ? "border-[#b79ce6] bg-[#b79ce6]/15 text-[#6b4fa0]" : "border-black/15 bg-white text-black/55 hover:border-black/30"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
              {regioesFiltro.size > 0 && (
                <button
                  type="button"
                  onClick={() => setRegioesFiltro(new Set())}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-black/40 underline decoration-black/20 underline-offset-2 hover:text-black/60"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Grade de vagas */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vagasFiltradas.map((vaga) => {
              const marcada = selecionadas.has(vaga.id);
              return (
                <label
                  key={vaga.id}
                  className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                    marcada ? "border-[#2f80c9] bg-[#2f80c9]/5" : "border-black/10 bg-white hover:border-black/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/50">
                      {SETOR_NOME[vaga.setor]}
                    </span>
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternarSelecao(vaga.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f80c9]"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-black">{vaga.titulo}</h3>
                  <p className="mt-1 text-xs text-black/50">{vaga.regiao}, Japão</p>
                  <div className="mt-3 space-y-1 text-[11px] leading-4 text-black/45">
                    <p>{vaga.turno}</p>
                    <p>{vaga.contrato}</p>
                    <p>Japonês: {vaga.idioma}</p>
                  </div>
                </label>
              );
            })}
            {vagasFiltradas.length === 0 && (
              <p className="col-span-full text-sm text-black/40">
                Nenhuma vaga de exemplo com esses filtros — tente outra combinação de região e setor.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── BARRA FIXA: carrinho de vagas ── */}
      {selecionadas.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/97 px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-black/70">
              {selecionadas.size} {selecionadas.size === 1 ? "vaga selecionada" : "vagas selecionadas"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelecionadas(new Set())}
                className="rounded-full px-3 py-2 text-[11px] font-medium text-black/40 underline decoration-black/20 underline-offset-2 hover:text-black/60"
              >
                Limpar seleção
              </button>
              <a
                href={linkWhatsapp(mensagemCandidatura())}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#2f80c9] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3b91dc]"
              >
                Aplicar para as vagas selecionadas
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── JORNADA DO CLIENTE ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Como funciona</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            A jornada até o seu novo emprego
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {JORNADA.map((etapa) => (
              <div key={etapa.numero} className="rounded-2xl border border-black/10 bg-black/[0.02] p-5">
                <span className={`${display.className} text-2xl font-medium text-[#2f80c9]`}>{etapa.numero}</span>
                <h3 className="mt-2 text-sm font-semibold text-black">{etapa.titulo}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{etapa.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARROSSEL DE LOGOS ── */}
      <section className="border-b border-black/10 bg-black/[0.02] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-16">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">Empresas parceiras</p>
        </div>
        <div className="mt-5">
          <Marquee itens={EMPRESAS_PARCEIRAS} />
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-6 md:px-16">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">
            Clientes corporativos que já contrataram nossos candidatos
          </p>
        </div>
        <div className="mt-5">
          <Marquee itens={CLIENTES_CORPORATIVOS} />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#0A2540] px-6 py-16 text-center md:px-16 md:py-20">
        <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
          Pronto para dar o próximo passo?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-6 text-white/65">
          Fale com o time da Ajisai pelo WhatsApp e comece agora sua candidatura.
        </p>
        <a
          href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-block rounded-full bg-[#2f80c9] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3b91dc]"
        >
          Falar com a Ajisai no WhatsApp
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white px-8 pb-20 pt-16 text-black md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-11 w-auto object-contain invert md:h-12" />
          <p className="max-w-sm text-sm leading-relaxed text-black/50">
            Empregos formais no Japão para brasileiros — do primeiro contato até a mudança.
          </p>
          <p className="text-[11px] leading-relaxed text-black/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos Reservados — CNPJ:
            43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}
