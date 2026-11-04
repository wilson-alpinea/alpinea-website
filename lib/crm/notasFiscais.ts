import { createAdminClient } from "@/lib/supabase/admin";
import { ehRegistroTeste } from "./origem";
import type { Notificacao } from "./notificacoes";

// Nota fiscal de serviço concluído (Wilson, 04/nov/2026): todo serviço que
// passa para "Concluído" gera um alerta fixo nas notificações do CRM até a
// NF ser anexada ali mesmo. Não bloqueia nada; não some ao marcar como lida
// nem pode ser removido da lista. Migração 036.
//
// Serviços cobertos (os que têm etapa de conclusão):
// - Agência: Execução → "Concluída" (clientes.entrega_concluida_em);
// - Seguro viagem: "Concluído" (seguro_pedidos.concluido_em);
// - Documentação: "Concluído" (documentacao_processos.concluido_em).

export type OrigemNf = "agencia" | "seguro" | "documentacao";
export const ORIGENS_NF: OrigemNf[] = ["agencia", "seguro", "documentacao"];
export const isOrigemNf = (v: string): v is OrigemNf => (ORIGENS_NF as string[]).includes(v);

export const BUCKET_NF = "notas-fiscais";
export const LIMITE_NF_MB = 10;
export const TIPOS_NF = ["application/pdf", "application/xml", "text/xml", "image/png", "image/jpeg", "image/webp"];

/** Só serviços concluídos a partir daqui geram alerta (data da migração 036). */
export const NF_ALERTAS_DESDE = "2026-11-04T03:00:00Z";

const SERV_DOC: Record<string, string> = { visto: "Visto específico", elegibilidade: "Certificado de Elegibilidade", pet: "Exportação de pet" };

export type NotaFiscal = { id: string; nome_arquivo: string; created_at: string; created_by_email: string | null };

/** Alertas de NF pendente de uma unidade (vazio se a migração 036 ainda não rodou). */
export async function nfPendentes(unidade: string): Promise<Notificacao[]> {
  if (!isOrigemNf(unidade)) return [];
  try {
    return await carregarPendentes(unidade);
  } catch (e) {
    // Nunca derruba o sino: sem NF pendente nesta carga.
    console.error("Erro ao carregar NFs pendentes:", e);
    return [];
  }
}

async function carregarPendentes(unidade: OrigemNf): Promise<Notificacao[]> {
  const db = createAdminClient();
  let servicos: { id: string; nome: string; detalhe: string | null; concluidoEm: string; href: string }[] = [];

  if (unidade === "agencia") {
    const r = await db
      .from("clientes")
      .select("id, nome, origem, arquivado_em, produto_principal, entrega_concluida_em")
      .eq("estagio_entrega", "concluida")
      .gte("entrega_concluida_em", NF_ALERTAS_DESDE)
      .limit(500);
    if (r.error) return [];
    servicos = (r.data ?? [])
      .filter((c) => !c.arquivado_em && !ehRegistroTeste(c.origem))
      .map((c) => ({ id: c.id, nome: c.nome, detalhe: (c.produto_principal as string | null) ?? null, concluidoEm: c.entrega_concluida_em as string, href: `/crm/clientes/${c.id}` }));
  } else if (unidade === "seguro") {
    const r = await db.from("seguro_pedidos").select("id, nome, plano, concluido_em").eq("etapa", "concluido").gte("concluido_em", NF_ALERTAS_DESDE).limit(500);
    if (r.error) return [];
    servicos = (r.data ?? []).map((p) => ({ id: p.id, nome: p.nome, detalhe: p.plano ?? null, concluidoEm: p.concluido_em as string, href: `/crm/seguro/${p.id}` }));
  } else {
    const r = await db.from("documentacao_processos").select("id, nome, servico, concluido_em").eq("etapa", "concluido").gte("concluido_em", NF_ALERTAS_DESDE).limit(500);
    if (r.error) return [];
    servicos = (r.data ?? []).map((p) => ({ id: p.id, nome: p.nome, detalhe: SERV_DOC[p.servico] ?? p.servico ?? null, concluidoEm: p.concluido_em as string, href: `/crm/documentacao/${p.id}` }));
  }
  if (servicos.length === 0) return [];

  const { data: nfs, error } = await db.from("notas_fiscais").select("registro_id").eq("origem", unidade).in("registro_id", servicos.map((s) => s.id));
  if (error) return [];
  const comNf = new Set((nfs ?? []).map((n) => n.registro_id as string));

  return servicos
    .filter((s) => !comNf.has(s.id))
    .sort((a, b) => a.concluidoEm.localeCompare(b.concluidoEm))
    .map((s) => ({
      id: `nf-${unidade}-${s.id}`,
      tipo: "nota_fiscal" as const,
      titulo: "Anexar nota fiscal — serviço concluído",
      detalhe: s.detalhe,
      clienteId: s.id,
      clienteNome: s.nome,
      href: s.href,
      quando: s.concluidoEm,
      lida: false,
      nf: { origem: unidade, registroId: s.id },
    }));
}

/** NFs já anexadas a um serviço (para a tela de detalhe). */
export async function notasFiscaisDo(origem: OrigemNf, registroId: string): Promise<NotaFiscal[]> {
  const { data, error } = await createAdminClient()
    .from("notas_fiscais")
    .select("id, nome_arquivo, created_at, created_by_email")
    .eq("origem", origem)
    .eq("registro_id", registroId)
    .order("created_at", { ascending: false });
  return error ? [] : ((data ?? []) as NotaFiscal[]);
}
