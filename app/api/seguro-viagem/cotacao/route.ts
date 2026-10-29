import { NextResponse } from "next/server";
import { criarCotacao, ErroSeguroViagem, seguroViagemConfigurado } from "../../../../lib/seguroviagem/client";
import { montarNiveis } from "../../../../lib/seguroviagem/niveis";
import { IDADE_MAXIMA_ONLINE, idadeNaData } from "../../../lib/margemSeguroViagemParceiro";

export const runtime = "nodejs";

// Cotação do Seguro Viagem para /produtos/seguro-viagem (Real Seguro
// Viagem — Wilson, 26/out/2026). Devolve só os 3 níveis curados com o preço
// final ao cliente; custo, balcão e cotação vão dentro de um token assinado
// (lib/seguroviagem/niveis.ts), nunca em texto para o navegador.

const MAX_VIAJANTES = 10;

export async function POST(req: Request) {
  if (!seguroViagemConfigurado()) {
    return NextResponse.json({ error: "Cotação online indisponível no momento. Fale com a nossa equipe pelo WhatsApp." }, { status: 503 });
  }
  try {
    const body = await req.json();
    const partida = String(body.partida || "");
    const retorno = String(body.retorno || "");
    const travelling = body.travelling === "1" ? "1" : "0";
    const nascimentos: string[] = Array.isArray(body.nascimentos) ? body.nascimentos.map((n: unknown) => String(n || "")).slice(0, MAX_VIAJANTES) : [];
    const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

    if (!/^\d{4}-\d{2}-\d{2}$/.test(partida) || !/^\d{4}-\d{2}-\d{2}$/.test(retorno) || partida < hoje || retorno < partida) {
      return NextResponse.json({ error: "Confira as datas: o início precisa ser hoje ou depois, e o fim no mesmo dia ou depois." }, { status: 400 });
    }
    if (nascimentos.length === 0) {
      return NextResponse.json({ error: "Informe a data de nascimento de cada viajante." }, { status: 400 });
    }
    const idades = nascimentos.map((n) => idadeNaData(n, partida));
    if (idades.some((i) => i === null)) {
      return NextResponse.json({ error: "Confira as datas de nascimento dos viajantes." }, { status: 400 });
    }
    const idadesOk = idades as number[];
    if (Math.max(...idadesOk) > IDADE_MAXIMA_ONLINE) {
      return NextResponse.json(
        { error: `Para viajantes acima de ${IDADE_MAXIMA_ONLINE} anos, a cotação é feita pela nossa equipe. Fale com a gente pelo WhatsApp.`, acimaIdade: true },
        { status: 422 },
      );
    }

    const cotacao = await criarCotacao({
      destino: "japao",
      travelling,
      partida,
      retorno,
      acima65: idadesOk.filter((i) => i >= 65).length,
      ate64: idadesOk.filter((i) => i < 65).length,
    });
    const niveis = montarNiveis({
      cotacaoId: cotacao.publicId,
      produtos: cotacao.produtos,
      idades: idadesOk,
      nascimentos,
      partida,
      retorno,
      emViagem: travelling === "1",
      canal: body.canal === "direto" ? "direto" : "site",
    });
    if (niveis.length === 0) {
      return NextResponse.json({ error: "Não encontramos planos para esse grupo. Fale com a nossa equipe pelo WhatsApp." }, { status: 404 });
    }
    return NextResponse.json({ niveis });
  } catch (erro) {
    console.error("Erro na cotação de seguro viagem (Real Seguro Viagem):", erro);
    const msg = erro instanceof ErroSeguroViagem && erro.status === 400 ? erro.message : "Não foi possível cotar agora. Tente de novo em instantes.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
