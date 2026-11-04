// Preços do calculador do Pacote Personalizado / Viagem Personalizada /
// Calculadora Reversa — movidos de app/components/CustomPackageCard.tsx em
// 04/nov/2026 para um módulo puro (sem "use client"), para o CRM
// (/crm/precos) conseguir listar e editar cada valor. CustomPackageCard
// re-exporta tudo com os mesmos nomes: nada que importava de lá muda.
// Histórico/justificativa de cada valor: ver comentários em
// CustomPackageCard.tsx, nas posições originais.
//
// Convenção: o número dentro de P() é o CUSTO (antes de imposto + margem),
// salvo quando indicado.
import { comMargemEImposto, IMPOSTO_SOBRE_LUCRO } from "./margemPadrao";
import { P, tabelaP } from "./parametrosPreco";

const comMargem = <K extends string>(t: Record<K, number>): Record<K, number> => {
  const out = {} as Record<K, number>;
  for (const k of Object.keys(t) as K[]) out[k] = comMargemEImposto(t[k]);
  return out;
};

// ── Margens próprias ──
// Motorista privado: margem de 45% sobre o custo (Wilson, 29/out/2026).
export const MULTIPLICADOR_MOTORISTA_PRIVADO = P("motorista.margem", 1.45);
export function comMargemMotoristaPrivado(custo: number) {
  return Math.round(custo * MULTIPLICADOR_MOTORISTA_PRIVADO);
}

// ── Hotel ──
export const DIARIA_HOTEL = comMargem(
  tabelaP("hotel.diariaCusto", { "3 estrelas": 400, "4 estrelas": 800, "5 estrelas": 2600, "Elite": 7500 }),
);
export const ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA = comMargem(
  tabelaP("hotel.cafeCusto", { "3 estrelas": 60, "4 estrelas": 150, "5 estrelas": 250, "Elite": 400 }),
);
export const FATOR_QUARTO = tabelaP("hotel.fatorQuarto", {
  Individual: 1,
  "Duplo (casal)": 0.65,
  "Duplo (compartilhado)": 0.65,
  Triplo: 0.5,
});
export const CIDADE_MULTIPLICADOR_HOTEL = tabelaP("hotel.cidade", {
  tokyo: 1.15,
  kyoto: 1.1,
  osaka: 1.0,
  hokkaido: 0.95,
  okinawa: 1.05,
  hiroshima: 0.9,
  nara: 0.9,
  hakone: 1.05,
  nikko: 0.9,
  kanazawa: 0.9,
  takayama: 0.85,
  kamakura: 0.95,
  nagoya: 0.9,
  fukuoka: 0.9,
  kobe: 0.95,
  yokohama: 1.0,
  miyajima: 0.9,
  nagano: 0.85,
  ishigaki: 1.05,
  yakushima: 0.9,
  fuji: 1.05,
  niseko: 1.35,
  hakuba: 1.2,
  kamikochi: 1.25,
  nozawa: 1.0,
  kusatsu: 1.05,
  kinosaki: 1.0,
  koyasan: 0.85,
  suzuka: 0.8,
  motegi: 0.8,
});

// ── Transporte ──
export const DIARIA_TRANSPORTE = comMargemEImposto(P("transporte.diariaCusto", 1000));
export const DIARIA_MOTORISTA_PRIVADO_USD = comMargemMotoristaPrivado(P("motorista.diariaCustoUSD", 700));

// ── JR Pass ── (custo do fornecedor × spread)
export const SPREAD_JR_PASS = P("jrpass.margem", 1.3);
export const JR_PASS_DIAS_OPCOES = [7, 14, 21] as const;
const custoJr = tabelaP("jrpass.custoUSD", { "7": 329, "14": 527, "21": 658 });
const custoJrGreen = tabelaP("jrpass.custoGreenUSD", { "7": 461, "14": 724, "21": 921 });
export const JR_PASS_PRECO_USD: Record<(typeof JR_PASS_DIAS_OPCOES)[number], number> = {
  7: Math.round(custoJr["7"] * SPREAD_JR_PASS),
  14: Math.round(custoJr["14"] * SPREAD_JR_PASS),
  21: Math.round(custoJr["21"] * SPREAD_JR_PASS),
};
export const JR_PASS_PRECO_USD_GREEN: Record<(typeof JR_PASS_DIAS_OPCOES)[number], number> = {
  7: Math.round(custoJrGreen["7"] * SPREAD_JR_PASS),
  14: Math.round(custoJrGreen["14"] * SPREAD_JR_PASS),
  21: Math.round(custoJrGreen["21"] * SPREAD_JR_PASS),
};

