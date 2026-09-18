import { IconMap, IconDocument, IconCheck } from "@/app/components/AirportGuideKit";
import type { TipoArquivo } from "@/lib/crm/arquivos";

// roteiro_final reaproveita o ícone do roteiro_draft (IconMap) — os dois
// são a mesma "família" de arquivo (o roteiro personalizado), só que em
// estágios diferentes; o rótulo (TIPO_ARQUIVO_LABEL) já deixa claro qual é
// qual. Pedido do Wilson, 18/set/2026: ver comentário em lib/crm/arquivos.ts.
export const ARQUIVO_ICONS: Record<TipoArquivo, (props: { className?: string }) => React.JSX.Element> = {
  roteiro_draft: IconMap,
  roteiro_final: IconMap,
  proposta: IconDocument,
  contrato: IconCheck,
  outro: IconDocument,
};
