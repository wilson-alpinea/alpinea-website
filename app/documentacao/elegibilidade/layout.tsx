import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão de /produtos.
const TITULO = "Ajisai | Certificado de Elegibilidade (COE)";
const DESCRICAO = "Certificado de Elegibilidade para o visto específico: valor final por pessoa ou família, prazos e cadastro online.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website", images: [{ url: "/images/og/og-elegibilidade.jpg", width: 1200, height: 630, alt: "Certificado de Elegibilidade — Ajisai" }] },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: ["/images/og/og-elegibilidade.jpg"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
