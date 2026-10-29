import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { FLUXO_SEGURO, completarPedido, etapaSeguro, prazoApolice, type EventoSeguro, type PedidoSeguro } from "@/lib/crm/seguro";
import { addDias, dentro, diaDe, diasDoIntervalo, pct, reais, resolverPeriodo, type BuscaPeriodo } from "@/lib/crm/periodoPainel";
import { Badge, Card, LinkAcao, SOMBRA, Vazio, dataCurta, dataHora, diasEntre } from "../../components/PainelUi";
import { Alerta, Detalhe, IconeEvento, Indicador, LinhaBarra, Numero, SemBase, Stat } from "../../components/PainelUnidade";
import { PeriodoSelector } from "../../components/PeriodoSelector";
import { GraficoDiario } from "../../components/GraficoDiario";
import { SinoUnidade } from "../../components/SinoUnidade";

// Visão geral do CRM de Seguro Viagem (Wilson, 29/out/2026: "quero eles tão
// arrojados e avançados quanto os outros 2") — mesmo desenho da Visão geral
// da Agência: indicadores do momento, resultados do período com gráfico,
// funil, planos mais vendidos, próximas viagens e atividade recente.
export const metadata: Metadata = {
  title: "Visão geral — CRM Seguro Viagem",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const ROXO = "#75608B";
const PAGAS = new Set(["pago", "apolice_recebida", "apolice_enviada", "concluido"]);

type Pedido = Pick<
  PedidoSeguro,
  "id" | "created_at" | "etapa" | "nome" | "plano" | "seguradora" | "partida" | "retorno" | "valor_cliente" | "custo" | "pago_em" | "apolice_enviada_em" | "historico"
> & { viajantes: number };

export default async function VisaoGeralSeguroPage({ searchParams }: { searchParams: Promise<BuscaPeriodo> }) {
  await exigirAdmin();
  const params = await searchParams;
  const { data, error } = await createAdminClient()
    .from("seguro_pedidos")
    .select("id, created_at, etapa, nome, plano, seguradora, fornecedor, partida, retorno, viajantes, valor_cliente, custo, margem_pct, link_pagamento, pago_em, apolice_enviada_em, notas, historico")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) console.error("Erro ao ler seguro_pedidos (visão geral):", error);

  const pedidos: Pedido[] = (data ?? []).map((bruto) => {
    const p = completarPedido(bruto as never) as unknown as PedidoSeguro;
    return {
      id: p.id,
      created_at: p.created_at,
      etapa: p.etapa,
      nome: p.nome,
      plano: p.plano,
      seguradora: p.seguradora,
      partida: p.partida,
      retorno: p.retorno,
      valor_cliente: p.valor_cliente == null ? null : Number(p.valor_cliente),
      custo: p.custo == null ? null : Number(p.custo),
      pago_em: p.pago_em,
      apolice_enviada_em: p.apolice_enviada_em,
      historico: Array.isArray(p.historico) ? p.historico : [],
      viajantes: Array.isArray(p.viajantes) ? p.viajantes.length : 0,
    };
  });

  const { periodo, de, ate, rotulo, hoje } = resolverPeriodo(params);
  const agora = agoraMs();
  const hojeLongo = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // ── Indicadores (agora) ──
  const aguardando = pedidos.filter((p) => p.etapa === "link_enviado");
  const valorAguardando = aguardando.reduce((s, p) => s + (p.valor_cliente ?? 0), 0);
  const semApolice = pedidos.filter((p) => p.etapa === "pago" || p.etapa === "apolice_recebida");
  const atrasados = pedidos.filter((p) => prazoApolice(p, agora)?.atrasado);
  const recebidasNaoEnviadas = pedidos.filter((p) => p.etapa === "apolice_recebida").length;
  const em7 = addDias(hoje, 7);
  const viajando = pedidos.filter((p) => PAGAS.has(p.etapa) && p.partida && p.partida <= hoje && (p.retorno ?? p.partida) >= hoje);
  const embarcam7 = pedidos.filter((p) => PAGAS.has(p.etapa) && p.partida && p.partida > hoje && p.partida <= em7);
  const inicioMes = `${hoje.slice(0, 7)}-01`;
  const pagosMes = pedidos.filter((p) => PAGAS.has(p.etapa) && dentro(diaDe(p.pago_em), inicioMes, hoje));
  const fatMes = pagosMes.reduce((s, p) => s + (p.valor_cliente ?? 0), 0);
  const margemMes = pagosMes.reduce((s, p) => s + (p.valor_cliente != null && p.custo != null ? p.valor_cliente - p.custo : 0), 0);
  const nomeMes = new Date(`${inicioMes}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });

  // ── Resultados do período ──
  const novos = pedidos.filter((p) => dentro(diaDe(p.created_at), de, ate));
  const pagos = pedidos.filter((p) => PAGAS.has(p.etapa) && dentro(diaDe(p.pago_em), de, ate));
  const pagosSemData = pedidos.filter((p) => PAGAS.has(p.etapa) && !p.pago_em).length;
  const fat = pagos.reduce((s, p) => s + (p.valor_cliente ?? 0), 0);
  const comCusto = pagos.filter((p) => p.valor_cliente != null && p.custo != null);
  const margem = comCusto.reduce((s, p) => s + (p.valor_cliente! - p.custo!), 0);
  const baseMargem = comCusto.reduce((s, p) => s + p.valor_cliente!, 0);
  const convertidos = novos.filter((p) => PAGAS.has(p.etapa)).length;
  const cancelados = novos.filter((p) => p.etapa === "cancelado").length;
  const viajantesPeriodo = pagos.reduce((s, p) => s + p.viajantes, 0);
  const porDia = diasDoIntervalo(de, ate).map((dia) => ({ dia, novos: 0, pagos: 0 }));
  const idx = new Map(porDia.map((d, i) => [d.dia, i]));
  for (const p of novos) {
    const i = idx.get(diaDe(p.created_at)!);
    if (i != null) porDia[i].novos++;
  }
  for (const p of pagos) {
    const i = idx.get(diaDe(p.pago_em)!);
    if (i != null) porDia[i].pagos++;
  }

  // ── Funil, planos, viagens, atividade ──
  const contagem: Record<string, { n: number; valor: number }> = {};
  for (const p of pedidos) {
    const c = (contagem[p.etapa] ??= { n: 0, valor: 0 });
    c.n++;
    c.valor += p.valor_cliente ?? 0;
  }
  const maxFunil = Math.max(1, ...FLUXO_SEGURO.map((e) => contagem[e]?.n ?? 0));
  const totalPedidos = pedidos.length;
  const totalPagos = pedidos.filter((p) => PAGAS.has(p.etapa)).length;

  const planos = new Map<string, { plano: string; seguradora: string | null; n: number; valor: number }>();
  for (const p of pedidos) {
    if (!PAGAS.has(p.etapa) || !p.plano) continue;
    const k = `${p.plano}|${p.seguradora ?? ""}`;
    const x = planos.get(k) ?? { plano: p.plano, seguradora: p.seguradora, n: 0, valor: 0 };
    x.n++;
    x.valor += p.valor_cliente ?? 0;
    planos.set(k, x);
  }
  const rankingPlanos = [...planos.values()].sort((a, b) => b.n - a.n || b.valor - a.valor).slice(0, 6);
  const maxPlano = Math.max(1, ...rankingPlanos.map((x) => x.n));

  const em30 = addDias(hoje, 30);
  const proximas = pedidos
    .filter((p) => PAGAS.has(p.etapa) && p.partida && p.partida >= hoje && p.partida <= em30)
    .sort((a, b) => a.partida!.localeCompare(b.partida!))
    .slice(0, 7);

  const eventos = pedidos
    .flatMap((p) => p.historico.map((e) => ({ ...(e as EventoSeguro), pedidoId: p.id, nome: p.nome })))
    .filter((e) => e.em)
    .sort((a, b) => b.em.localeCompare(a.em))
    .slice(0, 7);

  const quando = (data: string) => {
    const n = diasEntre(hoje, data);
    return n === 0 ? "Hoje" : n === 1 ? "Amanhã" : `Em ${n} dias`;
  };

  if (error) {
    return (
      <div role="alert" className={`rounded-2xl border border-[#B42318]/20 bg-white p-6 text-center ${SOMBRA}`}>
        <p className="text-base font-semibold text-[#20252B]">Não foi possível carregar a visão geral.</p>
        <p className="mt-1 text-sm text-[#626B75]">Recarregue a página; se continuar, confira se a migração 025 rodou no Supabase.</p>
      </div>
    );
  }

  return (
    <div className="-mt-4 space-y-6 md:-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]">Visão geral</h1>
          <p className="mt-0.5 text-sm text-[#626B75]">
            <span className="first-letter:uppercase">{hojeLongo}</span> · Pagamentos, apólices e viagens dos segurados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SinoUnidade unidade="seguro" />
          <a href="/produtos/seguro-viagem/direto" target="_blank" rel="noreferrer" className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50">
            Link venda direta ↗
          </a>
          <Link href="/crm/seguro" className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50">
            Ver pedidos
          </Link>
          <a href="/produtos/seguro-viagem" target="_blank" rel="noreferrer" className="rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480]">
            Página de venda ↗
          </a>
        </div>
      </div>

      {atrasados.length > 0 && (
        <Alerta href="/crm/seguro?etapa=atrasados" acao="Ver pedidos atrasados">
          <strong>{atrasados.length}</strong> {atrasados.length === 1 ? "pedido pago está" : "pedidos pagos estão"} há mais de 24 horas sem apólice registrada.
        </Alerta>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador href="/crm/seguro?etapa=link_enviado" titulo="Aguardando pagamento" janela="Agora" fundo="#F4F1F8" cor={ROXO}>
          <Numero cor={ROXO}>{aguardando.length}</Numero>
          <Detalhe>{reais(valorAguardando)} em links enviados</Detalhe>
        </Indicador>
        <Indicador href="/crm/seguro?etapa=pago" titulo="Apólices pendentes" janela="Prazo 24 h" fundo="#FAF5EB" cor="#93703D">
          <Numero cor={atrasados.length ? "#B42318" : "#93703D"}>{semApolice.length}</Numero>
          <Detalhe>
            {atrasados.length ? <span className="font-medium text-[#B42318]">⚠ {atrasados.length} fora do prazo</span> : "Nenhuma fora do prazo"}
            {recebidasNaoEnviadas > 0 && <span className="block">{recebidasNaoEnviadas} recebida(s), falta enviar ao cliente</span>}
          </Detalhe>
        </Indicador>
        <Indicador href="/crm/seguro?ord=partida" titulo="Segurados viajando" janela={`Até ${dataCurta(em7).slice(0, 5)}`} fundo="#EEF6F3" cor="#27675B">
          <Numero cor="#27675B">{viajando.length}</Numero>
          <Detalhe>
            {embarcam7.length} {embarcam7.length === 1 ? "embarca" : "embarcam"} nos próximos 7 dias
          </Detalhe>
        </Indicador>
        <Indicador href="/crm/seguro?etapa=pago" titulo="Vendas no mês" janela={nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} fundo="#EFF4FA" cor="#42658A">
          <Numero cor="#42658A">{reais(fatMes)}</Numero>
          <Detalhe>
            {pagosMes.length} {pagosMes.length === 1 ? "pedido pago" : "pedidos pagos"} · margem {reais(margemMes)}
          </Detalhe>
        </Indicador>
      </div>

      <Card
        id="resultados"
        titulo="Resultados do período"
        subtitulo={`${rotulo} · este filtro vale só para esta seção`}
        cor="#59636F"
        acao={<PeriodoSelector base="/crm/seguro/visao-geral" periodoAtivo={periodo} de={periodo === "custom" ? de : undefined} ate={periodo === "custom" ? ate : undefined} />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat titulo="Novos pedidos" valor={novos.length} detalhe={cancelados ? `${cancelados} cancelado(s) ou não pagos` : "Pela data do pedido"} />
          <Stat titulo="Pedidos pagos" valor={pagos.length} detalhe={`${viajantesPeriodo} ${viajantesPeriodo === 1 ? "viajante segurado" : "viajantes segurados"}`} />
          <Stat titulo="Taxa de conversão" valor={pct(convertidos, novos.length) ?? <SemBase />} detalhe={novos.length ? `${convertidos} de ${novos.length} pedidos do período já pagos` : "Pagos ÷ novos pedidos"} />
          <Stat titulo="Faturamento" valor={reais(fat)} detalhe="Valor pago pelos clientes" destaque="#42658A" />
          <Stat titulo="Margem bruta" valor={reais(margem)} detalhe={baseMargem ? `${pct(margem, baseMargem)} sobre ${comCusto.length} pedido(s) com custo` : "Valor cobrado − custo da seguradora"} destaque="#27675B" />
          <Stat titulo="Ticket médio" valor={pagos.length ? reais(fat / pagos.length) : <SemBase />} detalhe="Por pedido pago" />
        </div>
        {pagosSemData > 0 && (
          <p className="mt-3 text-[13px] text-[#626B75]">
            {pagosSemData} {pagosSemData === 1 ? "pedido pago não tem" : "pedidos pagos não têm"} data de pagamento registrada e não {pagosSemData === 1 ? "entra" : "entram"} no período.
          </p>
        )}
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-[#20252B]">Pedidos por dia</p>
          <GraficoDiario
            dados={porDia}
            series={[
              { chave: "novos", rotulo: "Novos pedidos", cor: "#B9AACB" },
              { chave: "pagos", rotulo: "Pagos", cor: ROXO },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card titulo="Funil de pedidos" subtitulo="Situação atual de cada pedido" cor={ROXO} acao={<LinkAcao href="/crm/seguro">Ver pedidos</LinkAcao>} className="h-full">
            {totalPedidos === 0 ? (
              <Vazio>Nenhum pedido ainda. Os pedidos de /produtos/seguro-viagem aparecem aqui.</Vazio>
            ) : (
              <>
                <ul className="space-y-2.5">
                  {FLUXO_SEGURO.map((e) => {
                    const info = etapaSeguro(e);
                    const c = contagem[e] ?? { n: 0, valor: 0 };
                    return (
                      <li key={e}>
                        <LinhaBarra href={`/crm/seguro?etapa=${e}`} rotulo={info.curto} n={c.n} max={maxFunil} cor={info.cor} fundo={info.fundo} extra={reais(c.valor)} />
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-[#EEF0F2] pt-4 text-sm">
                  <span className="rounded-lg bg-[#EEF6F3] px-3 py-1.5 font-medium text-[#27675B]">
                    Convertidos: <span className="tabular-nums">{totalPagos}</span>
                    {pct(totalPagos, totalPedidos) && <span className="font-normal"> ({pct(totalPagos, totalPedidos)})</span>}
                  </span>
                  <Link href="/crm/seguro?etapa=cancelado" className="rounded-lg bg-[#FDECEA] px-3 py-1.5 font-medium text-[#B42318] hover:underline">
                    Cancelados: <span className="tabular-nums">{contagem.cancelado?.n ?? 0}</span>
                  </Link>
                  <span className="self-center text-[13px] text-[#626B75]">Valores pelo preço ao cliente.</span>
                </div>
              </>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card titulo="Planos mais vendidos" subtitulo="Pedidos pagos, desde o início" cor="#42658A" fundo="#F7FAFD" className="h-full">
            {rankingPlanos.length === 0 ? (
              <Vazio>Nenhum pedido pago com plano informado.</Vazio>
            ) : (
              <ul className="space-y-3">
                {rankingPlanos.map((x) => (
                  <li key={`${x.plano}|${x.seguradora}`}>
                    <LinhaBarra rotulo={<span title={`${x.plano}${x.seguradora ? ` — ${x.seguradora}` : ""}`}>{x.plano}{x.seguradora && <span className="block truncate text-[12px] text-[#626B75]">{x.seguradora}</span>}</span>} n={x.n} max={maxPlano} cor="#42658A" fundo="#E3EBF4" extra={reais(x.valor)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card titulo="Próximas viagens" subtitulo="Segurados com embarque nos próximos 30 dias" cor="#27675B" fundo="#F0F7F5" acao={<LinkAcao href="/crm/seguro?ord=partida">Ver todas</LinkAcao>}>
          {proximas.length === 0 ? (
            <Vazio>Nenhum segurado embarcando nos próximos 30 dias.</Vazio>
          ) : (
            <ul className="divide-y divide-[#27675B]/10">
              {proximas.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/crm/seguro/${p.id}`} className="font-semibold text-[#20252B] hover:text-[#27675B] hover:underline">
                      {p.nome}
                    </Link>
                    <p className="text-[13px] tabular-nums text-[#626B75]">
                      {dataCurta(p.partida!)}
                      {p.retorno && ` a ${dataCurta(p.retorno)}`}
                      {p.viajantes > 0 && ` · ${p.viajantes} ${p.viajantes === 1 ? "viajante" : "viajantes"}`}
                      {p.plano && ` · ${p.plano}`}
                    </p>
                    {p.etapa !== "apolice_enviada" && p.etapa !== "concluido" && <p className="text-[13px] font-medium text-[#B42318]">Apólice ainda não enviada ao cliente</p>}
                  </div>
                  <Badge texto={quando(p.partida!)} cor="#27675B" fundo="#FFFFFF" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card titulo="Atividade recente" subtitulo="Mudanças de etapa, notas e edições da equipe" cor="#59636F">
          {eventos.length === 0 ? (
            <Vazio>Nenhuma atividade registrada ainda.</Vazio>
          ) : (
            <ul className="divide-y divide-[#EEF0F2]">
              {eventos.map((e, i) => (
                <li key={`${e.pedidoId}-${e.em}-${i}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <IconeEvento tipo={e.tipo} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#20252B]">{e.nome}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[#20252B]">
                      {e.tipo === "etapa" ? `${etapaSeguro(e.de ?? "").curto} → ${etapaSeguro(e.para ?? "").curto}` : e.texto || (e.tipo === "edicao" ? "Dados do pedido editados" : "Nota")}
                    </p>
                    <p className="mt-0.5 text-[13px] tabular-nums text-[#626B75]">
                      {dataHora(e.em)}
                      {e.por && ` · ${e.por}`}
                    </p>
                  </div>
                  <Link href={`/crm/seguro/${e.pedidoId}`} className="shrink-0 self-start rounded-lg px-2 py-1 text-sm font-medium text-[#24476B] hover:bg-[#EAF1F8]">
                    Abrir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

    </div>
  );
}

// Hora do servidor no momento da renderização (prazo de 24 h da apólice).
function agoraMs() {
  return Date.now();
}
