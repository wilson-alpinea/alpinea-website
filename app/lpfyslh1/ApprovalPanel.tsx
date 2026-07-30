"use client";

import { useState } from "react";

// Painel de aprovação de rascunho — mesma lógica visual do Painel Interativo
// usado em /ajisairoteiros (pílulas, abas de dia, tipografia Bodoni Moda),
// mas em tema claro e sem hero, já que aqui o objetivo é só validação rápida
// das informações principais pelo cliente antes de iniciarmos o painel
// digital completo.

type Period = {
  atracao: string;
  pois: string[];
};

type DayContent = {
  day: number;
  manha: Period;
  tarde: Period;
};

const DAYS: DayContent[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  manha: {
    atracao: "Atração Principal",
    pois: [
      "Ponto de Interesse 1",
      "Ponto de Interesse 2",
      "Ponto de Interesse 3",
      "Ponto de Interesse 4",
    ],
  },
  tarde: {
    atracao: "Atração Principal",
    pois: [
      "Ponto de Interesse 1",
      "Ponto de Interesse 2",
      "Ponto de Interesse 3",
      "Ponto de Interesse 4",
    ],
  },
}));

function PoiCard({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2f5aa8] bg-[#eef3fb] px-4 py-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2f5aa8] text-xs font-bold text-white">
        {index + 1}
      </span>
      <span className="text-sm font-semibold text-[#2f5aa8]">{label}</span>
    </div>
  );
}

function PeriodBlock({
  label,
  period,
  displayClassName,
}: {
  label: string;
  period: Period;
  displayClassName: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          {label}
        </span>
      </div>
      <h3
        className={`${displayClassName} mb-1 text-xl font-medium text-black md:text-2xl`}
      >
        {period.atracao}
      </h3>
      <p className="mb-5 text-xs text-black/40">
        Pontos de interesse propostos para o período
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {period.pois.map((poi, index) => (
          <PoiCard key={poi + index} index={index} label={poi} />
        ))}
      </div>
    </div>
  );
}

export function ApprovalPanel({
  displayClassName,
  approvalKey,
}: {
  displayClassName: string;
  approvalKey: string;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [showAdjustBox, setShowAdjustBox] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "aprovado" | "ajustes" | "error"
  >("idle");

  const current = DAYS[activeDay];

  async function sendResponse(action: "aprovado" | "ajustes") {
    setStatus("submitting");
    try {
      const res = await fetch("/api/aprovacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: approvalKey, action, mensagem }),
      });
      if (!res.ok) throw new Error();
      setStatus(action);
    } catch {
      setStatus("error");
    }
  }

  if (status === "aprovado") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Roteiro aprovado
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Obrigado pela confirmação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          A elaboração do seu painel digital personalizado foi iniciada. Em
          breve você receberá o acesso completo pelo WhatsApp.
        </p>
      </div>
    );
  }

  if (status === "ajustes") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Ajustes solicitados
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Recebemos sua solicitação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          Nossa equipe vai revisar os pontos indicados e retornar em breve
          pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <img
          src="/images/goku.png"
          alt="Goku"
          className="absolute right-3 top-3 z-10 h-12 w-12 object-contain sm:right-5 sm:top-5 sm:h-16 sm:w-16"
        />
        <div className="border-b border-black/10 px-6 py-7 text-center sm:px-10">
          <p className="mx-auto mb-5 inline-block rounded-full border border-black/15 px-5 py-2 text-xs uppercase tracking-[0.3em] text-black/65">
            Roteiro de 7 dias
          </p>
          <h2 className={`${displayClassName} text-2xl font-medium text-black md:text-3xl`}>
            Painel Interativo · Rascunho
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/50">
            Selecione um dia para revisar a atração principal e os pontos de
            interesse propostos para a manhã e a tarde.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-black/10 px-6 py-5 sm:px-10 [&::-webkit-scrollbar]:hidden">
          {DAYS.map((d, index) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                index === activeDay
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/50 hover:border-[#2f5aa8]/50 hover:text-black"
              }`}
            >
              Dia {d.day}
            </button>
          ))}
        </div>

        <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
          <PeriodBlock
            label="Manhã"
            period={current.manha}
            displayClassName={displayClassName}
          />
          <PeriodBlock
            label="Tarde"
            period={current.tarde}
            displayClassName={displayClassName}
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-10">
        <h3 className={`${displayClassName} text-xl font-medium text-black md:text-2xl`}>
          Está tudo certo com o roteiro?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
          Sua aprovação confirma as informações principais acima e dá início à
          elaboração do painel digital completo do seu roteiro personalizado.
        </p>

        {showAdjustBox && (
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Conte rapidamente o que gostaria de ajustar"
            rows={3}
            className="mt-6 w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/30 outline-none transition focus:border-[#2f5aa8]/60"
          />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() => sendResponse("aprovado")}
            className="rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Enviando..." : "Aprovar Roteiro"}
          </button>
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() =>
              showAdjustBox ? sendResponse("ajustes") : setShowAdjustBox(true)
            }
            className="rounded-full border border-black/15 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black/70 transition hover:border-black/40 disabled:opacity-50"
          >
            {showAdjustBox ? "Enviar Ajustes" : "Solicitar Ajustes"}
          </button>
        </div>

        {status === "error" && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
            Não foi possível enviar sua resposta. Tente novamente ou fale com
            a Ajisai pelo WhatsApp.
          </p>
        )}
      </div>
    </>
  );
}
