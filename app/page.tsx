export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/japan-hero.mp4"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-8 md:px-16">
          <div className="text-xl tracking-[0.45em]">ALPINEA</div>
          <div className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
            <a href="#experiences">ENGLISH</a>
            <a href="#concierge">Entrar em Contato</a>
           
          </div>
        </nav>

        <div className="relative z-10 flex h-[75vh] flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Japão Sob Medida
          </p>

          <h1 className="text-6xl font-light leading-[1.05] tracking-tight text-white md:text-8xl">
  O Japão, vivido com
  <br />
 <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent animate-luxury-gradient bg-[length:180%_180%]">
  exclusividade.
  </span>
</h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">
            Viagens privadas, gastronomia de excelência, acesso cultural e
            planejamento impecável para clientes que esperam vivenciar o Japão
            com absoluta fluidez.
          </p>

          <a
            href="#contact"
            className="mt-12 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </a>
        </div>
      </section>

<section id="experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  <div className="mx-auto max-w-7xl">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/40">
      EXPERIÊNCIAS PERSONALIZADAS
    </p>

    <h2 className="max-w-6xl text-5xl font-light leading-tight tracking-tight md:text-7xl">
      O melhor do Japão, desenhado ao redor do seu estilo.
    </h2>

    <div className="mt-24 grid gap-8 md:grid-cols-3">
      
      {/* ALTA GASTRONOMIA */}
      <a href="#fine-dining" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/sugita.png"
            alt="Alta Gastronomia"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Alta Gastronomia
            </h3>
          </div>
        </div>
      </a>

      {/* ARTIGOS DE LUXO */}
      <a href="#luxury-goods" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/rolex.png"
            alt="Artigos de Luxo"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Artigos de Luxo
            </h3>
          </div>
        </div>
      </a>

      {/* EXPERIÊNCIAS */}
      <a href="#japan-experiences" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/fuji.JPG"
            alt="Experiências"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Experiências
            </h3>
          </div>
        </div>
      </a>

    </div>
  </div>
</section>

<section
  id="fine-dining"
  className="border-y border-white/10 px-6 py-28 md:px-16"
>
  <div className="mx-auto grid max-w-6xl items-center gap-20 md:grid-cols-[1.1fr_380px]">

    {/* TEXTO */}
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
        Alta Gastronomia
      </p>

      <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-6xl">
        Reservas quase impossíveis nos melhores restaurantes do Japão
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          Nos principais restaurantes do Japão, reservas são extremamente
          limitadas e disputadas com meses — ou até anos — de antecedência.
        </p>

        <p className="text-lg font-light leading-9">
          A Alpinea viabiliza acesso a casas estreladas pelo Guia Michelin,
          referências no Tabelog e endereços quase impossíveis de reservar
          por conta própria, sempre com curadoria privada e atenção absoluta
          aos detalhes.
        </p>

        <p className="text-lg font-light leading-9">
          Mais do que uma reserva, proporcionamos experiências gastronômicas
          exclusivas, construídas através de relacionamento, repertório e
          profundo entendimento da cena culinária japonesa.
        </p>
      </div>
    </div>

    {/* IMAGEM */}
    <div className="flex justify-center md:justify-end">
      <div className="relative w-full max-w-[380px]">

        <img
          src="/images/fine-dining-stack.png"
          alt="Alta Gastronomia Japão"
          className="w-full rounded-[28px] object-cover"
        />

        {/* SAZENKA */}
<div className="absolute bottom-[69%] left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Sazenka
  </p>
</div>

{/* SUSHI ARAI */}
<div className="absolute bottom-[36%] left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Sushi Arai
  </p>
</div>

{/* AO */}
<div className="absolute bottom-5 left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Ao
  </p>
</div>

      </div>
    </div>

  </div>
</section>

<section
  id="luxury-goods"
  className="border-y border-white/10 px-6 py-28 md:px-16"
