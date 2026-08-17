import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { CartProvider } from "../components/CartContext";
import { CartWidget } from "../components/CartWidget";
import { PackageCard, type PackageVariant } from "../components/PackageCard";
import { CustomPackageCard } from "../components/CustomPackageCard";

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Pacotes de Viagem para o Japão",
  description:
    "Pacotes de viagem para o Japão com a curadoria Ajisai: Caravana (grupo fechado), Individual ou Pequenos Grupos e Pacotes Personalizados sob medida. Monte seu carrinho e finalize direto no WhatsApp.",
};

// Preço padrão fixo pra todos os pacotes de Caravana e Individual/Pequenos
// Grupos: 7 dias = R$ 38.000, 15 dias = R$ 50.000 (mesmo valor
// independente da temporada). Datas continuam provisórias — confirmar
// antes de publicar.
const parcelaDe = (preco: number) =>
  `ou em até 12x de R$ ${(preco / 12).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} + Juros Mensais`;

const variantesPadrao = (
  preco7: number,
  datas7: string,
  preco15: number,
  datas15: string,
): PackageVariant[] => [
  {
    id: "7d",
    label: "7 dias",
    datas: datas7,
    precoLabel: `R$ ${preco7.toLocaleString("pt-BR")}`,
    parcelaLabel: parcelaDe(preco7),
    precoBRL: preco7,
  },
  {
    id: "15d",
    label: "15 dias",
    datas: datas15,
    precoLabel: `R$ ${preco15.toLocaleString("pt-BR")}`,
    parcelaLabel: parcelaDe(preco15),
    precoBRL: preco15,
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
  alt: "Individual ou Pequenos Grupos",
};
const BANNER_PERSONALIZADO = {
  src: "/images/personalizado-hero.png",
  alt: "Pacotes Personalizados",
};

// Fatos que valem para todos os pacotes da divisão (data fixa, guia
// compartilhado, vagas limitadas...) ficam num único bloco por seção, em vez
// de repetidos em cada card — só o que muda de pacote pra pacote (temporada,
// clima, datas, preço) aparece dentro do card.
const BENEFICIOS_CARAVANA = [
  "Data de saída fixa, em grupo fechado",
  "Guia bilíngue acompanhando a caravana do início ao fim",
  "Vagas limitadas — reserva antecipada recomendada",
];
const BENEFICIOS_INDIVIDUAL = [
  "Guia particular, dedicado só ao seu grupo",
  "Roteiro pode ser ajustado ao seu ritmo e interesses",
  "Ideal para famílias, casais e grupos de amigos",
];

const pacotesCaravana = [
  {
    slug: "caravana-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Temporada de Cerejeiras 2027",
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
    variantes: variantesPadrao(
      38000,
      "28 mar – 03 abr 2027",
      50000,
      "24 mar – 07 abr 2027",
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
    variantes: variantesPadrao(
      38000,
      "08 – 14 mai 2027",
      50000,
      "08 – 22 mai 2027",
    ),
  },
];

const pacotesIndividuais = [
  {
    slug: "individual-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Temporada de Cerejeiras 2027",
    tagline: "Datas flexíveis, guia dedicado só ao seu grupo",
    descricao:
      "Viaje na temporada de floração das cerejeiras — parques, templos e avenidas históricas no auge do hanami, com liberdade para escolher suas datas dentro da florada.",
    destaques: [
      "Datas flexíveis dentro da temporada de floração das cerejeiras",
    ],
    imagem: BANNER_INDIVIDUAL.src,
    imagemAlt: BANNER_INDIVIDUAL.alt,
    accent: "#e6a6c7",
    variantes: variantesPadrao(
      38000,
      "Datas flexíveis · mar–abr 2027",
      50000,
      "Datas flexíveis · mar–abr 2027",
    ),
  },
  {
    slug: "individual-maio",
    categoria: "Maio 2027",
    nome: "Primavera 2 — Maio 2027",
    tagline: "Datas flexíveis, guia dedicado só ao seu grupo",
    descricao:
      "Viaje em maio, fora do pico de alta temporada — clima ameno, menos turistas e liberdade para escolher suas datas dentro do mês.",
    destaques: [
      "Datas flexíveis dentro de maio, fora do pico de alta temporada",
    ],
    imagem: BANNER_INDIVIDUAL.src,
    imagemAlt: BANNER_INDIVIDUAL.alt,
    accent: "#7fbf6e",
    variantes: variantesPadrao(
      38000,
      "Datas flexíveis · maio 2027",
      50000,
      "Datas flexíveis · maio 2027",
    ),
  },
];

const divisoes = [
  {
    letra: "A",
    titulo: "Pacotes de Caravana",
    frase: "Quero viajar com outras pessoas",
    texto:
      "Saída em grupo fechado, data única, guia compartilhado do início ao fim.",
    href: "#pacotes",
    imagem: BANNER_CARAVANA.src,
  },
  {
    letra: "B",
    titulo: "Individual ou Pequenos Grupos",
    frase: "Quero viajar só com minha família ou amigos",
    texto:
      "Datas flexíveis dentro da temporada e guia particular dedicado ao seu grupo.",
    href: "#individuais",
    imagem: BANNER_INDIVIDUAL.src,
  },
  {
    letra: "C",
    titulo: "Pacotes Personalizados",
    frase: "Quero tudo feito para mim",
    texto:
      "Viaje em qualquer data, com um roteiro sob medida e adicionais que você preferir.",
    href: "#personalizado",
    imagem: BANNER_PERSONALIZADO.src,
  },
];

// Mesmos 3 pilares de confiança usados em /ajisairoteiros — nota do Google
// (4,8 · +180 avaliações) também replicada da mesma página.
const DIFERENCIAIS = [
  {
    titulo: "Operação especializada em Japão",
    texto: "Atendimento no Brasil e suporte especializado para sua viagem.",
    Icon: IconGlobe,
  },
  {
    titulo: "Compra segura",
    texto: "Contrato, condições da viagem e pagamentos formalizados.",
    Icon: IconShieldCheck,
  },
  {
    titulo: "Suporte antes do embarque",
    texto: "Orientação desde a reserva até a preparação para a viagem.",
    Icon: IconHeadset,
  },
];

export default function PacotesJapaoPage() {
  const todosOsNomesDePacote = [
    "Primavera 1 — Temporada de Cerejeiras 2027 (Caravana)",
    "Primavera 2 — Maio 2027 (Caravana)",
    "Primavera 1 — Temporada de Cerejeiras 2027 (Individual)",
    "Primavera 2 — Maio 2027 (Individual)",
    "Pacote Personalizado",
  ];

  return (
    <CartProvider>
      <main className="min-h-screen overflow-x-hidden bg-black pb-16 text-white md:pb-0">
        {/* ── HEADER ── */}
        <header className="fixed left-0 right-0 top-0 z-50 transform-gpu bg-black/10 backdrop-blur-2xl">
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
          className="fixed inset-x-0 bottom-0 z-40 transform-gpu border-t border-white/10 bg-black/[0.92] px-4 pt-2.5 backdrop-blur-xl md:hidden"
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
        <section className="border-b border-white/10 bg-black px-6 pb-14 pt-32 text-center md:px-16 md:pb-16 md:pt-40">
          <h1
            className={`${display.className} text-3xl font-medium leading-tight text-white sm:text-4xl md:text-6xl`}
          >
            Pacotes para o Japão
          </h1>
        </section>

        {/* ── 3 DIVISÕES ── */}
        <section className="border-b border-white/10 bg-[#050505] px-6 py-14 md:px-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
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
        </section>

        {/* ── DIVISÃO 1 · PACOTES DE CARAVANA ── */}
        <section
          id="pacotes"
          className="border-t border-white/10 bg-[#050505] px-5 py-12 md:bg-black md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Pacotes de Caravana
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

            <ul className="mb-8 flex flex-col gap-y-3 md:mb-10">
              {BENEFICIOS_CARAVANA.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/60 md:text-base">
                  <IconCheck className="h-4 w-4 shrink-0 text-[#6ec3d9]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mb-8 flex justify-center md:mb-10 md:justify-start">
              <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#6ec3d9]/50 bg-[#6ec3d9]/15 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9] md:text-xs">
                <IconClock className="h-3.5 w-3.5 shrink-0" />
                Datas e valores sujeitos a alteração conforme disponibilidade e câmbio
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesCaravana.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Pacotes de Caravana"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  descricao={pacote.descricao}
                  destaques={pacote.destaques}
                  imagem={pacote.imagem}
                  selo={pacote.selo}
                  variantes={pacote.variantes}
                  rodape="Por pessoa, em quarto individual. Vagas limitadas por grupo."
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVISÃO 2 · INDIVIDUAL OU PEQUENOS GRUPOS ── */}
        <section
          id="individuais"
          className="border-t border-white/10 bg-black px-5 py-12 md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Individual ou Pequenos Grupos
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Para viajar apenas com quem você escolher — datas flexíveis
                dentro da temporada e guia particular dedicado só ao seu
                grupo.
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

            <ul className="mb-8 flex flex-col gap-y-3 md:mb-10">
              {BENEFICIOS_INDIVIDUAL.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/60 md:text-base">
                  <IconCheck className="h-4 w-4 shrink-0 text-[#6ec3d9]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mb-8 flex justify-center md:mb-10 md:justify-start">
              <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#6ec3d9]/50 bg-[#6ec3d9]/15 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9] md:text-xs">
                <IconClock className="h-3.5 w-3.5 shrink-0" />
                Datas e valores sujeitos a alteração conforme disponibilidade e câmbio
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesIndividuais.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Individual ou Pequenos Grupos"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  descricao={pacote.descricao}
                  destaques={pacote.destaques}
                  imagem={pacote.imagem}
                  variantes={pacote.variantes}
                  rodape="Por pessoa, em quarto individual. Datas dentro da temporada indicada."
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVISÃO 3 · PACOTES PERSONALIZADOS ── */}
        <section
          id="personalizado"
          className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Pacotes Personalizados
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Viaje em qualquer data, com um roteiro sob medida e
                adicionais que você preferir.
              </p>
            </div>

            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl md:mb-10 md:rounded-[2rem]">
              <Image
                src={BANNER_PERSONALIZADO.src}
                alt={BANNER_PERSONALIZADO.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            </div>

            <CustomPackageCard />
          </div>
        </section>

        {/* ── VIAJE COM A AJISAI ── */}
        <section className="border-t border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-4xl`}>
              Viaje com a Ajisai
            </h2>

            <div className="mt-5 flex items-center justify-center gap-1 text-[#b79ce6]">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStarFilled key={i} className="h-4 w-4" />
              ))}
              <span className="ml-2 text-base font-semibold text-white">
                4,8 de 5,0 no Google ·{" "}
                <span className="text-[#6ec3d9]">+180 avaliações</span>
              </span>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3 md:mt-14">
              {DIFERENCIAIS.map((item) => (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center md:p-8"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6ec3d9]/10 text-[#6ec3d9]">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`${display.className} mt-4 text-lg font-medium text-white`}>
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-6 text-white/55">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-6 md:mt-12">
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

        <footer className="border-t border-white/10 bg-black px-8 pb-20 pt-16 text-white md:px-16 md:pb-20 md:pt-20">
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
