export default function ServicesPage() {
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
          <a href="#contact" className="transition hover:text-white">
            Contato
          </a>
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
        description="Para viajantes que desejam conduzir a própria viagem, mas não abrem mão da assessoria especializada da Alpinea."
        items={["Criação ou revisão de roteiro personalizado"]}
        optionals={[
          "Emissão de passagens aéreas",
          "Emissão de ingressos para Tokyo Disneyland, Universal Studios Japan e teamLab",
          "JR Pass",
          "Seguro viagem",
          "Guia turístico",
          "Transporte privado para bate e volta para Kawaguchiko(Monte Fuji)",
        ]}
        exclusions={[
          "Reservas de restaurantes",
          "Reservas de hotéis",
          "Acompanhamento presencial durante a viagem",
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
          "Concierge para suporte remoto durante a estadia",
]}
  exclusions={[
    "Acompanhamento presencial em restaurantes, compras e atrações turisticas",
  
  
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
          "Concierge com suporte prioritário durante a viagem",
        ]}
      />


{/* COMPARATIVO */}

<section className="border-t border-white/10 bg-black px-8 py-32 md:px-16">
  <div className="mx-auto max-w-7xl">

    <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
      Comparativo de Serviços
    </p>

    <h2 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight text-white md:text-7xl">
      O que muda entre
      <br />
      cada formato.
    </h2>

    <p className="mt-10 max-w-3xl text-lg font-light leading-9 text-white/65">
      Todos os formatos compartilham a mesma curadoria, conhecimento de destino
      e acesso à rede de fornecedores da Alpinea. A diferença está no nível de
      execução e presença ao longo da jornada.
    </p>

    <div className="mt-20 overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-6 text-xs uppercase tracking-[0.35em] text-white/30">
              Serviço
            </th>

            <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">
              Design
            </th>

            <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">
              Executive
            </th>

            <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">
              Private
            </th>
          </tr>
        </thead>

        <tbody className="text-white/80">

          <tr className="border-b border-white/10">
            <td className="py-5">Criação ou revisão de roteiro</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Emissão de passagens aéreas</td>
            <td className="text-center text-white/60">Opcional</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Reserva de hotéis</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Organização de transporte privado</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Curadoria gastronômica</td>
            <td className="text-center text-white/60">Sugestões</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Reservas em restaurantes</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Planejamento de compras</td>
            <td className="text-center text-white/60">Sugestões</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">JR Pass</td>
            <td className="text-center text-white/60">Opcional</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Ingressos e atrações</td>
            <td className="text-center text-white/60">Opcional</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Seguro viagem</td>
            <td className="text-center text-white/60">Opcional</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Concierge remoto durante a viagem</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Acompanhamento em restaurantes</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
          </tr>

          <tr className="border-b border-white/10">
            <td className="py-5">Acompanhamento para compras</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
          </tr>

          <tr>
            <td className="py-5">Acompanhamento em atrações turísticas</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center text-white/25">—</td>
            <td className="text-center">✓</td>
          </tr>

        </tbody>
      </table>
    </div>

  </div>
</section>


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
  optionals,
  exclusions,
}: {
  label: string;
  title: string;
  description: string;
  items: string[];
  optionals?: string[];
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

          {optionals && optionals.length > 0 && (
            <div className="mt-12">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Opcionais
              </p>

              <div className="space-y-5 text-lg font-light leading-9 text-white/65">
                {optionals.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          )}

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