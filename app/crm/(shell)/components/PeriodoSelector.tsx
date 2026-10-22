import Link from "next/link";

// Período da seção "Resultados do período" (só ela usa este filtro).
const PRESETS = [
  { valor: "7", label: "7 dias" },
  { valor: "30", label: "30 dias" },
  { valor: "90", label: "90 dias" },
];

const pill =
  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30";

export function PeriodoSelector({ periodoAtivo, de, ate }: { periodoAtivo: string; de?: string; ate?: string }) {
  const personalizado = periodoAtivo === "custom";
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#D5DAE0] bg-white p-1" role="group" aria-label="Período dos resultados">
      {PRESETS.map((p) => (
        <Link
          key={p.valor}
          href={`/crm?periodo=${p.valor}#resultados`}
          scroll={false}
          aria-current={periodoAtivo === p.valor ? "true" : undefined}
          className={`${pill} ${periodoAtivo === p.valor ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
        >
          {p.label}
        </Link>
      ))}
      <details className="relative" open={personalizado}>
        <summary className={`${pill} cursor-pointer list-none [&::-webkit-details-marker]:hidden ${personalizado ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}>
          Personalizado
        </summary>
        <form method="get" action="/crm#resultados" className="absolute right-0 z-20 mt-2 flex w-60 flex-col gap-3 rounded-xl border border-[#E6E9ED] bg-white p-4 shadow-lg">
          <input type="hidden" name="periodo" value="custom" />
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-[#626B75]">De</span>
            <input type="date" name="de" defaultValue={de} required className="w-full rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-[#20252B] outline-none focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-[#626B75]">Até</span>
            <input type="date" name="ate" defaultValue={ate} required className="w-full rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-[#20252B] outline-none focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25" />
          </label>
          <button type="submit" className="rounded-lg bg-[#24476B] px-3 py-2 text-sm font-medium text-white hover:bg-[#2C5480]">
            Aplicar
          </button>
        </form>
      </details>
    </div>
  );
}
