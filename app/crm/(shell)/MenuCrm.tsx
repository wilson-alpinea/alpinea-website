"use client";

import { useEffect, useId, useRef, useState } from "react";

// Trocar de CRM pelo menu de três barras (Wilson, 29/out/2026) — substitui
// os botões coloridos "CRM Agência / Empregos / Seguro" do topo, que já não
// cabiam com quatro unidades. Mesmo ícone do MenuProdutos (/produtos), em
// branco sobre o cabeçalho preto. Fecha com Esc, clique fora ou ao escolher.

export type OpcaoCrm = { chave: string; nome: string; href: string; cor: string; atual: boolean };

export function MenuCrm({ opcoes }: { opcoes: OpcaoCrm[] }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idMenu = useId();

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
    <div ref={caixa} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label={aberto ? "Fechar menu de CRMs" : "Trocar de CRM"}
        aria-expanded={aberto}
        aria-controls={idMenu}
        onClick={() => setAberto((a) => !a)}
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <span className={`block h-[2px] w-6 rounded-full bg-white transition ${aberto ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full bg-white transition ${aberto ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full bg-white transition ${aberto ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {aberto && (
        <nav
          id={idMenu}
          aria-label="Trocar de CRM"
          className="absolute right-0 top-12 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-black/5 bg-white p-2 text-left text-[#20252B] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
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
