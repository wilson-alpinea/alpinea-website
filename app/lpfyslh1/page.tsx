import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import { ApprovalPanel } from "./ApprovalPanel";

// Página de aprovação de rascunho — enviada individualmente para cada
// cliente por uma URL não listada (chave alfanumérica de 8 dígitos, sem
// link em nenhum outro lugar do site). Baseada no template visual de
// /ajisairoteiros, mas em tema claro, sem hero, e com a "Amostra do Dia 1"
// substituída por uma visão simplificada dos 7 dias (Manhã/Tarde, atração
// principal e pontos de interesse) para validação rápida antes de
// iniciarmos o painel digital completo.

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const APPROVAL_KEY = "lpfyslh1";

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
  { lines: ["Compras"], score: 7, icon: "compras" },
  {
    lines: ["Bem-Estar,", "Relaxamento", "& Esportes"],
    score: 1,
    icon: "bemestar",
  },
];

// Converte a pontuação de 0–10 do radar pra uma escala de 1–5 estrelas,
// mesmo padrão visual usado nos Pontos de Interesse do painel abaixo.
function starsFromScore(score: number) {
  return Math.max(1, Math.min(5, Math.round(score / 2)));
}

function DimensionIcon({
  kind,
  className,
}: {
  kind: DimensionIconKind;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (kind) {
    case "cultura":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M5 6v14M19 6v14" />
          <path d="M2 9h20" />
        </svg>
      );
    case "gastronomia":
      return (
        <svg {...common}>
          <path d="M4 12h16a8 8 0 0 1-16 0Z" />
          <path d="M6 12 5 8" />
          <path d="M12 12V6" />
          <path d="m18 12 1-4" />
        </svg>
      );
    case "natureza":
      return (
        <svg {...common}>
          <path d="M3 19 9 7l4 6 3-4 5 10H3Z" />
        </svg>
      );
    case "entretenimento":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 17v3" />
        </svg>
      );
    case "compras":
      return (
        <svg {...common}>
          <path d="M6 8V6a6 6 0 0 1 12 0v2" />
          <path d="M4 8h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8Z" />
        </svg>
      );
    case "bemestar":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.35-9.5-8.5C.5 8 2 4 6 4c2 0 3.5 1 6 3.5C14.5 5 16 4 18 4c4 0 5.5 4 3.5 7.5C19 15.65 12 20 12 20Z" />
        </svg>
      );
  }
}

