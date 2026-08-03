"use client";

import { useRef, useState } from "react";

// Painel de aprovação de rascunho — mesma lógica visual do Painel Interativo
// usado em /ajisairoteiros (pílulas, abas de dia, tipografia Bodoni Moda),
// mas em tema claro e sem hero, já que aqui o objetivo é só validação rápida
// das informações principais pelo cliente antes de iniciarmos o painel
// digital completo.

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

type Period = {
  label?: string;
  regiao?: Regiao;
  atracaoPrincipal: string;
  atracaoPrincipalImagem?: string;
  atracaoPrincipalFoco?: "top" | "center" | "bottom";
  pois: Poi[];
  gastronomia?: Gastronomia;
  comprasExclusivas?: ComprasExclusivas;
};

type TransporteSugerido = {
  linha: string;
  tempo: string;
  recomendacao: string;
};

type DayContent = {
  day: number;
  badge?: string;
  city: string;
  date?: string;
  contexto?: string[];
  travel?: boolean;
  travelNote?: string;
  manha?: Period;
  tarde?: Period;
  transporte?: TransporteSugerido;
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
  contexto: [
    "Nesse primeiro dia vamos explorar a parte mais tradicional de Tokyo, visitar o maior templo de Tokyo e conhecer um pouco a história de como Edo se transformou em Tokyo.",
    "Depois vamos para Tokyo Sky Tree, a torre mais alta de Tokyo que vai te ajudar a entender a ter uma visão macro da cidade antes de iniciar sua jornada por diversos bairros nos próximos dias.",
  ],
  manha: {
    regiao: {
      nome: "Taito",
      descricao:
        "Taito é um dos bairros mais antigos de Tokyo e já era um dos principais quando a cidade ainda era chamada Edo, a fundação do bairro ocorreu por volta do ano 1600, até hoje é um dos bairros da Tokyo Antiga preservando alguns costumes milenares que já foram abandonados em outras partes da cidade, um dos exemplos é que até hoje existem vendedores de leite em garrafa de vidro que passam de casa em casa antes de amanhecer.",
    },
    atracaoPrincipal: "Templo Sensoji Asakusa",
    atracaoPrincipalImagem: "/images/dia1-sensoji.png",
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
    label: "Tarde/Noite",
    regiao: {
      nome: "Sumida + Ryogoku",
      descricao:
        "Sumida é o bairro que abriga a Tokyo Sky Tree (Torre mais alta do Japão) desde 2012, o bairro como o próprio nome diz cresceu as margens do Rio Sumida que antigamente era uma das principais rotas de transporte marítimo de Tokyo. Ryogoku é o bairro onde fica o estádio nacional de sumô Kokugikan e centro do sumô com infraestrutura de gastronomia e temática de sumô nas ruas, também é onde fica um dos maiores museus de Tokyo, Tokyo-Edo Museum, que conta através de maquetes gigantes como foi a transformação de Edo (1603) até Tokyo (1868).",
    },
    atracaoPrincipal: "Tokyo Sky Tree",
    atracaoPrincipalImagem: "/images/dia1-skytree.png",
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
      {
        title: "Museu Edo-Tokyo",
        bairro: "Ryogoku",
        description: "Reabertura em 2026 após 4 anos fechado",
        rating: 4,
      },
      {
        title: "Estádio Kokugikan + Área Externa Edo Noren",
        bairro: "Ryogoku",
        description: "Arena de sumô e vila gastronômica temática.",
        rating: 3,
      },
      {
        title: "Museu de Espadas",
        bairro: "Ryogoku",
        description: "Coleção de espadas samurai tradicionais.",
        rating: 3,
      },
      {
        title: "Santuário Nomi-no-Sukune",
        bairro: "Ryogoku",
        description:
          "Monumento com os nomes de todos os Yokozuna (Título máximo de lutador de Sumô)",
        rating: 2,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Chanko Nabe",
          descricao:
            "Ensopado altamente calórico que os lutadores de Sumô comem diariamente pra conseguir manter o peso",
        },
      ],
    },
  },
};

const DAY_2: DayContent = {
  day: 4,
  city: "Tokyo",
  date: "08 Mai",
  contexto: [
    "Neste dia iremos visitar o lado mais comercial do Japão e o centro financeiro. Começamos o passeio com uma visita a Tokyo Station para que você possa ir diretamente à Dragonball Store, que fica dentro do complexo da estação, na mesma área onde existem lojas das principais franquias de anime.",
    "Depois passamos rapidamente pela região de Otemachi, onde fica a sede das maiores empresas japonesas, para ver um pouco do lado moderno do Japão. Perto dali se encontram dois pontos históricos importantes: o marco zero (Nihonbashi) e o Palácio Imperial, onde mora o imperador do Japão.",
  ],
  manha: {
    regiao: {
      nome: "Marunouchi + Otemachi",
      descricao:
        "Marunouchi, junto do seu distrito vizinho Otemachi, é desde os tempos feudais um dos pilares da economia japonesa. Fica nessa região a estação central de trem do Japão, Tokyo Station, que junto da estação de Shinagawa são as únicas com acesso ao trem-bala em Tóquio. Nos arredores da estação você encontrará a sede de praticamente todos os bancos, seguradoras e boa parte das grandes empresas japonesas — o local funciona como a Wall Street ou a Faria Lima do Japão.",
    },
    atracaoPrincipal: "Tokyo Station",
    atracaoPrincipalImagem: "/images/dia2-tokyostation.png",
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
        title: "Nihonbashi",
        description:
          "Marco zero das estradas e vias de Tóquio. Entre 1600 e 1868 foi o centro comercial do Japão — aqui você encontra prédios e lojas centenárias que funcionam até hoje, como Mitsukoshi (1673), Yamatoyama (1690), Ninben (1699) e Sembikiya (1834).",
        rating: 3,
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
    label: "Tarde/Noite",
    regiao: {
      nome: "Ginza + Chiyoda",
      descricao:
        "Ginza é o distrito de compras mais tradicional e sofisticado de Tóquio, com lojas de luxo instaladas ali desde a era Meiji. Chiyoda é o bairro central que abriga o Palácio Imperial e boa parte dos órgãos do governo japonês — os dois formam o contraponto elegante e histórico ao lado corporativo de Marunouchi visto pela manhã.",
    },
    atracaoPrincipal: "Distrito de Ginza",
    atracaoPrincipalImagem: "/images/dia2-ginza.png",
    atracaoPrincipalFoco: "center",
    pois: [
      {
        category: "Compras",
        title: "Ginza Six, Uniqlo Ginza e MUJI Ginza",
        description:
          "Lojas âncora do distrito — ótimo ponto de partida para o passeio a pé por Ginza.",
      },
      {
        title: "Área Externa do Palácio Imperial",
        description: "Jardins e muralhas onde vive o imperador.",
        rating: 3,
      },
      {
        title: "Parque de Hibiya",
        description:
          "Primeiro parque com temática ocidental do Japão — bom para um passeio rápido.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Itoya",
        description:
          "Uma das maiores lojas de papelaria do Japão, com 12 andares — de canetas a acessórios.",
        rating: 3,
      },
      {
        title: "Tsukiji Outer Market",
        description:
          "Antigo mercado de peixes de Tóquio antes da mudança para Toyosu. O mercado em si não existe mais, mas a estrutura de restaurantes e lojas de rua no entorno permanece ativa.",
        rating: 2,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Menu Degustação de Sushi",
          descricao: "Sugestão: Hakkoku (necessário reserva antecipada).",
        },
        {
          nome: "Ramen (Estilo Hakata Fukuoka) + Gyoza",
          descricao: "Sugestão: Ippudo Ginza.",
        },
      ],
    },
  },
  transporte: {
    linha: "Shinkansen Tokyo–Kyoto",
    tempo: "Hikari: ~2h40 (incluso no JR Pass)",
    recomendacao:
      "Recomendamos fortemente que a viagem para Kyoto seja feita neste dia, porque os pontos turísticos que iremos visitar são melhores logo no começo da manhã — depois sofrem com superlotação.",
  },
};

