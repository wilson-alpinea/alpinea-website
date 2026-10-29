import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { carregarProcessoPublico, enviarEmailDoc, EMAIL_EQUIPE_DOC } from "@/lib/documentacao/processoPublico";
import {
  DOC_COMPROVANTE, MAX_ARQUIVOS_PROCESSO, TAMANHO_MAX_ARQUIVO, TIPOS_ARQUIVO_ACEITOS, documentosServico, passoAtual, type DocumentoEnviado,
} from "@/app/documentacao/processo";
import { servicoDoc } from "@/lib/crm/documentacao";

export const runtime = "nodejs";

// Envio de documentos pelo portal de Documentação (Wilson, 29/out/2026) —
// bucket privado "documentos-processos" (migração 027). Mesmo cuidado da
// foto de /empregos: confere token, tipo e tamanho no servidor.

const BUCKET = "documentos-processos";
const nomeSeguro = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100) || "arquivo";
const publico = (d: DocumentoEnviado) => ({ id: d.id, tipo: d.tipo, nome: d.nome, tamanho: d.tamanho, enviado_em: d.enviado_em });

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const p = await carregarProcessoPublico(String(form.get("id") ?? ""), String(form.get("token") ?? ""));
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    const passo = passoAtual(p);
    if (passo === "encerrado" || passo === "concluido") return NextResponse.json({ error: "Este processo não recebe mais documentos." }, { status: 409 });

    const tipo = String(form.get("tipo") ?? "");
    const tiposValidos = [...documentosServico(p.servico).map((t) => t.id), DOC_COMPROVANTE];
    if (!tiposValidos.includes(tipo)) return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 });
    if (tipo === DOC_COMPROVANTE && passo !== "pagamento" && passo !== "andamento") {
      return NextResponse.json({ error: "O comprovante é enviado depois do aceite do contrato." }, { status: 409 });
    }

    const arquivo = form.get("arquivo");
    if (!(arquivo instanceof File) || arquivo.size === 0) return NextResponse.json({ error: "Escolha um arquivo." }, { status: 400 });
    if (arquivo.size > TAMANHO_MAX_ARQUIVO) return NextResponse.json({ error: "Arquivo muito grande — até 10 MB." }, { status: 400 });
    if (!TIPOS_ARQUIVO_ACEITOS.includes(arquivo.type)) return NextResponse.json({ error: "Formato não aceito — envie PDF, JPG, PNG, WEBP ou HEIC." }, { status: 400 });

    const docs = (Array.isArray(p.documentos) ? p.documentos : []) as DocumentoEnviado[];
    if (docs.length >= MAX_ARQUIVOS_PROCESSO) return NextResponse.json({ error: "Limite de arquivos atingido. Fale com a equipe pelo WhatsApp." }, { status: 400 });

    const supabase = createAdminClient();
    const id = randomUUID();
    const path = `${p.id}/${tipo}/${id}-${nomeSeguro(arquivo.name)}`;
    const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type });
    if (erroUpload) {
      console.error("Erro no upload (documentacao):", erroUpload);
      return NextResponse.json({ error: "Não foi possível enviar o arquivo agora. Tente novamente." }, { status: 500 });
    }

    const agora = new Date().toISOString();
    const novo: DocumentoEnviado = { id, tipo, nome: arquivo.name.slice(0, 120) || "arquivo", path, tamanho: arquivo.size, enviado_em: agora };
    const lista = [...docs, novo];
    const update: Record<string, unknown> = { documentos: lista, updated_at: agora };
    if (tipo === DOC_COMPROVANTE) {
      update.historico = [...(Array.isArray(p.historico) ? p.historico : []), { em: agora, por: "cliente (portal)", tipo: "nota", texto: "Comprovante de pagamento enviado pelo portal." }];
    }
    const { error } = await supabase.from("documentacao_processos").update(update).eq("id", p.id);
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: "Não foi possível registrar o arquivo." }, { status: 500 });
    }

    if (tipo === DOC_COMPROVANTE || p.ficha_enviada_em) {
      await enviarEmailDoc({
        para: EMAIL_EQUIPE_DOC,
        assunto: `[DOCUMENTAÇÃO] ${tipo === DOC_COMPROVANTE ? "Comprovante de pagamento" : "Novo documento"} — ${servicoDoc(p.servico).label} — ${p.nome}`,
        texto: `${p.nome} enviou "${novo.nome}" (${tipo}) pelo portal.\n\nAbrir no CRM: https://documentos.alpinea.io/crm/documentacao/${p.id}`,
      });
    }
    return NextResponse.json({ sucesso: true, documentos: lista.map(publico) });
  } catch (e) {
    console.error("Erro no envio de documento (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente." }, { status: 500 });
  }
}

// Remover um arquivo enviado por engano — só antes do envio da ficha
// (depois disso, a equipe já pode estar analisando).
export async function DELETE(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { id?: string; token?: string; docId?: string } | null;
    const p = await carregarProcessoPublico(String(corpo?.id ?? ""), corpo?.token);
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (passoAtual(p) !== "ficha") return NextResponse.json({ error: "Depois do envio da ficha, peça a troca do arquivo à equipe." }, { status: 409 });
    const docs = (Array.isArray(p.documentos) ? p.documentos : []) as DocumentoEnviado[];
    const alvo = docs.find((d) => d.id === corpo?.docId);
    if (!alvo) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    const lista = docs.filter((d) => d.id !== alvo.id);
    const supabase = createAdminClient();
    const { error } = await supabase.from("documentacao_processos").update({ documentos: lista, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (error) return NextResponse.json({ error: "Não foi possível remover agora." }, { status: 500 });
    await supabase.storage.from(BUCKET).remove([alvo.path]);
    return NextResponse.json({ sucesso: true, documentos: lista.map(publico) });
  } catch (e) {
    console.error("Erro ao remover documento (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
