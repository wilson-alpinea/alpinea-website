"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { useCart } from "./CartContext";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const OPCOES_HORAS = [
  "4 horas",
  "6 horas",
  "8 horas",
  "10 horas",
  "12 horas",
  "Mais de 1 dia",
];

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
  const [horas, setHoras] = useState(OPCOES_HORAS[1]);
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
      variante: `${horas} · ${dataFormatada}`,
      detalhes: observacoes ? [`Observações: ${observacoes}`] : undefined,
      precoLabel: "Sob consulta",
      imagem: "/images/tanakamotorista.png",
    });

    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] sm:rounded-[2rem] lg:grid-cols-[1.1fr_1.4fr]">
      <div className="relative h-[220px] overflow-hidden lg:h-auto">
        <Image
          src="/images/tanakamotorista.png"
          alt="Motorista particular à disposição para roteiro personalizado no Japão"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent lg:bg-gradient-to-r" />
      </div>

      <div className="flex flex-col p-6 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#e0916a]">
          Divisão 3 · Sob medida
        </p>
        <h3 className={`${display.className} mt-1.5 text-2xl font-medium text-white md:text-3xl`}>
          Pacotes Personalizados
        </h3>
        <p className="mt-2 text-sm font-light leading-6 text-white/60">
          Viaje em qualquer data e pela quantidade de horas que preferir. Monte
          um roteiro sob medida com motorista e guia particular, sem se
          encaixar em datas ou grupos fixos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
              <select
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
              >
                {OPCOES_HORAS.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
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
            style={{ backgroundColor: adicionado ? "#2f9e6e" : "#e0916a" }}
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
    </div>
  );
}
