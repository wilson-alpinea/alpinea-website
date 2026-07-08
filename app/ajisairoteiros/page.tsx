import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { CarouselScroller } from "../components/CarouselScroller";

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Roteiros Personalizados para o Japão",
  description:
    "Roteiros personalizados para o Japão com a curadoria Ajisai. Veja exemplos reais de roteiros privados, com guias de restaurantes, hotéis e compras.",
};

export default function RoteirosAdsPage() {
  const whyAjisai = [
    {
      label: "Experiência",
      title: "+12 anos",
      text: "Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.",
    },
    {
      label: "Curadoria",
      title: "Exclusividade de Serviços",
      text: "Curadoria de restaurantes, hotelaria e consumo desenvolvida a partir de experiência própria, fluência no idioma e uma rede construída ao longo de mais de uma década no Japão.",
    },
    {
      label: "Conexão Brasil–Japão",
      title: "Referência na conexão",
      text: "Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.",
    },
    {
      label: "Presença real no Japão",
      title: "Operação própria",
      text: "Nossa operação própria no Japão permite atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.",
    },
  ];

  return (
    <main className="min-h-screen bg-black pb-16 text-white md:pb-0">
      {/* ── HEADER MINIMALISTA — sem menu, foco total em conversão ── */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-10 w-auto object-contain md:h-11"
          />
        </a>

        <a
          href="#contact"
          className="hidden rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white md:inline-block"
        >
          Falar com a Ajisai
        </a>
      </header>

      {/* ── CTA FIXO MOBILE — mesmo padrão usado na landingpage2 ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/[0.92] px-4 pt-2.5 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
      >
        <ContactCTA
          mode="single"
          channel="whatsapp"
          label="Falar com a Ajisai →"
          buttonClassName="block w-full bg-white px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
        />
      </div>

      {/* ── SEÇÃO 1 — HERO ── */}
      <section className="relative h-[620px] min-h-[620px] overflow-hidden bg-black md:h-auto md:min-h-[820px]">
        <div className="absolute inset-0 mx-auto max-w-[1800px]">
          <Image
            src="/images/niseko-intuition.png"
            alt="Lounge do Intuition Hotel em Niseko, com vista para o Monte Yotei"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute right-5 top-24 z-10 rounded-full border border-white/15 bg-black/85 px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:right-12 md:top-28 md:text-[11px]">
            Niseko, Hokkaido
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 14%, rgba(0,0,0,0.68) 32%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.06) 100%)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-20 z-10 px-6 text-center md:bottom-24 md:px-16">
          <h1
            className={`${display.className} mx-auto max-w-xs text-[1.85rem] font-medium leading-[1.18] text-white sm:max-w-md sm:text-[2.1rem] md:max-w-4xl md:text-5xl md:leading-[1.08]`}
          >
            Roteiros personalizados para o Japão
          </h1>

          <div className="mx-auto mt-7 flex max-w-full flex-nowrap items-center justify-center gap-1.5 px-1 md:mt-10 md:max-w-4xl md:flex-wrap md:gap-4">
            {["7 dias", "10 dias", "12 dias", "15 dias", "20+ dias"].map(
              (d) => (
                <span
                  key={d}
                  className="shrink-0 cursor-default rounded-full border border-white/25 bg-black/20 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-white/75 backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white hover:text-black md:px-6 md:py-3 md:text-sm md:tracking-[0.22em]"
                >
                  {d}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Indicador de scroll — só mobile, desktop já tem CTA visível no header */}
        <a
          href="#overview"
          aria-label="Rolar para o conteúdo"
          className="absolute inset-x-0 bottom-6 z-10 flex justify-center md:hidden"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/20 backdrop-blur-sm transition hover:border-white/50">
            <svg
              className="h-7 w-7 animate-bounce text-white/80"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </a>
      </section>

      {/* ── SEÇÃO 2 — CHAMADA PARA O EXEMPLO ── */}
      <section id="overview" className="bg-black px-6 py-10 md:px-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`${display.className} text-[2rem] font-medium leading-[1.15] text-white md:text-4xl md:leading-snug`}
          >
            Receba um roteiro 100% personalizado para o seu perfil e estilo de
            viagem. Veja abaixo como funciona nossa plataforma digital.
          </h2>
        </div>
      </section>

      {/* ── SEÇÃO 3 — EXEMPLO DE ROTEIRO ── */}
      <section className="border-t border-white/10 bg-[#050505] px-5 py-12 md:bg-black md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-3xl text-center md:mb-16">
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
              Painel Interativo
            </p>
            <h2
              className={`${display.className} mb-5 text-[2.4rem] font-medium leading-tight text-white md:text-4xl`}
            >
              Exemplo de Roteiro
            </h2>
            <p className="text-base font-light leading-7 text-white/65 md:text-lg md:leading-9">
              Roteiro num formato moderno e digital, para você acessar a
              informação que precisa rapidamente.
            </p>
          </div>

          <div className="relative isolate mx-auto max-w-7xl">
            {/* Glow externo — luz ambiente nas bordas, sem invadir o interior preto do dashboard */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-30 h-[112%] w-[116%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] opacity-70 blur-[120px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(25,70,150,0.20) 0%, rgba(16,42,108,0.14) 36%, rgba(9,18,46,0.08) 55%, transparent 76%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[104%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-[2.35rem] opacity-45 blur-[38px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(75,42,128,0.18), rgba(20,68,145,0.22) 48%, rgba(0,0,0,0) 78%)",
              }}
            />
            <div className="relative z-10 rounded-[2rem] bg-black">
              <DashboardPreview />
            </div>
          </div>

          <RoutePreviewModals />
        </div>
      </section>

      {/* ── PEDAÇO DO ROTEIRO — AMOSTRA DO DIA 1 ── */}
      <section
        id="dia-1"
        className="border-t border-white/10 bg-black px-5 py-12 md:px-16 md:py-24"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center sm:rounded-[2rem] sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Dia 1
          </p>
          <h3
            className={`${display.className} mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl`}
          >
            Tokyo
          </h3>
          <div
            className="mt-5 flex items-center justify-center gap-2"
            aria-label="Dia 1 de 7"
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-white" : "bg-white/20"}`}
              />
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-white/55">
            Chegada ao Japão, acomodação inicial e primeira experiência em
            Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo
            Solamachi.
          </p>

          <div className="mx-auto mt-9 max-w-md space-y-0 text-left">
            {[
              [
                "10:30",
                "Chegada · Aeroporto Internacional de Narita — Terminal 3",
                "Chegada",
              ],
              [
                "11:30",
                "Imigração, retirada de bagagem e deslocamento até o hotel",
                "Deslocamento",
              ],
              ["15:00", "Check-in · Caption By Hyatt Kabutocho", "Hospedagem"],
              ["16:00", "Saída do hotel rumo a Oshiage", "Deslocamento"],
              [
                "16:30",
                "Tokyo Skytree · Subida ao observatório para o pôr do sol",
                "Atração",
              ],
              [
                "18:30",
                "Exploração do Tokyo Solamachi · lojas e gastronomia",
                "Refeição",
              ],
              ["20:00", "Retorno ao hotel · noite livre", "Deslocamento"],
            ].map(([time, text, tag], index) => (
              <div
                key={time}
                className="relative grid grid-cols-[74px_1fr] gap-4 pb-7 last:pb-0"
              >
                {index < 6 && (
                  <span className="absolute left-[72px] top-4 h-full w-px bg-white/10" />
                )}
                <p className="pt-0.5 text-sm font-medium tracking-[0.15em] text-white">
                  {time}
                </p>
                <div className="relative">
                  <span className="absolute -left-[18px] top-2 h-2.5 w-2.5 rounded-full bg-white/40 ring-4 ring-black" />
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#b79ce6]">
                    {tag}
                  </p>
                  <p className="text-[15px] leading-6 text-white/62">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOSPEDAGEM — CAPTION BY HYATT KABUTOCHO ── */}
      <section id="hotel" className="border-t border-white/10 bg-black">
        <div className="px-5 py-10 md:px-16 md:py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] md:rounded-[2rem]">
            <div className="grid md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
              <div className="relative h-[220px] overflow-hidden md:h-auto md:min-h-[440px]">
                <Image
                  src="/images/caption.jpg"
                  alt="Caption By Hyatt Kabutocho — fachada do hotel"
                  fill
                  sizes="(max-width: 768px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r" />
                <div className="absolute bottom-5 left-5 rounded-full border border-[#8fb7d9]/25 bg-[#12324a]/50 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#b7d8f2] backdrop-blur-md md:hidden">
                  🏨 Hospedagem
                </div>
              </div>

              <div className="p-6 md:p-10">
                <p className="hidden text-xs uppercase tracking-[0.35em] text-[#8fb7d9] md:block">
                  🏨 Hospedagem
                </p>
                <h3
                  className={`${display.className} text-3xl font-medium text-white md:mt-4 md:text-4xl`}
                >
                  Caption By Hyatt Kabutocho
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/35">
                  Nihonbashi Kabutocho · Chuo
                </p>

                <div className="mt-7 border-t border-white/10 pt-6">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/30">
                    Endereço
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    12-1 Nihonbashi Kabutocho, Chuo City, Tokyo 103-0026, Japão
                  </p>
                </div>

                <div className="mt-9 flex justify-center border-t border-white/10 pt-9">
                  <Image
                    src="/images/captionlogo.png"
                    alt="Caption By Hyatt Kabutocho"
                    width={360}
                    height={160}
                    className="w-44 object-contain opacity-90 md:w-56"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile — Manhã e Tarde unificadas, texto reduzido */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-12 md:hidden">
        <div className="mx-auto max-w-7xl">
          <p
            className={`${display.className} mb-6 text-3xl font-medium text-white`}
          >
            Manhã & Tarde
          </p>
          <p className="mb-6 inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
            Não disponível na amostra de roteiro
          </p>
          <div className="max-w-4xl space-y-4 text-base font-light leading-6 text-white/70">
            <p>
              <span className="text-white">Manhã</span> · Chegada em Narita,
              imigração e deslocamento até o hotel.
            </p>
            <p>
              <span className="text-white">Tarde</span> · Oshiage, Tokyo —
              Tokyo Skytree.
            </p>
          </div>
        </div>
      </section>

      {/* Desktop — Manhã e Tarde como seções separadas, inalterado */}
      <div className="hidden md:block">
        <section className="border-t border-white/10 bg-white/[0.02] px-8 py-16 md:px-16 md:py-32">
          <div className="mx-auto max-w-7xl">
            <p
              className={`${display.className} mb-6 text-3xl font-medium text-white md:text-4xl`}
            >
              Manhã
            </p>
            <p className="mb-8 inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
              Não disponível na amostra de roteiro
            </p>
            <div className="max-w-4xl space-y-8 text-lg font-light leading-7 text-white/70 md:leading-9">
              <p>
                <span className="text-white">Local:</span> Aeroporto
                Internacional de Narita — Terminal 3
              </p>
              <p>
                Instruções gerais de chegada, imigração, retirada de bagagem,
                restaurantes sugeridos no aeroporto, ações obrigatórias antes de
                sair do aeroporto, comentários gerais e guia de deslocamento até
                o hotel.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-8 py-14 md:px-16 md:py-16">
          <div className="mx-auto max-w-7xl">
            <p
              className={`${display.className} mb-8 text-3xl font-medium text-white md:text-4xl`}
            >
              Tarde
            </p>
            <p className="max-w-4xl text-lg font-light leading-7 text-white/70 md:leading-9">
              <span className="text-white">Local:</span> Oshiage, Tokyo —
              atração principal: Tokyo Skytree. Detalhes completos e como
              chegar logo abaixo.
            </p>
          </div>
        </section>
      </div>

      {/* ── ATRAÇÃO — TOKYO SKYTREE ── */}
      <section id="skytree" className="border-t border-white/10">
        <div className="relative h-[360px] min-h-[360px] max-h-[420px] w-full overflow-hidden md:h-[75vh] md:min-h-[560px] md:max-h-[720px]">
          <Image
            src="/images/skytree3.jpg"
            alt="Tokyo Skytree"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
                Atração
              </p>
              <h3
                className={`${display.className} text-3xl font-medium text-white md:text-4xl`}
              >
                Tokyo Skytree
              </h3>
            </div>
          </div>
        </div>

        {/* ── MOBILIDADE — movida para antes dos detalhes de ingresso ── */}
        <div
          id="mobilidade"
          className="border-b border-white/10 px-6 py-12 md:px-16 md:py-16"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <SectionMarker number={1} label="Deslocamento" />
            </div>

            {/* Card da estação — fundo preto, modelo Tokyo Metro */}
            <div className="rounded-2xl border border-white/10 bg-black p-6 text-white sm:rounded-[2rem] sm:p-8">
              <p className="text-center text-xl font-semibold sm:text-2xl">
                Oshiage Station
              </p>
              <p className="mt-1 text-center text-sm text-white/45">
                押上駅〈スカイツリー前〉
              </p>

              <div className="mt-8 flex flex-wrap items-start justify-center gap-x-8 gap-y-5">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "#2f80c9" }}
                  >
                    TS03
                  </span>
                  <span className="text-center text-xs text-white/60">
                    Tobu Skytree Line
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "#1c5fa8" }}
                  >
                    KS45
                  </span>
                  <span className="text-center text-xs text-white/60">
                    Keisei Oshiage Line
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "#e2542a" }}
                  >
                    A20
                  </span>
                  <span className="text-center text-xs text-white/60">
                    Toei Asakusa Line
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "#7c4fd1" }}
                  >
                    Z14
                  </span>
                  <span className="text-center text-xs text-white/60">
                    Tokyo Metro Hanzomon Line
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <MapCard href="#preview-mapa-oshiage" label="Mapa da Estação" />
              </div>
            </div>

            {/* Tempo de deslocamento — Metrô, Carro e Saída, mesmo esquema visual */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-[#b79ce6] bg-white/[0.025] p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
                    <IconTrain className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                      Metrô
                    </p>
                    <p className="text-2xl text-white">≈ 20 min</p>
                  </div>
                </div>
                <p className="mt-3 inline-block rounded-full border border-[#b79ce6]/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#b79ce6]">
                  Recomendado
                </p>
                <div className="mt-4 space-y-2 text-xs leading-5 text-white/55">
                  <p>+ Linha direta (Toei Asakusa), sem baldeação.</p>
                  <p>
                    + Imune a trânsito — chegada previsível para o pôr do sol.
                  </p>
                  <p>
                    − Caminhada até a estação e pode ficar cheio em horário de
                    pico.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
                    <IconCar className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                      Carro / Táxi
                    </p>
                    <p className="text-2xl text-white">15–20 min</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs leading-5 text-white/55">
                  <p>+ Porta a porta, sem caminhada nem escadas.</p>
                  <p>
                    + Mais conforto em dias de chuva ou mobilidade reduzida.
                  </p>
                  <p>
                    − Sujeito a trânsito; tempo pode variar bastante no
                    horário de pico.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F4C430] p-5 text-black">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-black">
                    <IconExit className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-black/50">
                      Saída Recomendada
                    </p>
                    <p className="text-2xl font-medium text-black">A2 / B3</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs leading-5 text-black/70">
                  <p>
                    Em dias de chuva, use a conexão subterrânea direta com o
                    Tokyo Solamachi — 連絡通路直結 Solamachi B3F.
                  </p>
                  <p>
                    Qualquer funcionário do metrô pode indicar a direção
                    correta.
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendação Ajisai — tudo em um só card */}
            <div className="mt-6 rounded-2xl border border-[#b79ce6]/15 bg-[#120a1f] p-5 sm:rounded-[2rem] sm:p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.25em] text-[#b79ce6]">
                💡 Recomendação Ajisai
              </p>
              <div className="grid gap-3">
                <RecommendationRow
                  icon="💳"
                  title="Suica IC Card"
                  text="Use no celular ou cartão físico para trem, metrô e ônibus sem comprar passagem a cada trecho."
                />
                <RecommendationRow
                  icon="🗺️"
                  title="Google Maps"
                  text="Rotas, horários e plataformas de embarque em tempo real."
                />
                <RecommendationRow
                  icon="⏱️"
                  title="Horários de pico"
                  text="Evitar 07:30–09:00 e 17:30–19:30 em dias de semana."
                />
              </div>
              <p className="mt-5 text-sm leading-6 text-white/70">
                Do Caption By Hyatt Kabutocho, o trajeto até a Skytree é de
                cerca de 20 minutos de metrô (linha direta, sem baldeação) ou
                15–20 minutos de táxi, dependendo do trânsito. Com chuva ou
                vento forte, recomendamos trocar a Skytree por outra atração.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-12 md:px-16 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-9 text-base font-light leading-7 text-white/70 md:space-y-12 md:text-lg md:leading-9">
              <SectionMarker number={2} label="Atração" />

              <div>
                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                      Melhor horário
                    </p>
                    <p className="text-white">16:30–18:30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                      Tempo estimado
                    </p>
                    <p className="text-white">1–2 horas</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                      Reserva
                    </p>
                    <p className="text-white">Recomendada</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                      Horário de funcionamento
                    </p>
                    <p className="text-white">10:00 às 22:00</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  Ingressos
                </p>
                <div className="mt-2 space-y-2">
                  <p>1. Visita ao 350º andar — Tembo Deck</p>
                  <p>2. Visita ao 350º e 450º andar</p>
                  <p>3. Ingresso separado para a Tembo Galleria</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  Preço estimado
                </p>
                <div className="mt-2 space-y-2">
                  <p>Tembo Deck: a partir de ¥1.800 por pessoa</p>
                  <p>Tembo Deck + Tembo Galleria: a partir de ¥3.000</p>
                  <p>Tembo Galleria avulsa: ¥1.400 por pessoa</p>
                  <p>Crianças entre 6 e 14 anos pagam meia entrada.</p>
                </div>
              </div>

              <InfoBlock
                title="Horário recomendado"
                text="Chegada ao complexo Tokyo Solamachi às 17:00. Subida na torre por volta das 18:15 para acompanhar o pôr do sol."
              />
              <InfoBlock
                title="Tempo estimado de visita"
                text="Entre 1 e 2 horas após a subida ao observatório."
              />
              <div className="rounded-2xl border border-[#b79ce6]/15 bg-[#120a1f] p-5 sm:rounded-[2rem] sm:p-8">
                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#b79ce6]">
                  💡 Recomendação Ajisai
                </p>
                <p>
                  Eu normalmente compro o ingresso para o 350º andar, não vejo
                  grande diferença entre os andares, não acho que vale a pena o
                  restaurante e nem a galeria que ficam no topo da torre. As
                  opções de comida na base são melhores, o complexo tem uma
                  quantidade gigante de lojas. Recomendo passar nas lojas depois
                  de subir para não precisar carregar peso. Todos os
                  restaurantes costumam ter filas, se programe para chegar pelo
                  menos 30 minutos antes do horário desejado para comer. Se não
                  estiver com muita fome, a praça de alimentação tem ótimas
                  opções para lanches como o Gindaco, que faz o típico bolinho
                  de polvo frito, Takoyaki, da região de Kansai.
                </p>
              </div>

              <div>
                <MapCard
                  href="#preview-mapa-solamachi"
                  label="Mapa do Complexo Tokyo Solamachi"
                />
                <p className="mt-4 text-sm leading-7 text-white/45">
                  Visão geral do primeiro andar do complexo Tokyo Solamachi,
                  incluindo acessos à estação Oshiage, áreas comerciais,
                  serviços, cafés, restaurantes e principais pontos de
                  circulação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="jantar" className="px-6 py-12 md:px-16 md:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-9 md:mb-12">
            <SectionMarker number={3} label="Refeição · Jantar" />
          </div>

          <p className="text-lg font-light leading-7 text-white/70 md:leading-9">
            A Tokyo Skytree está integrada ao shopping Tokyo Solamachi, que
            reúne diversas opções de restaurantes, praça de alimentação e um
            mercado no subsolo com alternativas para takeout.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:mt-12 md:gap-6">
            <RestaurantBlock
              name="Hitsumabushi Bincho"
              description="Enguia · hitsumabushi"
              location="6º andar"
              price="~¥6.000"
              hours="11:00–21:00"
              photo="/images/Hitsumabushi.png"
            />
            <RestaurantBlock
              name="Kaiten Sushi Toriton"
              description="Sushi de esteira · prático"
              location="6º andar"
              price="~¥6.000"
              hours="11:00–22:00"
              photo="/images/Toriton.png"
            />
          </div>

          <div className="mt-8 md:mt-12">
            <MapCard
              href="#preview-mapa-dining"
              label="Mapa — Solamachi Dining"
            />
          </div>
        </div>
      </section>

      {/* ── POR QUE A AJISAI ── */}
      <section className="border-t-2 border-[#b79ce6]/30 bg-white/[0.02] px-6 py-20 md:px-16 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex justify-center md:mb-14">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-8 w-auto object-contain opacity-90 md:h-10"
            />
          </div>
          <div className="mb-10 max-w-3xl md:mb-16">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Por que escolher a Ajisai
            </p>
            <h2
              className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}
            >
              O acesso no Japão não se compra. Se constrói ao longo de anos.
            </h2>
          </div>

          <CarouselScroller itemCount={whyAjisai.length} desktopColumns={4}>
            {whyAjisai.map((item) => (
              <div
                key={item.title}
                className="w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] border-t border-white/15 pt-6 md:w-auto"
              >
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">
                  {item.label}
                </p>
                <h3
                  className={`${display.className} text-lg font-medium text-white md:text-xl`}
                >
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-7 text-white/50">
                  {item.text}
                </p>
              </div>
            ))}
          </CarouselScroller>
        </div>
      </section>

      {/* ── TUDO O QUE ACOMPANHA SEU ROTEIRO ── */}
      <section className="border-t border-white/10 bg-black px-6 py-14 md:px-16 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className={`${display.className} mb-10 text-3xl font-medium leading-tight md:mb-14 md:text-5xl`}
          >
            Tudo o que acompanha seu roteiro
          </h2>

          <div className="mx-auto max-w-xl rounded-2xl border border-[#b79ce6]/15 bg-[#120a1f] p-5 text-left sm:rounded-[2rem] sm:p-8">
            <div className="grid gap-3">
              <RecommendationRow
                icon="🖥️"
                title="Painel Digital Interativo"
                text="A viagem organizada para consulta rápida no celular."
              />
              <RecommendationRow
                icon="📍"
                title="Roteiro 100% Personalizado"
                text="Criado exclusivamente para o perfil e ritmo de vocês."
              />
              <RecommendationRow
                icon="🏨"
                title="Curadoria Completa"
                text="Hotéis, restaurantes, logística e sugestões distribuídas ao longo do roteiro."
              />
              <RecommendationRow
                icon="💡"
                title="Conhecimento Local"
                text="Mais de 12 anos explorando e morando no Japão transformados em recomendações práticas."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PONTE — frase de efeito antes do CTA final ── */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden border-t border-white/10 px-8 py-24 md:min-h-[560px] md:px-16 md:py-40">
        <Image
          src="/images/shirakawago.jpg"
          alt="Vilarejo histórico de Shirakawa-go entre montanhas verdes"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />

        <p
          className={`${display.className} relative z-10 mx-auto max-w-3xl text-center text-2xl italic font-light leading-snug text-white/90 md:text-4xl`}
        >
          "Algumas viagens não ficam só na memória — viram parte da história
          de vocês."
        </p>
      </section>

      {/* ── CONTATO ── */}
      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-20 text-black md:px-16 md:py-28"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Contato
          </p>
          <h2
            className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}
          >
            Comece sua jornada no Japão.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-7 text-black/60 md:leading-9">
            Compartilhe suas datas, preferências e estilo de viagem. A Ajisai
            cuidará do restante.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium uppercase tracking-[0.22em] text-black/50">
            Agenda limitada para o segundo semestre de 2026.
          </p>
          <ContactCTA
            mode="single"
            channel="whatsapp"
            label="Falar no WhatsApp"
          />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 pb-20 pt-16 text-white md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-11 w-auto object-contain md:h-12"
          />

          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Roteiros personalizados de viagem e curadoria de experiências no
            Japão.
          </p>

          <a
            href="https://wa.me/5511930300101?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20roteiros%20personalizados%20para%20o%20Jap%C3%A3o."
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/25 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-white/60 hover:text-white"
          >
            WhatsApp da Ajisai · (11) 9-3030-0101
          </a>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/25">
            <a href="/legal" className="transition hover:text-white/60">
              Termos e Condições
            </a>
            <span>·</span>
            <a href="/privacy" className="transition hover:text-white/60">
              Política de Privacidade
            </a>
          </div>

          <p className="text-[11px] leading-relaxed text-white/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos
            Reservados — CNPJ: 43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}

