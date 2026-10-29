import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ESTAGIO_BADGE, ESTAGIO_LABEL } from "@/lib/crm/estagios";
import { ESTAGIO_ENTREGA_LABEL } from "@/lib/crm/estagiosEntrega";
import { TIPO_INTERACAO_LABEL } from "@/lib/crm/interacoes";
import { nomeParcela } from "@/lib/crm/financeiro";
import {
  addDias,
  carregarPainel,
  falhou,
  negociacoesAbertas,
  porEtapaComercial,
  porEtapaExecucao,
  proximasViagens,
  recebimentos,
  resultadosPeriodo,
  type DadosPainel,
} from "@/lib/crm/painel";
import { NovosClientesChart } from "./components/NovosClientesChart";
import { Notificacoes } from "./components/Notificacoes";
import { cookies } from "next/headers";
import { obterAcesso } from "@/lib/crm/acesso";
import { COOKIE_NOTIFICACOES, carregarNotificacoes } from "@/lib/crm/notificacoes";
import { PeriodoSelector } from "./components/PeriodoSelector";
import { calcularComissoes } from "@/lib/crm/comissoes";
import { hojeCRM } from "@/lib/crm/financeiro";
import {
  Badge,
  Card,
  Esqueleto,
  FalhaCarregar,
  IconeAtividade,
  LinkAcao,
  ROTULO_ATIVIDADE,
  SOMBRA,
  TIPOS_MANUAIS,
  Vazio,
  brl,
  dataCurta,
  dataHora,
  diasEntre,
} from "./components/PainelUi";

export const metadata: Metadata = {
  title: "Visão geral — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

// Visão geral do CRM (Wilson, 22/out/2026): central comercial, operacional
// e financeira. Os blocos de cima mostram a situação ATUAL; só "Resultados
// do período" obedece ao seletor de período.

type Busca = { periodo?: string; dias?: string; de?: string; ate?: string };

const rotuloExecucao = (e: string) => {
  const l = ESTAGIO_ENTREGA_LABEL[e as keyof typeof ESTAGIO_ENTREGA_LABEL] ?? e;
  return l.charAt(0) + l.slice(1).toLowerCase();
};
const rotuloEtapa = (e: string) => {
  const l = ESTAGIO_LABEL[e as keyof typeof ESTAGIO_LABEL] ?? e;
  return l.replace("Novo Lead", "Novo lead").replace("Proposta Enviada", "Proposta enviada").replace("Em Negociação", "Em negociação");
};

export default async function VisaoGeralPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const dados = carregarPainel(supabase, { eventos: 40 });

  const hojeLongo = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="-mt-4 space-y-6 md:-mt-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[#20252B]">Visão geral</h1>
          <p className="mt-0.5 text-sm text-[#626B75]">
            <span className="first-letter:uppercase">{hojeLongo}</span> · Veja as prioridades e acompanhe sua operação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={<Notificacoes lista={[]} naoLidas={0} />}>
            <SinoNotificacoes />
          </Suspense>
          <Link href="/crm/clientes" className="rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30">
            Ver clientes
          </Link>
          <Link href="/crm/clientes/novo" className="rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2C5480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/40 focus-visible:ring-offset-2">
            + Novo cliente
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="h-32" />)}</div>}>
        <Indicadores dados={dados} />
      </Suspense>

      {/* Resultados do período logo abaixo dos indicadores (Wilson, 22/out/2026). */}
      <Suspense fallback={<Esqueleto altura="h-80" />}>
        <Resultados dados={dados} params={params} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Suspense fallback={<Esqueleto altura="h-72" />}>
            <Prioridades dados={dados} />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<Esqueleto altura="h-72" />}>
            <Viagens dados={dados} />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Esqueleto altura="h-64" />}>
          <Pipeline dados={dados} />
        </Suspense>
        <Suspense fallback={<Esqueleto altura="h-64" />}>
          <Execucao dados={dados} />
        </Suspense>
      </div>

      {/* Comissões a distribuir (Wilson, 29/out/2026) — pagas até o 10º dia útil do mês seguinte. */}
      <Suspense fallback={<Esqueleto altura="h-56" />}>
        <Comissoes />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Esqueleto altura="h-72" />}>
          <Recebimentos dados={dados} />
        </Suspense>
        <Suspense fallback={<Esqueleto altura="h-72" />}>
          <Atividade dados={dados} />
        </Suspense>
      </div>

    </div>
  );
}

