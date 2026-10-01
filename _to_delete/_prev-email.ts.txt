import { emailClienteHtml } from "./lib/email/templateCliente";
import { writeFileSync } from "fs";
writeFileSync("Claude outputs/previa-email-jrpass.html", emailClienteHtml({
  nome: "Wilson Braz", titulo: "Recebemos seu pedido de JR Pass",
  intro: "Seu pedido está registrado. Assim que a Stone confirmar o pagamento, seguimos com a emissão do voucher.",
  status: "Aguardando confirmação do pagamento", etapaAtual: 2,
  etapas: [
    { titulo: "Pedido recebido", texto: "Seus dados e o documento chegaram para a nossa equipe." },
    { titulo: "Conferência", texto: "Confirmamos a elegibilidade com o documento que você anexou." },
    { titulo: "Pagamento", texto: "Pix ou cartão pela página segura da Stone. A confirmação chega por e-mail." },
    { titulo: "Emissão e envio do voucher", texto: "Emitimos o voucher (Exchange Order) e enviamos para o seu endereço. Validade de 3 meses para a troca." },
    { titulo: "Troca no Japão", texto: "Troque o voucher pelo passe físico em um balcão JR." },
  ],
  resumo: [["Passe", "Comum — 7 dias"], ["Valor", "R$ 2.450,00"], ["Entrega do voucher", "Rua Augusta, 1200 — Apto 52 — Consolação, São Paulo/SP — CEP 01304-001"]],
  aviso: "Na chegada ao Japão, passe pela imigração no balcão manual (não no portão eletrônico) para receber o carimbo \"Temporary Visitor\" no passaporte. Sem ele, não é possível trocar o voucher pelo passe.",
}));
