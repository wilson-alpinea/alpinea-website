// Catálogo de rotas e veículos de motorista privado (transfers de
// aeroporto, deslocamento dentro da cidade e tours de dia inteiro) —
// pedido do Wilson, 25/set/2026: "enriquecer nossa pagina de motorista
// privado tanto na /produtos quanto calculadora reversa e self-service,
// colocar mesma margem que já usamos hoje, os preços na tabela anexa são
// preço de custo" + "adicionar coaster na /produtos", a partir da tabela
// de preços de custo da DAIKICHI/HK TOURIST (fornecedor real, PDF
// anexado pelo Wilson) para 6 categorias de veículo (Alphard 8, Hiace 10,
// Hiace 14, Coaster 18/21/29 lugares) em 19 rotas/tours entre Tóquio,
// Kansai (Osaka/Kyoto) e Hiroshima.
//
// Mesma regra de imposto+margem já usada no resto do site
// (comMargemEImposto, definida em CustomPackageCard.tsx — multiplicador
// 1,495 = 15% de imposto sobre o lucro × 1,3 de margem). Os preços de
// custo do PDF vêm em JPY; convertidos pra USD na mesma cotação de
// referência já usada em outros itens de fornecedor japonês deste site
// (~150 JPY/US$, ver comentários em CustomPackageCard.tsx) ANTES de
// aplicar a margem — o número que entra em comMargemEImposto(...) abaixo
// é sempre o custo em dólar já convertido (arredondado), com o valor
// original em iene registrado no comentário ao lado pra auditoria.
//
// Cada rota tem um preço-base (cobre os minutos livres inclusos —
// normalmente 90 min no trecho de chegada/pickup, 30 min no trecho de
// partida/drop-off — ou, nos tours de 10h, as 10 horas já inclusas) e uma
// tarifa de hora extra por bloco de 30 min, cobrada além da base quando o
// serviço passa do tempo incluso. Fonte: DAIKICHI/HK TOURIST (日本旅行業
// 協会正会員JATA), tabela "To: AJISAI", recebida do Wilson em 25/set/2026.
//
// Condições do fornecedor (aplicam-se a todas as rotas abaixo):
// - Preço já inclui imposto, estacionamento, pedágio (ETC) e combustível.
// - Meet & Greet (recepção com placa de identificação): ¥3.000 (custo).
// - Cadeirinha infantil: ¥3.000 (custo).
// - Cancelamento: gratuito até 24h antes do serviço para Alphard/Hiace;
//   até 48h antes para qualquer configuração de Coaster.
//
// NÃO cobre trânsito inter-municipal de longa distância entre regiões
// (ex.: Tóquio↔Kansai por estrada) — mesma ressalva já usada no
// TransportePrivadoCalculator para a diária genérica do Personalizado.

import { comMargemEImposto } from "../components/CustomPackageCard";

export type VeiculoMotoristaId =
  | "alphard8"
  | "hiace10"
  | "hiace14"
  | "coaster18"
  | "coaster21"
  | "coaster29";

export type VeiculoMotorista = {
  id: VeiculoMotoristaId;
  nome: string;
  assentos: number;
  tipo: "van" | "onibus";
  foto: string;
  tagline: string;
};

