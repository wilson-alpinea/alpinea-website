import type { Metadata } from "next";

// Simulador avulso (link enviado pela equipe) — mesmo card de compartilhamento
// da página de produto /produtos/viagem-personalizada (Wilson, 03/nov/2026).
const DESCRICAO = "Monte uma estimativa da sua viagem ao Japão: orçamento, cidades, hotel e voo, com o valor na hora.";

export const metadata: Metadata = {
  title: "Ajisai | Simulador de Viagem Personalizada",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Simulador de Viagem Personalizada",
    description: DESCRICAO,
    siteName: "Ajisai",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og/og-viagem-personalizada.jpg", width: 1200, height: 630, alt: "Viagem Personalizada — Ajisai" }],
  },
  twitter: { card: "summary_large_image", title: "Ajisai | Simulador de Viagem Personalizada", description: DESCRICAO, images: ["/images/og/og-viagem-personalizada.jpg"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
