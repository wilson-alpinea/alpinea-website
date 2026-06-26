"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
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

// Seta de "ver mais" para os carrosséis horizontais do mobile — some no desktop (md:hidden),
// já que lá o conteúdo é grid e não rola. Inclui fade lateral pra reforçar que há mais conteúdo.
function CarouselNextArrow({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const scrollNext = () => {
    const el = targetRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-black to-transparent md:hidden" />
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Ver mais"
        className="absolute bottom-4 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:bg-white/30 md:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  );
}

// Rastreia qual card está mais visível no carrossel, comparando a posição de scroll
// com a posição de cada filho — funciona mesmo com cards de larguras diferentes.
function useActiveSlide(targetRef: RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - el.scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActive(closest);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [targetRef]);

  return active;
}

// Bolinhas indicativas embaixo dos carrosséis horizontais — só no mobile (md:hidden),
// já que no desktop o conteúdo é grid e mostra tudo de uma vez, sem precisar de indicador.
function CarouselDots({ targetRef, count }: { targetRef: RefObject<HTMLDivElement | null>; count: number }) {
  const active = useActiveSlide(targetRef);

  const goTo = (i: number) => {
    const el = targetRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir para item ${i + 1}`}
          onClick={() => goTo(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === active
              ? "w-6 bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]"
              : "w-1.5 bg-white/25"
          }`}
        />
      ))}
    </div>
  );
}

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

  const statsScrollRef = useRef<HTMLDivElement>(null);
  const photosScrollRef = useRef<HTMLDivElement>(null);
  const deliverablesScrollRef = useRef<HTMLDivElement>(null);
  const tiersScrollRef = useRef<HTMLDivElement>(null);

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
      <section className="relative h-[50svh] min-h-[460px] overflow-hidden md:h-[max(50vh,28vw)] md:max-h-[900px] md:min-h-[520px]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/higashiyama.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />

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

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center md:justify-end md:pb-28">
          <h1 className={`${display.className} max-w-4xl text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl`}>
            Viagens privadas e concierge{" "}
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              de luxo no Japão.
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

        {/* Indicador de scroll — só no desktop; no mobile a tela já é curta o suficiente para não precisar do indicador */}
        <a
          href="#overview"
          aria-label="Rolar para o conteúdo"
          className="absolute inset-x-0 bottom-6 z-10 hidden justify-center md:flex"
        >
          <svg
            className="h-6 w-6 animate-bounce text-white/55 transition hover:text-white/90"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      </section>

      {/* EXECUÇÃO — entregáveis */}
      <section id="overview" className="border-b border-white/10 px-8 py-8 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-5xl md:mb-20">
            <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
              Uma operação desenhada para transformar intenção em viagem executada.
            </h2>

            <p className="mt-8 hidden max-w-3xl text-lg font-light leading-9 text-white/68 md:block">
              Do planejamento ao acompanhamento presencial, a Alpinea organiza os detalhes que determinam a qualidade real de uma viagem de alto padrão no Japão.
            </p>
          </div>

          {/* Foto de impacto — quebra a sequência de screenshots de produto com uma imagem real de experiência, antes de entrar na prova prática */}
          <div className="relative mb-10 aspect-[4/3] overflow-hidden rounded-[20px] md:mb-16 md:aspect-[16/9]">
            <Image
              src="/images/peninsula3.jpg"
              alt="Hospedagem de luxo no Japão"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/30 md:mb-10 md:tracking-[0.45em]">
            O que o cliente recebe
          </p>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={deliverablesScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
            >
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
              <div key={item.title} className="group w-[80vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
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
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] md:aspect-[4/5]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 80vw, 33vw"
                      className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                    />
                    {/* Zoom overlay — efeito hover, só faz sentido no desktop (mouse) */}
                    <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100 bg-black/30 md:flex">
                      <div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    </div>

                    {/* Badge de zoom sempre visível no mobile — touch não dispara :hover, então o indicador precisa estar sempre lá */}
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm md:hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="11" y1="8" x2="11" y2="14"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <CarouselNextArrow targetRef={deliverablesScrollRef} />
          </div>
          <CarouselDots targetRef={deliverablesScrollRef} count={3} />

          {/* Dashboard da viagem — produto digital. Escondido no mobile: complemento visual bonito mas não essencial pra gerar lead, custava uma tela cheia. */}
          <div className="hidden gap-10 border-t border-white/10 pt-10 md:mt-24 md:grid md:grid-cols-2 md:items-center md:gap-16 md:pt-20">
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

      {/* ROTEIRO SOB MEDIDA — escondido no mobile: a mensagem já está coberta pelo subtítulo do hero, e manter os 2 textos custava uma tela cheia de scroll */}
      <section className="hidden border-b border-white/10 px-8 py-10 md:block md:px-16 md:py-28">
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
      <section className="border-b border-white/10 px-8 py-8 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:mb-16 md:tracking-[0.45em]">
            Por que escolher a Alpinea
          </p>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={statsScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-12 md:overflow-visible md:px-0 md:pb-0"
            >
            <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                +12 anos
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.
              </p>
            </div>

            <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Exclusividade de Serviços
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Somos a única empresa que oferece ao público brasileiro curadoria de elite para gastronomia e consumo, incluso fluência no idioma para elevar as experiências.
              </p>
            </div>

            <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Referência na conexão Brasil–Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.
              </p>
            </div>

            <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
              <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
                Presença real no Japão
              </h3>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
                Nossa operação própria no Japão permite um atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.
              </p>
            </div>
            </div>
            <CarouselNextArrow targetRef={statsScrollRef} />
          </div>
          <CarouselDots targetRef={statsScrollRef} count={4} />
        </div>
      </section>

      {/* DIFERENCIAIS + ACESSO REAL — unified */}
      <section className="border-b border-white/10 px-8 pt-8 pb-6 md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">

          {/* Texto diferenciais */}
          <div className="mb-6 grid gap-10 md:mb-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
                Nossos diferenciais
              </p>
              <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
                Acesso, profundidade e execução no mercado de luxo japonês.
              </h2>
            </div>

            {/* Versão curta — só mobile */}
            <p className="text-base font-light leading-8 text-white/68 md:hidden">
              O acesso no Japão exige anos de relacionamento: os grandes nomes da gastronomia não estão em plataformas, e os melhores produtos não fazem propaganda.
            </p>

            {/* Versão completa — só desktop */}
            <div className="hidden space-y-10 text-lg font-light leading-9 text-white/68 md:block">
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

          {/* Fotos — carrossel no mobile, grid no desktop */}
          <div className="relative -mx-8 md:mx-0">
            <div
              ref={photosScrollRef}
              className="flex gap-4 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0"
            >
            {accessCards.map((item) => (
              <div key={item.title} className="w-[46vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
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
            <CarouselNextArrow targetRef={photosScrollRef} />
          </div>
          <CarouselDots targetRef={photosScrollRef} count={accessCards.length} />

          <p className="mt-6 hidden max-w-xl text-sm font-light leading-7 text-white/50 md:mt-14 md:block md:text-base md:leading-8">
            Não operamos por plataformas. Cada reserva, cada acesso, cada experiência acima vem de uma relação construída ao longo de anos.
          </p>
        </div>
      </section>

      {/* CONTATO INTERMEDIÁRIO — para quem já decidiu sem precisar rolar até o fim. Escondido no mobile: a barra fixa de CTA já cobre essa função, e duplicar custa uma tela cheia de scroll. */}
      <section className="hidden bg-white px-8 py-14 text-black md:block md:px-16 md:py-20">
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
      <section className="border-b border-white/10 px-8 py-8 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-10 md:mb-20 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-16">
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

              <p className="mt-6 hidden max-w-xl text-base font-light text-white/75 md:block md:text-lg">
                Para manter o padrão de atendimento, a Alpinea aceita um número limitado de novos clientes por temporada.
              </p>
            </div>
          </div>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={tiersScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0"
            >
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className={`flex w-[78vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col px-6 py-8 md:w-auto md:flex-shrink md:px-10 md:py-12 ${
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
            <CarouselNextArrow targetRef={tiersScrollRef} />
          </div>
          <CarouselDots targetRef={tiersScrollRef} count={tiers.length} />

        </div>
      </section>

      {/* PRESENÇA DIGITAL — escondida no mobile: links de Instagram/YouTube movidos pro rodapé para não perder o acesso, mas sem custar uma tela inteira */}
      <section className="hidden border-b border-white/10 px-8 py-10 md:block md:px-16 md:py-28">
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

          <div className="hidden flex-col gap-6 md:flex">
            <div className="overflow-hidden rounded-[24px] bg-white/5">
              <Image
                src="/images/youtube-feed.png"
                alt="Feed do YouTube Alpinea Private"
                width={1332}
                height={1181}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full object-cover object-top"
              />
            </div>

            <div className="overflow-hidden rounded-[24px] bg-white/5">
              <Image
                src="/images/ss-ig.png"
                alt="Feed do Instagram Alpinea Private"
                width={956}
                height={1646}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contact" className="bg-white px-8 py-14 text-black md:px-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-black/45 md:tracking-[0.45em]">
            Contato
          </p>

          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Comece sua jornada no Japão.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-black/60 md:mt-8 md:text-lg">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea cuidará do restante.
          </p>

          <p className="mt-4 text-sm font-light text-black/40 md:mt-6">
            Agenda limitada para o segundo semestre de 2026.
          </p>

          <ContactCTA className="mt-8 flex flex-col justify-center gap-4 md:mt-10 md:flex-row" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black px-8 pb-24 pt-12 text-white md:px-16 md:pb-16 md:pt-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-start md:gap-12">
          <div className="space-y-4 md:space-y-6">
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

            <a
              href="https://www.instagram.com/alpinea.private"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white md:hidden"
            >
              Instagram
            </a>

            <a
              href="https://www.youtube.com/@alpinea.private"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white md:hidden"
            >
              YouTube
            </a>
          </nav>
        </div>
      </footer>

      {/* CTA FIXO MOBILE — abre o formulário direto, sem rolar/redirecionar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-6 pt-3 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <ContactCTA
          mode="single"
          channel="email"
          label="Solicitar atendimento"
          className="block w-full"
          buttonClassName="block w-full border border-white/30 py-3 text-center text-xs uppercase tracking-[0.3em] text-white transition active:bg-white active:text-black"
        />
      </div>
    </main>
  );
}
