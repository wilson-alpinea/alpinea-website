import { createAdminClient } from "@/lib/supabase/admin";
import { lerAndamentoManual } from "@/lib/crm/andamentoManual";

// Blacklist de candidatos (Wilson, 04/nov/2026): "adicionar blacklist de
// candidatos, através de nome completo, CPF ou informações-chave para anular
// candidaturas e não ser processado como ativo". Migração 037.
// Uma entrada bate se QUALQUER um dos dados informados nela bater com a
// candidatura (CPF, e-mail, telefone ou nome completo exato, sem acento).
// Candidatura que bate: anulada_em + blacklist_id, classificação
// "eliminado" e ficha bloqueada (fichaLiberada devolve false) — não avança
// de etapa, some da lista de ativos, do portal da empreiteira e do sino.

export type EntradaBlacklist = {
  id: string;
  nome_completo: string | null;
  nome_normalizado: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  motivo: string;
  created_at: string;
  created_by_email: string | null;
  removido_em: string | null;
  removido_por: string | null;
};

export type DadosCandidato = {
  nome?: string | null;
  sobrenome?: string | null;
  email?: string | null;
  telefone?: string | null;
  cpf?: string | null;
};

export const MOTIVO_ELIMINACAO_BLACKLIST = "Candidatura anulada — candidato na blacklist";

export const normalizarNome = (s: string | null | undefined) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export const apenasDigitos = (s: string | null | undefined) => String(s ?? "").replace(/\D/g, "");
export const normalizarEmail = (s: string | null | undefined) => String(s ?? "").trim().toLowerCase();

/** CPF que o candidato informou na ficha cadastral (etapa 2), se houver. */
export function cpfDaFicha(ficha: unknown): string | null {
  const v = (ficha as { valores?: Record<string, unknown> } | null)?.valores?.cpf;
  const d = apenasDigitos(typeof v === "string" ? v : "");
  return d.length === 11 ? d : null;
}

function telefonesBatem(a: string, b: string) {
  if (a.length < 8 || b.length < 8) return false;
  if (a === b) return true;
  // "+55 (11) 98888-7777" x "11988887777": compara pelo final (mín. 10 dígitos).
  const menor = a.length < b.length ? a : b;
  const maior = a.length < b.length ? b : a;
  return menor.length >= 10 && maior.endsWith(menor);
}

/** Qual dado bateu (para mostrar no CRM), ou null. */
export function motivoBate(e: Pick<EntradaBlacklist, "nome_normalizado" | "cpf" | "email" | "telefone">, c: DadosCandidato): string | null {
  const cpf = apenasDigitos(c.cpf);
  if (e.cpf && cpf.length === 11 && e.cpf === cpf) return "CPF";
  const email = normalizarEmail(c.email);
  if (e.email && email && e.email === email) return "e-mail";
  if (e.telefone && telefonesBatem(e.telefone, apenasDigitos(c.telefone))) return "telefone";
  const nome = normalizarNome(`${c.nome ?? ""} ${c.sobrenome ?? ""}`);
  if (e.nome_normalizado && nome && e.nome_normalizado === nome) return "nome completo";
  return null;
}

type Admin = ReturnType<typeof createAdminClient>;

/** Entradas ativas. Sem a migração 037 → lista vazia (não derruba a candidatura). */
export async function entradasAtivas(admin: Admin = createAdminClient()): Promise<EntradaBlacklist[]> {
  const { data, error } = await admin.from("empregos_blacklist").select("*").is("removido_em", null).limit(5000);
  if (error) {
    if (error.code !== "42P01" && error.code !== "PGRST205") console.error("Erro ao ler a blacklist:", error.message);
    return [];
  }
  return (data ?? []) as EntradaBlacklist[];
}

export async function encontrarNaBlacklist(c: DadosCandidato, admin: Admin = createAdminClient()) {
  for (const e of await entradasAtivas(admin)) {
    const campo = motivoBate(e, c);
    if (campo) return { entrada: e, campo };
  }
  return null;
}

/** Campos para gravar numa candidatura NOVA que bateu na blacklist. */
export function camposCandidaturaAnulada(entradaId: string, motivosExistentes: string[] = []) {
  return {
    blacklist_id: entradaId,
    anulada_em: new Date().toISOString(),
    classificacao: "eliminado",
    ficha_liberada: false,
    motivos_eliminacao: Array.from(new Set([MOTIVO_ELIMINACAO_BLACKLIST, ...motivosExistentes])),
  };
}

/**
 * Anula as candidaturas já existentes que batem com a entrada. Registra a
 * mudança como reclassificação manual (quem, quando, motivo), igual à
 * reclassificação feita pela tela do candidato. Devolve quantas anulou.
 */
export async function anularCandidaturasExistentes(entrada: EntradaBlacklist, por: string, admin: Admin = createAdminClient()) {
  let anuladas = 0;
  for (let de = 0; ; de += 1000) {
    const { data, error } = await admin
      .from("candidaturas_vagas")
      .select("id, nome, sobrenome, email, telefone, ficha, classificacao, motivos_eliminacao, andamento_manual, anulada_em")
      .order("created_at", { ascending: true })
      .range(de, de + 999);
    if (error) {
      console.error("Erro ao ler candidaturas para a blacklist:", error.message);
      break;
    }
    for (const c of data ?? []) {
      if (c.anulada_em) continue;
      if (!motivoBate(entrada, { ...c, cpf: cpfDaFicha(c.ficha) })) continue;
      const andamento = lerAndamentoManual(c.andamento_manual);
      const agora = new Date().toISOString();
      andamento.reclassificacoes.push({ em: agora, por, de: c.classificacao ?? "", para: "eliminado", motivo: `Blacklist: ${entrada.motivo}` });
      const { error: e2 } = await admin
        .from("candidaturas_vagas")
        .update({ ...camposCandidaturaAnulada(entrada.id, (c.motivos_eliminacao ?? []) as string[]), andamento_manual: andamento, updated_at: agora })
        .eq("id", c.id);
      if (e2) console.error("Erro ao anular candidatura (blacklist):", e2.message);
      else anuladas++;
    }
    if (!data || data.length < 1000) break;
  }
  return anuladas;
}
