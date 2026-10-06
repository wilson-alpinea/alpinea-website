import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Pedido de cotação de Passagens Aéreas em /produtos/passagens-aereas —
// pedido do Wilson, 30/set/2026: página no mesmo template do Transporte
// Privado, "checkout deve ser manual e não automatico via Stone". Mesmo
// padrão de /api/transporte-privado-selfservice: o lead cai no CRM com a
// tag SELF-SERVICE e a equipe fecha tarifa, emissão e pagamento pelo
// WhatsApp (nada é cobrado no site).

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
  console.log("[email] (passagens-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Nova cotação de Passagens Aéreas — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (passagens-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (passagens-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (passagens-selfservice):", err);
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

    const origem = texto(body.origem, 120);
    const destino = texto(body.destino, 120);
    const dataIda = texto(body.dataIda, 20);
    if (!origem || !destino || !dataIda) {
      return NextResponse.json({ error: "Informe origem, destino e data de ida." }, { status: 400 });
    }

    const modo = body.modo === "so-ida" ? "Só ida" : "Ida e volta";
    const destinoVolta = texto(body.destinoVolta, 120);
    const dataVolta = texto(body.dataVolta, 20);
    const adultos = inteiro(body.adultos);
    const criancas = inteiro(body.criancas);
    const bebes = inteiro(body.bebes);
    const cabine = texto(body.cabine, 60);
    const companhia = texto(body.companhia, 60) || "Sem preferência";
    const datasFlexiveis = Boolean(body.datasFlexiveis);
    // Sentido (Brasil→Japão ou Japão→Brasil) e trechos já montados pela
    // página; "outra data sugerida" = aceita datas com promoção (06/out/2026).
    const sentido = texto(body.sentido, 40) || "Brasil → Japão";
    const trechoIda = texto(body.trechoIda, 300);
    const trechoVolta = texto(body.trechoVolta, 300);
    const aceitaDataSugerida =
      body.aceitaDataSugerida === true ? "Sim — enviar opções com promoção" : body.aceitaDataSugerida === false ? "Não, só nas datas escolhidas" : "Não respondeu";
    const referenciaUSD = Number(body.referenciaPorPassageiroUSD) || 0;
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const nomesPassageiros = texto(body.nomesPassageiros, 2000);
    const observacoesCliente = texto(body.observacoes, 2000);
    const termosAceitos = Boolean(body.termosAceitos);
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => texto(a, 300)).filter(Boolean).slice(0, 10)
      : [];

    const linhasResumo: [string, string][] = [
      ["Tipo", `${modo} · ${sentido}`],
      ["Ida", `${trechoIda || `${origem} → ${destino}`} em ${dataIda}`],
      ["Volta", modo === "Ida e volta" ? `${trechoVolta || `${destinoVolta || destino} → ${origem}`} em ${dataVolta || "—"}` : "Não solicitada"],
      ["Passageiros", `${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s)`],
      ["Cabine", cabine || "Não informada"],
      ["Companhia preferida", companhia],
      ["Datas flexíveis (±3 dias)", datasFlexiveis ? "Sim" : "Não"],
      ["Aceita outra data sugerida (promoção)", aceitaDataSugerida],
      ["Referência por passageiro (US$)", `US$ ${referenciaUSD.toLocaleString("pt-BR")}`],
      ["Total estimado (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Total estimado (referência BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      ["Nomes dos passageiros", nomesPassageiros || "Não informados"],
      ["Visto americano", texto(body.vistoEUA, 60) || "Não informado"],
      ["Forma de pagamento", "A combinar pelo WhatsApp (checkout manual)"],
      ["Intenção de concluir a compra", texto(body.prazoCompra, 40) || "Não informado"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Nova cotação — Passagens Aéreas (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Nova cotação — Passagens Aéreas (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — Passagens Aéreas (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["passagem_aerea"],
        valor_proposta: totalBRL,
        data_viagem: dataIda || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (passagens-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (passagens-selfservice):", erroInteracao);
    }

    await notificarPorEmail({ nome, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no pedido de Passagens Aéreas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
