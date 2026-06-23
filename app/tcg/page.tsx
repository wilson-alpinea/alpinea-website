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
    title: "Hareruya 2",
    text: "Primeira parada do dia em uma das lojas mais conhecidas de TCG em Akihabara. Boa seleção de singles, sealed boxes, acessórios e vitrines para colecionadores de Pokémon, Yu-Gi-Oh! e outros TCGs.",
    image: "/images/hareruya2.jpeg",
    alt: "Hareruya 2 em Akihabara",
  },
  {
    time: "13:00",
    title: "Pausa para almoço",
    text: "Intervalo confortável em Akihabara, mantendo o ritmo do dia sem pressa. A pausa evita decisões apressadas e permite revisar preços, prioridades e oportunidades encontradas na primeira loja.",
    image: "/images/akihabara.png",
    alt: "Akihabara à noite",
  },
  {
    time: "14:30",
    title: "Valuable Card Tokyo",
    text: "Visita focada em graded cards, PSA, cartas de alto valor, promos japonesas, singles raros e peças para colecionadores que buscam itens mais difíceis de encontrar fora do Japão.",
    image: "/images/valuablecardtokyo.jpeg",
    alt: "Valuable Card Tokyo",
  },
  {
    time: "17:30",
    title: "Torecamall",
    text: "Encerramento do dia com uma loja forte em vitrines de cartas modernas, singles, graded cards e oportunidades para comparar preços antes de decidir compras maiores.",
    image: "/images/torecamall.jpeg",
    alt: "Torecamall em Tokyo",
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
          <a href="/preview" className="transition text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      <section className="relative min-h-[720px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <Image
          src="/images/pikachutcg.jpg"
          alt="Pokémon Trading Card Game"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/45">
            Pacotes Especiais · Alpinea Special Tour
          </p>
          <h1 className={`${display.className} max-w-5xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl`}>
            Trading Card Game
            <br />
            Tour
          </h1>
          <p className="mt-10 max-w-3xl text-lg font-light leading-9 text-white/70">
            Seja Pokémon, Yu-Gi-Oh! ou One Piece — acompanhamos você nas lojas
            com os melhores acervos para singles, PSA/Graded Cards e acessórios.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <p className={`${display.className} mb-12 text-center text-2xl font-medium text-white md:text-3xl`}>
            Briefing
          </p>

          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Ritmo da viagem</p>
            <p className="text-base font-light leading-9 text-white/65">
              Viagem de 7 dias visitando as melhores lojas de Trading Card Games
              no Japão, com 2 a 3 lojas por dia e bastante tempo dentro de cada
              loja para card hunting.
            </p>
          </div>

          <div className="grid gap-10 text-sm font-light leading-8 text-white/70 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewItem title="Perfil do visitante" text="Colecionador ou entusiasta de TCG — Pokémon, Yu-Gi-Oh! ou One Piece" />
            <PreviewItem title="Cidades visitadas" text="Tokyo & Osaka" />
            <PreviewItem title="Estilo de curadoria" text="Alpinea Special Tour" />
            <PreviewItem title="Duração da viagem" text="7 Dias" />
          </div>

          <div className="mt-12 border-t border-white/10 pt-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/30">A Curadoria em Números</p>
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
              <StatItem value="7" label="dias" />
              <StatItem value="2" label="cidades" />
              <StatItem value="5" label="distritos de caça" />
              <StatItem value="18+" label="lojas especializadas" />
              <StatItem value="45h" label="de card hunting" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-center text-xs uppercase tracking-[0.35em] text-white/40">Visão Geral</p>
          <h3 className={`${display.className} mb-16 text-center text-3xl font-medium text-white md:text-4xl`}>
            Meu Dashboard de Viagem
          </h3>

          <TripDashboard
            days={[
              { day: 1, date: "1 Nov", city: "Tokyo · Akihabara", href: "#dia-1" },
              { day: 2, date: "2 Nov", city: "Tokyo · Akihabara" },
              { day: 3, date: "3 Nov", city: "Tokyo · Ikebukuro" },
              { day: 4, date: "4 Nov", city: "Tokyo · Ikebukuro" },
              { day: 5, date: "5 Nov", city: "Tokyo · Nakano" },
              { day: 6, date: "6 Nov", city: "Osaka · Nipponbashi" },
              { day: 7, date: "7 Nov", city: "Osaka · Nipponbashi" },
            ]}
            guides={[]}
            annexes={[]}
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 text-sm font-light leading-8 text-white/60 md:grid-cols-2">
            <div className="border border-white/10 bg-white/[0.03] p-7">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/30">Distribuição</p>
              <p>5 dias em Tokyo e 2 dias em Osaka, com início da viagem em 01 de novembro.</p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-7">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/30">Bairros-chave</p>
              <p>2 dias em Akihabara, 2 em Ikebukuro, 1 em Nakano Broadway e 2 em Nipponbashi.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="dia-1" className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
              <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">Dia 1 · Akihabara</p>
              <h2 className={`${display.className} text-4xl font-medium tracking-tight text-white md:text-6xl`}>
                Card hunting em Akihabara
              </h2>
              <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
                Um dia dedicado a lojas especializadas, vitrines de alto valor,
                singles, sealed boxes, PSA/Graded Cards e acessórios. A proposta
                é visitar menos lojas, com mais tempo em cada uma.
              </p>
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/akihabara.png"
                alt="Akihabara"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            </div>
          </div>

          <div className="mt-6 border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Resumo do Dia</p>
            <div className="space-y-6 text-sm leading-8 text-white/55">
              <div className="flex items-start gap-6">
                <span className="mt-0.5 w-12 shrink-0 text-xs tracking-[0.2em] text-white/25">10:30</span>
                <p className="text-white/80">Hareruya 2 · 2h30 de exploração</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 w-12 shrink-0 text-xs tracking-[0.2em] text-white/25">13:00</span>
                <p>Pausa para almoço e revisão das primeiras oportunidades encontradas</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 w-12 shrink-0 text-xs tracking-[0.2em] text-white/25">14:30</span>
                <p className="text-white/80">Valuable Card Tokyo · graded cards, promos e peças de vitrine</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 w-12 shrink-0 text-xs tracking-[0.2em] text-white/25">17:30</span>
                <p className="text-white/80">Torecamall · singles, PSA e comparação final de preços</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 w-12 shrink-0 text-xs tracking-[0.2em] text-white/25">20:00</span>
                <p>Encerramento do dia · organização das compras e checklist para os próximos bairros</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl space-y-16">
          {schedule.map((item, index) => (
            <div
              key={item.title}
              className="grid gap-10 border border-white/10 bg-white/[0.03] p-6 md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/35">{item.time}</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>{item.title}</h3>
                <p className="mt-7 text-base font-light leading-9 text-white/62">{item.text}</p>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-28 text-center md:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Alpinea Special Tour</p>
          <h3 className={`${display.className} text-3xl font-medium text-white md:text-5xl`}>
            Uma viagem para colecionar melhor.
          </h3>
          <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-9 text-white/60">
            A Alpinea organiza o ritmo, as prioridades e a logística para que cada
            dia seja dedicado ao que realmente importa: encontrar cartas, comparar
            oportunidades e comprar com segurança.
          </p>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}
