"use client";

import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { useCambioUSD, brlParaUSDLabel, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { SERVICOS_AVULSOS } from "../lib/servicosAvulsos";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function ServicosAdicionaisPage() {
  const cambio = useCambioUSD();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/produtos">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-9 w-auto object-contain md:h-10"
            />
          </Link>
        </div>
      </header>

      {/* ── SERVIÇOS AVULSOS ── */}
      <section className="border-b border-white/10 bg-[#050505] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
              Complementos
            </p>
            <h1
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}
            >
              Serviços avulsos
            </h1>
            <p className="mt-4 text-sm font-light leading-6 text-white/55 md:text-base">
              Já tem passagem e hospedagem resolvidas? Adicione só o que
              falta ao seu roteiro — mesmos itens disponíveis no Pacote
              Viagem Personalizada.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS_AVULSOS.map((servico) => (
              <div
                key={servico.nome}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_30px_-14px_rgba(37,99,235,0.3)] transition hover:border-white/25 hover:bg-white/[0.04]"
              >
                <img
                  src={servico.icone}
                  alt=""
                  className={`h-9 w-9 object-contain ${
                    servico.icone.endsWith(".svg") ? "" : "invert"
                  }`}
                />
                <h3 className={`${display.className} mt-3 text-lg font-medium text-white`}>
                  {servico.nome}
                </h3>
                <p className="mt-2 flex-1 text-sm font-light leading-6 text-white/55">
                  {servico.descricao}
                </p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    A partir de
                  </p>
                  <p className={`${display.className} mt-1 text-xl font-medium text-white`}>
                    {servico.precoUSD != null
                      ? formatUSD(servico.precoUSD)
                      : brlParaUSDLabel(servico.precoBRL, cambio)}
                    {servico.porDia ? "/dia" : ""}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white/50">
                    ou{" "}
                    {servico.precoUSD != null
                      ? cambio
                        ? formatBRL(servico.precoUSD * cambio.cotacao)
                        : "…"
                      : formatBRL(servico.precoBRL)}
                    {servico.porDia ? "/dia" : ""}
                  </p>
                  {servico.notaPreco && (
                    <p className="mt-1 text-[11px] italic text-white/40">{servico.notaPreco}</p>
                  )}
                </div>
                <Link
                  href="/viagem-personalizada"
                  className="mt-5 block rounded-full px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0A2540] transition hover:brightness-95"
                  style={{ backgroundColor: "#9FD4EE" }}
                >
                  Adicionar ao meu pacote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
