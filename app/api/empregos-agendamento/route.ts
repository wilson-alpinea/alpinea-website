import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { carregarCandidaturaPublica } from "../../../lib/empregos/candidaturaPublica";
import { horariosDisponiveis } from "../../../lib/empregos/agendaServidor";
import { proximaEtapa } from "../../lib/etapasCandidatura";
import { formatarDataHoraBrasilia } from "../../lib/agendaEntrevista";
import { AVISO_PRAZOS, PASSOS_PRAZO } from "../../lib/prazosCandidatura";

export const runtime = "nodejs";

// Etapa 4 — candidato escolhe o horário da pré-entrevista (Wilson,
// 06/out/2026). O horário é reconferido contra a agenda do CRM aqui no
// servidor; escolher de novo remarca (o agendamento anterior é cancelado).

async function enviarEmail(para: string, assunto: string, texto: string, replyTo?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Alpinea <contato@alpinea.io>", to: [para], reply_to: replyTo, subject: assunto, text: texto }),
  }).catch((e) => console.error("Erro Resend (agendamento):", e));
}

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { candidaturaId?: string; token?: string; inicio?: string } | null;
    const c = await carregarCandidaturaPublica(String(corpo?.candidaturaId ?? ""), corpo?.token);
    if (!c) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (proximaEtapa(c) !== "agendamento") {
      return NextResponse.json({ error: "Conclua as etapas anteriores antes de agendar." }, { status: 400 });
    }

    const { config, horarios } = await horariosDisponiveis();
    const pedido = new Date(String(corpo?.inicio ?? ""));
    const escolhido = Number.isNaN(pedido.getTime()) ? undefined : horarios.find((h) => h.inicio === pedido.toISOString());
    if (!escolhido) {
      return NextResponse.json({ error: "Esse horário não está mais disponível. Escolha outro." }, { status: 409 });
    }

    const supabase = createAdminClient();
    await supabase.from("entrevistas_agendadas").update({ status: "cancelada" }).eq("candidatura_id", c.id).eq("status", "agendada");
    const { error } = await supabase
      .from("entrevistas_agendadas")
      .insert({ candidatura_id: c.id, inicio: escolhido.inicio, fim: escolhido.fim, status: "agendada" });
    if (error) {
      console.error("Erro ao agendar entrevista:", error);
      return NextResponse.json({ error: "Não foi possível agendar agora. Tente novamente." }, { status: 500 });
    }
    await supabase.from("candidaturas_vagas").update({ status: "em_analise", updated_at: new Date().toISOString() }).eq("id", c.id).eq("status", "novo");

    const quando = formatarDataHoraBrasilia(escolhido.inicio);
    await enviarEmail(
      "wilson@alpinea.io",
      `[Candidatura · Etapa 4] Pré-entrevista agendada — ${c.nome} ${c.sobrenome} — ${quando}`,
      [`Candidato: ${c.nome} ${c.sobrenome} — ${c.email} — ${c.telefone}`, `Vaga: ${c.vaga_titulo} — ${c.vaga_empresa}`, `Quando: ${quando} (Brasília)`].join("\n"),
      c.email,
    );
    await enviarEmail(
      c.email,
      "Sua pré-entrevista está agendada — Alpinea Empregos",
      [
        `Olá, ${c.nome}!`,
        "",
        `Sua pré-entrevista para a vaga ${c.vaga_titulo} (${c.vaga_empresa}) está marcada para ${quando}, horário de Brasília.`,
        config.link_reuniao ? `Link da reunião: ${config.link_reuniao}` : "Enviaremos o link da reunião antes do horário.",
        "",
        "Próximos passos (prazos médios):",
        ...PASSOS_PRAZO.slice(PASSOS_PRAZO.findIndex((p) => p.id === "empreiteira")).map((p) => `- ${p.titulo}: ${p.prazo}`),
        AVISO_PRAZOS,
        "",
        "Se precisar remarcar, use o mesmo link da sua candidatura ou fale com a equipe Ajisai pelo WhatsApp +55 (11) 93030-0101.",
      ].join("\n"),
    );

    return NextResponse.json({ sucesso: true, inicio: escolhido.inicio, linkReuniao: config.link_reuniao });
  } catch (err) {
    console.error("Erro no agendamento:", err);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
