// Emite na Simpremium os eSIMs de um pagamento confirmado — chamado pelo
// webhook da Stone/Pagar.me (app/api/webhooks/pagarme) logo depois de
// marcar o pagamento como pago. Wilson, 26/out/2026.
//
// Idempotência: cada linha de `pedidos_esim` é "reservada" com um UPDATE
// condicional (aguardando_pagamento → processando) antes da chamada à
// Simpremium; um reenvio do webhook não acha mais nada para reservar.
// Se a Simpremium recusar (ex.: 403 = faturado bloqueado/esgotado entre a
// checagem e o pagamento), a linha fica em "erro" e o time recebe um e-mail para emitir
// manualmente no portal — o cliente já pagou, então nada é cancelado aqui.
// Nunca lança.
import type { SupabaseClient } from "@supabase/supabase-js";
import { criarPedidoChip, ErroSimpremium, simpremiumConfigurado } from "./client";
import { enviarEmailResend, escapeHtml } from "../email/enviar";

type LinhaPedido = {
  id: string;
  cliente_id: string;
  indice: number;
  plano_id: string;
  plano_nome: string | null;
  dias: number;
  data_inicio: string;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente: string | null;
  cpf_cliente: string | null;
  tentativas: number;
};

function explicarErro(erro: unknown): string {
  if (erro instanceof ErroSimpremium) {
    if (erro.status === 403) {
      return `Faturado da Simpremium recusou o pedido (403: ${erro.message}). Regularize o faturado e emita manualmente no portal.`;
    }
    return `Simpremium respondeu ${erro.status || "sem status"}: ${erro.message}`;
  }
  return erro instanceof Error ? erro.message : String(erro);
}

export async function processarPedidosEsimPagos(supabase: SupabaseClient, pagamentoId: string): Promise<void> {
  try {
    const { data: reservadas, error } = await supabase
      .from("pedidos_esim")
      .update({ status: "processando", updated_at: new Date().toISOString() })
      .eq("pagamento_id", pagamentoId)
      .eq("status", "aguardando_pagamento")
      .select("id, cliente_id, indice, plano_id, plano_nome, dias, data_inicio, nome_cliente, email_cliente, telefone_cliente, cpf_cliente, tentativas");
    if (error) {
      // Tabela inexistente (migração 024 não rodada) ou outro erro — não é
      // um pagamento de eSIM ou não dá para saber; só registra.
      console.error("[esim] não conseguiu ler pedidos_esim:", error);
      return;
    }
    const linhas = (reservadas ?? []) as LinhaPedido[];
    if (linhas.length === 0) return;

    const resultados: { linha: LinhaPedido; ok: boolean; texto: string }[] = [];
    for (const linha of linhas.sort((a, b) => a.indice - b.indice)) {
      if (!simpremiumConfigurado()) {
        const texto = "Simpremium não configurada no servidor (SIMPREMIUM_API_URL / SIMPREMIUM_API_KEY).";
        await supabase.from("pedidos_esim").update({ status: "erro", erro: texto, updated_at: new Date().toISOString() }).eq("id", linha.id);
        resultados.push({ linha, ok: false, texto });
        continue;
      }
      try {
        const pedido = await criarPedidoChip({
          planId: linha.plano_id,
          days: linha.dias,
          startDate: linha.data_inicio,
          customerName: linha.nome_cliente,
          customerEmail: linha.email_cliente,
          customerPhone: linha.telefone_cliente,
          customerCpf: linha.cpf_cliente,
        });
        await supabase
          .from("pedidos_esim")
          .update({
            status: "pedido_criado",
            simpremium_pedido_id: pedido.id || null,
            simpremium_order_number: pedido.orderNumber || null,
            simpremium_status: pedido.status || null,
            erro: null,
            tentativas: linha.tentativas + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", linha.id);
        resultados.push({
          linha,
          ok: true,
          texto: `Pedido ${pedido.orderNumber || pedido.id} criado (${pedido.status}${pedido.netValueUsd != null ? `, NET US$ ${pedido.netValueUsd}` : ""}).`,
        });
      } catch (erro) {
        const texto = explicarErro(erro);
        console.error(`[esim] falha ao criar pedido na Simpremium (linha ${linha.id}):`, erro);
        await supabase
          .from("pedidos_esim")
          .update({ status: "erro", erro: texto, tentativas: linha.tentativas + 1, updated_at: new Date().toISOString() })
          .eq("id", linha.id);
        resultados.push({ linha, ok: false, texto });
      }
    }

    const clienteId = linhas[0]!.cliente_id;
    const falhas = resultados.filter((r) => !r.ok);
    const corpo = resultados
      .map((r) => `eSIM ${r.linha.indice} (${r.linha.nome_cliente}, ${r.linha.dias} dias a partir de ${r.linha.data_inicio}): ${r.ok ? "OK — " : "ERRO — "}${r.texto}`)
      .join("\n");

    await supabase.from("interacoes").insert({
      cliente_id: clienteId,
      tipo: "nota",
      conteudo: `eSIM — emissão automática na Simpremium após o pagamento:\n${corpo}`,
    });

    await enviarEmailResend({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
      subject: falhas.length
        ? `[eSIM] AÇÃO NECESSÁRIA — ${falhas.length} eSIM(s) não emitido(s) na Simpremium`
        : `[eSIM] Emitido na Simpremium — ${linhas[0]!.nome_cliente}`,
      text: `${falhas.length ? "O cliente JÁ PAGOU. Emita manualmente no portal da Simpremium os itens com ERRO.\n\n" : ""}${corpo}`,
      html: `${falhas.length ? "<p><strong>O cliente JÁ PAGOU.</strong> Emita manualmente no portal da Simpremium os itens com ERRO.</p>" : ""}<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(corpo)}</pre>`,
      rotuloLog: "esim-emissao",
    });
  } catch (erro) {
    console.error("[esim] erro inesperado ao processar pedidos pagos:", erro);
  }
}
