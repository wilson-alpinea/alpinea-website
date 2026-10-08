"use client";

// Testes de aptidão — interface do candidato (ver app/lib/testesAptidao.ts).
// Um teste por vez: instruções → teste com cronômetro → próximo. A correção
// é toda do servidor (/api/empregos-testes); aqui só mostramos as questões.

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import {
  COMPARACAO,
  FRACIONADOS,
  HANAMARU_ALVOS,
  HANAMARU_BLOCOS,
  HANAMARU_COLUNAS,
  HANAMARU_GRADE,
  HANAMARU_LINHAS,
  INFO_TESTES,
  LARGURA_CARTAO_MM,
  MATEMATICA,
  NIHONGO_CONTAS,
  NIHONGO_PERGUNTAS,
  ORDEM_TESTES,
  TENTATIVAS_VISAO,
  VISAO_ALTURAS_MM,
  VISAO_CARACTERES,
  VISAO_LINHA_MINIMA,
  textoConta,
  type ChaveTeste,
  type EstadoPublicoTestes,
} from "../../../lib/testesAptidao";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });
const AZUL = "#2f80c9";
const NAVY = "#0A2540";

type Props = {
  candidaturaId: string;
  token: string;
  nome: string;
  vagaTitulo: string;
  vagaEmpresa: string;
  fichaUrl: string;
  estadoInicial: EstadoPublicoTestes;
};

type Fase = "lista" | "instrucoes" | "teste";

const botaoPrimario =
  "flex h-12 w-full items-center justify-center rounded-xl bg-[#2f80c9] px-6 text-sm font-semibold text-white transition hover:bg-[#3b91dc] disabled:opacity-50 sm:w-auto";
const botaoSecundario =
  "flex h-12 items-center justify-center rounded-xl border border-black/15 px-5 text-sm font-semibold text-[#0A2540] transition hover:border-black/35";

// ── Cronômetro ──────────────────────────────────────────────────────────
function Cronometro({ prazo, onFim }: { prazo: number; onFim: () => void }) {
  const [agora, setAgora] = useState(() => Date.now());
  const disparou = useRef(false);
  useEffect(() => {
    const t = window.setInterval(() => setAgora(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);
  const resta = Math.max(0, Math.ceil((prazo - agora) / 1000));
  useEffect(() => {
    if (resta === 0 && !disparou.current) {
      disparou.current = true;
      onFim();
    }
  }, [resta, onFim]);
  const mm = String(Math.floor(resta / 60)).padStart(1, "0");
  const ss = String(resta % 60).padStart(2, "0");
  return (
    <span
      className={`rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${resta <= 15 ? "bg-red-50 text-red-600" : "bg-[#0A2540]/[0.06] text-[#0A2540]"}`}
      aria-live="polite"
    >
      {mm}:{ss}
    </span>
  );
}

function CabecalhoTeste({ chave, prazo, onFim, extra }: { chave: ChaveTeste; prazo: number | null; onFim: () => void; extra?: string }) {
  const info = INFO_TESTES[chave];
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: AZUL }}>
          {info.jp} · {info.titulo}
        </p>
        {extra && <p className="mt-0.5 text-xs text-black/50">{extra}</p>}
      </div>
      {prazo !== null && <Cronometro prazo={prazo} onFim={onFim} />}
    </div>
  );
}

// ── 1. Visão ────────────────────────────────────────────────────────────
function sortear(fonte: string, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    let c = fonte[Math.floor(Math.random() * fonte.length)];
    while (s.includes(c)) c = fonte[Math.floor(Math.random() * fonte.length)];
    s += c;
  }
  return s;
}

