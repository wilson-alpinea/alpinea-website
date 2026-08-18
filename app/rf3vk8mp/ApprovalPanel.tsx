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
  nomeJapones?: string;
  description?: string;
  lista?: string[];
  // Legado — sendo substituído por `prioridade`, mais preciso (rating
  // insinua nota/qualidade; prioridade indica o quanto vale priorizar
  // dentro do tempo disponível).
  rating?: number;
  // IMPERDÍVEL / RECOMENDADO / OPCIONAL — usado em vez de estrelas quando
  // presente. Deixe vazio para POIs cobertos só pelo diagrama anotado.
  prioridade?: "imperdivel" | "recomendado" | "opcional";
  // Agrupa POIs em subseções dentro do período (ex.: "Dentro do complexo"
  // vs. "Se houver tempo · nos arredores"). Sem isso, renderiza tudo numa
  // grade única (comportamento padrão, usado nos demais dias).
  grupo?: string;
  // Posição explícita na sequência de visita recomendada (percursoEssencial)
  // — usada como número do card em vez do índice do array, pra bater com o
  // diagrama anotado e com o texto do percurso essencial.
  ordem?: number;
  // Foto real do ponto — só preenchida quando existe imagem de verdade.
  imagem?: string;
  imagemAlt?: string;
  // Galeria com mais de uma foto real — quando presente, tem prioridade
  // sobre imagem/imagemAlt e abre com navegação (‹ ›) no zoom.
  imagens?: { src: string; alt: string }[];
};

type Gastronomia = {
  subtitulo?: string;
  // Parágrafo curto de contexto (ex.: "está integrada ao shopping X, que
  // reúne diversas opções de restaurantes...") — mostrado acima da lista.
  intro?: string;
  // Rótulo acima da lista de snacks/itens simples (ex.: "Snacks de rua").
  itensLabel?: string;
  itens?: { nome: string; descricao?: string; localizacao?: string; preco?: string; foto?: string }[];
  // Rótulo acima da lista de restaurantes (ex.: "Opções de refeição").
  restaurantesLabel?: string;
  // Cards ricos com foto — usado quando há fotos reais dos restaurantes.
  // Pode aparecer junto com `itens` (ex.: snacks de rua + restaurantes).
  restaurantes?: {
    nome: string;
    descricao?: string;
    localizacao?: string;
    preco?: string;
    horario?: string;
    foto?: string;
  }[];
  // Mapa clicável (zoom) com a localização dos restaurantes.
  mapa?: { titulo?: string; imagem: string; imagemAlt: string };
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
    // Tempo estimado de permanência no local — ajuda a enxergar onde há
    // folga no cronograma. Opcional: só aparece quando preenchido.
    permanencia?: string;
  }[];
};

type SubAtracao = {
  label?: string;
  titulo: string;
  imagem?: string;
  foco?: "top" | "center" | "bottom";
  descricao?: string;
  // Diagrama tipo "Raio-X Alpinea" (mapa de andares, infográfico) — quando
  // presente, substitui o headliner de foto padrão, em tamanho natural e
  // sem recorte.
  visaoAnotada?: Period["visaoAnotada"];
  // Rótulo acima da grade de `pois` — sem isso, cai no padrão "Restaurantes
  // sugeridos" (histórico). Usado p/ contextos não-gastronômicos (ex.: lojas).
  poisLabel?: string;
  pois?: Poi[];
  gastronomia?: Gastronomia;
  opcional?: boolean;
  compacta?: boolean;
};

type LinhaBadge = {
  codigo: string;
  nome: string;
  cor: string;
  // Logo da companhia operadora da linha (Tokyo Metro, Toei, JR...) — só
  // preenchido quando existe o logo real da empresa; sem isso o badge de
  // código/cor é o único indicador visual (ex.: a pé, ônibus municipal).
  logo?: string;
};

type OpcaoDeslocamento = {
  meio: string;
  tempo: string;
  Icon: (props: { className?: string }) => ReactElement;
  recomendado?: boolean;
  detalhes: string[];
};

type EstacaoInfo = {
  nome: string;
  nomeJapones?: string;
  distancia?: string;
  // Saída/plataforma específica a usar — mostrada em card verde em
  // destaque, separada do texto de distância a pé.
  saida?: string;
  // Foto real da entrada/fachada da estação — quando presente, substitui o
  // ícone/logo da linha no card de deslocamento.
  foto?: string;
};

type Deslocamento = {
  estacaoOrigem: EstacaoInfo;
  linha: LinhaBadge;
  estacaoDestino: EstacaoInfo;
  // Estações intermediárias reais entre origem e destino, na ordem do
  // trajeto — mostradas acima do traço/seta que liga as duas estações,
  // com o mesmo padrão dos mapas oficiais de metrô (círculo com letra +
  // número da linha, nome em japonês e em romaji). Só preenchido pra
  // trechos de trem/metrô sem baldeação confirmados.
  estacoesIntermediarias?: { nome: string; nomeJapones?: string; numero?: string }[];
  opcoes: OpcaoDeslocamento[];
  recomendacao?: string;
  // Mapa grande (print real) do trajeto a pé da saída da estação até a
  // atração — separado das fotos de estação, que ficam só no guia do hotel.
  mapaChegada?: { imagem: string; imagemAlt: string; nota?: string };
};

