import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alpinea.io"),

  title: "Alpinea — Viagens Privadas e Concierge no Japão",
  description:
    "Restaurantes quase impossíveis de reservar, especialistas em compras raramente acessíveis ao público e experiências para quem deseja viver o máximo do Japão.",

  keywords: [
    "Japão de luxo",
    "Viagem de luxo Japão",
    "Concierge Japão",
    "Omakase Japão",
    "Ryokan Japão",
    "Turismo premium Japão",
    "Luxury travel Japan",
    "Private Japan travel",
    "Tokyo luxury concierge",
    "Japan bespoke travel",
    "Restaurante Japão",
    "Estrela Michelin Japão",
    "Turismo de luxo Japão",
    "Roteiro de luxo Japão",
  ],

  alternates: {
    canonical: "https://www.alpinea.io",
    languages: {
      "pt-BR": "https://www.alpinea.io",
      en: "https://www.alpinea.io/en",
    },
  },

  openGraph: {
    title: "Alpinea",
    description: "Viagens Privadas e Concierge no Japão",
    url: "https://www.alpinea.io",
    siteName: "Alpinea",
    images: [
      {
        url: "/images/og-logo.png", // Apontando para o seu logo novo na pasta public/images/
        width: 1200,
        height: 630,
        alt: "Alpinea — Viagens Privadas e Concierge no Japão",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Alpinea — Viagens Privadas e Concierge no Japão",
    description: "Viagens Privadas e Concierge no Japão",
    images: ["/images/og-logo.png"],
  },

  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics gaId="G-GHTZEC0JPS" />
      </body>
    </html>
  );
}