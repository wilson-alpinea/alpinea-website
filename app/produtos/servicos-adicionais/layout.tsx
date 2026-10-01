import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "eSIM, transporte de malas, restaurantes, experiências sob medida e concierge no Japão — escolha os serviços, veja o valor na hora e envie seu pedido.";

export const metadata: Metadata = {
  title: "Ajisai | Serviços Adicionais",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Serviços Adicionais",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/servicos-adicionais-header.jpg",
        width: 2069,
        height: 760,
        alt: "Serviços Adicionais — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Serviços Adicionais",
    description: DESCRICAO,
    images: ["/images/produtos/servicos-adicionais-header.jpg"],
  },
};

export default function ServicosAdicionaisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
