import Image from "next/image";

export const metadata = {
  title: "Alpinea | Curadoria e Reserva de Restaurantes",
  description:
    "Curadoria Alpinea para acesso e reserva nos melhores restaurantes do Japão — sushi, kaiseki, tempurá e contemporâneo.",
};

export default function GastroPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/preview" className="transition hover:text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-[640px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-52">
        <div className="absolute inset-0">
          <Image
            src="/images/gastro-hero.png"
            alt="Entrada de restaurante japonês de referência com noren marrom"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/40">
            Gastronomia · Alpinea Private
          </p>
          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Curadoria e Reserva de Restaurantes
          </h1>
          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/60">
            Nos principais restaurantes do Japão, reservas são extremamente limitadas e disputadas com meses — ou até anos — de antecedência.
          </p>
        </div>
      </section>

      {/* Divisor */}
      <div className="border-t border-white/10" />

      {/* O Mercado */}
      <section className="px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div className="flex flex-col gap-10">
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">O Acesso</p>
                <h2 className="text-3xl font-light text-white md:text-4xl">Por que é difícil reservar bem no Japão</h2>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/saotome.png"
                  alt="Chef Tetsuya Saotome — Mikawa Zezankyo"
                  width={600}
                  height={800}
                  className="w-full object-cover"
                />
              </div>
              <p className="text-xs leading-6 text-white/25">
                Chef Tetsuya Saotome · Mikawa Zezankyo · mais de 60 anos de ofício
              </p>
            </div>
            <div className="space-y-0">
              {/* Bloco principal */}
              <div className="border-t border-white/10 pt-10 pb-6">
                <p className="text-base font-light leading-9 text-white/60">
                  A Alpinea viabiliza acesso a casas estreladas pelo Guia Michelin, referências no Tabelog e endereços quase impossíveis de reservar por conta própria, sempre com curadoria privada e atenção absoluta aos detalhes.
                </p>
                <p className="mt-6 text-base font-light leading-9 text-white/60">
                  Mais do que uma reserva, proporcionamos experiências gastronômicas exclusivas, construídas através de relacionamento, repertório e profundo entendimento da cena culinária japonesa.
                </p>
              </div>

              {/* Stat 1 */}
              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[160px_1fr] items-start">
                <div className="leading-none pt-1">
                  <p className="text-4xl font-light text-white/20 tabular-nums leading-none">2</p>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/20 mt-1">anos</p>
                </div>
                <div>
                  <p className="text-white font-light text-base leading-7">de espera nos endereços mais disputados</p>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    Casas como Sushi Saito e Sukiyabashi Jiro operam com lista de espera que ultrapassa dois anos. O acesso sem intermediação qualificada é, na prática, impossível para quem não tem relação direta com o chef ou com a casa.
                  </p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[160px_1fr] items-start">
                <p className="text-4xl font-light text-white/20 tabular-nums leading-none pt-1">日本語</p>
                <div>
                  <p className="text-white font-light text-base leading-7">barreira de idioma e cultura</p>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    A maioria dos restaurantes de referência no Japão não opera em inglês — nem nos sistemas de reserva, nem nos menus, nem nas interações com o chef. A fluência em japonês e o entendimento cultural são pré-requisitos reais para a experiência funcionar no nível esperado.
                  </p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[160px_1fr] items-start">
                <p className="text-4xl font-light text-white/20 tabular-nums leading-none pt-1">~30</p>
                <div>
                  <p className="text-white font-light text-base leading-7">restaurantes de referência absoluta no Japão</p>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    Em um país com dezenas de milhares de estabelecimentos, identificar os 30 endereços que operam no nível mais alto — e saber qual deles faz sentido para cada perfil de cliente — exige anos de visitas, relações e repertório acumulado.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10">
                <p className="text-sm leading-7 text-white/35 italic">
                  A curadoria Alpinea existe para eliminar esse atrito — e para garantir que o cliente sente na mesa certa, no momento certo, sem deixar nada ao acaso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfil do Cliente */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Caso Executado</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">Perfil do cliente</h2>
            </div>
            <div className="space-y-6 text-base font-light leading-9 text-white/60">
              <p>
                Entusiasta de gastronomia com trajetória consolidada nas melhores mesas do mundo. Já percorreu a França e a Espanha em profundidade — com passagem por casas como Asador Etxebarri e Arpège — e realizou uma primeira viagem ao Japão por conta própria.
              </p>
              <p>
                Dessa experiência, voltou com um gosto amargo: a dificuldade de traçar paralelos entre os restaurantes de referência japoneses e o universo que já conhecia, somada à limitação do concierge do hotel em realizar mais de duas reservas em casas de elite, resultou em uma jornada aquém do que o destino pode oferecer.
              </p>
              <p>
                Dessa vez, o cliente nos procurou com um objetivo claro: realizar uma jornada gastronômica de 7 dias para conhecer o que há de melhor no Japão, com foco central em restaurantes de sushi.
              </p>
              <div className="border-t border-white/10 pt-8">
                <p className="mb-5 text-xs uppercase tracking-[0.25em] text-white/30">Escopo da curadoria</p>
                <div className="space-y-3 text-sm leading-7 text-white/55">
                  <p>1. Selecionar e reservar 7 restaurantes ao longo de 7 dias em Tokyo e Kyoto</p>
                  <p>2. Garantir acesso a casas fora do alcance de reservas convencionais</p>
                  <p>3. Prover acompanhamento logístico completo, incluindo transporte porta a porta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Execução — Seleção */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            {/* Esquerda */}
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Execução</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">Seleção</h2>
              <p className="mt-6 text-sm font-light leading-8 text-white/45">
                Com 7 dias disponíveis, a curadoria foi estruturada para cobrir as principais expressões da alta gastronomia japonesa, sem repetição de categoria e com progressão intencional de ritmo ao longo da semana.
              </p>

              <div className="mt-10 border-t border-white/10 pt-10">
                <div className="space-y-5 text-sm font-light leading-8 text-white/50">
                  <div className="grid grid-cols-[80px_1fr] gap-4">
                    <span className="text-white/25 tabular-nums">3</span>
                    <span>restaurantes de sushi</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4">
                    <span className="text-white/25 tabular-nums">1</span>
                    <span>restaurante de tempurá</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4">
                    <span className="text-white/25 tabular-nums">1</span>
                    <span>restaurante contemporâneo</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4">
                    <span className="text-white/25 tabular-nums">1</span>
                    <span>restaurante kaiseki</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4">
                    <span className="text-white/25 tabular-nums">1</span>
                    <span>restaurante de wagyu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direita — categorias */}
            <div className="space-y-0">
              <p className="mb-10 text-xs uppercase tracking-[0.35em] text-white/35">Contexto da escolha</p>

              {/* Sushi */}
              <div className="border-t border-white/10 py-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Sushi</p>
                <h3 className="text-2xl font-light text-white mb-4">3 escolas diferentes</h3>
                <p className="text-sm leading-7 text-white/55">
                  O sushi contemporâneo no Japão é dominado por duas linhagens principais: a escola de Jiro Ono (Sukiyabashi Jiro) e a escola de Keiji Nakazawa (Sushi Sho). A curadoria contemplou um representante de cada escola, com um terceiro restaurante representando a nova geração de líderes do cenário.
                </p>
                <div className="mt-6 space-y-4 text-sm leading-7 text-white/50">
                  <p>
                    <span className="text-white/80">Harutaka</span> — 3 estrelas Michelin. O representante de maior prestígio da escola Jiro Ono no Japão hoje, frequentemente apontado entre os 5 melhores restaurantes de sushi do país.
                  </p>
                  <p>
                    <span className="text-white/80">Sushi Sho Masa</span> — Masakatsu Oka, discípulo mais antigo em atividade de Keiji Nakazawa. O chef tornou-se referência após Keiji partir para os Estados Unidos, onde abriu o restaurante de sushi mais rápido a conquistar 3 estrelas Michelin na história americana.
                  </p>
                  <p>
                    <span className="text-white/80">Sushi Arai</span> — Frequentemente entre os 5 melhores do Japão, representa a nova geração ao lado de nomes como Sugita, Saito e Amamoto.
                  </p>
                </div>
              </div>

              {/* Tempurá */}
              <div className="border-t border-white/10 py-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Tempurá</p>
                <h3 className="text-2xl font-light text-white mb-4">Mikawa Zezankyo</h3>
                <p className="text-sm leading-7 text-white/55">
                  Liderado pelo chef Tetsuya Saotome, uma das lendas vivas do tempurá com mais de 60 anos de experiência. Um dos últimos shokunins que executa cada peça com o rigor e a precisão acumulados ao longo de décadas de ofício.
                </p>
              </div>

              {/* Wagyu */}
              <div className="border-t border-white/10 py-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Wagyu</p>
                <h3 className="text-2xl font-light text-white mb-4">Niku Kappou Miyata</h3>
                <p className="text-sm leading-7 text-white/55">
                  Um dos poucos menus-degustação de wagyu no Japão com amplitude real — da apresentação em formato de sushi com caviar negro até o wagyusando. Uma jornada completa pela carne mais valorizada do mundo em suas formas mais refinadas.
                </p>
              </div>

              {/* Kaiseki */}
              <div className="border-t border-white/10 py-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Kaiseki</p>
                <h3 className="text-2xl font-light text-white mb-4">Ogata · Kyoto</h3>
                <p className="text-sm leading-7 text-white/55">
                  Um dos líderes do kaiseki contemporâneo, o Ogata prima pela qualidade extrema das matérias-primas — cogumelo matsutake de primeira categoria, king crab — com apresentações que encontram o equilíbrio entre a tradição japonesa e a leitura do paladar ocidental. A escolha intencional: kaiseki clássicos seguem uma linha que ocidentais frequentemente têm dificuldade de acompanhar em profundidade.
                </p>
              </div>

              {/* Contemporâneo */}
              <div className="border-t border-white/10 py-10">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Contemporâneo</p>
                <h3 className="text-2xl font-light text-white mb-4">Sazenka · Tokyo</h3>
                <p className="text-sm leading-7 text-white/55">
                  Inspirado na culinária chinesa, o Sazenka traz releituras de clássicos utilizando técnica de preparo de alto nível, apresentação de fine dining e ingredientes da cozinha japonesa de elite. Uma fusão construída com repertório, não com experimentação — e uma das escolhas mais surpreendentes da semana para o perfil do cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roteiro */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-12 text-xs uppercase tracking-[0.35em] text-white/35">Roteiro de Visitas</p>

          {/* Grid de imagens dos restaurantes */}
          <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/harutaka.png"
                  alt="Harutaka — sushi nigiri de otoro"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Harutaka</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Sushi · Tokyo</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/zezankyo.jpeg"
                  alt="Mikawa Zezankyo — camarão tempurá"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Mikawa Zezankyo</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Tempurá · Tokyo</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/sazenka.png"
                  alt="Sazenka — culinária contemporânea sino-japonesa"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Sazenka</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Contemporâneo · Tokyo</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/sushi-sho.png"
                  alt="Sushi Sho Masa — nigiri"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Sushi Sho Masa</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Sushi · Tokyo</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/nikufood.jpeg"
                  alt="Niku Kappou Miyata — wagyu com caviar"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Niku Kappou Miyata</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Wagyu · Kyoto</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/ogata.png"
                  alt="Ogata — matsutake premium kaiseki"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Ogata</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Kaiseki · Kyoto</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/sushi-arai.png"
                  alt="Sushi Arai — kohada"
                  width={420}
                  height={420}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-light text-white">Sushi Arai</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">Sushi · Tokyo</p>
              </div>
            </div>
          </div>

          {/* Dias */}
          <div className="space-y-0">
            {[
              {
                dia: "Dia 1",
                cidade: "Tokyo",
                restaurante: "Harutaka",
                descricao:
                  "Abertura da semana no restaurante de maior prestígio da escola Jiro Ono no Japão hoje. Com 3 estrelas Michelin, o Harutaka define o padrão de referência para os dias seguintes.",
                tag: "Sushi · 3 estrelas Michelin",
              },
              {
                dia: "Dia 2",
                cidade: "Tokyo",
                restaurante: "Mikawa Zezankyo",
                descricao:
                  "Almoço ou jantar com o chef Tetsuya Saotome, um dos últimos shokunins do tempurá com mais de 60 anos de ofício. Uma pausa deliberada no ritmo do sushi — e uma das experiências mais técnicas da semana.",
                tag: "Tempurá · Lenda viva",
              },
              {
                dia: "Dia 3",
                cidade: "Tokyo",
                restaurante: "Sazenka",
                descricao:
                  "O contemporâneo sino-japonês do Sazenka oferece o contraponto mais surpreendente da semana: técnica de alto nível com referências que o cliente reconhece da grande cozinha europeia, reapresentadas com ingredientes de elite japoneses.",
                tag: "Contemporâneo · 2 estrelas Michelin",
              },
              {
                dia: "Dia 4",
                cidade: "Tokyo",
                restaurante: "Sushi Sho Masa",
                descricao:
                  "A escola Nakazawa em sua expressão mais pura disponível no Japão. Com Keiji radicado nos Estados Unidos, Masakatsu Oka é o principal guardião vivo desta linhagem em Tokyo.",
                tag: "Sushi · Escola Nakazawa",
              },
              {
                dia: "Dia 5",
                cidade: "Kyoto",
                restaurante: "Niku Kappou Miyata",
                descricao:
                  "Menu-degustação de wagyu com amplitude incomum — do sushi de wagyu com caviar negro ao wagyusando. Um dos poucos formatos que percorre toda a expressão da carne mais valorizada do mundo em uma única refeição.",
                tag: "Wagyu · Menu degustação",
              },
              {
                dia: "Dia 6",
                cidade: "Kyoto",
                restaurante: "Ogata",
                descricao:
                  "Chegada a Kyoto. Primeiro jantar na capital do kaiseki: o Ogata apresenta matérias-primas de nível absoluto — matsutake de primeira categoria, king crab — com uma linguagem de apresentação acessível ao paladar ocidental. A escolha intencional para quem não cresceu com a tradição kaiseki.",
                tag: "Kaiseki · Kyoto",
              },
              {
                dia: "Dia 7",
                cidade: "Tokyo",
                restaurante: "Sushi Arai",
                descricao:
                  "Retorno a Tokyo para o encerramento da semana. O Sushi Arai representa a nova geração — ao lado de Sugita, Saito e Amamoto — e oferece um fechamento que olha para o futuro do sushi japonês, com frequência entre os 5 melhores do país.",
                tag: "Sushi · Nova geração",
              },
            ].map((item) => (
              <div
                key={item.dia}
                className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-[180px_1fr] lg:items-start"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/25">{item.dia}</p>
                  <p className="mt-1 text-sm text-white/50">{item.cidade}</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-white font-light text-lg">{item.restaurante}</p>
                    <p className="mt-2 text-sm leading-7 text-white/55">{item.descricao}</p>
                    <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                      <span>{item.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Logística */}
            <div className="border-t border-white/10 pt-10 pb-2">
              <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/25">Logística</p>
                  <p className="mt-1 text-sm text-white/50">Todos os dias</p>
                </div>
                <div>
                  <p className="text-white font-light text-lg">Transporte porta a porta</p>
                  <p className="mt-2 text-sm leading-7 text-white/55">
                    No Japão, a maioria dos restaurantes de referência não tem endereço convencional — ficam em galerias de vários andares, em ruas sem nome, em sub-andares de edifícios comerciais. Nosso motorista particular busca o cliente na porta do hotel e deixa na entrada exata do restaurante em todos os dias da jornada.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    <span>Motorista particular incluído</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisão geográfica */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Distribuição</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">5 dias em Tokyo, 2 em Kyoto</h2>
              <p className="mt-6 text-sm font-light leading-8 text-white/40">
                A concentração em Tokyo reflete onde estão os restaurantes de sushi, tempurá e wagyu de maior referência. Kyoto responde pelo kaiseki — o formato que mais exige imersão no contexto da cidade para ser plenamente compreendido.
              </p>
            </div>

            <div className="space-y-0">
              <div className="border-t border-white/10 py-10 grid gap-6 sm:grid-cols-[120px_1fr] items-start">
                <p className="text-xs uppercase tracking-[0.2em] text-white/25 pt-1">Tokyo</p>
                <div className="space-y-2 text-sm leading-7 text-white/55">
                  <p>Harutaka · Sushi</p>
                  <p>Mikawa Zezankyo · Tempurá</p>
                  <p>Sazenka · Contemporâneo</p>
                  <p>Sushi Sho Masa · Sushi</p>
                  <p>Sushi Arai · Sushi</p>
                </div>
              </div>
              <div className="border-t border-white/10 py-10 grid gap-6 sm:grid-cols-[120px_1fr] items-start">
                <p className="text-xs uppercase tracking-[0.2em] text-white/25 pt-1">Kyoto</p>
                <div className="space-y-2 text-sm leading-7 text-white/55">
                  <p>Ogata · Kaiseki</p>
                  <p>Niku Kappou Miyata · Wagyu</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-10">
                <p className="text-sm leading-7 text-white/35 italic">
                  O deslocamento Tokyo–Kyoto é feito de Shinkansen, com duração de aproximadamente 2h15. A Alpinea coordena o traslado e as reservas de hospedagem em ambas as cidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="scroll-mt-32 border-t border-white/10 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/35">
            Próximo passo
          </p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Pronto para iniciar a curadoria?
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-base leading-9 text-black/50">
            Entre em contato para alinhar datas, perfil gastronômico e detalhes da jornada.
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
              className="border border-black/15 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/50 transition hover:border-black hover:text-black"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/70">Alpinea</p>
            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/40">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/25">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/20">
                <a href="/legal" className="transition hover:text-white/50">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/50">Política de Privacidade</a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/35">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
