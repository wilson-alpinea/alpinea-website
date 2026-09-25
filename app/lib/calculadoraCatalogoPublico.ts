import {
  PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX,
  PRECO_INGRESSO_DISNEYSEA_USD_PAX,
  PRECO_INGRESSO_USJ_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_4_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_5_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_7_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_8_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX,
  DESTINOS,
  comMargemEImposto,
} from "../components/CustomPackageCard";

// Catálogo da calculadora voltada ao cliente (/viagem_personalizada_selfservice).
// Espelha o da Calculadora Reversa interna, mas SÓ com o que pode aparecer
// pro cliente: preços finais de venda, sem comissões, margens, notas
// internas ou detalhamento de fornecedor.

export type IngressoKey = "disneyland" | "disneysea" | "usj" | "teamlabTokyo" | "teamlabKyoto";

export const INGRESSOS_PUBLICOS: { key: IngressoKey; nome: string; precoUSD: number; icone: string }[] = [
  { key: "disneyland", nome: "Disneyland Tokyo", precoUSD: PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX, icone: "/images/ingressos/disneyland-logo.png" },
  { key: "disneysea", nome: "DisneySea Tokyo", precoUSD: PRECO_INGRESSO_DISNEYSEA_USD_PAX, icone: "/images/ingressos/disneysea-logo.png" },
  { key: "usj", nome: "Universal Studios Japan", precoUSD: PRECO_INGRESSO_USJ_USD_PAX, icone: "/images/ingressos/usj-logo.png" },
  { key: "teamlabTokyo", nome: "teamLab Tokyo", precoUSD: PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX, icone: "/images/ingressos/teamlab-logo.png" },
  { key: "teamlabKyoto", nome: "teamLab Kyoto", precoUSD: PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX, icone: "/images/ingressos/teamlab-logo.png" },
];

export type UsjTierKey = "nenhum" | "4" | "5" | "7" | "8" | "premium";

export const USJ_EXPRESS_PASS_PUBLICO: { key: UsjTierKey; label: string; precoUSD: number }[] = [
  { key: "nenhum", label: "Sem Express Pass", precoUSD: 0 },
  { key: "4", label: "Express 4", precoUSD: PRECO_EXPRESS_PASS_USJ_4_USD_PAX },
  { key: "5", label: "Express 5", precoUSD: PRECO_EXPRESS_PASS_USJ_5_USD_PAX },
  { key: "7", label: "Express 7", precoUSD: PRECO_EXPRESS_PASS_USJ_7_USD_PAX },
  { key: "8", label: "Express 8", precoUSD: PRECO_EXPRESS_PASS_USJ_8_USD_PAX },
  { key: "premium", label: "Premium", precoUSD: PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX },
];

export type ServicoKey =
  | "malasIntermunicipal"
  | "cambioBrasil"
  | "restaurantesHighEnd"
  | "transferOnibus"
  | "reservaRestaurante"
  | "experienciaSobMedida"
  | "concierge"
  | "ajisaiShopping";

// `sobConsulta`: sem preço automático na calculadora do cliente — o
// interesse é registrado no lead e a equipe cota depois (Câmbio depende de
// quantidade de ienes; Ajisai Shopping depende do valor das compras).
export const SERVICOS_PUBLICOS: { key: ServicoKey; nome: string; icone: string; sobConsulta?: boolean }[] = [
  { key: "malasIntermunicipal", nome: "Transporte de Malas Inter-Municipal", icone: "/images/icone-servico-malas-intermunicipal.png" },
  { key: "cambioBrasil", nome: "Câmbio no Brasil", icone: "/images/icone-servico-cambio-brasil.png" },
  { key: "restaurantesHighEnd", nome: "Reserva de Restaurantes High-End", icone: "/images/icone-servico-restaurantes-highend.png" },
  { key: "transferOnibus", nome: "Transfer de Ônibus (Limousine Bus)", icone: "/images/icone-servico-transfer-onibus.png" },
  { key: "reservaRestaurante", nome: "Reserva de Restaurante", icone: "/images/icone-servico-reserva-restaurante.png" },
  { key: "experienciaSobMedida", nome: "Experiência Sob Medida", icone: "/images/icone-servico-experiencia-sob-medida.png" },
  { key: "concierge", nome: "Concierge Dedicado", icone: "/images/icone-servico-concierge.png" },
  { key: "ajisaiShopping", nome: "Ajisai Shopping", icone: "/images/icone-servico-ajisai-shopping.png", sobConsulta: true },
];

