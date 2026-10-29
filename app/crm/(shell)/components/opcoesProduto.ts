import { PRODUTOS_PRINCIPAIS, PRODUTOS_SECUNDARIOS } from "@/lib/crm/produtos";
import { PRODUTO_ICONS } from "../clientes/ProdutoIcons";
import type { OpcaoProduto } from "./FiltroProdutos";

// Quadradinhos de produto da Agência (Visão geral e Clientes — Wilson,
// 29/out/2026). Ajisai Shopping fora (backlog). Serviço Individual: o ícone
// de "serviços adicionais" é fino demais no tamanho pequeno.
export const OPCOES_PRODUTO_AGENCIA: OpcaoProduto[] = [...PRODUTOS_PRINCIPAIS, ...PRODUTOS_SECUNDARIOS]
  .filter((p) => p.valor !== "ajisai_shopping" && PRODUTO_ICONS[p.valor])
  .map((p) => ({ valor: p.valor, label: p.label, icone: p.valor === "servico_individual" ? "/images/icone-servico-concierge.png" : PRODUTO_ICONS[p.valor] }));

// Fornecedores: mesmo visual, por categoria (?categoria=).
export const OPCOES_CATEGORIA_FORNECEDOR: OpcaoProduto[] = [
  { valor: "hotel", label: "Hotel", icone: PRODUTO_ICONS.hoteis },
  { valor: "transporte", label: "Transporte", icone: PRODUTO_ICONS.transporte_privado },
  { valor: "guia", label: "Guia", icone: PRODUTO_ICONS.guia },
  { valor: "restaurante", label: "Restaurante", icone: PRODUTO_ICONS.reserva_restaurantes },
  { valor: "passeio_atracao", label: "Passeio / Atração", icone: PRODUTO_ICONS.roteiro_personalizado },
  { valor: "seguro_viagem", label: "Seguro Viagem", icone: PRODUTO_ICONS.seguro_viagem },
  { valor: "cambio", label: "Câmbio", icone: PRODUTO_ICONS.cambio },
  { valor: "outro", label: "Outro", icone: "/images/icone-servico-concierge.png" },
];
