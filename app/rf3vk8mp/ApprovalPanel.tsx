"use client";

import { useRef, useState, type ReactElement } from "react";
import Image from "next/image";
import { NaritaGuideContent } from "../components/NaritaGuideContent";

// Painel interativo do roteiro personalizado — mesma lógica visual do Painel
// Interativo usado em /ajisairoteiros (pílulas, abas de dia, tipografia
// Bodoni Moda), mas em tema claro e sem hero.

type Poi = {
  category?: string;
  bairro?: "Sumida" | "Ryogoku";
  title: string;
  description?: string;
  lista?: string[];
  rating?: number;
};

type Gastronomia = {
  subtitulo?: string;
  itens: { nome: string; descricao?: string }[];
};

type Regiao = {
  nome: string;
  descricao: string;
};

type ComprasExclusivas = {
  descricao: string;
  itens: { nome: string; imagem?: string }[];
};

type GradeHorarios = {
  titulo?: string;
  nota?: string;
  itens: {
    horario: string;
    evento: string;
    destaque?: boolean;
    recomendado?: boolean;
    tag?: string;
  }[];
};

type SubAtracao = {
  label?: string;
  titulo: string;
  imagem?: string;
  foco?: "top" | "center" | "bottom";
  descricao?: string;
  pois?: Poi[];
  gastronomia?: Gastronomia;
  opcional?: boolean;
  compacta?: boolean;
};

type LinhaBadge = {
  codigo: string;
  nome: string;
  cor: string;
};

type OpcaoDeslocamento = {
  meio: string;
  tempo: string;
  Icon: (props: { className?: string }) => ReactElement;
  recomendado?: boolean;
  detalhes: string[];
};

type Deslocamento = {
  estacaoOrigem: { nome: string; nomeJapones?: string; distancia?: string };
  linha: LinhaBadge;
  estacaoDestino: { nome: string; nomeJapones?: string };
  opcoes: OpcaoDeslocamento[];
  recomendacao?: string;
};

type Period = {
  label?: string;
  regiao?: Regiao;
  deslocamento?: Deslocamento;
  atracaoPrincipal: string;
  atracaoPrincipalImagem?: string;
  atracaoPrincipalFoco?: "top" | "center" | "bottom";
  atracaoPrincipalCompacta?: boolean;
  detalhesPraticos?: { label: string; valor: string }[];
  pois: Poi[];
  gastronomia?: Gastronomia;
  comprasExclusivas?: ComprasExclusivas;
  subAtracoes?: SubAtracao[];
  gradeHorarios?: GradeHorarios;
};

type TransporteSugerido = {
  linha: string;
  tempo: string;
  recomendacao: string;
};

type AlertaSugerido = {
  titulo: string;
  horario: string;
  mensagem: string;
};

type DayContent = {
  day: number;
  badge?: string;
  city: string;
  date?: string;
  hotel?: "Tokyo 1" | "Kyoto" | "Tokyo 2";
  contexto?: string[];
  travel?: boolean;
  travelNote?: string;
  manha?: Period;
  tarde?: Period;
  transporte?: TransporteSugerido;
  alerta?: AlertaSugerido;
  gradeHorarios?: GradeHorarios;
};

function genericPeriod(): Period {
  return {
    atracaoPrincipal: "Atração Principal",
    pois: [1, 2, 3, 4].map((n) => ({ title: `Ponto de Interesse ${n}` })),
  };
}

const DAY_1: DayContent = {
  day: 1,
  city: "Tokyo",
  date: "05 Mai",
  hotel: "Tokyo 1",
  contexto: [
    "Nesse primeiro dia vamos explorar a parte mais tradicional de Tokyo, visitar o maior templo de Tokyo e conhecer um pouco a história de como Edo se transformou em Tokyo.",
    "Depois vamos para Tokyo Sky Tree, a torre mais alta de Tokyo que vai te ajudar a entender a ter uma visão macro da cidade antes de iniciar sua jornada por diversos bairros nos próximos dias.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      { horario: "08:00", evento: "Café da manhã no lyf Ginza Tokyo" },
      {
        horario: "08:45",
        evento: "Saída do hotel rumo à Estação Kyobashi",
        tag: "Deslocamento",
      },
      {
        horario: "09:00",
        evento: "Metrô até Asakusa · Ginza Line, direto (~16 min)",
        tag: "Deslocamento",
      },
      { horario: "09:20", evento: "Kaminarimon e Nakamise Street" },
      {
        horario: "09:45",
        evento: "Templo Sensoji Asakusa",
        destaque: true,
        tag: "Atração",
      },
      { horario: "11:30", evento: "Kappabashi Kitchen Town e Sumida Park" },
      {
        horario: "12:30",
        evento: "Almoço com snacks de rua em Asakusa",
        tag: "Refeição",
      },
      {
        horario: "14:00",
        evento: "Saída rumo à Estação Takaracho",
        tag: "Deslocamento",
      },
      {
        horario: "14:15",
        evento: "Metrô até Oshiage · Toei Asakusa Line, direto (~14 min)",
        tag: "Deslocamento",
      },
      {
        horario: "14:35",
        evento: "Subida à Tokyo Sky Tree para o pôr do sol",
        destaque: true,
        recomendado: true,
        tag: "Atração",
      },
      {
        horario: "16:30",
        evento: "Tokyo Solamachi · lojas e jantar",
        tag: "Refeição",
      },
      { horario: "19:00", evento: "Retorno ao lyf Ginza Tokyo" },
    ],
    nota: "Horários estimados considerando saída do lyf Ginza Tokyo (Kyobashi) — ajuste conforme seu ritmo.",
  },
  manha: {
    regiao: {
      nome: "Taito",
      descricao:
        "Taito é um dos bairros mais antigos de Tokyo e já era um dos principais quando a cidade ainda era chamada Edo, a fundação do bairro ocorreu por volta do ano 1600, até hoje é um dos bairros da Tokyo Antiga preservando alguns costumes milenares que já foram abandonados em outras partes da cidade, um dos exemplos é que até hoje existem vendedores de leite em garrafa de vidro que passam de casa em casa antes de amanhecer.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700" },
      estacaoDestino: { nome: "Estação Asakusa", nomeJapones: "浅草駅" },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈16 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Ginza Line), sem baldeação.",
            "Embarque a ~1 min a pé do lyf Ginza Tokyo.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15–20 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no período da manhã.",
            "Porta a porta, sem caminhada até a estação.",
          ],
        },
      ],
      recomendacao:
        "Do lyf Ginza Tokyo, o trajeto até Asakusa é de cerca de 16 minutos de metrô pela Ginza Line, sem baldeação — a Estação Kyobashi fica a menos de 1 minuto a pé do hotel.",
    },
    atracaoPrincipal: "Templo Sensoji Asakusa",
    atracaoPrincipalImagem: "/images/dia1-sensoji.png",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Salão principal", valor: "6h–17h" },
      { label: "Nakamise Street", valor: "~9h–17h (varia por loja)" },
      { label: "Melhor horário", valor: "Antes das 9h ou após 17h" },
    ],
    pois: [
      {
        category: "Compras",
        title: "Masamoto Sohonten",
        description:
          "Uma das Top5 melhores fabricantes de faca profissional do Japão, também tem equipe dedicada de afiador profissional para facas de alta complexidade",
        rating: 4,
      },
      {
        title: "Nakamise Street",
        description:
          "Rua Dentro do complexo do Templo Sensoji, focado em souvenir e itens de pequeno porte",
        rating: 3,
      },
      {
        title: "Sumida Park",
        description:
          "Parque as margens do Rio Sumida que corta a parte leste da cidade de Tokyo, vista para a Tokyo Sky Tree",
        rating: 3,
      },
      {
        title: "Kappabashi Kitchen Town",
        description:
          "Avenida com lojas que vendem artigos de cozinha desde utensílios domésticos, louças, comida cenográfica",
        rating: 2,
      },
    ],
    gastronomia: {
      subtitulo: "Grande quantidade de lojas que vendem snacks de rua",
      itens: [
        { nome: "Melon Pan" },
        { nome: "Ningyo-yaki" },
        { nome: "Kibi Dango" },
        { nome: "Senbei feito na hora" },
      ],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Sumida",
      descricao:
        "Sumida é o bairro que abriga a Tokyo Sky Tree (Torre mais alta do Japão) desde 2012, o bairro como o próprio nome diz cresceu as margens do Rio Sumida que antigamente era uma das principais rotas de transporte marítimo de Tokyo.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Takaracho",
        nomeJapones: "宝町駅",
        distancia: "~2 min a pé do hotel",
      },
      linha: { codigo: "A12", nome: "Toei Asakusa Line", cor: "#E85298" },
      estacaoDestino: {
        nome: "Estação Oshiage",
        nomeJapones: "押上駅〈スカイツリー前〉",
      },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈14 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Toei Asakusa Line), sem baldeação.",
            "Embarque a ~2 min a pé do lyf Ginza Tokyo.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15–20 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito; tempo pode variar no horário de pico.",
            "Porta a porta, sem caminhada nem escadas.",
          ],
        },
      ],
      recomendacao:
        "Do lyf Ginza Tokyo, o trajeto até Oshiage é de cerca de 14 minutos de metrô pela Toei Asakusa Line, sem baldeação — a Estação Takaracho fica a ~2 minutos a pé do hotel.",
    },
    atracaoPrincipal: "Tokyo Sky Tree",
    atracaoPrincipalImagem: "/images/dia1-skytree.png",
    detalhesPraticos: [
      { label: "Tembo Deck (350m)", valor: "¥2.100 antecipado / ¥2.400 no dia" },
      { label: "Deck + Galleria", valor: "A partir de ¥3.100" },
      { label: "Horário", valor: "Varia por temporada — conferir site oficial" },
      { label: "Reserva", valor: "Recomendada, especialmente no pôr do sol" },
    ],
    pois: [
      {
        title: "Tokyo Solamachi",
        bairro: "Sumida",
        description: "Shopping aos pés da Skytree, com lojas de franquias japonesas.",
        rating: 5,
        lista: [
          "Pokémon Center Skytree Town",
          "Jump Shop",
          "STRICT-G (Gundam)",
          "Donguri Republic (Studio Ghibli)",
          "Chiikawa Land",
          "Kirby Cafe Tokyo",
          "Ultraman World M78",
        ],
      },
    ],
    gastronomia: {
      subtitulo: "Dentro do complexo Tokyo Solamachi, aos pés da Skytree",
      itens: [
        {
          nome: "Hitsumabushi Bincho",
          descricao: "Enguia (unagi) · 6º andar · ~¥6.000 · 11h–21h",
        },
        {
          nome: "Kaiten Sushi Toriton",
          descricao: "Sushi de esteira · 6º andar · ~¥6.000 · 11h–22h",
        },
      ],
    },
  },
};

