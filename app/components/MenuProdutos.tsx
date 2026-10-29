"use client";

import { useEffect, useId, useRef, useState } from "react";

// Menu de produtos (três barras) no topo direito de /produtos (a home do
// site) — Wilson, 26/out/2026.
// Lista todos os produtos de /produtos. Fecha com Esc, clique fora ou ao
// escolher um item.

// Cada seção com a sua cor (Wilson, 29/out/2026: "são empresas diferentes"),
// e Documentação no topo. Verde = mesmo VERDE de /documentacao.
const GRUPOS: { titulo: string; cor: string; itens: { href: string; nome: string; abrir?: string }[] }[] = [
  {
    // Seção Documentação (Wilson, 29/out/2026).
    titulo: "Documentação",
    cor: "#0B3D30",
    itens: [
      { href: "/documentacao/visto", nome: "Visto específico" },
      { href: "/documentacao/elegibilidade", nome: "Certificado de Elegibilidade" },
      { href: "/documentacao/pet", nome: "Exportação de pet" },
    ],
  },
  {
    titulo: "Organize sua viagem",
    cor: "#24476B",
    itens: [
      { href: "/produtos?abrir=roteiro", nome: "Roteiro Personalizado", abrir: "roteiro" },
      { href: "/pacotes", nome: "Pacote de Viagem" },
      { href: "/viagem-personalizada", nome: "Viagem Personalizada" },
    ],
  },
  {
    titulo: "Complete sua viagem",
    cor: "#75608B",
    itens: [
      { href: "/produtos/passagens-aereas", nome: "Passagem Aérea" },
      { href: "/produtos/hoteis", nome: "Hotéis" },
      { href: "/produtos/guia-turistico", nome: "Guia Turístico" },
      { href: "/produtos/transporte-privado", nome: "Transporte Privado" },
      { href: "/produtos/transfer-aeroporto", nome: "Transfer Aeroporto" },
      // Reserva de restaurantes fora do ar por enquanto (Wilson, 29/out/2026).
      { href: "/produtos/jrpass", nome: "JR Pass" },
      { href: "/produtos/cambio", nome: "Câmbio" },
      { href: "/produtos/seguro-viagem", nome: "Seguro Viagem" },
      // Ajisai Shopping fora do ar por enquanto (Wilson, 29/out/2026) — backlog.
      { href: "/produtos/esim", nome: "eSIM" },
    ],
  },
];

export function MenuProdutos({ claro = false }: { claro?: boolean }) {
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

  // Barras pretas sobre a foto; brancas quando o cabeçalho fica preto (rolagem).
  const corBarra = claro ? "bg-white" : "bg-black";

  return (
    <div ref={caixa} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label={aberto ? "Fechar menu de produtos" : "Abrir menu de produtos"}
        aria-expanded={aberto}
        aria-controls={idMenu}
        onClick={() => setAberto((a) => !a)}
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-md transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
      >
        <span className={`block h-[2px] w-6 rounded-full transition ${corBarra} ${aberto ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full transition ${corBarra} ${aberto ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full transition ${corBarra} ${aberto ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {aberto && (
        <nav
          id={idMenu}
          aria-label="Produtos"
          className="absolute right-0 top-12 z-50 max-h-[80vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-black/5 bg-white p-2 text-left normal-case tracking-normal text-[#20252B] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
        >
          {GRUPOS.map((g) => (
            <div key={g.titulo} className="py-1">
              <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: g.cor }}>
                <span aria-hidden="true" className="h-3 w-1 rounded-full" style={{ backgroundColor: g.cor }} />
                {g.titulo}
              </p>
              <ul>
                {g.itens.map((i) => (
                  <li key={i.href}>
                    <a
                      href={i.href}
                      onClick={(e) => {
                        setAberto(false);
                        // Já em /produtos: abre o popup sem recarregar a página.
                        if (i.abrir && window.location.pathname === "/produtos") {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("alpinea:abrir-produto", { detail: i.abrir }));
                        }
                      }}
                      style={{ ["--cor" as string]: g.cor }}
                      className="block rounded-lg px-3 py-2 text-sm transition hover:bg-black/[0.05] hover:text-[var(--cor)]">
                      {i.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-1 border-t border-black/5 pt-1">
            <a href="/produtos" onClick={() => setAberto(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-[#1C3A5E] transition hover:bg-black/[0.05]">
              Ver todos os produtos
            </a>
          </div>
        </nav>
      )}
    </div>
  );
}
