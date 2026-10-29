import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão de /produtos.
const TITULO = "Ajisai | Documentação para o Japão";
const DESCRICAO = "Visto específico, Certificado de Elegibilidade e exportação de pet para o Japão, com a equipe da Ajisai cuidando de cada etapa.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website", images: [{ url: "/images/documentacao-hero.webp", width: 1902, height: 827, alt: "Atendimento de documentação Ajisai" }] },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: ["/images/documentacao-hero.webp"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