// ── Comissões a distribuir ───────────────────────────────────────
async function Comissoes() {
  const hoje = hojeCRM();
  const mesAtual = hoje.slice(0, 7);
  const [a, m] = mesAtual.split("-").map(Number);
  const mesAnterior = new Date(Date.UTC(a, m - 2, 1)).toISOString().slice(0, 7);
  const r = await calcularComissoes([mesAnterior, mesAtual]);
  return (
    <Card
      titulo="Comissões a distribuir"
      subtitulo="Remuneração dos parceiros e consultores (cadastrada em Acessos). Pagas até o 10º dia útil do mês seguinte."
      cor="#946200"
      fundo="#FFFCF5"
      acao={<LinkAcao href="/crm/acessos">Regras em Acessos</LinkAcao>}
    >
      {"erro" in r ? (
        <FalhaCarregar oque="as comissões" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {r.map((mes, i) => {
            const vencido = i === 0 && mes.prazo < hoje;
            return (
              <div key={mes.mes} className="rounded-xl bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-[#20252B]">
                    {i === 0 ? "A pagar" : "Acumulando"} — vendas de {mes.rotuloMes}
                  </p>
                  <p className={`text-[13px] ${vencido ? "font-medium text-[#B42318]" : "text-[#626B75]"}`}>Pagar até {dataCurta(mes.prazo)}</p>
                </div>
                <p className="mt-1 text-[26px] font-semibold tabular-nums text-[#946200]">{brl(mes.totalC)}</p>
                {mes.beneficiarios.length === 0 ? (
                  <p className="mt-2 text-[13px] text-[#626B75]">Nenhuma comissão neste mês.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-[#EEF0F2] text-sm">
                    {mes.beneficiarios.map((b) => (
                      <li key={b.chave} className="flex items-start justify-between gap-3 py-2">
                        <span className="min-w-0">
                          <span className="block font-medium text-[#20252B]">{b.nome}</span>
                          <span className="block text-[13px] text-[#626B75]">
                            {b.tipo === "empresa" ? "Empresa parceira" : "Usuário"} ·{" "}
                            {b.regra === "percentual"
                              ? `${b.valorRegra.toLocaleString("pt-BR")}% sobre ${brl(Math.max(0, b.recebidoC))} recebidos`
                              : `${b.vendas} ${b.vendas === 1 ? "venda" : "vendas"} × ${brl(Math.round(b.valorRegra * 100))}`}
                          </span>
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-[#20252B]">{brl(b.comissaoC)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[13px] text-[#626B75]">
        Percentual calculado sobre o valor recebido no mês (o CRM ainda não guarda o custo de cada venda). Valor fixo: por venda fechada (Fechado — Ganho) no mês. Dias úteis sem contar feriados.
      </p>
    </Card>
  );
}

// ── Notificações ─────────────────────────────────────────────────
async function SinoNotificacoes() {
  const [supabase, acesso, jar] = await Promise.all([createClient(), obterAcesso(), cookies()]);
  const lidas = jar.get(COOKIE_NOTIFICACOES)?.value ?? null;
  const r = await carregarNotificacoes(supabase, acesso?.userId ?? null, lidas && !Number.isNaN(Date.parse(lidas)) ? lidas : null);
  if ("erro" in r) return <Notificacoes lista={[]} naoLidas={0} erro />;
  return <Notificacoes lista={r.lista} naoLidas={r.naoLidas} />;
}

// ── 2. Indicadores ───────────────────────────────────────────────
function Indicador({
  href,
  titulo,
  janela,
  fundo,
  cor,
  children,
}: {
  href: string;
  titulo: string;
  janela: string;
  fundo: string;
  cor: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border border-t-[3px] border-black/[0.06] p-5 transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SOMBRA}`}
      style={{ backgroundColor: fundo, borderTopColor: cor, ["--tw-ring-color" as string]: cor }}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#20252B]">{titulo}</span>
        <span className="text-[13px] text-[#626B75]">{janela}</span>
      </span>
      <span className="mt-2 flex-1">{children}</span>
      <span className="mt-2 text-[13px] font-medium" style={{ color: cor }}>
        Ver lista →
      </span>
    </Link>
  );
}

const Numero = ({ children, cor = "#20252B" }: { children: React.ReactNode; cor?: string }) => (
  <span className="block text-[28px] font-semibold leading-tight tabular-nums" style={{ color: cor }}>
    {children}
  </span>
);
const Detalhe = ({ children }: { children: React.ReactNode }) => <span className="mt-0.5 block text-[13px] text-[#626B75]">{children}</span>;
const NaoDisponivel = () => <span className="block text-base font-semibold text-[#626B75]">Não disponível</span>;

async function Indicadores({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  const neg = falhou(d.clientes) ? null : negociacoesAbertas(d.clientes);
  const exe = falhou(d.clientes) ? null : porEtapaExecucao(d.clientes);
  const rec = falhou(d.parcelas) ? null : recebimentos(d.parcelas, d.hoje);
  const fim7 = dataCurta(addDias(d.hoje, 7)).slice(0, 5);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Indicador href="/crm/clientes?etapa=abertas" titulo="Negociações abertas" janela="Agora" fundo="#F2F6FC" cor="#24476B">
        {neg ? (
          <>
            <Numero cor="#24476B">{neg.quantidade}</Numero>
            <Detalhe>
              <span className="tabular-nums">{brl(neg.valorC)}</span> estimados
              {neg.semValor > 0 && ` · ${neg.semValor} sem valor`}
            </Detalhe>
          </>
        ) : (
          <NaoDisponivel />
        )}
      </Indicador>
      <Indicador href="/crm/clientes?exec=preparacao" titulo="Viagens em preparação" janela="Agora" fundo="#F0F7F5" cor="#28665D">
        {exe ? (
          <>
            <Numero cor="#28665D">{exe.emPreparacao}</Numero>
            <Detalhe>Projetos iniciados, antes da viagem</Detalhe>
          </>
        ) : (
          <NaoDisponivel />
        )}
      </Indicador>
      <Indicador href="/crm/recebimentos?filtro=7dias" titulo="A receber em 7 dias" janela={`Hoje a ${fim7}`} fundo="#FAF7F1" cor="#946200">
        {rec ? (
          <>
            <Numero cor="#946200">{brl(rec.proximas.saldoC)}</Numero>
            <Detalhe>
              {rec.proximas.quantidade} {rec.proximas.quantidade === 1 ? "parcela" : "parcelas"} · saldo devido
            </Detalhe>
          </>
        ) : (
          <NaoDisponivel />
        )}
      </Indicador>
      <Indicador href="/crm/recebimentos?filtro=vencidas" titulo="Pendências vencidas" janela="Até ontem" fundo="#F5F3FA" cor="#665582">
        {rec ? (
          <>
            <Numero cor={rec.vencidas.quantidade > 0 ? "#B42318" : "#665582"}>
              {rec.vencidas.quantidade} <span className="text-base font-medium">{rec.vencidas.quantidade === 1 ? "parcela" : "parcelas"}</span>
            </Numero>
            <Detalhe>
              {rec.vencidas.quantidade > 0 ? (
                <span className="font-medium text-[#B42318]">⚠ {brl(rec.vencidas.saldoC)} em atraso</span>
              ) : (
                "Nenhuma parcela vencida"
              )}
              <span className="block">Tarefas: não disponível</span>
            </Detalhe>
          </>
        ) : (
          <NaoDisponivel />
        )}
      </Indicador>
    </div>
  );
}

// ── 3a. Prioridades (sem tarefas no sistema → interações recentes) ─
async function Prioridades({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  return (
    <Card
      titulo="Interações recentes"
      subtitulo="O CRM ainda não tem tarefas cadastradas. Enquanto isso, aqui aparecem os últimos contatos registrados pela equipe."
      cor="#24476B"
      acao={<LinkAcao href="/crm/atividade?tipo=interacoes">Ver todas</LinkAcao>}
      className="h-full"
    >
      {falhou(d.eventos) ? (
        <FalhaCarregar oque="as interações" />
      ) : (
        (() => {
          const lista = d.eventos.filter((e) => TIPOS_MANUAIS.includes(e.tipo)).slice(0, 5);
          if (!lista.length) return <Vazio>Nenhuma interação registrada ainda.</Vazio>;
          return (
            <ul className="divide-y divide-[#EEF0F2]">
              {lista.map((e) => (
                <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <IconeAtividade tipo={e.tipo} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 text-sm">
                      <span className="font-semibold text-[#20252B]">{e.clienteNome}</span>
                      <Badge texto={TIPO_INTERACAO_LABEL[e.tipo] ?? e.tipo} cor="#59636F" fundo="#F1F3F5" />
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[#20252B]">{e.resumo}</p>
                    <p className="mt-0.5 text-[13px] tabular-nums text-[#626B75]">
                      {dataHora(e.quando)}
                      {e.autor && ` · ${e.autor}`}
                    </p>
                  </div>
                  <Link href={`/crm/clientes/${e.clienteId}`} className="shrink-0 self-start rounded-lg px-2 py-1 text-sm font-medium text-[#24476B] hover:bg-[#EAF1F8]">
                    Abrir cliente
                  </Link>
                </li>
              ))}
            </ul>
          );
        })()
      )}
    </Card>
  );
}

// ── 3b. Próximas viagens ─────────────────────────────────────────
async function Viagens({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  if (falhou(d.clientes))
    return (
      <Card titulo="Próximas viagens" cor="#28665D" fundo="#F0F7F5" className="h-full">
        <FalhaCarregar oque="as viagens" />
      </Card>
    );
  const { proximas, emAndamento } = proximasViagens(d.clientes, d.hoje);
  const quando = (data: string) => {
    const n = diasEntre(d.hoje, data);
    return n === 0 ? "Hoje" : n === 1 ? "Amanhã" : `Em ${n} dias`;
  };
  const Item = ({ c, andamento }: { c: (typeof proximas)[number]; andamento?: boolean }) => (
    <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <Link href={`/crm/clientes/${c.id}`} className="font-semibold text-[#20252B] hover:text-[#28665D] hover:underline">
          {c.nome}
        </Link>
        <p className="text-[13px] tabular-nums text-[#626B75]">
          {c.dataViagem ? `Início ${dataCurta(c.dataViagem)}` : "Data de início não informada"}
          {" · "}
          {c.execucaoIniciada ? rotuloExecucao(c.estagioEntrega) : "Aguardando início"}
        </p>
      </div>
      {!andamento && c.dataViagem && <Badge texto={quando(c.dataViagem)} cor="#28665D" fundo="#FFFFFF" />}
    </li>
  );
  return (
    <Card titulo="Próximas viagens" subtitulo="Início nos próximos 30 dias" cor="#28665D" fundo="#F0F7F5" className="h-full" acao={<LinkAcao href="/crm/clientes?exec=preparacao">Ver projetos</LinkAcao>}>
      {emAndamento.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-[#28665D]">Em andamento</h3>
          <ul className="divide-y divide-[#28665D]/10">
            {emAndamento.map((c) => (
              <Item key={c.id} c={c} andamento />
            ))}
          </ul>
        </div>
      )}
      {proximas.length === 0 ? (
        <Vazio>Nenhuma viagem com início nos próximos 30 dias.</Vazio>
      ) : (
        <ul className="divide-y divide-[#28665D]/10">
          {proximas.slice(0, 6).map((c) => (
            <Item key={c.id} c={c} />
          ))}
        </ul>
      )}
      <p className="mt-3 text-[13px] text-[#626B75]">Considera negócios ganhos ou com execução registrada e a data da viagem do cadastro.</p>
    </Card>
  );
}

// ── 4a. Pipeline comercial ───────────────────────────────────────
async function Pipeline({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  return (
    <Card titulo="Pipeline comercial" subtitulo="Distribuição por etapa — situação atual dos clientes ativos" cor="#24476B" acao={<LinkAcao href="/crm/pipeline">Abrir pipeline</LinkAcao>}>
      {falhou(d.clientes) ? (
        <FalhaCarregar oque="o pipeline" />
      ) : (
        (() => {
          const { abertas, ganhos, perdidos } = porEtapaComercial(d.clientes);
          const max = Math.max(1, ...abertas.map((a) => a.quantidade));
          return (
            <>
              <ul className="space-y-2.5">
                {abertas.map((a) => {
                  const cor = ESTAGIO_BADGE[a.estagio];
                  return (
                    <li key={a.estagio}>
                      <Link href={`/crm/clientes?etapa=${a.estagio}`} className="group grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 rounded-lg p-1 -m-1 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30">
                        <span className="text-sm text-[#20252B]">{rotuloEtapa(a.estagio)}</span>
                        <span className="h-2.5 rounded-full" style={{ backgroundColor: cor.fundo }}>
                          <span className="block h-full rounded-full" style={{ width: `${(a.quantidade / max) * 100}%`, backgroundColor: cor.texto, minWidth: a.quantidade ? 6 : 0 }} />
                        </span>
                        <span className="text-right text-sm tabular-nums">
                          <span className="font-semibold text-[#20252B]">{a.quantidade}</span>
                          <span className="block text-[13px] text-[#626B75]">{brl(a.valorC)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-[#EEF0F2] pt-4 text-sm">
                <Link href="/crm/clientes?etapa=fechado_ganho" className="rounded-lg px-3 py-1.5 font-medium hover:underline" style={{ backgroundColor: ESTAGIO_BADGE.fechado_ganho.fundo, color: ESTAGIO_BADGE.fechado_ganho.texto }}>
                  Ganhos: <span className="tabular-nums">{ganhos}</span>
                </Link>
                <Link href="/crm/clientes?etapa=fechado_perdido" className="rounded-lg px-3 py-1.5 font-medium hover:underline" style={{ backgroundColor: ESTAGIO_BADGE.fechado_perdido.fundo, color: ESTAGIO_BADGE.fechado_perdido.texto }}>
                  Perdidos: <span className="tabular-nums">{perdidos}</span>
                </Link>
                <span className="self-center text-[13px] text-[#626B75]">Valores pela proposta; sem valor contam como R$ 0,00.</span>
              </div>
            </>
          );
        })()
      )}
    </Card>
  );
}

// ── 4b. Execução das viagens ─────────────────────────────────────
async function Execucao({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  return (
    <Card titulo="Execução das viagens" subtitulo="Cada projeto conta uma vez, pela etapa atual" cor="#28665D" fundo="#F6FBF9">
      {falhou(d.clientes) ? (
        <FalhaCarregar oque="a execução" />
      ) : (
        (() => {
          const e = porEtapaExecucao(d.clientes);
          const max = Math.max(1, e.aguardando, ...e.etapas.map((x) => x.quantidade));
          const Linha = ({ href, rotulo, n }: { href: string; rotulo: string; n: number }) => (
            <li>
              <Link href={href} className="grid grid-cols-[10rem_1fr_2rem] items-center gap-3 rounded-lg p-1 -m-1 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28665D]/30">
                <span className="text-sm text-[#20252B]">{rotulo}</span>
                <span className="h-1.5 rounded-full bg-[#DDE5E2]">
                  <span className="block h-full rounded-full bg-[#4F8D81]" style={{ width: `${(n / max) * 100}%`, minWidth: n ? 6 : 0 }} />
                </span>
                <span className="text-right text-sm font-semibold tabular-nums text-[#20252B]">{n}</span>
              </Link>
            </li>
          );
          return (
            <>
              <ul className="space-y-2.5">
                <Linha href="/crm/clientes?etapa=fechado_ganho&exec=aguardando" rotulo="Aguardando início" n={e.aguardando} />
              </ul>
              <p className="mb-2 mt-4 text-[13px] font-medium text-[#626B75]">Iniciados</p>
              <ul className="space-y-2.5">
                {e.etapas.map((x) => (
                  <Linha key={x.etapa} href={`/crm/clientes?exec=${x.etapa}`} rotulo={rotuloExecucao(x.etapa)} n={x.quantidade} />
                ))}
              </ul>
              <div className="mt-4 border-t border-[#28665D]/10 pt-3">
                <Link href="/crm/clientes?exec=concluida" className="text-sm font-medium text-[#28665D] hover:underline">
                  Concluídos: <span className="tabular-nums">{e.concluidos}</span>
                </Link>
              </div>
            </>
          );
        })()
      )}
    </Card>
  );
}

// ── 5a. Recebimentos ─────────────────────────────────────────────
async function Recebimentos({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  return (
    <Card titulo="Recebimentos" subtitulo="Saldo devido das parcelas cadastradas (propostas não entram)" cor="#946200" fundo="#FAF7F1" acao={<LinkAcao href="/crm/recebimentos">Ver todos</LinkAcao>}>
      {falhou(d.parcelas) ? (
        <FalhaCarregar oque="as parcelas" />
      ) : (
        (() => {
          const r = recebimentos(d.parcelas, d.hoje);
          return (
            <>
              {d.financeiroSemMigracao && (
                <p className="mb-3 rounded-lg bg-[#FFF4DB] px-3 py-2 text-[13px] text-[#6F4A00]">Migração 023 pendente: recebimentos lidos do status antigo “pago”.</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/crm/recebimentos?filtro=vencidas" className="rounded-xl bg-white p-3 hover:ring-1 hover:ring-[#B42318]/30">
                  <span className="block text-[13px] font-medium text-[#626B75]">Em atraso</span>
                  <span className={`block text-xl font-semibold tabular-nums ${r.vencidas.saldoC > 0 ? "text-[#B42318]" : "text-[#626B75]"}`}>{brl(r.vencidas.saldoC)}</span>
                  <span className="text-[13px] text-[#626B75]">{r.vencidas.quantidade} {r.vencidas.quantidade === 1 ? "parcela" : "parcelas"}</span>
                </Link>
                <Link href="/crm/recebimentos?filtro=7dias" className="rounded-xl bg-white p-3 hover:ring-1 hover:ring-[#946200]/30">
                  <span className="block text-[13px] font-medium text-[#626B75]">A vencer em 7 dias</span>
                  <span className="block text-xl font-semibold tabular-nums text-[#946200]">{brl(r.proximas.saldoC)}</span>
                  <span className="text-[13px] text-[#626B75]">{r.proximas.quantidade} {r.proximas.quantidade === 1 ? "parcela" : "parcelas"}</span>
                </Link>
              </div>
              {r.fila.length === 0 ? (
                <div className="mt-4">
                  <Vazio>Nenhuma parcela vencida ou a vencer nos próximos 7 dias.</Vazio>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-[#946200]/10">
                  {r.fila.slice(0, 5).map((x) => (
                    <li key={x.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5">
                      <div className="min-w-0">
                        <Link href={`/crm/clientes/${x.clienteId}#financeiro`} className="font-semibold text-[#20252B] hover:underline">
                          {x.clienteNome}
                        </Link>
                        <p className="text-[13px] text-[#626B75]">
                          {nomeParcela(x)} · vence {dataCurta(x.data_vencimento!)}{" "}
                          {x.atrasada ? (
                            <Badge texto={x.situacao === "parcial" ? "Parcial · em atraso" : "Vencida"} cor="#B42318" fundo="#FDECEA" />
                          ) : x.data_vencimento === d.hoje ? (
                            <Badge texto="Hoje" cor="#946200" fundo="#FFF4DB" />
                          ) : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold tabular-nums text-[#20252B]">{brl(x.saldoC)}</span>
                        {!d.financeiroSemMigracao && (
                          <Link href={`/crm/clientes/${x.clienteId}?receber=${x.id}#financeiro`} className="rounded-lg bg-[#24476B] px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#2C5480]">
                            Registrar recebimento
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          );
        })()
      )}
    </Card>
  );
}

// ── 5b. Atividade recente ────────────────────────────────────────
async function Atividade({ dados: p }: { dados: Promise<DadosPainel> }) {
  const d = await p;
  return (
    <Card titulo="Atividade recente" subtitulo="Últimos eventos registrados" cor="#59636F" fundo="#F5F6F7" acao={<LinkAcao href="/crm/atividade">Ver histórico</LinkAcao>}>
      {falhou(d.eventos) ? (
        <FalhaCarregar oque="a atividade" />
      ) : d.eventos.length === 0 ? (
        <Vazio>Nenhum evento registrado ainda.</Vazio>
      ) : (
        <ul className="divide-y divide-black/[0.06]">
          {d.eventos.slice(0, 5).map((e) => (
            <li key={e.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
              <IconeAtividade tipo={e.tipo} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium text-[#20252B]">{ROTULO_ATIVIDADE[e.tipo] ?? TIPO_INTERACAO_LABEL[e.tipo] ?? e.tipo}</span>
                  <span className="text-[#626B75]"> · </span>
                  <Link href={`/crm/clientes/${e.clienteId}`} className="text-[#20252B] hover:underline">
                    {e.clienteNome}
                  </Link>
                </p>
                <p className="line-clamp-2 text-[13px] text-[#20252B]">{e.resumo}</p>
                <p className="text-[13px] tabular-nums text-[#626B75]">
                  {dataHora(e.quando)}
                  {e.autor && ` · ${e.autor}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── 6. Resultados do período ─────────────────────────────────────
async function Resultados({ dados: p, params }: { dados: Promise<DadosPainel>; params: Busca }) {
  const d = await p;
  const valida = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  let periodo = params.periodo ?? params.dias ?? "30";
  let de: string;
  let ate = d.hoje;
  if (periodo === "custom" && valida(params.de) && valida(params.ate) && params.de! <= params.ate!) {
    de = params.de!;
    ate = params.ate!;
  } else {
    if (!["7", "30", "90"].includes(periodo)) periodo = "30";
    de = addDias(d.hoje, -(Number(periodo) - 1));
  }
  const rotulo = periodo === "custom" ? `${dataCurta(de)} a ${dataCurta(ate)}` : `Últimos ${periodo} dias`;

  return (
    <Card
      id="resultados"
      titulo="Resultados do período"
      subtitulo={`${rotulo} · este filtro vale só para esta seção`}
      cor="#59636F"
      acao={<PeriodoSelector periodoAtivo={periodo} de={periodo === "custom" ? de : undefined} ate={periodo === "custom" ? ate : undefined} />}
    >
      {falhou(d.clientes) || falhou(d.fechamentos) ? (
        <FalhaCarregar oque="os resultados" />
      ) : (
        (() => {
          const r = resultadosPeriodo(d.clientes, d.fechamentos, de, ate);
          const encerrados = r.ganhos + r.perdidos;
          const Stat = ({ titulo, valor, detalhe }: { titulo: string; valor: React.ReactNode; detalhe?: React.ReactNode }) => (
            <div className="rounded-xl bg-[#F5F6F7] p-4">
              <p className="text-[13px] font-medium text-[#626B75]">{titulo}</p>
              <p className="mt-1 text-[24px] font-semibold leading-tight tabular-nums text-[#20252B]">{valor}</p>
              {detalhe && <p className="mt-0.5 text-[13px] text-[#626B75]">{detalhe}</p>}
            </div>
          );
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat titulo="Novos clientes" valor={r.novos} detalhe="Pela data de cadastro" />
                <Stat titulo="Negócios ganhos" valor={r.ganhos} detalhe="Pela data de fechamento" />
                <Stat
                  titulo="Valor dos negócios ganhos"
                  valor={brl(r.valorGanhoC)}
                  detalhe={
                    r.ganhosComProposta || r.ganhosSemValor
                      ? [r.ganhosComProposta && `${r.ganhosComProposta} pelo valor da proposta`, r.ganhosSemValor && `${r.ganhosSemValor} sem valor`].filter(Boolean).join(" · ")
                      : "Pelo valor contratado"
                  }
                />
                <Stat
                  titulo="Taxa de ganho"
                  valor={encerrados ? `${Math.round((r.ganhos / encerrados) * 100)}%` : <span className="text-base text-[#626B75]">Sem base no período</span>}
                  detalhe={
                    encerrados
                      ? `${r.ganhos} ${r.ganhos === 1 ? "ganho" : "ganhos"} de ${encerrados} ${encerrados === 1 ? "negócio encerrado" : "negócios encerrados"}`
                      : "Ganhos ÷ (ganhos + perdidos)"
                  }
                />
              </div>
              {r.semData > 0 && (
                <p className="mt-3 text-[13px] text-[#626B75]">
                  {r.semData} {r.semData === 1 ? "negócio fechado não tem" : "negócios fechados não têm"} data de fechamento registrada e não {r.semData === 1 ? "entra" : "entram"} no período.
                </p>
              )}
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-[#20252B]">Novos clientes por dia</p>
                <NovosClientesChart dados={r.porDia} />
              </div>
            </>
          );
        })()
      )}
    </Card>
  );
}
