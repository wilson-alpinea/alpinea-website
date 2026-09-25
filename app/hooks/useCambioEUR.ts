"use client";

import { useEffect, useState } from "react";
import { COTACAO_FALLBACK_EUR, type Cambio } from "../lib/currency";

export type { Cambio } from "../lib/currency";
// Mesmo padrão de useCambioUSD.ts — cache simples em memória (módulo), um
// fetch só compartilhado por todos os consumidores na mesma página.
// Adicionado 25/set/2026 pra página pública de Câmbio (Wilson: "deixar
// pelo menos 3 moedas disponiveis para transação Real, Euro e Dolar").
export { formatEUR } from "../lib/currency";

let cambioCache: Cambio | null = null;
let cambioPromise: Promise<Cambio> | null = null;

function buscarCambio(): Promise<Cambio> {
  if (cambioCache) return Promise.resolve(cambioCache);
  if (!cambioPromise) {
    cambioPromise = fetch("/api/cambio-eur")
      .then((r) => r.json())
      .then((data: Cambio) => {
        cambioCache = data;
        return data;
      })
      .catch(() => {
        cambioCache = COTACAO_FALLBACK_EUR;
        return COTACAO_FALLBACK_EUR;
      });
  }
  return cambioPromise;
}

// Retorna null enquanto a cotação do dia ainda não carregou.
export function useCambioEUR(): Cambio | null {
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
