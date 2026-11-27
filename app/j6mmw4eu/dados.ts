// Checklist de prospecção das 100 agências (Wilson, 27/nov/2026) — tipos e
// status compartilhados pela página, pelo componente e pelas actions.
// Cores no padrão dos CRMs (fundo suave + texto, faixa forte na lateral).

export const STATUS_AGENCIA = [
  { id: "a_abordar", label: "A abordar", cor: "#59636F", fundo: "#F1F3F5", forte: "#9AA2AB" },
  { id: "buscando_contato", label: "Buscando contato", cor: "#946200", fundo: "#FFF4DE", forte: "#E0A526" },
  { id: "email_enviado", label: "E-mail enviado", cor: "#24476B", fundo: "#EAF1F8", forte: "#2F80C9" },
  { id: "follow_up", label: "Follow-up enviado", cor: "#1C6EA8", fundo: "#E1EFFA", forte: "#5AA6E6" },
  { id: "respondeu", label: "Respondeu", cor: "#665582", fundo: "#F0EBF7", forte: "#8E6FC4" },
  { id: "reuniao", label: "Reunião marcada", cor: "#5B3BA8", fundo: "#EDE5FB", forte: "#7C4FD1" },
  { id: "proposta", label: "Piloto / proposta", cor: "#9A3D5C", fundo: "#FBEAF0", forte: "#D45B85" },
  { id: "parceiro", label: "Parceiro fechado", cor: "#28665D", fundo: "#E8F4EE", forte: "#3A8C5A" },
  { id: "sem_interesse", label: "Sem interesse", cor: "#B42318", fundo: "#FDEDEC", forte: "#D9534F" },
  { id: "pausado", label: "Pausado", cor: "#6B737C", fundo: "#F5F6F7", forte: "#C2C8CE" },
] as const;
export type StatusAgencia = (typeof STATUS_AGENCIA)[number]["id"];
export const isStatusAgencia = (v: unknown): v is StatusAgencia => STATUS_AGENCIA.some((s) => s.id === v);
export const statusInfo = (v: string) => STATUS_AGENCIA.find((s) => s.id === v) ?? STATUS_AGENCIA[0];

/** Prioridade da planilha ("1 · Abordar"...) → cor do selo. */
export const PRIORIDADE_COR: Record<string, { cor: string; fundo: string }> = {
  "1": { cor: "#B42318", fundo: "#FDEDEC" },
  "2": { cor: "#946200", fundo: "#FFF4DE" },
  "3": { cor: "#665582", fundo: "#F0EBF7" },
};

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
