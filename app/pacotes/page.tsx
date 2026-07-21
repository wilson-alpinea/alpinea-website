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
  title: "Ajisai | Pacotes de Viagem para o Japão",
  description:
    "Pacotes completos para o Japão com a curadoria Ajisai: hotel, passagem aérea, seguro viagem, Wi-Fi, guia turístico e transfer opcionais. Primeira Viagem ao Japão, Temporada das Cerejeiras, Outono no Japão, Japão em Família, Tokyo Marathon Experience e Anime, Gaming & TCG.",
};

export default function PacotesJapaoPage() {
  const avatarColors = [
    "#7c4fd1",
    "#6ec3d9",
    "#d9a66d",
    "#5b9bd5",
    "#e0916a",
    "#8fb7d9",
  ];

  const pacotes = [
    {
      slug: "japao-classico",
      categoria: "Essencial",
      nome: "Primeira Viagem ao Japão",
      tagline: "Tóquio, Kyoto e Osaka nas paradas certas",
      descricao:
        "O roteiro ideal para quem vai ao Japão pela primeira vez: os templos de Kyoto, a energia de Tóquio e a gastronomia de Osaka, com hospedagem confortável e toda a logística resolvida do início ao fim.",
      destaques: [
        "Tóquio, Kyoto e Osaka",
        "Deslocamento entre cidades incluído no roteiro",
        "Hotéis bem localizados, próximos às estações",
        "Ideal para a primeira viagem ao Japão",
      ],
      precoDe: "R$ 11.990",
      accent: "#5b9bd5",
      selo: "⭐ Mais vendido",
      imagem: "/images/maiko.png",
      imagemAlt: "Gueixa em rua tradicional durante festival de lanternas, Japão",
      Icon: IconPin,
    },
    {
      slug: "japao-sakura",
      categoria: "Primavera · Alta temporada",
      nome: "Temporada das Cerejeiras",
      tagline: "A temporada das cerejeiras em flor",
      descricao:
        "Viaje entre o final de março e início de abril para acompanhar a florada das cerejeiras em parques, templos e avenidas históricas — um dos espetáculos naturais mais aguardados do mundo.",
      destaques: [
        "Época da florada das sakuras",
        "Parques e pontos panorâmicos de hanami",
        "Hospedagem em regiões com boa vista da florada",
        "Datas de alta procura — reserva antecipada recomendada",
      ],
      precoDe: "R$ 15.990",
      accent: "#e6a6c7",
      imagem: "/images/sakura.jpg",
      imagemAlt: "Torre de Tóquio entre flores de cerejeira (sakura) à noite",
      Icon: IconFlower,
    },
    {
      slug: "japao-outono",
      categoria: "Outono · Kōyō",
      nome: "Outono no Japão",
      tagline: "As folhas vermelhas e douradas do outono japonês",
      descricao:
        "Entre meados de novembro e início de dezembro, jardins, templos e montanhas se transformam em um mosaico de vermelho e dourado. Um roteiro pensado para acompanhar o kōyō nos melhores pontos do país.",
      destaques: [
        "Época do kōyō (folhagens de outono)",
        "Jardins e templos históricos",
        "Clima ameno, ótimo para caminhadas",
        "Menor fluxo turístico que a primavera",
      ],
      precoDe: "R$ 13.490",
      accent: "#d9a66d",
      imagem: "/images/autumn.jpg",
      imagemAlt: "Monte Fuji nevado emoldurado por folhagens vermelhas de outono",
      Icon: IconLeaf,
    },
    {
      slug: "japao-disney-usj",
      categoria: "Família · Parques temáticos",
      nome: "Japão em Família",
      tagline: "Japão clássico com Tokyo Disney Resort e Universal Studios Japan",
      descricao:
        "A combinação perfeita para famílias e fãs de parques temáticos: cultura, gastronomia e tradição japonesa, mais um dia na Tokyo Disneyland ou DisneySea e outro na Universal Studios Japan, em Osaka.",
      destaques: [
        "Ingresso e visita à Tokyo Disneyland ou DisneySea",
        "Ingresso e visita à Universal Studios Japan",
        "Roteiro equilibrado entre parques e cultura local",
        "Ótimo para famílias e grupos",
      ],
      precoDe: "R$ 15.490",
      accent: "#7c4fd1",
      imagem: "/images/usj.jpg",
      imagemAlt: "Atração temática na Universal Studios Japan, em Osaka",
      Icon: IconTicket,
    },
    {
      slug: "maratona-tokyo-2027",
      categoria: "Evento esportivo · 07 de março de 2027",
      nome: "Tokyo Marathon Experience",
      tagline: "Viva a 20ª edição da Tokyo Marathon",
      descricao:
        "Pacote especial para corredores e acompanhantes na Tokyo Marathon 2027, no dia 7 de março, que celebra a 20ª edição do evento. Hospedagem estrategicamente localizada e roteiro turístico complementar nos dias sem prova.",
      destaques: [
        "Tokyo Marathon 2027 · 07 de março de 2027 (20ª edição)",
        "Apoio na inscrição da prova, sob consulta e disponibilidade",
        "Hospedagem próxima ao trajeto e à largada",
        "Roteiro turístico complementar nos demais dias",
      ],
      precoDe: "R$ 21.990",
      accent: "#6ec3d9",
      selo: "🏃 Vagas limitadas",
      imagem: "/images/tokyo-marathon.png",
      imagemAlt: "Logo oficial da Tokyo Marathon",
      imagemFundoClaro: true,
      Icon: IconMedal,
    },
    {
      slug: "japao-anime-gaming-tcg",
      categoria: "Cultura pop · Anime, Gaming e TCG",
      nome: "Anime, Gaming & TCG",
      tagline: "Parques temáticos, lojas oficiais e o circuito TCG do Japão",
      descricao:
        "Pacote pensado para fãs de anime, games e TCG: o melhor de atrações como Tokyo Disneyland, Universal Studios Japan, PokéPark e Studio Ghibli, somado a visitas às lojas oficiais das principais franquias e ao circuito de compra e venda de cards em Tokyo e Osaka.",
      destaques: [
        "Tokyo Disneyland, Universal Studios Japan, PokéPark e Studio Ghibli",
        "Lojas oficiais: Nintendo, Capcom, Square Enix, Pokémon Center e Toei (One Piece, Dragon Ball)",
        "Circuito de lojas de TCG em Tokyo e Osaka, como a Hareruya 2",
        "Akihabara: colecionáveis retrô (N64, Super Nintendo, PS1) e itens atuais como mousepads Artisan",
      ],
      precoDe: "R$ 16.990",
      accent: "#ff5964",
      selo: "🎮 Novo pacote",
      imagem: "/images/anime-gaming-cover.png",
      imagemAlt: "Personagens de One Piece com colecionáveis, referência à cultura pop japonesa",
      Icon: IconGamepad,
    },
  ];

  const inclusoes = [
    {
      title: "Hotel",
      text: "Hospedagem selecionada, em localizações estratégicas para o roteiro.",
      Icon: IconBed,
    },
    {
      title: "Passagem Aérea",
      text: "Ida e volta, com as melhores opções de conexão para o Japão.",
      Icon: IconPlane,
    },
    {
      title: "Seguro Viagem",
      text: "Cobertura para toda a duração da viagem.",
      Icon: IconShieldCheck,
    },
    {
      title: "Pocket Wi-Fi ou eSIM 5G",
      text: "Conexão disponível durante todo o roteiro.",
      Icon: IconWifi,
    },
    {
      title: "Guia Turístico",
      text: "Acompanhamento local em pontos-chave do roteiro.",
      Icon: IconPin,
      badge: { label: "Oferta limitada para determinadas datas", tone: "orange" },
    },
    {
      title: "Transfer",
      text: "Translados aeroporto-hotel e hotel-aeroporto.",
      Icon: IconCar,
      badge: { label: "Opcional", tone: "purple" },
    },
    {
      title: "Mobilidade & Saúde",
      text: "Motorista particular para deslocamentos e mapeamento detalhado da rede de hospitais e clínicas médicas na região do roteiro.",
      Icon: IconHeartPulse,
      badge: { label: "Opcional", tone: "purple" },
    },
  ];

  const whyAjisai = [
    {
      label: "Experiência",
      title: "+12 anos",
      text: "Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.",
      Icon: IconClock,
    },
    {
      label: "Curadoria",
      title: "Exclusividade de Serviços",
      text: "Curadoria de hospedagem, roteiro e consumo desenvolvida a partir de experiência própria, fluência no idioma e uma rede construída ao longo de mais de uma década no Japão.",
      Icon: IconGem,
    },
    {
      label: "Conexão Brasil–Japão",
      title: "Referência na conexão",
      text: "Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências.",
      Icon: IconExchange,
    },
    {
      label: "Presença real no Japão",
      title: "Operação própria",
      text: "Nossa operação própria no Japão permite atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.",
      Icon: IconMapPin,
    },
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "Escolha o pacote",
      lines: ["Roteiro e duração, de 7 a 15 dias."],
      Icon: IconDocument,
    },
    {
      number: "02",
      title: "Reserva com primeira parcela",
      lines: ["Confirmação da reserva com pagamento da primeira parcela."],
      Icon: IconCard,
    },
    {
      number: "03",
      title: "Emissão de voos e hotéis",
      lines: ["Passagens, hospedagem e seguro viagem confirmados."],
      Icon: IconPlane,
    },
    {
      number: "04",
      title: "Guia de viagem",
      lines: ["Documentos e orientações antes do embarque."],
      Icon: IconDocument,
    },
    {
      number: "05",
      title: "Pagamento final",
      lines: ["Quitação do valor restante antes da viagem."],
      Icon: IconCard,
    },
    {
      number: "06",
      title: "Embarque e suporte 24h",
      lines: ["Acompanhamento Ajisai durante toda a viagem."],
      Icon: IconCheck,
    },
  ];

  const googleReviews = [
    {
      name: "Caio Paiva de Lima",
      context: "Cancelamento de voo de última hora",
      text: "Excelente experiência com a AjisaiWork! Nos auxiliaram no retorno do Japão ao Brasil após um cancelamento de voo de última hora, com atendimento 24h, segurança e agilidade num momento de estresse. Empresa de confiança e extremamente recomendada!",
    },
    {
      name: "José Andrade",
      context: "Passagens, trens e hotéis",
      text: "Tivemos a feliz oportunidade de utilizar os serviços da AjisaiWork e a equipe me proporcionou uma viagem tranquila, segura e prazerosa. Ficamos satisfeitos com o auxílio na reserva de passagens de avião, trens e hotéis. Foi fantástico!",
    },
    {
      name: "Cristina Álvares",
      context: "Viagem em período de instabilidade aérea",
      text: "Fomos para o Japão com o apoio total da Ajisai. O período era complicado, pela Emirates via Dubai, em um momento incerto. A Ajisai tinha opções com outras cias aéreas caso necessário. Atendimento 24hs todos os dias, durante todo o período da viagem. Excelente!",
    },
    {
      name: "Conrado Areco Borelli",
      context: "Suporte completo, do primeiro contato ao embarque",
      text: "Contamos com o suporte da AjisaiWork na compra dos bilhetes de ida e volta ao Japão — atendimento solícito e eficiente. Do 1º contato via WhatsApp até o embarque, estiveram sempre disponíveis, independente do fuso horário. Recomendamos de coração.",
    },
    {
      name: "Katia Ito",
      context: "Passagens para um grupo grande",
      text: "Recomendo a AjisaiWork, que conheci pelo canal Tudo Sobre Japão Notícias. Atenderam com rapidez desde o início, buscando passagens para um grupo grande com ótimo custo-benefício, com equipe no aeroporto para ajudar com o despacho das bagagens.",
    },
    {
      name: "Bruno Lima",
      context: "Do preenchimento online ao embarque",
      text: "Foram muito atenciosos, do início ao fim. Sempre que eu estava com dúvidas, eles me explicavam tudo com bastante clareza e atenção, quase no mesmo momento em que eu perguntava. Me auxiliaram desde o preenchimento online até o momento de embarque e desembarque.",
    },
  ];

  const faq = [
    {
      pergunta: "O que está incluso no valor do pacote?",
      resposta:
        "Hotel, passagem aérea de ida e volta, seguro viagem e Pocket Wi-Fi ou eSIM 5G já estão inclusos no preço de todos os pacotes. Guia turístico, transfer e o serviço de Mobilidade & Saúde são opcionais e podem ser adicionados à parte.",
    },
    {
      pergunta: "Como funciona a oferta do Guia Turístico?",
      resposta:
        "A oferta de Guia Turístico é limitada para determinadas datas. As datas são definidas quando há número mínimo de clientes viajando no mesmo período e agenda livre da equipe de guias turísticos. Até 30 dias antes da viagem, caso exista disponibilidade de guia turístico, a Ajisai e/ou Alpinea entrará em contato para confirmar que a oferta está disponível.",
    },
    {
      pergunta: "O que inclui o serviço de Mobilidade & Saúde?",
      resposta:
        "É um serviço opcional voltado a viajantes que precisam de motorista particular para os deslocamentos do roteiro e de um mapeamento mais detalhado da rede de hospitais e clínicas médicas na região visitada, para maior segurança durante a viagem.",
    },
    {
      pergunta: "O valor exibido vale para quantos dias?",
      resposta:
        "O valor \"a partir de\" corresponde à versão de 7 dias do pacote, em quarto individual. Roteiros de 10, 12 e 15 dias têm valores sob consulta, de acordo com a data escolhida.",
    },
    {
      pergunta: "Posso parcelar o pagamento?",
      resposta:
        "Sim. O pacote é reservado com o pagamento da primeira parcela e o restante é pago em etapas até a data da viagem, conforme condições apresentadas no fechamento da proposta.",
    },
    {
      pergunta: "Preciso de visto para viajar ao Japão?",
      resposta:
        "A exigência de visto depende da nacionalidade do viajante. A equipe Ajisai orienta sobre a documentação necessária durante o processo de reserva.",
    },
    {
      pergunta: "Dá para personalizar algum desses pacotes?",
      resposta:
        "Sim, pequenos ajustes de hotel, datas e passeios podem ser feitos dentro de cada pacote. Para um roteiro 100% sob medida, temos também o serviço de roteiros personalizados Ajisai.",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-black pb-16 text-white md:pb-0">
      {/* ── HEADER ── */}
      <header className="fixed left-0 right-0 top-0 z-50 transform-gpu bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-10 w-auto object-contain md:h-11"
          />

          <a
            href="#contact"
            className="hidden rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white md:inline-block"
          >
            Falar com a Ajisai
          </a>
        </div>
      </header>

      {/* ── CTA FIXO MOBILE ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 transform-gpu border-t border-white/10 bg-black/[0.92] px-4 pt-2.5 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
      >
        <ContactCTA
          mode="single"
          channel="whatsapp"
          whatsappNumber="5511930300101"
          brand="Ajisai"
          packageOptions={pacotes.map((p) => p.nome)}
          label={
            <span className="flex items-center justify-center gap-2">
              <IconWhatsApp className="h-4 w-4" />
              Falar com a Ajisai →
            </span>
          }
          buttonClassName="flex w-full items-center justify-center bg-[#2f80c9] px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#2870b0]"
        />
      </div>

      {/* ── HERO ── */}
      <section className="relative h-[560px] min-h-[560px] overflow-hidden bg-black md:h-auto md:min-h-[720px]">
        <div className="absolute inset-0 mx-auto max-w-[1800px]">
          <Image
            src="/images/kyoto-maiko-street.png"
            alt="Rua tradicional em Kyoto, Japão"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 14%, rgba(0,0,0,0.68) 32%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.06) 100%)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-20 z-10 px-6 text-center md:bottom-24 md:px-16">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/50">
            Pacotes Ajisai
          </p>
          <h1
            className={`${display.className} mx-auto max-w-xs text-[1.85rem] font-medium leading-[1.18] text-white sm:max-w-md sm:text-[2.1rem] md:max-w-4xl md:text-5xl md:leading-[1.08]`}
          >
            Pacotes criados por especialistas, agência 100% focado em Japão.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-6 text-white/65 md:max-w-2xl md:text-lg md:leading-8">
            Hotéis selecionados, passagens, suporte local e operação própria
            no Japão, sem intermediários.
          </p>
        </div>

        <a
          href="#pacotes"
          aria-label="Rolar para os pacotes"
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

      {/* ── PACOTES ── */}
      <section
        id="pacotes"
        className="border-t border-white/10 bg-[#050505] px-5 py-12 md:bg-black md:px-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex justify-center md:mb-14">
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#b79ce6]/50 bg-[#b79ce6]/15 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b79ce6] md:text-xs">
              <IconClock className="h-3.5 w-3.5 shrink-0" />
              Preços válidos até 30/07/2026 · Sujeitos a alteração conforme variação cambial
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pacotes.map((pacote) => (
              <div
                key={pacote.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] sm:rounded-[2rem]"
              >
                <div
                  className={`relative h-[200px] overflow-hidden ${pacote.imagemFundoClaro ? "bg-white" : ""}`}
                >
                  <Image
                    src={pacote.imagem}
                    alt={pacote.imagemAlt ?? pacote.nome}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={
                      pacote.imagemFundoClaro
                        ? "object-contain p-10"
                        : "object-cover"
                    }
                  />
                  {!pacote.imagemFundoClaro && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  )}
                  {pacote.selo && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#b79ce6] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
                      {pacote.selo}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3
                    className={`${display.className} text-2xl font-medium text-white`}
                  >
                    {pacote.nome}
                  </h3>
                  <p
                    className="mt-1.5 text-xs uppercase tracking-[0.18em]"
                    style={{ color: pacote.accent }}
                  >
                    {pacote.tagline}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/35">
                    7 a 15 dias
                  </p>

                  <p className="mt-4 text-sm font-light leading-6 text-white/60">
                    {pacote.descricao}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {pacote.destaques.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-5 text-white/65"
                      >
                        <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b79ce6]" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-1 flex-col justify-end border-t border-white/10 pt-5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                      A partir de
                    </p>
                    <p
                      className={`${display.className} mt-1 text-3xl font-medium text-white`}
                    >
                      {pacote.precoDe}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      ou em até 12x de {pacote.precoDe} + Juros Mensais
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-white/40">
                      Por pessoa, em quarto individual, roteiro de 7 dias.
                      Valores para 10, 12 e 15 dias sob consulta.
                    </p>

                    <ContactCTA
                      mode="single"
                      channel="whatsapp"
                      whatsappNumber="5511930300101"
                      brand="Ajisai"
                      packageOptions={pacotes.map((p) => p.nome)}
                      defaultPackage={pacote.nome}
                      label={`Consultar ${pacote.nome}`}
                      buttonClassName="mt-5 flex w-full items-center justify-center rounded-full bg-[#7c4fd1] px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(124,79,209,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#6c40c0] hover:shadow-[0_14px_36px_rgba(124,79,209,0.5)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O QUE ESTÁ INCLUSO ── */}
      <section className="border-t border-white/10 bg-black px-6 py-20 md:px-16 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-2xl md:mb-20">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Em todos os pacotes
            </p>
            <h2
              className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}
            >
              O que está incluso
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {inclusoes.map((item) => {
              const tone = item.badge?.tone;
              const cardTone =
                tone === "orange"
                  ? "border-orange-400/40 bg-orange-400/[0.08] hover:border-orange-400/70"
                  : tone === "purple"
                    ? "border-[#b79ce6]/40 bg-[#b79ce6]/[0.08] hover:border-[#b79ce6]/70"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20";
              const badgeTone =
                tone === "orange"
                  ? "bg-orange-400 text-black"
                  : "bg-[#b79ce6] text-black";
              const iconTone = tone
                ? tone === "orange"
                  ? "bg-orange-400 text-black"
                  : "bg-[#b79ce6] text-black"
                : "bg-[#b79ce6]/12 text-[#b79ce6]";

              return (
                <div
                  key={item.title}
                  className={`relative rounded-2xl border p-5 transition sm:p-8 ${cardTone}`}
                >
                  {item.badge && (
                    <span
                      className={`absolute right-4 top-4 max-w-[7.5rem] rounded-xl px-2.5 py-1.5 text-right text-[8px] font-semibold uppercase leading-tight tracking-[0.06em] shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:max-w-[9rem] sm:text-[9px] ${badgeTone}`}
                    >
                      {item.badge.label}
                    </span>
                  )}
                  <span
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${iconTone}`}
                  >
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <h3
                    className={`${display.className} text-lg font-medium text-white md:text-xl`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-7 text-white/50">
                    {item.text}
                  </p>
                </div>
              );
            })}
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
              className="h-10 w-auto object-contain opacity-95 md:h-14"
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
                className="flex w-[72vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col items-center text-center md:w-auto"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                  <item.Icon className="h-5 w-5" />
                </span>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">
                  {item.label}
                </p>
                <h3
                  className={`${display.className} flex min-h-[3.5rem] items-center justify-center text-lg font-medium text-white md:min-h-[3.8rem] md:text-xl`}
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

      {/* ── AVALIAÇÕES ── */}
      <section className="border-t border-white/10 bg-black px-6 py-20 md:px-16 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl md:mb-20">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Quem viajou com a Ajisai
            </p>
            <h2
              className={`${display.className} text-3xl font-medium leading-tight md:text-4xl`}
            >
              Tudo é feito com muito carinho e atenção aos detalhes para
              atender aos nossos clientes mais exigentes
            </h2>
          </div>

          <div className="mb-14 flex flex-col gap-4 sm:max-w-3xl sm:flex-row md:mb-20">
            <div className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-[#b79ce6]/40 bg-[#b79ce6]/10 px-6 py-5 sm:gap-4">
              <div className="flex shrink-0 items-center gap-1 text-[#b79ce6]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <IconStarFilled key={index} className="h-5 w-5" />
                ))}
              </div>
              <p className="text-base font-light text-white/70">
                <span
                  className={`${display.className} text-xl font-medium text-white`}
                >
                  4,8 de 5,0
                </span>{" "}
                no Google · +180 avaliações
              </p>
            </div>

            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] px-6 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <IconShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  Verificada pelo Reclame AQUI
                </p>
                <p className="mt-0.5 text-xs font-light text-white/50">
                  Aprovada em todas as checagens de segurança
                </p>
                <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-400">
                  Última verificação · Mar/2026
                </p>
              </div>
            </div>
          </div>

          <CarouselScroller
            itemCount={googleReviews.length}
            desktopColumns={3}
            desktopScroll
          >
            {googleReviews.map((review, index) => (
              <div
                key={review.name}
                className="flex min-h-[340px] w-[80vw] flex-shrink-0 snap-start [scroll-snap-stop:always] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:rounded-[2rem] sm:p-8 md:w-[31%] md:shrink-0"
              >
                <div className="mb-4 flex items-center gap-0.5 text-[#b79ce6]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <IconStarFilled key={starIndex} className="h-3.5 w-3.5" />
                  ))}
                </div>
                <p className="flex-1 text-sm font-light leading-7 text-white/60">
                  "{review.text}"
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        avatarColors[index % avatarColors.length],
                    }}
                    aria-hidden
                  >
                    {review.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {review.name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/35">
                      {review.context} · Avaliação no Google
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CarouselScroller>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-20 md:px-16 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-2xl md:mb-20">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Como funciona
            </p>
            <h2
              className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}
            >
              Da escolha do pacote ao embarque
            </h2>
          </div>

          <div className="flex flex-col md:hidden">
            {workflowSteps.map((step, index) => (
              <div key={step.number}>
                <div className="grid grid-cols-[2.75rem_1fr] gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b79ce6] text-black">
                    <step.Icon className="h-5 w-5" />
                  </span>
                  <div className="pt-1.5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">
                      {step.number}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {step.title}
                    </p>
                    {step.lines.map((line) => (
                      <p
                        key={line}
                        className="mt-1.5 text-xs leading-5 text-white/50"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="grid grid-cols-[2.75rem_1fr] gap-4">
                    <div className="flex h-9 items-center justify-center">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b79ce6]/15 text-[#b79ce6]">
                        <IconArrowDown className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:flex md:items-start md:gap-6">
            {workflowSteps.map((step, index) => (
              <div key={step.number} className="md:min-w-0 md:flex-1">
                <div className="relative flex justify-center">
                  {index < workflowSteps.length - 1 && (
                    <span className="absolute left-1/2 top-1/2 z-0 h-px w-[calc(100%+1.5rem)] -translate-y-1/2 bg-white/15" />
                  )}
                  <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                    <step.Icon className="h-7 w-7" />
                  </span>
                </div>
                <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-white/30">
                  {step.number}
                </p>
                <p className="mt-1 text-center text-sm font-medium text-white">
                  {step.title}
                </p>
                {step.lines.map((line) => (
                  <p
                    key={line}
                    className="mt-1.5 text-center text-xs leading-5 text-white/50"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-white/10 bg-black px-6 py-20 md:px-16 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
            Perguntas frequentes
          </p>
          <h2
            className={`${display.className} mb-12 text-3xl font-medium leading-tight md:text-5xl`}
          >
            Dúvidas sobre os pacotes
          </h2>

          <div className="space-y-6">
            {faq.map((item) => (
              <div
                key={item.pergunta}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
              >
                <h3 className="text-base font-medium text-white md:text-lg">
                  {item.pergunta}
                </h3>
                <p className="mt-3 text-sm font-light leading-7 text-white/55">
                  {item.resposta}
                </p>
              </div>
            ))}
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
            Escolha seu pacote e comece a organizar sua viagem.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-7 text-black/60 md:leading-9">
            Conte pra gente qual pacote te interessou, suas datas preferidas e
            quantas pessoas vão viajar. A Ajisai cuida do restante.
          </p>
          <ContactCTA
            mode="single"
            channel="whatsapp"
            whatsappNumber="5511930300101"
            brand="Ajisai"
            label="Falar no WhatsApp"
            packageOptions={pacotes.map((p) => p.nome)}
            buttonClassName="mt-10 rounded-full bg-[#7c4fd1] px-12 py-5 text-sm font-medium uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(124,79,209,0.35)] transition hover:bg-[#6c40c0] hover:shadow-[0_24px_60px_rgba(124,79,209,0.45)] md:px-14 md:py-6 md:text-base"
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
            Pacotes de viagem e roteiros personalizados para o Japão.
          </p>

          <a
            href="#faq"
            className="text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
          >
            FAQ · Perguntas Frequentes
          </a>

          <p className="text-[11px] leading-relaxed text-white/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos
            Reservados — CNPJ: 43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}

// ── Ícones inline, sem dependência de lucide-react ──
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

function IconPin({ className }: { className?: string }) {
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
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
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
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconDocument({ className }: { className?: string }) {
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
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
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
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function IconBed({ className }: { className?: string }) {
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
      <path d="M2 17v-5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2" />
      <path d="M11 14v-2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5" />
      <line x1="2" y1="12" x2="2" y2="7" />
      <line x1="2" y1="20" x2="2" y2="17" />
      <line x1="22" y1="20" x2="22" y2="17" />
      <line x1="2" y1="17" x2="22" y2="17" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3.01.15.19 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.34Z" />
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.15c-1.66 0-3.2-.46-4.52-1.25l-.32-.19-3.02.79.8-2.94-.21-.3A8.14 8.14 0 0 1 3.85 12c0-4.5 3.67-8.15 8.17-8.15 4.5 0 8.17 3.66 8.17 8.15 0 4.5-3.67 8.15-8.17 8.15Z" />
    </svg>
  );
}

function IconStarFilled({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3l2.5 6 6.5.6-5 4.3 1.5 6.4L12 17l-5.5 3.3L8 13.9l-5-4.3L9.5 9.6 12 3Z" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
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
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

function IconGem({ className }: { className?: string }) {
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
      <path d="M6 3h12l3 5.5L12 21 3 8.5 6 3Z" />
      <path d="M3 8.5h18" />
      <path d="M9 3l3 5.5-3 12.5" />
      <path d="M15 3l-3 5.5 3 12.5" />
    </svg>
  );
}

function IconArrowDown({ className }: { className?: string }) {
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
      <line x1="12" y1="4" x2="12" y2="18" />
      <polyline points="7 13 12 18 17 13" />
    </svg>
  );
}

function IconWifi({ className }: { className?: string }) {
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
      <path d="M2 8.5a17 17 0 0 1 20 0" />
      <path d="M5.5 12.5a12 12 0 0 1 13 0" />
      <path d="M9 16.3a6.5 6.5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFlower({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8c-1.4-1.4-1.4-3.6 0-5 1.4 1.4 1.4 3.6 0 5Z" />
      <path d="M12 14.2c1.4 1.4 1.4 3.6 0 5-1.4-1.4-1.4-3.6 0-5Z" />
      <path d="M9.8 12c-1.4 1.4-3.6 1.4-5 0 1.4-1.4 3.6-1.4 5 0Z" />
      <path d="M14.2 12c1.4-1.4 3.6-1.4 5 0-1.4 1.4-3.6 1.4-5 0Z" />
    </svg>
  );
}

function IconLeaf({ className }: { className?: string }) {
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
      <path d="M4 20c8-1 14-7 15-15-8 1-14 7-15 15Z" />
      <path d="M9 15c2-2 4-3.5 6.5-5" />
    </svg>
  );
}

function IconTicket({ className }: { className?: string }) {
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
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <line x1="10" y1="6" x2="10" y2="18" strokeDasharray="1.5 2" />
    </svg>
  );
}

function IconMedal({ className }: { className?: string }) {
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
      <circle cx="12" cy="15" r="5.5" />
      <path d="M9.5 10 7 3M14.5 10 17 3" />
      <path d="M12 12.5v5" />
    </svg>
  );
}

function IconGamepad({ className }: { className?: string }) {
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
      <path d="M6 8h12a4 4 0 0 1 4 4.2l.6 4A2.4 2.4 0 0 1 20 19.3c-.9 0-1.7-.5-2.1-1.3l-1-2H7.1l-1 2A2.4 2.4 0 0 1 4 19.3a2.4 2.4 0 0 1-2.6-2.7l.6-4.4A4 4 0 0 1 6 8Z" />
      <line x1="7.5" y1="11.5" x2="7.5" y2="14.5" />
      <line x1="6" y1="13" x2="9" y2="13" />
      <circle cx="15.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconHeartPulse({ className }: { className?: string }) {
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
      <path d="M12 20.5c-4-2.7-9-6.8-9-11.2C3 6 5.2 4 8 4c1.7 0 3.2.9 4 2.3C12.8 4.9 14.3 4 16 4c2.8 0 5 2 5 5.3 0 4.4-5 8.5-9 11.2Z" />
      <path d="M5 12h2.5l1.5-3 2 5 1.5-3h2.5" />
    </svg>
  );
}
