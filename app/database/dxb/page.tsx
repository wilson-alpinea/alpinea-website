import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { DXBGuideContent } from "../../components/DXBGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de conexão em
// Dubai (DXB). O conteúdo em si vive em DXBGuideContent, compartilhado com o
// card "Aeroporto DXB" do painel do cliente (app/rf3vk8mp) — editar o
// conteúdo lá, não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Conexão em Dubai (DXB)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaDXBPage() {
  return <DXBGuideContent displayClassName={display.className} internal={true} />;
}
