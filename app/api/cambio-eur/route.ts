import { NextResponse } from "next/server";

export const runtime = "nodejs";

// PTAX só é publicada em dia útil (~13h de Brasília) — revalida a cada 15
// min, mesmo critério de /api/cambio (dólar). Adicionada 25/set/2026 —
// pedido do Wilson: "deixar pelo menos 3 moedas disponiveis para transação
// Real, Euro e Dolar" na página pública de Câmbio.
export const revalidate = 900;

// Usado só se a consulta ao Banco Central falhar (fora do ar, sem rede,
// formato inesperado etc.) — pra tela nunca quebrar. Sempre marcado como
// "fallback" na resposta, nunca é apresentado como cotação oficial no
// site. Estimativa de 25/set/2026 — revisar periodicamente.
const COTACAO_FALLBACK_EUR = 6.1;

function paraMMDDYYYY(data: Date) {
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  const yyyy = data.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export async function GET() {
  const hoje = new Date();
  const dezDiasAtras = new Date(hoje);
  dezDiasAtras.setDate(dezDiasAtras.getDate() - 10);

  const dataInicial = paraMMDDYYYY(dezDiasAtras);
  const dataFinal = paraMMDDYYYY(hoje);

  // /api/cambio (dólar) usa o endpoint dedicado CotacaoDolarPeriodo do
  // PTAX. Pra outras moedas, o Banco Central expõe o endpoint genérico
  // CotacaoMoedaPeriodo, parametrizado por `moeda` (código ISO, ex.
  // "EUR") — mesmo padrão de $top=1 + $orderby desc pra pegar a cotação
  // mais recente dentro da janela, cobrindo fim de semana/feriado. NÃO
  // consegui confirmar ao vivo a resposta exata desse endpoint (o
  // WebFetch pra olinda.bcb.gov.br deu timeout de aprovação nas duas
  // tentativas, 25/set/2026) — o formato usado aqui é o documentado
  // publicamente pelo Banco Central (mesmos campos de
  // CotacaoDolarPeriodo: cotacaoCompra/cotacaoVenda/dataHoraCotacao), mas
  // vale um teste real em produção. Se o formato estiver errado, o
  // fallback abaixo garante que a tela nunca quebra — só mostra a
  // estimativa em vez da cotação do dia.
  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(` +
    `moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
    `?@moeda='EUR'&@dataInicial='${dataInicial}'&@dataFinalCotacao='${dataFinal}'` +
    `&$top=1&$orderby=dataHoraCotacao desc&$format=json`;

  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });

    if (!resp.ok) throw new Error(`BCB respondeu ${resp.status}`);

    const json = await resp.json();
    const cotacao = json?.value?.[0];

    if (!cotacao || typeof cotacao.cotacaoVenda !== "number") {
      throw new Error("Resposta da BCB sem cotação válida");
    }

    const dataHora = new Date(cotacao.dataHoraCotacao);
    const dataFormatada = dataHora.toLocaleDateString("pt-BR");

    return NextResponse.json({
      cotacao: cotacao.cotacaoVenda,
      data: dataFormatada,
      fonte: "PTAX — Banco Central do Brasil",
      fallback: false,
    });
  } catch (error) {
    console.error("Erro ao consultar câmbio do euro no Banco Central:", error);

    return NextResponse.json({
      cotacao: COTACAO_FALLBACK_EUR,
      data: null,
      fonte: "estimativa — cotação do Banco Central indisponível no momento",
      fallback: true,
    });
  }
}
