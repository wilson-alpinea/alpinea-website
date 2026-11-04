// Tabela de comissões por serviço vendido, em ienes (Wilson, 04/nov/2026 —
// planilha "Comissão atualizada"). Módulo puro: usado pelo CRM e pela
// Calculadora Reversa (pré-preenchimento das quantidades).
//
// Regras:
// - Serviços vendidos separados: comissão = valor do item × quantidade.
// - Pacote personalizado (vários serviços): soma das comissões de cada item.
//   (Pacote fechado da prateleira terá valor próprio — ainda não existe.)
// - Valor por item: exceção do parceiro/consultor > tabela do CRM > padrão
//   deste arquivo. A tabela é editável em /crm/comissoes (só admin).
// - Receita em real: câmbio comercial (PTAX) do dia, conferido na revisão.
// - Quantidades sempre revisadas e aprovadas à mão no cliente.

export type GrupoComissao = "roteiro" | "aereo" | "hotel" | "servicos" | "seguro" | "esim";

export type ItemComissao = {
  id: string;
  grupo: GrupoComissao;
  label: string;
  /** Unidade da quantidade (aparece ao lado do campo). */
  unidade: string;
  padraoJPY: number;
  /** "bloco": a quantidade é um valor em ienes e a comissão vale por bloco inteiro. */
  bloco?: number;
};

export const GRUPOS_COMISSAO: { id: GrupoComissao; label: string }[] = [
  { id: "roteiro", label: "Roteiro" },
  { id: "aereo", label: "Passagem aérea" },
  { id: "hotel", label: "Hospedagem" },
  { id: "servicos", label: "Serviços no Japão" },
  { id: "seguro", label: "Seguro viagem" },
  { id: "esim", label: "eSIM" },
];

export const ITENS_COMISSAO: ItemComissao[] = [
  { id: "roteiro", grupo: "roteiro", label: "Roteiro personalizado", unidade: "família", padraoJPY: 10000 },
  { id: "aereo_economy", grupo: "aereo", label: "Passagem economy ida/volta", unidade: "pax", padraoJPY: 5000 },
  { id: "aereo_premium", grupo: "aereo", label: "Passagem premium economy ida/volta", unidade: "pax", padraoJPY: 7500 },
  { id: "aereo_business", grupo: "aereo", label: "Passagem business ida/volta", unidade: "pax", padraoJPY: 15000 },
  { id: "hotel_3", grupo: "hotel", label: "Hospedagem 3 estrelas", unidade: "diária × quarto", padraoJPY: 500 },
  { id: "hotel_4", grupo: "hotel", label: "Hospedagem 4 estrelas", unidade: "diária × quarto", padraoJPY: 700 },
  { id: "hotel_5", grupo: "hotel", label: "Hospedagem 5 estrelas", unidade: "diária × quarto", padraoJPY: 1000 },
  { id: "guia", grupo: "servicos", label: "Guia turístico", unidade: "diária", padraoJPY: 2000 },
  { id: "transfer", grupo: "servicos", label: "Transfer aeroporto", unidade: "trecho", padraoJPY: 500 },
  { id: "transporte_curto", grupo: "servicos", label: "Transporte executivo (trecho curto)", unidade: "trecho", padraoJPY: 500 },
  { id: "transporte_longo", grupo: "servicos", label: "Transporte executivo (diária longa)", unidade: "diária", padraoJPY: 1250 },
  { id: "jrpass", grupo: "servicos", label: "JR Pass", unidade: "passe", padraoJPY: 2000 },
  { id: "cambio", grupo: "servicos", label: "Câmbio (a cada ¥100.000)", unidade: "¥ trocados", padraoJPY: 2000, bloco: 100000 },
  { id: "seguro_10", grupo: "seguro", label: "Seguro viagem até 10 dias", unidade: "pax", padraoJPY: 3000 },
  { id: "seguro_20", grupo: "seguro", label: "Seguro viagem 11 a 20 dias", unidade: "pax", padraoJPY: 5000 },
  { id: "seguro_30", grupo: "seguro", label: "Seguro viagem 21 a 30 dias", unidade: "pax", padraoJPY: 7000 },
  { id: "seguro_45", grupo: "seguro", label: "Seguro viagem 31 a 45 dias", unidade: "pax", padraoJPY: 10000 },
  { id: "seguro_60", grupo: "seguro", label: "Seguro viagem 46 a 60 dias", unidade: "pax", padraoJPY: 12500 },
  { id: "seguro_90", grupo: "seguro", label: "Seguro viagem 61 a 90 dias", unidade: "pax", padraoJPY: 15000 },
  { id: "esim_15", grupo: "esim", label: "eSIM 7 a 15 dias", unidade: "pax", padraoJPY: 1250 },
  { id: "esim_30", grupo: "esim", label: "eSIM 16 a 30 dias", unidade: "pax", padraoJPY: 1800 },
  { id: "esim_60", grupo: "esim", label: "eSIM 31 a 60 dias", unidade: "pax", padraoJPY: 2500 },
  { id: "esim_90", grupo: "esim", label: "eSIM 61 a 90 dias", unidade: "pax", padraoJPY: 3500 },
];

export const ITEM_COMISSAO = new Map(ITENS_COMISSAO.map((i) => [i.id, i]));
export const isItemComissao = (id: string) => ITEM_COMISSAO.has(id);

