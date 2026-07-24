import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import Image from "next/image";
import {
  InternalGuideHeader,
  FlowTag,
  SectionMarker,
  TableOfContents,
  TerminalCard,
  MapCard,
  MapModal,
  PreviewModal,
  ImageCard,
  CaptionedImage,
  ImmigrationArrivalGuide,
  SubStepHeading,
  StatCard,
  TransportSummaryTable,
  IconBulb,
  IconExchange,
  IconClock,
  IconMap,
  IconTrain,
  IconPlaneLanding,
  IconPlaneTakeoff,
  IconCard,
  IconLuggage,
  IconCar,
  IconCheck,
  IconFork,
  IconDocument,
  IconStar,
  IconWifi,
  RestaurantMini,
  ActionItem,
  FlowDivider,
} from "../../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Aeroporto de Narita (NRT)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function NaritaGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Anexo com Informação Detalhada - Aeroportos - Narita (NRT)"
        title="Narita International Airport - 成田国際空港"
        code="NRT"
        heroImage="/images/Narita-hero.png"
        heroAlt="Vista aérea do pátio de aeronaves e terminais do Aeroporto Internacional de Narita"
        subtitle="Aeroporto Internacional de Narita, em Chiba — a cerca de 60 km a leste do centro de Tóquio. Recebe a maior parte dos voos internacionais de longo curso com destino a Tóquio."
      />

      <div className="mx-auto grid max-w-5xl gap-4 px-6 pt-8 md:grid-cols-2 md:px-10">
        <a href="#secao-2">
          <FlowTag Icon={IconPlaneLanding} label="Desembarque" subtitle="Chegada e trâmites de entrada" />
        </a>
        <a href="#secao-5">
          <FlowTag Icon={IconPlaneTakeoff} label="Embarque" subtitle="Trâmites de saída e check-in" />
        </a>
      </div>

      <TableOfContents
        items={[
          { Icon: IconMap, number: 1, label: "Visão Geral", href: "#secao-1" },
          {
            Icon: IconPlaneLanding,
            number: 2,
            label: "Chegada e Imigração",
            href: "#secao-2",
            groupLabel: "Desembarque",
          },
          {
            Icon: IconBulb,
            number: 3,
            label: "Recomendações Antes de Sair do Aeroporto",
            href: "#secao-3",
            groupLabel: "Desembarque",
            subsections: [
              { label: "Wi-Fi / eSIM", href: "#secao-3-1" },
              { label: "IC Card (Suica/Pasmo)", href: "#secao-3-2" },
              { label: "Câmbio", href: "#secao-3-3" },
              { label: "Restaurantes", href: "#secao-3-4" },
              { label: "Farmácia", href: "#secao-3-5" },
              { label: "Envio de Bagagem (Takkyubin)", href: "#secao-3-6" },
            ],
          },
          {
            Icon: IconTrain,
            number: 4,
            label: "Deslocamento até Tóquio",
            href: "#deslocamento",
            groupLabel: "Desembarque",
            subsections: [
              { label: "Trem", href: "#deslocamento-trem" },
              { label: "Ônibus", href: "#deslocamento-onibus" },
              { label: "Táxi/Uber", href: "#deslocamento-taxi" },
            ],
          },
          {
            Icon: IconLuggage,
            number: 1,
            label: "Antes de Sair do Hotel",
            href: "#secao-5",
            groupLabel: "Embarque",
          },
          {
            Icon: IconCar,
            number: 2,
            label: "Qual Meio de Transporte Escolher?",
            href: "#secao-6",
            groupLabel: "Embarque",
          },
          {
            Icon: IconCheck,
            number: 3,
            label: "Cheguei no Aeroporto, e Agora?",
            href: "#secao-7",
            groupLabel: "Embarque",
          },
          {
            Icon: IconFork,
            number: 4,
            label: "Estou com Fome",
            href: "#secao-8",
            groupLabel: "Embarque",
          },
          {
            Icon: IconDocument,
            number: 5,
            label: "Checagem de Segurança",
            href: "#secao-9",
            groupLabel: "Embarque",
            subsections: [{ label: "Verificação de Passaporte", href: "#secao-9-passaporte" }],
          },
          {
            Icon: IconStar,
            number: 6,
            label: "Pós-Checagem de Segurança",
            href: "#secao-10",
            groupLabel: "Embarque",
            subsections: [
              { label: "Duty Free", href: "#secao-10-dutyfree" },
              { label: "Lounges", href: "#secao-10-lounges" },
            ],
          },
          {
            Icon: IconPlaneTakeoff,
            number: 7,
            label: "Antes do Embarque",
            href: "#secao-11",
            groupLabel: "Embarque",
          },
        ]}
      />

      {/* Visão geral */}
      <section id="secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <SectionMarker number={1} label="Visão Geral" />
          <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
            Como Funciona o Aeroporto de Narita? São Muitos Terminais?
          </h2>
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Confirme sempre o terminal na confirmação do voo — companhias e alocações
            mudam com frequência.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <TerminalCard
              nome="Terminal 1"
              tipo="Internacional — Ala Norte e Ala Sul. Voos domésticos da ANA e da Peach em área separada, acessada pelo saguão de chegadas da Ala Sul."
              aliancas={[
                {
                  logo: "/images/star-alliance.png",
                  logoAlt: "Logo da Star Alliance",
                  texto: "Ala Sul: Star Alliance (ANA, United, Lufthansa, Air Canada, Thai, Asiana, Ethiopian Airlines, entre outras).",
                },
                {
                  logo: "/images/SkyTeam-Logo.png",
                  logoAlt: "Logo da SkyTeam",
                  texto: "Ala Norte: SkyTeam (Delta, Korean Air, China Airlines, Vietnam Airlines, Garuda Indonesia, entre outras).",
                },
              ]}
            />
            <TerminalCard
              nome="Terminal 2"
              tipo="Internacional, com voos domésticos da JAL."
              aliancas={[
                {
                  logo: "/images/one-world.webp",
                  logoAlt: "Logo da Oneworld",
                  texto: "Oneworld — JAL, British Airways, Finnair, Cathay Pacific, American Airlines, Qatar Airways, Malaysia Airlines, entre outras.",
                },
                {
                  texto: "Emirates também opera no Terminal 2, mas não é alinhada a nenhuma das 3 alianças.",
                },
              ]}
            />
            <TerminalCard
              nome="Terminal 3"
              tipo="Doméstico e internacional — companhias de baixo custo."
              companhias="Jetstar Japan, Spring Airlines Japan, Zipair Tokyo, Air Japan, entre outras."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MapCard href="#mapa-geral-narita" label="Mapa Geral — Terminal 1, 2 e 3" />
            <MapCard href="#mapa-terminal1" label="Planta do Terminal 1" />
            <MapCard href="#mapa-terminal2" label="Planta do Terminal 2" />
            <MapCard href="#mapa-terminal3" label="Planta do Terminal 3" />
          </div>

          <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
              Errei o Terminal e Agora?
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              <p>
                Diferente do Aeroporto de Guarulhos, em São Paulo, os três terminais de
                Narita <span className="text-white">não são conectados entre si</span>.
                Apenas o Terminal 2 e o Terminal 3 têm ligação terrestre — mesmo assim, o
                trajeto a pé leva cerca de 10–15 minutos.
              </p>
            </div>
            <div className="mt-5">
              <MapCard href="#mapa-passagem-t2-t3" label="Passagem entre o Terminal 2 e o Terminal 3" />
            </div>

            <div className="mt-8 space-y-4 pt-6 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              <p>
                Se você precisa se deslocar do Terminal 1 para o Terminal 2 ou 3 (ou
                vice-versa), é necessário usar o <span className="text-white">transfer interno</span> —
                essa transferência leva em média 10 minutos.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <MapCard href="#mapa-shuttle-t1-t2" label="Parada do shuttle T1 → T2 (No. 6)" />
              <MapCard href="#mapa-shuttle-t1-t3" label="Parada do shuttle T1 → T3 (No. 1)" />
            </div>
          </div>
        </div>
      </section>

      <MapModal
        id="mapa-geral-narita"
        label="Mapa Geral — Terminal 1, 2 e 3"
        src="/images/visao-geral-narita-todos-terminais.png"
        alt="Mapa geral do Aeroporto de Narita com Terminal 1, 2 e 3 e estacionamentos"
      />
      <MapModal
        id="mapa-terminal1"
        label="Planta do Terminal 1 — Ala Norte e Ala Sul"
        src="/images/T1-Overview.png"
        alt="Planta do Terminal 1 de Narita, com Ala Norte e Ala Sul"
      />
      <MapModal
        id="mapa-terminal2"
        label="Planta do Terminal 2"
        src="/images/visao-geral-terminal-2.png"
        alt="Planta do Terminal 2 de Narita, com esteiras de bagagem, alfândega e paradas de ônibus"
      />
      <MapModal
        id="mapa-terminal3"
        label="Planta do Terminal 3"
        src="/images/visao-geral-terminal3.png"
        alt="Planta do Terminal 3 de Narita, com esteiras de bagagem, alfândega e paradas de ônibus"
      />
      <MapModal
        id="mapa-passagem-t2-t3"
        label="Passagem no 3º andar entre o Terminal 2 e o Terminal 3"
        src="/images/passagem-terminal-terrestre.png"
        alt="Passagem no terceiro andar entre o Terminal 2 e o Terminal 3 de Narita"
      />
      <MapModal
        id="mapa-shuttle-t1-t2"
        label="Parada do shuttle T1 → T2 (No. 6 Terminal Shuttle Bus Stop)"
        src="/images/T1-Terminal-Shuttle.png"
        alt="No. 6 Terminal Shuttle Bus Stop, com destino ao Terminal 2, no Terminal 1 de Narita"
      />
      <MapModal
        id="mapa-shuttle-t1-t3"
        label="Parada do shuttle T1 → T3 (No. 1 Terminal Shuttle Bus Stop)"
        src="/images/T3-terminal-shuttle.png"
        alt="No. 1 Terminal Shuttle Bus Stop, com destino ao Terminal 3, no Terminal 1 de Narita"
      />
      <MapModal
        id="mapa-narita-tokyo"
        label="Mapa da rota — Narita até o centro de Tóquio"
        src="/images/narita-to-tokyo-map.png"
        alt="Mapa de rota do Aeroporto de Narita até o centro de Tóquio, com distância e tempo estimado"
      />

      <FlowDivider
        Icon={IconPlaneLanding}
        title="Desembarque"
        subtitle="Chegada e trâmites de entrada — do pouso à saída do aeroporto, rumo a Tóquio."
        displayClassName={display.className}
      />

      {/* Chegada e imigração */}
      <section id="secao-2" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Chegada e Imigração" />
          </div>

          <ImmigrationArrivalGuide displayClassName={display.className} />
        </div>
      </section>

      {/* Recomendações antes de sair do aeroporto */}
      <section id="secao-3" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={3} label="Recomendações Antes de Sair do Aeroporto" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Passei pela Imigração e Estou com Minhas Malas, e Agora?
          </h2>

          <div className="space-y-5">
            <p className="text-base font-light leading-8 text-white/70">
              O Aeroporto de Narita fica bem distante de Tóquio — em horários com
              trânsito, pode levar até 2 horas para chegar ao centro da cidade. Por
              isso, existem algumas recomendações gerais.
            </p>

            <div className="space-y-4 pt-2">
              <p id="secao-3-1" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.1 — Aluguel de Pocket Wi-Fi ou eSIM 5G
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Caso ainda não tenha comprado um eSIM 5G, recomendamos que faça o
                aluguel de um wi-fi móvel ou a compra de um eSIM 5G dentro do
                aeroporto.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 1</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Máquinas de venda de chip e guichês de pocket Wi-Fi no 1F, tanto na
                    Ala Sul quanto na Ala Norte.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 2</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Guichês de pocket Wi-Fi no lobby de embarque, no 3F. Máquinas de
                    eSIM normalmente no 2F.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 3</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Guichês de pocket Wi-Fi e máquinas de eSIM no 1F.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
                <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
                  <IconBulb className="h-3.5 w-3.5" />
                  Recomendação Alpinea
                </p>
                <p className="text-sm leading-7 text-white/70 md:text-base md:leading-8">
                  O método mais conveniente é contratar o eSIM digitalmente em
                  aplicativos como Airalo — nós normalmente usamos a própria Airalo
                  para contratação. A vantagem de usar o pocket wi-fi é que você pode
                  conectar vários aparelhos diferentes nele; a desvantagem é que
                  precisa carregá-lo para qualquer lugar que for.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-2" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.2 — Comprar IC Card (JR Suica ou Pasmo)
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                No Japão, o valor do ticket de metrô é definido pela distância — ou
                seja, você precisa definir o trajeto e comprar o valor correto a cada
                viagem. Para evitar isso, recomendamos adquirir um IC Card (cartão
                pré-pago). Existem dois operadores em Tóquio, JR Suica e Pasmo — não
                existe diferença prática entre os dois: o Suica é produzido pela JR e
                o Pasmo pela Tokyo Metro, ambas entre as maiores operadoras de trem do
                Japão.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O IC Card também é utilizado e aceito como forma de pagamento em
                lojas de conveniência, pequenas compras e máquinas de bebida na rua.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <CaptionedImage
                  src="/images/suica-vector.png"
                  alt="Cartão JR Suica, com o mascote pinguim"
                  caption="IC Card JR Suica"
                />
                <CaptionedImage
                  src="/images/pasmo-card.webp"
                  alt="Cartão Pasmo, com ícones de trem e ônibus"
                  caption="IC Card Pasmo"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <ImageCard
                    src="/images/ic-metro.png"
                    alt="Catraca do metrô com área de toque para cartão IC e QR code"
                    fit="cover"
                    aspect="aspect-[3/5]"
                    zoomHref="#foto-ic-metro"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-white">Catraca do metrô</p>
                  <p className="text-center text-xs text-white/45">Aproxime o cartão na área indicada</p>
                </div>
                <div>
                  <ImageCard
                    src="/images/ic-card-2.png"
                    alt="Sensor circular de IC card sendo usado com um cartão Pasmo"
                    fit="cover"
                    aspect="aspect-[3/5]"
                    zoomHref="#foto-ic-sensor"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-white">Sensor de aproximação</p>
                  <p className="text-center text-xs text-white/45">Encoste o cartão até o bipe</p>
                </div>
                <div>
                  <ImageCard
                    src="/images/ic-card-vending-machine.png"
                    alt="Máquina de bebidas com leitor de IC card por aproximação"
                    fit="cover"
                    aspect="aspect-[3/5]"
                    zoomHref="#foto-ic-vending"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-white">Máquinas de bebida</p>
                  <p className="text-center text-xs text-white/45">Também aceitam o IC Card</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b9bd5]/15 text-[#8fc0e8]">
                    <IconCard className="h-6 w-6" />
                  </span>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
                    Suica/Pasmo no celular
                  </p>
                  <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-yellow-400">
                    Opcional
                  </span>
                </div>
                <p className="mt-5 text-center text-sm leading-7 text-white/70 md:text-base md:leading-8">
                  O cartão IC pode ser adicionado diretamente na Carteira do iPhone
                  (Apple Wallet) ou no Google Wallet, sem precisar de um cartão
                  físico — o que facilita muito caso haja escassez temporária de
                  chips para os cartões tradicionais.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                  <div className="relative h-9 w-16 overflow-hidden rounded-md bg-white p-1.5">
                    <Image src="/images/apple-pay.png" alt="Logo Apple Pay" fill className="object-contain" />
                  </div>
                  <div className="relative h-9 w-16 overflow-hidden rounded-md bg-white p-1.5">
                    <Image
                      src="/images/google-pay-primary-logo-logo.svg"
                      alt="Logo Google Pay"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-center text-sm leading-6">
                  <a
                    href="https://support.apple.com/pt-br/108772"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#8fc0e8] underline underline-offset-2"
                  >
                    Como adicionar o Suica/Pasmo na Apple Wallet →
                  </a>
                  <a
                    href="https://support.google.com/wallet/thread/269371334/n%C3%A3o-consigo-adicionar-o-suica-cart%C3%A3o-de-transporte-do-jap%C3%A3o-na-carteira?hl=pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#8fc0e8] underline underline-offset-2"
                  >
                    Como adicionar o Suica no Google Wallet →
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-3" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.3 — Câmbio
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Caso planeje fazer uma refeição no aeroporto ou pedir um Uber,
                recomendamos retirar o valor necessário: uma refeição num restaurante
                de sushi de esteira no aeroporto custa, em média, ¥2.000–3.500 por
                pessoa; um Uber de Narita até Shinjuku custa entre ¥26.300 (tarifa
                fixa) e cerca de ¥36.000 (tarifa dinâmica), dependendo do horário.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Ao chegar no centro de Tóquio, nossa recomendação é trocar o dinheiro
                numa casa de câmbio como a 銀座エクスチェンジ GINZA EXCHANGE (bairro de
                Ginza), ou em bancos como o Mitsubishi-UFJ, que possuem guichê de
                troca de câmbio.
              </p>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-6">
              <p id="secao-3-4" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.4 — Restaurantes
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-sm font-medium text-white">Terminal 1</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Kaitensushi Misaki (5F), Ramen Ichikakuya (5F), Tonkatsu Shinjuku
                  Saboten (4F) e Tsukiji Sushiiwa (4F). Para comida ocidental:
                  McDonald&apos;s, Starbucks, Shake Shack e Subway (4F).
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <ImageCard src="/images/misaki.jpg" alt="Sushi de salmão do Kaitensushi Misaki" label="Kaitensushi Misaki" sublabel="≈ ¥1.500–2.500 por pessoa" fit="cover" zoomHref="#foto-misaki" />
                  <ImageCard src="/images/ramen-ichikakuya.jpg" alt="Tigela de ramen do Ramen Ichikakuya" label="Ramen Ichikakuya" sublabel="≈ ¥1.000–1.300 por pessoa" fit="cover" zoomHref="#foto-ramen-ichikakuya" />
                  <ImageCard src="/images/saboten.jpg" alt="Prato de tonkatsu com curry do Tonkatsu Shinjuku Saboten" label="Tonkatsu Shinjuku Saboten" sublabel="≈ ¥1.300–1.800 por pessoa" fit="cover" zoomHref="#foto-saboten" />
                  <ImageCard src="/images/sushi-iwa.jpg" alt="Prato variado de sushi do Tsukiji Sushiiwa" label="Tsukiji Sushiiwa" sublabel="≈ ¥2.500–3.500 por pessoa" fit="cover" zoomHref="#foto-sushi-iwa" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {[
                    { src: "/images/mcdonalds.webp", alt: "Logo McDonald's" },
                    { src: "/images/Starbucks-Logo.wine.png", alt: "Logo Starbucks" },
                    { src: "/images/Shake_Shack_logo.svg.webp", alt: "Logo Shake Shack" },
                    { src: "/images/Subway_2016_logo.svg.webp", alt: "Logo Subway" },
                  ].map((logo) => (
                    <div
                      key={logo.src}
                      className="relative h-9 w-16 overflow-hidden rounded-md bg-white p-1.5"
                    >
                      <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-sm font-medium text-white">Terminal 2</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Tokyo Tonkotsu by Ippudo (4F), Sushi Uogashi Nihon-ichi (4F),
                  Sushi-go-round Gansozushi (4F) e Tonkatsu Inaba Wako (4F). Para
                  comida ocidental: Starbucks (4F).
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <ImageCard src="/images/tokyo-tonkotsu.jpg" alt="Tigela de ramen do Tokyo Tonkotsu by Ippudo" label="Tokyo Tonkotsu by Ippudo" sublabel="≈ ¥1.000–1.500 por pessoa" fit="cover" zoomHref="#foto-tokyo-tonkotsu" />
                  <ImageCard src="/images/sushi-uogashi.jpg" alt="Prato variado de sushi do Sushi Uogashi Nihon-ichi" label="Sushi Uogashi Nihon-ichi" sublabel="≈ ¥2.000–3.000 por pessoa" fit="cover" zoomHref="#foto-sushi-uogashi" />
                  <ImageCard src="/images/gansozushi.jpg" alt="Sushi de salmão do Sushi-go-round Gansozushi" label="Sushi-go-round Gansozushi" sublabel="≈ ¥1.500–2.500 por pessoa" fit="cover" zoomHref="#foto-gansozushi" />
                  <ImageCard src="/images/inaba-wako.jpg" alt="Prato de tonkatsu do Tonkatsu Inaba Wako" label="Tonkatsu Inaba Wako" sublabel="≈ ¥1.300–1.800 por pessoa" fit="cover" zoomHref="#foto-inaba-wako" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="relative h-9 w-16 overflow-hidden rounded-md bg-white p-1.5">
                    <Image src="/images/Starbucks-Logo.wine.png" alt="Logo Starbucks" fill className="object-contain" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-sm font-medium text-white">Terminal 3</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Tatsu Sushi e Freshness Burger (comida ocidental). O Terminal 3 é
                  bem pequeno em comparação aos demais, porém se o objetivo for
                  comer sushi o Tatsu é na verdade um dos 2 melhores restaurantes
                  de sushi da área externa do aeroporto. Se quiser outros tipos de
                  comida, siga até o Terminal 2 pela passagem terrestre no 3F.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <ImageCard src="/images/tatsu-sushi.jpg" alt="Sushi do Tatsu Sushi" label="Tatsu Sushi" sublabel="≈ ¥2.000–3.000 por pessoa" fit="cover" zoomHref="#foto-tatsu-sushi" />
                  <ImageCard src="/images/freshness.jpg" alt="Hambúrguer e batatas do Freshness Burger" label="Freshness Burger" sublabel="≈ ¥900–1.200 por pessoa" fit="cover" zoomHref="#foto-freshness" />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-5" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.5 — Farmácia
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 1</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    4F — Airport Drug e AP American Pharmacy.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 2</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    4F — Drug Box MediCosme.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-6" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.6 — Envio de Bagagem (Takkyubin)
              </p>
              <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b9bd5]/15 text-[#8fc0e8]">
                    <IconLuggage className="h-6 w-6" />
                  </span>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
                    Luggage Delivery (TA-Q-BIN)
                  </p>
                  <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-yellow-400">
                    Opcional
                  </span>
                </div>
                <div className="relative mx-auto mt-5 h-12 w-24">
                  <Image src="/images/taqbinlogo.png" alt="Logo TA-Q-BIN, da Yamato Transport" fill className="object-contain" />
                </div>
                <p className="mt-5 text-center text-base font-light leading-8 text-white/70">
                  Logo na saída do desembarque existe o balcão de envio de malas
                  (Luggage Delivery / Yamato Transport, o TA-Q-BIN). Para clientes de
                  alto padrão ou famílias com muitas malas, mandar a bagagem direto
                  para o hotel — chegando no mesmo dia ou no dia seguinte — e seguir
                  até o centro apenas com uma mochila é um diferencial gigante de
                  conforto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PreviewModal
        id="doc-qr-code"
        eyebrow="Documento"
        label="QR Code de exemplo — Visit Japan Web"
        src="/images/qr-code.png"
        alt="Tela do Visit Japan Web mostrando o QR Code de exemplo para imigração e declaração aduaneira"
      />
      <PreviewModal
        id="foto-kiosk-imigracao"
        eyebrow="Imigração"
        label="Quiosque de leitura do QR Code"
        src="/images/kiosk-imigracao-qr-code.jpg"
        alt="Quiosque de leitura do QR Code do Visit Japan Web para imigração e alfândega"
      />
      <PreviewModal
        id="foto-arrivals-placa"
        eyebrow="Imigração"
        label="Placa de Arrivals (到着)"
        src="/images/visao-nova-placa-arrivals.png"
        alt="Placa de sinalização do aeroporto indicando Arrivals (到着), em japonês, inglês, coreano e chinês"
      />
      <PreviewModal
        id="doc-disembarkation"
        eyebrow="Documento"
        label="Disembarkation Card for Foreigner"
        src="/images/disembarkation-card.png"
        alt="Formulário Disembarkation Card for Foreigner — Cartão de Imigração para Não-Residente"
      />
      <PreviewModal
        id="doc-customs"
        eyebrow="Documento"
        label="Customs Declaration"
        src="/images/custom-declaration.png"
        alt="Formulário Customs Declaration — Declaração Aduaneira"
      />

      <PreviewModal
        id="foto-misaki"
        eyebrow="Terminal 1"
        label="Kaitensushi Misaki"
        src="/images/misaki.jpg"
        alt="Sushi de salmão do Kaitensushi Misaki"
      />
      <PreviewModal
        id="foto-ramen-ichikakuya"
        eyebrow="Terminal 1"
        label="Ramen Ichikakuya"
        src="/images/ramen-ichikakuya.jpg"
        alt="Tigela de ramen do Ramen Ichikakuya"
      />
      <PreviewModal
        id="foto-saboten"
        eyebrow="Terminal 1"
        label="Tonkatsu Shinjuku Saboten"
        src="/images/saboten.jpg"
        alt="Prato de tonkatsu com curry do Tonkatsu Shinjuku Saboten"
      />
      <PreviewModal
        id="foto-sushi-iwa"
        eyebrow="Terminal 1"
        label="Tsukiji Sushiiwa"
        src="/images/sushi-iwa.jpg"
        alt="Prato variado de sushi do Tsukiji Sushiiwa"
      />
      <PreviewModal
        id="foto-tokyo-tonkotsu"
        eyebrow="Terminal 2"
        label="Tokyo Tonkotsu by Ippudo"
        src="/images/tokyo-tonkotsu.jpg"
        alt="Tigela de ramen do Tokyo Tonkotsu by Ippudo"
      />
      <PreviewModal
        id="foto-sushi-uogashi"
        eyebrow="Terminal 2"
        label="Sushi Uogashi Nihon-ichi"
        src="/images/sushi-uogashi.jpg"
        alt="Prato variado de sushi do Sushi Uogashi Nihon-ichi"
      />
      <PreviewModal
        id="foto-gansozushi"
        eyebrow="Terminal 2"
        label="Sushi-go-round Gansozushi"
        src="/images/gansozushi.jpg"
        alt="Sushi de salmão do Sushi-go-round Gansozushi"
      />
      <PreviewModal
        id="foto-inaba-wako"
        eyebrow="Terminal 2"
        label="Tonkatsu Inaba Wako"
        src="/images/inaba-wako.jpg"
        alt="Prato de tonkatsu do Tonkatsu Inaba Wako"
      />
      <PreviewModal
        id="foto-tatsu-sushi"
        eyebrow="Terminal 3"
        label="Tatsu Sushi"
        src="/images/tatsu-sushi.jpg"
        alt="Sushi do Tatsu Sushi"
      />
      <PreviewModal
        id="foto-freshness"
        eyebrow="Terminal 3"
        label="Freshness Burger"
        src="/images/freshness.jpg"
        alt="Hambúrguer e batatas do Freshness Burger"
      />

      <PreviewModal
        id="foto-ic-metro"
        eyebrow="IC Card"
        label="Catraca do metrô"
        src="/images/ic-metro.png"
        alt="Catraca do metrô com área de toque para cartão IC e QR code"
      />
      <PreviewModal
        id="foto-ic-sensor"
        eyebrow="IC Card"
        label="Sensor de aproximação"
        src="/images/ic-card-2.png"
        alt="Sensor circular de IC card sendo usado com um cartão Pasmo"
      />
      <PreviewModal
        id="foto-ic-vending"
        eyebrow="IC Card"
        label="Máquinas de bebida"
        src="/images/ic-card-vending-machine.png"
        alt="Máquina de bebidas com leitor de IC card por aproximação"
      />

      {/* Deslocamento */}
      <section id="deslocamento" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Deslocamento até Tóquio" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Já Terminei os Preparativos, Como Chego ao Hotel e Qual Meio de Transporte
            Devo Escolher?
          </h2>

          <p className="mb-10 text-base font-light leading-8 text-white/70">
            Existem basicamente 3 formas de chegar até Tóquio a partir de Narita.
          </p>

          <div className="mb-10">
            <TransportSummaryTable
              rows={[
                { label: "Trem (N'EX ou Skyliner)", tempo: 4, custo: 5, recomendacao: "Pior Opção" },
                { label: "Ônibus (Limousine Bus)", tempo: 3, custo: 4, recomendacao: "Melhor Custo-Benefício" },
                { label: "Táxi/Uber", tempo: 5, custo: 1, recomendacao: "Opção mais Confortável, porém muito caro" },
              ]}
            />
          </div>

          <div className="mb-10">
            <ImageCard
              src="/images/narita-to-tokyo-map.png"
              alt="Mapa de rota do Aeroporto de Narita até o centro de Tóquio, com distância e tempo estimado"
              fit="cover"
              aspect="aspect-[21/9]"
              zoomHref="#mapa-narita-tokyo"
            />
          </div>

          <div id="deslocamento-trem" className="space-y-5">
            <SubStepHeading number={1} title="Trem" />

            <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              Narita Express (N&apos;EX) — para Shinjuku, Shibuya, Tóquio
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥3.250"
                detail="Narita Express, classe normal — até a estação de Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 80 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              Mesmo utilizando o trem expresso (N&apos;EX), o trajeto é longo, e após
              chegar em uma das estações que conectam com a linha expressa você ainda
              vai precisar se deslocar até a estação de metrô mais próxima do seu hotel
              e realizar a parte final do trajeto a pé. A maioria das estações de metrô
              no Japão são grandes e possuem muitos lances de escada, o que torna
              carregar malas após 30h de viagem uma tarefa muito cansativa. Além disso,
              é comum ter que fazer o trajeto em pé dentro do vagão do metrô em alguns
              horários, por lotação dos vagões nos horários de pico.
            </p>

            <p className="pt-2 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              Keisei Skyliner — para Ueno, Asakusa, Ginza, Nihonbashi
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥2.310"
                detail="Compra antecipada online — até a estação de Ueno"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 41 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              Para clientes que vão se hospedar no lado leste de Tóquio — Ueno,
              Asakusa, Ginza, Nihonbashi — o Keisei Skyliner costuma ser mais rápido
              que o N&apos;EX (cerca de 36 a 41 minutos até Ueno) e muito confortável,
              já que evita o trajeto mais longo até Shinjuku seguido de baldeação.
            </p>

            <p className="text-base font-light leading-8 text-white/70">
              Dentre as 3 opções (Trem, Ônibus, Táxi/Uber), o trem é sem dúvida a
              pior de todas para quem vai para o lado oeste de Tóquio — mas pode
              valer a pena via Skyliner se o hotel for no lado leste.
            </p>
          </div>

          <div id="deslocamento-onibus" className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-center gap-3">
              <SubStepHeading number={2} title="Ônibus" />
              <span className="rounded-full bg-[#5b9bd5]/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#5b9bd5]">
                Método recomendado
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥3.600"
                detail="Limousine Bus — até a estação de Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 105 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              Dependendo do hotel, existe um ônibus chamado Limousine Bus que vai desde
              o aeroporto de Narita até a porta do hotel. Nem todos os hotéis são
              cobertos, mas existe sempre um terminal de ônibus ou estação de metrô
              próximo aos hotéis que possuem paradas finais para esses ônibus.
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              De todas as 3 opções, é o melhor custo-benefício: você vai sentado e não
              precisa se preocupar com as bagagens, pois elas vão no bagageiro. A única
              desvantagem é quando não existe ônibus direto ao hotel — nesses casos,
              normalmente recomendamos que seja pego um táxi para a parte final do
              trajeto.
            </p>
          </div>

          <div id="deslocamento-taxi" className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Táxi/Uber" />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥26.300 a ¥36.000"
                detail="Táxi (tarifa fixa) a Uber (tarifa dinâmica) — até Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 75 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              É a opção mais cômoda e confortável, mas custa até 10x mais que as
              outras — uma viagem de Narita até Tóquio pode facilmente chegar a
              R$ 1.000,00.
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Recomendo usar somente caso o desembarque em Tóquio ocorra num horário
              muito tarde e já não exista ônibus disponível.
            </p>
          </div>
        </div>
      </section>

      <FlowDivider
        Icon={IconPlaneTakeoff}
        title="Embarque"
        subtitle="Trâmites de saída e check-in — do hotel até a entrada no avião, na volta para casa."
        displayClassName={display.className}
      />

      {/* Antes de sair do hotel */}
      <section id="secao-5" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={1} label="Antes de Sair do Hotel" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            O Que Verificar Antes de Sair do Hotel?
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-white/70">
            Se programe para sair do hotel pelo menos <span className="text-white">3 horas antes</span> do
            horário de embarque.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionItem
              Icon={IconMap}
              title="Confirmar o aeroporto"
              text="Em Tóquio existem dois grandes aeroportos internacionais: Haneda e Narita."
            />
            <ActionItem
              Icon={IconPlaneTakeoff}
              title="Confirmar o Terminal"
              text="Principalmente em Narita, já que não é possível se mover rapidamente entre o Terminal 1 e o Terminal 2/3 — ficam a cerca de 10–15 minutos de distância entre si, após embarcar no transfer."
            />
            <ActionItem
              Icon={IconWifi}
              title="Pocket Wi-Fi"
              text="Conferir se o Pocket Wi-Fi está com você, caso tenha optado por alugar."
            />
            <ActionItem
              Icon={IconDocument}
              title="Passaporte"
              text="Conferir se o passaporte está com você."
            />
          </div>

          <div className="mt-8 rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
              Confira o Peso das Malas Antes de Sair
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Verifique se o peso das malas está de acordo com os limites estabelecidos
              pela companhia aérea. Embora seja difícil ter uma balança no hotel,
              procure distribuir o peso uniformemente entre as malas.
            </p>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2f80c9]/40">
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white">Classe</th>
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white">Peso por mala</th>
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white">Malas incluídas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4 font-medium text-white">Econômica / Premium Economy</td>
                    <td className="px-5 py-4 text-white/70">até 23 kg</td>
                    <td className="px-5 py-4 text-white/70">2 malas</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="px-5 py-4 font-medium text-white">Executiva / Primeira Classe</td>
                    <td className="px-5 py-4 text-white/70">até 32 kg</td>
                    <td className="px-5 py-4 text-white/70">2–3 malas (varia por companhia/rota)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Como referência (JAL, rotas internacionais): o excesso entre 23 kg e 32 kg
              costuma gerar uma taxa de aproximadamente <span className="text-white">¥10.000 (≈ US$100)</span> por
              mala; entre 32 kg e 45 kg, a taxa sobe para cerca de <span className="text-white">¥60.000 (≈
              US$600)</span>. Acima de <span className="text-white">45 kg a mala normalmente não é aceita para
              embarque</span> — algumas companhias já recusam qualquer mala acima de 32 kg,
              independentemente do pagamento de taxa, por norma de segurança no
              manuseio. Esses valores variam por companhia aérea e rota — confirme
              sempre a política específica da companhia do cliente antes da viagem.
            </p>
          </div>
        </div>
      </section>

      {/* Qual meio de transporte escolher (embarque) */}
      <section id="secao-6" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Qual Meio de Transporte Escolher?" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Qual Meio de Transporte Escolher Até o Aeroporto?
          </h2>

          <p className="mb-10 text-base font-light leading-8 text-white/70">
            A mesma comparação do trajeto Narita → Tóquio (seção &quot;Deslocamento até
            Tóquio&quot;, no Desembarque) vale para o caminho inverso — Hotel → Narita —
            mas aqui a recomendação muda.
          </p>

          <div className="mb-10">
            <TransportSummaryTable
              rows={[
                { label: "Trem (N'EX ou Skyliner)", tempo: 4, custo: 5, recomendacao: "Evitar" },
                { label: "Ônibus (Limousine Bus)", tempo: 3, custo: 4, recomendacao: "Melhor Custo-Benefício" },
                { label: "Táxi/Uber", tempo: 5, custo: 1, recomendacao: "Opção mais Confortável" },
              ]}
            />
          </div>

          <p className="text-base font-light leading-8 text-white/70">
            Diferente do desembarque, aqui nossa recomendação é sempre que possível
            ir de <span className="text-white">táxi/Uber</span> ou de{" "}
            <span className="text-white">ônibus (Limousine Bus)</span>. O motivo é
            que, após dias de viagem, as bagagens normalmente estão no limite do
            peso, e carregar diversas malas por escadas de metrô ou andar na rua com
            as bagagens é bastante incômodo.
          </p>
        </div>
      </section>

      {/* Cheguei no aeroporto, e agora? */}
      <section id="secao-7" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={3} label="Cheguei no Aeroporto, e Agora?" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Cheguei no Aeroporto, e Agora?
          </h2>

          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#5b9bd5]/40 text-xs font-medium text-[#5b9bd5]">
                1
              </span>
              <p className="text-sm leading-6 text-white/70 md:text-base">
                <span className="font-medium text-white">Devolver o Pocket Wi-Fi</span> no guichê
                da empresa — em Narita costuma ficar no <span className="text-white">1F</span>; em
                Haneda, no <span className="text-white">3F</span>, próximo aos guichês das
                companhias aéreas.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#5b9bd5]/40 text-xs font-medium text-[#5b9bd5]">
                2
              </span>
              <p className="text-sm leading-6 text-white/70 md:text-base">
                <span className="font-medium text-white">Confirmar o terminal certo</span> e
                verificar se o check-in/despacho de mala já está disponível —
                normalmente abre cerca de <span className="text-white">3 horas antes</span> da partida do
                voo.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#5b9bd5]/40 text-xs font-medium text-[#5b9bd5]">
                3
              </span>
              <p className="text-sm leading-6 text-white/70 md:text-base">
                Se dirigir ao guichê e realizar o <span className="text-white">check-in</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estou com fome */}
      <section id="secao-8" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Estou com Fome" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Devo Realizar a Refeição Fora ou Dentro da Área de Segurança?
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-white/70">
            Tanto em Haneda quanto em Narita existem várias opções de comida na parte
            externa do aeroporto e na área após a checagem de segurança. Abaixo, os
            principais restaurantes disponíveis no Terminal 1 e 2{" "}
            <span className="text-white">após a checagem de segurança</span>.
          </p>

          <div className="space-y-6">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                Terminal 1 — Após Segurança
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <RestaurantMini
                  name="Yomenya Goemon"
                  detail="Massas italianas com toque japonês"
                  location="5F — vista para o deck de observação"
                />
                <RestaurantMini
                  name="Food Court do 5F"
                  detail="Diversas cozinhas — japonesa, tailandesa, ocidental"
                  location="5F"
                />
                <RestaurantMini
                  name="Narita Nakamise"
                  detail="Maior galeria de duty free do Japão, com quiosques de comida rápida japonesa"
                  location="Ala Sul"
                />
              </div>
            </div>

            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                Terminal 2 — Após Segurança
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <RestaurantMini
                  name="Japan Food Hall"
                  detail="10 restaurantes reunidos — sushi, wagyu à milanesa (katsu), okonomiyaki"
                  location="2F, Main Building"
                />
                <RestaurantMini
                  name="Kyoto Katsugyu"
                  detail="Tonkatsu/gyukatsu estilo Kyoto"
                  location="2F, Main Building"
                />
                <RestaurantMini
                  name="Ginza Kagari"
                  detail="Ramen de assinatura da conhecida casa de Ginza"
                  location="2F, Main Building"
                />
                <RestaurantMini
                  name="T's TanTan"
                  detail="Opção 100% vegana — ramen, gyoza, harumaki"
                  location="2F"
                />
                <RestaurantMini
                  name="Misakimaru"
                  detail="Sushi de boa relação custo-benefício (rede Kyotaru)"
                  location="Terminal 2"
                />
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm leading-6 text-white/50">
            Recomendamos confirmar o horário de funcionamento antes — algumas casas
            fecham mais cedo do que o esperado para o último voo do dia.
          </p>
        </div>
      </section>

      {/* Checagem de segurança */}
      <section id="secao-9" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={5} label="Checagem de Segurança e Entrada na Área de Segurança" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Checagem de Segurança e Entrada na Área de Segurança
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-white/70">
            Haneda e Narita possuem procedimentos de segurança distintos e,
            dependendo da época do ano, eles mudam.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-sm font-medium text-white md:text-base">Em Narita</p>
              <div className="mt-3 space-y-1.5 text-sm leading-6 text-white/60">
                <p>• É necessário remover o notebook da mala e colocá-lo na bandeja.</p>
                <p>
                  • Não é possível embarcar com líquidos acima de 100 ml — se houver
                  alguma garrafa maior, é comum pedirem para abrir a mala e verificar.
                </p>
                <p>
                  • Exceção: bebidas, cosméticos e outros líquidos comprados no duty
                  free após a checagem de segurança podem ser levados sem essa
                  restrição.
                </p>
                <p>• Os demais itens proibidos comuns a qualquer aeroporto se aplicam normalmente.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-sm font-medium text-white md:text-base">Em Haneda</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Em alguns corredores (Smart Lanes) é utilizado um scanner de tomografia
                que não exige que nada seja removido de dentro da mala — o escaneamento
                ocorre de maneira quase instantânea. Nem sempre o serviço está
                disponível, mas quando está, a passagem pela segurança leva menos de 5
                minutos.
              </p>
            </div>
          </div>

          <div id="secao-9-passaporte" className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={1} title="Verificação de Passaporte" />
            <p className="text-base font-light leading-8 text-white/70">
              Em alguns casos, nessa etapa o oficial retira do passaporte os
              comprovantes e notas fiscais de compras feitas no Japão. Pode ser pedido
              para conferir se você está portando algum dos itens citados nas notas,
              assegurando que ele está de fato deixando o país — condição para a
              isenção do imposto de consumo de <span className="text-white">10%</span> (8%
              para alimentos/bebidas não alcoólicas), que o não-residente não paga.
            </p>

            <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
              <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
                <IconClock className="h-3.5 w-3.5" />
                Atualização Importante
              </p>
              <p className="text-sm leading-7 text-white/70 md:text-base md:leading-8">
                A partir de <span className="text-white">1º de novembro de 2026</span>, o Japão
                substitui esse sistema: o turista passa a pagar o preço cheio (com
                imposto) na loja e só recebe o reembolso do imposto de consumo em
                terminais/guichês dedicados no aeroporto (Narita incluso), antes de
                embarcar, via escaneamento do passaporte. Vale confirmar com o cliente
                qual sistema estará vigente na data do voo e reservar um tempo extra
                (recomenda-se 45–60 minutos a mais) nesse processo de reembolso
                enquanto o novo sistema estiver rodando.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pós-checagem de segurança */}
      <section id="secao-10" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={6} label="Pós-Checagem de Segurança" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Pós-Checagem de Segurança
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-white/70">
            Aqui você tem algumas opções sobre o que fazer antes do embarque — entre
            as mais comuns, restaurantes, compras em duty free ou o lounge/sala VIP
            de sua preferência.
          </p>

          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">Restaurantes</p>
            <p className="text-base font-light leading-8 text-white/70">
              Ver a lista completa na seção &quot;Estou com Fome&quot;, logo acima — os mesmos
              restaurantes de Terminal 1 e 2 seguem disponíveis nesta etapa, já que
              estão todos após a checagem de segurança.
            </p>
          </div>

          <div id="secao-10-dutyfree" className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">Duty Free</p>
            <p className="text-base font-light leading-8 text-white/70">
              Você pode <span className="text-white">comprar diretamente</span> nas lojas de duty
              free já dentro da área de embarque (pós-segurança) e sair com o produto
              na hora. Ou pode <span className="text-white">pré-reservar online</span> (de 1 mês
              até 2 dias antes da viagem, dependendo da loja) e retirar no Duty Free
              Pick Up Counter, também na área pós-segurança — a retirada é permitida
              apenas pelo próprio comprador, até 1 hora antes do embarque; chegando
              depois disso, a loja pode não conseguir entregar o produto a tempo.
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Itens líquidos comprados em lojas de duty free da área antes da
              segurança (landside) não podem ser levados na cabine — nesse caso,
              precisam ser despachados na mala ou comprados apenas nas lojas
              pós-segurança.
            </p>
          </div>

          <div id="secao-10-lounges" className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">Lounges</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-sm font-medium text-white md:text-base">ANA Lounge — Terminal 1</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Inclui opções de ramen e sushi. Aceita passageiros de Business/First
                  da Star Alliance, elite ANA Mileage Club, ou portadores de Priority
                  Pass.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-sm font-medium text-white md:text-base">JAL Sakura Lounge — Terminal 1</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Atende passageiros de Classe Executiva da JAL e parceiras Oneworld
                  (Qatar Airways, British Airways etc.), além de membros JGC/JMB
                  Sapphire ou superior. Também aceita Priority Pass, com limite de
                  passes conforme o cartão do portador.
                </p>
              </div>
            </div>

            <p className="pt-2 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Cartões brasileiros com acesso a salas Priority Pass (confirme as
              condições vigentes antes da viagem):
            </p>
            <div className="space-y-1.5 text-sm leading-6 text-white/60">
              <p>• <span className="text-white">Nubank Ultravioleta</span> (Mastercard Black) — 4 acessos anuais via Priority Pass.</p>
              <p>• <span className="text-white">Santander The Platinum Card</span> (Amex) — 2 acessos anuais, condicionados a gasto mínimo recente no cartão.</p>
              <p>• Cartões <span className="text-white">Itaú Private/Personnalité</span> costumam dar acesso apenas às salas próprias da bandeira no Brasil, sem Priority Pass gratuito internacional.</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <p className="text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Embora contra-intuitivo, o JAL Sakura Lounge — utilizado pela JAL e
              Qatar Airways, entre outras parceiras, para Business Class — tem
              péssimas opções de refeição. Minha recomendação é fazer a refeição fora
              do lounge se tiver interesse em comer algo melhor; o lounge em si é
              espaçoso e confortável, mas comida realmente não é o forte.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              O melhor lounge de Narita é o ANA Lounge, com opção até de comer ramen e
              sushi.
            </p>
          </div>
        </div>
      </section>

      {/* Antes do embarque */}
      <section id="secao-11" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={7} label="Antes do Embarque" />
          </div>

          <h2 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
            Antes do Embarque
          </h2>

          <div className="max-w-xs">
            <StatCard
              Icon={IconClock}
              label="Chegar ao portão"
              value="30 min antes"
              detail="Da abertura do embarque, para evitar qualquer imprevisto"
              variant="highlight"
            />
          </div>
        </div>
      </section>

    </main>
  );
}
