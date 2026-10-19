import type { Metadata } from "next";

// Prévia dos links de /empregos no WhatsApp/redes (Open Graph) — Wilson,
// 19/out/2026: "tem que mostrar o logo da Ajisai e informações gerais sobre
// a página de empregos". Sem isso as páginas herdavam o cartão da Alpinea.
export const IMAGEM_OG_EMPREGOS = {
  url: "/images/og-empregos.jpg",
  width: 1200,
  height: 630,
  alt: "Ajisai — Empregos no Japão",
};

export const TITULO_EMPREGOS = "Ajisai Empregos — Trabalhe no Japão";
export const DESCRICAO_EMPREGOS =
  "Vagas em fábricas no Japão. Veja salários, turnos e benefícios de cada vaga e candidate-se online.";

/** Open Graph + Twitter com a marca Ajisai. `imagem` troca a foto (landing com arte própria). */
export function metaEmpregos(opts: { titulo: string; descricao: string; url: string; imagem?: string }): Metadata {
  const imagens = opts.imagem ? [opts.imagem, IMAGEM_OG_EMPREGOS] : [IMAGEM_OG_EMPREGOS];
  return {
    title: opts.titulo,
    description: opts.descricao,
    alternates: { canonical: opts.url },
    openGraph: {
      title: opts.titulo,
      description: opts.descricao,
      url: opts.url,
      siteName: "Ajisai Empregos",
      locale: "pt_BR",
      type: "website",
      images: imagens,
    },
    twitter: { card: "summary_large_image", title: opts.titulo, description: opts.descricao, images: [opts.imagem ?? IMAGEM_OG_EMPREGOS.url] },
  };
}
