import Link from "next/link";
import type { CSSProperties } from "react";

// Filtro por produto na Visão geral (Wilson, 29/out/2026): quadradinhos com
// os ícones minimalistas dos produtos; ao escolher um, o painel inteiro
// passa a mostrar só aquele produto. Clicar de novo (ou em "Todos") volta.
// `opaco`: arte preta sobre fundo branco (sem transparência) — some no branco com multiply.
export type OpcaoProduto = { valor: string; label: string; icone: string; opaco?: boolean };

export function FiltroProdutos({
  opcoes,
  ativo,
  base,
  manter = {},
  cor = "#24476B",
  param = "produto",
  rotuloTodos = "Todos os produtos",
}: {
  opcoes: OpcaoProduto[];
  ativo: string | null;
  base: string;
  /** Outros parâmetros da URL a preservar (ex.: período). */
  manter?: Record<string, string | undefined>;
  cor?: string;
  /** Nome do parâmetro na URL (Fornecedores usa "categoria"). */
  param?: string;
  rotuloTodos?: string;
}) {
  const href = (produto: string | null) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(manter)) if (v) q.set(k, v);
    if (produto) q.set(param, produto);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const atual = opcoes.find((o) => o.valor === ativo) ?? null;
  // Fundo leve na cor do CRM + hover com cor e leve elevação (Wilson, 29/out/2026).
  // Muitos itens (Agência): a fileira ocupa a largura toda, sem sobra à
  // direita (Wilson, 29/out/2026). Poucos itens (Documentação): quadrados
  // fixos de 72 px, para não virarem blocos gigantes.
  const preencher = opcoes.length >= 8;
  const quadrado =
    `group relative flex ${preencher ? "aspect-square w-full" : "h-[72px] w-[72px]"} shrink-0` + " items-center justify-center rounded-xl border transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_14px_-8px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
  const vars = { ["--cor" as string]: cor, ["--leve" as string]: `${cor}12`, ["--hover" as string]: `${cor}26`, ["--n" as string]: opcoes.length + 1 } as CSSProperties;

  return (
    <div>
    <nav
      aria-label="Filtrar por produto"
      className={
        preencher
          ? "grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(52px,1fr))] md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
          : "flex flex-wrap items-center gap-2"
      }
      style={vars}
    >
      <Link
        href={href(null)}
        scroll={false}
        aria-current={!atual ? "true" : undefined}
        title={rotuloTodos}
        className={`${quadrado} text-[13px] font-semibold ${!atual ? "text-white" : "border-transparent bg-[var(--leve)] text-[#20252B] hover:border-[var(--cor)]/40 hover:bg-[var(--hover)]"}`}
        style={!atual ? { backgroundColor: cor, borderColor: cor } : undefined}
      >
        Todos
      </Link>
      {opcoes.map((o) => {
        const sel = o.valor === ativo;
        return (
          <Link
            key={o.valor}
            href={href(sel ? null : o.valor)}
            scroll={false}
            aria-current={sel ? "true" : undefined}
            aria-label={sel ? `${o.label} (selecionado — clique para ver todos)` : `Mostrar só ${o.label}`}
            className={`${quadrado} ${sel ? "border-2 bg-[var(--hover)]" : "border-transparent bg-[var(--leve)] hover:border-[var(--cor)]/40 hover:bg-[var(--hover)]"}`}
            style={sel ? { borderColor: cor, boxShadow: `0 0 0 3px ${cor}22` } : undefined}
          >
            {/* Ícones do repositório em preto (brightness-0), como no site. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.icone} alt="" aria-hidden="true" className={`${preencher ? "h-[52%] w-[52%]" : "h-10 w-10"} object-contain transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none ${o.opaco ? "mix-blend-multiply" : "brightness-0"}`} />
            {/* Nome do serviço ao passar o mouse (Wilson, 29/out/2026). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-[#20252B] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
            >
              {o.label}
            </span>
          </Link>
        );
      })}
    </nav>
      {atual && (
        <p className="mt-2 text-sm text-[#626B75]">
          Mostrando só <strong className="font-semibold text-[#20252B]">{atual.label}</strong>
        </p>
      )}
    </div>
  );
}
