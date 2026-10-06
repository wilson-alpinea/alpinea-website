// Motor de pontuação de candidatura (0–100%) — pedido do Wilson,
// 25/set/2026: "deve haver um sistema que captura essa informacao e
// valida se o lead é compativel com a vaga, deve haver um percenteil
// 0-100% de compatibilidade que aparece ao ler o curriculo do
// candidato". Confirmado com o Wilson: SEM IA paga — isso aqui é um
// motor de critérios/palavras-chave, determinístico e explicável, não
// uma leitura "inteligente" do currículo. Cada candidato vê exatamente
// quais critérios pesaram na nota (ver CriterioPontuacao). Usado só em
// código de servidor (app/api/empregos-candidatura/route.ts) — sem "use
// client", mas nenhuma dependência de Node aqui (fica puro, testável).
//
// Importante sobre os limites dessa abordagem: é um match de
// palavras-chave e critérios diretos (idade, autorrelato), não
// compreensão de texto. Um currículo bem escrito mas com vocabulário
// fora do dicionário abaixo pode pontuar mais baixo do que devia — por
// isso o Wilson decidiu (25/set/2026) que candidaturas abaixo de 80%
// continuam registradas pra revisão manual da equipe, em vez de
// rejeitadas automaticamente.

import type { SetorKey, Vaga } from "./vagasCatalogo";
import {
  imc,
  ordemEscolaridade,
  vagaTemTurnoAlternado,
  ESCOLARIDADES,
  type Escolaridade,
  type PerfilCandidato,
} from "./triagemPerfil";

// ── Perguntas de triagem — mesmas para todas as vagas (decisão do
// Wilson, 25/set/2026: "Mesmas perguntas p/ todas as vagas"). ──
export type NivelJapones = "nenhum" | "basico" | "intermediario" | "avancado" | "fluente";

export const NIVEIS_JAPONES: { key: NivelJapones; label: string }[] = [
  { key: "nenhum", label: "Não falo japonês" },
  { key: "basico", label: "Básico" },
  { key: "intermediario", label: "Intermediário" },
  { key: "avancado", label: "Avançado" },
  { key: "fluente", label: "Fluente" },
];

// Nível de japonês detalhado por certificação — pedido do Wilson,
// 06/out/2026: "nivel de japonês deve incluir JLPT N1-N5 e BJT levels para
// cada nivel e também colocar nivel fluente, deixar campo disponivel para
// submeter certificado de aprovação". É o que o candidato escolhe no
// formulário; cada opção aponta pra um dos 5 níveis de NivelJapones acima,
// que continuam sendo a base da pontuação (mesma régua do parser de
// vaga.idioma: N1 → fluente, N2 → avançado, N3 → intermediário, N4/N5 →
// básico). A correspondência JLPT ↔ BJT é aproximada (as duas provas medem
// coisas diferentes — o BJT é focado em japonês de negócios) e segue a
// equivalência usual: J5 ≈ N5/N4, J4 ≈ N3, J3 ≈ N2, J2/J1 ≈ N1, J1+ acima
// do N1.
export type NivelJaponesDetalhado = "nenhum" | "n5" | "n4" | "n3" | "n2" | "n1" | "fluente";

// Faixas oficiais do BJT (0–800 pts): J5 0–199 · J4 200–319 · J3 320–419 ·
// J2 420–529 · J1 530–599 · J1+ 600–800 (Wilson, 06/out/2026: mostrar o
// score de cada nível).
export const NIVEIS_JAPONES_DETALHADOS: {
  key: NivelJaponesDetalhado;
  label: string;
  bjt: string | null;
  nivel: NivelJapones;
}[] = [
  { key: "nenhum", label: "Não falo japonês", bjt: null, nivel: "nenhum" },
  { key: "n5", label: "JLPT N5 — iniciante", bjt: "BJT J5 (0–199 pts)", nivel: "basico" },
  { key: "n4", label: "JLPT N4 — básico", bjt: "BJT J5 (0–199 pts)", nivel: "basico" },
  { key: "n3", label: "JLPT N3 — intermediário", bjt: "BJT J4 (200–319 pts)", nivel: "intermediario" },
  { key: "n2", label: "JLPT N2 — avançado", bjt: "BJT J3 (320–419 pts)", nivel: "avancado" },
  { key: "n1", label: "JLPT N1 — muito avançado", bjt: "BJT J2–J1 (420–599 pts)", nivel: "fluente" },
  { key: "fluente", label: "Fluente / nativo", bjt: "BJT J1+ (600–800 pts)", nivel: "fluente" },
];

