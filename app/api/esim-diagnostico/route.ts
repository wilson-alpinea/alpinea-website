import { NextResponse } from "next/server";
import { obterAcesso } from "../../../lib/crm/acesso";
import { consultarCredito, ErroSimpremium, listarPlanosChip, simpremiumConfigurado } from "../../../lib/simpremium/client";
import { buscarOfertasEsim } from "../../../lib/simpremium/ofertas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnóstico do eSIM — Wilson, 26/out/2026: "/produtos/esim mostra
// indisponível, como descobrimos o erro?". Refaz, passo a passo, o mesmo
// caminho de /api/esim-planos e mostra onde ele para. Só para admin do CRM
// (logado em /crm). Nunca mostra a chave da API — só se ela existe.
//
// Abrir no navegador, logado no CRM: /api/esim-diagnostico

type Etapa = { etapa: string; ok: boolean; detalhe: unknown };

function erroLegivel(erro: unknown) {
  if (erro instanceof ErroSimpremium) return { status: erro.status, code: erro.code, mensagem: erro.message };
  return { mensagem: erro instanceof Error ? erro.message : String(erro) };
}

export async function GET() {
  const acesso = await obterAcesso();
  if (!acesso || acesso.papel !== "admin") {
    return NextResponse.json({ error: "Faça login no CRM como admin e abra esta URL de novo." }, { status: 401 });
  }

  const etapas: Etapa[] = [];

  // 1. Variáveis de ambiente
  const url = process.env.SIMPREMIUM_API_URL || "";
  let host: string | null = null;
  try {
    host = url ? new URL(url).host : null;
  } catch {
    host = "URL inválida";
  }
  const configurado = simpremiumConfigurado();
  etapas.push({
    etapa: "1. Variáveis no servidor",
    ok: configurado && host !== "URL inválida",
    detalhe: {
      SIMPREMIUM_API_URL: url ? `definida (host: ${host})` : "FALTANDO",
      SIMPREMIUM_API_KEY: process.env.SIMPREMIUM_API_KEY ? `definida (${process.env.SIMPREMIUM_API_KEY.length} caracteres)` : "FALTANDO",
      SIMPREMIUM_JAPAO_COUNTRY_ID: process.env.SIMPREMIUM_JAPAO_COUNTRY_ID || "(não definida — filtra pelo nome do país)",
    },
  });
  if (!configurado) return NextResponse.json({ etapas }, { status: 200 });

  // 2. Crédito / faturado
  try {
    const credito = await consultarCredito();
    const f = credito?.invoiced;
    etapas.push({
      etapa: "2. Faturado (GET /api/partner/v1/credit)",
      ok: Boolean(f?.enabled) && !f?.blockedReason,
      detalhe: {
        camposDaResposta: Object.keys(credito ?? {}),
        invoiced: f ?? "AUSENTE na resposta — o código espera um campo `invoiced`",
      },
    });
  } catch (erro) {
    etapas.push({ etapa: "2. Faturado (GET /api/partner/v1/credit)", ok: false, detalhe: erroLegivel(erro) });
  }

  // 3. Catálogo bruto
  try {
    const countryId = process.env.SIMPREMIUM_JAPAO_COUNTRY_ID || undefined;
    const planos = await listarPlanosChip({ countryId, planType: "virtual" });
    etapas.push({
      etapa: "3. Planos (GET /api/partner/v1/plans/chip)",
      ok: planos.length > 0,
      detalhe: {
        total: planos.length,
        planos: planos.slice(0, 15).map((p) => ({
          id: p.id,
          nome: p.nome,
          ilimitado: p.unlimited,
          paises: p.countries.map((c) => c.name),
          faixasDePreco: p.faixas.length,
          camposDoPlano: Object.keys(p.raw),
          franchiseKind: p.raw.franchiseKind ?? null,
        })),
      },
    });
  } catch (erro) {
    etapas.push({ etapa: "3. Planos (GET /api/partner/v1/plans/chip)", ok: false, detalhe: erroLegivel(erro) });
  }

  // 4. Resultado final (o que a página recebe)
  try {
    const ofertas = await buscarOfertasEsim({ semCache: true });
    etapas.push({
      etapa: "4. Planos vendáveis (ilimitado + Japão + tabela de preço)",
      ok: ofertas.planos.length > 0,
      detalhe: { total: ofertas.planos.length, cotacao: ofertas.cotacao, cotacaoFallback: ofertas.cotacaoFallback, planos: ofertas.planos.map((p) => ({ nome: p.nome, faixas: p.faixas.length })) },
    });
  } catch (erro) {
    etapas.push({ etapa: "4. Planos vendáveis (ilimitado + Japão + tabela de preço)", ok: false, detalhe: erroLegivel(erro) });
  }

  const primeiraFalha = etapas.find((e) => !e.ok);
  return NextResponse.json({ resumo: primeiraFalha ? `Falha em: ${primeiraFalha.etapa}` : "Tudo OK — a página deveria vender.", etapas }, { status: 200 });
}
