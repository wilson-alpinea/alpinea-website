import { NextResponse } from "next/server";
import { faturadoDisponivel, simpremiumConfigurado } from "../../../lib/simpremium/client";
import { buscarOfertasEsim } from "../../../lib/simpremium/ofertas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Catálogo público do eSIM para /produtos/esim — planos ilimitados do
// Japão da Simpremium com o preço final Ajisai. NUNCA devolve o NET
// (custo da agência) nem nada da conta da Ajisai na Simpremium.
export async function GET() {
  if (!simpremiumConfigurado()) {
    return NextResponse.json({ disponivel: false, planos: [] }, { status: 200 });
  }
  try {
    // Sem faturado liberado não há como pagar a Simpremium (não usamos
    // saldo pré-pago) — a página mostra "indisponível" e o WhatsApp.
    const faturado = await faturadoDisponivel();
    if (!faturado.ok) {
      console.error("[esim] venda desligada:", faturado.motivo);
      return NextResponse.json({ disponivel: false, planos: [] }, { status: 200 });
    }
    const ofertas = await buscarOfertasEsim();
    return NextResponse.json({
      disponivel: ofertas.planos.length > 0,
      cotacao: ofertas.cotacao,
      planos: ofertas.planos.map((p) => ({
        id: p.id,
        nome: p.nome,
        faixas: p.faixas.map((f) => ({ minDays: f.minDays, maxDays: f.maxDays, precoUSD: f.precoUSD, precoBRL: f.precoBRL })),
      })),
    });
  } catch (erro) {
    console.error("Erro ao listar planos de eSIM na Simpremium:", erro);
    return NextResponse.json({ disponivel: false, planos: [] }, { status: 200 });
  }
}
