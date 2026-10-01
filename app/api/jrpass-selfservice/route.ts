import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckout, pagarmeConfigurado } from "../../../lib/pagarme/client";

export const runtime = "nodejs";

// Self-checkout de JR Pass em /produtos — pedido do Wilson, 25/set/2026:
// "adicionar nome, e-mail e telefone nessa página, registrar no CRM ao
// proceder para pagamento" (mesmo padrão de Câmbio/Seguro Viagem/
// Transporte Privado — lead cai no CRM com a tag SELF-SERVICE) + "aqui o
// finalizar compra vai gerar uma nova tela que precisa [...] gerar dados
// de pagamento, QR code do PIX e link de pagamento de cartao de credito"
// — a geração de PIX/link de cartão de verdade depende de integrar um
// gateway de pagamento (PSP). Isso foi resolvido em 28/set/2026: Wilson
// pediu a integração com a Stone/Pagar.me (ver lib/pagarme/client.ts pro
// contexto completo da decisão — checkout hospedado, cartão + Pix, juros
// repassados ao cliente, conta da Alpinea). Com PAGARME_SECRET_KEY
// configurada, esta rota também cria o pedido de pagamento e devolve
// `checkoutUrl` pro frontend redirecionar o cliente pra lá. SEM a
// variável configurada, cai de volta no comportamento antigo: só
// registra o lead completo (documento, crianças, termos aceitos) e avisa
// que o link de pagamento vem por WhatsApp/e-mail — nunca finge uma
// cobrança que não existe.
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
}): Promise<{ ok: boolean; providerId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (jrpass-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando envio de e-mail (jrpass-selfservice).");
    return { ok: false, providerId: null };
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
    const { dados } = await (async () => {
      const textoCru = await resendResponse.text().catch(() => "");
      try {
        return { dados: textoCru ? (JSON.parse(textoCru) as Record<string, unknown>) : {} };
      } catch {
        return { dados: {} as Record<string, unknown> };
      }
    })();
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (jrpass-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (jrpass-selfservice):", JSON.stringify(dados));
      return { ok: false, providerId: null };
    }
    return { ok: true, providerId: typeof dados.id === "string" ? dados.id : null };
  } catch (err) {
    console.error("Erro ao enviar e-mail (jrpass-selfservice):", err);
    return { ok: false, providerId: null };
  }
}

// Versão do texto de Termos e Condições vigente — decidida pelo
// servidor (nunca confiar em versão enviada pelo cliente), pra saber
// exatamente qual redação o cliente aceitou em caso de disputa.
// Atualizar esta constante sempre que o texto em
// app/produtos/jrpass/page.tsx (seção "Termos e condições") mudar de
// forma relevante. Versão atual: texto jurídico completo de 20
// cláusulas + subcláusulas de chargeback, adotado em 29/set/2026.
const TERMOS_VERSAO_JRPASS = "jrpass-termos-2026-09-29";

