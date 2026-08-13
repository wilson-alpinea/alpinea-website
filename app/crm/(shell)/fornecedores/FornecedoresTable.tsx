"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CATEGORIA_FORNECEDOR_LABEL, type CategoriaFornecedor } from "@/lib/crm/fornecedores";
import { deleteFornecedores } from "../../actions";

type LinhaFornecedor = {
  id: string;
  nome: string;
  categoria: string | null;
  cidade: string | null;
  telefone: string | null;
  email: string | null;
  created_at: string;
};

export function FornecedoresTable({ fornecedores }: { fornecedores: LinhaFornecedor[] }) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const todosSelecionados = fornecedores.length > 0 && selecionados.size === fornecedores.length;

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(fornecedores.map((f) => f.id)));
  }

  function alternarUm(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function excluirSelecionados() {
    if (selecionados.size === 0) return;
    const confirmado = window.confirm(
      `Excluir ${selecionados.size} ${selecionados.size === 1 ? "fornecedor" : "fornecedores"}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    startTransition(async () => {
      await deleteFornecedores(Array.from(selecionados));
      setSelecionados(new Set());
    });
  }

  return (
    <div>
      {selecionados.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2.5">
          <span className="text-xs text-black/60">
            {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <button
            type="button"
            onClick={excluirSelecionados}
            disabled={pending}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
          >
            {pending ? "Excluindo…" : "Excluir selecionados"}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-[#57534E]/[0.05] text-xs uppercase tracking-[0.15em] text-black/40">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={alternarTodos}
                  aria-label="Selecionar todos"
                  className="h-4 w-4 rounded border-black/30 accent-[#1C3A5E]"
                />
              </th>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Categoria</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Cidade</th>
              <th className="px-5 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map((f) => (
              <tr
                key={f.id}
                className="border-b border-black/5 transition last:border-0 hover:bg-[#57534E]/[0.04]"
              >
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selecionados.has(f.id)}
                    onChange={() => alternarUm(f.id)}
                    aria-label={`Selecionar ${f.nome}`}
                    className="h-4 w-4 rounded border-black/30 accent-[#1C3A5E]"
                  />
                </td>
                <td className="px-5 py-4">
                  <Link href={`/crm/fornecedores/${f.id}`} className="text-black hover:underline">
                    {f.nome}
                  </Link>
                  <p className="mt-0.5 text-xs text-black/40">{f.email || f.telefone || "—"}</p>
                </td>
                <td className="hidden px-5 py-4 text-black/60 sm:table-cell">
                  {f.categoria
                    ? CATEGORIA_FORNECEDOR_LABEL[f.categoria as CategoriaFornecedor]
                    : "—"}
                </td>
                <td className="hidden px-5 py-4 text-black/60 md:table-cell">
                  {f.cidade || "—"}
                </td>
                <td className="px-5 py-4 text-black/40">
                  {new Date(f.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
