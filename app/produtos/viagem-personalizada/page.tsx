import SimuladorViagem from "../../viagem_personalizada_selfservice/SimuladorViagem";

// Viagem Personalizada no template novo de /produtos (Wilson, 03/nov/2026).
// Base: o simulador self-service (mesmo cálculo da Calculadora Reversa);
// o pedido cai no CRM com a tag SELF-SERVICE e segue pelo WhatsApp.
export default function ViagemPersonalizadaProdutoPage() {
  return <SimuladorViagem modo="produto" />;
}
