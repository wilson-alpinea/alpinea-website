import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { criarCheckout, pagarmeConfigurado } from "../../../lib/pagarme/client";

export const runtime = "nodejs";

// Pagamento de TESTE de R$ 1,00 — pedido do Wilson, 30/set/2026, para testar
// o checkout da Stone/Pagar.me nas páginas de JR Pass, Seguro Viagem e
// Câmbio sem comprar um serviço de verdade. O bloco só aparece na página com
// ?teste=1 (ver app/produtos/ProdutoTestePagamento.tsx).
//
// - O valor é fixo aqui no servidor: R$ 1,00. Nada vindo do navegador muda
//   o preço.
// - O lead entra no CRM com origem "TESTE — pagamento R$ 1" e nome
//   prefixado com [TESTE], para nunca ser confundido com um cliente real.
// - Usa o mesmo fluxo dos produtos reais (linha "pendente" em `pagamentos`
//   + link da Pagar.me com order_code = id da linha), então o webhook
//   (app/api/webhooks/pagarme) é testado de ponta a ponta. Câmbio é só Pix,
//   como o produto real.

const VALOR_TESTE_BRL = 1;
const PRODUTOS = {
  jrpass: { nome: "JR Pass", cartao: true, pix: true },
  "seguro-viagem": { nome: "Seguro Viagem", cartao: true, pix: true },
  cambio: { nome: "Câmbio", cartao: false, pix: true },
} as const;
type ProdutoTeste = keyof typeof PRODUTOS;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const produto = String(body.produto || "") as ProdutoTeste;
    if (!(produto in PRODUTOS)) {
      return NextResponse.json({ error: "Produto de teste inválido." }, { status: 400 });
    }
    const nome = String(body.nome || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 200);
    if (nome.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || body.ciente !== true) {
      return NextResponse.json({ error: "Informe nome, e-mail e confirme que é um teste." }, { status: 400 });
    }
    const config = PRODUTOS[produto];
    const descricao = `PRODUTO DE TESTE (R$ 1,00) — página ${config.nome}. Sem relação com os serviços à venda; não gera nenhum serviço.`;

    const supabase = createAdminClient();
    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        nome: `[TESTE] ${nome}`,
        email,
        origem: "TESTE — pagamento R$ 1 (/produtos)",
        produto_principal: "servico_individual",
        produto_secundario: [],
        valor_proposta: VALOR_TESTE_BRL,
        estagio: "novo_lead",
        observacoes: descricao,
      })
      .select("id")
      .single();
    if (erroCliente || !cliente) {
      console.error("Erro ao gravar cliente de teste (pagamento-teste):", erroCliente);
      return NextResponse.json({ error: "Não foi possível registrar o teste." }, { status: 500 });
    }

    if (!pagarmeConfigurado()) {
      return NextResponse.json({ success: true, checkoutUrl: null }, { status: 200 });
    }

    const { data: pagamento, error: erroPagamento } = await supabase
      .from("pagamentos")
      .insert({
        cliente_id: cliente.id,
        tipo_pagamento: config.cartao ? "cartao_credito" : "pix",
        valor: VALOR_TESTE_BRL,
        status: "pendente",
        gateway: "pagarme",
        observacoes: descricao,
      })
      .select("id")
      .single();
    if (erroPagamento || !pagamento) {
      console.error("Erro ao criar pagamento de teste (pagamento-teste):", erroPagamento);
      return NextResponse.json({ error: "Não foi possível criar o pagamento de teste." }, { status: 500 });
    }

    const checkout = await criarCheckout({
      codigoInterno: pagamento.id,
      itemNome: `TESTE — R$ 1,00 (${config.nome})`,
      itemDescricao: "Produto somente para teste do checkout. Sem relação com os serviços à venda no site.",
      valorTotalBRL: VALOR_TESTE_BRL,
      aceitarCartao: config.cartao,
      aceitarPix: config.pix,
      urlSucesso: `${new URL(req.url).origin}/produtos/${produto}?teste=1&pagamento=concluido`,
    });
    await supabase
      .from("pagamentos")
      .update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url })
      .eq("id", pagamento.id);

    return NextResponse.json({ success: true, checkoutUrl: checkout.url }, { status: 200 });
  } catch (error) {
    console.error("Erro no pagamento de teste:", error);
    return NextResponse.json({ error: "Erro ao criar o pagamento de teste." }, { status: 500 });
  }
}
