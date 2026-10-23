"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIAS_FORNECEDOR, CATEGORIA_FORNECEDOR_LABEL, COR_CATEGORIA_FORNECEDOR, type CategoriaFornecedor } from "@/lib/crm/fornecedores";
import type { Fornecedor } from "@/lib/crm/types";
import { deleteFornecedores } from "../../actions";
import { Painel } from "../clientes/[id]/financeiro/ui";
import { FornecedorForm } from "./FornecedorForm";

// Lista de fornecedores (redesenho 23/out/2026). Estado na URL; o endereço
// é guardado para o "← Fornecedores" da ficha voltar com os filtros.
const CHAVE_RETORNO = "crm.fornecedores.retorno";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CARD = `rounded-2xl border border-[#E4E7EB] bg-white ${SOMBRA}`;
const CAMPO =
  "rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-base text-[#20252B] outline-none transition placeholder:text-[#8A929B] focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const rotuloCategoria = (c: string | null) => (c ? CATEGORIA_FORNECEDOR_LABEL[c as CategoriaFornecedor] ?? c : "Não informado");
const corCategoria = (c: string | null) => COR_CATEGORIA_FORNECEDOR[(c as CategoriaFornecedor) ?? "sem_categoria"] ?? COR_CATEGORIA_FORNECEDOR.sem_categoria;

