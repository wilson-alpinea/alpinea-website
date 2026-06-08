import Image from "next/image";

export const metadata = {
  title: "Alpinea | Dia 8 — Osaka · Universal Studios Japan",
  description:
    "Dia 8 do roteiro Alpinea Private: Universal Studios Japan e jantar omakase no restaurante Amano.",
};

export default function Day8Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/preview" className="transition text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* Hero */}
    <section className="relative min-h-[720px] overflow-hidden border-b border-white/10">
  <Image
    src="/images/ginzan-onsen.jpg"
    alt="Alpinea Preview"
    fill
    priority
    sizes="100vw"
    className="object-cover"
  />

  <div className="absolute inset-0 bg-black/65" />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />

  <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-8 md:px-16">
    <div className="max-w-4xl">
      <p className="mb-10 text-xs uppercase tracking-[0.45em] text-white/45">
        ROTEIRO ALPINEA
      </p>

      <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
        Um exemplo real
        <br />
        de uma jornada Alpinea.
      </h1>

      <p className="mt-10 max-w-2xl text-xl font-light leading-10 text-white/65">
        Uma prévia simplificada da forma como estruturamos roteiros:
        contexto, ritmo, logística, atrações, horários recomendados,
        restaurantes e oportunidades de compras.
      </p>
    </div>
  </div>
