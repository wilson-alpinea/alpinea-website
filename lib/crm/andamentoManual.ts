// Andamento manual da candidatura no CRM (Wilson, 15/out/2026: "para todas
// as etapas seguintes, deixar opção para o operador do CRM avançar o
// candidato manualmente e deixar comentários"). Fica em
// candidaturas_vagas.andamento_manual (jsonb — migração 020).

export type EtapaManualId = "ficha" | "proposta" | "preEntrevista" | "empreiteira" | "entrevistaFinal" | "documentacao" | "embarque" | "inicio" | "posVenda";

export const ETAPAS_MANUAIS: { id: EtapaManualId; label: string }[] = [
  { id: "ficha", label: "Etapa 2 — ficha cadastral + foto" },
  { id: "proposta", label: "Etapa 3 — proposta" },
  { id: "preEntrevista", label: "Pré-entrevista realizada" },
  { id: "empreiteira", label: "Apresentado à empreiteira" },
  { id: "entrevistaFinal", label: "Entrevista final / aprovado pela empreiteira" },
  // COE + visto numa etapa só (Wilson, 15/out/2026) — não se aplica a quem tem Re-Entry.
  { id: "documentacao", label: "Documentação concluída (COE + visto)" },
  { id: "embarque", label: "Embarcou para o Japão" },
  { id: "inicio", label: "Início das atividades / acompanhamento final" },
  // Pós-venda (Wilson, 29/out/2026: "depois que embarca entra em uma fila de
  // pós-vendas, que a gente faz um acompanhamento"). Do embarque até esta
  // marca o candidato aparece como "Pós-venda — em acompanhamento".
  { id: "posVenda", label: "Pós-venda concluído (acompanhamento encerrado)" },
];

export type MarcaEtapa = { em: string; por: string; comentario?: string };
export type ComentarioCandidatura = { em: string; por: string; texto: string; etapa?: EtapaManualId };
// Reclassificação manual aprovado/eliminado (Wilson, 15/out/2026) — guarda
// quem fez, quando e o motivo; a última entrada vale.
export type Reclassificacao = { em: string; por: string; de: string; para: string; motivo: string };
export type AndamentoManual = {
  etapas: Partial<Record<EtapaManualId, MarcaEtapa>>;
  comentarios: ComentarioCandidatura[];
  reclassificacoes: Reclassificacao[];
};

export function lerAndamentoManual(v: unknown): AndamentoManual {
  const o = (v && typeof v === "object" ? v : {}) as Partial<AndamentoManual>;
  return {
    etapas: o.etapas ?? {},
    comentarios: Array.isArray(o.comentarios) ? o.comentarios : [],
    reclassificacoes: Array.isArray(o.reclassificacoes) ? o.reclassificacoes : [],
  };
}

export const isEtapaManual = (v: string): v is EtapaManualId => ETAPAS_MANUAIS.some((e) => e.id === v);

export const ultimaReclassificacao = (v: unknown): Reclassificacao | undefined => lerAndamentoManual(v).reclassificacoes.at(-1);

export const dataHoraSP = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
