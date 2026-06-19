import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Alpinea | Dia 8 — Kyoto",
  description:
    "Dia 8 do roteiro Alpinea Private: Kinkaku-ji, almoço no Niku Kappou Miyata e Yoiyama do Gion Matsuri.",
};

export default function Day8Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/">
          <img
            src="/images/ALPINEA-LOGO-transparent.png"
            alt="Alpinea"
            className="h-8 w-auto object-contain"
          />
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/gastro" className="transition hover:text-white">Restaurantes</a>
          <a href="/guia" className="transition hover:text-white">Compras</a>
          <a href="/preview" className="transition text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-[720px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <Image
          src="/images/ginzan-onsen.jpg"
          alt="Alpinea — Dia 8 Kyoto"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Roteiro Alpinea Private
          </p>
          <h1 className={`${display.className} max-w-5xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl`}>
            Um exemplo real
            <br />
            de uma jornada Alpinea.
          </h1>
          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Uma prévia da forma como estruturamos roteiros: contexto, ritmo,
            logística e experiências cuidadosamente selecionadas.
          </p>
        </div>
      </section>

      {/* Perfil */}
      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm font-light leading-8 text-white/70">
            <PreviewItem title="Perfil" text="Casal com 2 filhos" />
            <PreviewItem title="Cidade" text="Kyoto" />
            <PreviewItem title="Curadoria" text="Alpinea Private" />
            <PreviewItem title="Dinâmica" text="Motorista privado · Atração matinal · Almoço degustação · Festival noturno" />
          </div>
        </div>
      </section>

      {/* Card do Dia */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">Dia 8</p>
            <h2 className={`${display.className} text-4xl font-medium tracking-tight text-white md:text-6xl`}>Kyoto</h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Kinkaku-ji ao amanhecer, menu degustação de wagyu no Niku Kappou Miyata
              e Yoiyama do Gion Matsuri à noite.
            </p>

            {/* Hospedagem */}
            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Hospedagem</p>
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.25fr_0.95fr] lg:items-center">
                <div className="flex min-h-40 items-center justify-center px-8 py-10">
                  <Image
                    src="/images/amankyoto.png"
                    alt="Aman Kyoto"
                    width={520}
                    height={260}
                    className="mx-auto h-auto w-full max-w-[260px] object-contain"
                  />
                </div>
                <div>
                  <p className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Aman Kyoto</p>
                  <p className="mt-5 max-w-2xl text-base font-light leading-8 text-white/50">
                    1 Okitayama Washimine-cho, Kita Ward, Kyoto
                  </p>
                </div>
                <div className="grid gap-6 text-sm leading-7 text-white/50 lg:grid-cols-1">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/30">Noite</p>
                    <p className="text-white/80">Primeiro dia em Kyoto</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/30">Reserva</p>
                    <p className="text-white/80">Confirmada · Alpinea Private</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESUMO DO DIA ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Resumo do Dia 8</p>
            <div className="space-y-6 text-sm leading-8 text-white/55">
              <div className="flex items-start gap-6">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">07:30</span>
                <p className="text-white/80">Café da manhã · The Living Pavilion by Aman</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">08:30</span>
                <p>Motorista Tanaka · Toyota Alphard · Saída do Aman Kyoto</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">09:00</span>
                <p>Kinkaku-ji · Percurso pelo jardim com assessor</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">10:30</span>
                <p>Retorno ao veículo · Deslocamento para o restaurante</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">12:00</span>
                <p className="text-white/80">Almoço · Niku Kappou Miyata · Menu Degustação de Wagyu</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">14:00</span>
                <p>Retorno ao Aman Kyoto · Descanso</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">17:00</span>
                <p>Motorista privado · Deslocamento para o Gion Matsuri</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">17:30</span>
                <p className="text-white/80">Yoiyama · Sakimatsuri · Niwatori-Hoko · Ayasaka-Hoko · Funahoko</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.06] pt-5">
                <span className="mt-0.5 shrink-0 text-xs tracking-[0.2em] text-white/25 w-12">21:30</span>
                <p>Motorista privado · Retorno ao Aman Kyoto</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Alpinea Private · Suporte no dia</p>
            <p className="text-sm leading-8 text-white/50">
              Um representante da Alpinea coordena cada etapa do dia — logística, acessos e comunicação com os estabelecimentos. Disponível das 08:00 às 22:00 pelo canal dedicado.
            </p>
          </div>
        </div>
      </section>

      {/* ── CAFÉ DA MANHÃ — THE LIVING PAVILION ── */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-base font-light leading-9 text-white/65">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã · Café da Manhã</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>The Living Pavilion by Aman</h3>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Horário</p>
                    <p className="text-white/85">07:00 às 11:30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Opções</p>
                    <p className="text-white/85">Japonesa · Ocidental</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Horário sugerido</p>
                    <p className="text-white/85">07:30 – 08:15</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-5">
                <p className="text-xs uppercase tracking-[0.35em] text-white/30">Nota</p>
                <p>
                  O café da manhã japonês inclui desde miso soup e tsukemono até peixe grelhado com arroz — uma refeição completa, como os japoneses encaram essa hora do dia. Como o almoço será o menu degustação de wagyu, recomendamos uma escolha mais leve pela manhã.
                </p>
                <p>
                  O complexo do Kinkaku-ji possui lojas com sorvete de matcha ao longo do percurso, caso queiram uma pausa durante a visita.
                </p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/amancafe.jpg"
                alt="Café da manhã — The Living Pavilion by Aman Kyoto"
                width={900}
                height={760}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "460px", objectFit: "cover" }}
              />
              <Image
                src="/images/amancafe2.jpg"
                alt="The Living Pavilion by Aman Kyoto"
                width={900}
                height={760}
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">
                The Living Pavilion by Aman · Aman Kyoto
              </p>

              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/30">Breakfast Menu</p>
                <a href="/images/aman-breakfast.png" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/aman-breakfast.png"
                    alt="Breakfast Menu — The Living Pavilion by Aman Kyoto"
                    width={900}
                    height={1200}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-xs leading-6 text-white/30">
                  Menu completo · Clique para ampliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPORTE PRIVADO ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-12 text-base font-light leading-9 text-white/65">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Transporte Privado</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Motorista Dedicado</h3>
              </div>

              <p className="max-w-xl">
                Toda a logística do dia é coordenada pela Alpinea com motorista exclusivo para a família. O veículo aguarda na saída do hotel em cada deslocamento.
              </p>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Veículo</p>
                    <p className="text-white/85">Toyota Alphard 2025 · Preto Ônix</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Motorista</p>
                    <p className="text-white/85">Tanaka Hiroshi</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Placa</p>
                    <p className="text-white/60 text-sm">京都 300 · す 4817</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Idiomas</p>
                    <p className="text-white/60 text-sm">Japonês · Inglês básico</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna direita — nameplate + exterior + interior */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/asphard-nameplate.png"
                alt="Toyota Alphard — Nameplate"
                width={1320}
                height={440}
                className="w-full object-contain"
              />
              <Image
                src="/images/limo.png"
                alt="Toyota Alphard 2025 — Transporte Privado Alpinea"
                width={1320}
                height={880}
                priority
                className="w-full object-contain"
              />
              <Image
                src="/images/asphard-interior.png"
                alt="Toyota Alphard 2025 — Interior"
                width={1320}
                height={880}
                className="w-full rounded-2xl border border-white/10 object-cover"
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">
                Toyota Alphard 2025 · Preto Ônix
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KINKAKU-JI — MANHÃ ── */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-base font-light leading-9 text-white/65">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã · Atração</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Kinkaku-ji</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/30">Templo do Pavilhão de Ouro</p>
              </div>

              <p className="max-w-xl">
                Patrimônio Mundial da UNESCO. O pavilhão de três andares, revestido por folhas de ouro puro, reflete-se sobre o lago Kyōkochi num dos cenários mais fotografados do Japão.
              </p>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Chegada</p>
                    <p className="text-white/85">09:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Duração</p>
                    <p className="text-white/85">1h – 1h30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Ingresso</p>
                    <p className="text-white/85">¥500 / pessoa</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-8">
                <InfoBlock
                  title="Por que às 09:00"
                  text="Os ônibus turísticos chegam a partir das 09:30. Os primeiros trinta minutos têm movimento reduzido — a luz da manhã está mais baixa e o reflexo do pavilhão sobre o lago, mais nítido."
                />
                <InfoBlock
                  title="O percurso"
                  text="O circuito segue um caminho fixo em torno do lago, com o pavilhão sempre à vista. O jardim é do período Muromachi e inclui pedras, pinheiros e ilhotas posicionados com precisão centenária. A saída passa pela loja de amuletos (omamori)."
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-28 space-y-10">
              <div>
                <Image
                  src="/images/kinka.jpeg"
                  alt="Kinkaku-ji — Templo do Pavilhão de Ouro, Kyoto"
                  width={900}
                  height={1200}
                  priority
                  className="w-full rounded-2xl border border-white/10 object-cover"
                  style={{ maxHeight: "780px", objectPosition: "center" }}
                />
                <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/30">
                  Kinkaku-ji · Kita Ward · Kyoto
                </p>
              </div>
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/30">Mapa do Templo</p>
                <a href="/images/kinkamap.jpg" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/kinkamap.jpg"
                    alt="Mapa do Kinkaku-ji"
                    width={1200}
                    height={800}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] p-2 transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-xs leading-6 text-white/30">
                  Complexo completo — Pavilhão de Ouro, jardim Muromachi, lago Kyōkochi, casa de chá Sekkatei. Clique para ampliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALMOÇO — NIKU KAPPOU MIYATA ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-base font-light leading-9 text-white/65">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Almoço · Menu Degustação</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Niku Kappou Miyata</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/30">肉割烹 宮田</p>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Horário</p>
                    <p className="text-white/85 text-lg">12:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Formato</p>
                    <p className="text-white/85">Menu Degustação · Kappou</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Reserva</p>
                    <p className="text-white/85">Confirmada · Alpinea Private</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Duração estimada</p>
                    <p className="text-white/85">1h30 – 2h</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-5">
                <p className="text-xs uppercase tracking-[0.35em] text-white/30">Nota</p>
                <p>
                  Um dos poucos restaurantes de menu degustação de wagyu no Japão. O chef raramente interage com os clientes, preferindo se concentrar no preparo — cada corte apresentado em silêncio, no ritmo do kappou. Alguns optam por um whisky japonês para acompanhar: The Chita ou The Yamazaki da Suntory funcionam bem.
                </p>
                <p>
                  Os pratos são em sua maioria porções pequenas. O último prato — wagyu com arroz japonês cozido no próprio vapor — é generoso e encerra a refeição com satisfação. Como a próxima refeição será somente durante o festival, vale aproveitar.
                </p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/niku.png"
                alt="Menu Degustação de Wagyu — Niku Kappou Miyata"
                width={900}
                height={760}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "600px", objectPosition: "center" }}
              />
              <Image
                src="/images/nikufood.jpeg"
                alt="Prato do Menu Degustação — Niku Kappou Miyata"
                width={900}
                height={760}
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "480px", objectFit: "cover", objectPosition: "center" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">
                Niku Kappou Miyata · Kyoto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPIRO — CTA INTERMEDIÁRIO ── */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className={`${display.className} text-2xl font-medium leading-relaxed text-white/60 md:text-3xl`}>
            Cada detalhe deste dia foi definido antes de você chegar.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white hover:text-white"
            >
              Iniciar um Roteiro
            </a>
          </div>
        </div>
      </section>

      {/* ── YOIYAMA, SAKIMATSURI — GION MATSURI ── */}
      <section id="matsuri" className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-base font-light leading-9 text-white/65">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Tarde · Noite · Festival</p>
                <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Yoiyama, Sakimatsuri</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/30">祇園祭 · Gion Matsuri</p>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Data</p>
                    <p className="text-white/85">10 de Julho</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Período</p>
                    <p className="text-white/85">Sakimatsuri · Yoiyama</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Saída do hotel</p>
                    <p className="text-white/85">17:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Ingresso</p>
                    <p className="text-white/85">Acesso livre</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-8">
                <InfoBlock
                  title="O festival"
                  text="O Gion Matsuri dura quase um mês e se divide em três etapas: Sakimatsuri, Yamahoko Junko e Atomatsuri — respectivamente pré-desfile, desfile e pós-desfile. O ápice não é o dia do desfile em si, mas a véspera, quando os Hoko — estruturas de madeira com lanternas e tapeçarias seculares — são expostos iluminados nos quarteirões ao redor do templo Yasaka. Esse momento se chama Yoiyama."
                />
                <InfoBlock
                  title="O percurso"
                  text="Partimos do hotel às 17:00 e seguimos a pé pelo Niwatori-Hoko, Ayasaka-Hoko e Funahoko — cada um em um quarteirão diferente. O deslocamento é lento, com paradas nas barracas de comida de rua ao longo do caminho. O Iwatoyama pode ser incluído ao final, caso haja interesse."
                />
                <InfoBlock
                  title="Logística"
                  text="O motorista Tanaka aguarda em ponto fixo nas proximidades. A região central é fechada para veículos no período noturno — o acesso à área do festival é sempre a pé a partir de um ponto designado pela Alpinea."
                />
              </div>

              <div className="border-t border-white/10 pt-10">
                <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Retorno</p>
                <p>Motorista privado busca a família por volta das <span className="text-white/85">21:30 – 22:00</span>. Trajeto até o Aman Kyoto: aproximadamente <span className="text-white/85">20 minutos</span>.</p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/logomatsuri.png"
                alt="Gion Matsuri"
                width={760}
                height={400}
                className="w-full object-contain"
              />
              <Image
                src="/images/gionmatsuri2.png"
                alt="Gion Matsuri — Yoiyama, Sakimatsuri, Kyoto"
                width={760}
                height={1140}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "820px", objectPosition: "center top" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">
                Gion Matsuri · Yoiyama · Shijo · Kyoto
              </p>
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/30">Rota da Procissão Yamahoko</p>
                <a href="/images/masturiroute.png" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/masturiroute.png"
                    alt="Mapa da rota da procissão Yamahoko — Gion Matsuri"
                    width={800}
                    height={1100}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] p-2 transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-xs leading-6 text-white/30">
                  Histórico das rotas do Yamahoko Float · Clique para ampliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/35">
            Próximo passo
          </p>
          <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
            Uma viagem excepcional começa com uma curadoria excepcional.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-base leading-9 text-black/50">
            Compartilhe suas datas e perfil de viagem. A Alpinea estrutura o roteiro a partir daí.
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
              <p className="text-sm leading-relaxed text-white/40">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/25">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/20">
                <a href="/legal" className="transition hover:text-white/50">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/50">Política de Privacidade</a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/35">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">{title}</p>
      <p className="text-sm leading-7">{text}</p>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-white/85">{title}</p>
      <p className="mt-2">{text}</p>
    </div>
  );
}
