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

      {/* HERO — compacto, above the fold, vídeo visível */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden px-8 pb-16 md:px-16 md:pb-24">
        <div className="absolute inset-0">
          <video
            src="/videos/japan-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">
            Private Japan Concierge
          </p>

          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            O acesso ao Japão
            <br />
            que não existe em
            <br />
            guia nenhum.
          </h1>

          <p className="mt-8 max-w-xl text-base font-light leading-8 text-white/60">
            Restaurantes impossíveis de reservar. Artesãos sem canal público.
            Experiências que só existem com uma década de relações locais.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="w-fit bg-white px-8 py-4 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-white/85"
            >
              Solicitar Atendimento
            </a>
          </div>
        </div>
      </section>

      {/* NÚMEROS — prova rápida */}
      <section className="border-t border-white/10 px-8 py-16 md:px-16">
        <div className="mx-auto max-w-7xl grid grid-cols-3 gap-px border border-white/10">
          <div className="bg-white/[0.03] px-8 py-10">
            <p className="text-4xl font-light text-white">+12</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/35">anos no Japão</p>
          </div>
          <div className="bg-white/[0.03] px-8 py-10">
            <p className="text-4xl font-light text-white">+40</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/35">restaurantes visitados</p>
          </div>
          <div className="bg-white/[0.03] px-8 py-10">
            <p className="text-4xl font-light text-white">100%</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/35">acesso direto</p>
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
            <h2 className="text-4xl font-light leading-tight md:text-5xl">
              O acesso começa
              <br />
              antes da reserva.
            </h2>
          </div>

          <div className="space-y-6 text-base font-light leading-9 text-white/60">
            <p>
              Os restaurantes que definem o topo da gastronomia japonesa não operam
              por plataformas, não respondem em inglês e não reservam para
              desconhecidos.
            </p>
            <p>
              A Alpinea combina fluência no idioma, presença constante no país e
              uma rede construída ao longo de mais de uma década — para transformar
              cada etapa da viagem em uma experiência sem barreiras.
            </p>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
            O que organizamos
          </p>

          <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-5xl">
            Uma jornada completa,
            do primeiro contato ao último dia.
          </h2>

          <div className="mt-16 grid gap-px md:grid-cols-3">
            <ServiceCard
              image="/images/sugita.png"
              title="Gastronomia"
              text="Reservas nos restaurantes mais disputados do Japão — com seleção baseada em repertório real, não em rankings."
            />
            <ServiceCard
              image="/images/azumino.jpg"
              title="Viagem e Logística"
              text="Hotéis, transporte privado, ritmo diário e coordenação operacional impecável do início ao fim."
            />
            <ServiceCard
              image="/images/blacksmith.png"
              title="Compras e Artesanato"
              text="Acesso direto a fabricantes, artesãos e produtos de elite — de facas japonesas a artigos de luxo sem canal público."
            />
          </div>
        </div>
      </section>

      {/* MÉTODO */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
              Método Alpinea
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-5xl">
              Um roteiro que vai
              <br />
              além de uma lista
              <br />
              de lugares.
            </h2>

            <p className="mt-8 max-w-md text-base font-light leading-8 text-white/50">
              Cada jornada é construída considerando perfil, ritmo e intenção —
              não um pacote adaptado.
            </p>
          </div>

          {/* Checklist com estética luxury */}
          <div className="space-y-0">
            {[
              ["01", "Perfil do viajante"],
              ["02", "Ritmo ideal da viagem"],
              ["03", "Hotéis e logística diária"],
              ["04", "Reservas gastronômicas"],
              ["05", "Compras e experiências"],
              ["06", "Suporte local no Japão"],
            ].map(([num, item]) => (
              <div
                key={item}
                className="grid grid-cols-[48px_1fr] items-center border-t border-white/10 py-6 last:border-b last:border-white/10"
              >
                <span className="text-xs tabular-nums text-white/20">{num}</span>
                <span className="text-sm font-light text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        id="contact"
        className="border-t border-white/10 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/35">
            Atendimento Privado
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Comece sua jornada ao Japão.
          </h2>

          <p className="mx-auto mt-8 max-w-xl text-base font-light leading-8 text-black/50">
            Compartilhe suas datas e preferências.
            A Alpinea cuida do restante.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
            >
              Entrar em Contato
            </a>
            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/15 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/50 transition hover:border-black hover:text-black"
            >
              Contato por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-12 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.45em] text-white/60">Alpinea</p>
            <p className="text-xs text-white/25">
              © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
            </p>
            <div className="flex gap-3 text-xs text-white/20">
              <a href="/legal" className="transition hover:text-white/50">Termos</a>
              <span>·</span>
              <a href="/privacy" className="transition hover:text-white/50">Privacidade</a>
            </div>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-[0.25em] text-white/35">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
          </div>
        </div>
      </footer>
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
    <div className="group overflow-hidden bg-white/[0.03] border border-white/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="p-8">
        <h3 className="text-xl font-light text-white">{title}</h3>
        <p className="mt-4 text-sm font-light leading-7 text-white/50">
          {text}
        </p>
      </div>
    </div>
  );
}
