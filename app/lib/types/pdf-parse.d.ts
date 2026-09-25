// Declaração mínima do módulo "pdf-parse" — o pacote não publica tipos
// próprios (nem há @types/pdf-parse). Usado só em
// app/lib/curriculoExtracao.ts (extração de texto do currículo em PDF).
declare module "pdf-parse" {
  export interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }

  export default function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>,
  ): Promise<PDFParseResult>;
}
