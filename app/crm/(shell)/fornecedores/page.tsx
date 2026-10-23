import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Fornecedor } from "@/lib/crm/types";
import { ListaFornecedores } from "./ListaFornecedores";

export const metadata: Metadata = {
  title: "Fornecedores — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

// Fornecedores (redesenho 23/out/2026): o servidor entrega a base inteira;
// busca, filtros, ordenação e paginação acontecem na tela e ficam na URL.
export default async function FornecedoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fornecedores").select("*").order("nome");
  if (error) console.error("Erro ao carregar fornecedores:", error);
  return (
    <Suspense fallback={null}>
      <ListaFornecedores fornecedores={(data ?? []) as Fornecedor[]} erro={!!error} />
    </Suspense>
  );
}
