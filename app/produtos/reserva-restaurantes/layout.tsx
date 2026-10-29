import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Reserva de restaurantes no Japão — diga o restaurante e nós fazemos a reserva, inclusive nos que não aceitam reserva direta de estrangeiros.";

export const metadata: Metadata = {
  title: "Ajisai | Reserva de restaurantes",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Reserva de restaurantes",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/servicos-adicionais-header.jpg",
        width: 2069,
        height: 760,
        alt: "Reserva de restaurantes — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Reserva de restaurantes",
    description: DESCRICAO,
    images: ["/images/produtos/servicos-adicionais-header.jpg"],
  },
};

export default function ReservaRestaurantesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
