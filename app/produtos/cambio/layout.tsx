import type { Metadata } from "next";

// Mesmo motivo dos layouts de /produtos/jrpass e /produtos/seguro-viagem:
// page.tsx é "use client" e não pode exportar `metadata`. Imagem de
// compartilhamento = a foto do topo da página (Wilson, 29/set/2026).
const DESCRICAO =
  "Compra e venda de ienes em espécie em São Paulo, Rio de Janeiro, Curitiba ou no Aeroporto de Guarulhos — cotação do dia e pagamento via Pix, direto pelo site.";

export const metadata: Metadata = {
  title: "Ajisai | Câmbio de Ienes",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/produtos/cambio-header.jpg", width: 1600, height: 893, alt: "Câmbio de ienes — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    images: ["/images/produtos/cambio-header.jpg"],
  },
};

export default function CambioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
