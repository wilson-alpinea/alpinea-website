import type { Metadata } from "next";

// Mesmo motivo dos layouts de /produtos/jrpass e /produtos/seguro-viagem:
// page.tsx é "use client" e não pode exportar `metadata`. Imagem de
// compartilhamento provisória (ícone do câmbio) até o Wilson enviar a arte
// definitiva do topo.
const DESCRICAO =
  "Compra e venda de ienes em espécie em São Paulo, Rio de Janeiro, Curitiba ou no Aeroporto de Guarulhos — cotação do dia e pagamento via Pix, direto pelo site.";

export const metadata: Metadata = {
  title: "Ajisai | Câmbio de Ienes",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/icone-cambio-dinheiro.png", width: 258, height: 320, alt: "Câmbio de ienes — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ajisai | Câmbio de Ienes",
    description: DESCRICAO,
    images: ["/images/icone-cambio-dinheiro.png"],
  },
};

export default function CambioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
