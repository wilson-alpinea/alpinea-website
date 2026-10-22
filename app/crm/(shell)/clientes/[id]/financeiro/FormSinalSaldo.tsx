"use client";

import { useState, useTransition } from "react";
import { criarParcelas } from "../../../../financeiroActions";
import { formatarBRL, formatarData, lerValorBRL } from "@/lib/crm/financeiro";
import { Aviso, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Erro, LABEL, Painel, Spinner, novaChave } from "./ui";

const fmtCampo = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Atalho "Criar sinal + saldo": calcula as duas parcelas a partir do valor
// a distribuir (contratado − parcelas existentes). Sem percentual fixo.
export function FormSinalSaldo({
  clienteId,
  contratadoC,
  distribuidoC,
  onFechar,
}: {
  clienteId: string;
  contratadoC: number;
  distribuidoC: number;
  onFechar: () => void;
}) {
  const disponivelC = contratadoC - distribuidoC;
  const [chave] = useState(novaChave);
  const [base, setBase] = useState(fmtCampo(Math.max(0, disponivelC)));
  const [modo, setModo] = useState<"percentual" | "valor">("percentual");
  const [percentual, setPercentual] = useState("");
  const [valorSinal, setValorSinal] = useState("");
  const [vencSinal, setVencSinal] = useState("");
  const [vencSaldo, setVencSaldo] = useState("");
  const [revisando, setRevisando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const baseC = lerValorBRL(base);
  const pct = Number(percentual.replace(",", "."));
  const sinalC =
    baseC === null
      ? null
      : modo === "percentual"
        ? Number.isFinite(pct) && pct > 0
          ? Math.round((baseC * pct) / 100)
          : null
        : lerValorBRL(valorSinal);
  const saldoC = baseC !== null && sinalC !== null ? baseC - sinalC : null; // saldo = base − sinal: soma exata

  function revisar() {
    if (baseC === null || baseC <= 0) return setErro("Informe o valor a distribuir.");
    if (disponivelC > 0 && baseC > disponivelC) return setErro(`O valor passa do que ainda falta distribuir (${formatarBRL(disponivelC)}).`);
    if (sinalC === null || sinalC <= 0) return setErro(modo === "percentual" ? "Informe o percentual do sinal." : "Informe o valor do sinal.");
    if (saldoC === null || saldoC <= 0) return setErro("O sinal precisa ser menor que o valor a distribuir.");
    if (!vencSinal) return setErro("Informe o vencimento do sinal.");
    if (!vencSaldo) return setErro("Informe o vencimento do saldo final.");
    if (vencSaldo < vencSinal) return setErro("O saldo final não pode vencer antes do sinal.");
    setErro(null);
    setRevisando(true);
  }

  function criar() {
    iniciar(async () => {
      const r = await criarParcelas(
        clienteId,
        [
          { descricao: "Sinal", valorC: sinalC!, vencimento: vencSinal, servico: null, observacoes: null },
          { descricao: "Saldo final", valorC: saldoC!, vencimento: vencSaldo, servico: null, observacoes: null },
        ],
        chave,
        "sinal_saldo",
      );
      if (r.ok) onFechar();
      else setErro(r.erro);
    });
  }

  return (
    <Painel
      titulo="Criar sinal + saldo"
      subtitulo="Gera duas parcelas a partir do valor contratado."
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" onClick={revisando ? () => setRevisando(false) : onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            {revisando ? "Voltar" : "Cancelar"}
          </button>
          {revisando ? (
            <button type="button" onClick={criar} className={BOTAO_PRIMARIO} disabled={pendente} aria-busy={pendente}>
              {pendente && <Spinner />}
              {pendente ? "Criando…" : "Criar parcelas"}
            </button>
          ) : (
            <button type="button" onClick={revisar} className={BOTAO_PRIMARIO}>
              Revisar parcelas
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {distribuidoC > 0 && (
          <Aviso>
            Já existem parcelas somando {formatarBRL(distribuidoC)}. Ainda falta distribuir{" "}
            <strong className="font-semibold tabular-nums">{formatarBRL(Math.max(0, disponivelC))}</strong> — o atalho usa só esse valor, sem duplicar o plano.
          </Aviso>
        )}
        {revisando ? (
          <>
            <ol className="divide-y divide-[#E6E9ED] rounded-xl border border-[#E6E9ED]">
              {[
                { d: "Sinal", v: vencSinal, c: sinalC! },
                { d: "Saldo final", v: vencSaldo, c: saldoC! },
              ].map((p) => (
                <li key={p.d} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-medium text-[#20252B]">{p.d}</span>
                  <span className="flex gap-4 tabular-nums">
                    <span className="text-[#626B75]">{formatarData(p.v)}</span>
                    <span className="w-28 text-right font-medium text-[#20252B]">{formatarBRL(p.c)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-right text-sm tabular-nums text-[#626B75]">
              Total: <strong className="font-semibold text-[#20252B]">{formatarBRL(sinalC! + saldoC!)}</strong>
            </p>
          </>
        ) : (
          <>
            <div>
              <label className={LABEL} htmlFor="ss-base">
                Valor a distribuir (R$)
              </label>
              <input id="ss-base" className={`${CAMPO} text-right tabular-nums`} inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} />
              <p className="mt-1 text-[13px] text-[#626B75]">Contratado: {formatarBRL(contratadoC)}</p>
            </div>
            <fieldset>
              <legend className={LABEL}>Sinal</legend>
              <div className="mb-2 inline-flex rounded-lg border border-[#D5DAE0] p-0.5" role="radiogroup">
                {(["percentual", "valor"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={modo === m}
                    onClick={() => setModo(m)}
                    className={`rounded-md px-3 py-1 text-sm ${modo === m ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
                  >
                    {m === "percentual" ? "Percentual" : "Valor"}
                  </button>
                ))}
              </div>
              {modo === "percentual" ? (
                <div className="flex items-center gap-2">
                  <input aria-label="Percentual do sinal" className={`${CAMPO} max-w-[8rem] text-right tabular-nums`} inputMode="decimal" value={percentual} onChange={(e) => setPercentual(e.target.value)} placeholder="Ex.: 30" />
                  <span className="text-[#626B75]">%</span>
                  {sinalC !== null && sinalC > 0 && <span className="text-sm tabular-nums text-[#20252B]">= {formatarBRL(sinalC)}</span>}
                </div>
              ) : (
                <input aria-label="Valor do sinal" className={`${CAMPO} text-right tabular-nums`} inputMode="decimal" value={valorSinal} onChange={(e) => setValorSinal(e.target.value)} placeholder="0,00" />
              )}
              {saldoC !== null && saldoC > 0 && <p className="mt-1.5 text-[13px] tabular-nums text-[#626B75]">Saldo final: {formatarBRL(saldoC)}</p>}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="ss-v1">
                  Vencimento do sinal
                </label>
                <input id="ss-v1" type="date" className={CAMPO} value={vencSinal} onChange={(e) => setVencSinal(e.target.value)} />
              </div>
              <div>
                <label className={LABEL} htmlFor="ss-v2">
                  Vencimento do saldo final
                </label>
                <input id="ss-v2" type="date" className={CAMPO} value={vencSaldo} onChange={(e) => setVencSaldo(e.target.value)} />
              </div>
            </div>
          </>
        )}
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}
