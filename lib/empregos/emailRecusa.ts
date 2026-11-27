import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailResend } from "@/lib/email/enviar";
import { emailClienteHtml, emailClienteTexto, type EmailClienteParams } from "@/lib/email/templateCliente";
import { lerAndamentoManual } from "@/lib/crm/andamentoManual";
import { hojeSP } from "@/lib/empregos/followups";

// E-mail de retorno ao candidato eliminado pelo filtro automático (Wilson,
// 18/nov/2026: "quando um cliente é recusado pelo filtro automático (ex.:
// não ser descendente de japonês) ele deve receber em 2 dias um e-mail
// dizendo que avaliamos o perfil e que não se encaixa no momento").
//
// Regras:
// - Candidatura do dia D (horário de SP) recebe o e-mail no cron do dia D+2
//   (8h de Brasília — vercel.json). Atrasos do cron só empurram o envio.
// - O motivo da eliminação NUNCA vai no e-mail (regra fixa do /empregos).
// - Só para quem o sistema eliminou e continua eliminado: pula quem a equipe
//   reclassificou à mão (a última reclassificação não é do "sistema"), quem
//   teve a etapa 2 liberada no CRM e quem tem outra candidatura ativa com o
//   mesmo e-mail (ex.: passou numa vaga sugerida) — não faz sentido dizer
//   "não se encaixa" para alguém que está avançando em outra vaga.
// - Blacklist conta como eliminação automática: recebe o mesmo e-mail
//   neutro (o candidato vê a mesma resposta de um perfil não aprovado).
// - Várias vagas eliminadas com o mesmo e-mail = 1 e-mail só, citando todas.
// - Só candidaturas a partir de RECUSA_A_PARTIR_DE (18/nov/2026): o
//   histórico antigo de eliminados não recebe nada quando isto for ao ar
//   (os retroativos foram enviados à mão pelo Wilson).

/** Início (SP) do dia a partir do qual as candidaturas recebem o e-mail. */
export const RECUSA_A_PARTIR_DE = "2026-11-18T03:00:00Z"; // 18/nov/2026 00h de Brasília
const DIAS_ATE_EMAIL = 2;
const MAX_POR_EXECUCAO = 100;
const DIA_MS = 86_400_000;

type Admin = ReturnType<typeof createAdminClient>;

type LinhaRecusa = {
  id: string;
  nome: string | null;
  sobrenome: string | null;
  email: string | null;
  vaga_titulo: string | null;
  vaga_empresa: string | null;
  created_at: string;
  ficha_liberada: boolean | null;
  andamento_manual: unknown;
};

const normalizarEmail = (e: string | null | undefined) => (e ?? "").trim().toLowerCase();

/** A classificação "eliminado" ainda é a do sistema (sem reclassificação manual por cima)? */
function eliminacaoAutomatica(andamento: unknown): boolean {
  const ultima = lerAndamentoManual(andamento).reclassificacoes.at(-1);
  return !ultima || ultima.por.startsWith("sistema");
}

/** Dia (AAAA-MM-DD, horário de SP) em que o e-mail sai para uma candidatura criada em `createdAt`. */
export function dataEmailRecusa(createdAt: string): string {
  const diaSP = new Date(Date.parse(createdAt) - 3 * 3600_000).toISOString().slice(0, 10);
  return new Date(Date.parse(`${diaSP}T12:00:00Z`) + DIAS_ATE_EMAIL * DIA_MS).toISOString().slice(0, 10);
}

export type SituacaoEmailRecusa =
  | { tipo: "enviado"; em: string; por: string | null }
  | { tipo: "programado"; previstoPara: string }
  | { tipo: "nao_enviado" };

/**
 * Situação do e-mail de resposta para o aviso no topo da página do
 * candidato no CRM (Wilson, 19/nov/2026).
 * - enviado: automático (por = "sistema") ou registrado à mão pela equipe;
 * - programado: o cron vai mandar (eliminação automática a partir de
 *   RECUSA_A_PARTIR_DE);
 * - nao_enviado: eliminado, mas o cron não cobre (candidatura antiga,
 *   eliminado à mão, etapa 2 liberada) — a equipe pode registrar envio manual.
 * null = não se aplica (candidato não eliminado e sem envio registrado).
 */
export function situacaoEmailRecusa(c: {
  classificacao?: string | null;
  created_at: string;
  ficha_liberada?: boolean | null;
  andamento_manual?: unknown;
  email_recusa_enviado_em?: string | null;
  email_recusa_por?: string | null;
}): SituacaoEmailRecusa | null {
  if (c.email_recusa_enviado_em) return { tipo: "enviado", em: c.email_recusa_enviado_em, por: c.email_recusa_por ?? null };
  if (c.classificacao !== "eliminado") return null;
  if (!c.ficha_liberada && eliminacaoAutomatica(c.andamento_manual) && Date.parse(c.created_at) >= Date.parse(RECUSA_A_PARTIR_DE))
    return { tipo: "programado", previstoPara: dataEmailRecusa(c.created_at) };
  return { tipo: "nao_enviado" };
}