export const VEICULOS_MOTORISTA: VeiculoMotorista[] = [
  {
    id: "alphard8",
    nome: "Toyota Alphard",
    assentos: 8,
    tipo: "van",
    foto: "/images/carro-alphard.webp",
    tagline: "Minivan premium — bancos reclináveis, cabine mais silenciosa",
  },
  {
    id: "hiace10",
    nome: "Toyota Hiace (10 lugares)",
    assentos: 10,
    tipo: "van",
    foto: "/images/carro-hiace.webp",
    tagline: "Bagageiro amplo — ideal para grupos com mais bagagem",
  },
  {
    id: "hiace14",
    nome: "Toyota Hiace (14 lugares)",
    assentos: 14,
    tipo: "van",
    foto: "/images/carro-hiace.webp",
    tagline: "Configuração estendida da Hiace, para grupos de até 14 pessoas",
  },
  {
    id: "coaster18",
    nome: "Toyota Coaster (18 lugares)",
    assentos: 18,
    tipo: "onibus",
    foto: "/images/carro-coaster.png",
    tagline: "Micro-ônibus executivo — para grupos grandes ou famílias estendidas",
  },
  {
    id: "coaster21",
    nome: "Toyota Coaster (21 lugares)",
    assentos: 21,
    tipo: "onibus",
    foto: "/images/carro-coaster.png",
    tagline: "Mesma categoria Coaster, configuração de 21 lugares",
  },
  {
    id: "coaster29",
    nome: "Toyota Coaster (29 lugares)",
    assentos: 29,
    tipo: "onibus",
    foto: "/images/carro-coaster.png",
    tagline: "Maior configuração da Coaster, para grupos de até 29 pessoas",
  },
];

export function encontrarVeiculoMotorista(id: VeiculoMotoristaId): VeiculoMotorista {
  const veiculo = VEICULOS_MOTORISTA.find((v) => v.id === id);
  if (!veiculo) throw new Error(`Veículo de motorista privado desconhecido: ${id}`);
  return veiculo;
}

export type CategoriaRotaMotorista = "transfer-aeroporto" | "dentro-cidade" | "tour-dia-inteiro";
export type RegiaoRotaMotorista = "kanto" | "kansai" | "hiroshima";

export const REGIOES_MOTORISTA: { key: RegiaoRotaMotorista; nome: string }[] = [
  { key: "kanto", nome: "Tóquio (Kanto)" },
  { key: "kansai", nome: "Osaka / Kyoto (Kansai)" },
  { key: "hiroshima", nome: "Hiroshima" },
];

export const CATEGORIAS_ROTA_MOTORISTA: { key: CategoriaRotaMotorista; nome: string }[] = [
  { key: "transfer-aeroporto", nome: "Transfer de aeroporto" },
  { key: "dentro-cidade", nome: "Dentro da cidade" },
  { key: "tour-dia-inteiro", nome: "Tour de dia inteiro (10h)" },
];

export type RotaMotorista = {
  id: string;
  nome: string;
  regiao: RegiaoRotaMotorista;
  categoria: CategoriaRotaMotorista;
  // Minutos já inclusos no preço-base antes da hora extra começar a
  // contar — null nos tours de 10h, onde a própria base já cobre as 10
  // horas (a hora extra só se aplica além disso).
  minutosLivres: number | null;
  precoUSD: Record<VeiculoMotoristaId, number>;
  overtimeUSDPor30Min: Record<VeiculoMotoristaId, number>;
};

