import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { CambioGuideContent } from "../../components/CambioGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de Câmbio.
// O conteúdo em si vive em CambioGuideContent, compartilhado com o card
// "Câmbio" do painel do cliente (app/rf3vk8mp) — editar o conteúdo lá,
// não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Câmbio",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaCambioPage() {
  return <CambioGuideContent displayClassName={display.className} internal={true} />;
}
