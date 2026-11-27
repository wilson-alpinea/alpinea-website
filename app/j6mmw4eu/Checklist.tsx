"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { salvarAgencia } from "./actions";
import { PRIORIDADE_COR, STATUS_AGENCIA, statusInfo, type Agencia, type Alteracao } from "./dados";

// Checklist de prospecção (Wilson, 27/nov/2026). Visual no padrão dos CRMs
// (cards brancos com faixa colorida, indicadores clicáveis, selos de status
// com fundo suave). Status salva na hora; os demais campos no "Salvar".

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CARD = `rounded-2xl border border-black/[0.06] bg-white ${SOMBRA}`;
const CAMPO =
  "w-full rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-sm text-[#20252B] placeholder-[#9AA2AB] outline-none transition focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";
const ROTULO = "mb-1.5 block text-[13px] text-[#626B75]";
const CHAVE_AUTOR = "ajisai_prospeccao_autor";
const FINAIS = ["parceiro", "sem_interesse", "pausado"];

const PRIORIDADES = [
  { id: "", label: "Todas" },
  { id: "1", label: "1 · Abordar" },
  { id: "2", label: "2 · Qualificar" },
  { id: "3", label: "3 · Estratégica" },
];

type Grupo = "" | "abordar" | "contatados" | "conversa" | "parceiro" | "atrasados";

const hoje = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);
const dataBR = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—");
const dataCurtaBR = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "—");
const dataHoraBR = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "");
const numPrioridade = (p: string | null) => (p ?? "").trim().charAt(0);
const atrasada = (a: Agencia, dia: string) => !!a.proximo_em && a.proximo_em < dia && !FINAIS.includes(a.status);

function noGrupo(a: Agencia, g: Grupo, dia: string) {
  switch (g) {
    case "abordar":
      return a.status === "a_abordar" || a.status === "buscando_contato";
    case "contatados":
      return !!a.email_enviado_em;
    case "conversa":
      return ["respondeu", "reuniao", "proposta"].includes(a.status);
    case "parceiro":
      return a.status === "parceiro";
    case "atrasados":
      return atrasada(a, dia);
    default:
      return true;
  }
}

function Selo({ texto, cor, fundo }: { texto: string; cor: string; fundo: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium leading-5" style={{ color: cor, backgroundColor: fundo }}>
      {texto}
    </span>
  );
}

function SeloPrioridade({ p }: { p: string | null }) {
  const c = PRIORIDADE_COR[numPrioridade(p)] ?? { cor: "#59636F", fundo: "#F1F3F5" };
  return <Selo texto={p ?? "Sem prioridade"} cor={c.cor} fundo={c.fundo} />;
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8A929B]">{titulo}</p>
      <div className="mt-0.5 text-sm text-[#20252B]">{children}</div>
    </div>
  );
}

