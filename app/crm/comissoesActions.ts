"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin, garantirSomenteAdmin } from "@/lib/crm/acesso";
import { ITENS_COMISSAO, isItemComissao, lerQuantidades } from "@/app/lib/comissaoTabela";
import { beneficiariosDoCliente, calcularBeneficiarios, carregarTabelaPadrao, carregarVenda, cotacaoComercial, montarSnapshot } from "@/lib/crm/comissaoVendas";

// Comissões por serviço (Wilson, 04/nov/2026 — migração 038):
// - a equipe edita o rascunho da venda no cliente (quantidades, quem
//   recebe, câmbio); só admin aprova, e a aprovação guarda a foto dos valores;
// - tabela padrão e exceções por parceiro/consultor em /crm/comissoes (admin).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function emailAtual() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return user?.email ?? "equipe";
}

function voltarCliente(id: string, erro?: string): never {
  redirect(`/crm/clientes/${id}${erro ? `?comissaoErro=${encodeURIComponent(erro)}` : "?comissaoOk=1"}#comissao`);
}

function lerFormVenda(formData: FormData) {
  const q: Record<string, number> = {};
  for (const item of ITENS_COMISSAO) {
    const bruto = String(formData.get(`q_${item.id}`) ?? "").trim().replace(/\./g, "").replace(",", ".");
    if (bruto) q[item.id] = Number(bruto);
  }
  const excluidos = formData.getAll("excluir").map(String).filter((x) => /^[eu]:[0-9a-f-]{36}$/i.test(x));
  const cotBruta = Number(String(formData.get("cotacao") ?? "").trim().replace(",", "."));
  return {
    quantidades: lerQuantidades(q),
    excluidos,
    cotacao: Number.isFinite(cotBruta) && cotBruta > 0 && cotBruta < 1 ? cotBruta : null,
    observacao: String(formData.get("observacao") ?? "").trim().slice(0, 1000) || null,
  };
}

/** Salvar rascunho (equipe com permissão de editar). */
export async function salvarComissaoVenda(clienteId: string, formData: FormData) {
  if (!UUID.test(clienteId)) voltarCliente(clienteId, "Cliente inválido.");
  await garantirAdmin();
  const por = await emailAtual();
  const admin = createAdminClient();
  const atual = await carregarVenda(clienteId, admin);
  if (atual && "erro" in atual) voltarCliente(clienteId, "Rode a migração 038 no Supabase para usar as comissões.");
  if (atual?.status === "aprovada") voltarCliente(clienteId, "A comissão já foi aprovada. Reabra para editar.");
  const f = lerFormVenda(formData);
  const { error } = await admin.from("comissoes_vendas").upsert(
    {
      cliente_id: clienteId,
      quantidades: f.quantidades,
      origem: atual?.origem ?? "manual",
      status: "rascunho",
      beneficiarios_excluidos: f.excluidos,
      cotacao_brl_por_jpy: f.cotacao,
      observacao: f.observacao,
      updated_at: new Date().toISOString(),
      updated_by_email: por,
    },
    { onConflict: "cliente_id" },
  );
  if (error) {
    console.error("Erro ao salvar comissão:", error.message);
    voltarCliente(clienteId, "Não foi possível salvar a comissão.");
  }
  revalidatePath(`/crm/clientes/${clienteId}`);
  voltarCliente(clienteId);
}

/** Aprovar (só admin): salva o formulário e congela os valores. */
export async function aprovarComissaoVenda(clienteId: string, formData: FormData) {
  if (!UUID.test(clienteId)) voltarCliente(clienteId, "Cliente inválido.");
  try {
    await garantirSomenteAdmin();
  } catch {
    voltarCliente(clienteId, "Só administradores aprovam comissões.");
  }
  const por = await emailAtual();
  const admin = createAdminClient();
  const atual = await carregarVenda(clienteId, admin);
  if (atual && "erro" in atual) voltarCliente(clienteId, "Rode a migração 038 no Supabase para usar as comissões.");
  if (atual?.status === "aprovada") voltarCliente(clienteId, "A comissão já está aprovada.");
  const f = lerFormVenda(formData);
  if (!Object.keys(f.quantidades).length) voltarCliente(clienteId, "Informe pelo menos um serviço com quantidade.");
  const { data: cliente } = await admin.from("clientes").select("parceiro_id, responsavel_id").eq("id", clienteId).maybeSingle();
  if (!cliente) voltarCliente(clienteId, "Cliente não encontrado.");
  const [{ tabela }, beneficiarios] = await Promise.all([carregarTabelaPadrao(admin), beneficiariosDoCliente(cliente, admin)]);
  if (!beneficiarios.length) voltarCliente(clienteId, "Este cliente não tem parceiro nem consultor com comissão.");
  const cotacao = f.cotacao ?? (await cotacaoComercial()).valor;
  const calculo = calcularBeneficiarios(f.quantidades, tabela, beneficiarios, f.excluidos, cotacao);
  const snapshot = montarSnapshot(calculo, f.quantidades, cotacao);
  const agora = new Date().toISOString();
  const { error } = await admin.from("comissoes_vendas").upsert(
    {
      cliente_id: clienteId,
      quantidades: f.quantidades,
      origem: atual?.origem ?? "manual",
      status: "aprovada",
      beneficiarios_excluidos: f.excluidos,
      cotacao_brl_por_jpy: cotacao,
      observacao: f.observacao,
      snapshot,
      aprovado_em: agora,
      aprovado_por_email: por,
      updated_at: agora,
      updated_by_email: por,
    },
    { onConflict: "cliente_id" },
  );
  if (error) {
    console.error("Erro ao aprovar comissão:", error.message);
    voltarCliente(clienteId, "Não foi possível aprovar a comissão.");
  }
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm");
  voltarCliente(clienteId);
}

