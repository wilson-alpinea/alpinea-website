import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { carregarProcessoPublico, enviarEmailDoc, EMAIL_EQUIPE_DOC, URL_SITE } from "@/lib/documentacao/processoPublico";
import { VERSAO_CONTRATO_DOC, parseFichaDoc, passoAtual, signatarioFicha, textoContrato, urlPortal } from "@/app/documentacao/processo";
import { servicoDoc } from "@/lib/crm/documentacao";
import { emailClienteHtml, emailClienteTexto } from "@/lib/email/templateCliente";

export const runtime = "nodejs";

// Aceite eletrônico do contrato (Wilson, 29/out/2026: "sem uma assinatura
// digital, sem uma comprovação mais robusta, fica mais difícil a gente
// conseguir provar algo"). O texto é montado AQUI, com o valor final que a
// equipe definiu no CRM e o nome/CPF da ficha; o cliente confirma digitando
// nome e CPF. Fica gravado: texto integral, hash SHA-256, data/hora, IP e
// navegador — e uma cópia vai por e-mail ao cliente.

const so = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const digitos = (s: string) => s.replace(/\D/g, "");

export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { id?: string; token?: string; nome?: string; cpf?: string; aceites?: unknown } | null;
    const p = await carregarProcessoPublico(String(corpo?.id ?? ""), corpo?.token);
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (passoAtual(p) !== "contrato") return NextResponse.json({ error: "O contrato não está disponível para aceite agora." }, { status: 409 });
    if (!p.valor_final) return NextResponse.json({ error: "O valor final ainda não foi definido pela equipe." }, { status: 409 });
    const aceites = Array.isArray(corpo?.aceites) ? corpo!.aceites : [];
    if (!aceites.includes("termos") || !aceites.includes("garantia")) return NextResponse.json({ error: "Marque as duas confirmações para aceitar." }, { status: 400 });

    const ficha = parseFichaDoc(p.servico, p.ficha, 15);
    const sig = signatarioFicha(p.servico, ficha);
    if (!sig) return NextResponse.json({ error: "Ficha incompleta. Fale com a equipe." }, { status: 409 });
    if (so(String(corpo?.nome ?? "")) !== so(sig.nome) || digitos(String(corpo?.cpf ?? "")) !== digitos(sig.cpf)) {
      return NextResponse.json({ error: "Nome ou CPF não conferem com os dados do titular na ficha." }, { status: 400 });
    }

    const agora = new Date();
    const data = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " (horário de Brasília)";
    const texto = textoContrato({ servico: p.servico, nome: sig.nome, cpf: sig.cpf, valorFinal: p.valor_final, pessoas: ficha.pessoas.map((x) => x.nome).filter(Boolean), resumo: p.resumo ?? "", data });
    const integral = [texto.titulo, ...texto.clausulas].join("\n\n");
    const hash = createHash("sha256").update(integral, "utf8").digest("hex");
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || null;
    const contrato = { texto, hash, nome: sig.nome, cpf: sig.cpf, ip, user_agent: (req.headers.get("user-agent") || "").slice(0, 300) || null, aceito_em: agora.toISOString(), versao: VERSAO_CONTRATO_DOC };

    const historico = Array.isArray(p.historico) ? p.historico : [];
    const { error } = await createAdminClient()
      .from("documentacao_processos")
      .update({
        contrato,
        contrato_aceito_em: agora.toISOString(),
        etapa: "contrato_aceito",
        updated_at: agora.toISOString(),
        historico: [...historico, { em: agora.toISOString(), por: "cliente (portal)", tipo: "etapa", de: p.etapa, para: "contrato_aceito", texto: `Contrato aceito eletronicamente (SHA-256 ${hash.slice(0, 12)}…).` }],
      })
      .eq("id", p.id)
      .eq("etapa", "pre_aprovado");
    if (error) return NextResponse.json({ error: "Não foi possível registrar o aceite. Tente novamente." }, { status: 500 });

    const nomeServico = servicoDoc(p.servico).label;
    const link = `${URL_SITE}${urlPortal(p.id, p.acesso_token)}`;
    if (p.email) {
      const email = {
        nome: sig.nome,
        titulo: `Contrato aceito — ${nomeServico}`,
        intro: "Recebemos o seu aceite eletrônico. A cópia integral do contrato está abaixo. O próximo passo é o pagamento pela Stone (cartão ou Pix), no seu link de acesso.",
        etapas: [{ titulo: "Cadastro" }, { titulo: "Ficha e documentos" }, { titulo: "Análise da equipe" }, { titulo: "Contrato" }, { titulo: "Pagamento", texto: `Pague em ${link}` }, { titulo: "Processo em andamento" }],
        etapaAtual: 4,
        status: "Aguardando o pagamento",
        resumo: [["Valor", p.valor_final], ["Aceito em", data], ["Código de integridade", hash]] as [string, string][],
        extras: [texto.titulo, ...texto.clausulas],
        mensagemWhatsapp: `Olá! Aceitei o contrato de ${nomeServico} e quero os dados para pagamento.`,
        rotuloAndamento: "Andamento do seu processo",
      };
      await enviarEmailDoc({ para: [p.email], assunto: `Seu contrato — ${nomeServico} (Ajisai)`, texto: emailClienteTexto(email), html: emailClienteHtml(email) });
    }
    await enviarEmailDoc({
      para: EMAIL_EQUIPE_DOC,
      assunto: `[DOCUMENTAÇÃO] Contrato aceito — ${nomeServico} — ${sig.nome}`,
      texto: `${sig.nome} (CPF ${sig.cpf}) aceitou o contrato em ${data}.\nValor: ${p.valor_final}\nIP: ${ip ?? "—"}\nSHA-256: ${hash}\n\nPróximo passo: pagamento pela Stone no portal (confirma sozinho pelo webhook).\nCRM: https://documentos.alpinea.io/crm/documentacao/${p.id}`,
    });
    return NextResponse.json({ sucesso: true });
  } catch (e) {
    console.error("Erro no aceite do contrato (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente." }, { status: 500 });
  }
}