export function nivelDoDetalhado(detalhado: string): NivelJapones | "" {
  return NIVEIS_JAPONES_DETALHADOS.find((n) => n.key === detalhado)?.nivel ?? "";
}

const ORDEM_NIVEL_JAPONES: Record<NivelJapones, number> = {
  nenhum: 0,
  basico: 1,
  intermediario: 2,
  avancado: 3,
  fluente: 4,
};

export type PerguntaTriagemKey =
  | "passaporte"
  | "disponibilidadeEmbarque"
  | "experienciaSetor"
  | "reEntry"
  | "nivelJapones";

// ── Critérios eliminatórios/qualificatórios — pedido do Wilson,
// 06/out/2026: "experiência e re-entry eliminam/qualificam dependendo da
// vaga, ao preencher a vaga vamos dizer qual peso/critério, por hora deixe
// um critério unificado". Cada vaga pode ter `criteriosTriagem` próprio em
// app/lib/vagasCatalogo.ts; sem isso vale CRITERIOS_TRIAGEM_PADRAO.
// - "eliminatorio": resposta "Não" barra a etapa de foto, qualquer que
//   seja a pontuação (o candidato vê o motivo no resultado).
// - "qualificatorio": "Sim" soma os pontos do critério; "Não" só deixa de
//   somar.
// - "informativo": não pontua nem barra; vai destacado no e-mail da equipe.
export type ModoCriterioTriagem = "eliminatorio" | "qualificatorio" | "informativo";

export type CriteriosTriagem = {
  experiencia: ModoCriterioTriagem;
  reEntry: ModoCriterioTriagem;
  // Perguntas de perfil (06/out/2026 — ver app/lib/triagemPerfil.ts).
  turnoAlternado: ModoCriterioTriagem;
  daltonismo: ModoCriterioTriagem;
  dividasBrasil: ModoCriterioTriagem;
  dividasJapao: ModoCriterioTriagem;
  ajudaGovernoRetorno: ModoCriterioTriagem;
  // Perguntas 15–21 (06/out/2026). Padrão "informativo": não eliminam
  // sozinhas; saem como "REVISAR" no e-mail da equipe. Decisão de produto
  // registrada: o Wilson pediu diabetes com insulina como eliminatória;
  // ficou como revisão manual por padrão porque eliminação automática por
  // condição de saúde é o ponto de maior risco legal (Lei 9.029/95 e LGPD
  // art. 11) — pra tornar eliminatório numa vaga específica (com
  // justificativa da fábrica), basta { diabetesInsulina: "eliminatorio" }
  // em vaga.criteriosTriagem.
  antecedentesCriminais: ModoCriterioTriagem;
  tatuagem: ModoCriterioTriagem;
  doencaGrave: ModoCriterioTriagem;
  condicaoVisual: ModoCriterioTriagem;
  fumante: ModoCriterioTriagem;
  medicacaoControlada: ModoCriterioTriagem;
  diabetesInsulina: ModoCriterioTriagem;
  // Limites opcionais por vaga (sem valor = não eliminam).
  escolaridadeMinima?: Escolaridade;
  alturaMinimaCm?: number;
  alturaMaximaCm?: number;
  imcMaximo?: number;
};

