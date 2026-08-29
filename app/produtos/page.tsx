"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { PriceCalculator } from "../components/PriceCalculator";
import { useCambioUSD, brlParaUSDLabel, formatBRL, formatUSD } from "../hooks/useCambioUSD";
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

// Usado na tela de qualificação e para montar a mensagem
// final do WhatsApp — uma única fonte de verdade para nome/preço.
const PRODUTOS: Record<
  ProdutoKey,
  { nome: string; precoBRL: number | null; precoUSD?: number; href: string }
> = {
  roteiro: {
    nome: "Roteiro Personalizado",
    precoBRL: 1500,
    href: "/ajisairoteiros",
  },
  caravana: {
    nome: "Caravana",
    // Preço "a partir de" — menor valor entre os pacotes Sakura de 7 dias
    // (Sakura 2 - Maio 2027), já em dólar fixo (ver /pacotes).
    precoBRL: null,
    precoUSD: 4280,
    href: "/pacotes#pacotes",
  },
  individual: {
    nome: "Individual ou Pequenos Grupos",
    // Preço "a partir de" — menor valor entre os pacotes Sakura de 7 dias
    // (Sakura 2 - Maio 2027), já em dólar fixo (ver /pacotes).
    precoBRL: null,
    precoUSD: 2490,
    href: "/pacotes#individuais",
  },
  personalizado: {
    nome: "Viagem Personalizada",
    precoBRL: null,
    href: "/viagem-personalizada",
  },
  guia: {
    nome: "Guia Turístico Avulso",
    // Diária cotada nativamente em dólar (não é conversão de um valor em
    // reais) — precoUSD tem prioridade sobre precoBRL no cálculo do preço.
    // US$ 350/dia, cobre até 4 pessoas (mesmo valor usado no calculador do
    // Pacote Personalizado — ver DIARIA_GUIA_USD em CustomPackageCard.tsx).
    precoBRL: null,
    precoUSD: 350,
    href: "#guia",
  },
};

// Mesmas fotos já usadas em /pacotes para cada divisão — reaproveitadas
// aqui no resultado do recomendador para tornar a recomendação concreta.
const IMAGENS_PRODUTO: Record<ProdutoKey, { src: string; alt: string }> = {
  roteiro: {
    src: "/images/dashmobile-ajisai.jpg",
    alt: "Painel do Roteiro Personalizado Ajisai",
  },
  caravana: { src: "/images/caravana-hero.jpg", alt: "Pacotes de Caravana" },
  individual: {
    src: "/images/privado-hero-v2.jpg",
    alt: "Individual ou Pequenos Grupos",
  },
  personalizado: {
    src: "/images/personalizado-hero.png",
    alt: "Viagem Personalizada",
  },
  guia: {
    src: "/images/guia-ajisai-campo.png",
    alt: "Guia Ajisai em campo, com bandeira e placa de identificação",
  },
};

