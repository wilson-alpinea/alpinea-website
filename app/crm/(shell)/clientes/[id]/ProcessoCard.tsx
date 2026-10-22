"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { EstagioSelect } from "../../pipeline/EstagioSelect";
import { formatarDataCurta, type EventoHistorico, type ResumoProcesso } from "@/lib/crm/processo";

// Card compacto de processo da ficha do cliente (Wilson, 22/out/2026) —
// substitui os dois fluxogramas com bolinhas (FunnelStepper/EntregaStepper).
// A barra é só leitura: clicar abre o histórico; o status só muda por
// "Alterar etapa".

const AZUL_ESCURO = "#1C3A5E";
const AZUL_MEDIO = "#4A78B0";
const CINZA = "rgba(0,0,0,0.09)";
const VERDE = "rgba(58,140,90,0.7)";
const VERMELHO = "rgba(190,70,70,0.6)";
const CINZA_ALCANCADO = "rgba(0,0,0,0.28)";

type Extra = { rotulo: string; valor: string };

export function ProcessoCard({
  titulo,
  etapas,
  resumo,
  dataEntrada,
  extras,
  aviso,
  historico,
  action,
  opcoes,
  estagioAtualSelect,
  placeholderSelect,
}: {
  titulo: string;
  etapas: readonly string[];
  resumo: ResumoProcesso;
  dataEntrada: string | null;
  extras: Extra[];
  aviso?: string | null;
  historico: EventoHistorico[];
  action: (formData: FormData) => void;
  opcoes: { valor: string; label: string }[];
  estagioAtualSelect: string;
  placeholderSelect?: string;
}) {
  // Guarda o status de quando o painel "Alterar etapa" foi aberto: depois de
  // confirmar, a página revalida, o status muda e o painel fecha sozinho.
  const [alterandoEm, setAlterandoEm] = useState<string | null>(null);
  const alterando = alterandoEm === estagioAtualSelect;
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const fecharHistorico = useCallback(() => setHistoricoAberto(false), []);
  const painelId = useId();

  const { situacao, indiceAtual, indiceAlcancado } = resumo;
  const dataFormatada = formatarDataCurta(dataEntrada);

  function corSegmento(i: number) {
    if (situacao === "concluido") return VERDE;
    if (situacao === "aguardando") return CINZA;
    if (situacao === "perdido") {
      if (i === 4) return VERMELHO;
      return i <= indiceAlcancado ? CINZA_ALCANCADO : CINZA;
    }
    if (i < indiceAtual) return AZUL_ESCURO;
    if (i === indiceAtual) return AZUL_MEDIO;
    return CINZA;
  }

  function situacaoSegmento(i: number) {
    if (situacao === "concluido") return "concluída";
    if (situacao === "aguardando") return "não iniciada";
    if (situacao === "perdido") {
      if (i === 4) return "negócio perdido";
      return i <= indiceAlcancado ? "alcançada" : "não alcançada";
    }
    if (i < indiceAtual) return "concluída";
    if (i === indiceAtual) return "etapa atual";
    return "pendente";
  }

  const indicador =
    situacao === "concluido"
      ? "5 de 5 etapas concluídas"
      : situacao === "aguardando"
        ? "Não iniciado"
        : situacao === "perdido"
          ? "Encerrado sem sucesso"
          : `Etapa ${indiceAtual + 1} de 5`;

  const corIndicador =
    situacao === "concluido"
      ? "text-[rgba(58,140,90,1)]"
      : situacao === "perdido"
        ? "text-[rgba(190,70,70,0.9)]"
        : "text-black/40";

  return (
    <section className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#1C3A5E]">{titulo}</h2>
        <p className={`text-[10px] font-medium uppercase tracking-[0.2em] ${corIndicador}`}>{indicador}</p>
      </div>

      {/* Barra de 5 segmentos — tooltip no hover e no foco pelo teclado. */}
      <div className="mt-4 flex gap-1.5" role="list" aria-label={`Progresso — ${titulo}`}>
        {etapas.map((nome, i) => {
          const atual = situacao === "andamento" && i === indiceAtual;
          const alinhamento =
            i === 0 ? "left-0" : i === etapas.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2";
          return (
            <div key={nome} role="listitem" className="flex-1">
              <button
                type="button"
                onClick={() => setHistoricoAberto(true)}
                aria-label={`${nome}: ${situacaoSegmento(i)}. Abrir histórico`}
                className="group relative flex h-4 w-full items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-[#4A78B0]/40"
              >
                <span
                  className={`block w-full rounded-full transition-colors ${atual ? "h-2 shadow-[0_0_0_3px_rgba(74,120,176,0.18)]" : "h-1.5"}`}
                  style={{ backgroundColor: corSegmento(i) }}
                />
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full z-10 mb-1.5 whitespace-nowrap rounded-md bg-[#1C3A5E] px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${alinhamento}`}
                >
                  {nome} · {situacaoSegmento(i)}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-lg font-medium leading-snug text-black">{resumo.etapaAtual}</p>
      {dataFormatada && situacao !== "aguardando" && (
        <p className="mt-0.5 text-xs text-black/45">
          {situacao === "concluido" ? "Concluído em" : situacao === "perdido" ? "Encerrado em" : "Desde"} {dataFormatada}
        </p>
      )}
      {resumo.proximaEtapa && (
        <p className="mt-2 text-sm text-black/60">
          Próxima etapa: <span className="text-black/80">{resumo.proximaEtapa}</span>
        </p>
      )}
      {aviso && <p className="mt-2 text-xs text-black/45">{aviso}</p>}

      {extras.length > 0 && (
        <dl className="mt-3 space-y-1 border-t border-black/5 pt-3 text-xs">
          {extras.map((e) => (
            <div key={e.rotulo} className="flex gap-2">
              <dt className="text-black/40">{e.rotulo}:</dt>
              <dd className="text-black/75">{e.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAlterandoEm(alterando ? null : estagioAtualSelect)}
            aria-expanded={alterando}
            aria-controls={painelId}
            className="rounded-full border border-[#1C3A5E] px-4 py-1.5 text-xs font-medium text-[#1C3A5E] transition hover:bg-[#1C3A5E] hover:text-white"
          >
            Alterar etapa
          </button>
          <button
            type="button"
            onClick={() => setHistoricoAberto(true)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-black/55 transition hover:bg-black/5 hover:text-black"
          >
            Ver histórico
          </button>
        </div>
        {alterando && (
          <div id={painelId} className="mt-3 rounded-xl border border-black/5 bg-[#FAF9F6] p-3">
            <p className="mb-2 text-[11px] text-black/45">Escolha a etapa e a data em que o cliente entrou nela.</p>
            <EstagioSelect
              action={action}
              estagios={opcoes}
              estagioAtual={estagioAtualSelect}
              placeholder={placeholderSelect}
            />
          </div>
        )}
      </div>

      {historicoAberto && (
        <PainelHistorico titulo={titulo} eventos={historico} onFechar={fecharHistorico} />
      )}
    </section>
  );
}

function PainelHistorico({
  titulo,
  eventos,
  onFechar,
}: {
  titulo: string;
  eventos: EventoHistorico[];
  onFechar: () => void;
}) {
  // Só é renderizado depois de um clique (nunca no servidor), então
  // document já existe aqui.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", onKey);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onFechar]);

  // Portal no <body>: evita os bugs de position:fixed dentro de containers
  // com transform/backdrop-filter (Safari/iOS).
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Histórico — ${titulo}`}>
      <button type="button" aria-label="Fechar histórico" onClick={onFechar} className="absolute inset-0 bg-black/25" />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/5 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">Histórico</p>
            <h2 className="mt-0.5 text-lg font-medium text-black">{titulo}</h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            autoFocus
            aria-label="Fechar"
            className="rounded-full px-2 py-1 text-xl leading-none text-black/40 transition hover:bg-black/5 hover:text-black"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {eventos.length === 0 ? (
            <p className="text-sm text-black/45">Nenhuma mudança de etapa registrada ainda.</p>
          ) : (
            <ol className="space-y-5">
              {eventos.map((e) => (
                <li key={e.id} className="border-l-2 border-[#1C3A5E]/15 pl-4">
                  <p className="text-xs text-black/45">
                    {formatarDataCurta(e.data) ?? "Sem data"}
                    {!e.dataInformada && <span className="text-black/30"> · data do registro</span>}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-black">{e.titulo}</p>
                  {e.conteudo && <p className="mt-1 text-sm leading-relaxed text-black/60">{e.conteudo}</p>}
                  {e.autor && <p className="mt-1 text-xs text-black/35">— {e.autor}</p>}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-6 text-[11px] leading-relaxed text-black/35">
            Mostra só as mudanças registradas no sistema. Etapas sem registro não têm data.
          </p>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
