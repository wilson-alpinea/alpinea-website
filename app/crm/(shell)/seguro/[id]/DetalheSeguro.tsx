"use client";

import { useCallback, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ETAPAS_SEGURO, FLUXO_SEGURO, etapaSeguro, prazoApolice, type EtapaSeguro, type PedidoSeguro } from "@/lib/crm/seguro";
import { adicionarNotaSeguro, mudarEtapaSeguro, salvarDadosSeguro } from "../../../seguroActions";
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";
import { BadgeEtapa } from "../ListaSeguro";

const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "w-full rounded-xl border border-[#E6E1EC] bg-white px-3.5 py-2.5 text-base text-[#24212A] outline-none focus:border-[#75608B] focus:ring-2 focus:ring-[#75608B]/25";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#67626F]";
const FUSO = "America/Sao_Paulo";
const dataBR = (d: string | null | undefined) => (d ? d.slice(0, 10).split("-").reverse().join("/") : "Não informada");
const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
const brl = (v: number | null) => (v == null ? "Não informado" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

const semAssinatura = () => () => {};
function lerVoltar() {
  try {
    return window.sessionStorage.getItem("crm-seguro-lista") || "/crm/seguro";
  } catch {
    return "/crm/seguro";
  }
}

// Ação principal de cada etapa (avança uma casa no fluxo).
const PROXIMA: Partial<Record<EtapaSeguro, { etapa: EtapaSeguro; rotulo: string; ajuda: string }>> = {
  link_enviado: { etapa: "pago", rotulo: "Confirmar pagamento", ajuda: "Confira no painel da Real Seguro Viagem antes — a API não avisa o pagamento." },
  pago: { etapa: "apolice_recebida", rotulo: "Registrar apólice recebida", ajuda: "Quando a seguradora enviar a apólice (até 24 h após o pagamento)." },
  apolice_recebida: { etapa: "apolice_enviada", rotulo: "Marcar apólice enviada ao cliente", ajuda: "Depois de mandar a apólice ao cliente. O CRM não envia nada sozinho." },
  apolice_enviada: { etapa: "concluido", rotulo: "Concluir (viagem realizada)", ajuda: "Após o retorno do cliente." },
};

function Card({ titulo, cor = "#75608B", fundo = "#FFFFFF", acao, children }: { titulo: string; cor?: string; fundo?: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-t-[3px] border-[#E6E1EC] p-5 ${SOMBRA}`} style={{ backgroundColor: fundo, borderTopColor: cor }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 style={{ color: cor }}>{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Linhas({ itens }: { itens: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-[#F0ECF4] text-sm">
      {itens.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2">
          <dt className="text-[#67626F]">{k}</dt>
          <dd className="min-w-0 break-words text-[#24212A]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DetalheSeguro({ pedido: p, agora }: { pedido: PedidoSeguro; agora: number }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [painel, setPainel] = useState<null | { tipo: "etapa"; para?: EtapaSeguro } | { tipo: "dados" }>(null);
  const fechar = useCallback(() => setPainel(null), []);
  const concluido = (t: string) => {
    setAviso({ ok: true, texto: t });
    router.refresh();
  };
  // Volta para a lista com os mesmos filtros e página.
  const voltar = useSyncExternalStore(semAssinatura, lerVoltar, () => "/crm/seguro");

  const etapa = etapaSeguro(p.etapa);
  const prox = PROXIMA[p.etapa];
  const prazo = prazoApolice(p, agora);
  const idx = FLUXO_SEGURO.indexOf(p.etapa);
  const viagem = p.partida ? `${dataBR(p.partida)}${p.retorno ? ` a ${dataBR(p.retorno)}` : ""}` : "Não informada";

  return (
    <div className="space-y-6">
      <div>
        <Link href={voltar} className="text-[13px] text-[#67626F] hover:text-[#75608B]">
          ← Pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[#24212A]" style={{ fontSize: 28, fontWeight: 600 }}>
              {p.nome}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#67626F]">
              <BadgeEtapa etapa={p.etapa} />
              <span>Pedido em {dataHora(p.created_at)}</span>
              {p.cliente_origem_id && <span className="rounded-full bg-[#F3F5F5] px-2 py-0.5 text-[13px]">Trazido do CRM da Agência</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.etapa !== "cancelado" && (
              <button type="button" onClick={() => setPainel({ tipo: "etapa", para: "cancelado" })} className="rounded-xl border border-[#B42318]/30 bg-white px-4 py-2.5 text-sm font-medium text-[#B42318] hover:border-[#B42318]">
                Cancelar pedido
              </button>
            )}
            <button type="button" onClick={() => setPainel({ tipo: "etapa" })} className="rounded-xl border border-[#E6E1EC] bg-white px-4 py-2.5 text-sm font-medium text-[#24212A] hover:border-[#75608B]/50">
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

      {/* Andamento */}
      <section className={`rounded-2xl border border-t-[3px] border-[#E6E1EC] bg-white p-5 ${SOMBRA}`} style={{ borderTopColor: etapa.cor }}>
        {p.etapa === "cancelado" ? (
          <p className="text-sm text-[#B42318]">
            Pedido cancelado{p.motivo_cancelamento ? ` — ${p.motivo_cancelamento}` : ""}.
          </p>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-5">
            {FLUXO_SEGURO.map((f, i) => {
              const e = etapaSeguro(f);
              const feito = i < idx;
              const atual = i === idx;
              return (
                <li key={f} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px]" style={{ backgroundColor: atual ? e.fundo : feito ? "#F7F5FA" : "transparent", color: atual ? e.cor : feito ? "#24212A" : "#9A94A3" }}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${atual ? "text-white" : feito ? "bg-[#75608B]/15 text-[#75608B]" : "border border-[#E6E1EC]"}`} style={atual ? { backgroundColor: e.cor } : undefined}>
                    {feito ? "✓" : i + 1}
                  </span>
                  <span className={atual ? "font-semibold" : ""}>{e.curto}</span>
                </li>
              );
            })}
          </ol>
        )}
        {prazo && (
          <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${prazo.atrasado ? "bg-[#FDECEA] text-[#8A1C12]" : "bg-[#FAF5EB] text-[#6E5430]"}`}>
            {prazo.atrasado
              ? `Passou o prazo de 24 h da seguradora (pago em ${dataHora(p.pago_em)}). Cobre a apólice da Real Seguro Viagem.`
              : `A seguradora tem até ${dataHora(new Date(prazo.limite).toISOString())} para enviar a apólice (24 h após o pagamento).`}
          </p>
        )}
        {prox && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECF4] pt-4">
            <p className="text-[13px] text-[#67626F]">{prox.ajuda}</p>
            <button type="button" onClick={() => setPainel({ tipo: "etapa", para: prox.etapa })} className="rounded-xl bg-[#75608B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#63507A]">
              {prox.rotulo}
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          titulo="Comprador"
          acao={
            <button type="button" onClick={() => setPainel({ tipo: "dados" })} className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#75608B] hover:bg-[#F4F1F8]">
              Editar
            </button>
          }
        >
          <Linhas
            itens={[
              ["Nome", p.nome],
              ["E-mail", p.email ? <a key="e" href={`mailto:${p.email}`} className="text-[#75608B] hover:underline">{p.email}</a> : "Não informado"],
              ["Celular", p.telefone ? <a key="t" href={`https://wa.me/${p.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="tabular-nums text-[#75608B] hover:underline">{p.telefone} ↗</a> : "Não informado"],
              ["Observações", p.observacoes_cliente || "Nenhuma"],
              ["Origem", [p.canal, p.canal_detalhe].filter(Boolean).join(" · ") || "Não informada"],
            ]}
          />
        </Card>

        <Card titulo="Plano e viagem" cor="#42658A">
          <Linhas
            itens={[
              ["Plano", p.plano ?? "Não informado"],
              ["Seguradora", p.seguradora ?? "Não informada"],
              ["Fornecedor", p.fornecedor ?? "Não informado"],
              ["Viagem", viagem],
              ["Viajantes", String(p.viajantes.length || "Não informado")],
            ]}
          />
        </Card>

        <Card titulo="Pagamento" cor="#93703D">
          <Linhas
            itens={[
              ["Valor ao cliente", brl(p.valor_cliente)],
              ["Custo da agência", brl(p.custo)],
              ["Margem", p.margem_pct != null ? `${Number(p.margem_pct).toLocaleString("pt-BR")}%` : "Não informada"],
              ["Pago em", p.pago_em ? dataHora(p.pago_em) : "Ainda não confirmado"],
              ["Link de pagamento", p.link_pagamento ? <a key="l" href={p.link_pagamento} target="_blank" rel="noopener" className="break-all text-[#75608B] hover:underline">{p.link_pagamento}</a> : "Não informado"],
              ...(p.aviso_fornecedor ? ([["Aviso do fornecedor", p.aviso_fornecedor]] as [string, React.ReactNode][]) : []),
            ]}
          />
        </Card>

        <Card
          titulo="Apólice"
          cor="#27675B"
          acao={
            <button type="button" onClick={() => setPainel({ tipo: "dados" })} className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#27675B] hover:bg-[#EEF6F3]">
              {p.numero_apolice ? "Editar número" : "Informar número"}
            </button>
          }
        >
          <Linhas
            itens={[
              ["Número", p.numero_apolice || "Não informado"],
              ["Recebida em", p.apolice_recebida_em ? dataHora(p.apolice_recebida_em) : "—"],
              ["Enviada ao cliente", p.apolice_enviada_em ? dataHora(p.apolice_enviada_em) : "—"],
            ]}
          />
        </Card>
      </div>

      <Card titulo="Viajantes" cor="#42658A">
        {p.viajantes.length === 0 ? (
          <p className="text-sm text-[#67626F]">Não informados neste pedido. {p.cliente_origem_id && "Veja o texto original nas notas abaixo."}</p>
        ) : (
          <ul className="divide-y divide-[#F0ECF4] text-sm">
            {p.viajantes.map((v, i) => (
              <li key={i} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,2fr)_1fr_1fr]">
                <span className="font-medium text-[#24212A]">{v.nome}</span>
                <span className="tabular-nums text-[#67626F]">
                  {v.nascimento ? dataBR(v.nascimento) : "Nascimento não informado"}
                  {v.idade != null && ` · ${v.idade} anos`}
                </span>
                <span className="tabular-nums text-[#67626F]">
                  {v.tipo_documento === "passaporte" ? "Passaporte" : "CPF"}: {v.documento || "não informado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {p.notas && (
        <Card titulo="Texto original do pedido" cor="#5D6C70">
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-[inherit] text-[13px] text-[#24212A]">{p.notas}</pre>
        </Card>
      )}

      <Historico pedido={p} onSalvo={concluido} />

      {painel?.tipo === "etapa" && <PainelEtapa pedido={p} para={painel.para} onFechar={fechar} onSalvo={concluido} />}
      {painel?.tipo === "dados" && <PainelDados pedido={p} onFechar={fechar} onSalvo={concluido} />}
    </div>
  );
}

function Historico({ pedido: p, onSalvo }: { pedido: PedidoSeguro; onSalvo: (t: string) => void }) {
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
            const r = await adicionarNotaSeguro(p.id, texto);
            if (r.ok) {
              setTexto("");
              setErro(null);
              onSalvo(r.mensagem);
            } else setErro(r.erro);
          });
        }}
        className="mb-4 space-y-2"
      >
        <label htmlFor="nota-seguro" className="sr-only">
          Nova nota
        </label>
        <textarea id="nota-seguro" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={2000} placeholder="Registrar uma nota (ex.: cliente pediu a apólice por WhatsApp)…" className={CAMPO} />
        {erro && <p className="text-[13px] text-[#B42318]">{erro}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pendente || !texto.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#75608B] px-4 py-2 text-sm font-medium text-white hover:bg-[#63507A] disabled:opacity-50">
            {pendente && <Spinner />}
            Registrar nota
          </button>
        </div>
      </form>
      {eventos.length === 0 ? (
        <p className="text-sm text-[#67626F]">Nenhum registro ainda.</p>
      ) : (
        <ol className="space-y-3">
          {eventos.map((ev, i) => (
            <li key={i} className={`rounded-xl px-4 py-2.5 text-sm ${ev.tipo === "etapa" ? "border border-[#75608B]/20 bg-[#F4F1F8]" : "bg-[#F7F5FA]"}`}>
              <p className="text-[13px] text-[#67626F]">
                {dataHora(ev.em)} · {ev.por}
              </p>
              {ev.tipo === "etapa" ? (
                <p className="font-medium text-[#24212A]">
                  {etapaSeguro(ev.de ?? "").curto} → {etapaSeguro(ev.para ?? "").curto}
                  {ev.texto && <span className="font-normal text-[#67626F]"> — {ev.texto}</span>}
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-[#24212A]">{ev.texto}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function PainelEtapa({ pedido: p, para, onFechar, onSalvo }: { pedido: PedidoSeguro; para?: EtapaSeguro; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [escolha, setEscolha] = useState<EtapaSeguro>(para ?? p.etapa);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const cancelar = escolha === "cancelado";
  return (
    <Painel
      titulo={cancelar && para === "cancelado" ? "Cancelar pedido" : "Mudar etapa"}
      subtitulo={`Agora: ${etapaSeguro(p.etapa).label}`}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Voltar
          </button>
          <button
            type="button"
            className={cancelar ? BOTAO_PERIGO : BOTAO_PRIMARIO}
            disabled={pendente || escolha === p.etapa}
            onClick={() =>
              iniciar(async () => {
                const r = await mudarEtapaSeguro(p.id, escolha, motivo);
                if (r.ok) {
                  onSalvo(r.mensagem);
                  onFechar();
                } else setErro(r.erro);
              })
            }
          >
            {pendente && <Spinner />}
            {cancelar ? "Confirmar cancelamento" : "Confirmar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {!para || para !== "cancelado" ? (
          <fieldset className="space-y-2">
            <legend className={LABEL}>Nova etapa</legend>
            {ETAPAS_SEGURO.map((e) => (
              <label key={e.valor} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${escolha === e.valor ? "border-[#75608B] bg-[#F4F1F8]" : "border-[#E6E1EC]"}`}>
                <input type="radio" name="etapa" value={e.valor} checked={escolha === e.valor} onChange={() => setEscolha(e.valor)} className="accent-[#75608B]" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.cor }} aria-hidden="true" />
                <span className="text-[#24212A]">{e.label}</span>
                {e.valor === p.etapa && <span className="ml-auto text-[13px] text-[#67626F]">atual</span>}
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="text-sm text-[#24212A]">O pedido sai do fluxo. Nada é enviado ao cliente e o link de pagamento do fornecedor não é cancelado por aqui.</p>
        )}
        {cancelar && (
          <div>
            <label htmlFor="motivo" className={LABEL}>
              Motivo (opcional)
            </label>
            <input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} placeholder="Ex.: cliente não pagou, desistiu da viagem" className={CAMPO} />
          </div>
        )}
        {["pago", "apolice_recebida", "apolice_enviada", "concluido"].includes(escolha) && escolha !== p.etapa && (
          <p className="text-[13px] text-[#67626F]">As datas de cada marco (pagamento, apólice recebida, enviada) são gravadas agora, se ainda não tiverem sido.</p>
        )}
        {erro && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">{erro}</p>}
      </div>
    </Painel>
  );
}

function PainelDados({ pedido: p, onFechar, onSalvo }: { pedido: PedidoSeguro; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [numero, setNumero] = useState(p.numero_apolice ?? "");
  const [email, setEmail] = useState(p.email ?? "");
  const [telefone, setTelefone] = useState(p.telefone ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  return (
    <Painel
      titulo="Editar dados do pedido"
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
                const r = await salvarDadosSeguro(p.id, { numero_apolice: numero, email, telefone });
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
          <label htmlFor="num" className={LABEL}>
            Número da apólice
          </label>
          <input id="num" value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={80} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="em" className={LABEL}>
            E-mail do comprador
          </label>
          <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="tel" className={LABEL}>
            Celular do comprador
          </label>
          <input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={30} className={CAMPO} />
        </div>
        <p className="text-[13px] text-[#67626F]">Nome, plano, viajantes e valores vêm do pedido feito no site e não são editados aqui.</p>
        {erro && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">{erro}</p>}
      </div>
    </Painel>
  );
}
