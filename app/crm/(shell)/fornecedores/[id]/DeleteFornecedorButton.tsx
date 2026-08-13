"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFornecedores } from "../../../actions";

export function DeleteFornecedorButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function excluir() {
    const confirmado = window.confirm("Excluir este fornecedor? Essa ação não pode ser desfeita.");
    if (!confirmado) return;

    startTransition(async () => {
      await deleteFornecedores([id]);
      router.push("/crm/fornecedores");
    });
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={pending}
      className="rounded-full border border-red-200 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Excluindo…" : "Excluir"}
    </button>
  );
}
