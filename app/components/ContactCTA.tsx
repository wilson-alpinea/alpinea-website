"use client";

import { useEffect, useState, type FormEvent } from "react";

// Formulário único de contato — usado em todas as páginas do site.
// E-mail: envia via /api/contact (precisa de RESEND_API_KEY configurada).
// WhatsApp: monta a mensagem e abre o wa.me já preenchido.
function ContactModal({
  channel,
  onClose,
}: {
  channel: "email" | "whatsapp";
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      dates: String(data.get("dates") || "").trim(),
      travelers: String(data.get("travelers") || "").trim(),
      budget: String(data.get("budget") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || (channel === "email" && !payload.email)) {
      setStatus("error");
      setErrorMsg("Preencha nome" + (channel === "email" ? " e e-mail" : "") + " para continuar.");
      return;
    }

    if (channel === "whatsapp") {
      const lines = [
        `Olá! Meu nome é ${payload.name}.`,
        payload.phone && `Telefone: ${payload.phone}`,
        payload.dates && `Datas previstas: ${payload.dates}`,
        payload.travelers && `Viajantes: ${payload.travelers}`,
        payload.message && `Sobre a viagem: ${payload.message}`,
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/5511996691818?text=${text}`, "_blank");
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
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível enviar agora. Tente novamente ou escreva para wilson@alpinea.io.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-8 text-black md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="mb-6 block text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black"
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
                ? "A Alpinea responde pessoalmente, normalmente em até 1 dia útil."
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
            <p className="mb-3 text-xs uppercase tracking-[0.45em] text-black/40">
              Fale com a Alpinea
            </p>
            <h3 className="text-2xl font-medium leading-tight md:text-3xl">
              {channel === "email" ? "Vamos conversar por e-mail." : "Vamos conversar por WhatsApp."}
            </h3>
            <p className="mt-3 text-sm leading-6 text-black/55">
              Conte um pouco sobre a viagem. Nenhum campo abaixo é obrigatório além do nome
              {channel === "email" ? " e do e-mail" : ""}.
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
                    E-mail{channel === "email" ? "" : " (opcional)"}
                  </span>
                  <input
                    name="email"
                    type="email"
                    required={channel === "email"}
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
                    Viajantes (opcional)
                  </span>
                  <select
                    name="travelers"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3-4">3–4</option>
                    <option value="5+">5+</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Faixa de investimento (opcional)
                  </span>
                  <select
                    name="budget"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Até R$50k">Até R$50k</option>
                    <option value="R$50k–150k">R$50k–150k</option>
                    <option value="R$150k+">R$150k+</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                  Como você imagina essa viagem (opcional)
                </span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Gastronomia, compras, hospedagem, momentos especiais..."
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
  );
}

// Componente público — solte <ContactCTA /> em qualquer página (mesmo
// Server Components, como páginas com `export const metadata`) sem
// precisar transformar a página inteira em Client Component.
export function ContactCTA({
  className = "mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row",
}: {
  className?: string;
}) {
  const [contactChannel, setContactChannel] = useState<"email" | "whatsapp" | null>(null);

  return (
    <>
      {contactChannel && (
        <ContactModal channel={contactChannel} onClose={() => setContactChannel(null)} />
      )}
      <div className={className}>
        <button
          type="button"
          onClick={() => setContactChannel("email")}
          className="border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
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
