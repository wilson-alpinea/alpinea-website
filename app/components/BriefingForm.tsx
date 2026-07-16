"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const STORAGE_KEY = "ajisai-briefing-draft";

type FormState = {
  nome: string;
  whatsapp: string;
  dataInicio: string;
  dataFim: string;
  cidadePartida: string;
  aeroportoPartida: string;
  adultos: string;
  criancas: string;
  idadesCriancas: string;
  passagens: string;
  orcamento: string;
  orcamentoOutros: string;
  jaVisitou: string;
  ritmo: string;
  mobilidade: string;
  hospedagem: string[];
  prioridadesHospedagem: string[];
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
  nome: "",
  whatsapp: "",
  dataInicio: "",
  dataFim: "",
  cidadePartida: "",
  aeroportoPartida: "",
  adultos: "",
  criancas: "",
  idadesCriancas: "",
  passagens: "",
  orcamento: "",
  orcamentoOutros: "",
  jaVisitou: "",
  ritmo: "",
  mobilidade: "",
  hospedagem: [],
  prioridadesHospedagem: [],
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

type ArrayField =
  | "hospedagem"
  | "prioridadesHospedagem"
  | "interesses"
  | "experienciasGastronomicas";
type SetField = (key: keyof FormState, value: string | string[]) => void;
type ToggleField = (key: ArrayField, value: string) => void;
type ActiveField = keyof FormState | null;
type SetActiveField = (key: ActiveField) => void;

function hasText(v: string) {
  return v.trim().length > 0;
}

function hasItems(v: string[]) {
  return v.length > 0;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const STEP_LABELS = [
  "Sobre a viagem",
  "Perfil e ritmo",
  "Interesses",
  "Alimentação",
  "Ocasiões",
  "Revisão",
];

const BUDGET_OPTIONS = [
  {
    label: "Econômico",
    description:
      "Hotéis 3★ e business hotels (ex: Toyoko Inn, APA Hotel). Quartos compactos, de 13 a 16m².",
  },
  {
    label: "Confortável",
    description:
      "Hotéis 4★ bem localizados (ex: Richmond Hotel, Hotel Gracery). Quartos de 20 a 25m².",
  },
  {
    label: "Premium",
    description:
      "Hotéis 5★ internacionais (ex: Hyatt Regency, Conrad Tokyo). Quartos de 30 a 40m², vistas privilegiadas.",
  },
  {
    label: "Luxo",
    description:
      "Hotéis de altíssimo padrão (ex: Aman Tokyo, Park Hyatt, Ritz-Carlton). Suítes a partir de 50m².",
  },
  {
    label: "Outros",
    description: "Prefere descrever com suas próprias palavras.",
  },
];

const PACE_OPTIONS = [
  {
    label: "Tranquilo, com tempo livre",
    description:
      "1 atração de manhã e 1 à tarde, com bastante tempo livre para descansar ou explorar sem pressa.",
  },
  {
    label: "Equilibrado",
    description:
      "2 a 3 atrações por dia, intercalando passeios com pausas e tempo livre.",
  },
  {
    label: "Dinâmico e cheio",
    description:
      "3 a 4 atrações por dia, agenda cheia e pouco tempo livre.",
  },
];

function IconViagem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.289Z" />
    </svg>
  );
}

function IconPerfil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.416-.323.578-.874.409-1.412a7.002 7.002 0 0 0-13.074.005Z" />
    </svg>
  );
}

function IconInteresses({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656Z" />
    </svg>
  );
}

function IconAlimentacao({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
      <path d="M19 15v7" />
    </svg>
  );
}

function IconOcasioes({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C9 2 12 7 12 7Z" />
    </svg>
  );
}

function IconRevisao({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 13.5 2 2 4-4.5" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.006l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.796 2.796 6.79-6.888a1 1 0 0 1 1.414-.014Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function IconGastronomia({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
      <path d="M19 15v7" />
    </svg>
  );
}