function extrairIpDaRequisicao(req: Request): string | null {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    // Nome de quem está pagando, quando é diferente de quem viaja —
    // pedido do Wilson, 29/set/2026, como evidência de checkout pra
    // defesa de chargeback ("nome do passageiro + nome do comprador").
    // Opcional: vazio quando comprador e passageiro são a mesma pessoa.
    const nomeComprador = String(body.nomeComprador || "").trim();
    const email = String(body.email || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Nome, e-mail e WhatsApp são obrigatórios." },
        { status: 400 },
      );
    }

    // Endereço de entrega — obrigatório desde 01/out/2026 (Wilson: "O JR
    // Pass é enviado a residência do cliente").
    const end = (body.endereco ?? {}) as Record<string, unknown>;
    const campoEnd = (k: string, max = 120) => String(end[k] ?? "").trim().slice(0, max);
    const endereco = {
      cep: campoEnd("cep", 9),
      logradouro: campoEnd("logradouro"),
      numero: campoEnd("numero", 20),
      complemento: campoEnd("complemento", 80),
      bairro: campoEnd("bairro", 80),
      cidade: campoEnd("cidade", 80),
      uf: campoEnd("uf", 2).toUpperCase(),
    };
    if (
      endereco.cep.replace(/\D/g, "").length !== 8 ||
      !endereco.logradouro ||
      !endereco.numero ||
      !endereco.complemento ||
      !endereco.bairro ||
      !endereco.cidade ||
      endereco.uf.length !== 2
    ) {
      return NextResponse.json(
        { error: "Endereço de entrega incompleto — o JR Pass é enviado à residência do cliente." },
        { status: 400 },
      );
    }
    const enderecoTexto = `${endereco.logradouro}, ${endereco.numero} — ${endereco.complemento} — ${endereco.bairro}, ${endereco.cidade}/${endereco.uf} — CEP ${endereco.cep}`;
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

    // Evidências de checkout pra eventual disputa de chargeback — ver
    // migração 013_evidencias_checkout_jrpass.sql e o pedido do Wilson,
    // 29/set/2026 ("Para realmente reduzir chargeback, o contrato
    // sozinho não basta... timestamp + IP + versão dos termos +
    // checkbox de aceite..."). timestamp vem de `created_at`
    // (automático); versão dos termos é decidida pelo servidor, nunca
    // pelo cliente.
    const checkoutIp = extrairIpDaRequisicao(req);
    const checkoutUserAgent = req.headers.get("user-agent");

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
      ["Nome do comprador (se diferente do passageiro)", nomeComprador || "Mesmo que o passageiro"],
      ["Endereço de entrega do JR Pass", enderecoTexto],
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
        nome_comprador: nomeComprador || null,
        checkout_ip: checkoutIp,
        checkout_user_agent: checkoutUserAgent,
        termos_aceitos: true,
        termos_versao: TERMOS_VERSAO_JRPASS,
        termos_aceitos_em: new Date().toISOString(),
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

    // Pagamento de verdade via Pagar.me (ver lib/pagarme/client.ts) —
    // só entra em ação com PAGARME_SECRET_KEY configurada e um valor
    // total calculado; qualquer erro aqui é só logado, nunca derruba o
    // pedido (o lead já foi salvo acima) — o cliente cai no fluxo antigo
    // de link manual por WhatsApp/e-mail.
    let checkoutUrl: string | null = null;
    if (pagarmeConfigurado() && precoTotalBRL && precoTotalBRL > 0) {
      try {
        const { data: pagamentoPendente, error: erroPagamento } = await supabase
          .from("pagamentos")
          .insert({
            cliente_id: cliente.id,
            tipo_pagamento: "cartao_credito",
            valor: precoTotalBRL,
            status: "pendente",
            gateway: "pagarme",
            observacoes: `JR Pass — ${classe}, ${dias ? `${dias} dias` : "duração não informada"}`,
          })
          .select("id")
          .single();

        if (erroPagamento || !pagamentoPendente) {
          console.error("Erro ao criar linha de pagamento pendente (jrpass-selfservice):", erroPagamento);
        } else {
          const checkout = await criarCheckout({
            codigoInterno: pagamentoPendente.id,
            itemNome: `JR Pass — ${classe}`,
            itemDescricao: `${dias ? `${dias} dias` : "duração a confirmar"}, ${numeroPessoas} pessoa(s)`,
            valorTotalBRL: precoTotalBRL,
            aceitarCartao: true,
            aceitarPix: true,
            // Botão "voltar para a loja" da página da Stone volta para o site
            // (Wilson, 01/out/2026).
            urlSucesso: `${new URL(req.url).origin}/produtos/jrpass?pagamento=concluido`,
          });

          await supabase
            .from("pagamentos")
            .update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url })
            .eq("id", pagamentoPendente.id);

          checkoutUrl = checkout.url;
        }
      } catch (erroCheckout) {
        console.error("Erro ao criar checkout Pagar.me (jrpass-selfservice):", erroCheckout);
      }
    }

    // E-mail pro time interno — mesmo padrão dos outros self-checkouts.
    await enviarEmail({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
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
      const resultadoEmailCliente = await enviarEmail({
        to: [email],
        subject: "Recebemos seu pedido de JR Pass — próximos passos",
        text: textoEmissao,
        html: htmlEmissao,
      });

      // Registro do envio (não do conteúdo) do e-mail de confirmação —
      // "histórico de e-mails" como evidência de chargeback: prova de
      // que o cliente foi avisado, com o id rastreável no Resend.
      // Nunca derruba o pedido se essa atualização falhar.
      const { error: erroAtualizarEmail } = await supabase
        .from("clientes")
        .update({
          email_confirmacao_enviado: resultadoEmailCliente.ok,
          email_confirmacao_provider_id: resultadoEmailCliente.providerId,
        })
        .eq("id", cliente.id);
      if (erroAtualizarEmail) {
        console.error("Erro ao registrar histórico do e-mail de confirmação (jrpass-selfservice):", erroAtualizarEmail);
      }
    }

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de JR Pass:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
