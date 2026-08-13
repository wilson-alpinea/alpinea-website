"use client";

import { useTransition } from "react";
import {
  STATUS_PAGAMENTO,
  STATUS_PAGAMENTO_COR,
  STATUS_PAGAMENTO_LABEL,
  TIPOS_PAGAMENTO,
  TIPO_PAGAMENTO_LABEL,
  type StatusPagamento,
  type TipoPagamento,
} from "@/lib/crm/pagamentos";
import { alternarStatusPagamento } from "../../../actions";
import type { Pagamento } from "@/lib/crm/types";

const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40";
const labelClass = "mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-black/40";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatData(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export function FinanceiroSection({
  clienteId,
  pagamentos,
  addAction,
  deleteAction,
}: {
  clienteId: string;
  pagamentos: Pagamento[];
  addAction: (formData: FormData) => void;
  deleteAction: (pagamentoId: string, formData: FormData) => void;
}) {
  const [pending, startTransition] = useTransition();

  const totalGeral = pagamentos.reduce((soma, p) => soma + p.valor, 0);
  const totalPago = pagamentos
    .filter((p) => p.status === "pago")
    .reduce((soma, p) => soma + p.valor, 0);
  const totalPendente = totalGeral - totalPago;

  function alternar(pagamentoId: string, statusAtual: string) {
    const novoStatus: StatusPagamento = statusAtual === "pago" ? "pendente" : "pago";
    startTransition(() => {
      alternarStatusPagamento(clienteId, pagamentoId, novoStatus);
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6 md:p-8">
      <h2 className="mb-4 text-lg font-medium text-black">Financeiro</h2>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-black/10 bg-white p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Total</p>
          <p className="mt-1 text-sm font-semibold text-black">{formatBRL(totalGeral)}</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Pago</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: STATUS_PAGAMENTO_COR.pago }}>
            {formatBRL(totalPago)}
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-black/40">Pendente</p>
          <p
            className="mt-1 text-sm font-semibold"
            style={{ color: STATUS_PAGAMENTO_COR.pendente }}
          >
            {formatBRL(totalPendente)}
          </p>
        </div>
      </div>

      {pagamentos.length === 0 ? (
        <p className="mb-6 text-sm text-black/40">Nenhum pagamento registrado ainda.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {pagamentos.map((p) => {
            const cor = STATUS_PAGAMENTO_COR[p.status as StatusPagamento] ?? "#57534E";
            const excluir = deleteAction.bind(null, p.id);
            return (
              <li
                key={p.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-white p-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-black">
                      {formatBRL(p.valor)}
                    </span>
                    <span className="text-xs text-black/40">
                      Parcela {p.numero_parcela}/{p.total_parcelas}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]"
                      style={{ background: `${cor}1a`, color: cor }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} />
                      {STATUS_PAGAMENTO_LABEL[p.status as StatusPagamento] ?? p.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-black/50">
                    {p.tipo_pagamento
                      ? TIPO_PAGAMENTO_LABEL[p.tipo_pagamento as TipoPagamento]
                      : "Forma não informada"}
                    {" · "}
                    Vencimento: {formatData(p.data_vencimento)}
                    {p.status === "pago" && ` · Pago em: ${formatData(p.data_pagamento)}`}
                  </p>
                  {p.observacoes && (
                    <p className="mt-1 text-xs text-black/40">{p.observacoes}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => alternar(p.id, p.status)}
                    className="whitespace-nowrap rounded-lg border border-black/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-black/60 transition hover:border-black/40 hover:text-black disabled:opacity-50"
                  >
                    {p.status === "pago" ? "Marcar pendente" : "Marcar pago"}
                  </button>
                  <form action={excluir}>
                    <button
                      type="submit"
                      title="Excluir pagamento"
                      aria-label="Excluir pagamento"
                      className="px-1 text-sm leading-none text-black/20 transition hover:text-red-600"
                    >
                      ×
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={addAction} className="space-y-3 border-t border-black/10 pt-5">
        <p className={labelClass}>Nova parcela / pagamento</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              name="valor"
              required
              placeholder="0,00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Forma de pagamento</label>
            <select name="tipo_pagamento" defaultValue="" className={inputClass}>
              <option value="">Não informado</option>
              {TIPOS_PAGAMENTO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Parcela nº</label>
            <input
              type="number"
              min={1}
              name="numero_parcela"
              defaultValue={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Total de parcelas</label>
            <input
              type="number"
              min={1}
              name="total_parcelas"
              defaultValue={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Vencimento</label>
            <input type="date" name="data_vencimento" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue="pendente" className={inputClass}>
              {STATUS_PAGAMENTO.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Data do pagamento (se já pago)</label>
            <input type="date" name="data_pagamento" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Observações</label>
            <input
              type="text"
              name="observacoes"
              placeholder="Ex.: sinal, saldo final, reembolso…"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-[#1C3A5E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#254a73]"
        >
          Registrar pagamento
        </button>
      </form>
    </div>
  );
}
