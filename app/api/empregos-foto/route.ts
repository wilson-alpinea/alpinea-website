import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "../../../lib/supabase/admin";
import { checarFotoAutomatica, type CriterioFoto } from "../../lib/fotoChecagem";
import { NOTA_MINIMA_PROXIMA_ETAPA } from "../../lib/candidaturaScoring";

export const runtime = "nodejs";

// Segunda etapa da candidatura — só liberada depois de pontuação >= 80%
// no currículo (pedido do Wilson, 25/set/2026: "após match superior a
// 80%, ele pode ir para a proxima etapa que será enviar uma foto do
// candidato, essa foto deve ser analizada se preenche os requisitos como
// fundo branco, sem boné, etc"). A checagem AUTOMÁTICA (sem IA) só
// consegue confirmar resolução, proporção e fundo claro — boné, óculos
// escuros e enquadramento do rosto ficam no checklist autocertificado do
// próprio candidato (checklist abaixo) mais revisão manual da equipe
// depois. IMPORTANTE: a condição de >= 80% é reconferida aqui no
// servidor a partir da candidatura já gravada — nunca confiar só no que
// o cliente envia, senão dá pra pular a barreira direto pela API.

const TAMANHO_MAXIMO_FOTO_BYTES = 8 * 1024 * 1024; // 8MB
const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

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
    if (!resp.ok) console.error("Erro Resend (empregos-foto):", await resp.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (empregos-foto):", err);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const candidaturaId = String(form.get("candidaturaId") || "").trim();
    if (!candidaturaId) {
      return NextResponse.json({ error: "Candidatura não identificada." }, { status: 400 });
    }

    let checklist: Record<string, boolean> = {};
    const checklistBruto = form.get("checklist");
    if (typeof checklistBruto === "string") {
      try {
        const parsed = JSON.parse(checklistBruto);
        checklist = {
          fundoClaro: Boolean(parsed.fundoClaro),
          semBoneOuChapeu: Boolean(parsed.semBoneOuChapeu),
          semOculosEscuros: Boolean(parsed.semOculosEscuros),
          rostoVisivelCentralizado: Boolean(parsed.rostoVisivelCentralizado),
        };
      } catch {
        // checklist malformado — segue com objeto vazio em vez de falhar o envio
      }
    }

    const arquivo = form.get("foto");
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ error: "Envie sua foto." }, { status: 400 });
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      return NextResponse.json({ error: "A foto enviada é muito grande — envie um arquivo de até 8MB." }, { status: 400 });
    }
    if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
      return NextResponse.json({ error: "Formato de foto não suportado — envie JPEG, PNG ou WEBP." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Reconfirma no servidor que essa candidatura de fato atingiu a nota
    // mínima antes de aceitar a foto — nunca confiar só na navegação do
    // cliente pra essa barreira.
    const { data: candidatura, error: erroBusca } = await supabase
      .from("candidaturas_vagas")
      .select("id, pontuacao, vaga_titulo, nome, sobrenome, email")
      .eq("id", candidaturaId)
      .single();

    if (erroBusca || !candidatura) {
      return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
    }
    if ((candidatura.pontuacao ?? 0) < NOTA_MINIMA_PROXIMA_ETAPA) {
      return NextResponse.json(
        { error: "Esta candidatura ainda não atingiu a pontuação necessária para enviar foto." },
        { status: 403 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const caminhoStorage = `${candidaturaId}/${randomUUID()}-${sanitizarNomeArquivo(arquivo.name || "foto")}`;
    const { error: erroUpload } = await supabase.storage
      .from("fotos-candidatos")
      .upload(caminhoStorage, buffer, { contentType: arquivo.type });
    if (erroUpload) {
      console.error("Erro ao subir foto (empregos-foto):", erroUpload);
      return NextResponse.json({ error: "Não foi possível enviar sua foto agora. Tente novamente." }, { status: 500 });
    }

    const checagemAutomatica = await checarFotoAutomatica(buffer);

    const { error: erroUpdate } = await supabase
      .from("candidaturas_vagas")
      .update({
        foto_path: caminhoStorage,
        foto_checklist: checklist,
        foto_checagem_automatica: checagemAutomatica,
        etapa: "concluida",
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidaturaId);

    if (erroUpdate) {
      console.error("Erro ao atualizar candidatura com a foto (empregos-foto):", erroUpdate);
      return NextResponse.json({ error: "Não foi possível salvar sua foto agora. Tente novamente." }, { status: 500 });
    }

    const resumoTexto = [
      "Foto recebida — candidatura /empregos",
      "",
      `Vaga: ${candidatura.vaga_titulo}`,
      `Candidato: ${candidatura.nome} ${candidatura.sobrenome}`,
      `E-mail: ${candidatura.email}`,
      `Checagem automática: ${checagemAutomatica.aprovado ? "OK" : "com pendências"}`,
      ...checagemAutomatica.criterios.map((c: CriterioFoto) => `- ${c.label}: ${c.aprovado ? "OK" : "pendente"} — ${c.detalhe}`),
      "",
      "Autocertificado do candidato:",
      `- Fundo claro: ${checklist.fundoClaro ? "sim" : "não confirmado"}`,
      `- Sem boné/chapéu: ${checklist.semBoneOuChapeu ? "sim" : "não confirmado"}`,
      `- Sem óculos escuros: ${checklist.semOculosEscuros ? "sim" : "não confirmado"}`,
      `- Rosto visível e centralizado: ${checklist.rostoVisivelCentralizado ? "sim" : "não confirmado"}`,
    ].join("\n");

    await notificarPorEmail({
      assunto: `[Candidatura] Foto recebida — ${candidatura.vaga_titulo} — ${candidatura.nome} ${candidatura.sobrenome}`,
      texto: resumoTexto,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${resumoTexto}</pre>`,
      replyTo: candidatura.email,
    });

    return NextResponse.json({ sucesso: true, checagemAutomatica });
  } catch (error) {
    console.error("Erro no envio de foto da candidatura:", error);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente em instantes." }, { status: 500 });
  }
}
