import { NextResponse } from "next/server";
import { atribuicaoDaRequisicao } from "../../../lib/crm/atribuicao";
import { createAdminClient } from "../../../lib/supabase/admin";
import { isServicoDoc, resumoDoCadastro, servicoDoc } from "../../../lib/crm/documentacao";

export const runtime = "nodejs";

// Cadastro dos serviços de Documentação (/documentacao) — Wilson, 29/out/2026.
// Visto específico, Certificado de Elegibilidade e exportação de pet. O
// cadastro vira um processo no CRM de Documentação (tabela
// documentacao_processos, migração 026) — CRM próprio, separado da Agência,
// como o de Seguro Viagem. Nada é cobrado no site: a equipe analisa o caso e
// fecha pelo WhatsApp. Avisa por e-mail como os outros self-service.

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const texto = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

async function notificarPorEmail(params: { assunto: string; email: string; resumoTexto: string; resumoHtml: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando notificação por e-mail (documentacao).");
    return;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Ajisai <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: params.email || undefined,
        subject: params.assunto,
        text: params.resumoTexto,
        html: params.resumoHtml,
      }),
    });
    if (!r.ok) console.error("Erro Resend (documentacao):", await r.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (documentacao):", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const servico = texto(body.servico, 30);
    if (!isServicoDoc(servico)) return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
    const nomeServico = servicoDoc(servico).label;

    const nome = texto(body.nome, 200);
    const email = texto(body.email, 200);
    const whatsapp = texto(body.whatsapp, 40);
    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: "Nome, e-mail e WhatsApp são obrigatórios." }, { status: 400 });
    }

    const respostas: [string, string][] = Array.isArray(body.respostas)
      ? body.respostas
          .filter((r: unknown) => Array.isArray(r) && r.length === 2)
          .slice(0, 80)
          .map((r: unknown[]) => [texto(r[0], 200), texto(r[1], 1000)] as [string, string])
      : [];
    if (respostas.length === 0 || respostas.some(([, v]) => !v)) {
      return NextResponse.json({ error: "Responda todas as perguntas do cadastro." }, { status: 400 });
    }
    const campos: Record<string, string> = {};
    if (body.campos && typeof body.campos === "object") {
      for (const [k, v] of Object.entries(body.campos as Record<string, unknown>).slice(0, 80)) {
        if (/^[a-zA-Z_][\w]{0,40}$/.test(k)) campos[k] = texto(v, 1000);
      }
    }
    const valorReferenciaBRL = Number(body.valorReferenciaBRL) > 0 ? Math.round(Number(body.valorReferenciaBRL) * 100) / 100 : null;

    // Registro do aceite (até termos o contrato digital com assinatura).
    const aceites: string[] = Array.isArray(body.aceites) ? body.aceites.map((a: unknown) => texto(a, 200)).filter(Boolean).slice(0, 10) : [];
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || null;
    const navegador = texto(req.headers.get("user-agent"), 300) || null;
    const termosVersao = texto(body.termosVersao, 80) || null;
    const agora = new Date();

    const resumo = resumoDoCadastro(servico, campos, { consulado: campos.consulado ?? "" }) || null;

    const titulo = `Novo cadastro — ${nomeServico} (Documentação)`;
    const linhasAceite: [string, string][] = [
      ["Termos aceitos", aceites.length ? aceites.join(" | ") : "Nenhum"],
      ["Versão dos termos", termosVersao ?? "não informada"],
      ["Aceite registrado em", agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " (horário de Brasília)"],
      ["IP do aceite", ip ?? "não identificado"],
    ];
    const todas = [...respostas, ...linhasAceite];
    const resumoTexto = [titulo, "", `Nome: ${nome}`, `E-mail: ${email}`, `WhatsApp: ${whatsapp}`, "", ...todas.map(([p, v]) => `${p}: ${v}`)].join("\n");
    const resumoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>${escapeHtml(titulo)}</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}<br/><strong>E-mail:</strong> ${escapeHtml(email)}<br/><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        ${todas.map(([p, v]) => `<p><strong>${escapeHtml(p)}:</strong> ${escapeHtml(v)}</p>`).join("\n")}
        <p><a href="https://documentos.alpinea.io/crm/documentacao">Abrir no CRM de Documentação</a></p>
      </div>`.trim();

    const supabase = createAdminClient();
    const atribuicao = await atribuicaoDaRequisicao(req, supabase);
    const { data: processo, error } = await supabase
      .from("documentacao_processos")
      .insert({
        parceiro_id: atribuicao.parceiro_id,
        canal: atribuicao.canal,
        canal_detalhe: atribuicao.canal_detalhe,
        utm: atribuicao.utm,
        servico,
        nome,
        email,
        telefone: whatsapp,
        resumo,
        respostas,
        campos,
        valor_referencia_brl: valorReferenciaBRL,
        termos_versao: termosVersao,
        termos_aceitos_em: agora.toISOString(),
        aceites,
        checkout_ip: ip,
        checkout_user_agent: navegador,
        historico: [{ em: agora.toISOString(), por: "site", tipo: "nota", texto: `Cadastro enviado pelo site (${nomeServico}).` }],
      })
      .select("id")
      .single();

    if (error || !processo) {
      console.error("Erro ao gravar processo (documentacao):", error);
      return NextResponse.json({ error: "Não foi possível registrar seu cadastro agora. Tente novamente ou fale pelo WhatsApp." }, { status: 500 });
    }

    await notificarPorEmail({ assunto: `[DOCUMENTAÇÃO] ${titulo} — ${nome}`, email, resumoTexto, resumoHtml });

    return NextResponse.json({ success: true, id: processo.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no cadastro de Documentação:", error);
    return NextResponse.json({ error: "Erro interno do servidor. Fale com a Ajisai pelo WhatsApp." }, { status: 500 });
  }
}
