export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">ALPINEA</a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      <section className="px-8 pb-20 pt-40 md:px-16 md:pt-48">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Serviços Alpinea
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Três formas de
            <br />
            vivenciar o Japão.
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Do planejamento estratégico à execução presencial, cada nível de
            serviço foi criado para diferentes perfis de viajantes — mantendo a
            mesma curadoria, discrição e precisão da Alpinea.
          </p>
        </div>
      </section>

      <ServiceSection
        label="Planejamento"
        title="Alpinea Design"
        description="Para viajantes que desejam conduzir a própria viagem com uma base estratégica, elegante e bem construída."
        items={[
          "Criação ou revisão de roteiro personalizado",
          "Distribuição por cidades, bairros e dias",
          "Recomendações de atrações conforme perfil",
          "Sugestões selecionadas de restaurantes",
          "Sugestões de compras e experiências",
          "Orientação logística entre cidades, hotéis e aeroportos",
          "PDF editorial",
          "Planilha operacional",
        ]}
        exclusions={[
          "Reservas de restaurantes",
          "Reservas de hotéis",
          "Emissão de passagens",
          "Acompanhamento durante a viagem",
        ]}
      />

      <ServiceSection
        label="Execução"
        title="Alpinea Executive"
        description="Para clientes que desejam planejamento completo, reservas, logística e organização antes da chegada ao Japão."
        items={[
          "Criação de roteiro personalizado",
          "Emissão de passagens aéreas",
          "Reserva de hotéis",
          "Organização de transporte privado",
          "Curadoria gastronômica",
          "Solicitação e gestão de reservas em restaurantes",
          "Planejamento de compras",
          "Recomendações de experiências e atrações",
          "Coordenação logística da viagem",
          "Suporte remoto durante a estadia",
        ]}
      />

      <ServiceSection
        label="Acompanhamento Presencial"
        title="Alpinea Private"
        description="Para clientes que desejam uma experiência com suporte local, acompanhamento presencial e execução dedicada no Japão."
        items={[
          "Criação de roteiro personalizado",
          "Emissão de passagens aéreas",
          "Reserva de hotéis",
          "Organização de transporte privado",
          "Curadoria gastronômica",
          "Solicitação e gestão de reservas em restaurantes",
          "Planejamento de compras",
          "Acompanhamento presencial em restaurantes",
          "Acompanhamento presencial para compras",
          "Acompanhamento presencial em atrações turísticas",
          "Coordenação local com fornecedores",
          "Suporte prioritário durante a viagem",
        ]}
      />

      <section id="contact" className="bg-white px-8 py-28 text-black md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Avaliação Inicial
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Cada viagem exige um nível diferente de presença.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/60">
            Compartilhe suas datas, expectativas e estilo de viagem. A Alpinea
            indicará o formato mais adequado para a sua jornada no Japão.
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

function ServiceSection({
  label,
  title,
  description,
  items,
  exclusions,
}: {
  label: string;
  title: string;
  description: string;
  items: string[];
  exclusions?: string[];
}) {
  return (
    <section className="border-t border-white/10 bg-black px-8 py-32 md:px-16">
      <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            {label}
          </p>

          <h2 className="text-5xl font-light leading-[1.05] tracking-tight text-white md:text-7xl">
            {title}
          </h2>

          <p className="mt-10 max-w-xl text-lg font-light leading-9 text-white/65">
            {description}
          </p>
        </div>

        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Serviços
          </p>

          <div className="space-y-5 text-lg font-light leading-9 text-white/75">
            {items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          {exclusions && (
            <div className="mt-12">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
                Não inclui
              </p>

              <div className="space-y-4 text-base leading-8 text-white/45">
                {exclusions.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}