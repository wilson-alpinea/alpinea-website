"use client";

import { useMemo, useState, useTransition } from "react";
import { criarParcelas, editarParcela } from "../../../../financeiroActions";
import {
  dividirCentavos,
  formatarBRL,
  formatarData,
  lerValorBRL,
  somarPeriodo,
  type ParcelaCalculada,
} from "@/lib/crm/financeiro";
import { Aviso, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Erro, LABEL, Painel, Spinner, novaChave } from "./ui";

export type OpcaoServico = { valor: string; label: string };

const fmtCampo = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "+ Adicionar parcela" e "Editar parcela". Cadastrar parcela cria só a
// PREVISÃO de cobrança — nunca registra recebimento.
export function FormParcela({
  clienteId,
  servicos,
  disponivelC,
  hoje,
  parcela,
  onFechar,
}: {
  clienteId: string;
  servicos: OpcaoServico[];
  disponivelC: number | null; // contratado − distribuído (null = sem contrato)
  hoje: string;
  parcela?: ParcelaCalculada; // presente = edição
  onFechar: () => void;
}) {
  const editando = !!parcela;
  const [chave] = useState(novaChave);
  const [descricao, setDescricao] = useState(parcela?.descricao ?? "");
  const [valor, setValor] = useState(parcela ? fmtCampo(parcela.valorC) : disponivelC && disponivelC > 0 ? fmtCampo(disponivelC) : "");
  const [vencimento, setVencimento] = useState(parcela?.data_vencimento ?? "");
  const [servico, setServico] = useState(parcela?.servico ?? "");
  const [observacoes, setObservacoes] = useState(parcela?.observacoes ?? "");
  const [mostrarObs, setMostrarObs] = useState(!!parcela?.observacoes);
  const [dividir, setDividir] = useState(false);
  const [quantidade, setQuantidade] = useState("2");
  const [periodicidade, setPeriodicidade] = useState<"mensal" | "quinzenal" | "semanal">("mensal");
  const [revisando, setRevisando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const valorC = lerValorBRL(valor);
  const n = Math.max(0, Math.min(60, Number.parseInt(quantidade, 10) || 0));

  const plano = useMemo(() => {
    if (!dividir || !valorC || valorC <= 0 || n < 2 || !vencimento) return [];
    const base = descricao.trim() || "Parcela";
    return dividirCentavos(valorC, n).map((c, i) => ({
      descricao: `${base} ${i + 1}/${n}`,
      valorC: c,
      vencimento: somarPeriodo(vencimento, periodicidade, i),
    }));
  }, [dividir, valorC, n, vencimento, periodicidade, descricao]);

  const exigeMotivo = editando && (parcela!.recebidoC > 0 || (valorC !== null && valorC !== parcela!.valorC));

  function validar(): string | null {
    if (!descricao.trim()) return "Informe a descrição (ex.: Sinal, Saldo final).";
    if (valorC === null || valorC <= 0) return "Informe um valor maior que zero.";
    if (!vencimento) return dividir ? "Informe o primeiro vencimento." : "Informe o vencimento.";
    if (dividir && (n < 2 || n > 60)) return "A quantidade de parcelas deve ficar entre 2 e 60.";
    if (editando && valorC < parcela!.recebidoC) return `O valor não pode ficar abaixo do já recebido (${formatarBRL(parcela!.recebidoC)}).`;
    if (exigeMotivo && !motivo.trim()) return "Informe o motivo da alteração.";
    return null;
  }

  function salvar() {
    const problema = validar();
    if (problema) return setErro(problema);
    if (dividir && !revisando) {
      setErro(null);
      return setRevisando(true);
    }
    setErro(null);
    iniciar(async () => {
      const r = editando
        ? await editarParcela(clienteId, parcela!.id, { descricao, valorC: valorC!, vencimento, servico: servico || null, observacoes: observacoes || null }, motivo)
        : await criarParcelas(
            clienteId,
            dividir
              ? plano.map((p) => ({ ...p, servico: servico || null, observacoes: observacoes || null }))
              : [{ descricao, valorC: valorC!, vencimento, servico: servico || null, observacoes: observacoes || null }],
            chave,
            dividir ? "dividida" : "manual",
          );
      if (r.ok) onFechar();
      else setErro(r.erro);
    });
  }

  const excede = !editando && disponivelC !== null && valorC !== null && valorC > Math.max(0, disponivelC);

  return (
    <Painel
      titulo={editando ? "Editar parcela" : "Adicionar parcela"}
      subtitulo={editando ? undefined : "Cria uma previsão de cobrança. O recebimento é registrado depois."}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" onClick={revisando ? () => setRevisando(false) : onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            {revisando ? "Voltar" : "Cancelar"}
          </button>
          <button type="button" onClick={salvar} className={BOTAO_PRIMARIO} disabled={pendente} aria-busy={pendente}>
            {pendente && <Spinner />}
            {pendente ? "Salvando…" : dividir && !revisando ? "Revisar parcelas" : dividir ? `Salvar ${plano.length} parcelas` : "Salvar parcela"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {revisando ? (
          <>
            <p className="text-sm text-[#20252B]">Confira os valores e as datas antes de salvar.</p>
            <ol className="divide-y divide-[#E6E9ED] rounded-xl border border-[#E6E9ED]">
              {plano.map((p) => (
                <li key={p.descricao} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="text-[#20252B]">{p.descricao}</span>
                  <span className="flex gap-4 tabular-nums">
                    <span className="text-[#626B75]">{formatarData(p.vencimento)}</span>
                    <span className="w-28 text-right font-medium text-[#20252B]">{formatarBRL(p.valorC)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-right text-sm tabular-nums text-[#626B75]">
              Total: <strong className="font-semibold text-[#20252B]">{formatarBRL(plano.reduce((s, p) => s + p.valorC, 0))}</strong>
            </p>
          </>
        ) : (
          <>
            <div>
              <label className={LABEL} htmlFor="fp-desc">
                Descrição
              </label>
              <input id="fp-desc" className={CAMPO} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Sinal, Saldo final" maxLength={120} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="fp-valor">
                  {dividir ? "Valor total a dividir (R$)" : "Valor da parcela (R$)"}
                </label>
                <input id="fp-valor" className={`${CAMPO} text-right tabular-nums`} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" required />
              </div>
              <div>
                <label className={LABEL} htmlFor="fp-venc">
                  {dividir ? "Primeiro vencimento" : "Vencimento"}
                </label>
                <input id="fp-venc" type="date" className={CAMPO} value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
              </div>
            </div>
            {vencimento && vencimento < hoje && !editando && (
              <Aviso tom="cinza">O vencimento é anterior a hoje — a parcela já entra como vencida.</Aviso>
            )}
            {excede && (
              <Aviso>
                O valor passa do que ainda falta distribuir do contrato ({formatarBRL(Math.max(0, disponivelC!))}). Você pode salvar mesmo assim.
              </Aviso>
            )}
            <div>
              <label className={LABEL} htmlFor="fp-serv">
                Serviço vinculado (opcional)
              </label>
              <select id="fp-serv" className={CAMPO} value={servico} onChange={(e) => setServico(e.target.value)}>
                <option value="">Nenhum</option>
                {servicos.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {!editando && (
              <div className="rounded-xl border border-[#E6E9ED] p-3.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#20252B]">
                  <input type="checkbox" checked={dividir} onChange={(e) => setDividir(e.target.checked)} className="h-4 w-4 accent-[#24476B]" />
                  Dividir em parcelas
                </label>
                {dividir && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL} htmlFor="fp-qtd">
                        Quantidade
                      </label>
                      <input id="fp-qtd" type="number" min={2} max={60} className={CAMPO} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                    </div>
                    <div>
                      <label className={LABEL} htmlFor="fp-per">
                        Periodicidade
                      </label>
                      <select id="fp-per" className={CAMPO} value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as typeof periodicidade)}>
                        <option value="mensal">Mensal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="semanal">Semanal</option>
                      </select>
                    </div>
                    {plano.length > 0 && (
                      <p className="text-[13px] text-[#626B75] sm:col-span-2">
                        {plano.length}× de {formatarBRL(plano[0].valorC)}
                        {plano[plano.length - 1].valorC !== plano[0].valorC && ` (última ${formatarBRL(plano[plano.length - 1].valorC)})`} · você revisa antes de salvar.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              {mostrarObs ? (
                <>
                  <label className={LABEL} htmlFor="fp-obs">
                    Observações (opcional)
                  </label>
                  <textarea id="fp-obs" rows={3} className={CAMPO} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} maxLength={500} />
                </>
              ) : (
                <button type="button" onClick={() => setMostrarObs(true)} className="text-sm font-medium text-[#24476B] hover:underline">
                  + Adicionar observações
                </button>
              )}
            </div>

            {exigeMotivo && (
              <div>
                <label className={LABEL} htmlFor="fp-motivo">
                  Motivo da alteração
                </label>
                <input id="fp-motivo" className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Fica no histórico do financeiro" maxLength={300} />
              </div>
            )}
          </>
        )}
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}
