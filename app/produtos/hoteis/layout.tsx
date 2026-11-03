import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Hotéis no Japão escolhidos pelo seu roteiro — monte as estadias cidade por cidade, veja uma estimativa na hora e receba as opções pelo WhatsApp.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Hotéis",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Hotéis",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-hoteis.jpg", width: 1200, height: 630, alt: "Hotéis — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Hotéis",
    description: DESCRICAO,
    images: ["/images/og/og-hoteis.jpg"],
  },
};

export default function HoteisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
