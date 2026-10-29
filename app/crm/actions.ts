"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { garantirAdmin } from "@/lib/crm/acesso";
import { isCanal } from "@/lib/crm/canal";
import { isEstagio, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { isEstagioEntrega, ESTAGIO_ENTREGA_LABEL } from "@/lib/crm/estagiosEntrega";
import type { Estagio, EstagioEntrega } from "@/lib/crm/types";
import { isProdutoPrincipal, isProdutoSecundario } from "@/lib/crm/produtos";
import { isTipoArquivo, TIPO_ARQUIVO_LABEL } from "@/lib/crm/arquivos";
import { lerAndamentoManual, isEtapaManual } from "@/lib/crm/andamentoManual";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/crm/login");
}

function numeroOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  const numero = Number(texto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function textoOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuidOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return UUID.test(texto) ? texto : null;
}

// Origem estruturada do lead (migração 022). Parceiro escolhido força o
// canal "parceiro".
function canalDoFormulario(formData: FormData): { canal?: string | null; canal_detalhe?: string | null } {
  if (!formData.has("canal")) return {};
  const canalBruto = String(formData.get("canal") || "");
  const canal = uuidOuNull(formData.get("parceiro_id")) ? "parceiro" : isCanal(canalBruto) ? canalBruto : null;
  return { canal, canal_detalhe: textoOuNull(formData.get("canal_detalhe"))?.slice(0, 200) ?? null };
}

function produtoPrincipalOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return isProdutoPrincipal(texto) ? texto : null;
}

function produtosSecundarios(formData: FormData) {
  return formData
    .getAll("produto_secundario")
    .map((v) => String(v))
    .filter(isProdutoSecundario);
}

// Registra no histórico do cliente (interacoes) toda vez que o estágio de
// VENDA muda de fato — alimenta tanto o histórico quanto o funil visual.
// dataEvento é a data "oficial" informada pelo usuário (pedido do Wilson,
// 19/set/2026: "falta deixar campo de data obrigatorio ao mudar cada
// etapa") — distinta de created_at, que é só quando o registro foi salvo.
async function registrarMudancaEstagio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clienteId: string,
  novoEstagio: Estagio,
  autorId: string | null,
  dataEvento: string | null,
) {
  const { data: atual } = await supabase
    .from("clientes")
    .select("estagio")
    .eq("id", clienteId)
    .maybeSingle();

  if (!atual || atual.estagio === novoEstagio) return;

  await supabase.from("interacoes").insert({
    cliente_id: clienteId,
    autor_id: autorId,
    tipo: "mudanca_estagio",
    estagio_destino: novoEstagio,
    data_evento: dataEvento,
    conteudo: `Estágio alterado de "${ESTAGIO_LABEL[atual.estagio as Estagio]}" para "${ESTAGIO_LABEL[novoEstagio]}".`,
  });
}

// Mesma ideia, mas para o fluxo paralelo de ENTREGA do serviço (pedido do
// Wilson, 19/set/2026: "um novo fluxograma de entrega abaixo do de
// vendas") — ver EstagioEntrega em lib/crm/types.ts.
async function registrarMudancaEstagioEntrega(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clienteId: string,
  novoEstagio: EstagioEntrega,
  autorId: string | null,
  dataEvento: string | null,
) {
  const { data: atual } = await supabase
    .from("clientes")
    .select("estagio_entrega")
    .eq("id", clienteId)
    .maybeSingle();

  if (!atual) return;

  // A coluna nasce com "roteiro_elaboracao" por padrão. Se a execução nunca
  // teve registro e a equipe escolhe essa mesma etapa, isso é o INÍCIO da
  // execução (card "Execução da viagem", 22/out/2026) — registra com data.
  if (atual.estagio_entrega === novoEstagio) {
    const { count } = await supabase
      .from("interacoes")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .eq("tipo", "mudanca_estagio_entrega");
    if ((count ?? 0) > 0) return;
    await supabase.from("interacoes").insert({
      cliente_id: clienteId,
      autor_id: autorId,
      tipo: "mudanca_estagio_entrega",
      estagio_entrega_destino: novoEstagio,
      data_evento: dataEvento,
      conteudo: `Execução da viagem iniciada em "${ESTAGIO_ENTREGA_LABEL[novoEstagio]}".`,
    });
    return;
  }

  await supabase.from("interacoes").insert({
    cliente_id: clienteId,
    autor_id: autorId,
    tipo: "mudanca_estagio_entrega",
    estagio_entrega_destino: novoEstagio,
    data_evento: dataEvento,
    conteudo: `Etapa de entrega alterada de "${ESTAGIO_ENTREGA_LABEL[atual.estagio_entrega as EstagioEntrega]}" para "${ESTAGIO_ENTREGA_LABEL[novoEstagio]}".`,
  });
}

