import { Bodoni_Moda } from "next/font/google";

// Dashboard de viagem — usado em todos os roteiros vendidos, do Alpinea
// Design ao Alpinea Private. Mostra o esquema de fluxo da viagem, o
// roteiro diário, guias e anexos especiais do pacote. Em amostras
// gratuitas, normalmente só o Dia 1 recebe `href` (os demais ficam sem
// link, apenas ilustrativos).

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export type DayCell = {
  day: number;
  date: string;
  city: string;
  href?: string;
};

export type LinkCell = {
  label: string;
  href?: string;
};

// Tons muito sutis por cidade — só para sugerir o fluxo da viagem,
// sem fugir da paleta neutra do site.
const CITY_BORDER: Record<string, string> = {
  Tokyo: "rgba(255,255,255,0.16)",
  Osaka: "rgba(196,148,110,0.45)",
  Kyoto: "rgba(118,150,168,0.45)",
  Nara: "rgba(150,172,120,0.45)",
};

function Cell({
  title,
  subtitle,
  href,
  borderColor,
  highlighted = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  borderColor?: string;
  highlighted?: boolean;
}) {
  if (highlighted) {
    return (
      <a
        href={href}
        className="block rounded-lg bg-white px-4 py-3 transition hover:bg-white/90"
      >
        <p className="text-sm font-semibold text-black">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-black/60">{subtitle}</p>}
      </a>
    );
  }

  const inner = (
    <>
      <p className="text-sm font-medium text-white">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-white/40">{subtitle}</p>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg border border-white/20 px-4 py-3 transition hover:border-white/50 hover:bg-white/[0.04]"
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className="block cursor-default rounded-lg border px-4 py-3 opacity-[0.55]"
      style={{ borderColor: borderColor ?? "rgba(255,255,255,0.1)" }}
    >
      {inner}
    </div>
  );
}

function CellGroup({ title, items }: { title: string; items: LinkCell[] }) {
  return (
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">{title}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {items.map((g) => (
          <Cell key={g.label} title={g.label} href={g.href} />
        ))}
      </div>
    </div>
  );
}

function computeStops(days: DayCell[]) {
  const stops: { city: string; days: number }[] = [];
  for (const d of days) {
    const last = stops[stops.length - 1];
    if (last && last.city === d.city) {
      last.days += 1;
    } else {
      stops.push({ city: d.city, days: 1 });
    }
  }
  return stops;
}

function TripFlow({ days }: { days: DayCell[] }) {
  const stops = computeStops(days);
  const circleSize = 56;
  const arrowWidth = 28;

  return (
    <div className="mb-12 flex flex-col items-center">
      {/* Linha dos círculos e setas — todos do mesmo tamanho, setas centralizadas */}
      <div className="flex items-center justify-center">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center">
            <div
              className="shrink-0 rounded-full border"
              style={{
                width: circleSize,
                height: circleSize,
                borderColor: CITY_BORDER[stop.city] ?? "rgba(255,255,255,0.3)",
                backgroundColor: CITY_BORDER[stop.city] ?? "rgba(255,255,255,0.3)",
              }}
            />
            {i < stops.length - 1 && (
              <svg width={arrowWidth} height="10" viewBox="0 0 28 10" fill="none" className="mx-1 shrink-0">
                <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path d="M18 1 L26 5 L18 9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Linha das legendas — mesma largura dos círculos, alinhada por baixo deles */}
      <div className="mt-3 flex items-start justify-center">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center">
            <div className="text-center" style={{ width: circleSize }}>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">{stop.city}</p>
              <p className="text-[11px] text-white/35">
                {stop.days} {stop.days === 1 ? "dia" : "dias"}
              </p>
            </div>
            {i < stops.length - 1 && <div className="mx-1 shrink-0" style={{ width: arrowWidth }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TripDashboard({
  days,
  guides,
  annexes,
}: {
  days: DayCell[];
  guides: LinkCell[];
  annexes: LinkCell[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 sm:rounded-[2rem] sm:p-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-white/40">Cidades</p>
      <TripFlow days={days} />

      <div className="space-y-12">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/40">Roteiro Diário</p>
          <p className="mb-6 inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
            Nesta amostra, apenas o Dia 1 está disponível para visualização.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {days.map((d) => (
              <Cell
                key={d.day}
                title={d.href ? `Dia ${d.day} →` : `Dia ${d.day}`}
                subtitle={`${d.date} · ${d.city}`}
                href={d.href}
                borderColor={CITY_BORDER[d.city]}
                highlighted={!!d.href}
              />
            ))}
          </div>
        </div>

        <CellGroup title="Guias" items={guides} />
        <CellGroup title="Anexos Especiais" items={annexes} />
      </div>
    </div>
  );
}
