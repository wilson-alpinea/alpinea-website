import type { Metadata } from "next";
import { exigirParceiro } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ESTAGIOS } from "@/lib/crm/estagios";
import { PRODUTO_PRINCIPAL_LABEL, type ProdutoPrincipal } from "@/lib/crm/produtos";
import { progressoCandidatura } from "@/lib/crm/empregos";
import type { Estagio } from "@/lib/crm/types";
import { PortalShell } from "../PortalShell";
import { lerAcessoUsuarioParceiro, lerProdutosParceiro, lerUnidadesParceiro, produtosLiberadosParceiro, unidadeLiberada } from "@/lib/crm/permissoes";
import {
  comissoesAgencia,
  datasQuitacao,
  extratoAgencia,
  extratoPromotor,
  hojeSP,
  itensPromotores,
  pagamentosDo,
  totalAprovado,
  type ItemPromotor,
  type MesExtrato,
} from "@/lib/crm/portalComissoes";
import {
  DIAS_EMPREGO_PARA_PAGAR,
  JANELA_ATRIBUICAO_DIAS,
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

// Portal do parceiro da agência, do afiliado e do promotor (Wilson,
// 21/out/2026; Programa de Promotores 27/nov/2026: "acesso claro a todas as
// informações dos leads deles, bem como pagamento e prazo de pagamento,
// tanto para empregos quanto turismo"). Só leitura, com service role,
// filtrando pelo parceiro do usuário logado. Não mostra contato do cliente
// nem do candidato, notas internas, pagamentos do cliente ou o motivo de
// eliminação de candidatos (regra fixa do fluxo /empregos). O que aparece
// aqui é a mesma base do extrato e do pagamento em /crm/comissoes.

export const metadata: Metadata = {
  title: "Meus leads — Ajisai",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

type LeadViagem = {
  id: string;
  nome: string;
  estagio: Estagio;
  produto_principal: string | null;
  produto_secundario: string[] | null;
  valor_proposta: number | null;
  valor_contratado: number | null;
  data_viagem: string | null;
  created_at: string;
  arquivado_em: string | null;
};

const CARTAO = "rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] md:p-6";
const brl = (v: number | null | undefined) => (v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "—");
const brlC = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (iso: string | null) => (iso ? formatarDataCurta(iso.length === 10 ? iso : new Date(Date.parse(iso) - 3 * 3600_000).toISOString()) : "—");
const ROTULO_ESTAGIO = new Map(ESTAGIOS.map((e) => [e.valor, e.label]));
const COR_PARCELA: Record<ParcelaPromotor["situacao"], string> = {
  aguardando: "text-[#626B75]",
  liberada: "text-emerald-700",
  nao_paga: "text-red-700",
  desconto: "text-amber-800",
};

function Selo({ texto, cor }: { texto: string; cor: "cinza" | "verde" | "azul" | "vermelho" | "ambar" }) {
  const c = { cinza: "bg-black/[0.05] text-[#626B75]", verde: "bg-emerald-50 text-emerald-700", azul: "bg-[#EAF1F8] text-[#24476B]", vermelho: "bg-red-50 text-red-700", ambar: "bg-amber-50 text-amber-800" }[cor];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium ${c}`}>{texto}</span>;
}

function situacaoViagem(l: LeadViagem, quitadoEm: string | null, canceladoEm: string | null, hoje: string): { texto: string; cor: "cinza" | "verde" | "azul" | "vermelho" | "ambar" } {
  if (canceladoEm) return { texto: "Cancelada", cor: "vermelho" };
  if (l.estagio === "fechado_perdido") return { texto: "Não fechou", cor: "cinza" };
  if (l.estagio === "fechado_ganho") {
    if (l.data_viagem && l.data_viagem <= hoje) return { texto: "Embarcou", cor: "verde" };
    if (quitadoEm) return { texto: "Quitada", cor: "verde" };
    return { texto: "Fechada — aguardando quitação", cor: "azul" };
  }
  if (l.arquivado_em) return { texto: "Arquivado", cor: "cinza" };
  return { texto: ROTULO_ESTAGIO.get(l.estagio) ?? "Em andamento", cor: "ambar" };
}

function Parcelas({ parcelas }: { parcelas: ParcelaPromotor[] }) {
  return (
    <ul className="mt-1 space-y-0.5 text-[12px]">
      {parcelas.map((p) => (
        <li key={p.id} className={COR_PARCELA[p.situacao]}>
          {formatarIeneP(p.valorJPY)} — {p.descricao.toLowerCase()}: {SITUACAO_PARCELA_LABEL[p.situacao].toLowerCase()}
          {p.situacao === "liberada" || p.situacao === "desconto" ? `, pagamento até ${formatarDataCurta(p.pagamentoAte)}` : p.motivo ? ` (${p.motivo.toLowerCase()})` : ""}
        </li>
      ))}
    </ul>
  );
}

function Extrato({ meses, hoje, promotor }: { meses: MesExtrato[]; hoje: string; promotor: boolean }) {
  return (
    <section className={`mt-6 ${CARTAO}`}>
      <h2 className="text-lg font-medium text-[#20252B]">Extrato e pagamentos</h2>
      <p className="mt-1 text-[13px] text-[#626B75]">
        {promotor
          ? "Pago em ienes pela Ajisai Japan, até o dia 15 do mês seguinte ao mês em que cada valor foi liberado."
          : "Comissões aprovadas pela equipe, pagas até o 10º dia útil do mês seguinte ao mês da aprovação."}
      </p>
      {meses.length === 0 ? (
        <p className="mt-3 text-sm text-[#626B75]">Ainda não há valores liberados. Eles aparecem aqui assim que a primeira comissão for liberada.</p>
      ) : (
        <ul className="mt-3 divide-y divide-black/5">
          {meses.map((m) => {
            const valor = m.moeda === "JPY" ? formatarIeneP(m.total) : brlC(m.total);
            const atrasado = !m.pago && m.total > 0 && m.prazo < hoje;
            return (
              <li key={m.mes} className="py-3">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-[#20252B]">
                      {rotuloMes(m.mes)} · <span className="tabular-nums">{valor}</span>
                    </span>
                    {m.pago ? (
                      <Selo texto={`Pago em ${formatarDataCurta(m.pago.pago_em)}`} cor="verde" />
                    ) : m.total <= 0 ? (
                      <Selo texto="Sem valor a pagar" cor="cinza" />
                    ) : (
                      <Selo texto={`${atrasado ? "Em atraso — " : "A receber até "}${formatarDataCurta(m.prazo)}`} cor={atrasado ? "vermelho" : "azul"} />
                    )}
                  </summary>
                  <ul className="mt-2 space-y-0.5 text-[13px] text-[#626B75]">
                    {m.itens.map((i, k) => (
                      <li key={k} className="flex justify-between gap-3">
                        <span>
                          {i.lead} — {i.descricao}
                        </span>
                        <span className="tabular-nums">{m.moeda === "JPY" ? formatarIeneP(i.valor) : brlC(i.valor)}</span>
                      </li>
                    ))}
                  </ul>
                  {m.pago?.observacao && <p className="mt-1 text-[12px] text-[#8A929B]">Obs.: {m.pago.observacao}</p>}
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default async function PortalParceiroPage() {
  const acesso = await exigirParceiro("agencia");
  const admin = createAdminClient();
  const hoje = hojeSP();
  const ehPromotor = acesso.parceiro.tipo === "promotor";
  const chave = `e:${acesso.parceiro.id}`;

  // Produtos e unidades liberados: empresa × usuário (Acessos). Vazio = todos.
  const [{ data: emp }, { data: perfil }] = await Promise.all([
    admin.from("parceiros").select("*").eq("id", acesso.parceiro.id).maybeSingle(),
    admin.from("perfis").select("*").eq("id", acesso.userId).maybeSingle(),
  ]);
  const acessoUsuario = lerAcessoUsuarioParceiro(perfil?.permissoes);
  const liberados = produtosLiberadosParceiro(lerProdutosParceiro(emp?.produtos), acessoUsuario.produtos);
  const unidadesEmp = lerUnidadesParceiro(emp?.unidades);
  const veViagens = unidadeLiberada(unidadesEmp, "agencia") && unidadeLiberada(acessoUsuario.unidades, "agencia");
  const veEmpregos = unidadeLiberada(unidadesEmp, "empregos") && unidadeLiberada(acessoUsuario.unidades, "empregos");

  const [rCli, rCand, { pagamentos }, promotor, agencia] = await Promise.all([
    veViagens
      ? admin.from("clientes").select("id, nome, estagio, produto_principal, produto_secundario, valor_proposta, valor_contratado, data_viagem, created_at, arquivado_em").eq("parceiro_id", acesso.parceiro.id).order("created_at", { ascending: false }).limit(2000)
      : Promise.resolve({ data: [], error: null }),
    veEmpregos
      ? admin.from("candidaturas_vagas").select("*").eq("parceiro_id", acesso.parceiro.id).order("created_at", { ascending: false }).limit(2000)
      : Promise.resolve({ data: [], error: null }),
    pagamentosDo(chave, admin),
    ehPromotor ? itensPromotores(admin, acesso.parceiro.id) : Promise.resolve({ itens: [] as ItemPromotor[], erro: false }),
    ehPromotor ? Promise.resolve(new Map()) : comissoesAgencia(acesso.parceiro.id, admin),
  ]);
  if (rCli.error) console.error("Erro ao carregar leads do parceiro:", rCli.error);

  const leads = ((rCli.data ?? []) as LeadViagem[]).filter(
    (l) => !/^\s*\[TESTE\]/i.test(l.nome) && (!liberados || (!!l.produto_principal && liberados.includes(l.produto_principal)) || (l.produto_secundario ?? []).some((p) => liberados.includes(p))),
  );
  // Candidatura sem a coluna parceiro_id (migração 042 não rodada) volta vazia.
  const candidaturas = ((rCand.error ? [] : rCand.data) ?? []) as Record<string, unknown>[];
  const idsLeads = new Set(leads.map((l) => l.id));
  const quitacao = await datasQuitacao(leads.filter((l) => l.estagio === "fechado_ganho"), admin);

  const comissaoDoCliente = new Map(promotor.itens.filter((i) => i.comissao.cliente_id).map((i) => [i.comissao.cliente_id!, i]));
  const comissaoDaCandidatura = new Map(promotor.itens.filter((i) => i.comissao.candidatura_id).map((i) => [i.comissao.candidatura_id!, i]));

  // Extrato: só o que o parceiro pode ver (unidade/produto liberados).
  const meses = ehPromotor
    ? extratoPromotor(
        promotor.itens.filter((i) => (i.comissao.cliente_id ? veViagens && idsLeads.has(i.comissao.cliente_id) : veEmpregos)),
        pagamentos,
      )
    : extratoAgencia(
        leads.filter((l) => agencia.has(l.id)).map((l) => ({ lead: l.nome, c: agencia.get(l.id)! })),
        pagamentos,
      );
  const aReceber = meses.filter((m) => !m.pago && m.total > 0);
  const totalAReceber = aReceber.reduce((s, m) => s + m.total, 0);
  const proximo = [...aReceber].sort((a, b) => a.prazo.localeCompare(b.prazo))[0];
  const moedaExtrato = ehPromotor ? "JPY" : "BRL";
  const fmt = (v: number) => (moedaExtrato === "JPY" ? formatarIeneP(v) : brlC(v));
  // Ainda a liberar (promotor): parcelas aprovadas aguardando quitação, embarque ou 30 dias.
  const aLiberar = promotor.itens.reduce((s, i) => s + i.parcelas.filter((p) => p.situacao === "aguardando").reduce((t, p) => t + p.valorJPY, 0), 0);

  const nivel = isNivelPromotor(acesso.parceiro.nivel_promotor) ? acesso.parceiro.nivel_promotor : "bronze";
  const valores = VALORES_PROMOTOR[nivel];
  const linkSite = `https://www.alpinea.io/?parceiro=${acesso.parceiro.slug}`;
  const linkEmpregos = `https://www.alpinea.io/empregos?parceiro=${acesso.parceiro.slug}`;
  const fechados = leads.filter((l) => l.estagio === "fechado_ganho").length;

  return (
    <PortalShell
      titulo={ehPromotor ? "Promotores" : "Parceiros"}
      empresa={acesso.parceiro.nome}
      logo={acesso.parceiro.logo_url}
      usuario={acesso.email}
      crm={{ nome: ehPromotor ? `Promotor ${rotuloNivel(nivel)}` : "Agência de viagens", cor: ehPromotor ? "#9A3D5C" : "#24476B" }}
    >
      <p className="mb-2 text-[13px] text-[#626B75]">Leads indicados por você</p>
      <h1 className="text-3xl font-medium md:text-4xl">Meus leads e comissões</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ...(veViagens ? [["Leads de viagem", `${leads.length}`, `${fechados} fechado(s)`]] : []),
          ...(veEmpregos ? [["Candidaturas", `${candidaturas.length}`, ehPromotor ? `${promotor.itens.filter((i) => i.comissao.candidatura_id).length} contratação(ões)` : ""]] : []),
          ["A receber", aReceber.length ? fmt(totalAReceber) : "—", proximo ? `próximo até ${formatarDataCurta(proximo.prazo)}` : "nada pendente"],
          ...(ehPromotor ? [["Ainda a liberar", aLiberar ? formatarIeneP(aLiberar) : "—", "aprovado, aguardando a regra"]] : []),
        ].map(([r, v, d]) => (
          <div key={r} className="rounded-xl border border-black/5 bg-white p-4">
            <p className="text-[13px] text-[#626B75]">{r}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{v}</p>
            {d && <p className="text-[12px] text-[#8A929B]">{d}</p>}
          </div>
        ))}
      </div>

      <section className={`mt-6 ${CARTAO}`}>
        <h2 className="text-lg font-medium text-[#20252B]">{ehPromotor ? "Seu código e seus links" : "Seu link de indicação"}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {ehPromotor && acesso.parceiro.codigo_promotor && (
            <div className="md:col-span-2">
              <p className="text-[13px] text-[#626B75]">Código para o WhatsApp</p>
              <p className="mt-0.5 font-mono text-lg font-medium text-[#20252B]">{acesso.parceiro.codigo_promotor}</p>
              <p className="text-[12px] text-[#8A929B]">Peça ao seguidor para informar o código no primeiro contato. Sem o código no primeiro contato, a venda não é atribuída.</p>
            </div>
          )}
          {veViagens && (
            <div>
              <p className="text-[13px] text-[#626B75]">Viagens (site)</p>
              <code className="mt-0.5 block break-all text-[13px] text-[#1C3A5E]">{linkSite}</code>
            </div>
          )}
          {veEmpregos && (
            <div>
              <p className="text-[13px] text-[#626B75]">Vagas de emprego</p>
              <code className="mt-0.5 block break-all text-[13px] text-[#1C3A5E]">{linkEmpregos}</code>
            </div>
          )}
        </div>
        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[13px] text-[#626B75]">
          <li>
            Vale o primeiro código que a pessoa abriu. Viagem: pedido em até {ehPromotor ? JANELA_ATRIBUICAO_DIAS.viagem : 30} dias; emprego: candidatura em até {JANELA_ATRIBUICAO_DIAS.emprego} dias.
          </li>
          {ehPromotor && <li>Cliente ou candidato ativo com a Ajisai nos últimos 6 meses não gera comissão.</li>}
          <li>O link funciona em qualquer página do site, ex.: alpinea.io/produtos/jrpass?parceiro={acesso.parceiro.slug}</li>
        </ul>
        {ehPromotor && (
          <details className="mt-3 text-[13px] text-[#626B75]">
            <summary className="cursor-pointer font-medium text-[#20252B]">Quanto você ganha no nível {rotuloNivel(nivel)}</summary>
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              <li>Pacote completo (aéreo, roteiro, hospedagem e seguro viagem): {formatarIeneP(valores.pacote)} por passageiro — 50% quando o cliente quita a viagem e 50% no mês seguinte ao embarque.</li>
              <li>Passagem avulsa: {formatarIeneP(valores.passagem)} por bilhete, nas mesmas duas partes.</li>
              <li>
                Contratação: {formatarIeneP(valores.contratacao)} por pessoa ({formatarIeneP(valores.incentivada)} em vaga incentivada), quando o contratado completa {DIAS_EMPREGO_PARA_PAGAR} dias de trabalho. Candidatura sozinha não paga.
              </li>
              <li>Viagem cancelada: os 50% já pagos são descontados da próxima comissão. Remarcação não cancela.</li>
              <li>O nível é revisado em jan, abr, jul e out, pelo resultado do trimestre.</li>
            </ul>
          </details>
        )}
      </section>

      <Extrato meses={meses} hoje={hoje} promotor={ehPromotor} />

      {veViagens && (
        <section className={`mt-6 ${CARTAO}`}>
          <h2 className="text-lg font-medium text-[#20252B]">Viagens</h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-[#626B75]">Nenhum lead de viagem ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/5">
              {leads.map((l) => {
                const item = comissaoDoCliente.get(l.id);
                const ag = agencia.get(l.id);
                const sit = situacaoViagem(l, quitacao.get(l.id) ?? null, item?.comissao.cancelado_em ?? null, hoje);
                return (
                  <li key={l.id} className="grid gap-2 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.6fr)] md:items-start md:gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#20252B]">{l.nome}</p>
                      <p className="text-[13px] text-[#626B75]">
                        {l.produto_principal ? (PRODUTO_PRINCIPAL_LABEL[l.produto_principal as ProdutoPrincipal] ?? l.produto_principal) : "Produto a definir"} · entrou em {dataBR(l.created_at)}
                      </p>
                    </div>
                    <div className="text-[13px] text-[#626B75]">
                      <Selo texto={sit.texto} cor={sit.cor} />
                      <p className="mt-1">Viagem: {dataBR(l.data_viagem)}</p>
                      <p>Valor: {brl(l.valor_contratado || l.valor_proposta)}</p>
                    </div>
                    <div className="text-[13px] text-[#626B75]">
                      {ehPromotor ? (
                        item?.comissao.status === "aprovada" ? (
                          <>
                            <p className="font-medium text-[#20252B]">
                              Comissão {formatarIeneP(totalAprovado(item.comissao))}
                              <span className="font-normal text-[#626B75]">
                                {" "}
                                · {TIPO_COMISSAO_LABEL[item.comissao.tipo].label.toLowerCase()}, {item.comissao.quantidade} {TIPO_COMISSAO_LABEL[item.comissao.tipo].unidade}
                                {item.comissao.quantidade === 1 ? "" : "s"}
                              </span>
                            </p>
                            <Parcelas parcelas={item.parcelas} />
                          </>
                        ) : (
                          <p>{l.estagio === "fechado_ganho" ? "Comissão em revisão pela equipe." : "Comissão só depois do fechamento."}</p>
                        )
                      ) : ag ? (
                        <p className="font-medium text-[#20252B]">
                          Comissão {brlC(ag.totalBRL)} <span className="font-normal text-[#626B75]">({formatarIeneP(ag.totalJPY)}) · aprovada em {dataBR(ag.aprovadoEm)}, pagamento até {formatarDataCurta(ag.prazo)}</span>
                        </p>
                      ) : (
                        <p>{l.estagio === "fechado_ganho" ? "Comissão em revisão pela equipe." : "Comissão só depois do fechamento."}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {veEmpregos && (
        <section className={`mt-6 ${CARTAO}`}>
          <h2 className="text-lg font-medium text-[#20252B]">Empregos</h2>
          {candidaturas.length === 0 ? (
            <p className="mt-3 text-sm text-[#626B75]">Nenhuma candidatura pelo seu link ou código ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/5">
              {candidaturas.map((c) => {
                const item = comissaoDaCandidatura.get(c.id as string);
                // Nunca mostrar o motivo da eliminação (regra fixa do fluxo /empregos).
                const fora = c.classificacao === "eliminado" || c.status === "reprovado";
                const progresso = progressoCandidatura(c as Parameters<typeof progressoCandidatura>[0]);
                return (
                  <li key={c.id as string} className="grid gap-2 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.6fr)] md:items-start md:gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#20252B]">{`${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim()}</p>
                      <p className="text-[13px] text-[#626B75]">
                        {String(c.vaga_titulo ?? "Vaga")} · candidatura em {dataBR(c.created_at as string)}
                      </p>
                    </div>
                    <div className="text-[13px]">{fora ? <Selo texto="Não seguiu no processo" cor="cinza" /> : <Selo texto={progresso.label} cor="ambar" />}</div>
                    <div className="text-[13px] text-[#626B75]">
                      {ehPromotor ? (
                        item?.comissao.status === "aprovada" ? (
                          <>
                            <p className="font-medium text-[#20252B]">
                              Comissão {formatarIeneP(totalAprovado(item.comissao))}
                              {item.comissao.vaga_incentivada && <span className="font-normal text-[#626B75]"> · vaga incentivada</span>}
                            </p>
                            <Parcelas parcelas={item.parcelas} />
                          </>
                        ) : (
                          <p>{fora ? "Sem comissão." : `Comissão quando o contratado completar ${DIAS_EMPREGO_PARA_PAGAR} dias de trabalho.`}</p>
                        )
                      ) : (
                        <p>{fora ? "—" : "Acompanhamento da candidatura."}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-[12px] text-[#8A929B]">
        Por privacidade, o portal não mostra contato, documentos ou pagamentos dos clientes e candidatos. Dúvidas sobre um lead ou um valor: fale com a equipe Ajisai.
      </p>
    </PortalShell>
  );
}
