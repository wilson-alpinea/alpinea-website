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