const DAY_3: DayContent = {
  day: 3,
  city: "Tokyo",
  date: "07 Mai",
  contexto: [
    "O superdistrito de Shibuya é um dos bairros mais famosos, principalmente pela Shibuya Crossing e pela impressionante floresta erguida do zero que tem no centro o maior templo Shintoísta do mundo. Nessa região encontraremos Harajuku, o epicentro da cultura Lolita, Kawaii e Jovem do Japão, bem como a luxuosa avenida de Omotesando, com parada obrigatória no topo do edifício Shibuya Sky, que tem uma das maiores escadas rolantes do mundo.",
  ],
  manha: {
    regiao: {
      nome: "Superdistrito de Shibuya",
      descricao:
        "Aqui iremos explorar o superdistrito de Shibuya, que compreende as áreas de Yoyogi, Omotesando e Harajuku.",
    },
    atracaoPrincipal: "Meiji Jingu",
    atracaoPrincipalImagem: "/images/dia3-meijijingu.png",
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
    label: "Tarde/Noite",
    regiao: {
      nome: "Superdistrito de Shibuya",
      descricao:
        "Mesma região da manhã, agora com foco no lado mais moderno e jovem do bairro: a vista do topo do Shibuya Sky, a efervescência de Harajuku e Daikanyama, e o Estádio Nacional, que ficou mundialmente conhecido nas Olimpíadas de Tóquio 2020.",
    },
    atracaoPrincipal: "Shibuya Sky",
    atracaoPrincipalImagem: "/images/dia3-shibuyasky.png",
    pois: [
      {
        title: "Takeshita Street",
        description:
          "Rua caótica que funciona como ponto de encontro da cultura Lolita, Kawaii, Decora e Visual Kei.",
        rating: 4,
      },
      {
        title: "Daikanyama T-Site",
        description:
          "Projeto arquitetônico para criar uma das livrarias mais bonitas do mundo — a TSUTAYA, que na prática vende poucos livros; a maior parte do espaço é usada como área de leitura, estudo e trabalho.",
        rating: 3,
      },
      {
        title: "National Stadium",
        description:
          "Principal estádio poliesportivo do Japão, com arquitetura arrojada projetada pelo arquiteto Kengo Kuma — famoso por ser o ponto final da Maratona de Tóquio.",
        rating: 2,
      },
    ],
    gastronomia: {
      subtitulo: "Comidas da Takeshita Street",
      itens: [
        { nome: "Crepes japoneses recheados" },
        { nome: "Algodão-doce gigante" },
        { nome: "Morangos cobertos com chocolate" },
        { nome: "Batatas em espiral" },
      ],
    },
  },
};

const DAY_4: DayContent = {
  day: 2,
  city: "Tokyo",
  date: "06 Mai",
  contexto: [
    "Neste dia iremos explorar experiências de entretenimento e visualizar um dos pontos turísticos mais famosos do Japão — a Tokyo Tower. Dentro das experiências de entretenimento temos o teamLab Borderless, o Museu de Arte Moderna Mori e a vida noturna de Roppongi com as baladas.",
  ],
  manha: {
    regiao: {
      nome: "Minato",
      descricao:
        "Minato é um dos bairros mais diversos de Tóquio, misturando marcos históricos como o Templo Zojo-ji e a Tokyo Tower com empreendimentos modernos como o Azabudai Hills — o mais novo e ousado complexo da cidade, que abriga o teamLab Borderless. À noite, o bairro se transforma no principal polo de vida noturna de Tóquio, com Roppongi concentrando boa parte das baladas e bares da cidade.",
    },
    atracaoPrincipal: "teamLab Borderless (Toranomon)",
    atracaoPrincipalImagem: "/images/dia4-teamlab-v3.png",
    pois: [
      {
        title: "Tokyo Tower",
        description: "Torre de comunicação símbolo de Tóquio.",
        rating: 4,
      },
      {
        title: "Complexo Comercial Azabudai Hills",
        description:
          "Complexo com arquitetura arrojada que abriga restaurantes de elite e a atração principal, o teamLab Borderless.",
        rating: 3,
      },
      {
        title: "Templo Zojo-ji",
        description: "Templo budista histórico aos pés da Tokyo Tower.",
        rating: 3,
      },
      {
        title: "Odaiba + Rainbow Bridge + Estátua de Gundam",
        description: "Ilha artificial com vista, ponte iluminada e estátua do Gundam.",
        rating: 3,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Barbacoa",
          descricao: "Famosa churrascaria brasileira, só que no Japão.",
        },
      ],
    },
  },
  tarde: {
    label: "Noite",
    regiao: {
      nome: "Minato",
      descricao:
        "Mesma região da manhã, agora com foco no lado noturno e cultural do bairro: os museus e jardins do Mori Tower, o Hinokicho Park e a vida noturna badalada de Roppongi.",
    },
    atracaoPrincipal: "R3 Club Lounge ou V2 Tokyo (Roppongi)",
    atracaoPrincipalImagem: "/images/dia4-roppongi.png",
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
};

