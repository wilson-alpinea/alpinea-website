import type { Metadata } from "next";

// page.tsx é "use client" e não pode exportar `metadata` — mesmo padrão das
// outras páginas de produto.
const DESCRICAO =
  "eSIM com internet ilimitada no Japão — escolha as datas da viagem, veja o valor na hora e compre online. Emissão automática após o pagamento.";

export const metadata: Metadata = {
  title: "Ajisai | eSIM Japão",
  description: DESCRICAO,
  openGraph: { title: "Ajisai | eSIM Japão", description: DESCRICAO, siteName: "Ajisai", locale: "pt_BR", type: "website" },
  twitter: { card: "summary", title: "Ajisai | eSIM Japão", description: DESCRICAO },
};

export default function EsimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
