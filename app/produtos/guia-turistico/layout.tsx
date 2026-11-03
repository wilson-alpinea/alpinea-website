import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Guia particular no Japão, brasileiro ou local, nos dias que você escolher — veja o valor na hora e envie seu pedido pelo WhatsApp.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Guia Turístico",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Guia Turístico",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-guia-turistico.jpg", width: 1200, height: 630, alt: "Guia Turístico — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Guia Turístico",
    description: DESCRICAO,
    images: ["/images/og/og-guia-turistico.jpg"],
  },
};

export default function GuiaTuristicoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
