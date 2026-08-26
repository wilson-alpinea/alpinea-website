import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  ContentCard,
  ImageCard,
  PreviewModal,
  IconBulb,
  IconMap,
  IconClock,
  IconCheck,
  IconWarning,
  IconRoute,
  IconZoom,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Ônibus em Kyoto — sistema de pontos A/B/C/D.
// Mesmo padrão do NaritaGuideContent/ShinkansenGuideContent/DXBGuideContent:
// reutilizado tanto na página interna (banco de conteúdo, /database/onibus)
// quanto embutido no painel do cliente (app/rf3vk8mp). Editar aqui atualiza
// os dois lugares.
//
// TipBox/AlertBox/ChecklistCard são wrappers finos sobre o ContentCard
// (design system único de cards informativos, em AirportGuideKit) — mantidos
// aqui só para não precisar alterar todos os pontos de uso abaixo.

function TipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ContentCard variant="success" icon={IconBulb} eyebrow="Recomendação Ajisai" headline={title} size="sm">
      {children}
    </ContentCard>
  );
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <ContentCard variant="warning" icon={IconWarning} eyebrow="Atenção" size="sm">
      {children}
    </ContentCard>
  );
}

function ChecklistCard({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] px-4 py-3"
        >
          <span className="mt-0.5 text-[#173B45]">
            <IconCheck className="h-4 w-4" />
          </span>
          <p className="text-sm leading-6 text-[#24211D]/85">{item}</p>
        </div>
      ))}
    </div>
  );
}

function NumberedSteps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-3 rounded-xl border border-[#DDD8CF] bg-white px-4 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173B45]/[0.1] text-xs font-semibold text-[#173B45]">
            {i + 1}
          </span>
          <p className="text-sm leading-6 text-[#24211D]/85">{item}</p>
        </li>
      ))}
    </ol>
  );
}

