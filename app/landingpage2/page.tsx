"use client";

import { useEffect, useState } from "react";

// Lightbox component
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-white/60 hover:text-white text-3xl leading-none"
        aria-label="Fechar"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded-[16px] object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accessCards = [
    {
      title: "Fukamachi",
      category: "Gastronomia · Tokyo",
      image: "/images/zezankyo.png",
    },
    {
      title: "Shunsuke",
      category: "Gastronomia · Tokyo",
      image: "/images/sushi-sho.png",
    },
    {
      title: "Sushi Arai",
      category: "Gastronomia · Tokyo",
      image: "/images/sushi-arai.png",
    },
    {
      title: "Aman Tokyo",
      category: "Hospedagem · Tokyo",
      image: "/images/aman-tokyo.png",
    },
    {
      title: "Niku Kappou Miyata",
      category: "Gastronomia · Osaka",
      image: "/images/nikufood.jpeg",
    },
    {
      title: "Ao",
      category: "Gastronomia · Tokyo",
      image: "/images/ao.png",
    },
  ];

  const tiers = [
    {
      label: "Orientação Estratégica",
      title: "Alpinea Design",
      description:
        "Para viajantes que desejam conduzir a própria viagem com uma base estratégica, elegante e bem construída.",
      highlights: [
        "Roteiro personalizado",
        "Curadoria de destino",
        "Opcionais: passagens, JR Pass, ingressos",
      ],
      note: "Sem reservas de restaurantes ou hotéis",
    },
    {
      label: "Planejamento Completo",
      title: "Alpinea Executive",
      description:
        "Para clientes que desejam planejamento completo, reservas, logística e organização antes da chegada ao Japão.",
      highlights: [
        "Roteiro + hotéis + passagens",
        "Reservas gastronômicas",
        "Concierge remoto durante a viagem",
      ],
      note: "Sem acompanhamento presencial",
      featured: false,
    },
    {
      label: "Acompanhamento Presencial",
      title: "Alpinea Private",
      description:
        "Para clientes que desejam execução dedicada no Japão, com presença local em restaurantes, compras e atrações.",
      highlights: [
        "Tudo do Executive",
        "Acompanhamento presencial em restaurantes",
        "Acompanhamento presencial para compras e atrações",
      ],
      note: "Máxima presença local",
      featured: true,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
      {/* HERO */}
      <section className="relative h-[50vh] min-h-[520px] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/higashiyama.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black" />

        {/* Header sem links de navegação */}
        <header
          className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-700 md:px-16 ${
            scrolled ? "bg-black/20 backdrop-blur-2xl" : "bg-transparent"
          }`}
        >
          <a href="/">
            <img
              src="/images/ALPINEA-LOGO-transparent.png"
              alt="Alpinea"
              className="h-8 w-auto object-contain"
            />
          </a>
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
            Solicitar atendimento
          </a>
        </div>
      </section>

      {/* POR QUE ESCOLHER A ALPINEA */}
      <section className="border-b border-white/10 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-16 text-xs uppercase tracking-[0.45em] text-white/40">
            Por que escolher a Alpinea
          </p>

          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                +12 anos
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                Além do idioma
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                A fluência no idioma combinada ao conhecimento dos principais nomes da gastronomia, artesanato e hotelaria japonesa.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                Referência na conexão Brasil–Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                Presença real no Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Nossa operação própria no Japão permite um atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
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
              Os grandes nomes da gastronomia japonesa não estão disponíveis em plataformas. Muitos não aceitam reservas em inglês e alguns só recebem clientes apresentados por relações construídas ao longo de anos.
            </p>

            <p>
              Os melhores produtos de cada categoria não fazem propaganda.
            </p>

            <p>
              Encontrar o hotel ideal exige mais do que reconhecer nomes famosos. Exige entender bairros, atmosferas e o estilo de viagem de cada cliente.
            </p>
          </div>
        </div>
      </section>

      {/* ACESSO REAL */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
                Acesso real
              </p>

              <h2 className="text-4xl font-light leading-tight md:text-6xl">
                Lugares que exigem relação pessoal para existir.
              </h2>
            </div>

            <p className="max-w-xl text-base font-light leading-8 text-white/60 md:text-lg">
              Não operamos por plataformas. Cada reserva, cada acesso, cada experiência abaixo vem de uma relação construída ao longo de anos.
            </p>
          </div>

          <div className="mt-20 grid gap-x-0 gap-y-0 border-t border-white/10 md:grid-cols-3">
            {accessCards.map((item) => (
              <div
                key={item.title}
                className="border-b border-white/10 py-10 md:px-8"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="mt-8 text-xs uppercase tracking-[0.35em] text-white/40">
                  {item.category}
                </p>

                <h3 className="mt-3 text-2xl font-light text-white">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROTEIRO SOB MEDIDA */}
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

      {/* EXECUÇÃO — entregáveis */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 max-w-5xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Execução
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Uma operação desenhada para transformar intenção em viagem executada.
            </h2>

            <p className="mt-8 max-w-3xl text-lg font-light leading-9 text-white/68">
              Do planejamento à presença local, a Alpinea organiza os detalhes que determinam a qualidade real de uma viagem de alto padrão no Japão.
            </p>
          </div>

          <p className="mb-10 text-xs uppercase tracking-[0.45em] text-white/30">
            O que o cliente recebe
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Roteiro privado",
                text: "Planejamento diário com logística, mapas, horários recomendados, contexto local e decisões práticas para cada etapa da viagem.",
                image: "/images/ss-roteiro.png",
              },
              {
                title: "Reservas gastronômicas",
                text: "Curadoria, solicitação, acompanhamento e organização de restaurantes conforme perfil, preferências e restrições do cliente.",
                image: "/images/ss-restaurantes.png",
              },
              {
                title: "Assessoria de compras",
                text: "Apoio na seleção, localização e aquisição de produtos japoneses de alto nível, incluindo itens artesanais e categorias especializadas.",
                image: "/images/ss-rcompras.png",
              },
            ].map((item) => (
              <div key={item.title} className="group">
                <div
                  className="overflow-hidden rounded-[26px] bg-white/[0.04] cursor-zoom-in relative"
                  onClick={() => setLightbox({ src: item.image, alt: item.title })}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                    />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/30">
                      <div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-8 text-xs uppercase tracking-[0.35em] text-white/40">
                  Entregável Alpinea
                </p>

                <h3 className="mt-3 text-2xl font-light text-white">
                  {item.title}
                </h3>

                <p className="mt-5 text-sm font-light leading-7 text-white/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS — 3 tiers compactos */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 grid gap-16 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
                Formatos de serviço
              </p>

              <h2 className="text-4xl font-light leading-tight md:text-6xl">
                Três níveis de presença. Uma mesma curadoria.
              </h2>
            </div>

            <p className="max-w-xl text-base font-light leading-8 text-white/60 md:text-lg">
              O nível de execução e acompanhamento varia conforme o formato escolhido. O padrão de curadoria, o conhecimento de destino e o acesso à rede local são os mesmos em todos.
            </p>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className={`flex flex-col px-10 py-12 ${
                  tier.featured ? "bg-white/[0.06]" : "bg-black"
                }`}
              >
                <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">
                  {tier.label}
                </p>

                <h3 className="text-2xl font-light text-white">
                  {tier.title}
                </h3>

                <p className="mt-5 text-sm font-light leading-7 text-white/55">
                  {tier.description}
                </p>

                <div className="mt-10 flex-1 space-y-3 border-t border-white/10 pt-10">
                  {tier.highlights.map((h) => (
                    <p key={h} className="text-sm font-light leading-6 text-white/70">
                      {h}
                    </p>
                  ))}
                </div>

                <p className="mt-8 text-xs text-white/30">{tier.note}</p>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* PRESENÇA DIGITAL */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="md:sticky md:top-24">
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
            <div className="overflow-hidden rounded-[24px] bg-white/5">
              <img
                src="/images/youtube-feed.png"
                alt="Feed do YouTube Alpinea Private"
                className="w-full object-cover object-top"
              />
            </div>

            <div className="overflow-hidden rounded-[24px] bg-white/5">
              <img
                src="/images/ss-ig.png"
                alt="Feed do Instagram Alpinea Private"
                className="w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
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

      {/* FOOTER */}
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
