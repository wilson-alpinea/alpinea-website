import { Bodoni_Moda } from "next/font/google";

// Dashboard de viagem — usado em todos os roteiros vendidos, do Alpinea
// Design ao Alpinea Private. Mostra o roteiro diário, guias e anexos
// especiais do pacote. Em amostras gratuitas, normalmente só o Dia 1
// recebe `href` (os demais ficam sem link, apenas ilustrativos).

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

function Cell({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
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
    <div className="block cursor-default rounded-lg border border-white/10 px-4 py-3 opacity-40">
      {inner}
    </div>
  );
}

function CellGroup({
  title,
  items,
  dayMode = false,
}: {
  title: string;
  items: (DayCell | LinkCell)[];
  dayMode?: boolean;
}) {
  return (
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">{title}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {dayMode
          ? (items as DayCell[]).map((d) => (
              <Cell key={d.day} title={`Dia ${d.day}`} subtitle={`${d.date} · ${d.city}`} href={d.href} />
            ))
          : (items as LinkCell[]).map((g) => <Cell key={g.label} title={g.label} href={g.href} />)}
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
    <div>
      <p className={`${display.className} mb-10 text-2xl font-medium text-white md:text-3xl`}>
        Meu Dashboard de Viagem
      </p>

      <div className="space-y-12">
        <div>
          <CellGroup title="Roteiro Diário" items={days} dayMode />
          <p className="mt-4 text-xs text-white/30">
            Nesta amostra, apenas o Dia 1 está disponível para visualização.
          </p>
        </div>

        <CellGroup title="Guias" items={guides} />
        <CellGroup title="Anexos Especiais" items={annexes} />
      </div>
    </div>
  );
}
