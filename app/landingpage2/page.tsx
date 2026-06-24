"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Display serif for large headline moments — pairs with the ALPINEA logotype.
// If it's not quite the match you're after, two easy swaps:
//   import { Playfair_Display as Bodoni_Moda } from "next/font/google";
//   import { Cormorant as Bodoni_Moda } from "next/font/google";
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
      title: "Sushi Arai",
      category: "Gastronomia · Tokyo",
      image: "/images/arai2.png",
      position: "object-center",
    },
    {
      title: "The Peninsula Tokyo",
      category: "Hospedagem · Tokyo",
      image: "/images/peninsula3.jpg",
      position: "object-center",
    },
    {
      title: "Niku Kappou Miyata",
      category: "Gastronomia · Osaka",
      image: "/images/nikufood.jpeg",
      position: "object-center",
    },
    {
      title: "Sazenka",
      category: "Gastronomia · Tokyo",
      image: "/images/sazenka2.png",
      position: "object-center",
    },
    {
      title: "Ao",
      category: "Gastronomia · Tokyo",
      image: "/images/ao2.png",
      position: "object-center",
    },
    {
      title: "Fukamachi",
      category: "Gastronomia · Tokyo",
      image: "/images/fukamachi2.png",
      position: "object-center",
    },
  ];

  const tiers = [
    {
      label: "Orientação Estratégica",
      title: "Alpinea Design",
      details: "Curadoria de destino, roteiro privado e recomendações estratégicas.",
    },
    {
      label: "Planejamento Completo",
      title: "Alpinea Executive",
      details: "Planejamento completo, hotéis, passagens, reservas gastronômicas e concierge remoto.",
      featured: false,
    },
    {
      label: "Acompanhamento Presencial",
      title: "Alpinea Private",
      details: "Inclui o Executive, com acompanhamento presencial em restaurantes, compras e experiências.",
      featured: true,
    },
  ];

  return (
    <main className="min-h-screen scroll-smooth bg-black text-white">
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
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/60 md:tracking-[0.5em]">
            Viagens privadas e concierge no Japão
          </p>

          <h1 className={`${display.className} max-w-5xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl`}>
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

      {/* ROTEIRO SOB MEDIDA */}
      <section className="border-b border-white/10 px-8 py-16 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
              A Jornada Alpinea
            </p>

            <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
              Uma curadoria muito além de uma lista genérica de lugares.
            </h2>
          </div>

          <div className="space-y-8 text-lg font-light leading-9 text-white/68">
            <p>
              Planejamos e executamos viagens privadas no Japão: hotéis, restaurantes, compras, logística, experiências e acompanhamento local quando necessário.
            </p>

            <p>
              Cada detalhe é pensado para reduzir ruído, antecipar problemas e transformar a viagem em uma experiência fluida, precisa e profundamente personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* POR QUE ESCOLHER A ALPINEA */}
      <section className="border-b border-white/10 px-8 py-14 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 text-xs uppercase tracking-[0.3em] text-white/40 md:mb-16 md:tracking-[0.45em]">
            Por que escolher a Alpinea
          </p>

          <div className="grid gap-10 md:grid-cols-4 md:gap-12">
            <div>
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                +12 anos
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.
              </p>
            </div>

            <div>
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Exclusividade de Serviços
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Somos a única empresa que oferece ao público brasileiro curadoria de elite para gastronomia e consumo, incluso fluência no idioma para elevar as experiências.
              </p>
            </div>

            <div>
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Referência na conexão Brasil–Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.
              </p>
            </div>

            <div>
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Presença real no Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Nossa operação própria no Japão permite um atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS + ACESSO REAL — unified */}
      <section className="border-b border-white/10 px-8 pt-16 pb-12 md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">

          {/* Texto diferenciais */}
          <div className="mb-12 grid gap-10 md:mb-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
                Nossos diferenciais
              </p>
              <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
                Acesso, profundidade e execução no mercado de luxo japonês.
              </h2>
            </div>

            <div className="space-y-6 text-base font-light leading-8 text-white/68 md:space-y-10 md:text-lg md:leading-9">
              <p>
                O acesso no Japão não é baseado somente em desejo e vontade de frequentar. Mais do que isso, são necessários anos de relacionamento com esses estabelecimentos.
              </p>
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

          {/* Fotos — 2 colunas no mobile para encurtar o scroll, 3 no desktop */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
            {accessCards.map((item) => (
              <div key={item.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-white/5 md:rounded-[22px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={`object-cover ${item.position}`}
                  />
                </div>
                <h3 className="mt-3 text-sm font-light text-white md:mt-5 md:text-xl">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-xl text-sm font-light leading-7 text-white/50 md:mt-14 md:text-base md:leading-8">
            Não operamos por plataformas. Cada reserva, cada acesso, cada experiência acima vem de uma relação construída ao longo de anos.
          </p>
        </div>
      </section>

      {/* EXECUÇÃO — entregáveis */}
      <section className="border-b border-white/10 px-8 py-16 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-5xl md:mb-20">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
              Execução
            </p>

            <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
              Uma operação desenhada para transformar intenção em viagem executada.
            </h2>

            <p className="mt-8 max-w-3xl text-lg font-light leading-9 text-white/68">
              Do planejamento ao acompanhamento presencial, a Alpinea organiza os detalhes que determinam a qualidade real de uma viagem de alto padrão no Japão.
            </p>
          </div>

          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/30 md:mb-10 md:tracking-[0.45em]">
            O que o cliente recebe
          </p>

          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
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
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Entregável Alpinea
                </p>

                <h3 className="mt-3 text-2xl font-light text-white">
                  {item.title}
                </h3>

                <p className="mt-5 text-sm font-light leading-7 text-white/55">
                  {item.text}
                </p>

                <div
                  className="mt-6 overflow-hidden rounded-[26px] bg-white/[0.04] cursor-zoom-in relative md:mt-8"
                  onClick={() => setLightbox({ src: item.image, alt: item.title })}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
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
              </div>
            ))}
          </div>

          {/* Dashboard da viagem — produto digital */}
          <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:mt-24 md:grid-cols-2 md:items-center md:gap-16 md:pt-20">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/30 md:tracking-[0.45em]">
                Acesso digital
              </p>

              <h3 className={`${display.className} text-3xl font-medium leading-tight text-white md:text-4xl`}>
                Sua viagem, organizada num só painel — acessível do celular, em qualquer lugar.
              </h3>

              <p className="mt-6 max-w-lg text-base font-light leading-8 text-white/65">
                Cada roteiro Alpinea inclui acesso a uma versão digital resumida do planejamento: roteiro diário, guias complementares e anexos especiais reunidos num dashboard simples de consultar durante a viagem — sem precisar abrir PDF ou planilha nenhuma.
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className="group relative w-[260px] cursor-zoom-in rounded-[44px] border border-white/15 bg-black p-4 shadow-2xl"
                onClick={() =>
                  setLightbox({
                    src: "/images/dashmobile.jpg",
                    alt: "Dashboard de viagem Alpinea, acessado pelo celular",
                  })
                }
              >
                <div className="absolute left-1/2 top-6 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                <div className="relative aspect-[1320/2257] w-full overflow-hidden rounded-[30px] bg-black">
                  <Image
                    src="/images/dashmobile.jpg"
                    alt="Dashboard de viagem Alpinea, acessado pelo celular"
                    fill
                    sizes="260px"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Zoom overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO INTERMEDIÁRIO — para quem já decidiu sem precisar rolar até o fim */}
      <section className="bg-white px-8 py-14 text-black md:px-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-black/40 md:tracking-[0.45em]">
            Fale com a Alpinea
          </p>

          <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
            Comece sua jornada privada no Japão.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/55 md:text-base">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea desenha o caminho.
          </p>

          <ContactCTA className="mt-9 flex flex-col justify-center gap-4 md:flex-row" />
        </div>
      </section>

      {/* SERVIÇOS — 3 tiers compactos */}
      <section className="border-b border-white/10 px-8 py-16 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-10 md:mb-20 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-16">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
                Formatos de serviço
              </p>

              <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
                Três níveis de presença. Uma mesma curadoria.
              </h2>
            </div>

            <div>
              <p className="max-w-xl text-base font-light leading-8 text-white/60 md:text-lg">
                O nível de execução e acompanhamento varia conforme o formato escolhido. O padrão de curadoria, o conhecimento de destino e o acesso à rede local são os mesmos em todos.
              </p>

              <p className="mt-6 max-w-xl text-base font-light text-white/75 md:text-lg">
                Para manter o padrão de atendimento, a Alpinea aceita um número limitado de novos clientes por temporada.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className={`flex flex-col px-6 py-8 md:px-10 md:py-12 ${
                  tier.featured ? "bg-white/[0.06]" : "bg-black"
                }`}
              >
                <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">
                  {tier.label}
                </p>

                <h3 className="text-2xl font-light text-white">
                  {tier.title}
                </h3>

                <p className="mt-6 text-sm font-light leading-7 text-white/55">
                  {tier.details}
                </p>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* PRESENÇA DIGITAL */}
      <section className="border-b border-white/10 px-8 py-16 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-16">
          <div className="md:sticky md:top-24">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
              Presença digital
            </p>

            <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
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
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="overflow-hidden rounded-[24px] bg-white/5">
              <img
                src="/images/ss-ig.png"
                alt="Feed do Instagram Alpinea Private"
                className="w-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contact" className="bg-white px-8 py-20 text-black md:px-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-black/45 md:tracking-[0.45em]">
            Contato
          </p>

          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Comece sua jornada no Japão.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-black/60 md:text-lg">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea cuidará do restante.
          </p>

          <p className="mt-6 text-sm font-light text-black/40">
            Agenda limitada para o segundo semestre de 2026.
          </p>

          <ContactCTA className="mt-10 flex flex-col justify-center gap-4 md:flex-row" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black px-8 pb-28 pt-16 text-white md:px-16 md:pb-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-start">
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

          <nav className="flex flex-col gap-3 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="/" className="transition hover:text-white">
              Início
            </a>

            <a href="/services" className="transition hover:text-white">
              Serviços
            </a>

            <a href="/gastro" className="transition hover:text-white">
              Restaurantes
            </a>

            <a href="/guia" className="transition hover:text-white">
              Compras
            </a>

            <a href="/preview" className="transition hover:text-white">
              Roteiro
            </a>

            <a href="#contact" className="transition hover:text-white">
              Contato
            </a>
          </nav>
        </div>
      </footer>

      {/* CTA FIXO MOBILE — mantém a conversão sempre a 1 toque, mesmo após rolar 10+ seções */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-6 pt-3 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <a
          href="#contact"
          className="block w-full border border-white/30 py-3 text-center text-xs uppercase tracking-[0.3em] text-white transition active:bg-white active:text-black"
        >
          Solicitar atendimento
        </a>
      </div>
    </main>
  );
}
