import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão de /produtos.
const TITULO = "Ajisai | Visto específico para o Japão";
const DESCRICAO = "Visto específico para nisseis, sanseis, cônjuges e dependentes: preço final por consulado, prazos e cadastro online.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website", images: [{ url: "/images/documentacao-hero.webp", width: 1902, height: 827, alt: "Atendimento de documentação Ajisai" }] },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: ["/images/documentacao-hero.webp"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
