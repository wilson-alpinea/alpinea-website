import { Suspense } from "react";
import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { login } from "./actions";
import { LoginForm } from "./LoginForm";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Entrar — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function CrmLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <LoginForm action={login} displayClassName={display.className} />
    </Suspense>
  );
}
