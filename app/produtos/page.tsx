"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { PriceCalculator } from "../components/PriceCalculator";
import { useCambioUSD, brlParaUSDLabel } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

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

type ProdutoKey = "roteiro" | "caravana" | "individual" | "personalizado" | "guia";

// Usado no recomendador, na tela de qualificação e para montar a mensagem
// final do WhatsApp — uma única fonte de verdade para nome/preço.
const PRODUTOS: Record<ProdutoKey, { nome: string; precoBRL: number | null; href: string }> = {
  roteiro: {
    nome: "Roteiro Personalizado",
    precoBRL: 1500,
    href: "/ajisairoteiros",
  },
  caravana: {
    nome: "Caravana",
    precoBRL: 38000,
    href: "/pacotes#pacotes",
  },
  individual: {
    nome: "Individual ou Pequenos Grupos",
    precoBRL: 38000,
    href: "/pacotes#individuais",
  },
  personalizado: {
    nome: "Pacote Personalizado",
    precoBRL: null,
    href: "/pacotes#personalizado",
  },
  guia: {
    nome: "Guia Turístico Avulso",
    // Mesma diária de guia já usada como referência interna no calculador
    // do Pacote Personalizado (DIARIA_GUIA, em CustomPackageCard.tsx) —
    // valor de partida, ajustável por você antes de publicar.
    precoBRL: 300,
    href: "#guia",
  },
};

// Descrição de uma linha mostrada no resultado do recomendador — resume o
// que o produto entrega, sem repetir os bullets já usados nos cards.
const DESCRICOES_CURTAS: Record<ProdutoKey, string> = {
  roteiro:
    "Planejamos sua viagem em detalhes. Você faz as reservas e viaja por conta própria.",
  caravana: "Viaje em grupo, com data e roteiro já definidos pela Ajisai.",
  individual:
    "Viagem pronta, nas suas datas, com guia particular dedicado ao seu grupo.",
  personalizado: "Roteiro, hotéis e logística inteiramente criados para você.",
  guia: "Você já tem o roteiro — a Ajisai fornece um guia particular para o(s) dia(s) que escolher.",
};

// Mesmas fotos já usadas em /pacotes para cada divisão — reaproveitadas
// aqui no resultado do recomendador para tornar a recomendação concreta.
const IMAGENS_PRODUTO: Record<ProdutoKey, { src: string; alt: string }> = {
  roteiro: {
    src: "/images/dashmobile-ajisai.jpg",
    alt: "Painel do Roteiro Personalizado Ajisai",
  },
  caravana: { src: "/images/caravana-2-hero.png", alt: "Pacotes de Caravana" },
  individual: {
    src: "/images/individual-2-hero.png",
    alt: "Individual ou Pequenos Grupos",
  },
  personalizado: {
    src: "/images/personalizado-hero.png",
    alt: "Pacotes Personalizados",
  },
  guia: {
    src: "/images/guia-ajisai-campo.png",
    alt: "Guia Ajisai em campo, com bandeira e placa de identificação",
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
}[] = [
  {
    key: "caravana",
    titulo: "Caravana",
    frase: "Quero viajar em grupo, com tudo organizado.",
    pontos: [
      "Datas e roteiro predefinidos",
      "Grupo maior",
      "Menor flexibilidade",
      "Melhor custo-benefício",
    ],
    ctaVer: "Conhecer as caravanas →",
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
    ctaVer: "Conhecer os pacotes →",
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
    ctaVer: "Conhecer o pacote personalizado →",
  },
];

const COLUNAS: { key: Exclude<ProdutoKey, "guia">; titulo: string }[] = [
  { key: "roteiro", titulo: "Roteiro Personalizado" },
  { key: "caravana", titulo: "Caravana" },
  { key: "individual", titulo: "Individual / Pequenos Grupos" },
  { key: "personalizado", titulo: "Pacote Personalizado" },
];

// Colunas da tabela "Qual opção combina com você" — comparam estilos de
// organização de viagem completa. O Guia Turístico Avulso é um serviço
// avulso/complementar (não uma forma de organizar a viagem inteira), por
// isso fica de fora dessa tabela e tem sua própria seção.
const LINHAS: {
  label: string;
  valores: Record<Exclude<ProdutoKey, "guia">, boolean | string>;
}[] = [
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
    // Valores aqui não são exibidos — a linha "A partir de" é renderizada
    // com preço ao vivo em dólar (ver precoProdutoLabel no render da
    // tabela), mantidos só como referência em reais pra leitura do código.
    label: "A partir de",
    valores: {
      roteiro: "R$ 1.500",
      caravana: "R$ 38.000",
      individual: "R$ 38.000",
      personalizado: "Sob consulta",
    },
  },
];

