import { Inter } from "next/font/google";

// Tipografia do CRM (Wilson, 22/out/2026): Inter em toda a interface, com
// os pesos 400/500/600 e o subset latin-ext para os acentos do português.
// O logotipo continua sendo a imagem original.
export const interCrm = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-crm",
  display: "swap",
});
