"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Peças visuais compartilhadas pelo Financeiro (Wilson, 22/out/2026).

export const CAMPO =
  "w-full rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-base text-[#20252B] outline-none transition placeholder:text-[#8A929B] focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25 disabled:bg-[#F5F6F7]";
export const LABEL = "mb-1.5 block text-[13px] font-medium text-[#626B75]";
export const BOTAO_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-[#2C5480] focus-visible:ring-2 focus-visible:ring-[#24476B]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60";
export const BOTAO_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] outline-none transition hover:border-[#24476B]/50 focus-visible:ring-2 focus-visible:ring-[#24476B]/30 disabled:opacity-50";
export const BOTAO_PERIGO =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#B42318] px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-[#9A1E14] focus-visible:ring-2 focus-visible:ring-[#B42318]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60";

export function novaChave(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Painel lateral (desktop) / folha inferior (celular), em portal no <body>. */
export function Painel({
  titulo,
  subtitulo,
  onFechar,
  children,
  rodape,
  largura = "max-w-lg",
}: {
  titulo: string;
  subtitulo?: string;
  onFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}) {
  const tituloId = useId();
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const primeiro = caixa.current?.querySelector<HTMLElement>("input, select, textarea, button[data-foco]");
    primeiro?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = anterior;
    };
  }, [onFechar]);

  return createPortal(
    <div className="crm-ui fixed inset-0 z-[70] flex items-end justify-end sm:items-stretch" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
      <button type="button" aria-label="Fechar" onClick={onFechar} className="crm-livre absolute inset-0 bg-black/30" />
      <div
        ref={caixa}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:h-full sm:max-h-none sm:rounded-none ${largura}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E6E9ED] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={tituloId} className="text-[#20252B]">
              {titulo}
            </h2>
            {subtitulo && <p className="mt-0.5 text-[13px] text-[#626B75]">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="crm-livre -mr-2 rounded-full px-2.5 py-1 text-2xl leading-none text-[#626B75] transition hover:bg-black/5 hover:text-[#20252B]"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {rodape && <footer className="flex flex-wrap justify-end gap-2 border-t border-[#E6E9ED] px-5 py-4 sm:px-6">{rodape}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function Erro({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg border border-[#B42318]/20 bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">
      {children}
    </p>
  );
}

export function Aviso({ children, tom = "ambar" }: { children: ReactNode; tom?: "ambar" | "azul" | "cinza" }) {
  const cores = {
    ambar: "border-[#946200]/20 bg-[#FFF4DB] text-[#6F4A00]",
    azul: "border-[#24476B]/15 bg-[#EAF1F8] text-[#24476B]",
    cinza: "border-[#D5DAE0] bg-[#F5F6F7] text-[#4A525C]",
  }[tom];
  return <div className={`rounded-lg border px-3 py-2 text-sm ${cores}`}>{children}</div>;
}

export function Spinner() {
  return <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}
