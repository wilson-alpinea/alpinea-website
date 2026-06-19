// app/api/contact/route.ts
//
// Envia os dados do formulário de contato para wilson@alpinea.io via Resend.
//
// SETUP NECESSÁRIO (uma vez só):
// 1. Crie uma conta gratuita em https://resend.com
// 2. Verifique o domínio alpinea.io em Resend > Domains (eles te dão alguns
//    registros DNS — TXT/MX/CNAME — para adicionar onde seu domínio é
//    gerenciado). Sem isso, só é possível enviar para o seu próprio e-mail
//    de teste, não para wilson@alpinea.io vindo de um endereço @alpinea.io.
// 3. Gere uma API Key em Resend > API Keys.
// 4. No Vercel, vá em Project Settings > Environment Variables e adicione:
//      RESEND_API_KEY = sua_chave_aqui
// 5. Re-deploy o projeto (ou o próprio push já aciona).
//
// O endereço em "from" abaixo precisa estar no domínio verificado.
// Pode trocar "contato@alpinea.io" por outro endereço @alpinea.io se preferir.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, dates, travelers, budget, message } = body || {};

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Nome e e-mail são obrigatórios." }),
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY não configurada.");
      return new Response(
        JSON.stringify({ error: "Envio de e-mail não configurado no servidor." }),
        { status: 500 }
      );
    }

    const textBody = [
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Telefone: ${phone || "não informado"}`,
      `Datas previstas: ${dates || "não informado"}`,
      `Viajantes: ${travelers || "não informado"}`,
      `Faixa de investimento: ${budget || "não informado"}`,
      "",
      "Mensagem:",
      message || "(sem mensagem)",
    ].join("\n");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpinea Website <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: email,
        subject: `Novo contato pelo site — ${name}`,
        text: textBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Erro do Resend:", errText);
      return new Response(JSON.stringify({ error: "Falha ao enviar e-mail." }), {
        status: 502,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Erro no /api/contact:", err);
    return new Response(JSON.stringify({ error: "Erro inesperado." }), { status: 500 });
  }
}
