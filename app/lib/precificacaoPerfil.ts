// Motor de precificação por Perfil do Viajante (ritmo do roteiro).
//
// Princípios:
//  - O perfil NÃO aplica um percentual sobre o preço total. Ele só ajusta as
//    categorias de custo que realmente variam com o ritmo (ingressos,
//    transporte urbano, experiências/reservas e complexidade operacional) e
//    o fee de planejamento. Aéreo, hospedagem, seguro, transporte
//    intermunicipal e demais custos fixos NÃO mudam.
//  - Hierarquia por categoria: (1) preço/custo real conhecido do item →
//    (2) estimativa específica da categoria → (3) custo médio por dia ativo
//    da config × fator do perfil. O multiplicador genérico
//    (travel_pace_index) só entra como fallback (`outrosVariaveisBase`).
//  - Margem por divisão (custo / (1 - margem)), nunca custo × 1,20.
//  - Todos os números (fatores, custos-base, margem, fee) vivem em
//    CONFIG_PRECIFICACAO_PERFIL_PADRAO e podem ser sobrescritos via
//    criarConfigPrecificacao(overrides) — nada hardcoded nas fórmulas.
//
// Ordem de cálculo:
//   custo_estimado = custos_fixos + Σ categorias ajustadas (+ outros × índice)
//   custo c/ contingência = custo_estimado × (1 + contingência)
//   preço c/ margem = custo / (1 − margem) ; × impostoFator
//   + fee de planejamento (receita própria, fora da base da margem)
//   × (1 + taxa de serviço) → arredondamento comercial.

import type { PerfilViajanteKey } from "./calculadoraCatalogoPublico";

export type PerfilPrecificacao = PerfilViajanteKey;

export type CategoriaRitmo =
  | "ingressos"
  | "transporteUrbano"
  | "experienciasReservas"
  | "complexidadeOperacional";

export const CATEGORIAS_RITMO: CategoriaRitmo[] = [
  "ingressos",
  "transporteUrbano",
  "experienciasReservas",
  "complexidadeOperacional",
];

type PorPerfil = Record<PerfilPrecificacao, number>;

export type ConfigPrecificacaoPerfil = {
  /** travel_pace_index — intensidade do ritmo (fallback genérico e chave p/ combinações futuras). */
  travelPaceIndex: PorPerfil;
  /** Atrações principais por dia ativo, usado como variável de intensidade. */
  atracoesPorDiaAtivo: PorPerfil;
  /** Multiplicador POR CATEGORIA (Equilibrado = 1.00 = baseline). */
  fatoresCategoria: Record<CategoriaRitmo, PorPerfil>;
  /** Custo médio (sem margem/imposto) por dia ativo, no nível Equilibrado — PROVISÓRIOS até haver dados reais. */
  custoBasePorDiaAtivo: Record<CategoriaRitmo, { valor: number; escala: "porPessoa" | "porGrupo" }>;
  /** 'total': soma o custo da categoria inteira (fórmula original). 'delta': soma só base × (fator − 1), mantendo o Equilibrado igual ao preço atual. */
  modoAplicacao: "total" | "delta";
  /** Fee de planejamento: base × complexidade_cidades × complexidade_ritmo. */
  planejamento: {
    fatorPorPerfil: PorPerfil;
    /** +X por cidade além da primeira (0 = neutro). */
    complexidadePorCidadeAdicional: number;
  };
  /** Peso de cada tipo de dia no cálculo de dias_ativos. */
  pesosDia: {
    completo: number;
    meioDia: number;
    chegadaLeve: number;
    saidaCedo: number;
    soAeroporto: number;
  };
  /** Como classificar os dias quando só se conhece a quantidade total. */
  diasAutomaticos: { chegada: keyof ConfigPrecificacaoPerfil["pesosDia"]; saida: keyof ConfigPrecificacaoPerfil["pesosDia"] };
  comercial: {
    /** Margem sobre o preço de venda: preço = custo / (1 − margem). */
    margemPercentual: number;
    /** Fator multiplicativo de imposto aplicado depois da margem. */
    impostoFator: number;
    contingenciaPercentual: number;
    taxaServicoPercentual: number;
    /** Arredondamento comercial do preço final (múltiplo; 1 = inteiro). */
    arredondarPara: number;
  };
};

