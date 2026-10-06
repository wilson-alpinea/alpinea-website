import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { fichaLiberada, linhasFicha, parseFicha, pendenciasFicha, pontosRevisarFicha } from "../../lib/fichaCadastral";

export const runtime = "nodejs";

// Etapa 2 da candidatura — grava a ficha cadastral unificada (ver
// app/lib/fichaCadastral.ts). Acesso pelo link /empregos/ficha/<id>?t=<token>:
// o servidor reconfere o token e a liberação (score >= 80 ou liberada pela
// equipe no CRM) — nunca confiar só na navegação do cliente.

async function notificarPorEmail(params: { assunto: string; texto: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando notificação por e-mail.");
    return;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: params.replyTo || undefined,
        subject: params.assunto,
        text: params.texto,
        html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${params.texto
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")}</pre>`,
      }),
    });
    if (!resp.ok) console.error("Erro Resend (empregos-ficha):", await resp.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (empregos-ficha):", err);
  }
}

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { candidaturaId?: string; token?: string; ficha?: unknown } | null;
    const candidaturaId = String(corpo?.candidaturaId ?? "").trim();
    const token = String(corpo?.token ?? "").trim();
    if (!candidaturaId || !token) {
      return NextResponse.json({ error: "Link da ficha inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: c, error: erroBusca } = await supabase
      .from("candidaturas_vagas")
      .select("id, nome, sobrenome, email, vaga_titulo, vaga_empresa, pontuacao, classificacao, ficha_token, ficha_liberada, pontos_revisar")
      .eq("id", candidaturaId)
      .maybeSingle();
    if (erroBusca || !c || c.ficha_token !== token) {
      return NextResponse.json({ error: "Link da ficha inválido ou expirado." }, { status: 404 });
    }
    if (!fichaLiberada(c)) {
      return NextResponse.json({ error: "Esta candidatura ainda não foi liberada para a etapa 2." }, { status: 403 });
    }

    const ficha = parseFicha(corpo?.ficha);
    const faltas = pendenciasFicha(ficha);
    if (faltas.length > 0) {
      return NextResponse.json({ error: `Faltou preencher: ${faltas.slice(0, 6).join(", ")}${faltas.length > 6 ? "…" : ""}.`, faltas }, { status: 400 });
    }

    // Soma os pontos de atenção da ficha aos da etapa 1 (sem duplicar).
    const revisarAnteriores = Array.isArray(c.pontos_revisar) ? (c.pontos_revisar as string[]) : [];
    const revisar = Array.from(new Set([...revisarAnteriores, ...pontosRevisarFicha(ficha)]));

    const agora = new Date().toISOString();
    const { error: erroUpdate } = await supabase
      .from("candidaturas_vagas")
      .update({ ficha, ficha_enviada_em: agora, pontos_revisar: revisar, updated_at: agora })
      .eq("id", candidaturaId);
    if (erroUpdate) {
      console.error("Erro ao gravar ficha (empregos-ficha):", erroUpdate);
      return NextResponse.json({ error: "Não foi possível salvar sua ficha agora. Tente novamente." }, { status: 500 });
    }

    const texto = [
      "Ficha cadastral recebida (etapa 2) — candidatura /empregos",
      "",
      `Vaga: ${c.vaga_empresa} — ${c.vaga_titulo}`,
      `Candidato: ${c.nome} ${c.sobrenome} (${c.pontuacao ?? "—"}%)`,
      `E-mail: ${c.email}`,
      "",
      ...linhasFicha(ficha).flatMap((g) => [
        `== ${g.grupo} ==`,
        ...g.linhas.map(([k, v, atencao]) => `${atencao ? "⚠ " : ""}${k}: ${v}`),
        "",
      ]),
    ].join("\n");
    await notificarPorEmail({
      assunto: `[Candidatura] Ficha cadastral — ${c.vaga_titulo} — ${c.nome} ${c.sobrenome}`,
      texto,
      replyTo: c.email,
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro na ficha cadastral:", error);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
