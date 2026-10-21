// Arquivos enviados direto para o storage na ficha do cliente (Wilson,
// 21/out/2026: "onde está a opção de subir arquivos?"). Ficam no bucket
// privado abaixo; em arquivos_cliente.url guardamos "storage:<caminho>" e
// o link abre por /crm/arquivo-cliente?id=<id>, que gera URL assinada.
export const BUCKET_ARQUIVOS_CLIENTE = "arquivos-clientes";
export const PREFIXO_STORAGE = "storage:";
export const LIMITE_ARQUIVO_CLIENTE_MB = 50;

export const ehArquivoStorage = (url: string) => url.startsWith(PREFIXO_STORAGE);

export function nomeArquivoSeguro(nome: string) {
  return (
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(-100) || "arquivo"
  );
}
