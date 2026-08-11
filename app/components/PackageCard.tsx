"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import { useCart, type CartItem } from "./CartContext";

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

function IconCart({ className }: { className?: string }) {
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
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l1.8 11a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6l1.4-7.4H6.1" />
    </svg>
  );
}

export type PackageVariant = {
  id: string;
  /** Ex: "7 dias" */
  label: string;
  /** Datas de referência da variante, ex: "28 mar – 03 abr 2027" */
  datas: string;
  precoLabel: string;
  parcelaLabel?: string;
};

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
  const { addItem } = useCart();
  const [selecionada, setSelecionada] = useState(variantes[0]?.id ?? "");
  const [adicionado, setAdicionado] = useState(false);

  const variante = variantes.find((v) => v.id === selecionada) ?? variantes[0];

  function handleAdd() {
    if (!variante) return;
    addItem({
      divisao,
      nome,
      variante: `${variante.label} · ${variante.datas}`,
      detalhes: [`Preço: ${variante.precoLabel}`],
      precoLabel: variante.precoLabel,
      imagem,
    });
    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] sm:rounded-[2rem]">
      <div className="flex flex-1 flex-col p-6">
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
                    onClick={() => setSelecionada(v.id)}
                    className={`rounded-full border px-7 py-3.5 text-base font-semibold uppercase tracking-[0.1em] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.06] active:scale-95 ${
                      ativo
                        ? "border-transparent text-black shadow-[0_10px_26px_rgba(0,0,0,0.4)]"
                        : "border-white/20 text-white/60 hover:border-white/50 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
                    }`}
                    style={ativo ? { backgroundColor: accent } : undefined}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-1 flex-col justify-end border-t border-white/10 pt-5">
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

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5"
            style={{ backgroundColor: adicionado ? "#2f9e6e" : "#7c4fd1" }}
          >
            {adicionado ? (
              <>
                <IconCheck className="h-4 w-4" /> Adicionado ao carrinho
              </>
            ) : (
              <>
                <IconCart className="h-4 w-4" /> Adicionar ao carrinho
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
