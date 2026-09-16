// Mesmos itens e preços de referência do calculador do Pacote
// Personalizado (OPCOES, em CustomPackageCard.tsx) — mostrados aqui como
// cards avulsos pra quem só quer adicionar um serviço pontual ao roteiro
// já organizado por conta própria. porDia indica se o valor é por dia de
// viagem ou fixo por viagem. notaPreco é uma observação curta mostrada
// logo abaixo do preço (ex.: parcela variável não incluída, ou instrução
// de escolha). Conteúdo da página /servicos-adicionais, aberta em popup a
// partir do card "Serviços adicionais" em /produtos.
//
// "Motorista Privado" foi retirado daqui (26/ago/2026) — o serviço agora
// tem seção própria, com calculadora dedicada (categoria de carro, dias
// por cidade etc.) — ver TransportePrivadoCalculator.tsx, acionada pelo
// card "Transporte Privado" em /produtos. Manter aqui duplicaria o
// serviço com um preço fixo desatualizado em relação à calculadora.
//
// "JR Pass", "Seguro Viagem" e "Câmbio no Brasil" foram retirados daqui
// (16/set/2026) — os três viraram cards principais na seção "Complete
// sua viagem" de /produtos (mesmo template dos demais produtos), com
// popup próprio (ServicoAvulsoModal). Preços seguem vindo das mesmas
// constantes (JR_PASS_PRECO_USD, DIARIA_SEGURO_VIAGEM,
// PRECO_CAMBIO_BRASIL, em CustomPackageCard.tsx) — sem duplicação.
export const SERVICOS_AVULSOS: {
  nome: string;
  icone: string;
  descricao: string;
  precoBRL: number;
  /** Valor nativo em dólar — quando presente, tem prioridade sobre
   * precoBRL no cálculo (mesmo padrão de PRODUTOS em /produtos). */
  precoUSD?: number;
  porDia?: boolean;
  notaPreco?: string;
}[] = [
  {
    nome: "Transfer Aeroporto-Hotel",
    icone: "/images/icone-onibus-v2.png",
    descricao: "Traslado de ida e volta entre o aeroporto e o hotel.",
    precoBRL: 150,
  },
  {
    nome: "eSIM",
    icone: "/images/icone-esim.svg",
    // Mesmo custo-base do item "Wi-fi" do calculador do Personalizado
    // (DIARIA_WIFI_USD_PAX, em CustomPackageCard.tsx — ≈ JPY 1000/dia/pax).
    // Pocket Wi-Fi foi removido do catálogo — pedido do Wilson, 16/set/2026.
    descricao: "Conexão de dados 5G direto no celular, sem precisar retirar nem devolver aparelho.",
    precoBRL: 0,
    precoUSD: 7,
    porDia: true,
  },
  {
    nome: "Reserva de Restaurantes",
    icone: "/images/icone-gastronomia.png",
    descricao: "Pacote de 5 reservas em restaurantes concorridos, para até 3 pessoas. Para mais pessoas, consulte disponibilidade.",
    precoBRL: 1500,
    notaPreco: "+ valor dos restaurantes",
  },
];
