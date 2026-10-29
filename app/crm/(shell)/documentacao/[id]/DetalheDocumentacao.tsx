"use client";

// Ficha do processo no CRM de Documentação — redesenho (Wilson, 29/out/2026):
// topo (cliente, serviço, etapa) → pendência e próxima ação em destaque →
// documentos e checklist do serviço, dados do pedido e observações à
// esquerda; histórico, comercial/pagamento, contato e portal à direita.

import { useCallback, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ETAPAS_DOC, FLUXO_DOC, GRUPOS_FLUXO, QUEM_PENDENCIA, SAIDAS_DOC, etapaDoc, pendenciaDoc, servicoDoc, type EtapaDoc, type PagamentoDoc, type ProcessoDoc } from "@/lib/crm/documentacao";
import { adicionarNotaDoc, mudarEtapaDoc, salvarDadosDoc } from "../../../documentacaoActions";
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";
import { AZUL, BadgeEtapaDoc, detalhePedido } from "../ListaDocumentacao";
import { DOC_COMPROVANTE, MAX_PESSOAS_FICHA, documentosServico, linhasFichaDoc, parseFichaDoc, urlPortal } from "@/app/documentacao/processo";

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "w-full rounded-xl border border-[#EAE2DB] bg-white px-3.5 py-2.5 text-base text-[#25211E] outline-none focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/20";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#6B635D]";
const FUSO = "America/Sao_Paulo";
const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
const dataCurta = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO }) : "—");
const brl = (v: number | null) => (v == null ? "Não calculado" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

const semAssinatura = () => () => {};
function lerVoltar() {
  try {
    return window.sessionStorage.getItem("crm-documentacao-lista") || "/crm/documentacao";
  } catch {
    return "/crm/documentacao";
  }
}

// Ação principal de cada etapa (avança uma casa no fluxo).
const PROXIMA: Partial<Record<EtapaDoc, { etapa: EtapaDoc; rotulo: string; ajuda: string }>> = {
  novo: { etapa: "em_analise", rotulo: "Iniciar análise", ajuda: "Confira as respostas do cadastro e os critérios eliminatórios." },
  em_analise: { etapa: "pre_aprovado", rotulo: "Pré-aprovar e liberar contrato", ajuda: "Informe o valor final antes. O contrato aparece no portal do cliente e ele recebe um e-mail. Se não atende, use “Mudar etapa”." },
  pre_aprovado: { etapa: "contrato_aceito", rotulo: "Marcar contrato aceito (manual)", ajuda: "Normalmente o cliente aceita sozinho no portal. Use só se o aceite foi feito fora do site." },
  contrato_aceito: { etapa: "contratado", rotulo: "Confirmar pagamento (manual)", ajuda: "O pagamento pela Stone avança sozinho. Use só se o cliente pagou por fora (ex.: transferência no Japão)." },
  contratado: { etapa: "documentacao", rotulo: "Lista de documentos enviada", ajuda: "Quando o cliente receber a lista do que reunir." },
  documentacao: { etapa: "protocolado", rotulo: "Marcar como protocolado", ajuda: "Entrada no consulado, na imigração ou, no pet, envio da sorologia/Import Permit." },
  protocolado: { etapa: "concluido", rotulo: "Concluir (entregue ao cliente)", ajuda: "Visto, certificado ou CVI entregues. Se as autoridades negarem, use “Mudar etapa”." },
};

function Card({ titulo, acao, children, id }: { titulo: string; cor?: string; acao?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={`rounded-2xl border border-[#EAE2DB] bg-white p-5 ${SOMBRA}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-[#25211E]">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Linhas({ itens, larguraRotulo = "9rem" }: { itens: [string, React.ReactNode][]; larguraRotulo?: string }) {
  return (
    <dl className="divide-y divide-[#F2ECE6] text-sm">
      {itens.map(([k, v], i) => (
        <div key={`${k}-${i}`} className="grid gap-1 py-2 sm:gap-3" style={{ gridTemplateColumns: `minmax(0,${larguraRotulo}) minmax(0,1fr)` }}>
          <dt className="text-[#6B635D]">{k}</dt>
          <dd className="min-w-0 break-words text-[#25211E]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const BOTAO_LINK = "rounded-lg px-2.5 py-1 text-[13px] font-medium hover:bg-[#24476B]/10";

export function DetalheDocumentacao({ processo: p, pagamentos = [] }: { processo: ProcessoDoc; pagamentos?: PagamentoDoc[] }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [painel, setPainel] = useState<null | { tipo: "etapa"; para?: EtapaDoc } | { tipo: "dados" }>(null);
  const fechar = useCallback(() => setPainel(null), []);
  const concluido = (t: string) => {
    setAviso({ ok: true, texto: t });
    router.refresh();
  };
  const voltar = useSyncExternalStore(semAssinatura, lerVoltar, () => "/crm/documentacao");

  const prox = PROXIMA[p.etapa];
  const saiu = SAIDAS_DOC.includes(p.etapa);
  const servico = servicoDoc(p.servico);
  const pend = pendenciaDoc(p);
  const det = detalhePedido(p);
  const idx = FLUXO_DOC.indexOf(p.etapa);
  const grupoAtual = GRUPOS_FLUXO.find((g) => g.etapas.includes(p.etapa));

  return (
    <div className="space-y-5">
      {/* Topo: cliente, serviço e etapa */}
      <div>
        <Link href={voltar} className="text-[13px] text-[#6B635D] hover:text-[#24476B]">
          ← Processos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[#25211E]" style={{ fontSize: 26, fontWeight: 600 }}>
              {p.nome}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#6B635D]">
              <span className="font-medium text-[#25211E]">{servico.label}</span>
              <span aria-hidden="true">·</span>
              <BadgeEtapaDoc etapa={p.etapa} />
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">#{p.id.slice(0, 8).toUpperCase()}</span>
              {det && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{det}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPainel({ tipo: "etapa" })} className="rounded-xl border border-[#EAE2DB] bg-white px-4 py-2.5 text-sm font-medium text-[#25211E] hover:border-[#24476B]/50">
              Mudar etapa
            </button>
            {!saiu && (
              <button type="button" onClick={() => setPainel({ tipo: "etapa", para: "cancelado" })} className="rounded-xl border border-[#EAE2DB] bg-white px-4 py-2.5 text-sm font-medium text-[#6B635D] hover:border-[#B42318]/40 hover:text-[#B42318]">
                Encerrar processo
              </button>
            )}
          </div>
        </div>
      </div>

      {aviso && (
        <p role="status" className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${aviso.ok ? "border-[#27675B]/20 bg-[#EEF6F3] text-[#1F5248]" : "border-[#B42318]/20 bg-[#FDECEA] text-[#B42318]"}`}>
          {aviso.texto}
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)} className="crm-livre text-lg leading-none">
            ×
          </button>
        </p>
      )}

      {/* Pendência e próxima ação em destaque */}
      <section className={`rounded-2xl border border-[#24476B]/20 bg-[#F3F6FA] p-5 ${SOMBRA}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#24476B]">
              {saiu ? "Processo encerrado" : `Pendência${QUEM_PENDENCIA[pend.quem] ? ` · ${QUEM_PENDENCIA[pend.quem]}` : ""}`}
            </p>
            <p className="mt-1 text-[17px] font-semibold text-[#25211E]">{pend.texto}</p>
            {prox && <p className="mt-1 text-[13px] text-[#55606B]">{prox.ajuda}</p>}
          </div>
          {prox && (
            <button type="button" onClick={() => setPainel({ tipo: "etapa", para: prox.etapa })} className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:brightness-110" style={{ backgroundColor: AZUL }}>
              {prox.rotulo}
            </button>
          )}
        </div>
        {!saiu && grupoAtual && (
          <ol className="mt-4 flex flex-wrap items-center gap-1 border-t border-[#24476B]/10 pt-3 text-[12px]">
            {FLUXO_DOC.map((f, i) => {
              const feito = i < idx;
              const atual = i === idx;
              return (
                <li key={f} className="flex items-center gap-1">
                  <span className={`rounded-md px-2 py-0.5 ${atual ? "font-semibold text-white" : feito ? "text-[#25211E]" : "text-[#9AA3AD]"}`} style={atual ? { backgroundColor: AZUL } : undefined}>
                    {feito && "✓ "}
                    {etapaDoc(f).label}
                  </span>
                  {i < FLUXO_DOC.length - 1 && <span className="text-[#C3CBD4]" aria-hidden="true">›</span>}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <DocumentosChecklist p={p} />
          <DadosPedido p={p} />
          <Observacoes processo={p} onSalvo={concluido} />
        </div>
        <div className="min-w-0 space-y-5">
          <HistoricoEtapas p={p} pagamentos={pagamentos} />
          <Comercial p={p} pagamentos={pagamentos} onEditar={() => setPainel({ tipo: "dados" })} />
          <Card titulo="Contato" acao={<button type="button" onClick={() => setPainel({ tipo: "dados" })} className={BOTAO_LINK} style={{ color: AZUL }}>Editar</button>}>
            <Linhas
              itens={[
                ["E-mail", p.email ? <a key="e" href={`mailto:${p.email}`} className="hover:underline" style={{ color: AZUL }}>{p.email}</a> : "Não informado"],
                ["WhatsApp", p.telefone ? <a key="t" href={`https://wa.me/${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="tabular-nums hover:underline" style={{ color: AZUL }}>{p.telefone} ↗</a> : "Não informado"],
                ["Responsável", <span key="r" className="text-[#9A918A]">Não definido</span>],
                ["Origem", [p.canal, p.canal_detalhe].filter(Boolean).join(" · ") || "Não informada"],
              ]}
            />
          </Card>
          <LinkPortal p={p} />
        </div>
      </div>

      {painel?.tipo === "etapa" && <PainelEtapa processo={p} para={painel.para} onFechar={fechar} onSalvo={concluido} />}
      {painel?.tipo === "dados" && <PainelDados processo={p} onFechar={fechar} onSalvo={concluido} />}
    </div>
  );
}