// Seguro viagem por faixa etária (mesma tabela da Calculadora Reversa).
export const IDADE_LIMITE_SEGURO = 82;
const FAIXAS_SEGURO_IDADE: { idadeMax: number; multiplicador: number }[] = [
  { idadeMax: 60, multiplicador: 1 },
  { idadeMax: 65, multiplicador: 2 },
  { idadeMax: 70, multiplicador: 2.5 },
  { idadeMax: 75, multiplicador: 3 },
  { idadeMax: 80, multiplicador: 4 },
  { idadeMax: IDADE_LIMITE_SEGURO, multiplicador: 5 },
];
export function multiplicadorSeguroPorIdade(idade: number): number | null {
  if (idade > IDADE_LIMITE_SEGURO) return null;
  return FAIXAS_SEGURO_IDADE.find((f) => idade <= f.idadeMax)?.multiplicador ?? null;
}

// ---- Fase 2: temporada, origem do voo e bagagem (mesmos dados da Calculadora Reversa) ----
export type TemporadaKey = "sakura" | "primavera" | "julho" | "outono" | "inverno" | "baixa";

export const TEMPORADAS: { key: TemporadaKey; nome: string; periodo: string; icone: string }[] = [
  {
    key: "sakura",
    nome: "Sakura (Cerejeiras)",
    periodo: "final de mar. a início de abr.",
    icone: "/images/temporada/01-primavera.png",
  },
  {
    key: "primavera",
    nome: "Primavera",
    periodo: "meados de abr. a fim de mai.",
    icone: "/images/temporada/05-primavera.png",
  },
  {
    key: "julho",
    nome: "Férias Escolares (Julho)",
    periodo: "julho",
    icone: "/images/temporada/02-julho.png",
  },
  {
    key: "outono",
    nome: "Outono",
    periodo: "meados de out. a meados de nov.",
    icone: "/images/temporada/03-outono.png",
  },
  {
    key: "inverno",
    nome: "Inverno",
    periodo: "dez. a fev.",
    icone: "/images/temporada/06-inverno.png",
  },
  {
    key: "baixa",
    nome: "Fora de alta temporada",
    periodo: "restante do ano",
    icone: "/images/temporada/04-baixa.png",
  },
];

export const TEMPORADA_MULTIPLICADOR_HOTEL: Partial<Record<string, Record<TemporadaKey, number>>> = {
  tokyo: { sakura: 1.45, primavera: 1.35, julho: 1.1, outono: 1.3, inverno: 1.1, baixa: 1.0 },
  yokohama: { sakura: 1.25, primavera: 1.2, julho: 1.05, outono: 1.15, inverno: 1.05, baixa: 1.0 },
  kyoto: { sakura: 1.85, primavera: 1.6, julho: 1.15, outono: 1.75, inverno: 1.15, baixa: 1.0 },
  osaka: { sakura: 1.4, primavera: 1.3, julho: 1.1, outono: 1.2, inverno: 1.05, baixa: 1.0 },
  nagoya: { sakura: 1.1, primavera: 1.1, julho: 1.05, outono: 1.12, inverno: 1.0, baixa: 1.0 },
  kobe: { sakura: 1.08, primavera: 1.08, julho: 1.05, outono: 1.1, inverno: 1.0, baixa: 1.0 },
  hiroshima: { sakura: 1.15, primavera: 1.15, julho: 1.1, outono: 1.2, inverno: 1.0, baixa: 1.0 },
  fukuoka: { sakura: 1.12, primavera: 1.15, julho: 1.1, outono: 1.12, inverno: 1.0, baixa: 1.0 },
  hokkaido: { sakura: 1.12, primavera: 1.2, julho: 1.15, outono: 1.05, inverno: 1.55, baixa: 1.0 },
  okinawa: { sakura: 1.1, primavera: 1.35, julho: 1.4, outono: 1.03, inverno: 0.85, baixa: 1.0 },
  niseko: { sakura: 0.85, primavera: 0.85, julho: 1.08, outono: 1.1, inverno: 2.8, baixa: 1.0 },
};

export const MESES_NOME = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const MES_PARA_TEMPORADA: Record<number, TemporadaKey> = {
  1: "inverno",
  2: "inverno",
  3: "sakura",
  4: "sakura",
  5: "primavera",
  6: "baixa",
  7: "julho",
  8: "baixa",
  9: "baixa",
  10: "outono",
  11: "outono",
  12: "inverno",
};

