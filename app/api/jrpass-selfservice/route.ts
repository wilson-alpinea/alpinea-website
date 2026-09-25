import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Self-checkout de JR Pass em /produtos — pedido do Wilson, 25/set/2026:
// "adicionar nome, e-mail e telefone nessa página, registrar no CRM ao
// proceder para pagamento" (mesmo padrão de Câmbio/Seguro Viagem/
// Transporte Privado — lead cai no CRM com a tag SELF-SERVICE) + "aqui o
// finalizar compra vai gerar uma nova tela que precisa [...] gerar dados
// de pagamento, QR code do PIX e link de pagamento de cartao de credito"
// — a geração de PIX/link de cartão de verdade depende de integrar um
// gateway de pagamento (PSP), que ainda não existe no site (confirmado
// com o Wilson via AskUserQuestion, 25/set/2026: ele escolheu "ainda não
// tenho, sugira um" — pesquisa indicou Mercado Pago, mas a conta ainda
// precisa ser criada por ele). Até isso existir, essa rota só registra o
// lead completo (documento, crianças, termos aceitos) e avisa que o
// link de pagamento vem por WhatsApp/e-mail — nunca finge uma cobrança
// que não existe.
//
// Também dispara e-mail de confirmação PRO CLIENTE (não só pro time
// interno, diferente de cambio-selfservice/seguro-viagem-selfservice) —
// pedido do Wilson, 25/set/2026: "enviar e-mail de confirmação de
// pagamento e explicação do processo de emissão".

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function enviarEmail(params: {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando envio de e-mail (jrpass-selfservice).");
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
        to: params.to,
        reply_to: params.replyTo || undefined,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });
    if (!resendResponse.ok) {
      console.error("Erro Resend (jrpass-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao enviar e-mail (jrpass-selfservice):", err);
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
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!body.termosAceitos) {
      return NextResponse.json(
        { error: "É preciso aceitar os termos e condições do JR Pass." },
        { status: 400 },
      );
    }

    const classe = String(body.classe || "").trim() || "Não informado";
    const dias = Number(body.dias) || null;
    const numeroPessoas = Number(body.numeroPessoas) || 1;
    const numeroCriancas = Number(body.numeroCriancas) || 0;
    const idadesCriancas = Array.isArray(body.idadesCriancas)
      ? body.idadesCriancas.filter((v: unknown) => typeof v === "number")
      : [];
    const dataInicioViagem = String(body.dataInicioViagem || "").trim();
    const dataFimViagem = String(body.dataFimViagem || "").trim();
    const precoTotalBRL = Number(body.precoTotalBRL) || null;
    const precoTotalUSD = Number(body.precoTotalUSD) || null;
    const formaPagamento = String(body.formaPagamento || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();

    const documentoTipo = String(body.documentoTipo || "").trim();
    const documentoStoragePath = String(body.documentoStoragePath || "").trim();
    const documentoValidacaoMotivo = String(body.documentoValidacaoMotivo || "").trim();
    const documentoAdiado = !!body.documentoAdiado;

    const documentoResumo = documentoAdiado
      ? "Cliente optou por anexar depois (via WhatsApp)"
      : documentoStoragePath
        ? `${documentoTipo || "documento"} recebido — ${documentoValidacaoMotivo || "sem detalhe de validação"} (arquivo: ${documentoStoragePath})`
        : "Não anexado";

    const linhasResumo: [string, string][] = [
      ["Classe", classe],
      ["Duração", dias ? `${dias} dias` : "Não informado"],
      [
        "Pessoas",
        `${numeroPessoas} (${numeroCriancas} criança(s)${
          idadesCriancas.length > 0 ? `, idades: ${idadesCriancas.join(", ")}` : ""
        })`,
      ],
      [
        "Viagem",
        dataInicioViagem && dataFimViagem ? `${dataInicioViagem} a ${dataFimViagem}` : "Não informada",
      ],
      ["Valor total (referência)", precoTotalBRL ? `R$ ${precoTotalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Valor total (USD)", precoTotalUSD ? `US$ ${precoTotalUSD.toLocaleString("en-US")}` : "Não calculado"],
      ["Forma de pagamento escolhida", formaPagamento || "Não escolhida ainda"],
      ["Documento (passaporte/passagem)", documentoResumo],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      "Novo pedido — JR Pass (self-checkout)",
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — JR Pass (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — JR Pass (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: ["jr_pass"],
        valor_proposta: precoTotalBRL,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (jrpass-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (jrpass-selfservice):", erroInteracao);
    }

    // E-mail pro time interno — mesmo padrão dos outros self-checkouts.
    await enviarEmail({
      to: ["wilson@alpinea.io"],
      replyTo: email || undefined,
      subject: `[${TAG_SELF_SERVICE}] Novo pedido de JR Pass — ${nome}`,
      text: resumoTexto,
      html: resumoHtml,
    });

    // E-mail de confirmação pro cliente + explicação do processo de
    // emissão — pedido do Wilson, 25/set/2026: "enviar e-mail de
    // confirmação de pagamento e explicação do processo de emissão".
    // "Confirmação de pagamento" aqui é confirmação de PEDIDO/RECEBIMENTO
    // — não existe cobrança automática ainda (ver comentário no topo do
    // arquivo); o e-mail deixa isso claro em vez de sugerir que já foi
    // cobrado.
    const textoEmissao = [
      `Olá, ${nome}!`,
      "",
      "Recebemos seu pedido de JR Pass e nossa equipe já está com ele em mãos. Veja como funciona a partir daqui:",
      "",
      "1. Conferência — vamos confirmar a elegibilidade (documento de passaporte/passagem, se já enviado) e os dados da viagem.",
      "2. Pagamento — te enviamos o link de pagamento (Pix ou cartão de crédito) pelo WhatsApp e por e-mail. O pedido só é confirmado depois do pagamento.",
      "3. Emissão do voucher — após o pagamento, emitimos o voucher (Exchange Order) do JR Pass. Ele tem validade de 3 meses a partir da emissão para ser trocado pelo passe físico.",
      "4. Troca no Japão — a troca do voucher pelo passe físico é feita só no Japão, em balcões JR. É indispensável passar pela imigração no balcão manual (não no portão eletrônico) para obter o carimbo \"Temporary Visitor\" no passaporte — sem ele, não é possível trocar o voucher.",
      "",
      documentoAdiado
        ? "Você optou por enviar o documento (passaporte ou passagem) depois — pode mandar direto pelo WhatsApp assim que tiver em mãos, pra gente adiantar a conferência."
        : "Recebemos o documento que você anexou — nossa equipe confirma a conferência.",
      "",
      "Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp.",
      "",
      "Alpinea",
    ].join("\n");

    const htmlEmissao = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <p>Olá, ${escapeHtml(nome)}!</p>
        <p>Recebemos seu pedido de JR Pass e nossa equipe já está com ele em mãos. Veja como funciona a partir daqui:</p>
        <ol>
          <li><strong>Conferência</strong> — vamos confirmar a elegibilidade (documento de passaporte/passagem, se já enviado) e os dados da viagem.</li>
          <li><strong>Pagamento</strong> — te enviamos o link de pagamento (Pix ou cartão de crédito) pelo WhatsApp e por e-mail. O pedido só é confirmado depois do pagamento.</li>
          <li><strong>Emissão do voucher</strong> — após o pagamento, emitimos o voucher (Exchange Order) do JR Pass. Ele tem validade de 3 meses a partir da emissão para ser trocado pelo passe físico.</li>
          <li><strong>Troca no Japão</strong> — a troca do voucher pelo passe físico é feita só no Japão, em balcões JR. É indispensável passar pela imigração no balcão manual (não no portão eletrônico) para obter o carimbo "Temporary Visitor" no passaporte — sem ele, não é possível trocar o voucher.</li>
        </ol>
        <p>${
          documentoAdiado
            ? "Você optou por enviar o documento (passaporte ou passagem) depois — pode mandar direto pelo WhatsApp assim que tiver em mãos, pra gente adiantar a conferência."
            : "Recebemos o documento que você anexou — nossa equipe confirma a conferência."
        }</p>
        <p>Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp.</p>
        <p>Alpinea</p>
      </div>
    `.trim();

    if (email) {
      await enviarEmail({
        to: [email],
        subject: "Recebemos seu pedido de JR Pass — próximos passos",
        text: textoEmissao,
        html: htmlEmissao,
      });
    }

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de JR Pass:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
