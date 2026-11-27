import { obterAcesso } from "@/lib/crm/acesso";
import { carregarComissaoPromotor, hojeSP, parcelasDaComissao, totalAprovado, type FatosLead } from "@/lib/crm/portalComissoes";
import {
  DIAS_EMPREGO_PARA_PAGAR,
  SITUACAO_PARCELA_LABEL,
  TIPO_COMISSAO_LABEL,
  VALORES_PROMOTOR,
  formatarDataCurta,
  formatarIeneP,
  isNivelPromotor,
  rotuloMes,
  rotuloNivel,
  type ParcelaPromotor,
} from "@/lib/crm/programaPromotores";
import { aprovarComissaoPromotor, reabrirComissaoPromotor, salvarComissaoPromotor } from "@/app/crm/promotoresActions";

// Comissão do promotor (Programa de Promotores — Wilson, 27/nov/2026,
// migração 042). Aparece no cliente e na candidatura quando o lead está
// atribuído a um promotor. A equipe lança; só admin aprova.

const CARTAO = "rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] md:p-8";
const CAMPO = "rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#24476B]";
const COR_SITUACAO: Record<ParcelaPromotor["situacao"], string> = {
  aguardando: "bg-black/[0.05] text-[#626B75]",
  liberada: "bg-emerald-50 text-emerald-700",
  nao_paga: "bg-red-50 text-red-700",
  desconto: "bg-amber-50 text-amber-800",
};

