// Mesmos itens e preços de referência do calculador do Pacote
// Personalizado (OPCOES, em CustomPackageCard.tsx) — mostrados aqui como
// cards avulsos pra quem só quer adicionar um serviço pontual ao roteiro
// já organizado por conta própria. porDia indica se o valor é por dia de
// viagem ou fixo por viagem. Conteúdo da página /servicos-adicionais,
// aberta em popup a partir do card "Serviços adicionais" em /produtos.
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
}[] = [
  {
    nome: "JR Pass",
    icone: "/images/icone-trem-bala-shinkansen.png",
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala.",
    precoBRL: 180,
    porDia: true,
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
    nome: "Transporte",
    icone: "/images/icone-onibus-v2.png",
    descricao: "Transfers e deslocamentos do roteiro dia a dia.",
    precoBRL: 150,
    porDia: true,
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
    nome: "Serviços Adicionais",
    icone: "/images/icone-ideia-sugestao.png",
    descricao: "Reservas, concierge e experiências sob medida.",
    precoBRL: 2500,
  },
];
