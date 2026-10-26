// lib/simpremium/client.ts
//
// Cliente da API de Parceiro da Simpremium (fornecedor de eSIM) — pedido do
// Wilson, 26/out/2026: "vamos integrar nosso parceiro para compra direto
// pelo site [...] ofereceremos somente plano ilimitado". Decisão no mesmo
// dia: o cliente paga pela NOSSA Stone/Pagar.me e o pedido na Simpremium é
// criado com paymentMethod "invoiced" (faturado — a Simpremium cobra a
// Ajisai depois, no prazo do faturado). Wilson, 26/out/2026: "não tem como
// ficar deixando saldo pré-pago" — por isso NUNCA usa "prepaid_credit":
// sem faturado habilitado e com limite, o site simplesmente não vende
// (ver faturadoDisponivel, checado antes de cobrar o cliente).
//
// Configuração (Wilson), nas variáveis de ambiente do Vercel — nunca no
// código:
// - SIMPREMIUM_API_URL: origem do portal da agência (a doc diz "Base URL:
//   a mesma origem deste painel"), ex.: https://<portal-da-simpremium>.
// - SIMPREMIUM_API_KEY: chave gerada em "API de Parceiro → Gerar minha
//   chave de API". Gerar de novo invalida a anterior em 1 hora — aí é só
//   atualizar a variável.
// - SIMPREMIUM_JAPAO_COUNTRY_ID (opcional): id do Japão no campo
//   `countries` dos planos. Sem ele, o filtro é pelo nome do país.
//
// Só roda no servidor (a chave nunca vai para o navegador).

export type FaixaPrecoSimpremium = { minDays: number; maxDays: number; priceUsd: number };

export type PlanoChipSimpremium = {
  id: string;
  nome: string;
  unlimited: boolean;
  franchiseLabel: string | null;
  countries: { id: string; name: string }[];
  faixas: FaixaPrecoSimpremium[];
  raw: Record<string, unknown>;
};

export type PedidoChipCriado = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string | null;
  netValueUsd: number | null;
  totalUsd: number | null;
};

export class ErroSimpremium extends Error {
  status: number;
  code: string | null;
  constructor(mensagem: string, status: number, code: string | null) {
    super(mensagem);
    this.status = status;
    this.code = code;
  }
}

export function simpremiumConfigurado(): boolean {
  return Boolean(process.env.SIMPREMIUM_API_URL && process.env.SIMPREMIUM_API_KEY);
}

