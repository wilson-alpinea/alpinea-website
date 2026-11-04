import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailResend, escapeHtml } from "@/lib/email/enviar";
import { EMAIL_EQUIPE_EMPREGOS } from "@/lib/empregos/emailEquipe";
import { HOST_EMPREGOS } from "@/lib/crm/unidades";
import { dataBR, followUpsVencidos, rotuloPrazo } from "@/lib/empregos/followups";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// E-mail dos follow-ups do CRM de Empregos que vencem hoje ou já venceram
// (Wilson, 04/nov/2026). Chamado 1x por dia pelo Vercel Cron (vercel.json).
// Cada follow-up gera e-mail uma vez só (email_enviado_em); o alerta no sino
// do CRM continua até alguém concluir o follow-up na tela do candidato.
// Proteção: header Authorization: Bearer <CRON_SECRET> (o Vercel manda
// sozinho quando a variável CRON_SECRET existe no projeto).

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const admin = createAdminClient();
  const pendentes = (await followUpsVencidos(admin)).filter((f) => !f.email_enviado_em);
  let enviados = 0;
  for (const f of pendentes) {
    const link = `https://${HOST_EMPREGOS}/crm/empregos/${f.candidatura_id}#followup`;
    const linhas = [
      `Follow-up ${rotuloPrazo(f.data_alvo)} (${dataBR(f.data_alvo)})`,
      "",
      `Candidato: ${f.nome}`,
      f.vaga ? `Vaga: ${f.vaga}` : "",
      f.nota ? `Anotação: ${f.nota}` : "",
      f.created_by_email ? `Agendado por: ${f.created_by_email}` : "",
      "",
      `Abrir no CRM: ${link}`,
    ].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== ""));
    const destinos = Array.from(new Set([EMAIL_EQUIPE_EMPREGOS, f.created_by_email].filter((e): e is string => !!e && e.includes("@"))));
    const r = await enviarEmailResend({
      to: destinos,
      subject: `[Follow-up] ${f.nome} — ${dataBR(f.data_alvo)}`,
      text: linhas.join("\n"),
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #202B28;">${linhas
        .map((l) => (l.startsWith("Abrir no CRM:") ? `<p><a href="${link}" style="color:#27675B;">Abrir o candidato no CRM</a></p>` : l ? `<p style="margin:0 0 4px;">${escapeHtml(l)}</p>` : "<br/>"))
        .join("")}</div>`,
      rotuloLog: "empregos-followup",
    });
    if (r.ok) {
      enviados++;
      await admin.from("empregos_followups").update({ email_enviado_em: new Date().toISOString() }).eq("id", f.id);
    }
  }
  return NextResponse.json({ pendentes: pendentes.length, enviados });
}
