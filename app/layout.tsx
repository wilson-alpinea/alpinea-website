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
  title: "Alpinea — Japão sob medida",
  description:
    "Experiências privadas, alta gastronomia, concierge e curadoria de luxo no Japão.",

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

  openGraph: {
    title: "Alpinea — Japão sob medida",
    description:
      "Experiências privadas, gastronomia de excelência e curadoria exclusiva no Japão.",
    url: "https://www.alpinea.io",
    siteName: "Alpinea",
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Alpinea — Japão sob medida",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Alpinea — Japão sob medida",
    description: "Experiências privadas e curadoria de luxo no Japão.",
    images: ["/images/og-cover.jpg"],
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}