// Critério unificado de hoje. Experiência e Re-Entry só qualificam; turno
// alternado e daltonismo dependem da vaga (ver criteriosDaVaga); o resto
// é informativo.
export const CRITERIOS_TRIAGEM_PADRAO: CriteriosTriagem = {
  experiencia: "qualificatorio",
  reEntry: "qualificatorio",
  turnoAlternado: "informativo",
  daltonismo: "informativo",
  dividasBrasil: "informativo",
  dividasJapao: "informativo",
  ajudaGovernoRetorno: "informativo",
  antecedentesCriminais: "informativo",
  tatuagem: "informativo",
  doencaGrave: "informativo",
  condicaoVisual: "informativo",
  fumante: "informativo",
  medicacaoControlada: "informativo",
  diabetesInsulina: "informativo",
};

// Regras efetivas de uma vaga: padrão + ajustes automáticos pelo próprio
// dado da vaga + o que estiver em vaga.criteriosTriagem (que sempre vence).
export function criteriosDaVaga(vaga: Vaga): CriteriosTriagem {
  return {
    ...CRITERIOS_TRIAGEM_PADRAO,
    // Turno alternado é eliminatório quando o turno da vaga é alternado
    // (pedido do Wilson: "pergunta eliminatória também").
    turnoAlternado: vagaTemTurnoAlternado(vaga.turno) ? "eliminatorio" : "informativo",
    // Daltonismo só importa em componentes eletrônicos.
    daltonismo: vaga.setor === "eletronicos" ? "eliminatorio" : "informativo",
    ...(vaga.criteriosTriagem ?? {}),
  };
}

export function vagaExigeTesteDaltonismo(vaga: Vaga): boolean {
  return vaga.setor === "eletronicos";
}

// Ascendência japonesa e data desejada de embarque — pedido do Wilson,
// 25/set/2026: "aqui ta faltando o pre-cadastro, anexar curriculo, nome
// completo, idade, ascendencia, etc quando gostaria de embarcar etc".
// Puramente informativo por enquanto — não entram na fórmula de
// pontuação (que já foi desenhada e confirmada com o Wilson, ver
// comentário no topo do arquivo); ficam visíveis pra equipe decidir na
// revisão manual (ascendência japonesa pode abrir caminhos de visto
// específicos no Japão, fora do escopo do motor determinístico aqui).
export type AscendenciaJaponesa =
  | "nenhuma"
  | "nissei"
  | "sansei"
  | "yonsei"
  | "conjugeDependente"
  | "outro";

export const ASCENDENCIA_JAPONESA: { key: AscendenciaJaponesa; label: string }[] = [
  { key: "nenhuma", label: "Não tenho ascendência japonesa" },
  { key: "nissei", label: "Nissei (filho/a de japonês/a)" },
  { key: "sansei", label: "Sansei (neto/a de japonês/a)" },
  { key: "yonsei", label: "Yonsei (bisneto/a de japonês/a)" },
  { key: "conjugeDependente", label: "Cônjuge ou dependente de descendente" },
  { key: "outro", label: "Outro / não sei" },
];

export type QuandoEmbarcar = "imediato" | "ate3Meses" | "ate6Meses" | "mais6Meses" | "aindaNaoSei";

export const QUANDO_EMBARCAR: { key: QuandoEmbarcar; label: string }[] = [
  { key: "imediato", label: "Imediatamente" },
  { key: "ate3Meses", label: "Em até 3 meses" },
  { key: "ate6Meses", label: "Em até 6 meses" },
  { key: "mais6Meses", label: "Mais de 6 meses" },
  { key: "aindaNaoSei", label: "Ainda não sei" },
];

export type RespostasTriagem = {
  passaporte: "sim" | "nao" | "";
  disponibilidadeEmbarque: "sim" | "nao" | "";
  experienciaSetor: "sim" | "nao" | "";
  // Re-Entry (permissão de reentrada) válido — Wilson, 06/out/2026.
  reEntry?: "sim" | "nao" | "";
  // Perguntas de perfil — ver app/lib/triagemPerfil.ts.
  perfil?: PerfilCandidato;
  nivelJapones: NivelJapones | "";
  // Opção escolhida no formulário (JLPT/BJT) — nivelJapones é derivado dela.
  nivelJaponesDetalhado?: NivelJaponesDetalhado | "";
  ascendencia: AscendenciaJaponesa | "";
  quandoEmbarcar: QuandoEmbarcar | "";
};

