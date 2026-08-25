import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  IconBulb,
  IconTrain,
  IconCard,
  IconMap,
  IconClock,
  IconCheck,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Metrô e Trens no Japão — mesmo padrão do
// NaritaGuideContent: reutilizado tanto na página interna (banco de
// conteúdo, /database/trem) quanto embutido no painel do cliente
// (app/rf3vk8mp), já que /database não é acessível a clientes. Editar aqui
// atualiza os dois lugares.

function TrainTypeCard({
  nome,
  japones,
  tag,
  descricao,
  destaque,
}: {
  nome: string;
  japones: string;
  tag?: string;
  descricao: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque ? "border-[#173B45]/25 bg-[#173B45]/[0.05]" : "border-[#DDD8CF] bg-[#FDFCF9]"
      }`}
    >
      <p className="text-base font-semibold text-[#24211D]">{nome}</p>
      <p className="mt-0.5 text-sm text-[#24211D]/55">{japones}</p>
      {tag && (
        <span className="mt-2 inline-block rounded-full border border-[#B96432]/25 bg-[#F9F2ED] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B96432]">
          {tag}
        </span>
      )}
      <p className="mt-3 text-sm leading-6 text-[#24211D]/78">{descricao}</p>
    </div>
  );
}

function TipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-6 sm:p-8">
      <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
        <IconBulb className="h-3.5 w-3.5" />
        Recomendação Ajisai
      </p>
      <h3 className="text-xl font-medium text-[#24211D] md:text-2xl">{title}</h3>
      <div className="mt-4 space-y-3 text-sm leading-7 text-[#24211D]/88 md:text-base md:leading-8">
        {children}
      </div>
    </div>
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

export function TremGuideContent({
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
        eyebrow="Anexo com Informação Detalhada - Metrô e Trens no Japão"
        title="Metrô e Trens no Japão"
        heroImage="/images/trem-hero-tipos.png"
        heroAlt="Painel com os 5 tipos de trem no Japão — Local, Rapid, Semi Express, Express e Limited Express — com fotos dos trens, letreiros de destino e paineis de partida, além de exemplos de trens Limited Express: JR Narita Express, Odakyu Romancecar GSE, Keisei Skyliner, Tobu Spacia X e Seibu Laview"
        subtitle="Tipos de trem, IC Card, transferências, etiqueta e as particularidades de Tokyo, Kyoto e Osaka — a base de qualquer deslocamento durante a viagem."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconMap, number: 1, label: "Metrô, JR e Trem Privado", href: "#trem-secao-1" },
          { Icon: IconTrain, number: 2, label: "Tipos de Trem", href: "#trem-secao-2" },
          { Icon: IconBulb, number: 3, label: "A Regra Mais Importante", href: "#trem-secao-3" },
          { Icon: IconCard, number: 4, label: "IC Card e Tarifas", href: "#trem-secao-4" },
          { Icon: IconClock, number: 5, label: "Se Algo Der Errado", href: "#trem-secao-5" },
          { Icon: IconMap, number: 6, label: "Transferências e Sinalização", href: "#trem-secao-6" },
          { Icon: IconClock, number: 7, label: "Google Maps e Horários", href: "#trem-secao-7" },
          { Icon: IconCheck, number: 8, label: "Etiqueta no Trem", href: "#trem-secao-8" },
          { Icon: IconClock, number: 9, label: "Último Trem e Limited Express", href: "#trem-secao-9" },
          { Icon: IconMap, number: 10, label: "Particularidades — Kyoto, Osaka, Tokyo", href: "#trem-secao-10" },
          { Icon: IconBulb, number: 11, label: "Se Você Se Perder", href: "#trem-secao-11" },
        ]}
      />

      <section id="trem-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="Metrô, JR e Trem Privado — Qual a Diferença?" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            No Japão, "trem" não é uma coisa só: são várias empresas diferentes operando
            linhas próprias na mesma cidade — o Tokyo Metro e o Toei Subway (as duas
            operadoras de metrô de Tóquio), a JR (rede nacional, incluindo o Shinkansen)
            e diversas linhas privadas regionais (Keio, Odakyu, Keikyu, Hankyu, Keihan e
            outras). Elas compartilham estações e até se conectam fisicamente, mas são
            empresas separadas, com bilhetagem própria — por isso o mesmo trajeto pode
            custar mais caro se envolver troca de operadora.
          </p>
          <TipBox title="Isso muda alguma coisa na prática?">
            <p>
              Praticamente nada, se você usa um IC Card (Suica/Pasmo) — a tarifa é
              calculada automaticamente e cobrada no cartão, mesmo trocando de operadora
              no meio do trajeto. O que muda é o preço final e, às vezes, a necessidade
              de passar por uma catraca de saída/entrada ao trocar de linha, em vez de
              uma transferência direta na plataforma.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="trem-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Tipos de Trem" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Dentro da mesma linha, nem todo trem para em todas as estações — o nome do
            trem (mostrado no painel da plataforma e no próprio trem) indica isso.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TrainTypeCard
              nome="Local"
              japones="普通 (Futsu) / 各駅停車 (Kakueki-teisha)"
              descricao="Para em todas as estações. O mais lento, mas o mais simples — nunca erra."
            />
            <TrainTypeCard
              nome="Rapid"
              japones="快速 (Kaisoku)"
              descricao="Pula algumas estações menores. Um pouco mais rápido que o Local, sem taxa extra."
            />
            <TrainTypeCard
              nome="Special Rapid"
              japones="新快速 (Shin-kaisoku)"
              descricao="Versão mais rápida do Rapid, comum na região de Kyoto/Osaka — pula ainda mais estações."
            />
            <TrainTypeCard
              nome="Express"
              japones="急行 (Kyuko)"
              descricao="Pula bem mais estações que o Rapid — comum em linhas privadas regionais."
            />
            <TrainTypeCard
              nome="Limited Express"
              japones="特急 (Tokkyu)"
              tag="Pode ter taxa extra"
              descricao="O mais rápido antes do Shinkansen — geralmente exige um bilhete/assento adicional (limited express ticket), além da tarifa normal."
            />
            <TrainTypeCard
              nome="Shinkansen"
              japones="新幹線"
              tag="Bilhete próprio"
              destaque
              descricao="O trem-bala — rede própria, separada do metrô/JR local, com bilhete e sistema de reserva próprios (ver guia específico de Shinkansen)."
            />
          </div>
        </div>
      </section>

      <section id="trem-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="A Regra Mais Importante" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Antes de embarcar, confira sempre estes 5 pontos — é o que evita 90% dos
            perrengues de trem no Japão:
          </p>
          <ChecklistCard
            items={[
              "Confira o nome do trem no painel da plataforma (Local, Rapid, Limited Express...) — nem todo trem para em todas as estações.",
              "Confira a direção/destino final indicado no painel — a mesma plataforma pode ter trens de sentidos diferentes em horários distintos.",
              "Confira se é preciso baldeação (troca de trem/linha) no trajeto, e em qual estação.",
              "Em linhas com Limited Express, confira se o seu trem exige bilhete extra antes de embarcar.",
              "Em dúvida, pergunte a um funcionário da estação (geralmente de uniforme, perto das catracas) — praticamente todas as estações grandes têm alguém disponível.",
            ]}
          />
        </div>
      </section>

      <section
        id="trem-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={4} label="IC Card, Tarifas e Ajustes" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              O IC Card (Suica ou Pasmo) é a forma mais prática de pagar qualquer trem,
              metrô ou ônibus no Japão — basta encostar o cartão na catraca na entrada e
              na saída, e a tarifa é calculada e debitada automaticamente, mesmo em
              trajetos com baldeação entre operadoras diferentes.
            </p>
            <p>
              Se o saldo ficar insuficiente na catraca de saída, existem máquinas de
              ajuste de tarifa (Fare Adjustment) antes das catracas — basta inserir o
              cartão e completar a diferença em dinheiro.
            </p>
          </div>
        </div>
      </section>

      <section id="trem-secao-5" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={5} label="Se Algo Der Errado" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Pegou o trem errado ou passou da estação? Sem pânico — desça na próxima
              estação e siga na direção oposta na mesma plataforma (ou uma próxima,
              conforme sinalização). O sistema é desenhado para correções rápidas, e o
              custo extra costuma ser mínimo ou nenhum, especialmente com IC Card.
            </p>
          </div>
        </div>
      </section>

      <section
        id="trem-secao-6"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={6} label="Transferências e Sinalização" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Estações maiores sinalizam transferências com placas coloridas por linha
              (a mesma cor usada nos mapas oficiais de metrô) e o código da linha +
              número da estação (ex.: G10, H16) — útil mesmo sem ler japonês. Siga as
              placas até a plataforma da linha de destino; em complexos grandes
              (Shinjuku, Tokyo Station), a caminhada pode levar alguns minutos.
            </p>
          </div>
        </div>
      </section>

      <section id="trem-secao-7" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={7} label="Google Maps e Horários" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              O Google Maps é extremamente confiável para rotas de trem no Japão —
              mostra plataforma, horário exato de partida e chegada, número de
              baldeações e até o vagão mais próximo da saída de destino. Os trens
              japoneses são pontuais ao minuto, então vale confiar no horário mostrado.
            </p>
          </div>
        </div>
      </section>

      <section
        id="trem-secao-8"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={8} label="Etiqueta no Trem" />
          <ChecklistCard
            items={[
              "Celular no silencioso e sem chamadas telefônicas durante o trajeto.",
              "Fila organizada nas marcações do chão da plataforma — deixe os passageiros descerem primeiro.",
              "Mochilas grandes: tire das costas em horários de pico, para liberar espaço.",
              "Priorize os assentos reservados (prioritários) para idosos, gestantes e pessoas com deficiência.",
            ]}
          />
        </div>
      </section>

      <section id="trem-secao-9" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={9} label="Último Trem e Limited Express" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              O transporte público japonês não opera 24h — a maioria das linhas encerra
              entre meia-noite e 1h. Vale sempre confirmar o horário do último trem
              (saijuu/shuden) da linha de volta ao hotel antes de sair para jantares e
              baladas mais tarde da noite, especialmente em Kabukicho e Golden Gai.
            </p>
          </div>
        </div>
      </section>

      <section
        id="trem-secao-10"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={10} label="Particularidades — Kyoto, Osaka e Tokyo" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Tokyo
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Rede mais densa e complexa do Japão — Tokyo Metro, Toei Subway e JR
                Yamanote (a linha circular que passa pelas principais estações)
                cobrem quase tudo.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Kyoto
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Rede de metrô menor — muitos pontos turísticos dependem de ônibus.
                Vale considerar um passe de ônibus/metrô do dia.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Osaka
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Rede própria (Osaka Metro) somada a linhas privadas regionais como
                Hankyu e Keihan, usadas para excursões a Kyoto e Kobe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="trem-secao-11" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <SectionMarker number={11} label="Se Você Se Perder" />
          </div>
          <TipBox title="Peça ajuda sem medo">
            <p>
              As estações japonesas têm funcionários uniformizados perto das catraras e
              balcões de informação — mesmo sem falar japonês, mostrar o nome da estação
              de destino no celular costuma resolver rapidamente. O Google Tradutor (modo
              câmera) também ajuda bastante com placas e painéis.
            </p>
          </TipBox>
        </div>
      </section>
    </div>
  );
}