/** Faixa do seguro pelos dias de viagem (acima de 90 → null: sob consulta). */
export function itemSeguroPorDias(dias: number): string | null {
  if (dias <= 10) return "seguro_10";
  if (dias <= 20) return "seguro_20";
  if (dias <= 30) return "seguro_30";
  if (dias <= 45) return "seguro_45";
  if (dias <= 60) return "seguro_60";
  if (dias <= 90) return "seguro_90";
  return null;
}
/** Faixa do eSIM (abaixo de 7 dias usa a primeira faixa). */
export function itemEsimPorDias(dias: number): string | null {
  if (dias <= 15) return "esim_15";
  if (dias <= 30) return "esim_30";
  if (dias <= 60) return "esim_60";
  if (dias <= 90) return "esim_90";
  return null;
}
export function itemAereoPorClasse(classe: string): string {
  if (/premium/i.test(classe)) return "aereo_premium";
  if (/business|first/i.test(classe)) return "aereo_business";
  return "aereo_economy";
}
export function itemHotelPorCategoria(categoria: string): string {
  if (/^4/.test(categoria)) return "hotel_4";
  if (/^5|elite/i.test(categoria)) return "hotel_5";
  return "hotel_3";
}

export type Quantidades = Record<string, number>;
export type ValoresJPY = Record<string, number>;

/** Lê { item: quantidade } do banco, só itens conhecidos e quantidades > 0. */
export function lerQuantidades(v: unknown): Quantidades {
  const o = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const out: Quantidades = {};
  for (const [k, x] of Object.entries(o)) {
    const n = Number(x);
    if (isItemComissao(k) && Number.isFinite(n) && n > 0) out[k] = Math.round(n * 100) / 100;
  }
  return out;
}
/** Lê { item: valor ¥ } (tabela ou exceção), só itens conhecidos e valores >= 0. */
export function lerValores(v: unknown): ValoresJPY {
  const o = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const out: ValoresJPY = {};
  for (const [k, x] of Object.entries(o)) {
    const n = Number(x);
    if (isItemComissao(k) && x !== null && x !== "" && Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
}

/** Tabela padrão em vigor: código + alterações salvas no CRM. */
export function tabelaPadrao(alteracoes: ValoresJPY = {}): ValoresJPY {
  return Object.fromEntries(ITENS_COMISSAO.map((i) => [i.id, alteracoes[i.id] ?? i.padraoJPY]));
}

/** Unidades que geram comissão (para "bloco", blocos inteiros). */
export function unidadesComissao(itemId: string, quantidade: number): number {
  const item = ITEM_COMISSAO.get(itemId);
  if (!item || !(quantidade > 0)) return 0;
  return item.bloco ? Math.floor(quantidade / item.bloco) : quantidade;
}

export type LinhaComissao = { item: string; label: string; quantidade: number; unidades: number; valorJPY: number; totalJPY: number; excecao: boolean };

/** Comissão de uma venda para um beneficiário. */
export function calcularComissaoVenda(quantidades: Quantidades, padrao: ValoresJPY, excecoes: ValoresJPY = {}) {
  const linhas: LinhaComissao[] = [];
  for (const item of ITENS_COMISSAO) {
    const q = quantidades[item.id];
    if (!(q > 0)) continue;
    const excecao = excecoes[item.id] !== undefined;
    const valorJPY = excecao ? excecoes[item.id] : (padrao[item.id] ?? item.padraoJPY);
    const unidades = unidadesComissao(item.id, q);
    linhas.push({ item: item.id, label: item.label, quantidade: q, unidades, valorJPY, totalJPY: Math.round(valorJPY * unidades), excecao });
  }
  return { linhas, totalJPY: linhas.reduce((s, l) => s + l.totalJPY, 0) };
}

export const formatarIene = (v: number) => `¥ ${Math.round(v).toLocaleString("pt-BR")}`;

// ── Pré-preenchimento pela Calculadora Reversa ──────────────────────
export type ResumoCalculadora = {
  chaves: string[]; // chaves dos itens selecionados (chaveDoItem)
  pessoas: number;
  dias: number;
  quartos: number;
  classeAereo: string;
  categoriaHotel: string;
  guiaDias: number;
  jrPassPessoas: number;
  esimPessoas: number;
  trechosMotorista: number;
  ienesCambio: number;
};

export function quantidadesDaCalculadora(r: ResumoCalculadora): Quantidades {
  const q: Quantidades = {};
  const tem = (k: string) => r.chaves.includes(k);
  const somar = (id: string | null, n: number) => {
    if (id && n > 0) q[id] = (q[id] ?? 0) + n;
  };
  if (tem("roteiro")) somar("roteiro", 1);
  if (tem("aereo")) somar(itemAereoPorClasse(r.classeAereo), r.pessoas);
  if (tem("hotel")) somar(itemHotelPorCategoria(r.categoriaHotel), r.dias * Math.max(1, r.quartos));
  if (tem("seguro")) somar(itemSeguroPorDias(r.dias), r.pessoas);
  if (tem("guia")) somar("guia", r.guiaDias);
  if (tem("jrpass")) somar("jrpass", r.jrPassPessoas);
  if (tem("wifi")) somar(itemEsimPorDias(r.dias), r.esimPessoas);
  if (tem("motorista")) somar("transporte_curto", r.trechosMotorista);
  if (tem("servico-cambioBrasil")) somar("cambio", r.ienesCambio);
  return lerQuantidades(q);
}
