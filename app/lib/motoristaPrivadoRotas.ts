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
// Margem própria de 40% — pedido do Wilson, 25/set/2026: "margem aqui
// deve ser de 40%" (menor que o padrão ~49,5% usado no resto do site —
// ver comMargemMotoristaPrivado, definida em CustomPackageCard.tsx). Os
// preços de custo do PDF vêm em JPY; convertidos pra USD na mesma
// cotação de referência já usada em outros itens de fornecedor japonês
// deste site (~150 JPY/US$, ver comentários em CustomPackageCard.tsx)
// ANTES de aplicar a margem — o número que entra na função de margem
// abaixo é sempre o custo em dólar já convertido (arredondado), com o
// valor original em iene registrado no comentário ao lado pra
// auditoria.
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

import { comMargemMotoristaPrivado } from "./precosPacote";
import { P } from "./parametrosPreco";

// Transfer aeroporto ↔ hotel: margem de 50% sobre o custo do fornecedor
// (Wilson, 06/out/2026: "margem de 50% sob custo do fornecedor") — as rotas
// de categoria "transfer-aeroporto" abaixo usam esta função; o motorista à
// disposição (dentro da cidade / passeios) continua com 40%.
const MULTIPLICADOR_TRANSFER_AEROPORTO = P("transfer.margem", 1.5);
function comMargemTransferAeroporto(custo: number) {
  return Math.round(custo * MULTIPLICADOR_TRANSFER_AEROPORTO);
}

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
    foto: "/images/carro-alphard-estudio.webp",
    tagline: "Minivan premium — bancos reclináveis, cabine mais silenciosa",
  },
  {
    id: "hiace10",
    nome: "Toyota Hiace (10 lugares)",
    assentos: 10,
    tipo: "van",
    foto: "/images/carro-hiace-estudio.webp",
    tagline: "Bagageiro amplo — ideal para grupos com mais bagagem",
  },
  {
    id: "hiace14",
    nome: "Toyota Hiace (14 lugares)",
    assentos: 14,
    tipo: "van",
    foto: "/images/carro-hiace-estudio.webp",
    tagline: "Configuração estendida da Hiace, para grupos de até 14 pessoas",
  },
  {
    id: "coaster18",
    nome: "Toyota Coaster (18 lugares)",
    assentos: 18,
    tipo: "onibus",
    foto: "/images/carro-coaster-estudio.webp",
    tagline: "Micro-ônibus executivo — para grupos grandes ou famílias estendidas",
  },
  {
    id: "coaster21",
    nome: "Toyota Coaster (21 lugares)",
    assentos: 21,
    tipo: "onibus",
    foto: "/images/carro-coaster-estudio.webp",
    tagline: "Mesma categoria Coaster, configuração de 21 lugares",
  },
  {
    id: "coaster29",
    nome: "Toyota Coaster (29 lugares)",
    assentos: 29,
    tipo: "onibus",
    foto: "/images/carro-coaster-estudio.webp",
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
      alphard8: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.alphard8", 150)), // ¥22.500
      hiace10: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.hiace10", 180)), // ¥27.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.hiace14", 210)), // ¥31.500
      coaster18: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.coaster18", 480)), // ¥72.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.coaster21", 480)), // ¥72.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.preco.coaster29", 480)), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.narita-tokyo.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-narita",
    nome: "Tóquio → Aeroporto de Narita",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.alphard8", 150)), // ¥22.500
      hiace10: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.hiace10", 180)), // ¥27.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.hiace14", 210)), // ¥31.500
      coaster18: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.coaster18", 480)), // ¥72.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.coaster21", 480)), // ¥72.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.preco.coaster29", 480)), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.tokyo-narita.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "haneda-tokyo",
    nome: "Aeroporto de Haneda → Tóquio",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.alphard8", 120)), // ¥18.000
      hiace10: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.hiace10", 147)), // ¥22.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.hiace14", 180)), // ¥27.000
      coaster18: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.coaster18", 420)), // ¥63.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.coaster21", 420)), // ¥63.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.preco.coaster29", 450)), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.hiace14", 17)), // ¥2.500/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.haneda-tokyo.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-haneda",
    nome: "Tóquio → Aeroporto de Haneda",
    regiao: "kanto",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.alphard8", 96)), // ¥14.400
      hiace10: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.hiace10", 113)), // ¥17.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.hiace14", 180)), // ¥27.000
      coaster18: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.coaster18", 420)), // ¥63.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.coaster21", 420)), // ¥63.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.preco.coaster29", 450)), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.tokyo-haneda.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "dentro-tokyo",
    nome: "Dentro de Tóquio (23 bairros)",
    regiao: "kanto",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.alphard8", 84)), // ¥12.600
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.hiace10", 102)), // ¥15.300
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.hiace14", 180)), // ¥27.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.coaster18", 420)), // ¥63.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.coaster21", 420)), // ¥63.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.preco.coaster29", 450)), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-tokyo.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "tokyo-tour-10h",
    nome: "Tour em Tóquio — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.alphard8", 360)), // ¥54.000
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.hiace10", 390)), // ¥58.500
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.hiace14", 420)), // ¥63.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.coaster18", 600)), // ¥90.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.coaster21", 660)), // ¥99.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.preco.coaster29", 720)), // ¥108.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.tokyo-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "tokyo-yokohama-tour-10h",
    nome: "Tour Tóquio + Yokohama — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.alphard8", 378)), // ¥56.700
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.hiace10", 408)), // ¥61.200
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.hiace14", 450)), // ¥67.500
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.coaster18", 630)), // ¥94.500
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.coaster21", 690)), // ¥103.500
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.preco.coaster29", 750)), // ¥112.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.tokyo-yokohama-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "fuji-hakone-tour-10h",
    nome: "Tour Fuji + Hakone — 10 horas",
    regiao: "kanto",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.alphard8", 390)), // ¥58.500
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.hiace10", 420)), // ¥63.000
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.hiace14", 468)), // ¥70.200
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.coaster18", 660)), // ¥99.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.coaster21", 720)), // ¥108.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.preco.coaster29", 780)), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.fuji-hakone-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "kansai-osaka",
    nome: "Aeroporto de Kansai → Osaka",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.alphard8", 150)), // ¥22.500
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.hiace10", 180)), // ¥27.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.hiace14", 210)), // ¥31.500
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.coaster18", 480)), // ¥72.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.coaster21", 480)), // ¥72.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.preco.coaster29", 480)), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.hiace14", 17)), // ¥2.500/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kansai-osaka.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "osaka-kansai",
    nome: "Osaka → Aeroporto de Kansai",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.alphard8", 150)), // ¥22.500
      hiace10: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.hiace10", 180)), // ¥27.000
      hiace14: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.hiace14", 210)), // ¥31.500
      coaster18: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.coaster18", 480)), // ¥72.000
      coaster21: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.coaster21", 480)), // ¥72.000
      coaster29: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.preco.coaster29", 480)), // ¥72.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.osaka-kansai.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "dentro-osaka",
    nome: "Dentro de Osaka (24 bairros)",
    regiao: "kansai",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.alphard8", 84)), // ¥12.600
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.hiace10", 102)), // ¥15.300
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.hiace14", 180)), // ¥27.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.coaster18", 420)), // ¥63.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.coaster21", 420)), // ¥63.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.preco.coaster29", 450)), // ¥67.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-osaka.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "dentro-kyoto-ou-kyoto-osaka",
    nome: "Dentro de Kyoto, ou Kyoto → Osaka (24 bairros)",
    regiao: "kansai",
    categoria: "dentro-cidade",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.alphard8", 114)), // ¥17.100
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.hiace10", 138)), // ¥20.700
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.hiace14", 180)), // ¥27.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.coaster18", 420)), // ¥63.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.coaster21", 420)), // ¥63.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.preco.coaster29", 447)), // ¥67.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.dentro-kyoto-ou-kyoto-osaka.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "kansai-kyoto",
    nome: "Aeroporto de Kansai → Kyoto",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 90,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.alphard8", 180)), // ¥27.000
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.hiace10", 210)), // ¥31.500
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.hiace14", 240)), // ¥36.000
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.coaster18", 510)), // ¥76.500
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.coaster21", 510)), // ¥76.500
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.preco.coaster29", 510)), // ¥76.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kansai-kyoto.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "kyoto-kansai",
    nome: "Kyoto → Aeroporto de Kansai",
    regiao: "kansai",
    categoria: "transfer-aeroporto",
    minutosLivres: 30,
    precoUSD: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.alphard8", 180)), // ¥27.000
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.hiace10", 210)), // ¥31.500
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.hiace14", 240)), // ¥36.000
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.coaster18", 510)), // ¥76.500
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.coaster21", 510)), // ¥76.500
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.preco.coaster29", 510)), // ¥76.500
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.alphard8", 17)), // ¥2.500/30min
      hiace10: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.hiace10", 17)), // ¥2.500/30min
      hiace14: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.hiace14", 20)), // ¥3.000/30min
      coaster18: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.coaster18", 33)), // ¥5.000/30min
      coaster21: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.coaster21", 33)), // ¥5.000/30min
      coaster29: comMargemTransferAeroporto(P("motorista.rota.kyoto-kansai.overtime.coaster29", 33)), // ¥5.000/30min
    },
  },
  {
    id: "osaka-tour-10h",
    nome: "Tour em Osaka — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.alphard8", 360)), // ¥54.000
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.hiace10", 390)), // ¥58.500
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.hiace14", 420)), // ¥63.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.coaster18", 600)), // ¥90.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.coaster21", 660)), // ¥99.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.preco.coaster29", 720)), // ¥108.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "osaka-kyoto-tour-10h",
    nome: "Tour Osaka + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.alphard8", 390)), // ¥58.500
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.hiace10", 420)), // ¥63.000
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.hiace14", 468)), // ¥70.200
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.coaster18", 660)), // ¥99.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.coaster21", 720)), // ¥108.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.preco.coaster29", 780)), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-kyoto-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "osaka-nara-kyoto-tour-10h",
    nome: "Tour Osaka + Nara + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.alphard8", 390)), // ¥58.500
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.hiace10", 420)), // ¥63.000
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.hiace14", 468)), // ¥70.200
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.coaster18", 660)), // ¥99.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.coaster21", 720)), // ¥108.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.preco.coaster29", 780)), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-nara-kyoto-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "osaka-kobe-kyoto-tour-10h",
    nome: "Tour Osaka + Kobe + Kyoto — 10 horas",
    regiao: "kansai",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.alphard8", 390)), // ¥58.500
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.hiace10", 420)), // ¥63.000
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.hiace14", 468)), // ¥70.200
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.coaster18", 660)), // ¥99.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.coaster21", 720)), // ¥108.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.preco.coaster29", 780)), // ¥117.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.osaka-kobe-kyoto-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
  {
    id: "hiroshima-tour-10h",
    nome: "Tour em Hiroshima — 10 horas",
    regiao: "hiroshima",
    categoria: "tour-dia-inteiro",
    minutosLivres: null,
    precoUSD: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.alphard8", 533)), // ¥80.000
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.hiace10", 600)), // ¥90.000
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.hiace14", 633)), // ¥95.000
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.coaster18", 867)), // ¥130.000
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.coaster21", 933)), // ¥140.000
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.preco.coaster29", 933)), // ¥140.000
    },
    overtimeUSDPor30Min: {
      alphard8: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.alphard8", 33)), // ¥5.000/30min
      hiace10: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.hiace10", 33)), // ¥5.000/30min
      hiace14: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.hiace14", 33)), // ¥5.000/30min
      coaster18: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.coaster18", 67)), // ¥10.000/30min
      coaster21: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.coaster21", 67)), // ¥10.000/30min
      coaster29: comMargemMotoristaPrivado(P("motorista.rota.hiroshima-tour-10h.overtime.coaster29", 67)), // ¥10.000/30min
    },
  },
];

export function encontrarRotaMotorista(id: string): RotaMotorista | null {
  return ROTAS_MOTORISTA.find((r) => r.id === id) ?? null;
}

// Adicionais opcionais do fornecedor — mesma regra de custo+margem,
// ¥3.000 cada (≈ US$20 de custo na cotação de referência).
export const ADICIONAL_MEET_GREET_USD = comMargemMotoristaPrivado(P("motorista.meetGreetCustoUSD", 20)); // ¥3.000
export const ADICIONAL_CADEIRINHA_USD = comMargemMotoristaPrivado(P("motorista.cadeirinhaCustoUSD", 20)); // ¥3.000

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
