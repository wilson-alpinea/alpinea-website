import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { carregarProcessoPublico, enviarEmailDoc, EMAIL_EQUIPE_DOC, pessoasDoProcesso } from "@/lib/documentacao/processoPublico";
import { documentosFaltando, errosFicha, linhasFichaDoc, parseFichaDoc, passoAtual, type DocumentoEnviado } from "@/app/documentacao/processo";
import { servicoDoc } from "@/lib/crm/documentacao";

export const runtime = "nodejs";

// Portal de Documentação — etapa "Ficha e documentos" (Wilson, 29/out/2026).
// Salva rascunho (enviar=false, para continuar em outro aparelho) ou envia a
// ficha (enviar=true). No envio, o servidor reconfere todos os campos e os
// documentos obrigatórios — nunca confiar só no navegador.
export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { id?: string; token?: string; ficha?: unknown; enviar?: boolean } | null;
    const p = await carregarProcessoPublico(String(corpo?.id ?? ""), corpo?.token);
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (passoAtual(p) !== "ficha") return NextResponse.json({ error: "A ficha já foi enviada." }, { status: 409 });

    const pessoas = pessoasDoProcesso(p.campos, p.servico);
    const ficha = parseFichaDoc(p.servico, corpo?.ficha, pessoas);
    const agora = new Date().toISOString();
    const supabase = createAdminClient();

    if (!corpo?.enviar) {
      const { error } = await supabase.from("documentacao_processos").update({ ficha, updated_at: agora }).eq("id", p.id);
      if (error) return NextResponse.json({ error: "Não foi possível salvar o rascunho." }, { status: 500 });
      return NextResponse.json({ sucesso: true, rascunho: true });
    }

    const erros = errosFicha(p.servico, ficha, pessoas);
    if (Object.keys(erros).length > 0) return NextResponse.json({ error: "Há campos para corrigir na ficha.", erros }, { status: 400 });
    const docs = (Array.isArray(p.documentos) ? p.documentos : []) as DocumentoEnviado[];
    const faltam = documentosFaltando(p.servico, docs);
    if (faltam.length > 0) return NextResponse.json({ error: `Faltam documentos: ${faltam.map((d) => d.rotulo).join("; ")}.` }, { status: 400 });

    const historico = Array.isArray(p.historico) ? p.historico : [];
    const update: Record<string, unknown> = {
      ficha,
      ficha_enviada_em: agora,
      updated_at: agora,
      historico: [...historico, { em: agora, por: "cliente (portal)", tipo: "nota", texto: `Ficha completa enviada com ${docs.length} documento(s).` }],
    };
    if (p.etapa === "novo") update.etapa = "em_analise";
    const { error } = await supabase.from("documentacao_processos").update(update).eq("id", p.id);
    if (error) return NextResponse.json({ error: "Não foi possível enviar a ficha agora. Tente novamente." }, { status: 500 });

    const nome = servicoDoc(p.servico).label;
    const texto = [
      `Ficha completa recebida — ${nome}`,
      `Cliente: ${p.nome} — ${p.email ?? ""} — ${p.telefone ?? ""}`,
      "",
      ...linhasFichaDoc(p.servico, ficha).flatMap((b) => [`== ${b.titulo} ==`, ...b.linhas.map(([k, v]) => `${k}: ${v}`), ""]),
      `Documentos enviados: ${docs.map((d) => d.nome).join(", ")}`,
      "",
      `Abrir no CRM: https://documentos.alpinea.io/crm/documentacao/${p.id}`,
    ].join("\n");
    await enviarEmailDoc({ para: EMAIL_EQUIPE_DOC, assunto: `[DOCUMENTAÇÃO] Ficha completa — ${nome} — ${p.nome}`, texto, replyTo: p.email ?? undefined });

    return NextResponse.json({ sucesso: true });
  } catch (e) {
    console.error("Erro na ficha (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente." }, { status: 500 });
  }
}
