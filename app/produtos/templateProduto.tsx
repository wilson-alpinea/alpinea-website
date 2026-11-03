"use client";

// Peças do template das páginas de produto (/produtos/esim, jrpass,
// seguro-viagem…) reaproveitadas pelas páginas de Roteiro Personalizado e
// Viagem Personalizada (Wilson, 03/nov/2026: "altere para o novo [template]
// que estamos usando em todos os cards do /produtos").

import Image from "next/image";
import Link from "next/link";
import { display } from "./page";

export function BarraProduto({ titulo }: { titulo: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
      <Link href="/produtos" className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Voltar
      </Link>
      <span className="h-4 w-px bg-white/20" aria-hidden="true" />
      <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>{titulo}</p>
      <div className="flex-1" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
    </div>
  );
}

export function TituloPasso({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">{numero}</span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-black">{titulo}</p>
    </div>
  );
}

export type PassoComoFunciona = { icone: string; titulo: string; texto: string };

export function ComoFunciona({ passos }: { passos: PassoComoFunciona[] }) {
  return (
    <div className="mt-8 rounded-2xl bg-[#eef6fb] p-5 sm:p-6">
      <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-[#1c6ea8]">Como funciona</p>
      <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
        {passos.map((passo, i) => (
          <div key={passo.titulo} className="flex min-w-0 flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">Passo {i + 1}</p>
            <Image src={passo.icone} alt="" width={256} height={256} className="mt-2 h-20 w-20 object-contain" />
            <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
            <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Contador − n + no padrão das páginas de produto. */
export function Contador({
  rotulo,
  valor,
  min,
  max,
  formatar,
  onChange,
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  formatar: (n: number) => string;
  onChange: (n: number) => void;
}) {
  const botao =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30";
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">{rotulo}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, valor - 1))} disabled={valor <= min} aria-label={`Diminuir ${rotulo.toLowerCase()}`} className={botao}>
          −
        </button>
        <span className="min-w-[6.5rem] text-center text-base font-semibold tabular-nums text-[#0A2540]" aria-live="polite">
          {formatar(valor)}
        </span>
        <button type="button" onClick={() => onChange(Math.min(max, valor + 1))} disabled={valor >= max} aria-label={`Aumentar ${rotulo.toLowerCase()}`} className={botao}>
          +
        </button>
      </div>
    </div>
  );
}

export function TelaEnviado({ titulo, texto, linkWhatsapp }: { titulo: string; texto: string; linkWhatsapp: string }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h1 className={`${display.className} mt-5 text-2xl font-medium text-black md:text-3xl`}>{titulo}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70">{texto}</p>
      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
      >
        Continuar no WhatsApp
      </a>
    </div>
  );
}
