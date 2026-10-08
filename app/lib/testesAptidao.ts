// Testes de aptidão (適性検査) — versão web dos testes em papel de uma das
// empreiteiras parceiras ("FUJIARTE TESTES Jun2024.pdf", enviado pelo
// Wilson em 08/out/2026: "precisamos melhorar a parte de testes para vagas
// da fujiarte"). Regras de aprovação passadas pela equipe da Ajisai no
// mesmo dia. NADA aqui aparece com o nome da parceira para o candidato —
// as páginas de recrutamento são só Ajisai.
//
// Decisões do Wilson (08/out/2026):
//   - entram: visão (adaptado), matemática, matemática com decimais,
//     comparação, hanamaru e japonês. A "marcação com ponto" ficou de fora
//     (sugestão da própria equipe — não tem versão web confiável);
//   - eliminatório: abaixo do mínimo, a candidatura fica registrada no CRM
//     mas não segue para a ficha cadastral (a equipe pode liberar à mão);
//   - etapa própria, depois do match de 80%+ e antes da ficha.
//
// Este arquivo roda no cliente e no servidor. A correção oficial é sempre a
// do servidor (app/api/empregos-testes) — o cliente só mostra as questões.

import { encontrarVaga } from "./vagasCatalogo";

export type ChaveTeste = "visao" | "matematica" | "fracionados" | "comparacao" | "hanamaru" | "nihongo";

export const ORDEM_TESTES: ChaveTeste[] = ["visao", "matematica", "fracionados", "comparacao", "hanamaru", "nihongo"];

export const vagaExigeTestesAptidao = (vagaId: string) => encontrarVaga(vagaId)?.testesAptidao === true;

/** Folga para atraso de rede entre o fim do cronômetro e a chegada no servidor. */
export const FOLGA_TEMPO_SEG = 30;

/** Tentativas do teste de visão — online, distância e tela erradas são comuns. */
export const TENTATIVAS_VISAO = 2;

export const INFO_TESTES: Record<
  ChaveTeste,
  { titulo: string; jp: string; limiteSeg: number | null; regra: string; eliminatorio: boolean; instrucoes: string[] }
> = {
  visao: {
    titulo: "Teste de visão",
    jp: "視力検査",
    limiteSeg: null,
    regra: "Ler até a linha 11 com cada olho (com ou sem óculos).",
    eliminatorio: true,
    instrucoes: [
      "Use óculos ou lentes se você usa no dia a dia.",
      "Primeiro calibramos o tamanho da sua tela com um cartão (crédito, débito ou documento de mesmo tamanho).",
      "Sente a 40 cm da tela — mais ou menos o comprimento de um antebraço com a mão fechada.",
      "Tampe um olho de cada vez e digite os caracteres que aparecem, linha por linha. Se não conseguir ler, toque em \"Não consigo ler\".",
    ],
  },
  matematica: {
    titulo: "Matemática",
    jp: "算数",
    limiteSeg: 60,
    regra: "Mínimo de 15 acertos, respondendo pelo menos até a questão 20, sem pular.",
    eliminatorio: true,
    instrucoes: [
      "60 contas simples em 1 minuto.",
      "Resolva na ordem, a partir da questão 1, sem pular — a próxima só aparece depois que você responde a atual.",
      "Digite o resultado e aperte Enter (ou o botão) para ir para a próxima.",
    ],
  },
  fracionados: {
    titulo: "Matemática com números decimais",
    jp: "小数計算",
    limiteSeg: 120,
    regra: "Mínimo de 9 acertos.",
    eliminatorio: true,
    instrucoes: [
      "18 contas com vírgula em 2 minutos.",
      "Pode resolver em qualquer ordem.",
      "Escreva o resultado com vírgula, ex.: 1,40.",
    ],
  },
  comparacao: {
    titulo: "Comparação",
    jp: "照合",
    limiteSeg: 120,
    regra: "Responder as 20 comparações, com no mínimo 18 acertos.",
    eliminatorio: true,
    instrucoes: [
      "Compare a sequência da esquerda com a da direita.",
      "Marque \"Igual\" se forem idênticas e \"Diferente\" se houver qualquer caractere diferente.",
      "São 20 pares em 2 minutos — é preciso responder todos.",
    ],
  },
  hanamaru: {
    titulo: "Hanamaru",
    jp: "はなまる",
    limiteSeg: 180,
    regra: "Mínimo de 25 pontos (cada letra certa vale +1; cada letra marcada errado desconta 1).",
    eliminatorio: true,
    instrucoes: [
      "Toque em todas as letras は (HA), な (NA), ま (MA) e る (RU) que encontrar.",
      "Faça um bloco por vez, na ordem: bloco 1, 2, 3 e 4.",
      "Cuidado com letras parecidas — marcar uma letra errada desconta ponto. Toque de novo para desmarcar.",
      "Tempo total: 3 minutos.",
    ],
  },
  nihongo: {
    titulo: "Japonês",
    jp: "日本語",
    limiteSeg: 300,
    regra: "Não elimina — corrigido pela nossa equipe. Se não souber, pode deixar em branco.",
    eliminatorio: false,
    instrucoes: [
      "Algumas perguntas de escrita em katakana e hiragana, em 5 minutos.",
      "Se não souber uma resposta, deixe em branco — este teste não elimina ninguém.",
    ],
  },
};

