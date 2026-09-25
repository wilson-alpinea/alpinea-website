"use client";

import type { Cambio } from "../hooks/useCambioUSD";

// Rótulo padrão mostrado embaixo de qualquer preço convertido pra dólar —
// deixa claro qual cotação foi usada e a fonte, inclusive quando cai no
// fallback (fonte indisponível no momento).
//
// Pedido do Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar o
// valor de dólar turismo" — esse componente passou a mostrar o texto de
// `cambio.fonte` (em vez de sempre escrever "PTAX Banco Central" fixo),
// já que agora alimenta tanto o PTAX (a maioria das páginas) quanto o
// dólar turismo (só o JR Pass, ver app/lib/cambioDolarTurismo.ts). O
// spread aplicado em cima da cotação de base nunca aparece aqui — mesma
// regra já usada no câmbio de ienes (nunca expor margem/fornecedor em
// texto público).
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
        Câmbio estimado: US$ 1 = R$ {cambio.cotacao.toFixed(2).replace(".", ",")} — {cambio.fonte}.
      </p>
    );
  }

  return (
    <p className={className}>
      Câmbio do dia: US$ 1 = R$ {cambio.cotacao.toFixed(2).replace(".", ",")}
      {cambio.data ? ` (${cambio.fonte}, ${cambio.data})` : ` (${cambio.fonte})`}
    </p>
  );
}
