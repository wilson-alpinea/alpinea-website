import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { ShinkansenGuideContent } from "../../components/ShinkansenGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de Shinkansen
// com JR Pass. O conteúdo em si vive em ShinkansenGuideContent,
// compartilhado com o card "Trem Bala (Shinkansen)" do painel do cliente
// (app/rf3vk8mp) — editar o conteúdo lá, não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Shinkansen com JR Pass",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaShinkansenPage() {
  return <ShinkansenGuideContent displayClassName={display.className} internal={true} />;
}
