"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function ContactModal({
  channel,
  whatsappNumber,
  brand,
  onClose,
}: {
  channel: "email" | "whatsapp";
  whatsappNumber: string;
  brand: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    window.gtag?.("event", "form_start", {
      form_name: "alpinea_contact",
      contact_channel: channel,
    });
  }, [channel]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      dates: String(data.get("dates") || "").trim(),
      firstJapan: String(data.get("firstJapan") || "").trim(),
      travelers: String(data.get("travelers") || "").trim(),
      tripType: String(data.get("tripType") || "").trim(),
      travelStyle: String(data.get("travelStyle") || "").trim(),
      source: String(data.get("source") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email) {
      setStatus("error");
      setErrorMsg("Preencha nome e e-mail para continuar.");
      return;
    }

    if (channel === "whatsapp") {
      const lines = [
        `Olá! Meu nome é ${payload.name}.`,
        payload.phone && `Telefone: ${payload.phone}`,
        payload.dates && `Datas previstas: ${payload.dates}`,
        payload.firstJapan && `Primeira viagem ao Japão: ${payload.firstJapan}`,
        payload.travelers && `Quem irá viajar: ${payload.travelers}`,
        payload.tripType && `Tipo de viagem: ${payload.tripType}`,
        payload.travelStyle && `Como costuma viajar: ${payload.travelStyle}`,
        payload.source && `Como conheceu a ${brand}: ${payload.source}`,
        payload.message && `Interesses específicos: ${payload.message}`,
      ].filter(Boolean);

      const text = encodeURIComponent(lines.join("\n"));

      window.gtag?.("event", "whatsapp_click", {
        form_name: "alpinea_contact",
      });

      // Mesmo evento de lead/conversão do fluxo de e-mail — sem isso, contatos
      // via WhatsApp nunca apareciam como conversão no Google Ads.
      window.gtag?.("event", "generate_lead", {
        form_name: "alpinea_contact",
        contact_channel: "whatsapp",
      });

      window.gtag?.("event", "conversion", {
        send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE",
        value: 1.0,
        currency: "BRL",
      });

      window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
      setStatus("success");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("request failed");

      window.gtag?.("event", "generate_lead", {
        form_name: "alpinea_contact",
        contact_channel: "email",
      });

      window.gtag?.("event", "conversion", {
        send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE",
        value: 1.0,
        currency: "BRL",
      });

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível enviar agora. Tente novamente ou escreva para wilson@alpinea.io.");
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/80 md:flex md:items-center md:justify-center md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex h-[100dvh] w-full flex-col bg-white text-black md:h-auto md:max-h-[90vh] md:max-w-lg md:overflow-y-auto md:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo — só no mobile. O formulário tem muitos campos e rola bastante;
            sem isso, o botão de fechar saía de vista assim que o usuário começava a
            rolar e ficava quase impossível de encontrar de novo. */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-3 md:hidden">
          <p className="text-[11px] uppercase tracking-[0.25em] text-black/40">
            Fale com a {brand}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-xl leading-none text-black transition active:bg-black/5"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-6 pt-5 md:overflow-visible md:p-12">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="mb-6 hidden text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black md:block"
          >
            Fechar ×
          </button>

          {status === "success" ? (
            <div className="py-6 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.45em] text-black/40">
                {channel === "email" ? "Mensagem enviada" : "WhatsApp aberto"}
              </p>
              <h3 className="text-2xl font-medium leading-tight md:text-3xl">
                {channel === "email" ? "Recebemos sua mensagem." : "Quase lá."}
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/60">
                {channel === "email"
                  ? `A ${brand} responde pessoalmente, normalmente em até 1 dia útil.`
                  : "Finalize o envio da mensagem na aba do WhatsApp que abrimos para você."}
              </p>
              <button
                onClick={onClose}
                className="mt-8 border border-black px-8 py-3 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 hidden text-xs uppercase tracking-[0.45em] text-black/40 md:block">
                Fale com a {brand}
              </p>

              <h3 className="text-2xl font-medium leading-tight md:text-3xl">
                {channel === "email" ? "Vamos conversar por e-mail." : "Vamos conversar por WhatsApp."}
              </h3>

            <p className="mt-3 text-sm leading-6 text-black/55">
              Conte um pouco sobre a viagem. Nenhum campo abaixo é obrigatório
              além do nome e do e-mail.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Nome completo
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    E-mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Telefone (opcional)
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Datas previstas (opcional)
                  </span>
                  <input
                    name="dates"
                    type="text"
                    placeholder="ex: setembro 2026, ainda flexível"
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none placeholder:text-black/30 focus:border-black"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Primeira viagem ao Japão? (opcional)
                  </span>
                  <select
                    name="firstJapan"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Quem irá viajar? (opcional)
                  </span>
                  <select
                    name="travelers"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Sozinho(a)">Sozinho(a)</option>
                    <option value="Casal">Casal</option>
                    <option value="Família">Família</option>
                    <option value="Família com crianças">Família com crianças</option>
                    <option value="Amigos">Amigos</option>
                    <option value="Grupo privado">Grupo privado</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Tipo de viagem (opcional)
                  </span>
                  <select
                    name="tripType"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Gastronomia e restaurantes">Gastronomia e restaurantes</option>
                    <option value="Compras e artigos de luxo">Compras e artigos de luxo</option>
                    <option value="Lua de mel">Lua de mel</option>
                    <option value="Família">Família</option>
                    <option value="Cultura tradicional">Cultura tradicional</option>
                    <option value="Japão contemporâneo">Japão contemporâneo</option>
                    <option value="Eventos especiais">Eventos especiais</option>
                    <option value="Viagem multigeracional">Viagem multigeracional</option>
                    <option value="Ainda estou explorando possibilidades">Ainda estou explorando possibilidades</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Como costuma viajar? (opcional)
                  </span>
                  <select
                    name="travelStyle"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Organizo tudo por conta própria">Organizo tudo por conta própria</option>
                    <option value="Costumo utilizar agências de viagem">Costumo utilizar agências de viagem</option>
                    <option value="Já utilizei serviços de concierge ou planejamento personalizado">
                      Já utilizei serviços de concierge ou planejamento personalizado
                    </option>
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Como conheceu a {brand}? (opcional)
                  </span>
                  <select
                    name="source"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="YouTube - Tudo Sobre Japão">YouTube - Tudo Sobre Japão</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Cliente anterior">Cliente anterior</option>
                    <option value="Imprensa">Imprensa</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                  Existe algum hotel, restaurante, experiência ou artigo que gostaria de incluir? (opcional)
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Ex.: Aman Kyoto, Sushi Arai, relógios, facas artesanais, transporte privado..."
                  className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />
              </label>

              {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full border border-black px-8 py-4 text-xs uppercase tracking-[0.35em] transition hover:bg-black hover:text-white disabled:opacity-50 md:w-auto"
              >
                {status === "loading"
                  ? "Enviando..."
                  : channel === "email"
                  ? "Enviar mensagem"
                  : "Continuar no WhatsApp"}
              </button>
            </form>
          </>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ContactCTA({
  className = "mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row",
  mode = "buttons",
  channel = "email",
  label = "Falar por e-mail",
  buttonClassName,
  whatsappNumber = "5511996691818",
  brand = "Alpinea",
}: {
  className?: string;
  /** "buttons" (padrão) renderiza os 2 CTAs de sempre. "single" renderiza 1 botão que já abre o modal direto. */
  mode?: "buttons" | "single";
  /** Canal usado quando mode="single". */
  channel?: "email" | "whatsapp";
  /** Texto (ou conteúdo, ex: ícone + texto) do botão quando mode="single". */
  label?: ReactNode;
  /** Classe do próprio botão quando mode="single" (sobrescreve o estilo padrão). */
  buttonClassName?: string;
  /** Número de WhatsApp (só dígitos, com DDI) usado quando o canal é "whatsapp". Padrão: número da Alpinea. */
  whatsappNumber?: string;
  /** Nome da marca exibido no modal (ex: "Vamos conversar por WhatsApp", "Fale com a {brand}"). Padrão: "Alpinea". */
  brand?: string;
}) {
  const [contactChannel, setContactChannel] = useState<"email" | "whatsapp" | null>(null);

  if (mode === "single") {
    return (
      <>
        {contactChannel && (
          <ContactModal
            channel={contactChannel}
            whatsappNumber={whatsappNumber}
            brand={brand}
            onClose={() => setContactChannel(null)}
          />
        )}

        <div className={className}>
          <button
            type="button"
            onClick={() => setContactChannel(channel)}
            className={
              buttonClassName ??
              "bg-black px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-black/85"
            }
          >
            {label}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {contactChannel && (
        <ContactModal
          channel={contactChannel}
          whatsappNumber={whatsappNumber}
          brand={brand}
          onClose={() => setContactChannel(null)}
        />
      )}

      <div className={className}>
        <button
          type="button"
          onClick={() => setContactChannel("email")}
          className="bg-black px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-black/85"
        >
          Falar por e-mail
        </button>

        <button
          type="button"
          onClick={() => setContactChannel("whatsapp")}
          className="border border-black/20 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/70 transition hover:border-black hover:text-black"
        >
          WhatsApp
        </button>
      </div>
    </>
  );
}