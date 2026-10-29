// CRM de Documentação (Wilson, 29/out/2026) — quarto CRM interno
// (documentos.alpinea.io), separado da Agência. Recebe os cadastros de
// /documentacao: visto específico, Certificado de Elegibilidade e
// exportação de pet. Sem dependências de servidor.

export const SERVICOS_DOC = [
  { valor: "visto", label: "Visto específico", curto: "Visto", fundo: "#EFF4FA", cor: "#42658A" },
  { valor: "elegibilidade", label: "Certificado de Elegibilidade", curto: "Elegibilidade", fundo: "#F8F3EF", cor: "#8A5A3C" },
  { valor: "pet", label: "Exportação de pet", curto: "Pet", fundo: "#EEF6F3", cor: "#27675B" },
] as const;
export type ServicoDocCrm = (typeof SERVICOS_DOC)[number]["valor"];
export const isServicoDoc = (v: unknown): v is ServicoDocCrm => SERVICOS_DOC.some((s) => s.valor === v);
export const servicoDoc = (v: string) => SERVICOS_DOC.find((s) => s.valor === v) ?? SERVICOS_DOC[0];

// Fluxo: cadastro → ficha e documentos (portal, migração 027) → análise (filtros eliminatórios/scoring, a definir) →
// pré-aprovado (proposta enviada) → contratado (pago) → documentação →
// protocolado → concluído. Saídas: não atende, negado, desistência.
// Nenhum serviço é reembolsável (exceção: pet de raça restrita declarada
// corretamente, antes do início — 80%).
export const ETAPAS_DOC = [
  { valor: "novo", label: "Novo cadastro", curto: "Novo", fundo: "#F3F5F5", cor: "#5D6C70" },
  { valor: "em_analise", label: "Em análise", curto: "Em análise", fundo: "#FAF5EB", cor: "#93703D" },
  { valor: "pre_aprovado", label: "Pré-aprovado — proposta enviada", curto: "Pré-aprovado", fundo: "#EFF4FA", cor: "#42658A" },
  { valor: "contrato_aceito", label: "Contrato aceito — aguardando pagamento", curto: "Contrato aceito", fundo: "#FAF5EB", cor: "#7A6233" },
  { valor: "contratado", label: "Contratado — pago", curto: "Contratado", fundo: "#F8F3EF", cor: "#8A5A3C" },
  { valor: "documentacao", label: "Reunindo documentação", curto: "Documentação", fundo: "#F4F1F8", cor: "#75608B" },
  { valor: "protocolado", label: "Protocolado / em processamento", curto: "Protocolado", fundo: "#EEF4F6", cor: "#3E6E7A" },
  { valor: "concluido", label: "Concluído — entregue", curto: "Concluído", fundo: "#EEF6F3", cor: "#27675B" },
  { valor: "nao_atende", label: "Não atende aos critérios", curto: "Não atende", fundo: "#F3F2F1", cor: "#76706A" },
  { valor: "negado", label: "Negado pelas autoridades", curto: "Negado", fundo: "#FDECEA", cor: "#B42318" },
  { valor: "cancelado", label: "Desistência / cancelado", curto: "Cancelado", fundo: "#FDECEA", cor: "#8A1C12" },
] as const;
export type EtapaDoc = (typeof ETAPAS_DOC)[number]["valor"];
export const isEtapaDoc = (v: unknown): v is EtapaDoc => ETAPAS_DOC.some((e) => e.valor === v);
export const etapaDoc = (v: string) => ETAPAS_DOC.find((e) => e.valor === v) ?? ETAPAS_DOC[0];
export const FLUXO_DOC: EtapaDoc[] = ["novo", "em_analise", "pre_aprovado", "contrato_aceito", "contratado", "documentacao", "protocolado", "concluido"];
export const SAIDAS_DOC: EtapaDoc[] = ["nao_atende", "negado", "cancelado"];

export type EventoDoc = { em: string; por: string; tipo: "etapa" | "nota" | "edicao"; de?: string; para?: string; texto?: string };

export type ProcessoDoc = {
  id: string;
  created_at: string;
  updated_at: string;
  servico: ServicoDocCrm;
  etapa: EtapaDoc;
  nome: string;
  email: string | null;
  telefone: string | null;
  resumo: string | null;
  respostas: [string, string][];
  campos: Record<string, string>;
  valor_referencia_brl: number | null;
  valor_final: string | null;
  pago_em: string | null;
  protocolado_em: string | null;
  concluido_em: string | null;
  motivo_saida: string | null;
  termos_versao: string | null;
  termos_aceitos_em: string | null;
  aceites: string[];
  checkout_ip: string | null;
  checkout_user_agent: string | null;
  canal: string | null;
  canal_detalhe: string | null;
  historico: EventoDoc[];
  // Portal online (migração 027)
  acesso_token: string;
  ficha: unknown;
  ficha_enviada_em: string | null;
  documentos: { id: string; tipo: string; nome: string; path: string; tamanho: number; enviado_em: string }[];
  contrato: { texto: { titulo: string; clausulas: string[] }; hash: string; nome: string; cpf: string; ip: string | null; user_agent: string | null; aceito_em: string; versao: string } | null;
  contrato_aceito_em: string | null;
  liberado_contrato_em: string | null;
  // Valor em número (migração 028) e parcelas pagas pela Stone
  valor_total: number | null;
  valor_moeda: "BRL" | "JPY";
};

export type PagamentoDoc = { id: string; created_at: string; parcela: number; valor_brl: number; valor_jpy: number | null; cotacao_brl_por_jpy: number | null; status: "pendente" | "pago" | "cancelado"; forma_pagamento: string | null; pago_em: string | null; gateway_pedido_id: string | null };

/** Resumo de uma linha para a lista, a partir das respostas do cadastro. */
export function resumoDoCadastro(servico: ServicoDocCrm, c: Record<string, string>, extra: Record<string, string> = {}): string {
  const partes = (xs: (string | undefined)[]) => xs.filter((x) => x && x.trim()).join(" · ");
  if (servico === "pet") return partes([c.p_nome && `${c.p_nome}`, c.p_tipo, c.p_raca, c.p_porte && `porte ${c.p_porte.toLowerCase()}`]);
  const base = partes([c.ascendencia, c.qtd && `${c.qtd} pessoa(s)`, c.cidade && c.uf ? `${c.cidade}/${c.uf}` : c.uf]);
  if (servico === "elegibilidade") return partes([base, c.g_parentesco && `garantidor ${c.g_parentesco.toLowerCase()}`, c.g_provincia]);
  return partes([base, extra.consulado && `consulado ${extra.consulado}`]);
}
