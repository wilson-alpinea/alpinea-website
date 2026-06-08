import Image from "next/image";

export const metadata = {
  title: "Alpinea | Roteiros Personalizados para o Japão",
  description:
    "Roteiros personalizados para viajantes que buscam profundidade, conforto e experiências exclusivas no Japão.",
};

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">
            Início
          </a>
          <a href="/services" className="transition hover:text-white">
            Serviços
          </a>
          <a href="/preview" className="transition text-white">
            Roteiro
          </a>
          <a href="/preview#contact" className="transition hover:text-white">
            Contato
          </a>
        </nav>
      </header>

      <section className="relative min-h-[720px] overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <Image
          src="/images/ginzanonsen.jpg"
          alt="Ginzan Onsen"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Roteiro Alpinea
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Um exemplo real
            <br />
            de uma jornada Alpinea.
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Uma prévia simplificada da forma como estruturamos roteiros:
            contexto, ritmo, logística, atrações, horários recomendados,
            restaurantes e oportunidades de compras.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl space-y-10 text-lg font-light leading-9 text-white/70">
          <PreviewItem title="Perfil do viajante" text="Casal sem filhos" />
          <PreviewItem title="Cidades sugeridas" text="Tokyo, Osaka e Kyoto" />
          <PreviewItem
            title="Ritmo da viagem"
            text="Bastante tempo livre, com uma atração turística no período da manhã e uma à tarde. Noites livres para descanso, compras ou experiências espontâneas."
          />
          <PreviewItem title="Estilo de curadoria" text="Alpinea Design" />
          <PreviewItem title="Duração da viagem" text="15 Dias" />
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">
              Dia 1
            </p>

            <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl">
              Tokyo
            </h2>

            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Chegada ao Japão, acomodação inicial e primeira experiência em
              Oshiage, com visita à Tokyo Skytree e exploração do complexo Tokyo
              Solamachi.
            </p>

            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
                Hospedagem
              </p>

              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr_1fr] lg:items-center">
                <Image
                  src="/images/grandhyattlogo.png"
                  alt="Grand Hyatt Tokyo"
                  width={520}
                  height={260}
                  className="w-full max-w-xs object-contain"
                />

                <div>
                  <p className="text-3xl font-light text-white md:text-4xl">
                    Grand Hyatt Tokyo
                  </p>

                  <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-white/60">
                    6 Chome-10-3 Roppongi, Minato City, Tokyo 106-0032, Japão
                  </p>
                </div>

                <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                      Check-In
                    </p>
                    <p className="text-lg text-white">15:00</p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">
                      Código da Reserva
                    </p>
                    <p className="text-sm text-white/45">H7K9Q2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Manhã
          </p>

          <div className="max-w-4xl space-y-8 text-lg font-light leading-9 text-white/70">
            <p>
              <span className="text-white">Local:</span> Aeroporto Internacional
              de Narita — Terminal 3
            </p>

            <p>
              Instruções gerais de chegada, imigração, retirada de bagagem,
              restaurantes sugeridos no aeroporto, ações obrigatórias antes de
              sair do aeroporto, comentários gerais e guia de deslocamento até o
              hotel.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
          <div className="space-y-12 text-lg font-light leading-9 text-white/70">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
                Tarde
              </p>

              <p>
                <span className="text-white">Local:</span> Oshiage, Tokyo
              </p>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Acesso à Estação
              </p>

              <Image
                src="/images/oshiage-lines.png"
                alt="Linhas ferroviárias disponíveis na estação Oshiage"
                width={640}
                height={260}
                className="w-full max-w-sm rounded-lg object-contain"
              />

              <p className="mt-4 text-sm leading-7 text-white/45">
                Oshiage Station é atendida pelas linhas Tobu Skytree Line,
                Keisei Oshiage Line, Toei Asakusa Line e Tokyo Metro Hanzomon
                Line.
              </p>

              <div className="mt-10 space-y-8">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Nome da Estação
                  </p>
                  <p className="text-white">
                    Oshiage Station 押上駅〈スカイツリー前〉
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Saída Recomendada
                  </p>

                  <p>
                    A2 ou B3 para superfície. Em dias de chuva, recomendamos
                    utilizar a conexão subterrânea direta com o Tokyo Solamachi.
                  </p>

                  <p className="mt-4 text-white">
                    連絡通路直結 Solamachi B3F
                  </p>

                  <p className="mt-4">
                    Caso encontre dificuldades, qualquer funcionário do metrô
                    poderá indicar a direção correta.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Tempo de Deslocamento
              </p>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Metrô
                  </p>
                  <p className="text-white">Aproximadamente 40 minutos</p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Carro / Táxi
                  </p>
                  <p className="text-white">Aproximadamente 35 minutos</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Recomendação Alpinea
              </p>

              <p className="max-w-[32rem]">
                A partir do Grand Hyatt Tokyo, a diferença de tempo entre metrô e
                carro/táxi é irrelevante. O táxi proporciona maior comodidade,
                mas a diferença de preço é grande. Em caso de chuva ou vento
                forte, recomendamos substituir por outra atração, pois, embora
                seja um local fechado, devido à altura, o observatório pode
                balançar mais que o normal.
              </p>
            </div>

            <div className="border-t border-white/10 pt-12">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Atração
              </p>

              <h3 className="text-3xl font-light text-white md:text-4xl">
                Tokyo Skytree
              </h3>

              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Melhor horário
                  </p>
                  <p className="text-white">16:30–18:30</p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Tempo estimado
                  </p>
                  <p className="text-white">1–2 horas</p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    Reserva
                  </p>
                  <p className="text-white">Recomendada</p>
                </div>
              </div>
            </div>

            <InfoBlock title="Horário de funcionamento" text="10:00 às 22:00" />

            <div>
              <p className="text-white">Ingressos</p>
              <div className="mt-2 space-y-2">
                <p>1. Visita ao 350º andar — Tembo Deck</p>
                <p>2. Visita ao 350º e 450º andar</p>
                <p>3. Ingresso separado para a Tembo Galleria</p>
              </div>
            </div>

            <div>
              <p className="text-white">Preço estimado</p>
              <div className="mt-2 space-y-2">
                <p>Tembo Deck: a partir de ¥1.800 por pessoa</p>
                <p>Tembo Deck + Tembo Galleria: a partir de ¥3.000</p>
                <p>Tembo Galleria avulsa: ¥1.400 por pessoa</p>
                <p>Crianças entre 6 e 14 anos pagam meia entrada.</p>
              </div>
            </div>

            <InfoBlock
              title="Horário recomendado"
              text="Chegada ao complexo Tokyo Solamachi às 17:00. Subida na torre por volta das 18:15 para acompanhar o pôr do sol."
            />

            <InfoBlock
              title="Tempo estimado de visita"
              text="Entre 1 e 2 horas após a subida ao observatório."
            />

            <InfoBlock
              title="Comentários"
              text="Eu normalmente compro o ingresso para o 350º andar, não vejo grande diferença entre os andares, não acho que vale a pena o restaurante e nem a galeria que ficam no topo da torre. As opções de comida na base são melhores, o complexo tem uma quantidade gigante de lojas. Recomendo passar nas lojas depois de subir para não precisar carregar peso. Todos os restaurantes costumam ter filas, se programe para chegar pelo menos 30 minutos antes do horário desejado para comer. Se não estiver com muita fome, a praça de alimentação tem ótimas opções para lanches como o Gindaco, que faz o típico bolinho de polvo frito, Takoyaki, da região de Kansai."
            />
          </div>

          <div className="lg:sticky lg:top-28">
            <Image
              src="/images/skytree.jpg"
              alt="Tokyo Skytree ao entardecer"
              width={1200}
              height={1800}
              priority
              className="h-[720px] w-full rounded-xl object-cover"
            />

            <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/35">
              Tokyo Skytree · Oshiage · Tokyo
            </p>

            <div className="mt-12">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
                Mapa do Complexo Tokyo Solamachi
              </p>

              <a
                href="/images/solamachi-floor1.png"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src="/images/solamachi-floor1.png"
                  alt="Mapa do primeiro andar do Tokyo Solamachi"
                  width={1200}
                  height={900}
                  className="w-full cursor-zoom-in rounded-xl object-contain transition hover:opacity-85"
                />
              </a>

              <p className="mt-4 text-sm leading-7 text-white/45">
                Visão geral do primeiro andar do complexo Tokyo Solamachi,
                incluindo acessos à estação Oshiage, áreas comerciais, serviços,
                cafés, restaurantes e principais pontos de circulação.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
              Restaurantes sugeridos
            </p>

            <p className="text-lg font-light leading-9 text-white/70">
              A Tokyo Skytree está integrada ao shopping Tokyo Solamachi, que
              reúne diversas opções de restaurantes, praça de alimentação e um
              mercado no subsolo com alternativas para takeout.
            </p>

            <div className="mt-16 space-y-14">
              <RestaurantBlock
                name="Hitsumabushi Bincho Tokyo Solamachi"
                description="Restaurante especializado em enguia, com destaque para o hitsumabushi, prato típico da província de Aichi."
                location="6º andar do Tokyo Solamachi"
                price="Aproximadamente ¥6.000 por pessoa"
                hours="11:00–21:00"
              />

              <RestaurantBlock
                name="Kaiten Sushi Toriton"
                description="Restaurante de sushi de esteira, conhecido por boa relação entre praticidade, qualidade e variedade."
                location="6º andar do Tokyo Solamachi"
                price="Aproximadamente ¥6.000 por pessoa"
                hours="11:00–22:00, último pedido às 21:30"
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
              Mapa — Solamachi Dining
            </p>

            <a
              href="/images/solamachi-dining-map.png"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="/images/solamachi-dining-map.png"
                alt="Mapa dos restaurantes do Tokyo Solamachi"
                width={1200}
                height={900}
                className="w-full cursor-zoom-in rounded-xl object-contain transition hover:opacity-85"
              />
            </a>
          </div>
        </div>
      </section>

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
    </main>
  );
}

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">
        {title}
      </p>
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

      <p className="mt-4 text-lg font-light leading-9 text-white/65">
        {description}
      </p>

      <div className="mt-6 space-y-3 text-base leading-8 text-white/55">
        <p>
          <span className="text-white/80">Local:</span> {location}
        </p>
        <p>
          <span className="text-white/80">Preço:</span> {price}
        </p>
        <p>
          <span className="text-white/80">Horário:</span> {hours}
        </p>
      </div>
    </div>
  );
}