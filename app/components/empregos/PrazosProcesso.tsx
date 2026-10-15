import { AVISO_PRAZOS, PASSOS_PRAZO, type EtapaPrazo } from "@/app/lib/prazosCandidatura";

// Linha do tempo do processo seletivo — Wilson, 08/out/2026: "transformar
// em menu horizontal, mais simples, deixar claro SLA e tempo entre cada
// etapa" (antes era uma lista vertical dentro de um <details>). Cada etapa
// mostra um nome curto e o prazo (SLA) num selo; no celular a faixa rola
// para o lado. O texto completo de cada etapa fica no title (passar o
// mouse). Sem hooks — funciona em página de servidor e em cliente.
// `aberto` é aceito por compatibilidade com as chamadas antigas.
export default function PrazosProcesso({
  atual,
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
    <section aria-label="Etapas e prazos do processo" className={`rounded-2xl border border-black/10 bg-white ${className}`}>
      <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">Etapas e prazos</p>
      <div className="overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:thin]">
        <ol className="flex min-w-max">
          {passos.map((p, i) => {
            const feito = i < idxAtual;
            const agora = i === idxAtual;
            return (
              <li key={p.id} className="relative w-[112px] shrink-0 pr-2" title={[p.titulo, p.prazo, p.detalhe].filter(Boolean).join(" — ")}>
                {/* linha até a próxima etapa */}
                {i < passos.length - 1 && (
                  <span className={`absolute left-[22px] right-0 top-[10px] h-0.5 ${feito ? "bg-emerald-600" : "bg-black/10"}`} aria-hidden="true" />
                )}
                <span
                  className={`relative flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-semibold ${
                    feito
                      ? "bg-emerald-600 text-white"
                      : agora
                        ? "bg-[#2f80c9] text-white ring-4 ring-[#2f80c9]/15"
                        : "border-2 border-black/15 bg-white text-black/40"
                  }`}
                >
                  {feito ? "✓" : i + 1}
                </span>
                <p className={`mt-2 text-xs font-medium leading-4 ${agora ? "text-[#2f80c9]" : feito ? "text-black/45" : "text-black/80"}`}>
                  {p.curto}
                  {p.opcional && <span className="font-normal text-black/40"> *</span>}
                </p>
                <span
                  className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ${
                    agora ? "bg-[#2f80c9]/10 text-[#2f80c9]" : "bg-black/[0.05] text-black/60"
                  }`}
                >
                  {p.sla}
                </span>
                {agora && <p className="mt-1 text-[10px] font-medium text-[#2f80c9]">Você está aqui</p>}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="border-t border-black/[0.06] px-4 py-2.5 text-[11px] leading-4 text-black/40">
        {!semEtapa3 && "* Financiamento só quando a empresa não custeia visto, certificado e passagem. "}
        {AVISO_PRAZOS}
      </p>
    </section>
  );
}