const DAY_5: DayContent = {
  day: 5,
  city: "Kyoto",
  date: "09 Mai",
  contexto: [
    "Se Tóquio é sinônimo de modernidade e tecnologia mesclada à parte cultural, Kyoto é um patrimônio histórico. Nesses dois dias iremos visitar 3 dos principais pontos turísticos do Japão: Kiyomizu-dera + Gion, Kinkaku-ji e Fushimi-Inari Taisha.",
  ],
  manha: {
    regiao: {
      nome: "Higashiyama",
      descricao:
        "Bairro aos pés das colinas do leste de Kyoto, preservado desde o período Edo — reúne o Kiyomizu-dera e as ladeiras históricas de Ninenzaka e Sannenzaka.",
    },
    atracaoPrincipal: "Templo Kiyomizu-dera",
    atracaoPrincipalImagem: "/images/dia5-kiyomizudera.jpg",
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
    label: "Tarde/Noite",
    regiao: {
      nome: "Gion",
      descricao:
        "O distrito de gueixas mais famoso do Japão, com casas de chá tradicionais, o Santuário Yasaka e a viela de Pontocho às margens do rio Kamo.",
    },
    atracaoPrincipal: "Distrito de Gion",
    atracaoPrincipalImagem: "/images/dia5-gion-v2.png",
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
  day: 6,
  city: "Kyoto",
  date: "10 Mai",
  contexto: [
    "No segundo dia em Kyoto, começamos cedo no Santuário Fushimi Inari para aproveitar o famoso corredor de milhares de torii antes das aglomerações. À tarde seguimos para o Kinkaku-ji, o Pavilhão Dourado, e aproveitamos para conhecer outros templos e cafés da região norte da cidade.",
  ],
  manha: {
    regiao: {
      nome: "Fushimi",
      descricao:
        "Bairro ao sul de Kyoto, historicamente ligado à produção de saquê — hoje conhecido principalmente pelos milhares de torii do Santuário Fushimi Inari.",
    },
    atracaoPrincipal: "Fushimi-Inari Taisha",
    atracaoPrincipalImagem: "/images/dia6-fushimiinari.png",
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
    atracaoPrincipal: "Kinkaku-ji",
    atracaoPrincipalImagem: "/images/dia6-kinkakuji.png",
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
      "Não existe necessidade de chegar muito cedo em Tokyo para o dia 7 — você pode pegar o trem tanto no final deste dia quanto bem cedo pela manhã, já de volta para Tokyo.",
  },
};

const DAY_7: DayContent = {
  day: 7,
  city: "Tokyo",
  date: "11 Mai",
  contexto: [
    "No último dia da viagem vamos finalmente a Akihabara, epicentro da cultura de Animes & Mangá, Videogames e Artigos Eletrônicos.",
    "Depois de Akihabara vamos visitar um izakaya fora do circuito turístico de Tokyo em Kanda para uma experiência autêntica.",
  ],
  manha: {
    regiao: {
      nome: "Akihabara",
      descricao:
        "Bairro de Chiyoda conhecido como o centro mundial da cultura otaku, com lojas de eletrônicos, anime, mangá e videogame concentradas em poucas quadras.",
    },
    atracaoPrincipal: "Akihabara Electric Town",
    atracaoPrincipalImagem: "/images/dia7-akihabara.png",
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
    ],
    gastronomia: {
      itens: [{ nome: "Curry Japonês" }],
    },
  },
  tarde: {
    label: "Tarde/Noite",
    regiao: {
      nome: "Kanda",
      descricao:
        "Bairro tradicional de Chiyoda, vizinho a Akihabara — conhecido pelos izakayas e por uma vida noturna mais local, longe do circuito turístico.",
    },
    atracaoPrincipal: "Izakaya em Kanda (酒場なごみ堂)",
    atracaoPrincipalImagem: "/images/dia7-izakaya-kanda-v2.png",
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
  },
};

const OSAKA_DAY_5: DayContent = {
  day: 5,
  city: "Osaka",
  date: "09 Mai",
  contexto: [
    "Nesta versão alternativa do roteiro, trocamos os templos de Kyoto por um dia inteiro de diversão na Universal Studios Japan, com destaque para a área do Super Nintendo World — ideal para quem viaja com crianças ou quer uma pausa mais leve em meio à viagem.",
  ],
  manha: {
    regiao: {
      nome: "Sakurajima (Konohana-ku)",
      descricao:
        "Península à beira da Baía de Osaka que abriga o parque temático da Universal Studios Japan e a área do Super Nintendo World.",
    },
    atracaoPrincipal: "Universal Studios Japan & Super Nintendo World",
    atracaoPrincipalImagem: "/images/osaka5-nintendoworld-v2.jpg",
    pois: [
      {
        title: "Mario Kart: Koopa's Challenge",
        description: "Corrida com realidade aumentada — a atração mais concorrida do parque.",
        rating: 5,
      },
      {
        title: "Harry Potter and the Forbidden Journey",
        description: "Simulador imersivo dentro do castelo de Hogwarts.",
        rating: 5,
      },
      {
        title: "The Flying Dinosaur",
        description: "Montanha-russa invertida, uma das mais radicais do mundo.",
        rating: 5,
      },
      {
        title: "Hollywood Dream: The Ride",
        description: "Montanha-russa com trilha sonora escolhida pelo passageiro.",
        rating: 4,
      },
      {
        title: "Jurassic Park - The Ride",
        description: "Passeio aquático com dinossauros animatrônicos e queda final.",
        rating: 4,
      },
      {
        title: "Minion Park (Despicable Me Minion Mayhem)",
        description: "Simulador 3D e área temática ideal para famílias.",
        rating: 4,
      },
    ],
    gastronomia: {
      subtitulo: "Food carts espalhados pelo parque",
      itens: [
        { nome: "Shark Bun", descricao: "Amity Village." },
        { nome: "Turkey Leg Bun" },
        { nome: "Churros temáticos", descricao: "Hogwarts, Minions e outros." },
        { nome: "Caramel Popcorn Churritos" },
      ],
    },
    comprasExclusivas: {
      descricao:
        "O parque vende centenas de itens exclusivos — canecas, baldes de pipoca e acessórios temáticos que não são encontrados em nenhuma loja fora da Universal Studios Japan. Boa parte é produzida em lotes limitados e sai de linha permanentemente assim que o estoque acaba, sem republicação.",
      itens: [
        { nome: "Caneca Donkey Kong", imagem: "/images/usj-dk-mug.png" },
        {
          nome: "Balde de Pipoca Mario Kart",
          imagem: "/images/usj-mariokart-popcorn.jpg",
        },
        {
          nome: "Balde de Pipoca Superstar",
          imagem: "/images/usj-superstar-popcorn.png",
        },
        { nome: "Caneca Yoshi", imagem: "/images/usj-yoshi-mug.jpg" },
      ],
    },
  },
};