export const ORIGENS_VOO = [
  { key: "saoPaulo", nome: "São Paulo / GRU", ajusteBRL: 0 },
  { key: "rio", nome: "Rio de Janeiro / GIG", ajusteBRL: 2000 },
  { key: "belem", nome: "Belém / BEL", ajusteBRL: 3500 },
  { key: "beloHorizonte", nome: "Belo Horizonte / CNF", ajusteBRL: 2000 },
  { key: "brasilia", nome: "Brasília / BSB", ajusteBRL: 2000 },
  { key: "campoGrande", nome: "Campo Grande / CGR", ajusteBRL: 2000 },
  { key: "cuiaba", nome: "Cuiabá / CGB", ajusteBRL: 2000 },
  { key: "curitiba", nome: "Curitiba / CWB", ajusteBRL: 2000 },
  { key: "fozDoIguacu", nome: "Foz do Iguaçu / IGU", ajusteBRL: 3000 },
  { key: "goiania", nome: "Goiânia / GYN", ajusteBRL: 2000 },
  { key: "londrina", nome: "Londrina / LDB", ajusteBRL: 2000 },
  { key: "manaus", nome: "Manaus / MAO", ajusteBRL: 4000 },
  { key: "maringa", nome: "Maringá / MGF", ajusteBRL: 2000 },
  { key: "portoAlegre", nome: "Porto Alegre / POA", ajusteBRL: 2000 },
  { key: "salvador", nome: "Salvador / SSA", ajusteBRL: 2000 },
  { key: "outra", nome: "Outra cidade", ajusteBRL: 2000 },
] as const;
export type OrigemVooKey = (typeof ORIGENS_VOO)[number]["key"];

export const BAGAGEM_OPCOES = [
  { key: "cabine", nome: "Somente bagagem de mão", ajusteBRL: 0 },
  { key: "uma", nome: "1 mala despachada", ajusteBRL: 0 },
  { key: "duas", nome: "2 malas despachadas", ajusteBRL: 400 },
  { key: "grande", nome: "2 malas + item grande/especial", ajusteBRL: 750 },
] as const;
export type BagagemKey = (typeof BAGAGEM_OPCOES)[number]["key"];

// ---- Fase 3: temas, extensão internacional, câmbio de ienes ----
// Removido de propósito (só existe na Calculadora Reversa interna):
// avisos de dificuldade de ingresso por circuito e observações internas de roteiro.
type DestinoKey = (typeof DESTINOS)[number]["key"];

export type TemaKey =
  | "roteiroClassico"
  | "automobilismo"
  | "gastronomia"
  | "animeGames"
  | "japaoTradicional"
  | "naturezaPaisagens"
  | "onsenRyokan"
  | "luxoCompras"
  | "esportesEventos"
  | "parquesEntretenimento"
  | "neveInverno";

type TemaCidade = {
  key: DestinoKey;
  destaque: string;
  padrao: boolean;
};

export const MAX_TEMAS_SIMULTANEOS = 3;
export const MAX_CIDADES_ROTEIRO = 5;
export const CAMBIO_IENES_MINIMO = 100000;
// Fator interno de conversão usado no preço final do câmbio — não exibido.
export const FATOR_CAMBIO_IENE = 1.15;

// Câmbio de ienes — página pública /produtos (self-checkout). Pedido do
// Wilson, 25/set/2026: "desenvolver um algoritmo que baseado na escolha da
// cidade da pessoa, o sistema faz uma busca em tempo real em sites como
// melhores câmbios, etc e adicionar uma margem de 20% sobre o valor e já
// deixa o pedido pronto para checkout [...] deixar disponivel tanto compra
// quanto venda de iene". Confirmado com o Wilson via AskUserQuestion,
// 25/set/2026: essa margem de 20% é EXCLUSIVA dessa página pública — não
// mexe no SPREAD_CAMBIO_IENE (1,15) usado internamente na Calculadora
// Reversa, que continua servindo só a equipe (nem no FATOR_CAMBIO_IENE
// acima, que também é só uso interno).
//
// Compra (cliente compra ienes da Ajisai): cotação de rua "compra" do
// melhorcambio.com × 1,20 — cliente paga 20% a mais que a cotação de rua.
// Venda (cliente vende ienes de volta pra Ajisai): cotação de rua "venda"
// do melhorcambio.com × 0,80 — cliente recebe 20% a menos que a cotação de
// rua. A Ajisai fica com a margem nos dois sentidos, sem revelar isso na
// página (mesma regra já aplicada ao JR Pass e Seguro Viagem: nunca expor
// margem/fornecedor em texto público).
export const SPREAD_CAMBIO_IENE_PUBLICO_COMPRA = 1.2;
export const SPREAD_CAMBIO_IENE_PUBLICO_VENDA = 0.8;