function LeituraOlho({ olho, pxPorMm, onFim }: { olho: "esquerdo" | "direito"; pxPorMm: number; onFim: (linha: number) => void }) {
  const fonte = VISAO_CARACTERES[olho];
  const [linha, setLinha] = useState(1);
  const [segunda, setSegunda] = useState(false);
  const [alvo, setAlvo] = useState(() => sortear(fonte, 2));
  const [texto, setTexto] = useState("");
  const input = useRef<HTMLInputElement | null>(null);

  const responder = (certo: boolean) => {
    setTexto("");
    if (certo) {
      if (linha >= VISAO_ALTURAS_MM.length) return onFim(linha);
      setLinha(linha + 1);
      setSegunda(false);
    } else if (!segunda) {
      setSegunda(true);
    } else {
      return onFim(linha - 1);
    }
    setAlvo(sortear(fonte, 2));
    input.current?.focus();
  };
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    responder(texto.replace(/\s/g, "").toUpperCase() === alvo);
  };
  // Altura de maiúscula ≈ 0,7 da fonte (serifada em negrito, como a folha).
  const fontePx = (VISAO_ALTURAS_MM[linha - 1] * pxPorMm) / 0.7;

  return (
    <div>
      <p className="text-sm text-black/70">
        Tampe o olho <strong>{olho === "esquerdo" ? "direito" : "esquerdo"}</strong> e leia com o olho <strong>{olho}</strong>, a 40 cm da tela.
      </p>
      <p className="mt-1 text-xs text-black/45">
        Linha {linha} de {VISAO_ALTURAS_MM.length}
        {segunda ? " · segunda chance nesta linha" : ""}
      </p>
      <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-black/10 bg-white">
        <span
          className="select-none font-bold text-black"
          style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: `${fontePx}px`, letterSpacing: "0.25em", lineHeight: 1 }}
          aria-label="Caracteres para ler"
        >
          {alvo}
        </span>
      </div>
      <form onSubmit={enviar} className="mt-4 flex flex-wrap gap-2">
        <input
          ref={input}
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, 4))}
          inputMode={olho === "esquerdo" ? "numeric" : "text"}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder={olho === "esquerdo" ? "Ex.: 47" : "Ex.: DH"}
          className="h-12 w-36 rounded-xl border border-black/15 px-4 text-center text-lg uppercase tracking-[0.3em] outline-none focus:border-[#2f80c9]"
        />
        <button type="submit" className={botaoPrimario} disabled={!texto.trim()}>
          Confirmar
        </button>
        <button type="button" className={botaoSecundario} onClick={() => responder(false)}>
          Não consigo ler
        </button>
      </form>
    </div>
  );
}

function TesteVisao({ tentativa, onEnviar }: { tentativa: number; onEnviar: (r: unknown) => void }) {
  const [passo, setPasso] = useState<"oculos" | "calibrar" | "esquerdo" | "direito">("oculos");
  const [oculos, setOculos] = useState<"com" | "sem" | "">("");
  const [larguraPx, setLarguraPx] = useState(324); // 85,6 mm a 96 dpi
  const [esquerdo, setEsquerdo] = useState(0);
  const pxPorMm = larguraPx / LARGURA_CARTAO_MM;

  return (
    <div className="mt-4">
      {tentativa > 0 && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Segunda tentativa. Confira a calibração do cartão e a distância de 40 cm antes de começar.
        </p>
      )}
      {passo === "oculos" && (
        <div>
          <p className="text-sm font-medium text-black">Você vai fazer o teste de óculos ou lentes?</p>
          <div className="mt-3 flex gap-2">
            {(["sem", "com"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOculos(o)}
                className={`rounded-full px-5 py-2 text-sm font-medium ${oculos === o ? "bg-[#2f80c9] text-white" : "bg-black/[0.05] text-black/65"}`}
              >
                {o === "sem" ? "Sem óculos" : "Com óculos / lentes"}
              </button>
            ))}
          </div>
          <button type="button" className={`${botaoPrimario} mt-6`} disabled={!oculos} onClick={() => setPasso("calibrar")}>
            Continuar
          </button>
        </div>
      )}
      {passo === "calibrar" && (
        <div>
          <p className="text-sm font-medium text-black">Calibre o tamanho da tela</p>
          <p className="mt-1 text-xs leading-5 text-black/55">
            Encoste um cartão (crédito, débito ou documento do mesmo tamanho) na tela, sobre o retângulo, e ajuste a barra até a
            largura ficar igual à do cartão. Isso garante que as letras apareçam no tamanho certo.
          </p>
          <div className="mt-4 overflow-hidden">
            <div
              className="flex items-center justify-center rounded-[10px] border-2 border-dashed border-[#2f80c9] bg-[#2f80c9]/[0.06] text-xs text-[#2f80c9]"
              style={{ width: larguraPx, height: larguraPx / 1.586 }}
            >
              cartão
            </div>
          </div>
          <input
            type="range"
            min={150}
            max={720}
            value={larguraPx}
            onChange={(e) => setLarguraPx(Number(e.target.value))}
            className="mt-4 w-full max-w-md accent-[#2f80c9]"
            aria-label="Largura do cartão na tela"
          />
          <button type="button" className={`${botaoPrimario} mt-6`} onClick={() => setPasso("esquerdo")}>
            Pronto, está do tamanho do cartão
          </button>
        </div>
      )}
      {passo === "esquerdo" && (
        <LeituraOlho
          key="esq"
          olho="esquerdo"
          pxPorMm={pxPorMm}
          onFim={(l) => {
            setEsquerdo(l);
            setPasso("direito");
          }}
        />
      )}
      {passo === "direito" && <LeituraOlho key="dir" olho="direito" pxPorMm={pxPorMm} onFim={(l) => onEnviar({ oculos, esquerdo, direito: l, pxPorMm })} />}
    </div>
  );
}

