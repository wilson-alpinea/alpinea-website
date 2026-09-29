import { NextResponse } from "next/server";
import {
  CidadeCambioIeneSlug,
  cidadeCambioIeneValida,
  type DirecaoCambioIene,
} from "../../lib/cambioIene";
import { buscarCotacaoIene } from "../../lib/cotacaoIeneServidor";

export const runtime = "nodejs";

// Cotação por cidade muda pouco ao longo do dia — revalida a cada 15 min
// pra não bater no melhorcambio.com a cada troca de cidade/valor na tela
// (mesmo critério usado em /api/cambio pro dólar).
export const revalidate = 900;

// Direção (compra/venda) — pedido do Wilson, 25/set/2026: "deixar
// disponivel tanto compra quanto venda de iene" na página pública de
// Câmbio. Cada direção é uma página separada no melhorcambio.com
// (/cotacao/compra/iene/<cidade> e /cotacao/venda/iene/<cidade>), com
// valor diferente — confirmado via WebFetch em 25/set/2026.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cidadeParam = searchParams.get("cidade");
  const cidade: CidadeCambioIeneSlug = cidadeCambioIeneValida(cidadeParam) ? cidadeParam : "sao-paulo";
  const direcaoParam = searchParams.get("direcao");
  const direcao: DirecaoCambioIene = direcaoParam === "venda" ? "venda" : "compra";

  // Busca movida pra app/lib/cotacaoIeneServidor.ts (29/set/2026) — a
  // mesma função é usada por /api/cambio-selfservice pra recalcular o
  // valor antes da cobrança Pix. De quebra corrige o "aeroporto-guarulhos",
  // que ia direto pra uma página inexistente no melhorcambio.com e sempre
  // caía no valor de fallback (agora usa a cotação de São Paulo, como o
  // comentário em app/lib/cambioIene.ts já descrevia).
  return NextResponse.json(await buscarCotacaoIene(cidade, direcao));
}
