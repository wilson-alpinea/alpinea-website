import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/crm/acesso";
import { produtoVisivel } from "@/lib/crm/permissoes";
import { createAdminClient } from "@/lib/supabase/admin";
import { GRUPOS_FLUXO, SAIDAS_DOC, SERVICOS_DOC, etapaDoc, pendenciaDoc, servicoDoc, type EventoDoc, type ProcessoDoc } from "@/lib/crm/documentacao";
import { dentro, diaDe, diasDoIntervalo, pct, reais, resolverPeriodo, type BuscaPeriodo } from "@/lib/crm/periodoPainel";
import { Badge, Card, LinkAcao, SOMBRA, Vazio, dataHora, diasEntre } from "../../components/PainelUi";
import { Detalhe, IconeEvento, Indicador, LinhaBarra, Numero, SemBase, Stat } from "../../components/PainelUnidade";
import { PeriodoSelector } from "../../components/PeriodoSelector";
import { GraficoDiario } from "../../components/GraficoDiario";
import { SinoUnidade } from "../../components/SinoUnidade";
import { FiltroProdutos, type OpcaoProduto } from "../../components/FiltroProdutos";

// Quadradinhos de serviço no topo (Wilson, 29/out/2026) — mesmos ícones de /documentacao.
const OPCOES_SERVICO: OpcaoProduto[] = [
  { valor: "visto", label: "Visto específico", icone: "/images/icone-documentacao-visto.png", opaco: true },
  { valor: "elegibilidade", label: "Certificado de Elegibilidade", icone: "/images/icone-documentacao-elegibilidade.png", opaco: true },
  { valor: "pet", label: "Exportação de pet", icone: "/images/icone-documentacao-pet-caixa.png", opaco: true },
];

