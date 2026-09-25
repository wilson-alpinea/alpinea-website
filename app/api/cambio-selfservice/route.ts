import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mesmo padrão best-effort de /api/seguro-viagem-selfservice: se
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Câmbio — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Erro Resend (cambio-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (cambio-selfservice):", err);
  }
}

const DIRECOES_VALIDAS = ["compra", "venda"] as const;
const MOEDAS_VALIDAS = ["BRL", "EUR", "USD"] as const;
const QUANTIDADE_MINIMA_IENES = 100000;

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

    const direcaoBruta = String(body.direcao || "").trim().toLowerCase();
    const direcao = (DIRECOES_VALIDAS as readonly string[]).includes(direcaoBruta)
      ? (direcaoBruta as (typeof DIRECOES_VALIDAS)[number])
      : "compra";

    const cidade = String(body.cidade || "sao-paulo").trim();

    const moedaBruta = String(body.moedaTransacao || "").trim().toUpperCase();
    const moedaTransacao = (MOEDAS_VALIDAS as readonly string[]).includes(moedaBruta) ? moedaBruta : "BRL";

    const quantidadeIenes = Number(body.quantidadeIenes) || 0;
    if (quantidadeIenes < QUANTIDADE_MINIMA_IENES) {
      return NextResponse.json(
        { error: `Quantidade mínima de ¥${QUANTIDADE_MINIMA_IENES.toLocaleString("pt-BR")}.` },
        { status: 400 },
      );
    }

    const totalBRL = Number(body.totalBRL) || null;
    const formaPagamento = String(body.formaPagamento || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();

    const direcaoLabel =
      direcao === "venda" ? "Venda de ienes (cliente devolve à Ajisai)" : "Compra de ienes (cliente retira antes do embarque)";

    const linhasResumo: [string, string][] = [
      ["Direção", direcaoLabel],
      ["Cidade de retirada", cidade],
      ["Quantidade de ienes", `¥${quantidadeIenes.toLocaleString("pt-BR")}`],
      ["Moeda de pagamento escolhida pelo cliente", moedaTransacao],
      ["Valor total (referência BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
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

    await notificarPorEmail({ nome, email, whatsapp, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Câmbio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
