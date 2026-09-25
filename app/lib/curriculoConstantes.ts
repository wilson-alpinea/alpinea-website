// Constantes de tipos de arquivo de currículo aceitos — separadas de
// app/lib/curriculoExtracao.ts pra um arquivo próprio sem nenhuma
// dependência de pdf-parse/mammoth (que só existem em servidor).
//
// Corrige erro de build no Vercel, 25/set/2026: "Module not found: Can't
// resolve 'fs'" em pdf-parse — app/empregos/page.tsx é Client Component e
// importava EXTENSOES_CURRICULO_ACEITAS direto de curriculoExtracao.ts,
// que arrasta pdf-parse (Node-only, usa `fs`/`http`/`https`) pro bundle
// do navegador via Turbopack, quebrando o build inteiro.
export const TIPOS_CURRICULO_ACEITOS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const EXTENSOES_CURRICULO_ACEITAS = ".pdf,.docx";
