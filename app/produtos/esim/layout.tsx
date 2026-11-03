import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto.
const DESCRICAO =
  "eSIM com internet ilimitada no Japão — escolha as datas da viagem, veja o valor na hora e compre online. Emissão automática após o pagamento.";

export const metadata: Metadata = {
  title: "Ajisai | eSIM Japão",
  description: DESCRICAO,
  // Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
  openGraph: {
    title: "Ajisai | eSIM Japão",
    description: DESCRICAO,
    siteName: "Ajisai",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og/og-esim.jpg", width: 1200, height: 630, alt: "eSIM Japão — Ajisai" }],
  },
  twitter: { card: "summary_large_image", title: "Ajisai | eSIM Japão", description: DESCRICAO, images: ["/images/og/og-esim.jpg"] },
};

export default function EsimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
