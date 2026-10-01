import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Pedido de Ajisai Shopping em /produtos/ajisai-shopping — pedido do
// Wilson, 30/set/2026: página no mesmo template do Transporte Privado,
// checkout manual. Comissão de 20% sobre as compras; o lead cai no CRM com
// a tag SELF-SERVICE e a equipe combina lojas e dias pelo WhatsApp.

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
  console.log("[email] (ajisai-shopping-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Ajisai Shopping — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (ajisai-shopping-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (ajisai-shopping-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (ajisai-shopping-selfservice):", err);
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
    const categorias: string[] = Array.isArray(body.categorias)
      ? body.categorias.map((c: unknown) => texto(c, 60)).filter(Boolean).slice(0, 15)
      : [];
    const orcamentoBRL = Number(body.orcamentoBRL) || 0;
    const comissaoPct = Number(body.comissaoPct) || 20;
    const dias: { data?: unknown; cidade?: unknown }[] = Array.isArray(body.dias) ? body.dias.slice(0, 60) : [];
    if (dias.length === 0) {
      return NextResponse.json({ error: "Escolha ao menos um dia de compras." }, { status: 400 });
    }
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const observacoesCliente = texto(body.observacoes, 2000);
    const termosAceitos = Boolean(body.termosAceitos);
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => texto(a, 300)).filter(Boolean).slice(0, 20)
      : [];

    const linhasResumo: [string, string][] = [
      ["Período no Japão", `${dataChegada || "—"} a ${dataPartida || "—"}`],
      ["Pessoas", `${adultos} adulto(s), ${criancas} criança(s)`],
      ["O que procura", categorias.length ? categorias.join(", ") : "Não informado"],
      ["Orçamento de compras (R$)", orcamentoBRL ? `R$ ${orcamentoBRL.toLocaleString("pt-BR")}` : "Não informado"],
      ["Dias de compras", dias.map((d) => `${texto(d.data, 20)} (${texto(d.cidade, 40)})`).join(", ")],
      ["Comissão estimada", `${comissaoPct}% — R$ ${(totalBRL ?? 0).toLocaleString("pt-BR")} (US$ ${totalUSD.toLocaleString("pt-BR")})`],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      ["Forma de pagamento", "A combinar pelo WhatsApp (checkout manual)"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Ajisai Shopping (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Ajisai Shopping (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Ajisai Shopping (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["ajisai_shopping"],
        valor_proposta: totalBRL,
        data_viagem: dataChegada || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (ajisai-shopping-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (ajisai-shopping-selfservice):", erroInteracao);
    }

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Ajisai Shopping:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
