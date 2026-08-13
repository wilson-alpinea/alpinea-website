"use client";

import type { Cambio } from "../hooks/useCambioUSD";

// Rótulo padrão mostrado embaixo de qualquer preço convertido pra dólar —
// deixa claro qual cotação foi usada e a fonte, inclusive quando cai no
// fallback (cotação da BCB indisponível no momento).
export function CambioLabel({
  cambio,
  className = "text-[11px] text-white/40",
}: {
  cambio: Cambio | null;
  className?: string;
}) {
  if (!cambio) {
    return <p className={className}>Carregando cotação do dia…</p>;
  }

  if (cambio.fallback) {
    return (
      <p className={className}>
        Câmbio estimado: US$ 1 = R$ {cambio.cotacao.toFixed(2).replace(".", ",")} — cotação do
        Banco Central indisponível no momento.
      </p>
    );
  }

  return (
    <p className={className}>
      Câmbio do dia: US$ 1 = R$ {cambio.cotacao.toFixed(2).replace(".", ",")}
      {cambio.data ? ` (PTAX Banco Central, ${cambio.data})` : " (PTAX Banco Central)"}
    </p>
  );
}
