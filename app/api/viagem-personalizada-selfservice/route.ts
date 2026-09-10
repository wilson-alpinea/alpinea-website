import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export const runtime = "nodejs";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Envia o aviso por e-mail (mesmo padrão de /api/contact e /api/briefing)
// — best effort: se RESEND_API_KEY não estiver configurada ou o envio
// falhar, só loga o erro e segue (o lead já foi gravado no CRM antes
// dessa chamada, que é o registro que não pode se perder).
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
        subject: `Nova simulação self-service — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Erro Resend (viagem-personalizada-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (viagem-personalizada-selfservice):", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!nome || (!email && !whatsapp)) {
      return NextResponse.json(
        { error: "Nome e pelo menos um contato (e-mail ou WhatsApp) são obrigatórios." },
        { status: 400 },
      );
    }

    const dias = Number(body.dias) || 0;
    const pessoas = Number(body.pessoas) || 0;
    const orcamento = Number(body.orcamento) || 0;
    const tipoQuarto = String(body.tipoQuarto || "").trim();
    const categoriaHotel = String(body.categoriaHotel || "").trim();
    const classeAereo = String(body.classeAereo || "").trim();
    const cidades = Array.isArray(body.cidades) ? body.cidades.map(String) : [];
    const valorEstimado = Number(body.valorEstimado) || null;
    const dataViagem = String(body.dataViagem || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();

    const linhasResumo: [string, string][] = [
      ["Orçamento informado", orcamento ? `R$ ${orcamento.toLocaleString("pt-BR")}` : "Não informado"],
      ["Dias", dias ? String(dias) : "Não informado"],
      ["Pessoas", pessoas ? String(pessoas) : "Não informado"],
      ["Tipo de quarto", tipoQuarto || "Não informado"],
      ["Cidades do roteiro", cidades.length ? cidades.join(", ") : "Não informado"],
      ["Data prevista da viagem", dataViagem || "Não informado"],
      ["Categoria de hotel sugerida", categoriaHotel || "Não informado"],
      ["Classe de voo sugerida", classeAereo || "Não informado"],
      ["Valor estimado do pacote", valorEstimado ? `R$ ${valorEstimado.toLocaleString("pt-BR")}` : "Não informado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Nova simulação — Viagem Personalizada (self-service)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email || "Não informado"}`,
      `WhatsApp: ${whatsapp || "Não informado"}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Nova simulação — Viagem Personalizada (self-service)</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email || "Não informado")}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp || "Não informado")}</p>
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
        origem: "Calculadora self-service (/viagem_personalizada_selfservice)",
        produto_principal: "roteiro_personalizado",
        valor_proposta: valorEstimado,
        data_viagem: dataViagem || null,
        estagio: "novo_lead",
        observacoes: resumoTexto,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (viagem-personalizada-selfservice):", erroCliente);
      return NextResponse.json(
        { error: "Não foi possível registrar sua simulação. Tente novamente ou fale pelo WhatsApp." },
        { status: 500 },
      );
    }

    const { error: erroInteracao } = await supabase.from("interacoes").insert({
      cliente_id: cliente.id,
      tipo: "simulacao",
      conteudo: resumoTexto,
    });

    if (erroInteracao) {
      // O lead em si já foi salvo — não falha a requisição por causa do
      // histórico, só loga pra investigar depois.
      console.error("Erro ao gravar interação (viagem-personalizada-selfservice):", erroInteracao);
    }

    await notificarPorEmail({ nome, email, whatsapp, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no formulário de viagem-personalizada-selfservice:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