export const ROTAS_MOTORISTA: RotaMotorista[] = [
  {
    id: "narita-tokyo",
    nome: "Aeroporto de Narita → Tóquio",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemEImposto(150), // ¥22.500
      hiace10: comMargemEImposto(180), // ¥27.000
      hiace14: comMargemEImposto(210), // ¥31.500
      coaster18: comMargemEImposto(480), // ¥72.000
      coaster21: comMargemEImposto(480), // ¥72.000
      coaster29: comMargemEImposto(480), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-narita",
    nome: "Tóquio → Aeroporto de Narita",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(150), // ¥22.500
      hiace10: comMargemEImposto(180), // ¥27.000
      hiace14: comMargemEImposto(210), // ¥31.500
      coaster18: comMargemEImposto(480), // ¥72.000
      coaster21: comMargemEImposto(480), // ¥72.000
      coaster29: comMargemEImposto(480), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "haneda-tokyo",
    nome: "Aeroporto de Haneda → Tóquio",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemEImposto(120), // ¥18.000
      hiace10: comMargemEImposto(147), // ¥22.000
      hiace14: comMargemEImposto(180), // ¥27.000
      coaster18: comMargemEImposto(420), // ¥63.000
      coaster21: comMargemEImposto(420), // ¥63.000
      coaster29: comMargemEImposto(450), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(17), // ¥2.500/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-haneda",
    nome: "Tóquio → Aeroporto de Haneda",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(96), // ¥14.400
      hiace10: comMargemEImposto(113), // ¥17.000
      hiace14: comMargemEImposto(180), // ¥27.000
      coaster18: comMargemEImposto(420), // ¥63.000
      coaster21: comMargemEImposto(420), // ¥63.000
      coaster29: comMargemEImposto(450), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "dentro-tokyo",
    nome: "Dentro de Tóquio (23 distritos)",
    regiao: "kanto",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(84), // ¥12.600
      hiace10: comMargemEImposto(102), // ¥15.300
      hiace14: comMargemEImposto(180), // ¥27.000
      coaster18: comMargemEImposto(420), // ¥63.000
      coaster21: comMargemEImposto(420), // ¥63.000
      coaster29: comMargemEImposto(450), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-tour-10h",
    nome: "Tour em Tóquio — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(360), // ¥54.000
      hiace10: comMargemEImposto(390), // ¥58.500
      hiace14: comMargemEImposto(420), // ¥63.000
      coaster18: comMargemEImposto(600), // ¥90.000
      coaster21: comMargemEImposto(660), // ¥99.000
      coaster29: comMargemEImposto(720), // ¥108.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "tokyo-yokohama-tour-10h",
    nome: "Tour Tóquio + Yokohama — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(378), // ¥56.700
      hiace10: comMargemEImposto(408), // ¥61.200
      hiace14: comMargemEImposto(450), // ¥67.500
      coaster18: comMargemEImposto(630), // ¥94.500
      coaster21: comMargemEImposto(690), // ¥103.500
      coaster29: comMargemEImposto(750), // ¥112.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "fuji-hakone-tour-10h",
    nome: "Tour Fuji + Hakone — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(390), // ¥58.500
      hiace10: comMargemEImposto(420), // ¥63.000
      hiace14: comMargemEImposto(468), // ¥70.200
      coaster18: comMargemEImposto(660), // ¥99.000
      coaster21: comMargemEImposto(720), // ¥108.000
      coaster29: comMargemEImposto(780), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "kansai-osaka",
    nome: "Aeroporto de Kansai → Osaka",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemEImposto(150), // ¥22.500
      hiace10: comMargemEImposto(180), // ¥27.000
      hiace14: comMargemEImposto(210), // ¥31.500
      coaster18: comMargemEImposto(480), // ¥72.000
      coaster21: comMargemEImposto(480), // ¥72.000
      coaster29: comMargemEImposto(480), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(17), // ¥2.500/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "osaka-kansai",
    nome: "Osaka → Aeroporto de Kansai",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(150), // ¥22.500
      hiace10: comMargemEImposto(180), // ¥27.000
      hiace14: comMargemEImposto(210), // ¥31.500
      coaster18: comMargemEImposto(480), // ¥72.000
      coaster21: comMargemEImposto(480), // ¥72.000
      coaster29: comMargemEImposto(480), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "dentro-osaka",
    nome: "Dentro de Osaka (24 distritos)",
    regiao: "kansai",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(84), // ¥12.600
      hiace10: comMargemEImposto(102), // ¥15.300
      hiace14: comMargemEImposto(180), // ¥27.000
      coaster18: comMargemEImposto(420), // ¥63.000
      coaster21: comMargemEImposto(420), // ¥63.000
      coaster29: comMargemEImposto(450), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "dentro-kyoto-ou-kyoto-osaka",
    nome: "Dentro de Kyoto, ou Kyoto → Osaka (24 distritos)",
    regiao: "kansai",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(114), // ¥17.100
      hiace10: comMargemEImposto(138), // ¥20.700
      hiace14: comMargemEImposto(180), // ¥27.000
      coaster18: comMargemEImposto(420), // ¥63.000
      coaster21: comMargemEImposto(420), // ¥63.000
      coaster29: comMargemEImposto(447), // ¥67.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "kansai-kyoto",
    nome: "Aeroporto de Kansai → Kyoto",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemEImposto(180), // ¥27.000
      hiace10: comMargemEImposto(210), // ¥31.500
      hiace14: comMargemEImposto(240), // ¥36.000
      coaster18: comMargemEImposto(510), // ¥76.500
      coaster21: comMargemEImposto(510), // ¥76.500
      coaster29: comMargemEImposto(510), // ¥76.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "kyoto-kansai",
    nome: "Kyoto → Aeroporto de Kansai",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemEImposto(180), // ¥27.000
      hiace10: comMargemEImposto(210), // ¥31.500
      hiace14: comMargemEImposto(240), // ¥36.000
      coaster18: comMargemEImposto(510), // ¥76.500
      coaster21: comMargemEImposto(510), // ¥76.500
      coaster29: comMargemEImposto(510), // ¥76.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(17), // ¥2.500/30min
      hiace10: comMargemEImposto(17), // ¥2.500/30min
      hiace14: comMargemEImposto(20), // ¥3.000/30min
      coaster18: comMargemEImposto(33), // ¥5.000/30min
      coaster21: comMargemEImposto(33), // ¥5.000/30min
      coaster29: comMargemEImposto(33), // ¥5.000/30min
    },
  },
  {
    id: "osaka-tour-10h",
    nome: "Tour em Osaka — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(360), // ¥54.000
      hiace10: comMargemEImposto(390), // ¥58.500
      hiace14: comMargemEImposto(420), // ¥63.000
      coaster18: comMargemEImposto(600), // ¥90.000
      coaster21: comMargemEImposto(660), // ¥99.000
      coaster29: comMargemEImposto(720), // ¥108.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "osaka-kyoto-tour-10h",
    nome: "Tour Osaka + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(390), // ¥58.500
      hiace10: comMargemEImposto(420), // ¥63.000
      hiace14: comMargemEImposto(468), // ¥70.200
      coaster18: comMargemEImposto(660), // ¥99.000
      coaster21: comMargemEImposto(720), // ¥108.000
      coaster29: comMargemEImposto(780), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "osaka-nara-kyoto-tour-10h",
    nome: "Tour Osaka + Nara + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(390), // ¥58.500
      hiace10: comMargemEImposto(420), // ¥63.000
      hiace14: comMargemEImposto(468), // ¥70.200
      coaster18: comMargemEImposto(660), // ¥99.000
      coaster21: comMargemEImposto(720), // ¥108.000
      coaster29: comMargemEImposto(780), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "osaka-kobe-kyoto-tour-10h",
    nome: "Tour Osaka + Kobe + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(390), // ¥58.500
      hiace10: comMargemEImposto(420), // ¥63.000
      hiace14: comMargemEImposto(468), // ¥70.200
      coaster18: comMargemEImposto(660), // ¥99.000
      coaster21: comMargemEImposto(720), // ¥108.000
      coaster29: comMargemEImposto(780), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
  {
    id: "hiroshima-tour-10h",
    nome: "Tour em Hiroshima — 10 horas",
    regiao: "hiroshima",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemEImposto(533), // ¥80.000
      hiace10: comMargemEImposto(600), // ¥90.000
      hiace14: comMargemEImposto(633), // ¥95.000
      coaster18: comMargemEImposto(867), // ¥130.000
      coaster21: comMargemEImposto(933), // ¥140.000
      coaster29: comMargemEImposto(933), // ¥140.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemEImposto(33), // ¥5.000/30min
      hiace10: comMargemEImposto(33), // ¥5.000/30min
      hiace14: comMargemEImposto(33), // ¥5.000/30min
      coaster18: comMargemEImposto(67), // ¥10.000/30min
      coaster21: comMargemEImposto(67), // ¥10.000/30min
      coaster29: comMargemEImposto(67), // ¥10.000/30min
    },
  },
];

