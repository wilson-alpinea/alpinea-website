// Páginas privadas: nunca indexadas por buscadores nem por IA — só abre
// quem tem o link (Wilson, 04/nov/2026: "todos os roteiros, crm, sistemas
// internos não podem ser indexados por mecanismos de busca ou AI, somente
// via link"). Módulo puro, usado pelo proxy.ts, pelo app/robots.ts e pelo
// next.config.ts.
//
// Três camadas:
// 1. Cabeçalho X-Robots-Tag "noindex, nofollow, noarchive, nosnippet,
//    noimageindex, noai, noimageai" em toda resposta privada (proxy.ts e,
//    para /api, next.config.ts).
// 2. Robôs de busca e de IA recebem 404 nessas páginas (proxy.ts) — mesmo
//    os que ignoram robots.txt e noindex não leem o conteúdo. Robôs de
//    prévia de link (WhatsApp, iMessage, Telegram…) continuam liberados,
//    para o link enviado ao cliente mostrar a prévia.
// 3. robots.txt (app/robots.ts) bloqueia as áreas internas — sem listar os
//    endereços dos roteiros, para não revelar os links privados.

/** Áreas internas/privadas por prefixo de caminho. */
export const PREFIXOS_PRIVADOS = [
  "/crm",
  "/database",
  "/api",
  "/calculadora_reversa",
  "/briefing",
  "/video-roteiro",
  "/documentacao/processo",
  "/empregos/ficha",
  "/empregos/proposta",
  "/empregos/agendamento",
  "/empregos/candidatura",
  "/empregos/testes",
  "/produtos/seguro-viagem/direto",
] as const;

// Roteiros individuais e demos: pasta na raiz com 8 caracteres aleatórios
// (letras minúsculas + números, ao menos um de cada) — ex.: /rf3vk8mp.
// Roteiros novos criados no mesmo padrão já ficam privados automaticamente.
const ROTEIRO_PRIVADO = /^\/(?=[a-z0-9]{8}(?:\/|$))(?=[a-z]*\d)(?=\d*[a-z])[a-z0-9]{8}(?:\/|$)/;

export function caminhoPrivado(pathname: string): boolean {
  if (ROTEIRO_PRIVADO.test(pathname)) return true;
  return PREFIXOS_PRIVADOS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const X_ROBOTS_PRIVADO = "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai";

// Buscadores e robôs de IA (treino, busca e leitura a pedido do usuário).
// Não inclui robôs de prévia de link: facebookexternalhit, WhatsApp,
// Twitterbot, TelegramBot, Slackbot, LinkedInBot, Discordbot, SkypeUriPreview.
const ROBOS =
  /googlebot|google-inspectiontool|googleother|google-cloudvertexbot|storebot-google|adsbot-google|mediapartners-google|apis-google|bingbot|bingpreview|msnbot|adidxbot|slurp|duckduckbot|duckassistbot|baiduspider|yandex|sogou|exabot|seznambot|petalbot|applebot|mojeek|qwantify|ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|bytespider|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-user|claude-searchbot|claude-web|anthropic-ai|perplexitybot|perplexity-user|ccbot|amazonbot|meta-externalagent|meta-externalfetcher|facebookbot|cohere-ai|cohere-training-data-crawler|diffbot|youbot|ai2bot|timpibot|omgilibot|omgili|imagesiftbot|mistralai-user|novaact|pangubot|kangaroo bot|webzio|icc-crawler|img2dataset|deepseek|grokbot|xai-|phindbot/i;

export function ehRoboIndexador(userAgent: string | null | undefined): boolean {
  return !!userAgent && ROBOS.test(userAgent);
}
