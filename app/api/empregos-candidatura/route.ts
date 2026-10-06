import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "../../../lib/supabase/admin";
import { encontrarVaga, VAGAS } from "../../lib/vagasCatalogo";
import { extrairTextoCurriculo } from "../../lib/curriculoExtracao";
import { TIPOS_CURRICULO_ACEITOS } from "../../lib/curriculoConstantes";
import {
  calcularPontuacaoCandidatura,
  ASCENDENCIA_JAPONESA,
  QUANDO_EMBARCAR,
  NIVEIS_JAPONES_DETALHADOS,
  nivelDoDetalhado,
  type RespostasTriagem,
  type CriterioPontuacao,
  vagaExigeTesteDaltonismo,
  criteriosDaVaga,
} from "../../lib/candidaturaScoring";
import {
  parsePerfil,
  pendenciasPerfil,
  imc,
  formatarCep,
  ESCOLARIDADES,
  OPCOES_FLEXIBILIDADE,
  OPCOES_HORAS_EXTRAS,
  OPCOES_DALTONISMO,
  OPCOES_FINANCIAMENTO,
  REGIOES_TATUAGEM,
  TAMANHOS_TATUAGEM,
  CONDICOES_VISUAIS,
  OPCOES_FUMANTE,
  CLASSES_MEDICAMENTO,
  TIPOS_DIABETES,
} from "../../lib/triagemPerfil";

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

    // Idade passou a ser obrigatória junto com os demais — pedido do
    // Wilson, 06/out/2026 ("campos obrigatórios": nome, sobrenome, e-mail,
    // telefone e idade).
    if (!nome || !sobrenome || !email || !telefone || !idade || !Number.isFinite(idade) || idade < 16 || idade > 75) {
      return NextResponse.json(
        { error: "Nome, sobrenome, e-mail, telefone e idade são obrigatórios." },
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
          reEntry: parsed.reEntry === "sim" || parsed.reEntry === "nao" ? parsed.reEntry : "",
          // Prioriza a opção detalhada (JLPT/BJT); só cai no valor antigo
          // se vier de uma versão anterior do formulário.
          nivelJapones: nivelDoDetalhado(parsed.nivelJaponesDetalhado) || parsed.nivelJapones || "",
          nivelJaponesDetalhado: NIVEIS_JAPONES_DETALHADOS.some((n) => n.key === parsed.nivelJaponesDetalhado)
            ? parsed.nivelJaponesDetalhado
            : "",
          ascendencia: ascendenciasValidas.includes(parsed.ascendencia) ? parsed.ascendencia : "",
          quandoEmbarcar: quandoEmbarcarValidos.includes(parsed.quandoEmbarcar) ? parsed.quandoEmbarcar : "",
          // Perguntas de perfil (06/out/2026) — normalizadas e com o teste
          // de daltonismo recorrigido aqui no servidor.
          perfil: parsePerfil(parsed.perfil),
        };
      } catch {
        // respostas malformadas — segue com valores vazios em vez de falhar a candidatura inteira
      }
    }

    // Perfil completo é obrigatório (mesma regra do formulário).
    const faltaPerfil = pendenciasPerfil(respostas.perfil ?? parsePerfil(null), {
      exigeTesteDaltonismo: vagaExigeTesteDaltonismo(vaga),
      perguntaFinanciamento: vaga.custosCobertosPelaEmpresa !== true,
    });
    if (faltaPerfil.length > 0) {
      return NextResponse.json(
        { error: `Faltou responder: ${faltaPerfil.join(", ")}.` },
        { status: 400 },
      );
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

    // Certificado de japonês (JLPT/BJT) — opcional. Vai pro mesmo bucket
    // privado do currículo, numa pasta própria; o caminho fica dentro de
    // `respostas` (jsonb), sem precisar de coluna nova. Falha no upload do
    // certificado não derruba a candidatura — só fica registrado no log.
    let certificadoJapones: { path: string; nome: string } | null = null;
    const arquivoCertificado = form.get("certificadoJapones");
    if (arquivoCertificado instanceof File && arquivoCertificado.size > 0) {
      const nomeCert = arquivoCertificado.name || "certificado";
      const formatoOk =
        /\.(pdf|jpe?g|png|webp|heic)$/i.test(nomeCert) || /^(application\/pdf|image\/)/.test(arquivoCertificado.type);
      if (!formatoOk || arquivoCertificado.size > TAMANHO_MAXIMO_CURRICULO_BYTES) {
        return NextResponse.json(
          { error: "Certificado de japonês: envie um PDF ou imagem (JPG/PNG) de até 8MB." },
          { status: 400 },
        );
      }
      const caminhoCert = `certificados-japones/${randomUUID()}-${sanitizarNomeArquivo(nomeCert)}`;
      const { error: erroCert } = await supabase.storage
        .from("curriculos-candidatos")
        .upload(caminhoCert, Buffer.from(await arquivoCertificado.arrayBuffer()), {
          contentType: arquivoCertificado.type || "application/octet-stream",
        });
      if (erroCert) console.error("Erro ao subir certificado de japonês (empregos-candidatura):", erroCert);
      else certificadoJapones = { path: caminhoCert, nome: nomeCert };
    }

    // Certidão de antecedentes criminais da Polícia Federal — anexo
    // opcional (Wilson, 06/out/2026). Mesmo bucket privado, pasta própria.
    let certidaoAntecedentes: { path: string; nome: string } | null = null;
    const arquivoCertidao = form.get("certidaoAntecedentes");
    if (arquivoCertidao instanceof File && arquivoCertidao.size > 0) {
      const nomeCertidao = arquivoCertidao.name || "certidao";
      const okFormato =
        /\.(pdf|jpe?g|png|webp|heic)$/i.test(nomeCertidao) || /^(application\/pdf|image\/)/.test(arquivoCertidao.type);
      if (!okFormato || arquivoCertidao.size > TAMANHO_MAXIMO_CURRICULO_BYTES) {
        return NextResponse.json(
          { error: "Certidão de antecedentes: envie um PDF ou imagem de até 8MB." },
          { status: 400 },
        );
      }
      const caminho = `certidoes-antecedentes/${randomUUID()}-${sanitizarNomeArquivo(nomeCertidao)}`;
      const { error: erroCertidao } = await supabase.storage
        .from("curriculos-candidatos")
        .upload(caminho, Buffer.from(await arquivoCertidao.arrayBuffer()), {
          contentType: arquivoCertidao.type || "application/octet-stream",
        });
      if (erroCertidao) console.error("Erro ao subir certidão de antecedentes (empregos-candidatura):", erroCertidao);
      else certidaoAntecedentes = { path: caminho, nome: nomeCertidao };
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
        respostas: { ...respostas, certificadoJapones, certidaoAntecedentes },
        curriculo_path: caminhoStorage,
        curriculo_nome_arquivo: nomeArquivoOriginal,
        curriculo_texto: curriculoTexto.slice(0, 20000), // guarda o texto extraído pra auditoria, sem exagerar no tamanho da linha
        pontuacao: resultado.pontuacao,
        criterios: resultado.criterios,
        etapa: "curriculo",
        status: "novo",
        // Área de Empregos do CRM — migração 015.
        classificacao: resultado.classificacao,
        motivos_eliminacao: resultado.motivosEliminacao,
        pontos_revisar: resultado.pontosRevisar,
      })
      // "*" em vez de "id, ficha_token" pra não quebrar a candidatura se a
      // migração 016 (ficha_token) ainda não tiver rodado.
      .select("*")
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

    // Bloco de perfil no e-mail da equipe — ⚠ marca respostas que pedem
    // atenção (podem ser eliminatórias conforme a vaga).
    function linhasPerfil(): string[] {
      const p = respostas.perfil;
      if (!p) return [];
      const regras = criteriosDaVaga(vaga!);
      const rot = <T extends { key: string; label: string }>(lista: T[], k: string) =>
        lista.find((x) => x.key === k)?.label ?? "—";
      const alerta = (cond: boolean) => (cond ? " ⚠" : "");
      const t = p.testeDaltonismo;
      return [
        "",
        "— Perfil —",
        `CEP de residência: ${formatarCep(p.cepResidencia)}`,
        `Peso/altura: ${p.pesoKg} kg / ${p.alturaCm} cm (IMC ${imc(p) ?? "—"})`,
        `Escolaridade: ${rot(ESCOLARIDADES, p.escolaridade)}`,
        `Daltonismo: ${rot(OPCOES_DALTONISMO, p.daltonismo)}${alerta(p.daltonismo === "sim" && regras.daltonismo === "eliminatorio")}`,
        t
          ? `Teste de daltonismo: ${t.acertos}/${t.total} acertos — ${t.aprovado ? "aprovado" : t.controleOk ? "REPROVADO" : "inválido (errou a placa de controle)"}${alerta(!t.aprovado)}`
          : "Teste de daltonismo: não aplicado (vaga não é de eletrônicos)",
        `Já esteve no Japão: ${p.jaEsteveJapao === "sim" ? `Sim, ${p.anosNoJapao} ano(s)` : "Não"}`,
        `Filhos: ${p.temFilhos === "sim" ? `Sim — idades: ${p.idadesFilhos.join(", ")}` : "Não"}`,
        `Horas extras: ${rot(OPCOES_HORAS_EXTRAS, p.horasExtras)}`,
        `Aceita turno alternado: ${p.turnoAlternado === "sim" ? "Sim" : "Não"}${alerta(p.turnoAlternado !== "sim" && regras.turnoAlternado === "eliminatorio")}`,
        `Província de preferência: ${p.provinciaPreferida || "Sem preferência"}`,
        `Flexibilidade de região: ${rot(OPCOES_FLEXIBILIDADE, p.flexibilidadeRegiao)}`,
        `Dívidas em aberto no Brasil: ${p.dividasBrasil === "sim" ? "SIM" : "Não"}${alerta(p.dividasBrasil === "sim")}`,
        p.jaEsteveJapao === "sim"
          ? `Dívidas/impostos em aberto no Japão: ${p.dividasJapao === "sim" ? "SIM" : "Não"}${alerta(p.dividasJapao === "sim")}`
          : "",
        p.jaEsteveJapao === "sim"
          ? `Recebeu ajuda do governo para retornar ao Brasil: ${p.ajudaGovernoRetorno === "sim" ? "SIM" : "Não"}${alerta(p.ajudaGovernoRetorno === "sim")}`
          : "",
        vaga!.custosCobertosPelaEmpresa === true
          ? ""
          : `Financiamento de taxa/passagem/documentos: ${rot(OPCOES_FINANCIAMENTO, p.financiamentoCustos)}`,
        `Antecedentes criminais: ${p.antecedentesCriminais === "sim" ? "SIM" : "Não"}${p.antecedentesCriminais === "sim" ? " — REVISAR" : ""}${certidaoAntecedentes ? ` (certidão PF anexada: ${certidaoAntecedentes.nome})` : " (sem certidão anexada)"}`,
        `Tatuagem visível: ${
          p.tatuagemVisivel === "sim"
            ? `Sim — ${p.tatuagemRegioes.map((r) => rot(REGIOES_TATUAGEM, r)).join(", ")}; ${rot(TAMANHOS_TATUAGEM, p.tatuagemTamanho)}`
            : "Não"
        }`,
        "",
        "— Saúde (consentimento LGPD dado pelo candidato) —",
        `Doença grave/tratamento: ${p.doencaGrave === "sim" ? `Sim${p.doencaGraveDescricao ? ` (${p.doencaGraveDescricao})` : ""}; em tratamento: ${p.emTratamento === "sim" ? "SIM — REVISAR" : "não"}` : "Não"}`,
        `Condições visuais: ${p.semCondicaoVisual ? "Nenhuma" : `${p.condicoesVisuais.map((c) => rot(CONDICOES_VISUAIS, c)).join(", ")} — REVISAR`}`,
        `Fumante: ${rot(OPCOES_FUMANTE, p.fumante)}`,
        `Medicação controlada: ${p.medicacaoControlada === "sim" ? `Sim — ${p.medicacaoClasses.map((c) => rot(CLASSES_MEDICAMENTO, c)).join(", ")} — REVISAR (checar regras de entrada de medicamento no Japão)` : "Não"}`,
        `Diabetes: ${p.diabetes === "sim" ? `Sim — ${rot(TIPOS_DIABETES, p.diabetesTipo)}; insulina injetável: ${p.insulinaInjetavel === "sim" ? "SIM — REVISAR (moradia/fábrica com estrutura de higiene para aplicação)" : "não"}` : "Não"}`,
      ].filter((l, i) => i === 0 || l !== "");
    }

    const resumoTexto = [
      "Nova candidatura — /empregos",
      "",
      `Vaga: ${vaga.titulo} — ${vaga.empresa}`,
      `Nome: ${nome} ${sobrenome}`,
      `E-mail: ${email}`,
      `Telefone: ${telefone}`,
      idade ? `Idade: ${idade}` : "Idade: não informada",
      `Nível de japonês: ${
        NIVEIS_JAPONES_DETALHADOS.find((n) => n.key === respostas.nivelJaponesDetalhado)?.label || "Não informado"
      }${certificadoJapones ? ` (certificado anexado: ${certificadoJapones.nome})` : ""}`,
      `Experiência em fábrica/produção: ${respostas.experienciaSetor === "sim" ? "Sim" : respostas.experienciaSetor === "nao" ? "Não" : "Não respondeu"}`,
      `Re-Entry válido: ${respostas.reEntry === "sim" ? "SIM — embarque mais rápido" : respostas.reEntry === "nao" ? "Não" : "Não respondeu"}`,
      `Ascendência japonesa: ${ascendenciaLabel || "Não informada"}`,
      ...linhasPerfil(),
      `Quando gostaria de embarcar: ${quandoEmbarcarLabel || "Não informado"}`,
      `Classificação: ${
        resultado.eliminado
          ? `ELIMINADO — ${resultado.motivosEliminacao.join(" / ")}`
          : resultado.classificacao === "aprovado_alto"
            ? "Aprovado — score 80+"
            : "Aprovado — score abaixo de 80"
      }`,
      `Pontuação: ${resultado.pontuacao}%${resultado.aprovadoParaFoto ? " (passou para a etapa de foto)" : ""}`,
      resultado.pontosRevisar.length ? `Revisar: ${resultado.pontosRevisar.join(", ")}` : "",
      "",
      ...resultado.criterios.map((c: CriterioPontuacao) => `- ${c.label}: ${c.pontosObtidos}/${c.pontosMaximos} — ${c.detalhe}`),
    ].join("\n");

    await notificarPorEmail({
      assunto: `[Candidatura${resultado.eliminado ? " — ELIMINADO" : ""}] ${vaga.titulo} — ${nome} ${sobrenome} (${resultado.pontuacao}%)`,
      texto: resumoTexto,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${resumoTexto}</pre>`,
      replyTo: email,
    });

    // Não passou nesta vaga? Sugere até 3 outras vagas em que o MESMO
    // perfil + currículo passaria (score >= 80 e sem eliminatória) —
    // Wilson, 06/out/2026.
    const sugestoes = resultado.aprovadoParaFoto
      ? []
      : VAGAS.filter((v) => v.id !== vaga.id)
          .map((v) => ({
            v,
            r: calcularPontuacaoCandidatura({
              vaga: v,
              curriculoTexto,
              idade: Number.isFinite(idade) && idade !== null && idade > 0 ? idade : null,
              respostas,
            }),
          }))
          .filter(({ r }) => r.aprovadoParaFoto)
          .sort((a, b) => b.r.pontuacao - a.r.pontuacao || (a.v.status === "aberta" ? -1 : 1))
          .slice(0, 3)
          .map(({ v, r }) => ({
            vagaId: v.id,
            titulo: v.titulo,
            empresa: v.empresa,
            cidade: v.cidade,
            regiao: v.regiao,
            salario: v.salario,
            pontuacao: r.pontuacao,
          }));

    return NextResponse.json({
      candidaturaId: candidatura.id,
      // Segredo da candidatura (mesmo token da ficha) — permite candidatar
      // a uma vaga sugerida sem reenviar o formulário.
      tokenCandidatura: candidatura.ficha_token ?? null,
      sugestoes,
      // Etapa 2 — ficha cadastral (só quando passou: score >= 80 e não eliminado).
      fichaUrl:
        resultado.aprovadoParaFoto && candidatura.ficha_token
          ? `/empregos/ficha/${candidatura.id}?t=${candidatura.ficha_token}`
          : null,
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
