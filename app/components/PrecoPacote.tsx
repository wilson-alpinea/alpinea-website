"use client";

import { useCambioUSD, brlParaUSDLabel, formatUSD, formatBRL } from "../hooks/useCambioUSD";
import { CambioLabel } from "./CambioLabel";
import type { PackageVariant } from "./packageTypes";

// Bloco de preço padrão de um pacote — usado tanto no card quanto no modal
// de detalhe, pra manter os dois em dólar/cotação consistentes. Se a
// variante não trouxer precoBRL (valor bruto em reais), cai pro texto
// pronto em precoLabel/parcelaLabel como fallback.
export function PrecoPacote({
  variante,
  precoClassName,
}: {
  variante: PackageVariant;
  precoClassName: string;
}) {
  const cambio = useCambioUSD();

  if (variante.precoUSD != null) {
    const parcela = formatUSD(variante.precoUSD / 12);
    return (
      <>
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-amber-300">
          Datas aproximadas — sujeitas a alteração
        </p>
        <p className={precoClassName} style={{ color: "#6ec3d9" }}>
          {formatUSD(variante.precoUSD)}
        </p>
        {cambio && (
          <p className="mt-1 text-sm font-medium text-white/60">
            ou {formatBRL(variante.precoUSD * cambio.cotacao)}
          </p>
        )}
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
          Por pessoa · Quarto Individual
        </p>
        <p className="mt-2 text-base font-semibold" style={{ color: "#e0916a" }}>
          ou em até 12x de {parcela} + Juros Mensais
        </p>
        {variante.personalizadoUSD != null && (
          <p className="mt-2 rounded-lg border border-[#e0916a]/30 bg-[#e0916a]/10 px-3 py-2 text-xs leading-5 text-[#e0916a]">
            Versão Personalizada deste roteiro: {formatUSD(variante.personalizadoUSD)}
          </p>
        )}
        {cambio && <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />}
      </>
    );
  }

  if (variante.precoBRL == null) {
    return (
      <>
        <p className={precoClassName}>{variante.precoLabel}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
          Por pessoa · Quarto Individual
        </p>
        {variante.parcelaLabel && (
          <p className="mt-1 text-sm font-medium text-white/70">{variante.parcelaLabel}</p>
        )}
      </>
    );
  }

  const parcela = cambio ? formatUSD(variante.precoBRL / 12 / cambio.cotacao) : "…";

  return (
    <>
      <p className={precoClassName}>{brlParaUSDLabel(variante.precoBRL, cambio)}</p>
      <p className="mt-1 text-sm font-medium text-white/60">
        ou {formatBRL(variante.precoBRL)}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
        Por pessoa · Quarto Individual
      </p>
      <p className="mt-1 text-sm font-medium text-white/70">
        ou em até 12x de {parcela} + Juros Mensais
      </p>
      <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-white/40" />
    </>
  );
}
