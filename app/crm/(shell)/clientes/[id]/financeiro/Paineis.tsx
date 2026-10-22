"use client";

import { useState, useTransition } from "react";
import { TIPOS_PAGAMENTO, TIPO_PAGAMENTO_LABEL, type TipoPagamento } from "@/lib/crm/pagamentos";
import {
  SITUACAO_COR,
  SITUACAO_LABEL,
  formatarBRL,
  formatarData,
  formatarDataHora,
  lerValorBRL,
  nomeParcela,
  type Lancamento,
  type ParcelaCalculada,
} from "@/lib/crm/financeiro";
import {
  cancelarParcela,
  definirValorContratado,
  estornarRecebimento,
  excluirParcela,
  registrarReembolso,
} from "../../../../financeiroActions";
import { Aviso, BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Erro, LABEL, Painel, Spinner, novaChave } from "./ui";

const fmtCampo = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formaLabel = (f: string | null) => (f ? TIPO_PAGAMENTO_LABEL[f as TipoPagamento] ?? f : null);

export function SeloSituacao({ parcela }: { parcela: ParcelaCalculada }) {
  const cor = SITUACAO_COR[parcela.situacao];
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: cor.texto, backgroundColor: cor.fundo }}>
        {SITUACAO_LABEL[parcela.situacao]}
      </span>
      {parcela.situacao === "parcial" && parcela.atrasada && (
        <span className="inline-flex items-center rounded-full bg-[#FDECEA] px-2 py-0.5 text-[13px] font-medium text-[#B42318]">Em atraso</span>
      )}
      {parcela.incompleta && (
        <span className="inline-flex items-center rounded-full bg-[#FFF4DB] px-2 py-0.5 text-[13px] font-medium text-[#6F4A00]" title="Recebimento antigo sem data ou forma de pagamento">
          Dados incompletos
        </span>
      )}
    </span>
  );
}

