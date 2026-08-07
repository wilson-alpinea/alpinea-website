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
  tier: string | null;
  destino_interesse: string | null;
  valor_estimado: number | null;
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
