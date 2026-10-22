import type { createClient } from "@/lib/supabase/server";
import { calcularParcela, centavos, hojeCRM, nomeParcela, type Lancamento, type Parcela, type ParcelaCalculada } from "./financeiro";
import { execucaoIniciada } from "./processo";
import { ehRegistroTeste } from "./origem";
import type { Estagio, EstagioEntrega } from "./types";

// Dados da Visão geral do CRM (Wilson, 22/out/2026). Tudo vem do banco;
// cada bloco sabe se a consulta falhou (nunca mostra zero no lugar de erro).
// Registros de teste (origem "TESTE —") ficam fora das métricas; arquivados
// ficam fora das filas ativas, mas contam nos resultados históricos.

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type Falhou = { erro: true };
export const falhou = (x: unknown): x is Falhou => !!x && typeof x === "object" && (x as Falhou).erro === true;

const ABERTAS: Estagio[] = ["novo_lead", "qualificacao", "proposta_enviada", "negociacao"];
const PREPARACAO: EstagioEntrega[] = ["roteiro_elaboracao", "roteiro_entregue", "reservas_confirmadas"];

export type ClientePainel = {
  id: string;
  nome: string;
  estagio: Estagio;
  estagioEntrega: EstagioEntrega;
  execucaoIniciada: boolean;
  valorProposta: number | null;
  valorContratado: number | null;
  dataViagem: string | null;
  arquivado: boolean;
  teste: boolean;
  criadoEm: string;
};

export type ParcelaPainel = ParcelaCalculada & { clienteId: string; clienteNome: string };

export type EventoPainel = {
  id: string;
  tipo: string; // tipo da interação ou "financeiro:<acao>"
  clienteId: string;
  clienteNome: string;
  resumo: string;
  autor: string | null;
  quando: string;
};

export type DadosPainel = {
  hoje: string;
  clientes: ClientePainel[] | Falhou;
  /** Data de fechamento (data_evento da última mudança para fechado_*). */
  fechamentos: Map<string, string> | Falhou;
  parcelas: ParcelaPainel[] | Falhou;
  financeiroSemMigracao: boolean;
  eventos: EventoPainel[] | Falhou;
};

const addDias = (iso: string, n: number) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
};
export { addDias };

const TABELA_AUSENTE = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

