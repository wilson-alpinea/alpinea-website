import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { OnibusGuideContent } from "../../components/OnibusGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página interna (banco de conteúdo, uso da equipe) do guia de Ônibus em
// Kyoto. O conteúdo em si vive em OnibusGuideContent, compartilhado com o
// card "Ônibus" do painel do cliente (app/rf3vk8mp) — editar o conteúdo lá,
// não aqui.
export const metadata: Metadata = {
  title: "Banco de Conteúdo · Ônibus em Kyoto",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaOnibusPage() {
  return <OnibusGuideContent displayClassName={display.className} internal={true} />;
}
