"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type FormState = {
  whatsapp: string;
  duracao: string;
  cidadePartida: string;
  viajantes: string;
  passagens: string;
  orcamento: string;
  jaVisitou: string;
  ritmo: string;
  mobilidade: string;
  hospedagem: string[];
  bucketList: string;
  interesses: string[];
  evitar: string;
  restricoes: string;
  aberturaCulinaria: string;
  experienciasGastronomicas: string[];
  ocasiaoEspecial: string;
  ingles: string;
  experienciaRuim: string;
  observacoes: string;
};

const emptyState: FormState = {
  whatsapp: "",
  duracao: "",
  cidadePartida: "",
  viajantes: "",
  passagens: "",
  orcamento: "",
  jaVisitou: "",
  ritmo: "",
  mobilidade: "",
  hospedagem: [],
  bucketList: "",
  interesses: [],
  evitar: "",
  restricoes: "",
  aberturaCulinaria: "",
  experienciasGastronomicas: [],
  ocasiaoEspecial: "",
  ingles: "",
  experienciaRuim: "",
  observacoes: "",
};

type ArrayField = "hospedagem" | "interesses" | "experienciasGastronomicas";
type SetField = (key: keyof FormState, value: string | string[]) => void;
type ToggleField = (key: ArrayField, value: string) => void;

const STEP_LABELS = [
  "Sobre a viagem",
  "Perfil e ritmo",
  "Interesses",
  "Alimentação",
  "Ocasiões",
  "Revisão",
];

export default function BriefingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(emptyState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const totalSteps = STEP_LABELS.length;

  const set: SetField = (key, value) => {
    setData((d) => ({ ...d, [key]: value }) as FormState);
  };

  const toggle: ToggleField = (key, value) => {
    setData((d) => {
      const arr = d[key];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...d, [key]: next } as FormState;
    });
  };

  const canAdvanceFromStep0 = data.whatsapp.trim().length > 0;

  function goNext() {
    if (step === 0 && !canAdvanceFromStep0) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Não foi possível enviar.");
      }
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erro ao enviar.");
    }
  }

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 py-24 text-center text-white">
        <div className="max-w-md">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="mx-auto h-11 w-auto object-contain"
          />
          <h1
            className={`${display.className} mt-8 text-3xl font-medium md:text-4xl`}
          >
            Briefing recebido!
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Obrigado! Recebemos todas as informações e já vamos começar a
            montar seu roteiro. Em breve entramos em contato pelo WhatsApp.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex justify-center">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-10 w-auto object-contain md:h-11"
          />
        </div>

        <div className="mb-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Briefing personalizado
          </p>
          <h1
            className={`${display.className} mt-3 text-3xl font-medium md:text-4xl`}
          >
            Vamos montar seu roteiro
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            Quanto mais detalhes você compartilhar, mais preciso e pessoal
            será o roteiro. Leva cerca de 5 minutos.
          </p>
        </div>

        <div className="my-10 flex items-center">
          {STEP_LABELS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                    index <= step
                      ? "bg-[#b79ce6] text-black"
                      : "border border-white/15 text-white/40"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`hidden text-center text-[9px] uppercase tracking-[0.15em] md:block ${
                    index <= step ? "text-[#b79ce6]" : "text-white/30"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <span
                  className={`mx-2 h-px flex-1 ${
                    index < step ? "bg-[#b79ce6]/60" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:rounded-[2rem] sm:p-10">
          {step === 0 && <StepViagem data={data} set={set} />}
          {step === 1 && <StepPerfil data={data} set={set} toggle={toggle} />}
          {step === 2 && (
            <StepInteresses data={data} set={set} toggle={toggle} />
          )}
          {step === 3 && (
            <StepAlimentacao data={data} set={set} toggle={toggle} />
          )}
          {step === 4 && <StepOcasioes data={data} set={set} />}
          {step === 5 && <StepRevisao data={data} />}

          {status === "error" && (
            <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white disabled:opacity-0"
            >
              ← Voltar
            </button>

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 0 && !canAdvanceFromStep0}
                className="rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {status === "submitting" ? "Enviando..." : "Enviar briefing"}
              </button>
            )}
          </div>
        </div>

        {step === 0 && !canAdvanceFromStep0 && (
          <p className="mt-4 text-center text-[11px] text-white/30">
            Preencha seu WhatsApp para continuar.
          </p>
        )}
      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-white/35">
      {children}
    </label>
  );
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#b79ce6]/60"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#b79ce6]/60"
    />
  );
}

