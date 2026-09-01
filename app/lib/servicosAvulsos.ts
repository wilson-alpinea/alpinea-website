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
    nome: "JR Pass",
    icone: "/images/icone-trem-bala-shinkansen.png",
    // Passe vendido em faixas fixas de 7/14/21 dias corridos, não por
    // diária — mesma regra e preços de JR_PASS_PRECO_USD, em
    // CustomPackageCard.tsx (01/set/2026). Mostrado aqui "a partir de" a
    // faixa de 7 dias, a mais barata.
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala. Vendido em faixas de 7, 14 ou 21 dias.",
    precoBRL: 0,
    precoUSD: 495,
    notaPreco: "faixa de 7 dias — 14 ou 21 dias também disponíveis",
  },
  {
    nome: "Seguro Viagem",
    icone: "/images/icone-seguro-viagem-v2.png",
    descricao: "Cobertura médica e assistência durante toda a viagem.",
    precoBRL: 35,
    porDia: true,
  },
  {
    nome: "Câmbio no Brasil",
    icone: "/images/icone-cambio-dinheiro.png",
    descricao: "Retirada de ienes com câmbio comercial antes do embarque.",
    precoBRL: 150,
  },
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
    // (DIARIA_WIFI_USD_PAX, em CustomPackageCard.tsx — ≈ JPY 1000/dia/pax),
    // já que lá o eSIM 5G é oferecido como alternativa de mesmo custo ao
    // Pocket Wi-Fi.
    descricao: "Conexão de dados 5G direto no celular, sem retirar nem devolver aparelho — alternativa ao Pocket Wi-Fi.",
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