export const CONFIG_PRECIFICACAO_PERFIL_PADRAO: ConfigPrecificacaoPerfil = {
  travelPaceIndex: { cadenciado: 0.7, equilibrado: 1.0, acelerado: 1.4 },
  atracoesPorDiaAtivo: { cadenciado: 1, equilibrado: 2, acelerado: 3.5 },
  fatoresCategoria: {
    ingressos: { cadenciado: 0.65, equilibrado: 1.0, acelerado: 1.5 },
    transporteUrbano: { cadenciado: 0.8, equilibrado: 1.0, acelerado: 1.3 },
    experienciasReservas: { cadenciado: 0.7, equilibrado: 1.0, acelerado: 1.45 },
    complexidadeOperacional: { cadenciado: 0.8, equilibrado: 1.0, acelerado: 1.35 },
  },
  // PLACEHOLDERS (USD, custo sem margem/imposto, por dia ativo). Substituir
  // por médias reais de viagens já operadas.
  custoBasePorDiaAtivo: {
    ingressos: { valor: 8, escala: "porPessoa" },
    transporteUrbano: { valor: 6, escala: "porPessoa" },
    experienciasReservas: { valor: 8, escala: "porPessoa" },
    complexidadeOperacional: { valor: 15, escala: "porGrupo" },
  },
  modoAplicacao: "total",
  planejamento: {
    fatorPorPerfil: { cadenciado: 0.9, equilibrado: 1.0, acelerado: 1.2 },
    complexidadePorCidadeAdicional: 0,
  },
  pesosDia: { completo: 1, meioDia: 0.5, chegadaLeve: 0.5, saidaCedo: 0.25, soAeroporto: 0 },
  diasAutomaticos: { chegada: "chegadaLeve", saida: "meioDia" },
  comercial: {
    // Calibrado para reproduzir o markup atual do sistema (custo × 1,15 ×
    // 1,30 = comMargemEImposto): 1/(1 − margem) = 1,30 → margem ≈ 23,08%.
    margemPercentual: 1 - 1 / 1.3,
    impostoFator: 1.15,
    contingenciaPercentual: 0,
    taxaServicoPercentual: 0,
    arredondarPara: 1,
  },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Config padrão + overrides (merge profundo). Use para ajustar multiplicadores sem tocar nas fórmulas. */
export function criarConfigPrecificacao(
  overrides?: DeepPartial<ConfigPrecificacaoPerfil>,
): ConfigPrecificacaoPerfil {
  const merge = (base: unknown, extra: unknown): unknown => {
    if (extra === undefined || extra === null) return base;
    if (typeof base !== "object" || base === null || Array.isArray(base)) return extra;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(extra as object)) {
      out[k] = merge((base as Record<string, unknown>)[k], (extra as Record<string, unknown>)[k]);
    }
    return out;
  };
  return merge(CONFIG_PRECIFICACAO_PERFIL_PADRAO, overrides) as ConfigPrecificacaoPerfil;
}

export type TipoDia = keyof ConfigPrecificacaoPerfil["pesosDia"];

/**
 * dias_ativos: soma ponderada dos dias disponíveis para turismo.
 * Aceita a lista de tipos de dia (roteiro detalhado) ou só a quantidade de
 * dias (primeiro dia = chegada, último = saída, conforme config).
 */
export function calcularDiasAtivos(
  dias: number | TipoDia[],
  config: ConfigPrecificacaoPerfil = CONFIG_PRECIFICACAO_PERFIL_PADRAO,
  opts?: { diasOcupadosPorParques?: number },
): number {
  const p = config.pesosDia;
  let total: number;
  if (Array.isArray(dias)) {
    total = dias.reduce((s, t) => s + p[t], 0);
  } else {
    const n = Math.max(0, Math.floor(dias));
    if (n === 0) total = 0;
    else if (n === 1) total = p.meioDia;
    else total = p[config.diasAutomaticos.chegada] + p[config.diasAutomaticos.saida] + (n - 2) * p.completo;
  }
  // Dia inteiro em parque não consome ingressos/deslocamentos "gerais" do ritmo.
  const parques = Math.max(0, opts?.diasOcupadosPorParques ?? 0);
  return Math.max(0, total - parques * config.pesosDia.completo);
}

export type EntradaPrecificacao = {
  perfil: PerfilPrecificacao;
  pessoas: number;
  diasAtivos: number;
  cidadesQtd?: number;
  /** Custos fixos (aéreo, hospedagem, seguro, taxas fixas, transporte intermunicipal…), já em custo. */
  custosFixos: { total?: number; itens?: Record<string, number> };
  /** Hierarquia 1 — custo real conhecido por categoria (substitui a estimativa; sem fator do perfil). */
  itensReais?: Partial<Record<CategoriaRitmo, number>>;
  /** Hierarquia 2 — estimativa específica da categoria no nível Equilibrado (recebe o fator da categoria). */
  estimativasCategoria?: Partial<Record<CategoriaRitmo, number>>;
  /** Hierarquia 3 — variáveis sem categoria: multiplicador genérico (travel_pace_index). */
  outrosVariaveisBase?: number;
  /** Modificadores futuros (cidades, trocas de hotel, hotel, crianças…) multiplicados no fallback genérico. */
  contexto?: Record<string, number>;
  /** Fee base de planejamento, JÁ em preço final (fora da base da margem). */
  feePlanejamentoBase?: number;
};