const DAY_2: DayContent = {
  day: 7,
  city: "Tokyo",
  date: "11 Mai",
  hotel: "Tokyo 2",
  contexto: [
    "Neste nosso último dia de passeios, visitamos o lado mais comercial do Japão e o centro financeiro. Começamos o passeio com uma visita a Tokyo Station para que você possa ir diretamente à Dragonball Store, que fica dentro do complexo da estação, na mesma área onde existem lojas das principais franquias de anime.",
    "À tarde visitamos os Jardins do Leste do Palácio Imperial (Imperial Palace East Gardens), de entrada gratuita e a poucos minutos a pé da Tokyo Station.",
    "Como é nosso último dia, seguimos direto para o aeroporto depois dos jardins — sem mais compromissos.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      {
        horario: "08:30",
        evento: "Café da manhã e arrumação da bagagem no remm Tokyo Kyobashi",
      },
      {
        horario: "09:15",
        evento: "Caminhada até a Tokyo Station (~10 min)",
        tag: "Deslocamento",
      },
      {
        horario: "09:30",
        evento: "Tokyo Character Street e Dragonball Store",
        destaque: true,
        tag: "Atração",
      },
      { horario: "11:30", evento: "Marunouchi Naka-dori" },
      { horario: "12:00", evento: "Almoço leve na região", tag: "Refeição" },
      {
        horario: "13:00",
        evento: "Caminhada até os Jardins do Palácio Imperial (~10 min)",
        tag: "Deslocamento",
      },
      {
        horario: "13:15",
        evento: "Imperial Palace East Gardens",
        destaque: true,
        tag: "Atração",
      },
      { horario: "15:30", evento: "Retorno ao hotel e retirada da bagagem" },
      {
        horario: "16:30",
        evento: "Deslocamento ao Aeroporto de Haneda (HND)",
        tag: "Deslocamento",
      },
      { horario: "21:00", evento: "Chegada esperada no aeroporto", recomendado: true },
    ],
    nota: "Horários estimados considerando saída do remm Tokyo Kyobashi — o voo decola às 00:05 do dia seguinte pelo Aeroporto de Haneda.",
  },
  alerta: {
    titulo: "Alerta Aeroporto",
    horario: "Horário de Chegada Esperado no Aeroporto: 21:00",
    mensagem:
      "O voo de volta decola às 00:05 (já dia 12) pelo Aeroporto de Haneda (HND). Após os Jardins do Palácio Imperial, retorne ao hotel, busque a bagagem e siga com folga para o aeroporto, com tempo para o check-in internacional.",
  },
  manha: {
    regiao: {
      nome: "Marunouchi",
      descricao:
        "Marunouchi é, desde os tempos feudais, um dos pilares da economia japonesa. Fica nessa região a estação central de trem do Japão, Tokyo Station, que junto da estação de Shinagawa são as únicas com acesso ao trem-bala em Tóquio. Nos arredores da estação você encontrará a sede de praticamente todos os bancos, seguradoras e boa parte das grandes empresas japonesas — o local funciona como a Wall Street ou a Faria Lima do Japão.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "remm Tokyo Kyobashi",
        distancia: "Saindo direto do hotel",
      },
      linha: { codigo: "🚶", nome: "A pé, via Yaesu", cor: "#B96432" },
      estacaoDestino: { nome: "Tokyo Station (saída Yaesu)" },
      opcoes: [
        {
          meio: "A pé",
          tempo: "≈8–10 min",
          Icon: IconWalk,
          recomendado: true,
          detalhes: [
            "Trajeto plano e simples pelo bairro de Kyobashi até a saída Yaesu.",
            "Sem necessidade de metrô para essa distância.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈5 min",
          Icon: IconCar,
          detalhes: [
            "Útil se estiver com bagagem de mão pesada.",
            "Distância curta — pouca vantagem sobre caminhar.",
          ],
        },
      ],
      recomendacao:
        "O remm Tokyo Kyobashi fica a cerca de 8 a 10 minutos a pé da Tokyo Station (saída Yaesu) — não é necessário pegar metrô para esse trecho.",
    },
    atracaoPrincipal: "Tokyo Station",
    atracaoPrincipalImagem: "/images/dia2-tokyostation.png",
    detalhesPraticos: [
      { label: "Tokyo Character Street", valor: "~10h–20h30" },
      { label: "Melhor horário", valor: "Manhã, antes das aglomerações" },
      { label: "Pagamento", valor: "Cartão aceito na maioria das lojas" },
    ],
    pois: [
      {
        category: "Compras",
        title: "Dragonball Store",
        description:
          "Dentro do complexo da estação (Tokyo Station First Avenue), na Tokyo Character Street — corredor com mais de 10 lojas de outras franquias de anime.",
        lista: [
          "Jump Shop",
          "Pokémon Store",
          "Kirby Café",
          "Ghibli Shop",
          "Tomica Shop",
          "Rilakkuma Store",
        ],
        rating: 5,
      },
      {
        title: "Marunouchi Naka-dori",
        description:
          "Rua arborizada com cafés e restaurantes que alimentam os escritórios financeiros da região.",
        rating: 2,
      },
    ],
    gastronomia: {
      subtitulo: "Grande quantidade de lojas que vendem snacks de rua",
      itens: [
        {
          nome: "Musk Melon",
          descricao:
            "Melão que só existe no Japão — mais suculento que o nosso, e esverdeado em vez de amarelo.",
        },
      ],
    },
  },
  tarde: {
    regiao: {
      nome: "Chiyoda",
      descricao:
        "Bairro central onde fica o Palácio Imperial, residência da família imperial japonesa, erguido sobre as ruínas do antigo Castelo de Edo — a poucos minutos a pé de Tokyo Station.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Tokyo Station (saída Marunouchi)" },
      linha: { codigo: "🚶", nome: "A pé, via Otemon Gate", cor: "#B96432" },
      estacaoDestino: { nome: "Imperial Palace East Gardens" },
      opcoes: [
        {
          meio: "A pé",
          tempo: "≈10 min",
          Icon: IconWalk,
          recomendado: true,
          detalhes: [
            "Caminhada plana pela saída Marunouchi até o portão Otemon.",
            "Sem necessidade de metrô para essa distância.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈5 min",
          Icon: IconCar,
          detalhes: [
            "Distância curta — pouca vantagem sobre caminhar.",
            "Útil em dias de chuva.",
          ],
        },
      ],
      recomendacao:
        "Da Tokyo Station até a entrada dos Jardins do Palácio Imperial (portão Otemon) são cerca de 10 minutos a pé — não é necessário transporte para esse trecho.",
    },
    atracaoPrincipal: "Imperial Palace East Gardens",
    atracaoPrincipalImagem: "/images/imperial-palace-east-gardens.png",
    atracaoPrincipalFoco: "center",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Horário", valor: "9h–18h (maio)" },
      { label: "Fechado", valor: "Segundas e sextas-feiras" },
    ],
    pois: [
      {
        title: "Fujimi-yagura",
        description:
          "Torre de vigia construída em 1659, uma das poucas estruturas originais remanescentes do Castelo de Edo — depois que o incêndio de 1657 destruiu a torre principal, passou a funcionar como sua substituta simbólica. Não é possível entrar, mas dá para ver de fora, dentro dos jardins. Uma das construções mais fotogênicas do local.",
        rating: 4,
      },
      {
        title: "Otemon Gate",
        description:
          "Antigo portão principal do Castelo de Edo, usado pelos daimyō em suas visitas oficiais ao shogun. Destruído em bombardeio aéreo em 1945 e reconstruído em 1967 — hoje é a entrada principal dos jardins.",
        rating: 4,
      },
      {
        title: "Tenshudai",
        description:
          "Enorme base de pedra onde ficava a torre principal (tenshu) do Castelo de Edo — pode ser escalada, e é um dos pontos mais impressionantes dos jardins.",
        rating: 4,
      },
      {
        title: "Muralhas e Fossos Originais",
        description:
          "Trechos originais das muralhas de pedra e fossos que protegiam o Castelo de Edo, preservados desde o período feudal.",
        rating: 3,
      },
      {
        title: "Bansho (Casas de Guarda)",
        description:
          "Uma das três casas de guarda samurai que sobrevivem do Castelo de Edo — o Hyakunin Bansho abrigava quatro unidades de 120 guardas responsáveis pela proteção do recinto interno do castelo.",
        rating: 3,
      },
    ],
  },
};

const DAY_3: DayContent = {
  day: 3,
  city: "Tokyo",
  date: "07 Mai",
  hotel: "Tokyo 1",
  contexto: [
    "O superdistrito de Shibuya é um dos bairros mais famosos, principalmente pela Shibuya Crossing e pela impressionante floresta erguida do zero que tem no centro o maior templo Shintoísta do mundo. Nessa região encontraremos Harajuku, o epicentro da cultura Lolita, Kawaii e Jovem do Japão, bem como a luxuosa avenida de Omotesando.",
    "À tarde seguimos para Shinjuku, bairro que mistura o Japão corporativo com o mais boêmio — do mirante gratuito do Prédio do Governo Metropolitano ao caos neon de Kabukicho, passando pelas vielas de Golden Gai. Relaxamos no onsen urbano Thermae-Yu antes de seguir para a estação e pegar o trem noturno rumo a Kyoto.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      { horario: "08:30", evento: "Café da manhã no lyf Ginza Tokyo" },
      {
        horario: "09:15",
        evento: "Saída do hotel rumo à Estação Kyobashi",
        tag: "Deslocamento",
      },
      {
        horario: "09:30",
        evento: "Metrô até Omotesando · Ginza Line, direto (~16 min)",
        tag: "Deslocamento",
      },
      {
        horario: "10:00",
        evento: "Meiji Jingu e Parque de Yoyogi",
        destaque: true,
        tag: "Atração",
      },
      { horario: "12:00", evento: "Shibuya Crossing e Estátua de Hachiko" },
      {
        horario: "13:00",
        evento: "Almoço no Kaitenzushi Ginza Onodera",
        tag: "Refeição",
      },
      {
        horario: "14:30",
        evento: "Deslocamento até Shinjuku · JR Yamanote Line (~5 min)",
        tag: "Deslocamento",
      },
      {
        horario: "14:45",
        evento: "Mirante do Governo Metropolitano e Kabukicho",
        tag: "Atração",
      },
      {
        horario: "19:00",
        evento: "Bares em Golden Gai",
        destaque: true,
        tag: "Refeição",
      },
      { horario: "21:00", evento: "Onsen urbano Thermae-Yu" },
      {
        horario: "23:00",
        evento: "Deslocamento até a estação para o trem noturno rumo a Kyoto",
      },
    ],
    nota: "Horários estimados considerando saída do lyf Ginza Tokyo (Kyobashi) — ajuste conforme seu ritmo.",
  },
  manha: {
    regiao: {
      nome: "Superdistrito de Shibuya",
      descricao:
        "Aqui iremos explorar o superdistrito de Shibuya, que compreende as áreas de Yoyogi, Omotesando e Harajuku.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700" },
      estacaoDestino: { nome: "Estação Omotesando", nomeJapones: "表参道駅" },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈16 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Ginza Line), sem baldeação — a mesma linha do hotel.",
            "Da estação, ~8 min a pé até a entrada do Parque de Yoyogi.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈20–25 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no período da manhã.",
            "Porta a porta, sem caminhada até a estação.",
          ],
        },
      ],
      recomendacao:
        "Do lyf Ginza Tokyo, o trajeto até Omotesando é de cerca de 16 minutos de metrô pela Ginza Line, sem baldeação — a mesma linha que passa pela Estação Kyobashi, a menos de 1 minuto a pé do hotel.",
    },
    atracaoPrincipal: "Meiji Jingu",
    atracaoPrincipalImagem: "/images/dia3-meijijingu.png",
    detalhesPraticos: [
      { label: "Entrada (terreno principal)", valor: "Gratuita" },
      { label: "Jardim Interior", valor: "¥500" },
      { label: "Horário", valor: "Nascer ao pôr do sol (~5h–18h em maio)" },
    ],
    pois: [
      {
        title: "Parque de Yoyogi",
        description:
          "Você precisa entrar nele para acessar o Meiji Jingu — trata-se de uma enorme floresta com árvores extremamente altas, erguida do zero em homenagem à morte do imperador Meiji.",
        rating: 5,
      },
      {
        title: "Shibuya Crossing",
        description:
          "O famoso cruzamento hexagonal de Shibuya, que fica caótico às 18h.",
        rating: 4,
      },
      {
        title: "Estátua de Hachiko",
        description:
          "Estátua em homenagem ao cão que continuou esperando seu dono voltar para casa sem saber que ele havia falecido — deu origem ao filme \"Pra Sempre ao Seu Lado\".",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Omotesando",
        description:
          "Uma das maiores avenidas de boutiques e lojas de luxo de Tóquio, com diversos cafés e restaurantes importantes nas ruas ao redor da avenida principal.",
        rating: 3,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Kaitenzushi Ginza Onodera",
          descricao: "Sushi de esteira, considerado por muitos o melhor de Tóquio.",
        },
      ],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Shinjuku",
      descricao:
        "Bairro que reúne o maior terminal ferroviário do mundo, arranha-céus corporativos, o distrito de entretenimento de Kabukicho e algumas das vielas mais icônicas de Tóquio — um contraste denso entre o Japão corporativo e o mais boêmio.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Estação Harajuku", nomeJapones: "原宿駅" },
      linha: { codigo: "JY", nome: "JR Yamanote Line", cor: "#8FAADC" },
      estacaoDestino: { nome: "Estação Shinjuku", nomeJapones: "新宿駅" },
      opcoes: [
        {
          meio: "Trem JR",
          tempo: "≈5 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Yamanote Line), sem baldeação.",
            "Harajuku fica a poucos minutos a pé do Parque de Yoyogi.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15–20 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no início da tarde.",
            "Porta a porta, sem caminhada até a estação.",
          ],
        },
      ],
      recomendacao:
        "De Harajuku até Shinjuku são cerca de 5 minutos de trem pela JR Yamanote Line, sem baldeação — uma das linhas mais frequentes de Tóquio.",
    },
    atracaoPrincipal: "Bairro de Shinjuku",
    atracaoPrincipalImagem: "/images/draft-shinjuku.png",
    detalhesPraticos: [
      { label: "Mirante do Governo Metropolitano", valor: "Gratuito · ~9h30–22h" },
      { label: "Golden Gai", valor: "Maioria dos bares abre após 20h" },
      { label: "Thermae-Yu", valor: "Aberto 24h" },
    ],
    atracaoPrincipalFoco: "center",
    pois: [
      {
        title: "Estátua do Godzilla",
        description:
          "Réplica em tamanho real na varanda do Hotel Gracery, símbolo do distrito de entretenimento de Kabukicho.",
        rating: 4,
      },
      {
        title: "Gato 3D Gigante",
        description:
          "Gato tridimensional gigante exibido em telão curvo no edifício Cross Shinjuku Vision, na saída leste da estação — uma das atrações mais fotografadas do bairro.",
        rating: 4,
      },
      {
        title: "Kabukicho",
        description:
          "Maior distrito de entretenimento noturno de Tóquio, com neons, bares temáticos e vida noturna intensa.",
        rating: 4,
      },
      {
        title: "Golden Gai",
        description:
          "Rede de vielas estreitas com mais de 200 bares minúsculos, a maioria com capacidade para menos de 10 pessoas.",
        rating: 5,
      },
      {
        title: "Prédio do Governo Metropolitano de Tóquio + Mirante",
        description:
          "Torres gêmeas projetadas por Kenzo Tange com mirante gratuito no 45º andar e vista panorâmica da cidade — em dias claros, dá para ver o Monte Fuji.",
        rating: 4,
      },
      {
        title: "Shinjuku Gyoen",
        description:
          "Um dos parques mais bonitos de Tóquio, misturando jardins japonês, francês e inglês — refúgio verde no meio do bairro mais denso da cidade.",
        rating: 4,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Bar temático em Golden Gai",
          descricao:
            "Cada bar tem uma curadoria própria de temática e trilha sonora — vale entrar em mais de um.",
        },
      ],
    },
    subAtracoes: [
      {
        label: "Tarde",
        titulo: "Thermae-Yu",
        imagem: "/images/thermae-yu.png",
        foco: "center",
        descricao:
          "Onsen urbano aberto 24 horas no coração de Kabukicho, ao lado do Golden Gai — água termal natural trazida diariamente de Nakaizu (famosa pelas propriedades para a pele), com banhos internos e ao ar livre, banho carbonatado, saunas e, na temporada quente, deck na cobertura.",
      },
    ],
  },
  transporte: {
    linha: "Shinkansen Tokyo–Kyoto",
    tempo: "Hikari: ~2h40 (incluso no JR Pass)",
    recomendacao:
      "Recomendamos pegar o trem para Kyoto ainda nesta noite, após o onsen Thermae-Yu, para aproveitar o Kiyomizu-dera logo cedo no dia seguinte, antes das aglomerações.",
  },
};

