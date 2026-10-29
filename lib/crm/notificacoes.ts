import type { createClient } from "@/lib/supabase/server";
import { ESTAGIO_LABEL } from "./estagios";
import { ESTAGIO_ENTREGA_LABEL } from "./estagiosEntrega";
import { ehRegistroTeste, ehSelfService } from "./origem";
import type { Estagio, EstagioEntrega } from "./types";

// Notificações do CRM (Wilson, 22/out/2026): novos clientes/propostas,
// propostas enviadas, mudanças de etapa, propostas anexadas e pagamentos.
// Tudo vem de registros existentes; ações feitas pelo próprio usuário não
// viram notificação para ele. "Lidas" = cookie com a data da última leitura
// (por navegador; sem migração de banco).

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const COOKIE_NOTIFICACOES = "crm_notificacoes_lidas_em";
const JANELA_DIAS = 30;

export type Notificacao = {
  id: string;
  tipo: "novo_cliente" | "proposta" | "etapa" | "execucao" | "arquivo_proposta" | "pagamento" | "alerta";
  /** Link do item (cada CRM tem a sua tela de detalhe). */
  href?: string;
  titulo: string;
  detalhe: string | null;
  clienteId: string;
  clienteNome: string;
  quando: string;
  lida: boolean;
};

export async function carregarNotificacoes(
  supabase: Supabase,
  usuarioId: string | null,
  lidasEm: string | null,
): Promise<{ lista: Notificacao[]; naoLidas: number } | { erro: true }> {
  const desde = new Date(Date.now() - JANELA_DIAS * 86400000).toISOString();
  const [rClientes, rInteracoes, rArquivos] = await Promise.all([
    supabase.from("clientes").select("id, nome, origem, responsavel_id, created_at, arquivado_em").order("created_at", { ascending: false }).limit(5000),
    supabase
      .from("interacoes")
      .select("id, cliente_id, tipo, conteudo, autor_id, estagio_destino, estagio_entrega_destino, created_at")
      .in("tipo", ["proposta", "mudanca_estagio", "mudanca_estagio_entrega", "pagamento"])
      .gte("created_at", desde)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("arquivos_cliente").select("id, cliente_id, label, created_at").eq("tipo", "proposta").gte("created_at", desde).order("created_at", { ascending: false }).limit(100),
  ]);
  if (rClientes.error || rInteracoes.error) {
    console.error("Erro ao carregar notificações:", rClientes.error ?? rInteracoes.error);
    return { erro: true };
  }

  const clientes = new Map((rClientes.data ?? []).map((c) => [c.id, c]));
  // Testes e arquivados não geram notificação.
  const valido = (id: string) => {
    const c = clientes.get(id);
    return !!c && !c.arquivado_em && !ehRegistroTeste(c.origem);
  };
  const nome = (id: string) => clientes.get(id)?.nome ?? "Cliente";
  const lista: Omit<Notificacao, "lida">[] = [];

  for (const c of rClientes.data ?? []) {
    if (Date.parse(c.created_at) < Date.parse(desde) || !valido(c.id)) continue;
    if (usuarioId && c.responsavel_id === usuarioId) continue; // cadastrado por mim
    lista.push({
      id: `c-${c.id}`,
      tipo: "novo_cliente",
      titulo: ehSelfService(c.origem) ? "Nova proposta pelo self-service" : "Novo cliente cadastrado",
      detalhe: null,
      clienteId: c.id,
      clienteNome: c.nome,
      quando: c.created_at,
    });
  }

  for (const i of rInteracoes.data ?? []) {
    if (!valido(i.cliente_id)) continue;
    if (usuarioId && i.autor_id === usuarioId) continue;
    const base = { id: `i-${i.id}`, clienteId: i.cliente_id, clienteNome: nome(i.cliente_id), quando: i.created_at };
    if (i.tipo === "proposta") lista.push({ ...base, tipo: "proposta", titulo: "Proposta enviada", detalhe: i.conteudo });
    else if (i.tipo === "mudanca_estagio")
      lista.push({ ...base, tipo: "etapa", titulo: `Etapa comercial: ${ESTAGIO_LABEL[i.estagio_destino as Estagio] ?? i.estagio_destino}`, detalhe: i.conteudo });
    else if (i.tipo === "mudanca_estagio_entrega")
      lista.push({ ...base, tipo: "execucao", titulo: `Execução: ${ESTAGIO_ENTREGA_LABEL[i.estagio_entrega_destino as EstagioEntrega] ?? i.estagio_entrega_destino}`, detalhe: i.conteudo });
    else if (i.tipo === "pagamento") lista.push({ ...base, tipo: "pagamento", titulo: "Pagamento confirmado", detalhe: i.conteudo });
  }

  // Arquivo de proposta anexado (a tabela não guarda autor).
  if (!rArquivos.error) {
    for (const a of rArquivos.data ?? []) {
      if (!valido(a.cliente_id)) continue;
      lista.push({ id: `a-${a.id}`, tipo: "arquivo_proposta", titulo: "Proposta anexada", detalhe: a.label, clienteId: a.cliente_id, clienteNome: nome(a.cliente_id), quando: a.created_at });
    }
  }

  lista.sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando));
  // Sem cookie (primeiro acesso), só os últimos 7 dias contam como não lidos.
  const corte = lidasEm ? Date.parse(lidasEm) : Date.now() - 7 * 86400000;
  const comLeitura = lista.map((n) => ({ ...n, lida: Date.parse(n.quando) <= corte }));
  return { lista: comLeitura.slice(0, 30), naoLidas: comLeitura.filter((n) => !n.lida).length };
}

