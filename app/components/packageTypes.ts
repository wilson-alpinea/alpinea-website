export type PackageVariant = {
  id: string;
  /** Ex: "7 dias" */
  label: string;
  /** Datas de referência da variante, ex: "28 mar – 03 abr 2027" */
  datas: string;
  precoLabel: string;
  parcelaLabel?: string;
};
