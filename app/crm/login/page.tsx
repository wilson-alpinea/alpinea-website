import { Suspense } from "react";
import type { Metadata } from "next";
import { login } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function CrmLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#FAF9F6]" />}>
      <LoginForm action={login} />
    </Suspense>
  );
}
