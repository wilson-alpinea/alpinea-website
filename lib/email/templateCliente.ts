// Modelo único dos e-mails enviados ao CLIENTE (JR Pass, Seguro Viagem,
// Câmbio, pagamento confirmado) — pedido do Wilson, 01/out/2026: "nos
// e-mails é importante adicionar uma representação gráfica de qual etapa
// o cliente se encontra, aguardando confirmação de pagamento, etc, além
// disso, deve ter informações do whatsapp da ajisai para entrar em
// contato caso haja algum problema".
//
// HTML de e-mail: só tabelas e estilos inline (Gmail/Outlook ignoram CSS
// externo e flexbox), largura máxima de 600px, sem imagens (o logo AVIF não
// abre na maioria dos clientes de e-mail — a marca vai em texto).

export const WHATSAPP_AJISAI_NUMERO = "5511930300101";
export const WHATSAPP_AJISAI_EXIBICAO = "+55 (11) 93030-0101";

const AZUL_MARINHO = "#0A2540";
const AZUL = "#1f6fb8";
const VERDE = "#16a34a";
const CINZA = "#9aa5b1";

export type EtapaEmail = { titulo: string; texto?: string };

export type EmailClienteParams = {
  nome: string;
  titulo: string; // ex.: "Recebemos seu pedido de JR Pass"
  intro: string;
  etapas: EtapaEmail[];
  /** Índice (0-based) da etapa em que o cliente está agora. */
  etapaAtual: number;
  /** Texto curto do status, ex.: "Aguardando confirmação do pagamento". */
  status: string;
  resumo?: [string, string][];
  aviso?: string;
  /** Parágrafos extras depois das etapas. */
  extras?: string[];
  /** Mensagem pré-preenchida do botão de WhatsApp. */
  mensagemWhatsapp?: string;
};

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkWhatsapp(mensagem?: string) {
  return `https://wa.me/${WHATSAPP_AJISAI_NUMERO}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}

// Linha do tempo: concluídas (✓ verde), atual (número em azul, destacada),
// próximas (número cinza).
function linhaDoTempo(etapas: EtapaEmail[], atual: number) {
  return etapas
    .map((etapa, i) => {
      const feita = i < atual;
      const agora = i === atual;
      const corCirculo = feita ? VERDE : agora ? AZUL : "#ffffff";
      const corBorda = feita ? VERDE : agora ? AZUL : CINZA;
      const corNumero = feita || agora ? "#ffffff" : CINZA;
      const simbolo = feita ? "&#10003;" : String(i + 1);
      const corTitulo = agora ? AZUL_MARINHO : feita ? "#334155" : "#64748b";
      const ultima = i === etapas.length - 1;
      const etiqueta = agora
        ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#e0efff;color:${AZUL};font-size:11px;font-weight:bold;letter-spacing:0.04em;text-transform:uppercase;">Você está aqui</span>`
        : feita
          ? `<span style="display:inline-block;margin-left:8px;color:${VERDE};font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">Concluído</span>`
          : "";
      return `
        <tr>
          <td width="44" valign="top" style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" width="32" height="32" style="width:32px;height:32px;border-radius:16px;background:${corCirculo};border:2px solid ${corBorda};color:${corNumero};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;line-height:28px;">${simbolo}</td></tr></table>
            ${ultima ? "" : `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="18"></td><td width="2" height="28" style="background:${feita ? VERDE : "#dbe3ea"};font-size:0;line-height:0;">&nbsp;</td></tr></table>`}
          </td>
          <td valign="top" style="padding:4px 0 ${ultima ? "0" : "14px"} 0;font-family:Arial,sans-serif;">
            <div style="font-size:15px;font-weight:bold;color:${corTitulo};">${esc(etapa.titulo)}${etiqueta}</div>
            ${etapa.texto ? `<div style="margin-top:3px;font-size:13px;line-height:1.5;color:#475569;">${esc(etapa.texto)}</div>` : ""}
          </td>
        </tr>`;
    })
    .join("");
}

export function emailClienteHtml(p: EmailClienteParams): string {
  const resumo = p.resumo?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:12px;">
        ${p.resumo
          .map(
            ([rotulo, valor], i) =>
              `<tr><td style="padding:10px 14px;${i ? "border-top:1px solid #edf2f7;" : ""}font-family:Arial,sans-serif;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;" width="38%">${esc(rotulo)}</td><td style="padding:10px 14px;${i ? "border-top:1px solid #edf2f7;" : ""}font-family:Arial,sans-serif;font-size:14px;color:${AZUL_MARINHO};">${esc(valor)}</td></tr>`,
          )
          .join("")}
      </table>`
    : "";
  const aviso = p.aviso
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;"><tr><td style="padding:14px 16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#78350f;"><strong style="display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:#92400e;">Importante</strong>${esc(p.aviso)}</td></tr></table>`
    : "";
  const extras = (p.extras ?? [])
    .map((t) => `<p style="margin:0 0 14px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#334155;">${esc(t)}</p>`)
    .join("");

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.titulo)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:${AZUL_MARINHO};padding:22px 28px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.08em;color:#ffffff;">AJISAI</div>
      <div style="margin-top:2px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9fc3e6;">Viagens ao Japão</div>
    </td></tr>
    <tr><td style="padding:28px 28px 8px 28px;">
      <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e0efff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:${AZUL};">&#9679;&nbsp; ${esc(p.status)}</div>
      <h1 style="margin:16px 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;line-height:1.3;color:${AZUL_MARINHO};">${esc(p.titulo)}</h1>
      <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#334155;">Olá, ${esc(p.nome)}!</p>
      <p style="margin:0 0 24px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#334155;">${esc(p.intro)}</p>
      ${resumo}
      <div style="margin:0 0 14px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Andamento do seu pedido</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">${linhaDoTempo(p.etapas, p.etapaAtual)}</table>
      ${aviso}
      ${extras}
    </td></tr>
    <tr><td style="padding:0 28px 28px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;"><tr><td style="padding:16px 18px;font-family:Arial,sans-serif;">
        <div style="font-size:14px;font-weight:bold;color:#14532d;">Precisa de ajuda?</div>
        <div style="margin-top:4px;font-size:13px;line-height:1.5;color:#166534;">Se tiver qualquer problema ou dúvida, fale com a equipe Ajisai pelo WhatsApp <strong>${WHATSAPP_AJISAI_EXIBICAO}</strong> ou responda este e-mail.</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr><td style="border-radius:999px;background:#25D366;"><a href="${linkWhatsapp(p.mensagemWhatsapp)}" style="display:inline-block;padding:11px 22px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Falar no WhatsApp</a></td></tr></table>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#94a3b8;">
      Equipe Ajisai · <a href="https://www.alpinea.io" style="color:#94a3b8;">alpinea.io</a> · WhatsApp ${WHATSAPP_AJISAI_EXIBICAO}<br>
      AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA — CNPJ 43.544.605/0001-56
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export function emailClienteTexto(p: EmailClienteParams): string {
  return [
    `Olá, ${p.nome}!`,
    "",
    p.titulo,
    `Status: ${p.status}`,
    "",
    p.intro,
    "",
    ...(p.resumo?.length ? [...p.resumo.map(([r, v]) => `${r}: ${v}`), ""] : []),
    "Andamento do seu pedido:",
    ...p.etapas.map((e, i) => {
      const marca = i < p.etapaAtual ? "[✓]" : i === p.etapaAtual ? "[>> VOCÊ ESTÁ AQUI]" : "[ ]";
      return `${marca} ${i + 1}. ${e.titulo}${e.texto ? ` — ${e.texto}` : ""}`;
    }),
    "",
    ...(p.aviso ? [`IMPORTANTE: ${p.aviso}`, ""] : []),
    ...(p.extras ?? []).flatMap((t) => [t, ""]),
    `Precisa de ajuda? Fale com a equipe Ajisai pelo WhatsApp ${WHATSAPP_AJISAI_EXIBICAO} (${linkWhatsapp()}) ou responda este e-mail.`,
    "",
    "Equipe Ajisai",
  ].join("\n");
}
