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
  title: "Alpinea | Roteiros Personalizados para o Japão",
  description:
    "Roteiros personalizados para viajantes que buscam profundidade, conforto e experiências exclusivas no Japão.",
};

export default function PreviewPage() {
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

      <section className="relative min-h-[720px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <Image
          src="/images/ginzanonsen.jpg"
          alt="Ginzan Onsen"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Roteiro Alpinea
          </p>
          <h1 className={`${display.className} max-w-5xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl`}>
            Um exemplo real
            <br />
            de uma jornada Alpinea.
          </h1>
          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Uma prévia simplificada da forma como estruturamos roteiros:
            contexto, ritmo, logística, atrações, horários recomendados,
            restaurantes e oportunidades de compras.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <p className={`${display.className} mb-12 text-center text-2xl font-medium text-white md:text-3xl`}>
            Briefing
          </p>

          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Ritmo da viagem</p>
            <p className="text-base font-light leading-9 text-white/65">
              Bastante tempo livre, com uma atração turística no período da manhã e uma à tarde. Noites livres para descanso, compras ou experiências espontâneas.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm font-light leading-8 text-white/70">
            <PreviewItem title="Perfil do viajante" text="Casal sem filhos" />
            <PreviewItem title="Cidades sugeridas" text="Tokyo, Osaka e Kyoto" />
            <PreviewItem title="Estilo de curadoria" text="Alpinea Design" />
            <PreviewItem title="Duração da viagem" text="15 Dias" />
          </div>

          <div className="mt-12 border-t border-white/10 pt-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/30">A Curadoria em Números</p>
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
              <StatItem value="15" label="dias" />
              <StatItem value="3" label="cidades" />
              <StatItem value="27" label="atrações" />
              <StatItem value="12" label="restaurantes recomendados" />
              <StatItem value="8" label="guias complementares" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MEU DASHBOARD DE VIAGEM ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <TripDashboard
            days={[
              { day: 1, date: "1 Out", city: "Tokyo", href: "#dia-1" },
              { day: 2, date: "2 Out", city: "Tokyo" },
              { day: 3, date: "3 Out", city: "Tokyo" },
              { day: 4, date: "4 Out", city: "Tokyo" },
              { day: 5, date: "5 Out", city: "Tokyo" },
              { day: 6, date: "6 Out", city: "Tokyo" },
              { day: 7, date: "7 Out", city: "Tokyo" },
              { day: 8, date: "8 Out", city: "Osaka" },
              { day: 9, date: "9 Out", city: "Osaka" },
              { day: 10, date: "10 Out", city: "Osaka" },
              { day: 11, date: "11 Out", city: "Osaka" },
              { day: 12, date: "12 Out", city: "Kyoto" },
              { day: 13, date: "13 Out", city: "Kyoto" },
              { day: 14, date: "14 Out", city: "Kyoto" },
              { day: 15, date: "15 Out", city: "Tokyo" },
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
      </section>

      <section id="dia-1" className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">Dia 1</p>
            <h2 className={`${display.className} text-4xl font-medium tracking-tight text-white md:text-6xl`}>Tokyo</h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Chegada ao Japão, acomodação inicial e primeira experiência em
              Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo Solamachi.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOSPEDAGEM — GRAND HYATT TOKYO ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[75vh] min-h-[560px] max-h-[720px] w-full overflow-hidden">
          <Image
            src="/images/grandhyatt.png"
            alt="Grand Hyatt Tokyo — piscina e spa"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">Hospedagem</p>
              <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Grand Hyatt Tokyo</h3>
            </div>
          </div>
        </div>

        <div className="px-8 py-24 md:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <Image
                  src="/images/grandhyattlogo.png"
                  alt="Grand Hyatt Tokyo"
                  width={520}
                  height={260}
                  className="w-full max-w-xs object-contain"
                />
                <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-white/60">
                  6 Chome-10-3 Roppongi, Minato City, Tokyo 106-0032, Japão
                </p>
              </div>
              <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Check-In</p>
                  <p className="text-lg text-white">15:00</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Reserva</p>
                  <p className="text-lg text-white">Confirmada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">Alpinea Design · Concierge remoto (opcional)</p>
            <p className="text-sm leading-8 text-white/50">
              Este roteiro foi desenhado para ser seguido com autonomia. Se preferir um canal de apoio durante a viagem — para dúvidas, imprevistos ou ajustes de última hora — o concierge remoto pode ser adicionado ao seu pacote.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className={`${display.className} mb-8 text-3xl font-medium text-white md:text-4xl`}>Manhã</p>
          <div className="max-w-4xl space-y-8 text-lg font-light leading-9 text-white/70">
            <p>
              <span className="text-white">Local:</span> Aeroporto Internacional de Narita — Terminal 3
            </p>
            <p>
              Instruções gerais de chegada, imigração, retirada de bagagem,
              restaurantes sugeridos no aeroporto, ações obrigatórias antes de
              sair do aeroporto, comentários gerais e guia de deslocamento até o hotel.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className={`${display.className} mb-8 text-3xl font-medium text-white md:text-4xl`}>Tarde</p>
          <p className="max-w-4xl text-lg font-light leading-9 text-white/70">
            <span className="text-white">Local:</span> Oshiage, Tokyo
          </p>
        </div>
      </section>

      {/* ── MOBILIDADE — TRENS E METRÔ ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[75vh] min-h-[560px] max-h-[720px] w-full overflow-hidden">
          <Image
            src="/images/Nex_train.jpg"
            alt="Narita Express (N'EX) — JR East"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">Mobilidade</p>
              <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Trens e Metrô</h3>
              <p className="mx-auto mt-5 max-w-xl text-base font-light leading-9 text-white/65">
                No Alpinea Design, o deslocamento é por conta própria — e o Japão torna isso simples. A malha de trens e metrô é pontual, extensa e fácil de navegar com os recursos certos.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-24 md:px-16">
          <div className="mx-auto max-w-3xl space-y-12 text-center text-base font-light leading-9 text-white/65">
            <div className="pt-2 space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">Cartão IC recomendado</p>
              <p className="mx-auto max-w-xl">
                O Welcome Suica cobre praticamente todo trem, metrô e ônibus do país — basta aproximar o celular ou o cartão físico na entrada e saída de cada estação, sem precisar comprar passagem a cada trajeto.
              </p>
            </div>

            <div className="border-t border-white/10 pt-10">
              <div className="mx-auto grid max-w-xl gap-8 text-left sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">App de navegação</p>
                  <p className="text-white/85">Google Maps</p>
                  <p className="mt-1 text-sm text-white/45">Rotas, horários e plataforma de embarque em tempo real</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Horário de pico</p>
                  <p className="text-white/60 text-sm">Evitar 07:30–09:00 e 17:30–19:30, dias de semana</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10 text-left">
              <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-white/30">Acesso à Estação · Oshiage</p>
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
                  Keisei Oshiage Line, Toei Asakusa Line e Tokyo Metro Hanzomon Line.
                </p>
                <div className="mt-10 space-y-8">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Nome da Estação</p>
                    <p className="text-white">Oshiage Station 押上駅〈スカイツリー前〉</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Saída Recomendada</p>
                    <p>A2 ou B3 para superfície. Em dias de chuva, recomendamos utilizar a conexão subterrânea direta com o Tokyo Solamachi.</p>
                    <p className="mt-4 text-white">連絡通路直結 Solamachi B3F</p>
                    <p className="mt-4">Caso encontre dificuldades, qualquer funcionário do metrô poderá indicar a direção correta.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <div className="mx-auto grid max-w-xl gap-8 text-left sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Tempo de deslocamento · Metrô</p>
                  <p className="text-white">Aproximadamente 40 minutos</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Tempo de deslocamento · Carro / Táxi</p>
                  <p className="text-white">Aproximadamente 35 minutos</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10 text-left">
              <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-white/30">Recomendação Alpinea</p>
              <p className="mx-auto max-w-xl text-center">
                A partir do Grand Hyatt Tokyo, a diferença de tempo entre metrô e
                carro/táxi é irrelevante. O táxi proporciona maior comodidade,
                mas a diferença de preço é grande. Em caso de chuva ou vento
                forte, recomendamos substituir por outra atração, pois, embora
                seja um local fechado, devido à altura, o observatório pode balançar mais que o normal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ATRAÇÃO — TOKYO SKYTREE ── */}
      <section className="border-t border-white/10">
        <div className="relative h-[75vh] min-h-[560px] max-h-[720px] w-full overflow-hidden">
          <Image
            src="/images/skytree3.jpg"
            alt="Tokyo Skytree"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-14 text-center md:px-16 md:pb-16">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">Atração</p>
              <h3 className={`${display.className} text-3xl font-medium text-white md:text-4xl`}>Tokyo Skytree</h3>
            </div>
          </div>
        </div>

        <div className="px-8 py-32 md:px-16">
          <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Melhor horário</p>
                    <p className="text-white">16:30–18:30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Tempo estimado</p>
                    <p className="text-white">1–2 horas</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Reserva</p>
                    <p className="text-white">Recomendada</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Horário de funcionamento</p>
                    <p className="text-white">10:00 às 22:00</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Ingressos</p>
                <div className="mt-2 space-y-2">
                  <p>1. Visita ao 350º andar — Tembo Deck</p>
                  <p>2. Visita ao 350º e 450º andar</p>
                  <p>3. Ingresso separado para a Tembo Galleria</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Preço estimado</p>
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
              <InfoBlock
                title="Comentários"
                text="Eu normalmente compro o ingresso para o 350º andar, não vejo grande diferença entre os andares, não acho que vale a pena o restaurante e nem a galeria que ficam no topo da torre. As opções de comida na base são melhores, o complexo tem uma quantidade gigante de lojas. Recomendo passar nas lojas depois de subir para não precisar carregar peso. Todos os restaurantes costumam ter filas, se programe para chegar pelo menos 30 minutos antes do horário desejado para comer. Se não estiver com muita fome, a praça de alimentação tem ótimas opções para lanches como o Gindaco, que faz o típico bolinho de polvo frito, Takoyaki, da região de Kansai."
              />
            </div>

            <div className="lg:sticky lg:top-28">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
                Mapa do Complexo Tokyo Solamachi
              </p>
              <a href="/images/solamachi-floor1.png" target="_blank" rel="noopener noreferrer" className="block">
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

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className={`${display.className} mb-8 text-3xl font-medium text-white md:text-4xl`}>
              Jantar
            </h3>
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
            <a href="/images/solamachi-dining-map.png" target="_blank" rel="noopener noreferrer" className="block">
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
      </section>

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

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">{title}</p>
      <p>{text}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`${display.className} text-2xl font-medium text-white`}>{value}</span>
      <span className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</span>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-white/10 pt-10">
      <p className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>{title}</p>
      <p className="mt-3">{text}</p>
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
        <div className="mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={photo}
            alt={name}
            width={700}
            height={520}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h3 className={`${display.className} text-2xl font-medium text-white`}>{name}</h3>
      <p className="mt-4 text-lg font-light leading-9 text-white/65">{description}</p>
      <div className="mt-6 space-y-3 text-base leading-8 text-white/55">
        <p><span className="text-white/80">Local:</span> {location}</p>
        <p><span className="text-white/80">Preço:</span> {price}</p>
        <p><span className="text-white/80">Horário:</span> {hours}</p>
      </div>
    </div>
  );
}
