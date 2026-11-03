import type { Metadata } from "next";

// Mesmo motivo dos layouts de /produtos/jrpass e /produtos/seguro-viagem:
// page.tsx é "use client" e não pode exportar `metadata`. Imagem de
// compartilhamento = a foto do topo da página (Wilson, 29/set/2026).
const DESCRICAO =
  "Compra e venda de ienes em espécie em São Paulo, Rio de Janeiro, Curitiba ou no Aeroporto de Guarulhos — cotação do dia e pagamento via Pix, direto pelo site.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Câmbio de Ienes",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-cambio.jpg", width: 1200, height: 630, alt: "Câmbio de Ienes — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    images: ["/images/og/og-cambio.jpg"],
  },
};

export default function CambioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
