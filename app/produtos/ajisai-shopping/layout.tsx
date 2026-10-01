import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Compras no Japão com acompanhamento da Ajisai — relógios, câmeras, moda, facas e mais, com tradução, negociação e apoio com tax free.";

export const metadata: Metadata = {
  title: "Ajisai | Ajisai Shopping",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Ajisai Shopping",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/ajisai-shopping-header.jpg",
        width: 2069,
        height: 760,
        alt: "Ajisai Shopping — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Ajisai Shopping",
    description: DESCRICAO,
    images: ["/images/produtos/ajisai-shopping-header.jpg"],
  },
};

export default function AjisaiShoppingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
