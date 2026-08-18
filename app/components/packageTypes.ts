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
  /** Preço já fixado em dólar — usado pelos pacotes Sakura (valores definidos diretamente em USD, não dependem da cotação do dia). Tem prioridade sobre precoBRL. */
  precoUSD?: number;
  /** Preço da versão Personalizada do mesmo roteiro (Individual × 1.5) — exibido como opção adicional abaixo do preço principal. */
  personalizadoUSD?: number;
};
