import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Self-checkout de Seguro Viagem em /produtos — pedido do Wilson,
// 25/set/2026: "hoje trabalhamos com 3 empresas Affinity, GTA e MTA, o
// cliente pode escolher qualquer 1 dos 3 [...] ajustar pagina do seguro
// viagem para ter todas as informacoes e campos necessarios para
// self-checkout". Mesmo padrão de /api/viagem-personalizada-selfservice
// (confirmado com o Wilson, 25/set/2026, AskUserQuestion: "self-checkout"
// aqui é o mesmo fluxo já existente — lead cai no CRM com a tag
// SELF-SERVICE, e o time fecha o pagamento de verdade pelo WhatsApp; não
// existe gateway de pagamento no site) — não confirma reserva nem cobra
// nada, só registra o lead com todos os dados já preenchidos.

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mesmo padrão best-effort de /api/viagem-personalizada-selfservice: se
// RESEND_API_KEY não estiver configurada ou o envio falhar, só loga —
// o lead já foi gravado no CRM antes dessa chamada.
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Seguro Viagem — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Erro Resend (seguro-viagem-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (seguro-viagem-selfservice):", err);
  }
}

const SEGURADORAS_VALIDAS = ["affinity", "gta", "mta"] as const;

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

    const seguradoraBruta = String(body.seguradora || "").trim().toLowerCase();
    const seguradora = (SEGURADORAS_VALIDAS as readonly string[]).includes(seguradoraBruta)
      ? seguradoraBruta
      : "";
    if (!seguradora) {
      return NextResponse.json(
        { error: "Escolha uma seguradora (Affinity, GTA ou MTA)." },
        { status: 400 },
      );
    }

    const dataInicio = String(body.dataInicio || "").trim();
    const dataFim = String(body.dataFim || "").trim();
    const dias = Number(body.dias) || 0;
    const idades: number[] = Array.isArray(body.idades)
      ? body.idades.map(Number).filter((n: number) => Number.isFinite(n) && n >= 0 && n <= 120).slice(0, 12)
      : [];
    const valorReferenciaBRL = Number(body.valorReferenciaBRL) || null;
    const observacoesCliente = String(body.observacoes || "").trim();

    const seguradoraLabel: Record<(typeof SEGURADORAS_VALIDAS)[number], string> = {
      affinity: "Affinity",
      gta: "GTA — Global Travel Assistance",
      mta: "MTA — My Travel Assist",
    };

    const linhasResumo: [string, string][] = [
      ["Seguradora escolhida", seguradoraLabel[seguradora as (typeof SEGURADORAS_VALIDAS)[number]]],
      ["Data de início da viagem", dataInicio || "Não informado"],
      ["Data de término da viagem", dataFim || "Não informado"],
      ["Dias de cobertura", dias ? String(dias) : "Não informado"],
      ["Número de viajantes", idades.length ? String(idades.length) : "Não informado"],
      ["Idades dos viajantes", idades.length ? idades.join(", ") : "Não informado"],
      [
        "Valor de referência Ajisai",
        valorReferenciaBRL ? `R$ ${valorReferenciaBRL.toLocaleString("pt-BR")}` : "Não calculado",
      ],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Seguro Viagem (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Seguro Viagem (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Seguro Viagem (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["seguro_viagem"],
        valor_proposta: valorReferenciaBRL,
        data_viagem: dataInicio || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (seguro-viagem-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (seguro-viagem-selfservice):", erroInteracao);
    }

    await notificarPorEmail({ nome, email, whatsapp, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Seguro Viagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
