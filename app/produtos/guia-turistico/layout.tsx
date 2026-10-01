import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Guia particular no Japão, brasileiro ou local, nos dias que você escolher — veja o valor na hora e envie seu pedido pelo WhatsApp.";

export const metadata: Metadata = {
  title: "Ajisai | Guia Turístico",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Guia Turístico",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/guia-turistico-header.jpg",
        width: 1672,
        height: 941,
        alt: "Guia Turístico — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Guia Turístico",
    description: DESCRICAO,
    images: ["/images/produtos/guia-turistico-header.jpg"],
  },
};

export default function GuiaTuristicoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
