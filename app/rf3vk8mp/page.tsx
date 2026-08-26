import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import { ApprovalPanel, PassagemAereaSecao } from "./ApprovalPanel";

// Página do roteiro personalizado — enviada individualmente para cada
// cliente por uma URL não listada (chave alfanumérica de 8 dígitos, sem
// link em nenhum outro lugar do site). Baseada no template visual de
// /ajisairoteiros, mas em tema claro, sem hero, e com a "Amostra do Dia 1"
// substituída por uma visão simplificada dos 7 dias (Manhã/Tarde, atração
// principal e pontos de interesse).

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
          stroke="#24211D"
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
            stroke="#24211D"
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
            className="fill-[#24211D] uppercase"
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
  title: "Roteiro Personalizado | Ajisai",
  description: "Página privada do roteiro personalizado.",
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
    title: "Seu Roteiro Personalizado | Ajisai",
    description:
      "Roteiro digital da sua viagem ao Japão — hospedagens, passeios, deslocamentos e recomendações organizados dia a dia pela Ajisai.",
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
    title: "Seu Roteiro Personalizado | Ajisai",
    description:
      "Roteiro digital da sua viagem ao Japão, organizado dia a dia pela Ajisai.",
    images: ["/images/og-ajisai-roteiro.webp"],
  },
};

export default function AprovacaoRoteiroPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Glow ambiente saindo das bordas da página — mesma paleta azul/roxa
          do /roteirolandingpage, fixo por trás de todo o conteúdo. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-56 -top-56 h-[640px] w-[640px] rounded-full opacity-70 blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(25,70,150,0.38) 0%, rgba(16,42,108,0.2) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute -right-56 -top-56 h-[640px] w-[640px] rounded-full opacity-70 blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(75,42,128,0.34) 0%, rgba(20,68,145,0.18) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute -bottom-56 left-1/2 h-[640px] w-[900px] -translate-x-1/2 rounded-full opacity-50 blur-[150px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(25,70,150,0.3) 0%, rgba(16,42,108,0.15) 45%, transparent 75%)",
          }}
        />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/70 px-6 py-5 backdrop-blur-2xl md:px-16">
        <img
          src="/images/alpinea-ajisai-final-logo-branco.webp"
          alt="Alpinea — Empresa do Grupo Ajisai"
          className="h-7 w-auto object-contain sm:h-9 md:h-[60px] lg:h-[72px]"
        />
        <span className="rounded-full border border-white bg-white/[0.06] px-2.5 py-1 text-center text-[9px] uppercase tracking-[0.1em] text-white sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.15em] md:px-4 md:py-2 md:text-xs md:tracking-[0.2em]">
          ID 52130383
        </span>
      </header>

      <section className="px-5 pb-4 pt-28 md:px-16 md:pt-36 lg:pt-40">
        <div className="relative mx-auto max-w-4xl">
          {/* Glow via box-shadow direto no card — nunca "vaza" para dentro do
              fundo opaco, já que sombra CSS só pinta fora da caixa. */}
          <details
            className="group overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#F2F1ED] sm:rounded-[2rem]"
            style={{
              boxShadow:
                "0 0 90px 6px rgba(35,90,190,0.28), 0 0 42px -4px rgba(90,50,155,0.28), 0 20px 60px -30px rgba(0,0,0,0.6)",
            }}
            open
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden sm:p-8">
              <span className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="w-fit rounded-full border border-[#DDD8CF] px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-[#24211D]/85">
                  Dados do Cliente
                </span>
                <span className="text-xs text-[#24211D]/55 sm:text-sm">
                  Rafael Serafim Sousa · 7 dias · 03–12 Mai 2027
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DDD8CF] bg-[#F3F1EB] text-[#000000] transition-colors duration-300 group-hover:bg-[#000000] group-hover:text-white">
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

            <div className="border-t border-[#DDD8CF] px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-1 gap-5 border-b border-[#DDD8CF] pb-6 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#24211D]/65">
                  Data da Contratação
                </p>
                <p className="mt-1 text-sm font-semibold text-[#24211D]">
                  28 de Julho de 2026
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#24211D]/65">
                  Cliente
                </p>
                <p className="mt-1 text-sm font-semibold text-[#24211D]">
                  Rafael Serafim Sousa
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#24211D]/65">
                  Duração
                </p>
                <p className="mt-1 text-sm font-semibold text-[#24211D]">
                  7 Dias
                </p>
              </div>
            </div>

            <PassagemAereaSecao />

            <div className="mt-8">
              <p className="mx-auto mb-1 block w-fit rounded-full border border-[#DDD8CF] px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-[#24211D]/85">
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

      <footer className="px-6 py-8 text-center text-xs text-white/40 md:px-16">
        <p>
          © {new Date().getFullYear()} AjisaiWork Japan Agência de Viagens
          LTDA — CNPJ 43.544.605/0001-56
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} Alpinea Agências de Viagens LTDA —
          CNPJ 66.491.067/0001-84
        </p>
        <p className="mt-1.5">Página de aprovação privada, não indexada.</p>
      </footer>
    </main>
  );
}
