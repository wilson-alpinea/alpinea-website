import type { Metadata } from "next";

// Link enviado pela equipe no WhatsApp — fora do Google.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
