import Image from "next/image";

export const metadata = {
  title: "Alpinea | Roteiros Personalizados para o Japão",
  description:
    "Roteiros personalizados para viajantes que buscam profundidade, conforto e experiências exclusivas no Japão.",
};

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">
            Início
          </a>
          <a href="/services" className="transition hover:text-white">
            Serviços
          </a>
          <a href="/preview" className="transition text-white">
            Roteiro
          </a>
          <a href="/preview#contact" className="transition hover:text-white">
            Contato
          </a>
        </nav>
      </header>

      <section className="relative min-h-[720px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <Image
          src="/images/ginzanonsen.jpg"
          alt="Ginzan Onsen"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Roteiro Alpinea
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Um exemplo real
            <br />
            de uma jornada Alpinea.
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Uma prévia simplificada da forma como estruturamos roteiros:
            contexto, ritmo, logística, atrações, horários recomendados,
            restaurantes e oportunidades de compras.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 text-xs uppercase tracking-[0.35em] text-white/40">
            Briefing da Jornada
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <BriefingCard title="Perfil" text="Casal sem filhos" />
            <BriefingCard title="Cidades" text="Tokyo, Osaka e Kyoto" />
            <BriefingCard title="Duração" text="15 dias" />
            <BriefingCard
              title="Ritmo"
              text="Tempo livre, com uma atração turística pela manhã e uma à tarde."
            />
            <BriefingCard title="Curadoria" text="Alpinea Design" />
            <BriefingCard
              title="Prioridades"
              text="Logística, gastronomia, compras e conforto durante a viagem."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">
              Dia 1
            </p>

            <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl">
              Tokyo
            </h2>

            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Chegada ao Japão, acomodação inicial e primeira experiência em
              Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo
              Solamachi.
            </p>

            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
                Hospedagem
              </p>

              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr_1fr] lg:items-center">
                <Image
                  src="/images/grandhyattlogo.png"
                  alt="Grand Hyatt Tokyo"
                  width={520}
                  height={260}
                  className="w-full max-w-xs object-contain"
                />

                <div>
                  <p className="text-3xl font-light text-white md:text-4xl">
                    Grand Hyatt Tokyo
                  </p>

                  <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-white/60">
                    6 Chome-10-3 Roppongi, Minato City, Tokyo 106-0032, Japão
                  </p>
                </div>

                <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                      Check-In
                    </p>
                    <p className="text-lg text-white">15:00</p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                      Código da Reserva
                    </p>
                    <p className="text-sm text-white/45">H7K9Q2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue mantendo a seção Manhã, Tarde, Restaurantes, Lojas e Contato iguais à versão atual */}

    </main>
  );
}

function BriefingCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-7">
      <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/35">
        {title}
      </p>
      <p className="text-lg font-light leading-8 text-white/75">{text}</p>
    </div>
  );
}