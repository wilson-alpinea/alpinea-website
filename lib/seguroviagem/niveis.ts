// Curadoria dos 3 níveis do Seguro Viagem (Wilson, 26/out/2026, opção
// "3 níveis curados"): de ~225 planos devolvidos pela cotação, a página
// mostra só o plano de menor custo em cada faixa de cobertura médica
// (Essencial US$ 60–99 mil, Recomendado US$ 100–249 mil, Premium US$ 250
// mil+), compatível com a idade de todos os viajantes. Servidor apenas.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { ProdutoSeguro } from "./client";
import {
  NIVEIS,
  comMargem,
  margemDoPlano,
  type DestaqueCobertura,
  type PlanoNivel,
} from "../../app/lib/margemSeguroViagemParceiro";

const COBERTURA_MEDICA = ["med-enf", "med-aci"];

function usd(p: ProdutoSeguro, codigo: string): number {
  const q = p.propriedades.find((x) => x.codigo === codigo);
  if (!q || q.modificador !== "USD") return 0;
  const v = Number(q.valor);
  return Number.isFinite(v) ? v : 0;
}

export function coberturaMedicaUsd(p: ProdutoSeguro): number {
  return Math.max(...COBERTURA_MEDICA.map((c) => usd(p, c)));
}

function valorH(p: ProdutoSeguro, codigo: string): string | null {
  const q = p.propriedades.find((x) => x.codigo === codigo);
  return q ? q.valor_h : null;
}

const DESTAQUES: { codigo: string; rotulo: string }[] = [
  { codigo: "plus-01", rotulo: "COVID-19" },
  { codigo: "pre-ext", rotulo: "Doença preexistente" },
  { codigo: "odontol", rotulo: "Odontológico" },
  { codigo: "farmace", rotulo: "Medicamentos" },
  { codigo: "extravi", rotulo: "Perda de bagagem" },
  { codigo: "cancela", rotulo: "Cancelamento de viagem" },
  { codigo: "atr-voo", rotulo: "Atraso de voo" },
  { codigo: "rep-fun", rotulo: "Repatriação funerária" },
];

function destaques(p: ProdutoSeguro): DestaqueCobertura[] {
  return DESTAQUES.map((d) => ({ rotulo: d.rotulo, valor: valorH(p, d.codigo) ?? "não" })).filter((d) => d.valor !== "");
}

// ── Token assinado: liga o plano escolhido à cotação e às datas de
// nascimento usadas, sem expor o custo para o navegador. ──
export type DadosToken = {
  c: string; // public_id da cotação
  a: string; // apelido do produto
  custo: number;
  balcao: number;
  nome: string;
  seguradora: string;
  nasc: string[];
  partida: string;
  retorno: string;
  exp: number;
};

function segredo() {
  return `seguroviagem:${process.env.SEGUROVIAGEM_API_KEY || ""}`;
}

export function assinar(d: DadosToken): string {
  const corpo = Buffer.from(JSON.stringify(d)).toString("base64url");
  const sig = createHmac("sha256", segredo()).update(corpo).digest("base64url");
  return `${corpo}.${sig}`;
}

export function verificar(token: string): DadosToken | null {
  const [corpo, sig] = String(token || "").split(".");
  if (!corpo || !sig) return null;
  const esperado = createHmac("sha256", segredo()).update(corpo).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(corpo, "base64url").toString("utf-8")) as DadosToken;
    return d.exp > Date.now() ? d : null;
  } catch {
    return null;
  }
}

export function tetoAgencia(): number | null {
  const v = Number(process.env.SEGUROVIAGEM_MARGEM_TETO_PCT);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export function montarNiveis(params: {
  cotacaoId: string;
  produtos: ProdutoSeguro[];
  idades: number[];
  nascimentos: string[];
  partida: string;
  retorno: string;
  emViagem: boolean;
}): PlanoNivel[] {
  const maisVelho = Math.max(...params.idades);
  const maisNovo = Math.min(...params.idades);
  const compativeis = params.produtos.filter(
    (p) =>
      p.idade_maxima >= maisVelho &&
      p.idade_minima <= maisNovo &&
      !p.autorizacao && // exige autorização manual do fornecedor
      (!params.emViagem || p.em_viagem),
  );
  const teto = tetoAgencia();
  const exp = Date.now() + 2 * 60 * 60 * 1000; // cotação válida por 2 h no site
  const resultado: PlanoNivel[] = [];
  for (const nivel of NIVEIS) {
    const naFaixa = compativeis
      .filter((p) => {
        const c = coberturaMedicaUsd(p);
        return c >= nivel.minUsd && c <= nivel.maxUsd;
      })
      .sort((x, y) => x.preco_em_pix_agencia - y.preco_em_pix_agencia);
    const p = naFaixa[0];
    if (!p) continue;
    const margem = margemDoPlano({ idades: params.idades, custo: p.preco_em_reais_agencia, balcao: p.preco_em_reais, teto });
    resultado.push({
      nivel: nivel.id,
      token: assinar({
        c: params.cotacaoId,
        a: p.apelido,
        custo: p.preco_em_reais_agencia,
        balcao: p.preco_em_reais,
        nome: p.nome_plano,
        seguradora: p.assistencia_nome || p.seguradora_nome,
        nasc: params.nascimentos,
        partida: params.partida,
        retorno: params.retorno,
        exp,
      }),
      nome: p.nome_plano,
      seguradora: p.seguradora_nome,
      assistencia: p.assistencia_nome,
      logo: p.assistencia_logo || p.seguradora_logo,
      contrato: p.seguradora_contrato,
      coberturaMedica: `US$ ${coberturaMedicaUsd(p).toLocaleString("pt-BR")}`,
      destaques: destaques(p),
      precoPix: comMargem(p.preco_em_pix_agencia, margem),
      precoCartao: comMargem(p.preco_em_cartao_agencia, margem),
      parcelasMax: p.maximo_parcelas_permitidas,
    });
  }
  return resultado;
}
