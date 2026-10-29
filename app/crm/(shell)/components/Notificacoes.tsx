"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import type { Notificacao, UnidadeNotificacao } from "@/lib/crm/notificacoes";
import { marcarNotificacoesLidas } from "../../notificacoesActions";

// Sino de notificações da Visão geral (Wilson, 22/out/2026): contorno quando
// não há nada novo, sino preto + bolinha com o número quando há.
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// Marcar como lida / remover, item a item (Wilson, 29/out/2026). Guardado
// neste navegador (localStorage), como o cookie de "lidas".
type Estado = { lidas: string[]; removidas: string[] };
const VAZIO = "{}";
const chave = (u: UnidadeNotificacao) => `crm_notificacoes_${u}`;
const ouvintes = new Set<() => void>();
function ler(u: UnidadeNotificacao): string {
  try {
    return localStorage.getItem(chave(u)) ?? VAZIO;
  } catch {
    return VAZIO;
  }
}
function gravar(u: UnidadeNotificacao, e: Estado) {
  try {
    // Só ids recentes (as notificações cobrem 30 dias).
    localStorage.setItem(chave(u), JSON.stringify({ lidas: e.lidas.slice(-300), removidas: e.removidas.slice(-300) }));
  } catch {}
  ouvintes.forEach((f) => f());
}
function inscrever(f: () => void) {
  ouvintes.add(f);
  window.addEventListener("storage", f);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", f);
  };
}
function parse(bruto: string): Estado {
  try {
    const o = JSON.parse(bruto) as Partial<Estado>;
    return { lidas: Array.isArray(o.lidas) ? o.lidas : [], removidas: Array.isArray(o.removidas) ? o.removidas : [] };
  } catch {
    return { lidas: [], removidas: [] };
  }
}

const COR_TIPO: Record<Notificacao["tipo"], string> = {
  novo_cliente: "#24476B",
  proposta: "#665582",
  arquivo_proposta: "#665582",
  etapa: "#24476B",
  execucao: "#28665D",
  pagamento: "#28665D",
  alerta: "#B42318",
};

export function Notificacoes({
  lista,
  naoLidas,
  erro,
  unidade = "agencia",
  verTudo = { href: "/crm/atividade", rotulo: "Ver toda a atividade" },
}: {
  lista: Notificacao[];
  naoLidas: number;
  erro?: boolean;
  unidade?: UnidadeNotificacao;
  verTudo?: { href: string; rotulo: string };
}) {
  const [aberto, setAberto] = useState(false);
  const [, iniciar] = useTransition();
  const bruto = useSyncExternalStore(inscrever, () => ler(unidade), () => VAZIO);
  const local = parse(bruto);
  const visiveis = lista.filter((n) => !local.removidas.includes(n.id));
  const ehNova = (n: Notificacao) => !n.lida && !local.lidas.includes(n.id);
  const qtdNovas = visiveis.filter(ehNova).length;
  const marcarLida = (id: string) => gravar(unidade, { ...local, lidas: [...local.lidas.filter((x) => x !== id), id] });
  const marcarNaoLida = (id: string) => gravar(unidade, { ...local, lidas: local.lidas.filter((x) => x !== id) });
  const remover = (id: string) => gravar(unidade, { ...local, removidas: [...local.removidas, id] });
  function marcarTodas() {
    gravar(unidade, { ...local, lidas: [...local.lidas, ...visiveis.filter(ehNova).map((n) => n.id)] });
    iniciar(() => marcarNotificacoesLidas(unidade));
  }
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function alternar() {
    setAberto(!aberto);
  }

  void naoLidas;
  const tem = qtdNovas > 0;
  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label={tem ? `Notificações: ${qtdNovas} ${qtdNovas === 1 ? "nova" : "novas"}` : "Notificações: nenhuma nova"}
        className="crm-livre relative flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#D5DAE0] bg-white transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tem ? "/images/icone-notificacao.png" : "/images/icone-notificacao-vazio.png"} alt="" aria-hidden="true" className="h-5 w-5" />
        {tem && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B42318] px-1 text-[11px] font-semibold leading-none text-white tabular-nums ring-2 ring-[#FAF9F6]">
            {qtdNovas > 9 ? "9+" : qtdNovas}
          </span>
        )}
      </button>

      {aberto && (
        <div role="dialog" aria-label="Notificações" className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-[#EEF0F2] px-4 py-3">
            <p className="text-base font-semibold text-[#20252B]">Notificações</p>
            {tem ? (
              <button type="button" onClick={marcarTodas} className="text-[13px] font-medium text-[#24476B] hover:underline">
                Marcar todas como lidas
              </button>
            ) : (
              <span className="text-[13px] text-[#626B75]">Últimos 30 dias</span>
            )}
          </div>
          {erro ? (
            <p role="alert" className="px-4 py-6 text-sm text-[#B42318]">
              Não foi possível carregar as notificações.
            </p>
          ) : visiveis.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#626B75]">Nenhuma notificação por enquanto.</p>
          ) : (
            <ul className="max-h-[min(60vh,420px)] divide-y divide-[#EEF0F2] overflow-y-auto">
              {visiveis.map((n) => {
                const nova = ehNova(n);
                return (
                  <li key={n.id} className={`group relative ${nova ? "bg-[#F2F6FC]" : ""}`}>
                    <Link
                      href={n.href ?? `/crm/clientes/${n.clienteId}`}
                      onClick={() => {
                        marcarLida(n.id);
                        setAberto(false);
                      }}
                      className="flex gap-3 py-3 pl-4 pr-24 transition hover:bg-[#F7F9FB]"
                    >
                      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: nova ? COR_TIPO[n.tipo] : "#D5DAE0" }} />
                      <span className="min-w-0">
                        <span className={`block text-sm text-[#20252B] ${nova ? "font-semibold" : "font-medium"}`}>
                          {n.titulo}
                          {nova && <span className="sr-only"> (nova)</span>}
                        </span>
                        <span className="block text-sm text-[#20252B]">{n.clienteNome}</span>
                        {n.detalhe && <span className="line-clamp-1 block text-[13px] text-[#626B75]">{n.detalhe}</span>}
                        <span className="block text-[13px] tabular-nums text-[#626B75]">{fmt(n.quando)}</span>
                      </span>
                    </Link>
                    <div className="absolute right-2 top-2.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => (nova ? marcarLida(n.id) : marcarNaoLida(n.id))}
                        title={nova ? "Marcar como lida" : "Marcar como não lida"}
                        aria-label={`${nova ? "Marcar como lida" : "Marcar como não lida"}: ${n.titulo} — ${n.clienteNome}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#626B75] hover:bg-[#EEF0F2] hover:text-[#24476B]"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                          {nova ? <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /> : <circle cx="10" cy="10" r="4" />}
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => remover(n.id)}
                        title="Remover da lista"
                        aria-label={`Remover da lista: ${n.titulo} — ${n.clienteNome}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#626B75] hover:bg-[#FDECEA] hover:text-[#B42318]"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-[#EEF0F2] px-4 py-2.5 text-right">
            <Link href={verTudo.href} onClick={() => setAberto(false)} className="text-sm font-medium text-[#24476B] hover:underline">
              {verTudo.rotulo}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
