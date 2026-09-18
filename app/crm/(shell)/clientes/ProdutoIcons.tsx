// Pedido do Wilson, 18/set/2026: "icones nao tem nada haver com a pagina
// de produtos ou calculadora reversa" — os cards de Produto Principal/
// Secundário no formulário do CRM usavam ícones de traço genéricos,
// desenhados só pra esse formulário, sem nenhuma relação visual com os
// ícones reais usados em /produtos e /calculadora_reversa. Trocado por um
// mapa pros mesmos arquivos de ícone já usados nessas páginas (ou o mais
// próximo semanticamente, quando o produto do CRM não tem card público
// equivalente — ver observação em cada linha).
export const PRODUTO_ICONS: Record<string, string> = {
  // Produto principal — "Roteiro Personalizado" e "Revisão de Roteiro" são
  // a mesma família de produto (o roteiro em si), então reaproveitam o
  // mesmo ícone de /produtos. "Caravana" reaproveita o ícone de "Pacote de
  // Viagem" (viagem pré-estruturada, mesmo conceito). "Semi-Full Service" e
  // "Full-Service" reaproveitam o ícone de "Viagem Personalizada" (viagem
  // montada do zero pela Ajisai) — nenhum dos três tem um card público
  // próprio, então usam o produto público mais parecido.
  roteiro_personalizado: "/images/produtos/roteiro-personalizado.png",
  revisao_roteiro: "/images/produtos/roteiro-personalizado.png",
  caravana: "/images/produtos/pacote-de-viagem.png",
  semi_full_service: "/images/produtos/viagem-personalizada-icone-v2.png",
  full_service: "/images/produtos/viagem-personalizada-icone-v2.png",
  // Produto secundário — os 5 primeiros são o mesmo ícone usado em
  // /produtos e/ou /calculadora_reversa para o serviço equivalente.
  // "Acompanhamento Presencial Restaurantes" não tem produto público
  // equivalente (é acompanhamento do concierge, não a reserva em si) —
  // reaproveita o ícone de Concierge Dedicado da calculadora reversa.
  jr_pass: "/images/icone-trem-bala-shinkansen.png",
  seguro_viagem: "/images/icone-seguro-viagem-v2.png",
  guia: "/images/produtos/guia-turistico.png",
  motorista_particular: "/images/produtos/transporte-privado.png",
  reserva_restaurantes: "/images/icone-servico-reserva-restaurante.png",
  acompanhamento_restaurantes: "/images/icone-servico-concierge.png",
  acompanhamento_compras: "/images/icone-servico-ajisai-shopping.png",
};
