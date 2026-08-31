"use client";

import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { useCambioUSD, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_NUMBER = "5511930300101";

// Diária cotada nativamente em dólar — US$ 350/dia, cobre até 4 pessoas
// (mesmo valor usado em PRODUTOS.guia em /produtos e no calculador do
// Pacote Personalizado — ver DIARIA_GUIA_USD em CustomPackageCard.tsx).
const PRECO_GUIA_USD = 350;

const DESTAQUES_GUIA = [
  "Guia particular fluente em português, dedicado só ao seu grupo",
  "Contrate por dia — encaixa em qualquer roteiro já pronto",
  "Conhece trajetos, horários e como evitar filas nos pontos que você já escolheu",
  "Sem pacote fechado: você decide quais dias precisa de guia",
];

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function GuiaTuristicoPage() {
  const cambio = useCambioUSD();

  function contratarGuia() {
    const text = encodeURIComponent(
      "Olá! Tenho interesse em Guia Turístico Avulso e gostaria de receber mais informações.",
    );
    window.gtag?.("event", "whatsapp_click", {
      form_name: "produtos_interesse_direto",
      produto: "Guia Turístico Avulso",
    });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-9 w-auto object-contain md:h-10"
          />
        </div>
      </header>

      {/* ── GUIA TURÍSTICO AVULSO ── */}
      <section className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-stretch gap-12 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <div className="relative aspect-[3/4] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 md:aspect-auto md:h-full md:min-h-[560px]">
              <Image
                src="/images/guia-ajisai-campo.png"
                alt="Guia Ajisai em campo, com bandeira e placa de identificação"
                fill
                sizes="(min-width: 768px) 32rem, 100vw"
                priority
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Guia Turístico Avulso
            </p>
            <h1
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Já organizou a viagem — só falta quem conheça o caminho.
            </h1>
            <p className="mt-5 text-sm font-light leading-6 text-white/60 md:text-base md:leading-7">
              Ideal para quem já tem passagens, hospedagem e roteiro próprio,
              mas quer companhia local para um ou mais dias — sem contratar o
              pacote inteiro.
            </p>

            <ul className="mt-6 space-y-3">
              {DESTAQUES_GUIA.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/65">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6ec3d9]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">A partir de</p>
                <p className={`${display.className} text-4xl font-medium text-white`}>
                  {formatUSD(PRECO_GUIA_USD)}
                </p>
                {cambio && (
                  <p className="mt-0.5 text-sm font-medium text-white/60">
                    ou {formatBRL(PRECO_GUIA_USD * cambio.cotacao)}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-white/40">
                  por dia de acompanhamento, para até 4 pessoas
                </p>
                <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />
              </div>
              <button
                type="button"
                onClick={contratarGuia}
                className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Quero contratar um guia avulso →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
