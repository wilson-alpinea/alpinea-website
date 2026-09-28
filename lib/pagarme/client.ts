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
// app/api/webhooks/pagarme) e a gente confirma o pedido no CRM,
// correlacionando pelo campo `order_code` enviado na criação do link
// (que vira o campo `code` do pedido resultante).
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
// Confirmado em 28/set/2026 com um teste real: a Pagar.me exige que
// "payment_settings.credit_card_settings" e "payment_settings.pix_settings"
// venham preenchidos (não vazios) sempre que "credit_card"/"pix" estiverem
// em accepted_payment_methods — sem isso a API recusa com 400 ("'Credit
// Card Settings' must not be empty." / "'Pix Settings' must not be
// empty."). Os juros do parcelamento repassados ao cliente (decisão do
// Wilson) são configurados por API mesmo, no campo
// installments_setup.customer_fee = true — não é só ajuste de painel como
// a gente suspeitava antes de testar.

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

// Lê o corpo da resposta como texto primeiro (nunca lança) e só então
// tenta interpretar como JSON — corrigido em 28/set/2026 depois de um
// 401 aparecer no log só como "{}": o `.json().catch(() => ({}))`
// antigo descartava silenciosamente qualquer corpo que não fosse JSON
// válido (texto simples, HTML, corpo vazio), escondendo a mensagem de
// erro real que a Pagar.me manda.
async function lerCorpoResposta(
  resposta: Response,
): Promise<{ dados: Record<string, unknown>; textoCru: string }> {
  const textoCru = await resposta.text().catch(() => "");
  try {
    const parsed: unknown = textoCru ? JSON.parse(textoCru) : {};
    const dados = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    return { dados, textoCru };
  } catch {
    return { dados: {}, textoCru };
  }
}

// Monta a mensagem de erro sempre incluindo o texto cru quando o JSON
// não trouxe nada útil (objeto vazio) — assim o log nunca mais mostra só
// "{}" sem contexto.
function mensagemErroPagarme(resposta: Response, dados: Record<string, unknown>, textoCru: string): string {
  const detalhe =
    dados && Object.keys(dados).length > 0 ? JSON.stringify(dados) : textoCru || "(corpo vazio)";
  return `status ${resposta.status} ${resposta.statusText}: ${detalhe}`;
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
      // Campo correto é "order_code" (confirmado na documentação da
      // Pagar.me — o endpoint /paymentlinks não tem um campo "code" no
      // corpo da requisição, só "order_code"). Corrigido em 28/set/2026:
      // o campo errado ("code") era ignorado silenciosamente pela API —
      // o link de pagamento era criado normalmente (por isso o checkout
      // abria e o cliente conseguia pagar), mas o pedido resultante
      // ficava sem o campo `code` preenchido, e é exatamente esse campo
      // que app/api/webhooks/pagarme lê pra achar a linha certa em
      // `pagamentos`. Resultado: pagamento aprovado, mas o webhook nunca
      // conseguia correlacionar com o pedido — caía sempre no alerta
      // "Webhook recebido sem conseguir identificar o pedido".
      order_code: params.codigoInterno,
      payment_settings: {
        accepted_payment_methods: metodosAceitos,
        // Obrigatório e não pode vir vazio quando "credit_card" está em
        // accepted_payment_methods (erro 400 "'Credit Card Settings' must
        // not be empty." confirmado em teste real). customer_fee: true é
        // o que repassa o juro do parcelamento pro cliente, conforme
        // decisão do Wilson (28/set/2026).
        ...(params.aceitarCartao
          ? {
              credit_card_settings: {
                operation_type: "auth_and_capture",
                installments_setup: {
                  amount: valorCentavos,
                  max_installments: 12,
                  interest_type: "simple",
                  customer_fee: true,
                },
              },
            }
          : {}),
        // Obrigatório e não pode vir vazio quando "pix" está em
        // accepted_payment_methods (erro 400 "'Pix Settings' must not be
        // empty." confirmado em teste real). 3600s (1h) é um prazo
        // razoável pra pagar o Pix antes de expirar — sem regra do
        // Wilson sobre isso até agora, ajusto se ele pedir outro valor.
        ...(params.aceitarPix
          ? {
              pix_settings: {
                expires_in: 3600,
              },
            }
          : {}),
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

  const { dados, textoCru } = await lerCorpoResposta(resposta);
  if (!resposta.ok) {
    throw new Error(
      `Pagar.me recusou a criação do checkout (${mensagemErroPagarme(resposta, dados, textoCru)})`,
    );
  }
  if (!dados || !dados.id || !dados.url) {
    throw new Error(
      `Resposta inesperada da Pagar.me ao criar checkout: ${mensagemErroPagarme(resposta, dados, textoCru)}`,
    );
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
  const { dados, textoCru } = await lerCorpoResposta(resposta);
  if (!resposta.ok) {
    throw new Error(
      `Pagar.me recusou a consulta do pedido ${pedidoId} (${mensagemErroPagarme(resposta, dados, textoCru)})`,
    );
  }
  return { status: String(dados?.status || ""), raw: dados };
}