type Period = {
  label?: string;
  regiao?: Regiao;
  deslocamento?: Deslocamento;
  atracaoPrincipal: string;
  atracaoPrincipalImagem?: string;
  atracaoPrincipalFoco?: "top" | "center" | "bottom";
  atracaoPrincipalCompacta?: boolean;
  detalhesPraticos?: {
    label: string;
    valor: string;
    // Só usado no item "Melhor horário" — valor curto (ex.: "9h–9h30") pra
    // exibir grande e em destaque, com `valor` virando a explicação menor
    // logo abaixo. Sem isso, cai no formato antigo (só o parágrafo).
    horarioDestaque?: string;
    // Foto opcional que ilustra o "Melhor horário" (ex.: pôr do sol no
    // ponto) — mostrada como miniatura ao lado do texto, só quando presente.
    imagem?: string;
    imagemAlt?: string;
  }[];
  // Listas curtas de apoio (ex.: "Ingressos", "Preço Estimado") — mostradas
  // logo depois da grade de detalhes práticos, antes das decisões.
  listasPraticas?: {
    titulo: string;
    itens: string[];
  }[];
  // Mapa aberto (print real) com visão geral do trajeto a pé do período,
  // conectando os pontos de interesse — mostrado antes da grade de POIs.
  mapaVisaoGeral?: { imagem: string; imagemAlt: string; nota?: string };
  // Foto aérea/panorâmica anotada com as partes destacadas de uma atração
  // (ex.: portões, salão principal, pagode) — mostrada logo no início do
  // período, com uma pequena explicação de cada ponto ao lado.
  visaoAnotada?: {
    // Nome curto da atração — aparece ao lado de "Raio-X Alpinea"
    // (ex.: "Raio-X Alpinea — Templo Sensoji").
    titulo?: string;
    imagem: string;
    imagemAlt: string;
    nota?: string;
    // Quando true, é só um mapa de referência (ex.: mapa de andares de um
    // shopping) — não é um infográfico "Raio-X Alpinea" com pontos
    // anotados. Troca o card preto de destaque por um rótulo simples.
    simples?: boolean;
    // Parágrafos de comentário livre mostrados no card preto do Raio-X
    // Alpinea, abaixo do título — leitura de contexto/dicas da seção,
    // separado da legenda de cada ponto.
    comentarios?: string[];
    // Foto já escurecida usada como fundo do card do Raio-X Alpinea (no
    // lugar do preto liso) — cobre o card inteiro, atrás do título e dos
    // comentários.
    fundo?: string;
    // Sem pontos = a própria imagem já é o infográfico completo (legendas
    // embutidas); com pontos, mostra a legenda ao lado em colunas.
    pontos?: {
      cor?: string;
      titulo: string;
      nomeJapones?: string;
      descricao: string;
      foto?: string;
      // Foto extra (ex.: um detalhe escondido) — mostrada como miniatura
      // em destaque sobre o canto da foto principal, clicável pra zoom.
      fotoExtra?: { src: string; alt: string };
      // Posição na sequência de visita recomendada (percursoEssencial) —
      // é o número mostrado no card (numeração única, igual à do Percurso
      // Essencial e dos cards de Pontos de Interesse). Sem isso, o card
      // recebe o rótulo "Opcional" em vez de número — não faz parte do
      // percurso essencial.
      ordem?: number;
    }[];
  };
  // Resposta rápida a "o que eu faço agora?" — resumo do percurso a pé
  // recomendado dentro da atração, antes de qualquer detalhe. Mostrado
  // logo após o hero, antes do diagrama anotado.
  percursoEssencial?: {
    duracao: string;
    passos: {
      titulo: string;
      foto?: string;
      horario?: string;
      // Parágrafo curto explicando o ponto — mostrado abaixo do título.
      descricao?: string;
      // Curiosidade/destaque rápido, mostrado em card à parte ao lado do
      // texto (ex.: "o enorme lanternão vermelho de 700 kg").
      destaque?: string;
    }[];
  };
  // Pequeno bloco de apoio à decisão (ex.: qual ingresso escolher, o que
  // fazer se estiver muito cheio) — direto ao ponto, sem prosa longa.
  decisoes?: {
    titulo: string;
    resposta: string;
  }[];
  // Galeria de apoio (mapas de andar, fotos do ambiente) — tamanho natural,
  // sem recorte, pra não perder texto/legendas de mapas oficiais.
  galeria?: {
    titulo?: string;
    imagens: { src: string; alt: string; legenda?: string }[];
  };
  pois: Poi[];
  gastronomia?: Gastronomia;
  comprasExclusivas?: ComprasExclusivas;
  subAtracoes?: SubAtracao[];
  gradeHorarios?: GradeHorarios;
  // Banheiro público mais próximo da atração — card de apoio prático.
  // Lista (não só uma opção): geralmente há um banheiro dentro da própria
  // atração/estação, além da opção mais limpa/recomendada.
  banheirosProximos?: {
    local: string;
    endereco?: string;
    nota?: string;
  }[];
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
  // Resumo rápido do dia em números — mostrado logo após o Contexto, antes
  // do cliente sair do hotel.
  diaEmNumeros?: {
    atracoes: string;
    caminhada: string;
    transporte: string;
    linhasMetro: string;
    ritmo: string;
    saida: string;
    retorno: string;
  };
  // Linha do tempo visual do dia inteiro (hotel → atrações → refeições →
  // hotel), com miniatura de cada parada — mostrada logo após o Contexto.
  resumoDia?: {
    passos: { titulo: string; foto?: string; horario?: string }[];
  };
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
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "08:00", foto: "/images/icone-gastronomia.png" },
      { titulo: "Saída do Hotel", horario: "08:45", foto: "/images/icone-hotel2.png" },
      { titulo: "Templo Sensoji", horario: "09:45", foto: "/images/sensoji-kaminarimon.png" },
      { titulo: "Almoço", horario: "12:30", foto: "/images/icone-gastronomia.png" },
      { titulo: "Tokyo Sky Tree", horario: "14:35", foto: "/images/skytree-tembo-deck-aerea.jpg" },
      { titulo: "Jantar", horario: "16:30", foto: "/images/icone-gastronomia.png" },
      { titulo: "Retorno ao Hotel", horario: "19:00", foto: "/images/icone-hotel2.png" },
    ],
  },
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      { horario: "08:00", evento: "Café da manhã no lyf Ginza Tokyo", permanencia: "~45 min" },
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
      { horario: "09:20", evento: "Kaminarimon e Nakamise Street", permanencia: "~25 min" },
      {
        horario: "09:45",
        evento: "Templo Sensoji Asakusa",
        destaque: true,
        tag: "Atração",
        permanencia: "~1h15",
      },
      { horario: "11:00", evento: "Kappabashi Kitchen Town", permanencia: "~30 min" },
      { horario: "11:30", evento: "Sumida Park", permanencia: "~30–40 min" },
      {
        horario: "12:30",
        evento: "Almoço com snacks de rua em Asakusa",
        tag: "Refeição",
        permanencia: "~45 min",
      },
      {
        horario: "13:15",
        evento: "Caminhada até a Estação Asakusa, saída A4 (~8 min)",
        tag: "Deslocamento",
      },
      {
        horario: "13:25",
        evento: "Trem até Oshiage · Toei Asakusa Line, direto (~4 min)",
        tag: "Deslocamento",
      },
      {
        horario: "14:35",
        evento: "Subida à Tokyo Sky Tree para o pôr do sol",
        destaque: true,
        recomendado: true,
        tag: "Atração",
        permanencia: "~1h45",
      },
      {
        horario: "16:30",
        evento: "Tokyo Solamachi · lojas e jantar",
        tag: "Refeição",
        permanencia: "~2h30",
      },
      { horario: "19:00", evento: "Retorno ao lyf Ginza Tokyo" },
    ],
    nota: "Horários estimados considerando saída do lyf Ginza Tokyo (Kyobashi) — ajuste conforme seu ritmo. Entre a chegada à Oshiage (~13:29) e a subida à torre (14:35) há uma folga proposital de ~1h para explorar a Tokyo Solamachi com calma antes do pôr do sol.",
  },
  diaEmNumeros: {
    atracoes: "2 atrações principais",
    caminhada: "~2,5 km a pé",
    transporte: "~19 min de trem no total",
    linhasMetro: "2 linhas, sem baldeações",
    ritmo: "Moderado",
    saida: "08:45",
    retorno: "≈19:00",
  },
  manha: {
    percursoEssencial: {
      duracao: "1h30–2h",
      passos: [
        {
          titulo: "Kaminarimon",
          foto: "/images/sensoji-kaminarimon.png",
          horario: "09:20",
          descricao: "O icônico portão de entrada do Templo Senso-ji. Comece sua experiência em Asakusa.",
          destaque: "O enorme lanternão vermelho de 700 kg.",
        },
        {
          titulo: "Dragão sob a lanterna",
          foto: "/images/kaminarimon-dragon.png",
          horario: "~09:25",
          descricao: "Observe o dragão esculpido na base da lanterna — símbolo de proteção e sabedoria.",
          destaque: "Detalhe pouco visto por quem passa rápido.",
        },
        {
          titulo: "Nakamise Street",
          foto: "/images/sensoji-nakamise.png",
          horario: "~09:30",
          descricao: "A tradicional rua de compras com mais de 90 lojas de souvenirs e guloseimas típicas.",
          destaque: "Experimente um ningyoyaki acabado de fazer.",
        },
        {
          titulo: "Hōzōmon",
          foto: "/images/sensoji-hozomon.png",
          horario: "~09:45",
          descricao: "O belíssimo portão interno com guardiões imponentes protegendo o templo.",
          destaque: "Um dos portões mais bonitos do Japão.",
        },
        {
          titulo: "Jōkoro",
          foto: "/images/Jokoro.png",
          horario: "~09:50",
          descricao: "Incensário de bronze onde os visitantes purificam corpo e mente com a fumaça sagrada.",
          destaque: "Passe a fumaça sobre você para boa sorte.",
        },
        {
          titulo: "Salão Principal",
          foto: "/images/sensoji-kannondo.png",
          horario: "~10:00",
          descricao: "O coração do Templo Senso-ji. Faça uma oração e aprecie a arquitetura centenária.",
          destaque: "A imagem de Kannon, deusa da compaixão, no altar principal.",
        },
        {
          titulo: "Omikuji",
          foto: "/images/mikuji.png",
          horario: "~10:15",
          descricao: "Tire sua sorte! Os papeizinhos da fortuna podem trazer conselhos e boas energias.",
          destaque: "Se tirar má sorte, amarre o papel e deixe o azar para trás.",
        },
        {
          titulo: "Pagode de Cinco Andares",
          foto: "/images/sensoji-pagode.png",
          horario: "~10:25",
          descricao: "A estrutura mais alta do complexo, símbolo de paz e harmonia.",
          destaque: "Ótimo ponto para fotos clássicas de Asakusa.",
        },
        {
          titulo: "Saída pelo lado oeste",
          horario: "~10:35",
          descricao: "Caminhada tranquila em direção a Kappabashi e Sumida Park.",
          destaque: "≈10 min a pé — percurso agradável e sinalizado.",
        },
        {
          titulo: "Kappabashi",
          foto: "/images/kappabashi.png",
          horario: "~11:00",
          descricao: "A famosa \"Kitchen Town\", o paraíso dos utensílios de cozinha e artigos profissionais.",
          destaque: "Mais de 160 lojas de utensílios e facas japonesas.",
        },
        {
          titulo: "Sumida Park",
          foto: "/images/sumida-park.png",
          horario: "~11:30",
          descricao: "Encerramento perfeito com vista para a Tokyo Skytree e o Rio Sumida.",
          destaque: "Ideal para um momento de descanso e fotos memoráveis.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Templo Sensoji",
      imagem: "/images/dia1-sensoji-visao-anotada-v2.png",
      imagemAlt: "Vista aérea do complexo do Templo Sensoji com as partes principais destacadas",
      comentarios: [
        "A prioridade aqui é evitar o início das aglomerações no complexo — por ser um dos pontos turísticos mais visitados do Japão, próximo do horário do almoço começa a ficar muito cheio. Nossa recomendação é chegar antes da abertura das lojas da Nakamise e aproveitar com calma todos os pontos destacados abaixo. A partir das 09:00 (abertura das lojas) você começa a explorar as lojinhas, tanto de snacks quanto de souvenir. Após finalizar essa visita, você tem algumas opções.",
        "Existem 3 pontos de interesse destacados abaixo — nossa recomendação seria visitar os 3, porém o tempo que vai passar em cada um depende de você. Kappabashi é enorme, não recomendo visitar todas as lojas.",
        "Para ir à Tokyo Sky Tree você pode ir andando pelo Sumida Park, ou pegar o metrô (são duas estações de distância).",
        "Outra opção é voltar pro hotel e descansar antes de ir pra Tokyo Sky Tree.",
        "Sobre o almoço, recomendo sair de perto do complexo de Sensoji — as filas são gigantes.",
      ],
      pontos: [
        {
          cor: "#C81D25",
          titulo: "Kaminarimon",
          nomeJapones: "雷門",
          descricao:
            "\"Portão do Trovão\" — entrada principal do templo, construído originalmente em 942. Marcado pela icônica lanterna vermelha gigante (chōchin) pendurada no centro.",
          foto: "/images/sensoji-kaminarimon.png",
          ordem: 1,
        },
        {
          titulo: "Escultura do Dragão",
          nomeJapones: "雷門提灯の龍彫刻",
          descricao:
            "A maioria passa direto sem notar: embaixo da lanterna gigante do Kaminarimon há um dragão entalhado em madeira, considerado protetor do templo na tradição budista. A lanterna atual (3,9 m de altura, ~700 kg) foi doada em 1960 por Konosuke Matsushita, fundador da Panasonic, em agradecimento por ter se curado de uma doença após rezar no Sensoji — o nome \"Matsushita Electric\" ainda aparece gravado na base.",
          foto: "/images/kaminarimon-dragon.png",
          fotoExtra: {
            src: "/images/kaminari-dragon-lantern.png",
            alt: "Lanterna do Kaminarimon vista de baixo, com a talha do dragão",
          },
          ordem: 2,
        },
        {
          cor: "#D97A1F",
          titulo: "Nakamise Street",
          nomeJapones: "仲見世通り",
          descricao:
            "Rua comercial de ~250 m entre o Kaminarimon e o Hōzōmon, com quase 90 lojinhas tradicionais de souvenires e snacks — uma das ruas de compras mais antigas do Japão, ativa desde o período Edo.",
          foto: "/images/sensoji-nakamise.png",
          ordem: 3,
        },
        {
          cor: "#1E6FB8",
          titulo: "Hōzōmon",
          nomeJapones: "宝蔵門",
          descricao:
            "\"Portão do Tesouro\" — segundo portão do complexo, guarda relíquias do templo no piso superior e é flanqueado por duas estátuas guardiãs (Niō).",
          foto: "/images/sensoji-hozomon.png",
          ordem: 4,
        },
        {
          titulo: "Jokoro",
          nomeJapones: "常香炉",
          descricao:
            "Grande incensário de bronze em frente ao Salão Principal — acenda um incenso, deposite no jokoro e leve a fumaça sobre o corpo, tradicionalmente pra atrair saúde e sabedoria (muita gente direciona pra cabeça).",
          foto: "/images/Jokoro.png",
          ordem: 5,
        },
        {
          cor: "#3F8F3F",
          titulo: "Salão Principal",
          nomeJapones: "本堂 / Kannondō",
          descricao:
            "Santuário principal do templo, onde fica a estátua de Kannon (Deusa da Misericórdia) que deu origem ao Sensoji — fundado em 628, o templo mais antigo de Tóquio.",
          foto: "/images/sensoji-kannondo.png",
          ordem: 6,
        },
        {
          titulo: "Omikuji",
          nomeJapones: "おみくじ",
          descricao:
            "Papelzinho de sorte por ¥100: deposite a moeda, chacoalhe a caixa até sair um bastão numerado e pegue a gaveta correspondente. O Sensoji é famoso por sortear azar (kyō) com mais frequência que outros templos — se calhar de tirar, é tradição amarrar o papel num varal ali perto pra deixar a má sorte no templo.",
          foto: "/images/mikuji.png",
          ordem: 7,
        },
        {
          cor: "#6B3FA0",
          titulo: "Pagode de Cinco Andares",
          nomeJapones: "五重塔",
          descricao:
            "Reconstrução do pagode original de 942 — cada um dos cinco andares representa um elemento budista (terra, água, fogo, vento, vazio). Guarda relíquias de Buda. Fica a caminho da saída oeste, logo depois do Omikuji — vale parar pra ver de perto.",
          foto: "/images/sensoji-pagode.png",
          ordem: 8,
        },
      ],
    },
    regiao: {
      nome: "Asakusa · Tokyo",
      descricao:
        "Bairro histórico às margens do Rio Sumida, coração da \"Tokyo antiga\" — templos, comércio tradicional e costumes que sobreviveram em poucos outros lugares da cidade. Parte do distrito de Taito, um dos mais antigos de Tokyo, fundado por volta de 1600, quando a cidade ainda se chamava Edo.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
        saida: "Saída 6",
        foto: "/images/Kyobashi_Station_entrance_7_20170813.jpg",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.png" },
      estacoesIntermediarias: [
        { nome: "Nihombashi", nomeJapones: "日本橋", numero: "G11" },
        { nome: "Mitsukoshimae", nomeJapones: "三越前", numero: "G12" },
        { nome: "Kanda", nomeJapones: "神田", numero: "G13" },
        { nome: "Suehirocho", nomeJapones: "末広町", numero: "G14" },
        { nome: "Ueno-hirokoji", nomeJapones: "上野広小路", numero: "G15" },
        { nome: "Ueno", nomeJapones: "上野", numero: "G16" },
        { nome: "Inaricho", nomeJapones: "稲荷町", numero: "G17" },
        { nome: "Tawaramachi", nomeJapones: "田原町", numero: "G18" },
      ],
      estacaoDestino: {
        nome: "Estação Asakusa",
        nomeJapones: "浅草駅",
        distancia: "~4 min a pé (300 m) até o Kaminarimon",
        saida: "Saída 1",
        foto: "/images/asakusa-station-entrance.webp",
      },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈16 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Ginza Line), sem baldeação.",
            "Embarque pela Saída 6 da Estação Kyobashi — a mais próxima do lyf Ginza Tokyo, ~1 min a pé.",
            "Desça em Asakusa e siga pela Saída 1, a mais próxima do templo — dali são ~4 min a pé (300 m) até o Kaminarimon.",
          ],
        },
        {
          meio: "Táxi / Carro",
          tempo: "≈15–20 min",
          Icon: IconCar,
          detalhes: [
            "Sujeito a trânsito no período da manhã.",
            "Porta a porta, sem caminhada até a estação.",
            "Mais confortável para bagagens ou em dias de chuva.",
          ],
        },
      ],
      mapaChegada: {
        imagem: "/images/rota-asakusa-sensoji.png",
        imagemAlt: "Rota a pé da Saída 1 da Estação Asakusa até o Kaminarimon (Templo Sensoji)",
        nota: "Saída 1 da Estação Asakusa até o Kaminarimon — ≈4 min a pé (300 m).",
      },
    },
    atracaoPrincipal: "Templo Sensoji Asakusa",
    atracaoPrincipalImagem: "/images/dia1-sensoji.png",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Salão principal", valor: "6h–17h" },
      { label: "Nakamise Street", valor: "~9h–17h (varia por loja)" },
      {
        label: "Melhor horário",
        horarioDestaque: "9h–9h30",
        valor:
          "Logo na abertura das lojas — é por isso que o roteiro chega às 9h20: o pico de grupos de turismo começa por volta das 11h e vai até 15h.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/dia1-manha-visao-geral-mapa.png",
      imagemAlt:
        "Visão geral do trajeto a pé conectando Sensoji, Nakamise Street, Kappabashi Kitchen Town e Sumida Park",
      nota: "≈36 min · 2,5 km — trajeto completo a pé conectando os pontos de interesse do período, sem pressa de fazer tudo na ordem: ajuste conforme o ritmo do grupo.",
    },
    pois: [
      {
        title: "Kappabashi Kitchen Town",
        description:
          "Avenida com lojas que vendem artigos de cozinha desde utensílios domésticos, louças, comida cenográfica — fica a oeste do templo, vale visitar antes de seguir para o lado do rio.",
        grupo: "Se houver tempo · nos arredores",
        prioridade: "opcional",
        imagem: "/images/kappabashi.png",
        imagemAlt: "Loja de utensílios de cozinha em Kappabashi Kitchen Town",
      },
      {
        title: "Sumida Park",
        description:
          "Parque as margens do Rio Sumida que corta a parte leste da cidade de Tokyo, vista para a Tokyo Sky Tree",
        grupo: "Se houver tempo · nos arredores",
        prioridade: "opcional",
        imagem: "/images/sumida-park.png",
        imagemAlt: "Margem do Rio Sumida no Sumida Park, com cerejeiras floridas",
      },
      {
        category: "Compras",
        title: "Masamoto Sohonten",
        description:
          "Uma das Top5 melhores fabricantes de faca profissional do Japão, também tem equipe dedicada de afiador profissional para facas de alta complexidade — fica perto do Sumida Park, do lado do rio.",
        grupo: "Se houver tempo · nos arredores",
        prioridade: "opcional",
        imagem: "/images/masamoto-sohonten.png",
        imagemAlt: "Vitrine de facas profissionais na Masamoto Sohonten",
      },
    ],
    gastronomia: {
      subtitulo: "Grande quantidade de lojas que vendem snacks de rua",
      itensLabel: "Snacks de rua · Nakamise-dori",
      itens: [
        {
          nome: "Melon Pan (Kagetsudo)",
          descricao:
            "Pão doce crocante por fora, macio por dentro — uma das barracas mais tradicionais da Nakamise.",
          localizacao: "Kagetsudo — Nakamise-dori, perto do Kaminarimon",
          preco: "200",
          foto: "/images/nakamise-melon-pan-kagetsudo-2.jpg",
        },
        {
          nome: "Ningyo-yaki (Kimuraya Honten)",
          descricao:
            "Bolinho recheado de doce de feijão vermelho, moldado em formatos icônicos e vendido morno, recém-feito.",
          localizacao: "Kimuraya Honten — Nakamise-dori",
          preco: "~500 (pacote)",
          foto: "/images/nakamise-ningyo-yaki-1.jpg",
        },
        {
          nome: "Ningyo-yaki (Kimuraya Honten)",
          descricao: "Vendido em pacotes — ótimo para levar de lembrança.",
          localizacao: "Kimuraya Honten — Nakamise-dori",
          preco: "~600 (pacote de 10)",
          foto: "/images/nakamise-ningyo-yaki-2b.jpg",
        },
        {
          nome: "Kibi Dango (Asakusa Kibi Dango Azuma)",
          descricao:
            "Mochi macio, tradição de Asakusa desde o período Edo.",
          localizacao: "Asakusa Kibi Dango Azuma — Nakamise-dori",
          preco: "~350 (5 espetos)",
          foto: "/images/nakamise-kibi-dango.jpg",
        },
        {
          nome: "Senbei (Iriyama Senbei Seizojo)",
          descricao:
            "Cracker de arroz grelhado e temperado na hora, tradição centenária de Asakusa — dá pra ver o processo sendo feito na loja.",
          localizacao: "Iriyama Senbei Seizojo — Nakamise-dori",
          preco: "~150–300 (unidade)",
          foto: "/images/nakamise-senbei-iriyama.jpg",
        },
        {
          nome: "Senbei Gigante (Tako no Nakigoe)",
          descricao:
            "Cracker de arroz grelhado na hora com polvo inteiro prensado — do tamanho do rosto, vira atração à parte.",
          localizacao: "Tako no Nakigoe Asakusa — Nakamise-dori",
          preco: "~500–700",
          foto: "/images/nakamise-senbei-gigante.jpg",
        },
        {
          nome: "Asakusa Menchi",
          descricao:
            "Croquete de carne empanado, crocante por fora e suculento por dentro — uma das filas mais disputadas da rua.",
          localizacao: "Asakusa Menchi — Nakamise-dori",
          preco: "~400",
          foto: "/images/nakamise-asakusa-menchi.jpg",
        },
      ],
      restaurantesLabel: "Opções de refeição",
      restaurantes: [
        {
          nome: "Tanaka Soba Ten Asakusa Ten",
          descricao: "Ramen tradicional",
          localizacao: "1-1-8 Asakusa, Taito-ku — Saída 6 da Estação Asakusa",
          foto: "/images/nakamise-tanaka-soba.jpg",
        },
        {
          nome: "Sushi Zanmai Asakusa Kaminari Mon Ten",
          descricao: "Sushi de balcão",
          localizacao: "1-3-6 Asakusa, Taito-ku — ~50 m do Kaminarimon",
          foto: "/images/nakamise-sushi-zanmai.jpg",
        },
        {
          nome: "Asakusa Amai",
          descricao: "Tempura",
          localizacao: "1-20-7 Asakusa, Taito-ku",
          foto: "/images/nakamise-asakusa-amai-tempura.jpg",
        },
      ],
    },
    banheirosProximos: [
      {
        local: "Dentro do complexo do templo",
        endereco: "A leste e a oeste do Salão Principal (Kannondo), e ao sul do templo",
        nota: "Mais simples/rústicos, mas a poucos passos de onde você já está — inclui opção acessível.",
      },
      {
        local: "Estação Asakusa (Ginza / Toei / Tobu)",
        endereco: "Dentro da própria estação, perto das catracas",
        nota: "A menos de 5 min a pé do Salão Principal, do outro lado do Kaminarimon.",
      },
      {
        local: "Asakusa Culture Tourist Information Center",
        endereco: "2-18-9 Kaminarimon, Taito-ku — em frente ao Kaminarimon · 9h–20h",
        nota: "Opção mais limpa e acessível da região — a 1 min a pé da Estação Asakusa.",
      },
    ],
  },
  tarde: {
    label: "Tarde",
    percursoEssencial: {
      duracao: "~1h30 (Deck) · ~2h (c/ Galleria)",
      passos: [
        { titulo: "Chegada Oshiage (saída B3)" },
        { titulo: "4F · Entrada" },
        { titulo: "Tembo Deck · 350 m", foto: "/images/skytree-tembo-deck-aerea.jpg" },
        { titulo: "Tembo Galleria · 450 m (opcional)" },
        { titulo: "Descida" },
        { titulo: "Tokyo Solamachi", foto: "/images/solamachi-floor1.png" },
      ],
    },
    visaoAnotada: {
      titulo: "Tokyo Sky Tree",
      imagem: "/images/raiox-skytree2.png",
      imagemAlt: "Infográfico da Tokyo Sky Tree com altura e observatórios (Tembo Deck e Tembo Galleria)",
      nota: "634 m de altura total, concluída em 2012 — a torre de transmissão e observação mais alta do Japão.",
      fundo: "/images/raiox-skytree-bg.jpg",
      comentarios: [
        "Considerando que você chegue num horário apropriado para subir antes do pôr do sol, a prioridade é se dirigir à bilheteria e comprar o ingresso. Existem 2 opções: uma que sobe até o observatório superior e outra até o observatório inferior — a diferença é mínima entre os dois. Uma diferença importante é que o espaço é muito mais reduzido no superior (recomendo evitar se for claustrofóbico). Alguns viajantes gostam de fazer uma refeição no Musashi ou comer algo no café e sentar para fazer esse lanche — fica a seu critério; em termos de qualidade de comida, na base da torre (Solamachi) a comida é melhor.",
        "O shopping Solamachi é enorme — deixei em destaque as lojas referentes a anime/mangá, mas tem dezenas de lojas de outros temas que podem ser interessantes de explorar.",
      ],
    },
    galeria: {
      titulo: "Skytree em Detalhes",
      imagens: [
        {
          src: "/images/skytree-tembo-deck-aerea.jpg",
          alt: "Vista aérea do Tembo Deck da Tokyo Sky Tree, mostrando a estrutura do observatório",
          legenda: "Tembo Deck, visto de fora",
        },
        {
          src: "/images/skytree-tembo-deck-mapa.png",
          alt: "Mapa oficial do Tembo Deck (350 m) da Tokyo Sky Tree, pisos 340 a 350",
          legenda: "Tembo Deck · pisos 340–350",
        },
        {
          src: "/images/skytree-tembo-galleria-mapa.png",
          alt: "Mapa oficial do Tembo Galleria (450 m) da Tokyo Sky Tree, pisos 445 a 450",
          legenda: "Tembo Galleria · pisos 445–450",
        },
        {
          src: "/images/skytree-tembo-deck-vista-noturna.jpg",
          alt: "Vista de dentro do Tembo Deck à noite, com a cidade iluminada ao fundo",
          legenda: "Vista de dentro do Tembo Deck, à noite",
        },
      ],
    },
    regiao: {
      nome: "Oshiage / Sumida · Tokyo",
      descricao:
        "Bairro à margem leste do Rio Sumida, dominado pela Tokyo Sky Tree (torre mais alta do Japão, desde 2012) — entretenimento, vista panorâmica e o complexo de lojas Tokyo Solamachi aos pés da torre. O nome do distrito administrativo, Sumida, vem do próprio rio, antigamente uma das principais rotas de transporte marítimo de Tokyo.",
    },
    decisoes: [
      {
        titulo: "Qual ingresso escolher?",
        resposta:
          "Tembo Deck (350 m) já entrega a vista principal sobre a cidade — suficiente pra uma primeira visita. Deck + Galleria (450 m) soma o observatório mais alto, vale se quiser a experiência completa ou tentar fotografar o Monte Fuji em dias claros.",
      },
      {
        titulo: "Se o tempo estiver ruim",
        resposta:
          "Com neblina ou chuva forte a vista do observatório fica comprometida — considere adiar a subida para outro horário do roteiro. A Tokyo Solamachi, ao nível do chão, continua valendo a visita.",
      },
    ],
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Asakusa",
        nomeJapones: "浅草駅",
        distancia: "Plataforma Toei Asakusa Line — a poucos minutos a pé do almoço em Asakusa",
        saida: "Entrada/Saída A4, direção Kaminarimon",
        foto: "/images/asakusa-station-entrance.webp",
      },
      linha: { codigo: "A", nome: "Toei Asakusa Line", cor: "#EF5BA1" },
      estacoesIntermediarias: [
        { nome: "Honjo-Azumabashi", nomeJapones: "本所吾妻橋", numero: "A19" },
      ],
      estacaoDestino: {
        nome: "Oshiage (Tokyo Skytree Station)",
        nomeJapones: "押上（スカイツリー前）駅",
        saida: "Saída B3, ligação direta e subterrânea com a Tokyo Solamachi",
        foto: "/images/oshiage-station-entrance.jpeg",
      },
      opcoes: [
        {
          meio: "Trem",
          tempo: "≈4 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Toei Asakusa Line, sem baldeação — 2 paradas (Honjo-Azumabashi no meio do caminho). Não é preciso voltar para perto do hotel.",
            "Trens a cada ~5–8 min · tarifa ≈¥180.",
            "Embarque na plataforma do metrô na Estação Asakusa, saída A4, a mesma região da manhã.",
            "A Estação Oshiage já entrega você direto na base da torre pela saída B3, com acesso subterrâneo à Tokyo Solamachi.",
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
    },
    atracaoPrincipal: "Tokyo Sky Tree",
    atracaoPrincipalImagem: "/images/dia1-skytree.png",
    detalhesPraticos: [
      {
        label: "Melhor horário",
        horarioDestaque: "16:30–18:30",
        valor:
          "Chegada ao complexo Tokyo Solamachi às 17:00, com subida à torre por volta das 18:15 — tempo certo para acompanhar o pôr do sol do topo.",
        imagem: "/images/skytree-por-do-sol-fuji.jpg",
        imagemAlt: "Tokyo Sky Tree ao pôr do sol, com o Monte Fuji visível ao fundo",
      },
      { label: "Tempo estimado", valor: "1–2 horas" },
      { label: "Reserva", valor: "Recomendada" },
      { label: "Horário de funcionamento", valor: "10:00 às 22:00" },
    ],
    listasPraticas: [
      {
        titulo: "Ingressos",
        itens: [
          "1. Visita ao 350º andar — Tembo Deck",
          "2. Visita ao 350º e 450º andar",
          "3. Ingresso separado para a Tembo Galleria",
        ],
      },
      {
        titulo: "Preço Estimado",
        itens: [
          "Tembo Deck: a partir de ¥1.800 por pessoa",
          "Tembo Deck + Tembo Galleria: a partir de ¥3.000",
          "Tembo Galleria avulsa: ¥1.400 por pessoa",
          "Crianças entre 6 e 14 anos pagam meia entrada.",
        ],
      },
    ],
    pois: [
      {
        category: "Gastronomia",
        title: "Sky Restaurant 634 (Musashi)",
        description:
          "Dentro do próprio Tembo Deck, piso 345 — menu degustação sazonal que mistura técnica francesa com ingredientes japoneses inspirados na culinária de Edo. Almoço ~¥6.200–8.500, jantar ~¥15.000–19.200 por pessoa (fora o ingresso da torre). Reserva recomendada.",
        prioridade: "opcional",
        imagem: "/images/skytree-sky-restaurant-musashi.jpg",
        imagemAlt: "Interior do Sky Restaurant 634 (Musashi), no piso 345 da Tokyo Sky Tree",
      },
      {
        category: "Gastronomia",
        title: "Skytree Cafe",
        description:
          "Cafeteria informal do Tembo Deck (piso 340, com mesas — a versão do piso 350 é só balcão) — bebidas autorais, lanches leves e sobremesas temáticas com vista para a cidade.",
        prioridade: "opcional",
        imagem: "/images/skytree-cafe.jpg",
        imagemAlt: "Balcão do Skytree Cafe, no piso 340 da Tokyo Sky Tree",
      },
    ],
    subAtracoes: [
      {
        label: "Solamachi",
        titulo: "Tokyo Solamachi",
        descricao:
          "O complexo aos pés da torre, do subsolo ao 31º andar — lojas, restaurantes, o Aquário de Sumida e o Planetário Konica Minolta TENKU. Elevadores de acesso ao aquário e ao jardim na cobertura ficam nas entradas do 3º andar. Outras lojas populares no complexo: Chiikawa Land, Kirby Cafe Tokyo e Ultraman World M78.",
        visaoAnotada: {
          titulo: "Mapa dos andares — Tokyo Solamachi",
          imagem: "/images/solamachi-mapa-andares.png",
          imagemAlt: "Mapa oficial dos andares do complexo Tokyo Solamachi, do B3 ao 31º andar",
          nota: "As áreas e lojas podem estar sujeitas a alterações — conferir no local.",
          simples: true,
        },
        poisLabel: "Lojas para conhecer",
        pois: [
          {
            category: "Loja",
            title: "Jump Shop",
            description:
              "Loja oficial da Shueisha com produtos das séries da Weekly Shonen Jump — One Piece, Naruto, Dragon Ball e outras.",
            prioridade: "opcional",
            imagem: "/images/solamachi-jump-shop.jpg",
            imagemAlt: "Vitrine da Jump Shop no Tokyo Solamachi, 4º andar",
          },
          {
            category: "Loja",
            title: "Pokémon Center Skytree Town",
            description:
              "Uma das maiores Pokémon Centers do Japão — pelúcias, action figures e itens exclusivos da região, no East Yard.",
            prioridade: "opcional",
            imagem: "/images/solamachi-pokemon-center.jpg",
            imagemAlt: "Interior do Pokémon Center Skytree Town, 4º andar",
          },
          {
            category: "Loja",
            title: "Donguri Republic",
            description:
              "Loja oficial do Studio Ghibli — produtos de Totoro, A Viagem de Chihiro e outros clássicos do estúdio.",
            prioridade: "opcional",
            imagem: "/images/solamachi-donguri-republic.jpg",
            imagemAlt: "Vitrine da Donguri Republic (Studio Ghibli) no Tokyo Solamachi, 2º andar",
          },
          {
            category: "Loja",
            title: "STRICT-G",
            description:
              "Loja oficial da linha Gundam — roupas, acessórios e modelos (Gunpla) inspirados na franquia.",
            prioridade: "opcional",
            imagem: "/images/solamachi-strict-g.jpg",
            imagemAlt: "Vitrine da STRICT-G (Gundam) no Tokyo Solamachi, 4º andar",
          },
        ],
        gastronomia: {
          intro:
            "A Tokyo Sky Tree está integrada ao shopping Tokyo Solamachi, que reúne diversas opções de restaurantes, praça de alimentação e um mercado no subsolo com alternativas para takeout.",
          restaurantesLabel: "Opções de refeição",
          restaurantes: [
            {
              nome: "Hitsumabushi Bincho",
              descricao: "Enguia · hitsumabushi",
              localizacao: "6º andar",
              preco: "~¥6.000",
              horario: "11:00–21:00",
              foto: "/images/Hitsumabushi.png",
            },
            {
              nome: "Kaiten Sushi Toriton",
              descricao: "Sushi de esteira · prático",
              localizacao: "6º andar",
              preco: "~¥6.000",
              horario: "11:00–22:00",
              foto: "/images/Toriton.png",
            },
          ],
          mapa: {
            titulo: "Mapa — Solamachi Dining",
            imagem: "/images/solamachi-dining-map.png",
            imagemAlt: "Mapa dos restaurantes do Tokyo Solamachi",
          },
        },
      },
    ],
    banheirosProximos: [
      {
        local: "4F do Tokyo Solamachi",
        endereco: "Bem na entrada do Tembo Deck",
        nota: "Acessível/cadeirante.",
      },
      {
        local: "Nos próprios observatórios",
        endereco: "Tembo Deck (350 m) e Tembo Galleria (450 m)",
        nota: "Não precisa descer — tem banheiro em cada andar de observação.",
      },
    ],
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
      { label: "Melhor horário", valor: "Logo na abertura, às 9h" },
    ],
    pois: [
      {
        title: "Otemon Gate",
        description:
          "Antigo portão principal do Castelo de Edo, usado pelos daimyō em suas visitas oficiais ao shogun. Destruído em bombardeio aéreo em 1945 e reconstruído em 1967 — hoje é a entrada principal dos jardins, o primeiro ponto do passeio.",
        rating: 4,
      },
      {
        title: "Bansho (Casas de Guarda)",
        description:
          "Uma das três casas de guarda samurai que sobrevivem do Castelo de Edo — o Hyakunin Bansho abrigava quatro unidades de 120 guardas responsáveis pela proteção do recinto interno do castelo. Fica logo após a entrada por Otemon.",
        rating: 3,
      },
      {
        title: "Muralhas e Fossos Originais",
        description:
          "Trechos originais das muralhas de pedra e fossos que protegiam o Castelo de Edo, preservados desde o período feudal — visíveis ao longo de todo o caminho.",
        rating: 3,
      },
      {
        title: "Fujimi-yagura",
        description:
          "Torre de vigia construída em 1659, uma das poucas estruturas originais remanescentes do Castelo de Edo — depois que o incêndio de 1657 destruiu a torre principal, passou a funcionar como sua substituta simbólica. Não é possível entrar, mas dá para ver de fora, dentro dos jardins. Uma das construções mais fotogênicas do local.",
        rating: 4,
      },
      {
        title: "Tenshudai",
        description:
          "Enorme base de pedra onde ficava a torre principal (tenshu) do Castelo de Edo — pode ser escalada, e é um dos pontos mais impressionantes dos jardins. Fica no extremo norte do complexo, o ponto mais distante da entrada — bom encerramento do passeio.",
        rating: 4,
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
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.png" },
      estacoesIntermediarias: [
        { nome: "Ginza", nomeJapones: "銀座", numero: "G09" },
        { nome: "Shimbashi", nomeJapones: "新橋", numero: "G08" },
        { nome: "Toranomon", nomeJapones: "虎ノ門", numero: "G07" },
        { nome: "Tameike-sanno", nomeJapones: "溜池山王", numero: "G06" },
        { nome: "Akasaka-mitsuke", nomeJapones: "赤坂見附", numero: "G05" },
        { nome: "Aoyama-itchome", nomeJapones: "青山一丁目", numero: "G04" },
        { nome: "Gaiemmae", nomeJapones: "外苑前", numero: "G03" },
      ],
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
      { label: "Melhor horário", valor: "Logo na abertura, antes dos grupos de turismo" },
    ],
    pois: [
      {
        title: "Parque de Yoyogi",
        description:
          "Você precisa entrar nele para acessar o Meiji Jingu — trata-se de uma enorme floresta com árvores extremamente altas, erguida do zero em homenagem à morte do imperador Meiji.",
        rating: 5,
      },
      {
        category: "Compras",
        title: "Omotesando",
        description:
          "Uma das maiores avenidas de boutiques e lojas de luxo de Tóquio, com diversos cafés e restaurantes importantes nas ruas ao redor da avenida principal — liga a saída do parque a Shibuya, seguindo para o sul.",
        rating: 3,
      },
      {
        title: "Estátua de Hachiko",
        description:
          "Estátua em homenagem ao cão que continuou esperando seu dono voltar para casa sem saber que ele havia falecido — deu origem ao filme \"Pra Sempre ao Seu Lado\". Fica bem na saída da Estação Shibuya.",
        rating: 3,
      },
      {
        title: "Shibuya Crossing",
        description:
          "O famoso cruzamento hexagonal de Shibuya, que fica caótico às 18h — ao lado da estátua de Hachiko, último ponto antes de seguir para Shinjuku.",
        rating: 4,
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
      estacaoOrigem: { nome: "Estação Shibuya", nomeJapones: "渋谷駅" },
      linha: { codigo: "JY", nome: "JR Yamanote Line", cor: "#8FAADC", logo: "/images/jr-logo.webp" },
      estacoesIntermediarias: [
        { nome: "Harajuku", nomeJapones: "原宿", numero: "JY19" },
        { nome: "Yoyogi", nomeJapones: "代々木", numero: "JY18" },
      ],
      estacaoDestino: { nome: "Estação Shinjuku", nomeJapones: "新宿駅" },
      opcoes: [
        {
          meio: "Trem JR",
          tempo: "≈7 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Yamanote Line), sem baldeação.",
            "Embarque na mesma estação onde termina o passeio por Shibuya Crossing.",
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
        "De Shibuya até Shinjuku são cerca de 7 minutos de trem pela JR Yamanote Line, sem baldeação — a mesma linha usada em quase todo o trecho central de Tóquio.",
    },
    atracaoPrincipal: "Bairro de Shinjuku",
    atracaoPrincipalImagem: "/images/draft-shinjuku.png",
    detalhesPraticos: [
      { label: "Mirante do Governo Metropolitano", valor: "Gratuito · ~9h30–22h" },
      { label: "Golden Gai", valor: "Maioria dos bares abre após 20h" },
      { label: "Thermae-Yu", valor: "Aberto 24h" },
      { label: "Melhor horário", valor: "A partir das 17h–18h, quando os letreiros de neon acendem" },
    ],
    atracaoPrincipalFoco: "center",
    pois: [
      {
        title: "Shinjuku Gyoen",
        description:
          "Um dos parques mais bonitos de Tóquio, misturando jardins japonês, francês e inglês — refúgio verde no meio do bairro mais denso da cidade. Melhor visitar logo na chegada, ainda com luz do dia (fica ao sul da estação, fecha à noite).",
        rating: 4,
      },
      {
        title: "Prédio do Governo Metropolitano de Tóquio + Mirante",
        description:
          "Torres gêmeas projetadas por Kenzo Tange com mirante gratuito no 45º andar e vista panorâmica da cidade — em dias claros, dá para ver o Monte Fuji. Fica no lado oeste da estação; ideal chegar perto do fim da tarde para ver o pôr do sol.",
        rating: 4,
      },
      {
        title: "Gato 3D Gigante",
        description:
          "Gato tridimensional gigante exibido em telão curvo no edifício Cross Shinjuku Vision, na saída leste da estação — uma das atrações mais fotografadas do bairro, já a caminho de Kabukicho.",
        rating: 4,
      },
      {
        title: "Estátua do Godzilla",
        description:
          "Réplica em tamanho real na varanda do Hotel Gracery, símbolo do distrito de entretenimento de Kabukicho — pertinho do Gato 3D.",
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
          "Rede de vielas estreitas com mais de 200 bares minúsculos, a maioria com capacidade para menos de 10 pessoas — encostado em Kabukicho, último ponto da noite antes do onsen Thermae-Yu.",
        rating: 5,
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
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.png" },
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
        title: "Akihabara Radio Kaikan",
        description:
          "Action figures e um shopping com um pouco de tudo — logo na saída Electric Town da estação, o primeiro ponto do passeio.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Animate",
        description: "Uma das maiores redes de lojas de mangá do Japão.",
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
        title: "Super Potato",
        description:
          "Loja retrô de videogames — nas proximidades também fica a Suruga-ya Anime & Hobby Store, com videogames e itens de anime.",
        rating: 4,
      },
      {
        category: "Compras",
        title: "Hareruya 2",
        description: "Pokémon Trading Card Game.",
        rating: 3,
      },
      {
        category: "Compras",
        title: "Ark",
        description: "Peças de computador.",
        rating: 3,
      },
      {
        category: "Curiosidade",
        title: "Weird Vending Machine Corner",
        description: "Cantinho com máquinas de venda automática bizarras e inusitadas, um clássico despretensioso de Akihabara.",
        rating: 2,
      },
      {
        category: "Compras",
        title: "BIC Camera ou Yodobashi Camera",
        description:
          "Grandes lojas de eletrônicos — Yodobashi-Akiba fica do lado leste da estação (saída Showa-dori), um bom último ponto antes de seguir para o almoço.",
        rating: 3,
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
      linha: { codigo: "JY", nome: "JR Yamanote / Keihin-Tohoku Line", cor: "#8FAADC", logo: "/images/jr-logo.webp" },
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
            title: "Aranha Gigante de Louise Bourgeois",
            description:
              "A única no mundo preparada para terremotos, aos pés do Mori Tower — o primeiro ponto ao chegar em Roppongi Hills.",
            rating: 3,
          },
          {
            title: "Museu de Arte Moderna Mori",
            description: "Museu de arte contemporânea no topo do Mori Tower.",
            rating: 4,
          },
          {
            title: "Mori Garden",
            description: "Jardim japonês tradicional aos pés do Mori Tower.",
            rating: 3,
          },
          {
            title: "Hinokicho Park",
            description:
              "Parque tranquilo no coração de Roppongi, a poucos minutos a pé do Mori Tower.",
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
        title: "Sannenzaka",
        description:
          "Ladeira histórica de casas tradicionais, logo na descida a partir do templo.",
        rating: 4,
      },
      {
        title: "Ninenzaka",
        description: "Continuação de Sannenzaka, descendo rumo a Gion.",
        rating: 4,
      },
      {
        title: "Café % Arabica Kyoto Higashiyama",
        description:
          "Cafeteria minimalista muito concorrida, a poucos passos da Pagode Yasaka — última parada antes de seguir para Gion.",
        rating: 2,
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
      linha: { codigo: "JR", nome: "JR Nara Line", cor: "#00A650", logo: "/images/jr-logo.webp" },
      estacoesIntermediarias: [{ nome: "Tofukuji", nomeJapones: "東福寺", numero: "D02" }],
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
      { label: "Melhor horário", valor: "Logo na abertura, antes dos ônibus de turismo" },
    ],
    pois: [
      {
        title: "Ryoan-ji",
        description:
          "Templo zen famoso pelo jardim de pedras — pega o mesmo ônibus/circuito de Kinkaku-ji, poucos minutos de distância.",
        rating: 4,
      },
      {
        title: "Ninna-ji",
        description:
          "Templo histórico com belas cerejeiras, um pouco mais além de Ryoan-ji no mesmo circuito.",
        rating: 2,
      },
      {
        title: "Museu do Mangá de Kyoto",
        description:
          "Acervo com milhares de títulos de mangá — fica no centro de Kyoto (Karasuma-Oike), fora da rota de Kinkaku-ji: exige um deslocamento à parte (~20-30 min), não dá pra encaixar sem voltar ao centro.",
        rating: 3,
      },
      {
        title: "Nintendo Store Kyoto",
        description:
          "Loja oficial da Nintendo no Takashimaya, no centro de Kyoto — também fora da rota de Kinkaku-ji, exige o mesmo deslocamento ao centro do Museu do Mangá.",
        rating: 3,
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
      linha: { codigo: "A12", nome: "Toei Asakusa Line", cor: "#E85298", logo: "/images/toei-mark.png" },
      estacoesIntermediarias: [{ nome: "Nihombashi", nomeJapones: "日本橋", numero: "A13" }],
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
      linha: { codigo: "A14", nome: "Toei Asakusa Line", cor: "#E85298", logo: "/images/toei-mark.png" },
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
      { label: "Melhor horário", valor: "Chegar às 14h30, para acompanhar a 2ª divisão" },
    ],
    pois: [
      {
        title: "Edo Noren (Área Externa do Kokugikan)",
        description: "Vila gastronômica temática de sumô, na entrada do estádio.",
        rating: 3,
      },
      {
        title: "Santuário Nomi-no-Sukune",
        description:
          "Monumento com os nomes de todos os Yokozuna (Título máximo de lutador de Sumô) — pertinho do Kokugikan.",
        rating: 2,
      },
      {
        title: "Museu de Espadas",
        description:
          "Coleção de espadas samurai tradicionais, a alguns minutos a pé do estádio.",
        rating: 3,
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

// Dia da semana de cada data do roteiro (04–12 de maio de 2027), exibido
// abaixo do "05 / MAI" no seletor de dias.
const DIA_SEMANA: Record<string, string> = {
  "04 Mai": "Terça",
  "05 Mai": "Quarta",
  "06 Mai": "Quinta",
  "07 Mai": "Sexta",
  "08 Mai": "Sábado",
  "09 Mai": "Domingo",
  "10 Mai": "Segunda",
  "11 Mai": "Terça",
  "12 Mai": "Quarta",
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
    border: "border-[#2C6CA6]",
    bg: "bg-[#F8FAF9]",
    circle: "bg-[#2C6CA6]",
    text: "text-[#2C6CA6]",
    muted: "text-[#24211D]/70",
    starMuted: "text-[#2C6CA6]/25",
    badge: "border-[#2C6CA6]/30 bg-[#2C6CA6]/10 text-[#2C6CA6]",
    chip: "border-[#2C6CA6]/25 bg-[#FDFCF9] text-[#2C6CA6]",
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

const PRIORIDADE_LABEL: Record<NonNullable<Poi["prioridade"]>, string> = {
  imperdivel: "Imperdível",
  recomendado: "Recomendado",
  opcional: "Opcional",
};

function PriorityBadge({ prioridade }: { prioridade: NonNullable<Poi["prioridade"]> }) {
  const style =
    prioridade === "imperdivel"
      ? "border-[#B96432] bg-[#B96432] text-white"
      : prioridade === "recomendado"
        ? "border-[#B96432]/40 bg-[#B96432]/10 text-[#B96432]"
        : "border-[#24211D]/20 bg-transparent text-[#24211D]/50";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${style}`}
    >
      {PRIORIDADE_LABEL[prioridade]}
    </span>
  );
}

function PoiCard({ index, poi }: { index: number; poi: Poi }) {
  const s = poiStyles(poi.bairro);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const imagens: { src: string; alt: string }[] =
    poi.imagens && poi.imagens.length > 0
      ? poi.imagens
      : poi.imagem
        ? [{ src: poi.imagem, alt: poi.imagemAlt ?? poi.title }]
        : [];

  const hasPhoto = imagens.length > 0;

  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-2xl border ${s.border} ${s.bg}`}>
      {hasPhoto && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setZoomIndex(0)}
            className="group relative block aspect-[16/10] w-full overflow-hidden"
          >
            <img
              src={imagens[0].src}
              alt={imagens[0].alt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
              <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                <IconZoom className="h-4 w-4" />
              </span>
            </div>
          </button>
          {typeof poi.ordem === "number" && (
            <span
              className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ring-2 ring-white/70 ${s.circle}`}
            >
              {poi.ordem}
            </span>
          )}
          {imagens.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {imagens.slice(1, 3).map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setZoomIndex(i + 1)}
                  className="h-10 w-10 overflow-hidden rounded-lg border-2 border-white/85 shadow-md transition hover:scale-105"
                >
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
              {imagens.length > 3 && (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white/85 bg-black/55 text-xs font-bold text-white shadow-md">
                  +{imagens.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {!hasPhoto && typeof poi.ordem === "number" && (
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${s.circle}`}>
              {poi.ordem}
            </span>
          )}
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
          {poi.prioridade ? (
            <PriorityBadge prioridade={poi.prioridade} />
          ) : (
            typeof poi.rating === "number" && (
              <Stars rating={poi.rating} styles={s} />
            )
          )}
        </div>
        {poi.nomeJapones && (
          <p className={`text-[19px] ${s.muted}`}>{poi.nomeJapones}</p>
        )}
        {poi.description && (
          <p className={`text-xs leading-5 ${s.muted}`}>
            {poi.description}
          </p>
        )}
        {poi.lista && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
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

      {zoomIndex !== null && imagens[zoomIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoomIndex(null)}
        >
          <button
            type="button"
            onClick={() => setZoomIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>

          {imagens.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomIndex((i) => (i! - 1 + imagens.length) % imagens.length);
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
                  setZoomIndex((i) => (i! + 1) % imagens.length);
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
              src={imagens[zoomIndex].src}
              alt={imagens[zoomIndex].alt}
              className="max-h-[80vh] max-w-[92vw] rounded-2xl object-contain"
            />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
              {poi.title}
            </p>
            {(poi.description || imagens[zoomIndex].alt !== poi.title) && (
              <p className="mx-auto mt-1.5 max-w-md text-center text-xs leading-5 text-white/65">
                {poi.description ?? imagens[zoomIndex].alt}
              </p>
            )}
          </div>
        </div>
      )}
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

function ResumoDiaBlock({
  resumo,
}: {
  resumo: NonNullable<DayContent["resumoDia"]>;
}) {
  return (
    <div className="mb-10 rounded-2xl border border-[#2C6CA6] bg-[#F8FAF9] p-5 sm:p-6">
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#000000]">
        Resumo do Dia
      </p>
      <div>
        {resumo.passos.map((passo, i) => (
          <div key={passo.titulo + i} className="flex gap-4">
            <div className="flex flex-col items-center">
              {passo.foto ? (
                passo.foto.includes("/images/icone-") ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#F8FAF9] shadow-sm sm:h-[76px] sm:w-[76px]">
                    <img
                      src={passo.foto}
                      alt={passo.titulo}
                      className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm sm:h-[76px] sm:w-[76px]">
                    <img
                      src={passo.foto}
                      alt={passo.titulo}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-[#2C6CA6]/35 text-[#2C6CA6]/50 sm:h-[76px] sm:w-[76px]">
                  <IconClock className="h-6 w-6" />
                </div>
              )}
              {i < resumo.passos.length - 1 && (
                <span className="my-1 min-h-[18px] w-[2px] flex-1 rounded-full bg-[#000000]/20" />
              )}
            </div>
            <div className={`min-w-0 flex-1 pt-2.5 ${i < resumo.passos.length - 1 ? "pb-6" : ""}`}>
              <p className="text-base font-semibold leading-tight text-[#000000]">
                {passo.titulo}
              </p>
              {passo.horario && (
                <p className="mt-1 text-sm font-medium tracking-wide text-[#000000]/60">
                  {passo.horario}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaEmNumerosBlock({
  numeros,
}: {
  numeros: NonNullable<DayContent["diaEmNumeros"]>;
}) {
  const itens: { label: string; valor: string }[] = [
    { label: "Atrações", valor: numeros.atracoes },
    { label: "Caminhada", valor: numeros.caminhada },
    { label: "Transporte", valor: numeros.transporte },
    { label: "Metrô/Trem", valor: numeros.linhasMetro },
    { label: "Ritmo", valor: numeros.ritmo },
    { label: "Saída · Retorno", valor: `${numeros.saida} · ${numeros.retorno}` },
  ];
  return (
    <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:grid-cols-3 sm:p-6">
      {itens.map((item) => (
        <div key={item.label}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#24211D]/45">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-[#24211D]">{item.valor}</p>
        </div>
      ))}
    </div>
  );
}

function GastronomiaBlock({ gastronomia }: { gastronomia: Gastronomia }) {
  const [zoom, setZoom] = useState(false);
  const [zoomedFoto, setZoomedFoto] = useState<{ src: string; alt: string; endereco?: string } | null>(null);
  const temRestaurantes = gastronomia.restaurantes && gastronomia.restaurantes.length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-4 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
        Gastronomia
        {gastronomia.subtitulo && (
          <span className="ml-2 font-normal normal-case tracking-normal text-[#24211D]/65">
            ({gastronomia.subtitulo})
          </span>
        )}
      </p>

      {gastronomia.intro && (
        <p className="mt-3 text-sm leading-6 text-[#24211D]/78">
          {gastronomia.intro}
        </p>
      )}

      {gastronomia.itens && gastronomia.itens.length > 0 && (
        <>
          {gastronomia.itensLabel && (
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#24211D]/45">
              {gastronomia.itensLabel}
            </p>
          )}
          {gastronomia.itens.some((item) => item.foto) ? (
            <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${gastronomia.itensLabel ? "mt-2" : "mt-4"}`}>
              {gastronomia.itens.map((item, i) =>
                item.foto ? (
                  <div
                    key={`${item.nome}-${i}`}
                    className="overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedFoto({ src: item.foto!, alt: item.nome, endereco: item.localizacao })
                      }
                      className="group relative block aspect-square w-full overflow-hidden"
                    >
                      <img
                        src={item.foto}
                        alt={item.nome}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                        <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <IconZoom className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#24211D]">
                        {item.nome}
                      </p>
                      {item.descricao && (
                        <p className="mt-0.5 text-[11px] leading-4 text-[#24211D]/70">
                          {item.descricao}
                        </p>
                      )}
                      {(item.localizacao || item.preco) && (
                        <div className="mt-1.5 space-y-1 border-t border-[#DDD8CF] pt-1.5 text-[10px] leading-4 text-[#24211D]/55">
                          {item.localizacao && <p>📍 {item.localizacao}</p>}
                          {item.preco && <p>¥ {item.preco}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={`${item.nome}-${i}`}
                    className="flex flex-col justify-center rounded-2xl border border-dashed border-[#DDD8CF] bg-[#FDFCF9] p-3"
                  >
                    <p className="text-xs font-semibold text-[#24211D]">
                      {item.nome}
                    </p>
                    {item.descricao && (
                      <p className="mt-0.5 text-[11px] leading-4 text-[#24211D]/70">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {gastronomia.itens.map((item, i) => (
                <li key={`${item.nome}-${i}`} className="text-sm leading-6 text-[#24211D]/85">
                  <span className="font-semibold text-[#24211D]/95">{item.nome}</span>
                  {item.descricao && (
                    <span className="text-[#24211D]/75"> — {item.descricao}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {temRestaurantes && (
        <>
          {gastronomia.restaurantesLabel && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#24211D]/45">
              {gastronomia.restaurantesLabel}
            </p>
          )}
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${gastronomia.restaurantesLabel ? "mt-2" : "mt-4"}`}>
            {gastronomia.restaurantes!.map((r) => (
              <div
                key={r.nome}
                className="overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9]"
              >
                {r.foto && (
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedFoto({ src: r.foto!, alt: r.nome, endereco: r.localizacao })
                    }
                    className="group relative block aspect-square w-full overflow-hidden"
                  >
                    <img
                      src={r.foto}
                      alt={r.nome}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                      <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <IconZoom className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                )}
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#24211D]">
                    {r.nome}
                  </p>
                  {r.descricao && (
                    <p className="mt-0.5 text-xs text-[#B96432]">
                      {r.descricao}
                    </p>
                  )}
                  {(r.localizacao || r.preco || r.horario) && (
                    <div className="mt-3 space-y-1 border-t border-[#DDD8CF] pt-3 text-[11px] leading-5 text-[#24211D]/60">
                      {r.localizacao && <p>📍 {r.localizacao}</p>}
                      {r.preco && <p>¥ {r.preco}</p>}
                      {r.horario && <p>🕒 {r.horario}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {gastronomia.mapa ? (
        <>
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-4 text-left transition hover:border-[#2C6CA6]/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2C6CA6]">
              <IconMap className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[#1B4A73]">
                {gastronomia.mapa.titulo ?? "Mapa de restaurantes"}
              </span>
              <span className="block text-xs text-[#2C6CA6]/70">
                Toque para ampliar
              </span>
            </span>
            <span className="ml-auto shrink-0 text-lg text-[#2C6CA6]/60">
              →
            </span>
          </button>

          {zoom && (
            <div
              className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
              onClick={() => setZoom(false)}
            >
              <button
                type="button"
                onClick={() => setZoom(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
                aria-label="Fechar"
              >
                <IconX className="h-5 w-5" />
              </button>
              <img
                src={gastronomia.mapa.imagem}
                alt={gastronomia.mapa.imagemAlt}
                className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 border-t border-[#DDD8CF] pt-3 text-xs leading-5 text-[#24211D]/68">
          Mapeamento de opções de restaurantes nos arredores da atração
          principal
        </p>
      )}

      {zoomedFoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoomedFoto(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedFoto(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedFoto.src}
              alt={zoomedFoto.alt}
              className="max-h-[80vh] max-w-[92vw] rounded-2xl object-contain"
            />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
              {zoomedFoto.alt}
            </p>
            {zoomedFoto.endereco && (
              <p className="mx-auto mt-1.5 max-w-md text-center text-xs leading-5 text-white/65">
                {zoomedFoto.endereco}
              </p>
            )}
          </div>
        </div>
      )}
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
    <img
      src="/images/icone-relogio.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
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
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#000000] text-xs font-bold text-white">
          {number}
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#000000]">
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
      {/* Mesmo template de card de estação do /ajisairoteiros: logo da
          companhia operadora, nome da estação e nome em japonês — repetido
          pra origem e destino, ligados por uma seta. Fotos de estação em si
          (fachada/entrada) não entram aqui — ficam só no guia do hotel. */}
      <p
        className={`flex items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#24211D]/65 ${
          deslocamento.estacoesIntermediarias &&
          deslocamento.estacoesIntermediarias.length > 0
            ? "mb-16 sm:mb-20"
            : "mb-5"
        }`}
      >
        {(() => {
          const Icon = deslocamento.opcoes.find((o) => o.recomendado)?.Icon ?? IconMetro;
          return <Icon className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />;
        })()}
        {deslocamento.linha.logo && `${deslocamento.linha.codigo} · `}
        {deslocamento.linha.nome} · sem baldeação
      </p>
      <div className="flex items-start justify-center gap-3 text-center sm:gap-5">
        <div className="flex w-32 min-w-0 flex-col items-center sm:w-40">
          {deslocamento.estacaoOrigem.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                src={deslocamento.estacaoOrigem.foto}
                alt={`Entrada da ${deslocamento.estacaoOrigem.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                  src={deslocamento.linha.logo}
                  alt={deslocamento.linha.nome}
                  className="h-full w-full object-contain"
                />
              </div>
            )
          )}
          <p className="text-sm font-semibold text-[#24211D]">
            {deslocamento.estacaoOrigem.nome}
          </p>
          {deslocamento.estacaoOrigem.nomeJapones && (
            <p className="text-base text-[#24211D]/55">
              {deslocamento.estacaoOrigem.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoOrigem.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#24211D]/65">
              {deslocamento.estacaoOrigem.distancia}
            </p>
          )}
          {deslocamento.estacaoOrigem.saida && (
            <div className="mt-3 flex w-full flex-col items-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                src="/images/icone-saida2.png"
                alt=""
                className="h-20 w-20 object-contain"
              />
              <p className="text-xs font-bold uppercase leading-snug tracking-[0.04em] text-emerald-800 sm:text-sm">
                {deslocamento.estacaoOrigem.saida}
              </p>
            </div>
          )}
        </div>

        {/* Traço horizontal ligando as duas estações, na cor da linha —
            alinhado ao centro vertical dos logos (h-20 = 80px, centro em
            40px, daí o pt-10). Estações intermediárias (quando houver)
            aparecem como círculos com letra+número da linha sobre o traço
            grosso, nome em romaji acima e nome em japonês na vertical
            abaixo — mesmo padrão dos mapas oficiais de metrô de Tóquio. */}
        <div className="flex h-24 min-w-[32px] flex-1 flex-col justify-start pt-10 sm:min-w-[64px]">
          {deslocamento.estacoesIntermediarias &&
            deslocamento.estacoesIntermediarias.length > 0 && (
              <div className="relative h-0 w-full">
                {deslocamento.estacoesIntermediarias.map((estacao, i) => {
                  const pct =
                    ((i + 1) /
                      (deslocamento.estacoesIntermediarias!.length + 1)) *
                    100;
                  return (
                    <span
                      key={`romaji-${estacao.nome}`}
                      className="absolute bottom-2 origin-bottom-left -rotate-45 whitespace-nowrap text-[11px] font-semibold leading-tight text-[#24211D] sm:text-xs"
                      style={{ left: `${pct}%` }}
                    >
                      {estacao.nome}
                    </span>
                  );
                })}
              </div>
            )}
          <div
            className="relative h-2 w-full rounded-full"
            style={{ background: deslocamento.linha.cor || "#B96432" }}
          >
            {deslocamento.estacoesIntermediarias?.map((estacao, i) => {
              const pct =
                ((i + 1) /
                  (deslocamento.estacoesIntermediarias!.length + 1)) *
                100;
              return (
                <span
                  key={estacao.nome}
                  className="absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white text-[9px] font-bold leading-none sm:h-6 sm:w-6 sm:text-[10px]"
                  style={{
                    left: `${pct}%`,
                    borderColor: deslocamento.linha.cor || "#B96432",
                    color: deslocamento.linha.cor || "#B96432",
                  }}
                >
                  {estacao.numero ?? "•"}
                </span>
              );
            })}
            <span
              className="absolute -right-px top-1/2 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: `13px solid ${deslocamento.linha.cor || "#B96432"}`,
              }}
            />
          </div>
          {deslocamento.estacoesIntermediarias &&
            deslocamento.estacoesIntermediarias.length > 0 && (
              <div className="relative h-0 w-full">
                {deslocamento.estacoesIntermediarias.map((estacao, i) => {
                  if (!estacao.nomeJapones) return null;
                  const pct =
                    ((i + 1) /
                      (deslocamento.estacoesIntermediarias!.length + 1)) *
                    100;
                  return (
                    <span
                      key={`ja-${estacao.nome}`}
                      className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium leading-none text-[#24211D]/70 sm:top-5 sm:text-xs"
                      style={{
                        left: `${pct}%`,
                        writingMode: "vertical-rl",
                        textOrientation: "upright",
                      }}
                    >
                      {estacao.nomeJapones}
                    </span>
                  );
                })}
              </div>
            )}
        </div>

        <div className="flex w-32 min-w-0 flex-col items-center sm:w-40">
          {deslocamento.estacaoDestino.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                src={deslocamento.estacaoDestino.foto}
                alt={`Entrada da ${deslocamento.estacaoDestino.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                  src={deslocamento.linha.logo}
                  alt={deslocamento.linha.nome}
                  className="h-full w-full object-contain"
                />
              </div>
            )
          )}
          <p className="text-sm font-semibold text-[#24211D]">
            {deslocamento.estacaoDestino.nome}
          </p>
          {deslocamento.estacaoDestino.nomeJapones && (
            <p className="text-base text-[#24211D]/55">
              {deslocamento.estacaoDestino.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoDestino.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#24211D]/65">
              {deslocamento.estacaoDestino.distancia}
            </p>
          )}
          {deslocamento.estacaoDestino.saida && (
            <div className="mt-3 flex w-full flex-col items-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                src="/images/icone-saida2.png"
                alt=""
                className="h-20 w-20 object-contain"
              />
              <p className="text-xs font-bold uppercase leading-snug tracking-[0.04em] text-emerald-800 sm:text-sm">
                {deslocamento.estacaoDestino.saida}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {deslocamento.opcoes.map((opcao) => (
          <div
            key={opcao.meio}
            className={`rounded-xl bg-[#EDF3FC] p-4 ${
              opcao.recomendado
                ? "border-2 border-[#3E5FA8]"
                : "border border-[#CBD9F2]"
            }`}
          >
            <div className="flex items-center gap-3">
              <opcao.Icon
                className={`shrink-0 ${
                  opcao.meio === "Táxi / Carro" ? "h-16 w-16" : "h-12 w-12"
                }`}
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#3E5FA8]/70">
                  {opcao.meio}
                </p>
                <p className="text-lg font-semibold text-[#24211D]">
                  {opcao.tempo}
                </p>
              </div>
            </div>
            {opcao.recomendado && (
              <p className="mt-2 inline-block rounded-full border border-[#3E5FA8]/35 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#3E5FA8]">
                Recomendado
              </p>
            )}
            <div className="mt-3 space-y-1.5">
              {opcao.detalhes.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <IconCheckSmall
                    className={`mt-0.5 h-3 w-3 shrink-0 ${
                      opcao.recomendado ? "text-[#3E5FA8]" : "text-[#3E5FA8]/50"
                    }`}
                  />
                  <p className="text-xs leading-5 text-[#24211D]/72">{d}</p>
                </div>
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

      {deslocamento.mapaChegada && (
        <div className="mt-5">
          <MapaVisaoGeralBlock mapa={deslocamento.mapaChegada} />
        </div>
      )}
    </div>
  );
}

function MapaVisaoGeralBlock({
  mapa,
}: {
  mapa: { imagem: string; imagemAlt: string; nota?: string };
}) {
  const [zoom, setZoom] = useState(false);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#DDD8CF]"
      >
        <div className="relative aspect-[21/9]">
          <img
            src={mapa.imagem}
            alt={mapa.imagemAlt}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
            <IconZoom className="h-4 w-4" />
          </span>
        </div>
      </button>
      {mapa.nota && (
        <p className="mt-2 text-xs leading-5 text-[#24211D]/60">{mapa.nota}</p>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
          <img
            src={mapa.imagem}
            alt={mapa.imagemAlt}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function VisaoAnotadaBlock({
  visaoAnotada,
  displayClassName,
}: {
  visaoAnotada: NonNullable<Period["visaoAnotada"]>;
  displayClassName: string;
}) {
  const [zoom, setZoom] = useState<{ src: string; alt: string; descricao?: string } | null>(null);

  // Sem pontos: a imagem já é um infográfico completo — mostra só ela, no
  // tamanho/proporção natural (sem recorte) e clicável pra zoom, sem a
  // coluna de legenda ao lado.
  if (!visaoAnotada.pontos || visaoAnotada.pontos.length === 0) {
    return (
      <div className="mb-8">
        {visaoAnotada.simples ? (
          <div className="mb-4 flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#000000]/50" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/55">
              {visaoAnotada.titulo ?? "Mapa"}
            </span>
          </div>
        ) : (
          <div
            className={`mb-5 flex min-h-[240px] w-full flex-col rounded-2xl bg-black bg-cover bg-center px-6 py-6 text-center sm:min-h-[300px] ${
              visaoAnotada.fundo ? "justify-between" : "justify-center"
            }`}
            style={
              visaoAnotada.fundo
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${visaoAnotada.fundo})`,
                  }
                : undefined
            }
          >
            <p className={`${displayClassName} text-2xl font-medium text-white md:text-3xl`}>
              Raio-X Alpinea{visaoAnotada.titulo && ` — ${visaoAnotada.titulo}`}
            </p>
            {visaoAnotada.fundo ? (
              <div />
            ) : (
              <img
                src="/images/icone-raiox-alpinea.png"
                alt=""
                className="mx-auto my-4 h-16 w-16 object-contain"
              />
            )}
            {visaoAnotada.comentarios && visaoAnotada.comentarios.length > 0 && (
              <div className="mx-auto max-w-2xl text-left">
                <div className="space-y-3">
                  {visaoAnotada.comentarios.map((c, i) => (
                    <p key={i} className="text-sm leading-6 text-white/80">
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setZoom({ src: visaoAnotada.imagem, alt: visaoAnotada.imagemAlt })}
          className="group relative mx-auto block max-w-xl overflow-hidden rounded-2xl border border-[#DDD8CF] sm:max-w-2xl"
        >
          <img
            src={visaoAnotada.imagem}
            alt={visaoAnotada.imagemAlt}
            className="block h-auto w-full transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
            <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
              <IconZoom className="h-4 w-4" />
            </span>
          </div>
        </button>
        {visaoAnotada.nota && (
          <p className="mt-2 text-center text-xs leading-5 text-[#24211D]/60">
            {visaoAnotada.nota}
          </p>
        )}

        {zoom && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setZoom(null)}
          >
            <button
              type="button"
              onClick={() => setZoom(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
              aria-label="Fechar"
            >
              <IconX className="h-5 w-5" />
            </button>
            <img
              src={zoom.src}
              alt={zoom.alt}
              className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {visaoAnotada.simples ? (
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#000000]/50" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/55">
            {visaoAnotada.titulo ?? "Mapa"}
          </span>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl bg-black px-6 py-5 text-center">
          <p className={`${displayClassName} text-2xl font-medium text-white md:text-3xl`}>
            Raio-X Alpinea{visaoAnotada.titulo && ` — ${visaoAnotada.titulo}`}
          </p>
          {visaoAnotada.comentarios && visaoAnotada.comentarios.length > 0 && (
            <div className="mx-auto mt-4 max-w-2xl border-t border-white/15 pt-4 text-left">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Principais Comentários da Seção
              </p>
              <div className="space-y-3">
                {visaoAnotada.comentarios.map((c, i) => (
                  <p key={i} className="text-sm leading-6 text-white/80">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mapa centralizado, sozinho — nada ao lado. */}
      <button
        type="button"
        onClick={() => setZoom({ src: visaoAnotada.imagem, alt: visaoAnotada.imagemAlt })}
        className="group relative mx-auto block max-w-xl overflow-hidden rounded-2xl border border-[#DDD8CF] sm:max-w-2xl"
      >
        <img
          src={visaoAnotada.imagem}
          alt={visaoAnotada.imagemAlt}
          className="block h-auto w-full transition duration-300 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/20">
          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
            <IconZoom className="h-4 w-4" />
          </span>
        </div>
      </button>

      {/* Tudo desce pra baixo do mapa — cards grandes, foto + descrição
          completa de cada ponto, pra realmente encantar. */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {visaoAnotada.pontos.map((ponto, i) => (
          <div
            key={ponto.titulo}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9]"
          >
            {ponto.foto && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setZoom({ src: ponto.foto!, alt: ponto.titulo, descricao: ponto.descricao })}
                  className="group relative block aspect-[4/3] w-full overflow-hidden"
                >
                  <img
                    src={ponto.foto}
                    alt={ponto.titulo}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                    <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <IconZoom className="h-4 w-4" />
                    </span>
                  </div>
                  {typeof ponto.ordem === "number" ? (
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md ring-2 ring-white/70">
                      {ponto.ordem}
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-black/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-md">
                      Opcional
                    </span>
                  )}
                </button>
                {ponto.fotoExtra && (
                  <button
                    type="button"
                    onClick={() =>
                      setZoom({ src: ponto.fotoExtra!.src, alt: ponto.fotoExtra!.alt })
                    }
                    className="absolute bottom-3 right-3 h-16 w-16 overflow-hidden rounded-xl border-[3px] border-[#B96432] shadow-lg ring-2 ring-white transition hover:scale-105"
                  >
                    <img
                      src={ponto.fotoExtra.src}
                      alt={ponto.fotoExtra.alt}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )}
              </div>
            )}
            <div className="p-5">
              <p className="text-base font-semibold text-[#24211D]">
                {ponto.titulo}
              </p>
              {ponto.nomeJapones && (
                <p className="mt-0.5 text-[21px] font-normal text-[#24211D]/50">
                  {ponto.nomeJapones}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-[#24211D]/75">
                {ponto.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoom.src}
              alt={zoom.alt}
              className="max-h-[80vh] max-w-[92vw] rounded-2xl object-contain"
            />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
              {zoom.alt}
            </p>
            {zoom.descricao && (
              <p className="mx-auto mt-1.5 max-w-md text-center text-xs leading-5 text-white/65">
                {zoom.descricao}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GaleriaBlock({
  galeria,
}: {
  galeria: NonNullable<Period["galeria"]>;
}) {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  return (
    <div className="mb-8">
      {galeria.titulo && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/55">
          {galeria.titulo}
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {galeria.imagens.map((img, i) => (
          <div
            key={img.src}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9]"
          >
            <button
              type="button"
              onClick={() => setZoom({ src: img.src, alt: img.alt })}
              className="group relative block aspect-[4/3] w-full shrink-0 overflow-hidden"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/20">
                <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <IconZoom className="h-4 w-4" />
                </span>
              </div>
              <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md ring-2 ring-white/70">
                {i + 1}
              </span>
            </button>
            {img.legenda && (
              <div className="p-5">
                <p className="text-sm font-semibold leading-6 text-[#24211D]">
                  {img.legenda}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
          <img
            src={zoom.src}
            alt={zoom.alt}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
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
  let stepCounter = 0;
  const passoDeslocamento = period.deslocamento ? ++stepCounter : undefined;
  const passoAtracao = ++stepCounter;
  const passoPois = period.pois.length > 0 ? ++stepCounter : undefined;
  const passoRefeicao = period.gastronomia ? ++stepCounter : undefined;
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-[#B96432]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
          {period.label ?? label}
        </span>
      </div>

      {/* Headliner — foto da atração principal do período, antes dos
          passos numerados (mesmo padrão do /ajisairoteiros). Full-bleed:
          -mx cancela o px-6/sm:px-10 do painel pra imagem ir de borda a
          borda do card, sem cantos arredondados nem moldura lateral. */}
      <div
        className={`relative mb-8 overflow-hidden ${
          period.atracaoPrincipalCompacta
            ? "mx-auto aspect-[3/4] max-w-[280px] rounded-2xl"
            : "-mx-6 aspect-[4/3] sm:-mx-10 sm:aspect-[16/9]"
        } ${period.atracaoPrincipalImagem ? "" : "border border-[#2C6CA6]"}`}
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
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute inset-x-5 bottom-14 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 sm:inset-x-10">
              Atração
            </p>
            <h3
              className={`${displayClassName} absolute inset-x-5 bottom-4 font-medium leading-snug text-white sm:inset-x-10 ${
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
              className={`${displayClassName} text-2xl font-medium text-[#000000] md:text-3xl`}
            >
              {period.atracaoPrincipal}
            </h3>
          </div>
        )}
      </div>

      {period.deslocamento && (
        <NumberedStep number={passoDeslocamento!} label="Deslocamento">
          <DeslocamentoCard deslocamento={period.deslocamento} />
        </NumberedStep>
      )}

      {period.percursoEssencial && (
        <div className="mb-8 rounded-2xl border border-[#2C6CA6] bg-[#F8FAF9] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#000000]">
              Percurso essencial
            </p>
            <div className="flex items-center gap-2.5 text-right">
              <IconClock className="h-6 w-6 shrink-0 text-[#B96432]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B96432]">
                  Tempo estimado de visitação
                </p>
                <p className="mt-0.5 text-lg font-bold leading-snug text-[#000000] sm:text-xl">
                  {period.percursoEssencial.duracao}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md">
              {(() => {
                let numero = 0;
                return period.percursoEssencial!.passos.map((passo, i) => {
                  if (passo.foto) numero += 1;
                  return (
                    <div key={passo.titulo} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {passo.foto ? (
                          <div className="relative h-16 w-16 shrink-0 sm:h-[76px] sm:w-[76px]">
                            <div className="h-full w-full overflow-hidden rounded-full border-2 border-white shadow-sm">
                              <img
                                src={passo.foto}
                                alt={passo.titulo}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1B4A73] text-sm font-bold text-white shadow-sm sm:h-9 sm:w-9 sm:text-base">
                              {numero}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-[#2C6CA6]/35 text-[#2C6CA6]/50 sm:h-[76px] sm:w-[76px]">
                            <IconWalk className="h-9 w-9 sm:h-11 sm:w-11" />
                          </div>
                        )}
                        {i < period.percursoEssencial!.passos.length - 1 && (
                          <span className="my-1 min-h-[18px] w-[2px] flex-1 rounded-full bg-[#000000]/20" />
                        )}
                      </div>
                      <div
                        className={`min-w-0 flex-1 pt-2.5 ${
                          i < period.percursoEssencial!.passos.length - 1 ? "pb-6" : ""
                        }`}
                      >
                        {passo.horario && (
                          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#B96432]">
                            {passo.horario}
                          </p>
                        )}
                        <p className="mt-0.5 text-base font-semibold leading-tight text-[#000000]">
                          {passo.titulo}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#000000]/60">
            O que dá pra fazer sem pressa. Os detalhes de cada ponto vêm a seguir — comece por aqui.
          </p>
        </div>
      )}

      <NumberedStep number={passoAtracao} label="Atração">
        <>
          {period.regiao && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#24211D]/68">
                {period.regiao.nome}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[#24211D]/78">
                {period.regiao.descricao}
              </p>
            </div>
          )}

          {period.detalhesPraticos && period.detalhesPraticos.length > 0 && (
            <>
              {(() => {
                const outros = period.detalhesPraticos!.filter(
                  (item) => item.label !== "Melhor horário"
                );
                return (
                  outros.length > 0 && (
                    <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:grid-cols-4">
                      {outros.map((item) => (
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
                  )
                );
              })()}

              {/* Melhor Horário — card próprio em destaque, separado da
                  grade de detalhes práticos. */}
              {period.detalhesPraticos
                .filter((item) => item.label === "Melhor horário")
                .map((item) =>
                  item.horarioDestaque ? (
                    <div
                      key={item.label}
                      className="mb-5 flex items-center gap-5 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-6 sm:p-7"
                    >
                      <IconClock className="h-20 w-20 shrink-0 text-[#2C6CA6] sm:h-24 sm:w-24" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C6CA6]/85">
                          Melhor Horário
                        </p>
                        <p className="mt-0.5 text-3xl font-semibold leading-tight text-[#1B4A73] sm:text-4xl">
                          {item.horarioDestaque}
                        </p>
                        <p className="mt-1.5 text-sm leading-6 text-[#1B4A73]/80">
                          {item.valor}
                        </p>
                      </div>
                      {item.imagem && (
                        <button
                          type="button"
                          onClick={() =>
                            setZoom({ src: item.imagem!, alt: item.imagemAlt ?? "" })
                          }
                          className="group relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl shadow-sm sm:block"
                        >
                          <img
                            src={item.imagem}
                            alt={item.imagemAlt ?? ""}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                            <span className="flex h-7 w-7 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                              <IconZoom className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      key={item.label}
                      className="mb-5 flex items-center gap-4 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-5"
                    >
                      <IconClock className="h-14 w-14 shrink-0 text-[#2C6CA6]" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C6CA6]/85">
                          Melhor Horário
                        </p>
                        <p className="text-sm font-semibold text-[#1B4A73]">
                          {item.valor}
                        </p>
                      </div>
                    </div>
                  )
                )}
            </>
          )}

          {period.listasPraticas && period.listasPraticas.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-4">
                <IconTicket className="h-20 w-20 shrink-0 text-[#2C6CA6]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C6CA6]/85">
                  Ingressos & Preços
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {period.listasPraticas.map((lista) => (
                  <div key={lista.titulo}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B4A73]/70">
                      {lista.titulo}
                    </p>
                    <div className="space-y-1.5">
                      {lista.itens.map((item, i) => (
                        <p key={i} className="text-sm leading-6 text-[#1B4A73]/85">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {period.decisoes && period.decisoes.length > 0 && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-900">
                <span className="text-sm">💡</span>
                Dúvidas Frequentes
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {period.decisoes.map((d, i) => (
                  <div
                    key={d.titulo}
                    className={
                      i % 2 === 0
                        ? "sm:border-r sm:border-emerald-200/80 sm:pr-6"
                        : ""
                    }
                  >
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-900">
                      <IconArrowDown className="h-3 w-3 -rotate-90 text-emerald-700" />
                      {d.titulo}
                    </p>
                    <p className="text-sm leading-6 text-emerald-950/75">
                      {d.resposta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {period.banheirosProximos && period.banheirosProximos.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5">
              <p className="mb-3.5 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#24211D]/55">
                <IconToilet className="h-20 w-20 text-[#000000]" />
                Banheiros Públicos Mais Próximos
              </p>
              <div className="space-y-3.5">
                {period.banheirosProximos.map((b, i) => (
                  <div
                    key={b.local}
                    className={
                      i > 0 ? "border-t border-[#DDD8CF] pt-3.5" : ""
                    }
                  >
                    <p className="text-sm font-semibold text-[#24211D]">
                      {b.local}
                    </p>
                    {b.endereco && (
                      <p className="mt-0.5 text-xs text-[#24211D]/60">
                        {b.endereco}
                      </p>
                    )}
                    {b.nota && (
                      <p className="mt-1 text-xs leading-5 text-[#24211D]/70">
                        {b.nota}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {period.gradeHorarios && (
            <GradeHorariosBlock grade={period.gradeHorarios} />
          )}
        </>
      </NumberedStep>

      {period.visaoAnotada && (
        <VisaoAnotadaBlock
          visaoAnotada={period.visaoAnotada}
          displayClassName={displayClassName}
        />
      )}

      {period.galeria && <GaleriaBlock galeria={period.galeria} />}

      {period.pois.length > 0 && (
        <NumberedStep number={passoPois!} label="Pontos de Interesse">
          <>
            {period.mapaVisaoGeral && (
              <MapaVisaoGeralBlock mapa={period.mapaVisaoGeral} />
            )}

            <p className="mb-5 text-xs text-[#24211D]/65">
              Pontos de interesse propostos para o período
            </p>
            {period.pois.some((p) => p.grupo) ? (
              Array.from(new Set(period.pois.map((p) => p.grupo ?? "Outros"))).map(
                (grupo, gIndex) => {
                  const itens = period.pois.filter(
                    (p) => (p.grupo ?? "Outros") === grupo
                  );
                  return (
                    <div key={grupo} className={gIndex > 0 ? "mt-6" : ""}>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/45">
                        {grupo}
                      </p>
                      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                        {itens.map((poi, index) => (
                          <PoiCard key={poi.title + index} index={index} poi={poi} />
                        ))}
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                {period.pois.map((poi, index) => (
                  <PoiCard key={poi.title + index} index={index} poi={poi} />
                ))}
              </div>
            )}
          </>
        </NumberedStep>
      )}

      {period.gastronomia && (
        <NumberedStep number={passoRefeicao!} label="Refeição">
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

      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
          <img
            src={zoom.src}
            alt={zoom.alt}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function GradeHorariosBlock({ grade }: { grade: GradeHorarios }) {
  return (
    <div className="mb-6 rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:p-7">
      <div className="flex items-center gap-2.5">
        <IconClock className="h-3.5 w-3.5 text-[#24211D]/50" />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/55">
          {grade.titulo ?? "Grade de Horários"}
        </p>
      </div>
      <div className="mt-4">
        {grade.itens.map((item, i) => (
          <div
            key={item.evento}
            className={`flex items-baseline gap-5 py-3 ${
              i !== grade.itens.length - 1 ? "border-b border-[#DDD8CF]/55" : ""
            } ${item.recomendado ? "border-l border-[#B96432] pl-4" : ""}`}
          >
            <span
              className={`w-12 shrink-0 text-sm font-semibold tabular-nums tracking-tight ${
                item.recomendado ? "text-[#B96432]" : "text-[#24211D]/80"
              }`}
            >
              {item.horario}
            </span>
            <span
              className={`min-w-0 flex-1 text-sm leading-6 ${
                item.destaque ? "font-semibold" : "font-normal"
              } ${item.recomendado ? "text-[#B96432]" : "text-[#24211D]/75"}`}
            >
              {item.evento}
              {item.tag && (
                <span className="ml-2.5 inline-block align-middle text-[9px] font-semibold uppercase tracking-[0.2em] text-[#24211D]/40">
                  {item.tag}
                </span>
              )}
            </span>
            {item.permanencia && (
              <span className="shrink-0 text-right text-xs font-medium tabular-nums text-[#24211D]/45">
                {item.permanencia}
              </span>
            )}
          </div>
        ))}
      </div>
      {grade.nota && (
        <p className="mt-5 border-t border-[#DDD8CF] pt-4 text-xs leading-5 text-[#24211D]/55">
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

      {subAtracao.visaoAnotada ? (
        <>
          <h3
            className={`${displayClassName} mb-5 text-center text-2xl font-medium text-[#000000] md:text-3xl`}
          >
            {subAtracao.titulo}
          </h3>
          {subAtracao.descricao && (
            <p className="mb-6 text-sm leading-6 text-[#24211D]/78">
              {subAtracao.descricao}
            </p>
          )}
          <VisaoAnotadaBlock
            visaoAnotada={subAtracao.visaoAnotada}
            displayClassName={displayClassName}
          />
        </>
      ) : subAtracao.compacta ? (
        <div className="mx-auto flex max-w-lg items-center gap-4 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-3">
          <div
            className={`relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-40 ${
              subAtracao.imagem ? "" : "border border-[#2C6CA6]"
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
              subAtracao.imagem ? "" : "border border-[#2C6CA6]"
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
                  className={`${displayClassName} text-2xl font-medium text-[#000000] md:text-3xl`}
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
          <p className="mb-5 text-xs text-[#24211D]/65">
            {subAtracao.poisLabel ?? "Restaurantes sugeridos"}
          </p>
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
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
    <img
      src="/images/icone-aeroporto.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
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
    <img
      src="/images/icone-trem.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconBus({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-onibus.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconCar({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-taxi.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconWalk({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-andando-a-pe.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconCheckSmall({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 12.5l4 4 10-10" />
    </svg>
  );
}

function IconShinkansen({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-trem-bala-shinkansen.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconExchange({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-cambio-dinheiro.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconCustoms({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-costumes.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconWords({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-frases-palavras-comuns.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
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
    <img
      src="/images/icone-compras.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
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

function IconMap({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" />
      <line x1="8" y1="3" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="21" />
    </svg>
  );
}

function IconToilet({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-banheiro.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconTicket({ className }: { className?: string }) {
  return (
    <img
      src="/images/icone-ingressos.png"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
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
  // Imagem de fundo do cabeçalho "Informações do hotel" — só definida quando
  // existe uma imagem real (mural, ilustração ou foto) pra usar; sem isso o
  // cabeçalho não aparece e o nome do hotel vai direto no card de identificação.
  fotoHero?: string;
  estrutura: HotelAmenity[];
  essenciais: HotelNearby[];
  // Aviso de transporte — só preenchido quando o hotel tem mais de uma
  // estação próxima em linhas diferentes, onde a escolha errada de linha
  // muda bastante o tempo de deslocamento. Mostra o sinalizador oficial
  // (código + nome) de cada estação relevante.
  transporte?: {
    nota: string;
    estacoes: { nome: string; imagem: string; imagemAlt: string }[];
  };
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
    fotoHero: "/images/lyf-mural-fachada.png",
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
    transporte: {
      nota:
        "As duas estações mais próximas do lyf Ginza Tokyo são Kyobashi (Tokyo Metro Ginza Line) e Takaracho (Toei Asakusa Line) — cada uma faz parte de uma linha diferente. Dependendo do dia, o roteiro indica uma ou outra: preste atenção às instruções de cada deslocamento, porque usar a linha errada pode aumentar bastante o tempo de trajeto.",
      estacoes: [
        {
          nome: "Estação Kyobashi",
          imagem: "/images/kyobashi-station-logo.png",
          imagemAlt: "Sinalização da Estação Kyobashi — G10, Tokyo Metro Ginza Line",
        },
        {
          nome: "Estação Takaracho",
          imagem: "/images/takaracho-station-logo.png",
          imagemAlt: "Sinalização da Estação Takaracho — A12, Toei Asakusa Line",
        },
      ],
    },
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
          label: "Estação Takaracho",
          imagem: "/images/lyf-rota-takaracho.png",
          imagemAlt: "Rota a pé da Estação Takaracho até o lyf Ginza Tokyo",
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
    endereco: "707-2 Higashishiokojicho, Karasuma-dori, Shimogyo-ku, Kyoto 600-8216",
    enderecoJapones: "〒600-8216 京都府京都市下京区東塩小路町707-2",
    telefone: "+81 75-344-3055",
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
    informacoesUteis: [
      {
        label: "Bagagem",
        texto:
          "Guarda-volumes disponível na recepção. Consulte diretamente o hotel sobre armazenamento antes do check-in ou após o check-out.",
      },
      {
        label: "Atendimento",
        texto: "Recepção 24h.",
      },
      {
        label: "Em caso de emergência",
        texto:
          "Número de emergência no Japão: 119 (ambulância/incêndio) ou 110 (polícia). Hospital de referência: Koseikai Takeda Hospital, pronto-socorro 24h a ~5 min a pé do hotel.",
      },
    ],
    mapa: {
      imagem: "/images/daiwa-roynet-fachada-real.png",
      imagemAlt: "Fachada do Daiwa Roynet Hotel Kyoto-Ekimae PREMIER",
      pontos: [],
    },
  },
  {
    cidade: "Tokyo 2",
    nome: "remm Tokyo Kyobashi",
    bairro: "Kyobashi, Chuo-ku",
    endereco: "2-6-21 Kyobashi, Chuo-ku, Tokyo 104-0031",
    enderecoJapones: "〒104-0031 東京都中央区京橋2-6-21",
    telefone: "+81 3-6843-0606",
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
    informacoesUteis: [
      {
        label: "Bagagem",
        texto:
          "Guarda-volumes disponível na recepção. Consulte diretamente o hotel sobre armazenamento antes do check-in ou após o check-out.",
      },
      {
        label: "Atendimento",
        texto: "Recepção 24h.",
      },
      {
        label: "Em caso de emergência",
        texto:
          "Número de emergência no Japão: 119 (ambulância/incêndio) ou 110 (polícia). Hospital de referência: St. Luke's International Hospital.",
      },
    ],
    mapa: {
      imagem: "/images/remm-fachada-real.png",
      imagemAlt: "Fachada do remm Tokyo Kyobashi",
      pontos: [],
    },
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
      {/* 1. Informações do hotel — fundo com o mural/foto + etiqueta com o nome */}
      {hotel.fotoHero && (
        <div className="relative flex min-h-[150px] items-end overflow-hidden border-b border-[#DDD8CF] p-5 sm:min-h-[190px] sm:p-8">
          <Image
            src={hotel.fotoHero}
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
        {!hotel.fotoHero && (
          <p className="text-base font-semibold text-[#24211D] sm:text-lg">
            {hotel.nome}
          </p>
        )}
        <p className={`text-sm text-[#24211D]/80 sm:text-base ${!hotel.fotoHero ? "mt-1" : ""}`}>
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
              className="font-semibold uppercase tracking-[0.1em] text-[#000000] hover:underline"
            >
              Site oficial
            </a>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <span className="rounded-full border border-[#000000]/25 bg-[#000000]/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]">
            Check-in · {hotel.checkin}
          </span>
          <span className="rounded-full border border-[#000000]/25 bg-[#000000]/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]">
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#000000]/[0.08] text-[#000000]">
                <item.Icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-sm leading-5 text-[#24211D]/92">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transporte — sinalização oficial das estações próximas, só quando
          existe mais de uma opção de linha e vale destacar a diferença. */}
      {hotel.transporte && (
        <div className="border-t border-[#DDD8CF] bg-[#FDFCF9] p-5 sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/68">
            Transporte
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {hotel.transporte.estacoes.map((estacao) => (
              <div
                key={estacao.nome}
                className="overflow-hidden rounded-2xl border border-[#DDD8CF] bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={estacao.imagem}
                    alt={estacao.imagemAlt}
                    fill
                    sizes="(max-width: 640px) 50vw, 380px"
                    className="object-contain p-4"
                  />
                </div>
                <p className="border-t border-[#DDD8CF] px-3 py-2.5 text-center text-xs font-semibold text-[#24211D]/85">
                  {estacao.nome}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#24211D]/80">
            {hotel.transporte.nota}
          </p>
        </div>
      )}

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
                  <span className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full bg-[#000000]/[0.06] text-[#000000] transition group-hover:bg-[#000000]/[0.12]">
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
                          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
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
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
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
  "Estação": ["Estação Kyobashi", "Saída 6 (Estação Kyobashi)", "Estação Takaracho"],
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
                        ? "shadow-[0_0_0_2px_#000000]"
                        : "hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(23,59,69,0.55)]"
                  }`}
                  style={
                    d.badge
                      ? {
                          background: "#0A0A0A",
                          boxShadow:
                            "inset 0 0 8px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.15)",
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
                    {DIA_SEMANA[d.date] && (
                      <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#24211D]/45">
                        {DIA_SEMANA[d.date]}
                      </span>
                    )}
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
                      ? "border-[#000000] bg-[#FDFCF9] text-[#24211D] hover:border-transparent hover:bg-[#000000] hover:text-white"
                      : "border-[#DDD8CF] bg-[#FDFCF9] text-[#24211D]/72 hover:border-transparent hover:bg-[#000000] hover:text-white"
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
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-[#DDD8CF] px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {INFO_CARDS.map(({ label, Icon, view }) => {
            const cardClassName =
              "group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#DDD8CF] bg-[#FAF9F6] px-3 py-4 text-center text-xs leading-5 text-[#24211D]/75 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#000000]/30 hover:bg-[#F8FAF9] hover:text-[#000000] hover:shadow-[0_10px_30px_-15px_rgba(23,59,69,0.35)]";
            const content = (
              <>
                <Icon
                  className={
                    label === "Trem Bala (Shinkansen)" ? "h-20 w-20" : "h-14 w-14"
                  }
                />
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
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
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
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
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
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Dia {current.day}
              </p>
              {current.contexto && (
                <ContextoBlock contexto={current.contexto} />
              )}
              {current.resumoDia && (
                <ResumoDiaBlock resumo={current.resumoDia} />
              )}
              {current.gradeHorarios &&
                !current.manha?.percursoEssencial &&
                !current.tarde?.percursoEssencial && (
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
                className="mt-8 flex w-full flex-col items-center gap-2 rounded-2xl border border-[#000000]/20 bg-[#F8FAF9] py-6 text-center transition hover:bg-[#EAF1EF]"
              >
                <span className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#000000] text-white">
                  <IconArrowUp className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]">
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
