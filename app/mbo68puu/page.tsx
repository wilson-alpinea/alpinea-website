import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { bodoniModa } from "@/app/fonts/bodoni";
import { ApprovalPanel, PassagemAereaSecao } from "./ApprovalPanel";

// DEMONSTRAÇÃO do roteiro personalizado (Wilson, 04/nov/2026) — baseada no
// roteiro de app/rf3vk8mp, sem nenhum dado pessoal do cliente (nome, ID,
// data de contratação, apólice) e com só 2 dias abertos.
//
// Página do roteiro personalizado — enviada individualmente para cada
// cliente por uma URL não listada (chave alfanumérica de 8 dígitos, sem
// link em nenhum outro lugar do site). Baseada no template visual de
// /ajisairoteiros, mas em tema claro, sem hero, e com a "Amostra do Dia 1"
// substituída por uma visão simplificada dos 7 dias (Manhã/Tarde, atração
// principal e pontos de interesse).

const display = bodoniModa;
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Perfil do viajante — pontuação (0–10) baseada no briefing preenchido pelo
// cliente na contratação. Usada só como leitura interna da equipe pra
// orientar a curadoria do roteiro; segue as 6 dimensões padrão de perfil.
type DimensionIconKind =
  | "cultura"
  | "gastronomia"
  | "natureza"
  | "entretenimento"
  | "compras"
  | "bemestar";

type RadarDimension = {
  lines: string[];
  score: number;
  icon: DimensionIconKind;
};

const RADAR_DIMENSIONS: RadarDimension[] = [
  { lines: ["Cultura &", "História"], score: 9, icon: "cultura" },
  { lines: ["Gastronomia"], score: 7, icon: "gastronomia" },
  { lines: ["Natureza &", "Aventura"], score: 2, icon: "natureza" },
  { lines: ["Entretenimento"], score: 9, icon: "entretenimento" },
  { lines: ["Compras"], score: 5, icon: "compras" },
  {
    lines: ["Bem-Estar,", "Relaxamento", "& Esportes"],
    score: 4,
    icon: "bemestar",
  },
];

const DIMENSION_ICON_SRC: Record<DimensionIconKind, string> = {
  cultura: "/images/icone-cultura.webp",
  gastronomia: "/images/icone-gastronomia.webp",
  natureza: "/images/icone-natureza.webp",
  entretenimento: "/images/icone-entretenimento.webp",
  compras: "/images/icone-compras.webp",
  bemestar: "/images/icone-bemestar-relaxamento.webp",
};

