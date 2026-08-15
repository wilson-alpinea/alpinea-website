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

type Period = {
  label?: string;
  regiao?: Regiao;
  atracaoPrincipal: string;
  atracaoPrincipalImagem?: string;
  atracaoPrincipalFoco?: "top" | "center" | "bottom";
  atracaoPrincipalCompacta?: boolean;
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
    "Saímos do hotel em Kyobashi às 9h30, rumo a Ningyocho — bairro do shitamachi (baixa cidade) de Tóquio que preserva o traçado de ruas mais antigo da região central, já que escapou quase intacto do Grande Terremoto de 1923 e dos bombardeios da Segunda Guerra.",
    "O dia 10 de maio é um dos dias do Grand Sumo Tournament de Tóquio em maio de 2027 (torneio completo de 9 a 23 de maio) — a venda dos ingressos para o torneio começa dia 10 de abril de 2027.",
    "O ingresso vale para o dia inteiro no Kokugikan, em Ryogoku: as lutas das categorias inferiores começam já às 8h40, mas o grande destaque — a cerimônia de entrada e as lutas da divisão principal (Makuuchi) — só acontece a partir das 15h45, indo até por volta das 18h.",
    "Recomendamos chegar ao Kokugikan no início da tarde, por volta das 14h30, a tempo da cerimônia de entrada da segunda divisão e para garantir um bom lugar antes do início da divisão principal.",
  ],
  manha: {
    regiao: {
      nome: "Ningyocho",
      descricao:
        "Bairro do shitamachi de Tóquio, erguido sobre um brejo aterrado no início do período Edo. Ganhou o apelido de \"cidade das bonecas\" por abrigar teatros de kabuki e bunraku e os artesãos que faziam as bonecas usadas nos espetáculos — a produção migrou para Asakusa ainda no século 19, mas o nome ficou.",
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
        <span className="h-2 w-2 rounded-full bg-[#B96432]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
          {period.label ?? label}
        </span>
      </div>

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

      <p className="mb-2 text-xs text-[#24211D]/65">Atração Principal</p>
      <div
        className={`relative mb-5 overflow-hidden rounded-2xl ${
          period.atracaoPrincipalCompacta
            ? "mx-auto aspect-[3/4] max-w-[280px]"
            : "aspect-[4/3] sm:aspect-[16/10]"
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
      imagem: "/images/lyf-mapa-arredores.png",
      imagemAlt: "Mapa da região de Kyobashi com o lyf Ginza Tokyo e a Estação Kyobashi",
      nota: "Estação, farmácia, conveniência e clínica ficam todas no mesmo quarteirão/complexo da Estação Kyobashi — posições aproximadas dentro desse quarteirão.",
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
  return (
    <div className="overflow-hidden rounded-2xl border border-[#DDD8CF]">
      {/* 1. Informações do hotel — identificação e referência rápida */}
      <div className="border-b border-[#DDD8CF] bg-[#FAF9F6] px-5 py-5 text-center sm:px-8">
        <p className="text-base font-semibold text-[#24211D] sm:text-lg">
          {hotel.nome}
        </p>
        <p className="mt-1 text-xs text-[#24211D]/72">{hotel.endereco}</p>
        {hotel.enderecoJapones && (
          <p className="mt-0.5 text-xs text-[#24211D]/58">{hotel.enderecoJapones}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[#24211D]/72">
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

      {/* 3. Localização & Arredores — lista + mapa no mesmo bloco de largura
          total, sem divisor forte entre os dois */}
      <div className="border-t border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:p-8">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
          Localização &amp; Arredores
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {hotel.essenciais.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
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
            </div>
          ))}
        </div>

        {hotel.mapa && (
          <div className="mt-6">
            <HotelNeighborhoodMap mapa={hotel.mapa} />
            {hotel.mapa.nota && (
              <p className="mt-3 text-center text-[10px] leading-4 text-[#24211D]/65">
                {hotel.mapa.nota}
              </p>
            )}
            {hotel.mapa.rotas && hotel.mapa.rotas.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/58">
                  Rotas a pé (prints do Google Maps)
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {hotel.mapa.rotas.map((rota) => (
                    <a
                      key={rota.label}
                      href={rota.imagem}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-[#DDD8CF] bg-[#F8FAF9]"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={rota.imagem}
                          alt={rota.imagemAlt}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="px-2.5 py-2 text-[10px] font-semibold leading-tight text-[#24211D]/85">
                        {rota.label}
                      </p>
                    </a>
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
    </div>
  );
}

const DIRECAO_ESTILO: Record<
  MapaForaDoQuadro["direcao"],
  { posicao: string; seta: string }
> = {
  N: { posicao: "left-1/2 top-2 -translate-x-1/2", seta: "↑" },
  NE: { posicao: "right-2 top-2", seta: "↗" },
  E: { posicao: "right-2 top-1/2 -translate-y-1/2", seta: "→" },
  SE: { posicao: "bottom-2 right-2", seta: "↘" },
  S: { posicao: "bottom-2 left-1/2 -translate-x-1/2", seta: "↓" },
  SW: { posicao: "bottom-2 left-2", seta: "↙" },
  W: { posicao: "left-2 top-1/2 -translate-y-1/2", seta: "←" },
  NW: { posicao: "left-2 top-2", seta: "↖" },
};

// Layout da etiqueta em relação ao pino, por direção — evita colisão entre
// pontos próximos no aglomerado (estação/farmácia/conveniência/clínica).
const PONTO_LAYOUT: Record<
  NonNullable<MapaPonto["dir"]>,
  { wrapper: string; label: string }
> = {
  down: {
    wrapper: "flex-col items-center",
    label: "mt-1 w-[112px] text-center",
  },
  up: {
    wrapper: "flex-col-reverse items-center",
    label: "mb-1 w-[112px] text-center",
  },
  left: {
    wrapper: "flex-row-reverse items-center",
    label: "mr-1.5 w-[104px] text-right",
  },
  right: {
    wrapper: "flex-row items-center",
    label: "ml-1.5 w-[104px] text-left",
  },
};

function HotelNeighborhoodMap({ mapa }: { mapa: NonNullable<HotelInfo["mapa"]> }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#F5F3EF]">
      <Image
        src={mapa.imagem}
        alt={mapa.imagemAlt}
        width={1300}
        height={700}
        className="h-auto w-full"
      />
      {/* Leve escurecimento do mapa base — ajuda os pinos e etiquetas da
          Alpinea a se destacarem da própria sinalização do Google Maps. */}
      <div className="pointer-events-none absolute inset-0 bg-black/[0.08]" />

      {mapa.pontos.map((p, i) => {
        const layout = PONTO_LAYOUT[p.dir ?? "down"];
        return (
          <div
            key={i}
            className={`absolute flex ${layout.wrapper}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#FDFCF9] bg-[#173B45] text-white shadow-[0_3px_10px_rgba(23,59,69,0.4)]">
              <p.Icon className="h-3.5 w-3.5" />
            </span>
            <div
              className={`rounded-lg border border-[#DDD8CF] bg-[#FDFCF9]/95 px-2 py-1 shadow-sm backdrop-blur-sm ${layout.label}`}
            >
              <p className="text-[9px] font-bold leading-tight text-[#24211D]">
                {p.label}
              </p>
              <p className="mt-0.5 text-[8px] leading-tight text-[#24211D]/75">
                {p.detalhe}
              </p>
            </div>
          </div>
        );
      })}

      {mapa.foraDoQuadro?.map((p, i) => {
        const estilo = DIRECAO_ESTILO[p.direcao];
        return (
          <div
            key={i}
            className={`absolute flex items-center gap-2 rounded-full border border-[#B96432]/30 bg-[#FDFCF9] py-1.5 pl-2 pr-3 shadow-sm ${estilo.posicao}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B96432] text-xs text-white">
              {estilo.seta}
            </span>
            <p.Icon className="h-3.5 w-3.5 shrink-0 text-[#B96432]" />
            <div className="leading-tight">
              <p className="text-[9px] font-bold text-[#24211D]">{p.label}</p>
              <p className="text-[8px] text-[#24211D]/75">{p.detalhe}</p>
            </div>
          </div>
        );
      })}

      {/* Legenda */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 rounded-full border border-[#DDD8CF] bg-[#FDFCF9]/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 rounded-full border border-[#FDFCF9] bg-[#173B45]" />
          <span className="text-[8px] font-semibold uppercase tracking-wide text-[#24211D]/80">
            No quarteirão
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[#B96432] text-center text-[7px] leading-3 text-white">
            ↗
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-wide text-[#24211D]/80">
            Fora do quadro
          </span>
        </span>
      </div>
    </div>
  );
}

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
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold transition-all duration-300 ${
                    d.badge
                      ? "text-[9px] tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]"
                      : active
                        ? "shadow-[0_0_0_2px_#B69463]"
                        : "hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(182,148,99,0.6)]"
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
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAF9] text-[#173B45] transition group-hover:bg-[#FDFCF9]">
                  <Icon className="h-4 w-4" />
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
