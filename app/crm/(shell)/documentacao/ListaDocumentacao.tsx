"use client";

// Lista do CRM de Documentação — redesenho (Wilson, 29/out/2026): abas por
// serviço → fluxo compacto (Comercial / Execução) → encerramentos à parte →
// barra de busca e filtros → tabela com pendência e próxima ação. Os
// filtros ficam na URL (servico, etapa, q, f, pag, pp).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ETAPAS_DOC, GRUPOS_FLUXO, QUEM_PENDENCIA, SAIDAS_DOC, SERVICOS_DOC, etapaDoc, pendenciaDoc, servicoDoc, type EtapaDoc, type ProcessoDoc,
} from "@/lib/crm/documentacao";

export type LinhaDoc = Pick<
  ProcessoDoc,
  "id" | "created_at" | "updated_at" | "servico" | "etapa" | "nome" | "email" | "telefone" | "resumo" | "campos" | "valor_referencia_brl" | "valor_final" | "valor_total" | "ficha_enviada_em" | "contrato_aceito_em" | "motivo_saida"
>;

// Azul de seleção do CRM (inline: o tema bronze da unidade não o remapeia).
export const AZUL = "#24476B";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-22px_rgba(0,0,0,0.18)]";
const CAMPO = "h-10 rounded-xl border border-[#EAE2DB] bg-white px-3 text-[15px] text-[#25211E] outline-none focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/20";
const FUSO = "America/Sao_Paulo";
const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const codigo = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

function quando(iso: string) {
  const d = new Date(iso);
  const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  const data = d.toLocaleDateString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "2-digit" });
  if (dias <= 0) return { curto: "Hoje", completo: data };
  if (dias === 1) return { curto: "Ontem", completo: data };
  if (dias < 7) return { curto: `Há ${dias} dias`, completo: data };
  return { curto: data, completo: data };
}

export function BadgeEtapaDoc({ etapa }: { etapa: string }) {
  const e = etapaDoc(etapa);
  return (
    <span title={e.descricao} className="inline-block max-w-full rounded-full px-2.5 py-0.5 text-[13px] font-medium leading-snug sm:whitespace-normal whitespace-nowrap" style={{ backgroundColor: e.fundo, color: e.cor }}>
      {e.label}
    </span>
  );
}

export function BadgeServicoDoc({ servico }: { servico: string }) {
  return <span className="inline-block whitespace-nowrap rounded-md border border-[#E4DDD6] bg-white px-2 py-0.5 text-[12px] font-medium text-[#5E5750]">{servicoDoc(servico).curto}</span>;
}

/** Informação secundária do pedido (nome do pet, consulado, garantidor…) — só o que existe no cadastro. */
export function detalhePedido(p: Pick<LinhaDoc, "servico" | "campos" | "resumo">): string | null {
  const c = (p.campos ?? {}) as Record<string, string>;
  if (p.servico === "pet") return [c.p_nome && `Pet: ${c.p_nome}`, c.p_raca].filter(Boolean).join(" · ") || null;
  if (p.servico === "visto") return [c.qtd && `${c.qtd} pessoa(s)`, c.consulado && `Consulado ${c.consulado}`].filter(Boolean).join(" · ") || null;
  return [c.qtd && `${c.qtd} pessoa(s)`, c.g_parentesco && `Garantidor: ${c.g_parentesco.toLowerCase()}`].filter(Boolean).join(" · ") || null;
}

// Filtro específico de cada serviço — só campos que o cadastro já tem.
const FILTRO_SERVICO: Record<string, { campo: string; rotulo: string; todos: string } | undefined> = {
  pet: { campo: "p_raca", rotulo: "Raça", todos: "Todas as raças" },
  visto: { campo: "consulado", rotulo: "Consulado", todos: "Todos os consulados" },
  elegibilidade: { campo: "g_provincia", rotulo: "Província do garantidor", todos: "Todas as províncias" },
};

