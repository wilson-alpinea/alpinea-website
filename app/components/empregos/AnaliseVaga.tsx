"use client";

// Análise da vaga — v2 (Wilson, 08/out/2026: "precisamos melhorar essa
// parte de analytics, está básico demais"). Mostrada na página própria de
// cada vaga. Cálculos em app/lib/analiseVagas.ts; tudo vem do catálogo.
//
// Blocos: (1) três números-chave, (2) distribuição de salários do catálogo
// com esta vaga destacada, (3) transparência da ficha (o que ela informa),
// (4) vagas do mesmo setor com salário parecido.
// Cores: uma só cor de destaque (azul da marca) para "esta vaga"; o resto
// do catálogo em cinza — não há séries categóricas a distinguir.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { display } from "../../produtos/page";
import { inter } from "../transporte/compartilhado";
import { VAGAS, type SetorKey, type Vaga } from "../../lib/vagasCatalogo";
import { HORAS_MES_REFERENCIA, MEDIA_NOTA_FICHA, PONTOS_SALARIO, analisarVaga, itensFicha, notaFicha, salarioBaseHora, type PontoSalario } from "../../lib/analiseVagas";
import { COTACAO_FALLBACK_BRL_POR_JPY_COMPRA, COTACAO_FALLBACK_BRL_POR_JPY_VENDA } from "../../lib/cambioIene";
import { formatBRL, formatJPY } from "../../lib/currency";

const SETOR: Record<SetorKey, string> = {
  automotivo: "automobilístico",
  eletronicos: "componentes eletrônicos",
  alimenticio: "alimentício",
  materiais: "materiais industriais",
};

const AZUL = "#1f6fb8";
const NAVY = "#0A2540";
const yen = (n: number) => `¥${Math.round(n).toLocaleString("pt-BR")}`;

