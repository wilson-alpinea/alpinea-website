"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Notificacao } from "@/lib/crm/notificacoes";
import { marcarNotificacoesLidas } from "../../notificacoesActions";

// Sino de notificações da Visão geral (Wilson, 22/out/2026): contorno quando
// não há nada novo, sino preto + bolinha com o número quando há.
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const COR_TIPO: Record<Notificacao["tipo"], string> = {
  novo_cliente: "#24476B",
  proposta: "#665582",
  arquivo_proposta: "#665582",
  etapa: "#24476B",
  execucao: "#28665D",
  pagamento: "#28665D",
};

export function Notificacoes({ lista, naoLidas, erro }: { lista: Notificacao[]; naoLidas: number; erro?: boolean }) {
  const [aberto, setAberto] = useState(false);
  // Destaques do momento em que o painel abriu (continuam visíveis até fechar).
  const [destacadas, setDestacadas] = useState<Set<string>>(new Set());
  const [, iniciar] = useTransition();
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
    if (!aberto && naoLidas > 0) {
      setDestacadas(new Set(lista.filter((n) => !n.lida).map((n) => n.id)));
      iniciar(() => marcarNotificacoesLidas()); // abrir = ler
    }
    setAberto(!aberto);
  }

  const tem = naoLidas > 0;
  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label={tem ? `Notificações: ${naoLidas} ${naoLidas === 1 ? "nova" : "novas"}` : "Notificações: nenhuma nova"}
        className="crm-livre relative flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#D5DAE0] bg-white transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tem ? "/images/icone-notificacao.png" : "/images/icone-notificacao-vazio.png"} alt="" aria-hidden="true" className="h-5 w-5" />
        {tem && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B42318] px-1 text-[11px] font-semibold leading-none text-white tabular-nums ring-2 ring-[#FAF9F6]">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div role="dialog" aria-label="Notificações" className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-[#EEF0F2] px-4 py-3">
            <p className="text-base font-semibold text-[#20252B]">Notificações</p>
            <span className="text-[13px] text-[#626B75]">Últimos 30 dias</span>
          </div>
          {erro ? (
            <p role="alert" className="px-4 py-6 text-sm text-[#B42318]">
              Não foi possível carregar as notificações.
            </p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#626B75]">Nenhuma notificação por enquanto.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-[#EEF0F2] overflow-y-auto">
              {lista.map((n) => {
                const nova = destacadas.has(n.id);
                return (
                  <li key={n.id}>
                    <Link
                      href={`/crm/clientes/${n.clienteId}`}
                      onClick={() => setAberto(false)}
                      className={`flex gap-3 px-4 py-3 transition hover:bg-[#F7F9FB] ${nova ? "bg-[#F2F6FC]" : ""}`}
                    >
                      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: nova ? COR_TIPO[n.tipo] : "#D5DAE0" }} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#20252B]">
                          {n.titulo}
                          {nova && <span className="sr-only"> (nova)</span>}
                        </span>
                        <span className="block text-sm text-[#20252B]">{n.clienteNome}</span>
                        {n.detalhe && <span className="line-clamp-1 block text-[13px] text-[#626B75]">{n.detalhe}</span>}
                        <span className="block text-[13px] tabular-nums text-[#626B75]">{fmt(n.quando)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-[#EEF0F2] px-4 py-2.5 text-right">
            <Link href="/crm/atividade" onClick={() => setAberto(false)} className="text-sm font-medium text-[#24476B] hover:underline">
              Ver toda a atividade
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