function RadarChart({ dimensions }: { dimensions: RadarDimension[] }) {
  const width = 420;
  const height = 310;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 88;
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const n = dimensions.length;
  const lineHeight = 12;

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
      className="mx-auto -mb-4 -mt-2 block h-auto w-full max-w-[380px]"
    >
      {levels.map((level, li) => (
        <polygon
          key={li}
          points={toPolygon(
            Array.from({ length: n }, (_, i) => point(level * radius, i)),
          )}
          fill="none"
          stroke="#000"
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
            stroke="#000"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={toPolygon(dataPoints)}
        fill="#2f5aa8"
        fillOpacity={0.16}
        stroke="#2f5aa8"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#2f5aa8" />
      ))}

      {dimensions.map((d, i) => {
        const p = point(radius + 36, i);
        const anchor =
          Math.abs(p.x - cx) < 4 ? "middle" : p.x > cx ? "start" : "end";
        const startY = p.y - ((d.lines.length - 1) * lineHeight) / 2;
        return (
          <text
            key={i}
            x={p.x}
            y={startY}
            textAnchor={anchor}
            className="fill-black/50 uppercase"
            fontSize={9.5}
            fontWeight={700}
            style={{ letterSpacing: "0.03em" }}
          >
            {d.lines.map((line, li) => (
              <tspan key={li} x={p.x} dy={li === 0 ? 0 : lineHeight}>
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
  title: "Aprovação de Roteiro | Ajisai",
  description: "Página privada de aprovação de rascunho de roteiro.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AprovacaoRoteiroPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-black/10 bg-white/60 px-6 py-5 shadow-[0_1px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl md:px-16">
        <img
          src="/images/logo-alpinea-v2-crop.png"
          alt="Alpinea — Empresa do Grupo Ajisai"
          className="h-[51px] w-auto object-contain md:h-16"
        />
        <span className="rounded-full border border-black/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-black/50">
          Draft para aprovação
        </span>
      </header>

      <section className="px-6 pb-4 pt-36 text-center md:px-16 md:pt-40">
        <div className="mx-auto max-w-2xl">
          <p className="mx-auto mb-4 block w-fit rounded-full bg-[#1b3a6b] px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-white">
            Aprovação do roteiro
          </p>
          <h1
            className={`${display.className} text-[1.9rem] font-medium leading-tight text-black md:text-[2.4rem]`}
          >
            Confirme as informações principais da sua viagem
          </h1>
          <p className="mx-auto mt-5 text-sm leading-7 text-black/55 md:text-base">
            Revise abaixo a estrutura do seu roteiro de 7 dias. Ao aprovar,
            iniciamos a elaboração do seu painel digital personalizado.
          </p>
          <p className="mx-auto mt-4 text-xs leading-6 text-black/40 md:text-sm">
            Esta versão é apenas um rascunho, ela não contém mapas,
            informações de logística, transporte, detalhes dos restaurantes,
            detalhe das lojas, resumo do dia, horário de funcionamento,
            horário indicado para chegada e saída, entre outras informações
            que serão adicionadas durante a criação da versão final do
            roteiro personalizado.
          </p>
        </div>
      </section>

      <section className="px-5 pb-4 md:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-8">
            <p className="mx-auto mb-5 block w-fit rounded-full border border-black/15 px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-black/65">
              Dados do Cliente
            </p>
            <div className="grid grid-cols-1 gap-5 border-b border-black/10 pb-6 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Data da Contratação
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  28 de Julho de 2026
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Cliente
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  Rafael Serafim Sousa
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Duração
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  7 Dias
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <img
                src="/images/emirates-logo.png"
                alt="Emirates"
                className="h-24 w-auto rounded-md object-contain sm:h-28"
              />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Companhia Aérea
                </p>
                <p className="text-sm font-semibold text-black">Emirates</p>
              </div>
            </div>

            <div className="relative mt-5">
              <img
                src="/images/goku-flying.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 z-0 h-20 w-20 -translate-x-1/2 translate-y-3 object-contain opacity-80 sm:h-24 sm:w-24"
              />
              <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Ida · 03–04 Mai 2027
                  </p>
                  <div className="space-y-1.5 text-sm text-black/70">
                    <p>
                      <span className="font-semibold text-black">EK262</span>{" "}
                      · GRU → DXB · 01:35 → 23:00
                    </p>
                    <p>
                      <span className="font-semibold text-black">EK318</span>{" "}
                      · DXB → NRT · 23:40 → 17:35
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/40">
                    Chegada em Tokyo pelo Aeroporto de Narita (NRT), Terminal 2
                  </p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Volta · 12 Mai 2027
                  </p>
                  <div className="space-y-1.5 text-sm text-black/70">
                    <p>
                      <span className="font-semibold text-black">EK313</span>{" "}
                      · HND → DXB · 00:05 → 06:25
                    </p>
                    <p>
                      <span className="font-semibold text-black">EK261</span>{" "}
                      · DXB → GRU · 06:05 → 17:40
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/40">
                    Saída de Tokyo pelo Aeroporto de Haneda (HND), Terminal 3
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="mx-auto mb-1 block w-fit rounded-full border border-black/15 px-5 py-2 text-center text-xs uppercase tracking-[0.3em] text-black/65">
                Perfil do Viajante
              </p>
              <RadarChart dimensions={RADAR_DIMENSIONS} />
              <div className="mx-auto -mt-2 grid max-w-lg grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {RADAR_DIMENSIONS.map((d, i) => {
                  const stars = starsFromScore(d.score);
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <DimensionIcon
                        kind={d.icon}
                        className="h-4 w-4 shrink-0 text-[#2f5aa8]"
                      />
                      <p className="text-xs text-black/70">
                        {d.lines.join(" ")}
                      </p>
                      <span className="ml-auto shrink-0 text-xs tracking-tight text-[#2f5aa8]">
                        {"★".repeat(stars)}
                        <span className="text-[#2f5aa8]/25">
                          {"★".repeat(5 - stars)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 pt-32 md:px-16 md:pb-16 md:pt-48">
        <div className="mx-auto max-w-4xl">
          <ApprovalPanel
            displayClassName={display.className}
            approvalKey={APPROVAL_KEY}
          />
        </div>
      </section>

      <footer className="border-t border-black/10 px-6 py-8 text-center text-xs text-black/40 md:px-16">
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