export async function carregarPainel(supabase: Supabase, opcoes: { eventos?: number } = {}): Promise<DadosPainel> {
  const hoje = hojeCRM();
  const limiteEventos = opcoes.eventos ?? 12;

  const [rClientes, rMudancas, rPagamentos, rRecebimentos, rInteracoes, rEventosFin] = await Promise.all([
    supabase.from("clientes").select("*"),
    supabase
      .from("interacoes")
      .select("cliente_id, tipo, estagio_destino, data_evento, created_at")
      .in("tipo", ["mudanca_estagio", "mudanca_estagio_entrega"])
      .order("created_at", { ascending: false })
      .limit(20000),
    supabase.from("pagamentos").select("*"),
    supabase.from("recebimentos").select("id, pagamento_id, tipo, valor, data, forma_pagamento, comprovante_arquivo_id, observacoes, motivo, estorno_de, origem, created_at"),
    supabase
      .from("interacoes")
      .select("id, cliente_id, tipo, conteudo, created_at, perfis(nome, email)")
      .order("created_at", { ascending: false })
      .limit(limiteEventos),
    supabase.from("financeiro_eventos").select("id, cliente_id, acao, descricao, autor_id, created_at").order("created_at", { ascending: false }).limit(limiteEventos),
  ]);

  // Clientes
  let clientes: ClientePainel[] | Falhou = { erro: true };
  const nomePorId = new Map<string, string>();
  if (!rClientes.error && rClientes.data) {
    const comExecucao = new Set<string>();
    for (const m of rMudancas.data ?? []) if (m.tipo === "mudanca_estagio_entrega") comExecucao.add(m.cliente_id);
    clientes = rClientes.data.map((c) => {
      nomePorId.set(c.id, c.nome);
      return {
        id: c.id,
        nome: c.nome,
        estagio: c.estagio,
        estagioEntrega: c.estagio_entrega,
        execucaoIniciada: execucaoIniciada(c.estagio_entrega, comExecucao.has(c.id)),
        valorProposta: c.valor_proposta === null || c.valor_proposta === undefined ? null : Number(c.valor_proposta),
        valorContratado: c.valor_contratado === null || c.valor_contratado === undefined ? null : Number(c.valor_contratado),
        dataViagem: c.data_viagem ?? null,
        arquivado: !!c.arquivado_em,
        teste: ehRegistroTeste(c.origem),
        criadoEm: c.created_at,
      };
    });
  } else console.error("Visão geral: erro ao carregar clientes", rClientes.error);

  // Datas de fechamento (mais recente primeiro → primeira ocorrência vale).
  let fechamentos: Map<string, string> | Falhou = { erro: true };
  if (!rMudancas.error) {
    fechamentos = new Map();
    for (const m of rMudancas.data ?? []) {
      if (m.tipo !== "mudanca_estagio") continue;
      if (m.estagio_destino !== "fechado_ganho" && m.estagio_destino !== "fechado_perdido") continue;
      const chave = `${m.cliente_id}:${m.estagio_destino}`;
      if (!fechamentos.has(chave)) fechamentos.set(chave, m.data_evento ? String(m.data_evento).slice(0, 10) : diaCRM(m.created_at));
    }
  } else console.error("Visão geral: erro ao carregar mudanças de etapa", rMudancas.error);

  // Parcelas (saldo real: valor − recebido + estornos)
  let parcelas: ParcelaPainel[] | Falhou = { erro: true };
  const financeiroSemMigracao = TABELA_AUSENTE(rRecebimentos.error);
  if (!rPagamentos.error && (!rRecebimentos.error || financeiroSemMigracao) && !falhou(clientes)) {
    const brutas = rPagamentos.data ?? [];
    const lancamentos: Lancamento[] = financeiroSemMigracao
      ? brutas
          .filter((p) => p.status === "pago" && Number(p.valor) > 0)
          .map((p) => ({
            id: `virtual-${p.id}`,
            pagamento_id: p.id,
            tipo: "recebimento" as const,
            valor: Number(p.valor),
            data: p.data_pagamento,
            forma_pagamento: p.tipo_pagamento,
            comprovante_arquivo_id: null,
            observacoes: null,
            motivo: null,
            estorno_de: null,
            origem: "legado" as const,
            autor: null,
            created_at: p.created_at,
          }))
      : (rRecebimentos.data ?? []).map((r) => ({ ...r, valor: Number(r.valor), autor: null }));
    const porCliente = new Map((clientes as ClientePainel[]).map((c) => [c.id, c]));
    parcelas = brutas.map((p) => {
      const parcela: Parcela = {
        id: p.id,
        descricao: p.descricao ?? null,
        servico: p.servico ?? null,
        numero_parcela: p.numero_parcela,
        total_parcelas: p.total_parcelas,
        valor: Number(p.valor),
        status: p.status,
        data_vencimento: p.data_vencimento,
        observacoes: p.observacoes,
        gateway: p.gateway ?? null,
        created_at: p.created_at,
      };
      return {
        ...calcularParcela(parcela, lancamentos, hoje),
        clienteId: p.cliente_id,
        clienteNome: porCliente.get(p.cliente_id)?.nome ?? "Cliente",
        // Arquivados e testes saem das filas (marcados para o filtro abaixo).
        _ativo: !!porCliente.get(p.cliente_id) && !porCliente.get(p.cliente_id)!.arquivado && !porCliente.get(p.cliente_id)!.teste,
      } as ParcelaPainel & { _ativo: boolean };
    });
    parcelas = (parcelas as (ParcelaPainel & { _ativo: boolean })[]).filter((p) => p._ativo);
  } else if (rPagamentos.error || rRecebimentos.error) {
    console.error("Visão geral: erro ao carregar financeiro", rPagamentos.error ?? rRecebimentos.error);
  }

  // Atividade: interações + eventos financeiros (se a migração existir).
  let eventos: EventoPainel[] | Falhou = { erro: true };
  if (!rInteracoes.error) {
    const idsAutores = [...new Set((rEventosFin.data ?? []).map((e) => e.autor_id).filter(Boolean))] as string[];
    const autores = new Map<string, string>();
    if (idsAutores.length) {
      const { data: perfis } = await supabase.from("perfis").select("id, nome, email").in("id", idsAutores);
      for (const p of perfis ?? []) autores.set(p.id, p.nome || p.email);
    }
    const lista: EventoPainel[] = [
      ...(rInteracoes.data ?? []).map((i) => {
        const p = Array.isArray(i.perfis) ? i.perfis[0] : i.perfis;
        return {
          id: `i-${i.id}`,
          tipo: i.tipo,
          clienteId: i.cliente_id,
          clienteNome: nomePorId.get(i.cliente_id) ?? "Cliente",
          resumo: i.conteudo,
          autor: (p?.nome || p?.email || null) as string | null,
          quando: i.created_at,
        };
      }),
      ...(rEventosFin.error ? [] : rEventosFin.data ?? [])
        .filter((e) => e.acao === "recebimento" || e.acao === "estorno" || e.acao === "reembolso")
        .map((e) => ({
          id: `f-${e.id}`,
          tipo: `financeiro:${e.acao}`,
          clienteId: e.cliente_id,
          clienteNome: nomePorId.get(e.cliente_id) ?? "Cliente",
          resumo: e.descricao,
          autor: e.autor_id ? autores.get(e.autor_id) ?? null : null,
          quando: e.created_at,
        })),
    ];
    eventos = lista.sort((a, b) => (a.quando < b.quando ? 1 : -1)).slice(0, limiteEventos);
  } else console.error("Visão geral: erro ao carregar interações", rInteracoes.error);

  return { hoje, clientes, fechamentos, parcelas, financeiroSemMigracao, eventos };
}

