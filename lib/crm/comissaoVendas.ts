// Comissão por serviço vendido (migração 038 — Wilson, 04/nov/2026).
// Só servidor (service role). Ver app/lib/comissaoTabela.ts para as regras.
import { createAdminClient } from "@/lib/supabase/admin";
import { buscarPtaxIene } from "@/app/lib/cotacaoIenePtaxServidor";
import { calcularComissaoVenda, lerQuantidades, lerValores, tabelaPadrao, type LinhaComissao, type Quantidades, type ValoresJPY } from "@/app/lib/comissaoTabela";

type Admin = ReturnType<typeof createAdminClient>;

export type BeneficiarioVenda = {
  chave: string; // "e:<parceiro_id>" | "u:<perfil_id>"
  nome: string;
  tipo: "empresa" | "usuario";
  excecoes: ValoresJPY;
};

export type CalculoBeneficiario = BeneficiarioVenda & { linhas: LinhaComissao[]; totalJPY: number; totalBRL: number; excluido: boolean };

export type SnapshotComissao = {
  cotacaoBRLporJPY: number;
  quantidades: Quantidades;
  beneficiarios: { chave: string; nome: string; tipo: "empresa" | "usuario"; linhas: LinhaComissao[]; totalJPY: number; totalBRL: number }[];
  totalJPY: number;
  totalBRL: number;
};

export type VendaComissao = {
  cliente_id: string;
  quantidades: Quantidades;
  origem: "calculadora" | "manual";
  status: "rascunho" | "aprovada";
  beneficiarios_excluidos: string[];
  cotacao_brl_por_jpy: number | null;
  observacao: string | null;
  snapshot: SnapshotComissao | null;
  aprovado_em: string | null;
  aprovado_por_email: string | null;
  updated_at: string;
  updated_by_email: string | null;
};

const semTabela = (e: { code?: string } | null) => !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "42703" || e.code === "PGRST204");

export async function carregarTabelaPadrao(admin: Admin = createAdminClient()): Promise<{ tabela: ValoresJPY; alteracoes: Record<string, { valor: number; em: string; por: string | null }>; erro: boolean }> {
  const { data, error } = await admin.from("comissoes_tabela").select("item_id, valor_jpy, updated_at, updated_by_email");
  const alteracoes: Record<string, { valor: number; em: string; por: string | null }> = {};
  for (const r of data ?? []) alteracoes[r.item_id as string] = { valor: Number(r.valor_jpy), em: r.updated_at as string, por: (r.updated_by_email as string | null) ?? null };
  return { tabela: tabelaPadrao(lerValores(Object.fromEntries(Object.entries(alteracoes).map(([k, v]) => [k, v.valor])))), alteracoes, erro: !!error };
}

/** Quem recebe pela venda: empresa parceira (PJ) e/ou responsável não-admin (consultor PF/PJ). */
export async function beneficiariosDoCliente(cliente: { parceiro_id?: string | null; responsavel_id?: string | null }, admin: Admin = createAdminClient()): Promise<BeneficiarioVenda[]> {
  const out: BeneficiarioVenda[] = [];
  if (cliente.parceiro_id) {
    const { data } = await admin.from("parceiros").select("*").eq("id", cliente.parceiro_id).maybeSingle();
    if (data) out.push({ chave: `e:${data.id}`, nome: data.nome, tipo: "empresa", excecoes: lerValores(data.comissao_itens) });
  }
  if (cliente.responsavel_id) {
    const { data } = await admin.from("perfis").select("*").eq("id", cliente.responsavel_id).maybeSingle();
    if (data && data.papel !== "admin") out.push({ chave: `u:${data.id}`, nome: data.nome || data.email || "Usuário", tipo: "usuario", excecoes: lerValores(data.comissao_itens) });
  }
  return out;
}

export async function carregarVenda(clienteId: string, admin: Admin = createAdminClient()): Promise<VendaComissao | null | { erro: true }> {
  const { data, error } = await admin.from("comissoes_vendas").select("*").eq("cliente_id", clienteId).maybeSingle();
  if (error) return semTabela(error) ? { erro: true } : null;
  if (!data) return null;
  return {
    ...(data as VendaComissao),
    quantidades: lerQuantidades(data.quantidades),
    beneficiarios_excluidos: Array.isArray(data.beneficiarios_excluidos) ? (data.beneficiarios_excluidos as string[]) : [],
    cotacao_brl_por_jpy: data.cotacao_brl_por_jpy == null ? null : Number(data.cotacao_brl_por_jpy),
  };
}

export function calcularBeneficiarios(quantidades: Quantidades, tabela: ValoresJPY, beneficiarios: BeneficiarioVenda[], excluidos: string[], cotacao: number): CalculoBeneficiario[] {
  return beneficiarios.map((b) => {
    const r = calcularComissaoVenda(quantidades, tabela, b.excecoes);
    return { ...b, ...r, totalBRL: Math.round(r.totalJPY * cotacao * 100) / 100, excluido: excluidos.includes(b.chave) };
  });
}

/** Câmbio comercial (PTAX) do dia, com o valor de reserva se o BCB não responder. */
export async function cotacaoComercial() {
  const r = await buscarPtaxIene();
  return { valor: r.brlPorJPY, data: r.data, fallback: r.fallback };
}

/** Foto da comissão na aprovação: não muda se a tabela mudar depois. */
export function montarSnapshot(calculo: CalculoBeneficiario[], quantidades: Quantidades, cotacao: number): SnapshotComissao {
  const ativos = calculo.filter((b) => !b.excluido && b.totalJPY > 0);
  return {
    cotacaoBRLporJPY: cotacao,
    quantidades,
    beneficiarios: ativos.map(({ chave, nome, tipo, linhas, totalJPY, totalBRL }) => ({ chave, nome, tipo, linhas, totalJPY, totalBRL })),
    totalJPY: ativos.reduce((s, b) => s + b.totalJPY, 0),
    totalBRL: Math.round(ativos.reduce((s, b) => s + b.totalBRL, 0) * 100) / 100,
  };
}

/** Comissões aprovadas (para o resumo mensal em lib/crm/comissoes.ts). */
export async function vendasAprovadas(admin: Admin = createAdminClient()): Promise<{ cliente_id: string; aprovado_em: string; snapshot: SnapshotComissao }[]> {
  const { data, error } = await admin.from("comissoes_vendas").select("cliente_id, aprovado_em, snapshot").eq("status", "aprovada").limit(10000);
  if (error) return [];
  return (data ?? []).filter((v) => v.aprovado_em && v.snapshot) as { cliente_id: string; aprovado_em: string; snapshot: SnapshotComissao }[];
}
