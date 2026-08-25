import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { TremGuideContent } from "../../components/TremGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de Metrô e
// Trens no Japão. O conteúdo em si vive em TremGuideContent, compartilhado
// com o card "Metrô" do painel do cliente (app/rf3vk8mp) — editar o
// conteúdo lá, não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Metrô e Trens no Japão",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaTremPage() {
  return <TremGuideContent displayClassName={display.className} internal={true} />;
}
