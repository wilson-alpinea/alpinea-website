"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { STATUS_CANDIDATURA } from "@/lib/crm/empregos";
import { AREA_EMPREGOS, EXPLICACAO_SCORE, TRIAGEM_EMPREGOS } from "@/lib/crm/temaEmpregos";

// Candidatos (redesenho 23/out/2026). Triagem e andamento são dimensões
// diferentes: cada bloco de cards conta sobre os filtros gerais e não se
// soma ao outro. Estado na URL; o endereço fica guardado para o "← Candidatos".

export type CandidaturaLista = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  vagaId: string;
  vagaEmpresa: string;
  vagaTitulo: string;
  pontuacao: number | null;
  classificacao: "aprovado_alto" | "aprovado_baixo" | "eliminado" | null;
  motivos: string[];
  pontosRevisar: string[];
  status: string;
  etapa: 1 | 2 | 3 | 4 | 5;
  etapaLabel: string;
  reclassificadoPor: string | null;
  criadoEm: string;
};

const CHAVE_RETORNO = "crm.empregos.retorno";
const CHAVE_COLUNAS = "crm.empregos.colunas";
const EVENTO_COLUNAS = "crm-colunas-empregos";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CARD = `rounded-2xl border border-[#DEE6E2] bg-white ${SOMBRA}`;
const CAMPO =
  "rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2.5 text-base text-[#202B28] outline-none transition placeholder:text-[#8A9792] focus:border-[#27675B] focus:ring-2 focus:ring-[#27675B]/25";

const ANDAMENTO = [
  { etapa: 2, titulo: "Ficha cadastral", secundario: "Etapa 2", ...AREA_EMPREGOS.ficha },
  { etapa: 3, titulo: "Proposta", secundario: "Etapa 3", ...AREA_EMPREGOS.proposta },
  { etapa: 4, titulo: "Agendamento", secundario: "Etapa 4", ...AREA_EMPREGOS.agenda },
  { etapa: 5, titulo: "Pré-entrevista agendada", secundario: "Etapa 4 concluída ou posterior", ...AREA_EMPREGOS.principal },
] as const;
const COR_ETAPA: Record<number, { fundo: string; cor: string }> = {
  1: AREA_EMPREGOS.historico,
  2: AREA_EMPREGOS.ficha,
  3: AREA_EMPREGOS.proposta,
  4: AREA_EMPREGOS.agenda,
  5: AREA_EMPREGOS.principal,
};
const PERIODOS = [
  { valor: "", label: "Desde o início" },
  { valor: "semana", label: "Esta semana" },
  { valor: "mes", label: "Este mês" },
  { valor: "30d", label: "Últimos 30 dias" },
  { valor: "7d", label: "Últimos 7 dias" },
  { valor: "personalizado", label: "Personalizado" },
];
const REVISAO = [
  { valor: "pendente", label: "Pendente" },
  { valor: "revisada", label: "Revisada" },
  { valor: "sem", label: "Sem pontos a revisar" },
];

// "Etapa 2 — aguardando ficha" → título curto + etapa como informação secundária.
function etapaCurta(c: CandidaturaLista) {
  const m = /^Etapa (\d) — (.+)$/.exec(c.etapaLabel);
  const titulo = m ? m[2].charAt(0).toUpperCase() + m[2].slice(1) : c.etapaLabel;
  const secundario = m ? `Etapa ${m[1]}` : c.etapa === 5 ? "Após a etapa 4" : "";
  return { titulo, secundario };
}
const revisaoDe = (c: CandidaturaLista) => (c.pontosRevisar.length === 0 ? "sem" : c.status === "novo" ? "pendente" : "revisada");
const fmtData = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });

