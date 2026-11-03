import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão de /produtos.
const TITULO = "Ajisai | Documentação para o Japão";
const DESCRICAO = "Visto específico, Certificado de Elegibilidade e exportação de pet para o Japão, com a equipe da Ajisai cuidando de cada etapa.";

// Card de compartilhamento 1200×630 (WhatsApp etc.) — public/images/og/ (Wilson, 03/nov/2026).
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website", images: [{ url: "/images/og/og-documentacao.jpg", width: 1200, height: 630, alt: "Documentação para o Japão — Ajisai" }] },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: ["/images/og/og-documentacao.jpg"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