// ── Visão ───────────────────────────────────────────────────────────────
// Altura (mm) dos caracteres de cada uma das 13 linhas da folha original,
// medida na folha A4 (página 1 do PDF). O teste é feito a 40 cm. A linha 11
// (≈1,95 mm) é o mínimo exigido. A tela é calibrada pelo cartão padrão
// ISO/IEC 7810 ID-1 (85,6 mm de largura).
export const VISAO_ALTURAS_MM = [16, 12.5, 12.2, 9.7, 8.1, 4.9, 3.9, 3.3, 2.9, 2.4, 1.95, 1.5, 1.0];
export const VISAO_LINHA_MINIMA = 11;
export const LARGURA_CARTAO_MM = 85.6;
// Mesmos caracteres da folha: números para o olho esquerdo, letras para o
// direito.
export const VISAO_CARACTERES = { esquerdo: "1234789", direito: "CDEFHJLOTU" } as const;

export type ResultadoVisao = { oculos: "com" | "sem"; esquerdo: number; direito: number; pxPorMm: number };

// ── Matemática (60 contas, folha original, na mesma ordem) ──────────────
export const MATEMATICA: [number, "+" | "−" | "×" | "÷", number][] = [
  [8, "×", 5], [10, "÷", 5], [3, "+", 2], [12, "−", 9], [5, "−", 3], [2, "+", 5], [8, "÷", 2], [7, "+", 1], [1, "×", 3], [4, "×", 8],
  [6, "÷", 6], [4, "×", 2], [9, "÷", 9], [6, "×", 8], [8, "−", 5], [9, "+", 2], [8, "−", 2], [16, "÷", 4], [4, "+", 8], [5, "×", 2],
  [16, "−", 7], [7, "×", 8], [10, "×", 4], [3, "+", 8], [16, "−", 9], [9, "÷", 3], [6, "+", 6], [7, "−", 5], [1, "+", 3], [11, "−", 5],
  [9, "×", 3], [15, "÷", 3], [9, "+", 0], [9, "+", 8], [6, "×", 2], [12, "−", 5], [9, "×", 8], [2, "+", 6], [6, "÷", 2], [4, "−", 3],
  [8, "+", 1], [10, "−", 5], [7, "×", 2], [18, "÷", 2], [7, "−", 2], [5, "×", 7], [16, "−", 4], [7, "+", 4], [4, "−", 2], [20, "÷", 5],
  [15, "−", 5], [8, "×", 7], [4, "+", 5], [12, "÷", 4], [6, "×", 5], [13, "−", 2], [1, "×", 9], [7, "×", 4], [10, "+", 3], [6, "−", 3],
];
export const MATEMATICA_MIN_ACERTOS = 15;
export const MATEMATICA_MIN_RESPONDIDAS = 20;

