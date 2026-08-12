"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "./CartContext";

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

function IconSend({ className }: { className?: string }) {
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
      <path d="M21 3 3 10.5l7.5 3L14 21l7-18Z" />
      <path d="M10.5 13.5 21 3" />
    </svg>
  );
}

export function CustomPackageCard() {
  const { addItem } = useCart();
  const [data, setData] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [adicionado, setAdicionado] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const dataFormatada = data
      ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Data a combinar";

    addItem({
      divisao: "Personalizado",
      nome: "Pacote Personalizado",
      variante: `Data solicitada: ${dataFormatada}`,
      detalhes: [`Preferências: ${observacoes || "a combinar"}`],
      precoLabel: "Sob consulta",
      imagem: "/images/personalizado-hero.png",
    });

    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:rounded-[2rem] md:p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#e0916a]">
        Sob medida
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <label className="block sm:max-w-xs">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Data preferida
          </span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            O que você gostaria de incluir? (opcional)
          </span>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Ex: passeio noturno em Ginza, compras em Ginza, jantar especial..."
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
          />
        </label>

        <p className="text-[11px] leading-5 text-white/40">
          Valor calculado conforme data e roteiro escolhidos. A Ajisai retorna
          com uma proposta sob consulta.
        </p>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 sm:w-auto sm:px-8"
          style={{ backgroundColor: adicionado ? "#2f9e6e" : "#2f80c9" }}
        >
          {adicionado ? (
            <>
              <IconCheck className="h-4 w-4" /> Solicitação adicionada
            </>
          ) : (
            <>
              <IconSend className="h-4 w-4" /> Solicitar proposta →
            </>
          )}
        </button>
      </form>
    </div>
  );
}