// Dólar turismo — página de JR Pass (self-checkout). Pedido do Wilson,
// 25/set/2026: "na pagina de JR Pass, nós vamos usar o valor de dólar
// turismo" (em vez do PTAX, usado no resto do site) + "adicionar spread
// cambial também" — confirmado via AskUserQuestion: 20%, mesmo spread
// já usado acima pro câmbio de ienes (mesma regra de nunca expor
// margem/fornecedor em texto público). Cotação de base vem de
// app/lib/cambioDolarTurismo.ts (melhorcambio.com, papel-moeda) — só o
// JR Pass usa esse spread por enquanto.
export const SPREAD_DOLAR_TURISMO_PUBLICO = 1.2;

// Mesmo mínimo já usado na Calculadora Reversa (CAMBIO_IENES_MINIMO acima)
// — reexportado com nome mais específico só pra deixar claro, no
// /produtos, que é o mesmo piso, não um novo valor.
export const CAMBIO_IENES_MINIMO_PUBLICO = CAMBIO_IENES_MINIMO;

// Moedas de transação aceitas no self-checkout de Câmbio — pedido do
// Wilson, 25/set/2026: "deixar pelo menos 3 moedas disponiveis para
// transação Real, Euro e Dolar". JPY não entra aqui de propósito — é a
// moeda sendo comprada/vendida, não uma forma de pagamento. Ícones
// enviados pelo Wilson no mesmo pedido.
export type MoedaTransacaoCambio = "BRL" | "EUR" | "USD";

export const MOEDAS_TRANSACAO_CAMBIO: { key: MoedaTransacaoCambio; nome: string; icone: string }[] = [
  { key: "BRL", nome: "Real", icone: "/images/icone-moeda-real.png" },
  { key: "EUR", nome: "Euro", icone: "/images/icone-moeda-euro.png" },
  { key: "USD", nome: "Dólar", icone: "/images/icone-moeda-dolar.png" },
];