// ── 2. Matemática ───────────────────────────────────────────────────────
function TesteMatematica({ prazo, onEnviar }: { prazo: number; onEnviar: (r: unknown) => void }) {
  const [respostas, setRespostas] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const ref = useRef(respostas);
  useEffect(() => {
    ref.current = respostas;
  }, [respostas]);
  const atual = respostas.length;
  const fim = useCallback(() => onEnviar({ respostas: ref.current }), [onEnviar]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const novas = [...respostas, texto.trim()];
    setRespostas(novas);
    setTexto("");
    if (novas.length >= MATEMATICA.length) onEnviar({ respostas: novas });
  };

  return (
    <div>
      <CabecalhoTeste chave="matematica" prazo={prazo} onFim={fim} extra={`Questão ${Math.min(atual + 1, MATEMATICA.length)} de ${MATEMATICA.length} · ${atual} respondidas`} />
      {atual < MATEMATICA.length && (
        <form onSubmit={enviar} className="mt-8 flex flex-col items-center gap-5">
          <p className={`${display.className} text-4xl tabular-nums text-black sm:text-5xl`}>
            <span className="mr-3 text-base text-black/35">{atual + 1}.</span>
            {textoConta(MATEMATICA[atual])} =
          </p>
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value.replace(/[^\d-]/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="off"
            className="h-14 w-32 rounded-xl border border-black/15 text-center text-2xl tabular-nums outline-none focus:border-[#2f80c9]"
            aria-label="Resultado"
          />
          <button type="submit" className={botaoPrimario} disabled={!texto.trim()}>
            Próxima (Enter)
          </button>
        </form>
      )}
    </div>
  );
}

// ── 3. Decimais ─────────────────────────────────────────────────────────
function TesteFracionados({ prazo, onEnviar }: { prazo: number; onEnviar: (r: unknown) => void }) {
  const [respostas, setRespostas] = useState<string[]>(() => FRACIONADOS.map(() => ""));
  const ref = useRef(respostas);
  useEffect(() => {
    ref.current = respostas;
  }, [respostas]);
  const fim = useCallback(() => onEnviar({ respostas: ref.current }), [onEnviar]);
  const feitas = respostas.filter((r) => r.trim()).length;
  return (
    <div>
      <CabecalhoTeste chave="fracionados" prazo={prazo} onFim={fim} extra={`${feitas} de ${FRACIONADOS.length} respondidas`} />
      <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRACIONADOS.map(([a, op, b], i) => (
          <label key={i} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs text-black/35">{i + 1}</span>
            <span className="flex flex-col items-end font-mono text-lg tabular-nums text-black">
              <span>{a}</span>
              <span className="border-b border-black/60 pl-3">
                {op} {b}
              </span>
            </span>
            <input
              value={respostas[i]}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d,.-]/g, "").slice(0, 7);
                setRespostas((r) => r.map((x, j) => (j === i ? v : x)));
              }}
              inputMode="decimal"
              autoComplete="off"
              className="h-11 w-24 rounded-lg border border-black/15 px-2 text-center font-mono tabular-nums outline-none focus:border-[#2f80c9]"
              aria-label={`Resultado da questão ${i + 1}`}
            />
          </label>
        ))}
      </div>
      <button type="button" className={`${botaoPrimario} mt-6`} onClick={fim}>
        Enviar respostas
      </button>
    </div>
  );
}

