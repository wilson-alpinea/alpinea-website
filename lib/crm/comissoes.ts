// Comissões a distribuir (Wilson, 29/out/2026: "precisa deixar claro valores
// a distribuir/comissão ... todas as comissões são pagas até o dia 10 útil do
// mês seguinte"). Calcula, por mês, a remuneração de cada empresa parceira
// (clientes.parceiro_id) e de cada usuário com remuneração (consultor/parceiro
// — clientes.responsavel_id), a partir da regra cadastrada em Acessos
// (migração 030):
//   - percentual: % sobre o valor RECEBIDO no mês (recebimentos − estornos).
//     O CRM ainda não guarda o custo de cada venda, então a base é a receita
//     recebida, não a líquida — ajustar quando houver o custo;
//   - fixo: valor por venda fechada (etapa "Fechado — Ganho") no mês.
// Só servidor (usa service role).
import { createAdminClient } from "@/lib/supabase/admin";

export type Beneficiario = {
  chave: string;
  nome: string;
  tipo: "empresa" | "usuario";
  regra: "percentual" | "fixo";
  valorRegra: number;
  vendas: number;
  recebidoC: number;
  comissaoC: number;
};
export type ResumoComissoes = { mes: string; rotuloMes: string; prazo: string; beneficiarios: Beneficiario[]; totalC: number };

const centavos = (v: unknown) => Math.round((Number(v) || 0) * 100);

/** 10º dia útil (segunda a sexta; feriados não considerados) do mês seguinte a `mes` (AAAA-MM). */
export function prazoComissao(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m, 1)); // mês seguinte (m é 1-based → índice m = próximo)
  let uteis = 0;
  for (;;) {
    const dia = d.getUTCDay();
    if (dia !== 0 && dia !== 6 && ++uteis === 10) break;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

const rotulo = (mes: string) => {
  const t = new Date(`${mes}-15T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export async function calcularComissoes(meses: string[]): Promise<ResumoComissoes[] | { erro: string }> {
  const db = createAdminClient();
  const [rPar, rPerf, rCli, rFech, rPag, rRec] = await Promise.all([
    db.from("parceiros").select("*"),
    db.from("perfis").select("*"),
    db.from("clientes").select("id, parceiro_id, responsavel_id, arquivado_em"),
    db.from("interacoes").select("cliente_id, estagio_destino, data_evento, created_at").eq("tipo", "mudanca_estagio").eq("estagio_destino", "fechado_ganho"),
    db.from("pagamentos").select("id, cliente_id"),
    db.from("recebimentos").select("pagamento_id, tipo, valor, data"),
  ]);
  if (rPar.error || rPerf.error || rCli.error) return { erro: "Não foi possível carregar os dados (rodou a migração 030?)." };

  type Regra = { nome: string; tipo: "percentual" | "fixo"; valor: number };
  const regra = (x: { remuneracao_tipo?: string | null; remuneracao_valor?: unknown }) =>
    (x.remuneracao_tipo === "percentual" || x.remuneracao_tipo === "fixo") && Number(x.remuneracao_valor) > 0
      ? { tipo: x.remuneracao_tipo as "percentual" | "fixo", valor: Number(x.remuneracao_valor) }
      : null;
  const empresas = new Map<string, Regra>();
  for (const p of rPar.data ?? []) {
    const r = regra(p);
    if (r) empresas.set(p.id, { nome: p.nome, ...r });
  }
  const usuarios = new Map<string, Regra>();
  for (const u of rPerf.data ?? []) {
    const r = regra(u);
    if (r && u.papel !== "admin") usuarios.set(u.id, { nome: u.nome || u.email, ...r });
  }
  const clientes = new Map((rCli.data ?? []).map((c) => [c.id as string, c]));
  const clienteDoPag = new Map((rPag.data ?? []).map((p) => [p.id as string, p.cliente_id as string]));

  return meses.map((mes) => {
    const acc = new Map<string, Beneficiario>();
    const pegar = (chave: string, r: Regra, tipo: Beneficiario["tipo"]) => {
      let b = acc.get(chave);
      if (!b) acc.set(chave, (b = { chave, nome: r.nome, tipo, regra: r.tipo, valorRegra: r.valor, vendas: 0, recebidoC: 0, comissaoC: 0 }));
      return b;
    };
    const donos = (clienteId: string) => {
      const c = clientes.get(clienteId);
      if (!c) return [];
      const out: Beneficiario[] = [];
      if (c.parceiro_id && empresas.has(c.parceiro_id)) out.push(pegar(`e:${c.parceiro_id}`, empresas.get(c.parceiro_id)!, "empresa"));
      if (c.responsavel_id && usuarios.has(c.responsavel_id)) out.push(pegar(`u:${c.responsavel_id}`, usuarios.get(c.responsavel_id)!, "usuario"));
      return out;
    };
    // Vendas fechadas no mês (uma por cliente).
    const vendidos = new Set<string>();
    for (const f of rFech.data ?? []) {
      const dia = String(f.data_evento ?? f.created_at).slice(0, 7);
      if (dia === mes) vendidos.add(f.cliente_id);
    }
    for (const id of vendidos) for (const b of donos(id)) b.vendas++;
    // Recebido no mês.
    for (const r of rRec.data ?? []) {
      if (String(r.data ?? "").slice(0, 7) !== mes) continue;
      const cid = clienteDoPag.get(r.pagamento_id);
      if (!cid) continue;
      const v = (r.tipo === "estorno" ? -1 : r.tipo === "recebimento" ? 1 : 0) * centavos(r.valor);
      for (const b of donos(cid)) b.recebidoC += v;
    }
    const beneficiarios = [...acc.values()]
      .map((b) => ({ ...b, comissaoC: b.regra === "fixo" ? Math.round(b.vendas * b.valorRegra * 100) : Math.round((Math.max(0, b.recebidoC) * b.valorRegra) / 100) }))
      .filter((b) => b.comissaoC > 0 || b.vendas > 0 || b.recebidoC > 0)
      .sort((a, b) => b.comissaoC - a.comissaoC);
    return { mes, rotuloMes: rotulo(mes), prazo: prazoComissao(mes), beneficiarios, totalC: beneficiarios.reduce((s, b) => s + b.comissaoC, 0) };
  });
}
