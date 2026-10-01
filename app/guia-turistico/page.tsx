import { redirect } from "next/navigation";

// A antiga página de Guia Turístico Avulso foi substituída pela página de
// produto em /produtos/guia-turistico (mesmo template do Transporte
// Privado) — pedido do Wilson, 30/set/2026. Links antigos continuam
// funcionando por este redirecionamento. A versão anterior está no
// histórico do git.
export default function GuiaTuristicoAntigo() {
  redirect("/produtos/guia-turistico");
}
