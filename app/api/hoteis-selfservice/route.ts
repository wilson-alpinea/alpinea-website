import { NextResponse } from "next/server";
import { criarCheckoutParaCliente } from "../../../lib/pagarme/checkoutPedido";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Pedido de Hotéis em /produtos/hoteis — pedido do Wilson, 30/set/2026:
// página no mesmo template do Transporte Privado, com checkout manual (sem
// Stone). O lead cai no CRM com a tag SELF-SERVICE e a equipe envia as
// opções de hotel, reserva e combina o pagamento pelo WhatsApp.

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
  console.log("[email] (hoteis-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Hotéis — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (hoteis-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (hoteis-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (hoteis-selfservice):", err);
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
    const bebes = inteiro(body.bebes);
    const idadesCriancas: number[] = Array.isArray(body.idadesCriancas)
      ? body.idadesCriancas.map((v: unknown) => inteiro(v)).slice(0, 20)
      : [];
    // Pagamento online opcional (Wilson, 06/out/2026: "self-checkout opcional
    // de pagamento online caso o cliente queira, mesmo que usamos em JR Pass").
    const pagarOnline = body.pagarOnline === true;
    type EstadiaBody = { cidade?: unknown; checkin?: unknown; checkout?: unknown; noites?: unknown; categoria?: unknown; tipoQuarto?: unknown; camas?: unknown; preferenciaQuartos?: unknown; quartos?: unknown; cafe?: unknown; valorBRL?: unknown };
    const estadias: EstadiaBody[] = Array.isArray(body.estadias) ? body.estadias.slice(0, 20) : [];
    if (estadias.length === 0) {
      return NextResponse.json({ error: "Adicione ao menos uma estadia." }, { status: 400 });
    }
    const linhasEstadias = estadias.map(
      (e) =>
        `${texto(e.cidade, 60)} ${texto(e.checkin, 20)} a ${texto(e.checkout, 20)} (${inteiro(e.noites)} noites) — ${texto(e.categoria, 30)}, ${inteiro(e.quartos)}× ${texto(e.tipoQuarto, 40)} (camas: ${texto(e.camas, 60) || "—"}${texto(e.preferenciaQuartos, 60) ? `; quartos: ${texto(e.preferenciaQuartos, 60)}` : ""})${e.cafe ? ", com café da manhã" : ""} — R$ ${(Number(e.valorBRL) || 0).toLocaleString("pt-BR")}`,
    );
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const observacoesCliente = texto(body.observacoes, 2000);
    const termosAceitos = Boolean(body.termosAceitos);
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => texto(a, 300)).filter(Boolean).slice(0, 20)
      : [];

    const linhasResumo: [string, string][] = [
      ["Período no Japão", `${dataChegada || "—"} a ${dataPartida || "—"}`],
      [
        "Hóspedes",
        `${adultos} adulto(s), ${criancas} criança(s) de 3 a 11 anos${idadesCriancas.length ? ` (idades: ${idadesCriancas.join(", ")})` : ""}${bebes ? `, ${bebes} bebê(s) até 2 anos (não contam como hóspede)` : ""}`,
      ],
      ["Estadias", linhasEstadias.join(" | ")],
      ["Total estimado (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Total estimado (BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      ["Forma de pagamento", pagarOnline ? "Cliente escolheu PAGAR ONLINE (Stone — Pix ou cartão)" : "A combinar pelo WhatsApp (checkout manual)"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Hotéis (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Hotéis (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Hotéis (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["hoteis"],
        valor_proposta: totalBRL,
        data_viagem: dataChegada || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (hoteis-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (hoteis-selfservice):", erroInteracao);
    }

    let checkoutUrl: string | null = null;
    if (pagarOnline && totalBRL && totalBRL > 0) {
      checkoutUrl = await criarCheckoutParaCliente({
        supabase,
        clienteId: cliente.id,
        valorBRL: totalBRL,
        itemNome: "Hotéis no Japão — Ajisai",
        itemDescricao: `${estadias.length} estadia(s), ${dataChegada} a ${dataPartida}`,
        observacoes: `Hotéis — ${linhasEstadias.length} estadia(s)`,
        urlSucesso: `${new URL(req.url).origin}/produtos/hoteis?pagamento=concluido`,
        rotuloLog: "hoteis-selfservice",
      });
    }

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Hotéis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
