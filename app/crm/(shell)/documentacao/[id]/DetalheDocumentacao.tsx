"use client";

// Ficha do processo no CRM de Documentação (Wilson, 29/out/2026) — mesmo
// padrão da ficha do CRM de Seguro: etapa, contato, valores, cadastro
// completo, registro do aceite dos termos e histórico com notas.

import { useCallback, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ETAPAS_DOC, FLUXO_DOC, SAIDAS_DOC, etapaDoc, servicoDoc, type EtapaDoc, type ProcessoDoc } from "@/lib/crm/documentacao";
import { adicionarNotaDoc, mudarEtapaDoc, salvarDadosDoc } from "../../../documentacaoActions";
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";
import { BadgeEtapaDoc, BadgeServicoDoc } from "../ListaDocumentacao";
import { DOC_COMPROVANTE, MAX_PESSOAS_FICHA, documentosServico, linhasFichaDoc, parseFichaDoc, urlPortal } from "@/app/documentacao/processo";

const COR = "#8A5A3C";
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "w-full rounded-xl border border-[#EAE2DB] bg-white px-3.5 py-2.5 text-base text-[#25211E] outline-none focus:border-[#8A5A3C] focus:ring-2 focus:ring-[#8A5A3C]/25";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#6B635D]";
const FUSO = "America/Sao_Paulo";
const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
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
  contrato_aceito: { etapa: "contratado", rotulo: "Confirmar pagamento", ajuda: "Confira o comprovante enviado no portal. Visto e pet: 100%. Elegibilidade: primeiros 50% (PTAX do dia)." },
  contratado: { etapa: "documentacao", rotulo: "Lista de documentos enviada", ajuda: "Quando o cliente receber a lista do que reunir." },
  documentacao: { etapa: "protocolado", rotulo: "Marcar como protocolado", ajuda: "Entrada no consulado, na imigração ou, no pet, envio da sorologia/Import Permit." },
  protocolado: { etapa: "concluido", rotulo: "Concluir (entregue ao cliente)", ajuda: "Visto, certificado ou CVI entregues. Se as autoridades negarem, use “Mudar etapa”." },
};