export function ListaFornecedores({ fornecedores, erro }: { fornecedores: Fornecedor[]; erro: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const categoria = sp.get("categoria") ?? "";
  const cidade = sp.get("cidade") ?? "";
  const dir = sp.get("dir") === "desc" ? "desc" : "asc";
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

  const [maisFiltros, setMaisFiltros] = useState(!!cidade);
  const [painel, setPainel] = useState<null | { tipo: "novo" } | { tipo: "editar"; fornecedor: Fornecedor }>(null);
  const fecharPainel = useCallback(() => setPainel(null), []);
  const [aviso, setAviso] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [excluindo, iniciarExclusao] = useTransition();

  // Cada fornecedor tem UMA categoria: a contagem por categoria não se sobrepõe.
  const porCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of fornecedores) if (f.categoria) m.set(f.categoria, (m.get(f.categoria) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [fornecedores]);
  const cidades = useMemo(
    () => [...new Set(fornecedores.map((f) => f.cidade?.trim()).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [fornecedores],
  );

  const filtrados = useMemo(() => {
    const t = semAcento(q.trim());
    const dig = q.replace(/\D/g, "");
    const lista = fornecedores.filter((f) => {
      if (t) {
        const ok =
          semAcento(f.nome).includes(t) ||
          semAcento(f.contato_nome ?? "").includes(t) ||
          semAcento(f.email ?? "").includes(t) ||
          (f.telefone ?? "").toLowerCase().includes(t) ||
          (dig.length >= 3 && (f.telefone ?? "").replace(/\D/g, "").includes(dig));
        if (!ok) return false;
      }
      if (categoria && (categoria === "sem_categoria" ? !!f.categoria : f.categoria !== categoria)) return false;
      if (cidade && (f.cidade ?? "").trim() !== cidade) return false;
      return true;
    });
    return lista.sort((a, b) => (dir === "asc" ? 1 : -1) * a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  }, [fornecedores, q, categoria, cidade, dir]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / por));
  const paginaAtual = Math.min(pagina, paginas);
  const inicio = (paginaAtual - 1) * por;
  const visiveis = filtrados.slice(inicio, inicio + por);

  const chips: { rotulo: string; limpar: Record<string, null> }[] = [];
  if (q) chips.push({ rotulo: `Busca: “${q}”`, limpar: { q: null } });
  if (categoria) chips.push({ rotulo: `Categoria: ${categoria === "sem_categoria" ? "Não informada" : rotuloCategoria(categoria)}`, limpar: { categoria: null } });
  if (cidade) chips.push({ rotulo: `Cidade: ${cidade}`, limpar: { cidade: null } });
  function limpar() {
    setTexto("");
    ultimo.current = "";
    atualizar({ q: null, categoria: null, cidade: null });
  }

  function excluir(ids: string[], descricao: string) {
    if (!window.confirm(`Excluir ${descricao}? Essa ação não pode ser desfeita.`)) return;
    iniciarExclusao(async () => {
      await deleteFornecedores(ids);
      setSelecionados(new Set());
      setAviso(ids.length === 1 ? "Fornecedor excluído." : `${ids.length} fornecedores excluídos.`);
    });
  }

  const idsVisiveis = visiveis.map((f) => f.id);
  const todosMarcados = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]">Fornecedores</h1>
          <p className="mt-0.5 text-sm text-[#626B75]">Encontre os parceiros que atendem suas viagens.</p>
          {!erro && (
            <p className="text-[13px] tabular-nums text-[#626B75]">
              {fornecedores.length} {fornecedores.length === 1 ? "fornecedor cadastrado" : "fornecedores cadastrados"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPainel({ tipo: "novo" })}
          className="rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/40 focus-visible:ring-offset-2"
        >
          + Novo fornecedor
        </button>
      </div>

      {aviso && (
        <p role="status" className="flex items-center justify-between gap-3 rounded-xl border border-[#28665D]/20 bg-[#E6F2EF] px-4 py-2.5 text-sm text-[#1F4F48]">
          {aviso}
          <button type="button" onClick={() => setAviso(null)} aria-label="Fechar aviso" className="crm-livre text-lg leading-none">
            ×
          </button>
        </p>
      )}

      {erro ? (
        <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
          Não foi possível carregar os fornecedores. Recarregue a página.
        </p>
      ) : fornecedores.length === 0 ? (
        <div className={`${CARD} px-6 py-12 text-center`}>
          <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1F8] text-[#24476B]">
            <IconeCategoria categoria={null} />
          </span>
          <p className="mt-4 text-lg font-semibold text-[#20252B]">Cadastre seu primeiro fornecedor</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#626B75]">Organize contatos de transporte, guias, hospedagem e outros serviços em um só lugar.</p>
          <button type="button" onClick={() => setPainel({ tipo: "novo" })} className="mt-5 rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2C5480]">
            + Novo fornecedor
          </button>
        </div>
      ) : (
        <>
          {/* Resumo por categoria (até 4, as mais frequentes) */}
          {porCategoria.length > 0 && (
            <section aria-label="Fornecedores por categoria">
              <p className="mb-2 text-[13px] text-[#626B75]">
                Categorias com mais fornecedores · clique para filtrar{porCategoria.length > 4 ? " · as demais estão no filtro" : ""}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {porCategoria.slice(0, 4).map(([cat, n]) => {
                  const c = corCategoria(cat);
                  const sel = categoria === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => atualizar({ categoria: sel ? null : cat })}
                      className={`flex items-center gap-3 rounded-2xl border border-t-[3px] p-4 text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA} ${sel ? "ring-2" : "border-[#E4E7EB]"}`}
                      style={{ backgroundColor: c.fundo, borderTopColor: c.cor, ...(sel ? { ["--tw-ring-color" as string]: c.cor, borderColor: c.cor } : { ["--tw-ring-color" as string]: c.cor }) }}
                    >
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80" style={{ color: c.cor }}>
                        <IconeCategoria categoria={cat} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#20252B]">{rotuloCategoria(cat)}</span>
                        <span className="block text-[24px] font-semibold leading-tight tabular-nums" style={{ color: c.cor }}>
                          {n}
                        </span>
                        {sel && <span className="block text-[13px] text-[#626B75]">Filtrando · clique para limpar</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Busca e filtros */}
          <section className={`rounded-2xl border border-t-[3px] border-[#E4E7EB] border-t-[#24476B] bg-white p-5 ${SOMBRA}`} aria-label="Busca e filtros">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="busca-fornecedores" className="sr-only">
                Buscar fornecedores
              </label>
              <input id="busca-fornecedores" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar fornecedor, contato, e-mail ou telefone…" className={`${CAMPO} min-w-[220px] flex-1`} />
              <label htmlFor="filtro-categoria" className="sr-only">
                Categoria
              </label>
              <select id="filtro-categoria" value={categoria} onChange={(e) => atualizar({ categoria: e.target.value || null })} className={CAMPO}>
                <option value="">Categoria: todas</option>
                {CATEGORIAS_FORNECEDOR.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
                <option value="sem_categoria">Não informada</option>
              </select>
              <button
                type="button"
                aria-expanded={maisFiltros}
                onClick={() => setMaisFiltros((v) => !v)}
                className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
              >
                Mais filtros{cidade && <span className="ml-1.5 rounded-full bg-[#24476B] px-1.5 text-[12px] text-white">1</span>}
              </button>
            </div>
            {maisFiltros && (
              <div className="mt-4 grid gap-4 border-t border-[#E4E7EB] pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="filtro-cidade" className="mb-1.5 block text-[13px] font-medium text-[#626B75]">
                    Cidade
                  </label>
                  <select id="filtro-cidade" value={cidade} onChange={(e) => atualizar({ cidade: e.target.value || null })} className={`${CAMPO} w-full`} disabled={!cidades.length}>
                    <option value="">{cidades.length ? "Todas" : "Nenhuma cidade cadastrada"}</option>
                    {cidades.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="self-end text-[13px] text-[#626B75] lg:col-span-2">
                  O cadastro guarda só a cidade do fornecedor. Região atendida, idiomas e situação ainda não existem como campos — por isso não aparecem como filtros.
                </p>
              </div>
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
                      atualizar(c.limpar);
                    }}
                    aria-label={`Remover filtro ${c.rotulo}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#24476B]/20 bg-[#EAF1F8] px-3 py-1 text-[13px] font-medium text-[#24476B] hover:border-[#24476B]/50"
                  >
                    {c.rotulo} <span aria-hidden="true">×</span>
                  </button>
                ))}
                <button type="button" onClick={limpar} className="text-[13px] font-medium text-[#626B75] hover:text-[#20252B] hover:underline">
                  Limpar filtros
                </button>
              </div>
            )}
          </section>

          {selecionados.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#24476B]/20 bg-[#EAF1F8] px-4 py-2.5">
              <span className="text-sm font-medium text-[#24476B]">
                {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => setSelecionados(new Set())} className="rounded-lg px-3 py-1.5 text-sm text-[#24476B] hover:underline">
                  Limpar seleção
                </button>
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => excluir([...selecionados], `${selecionados.size} ${selecionados.size === 1 ? "fornecedor" : "fornecedores"}`)}
                  className="rounded-lg border border-[#B42318]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#B42318] hover:bg-[#FDEDEC] disabled:opacity-50"
                >
                  {excluindo ? "Excluindo…" : "Excluir selecionados"}
                </button>
              </span>
            </div>
          )}

          {total === 0 ? (
            <div className={`${CARD} px-6 py-10 text-center`}>
              <p className="text-base font-semibold text-[#20252B]">Nenhum fornecedor encontrado</p>
              <p className="mt-1 text-sm text-[#626B75]">Tente outro termo ou ajuste os filtros.</p>
              <button type="button" onClick={limpar} className="mt-4 rounded-xl border border-[#D5DAE0] bg-white px-4 py-2 text-sm font-medium text-[#20252B] hover:border-[#24476B]/50">
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <div className={`${CARD} hidden md:block`}>
                <table className="w-full text-left text-sm">
                  <thead className="text-[13px] text-[#626B75]">
                    <tr>
                      <th className="w-10 rounded-tl-2xl border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3">
                        <input
                          type="checkbox"
                          checked={todosMarcados}
                          onChange={() =>
                            setSelecionados((a) => {
                              const n = new Set(a);
                              idsVisiveis.forEach((id) => (todosMarcados ? n.delete(id) : n.add(id)));
                              return n;
                            })
                          }
                          aria-label="Selecionar todos desta página"
                          className="h-4 w-4 accent-[#24476B]"
                        />
                      </th>
                      <th className="border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3 font-medium">
                        <button type="button" onClick={() => atualizar({ dir: dir === "asc" ? "desc" : null }, true)} className="inline-flex items-center gap-1 font-medium text-[#20252B]" aria-label={`Ordenar por nome, ${dir === "asc" ? "decrescente" : "crescente"}`}>
                          Fornecedor <span aria-hidden="true" className="text-[#24476B]">{dir === "asc" ? "↑" : "↓"}</span>
                        </button>
                      </th>
                      <th className="border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3 font-medium">Categoria</th>
                      <th className="border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3 font-medium">Cidade</th>
                      <th className="border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3 font-medium">Contato</th>
                      <th className="rounded-tr-2xl border-b border-[#E4E7EB] bg-[#F5F6F7] px-4 py-3 text-right font-medium">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F2]">
                    {visiveis.map((f) => (
                      <tr key={f.id} className="align-top transition hover:bg-[#F7F9FB]">
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={selecionados.has(f.id)}
                            onChange={() =>
                              setSelecionados((a) => {
                                const n = new Set(a);
                                if (n.has(f.id)) n.delete(f.id);
                                else n.add(f.id);
                                return n;
                              })
                            }
                            aria-label={`Selecionar ${f.nome}`}
                            className="h-4 w-4 accent-[#24476B]"
                          />
                        </td>
                        <td className="max-w-[280px] px-4 py-3.5">
                          <Link href={`/crm/fornecedores/${f.id}`} className="break-words font-semibold text-[#20252B] hover:text-[#24476B] hover:underline">
                            {f.nome}
                          </Link>
                          <p className="text-[13px] text-[#626B75]">{f.contato_nome || <span className="text-[#8A929B]">Contato não informado</span>}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <BadgeCategoria categoria={f.categoria} />
                        </td>
                        <td className="px-4 py-3.5 text-[#20252B]">{f.cidade || <span className="text-[#8A929B]">Não informado</span>}</td>
                        <td className="px-4 py-3.5">
                          <Contato f={f} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <Menu f={f} onEditar={() => setPainel({ tipo: "editar", fornecedor: f })} onExcluir={() => excluir([f.id], `“${f.nome}”`)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {visiveis.map((f) => (
                  <li key={f.id} className={`${CARD} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/crm/fornecedores/${f.id}`} className="break-words font-semibold text-[#20252B]">
                          {f.nome}
                        </Link>
                        {f.contato_nome && <p className="text-[13px] text-[#626B75]">{f.contato_nome}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <BadgeCategoria categoria={f.categoria} />
                          <span className="text-[13px] text-[#626B75]">{f.cidade || "Cidade não informada"}</span>
                        </div>
                      </div>
                      <Menu f={f} onEditar={() => setPainel({ tipo: "editar", fornecedor: f })} onExcluir={() => excluir([f.id], `“${f.nome}”`)} />
                    </div>
                    <div className="mt-3 border-t border-[#EEF0F2] pt-3">
                      <Contato f={f} />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#626B75]">
                <p className="tabular-nums" aria-live="polite">
                  Exibindo {inicio + 1}–{Math.min(inicio + por, total)} de {total} {total === 1 ? "fornecedor" : "fornecedores"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    Por página
                    <select value={por} onChange={(e) => atualizar({ por: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#D5DAE0] bg-white px-2 py-1 text-base text-[#20252B]">
                      {[10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="flex items-center gap-1">
                    <button type="button" disabled={paginaAtual <= 1} onClick={() => atualizar({ pag: paginaAtual - 1 > 1 ? String(paginaAtual - 1) : null }, true)} className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 font-medium text-[#20252B] disabled:opacity-40">
                      Anterior
                    </button>
                    <span className="px-2 tabular-nums">
                      {paginaAtual} / {paginas}
                    </span>
                    <button type="button" disabled={paginaAtual >= paginas} onClick={() => atualizar({ pag: String(paginaAtual + 1) }, true)} className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 font-medium text-[#20252B] disabled:opacity-40">
                      Próxima
                    </button>
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {painel && (
        <Painel titulo={painel.tipo === "novo" ? "Novo fornecedor" : "Editar fornecedor"} subtitulo="Fornecedores não recebem acesso ao CRM." onFechar={fecharPainel}>
          <FornecedorForm
            fornecedor={painel.tipo === "editar" ? painel.fornecedor : undefined}
            onCancelar={fecharPainel}
            onSalvo={(r) => {
              setPainel(null);
              setAviso(r.mensagem);
            }}
          />
        </Painel>
      )}
    </div>
  );
}

function BadgeCategoria({ categoria }: { categoria: string | null }) {
  const c = corCategoria(categoria);
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: c.cor, backgroundColor: c.fundo }}>
      {rotuloCategoria(categoria)}
    </span>
  );
}

function BotaoIcone({ rotulo, onClick, href, children }: { rotulo: string; onClick?: () => void; href?: string; children: React.ReactNode }) {
  const cls =
    "crm-livre inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EB] bg-white text-[#59636F] transition hover:border-[#24476B]/40 hover:text-[#24476B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30";
  if (href)
    return (
      <a href={href} className={cls} title={rotulo} aria-label={rotulo}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls} title={rotulo} aria-label={rotulo}>
      {children}
    </button>
  );
}

function Contato({ f }: { f: Fornecedor }) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const copiar = async (v: string, o: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopiado(`${o} copiado`);
    } catch {
      setCopiado("Não foi possível copiar");
    }
    setTimeout(() => setCopiado(null), 2000);
  };
  const emailValido = f.email && /^\S+@\S+\.\S+$/.test(f.email) ? f.email : null;
  if (!f.telefone && !f.email) return <span className="text-[13px] text-[#8A929B]">Não informado</span>;
  const ic = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <div className="min-w-0 space-y-1.5">
      {f.telefone && (
        <div className="flex items-center gap-2">
          <span className="break-all text-sm tabular-nums text-[#20252B]">{f.telefone}</span>
          <BotaoIcone rotulo={`Copiar telefone de ${f.nome}`} onClick={() => copiar(f.telefone!, "Telefone")}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...ic}>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a1 1 0 0 1 1-1h10" />
            </svg>
          </BotaoIcone>
        </div>
      )}
      {f.email && (
        <div className="flex items-center gap-2">
          <span className="break-all text-[13px] text-[#20252B]">{f.email}</span>
          <BotaoIcone rotulo={`Copiar e-mail de ${f.nome}`} onClick={() => copiar(f.email!, "E-mail")}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...ic}>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a1 1 0 0 1 1-1h10" />
            </svg>
          </BotaoIcone>
          {emailValido && (
            <BotaoIcone rotulo={`Abrir e-mail para ${f.nome}`} href={`mailto:${emailValido}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" {...ic}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </BotaoIcone>
          )}
        </div>
      )}
      {copiado && (
        <p role="status" className="text-[13px] text-[#28665D]">
          {copiado}
        </p>
      )}
    </div>
  );
}

function Menu({ f, onEditar, onExcluir }: { f: Fornecedor; onEditar: () => void; onExcluir: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={`Ações de ${f.nome}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="crm-livre rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-base leading-none text-[#626B75] hover:text-[#20252B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
      >
        ⋯
      </button>
      {aberto && (
        <>
          <button type="button" aria-label="Fechar menu" className="crm-livre fixed inset-0 z-20 cursor-default" onClick={() => setAberto(false)} />
          <span role="menu" className="absolute right-0 top-full z-30 mt-1 block w-48 overflow-hidden rounded-xl border border-[#E4E7EB] bg-white py-1 text-left shadow-lg">
            <Link role="menuitem" href={`/crm/fornecedores/${f.id}`} className="block px-4 py-2 text-sm text-[#20252B] hover:bg-[#F5F6F7]">
              Abrir detalhes
            </Link>
            {[
              { l: "Editar", a: onEditar, p: false },
              { l: "Excluir", a: onExcluir, p: true },
            ].map((i) => (
              <button
                key={i.l}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAberto(false);
                  i.a();
                }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#F5F6F7] ${i.p ? "text-[#B42318]" : "text-[#20252B]"}`}
              >
                {i.l}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

function IconeCategoria({ categoria }: { categoria: string | null }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}>
      {categoria === "transporte" ? (
        <path d="M5 16V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8M5 12h14M7.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      ) : categoria === "hotel" ? (
        <path d="M3 20V7M3 14h18v6M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      ) : categoria === "guia" || categoria === "passeio_atracao" ? (
        <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      ) : categoria === "restaurante" ? (
        <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9" />
      ) : (
        <path d="M4 20V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14M14 10h5a1 1 0 0 1 1 1v9M3 20h18M7.5 9h3M7.5 13h3M7.5 17h3" />
      )}
    </svg>
  );
}