// Painel "Ajisai vs. o mercado" — comparativo de escopo levantado com base em
// pesquisa de concorrentes. Nomes reais omitidos de propósito (Concorrente A
// / Concorrente B) para não expor a fonte da pesquisa publicamente. Ajuste
// as células conforme sua pesquisa for atualizada.
type ConcorrenteKey = "ajisai" | "concorrenteA" | "concorrenteB";

const COLUNAS_CONCORRENCIA: { key: ConcorrenteKey; titulo: string }[] = [
  { key: "ajisai", titulo: "Ajisai" },
  { key: "concorrenteA", titulo: "Concorrente A" },
  { key: "concorrenteB", titulo: "Concorrente B" },
];

const LINHAS_CONCORRENCIA: { label: string; valores: Record<ConcorrenteKey, string> }[] = [
  {
    label: "Passagem aérea",
    valores: { ajisai: "Opcional", concorrenteA: "Opcional", concorrenteB: "Opcional" },
  },
  {
    label: "Hospedagem",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "X" },
  },
  {
    label: "JR Pass",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "X" },
  },
  {
    label: "Transporte privado",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "Parcial" },
  },
  {
    label: "Roteiro digital",
    valores: { ajisai: "X", concorrenteA: "—", concorrenteB: "—" },
  },
  {
    label: "Seguro viagem",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "—" },
  },
  {
    label: "Wi-Fi",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "—" },
  },
  {
    label: "Guia turístico em português",
    valores: { ajisai: "X", concorrenteA: "X", concorrenteB: "Somente ES" },
  },
];

function ValorConcorrencia({ valor }: { valor: string }) {
  if (valor === "X") {
    return <IconCheck className="mx-auto h-4 w-4 text-[#6ec3d9]" />;
  }
  if (valor === "—") {
    return <span className="text-white/20">—</span>;
  }
  if (valor === "Parcial" || valor.startsWith("Somente")) {
    return <span className="text-xs font-medium text-amber-400/90">{valor}</span>;
  }
  return <span className="text-xs text-white/70">{valor}</span>;
}

