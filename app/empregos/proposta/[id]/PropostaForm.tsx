"use client";

import { useState } from "react";
import {
  AEROPORTOS,
  CONTA_JP_BANK_AJISAI,
  CREDOR_FINANCIAMENTO,
  PASSOS_TRANSFERENCIA_JP_BANK,
  MAX_PROPONENTES,
  NOTA_PASSAGEM,
  NOTA_VISTO,
  PRECOS,
  SERVICOS_CESTA,
  TERMOS_PROPOSTA,
  aeroportoNorteNordeste,
  calcularProposta,
  formatarMoeda,
  mensagemWhatsappProposta,
  termoFinanciamento,
  type TermoFinanciamento,
  type ItemProposta,
  type Moeda,
  type SelecaoProposta,
} from "@/app/lib/financiamentoEmpregos";
import { WHATSAPP_AJISAI_NUMERO } from "@/lib/email/templateCliente";

const UFS = Array.from(new Set(AEROPORTOS.map((a) => a.uf))).sort();

function ToggleMoeda({ moeda, onChange }: { moeda: Moeda; onChange: (m: Moeda) => void }) {
  return (
    <div className="flex rounded-full bg-black/[0.05] p-0.5 text-[10px] font-semibold">
      {(["BRL", "JPY"] as Moeda[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={moeda === m}
          className={`rounded-full px-2.5 py-1 transition ${moeda === m ? "bg-white text-black shadow-sm" : "text-black/45"}`}
        >
          {m === "BRL" ? "R$" : "¥"}
        </button>
      ))}
    </div>
  );
}

