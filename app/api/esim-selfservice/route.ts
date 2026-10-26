import { NextResponse } from "next/server";
import { atribuicaoDaRequisicao } from "../../../lib/crm/atribuicao";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckout, pagarmeConfigurado } from "../../../lib/pagarme/client";
import { faturadoDisponivel, simpremiumConfigurado } from "../../../lib/simpremium/client";
import { buscarOfertasEsim } from "../../../lib/simpremium/ofertas";
import { enviarEmailResend, escapeHtml } from "../../../lib/email/enviar";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "../../../lib/email/templateCliente";
import { diasEsim, faixaParaViagem, MAX_DIAS_ESIM, MAX_ESIMS_POR_PEDIDO } from "../../lib/precoEsim";

export const runtime = "nodejs";

// Self-checkout de eSIM (/produtos/esim) — Wilson, 26/out/2026: compra
// automatizada com a Simpremium, só plano ilimitado, pagamento pela Stone.
//
// Fluxo:
// 1. aqui: valida, RECALCULA o preço a partir do catálogo da Simpremium
//    (o valor do navegador é ignorado), grava o lead no CRM, uma linha por
//    eSIM em `pedidos_esim` (status aguardando_pagamento) e o link da Stone;
// 2. app/api/webhooks/pagarme: pagamento confirmado → lib/simpremium/
//    processarPedidosPagos cria cada eSIM na Simpremium (faturado/invoiced).
//
// Sem Stone configurada não vende (o eSIM só é pedido depois do pagamento
// confirmado; não há fluxo manual aqui).

// Versão dos termos exibidos em app/produtos/esim/page.tsx — atualizar
// junto com TERMOS_ESIM_SIMPREMIUM em app/lib/esimConteudo.ts.
const TERMOS_VERSAO_ESIM = "esim-termos-2026-10-26";

