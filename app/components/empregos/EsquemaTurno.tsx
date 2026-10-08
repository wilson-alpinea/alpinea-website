// Esquema visual do turno e do salário de uma vaga — Wilson, 08/out/2026:
// "explicação de turno é difícil de entender, crie um esquema para
// explicar". Lê o texto livre de `turno` e `salario` do catálogo e monta:
// escala (dias de trabalho × folga), horários numa régua de 24 h e como o
// turno roda (fixo/alternado). O que o texto não diz não é inventado — o
// texto original da ficha continua visível embaixo, como referência.

const AZUL = "#1f6fb8";
const NAVY = "#0A2540";

export type Horario = { rotulo: string; inicio: number; fim: number; texto: string; noite: boolean };

export type TurnoEntendido = {
  escalas: { trabalho: number; folga: number }[];
  horarios: Horario[];
  rodizio: string | null;
  periodos: ("dia" | "noite")[];
};

const minutos = (h: string, m: string) => Number(h) * 60 + Number(m);

function rotuloHorario(nome: string | undefined, inicio: number) {
  const n = (nome ?? "").toLowerCase();
  if (n === "hayaban") return "Manhã (hayaban)";
  if (n === "osoban") return "Tarde (osoban)";
  if (n === "vespertino") return "Vespertino";
  if (n === "diurno") return "Diurno";
  if (n === "noturno") return "Noturno";
  const h = inicio / 60;
  if (h >= 4 && h < 12) return "Diurno";
  if (h >= 12 && h < 17) return "Tarde";
  return "Noturno";
}

export function entenderTurno(turno: string): TurnoEntendido {
  // Ressalvas como "sem turno noturno" não contam como turno noturno.
  const t = turno
    .toLowerCase()
    .replace(/sem turno noturno/g, "")
    .replace(/possibilidade de turno noturno[^,;]*/g, "");
  const escalas: TurnoEntendido["escalas"] = [];
  for (const m of turno.matchAll(/(\d)\s*x\s*(\d)/g)) {
    const e = { trabalho: Number(m[1]), folga: Number(m[2]) };
    if (!escalas.some((x) => x.trabalho === e.trabalho && x.folga === e.folga)) escalas.push(e);
  }
  // Horários: só do primeiro local quando a ficha lista mais de um (";").
  const trecho = turno.split(";")[0];
  const horarios: Horario[] = [];
  for (const m of trecho.matchAll(/(?:(diurno|noturno|vespertino|hayaban|osoban)\s*)?(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/gi)) {
    const inicio = minutos(m[2], m[3]);
    const fim = minutos(m[4], m[5]);
    const rotulo = rotuloHorario(m[1], inicio);
    // Começa à noite (17h+) ou de madrugada → visual de turno noturno.
    const noite = rotulo === "Noturno" || inicio >= 17 * 60 || inicio < 4 * 60;
    horarios.push({ rotulo, inicio, fim, texto: `${m[2]}:${m[3]}–${m[4]}:${m[5]}`, noite });
  }
  let rodizio: string | null = null;
  if (/2 turnos ou sankoutai/.test(t)) rodizio = "Alternado — 2 ou 3 turnos, conforme a escala";
  else if (/3 turnos|sankoutai/.test(t)) rodizio = "3 turnos em rodízio";
  else if (/fixo/.test(t) && /alternad/.test(t)) rodizio = "Fixo ou alternado, conforme a escala";
  else if (/alternad/.test(t))
    rodizio = /semanal/.test(t) ? "Alternado — troca de turno toda semana" : /mensal/.test(t) ? "Alternado — troca de turno todo mês" : "Alternado — reveza entre os turnos";
  else if (/fixo/.test(t))
    rodizio = /diurno fixo/.test(t) && !/noturno/.test(t) ? "Fixo — sempre de dia" : /diurno ou noturno|diurno.*noturno fixo|noturno fixo/.test(t) ? "Fixo — sempre de dia ou sempre de noite" : "Fixo — sempre no mesmo turno";
  const periodos: TurnoEntendido["periodos"] = [];
  if (/diurno|hayaban/.test(t) || horarios.some((h) => !h.noite)) periodos.push("dia");
  if (/noturno|vespertino|osoban/.test(t) || horarios.some((h) => h.noite)) periodos.push("noite");
  return { escalas, horarios, rodizio, periodos };
}

// Salário: valor principal grande + o resto do texto como detalhe.
export function separarSalario(salario: string): { principal: string; detalhe: string } {
  // Valores alternativos ("¥1.200/hora (mulheres) ou ¥1.300/hora (homens)")
  // viram faixa, com o texto original como detalhe.
  const fora = salario.replace(/\([^)]*\)/g, "");
  const alternativas = [...fora.matchAll(/¥([\d.]+)\s*\/\s*hora/gi)].map((x) => x[1]);
  if (/ ou ¥/.test(fora) && alternativas.length >= 2) {
    const nums = alternativas.map((x) => Number(x.replace(/\./g, "")));
    const fmt = (n: number) => n.toLocaleString("pt-BR");
    return { principal: `¥${fmt(Math.min(...nums))}–${fmt(Math.max(...nums))}/h`, detalhe: salario };
  }
  const m = salario.match(/¥[\d.]+(?:\s*[–-]\s*¥?[\d.]+)?\s*\/\s*hora/i);
  if (!m) return { principal: salario, detalhe: "" };
  const resto = (salario.slice(0, m.index) + salario.slice(m.index! + m[0].length))
    .replace(/^\s*\(([^)]*)\)/, "$1")
    .replace(/\s*\(/g, " — ")
    .replace(/\)/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;–-]+|[\s,;–-]+$/g, "")
    .trim();
  return { principal: m[0].replace(/\s*\/\s*hora/i, "/h"), detalhe: resto ? resto[0].toUpperCase() + resto.slice(1) : "" };
}

