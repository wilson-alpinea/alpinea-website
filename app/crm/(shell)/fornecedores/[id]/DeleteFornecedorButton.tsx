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
      className="rounded-xl border border-[#B42318]/30 bg-white px-4 py-2 text-sm font-medium text-[#B42318] transition hover:bg-[#FDEDEC] disabled:opacity-50"
    >
      {pending ? "Excluindo…" : "Excluir"}
    </button>
  );
}
