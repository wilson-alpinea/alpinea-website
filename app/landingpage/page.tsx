'use client';

import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <video
            className="h-full w-full object-cover opacity-55"
            src="/higashiyama.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-between px-8 py-10 md:px-16">
          <header className="flex items-center justify-between">
            <div className="text-lg font-light tracking-[0.55em]">ALPINEA</div>
            <nav className="hidden gap-10 text-[11px] uppercase tracking-[0.35em] text-white/70 md:flex">
              <a href="#servicos">Serviços</a>
              <a href="#diferenciais">Diferenciais</a>
              <a href="#execucao">Execução</a>
              <a href="#contato">Contato</a>
            </nav>
          </header>

          <div className="max-w-3xl pb-8 pt-28">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/60">
              Viagens privadas e concierge no Japão
            </p>

            <h1 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl">
              O Japão, vivido com exclusividade.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              Restaurantes quase impossíveis de reservar, especialistas de compras nunca antes
              vistos, experiências pra quem deseja viver o máximo do Japão.
            </p>

            <div className="mt-10">
              <a
                href="#contato"
                className="inline-flex border border-white/25 px-8 py-4 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Entrar em contato
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="border-b border-white/10 px-8 py-20 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
          {[
            ['+12', 'anos de experiência no Japão'],
            ['日本語', 'domínio do idioma japonês'],
            ['#3', 'terceiro maior emissor do mundo na rota Brasil–Japão'],
            ['BR · JP', 'razão social no Brasil e Japão'],
          ].map(([number, label]) => (
            <div key={label} className="bg-black p-8 md:p-10">
              <div className="text-3xl font-light tracking-tight md:text-4xl">{number}</div>
              <div className="mt-5 max-w-[220px] text-[11px] uppercase leading-6 tracking-[0.28em] text-white/45">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Nossos diferenciais
            </p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">
              Acesso, profundidade e execução no mercado de luxo japonês.
            </h2>
          </div>

          <div className="space-y-10 text-base leading-8 text-white/70 md:text-lg">
            <p>
              Os restaurantes que definem o topo da gastronomia japonesa não operam por
              plataformas, não respondem em inglês e não reservam para desconhecidos, nem mesmo
              para concierge de hotéis, somente via relação pessoal.
            </p>

            <p>
              Os melhores produtos de cada categoria não fazem propaganda.
            </p>

            <p>
              Encontrar os melhores hotéis para cada perfil exige mais que conhecer nomes e marcas
              famosas, exige vivência real.
            </p>
          </div>
        </div>
      </section>

      {/* ROTEIRO */}
      <section id="servicos" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Roteiro sob medida
            </p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">
              Um roteiro que vai além de uma lista genérica de lugares.
            </h2>
          </div>

          <div className="space-y-8 text-base leading-8 text-white/70 md:text-lg">
            <p>
              A Alpinea desenha jornadas privadas no Japão com curadoria de hotéis, restaurantes,
              logística, compras, experiências e acompanhamento presencial quando necessário.
            </p>

            <p>
              Cada detalhe é pensado para reduzir ruído, antecipar problemas e transformar a viagem
              em uma experiência fluida, precisa e profundamente personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* EXECUÇÃO */}
      <section id="execucao" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Execução
            </p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">
              Uma empresa moderna que entrega um nível de execução poucas vezes visto no mercado de luxo.
            </h2>
            <p className="mt-8 text-base leading-8 text-white/70 md:text-lg">
              Desde o roteiro até a assessoria presencial dedicada, tudo é pensado nos mínimos
              detalhes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['/ss-roteiro.png', 'Roteiro privado'],
              ['/ss-restaurantes.png', 'Curadoria gastronômica'],
              ['/ss-rcompras.png', 'Assessoria de compras'],
            ].map(([src, title]) => (
              <div key={title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={src}
                    alt={title}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <p className="mt-5 px-2 pb-2 text-xs uppercase tracking-[0.35em] text-white/45">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESENÇA DIGITAL */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
              Presença digital
            </p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">
              Conheça mais sobre destinos, hotéis, restaurantes e atrações.
            </h2>

            <p className="mt-8 text-base leading-8 text-white/70 md:text-lg">
              Acompanhe a Alpinea no Instagram e YouTube para ver uma leitura real do Japão:
              gastronomia, bairros, hotéis, experiências e bastidores de curadoria.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/alpinea.private"
                target="_blank"
                className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 hover:border-white hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@alpinea.private"
                target="_blank"
                className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 hover:border-white hover:text-white"
              >
                YouTube
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
              <Image
                src="/youtube-feed.png"
                alt="Feed do YouTube Alpinea Private"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="px-8 py-28 md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">
            Alpinea Private
          </p>
          <h2 className="text-3xl font-light leading-tight md:text-5xl">
            Para clientes que desejam viver o Japão no nível mais alto.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
            Roteiros privados, reservas difíceis, compras especializadas, hotéis, logística e
            acompanhamento presencial no Japão.
          </p>

          <div className="mt-12">
            <a
              href="mailto:contact@alpinea.io"
              className="inline-flex border border-white/25 px-9 py-5 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Solicitar curadoria
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}