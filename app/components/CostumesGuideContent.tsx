import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  SubStepHeading,
  IconBulb,
  IconClock,
  IconCard,
  IconMap,
  IconDocument,
  IconCheck,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Costumes & Etiqueta no Japão — mesmo padrão
// do NaritaGuideContent: reutilizado tanto na página interna (banco de
// conteúdo, /database/costumes) quanto embutido no painel do cliente
// (app/rf3vk8mp). Editar aqui atualiza os dois lugares.

function TipBox({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#173B45]/15 bg-[#173B45]/[0.08] p-5 sm:p-6">
      <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#173B45]">
        <IconBulb className="h-3.5 w-3.5" />
        {title ?? "Recomendação Ajisai"}
      </p>
      <div className="text-sm leading-7 text-[#24211D]/85">{children}</div>
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

function ChecklistRow({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] px-4 py-3"
        >
          <span className="text-[#173B45]">
            <IconCheck className="h-4 w-4" />
          </span>
          <p className="text-sm text-[#24211D]/85">{item}</p>
        </div>
      ))}
    </div>
  );
}

function NumberedSteps({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B45]/10 text-xs font-medium text-[#173B45]">
            {i + 1}
          </span>
          <p className="text-sm text-[#24211D]/85">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function CostumesGuideContent({
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
        eyebrow="Anexo com Informação Detalhada - Costumes & Etiqueta"
        title="Costumes & Etiqueta no Japão"
        subtitle="Pequenos gestos para uma experiência mais natural. O Japão é extremamente acolhedor com visitantes — ninguém espera que um estrangeiro conheça todos os costumes locais, mas alguns hábitos ajudam a tornar as interações mais naturais."
        internal={internal}
      />

      <div className="mx-auto max-w-5xl px-6 pb-4 pt-8 md:px-10">
        <TipBox title="A ideia é simples">
          Observe o ambiente, respeite o espaço das outras pessoas e, na dúvida,
          acompanhe o comportamento local.
        </TipBox>
      </div>

      <TableOfContents
        items={[
          {
            Icon: IconMap,
            number: 1,
            label: "Em Locais Públicos, Filas e Estações",
            href: "#costumes-secao-1",
            subsections: [
              { label: "Um ambiente mais tranquilo", href: "#costumes-secao-1-1" },
              { label: "Filas e organização", href: "#costumes-secao-1-2" },
              { label: "Circulando pelas estações", href: "#costumes-secao-1-3" },
            ],
          },
          {
            Icon: IconCheck,
            number: 2,
            label: "Sapatos e Chinelos",
            href: "#costumes-secao-2",
            subsections: [
              { label: "Sapatos", href: "#costumes-secao-2-1" },
              { label: "Chinelos do banheiro", href: "#costumes-secao-2-2" },
            ],
          },
          { Icon: IconBulb, number: 3, label: "Lixo e Comendo na Rua", href: "#costumes-secao-3" },
          {
            Icon: IconDocument,
            number: 4,
            label: "Restaurantes e Etiqueta à Mesa",
            href: "#costumes-secao-4",
            subsections: [
              { label: "Reservas", href: "#costumes-secao-4-1" },
              { label: "Gorjetas", href: "#costumes-secao-4-2" },
              { label: "Pagamentos", href: "#costumes-secao-4-3" },
              { label: "Hashi (palitinhos)", href: "#costumes-secao-4-4" },
              { label: "Ramen, udon e soba", href: "#costumes-secao-4-5" },
              { label: "Sushi", href: "#costumes-secao-4-6" },
            ],
          },
          {
            Icon: IconMap,
            number: 5,
            label: "Templos, Fotografias e Bairros Tradicionais",
            href: "#costumes-secao-5",
            subsections: [
              { label: "Templos e santuários", href: "#costumes-secao-5-1" },
              { label: "Fotografias", href: "#costumes-secao-5-2" },
              { label: "Kyoto e os bairros tradicionais", href: "#costumes-secao-5-3" },
            ],
          },
          {
            Icon: IconClock,
            number: 6,
            label: "Onsen",
            href: "#costumes-secao-6",
            subsections: [
              { label: "O ritual", href: "#costumes-secao-6-1" },
              { label: "Toalhas", href: "#costumes-secao-6-2" },
              { label: "Tatuagens", href: "#costumes-secao-6-3" },
            ],
          },
          {
            Icon: IconBulb,
            number: 7,
            label: "Cumprimentos e Comunicação",
            href: "#costumes-secao-7",
            subsections: [
              { label: "Cumprimentos", href: "#costumes-secao-7-1" },
              { label: "3 expressões que vale conhecer", href: "#costumes-secao-7-2" },
              { label: "Comunicação", href: "#costumes-secao-7-3" },
            ],
          },
          {
            Icon: IconCard,
            number: 8,
            label: "No Transporte e nas Ruas",
            href: "#costumes-secao-8",
            subsections: [
              { label: "Fumantes", href: "#costumes-secao-8-1" },
              { label: "Malas e mochilas", href: "#costumes-secao-8-2" },
              { label: "Assentos prioritários", href: "#costumes-secao-8-3" },
            ],
          },
          { Icon: IconCheck, number: 9, label: "A Melhor Regra é Observar", href: "#costumes-secao-9" },
        ]}
      />

      {/* 1. Locais públicos, filas e estações */}
      <section id="costumes-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={1} label="Em Locais Públicos, Filas e Estações" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-1-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              1.1 — Um Ambiente Geralmente Mais Tranquilo
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Trens, estações e outros espaços compartilhados costumam ser mais
              silenciosos do que estamos acostumados no Brasil. Conversar é
              perfeitamente normal — apenas procure manter um tom de voz moderado. Nos
              trens e metrôs, os celulares costumam permanecer no silencioso e
              chamadas telefônicas são evitadas.
            </p>
            <TipBox>Se precisar atender uma ligação, prefira aguardar até desembarcar.</TipBox>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-1-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              1.2 — Filas e Organização
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Filas fazem parte do cotidiano japonês e aparecem praticamente em todos
              os lugares: estações, restaurantes, elevadores e atrações. Nas
              plataformas de trem, marcações no chão indicam onde aguardar. Quando o
              trem chegar: primeiro desembarcam os passageiros, depois começa o
              embarque. Em locais movimentados, procure também deixar corredores e
              acessos livres.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-1-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              1.3 — Circulando pelas Estações
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Estações como Shinjuku, Shibuya, Tokyo e Osaka recebem milhares de
              pessoas a todo momento. Caso precise consultar o celular, reorganizar uma
              bolsa ou verificar o caminho, procure se posicionar um pouco mais ao lado
              do fluxo — um pequeno gesto que faz bastante diferença nos horários de
              maior movimento.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sapatos e chinelos */}
      <section id="costumes-secao-2" className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Sapatos e Chinelos" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-2-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              2.1 — Sapatos
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Retirar os sapatos antes de entrar em determinados ambientes é um dos
              costumes japoneses mais conhecidos. Isso pode acontecer em:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Ryokans", "Residências", "Alguns restaurantes", "Ambientes com tatame", "Algumas áreas de templos", "Onsens"].map((item) => (
                <span key={item} className="rounded-full border border-[#DDD8CF] bg-[#FDFCF9] px-3 py-1.5 text-sm text-[#24211D]/80">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Normalmente será bastante evidente quando os sapatos devem ser
              retirados. Se houver chinelos disponíveis, utilize-os conforme a
              orientação do local.
            </p>
            <TipBox title="Tatame">Ao entrar em uma área de tatame, os sapatos ficam sempre do lado de fora.</TipBox>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-2-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              2.2 — Chinelos do Banheiro
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Em alguns estabelecimentos tradicionais existem chinelos utilizados
              exclusivamente dentro do banheiro. Ao entrar, troque para esses chinelos
              — ao sair, lembre-se de retornar aos anteriores. É um detalhe pequeno,
              mas bastante característico da etiqueta japonesa.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Lixo e comendo na rua */}
      <section id="costumes-secao-3" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={3} label="Lixo e Comendo na Rua" />
          </div>

          <div className="space-y-4">
            <SubStepHeading number={1} title="Lixo" />
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Uma curiosidade que surpreende muitos visitantes: existem relativamente
              poucas lixeiras nas ruas japonesas. É comum guardar uma embalagem ou
              pequeno resíduo até encontrar uma lixeira apropriada.
            </p>
            <TipBox>Ter uma pequena sacola na bolsa ou mochila pode ser bastante útil durante os passeios.</TipBox>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <SubStepHeading number={2} title="Comer Enquanto Caminha" />
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Não existe uma regra universal proibindo comer andando no Japão.
              Entretanto, dependendo do local, é mais habitual consumir o alimento
              próximo ao estabelecimento ou em uma área destinada a isso. Em mercados,
              festivais e ruas gastronômicas, observe as orientações locais.
            </p>
            <TipBox>Comprou algo em uma pequena loja? Muitas vezes existe um espaço próximo onde você pode consumir e descartar a embalagem.</TipBox>
          </div>
        </div>
      </section>

      {/* 4. Restaurantes e etiqueta à mesa */}
      <section id="costumes-secao-4" className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Restaurantes e Etiqueta à Mesa" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-4-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.1 — Reservas
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Pontualidade é bastante valorizada no Japão, principalmente em
              restaurantes com reserva. Procure chegar alguns minutos antes do horário
              marcado — caso ocorra algum imprevisto, avise o restaurante sempre que
              possível.
            </p>
            <p className="text-sm leading-6 text-[#24211D]/60">
              Alguns estabelecimentos, especialmente restaurantes menores e
              experiências gastronômicas, trabalham com ingredientes preparados
              especificamente para as reservas daquele dia — por isso, cancelamentos
              antecipados são muito apreciados.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-4-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.2 — Gorjetas
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Aqui a experiência é bastante simples: não é necessário deixar gorjeta.
              O serviço já faz parte da experiência e os funcionários não esperam
              pagamentos adicionais. Em estabelecimentos que cobram taxa de serviço,
              ela será informada ou incluída na conta.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-4-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.3 — Pagamentos
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Em muitos caixas existe uma pequena bandeja para colocar dinheiro ou
              cartão. Quando ela estiver presente, basta colocar o pagamento sobre a
              bandeja — o funcionário normalmente devolverá o cartão ou troco da mesma
              maneira. É um costume simples que você rapidamente perceberá durante a
              viagem.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-4-4" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.4 — Hashi (Palitinhos Japoneses)
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Não é necessário conhecer todas as regras relacionadas ao hashi — duas,
              porém, são especialmente úteis:
            </p>
            <AlertBox>
              Evite deixar os palitinhos espetados verticalmente no arroz, e evite
              passar alimentos diretamente de um par de palitinhos para outro. Ambos os
              gestos possuem associações com rituais funerários japoneses.
            </AlertBox>
            <p className="text-sm leading-6 text-[#24211D]/60">
              Quando não estiver utilizando os palitinhos, coloque-os no suporte
              disponível ou ao lado do prato.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-4-5" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.5 — Ramen, Udon e Soba
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Ao comer noodles, você provavelmente perceberá japoneses sorvendo o
              macarrão de maneira bastante audível. Isso é perfeitamente normal e não
              é considerado falta de educação. Também não é necessário imitá-los —
              coma da maneira que for mais confortável para você.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-4-6" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              4.6 — Sushi
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Uma curiosidade: nigiri pode ser comido tanto com hashi quanto com as
              mãos — as duas maneiras são aceitas. Em restaurantes mais tradicionais ou
              experiências omakase, vale simplesmente acompanhar o ritmo e as
              orientações do chef.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Templos, fotografias e bairros tradicionais */}
      <section id="costumes-secao-5" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={5} label="Templos, Fotografias e Bairros Tradicionais" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-5-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              5.1 — Templos e Santuários
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Templos budistas e santuários xintoístas fazem parte da vida religiosa
              japonesa, além de serem importantes atrações históricas. Durante a
              visita, procure manter um ambiente tranquilo e respeitar áreas
              sinalizadas como restritas. Você não precisa conhecer todos os rituais
              religiosos para visitar esses locais — uma postura respeitosa é
              suficiente.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-5-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              5.2 — Fotografias
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              O Japão oferece inúmeras oportunidades para fotografar, mas alguns
              templos, museus, restaurantes e propriedades históricas possuem áreas
              onde fotografias não são permitidas. Procure por indicações como:
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[#DDD8CF] bg-[#FDFCF9] px-4 py-2 text-sm text-[#24211D]/85">No Photography</span>
              <span className="rounded-full border border-[#DDD8CF] bg-[#FDFCF9] px-4 py-2 text-sm text-[#24211D]/85">撮影禁止</span>
            </div>
            <p className="text-sm leading-6 text-[#24211D]/60">
              Quando pessoas forem claramente o foco principal da fotografia, pedir
              autorização é sempre uma boa prática.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-5-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              5.3 — Kyoto e os Bairros Tradicionais
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Em bairros históricos como Gion, é importante lembrar que muitas das
              construções continuam sendo residências e estabelecimentos privados.
              Algumas pequenas ruas também possuem restrições de acesso ou
              fotografia — observe sempre a sinalização local.
            </p>
            <TipBox>Ao encontrar uma geiko ou maiko, mantenha uma distância respeitosa e permita que ela siga normalmente seu caminho.</TipBox>
          </div>
        </div>
      </section>

      {/* 6. Onsen */}
      <section id="costumes-secao-6" className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={6} label="Onsen" />
          </div>
          <p className="mb-8 text-base font-light leading-8 text-[#24211D]/88">
            Visitar um onsen é uma das experiências mais tradicionais do Japão — e o
            ritual é bastante simples.
          </p>

          <div className="space-y-4">
            <p id="costumes-secao-6-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              6.1 — O Ritual, Antes de Entrar na Água
            </p>
            <NumberedSteps
              items={[
                "Deixe seus pertences no vestiário",
                "Vá até a área de banho",
                "Lave completamente o corpo",
                "Retire todo o sabonete",
                "Entre no banho termal",
              ]}
            />
            <p className="text-sm leading-6 text-[#24211D]/60">
              A água do onsen é compartilhada, portanto todos entram já limpos.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-6-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              6.2 — Toalhas
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              A pequena toalha utilizada durante o banho não deve ser colocada dentro
              da água. Você pode deixá-la em um local indicado ou, como verá muitos
              japoneses fazendo, colocá-la sobre a cabeça. Se tiver cabelos longos,
              mantenha-os presos para evitar contato com a água.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-6-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              6.3 — Tatuagens
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              As políticas relacionadas a tatuagens variam bastante entre onsens,
              sentos, piscinas e academias. Alguns estabelecimentos aceitam
              normalmente; outros permitem tatuagens pequenas cobertas por adesivos; e
              alguns possuem restrições.
            </p>
            <TipBox>Consulte as regras específicas do estabelecimento antes da visita. Quando disponível, um banho privativo também pode ser uma excelente alternativa.</TipBox>
          </div>
        </div>
      </section>

      {/* 7. Cumprimentos e comunicação */}
      <section id="costumes-secao-7" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={7} label="Cumprimentos e Comunicação" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-7-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              7.1 — Cumprimentos
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Não é necessário dominar os diferentes tipos de reverência japonesa. Um
              pequeno movimento de cabeça acompanhado de um sorriso já transmite
              educação e cordialidade. Apertos de mão também acontecem, especialmente
              em interações com visitantes estrangeiros — abraços e beijos no rosto,
              tão naturais no Brasil, são menos comuns como cumprimento no Japão.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-7-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              7.2 — Três Expressões que Vale Conhecer
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Mesmo sem falar japonês, algumas palavras tornam as interações muito
              mais fáceis.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6 text-center">
                <p className="text-lg font-medium text-[#24211D]">すみません</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#173B45]">Sumimasen</p>
                <p className="mt-3 text-sm leading-6 text-[#24211D]/78">
                  Com licença / desculpe — talvez a palavra mais útil durante toda a
                  viagem.
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6 text-center">
                <p className="text-lg font-medium text-[#24211D]">ありがとうございます</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#173B45]">Arigatou gozaimasu</p>
                <p className="mt-3 text-sm leading-6 text-[#24211D]/78">
                  Muito obrigado — uma maneira educada de agradecer.
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6 text-center">
                <p className="text-lg font-medium text-[#24211D]">お願いします</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#173B45]">Onegaishimasu</p>
                <p className="mt-3 text-sm leading-6 text-[#24211D]/78">
                  Por favor — muito útil em restaurantes, lojas e outras situações do
                  cotidiano.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-7-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              7.3 — Comunicação
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Nas grandes cidades e atrações turísticas você encontrará bastante
              sinalização em inglês. Em restaurantes menores e estabelecimentos
              locais, porém, nem todos os funcionários falarão inglês — isso raramente
              é um grande problema. Aplicativos de tradução, menus com fotografias e
              gestos simples ajudam bastante. Paciência e cordialidade normalmente
              resolvem a situação.
            </p>
          </div>
        </div>
      </section>

      {/* 8. No transporte e nas ruas */}
      <section id="costumes-secao-8" className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={8} label="No Transporte e nas Ruas" />
          </div>

          <div className="space-y-4">
            <p id="costumes-secao-8-1" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              8.1 — Fumantes
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              As regras para fumar variam conforme a cidade e o bairro. Em muitas
              regiões existem espaços específicos identificados como{" "}
              <span className="text-[#24211D]">Smoking Area</span>. Caso seja fumante,
              procure utilizar essas áreas e observar a sinalização local.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-8-2" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              8.2 — Malas e Mochilas
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Nos transportes públicos, mantenha malas e mochilas próximas ao corpo e
              procure não ocupar corredores ou acessos. Quando o trem estiver cheio,
              retirar uma mochila grande das costas ajuda a criar mais espaço para
              todos. Em viagens de Shinkansen, malas muito grandes podem exigir
              planejamento ou reserva específica de espaço.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-[#DDD8CF] pt-8">
            <p id="costumes-secao-8-3" className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]/60">
              8.3 — Assentos Prioritários
            </p>
            <p className="text-base font-light leading-8 text-[#24211D]/88">
              Trens e ônibus possuem assentos prioritários destinados principalmente a
              idosos, gestantes, pessoas com deficiência e passageiros acompanhados de
              crianças pequenas. Caso esteja sentado e perceba alguém que possa
              precisar mais do lugar, oferecer o assento é um gesto muito apreciado.
            </p>
          </div>
        </div>
      </section>

      {/* 9. A melhor regra é observar */}
      <section id="costumes-secao-9" className="border-t border-[#DDD8CF] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={9} label="A Melhor Regra é Observar" />
          </div>
          <p className="mb-6 text-base font-light leading-8 text-[#24211D]/88">
            Talvez esta seja a dica mais útil de todo o guia. Você não precisa
            memorizar dezenas de costumes japoneses. Ao chegar a um lugar novo,
            observe por alguns segundos como as pessoas ao seu redor estão agindo:
          </p>
          <ChecklistRow
            items={[
              "Onde estão esperando?",
              "Onde deixam os sapatos?",
              "Onde colocam o pagamento?",
              "Onde fazem fila?",
            ]}
          />
          <p className="mt-6 text-sm leading-6 text-[#24211D]/60">
            Pode parecer simples, mas essa observação resolve grande parte das
            dúvidas.
          </p>
        </div>
      </section>

      {/* Para lembrar */}
      <div className="border-t border-[#B96432]/20 bg-[#F9F2ED] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#B96432]/70">Para Lembrar</p>
          <h2 className={`${displayClassName} mb-6 text-3xl font-medium text-[#24211D] md:text-5xl`}>
            Tranquilidade, cordialidade e consideração
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base font-light leading-8 text-[#24211D]/75">
            O visitante estrangeiro não precisa conhecer perfeitamente a etiqueta
            japonesa. Os japoneses estão acostumados a receber turistas e entendem
            que alguns costumes serão novidade — isso é suficiente na grande maioria
            das situações.
          </p>
          <div className="mx-auto grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {[
              "Fale um pouco mais baixo nos espaços compartilhados.",
              "Respeite as filas e a sinalização.",
              "Observe quando os sapatos devem ser retirados.",
              "Seja pontual com suas reservas.",
              "Respeite as regras de fotografia.",
              "Na dúvida, observe como as pessoas ao seu redor estão agindo.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-[#B96432]/20 bg-white px-4 py-3">
                <span className="mt-0.5 text-[#B96432]">
                  <IconCheck className="h-4 w-4" />
                </span>
                <p className="text-sm leading-6 text-[#24211D]/85">{item}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-xl text-base font-light leading-8 text-[#24211D]/75">
            Pequenos gestos ajudam você a vivenciar o Japão de maneira mais natural —
            sem precisar deixar de ser você mesmo.
          </p>
        </div>
      </div>
    </div>
  );
}
