// Catálogos integrados ao Ajisai Shopping — Wilson, 06/out/2026: "integrar
// alguns catálogos, https://www.909.co.jp/en/ — exemplo rolex, etc. top 10
// mais vendidos de cada categoria".
//
// Relógios: ranking de vendas da Quark (909.co.jp — "ROLEX Selling Rankings
// of Quark"), maior rede de lojas especializadas em Rolex do Japão, com lojas
// em Tóquio (Ueno, Ginza, Shinjuku, Nakano), Osaka (Umeda, Shinsaibashi),
// Kyoto e Kobe. Preços tax-free (sem o imposto de consumo de 10%) conforme o
// site em 06/out/2026 — mudam diariamente e dependem de estoque.
//
// Outras categorias: preencher `itens` quando o Wilson enviar os catálogos
// (lista vazia = categoria não aparece no catálogo da página).

export type ItemCatalogo = {
  marca: string;
  modelo: string;
  referencia: string;
  detalhe: string;
  precoJPY: number;
};

export type CatalogoCategoria = {
  categoria: string;
  loja: string;
  fonteUrl: string;
  atualizadoEm: string;
  observacao: string;
  itens: ItemCatalogo[];
};

export const CATALOGOS_AJISAI_SHOPPING: CatalogoCategoria[] = [
  {
    categoria: "Relógios",
    loja: "Quark — lojas especializadas Rolex (Tóquio, Osaka, Kyoto e Kobe)",
    fonteUrl: "https://www.909.co.jp/en/",
    atualizadoEm: "06/10/2026",
    observacao: "Top 10 mais vendidos da Quark. Preço tax-free, sujeito a estoque e a alteração diária.",
    itens: [
      { marca: "Rolex", modelo: "Submariner", referencia: "126610LN", detalhe: "Mostrador preto", precoJPY: 2436364 },
      { marca: "Rolex", modelo: "Submariner", referencia: "126610LV", detalhe: "Luneta verde", precoJPY: 2536364 },
      { marca: "Rolex", modelo: "GMT-Master II", referencia: "126711CHNR", detalhe: "Luneta marrom/preta", precoJPY: 3609091 },
      { marca: "Rolex", modelo: "Submariner", referencia: "124060", detalhe: "Mostrador preto, sem data", precoJPY: 2181819 },
      { marca: "Rolex", modelo: "Submariner", referencia: "126613LB", detalhe: "Mostrador azul, aço e ouro", precoJPY: 3336364 },
      { marca: "Rolex", modelo: "Submariner", referencia: "126613LN", detalhe: "Mostrador preto, aço e ouro", precoJPY: 3381819 },
      { marca: "Rolex", modelo: "Lady-Datejust", referencia: "279174G", detalhe: "Mostrador rosa com 10 diamantes", precoJPY: 2309091 },
      { marca: "Rolex", modelo: "Sea-Dweller", referencia: "126600", detalhe: "Mostrador preto", precoJPY: 2309091 },
      { marca: "Rolex", modelo: "Sea-Dweller", referencia: "126603", detalhe: "Mostrador preto, aço e ouro", precoJPY: 3472728 },
      { marca: "Rolex", modelo: "Explorer II", referencia: "226570", detalhe: "Mostrador preto", precoJPY: 1945455 },
    ],
  },
];

export const chaveItemCatalogo = (i: ItemCatalogo) => `${i.marca} ${i.modelo} ${i.referencia}`;