function SimNao({ valor, onChange }: { valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-1.5">
      {[
        { v: true, l: "Preciso" },
        { v: false, l: "Não preciso" },
      ].map((o) => (
        <button
          key={o.l}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
            valor === o.v ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/10 text-black/60"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Card({
  titulo,
  children,
  valor,
  moeda,
  onMoeda,
}: {
  titulo: string;
  children: React.ReactNode;
  valor?: { totalBRL: number; totalJPY: number };
  moeda: Moeda;
  onMoeda: (m: Moeda) => void;
}) {
  const fmt = (m: Moeda) => (valor ? formatarMoeda(m === "BRL" ? valor.totalBRL : valor.totalJPY, m) : "");
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-medium text-black">{titulo}</h2>
        {valor && <ToggleMoeda moeda={moeda} onChange={onMoeda} />}
      </div>
      <div className="mt-3">{children}</div>
      {valor && (
        <p className="mt-4 border-t border-black/[0.06] pt-3 text-right">
          <span className="text-lg font-semibold tabular-nums text-black">{fmt(moeda)}</span>
          <span className="ml-2 text-[11px] text-black/40">≈ {fmt(moeda === "BRL" ? "JPY" : "BRL")}</span>
        </p>
      )}
    </section>
  );
}

// Linha do tempo das parcelas + Termo de Dívida + guia JP Bank
// (Wilson, 18/out/2026). Só existe nesta página, que só abre para vagas
// sem custo zero (vagaPrecisaProposta).
function TermoDivida({ termo }: { termo: TermoFinanciamento }) {
  const [verGuia, setVerGuia] = useState(false);
  const ienes = (v: number) => formatarMoeda(v, "JPY");
  const dataBR = termo.dados.data.split("-").reverse().join("/");
  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-medium text-black">Como você paga o financiamento</h2>
        <p className="mt-1 text-xs leading-5 text-black/50">
          Em 2 parcelas, depois de chegar ao Japão. O pagamento é feito diretamente à AjisaiWork e não é descontado em folha de pagamento.
        </p>
        <ol className="mt-5">
          {termo.parcelas.map((p) => (
            <li key={p.numero} className="relative flex gap-4 pb-6">
              <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-[#2f80c9]/25" />
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-xs font-semibold text-white">
                {p.numero}
              </span>
              <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 pt-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">Parcela {p.numero}</p>
                  <p className="text-sm text-black/70">{p.quando}</p>
                </div>
                <p className="text-lg font-semibold tabular-nums text-black">{ienes(p.valorJPY)}</p>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 rounded-2xl bg-[#0f2236] px-4 py-3 text-white">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">Total</span>
            <span className="text-lg font-semibold tabular-nums">{ienes(termo.dados.totalJPY)}</span>
          </li>
        </ol>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-medium text-black">Termo de Dívida</h2>
        <p className="mt-1 text-xs text-black/50">Leia com atenção. Os valores acompanham o que você escolheu acima.</p>
        <div className="mt-4 max-h-[26rem] overflow-y-auto rounded-2xl border border-black/10 bg-[#fbfbfa] p-4 sm:p-5">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-black">{termo.titulo}</p>
          <p lang="ja" className="mt-4 text-[11px] leading-5 text-black/55">
            {termo.textoJapones}
          </p>
          <div className="mt-4 space-y-3 text-xs leading-5 text-black/70">
            {termo.clausulas.map((c, i) => (
              <p key={i}>{c}</p>
            ))}
          </div>
          <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-black/[0.08] pt-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-black/40">Credor</dt>
              <dd className="text-black/75">
                {CREDOR_FINANCIAMENTO.razaoSocial} — CNPJ {CREDOR_FINANCIAMENTO.cnpj}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-black/40">Data</dt>
              <dd className="tabular-nums text-black/75">{dataBR}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-black/40">Nome completo do candidato</dt>
              <dd className="text-black/75">{termo.dados.nomeCompleto}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-black/40">Nº do passaporte</dt>
              <dd className="text-black/75">{termo.dados.passaporte || "Não informado na ficha"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <button type="button" onClick={() => setVerGuia((v) => !v)} aria-expanded={verGuia} className="flex w-full items-center justify-between gap-3 text-left">
          <span className="text-sm font-medium text-black">Como pagar as parcelas pelo JP Bank (ゆうちょ銀行)</span>
          <span className="text-xs font-medium text-[#2f80c9]">{verGuia ? "Ocultar" : "Ver passo a passo"}</span>
        </button>
        {verGuia && (
          <div className="mt-4">
            <div className="grid gap-2 rounded-2xl bg-[#2f80c9]/[0.06] p-4 text-xs sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Code number</p>
                <p className="font-semibold tabular-nums text-black">{CONTA_JP_BANK_AJISAI.codeNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Account number</p>
                <p className="font-semibold tabular-nums text-black">{CONTA_JP_BANK_AJISAI.accountNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Titular</p>
                <p lang="ja" className="font-semibold text-black">{CONTA_JP_BANK_AJISAI.titularKatakana}</p>
              </div>
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs leading-5 text-black/65">
              {PASSOS_TRANSFERENCIA_JP_BANK.map((passo) => (
                <li key={passo}>{passo}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </>
  );
}

export default function PropostaForm(props: {
  candidaturaId: string;
  token: string;
  nome: string;
  vagaTitulo: string;
  vagaEmpresa: string;
  cotacao: number;
  fonteCotacao: string;
  cidadeCandidato: string;
  inicial: SelecaoProposta;
  passaporte: string;
  dataTermo: string;
  jaAceita: boolean;
  agendamentoUrl: string;
}) {
  const [sel, setSel] = useState<SelecaoProposta>(props.inicial);
  const [moedas, setMoedas] = useState<Record<string, Moeda>>({});
  const [aceite, setAceite] = useState(false);
  const [verTermos, setVerTermos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const proposta = calcularProposta(sel, props.cotacao);
  const termo = termoFinanciamento({
    nomeCompleto: props.nome,
    passaporte: props.passaporte,
    totalJPY: proposta.totalJPY,
    totalBRL: proposta.totalBRL,
    cotacaoBRLPorJPY: props.cotacao,
    data: props.dataTermo,
  });
  const set = <K extends keyof SelecaoProposta>(k: K, v: SelecaoProposta[K]) => setSel((s) => ({ ...s, [k]: v }));
  const moeda = (id: string) => moedas[id] ?? "BRL";
  const valorEm = (i: Pick<ItemProposta, "totalBRL" | "totalJPY">, m: Moeda) => formatarMoeda(m === "BRL" ? i.totalBRL : i.totalJPY, m);
  const item = (id: ItemProposta["id"]) => proposta.itens.find((i) => i.id === id);
  const nne = aeroportoNorteNordeste(sel.aeroporto);
  const pessoas = `${sel.proponentes} pessoa${sel.proponentes > 1 ? "s" : ""}`;

  const linkWhatsapp = `https://wa.me/${WHATSAPP_AJISAI_NUMERO}?text=${encodeURIComponent(
    mensagemWhatsappProposta({
      nome: props.nome,
      vagaTitulo: props.vagaTitulo,
      vagaEmpresa: props.vagaEmpresa,
      candidaturaId: props.candidaturaId,
      proposta,
    }),
  )}`;

  async function aceitar() {
    if (!aceite || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/empregos-proposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidaturaId: props.candidaturaId, token: props.token, acao: "aceitar", selecao: sel, aceiteTermos: true }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.agendamentoUrl) {
        setErro(d.error || "Não foi possível registrar o aceite. Tente novamente.");
        setEnviando(false);
        return;
      }
      window.location.assign(d.agendamentoUrl);
    } catch {
      setErro("Não foi possível registrar o aceite. Tente novamente.");
      setEnviando(false);
    }
  }

  // Registra o pedido de contato sem segurar a abertura do WhatsApp.
  function registrarFalarAjisai() {
    fetch("/api/empregos-proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidaturaId: props.candidaturaId, token: props.token, acao: "falar_ajisai", selecao: sel }),
      keepalive: true,
    }).catch(() => {});
  }


  if (props.jaAceita) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-medium text-black">Proposta já aceita</p>
        <p className="mt-2 text-sm text-black/55">Falta só agendar a sua pré-entrevista.</p>
        <a href={props.agendamentoUrl} className="mt-6 inline-block rounded-full bg-[#2f80c9] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Agendar pré-entrevista
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <Card moeda={moeda("proponentes")} onMoeda={(m) => setMoedas((s) => ({ ...s, proponentes: m }))} titulo="Quantas pessoas vão embarcar?">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => set("proponentes", Math.max(1, sel.proponentes - 1))} className="h-10 w-10 rounded-full border border-black/10 text-lg text-black/60">
            −
          </button>
          <span className="w-10 text-center text-2xl font-semibold tabular-nums text-black">{sel.proponentes}</span>
          <button
            type="button"
            onClick={() => set("proponentes", Math.min(MAX_PROPONENTES, sel.proponentes + 1))}
            className="h-10 w-10 rounded-full border border-black/10 text-lg text-black/60"
          >
            +
          </button>
          <span className="text-xs text-black/45">Você + cônjuge/filhos que vão junto</span>
        </div>
      </Card>

      <Card moeda={moeda("visto")} onMoeda={(m) => setMoedas((s) => ({ ...s, visto: m }))} titulo="1. Serviço do visto" valor={item("visto") ?? { totalBRL: 0, totalJPY: 0 }}>
        <SimNao valor={sel.visto} onChange={(v) => set("visto", v)} />
        <p className="mt-2 text-xs text-black/50">
          {formatarMoeda(PRECOS.vistoBRL, "BRL")} por pessoa × {sel.proponentes}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-black/40">* {NOTA_VISTO}</p>
      </Card>

      <Card moeda={moeda("certificado")} onMoeda={(m) => setMoedas((s) => ({ ...s, certificado: m }))} titulo="2. Certificado de Elegibilidade" valor={item("certificado") ?? { totalBRL: 0, totalJPY: 0 }}>
        <SimNao valor={sel.certificado} onChange={(v) => set("certificado", v)} />
        <p className="mt-2 text-xs text-black/50">
          {formatarMoeda(PRECOS.certificadoJPY, "JPY")} por pessoa × {sel.proponentes}
        </p>
      </Card>

      <Card moeda={moeda("passagem")} onMoeda={(m) => setMoedas((s) => ({ ...s, passagem: m }))}
        titulo="3. Passagem aérea"
        valor={{
          totalBRL: (item("passagem")?.totalBRL ?? 0) + (item("adicionalNorteNordeste")?.totalBRL ?? 0),
          totalJPY: (item("passagem")?.totalJPY ?? 0) + (item("adicionalNorteNordeste")?.totalJPY ?? 0),
        }}
      >
        <label className="block text-xs text-black/55">
          Aeroporto mais próximo de onde você mora{props.cidadeCandidato && ` (${props.cidadeCandidato})`}
          <select
            value={sel.aeroporto}
            onChange={(e) => set("aeroporto", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
          >
            {UFS.map((uf) => (
              <optgroup key={uf} label={uf}>
                {AEROPORTOS.filter((a) => a.uf === uf).map((a) => (
                  <option key={a.iata} value={a.iata}>
                    {a.iata} — {a.cidade} ({a.nome})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs text-black/50">
          {formatarMoeda(PRECOS.passagemJPY, "JPY")} por pessoa × {sel.proponentes}
        </p>
        {nne && (
          <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            + Adicional Norte/Nordeste: {formatarMoeda(PRECOS.adicionalNorteNordesteJPY, "JPY")} por pessoa × {sel.proponentes}
          </p>
        )}
        <p className="mt-1 text-[11px] leading-4 text-black/40">** {NOTA_PASSAGEM}</p>
      </Card>

      <Card moeda={moeda("cesta")} onMoeda={(m) => setMoedas((s) => ({ ...s, cesta: m }))} titulo="4. Cesta de serviços extras" valor={item("cestaExtras") ?? { totalBRL: 0, totalJPY: 0 }}>
        <label className="flex items-center gap-2.5 text-sm text-black/75">
          <input type="checkbox" checked={sel.cestaExtras} onChange={(e) => set("cestaExtras", e.target.checked)} className="h-4 w-4" style={{ accentColor: "#2f80c9" }} />
          Incluir a cesta — {formatarMoeda(PRECOS.cestaExtrasJPY, "JPY")} valor fixo
        </label>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-black/55">
          {SERVICOS_CESTA.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>

      <section className="rounded-3xl bg-[#0f2236] p-5 text-white shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-medium text-white/80">Total estimado para {pessoas}</h2>
          <div className="rounded-full bg-white/10">
            <ToggleMoeda moeda={moeda("total")} onChange={(m) => setMoedas((s) => ({ ...s, total: m }))} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums">{valorEm(proposta, moeda("total"))}</p>
        <p className="text-xs text-white/50">≈ {valorEm(proposta, moeda("total") === "BRL" ? "JPY" : "BRL")}</p>
        <p className="mt-3 text-[11px] text-white/40">
          Cotação usada: ¥1 = R$ {props.cotacao.toFixed(4)} ({props.fonteCotacao}). O valor em reais varia com o câmbio.
        </p>
      </section>

      <TermoDivida termo={termo} />

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <button type="button" onClick={() => setVerTermos((v) => !v)} className="text-xs font-medium text-[#2f80c9] underline underline-offset-2">
          {verTermos ? "Ocultar" : "Ler"} os termos e condições da proposta
        </button>
        {verTermos && (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-5 text-black/60">
            {TERMOS_PROPOSTA.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        )}
        <label className="mt-4 flex items-start gap-2.5 text-sm text-black/75">
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-4 w-4" style={{ accentColor: "#2f80c9" }} />
          Li e aceito os termos e condições desta proposta e o Termo de Dívida acima.
        </label>
        {erro && <p className="mt-3 text-xs text-red-600">{erro}</p>}
        <button
          type="button"
          onClick={aceitar}
          disabled={!aceite || enviando}
          className="mt-5 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Enviando…" : "Aceitar e agendar pré-entrevista"}
        </button>

        <div className="mt-5 rounded-2xl bg-[#25D366]/[0.08] p-4 text-center">
          <p className="text-xs leading-5 text-black/65">Não ficou confortável com a proposta? Fale com a equipe Ajisai antes de decidir.</p>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={registrarFalarAjisai}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#1ebe5a]"
          >
            Falar com a Ajisai no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
