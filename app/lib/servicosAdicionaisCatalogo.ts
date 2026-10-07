// Catálogo dos Serviços Adicionais (/produtos/servicos-adicionais) —
// reestruturado em 06/out/2026 a pedido do Wilson:
// - eSIM: "cada um deles tem que ter descritivo, termos de uso, explicação"
//   → 3 planos (proposta aprovada via AskUserQuestion: "pesquise e proponha
//   3 planos"), custo de referência de fornecedor + margem padrão.
// - Reserva de restaurantes "um nível acima": rol de restaurantes possíveis,
//   estimativa de preço de cada um, valores das refeições NÃO inclusos,
//   termos de uso e aceite.
// - Limousine Bus: "margem de 50%", self-checkout, endereço de saída e
//   chegada e faixa de horários conforme o site oficial.
// - Removidos: transporte de malas, experiência sob medida, restaurantes
//   high-end, Ajisai Shopping e concierge dedicado.
//
// Puro TypeScript — usado pela página e pela API (que recalcula o valor do
// Limousine Bus antes de gerar o pagamento).

import { comMargemEImposto } from "./margemPadrao";

// Cotação de referência JPY/US$ usada para custos de fornecedor japonês no
// site (mesma ~150 de motoristaPrivadoRotas.ts).
export const JPY_POR_USD_REFERENCIA = 150;

// ── eSIM ──
// Custos de referência (out/2026, pesquisa de mercado — ex.: Ubigi Japão
// ilimitado 7/15/30 dias ≈ US$ 25/39/65, redes NTT Docomo e KDDI).
// ⚠️ Confirmar fornecedor e custo final com o Wilson.
export type PlanoEsim = {
  id: string;
  nome: string;
  dias: number;
  custoUSD: number;
  resumo: string;
  indicado: string;
};
export const PLANOS_ESIM: PlanoEsim[] = [
  {
    id: "esim-7",
    nome: "eSIM Japão — 7 dias, dados ilimitados",
    dias: 7,
    custoUSD: 25,
    resumo: "Internet 5G/4G ilimitada por 7 dias nas redes NTT Docomo e KDDI.",
    indicado: "Viagens curtas ou um trecho da viagem.",
  },
  {
    id: "esim-15",
    nome: "eSIM Japão — 15 dias, dados ilimitados",
    dias: 15,
    custoUSD: 39,
    resumo: "Internet 5G/4G ilimitada por 15 dias nas redes NTT Docomo e KDDI.",
    indicado: "A duração mais comum das viagens ao Japão.",
  },
  {
    id: "esim-30",
    nome: "eSIM Japão — 30 dias, dados ilimitados",
    dias: 30,
    custoUSD: 65,
    resumo: "Internet 5G/4G ilimitada por 30 dias nas redes NTT Docomo e KDDI.",
    indicado: "Viagens longas, a trabalho ou com vários destinos.",
  },
];
export const precoEsimUSD = (p: PlanoEsim) => comMargemEImposto(p.custoUSD);

export const COMO_FUNCIONA_ESIM = [
  "Enviamos o QR Code de instalação por e-mail e WhatsApp até 2 dias úteis antes do embarque.",
  "Instale ainda no Brasil, com Wi-Fi (leva 2 minutos). Mantenha a linha desligada até chegar.",
  "Ao pousar no Japão, ative a linha de dados do eSIM nas configurações — a validade começa na primeira conexão no Japão.",
  "Seu chip brasileiro continua no aparelho: WhatsApp e iMessage seguem com o seu número.",
];
export const TERMOS_ESIM = [
  "O aparelho precisa ser compatível com eSIM e desbloqueado (sem bloqueio de operadora). Confira em Ajustes antes de contratar.",
  "Plano somente de dados: não inclui número de telefone japonês nem ligações/SMS tradicionais (chamadas por WhatsApp funcionam normalmente).",
  "Um eSIM por aparelho. O QR Code pode ser instalado uma única vez; apagar o eSIM do aparelho pode inutilizá-lo.",
  "Dados ilimitados sujeitos a política de uso justo do fornecedor: após uso muito intenso, a velocidade pode ser reduzida temporariamente. Roteamento (hotspot) permitido conforme a rede.",
  "Após o envio do QR Code, o eSIM não é reembolsável nem trocável. Antes do envio, o cancelamento é gratuito.",
  "Cobertura e velocidade dependem da rede local (áreas montanhosas, túneis e subsolos podem ter sinal mais fraco).",
];

