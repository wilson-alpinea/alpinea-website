import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  ContentCard,
  IconBulb,
  IconPlane,
  IconRoute,
  IconMap,
  IconClock,
  IconCheck,
  IconWarning,
  IconDocument,
} from "./AirportGuideKit";

// Conteúdo completo do guia de conexão em Dubai (DXB) — GRU → DXB → NRT via
// Emirates. Mesmo padrão do NaritaGuideContent/ShinkansenGuideContent:
// reutilizado tanto na página interna (banco de conteúdo, /database/dxb)
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

function DontList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3"
        >
          <span className="mt-0.5 text-red-500">✗</span>
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

export function DXBGuideContent({
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
        eyebrow="Anexo com Informação Detalhada - Conexão em Dubai (DXB)"
        title="Conexão em Dubai — DXB"
        code="DXB"
        subtitle="São Paulo (GRU) → Dubai (DXB) → Tokyo Narita (NRT), via Emirates. Uma conexão internacional simples — sem sair do aeroporto e sem retirar a bagagem."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconDocument, number: 1, label: "Antes de Sair de São Paulo", href: "#dxb-secao-1" },
          { Icon: IconPlane, number: 2, label: "Chegada em Dubai", href: "#dxb-secao-2" },
          { Icon: IconWarning, number: 3, label: "Sem Imigração, Sem Retirar a Mala", href: "#dxb-secao-3" },
          { Icon: IconRoute, number: 4, label: "Segurança na Conexão", href: "#dxb-secao-4" },
          { Icon: IconMap, number: 5, label: "Descubra Seu Portão", href: "#dxb-secao-5" },
          { Icon: IconRoute, number: 6, label: "Terminal 3 — A, B e C Gates", href: "#dxb-secao-6" },
          { Icon: IconClock, number: 7, label: "Distância e Portão Não Anunciado", href: "#dxb-secao-7" },
          { Icon: IconClock, number: 8, label: "Horário Local e \"Departure\"", href: "#dxb-secao-8" },
          { Icon: IconBulb, number: 9, label: "Conexão Curta ou Longa", href: "#dxb-secao-9" },
          { Icon: IconWarning, number: 10, label: "O Que Você Não Precisa Fazer", href: "#dxb-secao-10" },
          { Icon: IconCheck, number: 11, label: "Passo a Passo e Regra de Ouro", href: "#dxb-secao-11" },
        ]}
      />

      <section id="dxb-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="Antes de Sair de São Paulo" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Sua passagem por Dubai é apenas uma conexão internacional — você não precisará sair
            do aeroporto ou entrar na cidade. No check-in em Guarulhos, confirme duas coisas:
          </p>
          <ChecklistCard
            items={[
              "Bagagem etiquetada até NRT (Narita) — na conexão normal da Emirates, sua mala segue automaticamente para Tokyo, você não precisa retirá-la em Dubai.",
              "Cartão de embarque DXB → NRT — normalmente você já recebe em São Paulo os cartões de embarque dos dois voos. Guarde ambos durante toda a viagem.",
            ]}
          />
        </div>
      </section>

      <section
        id="dxb-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Chegada em Dubai" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Ao desembarcar em DXB, siga as placas indicando <strong>CONNECTIONS</strong> ou{" "}
            <strong>FLIGHT CONNECTIONS</strong>.
          </p>
          <AlertBox>
            Não siga as placas de <strong>Arrivals</strong>, <strong>Baggage Claim</strong> ou{" "}
            <strong>Passport Control / Immigration</strong> — essas são para quem tem Dubai como
            destino final. Seu destino é Tokyo: siga sempre CONNECTIONS.
          </AlertBox>
        </div>
      </section>

      <section id="dxb-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="Sem Imigração, Sem Retirar a Mala" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Como você está apenas em conexão e continuará dentro da área internacional, não é
              necessário entrar oficialmente nos Emirados Árabes Unidos — siga direto o fluxo de
              passageiros em conexão.
            </p>
            <p>
              Sua bagagem despachada em São Paulo segue automaticamente GRU → DXB → NRT. Você só
              vai reencontrá-la na esteira em Tokyo Narita — por isso, em Dubai, não siga para
              BAGGAGE CLAIM.
            </p>
          </div>
        </div>
      </section>

      <section
        id="dxb-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={4} label="Segurança na Conexão" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            O aeroporto é grande, mas tem bastante sinalização em inglês — não se preocupe se
            houver uma caminhada relativamente longa até CONNECTIONS, você continua dentro do
            aeroporto durante todo o processo. Em seguida, siga o fluxo indicado para{" "}
            <strong>CONNECTIONS / SECURITY</strong> — você pode passar por uma nova inspeção de
            segurança antes de acessar a área de embarque.
          </p>
          <TipBox title="Tenha em mãos">
            <p>Passaporte e o cartão de embarque DXB → NRT. O procedimento é semelhante ao de outros aeroportos internacionais.</p>
          </TipBox>
        </div>
      </section>

      <section id="dxb-secao-5" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={5} label="Descubra Seu Portão" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Este é o passo mais importante da conexão. Procure um dos grandes painéis{" "}
            <strong>DEPARTURES</strong> e localize TOKYO NARITA — NRT, ou melhor ainda, o número
            do seu voo Emirates (ex.: EK ___ — Tokyo Narita). Ao lado aparecerá o GATE.
          </p>
          <TipBox title="Use o número do voo como referência principal">
            <p>
              Em vez de procurar apenas "TOKYO", procure o número exato do seu voo — isso evita
              confusão caso existam outros voos para o Japão ou alterações nos painéis. Confira
              sempre: número do voo, Tokyo Narita / NRT, horário e gate.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="dxb-secao-6"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={6} label="Terminal 3 — A, B e C Gates" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Os voos da Emirates utilizam o Terminal 3, dividido em três grandes áreas de
            portões — seu voo de São Paulo pode chegar em uma delas e o voo para Tokyo sair de
            outra. Isso é completamente normal, e você não precisa sair do aeroporto para trocar
            entre elas.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Se o voo sair dos A Gates
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Os A Gates são conectados às demais áreas por um trem interno do aeroporto —
                siga as placas A GATES e utilize o trem indicado. Não há cobrança, não é o metrô
                de Dubai — você continua dentro da área internacional.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Se o voo sair dos B ou C Gates
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Os saguões B e C são conectados internamente e podem exigir uma caminhada
                considerável — siga as placas B GATES ou C GATES. O DXB tem esteiras rolantes ao
                longo de diversos corredores.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="dxb-secao-7" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={7} label="Distância e Portão Não Anunciado" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Dubai International é um aeroporto muito grande — dependendo dos portões de
              chegada e partida, a transferência entre áreas pode levar aproximadamente{" "}
              <strong>20–30 minutos</strong>. Assim que descobrir seu portão, veja primeiro onde
              ele fica, depois decida quanto tempo você tem para restaurantes, lojas ou lounge.
            </p>
            <p>
              Se o painel mostrar "GATE TO BE ANNOUNCED" ou ainda não apresentar um número, não
              significa que exista algum problema — confira novamente os painéis mais tarde, ou
              acompanhe pelo aplicativo da Emirates. Mesmo que o cartão de embarque já mostre um
              portão, confira sempre os painéis do aeroporto — portões podem ser alterados, e a
              informação dos monitores é sempre a mais atual.
            </p>
          </div>
        </div>
      </section>

      <section
        id="dxb-secao-8"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={8} label="Horário Local e “Departure”" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Dubai utiliza o horário local dos Emirados Árabes Unidos — os horários nos painéis
              e no cartão de embarque são sempre horário local de Dubai, não o de Brasília. O
              celular normalmente ajusta o fuso automaticamente ao conectar-se à rede.
            </p>
          </div>
          <AlertBox>
            O horário mostrado como <strong>DEPARTURE</strong> é o horário previsto para o avião
            partir — você precisa estar no portão antes disso. Para passageiros Emirates em
            Economy ou Premium Economy, a orientação é chegar ao portão até{" "}
            <strong>60 minutos antes</strong> da partida. Não espere o horário de partida para
            caminhar até o portão.
          </AlertBox>
        </div>
      </section>

      <section id="dxb-secao-9" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={9} label="Conexão Curta ou Longa" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Conexão curta
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Ao desembarcar, vá direto para CONNECTIONS, depois segurança → painel → portão.
                Deixe compras, restaurantes e outras atividades para depois de localizar o
                portão.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Conexão longa
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Faça primeiro CONNECTIONS → segurança → confirme o portão → localize a área
                A/B/C. Depois disso, pode aproveitar o aeroporto com tranquilidade.
              </p>
            </div>
          </div>
          <TipBox title="Em dúvida?">
            <p>
              Existem funcionários da Emirates e do aeroporto nas áreas de conexão. Mostre seu
              cartão de embarque e diga "Tokyo Narita connection?" ou simplesmente "NRT?" — o
              funcionário indicará o caminho.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="dxb-secao-10"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={10} label="O Que Você Não Precisa Fazer" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Em uma conexão Emirates normal GRU → DXB → NRT, você permanece em trânsito
            internacional:
          </p>
          <DontList
            items={[
              "Não retirar a mala em Dubai",
              "Não fazer novo check-in",
              "Não passar pela imigração para entrar em Dubai",
              "Não sair do aeroporto",
              "Não procurar transporte para outro aeroporto",
              "Não pegar táxi ou metrô",
            ]}
          />
          <AlertBox>
            Dubai tem mais de um aeroporto — sua conexão é no <strong>DXB</strong> (Dubai
            International Airport). Não confunda com <strong>DWC</strong> (Al Maktoum
            International Airport). Numa conexão Emirates convencional entre São Paulo e Tokyo,
            você permanece no DXB Terminal 3.
          </AlertBox>
        </div>
      </section>

      <section id="dxb-secao-11" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <SectionMarker number={11} label="Passo a Passo e Regra de Ouro" />
          <NumberedSteps
            items={[
              "Desembarque em Dubai.",
              "Siga \"Connections\".",
              "Passe pela segurança.",
              "Procure seu voo para NRT no painel.",
              "Confira o gate.",
              "Siga para A / B / C Gates.",
              "Embarque para Tokyo.",
              "Retire sua mala somente em Narita.",
            ]}
          />
          <TipBox title="Regra de ouro">
            <p>
              Ao desembarcar em Dubai: <strong>não</strong> siga "Arrivals" — siga{" "}
              <strong>"Connections"</strong>. Depois da segurança, procure número do voo + Tokyo
              Narita (NRT) + Gate. A partir daí, é só seguir as placas até o portão. GRU → DXB →
              NRT: Dubai é apenas sua conexão — sua bagagem e sua viagem continuam para Tokyo.
            </p>
          </TipBox>
        </div>
      </section>
    </div>
  );
}
