"use client";

// Portal do processo de Documentação (Wilson, 29/out/2026) — o cliente segue
// sozinho pelo site, como nas etapas de /empregos: ficha completa e
// documentos → análise → contrato (aceite eletrônico) → pagamento →
// acompanhamento. O servidor reconfere cada passo.

import { useEffect, useMemo, useRef, useState } from "react";
import { CabecalhoAjisai, Pilulas, VERDE, display } from "../../componentes";
import { Campo, classeInput, mascararWhatsapp } from "../../../components/transporte/compartilhado";
import { formatarCpf } from "../../../lib/fichaCadastral";
import { WHATSAPP_NUMBER } from "../../../produtos/page";
import type { ServicoDoc } from "../../conteudo";
import {
  DOC_COMPROVANTE, PASSOS_PORTAL, TAMANHO_MAX_ARQUIVO, documentosServico, errosFicha, estruturaFicha,
  type CampoFicha, type FichaDoc, type PassoPortal,
} from "../../processo";

export type DocPublico = { id: string; tipo: string; nome: string; tamanho: number; enviado_em: string };
export type Contrato = { titulo: string; clausulas: string[] };

const NOME_SERVICO: Record<ServicoDoc, string> = { visto: "Visto específico", elegibilidade: "Certificado de Elegibilidade", pet: "Exportação de pet" };
const ETAPA_ANDAMENTO: Record<string, string> = {
  contratado: "Pagamento confirmado. A equipe está preparando a lista de documentos e os próximos passos.",
  documentacao: "Estamos reunindo e conferindo a documentação. Se precisarmos de algo, avisamos pelo WhatsApp.",
  protocolado: "Pedido protocolado. Agora o prazo depende do órgão responsável — avisamos assim que houver resposta.",
};

export type InfoPagamento = {
  devida: number | null;
  totalParcelas: number;
  pagas: { parcela: number; valorBRL: number; pagoEm: string | null }[];
  online: boolean;
  moeda: "BRL" | "JPY";
  voltouDoCheckout: boolean;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Botão de pagamento pela Stone — mesmo checkout hospedado de /produtos
// (cartão parcelado ou Pix). O valor é calculado no servidor na hora.
export function PagarStone({ id, token, info, zap }: { id: string; token: string; info: InfoPagamento; zap: string }) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  if (!info.devida) return null;
  const rotuloParcela = info.totalParcelas > 1 ? ` — parcela ${info.devida} de ${info.totalParcelas} (50%)` : "";
  async function pagar() {
    setErro(null);
    setAbrindo(true);
    const r = await fetch("/api/documentacao-processo/pagamento", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok || !d?.checkoutUrl) {
      setErro(d?.error || "Não foi possível abrir o pagamento agora. Tente novamente.");
      setAbrindo(false);
      return;
    }
    window.location.href = d.checkoutUrl;
  }
  if (!info.online) {
    return (
      <div className="text-sm leading-6 text-black/65">
        O pagamento online está indisponível agora. <a href={zap} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: VERDE }}>Fale com a equipe pelo WhatsApp</a>.
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm leading-6 text-black/65">
        Pagamento seguro pela Stone{rotuloParcela}: cartão de crédito (com parcelamento) ou Pix.
        {info.moeda === "JPY" && " O valor em reais é calculado pela PTAX do dia, no momento em que você abre o pagamento."}
      </p>
      <button type="button" onClick={() => void pagar()} disabled={abrindo} className="mt-4 flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50" style={{ background: VERDE }}>
        {abrindo ? "Abrindo a Stone…" : "Pagar agora"}
      </button>
      {erro && <p role="alert" className="mt-3 text-xs text-red-600">{erro}</p>}
      <p className="mt-3 text-xs text-black/45">Os dados do cartão são digitados na página da Stone, nunca no nosso site. A confirmação chega aqui e por e-mail automaticamente.</p>
    </div>
  );
}

