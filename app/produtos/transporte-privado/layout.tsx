import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Motorista particular no Japão, sem compartilhar veículo — escolha o veículo e as rotas, veja o valor na hora e envie seu pedido.";

export const metadata: Metadata = {
  title: "Ajisai | Transporte Privado",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Transporte Privado",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/transporte-privado-header.jpg",
        width: 1600,
        height: 900,
        alt: "Transporte Privado — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Transporte Privado",
    description: DESCRICAO,
    images: ["/images/produtos/transporte-privado-header.jpg"],
  },
};

export default function TransportePrivadoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
