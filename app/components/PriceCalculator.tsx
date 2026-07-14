"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "./ContactCTA";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Mesma regra usada no texto "Roteiros de até 15 dias, a partir de R$ 1.500":
// preço-base fixo até 15 dias, + valor por dia extra acima disso.
const BASE_DAYS = 15;
const BASE_PRICE = 1500;
const EXTRA_DAY_PRICE = 120;
const MIN_DAYS = 5;
const MAX_DAYS = 45;

function calculatePrice(days: number) {
  const extraDays = Math.max(0, days - BASE_DAYS);
  return BASE_PRICE + extraDays * EXTRA_DAY_PRICE;
}

function IconCalculator({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="2" width="14" height="20" rx="2.4" />
      <rect x="7.4" y="4.4" width="9.2" height="4" rx="0.6" />
      <rect x="7.4" y="11" width="2.5" height="2.5" rx="0.5" />
      <rect x="10.75" y="11" width="2.5" height="2.5" rx="0.5" />
      <rect x="14.1" y="11" width="2.5" height="2.5" rx="0.5" />
      <rect x="7.4" y="14.1" width="2.5" height="2.5" rx="0.5" />
      <rect x="10.75" y="14.1" width="2.5" height="2.5" rx="0.5" />
      <rect x="14.1" y="14.1" width="2.5" height="5.4" rx="0.5" />
    </svg>
  );
}

export function PriceCalculator({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(BASE_DAYS);

  const extraDays = Math.max(0, days - BASE_DAYS);
  const price = calculatePrice(days);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "group mt-6 inline-flex items-center gap-4 rounded-full border border-[#b79ce6]/30 py-2 pl-2 pr-6 transition hover:border-[#b79ce6]/60"
        }
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#b79ce6]/12 text-[#b79ce6] transition-transform duration-300 ease-out group-hover:scale-110 md:h-14 md:w-14">
          <IconCalculator className="h-6 w-6 md:h-7 md:w-7" />
        </span>
        <span className="text-xs uppercase tracking-[0.25em] text-[#b79ce6]">
          Calcular meu investimento →
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 px-4 pb-4 pt-16 backdrop-blur-sm md:items-center md:pb-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:rounded-[2rem] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar calculadora"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg text-white/60 transition hover:border-white/40 hover:text-white"
            >
              ×
            </button>

            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Calculadora
            </p>
            <h3
              className={`${display.className} mt-2 text-2xl font-medium text-white md:text-3xl`}
            >
              Quantos dias de viagem?
            </h3>

            <div className="mt-9">
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
                  aria-label="Diminuir um dia"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-white transition hover:border-white/40"
                >
                  −
                </button>
                <p
                  className={`${display.className} flex items-baseline gap-2 text-5xl font-medium leading-none text-white md:text-6xl`}
                >
                  {days}
                  <span className="text-sm font-light uppercase tracking-[0.2em] text-white/40">
                    dias
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                  aria-label="Aumentar um dia"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-white transition hover:border-white/40"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={MIN_DAYS}
                max={MAX_DAYS}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-7 w-full accent-[#b79ce6]"
                aria-label="Número de dias de viagem"
              />
              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/25">
                <span>{MIN_DAYS} dias</span>
                <span>{MAX_DAYS} dias</span>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-sm font-light text-white/50">
                {extraDays > 0
                  ? `${BASE_DAYS} dias inclusos no valor-base + ${extraDays} ${
                      extraDays === 1 ? "dia extra" : "dias extras"
                    }`
                  : `Até ${BASE_DAYS} dias, investimento-base`}
              </p>
              <p
                className={`${display.className} mt-2 text-5xl font-medium leading-none text-[#b79ce6] md:text-6xl`}
              >
                R$ {price.toLocaleString("pt-BR")}
              </p>
              <p className="mt-3 text-xs text-white/30">
                Estimativa para roteiro personalizado. Valor final pode variar
                conforme complexidade e época da viagem.
              </p>
            </div>

            <ContactCTA
              mode="single"
              channel="whatsapp"
              whatsappNumber="5511930300101"
              brand="Ajisai"
              label="Falar sobre esse roteiro"
              buttonClassName="mt-7 block w-full rounded-full bg-white px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
            />
          </div>
        </div>
      )}
    </>
  );
}
