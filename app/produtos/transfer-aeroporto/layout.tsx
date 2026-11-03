import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto. Imagem de compartilhamento = foto do topo.
const DESCRICAO =
  "Transfer privativo entre aeroporto e hotel no Japão — escolha ida e volta, só chegada ou só volta, veja o valor na hora e envie seu pedido.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Transfer Aeroporto",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Transfer Aeroporto",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-transfer-aeroporto.jpg", width: 1200, height: 630, alt: "Transfer Aeroporto — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Transfer Aeroporto",
    description: DESCRICAO,
    images: ["/images/og/og-transfer-aeroporto.jpg"],
  },
};

export default function TransferAeroportoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
