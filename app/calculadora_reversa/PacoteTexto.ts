import type { PacotePdfProps } from "./PacotePdf";
// Logo Ajisai no cabeçalho do Word — pedido do Wilson, 14/set/2026:
// "trocar para logo da ajisai nos pdfs e words editaveis" (o Word não
// tinha nenhum logo antes). Reaproveita o mesmo base64 já usado no PDF
// em vez de duplicar os ~62KB de dados aqui.
import { LOGO_DATA_URI } from "./PacotePdf";
import { formatValor } from "../lib/currency";

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
  // Pedido do Wilson, 14/set/2026: "criar botões para transformar tudo em
  // BRL, USD ou IENE" — mesma conversão usada na tela e no PDF (o valor
  // de referência de cada item continua sempre em reais).
  const formatPreco = (valor: number) =>
    formatValor(valor, props.moedaExibicao, props.cambioCotacao, props.brlPorJPY);
  const nomeMoeda =
    props.moedaExibicao === "USD" ? "Dólar (US$)" : props.moedaExibicao === "JPY" ? "Iene (¥)" : null;

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
          <td style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:right;white-space:nowrap;vertical-align:top;">${formatPreco(
            item.precoBRL,
          )}</td>
        </tr>`,
    )
    .join("");

  const valorPorPassageiroBRL = props.pessoas > 0 ? props.totalBRL / props.pessoas : props.totalBRL;

  // Pedido do Wilson, 14/set/2026: "valor do orçamento nao deve aparecer
  // em nenhum documento como pdf e word editavel" — "Orçamento do
  // cliente" e "Saldo restante" nunca mais aparecem no Word,
  // incondicionalmente (antes dependia do checkbox
  // ocultarOrcamentoReferencia; agora esse é sempre o comportamento).
  // Mostra só o total do pacote e o valor por passageiro.
  const linhaOrcamentoReferencia = "";
  const linhaSaldo = "";

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
  <img src="${LOGO_DATA_URI}" alt="Ajisai" style="width:165px;height:auto;margin-bottom:10px;" />
  <h1>Proposta Ajisai — ${escapeHtml(props.tituloPacote)}</h1>
  ${props.nomeCliente ? `<p style="color:#666666;">Proposta para ${escapeHtml(props.nomeCliente)}</p>` : ""}
  <p style="color:#666666;">Gerado em ${escapeHtml(props.geradoEmLabel)} · ${escapeHtml(props.cambioLabel)}${props.consultor ? ` · Consultor: ${escapeHtml(props.consultor)}` : ""}</p>
  ${props.validadeLabel ? `<p style="color:#666666;">Proposta válida até ${escapeHtml(props.validadeLabel)}</p>` : ""}
  ${nomeMoeda ? `<p style="color:#888888;font-size:10px;">Valores exibidos em ${nomeMoeda} — conversão de referência, sujeita à cotação do dia.</p>` : ""}

  <h2>Resumo</h2>
  <p>${props.dias} dias · ${escapeHtml(props.tipoQuarto)} · ${props.pessoas} ${
    props.pessoas === 1 ? "pessoa" : "pessoas"
  }</p>

  <h2>Itens do pacote</h2>
  <table>
    ${linhasItens}
  </table>

  <table style="margin-top:12px;">${linhaOrcamentoReferencia}
    <tr>
      <td style="padding:6px 10px;font-weight:bold;">Total do pacote</td>
      <td style="padding:6px 10px;text-align:right;">${formatPreco(props.totalBRL)}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px;color:#555555;">Valor por passageiro (${props.pessoas} ${
        props.pessoas === 1 ? "pessoa" : "pessoas"
      })</td>
      <td style="padding:6px 10px;text-align:right;color:#555555;">${formatPreco(
        valorPorPassageiroBRL,
      )}</td>
    </tr>${linhaSaldo}
  </table>

  <!-- Pedido do Wilson, 14/set/2026, sobre a versão antiga desse aviso
       ("itens sem preço fixo... não entram nesse cálculo"): "quem disse
       que nao tem preço? [...] é pra incluir os preços e discriminar nas
       linhas deles dentro do valor final" — concierge, experiência sob
       medida, transfer de ônibus e reserva de restaurante agora são itens
       precificados, com preço de referência, e aparecem na lista de itens
       acima quando o vendedor marca. -->
  <p style="margin-top:20px;font-size:10px;color:#888888;">
    Concierge, experiências sob medida, transfer de ônibus e reservas de restaurante avulsas já
    têm preço de referência e entram no total quando incluídos na proposta — ajustados conforme
    o pedido do cliente. Valor final sujeito a confirmação da Ajisai.
  </p>

  <!-- Pedido do Wilson, 14/set/2026: "no pdf e word tem que constar os
       dois cnpjs da ajisai de da alpinea" — mesmo texto e mesma fonte
       (rodapé do site alpinea.io) usados no rodapé do PDF (PacotePdf.tsx).
       Depois, mesma data: "isso aqui está horrivel ... organize em 2
       linhas separadas" — razões sociais/CNPJs numa linha, site embaixo,
       igual ao PDF, em vez de um parágrafo só que quebrava sozinho. -->
  <p style="margin-top:14px;padding-top:8px;border-top:0.5px solid #dcdfe4;font-size:9px;color:#9aa3b2;text-align:center;line-height:1.5;">
    Ajisai · Alpinea — AjisaiWork Japan Agência de Viagens LTDA (CNPJ 43.544.605/0001-56) e Alpinea
    Agências de Viagens LTDA (CNPJ 66.491.067/0001-84)
    <br />
    www.alpinea.io
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