function useCotacao() {
  const [valor, setValor] = useState((COTACAO_FALLBACK_BRL_POR_JPY_COMPRA + COTACAO_FALLBACK_BRL_POR_JPY_VENDA) / 2);
  useEffect(() => {
    let vivo = true;
    Promise.all(
      (["compra", "venda"] as const).map((d) =>
        fetch(`/api/cambio-iene?direcao=${d}`)
          .then((r) => r.json())
          .catch(() => null),
      ),
    ).then(([c, v]) => {
      const a = Number(c?.cotacaoBRLPorJPY);
      const b = Number(v?.cotacaoBRLPorJPY);
      if (vivo && a > 0 && b > 0) setValor((a + b) / 2);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return valor;
}

function useLargura<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// Ícone da análise — lupa com gráfico de barras e "+", redesenhado em SVG a
// partir da arte enviada pelo Wilson em 08/out/2026 (traço na cor do texto,
// nítido em qualquer tamanho).
function IconeAnalise({ className }: { className?: string }) {
  return (
    <svg viewBox="7 6 35 35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="22.6" cy="20.9" r="13.1" strokeWidth="1.75" />
      <path d="M32.4 31.2 L39 37.8" strokeWidth="3.4" />
      <rect x="14.55" y="22.35" width="3.6" height="4.6" rx="1" strokeWidth="1.75" />
      <rect x="20.35" y="19.15" width="3.6" height="7.8" rx="1" strokeWidth="1.75" />
      <rect x="26.45" y="15.15" width="3.8" height="11.8" rx="1" strokeWidth="1.75" />
      <path d="M17.7 12.7v6.2M14.6 15.8h6.2" strokeWidth="1.75" />
    </svg>
  );
}

// ── Número-chave ──
function Tile({ rotulo, valor, detalhe, sinal }: { rotulo: string; valor: string; detalhe?: string; sinal?: "acima" | "abaixo" | null }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">{rotulo}</p>
      <p className={`${inter.className} mt-1.5 text-2xl font-semibold tabular-nums tracking-[-0.01em]`} style={{ color: NAVY }}>
        {valor}
      </p>
      {detalhe && (
        <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-black/60">
          {sinal && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-black/50" aria-hidden="true">
              {sinal === "acima" ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
            </svg>
          )}
          <span>{detalhe}</span>
        </p>
      )}
    </div>
  );
}

// ── Distribuição de salários (dot plot) ──
function Distribuicao({ vaga, base, setorMediana }: { vaga: Vaga; base: number; setorMediana: number | null }) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [foco, setFoco] = useState<PontoSalario | null>(null);
  const margem = { esq: 16, dir: 16 };
  const raio = 5;
  const passoY = 12;

  const { min, max, ticks } = useMemo(() => {
    const vals = PONTOS_SALARIO.map((p) => p.base);
    const lo = Math.floor(Math.min(...vals) / 100) * 100;
    const hi = Math.ceil(Math.max(...vals) / 100) * 100;
    const passo = hi - lo > 800 ? 200 : 100;
    const t: number[] = [];
    for (let v = lo; v <= hi; v += passo) t.push(v);
    return { min: lo, max: hi, ticks: t };
  }, []);

  const x = (v: number) => margem.esq + ((v - min) / (max - min || 1)) * (largura - margem.esq - margem.dir);

  // Empilha pontos com o mesmo valor (beeswarm simples, por faixas de ¥25).
  const pontos = useMemo(() => {
    const pilhas = new Map<number, number>();
    return [...PONTOS_SALARIO]
      .sort((a, b) => (a.id === vaga.id ? 1 : b.id === vaga.id ? -1 : a.base - b.base))
      .map((p) => {
        const chave = Math.round(p.base / 25);
        const n = pilhas.get(chave) ?? 0;
        pilhas.set(chave, n + 1);
        return { ...p, nivel: n };
      });
  }, [vaga.id]);
  const niveis = Math.max(1, ...pontos.map((p) => p.nivel + 1));
  const topo = 30;
  const baseY = topo + niveis * passoY + 6;
  const altura = baseY + 26;

  return (
    <div ref={ref} className="relative">
      <svg width={largura} height={altura} role="img" aria-label={`Distribuição do salário-base das ${PONTOS_SALARIO.length} vagas do catálogo; esta vaga paga ${yen(base)} por hora.`}>
        {/* grade e eixo */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={topo - 6} y2={baseY} stroke="#000" strokeOpacity={0.06} />
            <text x={x(t)} y={baseY + 16} textAnchor="middle" fontSize={11} fill="rgba(0,0,0,0.45)" className="tabular-nums">
              {yen(t)}
            </text>
          </g>
        ))}
        <line x1={margem.esq} x2={largura - margem.dir} y1={baseY} y2={baseY} stroke="#000" strokeOpacity={0.15} />

        {/* mediana do setor */}
        {setorMediana !== null && (
          <g>
            <line x1={x(setorMediana)} x2={x(setorMediana)} y1={topo - 10} y2={baseY} stroke={NAVY} strokeOpacity={0.45} strokeDasharray="3 3" />
            <text
              x={x(setorMediana)}
              y={topo - 14}
              textAnchor={x(setorMediana) > largura - 110 ? "end" : x(setorMediana) < 110 ? "start" : "middle"}
              fontSize={10.5}
              fill="rgba(0,0,0,0.55)"
            >
              Mediana do setor {yen(setorMediana)}
            </text>
          </g>
        )}

        {/* pontos */}
        {pontos.map((p) => {
          const esta = p.id === vaga.id;
          const mesmoSetor = p.setor === vaga.setor;
          const cx = x(p.base);
          const cy = baseY - 8 - p.nivel * passoY;
          return (
            <g key={p.id} onMouseEnter={() => setFoco(p)} onMouseLeave={() => setFoco(null)} onFocus={() => setFoco(p)} onBlur={() => setFoco(null)} tabIndex={0} aria-label={`${p.empresa}, ${p.cidade}: ${yen(p.base)} por hora`}>
              <circle cx={cx} cy={cy} r={11} fill="transparent" />
              <circle
                cx={cx}
                cy={cy}
                r={esta ? raio + 2 : raio}
                fill={esta ? AZUL : mesmoSetor ? "#8a94a3" : "#d3d8df"}
                stroke="#fff"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>

      {/* rótulo fixo de "esta vaga" */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ left: Math.min(Math.max(x(base), 60), largura - 60), top: 0, background: AZUL }}
      >
        Esta vaga · {yen(base)}/h
      </div>

      {/* tooltip */}
      {foco && foco.id !== vaga.id && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[#0A2540] px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: Math.min(Math.max(x(foco.base), 90), largura - 90), top: baseY - 18 - (pontos.find((p) => p.id === foco.id)?.nivel ?? 0) * passoY }}
        >
          <p className="font-semibold">
            {foco.empresa} · {foco.cidade}
          </p>
          <p className="text-white/75">
            {yen(foco.base)}/h · {SETOR[foco.setor]} · {foco.codigo}
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black/55">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: AZUL }} /> Esta vaga
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8a94a3]" /> Mesmo setor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d3d8df]" /> Outros setores
        </span>
      </div>
    </div>
  );
}

// ── Painel de comparação com vagas similares ──
// Wilson, 08/out/2026: "ao clicar nas vagas do mesmo setor, deve abrir um
// novo painel ao lado do painel análise da vaga com cor de fundo diferente
// comparando as vagas similares". No desktop (lg+) o bloco se alarga e o
// painel fica à direita; no celular ele entra logo abaixo da análise.
// Só dados do catálogo — campo vazio aparece como "A confirmar".
const A_CONFIRMAR = "A confirmar";

type LinhaComparacao = { rotulo: string; esta: string; outra: string; destaque?: "esta" | "outra" | null; numerica?: boolean };

function linhasComparacao(esta: Vaga, outra: Vaga): LinhaComparacao[] {
  const bEsta = salarioBaseHora(esta.salario);
  const bOutra = salarioBaseHora(outra.salario);
  const maior = (a: number | null, b: number | null) => (a === null || b === null || a === b ? null : a > b ? "esta" : "outra");
  const nEsta = notaFicha(esta);
  const nOutra = notaFicha(outra);
  const total = itensFicha(esta).length;
  return [
    { rotulo: "Local", esta: `${esta.cidade}, ${esta.regiao}`, outra: `${outra.cidade}, ${outra.regiao}` },
    { rotulo: "Salário-base", esta: bEsta !== null ? `${yen(bEsta)}/h` : "—", outra: bOutra !== null ? `${yen(bOutra)}/h` : "—", destaque: maior(bEsta, bOutra), numerica: true },
    {
      rotulo: "Bruto mensal de referência",
      esta: bEsta !== null ? formatJPY(bEsta * HORAS_MES_REFERENCIA) : "—",
      outra: bOutra !== null ? formatJPY(bOutra * HORAS_MES_REFERENCIA) : "—",
      destaque: maior(bEsta, bOutra),
      numerica: true,
    },
    { rotulo: "Turno e escala", esta: esta.turno, outra: outra.turno },
    { rotulo: "Contrato", esta: esta.contrato, outra: outra.contrato },
    { rotulo: "Moradia", esta: esta.info.moradia ?? A_CONFIRMAR, outra: outra.info.moradia ?? A_CONFIRMAR },
    { rotulo: "Bônus", esta: esta.info.bonus ?? A_CONFIRMAR, outra: outra.info.bonus ?? A_CONFIRMAR },
    {
      rotulo: "Benefícios listados",
      esta: esta.info.beneficios.length ? String(esta.info.beneficios.length) : A_CONFIRMAR,
      outra: outra.info.beneficios.length ? String(outra.info.beneficios.length) : A_CONFIRMAR,
      destaque: maior(esta.info.beneficios.length || null, outra.info.beneficios.length || null),
      numerica: true,
    },
    { rotulo: "Japonês", esta: esta.idioma ?? A_CONFIRMAR, outra: outra.idioma ?? A_CONFIRMAR },
    { rotulo: "O que a ficha informa", esta: `${nEsta}/${total}`, outra: `${nOutra}/${total}`, destaque: maior(nEsta, nOutra), numerica: true },
    { rotulo: "Status", esta: esta.status === "aberta" ? "Aberta" : "Sob consulta", outra: outra.status === "aberta" ? "Aberta" : "Sob consulta" },
  ];
}

function PainelComparacao({
  vaga,
  similares,
  selecionada,
  onSelecionar,
  onFechar,
}: {
  vaga: Vaga;
  similares: (PontoSalario & { dif: number })[];
  selecionada: Vaga;
  onSelecionar: (id: string) => void;
  onFechar: () => void;
}) {
  const linhas = linhasComparacao(vaga, selecionada);
  return (
    <aside
      aria-labelledby="t-comparacao"
      className="rounded-2xl p-5 text-white md:p-6 lg:sticky lg:top-20 lg:w-[400px] lg:shrink-0 xl:w-[430px]"
      style={{ background: NAVY }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8cc1f0]">Comparação</p>
          <h3 id="t-comparacao" className={`${display.className} mt-1 text-xl font-medium`}>
            Vagas similares
          </h3>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar comparação"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* troca entre as similares */}
      <div role="tablist" aria-label="Vaga comparada" className="mt-4 flex flex-wrap gap-1.5">
        {similares.map((s) => {
          const ativa = s.id === selecionada.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => onSelecionar(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${ativa ? "bg-white text-[#0A2540]" : "text-white/75 ring-1 ring-white/20 hover:bg-white/10"}`}
            >
              {s.empresa} · {s.cidade}
            </button>
          );
        })}
      </div>

      {/* cabeçalho das colunas */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-b border-white/15 pb-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8cc1f0]">
            <span className="h-2 w-2 rounded-full" style={{ background: "#4c9be0" }} /> Esta vaga
          </p>
          <p className="mt-1 truncate text-sm font-semibold">{vaga.empresa}</p>
          <p className="text-[11px] text-white/55">{vaga.codigo}</p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
            <span className="h-2 w-2 rounded-full bg-[#8a94a3]" /> Similar
          </p>
          <p className="mt-1 truncate text-sm font-semibold">{selecionada.empresa}</p>
          <p className="text-[11px] text-white/55">{selecionada.codigo}</p>
        </div>
      </div>

      <dl className="divide-y divide-white/10">
        {linhas.map((l) => (
          <div key={l.rotulo} className="py-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{l.rotulo}</dt>
            <dd className="mt-1 grid grid-cols-2 gap-3">
              {(["esta", "outra"] as const).map((lado) => {
                const texto = lado === "esta" ? l.esta : l.outra;
                const vence = l.destaque === lado;
                const vazio = texto === A_CONFIRMAR || texto === "—";
                return (
                  <span
                    key={lado}
                    className={`${l.numerica ? `${inter.className} tabular-nums text-sm` : "text-xs leading-5"} line-clamp-3 ${vazio ? "italic text-white/40" : vence ? "font-semibold text-white" : "text-white/80"}`}
                    title={texto}
                  >
                    {texto}
                    {vence && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#8cc1f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline h-3 w-3 align-[-1px]" aria-label="maior">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/empregos/vagas/${selecionada.id}`}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#0A2540] transition hover:bg-white/90"
      >
        Ver vaga {selecionada.codigo}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
      <p className="mt-3 text-[11px] leading-5 text-white/45">Salários sem horas extras, adicional noturno ou bônus. Seta indica o maior valor entre as duas.</p>
    </aside>
  );
}

// ── Componente ──
export default function AnaliseVaga({ vaga }: { vaga: Vaga }) {
  const a = useMemo(() => analisarVaga(vaga), [vaga]);
  const cotacao = useCotacao();
  const itens = itensFicha(vaga);
  const [verTabela, setVerTabela] = useState(false);
  // Guarda de qual vaga a comparação foi aberta: ao navegar para outra
  // página de vaga, a seleção antiga simplesmente deixa de valer.
  const [selecao, setSelecao] = useState<{ origem: string; id: string } | null>(null);
  const comparada = selecao && selecao.origem === vaga.id ? selecao.id : null;
  const setComparada = (v: string | null | ((atual: string | null) => string | null)) => {
    const id = typeof v === "function" ? v(comparada) : v;
    setSelecao(id ? { origem: vaga.id, id } : null);
  };
  const vagaComparada = comparada ? (VAGAS.find((v) => v.id === comparada) ?? null) : null;
  const painelRef = useRef<HTMLDivElement | null>(null);

  // No celular o painel abre abaixo da análise — rola até ele.
  useEffect(() => {
    if (!vagaComparada || typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    painelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [vagaComparada]);

  const posicaoPct = a.base !== null && a.catalogoQtd > 1 ? Math.round((a.acimaDe / (a.catalogoQtd - 1)) * 100) : null;

  return (
    <div className={vagaComparada ? "relative lg:left-1/2 lg:w-[min(1200px,calc(100vw-4rem))] lg:-translate-x-1/2" : undefined}>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
    <section aria-labelledby="t-analise" className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#f7f9fc] p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-black/10" style={{ color: NAVY }}>
            <IconeAnalise className="h-8 w-8" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: AZUL }}>
              Análise da vaga
            </p>
            <h2 id="t-analise" className={`${display.className} mt-1 text-2xl font-medium`} style={{ color: NAVY }}>
              Como esta vaga se compara
            </h2>
          </div>
        </div>
        <p className="text-xs text-black/50">Comparada com {a.catalogoQtd} vagas do catálogo Ajisai</p>
      </div>

      {/* 1. Números-chave */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Tile
          rotulo="Salário-base"
          valor={a.base !== null ? `${yen(a.base)}/h` : "—"}
          sinal={a.difSetorPct === null || a.difSetorPct === 0 ? null : a.difSetorPct > 0 ? "acima" : "abaixo"}
          detalhe={
            a.difSetorPct === null
              ? "Poucas vagas do setor para comparar."
              : a.difSetorPct === 0
                ? `Na mediana do setor ${SETOR[vaga.setor]}.`
                : `${Math.abs(a.difSetorPct)}% ${a.difSetorPct > 0 ? "acima" : "abaixo"} da mediana do setor ${SETOR[vaga.setor]} (${a.setorQtd} vagas).`
          }
        />
        <Tile
          rotulo="Bruto mensal de referência"
          valor={a.brutoMensalJPY !== null ? formatJPY(a.brutoMensalJPY) : "—"}
          detalhe={
            a.brutoMensalJPY !== null
              ? `≈ ${formatBRL(a.brutoMensalJPY * cotacao)} · ${HORAS_MES_REFERENCIA} h normais, sem extras, adicional noturno ou bônus.`
              : undefined
          }
        />
        <Tile
          rotulo="Posição no catálogo"
          valor={posicaoPct !== null ? `${posicaoPct}%` : "—"}
          detalhe={posicaoPct !== null ? `Paga mais que ${a.acimaDe} de ${a.catalogoQtd - 1} outras vagas do catálogo.` : undefined}
        />
      </div>

      {/* 2. Distribuição */}
      {a.base !== null && (
        <div className="mt-5 rounded-xl border border-black/10 bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: NAVY }}>
              Salário-base por hora no catálogo
            </p>
            <button
              type="button"
              onClick={() => setVerTabela((v) => !v)}
              className="text-xs font-medium underline underline-offset-2"
              style={{ color: AZUL }}
            >
              {verTabela ? "Ver gráfico" : "Ver como tabela"}
            </button>
          </div>
          {verTabela ? (
            <div className="mt-3 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-[0.12em] text-black/45">
                  <tr>
                    <th className="py-2 font-semibold">Vaga</th>
                    <th className="py-2 font-semibold">Setor</th>
                    <th className="py-2 text-right font-semibold">¥/hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {[...PONTOS_SALARIO]
                    .sort((x, y) => y.base - x.base)
                    .map((p) => (
                      <tr key={p.id} className={p.id === vaga.id ? "font-semibold" : ""} style={p.id === vaga.id ? { color: AZUL } : undefined}>
                        <td className="py-1.5 pr-2">
                          {p.empresa} · {p.cidade}
                          {p.id === vaga.id && " (esta vaga)"}
                        </td>
                        <td className="py-1.5 pr-2 text-black/55">{SETOR[p.setor]}</td>
                        <td className={`${inter.className} py-1.5 text-right tabular-nums`}>{yen(p.base)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3">
              <Distribuicao vaga={vaga} base={a.base} setorMediana={a.setorMediana} />
            </div>
          )}
          <p className="mt-3 text-[11px] leading-5 text-black/45">
            Valor-base de cada vaga, sem horas extras, adicional noturno ou bônus. Faixas salariais entram pelo ponto médio.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {/* 3. Transparência da ficha */}
        <div className="rounded-xl border border-black/10 bg-white p-4 md:p-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: NAVY }}>
              O que a ficha informa
            </p>
            <p className={`${inter.className} text-sm font-semibold tabular-nums`} style={{ color: NAVY }}>
              {a.nota}/{itens.length}
            </p>
          </div>
          <div className="mt-3 flex gap-[2px]" aria-hidden="true">
            {itens.map((i) => (
              <span key={i.rotulo} className="h-2 flex-1 first:rounded-l-full last:rounded-r-full" style={{ background: i.ok ? AZUL : "#e3e7ec" }} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-black/50">Média do catálogo: {MEDIA_NOTA_FICHA.toFixed(1).replace(".", ",")}/{itens.length}</p>
          <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
            {itens.map((i) => (
              <li key={i.rotulo} className={`flex items-center gap-1.5 ${i.ok ? "text-black/75" : "text-black/40"}`}>
                {i.ok ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-label="Informado">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5 shrink-0" aria-label="A confirmar">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                )}
                {i.rotulo}
              </li>
            ))}
          </ul>
          {a.nota < itens.length && <p className="mt-3 text-[11px] leading-5 text-black/50">Itens em aberto são confirmados pela nossa equipe durante o processo.</p>}
        </div>

        {/* 4. Vagas parecidas */}
        <div className="rounded-xl border border-black/10 bg-white p-4 md:p-5">
          <p className="text-sm font-medium" style={{ color: NAVY }}>
            Vagas do mesmo setor com salário próximo
          </p>
          {a.similares.length === 0 ? (
            <p className="mt-3 text-xs text-black/50">Não há outras vagas comparáveis no setor.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/[0.07]">
              {a.similares.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setComparada((atual) => (atual === s.id ? null : s.id))}
                    aria-pressed={comparada === s.id}
                    className={`-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition ${comparada === s.id ? "bg-[#0A2540]/[0.06] ring-1 ring-[#1f6fb8]/40" : "hover:bg-black/[0.03]"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-black">{s.empresa}</span>
                      <span className="block text-[11px] text-black/50">
                        {s.cidade}, {s.regiao} · {s.codigo}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`${inter.className} block text-sm font-semibold tabular-nums`} style={{ color: NAVY }}>
                        {yen(s.base)}/h
                      </span>
                      <span className="block text-[11px] tabular-nums text-black/50">
                        {s.dif === 0 ? "mesmo valor" : `${s.dif > 0 ? "+" : "−"}${yen(Math.abs(s.dif))}/h`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {a.similares.length > 0 && (
            <p className="mt-2 text-[11px] text-black/45">{vagaComparada ? "Clique de novo para fechar a comparação." : "Clique numa vaga para comparar lado a lado."}</p>
          )}
        </div>
      </div>
    </section>

    {vagaComparada && (
      <div ref={painelRef} className="scroll-mt-20 lg:contents">
        <PainelComparacao
          vaga={vaga}
          similares={a.similares}
          selecionada={vagaComparada}
          onSelecionar={setComparada}
          onFechar={() => setComparada(null)}
        />
      </div>
    )}
    </div>
    </div>
  );
}
