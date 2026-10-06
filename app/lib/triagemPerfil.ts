// Perguntas de perfil da candidatura (/empregos) — pedido do Wilson,
// 06/out/2026 ("outras perguntas eliminatórias"): peso e altura,
// escolaridade, daltonismo (com teste rápido, só pra vagas de componentes
// eletrônicos), passagem anterior pelo Japão, filhos, horas extras, turno
// alternado, província de preferência, flexibilidade de região, dívidas no
// Brasil e no Japão e ajuda do governo para retorno ao Brasil.
//
// Módulo puro (sem React) — usado pela página e pela API, que valida e
// recalcula tudo no servidor.
//
// Critério: por decisão do Wilson ("experiência e re-entry eliminam/
// qualificam dependendo da vaga, ao preencher a vaga vamos dizer qual
// peso/critério, por hora deixe um critério unificado"), cada vaga pode
// ter regras próprias em `criteriosTriagem` (app/lib/vagasCatalogo.ts).
// Sem isso vale o padrão de CRITERIOS_TRIAGEM_PADRAO (candidaturaScoring.ts):
// - turno alternado: eliminatório quando o turno da vaga é alternado
//   (o próprio Wilson marcou essa como eliminatória);
// - daltonismo: eliminatório nas vagas de componentes eletrônicos;
// - demais: informativas — vão destacadas pra equipe no e-mail, mas não
//   barram ninguém automaticamente. Horas extras nunca eliminam.

export type SimNao = "sim" | "nao" | "";

export type Escolaridade =
  | "fundamentalIncompleto"
  | "fundamentalCompleto"
  | "medioIncompleto"
  | "medioCompleto"
  | "tecnico"
  | "superiorIncompleto"
  | "superiorCompleto"
  | "posGraduacao"
  | "mestrado"
  | "doutorado";

export const ESCOLARIDADES: { key: Escolaridade; label: string }[] = [
  { key: "fundamentalIncompleto", label: "Ensino fundamental incompleto" },
  { key: "fundamentalCompleto", label: "Ensino fundamental completo" },
  { key: "medioIncompleto", label: "Ensino médio incompleto" },
  { key: "medioCompleto", label: "Ensino médio completo" },
  { key: "tecnico", label: "Curso técnico" },
  { key: "superiorIncompleto", label: "Ensino superior incompleto" },
  { key: "superiorCompleto", label: "Ensino superior completo" },
  { key: "posGraduacao", label: "Pós-graduação / especialização" },
  { key: "mestrado", label: "Mestrado" },
  { key: "doutorado", label: "Doutorado" },
];

export function ordemEscolaridade(e: Escolaridade | ""): number {
  return e ? ESCOLARIDADES.findIndex((x) => x.key === e) : -1;
}

export type HorasExtras = "sim" | "nao" | "indiferente" | "";
export const OPCOES_HORAS_EXTRAS: { key: Exclude<HorasExtras, "">; label: string }[] = [
  { key: "sim", label: "Sim" },
  { key: "nao", label: "Não" },
  { key: "indiferente", label: "Indiferente" },
];

export type FlexibilidadeRegiao = "somente" | "proximas" | "qualquer" | "";
export const OPCOES_FLEXIBILIDADE: { key: Exclude<FlexibilidadeRegiao, "">; label: string }[] = [
  { key: "somente", label: "Só aceito a província escolhida" },
  { key: "proximas", label: "Aceito morar em províncias próximas à inicial" },
  { key: "qualquer", label: "Aceito trabalhar em qualquer província" },
];

export type Daltonismo = "sim" | "nao" | "naoSei" | "";
export const OPCOES_DALTONISMO: { key: Exclude<Daltonismo, "">; label: string }[] = [
  { key: "nao", label: "Não" },
  { key: "sim", label: "Sim" },
  { key: "naoSei", label: "Não sei" },
];

