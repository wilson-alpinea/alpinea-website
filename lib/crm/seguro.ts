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
