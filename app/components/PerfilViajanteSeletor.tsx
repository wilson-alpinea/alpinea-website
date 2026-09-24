"use client";

import {
  PERFIS_VIAJANTE,
  type PerfilViajanteKey,
} from "../lib/calculadoraCatalogoPublico";

/** Seletor do perfil do viajante (ritmo do roteiro) — usado nas duas calculadoras. */
export default function PerfilViajanteSeletor({
  value,
  onChange,
}: {
  value: PerfilViajanteKey;
  onChange: (v: PerfilViajanteKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {PERFIS_VIAJANTE.map((p) => {
        const marcado = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            aria-pressed={marcado}
            className={`relative flex flex-col items-center gap-2 rounded-xl border px-3 pb-4 pt-4 text-center transition ${
              marcado
                ? "border-[#2f80c9] bg-[#2f80c9]/10 ring-1 ring-[#2f80c9]"
                : "border-black/10 bg-white hover:border-black/30"
            }`}
          >
            {p.recomendado && (
              <span className="absolute right-2 top-2 rounded-full bg-[#2f80c9] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                Recomendado
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imagem} alt="" className="h-16 w-16 rounded-full" />
            <span className={`text-sm font-medium ${marcado ? "text-[#2f80c9]" : "text-[#0A2540]"}`}>
              {p.nome}
            </span>
            <span className="text-xs font-medium leading-4 text-black/70">{p.pontosPorDia}</span>
            <span className="text-xs leading-4 text-black/60">{p.descricao}</span>
            <ul className="space-y-0.5 text-[11px] leading-4 text-black/60">
              {p.destaques.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
