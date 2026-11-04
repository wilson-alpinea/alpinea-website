import type { Metadata } from "next";
import Link from "next/link";
import { exigirSomenteAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlSite } from "@/lib/crm/unidades";
import { GRUPOS_COMISSAO, ITENS_COMISSAO, formatarIene, lerValores } from "@/app/lib/comissaoTabela";
import { MULT_SEGURO_VENDEDOR } from "@/app/lib/margemSeguroViagemParceiro";
import { carregarTabelaPadrao } from "@/lib/crm/comissaoVendas";
import { salvarRegrasBeneficiario, salvarTabelaComissoes } from "@/app/crm/comissoesActions";

// Comissões por serviço (Wilson, 04/nov/2026 — migração 038), só admin:
// tabela padrão em ienes, exceções por empresa parceira (PJ) ou consultor
// (PF/PJ), preço do seguro no link de cada vendedor e os rascunhos de
// comissão aguardando revisão.

export const metadata: Metadata = {
  title: "Comissões — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const CARTAO = "rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "w-full rounded-lg border border-black/15 px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-[#24476B]";
const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
const PAPEL: Record<string, string> = { consultor: "Consultor", parceiro_agencia: "Usuário de parceiro" };

type Linha = { chave: string; id: string; nome: string; detalhe: string; excecoes: Record<string, number>; mult: number | null; link: string };

export default async function ComissoesPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  await exigirSomenteAdmin();
  const { ok, erro } = await searchParams;
  const db = createAdminClient();
  const [{ tabela, alteracoes, erro: semMigracao }, rPar, rPerf, rRasc] = await Promise.all([
    carregarTabelaPadrao(db),
    db.from("parceiros").select("*").in("tipo", ["agencia", "afiliado"]).order("nome"),
    db.from("perfis").select("*").in("papel", ["consultor", "parceiro_agencia"]).order("nome"),
    db.from("comissoes_vendas").select("cliente_id, origem, updated_at, updated_by_email, clientes(nome)").eq("status", "rascunho").order("updated_at", { ascending: false }).limit(50),
  ]);

  const linhas: Linha[] = [
    ...(rPar.data ?? []).map((p) => ({
      chave: `e:${p.id}`,
      id: p.id as string,
      nome: p.nome as string,
      detalhe: `Empresa parceira (PJ) · ${p.tipo === "afiliado" ? "afiliado" : "agência"}${p.ativo === false ? " · inativa" : ""}`,
      excecoes: lerValores(p.comissao_itens),
      mult: p.margem_seguro_mult == null ? null : Number(p.margem_seguro_mult),
      link: urlSite(`/produtos/seguro-viagem/direto?vendedor=e-${p.id}`),
    })),
    ...(rPerf.data ?? []).map((u) => ({
      chave: `u:${u.id}`,
      id: u.id as string,
      nome: (u.nome || u.email) as string,
      detalhe: `${PAPEL[u.papel as string] ?? "Usuário"}${u.email && u.nome ? ` · ${u.email}` : ""}`,
      excecoes: lerValores(u.comissao_itens),
      mult: u.margem_seguro_mult == null ? null : Number(u.margem_seguro_mult),
      link: urlSite(`/produtos/seguro-viagem/direto?vendedor=u-${u.id}`),
    })),
  ];
  const rascunhos = (rRasc.data ?? []) as unknown as { cliente_id: string; origem: string; updated_at: string; updated_by_email: string | null; clientes: { nome: string } | null }[];

  return (
    <div>
      <h1 className="text-[#20252B]">Comissões</h1>
      <p className="mt-0.5 max-w-3xl text-sm text-[#626B75]">
        Comissão por serviço vendido, em ienes. Serviço avulso: valor do item × quantidade; pacote personalizado: soma dos itens. Cada venda é lançada (ou
        pré-preenchida pela Calculadora Reversa) no card do cliente e só conta depois de aprovada por um admin. Receita em reais pelo câmbio comercial (PTAX).
      </p>

      {ok && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>}
      {erro && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      {semMigracao && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Rode a migração 038 no Supabase para salvar as comissões.</p>}

      {rascunhos.length > 0 && (
        <section className={`mt-6 ${CARTAO}`}>
          <h2 className="text-lg font-medium text-[#20252B]">Para revisar ({rascunhos.length})</h2>
          <ul className="mt-3 divide-y divide-black/5 text-sm">
            {rascunhos.map((r) => (
              <li key={r.cliente_id} className="flex flex-wrap justify-between gap-2 py-2">
                <Link href={`/crm/clientes/${r.cliente_id}#comissao`} className="font-medium text-[#24476B] underline-offset-2 hover:underline">
                  {r.clientes?.nome ?? "Cliente"}
                </Link>
                <span className="text-[13px] text-[#626B75]">
                  {r.origem === "calculadora" ? "Pré-preenchido pela calculadora" : "Lançado à mão"} · {dataHora(r.updated_at)}
                  {r.updated_by_email ? ` · ${r.updated_by_email}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={salvarTabelaComissoes} className={`mt-6 ${CARTAO}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-medium text-[#20252B]">Tabela padrão (¥)</h2>
          <button type="submit" className="rounded-xl bg-[#24476B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C5480]">
            Salvar tabela
          </button>
        </div>
        <p className="mt-1 text-[13px] text-[#626B75]">Vale para todos, menos onde houver exceção abaixo. Apague o valor para voltar ao padrão. Comissões já aprovadas não mudam.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {GRUPOS_COMISSAO.map((g) => (
            <fieldset key={g.id} className="rounded-xl border border-black/10 p-4">
              <legend className="px-1 text-[13px] font-medium text-[#20252B]">{g.label}</legend>
              <div className="space-y-2">
                {ITENS_COMISSAO.filter((i) => i.grupo === g.id).map((i) => {
                  const alt = alteracoes[i.id];
                  return (
                    <label key={i.id} className="grid grid-cols-[1fr_104px] items-center gap-2 text-[13px] text-[#20252B]">
                      <span>
                        {i.label}
                        <span className="block text-[12px] text-[#8A929B]">
                          por {i.bloco ? "¥100.000 trocados" : i.unidade}
                          {alt ? ` · alterado por ${alt.por ?? "admin"} (padrão ${formatarIene(i.padraoJPY)})` : ""}
                        </span>
                      </span>
                      <input name={`v_${i.id}`} inputMode="decimal" defaultValue={tabela[i.id]} aria-label={`${i.label} — valor em ienes`} className={CAMPO} />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </form>

      <section className={`mt-6 ${CARTAO}`}>
        <h2 className="text-lg font-medium text-[#20252B]">Parceiros e consultores</h2>
        <p className="mt-1 text-[13px] text-[#626B75]">
          Exceções em ¥ por serviço (vazio = tabela padrão) e preço do seguro no link de venda de cada um (vazio = {MULT_SEGURO_VENDEDOR}% do custo, definido em Preços).
          Custo operacional de quem participa da operação ainda não entra aqui.
        </p>
        {linhas.length === 0 ? (
          <p className="mt-3 text-sm text-[#626B75]">Nenhuma empresa parceira ou consultor cadastrado em Acessos.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {linhas.map((l) => {
              const nExc = Object.keys(l.excecoes).length;
              return (
                <li key={l.chave} id={`b-${l.id}`} className="scroll-mt-28 rounded-xl border border-black/10">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                      <span>
                        <span className="text-sm font-medium text-[#20252B]">{l.nome}</span>
                        <span className="ml-2 text-[13px] text-[#626B75]">{l.detalhe}</span>
                      </span>
                      <span className="text-[13px] text-[#626B75]">
                        {nExc ? `${nExc} ${nExc === 1 ? "exceção" : "exceções"}` : "Tabela padrão"} · seguro {l.mult ?? MULT_SEGURO_VENDEDOR}% do custo
                      </span>
                    </summary>
                    <form action={salvarRegrasBeneficiario.bind(null, l.chave)} className="border-t border-black/10 px-4 py-4">
                      <div className="grid gap-x-6 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
                        {ITENS_COMISSAO.map((i) => (
                          <label key={i.id} className="grid grid-cols-[1fr_96px] items-center gap-2 text-[13px] text-[#20252B]">
                            <span>
                              {i.label}
                              <span className="block text-[12px] text-[#8A929B]">padrão {formatarIene(tabela[i.id])}</span>
                            </span>
                            <input name={`x_${i.id}`} inputMode="decimal" defaultValue={l.excecoes[i.id] ?? ""} placeholder="—" aria-label={`${i.label} — exceção em ienes`} className={CAMPO} />
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-black/10 pt-4">
                        <label className="text-[13px] text-[#626B75]">
                          Seguro: preço final (% do custo)
                          <input name="margem_seguro_mult" inputMode="decimal" defaultValue={l.mult ?? ""} placeholder={String(MULT_SEGURO_VENDEDOR)} className={`mt-1 block w-32 ${CAMPO}`} />
                        </label>
                        <label className="min-w-0 flex-1 text-[13px] text-[#626B75]">
                          Link de venda do seguro deste vendedor
                          <input readOnly value={l.link} className="mt-1 block w-full rounded-lg border border-black/10 bg-black/[0.02] px-2 py-1.5 text-[13px] text-[#20252B]" />
                        </label>
                        <button type="submit" className="rounded-xl bg-[#24476B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C5480]">
                          Salvar
                        </button>
                      </div>
                    </form>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
