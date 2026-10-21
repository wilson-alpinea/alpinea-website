import { createAdminClient } from "@/lib/supabase/admin";
import { lerAndamentoManual } from "./andamentoManual";
import { PASTA_ANEXOS_EQUIPE, TIPOS_DOCUMENTO_CANDIDATO, progressoCandidatura } from "./empregos";
import { linhaTempoCandidatura, type EtapaLinhaTempo } from "./linhaTempoCandidatura";

// Dados do portal da empreiteira (Wilson, 21/out/2026): só candidatos das
// vagas ligadas à empreiteira (tabela vagas_empreiteira), sem nota da
// triagem, comentários internos ou classificação. Tudo lido no servidor
// com service role, sempre filtrado pelo parceiro do usuário logado.

export const COLUNAS_EMPREITEIRA = [
  { key: "triagem", label: "Triagem e ficha" },
  { key: "proposta", label: "Proposta" },
  { key: "preEntrevista", label: "Pré-entrevista" },
  { key: "empreiteira", label: "Apresentado à empreiteira" },
  { key: "entrevistaFinal", label: "Aprovado pela empreiteira" },
  { key: "documentacao", label: "Documentação (COE + visto)" },
  { key: "embarque", label: "Embarcou" },
  { key: "inicio", label: "Em atividade" },
] as const;
export type ColunaEmpreiteira = (typeof COLUNAS_EMPREITEIRA)[number]["key"];

const CAMPOS =
  "id, nome, sobrenome, vaga_id, vaga_titulo, vaga_empresa, classificacao, pontuacao, ficha_liberada, ficha_enviada_em, foto_path, proposta_status, proposta_respondida_em, andamento_manual, testes_aptidao, testes_aptidao_aprovado, data_embarque_prevista, respostas, created_at";

type Bruto = {
  id: string;
  nome: string;
  sobrenome: string;
  vaga_id: string;
  vaga_titulo: string;
  vaga_empresa: string;
  classificacao: string | null;
  pontuacao: number | null;
  ficha_liberada: boolean | null;
  ficha_enviada_em: string | null;
  foto_path: string | null;
  proposta_status: string | null;
  proposta_respondida_em: string | null;
  andamento_manual: unknown;
  testes_aptidao: unknown;
  testes_aptidao_aprovado: boolean | null;
  data_embarque_prevista: string | null;
  respostas: unknown;
  created_at: string;
};

export type CandidatoEmpreiteira = {
  id: string;
  nome: string;
  vagaId: string;
  vagaTitulo: string;
  vagaEmpresa: string;
  coluna: ColunaEmpreiteira;
  status: string;
  dataEmbarque: string | null;
  criadoEm: string;
  linhaTempo: EtapaLinhaTempo[];
};

function colunaDe(c: Bruto, entrevista: { inicio: string; status: string } | null): ColunaEmpreiteira {
  const manual = lerAndamentoManual(c.andamento_manual).etapas;
  const posterior = (["inicio", "embarque", "documentacao", "entrevistaFinal", "empreiteira", "preEntrevista"] as const).find((k) => manual[k]);
  if (posterior) return posterior;
  if (entrevista && entrevista.status !== "cancelada") return "preEntrevista";
  const p = progressoCandidatura(c, null);
  if (p.etapa >= 4) return "preEntrevista";
  if (p.etapa === 3) return "proposta";
  return "triagem";
}

async function vagasDaEmpreiteira(parceiroId: string) {
  const { data } = await createAdminClient().from("vagas_empreiteira").select("vaga_id").eq("parceiro_id", parceiroId);
  return (data ?? []).map((v) => v.vaga_id as string);
}

async function montar(brutos: Bruto[]): Promise<CandidatoEmpreiteira[]> {
  // Eliminados na triagem não chegam à empreiteira (a não ser que a equipe
  // tenha liberado a ficha manualmente).
  const visiveis = brutos.filter((c) => c.classificacao !== "eliminado" || c.ficha_liberada);
  const ids = visiveis.map((c) => c.id);
  const entrevistas = new Map<string, { inicio: string; status: string }>();
  if (ids.length) {
    const { data } = await createAdminClient()
      .from("entrevistas_agendadas")
      .select("candidatura_id, inicio, status, created_at")
      .in("candidatura_id", ids)
      .order("created_at", { ascending: true });
    for (const e of data ?? []) entrevistas.set(e.candidatura_id as string, { inicio: e.inicio as string, status: e.status as string });
  }
  return visiveis.map((c) => {
    const entrevista = entrevistas.get(c.id) ?? null;
    return {
      id: c.id,
      nome: `${c.nome} ${c.sobrenome}`.trim(),
      vagaId: c.vaga_id,
      vagaTitulo: c.vaga_titulo,
      vagaEmpresa: c.vaga_empresa,
      coluna: colunaDe(c, entrevista),
      status: progressoCandidatura(c, entrevista?.status === "agendada" ? entrevista.inicio : null).label,
      dataEmbarque: c.data_embarque_prevista,
      criadoEm: c.created_at,
      linhaTempo: linhaTempoCandidatura(c, entrevista),
    };
  });
}

