import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Motorista particular no Japão, sem compartilhar veículo — escolha o veículo e as rotas, veja o valor na hora e envie seu pedido.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Transporte Privado",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Transporte Privado",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-transporte-privado.jpg", width: 1200, height: 630, alt: "Transporte Privado — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Transporte Privado",
    description: DESCRICAO,
    images: ["/images/og/og-transporte-privado.jpg"],
  },
};

export default function TransportePrivadoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
