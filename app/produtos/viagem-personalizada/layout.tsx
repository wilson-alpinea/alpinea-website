import type { Metadata } from "next";

const DESCRICAO =
  "Monte sua viagem ao Japão do zero: orçamento, cidades, hotel e voo, com o valor estimado na hora. A equipe Ajisai organiza o resto.";

export const metadata: Metadata = {
  title: "Ajisai | Viagem Personalizada",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Viagem Personalizada",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/personalizado-hero.webp", width: 1536, height: 1024, alt: "Viagem Personalizada — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Ajisai | Viagem Personalizada", description: DESCRICAO, images: ["/images/personalizado-hero.webp"] },
};

export default function ViagemPersonalizadaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
