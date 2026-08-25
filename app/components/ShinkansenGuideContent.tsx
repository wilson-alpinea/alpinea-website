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
  IconWarning,
  IconLuggage,
  IconRoute,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Shinkansen com JR Pass (Tokyo · Kyoto · Osaka)
// — mesmo padrão do NaritaGuideContent/TremGuideContent: reutilizado tanto na
// página interna (banco de conteúdo, /database/shinkansen) quanto embutido no
// painel do cliente (app/rf3vk8mp). Editar aqui atualiza os dois lugares.

function ServiceCard({
  nome,
  tag,
  tagPositiva,
  descricao,
  destaque,
}: {
  nome: string;
  tag: string;
  tagPositiva?: boolean;
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
      <span
        className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
          tagPositiva
            ? "border-[#173B45]/25 bg-[#173B45]/[0.08] text-[#173B45]"
            : "border-amber-400/40 bg-amber-50 text-amber-800"
        }`}
      >
        {tag}
      </span>
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

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-5 sm:p-6">
      <p className="text-sm leading-7 text-amber-900">{children}</p>
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

export function ShinkansenGuideContent({
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
        eyebrow="Anexo com Informação Detalhada - Trem Bala (Shinkansen)"
        title="Shinkansen com JR Pass"
        subtitle="Guia prático para Tokyo, Kyoto e Osaka — qual trem usar, como reservar, embarcar e encontrar seu vagão sem sustos, usando o Japan Rail Pass."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconTrain, number: 1, label: "Quais Shinkansen Usar", href: "#shinkansen-secao-1" },
          { Icon: IconCard, number: 2, label: "Reserva de Assento", href: "#shinkansen-secao-2" },
          { Icon: IconRoute, number: 3, label: "Embarque com o JR Pass", href: "#shinkansen-secao-3" },
          { Icon: IconMap, number: 4, label: "Encontrando Seu Trem", href: "#shinkansen-secao-4" },
          { Icon: IconCheck, number: 5, label: "Vagão e Assento", href: "#shinkansen-secao-5" },
          { Icon: IconClock, number: 6, label: "Pontualidade e Estações", href: "#shinkansen-secao-6" },
          { Icon: IconLuggage, number: 7, label: "Bagagem Grande", href: "#shinkansen-secao-7" },
          { Icon: IconBulb, number: 8, label: "Monte Fuji, Bilheteria e Green Car", href: "#shinkansen-secao-8" },
          { Icon: IconWarning, number: 9, label: "A Bordo", href: "#shinkansen-secao-9" },
          { Icon: IconRoute, number: 10, label: "Chegada e Se Algo Der Errado", href: "#shinkansen-secao-10" },
          { Icon: IconCheck, number: 11, label: "Passo a Passo e Regra de Ouro", href: "#shinkansen-secao-11" },
        ]}
      />

      <section id="shinkansen-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="Quais Shinkansen Posso Usar?" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Para viagens entre Tokyo, Kyoto e Osaka você utilizará a linha Tokaido Shinkansen,
            que tem três serviços principais — e com o JR Pass, o mais conveniente costuma ser
            o Hikari.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <ServiceCard
              nome="Hikari — recomendado"
              tag="Incluído no JR Pass"
              tagPositiva
              destaque
              descricao="Rápido e com poucas paradas. Para Tokyo → Kyoto ou Tokyo → Shin-Osaka, é normalmente a melhor opção para quem tem JR Pass."
            />
            <ServiceCard
              nome="Kodama"
              tag="Incluído no JR Pass"
              tagPositiva
              descricao="Para em todas as estações — também coberto pelo passe, mas mais lento. Para Tokyo → Kyoto, prefira o Hikari."
            />
            <ServiceCard
              nome="Nozomi"
              tag="Não incluído no JR Pass padrão"
              descricao="O mais rápido do Tokaido Shinkansen. Só pode ser usado com JR Pass comprando antecipadamente um Nozomi/Mizuho Ticket, com custo adicional."
            />
          </div>
          <TipBox title="Para simplificar">
            <p>Se você possui JR Pass, procure sempre HIKARI.</p>
          </TipBox>
        </div>
      </section>

      <section
        id="shinkansen-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Reserva de Assento" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Para viajar em um Hikari ou Kodama dentro da validade e área coberta pelo seu JR
              Pass, você <strong>não</strong> precisa comprar outra passagem — a viagem já está
              coberta pelo passe.
            </p>
            <p>
              Ainda assim, recomendamos sempre reservar o assento — a reserva não tem custo
              adicional, e define trem, horário, vagão e assento, tornando a viagem muito mais
              simples. Pode ser feita no JR Ticket Office (みどりの窓口) ou nas Reserved Seat
              Ticket Machines das principais estações JR — tenha o JR Pass em mãos.
            </p>
          </div>
          <TipBox title="O que você recebe ao reservar">
            <p>
              Um Reserved Seat Ticket com informações como <strong>HIKARI 507 · TOKYO → KYOTO ·
              10:03 · CAR 9 · SEAT 12-E</strong>. Esse papel mostra os detalhes da reserva — mas o
              JR Pass continua sendo o documento usado para passar pela catraca. Guarde os dois.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="shinkansen-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="Embarque com o JR Pass" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Na estação, procure a sinalização SHINKANSEN (新幹線). Insira o JR Pass na
              catraca — ela abrirá — e <strong>retire o passe do outro lado</strong>. Não deixe
              o passe na máquina: você vai precisar dele durante toda a viagem.
            </p>
          </div>
          <AlertBox>
            Não use Suica, PASMO ou ICOCA para pagar o trecho do Shinkansen coberto pelo JR
            Pass — use sempre o próprio JR Pass.
          </AlertBox>
        </div>
      </section>

      <section
        id="shinkansen-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={4} label="Encontrando Seu Trem" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Procure os painéis SHINKANSEN DEPARTURES. Não procure apenas "KYOTO" — procure o{" "}
              <strong>nome + número do trem</strong> (ex.: HIKARI 507) e depois confirme horário
              e plataforma.
            </p>
          </div>
          <TipBox title="Pense no Shinkansen como um voo">
            <p>
              Assim como "EK261" identifica um voo, "HIKARI 507" identifica seu trem. É normal o
              painel mostrar um destino diferente do seu (ex.: SHIN-OSAKA, mesmo se você desce em
              Kyoto) — isso só significa que aquele é o destino final do trem, e Kyoto é uma
              parada intermediária no caminho. Confira sempre nome + número + horário, não o
              destino final exibido.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="shinkansen-secao-5" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={5} label="Vagão e Assento" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Na plataforma existem marcações mostrando exatamente onde cada vagão vai parar —
            procure o número do seu vagão (ex.: CAR 9) e espere naquela posição. O código do
            assento (ex.: 12-E) significa fileira 12, assento E.
          </p>
          <ChecklistCard
            items={[
              "Nome e número do trem confere (ex.: HIKARI 507)",
              "Horário confere (ex.: 10:03)",
              "Plataforma confere (ex.: TRACK 17)",
              "Vagão confere (ex.: CAR 9)",
            ]}
          />
        </div>
      </section>

      <section
        id="shinkansen-secao-6"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={6} label="Pontualidade e Estações" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              O Shinkansen opera com grande precisão — esteja na plataforma com 10 a 15 minutos
              de antecedência para localizar seu vagão com calma.
            </p>
            <p>
              O Tokaido Shinkansen pode ser embarcado em <strong>Tokyo Station</strong> ou{" "}
              <strong>Shinagawa</strong>, dependendo da reserva — confira sempre qual estação
              está impressa no ticket antes de sair para a estação.
            </p>
            <p>
              Atenção: o Shinkansen <strong>não</strong> para em Osaka Station — a estação é{" "}
              <strong>Shin-Osaka</strong>. Se o destino final for Osaka, ao desembarcar em
              Shin-Osaka siga "JR Lines / Transfer" e use o trem local indicado — como conexão
              JR, normalmente também coberta pelo passe.
            </p>
          </div>
        </div>
      </section>

      <section id="shinkansen-secao-7" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={7} label="Bagagem Grande" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Malas convencionais podem ser levadas normalmente. Existe uma regra especial só
            para malas grandes: some altura + largura + profundidade.
          </p>
          <TipBox title="Acima de 160 cm é bagagem especial">
            <p>
              Se a soma ultrapassar 160 cm, a mala é considerada "oversized baggage". Entre 161
              e 250 cm, é necessário reservar um assento com espaço para bagagem extra-grande —
              a reserva pode ser feita junto com o assento. Se estiver viajando com mala grande,
              avise o funcionário no momento da reserva.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="shinkansen-secao-8"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={8} label="Monte Fuji, Bilheteria e Green Car" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Monte Fuji
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                No trajeto Tokyo → Kyoto, em dias claros, dá para ver o Monte Fuji. Para
                aumentar as chances, peça um assento do lado do Fuji — em Ordinary Car, o
                assento E costuma ser o lado certo nesse sentido.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Como pedir
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Na bilheteria, basta mostrar o destino e dizer: "Kyoto. Hikari. Reserved seat,
                please." Para o lado do Fuji: "Mt. Fuji side, please." — e mostre o JR Pass.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/70">
                Green Car
              </p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
                Só reserve o Green Car se o seu passe for da categoria Green — com um passe
                Ordinary, não use o Green Car sem pagar a diferença. Confira a categoria
                impressa no seu JR Pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="shinkansen-secao-9" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={9} label="A Bordo" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              É normal comer dentro do Shinkansen — antes de embarcar, vale comprar um ekiben
              (🍱 refeição preparada para viagens de trem), ou levar onigiri, sanduíches, snacks
              e bebidas. Grandes estações têm várias opções perto das plataformas do
              Shinkansen.
            </p>
            <p>
              O ambiente costuma ser tranquilo — dá para conversar em volume moderado, mas
              coloque o celular no silencioso e evite chamadas no assento. Painéis e anúncios
              informam as próximas estações também em inglês.
            </p>
          </div>
        </div>
      </section>

      <section
        id="shinkansen-secao-10"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={10} label="Chegada e Se Algo Der Errado" />
          <div className="space-y-4 text-base font-light leading-8 text-[#24211D]/88">
            <p>
              Quando a estação de destino se aproximar, o painel e os anúncios vão avisar antes
              da chegada — organize mala, mochila, celular, carteira, passaporte, JR Pass e
              ticket de reserva. Ao sair, insira o JR Pass na catraca novamente e retire-o do
              outro lado — o passe continua válido para outras viagens até a data de expiração.
            </p>
          </div>
          <TipBox title="Perdeu o Hikari reservado?">
            <p>
              Procure um funcionário da JR e mostre o JR Pass e o Reserved Seat Ticket — ele vai
              orientar sobre a próxima opção disponível e, quando possível, fazer uma nova
              reserva. Não embarque automaticamente em um Nozomi, que não está incluído no
              passe padrão.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="shinkansen-secao-11" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <SectionMarker number={11} label="Passo a Passo e Regra de Ouro" />
          <NumberedSteps
            items={[
              "Tenha seu JR Pass em mãos.",
              "Reserve um Hikari (sem custo adicional).",
              "Procure a sinalização \"Shinkansen\".",
              "Use o JR Pass na catraca (e retire-o do outro lado).",
              "Procure Hikari + número do trem no painel.",
              "Confira o horário.",
              "Confira a plataforma.",
              "Encontre seu vagão pela marcação no chão da plataforma.",
              "Encontre seu assento (fileira + letra).",
              "Embarque.",
            ]}
          />
          <TipBox title="Regra de ouro">
            <p>
              Com JR Pass, para viajar entre Tokyo, Kyoto e Osaka: procure HIKARI. Depois
              confira nome + número, horário, plataforma, vagão e assento — por exemplo:{" "}
              <strong>HIKARI 507 · 10:03 → TRACK 17 → CAR 9 → SEAT 12-E</strong>. Com essas
              informações confirmadas, é só embarcar e aproveitar a viagem.
            </p>
          </TipBox>
        </div>
      </section>
    </div>
  );
}
