"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import type { CartItem } from "./CartContext";
import type { PackageVariant } from "./packageTypes";
import { PackageDetailModal } from "./PackageDetailModal";

export type { PackageVariant } from "./packageTypes";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function IconCheck({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function PackageCard({
  divisao,
  categoria,
  nome,
  tagline,
  descricao,
  destaques,
  imagem,
  selo,
  accent = "#b79ce6",
  variantes,
  varianteHint = "Duração",
  rodape,
}: {
  divisao: CartItem["divisao"];
  categoria: string;
  nome: string;
  tagline: string;
  descricao: string;
  destaques: string[];
  imagem: string;
  selo?: string;
  accent?: string;
  variantes: PackageVariant[];
  varianteHint?: string;
  rodape?: string;
}) {
  const [open, setOpen] = useState(false);
  const precoDesde = variantes[0]?.precoLabel;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/25 hover:bg-white/[0.04] sm:rounded-[2rem]"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {categoria}
          </p>
          {selo && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black"
              style={{ backgroundColor: accent }}
            >
              {selo}
            </span>
          )}
        </div>
        <h3 className={`${display.className} mt-1.5 text-2xl font-medium text-white`}>
          {nome}
        </h3>
        <p className="mt-1.5 text-sm font-light leading-6 text-white/55">{tagline}</p>

        <p className="mt-4 text-sm font-light leading-6 text-white/60">{descricao}</p>

        <ul className="mt-5 space-y-2.5">
          {destaques.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-white/65">
              <span className="mt-0.5 shrink-0" style={{ color: accent }}>
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-1 flex-col justify-end border-t border-white/10 pt-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
            A partir de
          </p>
          <p className={`${display.className} mt-1 text-3xl font-medium text-white`}>
            {precoDesde}
          </p>
          {rodape && <p className="mt-2 text-[11px] leading-5 text-white/40">{rodape}</p>}

          <span
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300"
            style={{ backgroundColor: "#2f80c9" }}
          >
            Ver detalhes e itinerário →
          </span>
        </div>
      </div>

      {open && (
        <PackageDetailModal
          divisao={divisao}
          categoria={categoria}
          nome={nome}
          tagline={tagline}
          descricao={descricao}
          destaques={destaques}
          imagem={imagem}
          accent={accent}
          selo={selo}
          variantes={variantes}
          varianteHint={varianteHint}
          rodape={rodape}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
