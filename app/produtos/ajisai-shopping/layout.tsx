import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Compras no Japão com acompanhamento da Ajisai — relógios, câmeras, moda, facas e mais, com tradução, negociação e apoio com tax free.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Ajisai Shopping",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Ajisai Shopping",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-ajisai-shopping.jpg", width: 1200, height: 630, alt: "Ajisai Shopping — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Ajisai Shopping",
    description: DESCRICAO,
    images: ["/images/og/og-ajisai-shopping.jpg"],
  },
};

export default function AjisaiShoppingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
