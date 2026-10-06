// Área de Empregos do CRM — rótulos, cores e helpers de exibição.
// Pedido do Wilson, 06/out/2026 (ver supabase/migrations/015).

import type { ClassificacaoCandidatura } from "@/app/lib/candidaturaScoring";
import {
  ESCOLARIDADES,
  OPCOES_DALTONISMO,
  OPCOES_FINANCIAMENTO,
  OPCOES_FLEXIBILIDADE,
  OPCOES_FUMANTE,
  OPCOES_HORAS_EXTRAS,
  REGIOES_TATUAGEM,
  TAMANHOS_TATUAGEM,
  CONDICOES_VISUAIS,
  CLASSES_MEDICAMENTO,
  TIPOS_DIABETES,
  formatarCep,
  imc,
  type PerfilCandidato,
} from "@/app/lib/triagemPerfil";
import { NIVEIS_JAPONES_DETALHADOS, ASCENDENCIA_JAPONESA, QUANDO_EMBARCAR } from "@/app/lib/candidaturaScoring";

export const CLASSIFICACOES: { valor: ClassificacaoCandidatura; label: string; descricao: string; cor: string; fundo: string }[] = [
  {
    valor: "aprovado_alto",
    label: "Aprovados — score 80+",
    descricao: "Passaram nas eliminatórias com fit alto para a vaga.",
    cor: "#2f7a52",
    fundo: "rgba(47,122,82,0.08)",
  },
  {
    valor: "aprovado_baixo",
    label: "Aprovados — score abaixo de 80",
    descricao: "Passaram nas eliminatórias, fit parcial para a vaga.",
    cor: "#2f5aa8",
    fundo: "rgba(47,90,168,0.08)",
  },
  {
    valor: "eliminado",
    label: "Eliminados",
    descricao: "Reprovaram em alguma pergunta eliminatória da vaga.",
    cor: "#b04545",
    fundo: "rgba(176,69,69,0.07)",
  },
];

export function isClassificacao(v: string): v is ClassificacaoCandidatura {
  return CLASSIFICACOES.some((c) => c.valor === v);
}

export const STATUS_CANDIDATURA: { valor: string; label: string }[] = [
  { valor: "novo", label: "Novo" },
  { valor: "em_analise", label: "Em análise" },
  { valor: "aprovado", label: "Aprovado pela equipe" },
  { valor: "reprovado", label: "Reprovado pela equipe" },
];

export function isStatusCandidatura(v: string): boolean {
  return STATUS_CANDIDATURA.some((s) => s.valor === v);
}

const rot = (lista: { key: string; label: string }[], k: string | undefined | null) =>
  (k && lista.find((x) => x.key === k)?.label) || "—";
const sn = (v: string | undefined) => (v === "sim" ? "Sim" : v === "nao" ? "Não" : "—");

