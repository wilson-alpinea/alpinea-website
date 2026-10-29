"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { isTipoPagamento } from "@/lib/crm/pagamentos";
import { PREFIXO_STORAGE } from "@/lib/crm/arquivosStorage";
import { centavos, formatarBRL, nomeParcela } from "@/lib/crm/financeiro";

// Ações do Financeiro (Wilson, 22/out/2026 — migração 023). Todas devolvem
// { ok, erro } para o formulário mostrar a mensagem sem recarregar a página.
// Cadastrar parcela = previsão de cobrança; dinheiro recebido só entra por
// registrarRecebimento (função atômica no banco).

type Resultado = { ok: true; aviso?: string } | { ok: false; erro: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const ERRO_MIGRACAO =
  "O banco ainda não tem as tabelas do novo Financeiro. Rode a migração 023 no Supabase.";

function textoCurto(v: unknown, max = 500): string | null {
  const t = String(v ?? "").trim();
  return t ? t.slice(0, max) : null;
}

function erroDeBanco(error: { code?: string; message?: string } | null, padrao: string): string {
  if (!error) return padrao;
  if (error.code === "42P01" || error.code === "42703" || error.code === "PGRST202" || /does not exist|schema cache/i.test(error.message ?? "")) {
    return ERRO_MIGRACAO;
  }
  return padrao;
}

async function registrarEvento(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dados: { cliente_id: string; acao: string; descricao: string; motivo?: string | null; pagamento_id?: string | null; recebimento_id?: string | null; autor_id: string | null },
) {
  const { error } = await supabase.from("financeiro_eventos").insert(dados);
  if (error) console.error("Erro ao registrar evento financeiro:", error);
}

function revalidar(clienteId: string) {
  revalidatePath(`/crm/clientes/${clienteId}`);
}

// ── Valor contratado ─────────────────────────────────────────────
export async function definirValorContratado(clienteId: string, valorC: number, motivo: string): Promise<Resultado> {
  const acesso = await garantirAdmin();
  if (!UUID.test(clienteId)) return { ok: false, erro: "Cliente inválido." };
  if (!Number.isInteger(valorC) || valorC <= 0) return { ok: false, erro: "Informe um valor maior que zero." };

  const supabase = await createClient();
  const { data: cliente, error: erroLeitura } = await supabase
    .from("clientes")
    .select("valor_contratado")
    .eq("id", clienteId)
    .maybeSingle();
  if (erroLeitura || !cliente) return { ok: false, erro: erroDeBanco(erroLeitura, "Cliente não encontrado.") };

  const anterior = cliente.valor_contratado === null ? null : centavos(cliente.valor_contratado);
  if (anterior === valorC) return { ok: true };
  const motivoLimpo = textoCurto(motivo);
  if (anterior !== null && !motivoLimpo) return { ok: false, erro: "Informe o motivo da alteração do valor contratado." };

  const { error } = await supabase.from("clientes").update({ valor_contratado: valorC / 100 }).eq("id", clienteId);
  if (error) return { ok: false, erro: erroDeBanco(error, "Não foi possível salvar o valor contratado.") };

  await registrarEvento(supabase, {
    cliente_id: clienteId,
    acao: "valor_contratado",
    descricao:
      anterior === null
        ? `Valor contratado definido: ${formatarBRL(valorC)}.`
        : `Valor contratado alterado de ${formatarBRL(anterior)} para ${formatarBRL(valorC)}.`,
    motivo: motivoLimpo,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}

// ── Parcelas (previsão de cobrança) ──────────────────────────────
export type NovaParcela = {
  descricao: string;
  valorC: number;
  vencimento: string;
  servico: string | null;
  observacoes: string | null;
};

export async function criarParcelas(clienteId: string, itens: NovaParcela[], chave: string, origem: "manual" | "dividida" | "sinal_saldo"): Promise<Resultado> {
  const acesso = await garantirAdmin();
  if (!UUID.test(clienteId)) return { ok: false, erro: "Cliente inválido." };
  if (!itens.length || itens.length > 60) return { ok: false, erro: "Informe entre 1 e 60 parcelas." };
  for (const [i, p] of itens.entries()) {
    const rotulo = itens.length > 1 ? `Parcela ${i + 1}: ` : "";
    if (!p.descricao?.trim()) return { ok: false, erro: `${rotulo}informe a descrição.` };
    if (!Number.isInteger(p.valorC) || p.valorC <= 0) return { ok: false, erro: `${rotulo}informe um valor maior que zero.` };
    if (!DATA.test(p.vencimento ?? "")) return { ok: false, erro: `${rotulo}informe o vencimento.` };
  }
  if (!chave || chave.length > 80) return { ok: false, erro: "Envio inválido. Recarregue a página." };

  const supabase = await createClient();
  const total = itens.length;
  const linhas = itens.map((p, i) => ({
    cliente_id: clienteId,
    descricao: p.descricao.trim().slice(0, 120),
    servico: textoCurto(p.servico, 60),
    observacoes: textoCurto(p.observacoes),
    valor: p.valorC / 100,
    data_vencimento: p.vencimento,
    numero_parcela: i + 1,
    total_parcelas: total,
    status: "pendente",
    criado_por: acesso.userId ?? null,
    chave_criacao: `${chave}:${i}`,
  }));
  const { data, error } = await supabase.from("pagamentos").insert(linhas).select("id");
  if (error) {
    // 23505 = chave repetida: o mesmo envio já foi gravado (clique duplo).
    if (error.code === "23505") return { ok: true };
    console.error("Erro ao criar parcelas:", error);
    return { ok: false, erro: erroDeBanco(error, "Não foi possível salvar as parcelas.") };
  }
  const somaC = itens.reduce((s, p) => s + p.valorC, 0);
  await registrarEvento(supabase, {
    cliente_id: clienteId,
    acao: "parcela_criada",
    pagamento_id: total === 1 ? data?.[0]?.id ?? null : null,
    descricao:
      total === 1
        ? `Parcela "${itens[0].descricao.trim()}" cadastrada: ${formatarBRL(itens[0].valorC)}, vencimento ${itens[0].vencimento.split("-").reverse().join("/")}.`
        : `${total} parcelas cadastradas (${origem === "sinal_saldo" ? "sinal + saldo" : "parcelamento"}), total ${formatarBRL(somaC)}.`,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}

async function lerParcela(supabase: Awaited<ReturnType<typeof createClient>>, clienteId: string, pagamentoId: string) {
  const { data: parcela, error } = await supabase
    .from("pagamentos")
    .select("id, cliente_id, descricao, numero_parcela, total_parcelas, valor, status, data_vencimento, servico, observacoes")
    .eq("id", pagamentoId)
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error || !parcela) return { parcela: null, recebidoC: 0, temLancamentos: false, error };
  const { data: lanc } = await supabase.from("recebimentos").select("tipo, valor").eq("pagamento_id", pagamentoId);
  const recebidoC = (lanc ?? []).reduce(
    (s, l) => s + (l.tipo === "recebimento" ? centavos(l.valor) : l.tipo === "estorno" ? -centavos(l.valor) : 0),
    0,
  );
  return { parcela, recebidoC, temLancamentos: (lanc ?? []).length > 0, error: null };
}

export async function editarParcela(
  clienteId: string,
  pagamentoId: string,
  dados: { descricao: string; valorC: number; vencimento: string; servico: string | null; observacoes: string | null },
  motivo: string,
): Promise<Resultado> {
  const acesso = await garantirAdmin();
  if (!UUID.test(clienteId) || !UUID.test(pagamentoId)) return { ok: false, erro: "Parcela inválida." };
  if (!dados.descricao?.trim()) return { ok: false, erro: "Informe a descrição." };
  if (!Number.isInteger(dados.valorC) || dados.valorC <= 0) return { ok: false, erro: "Informe um valor maior que zero." };
  if (!DATA.test(dados.vencimento ?? "")) return { ok: false, erro: "Informe o vencimento." };

  const supabase = await createClient();
  const { parcela, recebidoC, error } = await lerParcela(supabase, clienteId, pagamentoId);
  if (!parcela) return { ok: false, erro: erroDeBanco(error, "Parcela não encontrada.") };
  if (parcela.status === "cancelado") return { ok: false, erro: "Parcela cancelada não pode ser editada." };
  if (dados.valorC < recebidoC) {
    return { ok: false, erro: `O valor não pode ficar abaixo do que já foi recebido (${formatarBRL(recebidoC)}).` };
  }

  const mudancas: string[] = [];
  const valorAntes = centavos(parcela.valor);
  if (parcela.descricao !== dados.descricao.trim()) mudancas.push(`descrição "${parcela.descricao ?? nomeParcela(parcela)}" → "${dados.descricao.trim()}"`);
  if (valorAntes !== dados.valorC) mudancas.push(`valor ${formatarBRL(valorAntes)} → ${formatarBRL(dados.valorC)}`);
  if ((parcela.data_vencimento ?? "") !== dados.vencimento) mudancas.push(`vencimento ${parcela.data_vencimento?.split("-").reverse().join("/") ?? "—"} → ${dados.vencimento.split("-").reverse().join("/")}`);
  if ((parcela.servico ?? null) !== (textoCurto(dados.servico, 60) ?? null)) mudancas.push("serviço vinculado");
  if ((parcela.observacoes ?? null) !== (textoCurto(dados.observacoes) ?? null)) mudancas.push("observações");
  if (!mudancas.length) return { ok: true };
  const motivoLimpo = textoCurto(motivo);
  if ((valorAntes !== dados.valorC || recebidoC > 0) && !motivoLimpo) {
    return { ok: false, erro: "Informe o motivo da alteração." };
  }

  const quitada = dados.valorC - recebidoC === 0;
  const { error: erroUpdate } = await supabase
    .from("pagamentos")
    .update({
      descricao: dados.descricao.trim().slice(0, 120),
      valor: dados.valorC / 100,
      data_vencimento: dados.vencimento,
      servico: textoCurto(dados.servico, 60),
      observacoes: textoCurto(dados.observacoes),
      status: quitada ? "pago" : "pendente",
    })
    .eq("id", pagamentoId);
  if (erroUpdate) return { ok: false, erro: erroDeBanco(erroUpdate, "Não foi possível salvar a parcela.") };

  await registrarEvento(supabase, {
    cliente_id: clienteId,
    pagamento_id: pagamentoId,
    acao: "parcela_editada",
    descricao: `Parcela "${dados.descricao.trim()}" alterada: ${mudancas.join("; ")}.`,
    motivo: motivoLimpo,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}

export async function cancelarParcela(clienteId: string, pagamentoId: string, motivo: string): Promise<Resultado> {
  const acesso = await garantirAdmin();
  const motivoLimpo = textoCurto(motivo);
  if (!motivoLimpo) return { ok: false, erro: "Informe o motivo do cancelamento." };
  const supabase = await createClient();
  const { parcela, recebidoC, error } = await lerParcela(supabase, clienteId, pagamentoId);
  if (!parcela) return { ok: false, erro: erroDeBanco(error, "Parcela não encontrada.") };
  if (recebidoC > 0) {
    return { ok: false, erro: `Esta parcela tem ${formatarBRL(recebidoC)} recebidos. Estorne os recebimentos antes de cancelar.` };
  }
  const { error: erroUpdate } = await supabase.from("pagamentos").update({ status: "cancelado" }).eq("id", pagamentoId);
  if (erroUpdate) return { ok: false, erro: erroDeBanco(erroUpdate, "Não foi possível cancelar a parcela.") };
  await registrarEvento(supabase, {
    cliente_id: clienteId,
    pagamento_id: pagamentoId,
    acao: "parcela_cancelada",
    descricao: `Parcela "${nomeParcela(parcela)}" (${formatarBRL(centavos(parcela.valor))}) cancelada.`,
    motivo: motivoLimpo,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}

export async function excluirParcela(clienteId: string, pagamentoId: string, motivo: string): Promise<Resultado> {
  const acesso = await garantirAdmin({ deletar: true });
  const motivoLimpo = textoCurto(motivo);
  if (!motivoLimpo) return { ok: false, erro: "Informe o motivo da exclusão." };
  const supabase = await createClient();
  const { parcela, temLancamentos, error } = await lerParcela(supabase, clienteId, pagamentoId);
  if (!parcela) return { ok: false, erro: erroDeBanco(error, "Parcela não encontrada.") };
  if (temLancamentos) {
    return { ok: false, erro: "Esta parcela tem recebimentos ou estornos vinculados e não pode ser excluída. Use “Cancelar parcela” depois de estornar." };
  }
  const { error: erroDelete } = await supabase.from("pagamentos").delete().eq("id", pagamentoId);
  if (erroDelete) return { ok: false, erro: erroDeBanco(erroDelete, "Não foi possível excluir a parcela.") };
  await registrarEvento(supabase, {
    cliente_id: clienteId,
    pagamento_id: pagamentoId,
    acao: "parcela_excluida",
    descricao: `Parcela "${nomeParcela(parcela)}" (${formatarBRL(centavos(parcela.valor))}, vencimento ${parcela.data_vencimento?.split("-").reverse().join("/") ?? "—"}) excluída.`,
    motivo: motivoLimpo,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}

// ── Recebimentos ─────────────────────────────────────────────────
export async function registrarComprovante(clienteId: string, path: string, nomeOriginal: string, rotulo: string): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  await garantirAdmin();
  if (!UUID.test(clienteId) || !path.startsWith(`${clienteId}/`) || path.includes("..")) return { ok: false, erro: "Arquivo inválido." };
  const { data, error } = await createAdminClient()
    .from("arquivos_cliente")
    .insert({ cliente_id: clienteId, tipo: "comprovante", label: (rotulo || nomeOriginal).slice(0, 160), url: `${PREFIXO_STORAGE}${path}` })
    .select("id")
    .single();
  if (error || !data) {
    console.error("Erro ao registrar comprovante:", error);
    return { ok: false, erro: erroDeBanco(error, "Não foi possível anexar o comprovante.") };
  }
  return { ok: true, id: data.id };
}

export async function registrarRecebimento(
  clienteId: string,
  dados: { pagamentoId: string; valorC: number; data: string; forma: string; comprovanteId: string | null; observacoes: string | null; chave: string },
): Promise<Resultado> {
  await garantirAdmin();
  if (!UUID.test(clienteId) || !UUID.test(dados.pagamentoId)) return { ok: false, erro: "Parcela inválida." };
  if (!Number.isInteger(dados.valorC) || dados.valorC <= 0) return { ok: false, erro: "Informe um valor recebido maior que zero." };
  if (!DATA.test(dados.data ?? "")) return { ok: false, erro: "Informe a data do recebimento." };
  if (!isTipoPagamento(dados.forma)) return { ok: false, erro: "Escolha a forma de pagamento." };
  if (!dados.chave) return { ok: false, erro: "Envio inválido. Recarregue a página." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crm_registrar_recebimento", {
    p_pagamento: dados.pagamentoId,
    p_valor: dados.valorC / 100,
    p_data: dados.data,
    p_forma: dados.forma,
    p_comprovante: dados.comprovanteId && UUID.test(dados.comprovanteId) ? dados.comprovanteId : null,
    p_observacoes: textoCurto(dados.observacoes),
    p_chave: dados.chave,
  });
  if (error) {
    console.error("Erro ao registrar recebimento:", error);
    return { ok: false, erro: erroDeBanco(error, "Não foi possível registrar o recebimento.") };
  }
  const r = data as { ok: boolean; erro?: string };
  if (!r?.ok) return { ok: false, erro: r?.erro ?? "Não foi possível registrar o recebimento." };
  revalidar(clienteId);
  return { ok: true };
}

export async function estornarRecebimento(clienteId: string, recebimentoId: string, motivo: string, chave: string): Promise<Resultado> {
  await garantirAdmin();
  if (!UUID.test(clienteId) || !UUID.test(recebimentoId)) return { ok: false, erro: "Recebimento inválido." };
  const motivoLimpo = textoCurto(motivo);
  if (!motivoLimpo) return { ok: false, erro: "Informe o motivo do estorno." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crm_estornar_recebimento", {
    p_recebimento: recebimentoId,
    p_motivo: motivoLimpo,
    p_chave: chave,
  });
  if (error) {
    console.error("Erro ao estornar recebimento:", error);
    return { ok: false, erro: erroDeBanco(error, "Não foi possível estornar.") };
  }
  const r = data as { ok: boolean; erro?: string };
  if (!r?.ok) return { ok: false, erro: r?.erro ?? "Não foi possível estornar." };
  revalidar(clienteId);
  return { ok: true };
}

// ── Reembolso (devolução de dinheiro ao cliente) ─────────────────
// Não mexe nas parcelas nem no valor contratado: reduzir o contrato é
// outra operação ("Alterar valor contratado").
export async function registrarReembolso(
  clienteId: string,
  dados: { valorC: number; data: string; forma: string; motivo: string; chave: string },
): Promise<Resultado> {
  const acesso = await garantirAdmin();
  if (!UUID.test(clienteId)) return { ok: false, erro: "Cliente inválido." };
  if (!Number.isInteger(dados.valorC) || dados.valorC <= 0) return { ok: false, erro: "Informe um valor maior que zero." };
  if (!DATA.test(dados.data ?? "")) return { ok: false, erro: "Informe a data do reembolso." };
  if (!isTipoPagamento(dados.forma)) return { ok: false, erro: "Escolha a forma da devolução." };
  const motivoLimpo = textoCurto(dados.motivo);
  if (!motivoLimpo) return { ok: false, erro: "Informe o motivo do reembolso." };

  const supabase = await createClient();
  const { data: lanc, error: erroLeitura } = await supabase.from("recebimentos").select("tipo, valor").eq("cliente_id", clienteId);
  if (erroLeitura) return { ok: false, erro: erroDeBanco(erroLeitura, "Não foi possível conferir os recebimentos.") };
  const liquidoC = (lanc ?? []).reduce(
    (s, l) => s + (l.tipo === "recebimento" ? centavos(l.valor) : -centavos(l.valor)),
    0,
  );
  if (dados.valorC > liquidoC) {
    return { ok: false, erro: `O reembolso não pode passar do valor líquido recebido (${formatarBRL(Math.max(0, liquidoC))}).` };
  }

  const { data, error } = await supabase
    .from("recebimentos")
    .insert({
      cliente_id: clienteId,
      tipo: "reembolso",
      valor: dados.valorC / 100,
      data: dados.data,
      forma_pagamento: dados.forma,
      motivo: motivoLimpo,
      origem: "manual",
      chave_idempotencia: dados.chave,
      autor_id: acesso.userId ?? null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: true };
    return { ok: false, erro: erroDeBanco(error, "Não foi possível registrar o reembolso.") };
  }
  await registrarEvento(supabase, {
    cliente_id: clienteId,
    recebimento_id: data?.id ?? null,
    acao: "reembolso",
    descricao: `Reembolso ao cliente: ${formatarBRL(dados.valorC)}.`,
    motivo: motivoLimpo,
    autor_id: acesso.userId ?? null,
  });
  revalidar(clienteId);
  return { ok: true };
}