// Mesmos itens e preços de referência do calculador do Pacote
// Personalizado (OPCOES, em CustomPackageCard.tsx) — mostrados aqui como
// cards avulsos pra quem só quer adicionar um serviço pontual ao roteiro
// já organizado por conta própria. porDia indica se o valor é por dia de
// viagem ou fixo por viagem.
const SERVICOS_AVULSOS: {
  nome: string;
  icone: string;
  descricao: string;
  precoBRL: number;
  /** Valor nativo em dólar — quando presente, tem prioridade sobre
   * precoBRL no cálculo (mesmo padrão de PRODUTOS acima). */
  precoUSD?: number;
  porDia?: boolean;
}[] = [
  {
    nome: "JR Pass",
    icone: "🚄",
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala.",
    precoBRL: 180,
    porDia: true,
  },
  {
    nome: "Seguro Viagem",
    icone: "🛡️",
    descricao: "Cobertura médica e assistência durante toda a viagem.",
    precoBRL: 35,
    porDia: true,
  },
  {
    nome: "Câmbio no Brasil",
    icone: "💴",
    descricao: "Retirada de ienes com câmbio comercial antes do embarque.",
    precoBRL: 150,
  },
  {
    nome: "Motorista Privado",
    icone: "🚗",
    descricao: "Traslados exclusivos com motorista particular, sem compartilhar veículo com outros grupos. Para até 4 pessoas.",
    precoBRL: 0,
    precoUSD: 700,
    porDia: true,
  },
  {
    nome: "Transporte",
    icone: "🚐",
    descricao: "Transfers e deslocamentos do roteiro dia a dia.",
    precoBRL: 150,
    porDia: true,
  },
  {
    nome: "Serviços Adicionais",
    icone: "✨",
    descricao: "Reservas, concierge e experiências sob medida.",
    precoBRL: 2500,
  },
];

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
    titulo: "Viagem Personalizada",
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
  { key: "personalizado", titulo: "Viagem Personalizada" },
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
      caravana: "US$ 4.280",
      individual: "US$ 2.490",
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