// Período no fuso de São Paulo (UTC−3), mesma regra da versão anterior.
function intervalo(periodo: string, de: string, ate: string): [number | null, number | null] {
  const OFF = 3 * 3600 * 1000;
  const DIA = 86400000;
  const agora = new Date(Date.now() - OFF);
  const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()) + OFF;
  const ok = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  switch (periodo) {
    case "semana":
      return [hoje - ((agora.getUTCDay() + 6) % 7) * DIA, null];
    case "mes":
      return [Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1) + OFF, null];
    case "30d":
      return [hoje - 29 * DIA, null];
    case "7d":
      return [hoje - 6 * DIA, null];
    case "personalizado":
      return [ok(de) ? Date.parse(`${de}T00:00:00Z`) + OFF : null, ok(ate) ? Date.parse(`${ate}T00:00:00Z`) + OFF + DIA : null];
    default:
      return [null, null];
  }
}

function assinarColunas(aviso: () => void) {
  window.addEventListener(EVENTO_COLUNAS, aviso);
  return () => window.removeEventListener(EVENTO_COLUNAS, aviso);
}
function lerColunas() {
  try {
    return window.localStorage.getItem(CHAVE_COLUNAS) ?? "[]";
  } catch {
    return "[]";
  }
}

export function ListaCandidaturas({ candidaturas, erro }: { candidaturas: CandidaturaLista[]; erro: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const vaga = sp.get("vaga") ?? "";
  const tipo = ["aprovado_alto", "aprovado_baixo", "eliminado"].includes(sp.get("tipo") ?? "") ? sp.get("tipo")! : "";
  const etapa = [1, 2, 3, 4, 5].includes(Number(sp.get("etapa"))) ? Number(sp.get("etapa")) : null;
  const revisao = sp.get("revisao") ?? "";
  const periodo = PERIODOS.some((p) => p.valor === sp.get("periodo")) ? sp.get("periodo")! : "";
  const de = sp.get("de") ?? "";
  const ate = sp.get("ate") ?? "";
  const ordem = ["nome", "score", "data"].includes(sp.get("ordem") ?? "") ? sp.get("ordem")! : "data";
  const dir = sp.get("dir") === "asc" ? "asc" : sp.get("dir") === "desc" ? "desc" : ordem === "nome" ? "asc" : "desc";
  const por = [10, 25, 50].includes(Number(sp.get("por"))) ? Number(sp.get("por")) : 25;
  const pagina = Math.max(1, Number(sp.get("pag")) || 1);

  function atualizar(m: Record<string, string | null>, manterPagina = false) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(m)) {
      if (!v) p.delete(k);
      else p.set(k, v);
    }
    if (!manterPagina) p.delete("pag");
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  const enderecoAtual = sp.toString();
  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAVE_RETORNO, enderecoAtual ? `${pathname}?${enderecoAtual}` : pathname);
    } catch {}
  }, [pathname, enderecoAtual]);

  const [texto, setTexto] = useState(q);
  const ultimo = useRef(q);
  useEffect(() => {
    if (texto.trim() === ultimo.current) return;
    const t = setTimeout(() => {
      ultimo.current = texto.trim();
      atualizar({ q: texto.trim() || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const [mais, setMais] = useState(!!(revisao || periodo || etapa));
  const [colunasAberto, setColunasAberto] = useState(false);
  const colunasSalvas = useSyncExternalStore(assinarColunas, lerColunas, () => "[]");
  const mostrarDecisao = colunasSalvas.includes("decisao");
  function alternarDecisao() {
    try {
      window.localStorage.setItem(CHAVE_COLUNAS, JSON.stringify(mostrarDecisao ? [] : ["decisao"]));
    } catch {}
    window.dispatchEvent(new Event(EVENTO_COLUNAS));
  }

  // Vagas para o seletor pesquisável.
  const vagas = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of candidaturas) m.set(c.vagaId, `${c.vagaEmpresa} — ${c.vagaTitulo}`);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [candidaturas]);
  const [textoVaga, setTextoVaga] = useState(vagas.find(([id]) => id === vaga)?.[1] ?? "");

  // Filtros gerais (sem triagem e sem etapa) → base dos dois blocos de cards.
  const geral = useMemo(() => {
    const t = q.trim().toLowerCase();
    const dig = q.replace(/\D/g, "");
    const [ini, fim] = intervalo(periodo, de, ate);
    return candidaturas.filter((c) => {
      if (t) {
        const ok =
          c.nome.toLowerCase().includes(t) ||
          (c.email ?? "").toLowerCase().includes(t) ||
          (c.telefone ?? "").toLowerCase().includes(t) ||
          (dig.length >= 3 && (c.telefone ?? "").replace(/\D/g, "").includes(dig));
        if (!ok) return false;
      }
      if (vaga && c.vagaId !== vaga) return false;
      if (revisao && revisaoDe(c) !== revisao) return false;
      const ms = Date.parse(c.criadoEm);
      if (ini !== null && ms < ini) return false;
      if (fim !== null && ms >= fim) return false;
      return true;
    });
  }, [candidaturas, q, vaga, revisao, periodo, de, ate]);

  const paraTriagem = etapa ? geral.filter((c) => c.etapa === etapa) : geral;
  const paraAndamento = tipo ? geral.filter((c) => c.classificacao === tipo) : geral;
  const contTriagem = {
    aprovado_alto: paraTriagem.filter((c) => c.classificacao === "aprovado_alto").length,
    aprovado_baixo: paraTriagem.filter((c) => c.classificacao === "aprovado_baixo" && c.pontuacao !== null).length,
    eliminado: paraTriagem.filter((c) => c.classificacao === "eliminado").length,
  };
  const semScore = paraTriagem.filter((c) => c.classificacao !== "eliminado" && c.pontuacao === null).length;
  const contEtapa = (n: number) => paraAndamento.filter((c) => c.etapa === n).length;

  const filtrados = useMemo(() => {
    const lista = geral.filter((c) => (!tipo || c.classificacao === tipo) && (!etapa || c.etapa === etapa));
    const f = dir === "asc" ? 1 : -1;
    return lista.sort((a, b) => {
      if (ordem === "nome") return f * a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
      if (ordem === "score") return (a.pontuacao === null ? 1 : 0) - (b.pontuacao === null ? 1 : 0) || f * ((a.pontuacao ?? 0) - (b.pontuacao ?? 0));
      return f * a.criadoEm.localeCompare(b.criadoEm);
    });
  }, [geral, tipo, etapa, ordem, dir]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / por));
  const paginaAtual = Math.min(pagina, paginas);
  const inicio = (paginaAtual - 1) * por;
  const visiveis = filtrados.slice(inicio, inicio + por);
  const pessoas = new Set(candidaturas.map((c) => (c.email || c.telefone || c.nome).toLowerCase())).size;

  const chips: { rotulo: string; limpar: Record<string, null> }[] = [];
  if (q) chips.push({ rotulo: `Busca: “${q}”`, limpar: { q: null } });
  if (vaga) chips.push({ rotulo: `Vaga: ${vagas.find(([id]) => id === vaga)?.[1] ?? vaga}`, limpar: { vaga: null } });
  if (tipo) chips.push({ rotulo: `Triagem: ${TRIAGEM_EMPREGOS[tipo as keyof typeof TRIAGEM_EMPREGOS].rotulo}`, limpar: { tipo: null } });
  if (etapa) chips.push({ rotulo: `Etapa: ${etapa === 1 ? "Em análise (etapa 1)" : ANDAMENTO.find((a) => a.etapa === etapa)?.titulo}`, limpar: { etapa: null } });
  if (revisao) chips.push({ rotulo: `Revisão: ${REVISAO.find((r) => r.valor === revisao)?.label}`, limpar: { revisao: null } });
  if (periodo) chips.push({ rotulo: `Data da candidatura: ${PERIODOS.find((p) => p.valor === periodo)?.label}${periodo === "personalizado" && (de || ate) ? ` (${de || "…"} a ${ate || "…"})` : ""}`, limpar: { periodo: null, de: null, ate: null } });
  function limpar() {
    setTexto("");
    ultimo.current = "";
    setTextoVaga("");
    atualizar({ q: null, vaga: null, tipo: null, etapa: null, revisao: null, periodo: null, de: null, ate: null });
  }
  function ordenar(o: string) {
    if (o === ordem) atualizar({ ordem: o, dir: dir === "asc" ? "desc" : "asc" }, true);
    else atualizar({ ordem: o, dir: o === "nome" ? "asc" : "desc" }, true);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[#202B28]">Candidatos</h1>
          <p className="mt-0.5 text-sm text-[#626E69]">Acompanhe as candidaturas e os próximos passos do processo seletivo.</p>
          {!erro && (
            <p className="text-[13px] tabular-nums text-[#626E69]">
              {candidaturas.length} {candidaturas.length === 1 ? "candidatura" : "candidaturas"} de {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"} (uma pessoa pode se candidatar a mais de uma vaga)
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/crm/empregos/vagas" className="rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] transition hover:border-[#27675B]/50">
            Vagas no site
          </Link>
          <Link href="/crm/empregos/agenda" className="rounded-xl bg-[#27675B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#20564C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27675B]/40 focus-visible:ring-offset-2">
            Ver agenda
          </Link>
        </div>
      </div>

      {erro ? (
        <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
          Não foi possível carregar as candidaturas. Recarregue a página; se continuar, verifique as migrações do Supabase.
        </p>
      ) : candidaturas.length === 0 ? (
        <div className={`${CARD} px-6 py-12 text-center`}>
          <p className="text-lg font-semibold text-[#202B28]">Nenhuma candidatura recebida ainda.</p>
          <p className="mt-1 text-sm text-[#626E69]">As candidaturas feitas em /empregos aparecem aqui já com a triagem calculada.</p>
        </div>
      ) : (
        <>
          {/* Resultado da triagem */}
          <section aria-labelledby="titulo-triagem">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
              <h2 id="titulo-triagem" className="text-[#202B28]">
                Resultado da triagem
              </h2>
              <span className="text-[13px] text-[#626E69]" title={EXPLICACAO_SCORE}>
                <span className="cursor-help underline decoration-dotted underline-offset-2">O que é o score?</span>
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(["aprovado_alto", "aprovado_baixo", "eliminado"] as const).map((k) => {
                const t = TRIAGEM_EMPREGOS[k];
                const sel = tipo === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={sel}
                    onClick={() => atualizar({ tipo: sel ? null : k })}
                    className={`rounded-2xl border border-t-[3px] p-5 text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA} ${sel ? "ring-2" : "border-[#DEE6E2]"}`}
                    style={{ backgroundColor: t.fundo, borderTopColor: t.cor, ["--tw-ring-color" as string]: t.cor, ...(sel ? { borderColor: t.cor } : {}) }}
                  >
                    <span className="block text-sm font-medium" style={{ color: t.cor }}>
                      {t.titulo}
                    </span>
                    <span className="mt-1 block text-[28px] font-semibold leading-tight tabular-nums text-[#202B28]">{contTriagem[k]}</span>
                    <span className="mt-1 block text-[13px] text-[#626E69]">{t.descricao}</span>
                    {sel && <span className="mt-1 block text-[13px] font-medium" style={{ color: t.cor }}>Filtrando · clique para remover</span>}
                  </button>
                );
              })}
            </div>
            {semScore > 0 && <p className="mt-2 text-[13px] text-[#626E69]">{semScore} {semScore === 1 ? "candidatura elegível sem score calculado não entra" : "candidaturas elegíveis sem score calculado não entram"} nos cards.</p>}
          </section>

          {/* Andamento das candidaturas */}
          <section aria-labelledby="titulo-andamento">
            <h2 id="titulo-andamento" className="mb-2 text-[#202B28]">
              Andamento das candidaturas
            </h2>
            {/* Etapas sequenciais ligadas por chevrons (Wilson, 23/out/2026): em linha
                no desktop; empilhadas com chevron para baixo nas telas menores. */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)_56px_minmax(0,1fr)_56px_minmax(0,1fr)]">
              {ANDAMENTO.map((a, i) => {
                const sel = etapa === a.etapa;
                return [
                  i > 0 && (
                    <span key={`seta-${a.etapa}`} aria-hidden="true" className="flex h-14 items-center justify-center lg:h-auto">
                      <ChevronEtapa className="rotate-90 lg:rotate-0" />
                    </span>
                  ),
                  <button
                    key={a.etapa}
                    type="button"
                    aria-pressed={sel}
                    onClick={() => atualizar({ etapa: sel ? null : String(a.etapa) })}
                    className={`rounded-2xl border border-t-[3px] px-4 py-3 text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA} ${sel ? "ring-2" : "border-[#DEE6E2]"}`}
                    style={{ backgroundColor: a.fundo, borderTopColor: a.cor, ["--tw-ring-color" as string]: a.cor, ...(sel ? { borderColor: a.cor } : {}) }}
                  >
                    <span className="block text-sm font-medium text-[#202B28]">{a.titulo}</span>
                    <span className="block text-[13px] text-[#626E69]">{a.secundario}</span>
                    <span className="mt-1 block text-[24px] font-semibold leading-tight tabular-nums" style={{ color: a.cor }}>
                      {contEtapa(a.etapa)}
                    </span>
                  </button>,
                ];
              })}
            </div>
            <p className="mt-2 text-[13px] text-[#626E69]">Triagem e andamento são dimensões diferentes — as contagens não se somam.</p>
          </section>

          {/* Busca e filtros */}
          <section className={`${CARD} p-5`} aria-label="Busca e filtros">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="busca-candidatos" className="sr-only">
                Buscar candidatos
              </label>
              <input id="busca-candidatos" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone…" className={`${CAMPO} min-w-[220px] flex-1`} />
              <label htmlFor="filtro-vaga" className="sr-only">
                Vaga
              </label>
              <input
                id="filtro-vaga"
                list="lista-vagas-candidatos"
                value={textoVaga}
                placeholder="Todas as vagas (digite para buscar)"
                onChange={(e) => {
                  setTextoVaga(e.target.value);
                  const achada = vagas.find(([, nome]) => nome === e.target.value);
                  if (achada) atualizar({ vaga: achada[0] });
                  else if (!e.target.value) atualizar({ vaga: null });
                }}
                className={`${CAMPO} min-w-[220px] flex-1`}
              />
              <datalist id="lista-vagas-candidatos">
                {vagas.map(([id, nome]) => (
                  <option key={id} value={nome} />
                ))}
              </datalist>
              <button type="button" aria-expanded={mais} onClick={() => setMais((v) => !v)} className="rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] hover:border-[#27675B]/50">
                Mais filtros
              </button>
              <button type="button" aria-expanded={colunasAberto} onClick={() => setColunasAberto((v) => !v)} className="hidden rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] hover:border-[#27675B]/50 md:inline-flex">
                Colunas
              </button>
            </div>
            {mais && (
              <div className="mt-4 grid gap-4 border-t border-[#DEE6E2] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <Filtro id="f-triagem" rotulo="Resultado da triagem" valor={tipo} onChange={(v) => atualizar({ tipo: v })} opcoes={(["aprovado_alto", "aprovado_baixo", "eliminado"] as const).map((k) => ({ valor: k, label: TRIAGEM_EMPREGOS[k].rotulo }))} />
                <Filtro
                  id="f-etapa"
                  rotulo="Etapa do processo"
                  valor={etapa ? String(etapa) : ""}
                  onChange={(v) => atualizar({ etapa: v })}
                  opcoes={[{ valor: "1", label: "Em análise (etapa 1)" }, ...ANDAMENTO.map((a) => ({ valor: String(a.etapa), label: a.titulo }))]}
                />
                <Filtro id="f-revisao" rotulo="Situação de revisão" valor={revisao} onChange={(v) => atualizar({ revisao: v })} opcoes={REVISAO} />
                <div>
                  <label htmlFor="f-periodo" className="mb-1.5 block text-[13px] font-medium text-[#626E69]">
                    Data da candidatura
                  </label>
                  <select id="f-periodo" value={periodo} onChange={(e) => atualizar({ periodo: e.target.value || null, ...(e.target.value !== "personalizado" ? { de: null, ate: null } : {}) })} className={`${CAMPO} w-full`}>
                    {PERIODOS.map((p) => (
                      <option key={p.valor} value={p.valor}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {periodo === "personalizado" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input type="date" aria-label="De" value={de} onChange={(e) => atualizar({ de: e.target.value || null })} className={CAMPO} />
                      <input type="date" aria-label="Até" value={ate} onChange={(e) => atualizar({ ate: e.target.value || null })} className={CAMPO} />
                    </div>
                  )}
                </div>
                <p className="text-[13px] text-[#626E69] sm:col-span-2 lg:col-span-4">Não há responsável registrado nas candidaturas, por isso esse filtro não aparece.</p>
              </div>
            )}
            {colunasAberto && (
              <fieldset className="mt-4 border-t border-[#DEE6E2] pt-4">
                <legend className="mb-2 text-[13px] font-medium text-[#626E69]">Colunas opcionais</legend>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#202B28]">
                  <input type="checkbox" checked={mostrarDecisao} onChange={alternarDecisao} className="h-4 w-4 accent-[#27675B]" />
                  Decisão da equipe (Novo, Em análise, Aprovado ou Reprovado pela equipe)
                </label>
              </fieldset>
            )}
            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <button
                    key={c.rotulo}
                    type="button"
                    onClick={() => {
                      if ("q" in c.limpar) {
                        setTexto("");
                        ultimo.current = "";
                      }
                      if ("vaga" in c.limpar) setTextoVaga("");
                      atualizar(c.limpar);
                    }}
                    aria-label={`Remover filtro ${c.rotulo}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#27675B]/25 bg-[#EEF6F3] px-3 py-1 text-[13px] font-medium text-[#27675B] hover:border-[#27675B]/50"
                  >
                    <span className="truncate">{c.rotulo}</span> <span aria-hidden="true">×</span>
                  </button>
                ))}
                <button type="button" onClick={limpar} className="text-[13px] font-medium text-[#626E69] hover:text-[#202B28] hover:underline">
                  Limpar filtros
                </button>
              </div>
            )}
          </section>

          <p className="text-sm font-medium text-[#202B28]" aria-live="polite">
            {total} {total === 1 ? "candidatura encontrada" : "candidaturas encontradas"}
          </p>

          {total === 0 ? (
            <div className={`${CARD} px-6 py-10 text-center`}>
              <p className="text-base font-semibold text-[#202B28]">Nenhuma candidatura encontrada</p>
              <button type="button" onClick={limpar} className="mt-3 rounded-xl border border-[#DEE6E2] bg-white px-4 py-2 text-sm font-medium text-[#202B28]">
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <div className={`${CARD} hidden overflow-clip lg:block`}>
                <table className="w-full table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[19%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                    <col className="w-[17%]" />
                    <col className="w-[11%]" />
                    {mostrarDecisao && <col className="w-[10%]" />}
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead className="text-[13px] text-[#626E69]">
                    <tr>
                      <Th className="rounded-tl-2xl">
                        <Ordem rotulo="Candidato" ativo={ordem === "nome"} dir={dir} onClick={() => ordenar("nome")} />
                      </Th>
                      <Th>Vaga</Th>
                      <Th>
                        <Ordem rotulo="Triagem e score" ativo={ordem === "score"} dir={dir} onClick={() => ordenar("score")} />
                      </Th>
                      <Th>Etapa atual</Th>
                      <Th>Revisão</Th>
                      {mostrarDecisao && <Th>Decisão da equipe</Th>}
                      <Th>
                        <Ordem rotulo="Data" ativo={ordem === "data"} dir={dir} onClick={() => ordenar("data")} />
                      </Th>
                      <Th className="rounded-tr-2xl text-right">
                        <span className="sr-only">Ações</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F0]">
                    {visiveis.map((c) => (
                      <tr key={c.id} className="align-top transition hover:bg-[#F6FAF8]">
                        <td className="px-4 py-3.5">
                          <Link href={`/crm/empregos/${c.id}`} className="font-semibold text-[#202B28] hover:text-[#27675B] hover:underline">
                            {c.nome || "Sem nome"}
                          </Link>
                          {c.telefone && <p className="whitespace-nowrap text-[13px] tabular-nums text-[#626E69]">{c.telefone}</p>}
                          {c.email && <p className="truncate text-[13px] text-[#626E69]" title={c.email}>{c.email}</p>}
                          {c.reclassificadoPor && <p className="mt-1 text-[13px] font-medium text-[#93703D]">{c.reclassificadoPor}</p>}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-[#202B28]">{c.vagaEmpresa}</p>
                          <p className="line-clamp-2 text-[13px] text-[#626E69]" title={c.vagaTitulo}>
                            {c.vagaTitulo}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <Triagem c={c} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Etapa c={c} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Revisao c={c} />
                        </td>
                        {mostrarDecisao && <td className="px-4 py-3.5 text-[#202B28]">{STATUS_CANDIDATURA.find((s) => s.valor === c.status)?.label ?? c.status}</td>}
                        <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[#202B28]">{fmtData(c.criadoEm)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href={`/crm/empregos/${c.id}`} className="inline-block rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#27675B] hover:bg-[#EEF6F3]" aria-label={`Abrir candidatura de ${c.nome} para ${c.vagaEmpresa}`}>
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 lg:hidden">
                {visiveis.map((c) => (
                  <li key={c.id} className={`${CARD} p-4`}>
                    <Link href={`/crm/empregos/${c.id}`} className="font-semibold text-[#202B28]">
                      {c.nome || "Sem nome"}
                    </Link>
                    <p className="text-[13px] text-[#626E69]">
                      {c.vagaEmpresa} — {c.vagaTitulo}
                    </p>
                    <div className="mt-2 flex flex-wrap items-start gap-3">
                      <Triagem c={c} />
                      <Etapa c={c} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[13px] tabular-nums text-[#626E69]">{fmtData(c.criadoEm)}</span>
                      <Link href={`/crm/empregos/${c.id}`} className="rounded-lg border border-[#DEE6E2] px-3 py-1.5 text-sm font-medium text-[#27675B]">
                        Abrir candidatura
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#626E69]">
                <p className="tabular-nums">
                  Exibindo {inicio + 1}–{Math.min(inicio + por, total)} de {total} {total === 1 ? "candidatura" : "candidaturas"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    Por página
                    <select value={por} onChange={(e) => atualizar({ por: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#DEE6E2] bg-white px-2 py-1 text-base text-[#202B28]">
                      {[10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="flex items-center gap-1">
                    <button type="button" disabled={paginaAtual <= 1} onClick={() => atualizar({ pag: paginaAtual - 1 > 1 ? String(paginaAtual - 1) : null }, true)} className="rounded-lg border border-[#DEE6E2] bg-white px-3 py-1.5 font-medium text-[#202B28] disabled:opacity-40">
                      Anterior
                    </button>
                    <span className="px-2 tabular-nums">
                      {paginaAtual} / {paginas}
                    </span>
                    <button type="button" disabled={paginaAtual >= paginas} onClick={() => atualizar({ pag: String(paginaAtual + 1) }, true)} className="rounded-lg border border-[#DEE6E2] bg-white px-3 py-1.5 font-medium text-[#202B28] disabled:opacity-40">
                      Próxima
                    </button>
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`sticky top-[97px] z-10 border-b border-[#DEE6E2] bg-[#F3F5F5] px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function Ordem({ rotulo, ativo, dir, onClick }: { rotulo: string; ativo: boolean; dir: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 rounded font-medium hover:text-[#202B28] ${ativo ? "text-[#202B28]" : ""}`} aria-label={`Ordenar por ${rotulo.toLowerCase()}${ativo ? (dir === "asc" ? ", crescente" : ", decrescente") : ""}`}>
      {rotulo}
      <span aria-hidden="true" className={ativo ? "text-[#27675B]" : "text-[#B4BFBA]"}>
        {ativo ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

function Triagem({ c }: { c: CandidaturaLista }) {
  const t = c.classificacao ? TRIAGEM_EMPREGOS[c.classificacao] : null;
  return (
    <div className="min-w-0">
      {t ? (
        <span className="inline-block max-w-full rounded-2xl px-2.5 py-0.5 text-[13px] font-medium leading-snug" style={{ color: t.cor, backgroundColor: t.fundo }}>
          {t.rotulo}
        </span>
      ) : (
        <span className="text-[13px] text-[#626E69]">Triagem não registrada</span>
      )}
      <div className="mt-1.5 flex items-center gap-2" title={EXPLICACAO_SCORE}>
        {c.pontuacao === null ? (
          <span className="text-[13px] text-[#626E69]">Não calculado</span>
        ) : (
          <>
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[#E6ECE9]" aria-hidden="true">
              <span className="block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, c.pontuacao))}%`, backgroundColor: t?.cor ?? "#5D6C70" }} />
            </span>
            <span className="text-sm font-semibold tabular-nums text-[#202B28]">{c.pontuacao}</span>
          </>
        )}
      </div>
      {c.classificacao === "eliminado" && c.motivos[0] && (
        <p className="mt-1 line-clamp-2 text-[13px] text-[#B42318]" title={c.motivos.join(" · ")}>
          {c.motivos[0]}
          {c.motivos.length > 1 && ` (+${c.motivos.length - 1})`}
        </p>
      )}
    </div>
  );
}

function Etapa({ c }: { c: CandidaturaLista }) {
  const { titulo, secundario } = etapaCurta(c);
  const cor = COR_ETAPA[c.etapa];
  return (
    <div>
      <span className="inline-block max-w-full rounded-2xl px-2.5 py-0.5 text-[13px] font-medium leading-snug" style={{ color: cor.cor, backgroundColor: cor.fundo }}>
        {titulo}
      </span>
      {secundario && <p className="mt-0.5 text-[13px] text-[#626E69]">{secundario}</p>}
    </div>
  );
}

function Revisao({ c }: { c: CandidaturaLista }) {
  const r = revisaoDe(c);
  if (r === "sem") return <span className="text-[13px] text-[#8A9792]">—</span>;
  const n = c.pontosRevisar.length;
  return (
    <div title={c.pontosRevisar.join(" · ")}>
      <span
        className="inline-block max-w-full rounded-2xl px-2.5 py-0.5 text-[13px] font-medium leading-snug"
        style={r === "pendente" ? { color: AREA_EMPREGOS.agenda.cor, backgroundColor: AREA_EMPREGOS.agenda.fundo } : { color: AREA_EMPREGOS.historico.cor, backgroundColor: AREA_EMPREGOS.historico.fundo }}
      >
        {r === "pendente" ? "Pendente" : "Revisada"}
      </span>
      <p className="mt-0.5 text-[13px] text-[#626E69]">
        {n} {n === 1 ? "ponto" : "pontos"} a revisar
      </p>
    </div>
  );
}

function Filtro({ id, rotulo, valor, onChange, opcoes }: { id: string; rotulo: string; valor: string; onChange: (v: string | null) => void; opcoes: readonly { valor: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#626E69]">
        {rotulo}
      </label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value || null)} className={`${CAMPO} w-full`}>
        <option value="">Todos</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Chevron decorativo entre etapas: miolo menta #EEF6F3 com contorno #27675B. */
function ChevronEtapa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 48" width={32} height={48} className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <path d="M9.5 8 L22.5 24 L9.5 40" fill="none" stroke="#27675B" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8 L22.5 24 L9.5 40" fill="none" stroke="#EEF6F3" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
