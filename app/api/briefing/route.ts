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

function textLine(label: string, value: unknown) {
  const v = String(value ?? "").trim();
  return `${label}: ${v || "Não informado"}`;
}

function htmlRow(label: string, value: unknown) {
  const v = String(value ?? "").trim();
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(
    v || "Não informado",
  ).replace(/\n/g, "<br />")}</p>`;
}

function joinIfArray(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY não configurada no Vercel.");
      return NextResponse.json(
        {
          error:
            "Serviço de e-mail não configurado. Fale com a Ajisai pelo WhatsApp.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();

    const name = String(body.name || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();

    if (!name || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 },
      );
    }

    const fields: [string, unknown][] = [
      ["Nome", name],
      ["WhatsApp", whatsapp],
      ["Datas da viagem", body.datas],
      ["Duração total", body.duracao],
      ["Cidade de partida", body.cidadePartida],
      ["Viajantes", body.viajantes],
      ["Passagens já compradas", body.passagens],
      ["Orçamento estimado", body.orcamento],
      ["Primeira vez no Japão", body.primeiraVez],
      ["Viagens anteriores ao Japão", body.jaVisitou],
      ["Ritmo desejado", body.ritmo],
      ["Mobilidade / limitações físicas", body.mobilidade],
      ["Estilo de hospedagem", joinIfArray(body.hospedagem)],
      ["O que não pode faltar", body.bucketList],
      ["Temas de interesse", joinIfArray(body.interesses)],
      ["O que preferem evitar", body.evitar],
      ["Restrições alimentares / alergias", body.restricoes],
      ["Abertura culinária", body.aberturaCulinaria],
      [
        "Experiências gastronômicas de interesse",
        joinIfArray(body.experienciasGastronomicas),
      ],
      ["Ocasião especial", body.ocasiaoEspecial],
      ["Nível de inglês", body.ingles],
      ["Experiência ruim a evitar", body.experienciaRuim],
      ["Observações adicionais", body.observacoes],
    ];

    const textBody = [
      "Novo briefing de roteiro — Ajisai",
      "",
      ...fields.map(([label, value]) => textLine(label, value)),
    ].join("\n");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Novo briefing de roteiro — Ajisai</h2>
        ${fields.map(([label, value]) => htmlRow(label, value)).join("\n")}
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
        subject: `Novo briefing Ajisai — ${name}`,
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
            "Não foi possível enviar o briefing. Tente novamente ou fale pelo WhatsApp.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no formulário de briefing:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor. Fale com a Ajisai pelo WhatsApp.",
      },
      { status: 500 },
    );
  }
}