const OSAKA_DAY_6: DayContent = {
  day: 6,
  city: "Osaka",
  date: "10 Mai",
  contexto: [
    "No segundo dia em Osaka, começamos pelo Castelo de Osaka, um dos marcos históricos mais importantes da cidade, e à noite mergulhamos em Dotombori — o coração da vida noturna e gastronômica, com seus letreiros icônicos e comida de rua.",
  ],
  manha: {
    regiao: {
      nome: "Chuo-ku (Osaka-jo)",
      descricao:
        "Região central de Osaka onde fica o Castelo de Osaka, cercado por um extenso parque e fosso histórico.",
    },
    atracaoPrincipal: "Osaka Castle",
    atracaoPrincipalImagem: "/images/osaka6-castle.png",
    pois: [],
    gastronomia: {
      itens: [{ nome: "Kushikatsu" }],
    },
  },
  tarde: {
    label: "Tarde/Noite",
    regiao: {
      nome: "Dotombori (Namba)",
      descricao:
        "Coração da vida noturna e gastronômica de Osaka, às margens do Canal Dotombori — famoso pelos letreiros iluminados e pela comida de rua.",
    },
    atracaoPrincipal: "Dotombori",
    atracaoPrincipalImagem: "/images/osaka6-dotombori.png",
    pois: [],
    gastronomia: {
      itens: [{ nome: "Takoyaki" }, { nome: "Wagyu" }],
    },
  },
  transporte: {
    linha: "Shinkansen Shin-Osaka–Tokyo",
    tempo: "Hikari: ~3h (incluso no JR Pass)",
    recomendacao:
      "Não existe necessidade de chegar muito cedo em Tokyo para o dia 7 — você pode pegar o trem tanto no final deste dia quanto bem cedo pela manhã, já de volta para Tokyo.",
  },
};

const OSAKA_ALT: Record<number, DayContent> = {
  5: OSAKA_DAY_5,
  6: OSAKA_DAY_6,
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
  DAY_2,
  DAY_5,
  DAY_6,
  DAY_7,
  PARTIDA,
];

// Paleta por bairro — Sumida fica no azul padrão dos cards, Ryogoku ganha um
// roxo próprio (mesma família do lilás já usado no site) só pra deixar
// visualmente óbvio, num roteiro que mistura os dois bairros na mesma tarde,
// que são regiões diferentes.
const BAIRRO_STYLES = {
  Sumida: {
    border: "border-[#2f5aa8]",
    bg: "bg-[#eef3fb]",
    circle: "bg-[#2f5aa8]",
    text: "text-[#2f5aa8]",
    muted: "text-[#2f5aa8]/70",
    starMuted: "text-[#2f5aa8]/25",
    badge: "border-[#2f5aa8]/30 bg-[#2f5aa8]/10 text-[#2f5aa8]",
    chip: "border-[#2f5aa8]/25 bg-white text-[#2f5aa8]",
  },
  Ryogoku: {
    border: "border-[#7c4fd1]",
    bg: "bg-[#f3eefc]",
    circle: "bg-[#7c4fd1]",
    text: "text-[#7c4fd1]",
    muted: "text-[#7c4fd1]/70",
    starMuted: "text-[#7c4fd1]/25",
    badge: "border-[#7c4fd1]/30 bg-[#7c4fd1]/10 text-[#7c4fd1]",
    chip: "border-[#7c4fd1]/25 bg-white text-[#7c4fd1]",
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
            <span className="rounded-full border border-[#caa62c] bg-[#fdf0c8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6d1a]">
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
    <div className="mb-10 rounded-2xl border border-black/10 bg-black/[0.02] p-5 sm:p-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-black/45">
        Contexto
      </p>
      <div className="space-y-3">
        {contexto.map((paragrafo, index) => (
          <p key={index} className="text-sm leading-6 text-black/65">
            {paragrafo}
          </p>
        ))}
      </div>
    </div>
  );
}

