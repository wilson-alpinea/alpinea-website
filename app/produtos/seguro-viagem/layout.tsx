import type { Metadata } from "next";

// Mesmo motivo do layout de /produtos/jrpass: page.tsx é "use client"
// (estado do formulário/checkout) e por isso não pode exportar `metadata`.
// Imagem de compartilhamento = a mesma foto do topo da página (enviada
// pelo Wilson em 29/set/2026), como no JR Pass.
const DESCRICAO =
  "Seguro viagem para o Japão — compare 3 níveis de cobertura médica e assistência 24 h, veja o valor para o seu grupo e compre online.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | Seguro Viagem",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Seguro Viagem",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [{ url: "/images/og/og-seguro-viagem.jpg", width: 1200, height: 630, alt: "Seguro Viagem — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Seguro Viagem",
    description: DESCRICAO,
    images: ["/images/og/og-seguro-viagem.jpg"],
  },
};

export default function SeguroViagemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
