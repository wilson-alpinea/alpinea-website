import { permanentRedirect } from "next/navigation";

// A Viagem Personalizada passou para o template novo de /produtos (Wilson,
// 03/nov/2026). Este endereço antigo (anúncios, links salvos) leva para a
// página nova. O configurador antigo (CustomPackageCard) continua no código
// porque a Calculadora Reversa e o simulador importam constantes dele.
export default function ViagemPersonalizadaAntiga() {
  permanentRedirect("/produtos/viagem-personalizada");
}
