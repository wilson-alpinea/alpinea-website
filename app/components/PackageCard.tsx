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
  const [selecionada, setSelecionada] = useState(variantes[0]?.id ?? "");
  const variante = variantes.find((v) => v.id === selecionada) ?? variantes[0];

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
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "#6ec3d9" }}
            >
              {categoria}
            </p>
            {selo && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                style={{ backgroundColor: "#2f80c9" }}
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
                <span className="mt-0.5 shrink-0" style={{ color: "#6ec3d9" }}>
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {variantes.length > 1 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                {varianteHint}
              </p>
              <div className="flex flex-wrap gap-3">
                {variantes.map((v) => {
                  const ativo = v.id === selecionada;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelecionada(v.id);
                      }}
                      className={`rounded-full border px-7 py-3.5 text-base font-semibold uppercase tracking-[0.1em] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.06] active:scale-95 ${
                        ativo
                          ? "border-transparent text-white shadow-[0_10px_26px_rgba(0,0,0,0.4)]"
                          : "border-white/20 text-white/60 hover:border-white/50 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
                      }`}
                      style={ativo ? { backgroundColor: "#2f80c9" } : undefined}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          {variante && (
            <>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                {variante.datas}
              </p>
              <p className={`${display.className} mt-1 text-3xl font-medium text-white`}>
                {variante.precoLabel}
              </p>
              {variante.parcelaLabel && (
                <p className="mt-1 text-sm font-medium text-white/70">{variante.parcelaLabel}</p>
              )}
            </>
          )}
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
          varianteInicialId={selecionada}
          rodape={rodape}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
