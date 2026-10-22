"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// "← Clientes" volta para a lista do jeito que estava (busca, filtros,
// ordenação e página) — o endereço é guardado pela ListaClientes.
const CHAVE_RETORNO = "crm.clientes.retorno";
const nada = () => () => {};
function ler() {
  try {
    const v = window.sessionStorage.getItem(CHAVE_RETORNO);
    return v && v.startsWith("/crm/clientes") ? v : "/crm/clientes";
  } catch {
    return "/crm/clientes";
  }
}

export function VoltarClientes({ className }: { className?: string }) {
  const href = useSyncExternalStore(nada, ler, () => "/crm/clientes");
  return (
    <Link href={href} className={className}>
      ← Clientes
    </Link>
  );
}