// ── Cálculos dos blocos ──────────────────────────────────────────
export function ativosReais(clientes: ClientePainel[]) {
  return clientes.filter((c) => !c.arquivado && !c.teste);
}

export function negociacoesAbertas(clientes: ClientePainel[]) {
  const abertas = ativosReais(clientes).filter((c) => ABERTAS.includes(c.estagio));
  const comValor = abertas.filter((c) => c.valorProposta !== null);
  return {
    quantidade: abertas.length,
    valorC: comValor.reduce((s, c) => s + centavos(c.valorProposta), 0),
    semValor: abertas.length - comValor.length,
  };
}

export function porEtapaComercial(clientes: ClientePainel[]) {
  const ativos = ativosReais(clientes);
  return {
    abertas: ABERTAS.map((estagio) => {
      const lista = ativos.filter((c) => c.estagio === estagio);
      return {
        estagio,
        quantidade: lista.length,
        valorC: lista.reduce((s, c) => s + centavos(c.valorProposta ?? 0), 0),
        semValor: lista.filter((c) => c.valorProposta === null).length,
      };
    }),
    ganhos: ativos.filter((c) => c.estagio === "fechado_ganho").length,
    perdidos: ativos.filter((c) => c.estagio === "fechado_perdido").length,
  };
}

/** Cada projeto conta uma vez, pela etapa atual. Perdidos ficam fora. */
export function porEtapaExecucao(clientes: ClientePainel[]) {
  const universo = ativosReais(clientes).filter((c) => c.estagio !== "fechado_perdido");
  const aguardando = universo.filter((c) => c.estagio === "fechado_ganho" && !c.execucaoIniciada).length;
  const iniciados = universo.filter((c) => c.execucaoIniciada);
  const etapas: EstagioEntrega[] = ["roteiro_elaboracao", "roteiro_entregue", "reservas_confirmadas", "viagem_andamento"];
  return {
    aguardando,
    etapas: etapas.map((e) => ({ etapa: e, quantidade: iniciados.filter((c) => c.estagioEntrega === e).length })),
    concluidos: iniciados.filter((c) => c.estagioEntrega === "concluida").length,
    emPreparacao: iniciados.filter((c) => PREPARACAO.includes(c.estagioEntrega)).length,
  };
}

