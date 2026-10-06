import { AVISO_PRAZOS, PASSOS_PRAZO, type EtapaPrazo } from "@/app/lib/prazosCandidatura";

// Linha do tempo com a expectativa de prazo de cada etapa do processo
// seletivo (Wilson, 06/out/2026). Sem hooks — funciona em página de
// servidor e em componente de cliente. Usa <details> para não ocupar
// espaço quando fechado.
export default function PrazosProcesso({
  atual,
  aberto = false,
  semEtapa3 = false,
  className = "",
}: {
  atual: EtapaPrazo;
  aberto?: boolean;
  semEtapa3?: boolean;
  className?: string;
}) {
  const passos = PASSOS_PRAZO.filter((p) => !(semEtapa3 && p.id === "etapa3"));
  const idxAtual = atual === "agendado" ? passos.findIndex((p) => p.id === "etapa4") + 1 : passos.findIndex((p) => p.id === atual);

  return (
    <details open={aberto} className={`group rounded-2xl border border-black/10 bg-white ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">
        Quanto tempo leva cada etapa?
        <span className="text-base leading-none text-black/30 transition group-open:rotate-45">+</span>
      </summary>
      <ol className="border-t border-black/[0.06] px-4 py-4">
        {passos.map((p, i) => {
          const feito = i < idxAtual;
          const agora = i === idxAtual;
          return (
            <li key={p.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < passos.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-black/10" aria-hidden="true" />}
              <span
                className={`relative mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                  feito ? "border-emerald-600 bg-emerald-600" : agora ? "border-[#2f80c9] bg-white ring-4 ring-[#2f80c9]/15" : "border-black/15 bg-white"
                }`}
              />
              <div className="min-w-0">
                <p className={`text-xs font-medium ${agora ? "text-[#2f80c9]" : feito ? "text-black/50" : "text-black/80"}`}>
                  {p.titulo}
                  {agora && <span className="ml-1.5 rounded-full bg-[#2f80c9]/10 px-1.5 py-0.5 text-[10px]">você está aqui</span>}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-black/55">{p.prazo}</p>
                {p.detalhe && <p className="mt-0.5 text-[11px] leading-4 text-black/45">{p.detalhe}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-black/[0.06] px-4 py-3 text-[11px] leading-4 text-black/40">{AVISO_PRAZOS}</p>
    </details>
  );
}