// Diferenciais Ajisai específicos pra quem compra a passagem aérea com a
// gente — mesmo conteúdo usado no popup "Passagem Aérea" de cada pacote e
// na opção "Aéreo" do Pacote Personalizado.
const DIFERENCIAIS_AEREO = [
  {
    titulo: "Concierge no Aeroporto de Guarulhos",
    texto:
      "Equipe especializada apoia todos os passageiros no balcão de check-in — resolve reserva de assento, remarcação em cancelamento involuntário e direitos em atrasos, com acesso direto à gerência das companhias aéreas.",
    imagem: "/images/icone-diferencial-1.png",
  },
  {
    titulo: "Protocolo pré-embarque (Visit Japan Web)",
    texto:
      "Nossa equipe preenche e cadastra o Visit Japan Web (VJW) com os dados do passageiro e envia pronto pra você — sem papelada na chegada ao Japão — além de uma sessão dedicada pra explicar o itinerário antes do embarque.",
    imagem: "/images/icone-diferencial-2.png",
  },
  {
    titulo: "Monitoramento de viagem",
    texto:
      "Central de WhatsApp com equipe emergencial Ajisai, funcionando quase 24 horas por dia — conexões, imprevistos e gestão de reserva, com atendimento humano e apoio de tradutor quando necessário.",
    imagem: "/images/icone-diferencial-3.png",
  },
  {
    titulo: "Responsabilidade da Agência",
    texto:
      "Passagem emitida pela Ajisai tem responsabilidade solidária da agência e negociação direta com as companhias aéreas — mais proteção e prioridade do que comprar uma passagem avulsa, mesmo pelo mesmo preço.",
    imagem: "/images/icone-diferencial-4.png",
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
    if (produto.precoUSD != null) {
      const valor = formatUSD(produto.precoUSD);
      return comPrefixo ? `A partir de ${valor}` : valor;
    }
    if (produto.precoBRL == null) return "Sob consulta";
    const valor = brlParaUSDLabel(produto.precoBRL, cambio);
    return comPrefixo ? `A partir de ${valor}` : valor;
  }

  // Linha "ou R$ X" mostrada junto do preço em dólar — null quando o
  // produto não tem preço fixo (ex: Pacote Personalizado, "Sob consulta").
  function precoBRLProdutoLabel(produto: (typeof PRODUTOS)[ProdutoKey]) {
    if (produto.precoUSD != null) {
      if (!cambio) return null;
      return `ou ${formatBRL(produto.precoUSD * cambio.cotacao)}`;
    }
    if (produto.precoBRL == null) return null;
    return `ou ${formatBRL(produto.precoBRL)}`;
  }

  const [qualProduto, setQualProduto] = useState<ProdutoKey | null>(null);
  const [nome, setNome] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [viajantes, setViajantes] = useState("");
  const [passagens, setPassagens] = useState<"sim" | "nao" | "">("");
  const [primeiraViagem, setPrimeiraViagem] = useState<"sim" | "nao" | "">("");
  const [enviado, setEnviado] = useState(false);
  const [roteiroModalOpen, setRoteiroModalOpen] = useState(false);
  const [pacotesModalOpen, setPacotesModalOpen] = useState(false);
  const [viagemModalOpen, setViagemModalOpen] = useState(false);

  useEffect(() => {
    if (!roteiroModalOpen && !pacotesModalOpen && !viagemModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRoteiroModalOpen(false);
        setPacotesModalOpen(false);
        setViagemModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [roteiroModalOpen, pacotesModalOpen, viagemModalOpen]);

  // Entrada direta (CTA de cada produto) — vai direto para a qualificação,
  // já com o produto marcado.
  function escolherProduto(produto: ProdutoKey) {
    const produtoSelecionado = PRODUTOS[produto];
    const text = encodeURIComponent(
      `Olá! Tenho interesse em ${produtoSelecionado.nome} e gostaria de receber mais informações.`,
    );

    window.gtag?.("event", "whatsapp_click", {
      form_name: "produtos_interesse_direto",
      produto: produtoSelecionado.nome,
    });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  function trocarProduto() {
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
        </div>
      </header>

      {/* ── HERO — PRODUTOS ── */}
      <section className="relative border-b border-white/10 bg-black">
        {/*
          HERO RESPONSIVO SEM DEFORMAÇÃO
          - Usa a imagem original /images/produtos-hero.png
          - Mantém a proporção nativa 1402 x 1122
          - Nunca amplia além de 1402px
          - Em widescreen, sobra área preta nas laterais
          - Em telas menores, reduz proporcionalmente
          - Sem object-cover, sem vh, sem crop
        */}
        <div className="relative mx-auto w-full max-w-[1402px] overflow-hidden">
          <Image
            src="/images/produtos-hero.png"
            alt="Estrada coberta de neve diante do Monte Fuji no Japão"
            width={1402}
            height={1122}
            priority
            sizes="(min-width: 1402px) 1402px, 100vw"
            className="block h-auto w-full"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black via-black/45 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-5 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-10">
            <h1
              className={`${display.className} max-w-5xl text-center text-[clamp(1.8rem,5vw,3.6rem)] font-normal leading-[1.08] tracking-[-0.015em] text-white`}
              style={{ textShadow: "0 3px 18px rgba(0,0,0,0.72)" }}
            >
              Como você quer viajar pelo Japão?
            </h1>
          </div>
        </div>

        {/* ── SELETOR DE PRODUTOS ── */}
        <div className="bg-black px-5 py-10 sm:px-6 sm:py-12 md:px-10 md:py-14 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <h2 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
              Como você quer organizar sua viagem?
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProductSelectorCard
                href="#roteiro-personalizado"
                onClick={() => setRoteiroModalOpen(true)}
                icon="/images/produtos/roteiro-personalizado.png"
                iconWidth={439}
                iconHeight={504}
                title="Roteiro Personalizado"
                description="Receba um planejamento completo, criado para sua viagem, e faça suas próprias reservas."
                cta="Conhecer o roteiro"
              />
              <ProductSelectorCard
                href="/pacotes"
                onClick={() => setPacotesModalOpen(true)}
                icon="/images/produtos/pacote-de-viagem.png"
                iconWidth={350}
                iconHeight={532}
                title="Pacote de Viagem"
                description="Escolha uma viagem já estruturada e deixe reservas e organização por nossa conta."
                cta="Ver pacotes"
              />
              <ProductSelectorCard
                href="/viagem-personalizada"
                onClick={() => setViagemModalOpen(true)}
                icon="/images/produtos/viagem-personalizada-icone-v2.png"
                iconWidth={1254}
                iconHeight={1254}
                title="Viagem Personalizada"
                description="Criamos e organizamos sua viagem do zero, inteiramente de acordo com você."
                cta="Criar minha viagem"
                featured
              />
            </div>

            <h2 className={`${display.className} mb-6 mt-12 text-2xl font-medium text-white md:mt-16 md:text-3xl`}>
              Complete sua viagem
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <ProductSelectorCard
                href="#passagens-aereas"
                icon="/images/produtos/passagem-aerea.png"
                iconWidth={449}
                iconHeight={284}
                title="Passagem Aérea"
                description="Emissão de passagens com suporte antes, durante e depois da sua viagem."
                cta="Ver passagens"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/viagem-personalizada"
                icon="/images/produtos/hoteis.png"
                iconWidth={435}
                iconHeight={366}
                title="Hotéis"
                description="Curadoria e reserva de hotéis escolhidos pelo perfil e pela logística da sua viagem."
                cta="Ver hotéis"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="#guia"
                icon="/images/produtos/guia-turistico.png"
                iconWidth={359}
                iconHeight={444}
                title="Guia Turístico"
                description="Acompanhamento particular no Japão para os dias e experiências que você escolher."
                requirement="Requer Roteiro Personalizado"
                cta="Conhecer o serviço"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/viagem-personalizada"
                icon="/images/produtos/transporte-privado.png"
                iconWidth={1536}
                iconHeight={1024}
                title="Transporte Privado"
                description="Transfers e deslocamentos privativos com conforto e motorista particular."
                requirement="Requer Roteiro Personalizado"
                cta="Ver transporte"
                className="lg:col-span-2 lg:col-start-2"
              />
              <ProductSelectorCard
                href="#servicos-avulsos"
                icon="/images/produtos/servicos-adicionais.png"
                iconWidth={1254}
                iconHeight={1254}
                title="Serviços adicionais"
                description="Seguro viagem, conectividade, ingressos e outros serviços para completar sua viagem."
                cta="Ver serviços"
                className="lg:col-span-2"
              />
            </div>
          </div>
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

      {/* ── DIFERENCIAIS AJISAI · PASSAGENS AÉREAS ── */}
      <div id="passagens-aereas" className="scroll-mt-24 border-b border-white/10 bg-black">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[500px] md:h-[600px]">
          <Image
            src="/images/hero-passagens-aereas.jpg"
            alt="Cabine de primeira classe — viagem aérea Ajisai"
            fill
            sizes="100vw"
            className="object-cover object-[68%_18%]"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-28 text-center sm:pb-32 md:pb-36">
            <p
              className="text-[10px] uppercase tracking-[0.2em] text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
            >
              Passagem comprada com a Ajisai
            </p>
            <h2
              className={`${display.className} mt-2 max-w-3xl text-2xl font-medium leading-tight text-white md:text-4xl`}
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              Diferenciais Ajisai para Passagens Aéreas
            </h2>
            <p
              className="mx-auto mt-3 max-w-2xl text-sm font-light leading-6 text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
            >
              O mesmo suporte que você encontra dentro de cada produto, na
              seção Aéreo/Passagem Aérea — aqui resumido em um único lugar.
            </p>
          </div>
        </div>

        <div className="relative -mt-20 px-6 pb-14 sm:-mt-24 md:-mt-28 md:px-10 md:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DIFERENCIAIS_AEREO.map((item) => (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-black/5 bg-[#FAF7F2] p-6 text-center shadow-sm md:p-8"
                >
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#6ec3d9]/20 text-[#2f80c9]">
                    <Image src={item.imagem} alt="" width={96} height={96} className="h-20 w-20 object-contain" />
                  </span>
                  <h3 className={`${display.className} mt-5 text-lg font-semibold text-[#2f80c9]`}>
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-[15px] font-normal leading-6 text-[#0A2540]/80">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROTEIRO PERSONALIZADO — DEMONSTRAÇÃO ── */}
      {roteiroModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="roteiro-modal-title"
          onClick={() => setRoteiroModalOpen(false)}
        >
          <section
            id="roteiro-personalizado"
            className="relative max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#050505] px-6 py-16 shadow-2xl md:rounded-3xl md:px-16 md:py-20"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setRoteiroModalOpen(false)}
              aria-label="Fechar informações do Roteiro Personalizado"
              className="sticky right-0 top-0 z-20 ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-2xl leading-none text-white/65 backdrop-blur transition hover:border-white/40 hover:text-white"
            >
              ×
            </button>
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Roteiro Personalizado
            </p>
            <h2
              id="roteiro-modal-title"
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
                <li
                  key={item}
                  className={`flex items-start gap-2.5 text-sm leading-6 ${
                    item.startsWith("Nós planejamos") ? "font-medium text-[#6ec3d9]" : "text-white/65"
                  }`}
                >
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
                {precoBRLProdutoLabel(PRODUTOS.roteiro) && (
                  <p className="mt-1 text-lg font-semibold leading-none text-[#9fd4ee]">
                    {precoBRLProdutoLabel(PRODUTOS.roteiro)}
                  </p>
                )}
                <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setRoteiroModalOpen(false);
                  escolherProduto("roteiro");
                }}
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
              href="/images/mock-roteiro-iphone.png"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver painel do roteiro em tamanho maior"
              className="group relative w-[320px] overflow-visible rounded-[36px] shadow-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(110,195,217,0.25)] md:w-[400px]"
            >
              <div className="relative aspect-[1024/1536] w-full">
                <Image
                  src="/images/mock-roteiro-iphone.png"
                  alt="Painel Ajisai — roteiro diário, atrações e logística organizados"
                  fill
                  sizes="400px"
                  className="object-contain transition duration-700 group-hover:scale-[1.015]"
                />
              </div>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
            Veja funcionando
          </p>
          <h3
            className={`${display.className} mt-2 text-center text-xl font-medium text-white md:text-2xl`}
          >
            Demonstração do Roteiro Personalizado
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm font-light leading-6 text-white/55">
            Duas versões — escolha a que preferir: a rápida dura só 1:46, a
            completa mostra o painel com todos os detalhes.
          </p>
          <div className="mx-auto mt-8 w-full">
            <DemoVideo
              src="/videos/roteiro-personalizado-short.mp4"
              poster="/videos/roteiro-personalizado-short-poster.jpg"
              label="Versão Rápida · 1:46"
              descricao="Visão geral direto ao ponto, em menos de 2 minutos."
            />
          </div>

          <div className="mx-auto mt-10 max-w-sm">
            <p className="text-center text-sm uppercase tracking-[0.2em] text-white/50">
              Quer ver mais?
            </p>
            <div className="mt-3">
              <DemoVideo
                src="/videos/roteiro-personalizado-detalhado.mp4"
                poster="/videos/roteiro-personalizado-detalhado-poster.jpg"
                label="Versão Completa · 8:08"
                descricao="Navegação real pelo painel — dia a dia, atrações, deslocamento e logística."
              />
            </div>
          </div>
        </div>
          </section>
        </div>
      )}

      {pacotesModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pacotes-modal-title"
          onClick={() => setPacotesModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-white/10 bg-black shadow-2xl md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-black/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="pacotes-modal-title"
                className={`${display.className} text-lg font-medium text-white md:text-xl`}
              >
                Pacotes de Viagem
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/pacotes"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6ec3d9] transition hover:text-white sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setPacotesModalOpen(false)}
                  aria-label="Fechar Pacotes de Viagem"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-2xl leading-none text-white/65 transition hover:border-white/40 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/pacotes"
              title="Conteúdo completo de Pacotes de Viagem"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {viagemModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="viagem-modal-title"
          onClick={() => setViagemModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-[#6ec3d9]/30 bg-black shadow-[0_0_60px_-20px_rgba(110,195,217,0.45)] md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-black/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="viagem-modal-title"
                className={`${display.className} text-lg font-medium text-white md:text-xl`}
              >
                Viagem Personalizada
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/viagem-personalizada"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6ec3d9] transition hover:text-white sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setViagemModalOpen(false)}
                  aria-label="Fechar Viagem Personalizada"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-2xl leading-none text-white/65 transition hover:border-white/40 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/viagem-personalizada"
              title="Configurador completo de Viagem Personalizada"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

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
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] md:p-8"
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
                {precoBRLProdutoLabel(PRODUTOS[p.key]) && (
                  <p className="mt-0.5 text-xs font-medium text-white/50">
                    {precoBRLProdutoLabel(PRODUTOS[p.key])}
                  </p>
                )}

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
        <div className="mx-auto grid max-w-6xl items-stretch gap-12 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <div className="relative aspect-[3/4] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 md:aspect-auto md:h-full md:min-h-[560px]">
              <Image
                src={IMAGENS_PRODUTO.guia.src}
                alt={IMAGENS_PRODUTO.guia.alt}
                fill
                sizes="(min-width: 768px) 32rem, 100vw"
                className="object-cover object-top"
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
                {precoBRLProdutoLabel(PRODUTOS.guia) && (
                  <p className="mt-0.5 text-sm font-medium text-white/60">
                    {precoBRLProdutoLabel(PRODUTOS.guia)}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-white/40">
                  por dia de acompanhamento, para até 4 pessoas
                </p>
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
                              {precoBRLProdutoLabel(PRODUTOS[c.key]) && (
                                <span className="mt-0.5 block text-[10px] text-white/45">
                                  {precoBRLProdutoLabel(PRODUTOS[c.key])}
                                </span>
                              )}
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

      {/* ── QUALIFICAÇÃO → WHATSAPP ── */}
      <section id="recomendador" className="hidden">
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
                  {precoBRLProdutoLabel(PRODUTOS[qualProduto]) && (
                    <p className="mt-0.5 text-[11px] text-white/40">
                      {precoBRLProdutoLabel(PRODUTOS[qualProduto])}
                    </p>
                  )}
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

      {/* ── SERVIÇOS AVULSOS ── */}
      <section id="servicos-avulsos" className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Complementos
            </p>
            <h2
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Serviços avulsos
            </h2>
            <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base">
              Já tem passagem e hospedagem resolvidas? Adicione só o que
              falta ao seu roteiro — mesmos itens disponíveis no Pacote
              Viagem Personalizada.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS_AVULSOS.map((servico) => (
              <div
                key={servico.nome}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04]"
              >
                <p className="text-2xl">{servico.icone}</p>
                <h3 className={`${display.className} mt-3 text-lg font-medium text-white`}>
                  {servico.nome}
                </h3>
                <p className="mt-2 flex-1 text-sm font-light leading-6 text-white/55">
                  {servico.descricao}
                </p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    A partir de
                  </p>
                  <p className={`${display.className} mt-1 text-xl font-medium text-white`}>
                    {servico.precoUSD != null
                      ? formatUSD(servico.precoUSD)
                      : brlParaUSDLabel(servico.precoBRL, cambio)}
                    {servico.porDia ? "/dia" : ""}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white/50">
                    ou{" "}
                    {servico.precoUSD != null
                      ? cambio
                        ? formatBRL(servico.precoUSD * cambio.cotacao)
                        : "…"
                      : formatBRL(servico.precoBRL)}
                    {servico.porDia ? "/dia" : ""}
                  </p>
                </div>
                <Link
                  href="/viagem-personalizada"
                  className="mt-5 block rounded-full px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0A2540] transition hover:brightness-95"
                  style={{ backgroundColor: "#9FD4EE" }}
                >
                  Adicionar ao meu pacote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Por que escolher a Ajisai" className="border-t border-white/10 bg-black">
        <InstitutionalContent />
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

function InstitutionalContent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(1800);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  function syncHeight() {
    const documentElement = iframeRef.current?.contentDocument?.documentElement;
    if (!documentElement) return;

    const updateHeight = () => {
      const iframeDocument = iframeRef.current?.contentDocument;
      if (!iframeDocument) return;
      setHeight(
        Math.max(
          iframeDocument.documentElement.scrollHeight,
          iframeDocument.body.scrollHeight,
        ),
      );
    };

    updateHeight();
    observerRef.current?.disconnect();
    observerRef.current = new ResizeObserver(updateHeight);
    observerRef.current.observe(documentElement);
  }

  return (
    <iframe
      ref={iframeRef}
      src="/pacotes?view=institutional"
      title="Por que escolher a Ajisai e avaliações de clientes"
      onLoad={syncHeight}
      scrolling="no"
      className="block w-full overflow-hidden border-0 bg-black"
      style={{ height }}
    />
  );
}

function ProductSelectorCard({
  href,
  onClick,
  icon,
  iconWidth,
  iconHeight,
  title,
  description,
  requirement,
  cta,
  featured = false,
  className = "",
}: {
  href: string;
  onClick?: () => void;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  title: string;
  description: string;
  requirement?: string;
  cta: string;
  featured?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!onClick) return;
        event.preventDefault();
        onClick();
      }}
      className={`group relative flex h-[350px] flex-col overflow-hidden rounded-2xl border p-6 text-left transition md:p-8 ${
        featured
          ? "border-[#6ec3d9]/45 bg-[#6ec3d9]/[0.055] shadow-[0_0_34px_-12px_rgba(110,195,217,0.42)] hover:border-[#6ec3d9]/70 hover:bg-[#6ec3d9]/[0.075]"
          : "border-white/10 bg-white/[0.02] shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] hover:border-white/25 hover:bg-white/[0.04]"
      } ${className}`}
    >
      <Image
        src={icon}
        alt=""
        width={iconWidth}
        height={iconHeight}
        className={`absolute object-contain ${
          title === "Transporte Privado"
            ? "right-4 top-3 h-20 w-20 opacity-90 md:right-6 md:top-5"
            : `right-6 top-5 h-14 w-14 md:right-8 md:top-7 ${
                title === "Serviços adicionais" ? "brightness-0 invert" : "opacity-90"
              }`
        }`}
      />
      <div className="h-4" aria-hidden="true" />
      <h3 className={`${display.className} mt-3 pr-16 text-2xl font-medium text-white md:text-3xl`}>
        {title}
      </h3>
      <p className="mt-3 max-w-[34ch] flex-1 text-sm font-light leading-6 text-white/55">
        {description}
      </p>
      {requirement && (
        <span className="mt-4 w-fit rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-red-300">
          {requirement}
        </span>
      )}
      <span className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-[#2f80c9] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(47,128,201,0.22)] transition group-hover:bg-[#3b91dc] group-hover:shadow-[0_10px_28px_rgba(47,128,201,0.35)]">
        {cta}
      </span>
    </a>
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

// Vídeo real de demonstração — player nativo com poster, sem autoplay
// (carrega só metadata até o clique, pra não pesar a página).
function DemoVideo({
  src,
  poster,
  label,
  descricao,
}: {
  src: string;
  poster: string;
  label: string;
  descricao?: string;
}) {
  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          controls
          preload="metadata"
          poster={poster}
          playsInline
          className="h-full w-full bg-black object-contain fullscreen:h-screen fullscreen:w-screen fullscreen:object-contain"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
        {label}
      </p>
      {descricao && (
        <p className="mx-auto mt-1 max-w-xs text-center text-xs leading-5 text-white/50">
          {descricao}
        </p>
      )}
    </div>
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
