"use client";

import { useEffect, useId, useRef, useState } from "react";

// Trocar de CRM (Wilson, 29/out/2026) — substitui os botões coloridos
// "CRM Agência / Empregos / Seguro" do topo. Desde 27/nov/2026 o botão mostra
// o CRM atual ("CRM Agência ▾") ao lado do logo, no lugar do título grande
// "CRM / Agência" e do ícone de três barras, que encavalavam com o menu.
// Fecha com Esc, clique fora ou ao escolher.

export type OpcaoCrm = { chave: string; nome: string; href: string; cor: string; atual: boolean };

export function MenuCrm({ opcoes }: { opcoes: OpcaoCrm[] }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idMenu = useId();
  const atual = opcoes.find((o) => o.atual);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative min-w-0">
      <button
        ref={botao}
        type="button"
        aria-label={`CRM ${atual?.nome ?? ""} — trocar de CRM`}
        aria-expanded={aberto}
        aria-controls={idMenu}
        onClick={() => setAberto((a) => !a)}
        className="flex min-w-0 cursor-pointer items-center gap-2 rounded-full border border-white/15 py-1.5 pl-3 pr-2.5 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: atual?.cor ?? "#fff" }} />
        <span className="truncate">
          CRM <span className="text-white/70">{atual?.nome}</span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-white/60 transition ${aberto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <nav
          id={idMenu}
          aria-label="Trocar de CRM"
          className="absolute left-0 top-12 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-black/5 bg-white p-2 text-left text-[#20252B] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">CRMs</p>
          <ul>
            {opcoes.map((o) => (
              <li key={o.chave}>
                <a
                  href={o.href}
                  aria-current={o.atual ? "page" : undefined}
                  onClick={() => setAberto(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-black/[0.05] ${o.atual ? "font-semibold" : ""}`}
                >
                  <span aria-hidden="true" className="h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: o.cor }} />
                  <span className="flex-1">CRM {o.nome}</span>
                  {o.atual && <span className="text-[11px] font-normal text-black/40">atual</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
