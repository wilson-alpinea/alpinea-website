import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import {
  InternalGuideHeader,
  FlowTag,
  SectionMarker,
  TerminalCard,
  RestaurantMini,
  PreviewModal,
  CaptionedImage,
  ImageCard,
  ImmigrationArrivalGuide,
  SubStepHeading,
  StatCard,
  IconBulb,
  IconExchange,
  IconClock,
  IconPlaneLanding,
  IconPlaneTakeoff,
} from "../../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Aeroporto de Kansai (KIX)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function KansaiGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Anexo com Informação Detalhada - Aeroportos - Kansai (KIX)"
        title="Kansai International Airport - 関西国際空港"
        code="KIX"
        subtitle="Aeroporto Internacional de Kansai, construído sobre uma ilha artificial na baía de Osaka. Porta de entrada para Osaka, Kyoto, Kobe e toda a região de Kansai."
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
            Como Funciona o Aeroporto de Kansai? Existe Mais de um Terminal?
          </h2>
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Kansai é o aeroporto natural de entrada para roteiros que começam por
            Osaka, Kyoto ou Kobe, em vez de Tóquio. O Terminal 1 concentra a maior
            parte dos voos internacionais; o Terminal 2 atende companhias de baixo
            custo e não tem estação de trem própria.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <TerminalCard
              nome="Terminal 1"
              tipo="Principal — concentra a maior parte dos voos internacionais e domésticos de companhias tradicionais. Retirada de bagagem e alfândega no 1F."
              aliancas={[
                {
                  logo: "/images/star-alliance.png",
                  logoAlt: "Logo da Star Alliance",
                  texto: "ANA, United Airlines, Lufthansa, EVA Air, entre outras.",
                },
                {
                  logo: "/images/one-world.webp",
                  logoAlt: "Logo da Oneworld",
                  texto: "JAL, Cathay Pacific, entre outras.",
                },
                {
                  logo: "/images/SkyTeam-Logo.png",
                  logoAlt: "Logo da SkyTeam",
                  texto: "Korean Air, Air France, KLM, entre outras.",
                },
              ]}
            />
            <TerminalCard
              nome="Terminal 2"
              tipo="Doméstico e internacional de baixo custo — sem estação de trem própria, conectado ao Terminal 1 por ônibus lançadeira gratuito."
              companhias="Peach Aviation, Jetstar Japan, entre outras."
            />
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
                O Terminal 2 não tem estação de trem — se você precisa pegar o Nankai
                Rapi:t, o JR Haruka ou comprar o Icoca, é necessário primeiro ir de{" "}
                <span className="text-white">ônibus lançadeira gratuito</span> até o
                Terminal 1. O trajeto sai da área do Aeroplaza, leva de 7 a 9 minutos e
                opera 24 horas, com partidas a cada 10–15 minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

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
              Antes de seguir para Osaka, Kyoto ou Kobe, vale resolver alguns pontos
              ainda no Terminal 1 — os balcões ficam todos no 1F, na área de chegada
              internacional.
            </p>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.1 — Aluguel de Pocket Wi-Fi ou eSIM 5G
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O balcão da NINJA WiFi fica no 1F do Terminal 1, no saguão de chegada
                internacional, aberto das 06:00 às 23:00. Há também máquinas de venda
                de chip físico e eSIM no mesmo saguão, e o balcão JAL ABC perto do
                portão norte de chegada.
              </p>

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
                3.2 — Comprar IC Card (Icoca)
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O Icoca é o cartão pré-pago regional, equivalente ao Suica de Tóquio —
                não existe diferença prática de uso entre eles, e ambos funcionam em
                praticamente todo o Japão. Compre na estação JR Kansai Airport
                Station, no 2F do Terminal 1, no guichê Midori no Madoguchi ou nas
                máquinas de autoatendimento, das 05:30 às 23:00. O valor padrão é de
                ¥2.000 (¥500 de depósito reembolsável + ¥1.500 de saldo inicial).
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O IC Card também é utilizado e aceito como forma de pagamento em
                lojas de conveniência, pequenas compras e máquinas de bebida na rua.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <CaptionedImage
                  src="/images/icoca-ic-card-transparent.png"
                  alt="Cartão Icoca, com o mascote ornitorrinco"
                  caption="IC Card Icoca"
                />
                <CaptionedImage
                  src="/images/suica-vector.png"
                  alt="Cartão JR Suica, com o mascote pinguim"
                  caption="IC Card JR Suica (também aceito)"
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
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.3 — Câmbio
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O KIX Currency Exchange tem dois balcões na área de chegada
                internacional do Terminal 1 (1F) — North Shop, das 06:15 às 23:00, e
                South Shop, das 06:30 às 23:00.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Vale trocar apenas o necessário para o primeiro dia — uma refeição no
                aeroporto custa, em média, ¥1.200–2.500 por pessoa, e um táxi ou Uber
                até Namba custa entre ¥15.000 e ¥24.000, dependendo do horário.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.4 — Restaurantes
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <RestaurantMini
                  name="Machiya Koji Dining Court / Area 24 / Gourmet Avenue"
                  detail="Praças de alimentação com opções variadas e acessíveis — ≈ ¥1.000–1.800 por pessoa"
                  location="T1 · 2º andar"
                />
                <RestaurantMini
                  name="KIX Beer"
                  detail="Cervejaria com petiscos — ≈ ¥1.500–2.500 por pessoa"
                  location="T1 · 1F"
                />
                <RestaurantMini
                  name="COCO'S Airport Dining"
                  detail="Ocidental e japonês — hambúrgueres, café da manhã, sobremesas — ≈ ¥1.200–2.000 por pessoa"
                  location="T1 · 1F"
                />
                <RestaurantMini
                  name="Ganko Sushi · 551 Horai"
                  detail="Sushi e culinária de Osaka, perto do portão de embarque — ≈ ¥2.000–3.000 por pessoa"
                  location="T1"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.5 — Farmácia
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Kokokara Fine</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Terminal 1.</p>
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
        src="/images/arrivals-placa.png"
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
            <SectionMarker number={4} label="Deslocamento até Osaka e Kyoto" />
          </div>

          <h2 className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
            Já Terminei os Preparativos, Como Chego ao Hotel e Qual Meio de Transporte
            Devo Escolher?
          </h2>

          <p className="mb-10 text-base font-light leading-8 text-white/70">
            Existem basicamente 3 formas de chegar até Osaka a partir de Kansai — a
            escolha muda um pouco se o destino final for Kyoto, mas a lógica geral é
            a mesma.
          </p>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <SubStepHeading number={1} title="Trem" />
              <span className="rounded-full bg-[#5b9bd5]/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#5b9bd5]">
                Método recomendado
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥1.520"
                detail="Nankai Rapi:t (e-ticket) — até Namba"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 35 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              O Nankai Rapi:t é a opção mais rápida e confortável até Namba, com
              reserva de assento obrigatória. Para quem vai direto a Kyoto, o JR
              Haruka é o equivalente: com o desconto para turistas estrangeiros, custa
              ¥1.800 até Kyoto Station e leva cerca de 80 minutos — bem mais prático
              do que somar trem + baldeações a partir de Osaka.
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Dentre as 3 opções, é a que melhor equilibra custo, tempo e conforto —
              recomendado na maioria dos casos.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="Ônibus" />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥1.300"
                detail="Limousine Bus — até Namba (OCAT)"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 50 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              O ônibus Limousine conecta o aeroporto a diversos pontos de Osaka e
              também a Kyoto Station, sem baldeações — você vai sentado e a bagagem
              vai no bagageiro. Boa alternativa para hotéis fora do eixo das
              estações de trem.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Táxi/Uber" />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥15.000 a ¥24.000"
                detail="Táxi (tarifa fixa) a Uber (tarifa dinâmica) — até Namba"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 50 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              É a opção mais cômoda, mas custa bem mais que trem ou ônibus —
              recomendado apenas em desembarques muito tardios ou para grupos que
              dividem o valor da corrida.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