function ipDaRequisicao(req: Request): string | null {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function POST(req: Request) {
  try {
    if (!simpremiumConfigurado() || !pagarmeConfigurado()) {
      return NextResponse.json(
        { error: "A compra online de eSIM está indisponível no momento. Fale com a nossa equipe pelo WhatsApp." },
        { status: 503 },
      );
    }

    const body = await req.json();
    const nome = String(body.nome || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 160);
    const whatsapp = String(body.whatsapp || "").trim().slice(0, 30);
    const cpf = String(body.cpf || "").replace(/\D/g, "").slice(0, 11);
    const observacoes = String(body.observacoes || "").trim().slice(0, 1000);
    const planoId = String(body.planoId || "").trim();
    const dataChegada = String(body.dataChegada || "").trim();
    const dataPartida = String(body.dataPartida || "").trim();
    const quantidade = Math.floor(Number(body.quantidade) || 0);
    const nomesAparelhos: string[] = Array.isArray(body.nomesAparelhos)
      ? body.nomesAparelhos.map((n: unknown) => String(n ?? "").trim().slice(0, 120))
      : [];

    const faltando: string[] = [];
    if (nome.length < 3) faltando.push("nome completo");
    if (!/^\S+@\S+\.\S+$/.test(email)) faltando.push("e-mail válido");
    if (whatsapp.replace(/\D/g, "").length < 10) faltando.push("WhatsApp com DDD");
    if (cpf && cpf.length !== 11) faltando.push("CPF válido (ou deixe em branco)");
    if (!planoId) faltando.push("plano");
    if (quantidade < 1 || quantidade > MAX_ESIMS_POR_PEDIDO) faltando.push(`quantidade de eSIMs (1 a ${MAX_ESIMS_POR_PEDIDO})`);
    if (!body.termosAceitos) faltando.push("aceite dos termos");
    if (!body.aparelhoCompativel) faltando.push("confirmação de aparelho compatível com eSIM e desbloqueado");
    if (faltando.length > 0) {
      return NextResponse.json({ error: `Faltam dados: ${faltando.join(", ")}.` }, { status: 400 });
    }

    const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    const dias = diasEsim(dataChegada, dataPartida);
    if (!dias || dataChegada < hoje) {
      return NextResponse.json({ error: "Confira as datas: a chegada precisa ser hoje ou depois, e a partida no mesmo dia ou depois." }, { status: 400 });
    }
    if (dias > MAX_DIAS_ESIM) {
      return NextResponse.json({ error: `Para mais de ${MAX_DIAS_ESIM} dias, fale com a nossa equipe pelo WhatsApp.` }, { status: 400 });
    }

    // Preço recalculado com o catálogo atual da Simpremium (sem cache).
    const ofertas = await buscarOfertasEsim({ semCache: true });
    const plano = ofertas.planos.find((p) => p.id === planoId);
    if (!plano) {
      return NextResponse.json({ error: "Esse plano não está mais disponível. Recarregue a página e escolha de novo." }, { status: 409 });
    }
    const escolha = faixaParaViagem(plano.faixas.map((f) => ({ minDays: f.minDays, maxDays: f.maxDays, priceUsd: f.netUsd })), dias);
    if (!escolha) {
      return NextResponse.json({ error: "Não há plano para essa quantidade de dias. Fale com a nossa equipe pelo WhatsApp." }, { status: 409 });
    }
    const faixa = plano.faixas.find((f) => f.minDays === escolha.faixa.minDays && f.maxDays === escolha.faixa.maxDays)!;
    const precoUnitBRL = faixa.precoBRL;
    const totalBRL = Math.round(precoUnitBRL * quantidade * 100) / 100;
    const totalUSD = faixa.precoUSD * quantidade;
    const valorNavegador = Number(body.totalBRL) || null;
    if (valorNavegador !== null && Math.abs(valorNavegador - totalBRL) > 1) {
      console.error(`Valor divergente no eSIM (navegador R$ ${valorNavegador} × servidor R$ ${totalBRL}) — usando o do servidor.`);
    }

    // Faturado precisa aceitar o NET do pedido inteiro ANTES de cobrar o
    // cliente — sem isso o cliente pagaria e o eSIM não sairia.
    const faturado = await faturadoDisponivel(faixa.netUsd * quantidade);
    if (!faturado.ok) {
      console.error("[esim] pedido recusado antes do pagamento:", faturado.motivo);
      await enviarEmailResend({
        to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
        subject: "[eSIM] Venda bloqueada — faturado da Simpremium indisponível",
        text: `Um cliente tentou comprar eSIM e a venda foi bloqueada antes do pagamento.\n\nMotivo: ${faturado.motivo}\nCliente: ${nome} — ${email} — ${whatsapp}`,
        html: `<p>Um cliente tentou comprar eSIM e a venda foi bloqueada antes do pagamento.</p><p><strong>Motivo:</strong> ${escapeHtml(faturado.motivo)}<br/><strong>Cliente:</strong> ${escapeHtml(nome)} — ${escapeHtml(email)} — ${escapeHtml(whatsapp)}</p>`,
        rotuloLog: "esim-faturado-bloqueado",
      });
      return NextResponse.json(
        { error: "A compra online de eSIM está indisponível no momento. Fale com a nossa equipe pelo WhatsApp." },
        { status: 503 },
      );
    }

    const nomes = Array.from({ length: quantidade }, (_, i) => nomesAparelhos[i] || (i === 0 ? nome : `${nome} (eSIM ${i + 1})`));
    const linhas: [string, string][] = [
      ["Plano", `${plano.nome} — dados ilimitados`],
      ["Chegada no Japão (início do plano)", dataChegada],
      ["Partida do Japão", dataPartida],
      ["Dias da viagem", String(dias)],
      ["Dias pedidos à Simpremium", String(escolha.diasPedido)],
      ["Quantidade de eSIMs", String(quantidade)],
      ["Usuários dos eSIMs", nomes.join(", ")],
      ["Valor por eSIM", `${brl(precoUnitBRL)} (US$ ${faixa.precoUSD})`],
      ["Total cobrado", `${brl(totalBRL)} (US$ ${totalUSD} · PTAX ${ofertas.cotacao.toFixed(4)}${ofertas.cotacaoFallback ? " — estimativa" : ""})`],
      ["CPF", cpf || "Não informado"],
      ["Pagamento", "Online (Stone) — Pix ou cartão"],
      ["Emissão", "Automática na Simpremium após a confirmação do pagamento"],
      ["Observações do cliente", observacoes || "Nenhuma"],
    ];
    const resumoTexto = [
      "Novo pedido — eSIM (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhas.map(([r, v]) => `${r}: ${v}`),
    ].join("\n");

    const supabase = createAdminClient();
    const atribuicao = await atribuicaoDaRequisicao(req, supabase);
    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        ...atribuicao,
        nome,
        email,
        telefone: whatsapp,
        origem: `${TAG_SELF_SERVICE} — eSIM (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["esim"],
        valor_proposta: totalBRL,
        data_viagem: dataChegada,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
        checkout_ip: ipDaRequisicao(req),
        checkout_user_agent: req.headers.get("user-agent"),
        termos_aceitos: true,
        termos_versao: TERMOS_VERSAO_ESIM,
        termos_aceitos_em: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (esim-selfservice):", erroCliente);
      return NextResponse.json({ error: "Não foi possível registrar seu pedido agora. Tente novamente." }, { status: 500 });
    }

    await supabase.from("interacoes").insert({ cliente_id: cliente.id, tipo: "simulacao", conteudo: `[${TAG_SELF_SERVICE}]\n${resumoTexto}` });

    const { data: pagamento, error: erroPagamento } = await supabase
      .from("pagamentos")
      .insert({
        cliente_id: cliente.id,
        tipo_pagamento: "cartao_credito",
        valor: totalBRL,
        status: "pendente",
        gateway: "pagarme",
        observacoes: `eSIM — ${plano.nome}, ${escolha.diasPedido} dias, ${quantidade} eSIM(s)`,
      })
      .select("id")
      .single();
    if (erroPagamento || !pagamento) {
      console.error("Erro ao criar pagamento pendente (esim-selfservice):", erroPagamento);
      return NextResponse.json({ error: "Não foi possível gerar o pagamento agora. Tente novamente." }, { status: 500 });
    }

    const { error: erroPedidos } = await supabase.from("pedidos_esim").insert(
      nomes.map((nomeAparelho, i) => ({
        cliente_id: cliente.id,
        pagamento_id: pagamento.id,
        indice: i + 1,
        plano_id: plano.id,
        plano_nome: plano.nome,
        dias: escolha.diasPedido,
        data_inicio: dataChegada,
        nome_cliente: nomeAparelho,
        email_cliente: email,
        telefone_cliente: whatsapp,
        cpf_cliente: cpf || null,
        net_usd: faixa.netUsd,
        preco_usd: faixa.precoUSD,
        preco_brl: precoUnitBRL,
        cotacao_usd: ofertas.cotacao,
      })),
    );
    if (erroPedidos) {
      // Sem a linha em pedidos_esim o webhook não saberia o que emitir —
      // não deixa o cliente pagar.
      console.error("Erro ao gravar pedidos_esim (rodou a migração 024?):", erroPedidos);
      await supabase.from("pagamentos").update({ status: "cancelado", observacoes: "Cancelado: falha ao gravar pedidos_esim" }).eq("id", pagamento.id);
      return NextResponse.json({ error: "Não foi possível registrar seu pedido agora. Tente novamente." }, { status: 500 });
    }

    let checkoutUrl: string | null = null;
    try {
      const checkout = await criarCheckout({
        codigoInterno: pagamento.id,
        itemNome: quantidade === 1 ? "eSIM Japão — dados ilimitados" : `${quantidade} eSIMs Japão — dados ilimitados`,
        itemDescricao: `${escolha.diasPedido} dias a partir de ${dataChegada}`,
        valorTotalBRL: totalBRL,
        aceitarCartao: true,
        aceitarPix: true,
        urlSucesso: `${new URL(req.url).origin}/produtos/esim?pagamento=concluido`,
      });
      await supabase.from("pagamentos").update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url }).eq("id", pagamento.id);
      checkoutUrl = checkout.url;
    } catch (erroCheckout) {
      console.error("Erro ao criar checkout Pagar.me (esim-selfservice):", erroCheckout);
    }
    if (!checkoutUrl) {
      await supabase.from("pedidos_esim").update({ status: "cancelado", erro: "Link da Stone não foi criado" }).eq("pagamento_id", pagamento.id);
      return NextResponse.json({ error: "Não foi possível abrir o pagamento agora. Tente novamente em alguns minutos." }, { status: 502 });
    }

    await enviarEmailResend({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
      replyTo: email,
      subject: `[${TAG_SELF_SERVICE}] Novo pedido de eSIM — ${nome}`,
      text: resumoTexto,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>Novo pedido — eSIM (self-checkout)</h2><p><strong>Nome:</strong> ${escapeHtml(nome)}<br/><strong>E-mail:</strong> ${escapeHtml(email)}<br/><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>${linhas
        .map(([r, v]) => `<p><strong>${escapeHtml(r)}:</strong> ${escapeHtml(v)}</p>`)
        .join("")}</div>`,
      rotuloLog: "esim-selfservice",
    });

    const emailCliente: EmailClienteParams = {
      nome,
      titulo: "Recebemos seu pedido de eSIM",
      intro: "Seu pedido está registrado. Assim que a Stone confirmar o pagamento, o seu eSIM é emitido automaticamente.",
      status: "Aguardando confirmação do pagamento",
      etapaAtual: 1,
      etapas: [
        { titulo: "Pedido recebido", texto: `${quantidade} ${quantidade === 1 ? "eSIM" : "eSIMs"} com dados ilimitados no Japão.` },
        { titulo: "Pagamento", texto: "Pix ou cartão pela página segura da Stone." },
        { titulo: "Emissão do eSIM", texto: "Automática após a confirmação do pagamento. As instruções de instalação chegam por e-mail." },
        { titulo: "Conectado no Japão", texto: "Instale antes de embarcar e ative a linha ao pousar." },
      ],
      resumo: [
        ["Plano", `${plano.nome} — ilimitado`],
        ["Período", `${escolha.diasPedido} dias a partir de ${dataChegada}`],
        ["Quantidade", String(quantidade)],
        ["Valor", brl(totalBRL)],
      ],
      mensagemWhatsapp: `Olá! Fiz um pedido de eSIM no site da Ajisai (${nome}) e preciso de ajuda.`,
    };
    const resultado = await enviarEmailResend({
      to: [email],
      subject: "Recebemos seu pedido de eSIM — próximos passos",
      text: emailClienteTexto(emailCliente),
      html: emailClienteHtml(emailCliente),
      rotuloLog: "esim-selfservice cliente",
    });
    await supabase
      .from("clientes")
      .update({ email_confirmacao_enviado: resultado.ok, email_confirmacao_provider_id: resultado.providerId })
      .eq("id", cliente.id);

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (erro) {
    console.error("Erro no self-checkout de eSIM:", erro);
    return NextResponse.json({ error: "Erro interno do servidor. Fale com a Ajisai pelo WhatsApp." }, { status: 500 });
  }
}
