import { NextResponse } from "next/server";
import { ROTEIRO_BASE_DIAS, ROTEIRO_PRECO_BASE, ROTEIRO_PRECO_DIA_EXTRA } from "../../lib/precoRoteiro";
import { atribuicaoDaRequisicao } from "../../../lib/crm/atribuicao";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Pedido de Roteiro Personalizado em /produtos/roteiro-personalizado —
// Wilson, 03/nov/2026: página no template novo de /produtos, fechando pelo
// CRM/WhatsApp (sem pagamento no site). Mesmo padrão de
// /api/passagens-selfservice: lead no CRM com a tag SELF-SERVICE.

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
  console.log("[email] (roteiro-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Roteiro Personalizado — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (roteiro-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (roteiro-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (roteiro-selfservice):", err);
  }
}

const texto = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const inteiro = (v: unknown, min: number, max: number) => Math.max(min, Math.min(max, Math.floor(Number(v) || 0)));

// Mesma regra de app/components/PriceCalculator.tsx (recalculada aqui para o
// CRM não depender do valor vindo do navegador).
const BASE_DIAS = ROTEIRO_BASE_DIAS;
const PRECO_BASE = ROTEIRO_PRECO_BASE; // fonte única: app/lib/precoRoteiro.ts
const PRECO_DIA_EXTRA = ROTEIRO_PRECO_DIA_EXTRA;
const PESSOAS_SEM_TAXA = 3;
const TAXA_USD_A_CADA_2 = 80;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = texto(body.nome, 200);
    const email = texto(body.email, 200);
    const whatsapp = texto(body.whatsapp, 40);
    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: "Nome, e-mail e WhatsApp são obrigatórios." }, { status: 400 });
    }
    if (!body.termosAceitos || !body.escopoCiente) {
      return NextResponse.json({ error: "Confirme o escopo do serviço e a Política de Privacidade." }, { status: 400 });
    }

    const dias = inteiro(body.dias, 5, 45);
    const pessoas = inteiro(body.pessoas, 1, 20);
    const dataViagem = /^\d{4}-\d{2}-\d{2}$/.test(String(body.dataViagem ?? "")) ? String(body.dataViagem) : "";
    const cidades = texto(body.cidades, 300);
    const observacoesCliente = texto(body.observacoes, 2000);
    const cotacao = Number(body.cotacao) > 0 ? Number(body.cotacao) : null;

    const baseBRL = PRECO_BASE + Math.max(0, dias - BASE_DIAS) * PRECO_DIA_EXTRA;
    const taxaUSD = Math.ceil(Math.max(0, pessoas - PESSOAS_SEM_TAXA) / 2) * TAXA_USD_A_CADA_2;
    const totalBRL = cotacao ? Math.round((baseBRL + taxaUSD * cotacao) * 100) / 100 : baseBRL;

    const linhasResumo: [string, string][] = [
      ["Produto", "Roteiro Personalizado"],
      ["Dias", String(dias)],
      ["Pessoas", String(pessoas)],
      ["Data prevista", dataViagem || "Não informada"],
      ["Cidades de interesse", cidades || "Não informadas"],
      ["Preço-base", `R$ ${baseBRL.toLocaleString("pt-BR")}`],
      ["Taxa de grupo", taxaUSD ? `US$ ${taxaUSD} (${pessoas} pessoas)` : "Não se aplica"],
      ["Total mostrado ao cliente", `R$ ${totalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${cotacao ? ` (US$ 1 = R$ ${cotacao.toLocaleString("pt-BR")})` : ""}`],
      ["Forma de pagamento", "A combinar pelo WhatsApp"],
      ["Escopo (planejamento; reservas por conta do cliente)", "Confirmado"],
      ["Política de Privacidade", "Aceita"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Roteiro Personalizado (/produtos/roteiro-personalizado)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Roteiro Personalizado</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        ${linhasResumo.map(([label, valor]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(valor)}</p>`).join("\n")}
      </div>
    `.trim();

    const supabase = createAdminClient();
    const atribuicao = await atribuicaoDaRequisicao(req, supabase);
    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        ...atribuicao,
        nome,
        email: email || null,
        telefone: whatsapp || null,
        origem: `${TAG_SELF_SERVICE} — Roteiro Personalizado (/produtos)`,
        produto_principal: "roteiro_personalizado",
        valor_proposta: totalBRL,
        data_viagem: dataViagem || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (roteiro-selfservice):", erroCliente);
      return NextResponse.json({ error: "Não foi possível registrar seu pedido agora. Tente novamente ou fale pelo WhatsApp." }, { status: 500 });
    }

    const { error: erroInteracao } = await supabase.from("interacoes").insert({
      cliente_id: cliente.id,
      tipo: "simulacao",
      conteudo: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
    });
    if (erroInteracao) console.error("Erro ao gravar interação (roteiro-selfservice):", erroInteracao);

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Roteiro Personalizado:", error);
    return NextResponse.json({ error: "Erro interno do servidor. Fale com a Ajisai pelo WhatsApp." }, { status: 500 });
  }
}
