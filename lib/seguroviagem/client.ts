// lib/seguroviagem/client.ts
//
// Cliente da API de Agências da Real Seguro Viagem (app.seguroviagem.srv.br)
// — Wilson, 26/out/2026: "vamos integrar agora um novo parceiro de seguro
// viagem [...] para o cliente final iremos usar agora o fornecedor". As
// seguradoras antigas (Affinity/GTA/MTA com preço próprio) ficam só na
// Calculadora Reversa.
//
// Fluxo da API (OpenAPI enviado pelo Wilson no mesmo dia):
// 1. POST /api/agencias/cotacoes.json → { public_id, produtos[] }
// 2. POST /api/agencias/cotacoes/{public_id}/checkout.json com o `apelido`
//    do produto, a margem e modo "comissionado" → { url } do pagamento.
//    No modo comissionado o CLIENTE paga o preço final (custo + nossa
//    margem) direto no link do fornecedor — a Ajisai não paga nada antes.
//
// Configuração (Vercel, nunca no código):
// - SEGUROVIAGEM_API_KEY: "Chave API Token" do painel da agência.
// - SEGUROVIAGEM_API_URL (opcional): padrão https://app.seguroviagem.srv.br
// Só roda no servidor.

export type PropriedadeProduto = {
  codigo: string;
  grupo: string;
  nome: string;
  modificador: string; // "BOOL" | "USD" | "EUR" ...
  valor: string;
  valor_h: string; // valor legível ("US$ 15.000", "sim", "não")
};

export type ProdutoSeguro = {
  public_id: string;
  apelido: string;
  nome_plano: string;
  tipo_de_seguro: string;
  seguradora_nome: string;
  assistencia_nome: string | null;
  assistencia_logo: string | null;
  seguradora_logo: string | null;
  seguradora_contrato: string | null;
  descricao_produto_limpa: string | null;
  idade_minima: number;
  idade_maxima: number;
  em_viagem: boolean;
  autorizacao: boolean;
  // Preço de balcão (tabela pública) e custo da agência, em reais.
  preco_em_reais: number;
  preco_em_reais_agencia: number;
  preco_em_pix_agencia: number;
  preco_em_cartao_agencia: number;
  maximo_parcelas_permitidas: number | null;
  propriedades: PropriedadeProduto[];
};

export class ErroSeguroViagem extends Error {
  status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

export function seguroViagemConfigurado(): boolean {
  return Boolean(process.env.SEGUROVIAGEM_API_KEY);
}

async function chamar<T>(caminho: string, body: unknown): Promise<T> {
  const base = (process.env.SEGUROVIAGEM_API_URL || "https://app.seguroviagem.srv.br").replace(/\/+$/, "");
  const chave = (process.env.SEGUROVIAGEM_API_KEY || "").trim();
  if (!chave) throw new ErroSeguroViagem("SEGUROVIAGEM_API_KEY não configurada.", 0);
  const resposta = await fetch(`${base}${caminho}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const texto = await resposta.text().catch(() => "");
  let dados: unknown = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = null;
  }
  if (!resposta.ok) {
    const erro = (dados as { error?: unknown } | null)?.error;
    throw new ErroSeguroViagem(String(erro ?? (texto.slice(0, 300) || `HTTP ${resposta.status}`)), resposta.status);
  }
  return dados as T;
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function normalizarProduto(p: Record<string, unknown>): ProdutoSeguro {
  const props = Array.isArray(p.propriedades) ? (p.propriedades as Record<string, unknown>[]) : [];
  const custo = num(p.preco_em_reais_agencia);
  return {
    public_id: String(p.public_id ?? ""),
    apelido: String(p.apelido ?? ""),
    nome_plano: String(p.nome_plano ?? "").trim(),
    tipo_de_seguro: String(p.tipo_de_seguro ?? ""),
    seguradora_nome: String(p.seguradora_nome ?? "").trim(),
    assistencia_nome: p.assistencia_nome ? String(p.assistencia_nome).trim() : null,
    assistencia_logo: p.assistencia_logo ? String(p.assistencia_logo) : null,
    seguradora_logo: p.seguradora_logo ? String(p.seguradora_logo) : null,
    seguradora_contrato: p.seguradora_contrato ? String(p.seguradora_contrato) : null,
    descricao_produto_limpa: p.descricao_produto_limpa ? String(p.descricao_produto_limpa) : null,
    idade_minima: num(p.idade_minima),
    idade_maxima: num(p.idade_maxima) || 120,
    em_viagem: p.em_viagem === true,
    autorizacao: p.autorizacao === true,
    preco_em_reais: num(p.preco_em_reais),
    preco_em_reais_agencia: custo,
    preco_em_pix_agencia: num(p.preco_em_pix_agencia) || custo,
    preco_em_cartao_agencia: num(p.preco_em_cartao_agencia) || custo,
    maximo_parcelas_permitidas: p.maximo_parcelas_permitidas != null ? num(p.maximo_parcelas_permitidas) : null,
    propriedades: props.map((q) => ({
      codigo: String(q.codigo ?? ""),
      grupo: String(q.grupo ?? ""),
      nome: String(q.nome ?? ""),
      modificador: String(q.modificador ?? ""),
      valor: String(q.valor ?? ""),
      valor_h: String(q.valor_h ?? ""),
    })),
  };
}

export async function criarCotacao(params: {
  destino: string;
  travelling: "0" | "1" | "2";
  partida: string;
  retorno: string;
  acima65: number;
  ate64: number;
}): Promise<{ publicId: string; produtos: ProdutoSeguro[] }> {
  const dados = await chamar<{ public_id?: string; produtos?: Record<string, unknown>[] }>("/api/agencias/cotacoes.json", {
    destino: params.destino,
    travelling: params.travelling,
    partida: params.partida,
    retorno: params.retorno,
    passenger_over_65: params.acima65,
    passenger_minor_65: params.ate64,
  });
  return {
    publicId: String(dados?.public_id ?? ""),
    produtos: (dados?.produtos ?? []).map(normalizarProduto).filter((p) => p.apelido && p.preco_em_reais_agencia > 0),
  };
}

export async function fecharCheckout(params: {
  cotacaoId: string;
  apelido: string;
  margemPorcentagem: number;
  cliente: { nome: string; email: string; celular: string };
  viajantes: { nome_completo: string; data_nascimento: string; passaporte_cpf: string; cidadania: string }[];
}): Promise<{ url: string; aviso: string | null }> {
  const dados = await chamar<{ url?: string; aviso?: string }>(
    `/api/agencias/cotacoes/${encodeURIComponent(params.cotacaoId)}/checkout.json`,
    {
      apelido: params.apelido,
      margem_porcentagem: params.margemPorcentagem,
      cliente: params.cliente,
      viajantes: params.viajantes,
      modo: "comissionado",
    },
  );
  if (!dados?.url) throw new ErroSeguroViagem("O fornecedor não devolveu o link de pagamento.", 502);
  return { url: dados.url, aviso: dados.aviso ?? null };
}
