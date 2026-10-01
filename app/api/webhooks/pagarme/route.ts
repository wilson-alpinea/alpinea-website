import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { buscarPedido } from "../../../../lib/pagarme/client";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "../../../../lib/email/templateCliente";

export const runtime = "nodejs";

// Webhook da Stone/Pagar.me — recebe o aviso de que um pedido foi pago
// (evento "order.paid") e confirma o pagamento no CRM. Ver
// lib/pagarme/client.ts pro contexto completo da integração (pedido do
// Wilson, 28/set/2026).
//
// Configuração necessária (Wilson): no painel da Pagar.me, em
// Configurações → Webhooks, cadastrar
// https://www.alpinea.io/api/webhooks/pagarme como destino e marcar pelo
// menos o evento "order.paid".
//
// Segurança — duas camadas:
// 1) O painel da Stone tem uma opção "Habilitar autenticação" na config
//    de Webhooks, que manda um usuário/senha (HTTP Basic Auth) em toda
//    chamada — configurado ali E aqui via PAGARME_WEBHOOK_USER/
//    PAGARME_WEBHOOK_PASSWORD. Confere isso primeiro, antes de ler o
//    corpo — rejeita com 401 se não bater (ou se as variáveis não
//    estiverem configuradas, pra nunca aceitar sem autenticação depois
//    de ativado no painel).
// 2) Mesmo autenticado, nunca confia direto no corpo do webhook pra
//    decidir que algo foi pago — usa o aviso só como "vá conferir o
//    pedido X" e sempre reconfirma o status de verdade com uma chamada
//    de volta pra API da Pagar.me (GET /orders/:id) autenticada com a
//    nossa chave secreta.
//
// Correlação pedido ↔️ cliente: ao criar o checkout (ver
// app/api/jrpass-selfservice → lib/pagarme/client.ts), mandamos pra
// Pagar.me um campo `order_code` igual ao id (uuid) da linha já criada
// em `pagamentos` com status "pendente". A Pagar.me devolve esse valor
// como `code` no pedido (Order) resultante — é esse `code` que lemos
// abaixo pra achar a linha certa — nunca o id do link de checkout (que é
// um recurso diferente do id do pedido resultante). Bug corrigido em
// 28/set/2026: até então, o client.ts mandava o campo com o nome errado
// ("code" em vez de "order_code") na criação do link — a API ignorava
// esse campo desconhecido, o link era criado e o cliente conseguia
// pagar normalmente, mas o pedido resultante ficava sem `code`, e todo
// webhook de pagamento aprovado caía aqui embaixo sem achar
// correlação.

// Compara em tempo constante (evita vazar, por timing, quanto do
// usuário/senha está certo) — só funciona com strings do mesmo
// tamanho, então falha rápido (e seguro) quando o tamanho já difere.
function comparaSeguro(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function autenticacaoValida(req: Request): boolean {
  const usuarioEsperado = process.env.PAGARME_WEBHOOK_USER;
  const senhaEsperada = process.env.PAGARME_WEBHOOK_PASSWORD;
  // Enquanto as variáveis não estiverem configuradas no Vercel, não dá
  // pra exigir — mas assim que existirem, fica obrigatório.
  if (!usuarioEsperado || !senhaEsperada) return true;

  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;

  let decodificado: string;
  try {
    decodificado = Buffer.from(header.slice(6), "base64").toString("utf-8");
  } catch {
    return false;
  }
  const separador = decodificado.indexOf(":");
  if (separador === -1) return false;

  const usuario = decodificado.slice(0, separador);
  const senha = decodificado.slice(separador + 1);
  return comparaSeguro(usuario, usuarioEsperado) && comparaSeguro(senha, senhaEsperada);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function enviarEmail(params: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (webhook-pagarme) RESEND_API_KEY configurada:", Boolean(apiKey));
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando envio de e-mail (webhook pagarme).");
    return;
  }
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (webhook-pagarme) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (webhook pagarme):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao enviar e-mail (webhook pagarme):", err);
  }
}

