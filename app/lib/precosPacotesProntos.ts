// Preços fixos (US$, valor final) dos pacotes prontos de /pacotes — Caravana
// e Individual/Privativo. Movidos de app/pacotes/page.tsx em 04/nov/2026
// para serem editáveis no CRM (/crm/precos). O "a partir de" dos cards em
// /produtos sai daqui também (antes era 4280/2490 fixo no código).
import { P } from "./parametrosPreco";

export const PRECOS_PACOTES_USD = {
  caravanaCerejeiras: { d7: P("pacotes.caravanaCerejeiras.7d", 4550), d14: P("pacotes.caravanaCerejeiras.14d", 8280) },
  caravanaMaio: { d7: P("pacotes.caravanaMaio.7d", 4280), d14: P("pacotes.caravanaMaio.14d", 7980) },
  individualCerejeiras: { d7: P("pacotes.individualCerejeiras.7d", 2790), d14: P("pacotes.individualCerejeiras.14d", 4980) },
  individualMaio: { d7: P("pacotes.individualMaio.7d", 2490), d14: P("pacotes.individualMaio.14d", 4480) },
};

export const PRECO_DESDE_CARAVANA_USD = Math.min(
  PRECOS_PACOTES_USD.caravanaCerejeiras.d7,
  PRECOS_PACOTES_USD.caravanaCerejeiras.d14,
  PRECOS_PACOTES_USD.caravanaMaio.d7,
  PRECOS_PACOTES_USD.caravanaMaio.d14,
);
export const PRECO_DESDE_INDIVIDUAL_USD = Math.min(
  PRECOS_PACOTES_USD.individualCerejeiras.d7,
  PRECOS_PACOTES_USD.individualCerejeiras.d14,
  PRECOS_PACOTES_USD.individualMaio.d7,
  PRECOS_PACOTES_USD.individualMaio.d14,
);