function Card({ titulo, cor = COR, acao, children }: { titulo: string; cor?: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-t-[3px] border-[#EAE2DB] bg-white p-5 ${SOMBRA}`} style={{ borderTopColor: cor }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 style={{ color: cor }}>{titulo}</h2>
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

export function DetalheDocumentacao({ processo: p }: { processo: ProcessoDoc }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [painel, setPainel] = useState<null | { tipo: "etapa"; para?: EtapaDoc } | { tipo: "dados" }>(null);
  const fechar = useCallback(() => setPainel(null), []);
  const concluido = (t: string) => {
    setAviso({ ok: true, texto: t });
    router.refresh();
  };
  const voltar = useSyncExternalStore(semAssinatura, lerVoltar, () => "/crm/documentacao");

  const etapa = etapaDoc(p.etapa);
  const prox = PROXIMA[p.etapa];
  const idx = FLUXO_DOC.indexOf(p.etapa);
  const saiu = SAIDAS_DOC.includes(p.etapa);
  const servico = servicoDoc(p.servico);

  return (
    <div className="space-y-6">
      <div>
        <Link href={voltar} className="text-[13px] text-[#6B635D] hover:text-[#8A5A3C]">
          ← Processos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[#25211E]" style={{ fontSize: 28, fontWeight: 600 }}>
              {p.nome}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6B635D]">
              <BadgeServicoDoc servico={p.servico} />
              <BadgeEtapaDoc etapa={p.etapa} />
              <span>Cadastro em {dataHora(p.created_at)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!saiu && (
              <button type="button" onClick={() => setPainel({ tipo: "etapa", para: "cancelado" })} className="rounded-xl border border-[#B42318]/30 bg-white px-4 py-2.5 text-sm font-medium text-[#B42318] hover:border-[#B42318]">
                Encerrar processo
              </button>
            )}
            <button type="button" onClick={() => setPainel({ tipo: "etapa" })} className="rounded-xl border border-[#EAE2DB] bg-white px-4 py-2.5 text-sm font-medium text-[#25211E] hover:border-[#8A5A3C]/50">
              Mudar etapa
            </button>
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

      {/* Destaque do serviço */}
      <section className={`rounded-2xl border border-t-[3px] p-6 ${SOMBRA}`} style={{ backgroundColor: servico.fundo, borderColor: `${servico.cor}40`, borderTopColor: servico.cor }}>
        <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: servico.cor }}>{servico.label}</p>
        <p className="mt-2 font-semibold leading-tight text-[#25211E]" style={{ fontSize: 22 }}>{p.resumo || "Sem resumo"}</p>
      </section>

      {/* Andamento */}
      <section className={`rounded-2xl border border-t-[3px] border-[#EAE2DB] bg-white p-5 ${SOMBRA}`} style={{ borderTopColor: etapa.cor }}>
        {saiu ? (
          <p className="text-sm" style={{ color: etapa.cor }}>
            {etapa.label}
            {p.motivo_saida ? ` — ${p.motivo_saida}` : ""}.
          </p>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {FLUXO_DOC.map((f, i) => {
              const e = etapaDoc(f);
              const feito = i < idx;
              const atual = i === idx;
              return (
                <li key={f} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px]" style={{ backgroundColor: atual ? e.fundo : feito ? "#F8F5F2" : "transparent", color: atual ? e.cor : feito ? "#25211E" : "#A29A93" }}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${atual ? "text-white" : feito ? "bg-[#8A5A3C]/15 text-[#8A5A3C]" : "border border-[#EAE2DB]"}`} style={atual ? { backgroundColor: e.cor } : undefined}>
                    {feito ? "✓" : i + 1}
                  </span>
                  <span className={atual ? "font-semibold" : ""}>{e.curto}</span>
                </li>
              );
            })}
          </ol>
        )}
        {prox && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2ECE6] pt-4">
            <p className="text-[13px] text-[#6B635D]">{prox.ajuda}</p>
            <button type="button" onClick={() => setPainel({ tipo: "etapa", para: prox.etapa })} className="rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:brightness-110" style={{ backgroundColor: COR }}>
              {prox.rotulo}
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          titulo="Contato"
          acao={
            <button type="button" onClick={() => setPainel({ tipo: "dados" })} className="rounded-lg px-2.5 py-1 text-[13px] font-medium hover:bg-[#F8F3EF]" style={{ color: COR }}>
              Editar
            </button>
          }
        >
          <Linhas
            itens={[
              ["Nome", p.nome],
              ["E-mail", p.email ? <a key="e" href={`mailto:${p.email}`} className="hover:underline" style={{ color: COR }}>{p.email}</a> : "Não informado"],
              ["WhatsApp", p.telefone ? <a key="t" href={`https://wa.me/${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="tabular-nums hover:underline" style={{ color: COR }}>{p.telefone} ↗</a> : "Não informado"],
              ["Origem", [p.canal, p.canal_detalhe].filter(Boolean).join(" · ") || "Não informada"],
            ]}
          />
        </Card>

        <Card
          titulo="Valores e marcos"
          cor="#93703D"
          acao={
            <button type="button" onClick={() => setPainel({ tipo: "dados" })} className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#93703D] hover:bg-[#FAF5EB]">
              {p.valor_final ? "Editar valor" : "Informar valor final"}
            </button>
          }
        >
          <Linhas
            itens={[
              ["Mostrado no site", brl(p.valor_referencia_brl)],
              ["Valor final", p.valor_final || "A definir"],
              ["Pago em", p.pago_em ? dataHora(p.pago_em) : "Ainda não confirmado"],
              ["Protocolado em", p.protocolado_em ? dataHora(p.protocolado_em) : "—"],
              ["Concluído em", p.concluido_em ? dataHora(p.concluido_em) : "—"],
            ]}
          />
        </Card>
      </div>

      <PortalCliente p={p} />

      <Card titulo="Cadastro inicial (pré-análise)" cor="#42658A">
        <Linhas larguraRotulo="22rem" itens={p.respostas.map(([k, v]) => [k, v] as [string, React.ReactNode])} />
      </Card>

      <Card titulo="Aceite dos termos" cor="#5D6C70">
        <Linhas
          itens={[
            ["Versão dos termos", p.termos_versao ?? "Não informada"],
            ["Aceito em", dataHora(p.termos_aceitos_em)],
            ["IP", p.checkout_ip ?? "Não identificado"],
            ["Navegador", p.checkout_user_agent ?? "Não identificado"],
            ["Itens aceitos", p.aceites.length ? <ul key="a" className="list-disc space-y-1 pl-4">{p.aceites.map((a) => <li key={a}>{a}</li>)}</ul> : "Nenhum"],
          ]}
        />
      </Card>

      <Historico processo={p} onSalvo={concluido} />

      {painel?.tipo === "etapa" && <PainelEtapa processo={p} para={painel.para} onFechar={fechar} onSalvo={concluido} />}
      {painel?.tipo === "dados" && <PainelDados processo={p} onFechar={fechar} onSalvo={concluido} />}
    </div>
  );
}

function PortalCliente({ p }: { p: ProcessoDoc }) {
  const [copiado, setCopiado] = useState(false);
  const link = p.acesso_token ? `https://www.alpinea.io${urlPortal(p.id, p.acesso_token)}` : null;
  const ficha = p.ficha ? linhasFichaDoc(p.servico, parseFichaDoc(p.servico, p.ficha, MAX_PESSOAS_FICHA)) : [];
  const docs = Array.isArray(p.documentos) ? p.documentos : [];
  const rotuloDoc = (tipo: string) => (tipo === DOC_COMPROVANTE ? "Comprovante de pagamento" : documentosServico(p.servico).find((t) => t.id === tipo)?.rotulo ?? tipo);
  return (
    <>
      <Card titulo="Portal do cliente" cor="#27675B">
        {link ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-[#F8F5F2] px-3 py-2 text-[13px] text-[#25211E]">{link}</code>
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(link); setCopiado(true); }} className="rounded-xl border border-[#EAE2DB] px-3 py-2 text-[13px] font-medium" style={{ color: COR }}>
              {copiado ? "Copiado" : "Copiar link"}
            </button>
            <a href={link} target="_blank" rel="noopener" className="rounded-xl border border-[#EAE2DB] px-3 py-2 text-[13px] font-medium" style={{ color: COR }}>Abrir ↗</a>
          </div>
        ) : (
          <p className="text-sm text-[#6B635D]">Rode a migração 027 para ativar o portal online.</p>
        )}
        <p className="mt-3 text-[13px] text-[#6B635D]">
          Ficha completa: {p.ficha_enviada_em ? `enviada em ${dataHora(p.ficha_enviada_em)}` : p.ficha ? "rascunho em andamento" : "ainda não iniciada"} · Contrato: {p.contrato_aceito_em ? `aceito em ${dataHora(p.contrato_aceito_em)}` : p.liberado_contrato_em ? "liberado, aguardando aceite" : "não liberado"}
        </p>
      </Card>

      <Card titulo={`Documentos enviados (${docs.length})`} cor="#75608B">
        {docs.length === 0 ? (
          <p className="text-sm text-[#6B635D]">Nenhum arquivo ainda.</p>
        ) : (
          <ul className="divide-y divide-[#F2ECE6] text-sm">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block text-[13px] text-[#6B635D]">{rotuloDoc(d.tipo)}</span>
                  <span className="block truncate text-[#25211E]">{d.nome}</span>
                </span>
                <span className="flex items-center gap-3 text-[13px]">
                  <span className="text-[#6B635D]">{dataHora(d.enviado_em)}</span>
                  <a href={`/crm/documentacao/arquivo?path=${encodeURIComponent(d.path)}`} target="_blank" rel="noopener" className="font-medium hover:underline" style={{ color: COR }}>Abrir</a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {ficha.length > 0 && (
        <Card titulo={p.ficha_enviada_em ? "Ficha completa" : "Ficha completa (rascunho)"} cor="#42658A">
          <div className="space-y-5">
            {ficha.map((b) => (
              <div key={b.titulo}>
                <p className="mb-1 text-[13px] font-semibold text-[#25211E]">{b.titulo}</p>
                <Linhas larguraRotulo="18rem" itens={b.linhas.map(([k, v]) => [k, v] as [string, React.ReactNode])} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {p.contrato && (
        <Card titulo="Contrato aceito" cor="#7A6233">
          <Linhas
            itens={[
              ["Assinado por", `${p.contrato.nome} — CPF ${p.contrato.cpf}`],
              ["Aceito em", dataHora(p.contrato.aceito_em)],
              ["IP", p.contrato.ip ?? "—"],
              ["Navegador", p.contrato.user_agent ?? "—"],
              ["SHA-256", <span key="h" className="break-all font-mono text-[12px]">{p.contrato.hash}</span>],
              ["Versão", p.contrato.versao],
            ]}
          />
          <details className="mt-3 text-[13px]">
            <summary className="cursor-pointer font-medium" style={{ color: COR }}>Ver texto integral</summary>
            <div className="mt-3 space-y-2 text-[#25211E]">{[p.contrato.texto.titulo, ...p.contrato.texto.clausulas].map((c, i) => <p key={i}>{c}</p>)}</div>
          </details>
        </Card>
      )}
    </>
  );
}

function Historico({ processo: p, onSalvo }: { processo: ProcessoDoc; onSalvo: (t: string) => void }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const eventos = [...p.historico].reverse();
  return (
    <Card titulo="Histórico" cor="#5D6C70">
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
        className="mb-4 space-y-2"
      >
        <label htmlFor="nota-doc" className="sr-only">
          Nova nota
        </label>
        <textarea id="nota-doc" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={2000} placeholder="Registrar uma nota (ex.: garantidor confirmou holerites)…" className={CAMPO} />
        {erro && <p className="text-[13px] text-[#B42318]">{erro}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pendente || !texto.trim()} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: COR }}>
            {pendente && <Spinner />}
            Registrar nota
          </button>
        </div>
      </form>
      {eventos.length === 0 ? (
        <p className="text-sm text-[#6B635D]">Nenhum registro ainda.</p>
      ) : (
        <ol className="space-y-3">
          {eventos.map((ev, i) => (
            <li key={i} className={`rounded-xl px-4 py-2.5 text-sm ${ev.tipo === "etapa" ? "border border-[#8A5A3C]/20 bg-[#F8F3EF]" : "bg-[#F8F5F2]"}`}>
              <p className="text-[13px] text-[#6B635D]">
                {dataHora(ev.em)} · {ev.por}
              </p>
              {ev.tipo === "etapa" ? (
                <p className="font-medium text-[#25211E]">
                  {etapaDoc(ev.de ?? "").curto} → {etapaDoc(ev.para ?? "").curto}
                  {ev.texto && <span className="font-normal text-[#6B635D]"> — {ev.texto}</span>}
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-[#25211E]">{ev.texto}</p>
              )}
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
            <label key={e.valor} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${escolha === e.valor ? "border-[#8A5A3C] bg-[#F8F3EF]" : "border-[#EAE2DB]"}`}>
              <input type="radio" name="etapa" value={e.valor} checked={escolha === e.valor} onChange={() => setEscolha(e.valor)} className="accent-[#8A5A3C]" />
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
            <p className="mt-2 text-[13px] text-[#6B635D]">Lembrete: o serviço não é reembolsável. Única exceção — pet de raça restrita declarada corretamente, antes do início: 80%.</p>
          </div>
        )}
        {erro && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">{erro}</p>}
      </div>
    </Painel>
  );
}

function PainelDados({ processo: p, onFechar, onSalvo }: { processo: ProcessoDoc; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [valor, setValor] = useState(p.valor_final ?? "");
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
                const r = await salvarDadosDoc(p.id, { valor_final: valor, email, telefone });
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
            Valor final fechado
          </label>
          <input id="valor" value={valor} onChange={(e) => setValor(e.target.value)} maxLength={80} placeholder="Ex.: ¥149.000 ou R$ 1.980,00" className={CAMPO} />
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
