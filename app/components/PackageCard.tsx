"use client";

import { useState } from "react";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { useCart, type CartItem } from "./CartContext";
import { PackageVideoTrigger } from "./PackageVideoModal";

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
  imagemAlt,
  selo,
  accent = "#b79ce6",
  videoSrc,
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
  imagemAlt?: string;
  selo?: string;
  accent?: string;
  videoSrc?: string;
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
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={imagem}
          alt={imagemAlt ?? nome}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {selo && (
          <span
            className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: accent }}
          >
            {selo}
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4">
          <PackageVideoTrigger
            titulo={nome}
            videoSrc={videoSrc}
            triggerClassName="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-black/65"
            triggerLabel="Assistir vídeo"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {categoria}
        </p>
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
            <p className="mb-2.5 text-[10px] uppercase tracking-[0.22em] text-white/35">
              {varianteHint}
            </p>
            <div className="flex flex-wrap gap-2">
              {variantes.map((v) => {
                const ativo = v.id === selecionada;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelecionada(v.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] transition ${
                      ativo
                        ? "border-transparent text-black"
                        : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
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