function GastronomiaBlock({ gastronomia }: { gastronomia: Gastronomia }) {
  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
        Gastronomia
        {gastronomia.subtitulo && (
          <span className="ml-2 font-normal normal-case tracking-normal text-black/40">
            ({gastronomia.subtitulo})
          </span>
        )}
      </p>
      <ul className="mt-3 space-y-1.5">
        {gastronomia.itens.map((item) => (
          <li key={item.nome} className="text-sm leading-6 text-black/65">
            <span className="font-semibold text-black/80">{item.nome}</span>
            {item.descricao && (
              <span className="text-black/55"> — {item.descricao}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-black/10 pt-3 text-xs leading-5 text-black/45">
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
    <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
        Compras Exclusivas
      </p>
      <p className="mt-2 text-sm leading-6 text-black/60">
        {compras.descricao}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {compras.itens.map((item) => (
          <div
            key={item.nome}
            className="overflow-hidden rounded-xl border border-black/10 bg-white"
          >
            {item.imagem ? (
              <img
                src={item.imagem}
                alt={item.nome}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-black/[0.03] text-[10px] uppercase tracking-wide text-black/30">
                Sem imagem
              </div>
            )}
            <p className="p-2 text-center text-xs font-medium leading-4 text-black/70">
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
      <p className="text-lg font-semibold text-black">{transporte.linha}</p>
      <p className="mt-1 text-sm text-black/60">{transporte.tempo}</p>
      <p className="mt-3 text-sm leading-6 text-black/70">
        {transporte.recomendacao}
      </p>
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
  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          {period.label ?? label}
        </span>
      </div>

      {period.regiao && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">
            Região: {period.regiao.nome}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-black/60">
            {period.regiao.descricao}
          </p>
        </div>
      )}

      <p className="mb-2 text-xs text-black/40">Atração Principal</p>
      <div
        className={`relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10] ${
          period.atracaoPrincipalImagem ? "" : "border-2 border-[#2f5aa8]"
        }`}
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
            <h3
              className={`${displayClassName} absolute inset-x-5 bottom-4 text-2xl font-medium leading-snug text-white md:text-3xl`}
            >
              {period.atracaoPrincipal}
            </h3>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[#eef3fb] px-5">
            <h3
              className={`${displayClassName} text-2xl font-medium text-[#2f5aa8] md:text-3xl`}
            >
              {period.atracaoPrincipal}
            </h3>
          </div>
        )}
      </div>

      <p className="mb-5 text-xs text-black/40">
        Pontos de interesse propostos para o período
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {period.pois.map((poi, index) => (
          <PoiCard key={poi.title + index} index={index} poi={poi} />
        ))}
      </div>

      {period.gastronomia && (
        <GastronomiaBlock gastronomia={period.gastronomia} />
      )}
      {period.comprasExclusivas && (
        <ComprasExclusivasBlock compras={period.comprasExclusivas} />
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

function IconPin({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.3" />
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
  { label: "Aeroporto NRT (Narita)", Icon: IconPlane },
  { label: "Metrô", Icon: IconMetro },
  { label: "Ônibus", Icon: IconBus },
  { label: "Trem Bala (Shinkansen)", Icon: IconShinkansen },
  { label: "Câmbio", Icon: IconExchange },
  { label: "Costumes", Icon: IconCustoms },
  { label: "Palavras Comuns", Icon: IconWords },
];

function IconTicket({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a1.5 1.5 0 0 0 0-3z" />
      <line x1="10" y1="7" x2="10" y2="18" strokeDasharray="1.5 2.5" />
    </svg>
  );
}

function IconCash({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="6" y1="9" x2="6" y2="9.01" />
      <line x1="18" y1="15" x2="18" y2="15.01" />
    </svg>
  );
}

function IconDriver({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 16h14l-1.5-6a2 2 0 0 0-1.9-1.5H8.4A2 2 0 0 0 6.5 10z" />
      <circle cx="7.5" cy="16.5" r="1.5" />
      <circle cx="16.5" cy="16.5" r="1.5" />
      <line x1="8" y1="10" x2="16" y2="10" />
    </svg>
  );
}

function IconConcierge({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 18a8 8 0 0 1 16 0" />
      <path d="M4 18h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4z" />
      <path d="M20 18h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1z" />
      <path d="M12 18v1a2 2 0 0 1-2 2H9" />
    </svg>
  );
}

const ADDITIONAL_SERVICES = [
  { label: "Ticket para USJ/Disney/teamLab", Icon: IconTicket },
  { label: "Reserva para Restaurantes", Icon: IconFork },
  { label: "Serviço de Câmbio no Brasil", Icon: IconCash },
  { label: "Motorista Particular", Icon: IconDriver },
  { label: "Cobertura Expandida para Concierge", Icon: IconConcierge },
];

function IconCheck({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
    </svg>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 2 20 2 22 4v8L12 22 2 12 2 4z" />
      <circle cx="15" cy="7" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

function IconWrench({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M14.7 6.3a4 4 0 0 0-5.6 5.1L3 17.5 6.5 21l6.1-6.1a4 4 0 0 0 5.1-5.6l-3 3-2.6-2.6z" />
    </svg>
  );
}

function IconBed({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 19v2M21 19v2" />
      <path d="M3 14V8a1 1 0 0 1 1-1h6v5" />
      <circle cx="7" cy="10" r="1.3" />
    </svg>
  );
}

function IconYen({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 4l6 8 6-8" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

function IconBookingLogo({ className: _className }: { className?: string }) {
  return (
    <img
      src="/images/Booking.com-Logo-trimmed.png"
      alt="Booking.com"
      className="h-5 w-auto shrink-0 object-contain"
    />
  );
}

function IconTrivagoLogo({ className: _className }: { className?: string }) {
  return (
    <img
      src="/images/Trivago_logo_2023.svg.webp"
      alt="Trivago"
      className="h-5 w-auto shrink-0 object-contain"
    />
  );
}

function IconWalk({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="13" cy="4" r="1.6" fill="currentColor" stroke="none" />
      <path d="M10 21l1.5-5.5L9 14l1-4.5 3-1.5 2 2 3 1" />
      <path d="M11.5 15.5 15 17l1.5 4" />
    </svg>
  );
}

function IconBath({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M4 12V7a2 2 0 0 1 3-1.7" />
      <line x1="2" y1="19" x2="22" y2="19" />
      <line x1="9" y1="6" x2="9" y2="4" />
    </svg>
  );
}

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

function IconSwim({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
      <circle cx="17" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4 13l6-2 3 2 4-3" />
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

type HotelOpcao = {
  nome: string;
  notaAlpinea: number;
  perfil: string;
  inauguracao: string;
  inauguracaoNota?: string;
  reforma: string;
  quarto: string;
  preco: string;
  bairro: string;
  estacao: string;
  distanciaEstacao: string;
  distanciaTokyoStation?: string;
  ofuro: boolean;
  restaurante: boolean;
  academia: boolean;
  piscina: boolean;
  konbini: string;
  site?: string;
  avaliacaoBooking?: number;
  avaliacaoTrivago?: number;
};

type HotelCidade = {
  cidade: string;
  opcoes: HotelOpcao[];
};

const HOTEIS: HotelCidade[] = [
  {
    cidade: "Tokyo",
    opcoes: [
      {
        nome: "Mitsui Garden Nihonbashi Premier",
        notaAlpinea: 98,
        perfil: "Melhor experiência",
        inauguracao: "2018",
        inauguracaoNota: "Mitsui Fudosan",
        reforma: "Não",
        quarto: "20 m²",
        preco: "¥28–45 mil",
        bairro: "Nihonbashi",
        estacao: "Mitsukoshimae",
        distanciaEstacao: "1 min",
        distanciaTokyoStation: "8–10 min a pé",
        ofuro: true,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "FamilyMart (30 m)",
        site: "https://www.gardenhotels.co.jp/nihonbashi-premier/eng/",
        avaliacaoBooking: 8.9,
        avaliacaoTrivago: 9.0,
      },
      {
        nome: "Hotel Intergate Tokyo Kyobashi",
        notaAlpinea: 97,
        perfil: "Melhor localização / Custo-benefício",
        inauguracao: "2018",
        reforma: "Não",
        quarto: "15 m² (19 m² recomendado)",
        preco: "¥18–32 mil",
        bairro: "Kyobashi",
        estacao: "Kyobashi",
        distanciaEstacao: "1 min",
        distanciaTokyoStation: "6–8 min a pé",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "Lawson (20 m)",
        site: "https://www.intergatehotels.jp/tokyo-kyobashi/en/facility/",
        avaliacaoBooking: 8.5,
        avaliacaoTrivago: 8.7,
      },
      {
        nome: "Richmond Hotel Premier Tokyo Schole",
        notaAlpinea: 96,
        perfil: "Conceito boutique com lounge social",
        inauguracao: "2015",
        reforma: "Não",
        quarto: "18–26 m²",
        preco: "¥19–30 mil",
        bairro: "Oshiage",
        estacao: "Oshiage (Skytree)",
        distanciaEstacao: "2 min",
        distanciaTokyoStation: "15–20 min",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "FamilyMart (em frente)",
        site: "https://richmondhotel.jp/tokyo-oshiage/",
        avaliacaoBooking: 9.1,
        avaliacaoTrivago: 9.1,
      },
    ],
  },
  {
    cidade: "Kyoto",
    opcoes: [
      {
        nome: "Daiwa Roynet Kyoto Ekimae PREMIER",
        notaAlpinea: 98,
        perfil: "Melhor custo-benefício",
        inauguracao: "2016",
        reforma: "Não",
        quarto: "21 m²",
        preco: "¥18–30 mil",
        bairro: "Karasuma-guchi (frente à Kyoto Station)",
        estacao: "Kyoto Station",
        distanciaEstacao: "3 min",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "Lawson (20 m)",
        site: "https://www.daiwaroynet.jp/en/kyoto-ekimae/",
        avaliacaoBooking: 8.7,
        avaliacaoTrivago: 9.0,
      },
      {
        nome: "Hotel Vischio Kyoto by GRANVIA",
        notaAlpinea: 97,
        perfil: "Melhor equilíbrio",
        inauguracao: "2019",
        reforma: "Não",
        quarto: "20 m²",
        preco: "¥20–33 mil",
        bairro: "Higashikujo (saída Hachijo da Kyoto Station)",
        estacao: "Kyoto Station",
        distanciaEstacao: "2 min",
        ofuro: true,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "FamilyMart (30 m)",
        site: "https://www.hotelvischio-kyoto.com/en/",
        avaliacaoBooking: 9.0,
        avaliacaoTrivago: 9.1,
      },
      {
        nome: "Hotel Kanra Kyoto",
        notaAlpinea: 99,
        perfil: "Maior quarto pelo investimento",
        inauguracao: "2010",
        reforma: "Renovações graduais de quartos e áreas comuns",
        quarto: "30 m²",
        preco: "¥28–40 mil",
        bairro: "Gojo (Karasuma-dori)",
        estacao: "Gojo Station (10 min de Kyoto Station)",
        distanciaEstacao: "1 min até Gojo",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "Lawson (30 m)",
        site: "https://www.uds-hotels.com/en/kanra/kyoto/facilities/",
        avaliacaoBooking: 9.3,
        avaliacaoTrivago: 9.3,
      },
    ],
  },
  {
    cidade: "Osaka",
    opcoes: [
      {
        nome: "Citadines Namba Osaka",
        notaAlpinea: 99,
        perfil: "Maior quarto pelo investimento",
        inauguracao: "2020",
        inauguracaoNota: "prédio histórico restaurado",
        reforma: "Não",
        quarto: "25 m²",
        preco: "¥20–34 mil",
        bairro: "Namba",
        estacao: "Namba Station",
        distanciaEstacao: "8 min",
        ofuro: false,
        restaurante: true,
        academia: true,
        piscina: false,
        konbini: "FamilyMart (15 m)",
        site: "https://www.discoverasr.com/en/citadines/japan/citadines-namba-osaka/amenities",
        avaliacaoBooking: 9.1,
        avaliacaoTrivago: 9.3,
      },
      {
        nome: "Hotel Keihan Namba Grande",
        notaAlpinea: 98,
        perfil: "Melhor custo-benefício",
        inauguracao: "2023",
        reforma: "Não",
        quarto: "21 m²",
        preco: "¥18–30 mil",
        bairro: "Namba (Naniwa-ku)",
        estacao: "Namba Station",
        distanciaEstacao: "5 min",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "FamilyMart (20 m)",
        site: "https://namba.hotelkeihan.co.jp/rooms/",
        avaliacaoBooking: 8.6,
        avaliacaoTrivago: 8.9,
      },
      {
        nome: "Cross Hotel Osaka",
        notaAlpinea: 98,
        perfil: "Melhor localização",
        inauguracao: "2007",
        reforma: "Reforma completa em 2020–2021",
        quarto: "27 m²",
        preco: "¥22–35 mil",
        bairro: "Shinsaibashi",
        estacao: "Namba Station",
        distanciaEstacao: "3 min",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "Lawson (20 m)",
        site: "https://global-cross-osaka.orixhotelsandresorts.com/LUC2ORIXOS/cdata/luc2orixos_0_jaen.html",
        avaliacaoBooking: 8.9,
        avaliacaoTrivago: 9.0,
      },
    ],
  },
];

function HotelBoolCell({ value }: { value: boolean }) {
  return value ? (
    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
      <IconCheck className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-500">
      <IconX className="h-3.5 w-3.5" />
    </span>
  );
}

function HotelComparisonTable({ cidade }: { cidade: HotelCidade }) {
  const temTokyoStation = cidade.opcoes.some((h) => h.distanciaTokyoStation);

  const rows = [
    {
      label: "Perfil",
      Icon: IconTag,
      render: (h: HotelOpcao) => h.perfil,
    },
    {
      label: "Inauguração",
      Icon: IconCalendar,
      render: (h: HotelOpcao) => (
        <>
          {h.inauguracao}
          {h.inauguracaoNota && (
            <span className="block text-xs text-black/40">
              {h.inauguracaoNota}
            </span>
          )}
        </>
      ),
    },
    {
      label: "Reforma recente",
      Icon: IconWrench,
      render: (h: HotelOpcao) => h.reforma,
    },
    {
      label: "Quarto Standard",
      Icon: IconBed,
      render: (h: HotelOpcao) => h.quarto,
    },
    {
      label: "Preço médio",
      Icon: IconYen,
      render: (h: HotelOpcao) => h.preco,
    },
    {
      label: "Bairro",
      Icon: IconPin,
      render: (h: HotelOpcao) => h.bairro,
    },
    {
      label: "Estação",
      Icon: IconMetro,
      render: (h: HotelOpcao) => h.estacao,
    },
    {
      label: "Distância estação",
      Icon: IconWalk,
      render: (h: HotelOpcao) => h.distanciaEstacao,
    },
    ...(temTokyoStation
      ? [
          {
            label: "Tokyo Station",
            Icon: IconWalk,
            render: (h: HotelOpcao) => h.distanciaTokyoStation ?? "—",
          },
        ]
      : []),
    {
      label: "Ofurô",
      Icon: IconBath,
      render: (h: HotelOpcao) => <HotelBoolCell value={h.ofuro} />,
    },
    {
      label: "Restaurante",
      Icon: IconFork,
      render: (h: HotelOpcao) => <HotelBoolCell value={h.restaurante} />,
    },
    {
      label: "Academia",
      Icon: IconDumbbell,
      render: (h: HotelOpcao) => <HotelBoolCell value={h.academia} />,
    },
    {
      label: "Piscina",
      Icon: IconSwim,
      render: (h: HotelOpcao) => <HotelBoolCell value={h.piscina} />,
    },
    {
      label: "Kombini",
      Icon: IconStore,
      render: (h: HotelOpcao) => h.konbini,
    },
    {
      label: "Avaliação Booking",
      Icon: IconBookingLogo,
      render: (h: HotelOpcao) =>
        h.avaliacaoBooking ? `${h.avaliacaoBooking.toFixed(1)} / 10` : "—",
    },
    {
      label: "Avaliação Trivago",
      Icon: IconTrivagoLogo,
      render: (h: HotelOpcao) =>
        h.avaliacaoTrivago ? `${h.avaliacaoTrivago.toFixed(1)} / 10` : "—",
    },
  ];

  return (
    <div className="relative">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/35 sm:hidden">
        Deslize para o lado para comparar
        <span aria-hidden>→</span>
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02]">
                <th className="sticky left-0 z-10 w-32 border-r border-black/10 bg-[#fafafa] px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-black/40 sm:w-40 sm:px-4">
                  Critério
                </th>
                {cidade.opcoes.map((h) => (
                  <th
                    key={h.nome}
                    className="w-[150px] border-l border-black/10 px-3 py-3 text-center text-sm font-semibold text-black sm:w-auto sm:px-4"
                  >
                    {h.nome}
                    {h.site && (
                      <a
                        href={h.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2f5aa8] hover:underline"
                      >
                        Ver galeria oficial
                      </a>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowBg = i % 2 === 1 ? "bg-black/[0.015]" : "bg-white";
                return (
                  <tr key={row.label} className={rowBg}>
                    <td
                      className={`sticky left-0 z-10 border-r border-black/10 px-3 py-3 align-top text-xs font-semibold text-black/50 sm:px-4 ${rowBg}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <row.Icon className="h-3.5 w-3.5 shrink-0 text-[#2f5aa8]" />
                        {row.label !== "Avaliação Booking" &&
                          row.label !== "Avaliação Trivago" &&
                          row.label}
                      </span>
                    </td>
                    {cidade.opcoes.map((h) => (
                      <td
                        key={h.nome}
                        className="border-l border-black/10 px-3 py-3 text-center align-middle text-sm text-black/70 sm:px-4"
                      >
                        {row.render(h)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden"
        />
      </div>
    </div>
  );
}

export function ApprovalPanel({
  displayClassName,
  approvalKey,
}: {
  displayClassName: string;
  approvalKey: string;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [activeRow, setActiveRow] = useState<"a" | "b">("a");
  const [hotelCity, setHotelCity] = useState(0);
  const [viewMode, setViewMode] = useState<"dia" | "hotel">("dia");
  const [showAdjustBox, setShowAdjustBox] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "aprovado" | "ajustes" | "error"
  >("idle");
  const contentRef = useRef<HTMLDivElement>(null);

  function scrollToContent() {
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const current =
    activeRow === "b" && OSAKA_ALT[activeDay]
      ? OSAKA_ALT[activeDay]
      : DAYS[activeDay];

  async function sendResponse(action: "aprovado" | "ajustes") {
    setStatus("submitting");
    try {
      const res = await fetch("/api/aprovacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: approvalKey, action, mensagem }),
      });
      if (!res.ok) throw new Error();
      setStatus(action);
    } catch {
      setStatus("error");
    }
  }

  if (status === "aprovado") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Roteiro aprovado
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Obrigado pela confirmação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          A elaboração do seu painel digital personalizado foi iniciada. Em
          breve você receberá o acesso completo pelo WhatsApp.
        </p>
      </div>
    );
  }

  if (status === "ajustes") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Ajustes solicitados
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Recebemos sua solicitação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          Nossa equipe vai revisar os pontos indicados e retornar em breve
          pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative isolate">
        {/* Glow ao redor do painel — mesma técnica do /ajisairoteiros, mas em
            tons de azul pra combinar com o fundo claro desta página. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-30 h-[112%] w-[116%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] opacity-80 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(47,90,168,0.35) 0%, rgba(47,90,168,0.18) 40%, transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[104%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-[2.35rem] opacity-60 blur-[32px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,90,168,0.3), rgba(90,140,220,0.22) 48%, transparent 78%)",
          }}
        />

        <img
          src="/images/goku-bw.png"
          alt="Goku"
          className="absolute right-4 top-0 z-20 h-36 w-36 -translate-y-1/2 object-contain sm:bottom-full sm:right-14 sm:top-auto sm:h-56 sm:w-56 sm:translate-y-0"
        />
        <div className="relative z-10 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <div className="border-b border-black/10 px-6 py-7 text-center sm:px-10">
          <p className="mx-auto mb-5 inline-block rounded-full border border-black/15 px-5 py-2 text-xs uppercase tracking-[0.3em] text-black/65">
            Roteiro de 7 dias
          </p>
          <h2 className={`${displayClassName} text-2xl font-medium text-black md:text-3xl`}>
            Painel Interativo · Rascunho
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/50">
            Selecione um dia para revisar a atração principal e os pontos de
            interesse propostos para a manhã e a tarde. Chegada e partida
            estão marcadas à parte, sem tempo útil para passeios.
          </p>
        </div>

        <div className="px-6 pt-6 sm:px-10">
          <p className="inline-block rounded-full border border-[#2f5aa8]/25 bg-[#eef3fb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2f5aa8]">
            Opção A
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 px-6 pt-3 sm:gap-x-7 sm:px-10">
          {DAYS.map((d, index) => {
            const active =
              index === activeDay && activeRow === "a" && viewMode === "dia";
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => {
                  setActiveDay(index);
                  setActiveRow("a");
                  setViewMode("dia");
                  scrollToContent();
                }}
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 font-bold transition ${
                    d.badge
                      ? "border-black bg-black text-[9px] tracking-tight text-white"
                      : active
                        ? "border-black bg-white text-sm text-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                        : "border-black/15 bg-white text-sm text-black/50 hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                  }`}
                >
                  {d.badge ?? d.day}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-black" : "text-black/40"
                  }`}
                >
                  {d.city}
                </span>
                {d.date && (
                  <span
                    className={`flex flex-col items-center leading-tight tracking-[0.1em] ${
                      active ? "text-black/50" : "text-black/30"
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

        <div className="px-6 pt-6 sm:px-10">
          <p className="inline-block rounded-full border border-[#2f5aa8]/25 bg-[#eef3fb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2f5aa8]">
            Opção B
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 px-6 pb-6 pt-3 sm:gap-x-7 sm:px-10">
          {DAYS.map((d, index) => {
            const isAlt = d.day === 5 || d.day === 6;

            if (!isAlt) {
              return (
                <div
                  key={d.day}
                  aria-hidden="true"
                  className="hidden flex-col items-center gap-2.5 opacity-0 sm:flex"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold">
                    {d.badge ?? d.day}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em]">
                    {d.city}
                  </span>
                  {d.date && (
                    <span className="flex flex-col items-center leading-tight tracking-[0.1em]">
                      <span className="text-sm font-semibold">
                        {d.date.split(" ")[0]}
                      </span>
                      <span className="text-xs uppercase">
                        {d.date.split(" ")[1]}
                      </span>
                    </span>
                  )}
                </div>
              );
            }

            const active =
              index === activeDay && activeRow === "b" && viewMode === "dia";

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => {
                  setActiveDay(index);
                  setActiveRow("b");
                  setViewMode("dia");
                  scrollToContent();
                }}
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    active
                      ? "border-black bg-white text-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                      : "border-[#C9A03A]/50 bg-[#fdf6e3] text-[#8a6d1a] hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                  }`}
                >
                  {d.day}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-black" : "text-[#8a6d1a]"
                  }`}
                >
                  Osaka
                </span>
                {d.date && (
                  <span
                    className={`flex flex-col items-center leading-tight tracking-[0.1em] ${
                      active ? "text-black/50" : "text-[#8a6d1a]/60"
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

        <p className="px-6 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 sm:px-10">
          Escolha de Hotel
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
                      ? "border-black bg-white text-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                      : "border-black/15 bg-white text-black/50 hover:border-transparent hover:bg-gradient-to-r hover:from-[#2f5aa8] hover:via-[#5b6fc7] hover:to-[#7c4fd1] hover:text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-black" : "text-black/40"
                  }`}
                >
                  {HOTEIS[index].cidade}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 px-6 pt-8 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
            Informações Detalhadas
          </p>
          <span className="rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">
            Conteúdo Só Disponível Na Versão Final
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-black/10 px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {INFO_CARDS.map(({ label, Icon }) => (
            <div
              key={label}
              className="group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-black/[0.02] px-3 py-4 text-center text-xs leading-5 text-black/55 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#2f5aa8]/30 hover:bg-[#eef3fb] hover:text-[#2f5aa8] hover:shadow-[0_10px_30px_-15px_rgba(47,90,168,0.35)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3fb] text-[#2f5aa8] transition group-hover:bg-white">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="border-b border-black/10 bg-black/[0.02] pb-6 pt-8">
          <p className="px-6 text-center sm:px-10">
            <span className="inline-block rounded-full border border-[#2f5aa8]/20 bg-[#eef3fb] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
              Marketplace de Serviços
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5 px-6 pt-3 sm:px-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
              Serviços Adicionais Disponíveis
            </p>
            <span className="rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">
              Contratação à Parte
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-6 pt-3 sm:grid-cols-4 sm:px-10">
            {ADDITIONAL_SERVICES.map(({ label, Icon }) => (
              <div
                key={label}
                className="group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#7c4fd1]/25 bg-[#f4effc] px-3 py-4 text-center text-xs leading-5 text-[#5b3ea6] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#7c4fd1]/40 hover:bg-[#ece2fa] hover:shadow-[0_10px_30px_-15px_rgba(124,79,209,0.35)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7c4fd1] transition group-hover:bg-[#7c4fd1] group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div ref={contentRef} className="scroll-mt-6 px-6 py-8 sm:px-10 sm:py-10">
          {viewMode === "hotel" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#2f5aa8]/20 bg-[#eef3fb] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
                Hotel · {HOTEIS[hotelCity].cidade}
              </p>
              <HotelComparisonTable cidade={HOTEIS[hotelCity]} />
            </>
          ) : current.travel ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 text-center sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
                {current.city} · {current.date}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
                {current.travelNote}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#2f5aa8]/20 bg-[#eef3fb] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
                Dia {current.day}
              </p>
              {current.contexto && (
                <ContextoBlock contexto={current.contexto} />
              )}
              {current.transporte && (
                <TransporteBlock transporte={current.transporte} />
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
            </>
          )}
        </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-10">
        <h3 className={`${displayClassName} text-xl font-medium text-black md:text-2xl`}>
          Está tudo certo com o roteiro?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
          Sua aprovação confirma as informações principais acima e dá início à
          elaboração do painel digital completo do seu roteiro personalizado.
        </p>

        {showAdjustBox && (
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Conte rapidamente o que gostaria de ajustar"
            rows={3}
            className="mt-6 w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/30 outline-none transition focus:border-[#2f5aa8]/60"
          />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() => sendResponse("aprovado")}
            className="rounded-full bg-gradient-to-r from-[#2f5aa8] via-[#5b6fc7] to-[#7c4fd1] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Enviando..." : "Aprovar Roteiro"}
          </button>
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() =>
              showAdjustBox ? sendResponse("ajustes") : setShowAdjustBox(true)
            }
            className="rounded-full border border-black/15 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black/70 transition hover:border-black/40 disabled:opacity-50"
          >
            {showAdjustBox ? "Enviar Ajustes" : "Solicitar Ajustes"}
          </button>
        </div>

        {status === "error" && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
            Não foi possível enviar sua resposta. Tente novamente ou fale com
            a Ajisai pelo WhatsApp.
          </p>
        )}
      </div>
    </>
  );
}
