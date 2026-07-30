import { NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY não configurada no Vercel.");
      return NextResponse.json(
        { error: "Serviço de e-mail não configurado." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const key = String(body.key || "").trim();
    const action: "aprovado" | "ajustes" =
      body.action === "ajustes" ? "ajustes" : "aprovado";
    const mensagem = String(body.mensagem || "").trim();

    if (!key) {
      return NextResponse.json(
        { error: "Chave do roteiro é obrigatória." },
        { status: 400 },
      );
    }

    const subject =
      action === "aprovado"
        ? `Roteiro aprovado — /${key}`
        : `Ajustes solicitados — /${key}`;

    const textBody = [
      action === "aprovado"
        ? "Cliente aprovou o rascunho do roteiro."
        : "Cliente solicitou ajustes no rascunho do roteiro.",
      "",
      `Página: https://www.alpinea.io/${key}`,
      mensagem ? `Observações do cliente: ${mensagem}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>${
          action === "aprovado"
            ? "Roteiro aprovado pelo cliente"
            : "Ajustes solicitados pelo cliente"
        }</h2>
        <p><strong>Página:</strong> https://www.alpinea.io/${escapeHtml(key)}</p>
        ${
          mensagem
            ? `<p><strong>Observações do cliente:</strong><br />${escapeHtml(
                mensagem,
              ).replace(/\n/g, "<br />")}</p>`
            : ""
        }
      </div>
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Erro Resend:", errorText);
      return NextResponse.json(
        { error: "Não foi possível registrar a resposta." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro na aprovação de roteiro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