const DAY_4: DayContent = {
  day: 2,
  city: "Tokyo",
  date: "06 Mai",
  hotel: "Tokyo 1",
  contexto: [
    "Neste dia começamos por Akihabara, epicentro da cultura de Animes & Mangá, Videogames e Artigos Eletrônicos.",
    "À tarde seguimos para Kanda, bairro vizinho conhecido pelos izakayas e por uma vida noturna mais local, longe do circuito turístico, para jantar num izakaya autêntico.",
    "À noite fechamos o dia em Roppongi, um dos principais polos de vida noturna de Tóquio, com baladas e bares badalados.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      { horario: "08:30", evento: "Café da manhã no lyf Ginza Tokyo" },
      {
        horario: "09:15",
        evento: "Saída do hotel rumo à Estação Kyobashi",
        tag: "Deslocamento",
      },
      {
        horario: "09:30",
        evento: "Metrô até Akihabara · Ginza Line + baldeação p/ Hibiya Line (~11 min)",
        tag: "Deslocamento",
      },
      {
        horario: "09:45",
        evento: "Akihabara Electric Town",
        destaque: true,
        tag: "Atração",
      },
      {
        horario: "12:30",
        evento: "Almoço com curry japonês em Akihabara",
        tag: "Refeição",
      },
      {
        horario: "14:00",
        evento: "Deslocamento até Kanda (poucos minutos, trem local)",
        tag: "Deslocamento",
      },
      { horario: "14:15", evento: "Passeio por Kanda", tag: "Atração" },
      {
        horario: "19:00",
        evento: "Jantar num izakaya autêntico em Kanda",
        destaque: true,
        recomendado: true,
        tag: "Refeição",
      },
      {
        horario: "21:30",
        evento: "Deslocamento até Roppongi para a vida noturna (opcional)",
      },
    ],
    nota: "Horários estimados considerando saída do lyf Ginza Tokyo (Kyobashi) — ajuste conforme seu ritmo.",
  },
  manha: {
    regiao: {
      nome: "Akihabara",
      descricao:
        "Bairro de Chiyoda conhecido como o centro mundial da cultura otaku, com lojas de eletrônicos, anime, mangá e videogame concentradas em poucas quadras.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700" },
      estacaoDestino: { nome: "Estação Akihabara", nomeJapones: "秋葉原駅" },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈11 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Ginza Line até Ueno-hirokoji (~8 min) + baldeação a pé até a Hibiya Line (1 estação, ~3 min).",
            "Uma baldeação simples, bem sinalizada.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15–20 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no período da manhã.",
            "Porta a porta, sem baldeação.",
          ],
        },
      ],
      recomendacao:
        "Do lyf Ginza Tokyo, o trajeto até Akihabara é de cerca de 11 minutos: Ginza Line até Ueno-hirokoji e uma baldeação curta a pé para a Hibiya Line.",
    },
    atracaoPrincipal: "Akihabara Electric Town",
    atracaoPrincipalImagem: "/images/dia7-akihabara.png",
    detalhesPraticos: [
      { label: "Horário das lojas", valor: "~10h–20h (maioria)" },
      { label: "Melhor horário", valor: "Manhã, antes das aglomerações" },
      { label: "Pagamento", valor: "Muitas lojas aceitam cartão" },
    ],
    pois: [
      {
        category: "Compras",
        title: "Animate",
        description: "Uma das maiores redes de lojas de mangá do Japão.",
        rating: 4,
      },
      {
        category: "Compras",
        title: "Super Potato",
        description:
          "Loja retrô de videogames — nas proximidades também fica a Suruga-ya Anime & Hobby Store, com videogames e itens de anime.",
        rating: 4,
      },
      {
        category: "Compras",
        title: "Mandarake Complex",
        description: "Mangá e action figures.",
        rating: 4,
      },
      {
        category: "Compras",
        title: "Akihabara Radio Kaikan",
        description: "Action figures e um shopping com um pouco de tudo.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Ark",
        description: "Peças de computador.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Hareruya 2",
        description: "Pokémon Trading Card Game.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "BIC Camera ou Yodobashi Camera",
        description: "Grandes lojas de eletrônicos.",
        rating: 3,
      },
      {
        category: "Curiosidade",
        title: "Weird Vending Machine Corner",
        description: "Cantinho com máquinas de venda automática bizarras e inusitadas, um clássico despretensioso de Akihabara.",
        rating: 2,
      },
    ],
    gastronomia: {
      itens: [{ nome: "Curry Japonês" }],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Kanda",
      descricao:
        "Bairro tradicional de Chiyoda, vizinho a Akihabara — conhecido pelos izakayas e por uma vida noturna mais local, longe do circuito turístico.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Estação Akihabara", nomeJapones: "秋葉原駅" },
      linha: { codigo: "JY", nome: "JR Yamanote / Keihin-Tohoku Line", cor: "#8FAADC" },
      estacaoDestino: { nome: "Estação Kanda", nomeJapones: "神田駅" },
      opcoes: [
        {
          meio: "Trem JR",
          tempo: "≈2 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Uma estação de distância, sem baldeação.",
            "Alternativa: ~15 min a pé, se preferir caminhar.",
          ],
        },
        {
          meio: "A pé",
          tempo: "≈15 min",
          Icon: IconWalk,
          detalhes: [
            "Trajeto simples e plano entre os dois bairros.",
            "Boa opção se quiser ver as ruas no caminho.",
          ],
        },
      ],
      recomendacao:
        "Akihabara e Kanda são bairros vizinhos — uma estação de trem (~2 min) ou uma caminhada tranquila de ~15 min.",
    },
    atracaoPrincipal: "Izakaya em Kanda (酒場なごみ堂)",
    atracaoPrincipalImagem: "/images/dia7-izakaya-kanda-v2.png",
    detalhesPraticos: [
      { label: "Melhor horário", valor: "A partir das 18h" },
      { label: "Reserva", valor: "Recomendada nos fins de semana" },
      { label: "Preço médio", valor: "~¥4.000–6.000 por pessoa" },
    ],
    pois: [
      { title: "Osusumeya Kanda", rating: 5 },
      { title: "Yakitori Izakaya Kanda-syouten", rating: 5 },
      { title: "Izakaya Genki Kanda", rating: 5 },
      { title: "Robatayaki HOTARU", rating: 5 },
    ],
    gastronomia: {
      itens: [
        { nome: "Yakitori", descricao: "Espetinhos de frango grelhados no carvão, clássico de todo izakaya." },
        { nome: "Karaage", descricao: "Frango frito marinado em molho de soja e gengibre." },
        { nome: "Sashimi Moriawase", descricao: "Seleção de sashimis variados do dia." },
        { nome: "Motsu Nikomi", descricao: "Ensopado de vísceras de porco cozidas lentamente com missô ou molho de soja." },
        { nome: "Tamagoyaki", descricao: "Omelete japonesa levemente adocicada, enrolada em camadas." },
      ],
    },
    subAtracoes: [
      {
        label: "Noite",
        titulo: "R3 Club Lounge ou V2 Tokyo (Roppongi)",
        imagem: "/images/dia4-roppongi.png",
        descricao:
          "Bairro badalado de Tóquio que reúne o Mori Tower, seus museus e jardins, e a vida noturna de Roppongi — principal polo de baladas e bares da cidade.",
        pois: [
          {
            title: "Museu de Arte Moderna Mori",
            description: "Museu de arte contemporânea no topo do Mori Tower.",
            rating: 4,
          },
          {
            title: "Aranha Gigante de Louise Bourgeois",
            description:
              "A única no mundo preparada para terremotos, aos pés do Mori Tower.",
            rating: 3,
          },
          {
            title: "Mori Garden",
            description: "Jardim japonês tradicional aos pés do Mori Tower.",
            rating: 3,
          },
          {
            title: "Hinokicho Park",
            description: "Parque tranquilo no coração de Roppongi.",
            rating: 2,
          },
        ],
        gastronomia: {
          itens: [
            {
              nome: "Tonkatsu",
              descricao: "Sugestão: Butagumi Shokudou ou Imakatsu Roppongi.",
            },
          ],
        },
      },
    ],
  },
};

const DAY_5: DayContent = {
  day: 4,
  city: "Kyoto",
  date: "08 Mai",
  hotel: "Kyoto",
  contexto: [
    "Se Tóquio é sinônimo de modernidade e tecnologia mesclada à parte cultural, Kyoto é um patrimônio histórico. Nesses dois dias iremos visitar 3 dos principais pontos turísticos do Japão: Kiyomizu-dera + Gion, Kinkaku-ji e Fushimi-Inari Taisha.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      {
        horario: "08:00",
        evento: "Café da manhã no Daiwa Roynet Hotel Kyoto-Ekimae",
      },
      {
        horario: "08:45",
        evento: "Ônibus 100/206 até Kiyomizu-dera",
        tag: "Deslocamento",
      },
      {
        horario: "09:15",
        evento: "Desembarque e caminhada até o templo (~10 min subindo)",
        tag: "Deslocamento",
      },
      {
        horario: "09:30",
        evento: "Templo Kiyomizu-dera",
        destaque: true,
        tag: "Atração",
      },
      { horario: "11:00", evento: "Ninenzaka e Sannenzaka" },
      {
        horario: "12:00",
        evento: "Chá e doces tradicionais (matcha, yatsuhashi)",
        tag: "Refeição",
      },
      {
        horario: "13:30",
        evento: "Caminhada até Gion (~15–20 min pelas ladeiras históricas)",
        tag: "Deslocamento",
      },
      {
        horario: "14:00",
        evento: "Distrito de Gion, Yasaka Shrine e Pontocho",
        tag: "Atração",
      },
      {
        horario: "19:00",
        evento: "Jantar kaiseki ou obanzai",
        destaque: true,
        recomendado: true,
        tag: "Refeição",
      },
    ],
    nota: "Horários estimados considerando saída do Daiwa Roynet Hotel Kyoto-Ekimae (em frente à Kyoto Station) — ajuste conforme seu ritmo.",
  },
  manha: {
    regiao: {
      nome: "Higashiyama",
      descricao:
        "Bairro aos pés das colinas do leste de Kyoto, preservado desde o período Edo — reúne o Kiyomizu-dera e as ladeiras históricas de Ninenzaka e Sannenzaka.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Kyoto Station (saída Karasuma)",
        distancia: "~1 min a pé do hotel",
      },
      linha: { codigo: "100", nome: "Kyoto City Bus 100 / 206", cor: "#2E7D32" },
      estacaoDestino: { nome: "Parada Gojozaka ou Kiyomizu-michi" },
      opcoes: [
        {
          meio: "Ônibus",
          tempo: "≈20 min",
          Icon: IconBus,
          recomendado: true,
          detalhes: [
            "Ônibus 100 ou 206, direto — depois ~10 min a pé subindo até o templo.",
            "Compre o Kyoto City Bus one-day pass se for usar ônibus várias vezes no dia.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15 min",
          Icon: IconCar,
          detalhes: [
            "Mais rápido e sem pé no ladeira, mas sujeito a trânsito.",
            "Táxi não chega à porta do templo — últimos minutos são a pé de qualquer forma.",
          ],
        },
      ],
      recomendacao:
        "Do Daiwa Roynet Hotel Kyoto-Ekimae, em frente à Kyoto Station, o ônibus 100 ou 206 leva cerca de 20 minutos até Gojozaka ou Kiyomizu-michi — de lá são mais 10 minutos a pé subindo até o templo. Chegar por volta das 9h ajuda a evitar as aglomerações do meio da manhã.",
    },
    atracaoPrincipal: "Templo Kiyomizu-dera",
    atracaoPrincipalImagem: "/images/dia5-kiyomizudera.jpg",
    detalhesPraticos: [
      { label: "Entrada", valor: "¥500 (adultos)" },
      { label: "Horário", valor: "6h–18h (aprox., varia por temporada)" },
      { label: "Melhor horário", valor: "Logo na abertura, 6h" },
    ],
    pois: [
      {
        title: "Ninenzaka",
        description: "Ladeira histórica de casas tradicionais.",
        rating: 4,
      },
      {
        title: "Sannenzaka",
        description: "Continuação de Ninenzaka, rumo ao templo.",
        rating: 4,
      },
    ],
    gastronomia: {
      itens: [
        { nome: "Matcha de Uji" },
        { nome: "Yatsuhashi" },
        { nome: "Dengaku" },
      ],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Gion",
      descricao:
        "O distrito de gueixas mais famoso do Japão, com casas de chá tradicionais, o Santuário Yasaka e a viela de Pontocho às margens do rio Kamo.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Kiyomizu-dera / Sannenzaka" },
      linha: { codigo: "🚶", nome: "A pé, pelas ladeiras históricas", cor: "#B96432" },
      estacaoDestino: { nome: "Gion / Yasaka Shrine" },
      opcoes: [
        {
          meio: "A pé",
          tempo: "≈15–20 min",
          Icon: IconWalk,
          recomendado: true,
          detalhes: [
            "Descendo por Sannenzaka e Ninenzaka até Yasaka-dori — o trajeto mais tradicional entre as duas regiões.",
            "Sem necessidade de ônibus ou trem — Kiyomizu-dera e Gion são vizinhos.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈8–10 min",
          Icon: IconCar,
          detalhes: [
            "Mais rápido, mas perde as ladeiras históricas no caminho.",
            "Útil em dias de chuva ou calor intenso.",
          ],
        },
      ],
      recomendacao:
        "Kiyomizu-dera e Gion são vizinhos — a caminhada de 15 a 20 minutos por Sannenzaka e Ninenzaka é parte da experiência, com lojas e casas de chá tradicionais no caminho.",
    },
    atracaoPrincipal: "Distrito de Gion",
    atracaoPrincipalImagem: "/images/dia5-gion-v2.png",
    detalhesPraticos: [
      { label: "Yasaka Shrine", valor: "Entrada gratuita, aberto 24h" },
      { label: "Melhor horário", valor: "Fim de tarde, início da noite" },
      { label: "Pontocho", valor: "Restaurantes abrem a partir das 17h–18h" },
    ],
    pois: [
      {
        title: "Yasaka Shrine",
        description: "Santuário xintoísta símbolo de Gion.",
        rating: 3,
      },
      {
        title: "Pontocho",
        description: "Viela tradicional de restaurantes e gueixas.",
        rating: 4,
      },
    ],
    gastronomia: {
      itens: [{ nome: "Kaiseki" }, { nome: "Obanzai" }],
    },
  },
};

