import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckout, pagarmeConfigurado } from "../../../lib/pagarme/client";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "../../../lib/email/templateCliente";
import { cidadeCambioIeneValida, CIDADES_CAMBIO_IENE } from "../../lib/cambioIene";
import { buscarCotacaoIene } from "../../lib/cotacaoIeneServidor";
import { CAMBIO_IENES_MINIMO_PUBLICO, calcularPrecoCambioIene } from "../../lib/precoCambioIene";

export const runtime = "nodejs";

// Self-checkout de Câmbio em /produtos — pedido do Wilson, 25/set/2026:
// "vamos trabalhar agora na página de câmbio [...] desenvolver um
// algoritmo que baseado na escolha da cidade da pessoa, o sistema faz uma
// busca em tempo real em sites como melhores câmbios, etc e adicionar uma
// margem de 20% sobre o valor e já deixa o pedido pronto para checkout
// [...] deixar disponivel tanto compra quanto venda de iene". Mesmo padrão
// de /api/seguro-viagem-selfservice (confirmado com o Wilson,
// 25/set/2026, AskUserQuestion: "self-checkout" aqui é o mesmo fluxo já
// existente — lead cai no CRM com a tag SELF-SERVICE, e o time fecha o
// câmbio de verdade pelo WhatsApp; não existe gateway de pagamento no
// site) — não confirma pagamento nem entrega, só registra o lead com
// todos os dados já preenchidos.
//
// ATUALIZAÇÃO 29/set/2026 — Câmbio ganhou página própria
// (/produtos/cambio) com pagamento de verdade, no mesmo padrão do JR Pass
// e do Seguro Viagem. Regras do Wilson nesta data: "cambio só tem PIX" e
// "no caso de nós comprarmos o iene do cliente é fluxo manual". Então:
// - COMPRA de ienes (cliente paga): o valor é RECALCULADO aqui no
//   servidor (cotação buscada de novo + app/lib/precoCambioIene.ts — o
//   valor do navegador é ignorado) e, com PAGARME_SECRET_KEY configurada
//   e cotação real (não fallback), vira um link Pix-only da Stone
//   (`checkoutUrl`).
// - VENDA de ienes (Ajisai paga o cliente): nunca gera cobrança — só lead
//   no CRM; a equipe confere os ienes e paga via Pix manualmente.
// - Evidências de checkout (IP, user-agent, nome de quem paga) nas mesmas
//   colunas de `clientes` usadas pelo JR Pass; sem termos e condições
//   (decisão do Wilson) — termos_aceitos fica vazio.
// - E-mail de confirmação pro cliente, como nos outros produtos.

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Envio best-effort via Resend — nunca derruba o pedido (o lead já foi
// gravado no CRM antes).
async function enviarEmail(params: {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; providerId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (cambio-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando envio de e-mail (cambio-selfservice).");
    return { ok: false, providerId: null };
  }
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: params.to,
        reply_to: params.replyTo || undefined,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });
    const textoCru = await resendResponse.text().catch(() => "");
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (cambio-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (cambio-selfservice):", textoCru || "(corpo vazio)");
      return { ok: false, providerId: null };
    }
    let dados: Record<string, unknown> = {};
    try {
      dados = textoCru ? (JSON.parse(textoCru) as Record<string, unknown>) : {};
    } catch {
      dados = {};
    }
    return { ok: true, providerId: typeof dados.id === "string" ? dados.id : null };
  } catch (err) {
    console.error("Erro ao enviar e-mail (cambio-selfservice):", err);
    return { ok: false, providerId: null };
  }
}

