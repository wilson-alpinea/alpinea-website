import { NextResponse } from "next/server";

export const runtime = "nodejs";

// PTAX só é publicada em dia útil (~13h de Brasília) — revalida a cada 15
// min pra pegar a cotação do dia assim que ela sair, sem bater na API do
// Banco Central a cada request.
export const revalidate = 900;

// Usado só se a consulta ao Banco Central falhar (fora do ar, sem rede,
// formato inesperado etc.) — pra tela nunca quebrar. Sempre marcado como
// "fallback" na resposta, nunca é apresentado como cotação oficial no site.
const COTACAO_FALLBACK = 5.3;

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

  // CotacaoDolarPeriodo com $top=1 ordenado desc pega a cotação PTAX mais
  // recente disponível dentro da janela — cobre fim de semana/feriado sem
  // precisar ficar tentando dia a dia.
  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(` +
    `dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
    `?@dataInicial='${dataInicial}'&@dataFinalCotacao='${dataFinal}'` +
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
    console.error("Erro ao consultar câmbio no Banco Central:", error);

    return NextResponse.json({
      cotacao: COTACAO_FALLBACK,
      data: null,
      fonte: "estimativa — cotação do Banco Central indisponível no momento",
      fallback: true,
    });
  }
}
