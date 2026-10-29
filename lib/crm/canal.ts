// Origem (canal) do lead — Wilson, 21/out/2026. Sem dependências de
// servidor: usado no proxy, nas APIs e nas telas.

export const CANAIS = [
  { valor: "google_ads", label: "Google Ads" },
  { valor: "meta_ads", label: "Meta Ads (Facebook/Instagram)" },
  { valor: "busca_organica", label: "Busca orgânica" },
  { valor: "instagram", label: "Instagram (orgânico)" },
  { valor: "whatsapp", label: "WhatsApp" },
  // Canal do YouTube (Wilson, 29/out/2026).
  { valor: "youtube_tudo_sobre_japao", label: "YouTube — Tudo Sobre O Japão" },
  { valor: "consultor", label: "Consultor" },
  { valor: "parceiro", label: "Parceiro" },
  { valor: "indicacao", label: "Indicação de cliente" },
  { valor: "direto", label: "Direto / sem origem" },
  { valor: "outro", label: "Outro" },
] as const;

export type Canal = (typeof CANAIS)[number]["valor"];
export const CANAL_LABEL = Object.fromEntries(CANAIS.map((c) => [c.valor, c.label])) as Record<Canal, string>;
export const isCanal = (v: unknown): v is Canal => CANAIS.some((c) => c.valor === v);

export function rotuloOrigem(canal: string | null | undefined, detalhe: string | null | undefined) {
  const base = isCanal(canal) ? CANAL_LABEL[canal] : "Sem origem";
  return detalhe ? `${base} — ${detalhe}` : base;
}

// Cookie com os parâmetros de campanha da última visita (90 dias).
export const COOKIE_UTM = "alpinea_utm";
export const PARAMS_CAMPANHA = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid"] as const;
export type DadosCampanha = Partial<Record<(typeof PARAMS_CAMPANHA)[number] | "landing" | "referer" | "em", string>>;

const contem = (v: string | undefined, ...termos: string[]) => !!v && termos.some((t) => v.toLowerCase().includes(t));

/** Deduz o canal a partir dos parâmetros de campanha capturados no site. */
export function canalDaCampanha(d: DadosCampanha | null): { canal: Canal; detalhe: string | null } {
  if (!d) return { canal: "direto", detalhe: null };
  const pago = contem(d.utm_medium, "cpc", "ppc", "paid", "pago", "ads");
  if (d.gclid || d.gbraid || d.wbraid || (contem(d.utm_source, "google", "adwords") && pago)) {
    return { canal: "google_ads", detalhe: d.utm_campaign || null };
  }
  if (d.fbclid && !d.utm_source) return { canal: "meta_ads", detalhe: d.utm_campaign || null };
  if (contem(d.utm_source, "facebook", "instagram", "meta", "fb", "ig") && pago) {
    return { canal: "meta_ads", detalhe: d.utm_campaign || null };
  }
  if (contem(d.utm_source, "instagram", "ig")) return { canal: "instagram", detalhe: d.utm_campaign || null };
  if (contem(d.utm_source, "youtube", "yt")) return { canal: "youtube_tudo_sobre_japao", detalhe: d.utm_campaign || null };
  if (contem(d.utm_source, "whatsapp", "wa")) return { canal: "whatsapp", detalhe: d.utm_campaign || null };
  if (d.utm_source) return { canal: "outro", detalhe: [d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(" / ") };
  if (contem(d.referer, "google.", "bing.", "duckduckgo.", "yahoo.")) return { canal: "busca_organica", detalhe: d.referer || null };
  if (contem(d.referer, "youtube.", "youtu.be")) return { canal: "youtube_tudo_sobre_japao", detalhe: null };
  if (contem(d.referer, "instagram.")) return { canal: "instagram", detalhe: null };
  if (contem(d.referer, "facebook.", "fb.")) return { canal: "meta_ads", detalhe: "orgânico" };
  if (d.referer) return { canal: "outro", detalhe: d.referer };
  return { canal: "direto", detalhe: null };
}

export function lerCookieCampanha(valor: string | undefined | null): DadosCampanha | null {
  if (!valor) return null;
  try {
    const o = JSON.parse(decodeURIComponent(valor));
    if (!o || typeof o !== "object") return null;
    const limpo: DadosCampanha = {};
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "string" && v.length <= 300) (limpo as Record<string, string>)[k] = v;
    }
    return limpo;
  } catch {
    return null;
  }
}