// ── Reserva de restaurantes ──
// Rol de restaurantes possíveis + estimativa por pessoa (jantar, menu
// degustação, SEM bebidas e taxas) — referência de out/2026. ⚠️ Valores
// mudam com frequência: são estimativas, conferir antes de confirmar.
export type RestauranteRol = {
  id: string;
  nome: string;
  cidade: "Tóquio" | "Kyoto" | "Osaka" | "Kobe";
  cozinha: string;
  estimativaJPY: number;
};
export const RESTAURANTES_ROL: RestauranteRol[] = [
  { id: "sezanne", nome: "Sézanne", cidade: "Tóquio", cozinha: "Francês contemporâneo", estimativaJPY: 50000 },
  { id: "florilege", nome: "Florilège", cidade: "Tóquio", cozinha: "Francês contemporâneo", estimativaJPY: 40000 },
  { id: "den", nome: "Den", cidade: "Tóquio", cozinha: "Japonês contemporâneo", estimativaJPY: 40000 },
  { id: "narisawa", nome: "Narisawa", cidade: "Tóquio", cozinha: "Cozinha inovadora", estimativaJPY: 50000 },
  { id: "ishikawa", nome: "Kagurazaka Ishikawa", cidade: "Tóquio", cozinha: "Kaiseki", estimativaJPY: 50000 },
  { id: "harutaka", nome: "Sushi Harutaka", cidade: "Tóquio", cozinha: "Sushi (omakase)", estimativaJPY: 55000 },
  { id: "kikunoi", nome: "Kikunoi Honten", cidade: "Kyoto", cozinha: "Kaiseki", estimativaJPY: 45000 },
  { id: "hyotei", nome: "Hyotei", cidade: "Kyoto", cozinha: "Kaiseki", estimativaJPY: 40000 },
  { id: "gion-sasaki", nome: "Gion Sasaki", cidade: "Kyoto", cozinha: "Kaiseki", estimativaJPY: 45000 },
  { id: "kitcho", nome: "Kyoto Kitcho Arashiyama", cidade: "Kyoto", cozinha: "Kaiseki tradicional", estimativaJPY: 100000 },
  { id: "hajime", nome: "Hajime", cidade: "Osaka", cozinha: "Cozinha inovadora", estimativaJPY: 50000 },
  { id: "taian", nome: "Taian", cidade: "Osaka", cozinha: "Kaiseki", estimativaJPY: 40000 },
  { id: "kobe-teppan", nome: "Teppanyaki de wagyu de Kobe (casa a definir)", cidade: "Kobe", cozinha: "Teppanyaki — carne de Kobe", estimativaJPY: 30000 },
];
export const estimativaRestauranteUSD = (r: RestauranteRol) => Math.round(r.estimativaJPY / JPY_POR_USD_REFERENCIA);

export const TERMOS_RESTAURANTES = [
  "A taxa da Ajisai é pelo serviço de reserva (contato, negociação de mesa, confirmação e suporte). O valor das refeições, bebidas, taxa de serviço e impostos NÃO está incluso e é pago diretamente ao restaurante.",
  "As estimativas por pessoa são referências do menu degustação de jantar, sem bebidas, e podem mudar sem aviso do restaurante.",
  "Reservas dependem da disponibilidade de cada casa. Se não conseguirmos a mesa, oferecemos alternativas equivalentes ou devolvemos a taxa daquela reserva.",
  "Muitos restaurantes exigem cartão de crédito como garantia e cobram até 100% do menu em caso de cancelamento tardio ou não comparecimento (no-show). Essas regras são repassadas antes da confirmação e são de responsabilidade do cliente.",
  "Restrições alimentares e alergias precisam ser informadas no pedido — alguns restaurantes não conseguem adaptar o menu.",
  "Chegue no horário: atrasos acima de 15 minutos podem cancelar a reserva. Alguns restaurantes têm código de vestimenta e idade mínima para crianças.",
  "Após a confirmação da reserva, a taxa da Ajisai não é reembolsável.",
];

