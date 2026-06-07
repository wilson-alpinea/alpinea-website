"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition text-white">
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

      {/* mantenha todo o restante do código da página igual ao atual,
          substituindo apenas o bloco <nav> antigo por este <header> */}
    </main>
  );
}