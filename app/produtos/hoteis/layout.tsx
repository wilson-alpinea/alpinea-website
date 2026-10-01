import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Hotéis no Japão escolhidos pelo seu roteiro — monte as estadias cidade por cidade, veja uma estimativa na hora e receba as opções pelo WhatsApp.";

export const metadata: Metadata = {
  title: "Ajisai | Hotéis",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Hotéis",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/hoteis-header.jpg",
        width: 2070,
        height: 760,
        alt: "Hotéis — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Hotéis",
    description: DESCRICAO,
    images: ["/images/produtos/hoteis-header.jpg"],
  },
};

export default function HoteisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
