"use client";

import { useState, type FormEvent } from "react";
import {
  FICHA_VAZIA,
  ORIENTACOES_FAMILIA,
  SECOES,
  campoVisivel,
  formatarCpf,
  isLista,
  pendenciasFicha,
  type Campo,
  type FichaCadastral,
  type FichaValores,
  type Lista,
  type ValorCampo,
} from "@/app/lib/fichaCadastral";

const AZUL = "#2f80c9";
const ETAPAS = [...SECOES.map((s) => ({ id: s.id, titulo: s.titulo })), { id: "foto", titulo: "Foto" }];

function lerRascunho(chave: string): FichaCadastral {
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return FICHA_VAZIA;
    const f = JSON.parse(bruto) as FichaCadastral;
    return { versao: 1, valores: f.valores ?? {}, listas: f.listas ?? {} };
  } catch {
    return FICHA_VAZIA;
  }
}

function salvarRascunho(chave: string, f: FichaCadastral) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(f));
  } catch {
    // navegador sem storage — segue sem rascunho
  }
}

const LARGURA: Record<NonNullable<Campo["largura"]>, string> = {
  inteira: "sm:col-span-6",
  meia: "sm:col-span-3",
  terco: "sm:col-span-2",
};

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-[#2f80c9] focus:ring-2 focus:ring-[#2f80c9]/10";

function CampoInput({ c, valor, onChange }: { c: Campo; valor: ValorCampo | undefined; onChange: (v: ValorCampo) => void }) {
  const texto = typeof valor === "string" ? valor : "";
  const lista = Array.isArray(valor) ? valor : [];

  if (c.tipo === "aceite") {
    return (
      <label className="flex items-start gap-2.5 text-sm text-black/75">
        <input
          type="checkbox"
          checked={texto === "sim"}
          onChange={(e) => onChange(e.target.checked ? "sim" : "")}
          className="mt-0.5 h-4 w-4 rounded border-black/20"
          style={{ accentColor: AZUL }}
        />
        <span>
          {c.label}
          {c.obrigatorio && <span className="text-red-500"> *</span>}
        </span>
      </label>
    );
  }

  const rotulo = (
    <span className="mb-1.5 block text-xs font-medium text-black/65">
      {c.label}
      {c.obrigatorio && <span className="text-red-500"> *</span>}
    </span>
  );
  const ajuda = c.ajuda ? <span className="mt-1 block text-[11px] text-black/40">{c.ajuda}</span> : null;

  if (c.tipo === "radio" || c.tipo === "multi") {
    const marcado = (v: string) => (c.tipo === "multi" ? lista.includes(v) : texto === v);
    const alternar = (v: string) => {
      if (c.tipo === "radio") return onChange(v);
      // "Nenhum desses" desmarca o resto e vice-versa.
      if (v === "nenhum") return onChange(lista.includes("nenhum") ? [] : ["nenhum"]);
      const semNenhum = lista.filter((x) => x !== "nenhum");
      onChange(semNenhum.includes(v) ? semNenhum.filter((x) => x !== v) : [...semNenhum, v]);
    };
    return (
      <div>
        {rotulo}
        <div className="flex flex-wrap gap-1.5">
          {(c.opcoes ?? []).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => alternar(o.v)}
              aria-pressed={marcado(o.v)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                marcado(o.v) ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/10 bg-white text-black/65 hover:border-black/25"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
        {ajuda}
      </div>
    );
  }

  if (c.tipo === "select") {
    return (
      <label className="block">
        {rotulo}
        <select value={texto} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">Selecione</option>
          {(c.opcoes ?? []).map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        {ajuda}
      </label>
    );
  }

  if (c.tipo === "textarea") {
    return (
      <label className="block">
        {rotulo}
        <textarea rows={4} value={texto} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={c.placeholder} />
        {ajuda}
      </label>
    );
  }

  const tipoHtml = { data: "date", mes: "month", numero: "number", tel: "tel" } as Record<string, string>;
  return (
    <label className="block">
      {rotulo}
      <input
        type={tipoHtml[c.tipo] ?? "text"}
        inputMode={c.tipo === "cpf" ? "numeric" : c.tipo === "numero" ? "decimal" : undefined}
        min={c.tipo === "numero" ? 0 : undefined}
        value={texto}
        onChange={(e) => onChange(c.tipo === "cpf" ? formatarCpf(e.target.value) : e.target.value)}
        placeholder={c.placeholder ?? (c.tipo === "cpf" ? "000.000.000-00" : undefined)}
        className={inputCls}
      />
      {ajuda}
    </label>
  );
}

function Campos({
  campos,
  escopo,
  raiz,
  onCampo,
}: {
  campos: Campo[];
  escopo: FichaValores;
  raiz: FichaValores;
  onCampo: (id: string, v: ValorCampo) => void;
}) {
  return (
    <>
      {campos
        .filter((c) => campoVisivel(c, escopo, raiz))
        .map((c) => (
          <div key={c.id} className={`col-span-6 ${LARGURA[c.largura ?? "inteira"]}`}>
            {c.id === "cienteOrientacoesFamilia" && (
              <ul className="mb-3 list-disc space-y-1 rounded-2xl bg-amber-50 py-3 pl-8 pr-4 text-xs leading-5 text-amber-900">
                {ORIENTACOES_FAMILIA.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            )}
            <CampoInput c={c} valor={escopo[c.id]} onChange={(v) => onCampo(c.id, v)} />
          </div>
        ))}
    </>
  );
}

function ListaCampos({
  lista,
  itens,
  raiz,
  onItens,
}: {
  lista: Lista;
  itens: FichaValores[];
  raiz: FichaValores;
  onItens: (itens: FichaValores[]) => void;
}) {
  return (
    <div className="col-span-6 rounded-2xl border border-black/[0.07] bg-black/[0.015] p-4">
      <p className="text-sm font-medium text-black/80">{lista.label}</p>
      {lista.ajuda && <p className="mt-0.5 text-[11px] text-black/40">{lista.ajuda}</p>}
      <div className="mt-3 space-y-3">
        {itens.map((it, idx) => (
          <div key={idx} className="rounded-xl border border-black/[0.07] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                {lista.rotuloItem} {idx + 1}
              </span>
              <button type="button" onClick={() => onItens(itens.filter((_, i) => i !== idx))} className="text-xs text-red-500 hover:underline">
                Remover
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              <Campos
                campos={lista.campos}
                escopo={it}
                raiz={raiz}
                onCampo={(id, v) => onItens(itens.map((x, i) => (i === idx ? { ...x, [id]: v } : x)))}
              />
            </div>
          </div>
        ))}
      </div>
      {itens.length < lista.max && (
        <button
          type="button"
          onClick={() => onItens([...itens, {}])}
          className="mt-3 rounded-full border border-dashed border-[#2f80c9]/50 px-4 py-2 text-xs font-medium text-[#2f80c9] hover:bg-[#2f80c9]/5"
        >
          + Adicionar {lista.rotuloItem.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export default function FichaForm({ candidaturaId, token, fichaJaEnviada }: { candidaturaId: string; token: string; fichaJaEnviada: boolean }) {
  const chave = `alpinea-ficha-${candidaturaId}`;
  const [ficha, setFicha] = useState<FichaCadastral>(() => lerRascunho(chave));
  const [passo, setPasso] = useState(fichaJaEnviada ? ETAPAS.length - 1 : 0);
  const [faltas, setFaltas] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [checklist, setChecklist] = useState({
    fundoClaro: false,
    semBoneOuChapeu: false,
    semOculosEscuros: false,
    rostoVisivelCentralizado: false,
  });

  const atualizar = (f: FichaCadastral) => {
    setFicha(f);
    salvarRascunho(chave, f);
  };
  const setValor = (id: string, v: ValorCampo) => atualizar({ ...ficha, valores: { ...ficha.valores, [id]: v } });
  const setLista = (id: string, itens: FichaValores[]) => atualizar({ ...ficha, listas: { ...ficha.listas, [id]: itens } });

  const etapa = ETAPAS[passo];
  const secao = SECOES.find((s) => s.id === etapa.id);

  const irPara = (novo: number) => {
    setPasso(novo);
    setFaltas([]);
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function avancar() {
    if (secao) {
      const pend = pendenciasFicha(ficha, secao.id);
      if (pend.length) {
        setFaltas(pend);
        return;
      }
    }
    irPara(passo + 1);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const pend = fichaJaEnviada ? [] : pendenciasFicha(ficha);
    if (pend.length) {
      setFaltas(pend);
      setErro("Ainda há campos obrigatórios em etapas anteriores.");
      return;
    }
    if (!foto) {
      setErro("Envie sua foto.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      if (!fichaJaEnviada) {
        const r = await fetch("/api/empregos-ficha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidaturaId, token, ficha }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setErro(d.error || "Não foi possível salvar sua ficha. Tente novamente.");
          return;
        }
      }
      const form = new FormData();
      form.append("candidaturaId", candidaturaId);
      form.append("token", token);
      form.append("foto", foto);
      form.append("checklist", JSON.stringify(checklist));
      const r2 = await fetch("/api/empregos-foto", { method: "POST", body: form });
      const d2 = await r2.json().catch(() => ({}));
      if (!r2.ok) {
        setErro(d2.error || "Sua ficha foi salva, mas a foto não foi enviada. Tente a foto de novo.");
        return;
      }
      try {
        window.localStorage.removeItem(chave);
      } catch {
        // ignora
      }
      setConcluido(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErro("Não foi possível enviar agora. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-medium text-black">Ficha e foto recebidas!</p>
        <p className="mt-2 text-sm leading-6 text-black/55">
          Nossa equipe vai revisar tudo e entrar em contato pelo e-mail ou telefone informados.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Progresso */}
      <div className="flex gap-1">
        {ETAPAS.map((e, i) => (
          <div key={e.id} className="h-1 flex-1 rounded-full" style={{ background: i <= passo ? AZUL : "rgba(0,0,0,0.08)" }} />
        ))}
      </div>
      <p className="mt-2 text-xs text-black/45">
        Passo {passo + 1} de {ETAPAS.length} · {etapa.titulo}
      </p>

      <form onSubmit={enviar} className="mt-4 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        {secao ? (
          <>
            <h2 className="text-lg font-medium text-black">{secao.titulo}</h2>
            {secao.descricao && <p className="mt-1 text-xs leading-5 text-black/50">{secao.descricao}</p>}
            <div className="mt-5 grid grid-cols-6 gap-4">
              {secao.itens.map((item) =>
                isLista(item) ? (
                  <ListaCampos key={item.id} lista={item} itens={ficha.listas[item.id] ?? []} raiz={ficha.valores} onItens={(it) => setLista(item.id, it)} />
                ) : (
                  <Campos key={item.id} campos={[item]} escopo={ficha.valores} raiz={ficha.valores} onCampo={setValor} />
                ),
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-black">Foto</h2>
            <p className="mt-1 text-xs leading-5 text-black/55">
              Foto tipo 3x4 recente, com fundo claro/liso, boa iluminação e o rosto bem visível — sem boné, chapéu ou
              óculos escuros.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="mt-4 w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium"
            />
            <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
              {[
                { key: "fundoClaro" as const, label: "O fundo da foto é claro/liso" },
                { key: "semBoneOuChapeu" as const, label: "Não estou usando boné ou chapéu" },
                { key: "semOculosEscuros" as const, label: "Não estou usando óculos escuros" },
                { key: "rostoVisivelCentralizado" as const, label: "Meu rosto está visível e centralizado" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2.5 text-xs text-black/70">
                  <input
                    type="checkbox"
                    required
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist((c) => ({ ...c, [item.key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-black/20"
                    style={{ accentColor: AZUL }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </>
        )}

        {faltas.length > 0 && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-700">
            <p className="font-medium">Faltou preencher:</p>
            <ul className="mt-1 list-disc pl-5">
              {faltas.slice(0, 12).map((f) => (
                <li key={f}>{f}</li>
              ))}
              {faltas.length > 12 && <li>e mais {faltas.length - 12}…</li>}
            </ul>
          </div>
        )}
        {erro && <p className="mt-4 text-xs text-red-600">{erro}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          {passo > 0 && !(fichaJaEnviada && !secao) ? (
            <button type="button" onClick={() => irPara(passo - 1)} className="rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-black/50 hover:text-black">
              Voltar
            </button>
          ) : (
            <span />
          )}
          {secao ? (
            <button type="button" onClick={avancar} className="rounded-full bg-[#2f80c9] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc]">
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full bg-[#2f80c9] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar ficha e foto"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
