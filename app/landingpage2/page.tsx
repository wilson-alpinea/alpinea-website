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

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
        className="absolute right-6 top-6 text-3xl leading-none text-white/60 hover:text-white"
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

const proofCards = [
  { title: "Restaurantes", text: "Curadoria e reservas em casas de difícil acesso.", icon: "鮨" },
  { title: "Hotéis", text: "Escolha por bairro, atmosfera e estilo de viagem.", icon: "泊" },
  { title: "Compras", text: "Acesso a produtos, artesãos e categorias especializadas.", icon: "品" },
  { title: "Logística", text: "Roteiro, transfers, horários e suporte operacional.", icon: "旅" },
];

const accessCards = [
  { title: "Sushi Arai", image: "/images/arai2.png" },
  { title: "The Peninsula Tokyo", image: "/images/peninsula3.jpg" },
  { title: "Niku Kappou Miyata", image: "/images/nikufood.jpeg" },
  { title: "Sazenka", image: "/images/sazenka2.png" },
  { title: "Ao", image: "/images/ao2.png" },
  { title: "Fukamachi", image: "/images/fukamachi2.png" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen scroll-smooth bg-black text-white">
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

      <header
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 transition-all duration-700 md:px-16 ${
          scrolled ? "bg-black/35 backdrop-blur-2xl" : "bg-transparent"
        }`}
      >
        <a href="/" aria-label="Alpinea">
          <img
            src="/images/ALPINEA-LOGO-transparent.png"
            alt="Alpinea"
            className="h-8 w-auto object-contain md:h-9"
          />
        </a>

        <a
          href="#contact"
          className="hidden border border-white/25 px-5 py-3 text-[10px] uppercase tracking-[0.28em] text-white/80 transition hover:bg-white hover:text-black md:block"
        >
          Contato
        </a>
      </header>

      {/* HERO — mobile otimizado para Google Ads */}
      <section className="relative min-h-[100svh] overflow-hidden md:min-h-[760px]">
        <video
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          src="/videos/higashiyama.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <Image
          src="/images/higashiyama.jpg"
          alt="Rua tradicional no Japão"
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.10),transparent_35%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-6 pb-14 pt-24 text-center md:min-h-[760px] md:items-center md:px-16">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/60 md:mb-7 md:tracking-[0.5em]">
            Viagens privadas e concierge no Japão
          </p>

          <h1 className={`${display.className} mx-auto max-w-5xl text-[3.4rem] font-medium leading-[0.98] tracking-tight md:text-7xl`}>
            O Japão que não aparece nos guias.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base font-light leading-8 text-white/74 md:mt-8 md:text-lg">
            Roteiros privados, reservas gastronômicas difíceis, hotéis, compras e logística para quem quer viver o Japão com profundidade.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 md:mt-10 md:max-w-none md:flex-row md:justify-center">
            <a
              href="#contact"
              className="border border-white/35 bg-white px-6 py-4 text-center text-xs uppercase tracking-[0.26em] text-black transition hover:bg-white/90"
            >
              Planejar minha viagem
            </a>
            <a
              href="#exemplo"
              className="border border-white/25 px-6 py-4 text-center text-xs uppercase tracking-[0.26em] text-white transition hover:bg-white hover:text-black"
            >
              Ver exemplo real
            </a>
          </div>

          <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-2 text-center md:mt-12 md:max-w-2xl md:gap-4">
            {[
              ["+12", "anos de Japão"],
              ["PT/JP", "idioma e cultura"],
              ["Private", "execução sob medida"],
            ].map(([top, bottom]) => (
              <div key={top} className="border border-white/10 bg-black/25 px-3 py-4 backdrop-blur-sm">
                <p className={`${display.className} text-2xl leading-none text-white md:text-3xl`}>{top}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/45">{bottom}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE ADS FLOW — 3/4 scrolls até contato */}
      <div className="md:hidden">
        <section className="border-b border-white/10 px-6 py-12">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">O que você recebe</p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight`}>
            Não entregamos uma lista. Entregamos uma viagem executável.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {proofCards.map((card) => (
              <div key={card.title} className="border border-white/10 bg-white/[0.03] p-4">
                <p className={`${display.className} text-2xl text-white/90`}>{card.icon}</p>
                <h3 className="mt-4 text-base text-white">{card.title}</h3>
                <p className="mt-3 text-sm font-light leading-6 text-white/55">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="exemplo" className="border-b border-white/10 px-6 py-12">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">Exemplo real</p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight`}>
            Veja o tipo de planejamento que o cliente recebe.
          </h2>
          <p className="mt-5 text-base font-light leading-8 text-white/60">
            Roteiro diário, reservas, horários, mapas, compras e anexos especiais reunidos num painel acessível pelo celular.
          </p>

          <div className="mt-8 grid grid-cols-[0.82fr_1fr] items-center gap-4">
            <button
              type="button"
              onClick={() => setLightbox({ src: "/images/dashmobile.jpg", alt: "Dashboard de viagem Alpinea" })}
              className="relative aspect-[1320/2257] overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.04]"
            >
              <Image
                src="/images/dashmobile.jpg"
                alt="Dashboard de viagem Alpinea"
                fill
                sizes="45vw"
                className="object-cover object-top"
              />
            </button>
            <div className="space-y-4">
              {[
                { src: "/images/ss-roteiro.png", alt: "Roteiro privado Alpinea" },
                { src: "/images/ss-restaurantes.png", alt: "Reservas gastronômicas Alpinea" },
              ].map((item) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setLightbox({ src: item.src, alt: item.alt })}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04]"
                >
                  <Image src={item.src} alt={item.alt} fill sizes="55vw" className="object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 px-6 py-12">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">Por que a Alpinea</p>
          <div className="space-y-6">
            {[
              ["Mais de uma década no Japão", "Vivência real entre gastronomia, hotelaria, cultura, logística e relações locais."],
              ["Acesso além das plataformas", "Restaurantes e experiências que muitas vezes exigem idioma, contexto e relacionamento."],
              ["Execução de ponta a ponta", "Planejamento, reservas, compras, transporte e suporte local quando necessário."],
            ].map(([title, text]) => (
              <div key={title} className="border-t border-white/10 pt-6">
                <h3 className={`${display.className} text-3xl font-medium leading-tight`}>{title}</h3>
                <p className="mt-3 text-base font-light leading-7 text-white/58">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="bg-white px-6 py-14 text-black">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-black/40">Agenda limitada</p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight`}>
            Vamos desenhar sua viagem privada ao Japão.
          </h2>
          <p className="mt-5 text-base leading-7 text-black/58">
            Compartilhe datas, preferências e estilo de viagem. A Alpinea retorna com o melhor caminho para sua jornada.
          </p>
          <ContactCTA className="mt-8 flex flex-col gap-4" />
        </section>

        <section className="border-b border-white/10 px-6 py-12">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">Acesso Alpinea</p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight`}>
            Alguns nomes que fazem parte do nosso universo.
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {accessCards.map((item) => (
              <div key={item.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-white/[0.04]">
                  <Image src={item.image} alt={item.title} fill sizes="50vw" className="object-cover" />
                </div>
                <p className="mt-3 text-sm text-white/80">{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* DESKTOP / CONTEÚDO COMPLETO */}
      <div className="hidden md:block">
        <section className="border-b border-white/10 px-16 py-24">
          <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">A Jornada Alpinea</p>
              <h2 className={`${display.className} text-6xl font-medium leading-tight`}>
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

        <section className="border-b border-white/10 px-16 py-24">
          <div className="mx-auto max-w-7xl">
            <p className="mb-14 text-xs uppercase tracking-[0.45em] text-white/40">Por que escolher a Alpinea</p>
            <div className="grid gap-12 md:grid-cols-4">
              {[
                ["+12 anos", "Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais."],
                ["Exclusividade de Serviços", "Curadoria de elite para gastronomia e consumo, com fluência no idioma para elevar a experiência."],
                ["Brasil–Japão", "Conhecimento operacional aplicado à curadoria de experiências privadas para o público brasileiro."],
                ["Presença real no Japão", "Operação própria no Japão, sem intermediários, com maior proximidade dos parceiros locais."],
              ].map(([title, text]) => (
                <div key={title}>
                  <h3 className={`${display.className} text-3xl font-medium tracking-tight text-white`}>{title}</h3>
                  <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 px-16 py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 grid gap-16 md:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Nossos diferenciais</p>
                <h2 className={`${display.className} text-6xl font-medium leading-tight`}>
                  Acesso, profundidade e execução no mercado de luxo japonês.
                </h2>
              </div>
              <div className="space-y-10 text-lg font-light leading-9 text-white/68">
                <p>O acesso no Japão não é baseado somente em desejo. São necessários anos de relacionamento com estabelecimentos, especialistas e parceiros locais.</p>
                <p>Os grandes nomes da gastronomia japonesa não estão disponíveis em plataformas. Muitos não aceitam reservas em inglês e alguns só recebem clientes apresentados por relações construídas ao longo de anos.</p>
                <p>Encontrar o hotel ideal exige mais do que reconhecer nomes famosos. Exige entender bairros, atmosferas e o estilo de viagem de cada cliente.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-8 gap-y-12">
              {accessCards.map((item) => (
                <div key={item.title}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white/5">
                    <Image src={item.image} alt={item.title} fill sizes="33vw" className="object-cover" />
                  </div>
                  <h3 className="mt-5 text-xl font-light text-white">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="exemplo-desktop" className="border-b border-white/10 px-16 py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 max-w-5xl">
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Execução</p>
              <h2 className={`${display.className} text-6xl font-medium leading-tight`}>
                Uma operação desenhada para transformar intenção em viagem executada.
              </h2>
              <p className="mt-8 max-w-3xl text-lg font-light leading-9 text-white/68">
                Do planejamento ao acompanhamento presencial, a Alpinea organiza os detalhes que determinam a qualidade real de uma viagem de alto padrão no Japão.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                ["Roteiro privado", "Planejamento diário com logística, mapas, horários recomendados, contexto local e decisões práticas.", "/images/ss-roteiro.png"],
                ["Reservas gastronômicas", "Curadoria, solicitação, acompanhamento e organização de restaurantes conforme perfil.", "/images/ss-restaurantes.png"],
                ["Assessoria de compras", "Apoio na seleção, localização e aquisição de produtos japoneses de alto nível.", "/images/ss-rcompras.png"],
              ].map(([title, text, image]) => (
                <div key={title} className="group">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">Entregável Alpinea</p>
                  <h3 className="mt-3 text-2xl font-light text-white">{title}</h3>
                  <p className="mt-5 text-sm font-light leading-7 text-white/55">{text}</p>
                  <button
                    type="button"
                    className="relative mt-8 aspect-[4/5] w-full overflow-hidden rounded-[26px] bg-white/[0.04]"
                    onClick={() => setLightbox({ src: image, alt: title })}
                  >
                    <Image src={image} alt={title} fill sizes="33vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.03]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-16 py-20 text-black">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-black/40">Fale com a Alpinea</p>
            <h2 className={`${display.className} text-5xl font-medium leading-tight`}>
              Comece sua jornada privada no Japão.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-black/55">
              Compartilhe suas datas, preferências e estilo de viagem. A Alpinea desenha o caminho.
            </p>
            <ContactCTA className="mt-9 flex flex-col justify-center gap-4 md:flex-row" />
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 bg-black px-6 pb-28 pt-14 text-white md:px-16 md:pb-16 md:pt-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="space-y-6">
            <img src="/images/ALPINEA-LOGO-transparent.png" alt="Alpinea" className="h-7 w-auto object-contain" />
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

          <nav className="flex flex-col gap-3 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="/" className="transition hover:text-white">Início</a>
            <a href="/services" className="transition hover:text-white">Serviços</a>
            <a href="/gastro" className="transition hover:text-white">Restaurantes</a>
            <a href="/guia" className="transition hover:text-white">Compras</a>
            <a href="/preview" className="transition hover:text-white">Roteiro</a>
            <a href="#contact" className="transition hover:text-white">Contato</a>
          </nav>
        </div>
      </footer>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-6 pt-3 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <ContactCTA
          mode="single"
          channel="email"
          label="Planejar minha viagem"
          className="block w-full"
          buttonClassName="block w-full border border-white/30 py-3 text-center text-xs uppercase tracking-[0.26em] text-white transition active:bg-white active:text-black"
        />
      </div>
    </main>
  );
}