// ── Ajisai Shopping ── comissão sobre o valor das compras (fração: 0,2 = 20%)
export const COMISSAO_AJISAI_SHOPPING_PCT = P("shopping.comissao", 0.2);

// ── Conectividade ──
export const DIARIA_WIFI_USD_PAX = comMargemEImposto(P("conectividade.wifiCustoUSD", 7));
export const DIARIA_ESIM_USD_PAX = comMargemEImposto(P("conectividade.esimCustoUSD", 4));

// ── Ingressos ── (custo USD por pessoa)
export const PRECO_INGRESSO_DISNEY_UNIVERSAL_USD_PAX = comMargemEImposto(P("ingressos.disneyUniversal", 83));
export const PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX = comMargemEImposto(P("ingressos.disneyland", 63));
export const PRECO_INGRESSO_DISNEYSEA_USD_PAX = comMargemEImposto(P("ingressos.disneysea", 63));
export const PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX = comMargemEImposto(P("ingressos.disneyPremierAccess", 11));
export const PRECO_INGRESSO_USJ_USD_PAX = comMargemEImposto(P("ingressos.usj", 72));
export const PRECO_EXPRESS_PASS_USJ_4_USD_PAX = comMargemEImposto(P("ingressos.usjExpress4", 87));
export const PRECO_EXPRESS_PASS_USJ_5_USD_PAX = comMargemEImposto(P("ingressos.usjExpress5", 100));
export const PRECO_EXPRESS_PASS_USJ_7_USD_PAX = comMargemEImposto(P("ingressos.usjExpress7", 120));
export const PRECO_EXPRESS_PASS_USJ_8_USD_PAX = comMargemEImposto(P("ingressos.usjExpress8", 130));
export const PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX = comMargemEImposto(P("ingressos.usjExpressPremium", 300));
export const PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX = comMargemEImposto(P("ingressos.teamlabTokyo", 27));
export const PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX = comMargemEImposto(P("ingressos.teamlabKyoto", 25));

// ── Serviços ── (custo USD)
export const PRECO_MALA_INTERMUNICIPAL_USD = comMargemEImposto(P("servicos.malaIntermunicipal", 19));
export const PRECO_RESTAURANTES_HIGHEND_USD = comMargemEImposto(P("servicos.restaurantesHighEnd", 1000));
export const PRECO_TRANSFER_ONIBUS_USD_PAX = comMargemEImposto(P("servicos.transferOnibus", 48));
export const PRECO_RESERVA_RESTAURANTE_USD = comMargemEImposto(P("servicos.reservaRestaurante", 60));
export const PRECO_EXPERIENCIA_SOB_MEDIDA_USD = comMargemEImposto(P("servicos.experienciaSobMedida", 180));
export const DIARIA_CONCIERGE_USD = comMargemEImposto(P("servicos.concierge", 35));

// ── Aéreo ── (Economy em BRL; demais em USD; First Class só com imposto)
export const PRECO_AEREO_ECONOMY_BRL = comMargemEImposto(P("aereo.economyCustoBRL", 8000));
export const PRECO_AEREO_PREMIUM_ECONOMY_USD = comMargemEImposto(P("aereo.premiumEconomyCustoUSD", 3200));
export const PRECO_AEREO_BUSINESS_USD = comMargemEImposto(P("aereo.businessCustoUSD", 6000));
export const PRECO_AEREO_FIRST_USD = Math.round(P("aereo.firstCustoUSD", 17500) * IMPOSTO_SOBRE_LUCRO);

// ── Taxa de grupo ── por passageiro acima do limite (custo BRL)
export const LIMITE_PESSOAS_SEM_TAXA = 3;
export const TAXA_POR_PASSAGEIRO_EXTRA = comMargemEImposto(P("grupo.taxaPassageiroExtraCusto", 350));
