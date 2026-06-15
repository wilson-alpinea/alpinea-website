export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
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

      <section className="relative overflow-hidden px-8 pb-28 pt-40 md:px-16 md:pt-48">
        <img
          src="/images/azumino.jpg"
          alt="Azumino, Japão"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Serviços Alpinea
          </p>
          <h1 className="max-w-5xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            Três opções de serviços
            <br />
            Uma mesma curadoria Alpinea.
          </h1>
          <p className="mt-10 max-w-2xl text-lg font-light leading-9 text-white/65">
            Escolha entre orientação estratégica, planejamento completo ou execução presencial no Japão — sempre com curadoria profunda, discrição e precisão operacional.
          </p>
        </div>
      </section>

      <ServiceSection
        label="Planejamento"
        title="Alpinea Design"
        description="Para viajantes que desejam conduzir a própria viagem com uma base estratégica, elegante e bem construída."
        roteiroLabel="Exemplo de Roteiro Alpinea Design"
        roteiroHref="/preview"
        items={["Criação ou revisão de roteiro personalizado"]}
        optionals={[
          "Emissão de passagens aéreas",
          "JR Pass",
          "Emissão de ingressos para Tokyo Disneyland, Universal Studios Japan e teamLab",
          "Seguro viagem",
        ]}
        exclusions={[
          "Reservas de restaurantes",
          "Reservas de hotéis",
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
          "Concierge para suporte remoto durante a estadia",
        ]}
        exclusions={[
          "Acompanhamento presencial em restaurantes",
          "Acompanhamento presencial para compras",
          "Acompanhamento presencial em atrações turísticas",
        ]}
      />

      <ServiceSection
        label="Acompanhamento Presencial"
        title="Alpinea Private"
        description="Para clientes que desejam uma experiência com suporte local, acompanhamento presencial e execução dedicada no Japão."
        featured
        roteiroLabel="Exemplo de Roteiro Alpinea Private"
        roteiroHref="/day8"
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
            Todos os formatos compartilham a mesma curadoria, conhecimento de
            destino e acesso à rede de fornecedores da Alpinea. A diferença está
            no nível de execução e presença ao longo da jornada.
          </p>

          <div className="mt-20 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 text-xs uppercase tracking-[0.35em] text-white/30">Serviço</th>
                  <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">Design</th>
                  <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">Executive</th>
                  <th className="py-6 text-center text-xs uppercase tracking-[0.35em] text-white">Private</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {[
                  ["Criação ou revisão de roteiro", "✓", "✓", "✓"],
                  ["Emissão de passagens aéreas", "Opcional", "✓", "✓"],
                  ["Reserva de hotéis", "—", "✓", "✓"],
                  ["Organização de transporte privado", "Opcional", "✓", "✓"],
                  ["Curadoria gastronômica", "Sugestões", "✓", "✓"],
                  ["Reservas em restaurantes", "—", "✓", "✓"],
                  ["Planejamento de compras", "Sugestões", "✓", "✓"],
                  ["JR Pass", "Opcional", "✓", "✓"],
                  ["Ingressos e atrações", "Opcional", "✓", "✓"],
                  ["Seguro viagem", "Opcional", "✓", "✓"],
                  ["Concierge remoto durante a viagem", "Opcional", "✓", "✓"],
                  ["Acompanhamento em restaurantes", "—", "—", "✓"],
                  ["Acompanhamento para compras", "—", "—", "✓"],
                  ["Acompanhamento em atrações turísticas", "—", "—", "✓"],
                ].map(([service, design, executive, privateTier]) => (
                  <tr key={service} className="border-b border-white/10">
                    <td className="py-5">{service}</td>
                    <td className={`text-center ${design === "—" ? "text-white/25" : design === "Opcional" || design === "Sugestões" ? "text-white/60" : "text-white"}`}>
                      {design}
                    </td>
                    <td className={`text-center ${executive === "—" ? "text-white/25" : "text-white"}`}>
                      {executive}
                    </td>
                    <td className="text-center text-white">{privateTier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROTEIRO */}
      <section className="border-t border-b border-white/10 bg-[#080706] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            Roteiro Alpinea
          </p>
          <h2 className="text-4xl font-light leading-tight text-white md:text-6xl">
            Veja um exemplo real de curadoria Alpinea.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-9 text-white/65">
            Explore uma prévia de como estruturamos hotéis, logística,
            restaurantes, atrações, mapas internos, compras e recomendações
            práticas para uma jornada no Japão.
          </p>
          <a
            href="/preview"
            className="mt-12 inline-block border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white hover:text-white"
          >
            Explorar Roteiro
          </a>
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
              Contato por Whatsapp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">
              Alpinea
            </p>
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

function ServiceSection({
  label,
  title,
  description,
  items,
  optionals,
  exclusions,
  featured = false,
  roteiroLabel,
  roteiroHref,
}: {
  label: string;
  title: string;
  description: string;
  items: string[];
  optionals?: string[];
  exclusions?: string[];
  featured?: boolean;
  roteiroLabel?: string;
  roteiroHref?: string;
}) {
  return (
    <section
      className={`border-t border-white/10 px-8 py-32 md:px-16 ${
        featured ? "bg-white/[0.035]" : "bg-black"
      }`}
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
            {label}
          </p>
          <h2 className="text-5xl font-light leading-tight tracking-tight md:text-7xl">
            {title}
          </h2>
          <p className="mt-8 max-w-2xl text-lg font-light leading-9 text-white/65">
            {description}
          </p>
          {roteiroLabel && roteiroHref && (
            <a
              href={roteiroHref}
              className="mt-8 inline-flex text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
            >
              {roteiroLabel} →
            </a>
          )}
        </div>

        <div className="space-y-12">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
              Inclui
            </p>
            <div className="space-y-5 text-lg font-light leading-8 text-white/70">
              {items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          {optionals && (
            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Opcionais
              </p>
              <div className="space-y-5 text-lg font-light leading-8 text-white/60">
                {optionals.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          )}

          {exclusions && (
            <div className="border-t border-white/10 pt-10">
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">
                Não inclui
              </p>
              <div className="space-y-5 text-lg font-light leading-8 text-white/45">
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
