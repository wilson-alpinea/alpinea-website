"use client";

// Rodapé fixo de checkout compartilhado pelas páginas de produto
// (/produtos/jrpass, /produtos/seguro-viagem, /produtos/cambio).
//
// Pedido do Wilson, 29/set/2026: "esse rodapé está muito carregado, tente
// minimizar a quantidade de alertas, deixe visível a mensagem de alerta
// somente quando estiver algo faltando mesmo e o cliente estiver quase
// finalizando — mesma lógica se aplica à página de jrpass e câmbio".
//
// Como ficou:
// - Por padrão o rodapé é só uma linha: valor + resumo curto à esquerda,
//   botão + selo da Stone à direita. Sem checklist e sem texto explicativo.
// - A lista do que falta só aparece quando o cliente está "quase
//   finalizando", ou seja: (a) o último passo da página (`sentinelaId`)
//   está visível na tela, ou (b) ele tocou em "Finalizar" com algo
//   faltando (o botão continua clicável justamente pra isso — em vez de
//   um botão morto sem explicação). Some sozinha quando não falta mais
//   nada.
// - Ao tocar em "Finalizar" com pendência, a página rola até o último
//   passo pra ele ver os campos.

import { useEffect, useState, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { IconCheck } from "./page";

export function RodapeCheckout({
  containerRef,
  pendencias,
  formValido,
  enviando,
  onFinalizar,
  rotuloValor,
  valor,
  detalhe,
  semValor,
  rotuloBotao,
  mostrarStone = true,
  sentinelaId,
  classeValor,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  pendencias: string[];
  formValido: boolean;
  enviando: boolean;
  onFinalizar: () => void;
  /** Rótulo pequeno acima do valor ("Total", "Você recebe"...). */
  rotuloValor: string;
  /** Valor já formatado, ou null enquanto não dá pra calcular. */
  valor: string | null;
  /** Linha curta de resumo (ex.: "Comum · 7 dias · 2 pessoas"). */
  detalhe?: ReactNode;
  /** Texto mostrado no lugar do valor enquanto ele não existe. */
  semValor: string;
  rotuloBotao: string;
  mostrarStone?: boolean;
  /** id do último passo da página — quando ele aparece na tela, o cliente
   * está "quase finalizando" e a lista de pendências pode aparecer. */
  sentinelaId: string;
  /** Classe da fonte dos números (Inter), vinda da página. */
  classeValor?: string;
}) {
  const [pertoDoFim, setPertoDoFim] = useState(false);
  const [tentouFinalizar, setTentouFinalizar] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById(sentinelaId);
    if (!alvo || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setPertoDoFim(entries.some((e) => e.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [sentinelaId]);

  const mostrarPendencias = pendencias.length > 0 && (pertoDoFim || tentouFinalizar);

  function clicarFinalizar() {
    if (enviando) return;
    if (!formValido) {
      setTentouFinalizar(true);
      document.getElementById(sentinelaId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onFinalizar();
  }

  const habilitado = formValido && !enviando;

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0A263D] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.3)] md:px-8 md:py-4"
    >
      <div className="mx-auto max-w-[1150px]">
        {mostrarPendencias && (
          <div className="mb-3 max-h-[30svh] overflow-y-auto rounded-lg border border-[#E6D4A3]/25 bg-[#E6D4A3]/[0.07] px-3.5 py-2.5">
            <p className="text-[12px] font-semibold text-[#E6D4A3]">
              {pendencias.length === 1 ? "Falta só 1 item para finalizar:" : `Faltam ${pendencias.length} itens para finalizar:`}
            </p>
            <ul className="mt-1.5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {pendencias.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] leading-[1.4] text-[#F1EEE7]">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#BFA76A]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex min-w-0 items-baseline justify-between gap-3 md:block">
            {valor ? (
              <>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#8498A8]">{rotuloValor}</p>
                  <p
                    className={`${classeValor ?? ""} text-2xl font-bold tracking-[-0.02em] tabular-nums text-[#C2A66A] md:text-[28px]`}
                  >
                    {valor}
                  </p>
                </div>
                {detalhe && (
                  <p className="text-right text-xs leading-5 text-[#A5B3BE] md:mt-0.5 md:text-left md:text-sm">{detalhe}</p>
                )}
              </>
            ) : (
              <p className="text-xs leading-5 text-[#B8C5CE] md:text-sm">{semValor}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 md:w-[340px]">
            <button
              type="button"
              onClick={clicarFinalizar}
              aria-disabled={!habilitado}
              className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-medium uppercase tracking-[0.06em] transition-colors duration-200 md:h-[52px] ${
                habilitado
                  ? "bg-[#E7DFD0] text-[#122D40] hover:bg-[#F0EADF]"
                  : "bg-[#2F4F69] text-[#9DB0BD] hover:bg-[#36597A]"
              }`}
            >
              {enviando ? "Enviando…" : rotuloBotao}
            </button>
            {mostrarStone && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] text-[#A9B0B2]">Pagamento seguro</span>
                <Image
                  src="/images/produtos/stone-logo-white.png"
                  alt="Stone"
                  width={102}
                  height={37}
                  className="h-4 w-auto opacity-90"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
