import type { Metadata } from "next";

// Mesmo motivo do layout de /produtos/jrpass: page.tsx é "use client"
// (estado do formulário/checkout) e por isso não pode exportar `metadata`.
// Imagem de compartilhamento provisória (ícone do seguro) até o Wilson
// enviar a arte definitiva do topo da página.
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
        url: "/images/icone-seguro-viagem-v2.png",
        width: 1288,
        height: 1157,
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
    images: ["/images/icone-seguro-viagem-v2.png"],
  },
};

export default function SeguroViagemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