export const TEMAS: { key: TemaKey; nome: string; icone: string; cidades: TemaCidade[] }[] = [
  {
    key: "roteiroClassico",
    nome: "Roteiro Clássico (Recomendado)",
    icone: "/images/temas/00-roteiro-classico.png",
    cidades: [
      { key: "tokyo", destaque: "Capital e porta de entrada do Japão — base clássica de qualquer primeira viagem", padrao: true },
      { key: "osaka", destaque: "Gastronomia informal, Dotonbori e proximidade com Kyoto", padrao: true },
      { key: "kyoto", destaque: "Templos, tradição e cultura japonesa clássica", padrao: true },
      { key: "fuji", destaque: "Vista do Monte Fuji — entra automaticamente em roteiros de mais de 10 dias", padrao: false },
      { key: "hakone", destaque: "Onsen e vistas do Fuji a caminho de Tokyo — entra automaticamente em roteiros de mais de 10 dias", padrao: false },
    ],
  },
  {
    key: "automobilismo",
    nome: "Automobilismo",
    icone: "/images/temas/02-automobilismo.png",
    cidades: [
      { key: "tokyo", destaque: "Cultura JDM e encontros automotivos — A PIT Autobacs · Nissan Crossing · Daikoku PA", padrao: true },
      { key: "fuji", destaque: "Circuito e história do automobilismo — Fuji Speedway · Fuji Motorsports Museum", padrao: true },
      { key: "nagoya", destaque: "História da indústria automobilística japonesa — Toyota Automobile Museum · Toyota Commemorative Museum", padrao: true },
      { key: "motegi", destaque: "Honda e motorsports — Honda Collection Hall · Mobility Resort Motegi", padrao: false },
      { key: "suzuka", destaque: "Um dos circuitos mais emblemáticos do Japão — Suzuka Circuit", padrao: false },
    ],
  },
  {
    key: "gastronomia",
    nome: "Gastronomia",
    icone: "/images/temas/03-gastronomia.png",
    cidades: [
      { key: "tokyo", destaque: "Omakase, sushi, yakiniku, alta gastronomia e enorme variedade regional japonesa", padrao: true },
      { key: "kyoto", destaque: "Kaiseki, cozinha Kyo-ryori, chá, tofu e restaurantes tradicionais", padrao: true },
      { key: "osaka", destaque: "Cultura gastronômica mais informal — Dotonbori, takoyaki, okonomiyaki, kushikatsu e mercados", padrao: true },
    ],
  },
  {
    key: "animeGames",
    nome: "Anime, Games & Cultura Pop",
    icone: "/images/temas/04-anime-games-cultura-pop.png",
    cidades: [
      { key: "tokyo", destaque: "Akihabara, Ikebukuro, Nakano Broadway, Pokémon Centers e lojas especializadas", padrao: true },
      { key: "osaka", destaque: "Den Den Town, Nipponbashi e cultura pop concentrada em Namba", padrao: true },
      { key: "nagoya", destaque: "Ghibli Park e grandes lojas de anime/games", padrao: false },
      { key: "kyoto", destaque: "Nintendo Museum e Kyoto International Manga Museum", padrao: false },
    ],
  },
  {
    key: "japaoTradicional",
    nome: "Japão Tradicional",
    icone: "/images/temas/05-japao-tradicional.png",
    cidades: [
      { key: "kyoto", destaque: "Templos, jardins, Gion, cerimônia do chá e arquitetura histórica", padrao: true },
      { key: "nara", destaque: "Tōdai-ji, Kasuga Taisha, parque e patrimônio do período clássico japonês", padrao: true },
      { key: "kanazawa", destaque: "Kenroku-en, bairros de gueixas e samurais, artesanato tradicional", padrao: false },
      { key: "takayama", destaque: "Centro histórico, casas tradicionais e cultura de Hida", padrao: false },
      { key: "koyasan", destaque: "Complexo monástico, Okunoin e hospedagem em templo", padrao: false },
    ],
  },
  {
    key: "naturezaPaisagens",
    nome: "Natureza & Paisagens",
    icone: "/images/temas/06-natureza-paisagens.png",
    cidades: [
      { key: "fuji", destaque: "Vistas do Monte Fuji, Chureito, Lago Kawaguchi e Oishi Park", padrao: true },
      { key: "hakone", destaque: "Lago Ashi, Owakudani e paisagem montanhosa", padrao: true },
      { key: "nikko", destaque: "Florestas, montanhas, lago Chuzenji e Kegon Falls", padrao: false },
      { key: "kamikochi", destaque: "Alpes Japoneses, trilhas e paisagens de montanha", padrao: false },
    ],
  },
  {
    key: "onsenRyokan",
    nome: "Onsen & Ryokan",
    icone: "/images/temas/07-onsen-ryokan.png",
    cidades: [
      { key: "hakone", destaque: "Grande variedade de ryokans premium e onsen privados perto de Tokyo", padrao: true },
      { key: "kinosaki", destaque: "Cidade termal tradicional com circuito de sete banhos públicos", padrao: false },
      { key: "kusatsu", destaque: "Uma das águas termais mais famosas do Japão e o Yubatake", padrao: false },
      { key: "fuji", destaque: "Ryokans e onsen com vistas para o Monte Fuji", padrao: false },
    ],
  },
  {
    key: "luxoCompras",
    nome: "Luxo & Compras",
    icone: "/images/temas/08-luxo-compras.png",
    cidades: [
      { key: "tokyo", destaque: "Ginza, Omotesando, Aoyama e departamentos de luxo; moda, relojoaria e design japonês", padrao: true },
      { key: "kyoto", destaque: "Artesanato, cerâmica, quimonos, chá e produtos tradicionais de alto padrão", padrao: true },
      { key: "osaka", destaque: "Shinsaibashi, Umeda e grandes lojas de luxo e departamentos", padrao: true },
    ],
  },
  {
    key: "esportesEventos",
    nome: "Esportes & Eventos",
    icone: "/images/temas/09-esportes-eventos.png",
    cidades: [
      { key: "tokyo", destaque: "Sumô, baseball, futebol e grandes eventos em arenas e estádios", padrao: true },
      { key: "osaka", destaque: "Baseball, futebol e eventos esportivos de grande porte", padrao: false },
      { key: "nagoya", destaque: "Sumô, baseball e eventos no eixo Aichi/Nagoya", padrao: false },
    ],
  },
  {
    key: "parquesEntretenimento",
    nome: "Parques & Entretenimento",
    icone: "/images/temas/10-parques-entretenimento.png",
    cidades: [
      { key: "tokyo", destaque: "Tokyo Disneyland, Tokyo DisneySea e experiências de entretenimento imersivo", padrao: true },
      { key: "osaka", destaque: "Universal Studios Japan e Super Nintendo World", padrao: true },
      { key: "nagoya", destaque: "Ghibli Park", padrao: true },
    ],
  },
  {
    key: "neveInverno",
    nome: "Neve & Inverno",
    icone: "/images/temas/11-neve-inverno.png",
    cidades: [
      { key: "niseko", destaque: "Powder snow, resorts internacionais, ski e hotéis premium", padrao: true },
      { key: "hakuba", destaque: "Grande área esquiável nos Alpes Japoneses, fácil combinação com Tokyo", padrao: false },
      { key: "nozawa", destaque: "Ski combinado com vila tradicional e cultura de onsen", padrao: false },
    ],
  },
];

