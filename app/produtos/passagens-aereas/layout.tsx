import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Passagens aéreas Brasil ↔ Japão com suporte da Ajisai do check-in ao desembarque — escolha trechos, datas e cabine e receba a cotação pelo WhatsApp.";

export const metadata: Metadata = {
  title: "Ajisai | Passagens Aéreas",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Passagens Aéreas",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/passagens-aereas-header.jpg",
        width: 1916,
        height: 821,
        alt: "Passagens Aéreas — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Passagens Aéreas",
    description: DESCRICAO,
    images: ["/images/produtos/passagens-aereas-header.jpg"],
  },
};

export default function PassagensAereasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
