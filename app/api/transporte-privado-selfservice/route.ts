import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { criarCheckoutParaCliente } from "../../../lib/pagarme/checkoutPedido";
import {
  CONTRATO_TRANSPORTE_VERSAO,
  textoContratoTransporte,
  type DadosContratoTransporte,
  type ServicoContrato,
} from "../../lib/contratoTransportePrivado";
import { createAdminClient } from "../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../lib/crm/origem";

export const runtime = "nodejs";

// Self-checkout de Transporte Privado em /produtos — pedido do Wilson,
// 25/set/2026: "enriquecer nossa pagina de motorista privado tanto na
// /produtos quanto calculadora reversa e self-service [...] adicionar
// coaster na /produtos", seguido de "usar template atual igual cambio,
// jr pass, etc" quando viu o modal ainda no formato antigo (calculadora
// + botão avulso de WhatsApp) — confirmado via AskUserQuestion: fluxo
// completo de self-checkout, mesmo padrão de /api/cambio-selfservice e
// /api/seguro-viagem-selfservice (lead cai no CRM com a tag
// SELF-SERVICE, time fecha a logística real pelo WhatsApp; não existe
// gateway de pagamento no site).

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mesmo padrão best-effort de /api/cambio-selfservice: se RESEND_API_KEY
// não estiver configurada ou o envio falhar, só loga — o lead já foi
// gravado no CRM antes dessa chamada.
async function notificarPorEmail(params: {
  nome: string;
  email: string;
  whatsapp: string;
  resumoTexto: string;
  resumoHtml: string;
  nomeProduto: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[email] (transporte-privado-selfservice) RESEND_API_KEY configurada:", Boolean(apiKey));
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
        subject: `[${TAG_SELF_SERVICE}] Novo pedido de ${params.nomeProduto} — ${params.nome}`,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });

    // Log de diagnóstico (Wilson, 01/out/2026: e-mails não chegavam e não havia erro no log).
    console.log("[email] Resend (transporte-privado-selfservice) respondeu status", resendResponse.status);
    if (!resendResponse.ok) {
      console.error("Erro Resend (transporte-privado-selfservice):", await resendResponse.text());
    }
  } catch (err) {
    console.error("Erro ao notificar por e-mail (transporte-privado-selfservice):", err);
  }
}

