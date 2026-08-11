"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "./CartContext";

// Atalhos rápidos — o campo continua livre para qualquer número de horas,
// isso é só um preenchimento rápido pros valores mais comuns.
const ATALHOS_HORAS = [4, 6, 8, 12, 24];

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

export function CustomPackageCard() {
  const { addItem } = useCart();
  const [data, setData] = useState("");
  const [horas, setHoras] = useState(6);
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
      variante: `${horas}h · ${dataFormatada}`,
      detalhes: observacoes ? [`Observações: ${observacoes}`] : undefined,
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
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
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
              Quantidade de horas
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 focus-within:border-white/40">
              <input
                type="number"
                min={1}
                max={999}
                value={horas}
                onChange={(e) => setHoras(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-transparent text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="shrink-0 text-sm text-white/40">horas</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ATALHOS_HORAS.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setHoras(opcao)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    horas === opcao
                      ? "border-[#e0916a] bg-[#e0916a]/15 text-[#e0916a]"
                      : "border-white/15 text-white/45 hover:border-white/35 hover:text-white/80"
                  }`}
                >
                  {opcao}h
                </button>
              ))}
            </div>
          </label>
        </div>

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
          Valor calculado conforme data, horas e roteiro escolhidos. A Ajisai
          retorna com uma proposta sob consulta.
        </p>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 sm:w-auto sm:px-8"
          style={{ backgroundColor: adicionado ? "#2f9e6e" : "#2f80c9" }}
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
      </form>
    </div>
  );
}
