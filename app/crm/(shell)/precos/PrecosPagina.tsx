"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { publicarPrecos, salvarPrecos } from "../../precosActions";
import type { Aplica, ItemParametro, UnidadeParametro } from "./catalogo";

// Tela de preços e margens (Wilson, 04/nov/2026). Edita tudo localmente e
// salva de uma vez (com revisão das mudanças); ao salvar, o site é
// republicado com os novos valores (Deploy Hook do Vercel).

export type ParametroTela = ItemParametro & { noAr: number; salvo: number | null; salvoEm: string | null; salvoPor: string | null };
export type HistoricoPreco = { rotulo: string; unidade: UnidadeParametro; anterior: number | null; novo: number | null; em: string; por: string | null };
type Grupo = { id: string; nome: string; descricao: string };

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const AZUL = "#24476B";

// ── Números ──
const paraTela = (v: number, u: UnidadeParametro) => (u === "fracao" ? Math.round(v * 100 * 1e6) / 1e6 : v);
const daTela = (v: number, u: UnidadeParametro) => (u === "fracao" ? Number((v / 100).toPrecision(12)) : v);
const fmtNum = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
function lerNumero(texto: string): number | null {
  const t = texto.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "" || !/^\d*\.?\d*$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function fmtValor(v: number, u: UnidadeParametro) {
  const n = fmtNum(paraTela(v, u));
  if (u === "BRL") return `R$ ${n}`;
  if (u === "USD") return `US$ ${n}`;
  if (u === "JPY") return `¥ ${n}`;
  if (u === "mult") return `× ${n}`;
  if (u === "fracao" || u === "pct") return `${n}%`;
  return n;
}
const PREFIXO: Partial<Record<UnidadeParametro, string>> = { BRL: "R$", USD: "US$", JPY: "¥", mult: "×" };
const SUFIXO: Partial<Record<UnidadeParametro, string>> = { fracao: "%", pct: "%" };

function dica(p: ParametroTela) {
  if (p.unidade === "mult") {
    const pct = Math.round((p.padrao - 1) * 1000) / 10;
    return `padrão ${fmtValor(p.padrao, p.unidade)} (${pct >= 0 ? "+" : ""}${fmtNum(pct)}%)`;
  }
  return `padrão ${fmtValor(p.padrao, p.unidade)}`;
}

function precoVenda(custo: number, aplica: Aplica, val: (id: string) => number): number {
  const imposto = val("geral.imposto");
  const margem = val("geral.margemPadrao");
  switch (aplica) {
    case "padrao": return Math.round(custo * imposto * margem);
    case "imposto": return Math.round(custo * imposto);
    case "motorista": return Math.round(custo * val("motorista.margem"));
    case "transfer": return Math.round(custo * val("transfer.margem"));
    case "jrpass": return Math.round(custo * val("jrpass.margem"));
    case "guiaBr": return Math.round(custo * val("guia.margemBrasileiro"));
    case "guiaEstr": return Math.round((custo / val("geral.jpyPorUsdReferencia")) * imposto * margem);
    case "limousine": return Math.round((custo / val("geral.jpyPorUsdReferencia")) * val("limousine.margem"));
  }
}
/** Valor salvo no CRM ou, se não houver, o padrão do código. */
const efetivo = (p: ParametroTela) => p.salvo ?? p.padrao;
const moedaVenda = (p: ParametroTela): UnidadeParametro => (p.aplica === "guiaEstr" || p.aplica === "limousine" ? "USD" : p.unidade);

export function PrecosPagina({
  grupos,
  parametros,
  historico,
  erroBanco,
  hookConfigurado,
}: {
  grupos: Grupo[];
  parametros: ParametroTela[];
  historico: HistoricoPreco[];
  erroBanco: boolean;
  hookConfigurado: boolean;
}) {
  const porId = useMemo(() => new Map(parametros.map((p) => [p.id, p])), [parametros]);
  const [edicoes, setEdicoes] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [revisando, setRevisando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();
  const [verHistorico, setVerHistorico] = useState(false);

  /** Valor atual na tela (editado ou salvo), na unidade guardada. */
  const valor = (id: string): number => {
    const p = porId.get(id);
    if (!p) return 0;
    const t = edicoes[id];
    if (t !== undefined) {
      const n = lerNumero(t);
      if (n !== null) return daTela(n, p.unidade);
    }
    return efetivo(p);
  };

  const mudancas = useMemo(() => {
    const out: { p: ParametroTela; novo: number }[] = [];
    for (const [id, t] of Object.entries(edicoes)) {
      const p = porId.get(id);
      const n = lerNumero(t);
      if (!p || n === null) continue;
      const novo = daTela(n, p.unidade);
      if (Math.abs(novo - efetivo(p)) > 1e-9) out.push({ p, novo });
    }
    return out;
  }, [edicoes, porId]);
  const invalidos = Object.entries(edicoes).filter(([, t]) => lerNumero(t) === null).length;
  const aguardando = parametros.filter((p) => Math.abs(efetivo(p) - p.noAr) > 1e-9);
  const alterados = parametros.filter((p) => p.salvo !== null).length;

  const termo = busca.trim().toLowerCase();
  const visivel = (p: ParametroTela) => !termo || `${p.rotulo} ${p.secao} ${p.coluna ?? ""} ${grupos.find((g) => g.id === p.grupo)?.nome ?? ""}`.toLowerCase().includes(termo);

  const salvar = () =>
    iniciar(async () => {
      const r = await salvarPrecos(mudancas.map((m) => ({ id: m.p.id, valor: m.novo })));
      setAviso({ ok: r.ok, texto: r.mensagem });
      if (r.ok) {
        setEdicoes({});
        setRevisando(false);
      }
    });
  const publicar = () =>
    iniciar(async () => {
      const r = await publicarPrecos();
      setAviso({ ok: r.ok, texto: r.mensagem });
    });

  const campo = (p: ParametroTela, compacto = false) => {
    const texto = edicoes[p.id] ?? fmtNum(paraTela(efetivo(p), p.unidade)).replace(/\./g, "");
    const n = lerNumero(texto);
    const invalido = n === null;
    const atual = invalido ? efetivo(p) : daTela(n, p.unidade);
    const mudou = Math.abs(atual - efetivo(p)) > 1e-9;
    const foraDoPadrao = Math.abs(atual - p.padrao) > 1e-9;
    return (
      <div className={compacto ? "min-w-[7.5rem]" : "w-full sm:w-44"}>
        <div
          className={`flex items-center rounded-lg border bg-white px-2.5 transition focus-within:ring-2 focus-within:ring-[#24476B]/25 ${
            invalido ? "border-[#B42318]" : mudou ? "border-[#B7791F] bg-[#FFFBEB]" : "border-black/10"
          }`}
        >
          {PREFIXO[p.unidade] && <span className="mr-1 text-[12px] text-[#626B75]">{PREFIXO[p.unidade]}</span>}
          <input
            type="text"
            inputMode="decimal"
            aria-label={[p.secao, p.rotulo, p.coluna].filter(Boolean).join(" — ")}
            aria-invalid={invalido}
            value={texto}
            onChange={(e) => setEdicoes((s) => ({ ...s, [p.id]: e.target.value }))}
            className="w-full min-w-0 bg-transparent py-1.5 text-right text-sm tabular-nums text-[#20252B] outline-none"
          />
          {SUFIXO[p.unidade] && <span className="ml-1 text-[12px] text-[#626B75]">{SUFIXO[p.unidade]}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] leading-4 text-[#626B75]">
          {foraDoPadrao ? (
            <button
              type="button"
              onClick={() => setEdicoes((s) => ({ ...s, [p.id]: fmtNum(paraTela(p.padrao, p.unidade)).replace(/\./g, "") }))}
              className="text-left text-[#24476B] hover:underline"
              title={dica(p)}
            >
              Restaurar {compacto ? "" : dica(p)}
            </button>
          ) : (
            !compacto && <span>{dica(p)}</span>
          )}
          {p.aplica && !invalido && (
            <span className="whitespace-nowrap" title="Preço de venda com as margens atuais">
              venda ≈ {fmtValor(precoVenda(atual, p.aplica, valor), moedaVenda(p))}
            </span>
          )}
        </div>
        {!compacto && Math.abs(p.noAr - efetivo(p)) > 1e-9 && (
          <p className="mt-0.5 text-[11px] text-[#B7791F]">No ar: {fmtValor(p.noAr, p.unidade)} — aguardando publicação</p>
        )}
      </div>
    );
  };

  return (
    <div className="pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#20252B] md:text-3xl">Preços e margens</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#626B75]">
            Todos os custos, margens e taxas usados nos cálculos do site, das calculadoras e da Calculadora Reversa. Ao salvar, o site é
            republicado com os novos valores em poucos minutos. Visível só para administradores.
          </p>
        </div>
        <div className="text-right text-[13px] text-[#626B75]">
          {alterados} de {parametros.length} valores diferentes do padrão do código
        </div>
      </div>

      {erroBanco && (
        <p role="alert" className="mt-6 rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
          Não foi possível ler a tabela de preços. Rode a migração <code>supabase/migrations/035_precos_parametros.sql</code> no Supabase. Até lá,
          a tela mostra os valores padrão e não é possível salvar.
        </p>
      )}
      {!hookConfigurado && (
        <p className="mt-6 rounded-xl border border-[#B7791F]/25 bg-[#FFFBEB] px-4 py-3 text-sm text-[#7A4E0E]">
          Republicação automática desligada: falta a variável <code>VERCEL_DEPLOY_HOOK_PRECOS</code> no Vercel. Os valores salvos entram no ar
          no próximo deploy.
        </p>
      )}
      {aguardando.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#B7791F]/25 bg-[#FFFBEB] px-4 py-3 text-sm text-[#7A4E0E]">
          <span>
            {aguardando.length} valor(es) salvo(s) ainda não estão no ar. Se salvou há poucos minutos, a republicação provavelmente está em
            andamento.
          </span>
          {hookConfigurado && (
            <button type="button" onClick={publicar} disabled={pendente} className="rounded-full border border-[#7A4E0E]/30 px-4 py-1.5 font-medium hover:bg-white disabled:opacity-50">
              Publicar agora
            </button>
          )}
        </div>
      )}
      {aviso && (
        <p role="status" className={`mt-6 rounded-xl px-4 py-3 text-sm ${aviso.ok ? "border border-[#27675B]/20 bg-[#ECF6F3] text-[#1F5A4F]" : "border border-[#B42318]/20 bg-[#FDECEA] text-[#B42318]"}`}>
          {aviso.texto}
        </p>
      )}

      <div className="sticky top-[73px] z-30 -mx-6 mt-6 border-b border-black/[0.06] bg-[#FAF9F6]/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar (ex.: hotel 5 estrelas, Narita, margem, JR Pass)"
          aria-label="Buscar parâmetro"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#24476B]/25"
        />
        <nav aria-label="Grupos" className="mt-2.5 flex gap-2 overflow-x-auto pb-1 text-[13px]">
          {grupos.map((g) => {
            const n = parametros.filter((p) => p.grupo === g.id && visivel(p)).length;
            if (n === 0) return null;
            return (
              <a key={g.id} href={`#grupo-${g.id}`} className="whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1 text-[#20252B] hover:border-[#24476B]/40">
                {g.nome}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-6">
        {grupos.map((g) => {
          const itens = parametros.filter((p) => p.grupo === g.id && visivel(p));
          if (itens.length === 0) return null;
          const secoes: string[] = [];
          for (const p of itens) if (!secoes.includes(p.secao)) secoes.push(p.secao);
          return (
            <section key={g.id} id={`grupo-${g.id}`} className={`scroll-mt-40 rounded-2xl border border-t-[3px] border-black/[0.06] bg-white p-5 md:p-6 ${SOMBRA}`} style={{ borderTopColor: AZUL }}>
              <h2 className="text-lg text-[#20252B]">{g.nome}</h2>
              <p className="mt-0.5 text-[13px] text-[#626B75]">{g.descricao}</p>
              <div className="mt-4 space-y-6">
                {secoes.map((sec) => {
                  const doSec = itens.filter((p) => p.secao === sec);
                  const matriz = doSec.every((p) => p.coluna);
                  return (
                    <div key={sec || "_"} className="border-t border-black/[0.06] pt-4 first:border-t-0 first:pt-0">
                      {sec && <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#626B75]">{sec}</h3>}
                      {matriz ? <Matriz itens={doSec} campo={campo} /> : (
                        <ul className="divide-y divide-black/[0.05]">
                          {doSec.map((p) => (
                            <li key={p.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 pt-1.5">
                                <p className="text-sm text-[#20252B]">{p.rotulo}</p>
                                {p.nota && <p className="mt-0.5 text-[12px] text-[#626B75]">{p.nota}</p>}
                                {p.salvoEm && (
                                  <p className="mt-0.5 text-[11px] text-[#8A939C]">
                                    Alterado em {new Date(p.salvoEm).toLocaleString("pt-BR")}
                                    {p.salvoPor ? ` por ${p.salvoPor}` : ""}
                                  </p>
                                )}
                              </div>
                              {campo(p)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className={`mt-6 rounded-2xl border border-black/[0.06] bg-white p-5 md:p-6 ${SOMBRA}`}>
        <button type="button" onClick={() => setVerHistorico((v) => !v)} className="flex w-full items-center justify-between text-left" aria-expanded={verHistorico}>
          <h2 className="text-lg text-[#20252B]">Histórico de alterações</h2>
          <span className="text-[13px] text-[#24476B]">{verHistorico ? "Ocultar" : `Ver (${historico.length})`}</span>
        </button>
        {verHistorico && (
          historico.length === 0 ? (
            <p className="mt-3 text-sm text-[#626B75]">Nenhuma alteração ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/[0.05] text-sm">
              {historico.map((h, i) => (
                <li key={i} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-[#20252B]">{h.rotulo}</span>
                  <span className="whitespace-nowrap text-[#626B75]">
                    {h.anterior == null ? "—" : fmtValor(h.anterior, h.unidade)} → <strong className="font-medium text-[#20252B]">{h.novo == null ? "—" : fmtValor(h.novo, h.unidade)}</strong>
                    {" · "}
                    {new Date(h.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    {h.por ? ` · ${h.por}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )
        )}
      </section>

      {(mudancas.length > 0 || invalidos > 0) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 md:px-10">
            <span className="text-sm text-[#20252B]">
              {mudancas.length} alteração(ões)
              {invalidos > 0 && <span className="text-[#B42318]"> · {invalidos} valor(es) inválido(s)</span>}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEdicoes({})} disabled={pendente} className="rounded-full border border-black/15 px-4 py-2 text-sm text-[#20252B] hover:bg-black/[0.03] disabled:opacity-50">
                Descartar
              </button>
              <button
                type="button"
                onClick={() => setRevisando(true)}
                disabled={pendente || invalidos > 0 || mudancas.length === 0 || erroBanco}
                className="rounded-full bg-[#24476B] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c3956] disabled:opacity-50"
              >
                Revisar e salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {revisando &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="titulo-revisao">
            <div className="flex max-h-[85svh] w-full max-w-2xl flex-col rounded-t-2xl bg-white sm:rounded-2xl">
              <div className="border-b border-black/[0.06] px-5 py-4">
                <h2 id="titulo-revisao" className="text-lg text-[#20252B]">Confirmar alterações</h2>
                <p className="mt-0.5 text-[13px] text-[#626B75]">Depois de salvar, o site inteiro passa a calcular com estes valores (republicação em 2 a 5 minutos).</p>
              </div>
              <ul className="flex-1 divide-y divide-black/[0.05] overflow-y-auto px-5 text-sm">
                {mudancas.map(({ p, novo }) => (
                  <li key={p.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                    <span className="text-[#20252B]">{[p.secao, p.rotulo, p.coluna].filter(Boolean).join(" · ")}</span>
                    <span className="whitespace-nowrap text-[#626B75]">
                      {fmtValor(efetivo(p), p.unidade)} → <strong className="font-medium text-[#20252B]">{fmtValor(novo, p.unidade)}</strong>
                      {p.unidade === "mult" && (novo < 1 && p.id.includes("margem") ? <span className="ml-1 text-[#B42318]">(abaixo do custo)</span> : null)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-2 border-t border-black/[0.06] px-5 py-3">
                <button type="button" onClick={() => setRevisando(false)} disabled={pendente} className="rounded-full border border-black/15 px-4 py-2 text-sm text-[#20252B] hover:bg-black/[0.03]">
                  Voltar
                </button>
                <button type="button" onClick={salvar} disabled={pendente} className="rounded-full bg-[#24476B] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c3956] disabled:opacity-50">
                  {pendente ? "Salvando…" : "Salvar e publicar"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function Matriz({ itens, campo }: { itens: ParametroTela[]; campo: (p: ParametroTela, compacto?: boolean) => ReactNode }) {
  const linhas: string[] = [];
  const colunas: string[] = [];
  for (const p of itens) {
    if (!linhas.includes(p.rotulo)) linhas.push(p.rotulo);
    if (!colunas.includes(p.coluna!)) colunas.push(p.coluna!);
  }
  const achar = (l: string, c: string) => itens.find((p) => p.rotulo === l && p.coluna === c);
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full border-separate border-spacing-x-2 border-spacing-y-1 text-sm">
        <thead>
          <tr>
            <th className="text-left text-[12px] font-medium text-[#626B75]" />
            {colunas.map((c) => (
              <th key={c} className="whitespace-nowrap text-left text-[12px] font-medium text-[#626B75]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l}>
              <th scope="row" className="whitespace-nowrap pr-2 pt-1.5 text-left align-top text-sm font-normal text-[#20252B]">{l}</th>
              {colunas.map((c) => {
                const p = achar(l, c);
                return <td key={c} className="align-top">{p ? campo(p, true) : null}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
