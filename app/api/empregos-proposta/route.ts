import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { carregarCandidaturaPublica } from "../../../lib/empregos/candidaturaPublica";
import { buscarCotacaoIene } from "../../lib/cotacaoIeneServidor";
import { calcularProposta, formatarMoeda, parseSelecao, TERMOS_PROPOSTA } from "../../lib/financiamentoEmpregos";
import { urlEtapa, vagaPrecisaProposta } from "../../lib/etapasCandidatura";

export const runtime = "nodejs";

// Etapa 3 — resposta do candidato à proposta de financiamento (Wilson,
// 06/out/2026): "aceita" (com aceite dos termos) libera a etapa 4
// (agendamento); "falar_ajisai" registra que ele quer conversar antes
// (o WhatsApp abre direto no navegador). O valor é SEMPRE recalculado
// aqui, com a cotação do servidor — nunca confiar no total do navegador.

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as {
      candidaturaId?: string;
      token?: string;
      acao?: string;
      selecao?: unknown;
      aceiteTermos?: boolean;
    } | null;
    const c = await carregarCandidaturaPublica(String(corpo?.candidaturaId ?? ""), corpo?.token);
    if (!c) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (!c.ficha_enviada_em) return NextResponse.json({ error: "Conclua a ficha cadastral antes." }, { status: 400 });
    if (!vagaPrecisaProposta(c.vaga_id)) return NextResponse.json({ error: "Esta vaga não tem proposta de financiamento." }, { status: 400 });

    const acao = corpo?.acao === "aceitar" ? "aceita" : corpo?.acao === "falar_ajisai" ? "falar_ajisai" : null;
    const selecao = parseSelecao(corpo?.selecao);
    if (!acao || !selecao) return NextResponse.json({ error: "Dados da proposta inválidos." }, { status: 400 });
    if (acao === "aceita" && corpo?.aceiteTermos !== true) {
      return NextResponse.json({ error: "Marque o aceite dos termos e condições." }, { status: 400 });
    }
    // Não deixa um clique em "falar com a Ajisai" desfazer um aceite já dado.
    if (acao === "falar_ajisai" && c.proposta_status === "aceita") return NextResponse.json({ sucesso: true });

    const cotacao = await buscarCotacaoIene("sao-paulo", "compra");
    const proposta = calcularProposta(selecao, cotacao.cotacaoBRLPorJPY);
    const agora = new Date().toISOString();

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("candidaturas_vagas")
      .update({
        proposta_financiamento: {
          ...proposta,
          fonteCotacao: cotacao.fonte,
          aceiteTermos: acao === "aceita",
          termos: acao === "aceita" ? TERMOS_PROPOSTA : undefined,
          userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
        },
        proposta_status: acao,
        proposta_respondida_em: agora,
        updated_at: agora,
      })
      .eq("id", c.id);
    if (error) {
      console.error("Erro ao gravar proposta:", error);
      return NextResponse.json({ error: "Não foi possível salvar agora. Tente novamente." }, { status: 500 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const texto = [
        acao === "aceita" ? "Proposta de financiamento ACEITA (etapa 3)" : "Candidato pediu para FALAR COM A AJISAI sobre a proposta (etapa 3)",
        "",
        `Candidato: ${c.nome} ${c.sobrenome} — ${c.email} — ${c.telefone}`,
        `Vaga: ${c.vaga_titulo} — ${c.vaga_empresa}`,
        `Proponentes: ${selecao.proponentes} · Aeroporto: ${selecao.aeroporto}`,
        ...proposta.itens.map((i) => `- ${i.label}: ${formatarMoeda(i.totalJPY, "JPY")} / ${formatarMoeda(i.totalBRL, "BRL")}`),
        `Total: ${formatarMoeda(proposta.totalJPY, "JPY")} / ${formatarMoeda(proposta.totalBRL, "BRL")} (1 ¥ = R$ ${cotacao.cotacaoBRLPorJPY.toFixed(4)})`,
      ].join("\n");
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Alpinea <contato@alpinea.io>",
          to: ["wilson@alpinea.io"],
          reply_to: c.email,
          subject: `[Candidatura · Etapa 3] ${acao === "aceita" ? "Proposta aceita" : "Quer falar com a Ajisai"} — ${c.nome} ${c.sobrenome}`,
          text: texto,
        }),
      }).catch((e) => console.error("Erro Resend (proposta):", e));
    }

    return NextResponse.json({ sucesso: true, agendamentoUrl: acao === "aceita" ? urlEtapa("agendamento", c.id, c.ficha_token) : null });
  } catch (err) {
    console.error("Erro na proposta de financiamento:", err);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
