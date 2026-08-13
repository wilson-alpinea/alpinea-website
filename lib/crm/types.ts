export type Estagio =
  | "novo_lead"
  | "qualificacao"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

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
