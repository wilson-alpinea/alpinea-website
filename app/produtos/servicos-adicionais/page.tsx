import { permanentRedirect } from "next/navigation";

// Serviços adicionais só tinha a reserva de restaurantes — virou card e
// página próprios em /produtos/reserva-restaurantes (Wilson, 29/out/2026).
export default function ServicosAdicionaisRedirect() {
  permanentRedirect("/produtos/reserva-restaurantes");
}
