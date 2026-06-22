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
};

function Cell({
  title,
  subtitle,
  href,
  borderColor,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  borderColor?: string;
}) {
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
  const maxDays = Math.max(...stops.map((s) => s.days));
  const maxSize = 72;
  const minSize = 30;

  return (
    <div className="mb-12 flex flex-wrap items-start justify-center gap-y-6">
      {stops.map((stop, i) => {
        const size = Math.round(minSize + (stop.days / maxDays) * (maxSize - minSize));
        return (
          <div key={i} className="flex items-center">
            <div className="flex w-24 flex-col items-center gap-3">
              <div className="flex shrink-0 items-center justify-center" style={{ height: maxSize }}>
                <div
                  className="rounded-full border"
                  style={{
                    width: size,
                    height: size,
                    borderColor: CITY_BORDER[stop.city] ?? "rgba(255,255,255,0.3)",
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">{stop.city}</p>
                <p className="text-[11px] text-white/35">
                  {stop.days} {stop.days === 1 ? "dia" : "dias"}
                </p>
              </div>
            </div>

            {i < stops.length - 1 && (
              <div className="flex shrink-0 items-center justify-center" style={{ height: maxSize, width: 28 }}>
                <svg width="28" height="10" viewBox="0 0 28 10" fill="none">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <path d="M18 1 L26 5 L18 9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
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
    <div>
      <p className={`${display.className} mb-8 text-2xl font-medium text-white md:text-3xl`}>
        Meu Dashboard de Viagem
      </p>

      <TripFlow days={days} />

      <div className="space-y-12">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/40">Roteiro Diário</p>
          <p className="mb-6 text-xs text-white/30">
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