// ── 4. Comparação ───────────────────────────────────────────────────────
function TesteComparacao({ prazo, onEnviar }: { prazo: number; onEnviar: (r: unknown) => void }) {
  const [respostas, setRespostas] = useState<("igual" | "diferente" | "")[]>(() => COMPARACAO.map(() => ""));
  const ref = useRef(respostas);
  useEffect(() => {
    ref.current = respostas;
  }, [respostas]);
  const fim = useCallback(() => onEnviar({ respostas: ref.current }), [onEnviar]);
  const faltam = respostas.filter((r) => !r).length;
  return (
    <div>
      <CabecalhoTeste chave="comparacao" prazo={prazo} onFim={fim} extra={faltam ? `Faltam ${faltam} de ${COMPARACAO.length}` : "Todas respondidas"} />
      <ol className="mt-4 divide-y divide-black/[0.06]">
        {COMPARACAO.map(([a, b], i) => (
          <li key={i} className="grid grid-cols-[1.25rem_1fr_auto_1fr] items-center gap-2 py-2 sm:gap-4">
            <span className="text-xs text-black/35">{i + 1}</span>
            <span className="rounded-md border border-black/15 px-2 py-1.5 text-center text-sm tracking-[0.06em] text-black sm:text-base">{a}</span>
            <span className="flex gap-1">
              {(["igual", "diferente"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRespostas((r) => r.map((x, j) => (j === i ? v : x)))}
                  aria-pressed={respostas[i] === v}
                  aria-label={v === "igual" ? "Igual" : "Diferente"}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-semibold transition sm:w-12 ${
                    respostas[i] === v ? "bg-[#2f80c9] text-white" : "bg-black/[0.05] text-black/55 hover:bg-black/[0.09]"
                  }`}
                >
                  {v === "igual" ? "○" : "✕"}
                </button>
              ))}
            </span>
            <span className="rounded-md border border-black/15 px-2 py-1.5 text-center text-sm tracking-[0.06em] text-black sm:text-base">{b}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-black/50">○ = igual · ✕ = diferente</p>
      <button type="button" className={`${botaoPrimario} mt-5`} onClick={fim}>
        Enviar respostas{faltam ? ` (faltam ${faltam})` : ""}
      </button>
    </div>
  );
}

// ── 5. Hanamaru ─────────────────────────────────────────────────────────
function TesteHanamaru({ prazo, onEnviar }: { prazo: number; onEnviar: (r: unknown) => void }) {
  const [bloco, setBloco] = useState(0);
  const [marcadas, setMarcadas] = useState<Set<number>>(() => new Set());
  const ref = useRef(marcadas);
  useEffect(() => {
    ref.current = marcadas;
  }, [marcadas]);
  const fim = useCallback(() => onEnviar({ marcadas: [...ref.current] }), [onEnviar]);
  const porBloco = HANAMARU_LINHAS * HANAMARU_COLUNAS;
  const alternar = (i: number) =>
    setMarcadas((m) => {
      const n = new Set(m);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  return (
    <div>
      <CabecalhoTeste chave="hanamaru" prazo={prazo} onFim={fim} extra={`Bloco ${bloco + 1} de ${HANAMARU_BLOCOS} · ${marcadas.size} marcadas`} />
      <p className="mt-3 text-center text-sm text-black/65">
        Toque em todas as letras{" "}
        {HANAMARU_ALVOS.map((l) => (
          <span key={l} className="mx-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#2f80c9] text-base text-black">
            {l}
          </span>
        ))}
      </p>
      <div className="mx-auto mt-4 grid w-fit gap-0.5" style={{ gridTemplateColumns: `repeat(${HANAMARU_COLUNAS}, minmax(0, 1fr))` }}>
        {HANAMARU_GRADE.slice(bloco * porBloco, (bloco + 1) * porBloco).map((letra, k) => {
          const i = bloco * porBloco + k;
          const on = marcadas.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => alternar(i)}
              aria-pressed={on}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[17px] text-black transition sm:h-9 sm:w-9 ${on ? "ring-2 ring-[#2f80c9]" : "hover:bg-black/[0.05]"}`}
            >
              {letra}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center">
        {bloco < HANAMARU_BLOCOS - 1 ? (
          <button type="button" className={botaoPrimario} onClick={() => setBloco(bloco + 1)}>
            Ir para o bloco {bloco + 2}
          </button>
        ) : (
          <button type="button" className={botaoPrimario} onClick={fim}>
            Enviar
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-black/45">Não dá para voltar ao bloco anterior.</p>
    </div>
  );
}

// ── 6. Japonês ──────────────────────────────────────────────────────────
function TesteNihongo({ prazo, onEnviar }: { prazo: number; onEnviar: (r: unknown) => void }) {
  const [r, setR] = useState<Record<string, string>>({});
  const ref = useRef(r);
  useEffect(() => {
    ref.current = r;
  }, [r]);
  const fim = useCallback(() => onEnviar(ref.current), [onEnviar]);
  const grupos = useMemo(() => {
    const m = new Map<string, typeof NIHONGO_PERGUNTAS>();
    for (const p of NIHONGO_PERGUNTAS) m.set(p.grupo, [...(m.get(p.grupo) ?? []), p]);
    return [...m.entries()];
  }, []);
  const campo = "h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-[#2f80c9]";
  return (
    <div>
      <CabecalhoTeste chave="nihongo" prazo={prazo} onFim={fim} extra="Se não souber, deixe em branco." />
      <div className="mt-5 space-y-6">
        {grupos.map(([grupo, itens]) => (
          <fieldset key={grupo}>
            <legend className="text-sm font-medium text-black">{grupo}</legend>
            <div className={`mt-2 grid gap-3 ${itens.length > 3 ? "sm:grid-cols-2" : ""}`}>
              {itens.map((p) => (
                <label key={p.id} className="block">
                  <span className="text-xs text-black/55">{p.enunciado}</span>
                  <input value={r[p.id] ?? ""} onChange={(e) => setR((o) => ({ ...o, [p.id]: e.target.value.slice(0, 200) }))} lang="ja" className={`${campo} mt-1`} />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <fieldset>
          <legend className="text-sm font-medium text-black">5 · Matemática</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {NIHONGO_CONTAS.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <span className="w-20 shrink-0 font-mono text-sm tabular-nums">
                  {c.a} {c.op} {c.b} =
                </span>
                <input value={r[c.id] ?? ""} inputMode="numeric" onChange={(e) => setR((o) => ({ ...o, [c.id]: e.target.value.slice(0, 6) }))} className={campo} />
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <button type="button" className={`${botaoPrimario} mt-6`} onClick={fim}>
        Enviar
      </button>
    </div>
  );
}

// ── Página ──────────────────────────────────────────────────────────────
export default function TestesAptidao({ candidaturaId, token, nome, vagaTitulo, vagaEmpresa, fichaUrl, estadoInicial }: Props) {
  const [estado, setEstado] = useState(estadoInicial);
  const [fase, setFase] = useState<Fase>("lista");
  const [prazo, setPrazo] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const enviado = useRef(false);
  const chave = estado.proximo;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fase, chave]);

  async function chamar(acao: "iniciar" | "enviar", teste: ChaveTeste, respostas?: unknown) {
    const r = await fetch("/api/empregos-testes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidaturaId, token, acao, teste, respostas }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.estado) setEstado(d.estado);
    if (!r.ok) throw new Error(d.error || "Não foi possível continuar agora. Tente novamente.");
    return d as { estado: EstadoPublicoTestes; servidorAgora: string };
  }

  async function comecar() {
    if (!chave) return;
    setOcupado(true);
    setErro("");
    try {
      const d = await chamar("iniciar", chave);
      const limite = INFO_TESTES[chave].limiteSeg;
      const inicio = d.estado.inicios[chave];
      if (limite !== null && inicio) {
        // Tempo que já passou, no relógio do servidor (recarregar não zera).
        const decorrido = new Date(d.servidorAgora).getTime() - new Date(inicio).getTime();
        setPrazo(Date.now() + limite * 1000 - Math.max(0, decorrido));
      } else setPrazo(null);
      enviado.current = false;
      setFase("teste");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const enviar = useCallback(
    async (respostas: unknown) => {
      if (!chave || enviado.current) return;
      enviado.current = true;
      setOcupado(true);
      setErro("");
      try {
        await chamar("enviar", chave, respostas);
        setFase("lista");
      } catch (e) {
        enviado.current = false;
        setErro((e as Error).message);
      } finally {
        setOcupado(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chave],
  );

  const feitos = new Set(estado.feitos);
  const refazerVisao = chave === "visao" && estado.visaoReprovada;

  return (
    <main className="min-h-screen bg-white pb-16 pt-14 text-black">
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <p className={`${display.className} truncate text-base font-medium text-white sm:text-lg`}>Testes de aptidão</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
        {fase !== "teste" && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: AZUL }}>
              {vagaEmpresa}
            </p>
            <h1 className={`${display.className} mt-1 text-2xl font-medium md:text-3xl`} style={{ color: NAVY }}>
              {vagaTitulo}
            </h1>
          </>
        )}

        {/* Resultado final */}
        {estado.aprovado === true && (
          <div className="mt-6 rounded-2xl bg-[#2f80c9]/[0.06] p-6">
            <p className={`${display.className} text-xl text-[#0A2540]`}>Testes concluídos, {nome}!</p>
            <p className="mt-2 text-sm leading-6 text-black/65">
              Você atingiu o mínimo exigido pela empresa. O próximo passo é a ficha cadastral com a sua foto — leva uns 15 minutos.
            </p>
            <Link href={fichaUrl} className={`${botaoPrimario} mt-5`}>
              Continuar para a ficha cadastral
            </Link>
          </div>
        )}
        {estado.aprovado === false && (
          <div className="mt-6 rounded-2xl bg-black/[0.03] p-6">
            <p className={`${display.className} text-xl text-[#0A2540]`}>Obrigado, {nome}!</p>
            <p className="mt-2 text-sm leading-6 text-black/65">
              Recebemos seus testes. Em pelo menos um deles o resultado ficou abaixo do mínimo exigido pela empresa, então sua
              candidatura segue em análise pela nossa equipe. Entraremos em contato pelo e-mail ou telefone informados.
            </p>
            <Link href="/empregos#vagas" className={`${botaoSecundario} mt-5 w-fit`}>
              Ver outras vagas
            </Link>
          </div>
        )}

        {/* Lista de testes */}
        {estado.aprovado === null && fase === "lista" && (
          <div className="mt-6">
            <p className="text-sm leading-6 text-black/65">
              Esta vaga pede {ORDEM_TESTES.length} testes rápidos, os mesmos que a empresa aplica na seleção. Faça em um lugar
              tranquilo, de preferência num computador ou tablet. Cada teste começa só quando você tocar em <em>Começar</em> — e o
              cronômetro não para se você sair da página.
            </p>
            <ol className="mt-5 divide-y divide-black/[0.07] rounded-2xl border border-black/10">
              {ORDEM_TESTES.map((k, i) => {
                const info = INFO_TESTES[k];
                const feito = feitos.has(k) && !(k === "visao" && refazerVisao);
                const atual = k === chave;
                return (
                  <li key={k} className={`flex items-center gap-4 p-4 ${atual ? "bg-[#2f80c9]/[0.05]" : ""}`}>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        feito ? "bg-[#2f80c9] text-white" : atual ? "ring-2 ring-[#2f80c9] text-[#2f80c9]" : "bg-black/[0.05] text-black/40"
                      }`}
                    >
                      {feito ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-black">
                        {info.titulo} <span className="text-black/35">{info.jp}</span>
                      </span>
                      <span className="block text-xs text-black/50">
                        {info.limiteSeg ? `${Math.round(info.limiteSeg / 60)} min` : "sem tempo"} · {info.regra}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            {chave && (
              <div className="mt-6">
                {refazerVisao && (
                  <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    O teste de visão não chegou à linha {VISAO_LINHA_MINIMA} em um dos olhos. Você tem mais {TENTATIVAS_VISAO - estado.tentativasVisao}{" "}
                    tentativa — confira a calibração e a distância.
                  </p>
                )}
                <button type="button" className={botaoPrimario} onClick={() => setFase("instrucoes")}>
                  {feitos.size === 0 ? "Começar pelo" : refazerVisao ? "Refazer o" : "Próximo:"} teste {INFO_TESTES[chave].titulo.toLowerCase()}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instruções */}
        {estado.aprovado === null && fase === "instrucoes" && chave && (
          <div className="mt-6 rounded-2xl border border-black/10 p-5 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: AZUL }}>
              {INFO_TESTES[chave].jp}
            </p>
            <h2 className={`${display.className} mt-1 text-2xl`} style={{ color: NAVY }}>
              {INFO_TESTES[chave].titulo}
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-black/70">
              {INFO_TESTES[chave].instrucoes.map((t) => (
                <li key={t} className="flex gap-2">
                  <span style={{ color: AZUL }}>•</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-black/50">Para passar: {INFO_TESTES[chave].regra}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className={botaoPrimario} disabled={ocupado} onClick={comecar}>
                {ocupado ? "Abrindo…" : INFO_TESTES[chave].limiteSeg ? "Começar — o cronômetro inicia agora" : "Começar"}
              </button>
              <button type="button" className={botaoSecundario} onClick={() => setFase("lista")}>
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Teste */}
        {estado.aprovado === null && fase === "teste" && chave && (
          <div className="mt-2">
            {chave === "visao" && (
              <>
                <CabecalhoTeste chave="visao" prazo={null} onFim={() => {}} />
                <TesteVisao tentativa={estado.tentativasVisao} onEnviar={enviar} />
              </>
            )}
            {chave === "matematica" && prazo !== null && <TesteMatematica prazo={prazo} onEnviar={enviar} />}
            {chave === "fracionados" && prazo !== null && <TesteFracionados prazo={prazo} onEnviar={enviar} />}
            {chave === "comparacao" && prazo !== null && <TesteComparacao prazo={prazo} onEnviar={enviar} />}
            {chave === "hanamaru" && prazo !== null && <TesteHanamaru prazo={prazo} onEnviar={enviar} />}
            {chave === "nihongo" && prazo !== null && <TesteNihongo prazo={prazo} onEnviar={enviar} />}
            {ocupado && <p className="mt-4 text-sm text-black/50">Enviando…</p>}
          </div>
        )}

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        <p className="mt-10 text-center text-[11px] text-black/40">
          Seus dados são usados só para esta candidatura, conforme a{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