export const PERGUNTAS_TRIAGEM: {
  key: Exclude<PerguntaTriagemKey, "nivelJapones">;
  pergunta: string;
  ajuda?: string;
}[] = [
  {
    key: "passaporte",
    pergunta: "Você já tem passaporte válido?",
  },
  {
    key: "disponibilidadeEmbarque",
    pergunta: "Você tem disponibilidade para embarcar em até 6 meses?",
  },
  {
    key: "experienciaSetor",
    pergunta: "Você já tem experiência de trabalho na área da vaga (fábrica/produção)?",
    ajuda: "Não precisa ser no Japão — conta experiência no Brasil também.",
  },
  {
    key: "reEntry",
    pergunta: "Você possui Re-Entry válido?",
    ajuda:
      "Re-Entry (permissão de reentrada, 再入国許可) é a autorização que quem tem visto de residência no Japão recebe ao sair do país, para voltar com o mesmo visto sem precisar tirar um novo. Pode ser o especial (concedido no aeroporto, vale até 1 ano) ou o comum (solicitado na imigração, até 5 anos) — sempre limitado à validade do visto. Com Re-Entry válido, o embarque é bem mais rápido.",
  },
];

// ── Dicionário de palavras-chave por setor — usado pra medir aderência
// do texto do currículo à área da vaga. Termos em minúsculas e sem
// acento (a comparação normaliza o texto do currículo do mesmo jeito,
// ver normalizarTexto). Lista propositalmente ampla — inclui termos
// genéricos de trabalho industrial (fábrica, produção, operador) em
// todos os setores, pra não penalizar quem tem experiência industrial
// real mas não usa o jargão específico do setor. ──
const PALAVRAS_CHAVE_SETOR: Record<SetorKey, string[]> = {
  automotivo: [
    "automotiv", "montadora", "linha de montagem", "linha de producao",
    "solda", "soldagem", "usinagem", "torno", "fresa", "estampar",
    "estamparia", "injecao plastica", "injetora", "pintura industrial",
    "autopecas", "pecas automotivas", "chassi", "cambio", "motor",
    "freio", "pneu", "borracha", "metalurgic", "haken", "producao",
    "operador de producao", "operador de maquina", "controle de qualidade",
    "kaizen", "industrial",
  ],
  eletronicos: [
    "eletronic", "montagem de placas", "placa de circuito", "pcb",
    "solda smd", "componente eletronico", "semicondutor", "sala limpa",
    "clean room", "inspecao visual", "teste eletrico", "microscopio",
    "soldagem eletronica", "producao eletronica", "operador de linha",
    "controle de qualidade", "industrial", "producao",
  ],
  alimenticio: [
    "alimenticio", "fabrica de alimentos", "producao de alimentos",
    "embalagem", "envase", "boas praticas de fabricacao", "bpf",
    "haccp", "manipulacao de alimentos", "higiene alimentar",
    "frigorifico", "abatedouro", "panificacao", "bebidas",
    "operador de producao", "linha de producao", "industrial",
  ],
  materiais: [
    "vidro", "borracha", "plastico", "material industrial",
    "fibra de vidro", "moldagem", "extrusao", "injecao", "fundicao",
    "usinagem", "controle de qualidade", "fabrica", "operador de maquina",
    "linha de producao", "producao", "industrial",
  ],
};

const MATCHES_ALVO_PALAVRAS_CHAVE = 5; // 5+ termos distintos já vale nota máxima nesse critério
const TAMANHO_MINIMO_CURRICULO = 200; // caracteres — abaixo disso, currículo é tratado como incompleto/ilegível

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase();
}