// Ícones inline da seção "Guias" — sem depender de lucide-react (não estava
// instalado no projeto e quebrou o build).
function IconPlane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12 22 3l-9 20-2-9-9-2z" />
    </svg>
  );
}

function IconExchange({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 7h12M14 3l4 4-4 4" />
      <path d="M18 17H6m4 4-4-4 4-4" />
    </svg>
  );
}

function IconLuggage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="4" y1="13" x2="20" y2="13" />
    </svg>
  );
}

function IconTrain({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="3" width="14" height="14" rx="4" />
      <line x1="12" y1="3" x2="12" y2="11" />
      <line x1="5" y1="11" x2="19" y2="11" />
      <circle cx="9" cy="20" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="20" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconCar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 16V11l2-5h12l2 5v5" />
      <path d="M2 16h20" />
      <path d="M5 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <path d="M16 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <circle cx="7.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconExit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M4 12h13" />
      <path d="M13 8l4 4-4 4" />
    </svg>
  );
}

function SectionMarker({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b79ce6] text-xs font-semibold text-black">
        {number}
      </span>
      <p className="text-xs uppercase tracking-[0.35em] text-[#b79ce6]">
        {label}
      </p>
    </div>
  );
}

function IconMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
      <path d="M9 3v16" />
      <path d="M15 5v16" />
    </svg>
  );
}

