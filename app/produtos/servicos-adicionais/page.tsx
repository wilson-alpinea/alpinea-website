import { permanentRedirect } from "next/navigation";

// Reserva de restaurantes fora do ar por enquanto (Wilson, 29/out/2026) → /produtos.

// Serviços adicionais só tinha a reserva de restaurantes — virou card e
// página próprios em /produtos/reserva-restaurantes (Wilson, 29/out/2026).
export default function ServicosAdicionaisRedirect() {
  permanentRedirect("/produtos");
}