// Tenta reconhecer o nível de japonês EXIGIDO a partir do texto livre de
// vaga.idioma (ex.: "N3 ou superior", "Básico a intermediário",
// "Fluente"). Texto livre escrito pelo Wilson a partir de fichas
// variadas — o parser é propositalmente tolerante: quando não reconhece
// nada, retorna null (critério vira "não foi possível determinar" e dá
// pontuação cheia, em vez de arriscar reprovar por engano).
function nivelExigidoDoTexto(idioma: string | undefined): NivelJapones | null {
  if (!idioma) return null;
  const t = normalizarTexto(idioma);
  if (/nao exigido|nao obrigatorio|nao necessario|indiferente/.test(t)) return "nenhum";
  // JLPT: N1/N2 = mais exigente (avançado/fluente), N3 = intermediário, N4/N5 = básico.
  if (/\bn1\b/.test(t)) return "fluente";
  if (/\bn2\b/.test(t)) return "avancado";
  if (/\bn3\b/.test(t)) return "intermediario";
  if (/\bn4\b|\bn5\b/.test(t)) return "basico";
  if (/fluente/.test(t)) return "fluente";
  if (/avancado/.test(t)) return "avancado";
  if (/intermediario/.test(t)) return "intermediario";
  if (/basico/.test(t)) return "basico";
  return null;
}

// Tenta extrair uma faixa etária [min, max] do texto livre de
// vaga.perfil (ex.: "18–39, até 45 com experiência"). Só tenta quando o
// texto parece mesmo falar de idade (contém "idade" ou um padrão
// "NN–NN"/"NN-NN") — fora isso retorna null (critério não se aplica,
// pontuação cheia) em vez de arriscar interpretar errado um texto sobre
// outra coisa (saúde, sexo, etc., que também moram em vaga.perfil).
function faixaEtariaDoTexto(perfil: string | undefined): { min: number; max: number } | null {
  if (!perfil) return null;
  const t = normalizarTexto(perfil);
  if (!/idade/.test(t) && !/\d{2}\s*[–-]\s*\d{2}/.test(t)) return null;
  const numeros = (t.match(/\d{2}/g) || [])
    .map(Number)
    .filter((n) => n >= 16 && n <= 75);
  if (numeros.length === 0) return null;
  return { min: Math.min(...numeros), max: Math.max(...numeros) };
}

export type CriterioPontuacao = {
  chave: string;
  label: string;
  pontosObtidos: number;
  pontosMaximos: number;
  detalhe: string;
};

export type ResultadoPontuacao = {
  pontuacao: number; // 0-100, soma dos critérios
  criterios: CriterioPontuacao[];
  aprovadoParaFoto: boolean; // pontuacao >= 80 e não eliminado
  // Área de Empregos do CRM (06/out/2026).
  eliminado: boolean;
  motivosEliminacao: string[];
  classificacao: ClassificacaoCandidatura;
  pontosRevisar: string[];
};

export type ClassificacaoCandidatura = "eliminado" | "aprovado_alto" | "aprovado_baixo";

// Itens que a equipe deve olhar com atenção mesmo quando não eliminam
// (modo "informativo") — vão pro CRM como etiquetas.
export function pontosParaRevisar(perfil: PerfilCandidato | undefined): string[] {
  if (!perfil) return [];
  const p: string[] = [];
  if (perfil.dividasBrasil === "sim") p.push("Dívidas no Brasil");
  if (perfil.dividasJapao === "sim") p.push("Dívidas/impostos no Japão");
  if (perfil.ajudaGovernoRetorno === "sim") p.push("Recebeu ajuda de retorno");
  if (perfil.antecedentesCriminais === "sim") p.push("Antecedentes criminais");
  if (perfil.tatuagemVisivel === "sim") p.push("Tatuagem visível");
  if (perfil.emTratamento === "sim") p.push("Em tratamento médico");
  if (perfil.condicoesVisuais.length > 0) p.push("Condição visual");
  if (perfil.medicacaoControlada === "sim") p.push("Medicação controlada");
  if (perfil.insulinaInjetavel === "sim") p.push("Insulina injetável");
  if (perfil.daltonismo === "sim" || perfil.daltonismo === "naoSei") p.push("Daltonismo (declarado/incerto)");
  if (perfil.testeDaltonismo && !perfil.testeDaltonismo.controleOk) p.push("Teste de daltonismo inválido");
  return p;
}

