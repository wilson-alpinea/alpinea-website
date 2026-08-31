// Mesmos itens e preços de referência do calculador do Pacote
// Personalizado (OPCOES, em CustomPackageCard.tsx) — mostrados aqui como
// cards avulsos pra quem só quer adicionar um serviço pontual ao roteiro
// já organizado por conta própria. porDia indica se o valor é por dia de
// viagem ou fixo por viagem. Conteúdo da página /servicos-adicionais,
// aberta em popup a partir do card "Serviços adicionais" em /produtos.
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
    icone: "🚄",
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala.",
    precoBRL: 180,
    porDia: true,
  },
  {
    nome: "Seguro Viagem",
    icone: "🛡️",
    descricao: "Cobertura médica e assistência durante toda a viagem.",
    precoBRL: 35,
    porDia: true,
  },
  {
    nome: "Câmbio no Brasil",
    icone: "💴",
    descricao: "Retirada de ienes com câmbio comercial antes do embarque.",
    precoBRL: 150,
  },
  {
    nome: "Motorista Privado",
    icone: "🚗",
    descricao: "Traslados exclusivos com motorista particular, sem compartilhar veículo com outros grupos. Para até 4 pessoas.",
    precoBRL: 0,
    precoUSD: 700,
    porDia: true,
  },
  {
    nome: "Transporte",
    icone: "🚐",
    descricao: "Transfers e deslocamentos do roteiro dia a dia.",
    precoBRL: 150,
    porDia: true,
  },
  {
    nome: "Serviços Adicionais",
    icone: "✨",
    descricao: "Reservas, concierge e experiências sob medida.",
    precoBRL: 2500,
  },
];