// ── Perguntas 14–21 (Wilson, 06/out/2026) ──
// Saúde, antecedentes e tatuagem: o enquadramento de cada pergunta explica
// POR QUE ela existe (visto, entrada de medicamento no Japão, estrutura
// médica da cidade, regras de alojamento/banho coletivo), pra não soar
// como filtro de pessoa. Por padrão nenhuma delas elimina sozinha — vão
// marcadas "REVISAR" no e-mail da equipe (ver CRITERIOS_TRIAGEM_PADRAO e
// a explicação em candidaturaScoring.ts). Dados de saúde exigem
// consentimento específico (LGPD art. 11) — ver consentimentoSaude.

export type Financiamento = "sim" | "parcial" | "nao" | "";
export const OPCOES_FINANCIAMENTO: { key: Exclude<Financiamento, "">; label: string }[] = [
  { key: "sim", label: "Sim, preciso financiar" },
  { key: "parcial", label: "Só parte" },
  { key: "nao", label: "Não, pago à vista" },
];

export type RegiaoTatuagem = "rosto" | "pescoco" | "maos" | "antebracos" | "bracos" | "pernas" | "outra";
export const REGIOES_TATUAGEM: { key: RegiaoTatuagem; label: string }[] = [
  { key: "rosto", label: "Rosto" },
  { key: "pescoco", label: "Pescoço" },
  { key: "maos", label: "Mãos" },
  { key: "antebracos", label: "Antebraços" },
  { key: "bracos", label: "Braços" },
  { key: "pernas", label: "Pernas" },
  { key: "outra", label: "Outra região visível" },
];
export type TamanhoTatuagem = "pequena" | "media" | "grande" | "";
export const TAMANHOS_TATUAGEM: { key: Exclude<TamanhoTatuagem, "">; label: string }[] = [
  { key: "pequena", label: "Pequena (até o tamanho de uma moeda)" },
  { key: "media", label: "Média (até a palma da mão)" },
  { key: "grande", label: "Grande (maior que a palma da mão)" },
];

// Condições visuais além de miopia/astigmatismo/hipermetropia (que são
// corrigidas com óculos e não entram aqui).
export type CondicaoVisual =
  | "glaucoma"
  | "catarata"
  | "ceratocone"
  | "retinopatiaDiabetica"
  | "degeneracaoMacular"
  | "retinosePigmentar"
  | "descolamentoRetina"
  | "uveite"
  | "visaoMonocular"
  | "ambliopia"
  | "estrabismo"
  | "nistagmo"
  | "outra";
export const CONDICOES_VISUAIS: { key: CondicaoVisual; label: string }[] = [
  { key: "glaucoma", label: "Glaucoma" },
  { key: "catarata", label: "Catarata" },
  { key: "ceratocone", label: "Ceratocone" },
  { key: "retinopatiaDiabetica", label: "Retinopatia diabética" },
  { key: "degeneracaoMacular", label: "Degeneração macular" },
  { key: "retinosePigmentar", label: "Retinose pigmentar" },
  { key: "descolamentoRetina", label: "Descolamento de retina (atual ou passado)" },
  { key: "uveite", label: "Uveíte" },
  { key: "visaoMonocular", label: "Visão em um olho só (visão monocular)" },
  { key: "ambliopia", label: "Ambliopia (olho preguiçoso)" },
  { key: "estrabismo", label: "Estrabismo" },
  { key: "nistagmo", label: "Nistagmo" },
  { key: "outra", label: "Outra condição visual" },
];

export type Fumante = "nao" | "ocasional" | "diario" | "exFumante" | "";
export const OPCOES_FUMANTE: { key: Exclude<Fumante, "">; label: string }[] = [
  { key: "nao", label: "Não fumo" },
  { key: "exFumante", label: "Ex-fumante" },
  { key: "ocasional", label: "Fumo ocasionalmente" },
  { key: "diario", label: "Fumo todos os dias" },
];

export type ClasseMedicamento =
  | "ansioliticos"
  | "antidepressivos"
  | "estabilizadoresHumor"
  | "antipsicoticos"
  | "estimulantesTdah"
  | "anticonvulsivantes"
  | "dorCronica"
  | "indutoresSono"
  | "outro";
