import Link from "next/link";
import type { ReactNode } from "react";
import { SOMBRA } from "./PainelUi";

// Peças das Visões gerais de Seguro e Documentação (Wilson, 29/out/2026) —
// mesmo visual dos indicadores da Visão geral da Agência.

export function Indicador({ href, titulo, janela, fundo, cor, children, rodape = "Ver lista →" }: { href: string; titulo: string; janela: string; fundo: string; cor: string; children: ReactNode; rodape?: string }) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border border-t-[3px] border-black/[0.06] p-5 transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA}`}
      style={{ backgroundColor: fundo, borderTopColor: cor, ["--tw-ring-color" as string]: cor }}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#20252B]">{titulo}</span>
        <span className="shrink-0 text-[13px] text-[#626B75]">{janela}</span>
      </span>
      <span className="mt-2 flex-1">{children}</span>
      <span className="mt-2 text-[13px] font-medium" style={{ color: cor }}>
        {rodape}
      </span>
    </Link>
  );
}

export const Numero = ({ children, cor = "#20252B" }: { children: ReactNode; cor?: string }) => (
  <span className="block text-[28px] font-semibold leading-tight tabular-nums" style={{ color: cor }}>
    {children}
  </span>
);
export const Detalhe = ({ children }: { children: ReactNode }) => <span className="mt-0.5 block text-[13px] text-[#626B75]">{children}</span>;

export function Stat({ titulo, valor, detalhe, destaque }: { titulo: string; valor: ReactNode; detalhe?: ReactNode; destaque?: string }) {
  return (
    <div className="rounded-xl bg-[#F5F6F7] p-4">
      <p className="text-[13px] font-medium text-[#626B75]">{titulo}</p>
      <p className="mt-1 text-[24px] font-semibold leading-tight tabular-nums" style={{ color: destaque ?? "#20252B" }}>
        {valor}
      </p>
      {detalhe && <p className="mt-0.5 text-[13px] text-[#626B75]">{detalhe}</p>}
    </div>
  );
}

export const SemBase = ({ children = "Sem base no período" }: { children?: ReactNode }) => <span className="text-base text-[#626B75]">{children}</span>;

/** Linha de barra horizontal (funil, ranking). */
export function LinhaBarra({ href, rotulo, n, max, cor, fundo, extra }: { href?: string; rotulo: ReactNode; n: number; max: number; cor: string; fundo: string; extra?: ReactNode }) {
  const corpo = (
    <>
      <span className="truncate text-sm text-[#20252B]">{rotulo}</span>
      <span className="h-2.5 rounded-full" style={{ backgroundColor: fundo }}>
        <span className="block h-full rounded-full" style={{ width: `${(n / Math.max(1, max)) * 100}%`, backgroundColor: cor, minWidth: n ? 6 : 0 }} />
      </span>
      <span className="text-right text-sm tabular-nums">
        <span className="font-semibold text-[#20252B]">{n}</span>
        {extra && <span className="block text-[13px] text-[#626B75]">{extra}</span>}
      </span>
    </>
  );
  const cls = "grid grid-cols-[9.5rem_1fr_auto] items-center gap-3 rounded-lg p-1 -m-1";
  return href ? (
    <Link href={href} className={`${cls} hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20`}>
      {corpo}
    </Link>
  ) : (
    <div className={cls}>{corpo}</div>
  );
}

export function Alerta({ children, href, acao }: { children: ReactNode; href: string; acao: string }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#B42318]/20 bg-[#FDECEA] px-5 py-3">
      <p className="text-sm text-[#8A1C12]">{children}</p>
      <Link href={href} className="rounded-xl border border-[#B42318]/30 bg-white px-3.5 py-2 text-sm font-medium text-[#B42318] hover:border-[#B42318]">
        {acao}
      </Link>
    </div>
  );
}

export function IconeEvento({ tipo }: { tipo: string }) {
  const comum = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const etapa = tipo === "etapa";
  const pagamento = tipo === "pagamento";
  return (
    <span aria-hidden="true" className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] bg-white ${etapa ? "text-[#24476B]" : "text-[#59636F]"}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...comum}>
        {etapa ? (
          <path d="M5 12h14M13 6l6 6-6 6" />
        ) : pagamento ? (
          <>
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
          </>
        ) : tipo === "edicao" ? (
          <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
        ) : (
          <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        )}
      </svg>
    </span>
  );
}