>
  <div className="mx-auto grid max-w-6xl items-center gap-20 md:grid-cols-[1.1fr_420px]">
    {/* TEXTO */}
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
        Artigos de Luxo
      </p>

      <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-6xl">
        Acesso aos itens mais desejados do Japão
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          O Japão abriga algumas das boutiques, relojoarias e lojas de tecnologia
          mais exclusivas do mundo — muitas vezes com edições limitadas,
          disponibilidade extremamente reduzida e atendimento reservado apenas
          para clientes selecionados.
        </p>

        <p className="text-lg font-light leading-9">
          A Alpinea auxilia na curadoria e acesso a artigos de luxo, câmeras,
          relógios, equuipamentos de pesca, itens colecionáveis e produtos difíceis de encontrar,
          sempre com acompanhamento personalizado e discrição absoluta.
        </p>

        <p className="text-lg font-light leading-9">
          Mais do que compras, proporcionamos experiências privadas em boutiques,
          atendimento dedicado e acesso a peças que raramente chegam ao mercado
          internacional com preços competitivos.
        </p>
      </div>
    </div>

    {/* IMAGENS */}
    <div className="flex justify-center md:justify-end">
      <div className="flex w-full max-w-[420px] flex-col gap-16">
        <div>
          <img
            src="/images/nikonz9.png"
            alt="Nikon Z9"
            className="mx-auto w-full max-w-[360px] object-contain"
          />

          <p className="mt-6 text-[16px] font-light tracking-[0.02em] text-white">
            Nikon Z9
          </p>
        </div>

        <div>
          <img
            src="/images/shimano-stella.png"
            alt="Shimano New Stella FK C5000XG"
            className="mx-auto w-full max-w-[360px] object-contain"
          />

          <p className="mt-6 text-[16px] font-light tracking-[0.02em] text-white">
            Shimano New Stella FK C5000XG
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
<section   id="japan-experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  {/* FUNDO MONTE FUJI */}
  <img
    src="/images/fuji-bg.jpg"
    alt="Monte Fuji"
    className="absolute inset-0 h-full w-full object-cover opacity-25"
  />

  <div className="absolute inset-0 bg-black/65" />
  <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />

  <div className="relative z-10 mx-auto max-w-6xl">
    <p className="mb-6 text-center text-xs uppercase tracking-[0.4em] text-white/40">
      EXPERIÊNCIAS
    </p>

    <h2 className="mx-auto max-w-5xl text-center text-4xl font-light leading-tight md:text-7xl">
      O Japão além dos cartões-postais.
    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-white/60">
      A Alpinea transforma o Japão em uma jornada desenhada ao redor dos seus
      interesses — combinando os principais pontos turísticos do país com acesso,
      conforto, logística impecável e acompanhamento personalizado.
    </p>

    <div className="mt-20 grid gap-6 md:grid-cols-3">
      <div>
        <div className="relative overflow-hidden rounded-[28px]">
          <img
            src="/images/skytree.jpg"
            alt="Tokyo Skytree"
            className="h-[520px] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="mt-5 px-2">
          <h3 className="text-lg font-light">Tecnologia & Modernidade</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Exploração do Japão contemporâneo através de arquitetura, tecnologia, bairros icônicos e experiências urbanas cuidadosamente selecionadas.
          </p>
        </div>
      </div>

      <div className="md:mt-20">
        <div className="relative overflow-hidden rounded-[28px]">
          <video
            src="/videos/fushimi-inari.mp4"
            className="h-[520px] w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="mt-5 px-2">
          <h3 className="text-lg font-light">Belezas Naturais & Históricas</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Templos históricos como Kiyomizu-dera & Senso-ji, Beleza naturais como Monte Fuji, Niseko e Okinawa.
          </p>
        </div>
      </div>

<div>
  <div className="relative overflow-hidden rounded-[28px]">
    
    <video
      src="/videos/moriart.mp4"
      className="h-[520px] w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
    />

    {/* Fade para preto */}
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
  </div>

  <div className="mt-5 px-2">
    <h3 className="text-lg font-light">
      Cultura & Entretenimento Premium
    </h3>

    <p className="mt-2 text-sm leading-7 text-white/55">
      Museus, instalações artísticas, parques temáticos e experiências imersivas cuidadosamente selecionadas para revelar o lado mais contemporâneo e sensorial do Japão.
    </p>
  </div>
</div>
    </div>
  </div>
</section>

      <section
  id="concierge"
  className="relative overflow-hidden bg-black px-6 py-40 text-white md:px-16"
>
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/shira.png"
      alt="Shirakawa-go"
      className="h-full w-full object-cover opacity-35"
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/70" />

    {/* Bottom Fade */}
    <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black" />
  </div>

  {/* Content */}
  <div className="relative z-10 mx-auto max-w-5xl text-center">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/55">
      Sua Experiência Alpinea
    </p>

    <h2 className="text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
      Faça o Japão parecer
      <br />
      exclusivamente seu.
    </h2>

    <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-white/70">
      Pensado para viajantes que não procuram pacotes turísticos,
      mas acesso, repertório, precisão e execução impecável.
    </p>
  </div>
</section>

      <section
  id="contact"
  className="bg-white px-6 py-28 text-black md:px-16"
>
  <div className="mx-auto max-w-4xl text-center">
    <p className="mb-6 text-xs uppercase tracking-[0.4em] text-black/40">
      Contato
    </p>

    <h2 className="text-4xl font-light leading-tight md:text-6xl">
      Comece sua jornada no Japão.
    </h2>

    <p className="mx-auto mt-6 max-w-xl text-black/60">
      Compartilhe suas datas, preferências e estilo de viagem.
      A Alpinea cuidará do restante.
    </p>

    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
      
      {/* EMAIL */}
      <a
        href="mailto:wilson@alpinea.io"
        className="inline-block border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
      >
        Entrar em Contato
      </a>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/5511996691818"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border border-black/20 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
      >
        WhatsApp Concierge
      </a>

    </div>
  </div>
</section>

<footer className="border-t border-white/10 bg-black px-6 py-16 text-white md:px-16">
  <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-end md:justify-between">
    
    {/* LEFT */}
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-white/80">
          Alpinea
        </p>
      </div>

      <div className="max-w-md space-y-3">
        <p className="text-sm leading-relaxed text-white/50">
          Curadoria privada de experiências, gastronomia e lifestyle no Japão.
        </p>

        <p className="text-xs text-white/30">
          © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
      <a
        href="https://www.instagram.com/alpinea.private"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        Instagram
      </a>

      <a
        href="https://www.youtube.com/@alpinea.private"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        YouTube
      </a>

      <a
        href="mailto:wilson@alpinea.io"
        className="transition hover:text-white"
      >
        Contato
      </a>
    </div>
  </div>
</footer>

    </main>
  );
}