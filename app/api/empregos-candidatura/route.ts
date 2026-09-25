import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "../../../lib/supabase/admin";
import { encontrarVaga } from "../../lib/vagasCatalogo";
import { extrairTextoCurriculo } from "../../lib/curriculoExtracao";
import { TIPOS_CURRICULO_ACEITOS } from "../../lib/curriculoConstantes";
import {
  calcularPontuacaoCandidatura,
  ASCENDENCIA_JAPONESA,
  QUANDO_EMBARCAR,
  type RespostasTriagem,
  type CriterioPontuacao,
} from "../../lib/candidaturaScoring";

export const runtime = "nodejs";

// Primeira etapa da candidatura em /empregos — pedido do Wilson,
// 25/set/2026: "ao clicar em aplicar a vaga, deve abrir uma pagina para
// enviar as informações de nome, sobrenome, email, telefone, curriculo e
// algumas perguntas relevantes para cada vaga, depois deve haver um
// sistema que captura essa informacao e valida se o lead é compativel
// com a vaga, deve haver um percenteil 0-100% de compatibilidade". Sem
// IA paga (confirmado com o Wilson) — a pontuação vem do motor de
// critérios em app/lib/candidaturaScoring.ts. Recebe multipart/form-data
// (tem arquivo de currículo).

const TAMANHO_MAXIMO_CURRICULO_BYTES = 8 * 1024 * 1024; // 8MB

function sanitizarNomeArquivo(nome: string): string {
  return nome.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-120);
}

