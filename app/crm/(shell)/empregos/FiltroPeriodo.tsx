"use client";

// Seletor de período do CRM de Empregos (Wilson, 15/out/2026). Fica dentro
// do <form method="get"> da página — só mostra as datas quando
// "Personalizado" está escolhido.
import { useState } from "react";

export const OPCOES_PERIODO = [
  { valor: "inicio", label: "Desde o início" },
  { valor: "semana", label: "Esta semana" },
  { valor: "mes", label: "Este mês" },
  { valor: "30d", label: "Últimos 30 dias" },
  { valor: "7d", label: "Últimos 7 dias" },
  { valor: "personalizado", label: "Personalizado" },
] as const;

export default function FiltroPeriodo({ periodo, de, ate }: { periodo: string; de: string; ate: string }) {
  const [valor, setValor] = useState(periodo);
  const campo = "rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#1C3A5E]";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select name="periodo" value={valor} onChange={(e) => setValor(e.target.value)} className={campo} aria-label="Período">
        {OPCOES_PERIODO.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>
      {valor === "personalizado" && (
        <>
          <input type="date" name="de" defaultValue={de} className={campo} aria-label="De" />
          <span className="text-xs text-black/40">até</span>
          <input type="date" name="ate" defaultValue={ate} className={campo} aria-label="Até" />
        </>
      )}
    </div>
  );
}