function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-2 text-xs transition ${
              active
                ? "border-[#b79ce6] bg-[#b79ce6]/12 text-[#b79ce6]"
                : "border-white/15 text-white/60 hover:border-white/35"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoiceGroup({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border px-4 py-2 text-xs transition ${
              active
                ? "border-[#b79ce6] bg-[#b79ce6]/12 text-[#b79ce6]"
                : "border-white/15 text-white/60 hover:border-white/35"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function StepViagem({ data, set }: { data: FormState; set: SetField }) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        1 · Sobre a viagem
      </p>
      <FieldBlock label="WhatsApp *">
        <TextInput
          value={data.whatsapp}
          onChange={(v) => set("whatsapp", v)}
          placeholder="(11) 90000-0000"
        />
      </FieldBlock>
      <div className="grid gap-6 sm:grid-cols-2">
        <FieldBlock label="Duração total">
          <TextInput
            value={data.duracao}
            onChange={(v) => set("duracao", v)}
            placeholder="Ex: 12 dias"
          />
        </FieldBlock>
        <FieldBlock label="Cidade de partida">
          <TextInput
            value={data.cidadePartida}
            onChange={(v) => set("cidadePartida", v)}
            placeholder="Ex: São Paulo"
          />
        </FieldBlock>
      </div>
      <FieldBlock label="Quantidade e composição do grupo">
        <TextArea
          value={data.viajantes}
          onChange={(v) => set("viajantes", v)}
          placeholder="Ex: 2 adultos e 1 criança de 8 anos"
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Passagens aéreas já compradas?">
        <ChoiceGroup
          options={["Sim, já compradas", "Não, ainda não", "Ainda não decidi"]}
          value={data.passagens}
          onChange={(v) => set("passagens", v)}
        />
      </FieldBlock>
      <FieldBlock label="Faixa de orçamento estimado">
        <ChoiceGroup
          options={[
            "Até R$15.000",
            "R$15.000 – R$30.000",
            "R$30.000 – R$60.000",
            "Acima de R$60.000",
            "Prefiro conversar diretamente",
          ]}
          value={data.orcamento}
          onChange={(v) => set("orcamento", v)}
        />
      </FieldBlock>
    </div>
  );
}

function StepPerfil({
  data,
  set,
  toggle,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        2 · Perfil e ritmo
      </p>
      <FieldBlock label="Já visitou o Japão antes? Se sim, quais lugares?">
        <TextArea
          value={data.jaVisitou}
          onChange={(v) => set("jaVisitou", v)}
          placeholder="Ex: primeira vez, ou 'já fomos a Tokyo e Osaka em 2023'"
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Ritmo desejado">
        <ChoiceGroup
          options={["Dinâmico e cheio", "Equilibrado", "Tranquilo, com tempo livre"]}
          value={data.ritmo}
          onChange={(v) => set("ritmo", v)}
        />
      </FieldBlock>
      <FieldBlock label="Mobilidade física ou alguma limitação">
        <TextArea
          value={data.mobilidade}
          onChange={(v) => set("mobilidade", v)}
          placeholder="Ex: dificuldade com escadas, uso de cadeira de rodas, caminhadas longas..."
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Estilo de hospedagem preferido">
        <MultiChoiceGroup
          options={["Hotéis de luxo", "Ryokan tradicional", "Boutique", "Resorts", "Sem preferência"]}
          values={data.hospedagem}
          onToggle={(v) => toggle("hospedagem", v)}
        />
      </FieldBlock>
    </div>
  );
}

function StepInteresses({
  data,
  set,
  toggle,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        3 · Interesses e prioridades
      </p>
      <FieldBlock label="O que não pode faltar nessa viagem?">
        <TextArea
          value={data.bucketList}
          onChange={(v) => set("bucketList", v)}
          placeholder="Lugares, experiências ou coisas que fazem parte do sonho dessa viagem"
          rows={3}
        />
      </FieldBlock>
      <FieldBlock label="Temas de interesse">
        <MultiChoiceGroup
          options={[
            "Gastronomia",
            "Cultura e história",
            "Natureza e onsen",
            "Compras",
            "Arte e design",
            "Cultura pop",
            "Vida noturna",
            "Bem-estar",
            "Esportes de inverno",
          ]}
          values={data.interesses}
          onToggle={(v) => toggle("interesses", v)}
        />
      </FieldBlock>
      <FieldBlock label="O que preferem evitar?">
        <TextArea
          value={data.evitar}
          onChange={(v) => set("evitar", v)}
          placeholder="Ex: lugares muito turísticos, filas longas, determinado tipo de comida..."
          rows={2}
        />
      </FieldBlock>
    </div>
  );
}

function StepAlimentacao({
  data,
  set,
  toggle,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        4 · Alimentação
      </p>
      <FieldBlock label="Restrições alimentares ou alergias">
        <TextArea
          value={data.restricoes}
          onChange={(v) => set("restricoes", v)}
          placeholder="Ex: vegetariano, alergia a frutos do mar, sem lactose..."
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Nível de abertura culinária">
        <ChoiceGroup
          options={["Comem de tudo", "Preferem algo mais familiar", "Depende do dia"]}
          value={data.aberturaCulinaria}
          onChange={(v) => set("aberturaCulinaria", v)}
        />
      </FieldBlock>
      <FieldBlock label="Experiências gastronômicas de interesse">
        <MultiChoiceGroup
          options={["Omakase", "Kaiseki", "Restaurante estrela Michelin", "Izakaya local", "Não é prioridade"]}
          values={data.experienciasGastronomicas}
          onToggle={(v) => toggle("experienciasGastronomicas", v)}
        />
      </FieldBlock>
    </div>
  );
}

function StepOcasioes({ data, set }: { data: FormState; set: SetField }) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        5 · Ocasiões e observações
      </p>
      <FieldBlock label="Alguma ocasião especial durante a viagem?">
        <TextArea
          value={data.ocasiaoEspecial}
          onChange={(v) => set("ocasiaoEspecial", v)}
          placeholder="Ex: lua de mel, aniversário, comemoração..."
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Nível de conforto com o inglês">
        <ChoiceGroup
          options={["Fluente", "Básico", "Nenhum"]}
          value={data.ingles}
          onChange={(v) => set("ingles", v)}
        />
      </FieldBlock>
      <FieldBlock label="Alguma experiência ruim em viagens anteriores que queiram evitar?">
        <TextArea
          value={data.experienciaRuim}
          onChange={(v) => set("experienciaRuim", v)}
          placeholder="Opcional"
          rows={2}
        />
      </FieldBlock>
      <FieldBlock label="Algo mais que devemos saber?">
        <TextArea
          value={data.observacoes}
          onChange={(v) => set("observacoes", v)}
          placeholder="Opcional"
          rows={2}
        />
      </FieldBlock>
    </div>
  );
}

function StepRevisao({ data }: { data: FormState }) {
  const rows: [string, string][] = [
    ["WhatsApp", data.whatsapp],
    ["Duração", data.duracao],
    ["Cidade de partida", data.cidadePartida],
    ["Viajantes", data.viajantes],
    ["Passagens", data.passagens],
    ["Orçamento", data.orcamento],
    ["Viagens anteriores ao Japão", data.jaVisitou],
    ["Ritmo", data.ritmo],
    ["Hospedagem", data.hospedagem.join(", ")],
    ["Interesses", data.interesses.join(", ")],
    ["Restrições alimentares", data.restricoes],
    [
      "Experiências gastronômicas",
      data.experienciasGastronomicas.join(", "),
    ],
    ["Ocasião especial", data.ocasiaoEspecial],
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        6 · Revisão
      </p>
      <p className="text-sm text-white/50">
        Confira as principais informações antes de enviar. Você pode voltar
        para ajustar qualquer campo.
      </p>
      <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[140px_1fr] gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/35">
                {label}
              </span>
              <span className="text-white/80">{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
