"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { publicarPrecos, salvarPrecos } from "../../precosActions";
import type { Aplica, ItemParametro, UnidadeParametro } from "./catalogo";
import { simular, type Simulacao } from "./simulacoes";

// Tela de preços e margens (Wilson, 04/nov/2026). Edita tudo localmente e
// salva de uma vez (com revisão das mudanças); ao salvar, o site é
// republicado com os novos valores (Deploy Hook do Vercel).

export type ParametroTela = ItemParametro & { noAr: number; salvo: number | null; salvoEm: string | null; salvoPor: string | null };
export type HistoricoPreco = { rotulo: string; unidade: UnidadeParametro; anterior: number | null; novo: number | null; em: string; por: string | null };
export type ProdutoTela = { id: string; categoria: string; nome: string; icone: string; onde: string; descricao: string };
export type CategoriaTela = { id: string; nome: string; cor: string };

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
  categorias,
  produtos,
  parametros,
  historico,
  erroBanco,
  hookConfigurado,
}: {
  categorias: CategoriaTela[];
  produtos: ProdutoTela[];
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
  const nomeProduto = (id: string) => produtos.find((g) => g.id === id)?.nome ?? "";
  const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visivel = (p: ParametroTela) => !termo || semAcento(`${p.rotulo} ${p.secao} ${p.coluna ?? ""} ${nomeProduto(p.grupo)}`).includes(semAcento(termo));

  // Produto aberto: guardado no endereço (#roteiro), para voltar/compartilhar.
  const [aberto, setAberto] = useState<string>("visao");
  useEffect(() => {
    const ler = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      setAberto(produtos.some((g) => g.id === h) ? h : "visao");
    };
    ler();
    window.addEventListener("hashchange", ler);
    return () => window.removeEventListener("hashchange", ler);
  }, [produtos]);
  const abrir = (id: string) => {
    setBusca("");
    setAberto(id);
    history.replaceState(null, "", id === "visao" ? window.location.pathname : `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const doProduto = (id: string) => parametros.filter((p) => p.grupo === id);
  const editadosNo = (id: string) => mudancas.filter((m) => m.p.grupo === id).length;
  const alteradosNo = (id: string) => doProduto(id).filter((p) => p.salvo !== null).length;
  const corDe = (prod: ProdutoTela) => categorias.find((c) => c.id === prod.categoria)?.cor ?? AZUL;
  const simulacaoDe = (id: string): Simulacao | null => {
    try {
      return simular(id, valor);
    } catch {
      return null;
    }
  };
  const precoBase = (id: string) => simulacaoDe(id)?.linhas.find((l) => l.base) ?? null;

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

  // Seções de parâmetros (lista ou tabela) de um conjunto de itens.
  const secoesDe = (itens: ParametroTela[]) => {
    const secoes: string[] = [];
    for (const p of itens) if (!secoes.includes(p.secao)) secoes.push(p.secao);
    return secoes.map((sec) => {
      const doSec = itens.filter((p) => p.secao === sec);
      const matriz = doSec.every((p) => p.coluna);
      return (
        <section key={sec || "_"} className={`rounded-2xl border border-black/[0.06] bg-white p-5 md:p-6 ${SOMBRA}`}>
          {sec && <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#626B75]">{sec}</h3>}
          {matriz ? (
            <Matriz itens={doSec} campo={campo} />
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {doSec.map((p) => (
                <li key={p.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
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
        </section>
      );
    });
  };

  const produtoAberto = produtos.find((g) => g.id === aberto) ?? null;
  const resultados = termo ? parametros.filter(visivel) : [];

  return (
    <div className="pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#20252B] md:text-3xl">Preços e margens</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#626B75]">
            Custos, margens e taxas de todos os cálculos do site, por produto. Ao salvar, o site é republicado com os novos valores em poucos
            minutos. Visível só para administradores.
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        {/* ── Menu de produtos ── */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A939C]" aria-hidden="true">
              <circle cx="9" cy="9" r="5.5" />
              <path d="M13.5 13.5L17 17" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar em todos os produtos"
              aria-label="Buscar parâmetro em todos os produtos"
              className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#24476B]/25"
            />
          </div>

          {/* Celular: seletor nativo */}
          <label className="mt-3 block lg:hidden">
            <span className="sr-only">Produto</span>
            <select
              value={aberto}
              onChange={(e) => abrir(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-[#20252B]"
            >
              <option value="visao">Visão geral — todos os produtos</option>
              {categorias.map((c) => (
                <optgroup key={c.id} label={c.nome}>
                  {produtos
                    .filter((g) => g.categoria === c.id)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nome}
                        {editadosNo(g.id) ? ` (${editadosNo(g.id)} não salvas)` : ""}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          {/* Desktop: menu lateral */}
          <nav aria-label="Produtos" className="mt-4 hidden lg:block">
            <BotaoMenu ativo={aberto === "visao" && !termo} onClick={() => abrir("visao")} cor={AZUL} icone="svg:grid" nome="Visão geral" />
            {categorias.map((c) => {
              const lista = produtos.filter((g) => g.categoria === c.id);
              if (!lista.length) return null;
              return (
                <div key={c.id} className="mt-5">
                  <p className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.cor }}>
                    <span aria-hidden="true" className="h-3 w-[3px] rounded-full" style={{ backgroundColor: c.cor }} />
                    {c.nome}
                  </p>
                  {lista.map((g) => (
                    <BotaoMenu
                      key={g.id}
                      ativo={aberto === g.id && !termo}
                      onClick={() => abrir(g.id)}
                      cor={c.cor}
                      icone={g.icone}
                      nome={g.nome}
                      editados={editadosNo(g.id)}
                      alterados={alteradosNo(g.id)}
                    />
                  ))}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── Conteúdo ── */}
        <div className="min-w-0 space-y-5">
          {termo ? (
            <>
              <p className="text-sm text-[#626B75]">
                {resultados.length} resultado(s) para “{busca.trim()}”
              </p>
              {produtos
                .filter((g) => resultados.some((p) => p.grupo === g.id))
                .map((g) => (
                  <div key={g.id} className="space-y-3">
                    <button type="button" onClick={() => abrir(g.id)} className="flex items-center gap-3 text-left">
                      <Icone src={g.icone} className="h-9 w-9" />
                      <span className="text-base font-semibold text-[#20252B] hover:underline">{g.nome}</span>
                    </button>
                    {secoesDe(resultados.filter((p) => p.grupo === g.id))}
                  </div>
                ))}
              {resultados.length === 0 && <p className="rounded-xl bg-black/[0.03] px-4 py-6 text-center text-sm text-[#626B75]">Nada encontrado.</p>}
            </>
          ) : !produtoAberto ? (
            <>
              <div>
                <h2 className="text-lg text-[#20252B]">Visão geral</h2>
                <p className="text-[13px] text-[#626B75]">Preço base de cada produto com os valores atuais. Clique para editar.</p>
              </div>
              {categorias.map((c) => {
                const lista = produtos.filter((g) => g.categoria === c.id);
                if (!lista.length) return null;
                return (
                  <div key={c.id}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.cor }}>
                      {c.nome}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {lista.map((g) => {
                        const base = precoBase(g.id);
                        const ed = editadosNo(g.id);
                        const alt = alteradosNo(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => abrir(g.id)}
                            className={`group flex flex-col rounded-2xl border border-t-[3px] border-black/[0.06] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-18px_rgba(0,0,0,0.3)] ${SOMBRA}`}
                            style={{ borderTopColor: c.cor }}
                          >
                            <span className="flex items-center gap-3">
                              <Icone src={g.icone} className="h-10 w-10" />
                              <span className="min-w-0 text-[15px] font-semibold text-[#20252B]">{g.nome}</span>
                            </span>
                            {base && (
                              <span className="mt-3 block">
                                <span className="block text-[12px] text-[#626B75]">{base.rotulo}</span>
                                <span className="block text-xl font-semibold tabular-nums text-[#20252B]">{base.valor}</span>
                              </span>
                            )}
                            <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#626B75]">
                              <span>{doProduto(g.id).length} valores</span>
                              {alt > 0 && <span className="text-[#24476B]">{alt} alterado(s) no CRM</span>}
                              {ed > 0 && <span className="font-medium text-[#B7791F]">{ed} não salva(s)</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className={`rounded-2xl border border-t-[3px] border-black/[0.06] bg-white p-5 md:p-6 ${SOMBRA}`} style={{ borderTopColor: corDe(produtoAberto) }}>
                <div className="flex items-start gap-4">
                  <Icone src={produtoAberto.icone} className="h-14 w-14 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: corDe(produtoAberto) }}>
                      {categorias.find((c) => c.id === produtoAberto.categoria)?.nome}
                    </p>
                    <h2 className="text-xl text-[#20252B]">{produtoAberto.nome}</h2>
                    <p className="mt-1 text-sm text-[#626B75]">{produtoAberto.descricao}</p>
                    <p className="mt-1 text-[12px] text-[#8A939C]">Onde aparece: {produtoAberto.onde}</p>
                  </div>
                </div>
              </div>

              <CartaoSimulacao sim={simulacaoDe(produtoAberto.id)} cor={corDe(produtoAberto)} />

              {secoesDe(doProduto(produtoAberto.id))}
            </>
          )}
        </div>
      </div>

      <section className={`mt-8 rounded-2xl border border-black/[0.06] bg-white p-5 md:p-6 ${SOMBRA}`}>
        <button type="button" onClick={() => setVerHistorico((v) => !v)} className="flex w-full items-center justify-between text-left" aria-expanded={verHistorico}>
          <h2 className="text-lg text-[#20252B]">Histórico de alterações</h2>
          <span className="text-[13px] text-[#24476B]">{verHistorico ? "Ocultar" : `Ver (${historico.length})`}</span>
        </button>
        {verHistorico &&
          (historico.length === 0 ? (
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
          ))}
      </section>

      {(mudancas.length > 0 || invalidos > 0) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 md:px-10">
            <span className="text-sm text-[#20252B]">
              {mudancas.length} alteração(ões)
              {mudancas.length > 0 && (
                <span className="text-[#626B75]"> em {[...new Set(mudancas.map((m) => nomeProduto(m.p.grupo)))].join(", ")}</span>
              )}
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
                    <span className="text-[#20252B]">
                      <span className="font-medium">{nomeProduto(p.grupo)}</span> · {[p.secao, p.rotulo, p.coluna].filter(Boolean).join(" · ")}
                    </span>
                    <span className="whitespace-nowrap text-[#626B75]">
                      {fmtValor(efetivo(p), p.unidade)} → <strong className="font-medium text-[#20252B]">{fmtValor(novo, p.unidade)}</strong>
                      {p.unidade === "mult" && novo < 1 && /margem/i.test(p.id) ? <span className="ml-1 text-[#B42318]">(abaixo do custo)</span> : null}
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

// Ícone do produto: fundo branco, arte preta (regra dos ícones do CRM/site —
// sem círculos coloridos). Os ícones brancos de /produtos viram pretos com
// brightness(0).
function Icone({ src, className = "" }: { src: string; className?: string }) {
  const caixa = `flex items-center justify-center rounded-xl border border-black/10 bg-white ${className}`;
  if (src === "svg:percent")
    return (
      <span className={caixa} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" className="h-1/2 w-1/2">
          <path d="M19 5L5 19" />
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
        </svg>
      </span>
    );
  if (src === "svg:grid")
    return (
      <span className={caixa} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" className="h-1/2 w-1/2">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      </span>
    );
  const opaco = src.includes("icone-documentacao-visto");
  return (
    <span className={caixa} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={`h-[70%] w-[70%] object-contain ${opaco ? "" : "[filter:brightness(0)]"}`} />
    </span>
  );
}

function BotaoMenu({
  ativo,
  onClick,
  cor,
  icone,
  nome,
  editados = 0,
  alterados = 0,
}: {
  ativo: boolean;
  onClick: () => void;
  cor: string;
  icone: string;
  nome: string;
  editados?: number;
  alterados?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativo ? "page" : undefined}
      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
        ativo ? "bg-white font-semibold text-[#20252B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-14px_rgba(0,0,0,0.35)]" : "text-[#3A4250] hover:bg-white/70"
      }`}
    >
      {ativo && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ backgroundColor: cor }} />}
      <Icone src={icone} className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{nome}</span>
      {editados > 0 ? (
        <span className="rounded-full bg-[#FFF4DE] px-1.5 text-[11px] font-semibold tabular-nums text-[#946200]" title="Alterações não salvas">
          {editados}
        </span>
      ) : alterados > 0 ? (
        <span className="text-[11px] tabular-nums text-[#8A939C]" title="Valores alterados no CRM">
          {alterados}
        </span>
      ) : null}
    </button>
  );
}