export type ExtensaoInternacionalKey = "coreiaDoSul" | "china";
export type ExtensaoCidadeKey = "seoul" | "beijing" | "shanghai";
export const CATEGORIAS_HOTEL_EXTENSAO = ["3 estrelas", "4 estrelas", "5 estrelas"] as const;
export type CategoriaHotelExtensao = (typeof CATEGORIAS_HOTEL_EXTENSAO)[number];
export type DiaRoteiroExtensao = {
  cidade: string;
  dia: number;
  titulo: string;
  imagem: string | null;
  posicaoImagem?: string;
  pontos: string[];
  conceito: string;
};
export type TrechoDeslocamentoExtensao = { label: string; precoUSDPax: number };

const PRECO_VOO_TOQUIO_SEOUL_USD_PAX = comMargemEImposto(210);
const PRECO_VOO_TOQUIO_PEQUIM_USD_PAX = comMargemEImposto(280);
const PRECO_TREM_PEQUIM_XANGAI_USD_PAX = comMargemEImposto(85);

export const DIARIA_HOTEL_EXTENSAO_USD: Record<ExtensaoCidadeKey, Record<CategoriaHotelExtensao, number>> = {
  seoul: {
    "3 estrelas": comMargemEImposto(75),
    "4 estrelas": comMargemEImposto(350),
    "5 estrelas": comMargemEImposto(600),
  },
  beijing: {
    "3 estrelas": comMargemEImposto(65),
    "4 estrelas": comMargemEImposto(170),
    "5 estrelas": comMargemEImposto(600),
  },
  shanghai: {
    "3 estrelas": comMargemEImposto(70),
    "4 estrelas": comMargemEImposto(150),
    "5 estrelas": comMargemEImposto(380),
  },
};

export const EXTENSOES_INTERNACIONAIS: {
  key: ExtensaoInternacionalKey;
  nome: string;
  icone: string;
  dias: number;
  cidades: { key: ExtensaoCidadeKey; nome: string; dias: number }[];
  deslocamento: TrechoDeslocamentoExtensao[];
  roteiro: DiaRoteiroExtensao[];
}[] = [
  {
    key: "coreiaDoSul",
    nome: "Coréia do Sul",
    icone: "/images/paises/coreia-do-sul.png",
    dias: 3,
    cidades: [{ key: "seoul", nome: "Seoul", dias: 3 }],
    deslocamento: [{ label: "Voo Tóquio → Seoul (econômica)", precoUSDPax: PRECO_VOO_TOQUIO_SEOUL_USD_PAX }],
    roteiro: [
      {
        cidade: "Seoul",
        dia: 1,
        titulo: "Seoul Histórica",
        imagem: "/images/paises/roteiro/seoul-dia1-gyeongbokgung.jpg",
        pontos: [
          "Gwanghwamun Square",
          "Gyeongbokgung Palace",
          "Bukchon Hanok Village",
          "Insadong",
          "Ikseon-dong",
          "Gwangjang Market",
          "Cheonggyecheon",
        ],
        conceito: "Palácios, arquitetura tradicional coreana, bairros históricos e gastronomia local.",
      },
      {
        cidade: "Seoul",
        dia: 2,
        titulo: "Centro + Skyline",
        imagem: "/images/paises/roteiro/seoul-dia2-nseoultower.jpg",
        posicaoImagem: "center 35%",
        pontos: ["Namdaemun Market", "Myeongdong", "Namsan Park", "N Seoul Tower", "Itaewon ou Euljiro à noite"],
        conceito: "Centro de Seoul, mercados, vida urbana e uma das melhores vistas panorâmicas da cidade.",
      },
      {
        cidade: "Seoul",
        dia: 3,
        titulo: "Seoul Moderna",
        imagem: "/images/paises/roteiro/seoul-dia3-starfield.jpg",
        posicaoImagem: "center 10%",
        pontos: ["Bongeunsa Temple", "COEX", "Starfield Library", "Gangnam", "Seongsu-dong", "Seoul Forest", "Han River"],
        conceito: "O contraste entre templos tradicionais e a Seoul contemporânea, criativa e tecnológica.",
      },
    ],
  },
  {
    key: "china",
    nome: "China",
    icone: "/images/paises/china.png",
    dias: 4,
    cidades: [
      { key: "beijing", nome: "Beijing", dias: 2 },
      { key: "shanghai", nome: "Shanghai", dias: 2 },
    ],
    deslocamento: [
      { label: "Voo Tóquio → Pequim (econômica)", precoUSDPax: PRECO_VOO_TOQUIO_PEQUIM_USD_PAX },
      { label: "Trem-bala Pequim → Xangai (2ª classe)", precoUSDPax: PRECO_TREM_PEQUIM_XANGAI_USD_PAX },
    ],
    roteiro: [
      {
        cidade: "Beijing",
        dia: 1,
        titulo: "China Imperial",
        imagem: "/images/paises/roteiro/beijing-dia1-temple-of-heaven.jpg",
        pontos: [
          "Temple of Heaven",
          "Tiananmen Square",
          "Forbidden City",
          "Jingshan Park",
          "Shichahai / Houhai",
          "Hutongs",
          "Jantar de Peking Duck",
        ],
        conceito: "O coração histórico e imperial da China.",
      },
      {
        cidade: "Beijing",
        dia: 2,
        titulo: "Grande Muralha",
        imagem: "/images/paises/roteiro/beijing-dia2-great-wall.jpg",
        pontos: ["Mutianyu Great Wall", "Summer Palace", "Wangfujing à noite"],
        conceito:
          "Grande Muralha pela manhã e um dos mais importantes complexos imperiais de Beijing à tarde.",
      },
      {
        cidade: "Shanghai",
        dia: 1,
        titulo: "Shanghai Clássica + Futurista",
        imagem: "/images/paises/roteiro/shanghai-dia1-the-bund.jpg",
        posicaoImagem: "center 15%",
        pontos: ["Yu Garden", "Old City", "Nanjing Road", "The Bund", "Lujiazui", "Shanghai Tower", "Bund iluminado à noite"],
        conceito: "Da Shanghai tradicional ao skyline futurista de Pudong.",
      },
      {
        cidade: "Shanghai",
        dia: 2,
        titulo: "French Concession",
        imagem: "/images/paises/roteiro/shanghai-dia2-wukang-road.jpg",
        posicaoImagem: "center 30%",
        pontos: [
          "Wukang Road",
          "Former French Concession",
          "Anfu Road",
          "Jing'an Temple",
          "Xintiandi",
          "Huangpu River Cruise à noite",
        ],
        conceito: "Arquitetura histórica, ruas arborizadas, cafés, bairros sofisticados e Shanghai vista do rio.",
      },
    ],
  },
];