export function ListaParcelas({ parcelas }: { parcelas: ParcelaPromotor[] }) {
  return (
    <ul className="mt-2 divide-y divide-black/5 text-sm">
      {parcelas.map((p) => (
        <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2">
          <span className="text-[#20252B]">
            {p.descricao}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[12px] font-medium ${COR_SITUACAO[p.situacao]}`}>{SITUACAO_PARCELA_LABEL[p.situacao]}</span>
            <span className="block text-[13px] text-[#626B75]">
              {p.situacao === "liberada" || p.situacao === "desconto"
                ? `Extrato de ${rotuloMes(p.mesExtrato!).toLowerCase()} · pagamento até ${formatarDataCurta(p.pagamentoAte)}`
                : p.motivo}
            </span>
          </span>
          <span className="tabular-nums font-medium text-[#20252B]">{formatarIeneP(p.valorJPY)}</span>
        </li>
      ))}
    </ul>
  );
}

export async function ComissaoPromotorCard({
  origem,
  id,
  promotor,
  fatos,
  mensagem,
}: {
  origem: "cliente" | "candidatura";
  id: string;
  promotor: { nome: string; nivel_promotor?: string | null; codigo_promotor?: string | null };
  fatos: FatosLead;
  mensagem: { ok?: boolean; erro?: string };
}) {
  const acesso = await obterAcesso();
  const ehAdmin = acesso?.papel === "admin";
  const c = await carregarComissaoPromotor(origem === "cliente" ? { cliente_id: id } : { candidatura_id: id });
  if (c && "erro" in c) {
    return (
      <section id="comissao-promotor" className={`mt-6 scroll-mt-28 ${CARTAO}`}>
        <h2 className="text-lg font-medium text-[#20252B]">Comissão do promotor</h2>
        <p className="mt-2 text-sm text-amber-700">Rode a migração 042 no Supabase para usar o Programa de Promotores.</p>
      </section>
    );
  }
  const nivelAtual = isNivelPromotor(promotor.nivel_promotor) ? promotor.nivel_promotor : "bronze";
  const aprovada = c?.status === "aprovada";
  const parcelas = c ? parcelasDaComissao(c, fatos, hojeSP()) : [];
  const valores = VALORES_PROMOTOR[nivelAtual];
  const salvar = salvarComissaoPromotor.bind(null, origem, id);
  const aprovar = aprovarComissaoPromotor.bind(null, origem, id);
  const reabrir = reabrirComissaoPromotor.bind(null, origem, id);
  const viagem = origem === "cliente";

  return (
    <section id="comissao-promotor" className={`mt-6 scroll-mt-28 ${CARTAO}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-medium text-[#20252B]">Comissão do promotor</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${aprovada ? "bg-emerald-50 text-emerald-700" : c ? "bg-amber-50 text-amber-800" : "bg-black/[0.05] text-[#626B75]"}`}>
          {aprovada ? "Aprovada" : c ? "Rascunho — aguardando aprovação" : "Não lançada"}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-[#626B75]">
        {promotor.nome} · nível atual {rotuloNivel(nivelAtual)}
        {promotor.codigo_promotor ? ` · código ${promotor.codigo_promotor}` : ""}. O promotor vê este lead, o status e o valor a receber no portal dele.
      </p>
      {mensagem.erro && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{mensagem.erro}</p>}
      {mensagem.ok && <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">Comissão do promotor salva.</p>}

      {aprovada ? (
        <div className="mt-4">
          <p className="text-sm text-[#20252B]">
            {TIPO_COMISSAO_LABEL[c.tipo].label}
            {c.vaga_incentivada ? " (vaga incentivada)" : ""} — {c.quantidade} {TIPO_COMISSAO_LABEL[c.tipo].unidade}
            {c.quantidade === 1 ? "" : "s"} × {formatarIeneP(c.valor_unitario_jpy ?? 0)} = <strong className="tabular-nums">{formatarIeneP(totalAprovado(c))}</strong>
          </p>
          <p className="mt-1 text-[13px] text-[#626B75]">
            Nível {rotuloNivel(c.nivel)} na aprovação · aprovada por {c.aprovado_por_email ?? "admin"} em {formatarDataCurta(c.aprovado_em)}
          </p>
          <ListaParcelas parcelas={parcelas} />
          <form action={salvar} className="mt-4 flex flex-wrap items-end gap-3 border-t border-black/10 pt-4">
            {viagem ? (
              <label className="text-[13px] text-[#626B75]">
                Viagem cancelada em
                <input type="date" name="cancelado_em" defaultValue={c.cancelado_em ?? ""} className={`mt-1 block ${CAMPO}`} />
              </label>
            ) : (
              <label className="text-[13px] text-[#626B75]">
                Saiu do trabalho em
                <input type="date" name="desligado_em" defaultValue={c.desligado_em ?? ""} className={`mt-1 block ${CAMPO}`} />
              </label>
            )}
            <label className="min-w-0 flex-1 text-[13px] text-[#626B75]">
              Observação
              <input name="observacao" defaultValue={c.observacao ?? ""} maxLength={1000} className={`mt-1 block w-full ${CAMPO}`} />
            </label>
            <button type="submit" className="rounded-xl border border-black/15 px-4 py-2 text-sm text-[#20252B] hover:border-black/40">
              Salvar
            </button>
          </form>
          <p className="mt-2 text-[12px] text-[#8A929B]">
            {viagem ? "Remarcação não é cancelamento. Cancelada depois da quitação, os 50% já liberados são descontados da próxima comissão." : `Saída antes de ${DIAS_EMPREGO_PARA_PAGAR} dias do início = não paga.`}
          </p>
          {ehAdmin && (
            <form action={reabrir} className="mt-3">
              <button type="submit" className="rounded-xl border border-black/15 px-4 py-2 text-sm text-[#20252B] hover:border-black/40">
                Reabrir para editar
              </button>
            </form>
          )}
        </div>
      ) : (
        <form action={salvar} className="mt-4 space-y-4">
          {viagem ? (
            <div className="flex flex-wrap items-end gap-4">
              <fieldset>
                <legend className="mb-1 text-[13px] text-[#626B75]">O que foi vendido</legend>
                <div className="flex flex-wrap gap-2">
                  {(["pacote", "passagem"] as const).map((t) => (
                    <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-black/15 px-3 py-2 text-sm text-[#20252B]">
                      <input type="radio" name="tipo" value={t} defaultChecked={(c?.tipo ?? "pacote") === t} className="h-4 w-4 accent-[#24476B]" />
                      {TIPO_COMISSAO_LABEL[t].label} · {formatarIeneP(valores[t])}/{TIPO_COMISSAO_LABEL[t].unidade}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="text-[13px] text-[#626B75]">
                Passageiros / bilhetes
                <input name="quantidade" type="number" min={1} max={99} defaultValue={c?.quantidade ?? 1} className={`mt-1 block w-28 ${CAMPO}`} />
              </label>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm text-[#20252B]">
              <input type="checkbox" name="vaga_incentivada" defaultChecked={c?.vaga_incentivada ?? false} className="h-4 w-4 accent-[#24476B]" />
              Vaga incentivada ({formatarIeneP(valores.incentivada)} em vez de {formatarIeneP(valores.contratacao)})
            </label>
          )}
          <label className="block text-[13px] text-[#626B75]">
            Observação
            <input name="observacao" defaultValue={c?.observacao ?? ""} maxLength={1000} className={`mt-1 block w-full ${CAMPO}`} />
          </label>
          <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-[#626B75]">
            <li>Confira se o código do promotor foi registrado no primeiro contato — sem código no primeiro contato, a venda não é atribuída.</li>
            <li>Cliente ou candidato ativo nos últimos 6 meses não gera comissão.</li>
            {viagem ? (
              <li>Pacote completo = no mínimo aéreo, roteiro, hospedagem e seguro viagem. Sem algum deles, só o aéreo paga, como passagem avulsa.</li>
            ) : (
              <li>
                Paga quando o contratado completa {DIAS_EMPREGO_PARA_PAGAR} dias, contados da etapa “Início das atividades”
                {fatos.inicioEm ? ` (marcada em ${formatarDataCurta(fatos.inicioEm)})` : " — ainda não marcada"}.
              </li>
            )}
            {viagem && (
              <li>
                Quitação: {fatos.quitadoEm ? formatarDataCurta(fatos.quitadoEm) : "ainda não (recebido abaixo do valor contratado)"} · embarque: {fatos.embarque ? formatarDataCurta(fatos.embarque) : "a definir"}.
              </li>
            )}
            <li>Na aprovação ficam gravados o nível ({rotuloNivel(nivelAtual)}) e o valor deste momento.</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-xl border border-black/15 px-4 py-2 text-sm text-[#20252B] hover:border-black/40">
              Salvar rascunho
            </button>
            {ehAdmin && (
              <button type="submit" formAction={aprovar} className="rounded-xl bg-[#24476B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C5480]">
                Aprovar comissão
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
