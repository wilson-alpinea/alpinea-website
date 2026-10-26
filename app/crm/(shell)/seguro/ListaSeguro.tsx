"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ETAPAS_SEGURO, etapaSeguro, prazoApolice, type PedidoSeguro } from "@/lib/crm/seguro";

export type LinhaSeguro = Pick<PedidoSeguro, "id" | "created_at" | "etapa" | "nome" | "email" | "telefone" | "plano" | "seguradora" | "partida" | "retorno" | "valor_cliente" | "pago_em" | "numero_apolice"> & { viajantes: number };

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "rounded-xl border border-[#E6E1EC] bg-white px-3.5 py-2.5 text-base text-[#24212A] outline-none focus:border-[#75608B] focus:ring-2 focus:ring-[#75608B]/25";
const FUSO = "America/Sao_Paulo";
const data = (d: string | null) => (d ? d.slice(0, 10).split("-").reverse().join("/") : "—");
const dataHora = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO });
const brl = (v: number | null) => (v == null ? "Não informado" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function BadgeEtapa({ etapa }: { etapa: string }) {
  const e = etapaSeguro(etapa);
  return (
    <span className="inline-block max-w-full rounded-2xl px-2.5 py-0.5 text-[13px] font-medium leading-snug" style={{ backgroundColor: e.fundo, color: e.cor }}>
      {e.curto}
    </span>
  );
}

export function BadgePrazo({ p, agora }: { p: Pick<PedidoSeguro, "etapa" | "pago_em">; agora: number }) {
  const prazo = prazoApolice(p, agora);
  if (!prazo) return null;
  if (prazo.atrasado) return <span className="mt-1 block text-[13px] font-medium text-[#B42318]">Apólice atrasada (+24 h)</span>;
  const h = Math.max(1, Math.ceil(prazo.horasRestantes));
  return <span className="mt-1 block text-[13px] text-[#93703D]">Apólice em até {h} h</span>;
}

export function ListaSeguro({ pedidos, erro, agora }: { pedidos: LinhaSeguro[]; erro: boolean; agora: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const etapa = sp.get("etapa") ?? "";
  const ord = sp.get("ord") === "partida" ? "partida" : "recentes";
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
      window.sessionStorage.setItem("crm-seguro-lista", enderecoAtual ? `${pathname}?${enderecoAtual}` : pathname);
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

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of pedidos) c[p.etapa] = (c[p.etapa] ?? 0) + 1;
    return c;
  }, [pedidos]);
  const atrasados = useMemo(() => pedidos.filter((p) => prazoApolice(p, agora)?.atrasado).length, [pedidos, agora]);

  const filtrados = useMemo(() => {
    const b = norm(q.trim());
    const r = pedidos.filter((p) => {
      if (etapa === "atrasados") {
        if (!prazoApolice(p, agora)?.atrasado) return false;
      } else if (etapa && p.etapa !== etapa) return false;
      if (b && !norm(`${p.nome} ${p.email ?? ""} ${p.telefone ?? ""} ${p.plano ?? ""} ${p.seguradora ?? ""} ${p.numero_apolice ?? ""}`).includes(b)) return false;
      return true;
    });
    if (ord === "partida") r.sort((a, c) => (a.partida ?? "9999").localeCompare(c.partida ?? "9999"));
    return r;
  }, [pedidos, q, etapa, ord, agora]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / pp));
  const pagina = Math.min(Math.max(1, Number(sp.get("pag")) || 1), paginas);
  const visiveis = filtrados.slice((pagina - 1) * pp, pagina * pp);
  const filtrando = !!(q || etapa);
  const limpar = () => {
    setTexto("");
    ultimo.current = "";
    atualizar({ q: null, etapa: null });
  };

  if (erro) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#24212A]">Não foi possível carregar os pedidos.</p>
        <p className="mt-1 text-sm text-[#67626F]">Se for o primeiro acesso, rode a migração supabase/migrations/025_seguro_pedidos.sql no Supabase.</p>
        <button type="button" onClick={() => router.refresh()} className="mt-4 rounded-xl bg-[#75608B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#63507A]">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Etapas (filtram a lista) */}
      <section aria-label="Pedidos por etapa" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ETAPAS_SEGURO.map((e) => {
          const sel = etapa === e.valor;
          return (
            <button
              key={e.valor}
              type="button"
              aria-pressed={sel}
              onClick={() => atualizar({ etapa: sel ? null : e.valor })}
              className={`rounded-2xl border border-t-[3px] px-4 py-3 text-left transition hover:-translate-y-px ${SOMBRA} ${sel ? "ring-2 ring-offset-2" : "border-[#E6E1EC]"}`}
              style={{ backgroundColor: e.fundo, borderTopColor: e.cor, ["--tw-ring-color" as string]: e.cor, ...(sel ? { borderColor: e.cor } : {}) }}
            >
              <span className="block text-[13px] font-medium leading-snug" style={{ color: e.cor }}>
                {e.label}
              </span>
              <span className="mt-1 block text-[26px] font-semibold leading-tight tabular-nums text-[#24212A]">{contagem[e.valor] ?? 0}</span>
            </button>
          );
        })}
      </section>

      {atrasados > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#B42318]/20 bg-[#FDECEA] px-5 py-3">
          <p className="text-sm text-[#8A1C12]">
            <strong>{atrasados}</strong> {atrasados === 1 ? "pedido pago está" : "pedidos pagos estão"} há mais de 24 horas sem apólice registrada.
          </p>
          <button type="button" onClick={() => atualizar({ etapa: "atrasados" })} className="rounded-xl border border-[#B42318]/30 bg-white px-3.5 py-2 text-sm font-medium text-[#B42318] hover:border-[#B42318]">
            Ver pedidos atrasados
          </button>
        </div>
      )}

      {/* Busca */}
      <section className={`rounded-2xl border border-t-[3px] border-[#E6E1EC] border-t-[#75608B] bg-white p-5 ${SOMBRA}`} aria-label="Busca e filtros">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="busca-seguro" className="sr-only">
            Buscar pedidos
          </label>
          <input id="busca-seguro" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nome, e-mail, telefone, plano ou nº da apólice…" className={`${CAMPO} min-w-0 flex-1 basis-[260px]`} />
          <select aria-label="Ordenar" value={ord} onChange={(e) => atualizar({ ord: e.target.value === "recentes" ? null : e.target.value })} className={CAMPO}>
            <option value="recentes">Pedidos mais recentes</option>
            <option value="partida">Viagem mais próxima</option>
          </select>
        </div>
        {filtrando && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {etapa && (
              <button type="button" onClick={() => atualizar({ etapa: null })} className="inline-flex items-center gap-1.5 rounded-full border border-[#75608B]/25 bg-[#F4F1F8] px-3 py-1 text-[13px] text-[#5A4870]">
                {etapa === "atrasados" ? "Apólice atrasada" : etapaSeguro(etapa).label} <span aria-hidden="true">×</span>
              </button>
            )}
            {q && (
              <button type="button" onClick={() => { setTexto(""); ultimo.current = ""; atualizar({ q: null }); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#75608B]/25 bg-[#F4F1F8] px-3 py-1 text-[13px] text-[#5A4870]">
                Busca: “{q}” <span aria-hidden="true">×</span>
              </button>
            )}
            <button type="button" onClick={limpar} className="text-[13px] font-medium text-[#75608B] hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <p className="text-sm font-medium text-[#24212A]">
        {total} {total === 1 ? "pedido encontrado" : "pedidos encontrados"}
      </p>

      {pedidos.length === 0 ? (
        <div className={`rounded-2xl border border-[#E6E1EC] bg-white p-8 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#24212A]">Nenhum pedido de seguro ainda</p>
          <p className="mt-1 text-sm text-[#67626F]">Os pedidos feitos em /produtos/seguro-viagem aparecem aqui automaticamente.</p>
        </div>
      ) : total === 0 ? (
        <div className={`rounded-2xl border border-[#E6E1EC] bg-white p-8 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#24212A]">Nenhum pedido encontrado</p>
          <button type="button" onClick={limpar} className="mt-2 text-sm font-medium text-[#75608B] hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={`hidden overflow-clip rounded-2xl border border-[#E6E1EC] bg-white lg:block ${SOMBRA}`}>
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead className="text-[13px] text-[#67626F]">
                <tr>
                  {["Cliente", "Plano", "Viagem", "Valor", "Etapa", "Pedido", ""].map((h, i) => (
                    <th key={i} className="sticky top-[97px] z-10 border-b border-[#E6E1EC] bg-[#F7F5FA] px-4 py-3 font-medium">
                      {h || <span className="sr-only">Ações</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECF4]">
                {visiveis.map((p) => (
                  <tr key={p.id} className="align-top transition hover:bg-[#FAF8FC]">
                    <td className="px-4 py-3.5">
                      <Link href={`/crm/seguro/${p.id}`} className="font-semibold text-[#24212A] hover:text-[#75608B] hover:underline">
                        {p.nome}
                      </Link>
                      {p.telefone && <p className="text-[13px] tabular-nums text-[#67626F]">{p.telefone}</p>}
                      {p.email && <p className="truncate text-[13px] text-[#67626F]" title={p.email}>{p.email}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="line-clamp-2 font-medium text-[#24212A]">{p.plano ?? "Não informado"}</p>
                      {p.seguradora && <p className="truncate text-[13px] text-[#67626F]">{p.seguradora}</p>}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums">
                      <p className="text-[#24212A]">{p.partida ? `${data(p.partida)}${p.retorno ? ` a ${data(p.retorno)}` : ""}` : "Não informada"}</p>
                      {p.viajantes > 0 && <p className="text-[13px] text-[#67626F]">{p.viajantes} {p.viajantes === 1 ? "viajante" : "viajantes"}</p>}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[#24212A]">{brl(p.valor_cliente)}</td>
                    <td className="px-4 py-3.5">
                      <BadgeEtapa etapa={p.etapa} />
                      <BadgePrazo p={p} agora={agora} />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[#24212A]">{dataHora(p.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/crm/seguro/${p.id}`} className="inline-block rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#75608B] hover:bg-[#F4F1F8]">
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
                <Link href={`/crm/seguro/${p.id}`} className={`block rounded-2xl border border-[#E6E1EC] bg-white p-4 ${SOMBRA}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 font-semibold text-[#24212A]">{p.nome}</span>
                    <BadgeEtapa etapa={p.etapa} />
                  </span>
                  <span className="mt-1 block text-[13px] text-[#67626F]">
                    {p.plano ?? "Plano não informado"}
                    {p.partida && ` · ${data(p.partida)}${p.retorno ? ` a ${data(p.retorno)}` : ""}`}
                  </span>
                  <span className="mt-1 flex justify-between text-[13px] tabular-nums text-[#67626F]">
                    <span>{brl(p.valor_cliente)}</span>
                    <span>Pedido em {dataHora(p.created_at)}</span>
                  </span>
                  <BadgePrazo p={p} agora={agora} />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#67626F]">
            <span className="tabular-nums">
              Exibindo {(pagina - 1) * pp + 1}–{Math.min(pagina * pp, total)} de {total} {total === 1 ? "pedido" : "pedidos"}
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                Por página
                <select value={pp} onChange={(e) => atualizar({ pp: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#E6E1EC] bg-white px-2 py-1 text-base text-[#24212A]">
                  {[10, 25, 50].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={pagina <= 1} onClick={() => atualizar({ pag: pagina - 1 > 1 ? String(pagina - 1) : null }, true)} className="rounded-lg border border-[#E6E1EC] bg-white px-3 py-1.5 font-medium text-[#24212A] disabled:opacity-40">
                Anterior
              </button>
              <span className="tabular-nums">
                {pagina} / {paginas}
              </span>
              <button type="button" disabled={pagina >= paginas} onClick={() => atualizar({ pag: String(pagina + 1) }, true)} className="rounded-lg border border-[#E6E1EC] bg-white px-3 py-1.5 font-medium text-[#24212A] disabled:opacity-40">
                Próxima
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
