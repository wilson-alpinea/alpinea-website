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
  title: "Alpinea | Roteiros Personalizados de Luxo para o Japão",
  description:
    "A única agência brasileira 100% focada em viagens de luxo para o Japão. Veja exemplos reais de roteiros privados, com guias de restaurantes, hotéis e compras.",
};

export default function RoteirosAdsPage() {
  return (
    <main className="min-h-screen bg-black pb-20 text-white md:pb-0">
      {/* ── HEADER MINIMALISTA — sem menu, foco total em conversão ── */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/">
          <img
            src="/images/ALPINEA-LOGO-transparent.png"
            alt="Alpinea"
            className="h-8 w-auto object-contain"
          />
        </a>

        <a
          href="#contact"
          className="hidden rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white md:inline-block"
        >
          Falar com a Alpinea
        </a>
      </header>

      {/* ── CTA FIXO MOBILE — mesmo padrão usado na landingpage2 ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-white/10 bg-black/95 px-4 pt-3 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <ContactCTA
          mode="single"
          channel="whatsapp"
          label="WhatsApp"
          className="flex-1"
          buttonClassName="block w-full border border-white/25 px-4 py-3 text-center text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60"
        />
        <ContactCTA
          mode="single"
          channel="email"
          label="Falar com a Alpinea"
          className="flex-1"
          buttonClassName="block w-full bg-white px-4 py-3 text-center text-xs uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
        />
      </div>

      {/* ── SEÇÃO 1 — HERO ── */}
      <section className="relative min-h-[560px] overflow-hidden bg-black md:min-h-[820px]">
        <div className="absolute inset-0 mx-auto max-w-[1800px]">
          <Image
            src="/images/ozenuma.jpeg"
            alt="Parque Nacional de Ozegahara"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute right-6 top-24 z-10 rounded-full border border-white/15 bg-black px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:right-12 md:top-28 md:text-[11px]">
            Parque Nacional de Ozegahara
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 14%, rgba(0,0,0,0.68) 32%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.06) 100%)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-16 z-10 px-8 text-center md:bottom-24 md:px-16">
          <h1
            className={`${display.className} mx-auto max-w-4xl text-3xl font-medium leading-tight text-white md:text-5xl`}
          >
            Roteiros personalizados para o Japão
          </h1>

          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3 md:mt-10 md:gap-4">
            {["7 dias", "10 dias", "12 dias", "15 dias", "20+ dias"].map(
              (d) => (
                <span
                  key={d}
                  className="cursor-default rounded-full border border-white/25 bg-black/10 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-white/75 backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white hover:text-black md:px-6 md:py-3 md:text-sm"
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
          className="absolute inset-x-0 bottom-5 z-10 flex justify-center md:hidden"
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

      {/* ── SEÇÃO 2 — CHAMADA PARA O EXEMPLO ── */}
      <section id="overview" className="bg-black px-8 py-14 md:px-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={`${display.className} text-3xl font-medium leading-snug text-white md:text-4xl`}
          >
            Receba um roteiro 100% personalizado para o seu perfil e estilo de
            viagem. Veja abaixo como funciona nossa plataforma digital.
          </h2>
        </div>
      </section>

      {/* ── SEÇÃO 3 — EXEMPLO DE ROTEIRO ── */}
      <section className="border-t border-white/10 bg-black px-8 py-14 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-16">
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
              Painel Interativo
            </p>
            <h2
              className={`${display.className} mb-6 text-3xl font-medium text-white md:text-4xl`}
            >
              Exemplo de Roteiro
            </h2>
            <p className="text-lg font-light leading-9 text-white/65">
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
        className="border-t border-white/10 px-8 py-14 md:px-16 md:py-24"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 text-center sm:rounded-[2rem] sm:p-10">
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

          <div className="mx-auto mt-10 max-w-md space-y-7">
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                10:30
              </p>
              <p className="mt-1 text-sm text-white/55">
                Chegada · Aeroporto Internacional de Narita — Terminal 3
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                11:30
              </p>
              <p className="mt-1 text-sm text-white/55">
                Imigração, retirada de bagagem e deslocamento até o hotel
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                15:00
              </p>
              <p className="mt-1 text-sm text-white/55">
                Check-in · Grand Hyatt Tokyo
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                16:00
              </p>
              <p className="mt-1 text-sm text-white/55">
                Saída do hotel rumo a Oshiage
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                16:30
              </p>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-white/55">
                <span>
                  Tokyo Skytree · Subida ao observatório para o pôr do sol
                </span>
                <span className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
                  Atração Principal
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                18:30
              </p>
              <p className="mt-1 text-sm text-white/55">
                Exploração do Tokyo Solamachi · lojas e gastronomia
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">
                20:00
              </p>
              <p className="mt-1 text-sm text-white/55">
                Retorno ao hotel · noite livre
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOSPEDAGEM — GRAND HYATT TOKYO ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[44vh] min-h-[380px] max-h-[460px] w-full overflow-hidden md:h-[75vh] md:min-h-[560px] md:max-h-[720px]">
          <Image
            src="/images/grandhyatt.png"
            alt="Grand Hyatt Tokyo — piscina e spa"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
                Hospedagem
              </p>
              <h3
                className={`${display.className} text-3xl font-medium text-white md:text-4xl`}
              >
                Grand Hyatt Tokyo
              </h3>
            </div>
          </div>
        </div>

        <div className="px-8 py-14 md:px-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.1fr_1fr] lg:items-center">
              <Image
                src="/images/grandhyattlogo.png"
                alt="Grand Hyatt Tokyo"
                width={520}
                height={260}
                className="mx-auto w-full max-w-[200px] object-contain"
              />
              <p className="text-lg font-light leading-8 text-white/60">
                6 Chome-10-3 Roppongi, Minato City, Tokyo 106-0032, Japão
              </p>
              <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                    Check-In
                  </p>
                  <p className="text-lg text-white">15:00</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                    Reserva
                  </p>
                  <p className="text-lg text-white">Confirmada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <div className="max-w-4xl space-y-8 text-lg font-light leading-9 text-white/70">
            <p>
              <span className="text-white">Local:</span> Aeroporto Internacional
              de Narita — Terminal 3
            </p>
            <p>
              Instruções gerais de chegada, imigração, retirada de bagagem,
              restaurantes sugeridos no aeroporto, ações obrigatórias antes de
              sair do aeroporto, comentários gerais e guia de deslocamento até o
              hotel.
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
          <p className="max-w-4xl text-lg font-light leading-9 text-white/70">
            <span className="text-white">Local:</span> Oshiage, Tokyo
          </p>
        </div>
      </section>

      {/* ── MOBILIDADE — TRENS E METRÔ ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[44vh] min-h-[380px] max-h-[460px] w-full overflow-hidden md:h-[75vh] md:min-h-[560px] md:max-h-[720px]">
          <Image
            src="/images/Nex_train.jpg"
            alt="Narita Express (N'EX) — JR East"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
                Mobilidade
              </p>
              <h3
                className={`${display.className} text-3xl font-medium text-white md:text-4xl`}
              >
                Trens e Metrô
              </h3>
              <p className="mx-auto mt-5 max-w-xl text-base font-light leading-9 text-white/65">
                Nesse exemplo, o deslocamento é por conta própria — e o Japão
                torna isso simples. A malha de trens e metrô é pontual, extensa
                e fácil de navegar com os recursos certos.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-14 md:px-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-12 text-center text-base font-light leading-9 text-white/65">
            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/60 p-6 text-left sm:rounded-[2rem] sm:p-10">
              <p className="mb-8 text-center text-xs uppercase tracking-[0.25em] text-white/30">
                Recomendação Alpinea
              </p>

              <div className="space-y-8">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                    Cartão IC recomendado
                  </p>
                  <p>
                    O Suica IC Card cobre praticamente todo trem, metrô e ônibus
                    do país — basta aproximar o celular ou o cartão físico na
                    entrada e saída de cada estação, sem precisar comprar
                    passagem a cada trajeto.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                    App de navegação
                  </p>
                  <p className="text-white/85">Google Maps</p>
                  <p className="mt-1 text-sm leading-7 text-white/45">
                    Rotas, horários e plataforma de embarque em tempo real
                  </p>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                    Horário de pico
                  </p>
                  <p>Evitar 07:30–09:00 e 17:30–19:30, dias de semana</p>
                </div>
              </div>
            </div>

            <div className="text-left">
              <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-white/30">
                Acesso à Estação · Oshiage
              </p>
              <div className="mx-auto max-w-xl">
                <Image
                  src="/images/oshiage-lines.png"
                  alt="Linhas ferroviárias disponíveis na estação Oshiage"
                  width={640}
                  height={260}
                  className="mx-auto w-full max-w-sm rounded-lg object-contain"
                />
                <p className="mt-4 text-center text-sm leading-7 text-white/45">
                  Oshiage Station é atendida pelas linhas Tobu Skytree Line,
                  Keisei Oshiage Line, Toei Asakusa Line e Tokyo Metro Hanzomon
                  Line.
                </p>
                <div className="mt-10 space-y-8">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                      Nome da Estação
                    </p>
                    <p className="text-white">
                      Oshiage Station 押上駅〈スカイツリー前〉
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                      Saída Recomendada
                    </p>
                    <p>
                      A2 ou B3 para superfície. Em dias de chuva, recomendamos
                      utilizar a conexão subterrânea direta com o Tokyo
                      Solamachi.
                    </p>
                    <p className="mt-4 text-white">
                      連絡通路直結 Solamachi B3F
                    </p>
                    <p className="mt-4">
                      Caso encontre dificuldades, qualquer funcionário do metrô
                      poderá indicar a direção correta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <div className="mx-auto grid max-w-xl gap-8 text-left sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                    Tempo de deslocamento · Metrô
                  </p>
                  <p className="text-white">Aproximadamente 40 minutos</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                    Tempo de deslocamento · Carro / Táxi
                  </p>
                  <p className="text-white">Aproximadamente 35 minutos</p>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/60 p-6 text-left sm:rounded-[2rem] sm:p-10">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                Recomendação Alpinea
              </p>
              <p>
                A partir do Grand Hyatt Tokyo, a diferença de tempo entre metrô
                e carro/táxi é irrelevante. O táxi proporciona maior comodidade,
                mas a diferença de preço é grande. Em caso de chuva ou vento
                forte, recomendamos substituir por outra atração, pois, embora
                seja um local fechado, devido à altura, o observatório pode
                balançar mais que o normal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ATRAÇÃO — TOKYO SKYTREE ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[44vh] min-h-[380px] max-h-[460px] w-full overflow-hidden md:h-[75vh] md:min-h-[560px] md:max-h-[720px]">
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

        <div className="px-8 py-16 md:px-16 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <div className="grid gap-8 sm:grid-cols-2">
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
              <div className="rounded-2xl border border-white/10 bg-black/60 p-6 sm:rounded-[2rem] sm:p-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">
                  Recomendação Alpinea
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
            </div>

            <div className="lg:sticky lg:top-28">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
                Mapa do Complexo Tokyo Solamachi
              </p>

              {/* Mobile — prévia recortada + lupa, abre o mapa completo em nova aba */}
              <a
                href="/images/solamachi-floor1.png"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] md:hidden"
              >
                <Image
                  src="/images/solamachi-floor1.png"
                  alt="Mapa do primeiro andar do Tokyo Solamachi"
                  fill
                  sizes="(max-width: 768px) 100vw, 0px"
                  className="scale-[1.8] object-cover object-center transition group-active:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/85 backdrop-blur-md">
                  <span className="text-base">⌕</span>
                </div>
                <p className="absolute inset-x-0 bottom-0 px-4 pb-3 text-xs uppercase tracking-[0.25em] text-white/80">
                  Toque para ampliar
                </p>
              </a>

              {/* Desktop — mapa completo, inalterado */}
              <a
                href="/images/solamachi-floor1.png"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block"
              >
                <Image
                  src="/images/solamachi-floor1.png"
                  alt="Mapa do primeiro andar do Tokyo Solamachi"
                  width={1200}
                  height={900}
                  className="w-full cursor-zoom-in rounded-xl border border-white/10 bg-white/[0.03] object-contain p-2 transition hover:opacity-85"
                />
              </a>
              <p className="mt-4 text-sm leading-7 text-white/45">
                Visão geral do primeiro andar do complexo Tokyo Solamachi,
                incluindo acessos à estação Oshiage, áreas comerciais, serviços,
                cafés, restaurantes e principais pontos de circulação.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 md:px-16 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-12 text-center">
            <span className="inline-block rounded-full border border-white/25 px-9 py-3 text-base uppercase tracking-[0.32em] text-white/80">
              Jantar
            </span>
          </p>

          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-lg font-light leading-9 text-white/70">
                A Tokyo Skytree está integrada ao shopping Tokyo Solamachi, que
                reúne diversas opções de restaurantes, praça de alimentação e um
                mercado no subsolo com alternativas para takeout.
              </p>
              <div className="mt-16 space-y-14">
                <RestaurantBlock
                  name="Hitsumabushi Bincho Tokyo Solamachi"
                  description="Restaurante especializado em enguia, com destaque para o hitsumabushi, prato típico da província de Aichi."
                  location="6º andar do Tokyo Solamachi"
                  price="Aproximadamente ¥6.000 por pessoa"
                  hours="11:00–21:00"
                  photo="/images/Hitsumabushi.png"
                />
                <RestaurantBlock
                  name="Kaiten Sushi Toriton"
                  description="Restaurante de sushi de esteira, conhecido por boa relação entre praticidade, qualidade e variedade."
                  location="6º andar do Tokyo Solamachi"
                  price="Aproximadamente ¥6.000 por pessoa"
                  hours="11:00–22:00, último pedido às 21:30"
                  photo="/images/Toriton.png"
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Mapa — Solamachi Dining
              </p>

              {/* Mobile — prévia recortada + lupa, abre o mapa completo em nova aba */}
              <a
                href="/images/solamachi-dining-map.png"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] md:hidden"
              >
                <Image
                  src="/images/solamachi-dining-map.png"
                  alt="Mapa dos restaurantes do Tokyo Solamachi"
                  fill
                  sizes="(max-width: 768px) 100vw, 0px"
                  className="scale-[1.8] object-cover object-center transition group-active:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/85 backdrop-blur-md">
                  <span className="text-base">⌕</span>
                </div>
                <p className="absolute inset-x-0 bottom-0 px-4 pb-3 text-xs uppercase tracking-[0.25em] text-white/80">
                  Toque para ampliar
                </p>
              </a>

              {/* Desktop — mapa completo, inalterado */}
              <a
                href="/images/solamachi-dining-map.png"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block"
              >
                <Image
                  src="/images/solamachi-dining-map.png"
                  alt="Mapa dos restaurantes do Tokyo Solamachi"
                  width={1200}
                  height={900}
                  className="w-full cursor-zoom-in rounded-xl border border-white/10 bg-white/[0.03] object-contain p-2 transition hover:opacity-85"
                />
              </a>
            </div>
          </div>
        </div>
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
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/60">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea
            cuidará do restante.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium uppercase tracking-[0.22em] text-black/50">
            Agenda limitada para o segundo semestre de 2026.
          </p>
          <ContactCTA />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-12 text-white md:px-16 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <img
              src="/images/ALPINEA-LOGO-transparent.png"
              alt="Alpinea"
              className="h-7 w-auto object-contain"
            />

            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/50">
                Curadoria privada de experiências, gastronomia e lifestyle no
                Japão.
              </p>

              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ
                66.491.067/0001-84
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

          <div className="flex flex-col gap-7 md:items-end">
            <nav className="flex flex-wrap items-center justify-start gap-x-7 gap-y-3 text-xs uppercase tracking-[0.25em] text-white/35 md:justify-end">
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
            </nav>

            <div className="flex flex-wrap items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
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
        </div>
      </footer>
    </main>
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
    "Aeroportos",
    "Câmbio",
    "Logística",
    "Trem Bala (Shinkansen)",
    "Parques de Diversão (Disney & USJ)",
  ];

  return (
    <div className="mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-12 shadow-2xl sm:px-10 md:px-14 md:py-16">
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

      <div className="mt-14">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
          Roteiro diário
        </p>
        <p className="mb-7 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/75">
          Nesta amostra, apenas o dia 1 e os roteiros especiais estão disponíveis para visualização.
        </p>
        <CarouselScroller itemCount={days.length}>
          {days.map((d) => (
            <a
              key={d.day}
              href={d.active ? "#dia-1" : undefined}
              className={`w-[148px] flex-shrink-0 snap-start [scroll-snap-stop:always] rounded-xl border p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(145,170,255,0.08),0_0_28px_rgba(55,90,210,0.10)] md:w-auto md:flex-shrink ${
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

      <div className="mt-16">
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

      <div className="mt-16">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
          Guias
        </p>
        <p className="mb-7 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/75">
          Incluso na contratação de qualquer roteiro
        </p>
        <CarouselScroller itemCount={guides.length}>
          {guides.map((label) => (
            <div
              key={label}
              className="flex w-[160px] flex-shrink-0 snap-start [scroll-snap-stop:always] min-h-[104px] cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 text-center text-sm leading-6 text-white/55 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#91aaff]/25 hover:bg-[#050505] hover:text-white/70 hover:shadow-[0_0_0_1px_rgba(145,170,255,0.08),0_0_28px_rgba(55,90,210,0.10)] md:w-auto md:flex-shrink"
            >
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
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100" aria-hidden>
          <span className="text-sm">⌕</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/55 transition duration-300 group-hover:text-white/75">{title}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="group block max-w-[165px] cursor-zoom-in transition duration-300 ease-out hover:-translate-y-0.5">
        {content}
      </a>
    );
  }

  return <article className="group max-w-[165px] transition duration-300 ease-out hover:-translate-y-0.5">{content}</article>;
}

function RoutePreviewModals() {
  return (
    <>
      <RoutePreviewModal
        id="preview-restaurantes"
        eyebrow="Roteiro especial"
        title="Curadoria gastronômica"
        description="Amostra visual do roteiro especial de restaurantes entregue aos clientes Alpinea."
        image="/images/roteiro-restaurantes.png"
        alt="Preview do roteiro especial de restaurantes da Alpinea"
      />
      <RoutePreviewModal
        id="preview-compras"
        eyebrow="Roteiro especial"
        title="Assessoria de compras"
        description="Amostra visual do roteiro especial de compras técnicas e categorias de alto valor."
        image="/images/roteiro-compras.png"
        alt="Preview do roteiro especial de compras da Alpinea"
      />
    </>
  );
}

function RoutePreviewModal({
  id,
  eyebrow,
  title,
  description,
  image,
  alt,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}) {
  return (
    <div
      id={id}
      className="route-preview-modal fixed inset-0 z-[100] hidden items-center justify-center bg-black/92 px-4 py-8 backdrop-blur-xl target:flex"
      aria-modal="true"
      role="dialog"
    >
      <a href="#" className="absolute inset-0" aria-label="Fechar preview" />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_120px_rgba(20,62,135,0.22)]">
        <div className="flex items-start justify-between gap-6 border-b border-white/10 px-5 py-5 md:px-8">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/35">
              {eyebrow}
            </p>
            <h3
              className={`${display.className} text-2xl font-medium text-white md:text-3xl`}
            >
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/50">
              {description}
            </p>
          </div>

          <a
            href="#"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl leading-none text-white/70 transition hover:border-white/45 hover:text-white"
            aria-label="Fechar preview"
          >
            ×
          </a>
        </div>

        <div className="overflow-auto bg-black p-4 md:p-6">
          <a
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto block max-w-5xl cursor-zoom-in"
            aria-label="Abrir imagem em tamanho completo"
          >
            <Image
              src={image}
              alt={alt}
              width={1600}
              height={2200}
              className="mx-auto h-auto w-full rounded-xl border border-white/10 object-contain transition duration-300 group-hover:opacity-90"
            />
          </a>
        </div>
      </div>
    </div>
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
    <div className="border-t border-white/10 pt-8">
      {photo && (
        <div className="mb-5 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <Image
            src={photo}
            alt={name}
            width={700}
            height={520}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h3 className="text-lg font-light leading-snug text-white">{name}</h3>

      <p className="mt-3 max-w-xl text-[15px] font-light leading-8 text-white/60">
        {description}
      </p>

      <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-white/30">
            Local
          </p>
          <p className="text-sm leading-7 text-white/58">{location}</p>
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-white/30">
            Preço
          </p>
          <p className="text-sm leading-7 text-white/58">{price}</p>
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-white/30">
            Horário
          </p>
          <p className="text-sm leading-7 text-white/58">{hours}</p>
        </div>
      </div>
    </div>
  );
}
