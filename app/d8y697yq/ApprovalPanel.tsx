"use client";

import { useRef, useState, type TouchEvent } from "react";

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
  contexto?: string[];
  travel?: boolean;
  travelNote?: string;
  manha?: Period;
  tarde?: Period;
  transporte?: TransporteSugerido;
  alerta?: AlertaSugerido;
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
    label: "Tarde",
    regiao: {
      nome: "Sumida",
      descricao:
        "Sumida é o bairro que abriga a Tokyo Sky Tree (Torre mais alta do Japão) desde 2012, o bairro como o próprio nome diz cresceu as margens do Rio Sumida que antigamente era uma das principais rotas de transporte marítimo de Tokyo.",
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
    ],
  },
};

const DAY_2: DayContent = {
  day: 7,
  city: "Tokyo",
  date: "11 Mai",
  contexto: [
    "Neste nosso último dia de passeios, visitamos o lado mais comercial do Japão e o centro financeiro. Começamos o passeio com uma visita a Tokyo Station para que você possa ir diretamente à Dragonball Store, que fica dentro do complexo da estação, na mesma área onde existem lojas das principais franquias de anime.",
    "À tarde visitamos os Jardins do Leste do Palácio Imperial (Imperial Palace East Gardens), de entrada gratuita e a poucos minutos a pé da Tokyo Station.",
    "Como é nosso último dia, seguimos direto para o aeroporto depois dos jardins — sem mais compromissos.",
  ],
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
    atracaoPrincipal: "Imperial Palace East Gardens",
    atracaoPrincipalImagem: "/images/imperial-palace-east-gardens.png",
    atracaoPrincipalFoco: "center",
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
  contexto: [
    "O superdistrito de Shibuya é um dos bairros mais famosos, principalmente pela Shibuya Crossing e pela impressionante floresta erguida do zero que tem no centro o maior templo Shintoísta do mundo. Nessa região encontraremos Harajuku, o epicentro da cultura Lolita, Kawaii e Jovem do Japão, bem como a luxuosa avenida de Omotesando.",
    "À tarde seguimos para Shinjuku, bairro que mistura o Japão corporativo com o mais boêmio — do mirante gratuito do Prédio do Governo Metropolitano ao caos neon de Kabukicho, passando pelas vielas de Golden Gai. Relaxamos no onsen urbano Thermae-Yu antes de seguir para a estação e pegar o trem noturno rumo a Kyoto.",
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
    label: "Tarde",
    regiao: {
      nome: "Shinjuku",
      descricao:
        "Bairro que reúne o maior terminal ferroviário do mundo, arranha-céus corporativos, o distrito de entretenimento de Kabukicho e algumas das vielas mais icônicas de Tóquio — um contraste denso entre o Japão corporativo e o mais boêmio.",
    },
    atracaoPrincipal: "Bairro de Shinjuku",
    atracaoPrincipalImagem: "/images/draft-shinjuku.png",
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
  contexto: [
    "Neste dia começamos por Akihabara, epicentro da cultura de Animes & Mangá, Videogames e Artigos Eletrônicos.",
    "À tarde seguimos para Kanda, bairro vizinho conhecido pelos izakayas e por uma vida noturna mais local, longe do circuito turístico, para jantar num izakaya autêntico.",
    "À noite fechamos o dia em Roppongi, um dos principais polos de vida noturna de Tóquio, com baladas e bares badalados.",
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
    label: "Tarde",
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
  day: 5,
  city: "Kyoto",
  date: "09 Mai",
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
      "Diferente dos outros trechos, recomendamos pegar o trem ainda à noite, ao final deste dia, e não pela manhã seguinte — as lutas das categorias inferiores do Grand Sumo Tournament no dia 10 já começam às 8h40, e chegar em cima da hora vindo de Kyoto tiraria a opção de aproveitar o dia inteiro no Kokugikan.",
  },
};

const DAY_7: DayContent = {
  day: 6,
  city: "Tokyo",
  date: "10 Mai",
  contexto: [
    "Começamos a manhã no Museu Edo-Tokyo, que reabriu em 31 de março de 2026 após 4 anos fechado para uma grande reforma — fica literalmente do outro lado da rua do Kokugikan, então dá pra emendar direto com o sumô.",
    "O dia 10 de maio é um dos dias do Grand Sumo Tournament de Tóquio em maio de 2027 (torneio completo de 9 a 23 de maio) — a venda dos ingressos para o torneio começa dia 10 de abril de 2027.",
    "O ingresso vale para o dia inteiro no Kokugikan, em Ryogoku: as lutas das categorias inferiores começam já às 8h40, mas o grande destaque — a cerimônia de entrada e as lutas da divisão principal (Makuuchi) — só acontece a partir das 15h45, indo até por volta das 18h.",
    "Recomendamos chegar ao Kokugikan no início da tarde, por volta das 14h30, a tempo da cerimônia de entrada da segunda divisão e para garantir um bom lugar antes do início da divisão principal.",
  ],
  manha: {
    regiao: {
      nome: "Ryogoku",
      descricao:
        "Bairro às margens do Rio Sumida, tradicionalmente ligado ao comércio da era Edo — hoje reúne o Museu Edo-Tokyo e o estádio nacional de sumô Kokugikan, os dois pontos mais importantes do bairro.",
    },
    atracaoPrincipal: "Museu Edo-Tokyo",
    atracaoPrincipalImagem: "/images/edo-tokyo-museum.png",
    atracaoPrincipalFoco: "center",
    pois: [
      {
        title: "Réplica da Ponte Nihonbashi",
        description:
          "Reprodução em tamanho real da ponte que marcava o ponto de partida das principais estradas do Japão no período Edo — uma das peças centrais da galeria permanente.",
        rating: 5,
      },
      {
        title: "Réplica da Relojoaria Hattori",
        description:
          "Reconstrução em tamanho real da loja de relógios Hattori, símbolo da Ginza da era Meiji (1868–1912).",
        rating: 4,
      },
      {
        title: "Telões de Edo e Tóquio",
        description:
          "Grandes telões que recriam o céu da antiga Edo e da Tóquio contemporânea sobre as maquetes e reconstruções em escala real do museu.",
        rating: 3,
      },
      {
        title: "Comércio de Rua de Edo",
        description:
          "Barracas reconstituídas do comércio de rua do período Edo, incluindo um vendedor de asagao (campainha-japonesa) e uma barraca de tempura.",
        rating: 3,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Ippuku Cafe",
          descricao:
            "Cafeteria dentro do próprio museu — doces japoneses, matcha e sorvete soft, boa opção para uma pausa antes de seguir para o Kokugikan.",
        },
        {
          nome: "Saint Etoile Ryogoku",
          descricao: "Padaria e cafeteria bem avaliada, na frente do museu.",
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
    atracaoPrincipal: "Ryogoku Kokugikan - Grand Sumo Tournament 2027",
    atracaoPrincipalImagem: "/images/draft-sumo.png",
    atracaoPrincipalFoco: "center",
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
      <p className="text-lg font-semibold text-black">{alerta.horario}</p>
      <p className="mt-3 text-sm leading-6 text-black/70">
        {alerta.mensagem}
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

      {period.gradeHorarios && (
        <GradeHorariosBlock grade={period.gradeHorarios} />
      )}
      {period.gastronomia && (
        <GastronomiaBlock gastronomia={period.gastronomia} />
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
    <div className="mb-6 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="flex items-center gap-2">
        <IconClock className="h-3.5 w-3.5 text-black/45" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
          {grade.titulo ?? "Grade de Horários"}
        </p>
      </div>
      <div className="mt-3 divide-y divide-black/10 overflow-hidden rounded-xl border border-black/10 bg-white">
        {grade.itens.map((item) => (
          <div
            key={item.evento}
            className={`px-4 py-2.5 ${item.recomendado ? "bg-amber-50" : ""}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-16 shrink-0 text-sm font-semibold ${
                  item.recomendado ? "text-amber-800" : "text-black/70"
                }`}
              >
                {item.horario}
              </span>
              <span
                className={`text-sm leading-5 ${
                  item.destaque ? "font-semibold" : ""
                } ${item.recomendado ? "text-amber-800" : "text-black/60"}`}
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
        <p className="mt-3 border-t border-black/10 pt-3 text-xs leading-5 text-black/45">
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
    <div className="mt-8 border-t border-black/10 pt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          {subAtracao.label ?? "Noite"}
        </span>
      </div>

      <div
        className={`relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10] ${
          subAtracao.imagem ? "" : "border-2 border-[#2f5aa8]"
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
          <div className="flex h-full items-center justify-center bg-[#eef3fb] px-5">
            <h3
              className={`${displayClassName} text-2xl font-medium text-[#2f5aa8] md:text-3xl`}
            >
              {subAtracao.titulo}
            </h3>
          </div>
        )}
      </div>

      {subAtracao.descricao && (
        <p className="mb-5 text-sm leading-6 text-black/60">
          {subAtracao.descricao}
        </p>
      )}

      {subAtracao.pois && subAtracao.pois.length > 0 && (
        <>
          <p className="mb-5 text-xs text-black/40">Restaurantes sugeridos</p>
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

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="4" y1="12" x2="19" y2="12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="20" y1="12" x2="5" y2="12" />
      <path d="M11 6l-6 6 6 6" />
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
  { label: "Ingressos para Eventos e Parques Temáticos", Icon: IconTicket },
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
    cidade: "Tokyo 1",
    opcoes: [
      {
        nome: "lyf Ginza Tokyo",
        notaAlpinea: 95,
        perfil: "Conceito lifestyle/coliving, a poucos passos de Ginza e Tokyo Station",
        inauguracao: "2023",
        inauguracaoNota: "Novembro — reforma completa do antigo an/other TOKYO",
        reforma: "Sim",
        quarto: "13 m² (studio duplo)",
        preco: "¥15–25 mil",
        bairro: "Kyobashi",
        estacao: "Kyobashi (Ginza Line) / Takaracho",
        distanciaEstacao: "~3 min a pé",
        distanciaTokyoStation: "~12 min a pé",
        ofuro: false,
        restaurante: true,
        academia: true,
        piscina: false,
        konbini: "Diversos nas proximidades",
        site: "https://www.discoverasr.com/en/lyf/japan/lyf-ginza-tokyo",
        avaliacaoBooking: 8.7,
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
    ],
  },
  {
    cidade: "Tokyo 2",
    opcoes: [
      {
        nome: "remm Tokyo Kyobashi",
        notaAlpinea: 98,
        perfil: "Melhor localização — a 10 min a pé da Tokyo Station",
        inauguracao: "2019",
        inauguracaoNota: "Abril",
        reforma: "Não",
        quarto: "21 m² (twin)",
        preco: "¥18–33 mil",
        bairro: "Kyobashi",
        estacao: "Kyobashi (Ginza Line, saída 6)",
        distanciaEstacao: "1 min (50 m)",
        distanciaTokyoStation: "10 min a pé",
        ofuro: false,
        restaurante: true,
        academia: false,
        piscina: false,
        konbini: "7-Eleven (térreo)",
        site: "https://www.hankyu-hotel.com/en/hotel/remm/tokyo-kyobashi",
        avaliacaoBooking: 8.6,
        avaliacaoTrivago: 8.8,
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
  const [selected, setSelected] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    const delta = touchDeltaX.current;
    const threshold = 40;
    if (delta < -threshold) {
      setSelected((s) => Math.min(s + 1, cidade.opcoes.length - 1));
    } else if (delta > threshold) {
      setSelected((s) => Math.max(s - 1, 0));
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

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
    <div>
      {/* Mobile: sem tabela nem scroll horizontal — abas pra escolher o
          hotel, cartão único com os critérios empilhados verticalmente. */}
      <div className="sm:hidden">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {cidade.opcoes.map((h, i) => (
            <button
              key={h.nome}
              type="button"
              onClick={() => setSelected(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                i === selected
                  ? "border-black bg-black text-white"
                  : "border-black/15 bg-white text-black/50"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  i === selected
                    ? "bg-white text-black"
                    : "bg-black/10 text-black/50"
                }`}
              >
                {i + 1}
              </span>
              {h.nome}
            </button>
          ))}
        </div>
        <div
          className="overflow-hidden rounded-2xl border border-black/10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="border-b border-black/10 bg-black/[0.02] px-4 py-4 text-center">
            <p className="text-base font-semibold text-black">
              {cidade.opcoes[selected].nome}
            </p>
            <div className="mt-2.5 flex items-center justify-center">
              <span className="inline-block rounded-full border border-[#2f5aa8]/25 bg-[#2f5aa8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                Opção {selected + 1} de {cidade.opcoes.length}
              </span>
            </div>
            {(() => {
              const canLeft = selected > 0;
              const canRight = selected < cidade.opcoes.length - 1;
              if (!canLeft && !canRight) return null;
              const label =
                canLeft && canRight
                  ? "Arraste para os lados"
                  : canRight
                    ? "Arraste para a direita"
                    : "Arraste para a esquerda";
              return (
                <div className="mt-3 flex flex-col items-center gap-1.5 sm:hidden">
                  <div className="flex items-center gap-3">
                    {canLeft && (
                      <span className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#2f5aa8] text-white">
                        <IconArrowLeft className="h-5 w-5" />
                      </span>
                    )}
                    {canRight && (
                      <span className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#2f5aa8] text-white">
                        <IconArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2f5aa8]">
                    {label}
                  </p>
                </div>
              );
            })()}
            <div className="mt-2.5 flex items-center justify-center gap-2.5 px-6">
              {cidade.opcoes.map((h, i) => (
                <span
                  key={h.nome}
                  className={`h-2 flex-1 max-w-24 rounded-full transition-all ${
                    i === selected ? "bg-[#2f5aa8]" : "bg-black/15"
                  }`}
                />
              ))}
            </div>
            {cidade.opcoes[selected].site && (
              <a
                href={cidade.opcoes[selected].site}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2f5aa8] hover:underline"
              >
                Ver fotos e detalhes do hotel
              </a>
            )}
          </div>
          <div>
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  i % 2 === 1 ? "bg-black/[0.015]" : "bg-white"
                }`}
              >
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-black/50">
                  <row.Icon className="h-3.5 w-3.5 shrink-0 text-[#2f5aa8]" />
                  {row.label !== "Avaliação Booking" &&
                    row.label !== "Avaliação Trivago" &&
                    row.label}
                </span>
                <span className="text-right text-sm text-black/70">
                  {row.render(cidade.opcoes[selected])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: tabela comparativa completa lado a lado. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-black/10 sm:block">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-black/[0.02]">
                <th className="sticky left-0 z-10 w-32 border-b border-r border-black/10 bg-[#fafafa] px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-black/40 sm:w-40 sm:px-4">
                  Critério
                </th>
                {cidade.opcoes.map((h) => (
                  <th
                    key={h.nome}
                    className="w-[150px] border-b border-l border-black/10 bg-black/[0.02] px-3 py-3 text-center text-sm font-semibold text-black sm:w-auto sm:px-4"
                  >
                    {h.nome}
                    {h.site && (
                      <a
                        href={h.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2f5aa8] hover:underline"
                      >
                        Ver fotos e detalhes do hotel
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
  const [hotelCity, setHotelCity] = useState(0);
  const [viewMode, setViewMode] = useState<"dia" | "hotel">("dia");
  const [showAdjustBox, setShowAdjustBox] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "aprovado" | "ajustes" | "error"
  >("idle");
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
          className="absolute bottom-full right-4 z-20 h-28 w-28 object-contain sm:right-14 sm:h-56 sm:w-56"
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

        <p className="px-6 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 sm:px-10">
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
                className="mt-8 flex w-full flex-col items-center gap-2 rounded-2xl border border-[#2f5aa8]/20 bg-[#eef3fb] py-6 text-center transition hover:bg-[#e2eaf8]"
              >
                <span className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#2f5aa8] text-white">
                  <IconArrowUp className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2f5aa8]">
                  Voltar para o menu de dias do roteiro
                </span>
              </button>
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
