"use client";

import { useState } from "react";
import Image from "next/image";
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

export function PackageCard({
  divisao,
  categoria,
  nome,
  tagline,
  imagem,
  icone,
  selo,
  variantes,
  rodape,
}: {
  divisao: CartItem["divisao"];
  categoria: string;
  nome: string;
  tagline: string;
  imagem: string;
  icone: string;
  selo?: string;
  variantes: PackageVariant[];
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
        className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md sm:rounded-[2rem]"
      >
        <Image
          src={icone}
          alt=""
          width={1254}
          height={1254}
          className="absolute right-5 top-5 h-20 w-20 object-contain md:right-6 md:top-6"
        />
        <div>
          <h3 className={`${display.className} pr-24 text-2xl font-medium text-[#0A2540]`}>
            {nome}
          </h3>
          {selo && (
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-[#0A2540]/15 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#0A2540]/55">
                {selo}
              </span>
            </div>
          )}
          {variante && (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#0A2540]/50">
              {variante.datas}
            </p>
          )}
        </div>

        {variantes.length > 1 && (
          <div className="mt-4">
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
              <PrecoPacote
                variante={variante}
                theme="light"
                compact
                precoClassName={`${display.className} mt-1 text-4xl font-semibold text-[#0A2540]`}
              />
            </>
          )}
          <span
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300"
            style={{ backgroundColor: "#2f80c9" }}
          >
            Ver itinerário
          </span>
        </div>
      </div>

      {open && (
        <PackageDetailModal
          divisao={divisao}
          categoria={categoria}
          nome={nome}
          tagline={tagline}
          imagem={imagem}
          selo={selo}
          variantes={variantes}
          varianteInicialId={selecionada}
          rodape={rodape}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
