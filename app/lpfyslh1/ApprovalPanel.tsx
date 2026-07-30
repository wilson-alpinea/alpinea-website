"use client";

import { useState } from "react";

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

type Period = {
  label?: string;
  regiao?: Regiao;
  atracaoPrincipal: string;
  pois: Poi[];
  gastronomia?: Gastronomia;
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
    pois: [
      {
        title: "Tokyo Solamachi",
        bairro: "Sumida",
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
        rating: 3,
      },
      { title: "Museu de Espadas", bairro: "Ryogoku", rating: 3 },
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
  day: 2,
  city: "Tokyo",
  date: "06 Mai",
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
    atracaoPrincipal: "Distrito de Ginza — Ginza Six, Uniqlo Ginza e MUJI Ginza",
    pois: [
      {
        title: "Área Externa do Palácio Imperial",
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
  day: 4,
  city: "Tokyo",
  date: "08 Mai",
  contexto: [
    "No dia 4 iremos explorar experiências de entretenimento e visualizar um dos pontos turísticos mais famosos do Japão — a Tokyo Tower. Dentro das experiências de entretenimento temos o teamLab Borderless, o Museu de Arte Moderna Mori e a vida noturna de Roppongi com as baladas.",
  ],
  manha: {
    regiao: {
      nome: "Minato",
      descricao:
        "Minato é um dos bairros mais diversos de Tóquio, misturando marcos históricos como o Templo Zojo-ji e a Tokyo Tower com empreendimentos modernos como o Azabudai Hills — o mais novo e ousado complexo da cidade, que abriga o teamLab Borderless. À noite, o bairro se transforma no principal polo de vida noturna de Tóquio, com Roppongi concentrando boa parte das baladas e bares da cidade.",
    },
    atracaoPrincipal: "teamLab Borderless (Toranomon)",
    pois: [
      {
        title: "Tokyo Tower",
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
        rating: 3,
      },
      {
        title: "Odaiba + Rainbow Bridge + Estátua de Gundam",
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
    pois: [
      {
        title: "Museu de Arte Moderna Mori",
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
        rating: 3,
      },
      {
        title: "Hinokicho Park",
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
  DAY_2,
  DAY_3,
  DAY_4,
  ...Array.from({ length: 3 }, (_, i) => ({
    day: i + 5,
    city: "Tokyo",
    date: `${String(i + 9).padStart(2, "0")} Mai`,
    manha: genericPeriod(),
    tarde: genericPeriod(),
  })),
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
      <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-[#2f5aa8] bg-[#eef3fb] px-5 py-5">
        <h3
          className={`${displayClassName} text-2xl font-medium text-[#2f5aa8] md:text-3xl`}
        >
          {period.atracaoPrincipal}
        </h3>
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
  const [showAdjustBox, setShowAdjustBox] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "aprovado" | "ajustes" | "error"
  >("idle");

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
          className="absolute bottom-full right-10 z-20 h-48 w-48 object-contain sm:right-14 sm:h-56 sm:w-56"
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

        <p className="px-6 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 sm:px-10">
          Opção A
        </p>
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 px-6 pt-3 sm:gap-x-7 sm:px-10">
          {DAYS.map((d, index) => {
            const active = index === activeDay;
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setActiveDay(index)}
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
          Opção B
        </p>
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-5 border-b border-black/10 px-6 pb-6 pt-3 sm:gap-x-7 sm:px-10">
          {DAYS.map((d) => {
            const isAlt = d.day === 5 || d.day === 6;

            if (!isAlt) {
              return (
                <div
                  key={d.day}
                  aria-hidden="true"
                  className="flex flex-col items-center gap-2.5 opacity-0"
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

            return (
              <div key={d.day} className="flex flex-col items-center gap-2.5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#C9A03A]/50 bg-[#fdf6e3] text-sm font-bold text-[#8a6d1a]">
                  {d.day}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a6d1a]">
                  Osaka
                </span>
                {d.date && (
                  <span className="flex flex-col items-center leading-tight tracking-[0.1em] text-[#8a6d1a]/60">
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
          })}
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {current.travel ? (
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
