import { NextResponse } from "next/server";
import { atribuicaoDaRequisicao } from "../../../../lib/crm/atribuicao";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { TAG_SELF_SERVICE } from "../../../../lib/crm/origem";
import { fecharCheckout, ErroSeguroViagem, seguroViagemConfigurado } from "../../../../lib/seguroviagem/client";
import { tetoAgencia, verificar } from "../../../../lib/seguroviagem/niveis";
import { enviarEmailResend, escapeHtml } from "../../../../lib/email/enviar";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "../../../../lib/email/templateCliente";
import { comMargem, idadeNaData, margemDoPlano } from "../../../lib/margemSeguroViagemParceiro";

export const runtime = "nodejs";

// Fecha a compra do Seguro Viagem na Real Seguro Viagem (modo
// "comissionado": o cliente paga custo + nossa margem direto no link do
// fornecedor — Wilson, 26/out/2026) e registra o lead no CRM.
// A margem é recalculada aqui a partir das idades (nunca vem do navegador).
//
// ⚠️ A API não tem webhook nem consulta de status: o CRM não sabe sozinho
// se o cliente pagou. O lead entra como "link de pagamento enviado" e a
// confirmação é feita pelo painel do fornecedor.

const TERMOS_VERSAO = "seguro-viagem-realseguro-2026-10-26";
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ipDaRequisicao(req: Request): string | null {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

type ViajanteBody = { nome?: unknown; nascimento?: unknown; documento?: unknown; tipoDocumento?: unknown };

export async function POST(req: Request) {
  if (!seguroViagemConfigurado()) {
    return NextResponse.json({ error: "Compra online indisponível no momento. Fale com a nossa equipe pelo WhatsApp." }, { status: 503 });
  }
  try {
    const body = await req.json();
    const dados = verificar(String(body.token || ""));
    if (!dados) {
      return NextResponse.json({ error: "A cotação expirou. Refaça a cotação para ver os preços atualizados." }, { status: 409 });
    }
    const nome = String(body.nome || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 160);
    const celular = String(body.celular || "").trim().slice(0, 30);
    const observacoes = String(body.observacoes || "").trim().slice(0, 1000);
    const viajantesBody: ViajanteBody[] = Array.isArray(body.viajantes) ? body.viajantes : [];

    const faltando: string[] = [];
    if (nome.length < 3) faltando.push("nome completo");
    if (!/^\S+@\S+\.\S+$/.test(email)) faltando.push("e-mail válido");
    if (celular.replace(/\D/g, "").length < 10) faltando.push("celular com DDD");
    if (!body.termosAceitos) faltando.push("aceite dos termos");
    if (viajantesBody.length !== dados.nasc.length) faltando.push("dados de todos os viajantes");

    const viajantes = viajantesBody.map((v, i) => {
      const tipo = v.tipoDocumento === "passaporte" ? "passaporte" : "cpf";
      const documento = String(v.documento || "").trim().slice(0, 30);
      const nomeV = String(v.nome || "").trim().slice(0, 120);
      const nascimento = String(v.nascimento || "");
      if (nomeV.length < 3) faltando.push(`nome do viajante ${i + 1}`);
      if (nascimento !== dados.nasc[i]) faltando.push(`data de nascimento do viajante ${i + 1} igual à da cotação`);
      if (tipo === "cpf" ? documento.replace(/\D/g, "").length !== 11 : documento.length < 5) faltando.push(`documento do viajante ${i + 1}`);
      return {
        nome_completo: nomeV,
        data_nascimento: nascimento,
        passaporte_cpf: tipo === "cpf" ? documento.replace(/\D/g, "") : documento,
        cidadania: tipo === "cpf" ? "brasil" : "estrangeiro",
      };
    });
    if (faltando.length > 0) {
      return NextResponse.json({ error: `Faltam dados: ${[...new Set(faltando)].join(", ")}.` }, { status: 400 });
    }

    const idades = dados.nasc.map((n) => idadeNaData(n, dados.partida) ?? 0);
    const margem = margemDoPlano({ idades, custo: dados.custo, balcao: dados.balcao, teto: tetoAgencia() });
    const valorEstimado = comMargem(dados.custo, margem);

    let checkout: { url: string; aviso: string | null };
    try {
      checkout = await fecharCheckout({
        cotacaoId: dados.c,
        apelido: dados.a,
        margemPorcentagem: margem,
        cliente: { nome, email, celular },
        viajantes,
      });
    } catch (erro) {
      console.error("Erro no checkout Real Seguro Viagem:", erro);
      const msg =
        erro instanceof ErroSeguroViagem && (erro.status === 400 || erro.status === 422)
          ? `O fornecedor recusou o pedido: ${erro.message}`
          : "Não foi possível gerar o pagamento agora. Tente de novo em instantes.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const linhas: [string, string][] = [
      ["Fornecedor", "Real Seguro Viagem (modo comissionado — cliente paga no link do fornecedor)"],
      ["Plano", `${dados.nome} — ${dados.seguradora}`],
      ["Período", `${dados.partida} a ${dados.retorno}`],
      ["Viajantes", viajantes.map((v, i) => `${v.nome_completo} (${idades[i]} anos)`).join("; ")],
      ["Margem aplicada", `${margem}%`],
      ["Valor estimado ao cliente (Pix)", brl(valorEstimado)],
      ["Custo da agência", brl(dados.custo)],
      ["Link de pagamento", checkout.url],
      ...(checkout.aviso ? ([["Aviso do fornecedor", checkout.aviso]] as [string, string][]) : []),
      ["Observações do cliente", observacoes || "Nenhuma"],
    ];
    const resumo = ["Novo pedido — Seguro Viagem (Real Seguro Viagem)", "", `Nome: ${nome}`, `E-mail: ${email}`, `Celular: ${celular}`, "", ...linhas.map(([r, v]) => `${r}: ${v}`)].join("\n");

    // CRM — nunca derruba a venda (o link já foi gerado).
    try {
      const supabase = createAdminClient();
      const atribuicao = await atribuicaoDaRequisicao(req, supabase);
      const { data: cliente, error } = await supabase
        .from("clientes")
        .insert({
          ...atribuicao,
          nome,
          email,
          telefone: celular,
          origem: `${TAG_SELF_SERVICE} — Seguro Viagem (Real Seguro Viagem)`,
          produto_principal: "servico_individual",
          produto_secundario: ["seguro_viagem"],
          valor_proposta: valorEstimado,
          data_viagem: dados.partida,
          estagio: "proposta_enviada",
          observacoes: `[${TAG_SELF_SERVICE}]\n${resumo}`,
          checkout_ip: ipDaRequisicao(req),
          checkout_user_agent: req.headers.get("user-agent"),
          termos_aceitos: true,
          termos_versao: TERMOS_VERSAO,
          termos_aceitos_em: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error || !cliente) console.error("Erro ao gravar lead (seguro-viagem checkout):", error);
      else await supabase.from("interacoes").insert({ cliente_id: cliente.id, tipo: "simulacao", conteudo: `[${TAG_SELF_SERVICE}]\n${resumo}` });
    } catch (erroCrm) {
      console.error("Erro no CRM (seguro-viagem checkout):", erroCrm);
    }

    await enviarEmailResend({
      to: ["wilson@alpinea.io", "financeiro@ajisaiwork.com.br"],
      replyTo: email,
      subject: `[${TAG_SELF_SERVICE}] Seguro Viagem (Real Seguro Viagem) — ${nome}`,
      text: resumo,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>Novo pedido — Seguro Viagem</h2>${linhas
        .map(([r, v]) => `<p><strong>${escapeHtml(r)}:</strong> ${escapeHtml(v)}</p>`)
        .join("")}</div>`,
      rotuloLog: "seguro-viagem-checkout",
    });

    const emailCliente: EmailClienteParams = {
      nome,
      titulo: "Seu seguro viagem está quase pronto",
      intro: "Falta só o pagamento. Use o link seguro abaixo para pagar com Pix ou cartão — a apólice é emitida pela seguradora logo após a confirmação.",
      status: "Aguardando pagamento",
      etapaAtual: 1,
      etapas: [
        { titulo: "Plano escolhido", texto: `${dados.nome} — ${dados.seguradora}.` },
        { titulo: "Pagamento", texto: `Link de pagamento: ${checkout.url}` },
        { titulo: "Apólice emitida", texto: "A apólice chega por e-mail após a confirmação do pagamento." },
        { titulo: "Viagem protegida", texto: "Em caso de necessidade, acione a central de atendimento da seguradora indicada na apólice." },
      ],
      resumo: [
        ["Plano", dados.nome],
        ["Período", `${dados.partida} a ${dados.retorno}`],
        ["Viajantes", String(viajantes.length)],
        ["Valor (Pix)", brl(valorEstimado)],
      ],
      mensagemWhatsapp: `Olá! Fiz um pedido de Seguro Viagem no site da Ajisai (${nome}) e preciso de ajuda.`,
    };
    await enviarEmailResend({
      to: [email],
      subject: "Seu seguro viagem — link de pagamento",
      text: emailClienteTexto(emailCliente),
      html: emailClienteHtml(emailCliente),
      rotuloLog: "seguro-viagem-checkout cliente",
    });

    return NextResponse.json({ url: checkout.url, aviso: checkout.aviso });
  } catch (erro) {
    console.error("Erro no checkout de seguro viagem:", erro);
    return NextResponse.json({ error: "Erro interno do servidor. Fale com a Ajisai pelo WhatsApp." }, { status: 500 });
  }
}
