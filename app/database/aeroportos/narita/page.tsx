import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import Image from "next/image";
import {
  InternalGuideHeader,
  FlowTag,
  SectionMarker,
  TerminalCard,
  MapCard,
  MapModal,
  PreviewModal,
  ImageCard,
  CaptionedImage,
  ImmigrationArrivalGuide,
  SubStepHeading,
  IconBulb,
  IconPlaneLanding,
  IconPlaneTakeoff,
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
        <FlowTag Icon={IconPlaneLanding} label="Desembarque" subtitle="Chegada e trâmites de entrada" />
        <FlowTag Icon={IconPlaneTakeoff} label="Embarque" subtitle="Trâmites de saída e check-in" />
      </div>

      {/* Visão geral */}
      <section className="px-6 py-14 md:px-10 md:py-20">
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
              companhias="Ala Sul: Star Alliance (ANA, United, Lufthansa, Air Canada, Thai, Asiana, entre outras). Ala Norte: SkyTeam (Delta, Korean Air, China Airlines, Vietnam Airlines, Garuda Indonesia, entre outras)."
            />
            <TerminalCard
              nome="Terminal 2"
              tipo="Internacional, com voos domésticos da JAL."
              companhias="Oneworld — JAL, British Airways, Finnair, Cathay Pacific, American Airlines, Qatar Airways, Malaysia Airlines, entre outras."
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

      {/* Chegada e imigração */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Chegada e Imigração" />
          </div>

          <ImmigrationArrivalGuide displayClassName={display.className} />
        </div>
      </section>

      {/* Recomendações antes de sair do aeroporto */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
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
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
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
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
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
                <ImageCard
                  src="/images/ic-metro.png"
                  alt="Catraca do metrô com área de toque para cartão IC e QR code"
                  label="Catraca do metrô"
                  sublabel="Aproxime o cartão na área indicada"
                  fit="cover"
                  zoomHref="#foto-ic-metro"
                />
                <ImageCard
                  src="/images/ic-card-2.png"
                  alt="Sensor circular de IC card sendo usado com um cartão Pasmo"
                  label="Sensor de aproximação"
                  sublabel="Encoste o cartão até o bipe"
                  fit="cover"
                  zoomHref="#foto-ic-sensor"
                />
                <ImageCard
                  src="/images/ic-card-vending-machine.png"
                  alt="Máquina de bebidas com leitor de IC card por aproximação"
                  label="Máquinas de bebida"
                  sublabel="Também aceitam o IC Card"
                  fit="cover"
                  zoomHref="#foto-ic-vending"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
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
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
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
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
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

          <div className="space-y-5">
            <SubStepHeading number={1} title="Trem" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Custo</p>
                <p className="text-white">
                  ¥3.250 (Narita Express, classe ordinária) até a estação de Shinjuku
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  Tempo de deslocamento
                </p>
                <p className="text-white">≈ 80 minutos</p>
              </div>
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
            <p className="text-base font-light leading-8 text-white/70">
              Dentre as 3 opções, é sem dúvida a pior de todas.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-center gap-3">
              <SubStepHeading number={2} title="Ônibus" />
              <span className="rounded-full bg-[#5b9bd5]/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#5b9bd5]">
                Método recomendado
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Custo</p>
                <p className="text-white">¥3.600 (Limousine Bus) até a estação de Shinjuku</p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  Tempo de deslocamento
                </p>
                <p className="text-white">≈ 105 minutos</p>
              </div>
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

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Táxi/Uber" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Custo</p>
                <p className="text-white">
                  ¥26.300 (táxi, tarifa fixa) a ¥36.000 (Uber, tarifa dinâmica) até
                  Shinjuku
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  Tempo de deslocamento
                </p>
                <p className="text-white">≈ 75 minutos</p>
              </div>
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

    </main>
  );
}
