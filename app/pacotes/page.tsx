import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "../components/ContactCTA";
import { CarouselScroller } from "../components/CarouselScroller";
import { CartProvider } from "../components/CartContext";
import { CartWidget } from "../components/CartWidget";
import { PackageCard, type PackageVariant } from "../components/PackageCard";
import { CustomPackageCard } from "../components/CustomPackageCard";

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Pacotes de Viagem para o Japão",
  description:
    "Pacotes de viagem para o Japão com a curadoria Ajisai: Caravana (grupo fechado), Individual ou Pequenos Grupos e Pacotes Personalizados por hora. Monte seu carrinho e finalize direto no WhatsApp.",
};

// Preço-base de 7 dias usa como referência o valor do pacote sazonal
// equivalente que já existia na página (Temporada das Cerejeiras → R$ 15.990;
// Outono, como estação de menor fluxo mais próxima do perfil de maio → R$
// 13.490). O valor de 15 dias aplica escala linear simples (preço 7 dias ÷ 7
// × 15, arredondado para a terminação em "990"/"490" usada nos demais
// pacotes do site) — sem desconto por estadia mais longa. Se preferir outro
// critério (ex: descontar a passagem aérea, que é custo fixo, do cálculo dos
// dias extras), é só avisar que ajusto a fórmula. Datas também são
// provisórias — confirmar antes de publicar.
const parcelaDe = (preco: number) =>
  `ou em até 12x de R$ ${(preco / 12).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} + Juros Mensais`;

const variantesPadrao = (
  preco7: number,
  datas7: string,
  preco15: number,
  datas15: string,
): PackageVariant[] => [
  {
    id: "7d",
    label: "7 dias",
    datas: datas7,
    precoLabel: `R$ ${preco7.toLocaleString("pt-BR")}`,
    parcelaLabel: parcelaDe(preco7),
  },
  {
    id: "15d",
    label: "15 dias",
    datas: datas15,
    precoLabel: `R$ ${preco15.toLocaleString("pt-BR")}`,
    parcelaLabel: parcelaDe(preco15),
  },
];

const pacotesCaravana = [
  {
    slug: "caravana-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Temporada de Cerejeiras 2027",
    tagline: "Saída em grupo fechado, direto na florada",
    descricao:
      "Viaje em grupo, com data de saída única e guia bilíngue dedicado à caravana do início ao fim, durante a temporada de floração das cerejeiras.",
    destaques: [
      "Data de saída fixa, em grupo fechado",
      "Guia bilíngue acompanhando a caravana do início ao fim",
      "Hospedagem e passagens já reservadas para o grupo",
      "Vagas limitadas — reserva antecipada recomendada",
    ],
    imagem: "/images/sakura.jpg",
    imagemAlt: "Torre de Tóquio entre flores de cerejeira (sakura) à noite",
    accent: "#e6a6c7",
    selo: "🌸 Alta procura",
    videoSrc: "/videos/higashiyama.mp4",
    variantes: variantesPadrao(
      15990,
      "28 mar – 03 abr 2027",
      34490,
      "24 mar – 07 abr 2027",
    ),
  },
  {
    slug: "caravana-maio",
    categoria: "Maio 2027",
    nome: "Primavera 2 — Maio 2027",
    tagline: "Saída em grupo fechado, fora do pico de alta temporada",
    descricao:
      "Viaje em grupo, com data de saída única e guia bilíngue dedicado à caravana do início ao fim, em maio — clima ameno e menor fluxo turístico.",
    destaques: [
      "Data de saída fixa, em grupo fechado",
      "Guia bilíngue acompanhando a caravana do início ao fim",
      "Clima ameno e menor fluxo turístico que a alta temporada",
      "Vagas limitadas — reserva antecipada recomendada",
    ],
    imagem: "/images/azumino.jpg",
    imagemAlt: "Paisagem verde de Nagano no início do verão",
    accent: "#7fbf6e",
    videoSrc: "/videos/kamikochi.mp4",
    variantes: variantesPadrao(
      13490,
      "08 – 14 mai 2027",
      28990,
      "08 – 22 mai 2027",
    ),
  },
];

