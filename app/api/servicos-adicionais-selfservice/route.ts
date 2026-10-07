import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckoutParaCliente } from "../../../lib/pagarme/checkoutPedido";
import {
  precoLimousineUSD,
  SENTIDOS_LIMOUSINE,
  type AeroportoLimousine,
  type SentidoLimousine,
} from "../../lib/servicosAdicionaisCatalogo";

export const runtime = "nodejs";

// Pedido de Serviços Adicionais em /produtos/servicos-adicionais — pedido
// do Wilson, 30/set/2026: página no mesmo template do Transporte Privado,
// com seleção dos serviços extras e checkout manual (sem Stone). O lead cai
// no CRM com a tag SELF-SERVICE e a equipe confirma pelo WhatsApp.

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
  console.log("[email] (servicos-adicionais-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de Serviços Adicionais — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (servicos-adicionais-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (servicos-adicionais-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (servicos-adicionais-selfservice):", err);
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
    const pessoas = inteiro(body.pessoas);
    type ServicoBody = { nome?: unknown; crm?: unknown; detalhe?: unknown; valorUSD?: unknown; unidade?: unknown };
    const servicos: ServicoBody[] = Array.isArray(body.servicos) ? body.servicos.slice(0, 20) : [];
    if (servicos.length === 0) {
      return NextResponse.json({ error: "Escolha ao menos um serviço." }, { status: 400 });
    }
    // Chaves de produto secundário já conhecidas pelo CRM (ProdutoIcons.tsx).
    const CHAVES_CRM = new Set(["esim", "reserva_restaurantes", "ajisai_shopping"]);
    const produtoSecundario = Array.from(
      new Set(servicos.map((s) => texto(s.crm, 40)).filter((c) => CHAVES_CRM.has(c))),
    );
    const linhasServicos = servicos.map((s) => {
      const valor = s.valorUSD === null || s.valorUSD === undefined ? `sob consulta (${texto(s.unidade, 80)})` : `US$ ${(Number(s.valorUSD) || 0).toLocaleString("pt-BR")}`;
      const detalhe = texto(s.detalhe, 120);
      return `${texto(s.nome, 80)}${detalhe ? ` (${detalhe})` : ""} — ${valor}`;
    });
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const observacoesCliente = texto(body.observacoes, 2000);
    const termosAceitos = Boolean(body.termosAceitos);
    // Detalhes por serviço (reestruturação de 06/out/2026).
    const rest = (body.restaurantes ?? null) as Record<string, unknown> | null;
    const restaurantesTexto = rest
      ? `${(Array.isArray(rest.nomes) ? rest.nomes : []).map((n: unknown) => texto(n, 100)).join(", ")}${
          texto(rest.restricoes, 300) ? ` — restrições: ${texto(rest.restricoes, 300)}` : ""
        } — refeições estimadas US$ ${Number(rest.refeicoesEstimadasUSD) || 0} (NÃO inclusas) — ciente: ${rest.cienteRefeicoes ? "sim" : "não"}`
      : "";
    const es = (body.esim ?? null) as Record<string, unknown> | null;
    const esimTexto = es ? `${texto(es.plano, 120)} × ${inteiro(es.quantidade)}` : "";
    // Limousine Bus: valor RECALCULADO aqui (margem de 50%) e pago online.
    const lb = (body.limousine ?? null) as Record<string, unknown> | null;
    let limousineUSD = 0;
    let limousineBRL = 0;
    let limousineTexto = "";
    if (lb) {
      const aeroporto: AeroportoLimousine = lb.aeroporto === "haneda" ? "haneda" : "narita";
      const sentido: SentidoLimousine = SENTIDOS_LIMOUSINE.some((x) => x.id === lb.sentido) ? (lb.sentido as SentidoLimousine) : "ida-volta";
      const adultos = inteiro(lb.adultos);
      const criancas = inteiro(lb.criancas);
      limousineUSD = precoLimousineUSD({ aeroporto, sentido, adultos, criancas });
      const cotacao = Math.min(10, Math.max(3, Number(lb.cotacao) || 5.3));
      limousineBRL = Math.round(limousineUSD * cotacao * 100) / 100;
      limousineTexto = `${aeroporto === "narita" ? "Narita" : "Haneda"} — ${SENTIDOS_LIMOUSINE.find((x) => x.id === sentido)?.nome} — ${adultos} adulto(s), ${criancas} criança(s) — ponto: ${texto(lb.ponto, 120)}${
        texto(lb.hotel, 200) ? ` — hotel: ${texto(lb.hotel, 200)}` : ""
      } — US$ ${limousineUSD} (R$ ${limousineBRL.toLocaleString("pt-BR")}) PAGO ONLINE`;
    }
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => texto(a, 300)).filter(Boolean).slice(0, 20)
      : [];

    const linhasResumo: [string, string][] = [
      ["Período no Japão", `${dataChegada || "—"} a ${dataPartida || "—"}`],
      ["Pessoas", String(pessoas)],
      ["Serviços", linhasServicos.join(" | ")],
      ...(restaurantesTexto ? ([["Restaurantes escolhidos", restaurantesTexto]] as [string, string][]) : []),
      ...(esimTexto ? ([["eSIM", esimTexto]] as [string, string][]) : []),
      ...(limousineTexto ? ([["Limousine Bus", limousineTexto]] as [string, string][]) : []),
      ["Total estimado (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Total estimado (BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      [
        "Forma de pagamento",
        limousineTexto ? "Limousine Bus: online (Stone). Demais serviços: a combinar pelo WhatsApp" : "A combinar pelo WhatsApp (checkout manual)",
      ],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — Serviços Adicionais (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — Serviços Adicionais (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Serviços Adicionais (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: produtoSecundario,
        valor_proposta: totalBRL,
        data_viagem: dataChegada || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (servicos-adicionais-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (servicos-adicionais-selfservice):", erroInteracao);
    }

    let checkoutUrl: string | null = null;
    if (limousineBRL > 0) {
      checkoutUrl = await criarCheckoutParaCliente({
        supabase,
        clienteId: cliente.id,
        valorBRL: limousineBRL,
        itemNome: "Limousine Bus — Ajisai",
        itemDescricao: limousineTexto.slice(0, 250),
        observacoes: `Limousine Bus — US$ ${limousineUSD}`,
        urlSucesso: `${new URL(req.url).origin}/produtos/servicos-adicionais?pagamento=concluido`,
        rotuloLog: "servicos-adicionais-selfservice",
      });
    }

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Serviços Adicionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
