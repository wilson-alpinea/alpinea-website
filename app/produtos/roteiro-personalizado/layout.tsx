import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto.
const DESCRICAO =
  "Painel digital com cada dia da sua viagem ao Japão planejado para o seu perfil. Veja o valor na hora e envie seu pedido.";

export const metadata: Metadata = {
  title: "Ajisai | Roteiro Personalizado",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Roteiro Personalizado",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og-ajisai-roteiro.png", width: 1200, height: 630, alt: "Roteiro Personalizado — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Ajisai | Roteiro Personalizado", description: DESCRICAO, images: ["/images/og-ajisai-roteiro.png"] },
};

export default function RoteiroPersonalizadoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