function conta(a: number, op: string, b: number) {
  return op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : a / b;
}

// ── Matemática com decimais (18 contas da folha original) ───────────────
// Guardadas como texto, com vírgula, exatamente como na folha.
export const FRACIONADOS: [string, "+" | "−" | "×", string][] = [
  ["4,50", "−", "3,10"], ["3,00", "+", "1,20"], ["8,00", "+", "1,05"],
  ["3,25", "+", "8,13"], ["5,00", "−", "0,31"], ["7,50", "−", "0,05"],
  ["7,00", "+", "1,25"], ["7,82", "−", "2,50"], ["9", "×", "8"],
  ["1", "×", "3"], ["6,36", "−", "3,36"], ["7", "×", "5"],
  ["5,54", "+", "2,46"], ["8,00", "−", "5,45"], ["2,52", "+", "6,30"],
  ["4,23", "+", "8,10"], ["6", "×", "2"], ["37,00", "−", "12,00"],
];
export const FRACIONADOS_MIN_ACERTOS = 9;

/** "4,50" / "4.5" / "4" → centavos (450). Texto inválido → null. */
export function paraCentavos(texto: string): number | null {
  const t = String(texto ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}

function respostaFracionado([a, op, b]: [string, string, string]): number {
  const ca = paraCentavos(a)!;
  const cb = paraCentavos(b)!;
  return op === "+" ? ca + cb : op === "−" ? ca - cb : (ca * cb) / 100;
}

// ── Comparação (20 pares da folha original) ─────────────────────────────
export const COMPARACAO: [string, string][] = [
  ["XJOCO56781", "XJOCO56761"],
  ["ADTMN11874", "ADTNM11874"],
  ["XOCLL89462", "XOCLL89462"],
  ["1574XXBT2C", "1574XXBT2O"],
  ["LLO8656XJC", "LLO8656XJC"],
  ["QTOGC61616", "QTOGG61616"],
  ["KMNMC88881", "KMNMC88881"],
  ["CWOSK69696", "CWOSK96696"],
  ["TIM6487WN32", "T1M6487WN32"],
  ["L15435884H", "L15435864H"],
  ["DC12456870", "DC12456870"],
  ["LM59156342", "LM59165342"],
  ["LLLMILL358", "LLLMILL358"],
  ["FMFUKUI761", "FMFUKU1761"],
  ["NHKKYOUIKU", "NHKKYOUIKU"],
  ["FUJITV8881", "FUJIOV8881"],
  ["ASKULHAYAI", "ASKULHAYAI"],
  ["T258463585", "T258463685"],
  ["ABCDEFGHIJ", "ABCDEFOHIJ"],
  ["5837541111", "5837541111"],
];
export const COMPARACAO_MIN_ACERTOS = 18;

// ── Hanamaru ────────────────────────────────────────────────────────────
// A folha original tem 4 blocos de 15 × 10 letras e 83 letras-alvo. A
// versão web gera uma grade com o mesmo formato (semente fixa — todo
// candidato vê a mesma grade e o servidor recalcula o gabarito), com as
// mesmas letras parecidas como "pegadinha" (ほ, ろ, ぬ, ね…).
export const HANAMARU_ALVOS = ["は", "な", "ま", "る"];
const HANAMARU_DISTRATORES = "おかほぬうよふわちあやめゆむみろのつらをすねそ".split("");
export const HANAMARU_BLOCOS = 4;
export const HANAMARU_LINHAS = 15;
export const HANAMARU_COLUNAS = 10;
export const HANAMARU_TOTAL_ALVOS = 83;
export const HANAMARU_MIN_PONTOS = 25;
const POR_BLOCO = HANAMARU_LINHAS * HANAMARU_COLUNAS;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grade plana: índice = bloco * 150 + linha * 10 + coluna. */
export const HANAMARU_GRADE: string[] = (() => {
  const rnd = mulberry32(20240601);
  const grade: string[] = [];
  const alvosPorBloco = [21, 21, 21, 20];
  for (let b = 0; b < HANAMARU_BLOCOS; b++) {
    const posicoes = Array.from({ length: POR_BLOCO }, (_, i) => i);
    for (let i = posicoes.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [posicoes[i], posicoes[j]] = [posicoes[j], posicoes[i]];
    }
    const alvos = new Set(posicoes.slice(0, alvosPorBloco[b]));
    for (let i = 0; i < POR_BLOCO; i++) {
      grade.push(
        alvos.has(i)
          ? HANAMARU_ALVOS[Math.floor(rnd() * HANAMARU_ALVOS.length)]
          : HANAMARU_DISTRATORES[Math.floor(rnd() * HANAMARU_DISTRATORES.length)],
      );
    }
  }
  return grade;
})();

// ── Japonês (folha original, sem nomes de parceiras) ────────────────────
export const NIHONGO_PERGUNTAS: { id: string; grupo: string; enunciado: string; pontos: number }[] = [
  { id: "nome", grupo: "1 · Escreva seu nome em KATAKANA", enunciado: "Seu nome", pontos: 1 },
  ...["A", "MA", "SHI", "TSU", "SO", "YAMA", "ISU", "PEN", "AJISAI", "SAGYOU"].map((p, i) => ({
    id: `kata${i + 1}`,
    grupo: "2 · Escreva em KATAKANA",
    enunciado: p,
    pontos: 0.5,
  })),
  { id: "trad1", grupo: "3 · Traduza para o japonês (hiragana, katakana ou português)", enunciado: "BOM DIA", pontos: 1 },
  { id: "trad2", grupo: "3 · Traduza para o japonês (hiragana, katakana ou português)", enunciado: "JAPÃO", pontos: 1 },
  { id: "trad3", grupo: "3 · Traduza para o japonês (hiragana, katakana ou português)", enunciado: "AONDE VOCÊ MORA?", pontos: 3 },
  { id: "conv1", grupo: "4 · Reescreva: katakana → hiragana e hiragana → katakana", enunciado: "エイケイケイエムカブシキガイシャ サービスジギョウブ", pontos: 2 },
  { id: "conv2", grupo: "4 · Reescreva: katakana → hiragana e hiragana → katakana", enunciado: "あいしんきこうかぶしきがいしゃ", pontos: 2 },
];
export const NIHONGO_CONTAS: { id: string; a: number; op: "+" | "−"; b: number }[] = [
  { id: "conta1", a: 48, op: "+", b: 52 },
  { id: "conta2", a: 41, op: "−", b: 26 },
  { id: "conta3", a: 71, op: "+", b: 66 },
  { id: "conta4", a: 82, op: "−", b: 39 },
];

// ── Correção (servidor) ─────────────────────────────────────────────────
export type ResultadoTeste = {
  aprovado: boolean;
  nota: number;
  maximo: number;
  /** Uma linha legível para o CRM. */
  resumo: string;
  respostas: unknown;
};

const num = (v: unknown) => {
  const n = Number(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export function corrigirTeste(chave: ChaveTeste, bruto: unknown): ResultadoTeste {
  const r = (bruto ?? {}) as Record<string, unknown>;
  switch (chave) {
    case "visao": {
      const v = r as Partial<ResultadoVisao>;
      const esq = Math.max(0, Math.min(13, Math.round(Number(v.esquerdo) || 0)));
      const dir = Math.max(0, Math.min(13, Math.round(Number(v.direito) || 0)));
      const oculos = v.oculos === "com" ? "com" : "sem";
      const aprovado = esq >= VISAO_LINHA_MINIMA && dir >= VISAO_LINHA_MINIMA;
      return {
        aprovado,
        nota: Math.min(esq, dir),
        maximo: 13,
        resumo: `Olho esquerdo até a linha ${esq}, direito até a linha ${dir} (${oculos} óculos) — mínimo ${VISAO_LINHA_MINIMA}. Triagem online: confirmar presencialmente.`,
        respostas: { oculos, esquerdo: esq, direito: dir, pxPorMm: Number(v.pxPorMm) || null },
      };
    }
    case "matematica": {
      const lista = Array.isArray(r.respostas) ? (r.respostas as unknown[]).slice(0, MATEMATICA.length) : [];
      // Respondidas em sequência: conta até o primeiro vazio (não pode pular).
      let respondidas = 0;
      while (respondidas < lista.length && String(lista[respondidas] ?? "").trim() !== "") respondidas++;
      let acertos = 0;
      for (let i = 0; i < respondidas; i++) if (num(lista[i]) === conta(...MATEMATICA[i])) acertos++;
      const aprovado = acertos >= MATEMATICA_MIN_ACERTOS && respondidas >= MATEMATICA_MIN_RESPONDIDAS;
      return {
        aprovado,
        nota: acertos,
        maximo: MATEMATICA.length,
        resumo: `${acertos} acertos em ${respondidas} respondidas (mín. ${MATEMATICA_MIN_ACERTOS} acertos e até a questão ${MATEMATICA_MIN_RESPONDIDAS}).`,
        respostas: lista.slice(0, respondidas).map((x) => String(x ?? "").slice(0, 8)),
      };
    }
    case "fracionados": {
      const lista = Array.isArray(r.respostas) ? (r.respostas as unknown[]).slice(0, FRACIONADOS.length) : [];
      let acertos = 0;
      let respondidas = 0;
      FRACIONADOS.forEach((q, i) => {
        const t = String(lista[i] ?? "").trim();
        if (!t) return;
        respondidas++;
        if (paraCentavos(t) === respostaFracionado(q)) acertos++;
      });
      return {
        aprovado: acertos >= FRACIONADOS_MIN_ACERTOS,
        nota: acertos,
        maximo: FRACIONADOS.length,
        resumo: `${acertos} acertos em ${respondidas} respondidas (mín. ${FRACIONADOS_MIN_ACERTOS}).`,
        respostas: FRACIONADOS.map((_, i) => String(lista[i] ?? "").slice(0, 10)),
      };
    }
    case "comparacao": {
      const lista = Array.isArray(r.respostas) ? (r.respostas as unknown[]).slice(0, COMPARACAO.length) : [];
      let acertos = 0;
      let respondidas = 0;
      COMPARACAO.forEach(([a, b], i) => {
        const v = lista[i];
        if (v !== "igual" && v !== "diferente") return;
        respondidas++;
        if ((v === "igual") === (a === b)) acertos++;
      });
      const aprovado = respondidas === COMPARACAO.length && acertos >= COMPARACAO_MIN_ACERTOS;
      return {
        aprovado,
        nota: acertos,
        maximo: COMPARACAO.length,
        resumo: `${acertos} acertos, ${respondidas} de ${COMPARACAO.length} respondidas (mín. ${COMPARACAO_MIN_ACERTOS}, todas respondidas).`,
        respostas: COMPARACAO.map((_, i) => (lista[i] === "igual" || lista[i] === "diferente" ? lista[i] : "")),
      };
    }
    case "hanamaru": {
      const marcadas = Array.from(
        new Set((Array.isArray(r.marcadas) ? (r.marcadas as unknown[]) : []).map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < HANAMARU_GRADE.length)),
      );
      let certas = 0;
      let erradas = 0;
      for (const i of marcadas) {
        if (HANAMARU_ALVOS.includes(HANAMARU_GRADE[i])) certas++;
        else erradas++;
      }
      const pontos = certas - erradas;
      return {
        aprovado: pontos >= HANAMARU_MIN_PONTOS,
        nota: pontos,
        maximo: HANAMARU_TOTAL_ALVOS,
        resumo: `${certas} letras certas e ${erradas} erradas = ${pontos} pontos (mín. ${HANAMARU_MIN_PONTOS}).`,
        respostas: marcadas.sort((a, b) => a - b),
      };
    }
    case "nihongo": {
      const respostas: Record<string, string> = {};
      for (const p of NIHONGO_PERGUNTAS) respostas[p.id] = String(r[p.id] ?? "").slice(0, 200);
      let contas = 0;
      for (const c of NIHONGO_CONTAS) {
        respostas[c.id] = String(r[c.id] ?? "").slice(0, 10);
        if (num(r[c.id]) === conta(c.a, c.op, c.b)) contas++;
      }
      const preenchidas = NIHONGO_PERGUNTAS.filter((p) => respostas[p.id].trim()).length;
      return {
        aprovado: true,
        nota: contas,
        maximo: NIHONGO_CONTAS.length,
        resumo: `${preenchidas} de ${NIHONGO_PERGUNTAS.length} respostas escritas preenchidas (corrigir à mão, total da folha /15); contas: ${contas}/${NIHONGO_CONTAS.length}.`,
        respostas,
      };
    }
  }
}

// ── Estado gravado em candidaturas_vagas.testes_aptidao ─────────────────
export type ResultadoGravado = ResultadoTeste & { enviadoEm: string; duracaoSeg: number | null; foraDoTempo: boolean; tentativa: number };
export type EstadoTestes = {
  inicios: Partial<Record<ChaveTeste, string>>;
  resultados: Partial<Record<ChaveTeste, ResultadoGravado>>;
  tentativasVisao?: number;
  concluidoEm?: string;
};

export function lerEstadoTestes(v: unknown): EstadoTestes {
  const o = (v && typeof v === "object" ? v : {}) as Partial<EstadoTestes>;
  return { inicios: o.inicios ?? {}, resultados: o.resultados ?? {}, tentativasVisao: o.tentativasVisao ?? 0, concluidoEm: o.concluidoEm };
}

/** Próximo teste a fazer (null = todos feitos). Visão reprovada com tentativa sobrando volta para a visão. */
export function proximoTeste(e: EstadoTestes): ChaveTeste | null {
  for (const k of ORDEM_TESTES) {
    const r = e.resultados[k];
    if (!r) return k;
    if (k === "visao" && !r.aprovado && (e.tentativasVisao ?? 0) < TENTATIVAS_VISAO) return k;
  }
  return null;
}

/** true/false quando todos os testes foram feitos; null enquanto faltar algum. */
export function aprovadoNosTestes(e: EstadoTestes): boolean | null {
  if (proximoTeste(e) !== null) return null;
  return ORDEM_TESTES.every((k) => !INFO_TESTES[k].eliminatorio || (e.resultados[k]?.aprovado === true && !e.resultados[k]?.foraDoTempo));
}

/** Estado sem respostas nem gabarito — o que o navegador pode ver. */
export function estadoPublico(e: EstadoTestes) {
  return {
    inicios: e.inicios,
    feitos: ORDEM_TESTES.filter((k) => e.resultados[k]),
    visaoReprovada: e.resultados.visao ? !e.resultados.visao.aprovado : false,
    tentativasVisao: e.tentativasVisao ?? 0,
    proximo: proximoTeste(e),
    aprovado: aprovadoNosTestes(e),
  };
}
export type EstadoPublicoTestes = ReturnType<typeof estadoPublico>;

/** A ficha (etapa 2) só abre depois dos testes, para vagas que exigem — exceto se a equipe liberar no CRM. */
export function testesAptidaoPendentes(c: { vaga_id: string; testes_aptidao_aprovado?: boolean | null; ficha_liberada?: boolean | null }) {
  return vagaExigeTestesAptidao(c.vaga_id) && c.testes_aptidao_aprovado !== true && !c.ficha_liberada;
}

export const urlTestes = (id: string, token: string) => `/empregos/testes/${id}?t=${token}`;

/** Link da etapa seguinte ao match: testes (vagas que exigem) ou ficha. */
export const urlAposMatch = (vagaId: string, id: string, token: string) =>
  vagaExigeTestesAptidao(vagaId) ? urlTestes(id, token) : `/empregos/ficha/${id}?t=${token}`;

/** Para o cliente: questões de matemática como texto. */
export const textoConta = ([a, op, b]: [number | string, string, number | string]) => `${a} ${op} ${b}`;
