import type { Metadata } from "next";

// Mesmo motivo do layout de /produtos/jrpass: page.tsx é "use client"
// (estado do formulário/checkout) e por isso não pode exportar `metadata`.
// Imagem de compartilhamento = a mesma foto do topo da página (enviada
// pelo Wilson em 29/set/2026), como no JR Pass.
const DESCRICAO =
  "Seguro viagem para o Japão com Affinity, GTA ou MTA — cobertura médica e assistência 24h. Escolha a seguradora, veja o valor para o seu grupo e finalize a compra online.";

export const metadata: Metadata = {
  title: "Ajisai | Seguro Viagem",
  description: DESCRICAO,
  openGraph: {
    title: "Ajisai | Seguro Viagem",
    description: DESCRICAO,
    siteName: "Ajisai",
    images: [
      {
        url: "/images/produtos/seguro-viagem-header.jpg",
        width: 1600,
        height: 893,
        alt: "Seguro Viagem — Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Seguro Viagem",
    description: DESCRICAO,
    images: ["/images/produtos/seguro-viagem-header.jpg"],
  },
};

export default function SeguroViagemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
