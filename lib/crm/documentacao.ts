// CRM de Documentação (Wilson, 29/out/2026) — quarto CRM interno
// (documentos.alpinea.io), separado da Agência. Recebe os cadastros de
// /documentacao: visto específico, Certificado de Elegibilidade e
// exportação de pet. Sem dependências de servidor.

// Serviços — badges neutros e discretos (redesenho do CRM, Wilson,
// 29/out/2026: "reduza a variedade de cores simultâneas").
export const SERVICOS_DOC = [
  { valor: "visto", label: "Visto específico", curto: "Visto" },
  { valor: "elegibilidade", label: "Certificado de Elegibilidade", curto: "Elegibilidade" },
  { valor: "pet", label: "Exportação de pet", curto: "Pet" },
] as const;
export type ServicoDocCrm = (typeof SERVICOS_DOC)[number]["valor"];
export const isServicoDoc = (v: unknown): v is ServicoDocCrm => SERVICOS_DOC.some((s) => s.valor === v);
export const servicoDoc = (v: string) => SERVICOS_DOC.find((s) => s.valor === v) ?? SERVICOS_DOC[0];

// Etapas. Os identificadores (`valor`) são os do banco e NÃO mudam; só os
// rótulos de exibição foram resumidos no redesenho (29/out/2026):
//   pre_aprovado    "Pré-aprovado — proposta enviada"        → "Proposta enviada"
//   contrato_aceito "Contrato aceito — aguardando pagamento" → "Aguardando pagamento"
//   contratado      "Contratado — pago"                      → "Pago / a iniciar"
//   documentacao    "Reunindo documentação"                  → "Reunindo documentos"
//   protocolado     "Protocolado / em processamento"         → "Em processamento"
//   concluido       "Concluído — entregue"                   → "Concluído"
// O significado completo fica em `descricao`, e os marcos (pré-aprovação,
// aceite, pagamento, protocolo, entrega) continuam na ficha do processo.
// Cores: tons suaves por grupo (comercial azul-acinzentado, execução
// verde-acinzentado, concluído verde); vermelho só em "Negado".
const COMERCIAL = { fundo: "#EEF2F7", cor: "#3F5F80" };
const EXECUCAO = { fundo: "#EDF3F1", cor: "#3D6A5E" };
export const ETAPAS_DOC = [
  { valor: "novo", label: "Novo cadastro", curto: "Novo cadastro", descricao: "Cadastro recebido pelo site", grupo: "comercial", ...COMERCIAL },
  { valor: "em_analise", label: "Em análise", curto: "Em análise", descricao: "Ficha e documentos em análise pela equipe", grupo: "comercial", ...COMERCIAL },
  { valor: "pre_aprovado", label: "Proposta enviada", curto: "Proposta enviada", descricao: "Pré-aprovado — proposta e contrato enviados ao cliente", grupo: "comercial", ...COMERCIAL },
  { valor: "contrato_aceito", label: "Aguardando pagamento", curto: "Aguardando pagamento", descricao: "Contrato aceito — aguardando pagamento", grupo: "comercial", ...COMERCIAL },
  { valor: "contratado", label: "Pago / a iniciar", curto: "Pago / a iniciar", descricao: "Contratado — pagamento confirmado", grupo: "execucao", ...EXECUCAO },
  { valor: "documentacao", label: "Reunindo documentos", curto: "Reunindo documentos", descricao: "Reunindo e conferindo a documentação", grupo: "execucao", ...EXECUCAO },
  { valor: "protocolado", label: "Em processamento", curto: "Em processamento", descricao: "Protocolado — em processamento no órgão responsável", grupo: "execucao", ...EXECUCAO },
  { valor: "concluido", label: "Concluído", curto: "Concluído", descricao: "Concluído — entregue ao cliente", grupo: "execucao", fundo: "#E9F4EE", cor: "#23704F" },
  { valor: "nao_atende", label: "Não atende aos critérios", curto: "Não atende", descricao: "Não atende aos critérios do serviço", grupo: "encerramento", fundo: "#F2F1EF", cor: "#6E6862" },
  { valor: "negado", label: "Negado pelas autoridades", curto: "Negado", descricao: "Negado pelas autoridades", grupo: "encerramento", fundo: "#FDECEA", cor: "#B42318" },
  { valor: "cancelado", label: "Desistência / cancelado", curto: "Cancelado", descricao: "Desistência ou cancelamento", grupo: "encerramento", fundo: "#F2F1EF", cor: "#6E6862" },
] as const;
export type EtapaDoc = (typeof ETAPAS_DOC)[number]["valor"];
export const isEtapaDoc = (v: unknown): v is EtapaDoc => ETAPAS_DOC.some((e) => e.valor === v);
export const etapaDoc = (v: string) => ETAPAS_DOC.find((e) => e.valor === v) ?? ETAPAS_DOC[0];
export const FLUXO_DOC: EtapaDoc[] = ["novo", "em_analise", "pre_aprovado", "contrato_aceito", "contratado", "documentacao", "protocolado", "concluido"];
export const SAIDAS_DOC: EtapaDoc[] = ["nao_atende", "negado", "cancelado"];
export const GRUPOS_FLUXO: { id: "comercial" | "execucao"; titulo: string; etapas: EtapaDoc[] }[] = [
  { id: "comercial", titulo: "Comercial", etapas: ["novo", "em_analise", "pre_aprovado", "contrato_aceito"] },
  { id: "execucao", titulo: "Execução", etapas: ["contratado", "documentacao", "protocolado", "concluido"] },
];

/**
 * Pendência / próxima ação de cada processo — derivada só do que o sistema
 * já registra (etapa, ficha, valor, contrato). Nada é inventado: quando não
 * há informação, devolve um estado neutro.
 */
export type Pendencia = { quem: "cliente" | "equipe" | "orgao" | "nenhum"; texto: string };
export function pendenciaDoc(p: { etapa: string; ficha_enviada_em?: string | null; valor_total?: number | null; contrato_aceito_em?: string | null; motivo_saida?: string | null }): Pendencia {
  switch (p.etapa) {
    case "novo":
      return p.ficha_enviada_em ? { quem: "equipe", texto: "Iniciar a análise da ficha" } : { quem: "cliente", texto: "Enviar ficha completa e documentos" };
    case "em_analise":
      if (!p.ficha_enviada_em) return { quem: "cliente", texto: "Enviar ficha completa e documentos" };
      return Number(p.valor_total) > 0 ? { quem: "equipe", texto: "Concluir análise e liberar contrato" } : { quem: "equipe", texto: "Analisar e definir o valor final" };
    case "pre_aprovado":
      return { quem: "cliente", texto: "Aceitar o contrato no portal" };
    case "contrato_aceito":
      return { quem: "cliente", texto: "Pagar pela Stone" };
    case "contratado":
      return { quem: "equipe", texto: "Iniciar o processo e enviar a lista de documentos" };
    case "documentacao":
      return { quem: "equipe", texto: "Conferir documentos e protocolar" };
    case "protocolado":
      return { quem: "orgao", texto: "Aguardando resposta do órgão" };
    case "concluido":
      return { quem: "nenhum", texto: "Nenhuma — processo concluído" };
    default:
      return { quem: "nenhum", texto: p.motivo_saida ? `Encerrado: ${p.motivo_saida}` : "Encerrado — motivo não informado" };
  }
}
export const QUEM_PENDENCIA: Record<Pendencia["quem"], string> = { cliente: "Cliente", equipe: "Equipe", orgao: "Órgão", nenhum: "" };

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