async function enviarCopiaContrato(params: {
  nome: string;
  email: string;
  contratoTexto: string;
  contratoHash: string;
  momentoAssinatura: string;
  ipAssinatura: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.email) return;
  const rodape = `\n\nAssinado eletronicamente por ${params.nome} em ${params.momentoAssinatura} (IP ${params.ipAssinatura}).\nCódigo de integridade (SHA-256): ${params.contratoHash}`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: [params.email],
        subject: "Seu contrato de Transporte Privado — cópia assinada",
        text: `Olá, ${params.nome}!\n\nSegue a cópia do contrato que você assinou eletronicamente no site da Ajisai.\n\n${params.contratoTexto}${rodape}`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;"><p>Olá, ${escapeHtml(params.nome)}!</p><p>Segue a cópia do contrato que você assinou eletronicamente no site da Ajisai.</p><pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${escapeHtml(params.contratoTexto + rodape)}</pre></div>`,
      }),
    });
    if (!r.ok) console.error("Erro Resend (cópia do contrato):", await r.text());
  } catch (err) {
    console.error("Erro ao enviar cópia do contrato:", err);
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

    const veiculo = String(body.veiculo || "").trim();
    const itens = Array.isArray(body.itens) ? body.itens : [];
    const resumo = String(body.resumo || "").trim();

    if (itens.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos uma rota ou tour de transporte privado." },
        { status: 400 },
      );
    }

    const motoristaUSD = Number(body.motoristaUSD) || 0;
    const roteiroUSD = Number(body.roteiroUSD) || 0;
    const adicionaisUSD = Number(body.adicionaisUSD) || 0;
    const totalUSD = Number(body.totalUSD) || 0;
    const totalBRL = Number(body.totalBRL) || null;
    const formaPagamento = String(body.formaPagamento || "").trim();
    const observacoesCliente = String(body.observacoes || "").trim();
    // Confirmação do tickbox de termos e condições — pedido do Wilson,
    // 25/set/2026: "criar termos e condicoes para aceite de contratacao
    // de motorista privado em transporte privado". O botão de enviar já
    // fica desabilitado no front sem o aceite (ver formValido em
    // TransporteModal); aqui só registra a confirmação pro CRM/auditoria.
    const termosAceitos = Boolean(body.termosAceitos);
    // Campos próprios de data/horário/voo e opcionais — adicionados no
    // redesenho da página em 4 etapas (Wilson, 29/set/2026: "pedir datas
    // da viagem em campos próprios em vez de depender de observações" +
    // opcionais Meet & Greet / cadeirinha / motorista bilíngue como
    // checkbox). Todos opcionais aqui; só entram no resumo do lead.
    const dataServico = String(body.dataServico || "").trim();
    const numeroVoo = String(body.numeroVoo || "").trim();
    // Período no Japão e avisos da seleção (dias sem veículo, transfer
    // sem o par) — serviços por dia desde 30/set/2026 (Wilson).
    const dataChegada = String(body.dataChegada || "").trim();
    const dataPartida = String(body.dataPartida || "").trim();
    const avisos: string[] = Array.isArray(body.avisos)
      ? body.avisos.map((a: unknown) => String(a).trim()).filter(Boolean).slice(0, 20)
      : [];
    // Mesmo endpoint para os dois produtos de transporte em /produtos —
    // Transfer Aeroporto virou página própria em 30/set/2026 (Wilson).
    const ehTransfer = body.produto === "transfer-aeroporto";
    const nomeProduto = ehTransfer ? "Transfer Aeroporto" : "Transporte Privado";
    // Nº de passageiros — 1ª etapa da página desde 30/set/2026 (Wilson).
    const passageiros = Math.max(0, Math.min(99, Math.floor(Number(body.passageiros) || 0)));
    const opcionais: string[] = Array.isArray(body.opcionais)
      ? body.opcionais.map((o: unknown) => String(o).trim()).filter(Boolean).slice(0, 5)
      : [];
    const objetivo = String(body.objetivo || "").trim().slice(0, 60);
    const malas = Math.max(0, Math.min(99, Math.floor(Number(body.malas) || 0)));
    const enderecosItens = itens
      .map((it: Record<string, unknown>, i: number) =>
        it?.enderecoPartida ? `${i + 1}) A: ${String(it.enderecoPartida).slice(0, 200)} → B: ${String(it.enderecoDestino || "").slice(0, 200)}` : "",
      )
      .filter(Boolean);

    // Contrato + assinatura eletrônica + pagamento online — só Transporte
    // Privado (Wilson, 06/out/2026). O texto é regerado AQUI a partir dos
    // dados recebidos (o mesmo gerador da página) e é esse texto que recebe
    // o hash e fica registrado.
    let contratoTexto = "";
    let contratoHash = "";
    const assinaturaNome = String(body.assinaturaNome || "").trim().slice(0, 200);
    const cpf = String(body.cpf || "").replace(/\D/g, "");
    if (!ehTransfer) {
      const normalizar = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");
      if (body.contratoAssinado !== true || normalizar(assinaturaNome) !== normalizar(nome) || cpf.length !== 11) {
        return NextResponse.json(
          { error: "Assine o contrato digitando seu nome completo e informe o CPF." },
          { status: 400 },
        );
      }
      const c = (body.contrato ?? {}) as Record<string, unknown>;
      const txt = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
      const servicosContrato: ServicoContrato[] = (Array.isArray(c.servicos) ? c.servicos : []).slice(0, 60).map((sv: Record<string, unknown>) => ({
        data: txt(sv.data, 20),
        horario: txt(sv.horario, 10),
        rota: txt(sv.rota, 120),
        veiculo: txt(sv.veiculo, 80),
        enderecoPartida: txt(sv.enderecoPartida),
        enderecoDestino: txt(sv.enderecoDestino),
        duracaoEstimada: txt(sv.duracaoEstimada, 120),
        valorUSD: Number(sv.valorUSD) || 0,
      }));
      const dados: DadosContratoTransporte = {
        nome,
        cpf: txt(c.cpf, 20),
        email,
        whatsapp,
        passageiros,
        dataChegada,
        dataPartida,
        servicos: servicosContrato,
        opcionais: (Array.isArray(c.opcionais) ? c.opcionais : []).map((o: unknown) => txt(o, 120)).slice(0, 5),
        totalUSD: Number(c.totalUSD) || totalUSD,
        totalBRL: Number(c.totalBRL) || totalBRL || 0,
        politicaCancelamento: txt(c.politicaCancelamento, 600),
      };
      contratoTexto = textoContratoTransporte(dados);
      contratoHash = createHash("sha256").update(contratoTexto, "utf8").digest("hex");
    }
    const ipAssinatura = (req.headers.get("x-forwarded-for") || "").split(",")[0]!.trim() || req.headers.get("x-real-ip") || "desconhecido";
    const momentoAssinatura = new Date().toISOString();

    const linhasResumo: [string, string][] = [
      ["Veículo(s)", veiculo],
      ["Serviços (dia — rota (veículo))", resumo || "Não especificado"],
      ["Avisos mostrados ao cliente", avisos.length ? avisos.join(" | ") : "Nenhum"],
      ["Motorista privado (US$)", `US$ ${motoristaUSD.toLocaleString("pt-BR")}`],
      ["Roteiro Personalizado (US$)", `US$ ${roteiroUSD.toLocaleString("pt-BR")}`],
      ["Opcionais (US$)", `US$ ${adicionaisUSD.toLocaleString("pt-BR")}`],
      ["Total (US$)", `US$ ${totalUSD.toLocaleString("pt-BR")}`],
      ["Valor total (referência BRL)", totalBRL ? `R$ ${totalBRL.toLocaleString("pt-BR")}` : "Não calculado"],
      ["Período no Japão", dataChegada || dataPartida ? `${dataChegada || "—"} a ${dataPartida || "—"}` : dataServico || "Não informado"],
      ["Passageiros", passageiros ? String(passageiros) : "Não informado"],
      ...(!ehTransfer
        ? ([
            ["Objetivo do serviço", objetivo || "Não informado"],
            ["Malas grandes", String(malas)],
            ["Endereços (A → B)", enderecosItens.length ? enderecosItens.join(" | ") : "Não informados"],
            ["CPF", cpf],
            [
              "Contrato",
              `Assinado eletronicamente por "${assinaturaNome}" em ${momentoAssinatura} (IP ${ipAssinatura}) — versão ${CONTRATO_TRANSPORTE_VERSAO}, SHA-256 ${contratoHash}`,
            ],
          ] as [string, string][])
        : []),
      ["Voo(s)", numeroVoo || "Não informado"],
      ["Opcionais solicitados", opcionais.length ? opcionais.join(", ") : "Nenhum"],
      ["Forma de pagamento escolhida", !ehTransfer ? "Online (Stone) — Pix ou cartão" : formaPagamento || "A combinar pelo WhatsApp"],
      ["Termos e condições aceitos", termosAceitos ? "Sim" : "Não confirmado"],
      ["Observações do cliente", observacoesCliente || "Nenhuma"],
    ];

    const resumoTexto = [
      `Novo pedido — ${nomeProduto} (self-checkout)`,
      "",
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      "",
      ...linhasResumo.map(([label, valor]) => `${label}: ${valor}`),
    ].join("\n");

    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo pedido — ${escapeHtml(nomeProduto)} (self-checkout)</h2>
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
        origem: `${TAG_SELF_SERVICE} — ${nomeProduto} (/produtos)`,
        produto_principal: "servico_individual",
        produto_secundario: [ehTransfer ? "transfer_aeroporto_hotel" : "transporte_privado"],
        valor_proposta: totalBRL,
        data_viagem: dataChegada || dataServico || null,
        estagio: "novo_lead",
        observacoes: `[${TAG_SELF_SERVICE}]\n${resumoTexto}`,
        ...(!ehTransfer
          ? {
              checkout_ip: ipAssinatura,
              checkout_user_agent: req.headers.get("user-agent"),
              termos_aceitos: termosAceitos,
              termos_versao: CONTRATO_TRANSPORTE_VERSAO,
              termos_aceitos_em: momentoAssinatura,
            }
          : {}),
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar lead (transporte-privado-selfservice):", erroCliente);
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
      console.error("Erro ao gravar interação (transporte-privado-selfservice):", erroInteracao);
    }

    let checkoutUrl: string | null = null;
    if (!ehTransfer) {
      // Texto integral do contrato assinado fica no histórico do cliente.
      const { error: erroContrato } = await supabase.from("interacoes").insert({
        cliente_id: cliente.id,
        tipo: "simulacao",
        conteudo: `[CONTRATO ASSINADO] ${CONTRATO_TRANSPORTE_VERSAO}\nAssinatura: "${assinaturaNome}" · ${momentoAssinatura} · IP ${ipAssinatura}\nSHA-256: ${contratoHash}\n\n${contratoTexto}`,
      });
      if (erroContrato) console.error("Erro ao gravar contrato (transporte-privado-selfservice):", erroContrato);

      if (body.pagarOnline === true && totalBRL && totalBRL > 0) {
        checkoutUrl = await criarCheckoutParaCliente({
          supabase,
          clienteId: cliente.id,
          valorBRL: totalBRL,
          itemNome: "Transporte Privado no Japão — Ajisai",
          itemDescricao: `${itens.length} serviço(s), ${dataChegada} a ${dataPartida}`,
          observacoes: `Transporte Privado — ${itens.length} serviço(s)`,
          urlSucesso: `${new URL(req.url).origin}/produtos/transporte-privado?pagamento=concluido`,
          rotuloLog: "transporte-privado-selfservice",
        });
      }

      // Cópia do contrato para o cliente.
      await enviarCopiaContrato({ nome, email, contratoTexto, contratoHash, momentoAssinatura, ipAssinatura });
    }

    await notificarPorEmail({ nome, email, whatsapp, resumoTexto, resumoHtml, nomeProduto });

    return NextResponse.json({ success: true, clienteId: cliente.id, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no self-checkout de Transporte Privado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Fale com a Alpinea pelo WhatsApp." },
      { status: 500 },
    );
  }
}
