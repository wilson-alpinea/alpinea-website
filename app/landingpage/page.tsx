"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[50vh] min-h-[520px] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/higashiyama.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black" />

        <header
          className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-700 md:px-16 ${
            scrolled ? "bg-black/20 backdrop-blur-2xl" : "bg-transparent"
          }`}
        >
          <a href="/" className="text-xl tracking-[0.45em]">
            ALPINEA
          </a>

          <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
            <a href="/" className="transition hover:text-white">Início</a>
            <a href="/services" className="transition hover:text-white">Serviços</a>
            <a href="/gastro" className="transition hover:text-white">Restaurantes</a>
            <a href="/guia" className="transition hover:text-white">Compras</a>
            <a href="/preview" className="transition hover:text-white">Roteiro</a>
            <a href="#contact" className="transition hover:text-white">Contato</a>
          </nav>
        </header>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Viagens privadas e concierge no Japão
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Viva o Japão com
            <br />
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              exclusividade.
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-base font-light leading-8 text-white/72 md:text-lg">
            Restaurantes quase impossíveis de reservar, especialistas em compras raramente acessíveis ao público e experiências para quem deseja viver o máximo do Japão.
          </p>

          <a
            href="#contact"
            className="mt-10 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </a>
        </div>
      </section>

      <section className="border-b border-white/10 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-12 text-xs uppercase tracking-[0.45em] text-white/40">
            Estrutura Alpinea
          </p>

          <div className="grid gap-0 border-y border-white/10 md:grid-cols-4">
            {[
              {
                title: "+12 anos",
                text: "Vivência contínua no Japão, entre gastronomia, hotéis, cultura, logística e relações locais.",
              },
              {
                title: "Idioma japonês",
                text: "Comunicação direta com restaurantes, artesãos, hotéis e fornecedores locais.",
              },
              {
                title: "Brasil–Japão",
                text: "Experiência especializada em uma das rotas internacionais mais relevantes para o cliente brasileiro.",
              },
              {
                title: "Brasil · Japão",
                text: "Estrutura empresarial nos dois países, com operação desenhada para o mercado de luxo.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-white/10 py-10 md:border-r md:px-10 last:md:border-r-0"
              >
                <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Nossos diferenciais
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Acesso, profundidade e execução no mercado de luxo japonês.
            </h2>
          </div>

          <div className="space-y-10 text-lg font-light leading-9 text-white/68">
            <p>
              Os restaurantes que definem o topo da gastronomia japonesa não operam por plataformas, não respondem em inglês e não reservam para desconhecidos, nem mesmo para concierge de hotéis, somente via relação pessoal.
            </p>

            <p>
              Os melhores produtos de cada categoria não fazem propaganda.
            </p>

            <p>
              Encontrar os melhores hotéis para cada perfil exige mais que conhecer nomes e marcas famosas, exige vivência real.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Roteiro sob medida
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Um roteiro que vai além de uma lista genérica de lugares.
            </h2>
          </div>

          <div className="space-y-8 text-lg font-light leading-9 text-white/68">
            <p>
              A Alpinea desenha jornadas privadas no Japão com curadoria de hotéis, restaurantes, logística, compras, experiências e acompanhamento presencial quando necessário.
            </p>

            <p>
              Cada detalhe é pensado para reduzir ruído, antecipar problemas e transformar a viagem em uma experiência fluida, precisa e profundamente personalizada.
            </p>
          </div>
        </div>
      </section>

      <section id="execucao" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-4xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Execução
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Uma empresa moderna que entrega um nível de execução poucas vezes visto no mercado de luxo.
            </h2>

            <p className="mt-8 max-w-3xl text-lg font-light leading-9 text-white/68">
              Desde o roteiro até a assessoria presencial dedicada, tudo é pensado nos mínimos detalhes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["/images/ss-roteiro.png", "Roteiro privado"],
              ["/images/ss-restaurantes.png", "Reservas gastronômicas"],
              ["/images/ss-rcompras.png", "Assessoria de compras"],
            ].map(([src, title]) => (
              <div
                key={title}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/5">
                  <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <p className="mt-5 px-2 pb-2 text-xs uppercase tracking-[0.35em] text-white/45">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Presença digital
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Conheça mais sobre destinos, hotéis, restaurantes e atrações.
            </h2>

            <p className="mt-8 text-lg font-light leading-9 text-white/68">
              Acompanhe a Alpinea no Instagram e YouTube para ver uma leitura real do Japão: gastronomia, bairros, hotéis, experiências e bastidores de curadoria.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/alpinea.private"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white hover:text-white"
              >
                Instagram
              </a>

              <a
                href="https://www.youtube.com/@alpinea.private"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white hover:text-white"
              >
                YouTube
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white/5">
              <img
                src="/images/youtube-feed.png"
                alt="Feed do YouTube Alpinea Private"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white px-8 py-28 text-black md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-black/45">
            Contato
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Comece sua jornada no Japão.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-black/60 md:text-lg">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea cuidará do restante.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-4 md:flex-row">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-black px-10 py-5 text-xs uppercase tracking-[0.35em] transition hover:bg-black hover:text-white"
            >
              Entrar em contato
            </a>

            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/20 px-10 py-5 text-xs uppercase tracking-[0.35em] transition hover:border-black hover:bg-black hover:text-white"
            >
              Contato por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">
              Alpinea
            </p>

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

          <a
            href="mailto:wilson@alpinea.io"
            className="text-xs uppercase tracking-[0.35em] text-white/40 transition hover:text-white"
          >
            Contato
          </a>
        </div>
      </footer>
    </main>
  );
}