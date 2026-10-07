// Cria a linha "pendente" em `pagamentos` + o link de pagamento da
// Stone/Pagar.me para um cliente já gravado no CRM — mesmo fluxo do JR Pass
// (order_code = id da linha, confirmado pelo webhook genérico em
// app/api/webhooks/pagarme). Extraído em 06/out/2026 para os novos
// self-checkouts opcionais (Hotéis, Transporte Privado, Limousine Bus).
// Nunca lança: qualquer erro é logado e devolve null (o pedido já está
// salvo e o cliente cai no fluxo manual pelo WhatsApp).
import type { SupabaseClient } from "@supabase/supabase-js";
import { criarCheckout, pagarmeConfigurado } from "./client";

export async function criarCheckoutParaCliente(params: {
  supabase: SupabaseClient;
  clienteId: string;
  valorBRL: number;
  itemNome: string;
  itemDescricao: string;
  observacoes: string;
  urlSucesso: string;
  aceitarCartao?: boolean;
  aceitarPix?: boolean;
  rotuloLog: string;
}): Promise<string | null> {
  if (!pagarmeConfigurado() || !(params.valorBRL > 0)) return null;
  try {
    const { data: pagamento, error } = await params.supabase
      .from("pagamentos")
      .insert({
        cliente_id: params.clienteId,
        tipo_pagamento: params.aceitarCartao === false ? "pix" : "cartao_credito",
        valor: Math.round(params.valorBRL * 100) / 100,
        status: "pendente",
        gateway: "pagarme",
        observacoes: params.observacoes,
      })
      .select("id")
      .single();
    if (error || !pagamento) {
      console.error(`Erro ao criar pagamento pendente (${params.rotuloLog}):`, error);
      return null;
    }
    const checkout = await criarCheckout({
      codigoInterno: pagamento.id,
      itemNome: params.itemNome,
      itemDescricao: params.itemDescricao,
      valorTotalBRL: Math.round(params.valorBRL * 100) / 100,
      aceitarCartao: params.aceitarCartao ?? true,
      aceitarPix: params.aceitarPix ?? true,
      urlSucesso: params.urlSucesso,
    });
    await params.supabase
      .from("pagamentos")
      .update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url })
      .eq("id", pagamento.id);
    return checkout.url;
  } catch (erro) {
    console.error(`Erro ao criar checkout Pagar.me (${params.rotuloLog}):`, erro);
    return null;
  }
}