async function alertarTimeSemCorrelacao(motivo: string, payload: unknown) {
  console.error("Webhook Pagar.me sem correlação:", motivo, JSON.stringify(payload));
  await enviarEmail({
    to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
    subject: "[Pagar.me] Webhook recebido sem conseguir identificar o pedido",
    text: `Motivo: ${motivo}\n\nPayload:\n${JSON.stringify(payload, null, 2)}\n\nConfira manualmente no painel da Pagar.me e no CRM.`,
    html: `<p><strong>Motivo:</strong> ${escapeHtml(motivo)}</p><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre><p>Confira manualmente no painel da Pagar.me e no CRM.</p>`,
  });
}

// Estágios do funil que ainda podem "virar" fechado-ganho automaticamente
// quando o pagamento é confirmado — nunca sobrescreve fechado_perdido
// (pode ter sido reaberto manualmente por outro motivo) nem já
// fechado_ganho (evita duplicar histórico).
const ESTAGIOS_QUE_AVANCAM_COM_PAGAMENTO = new Set([
  "novo_lead",
  "qualificacao",
  "proposta_enviada",
  "negociacao",
]);

export async function POST(req: Request) {
  console.log("[webhook pagarme] chamada recebida");
  if (!autenticacaoValida(req)) {
    console.error("Webhook Pagar.me rejeitado — usuário/senha (Basic Auth) inválidos ou ausentes.");
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  // O formato exato varia entre versões da doc da Pagar.me — tenta os
  // caminhos mais prováveis pro tipo do evento e pro objeto do pedido.
  const tipoEvento = String(body?.type || body?.event || "").trim();
  // Eventos charge.* (ex.: charge.paid, comuns no Pix) trazem o pedido em
  // data.order — aceitos também desde 01/out/2026 (Wilson: compra de teste
  // paga sem nenhum e-mail; se o webhook estiver configurado só com
  // eventos de cobrança, antes eles eram ignorados em silêncio).
  const dadosPedido = tipoEvento.startsWith("charge.")
    ? (body?.data?.order ?? body?.data ?? body)
    : (body?.data ?? body?.order ?? body);
  console.log("[webhook pagarme] evento", tipoEvento || "(sem tipo)", "pedido", dadosPedido?.id, "code", dadosPedido?.code);

  if (!tipoEvento.startsWith("order.") && !tipoEvento.startsWith("charge.")) {
    console.log("[webhook pagarme] evento ignorado:", tipoEvento);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const pedidoIdGateway = String(dadosPedido?.id || "").trim();
  const codigoInterno = String(dadosPedido?.code || "").trim();

  if (!codigoInterno) {
    await alertarTimeSemCorrelacao(
      "Webhook não trouxe o campo 'code' pra achar o pedido correspondente em `pagamentos`.",
      body,
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = createAdminClient();

  const { data: pagamento, error: erroBusca } = await supabase
    .from("pagamentos")
    .select("id, cliente_id, valor, tipo_pagamento, status")
    .eq("id", codigoInterno)
    .maybeSingle();

  if (erroBusca || !pagamento) {
    await alertarTimeSemCorrelacao(
      `Não achamos em 'pagamentos' nenhuma linha com id = ${codigoInterno}.`,
      body,
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Idempotência — a Pagar.me pode reenviar o mesmo webhook (retry).
  if (pagamento.status === "pago") {
    console.log("[webhook pagarme] pagamento já processado:", codigoInterno);
    return NextResponse.json({ received: true, jaProcessado: true }, { status: 200 });
  }

  // Nunca confia só no corpo do webhook — reconfirma direto na API da
  // Pagar.me com a nossa chave secreta antes de marcar como pago.
  let statusConfirmado: string;
  try {
    const resultado = await buscarPedido(pedidoIdGateway || codigoInterno);
    statusConfirmado = resultado.status;
  } catch (err) {
    console.error("Erro ao reconfirmar pedido na Pagar.me (webhook):", err);
    return NextResponse.json({ error: "Não foi possível reconfirmar o pedido." }, { status: 502 });
  }

  const foiPago = statusConfirmado === "paid" || statusConfirmado === "paga";
  console.log("[webhook pagarme] status reconfirmado na Pagar.me:", statusConfirmado, "pagamento", codigoInterno);

  if (!foiPago) {
    // Pedido existe mas ainda não está pago (ex.: pending, canceled,
    // failed) — só registra o status mais recente, sem mexer no funil.
    await supabase
      .from("pagamentos")
      .update({ gateway_status: statusConfirmado, gateway_pedido_id: pedidoIdGateway || null })
      .eq("id", codigoInterno);
    return NextResponse.json({ received: true, status: statusConfirmado }, { status: 200 });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  await supabase
    .from("pagamentos")
    .update({
      status: "pago",
      data_pagamento: hoje,
      gateway_status: statusConfirmado,
      gateway_pedido_id: pedidoIdGateway || null,
    })
    .eq("id", codigoInterno);

  await supabase.from("interacoes").insert({
    cliente_id: pagamento.cliente_id,
    tipo: "pagamento",
    conteudo: `Pagamento confirmado via Pagar.me — R$ ${Number(pagamento.valor).toLocaleString("pt-BR")} (${pagamento.tipo_pagamento || "forma não informada"}). Pedido Pagar.me: ${pedidoIdGateway || "não informado"}.`,
  });

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, email, estagio")
    .eq("id", pagamento.cliente_id)
    .maybeSingle();

  if (cliente && ESTAGIOS_QUE_AVANCAM_COM_PAGAMENTO.has(cliente.estagio)) {
    await supabase.from("clientes").update({ estagio: "fechado_ganho" }).eq("id", cliente.id);
  }

  await enviarEmail({
    to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
    subject: `[Pagar.me] Pagamento confirmado — ${cliente?.nome || pagamento.cliente_id}`,
    text: `Pagamento confirmado via Pagar.me.\n\nCliente: ${cliente?.nome || "—"}\nValor: R$ ${Number(pagamento.valor).toLocaleString("pt-BR")}\nForma: ${pagamento.tipo_pagamento || "—"}\nPedido Pagar.me: ${pedidoIdGateway}`,
    html: `<p><strong>Pagamento confirmado via Pagar.me.</strong></p><p>Cliente: ${escapeHtml(cliente?.nome || "—")}<br/>Valor: R$ ${escapeHtml(Number(pagamento.valor).toLocaleString("pt-BR"))}<br/>Forma: ${escapeHtml(pagamento.tipo_pagamento || "—")}<br/>Pedido Pagar.me: ${escapeHtml(pedidoIdGateway)}</p>`,
  });

  if (cliente?.email) {
    // E-mail do cliente no modelo único com linha do tempo + WhatsApp
    // (lib/email/templateCliente.ts — Wilson, 01/out/2026).
    const valorPago = `R$ ${Number(pagamento.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const emailCliente: EmailClienteParams = {
      nome: cliente.nome,
      titulo: "Pagamento confirmado",
      intro: "Confirmamos o recebimento do seu pagamento. Nossa equipe já foi avisada e segue com os próximos passos do seu pedido.",
      status: "Pagamento confirmado",
      etapaAtual: 2,
      etapas: [
        { titulo: "Pedido recebido" },
        { titulo: "Pagamento confirmado", texto: `${valorPago} via ${pagamento.tipo_pagamento === "pix" ? "Pix" : "Stone"}.` },
        { titulo: "Preparação do seu pedido", texto: "Nossa equipe cuida da emissão e te avisa por aqui e pelo WhatsApp." },
        { titulo: "Pronto para a viagem" },
      ],
      resumo: [
        ["Valor pago", valorPago],
        ["Pedido", pedidoIdGateway || String(pagamento.id)],
      ],
      mensagemWhatsapp: `Olá! Meu pagamento no site da Ajisai foi confirmado (${cliente.nome}) e preciso de ajuda.`,
    };
    await enviarEmail({
      to: [cliente.email],
      subject: "Pagamento confirmado — Ajisai",
      text: emailClienteTexto(emailCliente),
      html: emailClienteHtml(emailCliente),
    });
  }

  return NextResponse.json({ received: true, status: statusConfirmado }, { status: 200 });
}
