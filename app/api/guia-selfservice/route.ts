import { NextResponse } from "next/server";
import { atribuicaoDaRequisicao } from "../../../lib/crm/atribuicao";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckoutParaCliente } from "../../../lib/pagarme/checkoutPedido";
import { buscarCotacaoUSD } from "../../lib/cotacaoUSDServidor";
import { CIDADES_GUIA, ROTEIRO_PRECO_BASE_BRL, calcularPrecoGuia } from "../../lib/precoGuia";

export const runtime = "nodejs";

// Pedido de Guia Turístico em /produtos/guia-turistico — pedido do Wilson,
// 30/set/2026: página no mesmo template do Transporte Privado.
// + Pagamento online pela Stone (Wilson, 29/out/2026): o total é
// RECALCULADO aqui (tipo de guia, pessoas, cidades dos dias, roteiro e
// cotação PTAX do dólar) — o valor enviado pela página só vai para o log. O lead cai no CRM com a tag SELF-SERVICE e a equipe
// confirma o guia e o pagamento pelo WhatsApp.

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function notificarPorEmail(params: {
  nome: string;
  email: string;
  resumoTexto: string;
  resumoHtml: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (guia-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando notificação por e-mail.");
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
        from: "Ajisai <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: params.email || undefined,
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Guia Turístico — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (guia-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (guia-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (guia-selfservice):", err);
  }
}

const texto = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const inteiro = (v: unknown) => Math.max(0, Math.min(99, Math.floor(Number(v) || 0)));

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = texto(body.nome, 200);
    const email = texto(body.email, 200);
    const whatsapp = texto(body.whatsapp, 40);
    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: "Nome, e-mail e WhatsApp são obrigatórios." }, { status: 400 });
    }

    const dataChegada = texto(body.dataChegada, 20);
    const dataPartida = texto(body.dataPartida, 20);
    const adultos = inteiro(body.adultos);
    const criancas = inteiro(body.criancas);
    const tipoChave = body.tipoChave === "estrangeiro" ? "estrangeiro" : body.tipoChave === "brasileiro" ? "brasileiro" : null;
    if (!tipoChave) return NextResponse.json({ error: "Escolha o tipo de guia." }, { status: 400 });
    const tipoGuia = tipoChave === "brasileiro" ? "Guia brasileiro" : "Guia estrangeiro";
    const dias: { data?: unknown; cidade?: unknown }[] = Array.isArray(body.dias) ? body.dias.slice(0, 60) : [];
    if (dias.length === 0) {
      return NextResponse.json({ error: "Escolha ao menos um dia com guia." }, { status: 400 });
    }
    if (adultos < 1) return NextResponse.json({ error: "Informe ao menos 1 adulto." }, { status: 400 });
    const cidades = dias.map((d) => texto(d.cidade, 40));
    if (cidades.some((c) => !CIDADES_GUIA.includes(c))) {
      return NextResponse.json({ error: "Cidade inválida em um dos dias. Recarregue a página e tente de novo." }, { status: 400 });
    }
    const temRoteiro = Boolean(body.temRoteiro);
    const preco = calcularPrecoGuia({ tipo: tipoChave, pessoas: adultos + criancas, cidadesDosDias: cidades });
    const { diariaUSD, guiasPorDia, guiaUSD } = preco;
    const cotacao = await buscarCotacaoUSD();
    const roteiroBRL = temRoteiro ? 0 : ROTEIRO_PRECO_BASE_BRL;
    const roteiroUSD = Math.round(roteiroBRL / cotacao.cotacao);
    const totalBRL = Math.round((guiaUSD * cotacao.cotacao + roteiroBRL) * 100) / 100;
    const totalUSD = Math.round(guiaUSD + roteiroBRL / cotacao.cotacao);
    const totalEnviado = Number(body.totalBRL) || 0;
    if (totalEnviado && Math.abs(totalEnviado - totalBRL) > Math.max(5, totalBRL * 0.02)) {
      console.warn(`Valor divergente no Guia (cliente R$ ${totalEnviado} × servidor R$ ${totalBRL}) — usando o do servidor.`);
    }
    const pagarOnline = body.pagarOnline === true;
    const observacoesCliente = texto(body.observacoes, 2000);
    const termosAceitos = Boolean(body.termosAceitos);
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => texto(a, 300)).filter(Boolean).slice(0, 20)
      : [];

    const linhasResumo: [string, string][] = [
      ["Período no Japão", `${dataChegada || "—"} a ${dataPartida || "—"}`],
      ["Pessoas", `${adultos} adulto(s), ${criancas} criança(s)`],
      ["Guia", `${tipoGuia || "Não informado"} — US$ ${diariaUSD.toLocaleString("pt-BR")}/dia, ${guiasPorDia} guia(s) por dia`],
      ["Dias com guia", dias.map((d) => `${texto(d.data, 20)} (${texto(d.cidade, 40)})`).join(", ")],
      ["Guia (US$)", `US$ ${guiaUSD.toLocaleString("pt-BR")}`],
      ["Roteiro Personalizado", temRoteiro ? "Cliente diz que já contratou" : `Incluído — US$ ${roteiroUSD.toLocaleString("pt-BR")}`],
      ["Total estimado (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Total (BRL, calculado no servidor)", `R$ ${totalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["Cotação do dólar", `R$ ${cotacao.cotacao.toFixed(4)}${cotacao.fallback ? " (ESTIMATIVA — PTAX indisponível, conferir)" : ""}`],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      ["Forma de pagamento", pagarOnline ? "Online pela Stone (Pix ou cartão)" : "A combinar pelo WhatsApp"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Guia Turístico (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Guia Turístico (self-checkout)</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        ${linhasResumo.map(([label, valor]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(valor)}</p>`).join("\n")}
      </div>
    `.trim();

    const supabase = createAdminClient();

    // Parceiro (link de indicação) e canal de origem — Wilson, 21/out/2026.
    const atribuicao = await atribuicaoDaRequisicao(req, supabase);
    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        ...atribuicao,
        nome,
        email: email || null,
        telefone: whatsapp || null,
        origem: `${TAG_SELF_SERVICE} — Guia Turístico (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["guia"],
        valor_proposta: totalBRL,
        data_viagem: dataChegada || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (guia-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (guia-selfservice):", erroInteracao);
    }

    let checkoutUrl: string | null = null;
    if (pagarOnline && totalBRL > 0) {
      checkoutUrl = await criarCheckoutParaCliente({
        supabase,
        clienteId: cliente.id,
        valorBRL: totalBRL,
        itemNome: "Guia Turístico no Japão — Ajisai",
        itemDescricao: `${tipoGuia}, ${dias.length} dia(s), ${dataChegada} a ${dataPartida}`,
        observacoes: `Guia Turístico — ${tipoGuia}, ${dias.length} dia(s)`,
        urlSucesso: `${new URL(req.url).origin}/produtos/guia-turistico?pagamento=concluido`,
        rotuloLog: "guia-selfservice",
      });
    }

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Guia Turístico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
