"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Pixel de conversão da Plataforma de Anúncios da OpenAI (ChatGPT Ads) —
// só nas páginas de /empregos (Wilson, 27/out/2026). Fonte de dados
// "My first pixel". Conversão: candidatura enviada (registration_completed),
// disparada em EmpregosCliente.tsx e também pelo servidor (Conversions API,
// lib/openaiAds/conversoes.ts) com o mesmo id. Pré-entrevista marcada:
// também registration_completed, id agendamento_<id> (AgendamentoForm.tsx +
// api/empregos-agendamento). Docs: developers.openai.com/ads/measurement-pixel
export const PIXEL_OPENAI_EMPREGOS = "6domiRibtibKAc65xR1w8H";

type Oaiq = (...args: unknown[]) => void;
declare global {
  interface Window {
    oaiq?: Oaiq;
  }
}

/** Envia um evento ao pixel, se ele estiver carregado. Nunca quebra a página. */
export function medirOpenAI(evento: string, dados: Record<string, unknown>, opcoes?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.oaiq) window.oaiq("measure", evento, dados, ...(opcoes ? [opcoes] : []));
  } catch {}
}

export function PixelOpenAI() {
  const pathname = usePathname();
  // Visualização de página a cada rota de /empregos (navegação client-side incluída).
  useEffect(() => {
    medirOpenAI("page_viewed", { type: "contents" });
  }, [pathname]);

  return (
    <Script id="openai-pixel" strategy="afterInteractive">
      {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"${PIXEL_OPENAI_EMPREGOS}",debug:true});`}
    </Script>
  );
}

// ── Google Ads (Wilson, 27/out/2026) ─────────────────────────────────
// Mesmos dois momentos da OpenAI: candidatura concluída e pré-entrevista
// marcada. A tag AW-18262525346 já é carregada em app/layout.tsx.
// GOOGLE_ADS_EMPREGOS_SEND_TO = "AW-18262525346/<rótulo>" da ação de
// conversão "Empregos — candidatura" criada no Google Ads. Vazio = só envia
// o evento do GA4 (generate_lead), sem conversão do Ads.
export const GOOGLE_ADS_EMPREGOS_SEND_TO = "AW-18262525346/7t-HCLvY-6odEKKLoIRE"; // ação "Empregos - Candidatura"

type Gtag = (...args: unknown[]) => void;

/** Conversão de Empregos no Google Ads + evento generate_lead no GA4. */
export function medirGoogleEmpregos(momento: "candidatura" | "agendamento", id: string) {
  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (!gtag) return;
    gtag("event", "generate_lead", { form_name: `empregos_${momento}` });
    if (GOOGLE_ADS_EMPREGOS_SEND_TO) gtag("event", "conversion", { send_to: GOOGLE_ADS_EMPREGOS_SEND_TO, transaction_id: `${momento}_${id}` });
  } catch {}
}
