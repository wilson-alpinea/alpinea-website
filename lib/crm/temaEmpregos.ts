// Tema do CRM de Empregos (Wilson, 23/out/2026): mesmo sistema visual do CRM
// de Viagens, com verde-petróleo como cor principal. As classes azuis
// compartilhadas são remapeadas em app/crm/crm.css ([data-unidade="empregos"]);
// aqui ficam as cores usadas diretamente pelos componentes de Empregos.

export const EMPREGOS = {
  fundoPagina: "#F8FAF9",
  texto: "#202B28",
  textoSecundario: "#626E69",
  borda: "#DEE6E2",
  primaria: "#27675B",
  primariaHover: "#20564C",
} as const;

export const AREA_EMPREGOS = {
  principal: { fundo: "#EEF6F3", cor: "#27675B" }, // ações principais e visão geral
  ficha: { fundo: "#EFF4FA", cor: "#42658A" }, // ficha cadastral e documentação
  proposta: { fundo: "#F4F1F8", cor: "#75608B" }, // propostas e análise
  agenda: { fundo: "#FAF5EB", cor: "#93703D" }, // agendamento e entrevistas
  historico: { fundo: "#F3F5F5", cor: "#5D6C70" }, // histórico e informações auxiliares
} as const;

// Vermelho só para eliminação, erro e atraso.
export const ALERTA = { fundo: "#FDECEA", cor: "#B42318" } as const;

export const TRIAGEM_EMPREGOS = {
  aprovado_alto: { rotulo: "Elegível · score 80+", titulo: "Elegíveis · score 80+", descricao: "Passaram nos critérios eliminatórios e atingiram score de pelo menos 80.", ...AREA_EMPREGOS.principal },
  aprovado_baixo: { rotulo: "Elegível · score abaixo de 80", titulo: "Elegíveis · score abaixo de 80", descricao: "Passaram nos critérios eliminatórios e têm score inferior a 80.", fundo: "#EFF4FA", cor: "#42658A" },
  eliminado: { rotulo: "Eliminado na triagem", titulo: "Eliminados na triagem", descricao: "Não passaram em algum critério eliminatório da vaga.", ...ALERTA },
} as const;

export const EXPLICACAO_SCORE =
  "O score (0 a 100) soma os critérios da triagem da vaga — japonês, experiência, disponibilidade etc. Serve para priorizar a análise; não é probabilidade de contratação.";
