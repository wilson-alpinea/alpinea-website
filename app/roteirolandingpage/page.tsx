import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { TripDashboard } from "../components/TripDashboard";
import { HeroVideo } from "../components/HeroVideo";

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
          className="hidden rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white md:inline-block"
        >
          Falar com a Alpinea
        </a>
      </header>

      {/* ── SEÇÃO 1 — HERO ── */}
      <section className="relative min-h-[480px] overflow-hidden bg-black md:min-h-[760px]">
        <div className="absolute inset-0 mx-auto max-w-[1800px]">
          <HeroVideo
            src="/videos/onsenanimated.mp4"
            poster="/images/onsenkonanso.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #000 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.25) 38%, transparent 55%)",
            }}
          />
        </div>

      </section>

      {/* ── SEÇÃO 2 — OVERVIEW DOS TIPOS DE ROTEIRO ── */}
      <section className="bg-black px-8 py-24 md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className={`${display.className} mb-10 text-3xl font-medium text-white md:text-4xl`}>
            Roteiros personalizados para o Japão
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {["7 dias", "10 dias", "12 dias", "15 dias", "20+ dias"].map((d) => (
              <span
                key={d}
                className="cursor-default rounded-full border border-white/25 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
              >
                {d}
              </span>
            ))}
          </div>

          <h2 className={`${display.className} mt-10 text-3xl font-medium leading-snug text-white md:text-4xl`}>
            Independente da duração da sua viagem, temos a curadoria
            perfeita para você,{" "}
            <span className="bg-gradient-to-r from-[#1b6f93] via-[#2f9cc4] to-[#7fd4ec] bg-clip-text text-transparent">
              confira nosso exemplo abaixo.
            </span>
          </h2>
        </div>
      </section>

      {/* ── SEÇÃO 3 — EXEMPLO DE ROTEIRO ── */}
      <section className="border-t border-white/10 bg-black px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
              Painel Interativo
            </p>
            <h2 className={`${display.className} mb-6 text-3xl font-medium text-white md:text-4xl`}>
              Exemplo de Roteiro
            </h2>
            <p className="text-lg font-light leading-9 text-white/65">
              Roteiro num formato moderno e digital, para você acessar a
              informação que precisa rapidamente.
            </p>
          </div>

          <div className="relative">
            {/* Glow ambiente atrás do "tablet" — azul petróleo, suave e fora de foco */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-16 -inset-y-24 -z-10 overflow-hidden blur-3xl"
            >
              <div className="absolute -left-10 top-0 h-80 w-80 rounded-full" style={{ backgroundColor: "rgba(20,105,145,0.35)" }} />
              <div className="absolute left-1/3 top-6 h-72 w-72 rounded-full" style={{ backgroundColor: "rgba(8,32,45,0.55)" }} />
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full" style={{ backgroundColor: "rgba(20,105,145,0.25)" }} />
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
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 text-center sm:rounded-[2rem] sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Dia 1</p>
          <h3 className={`${display.className} mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl`}>Tokyo</h3>
          <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-white/55">
            Chegada ao Japão, acomodação inicial e primeira experiência em
            Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo Solamachi.
          </p>

          <div className="mx-auto mt-10 max-w-md space-y-7">
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">10:30</p>
              <p className="mt-1 text-sm text-white/55">Chegada · Aeroporto Internacional de Narita — Terminal 3</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">11:30</p>
              <p className="mt-1 text-sm text-white/55">Imigração, retirada de bagagem e deslocamento até o hotel</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">15:00</p>
              <p className="mt-1 text-sm text-white/55">Check-in · The Peninsula Tokyo</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">16:00</p>
              <p className="mt-1 text-sm text-white/55">Saída do hotel rumo a Oshiage</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">16:30</p>
              <p className="mt-1 text-sm text-white/55">Tokyo Skytree · Subida ao observatório para o pôr do sol</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">18:30</p>
              <p className="mt-1 text-sm text-white/55">Exploração do Tokyo Solamachi · lojas e gastronomia</p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.15em] text-white">20:00</p>
              <p className="mt-1 text-sm text-white/55">Retorno ao hotel · noite livre</p>
            </div>
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

      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className={`${display.className} mb-6 text-3xl font-medium text-white md:text-4xl`}>Manhã</p>
          <p className="mb-8 inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
            Não disponível na amostra de roteiro
          </p>
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

      <section className="border-t border-white/10 px-8 py-14 md:px-16 md:py-16">
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

      <section className="px-8 py-32 md:px-16">
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
