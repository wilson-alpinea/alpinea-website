"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_NUMBER = "5511930300101";

type ProdutoKey = "roteiro" | "caravana" | "individual" | "personalizado";

// Usado nos botões/pills de qualificação, no recomendador e para montar a
// mensagem final do WhatsApp — uma única fonte de verdade para nome/preço.
const PRODUTOS: Record<ProdutoKey, { nome: string; precoLabel: string; href: string }> = {
  roteiro: {
    nome: "Roteiro Personalizado",
    precoLabel: "A partir de R$ 1.500",
    href: "/ajisairoteiros",
  },
  caravana: {
    nome: "Caravana",
    precoLabel: "A partir de R$ 13.490",
    href: "/pacotes#pacotes",
  },
  individual: {
    nome: "Individual ou Pequenos Grupos",
    precoLabel: "A partir de R$ 13.490",
    href: "/pacotes#individuais",
  },
  personalizado: {
    nome: "Pacote Personalizado",
    precoLabel: "Sob consulta",
    href: "/pacotes#personalizado",
  },
};

// Espelha os 4 blocos do roteiro-vídeo descrito: perfil do dia, detalhe da
// atração, hotéis/restaurantes/anexos e o "nós planejamos, você reserva".
const ROTEIRO_DESTAQUES = [
  "Cada dia planejado de acordo com seu perfil: cidade, horário, atração, deslocamento e refeição.",
  "Cada atração com melhor horário, tempo de visita, estação, transporte recomendado e ingressos.",
  "Hotéis, restaurantes, logística e anexos especiais organizados em um único painel.",
  "Nós planejamos. Você reserva e viaja por conta própria.",
];

const PACOTES_AJISAI: {
  key: ProdutoKey;
  titulo: string;
  frase: string;
  pontos: string[];
  ctaVer: string;
  ctaWhats: string;
}[] = [
  {
    key: "caravana",
    titulo: "Caravana",
    frase: "Quero viajar acompanhado e gastar menos.",
    pontos: [
      "Datas e roteiro predefinidos",
      "Grupo maior",
      "Menor flexibilidade",
      "Melhor custo-benefício",
    ],
    ctaVer: "Ver caravanas →",
    ctaWhats: "Falar no WhatsApp",
  },
  {
    key: "individual",
    titulo: "Individual ou Pequenos Grupos",
    frase: "Quero uma viagem pronta, mas sem caravana.",
    pontos: [
      "Datas flexíveis",
      "Viagem individual, casal, família ou pequeno grupo",
      "Roteiro predefinido",
      "Ajisai organiza a viagem",
    ],
    ctaVer: "Ver pacotes →",
    ctaWhats: "Falar no WhatsApp",
  },
  {
    key: "personalizado",
    titulo: "Pacote Personalizado",
    frase: "Quero que a viagem seja criada para mim.",
    pontos: [
      "Datas escolhidas por você",
      "Roteiro personalizado",
      "Hotéis e logística personalizados",
      "Ajisai organiza a viagem",
    ],
    ctaVer: "Ver detalhes →",
    ctaWhats: "Solicitar proposta",
  },
];

const COLUNAS: { key: ProdutoKey; titulo: string }[] = [
  { key: "roteiro", titulo: "Roteiro Personalizado" },
  { key: "caravana", titulo: "Caravana" },
  { key: "individual", titulo: "Individual / Pequenos Grupos" },
  { key: "personalizado", titulo: "Pacote Personalizado" },
];

const LINHAS: { label: string; valores: Record<ProdutoKey, boolean | string> }[] = [
  {
    label: "Roteiro personalizado",
    valores: { roteiro: true, caravana: false, individual: false, personalizado: true },
  },
  {
    label: "Datas flexíveis",
    valores: { roteiro: true, caravana: false, individual: true, personalizado: true },
  },
  {
    label: "Cliente faz as reservas",
    valores: { roteiro: true, caravana: false, individual: false, personalizado: false },
  },
  {
    label: "Ajisai organiza a viagem",
    valores: { roteiro: false, caravana: true, individual: true, personalizado: true },
  },
  {
    label: "Viaja em grupo grande",
    valores: { roteiro: false, caravana: true, individual: false, personalizado: false },
  },
  {
    label: "Viagem privativa",
    valores: { roteiro: true, caravana: false, individual: true, personalizado: true },
  },
  {
    label: "Melhor para",
    valores: {
      roteiro: "Quem organiza sozinho",
      caravana: "Custo-benefício",
      individual: "Praticidade",
      personalizado: "Personalização total",
    },
  },
  {
    label: "A partir de",
    valores: {
      roteiro: "R$ 1.500",
      caravana: "R$ 13.490",
      individual: "R$ 13.490",
      personalizado: "Sob consulta",
    },
  },
];