export async function createCliente(formData: FormData) {
  await garantirAdmin();
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) {
    redirect("/crm/clientes/novo?erro=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome,
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      origem: textoOuNull(formData.get("origem")),
      valor_proposta: numeroOuNull(formData.get("valor_proposta")),
      produto_principal: produtoPrincipalOuNull(formData.get("produto_principal")),
      produto_secundario: produtosSecundarios(formData),
      data_viagem: textoOuNull(formData.get("data_viagem")),
      estagio: "novo_lead",
      responsavel_id: user?.id ?? null,
      observacoes: textoOuNull(formData.get("observacoes")),
      parceiro_id: uuidOuNull(formData.get("parceiro_id")),
      ...canalDoFormulario(formData),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao criar cliente:", error);
    redirect("/crm/clientes/novo?erro=1");
  }

  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
  revalidatePath("/crm/pipeline");
  // ?criado=1 abre a tela de confirmação na ficha (Wilson, 21/out/2026).
  redirect(`/crm/clientes/${data.id}?criado=1`);
}

export async function updateCliente(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const nome = String(formData.get("nome") || "").trim();

  // O estágio (venda) e a etapa de entrega NÃO são mais alterados por este
  // formulário — pedido do Wilson, 19/set/2026 ("falta deixar campo de data
  // obrigatorio ao mudar cada etapa"): mudar de etapa sempre passa pelo
  // EstagioSelect (que exige uma data), nunca pelo "Salvar alterações"
  // genérico, senão a exigência de data seria facilmente contornada.
  const supabase = await createClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      nome: nome || undefined,
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      origem: textoOuNull(formData.get("origem")),
      valor_proposta: numeroOuNull(formData.get("valor_proposta")),
      produto_principal: produtoPrincipalOuNull(formData.get("produto_principal")),
      produto_secundario: produtosSecundarios(formData),
      data_viagem: textoOuNull(formData.get("data_viagem")),
      observacoes: textoOuNull(formData.get("observacoes")),
      ...(formData.has("parceiro_id") ? { parceiro_id: uuidOuNull(formData.get("parceiro_id")) } : {}),
      ...canalDoFormulario(formData),
    })
    .eq("id", clienteId);

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    redirect(`/crm/clientes/${clienteId}?erro=1`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm");
  redirect(`/crm/clientes/${clienteId}`);
}

export async function moveEstagio(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const novoEstagio = String(formData.get("estagio") || "");
  // Data obrigatória — pedido do Wilson, 19/set/2026. O <input required>
  // no EstagioSelect já bloqueia o envio sem data pelo HTML5, mas a action
  // também recusa por segurança (ex.: JS desabilitado, form manipulado).
  const dataEvento = textoOuNull(formData.get("data"));
  if (!isEstagio(novoEstagio) || !dataEvento) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await registrarMudancaEstagio(supabase, clienteId, novoEstagio, user?.id ?? null, dataEvento);

  const { error } = await supabase
    .from("clientes")
    .update({ estagio: novoEstagio })
    .eq("id", clienteId);

  if (error) {
    console.error("Erro ao mover estágio:", error);
  }

  revalidatePath("/crm/pipeline");
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
}

