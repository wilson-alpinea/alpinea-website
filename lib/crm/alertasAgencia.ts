// Alertas da Agência ao lado do sino (Wilson, 29/out/2026):
// - Protocolo Pré-embarque: clientes fechados que embarcam nos próximos 7 dias.
// - Oportunidades de Upsell: depois de fechar, 30 dias após o fechamento —
//   ou, se faltar menos de 30 dias entre o fechamento e a viagem, na metade
//   desse tempo. Fica ativo até a viagem (sem data de viagem: por 30 dias).
// Puro: recebe os dados já carregados pela Visão geral (respeita o filtro de produto).
import type { Notificacao } from "./notificacoes";
import { falhou, type DadosPainel } from "./painel";

const DIA = 86_400_000;
const somar = (iso: string, dias: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + dias * DIA).toISOString().slice(0, 10);
const entre = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DIA);
const br = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

export const DIAS_PRE_EMBARQUE = 7;
export const DIAS_UPSELL = 30;

export function alertasAgencia(d: DadosPainel): { preEmbarque: Notificacao[]; upsell: Notificacao[] } | { erro: true } {
  if (falhou(d.clientes) || falhou(d.fechamentos)) return { erro: true };
  const fechamentos = d.fechamentos;
  const hoje = d.hoje;
  const preEmbarque: Notificacao[] = [];
  const upsell: Notificacao[] = [];
  for (const c of d.clientes) {
    if (c.arquivado || c.teste || c.estagio !== "fechado_ganho") continue;
    const viagem = c.dataViagem ? c.dataViagem.slice(0, 10) : null;
    const base = { clienteId: c.id, clienteNome: c.nome, href: `/crm/clientes/${c.id}`, lida: false };

    if (viagem && viagem >= hoje && entre(hoje, viagem) <= DIAS_PRE_EMBARQUE) {
      const faltam = entre(hoje, viagem);
      preEmbarque.push({
        ...base,
        id: `pre-${c.id}-${viagem}`,
        tipo: "alerta",
        titulo: faltam === 0 ? "Embarca hoje" : `Embarca em ${faltam} ${faltam === 1 ? "dia" : "dias"} — ${br(viagem)}`,
        detalhe: "Protocolo pré-embarque: documentos, vouchers, contatos e checklist final.",
        quando: `${somar(viagem, -DIAS_PRE_EMBARQUE)}T12:00:00Z`,
      });
    }

    const fechou = fechamentos.get(`${c.id}:fechado_ganho`);
    if (!fechou) continue;
    const gap = viagem ? entre(fechou, viagem) : null;
    const espera = gap !== null && gap < DIAS_UPSELL ? Math.max(0, Math.floor(gap / 2)) : DIAS_UPSELL;
    const alerta = somar(fechou, espera);
    const fim = viagem ?? somar(alerta, DIAS_UPSELL);
    if (hoje >= alerta && hoje < fim) {
      upsell.push({
        ...base,
        id: `ups-${c.id}-${alerta}`,
        tipo: "proposta",
        titulo: "Oportunidade de upsell",
        detalhe: `Fechou em ${br(fechou)}${viagem ? ` · viagem em ${br(viagem)}` : ""} — ofereça serviços adicionais (guia, transporte, JR Pass, seguro, eSIM).`,
        quando: `${alerta}T12:00:00Z`,
      });
    }
  }
  preEmbarque.sort((a, b) => a.quando.localeCompare(b.quando));
  upsell.sort((a, b) => b.quando.localeCompare(a.quando));
  return { preEmbarque, upsell };
}
