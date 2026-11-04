import type { Metadata } from "next";
import { interCrm } from "@/lib/crm/fonte";
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

// Ícones de traço azul-marinho do perfil do viajante (Wilson, 04/nov/2026).
const DIMENSION_ICON_SRC: Record<DimensionIconKind, string> = {
  cultura: "/images/icone-perfil-cultura.png",
  gastronomia: "/images/icone-perfil-gastronomia.png",
  natureza: "/images/icone-perfil-natureza.png",
  entretenimento: "/images/icone-perfil-entretenimento.png",
  compras: "/images/icone-perfil-compras.png",
  bemestar: "/images/icone-perfil-bemestar.png",
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
          stroke="#24476B"
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
            stroke="#24476B"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={toPolygon(dataPoints)}
        fill="#24476B"
        fillOpacity={0.16}
        stroke="#24476B"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#24476B" />
      ))}

      {dimensions.map((d, i) => {
        const p = point(radius + 34, i);
        const size = 44;
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
            className="fill-[#20252B]"
            fontSize={13}
            fontWeight={600}
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
  title: "Demonstração — Roteiro Personalizado",
  description: "Demonstração do roteiro personalizado.",
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
    title: "Demonstração — Roteiro Personalizado",
    description:
      "Veja como funciona o roteiro digital — hospedagens, passeios, deslocamentos e recomendações organizados dia a dia.",
    images: [
      {
        url: "/images/og-ajisai-roteiro.webp",
        width: 1200,
        height: 630,
        alt: "Roteiro Personalizado — demonstração",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demonstração — Roteiro Personalizado",
    description:
      "Veja como funciona o roteiro digital, organizado dia a dia.",
    images: ["/images/og-ajisai-roteiro.webp"],
  },
};

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";

export default function AprovacaoRoteiroPage() {
  return (
    <main className={`${interCrm.className} min-h-screen overflow-x-clip bg-[#FAF9F6] text-[#20252B] [font-variant-numeric:tabular-nums]`}>
      {/* Identidade visual do CRM (Wilson, 04/nov/2026): Inter, fundo
          #FAF9F6, cabeçalho preto com o logo, título de página e cards
          brancos com faixa colorida no topo (PainelUi do CRM). */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-8 w-auto sm:h-10" />
            <span className="hidden h-9 w-px bg-white/15 sm:block" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[20px] font-semibold text-white">Roteiro Personalizado</span>
              <span className="mt-1 text-[13px] text-white/45">Demonstração</span>
            </span>
          </div>
          <a
            href="https://www.alpinea.io/produtos/roteiro-personalizado"
            className="shrink-0 rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Quero meu roteiro
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <h1 className="text-[28px] font-semibold leading-tight text-[#20252B] md:text-[32px]">Roteiro Personalizado</h1>
        <p className="mt-1 text-[15px] text-[#626B75]">Demonstração · 7 dias · Tokyo e Kyoto · Veja como o roteiro chega ao cliente.</p>

        <section className="mt-8">
          <details
            className={`group overflow-hidden rounded-2xl border border-t-[3px] border-black/[0.06] bg-white ${SOMBRA}`}
            style={{ borderTopColor: "#24476B" }}
            open
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden md:p-6">
              <span className="min-w-0">
                <span className="block text-lg font-semibold text-[#20252B]">Dados do cliente</span>
                <span className="block text-[13px] text-[#626B75]">Cliente exemplo · 7 dias · maio</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D5DAE0] bg-white text-[#20252B] transition group-hover:border-[#24476B]/50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition-transform duration-300 group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>

            <div className="border-t border-black/[0.06] p-5 md:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F5F6F8] px-4 py-3">
                <p className="text-[13px] text-[#626B75]">
                  Data da contratação
                </p>
                <p className="mt-0.5 text-[17px] font-semibold text-[#20252B]">
                  —
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F6F8] px-4 py-3">
                <p className="text-[13px] text-[#626B75]">
                  Cliente
                </p>
                <p className="mt-0.5 text-[17px] font-semibold text-[#20252B]">
                  Cliente exemplo
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F6F8] px-4 py-3">
                <p className="text-[13px] text-[#626B75]">
                  Duração
                </p>
                <p className="mt-0.5 text-[17px] font-semibold text-[#20252B]">
                  7 dias
                </p>
              </div>
            </div>

            <PassagemAereaSecao />

            <div className="mt-8">
              <p className="text-[15px] font-semibold text-[#20252B]">Perfil do viajante</p>
              <p className="text-[13px] text-[#626B75]">Pontuação de 0 a 10, a partir do briefing.</p>
              <RadarChart dimensions={RADAR_DIMENSIONS} />
            </div>
            </div>
          </details>
        </section>

        <section className="mt-6">
          <ApprovalPanel displayClassName={interCrm.className} />
        </section>
      </div>

      <footer className="border-t border-black/[0.06] px-6 py-8 text-center text-[13px] text-[#626B75] md:px-16">
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
