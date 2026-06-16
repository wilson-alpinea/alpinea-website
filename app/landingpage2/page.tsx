"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ── Lightbox overlay ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-6 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Visualização ampliada"
            className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
          <button
            className="absolute right-6 top-6 text-white/50 transition hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── 1. HERO ── */}
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
          <a href="/" className="text-xl tracking-[0.45em]">ALPINEA</a>
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

          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            O Japão que não aparece
            <br />
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              nos guias.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">
            Restaurantes impossíveis de encontrar, artesãos sem presença internacional, hotéis escolhidos pela experiência — não pelo nome.
          </p>

          <a
            href="#contact"
            className="mt-10 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </a>
        </div>
      </section>

      {/* ── 2. ESTRUTURA — credencial rápida, factual ── */}
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

      {/* ── 3. PROVA CONCRETA — nomes que o público reconhece ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.45em] text-white/40">
                Acesso real
              </p>
              <h2 className="max-w-xl text-4xl font-light leading-tight md:text-5xl">
                Lugares que exigem
                <br />relação pessoal para existir.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-7 text-white/50">
              Não operamos por plataformas. Cada reserva, cada acesso, cada experiência abaixo vem de uma relação construída ao longo de anos.
            </p>
          </div>

          {/* Grid de prova — restaurantes e hotéis reais */}
          <div className="grid gap-px bg-white/[0.06] md:grid-cols-3">
            {[
              {
                category: "Gastronomia · Tokyo",
                name: "Fukamachi",
                note: "Tempura omakase. Sem reservas externas. Lista de espera via relação direta.",
                img: "/images/proof-fukamachi.jpg",
              },
              {
                category: "Gastronomia · Tokyo",
                name: "Shunsuke",
                note: "Kaiseki contemporâneo. Não aceita reservas internacionais por plataformas.",
                img: "/images/proof-shunsuke.jpg",
              },
              {
                category: "Gastronomia · Tokyo",
                name: "Sushi Arai",
                note: "Sushi omakase de alto nível. Acesso apenas via indicação pessoal.",
                img: "/images/proof-sushi-arai.jpg",
              },
              {
                category: "Hospedagem · Tokyo",
                name: "Aman Tokyo",
                note: "Curadoria de acomodação e experiências exclusivas para hóspedes.",
                img: "/images/proof-aman-tokyo.jpg",
              },
              {
                category: "Hospedagem · Tokyo",
                name: "The Peninsula",
                note: "Seleção de suite, acesso a experiências e logística integrada ao roteiro.",
                img: "/images/proof-peninsula.jpg",
              },
              {
                category: "Gastronomia · Osaka",
                name: "Niku Kappou Miyata",
                note: "Wagyu kappo de altíssimo nível. Reserva somente via contato direto em japonês.",
                img: "/images/proof-miyata.jpg",
              },
            ].map((item) => (
              <div key={item.name} className="group relative overflow-hidden bg-black">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <p className="mb-1 text-xs uppercase tracking-[0.35em] text-white/40">
                    {item.category}
                  </p>
                  <h3 className="text-2xl font-light text-white">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-6 text-white/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DIFERENCIAIS — fecha o argumento do hero ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Por que é diferente
            </p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Acesso que não existe
              <br />em nenhuma plataforma.
            </h2>
          </div>

          <div className="space-y-10 text-lg font-light leading-9 text-white/68">
            <p>
              Os restaurantes que definem o topo da gastronomia japonesa não operam por plataformas, não respondem em inglês e não reservam para desconhecidos — nem mesmo para concierge de hotéis. Somente via relação pessoal.
            </p>
            <p>
              Os melhores artesãos e produtos de cada categoria não fazem propaganda. Encontrá-los exige presença, idioma e anos de relação construída.
            </p>
            <p>
              Encontrar o hotel certo para cada perfil exige mais que conhecer nomes famosos. Exige vivência real em cada propriedade.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. CTA INTERMEDIÁRIO ── */}
      <section className="border-b border-white/10 px-8 py-20 md:px-16">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-light leading-tight md:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mt-3 text-base font-light text-white/50">
              Compartilhe suas datas e perfil. A Alpinea estrutura o restante.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
            >
              Entrar em contato
            </a>
            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/10 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white/55 transition hover:border-white/30 hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── 6. EXECUÇÃO — screenshots com lightbox ── */}
      <section id="execucao" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-4xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              O produto
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
                className="group cursor-zoom-in"
                onClick={() => setLightbox(src)}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/5">
                  <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-[22px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/45">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ROTEIRO SOB MEDIDA ── */}
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

      {/* ── 8. PRESENÇA DIGITAL — vertical, sem labels ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="md:grid md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:items-start">
            <div className="mb-12 md:mb-0 md:sticky md:top-24">
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

            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-[22px] bg-white/5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                  <img
                    src="/images/youtube-feed.png"
                    alt="Feed do YouTube Alpinea Private"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="overflow-hidden rounded-[22px] bg-white/5">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[22px]">
                  <img
                    src="/images/ss-ig.png"
                    alt="Feed do Instagram Alpinea Private"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. CTA FINAL ── */}
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
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">Alpinea</p>
            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/50">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/25">
                <a href="/legal" className="transition hover:text-white/60">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/60">Política de Privacidade</a>
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
