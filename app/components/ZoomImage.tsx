"use client";

import { useState } from "react";
import Image from "next/image";

// Componente de zoom reutilizável — ícone de lupa no hover, abre a imagem em
// lightbox (modal full-screen) em vez de navegar para uma nova página.
export function ZoomImage({
  src,
  alt,
  width,
  height,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full cursor-zoom-in ${className}`}
      >
        <Image src={src} alt={alt} width={width} height={height} className={imgClassName} />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
          <span className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 text-white/60 hover:text-white text-3xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full rounded-[16px] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
