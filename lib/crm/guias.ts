// Guia Turístico — cadastro dos guias da Ajisai (Wilson, 27/nov/2026,
// migração 044). Módulo puro: tipos e listas usados pelo painel /crm/guias,
// pelas actions e pelo campo "Guia Turístico" da oportunidade.

export type Guia = {
  id: string;
  nome: string;
  tipo: "brasileiro" | "local";
  idiomas: string[];
  cidades: string[];
  base_cidade: string | null;
  telefone: string | null;
  email: string | null;
  line_id: string | null;
  diaria_jpy: number | null;
  licenciado: boolean;
  ativo: boolean;
  observacoes: string | null;
  /** Miniatura circular (migração 045, bucket fotos-guias). */
  foto_url?: string | null;
  created_at: string;
  updated_at: string;
  updated_by_email: string | null;
};

export const TIPOS_GUIA = [
  { valor: "brasileiro", label: "Guia brasileiro", detalhe: "Português nativo" },
  { valor: "local", label: "Guia local", detalhe: "Japonês ou estrangeiro, inglês ou português limitado" },
] as const;
export const rotuloTipoGuia = (v: string) => TIPOS_GUIA.find((t) => t.valor === v)?.label ?? "Guia";

export const IDIOMAS_GUIA = ["Português", "Inglês", "Espanhol", "Japonês"] as const;
// Mesmas cidades da página /produtos/guia-turistico (app/lib/precoGuia.ts).
export const CIDADES_GUIA_CRM = ["Tóquio", "Kyoto", "Osaka", "Nara", "Hakone", "Fujikawaguchiko (Monte Fuji)"] as const;

export const formatarDiaria = (v: number | null) => (v == null ? "Diária a combinar" : `¥${Math.round(v).toLocaleString("pt-BR")}/dia`);

/** A oportunidade contrata guia? (produto secundário "guia") */
export const contrataGuia = (produtoSecundario: string[] | null | undefined) => (produtoSecundario ?? []).includes("guia");

/** Iniciais para o círculo quando o guia não tem foto. */
export const iniciaisGuia = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join("")
    .toUpperCase();
