"use client";

// Lista do CRM de Documentação (Wilson, 29/out/2026) — mesmo padrão da lista
// do CRM de Seguro: cards de etapa que filtram, filtro por serviço, busca e
// paginação na URL.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ETAPAS_DOC, SERVICOS_DOC, etapaDoc, servicoDoc, type ProcessoDoc } from "@/lib/crm/documentacao";

export type LinhaDoc = Pick<ProcessoDoc, "id" | "created_at" | "servico" | "etapa" | "nome" | "email" | "telefone" | "resumo" | "valor_referencia_brl" | "valor_final">;

const COR = "#8A5A3C";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "rounded-xl border border-[#EAE2DB] bg-white px-3.5 py-2.5 text-base text-[#25211E] outline-none focus:border-[#8A5A3C] focus:ring-2 focus:ring-[#8A5A3C]/25";
const FUSO = "America/Sao_Paulo";
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO });
const brl = (v: number | null) => (v == null ? null : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function BadgeEtapaDoc({ etapa }: { etapa: string }) {
  const e = etapaDoc(etapa);
  return (
    <span className="inline-block max-w-full rounded-2xl px-2.5 py-0.5 text-[13px] font-medium leading-snug" style={{ backgroundColor: e.fundo, color: e.cor }}>
      {e.curto}
    </span>
  );
}

export function BadgeServicoDoc({ servico }: { servico: string }) {
  const s = servicoDoc(servico);
  return (
    <span className="inline-block rounded-md px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide" style={{ backgroundColor: s.fundo, color: s.cor }}>
      {s.curto}
    </span>
  );
}

function valorLinha(p: LinhaDoc) {
  return p.valor_final || brl(p.valor_referencia_brl) || "A definir";
}

export function ListaDocumentacao({ processos, erro }: { processos: LinhaDoc[]; erro: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const etapa = sp.get("etapa") ?? "";
  const servico = sp.get("servico") ?? "";
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

  const doServico = useMemo(() => (servico ? processos.filter((p) => p.servico === servico) : processos), [processos, servico]);
  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of doServico) c[p.etapa] = (c[p.etapa] ?? 0) + 1;
    return c;
  }, [doServico]);

  const filtrados = useMemo(() => {
    const b = norm(q.trim());
    return doServico.filter((p) => {
      if (etapa && p.etapa !== etapa) return false;
      if (b && !norm(`${p.nome} ${p.email ?? ""} ${p.telefone ?? ""} ${p.resumo ?? ""}`).includes(b)) return false;
      return true;
    });
  }, [doServico, q, etapa]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / pp));
  const pagina = Math.min(Math.max(1, Number(sp.get("pag")) || 1), paginas);
  const visiveis = filtrados.slice((pagina - 1) * pp, pagina * pp);
  const filtrando = !!(q || etapa || servico);
  const limpar = () => {
    setTexto("");
    ultimo.current = "";
    atualizar({ q: null, etapa: null, servico: null });
  };

  if (erro) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#25211E]">Não foi possível carregar os processos.</p>
        <p className="mt-1 text-sm text-[#6B635D]">Se for o primeiro acesso, rode a migração supabase/migrations/026_documentacao_processos.sql no Supabase.</p>
        <button type="button" onClick={() => router.refresh()} className="mt-4 rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:brightness-110" style={{ backgroundColor: COR }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Serviço */}
      <div role="group" aria-label="Filtrar por serviço" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!servico} onClick={() => atualizar({ servico: null })} className={`rounded-full border px-4 py-2 text-sm font-medium ${!servico ? "border-transparent text-white" : "border-[#EAE2DB] bg-white text-[#25211E]"}`} style={!servico ? { backgroundColor: COR } : undefined}>
          Todos <span className="tabular-nums opacity-70">({processos.length})</span>
        </button>
        {SERVICOS_DOC.map((s) => {
          const sel = servico === s.valor;
          const n = processos.filter((p) => p.servico === s.valor).length;
          return (
            <button key={s.valor} type="button" aria-pressed={sel} onClick={() => atualizar({ servico: sel ? null : s.valor })} className="rounded-full border px-4 py-2 text-sm font-medium" style={sel ? { backgroundColor: s.cor, borderColor: s.cor, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#EAE2DB", color: s.cor }}>
              {s.label} <span className="tabular-nums opacity-70">({n})</span>
            </button>
          );
        })}
      </div>

      {/* Etapas (filtram a lista) */}
      <section aria-label="Processos por etapa" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ETAPAS_DOC.map((e) => {
          const sel = etapa === e.valor;
          return (
            <button
              key={e.valor}
              type="button"
              aria-pressed={sel}
              onClick={() => atualizar({ etapa: sel ? null : e.valor })}
              className={`rounded-2xl border border-t-[3px] px-4 py-3 text-left transition hover:-translate-y-px ${SOMBRA} ${sel ? "ring-2 ring-offset-2" : "border-[#EAE2DB]"}`}
              style={{ backgroundColor: e.fundo, borderTopColor: e.cor, ["--tw-ring-color" as string]: e.cor, ...(sel ? { borderColor: e.cor } : {}) }}
            >
              <span className="block text-[13px] font-medium leading-snug" style={{ color: e.cor }}>
                {e.label}
              </span>
              <span className="mt-1 block text-[26px] font-semibold leading-tight tabular-nums text-[#25211E]">{contagem[e.valor] ?? 0}</span>
            </button>
          );
        })}
      </section>

      {/* Busca */}
      <section className={`rounded-2xl border border-t-[3px] border-[#EAE2DB] bg-white p-5 ${SOMBRA}`} style={{ borderTopColor: COR }} aria-label="Busca">
        <label htmlFor="busca-doc" className="sr-only">
          Buscar processos
        </label>
        <input id="busca-doc" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nome, e-mail, telefone, cidade, raça…" className={`${CAMPO} w-full`} />
        {filtrando && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            {servico && <span className="rounded-full border border-[#8A5A3C]/25 bg-[#F8F3EF] px-3 py-1 text-[#6E472F]">{servicoDoc(servico).label}</span>}
            {etapa && <span className="rounded-full border border-[#8A5A3C]/25 bg-[#F8F3EF] px-3 py-1 text-[#6E472F]">{etapaDoc(etapa).label}</span>}
            {q && <span className="rounded-full border border-[#8A5A3C]/25 bg-[#F8F3EF] px-3 py-1 text-[#6E472F]">Busca: “{q}”</span>}
            <button type="button" onClick={limpar} className="font-medium hover:underline" style={{ color: COR }}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <p className="text-sm font-medium text-[#25211E]">
        {total} {total === 1 ? "processo encontrado" : "processos encontrados"}
      </p>

      {processos.length === 0 ? (
        <div className={`rounded-2xl border border-[#EAE2DB] bg-white p-8 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#25211E]">Nenhum processo ainda</p>
          <p className="mt-1 text-sm text-[#6B635D]">Os cadastros feitos em /documentacao aparecem aqui automaticamente.</p>
        </div>
      ) : total === 0 ? (
        <div className={`rounded-2xl border border-[#EAE2DB] bg-white p-8 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#25211E]">Nenhum processo encontrado</p>
          <button type="button" onClick={limpar} className="mt-2 text-sm font-medium hover:underline" style={{ color: COR }}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={`hidden overflow-clip rounded-2xl border border-[#EAE2DB] bg-white lg:block ${SOMBRA}`}>
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[28%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead className="text-[13px] text-[#6B635D]">
                <tr>
                  {["Cliente", "Serviço", "Resumo", "Valor", "Etapa", "Cadastro", ""].map((h, i) => (
                    <th key={i} className="sticky top-[97px] z-10 border-b border-[#EAE2DB] bg-[#F8F5F2] px-4 py-3 font-medium">
                      {h || <span className="sr-only">Ações</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE6]">
                {visiveis.map((p) => (
                  <tr key={p.id} className="align-top transition hover:bg-[#FBF8F6]">
                    <td className="px-4 py-3.5">
                      <Link href={`/crm/documentacao/${p.id}`} className="font-semibold text-[#25211E] hover:underline">
                        {p.nome}
                      </Link>
                      {p.telefone && <p className="text-[13px] tabular-nums text-[#6B635D]">{p.telefone}</p>}
                      {p.email && <p className="truncate text-[13px] text-[#6B635D]" title={p.email}>{p.email}</p>}
                    </td>
                    <td className="px-4 py-3.5"><BadgeServicoDoc servico={p.servico} /></td>
                    <td className="px-4 py-3.5"><p className="line-clamp-2 text-[#25211E]">{p.resumo || "—"}</p></td>
                    <td className="px-4 py-3.5 tabular-nums text-[#25211E]">{valorLinha(p)}</td>
                    <td className="px-4 py-3.5"><BadgeEtapaDoc etapa={p.etapa} /></td>
                    <td className="px-4 py-3.5 tabular-nums text-[#25211E]">{dataCurta(p.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/crm/documentacao/${p.id}`} className="inline-block rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-[#F8F3EF]" style={{ color: COR }}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {visiveis.map((p) => (
              <li key={p.id}>
                <Link href={`/crm/documentacao/${p.id}`} className={`block rounded-2xl border border-[#EAE2DB] bg-white p-4 ${SOMBRA}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 font-semibold text-[#25211E]">{p.nome}</span>
                    <BadgeEtapaDoc etapa={p.etapa} />
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <BadgeServicoDoc servico={p.servico} />
                    <span className="truncate text-[13px] text-[#6B635D]">{p.resumo}</span>
                  </span>
                  <span className="mt-1 flex justify-between text-[13px] tabular-nums text-[#6B635D]">
                    <span>{valorLinha(p)}</span>
                    <span>Cadastro em {dataCurta(p.created_at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B635D]">
            <span className="tabular-nums">
              Exibindo {(pagina - 1) * pp + 1}–{Math.min(pagina * pp, total)} de {total}
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                Por página
                <select value={pp} onChange={(e) => atualizar({ pp: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#EAE2DB] bg-white px-2 py-1 text-base text-[#25211E]">
                  {[10, 25, 50].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={pagina <= 1} onClick={() => atualizar({ pag: pagina - 1 > 1 ? String(pagina - 1) : null }, true)} className="rounded-lg border border-[#EAE2DB] bg-white px-3 py-1.5 font-medium text-[#25211E] disabled:opacity-40">
                Anterior
              </button>
              <span className="tabular-nums">
                {pagina} / {paginas}
              </span>
              <button type="button" disabled={pagina >= paginas} onClick={() => atualizar({ pag: String(pagina + 1) }, true)} className="rounded-lg border border-[#EAE2DB] bg-white px-3 py-1.5 font-medium text-[#25211E] disabled:opacity-40">
                Próxima
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
