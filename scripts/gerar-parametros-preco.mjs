// Gera app/lib/parametrosPreco.valores.ts com os preços/margens alterados no
// CRM (/crm/precos → tabela precos_parametros, migração 035). Roda antes do
// `next build` e do `next dev` (package.json). Wilson, 04/nov/2026.
//
// - Sem as variáveis do Supabase (ex.: máquina sem .env.local): gera vazio
//   (= padrões do código) e avisa. No Vercel isso é erro — o build para,
//   para não publicar o site com os preços padrão por engano.
// - Tabela ainda não criada (migração 035 não rodada): gera vazio e avisa.
// - Qualquer outra falha: no Vercel o build para (o site anterior continua no
//   ar); local, mantém o último arquivo gerado e segue.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = path.join(raiz, "app", "lib", "parametrosPreco.valores.ts");

function lerEnvLocal() {
  for (const nome of [".env.local", ".env"]) {
    const arq = path.join(raiz, nome);
    if (!fs.existsSync(arq)) continue;
    for (const linha of fs.readFileSync(arq, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

function gravar(valores, origem) {
  const ordenado = Object.fromEntries(Object.entries(valores).sort(([a], [b]) => a.localeCompare(b)));
  const conteudo =
    "// Gerado por scripts/gerar-parametros-preco.mjs — não editar (fora do git).\n" +
    `// Origem: ${origem}\n` +
    `export const VALORES_PARAMETROS_PRECO: Record<string, number> = ${JSON.stringify(ordenado, null, 2)};\n`;
  const atual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
  // Compara sem a linha de origem, para não reescrever (e recompilar) à toa.
  const semOrigem = (t) => t.replace(/^\/\/ Origem:.*$/m, "");
  if (semOrigem(atual) !== semOrigem(conteudo)) fs.writeFileSync(destino, conteudo);
  console.log(`[preços] ${Object.keys(ordenado).length} parâmetro(s) alterado(s) no CRM — ${origem}.`);
}

lerEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
const noVercel = process.env.VERCEL === "1";

if (!url || !chave) {
  if (noVercel) {
    console.error("[preços] Faltam NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no Vercel — build interrompido para não publicar preços padrão.");
    process.exit(1);
  }
  console.warn("[preços] Sem variáveis do Supabase: usando os preços padrão do código.");
  gravar({}, "padrões do código (sem Supabase)");
  process.exit(0);
}

try {
  const resp = await fetch(`${url.replace(/\/$/, "")}/rest/v1/precos_parametros?select=id,valor`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}` },
  });
  const corpo = await resp.text();
  if (!resp.ok) {
    if (resp.status === 404 || /PGRST205|42P01|does not exist|Could not find the table/i.test(corpo)) {
      console.warn("[preços] Tabela precos_parametros ainda não existe (rode a migração 035). Usando os padrões do código.");
      gravar({}, "padrões do código (tabela ausente)");
      process.exit(0);
    }
    throw new Error(`HTTP ${resp.status}: ${corpo.slice(0, 300)}`);
  }
  const valores = {};
  for (const linha of JSON.parse(corpo)) {
    const v = Number(linha.valor);
    if (typeof linha.id === "string" && Number.isFinite(v)) valores[linha.id] = v;
  }
  gravar(valores, `Supabase, ${new Date().toISOString()}`);
} catch (erro) {
  if (noVercel) {
    console.error("[preços] Falha ao ler precos_parametros — build interrompido:", erro);
    process.exit(1);
  }
  // Local (ex.: sem internet): não trava o `npm run dev`; mantém o último arquivo gerado.
  console.warn("[preços] Não foi possível ler o Supabase agora; mantendo os últimos valores gerados.", erro?.cause?.code ?? erro?.message ?? erro);
  if (!fs.existsSync(destino)) gravar({}, "padrões do código (Supabase indisponível)");
}
