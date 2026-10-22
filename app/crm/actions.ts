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
import { isCategoriaFornecedor } from "@/lib/crm/fornecedores";
import { isTipoPagamento, isStatusPagamento } from "@/lib/crm/pagamentos";
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

function categoriaFornecedorOuNull(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  return isCategoriaFornecedor(texto) ? texto : null;
}

export async function createFornecedor(formData: FormData) {
  await garantirAdmin();
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) {
    redirect("/crm/fornecedores/novo?erro=1");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fornecedores")
    .insert({
      nome,
      categoria: categoriaFornecedorOuNull(formData.get("categoria")),
      contato_nome: textoOuNull(formData.get("contato_nome")),
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      cidade: textoOuNull(formData.get("cidade")),
      observacoes: textoOuNull(formData.get("observacoes")),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao criar fornecedor:", error);
    redirect("/crm/fornecedores/novo?erro=1");
  }

  revalidatePath("/crm/fornecedores");
  redirect(`/crm/fornecedores/${data.id}`);
}

export async function updateFornecedor(fornecedorId: string, formData: FormData) {
  await garantirAdmin();
  const nome = String(formData.get("nome") || "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("fornecedores")
    .update({
      nome: nome || undefined,
      categoria: categoriaFornecedorOuNull(formData.get("categoria")),
      contato_nome: textoOuNull(formData.get("contato_nome")),
      email: textoOuNull(formData.get("email")),
      telefone: textoOuNull(formData.get("telefone")),
      cidade: textoOuNull(formData.get("cidade")),
      observacoes: textoOuNull(formData.get("observacoes")),
    })
    .eq("id", fornecedorId);

  if (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    redirect(`/crm/fornecedores/${fornecedorId}?erro=1`);
  }

  revalidatePath(`/crm/fornecedores/${fornecedorId}`);
  revalidatePath("/crm/fornecedores");
  redirect(`/crm/fornecedores/${fornecedorId}`);
}

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

export async function addPagamento(clienteId: string, formData: FormData) {
  await garantirAdmin();
  const valorBruto = numeroOuNull(formData.get("valor"));
  if (!valorBruto) {
    redirect(`/crm/clientes/${clienteId}?erro=4`);
  }

  const tipoBruto = String(formData.get("tipo_pagamento") || "");
  const statusBruto = String(formData.get("status") || "pendente");
  const numeroParcela = Number(formData.get("numero_parcela")) || 1;
  const totalParcelas = Number(formData.get("total_parcelas")) || 1;

  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos").insert({
    cliente_id: clienteId,
    tipo_pagamento: isTipoPagamento(tipoBruto) ? tipoBruto : null,
    numero_parcela: numeroParcela,
    total_parcelas: totalParcelas,
    valor: valorBruto,
    status: isStatusPagamento(statusBruto) ? statusBruto : "pendente",
    data_vencimento: textoOuNull(formData.get("data_vencimento")),
    data_pagamento:
      statusBruto === "pago" ? textoOuNull(formData.get("data_pagamento")) : null,
    observacoes: textoOuNull(formData.get("observacoes")),
  });

  if (error) {
    console.error("Erro ao registrar pagamento:", error);
    redirect(`/crm/clientes/${clienteId}?erro=4`);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  redirect(`/crm/clientes/${clienteId}`);
}

// Alterna rapidamente entre pago/pendente direto na lista, sem precisar
// abrir um formulário — marca a data de pagamento como hoje ao confirmar.
export async function alternarStatusPagamento(
  clienteId: string,
  pagamentoId: string,
  novoStatus: string,
) {
  await garantirAdmin();
  if (!isStatusPagamento(novoStatus)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("pagamentos")
    .update({
      status: novoStatus,
      data_pagamento: novoStatus === "pago" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", pagamentoId);

  if (error) {
    console.error("Erro ao atualizar status do pagamento:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}

export async function deletePagamento(clienteId: string, pagamentoId: string, formData: FormData) {
  await garantirAdmin();
  void formData;
  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos").delete().eq("id", pagamentoId);

  if (error) {
    console.error("Erro ao excluir pagamento:", error);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
}

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

// ── Agenda da pré-entrevista (etapa 4) — /crm/empregos/agenda ─────────
// Wilson, 06/out/2026: "criar uma página para que nós possamos colocar as
// restrições de horário, aí o cliente pode escolher a data baseada nesse
// calendário".
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const voltarAgenda = (erro?: string) =>
  redirect(`/crm/empregos/agenda${erro ? `?erro=${encodeURIComponent(erro)}` : "?salvo=1"}`);

export async function salvarConfigAgenda(formData: FormData) {
  await garantirAdmin();
  const supabase = await createClient();
  const num = (k: string, min: number, max: number, padrao: number) => {
    const n = Math.round(Number(formData.get(k)));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao;
  };
  const link = String(formData.get("link_reuniao") ?? "").trim();
  const { error } = await supabase.from("entrevista_config").upsert({
    id: 1,
    duracao_min: num("duracao_min", 10, 180, 30),
    intervalo_min: num("intervalo_min", 0, 120, 0),
    antecedencia_horas: num("antecedencia_horas", 0, 720, 24),
    horizonte_dias: num("horizonte_dias", 1, 120, 21),
    vagas_por_horario: num("vagas_por_horario", 1, 20, 1),
    link_reuniao: /^https?:\/\//.test(link) ? link : null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Erro ao salvar config da agenda:", error);
    voltarAgenda("Não foi possível salvar. A migração 017 já rodou?");
  }
  revalidatePath("/crm/empregos/agenda");
  voltarAgenda();
}

export async function adicionarJanelaAgenda(formData: FormData) {
  await garantirAdmin();
  const supabase = await createClient();
  const dias = formData.getAll("dia_semana").map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  const inicio = String(formData.get("inicio") ?? "");
  const fim = String(formData.get("fim") ?? "");
  if (!dias.length || !HORA.test(inicio) || !HORA.test(fim) || fim <= inicio) voltarAgenda("Escolha os dias e um horário válido (fim depois do início).");
  const { error } = await supabase.from("entrevista_janelas").insert(dias.map((d) => ({ dia_semana: d, inicio, fim })));
  if (error) {
    console.error("Erro ao adicionar janela:", error);
    voltarAgenda("Não foi possível adicionar.");
  }
  revalidatePath("/crm/empregos/agenda");
  voltarAgenda();
}

export async function removerJanelaAgenda(id: string) {
  await garantirAdmin();
  const supabase = await createClient();
  await supabase.from("entrevista_janelas").delete().eq("id", id);
  revalidatePath("/crm/empregos/agenda");
  voltarAgenda();
}

export async function adicionarBloqueioAgenda(formData: FormData) {
  await garantirAdmin();
  const supabase = await createClient();
  const dataIni = String(formData.get("data") ?? "");
  const dataFim = String(formData.get("data_fim") ?? "") || dataIni;
  const diaInteiro = formData.get("dia_inteiro") === "on";
  const inicio = diaInteiro ? null : String(formData.get("inicio") ?? "");
  const fim = diaInteiro ? null : String(formData.get("fim") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim().slice(0, 200) || null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataIni) || dataFim < dataIni) voltarAgenda("Data inválida.");
  if (!diaInteiro && (!HORA.test(inicio ?? "") || !HORA.test(fim ?? "") || (fim ?? "") <= (inicio ?? ""))) voltarAgenda("Horário do bloqueio inválido.");
  // Período de vários dias vira uma linha por dia (máx. 90).
  const linhas = [];
  for (let d = new Date(`${dataIni}T12:00:00Z`), i = 0; d.toISOString().slice(0, 10) <= dataFim && i < 90; d.setUTCDate(d.getUTCDate() + 1), i++) {
    linhas.push({ data: d.toISOString().slice(0, 10), inicio, fim, motivo });
  }
  const { error } = await supabase.from("entrevista_bloqueios").insert(linhas);
  if (error) {
    console.error("Erro ao adicionar bloqueio:", error);
    voltarAgenda("Não foi possível adicionar o bloqueio.");
  }
  revalidatePath("/crm/empregos/agenda");
  voltarAgenda();
}

export async function removerBloqueioAgenda(id: string) {
  await garantirAdmin();
  const supabase = await createClient();
  await supabase.from("entrevista_bloqueios").delete().eq("id", id);
  revalidatePath("/crm/empregos/agenda");
  voltarAgenda();
}

export async function atualizarStatusEntrevista(id: string, formData: FormData) {
  await garantirAdmin();
  const status = String(formData.get("status") ?? "");
  if (!["agendada", "cancelada", "realizada", "faltou"].includes(status)) voltarAgenda("Status inválido.");
  const supabase = await createClient();
  const { error } = await supabase.from("entrevistas_agendadas").update({ status }).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar entrevista:", error);
    voltarAgenda("Não foi possível atualizar (horário já ocupado?).");
  }
  revalidatePath("/crm/empregos/agenda");
  revalidatePath("/crm/empregos");
  voltarAgenda();
}

// ── Vagas no site — /crm/empregos/vagas (Wilson, 07/out/2026: "link
// interno onde conseguimos rapidamente ativar e desativar as vagas vendo
// elas no formato de lista tick box"). Grava em public.vagas_status
// (migração 018) e revalida as páginas públicas de /empregos. Devolve erro
// em vez de redirecionar porque a lista salva cada checkbox na hora. ──
export async function definirVagasAtivas(vagaIds: string[], ativa: boolean): Promise<{ ok: true } | { ok: false; erro: string }> {
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
  return { ok: true };
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
  if (texto) andamento.comentarios.push({ em: agora, por, texto, ...(etapa && isEtapaManual(etapa) ? { etapa } : {}) });

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
