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
          <a href="#contact" className="transition hover:text-white">
            Contato
          </a>
        </nav>
      </header>

      <section className="px-8 pb-20 pt-40 md:px-16 md:pt-48">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Amostra de Roteiro
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Um exemplo reduzido
            <br />
            de uma jornada Alpinea.
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Uma prévia simplificada da forma como estruturamos roteiros:
            contexto, ritmo, logística, atrações, horários recomendados e
            curadoria prática para cada dia da viagem.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
              Perfil da Viagem
            </p>

            <h2 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Casal.
              <br />
              Tempo livre.
              <br />
              Curadoria leve.
            </h2>
          </div>

          <div className="space-y-10 text-lg font-light leading-9 text-white/70">
            <PreviewItem title="Perfil do viajante" text="Casal sem filhos" />
            <PreviewItem title="Cidades sugeridas" text="Tokyo, Osaka e Kyoto" />
            <PreviewItem
              title="Ritmo da viagem"
              text="Bastante tempo livre, com uma atração turística no período da manhã e uma à tarde. Noites livres para descanso, compras ou experiências espontâneas."
            />
            <PreviewItem title="Estilo de curadoria" text="Alpinea Design" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
              Dia 1 — Tokyo
            </p>

            <h2 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Chegada.
              <br />
              Ajuste de ritmo.
              <br />
              Skytree ao entardecer.
            </h2>
          </div>

          <div className="space-y-16">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Manhã
              </p>

              <div className="space-y-5 text-lg font-light leading-9 text-white/70">
                <p>
                  <span className="text-white">Local:</span> Aeroporto
                  Internacional de Narita — Terminal 3
                </p>

                <p>
                  Instruções gerais de chegada, imigração, retirada de bagagem,
                  deslocamento até o hotel e ajuste inicial ao fuso horário.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Tarde
              </p>

              <div className="space-y-8 text-lg font-light leading-9 text-white/70">
                <p>
                  <span className="text-white">Local:</span> Oshiage, Tokyo
                </p>

                <p>
                  <span className="text-white">Atração turística:</span> Tokyo
                  Skytree
                </p>

                <div>
                  <p className="text-white">Horário de funcionamento</p>
                  <p className="mt-2">10:00 às 22:00</p>
                </div>

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

                <div>
                  <p className="text-white">Horário recomendado</p>
                  <p className="mt-2">
                    Chegada ao complexo Tokyo Solamachi às 17:00. Subida na
                    torre por volta das 18:15 para acompanhar o pôr do sol.
                  </p>
                </div>

                <div>
                  <p className="text-white">Tempo estimado de visita</p>
                  <p className="mt-2">
                    Entre 1 e 2 horas após a subida ao observatório.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
              Curadoria de Restaurantes
            </p>

            <h2 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Opções práticas
              <br />
              dentro do complexo.
            </h2>
          </div>

          <div className="space-y-14">
            <div className="space-y-5 text-lg font-light leading-9 text-white/70">
              <p>
                A Tokyo Skytree está integrada ao shopping Tokyo Solamachi, que
                reúne diversas opções de restaurantes, praça de alimentação e um
                mercado no subsolo com alternativas para takeout.
              </p>
            </div>

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

            <p className="text-base leading-8 text-white/45">
              O complexo também oferece outras opções de restaurantes e takeout
              no Food Marché, localizado no subsolo do shopping.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white px-8 py-28 text-black md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Próximo passo
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Transforme uma amostra em uma jornada completa.
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
          <span className="text-white/80">Preço por pessoa:</span> {price}
        </p>
        <p>
          <span className="text-white/80">Horário:</span> {hours}
        </p>
      </div>
    </div>
  );
}