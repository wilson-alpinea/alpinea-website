// Envio best-effort via Resend — mesmo padrão das rotas *-selfservice,
// extraído para o fluxo do eSIM (Wilson, 26/out/2026). Nunca lança.
export async function enviarEmailResend(params: {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  rotuloLog: string;
}): Promise<{ ok: boolean; providerId: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY não configurada — pulando e-mail (${params.rotuloLog}).`);
    return { ok: false, providerId: null };
  }
  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Ajisai <contato@alpinea.io>",
        to: params.to,
        reply_to: params.replyTo || undefined,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });
    const texto = await resposta.text().catch(() => "");
    console.log(`[email] Resend (${params.rotuloLog}) respondeu status`, resposta.status);
    if (!resposta.ok) {
      console.error(`Erro Resend (${params.rotuloLog}):`, texto || "(corpo vazio)");
      return { ok: false, providerId: null };
    }
    let id: string | null = null;
    try {
      const dados = JSON.parse(texto) as { id?: unknown };
      id = typeof dados.id === "string" ? dados.id : null;
    } catch {
      id = null;
    }
    return { ok: true, providerId: id };
  } catch (erro) {
    console.error(`Erro ao enviar e-mail (${params.rotuloLog}):`, erro);
    return { ok: false, providerId: null };
  }
}

export function escapeHtml(valor: unknown) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