function CartaoSimulacao({ sim, cor }: { sim: Simulacao | null; cor: string }) {
  if (!sim) return null;
  const base = sim.linhas.find((l) => l.base);
  return (
    <section className={`overflow-hidden rounded-2xl border border-black/[0.06] bg-[#FBFAF7] ${SOMBRA}`}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/[0.06] px-5 py-4 md:px-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: cor }}>
            Simulação de preço
          </p>
          <h3 className="text-base text-[#20252B]">{sim.titulo}</h3>
          <p className="text-[12px] text-[#8A939C]">Atualiza enquanto você edita — antes de salvar.</p>
        </div>
        {base && (
          <div className="text-right">
            <p className="text-[12px] text-[#626B75]">Preço base · {base.rotulo}</p>
            <p className="text-2xl font-semibold tabular-nums text-[#20252B]">{base.valor}</p>
          </div>
        )}
      </div>
      <ul className="divide-y divide-black/[0.05] px-5 md:px-6">
        {sim.linhas.map((l) => (
          <li key={l.rotulo} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
            <span className={l.base ? "font-medium text-[#20252B]" : "text-[#3A4250]"}>{l.rotulo}</span>
            <span className="text-right">
              <span className={`tabular-nums ${l.base ? "font-semibold text-[#20252B]" : "text-[#20252B]"}`}>{l.valor}</span>
              {l.nota && <span className="block text-[11px] text-[#8A939C]">{l.nota}</span>}
            </span>
          </li>
        ))}
      </ul>
      {sim.rodape && <p className="border-t border-black/[0.06] px-5 py-3 text-[12px] text-[#626B75] md:px-6">{sim.rodape}</p>}
    </section>
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
