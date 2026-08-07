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
    <div className="rounded-2xl border border-black/10 bg-[#57534E]/[0.05] px-5 py-6 sm:px-8">
      <div className="flex items-start">
        {steps.map((step, i) => {
          const completo = i < currentIndex;
          const isAtual = i === currentIndex;
          const ehFechado = step.key === "fechado";

          let cor = "rgba(0,0,0,0.15)"; // pendente
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
            <div key={step.key} className="flex flex-1 items-start last:flex-none last:items-start">
              <div className="flex w-20 flex-col items-center gap-1.5 text-center sm:w-28">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{
                    background: preenchido ? cor : "#fff",
                    border: `2px solid ${cor}`,
                    boxShadow: isAtual && !preenchido ? `0 0 0 4px ${cor}22` : undefined,
                  }}
                />
                <span className="text-[10px] font-medium uppercase leading-tight tracking-[0.06em] text-black/70">
                  {step.label}
                </span>
                <span className="text-[10px] text-black/35">{formatarData(step.data)}</span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className="mt-[7px] h-px flex-1"
                  style={{ background: i < currentIndex ? NAVY : "rgba(0,0,0,0.1)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
