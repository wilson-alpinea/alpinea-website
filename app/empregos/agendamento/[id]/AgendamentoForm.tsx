"use client";

import { useState } from "react";
import { formatarDataHoraBrasilia, type Horario } from "@/app/lib/agendaEntrevista";

const rotuloDia = (data: string) => {
  const d = new Date(`${data}T12:00:00Z`);
  return {
    semana: d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).replace(".", ""),
    dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(".", ""),
  };
};

export default function AgendamentoForm(props: {
  candidaturaId: string;
  token: string;
  horarios: Horario[];
  agendadoEm: string | null;
  linkReuniao: string | null;
  whatsapp: string;
}) {
  const dias = Array.from(new Set(props.horarios.map((h) => h.data)));
  const [agendado, setAgendado] = useState<string | null>(props.agendadoEm);
  const [remarcando, setRemarcando] = useState(false);
  const [dia, setDia] = useState<string | null>(dias[0] ?? null);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar() {
    if (!escolhido || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/empregos-agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidaturaId: props.candidaturaId, token: props.token, inicio: escolhido }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(d.error || "Não foi possível agendar. Tente outro horário.");
        return;
      }
      setAgendado(d.inicio);
      setRemarcando(false);
      setEscolhido(null);
    } catch {
      setErro("Não foi possível agendar. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  }

  const ajuda = (
    <a href={props.whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#1ea952] underline underline-offset-2">
      Nenhum horário serve? Fale com a Ajisai no WhatsApp
    </a>
  );

  if (agendado && !remarcando) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">Pré-entrevista agendada</p>
        <p className="mt-3 text-xl font-medium capitalize text-black">{formatarDataHoraBrasilia(agendado)}</p>
        <p className="mt-1 text-xs text-black/45">Horário de Brasília · confirmação enviada por e-mail</p>
        {props.linkReuniao ? (
          <a href={props.linkReuniao} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-[#2f80c9] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white">
            Link da reunião
          </a>
        ) : (
          <p className="mt-4 text-sm text-black/55">Enviaremos o link da reunião antes do horário.</p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button type="button" onClick={() => setRemarcando(true)} className="text-xs text-black/50 underline underline-offset-2">
            Preciso remarcar
          </button>
          {ajuda}
        </div>
      </div>
    );
  }

  if (dias.length === 0) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-black/65">No momento não há horários livres na agenda.</p>
        <div className="mt-4">{ajuda}</div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <p className="text-xs font-medium text-black/60">1. Escolha o dia</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {dias.map((d) => {
          const r = rotuloDia(d);
          const ativo = d === dia;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDia(d);
                setEscolhido(null);
              }}
              className={`flex min-w-[68px] flex-col items-center rounded-2xl border px-3 py-2.5 transition ${
                ativo ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/10 text-black/70 hover:border-black/25"
              }`}
            >
              <span className="text-[10px] uppercase tracking-[0.1em] opacity-70">{r.semana}</span>
              <span className="text-sm font-semibold">{r.dia}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs font-medium text-black/60">2. Escolha o horário (Brasília)</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {props.horarios
          .filter((h) => h.data === dia)
          .map((h) => (
            <button
              key={h.inicio}
              type="button"
              onClick={() => setEscolhido(h.inicio)}
              className={`rounded-xl border px-3 py-2.5 text-sm tabular-nums transition ${
                escolhido === h.inicio ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/10 text-black/70 hover:border-black/25"
              }`}
            >
              {h.hora}
            </button>
          ))}
      </div>

      {erro && <p className="mt-4 text-xs text-red-600">{erro}</p>}
      <button
        type="button"
        onClick={confirmar}
        disabled={!escolhido || enviando}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando ? "Agendando…" : escolhido ? `Confirmar ${formatarDataHoraBrasilia(escolhido)}` : "Escolha um horário"}
      </button>
      <div className="mt-4 text-center">{ajuda}</div>
      {remarcando && (
        <button type="button" onClick={() => setRemarcando(false)} className="mt-3 block w-full text-center text-xs text-black/45 underline">
          Manter o horário atual
        </button>
      )}
    </div>
  );
}
