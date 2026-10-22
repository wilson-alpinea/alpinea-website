import type { createClient } from "@/lib/supabase/server";
import {
  PRODUTOS_PRINCIPAIS,
  PRODUTOS_SECUNDARIOS,
} from "@/lib/crm/produtos";
import {
  calcularParcela,
  centavos,
  hojeCRM,
  ordenarParcelas,
  resumir,
  type EventoFinanceiro,
  type Lancamento,
  type Parcela,
} from "@/lib/crm/financeiro";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const TABELA_AUSENTE = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

// Lê e calcula tudo o que a seção Financeiro mostra. Se a migração 023
// ainda não rodou, cai no modo só leitura: parcelas "pago" viram um
// recebimento virtual (o mesmo que o backfill da migração faz).
export async function carregarFinanceiro(
  supabase: Supabase,
  cliente: { id: string; valor_contratado?: number | null; valor_proposta: number | null },
) {
  const hoje = hojeCRM();

  const { data: linhas } = await supabase
    .from("pagamentos")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("data_vencimento", { ascending: true, nullsFirst: false });
  const parcelasBrutas: Parcela[] = (linhas ?? []).map((p) => ({
    id: p.id,
    descricao: p.descricao ?? null,
    servico: p.servico ?? null,
    numero_parcela: p.numero_parcela,
    total_parcelas: p.total_parcelas,
    valor: Number(p.valor),
    status: p.status,
    data_vencimento: p.data_vencimento,
    observacoes: p.observacoes,
    gateway: p.gateway ?? null,
    created_at: p.created_at,
  }));

  const { data: recs, error: erroRecs } = await supabase
    .from("recebimentos")
    .select("id, pagamento_id, tipo, valor, data, forma_pagamento, comprovante_arquivo_id, observacoes, motivo, estorno_de, origem, autor_id, created_at")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: true });
  const bloqueado = TABELA_AUSENTE(erroRecs) || !("valor_contratado" in cliente);

  const { data: evs } = bloqueado
    ? { data: [] as { id: string; acao: string; descricao: string; motivo: string | null; autor_id: string | null; created_at: string }[] }
    : await supabase
        .from("financeiro_eventos")
        .select("id, acao, descricao, motivo, autor_id, created_at")
        .eq("cliente_id", cliente.id)
        .order("created_at", { ascending: false })
        .limit(100);

  // Nomes de quem registrou.
  const autores = new Set<string>();
  for (const r of recs ?? []) if (r.autor_id) autores.add(r.autor_id);
  for (const e of evs ?? []) if (e.autor_id) autores.add(e.autor_id);
  const nomes = new Map<string, string>();
  if (autores.size) {
    const { data: perfis } = await supabase.from("perfis").select("id, nome, email").in("id", [...autores]);
    for (const p of perfis ?? []) nomes.set(p.id, p.nome || p.email);
  }

  const lancamentos: Lancamento[] = bloqueado
    ? parcelasBrutas
        .filter((p) => p.status === "pago" && p.valor > 0)
        .map((p) => {
          const bruto = (linhas ?? []).find((l) => l.id === p.id);
          return {
            id: `virtual-${p.id}`,
            pagamento_id: p.id,
            tipo: "recebimento" as const,
            valor: p.valor,
            data: bruto?.data_pagamento ?? null,
            forma_pagamento: bruto?.tipo_pagamento ?? null,
            comprovante_arquivo_id: null,
            observacoes: null,
            motivo: null,
            estorno_de: null,
            origem: (p.gateway ? "gateway" : "legado") as Lancamento["origem"],
            autor: null,
            created_at: p.created_at,
          };
        })
    : (recs ?? []).map((r) => ({
        id: r.id,
        pagamento_id: r.pagamento_id,
        tipo: r.tipo,
        valor: Number(r.valor),
        data: r.data,
        forma_pagamento: r.forma_pagamento,
        comprovante_arquivo_id: r.comprovante_arquivo_id,
        observacoes: r.observacoes,
        motivo: r.motivo,
        estorno_de: r.estorno_de,
        origem: r.origem,
        autor: r.autor_id ? nomes.get(r.autor_id) ?? null : null,
        created_at: r.created_at,
      }));

  const parcelas = ordenarParcelas(parcelasBrutas.map((p) => calcularParcela(p, lancamentos, hoje)));
  const contratado = cliente.valor_contratado ?? null;
  const resumo = resumir(contratado === null ? null : Number(contratado), parcelas, lancamentos);

  const eventos: EventoFinanceiro[] = (evs ?? []).map((e) => ({
    id: e.id,
    acao: e.acao,
    descricao: e.descricao,
    motivo: e.motivo,
    autor: e.autor_id ? nomes.get(e.autor_id) ?? null : null,
    created_at: e.created_at,
  }));

  const servicos = [
    ...PRODUTOS_PRINCIPAIS.map((p) => ({ valor: p.valor, label: p.label })),
    ...PRODUTOS_SECUNDARIOS.map((p) => ({ valor: p.valor, label: p.label })),
  ];

  return {
    hoje,
    propostaC: cliente.valor_proposta ? centavos(cliente.valor_proposta) : null,
    parcelas,
    resumo,
    reembolsos: lancamentos.filter((l) => l.tipo === "reembolso"),
    eventos,
    servicos,
    bloqueado,
  };
}