const pacotesIndividuais = [
  {
    slug: "individual-cerejeiras",
    categoria: "Temporada de Cerejeiras",
    nome: "Primavera 1 — Temporada de Cerejeiras 2027",
    tagline: "Datas flexíveis, guia dedicado só ao seu grupo",
    descricao:
      "O mesmo roteiro da temporada de cerejeiras, com datas flexíveis dentro da temporada e guia particular dedicado exclusivamente ao seu grupo.",
    destaques: [
      "Datas flexíveis dentro da temporada de cerejeiras",
      "Guia particular, dedicado só ao seu grupo",
      "Roteiro pode ser ajustado ao seu ritmo e interesses",
      "Ideal para famílias, casais e grupos de amigos",
    ],
    imagem: "/images/kyoto-maiko-street.png",
    imagemAlt: "Rua tradicional em Kyoto durante a temporada de cerejeiras",
    accent: "#e6a6c7",
    videoSrc: "/videos/higashiyama.mp4",
    variantes: variantesPadrao(
      15990,
      "Datas flexíveis · mar–abr 2027",
      34490,
      "Datas flexíveis · mar–abr 2027",
    ),
  },
  {
    slug: "individual-maio",
    categoria: "Maio 2027",
    nome: "Primavera 2 — Maio 2027",
    tagline: "Datas flexíveis, guia dedicado só ao seu grupo",
    descricao:
      "O mesmo roteiro de maio, com datas flexíveis dentro do mês e guia particular dedicado exclusivamente ao seu grupo.",
    destaques: [
      "Datas flexíveis dentro de maio de 2027",
      "Guia particular, dedicado só ao seu grupo",
      "Roteiro pode ser ajustado ao seu ritmo e interesses",
      "Ideal para famílias, casais e grupos de amigos",
    ],
    imagem: "/images/shirakawago.jpg",
    imagemAlt: "Vilarejo tradicional japonês cercado por vegetação",
    accent: "#7fbf6e",
    videoSrc: "/videos/kamikochi.mp4",
    variantes: variantesPadrao(
      13490,
      "Datas flexíveis · maio 2027",
      28990,
      "Datas flexíveis · maio 2027",
    ),
  },
];