export type OrigemCusto = "real" | "estimativa_categoria" | "custo_medio_dia" | "nenhum";

export type ResultadoPrecificacao = {
  perfil: PerfilPrecificacao;
  travel_pace_index: number;
  atracoes_estimadas: number;
  dias_ativos: number;
  /** Saída detalhada para debug/admin. */
  admin: {
    custos_fixos: number;
    custos_variaveis_base: Record<CategoriaRitmo, { valor: number; origem: OrigemCusto }> & { outros: number };
    fatores_aplicados: Record<CategoriaRitmo, number> & { outros: number; fee_planejamento: number };
    custos_variaveis_ajustados: Record<CategoriaRitmo, number> & { outros: number };
    custo_estimado: number;
    contingencia: number;
    margem: number;
    impostos: number;
    fee_planejamento: number;
    taxa_servico: number;
    preco_final: number;
  };
};

const arred = (v: number, passo: number) => (passo > 0 ? Math.round(v / passo) * passo : v);

/** Preço de venda de um custo isolado: custo / (1 − margem) × imposto. */
export function precoDeVenda(custo: number, config: ConfigPrecificacaoPerfil): number {
  const { margemPercentual, impostoFator } = config.comercial;
  return (custo / (1 - margemPercentual)) * impostoFator;
}

export function calcularPrecoPorPerfil(
  entrada: EntradaPrecificacao,
  config: ConfigPrecificacaoPerfil = CONFIG_PRECIFICACAO_PERFIL_PADRAO,
): ResultadoPrecificacao {
  const { perfil, pessoas, diasAtivos } = entrada;
  const paceIndex = config.travelPaceIndex[perfil];
  const c = config.comercial;
  if (c.margemPercentual >= 1) throw new Error("margemPercentual deve ser < 1");

  const custosFixos =
    entrada.custosFixos.total ??
    Object.values(entrada.custosFixos.itens ?? {}).reduce((s, v) => s + v, 0);

  const base = {} as ResultadoPrecificacao["admin"]["custos_variaveis_base"];
  const fatores = {} as ResultadoPrecificacao["admin"]["fatores_aplicados"];
  const ajustados = {} as ResultadoPrecificacao["admin"]["custos_variaveis_ajustados"];

  for (const cat of CATEGORIAS_RITMO) {
    const fator = config.fatoresCategoria[cat][perfil];
    const real = entrada.itensReais?.[cat];
    const espec = entrada.estimativasCategoria?.[cat];
    if (real !== undefined) {
      // 1) preço real do item: soma direta, sem multiplicador
      base[cat] = { valor: real, origem: "real" };
      fatores[cat] = 1;
      ajustados[cat] = real;
      continue;
    }
    let valorBase: number;
    let origem: OrigemCusto;
    if (espec !== undefined) {
      valorBase = espec;
      origem = "estimativa_categoria";
    } else {
      const cfg = config.custoBasePorDiaAtivo[cat];
      // custo_variavel_base = custo_medio_por_dia × dias_ativos (× pessoas quando por pessoa)
      valorBase = cfg.valor * diasAtivos * (cfg.escala === "porPessoa" ? pessoas : 1);
      origem = valorBase > 0 ? "custo_medio_dia" : "nenhum";
    }
    base[cat] = { valor: valorBase, origem };
    fatores[cat] = fator;
    ajustados[cat] =
      config.modoAplicacao === "delta" ? valorBase * (fator - 1) : valorBase * fator;
  }

  // 3) fallback genérico
  const ctx = Object.values(entrada.contexto ?? {}).reduce((m, v) => m * v, 1);
  const outrosBase = entrada.outrosVariaveisBase ?? 0;
  const fatorOutros = paceIndex * ctx;
  base.outros = outrosBase;
  fatores.outros = fatorOutros;
  ajustados.outros =
    config.modoAplicacao === "delta" ? outrosBase * (fatorOutros - 1) : outrosBase * fatorOutros;

  const variaveisAjustados = CATEGORIAS_RITMO.reduce((s, k) => s + ajustados[k], 0) + ajustados.outros;
  const custoEstimado = custosFixos + variaveisAjustados;

  // contingência → margem por divisão → imposto
  const contingencia = custoEstimado * c.contingenciaPercentual;
  const custoComContingencia = custoEstimado + contingencia;
  const precoComMargem = custoComContingencia / (1 - c.margemPercentual);
  const margem = precoComMargem - custoComContingencia;
  const precoComImposto = precoComMargem * c.impostoFator;
  const impostos = precoComImposto - precoComMargem;

  // fee de planejamento (receita própria, separada dos custos)
  const complexCidades = 1 + Math.max(0, (entrada.cidadesQtd ?? 1) - 1) * config.planejamento.complexidadePorCidadeAdicional;
  const fatorFee = config.planejamento.fatorPorPerfil[perfil] * complexCidades;
  const fee = (entrada.feePlanejamentoBase ?? 0) * fatorFee;
  fatores.fee_planejamento = fatorFee;

  const subtotal = precoComImposto + fee;
  const taxaServico = subtotal * c.taxaServicoPercentual;
  const precoFinal = arred(subtotal + taxaServico, c.arredondarPara);

  return {
    perfil,
    travel_pace_index: paceIndex,
    atracoes_estimadas: config.atracoesPorDiaAtivo[perfil] * diasAtivos,
    dias_ativos: diasAtivos,
    admin: {
      custos_fixos: custosFixos,
      custos_variaveis_base: base,
      fatores_aplicados: fatores,
      custos_variaveis_ajustados: ajustados,
      custo_estimado: custoEstimado,
      contingencia,
      margem,
      impostos,
      fee_planejamento: fee,
      taxa_servico: taxaServico,
      preco_final: precoFinal,
    },
  };
}

