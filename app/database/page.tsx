import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { IconPlane } from "../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Índice do banco de conteúdo interno — guias e atrações reutilizados na
// montagem de roteiros. Não faz parte do site público e não é indexado
// (ver robots.ts).
export const metadata: Metadata = {
  title: "Banco de Conteúdo Ajisai",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const categorias = [
  {
    href: "/database/aeroportos",
    titulo: "Guia de Aeroportos",
    resumo: "Chegada, imigração, deslocamento e recomendações — Narita, Haneda e Kansai.",
    Icon: IconPlane,
    disponivel: true,
  },
];

export default function DatabaseIndexPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black px-6 py-5 md:px-10">
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          Banco de Conteúdo Ajisai
        </span>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Uso interno · não indexado</p>
        <h1 className={`${display.className} text-4xl font-medium leading-tight text-white md:text-6xl`}>
          Banco de Conteúdo
        </h1>
        <p className="mt-5 max-w-2xl text-base font-light leading-8 text-white/55">
          Guias e atrações que se repetem entre roteiros — usados como base ao montar
          o roteiro final de cada cliente. Este conteúdo não é destinado ao cliente
          diretamente e não deve ser linkado a partir de páginas públicas do site.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {categorias.map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/25 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                <c.Icon className="h-5 w-5" />
              </span>
              <h2 className={`${display.className} mt-5 text-xl font-medium text-white`}>{c.titulo}</h2>
              <p className="mt-3 text-sm leading-6 text-white/50">{c.resumo}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/30 transition group-hover:text-white/60">
                Ver guia →
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
