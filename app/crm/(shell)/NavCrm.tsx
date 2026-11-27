"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

// Navegação do CRM com a página ativa destacada (Wilson, 22/out/2026).
// Vale o item cujo endereço casa por mais tempo com a rota atual — assim
// "/crm" (Dashboard) não fica ativo em "/crm/clientes".
// Abas na 2ª linha do cabeçalho (Wilson, 27/nov/2026): a mesma lista no
// computador e no celular; quando não cabe, rola para o lado.
export function NavCrm({ itens }: { itens: Item[] }) {
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
            className={`relative flex shrink-0 items-center whitespace-nowrap px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 ${
              eAtivo ? "text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {item.label}
            {eAtivo && <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white" />}
          </Link>
        );
      })}
    </>
  );
}
