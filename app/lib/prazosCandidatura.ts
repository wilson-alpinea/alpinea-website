// Expectativa de tempo do processo seletivo de /empregos — Wilson,
// 06/out/2026. Prazos MÉDIOS informados por ele:
// - Empreiteira: até ~3 semanas após a pré-entrevista (apresentação do
//   candidato + análise) para agendar a entrevista final; depois ~2
//   semanas para o parecer final de contratação.
// - Certificado de Elegibilidade: ~3 meses (ISA — Imigração do Japão).
// - Visto: em média 4 meses após a documentação completa entregue à
//   Alpinea (o consulado/embaixada exige pelo menos 3 meses). O pedido do
//   visto só pode ser feito DEPOIS do Certificado de Elegibilidade.

export type EtapaPrazo = "etapa1" | "etapa2" | "etapa3" | "etapa4" | "agendado";

export type PassoPrazo = {
  id: EtapaPrazo | "empreiteira" | "entrevistaFinal" | "documentacao" | "embarque" | "inicio";
  titulo: string;
  /** Nome curto para a linha do tempo horizontal (08/out/2026). */
  curto: string;
  /** Prazo curto (SLA) mostrado embaixo de cada etapa. */
  sla: string;
  prazo: string;
  detalhe?: string;
  opcional?: boolean;
  /** Só aparece para quem NÃO tem Re-Entry válido. */
  soSemReEntry?: boolean;
};

export const PASSOS_PRAZO: PassoPrazo[] = [
  { id: "etapa1", titulo: "Etapa 1 — Candidatura e análise do perfil", curto: "Candidatura", sla: "Resultado na hora", prazo: "Resultado na hora" },
  { id: "etapa2", titulo: "Etapa 2 — Ficha cadastral e foto", curto: "Ficha e foto", sla: "No seu ritmo", prazo: "No seu ritmo" },
  {
    id: "etapa3",
    titulo: "Etapa 3 — Proposta de financiamento",
    curto: "Financiamento",
    sla: "No seu ritmo",
    prazo: "No seu ritmo",
    detalhe: "Só quando a empresa não custeia visto, certificado e passagem.",
    opcional: true,
  },
  { id: "etapa4", titulo: "Etapa 4 — Pré-entrevista com a Ajisai", curto: "Pré-entrevista", sla: "Você agenda", prazo: "Você escolhe o horário" },
  {
    id: "empreiteira",
    titulo: "Apresentação e análise pela empreiteira",
    curto: "Análise da empreiteira",
    sla: "Até 3 semanas",
    prazo: "Até ~3 semanas após a pré-entrevista",
    detalhe: "Apresentamos seu perfil à empreiteira, que analisa e agenda a entrevista final diretamente com você.",
  },
  {
    id: "entrevistaFinal",
    titulo: "Entrevista final e parecer de contratação",
    curto: "Entrevista final",
    sla: "Parecer em ~2 semanas",
    prazo: "~2 semanas após a entrevista final",
    detalhe: "A empreiteira dá o parecer final sobre a contratação.",
  },
  {
    // Certificado (COE) + visto viram uma etapa só — Wilson, 15/out/2026:
    // "~3 meses, chamada Documentação; só aparece para quem não tem
    // Re-Entry" (quem tem Re-Entry válido já tem a documentação).
    id: "documentacao",
    titulo: "Documentação — Certificado de Elegibilidade (COE) e visto",
    curto: "Documentação",
    sla: "~3 meses",
    prazo: "~3 meses",
    detalhe: "Cuidamos do Certificado de Elegibilidade e do visto. Só para quem ainda não tem Re-Entry válido.",
    soSemReEntry: true,
  },
  { id: "embarque", titulo: "Embarque para o Japão", curto: "Embarque", sla: "Data com a empresa", prazo: "Data combinada com a empresa" },
  {
    // Etapa final — Wilson, 15/out/2026.
    id: "inicio",
    titulo: "Início das atividades e acompanhamento final",
    curto: "Início das atividades",
    sla: "Acompanhamento",
    prazo: "Logo após a chegada ao Japão",
    detalhe: "Acompanhamos sua chegada, a moradia e os primeiros dias de trabalho na fábrica.",
  },
];

export const AVISO_PRAZOS =
  "Prazos médios — podem variar conforme a empreiteira e os órgãos japoneses. Quem já tem Re-Entry válido pula a etapa de documentação.";

/** Passos visíveis para o candidato: sem financiamento quando a vaga não
 *  pede e sem documentação quando ele já tem Re-Entry válido. */
/** Candidatura respondeu que tem Re-Entry válido (etapa 1). */
export function candidatoTemReEntry(c: { respostas?: unknown } | null | undefined) {
  return ((c?.respostas ?? {}) as { reEntry?: string }).reEntry === "sim";
}

export function passosVisiveis(opts: { semEtapa3?: boolean; temReEntry?: boolean } = {}) {
  return PASSOS_PRAZO.filter((p) => !(opts.semEtapa3 && p.id === "etapa3") && !(opts.temReEntry && p.soSemReEntry));
}