</section>

      {/* Perfil */}
      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl space-y-10 text-lg font-light leading-9 text-white/70">
          <PreviewItem title="Perfil do viajante" text="Casal com 2 filhos maiores de 12 anos" />
          <PreviewItem title="Cidade" text="Osaka" />
          <PreviewItem title="Estilo de curadoria" text="Alpinea Private" />
          <PreviewItem
            title="Dinâmica do dia"
            text="Motorista privado porta a porta, parque do horário de abertura às 16:00, descanso no hotel e jantar omakase com reserva confirmada."
          />
        </div>
      </section>

      {/* Card do Dia */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">Dia 8</p>
            <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl">Osaka</h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Dia dedicado ao Universal Studios Japan, com entrada no horário de
              abertura para maximizar a experiência nas principais atrações antes
              do aumento de filas. Saída do parque às 16:00 para descanso no hotel
              antes do jantar.
            </p>

            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Hospedagem</p>
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.25fr_0.95fr] lg:items-center">
                <div className="flex min-h-40 items-center justify-center border border-white/10 bg-white px-8 py-10">
                <Image
                  src="/images/Four-Seasons-Logo.png"
                  alt="Four Seasons Osaka"
                  width={520}
                  height={260}
                  className="mx-auto h-auto w-full max-w-[260px] object-contain"
                />
                </div>
                <div>
                  <p className="text-3xl font-light text-white md:text-4xl">Four Seasons Osaka</p>
                  <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-white/60">
                    2-1-1 Dojimahama, Kita-ku, Osaka 530-0004, Japão
                  </p>
                </div>
                <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Noite</p>
                    <p className="text-lg text-white">8ª de 10</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Código da Reserva</p>
                    <p className="text-sm text-white/45">FS-OSK-4821</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manhã — Deslocamento */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã</p>
          <div className="max-w-4xl space-y-8 text-lg font-light leading-9 text-white/70">
            <p>
              <span className="text-white">Local:</span> Universal Studios Japan — Sakurajima, Konohana-ku, Osaka
            </p>
            <p>
              Motorista privado coordenado pela Alpinea busca a família na porta
              do Four Seasons Osaka e conduz diretamente até o Universal Studios
              Japan. A experiência é porta a porta, sem conexão por metrô, sem
              validação de passes e sem necessidade de caminhar com crianças ou
              compras entre estações.
            </p>
          </div>
        </div>
      </section>

      {/* Tarde — Atração Principal */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
          <div className="space-y-12 text-lg font-light leading-9 text-white/70">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã · Tarde</p>
              <p><span className="text-white">Local:</span> Universal Studios Japan · Osaka</p>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Acesso ao Parque</p>
              <div className="space-y-8">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Motorista privado</p>
                  <p className="text-white">Busca na porta do Four Seasons Osaka e desembarque próximo à entrada principal do USJ.</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Partida do Hotel</p>
                  <p>Recomendamos saída às <span className="text-white">08:00</span> para chegada ao parque por volta de <span className="text-white">08:40–08:45</span>, antes da abertura.</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Retorno</p>
                  <p>Motorista privado aguarda em ponto combinado para retorno ao Four Seasons Osaka às <span className="text-white">16:00</span>.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Tempo de Deslocamento</p>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Hotel → USJ</p>
                  <p className="text-white">Aproximadamente 35 minutos</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">USJ → Hotel</p>
                  <p className="text-white">Aproximadamente 35–45 minutos</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Recomendação Alpinea</p>
              <p className="max-w-[32rem]">
                Chegada antes da abertura faz diferença significativa no USJ.
                As primeiras duas horas são as menos congestionadas do dia —
                ideal para cobrir Super Nintendo World e Harry Potter logo cedo,
                antes que as filas se formem. Com 4 pessoas e crianças acima de
                12 anos, todas as atrações estão disponíveis. O Express Pass
                não é obrigatório se a estratégia de entrada for seguida, mas
                pode ser adicionado para Super Nintendo World mediante solicitação
                prévia à Alpinea.
              </p>
            </div>

            <div className="border-t border-white/10 pt-12">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Atração</p>
              <h3 className="text-3xl font-light text-white md:text-4xl">Universal Studios Japan</h3>
              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Abertura</p>
                  <p className="text-white">09:00</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Saída prevista</p>
                  <p className="text-white">16:00</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Ingresso</p>
                  <p className="text-white">Confirmado</p>
                </div>
              </div>
            </div>

            <InfoBlock title="Horário de funcionamento" text="09:00 às 21:00 (horário de verão pode variar)" />

            <div>
              <p className="text-white">Roteiro sugerido dentro do parque</p>
              <div className="mt-4 space-y-4">
                <p><span className="text-white/80">09:00 –</span> Entrada. Seguir direto para Super Nintendo World — fila menor logo na abertura.</p>
                <p><span className="text-white/80">10:30 –</span> Wizarding World of Harry Potter. Butterbeer e Hogsmeade Village antes do movimento.</p>
                <p><span className="text-white/80">12:00 –</span> Almoço. Três Vassouras (Harry Potter) ou Three Broomsticks — comida aceitável, atmosfera ótima.</p>
                <p><span className="text-white/80">13:00 –</span> Jurassic Park: The Flying Dinosaur — atração mais disputada do parque.</p>
                <p><span className="text-white/80">14:00 –</span> Minion Park e Despicable Me Minion Mayhem.</p>
                <p><span className="text-white/80">15:00 –</span> Exploração livre. Lojas, Amity Village, Jaws.</p>
                <p><span className="text-white/80">16:00 –</span> Saída do parque e retorno ao Four Seasons.</p>
              </div>
            </div>

            <InfoBlock
              title="Sobre o Super Nintendo World"
              text="A área temática mais imersiva do parque e provavelmente do mundo. Requer ingresso específico de acesso à área (área pass) que é emitido por QR code no app do USJ — limitado por janelas de tempo. A Alpinea orientará sobre o procedimento de emissão antes do dia da visita. Com chegada na abertura, a chance de conseguir o primeiro horário disponível é alta."
            />
            <InfoBlock
              title="Sobre o Harry Potter"
              text="Hogsmeade Village é a área mais fotogênica do parque. A atração principal — Harry Potter and the Forbidden Journey — é um simulador em movimento que pode causar enjoo leve. Para quem prefere algo mais suave, Flight of the Hippogriff é uma montanha-russa exterior mais tranquila."
            />
            <InfoBlock
              title="Compras"
              text="Super Nintendo World tem loja exclusiva com produtos não disponíveis fora do parque, incluindo itens de Mario, Yoshi e Donkey Kong. Harry Potter tem loja dedicada a varitas, mantos e itens temáticos. Recomendamos comprar na saída para não carregar peso durante o dia."
            />
          </div>

          {/* Coluna direita sticky */}
          <div className="lg:sticky lg:top-28">
            <Image
              src="/images/usj-main.png"
              alt="Universal Studios Japan"
              width={1200}
              height={1800}
              priority
              className="max-h-[760px] w-full rounded-2xl border border-white/10 bg-white/[0.03] object-contain p-4"
            />
            <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/35">
              Universal Studios Japan · Sakurajima · Osaka
            </p>
            <div className="mt-12">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
                Mapa do Parque
              </p>
              <a href="/images/usjmap.png" target="_blank" rel="noopener noreferrer" className="block">
                <Image
                  src="/images/usjmap.png"
                  alt="Mapa do Universal Studios Japan"
                  width={1200}
                  height={900}
                  className="max-h-[520px] w-full cursor-zoom-in rounded-2xl border border-white/10 bg-white/[0.03] object-contain p-4 transition hover:opacity-85"
                />
              </a>
              <p className="mt-4 text-sm leading-7 text-white/45">
                Mapa completo do Universal Studios Japan com todas as áreas
                temáticas: Super Nintendo World, Wizarding World of Harry Potter,
                Jurassic Park, Minion Park, Hollywood, New York, Amity Village e
                Water World.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurantes no parque */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
              Alimentação no parque
            </p>
            <p className="text-lg font-light leading-9 text-white/70">
              O USJ oferece uma quantidade extensa de opções de alimentação
              dentro das áreas temáticas. As melhores experiências gastronômicas
              do parque ficam em Harry Potter e no Nintendo World — onde os
              alimentos têm identidade visual e sabores únicos.
            </p>
            <div className="mt-16 space-y-14">
              <RestaurantBlock
                name="Three Broomsticks"
                description="Restaurante principal da área de Harry Potter, com pratos de inspiração britânica servidos num salão com atmosfera do universo da saga. A Butterbeer — cerveja de manteiga não alcoólica — é obrigatória."
                location="Wizarding World of Harry Potter"
                price="Aproximadamente ¥1.500–¥2.500 por pessoa"
                hours="A partir da abertura do parque"
              />
              <RestaurantBlock
                name="Toadstool Café"
                description="Restaurante temático do Super Nintendo World com pratos inspirados em cogumelos, Koopa Troopa e outros elementos do universo Mario. Ambiente extremamente imersivo — os pratos têm apresentação cuidadosa e estética de jogo."
                location="Super Nintendo World"
                price="Aproximadamente ¥2.000–¥3.500 por pessoa"
                hours="A partir da abertura do parque · sujeito a fila de espera"
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-28 space-y-12">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Nota sobre alimentação
              </p>
              <p className="text-lg font-light leading-9 text-white/60">
                O Toadstool Café costuma ter fila de 30 a 60 minutos nos
                horários de pico. Recomendamos chegar antes das 11:30 para
                garantir mesa sem longa espera. A experiência gastronômica do
                parque é parte da imersão — vale incluir no roteiro como
                atração em si, não apenas como pausa para almoço.
              </p>
            </div>
            <div className="border-t border-white/10 pt-12">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Aviso Alpinea</p>
              <p className="text-lg font-light leading-9 text-white/60">
                Dada a reserva de jantar às 19:00 num omakase, recomendamos
                refeições leves no parque — priorize petiscos e snacks temáticos
                em vez de refeições completas no almoço. Chegar com apetite para
                o Amano é essencial para aproveitar a experiência completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jantar — Omakase Amano */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Noite</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">Jantar Omakase</h3>
              </div>

              <div className="border-t border-white/10 pt-10">
                <h4 className="text-2xl font-light text-white">Restaurante Amano</h4>
                <p className="mt-4 max-w-xl">
                  Sushi omakase de alto nível em Osaka, com balcão dedicado e
                  menu inteiramente definido pelo chef. A experiência combina
                  técnica apurada de Edomae com ingredientes sazonais de
                  primeira linha — uma das mais consistentes da cidade fora
                  dos estabelecimentos com estrela Michelin.
                </p>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Horário da Reserva</p>
                    <p className="text-white text-xl">19:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Formato</p>
                    <p className="text-white">Omakase · Balcão</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Reserva</p>
                    <p className="text-white">Confirmada · Alpinea Private</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Código</p>
                    <p className="text-sm text-white/45">AMN-OSK-0812</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Preço estimado</p>
                    <p className="text-white">¥25.000–¥35.000 por pessoa</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Duração estimada</p>
                    <p className="text-white">Aproximadamente 2 horas</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10">
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Deslocamento Hotel → Amano</p>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Motorista privado</p>
                    <p className="text-white">Aproximadamente 15–20 minutos</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Saída sugerida</p>
                    <p className="text-white">18:30 do Four Seasons</p>
                  </div>
                </div>
              </div>

              <InfoBlock
                title="O que esperar"
                text="Num omakase de balcão, o chef serve cada peça individualmente, explicando o peixe, a origem e a técnica. A interação é parte da experiência — não há cardápio fixo; o chef adapta o menu ao que há de melhor disponível naquele dia. Recomendamos perguntar sobre cada peixe: os chefs no Japão apreciam clientes curiosos."
              />
              <InfoBlock
                title="Código de vestimenta"
                text="Smart casual. O ambiente é íntimo e refinado — evitar bermudas ou roupas muito informais depois de um dia no parque. O hotel disponibiliza amenidades para que a família possa se trocar confortavelmente antes do jantar."
              />
              <InfoBlock
                title="Política de cancelamento"
                text="Reserva confirmada com cartão de crédito. Cancelamentos com menos de 48 horas de antecedência estão sujeitos a cobrança integral do menu. Em caso de imprevisto, comunicar imediatamente à Alpinea para gestão junto ao restaurante."
              />
              <InfoBlock
                title="Sobre omakase com crianças maiores"
                text="Com filhos acima de 12 anos, a experiência omakase é plenamente acessível. O único ponto de atenção são restrições alimentares: se houver aversão a algum peixe específico, comunicar à Alpinea com antecedência para que o chef seja informado. Não é necessário comer tudo — mas a abertura para experimentar o que o chef prepara enriquece muito a experiência."
              />
            </div>

            <div className="lg:sticky lg:top-28 space-y-10">
              <div className="border border-white/10 bg-white/[0.03] p-10">
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                  Resumo do Dia 8
                </p>
                <div className="space-y-8 text-base leading-8 text-white/65">
                  <div className="flex items-start gap-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">08:00</span>
                    <p>Motorista privado busca no Four Seasons Osaka</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">09:00</span>
                    <p>Entrada no USJ — Super Nintendo World (prioridade)</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">10:30</span>
                    <p>Wizarding World of Harry Potter</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">12:00</span>
                    <p>Almoço leve no parque — Toadstool Café ou Three Broomsticks</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">13:00</span>
                    <p>Jurassic Park · Minion Park · Exploração livre</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">16:00</span>
                    <p>Motorista privado — retorno ao hotel</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">18:30</span>
                    <p>Motorista privado para jantar</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">19:00</span>
                    <p className="text-white">Omakase · Restaurante Amano · Reserva confirmada</p>
                  </div>
                  <div className="flex items-start gap-6 border-t border-white/[0.07] pt-6">
                    <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">21:00</span>
                    <p>Motorista privado — retorno ao Four Seasons Osaka</p>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-10">
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                  Alpinea Private · Suporte no dia
                </p>
                <p className="text-base leading-8 text-white/60">
                  No plano Alpinea Private, um representante da Alpinea estará
                  presente no parque para acompanhamento presencial, orientação
                  de filas e coordenação com o guia local. Suporte de concierge
                  disponível das 09:00 às 21:00 pelo canal de atendimento dedicado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Próximo passo
          </p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Uma viagem excepcional começa com uma curadoria excepcional.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/60">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea
            estrutura o roteiro a partir do seu perfil.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
            >
              Entrar em Contato
            </a>
            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/20 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/70 transition hover:border-black hover:text-black"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">Alpinea</p>
            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/50">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/25">
                <a href="/legal" className="transition hover:text-white/60">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/60">Política de Privacidade</a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">{title}</p>
      <p>{text}</p>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-white">{title}</p>
      <p className="mt-2">{text}</p>
    </div>
  );
}

function RestaurantBlock({
  name,
  description,
  location,
  price,
  hours,
}: {
  name: string;
  description: string;
  location: string;
  price: string;
  hours: string;
}) {
  return (
    <div className="border-t border-white/10 pt-8">
      <h3 className="text-2xl font-light text-white">{name}</h3>
      <p className="mt-4 text-lg font-light leading-9 text-white/65">{description}</p>
      <div className="mt-6 space-y-3 text-base leading-8 text-white/55">
        <p><span className="text-white/80">Local:</span> {location}</p>
        <p><span className="text-white/80">Preço:</span> {price}</p>
        <p><span className="text-white/80">Horário:</span> {hours}</p>
      </div>
    </div>
  );
}
