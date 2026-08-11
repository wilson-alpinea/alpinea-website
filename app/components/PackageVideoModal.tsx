"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

/** Botão "Assistir vídeo" que abre um player em modal. Se nenhum vídeo for
 * informado ainda (produção em andamento), mostra um aviso no lugar do player
 * em vez de quebrar a página. */
export function PackageVideoTrigger({
  titulo,
  videoSrc,
  poster,
  triggerClassName,
  triggerLabel = "Assistir vídeo do pacote",
}: {
  titulo: string;
  videoSrc?: string;
  poster?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
        }
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
          <IconPlay className="h-3 w-3 translate-x-[1px]" />
        </span>
        {triggerLabel}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] sm:rounded-[1.75rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar vídeo"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition hover:border-white/50 hover:text-white"
              >
                <IconX className="h-4 w-4" />
              </button>

              {videoSrc ? (
                <video
                  src={videoSrc}
                  poster={poster}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#111] px-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/50">
                    <IconPlay className="h-6 w-6 translate-x-[1px]" />
                  </span>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                    Vídeo em produção
                  </p>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <p className={`${display.className} text-lg font-medium text-white sm:text-xl`}>
                  {titulo}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