export default function ProdutosPage() {
  const cambio = useCambioUSD();

  function precoProdutoLabel(produto: (typeof PRODUTOS)[ProdutoKey], comPrefixo: boolean) {
    if (produto.precoBRL == null) return "Sob consulta";
    const valor = brlParaUSDLabel(produto.precoBRL, cambio);
    return comPrefixo ? `A partir de ${valor}` : valor;
  }

  const [estagio, setEstagio] = useState<"perguntas" | "resultado" | "qualificacao">(
    "perguntas",
  );
  const [qualProduto, setQualProduto] = useState<ProdutoKey | null>(null);
  const [nome, setNome] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [viajantes, setViajantes] = useState("");
  const [passagens, setPassagens] = useState<"sim" | "nao" | "">("");
  const [primeiraViagem, setPrimeiraViagem] = useState<"sim" | "nao" | "">("");
  const [enviado, setEnviado] = useState(false);

  const [recStep, setRecStep] = useState<1 | 2 | 3>(1);
  const [recResultado, setRecResultado] = useState<ProdutoKey | null>(null);

  // Entrada direta (ex: CTA do Roteiro Personalizado) — pula o recomendador
  // e vai direto para a qualificação, já com o produto marcado.
  function escolherProduto(produto: ProdutoKey) {
    setQualProduto(produto);
    setEstagio("qualificacao");
    setEnviado(false);
    requestAnimationFrame(() => {
      document.getElementById("recomendador")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function responderRecomendador(passo: 1 | 2 | 3, resposta: string) {
    if (passo === 1) {
      if (resposta === "sim") {
        setRecResultado("roteiro");
        setEstagio("resultado");
        return;
      }
      setRecStep(2);
      return;
    }
    if (passo === 2) {
      if (resposta === "sim") {
        setRecResultado("caravana");
        setEstagio("resultado");
        return;
      }
      setRecStep(3);
      return;
    }
    setRecResultado(resposta === "estruturado" ? "individual" : "personalizado");
    setEstagio("resultado");
  }

  // Do resultado do recomendador para a qualificação — o produto recomendado
  // já vem marcado, sem pedir de novo.
  function continuarParaQualificacao() {
    if (recResultado) setQualProduto(recResultado);
    setEstagio("qualificacao");
  }

  function trocarProduto() {
    setEstagio("perguntas");
    setRecStep(1);
    setRecResultado(null);
    setQualProduto(null);
    setEnviado(false);
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
          Escolha se prefere organizar sua viagem com nosso planejamento ou
          deixar a organização com a Ajisai.
        </p>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          <a
            href="#roteiro"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] md:p-10"
          >
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-[#6ec3d9] md:text-lg">
              Quero organizar minha viagem
            </p>
            <h2 className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}>
              Roteiro Personalizado
            </h2>
            <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
              Recebo o planejamento completo e faço minhas próprias reservas.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
              Conhecer o Roteiro →
            </span>
          </a>

          <a
            href="#pacotes-ajisai"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] md:p-10"
          >
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-[#6ec3d9] md:text-lg">
              Quero que a Ajisai organize
            </p>
            <h2 className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}>
              Pacotes de Viagem
            </h2>
            <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
              A Ajisai cuida da organização e eu recebo a viagem pronta.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
              Ver opções →
            </span>
          </a>

          <a
            href="#guia"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] sm:col-span-2 md:p-10 lg:col-span-1"
          >
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-[#6ec3d9] md:text-lg">
              Já tenho meu roteiro
            </p>
            <h2 className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}>
              Guia Turístico Avulso
            </h2>
            <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
              Só preciso de um guia particular para um ou mais dias específicos.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
              Conhecer o Guia Avulso →
            </span>
          </a>
        </div>
      </section>

      {/* ── VÍDEO — EXPLICAÇÃO DOS PRODUTOS ── */}
      <section className="border-b border-white/10 bg-black px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
            Assista antes de escolher
          </p>
          <h2
            className={`${display.className} mt-3 text-2xl font-medium text-white md:text-3xl`}
          >
            Como funcionam os produtos Ajisai
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-6 text-white/55">
            Em poucos minutos, entenda a diferença entre Roteiro Personalizado,
            Pacotes de Viagem e Guia Turístico Avulso — e qual encaixa melhor
            no seu jeito de viajar.
          </p>
          <VideoPlaceholder
            titulo="Explicação dos produtos Ajisai"
            descricao="Vídeo institucional, apresentando as 3 formas de viajar com a Ajisai."
            className="mx-auto mt-8 max-w-2xl"
          />
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
                <p className={`${display.className} text-4xl font-medium text-white`}>
                  {precoProdutoLabel(PRODUTOS.roteiro, false)}
                </p>
                <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />
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
            <div>
              <PriceCalculator />
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

        <div className="mx-auto mt-16 max-w-4xl">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
            Veja funcionando
          </p>
          <h3
            className={`${display.className} mt-2 text-center text-xl font-medium text-white md:text-2xl`}
          >
            Demonstração do Roteiro Personalizado
          </h3>
          <VideoPlaceholder
            titulo="Demonstração do Roteiro Personalizado"
            descricao="Navegação real pelo painel — dia a dia, atrações, deslocamento e logística."
            className="mx-auto mt-6"
          />
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
                  {precoProdutoLabel(PRODUTOS[p.key], false)}
                </p>

                <div className="mt-5">
                  <Link
                    href={PRODUTOS[p.key].href}
                    className="block rounded-full px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: "#2f80c9" }}
                  >
                    {p.ctaVer}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUIA TURÍSTICO AVULSO ── */}
      <section id="guia" className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1 flex justify-center">
            <div className="relative aspect-[16/10] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={IMAGENS_PRODUTO.guia.src}
                alt={IMAGENS_PRODUTO.guia.alt}
                fill
                sizes="(min-width: 768px) 32rem, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Guia Turístico Avulso
            </p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Já organizou a viagem — só falta quem conheça o caminho.
            </h2>
            <p className="mt-5 text-sm font-light leading-6 text-white/60 md:text-base md:leading-7">
              Ideal para quem já tem passagens, hospedagem e roteiro próprio,
              mas quer companhia local para um ou mais dias — sem contratar o
              pacote inteiro.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Guia particular fluente em português, dedicado só ao seu grupo",
                "Contrate por dia — encaixa em qualquer roteiro já pronto",
                "Conhece trajetos, horários e como evitar filas nos pontos que você já escolheu",
                "Sem pacote fechado: você decide quais dias precisa de guia",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/65">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6ec3d9]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">A partir de</p>
                <p className={`${display.className} text-4xl font-medium text-white`}>
                  {precoProdutoLabel(PRODUTOS.guia, false)}
                </p>
                <p className="mt-1 text-[11px] text-white/40">por dia de acompanhamento</p>
                <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />
              </div>
              <button
                type="button"
                onClick={() => escolherProduto("guia")}
                className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Quero contratar um guia avulso →
              </button>
            </div>
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
                          {linha.label === "A partir de" ? (
                            <span className="text-xs text-white/70">
                              {precoProdutoLabel(PRODUTOS[c.key], false)}
                            </span>
                          ) : typeof valor === "boolean" ? (
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
          <CambioLabel cambio={cambio} className="mt-3 text-center text-[11px] text-white/40" />
        </div>
      </section>

      {/* ── AJISAI VS. O MERCADO ── */}
      <section className="border-b border-white/10 bg-black px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Ajisai vs. o mercado
            </p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              O que realmente vem incluso
            </h2>
            <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base">
              Comparativo de escopo levantado com outras agências que também
              vendem viagens para o Japão. Nomes omitidos por discrição.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-white/10 px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-white/30" />
                  {COLUNAS_CONCORRENCIA.map((c) => (
                    <th
                      key={c.key}
                      className={`border-b px-3 py-3 text-center text-[10px] font-medium uppercase tracking-[0.1em] ${
                        c.key === "ajisai"
                          ? "border-[#6ec3d9]/40 text-[#6ec3d9]"
                          : "border-white/10 text-white/60"
                      }`}
                    >
                      {c.titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LINHAS_CONCORRENCIA.map((linha) => (
                  <tr key={linha.label} className="border-b border-white/5">
                    <td className="px-3 py-3.5 text-xs text-white/55">{linha.label}</td>
                    {COLUNAS_CONCORRENCIA.map((c) => (
                      <td
                        key={c.key}
                        className={`px-3 py-3.5 text-center ${
                          c.key === "ajisai" ? "bg-[#6ec3d9]/[0.04]" : ""
                        }`}
                      >
                        <ValorConcorrencia valor={linha.valores[c.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/30">
            Levantamento próprio, sujeito a atualização conforme os
            concorrentes mudam de escopo.
          </p>
        </div>
      </section>

      {/* ── RECOMENDADOR → RESULTADO → QUALIFICAÇÃO → WHATSAPP (fluxo único) ── */}
      <section id="recomendador" className="border-b border-white/10 bg-black px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-2xl">
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
                onClick={trocarProduto}
                className="mt-2 rounded-full border border-white/20 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/50 hover:text-white"
              >
                Fazer outra solicitação
              </button>
            </div>
          ) : estagio === "perguntas" ? (
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
                Ainda não sabe qual escolher?
              </p>
              <h2
                className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
              >
                Encontre sua opção em 30 segundos
              </h2>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-left md:p-10">
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
            </div>
          ) : estagio === "resultado" && recResultado ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center md:p-10">
              <div
                className={`relative mx-auto mb-6 overflow-hidden rounded-2xl ${
                  recResultado === "roteiro" ? "aspect-[16/10] max-w-[220px]" : "aspect-[16/10]"
                }`}
              >
                <Image
                  src={IMAGENS_PRODUTO[recResultado].src}
                  alt={IMAGENS_PRODUTO[recResultado].alt}
                  fill
                  sizes="(min-width: 640px) 42rem, 100vw"
                  className={`object-cover ${
                    recResultado === "roteiro" ? "object-center" : "object-top"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Sua melhor opção é
              </p>
              <p className={`${display.className} mt-2 text-3xl font-medium text-white`}>
                {PRODUTOS[recResultado].nome}
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/60">
                {DESCRICOES_CURTAS[recResultado]}
              </p>
              <p className="mt-3 text-sm font-medium text-white/70">
                {precoProdutoLabel(PRODUTOS[recResultado], true)}
              </p>
              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={continuarParaQualificacao}
                  className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#2f80c9" }}
                >
                  Continuar →
                </button>
                <button
                  type="button"
                  onClick={trocarProduto}
                  className="text-xs uppercase tracking-[0.2em] text-white/40 underline underline-offset-4 transition hover:text-white"
                >
                  Refazer perguntas
                </button>
              </div>
            </div>
          ) : (
            <>
              {qualProduto && (
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Produto selecionado
                  </p>
                  <p className={`${display.className} mt-1.5 text-xl font-medium text-white`}>
                    {PRODUTOS[qualProduto].nome}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {precoProdutoLabel(PRODUTOS[qualProduto], true)}
                  </p>
                  <button
                    type="button"
                    onClick={trocarProduto}
                    className="mt-3 text-[11px] uppercase tracking-[0.15em] text-white/40 underline underline-offset-4 transition hover:text-white"
                  >
                    Trocar produto
                  </button>
                </div>
              )}

              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
                Fale com a Ajisai
              </p>
              <h2
                className={`${display.className} mt-3 text-center text-3xl font-medium leading-tight text-white`}
              >
                Conte um pouco sobre sua viagem
              </h2>
              <p className="mt-3 text-center text-sm leading-6 text-white/55">
                Três perguntas rápidas — assim nossa equipe já entra na
                conversa sabendo exatamente o que você precisa.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
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

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.56.87l10.99-6.86a1 1 0 0 0 0-1.7L9.56 4.27A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

// Placeholder de vídeo — sem player/arquivo real ainda. Troque o miolo por
// um <video>/embed quando o material estiver pronto; mantém o mesmo espaço
// e legenda pra não quebrar o layout.
function VideoPlaceholder({
  titulo,
  descricao,
  className = "",
}: {
  titulo: string;
  descricao?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition group-hover:scale-105 group-hover:bg-white/20">
          <IconPlay className="h-5 w-5 translate-x-0.5 text-white" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Vídeo em breve
        </p>
        <p className={`${display.className} max-w-xs text-base font-medium text-white md:text-lg`}>
          {titulo}
        </p>
        {descricao && (
          <p className="max-w-sm text-xs leading-5 text-white/50">{descricao}</p>
        )}
      </div>
    </div>
  );
}