export async function candidatosDaEmpreiteira(parceiroId: string): Promise<CandidatoEmpreiteira[]> {
  const vagas = await vagasDaEmpreiteira(parceiroId);
  if (!vagas.length) return [];
  const { data, error } = await createAdminClient()
    .from("candidaturas_vagas")
    .select(CAMPOS)
    .in("vaga_id", vagas)
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) console.error("Erro ao carregar candidatos da empreiteira:", error);
  return montar((data ?? []) as Bruto[]);
}

export type DocumentoEmpreiteira = { chave: string; label: string };

/** Uma candidatura, só se for de vaga desta empreiteira. Inclui ficha e
 * lista de documentos (chaves opacas — o caminho real nunca vai ao navegador). */
export async function candidatoDaEmpreiteira(parceiroId: string, candidaturaId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(candidaturaId)) return null;
  const vagas = await vagasDaEmpreiteira(parceiroId);
  if (!vagas.length) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("candidaturas_vagas")
    .select(`${CAMPOS}, ficha, curriculo_path, curriculo_nome_arquivo`)
    .eq("id", candidaturaId)
    .in("vaga_id", vagas)
    .maybeSingle();
  if (!data) return null;
  const [base] = await montar([data as Bruto]);
  if (!base) return null;

  const arquivos = await arquivosDaCandidatura(data as Bruto & { curriculo_path: string | null; curriculo_nome_arquivo: string | null });
  return {
    ...base,
    ficha: (data as { ficha: unknown }).ficha,
    documentos: arquivos.map(({ chave, label }) => ({ chave, label })),
  };
}

type Arquivo = { chave: string; label: string; bucket: "curriculos-candidatos" | "fotos-candidatos"; path: string };

async function arquivosDaCandidatura(c: Bruto & { curriculo_path: string | null; curriculo_nome_arquivo: string | null }): Promise<Arquivo[]> {
  const respostas = (c.respostas ?? {}) as Record<string, { path?: string } | undefined>;
  const lista: Arquivo[] = [];
  if (c.curriculo_path) lista.push({ chave: "curriculo", label: `Currículo${c.curriculo_nome_arquivo ? ` (${c.curriculo_nome_arquivo})` : ""}`, bucket: "curriculos-candidatos", path: c.curriculo_path });
  if (respostas.certificadoJapones?.path) lista.push({ chave: "certificado", label: "Certificado de japonês", bucket: "curriculos-candidatos", path: respostas.certificadoJapones.path });
  if (respostas.certidaoAntecedentes?.path) lista.push({ chave: "certidao", label: "Certidão de antecedentes (PF)", bucket: "curriculos-candidatos", path: respostas.certidaoAntecedentes.path });
  if (c.foto_path) lista.push({ chave: "foto", label: "Foto", bucket: "fotos-candidatos", path: c.foto_path });

  const { data: anexos } = await createAdminClient()
    .storage.from("curriculos-candidatos")
    .list(PASTA_ANEXOS_EQUIPE, { search: `${c.id}__`, limit: 100, sortBy: { column: "created_at", order: "asc" } });
  for (const [i, a] of (anexos ?? []).entries()) {
    if (!a.name.startsWith(`${c.id}__`)) continue;
    const partes = a.name.split("__");
    const tipo = partes.length >= 4 ? TIPOS_DOCUMENTO_CANDIDATO.find((t) => t.key === partes[2]) : undefined;
    const nome = (tipo ? partes.slice(3) : partes.slice(2)).join("__") || a.name;
    lista.push({ chave: `anexo-${i}`, label: tipo ? `${tipo.label} — ${nome}` : nome, bucket: "curriculos-candidatos", path: `${PASTA_ANEXOS_EQUIPE}/${a.name}` });
  }
  return lista;
}

/** Resolve a chave do documento para bucket/caminho, conferindo a posse. */
export async function arquivoDaEmpreiteira(parceiroId: string, candidaturaId: string, chave: string) {
  if (!/^[0-9a-f-]{36}$/i.test(candidaturaId)) return null;
  const vagas = await vagasDaEmpreiteira(parceiroId);
  if (!vagas.length) return null;
  const { data } = await createAdminClient()
    .from("candidaturas_vagas")
    .select(`${CAMPOS}, curriculo_path, curriculo_nome_arquivo`)
    .eq("id", candidaturaId)
    .in("vaga_id", vagas)
    .maybeSingle();
  if (!data) return null;
  const c = data as Bruto & { curriculo_path: string | null; curriculo_nome_arquivo: string | null };
  if (c.classificacao === "eliminado" && !c.ficha_liberada) return null;
  return (await arquivosDaCandidatura(c)).find((a) => a.chave === chave) ?? null;
}
