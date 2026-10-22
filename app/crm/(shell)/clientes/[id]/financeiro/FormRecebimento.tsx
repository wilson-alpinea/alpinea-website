"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET_ARQUIVOS_CLIENTE } from "@/lib/crm/arquivosStorage";
import { TIPOS_PAGAMENTO } from "@/lib/crm/pagamentos";
import { formatarBRL, formatarData, lerValorBRL, nomeParcela, type ParcelaCalculada } from "@/lib/crm/financeiro";
import { prepararUploadArquivoCliente } from "../../../../arquivosClienteActions";
import { registrarComprovante, registrarRecebimento } from "../../../../financeiroActions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Erro, LABEL, Painel, Spinner, novaChave } from "./ui";

const fmtCampo = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "Registrar recebimento": dinheiro que de fato entrou. Aceita valor parcial
// e vários lançamentos por parcela; nunca acima do saldo.
export function FormRecebimento({
  clienteId,
  parcela,
  hoje,
  onFechar,
}: {
  clienteId: string;
  parcela: ParcelaCalculada;
  hoje: string;
  onFechar: () => void;
}) {
  const [chave] = useState(novaChave);
  const [valor, setValor] = useState(fmtCampo(parcela.saldoC));
  const [data, setData] = useState(hoje);
  const [forma, setForma] = useState("");
  const [obs, setObs] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const enviando = useRef(false);

  const valorC = lerValorBRL(valor);
  const acimaDoSaldo = valorC !== null && valorC > parcela.saldoC;

  function confirmar() {
    if (enviando.current) return; // trava contra clique repetido
    if (valorC === null || valorC <= 0) return setErro("Informe um valor recebido maior que zero.");
    if (acimaDoSaldo) return setErro(`O valor é maior que o saldo desta parcela (${formatarBRL(parcela.saldoC)}). Registre no máximo o saldo.`);
    if (!data) return setErro("Informe a data do recebimento.");
    if (data > hoje) return setErro("A data do recebimento não pode ser futura.");
    if (!forma) return setErro("Escolha a forma de pagamento.");
    setErro(null);
    enviando.current = true;
    iniciar(async () => {
      let comprovanteId: string | null = null;
      if (arquivo) {
        setEtapa("Enviando comprovante…");
        const preparo = await prepararUploadArquivoCliente(clienteId, arquivo.name, arquivo.size);
        if (!preparo.ok) {
          enviando.current = false;
          setEtapa(null);
          return setErro(preparo.erro);
        }
        const { error } = await createClient()
          .storage.from(BUCKET_ARQUIVOS_CLIENTE)
          .uploadToSignedUrl(preparo.path, preparo.token, arquivo, { contentType: arquivo.type || "application/octet-stream" });
        if (error) {
          enviando.current = false;
          setEtapa(null);
          return setErro("Não foi possível enviar o comprovante. Tente de novo ou registre sem ele.");
        }
        const reg = await registrarComprovante(clienteId, preparo.path, arquivo.name, `Comprovante — ${nomeParcela(parcela)}`);
        if (!reg.ok) {
          enviando.current = false;
          setEtapa(null);
          return setErro(reg.erro);
        }
        comprovanteId = reg.id;
      }
      setEtapa("Registrando…");
      const r = await registrarRecebimento(clienteId, {
        pagamentoId: parcela.id,
        valorC: valorC!,
        data,
        forma,
        comprovanteId,
        observacoes: obs || null,
        chave,
      });
      setEtapa(null);
      if (r.ok) onFechar();
      else {
        enviando.current = false;
        setErro(r.erro);
      }
    });
  }

  return (
    <Painel
      titulo="Registrar recebimento"
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" onClick={onFechar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Cancelar
          </button>
          <button type="button" onClick={confirmar} className={BOTAO_PRIMARIO} disabled={pendente} aria-busy={pendente}>
            {pendente && <Spinner />}
            {pendente ? etapa ?? "Registrando…" : "Confirmar recebimento"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-[#F5F6F7] p-4 text-sm">
          <div className="col-span-2">
            <dt className="text-[13px] text-[#626B75]">Parcela</dt>
            <dd className="font-medium text-[#20252B]">{nomeParcela(parcela)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#626B75]">Vencimento</dt>
            <dd className="tabular-nums text-[#20252B]">{formatarData(parcela.data_vencimento)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[#626B75]">Saldo atual</dt>
            <dd className="font-semibold tabular-nums text-[#20252B]">{formatarBRL(parcela.saldoC)}</dd>
          </div>
        </dl>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rc-valor">
              Valor recebido (R$)
            </label>
            <input
              id="rc-valor"
              className={`${CAMPO} text-right tabular-nums ${acimaDoSaldo ? "border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/20" : ""}`}
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              aria-invalid={acimaDoSaldo}
              aria-describedby="rc-valor-ajuda"
            />
            <p id="rc-valor-ajuda" className={`mt-1 text-[13px] ${acimaDoSaldo ? "text-[#B42318]" : "text-[#626B75]"}`}>
              {acimaDoSaldo ? `Acima do saldo (${formatarBRL(parcela.saldoC)}).` : "Pode ser parcial."}
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="rc-data">
              Data do recebimento
            </label>
            <input id="rc-data" type="date" max={hoje} className={CAMPO} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={LABEL} htmlFor="rc-forma">
            Forma de pagamento
          </label>
          <select id="rc-forma" className={CAMPO} value={forma} onChange={(e) => setForma(e.target.value)}>
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
          <label className={LABEL} htmlFor="rc-comp">
            Comprovante (opcional)
          </label>
          <input
            id="rc-comp"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[#626B75] file:mr-3 file:rounded-lg file:border file:border-[#D5DAE0] file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#20252B]"
          />
          <p className="mt-1 text-[13px] text-[#626B75]">Fica também em Arquivos, como “Comprovante”.</p>
        </div>
        <div>
          <label className={LABEL} htmlFor="rc-obs">
            Observações (opcional)
          </label>
          <textarea id="rc-obs" rows={2} className={CAMPO} value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} />
        </div>
        <Erro>{erro}</Erro>
      </div>
    </Painel>
  );
}