// ── Limousine Bus ──
// Tarifas oficiais de referência (adulto, por trecho): Narita ↔ centro de
// Tóquio ¥3.600; Haneda ↔ centro de Tóquio até ~¥1.800 (varia por rota).
// Criança (6 a 11 anos) paga metade; menores de 6 no colo não pagam.
// Margem de 50% sobre o custo (Wilson, 06/out/2026). ⚠️ Conferir tarifas
// no site oficial (limousinebus.co.jp) quando houver reajuste.
export const MULTIPLICADOR_LIMOUSINE = 1.5;
export type AeroportoLimousine = "narita" | "haneda";
export const TARIFA_LIMOUSINE_JPY: Record<AeroportoLimousine, number> = { narita: 3600, haneda: 1800 };
export type SentidoLimousine = "chegada" | "partida" | "ida-volta";
export const SENTIDOS_LIMOUSINE: { id: SentidoLimousine; nome: string; trechos: number }[] = [
  { id: "chegada", nome: "Aeroporto → Tóquio", trechos: 1 },
  { id: "partida", nome: "Tóquio → aeroporto", trechos: 1 },
  { id: "ida-volta", nome: "Ida e volta", trechos: 2 },
];
export const PONTOS_LIMOUSINE_TOQUIO = [
  "Estação de Shinjuku (saída oeste) e hotéis de Shinjuku",
  "Estação de Tóquio (lado Yaesu) e hotéis de Marunouchi",
  "Ginza e Shiodome (hotéis)",
  "Shibuya (Shibuya Mark City) e hotéis de Shibuya",
  "Ikebukuro (estação e hotéis)",
  "Roppongi e Akasaka (hotéis)",
  "TCAT — Tokyo City Air Terminal (Nihombashi Hakozaki)",
  "Odaiba (hotéis)",
  "Outro hotel/ponto (informe abaixo)",
] as const;
export const EMBARQUE_AEROPORTO_LIMOUSINE: Record<AeroportoLimousine, string> = {
  narita:
    "Narita (Terminais 1, 2 e 3): troque o voucher no balcão “Airport Limousine” do saguão de desembarque e embarque no ponto de ônibus indicado, em frente ao terminal.",
  haneda:
    "Haneda (Terminais 1, 2 e 3): troque o voucher no balcão de ônibus do saguão de desembarque e embarque no ponto indicado, em frente ao terminal.",
};
export const HORARIOS_LIMOUSINE =
  "Saídas regulares de aproximadamente 6h30 a 23h, com intervalos de 15 a 60 minutos conforme a rota e o terminal. O horário exato da sua linha é confirmado no voucher.";
export const DURACAO_LIMOUSINE: Record<AeroportoLimousine, string> = { narita: "70 a 120 min", haneda: "30 a 60 min" };

export function precoLimousineUSD(p: { aeroporto: AeroportoLimousine; sentido: SentidoLimousine; adultos: number; criancas: number }) {
  const trechos = SENTIDOS_LIMOUSINE.find((s) => s.id === p.sentido)?.trechos ?? 1;
  const custoUSDAdulto = TARIFA_LIMOUSINE_JPY[p.aeroporto] / JPY_POR_USD_REFERENCIA;
  const adultoUSD = Math.round(custoUSDAdulto * MULTIPLICADOR_LIMOUSINE);
  const criancaUSD = Math.round((custoUSDAdulto / 2) * MULTIPLICADOR_LIMOUSINE);
  return trechos * (Math.max(0, p.adultos) * adultoUSD + Math.max(0, p.criancas) * criancaUSD);
}
