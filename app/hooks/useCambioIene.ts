"use client";

import { useEffect, useState } from "react";
import {
  CIDADES_CAMBIO_IENE,
  COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
  COTACAO_FALLBACK_BRL_POR_JPY_VENDA,
  type CambioIene,
  type CidadeCambioIeneSlug,
  type DirecaoCambioIene,
} from "../lib/cambioIene";

export { CIDADES_CAMBIO_IENE };
export type { CambioIene, CidadeCambioIeneSlug, DirecaoCambioIene };

// Câmbio do dólar (useCambioUSD) tem 1 valor só pro Brasil inteiro — o
// iene "papel moeda" varia por cidade (cada praça tem seu próprio
// conjunto de casas de câmbio no melhorcambio.com) e por direção
// (compra/venda são páginas e valores diferentes no melhorcambio.com —
// pedido do Wilson, 25/set/2026, ver app/lib/cambioIene.ts), então o
// cache aqui é por "cidade:direção", não único.
const cache = new Map<string, CambioIene>();
const promises = new Map<string, Promise<CambioIene>>();

function chaveCache(cidade: CidadeCambioIeneSlug, direcao: DirecaoCambioIene) {
  return `${cidade}:${direcao}`;
}

function buscarCambioIene(cidade: CidadeCambioIeneSlug, direcao: DirecaoCambioIene): Promise<CambioIene> {
  const chave = chaveCache(cidade, direcao);
  const emCache = cache.get(chave);
  if (emCache) return Promise.resolve(emCache);

  let promise = promises.get(chave);
  if (!promise) {
    promise = fetch(`/api/cambio-iene?cidade=${cidade}&direcao=${direcao}`)
      .then((r) => r.json())
      .then((data: CambioIene) => {
        cache.set(chave, data);
        return data;
      })
      .catch(() => {
        const fallback: CambioIene = {
          cotacaoBRLPorJPY:
            direcao === "venda" ? COTACAO_FALLBACK_BRL_POR_JPY_VENDA : COTACAO_FALLBACK_BRL_POR_JPY_COMPRA,
          cidade,
          direcao,
          fonte: "estimativa — cotação indisponível",
          fallback: true,
        };
        cache.set(chave, fallback);
        return fallback;
      });
    promises.set(chave, promise);
  }
  return promise;
}

// Retorna null enquanto a cotação da cidade/direção escolhida ainda não
// carregou. `direcao` é opcional (default "compra") pra não quebrar quem
// já chamava esse hook só com a cidade (Calculadora Reversa interna).
export function useCambioIene(
  cidade: CidadeCambioIeneSlug,
  direcao: DirecaoCambioIene = "compra",
): CambioIene | null {
  const chaveAtual = chaveCache(cidade, direcao);
  const [cambio, setCambio] = useState<CambioIene | null>(() => cache.get(chaveAtual) ?? null);
  // Guarda qual chave (cidade+direção) gerou o "cambio" atual — quando o
  // usuário troca de cidade ou direção, ajustamos o estado durante a
  // própria renderização (padrão recomendado pelo React pra "resetar"
  // estado quando uma prop muda), em vez de chamar setState de forma
  // síncrona dentro de um efeito.
  const [chaveDoEstado, setChaveDoEstado] = useState(chaveAtual);

  if (chaveAtual !== chaveDoEstado) {
    setChaveDoEstado(chaveAtual);
    setCambio(cache.get(chaveAtual) ?? null);
  }

  useEffect(() => {
    if (cache.get(chaveAtual)) return;
    let ativo = true;
    buscarCambioIene(cidade, direcao).then((c) => {
      if (ativo) setCambio(c);
    });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAtual]);

  return cambio;
}
