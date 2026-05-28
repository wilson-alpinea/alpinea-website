export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
  <section className="relative h-screen overflow-hidden">
    <div className="absolute inset-0">
      <video
        className="hero-video hero-video-0 absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/japan-hero.mp4"
      />

      <video
        className="hero-video hero-video-1 absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/tokyo-station.mp4"
      />

      <video
        className="hero-video hero-video-2 absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/higashiyama.mp4"
      />
    </div>



    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />

    <nav className="relative z-10 flex items-center justify-between px-8 py-8 md:px-16">
          <div className="text-xl tracking-[0.45em]">ALPINEA</div>
          <div className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
            <a
  href="/"
  className="transition hover:text-white/60"
>
  PORTUGUESE
</a>
            <a href="#concierge">Contact</a>
           
          </div>
        </nav>

        <div className="relative z-10 flex h-[75vh] flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Bespoke Japan
          </p>

          <h1 className="text-6xl font-light leading-[1.05] tracking-tight text-white md:text-8xl">
  Experience Japan with
  <br />
 <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent animate-luxury-gradient bg-[length:180%_180%]">
  exclusivity.
  </span>
</h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">
            Private journeys, exceptional dining, cultural access and seamless planning for travelers seeking the finest side of Japan.
          </p>

          <a
            href="#contact"
            className="mt-12 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Request Concierge
          </a>
        </div>
      </section>

<section id="experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  <div className="mx-auto max-w-7xl">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/40">
      CURATED EXPERIENCES
    </p>

    <h2 className="max-w-6xl text-5xl font-light leading-tight tracking-tight md:text-7xl">
      The finest side of Japan, designed around your lifestyle.
    </h2>

    <div className="mt-24 grid gap-8 md:grid-cols-3">
      
      {/* ALTA GASTRONOMIA */}
      <a href="#fine-dining" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/sugita.png"
            alt="Fine Dining"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Fine Dining
            </h3>
          </div>
        </div>
      </a>

      {/* ARTIGOS DE LUXO */}
      <a href="#luxury-goods" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/rolex.png"
            alt="Luxury Goods"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Luxury Goods
            </h3>
          </div>
        </div>
      </a>

      {/* EXPERIENCES */}
      <a href="#japan-experiences" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/fuji.JPG"
            alt="Experiences"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Experiences
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
        Fine Dining
      </p>

      <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-6xl">
        Reservations that are nearly impossible at the best restaurants in Japan.
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          In Japan's top restaurants, reservations are extremely limited and sought after months — or even years — in advance.
        </p>

        <p className="text-lg font-light leading-9">
         Alpinea provides access to Michelin-starred restaurants,
listed in the Tabelog, and addresses that are almost impossible to book
independently, always with private curation and absolute attention
to detail.
        </p>

        <p className="text-lg font-light leading-9">
    More than just a reservation, we provide exclusive gastronomic experiences, built through relationships, expertise, and a deep understanding of the Japanese culinary scene.
        </p>
      </div>
    </div>

    {/* IMAGEM */}
    <div className="flex justify-center md:justify-end">
      <div className="relative w-full max-w-[380px]">

        <img
          src="/images/fine-dining-stack.png"
          alt="Fine Dining Japão"
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
        Luxury Goods
      </p>

      <h2 className="max-w-3xl text-4xl font-light leading-tight md:text-6xl">
        Access to Japan's most sought-after items.
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          Japan is home to some of the world's most exclusive boutiques, watchmakers, and technology stores
often featuring limited editions, extremely limited availability, and service reserved only for select clients.
        </p>

        <p className="text-lg font-light leading-9">
         Alpinea assists in curating and providing access to luxury items, cameras, watches, fishing equipment, collectibles, and hard-to-find products, always with personalized support and absolute discretion.
        </p>

        <p className="text-lg font-light leading-9">
          More than just shopping, we provide private boutique experiences, dedicated service and access to pieces that rarely reach the international market at competitive prices.
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
      EXPERIENCES
    </p>

    <h2 className="mx-auto max-w-5xl text-center text-4xl font-light leading-tight md:text-7xl">
      Japan beyond the postcards.
    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-white/60">
      Alpinea transforms Japan into a journey designed around your interests — combining the country's main tourist attractions with access, comfort, impeccable logistics, and personalized support.
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
          <h3 className="text-lg font-light">Technology & Modernity</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Exploring contemporary Japan through architecture, technology, iconic neighborhoods, and carefully curated urban experiences.
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
          <h3 className="text-lg font-light">Natural & Historical Beauties</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Historic temples like Kiyomizu-dera and Senso-ji, natural beauties like Mount Fuji, Niseko, and Okinawa.
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
      Premium Culture & Entertainment
    </h3>

    <p className="mt-2 text-sm leading-7 text-white/55">
      Museums, art installations, theme parks, and immersive experiences carefully selected to reveal the most contemporary and sensory side of Japan.
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
      Your Alpinea Experience
    </p>

    <h2 className="text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
      Make the Japan
      <br />
      exclusively yours.
    </h2>

    <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-white/70">
     Designed for travelers who are not looking for package tours, but access, repertoire, precision, and flawless execution.
    </p>
  </div>
</section>

      <section
  id="contact"
  className="bg-white px-6 py-28 text-black md:px-16"
>
  <div className="mx-auto max-w-4xl text-center">
    <p className="mb-6 text-xs uppercase tracking-[0.4em] text-black/40">
      Contact
    </p>

    <h2 className="text-4xl font-light leading-tight md:text-6xl">
      Begin your journey through Japan.
    </h2>

    <p className="mx-auto mt-6 max-w-xl text-black/60">
     Share your dates, preferences, and travel style. Alpinea will take care of the rest.
    </p>

    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
      
      {/* EMAIL */}
      <a
        href="mailto:wilson@alpinea.io"
        className="inline-block border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
      >
        Contact
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
          Private curation of experiences, gastronomy, and lifestyle in Japan.
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
        Contact
      </a>
    </div>
  </div>
</footer>

    </main>
  );
}