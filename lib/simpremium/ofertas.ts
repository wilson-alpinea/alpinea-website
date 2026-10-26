// Ofertas de eSIM da Ajisai montadas a partir do catálogo da Simpremium:
// só planos ILIMITADOS que cobrem o Japão (Wilson, 26/out/2026), com o
// preço final Ajisai por faixa de dias. Servidor apenas — o NET fica aqui
// dentro; a rota pública (/api/esim-planos) remove o NET antes de responder.
import { listarPlanosIlimitadosJapao } from "./client";
import { buscarCotacaoUSD } from "../../app/lib/cotacaoUSDServidor";
import { emReais, precoAjisaiUSD } from "../../app/lib/precoEsim";

export type FaixaOferta = { minDays: number; maxDays: number; netUsd: number; precoUSD: number; precoBRL: number };
export type PlanoOferta = { id: string; nome: string; faixas: FaixaOferta[] };
export type OfertasEsim = { cotacao: number; cotacaoFallback: boolean; planos: PlanoOferta[] };

let cache: { em: number; dados: OfertasEsim } | null = null;
const CACHE_MS = 10 * 60 * 1000;

export async function buscarOfertasEsim(opcoes: { semCache?: boolean } = {}): Promise<OfertasEsim> {
  if (!opcoes.semCache && cache && Date.now() - cache.em < CACHE_MS) return cache.dados;
  const [planos, { cotacao, fallback }] = await Promise.all([listarPlanosIlimitadosJapao(), buscarCotacaoUSD()]);
  const dados: OfertasEsim = {
    cotacao,
    cotacaoFallback: fallback,
    planos: planos.map((p) => ({
      id: p.id,
      nome: p.nome,
      faixas: p.faixas.map((f) => {
        const precoUSD = precoAjisaiUSD(f.priceUsd);
        return { minDays: f.minDays, maxDays: f.maxDays, netUsd: f.priceUsd, precoUSD, precoBRL: emReais(precoUSD, cotacao) };
      }),
    })),
  };
  cache = { em: Date.now(), dados };
  return dados;
}
