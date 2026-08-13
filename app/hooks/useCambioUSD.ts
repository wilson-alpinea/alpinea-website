"use client";

import { useEffect, useState } from "react";

export type Cambio = {
  cotacao: number;
  data: string | null;
  fonte: string;
  fallback: boolean;
};

const COTACAO_FALLBACK: Cambio = {
  cotacao: 5.3,
  data: null,
  fonte: "estimativa — cotação indisponível",
  fallback: true,
};

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

// "US$ X.XXX" (convenção brasileira) em vez do "$X,XXX" padrão do
// Intl/en-US — evita ambiguidade com outros símbolos de dólar e casa com o
// "R$" usado no resto do site.
export function formatUSD(valor: number): string {
  return `US$ ${Math.round(valor).toLocaleString("en-US")}`;
}

// Converte um valor em reais pra dólar usando a cotação carregada — "…"
// enquanto a cotação ainda não chegou (evita mostrar um valor errado por
// um instante).
export function brlParaUSDLabel(valorBRL: number, cambio: Cambio | null): string {
  if (!cambio) return "…";
  return formatUSD(valorBRL / cambio.cotacao);
}
