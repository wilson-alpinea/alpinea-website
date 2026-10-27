// CRM de Seguro Viagem (Wilson, 26/out/2026) — etapas, cores e prazos.
// Sem dependências de servidor.

export const ETAPAS_SEGURO = [
  { valor: "link_enviado", label: "Aguardando pagamento", curto: "Link enviado", fundo: "#F4F1F8", cor: "#75608B" },
  { valor: "pago", label: "Pago — aguardando apólice", curto: "Pago", fundo: "#FAF5EB", cor: "#93703D" },
  { valor: "apolice_recebida", label: "Apólice recebida", curto: "Apólice recebida", fundo: "#EFF4FA", cor: "#42658A" },
  { valor: "apolice_enviada", label: "Apólice enviada ao cliente", curto: "Apólice enviada", fundo: "#EEF6F3", cor: "#27675B" },
  { valor: "concluido", label: "Viagem concluída", curto: "Concluído", fundo: "#F3F5F5", cor: "#5D6C70" },
  { valor: "cancelado", label: "Cancelado / não pagou", curto: "Cancelado", fundo: "#FDECEA", cor: "#B42318" },
] as const;

export type EtapaSeguro = (typeof ETAPAS_SEGURO)[number]["valor"];
export const isEtapaSeguro = (v: unknown): v is EtapaSeguro => ETAPAS_SEGURO.some((e) => e.valor === v);
export const etapaSeguro = (v: string) => ETAPAS_SEGURO.find((e) => e.valor === v) ?? ETAPAS_SEGURO[0];
/** Etapas do fluxo normal, em ordem (sem "cancelado"). */
export const FLUXO_SEGURO: EtapaSeguro[] = ["link_enviado", "pago", "apolice_recebida", "apolice_enviada", "concluido"];

/** A seguradora tem até 24 h após o pagamento para enviar a apólice. */
export const PRAZO_APOLICE_HORAS = 24;

export type ViajanteSeguro = { nome: string; nascimento?: string | null; idade?: number | null; documento?: string | null; tipo_documento?: string | null };
export type EventoSeguro = { em: string; por: string; tipo: "etapa" | "nota" | "edicao"; de?: string; para?: string; texto?: string };

export type PedidoSeguro = {
  id: string;
  created_at: string;
  updated_at: string;
  etapa: EtapaSeguro;
  nome: string;
  email: string | null;
  telefone: string | null;
  fornecedor: string | null;
  plano: string | null;
  seguradora: string | null;
  partida: string | null;
  retorno: string | null;
  viajantes: ViajanteSeguro[];
  valor_cliente: number | null;
  custo: number | null;
  margem_pct: number | null;
  link_pagamento: string | null;
  aviso_fornecedor: string | null;
  observacoes_cliente: string | null;
  pago_em: string | null;
  apolice_recebida_em: string | null;
  apolice_enviada_em: string | null;
  numero_apolice: string | null;
  motivo_cancelamento: string | null;
  notas: string | null;
  historico: EventoSeguro[];
  canal: string | null;
  canal_detalhe: string | null;
  cliente_origem_id: string | null;
};

/** Situação do prazo da apólice para pedidos pagos ainda sem apólice. */
export function prazoApolice(p: Pick<PedidoSeguro, "etapa" | "pago_em">, agora = Date.now()): null | { limite: number; atrasado: boolean; horasRestantes: number } {
  if (p.etapa !== "pago" || !p.pago_em) return null;
  const limite = Date.parse(p.pago_em) + PRAZO_APOLICE_HORAS * 3600_000;
  const horasRestantes = (limite - agora) / 3600_000;
  return { limite, atrasado: horasRestantes < 0, horasRestantes };
}

// Pedidos trazidos do CRM da Agência só têm o texto do e-mail (notas).
// Extrai dele os dados do seguro para exibir — sem gravar nada no banco.
// Formato: "Plano: X — Seguradora", "Período: AAAA-MM-DD a AAAA-MM-DD",
// "Viajantes: NOME (37 anos); ...", "Valor estimado ao cliente (Pix): R$ 17,96",
// "Custo da agência: R$ 11,97", "Margem aplicada: 50%", "Link de pagamento: ...".
export function extrairDoTexto(texto: string | null | undefined) {
  if (!texto) return null;
  const linha = (rotulo: RegExp) => texto.match(new RegExp(`^${rotulo.source}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim() ?? null;
  const reais = (v: string | null) => {
    const m = v?.match(/R\$\s*([\d.]+,\d{2})/);
    return m ? Number(m[1].replace(/\./g, "").replace(",", ".")) : null;
  };
  const planoLinha = linha(/Plano/);
  const [plano, seguradora] = planoLinha ? planoLinha.split(/\s+—\s+/) : [null, null];
  const periodo = linha(/Per[ií]odo/)?.match(/(\d{4}-\d{2}-\d{2})\s*a\s*(\d{4}-\d{2}-\d{2})/);
  const viajantes = (linha(/Viajantes/) ?? "")
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const m = v.match(/^(.*?)\s*\((\d+)\s*anos?\)$/);
      return { nome: (m ? m[1] : v).trim(), idade: m ? Number(m[2]) : null };
    });
  const margem = linha(/Margem aplicada/)?.match(/([\d.,]+)\s*%/)?.[1];
  const r = {
    plano: plano ?? null,
    seguradora: seguradora ?? null,
    fornecedor: linha(/Fornecedor/)?.replace(/\s*\(.*\)\s*$/, "") ?? null,
    partida: periodo?.[1] ?? null,
    retorno: periodo?.[2] ?? null,
    viajantes,
    valor_cliente: reais(linha(/Valor estimado ao cliente(?: \(Pix\))?/)) ?? reais(linha(/Valor/)),
    custo: reais(linha(/Custo da ag[eê]ncia/)),
    margem_pct: margem ? Number(margem.replace(",", ".")) : null,
    link_pagamento: linha(/Link de pagamento/)?.match(/https?:\/\/\S+/)?.[0] ?? null,
  };
  return r.plano || r.partida || r.valor_cliente != null || viajantes.length ? r : null;
}

/** Completa os campos vazios do pedido com o que vier do texto original. */
export function completarPedido<T extends Partial<PedidoSeguro> & { notas?: string | null }>(p: T): T & { dadosDoTexto: boolean } {
  const x = extrairDoTexto(p.notas);
  if (!x) return { ...p, dadosDoTexto: false };
  const usou = !p.plano && !!x.plano;
  return {
    ...p,
    plano: p.plano ?? x.plano,
    seguradora: p.seguradora ?? x.seguradora,
    fornecedor: p.fornecedor && !p.fornecedor.startsWith("Stone") ? p.fornecedor : (x.fornecedor ?? p.fornecedor ?? null),
    partida: p.partida ?? x.partida,
    retorno: p.retorno ?? x.retorno,
    valor_cliente: p.valor_cliente ?? x.valor_cliente,
    custo: p.custo ?? x.custo,
    margem_pct: p.margem_pct ?? x.margem_pct,
    link_pagamento: p.link_pagamento ?? x.link_pagamento,
    viajantes: Array.isArray(p.viajantes) && p.viajantes.length ? p.viajantes : x.viajantes,
    dadosDoTexto: usou || (!(Array.isArray(p.viajantes) && p.viajantes.length) && x.viajantes.length > 0),
  };
}
