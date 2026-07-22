import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { IconArrowLeft, IconPlane } from "../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Banco de conteúdo interno — não faz parte do site público, não deve ser
// linkado a partir de páginas voltadas ao cliente e não é indexado por
// mecanismos de busca (ver robots.ts e o campo `robots` abaixo).
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Guia de Aeroportos",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const aeroportos = [
  {
    slug: "narita",
    codigo: "NRT",
    nome: "Aeroporto Internacional de Narita",
    regiao: "Tóquio · Chiba",
    resumo:
      "Principal porta de entrada para a maioria dos voos internacionais de longo curso com destino a Tóquio. Três terminais, ~60 km do centro.",
  },
  {
    slug: "haneda",
    codigo: "HND",
    nome: "Aeroporto Internacional de Haneda",
    regiao: "Tóquio",
    resumo:
      "Terminal internacional (T3) a ~30 min do centro de Tóquio. Boa opção para chegadas noturnas ou voos com conexão mais curta até o hotel.",
  },
  {
    slug: "kansai",
    codigo: "KIX",
    nome: "Aeroporto Internacional de Kansai",
    regiao: "Osaka · Kyoto · Kobe",
    resumo:
      "Aeroporto insular que serve toda a região de Kansai. Porta de entrada para roteiros que começam por Osaka ou Kyoto.",
  },
];

export default function AeroportosIndexPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-10">
          <a
            href="/database"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white/70"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Banco de conteúdo
          </a>
          <span className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Uso interno · não indexado
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
          Banco de Conteúdo Ajisai
        </p>
        <h1 className={`${display.className} text-4xl font-medium leading-tight text-white md:text-6xl`}>
          Guia de Aeroportos
        </h1>
        <p className="mt-5 max-w-2xl text-base font-light leading-8 text-white/55">
          Conteúdo padrão de chegada, imigração, deslocamento e recomendações para os
          principais aeroportos de entrada no Japão. Reutilizado ao montar o bloco de
          "Chegada" de qualquer roteiro — copie e adapte os trechos relevantes para o
          voo e o hotel do cliente.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {aeroportos.map((a) => (
            <a
              key={a.slug}
              href={`/database/aeroportos/${a.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/25 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6]">
                <IconPlane className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs uppercase tracking-[0.25em] text-white/35">
                {a.codigo} · {a.regiao}
              </p>
              <h2 className={`${display.className} mt-2 text-xl font-medium text-white`}>
                {a.nome}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/50">{a.resumo}</p>
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