// ── Sino nos 4 CRMs (Wilson, 29/out/2026: "sino de notificação, botões
// rápidos devem existir nos 4 CRMs") ─────────────────────────────────
// Empregos, Seguro e Documentação: eventos tirados das próprias tabelas.
// Cada CRM tem o seu cookie de "lidas".
export type UnidadeNotificacao = "agencia" | "empregos" | "seguro" | "documentacao" | "cambio";
export const cookieNotificacoes = (u: UnidadeNotificacao) => (u === "agencia" ? COOKIE_NOTIFICACOES : `${COOKIE_NOTIFICACOES}_${u}`);

type Item = Omit<Notificacao, "lida">;
const dentroJanela = (iso: string | null | undefined, desde: string) => !!iso && iso >= desde;

function fecharLista(lista: Item[], lidasEm: string | null) {
  lista.sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando));
  const corte = lidasEm ? Date.parse(lidasEm) : Date.now() - 7 * 86400000;
  const comLeitura = lista.map((n) => ({ ...n, lida: Date.parse(n.quando) <= corte }));
  return { lista: comLeitura.slice(0, 30), naoLidas: comLeitura.filter((n) => !n.lida).length };
}

export async function carregarNotificacoesUnidade(
  supabase: Supabase,
  unidade: Exclude<UnidadeNotificacao, "agencia">,
  lidasEm: string | null,
): Promise<{ lista: Notificacao[]; naoLidas: number } | { erro: true }> {
  const desde = new Date(Date.now() - JANELA_DIAS * 86400000).toISOString();
  const lista: Item[] = [];

  if (unidade === "empregos") {
    const [rc, re] = await Promise.all([
      supabase.from("candidaturas_vagas").select("*").gte("updated_at", desde).order("updated_at", { ascending: false }).limit(300),
      supabase.from("entrevistas_agendadas").select("id, candidatura_id, inicio, created_at").gte("created_at", desde).order("created_at", { ascending: false }).limit(100),
    ]);
    if (rc.error) return { erro: true };
    const nomes = new Map<string, string>();
    for (const c of rc.data ?? []) {
      const nome = `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim() || "Candidato";
      nomes.set(c.id, nome);
      const base = { clienteId: c.id, clienteNome: nome, href: `/crm/empregos/${c.id}` };
      if (dentroJanela(c.created_at, desde)) lista.push({ ...base, id: `cand-${c.id}`, tipo: "novo_cliente", titulo: "Nova candidatura", detalhe: [c.vaga_empresa, c.vaga_titulo].filter(Boolean).join(" — ") || null, quando: c.created_at });
      if (dentroJanela(c.ficha_enviada_em, desde)) lista.push({ ...base, id: `ficha-${c.id}`, tipo: "etapa", titulo: "Ficha cadastral enviada", detalhe: c.vaga_empresa ?? null, quando: c.ficha_enviada_em });
    }
    for (const e of re.data ?? []) {
      const quando = new Date(e.inicio).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      lista.push({ id: `entr-${e.id}`, tipo: "execucao", titulo: "Pré-entrevista agendada", detalhe: quando, clienteId: e.candidatura_id, clienteNome: nomes.get(e.candidatura_id) ?? "Candidato", href: `/crm/empregos/${e.candidatura_id}`, quando: e.created_at });
    }
  }

  if (unidade === "seguro") {
    const r = await supabase.from("seguro_pedidos").select("id, nome, plano, etapa, created_at, pago_em, apolice_recebida_em").gte("updated_at", desde).order("updated_at", { ascending: false }).limit(300);
    if (r.error) return { erro: true };
    for (const p of r.data ?? []) {
      const base = { clienteId: p.id, clienteNome: p.nome, href: `/crm/seguro/${p.id}` };
      if (dentroJanela(p.created_at, desde)) lista.push({ ...base, id: `ped-${p.id}`, tipo: "novo_cliente", titulo: "Novo pedido de seguro", detalhe: p.plano ?? null, quando: p.created_at });
      if (dentroJanela(p.pago_em, desde)) lista.push({ ...base, id: `pago-${p.id}`, tipo: "pagamento", titulo: "Pagamento confirmado — enviar apólice em 24 h", detalhe: p.plano ?? null, quando: p.pago_em });
      if (p.etapa === "pago" && p.pago_em && Date.now() - Date.parse(p.pago_em) > 24 * 3600_000) {
        lista.push({ ...base, id: `atraso-${p.id}`, tipo: "alerta", titulo: "Apólice atrasada (+24 h)", detalhe: p.plano ?? null, quando: new Date(Date.parse(p.pago_em) + 24 * 3600_000).toISOString() });
      }
    }
  }

  // eSIM no CRM "Seguro Viagem & eSIM" (Wilson, 29/out/2026).
  if (unidade === "seguro") {
    const r = await supabase.from("pedidos_esim").select("id, cliente_id, nome_cliente, plano_nome, dias, status, erro, created_at, updated_at").gte("updated_at", desde).order("updated_at", { ascending: false }).limit(200);
    for (const p of r.data ?? []) {
      const base = { clienteId: p.cliente_id, clienteNome: p.nome_cliente, href: "/crm/seguro/esim" };
      const plano = p.plano_nome ?? `eSIM ${p.dias} dias`;
      if (p.status === "pedido_criado") lista.push({ ...base, id: `esim-ok-${p.id}`, tipo: "pagamento", titulo: "eSIM emitido", detalhe: plano, quando: p.updated_at });
      if (p.status === "erro") lista.push({ ...base, id: `esim-erro-${p.id}`, tipo: "alerta", titulo: "Erro na emissão do eSIM", detalhe: p.erro ?? plano, quando: p.updated_at });
    }
  }

  // CRM de Câmbio (Wilson, 29/out/2026): pedidos novos do site.
  if (unidade === "cambio") {
    const r = await supabase.from("clientes").select("id, nome, observacoes, created_at, arquivado_em").contains("produto_secundario", ["cambio"]).gte("created_at", desde).order("created_at", { ascending: false }).limit(200);
    if (r.error) return { erro: true };
    for (const c of r.data ?? []) {
      if (c.arquivado_em) continue;
      const venda = /Venda de ienes/i.test(c.observacoes ?? "");
      lista.push({ id: `camb-${c.id}`, tipo: "novo_cliente", titulo: venda ? "Novo pedido — venda de ienes" : "Novo pedido — compra de ienes", detalhe: null, clienteId: c.id, clienteNome: c.nome, href: `/crm/cambio/${c.id}`, quando: c.created_at });
    }
  }

  if (unidade === "documentacao") {
    const [rp, rg] = await Promise.all([
      supabase.from("documentacao_processos").select("id, nome, servico, created_at, ficha_enviada_em, contrato_aceito_em").gte("updated_at", desde).order("updated_at", { ascending: false }).limit(300),
      supabase.from("documentacao_pagamentos").select("id, processo_id, parcela, valor_brl, status, pago_em").eq("status", "pago").gte("pago_em", desde).limit(200),
    ]);
    if (rp.error) return { erro: true };
    const SERV: Record<string, string> = { visto: "Visto específico", elegibilidade: "Certificado de Elegibilidade", pet: "Exportação de pet" };
    const nomes = new Map<string, string>();
    for (const p of rp.data ?? []) {
      nomes.set(p.id, p.nome);
      const base = { clienteId: p.id, clienteNome: p.nome, href: `/crm/documentacao/${p.id}` };
      if (dentroJanela(p.created_at, desde)) lista.push({ ...base, id: `proc-${p.id}`, tipo: "novo_cliente", titulo: "Novo processo", detalhe: SERV[p.servico] ?? p.servico, quando: p.created_at });
      if (dentroJanela(p.ficha_enviada_em, desde)) lista.push({ ...base, id: `fdoc-${p.id}`, tipo: "etapa", titulo: "Ficha e documentos enviados", detalhe: SERV[p.servico] ?? null, quando: p.ficha_enviada_em });
      if (dentroJanela(p.contrato_aceito_em, desde)) lista.push({ ...base, id: `contr-${p.id}`, tipo: "proposta", titulo: "Contrato aceito", detalhe: SERV[p.servico] ?? null, quando: p.contrato_aceito_em });
    }
    for (const g of rg.data ?? []) {
      lista.push({
        id: `pdoc-${g.id}`,
        tipo: "pagamento",
        titulo: `Pagamento confirmado${g.parcela > 1 ? ` (parcela ${g.parcela})` : ""}`,
        detalhe: Number(g.valor_brl).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        clienteId: g.processo_id,
        clienteNome: nomes.get(g.processo_id) ?? "Processo",
        href: `/crm/documentacao/${g.processo_id}`,
        quando: g.pago_em!,
      });
    }
  }

  return fecharLista(lista, lidasEm);
}
