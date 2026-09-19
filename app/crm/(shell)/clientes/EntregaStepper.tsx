import type { Cliente, EstagioEntrega } from "@/lib/crm/types";
import { ESTAGIOS_ENTREGA } from "@/lib/crm/estagiosEntrega";
import { EstagioSelect } from "../pipeline/EstagioSelect";

const NAVY = "#1C3A5E";
const VERDE = "rgba(58,140,90,1)";
const PENDENTE = "rgba(0,0,0,0.15)";

const ORDEM: EstagioEntrega[] = [
  "roteiro_elaboracao",
  "roteiro_entregue",
  "reservas_confirmadas",
  "viagem_andamento",
  "concluida",
];

type Step = {
  key: EstagioEntrega;
  label: string;
  data: string | null | undefined;
};

function formatarData(valor: string | null | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

// Segundo fluxograma pedido pelo Wilson, 19/set/2026 ("um novo fluxograma
// de entrega abaixo do de vendas"): acompanha a ENTREGA do serviço (montar
// roteiro, confirmar reservas, viagem) — processo separado do funil de
// VENDA (FunnelStepper). Mesma linguagem visual (linha contínua + círculos
// com check), mas sem a bifurcação ganho/perdido: é sempre uma progressão
// linear até "Concluída".
export function EntregaStepper({
  cliente,
  datasPorEstagioEntrega,
  action,
}: {
  cliente: Cliente;
  datasPorEstagioEntrega: Partial<Record<EstagioEntrega, string>>;
  action: (formData: FormData) => void;
}) {
  const atual = cliente.estagio_entrega;
  const currentIndex = Math.max(0, ORDEM.indexOf(atual));
  const concluido = atual === "concluida";

  const steps: Step[] = [
    { key: "roteiro_elaboracao", label: "Roteiro em Elaboração", data: datasPorEstagioEntrega.roteiro_elaboracao ?? cliente.created_at },
    { key: "roteiro_entregue", label: "Roteiro Entregue", data: datasPorEstagioEntrega.roteiro_entregue },
    { key: "reservas_confirmadas", label: "Reservas Confirmadas", data: datasPorEstagioEntrega.reservas_confirmadas },
    { key: "viagem_andamento", label: "Viagem em Andamento", data: datasPorEstagioEntrega.viagem_andamento },
    { key: "concluida", label: "Concluída", data: datasPorEstagioEntrega.concluida },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] px-6 py-8 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/35">
          Entrega da viagem
        </p>
        <div className="w-48">
          <EstagioSelect
            action={action}
            estagios={ESTAGIOS_ENTREGA}
            estagioAtual={atual}
            className="w-full cursor-pointer rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-black/70 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
          />
        </div>
      </div>
      <div className="relative flex min-w-[640px] justify-between sm:min-w-0">
        {/* Mesmo trilho contínuo do funil de vendas — ver FunnelStepper. */}
        <div className="absolute left-[10%] right-[10%] top-4 h-[3px] rounded-full bg-black/10" aria-hidden>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              background: concluido ? VERDE : NAVY,
            }}
          />
        </div>

        {steps.map((step, i) => {
          const completo = i < currentIndex;
          const isAtual = i === currentIndex;
          const finalizado = isAtual && concluido;

          let cor = PENDENTE;
          let preenchido = false;

          if (completo) {
            cor = NAVY;
            preenchido = true;
          }
          if (isAtual && !concluido) {
            cor = NAVY;
          }
          if (finalizado) {
            cor = VERDE;
            preenchido = true;
          }

          return (
            <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center gap-2.5 text-center">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: preenchido ? cor : "#fff",
                  border: `2.5px solid ${cor}`,
                  boxShadow:
                    isAtual && !preenchido
                      ? `0 0 0 5px ${cor}1f, 0 2px 6px rgba(0,0,0,0.1)`
                      : `0 1px 3px rgba(0,0,0,0.1)`,
                }}
              >
                {(completo || finalizado) && <IconeCheck />}
              </span>
              <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.06em] text-black/75">
                {step.label}
              </span>
              <span className="text-[11px] text-black/40">{formatarData(step.data)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
