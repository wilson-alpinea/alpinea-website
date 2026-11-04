import Link from "next/link";
import { obterAcesso } from "@/lib/crm/acesso";
import { GRUPOS_COMISSAO, ITENS_COMISSAO, formatarIene } from "@/app/lib/comissaoTabela";
import { beneficiariosDoCliente, calcularBeneficiarios, carregarTabelaPadrao, carregarVenda, cotacaoComercial } from "@/lib/crm/comissaoVendas";
import { aprovarComissaoVenda, reabrirComissaoVenda, salvarComissaoVenda } from "@/app/crm/comissoesActions";

// Comissão da venda (Wilson, 04/nov/2026 — migração 038): serviços e
// quantidades pré-preenchidos pela Calculadora Reversa ou lançados à mão,
// revisados pela equipe e aprovados por um admin. Valores em ¥ pela tabela
// /crm/comissoes; em reais pelo câmbio comercial (PTAX).

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
const CARTAO = "rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] md:p-8";

export async function ComissaoVendaCard({
  clienteId,
  cliente,
  mensagem,
}: {
  clienteId: string;
  cliente: { parceiro_id?: string | null; responsavel_id?: string | null };
  mensagem: { ok?: boolean; erro?: string };
}) {
  const acesso = await obterAcesso();
  const ehAdmin = acesso?.papel === "admin";
  const venda = await carregarVenda(clienteId);
  if (venda && "erro" in venda) {
    return (
      <section id="comissao" className={`mt-6 scroll-mt-28 ${CARTAO}`}>
        <h2 className="text-lg font-medium text-[#20252B]">Comissão</h2>
        <p className="mt-2 text-sm text-amber-700">Rode a migração 038 no Supabase para usar as comissões por serviço.</p>
      </section>
    );
  }
  const [{ tabela }, beneficiarios, ptax] = await Promise.all([carregarTabelaPadrao(), beneficiariosDoCliente(cliente), cotacaoComercial()]);
  const aprovada = venda?.status === "aprovada" && venda.snapshot;
  const quantidades = venda?.quantidades ?? {};
  const cotacao = venda?.cotacao_brl_por_jpy ?? ptax.valor;
  const calculo = calcularBeneficiarios(quantidades, tabela, beneficiarios, venda?.beneficiarios_excluidos ?? [], cotacao);
  const salvar = salvarComissaoVenda.bind(null, clienteId);
  const aprovar = aprovarComissaoVenda.bind(null, clienteId);
  const reabrir = reabrirComissaoVenda.bind(null, clienteId);

  return (
    <section id="comissao" className={`mt-6 scroll-mt-28 ${CARTAO}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-medium text-[#20252B]">Comissão</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${aprovada ? "bg-emerald-50 text-emerald-700" : venda ? "bg-amber-50 text-amber-800" : "bg-black/[0.05] text-[#626B75]"}`}
        >
          {aprovada ? "Aprovada" : venda ? (venda.origem === "calculadora" ? "Rascunho da calculadora — revisar" : "Rascunho — aguardando aprovação") : "Sem serviços lançados"}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-[#626B75]">
        Serviços vendidos e quantidades. Valores pela{" "}
        {ehAdmin ? (
          <Link href="/crm/comissoes" className="underline underline-offset-2">
            tabela de comissões
          </Link>
        ) : (
          "tabela de comissões"
        )}{" "}
        (exceções do parceiro/consultor têm prioridade). Pacote personalizado = soma dos itens.
      </p>
      {mensagem.erro && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{mensagem.erro}</p>}
      {mensagem.ok && <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">Comissão salva.</p>}

      {beneficiarios.length === 0 && (
        <p className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2.5 text-sm text-[#626B75]">
          Este cliente não tem empresa parceira nem consultor responsável — não há comissão a pagar. Defina o parceiro ou o responsável nos dados do cliente.
        </p>
      )}

      {aprovada ? (
        <div className="mt-4">
          <p className="text-[13px] text-[#626B75]">
            Aprovada por {venda.aprovado_por_email ?? "admin"} em {dataHora(venda.aprovado_em!)} · câmbio comercial ¥1 = R$ {venda.snapshot!.cotacaoBRLporJPY.toFixed(5)}
          </p>
          {venda.snapshot!.beneficiarios.map((b) => (
            <div key={b.chave} className="mt-4 rounded-xl border border-black/10 p-4">
              <p className="flex justify-between gap-3 text-sm font-medium text-[#20252B]">
                <span>
                  {b.nome} <span className="font-normal text-[#626B75]">· {b.tipo === "empresa" ? "empresa parceira" : "consultor"}</span>
                </span>
                <span className="tabular-nums">
                  {formatarIene(b.totalJPY)} · {brl(b.totalBRL)}
                </span>
              </p>
              <ul className="mt-2 space-y-1 text-[13px] text-[#626B75]">
                {b.linhas.map((l) => (
                  <li key={l.item} className="flex justify-between gap-3">
                    <span>
                      {l.label} — {l.item === "cambio" ? `¥ ${l.quantidade.toLocaleString("pt-BR")}` : l.quantidade} × {formatarIene(l.valorJPY)}
                      {l.excecao ? " (exceção)" : ""}
                    </span>
                    <span className="tabular-nums text-[#20252B]">{formatarIene(l.totalJPY)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {venda.observacao && <p className="mt-3 whitespace-pre-wrap text-[13px] text-[#20252B]">Obs.: {venda.observacao}</p>}
          <p className="mt-3 text-sm font-medium text-[#20252B]">
            Total: {formatarIene(venda.snapshot!.totalJPY)} · {brl(venda.snapshot!.totalBRL)}
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
        <form action={salvar} className="mt-4 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {GRUPOS_COMISSAO.map((g) => (
              <fieldset key={g.id} className="rounded-xl border border-black/10 p-4">
                <legend className="px-1 text-[13px] font-medium text-[#20252B]">{g.label}</legend>
                <div className="space-y-2">
                  {ITENS_COMISSAO.filter((i) => i.grupo === g.id).map((i) => (
                    <label key={i.id} className="grid grid-cols-[1fr_96px] items-center gap-2 text-[13px] text-[#20252B]">
                      <span>
                        {i.label}
                        <span className="block text-[12px] text-[#8A929B]">
                          {formatarIene(tabela[i.id])} por {i.bloco ? "¥100.000" : i.unidade}
                        </span>
                      </span>
                      <input
                        name={`q_${i.id}`}
                        inputMode="decimal"
                        defaultValue={quantidades[i.id] ?? ""}
                        placeholder={i.bloco ? "¥" : "0"}
                        aria-label={`${i.label} — quantidade (${i.unidade})`}
                        className="w-full rounded-lg border border-black/15 px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-[#24476B]"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {calculo.length > 0 && (
            <div className="rounded-xl border border-black/10 bg-[#F7F9FB] p-4">
              <p className="text-[13px] font-medium text-[#20252B]">Prévia (com os valores salvos)</p>
              <ul className="mt-2 space-y-2">
                {calculo.map((b) => (
                  <li key={b.chave} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="excluir" value={b.chave} defaultChecked={b.excluido} />
                      <span className={b.excluido ? "text-[#8A929B] line-through" : "text-[#20252B]"}>
                        {b.nome} <span className="text-[#626B75]">· {b.tipo === "empresa" ? "empresa parceira" : "consultor"}</span>
                        {Object.keys(b.excecoes).length > 0 && <span className="text-[12px] text-[#93703D]"> · tem exceções</span>}
                      </span>
                    </label>
                    <span className="tabular-nums text-[#20252B]">
                      {formatarIene(b.totalJPY)} · {brl(b.totalBRL)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] text-[#626B75]">Marque para NÃO pagar comissão a esse beneficiário nesta venda.</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <label className="text-[13px] text-[#626B75]">
              Câmbio comercial (R$ por ¥1)
              <input
                name="cotacao"
                inputMode="decimal"
                defaultValue={venda?.cotacao_brl_por_jpy ?? ""}
                placeholder={ptax.valor.toFixed(5)}
                className="mt-1 block w-full rounded-lg border border-black/15 px-2.5 py-1.5 text-sm tabular-nums"
              />
              <span className="mt-0.5 block text-[12px]">
                Vazio = PTAX {ptax.fallback ? "(BCB indisponível, valor de reserva)" : ptax.data ? `de ${ptax.data}` : "do dia"} na aprovação.
              </span>
            </label>
            <label className="text-[13px] text-[#626B75]">
              Observação
              <textarea name="observacao" rows={2} maxLength={1000} defaultValue={venda?.observacao ?? ""} className="mt-1 block w-full rounded-lg border border-black/15 px-2.5 py-1.5 text-sm text-[#20252B]" />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-xl border border-[#24476B] px-4 py-2 text-sm font-medium text-[#24476B] hover:bg-[#24476B]/5">
              Salvar rascunho
            </button>
            {ehAdmin && beneficiarios.length > 0 && (
              <button formAction={aprovar} type="submit" className="rounded-xl bg-[#28665D] px-4 py-2 text-sm font-medium text-white hover:bg-[#20564C]">
                Aprovar comissão
              </button>
            )}
          </div>
          <p className="text-[12px] text-[#626B75]">
            {ehAdmin ? "Aprovar salva o que está na tela e congela os valores (mudanças na tabela não afetam comissões aprovadas)." : "Só administradores aprovam a comissão."}
            {venda?.updated_at ? ` Última edição: ${venda.updated_by_email ?? "equipe"} em ${dataHora(venda.updated_at)}.` : ""}
          </p>
        </form>
      )}
    </section>
  );
}
