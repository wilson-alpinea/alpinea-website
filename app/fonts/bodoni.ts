import localFont from "next/font/local";

// Bodoni Moda servida do próprio site (Wilson, 03/nov/2026). Antes vinha de
// next/font/google, mas o build da Vercel passou a falhar ao baixar a fonte
// do Google ("next/font/google queries have exactly one entry" — o Google
// mudou o formato do link do arquivo e o Turbopack não aceita). Arquivos do
// pacote @fontsource/bodoni-moda 5.3.0 (licença SIL OFL 1.1), subset latin.
// Mesmo uso de antes: `display.className` / `display.style`.

export const bodoniModa = localFont({
  src: [
    { path: "./bodoni-moda-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./bodoni-moda-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./bodoni-moda-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Com itálico — para as páginas que usavam style: ["normal", "italic"]. */
export const bodoniModaItalico = localFont({
  src: [
    { path: "./bodoni-moda-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./bodoni-moda-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./bodoni-moda-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./bodoni-moda-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./bodoni-moda-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./bodoni-moda-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