async function notificarPorEmail(params: { assunto: string; texto: string; html: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando notificação por e-mail.");
    return;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        reply_to: params.replyTo || undefined,
        subject: params.assunto,
        text: params.texto,
        html: params.html,
      }),
    });
    if (!resp.ok) console.error("Erro Resend (empregos-candidatura):", await resp.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (empregos-candidatura):", err);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const vagaId = String(form.get("vagaId") || "").trim();
    const nome = String(form.get("nome") || "").trim();
    const sobrenome = String(form.get("sobrenome") || "").trim();
    const email = String(form.get("email") || "").trim();
    const telefone = String(form.get("telefone") || "").trim();
    const idadeBruta = form.get("idade");
    const idade = idadeBruta ? Number(idadeBruta) : null;

    if (!nome || !sobrenome || !email || !telefone) {
      return NextResponse.json(
        { error: "Nome, sobrenome, e-mail e telefone são obrigatórios." },
        { status: 400 },
      );
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const vaga = encontrarVaga(vagaId);
    if (!vaga) {
      return NextResponse.json({ error: "Vaga não encontrada." }, { status: 400 });
    }

    let respostas: RespostasTriagem = {
      passaporte: "",
      disponibilidadeEmbarque: "",
      experienciaSetor: "",
      nivelJapones: "",
      ascendencia: "",
      quandoEmbarcar: "",
    };
    const respostasBrutas = form.get("respostas");
    if (typeof respostasBrutas === "string") {
      try {
        const parsed = JSON.parse(respostasBrutas);
        const ascendenciasValidas = ASCENDENCIA_JAPONESA.map((a) => a.key);
        const quandoEmbarcarValidos = QUANDO_EMBARCAR.map((q) => q.key);
        respostas = {
          passaporte: parsed.passaporte === "sim" || parsed.passaporte === "nao" ? parsed.passaporte : "",
          disponibilidadeEmbarque:
            parsed.disponibilidadeEmbarque === "sim" || parsed.disponibilidadeEmbarque === "nao"
              ? parsed.disponibilidadeEmbarque
              : "",
          experienciaSetor:
            parsed.experienciaSetor === "sim" || parsed.experienciaSetor === "nao" ? parsed.experienciaSetor : "",
          nivelJapones: parsed.nivelJapones || "",
          ascendencia: ascendenciasValidas.includes(parsed.ascendencia) ? parsed.ascendencia : "",
          quandoEmbarcar: quandoEmbarcarValidos.includes(parsed.quandoEmbarcar) ? parsed.quandoEmbarcar : "",
        };
      } catch {
        // respostas malformadas — segue com valores vazios em vez de falhar a candidatura inteira
      }
    }

    const arquivo = form.get("curriculo");
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ error: "Envie seu currículo (PDF ou DOCX)." }, { status: 400 });
    }
    if (arquivo.size > TAMANHO_MAXIMO_CURRICULO_BYTES) {
      return NextResponse.json(
        { error: "O currículo enviado é muito grande — envie um arquivo de até 8MB." },
        { status: 400 },
      );
    }
    const nomeArquivoOriginal = arquivo.name || "curriculo";
    const extensaoAceita = /\.(pdf|docx)$/i.test(nomeArquivoOriginal);
    if (!TIPOS_CURRICULO_ACEITOS.includes(arquivo.type) && !extensaoAceita) {
      return NextResponse.json(
        { error: "Formato de currículo não suportado — envie um PDF ou DOCX." },
        { status: 400 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();

    const caminhoStorage = `${randomUUID()}-${sanitizarNomeArquivo(nomeArquivoOriginal)}`;
    const { error: erroUpload } = await supabase.storage
      .from("curriculos-candidatos")
      .upload(caminhoStorage, buffer, { contentType: arquivo.type || "application/octet-stream" });
    if (erroUpload) {
      console.error("Erro ao subir currículo (empregos-candidatura):", erroUpload);
      return NextResponse.json(
        { error: "Não foi possível enviar seu currículo agora. Tente novamente." },
        { status: 500 },
      );
    }

    const curriculoTexto = await extrairTextoCurriculo(buffer, nomeArquivoOriginal, arquivo.type || "");

    const resultado = calcularPontuacaoCandidatura({
      vaga,
      curriculoTexto,
      idade: Number.isFinite(idade) && idade !== null && idade > 0 ? idade : null,
      respostas,
    });

    const { data: candidatura, error: erroInsert } = await supabase
      .from("candidaturas_vagas")
      .insert({
        vaga_id: vaga.id,
        vaga_titulo: vaga.titulo,
        vaga_empresa: vaga.empresa,
        vaga_setor: vaga.setor,
        nome,
        sobrenome,
        email,
        telefone,
        idade: Number.isFinite(idade) && idade !== null && idade > 0 ? idade : null,
        respostas,
        curriculo_path: caminhoStorage,
        curriculo_nome_arquivo: nomeArquivoOriginal,
        curriculo_texto: curriculoTexto.slice(0, 20000), // guarda o texto extraído pra auditoria, sem exagerar no tamanho da linha
        pontuacao: resultado.pontuacao,
        criterios: resultado.criterios,
        etapa: "curriculo",
        status: "novo",
      })
      .select("id")
      .single();

    if (erroInsert || !candidatura) {
      console.error("Erro ao gravar candidatura (empregos-candidatura):", erroInsert);
      return NextResponse.json(
        { error: "Não foi possível registrar sua candidatura agora. Tente novamente." },
        { status: 500 },
      );
    }

    const ascendenciaLabel = ASCENDENCIA_JAPONESA.find((a) => a.key === respostas.ascendencia)?.label;
    const quandoEmbarcarLabel = QUANDO_EMBARCAR.find((q) => q.key === respostas.quandoEmbarcar)?.label;

    const resumoTexto = [
      "Nova candidatura — /empregos",
      "",
      `Vaga: ${vaga.titulo} — ${vaga.empresa}`,
      `Nome: ${nome} ${sobrenome}`,
      `E-mail: ${email}`,
      `Telefone: ${telefone}`,
      idade ? `Idade: ${idade}` : "Idade: não informada",
      `Ascendência japonesa: ${ascendenciaLabel || "Não informada"}`,
      `Quando gostaria de embarcar: ${quandoEmbarcarLabel || "Não informado"}`,
      `Pontuação: ${resultado.pontuacao}%${resultado.aprovadoParaFoto ? " (passou para a etapa de foto)" : ""}`,
      "",
      ...resultado.criterios.map((c: CriterioPontuacao) => `- ${c.label}: ${c.pontosObtidos}/${c.pontosMaximos} — ${c.detalhe}`),
    ].join("\n");

    await notificarPorEmail({
      assunto: `[Candidatura] ${vaga.titulo} — ${nome} ${sobrenome} (${resultado.pontuacao}%)`,
      texto: resumoTexto,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${resumoTexto}</pre>`,
      replyTo: email,
    });

    return NextResponse.json({
      candidaturaId: candidatura.id,
      pontuacao: resultado.pontuacao,
      criterios: resultado.criterios,
      aprovadoParaFoto: resultado.aprovadoParaFoto,
    });
  } catch (error) {
    console.error("Erro na candidatura de vaga:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
