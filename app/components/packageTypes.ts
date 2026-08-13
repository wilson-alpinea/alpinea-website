export type PackageVariant = {
  id: string;
  /** Ex: "7 dias" */
  label: string;
  /** Datas de referência da variante, ex: "28 mar – 03 abr 2027" */
  datas: string;
  /** Texto de preço em reais — usado como fallback antes da cotação do dia carregar. */
  precoLabel: string;
  parcelaLabel?: string;
  /** Valor bruto em reais — quando presente, o preço exibido é convertido pra dólar com a cotação do dia (ver PrecoPacote). */
  precoBRL?: number;
};