const DAY_6: DayContent = {
  day: 5,
  city: "Kyoto",
  date: "09 Mai",
  hotel: "Kyoto",
  contexto: [
    "No segundo dia em Kyoto, começamos cedo no Santuário Fushimi Inari para aproveitar o famoso corredor de milhares de torii antes das aglomerações. À tarde seguimos para o Kinkaku-ji, o Pavilhão Dourado, e aproveitamos para conhecer outros templos e cafés da região norte da cidade.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      {
        horario: "07:30",
        evento: "Café da manhã cedo no Daiwa Roynet Hotel Kyoto-Ekimae",
      },
      {
        horario: "08:00",
        evento: "Trem até Fushimi Inari · JR Nara Line, direto (~5 min)",
        tag: "Deslocamento",
      },
      {
        horario: "08:15",
        evento: "Santuário Fushimi Inari e corredor de torii",
        destaque: true,
        recomendado: true,
        tag: "Atração",
      },
      { horario: "10:30", evento: "Retorno à Kyoto Station" },
      {
        horario: "11:00",
        evento: "Inari-zushi ou Kitsune Udon",
        tag: "Refeição",
      },
      {
        horario: "12:00",
        evento: "Deslocamento até Kinkaku-ji via Kyoto Station + ônibus (~45–50 min)",
        tag: "Deslocamento",
      },
      {
        horario: "13:00",
        evento: "Kinkaku-ji, o Pavilhão Dourado",
        destaque: true,
        tag: "Atração",
      },
      { horario: "14:30", evento: "Ryoan-ji, Museu do Mangá e Nintendo Store" },
      {
        horario: "19:00",
        evento: "Jantar com unagi-don",
        tag: "Refeição",
      },
    ],
    nota: "Horários estimados considerando saída do Daiwa Roynet Hotel Kyoto-Ekimae (em frente à Kyoto Station) — chegar cedo em Fushimi Inari é o que mais compensa nesse dia.",
  },
  manha: {
    regiao: {
      nome: "Fushimi",
      descricao:
        "Bairro ao sul de Kyoto, historicamente ligado à produção de saquê — hoje conhecido principalmente pelos milhares de torii do Santuário Fushimi Inari.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Kyoto Station",
        distancia: "~1 min a pé do hotel",
      },
      linha: { codigo: "JR", nome: "JR Nara Line", cor: "#00A650" },
      estacaoDestino: { nome: "Estação Inari", nomeJapones: "稲荷駅" },
      opcoes: [
        {
          meio: "Trem JR",
          tempo: "≈5 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (JR Nara Line, trem local), sem baldeação.",
            "A estação Inari fica literalmente na entrada do santuário.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈10 min",
          Icon: IconCar,
          detalhes: [
            "Rápido, mas sem vantagem real sobre o trem direto.",
            "Útil fora do horário de funcionamento do trem local.",
          ],
        },
      ],
      recomendacao:
        "Do Daiwa Roynet Hotel Kyoto-Ekimae, em frente à Kyoto Station, o trem local da JR Nara Line leva cerca de 5 minutos até a Estação Inari — que fica na entrada do santuário. Importante: apenas trens locais param em Inari, expressos não param.",
    },
    atracaoPrincipal: "Fushimi-Inari Taisha",
    atracaoPrincipalImagem: "/images/dia6-fushimiinari.png",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Horário", valor: "Aberto 24h" },
      { label: "Melhor horário", valor: "Antes das 9h, para evitar aglomerações" },
    ],
    pois: [],
    gastronomia: {
      itens: [{ nome: "Inari-zushi" }, { nome: "Kitsune Udon" }],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Kinkaku-ji (Kitayama)",
      descricao:
        "Região arborizada ao norte de Kyoto, onde fica o Pavilhão Dourado — um dos templos mais fotografados do Japão.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Kyoto Station" },
      linha: { codigo: "101", nome: "Kyoto City Bus 101 / 205", cor: "#2E7D32" },
      estacaoDestino: { nome: "Parada Kinkakuji-michi" },
      opcoes: [
        {
          meio: "Trem + Ônibus",
          tempo: "≈45–50 min",
          Icon: IconBus,
          recomendado: true,
          detalhes: [
            "JR Nara Line de volta a Kyoto Station (~5 min) + ônibus 101 ou 205 até Kinkakuji-michi (~40 min).",
            "Compre o Kyoto City Bus one-day pass se ainda não tiver.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈16–20 min",
          Icon: IconCar,
          detalhes: [
            "Trajeto direto, cruzando a cidade sem baldeação.",
            "Vale a pena se estiver com o grupo ou com pressa entre os dois templos.",
          ],
        },
      ],
      recomendacao:
        "Fushimi Inari e Kinkaku-ji ficam em lados opostos de Kyoto — o caminho mais prático é retornar a Kyoto Station e seguir de ônibus (101 ou 205), cerca de 45 a 50 minutos no total. De táxi, o trajeto direto cai para 16 a 20 minutos.",
    },
    atracaoPrincipal: "Kinkaku-ji",
    atracaoPrincipalImagem: "/images/dia6-kinkakuji.png",
    detalhesPraticos: [
      { label: "Entrada", valor: "¥500 (adultos)" },
      { label: "Horário", valor: "9h–17h, todos os dias" },
      { label: "Pagamento", valor: "Somente dinheiro na bilheteria" },
    ],
    pois: [
      {
        title: "Museu do Mangá de Kyoto",
        description: "Acervo com milhares de títulos de mangá.",
        rating: 3,
      },
      {
        title: "Nintendo Store Kyoto",
        description: "A Nintendo fica localizada em Kyoto.",
        rating: 3,
      },
      {
        title: "Ryoan-ji",
        description: "Templo zen famoso pelo jardim de pedras.",
        rating: 4,
      },
      {
        title: "Ninna-ji",
        description: "Templo histórico com belas cerejeiras.",
        rating: 2,
      },
      {
        title: "Café % Arabica Kyoto",
        description: "Cafeteria minimalista muito concorrida.",
        rating: 2,
      },
    ],
    gastronomia: {
      itens: [{ nome: "Unagi-don", descricao: "Enguia grelhada sobre arroz." }],
    },
  },
  transporte: {
    linha: "Shinkansen Kyoto–Tokyo",
    tempo: "Hikari: ~2h40 (incluso no JR Pass)",
    recomendacao:
      "Diferente dos outros trechos, recomendamos pegar o trem ainda à noite, ao final deste dia, e não pela manhã seguinte — as lutas das categorias inferiores do Grand Sumo Tournament no dia 10 já começam às 8h40, e chegar em cima da hora vindo de Kyoto tiraria a opção de aproveitar o dia inteiro no Kokugikan.",
  },
};

