export type TipoArquivo = "roteiro_draft" | "proposta" | "contrato" | "outro";

export const TIPOS_ARQUIVO: { valor: TipoArquivo; label: string }[] = [
  { valor: "roteiro_draft", label: "Roteiro Personalizado (Draft)" },
  { valor: "proposta", label: "Proposta" },
  { valor: "contrato", label: "Contrato" },
  { valor: "outro", label: "Outro" },
];

export const TIPO_ARQUIVO_LABEL: Record<TipoArquivo, string> = TIPOS_ARQUIVO.reduce(
  (acc, t) => ({ ...acc, [t.valor]: t.label }),
  {} as Record<TipoArquivo, string>,
);

export function isTipoArquivo(valor: string): valor is TipoArquivo {
  return TIPOS_ARQUIVO.some((t) => t.valor === valor);
}

export type ArquivoCliente = {
  id: string;
  cliente_id: string;
  tipo: TipoArquivo;
  label: string;
  url: string;
  created_at: string;
};