/** Documentos e checklist do serviço — a lista vem de documentosServico (mesmas regras do portal). */
function DocumentosChecklist({ p }: { p: ProcessoDoc }) {
  const docs = Array.isArray(p.documentos) ? p.documentos : [];
  const tipos = documentosServico(p.servico);
  const extras = docs.filter((d) => !tipos.some((t) => t.id === d.tipo));
  const rotuloDoc = (tipo: string) => (tipo === DOC_COMPROVANTE ? "Comprovante de pagamento" : tipos.find((t) => t.id === tipo)?.rotulo ?? tipo);
  const obrig = tipos.filter((t) => t.obrigatorio);
  const ok = obrig.filter((t) => docs.some((d) => d.tipo === t.id)).length;
  const Arquivo = ({ d }: { d: (typeof docs)[number] }) => (
    <li className="flex items-center justify-between gap-3 py-1 text-[13px]">
      <span className="min-w-0 truncate text-[#25211E]">{d.nome}</span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="text-[#9A918A]">{dataCurta(d.enviado_em)}</span>
        <a href={`/crm/documentacao/arquivo?path=${encodeURIComponent(d.path)}`} target="_blank" rel="noopener" className="font-medium hover:underline" style={{ color: AZUL }}>Abrir</a>
      </span>
    </li>
  );
  return (
    <Card titulo="Documentos e checklist" acao={<span className="text-[13px] tabular-nums text-[#6B635D]">{ok}/{obrig.length} obrigatórios</span>}>
      <ul className="divide-y divide-[#F2ECE6]">
        {tipos.map((t) => {
          const deste = docs.filter((d) => d.tipo === t.id);
          const feito = deste.length > 0;
          return (
            <li key={t.id} className="py-2.5">
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${feito ? "bg-[#E9F4EE] text-[#23704F]" : "border border-[#DCD3CA] text-transparent"}`} aria-hidden="true">✓</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#25211E]">
                    {t.rotulo}
                    {!t.obrigatorio && <span className="text-[12px] text-[#9A918A]"> · opcional</span>}
                    {t.obrigatorio && !feito && <span className="text-[12px] text-[#93703D]"> · pendente</span>}
                  </p>
                  {deste.length > 0 && <ul className="mt-1">{deste.map((d) => <Arquivo key={d.id} d={d} />)}</ul>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {extras.length > 0 && (
        <div className="mt-2 border-t border-[#F2ECE6] pt-2">
          {extras.map((d) => (
            <div key={d.id}>
              <p className="text-[12px] text-[#6B635D]">{rotuloDoc(d.tipo)}</p>
              <ul><Arquivo d={d} /></ul>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[13px] text-[#6B635D]">
        Ficha completa: {p.ficha_enviada_em ? `enviada em ${dataHora(p.ficha_enviada_em)}` : p.ficha ? "rascunho em andamento" : "ainda não iniciada pelo cliente"}
      </p>
    </Card>
  );
}

/** Dados específicos do pedido: cadastro inicial (pré-análise) e ficha completa. */
function DadosPedido({ p }: { p: ProcessoDoc }) {
  const ficha = p.ficha ? linhasFichaDoc(p.servico, parseFichaDoc(p.servico, p.ficha, MAX_PESSOAS_FICHA)) : [];
  return (
    <Card titulo="Dados do pedido">
      <details open className="group">
        <summary className="cursor-pointer list-none text-[13px] font-semibold uppercase tracking-[0.06em] text-[#8A8079]">Cadastro inicial (pré-análise) <span className="group-open:hidden">+</span></summary>
        <div className="mt-2"><Linhas larguraRotulo="20rem" itens={p.respostas.map(([k, v]) => [k, v] as [string, React.ReactNode])} /></div>
      </details>
      {ficha.length > 0 && (
        <details className="group mt-4 border-t border-[#F2ECE6] pt-3">
          <summary className="cursor-pointer list-none text-[13px] font-semibold uppercase tracking-[0.06em] text-[#8A8079]">
            {p.ficha_enviada_em ? "Ficha completa" : "Ficha completa (rascunho)"} <span className="group-open:hidden">+</span>
          </summary>
          <div className="mt-2 space-y-4">
            {ficha.map((b) => (
              <div key={b.titulo}>
                <p className="mb-1 text-[13px] font-semibold text-[#25211E]">{b.titulo}</p>
                <Linhas larguraRotulo="16rem" itens={b.linhas.map(([k, v]) => [k, v] as [string, React.ReactNode])} />
              </div>
            ))}
          </div>
        </details>
      )}
      <details className="group mt-4 border-t border-[#F2ECE6] pt-3">
        <summary className="cursor-pointer list-none text-[13px] font-semibold uppercase tracking-[0.06em] text-[#8A8079]">Aceite dos termos no cadastro <span className="group-open:hidden">+</span></summary>
        <div className="mt-2">
          <Linhas
            itens={[
              ["Versão", p.termos_versao ?? "Não informada"],
              ["Aceito em", dataHora(p.termos_aceitos_em)],
              ["IP", p.checkout_ip ?? "Não identificado"],
              ["Itens aceitos", p.aceites.length ? <ul key="a" className="list-disc space-y-1 pl-4">{p.aceites.map((a) => <li key={a}>{a}</li>)}</ul> : "Nenhum"],
            ]}
          />
        </div>
      </details>
    </Card>
  );
}

/** Marcos registrados + mudanças de etapa, em ordem. */
function HistoricoEtapas({ p, pagamentos }: { p: ProcessoDoc; pagamentos: PagamentoDoc[] }) {
  const marcos: [string, string | null][] = [
    ["Cadastro recebido", p.created_at],
    ["Ficha e documentos enviados", p.ficha_enviada_em],
    ["Pré-aprovado — contrato liberado", p.liberado_contrato_em],
    ["Contrato aceito pelo cliente", p.contrato_aceito_em],
    ...pagamentos.filter((g) => g.status === "pago").map((g) => [`Pagamento confirmado${pagamentos.some((x) => x.parcela === 2) || p.servico === "elegibilidade" ? ` — parcela ${g.parcela}` : ""}`, g.pago_em] as [string, string | null]),
    ["Protocolado", p.protocolado_em],
    ["Concluído — entregue", p.concluido_em],
  ];
  const registrados = marcos.filter(([, d]) => d).sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  const etapas = p.historico.filter((e) => e.tipo === "etapa").reverse();
  return (
    <Card titulo="Histórico">
      <ol className="space-y-2">
        {registrados.map(([t, d]) => (
          <li key={t} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[#25211E]">{t}</span>
            <span className="shrink-0 text-[13px] tabular-nums text-[#6B635D]">{dataHora(d)}</span>
          </li>
        ))}
      </ol>
      {saidaInfo(p)}
      {etapas.length > 0 && (
        <details className="mt-3 border-t border-[#F2ECE6] pt-3">
          <summary className="cursor-pointer text-[13px] font-medium" style={{ color: AZUL }}>Mudanças de etapa ({etapas.length})</summary>
          <ol className="mt-2 space-y-2">
            {etapas.map((ev, i) => (
              <li key={i} className="rounded-xl bg-[#F8F5F2] px-3 py-2 text-[13px]">
                <p className="text-[#6B635D]">{dataHora(ev.em)} · {ev.por}</p>
                <p className="font-medium text-[#25211E]">
                  {etapaDoc(ev.de ?? "").label} → {etapaDoc(ev.para ?? "").label}
                  {ev.texto && <span className="font-normal text-[#6B635D]"> — {ev.texto}</span>}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </Card>
  );
}

function saidaInfo(p: ProcessoDoc) {
  if (!SAIDAS_DOC.includes(p.etapa)) return null;
  const e = etapaDoc(p.etapa);
  return (
    <p className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: e.fundo, color: e.cor }}>
      {e.label}
      {p.motivo_saida ? ` — ${p.motivo_saida}` : " — motivo não informado"}
    </p>
  );
}

/** Informações comerciais e de pagamento. */
function Comercial({ p, pagamentos, onEditar }: { p: ProcessoDoc; pagamentos: PagamentoDoc[]; onEditar: () => void }) {
  return (
    <Card titulo="Comercial e pagamento" acao={<button type="button" onClick={onEditar} className={BOTAO_LINK} style={{ color: AZUL }}>{p.valor_final ? "Editar valor" : "Informar valor final"}</button>}>
      <Linhas
        itens={[
          ["Valor final", p.valor_final || <span key="v" className="text-[#9A918A]">Não definido</span>],
          ["Simulação no site", brl(p.valor_referencia_brl)],
          ["Contrato", p.contrato ? `Aceito por ${p.contrato.nome} em ${dataHora(p.contrato.aceito_em)}` : p.liberado_contrato_em ? "Liberado, aguardando aceite" : "Não liberado"],
        ]}
      />
      <p className="mb-1 mt-3 text-[13px] font-semibold text-[#25211E]">Pagamentos (Stone)</p>
      {pagamentos.length === 0 ? (
        <p className="text-[13px] text-[#6B635D]">Nenhum link gerado. O cliente paga pelo portal depois de aceitar o contrato.</p>
      ) : (
        <ul className="divide-y divide-[#F2ECE6] text-[13px]">
          {pagamentos.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
              <span>
                Parcela {g.parcela} · <span className="tabular-nums">{brl(g.valor_brl)}</span>
                {g.valor_jpy ? <span className="text-[#6B635D]"> (¥{Number(g.valor_jpy).toLocaleString("ja-JP")})</span> : null}
              </span>
              <span className={g.status === "pago" ? "font-medium text-[#23704F]" : "text-[#6B635D]"}>
                {g.status === "pago" ? `Pago ${dataCurta(g.pago_em)}${g.forma_pagamento ? ` · ${g.forma_pagamento === "pix" ? "Pix" : "cartão"}` : ""}` : g.status === "cancelado" ? "Link substituído" : "Link gerado, não pago"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {p.contrato && (
        <details className="mt-3 border-t border-[#F2ECE6] pt-3 text-[13px]">
          <summary className="cursor-pointer font-medium" style={{ color: AZUL }}>Registro do contrato</summary>
          <div className="mt-2">
            <Linhas
              itens={[
                ["Assinado por", `${p.contrato.nome} — CPF ${p.contrato.cpf}`],
                ["IP", p.contrato.ip ?? "—"],
                ["SHA-256", <span key="h" className="break-all font-mono text-[12px]">{p.contrato.hash}</span>],
                ["Versão", p.contrato.versao],
              ]}
            />
            <div className="mt-2 space-y-2 text-[#25211E]">{[p.contrato.texto.titulo, ...p.contrato.texto.clausulas].map((c, i) => <p key={i}>{c}</p>)}</div>
          </div>
        </details>
      )}
    </Card>
  );
}

function LinkPortal({ p }: { p: ProcessoDoc }) {
  const [copiado, setCopiado] = useState(false);
  const link = p.acesso_token ? `https://www.alpinea.io${urlPortal(p.id, p.acesso_token)}` : null;
  return (
    <Card titulo="Portal do cliente">
      {link ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-[#F8F5F2] px-3 py-2 text-[12px] text-[#25211E]">{link}</code>
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(link); setCopiado(true); }} className={BOTAO_LINK} style={{ color: AZUL }}>
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <a href={link} target="_blank" rel="noopener" className={BOTAO_LINK} style={{ color: AZUL }}>Abrir ↗</a>
        </div>
      ) : (
        <p className="text-sm text-[#6B635D]">Portal indisponível para este processo.</p>
      )}
    </Card>
  );
}

/** Observações da equipe (notas e edições) com campo para nova nota. */
function Observacoes({ processo: p, onSalvo }: { processo: ProcessoDoc; onSalvo: (t: string) => void }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const eventos = p.historico.filter((e) => e.tipo !== "etapa").reverse();
  return (
    <Card titulo="Observações">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pendente) return;
          iniciar(async () => {
            const r = await adicionarNotaDoc(p.id, texto);
            if (r.ok) {
              setTexto("");
              setErro(null);
              onSalvo(r.mensagem);
            } else setErro(r.erro);
          });
        }}
        className="mb-3 space-y-2"
      >
        <label htmlFor="nota-doc" className="sr-only">Nova observação</label>
        <textarea id="nota-doc" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={2000} placeholder="Registrar uma observação (ex.: garantidor confirmou holerites)…" className={CAMPO} />
        {erro && <p className="text-[13px] text-[#B42318]">{erro}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pendente || !texto.trim()} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: AZUL }}>
            {pendente && <Spinner />}
            Registrar
          </button>
        </div>
      </form>
      {eventos.length === 0 ? (
        <p className="text-sm text-[#6B635D]">Nenhuma observação ainda.</p>
      ) : (
        <ol className="space-y-2">
          {eventos.map((ev, i) => (
            <li key={i} className="rounded-xl bg-[#F8F5F2] px-3 py-2 text-sm">
              <p className="text-[12px] text-[#6B635D]">{dataHora(ev.em)} · {ev.por}</p>
              <p className="whitespace-pre-wrap text-[#25211E]">{ev.texto}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function PainelEtapa({ processo: p, para, onFechar, onSalvo }: { processo: ProcessoDoc; para?: EtapaDoc; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [escolha, setEscolha] = useState<EtapaDoc>(para ?? p.etapa);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const saida = SAIDAS_DOC.includes(escolha);
  return (
    <Painel
      titulo={para === "cancelado" ? "Encerrar processo" : "Mudar etapa"}
      subtitulo={`Agora: ${etapaDoc(p.etapa).label}`}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Voltar
          </button>
          <button
            type="button"
            className={saida ? BOTAO_PERIGO : BOTAO_PRIMARIO}
            disabled={pendente || escolha === p.etapa}
            onClick={() =>
              iniciar(async () => {
                const r = await mudarEtapaDoc(p.id, escolha, motivo);
                if (r.ok) {
                  onSalvo(r.mensagem);
                  onFechar();
                } else setErro(r.erro);
              })
            }
          >
            {pendente && <Spinner />}
            Confirmar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset className="space-y-2">
          <legend className={LABEL}>Nova etapa</legend>
          {(para === "cancelado" ? ETAPAS_DOC.filter((e) => SAIDAS_DOC.includes(e.valor)) : ETAPAS_DOC).map((e) => (
            <label key={e.valor} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${escolha === e.valor ? "border-[#24476B] bg-[#F3F6FA]" : "border-[#EAE2DB]"}`}>
              <input type="radio" name="etapa" value={e.valor} checked={escolha === e.valor} onChange={() => setEscolha(e.valor)} className="accent-[#24476B]" />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.cor }} aria-hidden="true" />
              <span className="text-[#25211E]">{e.label}</span>
              {e.valor === p.etapa && <span className="ml-auto text-[13px] text-[#6B635D]">atual</span>}
            </label>
          ))}
        </fieldset>
        {saida && (
          <div>
            <label htmlFor="motivo" className={LABEL}>
              Motivo (opcional)
            </label>
            <input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} placeholder="Ex.: garantidor não é parente de 1º grau" className={CAMPO} />
            <p className="mt-2 text-[13px] text-[#6B635D]">Lembrete: o serviço não é reembolsável. Única exceção — pet de raça não aceita declarada corretamente, antes do início: 80%.</p>
          </div>
        )}
        {erro && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">{erro}</p>}
      </div>
    </Painel>
  );
}

function PainelDados({ processo: p, onFechar, onSalvo }: { processo: ProcessoDoc; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [valor, setValor] = useState(p.valor_total != null ? String(p.valor_total).replace(".", ",") : "");
  const [moeda, setMoeda] = useState<"BRL" | "JPY">(p.valor_moeda ?? (p.servico === "elegibilidade" ? "JPY" : "BRL"));
  const [email, setEmail] = useState(p.email ?? "");
  const [telefone, setTelefone] = useState(p.telefone ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  return (
    <Painel
      titulo="Editar dados do processo"
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
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                const r = await salvarDadosDoc(p.id, { valor_total: valor, valor_moeda: moeda, email, telefone });
                if (r.ok) {
                  onSalvo(r.mensagem);
                  onFechar();
                } else setErro(r.erro);
              })
            }
          >
            {pendente && <Spinner />}
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="valor" className={LABEL}>
            Valor final fechado (total do processo)
          </label>
          <div className="flex gap-2">
            <select aria-label="Moeda" value={moeda} onChange={(e) => setMoeda(e.target.value === "JPY" ? "JPY" : "BRL")} className={`${CAMPO} w-28`} disabled={Boolean(p.contrato_aceito_em)}>
              <option value="BRL">R$</option>
              <option value="JPY">¥</option>
            </select>
            <input id="valor" value={valor} inputMode="decimal" onChange={(e) => setValor(e.target.value)} maxLength={20} placeholder={moeda === "JPY" ? "149000" : "1980,00"} className={CAMPO} disabled={Boolean(p.contrato_aceito_em)} />
          </div>
          <p className="mt-1.5 text-[13px] text-[#6B635D]">
            {p.contrato_aceito_em
              ? "Contrato já aceito com este valor — não pode mais ser alterado."
              : moeda === "JPY"
                ? "Em ienes: a Stone cobra em reais pela PTAX do dia de cada pagamento" + (p.servico === "elegibilidade" ? ", em 2 parcelas de 50%." : ".")
                : "Em reais: cobrado de uma vez pela Stone (cartão ou Pix)."}
          </p>
        </div>
        <div>
          <label htmlFor="em" className={LABEL}>
            E-mail
          </label>
          <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="tel" className={LABEL}>
            WhatsApp
          </label>
          <input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={30} className={CAMPO} />
        </div>
        <p className="text-[13px] text-[#6B635D]">As respostas do cadastro e o aceite dos termos vêm do site e não são editados aqui.</p>
        {erro && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">{erro}</p>}
      </div>
    </Painel>
  );
}
