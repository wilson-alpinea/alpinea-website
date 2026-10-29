import { ETAPAS_MANUAIS, lerAndamentoManual, type EtapaManualId, type MarcaEtapa } from "./andamentoManual";
import { vagaPrecisaProposta } from "@/app/lib/etapasCandidatura";
import { lerEstadoTestes, vagaExigeTestesAptidao } from "@/app/lib/testesAptidao";

// Linha do tempo da candidatura (etapas automáticas + marcadas à mão).
// Extraída de app/crm/(shell)/empregos/[id]/page.tsx para ser usada também
// no portal da empreiteira (Wilson, 21/out/2026).

export type EtapaLinhaTempo = { label: string; quando: string | null; ok: boolean; id?: EtapaManualId; manual?: MarcaEtapa };

type CandidaturaLinhaTempo = {
  vaga_id: string;
  created_at: string;
  testes_aptidao?: unknown;
  testes_aptidao_aprovado?: boolean | null;
  ficha_enviada_em?: string | null;
  foto_path?: string | null;
  proposta_status?: string | null;
  proposta_respondida_em?: string | null;
  andamento_manual?: unknown;
  respostas?: unknown;
};

export const dataCurtaSP = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;

export function linhaTempoCandidatura(
  c: CandidaturaLinhaTempo,
  entrevista: { inicio: string; status: string } | null,
): EtapaLinhaTempo[] {
  const dataCurta = dataCurtaSP;
  const linhaTempoAuto: EtapaLinhaTempo[] = [
    { label: "Etapa 1 — candidatura e triagem", quando: dataCurta(c.created_at), ok: true },
    ...(vagaExigeTestesAptidao(c.vaga_id)
      ? [
          {
            label: `Testes de aptidão${c.testes_aptidao_aprovado === false ? " (reprovado)" : ""}`,
            quando: dataCurta(lerEstadoTestes(c.testes_aptidao).concluidoEm),
            ok: c.testes_aptidao_aprovado === true,
          },
        ]
      : []),
    { id: "ficha", label: "Etapa 2 — ficha cadastral + foto", quando: dataCurta(c.ficha_enviada_em), ok: Boolean(c.ficha_enviada_em && c.foto_path) },
    ...(vagaPrecisaProposta(c.vaga_id)
      ? [
          {
            id: "proposta" as const,
            label: `Etapa 3 — proposta${c.proposta_status === "falar_ajisai" ? " (pediu para falar com a Ajisai)" : ""}`,
            quando: dataCurta(c.proposta_respondida_em),
            ok: c.proposta_status === "aceita",
          },
        ]
      : []),
    {
      id: "preEntrevista",
      label: `Etapa 4 — pré-entrevista${entrevista && entrevista.status !== "agendada" ? ` (${entrevista.status})` : ""}`,
      quando: dataCurta(entrevista?.inicio),
      ok: Boolean(entrevista && entrevista.status !== "cancelada"),
    },
  ];
  const andamento = lerAndamentoManual(c.andamento_manual);
  const respostas = (c.respostas ?? {}) as Record<string, unknown>;
  const etapasPosteriores: EtapaManualId[] = ["empreiteira", "entrevistaFinal", ...(respostas.reEntry === "sim" ? [] : (["documentacao"] as const)), "embarque", "inicio", "posVenda"];
  return [
    ...linhaTempoAuto,
    ...etapasPosteriores.map((eid) => ({ id: eid, label: ETAPAS_MANUAIS.find((e) => e.id === eid)!.label, quando: null as string | null, ok: false })),
  ].map((e) => {
    const manual = e.id ? andamento.etapas[e.id] : undefined;
    return manual && !e.ok ? { ...e, ok: true, quando: dataCurta(manual.em), manual } : { ...e, manual: undefined };
  });
}
