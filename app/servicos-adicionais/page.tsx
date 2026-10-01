import { redirect } from "next/navigation";

// A antiga página de Serviços Avulsos foi substituída pela página de
// produto em /produtos/servicos-adicionais (mesmo template do Transporte
// Privado, com seleção dos serviços) — pedido do Wilson, 30/set/2026.
// Links antigos continuam funcionando por este redirecionamento. A versão
// anterior está no histórico do git.
export default function ServicosAdicionaisAntigo() {
  redirect("/produtos/servicos-adicionais");
}
