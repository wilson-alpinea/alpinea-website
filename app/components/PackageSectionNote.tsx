"use client";

import { CambioLabel } from "./CambioLabel";
import { useCambioUSD } from "../hooks/useCambioUSD";

export function PackageSectionNote() {
  const cambio = useCambioUSD();

  return (
    <div className="mt-6 flex flex-col gap-1.5 border-t border-white/10 pt-5 text-xs leading-5 text-white/40 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
      <p>Datas e valores aproximados, sujeitos à disponibilidade e alteração.</p>
      <span className="hidden text-white/20 sm:inline">·</span>
      <CambioLabel cambio={cambio} className="text-xs text-white/40" />
    </div>
  );
}