export function encontrarRotaMotorista(id: string): RotaMotorista | null {
  return ROTAS_MOTORISTA.find((r) => r.id === id) ?? null;
}

// Adicionais opcionais do fornecedor — mesma regra de custo+margem,
// ¥3.000 cada (≈ US$20 de custo na cotação de referência).
export const ADICIONAL_MEET_GREET_USD = comMargemEImposto(20); // ¥3.000
export const ADICIONAL_CADEIRINHA_USD = comMargemEImposto(20); // ¥3.000

// Política de cancelamento do fornecedor — mesmo texto usado nas 3 telas
// de motorista privado (/produtos, calculadora reversa, self-service).
export const POLITICA_CANCELAMENTO_MOTORISTA =
  "Cancelamento gratuito até 24h antes do serviço para Alphard/Hiace, ou até 48h antes para qualquer configuração de Coaster. Fora desse prazo, o valor integral é cobrado.";

// Calcula o custo de hora extra (em blocos de 30 min, sempre arredondado
// pra cima — mesma lógica do fornecedor) além dos minutos livres já
// inclusos na rota.
export function calcularOvertimeUSD(
  rota: RotaMotorista,
  veiculo: VeiculoMotoristaId,
  minutosExtras: number,
): number {
  if (minutosExtras <= 0) return 0;
  const blocos = Math.ceil(minutosExtras / 30);
  return blocos * rota.overtimeUSDPor30Min[veiculo];
}

