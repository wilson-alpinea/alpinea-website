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
  theme = "dark",
  compact = false,
  hideSecundario = false,
}: {
  variante: PackageVariant;
  precoClassName: string;
  /** "dark" (padrão) — usado no modal de detalhe, fundo escuro. "light" —
   * usado no card da grade, fundo branco/off-white; troca as cores de texto
   * secundário e do preço em destaque pra manter contraste legível. */
  theme?: "dark" | "light";
  /** Remove parcelamento, badges e avisos repetidos na visualização resumida. */
  compact?: boolean;
  /** Esconde a linha secundária de conversão (aprox. R$...) — usada nos
   * cards de temporada em /pacotes, onde a segunda moeda não ajuda a
   * decisão entre pacotes e só ocupa espaço vertical. */
  hideSecundario?: boolean;
}) {
  const cambio = useCambioUSD();
  const isLight = theme === "light";
  const corTextoSecundario = isLight ? "text-[#0A2540]/60" : "text-white/60";
  const corTextoTerciario = isLight ? "text-[#0A2540]/45" : "text-white/40";
  const corTextoParcela = isLight ? "text-[#0A2540]/70" : "text-white/70";
  const corPrecoDestaque = isLight ? "#1f6f9c" : "#6ec3d9";
  const corParcelaDestaque = isLight ? "#c96a3c" : "#e0916a";
  const corBadgeDatas = isLight ? "text-emerald-700" : "text-emerald-300";

  if (variante.precoUSD != null) {
    const parcela = formatUSD(variante.precoUSD / 12);
    return (
      <>
        {!compact && (
          <p
            className={`mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${corBadgeDatas}`}
          >
            Datas aproximadas — sujeitas a alteração
          </p>
        )}
        <p className={precoClassName} style={{ color: corPrecoDestaque }}>
          {formatUSD(variante.precoUSD)}
        </p>
        {!hideSecundario && cambio && (
          <p className={`mt-1 text-sm font-medium ${corTextoSecundario}`}>
            {compact ? "aprox. " : "ou "}
            {formatBRL(variante.precoUSD * cambio.cotacao)}
          </p>
        )}
        <p className={`mt-1 text-xs uppercase tracking-[0.15em] ${corTextoTerciario}`}>
          Por pessoa · Quarto Individual
        </p>
        {!compact && (
          <p className="mt-2 text-base font-semibold" style={{ color: corParcelaDestaque }}>
            ou em até 12x de {parcela} + Juros Mensais
          </p>
        )}
        {!compact && variante.personalizadoUSD != null && (
          <p
            className="mt-2 rounded-lg border px-3 py-2 text-xs leading-5"
            style={{
              borderColor: `${corParcelaDestaque}4D`,
              backgroundColor: `${corParcelaDestaque}1A`,
              color: corParcelaDestaque,
            }}
          >
            Versão Personalizada deste roteiro: {formatUSD(variante.personalizadoUSD)}
          </p>
        )}
        {!compact && cambio && (
          <CambioLabel cambio={cambio} className={`mt-1 text-[11px] ${corTextoTerciario}`} />
        )}
      </>
    );
  }

  if (variante.precoBRL == null) {
    return (
      <>
        <p className={precoClassName}>{variante.precoLabel}</p>
        <p className={`mt-1 text-xs uppercase tracking-[0.15em] ${corTextoTerciario}`}>
          Por pessoa · Quarto Individual
        </p>
        {!compact && variante.parcelaLabel && (
          <p className={`mt-1 text-sm font-medium ${corTextoParcela}`}>{variante.parcelaLabel}</p>
        )}
      </>
    );
  }

  const parcela = cambio ? formatUSD(variante.precoBRL / 12 / cambio.cotacao) : "…";

  return (
    <>
      <p className={precoClassName}>{brlParaUSDLabel(variante.precoBRL, cambio)}</p>
      {!hideSecundario && (
        <p className={`mt-1 text-sm font-medium ${corTextoSecundario}`}>
          {compact ? "aprox. " : "ou "}
          {formatBRL(variante.precoBRL)}
        </p>
      )}
      <p className={`mt-1 text-xs uppercase tracking-[0.15em] ${corTextoTerciario}`}>
        Por pessoa · Quarto Individual
      </p>
      {!compact && (
        <p className={`mt-1 text-sm font-medium ${corTextoParcela}`}>
          ou em até 12x de {parcela} + Juros Mensais
        </p>
      )}
      {!compact && (
        <CambioLabel cambio={cambio} className={`mt-1 text-[11px] ${corTextoTerciario}`} />
      )}
    </>
  );
}
