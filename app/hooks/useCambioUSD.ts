"use client";

import { useEffect, useState } from "react";
import { COTACAO_FALLBACK, type Cambio } from "../lib/currency";

export type { Cambio } from "../lib/currency";
// Funções puras de formatação — vivem em ../lib/currency (sem "use
// client") pra poderem ser chamadas também de código que roda no
// servidor. Re-exportadas aqui só pra não quebrar os imports existentes.
export { formatUSD, formatBRL, brlParaUSDLabel } from "../lib/currency";

// Cache simples em memória (módulo) — evita que cada card de preço na
// mesma página dispare sua própria requisição pra /api/cambio; todos
// compartilham o mesmo fetch/resultado.
let cambioCache: Cambio | null = null;
let cambioPromise: Promise<Cambio> | null = null;

function buscarCambio(): Promise<Cambio> {
  if (cambioCache) return Promise.resolve(cambioCache);
  if (!cambioPromise) {
    cambioPromise = fetch("/api/cambio")
      .then((r) => r.json())
      .then((data: Cambio) => {
        cambioCache = data;
        return data;
      })
      .catch(() => {
        cambioCache = COTACAO_FALLBACK;
        return COTACAO_FALLBACK;
      });
  }
  return cambioPromise;
}

// Retorna null enquanto a cotação do dia ainda não carregou.
export function useCambioUSD(): Cambio | null {
  const [cambio, setCambio] = useState<Cambio | null>(cambioCache);

  useEffect(() => {
    if (cambioCache) return;
    let ativo = true;
    buscarCambio().then((c) => {
      if (ativo) setCambio(c);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return cambio;
}
