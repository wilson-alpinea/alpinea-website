import Link from "next/link";

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
}: {
  opcoes: OpcaoProduto[];
  ativo: string | null;
  base: string;
  /** Outros parâmetros da URL a preservar (ex.: período). */
  manter?: Record<string, string | undefined>;
  cor?: string;
}) {
  const href = (produto: string | null) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(manter)) if (v) q.set(k, v);
    if (produto) q.set("produto", produto);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const atual = opcoes.find((o) => o.valor === ativo) ?? null;
  const quadrado =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

  return (
    <nav aria-label="Filtrar a visão geral por produto" className="flex flex-wrap items-center gap-2">
      <Link
        href={href(null)}
        scroll={false}
        aria-current={!atual ? "true" : undefined}
        title="Todos os produtos"
        className={`${quadrado} text-[11px] font-semibold ${!atual ? "text-white" : "border-[#D5DAE0] text-[#20252B] hover:border-[#20252B]/40"}`}
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
            title={o.label}
            className={`${quadrado} ${sel ? "border-2" : "border-[#D5DAE0] hover:border-[#20252B]/40"}`}
            style={sel ? { borderColor: cor, boxShadow: `0 0 0 3px ${cor}22` } : undefined}
          >
            {/* Ícones do repositório em preto (brightness-0), como no site. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.icone} alt="" aria-hidden="true" className={`h-6 w-6 object-contain ${o.opaco ? "mix-blend-multiply" : "brightness-0"}`} />
          </Link>
        );
      })}
      {atual && (
        <span className="ml-1 text-sm text-[#626B75]">
          Mostrando só <strong className="font-semibold text-[#20252B]">{atual.label}</strong>
        </span>
      )}
    </nav>
  );
}
