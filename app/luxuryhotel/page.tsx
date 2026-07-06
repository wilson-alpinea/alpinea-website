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
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
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

export default function HoteisDeLuxoLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const whyAlpineaHotelsScrollRef = useRef<HTMLDivElement>(null);
  const whyAlpineaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. POR QUE A CURADORIA DE HOSPEDAGEM DA ALPINEA
  const whyAlpineaHotels = [
    {
      title: "Já dormimos onde recomendamos",
      text: "Cada propriedade sugerida foi visitada e avaliada por nós, não escolhida por nota de plataforma ou comissão.",
      image: "/images/hotelcard3.png",
      alt: "Lobby de hotel de luxo no Japão, com iluminação de cristal",
    },
    {
      title: "Sabemos qual quarto vale o preço",
      text: "Nem toda suíte de um hotel 5 estrelas tem a mesma vista, o mesmo silêncio ou o mesmo onsen privativo. Indicamos a categoria certa dentro de cada propriedade, não só o hotel certo.",
      image: "/images/hotelcard2.png",
      alt: "Suíte de ryokan tradicional japonês com vista para o jardim",
    },
    {
      title: "Perfil de viagem, não lista genérica",
      text: "O ryokan ideal para uma lua de mel raramente é o ideal para uma família com crianças, e o hotel perfeito para viajar sozinho é diferente dos dois. A recomendação muda com quem viaja.",
      image: "/images/hotelcard4.png",
      alt: "Sala de estar de suíte de hotel de luxo com vista panorâmica de Tóquio",
    },
    {
      title: "Evitamos o erro caro",
      text: "Localização que parece central mas isola você do que importa, quarto 'de luxo' voltado para o estacionamento: o tipo de decepção que só se descobre depois de já ter pago.",
      image: "/images/hotelcard1.png",
      alt: "Piscina de borda infinita em hotel de luxo, com vista da cidade ao entardecer",
    },
  ];

  // 4.5 HOTÉIS POR PERFIL DE VIAGEM — agrupamento em cartões coloridos
  // RASCUNHO — a categoria de cada propriedade precisa ser validada por você,
  // que já se hospedaram nelas. Ajustem os arrays de "hotels" antes de publicar.
  const hotelsByProfile = [
    {
      profile: "Lua de mel e casais",
      description: "Privacidade, romantismo e experiências a dois.",
      hotels: ["Aman Kyoto", "Amanemu (Ise-Shima)", "Zaborin (Niseko)", "Hoshinoya Fuji"],
      accent: "from-[#E94332]/20 via-[#D96A2E]/14 to-transparent",
      iconBg: "bg-[#E94332]/15",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E9A28F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      profile: "Família",
      description: "Espaço, conforto e estrutura para viajar com crianças.",
      hotels: ["Four Seasons Hotel Tokyo at Otemachi", "The Ritz-Carlton, Osaka", "Halekulani Okinawa", "Conrad Osaka"],
      accent: "from-[#1A4C93]/22 via-[#0F2E5C]/16 to-transparent",
      iconBg: "bg-[#1A4C93]/18",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8FB4E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <circle cx="9" cy="7" r="3.5" />
          <path d="M16.5 3.5a3.5 3.5 0 0 1 0 7" />
          <path d="M20 21v-2a4 4 0 0 0-2.5-3.7" />
        </svg>
      ),
    },
    {
      profile: "Bem-estar e onsen",
      description: "Ryokans e retiros voltados para descanso e águas termais.",
      hotels: ["Hoshinoya Kyoto", "Gora Kadan (Hakone)", "Hiiragiya", "Zaborin (Niseko)"],
      accent: "from-[#4B2A80]/20 via-[#144491]/16 to-transparent",
      iconBg: "bg-[#4B2A80]/18",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C7A8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c-1.5 3-2 5-2 7a2 2 0 0 0 4 0c0-2-.5-4-2-7z" />
          <path d="M4 15c1-1 2-1.5 3-1.5s2 .5 3 1.5 2 1.5 3 1.5 2-.5 3-1.5 2-1.5 3-1.5 2 .5 3 1.5" />
          <path d="M4 19c1-1 2-1.5 3-1.5s2 .5 3 1.5 2 1.5 3 1.5 2-.5 3-1.5 2-1.5 3-1.5 2 .5 3 1.5" />
        </svg>
      ),
    },
    {
      profile: "Clássicos consagrados",
      description: "Ícones de primeira viagem ao Japão, com o serviço mais tradicional.",
      hotels: ["Aman Tokyo", "The Peninsula Tokyo", "Palace Hotel Tokyo", "The Ritz-Carlton, Kyoto"],
      accent: "from-[#C9A03A]/22 via-[#8C6A1F]/14 to-transparent",
      iconBg: "bg-[#C9A03A]/16",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E4CB86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.6 6.6L21 9.3l-5 4.3 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.3l6.4-.7z" />
        </svg>
      ),
    },
    {
      profile: "Design e vida urbana",
      description: "Estética contemporânea, para quem busca a cidade como parte da experiência.",
      hotels: ["Janu Tokyo", "Mandarin Oriental Tokyo", "The Mitsui Kyoto, a Luxury Collection Hotel & Spa"],
      accent: "from-[#1A4C93]/16 via-[#4B2A80]/14 to-transparent",
      iconBg: "bg-white/10",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C7D2E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M9 21v-4h6v4" />
          <path d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1" />
        </svg>
      ),
    },
  ];

  // 6. POR QUE A ALPINEA
  const whyAlpinea = [
    {
      title: "+12 anos no Japão",
      text: "Mais de uma década de relações locais: o tipo de acesso que não se compra, se constrói.",
    },
    {
      title: "Presença real, sem intermediários",
      text: "Operação própria no Japão, com atendimento direto e conhecimento de bairros, hotéis e restaurantes fora do óbvio, sem terceirizar sua viagem e sem expor os detalhes dela.",
    },
    {
      title: "Indicação pelo perfil de quem viaja, não pelo nome do hotel",
      text: "Um hotel badalado não é sinônimo de escolha certa. Comparamos localização, tipo de quarto e rotina da propriedade com o momento de vida de quem está viajando.",
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
      <section className="relative h-[64svh] min-h-[560px] overflow-hidden md:h-[max(60vh,32vw)] md:max-h-[920px] md:min-h-[560px]">
        <Image
          src="/images/hero-jantar-fuji.png"
          alt="Vista de Tóquio e do Monte Fuji ao entardecer, de um salão de jantar em andar alto"
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

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-48 text-center md:justify-end md:pb-28">
          <p className={`${display.className} mb-3 text-sm uppercase tracking-[0.3em] text-white/75 md:mb-7 md:text-base md:tracking-[0.5em]`}>
            Curadoria, planejamento e reserva de hotéis, tudo em um só lugar.
          </p>

          <h1 className={`${display.className} max-w-full text-[1.65rem] font-medium leading-[1.25] tracking-tight md:max-w-4xl md:text-6xl`}>
            O hotel certo não é o mais caro.{" "}
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              É{"\u00A0"}o que foi feito para a sua viagem.
            </span>
          </h1>

          <ContactCTA
            mode="single"
            channel="email"
            label="Quero minha curadoria"
            className="mt-7 md:mt-10"
            buttonClassName="bg-white px-9 py-4 text-xs uppercase tracking-[0.35em] text-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition hover:bg-white/90 md:px-11 md:py-5 md:text-sm"
          />
        </div>

        <a
          href="#por-que-curadoria"
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

      {/* 2. POR QUE A CURADORIA DE HOSPEDAGEM DA ALPINEA */}
      <section id="por-que-curadoria" className="border-b border-white/10 px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl md:mb-16">
            <h2 className={`${display.className} text-2xl font-medium leading-snug md:text-4xl`}>
              O nome do hotel está no Google. A diferença entre o quarto certo e o quarto errado, não.
            </h2>

            <p className="mt-5 max-w-none text-base font-light leading-8 text-white/60 md:mt-7 md:text-lg md:leading-9">
              A Alpinea não tem convênio com hotéis. O que oferecemos é outra coisa: mais de uma década escolhendo, testando e comparando hospedagens no Japão, para indicar exatamente a propriedade (e o quarto dentro dela) certos para o perfil de quem viaja.
            </p>
          </div>

          <div className="relative -mx-8 md:mx-0">
            <div
              ref={whyAlpineaHotelsScrollRef}
              className="flex gap-6 overflow-x-auto px-8 pb-2 snap-x snap-mandatory scroll-pl-8 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-10 md:overflow-visible md:px-0 md:pb-0"
            >
              {whyAlpineaHotels.map((item) => (
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
            <CarouselNextArrow targetRef={whyAlpineaHotelsScrollRef} />
          </div>
          <CarouselDots targetRef={whyAlpineaHotelsScrollRef} count={whyAlpineaHotels.length} />
        </div>
      </section>

      {/* 4.5 OS HOTÉIS MAIS LUXUOSOS DO JAPÃO — por perfil de viagem, com foto em destaque */}
      <section className="border-b border-white/10 px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl md:mb-16">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Mapa de referência
            </p>
            <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
              Os hotéis mais luxuosos do Japão, organizados pelo que importa: quem viaja.
            </h2>
            <p className="mt-5 max-w-2xl text-base font-light leading-8 text-white/60 md:mt-7 md:text-lg md:leading-9">
              Para montar a curadoria de cada cliente, mapeamos e comparamos continuamente as propriedades mais relevantes do país, de acordo com Forbes Travel Guide, Guia Michelin e nossa própria experiência em cada uma delas.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
            <div
              className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-[20px] lg:sticky lg:top-24"
              onClick={() =>
                setLightbox({
                  src: "/images/mapadereferencia.png",
                  alt: "Vista da Torre de Tóquio à noite, de uma suíte de hotel em andar alto",
                })
              }
            >
              <Image
                src="/images/mapadereferencia.png"
                alt="Vista da Torre de Tóquio à noite, de uma suíte de hotel em andar alto"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {hotelsByProfile.map((group) => (
                <div
                  key={group.profile}
                  className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br ${group.accent} bg-[#0a0a0c] p-6`}
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${group.iconBg}`}>
                    {group.icon}
                  </div>
                  <h3 className="text-base font-medium text-white">{group.profile}</h3>
                  <p className="mt-1.5 text-sm font-light leading-6 text-white/50">{group.description}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                    {group.hotels.map((hotel) => (
                      <li key={hotel} className="text-sm font-light leading-6 text-white/65">
                        {hotel}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-12 max-w-2xl text-xs font-light leading-6 text-white/30 md:mt-16">
            Lista de referência de mercado, construída a partir de fontes públicas, do Forbes Travel Guide, do Guia Michelin e do conhecimento próprio da Alpinea. A classificação por perfil é indicativa — uma mesma propriedade pode servir a mais de um perfil de viagem. Não representa convênio, parceria comercial ou exclusividade com as propriedades citadas.
          </p>
        </div>
      </section>

      {/* CTA INTERMEDIÁRIO — após o mapa de referência */}
      <section className="border-b border-white/10 bg-[#050505] px-8 py-14 text-center md:px-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className={`${display.className} text-2xl font-medium leading-snug text-white md:text-4xl`}>
            Pronto para saber qual dessas propriedades foi feita para você?
          </h2>
          <p className="mt-4 text-sm font-light leading-7 text-white/50 md:text-base">
            Curadoria, planejamento e reserva — tudo em um só lugar.
          </p>

          <ContactCTA
            mode="single"
            channel="email"
            label="Falar sobre minha viagem"
            className="mt-8 flex justify-center"
            buttonClassName="bg-white px-9 py-4 text-xs uppercase tracking-[0.35em] text-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition hover:bg-white/90 md:px-11 md:py-5 md:text-sm"
          />
        </div>
      </section>

      {/* 5. PROVA REAL — a curadoria documentada */}
      <section className="border-b border-white/10 px-8 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 text-xs uppercase tracking-[0.3em] text-white/30 md:mb-16 md:tracking-[0.45em]">
            Curadoria documentada, não apenas um nome de hotel.
          </p>

          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div>
              <h3 className={`${display.className} text-3xl font-medium leading-tight text-white md:text-4xl`}>
                Para cada indicação, o porquê por trás da escolha.
              </h3>

              <p className="mt-6 max-w-lg text-base font-light leading-8 text-white/65">
                Categoria de quarto, melhor época para aquela propriedade específica, o que vale reservar direto e o que evitar: cada hotel indicado pela Alpinea vem com o contexto que só quem já esteve lá consegue dar. Tudo organizado no dashboard digital, acessível a qualquer momento do planejamento.
              </p>
            </div>

            <div className="relative isolate flex justify-center">
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

      {/* 6. POR QUE A ALPINEA */}
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
          src="/images/Janu.jpg"
          alt="Suíte de hotel de luxo em Tóquio com vista para a Torre de Tóquio ao entardecer"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />

        <p className={`${display.className} relative z-10 mx-auto max-w-3xl text-center text-2xl italic font-light leading-snug text-white/90 md:text-4xl`}>
          "Bons hotéis existem em qualquer lugar do mundo. Saber qual deles foi feito para você é o que muda a viagem."
        </p>
      </section>

      {/* 7. CONTATO */}
      <section id="contact" className="bg-white px-8 py-14 text-black md:px-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-black/45 md:tracking-[0.45em]">
            Contato
          </p>

          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Descubra qual hospedagem foi feita para essa viagem.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-black/60 md:mt-8 md:text-lg">
            Compartilhe quem viaja e o estilo que imagina. A Alpinea indica a propriedade (e o quarto dentro dela) certos para você.
          </p>

          <p className="mt-4 text-sm font-light text-black/40 md:mt-6">
            Curadoria realizada para um número limitado de viagens por semestre.
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
                Curadoria privada de hospedagem, gastronomia e lifestyle no Japão.
              </p>

              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA · CNPJ 66.491.067/0001-84
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
          label="Falar sobre minha viagem"
          className="block w-full"
          buttonClassName="block w-full border border-white/30 py-3 text-center text-xs uppercase tracking-[0.3em] text-white transition active:bg-white active:text-black"
        />
      </div>
    </main>
  );
}
