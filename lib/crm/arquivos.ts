export type TipoArquivo = "roteiro_draft" | "roteiro_final" | "proposta" | "contrato" | "outro";

// Pedido do Wilson, 18/set/2026: "preciso de um campo para adicionar o link
// do roteiro" — ao testar, o link que ele tinha era da entrega final do
// Roteiro Personalizado, não do draft ("isso não é um draft, é a entrega
// final"). O formulário de Arquivos (em app/crm/(shell)/clientes/[id]/
// page.tsx) já aceitava um link de tipo "Roteiro Personalizado (Draft)",
// mas não tinha opção equivalente pra versão final — adicionado
// "roteiro_final" como um tipo à parte (não substitui o draft: alguns
// clientes têm as duas versões registradas, uma por cima da outra).
// Requer a migration supabase/migrations/007_arquivos_tipo_final.sql (o
// check constraint do banco também precisa aceitar o novo valor).
export const TIPOS_ARQUIVO: { valor: TipoArquivo; label: string }[] = [
  { valor: "roteiro_draft", label: "Roteiro Personalizado (Draft)" },
  { valor: "roteiro_final", label: "Roteiro Personalizado (Final)" },
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
