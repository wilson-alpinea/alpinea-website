import type { SupabaseClient } from "@supabase/supabase-js";
import { buscarPtaxIene } from "@/app/lib/cotacaoIenePtaxServidor";
import { servicoDoc } from "@/lib/crm/documentacao";
import { urlPortal } from "@/app/documentacao/processo";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "@/lib/email/templateCliente";
import { enviarEmailDoc, EMAIL_EQUIPE_DOC, URL_SITE } from "./processoPublico";

// Pagamento dos processos de Documentação pela Stone/Pagar.me (Wilson,
// 29/out/2026) — mesmo link de pagamento (lib/pagarme/client.ts) e mesmo
// webhook dos produtos de /produtos. As parcelas ficam em
// documentacao_pagamentos (migração 028); o order_code é o id da parcela.

export type ProcessoPagamento = { id: string; servico: string; etapa: string; valor_total: number | null; valor_moeda: string | null };

/** Visto e pet: 1 parcela (100%). Certificado de Elegibilidade: 2 × 50%. */
export const numeroParcelas = (servico: string) => (servico === "elegibilidade" ? 2 : 1);

/** Parcela que o cliente pode pagar agora (ou null). */
export function parcelaDevida(p: ProcessoPagamento, pagas: number[]): number | null {
  const total = numeroParcelas(p.servico);
  const proxima = [1, 2].find((n) => n <= total && !pagas.includes(n));
  if (!proxima) return null;
  if (proxima === 1) return ["contrato_aceito", "contratado", "documentacao"].includes(p.etapa) ? 1 : null;
  // 2ª parcela do COE: antes da entrada na imigração.
  return ["contratado", "documentacao"].includes(p.etapa) ? 2 : null;
}

/** Valor da parcela em reais — o servidor sempre recalcula (PTAX do dia para ienes). */
export async function valorParcela(p: ProcessoPagamento, parcela: number) {
  const total = Number(p.valor_total) || 0;
  if (!(total > 0)) return null;
  const fracao = 1 / numeroParcelas(p.servico);
  void parcela;
  if (p.valor_moeda === "JPY") {
    const ptax = await buscarPtaxIene();
    const jpy = Math.round(total * fracao);
    return { valorBRL: Math.round(jpy * ptax.brlPorJPY * 100) / 100, valorJPY: jpy, cotacao: ptax.brlPorJPY, fonteCotacao: ptax.fallback ? null : ptax.data };
  }
  return { valorBRL: Math.round(total * fracao * 100) / 100, valorJPY: null, cotacao: null, fonteCotacao: null };
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Chamado pelo webhook da Pagar.me quando o `code` do pedido é uma parcela
 * de documentacao_pagamentos (pedido já reconfirmado na API da Pagar.me).
 * Marca como pago, avança o processo e avisa equipe e cliente. Idempotente.
 */
export async function confirmarPagamentoDoc(
  supabase: SupabaseClient,
  pag: { id: string; processo_id: string; parcela: number; valor_brl: number; status: string },
  info: { pago: boolean; statusGateway: string; pedidoIdGateway: string | null; forma: string | null },
) {
  if (pag.status === "pago") return;
  if (!info.pago) {
    await supabase.from("documentacao_pagamentos").update({ gateway_status: info.statusGateway, gateway_pedido_id: info.pedidoIdGateway }).eq("id", pag.id);
    return;
  }
  const agora = new Date().toISOString();
  const { data: atualizado } = await supabase
    .from("documentacao_pagamentos")
    .update({ status: "pago", pago_em: agora, gateway_status: info.statusGateway, gateway_pedido_id: info.pedidoIdGateway, forma_pagamento: info.forma })
    .eq("id", pag.id)
    .neq("status", "pago")
    .select("id")
    .maybeSingle();
  if (!atualizado) return; // outro reenvio do webhook já processou

  // Outras parcelas pendentes da mesma parcela (links antigos) deixam de valer.
  await supabase.from("documentacao_pagamentos").update({ status: "cancelado" }).eq("processo_id", pag.processo_id).eq("parcela", pag.parcela).eq("status", "pendente");

  const { data: p } = await supabase.from("documentacao_processos").select("id, servico, etapa, nome, email, historico, pago_em, acesso_token").eq("id", pag.processo_id).maybeSingle();
  if (!p) return;
  const forma = info.forma === "pix" ? "Pix" : info.forma === "cartao_credito" ? "cartão" : "Stone";
  const total = numeroParcelas(p.servico);
  const texto = `${total > 1 ? `Parcela ${pag.parcela}/${total}` : "Pagamento"} confirmado pela Stone — ${brl(Number(pag.valor_brl))} (${forma}).`;
  const update: Record<string, unknown> = { updated_at: agora, historico: [...(Array.isArray(p.historico) ? p.historico : []), { em: agora, por: "Stone (automático)", tipo: pag.parcela === 1 && p.etapa === "contrato_aceito" ? "etapa" : "nota", ...(pag.parcela === 1 && p.etapa === "contrato_aceito" ? { de: "contrato_aceito", para: "contratado" } : {}), texto }] };
  if (pag.parcela === 1 && p.etapa === "contrato_aceito") update.etapa = "contratado";
  if (!p.pago_em) update.pago_em = agora;
  await supabase.from("documentacao_processos").update(update).eq("id", p.id);

  const nomeServico = servicoDoc(p.servico).label;
  await enviarEmailDoc({
    para: [...EMAIL_EQUIPE_DOC, "financeiro@ajisaiwork.com.br"],
    assunto: `[DOCUMENTAÇÃO] ${texto.split(" —")[0]} — ${nomeServico} — ${p.nome}`,
    texto: `${texto}\nCliente: ${p.nome}\nPedido Pagar.me: ${info.pedidoIdGateway ?? "—"}\n\nCRM: https://documentos.alpinea.io/crm/documentacao/${p.id}`,
  });
  if (p.email && p.acesso_token) {
    const link = `${URL_SITE}${urlPortal(p.id, p.acesso_token)}`;
    const email: EmailClienteParams = {
      nome: p.nome,
      titulo: `Pagamento confirmado — ${nomeServico}`,
      intro: pag.parcela === 1 ? "Recebemos seu pagamento e o seu processo começou. Você acompanha cada etapa pelo seu link de acesso." : "Recebemos a segunda parcela. Seguimos com a entrada do pedido na imigração.",
      etapas: [{ titulo: "Cadastro" }, { titulo: "Ficha e documentos" }, { titulo: "Análise da equipe" }, { titulo: "Contrato" }, { titulo: "Pagamento", texto }, { titulo: "Processo em andamento", texto: `Acompanhe em ${link}` }],
      etapaAtual: 5,
      status: "Processo em andamento",
      resumo: [["Valor pago", brl(Number(pag.valor_brl))], ["Forma", forma]],
      mensagemWhatsapp: `Olá! Paguei meu processo de ${nomeServico} (${p.nome}) e tenho uma dúvida.`,
      rotuloAndamento: "Andamento do seu processo",
    };
    await enviarEmailDoc({ para: [p.email], assunto: `Pagamento confirmado — ${nomeServico} (Ajisai)`, texto: emailClienteTexto(email), html: emailClienteHtml(email) });
  }
}
