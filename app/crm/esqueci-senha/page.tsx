import type { Metadata } from "next";
import { EsqueciForm } from "./EsqueciForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function EsqueciSenhaPage() {
  return <EsqueciForm />;
}
