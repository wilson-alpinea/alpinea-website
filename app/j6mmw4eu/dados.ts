// Checklist de prospecção das 100 agências (Wilson, 27/nov/2026) — tipos e
// status compartilhados pela página, pelo componente e pelas actions.

export const STATUS_AGENCIA = [
  { id: "a_abordar", label: "A abordar", cor: "#626B75", fundo: "#EEF0F2" },
  { id: "buscando_contato", label: "Buscando contato", cor: "#7A5B00", fundo: "#FFF4D6" },
  { id: "email_enviado", label: "E-mail enviado", cor: "#24476B", fundo: "#EAF1F8" },
  { id: "follow_up", label: "Follow-up enviado", cor: "#24476B", fundo: "#DCE8F4" },
  { id: "respondeu", label: "Respondeu", cor: "#6B4A9E", fundo: "#F0EBF7" },
  { id: "reuniao", label: "Reunião marcada", cor: "#6B4A9E", fundo: "#E6DDF3" },
  { id: "proposta", label: "Piloto / proposta", cor: "#9A3D5C", fundo: "#FBEAF0" },
  { id: "parceiro", label: "Parceiro fechado", cor: "#1F6B4E", fundo: "#E3F3EC" },
  { id: "sem_interesse", label: "Sem interesse", cor: "#8A2A2A", fundo: "#FBE9E9" },
  { id: "pausado", label: "Pausado", cor: "#626B75", fundo: "#F3F4F6" },
] as const;
export type StatusAgencia = (typeof STATUS_AGENCIA)[number]["id"];
export const isStatusAgencia = (v: unknown): v is StatusAgencia => STATUS_AGENCIA.some((s) => s.id === v);
export const statusInfo = (v: string) => STATUS_AGENCIA.find((s) => s.id === v) ?? STATUS_AGENCIA[0];

export type Agencia = {
  ordem: number;
  conta: string;
  prioridade: string | null;
  parceria: string | null;
  perfil: string | null;
  grupo: string | null;
  posicao_panrotas: number | null;
  vendas_2025_mi: number | null;
  evidencia_porte: string | null;
  detalhe_indicador: string | null;
  por_que: string | null;
  quem_procurar: string | null;
  proposta_inicial: string | null;
  contato_publico: string | null;
  link_canal: string | null;
  link_evidencia: string | null;
  link_extra: string | null;
  lista_anterior: string | null;
  status: StatusAgencia;
  contato_nome: string | null;
  contato_email: string | null;
  email_enviado_em: string | null;
  ultimo_contato_em: string | null;
  proximo_passo: string | null;
  proximo_em: string | null;
  responsavel: string | null;
  observacoes: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

/** Campos que a equipe edita na página. */
export const CAMPOS_EDITAVEIS = [
  "status",
  "contato_nome",
  "contato_email",
  "email_enviado_em",
  "ultimo_contato_em",
  "proximo_passo",
  "proximo_em",
  "responsavel",
  "observacoes",
] as const;
export type CampoEditavel = (typeof CAMPOS_EDITAVEIS)[number];
export type Alteracao = Partial<Record<CampoEditavel, string | null>>;
