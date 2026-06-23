import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { TripDashboard } from "../components/TripDashboard";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Alpinea | Trading Card Game Tour no Japão",
  description:
    "Pacote especial Alpinea para colecionadores de Trading Card Games no Japão, com card hunting em Tokyo e Osaka.",
};

const schedule = [
  {
    time: "10:30",
    duration: "2h30",
    title: "Hareruya 2",
    eyebrow: "Singles · sealed boxes · acessórios",
    text: "Primeira parada do dia em uma das lojas mais conhecidas de TCG em Akihabara. A visita é pensada para explorar vitrines com calma, comparar singles, procurar sealed boxes e avaliar acessórios para colecionadores de Pokémon, Yu-Gi-Oh! e outros TCGs.",
    image: "/images/hareruya2.jpeg",
    alt: "Hareruya 2 em Akihabara",
  },
  {
    time: "13:00",
    duration: "1h30",
    title: "Pausa para almoço",
    eyebrow: "Ritmo confortável · tempo livre",
    text: "Intervalo em Akihabara para manter o ritmo do dia sem pressa, com tempo livre para escolher entre as opções da região. A pausa também permite revisar prioridades antes das vitrines mais relevantes da tarde.",
    image: "/images/akihabara.png",
    alt: "Akihabara à noite",
  },
  {
    time: "14:30",
    duration: "2h30",
    title: "Valuable Card Tokyo",
    eyebrow: "PSA · graded cards · promos japonesas",
    text: "Visita focada em cartas de alto valor, PSA/Graded Cards, promos japonesas, singles raros e peças de vitrine. Uma parada importante para colecionadores que buscam itens mais difíceis de encontrar fora do Japão.",
    image: "/images/valuablecardtokyo.jpeg",
    alt: "Valuable Card Tokyo",
  },
  {
    time: "17:30",
    duration: "2h30",
    title: "Torecamall",
    eyebrow: "Graded cards · singles · comparação final",
    text: "Encerramento do dia com uma loja forte em vitrines de cartas modernas, singles, PSA/Graded Cards e oportunidades para comparar preços antes de compras maiores. O objetivo é fechar o dia com decisões mais seguras e menos impulsivas.",
    image: "/images/torecamall.jpeg",
    alt: "Torecamall em Tokyo",
  },
];

const brands = [
  { name: "Pokémon", logo: "/images/pokemontcglogo.png" },
  { name: "Yu-Gi-Oh!", logo: "/images/yugiohtcglogo.png" },
  { name: "One Piece", logo: "/images/onepiecelogo.webp" },
];

const products = [
  { name: "Singles", image: "/images/OkoThiefOfCrowns__25446.jpg" },
  { name: "Graded", image: "/images/graded.jpg" },
  { name: "Booster Pack", image: "/images/booster.webp" },
  { name: "Sealed Box", image: "/images/sealedbox.webp" },
];

const ramenSpots = [
  {
    name: "Hachigo",
    city: "Tóquio · Ginza",
    legend: "Bib Gourmand Michelin, por um ex-chef de hotel de luxo",
    image: "/images/hachigo.webp",
  },
  {
    name: "RAGE",
    city: "Tóquio · Nishi-Ogikubo",
    legend: "Bib Gourmand Michelin por 8 anos consecutivos",
    image: "/images/rage.webp",
  },
  {
    name: "Mugi to Mensuke",
    city: "Osaka · Nakatsu",
    legend: "Eleito o ramen mais disputado de Osaka",
    image: "/images/mugitomensuke.webp",
  },
  {
    name: "Break Beats",
    city: "Tóquio · Yutenji",
    legend: "Criado por um ex-DJ, caldo cristalino premiado",
    image: "/images/breakbeats.webp",
  },
  {
    name: "King Seimen",
    city: "Tóquio · Oji",
    legend: "Wontons gigantes e macarrão artesanal",
    image: "/images/kingseimen.webp",
  },
];

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-white/10 pt-6">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/30">{title}</p>
      <p className="text-white/75">{text}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className={`${display.className} text-4xl font-medium text-white md:text-5xl`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/35">{label}</p>
    </div>
  );
}

