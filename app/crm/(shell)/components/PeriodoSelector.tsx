"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Período da seção "Resultados do período" (só ela usa este filtro).
// Navegação no cliente (sem recarregar a página inteira) e o calendário
// fecha ao aplicar (Wilson, 23/out/2026: "a tela está travando e não
// recolhe o calendário").
const PRESETS = [
  { valor: "7", label: "7 dias" },
  { valor: "30", label: "30 dias" },
  { valor: "90", label: "90 dias" },
];

const pill =
  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30 disabled:cursor-wait";
const campo =
  "w-full rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-[#20252B] outline-none focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";

// `base`: página que recebe ?periodo= (Visão geral de cada CRM — Wilson, 29/out/2026).
export function PeriodoSelector({ periodoAtivo, de, ate, base = "/crm" }: { periodoAtivo: string; de?: string; ate?: string; base?: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [alvo, setAlvo] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const deRef = useRef<HTMLInputElement>(null);
  const ateRef = useRef<HTMLInputElement>(null);

  function ir(query: string, periodo: string) {
    setAlvo(periodo);
    setAberto(false);
    iniciar(() => router.push(`${base}${base.includes("?") ? "&" : "?"}${query}`, { scroll: false }));
  }

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const d = deRef.current?.value ?? "";
    const a = ateRef.current?.value ?? "";
    if (!d || !a) return setErro("Informe as duas datas.");
    if (d > a) return setErro("A data inicial deve ser anterior à final.");
    setErro(null);
    ir(`periodo=custom&de=${d}&ate=${a}`, "custom");
  }

  const ativo = pendente && alvo ? alvo : periodoAtivo;

  return (
    <div className="relative flex flex-wrap items-center gap-1 rounded-xl border border-[#D5DAE0] bg-white p-1" role="group" aria-label="Período dos resultados" aria-busy={pendente}>
      {PRESETS.map((p) => (
        <button
          key={p.valor}
          type="button"
          disabled={pendente}
          aria-pressed={ativo === p.valor}
          onClick={() => ir(`periodo=${p.valor}`, p.valor)}
          className={`${pill} ${ativo === p.valor ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        disabled={pendente}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={`${pill} ${ativo === "custom" ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
      >
        Personalizado
      </button>
      {pendente && <span className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-[#24476B]/25 border-t-[#24476B]" aria-label="Atualizando" />}

      {aberto && (
        <>
          <button type="button" aria-label="Fechar" className="crm-livre fixed inset-0 z-10 cursor-default" onClick={() => setAberto(false)} />
          <form onSubmit={aplicar} className="absolute right-0 top-full z-20 mt-2 flex w-60 flex-col gap-3 rounded-xl border border-[#E6E9ED] bg-white p-4 shadow-lg">
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-[#626B75]">De</span>
              <input ref={deRef} type="date" defaultValue={de} required className={campo} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-[#626B75]">Até</span>
              <input ref={ateRef} type="date" defaultValue={ate} required className={campo} />
            </label>
            {erro && (
              <p role="alert" className="text-[13px] text-[#B42318]">
                {erro}
              </p>
            )}
            <button type="submit" className="rounded-lg bg-[#24476B] px-3 py-2 text-sm font-medium text-white hover:bg-[#2C5480]">
              Aplicar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
