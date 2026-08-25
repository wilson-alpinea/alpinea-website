import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { PalavrasGuideContent } from "../../components/PalavrasGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de Palavras e
// Expressões Úteis. O conteúdo em si vive em PalavrasGuideContent,
// compartilhado com o card "Palavras Comuns" do painel do cliente
// (app/rf3vk8mp) — editar o conteúdo lá, não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Palavras e Expressões Úteis",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaPalavrasPage() {
  return <PalavrasGuideContent displayClassName={display.className} internal={true} />;
}
