export type Estagio =
  | "novo_lead"
  | "qualificacao"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

// Pedido do Wilson, 19/set/2026 ("um novo fluxograma de entrega abaixo do
// de vendas"): o funil de estágio (Estagio, acima) é só o processo de
// VENDA — da captação do lead ao fechamento. Isso não tem nada a ver com
// o processo de ENTREGA do serviço (montar o roteiro, confirmar reservas,
// acompanhar a viagem). São dois fluxos paralelos, cada um com sua
// própria "etapa atual" e histórico de datas — ver EstagioEntrega e
// lib/crm/estagiosEntrega.ts.
export type EstagioEntrega =
  | "roteiro_elaboracao"
  | "roteiro_entregue"
  | "reservas_confirmadas"
  | "viagem_andamento"
  | "concluida";

export type Cliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  valor_proposta: number | null;
  produto_principal: string | null;
  produto_secundario: string[];
  data_viagem: string | null;
  estagio: Estagio;
  estagio_entrega: EstagioEntrega;
  responsavel_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Interacao = {
  id: string;
  cliente_id: string;
  autor_id: string | null;
  tipo: string;
  conteudo: string;
  // Data "oficial" do evento (ex.: quando o cliente de fato entrou nessa
  // etapa), preenchida pelo usuário — pedido do Wilson, 19/set/2026 ("falta
  // deixar campo de data obrigatorio ao mudar cada etapa"). Distinta de
  // created_at, que é só quando o registro foi salvo no sistema. Nula em
  // registros antigos (antes dessa mudança) — nesse caso created_at é
  // usado como fallback.
  data_evento: string | null;
  estagio_destino?: string | null;
  estagio_entrega_destino?: string | null;
  created_at: string;
};

export type Perfil = {
  id: string;
  nome: string | null;
  email: string | null;
  created_at: string;
};

export type Fornecedor = {
  id: string;
  nome: string;
  categoria: string | null;
  contato_nome: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Pagamento = {
  id: string;
  cliente_id: string;
  tipo_pagamento: string | null;
  numero_parcela: number;
  total_parcelas: number;
  valor: number;
  status: string;
  data_vencimento: string | null;
  data_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};
