import localFont from "next/font/local";

// Inter servida do próprio site (Wilson, 04/nov/2026) — mesmo motivo da
// Bodoni Moda (bodoni.ts): o build da Vercel falhava ao baixar a fonte via
// next/font/google ("next/font/google queries have exactly one entry").
// Arquivos do pacote @fontsource/inter 5.2.5 (licença SIL OFL 1.1), subset latin.
export const inter = localFont({
  src: [
    { path: "./inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
