"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { isTipoArquivo, TIPO_ARQUIVO_LABEL } from "@/lib/crm/arquivos";
import { BUCKET_ARQUIVOS_CLIENTE, LIMITE_ARQUIVO_CLIENTE_MB, PREFIXO_STORAGE, nomeArquivoSeguro } from "@/lib/crm/arquivosStorage";

// Upload de arquivos na ficha do cliente (Wilson, 21/out/2026). O navegador
// envia o arquivo direto para o Supabase com uma URL de upload assinada
// (sem passar pela Vercel, que limita requisições a 4,5 MB); depois o
// registro é gravado em arquivos_cliente.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function garantirBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(BUCKET_ARQUIVOS_CLIENTE);
  if (data) return;
  const { error } = await admin.storage.createBucket(BUCKET_ARQUIVOS_CLIENTE, {
    public: false,
    fileSizeLimit: `${LIMITE_ARQUIVO_CLIENTE_MB}MB`,
  });
  if (error && !/exist/i.test(error.message)) throw error;
}

export async function prepararUploadArquivoCliente(
  clienteId: string,
  nomeArquivo: string,
  tamanho: number,
): Promise<{ ok: true; path: string; token: string } | { ok: false; erro: string }> {
  await garantirAdmin();
  if (!UUID.test(clienteId)) return { ok: false, erro: "Cliente inválido." };
  if (tamanho > LIMITE_ARQUIVO_CLIENTE_MB * 1024 * 1024) return { ok: false, erro: `Cada arquivo pode ter até ${LIMITE_ARQUIVO_CLIENTE_MB} MB.` };
  try {
    await garantirBucket();
    const path = `${clienteId}/${Date.now()}__${nomeArquivoSeguro(nomeArquivo)}`;
    const { data, error } = await createAdminClient().storage.from(BUCKET_ARQUIVOS_CLIENTE).createSignedUploadUrl(path);
    if (error || !data) throw error;
    return { ok: true, path: data.path, token: data.token };
  } catch (e) {
    console.error("Erro ao preparar upload de arquivo do cliente:", e);
    return { ok: false, erro: "Não foi possível preparar o envio. Tente de novo." };
  }
}

export async function registrarArquivoCliente(
  clienteId: string,
  dados: { tipo: string; label: string; path: string; nomeOriginal: string },
): Promise<{ ok: boolean; erro?: string }> {
  await garantirAdmin();
  if (!UUID.test(clienteId) || !dados.path.startsWith(`${clienteId}/`) || dados.path.includes("..")) {
    return { ok: false, erro: "Arquivo inválido." };
  }
  const tipo = isTipoArquivo(dados.tipo) ? dados.tipo : "outro";
  const label = (dados.label.trim() || dados.nomeOriginal.trim() || TIPO_ARQUIVO_LABEL[tipo]).slice(0, 160);
  const { error } = await createAdminClient()
    .from("arquivos_cliente")
    .insert({ cliente_id: clienteId, tipo, label, url: `${PREFIXO_STORAGE}${dados.path}` });
  if (error) {
    console.error("Erro ao registrar arquivo do cliente:", error);
    return { ok: false, erro: "O arquivo subiu, mas não foi possível registrá-lo. Tente de novo." };
  }
  revalidatePath(`/crm/clientes/${clienteId}`);
  return { ok: true };
}
