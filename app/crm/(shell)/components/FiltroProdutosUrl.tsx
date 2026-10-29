"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FiltroProdutos, type OpcaoProduto } from "./FiltroProdutos";

// Quadradinhos de produto nas listas (Clientes e Fornecedores — Wilson,
// 29/out/2026). Mantém os outros filtros da URL e volta para a 1ª página.
export function FiltroProdutosUrl({ opcoes, param = "produto", cor, rotuloTodos }: { opcoes: OpcaoProduto[]; param?: string; cor?: string; rotuloTodos?: string }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const manter: Record<string, string> = {};
  sp.forEach((v, k) => {
    if (k !== param && k !== "pag") manter[k] = v;
  });
  const ativo = sp.get(param);
  return <FiltroProdutos opcoes={opcoes} ativo={opcoes.some((o) => o.valor === ativo) ? ativo : null} base={pathname} manter={manter} cor={cor} param={param} rotuloTodos={rotuloTodos} />;
}
