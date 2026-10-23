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
  tipo: "novo_cliente" | "proposta" | "etapa" | "execucao" | "arquivo_proposta" | "pagamento";
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
