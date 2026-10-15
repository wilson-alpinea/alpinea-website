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
  id: EtapaPrazo | "empreiteira" | "entrevistaFinal" | "certificado" | "visto" | "embarque";
  titulo: string;
  /** Nome curto para a linha do tempo horizontal (08/out/2026). */
  curto: string;
  /** Prazo curto (SLA) mostrado embaixo de cada etapa. */
  sla: string;
  prazo: string;
  detalhe?: string;
  opcional?: boolean;
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
    curto: "Análise da empresa",
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
    id: "certificado",
    titulo: "Certificado de Elegibilidade",
    curto: "Certificado (COE)",
    sla: "~3 meses",
    prazo: "~3 meses",
    detalhe: "Emitido pela ISA (Imigração do Japão). É obrigatório para pedir o visto.",
  },
  {
    id: "visto",
    titulo: "Visto",
    curto: "Visto",
    sla: "~4 meses",
    prazo: "~4 meses após a documentação completa",
    detalhe:
      "Só damos entrada no consulado/embaixada do Japão depois de emitido o Certificado de Elegibilidade. O consulado exige pelo menos 3 meses.",
  },
  { id: "embarque", titulo: "Embarque para o Japão", curto: "Embarque", sla: "Data com a empresa", prazo: "Data combinada com a empresa" },
];

export const AVISO_PRAZOS =
  "Prazos médios — podem variar conforme a empresa e os órgãos japoneses. Se você já tem visto válido para trabalhar no Japão, as etapas de certificado e visto não se aplicam.";
