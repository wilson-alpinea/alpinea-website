"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirSomenteAdmin } from "@/lib/crm/acesso";
import "@/app/lib/parametrosPreco.todos";
import { padroesRegistrados } from "@/app/lib/parametrosPreco";

// Preços e margens do site (/crm/precos) — Wilson, 04/nov/2026. Só admin.
// Grava só o que difere do padrão do código (igual ao padrão = apaga a
// linha) e dispara o Deploy Hook do Vercel: o site é reconstruído com os
// novos valores em poucos minutos (scripts/gerar-parametros-preco.mjs).

export type ResultadoPrecos = { ok: boolean; mensagem: string; publicacao?: "disparada" | "sem-hook" | "falhou" };
export type AlteracaoPreco = { id: string; valor: number | null };

const iguais = (a: number, b: number) => Math.abs(a - b) < 1e-9;

async function dispararPublicacao(): Promise<"disparada" | "sem-hook" | "falhou"> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_PRECOS;
  if (!hook) return "sem-hook";
  try {
    const r = await fetch(hook, { method: "POST" });
    if (!r.ok) {
      console.error("Deploy Hook de preços respondeu", r.status, await r.text().catch(() => ""));
      return "falhou";
    }
    return "disparada";
  } catch (e) {
    console.error("Falha ao chamar o Deploy Hook de preços:", e);
    return "falhou";
  }
}

function textoPublicacao(p: "disparada" | "sem-hook" | "falhou") {
  if (p === "disparada") return "O site está sendo republicado com os novos valores — leva de 2 a 5 minutos.";
  if (p === "sem-hook") return "Falta configurar VERCEL_DEPLOY_HOOK_PRECOS no Vercel: os valores entram no ar no próximo deploy.";
  return "Não foi possível disparar a republicação agora. Use “Publicar agora” em instantes.";
}

export async function salvarPrecos(alteracoes: AlteracaoPreco[]): Promise<ResultadoPrecos> {
  let acesso;
  try {
    acesso = await garantirSomenteAdmin();
  } catch {
    return { ok: false, mensagem: "Só administradores podem alterar preços." };
  }
  if (!Array.isArray(alteracoes) || alteracoes.length === 0) return { ok: false, mensagem: "Nada para salvar." };
  if (alteracoes.length > 1000) return { ok: false, mensagem: "Alterações demais de uma vez." };

  const padroes = padroesRegistrados();
  const upserts: { id: string; valor: number }[] = [];
  const remover: string[] = [];
  for (const a of alteracoes) {
    if (typeof a?.id !== "string" || !padroes.has(a.id)) return { ok: false, mensagem: `Parâmetro desconhecido: ${String(a?.id)}` };
    if (a.valor === null) {
      remover.push(a.id);
      continue;
    }
    const v = Number(a.valor);
    if (!Number.isFinite(v) || v < 0 || v > 1e9) return { ok: false, mensagem: `Valor inválido em ${a.id}.` };
    if (iguais(v, padroes.get(a.id)!)) remover.push(a.id);
    else upserts.push({ id: a.id, valor: v });
  }

  const db = createAdminClient();
  const ids = [...upserts.map((u) => u.id), ...remover];
  const { data: atuais, error: erroLeitura } = await db.from("precos_parametros").select("id, valor").in("id", ids);
  if (erroLeitura) {
    console.error("precos_parametros (leitura):", erroLeitura);
    return { ok: false, mensagem: "Não foi possível ler os preços salvos. A migração 035 já foi rodada no Supabase?" };
  }
  const anterior = new Map((atuais ?? []).map((r) => [r.id as string, Number(r.valor)]));
  const agora = new Date().toISOString();

  if (upserts.length) {
    const { error } = await db.from("precos_parametros").upsert(
      upserts.map((u) => ({ id: u.id, valor: u.valor, updated_at: agora, updated_by: acesso.userId, updated_by_email: acesso.email })),
    );
    if (error) {
      console.error("precos_parametros (gravação):", error);
      return { ok: false, mensagem: "Não foi possível salvar os preços." };
    }
  }
  if (remover.length) {
    const { error } = await db.from("precos_parametros").delete().in("id", remover);
    if (error) {
      console.error("precos_parametros (restaurar):", error);
      return { ok: false, mensagem: "Não foi possível restaurar os valores padrão." };
    }
  }

  const historico = [
    ...upserts.filter((u) => !(anterior.has(u.id) && iguais(anterior.get(u.id)!, u.valor))).map((u) => ({ parametro_id: u.id, valor_anterior: anterior.get(u.id) ?? padroes.get(u.id)!, valor_novo: u.valor })),
    ...remover.filter((id) => anterior.has(id)).map((id) => ({ parametro_id: id, valor_anterior: anterior.get(id)!, valor_novo: padroes.get(id)! })),
  ].map((h) => ({ ...h, alterado_em: agora, alterado_por: acesso.userId, alterado_por_email: acesso.email }));
  if (historico.length === 0) return { ok: true, mensagem: "Nenhuma mudança em relação ao que já estava salvo." };
  const { error: erroHist } = await db.from("precos_parametros_historico").insert(historico);
  if (erroHist) console.error("precos_parametros_historico:", erroHist);

  const publicacao = await dispararPublicacao();
  revalidatePath("/crm/precos");
  return { ok: true, mensagem: `${historico.length} valor(es) salvo(s). ${textoPublicacao(publicacao)}`, publicacao };
}

export async function publicarPrecos(): Promise<ResultadoPrecos> {
  try {
    await garantirSomenteAdmin();
  } catch {
    return { ok: false, mensagem: "Só administradores podem publicar." };
  }
  const publicacao = await dispararPublicacao();
  return { ok: publicacao === "disparada", mensagem: textoPublicacao(publicacao), publicacao };
}