function Seta() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#C9BFB5]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ListaDocumentacao({ processos, erro }: { processos: LinhaDoc[]; erro: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const servico = SERVICOS_DOC.some((s) => s.valor === sp.get("servico")) ? (sp.get("servico") as string) : "";
  const etapa = ETAPAS_DOC.some((e) => e.valor === sp.get("etapa")) ? (sp.get("etapa") as EtapaDoc) : "";
  const q = sp.get("q") ?? "";
  const filtroCfg = servico ? FILTRO_SERVICO[servico] : undefined;
  const filtro = filtroCfg ? (sp.get("f") ?? "") : "";
  const pp = [10, 25, 50].includes(Number(sp.get("pp"))) ? Number(sp.get("pp")) : 25;

  const atualizar = useCallback(
    (m: Record<string, string | null>, manterPagina = false) => {
      const p = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(m)) {
        if (v) p.set(k, v);
        else p.delete(k);
      }
      if (!manterPagina) p.delete("pag");
      const s = p.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const enderecoAtual = sp.toString();
  useEffect(() => {
    try {
      window.sessionStorage.setItem("crm-documentacao-lista", enderecoAtual ? `${pathname}?${enderecoAtual}` : pathname);
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
  }, [texto, atualizar]);

  // Base de cada nível: serviço → (busca + filtro do serviço) → etapa. As
  // contagens das etapas refletem o serviço e a busca, não a etapa escolhida.
  const doServico = useMemo(() => (servico ? processos.filter((p) => p.servico === servico) : processos), [processos, servico]);
  const buscados = useMemo(() => {
    const b = norm(q.trim()).replace(/^#/, "");
    return doServico.filter((p) => {
      if (filtroCfg && filtro && ((p.campos ?? {}) as Record<string, string>)[filtroCfg.campo] !== filtro) return false;
      if (b && !norm(`${p.nome} ${p.email ?? ""} ${p.telefone ?? ""} ${p.telefone?.replace(/\D/g, "") ?? ""} ${p.id} ${p.resumo ?? ""} ${detalhePedido(p) ?? ""}`).includes(b)) return false;
      return true;
    });
  }, [doServico, q, filtro, filtroCfg]);
  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of buscados) c[p.etapa] = (c[p.etapa] ?? 0) + 1;
    return c;
  }, [buscados]);
  const encerrados = SAIDAS_DOC.reduce((n, e) => n + (contagem[e] ?? 0), 0);
  const filtrados = useMemo(() => (etapa ? buscados.filter((p) => p.etapa === etapa) : buscados), [buscados, etapa]);
  const opcoesFiltro = useMemo(() => {
    if (!filtroCfg) return [];
    const set = new Set<string>();
    for (const p of doServico) {
      const v = ((p.campos ?? {}) as Record<string, string>)[filtroCfg.campo];
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [doServico, filtroCfg]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / pp));
  const pagina = Math.min(Math.max(1, Number(sp.get("pag")) || 1), paginas);
  const visiveis = filtrados.slice((pagina - 1) * pp, pagina * pp);
  const temFiltro = !!(q || etapa || filtro);
  const limpar = () => {
    setTexto("");
    ultimo.current = "";
    atualizar({ q: null, etapa: null, f: null });
  };
  const escolherEtapa = (e: EtapaDoc) => atualizar({ etapa: etapa === e ? null : e });
  const mostrarServico = !servico;

  if (erro) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#25211E]">Não foi possível carregar os processos.</p>
        <p className="mt-1 text-sm text-[#6B635D]">Confira se as migrações 026–028 rodaram no Supabase.</p>
        <button type="button" onClick={() => router.refresh()} className="mt-4 rounded-xl px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: AZUL }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 2. Abas dos serviços */}
      <div role="tablist" aria-label="Serviço" className="-mx-1 flex gap-1 overflow-x-auto border-b border-[#EAE2DB] px-1">
        {[{ valor: "", label: "Todos" }, ...SERVICOS_DOC].map((s) => {
          const ativo = servico === s.valor;
          const n = s.valor ? processos.filter((p) => p.servico === s.valor).length : processos.length;
          return (
            <button
              key={s.valor || "todos"}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => atualizar({ servico: s.valor || null, f: null, etapa: null })}
              className={`-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${ativo ? "" : "border-transparent text-[#6B635D] hover:text-[#25211E]"}`}
              style={ativo ? { borderBottomColor: AZUL, color: AZUL } : undefined}
            >
              {s.label}
              <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${ativo ? "bg-[#24476B]/10" : "bg-[#F1ECE7] text-[#6B635D]"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Fluxo compacto — desktop */}
      <section aria-label="Etapas do fluxo" className={`hidden rounded-2xl border border-[#EAE2DB] bg-white px-4 py-3 md:block ${SOMBRA}`}>
        <div className="space-y-2">
          {GRUPOS_FLUXO.map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className="w-[72px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8079]">{g.titulo}</span>
              <ol className="flex min-w-0 flex-1 items-center gap-1">
                {g.etapas.map((e, i) => {
                  const info = etapaDoc(e);
                  const sel = etapa === e;
                  const n = contagem[e] ?? 0;
                  return (
                    <li key={e} className="flex min-w-0 flex-1 items-center gap-1">
                      <button
                        type="button"
                        aria-pressed={sel}
                        onClick={() => escolherEtapa(e)}
                        title={info.descricao}
                        className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition ${sel ? "text-white" : "border-transparent hover:bg-[#F6F2EE]"}`}
                        style={sel ? { backgroundColor: AZUL, borderColor: AZUL } : undefined}
                      >
                        <span className={`truncate ${sel ? "" : n ? "text-[#25211E]" : "text-[#9A918A]"}`}>{info.label}</span>
                        <span className={`shrink-0 tabular-nums font-semibold ${sel ? "" : n ? "text-[#25211E]" : "text-[#B8AEA6]"}`}>{n}</span>
                      </button>
                      {i < g.etapas.length - 1 && <Seta />}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#F2ECE6] pt-2.5 text-[13px]">
          <button type="button" onClick={() => atualizar({ etapa: null })} aria-pressed={!etapa} className={`rounded-lg px-2.5 py-1 font-medium ${!etapa ? "bg-[#24476B]/10" : "text-[#6B635D] hover:bg-[#F6F2EE]"}`} style={!etapa ? { color: AZUL } : undefined}>
            Todas as etapas <span className="tabular-nums">({buscados.length})</span>
          </button>
          <span className="mx-1 h-4 w-px bg-[#EAE2DB]" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8079]">Encerramentos</span>
          {SAIDAS_DOC.map((e) => {
            const info = etapaDoc(e);
            const sel = etapa === e;
            const n = contagem[e] ?? 0;
            return (
              <button key={e} type="button" aria-pressed={sel} onClick={() => escolherEtapa(e)} title={info.descricao} className={`rounded-lg border px-2.5 py-1 ${sel ? "text-white" : "border-[#EAE2DB] hover:bg-[#F6F2EE]"}`} style={sel ? { backgroundColor: AZUL, borderColor: AZUL } : { color: n ? info.cor : "#B8AEA6" }}>
                {info.curto} <span className="tabular-nums font-semibold">{n}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Etapas — mobile: seletor */}
      <label className="block md:hidden">
        <span className="sr-only">Etapa</span>
        <select value={etapa} onChange={(e) => atualizar({ etapa: e.target.value || null })} className={`${CAMPO} w-full`}>
          <option value="">Todas as etapas ({buscados.length})</option>
          {GRUPOS_FLUXO.map((g) => (
            <optgroup key={g.id} label={g.titulo}>
              {g.etapas.map((e) => (
                <option key={e} value={e}>{etapaDoc(e).label} ({contagem[e] ?? 0})</option>
              ))}
            </optgroup>
          ))}
          <optgroup label={`Encerramentos (${encerrados})`}>
            {SAIDAS_DOC.map((e) => (
              <option key={e} value={e}>{etapaDoc(e).label} ({contagem[e] ?? 0})</option>
            ))}
          </optgroup>
        </select>
      </label>

      {/* 4. Busca e filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="busca-doc" className="sr-only">Buscar processos</label>
        <input id="busca-doc" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por cliente, e-mail, telefone ou nº do processo" className={`${CAMPO} min-w-0 flex-1 basis-[260px]`} />
        {filtroCfg && (
          <select aria-label={filtroCfg.rotulo} value={filtro} onChange={(e) => atualizar({ f: e.target.value || null })} className={`${CAMPO} max-w-[240px]`}>
            <option value="">{filtroCfg.todos}</option>
            {opcoesFiltro.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {temFiltro && (
          <button type="button" onClick={limpar} className="h-10 rounded-xl px-3 text-sm font-medium hover:bg-[#F6F2EE]" style={{ color: AZUL }}>
            Limpar filtros
          </button>
        )}
      </div>

      <p className="text-[13px] text-[#6B635D]">
        {total} {total === 1 ? "processo" : "processos"}
        {etapa && <> em <strong className="font-medium text-[#25211E]">{etapaDoc(etapa).label}</strong></>}
      </p>

      {/* 5. Lista */}
      {processos.length === 0 ? (
        <div className={`rounded-2xl border border-[#EAE2DB] bg-white px-5 py-6 text-center ${SOMBRA}`}>
          <p className="text-[15px] font-semibold text-[#25211E]">Nenhum processo ainda</p>
          <p className="mt-1 text-sm text-[#6B635D]">Os cadastros enviados pelo formulário em /documentacao aparecem aqui automaticamente.</p>
        </div>
      ) : total === 0 ? (
        <div className={`rounded-2xl border border-[#EAE2DB] bg-white px-5 py-6 text-center ${SOMBRA}`}>
          <p className="text-[15px] font-semibold text-[#25211E]">Nenhum processo encontrado com estes filtros</p>
          {temFiltro && (
            <button type="button" onClick={limpar} className="mt-2 text-sm font-medium hover:underline" style={{ color: AZUL }}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={`hidden overflow-clip rounded-2xl border border-[#EAE2DB] bg-white lg:block ${SOMBRA}`}>
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className={mostrarServico ? "w-[20%]" : "w-[24%]"} />
                {mostrarServico && <col className="w-[10%]" />}
                <col className="w-[15%]" />
                <col className={mostrarServico ? "w-[22%]" : "w-[28%]"} />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead className="text-[13px] text-[#6B635D]">
                <tr>
                  {["Cliente", ...(mostrarServico ? ["Serviço"] : []), "Etapa atual", "Pendência / próxima ação", "Responsável", "Atualizado", ""].map((h, i) => (
                    <th key={i} className="sticky top-[97px] z-10 border-b border-[#EAE2DB] bg-[#F8F5F2] px-4 py-2.5 font-medium">
                      {h || <span className="sr-only">Ações</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE6]">
                {visiveis.map((p) => {
                  const pend = pendenciaDoc(p);
                  const det = detalhePedido(p);
                  const at = quando(p.updated_at || p.created_at);
                  return (
                    <tr key={p.id} className="align-top transition hover:bg-[#FBF8F6]">
                      <td className="px-4 py-3">
                        <Link href={`/crm/documentacao/${p.id}`} className="font-semibold text-[#25211E] hover:underline">{p.nome}</Link>
                        <p className="truncate text-[13px] text-[#6B635D]" title={det ?? undefined}>{det ?? p.email ?? p.telefone ?? "—"}</p>
                        <p className="text-[12px] tabular-nums text-[#9A918A]">{codigo(p.id)}</p>
                      </td>
                      {mostrarServico && <td className="px-4 py-3"><BadgeServicoDoc servico={p.servico} /></td>}
                      <td className="px-4 py-3"><BadgeEtapaDoc etapa={p.etapa} /></td>
                      <td className="px-4 py-3">
                        {QUEM_PENDENCIA[pend.quem] && <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#8A8079]">{QUEM_PENDENCIA[pend.quem]}</p>}
                        <p className={`line-clamp-2 ${pend.quem === "nenhum" ? "text-[#6B635D]" : "text-[#25211E]"}`}>{pend.texto}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#9A918A]">Não definido</td>
                      <td className="px-4 py-3 tabular-nums text-[#25211E]" title={at.completo}>{at.curto}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/crm/documentacao/${p.id}`} className="inline-block whitespace-nowrap rounded-lg px-2 py-1.5 text-[13px] font-medium hover:bg-[#24476B]/10" style={{ color: AZUL }}>
                          Abrir processo
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet: cards compactos */}
          <ul className="space-y-2.5 lg:hidden">
            {visiveis.map((p) => {
              const pend = pendenciaDoc(p);
              const det = detalhePedido(p);
              return (
                <li key={p.id}>
                  <Link href={`/crm/documentacao/${p.id}`} className={`block rounded-2xl border border-[#EAE2DB] bg-white p-4 ${SOMBRA}`}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#25211E]">{p.nome}</span>
                        {det && <span className="block truncate text-[13px] text-[#6B635D]">{det}</span>}
                      </span>
                      <span className="shrink-0"><BadgeEtapaDoc etapa={p.etapa} /></span>
                    </span>
                    <span className="mt-2 block text-[13px] text-[#25211E]">
                      {QUEM_PENDENCIA[pend.quem] && <span className="font-medium text-[#8A8079]">{QUEM_PENDENCIA[pend.quem]}: </span>}
                      {pend.texto}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-[12px] text-[#9A918A]">
                      <span className="flex items-center gap-2">
                        {mostrarServico && <BadgeServicoDoc servico={p.servico} />}
                        <span className="tabular-nums">{codigo(p.id)}</span>
                      </span>
                      <span>Atualizado {quando(p.updated_at || p.created_at).curto.toLowerCase()}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {paginas > 1 || total > 10 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B635D]">
              <span className="tabular-nums">Exibindo {(pagina - 1) * pp + 1}–{Math.min(pagina * pp, total)} de {total}</span>
              <span className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  Por página
                  <select value={pp} onChange={(e) => atualizar({ pp: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#EAE2DB] bg-white px-2 py-1 text-base text-[#25211E]">
                    {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </label>
                <button type="button" disabled={pagina <= 1} onClick={() => atualizar({ pag: pagina - 1 > 1 ? String(pagina - 1) : null }, true)} className="rounded-lg border border-[#EAE2DB] bg-white px-3 py-1.5 font-medium text-[#25211E] disabled:opacity-40">Anterior</button>
                <span className="tabular-nums">{pagina} / {paginas}</span>
                <button type="button" disabled={pagina >= paginas} onClick={() => atualizar({ pag: String(pagina + 1) }, true)} className="rounded-lg border border-[#EAE2DB] bg-white px-3 py-1.5 font-medium text-[#25211E] disabled:opacity-40">Próxima</button>
              </span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
