// lib/pagarme/client.ts
//
// Integração com a Stone/Pagar.me (API v5) pra processar pagamento de
// verdade dos produtos self-checkout do site — começando pelo JR Pass
// em /produtos (pedido do Wilson, 28/set/2026: "vamos integrar a stone
// (pagar.me) para processar os nossos produtos online como JR Pass").
//
// Decisões confirmadas com o Wilson (28/set/2026, via pergunta direta):
// checkout hospedado da Pagar.me (não formulário de cartão no nosso
// site), aceitando cartão de crédito parcelado e Pix, com os juros do
// parcelamento repassados ao cliente, processando pela conta CNPJ da
// Alpinea Agências de Viagens.
//
// Como funciona: em vez de pedir cartão/CPF no nosso próprio formulário
// (o que exigiria adequação a PCI-DSS), criamos um "Link de pagamento"
// da Pagar.me de uso único pra cada pedido (máx. 1 sessão paga) e
// redirecionamos o cliente pra lá — ele digita os dados de pagamento na
// própria página segura da Pagar.me, nunca no nosso site. Quando o
// pagamento é aprovado, a Pagar.me chama o nosso webhook (ver
// app/api/webhooks/pagarme) e a gente confirma o pedido no CRM.
//
// Configuração necessária (Wilson): criar a conta Pagar.me com o CNPJ
// da Alpinea, gerar a chave SECRETA em Pagar.me → Configurações →
// Gestão de Chaves (comece pela chave de TESTE) e colocar em
// PAGARME_SECRET_KEY nas variáveis de ambiente do Vercel — nunca no
// código, nunca em texto pro Claude. Sem essa variável configurada, as
// funções abaixo simplesmente não são chamadas em lugar nenhum do site
// (ver o `if (pagarmeConfigurado())` em app/api/jrpass-selfservice) e o
// fluxo atual (lead no CRM + link manual por WhatsApp/e-mail) continua
// funcionando exatamente como hoje.
//
// ⚠️ O formato exato de alguns campos abaixo (em especial a config de
// parcelamento/juros repassados ao cliente no link de pagamento, que
// pelo que a documentação pública indica é configurada direto no painel
// da Pagar.me em vez de por chamada de API) foi montado a partir da
// documentação pública da Pagar.me — só um teste real com a chave de
// teste confirma 100%. Isso é normal em qualquer integração nova; ajusto
// na hora se a primeira chamada de teste pedir um campo diferente.

const PAGARME_API_BASE = "https://api.pagar.me/core/v5";

export function pagarmeConfigurado(): boolean {
  return !!process.env.PAGARME_SECRET_KEY;
}

function authHeader(): string {
  const secretKey = process.env.PAGARME_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAGARME_SECRET_KEY não configurada nas variáveis de ambiente.");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export type CriarCheckoutParams = {
  // Código nosso pra casar o webhook de pagamento aprovado com o
  // registro certo em `pagamentos` — sempre o id (uuid) da linha já
  // criada em `pagamentos` com status "pendente" (ver
  // app/api/webhooks/pagarme/route.ts).
  codigoInterno: string;
  itemNome: string;
  itemDescricao?: string;
  valorTotalBRL: number; // em reais — convertido pra centavos aqui dentro
  aceitarCartao: boolean;
  aceitarPix: boolean;
  urlSucesso?: string;
};

export type CheckoutCriado = {
  id: string;
  url: string;
};

export async function criarCheckout(params: CriarCheckoutParams): Promise<CheckoutCriado> {
  const metodosAceitos: string[] = [];
  if (params.aceitarCartao) metodosAceitos.push("credit_card");
  if (params.aceitarPix) metodosAceitos.push("pix");

  const valorCentavos = Math.round(params.valorTotalBRL * 100);

  // Endpoint correto é /paymentlinks (o recurso "Link de pagamento" da
  // Pagar.me) — não /checkouts, que não existe e devolve 404. Corrigido
  // em 28/set/2026 depois do primeiro teste real: os logs do Vercel
  // mostraram "Pagar.me recusou a criação do checkout (status 404)"
  // contra api.pagar.me/core/v5/checkouts.
  const resposta = await fetch(`${PAGARME_API_BASE}/paymentlinks`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "order",
      code: params.codigoInterno,
      payment_settings: {
        accepted_payment_methods: metodosAceitos,
      },
      cart_settings: {
        items: [
          {
            name: params.itemNome,
            description: params.itemDescricao || params.itemNome,
            amount: valorCentavos,
            default_quantity: 1,
          },
        ],
      },
      max_paid_sessions: 1,
      ...(params.urlSucesso ? { success_url: params.urlSucesso } : {}),
    }),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(
      `Pagar.me recusou a criação do checkout (status ${resposta.status}): ${JSON.stringify(dados)}`,
    );
  }
  if (!dados || !dados.id || !dados.url) {
    throw new Error(`Resposta inesperada da Pagar.me ao criar checkout: ${JSON.stringify(dados)}`);
  }

  return { id: String(dados.id), url: String(dados.url) };
}

// Reconfirma o status de um pedido diretamente na API da Pagar.me — nunca
// confiamos só no corpo do webhook. A documentação pública da Pagar.me
// não deixa claro um mecanismo de assinatura pra validar que a chamada
// do webhook é realmente da Pagar.me, então a fonte de verdade é sempre
// essa consulta de volta pra API deles, autenticada com a nossa chave
// secreta (que só o nosso servidor tem).
export async function buscarPedido(pedidoId: string): Promise<{ status: string; raw: unknown }> {
  const resposta = await fetch(`${PAGARME_API_BASE}/orders/${encodeURIComponent(pedidoId)}`, {
    method: "GET",
    headers: { Authorization: authHeader() },
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(
      `Pagar.me recusou a consulta do pedido ${pedidoId} (status ${resposta.status}): ${JSON.stringify(dados)}`,
    );
  }
  return { status: String(dados?.status || ""), raw: dados };
}
