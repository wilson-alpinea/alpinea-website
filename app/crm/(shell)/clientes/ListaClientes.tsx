"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ESTAGIOS, ESTAGIO_BADGE, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { ESTAGIOS_ENTREGA } from "@/lib/crm/estagiosEntrega";
import {
  PRODUTOS_PRINCIPAIS,
  PRODUTOS_SECUNDARIOS,
  PRODUTO_PRINCIPAL_LABEL,
  type ProdutoPrincipal,
} from "@/lib/crm/produtos";
import { CANAIS, rotuloOrigem } from "@/lib/crm/canal";
import { ehRegistroTeste, ehSelfService } from "@/lib/crm/origem";
import type { Estagio } from "@/lib/crm/types";
import { deleteClientes } from "../../actions";

// Lista de clientes (Wilson, 22/out/2026). Todo o estado (aba, busca,
// filtros, ordenação, página) vive na URL: voltar da ficha do cliente
// devolve a lista exatamente como estava.

export type ClienteLista = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  estagio: string;
  execucao: string; // "aguardando" ou valor de estagio_entrega
  valor: number | null;
  produtoPrincipal: string | null;
  produtosSecundarios: string[];
  origem: string | null;
  canal: string | null;
  canalDetalhe: string | null;
  responsavelId: string | null;
  responsavel: string | null;
  arquivado: boolean;
  ultimaInteracao: string | null;
  criadoEm: string;
};

type Ordem = "nome" | "valor" | "ultima" | "cadastro";
type ColunaOpcional = "execucao" | "origem" | "responsavel" | "cadastro";

const COLUNAS_OPCIONAIS: { id: ColunaOpcional; label: string }[] = [
  { id: "execucao", label: "Execução da viagem" },
  { id: "origem", label: "Origem" },
  { id: "responsavel", label: "Responsável" },
  { id: "cadastro", label: "Data de cadastro" },
];
const CHAVE_COLUNAS = "crm.clientes.colunas";
const EVENTO_COLUNAS = "crm-colunas-clientes";
const CHAVE_RETORNO = "crm.clientes.retorno"; // lido por VoltarClientes
function assinarColunas(aviso: () => void) {
  window.addEventListener(EVENTO_COLUNAS, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO_COLUNAS, aviso);
    window.removeEventListener("storage", aviso);
  };
}
function lerColunas() {
  try {
    return window.localStorage.getItem(CHAVE_COLUNAS) ?? "[]";
  } catch {
    return "[]";
  }
}

// Grupos usados pelos atalhos da Visão geral.
const ETAPAS_ABERTAS = ["novo_lead", "qualificacao", "proposta_enviada", "negociacao"];
const EXECUCAO_PREPARACAO = ["roteiro_elaboracao", "roteiro_entregue", "reservas_confirmadas"];

const EXECUCAO_OPCOES = [
  { valor: "aguardando", label: "Aguardando início" },
  { valor: "preparacao", label: "Em preparação (antes da viagem)" },
  ...ESTAGIOS_ENTREGA.map((e) => ({ valor: e.valor, label: e.label.charAt(0) + e.label.slice(1).toLowerCase() })),
];
const EXECUCAO_LABEL = Object.fromEntries(EXECUCAO_OPCOES.map((e) => [e.valor, e.label])) as Record<string, string>;

// Cards de resumo: cada um aplica o filtro de etapa correspondente.
const INDICADORES = [
  { id: "", titulo: "Clientes ativos", fundo: "#F2F6FC", cor: "#24476B", icone: "pessoas" },
  { id: "proposta_enviada", titulo: "Propostas enviadas", fundo: "#F5F3FA", cor: "#665582", icone: "documento" },
  { id: "negociacao", titulo: "Em negociação", fundo: "#FAF7F1", cor: "#946200", icone: "conversa" },
  { id: "fechado_ganho", titulo: "Contratos fechados", fundo: "#F0F7F5", cor: "#28665D", icone: "check" },
] as const;

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
const fmtValor = (v: number | null) => (v === null ? null : BRL.format(v).replace(/ /g, " "));
const fmtData = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }) : null;
const ehTeste = (c: ClienteLista) => ehRegistroTeste(c.origem);
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const CAMPO =
  "rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-base text-[#20252B] outline-none transition placeholder:text-[#8A929B] focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";
const CARD = "rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";