/** Reabrir (só admin): volta para rascunho e sai do resumo do mês. */
export async function reabrirComissaoVenda(clienteId: string) {
  if (!UUID.test(clienteId)) voltarCliente(clienteId, "Cliente inválido.");
  try {
    await garantirSomenteAdmin();
  } catch {
    voltarCliente(clienteId, "Só administradores reabrem comissões.");
  }
  const por = await emailAtual();
  const { error } = await createAdminClient()
    .from("comissoes_vendas")
    .update({ status: "rascunho", snapshot: null, aprovado_em: null, aprovado_por_email: null, updated_at: new Date().toISOString(), updated_by_email: por })
    .eq("cliente_id", clienteId);
  if (error) voltarCliente(clienteId, "Não foi possível reabrir.");
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm");
  voltarCliente(clienteId);
}

// ── /crm/comissoes (só admin) ───────────────────────────────────────
function voltarPagina(msg: { ok?: string; erro?: string }, ancora = ""): never {
  const p = new URLSearchParams();
  if (msg.ok) p.set("ok", msg.ok);
  if (msg.erro) p.set("erro", msg.erro);
  redirect(`/crm/comissoes?${p.toString()}${ancora}`);
}

const numero = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").trim().replace(/\./g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

/** Tabela padrão: campo vazio = volta ao valor do código. */
export async function salvarTabelaComissoes(formData: FormData) {
  await garantirSomenteAdmin();
  const por = await emailAtual();
  const admin = createAdminClient();
  const gravar: { item_id: string; valor_jpy: number; updated_at: string; updated_by_email: string }[] = [];
  const apagar: string[] = [];
  const agora = new Date().toISOString();
  for (const item of ITENS_COMISSAO) {
    const n = numero(formData.get(`v_${item.id}`));
    if (Number.isNaN(n)) voltarPagina({ erro: `Valor inválido em “${item.label}”.` });
    if (n === null || n === item.padraoJPY) apagar.push(item.id);
    else gravar.push({ item_id: item.id, valor_jpy: n, updated_at: agora, updated_by_email: por });
  }
  const atual = await carregarTabelaPadrao(admin);
  if (atual.erro) voltarPagina({ erro: "Rode a migração 038 no Supabase." });
  if (gravar.length) {
    const { error } = await admin.from("comissoes_tabela").upsert(gravar, { onConflict: "item_id" });
    if (error) voltarPagina({ erro: "Não foi possível salvar a tabela." });
  }
  const apagarExistentes = apagar.filter((id) => atual.alteracoes[id]);
  if (apagarExistentes.length) await admin.from("comissoes_tabela").delete().in("item_id", apagarExistentes);
  revalidatePath("/crm/comissoes");
  voltarPagina({ ok: "Tabela de comissões salva. Vale para os rascunhos e as próximas aprovações (as já aprovadas não mudam)." });
}

/** Exceções e margem do seguro de uma empresa parceira ou de um usuário. */
export async function salvarRegrasBeneficiario(chave: string, formData: FormData) {
  await garantirSomenteAdmin();
  const m = /^([eu]):([0-9a-f-]{36})$/i.exec(chave);
  if (!m) voltarPagina({ erro: "Registro inválido." });
  const excecoes: Record<string, number> = {};
  for (const item of ITENS_COMISSAO) {
    const n = numero(formData.get(`x_${item.id}`));
    if (Number.isNaN(n)) voltarPagina({ erro: `Valor inválido em “${item.label}”.` }, `#b-${m[2]}`);
    if (n !== null && isItemComissao(item.id)) excecoes[item.id] = n;
  }
  const mult = numero(formData.get("margem_seguro_mult"));
  if (Number.isNaN(mult) || (mult !== null && (mult < 100 || mult > 1000))) voltarPagina({ erro: "Preço do seguro: use de 100% a 1000% do custo." }, `#b-${m[2]}`);
  const tabela = m[1] === "e" ? "parceiros" : "perfis";
  const { error } = await createAdminClient()
    .from(tabela)
    .update({ comissao_itens: Object.keys(excecoes).length ? excecoes : null, margem_seguro_mult: mult })
    .eq("id", m[2]);
  if (error) {
    console.error("Erro ao salvar regras do beneficiário:", error.message);
    voltarPagina({ erro: "Não foi possível salvar (a migração 038 já rodou?)." });
  }
  revalidatePath("/crm/comissoes");
  voltarPagina({ ok: "Regras salvas." }, `#b-${m[2]}`);
}