export default function TcgSpecialTourPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/">
          <img
            src="/images/ALPINEA-LOGO-transparent.png"
            alt="Alpinea"
            className="h-8 w-auto object-contain"
          />
        </a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/gastro" className="transition hover:text-white">Restaurantes</a>
          <a href="/guia" className="transition hover:text-white">Compras</a>
          <a href="/preview" className="text-white transition">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative bg-black pt-20">
        <div className="relative h-[34vw] min-h-[280px] max-h-[540px] w-full overflow-hidden">
          <Image
            src="/images/herotcg.png"
            alt="Cartas raras de Pokémon, Yu-Gi-Oh! e One Piece Card Game"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-10 text-center md:px-16 md:pb-14">
            <div className="mx-auto max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/45">
                Pacotes Especiais · Alpinea Special Tour
              </p>
              <h1 className={`${display.className} text-2xl font-medium tracking-tight text-white sm:text-3xl md:text-5xl`}>
                Trading Card Game Tour
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-white/65 md:text-base md:leading-8">
                Seja Pokémon, Yu-Gi-Oh! ou One Piece — acompanhamos você nas lojas com os melhores acervos
                para singles, PSA/Graded Cards e acessórios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MARCAS ATENDIDAS */}
      <section className="bg-black px-8 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/30">TCGs Atendidos</p>
          <h2 className={`${display.className} max-w-3xl text-3xl font-medium leading-tight text-white md:text-5xl`}>
            Profundidade em cada universo de cartas.
          </h2>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {brands.map((brand) => (
              <div key={brand.name} className="text-center">
                <div className="flex h-40 items-center justify-center px-6">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
                <p className={`${display.className} mt-7 text-xl font-medium text-white`}>{brand.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUTOS ATENDIDOS */}
      <section className="bg-black px-8 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/30">Produtos Atendidos</p>
          <h2 className={`${display.className} max-w-3xl text-3xl font-medium leading-tight text-white md:text-5xl`}>
            De singles a sealed box, cobertura completa.
          </h2>

          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {products.map((product) => (
              <div key={product.name} className="text-center">
                <div className="relative mx-auto h-48 w-full max-w-[180px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                </div>
                <p className={`${display.className} mt-7 text-xl font-medium text-white`}>{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRIEFING */}
      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <p className={`${display.className} mb-12 text-center text-2xl font-medium text-white md:text-3xl`}>
            Briefing
          </p>

          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Ritmo da viagem</p>
            <p className="text-base font-light leading-9 text-white/65">
              Viagem de 7 dias visitando as melhores lojas de Trading Card Games no Japão,
              com 2 a 3 lojas por dia e bastante tempo dentro de cada loja para card hunting.
            </p>
          </div>

          <div className="grid gap-10 text-sm font-light leading-8 text-white/70 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewItem title="Perfil do visitante" text="Colecionador ou entusiasta de TCG — Pokémon, Yu-Gi-Oh! ou One Piece" />
            <PreviewItem title="Cidades visitadas" text="Tokyo & Osaka" />
            <PreviewItem title="Estilo de curadoria" text="Alpinea Special Tour" />
            <PreviewItem title="Duração da viagem" text="7 dias" />
          </div>

          <div className="mt-12 border-t border-white/10 pt-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/30">A Curadoria em Números</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <StatItem value="7" label="dias" />
              <StatItem value="2" label="cidades" />
              <StatItem value="5" label="bairros de caça" />
              <StatItem value="18+" label="lojas especializadas" />
              <StatItem value="45h" label="de card hunting" />
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-center text-xs uppercase tracking-[0.35em] text-white/40">Visão Geral</p>
          <h2 className={`${display.className} mb-16 text-center text-3xl font-medium text-white md:text-4xl`}>
            Meu Dashboard de Viagem
          </h2>

          <TripDashboard
            days={[
              { day: 1, date: "1 Nov", city: "Tokyo", href: "#dia-1" },
              { day: 2, date: "2 Nov", city: "Tokyo" },
              { day: 3, date: "3 Nov", city: "Tokyo" },
              { day: 4, date: "4 Nov", city: "Tokyo" },
              { day: 5, date: "5 Nov", city: "Tokyo" },
              { day: 6, date: "6 Nov", city: "Osaka" },
              { day: 7, date: "7 Nov", city: "Osaka" },
            ]}
            guides={[
              { label: "Lojas Especializadas" },
              { label: "Avaliação (PSA/Graded)" },
              { label: "Cuidados e Transporte" },
            ]}
            annexes={[
              { label: "Dinheiro e Pagamentos" },
              { label: "Apps e Conectividade" },
              { label: "Transporte entre Bairros" },
            ]}
          />
        </div>
      </section>

      {/* AKIHABARA HERO — SAME LANGUAGE AS SKYTREE */}
      <section id="dia-1" className="border-t border-white/10 bg-black">
        <div className="relative min-h-[640px] overflow-hidden">
          <Image
            src="/images/akihabara.png"
            alt="Akihabara"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/20" />

          <div className="relative z-10 flex min-h-[640px] items-end justify-center px-8 pb-20 text-center md:px-16">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Dia 1 · Tokyo</p>
              <h2 className={`${display.className} text-5xl font-medium tracking-tight text-white md:text-7xl`}>
                Akihabara
              </h2>
              <p className="mx-auto mt-7 max-w-2xl text-base font-light leading-8 text-white/62">
                Um dia dedicado a lojas especializadas, vitrines de alto valor, singles,
                sealed boxes, PSA/Graded Cards e acessórios.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-20 md:px-16">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">Melhor horário</p>
              <p className="text-lg text-white">10:30–20:00</p>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">Tempo estimado</p>
              <p className="text-lg text-white">Dia completo</p>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">Lojas do dia</p>
              <p className="text-lg text-white">3 paradas principais</p>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">Foco</p>
              <p className="text-lg text-white">Singles · PSA · sealed</p>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-10">
            <p className="mb-7 text-xs uppercase tracking-[0.35em] text-white/35">Resumo do Dia</p>
            <div className="grid gap-6 text-sm leading-8 text-white/58 md:grid-cols-2">
              <p>
                A proposta é visitar menos lojas, com mais tempo em cada uma. Cada parada foi organizada
                para permitir pesquisa de preço, inspeção das vitrines e decisões de compra com menos pressa.
              </p>
              <p>
                Hareruya 2, Valuable Card Tokyo e Torecamall formam uma amostra forte de Akihabara para
                colecionadores de Pokémon, Yu-Gi-Oh!, One Piece e outros TCGs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL SCHEDULE */}
      <section className="border-t border-white/10 bg-black px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/35">Exemplo de dia</p>
          <h2 className={`${display.className} mb-16 max-w-3xl text-4xl font-medium leading-tight text-white md:text-6xl`}>
            Três lojas, tempo real de caça e decisões sem pressa.
          </h2>

          <div className="space-y-24">
            {schedule.map((item, index) => (
              <article
                key={item.title}
                className="grid gap-12 border-t border-white/10 pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-8 flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-white/35">
                    <span>{item.time}</span>
                    <span className="h-px w-10 bg-white/20" />
                    <span>{item.duration}</span>
                  </div>
                  <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/30">{item.eyebrow}</p>
                  <h3 className={`${display.className} text-4xl font-medium leading-tight text-white md:text-5xl`}>
                    {item.title}
                  </h3>
                  <p className="mt-8 max-w-xl text-base font-light leading-9 text-white/62">{item.text}</p>
                </div>

                <div className={`relative min-h-[520px] overflow-hidden ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 56vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RAMEN TOUR */}
      <section className="border-t border-white/10 bg-black px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/30">Edição Especial · Alpinea</p>
          <h2 className={`${display.className} max-w-3xl text-4xl font-medium leading-tight text-white md:text-6xl`}>
            Ramen Tour — 5 Ramens de Elite
          </h2>
          <p className="mt-7 max-w-2xl text-base font-light leading-9 text-white/62">
            Uma seleção de cinco bowls fora da curva, entre Tóquio e Osaka — todos reconhecidos pelo
            Guia Michelin e parte do roteiro de quem já viaja com a Alpinea para o card hunting.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
            {ramenSpots.map((spot) => (
              <div key={spot.name} className="text-center">
                <div className="relative mx-auto aspect-square w-full max-w-[220px]">
                  <Image
                    src={spot.image}
                    alt={`Ramen do ${spot.name}`}
                    fill
                    sizes="(min-width: 1024px) 18vw, 45vw"
                    className="object-contain"
                  />
                </div>
                <p className={`${display.className} mt-6 text-lg font-medium text-white`}>{spot.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">{spot.city}</p>
                <p className="mt-3 text-sm font-light leading-6 text-white/55">{spot.legend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Alpinea Special Tour
          </p>
          <h2 className={`${display.className} text-3xl font-medium leading-tight text-black md:text-5xl`}>
            Uma viagem para colecionar melhor.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-black/60">
            A Alpinea organiza o ritmo, as prioridades e a logística para que cada dia seja dedicado ao que
            realmente importa: encontrar cartas, comparar oportunidades e comprar com segurança.
          </p>
          <ContactCTA />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">

          {/* Coluna esquerda */}
          <div className="space-y-6">
            <img
              src="/images/ALPINEA-LOGO-transparent.png"
              alt="Alpinea"
              className="h-7 w-auto object-contain"
            />

            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/50">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>

              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-white/25">
                <a href="/legal" className="transition hover:text-white/60">
                  Termos e Condições
                </a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/60">
                  Política de Privacidade
                </a>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a
              href="https://www.instagram.com/alpinea.private"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Instagram
            </a>

            <a
              href="https://www.youtube.com/@alpinea.private"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              YouTube
            </a>

            <a
              href="mailto:wilson@alpinea.io"
              className="transition hover:text-white"
            >
              Contato
            </a>
          </div>

        </div>
      </footer>
    </main>
  );
}