function MapCard({
  href,
  label,
  variant = "dark",
}: {
  href: string;
  label: string;
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";
  return (
    <a
      href={href}
      className={`group flex items-center gap-4 rounded-2xl border p-5 transition ${
        dark
          ? "border-[#2f80c9]/30 bg-[#0f2340] hover:border-[#2f80c9]/60"
          : "border-black/10 bg-black/[0.02] hover:border-black/25"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          dark ? "bg-[#2f80c9]/20 text-[#8fc0f0]" : "bg-black/10 text-black/70"
        }`}
      >
        <IconMap className="h-5 w-5" />
      </span>
      <div>
        <p
          className={`text-sm font-medium ${dark ? "text-white" : "text-black"}`}
        >
          {label}
        </p>
        <p
          className={`text-xs ${dark ? "text-[#8fc0f0]/70" : "text-black/45"}`}
        >
          Toque para ampliar
        </p>
      </div>
      <span
        className={`ml-auto text-lg transition group-hover:translate-x-0.5 ${dark ? "text-[#8fc0f0]/70" : "text-black/40"}`}
      >
        →
      </span>
    </a>
  );
}

function IconCastle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 21V10l3-2V6h2v2l3-2 3 2V6h2v2l3 2v11H4z" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <rect x="10" y="14" width="4" height="7" />
    </svg>
  );
}