export const CLASSES_MEDICAMENTO: { key: ClasseMedicamento; label: string }[] = [
  { key: "ansioliticos", label: "Ansiolíticos" },
  { key: "antidepressivos", label: "Antidepressivos" },
  { key: "estabilizadoresHumor", label: "Estabilizadores de humor" },
  { key: "antipsicoticos", label: "Antipsicóticos" },
  { key: "estimulantesTdah", label: "Estimulantes (ex.: para TDAH)" },
  { key: "anticonvulsivantes", label: "Anticonvulsivantes" },
  { key: "dorCronica", label: "Para dor crônica (lombar, articular etc.), inclusive opioides" },
  { key: "indutoresSono", label: "Indutores de sono" },
  { key: "outro", label: "Outro medicamento controlado" },
];

export type TipoDiabetes = "tipo1" | "tipo2" | "gestacional" | "outro" | "";
export const TIPOS_DIABETES: { key: Exclude<TipoDiabetes, "">; label: string }[] = [
  { key: "tipo1", label: "Tipo 1" },
  { key: "tipo2", label: "Tipo 2" },
  { key: "gestacional", label: "Gestacional" },
  { key: "outro", label: "Outro / não sei" },
];

// 47 províncias do Japão (romanização usada no catálogo de vagas).
export const PROVINCIAS_JAPAO = [
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
  "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
  "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano",
  "Gifu", "Shizuoka", "Aichi", "Mie",
  "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama",
  "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi",
  "Tokushima", "Kagawa", "Ehime", "Kochi",
  "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa",
] as const;

// ── Teste rápido de daltonismo (placas pseudoisocromáticas) ──
// Placas recortadas das folhas de teste enviadas pelo Wilson
// ("Teste1..5 Daltonismo Jun2024.pdf" — mesmas 12 placas em ordem
// diferente). Usamos só as de número (as de "seguir a linha" não
// funcionam bem num formulário). A primeira é a placa de controle, que
// qualquer pessoa enxerga — se errar essa, o teste é inválido (tela,
// filtro de luz azul, etc.), não reprovação. O gabarito abaixo é o número
// visível pra quem tem visão de cores normal — CONFIRMAR com o Wilson.
export const PLACAS_DALTONISMO: { id: string; imagem: string; resposta: string; controle?: boolean }[] = [
  { id: "p25", imagem: "/images/empregos/daltonismo-placa-25.webp", resposta: "25", controle: true },
  { id: "p8", imagem: "/images/empregos/daltonismo-placa-8.webp", resposta: "8" },
  { id: "p5", imagem: "/images/empregos/daltonismo-placa-5.webp", resposta: "5" },
  { id: "p6", imagem: "/images/empregos/daltonismo-placa-6.webp", resposta: "6" },
  { id: "p2", imagem: "/images/empregos/daltonismo-placa-2.webp", resposta: "2" },
  { id: "p4", imagem: "/images/empregos/daltonismo-placa-4.webp", resposta: "4" },
  { id: "p9", imagem: "/images/empregos/daltonismo-placa-9.webp", resposta: "9" },
  { id: "p3", imagem: "/images/empregos/daltonismo-placa-3.webp", resposta: "3" },
];

// Aprovação: controle certo + no máximo 1 erro nas 7 placas de teste.
export const ERROS_MAXIMOS_DALTONISMO = 1;

export type ResultadoTesteDaltonismo = {
  respostas: Record<string, string>;
  acertos: number;
  total: number;
  controleOk: boolean;
  aprovado: boolean;
};

export function avaliarTesteDaltonismo(respostas: Record<string, string>): ResultadoTesteDaltonismo {
  const limpa = (v: unknown) => String(v ?? "").replace(/\D/g, "");
  const testes = PLACAS_DALTONISMO.filter((p) => !p.controle);
  const controle = PLACAS_DALTONISMO.find((p) => p.controle);
  const acertos = testes.filter((p) => limpa(respostas[p.id]) === p.resposta).length;
  const controleOk = controle ? limpa(respostas[controle.id]) === controle.resposta : true;
  return {
    respostas: Object.fromEntries(PLACAS_DALTONISMO.map((p) => [p.id, String(respostas[p.id] ?? "").slice(0, 10)])),
    acertos,
    total: testes.length,
    controleOk,
    aprovado: controleOk && testes.length - acertos <= ERROS_MAXIMOS_DALTONISMO,
  };
}

