import type { Cliente, Estagio } from "@/lib/crm/types";

const NAVY = "#1C3A5E";
const VERDE = "rgba(58,140,90,1)";
const VERMELHO = "rgba(190,70,70,1)";

type Step = {
  key: string;
  label: string;
  data: string | null | undefined;
};

function formatarData(valor: string | null | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function SetaDireita({ cor }: { cor: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 shrink-0"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function FunnelStepper({
  cliente,
  datasPorEstagio,
}: {
  cliente: Cliente;
  datasPorEstagio: Partial<Record<Estagio, string>>;
}) {
  const atual = cliente.estagio;

  const currentIndex =
    atual === "novo_lead"
      ? 0
      : atual === "qualificacao"
        ? 1
        : atual === "proposta_enviada"
          ? 2
          : atual === "negociacao"
            ? 3
            : 4;

  const perdido = atual === "fechado_perdido";
  const ganho = atual === "fechado_ganho";

  const steps: Step[] = [
    { key: "novo_lead", label: "Novo Lead", data: datasPorEstagio.novo_lead ?? cliente.created_at },
    { key: "qualificacao", label: "Qualificação", data: datasPorEstagio.qualificacao },
    { key: "proposta_enviada", label: "Proposta Enviada", data: datasPorEstagio.proposta_enviada },
    { key: "negociacao", label: "Em Negociação", data: datasPorEstagio.negociacao },
    {
      key: "fechado",
      label: perdido ? "Fechado — Perdido" : ganho ? "Fechado — Ganho" : "Fechado",
      data: datasPorEstagio.fechado_ganho ?? datasPorEstagio.fechado_perdido,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-[#57534E]/[0.05] px-6 py-8 sm:px-10">
      <div className="flex min-w-[720px] items-start justify-between sm:min-w-0">
        {steps.map((step, i) => {
          const completo = i < currentIndex;
          const isAtual = i === currentIndex;
          const ehFechado = step.key === "fechado";

          let cor = "rgba(0,0,0,0.18)"; // pendente
          let preenchido = false;

          if (completo) {
            cor = NAVY;
            preenchido = true;
          }
          if (isAtual && !ehFechado) {
            cor = NAVY;
          }
          if (ehFechado && ganho) {
            cor = VERDE;
            preenchido = true;
          }
          if (ehFechado && perdido) {
            cor = VERMELHO;
            preenchido = true;
          }

          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex w-28 flex-col items-center gap-2 text-center sm:w-36">
                <span
                  className="h-6 w-6 shrink-0 rounded-full"
                  style={{
                    background: preenchido ? cor : "#fff",
                    border: `3px solid ${cor}`,
                    boxShadow: isAtual && !preenchido ? `0 0 0 6px ${cor}22` : undefined,
                  }}
                />
                <span className="text-xs font-semibold uppercase leading-tight tracking-[0.06em] text-black/75">
                  {step.label}
                </span>
                <span className="text-xs text-black/40">{formatarData(step.data)}</span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex h-6 flex-1 items-center justify-center px-1">
                  <SetaDireita cor={i < currentIndex ? NAVY : "rgba(0,0,0,0.18)"} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