function DashboardPreview() {
  const days = [
    { day: 1, date: "1 Out", city: "Tokyo", active: true },
    { day: 2, date: "2 Out", city: "Tokyo" },
    { day: 3, date: "3 Out", city: "Tokyo" },
    { day: 4, date: "4 Out", city: "Kyoto" },
    { day: 5, date: "5 Out", city: "Kyoto" },
    { day: 6, date: "6 Out", city: "Kyoto" },
    { day: 7, date: "7 Out", city: "Tokyo" },
  ];

  const specialRoutes = [
    {
      title: "Restaurantes",
      image: "/images/sugita.png",
    },
    {
      title: "Compras",
      image: "/images/greubel.png",
    },
  ];

  const guides = [
    { label: "Aeroportos", Icon: IconPlane },
    { label: "Câmbio", Icon: IconExchange },
    { label: "Logística", Icon: IconLuggage },
    { label: "Trem Bala (Shinkansen)", Icon: IconTrain },
    { label: "Parques de Diversão (Disney & USJ)", Icon: IconCastle },
  ];

  return (
    <div className="mx-auto overflow-hidden rounded-[1.5rem] border border-white/10 bg-black px-5 py-8 shadow-2xl sm:px-10 md:rounded-[2rem] md:px-14 md:py-16">
      <div className="text-center">
        <p className="mx-auto mb-8 inline-block rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
          Roteiro de 7 dias
        </p>

        <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
          Cidades
        </p>
        <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6">
          {[
            { city: "Tokyo", days: "3 dias" },
            { city: "Kyoto", days: "3 dias", active: true },
            { city: "Tokyo", days: "1 dia" },
          ].map((stop, index, arr) => (
            <div
              key={`${stop.city}-${index}`}
              className="flex items-center gap-4"
            >
              <div>
                <div
                  className={`mx-auto h-14 w-14 rounded-full border ${
                    stop.active
                      ? "border-[#6f8b97]/70 bg-[#2f4854]"
                      : "border-white/15 bg-white/10"
                  }`}
                />
                <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white">
                  {stop.city}
                </p>
                <p className="mt-1 text-xs text-white/45">{stop.days}</p>
              </div>
              {index < arr.length - 1 && (
                <span className="mb-10 text-white/25">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 md:mt-14">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
          Roteiro diário
        </p>
        <p className="mb-7 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/75">
          Nesta amostra, apenas o dia 1 e os roteiros especiais estão
          disponíveis para visualização.
        </p>
        <CarouselScroller itemCount={days.length}>
          {days.map((d) => (
            <a
              key={d.day}
              href={d.active ? "#dia-1" : undefined}
              className={`w-[170px] flex-shrink-0 snap-start [scroll-snap-stop:always] rounded-xl border p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(145,170,255,0.08),0_0_28px_rgba(55,90,210,0.10)] md:w-auto md:flex-shrink ${
                d.active
                  ? "border-white bg-white text-black hover:border-[#91aaff]/40 hover:bg-white/90"
                  : "border-white/10 bg-white/[0.02] text-white/35 hover:border-[#91aaff]/25 hover:bg-[#050505] hover:text-white/65"
              }`}
            >
              <p className="font-medium">
                Dia {d.day}
                {d.active ? " →" : ""}
              </p>
              <p className="mt-1 text-sm opacity-70">
                {d.date} · {d.city}
              </p>
            </a>
          ))}
        </CarouselScroller>
      </div>

      <div className="mt-10 md:mt-16">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
          Roteiros Especiais
        </p>
        <p className="mb-7 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/75">
          Contratação à parte
        </p>
        <div className="grid max-w-[360px] grid-cols-2 gap-3 sm:gap-5">
          {specialRoutes.map((guide) => (
            <GuideCard
              key={guide.title}
              {...guide}
              href={
                guide.title === "Restaurantes"
                  ? "#preview-restaurantes"
                  : "#preview-compras"
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-10 md:mt-16">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
          Guias
        </p>
        <p className="mb-7 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/75">
          Incluso na contratação de qualquer roteiro
        </p>
        <CarouselScroller itemCount={guides.length}>
          {guides.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex w-[160px] flex-shrink-0 snap-start [scroll-snap-stop:always] min-h-[128px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-5 text-center text-sm leading-6 text-white/55 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#91aaff]/25 hover:bg-[#050505] hover:text-white/70 hover:shadow-[0_0_0_1px_rgba(145,170,255,0.08),0_0_28px_rgba(55,90,210,0.10)] md:w-auto md:flex-shrink"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </div>
          ))}
        </CarouselScroller>
      </div>
    </div>
  );
}

function GuideCard({
  title,
  image,
  href,
}: {
  title: string;
  image: string;
  href?: string;
}) {
  const isShopping = title === "Compras";
  const content = (
    <>
      <div className="relative aspect-[1.18/1] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition duration-300 group-hover:border-[#345f91]/60 group-hover:shadow-[0_0_40px_rgba(30,78,150,0.18)]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="165px"
          className={`${isShopping ? "object-contain p-2" : "object-cover"} transition-transform duration-700 ease-out group-hover:scale-[1.06]`}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        <div
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <span className="text-sm">⌕</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/55 transition duration-300 group-hover:text-white/75">
        {title}
      </p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group block max-w-[165px] cursor-zoom-in transition duration-300 ease-out hover:-translate-y-0.5"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="group max-w-[165px] transition duration-300 ease-out hover:-translate-y-0.5">
      {content}
    </article>
  );
}

function RoutePreviewModals() {
  return (
    <>
      <RoutePreviewModal
        displayClassName={display.className}
        id="preview-restaurantes"
        eyebrow="Roteiro especial"
        title="Curadoria gastronômica"
        description="Amostra visual do roteiro especial de restaurantes entregue aos clientes Ajisai."
        image="/images/roteiro-restaurantes.png"
        alt="Preview do roteiro especial de restaurantes da Ajisai"
      />
      <RoutePreviewModal
        displayClassName={display.className}
        id="preview-compras"
        eyebrow="Roteiro especial"
        title="Assessoria de compras"
        description="Amostra visual do roteiro especial de compras técnicas e categorias de alto valor."
        image="/images/roteiro-compras.png"
        alt="Preview do roteiro especial de compras da Ajisai"
      />
      <RoutePreviewModal
        displayClassName={display.className}
        id="preview-mapa-solamachi"
        eyebrow="Mapa do complexo"
        title="Tokyo Solamachi"
        description="Visão geral do primeiro andar do complexo Tokyo Solamachi, incluindo acessos à estação Oshiage, áreas comerciais, serviços, cafés, restaurantes e principais pontos de circulação."
        image="/images/solamachi-floor1.png"
        alt="Mapa do primeiro andar do Tokyo Solamachi"
      />
      <RoutePreviewModal
        displayClassName={display.className}
        id="preview-mapa-dining"
        eyebrow="Mapa de restaurantes"
        title="Solamachi Dining"
        description="Localização dos restaurantes do Tokyo Solamachi citados no roteiro."
        image="/images/solamachi-dining-map.png"
        alt="Mapa dos restaurantes do Tokyo Solamachi"
      />
      <RoutePreviewModal
        displayClassName={display.className}
        id="preview-mapa-oshiage"
        eyebrow="Mapa da estação"
        title="Oshiage Station"
        description="Plantas B1F, B2F e B3F da estação Oshiage, com saídas, escadas rolantes, elevadores e conexões entre as linhas Tobu Skytree, Keisei Oshiage, Toei Asakusa e Tokyo Metro Hanzomon."
        image="/images/oshiagemap.png"
        alt="Mapa da estação Oshiage"
      />
    </>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-white/10 pt-10">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
        {title}
      </p>
      <p>{text}</p>
    </div>
  );
}

function RecommendationRow({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[34px_1fr] gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b79ce6]/12 text-base">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/55">{text}</p>
      </div>
    </div>
  );
}

function RoutePreviewModal({
  id,
  eyebrow,
  title,
  description,
  image,
  alt,
  displayClassName,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  displayClassName: string;
}) {
  return (
    <section
      id={id}
      className="fixed inset-0 z-[90] hidden overflow-y-auto bg-black/95 px-4 py-8 target:block md:px-8"
    >
      <a
        href="#_"
        aria-label="Fechar prévia"
        className="fixed right-4 top-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-4xl leading-none text-black shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition hover:bg-white/90 md:right-8 md:top-8 md:h-16 md:w-16 md:text-5xl"
      >
        ×
      </a>
      <div className="mx-auto max-w-5xl pt-12">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">
          {eyebrow}
        </p>
        <h3
          className={`${displayClassName} text-3xl font-medium text-white md:text-5xl`}
        >
          {title}
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
          {description}
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <Image
            src={image}
            alt={alt}
            width={1600}
            height={1200}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

function RestaurantBlock({
  name,
  description,
  location,
  price,
  hours,
  photo,
}: {
  name: string;
  description: string;
  location: string;
  price: string;
  hours: string;
  photo?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 md:p-4">
      {photo && (
        <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <Image
            src={photo}
            alt={name}
            width={420}
            height={420}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h3 className="mt-3 text-sm font-medium leading-snug text-white md:text-base">
        {name}
      </h3>
      <p className="mt-1 text-xs leading-5 text-[#d9a66d] md:text-sm">
        {description}
      </p>

      <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/45 md:text-xs">
        <p>📍 {location}</p>
        <p>¥ {price}</p>
        <p>🕒 {hours}</p>
      </div>
    </article>
  );
}
