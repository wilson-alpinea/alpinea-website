"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ESTAGIO_COR, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { PRODUTO_PRINCIPAL_LABEL, type ProdutoPrincipal } from "@/lib/crm/produtos";
import type { Estagio } from "@/lib/crm/types";
import { deleteClientes } from "../../actions";

type LinhaCliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  estagio: string;
  valor_proposta: number | null;
  produto_principal: string | null;
  created_at: string;
};

function formatBRL(valor: number | null) {
  if (valor === null) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function ClientesTable({ clientes }: { clientes: LinhaCliente[] }) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const todosSelecionados = clientes.length > 0 && selecionados.size === clientes.length;

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(clientes.map((c) => c.id)));
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
      `Excluir ${selecionados.size} ${selecionados.size === 1 ? "cliente" : "clientes"}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    startTransition(async () => {
      await deleteClientes(Array.from(selecionados));
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
              <th className="hidden px-5 py-3 font-medium md:table-cell">Produto principal</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Estágio</th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell">Valor da proposta</th>
              <th className="px-5 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="border-b border-black/5 transition last:border-0 hover:bg-[#57534E]/[0.04]"
              >
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selecionados.has(c.id)}
                    onChange={() => alternarUm(c.id)}
                    aria-label={`Selecionar ${c.nome}`}
                    className="h-4 w-4 rounded border-black/30 accent-[#1C3A5E]"
                  />
                </td>
                <td className="px-5 py-4">
                  <Link href={`/crm/clientes/${c.id}`} className="text-black hover:underline">
                    {c.nome}
                  </Link>
                  <p className="mt-0.5 text-xs text-black/40">{c.email || c.telefone || "—"}</p>
                </td>
                <td className="hidden px-5 py-4 text-black/60 md:table-cell">
                  {c.produto_principal
                    ? PRODUTO_PRINCIPAL_LABEL[c.produto_principal as ProdutoPrincipal]
                    : "—"}
                </td>
                <td className="hidden px-5 py-4 sm:table-cell">
                  <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs text-black/70">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: ESTAGIO_COR[c.estagio as Estagio] }}
                    />
                    {ESTAGIO_LABEL[c.estagio as Estagio]}
                  </span>
                </td>
                <td className="hidden px-5 py-4 text-black/60 lg:table-cell">
                  {formatBRL(c.valor_proposta)}
                </td>
                <td className="px-5 py-4 text-black/40">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
