import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão de /produtos.
const TITULO = "Ajisai | Exportação de pet para o Japão";
const DESCRICAO = "Documentação completa para levar seu cão ou gato do Brasil ao Japão: microchip, vacinas, sorologia, Import Permit e CVI.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website", images: [{ url: "/images/og/og-pet.jpg", width: 1200, height: 630, alt: "Exportação de Pet — Ajisai" }] },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: ["/images/og/og-pet.jpg"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