function LinhaAgencia({ a, autor, aoSalvar }: { a: Agencia; autor: () => string; aoSalvar: (nova: Agencia) => void }) {
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const st = statusInfo(a.status);
  const dia = hoje();
  const atrasado = atrasada(a, dia);

  const salvar = (alteracao: Alteracao) => {
    setErro(null);
    setSalvo(false);
    iniciar(async () => {
      const r = await salvarAgencia(a.ordem, alteracao, autor());
      if (r.ok) {
        aoSalvar(r.agencia);
        setSalvo(true);
      } else setErro(r.erro);
    });
  };
  // E-mail registrado com a agência ainda "a abordar": avança para "E-mail enviado".
  const avancaStatus = (alteracao: Alteracao) => {
    if (alteracao.email_enviado_em && !a.email_enviado_em && (a.status === "a_abordar" || a.status === "buscando_contato")) alteracao.status = "email_enviado";
    return alteracao;
  };

  const enviarForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const campos = ["contato_nome", "contato_email", "email_enviado_em", "ultimo_contato_em", "proximo_passo", "proximo_em", "responsavel", "observacoes"] as const;
    salvar(avancaStatus(Object.fromEntries(campos.map((c) => [c, String(f.get(c) ?? "")])) as Alteracao));
  };

  return (
    <li className={`${CARD} overflow-hidden border-l-4 transition ${aberto ? "ring-1 ring-black/10" : "hover:-translate-y-px"}`} style={{ borderLeftColor: st.forte }}>
      <div className="grid items-center gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(0,1.7fr)_2rem] md:gap-4">
        <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="min-w-0 text-left">
          {/* Sem o nº da linha da planilha (Wilson, 27/nov/2026: "os números estão bizarros"). */}
          <span className="block truncate text-[15px] font-semibold text-[#20252B]">{a.conta}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <SeloPrioridade p={a.prioridade} />
            {a.perfil && <Selo texto={a.perfil} cor="#59636F" fundo="#F1F3F5" />}
            {a.grupo && a.grupo !== a.conta && <span className="truncate text-[12px] text-[#8A929B]">{a.grupo}</span>}
          </span>
        </button>

        <label className="relative min-w-0">
          <span className="sr-only">Status de {a.conta}</span>
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" style={{ backgroundColor: st.forte }} />
          <select
            value={a.status}
            disabled={pendente}
            onChange={(e) => salvar({ status: e.target.value })}
            className="w-full cursor-pointer appearance-none rounded-full py-1.5 pl-7 pr-7 text-[13px] font-semibold outline-none ring-1 ring-inset transition focus:ring-2 disabled:opacity-60"
            style={{ color: st.cor, backgroundColor: st.fundo, ["--tw-ring-color" as string]: `${st.forte}66` }}
          >
            {STATUS_AGENCIA.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" fill="none" stroke={st.cor} strokeWidth="2">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>

        <div className="text-[13px]">
          {a.email_enviado_em ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F4EE] px-2.5 py-1 font-medium text-[#28665D]">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              E-mail {dataCurtaBR(a.email_enviado_em)}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => salvar(avancaStatus({ email_enviado_em: dia, ultimo_contato_em: dia }))}
              disabled={pendente}
              className="rounded-full border border-[#24476B]/30 bg-white px-3 py-1 text-[12px] font-medium text-[#24476B] transition hover:border-[#24476B] hover:bg-[#EAF1F8] disabled:opacity-50"
            >
              Enviei o e-mail hoje
            </button>
          )}
        </div>

        <div className="min-w-0 text-[13px]">
          {a.proximo_passo ? (
            <>
              <span className="block truncate font-medium text-[#20252B]">{a.proximo_passo}</span>
              {a.proximo_em &&
                (atrasado ? (
                  <Selo texto={`Atrasado · ${dataCurtaBR(a.proximo_em)}`} cor="#B42318" fundo="#FDEDEC" />
                ) : (
                  <span className="text-[#626B75]">até {dataBR(a.proximo_em)}</span>
                ))}
            </>
          ) : (
            <span className="text-[#9AA2AB]">Sem próximo passo</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? `Fechar ${a.conta}` : `Abrir ${a.conta}`}
          className="hidden h-8 w-8 items-center justify-center rounded-full text-[#626B75] transition hover:bg-[#EAF1F8] hover:text-[#24476B] md:flex"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 transition ${aberto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {(erro || pendente || salvo) && (
        <p className={`px-4 pb-2 text-[12px] ${erro ? "text-[#B42318]" : pendente ? "text-[#626B75]" : "text-[#28665D]"}`}>{erro ?? (pendente ? "Salvando…" : "✓ Salvo")}</p>
      )}

      {aberto && (
        <div className="grid gap-5 border-t border-[#EEF0F2] bg-[#FAFBFC] p-4 md:grid-cols-2 md:p-5">
          <section className="space-y-3 rounded-xl border border-t-[3px] border-black/[0.06] border-t-[#786343] bg-[#FAF7F1] p-4">
            <h3 className="text-sm font-semibold text-[#786343]">Pesquisa</h3>
            {a.por_que && <Bloco titulo="Por que conversar">{a.por_que}</Bloco>}
            {a.quem_procurar && <Bloco titulo="Quem procurar">{a.quem_procurar}</Bloco>}
            {a.proposta_inicial && <Bloco titulo="Proposta inicial">{a.proposta_inicial}</Bloco>}
            {a.parceria && <Bloco titulo="Parceria proposta">{a.parceria}</Bloco>}
            <Bloco titulo="Porte">
              {[
                a.posicao_panrotas ? `${a.posicao_panrotas}º PANROTAS` : null,
                a.vendas_2025_mi ? `vendas 2025 R$ ${a.vendas_2025_mi.toLocaleString("pt-BR")} mi` : null,
                a.evidencia_porte,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
              {a.detalhe_indicador && <span className="block text-[13px] text-[#626B75]">{a.detalhe_indicador}</span>}
            </Bloco>
            {a.contato_publico && <Bloco titulo="Contato público">{a.contato_publico}</Bloco>}
            {a.lista_anterior && <Bloco titulo="Na lista anterior?">{a.lista_anterior}</Bloco>}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ["Abrir canal", a.link_canal],
                ["Ver evidência", a.link_evidencia],
                ["Fonte adicional", a.link_extra],
              ]
                .filter(([, u]) => u)
                .map(([t, u]) => (
                  <a key={t as string} href={u as string} target="_blank" rel="noreferrer" className="rounded-full border border-[#24476B]/25 bg-white px-3 py-1 text-[12px] font-medium text-[#24476B] transition hover:border-[#24476B] hover:bg-[#EAF1F8]">
                    {t} ↗
                  </a>
                ))}
            </div>
          </section>

          <form onSubmit={enviarForm} key={a.updated_at ?? "novo"} className="grid content-start gap-3 rounded-xl border border-t-[3px] border-black/[0.06] border-t-[#24476B] bg-white p-4 sm:grid-cols-2">
            <h3 className="text-sm font-semibold text-[#24476B] sm:col-span-2">Andamento</h3>
            <label>
              <span className={ROTULO}>Nome do contato</span>
              <input name="contato_nome" defaultValue={a.contato_nome ?? ""} maxLength={120} className={CAMPO} />
            </label>
            <label>
              <span className={ROTULO}>E-mail do contato</span>
              <input name="contato_email" type="email" defaultValue={a.contato_email ?? ""} maxLength={160} className={CAMPO} />
            </label>
            <label>
              <span className={ROTULO}>E-mail enviado em</span>
              <input name="email_enviado_em" type="date" defaultValue={a.email_enviado_em ?? ""} className={CAMPO} />
            </label>
            <label>
              <span className={ROTULO}>Último contato</span>
              <input name="ultimo_contato_em" type="date" defaultValue={a.ultimo_contato_em ?? ""} className={CAMPO} />
            </label>
            <label className="sm:col-span-2">
              <span className={ROTULO}>Próximo passo</span>
              <input name="proximo_passo" defaultValue={a.proximo_passo ?? ""} maxLength={300} placeholder="Ex.: follow-up por WhatsApp, enviar apresentação" className={CAMPO} />
            </label>
            <label>
              <span className={ROTULO}>Até quando</span>
              <input name="proximo_em" type="date" defaultValue={a.proximo_em ?? ""} className={CAMPO} />
            </label>
            <label>
              <span className={ROTULO}>Responsável</span>
              <input name="responsavel" defaultValue={a.responsavel ?? ""} maxLength={60} className={CAMPO} />
            </label>
            <label className="sm:col-span-2">
              <span className={ROTULO}>Observações</span>
              <textarea name="observacoes" defaultValue={a.observacoes ?? ""} rows={3} maxLength={4000} className={CAMPO} />
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button type="submit" disabled={pendente} className="rounded-xl bg-[#24476B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480] disabled:opacity-50">
                {pendente ? "Salvando…" : "Salvar"}
              </button>
              {a.updated_at && (
                <span className="text-[12px] text-[#8A929B]">
                  Última alteração {dataHoraBR(a.updated_at)}
                  {a.updated_by ? ` · ${a.updated_by}` : ""}
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </li>
  );
}

export function Checklist({ inicial }: { inicial: Agencia[] }) {
  const [agencias, setAgencias] = useState(inicial);
  const [busca, setBusca] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [status, setStatus] = useState("");
  const [grupo, setGrupo] = useState<Grupo>("");

  // Nome de quem usa: fica só neste navegador (campo não controlado, lido na hora de salvar).
  const campoAutor = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      if (campoAutor.current) campoAutor.current.value = localStorage.getItem(CHAVE_AUTOR) ?? "";
    } catch {
      /* navegador sem storage */
    }
  }, []);
  const guardarAutor = (v: string) => {
    try {
      localStorage.setItem(CHAVE_AUTOR, v);
    } catch {
      /* sem storage */
    }
  };
  const autor = () => campoAutor.current?.value ?? "";

  const dia = hoje();
  const contagem = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of agencias) c.set(a.status, (c.get(a.status) ?? 0) + 1);
    return c;
  }, [agencias]);

  const indicadores: { id: Grupo; titulo: string; cor: string; fundo: string; n: number }[] = [
    { id: "", titulo: "Agências", cor: "#24476B", fundo: "#FFFFFF", n: agencias.length },
    { id: "abordar", titulo: "A abordar", cor: "#59636F", fundo: "#F7F8F9", n: agencias.filter((a) => noGrupo(a, "abordar", dia)).length },
    { id: "contatados", titulo: "E-mails enviados", cor: "#2F80C9", fundo: "#F4F8FD", n: agencias.filter((a) => noGrupo(a, "contatados", dia)).length },
    { id: "conversa", titulo: "Em conversa", cor: "#7C4FD1", fundo: "#F7F3FD", n: agencias.filter((a) => noGrupo(a, "conversa", dia)).length },
    { id: "parceiro", titulo: "Parceiros", cor: "#3A8C5A", fundo: "#F2F9F5", n: agencias.filter((a) => noGrupo(a, "parceiro", dia)).length },
    { id: "atrasados", titulo: "Atrasados", cor: "#B42318", fundo: "#FEF6F5", n: agencias.filter((a) => noGrupo(a, "atrasados", dia)).length },
  ];

  const visiveis = agencias
    .filter((a) => {
      if (!noGrupo(a, grupo, dia)) return false;
      if (prioridade && numPrioridade(a.prioridade) !== prioridade) return false;
      if (status && a.status !== status) return false;
      if (busca) {
        const t = busca.toLowerCase();
        const alvo = [a.conta, a.grupo, a.perfil, a.contato_nome, a.contato_email, a.responsavel].filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      return true;
    })
    .sort((x, y) => numPrioridade(x.prioridade).localeCompare(numPrioridade(y.prioridade)) || x.ordem - y.ordem);

  const atualizar = (nova: Agencia) => setAgencias((lista) => lista.map((a) => (a.ordem === nova.ordem ? nova : a)));
  const filtrosAtivos = !!(busca || prioridade || status || grupo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#626B75]">100 potenciais parceiros no Brasil · nov/2026</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#20252B] md:text-4xl">Prospecção de agências</h1>
        </div>
        <label className="text-[13px] text-[#626B75]">
          Seu nome (aparece nas alterações)
          <input ref={campoAutor} defaultValue="" onChange={(e) => guardarAutor(e.target.value)} maxLength={60} placeholder="Ex.: Wilson" className={`mt-1 block w-56 ${CAMPO}`} />
        </label>
      </div>

      {/* Indicadores clicáveis, como na lista de Clientes do CRM */}
      <section aria-label="Resumo">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {indicadores.map((ind) => {
            const sel = grupo === ind.id && ind.id !== "";
            return (
              <button
                key={ind.titulo}
                type="button"
                aria-pressed={sel}
                onClick={() => setGrupo(sel ? "" : ind.id)}
                className={`rounded-2xl border border-t-[3px] p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-18px_rgba(0,0,0,0.2)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 ${sel ? "ring-2" : "border-black/[0.06]"}`}
                style={{ backgroundColor: ind.fundo, borderTopColor: ind.cor, ...(sel ? { ["--tw-ring-color" as string]: ind.cor, borderColor: ind.cor } : {}) }}
              >
                <span className="block text-[13px] font-medium text-[#626B75]">{ind.titulo}</span>
                <span className="mt-0.5 block text-[28px] font-semibold leading-tight tabular-nums" style={{ color: ind.cor }}>
                  {ind.n}
                </span>
                {sel && <span className="text-[12px] text-[#626B75]">Filtrando · clique para remover</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Distribuição por status */}
      <section className={`${CARD} p-4`} aria-label="Distribuição por status">
        <div className="flex h-3 overflow-hidden rounded-full bg-[#F1F3F5]" role="img" aria-label="Agências por status">
          {STATUS_AGENCIA.map((s) => {
            const n = contagem.get(s.id) ?? 0;
            return n ? <span key={s.id} title={`${s.label}: ${n}`} style={{ width: `${(n / Math.max(agencias.length, 1)) * 100}%`, backgroundColor: s.forte }} /> : null;
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_AGENCIA.map((s) => {
            const n = contagem.get(s.id) ?? 0;
            const sel = status === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(sel ? "" : s.id)}
                aria-pressed={sel}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition ${sel ? "ring-2" : "hover:brightness-95"} ${n ? "" : "opacity-50"}`}
                style={{ color: s.cor, backgroundColor: s.fundo, ["--tw-ring-color" as string]: s.forte }}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: s.forte }} />
                {s.label}
                <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Busca e filtros */}
      <section className={`${CARD} p-4`} aria-label="Busca e filtros">
        <div className="flex flex-wrap items-center gap-3">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar agência, grupo, contato…" aria-label="Buscar" className={`${CAMPO} min-w-[220px] flex-1`} />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Prioridade">
            {PRIORIDADES.map((p) => {
              const c = PRIORIDADE_COR[p.id];
              const sel = prioridade === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrioridade(p.id)}
                  aria-pressed={sel}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${sel ? "" : "border-[#D5DAE0] bg-white text-[#20252B] hover:border-[#24476B]/50"}`}
                  style={sel ? { color: c ? c.cor : "#FFFFFF", backgroundColor: c ? c.fundo : "#24476B", borderColor: c ? c.cor : "#24476B" } : undefined}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {filtrosAtivos && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setPrioridade("");
                setStatus("");
                setGrupo("");
              }}
              className="text-[13px] font-medium text-[#626B75] underline-offset-2 hover:text-[#20252B] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      <div>
        <div className="mb-2 hidden px-4 text-[12px] font-medium text-[#8A929B] md:grid md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(0,1.7fr)_2rem] md:gap-4">
          <span>Agência · {visiveis.length}</span>
          <span>Status</span>
          <span>E-mail</span>
          <span>Próximo passo</span>
          <span />
        </div>
        <ul className="space-y-2.5">
          {visiveis.map((a) => (
            <LinhaAgencia key={a.ordem} a={a} autor={autor} aoSalvar={atualizar} />
          ))}
        </ul>
        {visiveis.length === 0 && (
          <div className={`${CARD} mt-2 px-6 py-10 text-center`}>
            <p className="text-base font-semibold text-[#20252B]">Nenhuma agência com esses filtros</p>
          </div>
        )}
      </div>

      <p className="text-[12px] text-[#8A929B]">
        Prioridade 1 · Abordar: 12 contas com motivo concreto para testar a indicação. 2 · Qualificar: confirmar volume de lazer internacional e pedidos de Japão antes da proposta. 3 · Estratégica:
        compra centralizada — achar primeiro quem decide sobre produto e parcerias.
      </p>
    </div>
  );
}
