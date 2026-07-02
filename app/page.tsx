"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ContactCTA } from "./components/ContactCTA";
import { Bodoni_Moda } from "next/font/google";

// Mesma fonte de destaque usada na landing page e na página de Serviços —
// mantém a identidade visual consistente entre as páginas do site.
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


export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const statsScrollRef = useRef<HTMLDivElement>(null);
  const tiersScrollRef = useRef<HTMLDivElement>(null);

  const tiers = [
    {
      label: "Orientação Estratégica",
      title: "Roteiro Personalizado",
      details: "Curadoria de destino, roteiro privado e recomendações estratégicas.",
      highlighted: true,
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);



  return (
    <main className="min-h-screen bg-black text-white">
  <section className="relative h-[50svh] min-h-[460px] overflow-hidden md:h-[max(50vh,28vw)] md:max-h-[900px] md:min-h-[520px]">
    <img
      src="/images/nachifalls2.png"
      alt="Templo Seiganto-ji e Cachoeira Nachi, Japão"
      className="absolute inset-0 h-full w-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black" />

<header
  className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 md:px-16 transition-all duration-700 ${
    scrolled
      ? "bg-black/10 backdrop-blur-2xl"
      : "bg-transparent"
  }`}
>
  <a href="/">
    <img
      src="/images/ALPINEA-LOGO-transparent.png"
      alt="Alpinea"
      className="h-8 w-auto object-contain"
    />
  </a>

  <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
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
</header>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center md:justify-end md:pb-24">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] md:tracking-[0.35em]">
            A Única Agência Brasileira 100% Dedicada ao Japão
          </p>

          <h1 className={`${display.className} max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-white md:text-5xl`}>
            Viagens privadas e{" "}
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              roteiros sob medida
            </span>{" "}
            para conhecer o verdadeiro Japão.
          </h1>

          <a
            href="#contact"
            className="mt-8 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </a>
        </div>

        {/* Indicador de scroll */}
        <a
          href="#experiences"
          aria-label="Rolar para o conteúdo"
          className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
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

<section id="experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  <div className="mx-auto max-w-7xl">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/40">
      EXPERIÊNCIAS PERSONALIZADAS
    </p>

    <h2 className={`${display.className} max-w-4xl text-2xl font-medium leading-tight tracking-tight md:text-4xl`}>
      Tudo o que transforma uma viagem comum em uma jornada exclusiva.
    </h2>

    <p className="mt-5 max-w-2xl text-base font-light leading-8 text-white/55 md:text-lg">
      Gastronomia, hotéis, compras, experiências e um roteiro planejado em cada detalhe.
    </p>

    <div className="mt-24 grid gap-x-8 gap-y-14 md:grid-cols-2">

      {/* ALTA GASTRONOMIA */}
      <a href="/gastro" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/sugita.png"
            alt="Alta Gastronomia"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />
        </div>

        <h3 className="mt-6 text-2xl font-light tracking-tight text-white md:text-3xl">
          Alta Gastronomia
        </h3>

        <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
          Reservas em restaurantes estrelados e endereços que raramente aceitam turistas estrangeiros.
        </p>
      </a>

      {/* ARTIGOS DE LUXO */}
      <a href="/guia" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/rolex.png"
            alt="Artigos de Luxo"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />
        </div>

        <h3 className="mt-6 text-2xl font-light tracking-tight text-white md:text-3xl">
          Artigos de Luxo
        </h3>

        <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
          Acesso a boutiques, relógios e itens colecionáveis difíceis de encontrar fora do Japão.
        </p>
      </a>

      {/* EXPERIÊNCIAS */}
      <a href="/roteiros" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/fuji.JPG"
            alt="Experiências"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />
        </div>

        <h3 className="mt-6 text-2xl font-light tracking-tight text-white md:text-3xl">
          Experiências
        </h3>

        <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
          Roteiros culturais e naturais desenhados além dos pontos turísticos óbvios.
        </p>
      </a>

      {/* EVENTOS ESPECIAIS */}
      <a href="/lua-de-mel" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/intimiact.png"
            alt="Eventos Especiais"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />
        </div>

        <h3 className="mt-6 text-2xl font-light tracking-tight text-white md:text-3xl">
          Eventos Especiais
        </h3>

        <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
          Viagens para ocasiões marcantes — lua de mel, aniversários, a Maratona de Tóquio e outros eventos que merecem uma jornada à altura.
        </p>
      </a>

    </div>
  </div>
</section>

{/* POR QUE ESCOLHER A ALPINEA */}
<section className="border-y border-white/10 px-8 py-20 md:px-16 md:py-24">
  <div className="mx-auto max-w-7xl">
    <p className="mb-10 text-xs uppercase tracking-[0.3em] text-white/40 md:mb-16 md:tracking-[0.45em]">
      Por que escolher a Alpinea
    </p>

    <div className="relative -mx-8 md:mx-0">
      <div
        ref={statsScrollRef}
        className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-12 md:overflow-visible md:px-0 md:pb-0"
      >
        <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
          <svg className="mb-5 h-7 w-7 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
            +12 anos
          </h3>
          <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
            Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.
          </p>
        </div>

        <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
          <svg className="mb-5 h-7 w-7 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M2 9h20" />
            <path d="M9 3l3 6-3 12" />
            <path d="M15 3l-3 6 3 12" />
          </svg>
          <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
            Exclusividade de Serviços
          </h3>
          <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
            Somos a única empresa que oferece ao público brasileiro curadoria de elite para gastronomia e consumo, incluso fluência no idioma para elevar as experiências.
          </p>
        </div>

        <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
          <svg className="mb-5 h-7 w-7 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
          <h3 className={`${display.className} text-2xl font-medium tracking-tight text-white md:text-3xl`}>
            Referência na conexão Brasil–Japão
          </h3>
          <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">
            Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.
          </p>
        </div>

        <div className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink">
          <svg className="mb-5 h-7 w-7 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
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

{/* FORMATOS DE SERVIÇO — 3 tiers compactos */}
<section className="px-8 py-20 md:px-16 md:py-28">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10 grid gap-10 md:mb-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16">
      {/* Foto — só no desktop, preenche o espaço vazio ao lado do texto */}
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[20px] md:block">
        <img
          src="/images/niseko4.png"
          alt="Hospedagem de luxo com vista para o Monte Yotei, em Niseko"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div>
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45 md:tracking-[0.45em]">
        Formatos de serviço
      </p>

      <h2 className={`${display.className} max-w-2xl text-4xl font-medium leading-tight md:text-5xl`}>
        Três níveis de presença. Uma mesma curadoria.
      </h2>

      <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/60 md:text-lg">
        O nível de execução e acompanhamento varia conforme o formato escolhido. O padrão de curadoria, o conhecimento de destino e o acesso à rede local são os mesmos em todos.
      </p>

      <p className="mt-6 hidden max-w-xl rounded-full border border-white/20 px-6 py-3 text-center text-xs uppercase tracking-[0.25em] text-white/70 md:block md:tracking-[0.3em]">
        Para manter o padrão de atendimento, a Alpinea aceita um número limitado de novos clientes por temporada.
      </p>
      </div>
    </div>

    <div className="relative -mx-8 md:mx-0">
      <div
        ref={tiersScrollRef}
        className="flex gap-6 overflow-x-auto px-8 pt-4 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pt-0 md:pb-0"
      >
        {tiers.map((tier) => (
          <div
            key={tier.title}
            className={`relative flex w-[78vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col rounded-[20px] border px-6 py-8 md:w-auto md:flex-shrink md:px-10 md:py-12 ${
              tier.highlighted
                ? "border-white/15 bg-white/[0.06]"
                : "border-white/10 bg-black"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] px-4 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-black">
                Mais completo
              </span>
            )}

            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">
              {tier.label}
            </p>

            <h3 className="text-2xl font-light text-white md:text-3xl">
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

      <section
  id="concierge"
  className="relative overflow-hidden bg-black px-6 py-40 text-white md:px-16"
>
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/shira.png"
      alt="Shirakawa-go"
      className="h-full w-full object-cover opacity-35"
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/70" />

    {/* Bottom Fade */}
    <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black" />
  </div>

  {/* Content */}
  <div className="relative z-10 mx-auto max-w-5xl text-center">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/55">
      Sua Experiência Alpinea
    </p>

    <h2 className={`${display.className} text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl`}>
      Faça o Japão parecer
      <br />
      exclusivamente seu.
    </h2>

    <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-white/70">
      Pensado para viajantes que não procuram pacotes turísticos,
      mas acesso, repertório, precisão e execução impecável.
    </p>

    <p className="mx-auto mt-8 max-w-2xl text-sm font-light text-white/40">
      Para manter o padrão de atendimento, a Alpinea aceita um número limitado de novos clientes por temporada.
    </p>
  </div>
</section>

      <section
  id="contact"
  className="bg-white px-6 py-28 text-black md:px-16"
>
  <div className="mx-auto max-w-4xl text-center">
    <p className="mb-6 text-xs uppercase tracking-[0.4em] text-black/40">
      Contato
    </p>

    <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
      Comece sua jornada no Japão.
    </h2>

    <p className="mx-auto mt-6 max-w-xl text-black/60">
      Compartilhe suas datas, preferências e estilo de viagem.
      A Alpinea cuidará do restante.
    </p>

    <p className="mt-6 text-sm font-light text-black/40">
      Agenda limitada para o segundo semestre de 2026.
    </p>

    <ContactCTA className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" />
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
          <a
            href="/legal"
            className="transition hover:text-white/60"
          >
            Termos e Condições
          </a>

          <span>·</span>

          <a
            href="/privacy"
            className="transition hover:text-white/60"
          >
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