export function ListaClientes({ clientes }: { clientes: ClienteLista[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const aba = sp.get("aba") === "arquivados" ? "arquivados" : "ativos";
  const q = sp.get("q") ?? "";
  const etapa = sp.get("etapa") ?? "";
  const exec = sp.get("exec") ?? "";
  const produto = sp.get("produto") ?? "";
  const resp = sp.get("resp") ?? "";
  const origem = sp.get("origem") ?? "";
  const semTeste = sp.get("semTeste") === "1";
  const ordem = (["nome", "valor", "ultima", "cadastro"].includes(sp.get("ordem") ?? "") ? sp.get("ordem") : "cadastro") as Ordem;
  const dir = sp.get("dir") === "asc" ? "asc" : sp.get("dir") === "desc" ? "desc" : ordem === "nome" ? "asc" : "desc";
  const por = [10, 25, 50].includes(Number(sp.get("por"))) ? Number(sp.get("por")) : 25;
  const pagina = Math.max(1, Number(sp.get("pag")) || 1);

  function atualizar(mudancas: Record<string, string | null>, manterPagina = false) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    if (!manterPagina) p.delete("pag");
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  // Guarda o endereço da lista (com filtros) para o "← Clientes" da ficha.
  const enderecoAtual = sp.toString();
  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAVE_RETORNO, enderecoAtual ? `${pathname}?${enderecoAtual}` : pathname);
    } catch {}
  }, [pathname, enderecoAtual]);

  // Busca com pausa de 300 ms.
  const [textoBusca, setTextoBusca] = useState(q);
  const ultimoQ = useRef(q);
  useEffect(() => {
    if (textoBusca.trim() === ultimoQ.current) return;
    const t = setTimeout(() => {
      ultimoQ.current = textoBusca.trim();
      atualizar({ q: textoBusca.trim() || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoBusca]);

  // Colunas opcionais (preferência deste navegador).
  // Lido via useSyncExternalStore: o servidor renderiza sem colunas extras e
  // o navegador aplica a preferência salva sem erro de hidratação.
  const colunasSalvas = useSyncExternalStore(assinarColunas, lerColunas, () => "[]");
  const colunas = useMemo(() => {
    try {
      return new Set(JSON.parse(colunasSalvas) as ColunaOpcional[]);
    } catch {
      return new Set<ColunaOpcional>();
    }
  }, [colunasSalvas]);
  function alternarColuna(id: ColunaOpcional) {
    const novo = new Set(colunas);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    try {
      window.localStorage.setItem(CHAVE_COLUNAS, JSON.stringify([...novo]));
    } catch {}
    window.dispatchEvent(new Event(EVENTO_COLUNAS));
  }

  const [painel, setPainel] = useState<null | "filtros" | "colunas">(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [excluindo, iniciarExclusao] = useTransition();

  const ativos = useMemo(() => clientes.filter((c) => !c.arquivado), [clientes]);
  const arquivados = clientes.length - ativos.length;
  const contagens = useMemo(
    () => ({
      "": ativos.length,
      proposta_enviada: ativos.filter((c) => c.estagio === "proposta_enviada").length,
      negociacao: ativos.filter((c) => c.estagio === "negociacao").length,
      fechado_ganho: ativos.filter((c) => c.estagio === "fechado_ganho").length,
    }),
    [ativos],
  );
  const temTeste = clientes.some(ehTeste);
  const responsaveis = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of clientes) if (c.responsavelId && c.responsavel) m.set(c.responsavelId, c.responsavel);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [clientes]);

  const filtrados = useMemo(() => {
    const termo = semAcento(q.trim());
    const digitos = q.replace(/\D/g, "");
    const lista = clientes.filter((c) => {
      if (aba === "arquivados" ? !c.arquivado : c.arquivado) return false;
      if (termo) {
        const ok =
          semAcento(c.nome).includes(termo) ||
          semAcento(c.email ?? "").includes(termo) ||
          (c.telefone ?? "").toLowerCase().includes(termo) ||
          (digitos.length >= 3 && (c.telefone ?? "").replace(/\D/g, "").includes(digitos));
        if (!ok) return false;
      }
      if (etapa && (etapa === "abertas" ? !ETAPAS_ABERTAS.includes(c.estagio) : c.estagio !== etapa)) return false;
      if (exec && (exec === "preparacao" ? !EXECUCAO_PREPARACAO.includes(c.execucao) : c.execucao !== exec)) return false;
      if (produto && c.produtoPrincipal !== produto && !c.produtosSecundarios.includes(produto)) return false;
      if (resp && c.responsavelId !== resp) return false;
      if (origem) {
        if (origem === "sem_origem" ? !!c.canal : c.canal !== origem) return false;
      }
      if (semTeste && ehTeste(c)) return false;
      return true;
    });
    const fator = dir === "asc" ? 1 : -1;
    const nulosNoFim = (a: unknown, b: unknown) => (a === null ? 1 : 0) - (b === null ? 1 : 0);
    return lista.sort((a, b) => {
      if (ordem === "nome") return fator * a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
      if (ordem === "valor") return nulosNoFim(a.valor, b.valor) || fator * ((a.valor ?? 0) - (b.valor ?? 0));
      if (ordem === "ultima")
        return nulosNoFim(a.ultimaInteracao, b.ultimaInteracao) || fator * (a.ultimaInteracao ?? "").localeCompare(b.ultimaInteracao ?? "");
      return fator * a.criadoEm.localeCompare(b.criadoEm);
    });
  }, [clientes, aba, q, etapa, exec, produto, resp, origem, semTeste, ordem, dir]);

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / por));
  const paginaAtual = Math.min(pagina, paginas);
  const inicio = (paginaAtual - 1) * por;
  const visiveis = filtrados.slice(inicio, inicio + por);

  const chips: { rotulo: string; limpar: Record<string, null> }[] = [];
  if (q) chips.push({ rotulo: `Busca: “${q}”`, limpar: { q: null } });
  if (etapa) chips.push({ rotulo: `Etapa: ${etapa === "abertas" ? "Negociações abertas" : ESTAGIO_LABEL[etapa as Estagio] ?? etapa}`, limpar: { etapa: null } });
  if (exec) chips.push({ rotulo: `Execução: ${EXECUCAO_LABEL[exec] ?? exec}`, limpar: { exec: null } });
  if (produto)
    chips.push({
      rotulo: `Produto: ${[...PRODUTOS_PRINCIPAIS, ...PRODUTOS_SECUNDARIOS].find((p) => p.valor === produto)?.label ?? produto}`,
      limpar: { produto: null },
    });
  if (resp) chips.push({ rotulo: `Responsável: ${responsaveis.find(([id]) => id === resp)?.[1] ?? "—"}`, limpar: { resp: null } });
  if (origem) chips.push({ rotulo: `Origem: ${origem === "sem_origem" ? "Sem origem" : CANAIS.find((c) => c.valor === origem)?.label ?? origem}`, limpar: { origem: null } });
  if (semTeste) chips.push({ rotulo: "Sem registros de teste", limpar: { semTeste: null } });
  const filtrosAvancados = [exec, produto, resp, origem, semTeste ? "1" : ""].filter(Boolean).length;

  function limparTudo() {
    setTextoBusca("");
    ultimoQ.current = "";
    atualizar({ q: null, etapa: null, exec: null, produto: null, resp: null, origem: null, semTeste: null });
  }

  function ordenarPor(o: Ordem) {
    if (o === ordem) atualizar({ ordem: o, dir: dir === "asc" ? "desc" : "asc" }, true);
    else atualizar({ ordem: o, dir: o === "nome" ? "asc" : "desc" }, true);
  }

  const idsVisiveis = visiveis.map((c) => c.id);
  const todosVisiveisMarcados = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));
  function alternarTodos() {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (todosVisiveisMarcados) idsVisiveis.forEach((id) => novo.delete(id));
      else idsVisiveis.forEach((id) => novo.add(id));
      return novo;
    });
  }
  function alternarUm(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }
  function excluirSelecionados() {
    const n = selecionados.size;
    if (!n) return;
    if (!window.confirm(`Excluir ${n} ${n === 1 ? "cliente" : "clientes"}? Essa ação não pode ser desfeita.`)) return;
    iniciarExclusao(async () => {
      await deleteClientes([...selecionados]);
      setSelecionados(new Set());
    });
  }

  const mostrar = (c: ColunaOpcional) => colunas.has(c);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]">Clientes</h1>
          <p className="mt-0.5 text-sm text-[#626B75]">
            {clientes.length} {clientes.length === 1 ? "registro" : "registros"} no total
          </p>
        </div>
        <Link
          href="/crm/clientes/novo"
          className="inline-flex items-center rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/40 focus-visible:ring-offset-2"
        >
          + Novo cliente
        </Link>
      </div>

      <div role="tablist" aria-label="Situação do cadastro" className="flex gap-1 border-b border-[#E6E9ED]">
        {[
          { id: "ativos", label: "Ativos", n: ativos.length },
          { id: "arquivados", label: "Arquivados", n: arquivados },
        ].map((t) => {
          const sel = aba === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={sel}
              onClick={() => {
                setSelecionados(new Set());
                atualizar({ aba: t.id === "ativos" ? null : "arquivados" });
              }}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30 ${
                sel ? "border-[#24476B] text-[#24476B]" : "border-transparent text-[#626B75] hover:text-[#20252B]"
              }`}
            >
              {t.label} <span className={sel ? "text-[#24476B]/70" : "text-[#8A929B]"}>{t.n}</span>
            </button>
          );
        })}
      </div>

      {/* Indicadores (sempre sobre os ativos, independentes da página) */}
      <section aria-label="Resumo dos clientes ativos">
        <p className="mb-2 text-[13px] text-[#626B75]">Resumo dos clientes ativos · clique para filtrar</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDICADORES.map((ind) => {
            const sel = aba === "ativos" && etapa === ind.id;
            return (
              <button
                key={ind.titulo}
                type="button"
                aria-pressed={aba === "ativos" && etapa === ind.id && ind.id !== ""}
                onClick={() => {
                  if (ind.id && etapa === ind.id && aba === "ativos") atualizar({ etapa: null });
                  else atualizar({ aba: null, etapa: ind.id || null });
                }}
                className={`group flex items-center justify-between gap-3 rounded-2xl border border-t-[3px] p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-18px_rgba(0,0,0,0.2)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  sel ? "ring-2" : "border-black/[0.06]"
                }`}
                style={{
                  backgroundColor: ind.fundo,
                  borderTopColor: ind.cor,
                  ...(sel ? { ["--tw-ring-color" as string]: ind.cor, borderColor: ind.cor } : {}),
                }}
              >
                <span>
                  <span className="block text-sm font-medium text-[#626B75]">{ind.titulo}</span>
                  <span className="mt-0.5 block text-[28px] font-semibold leading-tight tabular-nums" style={{ color: ind.cor }}>
                    {contagens[ind.id]}
                  </span>
                  {ind.id && etapa === ind.id && aba === "ativos" && <span className="text-[13px] text-[#626B75]">Filtrando · clique para remover</span>}
                </span>
                <Icone nome={ind.icone} cor={ind.cor} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Busca e filtros */}
      <section className={`${CARD} p-4`} aria-label="Busca e filtros">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="busca-clientes">
            Buscar clientes
          </label>
          <input
            id="busca-clientes"
            type="search"
            value={textoBusca}
            onChange={(e) => setTextoBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone…"
            className={`${CAMPO} min-w-[220px] flex-1`}
          />
          <label className="sr-only" htmlFor="filtro-etapa">
            Etapa comercial
          </label>
          <select id="filtro-etapa" value={etapa} onChange={(e) => atualizar({ etapa: e.target.value || null })} className={`${CAMPO} min-w-[180px]`}>
            <option value="">Etapa comercial: todas</option>
            <option value="abertas">Negociações abertas (até Em negociação)</option>
            {ESTAGIOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-expanded={painel === "filtros"}
            onClick={() => setPainel(painel === "filtros" ? null : "filtros")}
            className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
          >
            Mais filtros{filtrosAvancados > 0 && <span className="ml-1.5 rounded-full bg-[#24476B] px-1.5 text-[12px] text-white">{filtrosAvancados}</span>}
          </button>
          <button
            type="button"
            aria-expanded={painel === "colunas"}
            onClick={() => setPainel(painel === "colunas" ? null : "colunas")}
            className="hidden rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30 md:inline-flex"
          >
            Colunas
          </button>
        </div>

        {painel === "filtros" && (
          <div className="mt-4 grid gap-4 border-t border-[#E6E9ED] pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <Filtro rotulo="Execução da viagem" id="f-exec" valor={exec} onChange={(v) => atualizar({ exec: v })} opcoes={EXECUCAO_OPCOES} />
            <div>
              <label htmlFor="f-produto" className="mb-1.5 block text-[13px] font-medium text-[#626B75]">
                Produto
              </label>
              <select id="f-produto" value={produto} onChange={(e) => atualizar({ produto: e.target.value || null })} className={`${CAMPO} w-full`}>
                <option value="">Todos</option>
                <optgroup label="Produto principal">
                  {PRODUTOS_PRINCIPAIS.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Produto secundário">
                  {PRODUTOS_SECUNDARIOS.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {responsaveis.length > 0 && (
              <Filtro rotulo="Responsável" id="f-resp" valor={resp} onChange={(v) => atualizar({ resp: v })} opcoes={responsaveis.map(([valor, label]) => ({ valor, label }))} />
            )}
            <Filtro
              rotulo="Origem"
              id="f-origem"
              valor={origem}
              onChange={(v) => atualizar({ origem: v })}
              opcoes={[...CANAIS.map((c) => ({ valor: c.valor as string, label: c.label })), { valor: "sem_origem", label: "Sem origem" }]}
            />
            {temTeste && (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#20252B] sm:col-span-2 lg:col-span-4">
                <input type="checkbox" checked={semTeste} onChange={(e) => atualizar({ semTeste: e.target.checked ? "1" : null })} className="h-4 w-4 accent-[#24476B]" />
                Ocultar registros de teste <span className="text-[13px] font-normal text-[#626B75]">(criados pela página de pagamento de teste)</span>
              </label>
            )}
          </div>
        )}

        {painel === "colunas" && (
          <fieldset className="mt-4 border-t border-[#E6E9ED] pt-4">
            <legend className="mb-2 text-[13px] font-medium text-[#626B75]">Colunas opcionais</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {COLUNAS_OPCIONAIS.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#20252B]">
                  <input type="checkbox" checked={colunas.has(c.id)} onChange={() => alternarColuna(c.id)} className="h-4 w-4 accent-[#24476B]" />
                  {c.label}
                </label>
              ))}
            </div>
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
                    setTextoBusca("");
                    ultimoQ.current = "";
                  }
                  atualizar(c.limpar);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#24476B]/20 bg-[#EAF1F8] px-3 py-1 text-[13px] font-medium text-[#24476B] transition hover:border-[#24476B]/50"
                aria-label={`Remover filtro ${c.rotulo}`}
              >
                {c.rotulo} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" onClick={limparTudo} className="text-[13px] font-medium text-[#626B75] underline-offset-2 hover:text-[#20252B] hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* Barra de seleção */}
      {selecionados.size > 0 && (
        <div className="z-20 flex md:sticky md:top-[97px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#24476B]/20 bg-[#EAF1F8] px-4 py-2.5">
          <span className="text-sm font-medium text-[#24476B]">
            {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelecionados(new Set())} className="rounded-lg px-3 py-1.5 text-sm text-[#24476B] hover:underline">
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={excluirSelecionados}
              disabled={excluindo}
              className="rounded-lg border border-[#B42318]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#B42318] transition hover:bg-[#FDEDEC] disabled:opacity-50"
            >
              {excluindo ? "Excluindo…" : "Excluir selecionados"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {total === 0 ? (
        <div className={`${CARD} px-6 py-12 text-center`}>
          <p className="text-base font-semibold text-[#20252B]">Nenhum cliente encontrado</p>
          {chips.length > 0 ? (
            <button type="button" onClick={limparTudo} className="mt-3 rounded-xl border border-[#D5DAE0] bg-white px-4 py-2 text-sm font-medium text-[#20252B] hover:border-[#24476B]/50">
              Limpar filtros
            </button>
          ) : (
            <p className="mt-1 text-sm text-[#626B75]">{aba === "arquivados" ? "Nenhum lead arquivado." : "Cadastre o primeiro cliente."}</p>
          )}
        </div>
      ) : (
        <>
          {/* Tabela (md+) — sem overflow-hidden para o cabeçalho poder ficar fixo */}
          <div className={`${CARD} hidden md:block`}>
            <table className="w-full text-left text-sm">
              <thead className="text-[13px] text-[#626B75]">
                <tr>
                  <Th className="w-10 rounded-tl-2xl">
                    <input type="checkbox" checked={todosVisiveisMarcados} onChange={alternarTodos} aria-label="Selecionar todos desta página" className="h-4 w-4 accent-[#24476B]" />
                  </Th>
                  <Th>
                    <BotaoOrdem rotulo="Cliente" ativo={ordem === "nome"} dir={dir} onClick={() => ordenarPor("nome")} />
                  </Th>
                  <Th className="hidden lg:table-cell">Produto principal</Th>
                  <Th>Etapa comercial</Th>
                  {mostrar("execucao") && <Th>Execução da viagem</Th>}
                  <Th className="text-right">
                    <BotaoOrdem rotulo="Valor da proposta" ativo={ordem === "valor"} dir={dir} onClick={() => ordenarPor("valor")} alinhar="direita" />
                  </Th>
                  <Th>
                    <BotaoOrdem rotulo="Última interação" ativo={ordem === "ultima"} dir={dir} onClick={() => ordenarPor("ultima")} />
                  </Th>
                  {mostrar("origem") && <Th>Origem</Th>}
                  {mostrar("responsavel") && <Th>Responsável</Th>}
                  {mostrar("cadastro") && (
                    <Th>
                      <BotaoOrdem rotulo="Cadastro" ativo={ordem === "cadastro"} dir={dir} onClick={() => ordenarPor("cadastro")} />
                    </Th>
                  )}
                  <Th className="rounded-tr-2xl text-right">
                    <span className="sr-only">Ações</span>
                  </Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {visiveis.map((c) => (
                  <tr key={c.id} className="transition hover:bg-[#F7F9FB]">
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selecionados.has(c.id)} onChange={() => alternarUm(c.id)} aria-label={`Selecionar ${c.nome}`} className="h-4 w-4 accent-[#24476B]" />
                    </td>
                    <td className="max-w-[280px] px-4 py-3.5">
                      <Link href={`/crm/clientes/${c.id}`} className="break-words font-semibold text-[#20252B] hover:text-[#24476B] hover:underline">
                        {c.nome}
                      </Link>
                      <Contato c={c} />
                    </td>
                    <td className="hidden px-4 py-3.5 text-[#20252B] lg:table-cell">{rotuloProduto(c.produtoPrincipal) ?? <Vazio />}</td>
                    <td className="px-4 py-3.5">
                      <BadgeEtapa estagio={c.estagio} />
                    </td>
                    {mostrar("execucao") && <td className="whitespace-nowrap px-4 py-3.5 text-[#20252B]">{EXECUCAO_LABEL[c.execucao] ?? c.execucao}</td>}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-[#20252B]">{fmtValor(c.valor) ?? <Vazio texto="Sem valor" />}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[#20252B]">{fmtData(c.ultimaInteracao) ?? <Vazio texto="Sem interação" />}</td>
                    {mostrar("origem") && (
                      <td className="px-4 py-3.5">
                        <Origem c={c} />
                      </td>
                    )}
                    {mostrar("responsavel") && <td className="px-4 py-3.5 text-[#20252B]">{c.responsavel ?? <Vazio />}</td>}
                    {mostrar("cadastro") && <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[#20252B]">{fmtData(c.criadoEm)}</td>}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <Link href={`/crm/clientes/${c.id}`} className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#24476B] hover:bg-[#EAF1F8]" aria-label={`Abrir ${c.nome}`}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Celular: cards compactos */}
          <ul className="space-y-3 md:hidden">
            {visiveis.map((c) => (
              <li key={c.id} className={`${CARD} p-4`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selecionados.has(c.id)} onChange={() => alternarUm(c.id)} aria-label={`Selecionar ${c.nome}`} className="mt-1 h-4 w-4 shrink-0 accent-[#24476B]" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/crm/clientes/${c.id}`} className="break-words font-semibold text-[#20252B]">
                      {c.nome}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <BadgeEtapa estagio={c.estagio} />
                      {ehSelfService(c.origem) && <SeloSelfService />}
                    </div>
                    <p className="mt-2 text-[13px] text-[#626B75]">{rotuloProduto(c.produtoPrincipal) ?? "Sem produto"}</p>
                    <p className="text-sm font-medium tabular-nums text-[#20252B]">{fmtValor(c.valor) ?? <Vazio texto="Sem valor" />}</p>
                  </div>
                  <Link href={`/crm/clientes/${c.id}`} className="shrink-0 rounded-lg border border-[#D5DAE0] px-3 py-1.5 text-sm font-medium text-[#24476B]" aria-label={`Ver detalhes de ${c.nome}`}>
                    Detalhes
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#626B75]">
            <p className="tabular-nums" aria-live="polite">
              Exibindo {inicio + 1}–{Math.min(inicio + por, total)} de {total} {total === 1 ? "cliente" : "clientes"}
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
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={paginaAtual <= 1}
                  onClick={() => atualizar({ pag: paginaAtual - 1 > 1 ? String(paginaAtual - 1) : null }, true)}
                  className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 font-medium text-[#20252B] disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-2 tabular-nums">
                  {paginaAtual} / {paginas}
                </span>
                <button
                  type="button"
                  disabled={paginaAtual >= paginas}
                  onClick={() => atualizar({ pag: String(paginaAtual + 1) }, true)}
                  className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 font-medium text-[#20252B] disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── peças ────────────────────────────────────────────────────────
function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  // Cabeçalho fixo logo abaixo da barra preta (97 px no desktop).
  return <th className={`sticky top-[97px] z-10 border-b border-[#E6E9ED] bg-[#F5F6F7] px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function BotaoOrdem({ rotulo, ativo, dir, onClick, alinhar }: { rotulo: string; ativo: boolean; dir: "asc" | "desc"; onClick: () => void; alinhar?: "direita" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ordenar por ${rotulo.toLowerCase()}${ativo ? (dir === "asc" ? ", crescente" : ", decrescente") : ""}`}
      className={`inline-flex items-center gap-1 rounded font-medium hover:text-[#20252B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30 ${ativo ? "text-[#20252B]" : ""} ${alinhar === "direita" ? "flex-row-reverse" : ""}`}
    >
      {rotulo}
      <span aria-hidden="true" className={ativo ? "text-[#24476B]" : "text-[#B8BEC5]"}>
        {ativo ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

function BadgeEtapa({ estagio }: { estagio: string }) {
  const cor = ESTAGIO_BADGE[estagio as Estagio] ?? { fundo: "#F1F3F5", texto: "#59636F" };
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium leading-none" style={{ backgroundColor: cor.fundo, color: cor.texto }}>
      {ESTAGIO_LABEL[estagio as Estagio] ?? estagio}
    </span>
  );
}

function SeloSelfService() {
  return <span className="inline-flex whitespace-nowrap rounded-full bg-[#EAF4FA] px-2 py-0.5 text-[12px] font-medium text-[#2A5F7E]">Self-service</span>;
}

function Origem({ c }: { c: ClienteLista }) {
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="text-[#20252B]">{rotuloOrigem(c.canal, null)}</span>
      {ehSelfService(c.origem) && <SeloSelfService />}
    </span>
  );
}

function Contato({ c }: { c: ClienteLista }) {
  const partes = [c.email, c.telefone].filter(Boolean) as string[];
  if (!partes.length) return <p className="mt-0.5 text-[13px] text-[#8A929B]">Sem contato</p>;
  return (
    <p className="mt-0.5 break-all text-[13px] text-[#626B75]">
      {c.email && (
        <a href={`mailto:${c.email}`} className="hover:text-[#24476B] hover:underline">
          {c.email}
        </a>
      )}
      {c.email && c.telefone && " · "}
      {c.telefone && (
        <a href={`tel:${c.telefone.replace(/[^\d+]/g, "")}`} className="whitespace-nowrap hover:text-[#24476B] hover:underline">
          {c.telefone}
        </a>
      )}
    </p>
  );
}

function Vazio({ texto = "—" }: { texto?: string }) {
  return <span className="text-[#8A929B]">{texto}</span>;
}

function Filtro({ rotulo, id, valor, onChange, opcoes }: { rotulo: string; id: string; valor: string; onChange: (v: string | null) => void; opcoes: { valor: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#626B75]">
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

function rotuloProduto(v: string | null) {
  return v ? PRODUTO_PRINCIPAL_LABEL[v as ProdutoPrincipal] ?? v : null;
}

function Icone({ nome, cor }: { nome: string; cor: string }) {
  const comum = { fill: "none", stroke: cor, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...comum}>
        {nome === "pessoas" && (
          <>
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5" />
            <path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 14.3c1.6.6 2.6 2.2 3 4.7" />
          </>
        )}
        {nome === "documento" && (
          <>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </>
        )}
        {nome === "conversa" && (
          <>
            <path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            <path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L16 18h-3" />
          </>
        )}
        {nome === "check" && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="m8.3 12.3 2.5 2.5 4.9-5.2" />
          </>
        )}
      </svg>
    </span>
  );
}
