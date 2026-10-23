"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// Link de volta para uma lista com os mesmos filtros/página (o endereço é
// guardado pela própria lista em sessionStorage).
const nada = () => () => {};

export function VoltarLista({ chave, base, rotulo, className }: { chave: string; base: string; rotulo: string; className?: string }) {
  const href = useSyncExternalStore(
    nada,
    () => {
      try {
        const v = window.sessionStorage.getItem(chave);
        return v && v.startsWith(base) ? v : base;
      } catch {
        return base;
      }
    },
    () => base,
  );
  return (
    <Link href={href} className={className}>
      ← {rotulo}
    </Link>
  );
}