const DAY_7: DayContent = {
  day: 6,
  city: "Tokyo",
  date: "10 Mai",
  hotel: "Tokyo 2",
  contexto: [
    "Saímos do hotel em Kyobashi às 9h30, rumo a Ningyocho — bairro do shitamachi (baixa cidade) de Tóquio que preserva o traçado de ruas mais antigo da região central, já que escapou quase intacto do Grande Terremoto de 1923 e dos bombardeios da Segunda Guerra.",
    "O dia 10 de maio é um dos dias do Grand Sumo Tournament de Tóquio em maio de 2027 (torneio completo de 9 a 23 de maio) — a venda dos ingressos para o torneio começa dia 10 de abril de 2027.",
    "O ingresso vale para o dia inteiro no Kokugikan, em Ryogoku: as lutas das categorias inferiores começam já às 8h40, mas o grande destaque — a cerimônia de entrada e as lutas da divisão principal (Makuuchi) — só acontece a partir das 15h45, indo até por volta das 18h.",
    "Recomendamos chegar ao Kokugikan no início da tarde, por volta das 14h30, a tempo da cerimônia de entrada da segunda divisão e para garantir um bom lugar antes do início da divisão principal.",
  ],
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      { horario: "08:30", evento: "Café da manhã no remm Tokyo Kyobashi" },
      {
        horario: "09:15",
        evento: "Saída do hotel rumo à Estação Takaracho",
        tag: "Deslocamento",
      },
      {
        horario: "09:30",
        evento: "Metrô até Ningyocho · Toei Asakusa Line, direto (~5 min)",
        tag: "Deslocamento",
      },
      {
        horario: "09:45",
        evento: "Passeio a pé por Ningyocho — doçarias, Amazake Yokocho e Suitengu",
        destaque: true,
        tag: "Atração",
      },
      {
        horario: "12:30",
        evento: "Almoço em Ningyocho",
        tag: "Refeição",
      },
      {
        horario: "13:45",
        evento: "Deslocamento até Ryogoku · Asakusa Line + JR Sobu Line (~10 min)",
        tag: "Deslocamento",
      },
      {
        horario: "14:30",
        evento: "Chegada ao Kokugikan — cerimônia de entrada da 2ª divisão",
        recomendado: true,
        tag: "Atração",
      },
      {
        horario: "15:45",
        evento: "Cerimônia de entrada e lutas da divisão principal (Makuuchi)",
        destaque: true,
        recomendado: true,
        tag: "Atração",
      },
      {
        horario: "18:00",
        evento: "Fim das lutas do dia e jantar com chanko nabe",
        tag: "Refeição",
      },
    ],
    nota: "Horários estimados considerando saída do remm Tokyo Kyobashi — o ingresso do Kokugikan vale para o dia inteiro, mas o horário recomendado de chegada é 14h30.",
  },
  manha: {
    regiao: {
      nome: "Ningyocho",
      descricao:
        "Bairro do shitamachi de Tóquio, erguido sobre um brejo aterrado no início do período Edo. Ganhou o apelido de \"cidade das bonecas\" por abrigar teatros de kabuki e bunraku e os artesãos que faziam as bonecas usadas nos espetáculos — a produção migrou para Asakusa ainda no século 19, mas o nome ficou.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Takaracho",
        nomeJapones: "宝町駅",
        distancia: "~1 min a pé do remm Tokyo Kyobashi",
      },
      linha: { codigo: "A12", nome: "Toei Asakusa Line", cor: "#E85298" },
      estacaoDestino: { nome: "Estação Ningyocho", nomeJapones: "人形町駅" },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈5 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Toei Asakusa Line), sem baldeação — apenas 2 estações.",
            "Embarque a ~1 min a pé do hotel.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈10 min",
          Icon: IconCar,
          detalhes: [
            "Trajeto curto, mas sem vantagem real sobre o metrô direto.",
            "Porta a porta, sem caminhada até a estação.",
          ],
        },
      ],
      recomendacao:
        "Do remm Tokyo Kyobashi, o trajeto até Ningyocho é de cerca de 5 minutos de metrô pela Toei Asakusa Line, sem baldeação — apenas 2 estações a partir de Takaracho, a menos de 1 minuto a pé do hotel.",
    },
    atracaoPrincipal: "09:45 — Chegada a Ningyocho",
    atracaoPrincipalImagem: "/images/ningyocho.png",
    pois: [],
    subAtracoes: [
      {
        label: "09:50",
        titulo: "Shigemori Eishindo",
        imagem: "/images/ningyoyaki.jpg",
        compacta: true,
        descricao:
          "Fundada em 1917, é a casa mais tradicional de ningyoyaki de Ningyocho — bolinhos fofos em formato de rosto ou dos sete deuses da sorte, recheados de pasta de feijão azuki. Vende em média 3 mil unidades por dia, chegando a 10 mil em dias de pico.",
      },
      {
        label: "10:10",
        titulo: "Início da Amazake Yokocho",
        imagem: "/images/amazake-yokocho.webp",
        compacta: true,
        descricao:
          "Viela de cerca de 400 metros que leva até o Teatro Meiji-za, batizada em homenagem a uma loja de amazake (saquê doce) que ficava na entrada, no início da era Meiji. Sobreviveu ao Grande Terremoto de Kanto e reúne até hoje doçarias, izakayas e lojas de artesanato tradicionais.",
      },
      {
        label: "10:15",
        titulo: "Toritada",
        imagem: "/images/toritada.png",
        compacta: true,
        descricao:
          "Avícola fundada em 1911, tradicional em Amazake Yokocho — trabalha com as três principais raças de frango do Japão e pato fresco. Seu tamagoyaki (omelete enrolada) é o item mais pedido, famoso por durar bem e virar lembrancinha.",
      },
      {
        label: "10:35",
        titulo: "Hikokuro",
        imagem: "/images/gyokueido-hikokuro.png",
        compacta: true,
        descricao:
          "Gyokueido Hikokuro, casa de doces japoneses fundada em 1576 em Kyoto, com filial em Nihonbashi desde 1954. Marcas registradas: o torayaki, massa fofa recheada com feijão azuki graúdo de Hokkaido, e a warabi mochi, elástica e macia, finalizada com kinako (farinha de soja torrada).",
      },
      {
        label: "11:00",
        titulo: "Edo Rakugo Karakuri Yagura",
        imagem: "/images/ningyocho.png",
        compacta: true,
        descricao:
          "Torre-relógio karakuri ao lado do Suitengu, próxima a Nihonbashi-Ningyocho 2-chome — a cada hora cheia (das 11h às 19h), as cortinas se abrem e um boneco contador de rakugo narra, por 2 a 3 minutos, a história de como o bairro ganhou seu nome. A outra torre de Ningyocho, com tema dos machibikeshi (bombeiros de Edo), está temporariamente removida por causa das obras do metrô — por isso não entra como parada garantida.",
      },
      {
        label: "11:20–11:45",
        titulo: "Suitengu",
        imagem: "/images/suitengu.webp",
        compacta: true,
        descricao:
          "Santuário xintoísta fundado em 1818 pelo senhor feudal de Kurume — referência nacional em orações por parto seguro e proteção infantil. A tradição nasceu de uma faixa de barriga feita com o cordão do sino do templo, usada por uma gestante no período Edo. A estátua Kodakara Inu, de uma cadela com seu filhote, é o símbolo do santuário.",
      },
    ],
    gastronomia: {
      subtitulo: "Almoço · 12:30–13:45",
      itens: [
        {
          nome: "Almoço em Ningyocho",
          descricao:
            "Janela reservada logo após o Suitengu, antes do deslocamento para o Kokugikan — restaurante a confirmar com a equipe Alpinea.",
        },
      ],
    },
  },
  tarde: {
    label: "Tarde",
    regiao: {
      nome: "Ryogoku",
      descricao:
        "Ryogoku é o bairro onde fica o estádio nacional de sumô Kokugikan, centro do sumô com infraestrutura de gastronomia e temática de sumô nas ruas.",
    },
    deslocamento: {
      estacaoOrigem: { nome: "Estação Ningyocho", nomeJapones: "人形町駅" },
      linha: { codigo: "A14", nome: "Toei Asakusa Line", cor: "#E85298" },
      estacaoDestino: { nome: "Estação Ryogoku", nomeJapones: "両国駅" },
      opcoes: [
        {
          meio: "Metrô + JR",
          tempo: "≈10 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Toei Asakusa Line até Asakusabashi (~5 min) + baldeação para a JR Sobu Line até Ryogoku (~5 min).",
            "Kokugikan fica a ~1 min a pé da saída da estação.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no início da tarde.",
            "Porta a porta, sem baldeação.",
          ],
        },
      ],
      recomendacao:
        "De Ningyocho até Ryogoku são cerca de 10 minutos: Toei Asakusa Line até Asakusabashi, com uma baldeação curta para a JR Sobu Line até Ryogoku — o Kokugikan fica a 1 minuto a pé da estação.",
    },
    atracaoPrincipal: "Ryogoku Kokugikan - Grand Sumo Tournament 2027",
    atracaoPrincipalImagem: "/images/draft-sumo.png",
    atracaoPrincipalFoco: "center",
    detalhesPraticos: [
      { label: "Entrada geral (no dia)", valor: "A partir de ¥2.200" },
      { label: "Cadeira", valor: "~¥3.500–8.500" },
      { label: "Box tatami (por pessoa)", valor: "~¥8.000–15.000" },
      { label: "Chegada recomendada", valor: "14h30, para a 2ª divisão" },
    ],
    pois: [
      {
        title: "Edo Noren (Área Externa do Kokugikan)",
        description: "Vila gastronômica temática de sumô, na entrada do estádio.",
        rating: 3,
      },
      {
        title: "Museu de Espadas",
        description: "Coleção de espadas samurai tradicionais.",
        rating: 3,
      },
      {
        title: "Santuário Nomi-no-Sukune",
        description:
          "Monumento com os nomes de todos os Yokozuna (Título máximo de lutador de Sumô).",
        rating: 2,
      },
    ],
    gradeHorarios: {
      titulo: "Grade de Horários — Dia 10/05 (Dia 2 do torneio)",
      itens: [
        {
          horario: "8h40",
          evento: "Início das lutas das categorias inferiores (Jonokuchi a Makushita)",
        },
        {
          horario: "14h30",
          evento: "Cerimônia de entrada da 2ª divisão (Jūryō)",
          recomendado: true,
          tag: "Horário Recomendado de Entrada",
        },
        {
          horario: "15h45",
          evento: "Cerimônia de entrada da divisão principal (Makuuchi)",
          destaque: true,
          recomendado: true,
        },
        {
          horario: "18h00",
          evento: "Fim das lutas do dia",
          recomendado: true,
        },
      ],
      nota: "Horários aproximados válidos para os dias 1 a 12 do torneio, conforme a bilheteria oficial. O ingresso vale para o dia inteiro — o confronto de cada luta individual só é divulgado no dia anterior.",
    },
    gastronomia: {
      itens: [
        {
          nome: "Chanko Nabe",
          descricao:
            "Ensopado altamente calórico que os lutadores de Sumô comem diariamente pra conseguir manter o peso.",
        },
      ],
    },
  },
};

const CHEGADA: DayContent = {
  day: 0,
  badge: "DXB-NRT",
  city: "Chegada",
  date: "04 Mai",
  travel: true,
  travelNote:
    "Chegada em Tokyo às 17:35 pelo Aeroporto de Narita (NRT). Dia reservado para desembarque, deslocamento até o hotel e descanso — sem tempo útil para passeios.",
};

const PARTIDA: DayContent = {
  day: 8,
  badge: "NRT-DXB",
  city: "Partida",
  date: "12 Mai",
  travel: true,
  travelNote:
    "Voo de volta decola às 00:05 pelo Aeroporto de Haneda (HND), logo após a virada do dia. Dia reservado para preparar a bagagem e seguir para o aeroporto — sem tempo útil para passeios.",
};

const DAYS: DayContent[] = [
  CHEGADA,
  DAY_1,
  DAY_4,
  DAY_3,
  DAY_5,
  DAY_6,
  DAY_7,
  DAY_2,
  PARTIDA,
];

// Paleta por bairro — Sumida fica no azul padrão dos cards. Ryogoku tem uma
// variante roxa própria (mesma família do lilás já usado no site) mas não é
// usada nesta versão do roteiro, já que Ryogoku ganhou seu próprio dia
// dedicado em vez de dividir a tarde com Sumida.
const BAIRRO_STYLES = {
  Sumida: {
    border: "border-[#173B45]",
    bg: "bg-[#F8FAF9]",
    circle: "bg-[#173B45]",
    text: "text-[#173B45]",
    muted: "text-[#173B45]/70",
    starMuted: "text-[#173B45]/25",
    badge: "border-[#173B45]/30 bg-[#173B45]/10 text-[#173B45]",
    chip: "border-[#173B45]/25 bg-[#FDFCF9] text-[#173B45]",
  },
  Ryogoku: {
    border: "border-[#B96432]",
    bg: "bg-[#F5E9DF]",
    circle: "bg-[#B96432]",
    text: "text-[#B96432]",
    muted: "text-[#B96432]/70",
    starMuted: "text-[#B96432]/25",
    badge: "border-[#B96432]/30 bg-[#B96432]/10 text-[#B96432]",
    chip: "border-[#B96432]/25 bg-[#FDFCF9] text-[#B96432]",
  },
} as const;

function poiStyles(bairro?: Poi["bairro"]) {
  return BAIRRO_STYLES[bairro ?? "Sumida"];
}

