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
  | "nivelJapones";

export type RespostasTriagem = {
  passaporte: "sim" | "nao" | "";
  disponibilidadeEmbarque: "sim" | "nao" | "";
  experienciaSetor: "sim" | "nao" | "";
  nivelJapones: NivelJapones | "";
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
  aprovadoParaFoto: boolean; // pontuacao >= 80
};

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

  // 1) Palavras-chave do setor no currículo — 35 pts
  const palavras = PALAVRAS_CHAVE_SETOR[vaga.setor] || [];
  const encontradas = palavras.filter((p) => textoNormalizado.includes(p));
  const pontosPalavras = Math.round(Math.min(1, encontradas.length / MATCHES_ALVO_PALAVRAS_CHAVE) * 35);
  criterios.push({
    chave: "palavrasChave",
    label: "Aderência do currículo ao setor da vaga",
    pontosObtidos: pontosPalavras,
    pontosMaximos: 35,
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

  return {
    pontuacao,
    criterios,
    aprovadoParaFoto: pontuacao >= NOTA_MINIMA_PROXIMA_ETAPA,
  };
}
