export type CategoriaFornecedor =
  | "hotel"
  | "transporte"
  | "guia"
  | "restaurante"
  | "passeio_atracao"
  | "seguro_viagem"
  | "cambio"
  | "outro";

export const CATEGORIAS_FORNECEDOR: { valor: CategoriaFornecedor; label: string }[] = [
  { valor: "hotel", label: "Hotel" },
  { valor: "transporte", label: "Transporte" },
  { valor: "guia", label: "Guia" },
  { valor: "restaurante", label: "Restaurante" },
  { valor: "passeio_atracao", label: "Passeio / Atração" },
  { valor: "seguro_viagem", label: "Seguro Viagem" },
  { valor: "cambio", label: "Câmbio" },
  { valor: "outro", label: "Outro" },
];

export const CATEGORIA_FORNECEDOR_LABEL: Record<CategoriaFornecedor, string> =
  CATEGORIAS_FORNECEDOR.reduce(
    (acc, c) => ({ ...acc, [c.valor]: c.label }),
    {} as Record<CategoriaFornecedor, string>,
  );

export function isCategoriaFornecedor(valor: string): valor is CategoriaFornecedor {
  return CATEGORIAS_FORNECEDOR.some((c) => c.valor === valor);
}

// Cores por categoria (redesenho de Fornecedores, 23/out/2026). Só as
// categorias que correspondem à tabela aprovada ganham cor própria; as
// demais usam um tom neutro — nenhuma categoria é agrupada com outra.
export const COR_CATEGORIA_FORNECEDOR: Record<CategoriaFornecedor | "sem_categoria", { fundo: string; cor: string }> = {
  transporte: { fundo: "#F2F6FC", cor: "#24476B" },
  guia: { fundo: "#F0F7F5", cor: "#28665D" },
  hotel: { fundo: "#FAF7F1", cor: "#786343" },
  outro: { fundo: "#F5F3FA", cor: "#665582" },
  restaurante: { fundo: "#F5F6F7", cor: "#59636F" },
  passeio_atracao: { fundo: "#F5F6F7", cor: "#59636F" },
  seguro_viagem: { fundo: "#F5F6F7", cor: "#59636F" },
  cambio: { fundo: "#F5F6F7", cor: "#59636F" },
  sem_categoria: { fundo: "#F5F6F7", cor: "#59636F" },
};