function Sol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function Lua({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// Régua de 24 h com um trecho colorido (turno que vira a noite dá a volta).
function Regua({ h }: { h: Horario }) {
  const pct = (min: number) => (min / 1440) * 100;
  const cor = h.noite ? NAVY : AZUL;
  const trechos = h.fim > h.inicio ? [[h.inicio, h.fim]] : [[h.inicio, 1440], [0, h.fim]];
  return (
    <div className="relative h-2.5 rounded-full bg-black/[0.06]">
      {trechos.map(([a, b]) => (
        <span key={a} className="absolute inset-y-0 rounded-full" style={{ left: `${pct(a)}%`, width: `${pct(b - a)}%`, background: cor }} />
      ))}
    </div>
  );
}

export default function EsquemaTurno({ turno }: { turno: string }) {
  const e = entenderTurno(turno);
  return (
    <div className="space-y-4">
      {/* Escala */}
      {e.escalas.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">Escala</p>
          <div className="mt-2 space-y-2">
            {e.escalas.map((s, i) => (
              <div key={`${s.trabalho}x${s.folga}`} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {i > 0 && <span className="w-full text-[11px] text-black/40">ou</span>}
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: s.trabalho + s.folga }, (_, d) => (
                    <span
                      key={d}
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold ${d < s.trabalho ? "text-white" : "border border-dashed border-black/20 text-black/35"}`}
                      style={d < s.trabalho ? { background: AZUL } : undefined}
                    >
                      {d < s.trabalho ? "T" : "F"}
                    </span>
                  ))}
                </span>
                <span className="text-sm" style={{ color: NAVY }}>
                  <strong className="font-semibold">{s.trabalho} dias</strong> de trabalho, <strong className="font-semibold">{s.folga}</strong> de folga
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-black/45">O ciclo se repete — a folga nem sempre cai no fim de semana.</p>
        </div>
      )}

      {/* Horários */}
      {e.horarios.length > 0 ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">Horários</p>
          <div className="mt-2 space-y-2.5">
            {e.horarios.map((h, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: NAVY }}>
                  {h.noite ? <Lua className="h-3.5 w-3.5 shrink-0" /> : <Sol className="h-3.5 w-3.5 shrink-0" />}
                  <span className="min-w-0">
                    <span className="block font-medium">{h.rotulo}</span>
                    <span className="block tabular-nums text-black/55">{h.texto}</span>
                  </span>
                </span>
                <Regua h={h} />
              </div>
            ))}
            <div className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-3" aria-hidden="true">
              <span />
              <span className="flex justify-between text-[10px] tabular-nums text-black/35">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        e.periodos.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">Período</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {e.periodos.map((p) => (
                <span key={p} className="flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs" style={{ color: NAVY }}>
                  {p === "dia" ? <Sol className="h-3.5 w-3.5" /> : <Lua className="h-3.5 w-3.5" />}
                  {p === "dia" ? "Diurno" : "Noturno"}
                </span>
              ))}
            </div>
          </div>
        )
      )}

      {/* Rodízio */}
      {e.rodizio && (
        <p className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" style={{ color: AZUL }} aria-hidden="true">
            <path d="M17 2l4 4-4 4" />
            <path d="M3 11V9a3 3 0 0 1 3-3h15" />
            <path d="M7 22l-4-4 4-4" />
            <path d="M21 13v2a3 3 0 0 1-3 3H3" />
          </svg>
          {e.rodizio}
        </p>
      )}

      <p className="text-[11px] leading-5 text-black/45">Na ficha: {turno}</p>
    </div>
  );
}
