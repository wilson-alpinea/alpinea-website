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

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Seta de "ver mais" para os carrosséis horizontais do mobile.
function CarouselNextArrow({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const scrollNext = () => {
    const el = targetRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent md:hidden" />
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Ver mais"
        className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:bg-white/30 md:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  );
}

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

export default function LuaDeMelLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const whyJapanScrollRef = useRef<HTMLDivElement>(null);
  const whyAlpineaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whyJapan = [
    {
      title: "Intimidade",
      text: "Ryokans com onsen privativo, jantares reservados só para dois e hospedagens onde a presença de outros hóspedes é a exceção, não a regra.",
      image: "/images/intimiact.png",
      alt: "Casal sentado em um deck de madeira observando o mar",
    },
    {
      title: "Exclusividade",
      text: "Acesso a endereços que não aparecem em roteiros comuns — mesas, hotéis e experiências reservadas a poucos casais por ano.",
      image: "/images/exclusividade2.png",
      alt: "Rolls-Royce na entrada de um hotel de luxo",
    },
    {
      title: "Alta gastronomia",
      text: "Balcões de sushi com uma única fileira de lugares e menus degustação assinados por chefs que raramente recebem estrangeiros.",
      image: "/images/saitou.png",
      alt: "Nigiri de atum premium servido em balcão japonês",
    },
    {
      title: "Serenidade",
      text: "Jardins, montanhas e templos vividos em ritmo próprio, sem filas, sem pressa — o silêncio como parte do luxo.",
      image: "/images/serenity.png",
      alt: "Rio de águas turquesa cercado por montanhas japonesas",
    },
  ];

  const honeymoonJourney = [
    {
      title: "Imaginem chegar ao Japão sabendo exatamente onde vale a pena estar.",
      text: "Não porque alguém decidiu por vocês, mas porque cada escolha foi construída com base em anos vivendo o país.",
      image: "/images/amanemu.png",
      alt: "Vista de um ryokan de luxo ao entardecer, com mesa de chá voltada para a baía",
    },
    {
      title: "Na lua de mel, tempo é precioso — e cada escolha tem um motivo.",
      text: "Cada manhã, restaurante e deslocamento já fazem parte de uma jornada pensada para o ritmo de vocês dois.",
      image: "/images/mizukaze.jpg",
      alt: "Trem de luxo japonês percorrendo a costa entre o mar e as montanhas",
    },
    {
      title: "Um roteiro que elimina decisões.",
      text: "Vocês não vão passar horas pesquisando o que fazer no dia seguinte. Cada dia já foi pensado para equilibrar descobertas, descanso e experiência.",
      image: "/images/fuji.JPG",
      alt: "Monte Fuji ao entardecer refletido no lago",
    },
  ];

  const whyAlpinea = [
    {
      title: "+12 anos no Japão",
      text: "Mais de uma década de relações locais — o tipo de acesso que não se compra, se constrói.",
    },
    {
      title: "Presença real, sem intermediários",
      text: "Operação própria no Japão, com atendimento direto e conhecimento de bairros, hotéis e restaurantes fora do óbvio — sem terceirizar sua viagem, e sem expor os detalhes dela.",
    },
    {
      title: "Lua de mel no Japão por especialistas",
      text: "Nada de empresas que oferecem lua de mel para centenas de destinos com baixo conhecimento e roteiros genéricos — somos 100% dedicados ao Japão para o público brasileiro.",
    },
    {
      title: "Referência na conexão Brasil–Japão",
      text: "Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.",
    },
  ];

  return (
    <main className="min-h-screen scroll-smooth overflow-x-hidden bg-black text-white">
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* 1. HERO */}
      <section className="relative h-[58svh] min-h-[500px] overflow-hidden md:h-[max(60vh,32vw)] md:max-h-[920px] md:min-h-[560px]">
        <Image
          src="/images/lua-de-mel-hero.png"
          alt="Casal de mãos dadas sob as cerejeiras em flor no Japão"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />

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

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-32 text-center md:justify-end md:pb-28">
          <p className={`${display.className} mb-3 text-xs uppercase tracking-[0.3em] text-white/75 md:mb-7 md:text-base md:tracking-[0.5em]`}>
            Lua de Mel no Japão
          </p>

          <h1 className={`${display.className} max-w-full text-xl font-medium leading-[1.25] tracking-tight md:max-w-4xl md:text-6xl`}>
            O começo da próxima história de vocês merece{" "}
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              uma viagem inesquecível.
            </span>
          </h1>

          <p className="mt-3 text-[11px] font-light text-white/45 md:mt-8 md:text-sm">
            Agenda limitada para o segundo semestre de 2026.
          </p>
        </div>

        <a
          href="#por-que-japao"
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

      {/* 2. POR QUE JAPÃO PARA A LUA DE MEL */}
      <section id="por-que-japao" className="border-b border-white/10 px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl md:mb-16">
            <h2 className={`${display.className} text-2xl font-medium leading-snug md:text-4xl`}>
              Não existe segunda chance para uma primeira lua de mel.
            </h2>

            <p className="mt-5 max-w-none text-base font-light leading-8 text-white/60 md:mt-7 md:text-lg md:leading-9">
              Sua única responsabilidade será desfrutar da companhia um do outro. Reserva de hotéis, alta gastronomia, logística e conexões exclusivas: nossa operação desenha o invisível para que sua experiência seja impecável.
            </p>
          </div>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={whyJapanScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-10 md:overflow-visible md:px-0 md:pb-0"
            >
              {whyJapan.map((item) => (
                <div
                  key={item.title}
                  className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] md:w-auto md:flex-shrink"
                >
                  <div className="relative mb-6 aspect-square overflow-hidden rounded-[16px]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 72vw, 25vw"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="border-t border-white/15 pt-6">
                    <h3 className={`${display.className} text-lg font-medium text-white md:text-xl`}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm font-light leading-7 text-white/50">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <CarouselNextArrow targetRef={whyJapanScrollRef} />
          </div>
          <CarouselDots targetRef={whyJapanScrollRef} count={whyJapan.length} />
        </div>
      </section>

      {/* 3. COMO SERÁ A LUA DE MEL DE VOCÊS */}
      <section className="border-b border-white/10">
        {/* Banner — imagem isolada, sem sobreposição de texto */}
        <div className="relative h-[220px] w-full overflow-hidden md:h-[420px]">
          <Image
            src="/images/osaka-castle.png"
            alt="Castelo de Osaka iluminado ao entardecer"
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/70 to-black" />

          <div className="absolute inset-0 flex items-center justify-center">
            <ContactCTA
              mode="single"
              channel="email"
              label="Entrar em Contato"
              buttonClassName="bg-white px-10 py-4 text-sm uppercase tracking-[0.35em] text-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition hover:bg-white/90 md:px-12 md:py-5 md:text-base"
            />
          </div>
        </div>

        <div className="px-8 pb-14 pt-10 md:px-16 md:pb-28 md:pt-16">
          <div className="mx-auto max-w-7xl">
            <h2 className={`${display.className} mb-10 max-w-3xl text-3xl font-medium leading-tight text-white md:mb-20 md:text-5xl`}>
              Como será a lua de mel de vocês
            </h2>

            <div className="space-y-10 md:space-y-14">
              {honeymoonJourney.map((item) => (
                <div
                  key={item.title}
                  className="grid gap-6 border-t border-white/10 pt-8 md:grid-cols-2 md:items-center md:gap-16 md:pt-0 md:border-t-0"
                >
                  <div>
                    <h3 className={`${display.className} text-xl font-medium leading-tight text-white md:text-3xl`}>
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm font-light leading-7 text-white/60 md:mt-5 md:text-base md:leading-8">
                      {item.text}
                    </p>

                    <div className="mt-6 flex max-w-md justify-center md:mt-8">
                      <svg
                        className="h-8 w-8 animate-bounce text-white/35"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROVA REAL — a curadoria em ação */}
      <section className="border-b border-white/10 bg-[#050505] px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 text-xs uppercase tracking-[0.3em] text-white/30 md:mb-16 md:tracking-[0.45em]">
            Cada detalhe da viagem, disponível no celular.
          </p>

          {/* Dashboard da viagem */}
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div>
              <h3 className={`${display.className} text-3xl font-medium leading-tight text-white md:text-4xl`}>
                Um roteiro pensado para dois, do primeiro ao último dia.
              </h3>

              <p className="mt-6 max-w-lg text-base font-light leading-8 text-white/65">
                Tokyo, Hakone, Kyoto — ou o caminho que fizer sentido para vocês. Cada roteiro Alpinea inclui acesso a um dashboard digital com o planejamento diário, guias complementares e reservas organizadas, consultável do celular a qualquer momento da viagem.
              </p>
            </div>

            <div className="relative isolate flex justify-center">
              {/* Glow ambiente atrás do celular */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[125%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] opacity-70 blur-[100px]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(25,70,150,0.20) 0%, rgba(16,42,108,0.14) 36%, rgba(9,18,46,0.08) 55%, transparent 76%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[112%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] opacity-45 blur-[32px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(75,42,128,0.18), rgba(20,68,145,0.22) 48%, rgba(0,0,0,0) 78%)",
                }}
              />

              <div
                className="group relative z-10 w-[260px] cursor-zoom-in rounded-[44px] border border-white/15 bg-black p-4 shadow-2xl"
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

      {/* 5. POR QUE A ALPINEA */}
      <section className="border-b border-white/10 px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl md:mb-16">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Por que a Alpinea
            </p>
            <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
              O acesso no Japão não se compra. Se constrói ao longo de anos.
            </h2>
          </div>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={whyAlpineaScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-10 md:overflow-visible md:px-0 md:pb-0"
            >
              {whyAlpinea.map((item) => (
                <div
                  key={item.title}
                  className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] border-t border-white/15 pt-6 md:w-auto md:flex-shrink"
                >
                  <h3 className={`${display.className} text-lg font-medium text-white md:text-xl`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-7 text-white/50">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
            <CarouselNextArrow targetRef={whyAlpineaScrollRef} />
          </div>
          <CarouselDots targetRef={whyAlpineaScrollRef} count={whyAlpinea.length} />
        </div>
      </section>

      {/* PONTE — frase de efeito antes do CTA final */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden border-b border-white/10 px-8 py-24 md:min-h-[560px] md:px-16 md:py-40">
        <Image
          src="/images/shirakawago.jpg"
          alt="Vilarejo histórico de Shirakawa-go entre montanhas verdes"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />

        <p className={`${display.className} relative z-10 mx-auto max-w-3xl text-center text-2xl italic font-light leading-snug text-white/90 md:text-4xl`}>
          "Algumas viagens não ficam só na memória — viram parte da história de vocês."
        </p>
      </section>

      {/* 6. CONTATO */}
      <section id="contact" className="bg-white px-8 py-14 text-black md:px-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-black/45 md:tracking-[0.45em]">
            Contato
          </p>

          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Comece a lua de mel de vocês no Japão.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-black/60 md:mt-8 md:text-lg">
            Compartilhem as datas e o estilo que imaginam para essa viagem. A Alpinea cuida do restante.
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
                Curadoria privada de lua de mel, gastronomia e lifestyle no Japão.
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

          <nav className="flex flex-col items-start gap-3 text-xs uppercase tracking-[0.25em] text-white/40 md:items-end">
            <a href="/" className="transition hover:text-white">
              Início
            </a>
            <a href="/services" className="transition hover:text-white">
              Serviços
            </a>
            <a href="/restaurantes" className="transition hover:text-white">
              Restaurantes
            </a>
            <a href="/compras" className="transition hover:text-white">
              Compras
            </a>
            <a href="/roteirolandingpage" className="transition hover:text-white">
              Roteiro
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contato
            </a>
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
          </nav>
        </div>
      </footer>

      {/* CTA FIXO MOBILE */}
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