function Stars({ rating, styles }: { rating: number; styles: ReturnType<typeof poiStyles> }) {
  return (
    <span className={`text-xs tracking-tight ${styles.text}`} aria-label={`${rating} de 5 estrelas`}>
      {"★".repeat(rating)}
      <span className={styles.starMuted}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function PoiCard({ index, poi }: { index: number; poi: Poi }) {
  const s = poiStyles(poi.bairro);
  return (
    <div className={`flex gap-3 rounded-2xl border-2 px-4 py-3.5 ${s.border} ${s.bg}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${s.circle}`}>
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {poi.bairro && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.badge}`}>
              {poi.bairro}
            </span>
          )}
          {poi.category && (
            <span className="rounded-full border border-[#B69463] bg-[#F7F2E9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7B6038]">
              {poi.category}
            </span>
          )}
          <span className={`text-sm font-semibold ${s.text}`}>
            {poi.title}
          </span>
          {typeof poi.rating === "number" && (
            <Stars rating={poi.rating} styles={s} />
          )}
        </div>
        {poi.description && (
          <p className={`mt-1 text-xs leading-5 ${s.muted}`}>
            {poi.description}
          </p>
        )}
        {poi.lista && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {poi.lista.map((item) => (
              <span
                key={item}
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${s.chip}`}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextoBlock({ contexto }: { contexto: string[] }) {
  return (
    <div className="mb-10 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:p-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/68">
        Contexto
      </p>
      <div className="space-y-3">
        {contexto.map((paragrafo, index) => (
          <p key={index} className="text-sm leading-6 text-[#24211D]/85">
            {paragrafo}
          </p>
        ))}
      </div>
    </div>
  );
}

function GastronomiaBlock({ gastronomia }: { gastronomia: Gastronomia }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
        Gastronomia
        {gastronomia.subtitulo && (
          <span className="ml-2 font-normal normal-case tracking-normal text-[#24211D]/65">
            ({gastronomia.subtitulo})
          </span>
        )}
      </p>
      <ul className="mt-3 space-y-1.5">
        {gastronomia.itens.map((item) => (
          <li key={item.nome} className="text-sm leading-6 text-[#24211D]/85">
            <span className="font-semibold text-[#24211D]/95">{item.nome}</span>
            {item.descricao && (
              <span className="text-[#24211D]/75"> — {item.descricao}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-[#DDD8CF] pt-3 text-xs leading-5 text-[#24211D]/68">
        Mapeamento de opções de restaurantes nos arredores da atração
        principal
      </p>
    </div>
  );
}

function ComprasExclusivasBlock({
  compras,
}: {
  compras: ComprasExclusivas;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
        Compras Exclusivas
      </p>
      <p className="mt-2 text-sm leading-6 text-[#24211D]/78">
        {compras.descricao}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {compras.itens.map((item) => (
          <div
            key={item.nome}
            className="overflow-hidden rounded-xl border border-[#DDD8CF] bg-[#FDFCF9]"
          >
            {item.imagem ? (
              <img
                src={item.imagem}
                alt={item.nome}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-[#FAF9F6] text-[10px] uppercase tracking-wide text-[#24211D]/55">
                Sem imagem
              </div>
            )}
            <p className="p-2 text-center text-xs font-medium leading-4 text-[#24211D]/90">
              {item.nome}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransporteBlock({
  transporte,
}: {
  transporte: TransporteSugerido;
}) {
  return (
    <div className="mb-8 rounded-2xl border-2 border-emerald-300/60 bg-emerald-50 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <IconShinkansen className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
          Sugestão de Transporte
        </p>
      </div>
      <p className="text-lg font-semibold text-[#24211D]">{transporte.linha}</p>
      <p className="mt-1 text-sm text-[#24211D]/78">{transporte.tempo}</p>
      <p className="mt-3 text-sm leading-6 text-[#24211D]/90">
        {transporte.recomendacao}
      </p>
    </div>
  );
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function AlertaBlock({ alerta }: { alerta: AlertaSugerido }) {
  return (
    <div className="mb-8 rounded-2xl border-2 border-red-300/60 bg-red-50 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <IconAlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-700">
          {alerta.titulo}
        </p>
      </div>
      <p className="text-lg font-semibold text-[#24211D]">{alerta.horario}</p>
      <p className="mt-3 text-sm leading-6 text-[#24211D]/90">
        {alerta.mensagem}
      </p>
    </div>
  );
}

function NumberedStep({
  number,
  label,
  children,
}: {
  number: number;
  label: string;
  children: ReactElement | (ReactElement | false | null)[];
}) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B45] text-xs font-bold text-white">
          {number}
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#173B45]">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

function DeslocamentoCard({ deslocamento }: { deslocamento: Deslocamento }) {
  return (
    <div className="rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-center gap-4 text-center sm:gap-6">
        <div>
          <p className="text-sm font-semibold text-[#24211D]">
            {deslocamento.estacaoOrigem.nome}
          </p>
          {deslocamento.estacaoOrigem.nomeJapones && (
            <p className="text-xs text-[#24211D]/55">
              {deslocamento.estacaoOrigem.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoOrigem.distancia && (
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#24211D]/50">
              {deslocamento.estacaoOrigem.distancia}
            </p>
          )}
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: deslocamento.linha.cor }}
        >
          {deslocamento.linha.codigo}
        </span>
        <span className="text-lg text-[#24211D]/30">→</span>
        <div>
          <p className="text-sm font-semibold text-[#24211D]">
            {deslocamento.estacaoDestino.nome}
          </p>
          {deslocamento.estacaoDestino.nomeJapones && (
            <p className="text-xs text-[#24211D]/55">
              {deslocamento.estacaoDestino.nomeJapones}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/50">
        {deslocamento.linha.nome} · sem baldeação
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {deslocamento.opcoes.map((opcao) => (
          <div
            key={opcao.meio}
            className={`rounded-xl p-4 ${
              opcao.recomendado
                ? "border-2 border-[#173B45] bg-[#173B45]/[0.04]"
                : "border border-[#DDD8CF] bg-[#FAF9F6]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  opcao.recomendado
                    ? "bg-[#173B45] text-white"
                    : "bg-white text-[#24211D]/60"
                }`}
              >
                <opcao.Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#24211D]/55">
                  {opcao.meio}
                </p>
                <p className="text-lg font-semibold text-[#24211D]">
                  {opcao.tempo}
                </p>
              </div>
            </div>
            {opcao.recomendado && (
              <p className="mt-2 inline-block rounded-full border border-[#173B45]/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#173B45]">
                Recomendado
              </p>
            )}
            <div className="mt-3 space-y-1">
              {opcao.detalhes.map((d, i) => (
                <p key={i} className="text-xs leading-5 text-[#24211D]/72">
                  {d}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {deslocamento.recomendacao && (
        <p className="mt-5 border-t border-[#DDD8CF] pt-4 text-sm leading-6 text-[#24211D]/80">
          {deslocamento.recomendacao}
        </p>
      )}
    </div>
  );
}

function PeriodBlock({
  label,
  period,
  displayClassName,
}: {
  label: string;
  period: Period;
  displayClassName: string;
}) {
  const passoAtracao = period.deslocamento ? 2 : 1;
  const passoRefeicao = passoAtracao + 1;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-[#B96432]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
          {period.label ?? label}
        </span>
      </div>

      {/* Headliner — foto da atração principal do período, antes dos
          passos numerados (mesmo padrão do /ajisairoteiros) */}
      <div
        className={`relative mb-8 overflow-hidden rounded-2xl ${
          period.atracaoPrincipalCompacta
            ? "mx-auto aspect-[3/4] max-w-[280px]"
            : "aspect-[4/3] sm:aspect-[16/9]"
        } ${period.atracaoPrincipalImagem ? "" : "border-2 border-[#173B45]"}`}
      >
        {period.atracaoPrincipalImagem ? (
          <>
            <img
              src={period.atracaoPrincipalImagem}
              alt={period.atracaoPrincipal}
              className={`absolute inset-0 h-full w-full object-cover ${
                period.atracaoPrincipalFoco === "bottom"
                  ? "object-bottom"
                  : period.atracaoPrincipalFoco === "center"
                    ? "object-center"
                    : "object-top"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <p className="absolute inset-x-5 bottom-14 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
              Atração
            </p>
            <h3
              className={`${displayClassName} absolute inset-x-5 bottom-4 font-medium leading-snug text-white ${
                period.atracaoPrincipalCompacta
                  ? "text-lg md:text-xl"
                  : "text-2xl md:text-3xl"
              }`}
            >
              {period.atracaoPrincipal}
            </h3>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[#F8FAF9] px-5">
            <h3
              className={`${displayClassName} text-2xl font-medium text-[#173B45] md:text-3xl`}
            >
              {period.atracaoPrincipal}
            </h3>
          </div>
        )}
      </div>

      {period.deslocamento && (
        <NumberedStep number={1} label="Deslocamento">
          <DeslocamentoCard deslocamento={period.deslocamento} />
        </NumberedStep>
      )}

      <NumberedStep number={passoAtracao} label="Atração">
        <>
          {period.regiao && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#24211D]/68">
                Região: {period.regiao.nome}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[#24211D]/78">
                {period.regiao.descricao}
              </p>
            </div>
          )}

          {period.detalhesPraticos && period.detalhesPraticos.length > 0 && (
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:grid-cols-4">
              {period.detalhesPraticos.map((item) => (
                <div key={item.label}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#24211D]/55">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-[#24211D]">
                    {item.valor}
                  </p>
                </div>
              ))}
            </div>
          )}

          {period.pois.length > 0 && (
            <>
              <p className="mb-5 text-xs text-[#24211D]/65">
                Pontos de interesse propostos para o período
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {period.pois.map((poi, index) => (
                  <PoiCard key={poi.title + index} index={index} poi={poi} />
                ))}
              </div>
            </>
          )}

          {period.gradeHorarios && (
            <GradeHorariosBlock grade={period.gradeHorarios} />
          )}
        </>
      </NumberedStep>

      {period.gastronomia && (
        <NumberedStep number={passoRefeicao} label="Refeição">
          <GastronomiaBlock gastronomia={period.gastronomia} />
        </NumberedStep>
      )}

      {period.comprasExclusivas && (
        <ComprasExclusivasBlock compras={period.comprasExclusivas} />
      )}
      {period.subAtracoes?.map((sub, index) => (
        <SubAtracaoBlock
          key={sub.titulo + index}
          subAtracao={sub}
          displayClassName={displayClassName}
        />
      ))}
    </div>
  );
}

function GradeHorariosBlock({ grade }: { grade: GradeHorarios }) {
  return (
    <div className="mb-6 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-4">
      <div className="flex items-center gap-2">
        <IconClock className="h-3.5 w-3.5 text-[#24211D]/68" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
          {grade.titulo ?? "Grade de Horários"}
        </p>
      </div>
      <div className="mt-3 divide-y divide-[#DDD8CF] overflow-hidden rounded-xl border border-[#DDD8CF] bg-[#FDFCF9]">
        {grade.itens.map((item) => (
          <div
            key={item.evento}
            className={`px-4 py-2.5 ${item.recomendado ? "bg-amber-50" : ""}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-16 shrink-0 text-sm font-semibold ${
                  item.recomendado ? "text-amber-800" : "text-[#24211D]/90"
                }`}
              >
                {item.horario}
              </span>
              <span
                className={`text-sm leading-5 ${
                  item.destaque ? "font-semibold" : ""
                } ${item.recomendado ? "text-amber-800" : "text-[#24211D]/78"}`}
              >
                {item.evento}
              </span>
            </div>
            {item.tag && (
              <span className="ml-20 mt-1.5 inline-block rounded-full border border-amber-400/70 bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-800">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
      {grade.nota && (
        <p className="mt-3 border-t border-[#DDD8CF] pt-3 text-xs leading-5 text-[#24211D]/68">
          {grade.nota}
        </p>
      )}
    </div>
  );
}

function SubAtracaoBlock({
  subAtracao,
  displayClassName,
}: {
  subAtracao: SubAtracao;
  displayClassName: string;
}) {
  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8CF] bg-[#FAF9F6] text-[#24211D]/55">
          <IconArrowDown className="h-4 w-4" />
        </span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-[#B96432]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
          {subAtracao.label ?? "Noite"}
        </span>
        {subAtracao.opcional && (
          <span className="rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">
            Opcional
          </span>
        )}
      </div>

      {subAtracao.compacta ? (
        <div className="mx-auto flex max-w-lg items-center gap-4 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-3">
          <div
            className={`relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-40 ${
              subAtracao.imagem ? "" : "border-2 border-[#173B45]"
            }`}
          >
            {subAtracao.imagem ? (
              <img
                src={subAtracao.imagem}
                alt={subAtracao.titulo}
                className={`absolute inset-0 h-full w-full object-cover ${
                  subAtracao.foco === "bottom"
                    ? "object-bottom"
                    : subAtracao.foco === "center"
                      ? "object-center"
                      : "object-top"
                }`}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#F8FAF9]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`${displayClassName} text-base font-medium leading-snug text-[#24211D] md:text-lg`}
            >
              {subAtracao.titulo}
            </h3>
            {subAtracao.descricao && (
              <p className="mt-1 text-xs leading-5 text-[#24211D]/78">
                {subAtracao.descricao}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className={`relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10] ${
              subAtracao.imagem ? "" : "border-2 border-[#173B45]"
            }`}
          >
            {subAtracao.imagem ? (
              <>
                <img
                  src={subAtracao.imagem}
                  alt={subAtracao.titulo}
                  className={`absolute inset-0 h-full w-full object-cover ${
                    subAtracao.foco === "bottom"
                      ? "object-bottom"
                      : subAtracao.foco === "center"
                        ? "object-center"
                        : "object-top"
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <h3
                  className={`${displayClassName} absolute inset-x-5 bottom-4 text-2xl font-medium leading-snug text-white md:text-3xl`}
                >
                  {subAtracao.titulo}
                </h3>
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-[#F8FAF9] px-5">
                <h3
                  className={`${displayClassName} text-2xl font-medium text-[#173B45] md:text-3xl`}
                >
                  {subAtracao.titulo}
                </h3>
              </div>
            )}
          </div>

          {subAtracao.descricao && (
            <p className="mb-5 text-sm leading-6 text-[#24211D]/78">
              {subAtracao.descricao}
            </p>
          )}
        </>
      )}

      {subAtracao.pois && subAtracao.pois.length > 0 && (
        <>
          <p className="mb-5 text-xs text-[#24211D]/65">Restaurantes sugeridos</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subAtracao.pois.map((poi, index) => (
              <PoiCard key={poi.title + index} index={index} poi={poi} />
            ))}
          </div>
        </>
      )}

      {subAtracao.gastronomia && (
        <GastronomiaBlock gastronomia={subAtracao.gastronomia} />
      )}
    </div>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

function IconPlane({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="12" y1="5" x2="12" y2="20" />
      <path d="M6 14l6 6 6-6" />
    </svg>
  );
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="12" y1="20" x2="12" y2="5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function IconMetro({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="5" y="3" width="14" height="13" rx="4" />
      <line x1="5" y1="10" x2="19" y2="10" />
      <circle cx="8.5" cy="19" r="1.3" />
      <circle cx="15.5" cy="19" r="1.3" />
    </svg>
  );
}

function IconBus({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="11" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="10" x2="7" y2="16" />
      <line x1="17" y1="10" x2="17" y2="16" />
      <circle cx="7" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

function IconCar({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 11 6.5 6h11L19 11" />
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.3" />
      <circle cx="16.5" cy="17.5" r="1.3" />
    </svg>
  );
}

function IconWalk({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M10 8 7 10l1 5-3 5" />
      <path d="M10 8l3 2 3-1 2 3" />
      <path d="M11 13l-1 2 4 3" />
    </svg>
  );
}

function IconShinkansen({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 15c0-5 3-9 9-9h5a4 4 0 0 1 4 4v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <line x1="9" y1="10" x2="20" y2="10" />
      <circle cx="8" cy="19" r="1.3" />
      <circle cx="16" cy="19" r="1.3" />
    </svg>
  );
}

function IconExchange({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 8h13l-4-4" />
      <path d="M18 16H5l4 4" />
    </svg>
  );
}

function IconCustoms({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconWords({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="7" y1="13" x2="13" y2="13" />
    </svg>
  );
}

const INFO_CARDS = [
  { label: "Aeroporto DXB", Icon: IconPlane },
  { label: "Aeroporto NRT (Narita)", Icon: IconPlane, view: "narita" as const },
  { label: "Metrô", Icon: IconMetro },
  { label: "Ônibus", Icon: IconBus },
  { label: "Trem Bala (Shinkansen)", Icon: IconShinkansen },
  { label: "Câmbio", Icon: IconExchange },
  { label: "Costumes", Icon: IconCustoms },
  { label: "Palavras Comuns", Icon: IconWords },
];

function IconFork({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12" />
      <path d="M17 3c-1.5 0-2 1.5-2 3v4c0 1.5.5 2 2 2v9" />
    </svg>
  );
}

function IconDumbbell({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="6" y1="12" x2="18" y2="12" />
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <rect x="5" y="7" width="2.5" height="10" rx="1" />
      <rect x="16.5" y="7" width="2.5" height="10" rx="1" />
    </svg>
  );
}

function IconStore({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M4 9v10h16V9" />
      <path d="M9 19v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

function IconWifi({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5 12.5a11 11 0 0 1 14 0" />
      <path d="M8.5 16.5a6 6 0 0 1 7 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function IconCross({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconWasher({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <circle cx="12" cy="13" r="2" />
      <line x1="7" y1="6" x2="7.01" y2="6" />
      <line x1="10" y1="6" x2="10.01" y2="6" />
    </svg>
  );
}

function IconSuitcase({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </svg>
  );
}

// Caixa/pacote — usado para o serviço de envio de bagagem (Takkyubin).
function IconBox({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

// Lupa — indica que o thumbnail pode ser ampliado (zoom in-page).
function IconZoom({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type HotelAmenity = {
  label: string;
  Icon: (props: { className?: string }) => ReactElement;
};

type HotelNearby = {
  label: string;
  nome: string;
  detalhe?: string;
  Icon: (props: { className?: string }) => ReactElement;
};

// Ponto num mapa esquemático (não geográfico/à escala) posicionado em
// porcentagem (0-100) dentro do quadro — só pra dar noção rápida de direção
// e distância a pé em relação ao hotel.
// Ponto marcado sobre um recorte real do mapa (screenshot), em porcentagem
// (0-100) da imagem — x/y foram calibrados visualmente sobre a imagem em
// public/images/lyf-mapa-arredores.png.
type MapaPonto = {
  x: number;
  y: number;
  label: string;
  detalhe: string;
  Icon: (props: { className?: string }) => ReactElement;
  // Direção da etiqueta em relação ao pino — evita que etiquetas de pontos
  // próximos colidam entre si. Padrão: "down".
  dir?: "up" | "down" | "left" | "right";
};

// Ponto que fica fora da área visível do recorte (ex: hospital mais distante)
// — mostrado como uma indicação de direção/distância na borda do mapa, em
// vez de inventar uma posição falsa dentro do quadro.
type MapaForaDoQuadro = {
  label: string;
  detalhe: string;
  direcao: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  Icon: (props: { className?: string }) => ReactElement;
};

type HotelInfo = {
  cidade: string;
  nome: string;
  bairro: string;
  endereco: string;
  enderecoJapones?: string;
  telefone?: string;
  site?: string;
  checkin: string;
  checkout: string;
  estrutura: HotelAmenity[];
  essenciais: HotelNearby[];
  // Seção final, só preenchida quando existe informação real o bastante pra
  // justificar — não é pra inventar conteúdo pra preencher espaço.
  informacoesUteis?: { label: string; texto: string }[];
  mapa?: {
    imagem: string;
    imagemAlt: string;
    pontos: MapaPonto[];
    foraDoQuadro?: MapaForaDoQuadro[];
    nota?: string;
    // Prints de rota a pé (Google Maps) pra pontos específicos — abrem a
    // imagem original em tamanho real numa nova aba.
    rotas?: { label: string; imagem: string; imagemAlt: string }[];
  };
};

// Hotéis já reservados e confirmados — o roteiro não é mais um comparativo de
// opções, e sim um guia prático pro cliente durante a estadia: estrutura do
// hotel e o que existe de essencial nos arredores (farmácia, clínica/hospital,
// conveniência).
const HOTEIS: HotelInfo[] = [
  {
    cidade: "Tokyo 1",
    nome: "lyf Ginza Tokyo",
    bairro: "Kyobashi, Chuo-ku",
    endereco: "2-5-4 Kyobashi, Chuo-ku, Tokyo 104-0031",
    enderecoJapones: "〒104-0031 東京都中央区京橋2-5-4",
    telefone: "+81 3-3528-6505",
    site: "https://www.discoverasr.com/en/lyf/japan/lyf-ginza-tokyo",
    checkin: "A partir das 15h00",
    checkout: "Até às 11h00",
    estrutura: [
      { label: "Wi-Fi grátis em todo o hotel", Icon: IconWifi },
      { label: "Recepção 24h", Icon: IconClock },
      { label: "Academia 24h", Icon: IconDumbbell },
      { label: "Cozinha compartilhada e lounge/bar", Icon: IconFork },
      { label: "Lavanderia", Icon: IconWasher },
      { label: "Guarda-volumes", Icon: IconSuitcase },
      { label: "Envio/recebimento de bagagem (Takkyubin) via recepção", Icon: IconBox },
    ],
    essenciais: [
      {
        label: "Estação",
        nome: "Kyobashi (Ginza Line) / Takaracho (Asakusa Line)",
        detalhe: "Kyobashi ~1 min a pé · Takaracho ~2 min a pé",
        Icon: IconMetro,
      },
      {
        label: "Conveniência",
        nome: "7-Eleven e Lawson",
        detalhe: "Dentro do Kyobashi Edogrand, a poucos passos do hotel",
        Icon: IconStore,
      },
      {
        label: "Farmácia",
        nome: "Matsumoto Kiyoshi Kyobashi Ekimae",
        detalhe: "Na saída da Estação Kyobashi",
        Icon: IconCross,
      },
      {
        label: "Clínica",
        nome: "Kameda Kyobashi Clinic",
        detalhe: "Tokyo Square Garden — seg. a sáb., 8h30–18h, atendimento em inglês",
        Icon: IconCross,
      },
      {
        label: "Hospital",
        nome: "St. Luke's International Hospital",
        detalhe: "Pronto-socorro 24h — ~15 min a pé ou táxi curto",
        Icon: IconCross,
      },
    ],
    informacoesUteis: [
      {
        label: "Bagagem",
        texto:
          "Guarda-volumes disponível na recepção. Consulte diretamente o hotel sobre armazenamento antes do check-in ou após o check-out.",
      },
      {
        label: "Takkyubin",
        texto:
          "Envio/recebimento de malas disponível via recepção (24h) — combine o serviço e o valor com a equipe antes do check-out.",
      },
      {
        label: "Atendimento",
        texto: "Recepção 24h com atendimento em inglês e japonês.",
      },
      {
        label: "Em caso de emergência",
        texto:
          "Número de emergência no Japão: 119 (ambulância/incêndio) ou 110 (polícia). Hospital de referência: St. Luke's International Hospital.",
      },
    ],
    mapa: {
      imagem: "/images/lyf-fachada-real.png",
      imagemAlt: "Fachada do lyf Ginza Tokyo",
      pontos: [
        {
          x: 36,
          y: 55,
          label: "Estação Kyobashi / Takaracho",
          detalhe: "~3 min a pé",
          Icon: IconMetro,
          dir: "down",
        },
        {
          x: 37.5,
          y: 49,
          label: "Kyobashi Edogrand (7-Eleven, Lawson)",
          detalhe: "~3 min a pé",
          Icon: IconStore,
          dir: "right",
        },
        {
          x: 33,
          y: 50,
          label: "Matsumoto Kiyoshi (farmácia)",
          detalhe: "Na saída da estação",
          Icon: IconCross,
          dir: "left",
        },
        {
          x: 43,
          y: 43,
          label: "Kameda Kyobashi Clinic",
          detalhe: "Tokyo Square Garden · ~4 min a pé",
          Icon: IconCross,
          dir: "up",
        },
      ],
      foraDoQuadro: [
        {
          label: "St. Luke's International Hospital",
          detalhe: "Pronto-socorro 24h · ~15 min a pé ou táxi curto",
          direcao: "NE",
          Icon: IconCross,
        },
      ],
      rotas: [
        {
          label: "Estação Kyobashi",
          imagem: "/images/lyf-rota-estacao-kyobashi.png",
          imagemAlt: "Rota a pé da Estação Kyobashi até o lyf Ginza Tokyo",
        },
        {
          label: "7-Eleven",
          imagem: "/images/lyf-rota-seven-eleven.png",
          imagemAlt: "Rota a pé do 7-Eleven até o lyf Ginza Tokyo",
        },
        {
          label: "Lawson",
          imagem: "/images/lyf-rota-lawson.png",
          imagemAlt: "Rota a pé do Lawson até o lyf Ginza Tokyo",
        },
        {
          label: "Saída 6 (Estação Kyobashi)",
          imagem: "/images/lyf-estacao-kyobashi-saida6.png",
          imagemAlt: "Vista de rua da Saída 6 da Estação Kyobashi",
        },
        {
          label: "Farmácia Welcia",
          imagem: "/images/lyf-rota-welcia.png",
          imagemAlt: "Rota a pé da Farmácia Welcia mais próxima até o lyf Ginza Tokyo",
        },
        {
          label: "St. Luke's International Hospital",
          imagem: "/images/lyf-rota-st-lukes.png",
          imagemAlt: "Rota de carro até o St. Luke's International Hospital",
        },
        {
          label: "Kameda Kyobashi Clinic",
          imagem: "/images/lyf-rota-kameda-clinic.png",
          imagemAlt: "Rota a pé até a Kameda Kyobashi Clinic",
        },
      ],
    },
  },
  {
    cidade: "Kyoto",
    nome: "Daiwa Roynet Hotel Kyoto-Ekimae PREMIER",
    bairro: "Karasuma-guchi, em frente à Kyoto Station",
    endereco: "707-2 Higashishiokojicho, Karasuma-dori, Shimogyo-ku, Kyoto",
    site: "https://www.daiwaroynet.jp/en/kyoto-ekimae/",
    checkin: "A partir das 14h00",
    checkout: "Até às 11h00",
    estrutura: [
      { label: "Wi-Fi grátis (com e sem fio)", Icon: IconWifi },
      { label: "Recepção 24h", Icon: IconClock },
      { label: "Restaurante próprio", Icon: IconFork },
      { label: "Lavanderia", Icon: IconWasher },
      { label: "Guarda-volumes", Icon: IconSuitcase },
    ],
    essenciais: [
      {
        label: "Estação",
        nome: "Kyoto Station (saída Karasuma)",
        detalhe: "Na porta do hotel",
        Icon: IconMetro,
      },
      {
        label: "Conveniência",
        nome: "Lawson",
        detalhe: "A 20 m do hotel",
        Icon: IconStore,
      },
      {
        label: "Farmácia",
        nome: "Ain Pharmacy Kyoto Ekimae",
        detalhe: "No mesmo quarteirão, Yamazaki Medical Bldg B1F",
        Icon: IconCross,
      },
      {
        label: "Hospital",
        nome: "Koseikai Takeda Hospital",
        detalhe: "Pronto-socorro 24h, 365 dias por ano — ~5 min a pé",
        Icon: IconCross,
      },
    ],
  },
  {
    cidade: "Tokyo 2",
    nome: "remm Tokyo Kyobashi",
    bairro: "Kyobashi, Chuo-ku",
    endereco: "2-6-21 Kyobashi, Chuo-ku, Tokyo",
    site: "https://www.hankyu-hotel.com/en/hotel/remm/tokyo-kyobashi",
    checkin: "14h00 às 24h00",
    checkout: "Até às 12h00",
    estrutura: [
      { label: "Wi-Fi grátis", Icon: IconWifi },
      { label: "Recepção 24h", Icon: IconClock },
      {
        label: "Restaurante DINING STAGE ARCH — café da manhã 7h–10h30 (à parte)",
        Icon: IconFork,
      },
      { label: "Lavanderia", Icon: IconWasher },
      { label: "Guarda-volumes", Icon: IconSuitcase },
    ],
    essenciais: [
      {
        label: "Estação",
        nome: "Kyobashi (Ginza Line, saída 6)",
        detalhe: "1 min a pé (50 m)",
        Icon: IconMetro,
      },
      {
        label: "Conveniência",
        nome: "7-Eleven",
        detalhe: "No térreo do próprio hotel",
        Icon: IconStore,
      },
      {
        label: "Farmácia",
        nome: "Matsumoto Kiyoshi Kyobashi Ekimae",
        detalhe: "Na Estação Kyobashi",
        Icon: IconCross,
      },
      {
        label: "Clínica",
        nome: "Kameda Kyobashi Clinic",
        detalhe: "Tokyo Square Garden — seg. a sáb., 8h30–18h, atendimento em inglês",
        Icon: IconCross,
      },
      {
        label: "Hospital",
        nome: "St. Luke's International Hospital",
        detalhe: "Pronto-socorro 24h — ~15 min a pé ou táxi curto",
        Icon: IconCross,
      },
    ],
  },
];

function HotelGuestGuide({ hotel }: { hotel: HotelInfo }) {
  const [rotaModal, setRotaModal] = useState<{
    items: { imagem: string; imagemAlt: string; label: string }[];
    index: number;
  } | null>(null);

  function openRotas(items: { imagem: string; imagemAlt: string; label: string }[]) {
    if (items.length > 0) setRotaModal({ items, index: 0 });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DDD8CF]">
      {/* 1. Informações do hotel — fundo com o mural + etiqueta com o nome */}
      {hotel.cidade === "Tokyo 1" && (
        <div className="relative flex min-h-[150px] items-end overflow-hidden border-b border-[#DDD8CF] p-5 sm:min-h-[190px] sm:p-8">
          <Image
            src="/images/lyf-mural-fachada.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 800px"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#FAF9F6]/45" />
          <span className="relative rounded-lg bg-[#0B2530] px-5 py-3 text-lg font-bold text-white sm:px-6 sm:py-3.5 sm:text-xl">
            {hotel.nome}
          </span>
        </div>
      )}

      {/* Identificação — endereço, telefone, site e horários */}
      <div className="border-b border-[#DDD8CF] bg-[#FAF9F6] px-5 py-6 text-center sm:px-8">
        {hotel.cidade !== "Tokyo 1" && (
          <p className="text-base font-semibold text-[#24211D] sm:text-lg">
            {hotel.nome}
          </p>
        )}
        <p className={`text-sm text-[#24211D]/80 sm:text-base ${hotel.cidade !== "Tokyo 1" ? "mt-1" : ""}`}>
          {hotel.endereco}
        </p>
        {hotel.enderecoJapones && (
          <p className="mt-1 text-sm text-[#24211D]/65 sm:text-base">{hotel.enderecoJapones}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[#24211D]/80">
          {hotel.telefone && <span>{hotel.telefone}</span>}
          {hotel.telefone && hotel.site && <span className="text-[#24211D]/35">·</span>}
          {hotel.site && (
            <a
              href={hotel.site}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold uppercase tracking-[0.1em] text-[#173B45] hover:underline"
            >
              Site oficial
            </a>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <span className="rounded-full border border-[#173B45]/25 bg-[#173B45]/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B45]">
            Check-in · {hotel.checkin}
          </span>
          <span className="rounded-full border border-[#173B45]/25 bg-[#173B45]/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B45]">
            Check-out · {hotel.checkout}
          </span>
        </div>
      </div>

      {/* 2. Estrutura & Serviços — bloco de largura total */}
      <div className="border-t border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:p-8">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
          Estrutura &amp; Serviços
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {hotel.estrutura.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173B45]/[0.08] text-[#173B45]">
                <item.Icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-sm leading-5 text-[#24211D]/92">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Localização & Arredores — foto da fachada, lista e rotas, no
          mesmo bloco de largura total */}
      <div className="border-t border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:p-8">
        {hotel.mapa && (
          <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#DDD8CF] sm:aspect-[2/1]">
            <Image
              src={hotel.mapa.imagem}
              alt={hotel.mapa.imagemAlt}
              fill
              sizes="(max-width: 640px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
          Localização &amp; Arredores
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {hotel.essenciais.map((item) => {
            const rotas =
              hotel.mapa?.rotas?.filter((r) =>
                ROTAS_POR_ESSENCIAL[item.label]?.includes(r.label)
              ) ?? [];
            const cardBody = (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B96432]/[0.1] text-[#B96432]">
                  <item.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#24211D]/65">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold leading-5 text-[#24211D]">
                    {item.nome}
                  </p>
                  {item.detalhe && (
                    <p className="mt-0.5 text-xs leading-5 text-[#24211D]/75">
                      {item.detalhe}
                    </p>
                  )}
                </div>
                {rotas.length > 0 && (
                  <span className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full bg-[#173B45]/[0.06] text-[#173B45] transition group-hover:bg-[#173B45]/[0.12]">
                    <IconZoom className="h-3.5 w-3.5" />
                  </span>
                )}
              </>
            );
            return rotas.length > 0 ? (
              <button
                key={item.label}
                type="button"
                onClick={() => openRotas(rotas)}
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#DDD8CF] hover:bg-[#FAF9F6]"
              >
                {cardBody}
              </button>
            ) : (
              <div key={item.label} className="flex items-start gap-3 p-2">
                {cardBody}
              </div>
            );
          })}
        </div>

        {hotel.mapa && (
          <div className="mt-6">
            {hotel.mapa.rotas && hotel.mapa.rotas.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/58">
                  Rotas a pé (prints do Google Maps)
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {hotel.mapa.rotas.map((rota) => (
                    <button
                      key={rota.label}
                      type="button"
                      onClick={() => openRotas([rota])}
                      className="group block overflow-hidden rounded-xl border border-[#DDD8CF] bg-[#F8FAF9] text-left"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={rota.imagem}
                          alt={rota.imagemAlt}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/35">
                          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#173B45] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                            <IconZoom className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <p className="px-2.5 py-2 text-[10px] font-semibold leading-tight text-[#24211D]/85">
                        {rota.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Informações úteis — só aparece quando há conteúdo real */}
      {hotel.informacoesUteis && hotel.informacoesUteis.length > 0 && (
        <div className="border-t border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
            Informações Úteis
          </p>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {hotel.informacoesUteis.map((item) => (
              <div key={item.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B96432]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#24211D]/85">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rotaModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setRotaModal(null)}
        >
          <button
            type="button"
            onClick={() => setRotaModal(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>

          {rotaModal.items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRotaModal((s) =>
                    s
                      ? { ...s, index: (s.index - 1 + s.items.length) % s.items.length }
                      : s
                  );
                }}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-6"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRotaModal((s) =>
                    s ? { ...s, index: (s.index + 1) % s.items.length } : s
                  );
                }}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6"
                aria-label="Próxima foto"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={rotaModal.items[rotaModal.index].imagem}
              alt={rotaModal.items[rotaModal.index].imagemAlt}
              className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
            />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
              {rotaModal.items[rotaModal.index].label}
              {rotaModal.items.length > 1 &&
                ` · ${rotaModal.index + 1}/${rotaModal.items.length}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const ROTAS_POR_ESSENCIAL: Record<string, string[]> = {
  "Estação": ["Estação Kyobashi", "Saída 6 (Estação Kyobashi)"],
  "Conveniência": ["7-Eleven", "Lawson"],
  "Farmácia": ["Farmácia Welcia"],
  "Clínica": ["Kameda Kyobashi Clinic"],
  "Hospital": ["St. Luke's International Hospital"],
};

export function ApprovalPanel({
  displayClassName,
}: {
  displayClassName: string;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [hotelCity, setHotelCity] = useState(0);
  const [viewMode, setViewMode] = useState<"dia" | "hotel" | "narita">("dia");
  const contentRef = useRef<HTMLDivElement>(null);
  const daysMenuRef = useRef<HTMLDivElement>(null);

  function scrollToContent() {
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToDaysMenu() {
    requestAnimationFrame(() => {
      daysMenuRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const current = DAYS[activeDay];

  return (
    <>
      <div className="relative">
        {/* Glow via box-shadow direto no card — mesma paleta do
            /roteirolandingpage, sem risco de vazar para dentro do painel
            branco (sombra CSS só pinta fora da caixa). */}
        <div
          className="overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] sm:rounded-[2rem]"
          style={{
            boxShadow:
              "0 0 90px 6px rgba(35,90,190,0.28), 0 0 42px -4px rgba(90,50,155,0.28), 0 20px 60px -30px rgba(0,0,0,0.25)",
          }}
        >
        <div className="border-b border-[#DDD8CF] px-6 py-7 text-center sm:px-10">
          <p className="mx-auto mb-5 inline-block rounded-full border border-[#DDD8CF] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#24211D]/85">
            Roteiro de 7 dias
          </p>
          <h2 className={`${displayClassName} text-2xl font-medium text-[#24211D] md:text-3xl`}>
            Painel Interativo
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#24211D]/72">
            Selecione o conteúdo desejado abaixo
          </p>
        </div>

        <div
          ref={daysMenuRef}
          className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 px-6 pt-6 sm:gap-x-7 sm:px-10"
        >
          {DAYS.map((d, index) => {
            const active = index === activeDay && viewMode === "dia";
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => {
                  setActiveDay(index);
                  setViewMode("dia");
                  scrollToContent();
                }}
                className="group flex flex-col items-center gap-2.5"
              >
                <span
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold transition-all duration-300 ${
                    d.badge
                      ? "text-[9px] tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]"
                      : active
                        ? "shadow-[0_0_0_2px_#173B45]"
                        : "hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(23,59,69,0.55)]"
                  }`}
                  style={
                    d.badge
                      ? {
                          background:
                            "radial-gradient(circle at 30% 26%, rgba(160,180,255,0.55) 0%, rgba(100,80,200,0.32) 20%, transparent 46%), conic-gradient(from 210deg at 50% 50%, #120a24, #241448, #3a1f66, #17224e, #1c2f5e, #2a1550, #120a24)",
                          boxShadow:
                            "inset 0 0 8px rgba(180,190,255,0.25), 0 0 0 1px rgba(150,160,255,0.3)",
                        }
                      : undefined
                  }
                >
                  {d.badge ? (
                    d.badge
                  ) : (
                    <Image
                      src={`/images/dragonball-${d.day}-star-tight.png`}
                      alt={`Dia ${d.day}`}
                      fill
                      sizes="56px"
                      quality={90}
                      className="object-cover"
                    />
                  )}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-[#24211D]" : "text-[#24211D]/65"
                  }`}
                >
                  {d.city}
                </span>
                {d.date && (
                  <span
                    className={`flex flex-col items-center leading-tight tracking-[0.1em] ${
                      active ? "text-[#24211D]/72" : "text-[#24211D]/55"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {d.date.split(" ")[0]}
                    </span>
                    <span className="text-xs uppercase">
                      {d.date.split(" ")[1]}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="px-6 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/60 sm:px-10">
          Hotéis
        </p>
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 px-6 pt-3 sm:gap-x-7 sm:px-10">
          {DAYS.map((d, index) => {
            const isHotelSlot = index >= 0 && index <= 2;

            if (!isHotelSlot) {
              return (
                <div
                  key={d.day}
                  aria-hidden="true"
                  className="hidden h-14 w-14 shrink-0 opacity-0 sm:block"
                />
              );
            }

            const active = index === hotelCity && viewMode === "hotel";

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => {
                  setHotelCity(index);
                  setViewMode("hotel");
                  scrollToContent();
                }}
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    active
                      ? "border-[#173B45] bg-[#FDFCF9] text-[#24211D] hover:border-transparent hover:bg-[#173B45] hover:text-white"
                      : "border-[#DDD8CF] bg-[#FDFCF9] text-[#24211D]/72 hover:border-transparent hover:bg-[#173B45] hover:text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-[#24211D]" : "text-[#24211D]/65"
                  }`}
                >
                  {HOTEIS[index].cidade}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 px-6 pt-8 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/60">
            Informações Detalhadas
          </p>
          <span className="rounded-full border border-[#173B45]/25 bg-[#173B45]/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#173B45]">
            Detalhes Completos No Painel Digital
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-[#DDD8CF] px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {INFO_CARDS.map(({ label, Icon, view }) => {
            const cardClassName =
              "group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#DDD8CF] bg-[#FAF9F6] px-3 py-4 text-center text-xs leading-5 text-[#24211D]/75 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#173B45]/30 hover:bg-[#F8FAF9] hover:text-[#173B45] hover:shadow-[0_10px_30px_-15px_rgba(23,59,69,0.35)]";
            const content = (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8FAF9] text-[#173B45] transition group-hover:bg-[#FDFCF9]">
                  <Icon className="h-6 w-6" />
                </span>
                {label}
              </>
            );
            return view ? (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setViewMode(view);
                  scrollToContent();
                }}
                className={cardClassName}
              >
                {content}
              </button>
            ) : (
              <div key={label} className={cardClassName}>
                {content}
              </div>
            );
          })}
        </div>

        <div ref={contentRef} className="scroll-mt-6 px-6 py-8 sm:px-10 sm:py-10">
          {viewMode === "narita" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#173B45]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#173B45]">
                Aeroporto de Narita (NRT)
              </p>
              {/* -mx cancela o px-6/sm:px-10 do painel — o Narita já traz seu
                  próprio ritmo de espaçamento interno (mx-auto max-w-5xl
                  px-6), então sem isso ele ficava com margem dobrada nas
                  laterais, diferente do resto do conteúdo (Dia 1, Dia 2...). */}
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <NaritaGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "hotel" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#173B45]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#173B45]">
                Hotel · {HOTEIS[hotelCity].cidade}
              </p>
              <HotelGuestGuide hotel={HOTEIS[hotelCity]} />
            </>
          ) : current.travel ? (
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-6 text-center sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
                {current.city} · {current.date}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#24211D]/75">
                {current.travelNote}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#173B45]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#173B45]">
                Dia {current.day}
              </p>
              {current.contexto && (
                <ContextoBlock contexto={current.contexto} />
              )}
              {current.gradeHorarios && (
                <GradeHorariosBlock grade={current.gradeHorarios} />
              )}
              {current.transporte && (
                <TransporteBlock transporte={current.transporte} />
              )}
              {current.alerta && (
                <AlertaBlock alerta={current.alerta} />
              )}
              <div className="space-y-10">
                {current.manha && (
                  <PeriodBlock
                    label="Manhã"
                    period={current.manha}
                    displayClassName={displayClassName}
                  />
                )}
                {current.tarde && (
                  <PeriodBlock
                    label="Tarde"
                    period={current.tarde}
                    displayClassName={displayClassName}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={scrollToDaysMenu}
                className="mt-8 flex w-full flex-col items-center gap-2 rounded-2xl border border-[#173B45]/20 bg-[#F8FAF9] py-6 text-center transition hover:bg-[#EAF1EF]"
              >
                <span className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#173B45] text-white">
                  <IconArrowUp className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B45]">
                  Voltar para o menu de dias do roteiro
                </span>
              </button>
            </>
          )}
        </div>
        </div>
      </div>

    </>
  );
}
