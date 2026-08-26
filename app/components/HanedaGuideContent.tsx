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
  ActionItem,
  IconWifi,
  ContentCard,
  IconWarning,
  IconLuggage,
  IconPin,
  IconFork,
  IconCheck,
  IconCard,
} from "./AirportGuideKit";

// Conteúdo completo do guia do Aeroporto de Haneda (HND) — extraído de
// app/database/aeroportos/haneda/page.tsx pra ser reutilizado tanto na
// página interna (banco de conteúdo, uso da equipe) quanto embutido
// diretamente no painel do cliente (app/rf3vk8mp), já que a página /database
// não é acessível a clientes. Editar aqui atualiza os dois lugares. Mesmo
// padrão de conversão usado em NaritaGuideContent.tsx (tema escuro da
// página interna → tema claro do painel do cliente).
export function HanedaGuideContent({
  displayClassName,
  internal = true,
}: {
  displayClassName: string;
  // false quando embutido no painel do cliente (app/rf3vk8mp) — oculta o
  // link "Banco de conteúdo" e o selo "Uso interno", que só fazem sentido
  // na página interna /database.
  internal?: boolean;
}) {
  return (
    <div className="bg-[#FDFCF9] text-[#24211D]">
      <InternalGuideHeader
        displayClassName={displayClassName}
        eyebrow="Anexo com Informação Detalhada - Aeroportos - Haneda (HND)"
        title="Haneda Airport - 東京国際空港"
        code="HND"
        heroImage="/images/haneda-hero.jpg"
        heroAlt="Aeronaves da ANA e JAL estacionadas no pátio do Aeroporto de Haneda, com o Monte Fuji ao fundo"
        subtitle="Tokyo International Airport, mais conhecido como Haneda — a cerca de 30 minutos do centro de Tóquio. Opção mais próxima e conveniente para voos internacionais com destino à cidade."
        internal={internal}
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
            Icon: IconLuggage,
            number: 5,
            label: "Antes de Sair do Hotel",
            href: "#secao-5",
            groupLabel: "Embarque",
          },
          {
            Icon: IconTrain,
            number: 6,
            label: "Qual Meio de Transporte Escolher?",
            href: "#secao-6",
            groupLabel: "Embarque",
          },
          {
            Icon: IconPin,
            number: 7,
            label: "Cheguei no Aeroporto, e Agora?",
            href: "#secao-7",
            groupLabel: "Embarque",
          },
          {
            Icon: IconFork,
            number: 8,
            label: "Estou com Fome",
            href: "#secao-8",
            groupLabel: "Embarque",
          },
          {
            Icon: IconCheck,
            number: 9,
            label: "Checagem de Segurança",
            href: "#secao-9",
            groupLabel: "Embarque",
          },
          {
            Icon: IconCard,
            number: 10,
            label: "Pós-Checagem de Segurança",
            href: "#secao-10",
            groupLabel: "Embarque",
          },
          {
            Icon: IconClock,
            number: 11,
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
          <h2 className={`${displayClassName} text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Como Funciona o Aeroporto de Haneda? Qual a Diferença para Narita?
          </h2>
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
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

          <div className="rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Alpinea
            </p>
            <h3 className={`${displayClassName} text-xl font-medium text-[#24211D] md:text-2xl`}>
              Preciso Trocar de Terminal em Haneda?
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              <p>
                Diferente de Narita, os terminais de Haneda são bem conectados entre si.
                O Terminal 1 e o Terminal 2 têm uma{" "}
                <span className="text-[#24211D]">passagem subterrânea direta</span>, de
                cerca de 400 metros — leva em torno de 5 minutos a pé.
              </p>
              <p>
                Para chegar ao Terminal 3 (Internacional) a partir do T1 ou T2 (ou
                vice-versa), use o{" "}
                <span className="text-[#24211D]">ônibus lançadeira gratuito</span>, que
                circula do lado de fora da área de segurança a cada 4 minutos durante o
                dia (8 minutos à noite), ou o Keikyu Line / Tokyo Monorail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chegada e imigração */}
      <section id="secao-2" className="border-t border-[#DDD8CF] bg-[#F8FAF9] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Chegada e Imigração" />
          </div>

          <ImmigrationArrivalGuide displayClassName={displayClassName} />
        </div>
      </section>

      {/* Recomendações antes de sair do aeroporto */}
      <section id="secao-3" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={3} label="Recomendações Antes de Sair do Aeroporto" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Passei pela Imigração e Estou com Minhas Malas, e Agora?
          </h2>

          <div className="space-y-5">
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Por ficar bem mais perto do centro de Tóquio, Haneda exige menos
              preparação do que Narita — ainda assim, vale resolver alguns pontos
              antes de sair do Terminal 3.
            </p>

            <div className="space-y-4 pt-2">
              <p id="secao-3-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">
                3.1 — Aluguel de Pocket Wi-Fi ou eSIM 5G
              </p>
              <p className="text-base font-light leading-8 text-[#24211D]/88">
                Caso ainda não tenha comprado um eSIM 5G, o balcão Global WiFi ×
                NINJA WiFi fica no 2º andar do hall de chegada, perto do acesso ao
                Keikyu Line, aberto das 06:30 às 23:00. Para chegadas fora desse
                horário, a WiFiBOX oferece retirada e devolução por autoatendimento
                24h.
              </p>

              <div className="rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
                <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
                  <IconBulb className="h-3.5 w-3.5" />
                  Recomendação Alpinea
                </p>
                <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
                  O método mais conveniente é contratar o eSIM digitalmente em
                  aplicativos como Airalo — nós normalmente usamos a própria Airalo
                  para contratação. A vantagem de usar o pocket wi-fi é que você pode
                  conectar vários aparelhos diferentes nele; a desvantagem é que
                  precisa carregá-lo para qualquer lugar que for.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-[#DDD8CF] pt-6">
              <p id="secao-3-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">
                3.2 — Comprar IC Card (JR Suica ou Pasmo)
              </p>
              <p className="text-base font-light leading-8 text-[#24211D]/88">
                A máquina do Welcome Suica fica no canto das máquinas de venda de
                bilhetes do Tokyo Monorail, à esquerda da saída do hall de chegada
                (2º andar). O JR East Travel Service Center, na mesma área, também
                vende o cartão no guichê. A taxa básica é de ¥1.000 (sem depósito),
                mais o valor que você quiser carregar — válido por 28 dias.
              </p>
              <p className="text-base font-light leading-8 text-[#24211D]/88">
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
                  <p className="mt-3 text-center text-sm font-medium text-[#24211D]">Catraca do metrô</p>
                  <p className="text-center text-xs text-[#24211D]/70">Aproxime o cartão na área indicada</p>
                </div>
                <div>
                  <ImageCard
                    src="/images/ic-card-2.png"
                    alt="Sensor circular de IC card sendo usado com um cartão Pasmo"
                    fit="cover"
                    aspect="aspect-[3/5]"
                    zoomHref="#foto-ic-sensor"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-[#24211D]">Sensor de aproximação</p>
                  <p className="text-center text-xs text-[#24211D]/70">Encoste o cartão até o bipe</p>
                </div>
                <div>
                  <ImageCard
                    src="/images/ic-card-vending-machine.png"
                    alt="Máquina de bebidas com leitor de IC card por aproximação"
                    fit="cover"
                    aspect="aspect-[3/5]"
                    zoomHref="#foto-ic-vending"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-[#24211D]">Máquinas de bebida</p>
                  <p className="text-center text-xs text-[#24211D]/70">Também aceitam o IC Card</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-[#DDD8CF] pt-6">
              <p id="secao-3-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">
                3.3 — Câmbio
              </p>
              <p className="text-base font-light leading-8 text-[#24211D]/88">
                O balcão Japan Airport Building Currency Exchange fica no 2º andar
                do hall de chegada do Terminal 3; o Mizuho Bank também tem guichê de
                câmbio na mesma área, à esquerda ao sair da alfândega.
              </p>
              <p className="text-base font-light leading-8 text-[#24211D]/88">
                Assim como em Narita, vale trocar apenas o necessário para o
                primeiro dia — uma refeição no aeroporto custa, em média,
                ¥1.000–2.000 por pessoa, e um táxi ou Uber até Shinjuku custa entre
                ¥8.300 e ¥9.700.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#DDD8CF] pt-6">
              <p id="secao-3-4" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">
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
              <p className="text-sm leading-6 text-[#24211D]/70">
                Mais opções no Haneda Airport Garden, acessível por passarela direta a
                partir do hall de chegada do T3.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#DDD8CF] pt-6">
              <p id="secao-3-5" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">
                3.5 — Farmácia
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
                  <p className="text-sm font-medium text-[#24211D]">Ain Drugstore</p>
                  <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
                    T3, área landside (antes da segurança).
                  </p>
                </div>
                <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
                  <p className="text-sm font-medium text-[#24211D]">Airport Drug</p>
                  <p className="mt-2 text-sm leading-6 text-[#24211D]/80">T3.</p>
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
      <section id="deslocamento" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Deslocamento até Tóquio" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Já Terminei os Preparativos, Como Chego ao Hotel e Qual Meio de Transporte
            Devo Escolher?
          </h2>

          <p className="mb-10 text-base font-light leading-8 text-[#24211D]/88">
            Existem basicamente 3 formas de chegar até Tóquio a partir de Haneda — e,
            diferente de Narita, todas elas são bem mais rápidas.
          </p>

          <div id="deslocamento-trem" className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <SubStepHeading number={1} title="Trem" />
              <span className="rounded-full bg-[#173B45]/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#173B45]">
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
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              O Keikyu Line leva cerca de 13 minutos até Shinagawa (¥327), de onde é
              possível seguir para praticamente qualquer parte de Tóquio com uma única
              baldeação. O Tokyo Monorail é uma alternativa quase tão rápida, levando
              até Hamamatsucho em 13 minutos (¥519) — também com boa conexão à linha
              Yamanote.
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Dentre as 3 opções, é a mais rápida e barata — muito diferente do cenário
              em Narita, onde o trem costuma ser a pior escolha.
            </p>
          </div>

          <div id="deslocamento-onibus" className="mt-10 space-y-5 border-t border-[#DDD8CF] pt-8">
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
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              O ônibus Limousine sai direto até a porta de diversos hotéis na região de
              Shinjuku, sem baldeações — bom substituto ao trem para quem está com
              muita bagagem ou prefere não trocar de linha no caminho.
            </p>
          </div>

          <div id="deslocamento-taxi" className="mt-10 space-y-5 border-t border-[#DDD8CF] pt-8">
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
            <p className="text-base font-light leading-8 text-[#24211D]/88">
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
        displayClassName={displayClassName}
      />

      {/* Antes de sair do hotel */}
      <section id="secao-5" className="border-t border-[#DDD8CF] bg-[#F8FAF9] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={1} label="Antes de Sair do Hotel" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            O Que Verificar Antes de Sair do Hotel?
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-[#24211D]/88">
            Se programe para sair do hotel pelo menos <span className="text-[#24211D]">3 horas antes</span> do
            horário de embarque.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionItem
              Icon={IconMap}
              title="Confirmar o aeroporto"
              text="Em Tóquio existem dois grandes aeroportos internacionais: Haneda e Narita — confirme qual consta na sua passagem antes de sair."
            />
            <ActionItem
              Icon={IconPlaneTakeoff}
              title="Terminal único"
              text="Diferente de Narita, em Haneda todos os voos internacionais usam o Terminal 3 — não há risco de confundir terminal."
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

          <div className="mt-8 rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Alpinea
            </p>
            <h3 className={`${displayClassName} text-xl font-medium text-[#24211D] md:text-2xl`}>
              Confira o Peso das Malas Antes de Sair
            </h3>
            <p className="mt-5 text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Verifique se o peso das malas está de acordo com os limites da companhia
              aérea antes de sair do hotel. Embora seja difícil ter uma balança à mão,
              procure distribuir o peso uniformemente entre as malas.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Como referência (Emirates, rotas entre Japão e as Américas — sistema por
              peça): a tarifa <span className="text-[#24211D]">Economy Saver</span> permite
              <span className="text-[#24211D]"> 2 malas de até 23 kg cada</span>, com no
              máximo <span className="text-[#24211D]">150 cm somando as três dimensões</span> por
              mala (altura + largura + comprimento). Esses limites variam por tarifa e
              companhia aérea — confirme sempre a política específica antes da viagem.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
            <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Alpinea
            </p>
            <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Se você pretende comprar no duty free, vale a pena pré-reservar online
              pelo site da TIAT Duty Free antes de sair para o aeroporto. Assim, o
              produto já fica separado para retirada no balcão pós-segurança do
              Terminal 3, sem depender de encontrá-lo em estoque no dia do voo.
            </p>
          </div>
        </div>
      </section>

      {/* Qual meio de transporte escolher (embarque) */}
      <section id="secao-6" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Qual Meio de Transporte Escolher?" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Qual Meio de Transporte Escolher Até o Aeroporto?
          </h2>

          <p className="mb-6 text-base font-light leading-8 text-[#24211D]/88">
            São as mesmas 3 opções da seção &quot;Deslocamento até Tóquio&quot;, na Chegada —
            trem (Keikyu Line ou Tokyo Monorail), ônibus (Limousine Bus) e táxi/Uber —
            com custos e tempos praticamente iguais no caminho de volta.
          </p>

          <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6 sm:p-8">
            <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Diferente de Narita — onde a recomendação muda entre chegada e partida,
              porque o trem exige lidar com escadas e catracas já com a bagagem mais
              pesada — em Haneda o trajeto até o aeroporto é curto o suficiente (Keikyu
              Line ou Tokyo Monorail, ambos com poucos minutos até estações centrais de
              Tóquio) para que o <span className="text-[#24211D]">trem continue sendo uma boa opção
              também na volta</span>. Ainda assim, quem estiver com muita bagagem ou preferir
              não trocar de linha no caminho pode optar pelo Limousine Bus, com o mesmo
              conforto de ida direta descrito na seção de Chegada.
            </p>
          </div>
        </div>
      </section>

      {/* Cheguei no aeroporto, e agora? */}
      <section id="secao-7" className="border-t border-[#DDD8CF] bg-[#F8FAF9] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={3} label="Cheguei no Aeroporto, e Agora?" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Cheguei no Aeroporto, e Agora?
          </h2>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#173B45]/40 text-xs font-medium text-[#173B45]">
                  1
                </span>
                <p className="text-sm leading-6 text-[#24211D]/88 md:text-base">
                  <span className="font-medium text-[#24211D]">Devolver o Pocket Wi-Fi</span> no
                  guichê da locadora — em Haneda, fica no <span className="text-[#24211D]">3F, próximo
                  aos guichês das companhias aéreas</span>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#173B45]/40 text-xs font-medium text-[#173B45]">
                2
              </span>
              <p className="text-sm leading-6 text-[#24211D]/88 md:text-base">
                <span className="font-medium text-[#24211D]">Localizar o guichê de check-in</span> da
                companhia aérea, no Terminal 3 — o check-in/despacho de mala normalmente
                abre cerca de <span className="text-[#24211D]">3 horas antes</span> da partida do
                voo.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#173B45]/40 text-xs font-medium text-[#173B45]">
                3
              </span>
              <p className="text-sm leading-6 text-[#24211D]/88 md:text-base">
                Se dirigir ao guichê e realizar o <span className="text-[#24211D]">check-in</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estou com fome */}
      <section id="secao-8" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Estou com Fome" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Devo Realizar a Refeição Fora ou Dentro da Área de Segurança?
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-[#24211D]/88">
            O Terminal 3 tem duas áreas de alimentação bem distintas: a réplica de rua
            do período Edo (Edo Koji, 4F — ver seção &quot;Restaurantes&quot;, no início deste
            guia), <span className="text-[#24211D]">antes da checagem de segurança</span>, e um
            praça de alimentação menor no 3F, dentro da área &quot;Tokyo Sky Kitchen&quot;,{" "}
            <span className="text-[#24211D]">já após a checagem de segurança</span> — esta
            última é a que importa se você já fez o check-in e passou pela segurança.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <RestaurantMini
              name="Uogashi Nihon-ichi (魚がし日本一)"
              detail="Sushi giratório estilo Edomae, feito na hora, a partir de ¥130 a peça — aberto 24 horas"
              location="T3 · 3F, área Tokyo Sky Kitchen, pós-segurança"
            />
            <RestaurantMini
              name="Rokurinsha (六厘舎)"
              detail="Tsukemen (macarrão para mergulhar em caldo) de uma das casas mais conhecidas de Tóquio — aberto das 04:00 à 01:30"
              location="T3 · 3F, área Tokyo Sky Kitchen, pós-segurança"
            />
            <RestaurantMini
              name="Jinroku (甚六)"
              detail="Comida japonesa variada — yakisoba ≈ ¥950"
              location="T3 · 3F, área Tokyo Sky Kitchen, pós-segurança"
            />
            <RestaurantMini
              name="Yuginbou (夢吟坊)"
              detail="Udon"
              location="T3 · 3F, área Tokyo Sky Kitchen, pós-segurança"
            />
          </div>

          <div className="mt-8 rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
            <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Alpinea
            </p>
            <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Vale para embarques de madrugada: o Uogashi Nihon-ichi funciona 24 horas e
              o Rokurinsha fecha só entre 01:30 e 04:00 — ou seja, para praticamente
              qualquer horário de voo saindo de Haneda, sempre há uma opção de refeição
              quente disponível já dentro da área de embarque.
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-[#24211D]/74">
            Horários de funcionamento podem mudar sem aviso — recomendamos confirmar
            antes se a refeição fizer parte de um planejamento apertado.
          </p>
        </div>
      </section>

      {/* Checagem de segurança */}
      <section id="secao-9" className="border-t border-[#DDD8CF] bg-[#F8FAF9] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={5} label="Checagem de Segurança e Entrada na Área de Segurança" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Checagem de Segurança e Entrada na Área de Segurança
          </h2>

          <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
            <p className="text-sm font-medium text-[#24211D] md:text-base">Smart Lanes</p>
            <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
              Em alguns corredores (Smart Lanes) é utilizado um scanner de tomografia
              que não exige que nada seja removido de dentro da mala — o escaneamento
              ocorre de maneira quase instantânea. Nem sempre o serviço está
              disponível, mas quando está, a passagem pela segurança leva menos de 5
              minutos.
            </p>
          </div>

          <div className="mt-8 space-y-1.5 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6 text-sm leading-6 text-[#24211D]/80">
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

          <div className="mt-10 space-y-5 border-t border-[#DDD8CF] pt-8">
            <SubStepHeading number={1} title="Verificação de Passaporte" />
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Em alguns casos, nessa etapa o oficial retira do passaporte os
              comprovantes e notas fiscais de compras feitas no Japão. Pode ser pedido
              para conferir se você está portando algum dos itens citados nas notas,
              assegurando que ele está de fato deixando o país — condição para a
              isenção do imposto de consumo de <span className="text-[#24211D]">10%</span> (8%
              para alimentos/bebidas não alcoólicas), que o não-residente não paga.
            </p>

            <div className="rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
              <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
                <IconClock className="h-3.5 w-3.5" />
                Atualização Importante
              </p>
              <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
                A partir de <span className="text-[#24211D]">1º de novembro de 2026</span>, o Japão
                substitui esse sistema em todo o país (Haneda incluso): você passa a
                pagar o preço cheio (com imposto) na loja e só recebe o reembolso do
                imposto de consumo em terminais/guichês dedicados no aeroporto, antes
                de embarcar, via escaneamento do passaporte. Se sua viagem for depois
                dessa data, reserve um tempo extra (recomenda-se 45–60 minutos a mais)
                para esse processo de reembolso, já que o sistema ainda estará em
                transição.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pós-checagem de segurança */}
      <section id="secao-10" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={6} label="Pós-Checagem de Segurança" />
          </div>

          <h2 className={`${displayClassName} mb-8 text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Pós-Checagem de Segurança
          </h2>

          <p className="mb-8 text-base font-light leading-8 text-[#24211D]/88">
            Aqui você tem algumas opções sobre o que fazer antes do embarque — entre
            as mais comuns, restaurantes, compras em duty free ou o lounge/sala VIP
            de sua preferência.
          </p>

          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">Restaurantes</p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Ver a lista completa na seção &quot;Estou com Fome&quot;, logo acima — o food court
              do Tokyo Sky Kitchen (3F) já está dentro da área pós-segurança.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">Duty Free</p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Você pode <span className="text-[#24211D]">comprar diretamente</span> nas lojas de duty
              free já dentro da área de embarque (pós-segurança) e sair com o produto
              na hora. Se já tiver pré-reservado antes de sair do hotel (ver
              recomendação na seção &quot;Antes de Sair do Hotel&quot;), a retirada é feita no{" "}
              <span className="text-[#24211D]">balcão DUTY FREE PICK UP</span>, no{" "}
              <span className="text-[#24211D]">Terminal 3, 3F, já na área pós-segurança</span> — o
              balcão abre conforme o horário reservado na compra online. Confirme o
              prazo limite de retirada no momento da reserva.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/88">Lounges</p>

            <p className="text-base font-light leading-8 text-[#24211D]/88">
              As 4 salas do Terminal 3 ficam na área internacional de embarque
              (pós-segurança), entre o 3F e o 4F:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
                <p className="text-sm font-medium text-[#24211D] md:text-base">Sky Lounge South — 3F</p>
                <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
                  Aberta 24 horas. Buffet, bebidas alcoólicas e chuveiro — permanência
                  máxima de 3 horas.{" "}
                  <span className="text-[#24211D]">Aceita Priority Pass a qualquer horário.</span>
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
                <p className="text-sm font-medium text-[#24211D] md:text-base">TIAT Lounge — 4F</p>
                <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
                  Aberta 24 horas, com vista para a pista. Buffet, bebidas alcoólicas e
                  chuveiro — permanência máxima de 3 horas.{" "}
                  <span className="text-[#24211D]">Priority Pass só é aceito das 01:00 às 05:00.</span>
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
                <p className="text-sm font-medium text-[#24211D] md:text-base">Sky Lounge — 4F</p>
                <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
                  Aberta 24 horas. Bebidas não alcoólicas incluídas; lanches e álcool
                  são pagos à parte. Acesso mediante cartão elegível.
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
                <p className="text-sm font-medium text-[#24211D] md:text-base">The Centurion Lounge (Amex) — 4F</p>
                <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
                  Funciona <span className="text-[#24211D]">apenas das 08:00 às 22:00</span> — fechada
                  para quem embarca de madrugada. Buffet, bebidas alcoólicas e
                  chuveiro, para portadores do Amex Centurion.
                </p>
              </div>
            </div>

            <ContentCard variant="warning" icon={IconWarning} eyebrow="Atenção a Voos de Madrugada" size="sm">
              <p>
                Quem embarca de madrugada precisa saber: das 4 salas, só a{" "}
                <span className="font-semibold">Sky Lounge South</span> aceita Priority Pass a
                qualquer horário. A TIAT Lounge aceita Priority Pass apenas das 01:00
                às 05:00, e a Centurion Lounge fecha às 22:00 — não é opção para quem
                embarca depois desse horário.
              </p>
            </ContentCard>
          </div>

          <div className="mt-8 rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Alpinea
            </p>
            <p className="text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
              Para embarques de madrugada com acesso via Priority Pass, priorize a Sky
              Lounge South (3F) — é a única aberta ao programa 24 horas, com buffet
              completo, bebidas alcoólicas e chuveiro.
            </p>
          </div>
        </div>
      </section>

      {/* Antes do embarque */}
      <section id="secao-11" className="border-t border-[#DDD8CF] bg-[#F8FAF9] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={7} label="Antes do Embarque" />
          </div>

          <h2 className={`${displayClassName} mb-6 text-2xl font-medium text-[#24211D] md:text-3xl`}>
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
    </div>
  );
}
