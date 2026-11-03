import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Passagens aéreas Brasil ↔ Japão com suporte da Ajisai do check-in ao desembarque — escolha trechos, datas e cabine e receba a cotação pelo WhatsApp.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Passagens Aéreas",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Passagens Aéreas",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-passagens-aereas.jpg", width: 1200, height: 630, alt: "Passagens Aéreas — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Passagens Aéreas",
    description: DESCRICAO,
    images: ["/images/og/og-passagens-aereas.jpg"],
  },
};

export default function PassagensAereasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
