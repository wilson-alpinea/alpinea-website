"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { definirVagasAtivas } from "../../../actions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";

// Vagas no site — redesenho 23/out/2026. Seleção (checkbox) e publicação
// (switch) são controles separados; nada muda de visibilidade sem um
// clique explícito no switch ou uma ação em lote confirmada.

export type LinhaVaga = {
  id: string;
  codigo: string;
  publicadaEm: string; // AAAA-MM-DD (ordenação)
  publicadaBR: string; // dd/mm/aaaa
  empresa: string;
  titulo: string;
  cidade: string;
  provincia: string;
  ativa: boolean;
  candidaturas: number | null; // null = contagem não carregou
};

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const SELECT = "rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2.5 text-base text-[#202B28] outline-none focus:border-[#42658A] focus:ring-2 focus:ring-[#42658A]/25";
const POR_PAGINA = [10, 25, 50];
const ORDENS = [
  { v: "recentes", r: "Publicação mais recente" },
  { v: "antigas", r: "Publicação mais antiga" },
  { v: "empresa", r: "Empresa (A–Z)" },
  { v: "candidaturas", r: "Mais candidaturas" },
];
const local = (l: { cidade: string; provincia: string }) => (l.cidade === l.provincia ? l.cidade : `${l.cidade}, ${l.provincia}`);
const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

function IconeExterno() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerPagina({ l, compacto = false }: { l: LinhaVaga; compacto?: boolean }) {
  return (
    <a
      href={`/empregos/vagas/${l.id}`}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#42658A] hover:underline ${compacto ? "text-[13px]" : "text-sm"}`}
      aria-label={`Ver página da vaga ${l.codigo} (abre em nova aba)`}
    >
      Ver página
      <IconeExterno />
    </a>
  );
}

function Candidaturas({ l }: { l: LinhaVaga }) {
  if (l.candidaturas === null) return <span className="text-[13px] text-[#8A9792]">Não disponível</span>;
  return (
    <Link href={`/crm/empregos?vaga=${encodeURIComponent(l.id)}`} className="text-sm font-medium tabular-nums text-[#42658A] hover:underline" aria-label={`Ver ${plural(l.candidaturas, "candidatura", "candidaturas")} da vaga ${l.codigo}`}>
      {l.candidaturas}
      <span className="font-normal text-[#626E69]"> {l.candidaturas === 1 ? "candidatura" : "candidaturas"}</span>
    </Link>
  );
}