export default function ProdutosPage() {
  const [qualProduto, setQualProduto] = useState<ProdutoKey | null>(null);
  const [nome, setNome] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [viajantes, setViajantes] = useState("");
  const [passagens, setPassagens] = useState<"sim" | "nao" | "">("");
  const [primeiraViagem, setPrimeiraViagem] = useState<"sim" | "nao" | "">("");
  const [enviado, setEnviado] = useState(false);

  const [recStep, setRecStep] = useState<1 | 2 | 3>(1);
  const [recResultado, setRecResultado] = useState<ProdutoKey | null>(null);

  function escolherProduto(produto: ProdutoKey) {
    setQualProduto(produto);
    setEnviado(false);
    requestAnimationFrame(() => {
      document.getElementById("qualificacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function responderRecomendador(passo: 1 | 2 | 3, resposta: string) {
    if (passo === 1) {
      if (resposta === "sim") {
        setRecResultado("roteiro");
        return;
      }
      setRecStep(2);
      return;
    }
    if (passo === 2) {
      if (resposta === "sim") {
        setRecResultado("caravana");
        return;
      }
      setRecStep(3);
      return;
    }
    setRecResultado(resposta === "estruturado" ? "individual" : "personalizado");
  }

  function resetRecomendador() {
    setRecStep(1);
    setRecResultado(null);
  }

  function handleQualificar() {
    if (!qualProduto || !nome) return;
    const produto = PRODUTOS[qualProduto];

    const lines = [
      `Olá! Meu nome é ${nome}.`,
      "Conheci as opções no site e tenho interesse em:",
      "",
      produto.nome,
      periodo && `Período: ${periodo}`,
      viajantes && `Viajantes: ${viajantes}`,
      passagens && `Já possui passagens aéreas: ${passagens === "sim" ? "Sim" : "Não"}`,
      primeiraViagem && `Primeira viagem ao Japão: ${primeiraViagem === "sim" ? "Sim" : "Não"}`,
    ].filter((line): line is string => Boolean(line) || line === "");

    const text = encodeURIComponent(lines.join("\n"));

    window.gtag?.("event", "whatsapp_click", { form_name: "produtos_qualificacao" });
    window.gtag?.("event", "generate_lead", {
      form_name: "produtos_qualificacao",
      contact_channel: "whatsapp",
    });
    window.gtag?.("event", "conversion", {
      send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE",
      value: 1.0,
      currency: "BRL",
    });

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setEnviado(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* ── HEADER ── */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
          <Link href="/">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />
          </Link>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <Link href="/ajisairoteiros" className="transition hover:text-white">
              Roteiro
            </Link>
            <Link href="/pacotes" className="transition hover:text-white">
              Pacotes
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO — SELETOR DE 2 CAMINHOS ── */}
      <section className="border-b border-white/10 bg-black px-6 pb-16 pt-32 text-center md:px-16 md:pb-24 md:pt-40">
        <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/50">
          Escolha como viajar
        </p>
        <h1
          className={`${display.className} text-3xl font-medium leading-tight text-white sm:text-4xl md:text-6xl`}
        >
          Como você quer viajar pelo Japão?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-6 text-white/60 md:text-base md:leading-7">
          A Ajisai oferece diferentes formas de planejar sua viagem. Escolha
          quanto da organização você quer fazer por conta própria.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 md:mt-16">
          <a
            href="#roteiro"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] md:p-10"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Quero organizar minha viagem
            </p>
            <h2 className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}>
              Roteiro Personalizado
            </h2>
            <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
              Você recebe todo o planejamento e viaja por conta própria.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
              Conhecer o Roteiro →
            </span>
          </a>

          <a
            href="#pacotes-ajisai"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] md:p-10"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Quero que a Ajisai organize
            </p>
            <h2 className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}>
              Pacotes de Viagem
            </h2>
            <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
              A Ajisai organiza os principais componentes da viagem para você.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
              Ver opções →
            </span>
          </a>
        </div>
      </section>

      {/* ── ROTEIRO PERSONALIZADO — DEMONSTRAÇÃO ── */}
      <section id="roteiro" className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Roteiro Personalizado
            </p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Isto não é uma lista de lugares para visitar.
            </h2>
            <p className="mt-5 text-sm font-light leading-6 text-white/60 md:text-base md:leading-7">
              É um painel digital onde cada dia da sua viagem é planejado de
              acordo com o seu perfil — acessível pelo celular, do início ao
              fim da viagem.
            </p>

            <ul className="mt-6 space-y-3">
              {ROTEIRO_DESTAQUES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/65">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6ec3d9]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">A partir de</p>
                <p className={`${display.className} text-4xl font-medium text-white`}>R$ 1.500</p>
              </div>
              <button
                type="button"
                onClick={() => escolherProduto("roteiro")}
                className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Quero meu roteiro personalizado →
              </button>
            </div>
            <Link
              href="/ajisairoteiros"
              className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-white/40 underline underline-offset-4 transition hover:text-white"
            >
              Ver o roteiro completo →
            </Link>
          </div>

          <div className="flex justify-center">
            <a
              href="/images/dashmobile-ajisai.jpg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver painel do roteiro em tamanho maior"
              className="group relative w-[240px] rounded-[40px] border border-white/15 bg-black p-3 shadow-2xl md:w-[280px]"
            >
              <div className="absolute left-1/2 top-5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
              <div className="relative aspect-[1320/2257] w-full overflow-hidden rounded-[28px] bg-black">
                <Image
                  src="/images/dashmobile-ajisai.jpg"
                  alt="Painel Ajisai — roteiro diário, atrações e logística organizados"
                  fill
                  sizes="280px"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── PACOTES AJISAI — 3 PRODUTOS ── */}
      <section id="pacotes-ajisai" className="border-b border-white/10 bg-black px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Pacotes de Viagem
            </p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              A Ajisai organiza a viagem para você
            </h2>
            <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base">
              Três formas de viajar com tudo já estruturado — do grupo
              fechado ao roteiro sob medida.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PACOTES_AJISAI.map((p) => (
              <div
                key={p.key}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">{p.titulo}</p>
                <h3 className={`${display.className} mt-2 text-xl font-medium text-white`}>
                  {p.frase}
                </h3>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.pontos.map((ponto) => (
                    <li
                      key={ponto}
                      className="flex items-start gap-2.5 text-sm leading-5 text-white/65"
                    >
                      <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6ec3d9]" />
                      {ponto}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  A partir de
                </p>
                <p className={`${display.className} mt-1 text-2xl font-medium text-white`}>
                  {PRODUTOS[p.key].precoLabel.replace("A partir de ", "")}
                </p>

                <div className="mt-5 flex flex-col gap-2.5">
                  <Link
                    href={PRODUTOS[p.key].href}
                    className="rounded-full border border-white/20 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50 hover:text-white"
                  >
                    {p.ctaVer}
                  </Link>
                  <button
                    type="button"
                    onClick={() => escolherProduto(p.key)}
                    className="rounded-full px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: "#2f80c9" }}
                  >
                    {p.ctaWhats}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATIVO ── */}
      <section className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">Comparativo</p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Qual opção combina com você
            </h2>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-white/10 px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-white/30" />
                  {COLUNAS.map((c) => (
                    <th
                      key={c.key}
                      className="border-b border-white/10 px-3 py-3 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-white/70"
                    >
                      {c.titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LINHAS.map((linha) => (
                  <tr key={linha.label} className="border-b border-white/5">
                    <td className="px-3 py-3.5 text-xs text-white/55">{linha.label}</td>
                    {COLUNAS.map((c) => {
                      const valor = linha.valores[c.key];
                      return (
                        <td key={c.key} className="px-3 py-3.5 text-center">
                          {typeof valor === "boolean" ? (
                            valor ? (
                              <IconCheck className="mx-auto h-4 w-4 text-[#6ec3d9]" />
                            ) : (
                              <span className="text-white/20">—</span>
                            )
                          ) : (
                            <span className="text-xs text-white/70">{valor}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── RECOMENDADOR — 3 PERGUNTAS ── */}
      <section id="recomendador" className="border-b border-white/10 bg-black px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
            Ainda não sabe qual escolher?
          </p>
          <h2
            className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
          >
            Encontre sua opção em 30 segundos
          </h2>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            {recResultado ? (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Recomendação</p>
                <p className={`${display.className} mt-2 text-2xl font-medium text-white`}>
                  {PRODUTOS[recResultado].nome}
                </p>
                <p className="mt-2 text-sm text-white/55">{PRODUTOS[recResultado].precoLabel}</p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => escolherProduto(recResultado)}
                    className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: "#2f80c9" }}
                  >
                    Falar no WhatsApp →
                  </button>
                  <button
                    type="button"
                    onClick={resetRecomendador}
                    className="text-xs uppercase tracking-[0.2em] text-white/40 underline underline-offset-4 transition hover:text-white"
                  >
                    Refazer perguntas
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Pergunta {recStep} de 3
                </p>
                <p className="mt-3 text-lg font-medium leading-snug text-white">
                  {recStep === 1 &&
                    "Você quer fazer as reservas da viagem por conta própria?"}
                  {recStep === 2 && "Prefere viajar em grupo com outras pessoas?"}
                  {recStep === 3 &&
                    "Quer escolher um pacote já estruturado ou criar a viagem do zero?"}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  {recStep < 3 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => responderRecomendador(recStep, "sim")}
                        className="rounded-full border border-white/20 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50 hover:text-white"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => responderRecomendador(recStep, "nao")}
                        className="rounded-full border border-white/20 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50 hover:text-white"
                      >
                        Não
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => responderRecomendador(3, "estruturado")}
                        className="rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50 hover:text-white"
                      >
                        Pacote estruturado
                      </button>
                      <button
                        type="button"
                        onClick={() => responderRecomendador(3, "zero")}
                        className="rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50 hover:text-white"
                      >
                        Criar do zero
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── QUALIFICAÇÃO + WHATSAPP ── */}
      <section id="qualificacao" className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-xl">
          {enviado ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">WhatsApp aberto</p>
              <h2 className={`${display.className} text-2xl font-medium text-white`}>Quase lá.</h2>
              <p className="max-w-xs text-sm leading-6 text-white/55">
                Finalize o envio da mensagem na aba do WhatsApp que abrimos
                para você. A equipe Ajisai responde em breve.
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-2 rounded-full border border-white/20 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/50 hover:text-white"
              >
                Fazer outra solicitação
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
                Fale com a Ajisai
              </p>
              <h2
                className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white`}
              >
                Vamos qualificar sua viagem antes do WhatsApp
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Três perguntas rápidas — assim nossa equipe já entra na
                conversa sabendo exatamente o que você precisa.
              </p>

              <div className="mt-8">
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Produto de interesse
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(Object.keys(PRODUTOS) as ProdutoKey[]).map((key) => {
                    const ativo = qualProduto === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setQualProduto(key)}
                        className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                          ativo
                            ? "border-transparent text-white"
                            : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                        }`}
                        style={ativo ? { backgroundColor: "#2f80c9" } : undefined}
                      >
                        {PRODUTOS[key].nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40 sm:col-span-2"
                />
                <input
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Quando pretende viajar?"
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                />
                <input
                  value={viajantes}
                  onChange={(e) => setViajantes(e.target.value)}
                  placeholder="Quantas pessoas viajarão?"
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                />
              </div>

              <div className="mt-5">
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Já possui passagens aéreas?
                </p>
                <div className="flex gap-2.5">
                  {(["sim", "nao"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setPassagens(valor)}
                      className={`rounded-full border px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                        passagens === valor
                          ? "border-transparent text-white"
                          : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                      }`}
                      style={passagens === valor ? { backgroundColor: "#2f80c9" } : undefined}
                    >
                      {valor === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Primeira viagem ao Japão?
                </p>
                <div className="flex gap-2.5">
                  {(["sim", "nao"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setPrimeiraViagem(valor)}
                      className={`rounded-full border px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                        primeiraViagem === valor
                          ? "border-transparent text-white"
                          : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                      }`}
                      style={primeiraViagem === valor ? { backgroundColor: "#2f80c9" } : undefined}
                    >
                      {valor === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleQualificar}
                disabled={!qualProduto || !nome}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Falar no WhatsApp →
              </button>
              {(!qualProduto || !nome) && (
                <p className="mt-2 text-center text-[11px] text-white/35">
                  Escolha um produto e informe seu nome para continuar.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="bg-black px-8 pb-20 pt-16 text-white md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-11 w-auto object-contain md:h-12"
          />
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Pacotes de viagem e roteiros personalizados para o Japão.
          </p>
          <p className="text-[11px] leading-relaxed text-white/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos
            Reservados — CNPJ: 43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}
