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
