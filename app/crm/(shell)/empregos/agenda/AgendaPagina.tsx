"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ConfigAgenda } from "@/app/lib/agendaEntrevista";
import { AREA_EMPREGOS } from "@/lib/crm/temaEmpregos";
import { atualizarSituacaoEntrevista } from "../../../agendaActions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";
import { Disponibilidade } from "./Disponibilidade";

// Agenda de pré-entrevistas (redesenho 23/out/2026). Tudo em America/Sao_Paulo.

export type EntrevistaAgenda = {
  id: string;
  inicio: string;
  status: string;
  candidaturaId: string;
  candidato: string;
  telefone: string | null;
  email: string | null;
  vagaId: string;
  vagaEmpresa: string;
  vagaTitulo: string;
};
export type JanelaAgenda = { id: string; dia_semana: number; inicio: string; fim: string };
export type BloqueioGrupo = { ids: string[]; de: string; ate: string; inicio: string | null; fim: string | null; motivo: string | null };
export type HorarioPrevia = { data: string; hora: string; restantes: number };

export const FUSO = "America/Sao_Paulo";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO =
  "rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2.5 text-base text-[#202B28] outline-none transition placeholder:text-[#8A9792] focus:border-[#27675B] focus:ring-2 focus:ring-[#27675B]/25";

export const STATUS_ENTREVISTA: Record<string, { label: string; cor: string; fundo: string }> = {
  agendada: { label: "Agendada", cor: "#27675B", fundo: "#EEF6F3" },
  realizada: { label: "Realizada", cor: "#42658A", fundo: "#EFF4FA" },
  faltou: { label: "Faltou", cor: "#B42318", fundo: "#FDECEA" },
  cancelada: { label: "Cancelada", cor: "#5D6C70", fundo: "#F3F5F5" },
};