export function Bloco({ titulo, children, sub }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
      <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">{titulo}</p>
      {sub && <p className="mt-2 text-sm leading-6 text-black/60">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function LinhaDoTempo({ passo }: { passo: PassoPortal | "encerrado" }) {
  const idx = PASSOS_PORTAL.findIndex((p) => p.id === passo);
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {PASSOS_PORTAL.map((p, i) => {
        const feito = idx > i || passo === "concluido";
        const atual = idx === i && passo !== "concluido";
        return (
          <li key={p.id} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px]" style={{ background: atual ? `${VERDE}14` : feito ? "#F6F7F5" : "transparent", color: atual ? VERDE : feito ? "#111" : "#9a9a9a" }}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${atual ? "text-white" : feito ? "text-white" : "border border-black/15"}`} style={atual || feito ? { background: atual ? VERDE : "#5f8a7c" } : undefined}>
              {feito ? "✓" : i + 1}
            </span>
            <span className={atual ? "font-semibold" : ""}>{p.titulo}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function CampoDinamico({ c, valor, onChange, erro }: { c: CampoFicha; valor: string; onChange: (v: string) => void; erro?: string | null }) {
  const rotulo = c.opcional ? `${c.rotulo} (opcional)` : c.rotulo;
  if (c.tipo === "opcoes") {
    return (
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">{rotulo}</span>
        <Pilulas opcoes={c.opcoes ?? []} valor={valor} onChange={onChange} nome={c.rotulo} />
        {erro ? <span className="text-xs text-red-600">{erro}</span> : c.ajuda ? <span className="text-xs text-black/50">{c.ajuda}</span> : null}
      </div>
    );
  }
  if (c.tipo === "textarea") {
    return (
      <div className="sm:col-span-2">
        <Campo rotulo={rotulo} erro={erro} ajuda={c.ajuda}>
          <textarea rows={3} value={valor} placeholder={c.placeholder} onChange={(e) => onChange(e.target.value)} className={`${classeInput(Boolean(erro))} h-auto py-3`} />
        </Campo>
      </div>
    );
  }
  return (
    <Campo rotulo={rotulo} erro={erro} ajuda={c.ajuda}>
      <input
        type={c.tipo === "data" ? "date" : c.tipo === "tel" ? "tel" : "text"}
        inputMode={c.tipo === "cpf" ? "numeric" : undefined}
        value={valor}
        placeholder={c.placeholder ?? (c.tipo === "cpf" ? "000.000.000-00" : undefined)}
        onChange={(e) => onChange(c.tipo === "cpf" ? formatarCpf(e.target.value) : c.tipo === "tel" ? mascararWhatsapp(e.target.value) : e.target.value)}
        className={classeInput(Boolean(erro))}
      />
    </Campo>
  );
}

export function Documentos({
  id, token, servico, docs, setDocs, tipos, podeRemover,
}: {
  id: string; token: string; servico: ServicoDoc; docs: DocPublico[]; setDocs: (d: DocPublico[]) => void;
  tipos: { id: string; rotulo: string; ajuda?: string; obrigatorio: boolean }[]; podeRemover: boolean;
}) {
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  void servico;

  async function enviar(tipo: string, arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErro(null);
    // Um por vez — o servidor regrava a lista de documentos a cada envio.
    for (const arq of Array.from(arquivos)) {
      if (arq.size > TAMANHO_MAX_ARQUIVO) {
        setErro(`"${arq.name}" passa de 10 MB.`);
        continue;
      }
      setEnviando(`${tipo}:${arq.name}`);
      const f = new FormData();
      f.append("id", id);
      f.append("token", token);
      f.append("tipo", tipo);
      f.append("arquivo", arq);
      const r = await fetch("/api/documentacao-processo/arquivo", { method: "POST", body: f }).catch(() => null);
      const d = await r?.json().catch(() => ({}));
      if (!r?.ok) setErro(d?.error || `Não foi possível enviar "${arq.name}".`);
      else setDocs(d.documentos);
    }
    setEnviando(null);
  }

  async function remover(docId: string) {
    const r = await fetch("/api/documentacao-processo/arquivo", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token, docId }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) setErro(d?.error || "Não foi possível remover.");
    else setDocs(d.documentos);
  }

  return (
    <div className="space-y-4">
      {tipos.map((t) => {
        const deste = docs.filter((d) => d.tipo === t.id);
        return (
          <div key={t.id} className="rounded-xl border border-black/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-black">
                  {t.rotulo} {t.obrigatorio ? <span className="text-red-600">*</span> : <span className="text-xs font-normal text-black/45">(opcional)</span>}
                </p>
                {t.ajuda && <p className="mt-1 text-xs leading-5 text-black/50">{t.ajuda}</p>}
              </div>
              <label className="inline-flex min-h-[40px] cursor-pointer items-center rounded-full border px-4 text-xs font-medium" style={{ borderColor: VERDE, color: VERDE }}>
                {enviando?.startsWith(`${t.id}:`) ? "Enviando…" : deste.length ? "Adicionar arquivo" : "Enviar arquivo"}
                <input type="file" multiple accept=".pdf,image/*" className="sr-only" disabled={Boolean(enviando)} onChange={(e) => { void enviar(t.id, e.target.files); e.target.value = ""; }} />
              </label>
            </div>
            {deste.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {deste.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#F6F7F5] px-3 py-2 text-xs text-black/70">
                    <span className="truncate">✓ {d.nome}</span>
                    {podeRemover && <button type="button" onClick={() => void remover(d.id)} className="shrink-0 text-red-600 hover:underline">Remover</button>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {erro && <p role="alert" className="text-xs text-red-600">{erro}</p>}
      <p className="text-xs text-black/45">PDF ou foto (JPG, PNG, WEBP, HEIC), até 10 MB por arquivo. Fotos de celular servem, desde que legíveis.</p>
    </div>
  );
}

function Ficha({ id, token, servico, pessoas, fichaInicial, docs, onEnviada }: { id: string; token: string; servico: ServicoDoc; pessoas: number; fichaInicial: FichaDoc; docs: DocPublico[]; onEnviada: () => void }) {
  const est = useMemo(() => estruturaFicha(servico), [servico]);
  const [ficha, setFicha] = useState<FichaDoc>(() => {
    const ps = Array.from({ length: est.porPessoa ? pessoas : 0 }, (_, i) => ({ ...(fichaInicial.pessoas[i] ?? {}), ...(i === 0 && !fichaInicial.pessoas[0]?.relacao ? { relacao: "Titular" } : {}) }));
    return { pessoas: ps, dados: { ...fichaInicial.dados } };
  });
  const [tentou, setTentou] = useState(false);
  const [status, setStatus] = useState<"" | "salvando" | "salvo" | "enviando">("");
  const [erro, setErro] = useState<string | null>(null);
  const erros = errosFicha(servico, ficha, est.porPessoa ? pessoas : 0);
  const faltamDocs = documentosServico(servico).filter((t) => t.obrigatorio && !docs.some((d) => d.tipo === t.id));
  const pendentes = Object.keys(erros).length + faltamDocs.length;

  // Rascunho no servidor a cada 2 s parado — dá para continuar em outro aparelho pelo mesmo link.
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setStatus("salvando");
      const r = await fetch("/api/documentacao-processo/ficha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token, ficha, enviar: false }) }).catch(() => null);
      setStatus(r?.ok ? "salvo" : "");
    }, 2000);
    return () => clearTimeout(t);
  }, [ficha, id, token]);

  const mostrar = (k: string) => (tentou ? erros[k] : null);
  const setPessoa = (i: number, campo: string, v: string) => setFicha((f) => ({ ...f, pessoas: f.pessoas.map((p, j) => (j === i ? { ...p, [campo]: v } : p)) }));
  const setDado = (campo: string, v: string) => setFicha((f) => ({ ...f, dados: { ...f.dados, [campo]: v } }));

  async function enviar() {
    setTentou(true);
    setErro(null);
    if (pendentes > 0) return;
    setStatus("enviando");
    const r = await fetch("/api/documentacao-processo/ficha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token, ficha, enviar: true }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) {
      setErro(d?.error || "Não foi possível enviar agora.");
      setStatus("");
      return;
    }
    onEnviada();
  }

  return (
    <div className="space-y-5">
      {est.porPessoa &&
        ficha.pessoas.map((p, i) => (
          <Bloco key={i} titulo={`Solicitante ${i + 1}${p.nome ? ` — ${p.nome}` : ""}`}>
            <div className="grid gap-5 sm:grid-cols-2">
              {est.porPessoa!.map((c) => (
                <CampoDinamico key={c.id} c={c} valor={p[c.id] ?? ""} erro={mostrar(`p${i}.${c.id}`)} onChange={(v) => setPessoa(i, c.id, v)} />
              ))}
            </div>
          </Bloco>
        ))}
      {tentou && erros.titular && <p className="text-xs text-red-600">{erros.titular}</p>}
      {est.grupos.map((g) => (
        <Bloco key={g.id} titulo={g.titulo}>
          <div className="grid gap-5 sm:grid-cols-2">
            {g.campos.map((c) => (
              <CampoDinamico key={c.id} c={c} valor={ficha.dados[c.id] ?? ""} erro={mostrar(`dados.${c.id}`)} onChange={(v) => setDado(c.id, v)} />
            ))}
          </div>
        </Bloco>
      ))}
      {tentou && faltamDocs.length > 0 && (
        <p className="rounded-xl bg-red-50 p-4 text-xs leading-5 text-red-700">Faltam documentos obrigatórios: {faltamDocs.map((d) => d.rotulo).join("; ")}.</p>
      )}
      <div className="flex flex-col items-center gap-2">
        <button type="button" onClick={() => void enviar()} disabled={status === "enviando"} className="flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50" style={{ background: VERDE }}>
          {status === "enviando" ? "Enviando…" : "Enviar ficha e documentos"}
        </button>
        {tentou && pendentes > 0 && <p className="text-xs text-red-600">Faltam {pendentes} item(ns) obrigatório(s).</p>}
        {erro && <p className="text-center text-xs text-red-600">{erro}</p>}
        <p className="text-xs text-black/45">{status === "salvando" ? "Salvando rascunho…" : status === "salvo" ? "Rascunho salvo — você pode continuar depois pelo mesmo link." : "O rascunho é salvo automaticamente."}</p>
      </div>
    </div>
  );
}

function Aceite({ id, token, contrato, valorFinal, onAceito }: { id: string; token: string; contrato: Contrato; valorFinal: string; onAceito: () => void }) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [termos, setTermos] = useState(false);
  const [garantia, setGarantia] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  async function aceitar() {
    setErro(null);
    if (!termos || !garantia || nome.trim().length < 3 || cpf.replace(/\D/g, "").length !== 11) {
      setErro("Digite nome e CPF do titular e marque as duas confirmações.");
      return;
    }
    setEnviando(true);
    const r = await fetch("/api/documentacao-processo/contrato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token, nome, cpf, aceites: ["termos", "garantia"] }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    setEnviando(false);
    if (!r?.ok) setErro(d?.error || "Não foi possível registrar o aceite.");
    else onAceito();
  }
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-white" style={{ background: VERDE }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Valor final aprovado pela equipe</p>
        <p className={`${display.className} mt-2 text-3xl`}>{valorFinal}</p>
      </div>
      <Bloco titulo={contrato.titulo}>
        <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-[#F6F7F5] p-4 text-xs leading-5 text-black/70">
          {contrato.clausulas.map((c, i) => <p key={i}>{c}</p>)}
        </div>
      </Bloco>
      <Bloco titulo="Aceite eletrônico" sub="Digite o nome completo e o CPF do titular, como estão na ficha.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome completo">
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={classeInput(false)} autoComplete="name" />
          </Campo>
          <Campo rotulo="CPF">
            <input value={cpf} inputMode="numeric" onChange={(e) => setCpf(formatarCpf(e.target.value))} className={classeInput(false)} placeholder="000.000.000-00" />
          </Campo>
        </div>
        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
            <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
            Li o contrato inteiro e aceito todas as cláusulas.
          </label>
          <label className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
            <input type="checkbox" checked={garantia} onChange={(e) => setGarantia(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
            Entendo que o pagamento e o envio dos documentos não garantem a aprovação, que a decisão é das autoridades e que o serviço não é reembolsável.
          </label>
        </div>
        {erro && <p role="alert" className="mt-4 text-xs text-red-600">{erro}</p>}
        <button type="button" onClick={() => void aceitar()} disabled={enviando} className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50" style={{ background: VERDE }}>
          {enviando ? "Registrando…" : "Aceitar contrato"}
        </button>
        <p className="mt-3 text-xs leading-5 text-black/45">O aceite fica registrado com data, hora, IP e código de integridade do texto, e uma cópia vai para o seu e-mail.</p>
      </Bloco>
    </div>
  );
}

export function PortalProcesso(props: {
  id: string; token: string; servico: ServicoDoc; nome: string; etapa: string; passo: PassoPortal | "encerrado"; pessoas: number;
  fichaInicial: FichaDoc; documentosIniciais: DocPublico[]; valorFinal: string | null; contratoPrevia: Contrato | null;
  contratoAceito: { texto: Contrato; hash: string; aceito_em: string } | null; motivoSaida: string | null;
  pagamento: InfoPagamento;
}) {
  const { id, token, servico, passo } = props;
  const [docs, setDocs] = useState<DocPublico[]>(props.documentosIniciais);
  const recarregar = () => window.location.reload();
  const tiposDocs = documentosServico(servico);
  void DOC_COMPROVANTE;
  const zap = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Sou ${props.nome} e tenho uma dúvida sobre meu processo de ${NOME_SERVICO[servico]}.`)}`;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F6F7F5] pb-16 text-black">
      <CabecalhoAjisai />
      <div className="mx-auto max-w-4xl px-5 pt-[96px] md:px-8 md:pt-[120px]">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: VERDE }}>{NOME_SERVICO[servico]}</p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium md:text-4xl`}>Olá, {props.nome.split(" ")[0]}.</h1>
        <p className="mt-3 text-sm leading-6 text-black/60">Este é o seu acesso ao processo. Guarde o link — ele é o mesmo do e-mail e funciona em qualquer aparelho.</p>
        <div className="mt-6"><LinhaDoTempo passo={passo} /></div>

        <div className="mt-8 space-y-5">
          {passo === "ficha" && (
            <>
              <Bloco titulo="Etapa 2 · Documentos" sub="Envie os arquivos abaixo. Os marcados com * são obrigatórios para enviar a ficha.">
                <Documentos id={id} token={token} servico={servico} docs={docs} setDocs={setDocs} tipos={tiposDocs} podeRemover />
              </Bloco>
              <p className="pt-2 text-[10px] uppercase tracking-[0.22em] text-black/45">Etapa 2 · Ficha completa</p>
              <Ficha id={id} token={token} servico={servico} pessoas={props.pessoas} fichaInicial={props.fichaInicial} docs={docs} onEnviada={recarregar} />
            </>
          )}

          {passo === "analise" && (
            <>
              <Bloco titulo="Em análise" sub="Recebemos sua ficha e seus documentos. A equipe confere o caso com base nas suas respostas e, se estiver tudo certo, libera aqui o contrato com o valor final. Você recebe um aviso por e-mail.">
                <p className="text-xs text-black/50">Se precisarmos de algo, falamos com você pelo WhatsApp.</p>
              </Bloco>
              <Bloco titulo="Enviar mais documentos" sub="Esqueceu algum arquivo opcional, ou o garantidor quer mandar os dele? Pode enviar por aqui.">
                <Documentos id={id} token={token} servico={servico} docs={docs} setDocs={setDocs} tipos={tiposDocs} podeRemover={false} />
              </Bloco>
            </>
          )}

          {passo === "contrato" && props.contratoPrevia && props.valorFinal && (
            <Aceite id={id} token={token} contrato={props.contratoPrevia} valorFinal={props.valorFinal} onAceito={recarregar} />
          )}

          {passo === "pagamento" && (
            <Bloco titulo="Pagamento">
              {props.valorFinal && <p className={`${display.className} mb-4 text-2xl`}>{props.valorFinal}</p>}
              {props.pagamento.voltouDoCheckout && props.pagamento.pagas.length === 0 ? (
                <p className="rounded-xl bg-[#F6F7F5] p-4 text-sm leading-6 text-black/70">
                  Recebemos você de volta da Stone. Assim que o pagamento for confirmado (no Pix, em segundos; no cartão, em alguns minutos), esta página e o seu e-mail são atualizados.
                  <button type="button" onClick={recarregar} className="ml-1 underline" style={{ color: VERDE }}>Atualizar</button>
                </p>
              ) : (
                <PagarStone id={id} token={token} info={props.pagamento} zap={zap} />
              )}
            </Bloco>
          )}

          {passo === "andamento" && (
            <>
              <Bloco titulo="Processo em andamento">
                <p className="text-sm leading-6 text-black/70">{ETAPA_ANDAMENTO[props.etapa] ?? "Seu processo está em andamento."}</p>
                {props.pagamento.pagas.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-black/55">
                    {props.pagamento.pagas.map((g) => (
                      <li key={g.parcela}>✓ {props.pagamento.totalParcelas > 1 ? `Parcela ${g.parcela}` : "Pagamento"} de {brl(g.valorBRL)} confirmado</li>
                    ))}
                  </ul>
                )}
              </Bloco>
              {props.pagamento.devida && (
                <Bloco titulo="Segunda parcela" sub="Os 50% restantes são pagos antes da entrada do pedido na imigração.">
                  <PagarStone id={id} token={token} info={props.pagamento} zap={zap} />
                </Bloco>
              )}
              <Bloco titulo="Enviar mais documentos">
                <Documentos id={id} token={token} servico={servico} docs={docs} setDocs={setDocs} tipos={tiposDocs} podeRemover={false} />
              </Bloco>
            </>
          )}

          {passo === "concluido" && (
            <Bloco titulo="Concluído">
              <p className="text-sm leading-6 text-black/70">Processo concluído. Obrigado por confiar na Ajisai!</p>
            </Bloco>
          )}

          {passo === "encerrado" && (
            <Bloco titulo="Processo encerrado">
              <p className="text-sm leading-6 text-black/70">
                {props.etapa === "nao_atende"
                  ? "Depois da análise, infelizmente o seu caso não atende aos critérios para seguirmos com o serviço."
                  : props.etapa === "negado"
                    ? "O pedido foi negado pelas autoridades."
                    : "Este processo foi encerrado."}
                {props.motivoSaida ? ` Motivo: ${props.motivoSaida}.` : ""}
              </p>
            </Bloco>
          )}

          {props.contratoAceito && (
            <details className="rounded-2xl border border-black/10 bg-white p-5">
              <summary className="cursor-pointer text-sm font-medium">Seu contrato (aceito em {new Date(props.contratoAceito.aceito_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })})</summary>
              <div className="mt-4 space-y-3 text-xs leading-5 text-black/65">
                {props.contratoAceito.texto.clausulas.map((c, i) => <p key={i}>{c}</p>)}
                <p className="break-all text-black/40">SHA-256: {props.contratoAceito.hash}</p>
              </div>
            </details>
          )}

          <p className="text-center text-xs text-black/45">
            Dúvidas? <a href={zap} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: VERDE }}>Fale com a equipe pelo WhatsApp</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
