"use client";

import { useEffect, useState } from "react";
import {
  CIDADES_CAMBIO_IENE,
  COTACAO_FALLBACK_BRL_POR_JPY,
  type CambioIene,
  type CidadeCambioIeneSlug,
} from "../lib/cambioIene";

export { CIDADES_CAMBIO_IENE };
export type { CambioIene, CidadeCambioIeneSlug };

// Câmbio do dólar (useCambioUSD) tem 1 valor só pro Brasil inteiro — o
// iene "papel moeda" varia por cidade (cada praça tem seu próprio
// conjunto de casas de câmbio no melhorcambio.com), então o cache aqui é
// por cidade, não único.
const cache = new Map<CidadeCambioIeneSlug, CambioIene>();
const promises = new Map<CidadeCambioIeneSlug, Promise<CambioIene>>();

function buscarCambioIene(cidade: CidadeCambioIeneSlug): Promise<CambioIene> {
  const emCache = cache.get(cidade);
  if (emCache) return Promise.resolve(emCache);

  let promise = promises.get(cidade);
  if (!promise) {
    promise = fetch(`/api/cambio-iene?cidade=${cidade}`)
      .then((r) => r.json())
      .then((data: CambioIene) => {
        cache.set(cidade, data);
        return data;
      })
      .catch(() => {
        const fallback: CambioIene = {
          cotacaoBRLPorJPY: COTACAO_FALLBACK_BRL_POR_JPY,
          cidade,
          fonte: "estimativa — cotação indisponível",
          fallback: true,
        };
        cache.set(cidade, fallback);
        return fallback;
      });
    promises.set(cidade, promise);
  }
  return promise;
}

// Retorna null enquanto a cotação da cidade escolhida ainda não carregou.
export function useCambioIene(cidade: CidadeCambioIeneSlug): CambioIene | null {
  const [cambio, setCambio] = useState<CambioIene | null>(() => cache.get(cidade) ?? null);
  // Guarda qual cidade gerou o "cambio" atual — quando o usuário troca de
  // cidade, ajustamos o estado durante a própria renderização (padrão
  // recomendado pelo React pra "resetar" estado quando uma prop muda),
  // em vez de chamar setState de forma síncrona dentro de um efeito.
  const [cidadeDoEstado, setCidadeDoEstado] = useState(cidade);

  if (cidade !== cidadeDoEstado) {
    setCidadeDoEstado(cidade);
    setCambio(cache.get(cidade) ?? null);
  }

  useEffect(() => {
    if (cache.get(cidade)) return;
    let ativo = true;
    buscarCambioIene(cidade).then((c) => {
      if (ativo) setCambio(c);
    });
    return () => {
      ativo = false;
    };
  }, [cidade]);

  return cambio;
}
