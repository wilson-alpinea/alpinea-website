import type { Metadata } from "next";

// app/produtos/page.tsx é "use client" (tem estado — calculadora, recomendador
// de produto, tabela comparativa) e por isso não pode exportar `metadata`
// diretamente. Este layout (Server Component) existe só para isso: dar à
// página seu próprio título/descrição/OG, em vez de herdar o padrão do
// layout raiz (marca Alpinea, voltado à home).
export const metadata: Metadata = {
  title: "Ajisai | Produtos e Preços",
  description:
    "Compare os produtos Ajisai para sua viagem ao Japão — Roteiro Personalizado, Caravana, Individual ou Pequenos Grupos e Pacote Personalizado — e veja o preço de cada um.",
  openGraph: {
    title: "Ajisai | Produtos e Preços",
    description:
      "Compare os produtos Ajisai para sua viagem ao Japão e veja o preço de cada um: Roteiro Personalizado, Caravana, Individual ou Pequenos Grupos e Pacote Personalizado.",
    siteName: "Ajisai",
    images: [
      {
        url: "/images/dashmobile-ajisai.jpg",
        width: 1200,
        height: 630,
        alt: "Painel do Roteiro Personalizado Ajisai",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Produtos e Preços",
    description:
      "Compare os produtos Ajisai para sua viagem ao Japão e veja o preço de cada um.",
    images: ["/images/dashmobile-ajisai.jpg"],
  },
};

export default function ProdutosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