// Análogo a moveEstagio, mas para o fluxograma de ENTREGA (pedido do
// Wilson, 19/set/2026: "um novo fluxograma de entrega abaixo do de
// vendas") — mesma exigência de data obrigatória.
export async function moveEstagioEntrega(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const novoEstagio = String(formData.get("estagio") || "");
  const dataEvento = textoOuNull(formData.get("data"));
  if (!isEstagioEntrega(novoEstagio) || !dataEvento) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await registrarMudancaEstagioEntrega(supabase, clienteId, novoEstagio, user?.id ?? null, dataEvento);

  const { error } = await supabase
    .from("clientes")
    .update({ estagio_entrega: novoEstagio })
    .eq("id", clienteId);

  if (error) {
    console.error("Erro ao mover etapa de entrega:", error);
  }

  revalidatePath("/crm/pipeline");
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
}

export async function addInteracao(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const conteudo = String(formData.get("conteudo") || "").trim();
  if (!conteudo) {
    redirect(`/crm/clientes/${clienteId}?erro=2`);
  }

  const tipo = String(formData.get("tipo") || "nota");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Segunda trava contra duplicidade (Wilson, 22/out/2026): se a mesma
  // interação (mesmo cliente, autor, tipo e texto) foi registrada nos
  // últimos 30 s, não grava de novo — cobre clique duplo, reenvio do
  // formulário e duas abas abertas.
  const limite = new Date(Date.now() - 30_000).toISOString();
  let duplicada = supabase
    .from("interacoes")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", clienteId)
    .eq("tipo", tipo)
    .eq("conteudo", conteudo)
    .gte("created_at", limite);
  duplicada = user?.id ? duplicada.eq("autor_id", user.id) : duplicada.is("autor_id", null);
  const { count: jaExiste } = await duplicada;
  if ((jaExiste ?? 0) > 0) {
    redirect(`/crm/clientes/${clienteId}`);
  }

  const { error } = await supabase.from("interacoes").insert({
    cliente_id: clienteId,
    autor_id: user?.id ?? null,
    tipo,
    conteudo,
  });

  if (error) {
    console.error("Erro ao registrar interação:", error);
    redirect(`/crm/clientes/${clienteId}?erro=2`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  redirect(`/crm/clientes/${clienteId}`);
}

export async function deleteInteracao(clienteId: string, interacaoId: string, formData: FormData) {
  await garantirAdmin();
  void formData;
  const supabase = await createClient();
  const { error } = await supabase.from("interacoes").delete().eq("id", interacaoId);

  if (error) {
    console.error("Erro ao excluir interação:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}

function normalizarUrl(valor: string) {
  const texto = valor.trim();
  if (!texto) return "";
  if (texto.startsWith("http://") || texto.startsWith("https://") || texto.startsWith("/")) {
    return texto;
  }
  return `/${texto}`;
}

export async function addArquivo(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const labelBruto = String(formData.get("label") || "").trim();
  const urlBruta = String(formData.get("url") || "").trim();
  const tipoBruto = String(formData.get("tipo") || "roteiro_draft");
  const tipo = isTipoArquivo(tipoBruto) ? tipoBruto : "roteiro_draft";

  if (!urlBruta) {
    redirect(`/crm/clientes/${clienteId}?erro=3`);
  }

  // Pedido do Wilson, 18/set/2026 ("porque esse campo rotulo existe?"): o
  // rótulo só é necessário pra diferenciar dois arquivos do MESMO tipo
  // (ex.: duas "Proposta" — v1 e v2) — é o texto clicável mostrado no
  // card, o tipo já aparece como selo acima dele. Pra não obrigar a
  // digitar toda vez, se ficar em branco usa o nome do tipo escolhido.
  const label = labelBruto || TIPO_ARQUIVO_LABEL[tipo];

  const supabase = await createClient();
  const { error } = await supabase.from("arquivos_cliente").insert({
    cliente_id: clienteId,
    tipo,
    label,
    url: normalizarUrl(urlBruta),
  });

  if (error) {
    console.error("Erro ao adicionar arquivo:", error);
    redirect(`/crm/clientes/${clienteId}?erro=3`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  redirect(`/crm/clientes/${clienteId}`);
}

export async function deleteArquivo(clienteId: string, arquivoId: string, formData: FormData) {
  await garantirAdmin();
  void formData;
  const supabase = await createClient();
  // Arquivo enviado para o storage: apaga também o arquivo (Wilson, 21/out/2026).
  const { data: registro } = await supabase.from("arquivos_cliente").select("url").eq("id", arquivoId).eq("cliente_id", clienteId).maybeSingle();
  if (registro?.url?.startsWith("storage:")) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    await createAdminClient().storage.from("arquivos-clientes").remove([registro.url.slice("storage:".length)]);
  }
  const { error } = await supabase.from("arquivos_cliente").delete().eq("id", arquivoId);

  if (error) {
    console.error("Erro ao excluir arquivo:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}

export async function deleteClientes(ids: string[]) {
  await garantirAdmin();
  if (!ids || ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().in("id", ids);

  if (error) {
    console.error("Erro ao excluir clientes:", error);
  }

  revalidatePath("/crm/clientes");
  revalidatePath("/crm");
  revalidatePath("/crm/pipeline");
}

// ---------------------------------------------------------------
// Fornecedores
// ---------------------------------------------------------------

// Criar/editar fornecedor: app/crm/fornecedoresActions.ts (salvarFornecedor).

export async function deleteFornecedores(ids: string[]) {
  await garantirAdmin();
  if (!ids || ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("fornecedores").delete().in("id", ids);

  if (error) {
    console.error("Erro ao excluir fornecedores:", error);
  }

  revalidatePath("/crm/fornecedores");
}

// ---------------------------------------------------------------
// Financeiro (pagamentos/parcelas por cliente)
// ---------------------------------------------------------------

// Parcelas, recebimentos, estornos e reembolsos ficam em
// app/crm/financeiroActions.ts (novo Financeiro, 22/out/2026). As ações
// antigas (addPagamento / alternarStatusPagamento / deletePagamento) foram
// removidas: marcar "pago" por seletor não é mais permitido.

// ── Área de Empregos (06/out/2026) — a equipe pode reclassificar o
// candidato (ex.: tirar da lista de eliminados depois de conversar),
// mudar o status da análise e anotar observações. ──
export async function atualizarCandidatura(candidaturaId: string, formData: FormData) {
  await garantirAdmin();
  const { isClassificacao, isStatusCandidatura } = await import("@/lib/crm/empregos");
  const supabase = await createClient();
  const classificacao = String(formData.get("classificacao") ?? "");
  const status = String(formData.get("status") ?? "");
  const observacoes = String(formData.get("observacoes_equipe") ?? "").trim();

  const update: Record<string, unknown> = {
    observacoes_equipe: observacoes || null,
    updated_at: new Date().toISOString(),
  };
  // A classificação agora só muda por reclassificarCandidatura (com registro
  // de quem/quando/motivo). Mantido por compatibilidade com formulários antigos.
  if (isClassificacao(classificacao) && formData.get("permitir_classificacao") === "1") update.classificacao = classificacao;
  if (isStatusCandidatura(status)) update.status = status;

  const { error } = await supabase.from("candidaturas_vagas").update(update).eq("id", candidaturaId);
  if (error) {
    console.error("Erro ao atualizar candidatura:", error);
    redirect(`/crm/empregos/${candidaturaId}?erro=${encodeURIComponent("Não foi possível salvar.")}`);
  }
  revalidatePath("/crm/empregos");
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  redirect(`/crm/empregos/${candidaturaId}?salvo=1`);
}

// Libera a etapa 2 (ficha cadastral) para um candidato abaixo de 80 —
// Wilson, 06/out/2026. O link continua exigindo o token da candidatura.
export async function liberarFichaCandidatura(candidaturaId: string, liberar: boolean) {
  await garantirAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidaturas_vagas")
    .update({ ficha_liberada: liberar, updated_at: new Date().toISOString() })
    .eq("id", candidaturaId);
  if (error) {
    console.error("Erro ao liberar ficha:", error);
    redirect(`/crm/empregos/${candidaturaId}?erro=${encodeURIComponent("Não foi possível alterar a liberação. A migração 016 já rodou?")}`);
  }
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  redirect(`/crm/empregos/${candidaturaId}?salvo=1`);
}

// Agenda da pré-entrevista: app/crm/agendaActions.ts (redesenho 23/out/2026).

// ── Vagas no site — /crm/empregos/vagas (Wilson, 07/out/2026: "link
// interno onde conseguimos rapidamente ativar e desativar as vagas vendo
// elas no formato de lista tick box"). Grava em public.vagas_status
// (migração 018) e revalida as páginas públicas de /empregos. Devolve erro
// em vez de redirecionar porque a lista salva cada checkbox na hora. ──
export async function definirVagasAtivas(vagaIds: string[], ativa: boolean): Promise<{ ok: true; alteradas: number; ignoradas: number } | { ok: false; erro: string }> {
  await garantirAdmin();
  const { VAGAS } = await import("@/app/lib/vagasCatalogo");
  const validos = new Set(VAGAS.map((v) => v.id));
  const ids = vagaIds.filter((id) => validos.has(id));
  if (ids.length === 0) return { ok: false, erro: "Nenhuma vaga válida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessão expirada — entre de novo no CRM." };

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("vagas_status")
    .upsert(ids.map((vaga_id) => ({ vaga_id, ativa, updated_at: agora, updated_by: user.id })), { onConflict: "vaga_id" });
  if (error) {
    console.error("Erro ao salvar vagas_status:", error);
    return { ok: false, erro: "Não foi possível salvar. A migração 018 já rodou no Supabase?" };
  }
  revalidatePath("/empregos", "layout");
  revalidatePath("/crm/empregos/vagas");
  // Uma única gravação (upsert): ou todas as vagas mudam, ou nenhuma.
  return { ok: true, alteradas: ids.length, ignoradas: vagaIds.length - ids.length };
}

// ── Andamento manual da candidatura (Wilson, 15/out/2026) ─────────────
// Avançar etapa e/ou comentar — grava em candidaturas_vagas.andamento_manual
// (migração 020) com data e e-mail de quem fez.
export async function registrarAndamentoCandidatura(candidaturaId: string, formData: FormData) {
  await garantirAdmin();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const por = user?.email ?? "equipe";
  const etapa = String(formData.get("etapa") ?? "");
  const texto = String(formData.get("comentario") ?? "").trim().slice(0, 2000);
  const voltar = (erro?: string) => redirect(`/crm/empregos/${candidaturaId}${erro ? `?erro=${encodeURIComponent(erro)}` : "?salvo=1"}`);
  if (!etapa && !texto) voltar("Escolha uma etapa ou escreva um comentário.");

  const { data: c, error: erroBusca } = await supabase.from("candidaturas_vagas").select("andamento_manual").eq("id", candidaturaId).maybeSingle();
  if (erroBusca || !c) {
    console.error("Erro ao ler andamento:", erroBusca);
    voltar("Não foi possível salvar. A migração 020 (andamento_manual) já rodou no Supabase?");
  }
  const andamento = lerAndamentoManual(c?.andamento_manual);
  const agora = new Date().toISOString();
  if (etapa) {
    if (!isEtapaManual(etapa)) voltar("Etapa inválida.");
    else andamento.etapas[etapa] = { em: agora, por, ...(texto ? { comentario: texto } : {}) };
  }
  // Anotação atribuída a uma etapa (Wilson, 29/out/2026) — ao avançar, vai
  // para a etapa marcada; só comentando, para a etapa escolhida em "etapaNota".
  const etapaNota = String(formData.get("etapaNota") ?? "");
  const etapaDoComentario = etapa && isEtapaManual(etapa) ? etapa : isEtapaManual(etapaNota) ? etapaNota : null;
  if (texto) andamento.comentarios.push({ em: agora, por, texto, ...(etapaDoComentario ? { etapa: etapaDoComentario } : {}) });

  const { error } = await supabase
    .from("candidaturas_vagas")
    .update({ andamento_manual: andamento, updated_at: agora })
    .eq("id", candidaturaId);
  if (error) {
    console.error("Erro ao salvar andamento:", error);
    voltar("Não foi possível salvar. A migração 020 (andamento_manual) já rodou no Supabase?");
  }
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empregos");
  voltar();
}

// Reclassificação manual aprovado ⇄ eliminado (Wilson, 15/out/2026: "deixar
// claro que foi feito manualmente e email de quem fez a alteração, data e
// hora"). Registra em andamento_manual.reclassificacoes.
export async function reclassificarCandidatura(candidaturaId: string, formData: FormData) {
  await garantirAdmin();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const por = user?.email ?? "equipe";
  const para = String(formData.get("para") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim().slice(0, 1000);
  const voltar = (erro?: string) => redirect(`/crm/empregos/${candidaturaId}${erro ? `?erro=${encodeURIComponent(erro)}` : "?salvo=1"}`);
  if (para !== "aprovado" && para !== "eliminado") voltar("Escolha aprovado ou eliminado.");
  if (!motivo) voltar("Escreva o motivo da reclassificação.");

  const { data: c, error: erroBusca } = await supabase
    .from("candidaturas_vagas")
    .select("classificacao, pontuacao, andamento_manual")
    .eq("id", candidaturaId)
    .maybeSingle();
  if (erroBusca || !c) {
    console.error("Erro ao ler candidatura:", erroBusca);
    voltar("Não foi possível salvar. A migração 020 (andamento_manual) já rodou no Supabase?");
  }
  const novaClassificacao = para === "eliminado" ? "eliminado" : (c?.pontuacao ?? 0) >= 80 ? "aprovado_alto" : "aprovado_baixo";
  if (c?.classificacao === novaClassificacao) voltar("O candidato já está nessa classificação.");

  const andamento = lerAndamentoManual(c?.andamento_manual);
  const agora = new Date().toISOString();
  const rotulo = para === "eliminado" ? "Eliminado" : "Aprovado";
  andamento.reclassificacoes.push({ em: agora, por, de: String(c?.classificacao ?? ""), para: novaClassificacao, motivo });
  andamento.comentarios.push({ em: agora, por, texto: `Reclassificado manualmente para ${rotulo}. Motivo: ${motivo}` });

  const { error } = await supabase
    .from("candidaturas_vagas")
    .update({ classificacao: novaClassificacao, andamento_manual: andamento, updated_at: agora })
    .eq("id", candidaturaId);
  if (error) {
    console.error("Erro ao reclassificar:", error);
    voltar("Não foi possível salvar. A migração 020 (andamento_manual) já rodou no Supabase?");
  }
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empregos");
  voltar();
}

// ── Arquivar lead inativo (Wilson, 21/out/2026: "aos admin deixar acesso
// para arquivar leads inativos"). Não apaga nada: só tira o lead do
// pipeline e da lista de clientes (dá para ver e desarquivar depois). ──
export async function arquivarCliente(clienteId: string, arquivar: boolean) {
  const acesso = await garantirAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update(arquivar ? { arquivado_em: new Date().toISOString(), arquivado_por: acesso.userId } : { arquivado_em: null, arquivado_por: null })
    .eq("id", clienteId);
  if (error) {
    console.error("Erro ao arquivar cliente:", error);
    redirect(`/crm/clientes/${clienteId}?erro=1`);
  }
  await supabase.from("interacoes").insert({
    cliente_id: clienteId,
    autor_id: acesso.userId,
    tipo: "nota",
    conteudo: arquivar ? "Lead arquivado (inativo)." : "Lead desarquivado.",
  });
  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm");
  redirect(`/crm/clientes/${clienteId}`);
}

// ── Data prevista de embarque do candidato (migração 021) — aparece no
// portal da empreiteira. ──
export async function salvarEmbarqueCandidatura(candidaturaId: string, formData: FormData) {
  await garantirAdmin();
  const data = String(formData.get("data_embarque_prevista") || "").trim();
  const valor = /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : null;
  const supabase = await createClient();
  const { error } = await supabase.from("candidaturas_vagas").update({ data_embarque_prevista: valor }).eq("id", candidaturaId);
  if (error) console.error("Erro ao salvar data de embarque:", error);
  revalidatePath(`/crm/empregos/${candidaturaId}`);
  revalidatePath("/crm/empreiteira");
}
