import { IconMap, IconDocument, IconCheck } from "@/app/components/AirportGuideKit";
import type { TipoArquivo } from "@/lib/crm/arquivos";

export const ARQUIVO_ICONS: Record<TipoArquivo, (props: { className?: string }) => React.JSX.Element> = {
  roteiro_draft: IconMap,
  proposta: IconDocument,
  contrato: IconCheck,
  outro: IconDocument,
};