// ── Seleção do cliente/vendedor — compartilhada pelas 3 telas ──
//
// Pedido do Wilson, 25/set/2026: trocar o antigo modelo de "diária fixa
// por cidade" (US$700/dia genérico) pelo catálogo de rotas exatas da
// DAIKICHI/HK TOURIST. Um único veículo é escolhido para toda a seleção
// (o fornecedor cota por veículo dedicado, não por trecho isolado) e o
// cliente/vendedor monta a lista de rotas/tours que vai usar, cada uma
// com sua própria quantidade (ex.: 2 tours de dia inteiro em datas
// diferentes da viagem).
export type ItemSelecaoMotorista = {
  rotaId: string;
  quantidade: number;
};

export type SelecaoMotorista = {
  veiculo: VeiculoMotoristaId;
  itens: ItemSelecaoMotorista[];
};

export const SELECAO_MOTORISTA_VAZIA: SelecaoMotorista = {
  veiculo: "hiace10",
  itens: [],
};

// Soma o preço-base (já com margem) de cada rota selecionada × sua
// quantidade, pro veículo escolhido. Não inclui hora extra (calculada à
// parte quando o cliente sabe que vai passar do tempo incluso, via
// calcularOvertimeUSD) nem adicionais opcionais (meet & greet,
// cadeirinha).
export function calcularTotalMotoristaUSD(selecao: SelecaoMotorista): number {
  return selecao.itens.reduce((soma, item) => {
    const rota = encontrarRotaMotorista(item.rotaId);
    if (!rota) return soma;
    return soma + rota.precoUSD[selecao.veiculo] * Math.max(1, item.quantidade);
  }, 0);
}

// Quantidade total de rotas/tours selecionados (soma das quantidades) —
// usado pra exibir "3 serviços selecionados" etc.
export function contarItensMotorista(selecao: SelecaoMotorista): number {
  return selecao.itens.reduce((soma, item) => soma + Math.max(1, item.quantidade), 0);
}

// Resumo em texto de uma seleção — usado no resumo do lead/proposta (CRM,
// WhatsApp, orçamento) e no rodapé dos pickers.
export function resumoSelecaoMotorista(selecao: SelecaoMotorista): string {
  if (selecao.itens.length === 0) return "Nenhum serviço de motorista selecionado.";
  const veiculo = encontrarVeiculoMotorista(selecao.veiculo);
  const linhas = selecao.itens.map((item) => {
    const rota = encontrarRotaMotorista(item.rotaId);
    if (!rota) return null;
    const qtd = Math.max(1, item.quantidade);
    return `${qtd > 1 ? `${qtd}× ` : ""}${rota.nome}`;
  });
  return `${veiculo.nome} — ${linhas.filter(Boolean).join(", ")}`;
}
