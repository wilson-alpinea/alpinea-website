"use client";

import { ALERTA, AREA_EMPREGOS, EXPLICACAO_SCORE, TRIAGEM_EMPREGOS } from "@/lib/crm/temaEmpregos";

// Cards "Triagem" e "Processo seletivo" da candidatura (redesenho
// 23/out/2026), no mesmo padrão dos cards do cliente no CRM de Viagens.
// O total de etapas vem da linha do tempo real da vaga (linhaTempoCandidatura).
// A barra só leva aos detalhes; mudar etapa continua sendo pela ação explícita.

export type EtapaCard = { label: string; quando: string | null; ok: boolean };

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const limpar = (l: string) => {
  const t = l.replace(/^Etapa \d — /, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export function CardsCandidatura({
  classificacao,
  pontuacao,
  motivos,
  pontosRevisar,
  reclassificacao,
  status,
  etapas,
}: {
  classificacao: "aprovado_alto" | "aprovado_baixo" | "eliminado";
  pontuacao: number | null;
  motivos: number;
  pontosRevisar: number;
  reclassificacao: string | null;
  status: string;
  etapas: EtapaCard[];
}) {
  const t = TRIAGEM_EMPREGOS[classificacao];
  const n = etapas.length;
  const eliminado = classificacao === "eliminado";
  const reprovado = status === "reprovado";
  const atual = etapas.findIndex((e) => !e.ok);
  const concluido = atual === -1;
  const situacao = eliminado ? "eliminado" : reprovado ? "reprovado" : concluido ? "concluido" : "andamento";
  const ultimaOk = [...etapas].map((e, i) => ({ e, i })).filter((x) => x.e.ok && (atual === -1 || x.i < atual)).at(-1);
  const proxima = atual >= 0 ? etapas[atual + 1] : undefined;
  const p = AREA_EMPREGOS.principal;

  const corSeg = (i: number) => {
    if (situacao === "eliminado" || situacao === "reprovado") return etapas[i].ok ? "#B9C4C0" : i === (atual === -1 ? n - 1 : atual) ? ALERTA.cor : "#E6ECE9";
    if (situacao === "concluido") return "#4F8D81";
    if (i === atual) return "#4F8D81";
    return etapas[i].ok ? p.cor : "#E6ECE9";
  };
  const situacaoSeg = (i: number) => (etapas[i].ok ? "concluída" : i === atual ? "etapa atual" : "pendente");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Triagem */}
      <section className={`rounded-2xl border border-t-[3px] border-[#DEE6E2] p-5 ${SOMBRA}`} style={{ backgroundColor: AREA_EMPREGOS.proposta.fundo, borderTopColor: AREA_EMPREGOS.proposta.cor }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 style={{ color: AREA_EMPREGOS.proposta.cor }}>Triagem</h2>
          <span className="cursor-help text-[13px] text-[#626E69] underline decoration-dotted underline-offset-2" title={EXPLICACAO_SCORE}>
            O que é o score?
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium" style={{ color: t.cor, backgroundColor: eliminado ? t.fundo : "#FFFFFF" }}>
            {t.rotulo}
          </span>
          <span>
            <span className="text-[28px] font-semibold leading-none tabular-nums text-[#202B28]">{pontuacao ?? "—"}</span>
            <span className="ml-1 text-[13px] text-[#626E69]">{pontuacao === null ? "Score não calculado" : "de 100"}</span>
          </span>
        </div>
        <ul className="mt-3 space-y-0.5 text-[13px] text-[#626E69]">
          {motivos > 0 && <li className="font-medium text-[#B42318]">{motivos} {motivos === 1 ? "critério eliminatório não atendido" : "critérios eliminatórios não atendidos"}</li>}
          {pontosRevisar > 0 && <li>{pontosRevisar} {pontosRevisar === 1 ? "ponto" : "pontos"} para revisar</li>}
          {reclassificacao && <li className="font-medium text-[#93703D]">{reclassificacao}</li>}
        </ul>
        <a href="#criterios" className="mt-3 inline-block text-sm font-medium text-[#27675B] hover:underline">
          Ver critérios registrados
        </a>
      </section>

      {/* Processo seletivo */}
      <section className={`rounded-2xl border border-t-[3px] border-[#DEE6E2] p-5 ${SOMBRA}`} style={{ backgroundColor: p.fundo, borderTopColor: p.cor }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 style={{ color: p.cor }}>Processo seletivo</h2>
          <span className={`text-[12px] font-semibold tabular-nums ${situacao === "eliminado" || situacao === "reprovado" ? "text-[#B42318]" : "text-[#626E69]"}`}>
            {situacao === "concluido" ? `${n} de ${n} etapas concluídas` : situacao === "andamento" ? `Etapa ${atual + 1} de ${n}` : "Processo encerrado"}
          </span>
        </div>
        <div className="mt-4 flex gap-1" role="list" aria-label="Etapas do processo seletivo">
          {etapas.map((e, i) => (
            <a
              key={e.label}
              role="listitem"
              href="#andamento"
              className="group relative flex h-4 flex-1 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27675B]/40"
              aria-label={`${limpar(e.label)}: ${situacaoSeg(i)}. Ver andamento`}
            >
              <span className={`block w-full rounded-full ${i === atual && situacao === "andamento" ? "h-2 shadow-[0_0_0_1px_#fff,0_0_0_2.5px_#4F8D81]" : "h-1.5"}`} style={{ backgroundColor: corSeg(i) }} />
              <span role="tooltip" className={`pointer-events-none absolute bottom-full z-10 mb-1.5 whitespace-nowrap rounded-md bg-[#202B28] px-2 py-1 text-[12px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${i === 0 ? "left-0" : i === n - 1 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
                {limpar(e.label)} · {situacaoSeg(i)}
              </span>
            </a>
          ))}
        </div>
        <p className="crm-etapa mt-4 text-[#202B28]">
          {situacao === "eliminado"
            ? "Eliminado na triagem"
            : situacao === "reprovado"
              ? "Encerrado — reprovado pela equipe"
              : situacao === "concluido"
                ? "Processo concluído"
                : limpar(etapas[atual].label)}
        </p>
        {situacao === "andamento" && ultimaOk?.e.quando && <p className="text-[13px] tabular-nums text-[#626E69]">Etapa anterior concluída em {ultimaOk.e.quando}</p>}
        {situacao === "andamento" && proxima && (
          <p className="mt-1.5 text-sm text-[#626E69]">
            Próxima etapa: <span className="text-[#202B28]">{limpar(proxima.label)}</span>
          </p>
        )}
        <a href="#andamento" className="mt-3 inline-block text-sm font-medium text-[#27675B] hover:underline">
          Ver andamento e avançar etapa
        </a>
      </section>
    </div>
  );
}