function IconCultura({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 5.5h17" />
      <path d="M2.5 8.5h19" />
      <path d="M6.5 8.5v12" />
      <path d="M17.5 8.5v12" />
    </svg>
  );
}

function IconOnsen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M3 13c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M3 18c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
    </svg>
  );
}

function IconCompras({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 8h14l-1.2 12H6.2Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function IconArte({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.6 2-1.7 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .9-1.7 1.9-1.7h2.1a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="10.5" cy="7" r="1" />
      <circle cx="15" cy="8" r="1" />
    </svg>
  );
}

function IconCulturaPop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7l1.5-2h5L16 7" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function IconVidaNoturna({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 12.6A8.5 8.5 0 1 1 11.4 4a6.6 6.6 0 0 0 8.6 8.6Z" />
      <path d="M17 3.5 17.5 5 19 5.5 17.5 6 17 7.5 16.5 6 15 5.5 16.5 5Z" />
    </svg>
  );
}

function IconBemEstar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 21c8-1 13-6 14-14-8 1-13 6-14 14Z" />
      <path d="M5 21c1-4 3-7 6-9" />
    </svg>
  );
}

function IconEsportesInverno({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20" />
      <path d="M4.2 6.5 19.8 17.5" />
      <path d="M4.2 17.5 19.8 6.5" />
      <path d="M9 4.3 12 6l3-1.7" />
      <path d="M9 19.7 12 18l3 1.7" />
    </svg>
  );
}

const INTEREST_OPTIONS = [
  { label: "Gastronomia", Icon: IconGastronomia },
  { label: "Cultura e história", Icon: IconCultura },
  { label: "Natureza e onsen", Icon: IconOnsen },
  { label: "Compras", Icon: IconCompras },
  { label: "Arte e design", Icon: IconArte },
  { label: "Cultura pop", Icon: IconCulturaPop },
  { label: "Vida noturna", Icon: IconVidaNoturna },
  { label: "Bem-estar", Icon: IconBemEstar },
  { label: "Esportes de inverno", Icon: IconEsportesInverno },
];

const STEP_ICONS = [
  IconViagem,
  IconPerfil,
  IconInteresses,
  IconAlimentacao,
  IconOcasioes,
  IconRevisao,
];

