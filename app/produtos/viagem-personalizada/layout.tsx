import type { Metadata } from "next";

const DESCRICAO =
  "Monte sua viagem ao Japão do zero: orçamento, cidades, hotel e voo, com o valor estimado na hora. A equipe Ajisai organiza o resto.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Viagem Personalizada",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Viagem Personalizada",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-viagem-personalizada.jpg", width: 1200, height: 630, alt: "Viagem Personalizada — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Ajisai | Viagem Personalizada", description: DESCRICAO, images: ["/images/og/og-viagem-personalizada.jpg"] },
};

export default function ViagemPersonalizadaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