const diaSP = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const horaSP = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
export const somarDias = (d: string, n: number) => new Date(Date.parse(`${d}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
export function rotuloDia(data: string, hoje: string) {
  const d = new Date(`${data}T12:00:00Z`);
  const semana = d.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "UTC" });
  const resto = d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });
  const nome = data === hoje ? "Hoje" : data === somarDias(hoje, 1) ? "Amanhã" : semana.charAt(0).toUpperCase() + semana.slice(1);
  return `${nome} · ${resto}`;
}
const linkValido = (l: string | null) => (l && /^https?:\/\/\S+$/.test(l) ? l : null);
// Relógio que só existe no navegador (evita diferença de hidratação).
const assinarNada = () => () => {};

export function AgendaPagina({
  hoje,
  config,
  janelas,
  bloqueios,
  entrevistas,
  previa,
  erros,
}: {
  hoje: string;
  config: ConfigAgenda;
  janelas: JanelaAgenda[];
  bloqueios: BloqueioGrupo[];
  entrevistas: EntrevistaAgenda[];
  previa: HorarioPrevia[] | null;
  erros: { config: boolean; janelas: boolean; bloqueios: boolean; entrevistas: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const aba = sp.get("aba") === "disponibilidade" ? "disponibilidade" : "entrevistas";
  function atualizar(m: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(m)) {
      if (!v) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/crm/empregos" className="text-[13px] text-[#626E69] hover:text-[#27675B]">
          ← Candidatos
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[#202B28]">Agenda de pré-entrevistas</h1>
            <p className="mt-0.5 text-sm text-[#626E69]">Acompanhe entrevistas e configure os horários disponíveis para os candidatos.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DEE6E2] bg-white px-3 py-1.5 text-[13px] font-medium text-[#202B28]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#27675B]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            Horário de Brasília
          </span>
        </div>
      </div>

      <div role="tablist" aria-label="Seções da agenda" className="flex gap-1 border-b border-[#DEE6E2]">
        {[
          { id: "entrevistas", label: "Entrevistas" },
          { id: "disponibilidade", label: "Disponibilidade e regras" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={aba === t.id}
            onClick={() => atualizar({ aba: t.id === "entrevistas" ? null : t.id })}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${aba === t.id ? "border-[#27675B] text-[#27675B]" : "border-transparent text-[#626E69] hover:text-[#202B28]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {erros.config && (
        <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
          Não foi possível ler a configuração da agenda. Se for a primeira vez, rode supabase/migrations/017_empregos_financiamento_entrevista.sql.
        </p>
      )}

      {aba === "entrevistas" ? (
        <Entrevistas hoje={hoje} entrevistas={entrevistas} erro={erros.entrevistas} link={linkValido(config.link_reuniao)} sp={sp} atualizar={atualizar} />
      ) : (
        <Disponibilidade hoje={hoje} config={config} janelas={janelas} bloqueios={bloqueios} previa={previa} erros={erros} />
      )}
    </div>
  );
}

function Entrevistas({
  hoje,
  entrevistas,
  erro,
  link,
  sp,
  atualizar,
}: {
  hoje: string;
  entrevistas: EntrevistaAgenda[];
  erro: boolean;
  link: string | null;
  sp: URLSearchParams;
  atualizar: (m: Record<string, string | null>) => void;
}) {
  const agora = useSyncExternalStore(assinarNada, () => Math.floor(Date.now() / 60000) * 60000, () => 0);
  const f = sp.get("f") ?? ""; // hoje | semana | pendentes (indicadores)
  const per = sp.get("per") ?? ""; // "" (de hoje em diante) | hoje | 7d | personalizado | anteriores
  const de = sp.get("de") ?? "";
  const ate = sp.get("ate") ?? "";
  const q = sp.get("q") ?? "";
  const vaga = sp.get("vaga") ?? "";
  const status = sp.get("status") ?? "";
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
  const [editando, setEditando] = useState<EntrevistaAgenda | null>(null);
  const fechar = useCallback(() => setEditando(null), []);

  const fim7 = somarDias(hoje, 7);
  const passou = (e: EntrevistaAgenda) => agora > 0 && Date.parse(e.inicio) < agora;
  const pendentes = entrevistas.filter((e) => e.status === "agendada" && passou(e));
  const contHoje = entrevistas.filter((e) => e.status === "agendada" && diaSP(e.inicio) === hoje).length;
  const contSemana = entrevistas.filter((e) => e.status === "agendada" && diaSP(e.inicio) > hoje && diaSP(e.inicio) <= fim7).length;

  const vagas = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of entrevistas) if (e.vagaId) m.set(e.vagaId, `${e.vagaEmpresa} — ${e.vagaTitulo}`);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [entrevistas]);

  const lista = entrevistas.filter((e) => {
    const d = diaSP(e.inicio);
    if (f === "hoje") {
      if (!(e.status === "agendada" && d === hoje)) return false;
    } else if (f === "semana") {
      if (!(e.status === "agendada" && d > hoje && d <= fim7)) return false;
    } else if (f === "pendentes") {
      if (!(e.status === "agendada" && passou(e))) return false;
    } else if (per === "hoje") {
      if (d !== hoje) return false;
    } else if (per === "7d") {
      if (d < hoje || d > fim7) return false;
    } else if (per === "personalizado") {
      if ((de && d < de) || (ate && d > ate)) return false;
    } else if (per === "anteriores") {
      if (d >= hoje) return false;
    } else if (d < hoje) return false;
    if (q && !e.candidato.toLowerCase().includes(q.toLowerCase())) return false;
    if (vaga && e.vagaId !== vaga) return false;
    if (status && e.status !== status) return false;
    return true;
  });
  if (per === "anteriores" || f === "pendentes") lista.reverse();
  const grupos = lista.reduce<{ dia: string; itens: EntrevistaAgenda[] }[]>((acc, e) => {
    const d = diaSP(e.inicio);
    const g = acc.at(-1);
    if (g && g.dia === d) g.itens.push(e);
    else acc.push({ dia: d, itens: [e] });
    return acc;
  }, []);

  const INDICADORES = [
    { id: "hoje", titulo: "Agendadas para hoje", n: contHoje, ...AREA_EMPREGOS.principal },
    { id: "semana", titulo: "Próximos 7 dias", n: contSemana, ...AREA_EMPREGOS.ficha },
    { id: "pendentes", titulo: "Aguardando atualização", n: pendentes.length, ...AREA_EMPREGOS.agenda },
  ];
  const filtrosAtivos = !!(f || per || q || vaga || status);

  if (erro)
    return (
      <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
        Não foi possível carregar as entrevistas. Recarregue a página.
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {INDICADORES.map((i) => {
          const sel = f === i.id;
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={sel}
              onClick={() => atualizar({ f: sel ? null : i.id, per: null, de: null, ate: null })}
              className={`rounded-2xl border border-t-[3px] p-4 text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA} ${sel ? "ring-2" : "border-[#DEE6E2]"}`}
              style={{ backgroundColor: i.fundo, borderTopColor: i.cor, ["--tw-ring-color" as string]: i.cor, ...(sel ? { borderColor: i.cor } : {}) }}
            >
              <span className="block text-sm font-medium text-[#202B28]">{i.titulo}</span>
              <span className="mt-1 block text-[28px] font-semibold leading-tight tabular-nums" style={{ color: i.cor }}>
                {agora === 0 && i.id === "pendentes" ? "…" : i.n}
              </span>
              {sel && <span className="text-[13px] text-[#626E69]">Filtrando · clique para remover</span>}
            </button>
          );
        })}
      </div>

      {pendentes.length > 0 && f !== "pendentes" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#93703D]/25 bg-[#FAF5EB] px-4 py-3 text-sm text-[#6E5430]">
          <span>
            {pendentes.length} {pendentes.length === 1 ? "entrevista já passou e continua" : "entrevistas já passaram e continuam"} como “Agendada”. Atualize a situação de cada uma.
          </span>
          <button type="button" onClick={() => atualizar({ f: "pendentes", per: null })} className="rounded-lg border border-[#93703D]/40 bg-white px-3 py-1.5 font-medium text-[#93703D] hover:border-[#93703D]">
            Revisar entrevistas
          </button>
        </div>
      )}

      <section className={`rounded-2xl border border-[#DEE6E2] bg-white p-5 ${SOMBRA}`} aria-label="Filtros">
        <div className="flex flex-wrap items-center gap-3">
          <input type="search" aria-label="Buscar candidato" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar candidato…" className={`${CAMPO} min-w-[200px] flex-1`} />
          <select aria-label="Vaga" value={vaga} onChange={(e) => atualizar({ vaga: e.target.value || null })} className={`${CAMPO} max-w-full`}>
            <option value="">Todas as vagas</option>
            {vagas.map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
          <select aria-label="Situação" value={status} onChange={(e) => atualizar({ status: e.target.value || null })} className={CAMPO}>
            <option value="">Todas as situações</option>
            {Object.entries(STATUS_ENTREVISTA).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Período">
          {[
            { id: "", label: "A partir de hoje" },
            { id: "hoje", label: "Hoje" },
            { id: "7d", label: "Próximos 7 dias" },
            { id: "personalizado", label: "Personalizado" },
            { id: "anteriores", label: "Entrevistas anteriores" },
          ].map((p) => {
            const sel = !f && per === p.id;
            return (
              <button
                key={p.id || "futuras"}
                type="button"
                aria-pressed={sel}
                onClick={() => atualizar({ per: p.id || null, f: null, ...(p.id !== "personalizado" ? { de: null, ate: null } : {}) })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${sel ? "bg-[#27675B] text-white" : "border border-[#DEE6E2] bg-white text-[#626E69] hover:text-[#202B28]"}`}
              >
                {p.label}
              </button>
            );
          })}
          {per === "personalizado" && !f && (
            <span className="flex flex-wrap items-center gap-2">
              <input type="date" aria-label="De" value={de} onChange={(e) => atualizar({ de: e.target.value || null })} className={CAMPO} />
              <span className="text-[#626E69]">até</span>
              <input type="date" aria-label="Até" value={ate} onChange={(e) => atualizar({ ate: e.target.value || null })} className={CAMPO} />
            </span>
          )}
          {filtrosAtivos && (
            <button
              type="button"
              onClick={() => {
                setTexto("");
                ultimo.current = "";
                atualizar({ f: null, per: null, de: null, ate: null, q: null, vaga: null, status: null });
              }}
              className="text-[13px] font-medium text-[#626E69] hover:text-[#202B28] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {grupos.length === 0 ? (
        <div className={`rounded-2xl border border-[#DEE6E2] bg-white px-6 py-10 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#202B28]">{entrevistas.length === 0 ? "Nenhuma entrevista agendada ainda." : "Nenhuma entrevista agendada para este período"}</p>
          {filtrosAtivos && <p className="mt-1 text-sm text-[#626E69]">Ajuste os filtros ou consulte as entrevistas anteriores.</p>}
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.map((g) => (
            <section key={g.dia} aria-label={rotuloDia(g.dia, hoje)}>
              <h2 className="mb-2 text-base font-semibold text-[#202B28]">{rotuloDia(g.dia, hoje)}</h2>
              <ul className={`divide-y divide-[#EEF2F0] rounded-2xl border border-[#DEE6E2] bg-white ${SOMBRA}`}>
                {g.itens.map((e) => {
                  const s = STATUS_ENTREVISTA[e.status] ?? { label: e.status, cor: "#5D6C70", fundo: "#F3F5F5" };
                  const atrasada = e.status === "agendada" && passou(e);
                  return (
                    <li key={e.id} className="grid gap-3 p-4 md:grid-cols-[4.5rem_minmax(0,1.3fr)_minmax(0,1.4fr)_auto_auto] md:items-center">
                      <span className="text-base font-semibold tabular-nums text-[#202B28]">{horaSP(e.inicio)}</span>
                      <span className="min-w-0">
                        <Link href={`/crm/empregos/${e.candidaturaId}`} className="font-semibold text-[#202B28] hover:text-[#27675B] hover:underline">
                          {e.candidato}
                        </Link>
                        {(e.telefone || e.email) && (
                          <span className="block text-[13px] text-[#626E69]">
                            {e.telefone && <span className="whitespace-nowrap tabular-nums">{e.telefone}</span>}
                            {e.telefone && e.email && " · "}
                            {e.email && <span className="break-all">{e.email}</span>}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#202B28]">{e.vagaEmpresa}</span>
                        <span className="line-clamp-2 text-[13px] text-[#626E69]" title={e.vagaTitulo}>
                          {e.vagaTitulo}
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-1.5">
                        <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: s.cor, backgroundColor: s.fundo }}>
                          {s.label}
                        </span>
                        {atrasada && <span className="inline-flex whitespace-nowrap rounded-full bg-[#FAF5EB] px-2.5 py-0.5 text-[13px] font-medium text-[#93703D]">Precisa atualizar</span>}
                      </span>
                      <span className="flex flex-wrap gap-2 md:justify-end">
                        {link && e.status === "agendada" && !atrasada && (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#DEE6E2] px-3 py-1.5 text-sm font-medium text-[#27675B] hover:border-[#27675B]/50" aria-label={`Abrir reunião com ${e.candidato} (nova aba)`}>
                            Abrir reunião ↗
                          </a>
                        )}
                        <button type="button" onClick={() => setEditando(e)} className="rounded-lg bg-[#27675B] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#20564C]" aria-label={`Atualizar status da entrevista de ${e.candidato}`}>
                          Atualizar status
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      {editando && <PainelStatus entrevista={editando} onFechar={fechar} />}
    </div>
  );
}

function PainelStatus({ entrevista, onFechar }: { entrevista: EntrevistaAgenda; onFechar: () => void }) {
  const [novo, setNovo] = useState(entrevista.status);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const quando = new Date(entrevista.inicio).toLocaleString("pt-BR", { timeZone: FUSO, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <Painel
      titulo="Atualizar status"
      subtitulo={`${entrevista.candidato} · ${quando} (Brasília)`}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button
            type="button"
            className={BOTAO_PRIMARIO}
            disabled={pendente || novo === entrevista.status}
            onClick={() =>
              iniciar(async () => {
                const r = await atualizarSituacaoEntrevista(entrevista.id, novo);
                if (r.ok) onFechar();
                else setErro(r.erro);
              })
            }
          >
            {pendente && <Spinner />}
            Confirmar
          </button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-[13px] font-medium text-[#626E69]">Nova situação</legend>
        {Object.entries(STATUS_ENTREVISTA).map(([k, v]) => (
          <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${novo === k ? "border-[#27675B] bg-[#EEF6F3]" : "border-[#DEE6E2] bg-white"}`}>
            <input type="radio" name="status" value={k} checked={novo === k} onChange={() => setNovo(k)} className="h-4 w-4 accent-[#27675B]" />
            <span className="text-sm text-[#202B28]">{v.label}</span>
            {k === entrevista.status && <span className="ml-auto text-[13px] text-[#626E69]">atual</span>}
          </label>
        ))}
      </fieldset>
      <p className="mt-3 text-[13px] text-[#626E69]">Nenhuma mensagem é enviada ao candidato.</p>
      {erro && (
        <p role="alert" className="mt-3 rounded-lg border border-[#B42318]/20 bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">
          {erro}
        </p>
      )}
    </Painel>
  );
}
