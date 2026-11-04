import type { Metadata } from "next";

// Página interna/privada — nunca indexada por buscadores nem por IA (ver
// lib/privacidade.ts; o proxy.ts também manda X-Robots-Tag e bloqueia robôs).
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