export function proximasViagens(clientes: ClientePainel[], hoje: string) {
  const limite = addDias(hoje, 30);
  const base = ativosReais(clientes).filter((c) => c.estagio !== "fechado_perdido" && (c.estagio === "fechado_ganho" || c.execucaoIniciada));
  return {
    emAndamento: base.filter((c) => c.execucaoIniciada && c.estagioEntrega === "viagem_andamento"),
    proximas: base
      .filter((c) => c.dataViagem && c.dataViagem >= hoje && c.dataViagem <= limite && c.estagioEntrega !== "viagem_andamento" && c.estagioEntrega !== "concluida")
      .sort((a, b) => (a.dataViagem! < b.dataViagem! ? -1 : 1)),
  };
}

export function recebimentos(parcelas: ParcelaPainel[], hoje: string) {
  const limite = addDias(hoje, 7);
  const abertas = parcelas.filter((p) => p.saldoC > 0 && p.situacao !== "cancelada");
  const vencidas = abertas.filter((p) => p.atrasada);
  const proximas = abertas.filter((p) => p.data_vencimento && p.data_vencimento >= hoje && p.data_vencimento <= limite);
  const fila = [...vencidas.sort((a, b) => (a.data_vencimento! < b.data_vencimento! ? -1 : 1)), ...proximas.sort((a, b) => (a.data_vencimento! < b.data_vencimento! ? -1 : 1))];
  return {
    vencidas: { quantidade: vencidas.length, saldoC: vencidas.reduce((s, p) => s + p.saldoC, 0) },
    proximas: { quantidade: proximas.length, saldoC: proximas.reduce((s, p) => s + p.saldoC, 0) },
    fila,
  };
}

export function resultadosPeriodo(clientes: ClientePainel[], fechamentos: Map<string, string>, de: string, ate: string) {
  const reais = clientes.filter((c) => !c.teste); // arquivados contam no histórico
  const dentro = (d: string) => d >= de && d <= ate;
  const novos = reais.filter((c) => dentro(diaCRM(c.criadoEm)));
  const ganhos = reais.filter((c) => c.estagio === "fechado_ganho" && fechamentos.has(`${c.id}:fechado_ganho`) && dentro(fechamentos.get(`${c.id}:fechado_ganho`)!));
  const perdidos = reais.filter((c) => c.estagio === "fechado_perdido" && fechamentos.has(`${c.id}:fechado_perdido`) && dentro(fechamentos.get(`${c.id}:fechado_perdido`)!));
  const semData = reais.filter(
    (c) => (c.estagio === "fechado_ganho" || c.estagio === "fechado_perdido") && !fechamentos.has(`${c.id}:${c.estagio}`),
  ).length;
  const valorGanhoC = ganhos.reduce((s, c) => s + centavos(c.valorContratado ?? c.valorProposta ?? 0), 0);
  const ganhosComProposta = ganhos.filter((c) => c.valorContratado === null && c.valorProposta !== null).length;
  const ganhosSemValor = ganhos.filter((c) => c.valorContratado === null && c.valorProposta === null).length;

  // Novos clientes por dia (contagens inteiras).
  const porDia: { dia: string; total: number }[] = [];
  for (let d = de; d <= ate; d = addDias(d, 1)) porDia.push({ dia: d, total: 0 });
  const indice = new Map(porDia.map((p, i) => [p.dia, i]));
  for (const c of novos) {
    const i = indice.get(diaCRM(c.criadoEm));
    if (i !== undefined) porDia[i].total++;
  }

  return { novos: novos.length, ganhos: ganhos.length, perdidos: perdidos.length, valorGanhoC, ganhosComProposta, ganhosSemValor, semData, porDia };
}

/** Dia (AAAA-MM-DD) de um timestamp no fuso do CRM. */
export function diaCRM(iso: string) {
  return hojeCRM(new Date(iso));
}

export { nomeParcela };