export default function PacotesJapaoPage() {
  const avatarColors = [
    "#7c4fd1",
    "#6ec3d9",
    "#d9a66d",
    "#5b9bd5",
    "#e0916a",
    "#8fb7d9",
  ];

  const todosOsNomesDePacote = [
    "Primavera 1 — Temporada de Cerejeiras 2027 (Caravana)",
    "Primavera 2 — Maio 2027 (Caravana)",
    "Primavera 1 — Temporada de Cerejeiras 2027 (Individual)",
    "Primavera 2 — Maio 2027 (Individual)",
    "Pacote Personalizado",
  ];

  const inclusoes = [
    {
      title: "Roteiro Digital",
      text: "Roteiro digital eletrônico com itinerário diário e informações detalhadas sobre atrações, deslocamento, refeições, aeroportos, entre outros.",
      Icon: IconSmartphone,
    },
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
      title: "Monte seu carrinho",
      lines: ["Escolha o pacote, personalize a duração ou a data e adicione ao carrinho."],
      Icon: IconCart,
    },
    {
      number: "02",
      title: "Finalize no WhatsApp",
      lines: ["Envie o carrinho e fale direto com a equipe Ajisai."],
      Icon: IconDocument,
    },
    {
      number: "03",
      title: "Reserva com primeira parcela",
      lines: ["Confirmação da reserva com pagamento da primeira parcela."],
      Icon: IconCard,
    },
    {
      number: "04",
      title: "Emissão de voos e hotéis",
      lines: ["Passagens, hospedagem e seguro viagem confirmados."],
      Icon: IconPlane,
    },
    {
      number: "05",
      title: "Guia de viagem",
      lines: ["Documentos e orientações antes do embarque."],
      Icon: IconDocument,
    },
    {
      number: "06",
      title: "Pagamento final",
      lines: ["Quitação do valor restante antes da viagem."],
      Icon: IconCard,
    },
    {
      number: "07",
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
      pergunta: "Qual a diferença entre Caravana e Individual ou Pequenos Grupos?",
      resposta:
        "Os Pacotes de Caravana têm data de saída única, em grupo fechado, com guia compartilhado por toda a caravana. Os pacotes Individual ou Pequenos Grupos têm datas flexíveis dentro da temporada e guia particular dedicado só ao seu grupo.",
    },
    {
      pergunta: "Como funciona o carrinho de pacotes?",
      resposta:
        "Escolha um ou mais pacotes, personalize a duração (ou, no Personalizado, a data e a quantidade de horas) e adicione ao carrinho. Ao finalizar, os itens do carrinho viram uma única mensagem enviada para a nossa equipe no WhatsApp.",
    },
    {
      pergunta: "O que está incluso no valor dos pacotes de Caravana e Individuais?",
      resposta:
        "Hotel, passagem aérea de ida e volta, seguro viagem, Pocket Wi-Fi ou eSIM 5G e roteiro digital já estão inclusos no preço. Guia turístico, transfer e o serviço de Mobilidade & Saúde são opcionais e podem ser adicionados à parte.",
    },
    {
      pergunta: "Como funciona o Pacote Personalizado?",
      resposta:
        "Você escolhe a data e a quantidade de horas do passeio, com motorista e guia particular à disposição. O valor é calculado conforme a data, as horas e o roteiro escolhidos, e nossa equipe retorna com uma proposta.",
    },
    {
      pergunta: "O que é o Roteiro Digital?",
      resposta:
        "É o itinerário eletrônico da viagem, disponível durante todo o roteiro, com a programação diária e informações detalhadas sobre atrações, deslocamento entre pontos, refeições, aeroportos e outros detalhes práticos da viagem.",
    },
    {
      pergunta: "O valor exibido vale para quantos dias?",
      resposta:
        "Nos pacotes de Caravana e Individuais, o valor \"a partir de\" corresponde à versão escolhida (7 ou 15 dias), por pessoa, em quarto individual. No Personalizado, o valor depende da data e da quantidade de horas selecionadas.",
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
  ];

  return (
    <CartProvider>
      <main className="min-h-screen overflow-x-hidden bg-black pb-16 text-white md:pb-0">
        {/* CSS puro para abrir/fechar o pop-up de FAQ via :target, sem JS, funciona igual em desktop e mobile */}
        <style>{`
          #faq-modal { display: none; }
          #faq-modal:target { display: flex; }
        `}</style>

        {/* ── HEADER ── */}
        <header className="fixed left-0 right-0 top-0 z-50 transform-gpu bg-black/10 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />

            <div className="flex items-center gap-3 md:gap-5">
              <CartWidget />
              <a
                href="#contact"
                className="hidden rounded-full border border-white/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/60 hover:text-white md:inline-block"
              >
                Falar com a Ajisai
              </a>
            </div>
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
            packageOptions={todosOsNomesDePacote}
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
              Pacotes criados por especialistas, agência 100% focada em Japão.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm font-light leading-6 text-white/65 md:max-w-2xl md:text-lg md:leading-8">
              Escolha entre Caravana, Individual ou Pequenos Grupos e Pacotes
              Personalizados. Monte seu carrinho e finalize direto no
              WhatsApp.
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

        {/* ── DIVISÃO 1 · PACOTES DE CARAVANA ── */}
        <section
          id="pacotes"
          className="border-t border-white/10 bg-[#050505] px-5 py-12 md:bg-black md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                Divisão 1
              </p>
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Pacotes de Caravana
              </h2>
              <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Para quem não deseja viajar somente com o próprio grupo — saída
                em grupo fechado, com guia bilíngue dedicado à caravana do
                início ao fim.
              </p>
            </div>

            <div className="mb-8 flex justify-center md:mb-10 md:justify-start">
              <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#b79ce6]/50 bg-[#b79ce6]/15 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b79ce6] md:text-xs">
                <IconClock className="h-3.5 w-3.5 shrink-0" />
                Datas e valores sujeitos a alteração conforme disponibilidade e câmbio
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesCaravana.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Pacotes de Caravana"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  descricao={pacote.descricao}
                  destaques={pacote.destaques}
                  imagem={pacote.imagem}
                  imagemAlt={pacote.imagemAlt}
                  accent={pacote.accent}
                  selo={pacote.selo}
                  videoSrc={pacote.videoSrc}
                  variantes={pacote.variantes}
                  varianteHint="Duração"
                  rodape="Por pessoa, em quarto individual. Vagas limitadas por grupo."
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVISÃO 2 · INDIVIDUAL OU PEQUENOS GRUPOS ── */}
        <section
          id="individuais"
          className="border-t border-white/10 bg-black px-5 py-12 md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                Divisão 2
              </p>
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Individual ou Pequenos Grupos
              </h2>
              <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Para viajar apenas com quem você escolher — datas flexíveis
                dentro da temporada e guia particular dedicado só ao seu
                grupo.
              </p>
            </div>

            <div className="mb-8 flex justify-center md:mb-10 md:justify-start">
              <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#b79ce6]/50 bg-[#b79ce6]/15 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b79ce6] md:text-xs">
                <IconClock className="h-3.5 w-3.5 shrink-0" />
                Datas e valores sujeitos a alteração conforme disponibilidade e câmbio
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {pacotesIndividuais.map((pacote) => (
                <PackageCard
                  key={pacote.slug}
                  divisao="Individual ou Pequenos Grupos"
                  categoria={pacote.categoria}
                  nome={pacote.nome}
                  tagline={pacote.tagline}
                  descricao={pacote.descricao}
                  destaques={pacote.destaques}
                  imagem={pacote.imagem}
                  imagemAlt={pacote.imagemAlt}
                  accent={pacote.accent}
                  videoSrc={pacote.videoSrc}
                  variantes={pacote.variantes}
                  varianteHint="Duração"
                  rodape="Por pessoa, em quarto individual. Datas dentro da temporada indicada."
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVISÃO 3 · PACOTES PERSONALIZADOS ── */}
        <section
          id="personalizado"
          className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                Divisão 3
              </p>
              <h2 className={`${display.className} text-3xl font-medium leading-tight md:text-5xl`}>
                Pacotes Personalizados
              </h2>
              <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Viaje em qualquer data e pela quantidade de horas que preferir.
              </p>
            </div>

            <CustomPackageCard />
          </div>
        </section>

        {/* ── O QUE ESTÁ INCLUSO ── */}
        <section className="border-t border-white/10 bg-black px-6 py-20 md:px-16 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 max-w-2xl md:mb-20">
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
                Nos pacotes de Caravana e Individuais
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
                    &ldquo;{review.text}&rdquo;
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
                Do carrinho ao embarque
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

            <div className="hidden md:flex md:flex-wrap md:items-start md:gap-y-10 md:gap-x-6">
              {workflowSteps.map((step, index) => (
                <div key={step.number} className="md:min-w-[8rem] md:flex-1">
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
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40 md:tracking-[0.45em]">
              Perguntas frequentes
            </p>
            <h2
              className={`${display.className} mb-6 text-3xl font-medium leading-tight md:text-5xl`}
            >
              Dúvidas sobre os pacotes
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-sm font-light leading-7 text-white/55 md:text-base">
              Reunimos as perguntas mais comuns sobre as divisões de pacotes,
              o carrinho, valores, parcelamento e o que está incluso.
            </p>
            <a
              href="#faq-modal"
              className="inline-flex items-center justify-center rounded-full bg-[#7c4fd1] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(124,79,209,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#6c40c0] hover:shadow-[0_14px_36px_rgba(124,79,209,0.5)]"
            >
              Ver perguntas frequentes
            </a>
          </div>
        </section>

        {/* ── POP-UP FAQ (funciona em desktop e mobile via #faq-modal:target) ── */}
        <div
          id="faq-modal"
          className="fixed inset-0 z-[100] hidden items-center justify-center px-4 py-8 sm:py-10"
        >
          <a
            href="#_"
            aria-label="Fechar perguntas frequentes"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:rounded-[2rem] sm:p-10">
            <a
              href="#_"
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white sm:right-6 sm:top-6"
            >
              <IconX className="h-4 w-4" />
            </a>

            <p className="mb-4 pr-12 text-xs uppercase tracking-[0.3em] text-white/40">
              Perguntas frequentes
            </p>
            <h2
              className={`${display.className} mb-8 pr-12 text-2xl font-medium leading-tight md:text-3xl`}
            >
              Dúvidas sobre os pacotes
            </h2>

            <div className="space-y-5">
              {faq.map((item) => (
                <div
                  key={item.pergunta}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
                >
                  <h3 className="text-base font-medium text-white">
                    {item.pergunta}
                  </h3>
                  <p className="mt-2.5 text-sm font-light leading-7 text-white/55">
                    {item.resposta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

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
              Monte seu carrinho com os pacotes que te interessaram ou conte
              pra gente qual divisão faz mais sentido para a sua viagem. A
              Ajisai cuida do restante.
            </p>
            <ContactCTA
              mode="single"
              channel="whatsapp"
              whatsappNumber="5511930300101"
              brand="Ajisai"
              label="Falar no WhatsApp"
              packageOptions={todosOsNomesDePacote}
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
              href="#faq-modal"
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
    </CartProvider>
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

function IconCart({ className }: { className?: string }) {
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
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l1.8 11a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6l1.4-7.4H6.1" />
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

function IconX({ className }: { className?: string }) {
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
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function IconSmartphone({ className }: { className?: string }) {
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
      <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
      <line x1="6" y1="6" x2="18" y2="6" />
      <line x1="6" y1="17.5" x2="18" y2="17.5" />
      <line x1="9" y1="9.5" x2="15" y2="9.5" />
      <line x1="9" y1="12.5" x2="14" y2="12.5" />
      <circle cx="12" cy="19.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
