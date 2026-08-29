"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import type { CartItem } from "./CartContext";
import type { PackageVariant } from "./packageTypes";
import { PackageDetailModal } from "./PackageDetailModal";
import { PrecoPacote } from "./PrecoPacote";

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
  variantes,
  inclusoes,
  varianteHint = "Selecionar duração",
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
  variantes: PackageVariant[];
  inclusoes: string[];
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
        className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md sm:rounded-[2rem]"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "#1f6f9c" }}
            >
              {categoria}
            </p>
            {selo && (
              <span className="rounded-full border border-[#0A2540]/15 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#0A2540]/55">
                {selo}
              </span>
            )}
          </div>
          <h3 className={`${display.className} mt-1.5 text-2xl font-medium text-[#0A2540]`}>
            {nome}
          </h3>
          <p className="mt-1.5 text-sm font-light leading-6 text-[#0A2540]/60">{tagline}</p>

          <p className="mt-4 text-sm font-light leading-6 text-[#0A2540]/65">{descricao}</p>

          <ul className="mt-5 space-y-2.5">
            {destaques.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-5 text-[#0A2540]/75"
              >
                <span className="mt-0.5 shrink-0" style={{ color: "#2f80c9" }}>
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {variantes.length > 1 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0A2540]">
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
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                      ativo
                        ? "border-[#0A2540] bg-[#0A2540] text-white"
                        : "border-black/15 text-[#0A2540]/60 hover:border-black/30 hover:text-[#0A2540]"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-black/10 pt-5">
          {variante && (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#0A2540]/50">
                {variante.datas}
              </p>
              <PrecoPacote
                variante={variante}
                theme="light"
                compact
                precoClassName={`${display.className} mt-1 text-4xl font-semibold text-[#0A2540]`}
              />
            </>
          )}
          {rodape && <p className="mt-2 text-[11px] leading-5 text-[#0A2540]/45">{rodape}</p>}

          <div className="mt-5 rounded-xl border border-[#0A2540]/10 bg-[#0A2540]/[0.025] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0A2540]/55">
              Incluído no valor
            </p>
            <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {inclusoes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#0A2540]/70">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f80c9]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <span
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300"
            style={{ backgroundColor: "#2f80c9" }}
          >
            Ver detalhes e itinerário
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
