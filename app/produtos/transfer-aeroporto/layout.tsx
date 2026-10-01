import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Transfer privativo entre aeroporto e hotel no Japão — escolha ida e volta, só chegada ou só volta, veja o valor na hora e envie seu pedido.";

export const metadata: Metadata = {
  title: "Ajisai | Transfer Aeroporto",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Transfer Aeroporto",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/transfer-aeroporto-header.jpg",
        width: 1916,
        height: 821,
        alt: "Transfer Aeroporto — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Transfer Aeroporto",
    description: DESCRICAO,
    images: ["/images/produtos/transfer-aeroporto-header.jpg"],
  },
};

export default function TransferAeroportoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
