import Image from "next/image";

export const metadata = {
  title: "Alpinea | Viagens Privadas ao Japão",
  description:
    "Viagens privadas ao Japão com curadoria de restaurantes, hotéis, experiências, compras e suporte local.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>

        <a
          href="#contact"
          className="border border-white/25 px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
        >
          Solicitar Atendimento
        </a>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-8 py-32 md:px-16">
        <div className="absolute inset-0">
          <video
            src="/videos/japan-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/45">
            Private Japan Concierge
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-8xl">
            O Japão, vivido
            <br />
            com exclusividade.
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Viagens privadas ao Japão com curadoria de restaurantes, hotéis,
            experiências, compras e suporte local — desenhadas para clientes que
            esperam fluidez, acesso e precisão.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="w-fit bg-white px-8 py-4 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-white/85"
            >
              Solicitar Atendimento
            </a>

            <p className="text-xs uppercase tracking-[0.25em] text-white/35">
              Japão sob medida · Curadoria privada
            </p>
          </div>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
              O Diferencial
            </p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              O acesso começa antes da reserva.
            </h2>
          </div>

          <div className="space-y-7 text-lg font-light leading-9 text-white/65">
            <p>
              No Japão, as experiências mais especiais raramente estão
              disponíveis por busca online, plataformas ou concierge genérico.
            </p>

            <p>
              A Alpinea combina fluência no idioma, presença constante no país e
              uma rede construída ao longo de mais de uma década para transformar
              cada etapa da viagem em uma experiência sem barreiras.
            </p>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/35">
            O que organizamos
          </p>

          <h2 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl">
            Uma jornada completa, do primeiro planejamento ao último dia no Japão.
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <ServiceCard
              image="/images/sugita.png"
              title="Gastronomia"
              text="Curadoria e reservas nos restaurantes mais disputados do Japão, com seleção baseada em repertório real."
            />

            <ServiceCard
              image="/images/azumino.jpg"
              title="Viagem e Logística"
              text="Hotéis, transporte privado, ritmo diário, experiências, atrações e coordenação operacional."
            />

            <ServiceCard
              image="/images/blacksmith.png"
              title="Compras e Artesanato"
              text="Acesso a fabricantes, artesãos e produtos de elite — de facas japonesas a artigos de luxo."
            />
          </div>
        </div>
      </section>

      {/* PROVA */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/35">
              Método Alpinea
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Um roteiro que vai além de uma lista de lugares.
            </h2>

            <p className="mt-8 max-w-xl text-lg font-light leading-9 text-white/60">
              Cada jornada é construída considerando perfil, ritmo, hotéis,
              restaurantes, logística, mapas, horários e recomendações locais.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-8 md:p-10">
            {[
              "Perfil do viajante",
              "Ritmo ideal da viagem",
              "Hotéis e logística diária",
              "Reservas gastronômicas",
              "Compras e experiências",
              "Suporte local no Japão",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between border-b border-white/10 py-5 last:border-b-0"
              >
                <span className="text-sm font-light text-white/70">{item}</span>
                <span className="text-white/35">✓</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        id="contact"
        className="border-t border-white/10 bg-[#080706] px-8 py-32 text-center md:px-16"
      >
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/35">
            Atendimento Privado
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Comece sua jornada ao Japão.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-9 text-white/60">
            Conte-nos seu estilo de viagem e construiremos uma experiência
            personalizada para o seu perfil.
          </p>

          <a
            href="mailto:contact@alpinea.io"
            className="mt-12 inline-block bg-white px-9 py-4 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-white/85"
          >
            Solicitar Atendimento
          </a>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  image,
  title,
  text,
}: {
  image: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group overflow-hidden border border-white/10 bg-white/[0.03]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-light text-white">{title}</h3>
        <p className="mt-5 text-sm font-light leading-7 text-white/55">
          {text}
        </p>
      </div>
    </div>
  );
}