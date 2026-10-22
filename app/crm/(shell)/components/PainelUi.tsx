import Link from "next/link";
import type { ReactNode } from "react";

// Peças visuais da Visão geral e das telas ligadas a ela (22/out/2026).

export const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";

export function Card({
  titulo,
  subtitulo,
  acao,
  cor = "#24476B",
  fundo = "#FFFFFF",
  children,
  className = "",
  id,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  acao?: ReactNode;
  cor?: string;
  fundo?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`rounded-2xl border border-t-[3px] border-black/[0.06] p-5 md:p-6 ${SOMBRA} ${className}`} style={{ backgroundColor: fundo, borderTopColor: cor }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-[#20252B]">{titulo}</h2>
          {subtitulo && <p className="mt-0.5 text-[13px] text-[#626B75]">{subtitulo}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function LinkAcao({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="shrink-0 rounded text-sm font-medium text-[#24476B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30">
      {children}
    </Link>
  );
}

export function FalhaCarregar({ oque }: { oque: string }) {
  return (
    <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
      Não foi possível carregar {oque}. Recarregue a página; se continuar, verifique a conexão com o banco.
    </p>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-black/[0.03] px-4 py-5 text-center text-sm text-[#626B75]">{children}</p>;
}

export function Esqueleto({ altura = "h-40", className = "" }: { altura?: string; className?: string }) {
  return (
    <div role="status" aria-label="Carregando" className={`animate-pulse rounded-2xl border border-black/[0.04] bg-white/70 ${altura} ${className}`}>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export function Badge({ texto, cor, fundo }: { texto: string; cor: string; fundo: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium leading-5" style={{ color: cor, backgroundColor: fundo }}>
      {texto}
    </span>
  );
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const brl = (c: number) => BRL.format(c / 100).replace(/ /g, " ");
export const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function diasEntre(de: string, ate: string) {
  const a = Date.UTC(+de.slice(0, 4), +de.slice(5, 7) - 1, +de.slice(8, 10));
  const b = Date.UTC(+ate.slice(0, 4), +ate.slice(5, 7) - 1, +ate.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

export function IconeAtividade({ tipo }: { tipo: string }) {
  const comum = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const etapa = tipo.startsWith("mudanca_estagio");
  const financeiro = tipo.startsWith("financeiro:") || tipo === "pagamento";
  return (
    <span aria-hidden="true" className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${etapa ? "bg-[#EAF1F8] text-[#24476B]" : financeiro ? "bg-[#E6F2EF] text-[#28665D]" : "bg-white text-[#59636F]"}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...comum}>
        {etapa ? (
          <path d="M5 12h14M13 6l6 6-6 6" />
        ) : financeiro ? (
          <>
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
          </>
        ) : (
          <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        )}
      </svg>
    </span>
  );
}

export const ROTULO_ATIVIDADE: Record<string, string> = {
  "financeiro:recebimento": "Recebimento",
  "financeiro:estorno": "Estorno",
  "financeiro:reembolso": "Reembolso",
};

// Tipos que a equipe registra à mão (as automáticas ficam de fora das "interações").
export const TIPOS_MANUAIS = ["nota", "ligacao", "whatsapp", "email", "reuniao", "proposta"];