export type PerfilCandidato = {
  // CEP de residência (Wilson, 06/out/2026) — 8 dígitos (Brasil) ou 7
  // (código postal 〒 japonês, pra quem já mora no Japão). Só dígitos.
  cepResidencia: string;
  pesoKg: number | null;
  alturaCm: number | null;
  escolaridade: Escolaridade | "";
  daltonismo: Daltonismo;
  testeDaltonismo: ResultadoTesteDaltonismo | null;
  jaEsteveJapao: SimNao;
  anosNoJapao: number | null;
  temFilhos: SimNao;
  idadesFilhos: number[];
  horasExtras: HorasExtras;
  turnoAlternado: SimNao;
  provinciaPreferida: string; // "" = sem preferência
  flexibilidadeRegiao: FlexibilidadeRegiao;
  dividasBrasil: SimNao;
  dividasJapao: SimNao;
  ajudaGovernoRetorno: SimNao;
  // 14) Financiamento de taxa de contratação, passagem e documentos.
  financiamentoCustos: Financiamento;
  // 15) Antecedentes criminais (certidão da PF é anexo opcional, enviado à parte).
  antecedentesCriminais: SimNao;
  // 16) Tatuagem visível com uniforme.
  tatuagemVisivel: SimNao;
  tatuagemRegioes: RegiaoTatuagem[];
  tatuagemTamanho: TamanhoTatuagem;
  // Consentimento específico pros dados de saúde (17–21) — LGPD art. 11.
  consentimentoSaude: boolean;
  // 17) Doença grave no passado ou tratamento atual.
  doencaGrave: SimNao;
  doencaGraveDescricao: string;
  emTratamento: SimNao;
  // 18) Condições visuais (além de daltonismo, já perguntado acima).
  condicoesVisuais: CondicaoVisual[]; // vazio + semCondicaoVisual=true = nenhuma
  semCondicaoVisual: boolean;
  // 19) Fumante.
  fumante: Fumante;
  // 20) Medicação controlada.
  medicacaoControlada: SimNao;
  medicacaoClasses: ClasseMedicamento[];
  // 21) Diabetes.
  diabetes: SimNao;
  diabetesTipo: TipoDiabetes;
  insulinaInjetavel: SimNao;
};

export const PERFIL_VAZIO: PerfilCandidato = {
  cepResidencia: "",
  pesoKg: null,
  alturaCm: null,
  escolaridade: "",
  daltonismo: "",
  testeDaltonismo: null,
  jaEsteveJapao: "",
  anosNoJapao: null,
  temFilhos: "",
  idadesFilhos: [],
  horasExtras: "",
  turnoAlternado: "",
  provinciaPreferida: "",
  flexibilidadeRegiao: "",
  dividasBrasil: "",
  dividasJapao: "",
  ajudaGovernoRetorno: "",
  financiamentoCustos: "",
  antecedentesCriminais: "",
  tatuagemVisivel: "",
  tatuagemRegioes: [],
  tatuagemTamanho: "",
  consentimentoSaude: false,
  doencaGrave: "",
  doencaGraveDescricao: "",
  emTratamento: "",
  condicoesVisuais: [],
  semCondicaoVisual: false,
  fumante: "",
  medicacaoControlada: "",
  medicacaoClasses: [],
  diabetes: "",
  diabetesTipo: "",
  insulinaInjetavel: "",
};

