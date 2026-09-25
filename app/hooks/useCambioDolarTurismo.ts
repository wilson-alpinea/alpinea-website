"use client";

import { useEffect, useState } from "react";
import {
  COTACAO_FALLBACK_DOLAR_TURISMO,
  type CambioDolarTurismo,
} from "../lib/cambioDolarTurismo";

export type { CambioDolarTurismo } from "../lib/cambioDolarTurismo";

// Mesmo padrão de cache em memória de useCambioUSD.ts — evita que cada
// card/seção na mesma página dispare sua própria requisição.
let cambioTurismoCache: CambioDolarTurismo | null = null;
let cambioTurismoPromise: Promise<CambioDolarTurismo> | null = null;

const FALLBACK: CambioDolarTurismo = {
  cotacao: COTACAO_FALLBACK_DOLAR_TURISMO,
  data: null,
  fonte: "estimativa — cotação indisponível",
  fallback: true,
};

function buscarCambioDolarTurismo(): Promise<CambioDolarTurismo> {
  if (cambioTurismoCache) return Promise.resolve(cambioTurismoCache);
  if (!cambioTurismoPromise) {
    cambioTurismoPromise = fetch("/api/cambio-dolar-turismo")
      .then((r) => r.json())
      .then((data: CambioDolarTurismo) => {
        cambioTurismoCache = data;
        return data;
      })
      .catch(() => {
        cambioTurismoCache = FALLBACK;
        return FALLBACK;
      });
  }
  return cambioTurismoPromise;
}

// Retorna null enquanto a cotação do dia ainda não carregou. Pedido do
// Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar o valor de
// dólar turismo" — ver app/lib/cambioDolarTurismo.ts pro contexto
// completo. Só usado no JrPassModal (app/produtos/page.tsx) por
// enquanto.
export function useCambioDolarTurismo(): CambioDolarTurismo | null {
  const [cambio, setCambio] = useState<CambioDolarTurismo | null>(cambioTurismoCache);

  useEffect(() => {
    if (cambioTurismoCache) return;
    let ativo = true;
    buscarCambioDolarTurismo().then((c) => {
      if (ativo) setCambio(c);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return cambio;
}