export default function BriefingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(emptyState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);
  const [activeField, setActiveField] = useState<keyof FormState | null>(null);
  const hydrated = useRef(false);

  const totalSteps = STEP_LABELS.length;
  const progressPercent = Math.round((step / (totalSteps - 1)) * 100);

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

  const canAdvanceFromStep0 =
    data.nome.trim().length > 0 && data.whatsapp.trim().length > 0;

  // Carrega rascunho salvo ao abrir a página.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch {
      // ignora rascunhos corrompidos
    }
    hydrated.current = true;
  }, []);

  // Auto-save do rascunho com debounce.
  useEffect(() => {
    if (!hydrated.current) return;
    const handle = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSavedMessage(true);
        const hide = setTimeout(() => setSavedMessage(false), 2200);
        return () => clearTimeout(hide);
      } catch {
        // ignora falha de storage (modo privado, quota, etc.)
      }
    }, 600);
    return () => clearTimeout(handle);
  }, [data]);

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
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignora
      }
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
            Informações para montagem de roteiro
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            Seja o mais detalhado possível ao fornecer informações e
            preferências, assim conseguimos montar o roteiro ideal para você
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span>
              Etapa {step + 1} de {totalSteps}
            </span>
            <span className="text-[#b79ce6]">{progressPercent}% concluído</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#b79ce6] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1.5 h-4 text-right">
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#b79ce6] transition-opacity duration-500 ${
                savedMessage ? "opacity-100" : "opacity-0"
              }`}
            >
              <IconCheck className="h-3 w-3" />
              Alterações salvas
            </span>
          </div>
        </div>

        <div className="my-6 flex items-center">
          {STEP_LABELS.map((label, index) => {
            const Icon = STEP_ICONS[index];
            const active = index <= step;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex w-16 shrink-0 flex-col items-center gap-2 sm:w-20">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      active
                        ? "bg-[#b79ce6] text-black"
                        : "border border-white/15 text-white/40"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`hidden h-12 flex-col items-center gap-1 md:flex ${
                      active ? "text-[#b79ce6]" : "text-white/30"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-center text-[9px] uppercase leading-tight tracking-[0.15em]">
                      {label}
                    </span>
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div className="flex flex-1 items-center justify-center px-1">
                    <IconChevronRight
                      className={`h-4 w-4 ${
                        index < step ? "text-[#b79ce6]" : "text-white/20"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:rounded-[2rem] sm:p-10">
          {step === 0 && (
            <StepViagem
              data={data}
              set={set}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
          {step === 1 && (
            <StepPerfil
              data={data}
              set={set}
              toggle={toggle}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
          {step === 2 && (
            <StepInteresses
              data={data}
              set={set}
              toggle={toggle}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
          {step === 3 && (
            <StepAlimentacao
              data={data}
              set={set}
              toggle={toggle}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
          {step === 4 && (
            <StepOcasioes
              data={data}
              set={set}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
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
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white disabled:opacity-0"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
              Voltar
            </button>

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 0 && !canAdvanceFromStep0}
                className="group flex items-center gap-2 rounded-full bg-[#b79ce6] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-[#c7b0f0] disabled:cursor-not-allowed disabled:bg-white disabled:text-black disabled:opacity-30"
              >
                Continuar
                <IconChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="group flex items-center gap-2 rounded-full bg-[#b79ce6] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-[#c7b0f0] disabled:opacity-50"
              >
                {status === "submitting" ? "Enviando..." : "Enviar briefing"}
                {status !== "submitting" && (
                  <IconChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {step < totalSteps - 1 && (
          <p className="mt-4 text-center text-[11px] text-white/30">
            Você poderá revisar todas as respostas antes do envio.
          </p>
        )}
      </div>
    </main>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
        <span className="h-1 w-1 shrink-0 rounded-full bg-[#b79ce6]/70" />
        {title}
      </p>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  complete,
  children,
}: {
  label: string;
  hint?: string;
  complete?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <label className="block text-[11px] uppercase tracking-[0.25em] text-white/35">
          {label}
        </label>
        {complete && (
          <IconCheck className="h-3.5 w-3.5 shrink-0 text-[#b79ce6]" />
        )}
      </div>
      {children}
      {hint && (
        <p className="mt-1.5 text-[11px] leading-5 text-white/30">{hint}</p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#b79ce6]/60"
    />
  );
}

function DateInput({
  value,
  onChange,
  onFocus,
  onBlur,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      min={min}
      max={max}
      className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition [color-scheme:dark] focus:border-[#b79ce6]/60"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
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

type InterestOption = { label: string; Icon: (props: { className?: string }) => ReactNode };

function IllustratedMultiChoiceGroup({
  options,
  values,
  onToggle,
}: {
  options: InterestOption[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map(({ label, Icon }) => {
        const active = values.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle(label)}
            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition ${
              active
                ? "border-[#b79ce6] bg-[#b79ce6]/10 text-[#b79ce6]"
                : "border-white/15 text-white/60 hover:border-white/35"
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs leading-tight">{label}</span>
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

type DescribedOption = { label: string; description: string };

function DescribedChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: DescribedOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const active = value === option.label;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.label)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              active
                ? "border-[#b79ce6] bg-[#b79ce6]/10"
                : "border-white/15 hover:border-white/30"
            }`}
          >
            <span
              className={`block text-xs font-semibold uppercase tracking-[0.15em] ${
                active ? "text-[#b79ce6]" : "text-white/70"
              }`}
            >
              {option.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-white/40">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StepViagem({
  data,
  set,
  activeField,
  setActiveField,
}: {
  data: FormState;
  set: SetField;
  activeField: ActiveField;
  setActiveField: SetActiveField;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        1 · Sobre a viagem
      </p>

      <SubSection title="Sobre você">
        <FieldBlock
          label="Nome *"
          hint="Para personalizarmos o atendimento e o roteiro."
          complete={hasText(data.nome) && activeField !== "nome"}
        >
          <TextInput
            value={data.nome}
            onChange={(v) => set("nome", v)}
            onFocus={() => setActiveField("nome")}
            onBlur={() => setActiveField(null)}
            placeholder="Seu nome completo"
          />
        </FieldBlock>
        <FieldBlock
          label="WhatsApp *"
          hint="Principal canal de contato durante o processo."
          complete={hasText(data.whatsapp) && activeField !== "whatsapp"}
        >
          <TextInput
            value={data.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            onFocus={() => setActiveField("whatsapp")}
            onBlur={() => setActiveField(null)}
            placeholder="(11) 90000-0000"
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Sobre a viagem">
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldBlock
            label="Data de início"
            hint="Define o período exato da viagem."
            complete={hasText(data.dataInicio) && activeField !== "dataInicio"}
          >
            <DateInput
              value={data.dataInicio}
              onChange={(v) => {
                set("dataInicio", v);
                if (data.dataFim && v && data.dataFim < v) {
                  set("dataFim", "");
                }
              }}
              onFocus={() => setActiveField("dataInicio")}
              onBlur={() => setActiveField(null)}
            />
          </FieldBlock>
          <FieldBlock
            label="Data de término"
            hint="Usamos para calcular a duração total."
            complete={hasText(data.dataFim) && activeField !== "dataFim"}
          >
            <DateInput
              value={data.dataFim}
              onChange={(v) => set("dataFim", v)}
              onFocus={() => setActiveField("dataFim")}
              onBlur={() => setActiveField(null)}
              min={data.dataInicio || undefined}
            />
          </FieldBlock>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldBlock
            label="Cidade de partida"
            hint="Ajuda a definir rotas e horários de voo."
            complete={hasText(data.cidadePartida) && activeField !== "cidadePartida"}
          >
            <TextInput
              value={data.cidadePartida}
              onChange={(v) => set("cidadePartida", v)}
              onFocus={() => setActiveField("cidadePartida")}
              onBlur={() => setActiveField(null)}
              placeholder="Ex: São Paulo"
            />
          </FieldBlock>
          <FieldBlock
            label="Aeroporto de partida"
            hint="Ex: GRU, CGH ou VCP, em São Paulo."
            complete={hasText(data.aeroportoPartida) && activeField !== "aeroportoPartida"}
          >
            <TextInput
              value={data.aeroportoPartida}
              onChange={(v) => set("aeroportoPartida", v)}
              onFocus={() => setActiveField("aeroportoPartida")}
              onBlur={() => setActiveField(null)}
              placeholder="Ex: GRU"
            />
          </FieldBlock>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldBlock
            label="Quantos adultos"
            hint="Define quartos e vagas necessárias."
            complete={hasText(data.adultos) && activeField !== "adultos"}
          >
            <TextInput
              value={data.adultos}
              onChange={(v) => set("adultos", v)}
              onFocus={() => setActiveField("adultos")}
              onBlur={() => setActiveField(null)}
              placeholder="Ex: 2"
            />
          </FieldBlock>
          <FieldBlock
            label="Quantas crianças"
            hint="Ajuda a ajustar atividades e hospedagem."
            complete={hasText(data.criancas) && activeField !== "criancas"}
          >
            <TextInput
              value={data.criancas}
              onChange={(v) => set("criancas", v)}
              onFocus={() => setActiveField("criancas")}
              onBlur={() => setActiveField(null)}
              placeholder="Ex: 1"
            />
          </FieldBlock>
        </div>
        <FieldBlock
          label="Idade das crianças"
          hint="Necessário apenas se houver crianças na viagem."
          complete={hasText(data.idadesCriancas) && activeField !== "idadesCriancas"}
        >
          <TextInput
            value={data.idadesCriancas}
            onChange={(v) => set("idadesCriancas", v)}
            onFocus={() => setActiveField("idadesCriancas")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: 5 e 8 anos"
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Voos">
        <FieldBlock
          label="Passagens aéreas já compradas?"
          hint="Se já compradas, ajustamos o roteiro aos horários de voo."
          complete={hasText(data.passagens)}
        >
          <ChoiceGroup
            options={["Sim, já compradas", "Não, ainda não", "Ainda não decidi"]}
            value={data.passagens}
            onChange={(v) => set("passagens", v)}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Orçamento">
        <FieldBlock
          label="Faixa de orçamento estimado"
          hint="Usamos como referência para sugerir hospedagens compatíveis."
          complete={hasText(data.orcamento)}
        >
          <DescribedChoiceGroup
            options={BUDGET_OPTIONS}
            value={data.orcamento}
            onChange={(v) => set("orcamento", v)}
          />
        </FieldBlock>
        {data.orcamento === "Outros" && (
          <FieldBlock
            label="Descreva o padrão de hospedagem que imagina"
            hint="Descreva o padrão de hospedagem que você tem em mente."
            complete={hasText(data.orcamentoOutros) && activeField !== "orcamentoOutros"}
          >
            <TextArea
              value={data.orcamentoOutros}
              onChange={(v) => set("orcamentoOutros", v)}
              onFocus={() => setActiveField("orcamentoOutros")}
              onBlur={() => setActiveField(null)}
              placeholder="Ex: hotéis boutique, entre 4 e 5 estrelas"
              rows={2}
            />
          </FieldBlock>
        )}
      </SubSection>
    </div>
  );
}

function StepPerfil({
  data,
  set,
  toggle,
  activeField,
  setActiveField,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
  activeField: ActiveField;
  setActiveField: SetActiveField;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        2 · Perfil e ritmo
      </p>

      <SubSection title="Experiência anterior">
        <FieldBlock
          label="Já visitou o Japão antes? Se sim, quais lugares?"
          hint="Evita repetir lugares já conhecidos."
          complete={hasText(data.jaVisitou) && activeField !== "jaVisitou"}
        >
          <TextArea
            value={data.jaVisitou}
            onChange={(v) => set("jaVisitou", v)}
            onFocus={() => setActiveField("jaVisitou")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: primeira vez, ou 'já fomos a Tokyo e Osaka em 2023'"
            rows={2}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Estilo de viagem">
        <FieldBlock
          label="Ritmo desejado"
          hint="Define quantas atividades incluir por dia."
          complete={hasText(data.ritmo)}
        >
          <DescribedChoiceGroup
            options={PACE_OPTIONS}
            value={data.ritmo}
            onChange={(v) => set("ritmo", v)}
          />
        </FieldBlock>
        <FieldBlock
          label="Mobilidade física ou alguma limitação"
          hint="Garante um roteiro confortável para todos."
          complete={hasText(data.mobilidade) && activeField !== "mobilidade"}
        >
          <TextArea
            value={data.mobilidade}
            onChange={(v) => set("mobilidade", v)}
            onFocus={() => setActiveField("mobilidade")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: dificuldade com escadas, uso de cadeira de rodas, caminhadas longas..."
            rows={2}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Hospedagem">
        <FieldBlock
          label="Estilo de hospedagem preferido"
          hint="Direciona as sugestões de hotéis e ryokans."
          complete={hasItems(data.hospedagem)}
        >
          <MultiChoiceGroup
            options={["Hotéis de luxo", "Ryokan tradicional", "Boutique", "Resorts", "Sem preferência"]}
            values={data.hospedagem}
            onToggle={(v) => toggle("hospedagem", v)}
          />
        </FieldBlock>
        <FieldBlock
          label="O que mais importa na escolha do hotel?"
          hint="Ajuda a filtrar as opções pelos critérios mais importantes para vocês."
          complete={hasItems(data.prioridadesHospedagem)}
        >
          <MultiChoiceGroup
            options={[
              "Vista bonita",
              "Hotel moderno (inaugurado nos últimos 5 anos)",
              "Ryokan com onsen privativo",
              "Quartos espaçosos",
              "Proximidade ao metrô",
              "Localização central",
              "Piscina ou spa",
              "Sem preferência",
            ]}
            values={data.prioridadesHospedagem}
            onToggle={(v) => toggle("prioridadesHospedagem", v)}
          />
        </FieldBlock>
      </SubSection>
    </div>
  );
}

function StepInteresses({
  data,
  set,
  toggle,
  activeField,
  setActiveField,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
  activeField: ActiveField;
  setActiveField: SetActiveField;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        3 · Interesses e prioridades
      </p>

      <SubSection title="Prioridades">
        <FieldBlock
          label="O que não pode faltar nessa viagem?"
          hint="Prioridades garantidas no roteiro final."
          complete={hasText(data.bucketList) && activeField !== "bucketList"}
        >
          <TextArea
            value={data.bucketList}
            onChange={(v) => set("bucketList", v)}
            onFocus={() => setActiveField("bucketList")}
            onBlur={() => setActiveField(null)}
            placeholder="Lugares, experiências ou coisas que fazem parte do sonho dessa viagem"
            rows={3}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Temas">
        <FieldBlock
          label="Temas de interesse"
          hint="Direciona as experiências e passeios sugeridos."
          complete={hasItems(data.interesses)}
        >
          <IllustratedMultiChoiceGroup
            options={INTEREST_OPTIONS}
            values={data.interesses}
            onToggle={(v) => toggle("interesses", v)}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Preferências">
        <FieldBlock
          label="O que preferem evitar?"
          hint="Evita desconfortos durante a viagem."
          complete={hasText(data.evitar) && activeField !== "evitar"}
        >
          <TextArea
            value={data.evitar}
            onChange={(v) => set("evitar", v)}
            onFocus={() => setActiveField("evitar")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: lugares muito turísticos, filas longas, determinado tipo de comida..."
            rows={2}
          />
        </FieldBlock>
      </SubSection>
    </div>
  );
}

function StepAlimentacao({
  data,
  set,
  toggle,
  activeField,
  setActiveField,
}: {
  data: FormState;
  set: SetField;
  toggle: ToggleField;
  activeField: ActiveField;
  setActiveField: SetActiveField;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        4 · Alimentação
      </p>

      <SubSection title="Restrições">
        <FieldBlock
          label="Restrições alimentares ou alergias"
          hint="Garante segurança nos restaurantes selecionados."
          complete={hasText(data.restricoes) && activeField !== "restricoes"}
        >
          <TextArea
            value={data.restricoes}
            onChange={(v) => set("restricoes", v)}
            onFocus={() => setActiveField("restricoes")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: vegetariano, alergia a frutos do mar, sem lactose..."
            rows={2}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Perfil culinário">
        <FieldBlock
          label="Nível de abertura culinária"
          hint="Ajusta o tipo de experiência gastronômica sugerida."
          complete={hasText(data.aberturaCulinaria)}
        >
          <ChoiceGroup
            options={["Comem de tudo", "Preferem algo mais familiar", "Depende do dia"]}
            value={data.aberturaCulinaria}
            onChange={(v) => set("aberturaCulinaria", v)}
          />
        </FieldBlock>
        <FieldBlock
          label="Experiências gastronômicas de interesse"
          hint="Prioriza reservas em experiências específicas."
          complete={hasItems(data.experienciasGastronomicas)}
        >
          <MultiChoiceGroup
            options={[
              "Omakase",
              "Kaiseki",
              "Restaurante estrela Michelin",
              "Izakaya local",
              "Yakitori",
              "Sushi tradicional",
              "Tempura",
              "Yakiniku",
              "Shabu-shabu",
              "Ramen",
              "Unagi",
              "Kaisendon",
              "Coffee shops",
              "Confeitarias",
              "Não é prioridade",
            ]}
            values={data.experienciasGastronomicas}
            onToggle={(v) => toggle("experienciasGastronomicas", v)}
          />
        </FieldBlock>
      </SubSection>
    </div>
  );
}

function StepOcasioes({
  data,
  set,
  activeField,
  setActiveField,
}: {
  data: FormState;
  set: SetField;
  activeField: ActiveField;
  setActiveField: SetActiveField;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b79ce6]">
        5 · Ocasiões e observações
      </p>

      <SubSection title="Ocasiões especiais">
        <FieldBlock
          label="Alguma ocasião especial durante a viagem?"
          hint="Permite planejar surpresas e comemorações."
          complete={hasText(data.ocasiaoEspecial) && activeField !== "ocasiaoEspecial"}
        >
          <TextArea
            value={data.ocasiaoEspecial}
            onChange={(v) => set("ocasiaoEspecial", v)}
            onFocus={() => setActiveField("ocasiaoEspecial")}
            onBlur={() => setActiveField(null)}
            placeholder="Ex: lua de mel, aniversário, comemoração..."
            rows={2}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Idioma">
        <FieldBlock
          label="Nível de conforto com o inglês"
          hint="Ajuda a definir a necessidade de guias ou tradução."
          complete={hasText(data.ingles)}
        >
          <ChoiceGroup
            options={["Fluente", "Básico", "Nenhum"]}
            value={data.ingles}
            onChange={(v) => set("ingles", v)}
          />
        </FieldBlock>
      </SubSection>

      <SubSection title="Observações">
        <FieldBlock
          label="Alguma experiência ruim em viagens anteriores que queiram evitar?"
          hint="Evita repetir problemas de viagens anteriores."
          complete={hasText(data.experienciaRuim) && activeField !== "experienciaRuim"}
        >
          <TextArea
            value={data.experienciaRuim}
            onChange={(v) => set("experienciaRuim", v)}
            onFocus={() => setActiveField("experienciaRuim")}
            onBlur={() => setActiveField(null)}
            placeholder="Opcional"
            rows={2}
          />
        </FieldBlock>
        <FieldBlock
          label="Algo mais que devemos saber?"
          hint="Qualquer detalhe adicional que julgar importante."
          complete={hasText(data.observacoes) && activeField !== "observacoes"}
        >
          <TextArea
            value={data.observacoes}
            onChange={(v) => set("observacoes", v)}
            onFocus={() => setActiveField("observacoes")}
            onBlur={() => setActiveField(null)}
            placeholder="Opcional"
            rows={2}
          />
        </FieldBlock>
      </SubSection>
    </div>
  );
}

function StepRevisao({ data }: { data: FormState }) {
  const periodo =
    data.dataInicio && data.dataFim
      ? `${formatDate(data.dataInicio)} a ${formatDate(data.dataFim)}`
      : data.dataInicio
        ? `A partir de ${formatDate(data.dataInicio)}`
        : "";

  const passageiros = [
    data.adultos && `${data.adultos} adulto(s)`,
    data.criancas &&
      `${data.criancas} criança(s)${
        data.idadesCriancas ? ` (${data.idadesCriancas})` : ""
      }`,
  ]
    .filter(Boolean)
    .join(" · ");

  const orcamento =
    data.orcamento === "Outros" && data.orcamentoOutros
      ? `Outros — ${data.orcamentoOutros}`
      : data.orcamento;

  const rows: [string, string][] = [
    ["Nome", data.nome],
    ["WhatsApp", data.whatsapp],
    ["Período da viagem", periodo],
    ["Cidade de partida", data.cidadePartida],
    ["Aeroporto de partida", data.aeroportoPartida],
    ["Passageiros", passageiros],
    ["Passagens", data.passagens],
    ["Orçamento", orcamento],
    ["Viagens anteriores ao Japão", data.jaVisitou],
    ["Ritmo", data.ritmo],
    ["Hospedagem", data.hospedagem.join(", ")],
    ["Prioridades na hospedagem", data.prioridadesHospedagem.join(", ")],
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