// "01310100" → "01310-100" (BR); "1500001" → "150-0001" (JP).
export function formatarCep(digitos: string): string {
  const d = digitos.replace(/\D/g, "").slice(0, 8);
  if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
  if (d.length === 7) return `〒${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
}

export function imc(perfil: Pick<PerfilCandidato, "pesoKg" | "alturaCm">): number | null {
  if (!perfil.pesoKg || !perfil.alturaCm) return null;
  const m = perfil.alturaCm / 100;
  return Math.round((perfil.pesoKg / (m * m)) * 10) / 10;
}

// Turno OBRIGATORIAMENTE alternado: menciona alternância/revezamento e não
// oferece opção de turno fixo (vagas "fixo ou alternado" não eliminam).
export function vagaTemTurnoAlternado(turno: string): boolean {
  return /alternad|revezamento|sankoutai|nikoutai|\b3 turnos\b/i.test(turno) && !/fixo/i.test(turno);
}

// Lista do que falta no perfil (validação de formulário — mesma regra no
// cliente e no servidor).
export function pendenciasPerfil(
  p: PerfilCandidato,
  opts: { exigeTesteDaltonismo: boolean; perguntaFinanciamento: boolean },
): string[] {
  const falta: string[] = [];
  if (!/^\d{7,8}$/.test(p.cepResidencia)) falta.push("CEP de residência");
  if (!p.pesoKg || p.pesoKg < 30 || p.pesoKg > 250) falta.push("peso");
  if (!p.alturaCm || p.alturaCm < 120 || p.alturaCm > 230) falta.push("altura");
  if (!p.escolaridade) falta.push("escolaridade");
  if (!p.daltonismo) falta.push("daltonismo");
  if (opts.exigeTesteDaltonismo && !p.testeDaltonismo) falta.push("teste de daltonismo");
  if (!p.jaEsteveJapao) falta.push("se já esteve no Japão");
  if (p.jaEsteveJapao === "sim" && (p.anosNoJapao === null || p.anosNoJapao < 0)) falta.push("tempo no Japão");
  if (!p.temFilhos) falta.push("filhos");
  if (p.temFilhos === "sim" && (p.idadesFilhos.length === 0 || p.idadesFilhos.some((i) => !(i >= 0 && i <= 40)))) {
    falta.push("idade dos filhos");
  }
  if (!p.horasExtras) falta.push("horas extras");
  if (!p.turnoAlternado) falta.push("turno alternado");
  if (!p.flexibilidadeRegiao) falta.push("flexibilidade de região");
  if (!p.dividasBrasil) falta.push("dívidas no Brasil");
  if (p.jaEsteveJapao === "sim" && !p.dividasJapao) falta.push("dívidas no Japão");
  if (p.jaEsteveJapao === "sim" && !p.ajudaGovernoRetorno) falta.push("ajuda do governo para retorno");
  if (opts.perguntaFinanciamento && !p.financiamentoCustos) falta.push("financiamento dos custos");
  if (!p.antecedentesCriminais) falta.push("antecedentes criminais");
  if (!p.tatuagemVisivel) falta.push("tatuagem visível");
  if (p.tatuagemVisivel === "sim" && (p.tatuagemRegioes.length === 0 || !p.tatuagemTamanho)) {
    falta.push("região e tamanho da tatuagem");
  }
  if (!p.consentimentoSaude) falta.push("autorização de uso dos dados de saúde");
  if (!p.doencaGrave) falta.push("doença grave/tratamento");
  if (p.doencaGrave === "sim" && !p.emTratamento) falta.push("se está em tratamento");
  if (!p.semCondicaoVisual && p.condicoesVisuais.length === 0) falta.push("condições visuais");
  if (!p.fumante) falta.push("se é fumante");
  if (!p.medicacaoControlada) falta.push("medicação controlada");
  if (p.medicacaoControlada === "sim" && p.medicacaoClasses.length === 0) falta.push("tipo de medicação");
  if (!p.diabetes) falta.push("diabetes");
  if (p.diabetes === "sim" && (!p.diabetesTipo || !p.insulinaInjetavel)) falta.push("tipo de diabetes/insulina");
  return falta;
}

// Normaliza o que veio do navegador (nunca confiar no formato).
export function parsePerfil(bruto: unknown): PerfilCandidato {
  const o = (bruto && typeof bruto === "object" ? bruto : {}) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && v !== "" && v !== null ? n : null;
  };
  const simNao = (v: unknown): SimNao => (v === "sim" || v === "nao" ? v : "");
  const de = <T extends string>(v: unknown, validos: readonly T[]): T | "" =>
    validos.includes(v as T) ? (v as T) : "";
  const lista = <T extends string>(v: unknown, validos: readonly T[]): T[] =>
    Array.isArray(v) ? Array.from(new Set(v.filter((x): x is T => validos.includes(x as T)))) : [];
  const jaEsteve = simNao(o.jaEsteveJapao);
  const temFilhos = simNao(o.temFilhos);
  return {
    cepResidencia: String(o.cepResidencia ?? "").replace(/\D/g, "").slice(0, 8),
    pesoKg: num(o.pesoKg),
    alturaCm: num(o.alturaCm),
    escolaridade: de(o.escolaridade, ESCOLARIDADES.map((e) => e.key)),
    daltonismo: de(o.daltonismo, ["sim", "nao", "naoSei"] as const),
    testeDaltonismo:
      o.testeDaltonismo && typeof o.testeDaltonismo === "object"
        ? avaliarTesteDaltonismo(((o.testeDaltonismo as Record<string, unknown>).respostas ?? {}) as Record<string, string>)
        : null,
    jaEsteveJapao: jaEsteve,
    anosNoJapao: jaEsteve === "sim" ? num(o.anosNoJapao) : null,
    temFilhos,
    idadesFilhos:
      temFilhos === "sim" && Array.isArray(o.idadesFilhos)
        ? o.idadesFilhos.map(Number).filter((n) => Number.isFinite(n)).slice(0, 10)
        : [],
    horasExtras: de(o.horasExtras, ["sim", "nao", "indiferente"] as const),
    turnoAlternado: simNao(o.turnoAlternado),
    provinciaPreferida: (PROVINCIAS_JAPAO as readonly string[]).includes(String(o.provinciaPreferida))
      ? String(o.provinciaPreferida)
      : "",
    flexibilidadeRegiao: de(o.flexibilidadeRegiao, ["somente", "proximas", "qualquer"] as const),
    dividasBrasil: simNao(o.dividasBrasil),
    dividasJapao: jaEsteve === "sim" ? simNao(o.dividasJapao) : "",
    ajudaGovernoRetorno: jaEsteve === "sim" ? simNao(o.ajudaGovernoRetorno) : "",
    financiamentoCustos: de(o.financiamentoCustos, ["sim", "parcial", "nao"] as const),
    antecedentesCriminais: simNao(o.antecedentesCriminais),
    tatuagemVisivel: simNao(o.tatuagemVisivel),
    tatuagemRegioes:
      o.tatuagemVisivel === "sim" ? lista(o.tatuagemRegioes, REGIOES_TATUAGEM.map((r) => r.key)) : [],
    tatuagemTamanho: o.tatuagemVisivel === "sim" ? de(o.tatuagemTamanho, ["pequena", "media", "grande"] as const) : "",
    consentimentoSaude: o.consentimentoSaude === true,
    doencaGrave: simNao(o.doencaGrave),
    doencaGraveDescricao: o.doencaGrave === "sim" ? String(o.doencaGraveDescricao ?? "").slice(0, 500) : "",
    emTratamento: o.doencaGrave === "sim" ? simNao(o.emTratamento) : "",
    condicoesVisuais: o.semCondicaoVisual === true ? [] : lista(o.condicoesVisuais, CONDICOES_VISUAIS.map((c) => c.key)),
    semCondicaoVisual: o.semCondicaoVisual === true,
    fumante: de(o.fumante, ["nao", "ocasional", "diario", "exFumante"] as const),
    medicacaoControlada: simNao(o.medicacaoControlada),
    medicacaoClasses:
      o.medicacaoControlada === "sim" ? lista(o.medicacaoClasses, CLASSES_MEDICAMENTO.map((c) => c.key)) : [],
    diabetes: simNao(o.diabetes),
    diabetesTipo: o.diabetes === "sim" ? de(o.diabetesTipo, ["tipo1", "tipo2", "gestacional", "outro"] as const) : "",
    insulinaInjetavel: o.diabetes === "sim" ? simNao(o.insulinaInjetavel) : "",
  };
}
