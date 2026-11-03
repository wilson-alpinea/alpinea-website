import type { Metadata } from "next";

// Mesmo motivo do layout de /produtos: app/produtos/jrpass/page.tsx é
// "use client" (tem estado — seleção de passe, formulário, checkout) e
// por isso não pode exportar `metadata` diretamente.
// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: "Ajisai | JR Pass",
  description:
    "Japan Rail Pass — deslocamentos ilimitados de trem-bala em todo o Japão. Compare Comum (Ordinary) e Green Car, veja preços por 7, 14 ou 21 dias e finalize sua compra.",
  openGraph: {
    title: "Ajisai | JR Pass",
    description:
      "Japan Rail Pass — deslocamentos ilimitados de trem-bala em todo o Japão. Compare Comum (Ordinary) e Green Car, veja preços por 7, 14 ou 21 dias e finalize sua compra.",
    siteName: "Ajisai",
    // Sem isso, o link herdava o og:image genérico de app/produtos/layout.tsx
    // (dashmobile-ajisai.jpg, o print do dashboard) no preview do WhatsApp —
    // pedido do Wilson, 29/set/2026: usar a mesma foto do passe físico que
    // já aparece no topo da página.
    images: [{ url: "/images/og/og-jrpass.jpg", width: 1200, height: 630, alt: "JR Pass — Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | JR Pass",
    description:
      "Japan Rail Pass — deslocamentos ilimitados de trem-bala em todo o Japão. Compare Comum (Ordinary) e Green Car, veja preços por 7, 14 ou 21 dias e finalize sua compra.",
    images: ["/images/og/og-jrpass.jpg"],
  },
};

export default function JrPassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
