"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirEquipe } from "@/lib/crm/acesso";
import { nomeArquivoSeguro } from "@/lib/crm/arquivosStorage";
import { BUCKET_NF, LIMITE_NF_MB, TIPOS_NF, isOrigemNf } from "@/lib/crm/notasFiscais";

// Anexar nota fiscal de serviço concluído (Wilson, 04/nov/2026) — pela
// notificação ou pela tela do serviço. O arquivo sobe direto do navegador
// para o storage (URL assinada) e depois é registrado aqui.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABELA = { agencia: "clientes", seguro: "seguro_pedidos", documentacao: "documentacao_processos" } as const;

export async function prepararUploadNf(
  origem: string,
  registroId: string,
  nomeArquivo: string,
  tamanho: number,
  tipo: string,
): Promise<{ ok: true; path: string; token: string } | { ok: false; erro: string }> {
  try {
    await garantirEquipe();
  } catch {
    return { ok: false, erro: "Acesso negado." };
  }
  if (!isOrigemNf(origem) || !UUID.test(registroId)) return { ok: false, erro: "Serviço inválido." };
  if (tamanho > LIMITE_NF_MB * 1024 * 1024) return { ok: false, erro: `A nota fiscal pode ter até ${LIMITE_NF_MB} MB.` };
  if (tipo && !TIPOS_NF.includes(tipo)) return { ok: false, erro: "Envie a nota em PDF, XML ou imagem (PNG/JPG)." };
  const db = createAdminClient();
  const { data: registro } = await db.from(TABELA[origem]).select("id").eq("id", registroId).maybeSingle();
  if (!registro) return { ok: false, erro: "Serviço não encontrado." };
  const path = `${origem}/${registroId}/${Date.now()}__${nomeArquivoSeguro(nomeArquivo)}`;
  const { data, error } = await db.storage.from(BUCKET_NF).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("Erro ao preparar upload de NF:", error);
    return { ok: false, erro: "Não foi possível preparar o envio. A migração 036 já foi rodada no Supabase?" };
  }
  return { ok: true, path: data.path, token: data.token };
}

export async function registrarNf(origem: string, registroId: string, path: string, nomeOriginal: string): Promise<{ ok: boolean; erro?: string }> {
  let acesso;
  try {
    acesso = await garantirEquipe();
  } catch {
    return { ok: false, erro: "Acesso negado." };
  }
  if (!isOrigemNf(origem) || !UUID.test(registroId) || !path.startsWith(`${origem}/${registroId}/`) || path.includes("..")) {
    return { ok: false, erro: "Arquivo inválido." };
  }
  const { error } = await createAdminClient()
    .from("notas_fiscais")
    .insert({ origem, registro_id: registroId, caminho: path, nome_arquivo: nomeOriginal.slice(0, 200) || "nota-fiscal", created_by: acesso.userId, created_by_email: acesso.email });
  if (error) {
    console.error("Erro ao registrar NF:", error);
    return { ok: false, erro: "A nota subiu, mas não foi possível registrá-la. Tente de novo." };
  }
  revalidatePath("/crm", "layout");
  return { ok: true };
}