export const FLEXIBILIDADE_DATAS = [
  { key: "fixas", nome: "Datas fixas" },
  { key: "tres", nome: "± 3 dias" },
  { key: "sete", nome: "± 7 dias" },
  { key: "flexivel", nome: "Flexível" },
] as const;
export type FlexibilidadeDatasKey = (typeof FLEXIBILIDADE_DATAS)[number]["key"];

// Simulação de pagamento (Tabela Price) — só valores finais são exibidos ao cliente.
export const TAXA_MAQUINA_CARTAO = 0.0355;
export const TAXA_JUROS_CARTAO_MES = 0.0169;
export const OPCOES_PARCELAS_CARTAO = [1, 4, 10, 12] as const;
export const ENTRADA_PIX_PCT = 0.3;
export const TAXA_JUROS_PIX_MES = 0.0149;
export const OPCOES_PARCELAS_PIX = [4, 10, 12] as const;
export function calcularParcelaPrice(valorFinanciado: number, taxaMensal: number, parcelas: number) {
  if (parcelas <= 1) return valorFinanciado;
  return (valorFinanciado * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -parcelas));
}

// Simulação de forma de pagamento (cartão + PIX) — extraída da Calculadora
// Reversa (app/calculadora_reversa/page.tsx, useMemo "simulacaoCartao" /
// "simulacaoPix" / "mesesAteViagem") pra reaproveitar a mesma conta nas
// páginas de self-checkout de /produtos (JR Pass, Seguro Viagem). Pedido do
// Wilson, 25/set/2026: "adicionar formas de pagamento igual temos na
// pagina de calculadora reversa". Não mexi no arquivo original — só
// generalizei a mesma fórmula aqui pra reuso, com o mesmo resultado
// numérico pros mesmos inputs.
export type SimulacaoParcelaCartao = { parcelas: (typeof OPCOES_PARCELAS_CARTAO)[number]; valorParcela: number; valorTotal: number };
export type SimulacaoParcelaPix = {
  parcelas: (typeof OPCOES_PARCELAS_PIX)[number];
  entrada: number;
  valorParcela: number;
  valorTotal: number;
};

