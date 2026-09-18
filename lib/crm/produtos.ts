// Pedido do Wilson, 18/set/2026: "a divisao no crm deve ser: produto
// principal → roteiro personalizado, pacote de viagem, viagem
// personalizada, serviço individual / produto secundario → listar todos
// os serviços que podem ser contratados individualmente, incluso
// transfer, eSIM e reserva de restaurantes" — a taxonomia antiga
// (revisao_roteiro/caravana/semi_full_service/full_service e uma lista
// parcial de produto secundário) não batia com os produtos reais do site
// (/produtos e /servicos-adicionais, este via app/lib/servicosAvulsos.ts).
//
// Os 4 valores de ProdutoPrincipal e a lista completa de
// ProdutoSecundario abaixo espelham exatamente os cards de /produtos
// ("Como você quer organizar sua viagem" + "Complete sua viagem") e os 3
// itens avulsos de /servicos-adicionais (Transfer Aeroporto-Hotel, eSIM,
// Reserva de Restaurantes).
//
// Compatibilidade: os valores antigos continuam nos tipos e nos mapas de
// label (pra clientes já cadastrados não ficarem com rótulo em branco no
// pipeline/na tabela), mas não aparecem mais como opção clicável no
// formulário — só os valores novos entram em PRODUTOS_PRINCIPAIS/
// PRODUTOS_SECUNDARIOS, que é o que o ClienteForm usa pra desenhar os
// cards. "motorista_particular" virou "transporte_privado" e
// "acompanhamento_compras" virou "ajisai_shopping" (mesmo serviço, nome
// alinhado ao do site) — ver migration 008_produtos_taxonomia_v2.sql, que
// também renomeia esses dois valores nos registros já existentes.
export type ProdutoPrincipal =
  | "roteiro_personalizado"
  | "pacote_viagem"
  | "viagem_personalizada"
  | "servico_individual"
  // Valores antigos — mantidos só para exibir o rótulo de clientes já
  // cadastrados com a taxonomia anterior a 18/set/2026.
  | "revisao_roteiro"
  | "caravana"
  | "semi_full_service"
  | "full_service";

export const PRODUTOS_PRINCIPAIS: { valor: ProdutoPrincipal; label: string; detalhe?: string }[] = [
  {
    valor: "roteiro_personalizado",
    label: "Roteiro Personalizado",
    detalhe: "Planejamento completo — o cliente faz as próprias reservas",
  },
  {
    valor: "pacote_viagem",
    label: "Pacote de Viagem",
    detalhe: "Viagem já estruturada, com reservas e organização da Ajisai",
  },
  {
    valor: "viagem_personalizada",
    label: "Viagem Personalizada",
    detalhe: "Viagem montada do zero pela Ajisai, inteiramente sob medida",
  },
  {
    valor: "servico_individual",
    label: "Serviço Individual",
    detalhe: "Cliente contratou só um serviço avulso, sem pacote de viagem",
  },
];

export const PRODUTO_PRINCIPAL_LABEL: Record<ProdutoPrincipal, string> = {
  ...PRODUTOS_PRINCIPAIS.reduce(
    (acc, p) => ({ ...acc, [p.valor]: p.label }),
    {} as Record<ProdutoPrincipal, string>,
  ),
  // Rótulos da taxonomia antiga — só para clientes já cadastrados.
  revisao_roteiro: "Revisão de Roteiro",
  caravana: "Caravana",
  semi_full_service: "Semi-Full Service",
  full_service: "Full-Service",
};

export function isProdutoPrincipal(valor: string): valor is ProdutoPrincipal {
  return PRODUTOS_PRINCIPAIS.some((p) => p.valor === valor);
}

export type ProdutoSecundario =
  | "passagem_aerea"
  | "hoteis"
  | "guia"
  | "transporte_privado"
  | "jr_pass"
  | "cambio"
  | "seguro_viagem"
  | "ajisai_shopping"
  | "transfer_aeroporto_hotel"
  | "esim"
  | "reserva_restaurantes"
  // Valores antigos — mantidos só para exibir/aceitar o de clientes já
  // cadastrados com a taxonomia anterior a 18/set/2026.
  | "motorista_particular"
  | "acompanhamento_restaurantes"
  | "acompanhamento_compras";

export const PRODUTOS_SECUNDARIOS: { valor: ProdutoSecundario; label: string }[] = [
  { valor: "passagem_aerea", label: "Passagem Aérea" },
  { valor: "hoteis", label: "Hotéis" },
  { valor: "guia", label: "Guia Turístico" },
  { valor: "transporte_privado", label: "Transporte Privado" },
  { valor: "jr_pass", label: "JR Pass" },
  { valor: "cambio", label: "Câmbio" },
  { valor: "seguro_viagem", label: "Seguro Viagem" },
  { valor: "ajisai_shopping", label: "Ajisai Shopping" },
  { valor: "transfer_aeroporto_hotel", label: "Transfer Aeroporto-Hotel" },
  { valor: "esim", label: "eSIM" },
  { valor: "reserva_restaurantes", label: "Reserva de Restaurantes" },
];

export const PRODUTO_SECUNDARIO_LABEL: Record<ProdutoSecundario, string> = {
  ...PRODUTOS_SECUNDARIOS.reduce(
    (acc, p) => ({ ...acc, [p.valor]: p.label }),
    {} as Record<ProdutoSecundario, string>,
  ),
  // Rótulos da taxonomia antiga — só para clientes já cadastrados.
  motorista_particular: "Transporte Privado",
  acompanhamento_restaurantes: "Acompanhamento Presencial Restaurantes",
  acompanhamento_compras: "Ajisai Shopping",
};

export function isProdutoSecundario(valor: string): valor is ProdutoSecundario {
  return PRODUTOS_SECUNDARIOS.some((p) => p.valor === valor);
}
