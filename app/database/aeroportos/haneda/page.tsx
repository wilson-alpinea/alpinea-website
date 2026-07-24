import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import {
  InternalGuideHeader,
  FlowTag,
  SectionMarker,
  TableOfContents,
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
  IconMap,
  IconTrain,
  IconPlaneLanding,
  IconPlaneTakeoff,
  IconDocument,
  FlowDivider,
} from "../../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Aeroporto de Haneda (HND)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function HanedaGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Anexo com Informação Detalhada - Aeroportos - Haneda (HND)"
        title="Haneda Airport - 東京国際空港"
        code="HND"
        heroImage="/images/haneda-hero.jpg"
        heroAlt="Aeronaves da ANA e JAL estacionadas no pátio do Aeroporto de Haneda, com o Monte Fuji ao fundo"
        subtitle="Tokyo International Airport, mais conhecido como Haneda — a cerca de 30 minutos do centro de Tóquio. Opção mais próxima e conveniente para voos internacionais com destino à cidade."
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
            Icon: IconDocument,
            number: 1,
            label: "Notas Iniciais (a expandir)",
            href: "#secao-5",
            groupLabel: "Embarque",
          },
        ]}
      />

      {/* Visão geral */}
      <section id="secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <SectionMarker number={1} label="Visão Geral" />
          <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
            Como Funciona o Aeroporto de Haneda? Qual a Diferença para Narita?
          </h2>
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Diferente de Narita, Haneda fica bem mais perto do centro de Tóquio — cerca
            de 30 minutos de trajeto. Todos os voos internacionais chegam e saem pelo
            Terminal 3; os Terminais 1 e 2 atendem apenas voos domésticos.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <TerminalCard
              nome="Terminal 3"
              tipo="Único terminal internacional do aeroporto — recebe todas as chegadas e saídas de voos internacionais."
              aliancas={[
                {
                  logo: "/images/star-alliance.png",
                  logoAlt: "Logo da Star Alliance",
                  texto: "ANA, United Airlines, Lufthansa, Singapore Airlines, Swiss, Thai Airways, entre outras.",
                },
                {
                  logo: "/images/one-world.webp",
                  logoAlt: "Logo da Oneworld",
                  texto: "JAL, British Airways, Cathay Pacific, American Airlines, Qantas, Finnair, entre outras.",
                },
                {
                  logo: "/images/SkyTeam-Logo.png",
                  logoAlt: "Logo da SkyTeam",
                  texto: "Delta Air Lines, Korean Air, China Airlines, Vietnam Airlines, entre outras.",
                },
              ]}
            />
            <TerminalCard
              nome="Terminal 1"
              tipo="Doméstico — atende a ANA e companhias afiliadas."
              companhias="ANA, AIRDO, Solaseed Air, Starflyer, entre outras."
            />
            <TerminalCard
              nome="Terminal 2"
              tipo="Doméstico — atende a JAL e companhias afiliadas."
              companhias="JAL, Japan Air Commuter, Japan Transocean Air, entre outras."
            />
          </div>

          <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
              Preciso Trocar de Terminal em Haneda?
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              <p>
                Diferente de Narita, os terminais de Haneda são bem conectados entre si.
                O Terminal 1 e o Terminal 2 têm uma{" "}
                <span className="text-white">passagem subterrânea direta</span>, de
                cerca de 400 metros — leva em torno de 5 minutos a pé.
              </p>
              <p>
                Para chegar ao Terminal 3 (Internacional) a partir do T1 ou T2 (ou
                vice-versa), use o{" "}
                <span className="text-white">ônibus lançadeira gratuito</span>, que
                circula do lado de fora da área de segurança a cada 4 minutos durante o
                dia (8 minutos à noite), ou o Keikyu Line / Tokyo Monorail.
              </p>
            </div>
          </div>
        </div>
      </section>

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
              Por ficar bem mais perto do centro de Tóquio, Haneda exige menos
              preparação do que Narita — ainda assim, vale resolver alguns pontos
              antes de sair do Terminal 3.
            </p>

            <div className="space-y-4 pt-2">
              <p id="secao-3-1" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.1 — Aluguel de Pocket Wi-Fi ou eSIM 5G
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Caso ainda não tenha comprado um eSIM 5G, o balcão Global WiFi ×
                NINJA WiFi fica no 2º andar do hall de chegada, perto do acesso ao
                Keikyu Line, aberto das 06:30 às 23:00. Para chegadas fora desse
                horário, a WiFiBOX oferece retirada e devolução por autoatendimento
                24h.
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
              <p id="secao-3-2" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.2 — Comprar IC Card (JR Suica ou Pasmo)
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                A máquina do Welcome Suica fica no canto das máquinas de venda de
                bilhetes do Tokyo Monorail, à esquerda da saída do hall de chegada
                (2º andar). O JR East Travel Service Center, na mesma área, também
                vende o cartão no guichê. A taxa básica é de ¥1.000 (sem depósito),
                mais o valor que você quiser carregar — válido por 28 dias.
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
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-3" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.3 — Câmbio
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O balcão Japan Airport Building Currency Exchange fica no 2º andar
                do hall de chegada do Terminal 3; o Mizuho Bank também tem guichê de
                câmbio na mesma área, à esquerda ao sair da alfândega.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Assim como em Narita, vale trocar apenas o necessário para o
                primeiro dia — uma refeição no aeroporto custa, em média,
                ¥1.000–2.000 por pessoa, e um táxi ou Uber até Shinjuku custa entre
                ¥8.300 e ¥9.700.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-4" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.4 — Restaurantes
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <RestaurantMini
                  name="Edo Koji"
                  detail="Réplica de uma rua do período Edo, com ramen, sushi, udon e oden — ≈ ¥1.000–2.500 por pessoa"
                  location="T3 · 4º andar, antes da segurança"
                />
                <RestaurantMini
                  name="Tsurutontantan"
                  detail="Udon — ≈ ¥1.000–1.500 por pessoa"
                  location="T3 · 4º andar, Edo Koji"
                />
                <RestaurantMini
                  name="Ariso Sushi"
                  detail="Sushi estilo Edomae — ≈ ¥2.000–3.500 por pessoa"
                  location="T3 · 4º andar, Edo Koji"
                />
                <RestaurantMini
                  name="Dining 24 · Wa-Cafeteria"
                  detail="Culinária japonesa variada, boa opção com crianças — ≈ ¥1.200–2.000 por pessoa"
                  location="T3 · 4º andar"
                />
              </div>
              <p className="text-sm leading-6 text-white/45">
                Mais opções no Haneda Airport Garden, acessível por passarela direta a
                partir do hall de chegada do T3.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p id="secao-3-5" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                3.5 — Farmácia
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Ain Drugstore</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    T3, área landside (antes da segurança).
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Airport Drug</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">T3.</p>
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
            Existem basicamente 3 formas de chegar até Tóquio a partir de Haneda — e,
            diferente de Narita, todas elas são bem mais rápidas.
          </p>

          <div id="deslocamento-trem" className="space-y-5">
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
                value="¥535"
                detail="Keikyu Line, com baldeação em Shinagawa — até Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 30 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              O Keikyu Line leva cerca de 13 minutos até Shinagawa (¥327), de onde é
              possível seguir para praticamente qualquer parte de Tóquio com uma única
              baldeação. O Tokyo Monorail é uma alternativa quase tão rápida, levando
              até Hamamatsucho em 13 minutos (¥519) — também com boa conexão à linha
              Yamanote.
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Dentre as 3 opções, é a mais rápida e barata — muito diferente do cenário
              em Narita, onde o trem costuma ser a pior escolha.
            </p>
          </div>

          <div id="deslocamento-onibus" className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="Ônibus" />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥1.400"
                detail="Limousine Bus — direto até Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 45 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              O ônibus Limousine sai direto até a porta de diversos hotéis na região de
              Shinjuku, sem baldeações — bom substituto ao trem para quem está com
              muita bagagem ou prefere não trocar de linha no caminho.
            </p>
          </div>

          <div id="deslocamento-taxi" className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Táxi/Uber" />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                Icon={IconExchange}
                label="Custo"
                value="¥8.300 a ¥9.700"
                detail="Táxi (tarifa fixa) a Uber (tarifa dinâmica) — até Shinjuku"
              />
              <StatCard Icon={IconClock} label="Tempo de deslocamento" value="≈ 30 minutos" variant="highlight" />
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              Por Haneda ficar bem mais perto do centro, o táxi/Uber custa bem menos
              do que em Narita — uma alternativa razoável mesmo fora de horários muito
              tardios, especialmente para grupos que dividem o valor da corrida.
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

      {/* Embarque — notas iniciais (fluxo completo ainda a estruturar, nos moldes do guia de Narita) */}
      <section id="secao-5" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={1} label="Notas Iniciais (a expandir)" />
          </div>

          <h2 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
            Embarque em Haneda
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-white/70">
            O fluxo completo de Embarque de Haneda ainda será estruturado nos mesmos
            moldes do guia de Narita. Por ora, seguem duas notas específicas deste
            aeroporto:
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-sm font-medium text-white md:text-base">Checagem de Segurança — Smart Lanes</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Em alguns corredores (Smart Lanes) é utilizado um scanner de tomografia
                que não exige que nada seja removido de dentro da mala — o escaneamento
                ocorre de maneira quase instantânea. Nem sempre o serviço está
                disponível, mas quando está, a passagem pela segurança leva menos de 5
                minutos.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-sm font-medium text-white md:text-base">Devolução do Pocket Wi-Fi</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                O guichê de devolução fica no 3F, próximo aos guichês das companhias
                aéreas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
