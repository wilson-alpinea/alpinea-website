"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

// Navegação do CRM com a página ativa destacada (Wilson, 22/out/2026).
// Vale o item cujo endereço casa por mais tempo com a rota atual — assim
// "/crm" (Dashboard) não fica ativo em "/crm/clientes".
export function NavCrm({ itens, variante }: { itens: Item[]; variante: "desktop" | "mobile" }) {
  const pathname = usePathname() ?? "";
  const ativo = itens
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <>
      {itens.map((item) => {
        const eAtivo = item.href === ativo;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={eAtivo ? "page" : undefined}
            className={`relative whitespace-nowrap rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
              eAtivo ? "text-white" : "text-white/60 hover:text-white"
            } ${variante === "desktop" ? "py-1" : "py-0.5"}`}
          >
            {item.label}
            {eAtivo && <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-white" />}
          </Link>
        );
      })}
    </>
  );
}
