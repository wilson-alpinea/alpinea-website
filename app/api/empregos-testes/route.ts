import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { fichaLiberada } from "../../lib/fichaCadastral";
import {
  FOLGA_TEMPO_SEG,
  INFO_TESTES,
  ORDEM_TESTES,
  TENTATIVAS_VISAO,
  aprovadoNosTestes,
  corrigirTeste,
  estadoPublico,
  lerEstadoTestes,
  proximoTeste,
  vagaExigeTestesAptidao,
  type ChaveTeste,
} from "../../lib/testesAptidao";

export const runtime = "nodejs";

// Testes de aptidão online (app/lib/testesAptidao.ts) — Wilson, 08/out/2026.
// Acesso pelo link /empregos/testes/<id>?t=<token>. O servidor:
//   - confere token, match liberado e se a vaga exige os testes;
//   - marca o início de cada teste no relógio DELE (recarregar a página não
//     zera o cronômetro) e recusa refazer teste já enviado;
//   - corrige as respostas — o cliente nunca manda nota;
//   - ao fim, grava testes_aptidao_aprovado e avisa a equipe por e-mail.

async function notificarPorEmail(assunto: string, texto: string, replyTo?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: replyTo || undefined,
        subject: assunto,
        text: texto,
      }),
    });
    if (!resp.ok) console.error("Erro Resend (empregos-testes):", await resp.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (empregos-testes):", err);
  }
}

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as {
      candidaturaId?: string;
      token?: string;
      acao?: "iniciar" | "enviar";
      teste?: string;
      respostas?: unknown;
    } | null;
    const id = String(corpo?.candidaturaId ?? "").trim();
    const token = String(corpo?.token ?? "").trim();
    const teste = String(corpo?.teste ?? "") as ChaveTeste;
    if (!id || !token || !ORDEM_TESTES.includes(teste) || (corpo?.acao !== "iniciar" && corpo?.acao !== "enviar")) {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: c } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
    if (!c || c.ficha_token !== token) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (!fichaLiberada(c) || !vagaExigeTestesAptidao(c.vaga_id)) {
      return NextResponse.json({ error: "Esta candidatura não tem testes de aptidão liberados." }, { status: 403 });
    }

    const estado = lerEstadoTestes(c.testes_aptidao);
    const esperado = proximoTeste(estado);
    if (esperado !== teste) {
      return NextResponse.json({ error: "Este teste já foi feito ou ainda não está liberado.", estado: estadoPublico(estado) }, { status: 409 });
    }
    const agora = new Date();

    if (corpo.acao === "iniciar") {
      // Refazer a visão (2ª tentativa) começa um novo início.
      const refazendoVisao = teste === "visao" && Boolean(estado.resultados.visao);
      if (!estado.inicios[teste] || refazendoVisao) estado.inicios[teste] = agora.toISOString();
      if (refazendoVisao) delete estado.resultados.visao;
    } else {
      const inicio = estado.inicios[teste] ? new Date(estado.inicios[teste]!) : null;
      if (!inicio) return NextResponse.json({ error: "Teste não iniciado." }, { status: 400 });
      const duracaoSeg = Math.round((agora.getTime() - inicio.getTime()) / 1000);
      const limite = INFO_TESTES[teste].limiteSeg;
      const foraDoTempo = limite !== null && duracaoSeg > limite + FOLGA_TEMPO_SEG;
      const r = corrigirTeste(teste, corpo.respostas);
      const tentativa = teste === "visao" ? (estado.tentativasVisao ?? 0) + 1 : 1;
      if (teste === "visao") estado.tentativasVisao = Math.min(tentativa, TENTATIVAS_VISAO);
      estado.resultados[teste] = {
        ...r,
        aprovado: r.aprovado && !foraDoTempo,
        resumo: foraDoTempo ? `${r.resumo} Enviado fora do tempo (${duracaoSeg}s).` : r.resumo,
        enviadoEm: agora.toISOString(),
        duracaoSeg,
        foraDoTempo,
        tentativa,
      };
    }

    const final = aprovadoNosTestes(estado);
    const terminouAgora = final !== null && !estado.concluidoEm;
    if (terminouAgora) estado.concluidoEm = agora.toISOString();

    const { error } = await supabase
      .from("candidaturas_vagas")
      .update({ testes_aptidao: estado, testes_aptidao_aprovado: final, updated_at: agora.toISOString() })
      .eq("id", id);
    if (error) {
      console.error("Erro ao gravar testes (empregos-testes):", error);
      return NextResponse.json({ error: "Não foi possível salvar agora. Tente novamente." }, { status: 500 });
    }

    if (terminouAgora) {
      const linhas = ORDEM_TESTES.map((k) => {
        const r = estado.resultados[k];
        return `${r?.aprovado ? "✓" : INFO_TESTES[k].eliminatorio ? "✗" : "•"} ${INFO_TESTES[k].titulo}: ${r?.resumo ?? "—"}`;
      });
      await notificarPorEmail(
        `[Candidatura] Testes de aptidão ${final ? "APROVADO" : "REPROVADO"} — ${c.vaga_titulo} — ${c.nome} ${c.sobrenome}`,
        [
          "Testes de aptidão concluídos — candidatura /empregos",
          "",
          `Vaga: ${c.vaga_empresa} — ${c.vaga_titulo}`,
          `Candidato: ${c.nome} ${c.sobrenome} (${c.pontuacao ?? "—"}%)`,
          `E-mail: ${c.email}`,
          `Resultado: ${final ? "aprovado — ficha cadastral liberada" : "reprovado — ficha bloqueada (pode liberar no CRM)"}`,
          "",
          ...linhas,
        ].join("\n"),
        c.email,
      );
    }

    return NextResponse.json({ sucesso: true, estado: estadoPublico(estado), servidorAgora: agora.toISOString() });
  } catch (error) {
    console.error("Erro nos testes de aptidão:", error);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
