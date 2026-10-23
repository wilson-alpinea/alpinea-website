"use client";

import { useRouter } from "next/navigation";
import { FornecedorForm } from "../FornecedorForm";

export function NovoFornecedor() {
  const router = useRouter();
  return <FornecedorForm onCancelar={() => router.push("/crm/fornecedores")} onSalvo={(r) => r.id && router.push(`/crm/fornecedores/${r.id}`)} />;
}
