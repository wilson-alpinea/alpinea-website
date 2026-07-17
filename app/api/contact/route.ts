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
        {
          error:
            "Serviço de e-mail não configurado. Escreva para wilson@alpinea.io.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const pkg = String(body.package || "").trim();
    const dates = String(body.dates || "").trim();
    const firstJapan = String(body.firstJapan || "").trim();
    const travelers = String(body.travelers || "").trim();
    const tripType = String(body.tripType || "").trim();
    const travelStyle = String(body.travelStyle || "").trim();
    const source = String(body.source || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const textBody = `
Novo contato pelo site Alpinea

Nome: ${name}
E-mail: ${email}
Telefone: ${phone || "Não informado"}
Pacote de interesse: ${pkg || "Não informado"}
Datas previstas: ${dates || "Não informado"}
Primeira viagem ao Japão: ${firstJapan || "Não informado"}
Quem irá viajar: ${travelers || "Não informado"}
Tipo de viagem: ${tripType || "Não informado"}
Como costuma viajar: ${travelStyle || "Não informado"}
Como conheceu a Alpinea: ${source || "Não informado"}

Como imagina essa viagem:
${message || "Não informado"}
`.trim();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo contato pelo site Alpinea</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefone:</strong> ${escapeHtml(phone || "Não informado")}</p>
        <p><strong>Pacote de interesse:</strong> ${escapeHtml(pkg || "Não informado")}</p>
        <p><strong>Datas previstas:</strong> ${escapeHtml(dates || "Não informado")}</p>
        <p><strong>Primeira viagem ao Japão:</strong> ${escapeHtml(firstJapan || "Não informado")}</p>
        <p><strong>Quem irá viajar:</strong> ${escapeHtml(travelers || "Não informado")}</p>
        <p><strong>Tipo de viagem:</strong> ${escapeHtml(tripType || "Não informado")}</p>
        <p><strong>Como costuma viajar:</strong> ${escapeHtml(travelStyle || "Não informado")}</p>
        <p><strong>Como conheceu a Alpinea:</strong> ${escapeHtml(source || "Não informado")}</p>
        <p><strong>Como imagina essa viagem:</strong></p>
        <p>${escapeHtml(message || "Não informado").replace(/\n/g, "<br />")}</p>
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
        reply_to: email,
        subject: `Novo contato Alpinea — ${name}`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Erro Resend:", errorText);

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar sua mensagem. Tente novamente ou escreva para wilson@alpinea.io.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no formulário:", error);

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor. Entre em contato por wilson@alpinea.io.",
      },
      { status: 500 }
    );
  }
}
