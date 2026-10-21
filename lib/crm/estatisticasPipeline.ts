import { ESTAGIOS } from "./estagios";
import type { Estagio } from "./types";
import { CANAL_LABEL, isCanal } from "./canal";

// Estatísticas do funil (Wilson, 21/out/2026): "taxa de conversão, etc —
// mesmo tendo sido arquivado entra na estatística geral para entendermos
// tempo de conversão e onde está desistindo".
//
// - Base: todos os leads criados no período, INCLUSIVE arquivados.
// - Etapa alcançada: maior etapa do funil que o lead já teve (histórico de
//   mudanças em `interacoes` + etapa atual).
// - Desistência: lead perdido conta na etapa em que estava antes de ir
//   para "perdido"; lead arquivado sem fechar conta na etapa em que parou.

export type LeadEstatistica = {
  id: string;
  created_at: string;
  estagio: Estagio;
  canal: string | null;
  arquivado_em: string | null;
  valor_proposta: number | null;
};
export type MudancaEstagio = {
  cliente_id: string;
  estagio_destino: Estagio | null;
  data_evento: string | null;
  created_at: string;
};

// Etapas "abertas" na ordem do funil (sem ganho/perdido).
const ETAPAS_ABERTAS: Estagio[] = ["novo_lead", "qualificacao", "proposta_enviada", "negociacao"];
const ORDEM: Record<string, number> = { novo_lead: 0, qualificacao: 1, proposta_enviada: 2, negociacao: 3, fechado_ganho: 4 };
const DIA = 86_400_000;

const dataDe = (m: MudancaEstagio) => {
  const t = Date.parse(m.data_evento ? `${m.data_evento.slice(0, 10)}T12:00:00Z` : m.created_at);
  return Number.isFinite(t) ? t : Date.parse(m.created_at);
};

export type LinhaEtapa = { estagio: Estagio; label: string; alcancaram: number; perdidos: number; arquivados: number; diasMedioAteChegar: number | null };
export type LinhaCanal = { canal: string; label: string; leads: number; ganhos: number; perdidos: number; conversao: number | null; diasMedioAteFechar: number | null; valorGanho: number };
export type Estatisticas = {
  total: number;
  ganhos: number;
  perdidos: number;
  arquivados: number;
  abertos: number;
  conversao: number | null; // ganhos / leads
  taxaVitoria: number | null; // ganhos / (ganhos + perdidos)
  diasMedioAteFechar: number | null;
  diasMedianaAteFechar: number | null;
  valorGanho: number;
  etapas: LinhaEtapa[];
  canais: LinhaCanal[];
};

const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
const mediana = (v: number[]) => {
  if (!v.length) return null;
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

export function calcularEstatisticas(leads: LeadEstatistica[], mudancas: MudancaEstagio[]): Estatisticas {
  const porLead = new Map<string, MudancaEstagio[]>();
  for (const m of mudancas) {
    if (!m.estagio_destino) continue;
    const l = porLead.get(m.cliente_id) ?? [];
    l.push(m);
    porLead.set(m.cliente_id, l);
  }
  for (const l of porLead.values()) l.sort((a, b) => dataDe(a) - dataDe(b));

  const etapas = new Map<Estagio, { alcancaram: number; perdidos: number; arquivados: number; dias: number[] }>();
  for (const e of [...ETAPAS_ABERTAS, "fechado_ganho" as Estagio]) etapas.set(e, { alcancaram: 0, perdidos: 0, arquivados: 0, dias: [] });

  const canais = new Map<string, { leads: number; ganhos: number; perdidos: number; dias: number[]; valor: number }>();
  const diasFechamento: number[] = [];
  let ganhos = 0, perdidos = 0, arquivados = 0, abertos = 0, valorGanho = 0;

  for (const lead of leads) {
    const historico = porLead.get(lead.id) ?? [];
    const criado = Date.parse(lead.created_at);

    // Primeira data em que chegou em cada etapa.
    const chegada = new Map<Estagio, number>([["novo_lead", criado]]);
    for (const m of historico) if (!chegada.has(m.estagio_destino!)) chegada.set(m.estagio_destino!, dataDe(m));
    if (!chegada.has(lead.estagio)) chegada.set(lead.estagio, criado);

    // Maior etapa alcançada (perdido não conta como avanço).
    let maior = 0;
    for (const e of chegada.keys()) if (e in ORDEM) maior = Math.max(maior, ORDEM[e]);

    for (const [e, ordem] of Object.entries(ORDEM) as [Estagio, number][]) {
      if (ordem > maior) continue;
      const linha = etapas.get(e)!;
      linha.alcancaram++;
      const t = chegada.get(e);
      if (t !== undefined && e !== "novo_lead") linha.dias.push(Math.max(0, (t - criado) / DIA));
    }

    const canal = lead.canal && isCanal(lead.canal) ? lead.canal : "sem_origem";
    const c = canais.get(canal) ?? { leads: 0, ganhos: 0, perdidos: 0, dias: [], valor: 0 };
    c.leads++;

    if (lead.estagio === "fechado_ganho") {
      ganhos++;
      c.ganhos++;
      valorGanho += lead.valor_proposta ?? 0;
      c.valor += lead.valor_proposta ?? 0;
      const t = chegada.get("fechado_ganho");
      if (t !== undefined) {
        const d = Math.max(0, (t - criado) / DIA);
        diasFechamento.push(d);
        c.dias.push(d);
      }
    } else if (lead.estagio === "fechado_perdido") {
      perdidos++;
      c.perdidos++;
      // Etapa em que estava antes de ir para "perdido".
      const idxPerda = historico.findIndex((m) => m.estagio_destino === "fechado_perdido");
      const anteriores = (idxPerda >= 0 ? historico.slice(0, idxPerda) : historico).filter((m) => ETAPAS_ABERTAS.includes(m.estagio_destino!));
      const etapaAnterior = anteriores.at(-1)?.estagio_destino ?? "novo_lead";
      etapas.get(etapaAnterior)!.perdidos++;
    } else if (lead.arquivado_em) {
      arquivados++;
      if (ETAPAS_ABERTAS.includes(lead.estagio)) etapas.get(lead.estagio)!.arquivados++;
    } else {
      abertos++;
    }
    canais.set(canal, c);
  }

  const total = leads.length;
  return {
    total,
    ganhos,
    perdidos,
    arquivados,
    abertos,
    conversao: total ? ganhos / total : null,
    taxaVitoria: ganhos + perdidos ? ganhos / (ganhos + perdidos) : null,
    diasMedioAteFechar: media(diasFechamento),
    diasMedianaAteFechar: mediana(diasFechamento),
    valorGanho,
    etapas: [...etapas.entries()].map(([estagio, l]) => ({
      estagio,
      label: ESTAGIOS.find((e) => e.valor === estagio)?.label ?? estagio,
      alcancaram: l.alcancaram,
      perdidos: l.perdidos,
      arquivados: l.arquivados,
      diasMedioAteChegar: media(l.dias),
    })),
    canais: [...canais.entries()]
      .map(([canal, c]) => ({
        canal,
        label: canal === "sem_origem" ? "Sem origem identificada" : CANAL_LABEL[canal as keyof typeof CANAL_LABEL],
        leads: c.leads,
        ganhos: c.ganhos,
        perdidos: c.perdidos,
        conversao: c.leads ? c.ganhos / c.leads : null,
        diasMedioAteFechar: media(c.dias),
        valorGanho: c.valor,
      }))
      .sort((a, b) => b.leads - a.leads),
  };
}
