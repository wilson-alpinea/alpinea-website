import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { CartProvider } from "../components/CartContext";
import { CartWidget } from "../components/CartWidget";
import { PackageCard, type PackageVariant } from "../components/PackageCard";
import { CarouselScroller } from "../components/CarouselScroller";
import { PackageSectionNote } from "../components/PackageSectionNote";
import { formatUSD } from "../lib/currency";

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Pacotes de Viagem para o Japão",
  description:
    "Pacotes de viagem para o Japão com a curadoria Ajisai: Caravana em grupo com datas fixas ou Privativo para seu grupo, com roteiro-base e datas flexíveis.",
  // Sobrescreve o openGraph/twitter padrão do layout raiz (marca Alpinea,
  // voltado à home) — o link desta página precisa de um preview específico
  // pra pacotes, não o card genérico do site inteiro.
  openGraph: {
    title: "Ajisai | Pacotes de Viagem para o Japão",
    description:
      "Caravana em grupo com datas fixas ou Privativo para seu grupo, com roteiro-base e datas flexíveis — conheça os pacotes Ajisai.",
    siteName: "Ajisai",
    images: [
      {
        url: "/images/caravana-2-hero.png",
        width: 1200,
        height: 630,
        alt: "Pacotes de Viagem Ajisai para o Japão",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Pacotes de Viagem para o Japão",
    description:
      "Pacotes de viagem para o Japão com a curadoria Ajisai — escolha entre Caravana e Privativo.",
    images: ["/images/caravana-2-hero.png"],
  },
};

// Preços fixos em dólar (valores definitivos passados pelo cliente) —
// id da variante de 14 dias continua "15d" internamente só porque o
// roteiro dia a dia (ITINERARIOS/ROTEIROS_DETALHADOS no
// PackageDetailModal) já usa essa chave; o rótulo exibido é "14 dias",
// que é a duração real vendida. Datas continuam provisórias/aproximadas
// — ver aviso na seção.
const variantesUSD = (
  preco7: number,
  datas7: string,
  preco14: number,
  datas14: string,
): PackageVariant[] => [
  {
    id: "7d",
    label: "7 dias",
    datas: datas7,
    precoLabel: formatUSD(preco7),
    precoUSD: preco7,
  },
  {
    id: "15d",
    label: "14 dias",
    datas: datas14,
    precoLabel: formatUSD(preco14),
    precoUSD: preco14,
  },
];

// Mesma coisa, mas para os pacotes Privativos.
const variantesIndividualUSD = (
  preco7: number,
  datas7: string,
  preco14: number,
  datas14: string,
): PackageVariant[] => [
  {
    id: "7d",
    label: "7 dias",
    datas: datas7,
    precoLabel: formatUSD(preco7),
    precoUSD: preco7,
  },
  {
    id: "15d",
    label: "14 dias",
    datas: datas14,
    precoLabel: formatUSD(preco14),
    precoUSD: preco14,
  },
];

// Uma única foto representa cada divisão (em vez de uma por pacote) — usada
// tanto no banner da seção quanto na miniatura do item no carrinho.
const BANNER_CARAVANA = {
  src: "/images/caravana-2-hero.png",
  alt: "Pacotes de Caravana",
};
const BANNER_INDIVIDUAL = {
  src: "/images/individual-2-hero.png",
  alt: "Pacotes Privativos",
};

// Fatos que valem para todos os pacotes da divisão (data fixa, guia
// compartilhado, vagas limitadas...) ficam num único bloco por seção, em vez
// de repetidos em cada card — só o que muda de pacote pra pacote (temporada,
// clima, datas, preço) aparece dentro do card.
const INCLUSO_CARAVANA = [
  "Hospedagem selecionada",
  "Guia bilíngue acompanhando o grupo",
  "Transportes previstos no roteiro",
  "Experiências e visitas programadas",
  "Suporte Ajisai durante a viagem",
];

const INCLUSO_PRIVATIVO = [
  "Hospedagem selecionada",
  "Roteiro-base da temporada",
  "Experiências e visitas programadas",
  "Suporte Ajisai durante a viagem",
];

const OPCIONAIS_PRIVATIVO = ["Guia particular", "Transporte privado"];

const pacotesCaravana = [
  {
    slug: "caravana-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Cerejeiras 2027",
    tagline: "Saída em grupo fechado",
    descricao:
      "Direto na temporada de floração das cerejeiras — parques, templos e avenidas históricas no auge do hanami.",
    destaques: [
      "Época da floração das sakuras",
      "Hospedagem e passeios posicionados para os melhores pontos de hanami",
    ],
    imagem: BANNER_CARAVANA.src,
    imagemAlt: BANNER_CARAVANA.alt,
    accent: "#e6a6c7",
    selo: "🌸 Alta procura",
    variantes: variantesUSD(
      4550,
      "28 mar — 03 abr 2027",
      8280,
      "24 mar — 07 abr 2027",
    ),
  },
  {
    slug: "caravana-maio",
    categoria: "Maio 2027",
    nome: "Primavera 2 — Maio 2027",
    tagline: "Saída em grupo fechado, fora do pico de alta temporada",
    descricao:
      "Fora do pico da alta temporada — clima ameno, menos turistas e mais disponibilidade de hospedagem.",
    destaques: [
      "Clima ameno, ótimo para caminhadas e passeios ao ar livre",
      "Menor fluxo turístico que a temporada de cerejeiras",
    ],
    imagem: BANNER_CARAVANA.src,
    imagemAlt: BANNER_CARAVANA.alt,
    accent: "#7fbf6e",
    variantes: variantesUSD(
      4280,
      "08 — 14 mai 2027",
      7980,
      "08 — 22 mai 2027",
    ),
  },
];

const pacotesIndividuais = [
  {
    slug: "individual-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Cerejeiras 2027",
    tagline: "Datas flexíveis, viagem exclusiva para o seu grupo",
    descricao:
      "Viaje na temporada de floração das cerejeiras — parques, templos e avenidas históricas no auge do hanami, com liberdade para escolher suas datas dentro da florada.",
    destaques: [
      "Datas flexíveis dentro da temporada de floração das cerejeiras",
    ],
    imagem: BANNER_INDIVIDUAL.src,
    imagemAlt: BANNER_INDIVIDUAL.alt,
    accent: "#e6a6c7",
    variantes: variantesIndividualUSD(
      2790,
      "Datas flexíveis · mar–abr 2027",
      4980,
      "Datas flexíveis · mar–abr 2027",
    ),
  },
  {
    slug: "individual-maio",
    categoria: "Maio 2027",
    nome: "Primavera 2 — Maio 2027",
    tagline: "Datas flexíveis, viagem exclusiva para o seu grupo",
    descricao:
      "Viaje em maio, fora do pico de alta temporada — clima ameno, menos turistas e liberdade para escolher suas datas dentro do mês.",
    destaques: [
      "Datas flexíveis dentro de maio, fora do pico de alta temporada",
    ],
    imagem: BANNER_INDIVIDUAL.src,
    imagemAlt: BANNER_INDIVIDUAL.alt,
    accent: "#7fbf6e",
    variantes: variantesIndividualUSD(
      2490,
      "Datas flexíveis · maio 2027",
      4480,
      "Datas flexíveis · maio 2027",
    ),
  },
];

const divisoes = [
  {
    letra: "A",
    titulo: "Caravana",
    frase: "Grupo acompanhado · datas fixas",
    texto:
      "Você viaja com outros passageiros em uma saída definida, com roteiro e guia compartilhados do início ao fim.",
    href: "#pacotes",
    imagem: BANNER_CARAVANA.src,
  },
  {
    letra: "B",
    titulo: "Privativo",
    frase: "Seu grupo · roteiro-base · datas flexíveis",
    texto:
      "Você viaja somente com seu grupo e escolhe as datas dentro da temporada. Guia e transporte privado são opcionais.",
    href: "#individuais",
    imagem: BANNER_INDIVIDUAL.src,
  },
];

// Seção "Viaje com a Ajisai" — mesmo conteúdo/design usado em
// /ajisairoteiros (carrossel "Por que a Ajisai" + prova social com
// avaliações reais do Google), só com os badges Cadastur/Reclame Aqui
// adicionados no final.
const avatarColors = [
  "#7c4fd1",
  "#6ec3d9",
  "#d9a66d",
  "#5b9bd5",
  "#e0916a",
  "#8fb7d9",
];

const googleReviews = [
  {
    name: "Caio Paiva de Lima",
    context: "Cancelamento de voo de última hora",
    text: "Excelente experiência com a AjisaiWork! Nos auxiliaram no retorno do Japão ao Brasil após um cancelamento de voo de última hora, com atendimento 24h, segurança e agilidade num momento de estresse. Empresa de confiança e extremamente recomendada!",
  },
  {
    name: "José Andrade",
    context: "Passagens, trens e hotéis",
    text: "Tivemos a feliz oportunidade de utilizar os serviços da AjisaiWork e a equipe me proporcionou uma viagem tranquila, segura e prazerosa. Ficamos satisfeitos com o auxílio na reserva de passagens de avião, trens e hotéis. Foi fantástico!",
  },
  {
    name: "Cristina Álvares",
    context: "Viagem em período de instabilidade aérea",
    text: "Fomos para o Japão com o apoio total da Ajisai. O período era complicado, pela Emirates via Dubai, em um momento incerto pela guerra. A Ajisai tinha opções com outras cias aéreas caso necessário. Atendimento 24hs todos os dias, durante todo o período da viagem. Excelente!",
  },
  {
    name: "SBC & International Friends",
    context: "Acompanhamento de uma senhora de 77 anos",
    text: "Nossa maior preocupação era um voo tranquilo desde o check-in em São Paulo até o destino final — minha mãe, uma senhora de 77 anos, viajava conosco. A experiência com a Ajisai foi melhor que esperávamos, com atenção especial do início ao fim da viagem.",
  },
  {
    name: "Conrado Areco Borelli",
    context: "Suporte completo, do primeiro contato ao embarque",
    text: "Contamos com o suporte da AjisaiWork na compra dos bilhetes de ida e volta ao Japão — atendimento solícito e eficiente. Do 1º contato via WhatsApp até o embarque, estiveram sempre disponíveis, independente do fuso horário. Recomendamos de coração.",
  },
  {
    name: "Katia Ito",
    context: "Passagens para um grupo grande",
    text: "Recomendo a AjisaiWork, que conheci pelo canal Tudo Sobre Japão Notícias. Atenderam com rapidez desde o início, buscando passagens para um grupo grande com ótimo custo-benefício, com equipe no aeroporto para ajudar com o despacho das bagagens.",
  },
  {
    name: "Henrique Kishida",
    context: "Suporte contínuo após a chegada ao Japão",
    text: "Desde o primeiro contato, tem sido uma ótima empresa. Todos muito simpáticos e atenciosos. Cheguei ao Japão e o suporte continua: mandam mensagens para checar como foi a viagem e como está a adaptação ao novo país. Até o momento fico muito feliz com minha escolha.",
  },
  {
    name: "Bruno Lima",
    context: "Do preenchimento online ao embarque",
    text: "Foram muito atenciosos, do início ao fim. Sempre que eu estava com dúvidas, eles me explicavam tudo com bastante clareza e atenção, quase no mesmo momento em que eu perguntava. Me auxiliaram desde o preenchimento online até o momento de embarque e desembarque.",
  },
  {
    name: "Lenox",
    context: "Viagem completa, ida e volta",
    text: "Adorei tudo. O pessoal da Ajisai é muito atencioso e prestativo. Minha viagem foi maravilhosa, correu tudo muito bem na ida, durante e na volta da viagem. Recomendo 100%.",
  },
  {
    name: "Marília Mesquita",
    context: "Acompanhamento durante toda a viagem",
    text: "Excelente atendimento e acompanhamento durante toda a viagem. Todos os profissionais são ótimos.",
  },
];

const whyAjisai = [
  {
    label: "Experiência",
    title: "+12 anos",
    text: "Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.",
    Icon: IconClock,
  },
  {
    label: "Curadoria",
    title: "Exclusividade de Serviços",
    text: "Curadoria de restaurantes, hotelaria e consumo desenvolvida a partir de experiência própria, fluência no idioma e uma rede construída ao longo de mais de uma década no Japão.",
    Icon: IconGem,
  },
  {
    label: "Conexão Brasil–Japão",
    title: "Referência na conexão",
    text: "Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.",
    Icon: IconExchange,
  },
  {
    label: "Presença real no Japão",
    title: "Operação própria",
    text: "Nossa operação própria no Japão permite atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.",
    Icon: IconPin,
  },
];

export default async function PacotesJapaoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const institutionalView = view === "institutional";
  const todosOsNomesDePacote = [
    "Primavera 1 — Temporada de Cerejeiras 2027 (Caravana)",
    "Primavera 2 — Maio 2027 (Caravana)",
    "Primavera 1 — Temporada de Cerejeiras 2027 (Privativo)",
    "Primavera 2 — Maio 2027 (Privativo)",
  ];

  return (
    <CartProvider>
      <main
        className={`min-h-screen overflow-x-hidden bg-black pb-16 text-white md:pb-0 ${
          institutionalView
            ? "[&_.package-content]:hidden"
            : "[&_.institutional-content]:hidden"
        }`}
      >
        {/* ── HEADER ── */}
        <header className="package-content fixed left-0 right-0 top-0 z-50 transform-gpu bg-black/10 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />

            <div className="flex items-center gap-3 md:gap-5">
              <CartWidget />
            </div>
          </div>
        </header>

        {/* ── CTA FIXO MOBILE ── */}
        <div
          className="package-content fixed inset-x-0 bottom-0 z-40 transform-gpu border-t border-white/10 bg-black/[0.92] px-4 pt-2.5 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
        >
          <ContactCTA
            mode="single"
            channel="whatsapp"
            whatsappNumber="5511930300101"
            brand="Ajisai"
            packageOptions={todosOsNomesDePacote}
            label={
              <span className="flex items-center justify-center gap-2">
                <IconWhatsApp className="h-4 w-4" />
                Falar com a Ajisai →
              </span>
            }
            buttonClassName="flex w-full items-center justify-center bg-[#2f80c9] px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#2870b0]"
          />
        </div>

        {/* ── TÍTULO ── */}
        <section className="package-content border-b border-white/10 bg-black px-6 pb-14 pt-32 text-center md:px-16 md:pb-16 md:pt-40">
          <h1
            className={`${display.className} text-3xl font-medium leading-tight text-white sm:text-4xl md:text-6xl`}
          >
            Pacotes para o Japão
          </h1>
        </section>

        {/* ── 2 DIVISÕES ── */}
        <section className="package-content border-b border-white/10 bg-[#050505] px-6 py-14 md:px-16 md:py-20">
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {divisoes.map((item) => (
              <a
                key={item.letra}
                href={item.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-center shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04] sm:rounded-[1.5rem]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={item.imagem}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col items-center p-6 md:p-8">
                  <h2 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
                    {item.titulo}
                  </h2>
                  <p className="mt-2.5 text-sm italic text-[#6ec3d9]">
                    &ldquo;{item.frase}&rdquo;
                  </p>
                  <p className="mt-3 flex-1 text-sm font-light leading-6 text-white/55">
                    {item.texto}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white">
                    Ver pacotes →
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-6xl">
            <p className="text-center">
              <span className="inline-block rounded-full bg-[#6ec3d9]/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9]">
                Decida com segurança
              </span>
            </p>
            <h3
              className={`${display.className} mt-3 text-center text-3xl font-medium text-white md:text-4xl`}
            >
              Não sabe qual pacote escolher?
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-light leading-6 text-white/55 md:text-base">
              Em pouco mais de 5 minutos, você entende as diferenças entre
              Caravana e Privativo e identifica qual modalidade combina com
              a sua forma de viajar.
            </p>
            <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-xl border border-white/15 bg-[#1c1c1e] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#2a2a2c] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="mx-auto flex items-center gap-1.5 rounded-md bg-black/30 px-4 py-1 text-[10px] text-white/45">
                  ajisaiwork.com/pacotes
                </div>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                  <IconPlay className="h-2.5 w-2.5 text-[#6ec3d9]" />
                  Vídeo explicativo · 5:18
                </span>
                <video
                  controls
                  preload="metadata"
                  poster="/videos/pacotes-explicacao-poster.jpg"
                  playsInline
                  className="h-full w-full bg-black object-contain fullscreen:h-screen fullscreen:w-screen fullscreen:object-contain"
                >
                  <source src="/videos/pacotes-explicacao.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-4xl text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
              Gravação de tela — navegação real pelo site
            </p>

            <div className="mx-auto mt-12 max-w-5xl overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="grid min-w-[680px] grid-cols-[1.05fr_1fr_1fr] border-b border-white/10 bg-white/[0.04]">
                <div className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Compare
                </div>
                <div className="border-l border-white/10 px-5 py-4">
                  <p className={`${display.className} text-xl font-medium text-white`}>Caravana</p>
                  <p className="mt-1 text-xs text-[#6ec3d9]">Turma de passageiros</p>
                </div>
                <div className="border-l border-white/10 px-5 py-4">
                  <p className={`${display.className} text-xl font-medium text-white`}>Privativo</p>
                  <p className="mt-1 text-xs text-[#6ec3d9]">Somente com seu grupo</p>
                </div>
              </div>
              <div>
                {[
                  ["Com quem viaja", "Turma de passageiros", "Somente com seu grupo"],
                  ["Datas", "Pré-definidas e não alteráveis", "Pré-definidas e não alteráveis"],
                  ["Roteiro", "Pré-definido e não alterável", "Pré-definido e não alterável"],
                  ["Personalização", "Tipo de quarto; hotéis já pré-definidos", "Tipo de quarto; hotéis já pré-definidos"],
                  [
                    "Mais indicado para",
                    "Quem busca convivência com uma turma de viajantes",
                    "Quem deseja adquirir um pacote fechado, mas viajar somente com sua família ou círculo pessoal",
                  ],
                ].map(([criterio, caravana, privativo]) => (
                  <div
                    key={criterio}
                    className="grid min-w-[680px] grid-cols-[1.05fr_1fr_1fr] border-b border-white/[0.07] last:border-b-0"
                  >
                    <p className="px-5 py-4 text-xs font-medium text-white/45">{criterio}</p>
                    <p className="border-l border-white/[0.07] px-5 py-4 text-sm leading-6 text-white/70">{caravana}</p>
                    <p className="border-l border-white/[0.07] px-5 py-4 text-sm leading-6 text-white/70">{privativo}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.15em] text-white/30 md:hidden">
              Deslize para comparar
            </p>
          </div>
        </section>

        {/* ── DIVISÃO 1 · PACOTES DE CARAVANA ── */}
        <section
          id="pacotes"
          className="package-content border-t border-white/10 bg-[#050505] px-5 py-12 md:bg-black md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Caravana
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Para quem não deseja viajar somente com o próprio grupo — saída
                em grupo fechado, com guia bilíngue dedicado à caravana do
                início ao fim.
              </p>
            </div>

            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl md:mb-8 md:rounded-[2rem]">
              <Image
                src={BANNER_CARAVANA.src}
                alt={BANNER_CARAVANA.alt}
                fill
                sizes="100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            </div>

            <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[1.35fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
                <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
                  O que está incluído na Caravana
                </h3>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                  {INCLUSO_CARAVANA.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                      <IconCheck className="h-4 w-4 shrink-0 text-[#6ec3d9]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#6ec3d9]/20 bg-[#6ec3d9]/[0.055] p-5 md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9]">
                  Como funciona
                </p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Datas de saída definidas · Grupo fechado · Vagas limitadas · Roteiro programado
                </p>
              </div>
            </div>

            <h3 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
              Escolha sua viagem
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesCaravana.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Pacotes de Caravana"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  imagem={pacote.imagem}
                  selo={pacote.selo}
                  variantes={pacote.variantes}
                  rodape="Por pessoa, em quarto individual. Vagas limitadas por grupo."
                />
              ))}
            </div>
            <PackageSectionNote />
          </div>
        </section>

        {/* ── DIVISÃO 2 · INDIVIDUAL OU PEQUENOS GRUPOS ── */}
        <section
          id="individuais"
          className="package-content border-t border-white/10 bg-black px-5 py-12 md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Privativo
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Para viajar apenas com quem você escolher, em um pacote fechado
                com datas e roteiro pré-definidos. Guia e transporte privado estão
                disponíveis como opcionais.
              </p>
            </div>

            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl md:mb-8 md:rounded-[2rem]">
              <Image
                src={BANNER_INDIVIDUAL.src}
                alt={BANNER_INDIVIDUAL.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            </div>

            <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[1.35fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
                <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
                  O que está incluído no Privativo
                </h3>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                  {INCLUSO_PRIVATIVO.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                      <IconCheck className="h-4 w-4 shrink-0 text-[#6ec3d9]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/10 pt-4 text-xs text-white/45">
                  <span className="font-semibold text-white/65">Opcionais:</span>{" "}
                  {OPCIONAIS_PRIVATIVO.join(" · ")}
                </p>
              </div>
              <div className="rounded-2xl border border-[#6ec3d9]/20 bg-[#6ec3d9]/[0.055] p-5 md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9]">
                  Como funciona
                </p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Somente seu grupo · Datas pré-definidas · Guia e transporte opcionais · Roteiro pré-definido e não alterável
                </p>
              </div>
            </div>

            <h3 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
              Escolha sua viagem
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesIndividuais.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Privativo"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  imagem={pacote.imagem}
                  variantes={pacote.variantes}
                  rodape="Por pessoa, em quarto individual. Datas dentro da temporada indicada."
                />
              ))}
            </div>
            <PackageSectionNote />
          </div>
        </section>

        {/* ── POR QUE A AJISAI ── */}
        <section className="institutional-content border-t-2 border-[#b79ce6]/30 bg-white/[0.02] px-6 py-20 md:px-16 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex justify-center md:mb-14">
              <img
                src="/images/AJISAI-LOGO.avif"
                alt="Ajisai"
                className="h-10 w-auto object-contain opacity-95 md:h-14"
              />
            </div>
            <div className="mb-10 max-w-3xl md:mb-16">
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                Por que escolher a Ajisai
              </p>
              <h2
                className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}
              >
                O acesso no Japão não se compra. Se constrói ao longo de anos.
              </h2>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-0.5 text-[#b79ce6]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <IconStarFilled key={index} className="h-4 w-4" />
                  ))}
                </div>
                <p className="text-sm font-light text-white/60">
                  <span className="font-medium text-white">4,8 de 5,0</span> no
                  Google · +180 avaliações
                </p>
              </div>
            </div>

            <CarouselScroller itemCount={whyAjisai.length} desktopColumns={4}>
              {whyAjisai.map((item) => (
                <div
                  key={item.title}
                  className="flex w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col items-center text-center md:w-auto"
                >
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">
                    {item.label}
                  </p>
                  <h3
                    className={`${display.className} flex min-h-[3.5rem] items-center justify-center text-lg font-medium text-white md:min-h-[3.8rem] md:text-xl`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-7 text-white/50">
                    {item.text}
                  </p>
                </div>
              ))}
            </CarouselScroller>
          </div>
        </section>

        {/* ── SOCIAL PROOF — AVALIAÇÕES DO GOOGLE ── */}
        <section className="institutional-content border-t border-white/10 bg-black px-6 py-20 md:px-16 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 grid grid-cols-1 items-center gap-10 md:mb-20 md:grid-cols-2 md:gap-16">
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                  Quem viajou com a Ajisai
                </p>
                <h2
                  className={`${display.className} text-3xl font-medium leading-tight md:text-4xl`}
                >
                  Tudo é feito com muito carinho e atenção aos detalhes para
                  atender aos nossos clientes mais exigentes
                </h2>

                <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:rounded-[1.5rem] md:p-6">
                    <p
                      className={`${display.className} text-5xl font-medium leading-none text-white md:text-6xl`}
                    >
                      4,8
                    </p>
                    <div>
                      <div className="flex items-center gap-1 text-[#b79ce6]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <IconStarFilled key={index} className="h-4 w-4" />
                        ))}
                      </div>
                      <p className="mt-2 text-xs font-light text-white/55 md:text-sm">
                        de 5,0 no Google ·{" "}
                        <span className="text-white">+180 avaliações</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 sm:rounded-[1.5rem] md:p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 md:h-14 md:w-14">
                      <IconShieldCheck className="h-6 w-6 md:h-7 md:w-7" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white md:text-base">
                        Verificada pelo Reclame AQUI
                      </p>
                      <p className="mt-1 text-xs text-white/50 md:text-sm">
                        Aprovada em todas as checagens de segurança
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-emerald-400/70">
                        Última verificação · Mar/2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl md:rounded-[2rem]">
                <Image
                  src="/images/kyoto-maiko-street.png"
                  alt="Viajante Ajisai caminhando por rua tradicional em Kyoto, com pagode ao fundo"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <CarouselScroller
              itemCount={googleReviews.length}
              desktopColumns={3}
              desktopScroll
            >
              {googleReviews.map((review, index) => (
                <div
                  key={review.name}
                  className="flex min-h-[380px] w-[80vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:rounded-[2rem] sm:p-8 md:w-[31%] md:shrink-0"
                >
                  <div className="mb-4 flex items-center gap-0.5 text-[#b79ce6]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <IconStarFilled key={starIndex} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm font-light leading-7 text-white/60">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor: avatarColors[index % avatarColors.length],
                      }}
                      aria-hidden
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{review.name}</p>
                      <p className="mt-0.5 text-xs text-white/35">
                        {review.context} · Avaliação no Google
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CarouselScroller>

            <div className="mt-14 flex flex-row flex-wrap items-center justify-center gap-6 md:mt-20">
              <Image
                src="/images/badge-cadastur.png"
                alt="Cadastur — Agência de Turismo registrada"
                width={1254}
                height={1254}
                className="h-auto w-full max-w-[180px] sm:max-w-[200px]"
              />
              <Image
                src="/images/badge-reclameaqui.png"
                alt="Verificado no Reclame Aqui"
                width={1536}
                height={1024}
                className="h-auto w-full max-w-[180px] sm:max-w-[200px]"
              />
            </div>
          </div>
        </section>

        <footer className="package-content border-t border-white/10 bg-black px-8 pb-20 pt-16 text-white md:px-16 md:pb-20 md:pt-20">
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
    </CartProvider>
  );
}

// ── Ícones inline, sem dependência de lucide-react ──
function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3.01.15.19 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.34Z" />
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.15c-1.66 0-3.2-.46-4.52-1.25l-.32-.19-3.02.79.8-2.94-.21-.3A8.14 8.14 0 0 1 3.85 12c0-4.5 3.67-8.15 8.17-8.15 4.5 0 8.17 3.66 8.17 8.15 0 4.5-3.67 8.15-8.17 8.15Z" />
    </svg>
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

function IconClock({ className }: { className?: string }) {
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
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function IconStarFilled({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3l2.5 6 6.5.6-5 4.3 1.5 6.4L12 17l-5.5 3.3L8 13.9l-5-4.3L9.5 9.6 12 3Z" />
    </svg>
  );
}

function IconGem({ className }: { className?: string }) {
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
      <path d="M6 3h12l3 5.5L12 21 3 8.5 6 3Z" />
      <path d="M3 8.5h18" />
      <path d="M9 3l3 5.5-3 12.5" />
      <path d="M15 3l-3 5.5 3 12.5" />
    </svg>
  );
}

function IconExchange({ className }: { className?: string }) {
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
      <path d="M6 7h12M14 3l4 4-4 4" />
      <path d="M18 17H6m4 4-4-4 4-4" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
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
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
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
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
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
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

function IconHeadset({ className }: { className?: string }) {
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
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Z" />
      <path d="M20 13a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
      <path d="M18 17.5c0 1.9-2.2 3-4.5 3" />
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
