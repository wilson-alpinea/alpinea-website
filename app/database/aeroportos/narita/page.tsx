import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { NaritaGuideContent } from "../../../components/NaritaGuideContent";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Aeroporto de Narita (NRT)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// Conteúdo real do guia mora em app/components/NaritaGuideContent.tsx —
// compartilhado com o painel do cliente (app/rf3vk8mp), que não tem acesso
// a esta página interna. Editar o conteúdo lá atualiza os dois lugares.
export default function NaritaGuidePage() {
  return <NaritaGuideContent displayClassName={display.className} />;
}
