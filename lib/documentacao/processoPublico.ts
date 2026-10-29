import { createAdminClient } from "@/lib/supabase/admin";

// Carrega o processo de Documentação pelo link do portal (só servidor) —
// mesmo padrão de lib/empregos/candidaturaPublica.ts: confere o token.
export async function carregarProcessoPublico(id: string, token: string | undefined | null) {
  if (!token || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await createAdminClient().from("documentacao_processos").select("*").eq("id", id).maybeSingle();
  if (!data || data.acesso_token !== token) return null;
  return data as Record<string, unknown> & {
    id: string; servico: "visto" | "elegibilidade" | "pet"; etapa: string; nome: string; email: string | null; telefone: string | null;
    campos: Record<string, string> | null; resumo: string | null; acesso_token: string; ficha: unknown; ficha_enviada_em: string | null;
    documentos: unknown; contrato: unknown; contrato_aceito_em: string | null; valor_final: string | null; historico: unknown; motivo_saida: string | null;
  };
}

/** Quantos solicitantes a ficha precisa ter (cadastro do visto/COE). */
export function pessoasDoProcesso(campos: Record<string, string> | null | undefined, servico: string): number {
  if (servico === "pet") return 0;
  const n = Math.floor(Number(campos?.qtd) || 1);
  return Math.max(1, Math.min(15, n));
}

export async function enviarEmailDoc(params: { para: string[]; assunto: string; texto: string; html?: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando e-mail (documentacao).");
    return;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Ajisai <contato@alpinea.io>", to: params.para, reply_to: params.replyTo, subject: params.assunto, text: params.texto, ...(params.html ? { html: params.html } : {}) }),
    });
    if (!r.ok) console.error("Erro Resend (documentacao):", await r.text());
  } catch (e) {
    console.error("Erro ao enviar e-mail (documentacao):", e);
  }
}

export const EMAIL_EQUIPE_DOC = ["wilson@alpinea.io"];
export const URL_SITE = "https://www.alpinea.io";