function extrairIpDaRequisicao(req: Request): string | null {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

const DIRECOES_VALIDAS = ["compra", "venda"] as const;
const MOEDAS_VALIDAS = ["BRL", "EUR", "USD"] as const;
const QUANTIDADE_MINIMA_IENES = CAMBIO_IENES_MINIMO_PUBLICO;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const nomeComprador = String(body.nomeComprador || "").trim();
    const email = String(body.email || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Nome, e-mail e WhatsApp são obrigatórios." },
        { status: 400 },
      );
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const direcaoBruta = String(body.direcao || "").trim().toLowerCase();
    const direcao = (DIRECOES_VALIDAS as readonly string[]).includes(direcaoBruta)
      ? (direcaoBruta as (typeof DIRECOES_VALIDAS)[number])
      : "compra";

    const cidadeBruta = String(body.cidade || "sao-paulo").trim();
    const cidade = cidadeCambioIeneValida(cidadeBruta) ? cidadeBruta : "sao-paulo";
    const cidadeNome = CIDADES_CAMBIO_IENE.find((c) => c.slug === cidade)?.nome ?? cidade;

    const moedaBruta = String(body.moedaTransacao || "").trim().toUpperCase();
    const moedaTransacao = (MOEDAS_VALIDAS as readonly string[]).includes(moedaBruta) ? moedaBruta : "BRL";

    const quantidadeIenes = Number(body.quantidadeIenes) || 0;
    if (quantidadeIenes < QUANTIDADE_MINIMA_IENES) {
      return NextResponse.json(
        { error: `Quantidade mínima de ¥${QUANTIDADE_MINIMA_IENES.toLocaleString("pt-BR")}.` },
        { status: 400 },
      );
    }

    // Valor recalculado no servidor — é ESTE que vale (cobrança na compra,
    // referência pro pagamento manual na venda). O do navegador só é
    // comparado, pra auditoria.
    const cotacao = await buscarCotacaoIene(cidade, direcao);
    const preco = calcularPrecoCambioIene({
      cotacaoRuaBRLporJPY: cotacao.cotacaoBRLPorJPY,
      direcao,
      cidade,
      quantidadeIenes,
    });
    const totalBRL = preco.totalBRL;
    const totalEnviadoPeloCliente = Number(body.totalBRL) || null;
    if (totalEnviadoPeloCliente !== null && Math.abs(totalEnviadoPeloCliente - totalBRL) > 1) {
      console.error(
        `Valor divergente no Câmbio (cliente R$ ${totalEnviadoPeloCliente} × servidor R$ ${totalBRL}) — usando o do servidor.`,
      );
    }
    const formaPagamento = String(body.formaPagamento || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();

    const direcaoLabel =
      direcao === "venda" ? "Venda de ienes (cliente devolve à Ajisai)" : "Compra de ienes (cliente retira antes do embarque)";

    const linhasResumo: [string, string][] = [
      ["Direção", direcaoLabel],
      ["Cidade", cidadeNome],
      ["Quantidade de ienes", `¥${quantidadeIenes.toLocaleString("pt-BR")}`],
      ["Moeda", moedaTransacao],
      [
        direcao === "compra" ? "Cliente paga (calculado no servidor)" : "Ajisai paga ao cliente via Pix (calculado no servidor)",
        `R$ ${totalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ],
      [
        "Cotação usada",
        `R$ ${preco.cotacaoFinalBRLporJPY.toFixed(4)} por iene${cotacao.fallback ? " (ESTIMATIVA — fonte indisponível, confirmar antes)" : ""}`,
      ],
      ["Nome de quem paga (se diferente)", nomeComprador || "Mesmo que o cliente"],
      ["Forma de pagamento escolhida", formaPagamento || "Não escolhida ainda"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Câmbio (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Câmbio (self-checkout)</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        ${linhasResumo.map(([label, valor]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(valor)}</p>`).join("\n")}
      </div>
    `.trim();

    const supabase = createAdminClient();

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        nome,
        email: email || null,
        telefone: whatsapp || null,
        origem: `${TAG_SELF_SERVICE} — Câmbio (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["cambio"],
        valor_proposta: totalBRL,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
        nome_comprador: nomeComprador || null,
        checkout_ip: extrairIpDaRequisicao(req),
        checkout_user_agent: req.headers.get("user-agent"),
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (cambio-selfservice):", erroCliente);
      return NextResponse.json(
        { error: "Não foi possível registrar seu pedido agora. Tente novamente ou fale pelo WhatsApp." },
        { status: 500 },
      );
    }

    const { error: erroInteracao } = await supabase.from("interacoes").insert({
      cliente_id: cliente.id,
      tipo: "simulacao",
      conteudo: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
    });

    if (erroInteracao) {
      console.error("Erro ao gravar interação (cambio-selfservice):", erroInteracao);
    }

    // Pix pela Stone — só na COMPRA, com cotação real (nunca cobra em cima
    // de estimativa) e integração configurada. Venda é sempre manual.
    let checkoutUrl: string | null = null;
    if (direcao === "compra" && !cotacao.fallback && pagarmeConfigurado() && totalBRL > 0) {
      try {
        const { data: pagamentoPendente, error: erroPagamento } = await supabase
          .from("pagamentos")
          .insert({
            cliente_id: cliente.id,
            tipo_pagamento: "pix",
            valor: totalBRL,
            status: "pendente",
            gateway: "pagarme",
            observacoes: `Câmbio — compra de ¥${quantidadeIenes.toLocaleString("pt-BR")} (${cidadeNome})`,
          })
          .select("id")
          .single();
        if (erroPagamento || !pagamentoPendente) {
          console.error("Erro ao criar linha de pagamento pendente (cambio-selfservice):", erroPagamento);
        } else {
          const checkout = await criarCheckout({
            codigoInterno: pagamentoPendente.id,
            itemNome: `Câmbio — ¥${quantidadeIenes.toLocaleString("pt-BR")}`,
            itemDescricao: `Compra de ienes em espécie — ${cidadeNome}`,
            valorTotalBRL: totalBRL,
            aceitarCartao: false,
            aceitarPix: true,
            // Botão "voltar para a loja" da página da Stone volta para o site
            // (Wilson, 01/out/2026).
            urlSucesso: `${new URL(req.url).origin}/produtos/cambio?pagamento=concluido`,
          });
          await supabase
            .from("pagamentos")
            .update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url })
            .eq("id", pagamentoPendente.id);
          checkoutUrl = checkout.url;
        }
      } catch (erroCheckout) {
        console.error("Erro ao criar checkout Pagar.me (cambio-selfservice):", erroCheckout);
      }
    }

    await enviarEmail({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
      replyTo: email || undefined,
      subject: `[${TAG_SELF_SERVICE}] Novo pedido de Câmbio (${direcao}) — ${nome}`,
      text: resumoTexto,
      html: resumoHtml,
    });

    const valorFormatado = `R$ ${totalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    // E-mail do cliente no modelo único com linha do tempo + WhatsApp
    // (lib/email/templateCliente.ts — Wilson, 01/out/2026).
    const ienesTexto = `¥${quantidadeIenes.toLocaleString("pt-BR")}`;
    const emailCliente: EmailClienteParams =
      direcao === "compra"
        ? {
            nome,
            titulo: "Recebemos seu pedido de câmbio",
            intro: checkoutUrl
              ? "Seu pedido está registrado. Assim que a Stone confirmar o Pix, combinamos a entrega dos ienes."
              : "Seu pedido está registrado. Nossa equipe envia o Pix pelo WhatsApp e por e-mail.",
            status: "Aguardando confirmação do pagamento",
            etapaAtual: 1,
            etapas: [
              { titulo: "Pedido recebido", texto: `Compra de ${ienesTexto}.` },
              {
                titulo: "Pagamento via Pix",
                texto: checkoutUrl ? `Pix de ${valorFormatado} pela página segura da Stone.` : `Enviamos o Pix de ${valorFormatado} pelo WhatsApp e por e-mail.`,
              },
              { titulo: "Entrega dos ienes", texto: `Combinamos pelo WhatsApp a data e o local de entrega em ${cidadeNome}.` },
            ],
            resumo: [
              ["Ienes", ienesTexto],
              ["Valor", valorFormatado],
              ["Retirada", cidadeNome],
            ],
            mensagemWhatsapp: `Olá! Fiz um pedido de câmbio no site da Ajisai (${nome}) e preciso de ajuda.`,
          }
        : {
            nome,
            titulo: "Recebemos seu pedido de câmbio",
            intro: "Seu pedido está registrado. Vamos combinar pelo WhatsApp onde e quando você entrega os ienes.",
            status: "Aguardando a entrega dos ienes",
            etapaAtual: 1,
            etapas: [
              { titulo: "Pedido recebido", texto: `Venda de ${ienesTexto}.` },
              { titulo: "Entrega dos ienes", texto: `Combinamos pelo WhatsApp o local e o horário em ${cidadeNome}.` },
              { titulo: "Pix para você", texto: `Depois de conferir os ienes, fazemos o Pix (valor estimado: ${valorFormatado}).` },
            ],
            resumo: [
              ["Ienes", ienesTexto],
              ["Valor estimado", valorFormatado],
              ["Cidade", cidadeNome],
            ],
            mensagemWhatsapp: `Olá! Fiz um pedido de câmbio no site da Ajisai (${nome}) e preciso de ajuda.`,
          };
    const textoCliente = emailClienteTexto(emailCliente);
    const htmlCliente = emailClienteHtml(emailCliente);
    const resultadoEmailCliente = await enviarEmail({
      to: [email],
      subject: "Recebemos seu pedido de câmbio — próximos passos",
      text: textoCliente,
      html: htmlCliente,
    });
    const { error: erroAtualizarEmail } = await supabase
      .from("clientes")
      .update({
        email_confirmacao_enviado: resultadoEmailCliente.ok,
        email_confirmacao_provider_id: resultadoEmailCliente.providerId,
      })
      .eq("id", cliente.id);
    if (erroAtualizarEmail) {
      console.error("Erro ao registrar histórico do e-mail de confirmação (cambio-selfservice):", erroAtualizarEmail);
    }

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Câmbio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