// Diagrama esquemático (não é um mapa real) representando um cruzamento
// típico de Kyoto com quatro pontos de ônibus A/B/C/D em volta — só para
// ilustrar o conceito descrito no texto.
function CrossroadDiagram() {
  return (
    <div className="mx-auto grid max-w-xs grid-cols-3 grid-rows-3 gap-1.5 rounded-2xl border border-[#DDD8CF] bg-white p-6">
      <div />
      <div className="flex items-center justify-center rounded-lg border border-[#173B45]/25 bg-[#173B45]/[0.07] py-3 text-sm font-semibold text-[#173B45]">
        A
      </div>
      <div />
      <div className="flex items-center justify-center rounded-lg border border-[#173B45]/25 bg-[#173B45]/[0.07] py-3 text-sm font-semibold text-[#173B45]">
        D
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-[#24211D]/20 text-[10px] uppercase tracking-[0.1em] text-[#24211D]/40">
        Cruzamento
      </div>
      <div className="flex items-center justify-center rounded-lg border border-[#173B45]/25 bg-[#173B45]/[0.07] py-3 text-sm font-semibold text-[#173B45]">
        B
      </div>
      <div />
      <div className="flex items-center justify-center rounded-lg border border-[#173B45]/25 bg-[#173B45]/[0.07] py-3 text-sm font-semibold text-[#173B45]">
        C
      </div>
      <div />
    </div>
  );
}

export function OnibusGuideContent({
  displayClassName,
  internal = true,
}: {
  displayClassName: string;
  internal?: boolean;
}) {
  return (
    <div className="bg-[#FDFCF9] text-[#24211D]">
      <InternalGuideHeader
        displayClassName={displayClassName}
        eyebrow="Anexo com Informação Detalhada - Ônibus em Kyoto"
        title="Como Encontrar o Ônibus Certo em Kyoto"
        subtitle="Número da linha, direção e pontos A / B / C / D — em Kyoto, um mesmo nome de parada pode ter vários pontos físicos diferentes."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconMap, number: 1, label: "O Sistema A / B / C / D", href: "#onibus-secao-1" },
          { Icon: IconWarning, number: 2, label: "Mesmo Número, Direções Diferentes", href: "#onibus-secao-2" },
          { Icon: IconZoom, number: 3, label: "Como Ler o Google Maps", href: "#onibus-secao-3" },
          { Icon: IconRoute, number: 4, label: "Confirmando o Ponto no Local", href: "#onibus-secao-4" },
          { Icon: IconCheck, number: 5, label: "Validando o Ônibus ao Chegar", href: "#onibus-secao-5" },
          { Icon: IconMap, number: 6, label: "Kyoto Station — Caso à Parte", href: "#onibus-secao-6" },
          { Icon: IconWarning, number: 7, label: "Voltando: Outro Ponto, Não o Mesmo", href: "#onibus-secao-7" },
          { Icon: IconBulb, number: 8, label: "Técnicas de Confirmação", href: "#onibus-secao-8" },
          { Icon: IconClock, number: 9, label: "Se Pegou o Sentido Errado", href: "#onibus-secao-9" },
          { Icon: IconCheck, number: 10, label: "Método Alpinea e Regra de Ouro", href: "#onibus-secao-10" },
        ]}
      />

      <section id="onibus-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="O Sistema A / B / C / D" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Em Kyoto, encontrar o ônibus correto exige um pouco mais de atenção do que usar o
            metrô — o motivo é simples: um mesmo nome de parada pode ter vários pontos
            diferentes. Você poderá encontrar, por exemplo, Ginkakuji-michi A, B, C e D — todos
            com praticamente o mesmo nome, mas em lugares diferentes, atendendo ônibus em
            direções diferentes.
          </p>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <CrossroadDiagram />
            <div className="space-y-4 text-sm leading-7 text-[#24211D]/85">
              <p>
                Em grandes cruzamentos e regiões movimentadas, uma única "parada" pode ser
                dividida em vários pontos físicos — cada letra representa um local específico de
                embarque.
              </p>
              <p>
                <strong>A letra não é uma linha.</strong> "205" é o número da linha de ônibus;
                "A" é o ponto físico onde você espera. "205 A" não significa "linha 205A" —
                significa ônibus 205, embarcando no ponto A.
              </p>
            </div>
          </div>
          <TipBox title="Para pegar um ônibus em Kyoto, confirme sempre">
            <ChecklistCard
              items={["Número da linha", "Direção", "Letra do ponto", "Destino"]}
            />
          </TipBox>
        </div>
      </section>

      <section
        id="onibus-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Mesmo Número, Direções Diferentes" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Muitas paradas ficam em grandes cruzamentos, e os ônibus podem seguir norte, sul,
              leste ou oeste — por isso Kyoto separa os pontos de embarque por letra. Um ponto
              pode atender ônibus seguindo para Kyoto Station; outro, com o mesmo nome, pode
              atender ônibus no sentido oposto.
            </p>
          </div>
          <AlertBox>
            Nunca confirme um ônibus apenas pelo número. Você pode encontrar "206" em dois
            pontos diferentes da mesma parada — mas um vai para Kyoto Station e o outro para uma
            região totalmente diferente. A informação decisiva é sempre{" "}
            <strong>número + destino + letra</strong> (ex.: "206 + Kyoto Station + A"), não
            apenas o número.
          </AlertBox>
          <div className="mx-auto max-w-4xl">
            <ImageCard
              src="/images/guia-onibus-kyoto-pontos-abcd.png"
              alt="Infográfico mostrando o mesmo ônibus 206 embarcando em dois pontos diferentes (A e D) da parada Kiyomizu-michi, cada um seguindo em um sentido — exemplo real do sistema de pontos A/B/C/D de Kyoto"
              aspect="aspect-[3/2]"
              zoomHref="#foto-guia-onibus-abcd"
            />
            <p className="mt-3 text-center text-xs uppercase tracking-[0.15em] text-[#24211D]/50">
              Exemplo real: o ônibus 206 embarca no Ponto A (sentido Kinkakuji/Kitaoji) e também
              no Ponto D (sentido Shijo Kawaramachi) — mesma parada, pontos diferentes
            </p>
          </div>
        </div>
      </section>

      <section id="onibus-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="Como Ler o Google Maps" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Antes de sair caminhando em direção ao ponto, abra os detalhes da viagem e procure
            cinco informações:
          </p>
          <ChecklistCard
            items={[
              "① Nome do ponto — ex.: Kiyomizu-michi",
              "② Número do ônibus — ex.: 206",
              "③ Destino / direção — ex.: Kyoto Station ou Kitaoji Bus Terminal",
              "④ Posição exata do ponto no mapa — antes ou depois do cruzamento, outro lado da avenida, rua perpendicular",
              "⑤ Letra do ponto (A/B/C/D), quando indicada",
            ]}
          />
          <TipBox title="Regra prática">
            <p>
              Ao abrir uma rota, monte mentalmente a frase: "Vou pegar o ônibus 206, no ponto A,
              sentido Kyoto Station." Se você souber responder essas quatro informações,
              provavelmente está no lugar certo.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="onibus-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={4} label="Confirmando o Ponto no Local" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Em grandes cruzamentos os pontos podem estar próximos uns dos outros, e o Google
              Maps pode mostrar vários ícones quase sobrepostos — dê zoom, muito zoom. Uma
              diferença de 30 a 50 metros pode significar outro ponto: seu ponto pode estar
              depois do cruzamento, do outro lado da avenida, ou virando a esquina. Nome igual
              não significa ponto correto.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                1. A letra na placa
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Ao chegar ao ponto, procure a placa — nome da parada, linhas, direção/destinos e,
                em grandes paradas, A/B/C/D. Confira a letra antes de entrar na fila.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                2. O número na placa
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Se o ônibus que você procura não aparece na sinalização daquele ponto,
                provavelmente você está no ponto errado.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                3. O destino na placa
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                O destino mostrado não precisa ser onde você desce — indica só para onde o
                ônibus está seguindo. Uma atração querida pode ser parada intermediária.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="onibus-secao-5" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={5} label="Validando o Ônibus ao Chegar" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Quando o ônibus se aproximar, observe o painel frontal ou lateral e procure o número
            e o destino. Se os dois correspondem ao aplicativo, embarque.
          </p>
          <AlertBox>
            Não entre apenas porque o número está escrito grande — ele costuma ser bem mais
            fácil de enxergar que o destino, e é exatamente por isso que visitantes erram.
            Confira sempre número ✅ e depois destino ✅, só então embarque.
          </AlertBox>
        </div>
      </section>

      <section
        id="onibus-secao-6"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={6} label="Kyoto Station — Caso à Parte" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Na Kyoto Station o sistema fica ainda maior — você encontrará áreas como A1, A2, B1,
            B2, B3, C1, C2, D1, D2 etc. Aqui A/B/C/D indicam grupos de plataformas, e 1/2/3
            indicam o ponto específico dentro daquele grupo. Se a rota informar "A2", não basta
            chegar à área A — A1 e A2 podem atender linhas completamente diferentes.
          </p>
          <NumberedSteps
            items={[
              "Veja no aplicativo qual ônibus você precisa.",
              "Anote a plataforma (ex.: B2).",
              "Procure as placas grandes indicando A / B / C / D.",
              "Entre na área correspondente.",
              "Procure B1 / B2 / B3.",
              "Confirme novamente o número do ônibus.",
              "Entre na fila indicada.",
            ]}
          />
          <TipBox title="“Kyoto Station” sozinho não é suficiente">
            <p>
              A estação tem várias áreas de ônibus e terminais em lados diferentes — por exemplo,
              Kyoto Station / Karasuma Exit e Kyoto Station Hachijo Exit ficam em lados opostos.
              Confira sempre qual saída, qual terminal, qual letra e qual plataforma.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="onibus-secao-7" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={7} label="Voltando: Outro Ponto, Não o Mesmo" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Você desceu em Shijo Horikawa e quer voltar — é natural pensar "vou voltar para o
              mesmo ponto", mas normalmente não é assim. Para retornar no sentido contrário,
              provavelmente será preciso atravessar a rua ou o cruzamento e procurar outra
              letra.
            </p>
          </div>
          <TipBox title="Regra prática">
            <p>
              O ponto de volta geralmente não é o mesmo do desembarque. Abra uma nova rota no
              aplicativo e deixe-o indicar exatamente qual ponto usar — não tente deduzir
              sozinho.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="onibus-secao-8"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={8} label="Técnicas de Confirmação" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Print da rota
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Capture a tela da rota antes de sair caminhando, com "BUS 206 · STOP A · KYOTO
                STATION" visíveis — compare direto com a placa ao chegar. Muito útil em
                cruzamentos grandes.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Horário como confirmação
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Se o app mostra "14:23 — Bus 205", a tabela do ponto deve mostrar um horário
                compatível. Número ausente, destino diferente ou horário incompatível? Confira
                de novo antes de embarcar.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Cores não bastam
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Kyoto City Bus, Kyoto Bus, Keihan Bus, JR Bus e outros operadores circulam com
                pinturas e publicidade variadas. Use sempre número e destino, nunca a cor.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                O operador importa
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                O app pode mostrar "Kyoto City Bus 205" ou "Kyoto Bus 63" — procure também o
                operador, especialmente em terminais onde empresas diferentes usam áreas
                próximas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="onibus-secao-9" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={9} label="Se Pegou o Sentido Errado" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Depois de embarcar, acompanhe o número de paradas restantes ou o tempo estimado —
              ajuda a perceber rapidamente se entrou no sentido errado. Se o ponto azul no
              Google Maps estiver se afastando do destino, não se preocupe: desça em uma das
              próximas paradas, abra uma nova rota e deixe o aplicativo indicar o ponto correto
              para retornar.
            </p>
          </div>
          <AlertBox>
            Não tente "corrigir" apenas atravessando a rua — em Kyoto o ponto correto pode estar
            em outra lateral do cruzamento. Ao errar, abra novamente o aplicativo em vez de
            confiar na intuição. E quando houver A/B/C/D, dê sempre prioridade à letra indicada
            pelo app, mesmo que o nome pareça igual e o número apareça na placa de outro ponto.
          </AlertBox>
        </div>
      </section>

      <section
        id="onibus-secao-10"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-8">
          <SectionMarker number={10} label="Método Alpinea e Regra de Ouro" />
          <NumberedSteps
            items={[
              "Qual é o número? (ex.: 206)",
              "Para onde ele vai? (ex.: Kyoto Station)",
              "Qual é o nome da parada? (ex.: Kiyomizu-michi)",
              "Qual é a letra? (ex.: A)",
              "Estou no lado correto da rua? (confira no mapa)",
              "O painel do ônibus confirma número + destino? (ex.: 206 — Kyoto Station)",
              "Embarque.",
            ]}
          />
          <TipBox title="Regra de ouro">
            <p>
              Em Kyoto, não procure apenas "o ônibus 205" — procure "ônibus 205, no ponto C,
              sentido Kyoto Station." Quanto mais completo esse pensamento, menor a chance de
              erro. <strong>Número + Letra + Direção + Destino</strong> resolvem praticamente
              toda a confusão com ônibus em Kyoto.
            </p>
          </TipBox>
        </div>
      </section>

      <PreviewModal
        id="foto-guia-onibus-abcd"
        eyebrow="Guia Visual"
        label="Guia para identificar o ônibus certo em Kyoto"
        src="/images/guia-onibus-kyoto-pontos-abcd.png"
        alt="Infográfico mostrando o mesmo ônibus 206 embarcando em dois pontos diferentes (A e D) da parada Kiyomizu-michi, cada um seguindo em um sentido — exemplo real do sistema de pontos A/B/C/D de Kyoto"
      />
    </div>
  );
}
