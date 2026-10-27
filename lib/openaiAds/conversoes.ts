// Conversions API da Plataforma de Anúncios da OpenAI (ChatGPT Ads) —
// Wilson, 27/out/2026. Envia do servidor o mesmo evento que o pixel envia do
// navegador, com o mesmo id: a OpenAI deduplica (pixel + evento + id) e conta
// uma vez só, mesmo se o navegador bloquear o pixel.
//
// Precisa da variável de ambiente OPENAI_ADS_CAPI_KEY (chave criada em
// "Criar chave de conversão"). Sem ela, não envia nada. Nunca derruba a
// requisição que a chamou.

const PIXEL_ID = "6domiRibtibKAc65xR1w8H";

export async function enviarConversaoOpenAI(evento: { id: string; tipo: string; sourceUrl: string | null }) {
  const chave = process.env.OPENAI_ADS_CAPI_KEY;
  if (!chave) return;
  try {
    const r = await fetch(`https://bzr.openai.com/v1/events?pid=${PIXEL_ID}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        validate_only: false,
        events: [
          {
            id: evento.id,
            type: evento.tipo,
            timestamp_ms: Date.now(),
            ...(evento.sourceUrl ? { source_url: evento.sourceUrl } : {}),
            action_source: "web",
            data: { type: "customer_action" },
          },
        ],
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) console.error("OpenAI Conversions API:", r.status, (await r.text().catch(() => "")).slice(0, 300));
  } catch (e) {
    console.error("OpenAI Conversions API falhou:", e);
  }
}
