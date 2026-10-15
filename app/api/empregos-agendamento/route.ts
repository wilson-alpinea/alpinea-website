import { NextResponse } from "next/server";
import { EMAIL_EQUIPE_EMPREGOS } from "@/lib/empregos/emailEquipe";
import { createAdminClient } from "../../../lib/supabase/admin";
import { carregarCandidaturaPublica } from "../../../lib/empregos/candidaturaPublica";
import { horariosDisponiveis } from "../../../lib/empregos/agendaServidor";
import { proximaEtapa, vagaPrecisaProposta } from "../../lib/etapasCandidatura";
import { formatarDataHoraBrasilia } from "../../lib/agendaEntrevista";
import { AVISO_PRAZOS, candidatoTemReEntry, passosVisiveis } from "../../lib/prazosCandidatura";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "../../../lib/email/templateCliente";

export const runtime = "nodejs";

// Etapa 4 — candidato escolhe o horário da pré-entrevista (Wilson,
// 06/out/2026). O horário é reconferido contra a agenda do CRM aqui no
// servidor; escolher de novo remarca (o agendamento anterior é cancelado).

async function enviarEmail(para: string, assunto: string, texto: string, replyTo?: string, html?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Ajisai Empregos <contato@alpinea.io>", to: [para], reply_to: replyTo, subject: assunto, text: texto, ...(html ? { html } : {}) }),
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
      EMAIL_EQUIPE_EMPREGOS,
      `[Candidatura · Etapa 4] Pré-entrevista agendada — ${c.nome} ${c.sobrenome} — ${quando}`,
      [`Candidato: ${c.nome} ${c.sobrenome} — ${c.email} — ${c.telefone}`, `Vaga: ${c.vaga_titulo} — ${c.vaga_empresa}`, `Quando: ${quando} (Brasília)`].join("\n"),
      c.email,
    );
    // E-mail ao candidato no mesmo modelo visual dos e-mails do JR Pass
    // (linha do tempo + WhatsApp) — Wilson, 15/out/2026.
    const temReEntry = candidatoTemReEntry(c);
    const passos = passosVisiveis({ semEtapa3: !vagaPrecisaProposta(c.vaga_id), temReEntry });
    const emailCandidato: EmailClienteParams = {
      nome: c.nome,
      marca: "Empregos no Japão",
      rotuloAndamento: "Andamento da sua candidatura",
      titulo: "Sua pré-entrevista está agendada",
      intro: `Sua pré-entrevista para a vaga ${c.vaga_titulo} (${c.vaga_empresa}) está marcada. A conversa é online, com a equipe Ajisai.`,
      status: "Pré-entrevista agendada",
      etapaAtual: passos.findIndex((p) => p.id === "etapa4"),
      etapas: passos.map((p) => ({ titulo: p.curto, texto: [p.prazo, p.detalhe].filter(Boolean).join(" — ") })),
      resumo: [
        ["Quando", `${quando} (horário de Brasília)`],
        ["Vaga", `${c.vaga_titulo} — ${c.vaga_empresa}`],
        ["Reunião", config.link_reuniao || "Enviaremos o link antes do horário"],
      ],
      aviso: temReEntry ? "Prazos médios — podem variar conforme a empreiteira." : AVISO_PRAZOS,
      extras: ["Se precisar remarcar, use o mesmo link da sua candidatura ou fale com a equipe Ajisai pelo WhatsApp."],
      mensagemWhatsapp: `Olá! Sou ${c.nome} ${c.sobrenome} e agendei a pré-entrevista para a vaga ${c.vaga_titulo}.`,
    };
    await enviarEmail(
      c.email,
      "Sua pré-entrevista está agendada — Ajisai Empregos",
      emailClienteTexto(emailCandidato),
      undefined,
      emailClienteHtml(emailCandidato),
    );

    return NextResponse.json({ sucesso: true, inicio: escolhido.inicio, linkReuniao: config.link_reuniao });
  } catch (err) {
    console.error("Erro no agendamento:", err);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