function RadarChart({ dimensions }: { dimensions: RadarDimension[] }) {
  const width = 560;
  const height = 440;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 88;
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const n = dimensions.length;
  const lineHeight = 13;

  const point = (r: number, i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const toPolygon = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  const dataPoints = dimensions.map((d, i) => point((d.score / 10) * radius, i));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto -mb-4 -mt-2 block h-auto w-full max-w-[520px]"
    >
      {levels.map((level, li) => (
        <polygon
          key={li}
          points={toPolygon(
            Array.from({ length: n }, (_, i) => point(level * radius, i)),
          )}
          fill="none"
          stroke="#000000"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {Array.from({ length: n }, (_, i) => {
        const p = point(radius, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#000000"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={toPolygon(dataPoints)}
        fill="#000000"
        fillOpacity={0.16}
        stroke="#000000"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#000000" />
      ))}

      {dimensions.map((d, i) => {
        const p = point(radius + 34, i);
        const size = 57;
        return (
          <image
            key={i}
            href={DIMENSION_ICON_SRC[d.icon]}
            x={p.x - size / 2}
            y={p.y - size / 2}
            width={size}
            height={size}
          />
        );
      })}

      {dimensions.map((d, i) => {
        const iconP = point(radius + 34, i);
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        // Dimensões próximas do eixo vertical (topo/base) empilham o texto
        // acima/abaixo do ícone; as demais mantêm o texto na mesma altura do
        // ícone, deslocado só na horizontal — evita o texto "flutuar" longe
        // do ícone que ele rotula.
        const isVertical = Math.abs(dx) < 0.35;
        const gapX = 56;
        const gapY = 50;
        const tx = isVertical ? iconP.x : iconP.x + Math.sign(dx) * gapX;
        const ty = isVertical ? iconP.y + Math.sign(dy) * gapY : iconP.y;
        const anchor = isVertical ? "middle" : dx > 0 ? "start" : "end";
        const startY = ty - ((d.lines.length - 1) * lineHeight) / 2 + 4;
        return (
          <text
            key={i}
            x={tx}
            y={startY}
            textAnchor={anchor}
            className="fill-[#000000] uppercase"
            fontSize={12}
            fontWeight={700}
            style={{ letterSpacing: "0.03em" }}
          >
            {d.lines.map((line, li) => (
              <tspan key={li} x={tx} dy={li === 0 ? 0 : lineHeight}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Demonstração — Roteiro Personalizado | Ajisai",
  description: "Demonstração do roteiro personalizado da Ajisai.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Sobrescreve o openGraph/twitter padrão do layout raiz (marca Alpinea) —
  // esta é a página que o cliente abre e encaminha no WhatsApp, então o
  // preview de link precisa mostrar a marca Ajisai, não a Alpinea.
  openGraph: {
    title: "Demonstração — Roteiro Personalizado | Ajisai",
    description:
      "Veja como funciona o roteiro digital da Ajisai — hospedagens, passeios, deslocamentos e recomendações organizados dia a dia.",
    siteName: "Ajisai",
    images: [
      {
        url: "/images/og-ajisai-roteiro.webp",
        width: 1200,
        height: 630,
        alt: "Ajisai — Roteiro Personalizado",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demonstração — Roteiro Personalizado | Ajisai",
    description:
      "Veja como funciona o roteiro digital da Ajisai, organizado dia a dia.",
    images: ["/images/og-ajisai-roteiro.webp"],
  },
};

export default function AprovacaoRoteiroPage() {
  return (
    <main className={`${inter.className} min-h-screen overflow-x-clip bg-white pt-14 text-black`}>
      {/* Identidade atual do site (Wilson, 04/nov/2026): fundo branco, Inter
          no texto, Bodoni nos títulos e a barra azul-marinho das páginas de
          produto (BarraProduto em app/produtos/templateProduto.tsx). */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <a href="https://www.alpinea.io/produtos/roteiro-personalizado" className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </a>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Roteiro Personalizado</p>
        <span className="hidden shrink-0 rounded-full border border-white/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white/85 sm:inline">Demonstração</span>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <section className="px-5 pb-4 pt-8 md:px-16 md:pt-12">
        <div className="relative mx-auto max-w-4xl">
          <details
            className="group overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white sm:rounded-[2rem]"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 50px -30px rgba(10,37,64,0.35)" }}
            open
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden sm:p-8">
              <span className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="w-fit rounded-full border border-[#E3E6EA] px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-[#000000]/85">
                  Dados do Cliente
                </span>
                <span className="text-xs text-[#000000]/55 sm:text-sm">
                  Cliente exemplo · 7 dias · Maio
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E3E6EA] bg-[#F3F5F7] text-[#000000] transition-colors duration-300 group-hover:bg-[#000000] group-hover:text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition-transform duration-300 group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>

            <div className="border-t border-[#E3E6EA] px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-1 gap-5 border-b border-[#E3E6EA] pb-6 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#000000]/65">
                  Data da Contratação
                </p>
                <p className="mt-1 text-sm font-semibold text-[#000000]">
                  —
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#000000]/65">
                  Cliente
                </p>
                <p className="mt-1 text-sm font-semibold text-[#000000]">
                  Cliente exemplo
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#000000]/65">
                  Duração
                </p>
                <p className="mt-1 text-sm font-semibold text-[#000000]">
                  7 Dias
                </p>
              </div>
            </div>

            <PassagemAereaSecao />

            <div className="mt-8">
              <p className="mx-auto mb-1 block w-fit rounded-full border border-[#E3E6EA] px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-[#000000]/85">
                Perfil do Viajante
              </p>
              <RadarChart dimensions={RADAR_DIMENSIONS} />
            </div>
            </div>
          </details>
        </div>
      </section>

      <section className="px-5 pb-12 pt-6 md:px-16 md:pb-16 md:pt-8">
        <div className="mx-auto max-w-4xl">
          <ApprovalPanel displayClassName={display.className} />
        </div>
      </section>

      <footer className="border-t border-black/10 px-6 py-8 text-center text-xs text-black/50 md:px-16">
        <p>
          © {new Date().getFullYear()} AjisaiWork Japan Agência de Viagens
          LTDA — CNPJ 43.544.605/0001-56
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} Alpinea Agências de Viagens LTDA —
          CNPJ 66.491.067/0001-84
        </p>
        <p className="mt-1.5">Demonstração — dados de exemplo, sem informações de clientes.</p>
      </footer>
    </main>
  );
}