function montarEmail(nome: string, vagas: string[]): EmailClienteParams {
  const listaVagas =
    vagas.length === 1
      ? `para a vaga ${vagas[0]}`
      : `para as vagas ${vagas.slice(0, -1).join(", ")} e ${vagas.at(-1)}`;
  return {
    nome,
    marca: "Empregos no Japão",
    ocultarSite: true,
    status: "Candidatura avaliada",
    titulo: "Retorno sobre a sua candidatura",
    intro: `Obrigado pelo interesse em trabalhar no Japão com a Ajisai. Nossa equipe avaliou o seu perfil ${listaVagas} e, no momento, ele não se encaixa nos requisitos desta oportunidade.`,
    etapas: [],
    etapaAtual: 0,
    extras: [
      "Novas vagas abrem com frequência. Se surgir uma oportunidade compatível com o seu perfil, você pode se candidatar novamente pelo site da Ajisai.",
      "Desejamos sucesso nos seus próximos passos.",
    ],
    mensagemWhatsapp: `Olá! Sou ${nome} e recebi o retorno da minha candidatura.`,
  };
}

export async function enviarEmailsRecusa(admin: Admin = createAdminClient()) {
  // Candidaturas criadas até o fim do dia D (SP), onde D = hoje − 2.
  const inicioHojeSP = Date.parse(`${hojeSP()}T03:00:00Z`);
  const limite = new Date(inicioHojeSP - (DIAS_ATE_EMAIL - 1) * DIA_MS).toISOString();

  const { data, error } = await admin
    .from("candidaturas_vagas")
    .select("id, nome, sobrenome, email, vaga_titulo, vaga_empresa, created_at, ficha_liberada, andamento_manual")
    .eq("classificacao", "eliminado")
    .is("email_recusa_enviado_em", null)
    .gte("created_at", RECUSA_A_PARTIR_DE)
    .lt("created_at", limite)
    .order("created_at", { ascending: true })
    .limit(MAX_POR_EXECUCAO);
  if (error) {
    // 42703 = coluna não existe → migração 040 ainda não rodou no Supabase.
    console.error("Erro ao ler candidaturas para e-mail de recusa:", error.code, error.message);
    return { elegiveis: 0, enviados: 0, pulados: 0, erro: error.code ?? "erro" };
  }

  const linhas = ((data ?? []) as LinhaRecusa[]).filter(
    (c) => normalizarEmail(c.email).includes("@") && !c.ficha_liberada && eliminacaoAutomatica(c.andamento_manual),
  );
  if (!linhas.length) return { elegiveis: 0, enviados: 0, pulados: 0 };

  // Outras candidaturas ativas com o mesmo e-mail (a partir de 30 dias antes
  // da mais antiga do lote) — se existir, não manda o "não se encaixa".
  const brutos = Array.from(new Set(linhas.flatMap((c) => [c.email!.trim(), normalizarEmail(c.email)])));
  const desde = new Date(Date.parse(linhas[0].created_at) - 30 * DIA_MS).toISOString();
  const { data: outras, error: erroOutras } = await admin
    .from("candidaturas_vagas")
    .select("email, classificacao, anulada_em")
    .in("email", brutos)
    .gte("created_at", desde)
    .neq("classificacao", "eliminado");
  if (erroOutras) {
    console.error("Erro ao checar candidaturas ativas (e-mail de recusa):", erroOutras.message);
    return { elegiveis: linhas.length, enviados: 0, pulados: 0, erro: erroOutras.code ?? "erro" };
  }
  const comCandidaturaAtiva = new Set(
    ((outras ?? []) as { email: string | null; anulada_em: string | null }[])
      .filter((o) => !o.anulada_em)
      .map((o) => normalizarEmail(o.email)),
  );

  const grupos = new Map<string, LinhaRecusa[]>();
  for (const c of linhas) {
    const k = normalizarEmail(c.email);
    grupos.set(k, [...(grupos.get(k) ?? []), c]);
  }

  let enviados = 0;
  let pulados = 0;
  for (const [email, cands] of grupos) {
    if (comCandidaturaAtiva.has(email)) {
      pulados += cands.length;
      continue;
    }
    const nome = (cands[0].nome ?? "").trim() || "candidato(a)";
    const vagas = Array.from(
      new Set(cands.map((c) => [c.vaga_titulo, c.vaga_empresa ? `(${c.vaga_empresa})` : ""].filter(Boolean).join(" ")).filter(Boolean)),
    );
    const params = montarEmail(nome, vagas.length ? vagas : ["à qual você se candidatou"]);
    const r = await enviarEmailResend({
      to: [cands[0].email!.trim()],
      subject: "Retorno sobre a sua candidatura — Ajisai Empregos",
      text: emailClienteTexto(params),
      html: emailClienteHtml(params),
      rotuloLog: "empregos-recusa",
    });
    if (r.ok) {
      enviados++;
      await admin
        .from("candidaturas_vagas")
        .update({ email_recusa_enviado_em: new Date().toISOString(), email_recusa_por: "sistema" })
        .in("id", cands.map((c) => c.id));
    }
    // Resend aceita ~2 envios/s no plano padrão.
    await new Promise((ok) => setTimeout(ok, 600));
  }
  return { elegiveis: linhas.length, enviados, pulados };
}
