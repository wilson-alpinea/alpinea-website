import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      dates,
      travelers,
      budget,
      message,
    } = await req.json();

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
Datas previstas: ${dates || "Não informado"}
Número de viajantes: ${travelers || "Não informado"}
Faixa de investimento: ${budget || "Não informado"}

Como imagina essa viagem:
${message || "Não informado"}
`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        replyTo: email,
        subject: `Novo contato Alpinea — ${name}`,
        text: textBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();

      console.error("Erro Resend:", errorText);

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar sua mensagem. Tente novamente ou escreva para wilson@alpinea.io",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no formulário:", error);

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor. Entre em contato por wilson@alpinea.io",
      },
      { status: 500 }
    );
  }
}