async function chamar<T>(caminho: string, init: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> {
  const base = (process.env.SIMPREMIUM_API_URL || "").replace(/\/+$/, "");
  const chave = process.env.SIMPREMIUM_API_KEY || "";
  if (!base || !chave) throw new ErroSimpremium("Simpremium não configurada (SIMPREMIUM_API_URL / SIMPREMIUM_API_KEY).", 0, null);

  const resposta = await fetch(`${base}${caminho}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${chave}`,
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
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
    const d = (dados ?? {}) as { error?: unknown; mensagem?: unknown; message?: unknown; code?: unknown };
    const mensagem = String(d.mensagem ?? d.error ?? d.message ?? (texto.slice(0, 300) || `HTTP ${resposta.status}`));
    throw new ErroSimpremium(mensagem, resposta.status, typeof d.code === "string" ? d.code : typeof d.error === "string" ? d.error : null);
  }
  return dados as T;
}

// A doc mostra a tabela de preço como uma lista de { minDays, maxDays,
// priceUsd } dentro de cada plano, mas o nome do campo não aparece no
// exemplo — procura qualquer lista com esse formato, para não quebrar se
// o nome for "prices", "priceTable" etc.
function extrairFaixas(plano: Record<string, unknown>): FaixaPrecoSimpremium[] {
  for (const valor of Object.values(plano)) {
    if (!Array.isArray(valor) || valor.length === 0) continue;
    const faixas = valor
      .map((f) => f as Record<string, unknown>)
      .filter((f) => f && typeof f === "object" && "priceUsd" in f && ("minDays" in f || "maxDays" in f))
      .map((f) => {
        const min = Number(f.minDays ?? f.maxDays);
        const max = Number(f.maxDays ?? f.minDays);
        return { minDays: min, maxDays: max, priceUsd: Number(f.priceUsd) };
      })
      .filter((f) => f.minDays > 0 && f.maxDays >= f.minDays && f.priceUsd > 0);
    if (faixas.length > 0) return faixas.sort((a, b) => a.minDays - b.minDays);
  }
  return [];
}

function normalizarPlano(bruto: Record<string, unknown>): PlanoChipSimpremium {
  const countries = Array.isArray(bruto.countries)
    ? (bruto.countries as Record<string, unknown>[]).map((c) => ({ id: String(c?.id ?? ""), name: String(c?.name ?? "") }))
    : [];
  const franchiseLabel = typeof bruto.franchiseLabel === "string" ? bruto.franchiseLabel : null;
  const unlimited = bruto.unlimited === true || String(bruto.franchiseKind ?? "").toLowerCase() === "unlimited";
  const nome = String(bruto.name ?? bruto.nome ?? bruto.title ?? (unlimited ? "Ilimitado" : franchiseLabel ?? "Plano"));
  return { id: String(bruto.id ?? ""), nome, unlimited, franchiseLabel, countries, faixas: extrairFaixas(bruto), raw: bruto };
}

export async function listarPlanosChip(params: { countryId?: string; planType?: "virtual" | "fisico" } = {}) {
  const qs = new URLSearchParams();
  if (params.countryId) qs.set("countryId", params.countryId);
  qs.set("planType", params.planType ?? "virtual");
  const dados = await chamar<{ plans?: Record<string, unknown>[] }>(`/api/partner/v1/plans/chip?${qs.toString()}`);
  return (dados?.plans ?? []).map(normalizarPlano).filter((p) => p.id);
}

const NOME_JAPAO = /jap[aã]o|japan|日本/i;

/** Planos ILIMITADOS de eSIM que cobrem o Japão — a única linha que a
 * Ajisai vende (Wilson, 26/out/2026). Prefere os planos só de Japão; se não
 * houver, aceita os regionais que incluem o Japão. */
export async function listarPlanosIlimitadosJapao(): Promise<PlanoChipSimpremium[]> {
  const countryId = process.env.SIMPREMIUM_JAPAO_COUNTRY_ID || undefined;
  const planos = await listarPlanosChip({ countryId, planType: "virtual" });
  const cobreJapao = (p: PlanoChipSimpremium) =>
    countryId ? p.countries.some((c) => c.id === countryId) || p.countries.length === 0 : p.countries.some((c) => NOME_JAPAO.test(c.name));
  const ilimitados = planos.filter((p) => p.unlimited && p.faixas.length > 0 && cobreJapao(p));
  const soJapao = ilimitados.filter((p) => p.countries.length <= 1);
  return soJapao.length > 0 ? soJapao : ilimitados;
}

export async function criarPedidoChip(params: {
  planId: string;
  days: number;
  startDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCpf?: string | null;
}): Promise<PedidoChipCriado> {
  const dados = await chamar<{ order?: Record<string, unknown> }>("/api/partner/v1/orders/chip", {
    method: "POST",
    body: {
      planId: params.planId,
      days: params.days,
      startDate: params.startDate,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      ...(params.customerPhone ? { customerPhone: params.customerPhone } : {}),
      ...(params.customerCpf ? { customerCpf: params.customerCpf } : {}),
      // Sem commissionUsd/commissionPct: a margem da Ajisai já foi cobrada
      // do cliente pela Stone; na Simpremium pagamos só o NET.
      paymentMethod: "invoiced",
    },
  });
  const o = dados?.order ?? {};
  return {
    id: String(o.id ?? ""),
    orderNumber: String(o.orderNumber ?? ""),
    status: String(o.status ?? ""),
    paymentStatus: o.paymentStatus != null ? String(o.paymentStatus) : null,
    netValueUsd: o.netValueUsd != null ? Number(o.netValueUsd) : null,
    totalUsd: o.totalUsd != null ? Number(o.totalUsd) : null,
  };
}

export async function consultarPedido(idOuNumero: string) {
  return chamar<Record<string, unknown>>(`/api/partner/v1/orders/${encodeURIComponent(idOuNumero)}`);
}

export type CreditoSimpremium = {
  invoiced?: {
    enabled?: boolean;
    creditLimitUsd?: number | null;
    availableUsd?: number | null;
    overdueCount?: number;
    blockedReason?: string | null;
  };
  prepaidWalletUsd?: number;
} & Record<string, unknown>;

export async function consultarCredito() {
  return chamar<CreditoSimpremium>("/api/partner/v1/credit");
}

/** O faturado aceita um pedido de `valorNetUsd` agora? Checado ANTES de
 * cobrar o cliente na Stone — se não aceitar, a venda não acontece (não há
 * saldo pré-pago de reserva). availableUsd null = sem limite definido. */
export async function faturadoDisponivel(valorNetUsd = 0): Promise<{ ok: boolean; motivo: string | null }> {
  try {
    const credito = await consultarCredito();
    const f = credito?.invoiced;
    if (!f?.enabled) return { ok: false, motivo: "Faturado não habilitado na Simpremium." };
    if (f.blockedReason) return { ok: false, motivo: `Faturado bloqueado na Simpremium: ${f.blockedReason}` };
    if (typeof f.availableUsd === "number" && f.availableUsd < valorNetUsd) {
      return { ok: false, motivo: `Limite do faturado insuficiente (disponível US$ ${f.availableUsd}, pedido US$ ${valorNetUsd}).` };
    }
    return { ok: true, motivo: null };
  } catch (erro) {
    return { ok: false, motivo: `Não foi possível consultar o crédito na Simpremium: ${erro instanceof Error ? erro.message : String(erro)}` };
  }
}
