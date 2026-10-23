import type { Metadata } from "next";
import { RedefinirForm } from "./RedefinirForm";

export const metadata: Metadata = {
  title: "Nova senha — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RedefinirSenhaPage() {
  return <RedefinirForm />;
}
