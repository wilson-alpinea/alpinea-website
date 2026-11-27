"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { salvarAgencia } from "./actions";
import { STATUS_AGENCIA, statusInfo, type Agencia, type Alteracao } from "./dados";

// Checklist de prospecção (Wilson, 27/nov/2026). Status salva na hora; os
// demais campos salvam no botão "Salvar" de cada agência. O nome de quem
// está usando fica só neste navegador e vai junto em cada alteração.

const PRIORIDADES = [
  { id: "", label: "Todas" },
  { id: "1", label: "1 · Abordar" },
  { id: "2", label: "2 · Qualificar" },
  { id: "3", label: "3 · Estratégica" },
];
const CAMPO = "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#24476B]";
const ROTULO = "mb-1 block text-[12px] text-[#626B75]";
const CHAVE_AUTOR = "ajisai_prospeccao_autor";

const hoje = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);
const dataBR = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—");
const dataHoraBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "";
const numPrioridade = (p: string | null) => (p ?? "").trim().charAt(0);

function LinhaAgencia({ a, autor, aoSalvar }: { a: Agencia; autor: () => string; aoSalvar: (nova: Agencia) => void }) {
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const atrasado = !!a.proximo_em && a.proximo_em < hoje() && !["parceiro", "sem_interesse", "pausado"].includes(a.status);

  const salvar = (alteracao: Alteracao) => {
    setErro(null);
    iniciar(async () => {
      const r = await salvarAgencia(a.ordem, alteracao, autor());
      if (r.ok) {
        aoSalvar(r.agencia);
        setSalvoEm(new Date().toISOString());
      } else setErro(r.erro);
    });
  };

  const enviarForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const campos = ["contato_nome", "contato_email", "email_enviado_em", "ultimo_contato_em", "proximo_passo", "proximo_em", "responsavel", "observacoes"] as const;
    salvar(Object.fromEntries(campos.map((c) => [c, String(f.get(c) ?? "")])) as Alteracao);
  };

  const marcarEmailHoje = () => {
    const alteracao: Alteracao = { email_enviado_em: hoje(), ultimo_contato_em: hoje() };
    if (a.status === "a_abordar" || a.status === "buscando_contato") alteracao.status = "email_enviado";
    salvar(alteracao);
  };

  return (
    <li className={`rounded-2xl border bg-white transition ${aberto ? "border-black/15 shadow-[0_16px_32px_-20px_rgba(0,0,0,0.25)]" : "border-black/5"}`}>
      <div className="grid items-center gap-3 p-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.8fr)_auto]">
        <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="min-w-0 text-left">
          <span className="flex items-baseline gap-2">
            <span className="text-[12px] tabular-nums text-[#8A929B]">{a.ordem}</span>
            <span className="truncate text-[15px] font-medium text-[#20252B]">{a.conta}</span>
          </span>
          <span className="block truncate pl-6 text-[12px] text-[#626B75]">
            {a.prioridade ?? "—"} · {a.perfil ?? "—"}
            {a.grupo && a.grupo !== a.conta ? ` · ${a.grupo}` : ""}
          </span>
        </button>

        <label className="min-w-0">
          <span className="sr-only">Status de {a.conta}</span>
          <select
            value={a.status}
            disabled={pendente}
            onChange={(e) => salvar({ status: e.target.value })}
            className="w-full cursor-pointer rounded-full border-0 px-3 py-1.5 text-[13px] font-medium outline-none ring-1 ring-black/5 focus:ring-[#24476B]"
            style={{ color: statusInfo(a.status).cor, backgroundColor: statusInfo(a.status).fundo }}
          >
            {STATUS_AGENCIA.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="text-[13px]">
          {a.email_enviado_em ? (
            <span className="text-[#20252B]">
              <span aria-hidden="true">✓ </span>E-mail {dataBR(a.email_enviado_em)}
            </span>
          ) : (
            <button type="button" onClick={marcarEmailHoje} disabled={pendente} className="rounded-full border border-black/15 px-3 py-1 text-[12px] text-[#20252B] hover:border-black/40 disabled:opacity-50">
              Enviei o e-mail hoje
            </button>
          )}
        </div>

        <div className="min-w-0 text-[13px]">
          {a.proximo_passo ? (
            <>
              <span className="block truncate text-[#20252B]">{a.proximo_passo}</span>
              {a.proximo_em && <span className={atrasado ? "font-medium text-red-700" : "text-[#626B75]"}>{atrasado ? "Atrasado — " : "Até "}{dataBR(a.proximo_em)}</span>}
            </>
          ) : (
            <span className="text-[#8A929B]">Sem próximo passo</span>
          )}
        </div>

        <button type="button" onClick={() => setAberto((v) => !v)} aria-label={aberto ? `Fechar ${a.conta}` : `Abrir ${a.conta}`} className="hidden h-8 w-8 items-center justify-center rounded-full text-[#626B75] hover:bg-black/5 md:flex">
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 transition ${aberto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {(erro || pendente || salvoEm) && (
        <p className={`px-4 pb-2 text-[12px] ${erro ? "text-red-700" : "text-[#626B75]"}`}>{erro ?? (pendente ? "Salvando…" : "Salvo.")}</p>
      )}

      {aberto && (
        <div className="grid gap-6 border-t border-black/5 p-4 md:grid-cols-2 md:p-5">
          <div className="space-y-3 text-[13px]">
            {[
              ["Por que conversar", a.por_que],
              ["Quem procurar", a.quem_procurar],
              ["Proposta inicial", a.proposta_inicial],
              ["Parceria proposta", a.parceria],
              [
                "Porte",
                [
                  a.posicao_panrotas ? `${a.posicao_panrotas}º PANROTAS` : null,
                  a.vendas_2025_mi ? `vendas 2025 R$ ${a.vendas_2025_mi.toLocaleString("pt-BR")} mi` : null,
                  a.evidencia_porte,
                ]
                  .filter(Boolean)
                  .join(" · "),
              ],
              ["Indicador", a.detalhe_indicador],
              ["Contato público", a.contato_publico],
              ["Na lista anterior?", a.lista_anterior],
            ]
              .filter(([, v]) => v)
              .map(([r, v]) => (
                <div key={r as string}>
                  <p className="text-[12px] text-[#626B75]">{r}</p>
                  <p className="text-[#20252B]">{v}</p>
                </div>
              ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ["Abrir canal", a.link_canal],
                ["Ver evidência", a.link_evidencia],
                ["Fonte adicional", a.link_extra],
              ]
                .filter(([, u]) => u)
                .map(([t, u]) => (
                  <a key={t as string} href={u as string} target="_blank" rel="noreferrer" className="rounded-full border border-black/15 px-3 py-1 text-[12px] text-[#24476B] hover:border-[#24476B]">
                    {t} ↗
                  </a>
                ))}
            </div>
          </div>

          <form onSubmit={enviarForm} className="grid content-start gap-3 sm:grid-cols-2" key={a.updated_at ?? "novo"}>
            <label className="sm:col-span-1">
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
              <button type="submit" disabled={pendente} className="rounded-xl bg-[#24476B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C5480] disabled:opacity-50">
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
  const [soAtrasados, setSoAtrasados] = useState(false);
  // Nome de quem usa: fica só neste navegador (campo não controlado, lido
  // na hora de salvar).
  const campoAutor = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      if (campoAutor.current) campoAutor.current.value = localStorage.getItem(CHAVE_AUTOR) ?? "";
    } catch {
      /* navegador sem storage: segue sem nome */
    }
  }, []);
  const mudarAutor = (v: string) => {
    try {
      localStorage.setItem(CHAVE_AUTOR, v);
    } catch {
      /* sem storage */
    }
  };
  const autor = () => campoAutor.current?.value ?? "";

  const contagem = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of agencias) c.set(a.status, (c.get(a.status) ?? 0) + 1);
    return c;
  }, [agencias]);
  const hojeISO = hoje();
  const kpis = [
    ["Agências", agencias.length],
    ["E-mails enviados", agencias.filter((a) => a.email_enviado_em).length],
    ["Responderam", agencias.filter((a) => ["respondeu", "reuniao", "proposta", "parceiro"].includes(a.status)).length],
    ["Reuniões / propostas", agencias.filter((a) => ["reuniao", "proposta"].includes(a.status)).length],
    ["Parceiros fechados", contagem.get("parceiro") ?? 0],
    ["Próximo passo atrasado", agencias.filter((a) => a.proximo_em && a.proximo_em < hojeISO && !["parceiro", "sem_interesse", "pausado"].includes(a.status)).length],
  ] as const;

  const visiveis = agencias
    .filter((a) => {
      if (prioridade && numPrioridade(a.prioridade) !== prioridade) return false;
      if (status && a.status !== status) return false;
      if (soAtrasados && !(a.proximo_em && a.proximo_em < hojeISO)) return false;
      if (busca) {
        const t = busca.toLowerCase();
        const alvo = [a.conta, a.grupo, a.perfil, a.contato_nome, a.contato_email, a.responsavel].filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      return true;
    })
    .sort((x, y) => numPrioridade(x.prioridade).localeCompare(numPrioridade(y.prioridade)) || x.ordem - y.ordem);

  const atualizar = (nova: Agencia) => setAgencias((lista) => lista.map((a) => (a.ordem === nova.ordem ? nova : a)));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#626B75]">100 potenciais parceiros no Brasil · nov/2026</p>
          <h1 className="mt-1 text-3xl font-medium md:text-4xl">Prospecção de agências</h1>
        </div>
        <label className="text-[12px] text-[#626B75]">
          Seu nome (aparece nas alterações)
          <input ref={campoAutor} defaultValue="" onChange={(e) => mudarAutor(e.target.value)} maxLength={60} placeholder="Ex.: Wilson" className={`mt-1 block w-56 ${CAMPO}`} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(([r, v]) => (
          <div key={r} className="rounded-xl border border-black/5 bg-white p-4">
            <p className="text-[12px] text-[#626B75]">{r}</p>
            <p className={`mt-1 text-2xl font-medium tabular-nums ${r === "Próximo passo atrasado" && v > 0 ? "text-red-700" : ""}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar agência, grupo, contato…" aria-label="Buscar" className={`w-full sm:w-72 ${CAMPO}`} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Prioridade">
          {PRIORIDADES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPrioridade(p.id)}
              aria-pressed={prioridade === p.id}
              className={`rounded-full border px-3 py-1.5 text-[13px] ${prioridade === p.id ? "border-[#20252B] bg-[#20252B] text-white" : "border-black/15 bg-white text-[#20252B] hover:border-black/40"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status" className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-[13px]">
          <option value="">Todos os status</option>
          {STATUS_AGENCIA.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({contagem.get(s.id) ?? 0})
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px] text-[#20252B]">
          <input type="checkbox" checked={soAtrasados} onChange={(e) => setSoAtrasados(e.target.checked)} className="h-4 w-4 accent-[#24476B]" />
          Só atrasados
        </label>
      </div>

      <div className="mt-4 hidden px-4 text-[12px] text-[#8A929B] md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.8fr)_2rem] md:gap-3">
        <span>Agência</span>
        <span>Status</span>
        <span>E-mail</span>
        <span>Próximo passo</span>
        <span />
      </div>
      <p className="mt-2 text-[12px] text-[#8A929B] md:hidden">{visiveis.length} agência(s)</p>
      <ul className="mt-2 space-y-2">
        {visiveis.map((a) => (
          <LinhaAgencia key={a.ordem} a={a} autor={autor} aoSalvar={atualizar} />
        ))}
      </ul>
      {visiveis.length === 0 && <p className="mt-6 text-center text-sm text-[#626B75]">Nenhuma agência com esses filtros.</p>}

      <p className="mt-8 text-[12px] text-[#8A929B]">
        Prioridade 1 · Abordar: 12 contas com motivo concreto para testar a indicação. 2 · Qualificar: confirmar volume de lazer internacional e pedidos de Japão antes da proposta. 3 · Estratégica: compra
        centralizada — achar primeiro quem decide sobre produto e parcerias.
      </p>
    </div>
  );
}