// Visão geral do CRM de Documentação (Wilson, 29/out/2026: "quero eles tão
// arrojados e avançados quanto os outros 2") — indicadores do momento,
// resultados do período com gráfico por serviço, desempenho de cada
// serviço, funil comercial/execução, processos parados e atividade recente.
export const metadata: Metadata = {
  title: "Visão geral — CRM Documentação",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const BRONZE = "#8A5A3C";
const COR_SERVICO: Record<string, { cor: string; fundo: string }> = {
  visto: { cor: "#3F5F80", fundo: "#EEF2F7" },
  elegibilidade: { cor: BRONZE, fundo: "#F8F3EF" },
  pet: { cor: "#3D6A5E", fundo: "#EDF3F1" },
};
const ENCERRADAS = new Set<string>(["concluido", ...SAIDAS_DOC]);
const CONTRATADAS = new Set<string>(["contratado", "documentacao", "protocolado", "concluido"]);
const DIAS_PARADO = 7;

type Processo = Pick<ProcessoDoc, "id" | "created_at" | "updated_at" | "servico" | "etapa" | "nome" | "valor_total" | "valor_moeda" | "ficha_enviada_em" | "contrato_aceito_em" | "motivo_saida" | "pago_em" | "concluido_em" | "historico">;
type Pagamento = { processo_id: string; valor_brl: number; status: string; pago_em: string | null };

export default async function VisaoGeralDocumentacaoPage({ searchParams }: { searchParams: Promise<BuscaPeriodo & { produto?: string }> }) {
  const acesso = await exigirAdmin();
  const params = await searchParams;
  const db = createAdminClient();
  const [rp, rg] = await Promise.all([
    db
      .from("documentacao_processos")
      .select("id, created_at, updated_at, servico, etapa, nome, valor_total, valor_moeda, ficha_enviada_em, contrato_aceito_em, motivo_saida, pago_em, concluido_em, historico")
      .order("updated_at", { ascending: false })
      .limit(5000),
    db.from("documentacao_pagamentos").select("processo_id, valor_brl, status, pago_em").limit(10000),
  ]);
  if (rp.error) console.error("Erro ao ler documentacao_processos (visão geral):", rp.error);
  if (rg.error) console.error("Erro ao ler documentacao_pagamentos (visão geral):", rg.error);

  if (rp.error) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#20252B]">Não foi possível carregar a visão geral.</p>
        <p className="mt-1 text-sm text-[#626B75]">Recarregue a página; se continuar, confira se as migrações 026–028 rodaram no Supabase.</p>
      </div>
    );
  }

  const servicoFiltro = OPCOES_SERVICO.some((o) => o.valor === params.produto) ? params.produto! : null;
  const processos = ((rp.data ?? []) as Processo[]).filter((p) => produtoVisivel(acesso.permissoes, "documentacao", p.servico) && (!servicoFiltro || p.servico === servicoFiltro)).map((p) => ({ ...p, historico: Array.isArray(p.historico) ? p.historico : [] }));
  const idsVisiveis = new Set(processos.map((p) => p.id));
  const pagamentos = ((rg.data ?? []) as Pagamento[]).filter((g) => idsVisiveis.has(g.processo_id)).map((g) => ({ ...g, valor_brl: Number(g.valor_brl) || 0 }));
  const semPagamentos = !!rg.error;

  const { periodo, de, ate, rotulo, hoje } = resolverPeriodo(params);
  const hojeLongo = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Primeiro pagamento confirmado de cada processo (marca a contratação).
  const primeiroPago = new Map<string, string>();
  const recebidoPorProcesso = new Map<string, number>();
  for (const g of pagamentos) {
    if (g.status !== "pago") continue;
    recebidoPorProcesso.set(g.processo_id, (recebidoPorProcesso.get(g.processo_id) ?? 0) + g.valor_brl);
    if (g.pago_em && (!primeiroPago.has(g.processo_id) || g.pago_em < primeiroPago.get(g.processo_id)!)) primeiroPago.set(g.processo_id, g.pago_em);
  }
  const contratadoEm = (p: Processo) => p.pago_em ?? primeiroPago.get(p.id) ?? null;

  // ── Indicadores (agora) ──
  const ativos = processos.filter((p) => !ENCERRADAS.has(p.etapa));
  const pend = ativos.map((p) => ({ p, pend: pendenciaDoc(p) }));
  const equipe = pend.filter((x) => x.pend.quem === "equipe");
  const cliente = pend.filter((x) => x.pend.quem === "cliente");
  const aguardandoPagamento = ativos.filter((p) => p.etapa === "contrato_aceito").length;
  const noOrgao = pend.filter((x) => x.pend.quem === "orgao").length;
  const parados = pend
    .filter((x) => x.pend.quem !== "orgao" && diasEntre(diaDe(x.p.updated_at)!, hoje) >= DIAS_PARADO)
    .sort((a, b) => a.p.updated_at.localeCompare(b.p.updated_at));
  const inicioMes = `${hoje.slice(0, 7)}-01`;
  const recebidoMes = pagamentos.filter((g) => g.status === "pago" && dentro(diaDe(g.pago_em), inicioMes, hoje)).reduce((s, g) => s + g.valor_brl, 0);
  const linksPendentes = pagamentos.filter((g) => g.status === "pendente");
  const valorLinks = linksPendentes.reduce((s, g) => s + g.valor_brl, 0);
  const nomeMes = new Date(`${inicioMes}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });
  const porServicoAtivo = SERVICOS_DOC.map((s) => `${s.curto} ${ativos.filter((p) => p.servico === s.valor).length}`).join(" · ");

  // ── Resultados do período ──
  const novos = processos.filter((p) => dentro(diaDe(p.created_at), de, ate));
  const contratados = processos.filter((p) => dentro(diaDe(contratadoEm(p)), de, ate));
  const recebido = pagamentos.filter((g) => g.status === "pago" && dentro(diaDe(g.pago_em), de, ate)).reduce((s, g) => s + g.valor_brl, 0);
  const novosConvertidos = novos.filter((p) => CONTRATADAS.has(p.etapa)).length;
  const concluidos = processos.filter((p) => dentro(diaDe(p.concluido_em), de, ate)).length;
  const encerradosSemSucesso = processos.filter((p) =>
    SAIDAS_DOC.includes(p.etapa) && p.historico.some((e) => (e as EventoDoc).tipo === "etapa" && SAIDAS_DOC.includes((e as EventoDoc).para as never) && dentro(diaDe((e as EventoDoc).em), de, ate)),
  ).length;
  const porDia = diasDoIntervalo(de, ate).map((dia) => ({ dia, visto: 0, elegibilidade: 0, pet: 0 }) as Record<string, string | number> & { dia: string });
  const idx = new Map(porDia.map((d, i) => [d.dia, i]));
  for (const p of novos) {
    const i = idx.get(diaDe(p.created_at)!);
    if (i != null) porDia[i][p.servico] = Number(porDia[i][p.servico] ?? 0) + 1;
  }

  // ── Por serviço (desde o início) ──
  const servicos = SERVICOS_DOC.map((s) => {
    const xs = processos.filter((p) => p.servico === s.valor);
    const contr = xs.filter((p) => CONTRATADAS.has(p.etapa)).length;
    const decididos = contr + xs.filter((p) => SAIDAS_DOC.includes(p.etapa)).length;
    return {
      ...s,
      total: xs.length,
      ativos: xs.filter((p) => !ENCERRADAS.has(p.etapa)).length,
      concluidos: xs.filter((p) => p.etapa === "concluido").length,
      contratados: contr,
      conversao: pct(contr, decididos),
      receita: xs.reduce((sum, p) => sum + (recebidoPorProcesso.get(p.id) ?? 0), 0),
    };
  });

  // ── Funil ──
  const contagem: Record<string, number> = {};
  for (const p of processos) contagem[p.etapa] = (contagem[p.etapa] ?? 0) + 1;
  const maxFunil = Math.max(1, ...GRUPOS_FLUXO.flatMap((g) => g.etapas.map((e) => contagem[e] ?? 0)));

  // ── Atividade ──
  const eventos = processos
    .flatMap((p) => p.historico.map((e) => ({ ...(e as EventoDoc), processoId: p.id, nome: p.nome, servico: p.servico })))
    .filter((e) => e.em)
    .sort((a, b) => b.em.localeCompare(a.em))
    .slice(0, 7);

  return (
    <div className="-mt-4 space-y-6 md:-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]">Visão geral</h1>
          <p className="mt-0.5 text-sm text-[#626B75]">
            <span className="first-letter:uppercase">{hojeLongo}</span> · Visto específico, Certificado de Elegibilidade e exportação de pet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SinoUnidade unidade="documentacao" />
          <Link href="/crm/documentacao" className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50">
            Ver processos
          </Link>
          <a href="/documentacao" target="_blank" rel="noreferrer" className="rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480]">
            Página de venda ↗
          </a>
        </div>
      </div>

      <FiltroProdutos
        opcoes={OPCOES_SERVICO.filter((o) => produtoVisivel(acesso.permissoes, "documentacao", o.valor))}
        ativo={servicoFiltro}
        base="/crm/documentacao/visao-geral"
        manter={{ periodo: params.periodo, de: params.de, ate: params.ate }}
        cor={BRONZE}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador href="/crm/documentacao" titulo="Processos ativos" janela="Agora" fundo="#F8F3EF" cor={BRONZE}>
          <Numero cor={BRONZE}>{ativos.length}</Numero>
          <Detalhe>{porServicoAtivo}</Detalhe>
        </Indicador>
        <Indicador href="/crm/documentacao" titulo="Ação da equipe" janela="Agora" fundo="#EEF2F7" cor="#3F5F80">
          <Numero cor="#3F5F80">{equipe.length}</Numero>
          <Detalhe>
            {parados.length ? <span className="font-medium text-[#B42318]">⚠ {parados.length} sem movimento há {DIAS_PARADO}+ dias</span> : "Nenhum processo parado"}
            {noOrgao > 0 && <span className="block">{noOrgao} aguardando resposta do órgão</span>}
          </Detalhe>
        </Indicador>
        <Indicador href="/crm/documentacao?etapa=pre_aprovado" titulo="Aguardando o cliente" janela="Agora" fundo="#FAF5EB" cor="#93703D">
          <Numero cor="#93703D">{cliente.length}</Numero>
          <Detalhe>
            {aguardandoPagamento} aguardando pagamento · os demais com ficha, contrato ou documentos
          </Detalhe>
        </Indicador>
        <Indicador href="/crm/documentacao?etapa=contrato_aceito" titulo="Recebido no mês" janela={nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} fundo="#E9F4EE" cor="#23704F">
          <Numero cor="#23704F">{semPagamentos ? "—" : reais(recebidoMes)}</Numero>
          <Detalhe>{semPagamentos ? "Pagamentos indisponíveis (migração 028)" : `${linksPendentes.length} link(s) em aberto · ${reais(valorLinks)}`}</Detalhe>
        </Indicador>
      </div>

      <Card
        id="resultados"
        titulo="Resultados do período"
        subtitulo={`${rotulo} · este filtro vale só para esta seção`}
        cor="#59636F"
        acao={<PeriodoSelector base={servicoFiltro ? `/crm/documentacao/visao-geral?produto=${servicoFiltro}` : "/crm/documentacao/visao-geral"} periodoAtivo={periodo} de={periodo === "custom" ? de : undefined} ate={periodo === "custom" ? ate : undefined} />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat titulo="Novos cadastros" valor={novos.length} detalhe={SERVICOS_DOC.map((s) => `${s.curto} ${novos.filter((p) => p.servico === s.valor).length}`).join(" · ")} />
          <Stat titulo="Contratados" valor={contratados.length} detalhe="Pelo primeiro pagamento confirmado" />
          <Stat titulo="Conversão" valor={pct(novosConvertidos, novos.length) ?? <SemBase />} detalhe={novos.length ? `${novosConvertidos} de ${novos.length} cadastros do período já contratados` : "Contratados ÷ novos cadastros"} />
          <Stat titulo="Receita recebida" valor={semPagamentos ? "—" : reais(recebido)} detalhe="Parcelas pagas pela Stone" destaque="#23704F" />
          <Stat titulo="Concluídos" valor={concluidos} detalhe="Documento entregue ao cliente" destaque={BRONZE} />
          <Stat titulo="Encerrados sem sucesso" valor={encerradosSemSucesso} detalhe="Não atende, negado ou cancelado" destaque={encerradosSemSucesso ? "#B42318" : undefined} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-[#20252B]">Cadastros por dia, por serviço</p>
          <GraficoDiario
            empilhar
            dados={porDia}
            series={SERVICOS_DOC.map((s) => ({ chave: s.valor, rotulo: s.curto, cor: COR_SERVICO[s.valor].cor }))}
          />
        </div>
      </Card>

      <section aria-label="Desempenho por serviço" className="grid gap-5 md:grid-cols-3">
        {servicos.map((s) => {
          const c = COR_SERVICO[s.valor];
          return (
            <Link
              key={s.valor}
              href={`/crm/documentacao?servico=${s.valor}`}
              className={`rounded-2xl border border-t-[3px] border-black/[0.06] bg-white p-5 transition hover:-translate-y-px ${SOMBRA}`}
              style={{ borderTopColor: c.cor }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: c.cor }}>{s.label}</span>
                <Badge texto={`${s.total} no total`} cor={c.cor} fundo={c.fundo} />
              </span>
              <span className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Ativos", s.ativos],
                  ["Contratados", s.contratados],
                  ["Concluídos", s.concluidos],
                ].map(([r, n]) => (
                  <span key={r as string} className="rounded-xl px-2 py-2.5" style={{ backgroundColor: c.fundo }}>
                    <span className="block text-[22px] font-semibold leading-tight tabular-nums text-[#20252B]">{n}</span>
                    <span className="block text-[12px] text-[#626B75]">{r}</span>
                  </span>
                ))}
              </span>
              <span className="mt-4 flex items-center justify-between border-t border-[#EEF0F2] pt-3 text-[13px] text-[#626B75]">
                <span>
                  Conversão <strong className="font-semibold text-[#20252B]">{s.conversao ?? "—"}</strong>
                </span>
                <span>
                  Recebido <strong className="font-semibold tabular-nums text-[#20252B]">{semPagamentos ? "—" : reais(s.receita)}</strong>
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card titulo="Funil dos processos" subtitulo="Situação atual de cada processo" cor={BRONZE} acao={<LinkAcao href="/crm/documentacao">Ver processos</LinkAcao>}>
          {processos.length === 0 ? (
            <Vazio>Nenhum processo ainda. Os cadastros de /documentacao aparecem aqui.</Vazio>
          ) : (
            <>
              {GRUPOS_FLUXO.map((g) => (
                <div key={g.id} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8A8079]">{g.titulo}</h3>
                  <ul className="space-y-2.5">
                    {g.etapas.map((e) => {
                      const info = etapaDoc(e);
                      return (
                        <li key={e}>
                          <LinhaBarra href={`/crm/documentacao?etapa=${e}`} rotulo={info.label} n={contagem[e] ?? 0} max={maxFunil} cor={info.cor} fundo={info.fundo} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF0F2] pt-4 text-sm">
                {SAIDAS_DOC.map((e) => {
                  const info = etapaDoc(e);
                  return (
                    <Link key={e} href={`/crm/documentacao?etapa=${e}`} className="rounded-lg px-3 py-1.5 font-medium hover:underline" style={{ backgroundColor: info.fundo, color: info.cor }}>
                      {info.curto}: <span className="tabular-nums">{contagem[e] ?? 0}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <Card
          titulo="Processos parados"
          subtitulo={`Sem movimento há ${DIAS_PARADO} dias ou mais (fora os que aguardam o órgão)`}
          cor={parados.length ? "#B42318" : "#59636F"}
          fundo={parados.length ? "#FFFBFA" : "#FFFFFF"}
        >
          {parados.length === 0 ? (
            <Vazio>Nenhum processo parado. Tudo em movimento.</Vazio>
          ) : (
            <ul className="divide-y divide-[#EEF0F2]">
              {parados.slice(0, 7).map(({ p, pend }) => {
                const dias = diasEntre(diaDe(p.updated_at)!, hoje);
                return (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link href={`/crm/documentacao/${p.id}`} className="font-semibold text-[#20252B] hover:underline">
                        {p.nome}
                      </Link>
                      <p className="text-[13px] text-[#626B75]">
                        {servicoDoc(p.servico).curto} · {etapaDoc(p.etapa).label}
                      </p>
                      <p className="text-[13px] text-[#20252B]">
                        <span className="font-medium text-[#8A8079]">{pend.quem === "cliente" ? "Cliente" : "Equipe"}:</span> {pend.texto}
                      </p>
                    </div>
                    <Badge texto={`${dias} dias`} cor="#B42318" fundo="#FDECEA" />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card titulo="Atividade recente" subtitulo="Mudanças de etapa, notas e edições da equipe" cor="#59636F">
        {eventos.length === 0 ? (
          <Vazio>Nenhuma atividade registrada ainda.</Vazio>
        ) : (
          <ul className="grid gap-x-8 md:grid-cols-2">
            {eventos.map((e, i) => (
              <li key={`${e.processoId}-${e.em}-${i}`} className="flex gap-3 border-b border-[#EEF0F2] py-3">
                <IconeEvento tipo={e.tipo} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="font-semibold text-[#20252B]">{e.nome}</span>
                    <Badge texto={servicoDoc(e.servico).curto} cor={COR_SERVICO[e.servico]?.cor ?? "#59636F"} fundo={COR_SERVICO[e.servico]?.fundo ?? "#F1F3F5"} />
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-[#20252B]">
                    {e.tipo === "etapa" ? `${etapaDoc(e.de ?? "").label} → ${etapaDoc(e.para ?? "").label}` : e.texto || (e.tipo === "edicao" ? "Dados do processo editados" : "Nota")}
                  </p>
                  <p className="mt-0.5 text-[13px] tabular-nums text-[#626B75]">
                    {dataHora(e.em)}
                    {e.por && ` · ${e.por}`}
                  </p>
                </div>
                <Link href={`/crm/documentacao/${e.processoId}`} className="shrink-0 self-start rounded-lg px-2 py-1 text-sm font-medium text-[#24476B] hover:bg-[#EAF1F8]">
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

