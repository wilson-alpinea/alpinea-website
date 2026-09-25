import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Self-checkout de Transporte Privado em /produtos — pedido do Wilson,
// 25/set/2026: "enriquecer nossa pagina de motorista privado tanto na
// /produtos quanto calculadora reversa e self-service [...] adicionar
// coaster na /produtos", seguido de "usar template atual igual cambio,
// jr pass, etc" quando viu o modal ainda no formato antigo (calculadora
// + botão avulso de WhatsApp) — confirmado via AskUserQuestion: fluxo
// completo de self-checkout, mesmo padrão de /api/cambio-selfservice e
// /api/seguro-viagem-selfservice (lead cai no CRM com a tag
// SELF-SERVICE, time fecha a logística real pelo WhatsApp; não existe
// gateway de pagamento no site).

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mesmo padrão best-effort de /api/cambio-selfservice: se RESEND_API_KEY
// não estiver configurada ou o envio falhar, só loga — o lead já foi
// gravado no CRM antes dessa chamada.
async function notificarPorEmail(params: {
  nome: string;
  email: string;
  whatsapp: string;
  resumoTexto: string;
  resumoHtml: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
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
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: params.email || undefined,
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Transporte Privado — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Erro Resend (transporte-privado-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (transporte-privado-selfservice):", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Nome, e-mail e WhatsApp são obrigatórios." },
        { status: 400 },
      );
    }

    const veiculo = String(body.veiculo || "").trim();
    const itens = Array.isArray(body.itens) ? body.itens : [];
    const resumo = String(body.resumo || "").trim();

    if (itens.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos uma rota ou tour de transporte privado." },
        { status: 400 },
      );
    }

    const motoristaUSD = Number(body.motoristaUSD) || 0;
    const roteiroUSD = Number(body.roteiroUSD) || 0;
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const formaPagamento = String(body.formaPagamento || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();
    // Confirmação do tickbox de termos e condições — pedido do Wilson,
    // 25/set/2026: "criar termos e condicoes para aceite de contratacao
    // de motorista privado em transporte privado". O botão de enviar já
    // fica desabilitado no front sem o aceite (ver formValido em
    // TransporteModal); aqui só registra a confirmação pro CRM/auditoria.
    const termosAceitos = Boolean(body.termosAceitos);

    const linhasResumo: [string, string][] = [
      ["Veículo", veiculo],
      ["Rotas/tours selecionados", resumo || "Não especificado"],
      ["Motorista privado (US$)", `US$ ${motoristaUSD.toLocaleString("pt-BR")}`],
      ["Roteiro Personalizado (US$)", `US$ ${roteiroUSD.toLocaleString("pt-BR")}`],
      ["Total (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Valor total (referência BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Forma de pagamento escolhida", formaPagamento || "Não escolhida ainda"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Transporte Privado (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Transporte Privado (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Transporte Privado (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["transporte_privado"],
        valor_proposta: totalBRL,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (transporte-privado-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (transporte-privado-selfservice):", erroInteracao);
    }

    await notificarPorEmail({ nome, email, whatsapp, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Transporte Privado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
