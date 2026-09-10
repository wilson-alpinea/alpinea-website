import type { PacotePdfProps } from "./PacotePdf";

function formatBRLSimples(valor: number) {
  return `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
}

function escapeHtml(texto: string) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Gera um arquivo de texto totalmente editável da proposta — formato .doc
// (HTML com os namespaces do Word), que Word/Google Docs abrem prontos pra
// edição, sem precisar de nenhuma biblioteca extra (evita adicionar
// dependência nova enquanto a ponte com o computador do Wilson está
// instável pra rodar `npm install`). Pedido do Wilson, 10/set/2026: além
// do PDF fechado (pra enviar como está), o vendedor às vezes precisa
// editar o texto da proposta antes de mandar pro cliente — ajustar um
// valor negociado, remover um item, mudar o tom da mensagem.
export function gerarEBaixarTexto(props: PacotePdfProps) {
  const linhasItens = props.itens
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #ddd;vertical-align:top;">
            <p style="margin:0;font-weight:bold;">${escapeHtml(item.label)}</p>
            ${
              item.detalhe.length
                ? `<ul style="margin:4px 0 0 16px;padding:0;">${item.detalhe
                    .map((d) => `<li style="font-size:11px;color:#555555;">${escapeHtml(d)}</li>`)
                    .join("")}</ul>`
                : ""
            }
          </td>
          <td style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:right;white-space:nowrap;vertical-align:top;">${formatBRLSimples(
            item.precoBRL,
          )}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(props.tituloPacote)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #0A2540; font-size: 12px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 13px; color: #2f80c9; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Proposta Ajisai — ${escapeHtml(props.tituloPacote)}</h1>
  <p style="color:#666666;">Gerado em ${escapeHtml(props.geradoEmLabel)} · ${escapeHtml(props.cambioLabel)}</p>

  <h2>Resumo</h2>
  <p>${props.dias} dias · ${escapeHtml(props.tipoQuarto)} · ${props.pessoas} ${
    props.pessoas === 1 ? "pessoa" : "pessoas"
  }</p>

  <h2>Itens do pacote</h2>
  <table>
    ${linhasItens}
  </table>

  <table style="margin-top:12px;">
    <tr>
      <td style="padding:6px 10px;font-weight:bold;">Orçamento do cliente</td>
      <td style="padding:6px 10px;text-align:right;">${formatBRLSimples(props.orcamentoBRL)}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px;font-weight:bold;">Total do pacote</td>
      <td style="padding:6px 10px;text-align:right;">${formatBRLSimples(props.totalBRL)}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px;font-weight:bold;">Saldo restante</td>
      <td style="padding:6px 10px;text-align:right;">${formatBRLSimples(props.saldoBRL)}</td>
    </tr>
  </table>

  <p style="margin-top:20px;font-size:10px;color:#888888;">
    Itens sem preço fixo (concierge, experiências sob medida, transfer de ônibus, reservas de
    restaurantes fora do pacote high-end) não entram nesse cálculo — cotados à parte, sob
    consulta. Valor final sujeito a confirmação da Ajisai.
  </p>
</body>
</html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proposta-ajisai-${slugify(props.tituloPacote)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