export function calcularSimulacaoCartao(totalBRL: number): SimulacaoParcelaCartao[] {
  const valorFinanciado = totalBRL * (1 + TAXA_MAQUINA_CARTAO);
  return OPCOES_PARCELAS_CARTAO.map((parcelas) => {
    const valorParcela = calcularParcelaPrice(valorFinanciado, TAXA_JUROS_CARTAO_MES, parcelas);
    return { parcelas, valorParcela, valorTotal: valorParcela * parcelas };
  });
}

/** Meses inteiros (0–12) entre hoje e a data da viagem — limita quantas
 * parcelas de PIX fazem sentido (não dá pra parcelar mais do que o prazo
 * até a viagem). `dataViagem` no formato "AAAA-MM-DD" (input type=date). */
export function calcularParcelasMaxPix(dataViagem: string, hoje: Date = new Date()): number {
  if (!dataViagem) return 12;
  const viagem = new Date(`${dataViagem}T00:00:00`);
  if (Number.isNaN(viagem.getTime())) return 12;
  const diffDias = (viagem.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
  const meses = diffDias / 30.44;
  return Math.max(0, Math.min(12, Math.floor(meses)));
}

export function calcularSimulacaoPix(totalBRL: number, parcelasMaxPix: number): SimulacaoParcelaPix[] {
  const entrada = totalBRL * ENTRADA_PIX_PCT;
  const valorFinanciado = totalBRL - entrada;
  return OPCOES_PARCELAS_PIX.filter((parcelas) => parcelas <= parcelasMaxPix).map((parcelas) => {
    const valorParcela = calcularParcelaPrice(valorFinanciado, TAXA_JUROS_PIX_MES, parcelas);
    return { parcelas, entrada, valorParcela, valorTotal: entrada + valorParcela * parcelas };
  });
}

export type FormaPagamentoEscolhida =
  | { metodo: "cartao"; parcelas: number }
  | { metodo: "pixVista"; parcelas: 1 }
  | { metodo: "pixParcelado"; parcelas: number }
  // TED — pedido do Wilson, 25/set/2026: "metodo de pagamento é só pix e
  // ted" (Câmbio) + "só a vista metodo de pagamento" — transferência
  // bancária tradicional, sempre à vista (não existe "TED parcelado").
  | { metodo: "ted"; parcelas: 1 };

// ── Perfil do viajante (ritmo do roteiro) ───────────────────────────────────
// Não altera preço: define o ritmo do roteiro (pontos turísticos por dia) e
// calibra o aviso de "roteiro corrido" (dias mínimos sugeridos por cidade).
export type PerfilViajanteKey = "cadenciado" | "equilibrado" | "acelerado";

export const PERFIL_VIAJANTE_PADRAO: PerfilViajanteKey = "equilibrado";

export const PERFIS_VIAJANTE: {
  key: PerfilViajanteKey;
  nome: string;
  pontosPorDia: string;
  recomendado?: boolean;
  imagem: string;
  descricao: string;
  destaques: string[];
  /** Dias mínimos sugeridos por cidade do roteiro (estimativa). */
  diasPorCidade: number;
}[] = [
  {
    key: "cadenciado",
    nome: "Cadenciado",
    pontosPorDia: "1 ponto turístico principal por dia",
    imagem: "/images/perfil-cadenciado.png",
    descricao: "Amplo tempo livre, no mesmo bairro.",
    destaques: ["Menor cobertura de cidades", "Menos deslocamentos"],
    diasPorCidade: 1.5,
  },
  {
    key: "equilibrado",
    nome: "Equilibrado",
    pontosPorDia: "2 pontos turísticos principais por dia",
    recomendado: true,
    imagem: "/images/perfil-equilibrado.png",
    descricao: "1 pela manhã e 1 à tarde.",
    destaques: ["Bom equilíbrio entre conhecer e descansar"],
    diasPorCidade: 1,
  },
  {
    key: "acelerado",
    nome: "Acelerado",
    pontosPorDia: "3 a 4 pontos turísticos principais por dia",
    imagem: "/images/perfil-acelerado.png",
    descricao: "Pouco tempo em cada ponto turístico.",
    destaques: ["Maior cobertura", "Maior fadiga geral"],
    diasPorCidade: 0.75,
  },
];

export function diasMinimosPorPerfil(
  perfil: PerfilViajanteKey,
  cidades: number,
  parquesDiaInteiro: number,
): number {
  const fator = PERFIS_VIAJANTE.find((p) => p.key === perfil)?.diasPorCidade ?? 1;
  return Math.ceil(Math.max(1, cidades) * fator) + parquesDiaInteiro;
}
