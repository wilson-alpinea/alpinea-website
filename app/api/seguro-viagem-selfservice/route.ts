import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";
import { criarCheckout, pagarmeConfigurado } from "../../../lib/pagarme/client";
import { calcularValorSeguroViagemBRL, diasEntreDatas } from "../../lib/precoSeguroViagem";

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
//
// ATUALIZAÇÃO 29/set/2026 — Seguro Viagem ganhou página própria
// (/produtos/seguro-viagem) com pagamento self-service de verdade pela
// Stone/Pagar.me, igual ao JR Pass (pedido do Wilson: "aqui também será
// inserido o processo de pagamento self-service da Stone"; decisão dele
// no mesmo dia: o valor calculado é o preço final Ajisai, cobrado na
// hora). O que mudou nesta rota:
// - aceite dos termos passa a ser obrigatório, com as mesmas evidências
//   de checkout do JR Pass (IP, user-agent, versão dos termos, nome do
//   comprador — colunas da migração 013/014 em `clientes`);
// - o VALOR É RECALCULADO AQUI no servidor (app/lib/precoSeguroViagem.ts)
//   a partir de datas/idades/roteiro — o valor enviado pelo navegador é
//   ignorado pra cobrança (só registrado se divergir, pra auditoria);
// - com PAGARME_SECRET_KEY configurada, cria o link de pagamento e
//   devolve `checkoutUrl`; sem ela, segue o fluxo antigo (lead + link
//   manual por WhatsApp);
// - envia e-mail de confirmação pro cliente, como no JR Pass.

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Envio best-effort via Resend (mesmo padrão do JR Pass) — nunca derruba
// o pedido: o lead já foi gravado no CRM antes das chamadas.
async function enviarEmail(params: {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; providerId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (seguro-viagem-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando envio de e-mail (seguro-viagem-selfservice).");
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
    const textoCru = await resendResponse.text().catch(() => "");
    let dados: Record<string, unknown> = {};
    try {
      dados = textoCru ? (JSON.parse(textoCru) as Record<string, unknown>) : {};
    } catch {
      dados = {};
    }
    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (seguro-viagem-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (seguro-viagem-selfservice):", textoCru || "(corpo vazio)");
      return { ok: false, providerId: null };
    }
    return { ok: true, providerId: typeof dados.id === "string" ? dados.id : null };
  } catch (err) {
    console.error("Erro ao enviar e-mail (seguro-viagem-selfservice):", err);
    return { ok: false, providerId: null };
  }
}

// Versão do texto de Termos e Condições vigente (decidida pelo servidor,
// nunca pelo cliente). Atualizar sempre que o texto da seção "Termos e
// condições" em app/produtos/seguro-viagem/page.tsx mudar de forma
// relevante. Versão atual: texto de 17 cláusulas enviado pelo Wilson em
// 29/set/2026 ("última atualização: setembro de 2026").
const TERMOS_VERSAO_SEGURO_VIAGEM = "seguro-viagem-termos-2026-09-29";

function extrairIpDaRequisicao(req: Request): string | null {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

const SEGURADORAS_VALIDAS = ["affinity", "gta", "mta"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const nomeComprador = String(body.nomeComprador || "").trim();
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
        { error: "É preciso aceitar os termos e condições do Seguro Viagem." },
        { status: 400 },
      );
    }
    // Residência fora do Brasil e do Japão não é elegível (regra do
    // Wilson, 25/set/2026) — a página já bloqueia, isto é só a garantia
    // do lado do servidor.
    const moraEm = String(body.moraEm || "").trim();
    if (moraEm && moraEm !== "brasil" && moraEm !== "japao") {
      return NextResponse.json(
        { error: "Esse seguro viagem só pode ser contratado por quem mora no Brasil ou no Japão." },
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
    // CPF e endereço de cada viajante — pedido do Wilson, 25/set/2026:
    // "precisa ter cpf e endereco de cada um dos passageiros, pra ser
    // preenchido na proxima etapa". Opcionais: o cliente pode deixar em
    // branco e confirmar com a equipe depois, antes da emissão da
    // apólice — por isso só entram no resumo, sem coluna própria em
    // `clientes`.
    const cpfs: string[] = Array.isArray(body.cpfs)
      ? body.cpfs.map((c: unknown) => String(c).trim()).slice(0, 12)
      : [];
    const enderecos: string[] = Array.isArray(body.enderecos)
      ? body.enderecos.map((e: unknown) => String(e).trim()).slice(0, 12)
      : [];
    // Roteiro (Japão + outros países da Ásia, opcional) — pedido do Wilson,
    // 25/set/2026: "escolher pais, japão é o obrigatorio, mas cliente pode
    // colocar outros paises da Asia na lista". Só entra no resumo do lead
    // (não tem coluna própria em `clientes`, e não é isso que muda no
    // schema — o roteiro fica registrado em texto, junto do resto).
    const paises: string[] = Array.isArray(body.paises)
      ? body.paises.map((p: unknown) => String(p).trim()).filter(Boolean).slice(0, 15)
      : ["Japão"];
    // Valor recalculado no servidor — é ESTE que vai pra cobrança. O
    // valor que veio do navegador só é comparado, pra auditoria.
    const diasCalculados = diasEntreDatas(dataInicio, dataFim);
    const valorTotalBRL = calcularValorSeguroViagemBRL({
      dias: diasCalculados,
      idades,
      multidestino: paises.length > 1,
    });
    const valorEnviadoPeloCliente = Number(body.valorTotalBRL ?? body.valorReferenciaBRL) || null;
    if (valorTotalBRL !== null && valorEnviadoPeloCliente !== null && Math.abs(valorTotalBRL - valorEnviadoPeloCliente) > 1) {
      console.error(
        `Valor divergente no Seguro Viagem (cliente R$ ${valorEnviadoPeloCliente} × servidor R$ ${valorTotalBRL}) — usando o do servidor.`,
      );
    }
    const formaPagamento = String(body.formaPagamento || "").trim();
    const paisResidencia = String(body.paisResidencia || "").trim();
    // País de destino — pedido do Wilson, 25/set/2026: "aqui em seguro
    // viagem definir o pais de residencia e o pais de destino (brasil ou
    // japao)". Já vem embutido como primeiro item de `paises` acima, mas
    // registrado também como campo próprio pra ficar claro no resumo do
    // lead, sem precisar abrir a lista de roteiro pra achar.
    const paisDestino = String(body.paisDestino || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();

    // Passagem aérea — pedido do Wilson, 25/set/2026: "tem que adicionar
    // check-box se o cliente já comprou a passagem ou não, adicionar
    // campo para dados da passagem como numero do voo e data de inicio e
    // volta da passagem aerea, adicionar campo para emitir passagem
    // aérea via ajisai". Não tem coluna própria em `clientes` — fica no
    // resumo do lead, junto do resto.
    const passagemCompradaBruta = String(body.passagemComprada || "").trim();
    const passagemComprada =
      passagemCompradaBruta === "sim" || passagemCompradaBruta === "nao" ? passagemCompradaBruta : "";
    const numeroVoo = String(body.numeroVoo || "").trim();
    const dataIdaVoo = String(body.dataIdaVoo || "").trim();
    const dataVoltaVoo = String(body.dataVoltaVoo || "").trim();
    const emitirPassagemAjisai = !!body.emitirPassagemAjisai;

    const passagemResumo =
      passagemComprada === "sim"
        ? `Já comprou${numeroVoo ? ` — voo ${numeroVoo}` : ""}${
            dataIdaVoo || dataVoltaVoo ? ` (ida ${dataIdaVoo || "?"} / volta ${dataVoltaVoo || "?"})` : ""
          }`
        : passagemComprada === "nao"
          ? `Ainda não comprou${emitirPassagemAjisai ? " — quer que a Ajisai emita" : ""}`
          : "Não informado";

    const seguradoraLabel: Record<(typeof SEGURADORAS_VALIDAS)[number], string> = {
      affinity: "Affinity",
      gta: "GTA — Global Travel Assistance",
      mta: "MTA — My Travel Assist",
    };

    const linhasResumo: [string, string][] = [
      ["Seguradora escolhida", seguradoraLabel[seguradora as (typeof SEGURADORAS_VALIDAS)[number]]],
      ["Roteiro (países)", paises.length ? paises.join(", ") : "Japão"],
      ["Data de início da viagem", dataInicio || "Não informado"],
      ["Data de término da viagem", dataFim || "Não informado"],
      ["Dias de cobertura", diasCalculados ? String(diasCalculados) : dias ? String(dias) : "Não informado"],
      ["Número de viajantes", idades.length ? String(idades.length) : "Não informado"],
      ["Idades dos viajantes", idades.length ? idades.join(", ") : "Não informado"],
      [
        "CPF dos viajantes",
        cpfs.some(Boolean) ? cpfs.map((c, i) => `${i + 1}: ${c || "não informado"}`).join(" | ") : "A confirmar na próxima etapa",
      ],
      [
        "Endereço dos viajantes",
        enderecos.some(Boolean)
          ? enderecos.map((e, i) => `${i + 1}: ${e || "não informado"}`).join(" | ")
          : "A confirmar na próxima etapa",
      ],
      [
        "Valor total Ajisai (calculado no servidor)",
        valorTotalBRL ? `R$ ${valorTotalBRL.toLocaleString("pt-BR")}` : "Não calculado — cotação manual",
      ],
      ["Forma de pagamento escolhida", formaPagamento || "Não escolhida ainda"],
      ["País de residência", paisResidencia || "Não informado"],
      ["País de destino", paisDestino || "Não informado"],
      ["Passagem aérea", passagemResumo],
      ["Nome do comprador (se diferente do viajante)", nomeComprador || "Mesmo que o viajante principal"],
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
        valor_proposta: valorTotalBRL,
        data_viagem: dataInicio || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
        nome_comprador: nomeComprador || null,
        checkout_ip: extrairIpDaRequisicao(req),
        checkout_user_agent: req.headers.get("user-agent"),
        termos_aceitos: true,
        termos_versao: TERMOS_VERSAO_SEGURO_VIAGEM,
        termos_aceitos_em: new Date().toISOString(),
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

    // Pagamento via Stone/Pagar.me (lib/pagarme/client.ts) — mesmo padrão
    // do JR Pass: só com PAGARME_SECRET_KEY configurada e valor calculado;
    // qualquer erro é só logado (o lead já está salvo) e o cliente cai no
    // fluxo de link manual por WhatsApp/e-mail. O webhook
    // (app/api/webhooks/pagarme) é genérico: confirma pela linha em
    // `pagamentos`, então serve pro Seguro Viagem sem mudança.
    let checkoutUrl: string | null = null;
    const seguradoraNome = seguradoraLabel[seguradora as (typeof SEGURADORAS_VALIDAS)[number]];
    if (pagarmeConfigurado() && valorTotalBRL && valorTotalBRL > 0) {
      try {
        const { data: pagamentoPendente, error: erroPagamento } = await supabase
          .from("pagamentos")
          .insert({
            cliente_id: cliente.id,
            tipo_pagamento: "cartao_credito",
            valor: valorTotalBRL,
            status: "pendente",
            gateway: "pagarme",
            observacoes: `Seguro Viagem — ${seguradoraNome}, ${diasCalculados} dias, ${idades.length} viajante(s)`,
          })
          .select("id")
          .single();

        if (erroPagamento || !pagamentoPendente) {
          console.error("Erro ao criar linha de pagamento pendente (seguro-viagem-selfservice):", erroPagamento);
        } else {
          const checkout = await criarCheckout({
            codigoInterno: pagamentoPendente.id,
            itemNome: `Seguro Viagem — ${seguradoraNome}`,
            itemDescricao: `${diasCalculados} dias (${dataInicio} a ${dataFim}), ${idades.length} viajante(s)`,
            valorTotalBRL,
            aceitarCartao: true,
            aceitarPix: true,
            // Botão "voltar para a loja" da página da Stone volta para o site
            // (Wilson, 01/out/2026).
            urlSucesso: `${new URL(req.url).origin}/produtos/seguro-viagem?pagamento=concluido`,
          });
          await supabase
            .from("pagamentos")
            .update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url })
            .eq("id", pagamentoPendente.id);
          checkoutUrl = checkout.url;
        }
      } catch (erroCheckout) {
        console.error("Erro ao criar checkout Pagar.me (seguro-viagem-selfservice):", erroCheckout);
      }
    }

    // E-mail pro time interno.
    await enviarEmail({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
      replyTo: email || undefined,
      subject: `[${TAG_SELF_SERVICE}] Novo pedido de Seguro Viagem — ${nome}`,
      text: resumoTexto,
      html: resumoHtml,
    });

    // E-mail pro cliente com os próximos passos — "confirmação" de
    // PEDIDO, não de pagamento (o pagamento é confirmado pelo webhook).
    const passoPagamento = checkoutUrl
      ? "Pagamento — você foi direcionado para a página segura da Stone (Pix ou cartão). Se não concluiu, é só nos chamar que reenviamos o link."
      : "Pagamento — te enviamos o link de pagamento (Pix ou cartão de crédito) pelo WhatsApp e por e-mail.";
    const passos = [
      `Conferência — confirmamos com a ${seguradoraNome} o plano adequado ao seu roteiro, datas e idades.`,
      passoPagamento,
      "Emissão — depois do pagamento, a seguradora emite a apólice (ou certificado) e enviamos pra você por e-mail e WhatsApp. Confira os dados assim que receber.",
      "Durante a viagem — em caso de necessidade, siga os canais de atendimento indicados na apólice e, sempre que possível, fale com a central da seguradora antes de fazer despesas por conta própria.",
    ];
    const textoCliente = [
      `Olá, ${nome}!`,
      "",
      "Recebemos seu pedido de Seguro Viagem. Veja como funciona a partir daqui:",
      "",
      ...passos.map((passo, i) => `${i + 1}. ${passo}`),
      "",
      "Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp.",
      "",
      "Ajisai",
    ].join("\n");
    const htmlCliente = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <p>Olá, ${escapeHtml(nome)}!</p>
        <p>Recebemos seu pedido de Seguro Viagem. Veja como funciona a partir daqui:</p>
        <ol>${passos.map((passo) => `<li>${escapeHtml(passo)}</li>`).join("")}</ol>
        <p>Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp.</p>
        <p>Ajisai</p>
      </div>
    `.trim();

    const resultadoEmailCliente = await enviarEmail({
      to: [email],
      subject: "Recebemos seu pedido de Seguro Viagem — próximos passos",
      text: textoCliente,
      html: htmlCliente,
    });
    const { error: erroAtualizarEmail } = await supabase
      .from("clientes")
      .update({
        email_confirmacao_enviado: resultadoEmailCliente.ok,
        email_confirmacao_provider_id: resultadoEmailCliente.providerId,
      })
      .eq("id", cliente.id);
    if (erroAtualizarEmail) {
      console.error("Erro ao registrar histórico do e-mail de confirmação (seguro-viagem-selfservice):", erroAtualizarEmail);
    }

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Seguro Viagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