export const NOTA_MINIMA_PROXIMA_ETAPA = 80;

export function calcularPontuacaoCandidatura(params: {
  vaga: Vaga;
  curriculoTexto: string;
  idade: number | null;
  respostas: RespostasTriagem;
}): ResultadoPontuacao {
  const { vaga, curriculoTexto, idade, respostas } = params;
  const textoNormalizado = normalizarTexto(curriculoTexto || "");
  const criterios: CriterioPontuacao[] = [];

  // 1) Palavras-chave do setor no currículo — 30 pts (eram 35 até
  // 06/out/2026; 5 pts foram pro novo critério de Re-Entry, pra manter o
  // total em 100)
  const palavras = PALAVRAS_CHAVE_SETOR[vaga.setor] || [];
  const encontradas = palavras.filter((p) => textoNormalizado.includes(p));
  const pontosPalavras = Math.round(Math.min(1, encontradas.length / MATCHES_ALVO_PALAVRAS_CHAVE) * 30);
  criterios.push({
    chave: "palavrasChave",
    label: "Aderência do currículo ao setor da vaga",
    pontosObtidos: pontosPalavras,
    pontosMaximos: 30,
    detalhe:
      encontradas.length > 0
        ? `Encontramos ${encontradas.length} termo(s) relacionados a este setor no seu currículo.`
        : "Não encontramos termos relacionados a este setor no currículo enviado.",
  });

  // 2) Nível de japonês vs exigido pela vaga — 20 pts
  const nivelExigido = nivelExigidoDoTexto(vaga.idioma);
  let pontosJapones = 20;
  let detalheJapones = "Esta vaga não exige um nível específico de japonês.";
  if (nivelExigido !== null) {
    const nivelCandidato = respostas.nivelJapones || "nenhum";
    const diferenca = ORDEM_NIVEL_JAPONES[nivelCandidato] - ORDEM_NIVEL_JAPONES[nivelExigido];
    if (diferenca >= 0) {
      pontosJapones = 20;
      detalheJapones = "Seu nível de japonês atende ao exigido pela vaga.";
    } else if (diferenca === -1) {
      pontosJapones = 10;
      detalheJapones = "Seu nível de japonês está um pouco abaixo do exigido pela vaga.";
    } else {
      pontosJapones = 0;
      detalheJapones = "Seu nível de japonês está abaixo do exigido pela vaga.";
    }
  }
  criterios.push({
    chave: "japones",
    label: "Nível de japonês",
    pontosObtidos: pontosJapones,
    pontosMaximos: 20,
    detalhe: detalheJapones,
  });

  // 3) Faixa etária vs perfil da vaga — 15 pts
  const faixa = faixaEtariaDoTexto(vaga.perfil);
  let pontosIdade = 15;
  let detalheIdade = "Esta vaga não especifica uma faixa etária.";
  if (faixa !== null && idade !== null) {
    if (idade >= faixa.min && idade <= faixa.max) {
      pontosIdade = 15;
      detalheIdade = "Sua idade está dentro da faixa indicada para esta vaga.";
    } else {
      pontosIdade = 0;
      detalheIdade = "Sua idade está fora da faixa indicada para esta vaga.";
    }
  } else if (faixa !== null && idade === null) {
    pontosIdade = 7; // sem dado suficiente pra confirmar — não penaliza integralmente
    detalheIdade = "Não foi possível confirmar sua idade contra a faixa desta vaga.";
  }
  criterios.push({
    chave: "idade",
    label: "Faixa etária",
    pontosObtidos: pontosIdade,
    pontosMaximos: 15,
    detalhe: detalheIdade,
  });

  // 4) Experiência prévia na função/setor (autorrelato) — 10 pts
  const pontosExperiencia = respostas.experienciaSetor === "sim" ? 10 : 0;
  criterios.push({
    chave: "experiencia",
    label: "Experiência prévia na função",
    pontosObtidos: pontosExperiencia,
    pontosMaximos: 10,
    detalhe:
      respostas.experienciaSetor === "sim"
        ? "Você informou ter experiência prévia na área da vaga."
        : "Você informou não ter experiência prévia na área da vaga.",
  });

  // 5) Disponibilidade (passaporte + prazo de embarque) — 10 pts
  const temPassaporte = respostas.passaporte === "sim";
  const temDisponibilidade = respostas.disponibilidadeEmbarque === "sim";
  const pontosDisponibilidade = (temPassaporte ? 5 : 0) + (temDisponibilidade ? 5 : 0);
  criterios.push({
    chave: "disponibilidade",
    label: "Disponibilidade para embarque",
    pontosObtidos: pontosDisponibilidade,
    pontosMaximos: 10,
    detalhe:
      pontosDisponibilidade === 10
        ? "Você tem passaporte válido e disponibilidade para embarcar em até 6 meses."
        : "Falta passaporte válido e/ou disponibilidade de embarque em até 6 meses.",
  });

  // 5b) Re-Entry válido — 5 pts
  const temReEntry = respostas.reEntry === "sim";
  criterios.push({
    chave: "reEntry",
    label: "Re-Entry válido",
    pontosObtidos: temReEntry ? 5 : 0,
    pontosMaximos: 5,
    detalhe: temReEntry
      ? "Você informou ter Re-Entry válido — o embarque tende a ser mais rápido."
      : "Você informou não ter Re-Entry válido.",
  });

  // 6) Currículo completo e legível — 10 pts
  const pontosCompletude = textoNormalizado.length >= TAMANHO_MINIMO_CURRICULO ? 10 : 0;
  criterios.push({
    chave: "completude",
    label: "Currículo completo e legível",
    pontosObtidos: pontosCompletude,
    pontosMaximos: 10,
    detalhe:
      pontosCompletude === 10
        ? "Conseguimos ler seu currículo normalmente."
        : "O currículo enviado parece curto ou não foi possível extrair o texto corretamente — considere reenviar em PDF ou DOCX com texto selecionável.",
  });

  const pontuacao = criterios.reduce((soma, c) => soma + c.pontosObtidos, 0);

  // Eliminatórios da vaga (ou do critério padrão) — barram a etapa de foto
  // mesmo com pontuação alta.
  const regras = criteriosDaVaga(vaga);
  const perfil = respostas.perfil;
  const eliminadoPor: string[] = [];
  if (perfil) {
    if (regras.turnoAlternado === "eliminatorio" && perfil.turnoAlternado !== "sim") {
      eliminadoPor.push("Esta vaga trabalha em turno alternado (dia/noite).");
    }
    if (regras.daltonismo === "eliminatorio") {
      if (perfil.daltonismo === "sim") eliminadoPor.push("Esta vaga (componentes eletrônicos) não aceita daltonismo.");
      else if (perfil.testeDaltonismo && !perfil.testeDaltonismo.aprovado) {
        eliminadoPor.push(
          perfil.testeDaltonismo.controleOk
            ? "O teste rápido de visão de cores indicou possível daltonismo — exigido para componentes eletrônicos."
            : "O teste de visão de cores não pôde ser validado (a placa de controle não foi reconhecida) — nossa equipe vai refazer o teste com você.",
        );
      }
    }
    if (regras.dividasBrasil === "eliminatorio" && perfil.dividasBrasil === "sim") {
      eliminadoPor.push("Esta vaga não aceita candidatos com dívidas em aberto no Brasil.");
    }
    if (regras.dividasJapao === "eliminatorio" && perfil.dividasJapao === "sim") {
      eliminadoPor.push("Esta vaga não aceita candidatos com dívidas/impostos em aberto no Japão.");
    }
    if (regras.ajudaGovernoRetorno === "eliminatorio" && perfil.ajudaGovernoRetorno === "sim") {
      eliminadoPor.push("Esta vaga não aceita candidatos que receberam ajuda do governo para retornar ao Brasil.");
    }
    if (regras.escolaridadeMinima && ordemEscolaridade(perfil.escolaridade) < ordemEscolaridade(regras.escolaridadeMinima)) {
      const rotulo = ESCOLARIDADES.find((e) => e.key === regras.escolaridadeMinima)?.label ?? "";
      eliminadoPor.push(`Esta vaga exige escolaridade mínima: ${rotulo.toLowerCase()}.`);
    }
    if (perfil.alturaCm) {
      if (regras.alturaMinimaCm && perfil.alturaCm < regras.alturaMinimaCm) {
        eliminadoPor.push(`Esta vaga exige altura mínima de ${regras.alturaMinimaCm} cm.`);
      }
      if (regras.alturaMaximaCm && perfil.alturaCm > regras.alturaMaximaCm) {
        eliminadoPor.push(`Esta vaga tem altura máxima de ${regras.alturaMaximaCm} cm.`);
      }
    }
    const regrasSim: [keyof CriteriosTriagem, boolean, string][] = [
      ["antecedentesCriminais", perfil.antecedentesCriminais === "sim", "Esta vaga não aceita candidatos com antecedentes criminais (exigência do visto/empresa)."],
      ["tatuagem", perfil.tatuagemVisivel === "sim", "Esta vaga tem restrição a tatuagens visíveis com o uniforme."],
      ["doencaGrave", perfil.emTratamento === "sim", "Esta vaga exige avaliação médica prévia para quem está em tratamento."],
      ["condicaoVisual", perfil.condicoesVisuais.length > 0, "Esta vaga exige avaliação de visão compatível com a função."],
      ["fumante", perfil.fumante === "ocasional" || perfil.fumante === "diario", "Esta vaga/alojamento não aceita fumantes."],
      ["medicacaoControlada", perfil.medicacaoControlada === "sim", "Esta vaga exige avaliação prévia de medicação controlada."],
      ["diabetesInsulina", perfil.insulinaInjetavel === "sim", "Esta vaga exige avaliação prévia para uso de insulina injetável."],
    ];
    for (const [chave, condicao, motivo] of regrasSim) {
      if (regras[chave] === "eliminatorio" && condicao) eliminadoPor.push(motivo);
    }
    const imcCandidato = imc(perfil);
    if (regras.imcMaximo && imcCandidato !== null && imcCandidato > regras.imcMaximo) {
      eliminadoPor.push("Esta vaga tem limite de IMC (peso/altura) exigido pela fábrica.");
    }
  }
  if (regras.experiencia === "eliminatorio" && respostas.experienciaSetor !== "sim") {
    eliminadoPor.push("Esta vaga exige experiência prévia em fábrica/produção.");
  }
  if (regras.reEntry === "eliminatorio" && respostas.reEntry !== "sim") {
    eliminadoPor.push("Esta vaga exige Re-Entry válido.");
  }
  for (const motivo of eliminadoPor) {
    criterios.push({ chave: "eliminatorio", label: "Requisito obrigatório da vaga", pontosObtidos: 0, pontosMaximos: 0, detalhe: motivo });
  }

  const eliminado = eliminadoPor.length > 0;
  return {
    pontuacao,
    criterios,
    aprovadoParaFoto: pontuacao >= NOTA_MINIMA_PROXIMA_ETAPA && !eliminado,
    eliminado,
    motivosEliminacao: eliminadoPor,
    classificacao: eliminado ? "eliminado" : pontuacao >= NOTA_MINIMA_PROXIMA_ETAPA ? "aprovado_alto" : "aprovado_baixo",
    pontosRevisar: pontosParaRevisar(perfil),
  };
}
