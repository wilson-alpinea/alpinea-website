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
  { key: "cambioBrasil", nome: "Câmbio no Brasil", icone: "/images/icone-servico-cambio-brasil.png", sobConsulta: true },
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
