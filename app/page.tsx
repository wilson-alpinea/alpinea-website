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
            <a href="#experiences">Experiences</a>
            <a href="#concierge">Concierge</a>
            <a href="#contact">Apply</a>
          </div>
        </nav>

        <div className="relative z-10 flex h-[75vh] flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Bespoke Japan
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-tight tracking-[0.08em] md:text-8xl">
            Japan, unlocked.
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">
            Private journeys, fine dining, cultural access and seamless travel
            planning for clients who expect Japan to feel effortless.
          </p>

          <a
            href="#contact"
            className="mt-12 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Request Access
          </a>
        </div>
      </section>

      <section id="experiences" className="px-6 py-28 md:px-16">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
          Curated Experiences
        </p>

        <h2 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl">
          The best of Japan, arranged around your taste.
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            ["Tokyo Dining", "Omakase, counter seats, private rooms and chef-led evenings."],
            ["Kyoto & Ryokan", "Quiet temples, refined stays and seasonal cultural immersion."],
            ["Luxury Shopping", "Personalized retail routes, watches, fashion and craft ateliers."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="group min-h-[360px] border border-white/10 bg-white/[0.03] p-8 transition hover:bg-white hover:text-black"
            >
              <div className="flex h-full flex-col justify-end">
                <h3 className="text-2xl font-light">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/60 group-hover:text-black/60">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="concierge" className="border-y border-white/10 px-6 py-28 md:px-16">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
              Concierge
            </p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Human planning. Insider access. No generic itineraries.
            </h2>
          </div>

          <div className="space-y-8 text-white/65">
            <p className="text-lg font-light leading-9">
              Alpinea designs Japan around your preferences: restaurants,
              hotels, guides, transportation, shopping, culture and the details
              that make the trip feel personal.
            </p>

            <p className="text-lg font-light leading-9">
              From Tokyo dining to Kyoto stays, every journey is built with a
              quiet luxury sensibility: precise, discreet and deeply curated.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
            Membership Style Service
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-7xl">
            Make Japan feel private.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-white/60 leading-8">
            Designed for travelers who do not want a tour package — they want
            access, taste, timing and execution.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-white px-6 py-28 text-black md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-black/40">
            Apply
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Begin your Japan request.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-black/60">
            Tell us your dates, preferences and travel style. Alpinea will shape
            the journey from there.
          </p>

          <a
            href="mailto:contact@alpinea.io"
            className="mt-10 inline-block border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
          >
            Contact Alpinea
          </a>
        </div>
      </section>
    </main>
  );
}