/** Texto amigável para o cliente final — nunca expõe multiplicadores internos. */
export const EXPLICACAO_CLIENTE_PERFIL: Record<PerfilPrecificacao, string> = {
  cadenciado: "Menor quantidade de experiências e deslocamentos por dia.",
  equilibrado: "Equilíbrio entre experiências, deslocamentos e tempo livre.",
  acelerado: "Maior número de experiências, reservas e deslocamentos ao longo da viagem.",
};

export type LinhaRitmo = { chave: string; label: string; precoBRL: number };

/**
 * Componentes de preço (já em preço final, BRL) que dependem do perfil, para
 * somar às calculadoras. Os itens já precificados individualmente na
 * calculadora (ingressos de parques, guia, motorista, JR Pass etc.) NÃO
 * passam por aqui — mantêm o preço real. Aqui entram só as categorias
 * gerais estimadas (ingressos avulsos, transporte urbano, experiências e
 * reservas, complexidade operacional).
 */
export function calcularComponentesRitmo(p: {
  perfil: PerfilPrecificacao;
  dias: number;
  pessoas: number;
  cidadesQtd: number;
  parquesDiaInteiro: number;
  cotacaoUSD: number;
  config?: ConfigPrecificacaoPerfil;
}): { linhas: LinhaRitmo[]; total: number; resultado: ResultadoPrecificacao } {
  const config = p.config ?? CONFIG_PRECIFICACAO_PERFIL_PADRAO;
  const diasAtivos = calcularDiasAtivos(p.dias, config, { diasOcupadosPorParques: p.parquesDiaInteiro });
  const resultado = calcularPrecoPorPerfil(
    {
      perfil: p.perfil,
      pessoas: p.pessoas,
      diasAtivos,
      cidadesQtd: p.cidadesQtd,
      custosFixos: { total: 0 },
    },
    { ...config, comercial: { ...config.comercial, arredondarPara: 0 } },
  );
  const a = resultado.admin;
  // Preço final por categoria = custo ajustado / (1 − margem) × imposto (mesma conta do motor).
  const paraBRL = (custoUSD: number) => Math.round(precoDeVenda(custoUSD, config) * p.cotacaoUSD);
  const cat = a.custos_variaveis_ajustados;
  const linhaIngressosEReservas = paraBRL(cat.ingressos + cat.experienciasReservas);
  const linhaTransporte = paraBRL(cat.transporteUrbano);
  const linhaOperacional = paraBRL(cat.complexidadeOperacional);
  const linhas: LinhaRitmo[] = [
    { chave: "ritmo-ingressos-reservas", label: "Ingressos, experiências e reservas do dia a dia", precoBRL: linhaIngressosEReservas },
    { chave: "ritmo-transporte", label: "Transporte urbano do roteiro", precoBRL: linhaTransporte },
    { chave: "ritmo-operacional", label: "Coordenação e logística do roteiro", precoBRL: linhaOperacional },
  ].filter((l) => l.precoBRL !== 0);
  return { linhas, total: linhas.reduce((s, l) => s + l.precoBRL, 0), resultado };
}

/** Fee de planejamento (preço final) para o perfil: base × complexidade das cidades × complexidade do ritmo. */
export function calcularFeePlanejamento(
  base: number,
  perfil: PerfilPrecificacao,
  cidadesQtd: number,
  config: ConfigPrecificacaoPerfil = CONFIG_PRECIFICACAO_PERFIL_PADRAO,
): number {
  const complexCidades = 1 + Math.max(0, cidadesQtd - 1) * config.planejamento.complexidadePorCidadeAdicional;
  return Math.round(base * complexCidades * config.planejamento.fatorPorPerfil[perfil]);
}