// Linhas [rótulo, valor, atenção?] do perfil — usadas na ficha do candidato.
export function linhasPerfil(perfil: PerfilCandidato | null | undefined): { grupo: string; linhas: [string, string, boolean][] }[] {
  if (!perfil) return [];
  const p = perfil;
  const t = p.testeDaltonismo;
  return [
    {
      grupo: "Perfil",
      linhas: [
        ["CEP de residência", p.cepResidencia ? formatarCep(p.cepResidencia) : "—", false],
        ["Peso / altura", p.pesoKg && p.alturaCm ? `${p.pesoKg} kg · ${p.alturaCm} cm · IMC ${imc(p) ?? "—"}` : "—", false],
        ["Escolaridade", rot(ESCOLARIDADES, p.escolaridade), false],
        ["Já esteve no Japão", p.jaEsteveJapao === "sim" ? `Sim — ${p.anosNoJapao ?? "?"} ano(s)` : sn(p.jaEsteveJapao), false],
        ["Filhos", p.temFilhos === "sim" ? `Sim — idades: ${p.idadesFilhos.join(", ")}` : sn(p.temFilhos), false],
        ["Tatuagem visível", p.tatuagemVisivel === "sim" ? `Sim — ${p.tatuagemRegioes.map((r) => rot(REGIOES_TATUAGEM, r)).join(", ")}; ${rot(TAMANHOS_TATUAGEM, p.tatuagemTamanho)}` : sn(p.tatuagemVisivel), p.tatuagemVisivel === "sim"],
        ["Antecedentes criminais", sn(p.antecedentesCriminais), p.antecedentesCriminais === "sim"],
      ],
    },
    {
      grupo: "Disponibilidade",
      linhas: [
        ["Horas extras", rot(OPCOES_HORAS_EXTRAS, p.horasExtras), false],
        ["Turno alternado", sn(p.turnoAlternado), p.turnoAlternado === "nao"],
        ["Província de preferência", p.provinciaPreferida || "Sem preferência", false],
        ["Flexibilidade de região", rot(OPCOES_FLEXIBILIDADE, p.flexibilidadeRegiao), false],
        ["Financiamento de custos", rot(OPCOES_FINANCIAMENTO, p.financiamentoCustos), false],
      ],
    },
    {
      grupo: "Financeiro / histórico no Japão",
      linhas: [
        ["Dívidas no Brasil", sn(p.dividasBrasil), p.dividasBrasil === "sim"],
        ["Dívidas/impostos no Japão", sn(p.dividasJapao), p.dividasJapao === "sim"],
        ["Ajuda do governo para retorno", sn(p.ajudaGovernoRetorno), p.ajudaGovernoRetorno === "sim"],
      ],
    },
    {
      grupo: `Saúde${p.consentimentoSaude ? " (consentimento LGPD dado)" : ""}`,
      linhas: [
        ["Daltonismo (declarado)", rot(OPCOES_DALTONISMO, p.daltonismo), p.daltonismo !== "nao"],
        [
          "Teste de daltonismo",
          t ? `${t.acertos}/${t.total} — ${t.aprovado ? "aprovado" : t.controleOk ? "reprovado" : "inválido (errou o controle)"}` : "Não aplicado",
          !!t && !t.aprovado,
        ],
        ["Doença grave / tratamento", p.doencaGrave === "sim" ? `Sim${p.doencaGraveDescricao ? ` (${p.doencaGraveDescricao})` : ""} — em tratamento: ${sn(p.emTratamento)}` : sn(p.doencaGrave), p.emTratamento === "sim"],
        ["Condições visuais", p.semCondicaoVisual ? "Nenhuma" : p.condicoesVisuais.map((c) => rot(CONDICOES_VISUAIS, c)).join(", ") || "—", p.condicoesVisuais.length > 0],
        ["Fumante", rot(OPCOES_FUMANTE, p.fumante), false],
        ["Medicação controlada", p.medicacaoControlada === "sim" ? p.medicacaoClasses.map((c) => rot(CLASSES_MEDICAMENTO, c)).join(", ") : sn(p.medicacaoControlada), p.medicacaoControlada === "sim"],
        ["Diabetes", p.diabetes === "sim" ? `${rot(TIPOS_DIABETES, p.diabetesTipo)} — insulina injetável: ${sn(p.insulinaInjetavel)}` : sn(p.diabetes), p.insulinaInjetavel === "sim"],
      ],
    },
  ];
}

export function linhasTriagemBasica(respostas: Record<string, unknown>): [string, string][] {
  const r = respostas as Record<string, string>;
  return [
    ["Nível de japonês", NIVEIS_JAPONES_DETALHADOS.find((n) => n.key === r.nivelJaponesDetalhado)?.label ?? r.nivelJapones ?? "—"],
    ["Ascendência japonesa", rot(ASCENDENCIA_JAPONESA, r.ascendencia)],
    ["Quando quer embarcar", rot(QUANDO_EMBARCAR, r.quandoEmbarcar)],
    ["Passaporte válido", sn(r.passaporte)],
    ["Disponível em até 6 meses", sn(r.disponibilidadeEmbarque)],
    ["Experiência em fábrica/produção", sn(r.experienciaSetor)],
    ["Re-Entry válido", sn(r.reEntry)],
  ];
}

// Links de arquivo na ficha — passam pela rota /crm/empregos/arquivo, que
// confere a sessão e gera URL assinada (buckets privados).
export const BUCKETS_CANDIDATO = ["curriculos-candidatos", "fotos-candidatos"] as const;
export function urlArquivoCandidato(bucket: (typeof BUCKETS_CANDIDATO)[number], path: string) {
  return `/crm/empregos/arquivo?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;
}
