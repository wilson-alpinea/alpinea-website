import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { TripDashboard } from "../components/TripDashboard";

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
    <main className="min-h-screen bg-black text-white">
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
          className="rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white"
        >
          Falar com a Alpinea
        </a>
      </header>

      {/* ── SEÇÃO 1 — HERO ── */}
      <section className="relative min-h-[760px] overflow-hidden">
        <Image
          src="/images/onsenkonanso.jpg"
          alt="Japão — viagem privada Alpinea"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.25) 38%, transparent 55%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 px-8 pb-8 text-center md:px-16 md:pb-10">
          <div className="mx-auto max-w-2xl">
            <h1 className={`${display.className} text-4xl font-medium leading-[1.15] tracking-tight md:text-5xl`}>
              Viagens privadas e concierge de luxo
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-8 text-white/65 md:text-lg">
              Confira abaixo alguns dos nossos exemplos de roteiros
              personalizados para o Japão.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 2 — OVERVIEW DOS TIPOS DE ROTEIRO ── */}
      <section className="bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className={`${display.className} text-3xl font-medium leading-snug text-white md:text-4xl`}>
            Somos a{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              única agência brasileira 100% focada no Japão
            </span>{" "}
            para o mercado de luxo.
          </h2>

          <div className="mt-16">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
              Nossos roteiros:
            </p>
            <p className="mx-auto max-w-xl text-lg font-light leading-9 text-white/65">
              Roteiros personalizados para sua viagem, independente da duração.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {["7 dias", "10 dias", "12 dias", "15 dias", "20+ dias"].map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-white/25 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white/70"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 3 — EXEMPLO DE ROTEIRO ── */}
      <section className="border-t border-white/10 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className={`${display.className} mb-6 text-3xl font-medium text-white md:text-4xl`}>
              Painel Interativo & Exemplo de Roteiro
            </h2>
            <p className="text-lg font-light leading-9 text-white/65">
              Nossos roteiros são fornecidos digitalmente num painel
              interativo, para você acessar a informação que precisa
              rapidamente. Abaixo você confere um exemplo do painel e um
              pedaço do roteiro:
            </p>
          </div>

          <div className="relative">
            {/* Glow ambiente atrás do "tablet" — paleta da marca, suave e fora de foco */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-16 -inset-y-24 -z-10 overflow-hidden blur-3xl"
            >
              <div className="absolute -left-10 top-0 h-80 w-80 rounded-full bg-red-600/25" />
              <div className="absolute left-1/3 top-6 h-72 w-72 rounded-full bg-orange-500/20" />
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/15" />
            </div>

            <TripDashboard
              days={[
                { day: 1, date: "1 Out", city: "Tokyo", href: "#dia-1" },
                { day: 2, date: "2 Out", city: "Tokyo" },
                { day: 3, date: "3 Out", city: "Tokyo" },
                { day: 4, date: "4 Out", city: "Kyoto" },
                { day: 5, date: "5 Out", city: "Kyoto" },
                { day: 6, date: "6 Out", city: "Kyoto" },
                { day: 7, date: "7 Out", city: "Tokyo" },
              ]}
              guides={[
                { label: "Restaurantes" },
                { label: "Hotéis" },
                { label: "Compras" },
              ]}
              annexes={[
                { label: "Aeroporto Chegada Narita NRT" },
                { label: "Aeroporto Partida Narita NRT" },
                { label: "Instruções Conexão em Doha DOH" },
                { label: "Dinheiro e Pagamentos" },
                { label: "Apps e Conectividade" },
                { label: "Trem Bala (Shinkansen)" },
                { label: "Logística de Malas" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── PEDAÇO DO ROTEIRO — AMOSTRA DO DIA 1 ── */}
      <section id="dia-1" className="border-t border-white/10 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="group cursor-default border border-white/10 bg-white/[0.035] px-8 py-8 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-200/30 hover:bg-white/[0.05] hover:shadow-[0_30px_90px_-25px_rgba(255,175,90,0.3)] md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45 transition-colors duration-500 group-hover:text-amber-200/70">Dia 1</p>
            <h3 className={`${display.className} text-4xl font-medium tracking-tight text-white md:text-6xl`}>Tokyo</h3>
            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Chegada ao Japão, acomodação inicial e primeira experiência em
              Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo Solamachi.
            </p>
          </div>

          <div className="mt-6 border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Resumo do Dia 1</p>
            <div className="space-y-6 text-sm leading-8 text-white/55">
              <div className="flex items-start gap-6">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">10:30</span>
                <p className="text-white/80">Chegada · Aeroporto Internacional de Narita — Terminal 3</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">11:30</span>
                <p>Imigração, retirada de bagagem e deslocamento até o hotel</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">15:00</span>
                <p className="text-white/80">Check-in · The Peninsula Tokyo</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">16:00</span>
                <p>Saída do hotel rumo a Oshiage</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">16:30</span>
                <p className="text-white/80">Tokyo Skytree · Subida ao observatório para o pôr do sol</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">18:30</span>
                <p>Exploração do Tokyo Solamachi · lojas e gastronomia</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">20:00</span>
                <p>Retorno ao hotel · noite livre</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Próximo passo
          </p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Uma viagem excepcional começa com uma curadoria excepcional.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/60">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea
            estrutura o roteiro a partir do seu perfil.
          </p>
          <ContactCTA />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
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
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