/** Switch de publicação — independente do checkbox de seleção. */
function SwitchVisibilidade({ l, ativa, salvando, onAlternar }: { l: LinhaVaga; ativa: boolean; salvando: boolean; onAlternar: () => void }) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={ativa}
        aria-label={`Visibilidade da vaga ${l.codigo} no site`}
        disabled={salvando}
        onClick={(e) => {
          e.stopPropagation();
          onAlternar();
        }}
        className={`crm-livre relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27675B]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${ativa ? "bg-[#27675B]" : "bg-[#C9D2CE]"}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${ativa ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
      <span className={`min-w-[4.5rem] text-[13px] font-medium ${salvando ? "text-[#626E69]" : ativa ? "text-[#27675B]" : "text-[#5D6C70]"}`} aria-live="polite">
        {salvando ? "Salvando…" : ativa ? "Visível" : "Oculta"}
      </span>
    </span>
  );
}

export default function ListaVagasSite({ linhas, erroStatus }: { linhas: LinhaVaga[]; erroStatus: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const vis = sp.get("vis") ?? ""; // "" | visiveis | ocultas
  const empresa = sp.get("empresa") ?? "";
  const prov = sp.get("prov") ?? "";
  const cidade = sp.get("cidade") ?? "";
  const cand = sp.get("cand") ?? ""; // "" | com | sem
  const ord = ORDENS.some((o) => o.v === sp.get("ord")) ? sp.get("ord")! : "recentes";
  const pp = POR_PAGINA.includes(Number(sp.get("pp"))) ? Number(sp.get("pp")) : 25;
  const detalheId = sp.get("detalhe");

  const atualizar = useCallback(
    (mudancas: Record<string, string | null>, manterPagina = false) => {
      const p = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(mudancas)) {
        if (v) p.set(k, v);
        else p.delete(k);
      }
      if (!manterPagina) p.delete("pag");
      const s = p.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  // Busca com pausa na digitação.
  const [texto, setTexto] = useState(q);
  const ultimoQ = useRef(q);
  useEffect(() => {
    if (texto.trim() === ultimoQ.current) return;
    const t = setTimeout(() => {
      ultimoQ.current = texto.trim();
      atualizar({ q: texto.trim() || null });
    }, 300);
    return () => clearTimeout(t);
  }, [texto, atualizar]);

  const [maisFiltros, setMaisFiltros] = useState(!!(empresa || prov || cidade || cand));
  const [ativas, setAtivas] = useState(() => new Set(linhas.filter((l) => l.ativa).map((l) => l.id)));
  const [salvando, setSalvando] = useState<Set<string>>(new Set());
  const [erroLinha, setErroLinha] = useState<Record<string, string>>({});
  const [selecao, setSelecao] = useState<Set<string>>(new Set());
  const [lote, setLote] = useState<null | boolean>(null); // true = tornar visíveis
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [, iniciar] = useTransition();

  const empresas = useMemo(() => [...new Set(linhas.map((l) => l.empresa))].sort((a, b) => a.localeCompare(b, "pt-BR")), [linhas]);
  const provincias = useMemo(() => [...new Set(linhas.map((l) => l.provincia))].sort((a, b) => a.localeCompare(b, "pt-BR")), [linhas]);
  const cidades = useMemo(
    () => [...new Set(linhas.filter((l) => !prov || l.provincia === prov).map((l) => l.cidade))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [linhas, prov],
  );
  const contagemOk = linhas.every((l) => l.candidaturas !== null);

  const filtradas = useMemo(() => {
    const b = norm(q.trim());
    const r = linhas.filter((l) => {
      if (b && !norm(`${l.codigo} ${l.empresa} ${l.titulo} ${l.cidade} ${l.provincia}`).includes(b)) return false;
      if (vis === "visiveis" && !ativas.has(l.id)) return false;
      if (vis === "ocultas" && ativas.has(l.id)) return false;
      if (empresa && l.empresa !== empresa) return false;
      if (prov && l.provincia !== prov) return false;
      if (cidade && l.cidade !== cidade) return false;
      if (cand && l.candidaturas === null) return false;
      if (cand === "com" && !l.candidaturas) return false;
      if (cand === "sem" && l.candidaturas !== 0) return false;
      return true;
    });
    const porCodigo = (a: LinhaVaga, c: LinhaVaga) => c.codigo.localeCompare(a.codigo);
    r.sort((a, c) => {
      if (ord === "antigas") return a.publicadaEm.localeCompare(c.publicadaEm) || a.codigo.localeCompare(c.codigo);
      if (ord === "empresa") return a.empresa.localeCompare(c.empresa, "pt-BR") || a.titulo.localeCompare(c.titulo, "pt-BR");
      if (ord === "candidaturas") return (c.candidaturas ?? -1) - (a.candidaturas ?? -1) || porCodigo(a, c);
      return c.publicadaEm.localeCompare(a.publicadaEm) || porCodigo(a, c);
    });
    return r;
  }, [linhas, q, vis, empresa, prov, cidade, cand, ord, ativas]);

  const total = filtradas.length;
  const paginas = Math.max(1, Math.ceil(total / pp));
  const pagina = Math.min(Math.max(1, Number(sp.get("pag")) || 1), paginas);
  const daPagina = filtradas.slice((pagina - 1) * pp, pagina * pp);
  const nVisiveis = linhas.filter((l) => ativas.has(l.id)).length;
  const detalhe = detalheId ? linhas.find((l) => l.id === detalheId) : undefined;
  const fecharDetalhe = useCallback(() => atualizar({ detalhe: null }, true), [atualizar]);

  const chips: { rotulo: string; limpar: Record<string, null> }[] = [];
  if (q) chips.push({ rotulo: `Busca: “${q}”`, limpar: { q: null } });
  if (vis) chips.push({ rotulo: vis === "visiveis" ? "Visíveis" : "Ocultas", limpar: { vis: null } });
  if (empresa) chips.push({ rotulo: `Empresa: ${empresa}`, limpar: { empresa: null } });
  if (prov) chips.push({ rotulo: `Província: ${prov}`, limpar: { prov: null, cidade: null } });
  if (cidade) chips.push({ rotulo: `Cidade: ${cidade}`, limpar: { cidade: null } });
  if (cand) chips.push({ rotulo: cand === "com" ? "Com candidaturas" : "Sem candidaturas", limpar: { cand: null } });
  const limparTudo = () => {
    setTexto("");
    ultimoQ.current = "";
    atualizar({ q: null, vis: null, empresa: null, prov: null, cidade: null, cand: null });
  };

  function alternar(l: LinhaVaga) {
    const nova = !ativas.has(l.id);
    setErroLinha((e) => {
      const n = { ...e };
      delete n[l.id];
      return n;
    });
    setSalvando((s) => new Set(s).add(l.id));
    iniciar(async () => {
      let r: Awaited<ReturnType<typeof definirVagasAtivas>>;
      try {
        r = await definirVagasAtivas([l.id], nova);
      } catch {
        r = { ok: false, erro: "Sem conexão com o servidor." };
      }
      if (r.ok) {
        setAtivas((a) => {
          const n = new Set(a);
          if (nova) n.add(l.id);
          else n.delete(l.id);
          return n;
        });
      } else setErroLinha((e) => ({ ...e, [l.id]: `Não foi possível salvar: ${r.erro} A vaga continua ${nova ? "oculta" : "visível"}.` }));
      setSalvando((s) => {
        const n = new Set(s);
        n.delete(l.id);
        return n;
      });
    });
  }

  function alternarSelecao(id: string) {
    setSelecao((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  const idsPagina = daPagina.map((l) => l.id);
  const paginaToda = idsPagina.length > 0 && idsPagina.every((id) => selecao.has(id));
  const paginaParcial = !paginaToda && idsPagina.some((id) => selecao.has(id));
  function selecionarPagina() {
    setSelecao((s) => {
      const n = new Set(s);
      for (const id of idsPagina) {
        if (paginaToda) n.delete(id);
        else n.add(id);
      }
      return n;
    });
  }
  const cabecalhoRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (cabecalhoRef.current) cabecalhoRef.current.indeterminate = paginaParcial;
  }, [paginaParcial]);
  const todasFiltradasSelecionadas = total > 0 && filtradas.every((l) => selecao.has(l.id));

  const indicadores = [
    { chave: "", rotulo: "Total de vagas", valor: linhas.length, fundo: "#EFF4FA", cor: "#42658A" },
    { chave: "visiveis", rotulo: "Visíveis no site", valor: nVisiveis, fundo: "#EEF6F3", cor: "#27675B" },
    { chave: "ocultas", rotulo: "Ocultas do site", valor: linhas.length - nVisiveis, fundo: "#F4F1F8", cor: "#75608B" },
  ];

  if (erroStatus) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#202B28]">Não foi possível carregar a visibilidade das vagas.</p>
        <p className="mt-1 text-sm text-[#626E69]">Sem esse dado não dá para saber quais vagas estão no site. Nada foi alterado.</p>
        <button type="button" onClick={() => router.refresh()} className="mt-4 rounded-xl bg-[#27675B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20564C]">
          Tentar novamente
        </button>
      </div>
    );
  }
  if (linhas.length === 0) {
    return (
      <div className={`rounded-2xl border border-[#DEE6E2] bg-white p-8 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#202B28]">Nenhuma vaga disponível no catálogo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-3">
        {indicadores.map((c) => {
          const ativo = vis === c.chave && (c.chave !== "" || chips.length === 0);
          return (
            <button
              key={c.rotulo}
              type="button"
              aria-pressed={ativo}
              onClick={() => atualizar({ vis: c.chave || null })}
              className={`crm-livre rounded-2xl border border-t-[3px] p-5 text-left transition hover:brightness-[0.98] ${SOMBRA} ${ativo ? "ring-2 ring-offset-2" : "border-[#DEE6E2]"}`}
              style={{ backgroundColor: c.fundo, borderTopColor: c.cor, ...(ativo ? ({ "--tw-ring-color": c.cor, borderColor: c.cor } as React.CSSProperties) : {}) }}
            >
              <span className="block text-sm font-medium" style={{ color: c.cor }}>
                {c.rotulo}
              </span>
              <span className="mt-1 block tabular-nums text-[#202B28]" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>
                {c.valor}
              </span>
              <span className="block text-[13px] text-[#626E69]">{ativo ? "Filtro aplicado" : c.chave ? "Clique para filtrar" : "Clique para ver todas"}</span>
            </button>
          );
        })}
      </div>

      {/* Busca e filtros */}
      <section className={`rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 ${SOMBRA}`} aria-label="Busca e filtros">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="busca-vagas" className="sr-only">
            Buscar vagas
          </label>
          <input
            id="busca-vagas"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por código, empresa, cidade ou função…"
            className={`${SELECT} min-w-0 flex-1 basis-[260px]`}
          />
          <select aria-label="Visibilidade" value={vis} onChange={(e) => atualizar({ vis: e.target.value || null })} className={SELECT}>
            <option value="">Todas</option>
            <option value="visiveis">Visíveis</option>
            <option value="ocultas">Ocultas</option>
          </select>
          <select aria-label="Ordenar por" value={ord} onChange={(e) => atualizar({ ord: e.target.value === "recentes" ? null : e.target.value })} className={SELECT}>
            {ORDENS.filter((o) => o.v !== "candidaturas" || contagemOk).map((o) => (
              <option key={o.v} value={o.v}>
                {o.r}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-expanded={maisFiltros}
            onClick={() => setMaisFiltros((m) => !m)}
            className="rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] hover:border-[#42658A]/50"
          >
            Mais filtros {maisFiltros ? "▴" : "▾"}
          </button>
        </div>
        {maisFiltros && (
          <div className="mt-3 grid gap-3 border-t border-[#EEF2F0] pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <select aria-label="Empresa" value={empresa} onChange={(e) => atualizar({ empresa: e.target.value || null })} className={SELECT}>
              <option value="">Todas as empresas</option>
              {empresas.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select aria-label="Província" value={prov} onChange={(e) => atualizar({ prov: e.target.value || null, cidade: null })} className={SELECT}>
              <option value="">Todas as províncias</option>
              {provincias.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select aria-label="Cidade" value={cidade} onChange={(e) => atualizar({ cidade: e.target.value || null })} className={SELECT}>
              <option value="">Todas as cidades</option>
              {cidades.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select aria-label="Candidaturas" value={cand} disabled={!contagemOk} onChange={(e) => atualizar({ cand: e.target.value || null })} className={`${SELECT} disabled:opacity-50`}>
              <option value="">Com e sem candidaturas</option>
              <option value="com">Com candidaturas</option>
              <option value="sem">Sem candidaturas</option>
            </select>
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
                    ultimoQ.current = "";
                  }
                  atualizar(c.limpar);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#42658A]/25 bg-[#EFF4FA] px-3 py-1 text-[13px] text-[#2F4D6B] hover:border-[#42658A]/60"
                aria-label={`Remover filtro ${c.rotulo}`}
              >
                {c.rotulo} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" onClick={limparTudo} className="text-[13px] font-medium text-[#42658A] hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
        <details className="group mt-3 text-[13px] text-[#626E69]">
          <summary className="cursor-pointer select-none font-medium text-[#42658A] hover:underline">Como funciona a publicação</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>As vagas vêm do catálogo do site; empresa, função e condições são editadas no catálogo, não aqui.</li>
            <li>Vaga nova do catálogo entra visível automaticamente.</li>
            <li>Vaga oculta sai de /empregos, dos hot sites e das sugestões e deixa de aceitar candidaturas. O link direto continua abrindo e mostra a vaga como encerrada.</li>
            <li>Ocultar não apaga nem altera candidaturas já recebidas.</li>
          </ul>
        </details>
      </section>

      {aviso && (
        <p role="status" className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${aviso.ok ? "border-[#27675B]/20 bg-[#EEF6F3] text-[#1F5248]" : "border-[#B42318]/20 bg-[#FDECEA] text-[#B42318]"}`}>
          {aviso.texto}
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)} className="crm-livre text-lg leading-none">
            ×
          </button>
        </p>
      )}

      {/* Barra de seleção */}
      {selecao.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#42658A]/30 bg-[#EFF4FA] px-4 py-3">
          <span className="text-sm font-semibold text-[#2F4D6B]">{plural(selecao.size, "vaga selecionada", "vagas selecionadas")}</span>
          {!todasFiltradasSelecionadas && total > idsPagina.length && (
            <button type="button" onClick={() => setSelecao(new Set(filtradas.map((l) => l.id)))} className="text-[13px] font-medium text-[#42658A] hover:underline">
              Selecionar todas as {total} vagas filtradas
            </button>
          )}
          <span className="flex flex-wrap gap-2 sm:ml-auto">
            <button type="button" onClick={() => setLote(true)} className="rounded-xl bg-[#27675B] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#20564C]">
              Tornar visíveis
            </button>
            <button type="button" onClick={() => setLote(false)} className="rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2 text-sm font-medium text-[#202B28] hover:border-[#5D6C70]/50">
              Ocultar do site
            </button>
            <button type="button" onClick={() => setSelecao(new Set())} className="rounded-xl px-3 py-2 text-sm font-medium text-[#626E69] hover:text-[#202B28]">
              Limpar seleção
            </button>
          </span>
        </div>
      )}

      {total === 0 ? (
        <div className={`rounded-2xl border border-[#DEE6E2] bg-white p-8 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#202B28]">Nenhuma vaga encontrada</p>
          <button type="button" onClick={limparTudo} className="mt-2 text-sm font-medium text-[#42658A] hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className={`overflow-clip rounded-2xl border border-[#DEE6E2] bg-white ${SOMBRA}`}>
          {/* Desktop: tabela */}
          <table className="hidden w-full border-collapse text-left lg:table">
            <thead>
              <tr className="text-[13px] font-medium text-[#626E69]">
                {["", "Vaga", "Localização", "Candidaturas", "Publicação", "Visibilidade", "Ações"].map((h, i) => (
                  <th key={i} scope="col" className={`sticky top-[97px] z-10 border-b border-[#DEE6E2] bg-[#F8FAF9] px-4 py-3 font-medium ${i === 0 ? "w-12" : ""}`}>
                    {i === 0 ? (
                      <input
                        ref={cabecalhoRef}
                        type="checkbox"
                        checked={paginaToda}
                        onChange={selecionarPagina}
                        aria-label="Selecionar as vagas desta página"
                        className="h-4 w-4 accent-[#42658A]"
                      />
                    ) : (
                      h
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daPagina.map((l) => {
                const ativa = ativas.has(l.id);
                return [
                  <tr key={l.id} className={`align-top transition hover:bg-[#F8FAF9] ${selecao.has(l.id) ? "bg-[#EFF4FA]/60" : ""} ${erroLinha[l.id] ? "" : "border-b border-[#EEF2F0]"}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selecao.has(l.id)} onChange={() => alternarSelecao(l.id)} aria-label={`Selecionar vaga ${l.codigo}`} className="h-4 w-4 accent-[#42658A]" />
                    </td>
                    <td className="max-w-[340px] px-4 py-3.5">
                      <button type="button" onClick={() => atualizar({ detalhe: l.id }, true)} className="crm-livre block text-left" aria-label={`Ver detalhes da vaga ${l.codigo}`}>
                        <span className="block text-sm font-semibold text-[#202B28] hover:text-[#42658A]">{l.empresa}</span>
                        <span className="line-clamp-2 text-sm text-[#626E69]" title={l.titulo}>
                          {l.titulo}
                        </span>
                      </button>
                      <span className="mt-1 inline-block rounded-md bg-[#F3F5F5] px-1.5 py-0.5 font-mono text-[12px] font-medium text-[#5D6C70]">{l.codigo}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className="block text-[#202B28]">{l.cidade}</span>
                      {l.provincia !== l.cidade && <span className="block text-[13px] text-[#626E69]">{l.provincia}</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <Candidaturas l={l} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm tabular-nums text-[#202B28]">{l.publicadaBR}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <SwitchVisibilidade l={l} ativa={ativa} salvando={salvando.has(l.id)} onAlternar={() => alternar(l)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="flex flex-col items-start gap-1">
                        <VerPagina l={l} />
                        <button type="button" onClick={() => atualizar({ detalhe: l.id }, true)} className="text-[13px] text-[#626E69] hover:text-[#202B28] hover:underline">
                          Detalhes
                        </button>
                      </span>
                    </td>
                  </tr>,
                  erroLinha[l.id] && (
                    <tr key={`${l.id}-erro`} className="border-b border-[#EEF2F0]">
                      <td />
                      <td colSpan={6} className="px-4 pb-3">
                        <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
                          {erroLinha[l.id]}
                        </p>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>

          {/* Celular / tablet: cards */}
          <ul className="divide-y divide-[#EEF2F0] lg:hidden">
            <li className="flex items-center gap-2.5 bg-[#F8FAF9] px-4 py-2.5 text-[13px] text-[#626E69]">
              <input
                type="checkbox"
                checked={paginaToda}
                onChange={selecionarPagina}
                id="sel-pagina-m"
                className="h-4 w-4 accent-[#42658A]"
              />
              <label htmlFor="sel-pagina-m">Selecionar esta página</label>
            </li>
            {daPagina.map((l) => (
              <li key={l.id} className={`px-4 py-4 ${selecao.has(l.id) ? "bg-[#EFF4FA]/60" : ""}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selecao.has(l.id)} onChange={() => alternarSelecao(l.id)} aria-label={`Selecionar vaga ${l.codigo}`} className="mt-1 h-4 w-4 shrink-0 accent-[#42658A]" />
                  <button type="button" onClick={() => atualizar({ detalhe: l.id }, true)} className="crm-livre min-w-0 flex-1 text-left">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#202B28]">{l.empresa}</span>
                      <span className="rounded-md bg-[#F3F5F5] px-1.5 py-0.5 font-mono text-[12px] text-[#5D6C70]">{l.codigo}</span>
                    </span>
                    <span className="line-clamp-2 text-sm text-[#626E69]">{l.titulo}</span>
                    <span className="mt-0.5 block text-[13px] text-[#626E69]">
                      {local(l)} · publicada em {l.publicadaBR}
                    </span>
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-[#EEF2F0] bg-[#F8FAF9] px-3 py-2.5">
                  <SwitchVisibilidade l={l} ativa={ativas.has(l.id)} salvando={salvando.has(l.id)} onAlternar={() => alternar(l)} />
                  <span className="flex items-center gap-4">
                    <Candidaturas l={l} />
                    <VerPagina l={l} compacto />
                  </span>
                </div>
                {erroLinha[l.id] && (
                  <p role="alert" className="mt-2 rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
                    {erroLinha[l.id]}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DEE6E2] bg-white px-4 py-3 text-sm text-[#626E69]">
            <span className="tabular-nums">
              Exibindo {(pagina - 1) * pp + 1}–{Math.min(pagina * pp, total)} de {plural(total, "vaga", "vagas")}
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                Por página
                <select value={pp} onChange={(e) => atualizar({ pp: e.target.value === "25" ? null : e.target.value })} className="rounded-lg border border-[#DEE6E2] bg-white px-2 py-1 text-sm text-[#202B28]">
                  {POR_PAGINA.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <span className="flex items-center gap-1">
                <button type="button" disabled={pagina <= 1} onClick={() => atualizar({ pag: pagina - 1 > 1 ? String(pagina - 1) : null }, true)} className="rounded-lg border border-[#DEE6E2] px-3 py-1 text-[#202B28] disabled:opacity-40">
                  Anterior
                </button>
                <span className="px-2 tabular-nums">
                  {pagina} de {paginas}
                </span>
                <button type="button" disabled={pagina >= paginas} onClick={() => atualizar({ pag: String(pagina + 1) }, true)} className="rounded-lg border border-[#DEE6E2] px-3 py-1 text-[#202B28] disabled:opacity-40">
                  Próxima
                </button>
              </span>
            </span>
          </div>
        </div>
      )}

      {lote !== null && (
        <PainelLote
          ids={[...selecao]}
          linhas={linhas}
          ativas={ativas}
          tornarVisiveis={lote}
          onFechar={() => setLote(null)}
          onConcluido={(ids, texto) => {
            setAtivas((a) => {
              const n = new Set(a);
              for (const id of ids) {
                if (lote) n.add(id);
                else n.delete(id);
              }
              return n;
            });
            setSelecao(new Set());
            setAviso({ ok: true, texto });
          }}
        />
      )}
      {detalhe && <PainelDetalhe l={detalhe} ativa={ativas.has(detalhe.id)} onFechar={fecharDetalhe} />}
    </div>
  );
}

function PainelLote({
  ids,
  linhas,
  ativas,
  tornarVisiveis,
  onFechar,
  onConcluido,
}: {
  ids: string[];
  linhas: LinhaVaga[];
  ativas: Set<string>;
  tornarVisiveis: boolean;
  onFechar: () => void;
  onConcluido: (ids: string[], texto: string) => void;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const mudam = ids.filter((id) => ativas.has(id) !== tornarVisiveis);
  const jaEstao = ids.length - mudam.length;
  const nomes = linhas.filter((l) => mudam.includes(l.id));
  return (
    <Painel
      titulo={tornarVisiveis ? "Tornar vagas visíveis" : "Ocultar vagas do site"}
      subtitulo={`${plural(ids.length, "vaga selecionada", "vagas selecionadas")}`}
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
            disabled={pendente || mudam.length === 0}
            onClick={() =>
              iniciar(async () => {
                let r: Awaited<ReturnType<typeof definirVagasAtivas>>;
                try {
                  r = await definirVagasAtivas(mudam, tornarVisiveis);
                } catch {
                  r = { ok: false, erro: "Sem conexão com o servidor." };
                }
                if (r.ok) {
                  onConcluido(mudam, `${plural(r.alteradas, tornarVisiveis ? "vaga ficou visível" : "vaga foi ocultada", tornarVisiveis ? "vagas ficaram visíveis" : "vagas foram ocultadas")} no site.${r.ignoradas ? ` ${r.ignoradas} não ${r.ignoradas === 1 ? "foi reconhecida" : "foram reconhecidas"} no catálogo e não mudou.` : ""}`);
                  onFechar();
                } else setErro(`${r.erro} Nenhuma vaga foi alterada.`);
              })
            }
          >
            {pendente && <Spinner />}
            {tornarVisiveis ? `Tornar ${plural(mudam.length, "vaga visível", "vagas visíveis")}` : `Ocultar ${plural(mudam.length, "vaga", "vagas")}`}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-[#202B28]">
        {mudam.length === 0 ? (
          <p>Todas as vagas selecionadas já estão {tornarVisiveis ? "visíveis" : "ocultas"}. Nada a alterar.</p>
        ) : (
          <p>
            {tornarVisiveis ? "Vão aparecer no site" : "Vão sair do site"} exatamente <strong>{plural(mudam.length, "vaga", "vagas")}</strong>:
          </p>
        )}
        {nomes.length > 0 && (
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#DEE6E2] p-3">
            {nomes.map((l) => (
              <li key={l.id} className="flex gap-2">
                <span className="w-16 shrink-0 font-mono text-[12px] text-[#5D6C70]">{l.codigo}</span>
                <span className="min-w-0 truncate">
                  {l.empresa} — {l.titulo}
                </span>
              </li>
            ))}
          </ul>
        )}
        {jaEstao > 0 && <p className="text-[13px] text-[#626E69]">{plural(jaEstao, "vaga selecionada já está", "vagas selecionadas já estão")} {tornarVisiveis ? "visível" : "oculta"}{jaEstao > 1 ? "s" : ""} e não muda.</p>}
        {!tornarVisiveis && mudam.length > 0 && <p className="text-[13px] text-[#626E69]">As candidaturas já recebidas são mantidas. O link direto da vaga passa a mostrá-la como encerrada.</p>}
        {erro && (
          <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
            {erro}
          </p>
        )}
      </div>
    </Painel>
  );
}

function PainelDetalhe({ l, ativa, onFechar }: { l: LinhaVaga; ativa: boolean; onFechar: () => void }) {
  const itens: [string, React.ReactNode][] = [
    ["Código", <span key="c" className="font-mono">{l.codigo}</span>],
    ["Empresa", l.empresa],
    ["Função", l.titulo],
    ["Cidade", l.cidade],
    ["Província", l.provincia],
    ["Publicação", l.publicadaBR],
    ["Visibilidade", <span key="v" className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${ativa ? "bg-[#EEF6F3] text-[#27675B]" : "bg-[#F3F5F5] text-[#5D6C70]"}`}>{ativa ? "Visível no site" : "Oculta do site"}</span>],
    ["Candidaturas", <Candidaturas key="n" l={l} />],
  ];
  return (
    <Painel titulo={l.empresa} subtitulo={`Vaga ${l.codigo}`} onFechar={onFechar} largura="max-w-md" rodape={<VerPagina l={l} />}>
      <dl className="divide-y divide-[#EEF2F0]">
        {itens.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-[#626E69]">{k}</dt>
            <dd className="text-[#202B28]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13px] text-[#626E69]">Os dados vêm do catálogo do site e não são editados no CRM. A visibilidade muda pelo switch na lista.</p>
    </Painel>
  );
}
