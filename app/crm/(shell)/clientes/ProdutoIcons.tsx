// Pedido do Wilson, 18/set/2026: "icones nao tem nada haver com a pagina
// de produtos ou calculadora reversa" — os cards de Produto Principal/
// Secundário no formulário do CRM usavam ícones de traço genéricos,
// desenhados só pra esse formulário, sem nenhuma relação visual com os
// ícones reais usados em /produtos e /calculadora_reversa. Trocado por um
// mapa pros mesmos arquivos de ícone já usados nessas páginas (ou o mais
// próximo semanticamente).
//
// Atualizado no mesmo dia pra taxonomia nova de lib/crm/produtos.ts
// ("produto principal → roteiro personalizado, pacote de viagem, viagem
// personalizada, serviço individual / produto secundario → todos os
// serviços contratáveis individualmente"). Os valores antigos (chaves
// mantidas em ProdutoPrincipal/ProdutoSecundario só por compatibilidade)
// continuam mapeados aqui — não fazem mal ficar, mas não aparecem mais no
// formulário (ver PRODUTOS_PRINCIPAIS/PRODUTOS_SECUNDARIOS).
export const PRODUTO_ICONS: Record<string, string> = {
  // Produto principal
  roteiro_personalizado: "/images/produtos/roteiro-personalizado.png",
  pacote_viagem: "/images/produtos/pacote-de-viagem.png",
  viagem_personalizada: "/images/produtos/viagem-personalizada-icone-v2.png",
  // "Serviço Individual" não tem card próprio em /produtos — reaproveita o
  // ícone de "Serviços adicionais", o mais próximo do conceito de "só um
  // item avulso, sem pacote de viagem".
  servico_individual: "/images/produtos/servicos-adicionais.png",

  // Produto secundário — todos os serviços contratáveis individualmente,
  // mesmos ícones de /produtos ("Complete sua viagem") ou de
  // /servicos-adicionais (Transfer, eSIM, Reserva de Restaurantes — ver
  // app/lib/servicosAvulsos.ts).
  passagem_aerea: "/images/produtos/passagem-aerea.png",
  hoteis: "/images/produtos/hoteis.png",
  guia: "/images/produtos/guia-turistico.png",
  transporte_privado: "/images/produtos/transporte-privado.png",
  jr_pass: "/images/icone-trem-bala-shinkansen.png",
  cambio: "/images/icone-cambio-dinheiro.png",
  seguro_viagem: "/images/icone-seguro-viagem-v2.png",
  ajisai_shopping: "/images/icone-servico-ajisai-shopping.png",
  transfer_aeroporto_hotel: "/images/icone-onibus-v2.png",
  esim: "/images/icone-esim.svg",
  reserva_restaurantes: "/images/icone-gastronomia.png",

  // Valores antigos — mantidos por compatibilidade (ver comentário acima).
  revisao_roteiro: "/images/produtos/roteiro-personalizado.png",
  caravana: "/images/produtos/pacote-de-viagem.png",
  semi_full_service: "/images/produtos/viagem-personalizada-icone-v2.png",
  full_service: "/images/produtos/viagem-personalizada-icone-v2.png",
  motorista_particular: "/images/produtos/transporte-privado.png",
  acompanhamento_restaurantes: "/images/icone-servico-concierge.png",
  acompanhamento_compras: "/images/icone-servico-ajisai-shopping.png",
};
