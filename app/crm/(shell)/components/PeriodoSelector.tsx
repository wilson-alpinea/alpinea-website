import Link from "next/link";

const PRESETS = [
  { valor: "7", label: "7 dias" },
  { valor: "15", label: "15 dias" },
  { valor: "30", label: "30 dias" },
];

const pillBase =
  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap";
const pillInativo = "border-black/15 text-black/50 hover:border-black/30 hover:text-black";
const pillAtivo = "border-[#1C3A5E] bg-[#1C3A5E] text-white";

export function PeriodoSelector({
  periodoAtivo,
  de,
  ate,
}: {
  periodoAtivo: string;
  de?: string;
  ate?: string;
}) {
  const personalizado = periodoAtivo === "custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <Link
          key={p.valor}
          href={`/crm?dias=${p.valor}`}
          className={`${pillBase} ${periodoAtivo === p.valor ? pillAtivo : pillInativo}`}
        >
          {p.label}
        </Link>
      ))}

      <details className="relative" open={personalizado}>
        <summary
          className={`${pillBase} ${personalizado ? pillAtivo : pillInativo} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}
        >
          Personalizado
        </summary>

        <form
          method="get"
          className="absolute right-0 z-20 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
        >
          <input type="hidden" name="dias" value="custom" />

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-black/40">De</span>
            <input
              type="date"
              name="de"
              defaultValue={de}
              required
              className="w-full rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs text-black outline-none transition focus:border-black/40"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-black/40">Até</span>
            <input
              type="date"
              name="ate"
              defaultValue={ate}
              required
              className="w-full rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs text-black outline-none transition focus:border-black/40"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1C3A5E] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#254a73]"
          >
            Aplicar
          </button>
        </form>
      </details>
    </div>
  );
}