// ── Detalhes da parcela + lançamentos + estorno ──────────────────
export function DetalhesParcela({
  clienteId,
  parcela,
  servicoLabel,
  onRegistrar,
  onFechar,
  bloqueado,
}: {
  clienteId: string;
  parcela: ParcelaCalculada;
  servicoLabel: string | null;
  onRegistrar: () => void;
  onFechar: () => void;
  bloqueado: boolean;
}) {
  const [estornando, setEstornando] = useState<Lancamento | null>(null);
  const estornados = new Set(parcela.lancamentos.filter((l) => l.tipo === "estorno").map((l) => l.estorno_de));
  const ordenados = [...parcela.lancamentos].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  // Um painel por vez: o estorno substitui os detalhes (Esc fecha só ele).
  if (estornando) return <FormEstorno clienteId={clienteId} lancamento={estornando} onFechar={() => setEstornando(null)} />;

  return (
    <Painel
      titulo={nomeParcela(parcela)}
      subtitulo="Detalhes da parcela"
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO}>
            Fechar
          </button>
          {parcela.saldoC > 0 && parcela.situacao !== "cancelada" && !bloqueado && (
            <button type="button" onClick={onRegistrar} className={BOTAO_PRIMARIO}>
              Registrar recebimento
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <SeloSituacao parcela={parcela} />
        <dl className="grid grid-cols-3 gap-3 rounded-xl bg-[#F5F6F7] p-4 text-sm">
          <div>
            <dt className="text-[13px] text-[#626B75]">Valor</dt>
            <dd className="font-medium tabular-nums text-[#20252B]">{formatarBRL(parcela.valorC)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#626B75]">Recebido</dt>
            <dd className="font-medium tabular-nums text-[#28665D]">{formatarBRL(parcela.recebidoC)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#626B75]">Saldo</dt>
            <dd className="font-semibold tabular-nums text-[#20252B]">{formatarBRL(parcela.saldoC)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#626B75]">Vencimento</dt>
            <dd className="tabular-nums text-[#20252B]">{formatarData(parcela.data_vencimento)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[13px] text-[#626B75]">Serviço vinculado</dt>
            <dd className="text-[#20252B]">{servicoLabel ?? "—"}</dd>
          </div>
          {parcela.observacoes && (
            <div className="col-span-3">
              <dt className="text-[13px] text-[#626B75]">Observações</dt>
              <dd className="whitespace-pre-wrap text-[#20252B]">{parcela.observacoes}</dd>
            </div>
          )}
        </dl>

        <section>
          <h3 className="mb-2 text-[#20252B]">Lançamentos</h3>
          {ordenados.length === 0 ? (
            <p className="text-sm text-[#626B75]">Nenhum recebimento registrado.</p>
          ) : (
            <ul className="divide-y divide-[#E6E9ED] rounded-xl border border-[#E6E9ED]">
              {ordenados.map((l) => {
                const estorno = l.tipo === "estorno";
                const jaEstornado = estornados.has(l.id);
                return (
                  <li key={l.id} className="px-4 py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#20252B]">
                          {estorno ? "Estorno" : "Recebimento"}
                          {jaEstornado && <span className="ml-2 text-[13px] font-normal text-[#626B75]">(estornado)</span>}
                        </p>
                        <p className="text-[13px] tabular-nums text-[#626B75]">
                          {l.data ? formatarData(l.data) : <span className="text-[#946200]">Data não informada</span>}
                          {" · "}
                          {formaLabel(l.forma_pagamento) ?? <span className="text-[#946200]">Forma não informada</span>}
                          {l.origem === "gateway" && " · via Pagar.me"}
                          {l.origem === "legado" && " · registro anterior"}
                        </p>
                        {(l.motivo || l.observacoes) && <p className="mt-1 text-[13px] text-[#20252B]">{l.motivo ? `Motivo: ${l.motivo}` : l.observacoes}</p>}
                        <p className="mt-0.5 text-[13px] text-[#626B75]">
                          Registrado em {formatarDataHora(l.created_at)}
                          {l.autor && ` por ${l.autor}`}
                        </p>
                        {l.comprovante_arquivo_id && (
                          <a href={`/crm/arquivo-cliente?id=${l.comprovante_arquivo_id}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] font-medium text-[#24476B] hover:underline">
                            Ver comprovante
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className={`tabular-nums font-semibold ${estorno ? "text-[#B42318]" : "text-[#28665D]"}`}>
                          {estorno ? "− " : "+ "}
                          {formatarBRL(Math.round(l.valor * 100))}
                        </span>
                        {!estorno && !jaEstornado && !bloqueado && (
                          <button type="button" onClick={() => setEstornando(l)} className="text-[13px] font-medium text-[#B42318] hover:underline">
                            Estornar
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Painel>
  );
}

function FormEstorno({ clienteId, lancamento, onFechar }: { clienteId: string; lancamento: Lancamento; onFechar: () => void }) {
  const [chave] = useState(novaChave);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  return (
    <Painel
      titulo="Estornar recebimento"
      subtitulo={`${formatarBRL(Math.round(lancamento.valor * 100))} · ${formatarData(lancamento.data)}`}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Cancelar
          </button>
          <button
            type="button"
            className={BOTAO_PERIGO}
            disabled={pendente}
            onClick={() => {
              if (!motivo.trim()) return setErro("Informe o motivo do estorno.");
              iniciar(async () => {
                const r = await estornarRecebimento(clienteId, lancamento.id, motivo, chave);
                if (r.ok) onFechar();
                else setErro(r.erro);
              });
            }}
          >
            {pendente && <Spinner />}
            Confirmar estorno
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Aviso tom="cinza">O estorno desfaz este lançamento e reabre o saldo da parcela. O registro original continua no histórico.</Aviso>
        <div>
          <label className={LABEL} htmlFor="es-motivo">
            Motivo
          </label>
          <textarea id="es-motivo" rows={3} className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
        </div>
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}

// ── Cancelar / excluir parcela (sempre com motivo) ───────────────
export function ConfirmarParcela({
  clienteId,
  parcela,
  acao,
  onFechar,
}: {
  clienteId: string;
  parcela: ParcelaCalculada;
  acao: "cancelar" | "excluir";
  onFechar: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const temLancamentos = parcela.lancamentos.length > 0;
  const bloqueada = acao === "excluir" ? temLancamentos : parcela.recebidoC > 0;
  return (
    <Painel
      titulo={acao === "cancelar" ? "Cancelar parcela" : "Excluir parcela"}
      subtitulo={`${nomeParcela(parcela)} · ${formatarBRL(parcela.valorC)}`}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Voltar
          </button>
          {!bloqueada && (
            <button
              type="button"
              className={BOTAO_PERIGO}
              disabled={pendente}
              onClick={() => {
                if (!motivo.trim()) return setErro("Informe o motivo.");
                iniciar(async () => {
                  const r = acao === "cancelar" ? await cancelarParcela(clienteId, parcela.id, motivo) : await excluirParcela(clienteId, parcela.id, motivo);
                  if (r.ok) onFechar();
                  else setErro(r.erro);
                });
              }}
            >
              {pendente && <Spinner />}
              {acao === "cancelar" ? "Cancelar parcela" : "Excluir parcela"}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {bloqueada ? (
          <Aviso>
            {acao === "excluir"
              ? "Esta parcela tem recebimentos ou estornos vinculados e não pode ser excluída. Estorne os recebimentos e use “Cancelar parcela”."
              : `Esta parcela tem ${formatarBRL(parcela.recebidoC)} recebidos. Estorne os recebimentos antes de cancelar.`}
          </Aviso>
        ) : (
          <>
            <Aviso tom="cinza">
              {acao === "cancelar"
                ? "A parcela sai dos totais, mas continua visível como cancelada."
                : "A parcela é removida da lista. A exclusão fica registrada no histórico do financeiro."}
            </Aviso>
            <div>
              <label className={LABEL} htmlFor="cp-motivo">
                Motivo
              </label>
              <textarea id="cp-motivo" rows={3} className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
            </div>
          </>
        )}
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}

// ── Valor contratado ─────────────────────────────────────────────
export function FormValorContratado({
  clienteId,
  atualC,
  propostaC,
  onFechar,
  onSalvo,
}: {
  clienteId: string;
  atualC: number | null;
  propostaC: number | null;
  onFechar: () => void;
  onSalvo?: () => void;
}) {
  const [valor, setValor] = useState(atualC !== null ? fmtCampo(atualC) : "");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const valorC = lerValorBRL(valor);
  return (
    <Painel
      titulo={atualC === null ? "Definir valor contratado" : "Alterar valor contratado"}
      subtitulo="Valor aprovado pelo cliente — base para o que falta receber."
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Cancelar
          </button>
          <button
            type="button"
            className={BOTAO_PRIMARIO}
            disabled={pendente}
            onClick={() => {
              if (valorC === null || valorC <= 0) return setErro("Informe um valor maior que zero.");
              if (atualC !== null && valorC !== atualC && !motivo.trim()) return setErro("Informe o motivo da alteração.");
              iniciar(async () => {
                const r = await definirValorContratado(clienteId, valorC, motivo);
                if (r.ok) (onSalvo ?? onFechar)();
                else setErro(r.erro);
              });
            }}
          >
            {pendente && <Spinner />}
            Salvar valor
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL} htmlFor="vc-valor">
            Valor contratado (R$)
          </label>
          <input id="vc-valor" className={`${CAMPO} text-right tabular-nums`} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          {propostaC !== null && propostaC > 0 && atualC === null && (
            <p className="mt-1.5 text-[13px] text-[#626B75]">
              Valor da proposta: {formatarBRL(propostaC)}.{" "}
              <button type="button" className="font-medium text-[#24476B] hover:underline" onClick={() => setValor(fmtCampo(propostaC))}>
                Usar este valor
              </button>{" "}
              (só se foi o aprovado)
            </p>
          )}
        </div>
        {atualC !== null && (
          <>
            <Aviso tom="cinza">Alterar o contrato não mexe nas parcelas nem nos recebimentos. Para devolver dinheiro ao cliente, use “Registrar reembolso”.</Aviso>
            <div>
              <label className={LABEL} htmlFor="vc-motivo">
                Motivo da alteração
              </label>
              <input id="vc-motivo" className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
            </div>
          </>
        )}
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}

// ── Reembolso (devolução ao cliente) ─────────────────────────────
export function FormReembolso({ clienteId, hoje, liquidoC, onFechar }: { clienteId: string; hoje: string; liquidoC: number; onFechar: () => void }) {
  const [chave] = useState(novaChave);
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje);
  const [forma, setForma] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const valorC = lerValorBRL(valor);
  return (
    <Painel
      titulo="Registrar reembolso"
      subtitulo="Dinheiro devolvido ao cliente. Não altera o valor contratado."
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Cancelar
          </button>
          <button
            type="button"
            className={BOTAO_PRIMARIO}
            disabled={pendente}
            onClick={() => {
              if (valorC === null || valorC <= 0) return setErro("Informe um valor maior que zero.");
              if (valorC > liquidoC) return setErro(`O reembolso não pode passar do valor líquido recebido (${formatarBRL(liquidoC)}).`);
              if (!data) return setErro("Informe a data.");
              if (!forma) return setErro("Escolha a forma da devolução.");
              if (!motivo.trim()) return setErro("Informe o motivo.");
              iniciar(async () => {
                const r = await registrarReembolso(clienteId, { valorC, data, forma, motivo, chave });
                if (r.ok) onFechar();
                else setErro(r.erro);
              });
            }}
          >
            {pendente && <Spinner />}
            Registrar reembolso
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rb-valor">
              Valor (R$)
            </label>
            <input id="rb-valor" className={`${CAMPO} text-right tabular-nums`} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label className={LABEL} htmlFor="rb-data">
              Data
            </label>
            <input id="rb-data" type="date" max={hoje} className={CAMPO} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={LABEL} htmlFor="rb-forma">
            Forma da devolução
          </label>
          <select id="rb-forma" className={CAMPO} value={forma} onChange={(e) => setForma(e.target.value)}>
            <option value="" disabled>
              Selecione
            </option>
            {TIPOS_PAGAMENTO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="rb-motivo">
            Motivo
          </label>
          <textarea id="rb-motivo" rows={2} className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
        </div>
        <p className="text-[13px] text-[#626B75]">Líquido recebido até agora: {formatarBRL(liquidoC)}.</p>
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}
