import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { encontrarVaga } from "../../lib/vagasCatalogo";
import { urlAposMatch } from "../../lib/testesAptidao";
import { vagaEstaAtiva } from "../../../lib/empregos/vagasAtivas";
import { calcularPontuacaoCandidatura, type RespostasTriagem } from "../../lib/candidaturaScoring";

export const runtime = "nodejs";

// Candidatura em uma vaga SUGERIDA — Wilson, 06/out/2026: "caso o cliente
// não seja aprovado na primeira vaga, sugerir vagas que ele passaria com o
// perfil submetido". Reaproveita currículo, respostas e perfil da
// candidatura original (sem reenviar nada), recalcula a pontuação no
// servidor para a nova vaga e cria uma nova linha em candidaturas_vagas.

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { candidaturaId?: string; token?: string; vagaId?: string } | null;
    const candidaturaId = String(corpo?.candidaturaId ?? "").trim();
    const token = String(corpo?.token ?? "").trim();
    const vaga = encontrarVaga(String(corpo?.vagaId ?? ""));
    if (!candidaturaId || !token || !vaga) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (!(await vagaEstaAtiva(vaga.id))) {
      return NextResponse.json({ error: "Esta vaga não está recebendo candidaturas no momento." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: original } = await supabase.from("candidaturas_vagas").select("*").eq("id", candidaturaId).maybeSingle();
    if (!original || original.ficha_token !== token) {
      return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
    }
    if (original.vaga_id === vaga.id) {
      return NextResponse.json({ error: "Você já se candidatou a esta vaga." }, { status: 400 });
    }

    // Evita duplicar se o candidato clicar duas vezes.
    const { data: existente } = await supabase
      .from("candidaturas_vagas")
      .select("id, ficha_token, pontuacao")
      .eq("email", original.email)
      .eq("vaga_id", vaga.id)
      .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .maybeSingle();
    if (existente) {
      return NextResponse.json({
        candidaturaId: existente.id,
        pontuacao: existente.pontuacao,
        fichaUrl: urlAposMatch(vaga.id, existente.id, existente.ficha_token),
      });
    }

    const respostas = (original.respostas ?? {}) as RespostasTriagem & Record<string, unknown>;
    const resultado = calcularPontuacaoCandidatura({
      vaga,
      curriculoTexto: original.curriculo_texto ?? "",
      idade: original.idade,
      respostas,
    });
    if (!resultado.aprovadoParaFoto) {
      return NextResponse.json({ error: "Seu perfil não atingiu o mínimo para esta vaga." }, { status: 400 });
    }

    const { data: nova, error } = await supabase
      .from("candidaturas_vagas")
      .insert({
        vaga_id: vaga.id,
        vaga_titulo: vaga.titulo,
        vaga_empresa: vaga.empresa,
        vaga_setor: vaga.setor,
        nome: original.nome,
        sobrenome: original.sobrenome,
        email: original.email,
        telefone: original.telefone,
        idade: original.idade,
        respostas: { ...respostas, origemCandidaturaId: original.id },
        curriculo_path: original.curriculo_path,
        curriculo_nome_arquivo: original.curriculo_nome_arquivo,
        curriculo_texto: original.curriculo_texto,
        pontuacao: resultado.pontuacao,
        criterios: resultado.criterios,
        etapa: "curriculo",
        status: "novo",
        classificacao: resultado.classificacao,
        motivos_eliminacao: resultado.motivosEliminacao,
        pontos_revisar: resultado.pontosRevisar,
      })
      .select("id, ficha_token")
      .single();
    if (error || !nova) {
      console.error("Erro ao criar candidatura sugerida:", error);
      return NextResponse.json({ error: "Não foi possível registrar agora. Tente novamente." }, { status: 500 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const texto = [
        "Candidatura em vaga SUGERIDA — /empregos",
        "",
        `Vaga: ${vaga.titulo} — ${vaga.empresa} (${resultado.pontuacao}%)`,
        `Vaga original (não aprovado): ${original.vaga_titulo} — ${original.vaga_empresa} (${original.pontuacao ?? "—"}%)`,
        `Candidato: ${original.nome} ${original.sobrenome} — ${original.email} — ${original.telefone}`,
      ].join("\n");
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Alpinea <contato@alpinea.io>",
          to: ["wilson@alpinea.io"],
          reply_to: original.email,
          subject: `[Candidatura sugerida] ${vaga.titulo} — ${original.nome} ${original.sobrenome} (${resultado.pontuacao}%)`,
          text: texto,
        }),
      }).catch((e) => console.error("Erro Resend (candidatura sugerida):", e));
    }

    return NextResponse.json({
      candidaturaId: nova.id,
      pontuacao: resultado.pontuacao,
      fichaUrl: urlAposMatch(vaga.id, nova.id, nova.ficha_token),
    });
  } catch (err) {
    console.error("Erro na candidatura sugerida:", err);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
