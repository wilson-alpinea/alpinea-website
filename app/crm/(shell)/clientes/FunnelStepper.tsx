import type { Cliente, Estagio } from "@/lib/crm/types";

const NAVY = "#1C3A5E";
const VERDE = "rgba(58,140,90,1)";
const VERMELHO = "rgba(190,70,70,1)";
const PENDENTE = "rgba(0,0,0,0.15)";

type Step = {
  key: string;
  label: string;
  data: string | null | undefined;
};

function formatarData(valor: string | null | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

// Ícone de check — usado dentro do círculo de uma etapa já concluída.
function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

// Ícone de "x" — usado quando o cliente foi perdido (etapa final em vermelho).
function IconeX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

// Pedido do Wilson, 18/set/2026 ("o fluxograma de etapas parece feito por
// uma criança"): o layout anterior usava setas (➔) soltas entre círculos
// finos — trocado por um formato de "progress tracker" padrão (o mesmo
// tipo usado em checkout/rastreio de pedido): uma linha contínua conecta
// os círculos, preenchida até a etapa atual, sem nenhuma seta/desenho.
// Círculos concluídos ganham um check branco; a etapa "Fechado" ganha um
// check (ganho) ou um X (perdido) em vez de só mudar de cor.
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
  const corFechado = perdido ? VERMELHO : ganho ? VERDE : NAVY;

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
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] px-6 py-8 sm:px-10">
      <div className="relative flex min-w-[640px] justify-between sm:min-w-0">
        {/* Trilho contínuo atrás dos círculos — vai do centro do primeiro
            ao centro do último, com a parte já percorrida preenchida. */}
        <div
          className="absolute left-[10%] right-[10%] top-4 h-[3px] rounded-full bg-black/10"
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              background: currentIndex >= steps.length - 1 ? corFechado : NAVY,
            }}
          />
        </div>

        {steps.map((step, i) => {
          const completo = i < currentIndex;
          const isAtual = i === currentIndex;
          const ehFechado = step.key === "fechado";
          const fechadoResolvido = ehFechado && isAtual && (ganho || perdido);

          let cor = PENDENTE;
          let preenchido = false;

          if (completo) {
            cor = NAVY;
            preenchido = true;
          }
          if (isAtual && !ehFechado) {
            cor = NAVY;
          }
          if (fechadoResolvido) {
            cor = corFechado;
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
                {completo && <IconeCheck />}
                {fechadoResolvido && ganho && <IconeCheck />}
                {fechadoResolvido && perdido && <IconeX />}
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
