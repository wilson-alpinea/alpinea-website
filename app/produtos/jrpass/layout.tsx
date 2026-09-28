import type { Metadata } from "next";

// Mesmo motivo do layout de /produtos: app/produtos/jrpass/page.tsx é
// "use client" (tem estado — seleção de passe, formulário, checkout) e
// por isso não pode exportar `metadata` diretamente.
export const metadata: Metadata = {
  title: "Ajisai | JR Pass",
  description:
    "Japan Rail Pass — deslocamentos ilimitados de trem-bala em todo o Japão. Compare Comum (Ordinary) e Green Car, veja preços por 7, 14 ou 21 dias e finalize sua compra.",
  openGraph: {
    title: "Ajisai | JR Pass",
    description:
      "Japan Rail Pass — deslocamentos ilimitados de trem-bala em todo o Japão. Compare Comum (Ordinary) e Green Car, veja preços por 7, 14 ou 21 dias e finalize sua compra.",
    siteName: "Ajisai",
    locale: "pt_BR",
    type: "website",
  },
};

export default function JrPassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
