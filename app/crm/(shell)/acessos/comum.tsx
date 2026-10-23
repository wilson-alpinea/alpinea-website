"use client";

import { useState, type ReactNode } from "react";

// Peças compartilhadas da página Acessos (23/out/2026).

export type Papel = "admin" | "parceiro_agencia" | "empreiteira" | null;

export const PERFIS: { valor: Exclude<Papel, null> | "sem_acesso"; label: string; descricao: string }[] = [
  { valor: "admin", label: "Administrador", descricao: "Equipe Alpinea: vê e edita tudo nos dois CRMs, inclusive esta página de acessos." },
  { valor: "parceiro_agencia", label: "Parceiro da agência", descricao: "Vê somente os leads da própria empresa (pelo link de indicação ou atribuídos na ficha do cliente). Somente leitura." },
  { valor: "empreiteira", label: "Empreiteira", descricao: "Vê somente os candidatos das vagas vinculadas à própria empresa. Somente leitura." },
  { valor: "sem_acesso", label: "Sem acesso", descricao: "A conta existe, mas não entra no CRM até receber um perfil." },
];
export const rotuloPerfil = (p: Papel) => PERFIS.find((x) => x.valor === (p ?? "sem_acesso"))?.label ?? "Sem acesso";

export const TEMA = {
  usuarios: { fundo: "#F2F6FC", cor: "#24476B" },
  empresas: { fundo: "#F5F3FA", cor: "#665582" },
  vagas: { fundo: "#F0F7F5", cor: "#28665D" },
} as const;

export const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
export const CAMPO_FILTRO =
  "rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-base text-[#20252B] outline-none transition placeholder:text-[#8A929B] focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";
export const ERRO_CAMPO = "mt-1 text-[13px] text-[#B42318]";

export function CabecalhoSecao({
  tema,
  cores,
  icone,
  titulo,
  descricao,
  acao,
}: {
  tema: keyof typeof TEMA;
  cores?: { fundo: string; cor: string };
  icone: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  const t = cores ?? TEMA[tema];
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-t-[3px] border-black/[0.06] p-6 ${SOMBRA}`} style={{ backgroundColor: t.fundo, borderTopColor: t.cor }}>
      <div className="flex min-w-0 items-start gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white" style={{ color: t.cor }}>
          {icone}
        </span>
        <div className="min-w-0">
          <h2 style={{ color: t.cor }}>{titulo}</h2>
          <p className="text-sm text-[#626B75]">{descricao}</p>
        </div>
      </div>
      {acao}
    </div>
  );
}

export function BotaoPrimario({ cor, onClick, children }: { cor: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: cor, ["--tw-ring-color" as string]: cor }}
    >
      {children}
    </button>
  );
}

export function Mensagem({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p role={ok ? "status" : "alert"} className={`rounded-lg border px-3 py-2 text-sm ${ok ? "border-[#28665D]/20 bg-[#E6F2EF] text-[#1F4F48]" : "border-[#B42318]/20 bg-[#FDECEA] text-[#B42318]"}`}>
      {children}
    </p>
  );
}

export function Copiar({ texto, rotulo = "Copiar", rotuloAcessivel }: { texto: string; rotulo?: string; rotuloAcessivel?: string }) {
  const [estado, setEstado] = useState<"ok" | "erro" | null>(null);
  return (
    <button
      type="button"
      aria-label={rotuloAcessivel ?? rotulo}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setEstado("ok");
        } catch {
          setEstado("erro");
        }
        setTimeout(() => setEstado(null), 2000);
      }}
      className="rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1 text-[13px] font-medium text-[#20252B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
    >
      <span aria-live="polite">{estado === "ok" ? "Copiado" : estado === "erro" ? "Não copiou" : rotulo}</span>
    </button>
  );
}

export function MenuAcoes({ rotulo, itens }: { rotulo: string; itens: { label: string; acao: () => void; perigo?: boolean }[] }) {
  const [aberto, setAberto] = useState(false);
  if (!itens.length) return null;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={rotulo}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="crm-livre rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-base leading-none text-[#626B75] transition hover:text-[#20252B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
      >
        ⋯
      </button>
      {aberto && (
        <>
          <button type="button" aria-label="Fechar menu" className="crm-livre fixed inset-0 z-20 cursor-default" onClick={() => setAberto(false)} />
          <span role="menu" className="absolute right-0 top-full z-30 mt-1 block w-52 overflow-hidden rounded-xl border border-[#E6E9ED] bg-white py-1 text-left shadow-lg">
            {itens.map((i) => (
              <button
                key={i.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAberto(false);
                  i.acao();
                }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#F5F6F7] ${i.perigo ? "text-[#B42318]" : "text-[#20252B]"}`}
              >
                {i.label}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

export const Icones = {
  usuarios: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5M16 5.5a3 3 0 0 1 0 5.6M17.5 14.3c1.6.6 2.6 2.2 3 4.7" />
    </svg>
  ),
  empresas: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14M14 10h5a1 1 0 0 1 1 1v9M3 20h18M7.5 9h3M7.5 13h3M7.5 17h3" />
    </svg>
  ),
  vagas: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" />
    </svg>
  ),
};
