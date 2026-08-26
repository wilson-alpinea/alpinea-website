"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type WheelEvent as ReactWheelEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ContentCard, IconStar as IconStarKit } from "../components/AirportGuideKit";
import { NaritaGuideContent } from "../components/NaritaGuideContent";
import { HanedaGuideContent } from "../components/HanedaGuideContent";
import { TremGuideContent } from "../components/TremGuideContent";
import { CostumesGuideContent } from "../components/CostumesGuideContent";
import { PalavrasGuideContent } from "../components/PalavrasGuideContent";
import { ShinkansenGuideContent } from "../components/ShinkansenGuideContent";
import { DXBGuideContent } from "../components/DXBGuideContent";
import { OnibusGuideContent } from "../components/OnibusGuideContent";
import { CambioGuideContent } from "../components/CambioGuideContent";

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
  // object-position CSS para corrigir enquadramento de fotos com o
  // assunto principal fora do centro (ex.: "50% 20%"). Sem isso, usa o
  // padrão "center".
  imagemPosicao?: string;
  // Galeria com mais de uma foto real — quando presente, tem prioridade
  // sobre imagem/imagemAlt e abre com navegação (‹ ›) no zoom.
  imagens?: { src: string; alt: string }[];
  // Horário de funcionamento — só preenchido quando verificado (ex.: site
  // oficial da loja). Sem isso, não aparece nada no card.
  horario?: string;
  // Aviso pontual em destaque no card (ex.: documento obrigatório na
  // entrada) — mesmo padrão do `alerta` de RestauranteCurado.
  alerta?: string;
};

// Restaurante pesquisado e curado segundo o "PROMPT MESTRE — PESQUISA DE
// RESTAURANTES E COMIDA LOCAL" — usado nas 3 opções finais de cada refeição
// (a partir do Dia 3). Todo campo vem de pesquisa real (Tabelog-first) —
// nunca inventado; quando um dado não é verificável, o texto explicita
// "Não confirmado" em vez de omitir silenciosamente.
type RestauranteCurado = {
  nome: string;
  // Papel dentro do trio de opções, ex.: "Melhor custo-benefício",
  // "Mais local/autêntico", "Mais prático/rota".
  papel: string;
  categoria: string;
  // 1–2 frases: o que pedir / por que essa opção específica — nunca genérico.
  descricao: string;
  foto?: string;
  // Nota do Tabelog (ex.: "3.54"). Ausente = não encontrado/não aplicável.
  notaTabelog?: string;
  numAvaliacoes?: string;
  faixaPreco: string;
  distancia: string;
  foreignFriendly: string;
  horario: string;
  nivelFila?: string;
  reserva?: string;
  pagamento?: string;
  linkTabelog?: string;
  // Aviso pontual — só quando genuinamente relevante (ex.: só dinheiro).
  alerta?: string;
  // Marca a opção como econômica/budget-friendly — troca a cor do badge
  // para verde claro, destacando-a das demais no trio.
  economico?: boolean;
};

type Gastronomia = {
  // Sobrescreve o título padrão "Gastronomia" do card (ex.: "Snacks de Rua").
  titulo?: string;
  subtitulo?: string;
  // Parágrafo curto de contexto (ex.: "está integrada ao shopping X, que
  // reúne diversas opções de restaurantes...") — mostrado acima da lista.
  intro?: string;
  // Rótulo acima da lista de snacks/itens simples (ex.: "Snacks de rua").
  itensLabel?: string;
  itens?: { nome: string; descricao?: string; localizacao?: string; preco?: string; foto?: string }[];
  // Aviso curto de fila/lotação — mostrado em destaque (ex.: horário de
  // pico com fila grande, recomendação de chegar cedo etc.).
  alerta?: string;
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
  // Rótulo acima do grid de opções curadas (ex.: "Opções selecionadas — Almoço").
  curadoriaLabel?: string;
  // As 3 opções finais de uma refeição, pesquisadas e formatadas segundo o
  // PROMPT MESTRE — PESQUISA DE RESTAURANTES E COMIDA LOCAL. Quando presente,
  // aparece em vez do grid simples de `restaurantes`.
  curadoria?: RestauranteCurado[];
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
  // Card de deslocamento (estação/linha/opções) — usado quando a
  // sub-atração exige sair do período principal (ex.: ir de Akihabara até
  // o izakaya em Kanda). Mesmo componente/dado usado em Period.
  deslocamento?: Deslocamento;
  // Diagrama tipo "Raio-X Alpinea" (mapa de andares, infográfico) — quando
  // presente, substitui o headliner de foto padrão, em tamanho natural e
  // sem recorte.
  visaoAnotada?: Period["visaoAnotada"];
  // Rótulo acima da grade de `pois` — sem isso, cai no padrão "Restaurantes
  // sugeridos" (histórico). Usado p/ contextos não-gastronômicos (ex.: lojas).
  poisLabel?: string;
  pois?: Poi[];
  gastronomia?: Gastronomia;
  // Mapa aberto (print real) com a visão geral do trajeto a pé dentro da
  // sub-atração — mesmo padrão do `mapaVisaoGeral` de Period, mostrado
  // logo antes da grade de POIs.
  mapaVisaoGeral?: { imagem: string; imagemAlt: string; nota?: string };
  banheirosProximos?: Period["banheirosProximos"];
  // Card de aviso em destaque (vermelho) — ex.: documento obrigatório na
  // entrada de uma balada. Mesmo componente usado no aviso de dia inteiro.
  alerta?: AlertaSugerido;
  // Tabela comparativa (ex.: duas opções de balada lado a lado) — linhas
  // agrupadas em seções, cada uma em texto simples, estrelas (1–5) ou
  // pontos (escala contínua, ex.: energia da noite).
  comparacao?: ComparacaoTabela;
  opcional?: boolean;
  compacta?: boolean;
};

type ComparacaoTabela = {
  titulo?: string;
  colunas: [string, string];
  // Selo curto no topo de cada coluna (ex.: "Melhor para uma noite
  // sofisticada") — resume o veredito antes mesmo da tabela.
  badges?: [string, string];
  // Frase de conclusão por coluna — a resposta direta a "qual escolher",
  // exibida logo abaixo dos selos, antes do grid de critérios.
  conclusao?: [string, string];
  grupos: {
    titulo: string;
    linhas: {
      label: string;
      valores?: [string, string];
      estrelas?: [number, number];
      // Escala em pontos preenchidos (1–5) — só para métricas com escala
      // contínua natural (ex.: energia da noite). Substitui a antiga
      // "intensidade" (bolinha + rótulo textual).
      pontos?: [number, number];
    }[];
  }[];
  // Bloco final — o que muda em relação à vida noturna ocidental (documento
  // na entrada, horário de pico, idioma, comportamento esperado etc.).
  rodape?: { titulo: string; itens: string[] };
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
  // Mapa/planta oficial da estação — mostrado como miniatura com zoom,
  // abaixo da distância a pé.
  mapa?: string;
  mapaAlt?: string;
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
  // Marca que a opção recomendada exige baldeação (troca de linha no meio
  // do trajeto) — troca o rótulo "sem baldeação" do cabeçalho do card por
  // "com baldeação". Sem isso, o card assume "sem baldeação" (trajeto numa
  // linha só) — só marque true quando houver baldeação confirmada.
  baldeacao?: boolean;
  opcoes: OpcaoDeslocamento[];
  recomendacao?: string;
  // Mapa grande (print real) do trajeto a pé da saída da estação até a
  // atração — separado das fotos de estação, que ficam só no guia do hotel.
  mapaChegada?: { imagem: string; imagemAlt: string; nota?: string };
  // Mapas oficiais dos andares da estação de chegada (ex.: 1F/2F/3F) — o
  // primeiro da lista aparece grande; os demais viram cards horizontais
  // abaixo que trocam a imagem principal ao clicar. Clicável para zoom.
  mapaAndares?: {
    titulo?: string;
    mapas: { andar: string; imagem: string; imagemAlt: string }[];
  };
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
      // CSS object-position custom (ex.: "center 20%") pra evitar cortar a
      // fachada/placa da loja no crop 4:3 — sem isso, usa o centro padrão.
      fotoPosicao?: string;
      // Posição na sequência de visita recomendada (percursoEssencial) —
      // é o número mostrado no card (numeração única, igual à do Percurso
      // Essencial e dos cards de Pontos de Interesse). Sem isso, o card
      // recebe o rótulo "Opcional" em vez de número — não faz parte do
      // percurso essencial.
      ordem?: number;
    }[];
  };
  // Segundo Raio-X Alpinea do período — mostrado logo abaixo do primeiro
  // (visaoAnotada), antes de Pontos de Interesse. Usado quando o período
  // cobre duas áreas bem distintas que merecem cada uma seu próprio mapa
  // anotado (ex.: Shinjuku à noite + Shinjuku Gyoen à tarde).
  visaoAnotadaSecundaria?: Period["visaoAnotada"];
  // Quando true, mostra o Raio-X Alpinea (visaoAnotada) logo no início do
  // período — imediatamente abaixo da foto de capa (atracaoPrincipalImagem),
  // antes até do percurso essencial — em vez da posição padrão, ao final
  // da seção Atração. Usado quando o Raio-X funciona como uma introdução
  // geral do dia/período, não como um mapa de apoio aos detalhes.
  visaoAnotadaNoTopo?: boolean;
  // Resposta rápida a "o que eu faço agora?" — resumo do percurso a pé
  // recomendado dentro da atração, antes de qualquer detalhe. Mostrado
  // logo após o hero, antes do diagrama anotado.
  percursoEssencial?: {
    duracao: string;
    passos: {
      titulo: string;
      foto?: string;
      // CSS object-position custom para centralizar a miniatura em um
      // ponto específico da foto (ex.: "50% 20%" para focar no topo).
      fotoPosicao?: string;
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
    // Mapas/plantas — mostrados como botão discreto com ícone de mapa em
    // vez de foto grande na grade, já que o cliente só consulta se quiser.
    mapas?: { titulo: string; imagem: string; imagemAlt: string }[];
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
  // Card 3 genérico de apoio operacional — usado no lugar de
  // `banheirosProximos` quando o tema mais útil para a atração não for
  // banheiro (acessibilidade, bagagem, ponto de encontro, reserva/ingresso,
  // regras, plano de chuva, onde descansar). Mesmo layout/comportamento
  // (accordion), com título e ícone configuráveis. Usar OU
  // `banheirosProximos` OU `infoOperacional` — não os dois.
  infoOperacional?: {
    titulo: string;
    icone:
      | "acessibilidade"
      | "bagagem"
      | "encontro"
      | "entrada"
      | "reserva"
      | "regras"
      | "chuva"
      | "descanso";
    itens: { local: string; endereco?: string; nota?: string }[];
    // Quando true, o card já abre com o conteúdo visível e sem a seta de
    // accordion — usado quando a mensagem é curta o bastante pra sempre
    // valer a pena mostrar de cara.
    semExpandir?: boolean;
  };
  // Horário de funcionamento loja a loja — usado sempre que o período cita
  // lojas específicas por nome no roteiro (ex.: Akihabara). Cada loja citada
  // tem seu próprio horário de abertura/fechamento — nunca uma faixa
  // agregada tipo "~10h–20h (maioria)". Card sempre aberto, sem accordion.
  horarioLojas?: {
    nome: string;
    // ex.: "Abertura 10h · Fechamento 20h" ou "10h–22h (10h aos fins de semana)"
    horario: string;
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
      { titulo: "Café da Manhã", horario: "08:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "08:45", foto: "/images/icone-hotel2.webp" },
      { titulo: "Templo Sensoji", horario: "09:45", foto: "/images/sensoji-kaminarimon.webp" },
      { titulo: "Almoço", horario: "12:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Tokyo Sky Tree", horario: "14:35", foto: "/images/dia1-skytree-miniatura.webp" },
      { titulo: "Jantar", horario: "16:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Retorno ao Hotel", horario: "19:00", foto: "/images/icone-hotel2.webp" },
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
      duracao: "De 1h30 a 2h",
      passos: [
        {
          titulo: "Kaminarimon",
          foto: "/images/sensoji-kaminarimon.webp",
          horario: "09:20",
          descricao: "O icônico portão de entrada do Templo Senso-ji. Comece sua experiência em Asakusa.",
          destaque: "O enorme lanternão vermelho de 700 kg.",
        },
        {
          titulo: "Dragão sob a lanterna",
          foto: "/images/kaminarimon-dragon.webp",
          horario: "~09:25",
          descricao: "Observe o dragão esculpido na base da lanterna — símbolo de proteção e sabedoria.",
          destaque: "Detalhe pouco visto por quem passa rápido.",
        },
        {
          titulo: "Nakamise Street",
          foto: "/images/sensoji-nakamise.webp",
          horario: "~09:30",
          descricao: "A tradicional rua de compras com mais de 90 lojas de souvenirs e guloseimas típicas.",
          destaque: "Experimente um ningyoyaki acabado de fazer.",
        },
        {
          titulo: "Hōzōmon",
          foto: "/images/sensoji-hozomon.webp",
          horario: "~09:45",
          descricao: "O belíssimo portão interno com guardiões imponentes protegendo o templo.",
          destaque: "Um dos portões mais bonitos do Japão.",
        },
        {
          titulo: "Jōkoro",
          foto: "/images/Jokoro.webp",
          horario: "~09:50",
          descricao: "Incensário de bronze onde os visitantes purificam corpo e mente com a fumaça sagrada.",
          destaque: "Passe a fumaça sobre você para boa sorte.",
        },
        {
          titulo: "Salão Principal",
          foto: "/images/sensoji-kannondo.webp",
          horario: "~10:00",
          descricao: "O coração do Templo Senso-ji. Faça uma oração e aprecie a arquitetura centenária.",
          destaque: "A imagem de Kannon, deusa da compaixão, no altar principal.",
        },
        {
          titulo: "Omikuji",
          foto: "/images/mikuji.webp",
          horario: "~10:15",
          descricao: "Tire sua sorte! Os papeizinhos da fortuna podem trazer conselhos e boas energias.",
          destaque: "Se tirar má sorte, amarre o papel e deixe o azar para trás.",
        },
        {
          titulo: "Pagode de Cinco Andares",
          foto: "/images/sensoji-pagode.webp",
          horario: "~10:25",
          descricao: "A estrutura mais alta do complexo, símbolo de paz e harmonia.",
          destaque: "Ótimo ponto para fotos clássicas de Asakusa.",
        },
        {
          titulo: "Saída pelo lado oeste",
          horario: "~10:35",
          descricao: "Desvio opcional até Kappabashi, a oeste do templo — quem pular vai direto para o Rio Sumida, do lado leste.",
          destaque: "≈10 min a pé — percurso agradável e sinalizado.",
        },
        {
          titulo: "Kappabashi (desvio opcional)",
          foto: "/images/kappabashi.webp",
          horario: "~11:00",
          descricao: "A famosa \"Kitchen Town\", o paraíso dos utensílios de cozinha e artigos profissionais.",
          destaque: "Mais de 160 lojas — depois é preciso voltar em direção ao templo para seguir ao Rio Sumida, do lado oposto.",
        },
        {
          titulo: "Sumida Park",
          foto: "/images/sumida-park.webp",
          horario: "~11:30",
          descricao: "≈15 min a pé partindo do templo, do lado leste — encerramento perfeito com vista para a Tokyo Skytree e o Rio Sumida.",
          destaque: "Ideal para um momento de descanso e fotos memoráveis.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Templo Sensoji",
      imagem: "/images/dia1-sensoji-visao-anotada-v2.webp",
      imagemAlt: "Vista aérea do complexo do Templo Sensoji com as partes principais destacadas",
      comentarios: [
        "A prioridade aqui é evitar o início das aglomerações no complexo — por ser um dos pontos turísticos mais visitados do Japão, próximo do horário do almoço começa a ficar muito cheio. Nossa recomendação é chegar antes da abertura das lojas da Nakamise e aproveitar com calma todos os pontos destacados abaixo. A partir das 09:00 (abertura das lojas) você começa a explorar as lojinhas, tanto de snacks quanto de souvenir. Após finalizar essa visita, você tem algumas opções.",
        "Existem 3 pontos de interesse destacados abaixo — nossa recomendação seria visitar os 3, porém o tempo que vai passar em cada um depende de você. Kappabashi fica a oeste do templo (sentido oposto ao Rio Sumida) e é enorme — trate como um desvio opcional, não recomendo visitar todas as lojas, e lembre que depois é preciso voltar em direção ao templo para seguir ao rio.",
        "Para ir à Tokyo Sky Tree você pode ir andando pelo Sumida Park (~15 min), pegar a Tobu Skytree Line direto até a Estação Tokyo Skytree (sem baldeação, ~3 min), ou a Toei Asakusa Line até Oshiage (2 paradas — é a opção detalhada no deslocamento logo abaixo).",
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
          foto: "/images/sensoji-kaminarimon.webp",
          ordem: 1,
        },
        {
          titulo: "Escultura do Dragão",
          nomeJapones: "雷門提灯の龍彫刻",
          descricao:
            "A maioria passa direto sem notar: embaixo da lanterna gigante do Kaminarimon há um dragão entalhado em madeira, considerado protetor do templo na tradição budista. A lanterna atual (3,9 m de altura, ~700 kg) foi doada em 1960 por Konosuke Matsushita, fundador da Panasonic, em agradecimento por ter se curado de uma doença após rezar no Sensoji — o nome \"Matsushita Electric\" ainda aparece gravado na base.",
          foto: "/images/kaminarimon-dragon.webp",
          fotoExtra: {
            src: "/images/kaminari-dragon-lantern.webp",
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
          foto: "/images/sensoji-nakamise.webp",
          ordem: 3,
        },
        {
          cor: "#1E6FB8",
          titulo: "Hōzōmon",
          nomeJapones: "宝蔵門",
          descricao:
            "\"Portão do Tesouro\" — segundo portão do complexo, guarda relíquias do templo no piso superior e é flanqueado por duas estátuas guardiãs (Niō).",
          foto: "/images/sensoji-hozomon.webp",
          ordem: 4,
        },
        {
          titulo: "Jokoro",
          nomeJapones: "常香炉",
          descricao:
            "Grande incensário de bronze em frente ao Salão Principal — acenda um incenso, deposite no jokoro e leve a fumaça sobre o corpo, tradicionalmente pra atrair saúde e sabedoria (muita gente direciona pra cabeça).",
          foto: "/images/Jokoro.webp",
          ordem: 5,
        },
        {
          cor: "#3F8F3F",
          titulo: "Salão Principal",
          nomeJapones: "本堂 / Kannondō",
          descricao:
            "Santuário principal do templo, onde fica a estátua de Kannon (Deusa da Misericórdia) que deu origem ao Sensoji — fundado em 628, o templo mais antigo de Tóquio.",
          foto: "/images/sensoji-kannondo.webp",
          ordem: 6,
        },
        {
          titulo: "Omikuji",
          nomeJapones: "おみくじ",
          descricao:
            "Papelzinho de sorte por ¥100: deposite a moeda, chacoalhe a caixa até sair um bastão numerado e pegue a gaveta correspondente. O Sensoji é famoso por sortear azar (kyō) com mais frequência que outros templos — se calhar de tirar, é tradição amarrar o papel num varal ali perto pra deixar a má sorte no templo.",
          foto: "/images/mikuji.webp",
          ordem: 7,
        },
        {
          cor: "#6B3FA0",
          titulo: "Pagode de Cinco Andares",
          nomeJapones: "五重塔",
          descricao:
            "Reconstrução do pagode original de 942 — cada um dos cinco andares representa um elemento budista (terra, água, fogo, vento, vazio). Guarda relíquias de Buda. Fica a caminho da saída oeste, logo depois do Omikuji — vale parar pra ver de perto.",
          foto: "/images/sensoji-pagode.webp",
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
        foto: "/images/Kyobashi_Station_entrance_7_20170813.webp",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.webp" },
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
        mapa: "/images/mapa-asakusa-station.webp",
        mapaAlt: "Mapa da Estação Asakusa",
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
        imagem: "/images/rota-asakusa-sensoji.webp",
        imagemAlt: "Rota a pé da Saída 1 da Estação Asakusa até o Kaminarimon (Templo Sensoji)",
        nota: "Saída 1 da Estação Asakusa até o Kaminarimon — ≈4 min a pé (300 m).",
      },
    },
    atracaoPrincipal: "Templo Sensoji Asakusa",
    atracaoPrincipalImagem: "/images/dia1-sensoji.webp",
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
      imagem: "/images/dia1-manha-visao-geral-mapa.webp",
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
        ordem: 1,
        imagem: "/images/kappabashi.webp",
        imagemAlt: "Loja de utensílios de cozinha em Kappabashi Kitchen Town",
      },
      {
        title: "Sumida Park",
        description:
          "Parque as margens do Rio Sumida que corta a parte leste da cidade de Tokyo, vista para a Tokyo Sky Tree",
        grupo: "Se houver tempo · nos arredores",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/sumida-park.webp",
        imagemAlt: "Margem do Rio Sumida no Sumida Park, com cerejeiras floridas",
      },
      {
        category: "Compras",
        title: "Masamoto Sohonten",
        description:
          "Uma das Top5 melhores fabricantes de faca profissional do Japão, também tem equipe dedicada de afiador profissional para facas de alta complexidade — fica perto do Sumida Park, do lado do rio.",
        grupo: "Se houver tempo · nos arredores",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/masamoto-sohonten.webp",
        imagemAlt: "Vitrine de facas profissionais na Masamoto Sohonten",
      },
    ],
    gastronomia: {
      titulo: "Snacks de Rua",
      subtitulo: "Grande quantidade de lojas que vendem snacks de rua",
      alerta:
        "Restaurantes de mesa perto do Sensoji enfrentam filas grandes no horário de almoço (12h–14h) — vale se afastar um pouco do complexo antes de parar para comer.",
      itens: [
        {
          nome: "Melon Pan (Kagetsudo)",
          descricao:
            "Pão doce crocante por fora, macio por dentro — uma das barracas mais tradicionais da Nakamise.",
          localizacao: "Kagetsudo — Nakamise-dori, perto do Kaminarimon",
          preco: "200",
          foto: "/images/nakamise-melon-pan-kagetsudo-2.webp",
        },
        {
          nome: "Ningyo-yaki morno (Kimuraya Honten)",
          descricao:
            "Bolinho recheado de doce de feijão vermelho, moldado em formatos icônicos e vendido morno, recém-feito — para comer na hora.",
          localizacao: "Kimuraya Honten — Nakamise-dori",
          preco: "~500 (pacote pequeno)",
          foto: "/images/nakamise-ningyo-yaki-1.webp",
        },
        {
          nome: "Ningyo-yaki para presente (Kimuraya Honten)",
          descricao: "Pacote de 10 unidades embalado — ótimo para levar de lembrança.",
          localizacao: "Kimuraya Honten — Nakamise-dori",
          preco: "~600 (pacote de 10)",
          foto: "/images/nakamise-ningyo-yaki-2b.webp",
        },
        {
          nome: "Kibi Dango (Asakusa Kibi Dango Azuma)",
          descricao:
            "Mochi macio, tradição de Asakusa desde o período Edo.",
          localizacao: "Asakusa Kibi Dango Azuma — Nakamise-dori",
          preco: "~350 (5 espetos)",
          foto: "/images/nakamise-kibi-dango.webp",
        },
        {
          nome: "Senbei (Iriyama Senbei Seizojo)",
          descricao:
            "Cracker de arroz grelhado e temperado na hora, tradição centenária de Asakusa — dá pra ver o processo sendo feito na loja.",
          localizacao: "Iriyama Senbei Seizojo — Nakamise-dori",
          preco: "~150–300 (unidade)",
          foto: "/images/nakamise-senbei-iriyama.webp",
        },
        {
          nome: "Senbei Gigante (Tako no Nakigoe)",
          descricao:
            "Cracker de arroz grelhado na hora com polvo inteiro prensado — do tamanho do rosto, vira atração à parte.",
          localizacao: "Tako no Nakigoe Asakusa — Nakamise-dori",
          preco: "~500–700",
          foto: "/images/nakamise-senbei-gigante.webp",
        },
        {
          nome: "Asakusa Menchi",
          descricao:
            "Croquete de carne empanado, crocante por fora e suculento por dentro — uma das filas mais disputadas da rua.",
          localizacao: "Asakusa Menchi — Nakamise-dori",
          preco: "~400",
          foto: "/images/nakamise-asakusa-menchi.webp",
        },
      ],
      curadoriaLabel: "Opções selecionadas — Almoço (~12h30)",
      curadoria: [
        {
          nome: "Tanaka Soba Ten Asakusa ten",
          papel: "Mais prático (na rota)",
          categoria: "Chuka Soba (ramen chinês tradicional)",
          descricao:
            "Ramen chinês tradicional num balcão simples e rápido, a 2 min a pé da estação — clássico local, sem frescura, ideal pra comer rápido logo depois do Sensoji.",
          foto: "/images/nakamise-tanaka-soba.webp",
          notaTabelog: "3.51",
          numAvaliacoes: "439 avaliações",
          faixaPreco: "¥1.000–1.999 por pessoa",
          distancia: "~2 min a pé da Estação Asakusa (Tobu/Metro/Toei)",
          foreignFriendly: "Médio — sem cardápio em inglês confirmado, mas prato simples de pedir; bom para quem vai sozinho (só balcão).",
          horario: "seg–sex 11h–15h45 e 17h–21h · fins de semana e feriados 11h–21h",
          reserva: "Não aceita reservas — só balcão",
          pagamento: "Somente dinheiro e IC card — não aceita cartão de crédito nem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1311/A131102/13224895/",
          economico: true,
        },
        {
          nome: "Sushi Zanmai Asakusa Kaminari Mon ten",
          papel: "Melhor custo-benefício",
          categoria: "Sushi (rede nacional, do leilão recorde de atum)",
          descricao:
            "Rede famosa pelo lance recorde no leilão de ano-novo do mercado de peixes — sushi tradicional (balcão ou mesa, não é esteira), com preço de almoço surpreendentemente acessível.",
          foto: "/images/nakamise-sushi-zanmai.webp",
          notaTabelog: "3.08",
          numAvaliacoes: "179 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço (jantar sai mais caro — ¥3.000–3.999)",
          distancia: "~1 min a pé da Estação Asakusa (Tokyo Metro Ginza Line)",
          foreignFriendly: "Alto — reserva online, cardápio multilíngue (inglês, chinês, coreano), ampla gama de pagamentos.",
          horario: "seg–sex 11h–22h · fins de semana e feriados 10h–22h (último pedido 21h30)",
          reserva: "Recomendada — reserva online",
          pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1311/A131102/13130042/",
          economico: true,
        },
        {
          nome: "Asakusa Amai",
          papel: "Experiência mais especial",
          categoria: "Tempura",
          descricao:
            "Tempura à mesa num salão mais tranquilo, com cardápio multilíngue — opção de refeição mais completa e sentada entre as três, ideal pra quem prefere não comer no balcão.",
          foto: "/images/nakamise-asakusa-amai-tempura.webp",
          notaTabelog: "3.44",
          numAvaliacoes: "211 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço (jantar ¥4.000–4.999)",
          distancia: "~3 min a pé da Estação Asakusa (Tobu Isesaki Line)",
          foreignFriendly: "Alto — cardápio multilíngue (inglês) confirmado.",
          horario: "seg–sex 11h30–14h30 e 17h30–21h · fins de semana 11h30–15h e 17h30–21h",
          reserva: "Aceita reserva só para o jantar — almoço é só por ordem de chegada",
          pagamento: "Cartão (Visa, Master, JCB, Amex, Diners) e IC card aceitos — sem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1311/A131102/13245561/",
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
      duracao: "1h30 (Deck) · 2h (com Galleria)",
      passos: [
        { titulo: "Tembo Deck · 350 m", foto: "/images/skytree-tembo-deck-miniatura.webp" },
        { titulo: "Tembo Galleria · 450 m (opcional)", foto: "/images/skytree-tembo-deck-aerea.webp" },
        {
          titulo: "Tokyo Solamachi",
          foto: "/images/solamachi-pokemon-center.webp",
          fotoPosicao: "50% 15%",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Tokyo Sky Tree",
      imagem: "/images/raiox-skytree2.webp",
      imagemAlt: "Infográfico da Tokyo Sky Tree com altura e observatórios (Tembo Deck e Tembo Galleria)",
      nota: "634 m de altura total, concluída em 2012 — a torre de transmissão e observação mais alta do Japão.",
      fundo: "/images/raiox-skytree-bg.webp",
      comentarios: [
        "Considerando que você chegue num horário apropriado para subir antes do pôr do sol, a prioridade é se dirigir à bilheteria e comprar o ingresso. Existem 2 opções: uma que sobe até o observatório superior e outra até o observatório inferior — a diferença é mínima entre os dois. Uma diferença importante é que o espaço é muito mais reduzido no superior (recomendo evitar se for claustrofóbico). Alguns viajantes gostam de fazer uma refeição no Musashi ou comer algo no café e sentar para fazer esse lanche — fica a seu critério; em termos de qualidade de comida, na base da torre (Solamachi) a comida é melhor.",
        "O shopping Solamachi é enorme — deixei em destaque as lojas referentes a anime/mangá, mas tem dezenas de lojas de outros temas que podem ser interessantes de explorar.",
      ],
    },
    galeria: {
      titulo: "Skytree em Detalhes",
      imagens: [
        {
          src: "/images/skytree-tembo-deck-janela.webp",
          alt: "Vista da cidade através das janelas do Tembo Deck da Tokyo Sky Tree",
          legenda: "Vista do Tembo Deck",
        },
        {
          src: "/images/skytree-tembo-deck-aerea.webp",
          alt: "Vista aérea do Tembo Galleria da Tokyo Sky Tree, mostrando a estrutura do observatório superior",
          legenda: "Tembo Galleria, visto de fora",
        },
      ],
      mapas: [
        {
          titulo: "Mapa — Tembo Deck (pisos 340–350)",
          imagem: "/images/skytree-tembo-deck-mapa.webp",
          imagemAlt: "Mapa oficial do Tembo Deck (350 m) da Tokyo Sky Tree, pisos 340 a 350",
        },
        {
          titulo: "Mapa — Tembo Galleria (pisos 445–450)",
          imagem: "/images/skytree-tembo-galleria-mapa.webp",
          imagemAlt: "Mapa oficial do Tembo Galleria (450 m) da Tokyo Sky Tree, pisos 445 a 450",
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
      linha: { codigo: "A", nome: "Toei Asakusa Line", cor: "#D04E3C" },
      estacoesIntermediarias: [
        { nome: "Honjo-Azumabashi", nomeJapones: "本所吾妻橋", numero: "A19" },
      ],
      estacaoDestino: {
        nome: "Oshiage (Tokyo Skytree Station)",
        nomeJapones: "押上（スカイツリー前）駅",
        saida: "Saída B3, ligação direta e subterrânea com a Tokyo Solamachi",
        foto: "/images/oshiage-station-entrance.webp",
        mapa: "/images/mapa-oshiage-station.webp",
        mapaAlt: "Mapa da Estação Oshiage",
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
    atracaoPrincipalImagem: "/images/dia1-skytree.webp",
    detalhesPraticos: [
      {
        label: "Melhor horário",
        horarioDestaque: "16:30–18:30",
        valor:
          "Chegada ao complexo Tokyo Solamachi às 17:00, com subida à torre por volta das 18:15 — tempo certo para acompanhar o pôr do sol do topo.",
        imagem: "/images/skytree-por-do-sol-fuji.webp",
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
        ordem: 1,
        imagem: "/images/skytree-sky-restaurant-musashi.webp",
        imagemAlt: "Interior do Sky Restaurant 634 (Musashi), no piso 345 da Tokyo Sky Tree",
      },
      {
        category: "Gastronomia",
        title: "Skytree Cafe",
        description:
          "Cafeteria informal do Tembo Deck (piso 340, com mesas — a versão do piso 350 é só balcão) — bebidas autorais, lanches leves e sobremesas temáticas com vista para a cidade.",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/skytree-cafe.webp",
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
          imagem: "/images/solamachi-mapa-andares.webp",
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
            ordem: 1,
            imagem: "/images/solamachi-jump-shop.webp",
            imagemAlt: "Vitrine da Jump Shop no Tokyo Solamachi, 4º andar",
          },
          {
            category: "Loja",
            title: "Pokémon Center Skytree Town",
            description:
              "Uma das maiores Pokémon Centers do Japão — pelúcias, action figures e itens exclusivos da região, no East Yard.",
            prioridade: "opcional",
            ordem: 2,
            imagem: "/images/solamachi-pokemon-center.webp",
            imagemAlt: "Interior do Pokémon Center Skytree Town, 4º andar",
          },
          {
            category: "Loja",
            title: "Donguri Republic",
            description:
              "Loja oficial do Studio Ghibli — produtos de Totoro, A Viagem de Chihiro e outros clássicos do estúdio.",
            prioridade: "opcional",
            ordem: 3,
            imagem: "/images/solamachi-donguri-republic.webp",
            imagemAlt: "Vitrine da Donguri Republic (Studio Ghibli) no Tokyo Solamachi, 2º andar",
          },
          {
            category: "Loja",
            title: "STRICT-G",
            description:
              "Loja oficial da linha Gundam — roupas, acessórios e modelos (Gunpla) inspirados na franquia.",
            prioridade: "opcional",
            ordem: 4,
            imagem: "/images/solamachi-strict-g.webp",
            imagemAlt: "Vitrine da STRICT-G (Gundam) no Tokyo Solamachi, 4º andar",
          },
        ],
        gastronomia: {
          intro:
            "A Tokyo Sky Tree está integrada ao shopping Tokyo Solamachi, que reúne diversas opções de restaurantes, praça de alimentação e um mercado no subsolo com alternativas para takeout.",
          curadoriaLabel: "Opções selecionadas — Refeição",
          curadoria: [
            {
              nome: "Hitsumabushi Nagoya Bincho",
              papel: "Melhor custo-benefício",
              categoria: "Hitsumabushi (enguia grelhada sobre arroz, estilo Nagoya)",
              descricao:
                "Rede especializada em hitsumabushi ao estilo Nagoya — enguia grelhada servida sobre arroz, tradicionalmente comida em 3 etapas diferentes (pura, com temperos, e com chá/caldo). Direto no 6º andar do Solamachi.",
              foto: "/images/Hitsumabushi.webp",
              economico: true,
              notaTabelog: "3.47",
              numAvaliacoes: "407 avaliações",
              faixaPreco: "¥4.000–5.999 por pessoa",
              distancia: "6º andar do Tokyo Solamachi",
              foreignFriendly: "Alto — cardápio multilíngue (inglês, chinês simplificado, coreano) e equipe que atende em inglês/chinês.",
              horario: "11h–22h (último pedido 21h)",
              reserva: "Reservas limitadas — dias úteis 11h–20h (exceto 11h30), fins de semana/feriados só 15h–17h; sem reserva é por ordem de chegada.",
              pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
              linkTabelog: "https://tabelog.com/en/tokyo/A1312/A131203/13141252/",
            },
            {
              nome: "Kaiten Sushi Toriton",
              papel: "Mais prático",
              categoria: "Kaiten-zushi (sushi de esteira)",
              descricao:
                "Sushi de esteira rápido e informal, direto no 6º andar do Solamachi — boa opção para quem já andou o dia inteiro e quer algo prático sem sair do complexo.",
              foto: "/images/Toriton.webp",
              economico: true,
              notaTabelog: "3.50",
              numAvaliacoes: "1.154 avaliações",
              faixaPreco: "¥3.000–4.999 no almoço · ¥4.000–5.999 no jantar",
              distancia: "6º andar do Tokyo Solamachi",
              foreignFriendly: "Alto — cardápio multilíngue em inglês.",
              horario: "11h–22h (último pedido 21h30) — fechado 30/jun a 9/jul/2026 por obras",
              reserva: "Não aceita reservas — só por ordem de chegada",
              pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
              alerta:
                "Costuma ter fila no jantar (a partir de ~18h) — chegar um pouco mais cedo ajuda a evitar espera.",
              linkTabelog: "https://tabelog.com/en/tokyo/A1312/A131203/13141243/",
            },
          ],
          mapa: {
            titulo: "Mapa — Solamachi Dining",
            imagem: "/images/solamachi-dining-map.webp",
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
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "08:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "09:15", foto: "/images/icone-hotel2.webp" },
      { titulo: "Tokyo Character Street e Dragonball Store", horario: "09:30", foto: "/images/dia2-tokyostation.webp" },
      { titulo: "Almoço", horario: "12:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Imperial Palace East Gardens", horario: "13:15", foto: "/images/imperial-palace-east-gardens.webp" },
      { titulo: "Deslocamento ao Aeroporto", horario: "16:30", foto: "/images/placeholder-em-producao.webp" },
    ],
  },
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
      "O voo de volta decola às 00:05 (já dia 12) pelo Aeroporto de Haneda (HND) — voo EK313, terminal 3. Após os Jardins do Palácio Imperial, retorne ao hotel, busque a bagagem e siga com folga para o aeroporto, com tempo para o check-in internacional.",
  },
  diaEmNumeros: {
    atracoes: "2 atrações principais",
    caminhada: "A definir",
    transporte: "A pé (sem trem)",
    linhasMetro: "Nenhuma — trajetos a pé",
    ritmo: "Leve",
    saida: "09:15",
    retorno: "Segue direto para o aeroporto (16:30)",
  },
  manha: {
    percursoEssencial: {
      duracao: "~2h (Tokyo Character Street e Marunouchi)",
      passos: [
        {
          titulo: "Dragonball Store",
          foto: "/images/marunouchi-dragonball-store.webp",
          horario: "09:30",
          descricao: "Dentro do complexo da estação (Tokyo Station First Avenue), na Tokyo Character Street.",
        },
        {
          titulo: "Jump Shop",
          foto: "/images/marunouchi-jump-shop.webp",
          horario: "~09:50",
          descricao: "Loja oficial da Shueisha, na mesma Tokyo Character Street.",
        },
        {
          titulo: "Pokémon Store",
          foto: "/images/marunouchi-pokemon-store.webp",
          horario: "~10:05",
          descricao: "Loja oficial de Pokémon.",
        },
        {
          titulo: "Kirby Café",
          foto: "/images/marunouchi-kirby-cafe.webp",
          horario: "~10:20",
          descricao: "Café temático de Kirby.",
        },
        {
          titulo: "Ghibli Shop",
          foto: "/images/marunouchi-ghibli-shop.webp",
          horario: "~10:35",
          descricao: "Loja oficial do Studio Ghibli.",
        },
        {
          titulo: "Tomica Shop",
          foto: "/images/marunouchi-tomica-shop.webp",
          horario: "~10:50",
          descricao: "Loja de miniaturas Tomica.",
        },
        {
          titulo: "Rilakkuma Store",
          foto: "/images/marunouchi-rilakkuma-store.webp",
          horario: "~11:05",
          descricao: "Loja oficial de Rilakkuma.",
        },
        {
          titulo: "Marunouchi Naka-dori",
          foto: "/images/marunouchi-naka-dori.webp",
          horario: "11:30",
          descricao: "Rua arborizada com cafés e restaurantes que alimentam os escritórios financeiros da região.",
        },
      ],
    },
    visaoAnotadaNoTopo: true,
    visaoAnotada: {
      titulo: "Marunouchi, Tokyo Station & Palácio Imperial",
      imagem: "/images/dia2-tokyostation.webp",
      imagemAlt: "Tokyo Station, onde fica a Tokyo Character Street",
      comentarios: [
        "Chegamos ao último dia da viagem.",
        "E hoje a programação é propositalmente muito mais leve.",
        "Você ainda precisa fazer check-out, organizar as últimas compras, fechar as malas e, principalmente, seguir para o aeroporto com bastante antecedência. Não existe motivo para colocar uma programação pesada justamente no dia em que qualquer atraso pode transformar o final da viagem em uma experiência estressante.",
        "Por isso, deixei apenas duas regiões muito próximas do seu hotel: Tokyo Station e o Palácio Imperial. As duas podem ser visitadas praticamente a pé, sem necessidade de ficar entrando e saindo de metrô ou ônibus.",
        "Comece pela Tokyo Station: você tecnicamente já conhece a estação — foi daqui que você utilizou o Shinkansen durante a viagem — mas existe uma diferença enorme entre simplesmente utilizar a estação como ponto de transporte e realmente explorar seu complexo comercial.",
        "A Tokyo Station é gigantesca e possui diversas áreas subterrâneas de lojas, restaurantes e serviços. Hoje vamos conhecer uma delas.",
        "Tokyo Character Street: dentro do complexo da estação fica essa área praticamente inteira dedicada à cultura pop japonesa — várias lojas temáticas reunidas no mesmo corredor, com personagens de anime, mangá, games, televisão e algumas das maiores franquias japonesas.",
        "E existe uma loja que você já tinha mencionado especificamente que queria conhecer: a Dragon Ball Store. No começo da viagem nós já passamos por uma JUMP SHOP, dedicada às séries publicadas pela Shonen Jump e que naturalmente também possui produtos de Dragon Ball. Aqui, porém, a proposta é diferente: você encontrará uma loja especificamente dedicada ao universo de Dragon Ball.",
        "Além dela, existem várias outras lojas interessantes no mesmo complexo. Entre as principais, eu destacaria a JUMP SHOP, Pokémon Store, Donguri Republic (dedicada aos personagens do Studio Ghibli), além de outras lojas temáticas que deixei indicadas no roteiro.",
        "Não precisa necessariamente visitar todas. Caminhe pela Character Street e entre naquelas que realmente chamarem sua atenção.",
        "Existe uma vantagem enorme em fazer isso pela manhã: você está muito perto do hotel, e provavelmente vai comprar alguma coisa.",
        "Por isso, existe uma estratégia que pode facilitar bastante o restante do dia: faça suas últimas compras e volte ao hotel antes do check-out. Assim você consegue colocar tudo aquilo que comprou hoje diretamente dentro das malas e organizar a bagagem uma última vez.",
        "É muito melhor fazer isso agora do que passar o restante do dia carregando sacolas — ou chegar ao aeroporto tentando descobrir onde colocar as últimas compras. Depois, faça o check-out normalmente.",
        "E as malas? Minha primeira opção seria simplesmente deixar as malas no próprio hotel depois do check-out. A maioria dos hotéis consegue guardar a bagagem dos hóspedes por algumas horas no dia da saída — confirme na recepção, deixe tudo ali e continue o passeio apenas com aquilo que realmente precisa carregar.",
        "Existem também inúmeros coin lockers e serviços de armazenamento de bagagem na região da Tokyo Station, mas eu utilizaria isso apenas como plano B. Se o hotel puder guardar suas malas, não existe motivo para carregá-las até a estação, procurar um locker suficientemente grande e depois precisar retornar especificamente até ele. Quanto mais simples for a logística hoje, melhor.",
        "Almoce com calma: depois disso, faça um almoço tranquilo. Marunouchi e a própria Tokyo Station possuem uma quantidade enorme de restaurantes, então hoje não existe necessidade de atravessar a cidade atrás de uma refeição específica. Escolha aquilo que estiver com vontade de comer e aproveite — é o último dia.",
        "Depois do almoço: Palácio Imperial. Durante a tarde, se ainda houver tempo confortável antes de seguir para o aeroporto, caminhe em direção ao Palácio Imperial — a residência oficial do Imperador do Japão e o principal complexo da Família Imperial.",
        "Uma coisa importante é entender que o Palácio Imperial não funciona como um castelo turístico convencional. Grande parte do complexo não é simplesmente aberta para você entrar e caminhar livremente.",
        "Existem visitas específicas a determinadas áreas que seguem regras próprias e podem exigir inscrição ou participação em visitas organizadas. A disponibilidade também pode variar conforme o calendário oficial da Casa Imperial. Por isso, para hoje, não quero que sua programação dependa de uma reserva.",
        "A parte que você pode conhecer com mais liberdade: no roteiro, deixei indicada a região acessível ao público, incluindo os East Gardens do Palácio Imperial e alguns dos pontos históricos dos antigos terrenos do Castelo de Edo.",
        "Naturalmente, não é a mesma coisa que entrar nas áreas utilizadas pela Família Imperial. Mas você consegue entender muito melhor a escala do complexo e observar muralhas, fossos, portões, jardins e estruturas remanescentes do antigo Castelo de Edo.",
        "E existe uma vantagem importante para hoje: você não precisa passar horas aqui. Faça uma caminhada, observe a região, tire algumas fotos e, quando sentir que já viu o suficiente, volte. Hoje não existe nenhuma obrigação de \"completar\" o Palácio Imperial.",
        "Não transforme o último dia em uma corrida — essa talvez seja a recomendação mais importante de hoje.",
        "Se perceber que está demorando mais do que esperava para organizar as malas, fazer check-out ou almoçar, corte alguma coisa. Se quiser ficar mais tempo fazendo compras na Tokyo Station, fique. Se estiver cansado e preferir simplesmente almoçar e voltar ao hotel, faça isso.",
        "O Palácio Imperial está aqui justamente porque é uma visita interessante, rápida e próxima — não porque você precise obrigatoriamente encaixar mais uma atração antes de ir embora.",
        "E depois disso, aeroporto: quando terminar, volte ao hotel, retire suas malas e comece o deslocamento para o aeroporto com bastante antecedência. Não deixe compras, organização de bagagem ou qualquer outra pendência importante para resolver depois desse momento.",
        "O objetivo deste último dia é justamente o contrário. Depois de uma viagem inteira acordando cedo, pegando trens, ônibus, Shinkansen e atravessando diferentes regiões do Japão, hoje você não precisa correr para lugar nenhum.",
        "Faça suas últimas compras, conheça um pouco de Marunouchi, dê uma última caminhada por Tóquio e encerre a viagem com calma. Depois disso, é buscar as malas e seguir para o aeroporto.",
      ],
      pontos: [
        { titulo: "Dragonball Store", descricao: "Loja oficial de Dragon Ball.", foto: "/images/marunouchi-dragonball-store.webp", ordem: 1 },
        { titulo: "Jump Shop", descricao: "Loja oficial da Shueisha.", foto: "/images/marunouchi-jump-shop.webp", ordem: 2 },
        { titulo: "Pokémon Store", descricao: "Loja oficial de Pokémon.", foto: "/images/marunouchi-pokemon-store.webp", ordem: 3 },
        { titulo: "Kirby Café", descricao: "Café temático de Kirby.", foto: "/images/marunouchi-kirby-cafe.webp", ordem: 4 },
        { titulo: "Ghibli Shop", descricao: "Loja oficial do Studio Ghibli.", foto: "/images/marunouchi-ghibli-shop.webp", ordem: 5 },
        { titulo: "Tomica Shop", descricao: "Loja de miniaturas Tomica.", foto: "/images/marunouchi-tomica-shop.webp", fotoPosicao: "center 15%", ordem: 6 },
        { titulo: "Rilakkuma Store", descricao: "Loja oficial de Rilakkuma.", foto: "/images/marunouchi-rilakkuma-store.webp", fotoPosicao: "center 20%", ordem: 7 },
      ],
    },
    regiao: {
      nome: "Marunouchi · Tokyo",
      descricao:
        "Um dos pilares da economia japonesa desde os tempos feudais — aqui fica Tokyo Station, que ao lado de Shinagawa são as únicas estações da capital com acesso direto ao trem-bala. Nos arredores estão as sedes de bancos, seguradoras e grandes empresas japonesas: o distrito funciona como a Wall Street do Japão.",
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
    atracaoPrincipalImagem: "/images/dia2-tokyostation.webp",
    detalhesPraticos: [
      { label: "Tokyo Character Street", valor: "10h–20h30" },
      { label: "Localização", valor: "B1, First Avenue (Tokyo Station)" },
      { label: "Pagamento", valor: "Cartão aceito na maioria das lojas" },
      {
        label: "Melhor horário",
        horarioDestaque: "10h",
        valor:
          "Logo na abertura — o corredor é estreito e lota rápido com o movimento normal da estação a partir do meio da manhã.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/visaogeral-tokyostation.webp",
      imagemAlt: "Mapa de Tokyo Station e Marunouchi com Nijubashi Bridge e o Jardim do Palácio Imperial nas proximidades",
      nota: "Localização de Tokyo Station e Marunouchi em relação à entrada dos Jardins do Palácio Imperial.",
    },
    pois: [
      {
        category: "Compras",
        title: "Dragonball Store",
        description:
          "Dentro do complexo da estação (Tokyo Station First Avenue), na Tokyo Character Street — corredor com mais de 10 lojas de outras franquias de anime. Não precisa visitar todas: caminhe pelo corredor e entre apenas nas que realmente chamarem sua atenção.",
        lista: [
          "Jump Shop",
          "Pokémon Store",
          "Kirby Café",
          "Ghibli Shop",
          "Tomica Shop",
          "Rilakkuma Store",
        ],
        prioridade: "recomendado",
        ordem: 1,
      },
      {
        title: "Marunouchi Naka-dori",
        description:
          "Rua arborizada com cafés e restaurantes que alimentam os escritórios financeiros da região.",
        prioridade: "opcional",
        ordem: 2,
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
      curadoriaLabel: "Opções selecionadas — Almoço leve (~12h)",
      curadoria: [
        {
          nome: "Niboshi to Nihonshu Sugidama",
          papel: "Mais prático (na rota)",
          categoria: "Ramen (caldo de niboshi)",
          descricao:
            "Ramen de caldo de niboshi (sardinha-seca), casa premiada — a 5 min a pé da Saída Norte de Marunouchi da Tokyo Station.",
          foto: "/images/niboshi-sugidama.webp",
          economico: true,
          notaTabelog: "3.64",
          numAvaliacoes: "634 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço",
          distancia: "~5 min a pé da Tokyo Station (Saída Norte de Marunouchi) / 2 min da Estação Otemachi",
          foreignFriendly:
            "Médio — sem cardápio em inglês confirmado, mas prato simples de pedir; reserva online pelo Tabelog.",
          horario: "seg–sex 11h–15h30 e 17h–23h · fins de semana 11h–17h (só almoço)",
          reserva: "Recomendada para menus fechados — reserva online",
          pagamento: "Cartão, IC card e QR code aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130201/13303589/",
        },
        {
          nome: "Sumiyaki Unafuji — Tokyo Midtown Yaesu",
          papel: "Experiência mais especial",
          categoria: "Unagi (enguia grelhada na brasa)",
          descricao:
            "Enguia grelhada na técnica \"jiyaki\" de alta temperatura, filial de uma casa premiada de Nagoya — conexão subterrânea direta com a Tokyo Station.",
          foto: "/images/sumiyaki-unafuji.webp",
          notaTabelog: "3.67",
          numAvaliacoes: "1.363 avaliações",
          faixaPreco: "¥6.000–7.999 no almoço (jantar sai mais caro — vá no horário de almoço)",
          distancia: "~233 m da Tokyo Station, por passagem subterrânea",
          foreignFriendly:
            "Alto — reserva online, ampla gama de pagamentos digitais internacionais (Alipay, WeChat Pay).",
          horario: "11h–23h, todos os dias (último pedido 22h)",
          reserva: "Obrigatória — reserva online",
          pagamento: "Cartão, Suica, PayPay, Alipay, WeChat Pay e outros aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130201/13279890/",
        },
        {
          nome: "Soba to Tempura Ishiraku — Otemachi Park Building",
          papel: "Melhor custo-benefício",
          categoria: "Soba + Tempura",
          descricao:
            "Combinação clássica de soba com tempura na hora, cardápio multilíngue (inglês) — opção rápida e leve antes dos Jardins do Palácio Imperial.",
          foto: "/images/soba-tempura-ishiraku.webp",
          economico: true,
          notaTabelog: "3.40",
          numAvaliacoes: "154 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço",
          distancia: "1 min a pé da Saída C6a da Estação Otemachi",
          foreignFriendly: "Alto — cardápio em inglês confirmado.",
          horario: "seg–sex 11h–23h (último pedido 22h) — fechado sáb/dom/feriados",
          reserva: "Reserva online disponível, não obrigatória",
          pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130201/13213124/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Marunouchi",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Marunouchi — em produção",
      },
    },
    infoOperacional: {
      titulo: "Como Chegar ao First Avenue",
      icone: "entrada",
      semExpandir: true,
      itens: [
        {
          local: "Saída Yaesu Central Gate (subsolo)",
          nota: "A mais próxima da Character Street, Ramen Street e Okashi Land — dá pra chegar direto das plataformas, sem passar pela catraca de saída da estação.",
        },
      ],
    },
  },
  tarde: {
    percursoEssencial: {
      duracao: "~2h15 (Imperial Palace East Gardens)",
      passos: [
        {
          titulo: "Otemon Gate",
          foto: "/images/imperial-palace-otemon-gate.webp",
          horario: "13:15",
          descricao: "Antigo portão principal do Castelo de Edo — hoje a entrada principal dos jardins.",
        },
        {
          titulo: "Bansho (Casas de Guarda)",
          foto: "/images/imperial-palace-bansho.webp",
          horario: "~13:45",
          descricao: "Uma das três casas de guarda samurai que sobrevivem do Castelo de Edo.",
        },
        {
          titulo: "Muralhas e Fossos Originais",
          foto: "/images/imperial-palace-muralhas.webp",
          horario: "~14:15",
          descricao: "Trechos originais das muralhas de pedra e fossos que protegiam o Castelo de Edo.",
        },
        {
          titulo: "Fujimi-yagura",
          foto: "/images/imperial-palace-fujimi-yagura.webp",
          horario: "~14:45",
          descricao: "Torre de vigia construída em 1659 — uma das construções mais fotogênicas do local.",
        },
        {
          titulo: "Tenshudai",
          foto: "/images/imperial-palace-tenshudai.webp",
          horario: "15:15",
          descricao: "Enorme base de pedra onde ficava a torre principal do Castelo de Edo.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Imperial Palace East Gardens",
      imagem: "/images/raiox-tokyostation.webp",
      imagemAlt: "Raio-X Alpinea da região do Palácio Imperial com Jardim do Palácio (皇居東御苑), Nijubashi Bridge, Ninomaru Garden, Kita-no-maru Park e Tokyo Station",
      comentarios: [
        "Vista aérea de toda a região do Palácio Imperial: o Jardim do Palácio (皇居東御苑, os East Gardens) fica logo a nordeste do Nijubashi Bridge e do próprio Palácio, com o Ninomaru Garden e o Museu Nacional de Arte Moderna nas bordas do fosso.",
        "A caminhada desde Tokyo Station atravessa Marunouchi rumo ao Nijubashi Bridge — de lá, é só contornar o fosso até a entrada dos jardins. Mais ao norte, Kita-no-maru Park e a Chidorigafuchi Green Way completam o grande cinturão verde que envolve o Palácio.",
      ],
    },
    regiao: {
      nome: "Chiyoda · Tokyo",
      descricao:
        "Bairro central onde fica o Palácio Imperial, residência da família imperial japonesa, erguido sobre as ruínas do antigo Castelo de Edo. Os East Gardens (皇居東御苑) são a única parte do terreno aberta ao público sem necessidade de reserva — entrada gratuita pelo portão Otemon, a poucos minutos a pé de Tokyo Station.",
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
    atracaoPrincipalImagem: "/images/imperial-palace-east-gardens.webp",
    atracaoPrincipalFoco: "center",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Horário", valor: "9h–18h (maio)" },
      { label: "Fechado", valor: "Segundas e sextas-feiras" },
      {
        label: "Melhor horário",
        horarioDestaque: "9h",
        valor:
          "Logo na abertura — os grupos de turismo chegam a partir das 10h30, e a entrada fecha 30 min antes do horário de fechamento.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/visaogeral-tokyostation.webp",
      imagemAlt: "Mapa do Jardim do Palácio Imperial com Nijubashi Bridge, Ninomaru Garden e Tokyo Station nas proximidades",
      nota: "Localização da entrada dos Jardins do Palácio Imperial em relação a Tokyo Station e Marunouchi.",
    },
    pois: [
      {
        title: "Otemon Gate",
        description:
          "Antigo portão principal do Castelo de Edo, usado pelos daimyō em suas visitas oficiais ao shogun. Destruído em bombardeio aéreo em 1945 e reconstruído em 1967 — hoje é a entrada principal dos jardins, o primeiro ponto do passeio.",
        prioridade: "recomendado",
        ordem: 1,
        imagem: "/images/imperial-palace-otemon-gate.webp",
        imagemAlt: "Otemon Gate, entrada principal dos Jardins do Palácio Imperial",
      },
      {
        title: "Bansho (Casas de Guarda)",
        description:
          "Uma das três casas de guarda samurai que sobrevivem do Castelo de Edo — o Hyakunin Bansho abrigava quatro unidades de 120 guardas responsáveis pela proteção do recinto interno do castelo. Fica logo após a entrada por Otemon.",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/imperial-palace-bansho.webp",
        imagemAlt: "Bansho, casa de guarda samurai do Castelo de Edo",
      },
      {
        title: "Muralhas e Fossos Originais",
        description:
          "Trechos originais das muralhas de pedra e fossos que protegiam o Castelo de Edo, preservados desde o período feudal — visíveis ao longo de todo o caminho.",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/imperial-palace-muralhas.webp",
        imagemAlt: "Muralhas e fossos originais do Castelo de Edo",
      },
      {
        title: "Fujimi-yagura",
        description:
          "Torre de vigia construída em 1659, uma das poucas estruturas originais remanescentes do Castelo de Edo — depois que o incêndio de 1657 destruiu a torre principal, passou a funcionar como sua substituta simbólica. Não é possível entrar, mas dá para ver de fora, dentro dos jardins. Uma das construções mais fotogênicas do local.",
        prioridade: "recomendado",
        ordem: 4,
        imagem: "/images/imperial-palace-fujimi-yagura.webp",
        imagemAlt: "Fujimi-yagura, torre de vigia do Castelo de Edo",
      },
      {
        title: "Tenshudai",
        description:
          "Enorme base de pedra onde ficava a torre principal (tenshu) do Castelo de Edo — pode ser escalada, e é um dos pontos mais impressionantes dos jardins. Fica no extremo norte do complexo, o ponto mais distante da entrada — bom encerramento do passeio.",
        prioridade: "recomendado",
        ordem: 5,
        imagem: "/images/imperial-palace-tenshudai.webp",
        imagemAlt: "Tenshudai, base de pedra da torre principal do Castelo de Edo",
      },
    ],
    banheirosProximos: [
      {
        local: "Área de descanso do Honmaru",
        nota: "A maior e mais completa do parque, no gramado do antigo Honmaru — banheiro ao lado.",
      },
      {
        local: "Área de descanso do Ninomaru",
        nota: "Sem atendente, mas com banheiro nas proximidades e máquinas de bebida — perto do Jardim Ninomaru.",
      },
      {
        local: "Prédio administrativo, perto do Otemon",
        nota: "O mais próximo da entrada — o quiosque logo depois do portão Otemon não tem banheiro próprio, o mais perto fica a ~120 m, neste prédio.",
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
    "À tarde seguimos para Shinjuku, bairro que mistura o Japão corporativo com o mais boêmio — do mirante gratuito do Prédio do Governo Metropolitano ao caos neon de Kabukicho, passando pelas vielas de Golden Gai. Por volta das 16h já iniciamos o caminho de volta ao hotel para buscar as malas e seguir de Shinkansen rumo a Kyoto — chegar cedo lá amanhã vale mais do que esticar a noite em Shinjuku.",
  ],
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "08:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "09:15", foto: "/images/icone-hotel2.webp" },
      { titulo: "Meiji Jingu e Parque de Yoyogi", horario: "10:00", foto: "/images/dia3-meijijingu.webp" },
      { titulo: "Shibuya Crossing", horario: "12:00", foto: "/images/placeholder-em-producao.webp" },
      { titulo: "Almoço", horario: "13:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Shinjuku — Mirante e Kabukicho", horario: "14:45", foto: "/images/draft-shinjuku.webp" },
      { titulo: "Retorno ao hotel e Shinkansen para Kyoto", horario: "16:00", foto: "/images/icone-hotel2.webp" },
    ],
  },
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
        evento: "Almoço em Shibuya/Omotesando (3 opções selecionadas)",
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
        horario: "16:00",
        evento: "Retorno ao hotel para buscar as malas",
        tag: "Deslocamento",
      },
      {
        horario: "17:00",
        evento: "Shinkansen rumo a Kyoto (Hikari, ~2h40, incluso no JR Pass)",
        destaque: true,
        tag: "Deslocamento",
      },
    ],
    nota: "Horários estimados considerando saída do lyf Ginza Tokyo (Kyobashi) — ajuste conforme seu ritmo.",
  },
  diaEmNumeros: {
    atracoes: "3 atrações principais",
    caminhada: "A definir",
    transporte: "~23 min de trem no total",
    linhasMetro: "2 linhas, sem baldeações",
    ritmo: "Intenso",
    saida: "09:15",
    retorno: "Segue de Shinkansen para Kyoto (~17:00)",
  },
  manha: {
    label: "Manhã + Tarde",
    percursoEssencial: {
      duracao: "~6h15 (Meiji Jingu, Yoyogi, Omotesando, Shibuya, Shinjuku e Kabukicho)",
      passos: [
        {
          titulo: "Meiji Jingu",
          foto: "/images/dia3-meijijingu.webp",
          horario: "10:00",
          descricao: "O maior santuário xintoísta de Tóquio, cercado pela floresta erguida do zero em homenagem ao Imperador Meiji.",
        },
        {
          titulo: "Parque de Yoyogi",
          foto: "/images/yoyogi-park.webp",
          horario: "~10:20",
          descricao: "Você precisa entrar nele para acessar o Meiji Jingu — uma enorme floresta com árvores extremamente altas.",
        },
        {
          titulo: "Omotesando",
          foto: "/images/omotesando.webp",
          horario: "~11:00",
          descricao: "Uma das maiores avenidas de boutiques e lojas de luxo de Tóquio — liga a saída do parque a Shibuya.",
        },
        {
          titulo: "Estátua de Hachiko",
          foto: "/images/hachiko-statue.webp",
          horario: "~11:45",
          descricao: "Estátua em homenagem ao cão que continuou esperando seu dono voltar para casa — bem na saída da Estação Shibuya.",
        },
        {
          titulo: "Shibuya Crossing",
          foto: "/images/shibuya-crossing.webp",
          horario: "12:00",
          descricao: "O famoso cruzamento hexagonal de Shibuya, ao lado da estátua de Hachiko.",
        },
        {
          titulo: "Kabukicho",
          foto: "/images/kabukicho.webp",
          horario: "14:45",
          descricao: "Maior distrito de entretenimento noturno de Tóquio — vá logo após o almoço, quando a região está bem mais tranquila que de madrugada.",
        },
        {
          titulo: "Estátua do Godzilla",
          foto: "/images/godzilla-head-shinjuku.webp",
          horario: "~15:00",
          descricao: "Réplica em tamanho real na varanda do Hotel Gracery, no coração de Kabukicho.",
        },
        {
          titulo: "Gato 3D Gigante",
          foto: "/images/gato-3d-shinjuku.webp",
          horario: "~15:15",
          descricao: "Gato tridimensional gigante exibido em telão curvo no edifício Cross Shinjuku Vision, pertinho do Godzilla.",
        },
        {
          titulo: "Golden Gai (passagem)",
          foto: "/images/golden-gai.webp",
          horario: "~15:30",
          descricao: "Rede de vielas estreitas com mais de 200 bares minúsculos — durante o dia a maioria está fechada, mas vale caminhar por elas para conhecer a arquitetura.",
        },
        {
          titulo: "Shinjuku Gyoen ou Prédio do Governo Metropolitano (escolha um)",
          foto: "/images/tokyo-metropolitan-government-building.webp",
          horario: "~15:45",
          descricao: "Se ainda houver vontade e tempo: parque (Shinjuku Gyoen) ou mirante gratuito no 45º andar do Prédio do Governo Metropolitano — nenhum dos dois é essencial hoje.",
        },
        {
          titulo: "Retorno ao hotel e Shinkansen para Kyoto",
          foto: "/images/icone-hotel2.webp",
          horario: "16:00",
          descricao: "Busque as malas e siga para a estação — chegar cedo em Kyoto amanhã vale mais do que esticar a noite em Shinjuku.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Meiji Jingu, Harajuku & Shibuya",
      imagem: "/images/raiox-meiji-jingu.webp",
      imagemAlt: "Raio-X Alpinea do Meiji Jingu com o Santuário Principal, Jardim Interior, Casa do Tesouro, Museu e as estações Harajuku e Yoyogi",
      comentarios: [
        "Hoje entramos em uma das regiões mais centrais e conhecidas de Tóquio. É provavelmente uma das imagens mais associadas à cidade para quem visita o Japão pela primeira vez: Meiji Jingu, Harajuku, Omotesando e Shibuya estão todos relativamente próximos, mas cada área tem uma personalidade completamente diferente.",
        "E existe um ponto importante para este dia: há muito mais coisa para fazer nessa região do que tempo disponível. A ideia, portanto, não é tentar conhecer tudo, mas entender o que realmente vale priorizar.",
        "Meiji Jingu — comece o dia por aqui. Nossa primeira parada é o Meiji Jingu, um dos santuários xintoístas mais importantes de Tóquio.",
        "Uma das coisas que mais impressiona aqui é a escala da floresta ao redor do santuário. As árvores são enormes e criam uma sensação muito vertical, quase como se você estivesse entrando em uma floresta completamente isolada da cidade.",
        "E existe uma curiosidade interessante: essa floresta foi planejada e criada pelo homem. Ela começou a ser formada há pouco mais de 100 anos, após a morte do Imperador Meiji, como parte da criação do santuário dedicado a ele e à Imperatriz Shōken. Foram plantadas dezenas de milhares de árvores doadas de diferentes regiões do Japão, formando a floresta que existe hoje.",
        "É justamente isso que torna a experiência tão interessante: poucos minutos antes você está no meio de uma das maiores metrópoles do planeta e, de repente, praticamente deixa de ouvir a cidade.",
        "O horário realmente importa? Para conhecer o complexo, não é necessário chegar em um horário extremamente específico. Durante a manhã, a experiência normalmente continua bastante agradável.",
        "Mas existe uma exceção importante se você quiser boas fotos: os barris de saquê (kazaridaru). Eles ficam ao longo do caminho de acesso ao santuário e são um dos pontos fotográficos mais conhecidos do Meiji Jingu. Do outro lado ficam também os famosos barris de vinho oferecidos ao santuário.",
        "Se você quiser fotografar essa área praticamente vazia, chegue o mais próximo possível do horário de abertura. Conforme a manhã avança, grupos de turistas começam a passar constantemente por esse corredor e fica muito mais difícil conseguir uma fotografia limpa.",
        "Na área principal do santuário isso é menos problemático. O espaço é amplo e, mesmo com visitantes, normalmente ainda é possível encontrar bons ângulos.",
        "Fora a floresta, os barris e o complexo principal do santuário, não existe uma quantidade enorme de atrações individuais para visitar. A graça do Meiji Jingu está muito mais na experiência do lugar: caminhar pela floresta, observar a arquitetura e aproveitar o contraste com a Tóquio extremamente urbana que veremos logo depois.",
        "Saindo do Meiji Jingu: depois do complexo, você entra em uma região completamente diferente. Harajuku e Omotesando ficam logo ao lado, e daqui em diante começam a aparecer tantas possibilidades que será necessário escolher o que faz mais sentido para você.",
        "A Omotesando é uma grande avenida arborizada conhecida principalmente pela arquitetura e pelas lojas de marcas internacionais e de luxo. É uma região bonita para caminhar, mas possui um perfil bastante comercial.",
        "Como compras não são necessariamente uma prioridade desta viagem, não considero necessário gastar muito tempo aqui. Vale conhecer a região, observar a avenida e seguir para aquilo que realmente desperte seu interesse. E daqui estamos praticamente conectados a Shibuya.",
        "Entendendo Shibuya: uma coisa que pode gerar alguma confusão durante a viagem é encontrar placas escritas \"Shibuya City\" mesmo quando você aparentemente está em outro bairro.",
        "Isso acontece porque Shibuya é um dos 23 special wards de Tóquio e engloba uma área muito maior do que apenas os arredores da estação e do famoso cruzamento. Harajuku e partes dessa região também pertencem administrativamente a Shibuya. Por isso, quando falamos em \"ir para Shibuya\" neste roteiro, estamos falando especificamente da região ao redor da Shibuya Station e do Shibuya Crossing.",
        "Shibuya Crossing: naturalmente, vale conhecer o famoso cruzamento em frente à estação que se tornou um dos símbolos de Tóquio. Mas existe uma diferença enorme entre simplesmente conhecê-lo e tentar vê-lo no seu momento de maior movimento.",
        "O fluxo aumenta bastante no final da tarde e começo da noite, especialmente durante os horários de pico. É quando você encontra aquela imagem clássica de uma multidão atravessando simultaneamente em várias direções. Só tenha em mente que quanto mais impressionante estiver o cruzamento, menos agradável tende a ser a experiência no nível da rua.",
        "Nos horários mais movimentados, a região da estação fica extremamente congestionada. Dependendo do dia, o fluxo de pessoas começa praticamente dentro da própria estação e continua pelas saídas e calçadas ao redor — uma lógica parecida com a Estação da Sé em São Paulo no horário de pico: muita gente tentando circular simultaneamente e pouco espaço para simplesmente parar e observar.",
        "Portanto, não existe obrigação de chegar exatamente no horário mais cheio. Se estiver passando pela região antes, aproveite Shibuya com mais tranquilidade.",
        "Hachikō e outros pontos próximos: ao lado da estação fica também a pequena estátua de Hachikō, o famoso cão que continuou retornando à estação esperando por seu dono mesmo depois da morte dele. A estátua em si é bem menor do que muita gente imagina, mas a história transformou o local em um dos pontos mais conhecidos de Shibuya.",
        "Existem ainda vários centros comerciais na região com lojas relacionadas à cultura pop japonesa, incluindo Pokémon Center, Nintendo Store e outras lojas especializadas. Não é necessário priorizá-las hoje, mas, se sobrar tempo ou vontade de entrar, saiba que existem várias opções muito próximas.",
        "Uma recomendação especial: sushi de esteira. Se você tiver interesse em experimentar um sushi de esteira (kaiten-zushi), este é provavelmente o melhor momento da viagem para fazer isso — minha recomendação é o Kaiten Sushi Ginza Onodera, na região de Omotesando, um dos meus favoritos em Tóquio, com qualidade muito acima do que normalmente se imagina.",
        "O único problema é justamente a popularidade: costuma formar bastante fila. Por isso, se decidir incluí-lo no dia, minha recomendação é chegar próximo do horário de abertura e retirar sua senha o quanto antes — isso evita perder uma parte significativa do dia simplesmente esperando por uma mesa.",
        "Entre Meiji Jingu, Harajuku, Omotesando e Shibuya, você estará passando por uma das regiões com maior concentração de coisas para fazer em toda a viagem. Não tente encaixar tudo. Use o roteiro como base, escolha aquilo que mais chamar sua atenção e aproveite também para simplesmente caminhar e descobrir a região.",
      ],
      pontos: [
        {
          cor: "#C81D25",
          titulo: "Ōtorii",
          nomeJapones: "大鳥居",
          descricao:
            "O grande torii de entrada do santuário, um dos maiores torii de madeira do Japão — feito de cipreste hinoki de mais de 1.500 anos, importado de Taiwan. Marca a passagem do mundano para o terreno sagrado, logo no início do Minami-sando.",
          foto: "/images/meiji-jingu-otorii.webp",
          ordem: 1,
        },
        {
          cor: "#D97A1F",
          titulo: "Kazaridaru",
          nomeJapones: "飾り樽",
          descricao:
            "Parede de barris de saquê (kazaridaru) doados anualmente por destilarias de todo o Japão, em oferenda ao imperador Meiji. Do outro lado da alameda fica a parede espelhada de barris de vinho da Borgonha, símbolo da abertura do Japão ao Ocidente durante o período Meiji. Priorize passar por aqui primeiro — depois de meia-manhã enche de gente e fica difícil fotografar.",
          foto: "/images/meiji-jingu-kazaridaru.webp",
          ordem: 2,
        },
        {
          cor: "#1E6FB8",
          titulo: "Minami Shinmon",
          nomeJapones: "南神門",
          descricao:
            "Portão sul do santuário — a entrada para o pátio interno onde fica o salão principal de orações. É o último portão antes do Gehaiden.",
          foto: "/images/meiji-jingu-minami-shinmon.webp",
          ordem: 3,
        },
        {
          cor: "#3F8F3F",
          titulo: "Gehaiden",
          nomeJapones: "外拝殿",
          descricao:
            "Salão externo de orações do Santuário Principal, onde os visitantes fazem sua reverência: duas reverências, duas palmas, uma reverência final (nirei-nihakushu-ichirei). É o ponto mais movimentado e o coração da visita ao Meiji Jingu.",
          foto: "/images/meiji-jingu-gehaiden.webp",
          ordem: 4,
        },
        {
          cor: "#6B3FA0",
          titulo: "Meoto Kusu",
          nomeJapones: "夫婦楠",
          descricao:
            "Duas árvores de cânfora (kusunoki) plantadas lado a lado no pátio principal, entrelaçadas por uma corda sagrada (shimenawa) — símbolo de união e harmonia conjugal, muito procurado por casais que visitam o santuário.",
          foto: "/images/meiji-jingu-meotokusu.webp",
          ordem: 5,
        },
      ],
    },
    regiao: {
      nome: "Harajuku/Yoyogi · Tokyo",
      descricao:
        "Área verde entre Harajuku e Yoyogi, onde a floresta plantada em homenagem ao Imperador Meiji cerca o santuário xintoísta mais visitado de Tokyo. Do outro lado do Parque de Yoyogi começa Omotesando, a avenida de grifes e boutiques que liga a região a Shibuya, seguindo para o sul.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
        saida: "Saída 6",
        foto: "/images/Kyobashi_Station_entrance_7_20170813.webp",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.webp" },
      estacoesIntermediarias: [
        { nome: "Ginza", nomeJapones: "銀座", numero: "G09" },
        { nome: "Shimbashi", nomeJapones: "新橋", numero: "G08" },
        { nome: "Toranomon", nomeJapones: "虎ノ門", numero: "G07" },
        { nome: "Tameike-sanno", nomeJapones: "溜池山王", numero: "G06" },
        { nome: "Akasaka-mitsuke", nomeJapones: "赤坂見附", numero: "G05" },
        { nome: "Aoyama-itchome", nomeJapones: "青山一丁目", numero: "G04" },
        { nome: "Gaiemmae", nomeJapones: "外苑前", numero: "G03" },
      ],
      estacaoDestino: {
        nome: "Estação Omotesando",
        nomeJapones: "表参道駅",
        saida: "Saída A2 (Omotesando Hills)",
        foto: "/images/omotesando-station-entrance.webp",
        mapa: "/images/omotesando-station-map.webp",
        mapaAlt: "Mapa da Estação Omotesando (Ginza Line, Hanzomon Line e Chiyoda Line)",
      },
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
    atracaoPrincipalImagem: "/images/dia3-meijijingu.webp",
    detalhesPraticos: [
      { label: "Entrada (terreno principal)", valor: "Gratuita" },
      { label: "Jardim Interior", valor: "¥500" },
      { label: "Horário", valor: "5h–18h10 (horário oficial de maio)" },
      {
        label: "Melhor horário",
        horarioDestaque: "5h–7h",
        valor:
          "Logo na abertura, às 5h — o Minami-sando é mais tranquilo nas primeiras horas. Grupos de turismo e visitantes de ônibus chegam a partir do meio da manhã, e o caminho sob a floresta some em movimento nos fins de semana.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/meiji-jingu-mapa-trajeto.webp",
      imagemAlt:
        "Mapa do terreno do Meiji Jingu com o trajeto a pé desde o Ichino Torii (Harajuku) até o Santuário Principal, passando pelo Nino Torii, os Barris de Saquê, a Ponte Shinkyo e o Gehaiden",
      nota: "Trajeto a pé desde a Estação Harajuku: Ichino Torii → Ponte Shinkyo → Nino Torii → Barris de Saquê (Kazaridaru) → Minami Shinmon → Gehaiden e Meoto Kusu.",
    },
    decisoes: [
      {
        titulo: "Vale entrar no Jardim Interior do Meiji Jingu?",
        resposta: "O terreno principal do santuário já é gratuito e é a experiência essencial — o Jardim Interior (¥500) é uma extensão menor, opcional para quem tiver tempo de sobra.",
      },
    ],
    pois: [
      {
        title: "Parque de Yoyogi",
        description:
          "Você precisa entrar nele para acessar o Meiji Jingu — trata-se de uma enorme floresta com árvores extremamente altas, erguida do zero em homenagem à morte do imperador Meiji.",
        prioridade: "imperdivel",
        ordem: 1,
        imagem: "/images/yoyogi-park.webp",
        imagemAlt: "Lago do Parque de Yoyogi cercado por árvores em tons de outono, com chafariz ao fundo",
      },
      {
        category: "Compras",
        title: "Omotesando",
        description:
          "Uma das maiores avenidas de boutiques e lojas de luxo de Tóquio, com diversos cafés e restaurantes importantes nas ruas ao redor da avenida principal — liga a saída do parque a Shibuya, seguindo para o sul.",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/omotesando.webp",
        imagemAlt: "Fachada de vidro da loja Dior em Omotesando, com pedestres atravessando a faixa em primeiro plano",
      },
      {
        title: "Estátua de Hachiko",
        description:
          "Estátua em homenagem ao cão que continuou esperando seu dono voltar para casa sem saber que ele havia falecido — deu origem ao filme \"Pra Sempre ao Seu Lado\". Fica bem na saída da Estação Shibuya.",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/hachiko-statue.webp",
        imagemAlt: "Estátua de bronze do cão Hachiko, na saída da Estação Shibuya",
      },
      {
        title: "Shibuya Crossing",
        description:
          "O famoso cruzamento hexagonal de Shibuya, que fica caótico às 18h — ao lado da estátua de Hachiko, último ponto antes de seguir para Shinjuku.",
        prioridade: "recomendado",
        ordem: 4,
        imagem: "/images/shibuya-crossing.webp",
        imagemAlt: "Vista aérea do cruzamento de Shibuya iluminado à noite, com pedestres atravessando em todas as direções",
      },
    ],
    gastronomia: {
      curadoriaLabel: "Opções selecionadas — Almoço (~13h)",
      curadoria: [
        {
          nome: "Harajuku Gyoza Ro",
          papel: "Mais local e autêntico",
          categoria: "Gyoza (guioza japonês)",
          descricao:
            "Casa tradicional de guioza desde 1953, parada clássica de moradores e visitantes — peça o combo frito + cozido no vapor com broto de soja salteado.",
          foto: "/images/harajuku-gyoza-ro.webp",
          faixaPreco: "¥1.000–2.000 por pessoa",
          distancia:
            "~5 min a pé da Estação Meiji-Jingumae (Saída 7) — no caminho entre o Meiji Jingu e Omotesando",
          foreignFriendly:
            "Médio — sem cardápio em inglês confirmado, mas prato simples e visual, fácil de pedir por gestos; ponto conhecido internacionalmente (citado por guias como Time Out).",
          horario: "11h30–22h, todos os dias",
          nivelFila: "Fila comum no horário de almoço — casa pequena, com 60 lugares no balcão",
          reserva: "Não aceita reservas — só balcão, por ordem de chegada",
          pagamento: "Somente dinheiro — não aceita cartão, IC card nem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1306/A130601/13001284/",
          alerta:
            "Só dinheiro e sem reserva — leve ienes em espécie e conte com um tempo de espera na fila.",
          economico: true,
        },
        {
          nome: "Yakiniku Ushigoro Omotesando ten",
          papel: "Experiência mais especial",
          categoria: "Yakiniku (carne grelhada na mesa)",
          descricao:
            "Cortes selecionados de wagyu grelhados na própria mesa, com menu de almoço muito mais em conta que o jantar — selecionado para o Tabelog 100 de Yakiniku 2022–2025.",
          foto: "/images/yakiniku-ushigoro-omotesando.webp",
          economico: true,
          notaTabelog: "3.62",
          numAvaliacoes: "1.306 avaliações",
          faixaPreco: "¥3.000–3.999 no almoço",
          distancia: "~5 min a pé da Saída B2 da Estação Omotesando",
          foreignFriendly:
            "Alto — listado em inglês no Tabelog com reserva online; rede bem avaliada e conhecida internacionalmente.",
          horario:
            "seg–sex 17h–23h30 (fins de semana e feriados também abre 11h30) — último pedido 22h30",
          reserva: "Recomendada — reserva online",
          pagamento: "Cartão aceito (Visa, Master, JCB, Amex, Diners) — sem IC card nem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1306/A130602/13252182/",
        },
        {
          nome: "Kaiten Sushi Ginza Onodera Honten",
          papel: "Mais prático (na rota)",
          categoria: "Kaitenzushi (sushi de esteira premium)",
          descricao:
            "Unidade original (honten) do grupo Ginza Onodera (marca com estrela Michelin), em Omotesando — peixe pressionado à mão, na hora, na esteira. É a unidade que fica na região de Omotesando/Jingumae, próxima ao final do circuito da manhã.",
          notaTabelog: "3.50",
          numAvaliacoes: "1.463 avaliações",
          faixaPreco: "¥8.000–9.999 por pessoa (listado a partir de ¥4.000)",
          distancia:
            "~1–2 min a pé da Saída A1 da Estação Omotesando (entre Omotesando e Harajuku, mais perto de Omotesando)",
          foreignFriendly:
            "Alto — página do Tabelog disponível em inglês, chinês e coreano, com pagamento internacional aceito (UnionPay, Alipay, WeChat Pay); cardápio em inglês não confirmado.",
          horario: "10h30–22h30, todos os dias (último pedido 21h30)",
          reserva:
            "Não disponível — apenas fila no local; em dias de alta demanda a casa pode parar de aceitar clientes antes das 21h30",
          pagamento: "Cartão (Visa, Master, JCB, Amex, Diners, UnionPay), IC card e QR code (PayPay, Alipay, WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1306/A130602/13264172/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Shibuya",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Shibuya — em produção",
      },
    },
    banheirosProximos: [
      {
        local: "Ao longo do Minami-sando",
        nota: "Dois pontos com banheiro multifuncional/acessível espalhados pelo caminho principal entre a entrada (perto da Estação Harajuku) e o Santuário Principal.",
      },
      {
        local: "Subsolo do Kagura-den",
        nota: "Banheiro multifuncional/acessível no pavilhão usado para música sagrada e cerimônias, bem perto do pátio do Santuário Principal.",
      },
      {
        local: "Dentro do Jardim Interior (Meiji Jingu Gyoen)",
        nota: "Só acessível para quem pagar a entrada do jardim (¥500) — não serve como opção rápida para quem ficar só no terreno principal.",
      },
    ],
    subAtracoes: [
      {
        label: "Tarde",
        titulo: "Shinjuku",
        descricao:
          "Bairro que reúne o maior terminal ferroviário do mundo, arranha-céus corporativos, o distrito de entretenimento de Kabukicho e algumas das vielas mais icônicas de Tóquio — um contraste denso entre o Japão corporativo do dia e o lado mais boêmio que toma conta das ruas assim que escurece.",
        deslocamento: {
          estacaoOrigem: {
            nome: "Estação Shibuya",
            nomeJapones: "渋谷駅",
            saida: "Catraca Hachiko",
            foto: "/images/shibuya-station-entrance.webp",
            mapa: "/images/shibuya-station-map.webp",
            mapaAlt: "Mapa da Estação Shibuya (Ginza Line, Hanzomon Line e JR)",
          },
          linha: { codigo: "JY", nome: "JR Yamanote Line", cor: "#8FAADC", logo: "/images/jr-logo.webp" },
          estacoesIntermediarias: [
            { nome: "Harajuku", nomeJapones: "原宿", numero: "JY19" },
            { nome: "Yoyogi", nomeJapones: "代々木", numero: "JY18" },
          ],
          estacaoDestino: {
            nome: "Estação Shinjuku",
            nomeJapones: "新宿駅",
            saida: "Saída Sul Nova (New South Exit)",
            foto: "/images/shinjuku-station-entrance.webp",
          },
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
          mapaAndares: {
            titulo: "Mapa da Estação Shinjuku",
            mapas: [
              { andar: "B1F", imagem: "/images/shinjuku-station-map-b1f.webp", imagemAlt: "Mapa do subsolo (B1F) da Estação Shinjuku — catracas e portões" },
              { andar: "1F", imagem: "/images/shinjuku-station-map-1f.webp", imagemAlt: "Mapa do 1º andar (1F) da Estação Shinjuku — plataformas JR" },
              { andar: "Portões", imagem: "/images/shinjuku-station-map-gates.webp", imagemAlt: "Mapa dos portões Sul/Sudeste e Koshu-kaido/Nova Saída Sul da Estação Shinjuku" },
            ],
          },
        },
        visaoAnotada: {
          titulo: "Shinjuku & Kabukicho",
          imagem: "/images/raiox-shinjuku.webp",
          imagemAlt: "Raio-X Alpinea de Kabukicho à noite com Godzilla Head, Cross Shinjuku Vision, Thermae-Yu e Shinjuku Golden-Gai",
          comentarios: [
            "Shinjuku é daqueles lugares em que, novamente, há muito mais coisa para fazer do que tempo disponível.",
            "E hoje existe um fator adicional: no final do dia, minha recomendação é voltar ao hotel, pegar as malas e seguir para Kyoto de Shinkansen, o trem-bala japonês. Por isso, eu não gastaria uma parte muito grande do dia tentando conhecer tudo o que existe em Shinjuku.",
            "A ideia aqui é escolher alguns pontos, conhecer a região mais interessante para você e preservar tempo suficiente para fazer a viagem até Kyoto sem correria.",
            "Primeiro, entenda Shinjuku: é um dos principais centros de Tóquio e reúne áreas completamente diferentes dentro do mesmo distrito.",
            "Na parte oeste fica o Tokyo Metropolitan Government Building, sede do Governo Metropolitano de Tóquio — aquele enorme complexo com duas torres que aparece no mapa e domina o skyline dessa parte da cidade. É possível visitar seus observatórios gratuitamente e ter uma bela vista de Tóquio; se estiver com tempo e vontade, é uma opção interessante, mas, para este roteiro, considero uma visita opcional.",
            "Mais ao sul fica o Shinjuku Gyoen, um dos parques mais bonitos e importantes de Tóquio — enorme, com jardins de estilos diferentes e bastante espaço para caminhar. Justamente por isso, visitá-lo adequadamente pode consumir uma parte considerável do dia. Como você já terá passado pelo Meiji Jingu e sua área verde anteriormente, avalie na hora se realmente existe vontade de incluir outro grande parque no mesmo dia. Se quiser conhecer, vale a visita; caso contrário, não considero essencial encaixá-lo hoje.",
            "As distâncias enganam: uma coisa importante ao olhar o mapa é perceber que, embora tudo apareça como \"Shinjuku\", as atrações não ficam necessariamente próximas umas das outras. O Tokyo Metropolitan Government Building está no lado oeste da estação, o Shinjuku Gyoen fica mais ao sul/sudeste, e Kabukicho, Godzilla e Golden Gai ficam no lado leste/nordeste. Tentar visitar tudo significa atravessar várias vezes uma das regiões mais movimentadas de Tóquio — para o tempo que temos hoje, eu priorizaria Kabukicho e seus arredores.",
            "Kabukicho é o famoso distrito de entretenimento de Shinjuku e possui uma história bastante particular. Durante décadas, a região ficou associada à vida noturna, bares, clubes, estabelecimentos adultos e também à presença do crime organizado japonês — a relação de Kabukicho com a Yakuza faz parte da história do bairro e ajudou a construir boa parte da reputação que ele possui até hoje.",
            "A região mudou bastante, porém. Atualmente, Kabukicho também é uma área extremamente turística, iluminada por enormes letreiros, hotéis, restaurantes, karaokês, cinemas e complexos de entretenimento. Isso não significa que todos os problemas desapareceram: ainda existem relatos de golpes, cobranças abusivas e abordagens de touts tentando levar turistas para determinados bares e estabelecimentos.",
            "A regra aqui é bastante simples: não acompanhe pessoas que abordarem você na rua oferecendo bares, clubes ou serviços. Escolha você mesmo onde quer entrar. Para conhecer o bairro durante este roteiro, recomendo vir depois do almoço — você verá Kabukicho funcionando, mas em um momento muito mais tranquilo do que durante a madrugada.",
            "Godzilla e Kabukicho: um dos pontos mais fáceis de reconhecer é a enorme cabeça do Godzilla, instalada no topo do Hotel Gracery Shinjuku. Ela aparece entre os prédios e acabou se tornando um dos símbolos modernos de Kabukicho. Não é uma atração que exige muito tempo: vale caminhar pela região, encontrar um bom ângulo, tirar algumas fotos e continuar explorando — a graça aqui é justamente observar o ambiente ao redor, uma Tóquio completamente diferente daquela vista no Meiji Jingu poucas horas antes.",
            "Golden Gai: muito próximo dali fica o Shinjuku Golden Gai, uma pequena área formada por vielas estreitas e dezenas de minúsculos bares. É provavelmente um dos contrastes mais interessantes de Shinjuku: você sai dos enormes prédios, telas e letreiros de Kabukicho e entra em um labirinto de construções pequenas, algumas com espaço para pouquíssimas pessoas.",
            "Durante o dia, boa parte dos bares estará fechada, porque o Golden Gai realmente ganha vida à noite. Mesmo assim, vale passar pelas vielas para conhecer a arquitetura e entender o lugar. Como hoje você precisa seguir para Kyoto, não planejaria ficar esperando a região começar a funcionar à noite — teremos outras experiências de bares e izakayas durante a viagem.",
            "Quanto tempo ficar em Shinjuku? Minha recomendação é não transformar Shinjuku em um dia inteiro. Escolha aquilo que estiver com mais vontade de conhecer: se quiser parque, vá ao Shinjuku Gyoen; se quiser uma vista panorâmica, considere o Tokyo Metropolitan Government Building. Mas, entre as opções, eu priorizaria Kabukicho, Godzilla e uma passagem pelo Golden Gai.",
            "E existe um horário que eu tentaria respeitar: por volta das 16h, idealmente você já deveria estar começando o caminho de volta para o hotel. Você ainda precisa buscar suas malas e seguir para a estação de onde partirá o Shinkansen. Dependendo do tamanho da bagagem, é possível fazer parte desse deslocamento caminhando; caso não queira carregar malas, um táxi para um trajeto curto também pode simplificar bastante a logística.",
            "Por que não ficar até mais tarde? Porque hoje chegar cedo a Kyoto vale mais do que ganhar algumas horas extras em Shinjuku. Minha preferência seria fazer o deslocamento com tranquilidade, chegar a Kyoto, fazer o check-in, descansar e estar preparado para começar cedo no dia seguinte.",
            "E isso será particularmente importante: em Tóquio, muitas atrações conseguem absorver relativamente bem grandes quantidades de visitantes; em Kyoto, o horário em que você chega a determinados lugares pode mudar completamente a experiência. Algumas horas fazem uma diferença enorme entre encontrar um lugar tranquilo e encontrar exatamente o mesmo lugar tomado por grupos de turistas.",
          ],
          nota:
        "O mirante do Prédio do Governo Metropolitano é gratuito, com vista comparável à de mirantes pagos como o da Tokyo Sky Tree — mas, para caber no retorno das 16h ao hotel, é preciso escolher entre ele e o Shinjuku Gyoen, não os dois.",
        },
        poisLabel: "Pontos de Interesse",
        pois: [
          {
            title: "Shinjuku Gyoen",
            description:
              "Um dos parques mais bonitos de Tóquio, misturando jardins japonês, francês e inglês — refúgio verde no meio do bairro mais denso da cidade. Como o dia já passou pelo Meiji Jingu e sua área verde, não é essencial encaixar outro grande parque hoje — vale só se preferir parque a mirante e não estiver com o tempo apertado.",
            prioridade: "opcional",
            ordem: 1,
            imagem: "/images/shinjuku-gyoen.webp",
            imagemAlt: "Lago do Shinjuku Gyoen no outono, com a torre do Prédio do Governo Metropolitano ao fundo",
          },
          {
            title: "Prédio do Governo Metropolitano de Tóquio + Mirante",
            description:
              "Torres gêmeas projetadas por Kenzo Tange com mirante gratuito (~9h30–22h) no 45º andar e vista panorâmica da cidade — em dias claros, dá para ver o Monte Fuji. Fica no lado oeste da estação; interessante se estiver com tempo e vontade, mas opcional neste roteiro.",
            prioridade: "opcional",
            ordem: 2,
            imagem: "/images/tokyo-metropolitan-government-building.webp",
            imagemAlt: "Vista de baixo das torres gêmeas do Prédio do Governo Metropolitano de Tóquio",
            imagemPosicao: "top",
          },
          {
            title: "Gato 3D Gigante",
            description:
              "Gato tridimensional gigante exibido em telão curvo no edifício Cross Shinjuku Vision, na saída leste da estação — uma das atrações mais fotografadas do bairro, já a caminho de Kabukicho.",
            prioridade: "recomendado",
            ordem: 3,
            imagem: "/images/gato-3d-shinjuku.webp",
            imagemAlt: "Gato tridimensional gigante no telão curvo do Cross Shinjuku Vision",
          },
          {
            title: "Estátua do Godzilla",
            description:
              "Réplica em tamanho real na varanda do Hotel Gracery, símbolo do distrito de entretenimento de Kabukicho — pertinho do Gato 3D.",
            prioridade: "recomendado",
            ordem: 4,
            imagem: "/images/godzilla-head-shinjuku.webp",
            imagemAlt: "Cabeça do Godzilla na varanda do Hotel Gracery, em Kabukicho",
          },
          {
            title: "Kabukicho",
            description:
              "Maior distrito de entretenimento noturno de Tóquio, com neons, bares temáticos e vida noturna intensa.",
            prioridade: "recomendado",
            ordem: 5,
            imagem: "/images/kabukicho.webp",
            imagemAlt: "Arco de neon vermelho na entrada de Kabukicho Ichibangai, com movimento de pedestres à noite",
            imagemPosicao: "top",
          },
          {
            title: "Golden Gai",
            description:
              "Rede de vielas estreitas com mais de 200 bares minúsculos, a maioria com capacidade para menos de 10 pessoas — vale caminhar pelas vielas à tarde para conhecer a arquitetura, mas a maioria dos bares só abre à noite (após 20h), quando o roteiro já recomenda estar a caminho da estação para o Shinkansen.",
            prioridade: "opcional",
            ordem: 6,
            imagem: "/images/golden-gai.webp",
            imagemAlt: "Viela estreita do Golden Gai à noite, com lanternas e placas iluminadas dos bares",
            imagemPosicao: "center 40%",
          },
          {
            title: "Onsen Thermae-Yu",
            description:
              "Onsen urbano aberto 24 horas no coração de Kabukicho, ao lado do Golden Gai — água termal natural trazida diariamente de Nakaizu, com banhos internos e ao ar livre, banho carbonatado e saunas. Só cabe no dia se você decidir ficar mais uma noite em Tóquio em vez de seguir para Kyoto no fim da tarde, já que consome bem mais tempo do que o previsto pelo roteiro recomendado de hoje.",
            prioridade: "opcional",
            ordem: 7,
            imagem: "/images/thermae-yu.webp",
            alerta:
              "Documento obrigatório na entrada: leve o passaporte físico (cópia ou foto no celular normalmente não são aceitas). Para quem tem tatuagem, o passaporte também é usado para liberar, na recepção, o adesivo impermeável de cobertura (~¥310) — tatuagens grandes podem ser recusadas, vale confirmar a política vigente antes de ir.",
          },
        ],
        gastronomia: {
          alerta:
            "Esta seção vale para quem decidir ficar mais uma noite em Tóquio em vez de seguir para Kyoto no fim da tarde. Golden Gai tem ~280 bares minúsculos (4–10 lugares cada) — muitos não recebem estrangeiros ou cobram taxa de mesa/otsumami (aperitivo obrigatório) além do valor da bebida. Os bares abaixo foram selecionados justamente por serem abertamente foreign-friendly. Leve dinheiro: vários não aceitam cartão.",
          itensLabel: "Bares selecionados em Golden Gai — foreign-friendly",
          itens: [
            {
              nome: "Albatross G",
              descricao:
                "Clássico de 3 andares (com terraço no 3º) para começar a noite — staff e cardápio em inglês, drinks autorais. Cover ¥500.",
              localizacao: "19h–5h",
            },
            {
              nome: "Bar Araku",
              descricao:
                "Dono australiano, espaço maior que a média de Golden Gai (com sofás, não só banquinhos), boa seleção de whisky. Sem cover.",
              localizacao: "19h–4h",
            },
            {
              nome: "Cambiare",
              descricao:
                "Ambientado no filme de terror \"Suspiria\" (1977) — e serve pizza, incomum para os padrões de Golden Gai. Algum inglês falado. Sem cover.",
              localizacao: "seg–qui 18h–2h · sex–sáb 18h–5h",
            },
            {
              nome: "Bar Asyl",
              descricao:
                "Intimista, 7 lugares, dono fala inglês — whisky japonês e licor de ameixa caseiro. A experiência mais \"Golden Gai clássico\" da lista. Sem cover.",
              localizacao: "20h–5h",
            },
            {
              nome: "TOTO Bar Shinjuku",
              descricao:
                "Bar de sakês com seleção rotativa por província, harmonizados com petiscos sazonais de frutos do mar — bom para quem quer comer algo além de bebida. Inglês limitado. Cover ¥500.",
              localizacao: "18h–3h",
            },
          ],
          curadoriaLabel: "Opções selecionadas — se ficar mais uma noite, jantar antes dos bares (~19h)",
          curadoria: [
            {
              nome: "Katsu Pulipo",
              papel: "Melhor nota (mais aclamado)",
              categoria: "Tonkatsu (costeleta de porco empanada)",
              descricao:
                "Tonkatsu premiado, no coração do Kabukicho — selecionado para o Tabelog 100 Best Tonkatsu em 2022, 2024 e 2026.",
              foto: "/images/katsu-pulipo.webp",
              notaTabelog: "3.90",
              numAvaliacoes: "1.389 avaliações",
              faixaPreco: "¥8.000–9.999 no jantar",
              distancia: "Dentro do Kabukicho — ~3 min a pé da Saída Leste da Estação Shinjuku",
              foreignFriendly:
                "Alto — reserva online em inglês (inclusive via KKday e TakeMe), ampla presença em guias internacionais.",
              horario: "18h–23h (último pedido de comida 21h30) — fechado no fim/início de ano",
              reserva: "Obrigatória — 1 bebida mínima por pessoa no jantar",
              pagamento: "Cartão, IC card e QR code (PayPay, Rakuten Pay) aceitos",
              linkTabelog: "https://tabelog.com/en/tokyo/A1304/A130401/13264309/",
            },
            {
              nome: "Nakizakana Shinjuku ten hanare",
              papel: "Experiência mais especial",
              categoria: "Izakaya de frutos do mar",
              descricao:
                "Peixe fresco entregue diariamente por pescadores parceiros, com vários modos de preparo à escolha — foge do padrão carne/ramen dos outros dois dias já preenchidos.",
              foto: "/images/nakizakana-shinjuku.webp",
              economico: true,
              notaTabelog: "3.57",
              numAvaliacoes: "815 avaliações",
              faixaPreco: "¥5.000–7.999 no jantar",
              distancia:
                "Nishi-Shinjuku, ~3 min a pé da Saída Sul da Estação Shinjuku — trajeto curto de trem ou táxi até Golden Gai (não é a pé)",
              foreignFriendly:
                "Alto — reserva online pelo Tabelog, pagamento em IC card e QR code aceito, boa presença em plataformas internacionais de reserva.",
              horario:
                "seg–sex 17h–23h (fins de semana e feriados abre 16h) — último pedido 22h",
              reserva: "Obrigatória — reserva online",
              pagamento: "Cartão, IC card e QR code (PayPay, d Barai, Rakuten Pay, au PAY) aceitos",
              linkTabelog: "https://tabelog.com/en/tokyo/A1304/A130401/13180803/",
            },
            {
              nome: "Sugoi Niboshi Ramen Nagi — Golden Gai honkan",
              papel: "Mais prático",
              categoria: "Ramen (niboshi/sardinha-seca)",
              descricao:
                "A loja original da rede Nagi, dentro do próprio Golden Gai — casa de nascimento do ramen de niboshi que deu fama internacional à marca.",
              foto: "/images/sugoi-niboshi-ramen-nagi.webp",
              economico: true,
              notaTabelog: "3.64",
              numAvaliacoes: "3.485 avaliações",
              faixaPreco: "¥1.000–1.999 por pessoa",
              distancia: "Dentro do Golden Gai (2F) — ~3 min a pé da Estação Shinjuku-sanchome, Saída E2",
              foreignFriendly:
                "Médio — sem cardápio em inglês confirmado, mas rede conhecida internacionalmente, prato simples de pedir.",
              horario: "Aberto 24h, todos os dias",
              nivelFila: "Fila comum — balcão com só 10 lugares em L, muito procurado",
              reserva: "Não aceita reservas — só balcão",
              pagamento: "Dinheiro, IC card e QR code aceitos",
              linkTabelog: "https://tabelog.com/en/tokyo/A1304/A130401/13054766/",
            },
          ],
          mapa: {
            titulo: "Mapa — Refeições em Shinjuku",
            imagem: "/images/placeholder-em-producao.webp",
            imagemAlt: "Mapa de restaurantes em Shinjuku — em produção",
          },
        },
        banheirosProximos: [
          {
            local: "Banheiro público da Estação Seibu-Shinjuku",
            endereco: "1-30 Kabukicho — bem no centro do bairro",
            nota: "Aberto 24h, é a opção mais rápida durante a noite em Kabukicho.",
          },
          {
            local: "Shiki no Michi (viela de pedestres)",
            endereco: "Colado ao Golden Gai",
            nota: "Os bares minúsculos do Golden Gai raramente têm banheiro próprio — este é o ponto de apoio mais próximo enquanto o grupo estiver nas vielas.",
          },
        ],
      },
    ],
  },
  transporte: {
    linha: "Shinkansen Tokyo–Kyoto",
    tempo: "Hikari: ~2h40 (incluso no JR Pass)",
    recomendacao:
      "Recomendamos sair de Shinjuku por volta das 16h e pegar o Shinkansen no fim da tarde — sem esperar a noite virar em Shinjuku — para aproveitar o Kiyomizu-dera logo cedo no dia seguinte, antes das aglomerações.",
  },
};

const DAY_4: DayContent = {
  day: 2,
  city: "Tokyo",
  date: "06 Mai",
  hotel: "Tokyo 1",
  contexto: [
    "No dia de hoje teremos 3 atrações principais: Akihabara, Kanda e Roppongi.",
    "Akihabara é o centro da cultura de anime & mangá, é onde estão a maior concentração de lojas especializadas desde livrarias, lojas que vendem action figure a lojas que vendem produtos que tem importante intersecção com o tema como por exemplo Trading Card Games. Além do território e anime e mangá, Akihabara também possui uma enorme concentração de lojas que vendem eletrônicos, desde videogames, peças de computador e linha branca de eletrodomésticos.",
    "O dia inteiro — manhã e tarde — é dedicado a Akihabara, sem pressa de cumprir um roteiro apertado. A única saída do bairro é à noite, para jantar num izakaya autêntico em Kanda, bairro vizinho e não turístico, frequentado pelos trabalhadores e moradores da região.",
    "Por fim, encerramos o dia visitando o bairro de Roppongi, um dos dois bairros de maior concentração de baladas e PUBs de Tokyo, e iremos visitar uma balada a sua escolha, R3 Club Lounge ou V2 Tokyo.",
  ],
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "08:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "09:15", foto: "/images/icone-hotel2.webp" },
      { titulo: "Akihabara Electric Town", horario: "09:45", foto: "/images/akihabara-miniatura.webp" },
      { titulo: "Almoço", horario: "12:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Continuação em Akihabara", horario: "13:30", foto: "/images/akihabara-miniatura.webp" },
      { titulo: "Jantar no Izakaya (Kanda)", horario: "19:00", foto: "/images/dia7-izakaya-kanda-v2.webp" },
      { titulo: "Vida Noturna em Roppongi", horario: "21:30", foto: "/images/roppongi-miniatura.webp" },
    ],
  },
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
        horario: "12:00",
        evento: "Almoço com curry japonês em Akihabara",
        tag: "Refeição",
      },
      {
        horario: "13:30",
        evento: "Continuação do circuito em Akihabara, sem pressa",
        tag: "Atração",
      },
      {
        horario: "18:30",
        evento: "Deslocamento até Kanda para o jantar (poucos minutos, trem local)",
        tag: "Deslocamento",
      },
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
  diaEmNumeros: {
    atracoes: "3 atrações principais",
    caminhada: "A definir",
    transporte: "~13 min de trem no total",
    linhasMetro: "3 linhas, 1 baldeação",
    ritmo: "Moderado",
    saida: "09:15",
    retorno: "A definir",
  },
  manha: {
    label: "Manhã + Tarde",
    percursoEssencial: {
      duracao: "~5h45 (Akihabara — dia inteiro, manhã e tarde)",
      passos: [
        {
          titulo: "Akihabara Radio Kaikan",
          foto: "/images/day2-radiokaikan.webp",
          horario: "09:45",
          descricao: "Action figures e um shopping com um pouco de tudo — logo na saída Electric Town da estação, o primeiro ponto do passeio.",
        },
        {
          titulo: "Tamashii Nations Store Tokyo",
          foto: "/images/day2-tamashii-nations.webp",
          horario: "~10:15",
          descricao: "Loja oficial da Bandai Spirits com as linhas premium de action figures e colecionáveis (Figuarts, Chogokin) — peças voltadas para colecionadores.",
        },
        {
          titulo: "Animate",
          foto: "/images/day2-animate.webp",
          horario: "~10:45",
          descricao: "Uma das maiores redes de lojas de mangá do Japão.",
        },
        {
          titulo: "Mandarake Complex",
          foto: "/images/day2-mandarake-complex.webp",
          horario: "~11:15",
          descricao: "Mangá e action figures.",
        },
        {
          titulo: "Suruga-ya Anime & Hobby Store",
          foto: "/images/day2-surugaya.webp",
          horario: "~11:45",
          descricao: "Rede tradicional de usados — mangás, DVDs/Blu-rays de anime, action figures e CDs, com preços mais em conta que as lojas de produto novo.",
        },
        {
          titulo: "Super Potato",
          foto: "/images/day2-superpotato.webp",
          horario: "13:30",
          descricao: "Loja retrô de videogames.",
        },
        {
          titulo: "Hareruya 2",
          foto: "/images/hareruya-2.webp",
          horario: "~14:15",
          descricao: "Pokémon Trading Card Game.",
        },
        {
          titulo: "Weird Vending Machine Corner",
          foto: "/images/weird-vending-machine-corner.webp",
          horario: "~15:00",
          descricao: "Cantinho com máquinas de venda automática bizarras e inusitadas, um clássico despretensioso de Akihabara.",
        },
        {
          titulo: "BIC Camera ou Yodobashi Camera",
          foto: "/images/day2-yodobashi-akiba.webp",
          horario: "~15:30",
          descricao: "Grandes lojas de eletrônicos — Yodobashi-Akiba fica do lado leste da estação (saída Showa-dori), um bom fechamento para o circuito antes de descansar no hotel.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Akihabara Electric Town",
      imagem: "/images/raiox-akihabara.webp",
      imagemAlt: "Raio-X Alpinea de Akihabara com os pontos de interesse numerados do passeio",
      comentarios: [
        "Embora o número de lojas para visitar não seja muito grande, é importante seguir a ordem recomendada ou olhar o mapa e definir a ordem que preferir — pode não parecer, mas como algumas lojas têm vários andares, ao final da tarde você vai estar bem cansado de subir escadas e se deslocar de loja em loja.",
        "Separamos uma variedade grande de lojas — mangá/anime, videogames, action figures e uma galeria com bastante diversidade entre si.",
        "A Yodobashi-Akiba é opcional: é uma grande loja de departamento de eletrônicos, com andares dedicados a temas diferentes.",
        "A Weird Vending Machine Corner foi incluída como curiosidade, já que você mencionou ter trabalhado com esse tipo de máquina — vale dar uma passada em frente e ver se algo chama sua atenção. A maioria das máquinas está quebrada, e há várias vendendo produtos bizarros que não se encontram em mais nenhum outro lugar. Tome cuidado com espaços apertados e com poeira/sujeira, já que o local também funciona como ponto de descarte de máquinas antigas.",
      ],
    },
    regiao: {
      nome: "Akihabara · Tokyo",
      descricao:
        "Bairro de Chiyoda que virou epicentro mundial da cultura otaku — lojas de eletrônicos, anime, mangá e videogame concentradas em poucas quadras ao redor da estação, entre vitrines de colecionador e torres cobertas de neon. O circuito do dia inteiro cabe a pé, sem pressa de seguir uma ordem fixa.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Kyobashi",
        nomeJapones: "京橋駅",
        distancia: "~1 min a pé do hotel",
        saida: "Saída 6",
        foto: "/images/Kyobashi_Station_entrance_7_20170813.webp",
      },
      linha: { codigo: "G10", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.webp" },
      baldeacao: true,
      estacaoDestino: {
        nome: "Estação Akihabara",
        nomeJapones: "秋葉原駅",
        saida: "Saída Electric Town",
        foto: "/images/akihabara-station.webp",
      },
      // Estações da Ginza Line entre Kyobashi (G10) e o ponto de baldeação
      // Ueno-hirokoji (G15) — de lá, troca a pé pra Naka-okachimachi (Hibiya
      // Line, H17) e segue 1 parada até Akihabara (H16), sem mais estações
      // no meio desse segundo trecho.
      estacoesIntermediarias: [
        { nome: "Nihombashi", nomeJapones: "日本橋駅", numero: "G11" },
        { nome: "Mitsukoshimae", nomeJapones: "三越前駅", numero: "G12" },
        { nome: "Kanda", nomeJapones: "神田駅", numero: "G13" },
        { nome: "Suehirocho", nomeJapones: "末広町駅", numero: "G14" },
        { nome: "Ueno-hirokoji (baldeação)", nomeJapones: "上野広小路駅", numero: "G15" },
      ],
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈11 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Ginza Line (G10 → G15) até Ueno-hirokoji + baldeação a pé até a Estação Naka-okachimachi (Hibiya Line, H17) + 1 parada até Akihabara (H16).",
            "Uma baldeação simples, bem sinalizada — Ueno-hirokoji e Naka-okachimachi fazem parte do mesmo complexo de estações interligadas (junto com Ueno-okachimachi, do Toei Oedo Line).",
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
        "Do lyf Ginza Tokyo, o trajeto até Akihabara é de cerca de 11 minutos: Ginza Line (G10 → G15, Ueno-hirokoji) e uma baldeação curta a pé até a Naka-okachimachi (H17), seguindo 1 parada na Hibiya Line até Akihabara (H16).",
      mapaAndares: {
        titulo: "Mapa da Estação Akihabara",
        mapas: [
          { andar: "1F", imagem: "/images/mapa-estacao-akiharaba-1F.webp", imagemAlt: "Mapa do 1º andar da Estação Akihabara" },
          { andar: "2F", imagem: "/images/mapa-estacao-akihabara-2F.webp", imagemAlt: "Mapa do 2º andar da Estação Akihabara" },
          { andar: "3F", imagem: "/images/mapa-estacao-akihabara-3F.webp", imagemAlt: "Mapa do 3º andar da Estação Akihabara" },
        ],
      },
    },
    atracaoPrincipal: "Akihabara Electric Town",
    atracaoPrincipalImagem: "/images/dia7-akihabara.webp",
    detalhesPraticos: [
      { label: "Horário das lojas", valor: "Varia por loja — ver detalhamento abaixo" },
      {
        label: "Pagamento",
        valor:
          "Leve dinheiro — boa parte das lojas menores e de usados em Akihabara não aceita cartão.",
      },
      {
        label: "Tax-free",
        valor:
          "A partir de nov/2026 o sistema mudou: paga-se o preço cheio na loja (mínimo ¥5.000 em compras no mesmo dia/estabelecimento) e o reembolso do imposto só é processado na saída do país, num terminal alfandegário do aeroporto ou pelo Visit Japan Web — não há mais desconto no caixa.",
      },
      {
        label: "Melhor horário",
        horarioDestaque: "10h–11h30",
        valor:
          "Logo na abertura das lojas — o movimento na região vai aumentando ao longo do dia. O circuito termina por volta de 12h: um bom horário para almoçar logo em seguida, já que o pico do almoço local costuma ser entre 12h e 13h. O circuito continua durante toda a tarde também, sem pressa.",
      },
    ],
    horarioLojas: [
      { nome: "Akihabara Radio Kaikan", horario: "Abertura 10h · Fechamento 20h" },
      { nome: "Tamashii Nations Store Tokyo", horario: "Abertura 10h · Fechamento 20h" },
      { nome: "Animate", horario: "Abertura 10h · Fechamento 21h" },
      { nome: "Mandarake Complex", horario: "Abertura 12h · Fechamento 20h" },
      { nome: "Suruga-ya Anime & Hobby Store", horario: "Abertura 11h · Fechamento 21h (10h nos fins de semana)" },
      { nome: "Super Potato", horario: "Abertura 11h · Fechamento 22h (10h nos fins de semana)" },
      { nome: "Hareruya 2", horario: "Abertura 10h · Fechamento 22h" },
      { nome: "BIC Camera / Yodobashi-Akiba", horario: "Abertura 9h30 · Fechamento 22h" },
    ],
    mapaVisaoGeral: {
      imagem: "/images/akihabara-tempo-de-deslocamento.webp",
      imagemAlt: "Trajeto a pé conectando os pontos de interesse de Akihabara Electric Town",
      nota: "≈30 min · 2,1 km — trajeto completo a pé conectando os 9 pontos de interesse do dia inteiro em Akihabara (manhã e tarde), sem pressa de fazer tudo na ordem: ajuste conforme o ritmo do grupo.",
    },
    pois: [
      {
        category: "Compras",
        title: "Akihabara Radio Kaikan",
        description:
          "Action figures e um shopping com um pouco de tudo — logo na saída Electric Town da estação, o primeiro ponto do passeio.",
        prioridade: "opcional",
        ordem: 1,
        imagem: "/images/day2-radiokaikan.webp",
        imagemAlt: "Fachada da Akihabara Radio Kaikan",
        horario: "10h–20h",
      },
      {
        category: "Compras",
        title: "Tamashii Nations Store Tokyo",
        description:
          "Loja oficial da Bandai Spirits dedicada às linhas premium de action figures e colecionáveis (Figuarts, Chogokin) — peças de alta qualidade voltadas para colecionadores.",
        prioridade: "recomendado",
        ordem: 2,
        imagem: "/images/day2-tamashii-nations.webp",
        imagemAlt: "Vitrine de action figures na Tamashii Nations Store Tokyo",
        horario: "10h–20h",
      },
      {
        category: "Compras",
        title: "Animate",
        description: "Uma das maiores redes de lojas de mangá do Japão.",
        prioridade: "recomendado",
        ordem: 3,
        imagem: "/images/day2-animate.webp",
        imagemAlt: "Fachada da loja Animate em Akihabara",
        horario: "10h–21h",
      },
      {
        category: "Compras",
        title: "Mandarake Complex",
        description: "Mangá e action figures.",
        prioridade: "recomendado",
        ordem: 4,
        imagem: "/images/day2-mandarake-complex.webp",
        imagemAlt: "Interior da Mandarake Complex em Akihabara",
        horario: "12h–20h",
      },
      {
        category: "Compras",
        title: "Suruga-ya Anime & Hobby Store",
        description:
          "Rede tradicional de usados — mangás, DVDs/Blu-rays de anime, action figures e CDs, com preços mais em conta que as lojas de produto novo.",
        prioridade: "opcional",
        ordem: 5,
        imagem: "/images/day2-surugaya.webp",
        imagemAlt: "Fachada da Suruga-ya Specialty Store em Akihabara",
        horario: "11h–21h (10h nos fins de semana)",
      },
      {
        category: "Compras",
        title: "Super Potato",
        description: "Loja retrô de videogames.",
        prioridade: "recomendado",
        ordem: 6,
        imagem: "/images/day2-superpotato.webp",
        imagemAlt: "Interior da loja retrô Super Potato em Akihabara",
        horario: "11h–22h (10h nos fins de semana)",
      },
      {
        category: "Compras",
        title: "Hareruya 2",
        description: "Pokémon Trading Card Game.",
        prioridade: "opcional",
        ordem: 7,
        imagem: "/images/hareruya-2.webp",
        imagemAlt: "Fachada da Hareruya 2, loja especializada em Pokémon Trading Card Game",
        horario: "10h–22h",
      },
      {
        category: "Curiosidade",
        title: "Weird Vending Machine Corner",
        description: "Cantinho com máquinas de venda automática bizarras e inusitadas, um clássico despretensioso de Akihabara.",
        prioridade: "opcional",
        ordem: 8,
        imagem: "/images/weird-vending-machine-corner.webp",
        imagemAlt: "Máquinas de venda automática no Weird Vending Machine Corner de Akihabara",
        imagemPosicao: "center bottom",
        horario: "Acessível a qualquer hora (máquinas na rua, sem loja formal)",
      },
      {
        category: "Compras",
        title: "BIC Camera ou Yodobashi Camera",
        description:
          "Grandes lojas de eletrônicos — Yodobashi-Akiba fica do lado leste da estação (saída Showa-dori), um bom último ponto antes de descansar no hotel.",
        prioridade: "opcional",
        ordem: 9,
        imagem: "/images/day2-yodobashi-akiba.webp",
        imagemAlt: "Fachada da Yodobashi-Akiba",
        horario: "9h30–22h",
      },
    ],
    gastronomia: {
      curadoriaLabel: "Opções selecionadas — Refeição",
      curadoria: [
        {
          nome: "Jotou Curry Akihabara ten",
          papel: "Mais tradicional",
          categoria: "Curry japonês",
          descricao:
            "Casa tradicional da região, com balcão no térreo e mesas no subsolo — curry japonês simples e caseiro, servido rápido.",
          foto: "/images/joto-curry-akihabara.webp",
          notaTabelog: "3.28",
          numAvaliacoes: "289 avaliações",
          faixaPreco: "¥1.000–1.999 (almoço e jantar)",
          distancia: "~2 min a pé da Estação Suehirocho (Tokyo Metro Ginza Line)",
          foreignFriendly: "Baixo — sem cardápio em inglês confirmado, mas prato simples de pedir (curry com cortes à escolha).",
          horario: "seg–sex 11h–22h · sáb–dom 11h–20h",
          reserva: "Não aceita reservas",
          pagamento: "Somente dinheiro — não aceita cartão, IC card nem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1311/A131101/13197290/",
          alerta: "Só dinheiro — leve ienes em espécie.",
        },
        {
          nome: "Tonkatsu Wakou Yodobashi Akiba ten",
          papel: "Melhor custo-benefício",
          categoria: "Tonkatsu (costeleta de porco empanada)",
          descricao:
            "Filial da tradicional rede Wako, dentro do complexo da Yodobashi-Akiba — ampla gama de pagamentos e fácil de pedir por foto no cardápio.",
          foto: "/images/wako-tonkatsu-akihabara.webp",
          notaTabelog: "3.08",
          numAvaliacoes: "79 avaliações",
          faixaPreco: "¥1.000–2.999 (almoço e jantar)",
          distancia: "~1 min a pé da Estação Akihabara (79 m)",
          foreignFriendly: "Alto — dentro do complexo Yodobashi-Akiba, ampla gama de pagamentos aceitos.",
          horario: "11h–23h (último pedido 22h)",
          reserva: "Não aceita reservas",
          pagamento: "Cartão (Visa, Master, JCB, Amex, Diners), IC card (Suica), Rakuten Edy, iD, QUICPay e QR code (PayPay, d払い, Rakuten Pay, au PAY) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1310/A131001/13268426/",
          economico: true,
        },
        {
          nome: "Kyushu Jangara Ramen (Akihabara Honten)",
          papel: "Mais popular (a mais avaliada)",
          categoria: "Ramen estilo Kyushu (Hakata)",
          descricao:
            "A casa principal da rede, conhecida internacionalmente e também por opções veganas — a mais avaliada das três, com fila ocasional no horário de pico.",
          foto: "/images/kyushu-jangara.webp",
          notaTabelog: "3.47",
          numAvaliacoes: "643 avaliações",
          faixaPreco: "¥1.000–1.999 (almoço e jantar)",
          distancia: "~3 min a pé da Estação Suehirocho (Saída 3, Ginza Line) — também ~6–8 min da Estação Akihabara",
          foreignFriendly: "Médio — cartão e IC card aceitos (sem QR code); rede bem conhecida internacionalmente, com opções veganas.",
          horario: "11h–22h (último pedido 21h45)",
          reserva: "Não aceita reservas",
          pagamento: "Cartão (Visa, Master) e IC card (ex.: Suica) aceitos — sem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1310/A131001/13000344/",
        },
      ],
    },
    banheirosProximos: [
      {
        local: "Estação Akihabara (JR / Tokyo Metro)",
        endereco: "Dentro da própria estação, perto das catracas",
        nota: "Disponível nos dois lados da estação (saída Electric Town e saída Showa-dori) — a opção mais prática enquanto estiver circulando pela região.",
      },
    ],
    subAtracoes: [
      {
        label: "Jantar",
        titulo: "Izakaya em Kanda",
        descricao:
          "Depois de um dia inteiro em Akihabara, a única saída do bairro é à noite: um jantar num izakaya autêntico em Kanda, bairro vizinho e não turístico, a partir das 18h — ~¥4.000–6.000 por pessoa.",
        deslocamento: {
          estacaoOrigem: {
            nome: "Estação Akihabara",
            nomeJapones: "秋葉原駅",
            saida: "Saída Electric Town",
            foto: "/images/akihabara-station.webp",
          },
          linha: { codigo: "JY", nome: "JR Yamanote / Keihin-Tohoku Line", cor: "#8FAADC", logo: "/images/jr-logo.webp" },
          estacaoDestino: {
            nome: "Estação Kanda",
            nomeJapones: "神田駅",
            saida: "Saída Oeste (Nishiguchi)",
            foto: "/images/kanda-station-entrance.webp",
            mapa: "/images/kanda-station-map.webp",
            mapaAlt: "Mapa da Estação Kanda (1F e 2F)",
          },
          opcoes: [
            {
              meio: "Trem JR",
              tempo: "≈2 min",
              Icon: IconMetro,
              recomendado: true,
              detalhes: [
                "Uma estação de distância, sem baldeação — Akihabara (JY03) até Kanda (JY02).",
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
            "Akihabara e Kanda são bairros vizinhos — uma estação de trem (~2 min) ou uma caminhada tranquila de ~15 min. Bom horário para sair do circuito de Akihabara: por volta das 18h30, para o jantar às 19h.",
        },
        visaoAnotada: {
          titulo: "Izakayas em Kanda",
          imagem: "/images/raiox-kanda.webp",
          imagemAlt: "Raio-X Alpinea de Kanda com os 3 izakayas recomendados numerados nas proximidades da Estação Kanda",
          comentarios: [
            "A passagem por Kanda é propositalmente mais tranquila — um respiro depois do dia inteiro em Akihabara. Separamos 3 opções de izakaya que normalmente recebem bem estrangeiros, todas a poucos minutos da estação.",
            "Kanda não é um bairro turístico — a ideia aqui é te aproximar de como os trabalhadores da região se encontram no fim do dia, nos izakayas ao redor da estação de metrô. Vale visitar mais de um se quiser.",
          ],
        },
        poisLabel: "Izakayas recomendados",
        pois: [
          {
            title: "Kanda Nishiguchi Motsuyaki Nonki",
            description: "Motsuyaki (espetinhos de miúdos grelhados) — ~2 min a pé da saída oeste da Estação Kanda.",
            prioridade: "recomendado",
            ordem: 1,
            imagem: "/images/nonki-kanda.webp",
            imagemAlt: "Prato de motsuyaki do Kanda Nishiguchi Motsuyaki Nonki",
          },
          {
            title: "Kanda Uokin",
            description: "Izakaya de frutos do mar, conhecida pelos pratos fartos de sashimi e peixe fresco.",
            prioridade: "recomendado",
            ordem: 2,
            imagem: "/images/uokin.webp",
            imagemAlt: "Prato de sashimi do Kanda Uokin",
          },
          {
            title: "Kanda Shoten",
            description: "Izakaya de bairro com sashimi e boa seleção de sakês — clima local e despretensioso.",
            prioridade: "recomendado",
            ordem: 3,
            imagem: "/images/kanda-shouten.webp",
            imagemAlt: "Prato de sashimi e sakês do Kanda Shoten",
          },
          {
            category: "Cultura",
            title: "Livrarias de Jinbocho",
            description:
              "Bairro vizinho a Kanda, famoso por concentrar dezenas de sebos e livrarias tradicionais — o maior distrito de livros usados do Japão.",
            prioridade: "opcional",
            ordem: 4,
            imagem: "/images/jinbocho.webp",
            imagemAlt: "Fachada de livraria tradicional em Jinbocho",
          },
        ],
        banheirosProximos: [
          {
            local: "Estação Kanda (JR)",
            endereco: "Dentro da própria estação, perto das catracas",
            nota: "A opção mais prática nas imediações — a maioria dos izakayas da região é pequena e pode não ter banheiro para clientes.",
          },
        ],
      },
      {
        label: "Noite",
        titulo: "R3 Club Lounge ou V2 Tokyo (Roppongi)",
        descricao:
          "Bairro badalado de Tóquio que reúne o Mori Tower, seus museus e jardins, e a vida noturna de Roppongi — principal polo de baladas e bares da cidade.",
        deslocamento: {
          estacaoOrigem: {
            nome: "Estação Kanda",
            nomeJapones: "神田駅",
            saida: "Saída Oeste (Nishiguchi)",
            foto: "/images/kanda-station-entrance.webp",
          },
          linha: { codigo: "G13→G09", nome: "Tokyo Metro Ginza Line", cor: "#F39700", logo: "/images/tokyometro-mark.webp" },
          baldeacao: true,
          estacaoDestino: {
            nome: "Estação Roppongi",
            nomeJapones: "六本木駅",
            saida: "Saída 7",
            foto: "/images/roppongi-station.webp",
            mapa: "/images/roppongi-station-map.webp",
            mapaAlt: "Mapa da Estação Roppongi (Hibiya Line e Toei Oedo Line)",
          },
          opcoes: [
            {
              meio: "Metrô",
              tempo: "≈26 min",
              Icon: IconMetro,
              recomendado: true,
              detalhes: [
                "Ginza Line (G13 → G09, Ginza) + baldeação para a Hibiya Line até Roppongi (H04) — ~10 min nesse trecho.",
                "¥210 · 1 baldeação.",
              ],
            },
            {
              meio: "Táxi / Carro",
              tempo: "≈15–20 min",
              Icon: IconCar,
              detalhes: [
                "Trajeto direto, sem baldeação — boa opção à noite, depois do jantar.",
                "Sujeito a trânsito, mas mais tranquilo do que pegar trem tarde da noite.",
              ],
            },
          ],
          recomendacao:
            "De Kanda, o trajeto até Roppongi é de cerca de 26 minutos: Ginza Line até Ginza (7 min) e baldeação para a Hibiya Line até Roppongi (10 min) — ¥210.",
        },
        visaoAnotada: {
          titulo: "Roppongi",
          imagem: "/images/raiox-roppongi.webp",
          imagemAlt: "Raio-X Alpinea de Roppongi com Mori Tower, Tokyo Midtown, TV Asahi, a Estação Roppongi e os pontos de vida noturna numerados",
          comentarios: [
            "A ideia é vir para Roppongi depois de concluir as atividades do dia. Pelo roteiro, você deve terminar o fim de tarde/noite em Kanda e, de lá, seguir para esta região.",
            "Embora o objetivo principal da noite sejam as baladas de Roppongi, vale chegar um pouco mais cedo e aproveitar para caminhar pelo bairro. No mapa, destacamos alguns dos principais pontos da região.",
            "Você pode passar pela Mori Tower, no coração de Roppongi Hills, e conhecer um pouco dos arredores. Dependendo do horário em que chegar, algumas atrações já podem estar fechadas, mas a região por si só já vale a caminhada.",
            "Outra opção é seguir até Tokyo Midtown, um grande complexo que reúne shopping, restaurantes, o Hinokicho Park e o Ritz-Carlton Tokyo. Roppongi é também uma importante região empresarial e financeira de Tóquio, então é interessante simplesmente caminhar por aqui e observar esse lado mais moderno e cosmopolita da cidade.",
            "Se encontrar algum museu, exposição ou lugar que desperte seu interesse e já estiver fechado, considere voltar em outro dia com mais tempo.",
            "Sobre as baladas: antes de sair, uma informação importante — não esqueça de levar seu passaporte. Ele pode ser solicitado na entrada das casas noturnas.",
            "No guia, trouxemos um comparativo entre nossas duas principais recomendações: R3 Club Lounge e V2 Tokyo. Apesar de ficarem praticamente uma em frente à outra, elas possuem propostas e públicos diferentes. Você pode escolher aquela que mais combina com você ou, se quiser experimentar ambientes diferentes na mesma noite, começar em uma e depois seguir para a outra.",
            "E não precisa se limitar às duas sugestões. Roppongi concentra diversas outras casas noturnas, muitas delas relativamente próximas umas das outras. Se estiver gostando da região, vale caminhar um pouco, observar o movimento e conhecer outras opções antes de decidir onde passar o restante da noite.",
            "As duas casas destacadas no guia são nossas recomendações principais, mas encare-as como pontos de partida, não como uma obrigação. Roppongi é justamente um daqueles bairros em que você pode explorar a região e escolher o lugar que mais combina com o clima que procura naquela noite.",
          ],
        },
        alerta: {
          titulo: "Documento Obrigatório",
          horario: "Leve o passaporte físico",
          mensagem:
            "Baladas em Roppongi exigem identificação com foto na entrada — para estrangeiros, o passaporte físico é a opção aceita (foto no celular ou cópia não costumam servir). A idade mínima no Japão é 20 anos, sem exceções.",
        },
        comparacao: {
          titulo: "Comparação Rápida",
          colunas: ["R3 Club Lounge", "V2 TOKYO"],
          badges: ["Melhor para uma noite sofisticada", "Melhor para festa & dancefloor"],
          conclusao: [
            "R3 → escolha se você valoriza drinks, conversa, ambiente premium e uma noite mais adulta.",
            "V2 → escolha se você quer pista, energia, multidão e uma experiência de nightclub até tarde.",
          ],
          grupos: [
            {
              titulo: "Experiência",
              linhas: [
                { label: "Tipo de experiência", valores: ["Lounge + nightlife adulto", "Nightclub grande"] },
                { label: "Energia da noite", pontos: [3, 5] },
                { label: "Vibe / atmosfera", valores: ["Sofisticado/social", "Festa/espetáculo"] },
                { label: "Horário ideal de chegada", valores: ["20h30–22h30", "23h30 em diante"] },
              ],
            },
            {
              titulo: "Público & Social",
              linhas: [
                { label: "Socializar / conversar", estrelas: [4, 1] },
                { label: "Dancefloor", estrelas: [3, 5] },
                {
                  label: "Mix local × internacional",
                  valores: ["Maioria internacional, com japoneses no bar/mesas", "Internacional + local, mix mais equilibrado"],
                },
                { label: "Bom para casal", estrelas: [5, 3] },
                {
                  label: "Experiência solo",
                  valores: ["Boa — clima de bar/lounge favorece puxar conversa", "Boa para curtir a pista, menos natural pra conversar"],
                },
                { label: "Faixa etária predominante", valores: ["30–50 anos", "20–35 anos"] },
              ],
            },
            {
              titulo: "Para o Estrangeiro",
              linhas: [
                { label: "Facilidade para estrangeiros", estrelas: [5, 5] },
                {
                  label: "Barreira de idioma",
                  valores: [
                    "Fácil — equipe acostumada a receber estrangeiros",
                    "Razoavelmente fácil — ambiente mais alto, comunicação mais gestual",
                  ],
                },
                {
                  label: "Dress code",
                  valores: ["Smart casual a upscale — sem rigidez extrema", "Fashionable / clubwear — evite chinelo e moletom"],
                },
                {
                  label: "Entrar sem reserva",
                  valores: [
                    "Costuma dar — grupos grandes saem na frente reservando",
                    "Pode ter fila em horário de pico — reservar mesa evita",
                  ],
                },
                { label: "Primeira experiência de nightlife em Tóquio", estrelas: [5, 4] },
                {
                  label: "Comparável a",
                  valores: [
                    "Rooftop lounge sofisticado de Nova York ou members club de Londres, sem a mesma exclusividade",
                    "Megaclub de Ibiza ou Miami, em formato mais compacto",
                  ],
                },
              ],
            },
            {
              titulo: "Premium",
              linhas: [
                { label: "Experiência VIP", valores: ["Mais intimista", 'Mais "show/bottle service"'] },
                {
                  label: "Bottle service / mesa",
                  valores: ["Disponível — foco maior em drinks e ambiente", "Ponto forte da casa — mesas com vista da pista e do show"],
                },
                { label: "Nível de exclusividade", valores: ["Lounge premium", "Club premium"] },
              ],
            },
          ],
          rodape: {
            titulo: "O que muda em relação à nightlife ocidental",
            itens: [
              "Documento: passaporte físico é obrigatório na entrada — foto no celular ou cópia não costumam ser aceitas. Idade mínima 20 anos, sem exceções.",
              "Horário de pico: diferente do padrão ocidental (23h–1h), em Tóquio o movimento geralmente só decola depois da 1h — chegar mais cedo garante ambiente mais tranquilo e menos fila.",
              "Idioma: inglês básico é comum entre a equipe nas casas mais turísticas de Roppongi, mas frases simples em japonês (ou o tradutor do celular) ajudam bastante.",
              "Comportamento: gorjeta não é praticada nem esperada; a aproximação social costuma ser mais gradual do que em baladas ocidentais.",
              "Mesas/bottle service: reservar com antecedência (via hotel/concierge) evita fila e garante lugar, especialmente em casas maiores como a V2.",
            ],
          },
        },
        mapaVisaoGeral: {
          imagem: "/images/visaogeral2-roppongi.webp",
          imagemAlt: "Trajeto a pé conectando as baladas de Roppongi ao Mori Tower e ao Museu de Arte Mori",
          nota: "≈20 min · 1,2 km — trajeto a pé completo pela área de Roppongi Hills, sem pressa de fazer tudo na ordem.",
        },
        pois: [
          {
            title: "Aranha Gigante de Louise Bourgeois",
            description:
              "A única no mundo preparada para terremotos, aos pés do Mori Tower — o primeiro ponto ao chegar em Roppongi Hills.",
            prioridade: "opcional",
            ordem: 1,
            imagem: "/images/aranha-gigante.webp",
            imagemAlt: "Escultura Maman, de Louise Bourgeois, aos pés do Mori Tower em Roppongi Hills",
          },
          {
            title: "Museu de Arte Moderna Mori",
            description: "Museu de arte contemporânea no topo do Mori Tower.",
            prioridade: "recomendado",
            ordem: 2,
            imagem: "/images/museu-de-arte-mori.webp",
            imagemAlt: "Escadas rolantes de acesso ao Mori Art Museum, com o letreiro do museu no topo do Mori Tower",
          },
          {
            title: "Mori Garden",
            description: "Jardim japonês tradicional aos pés do Mori Tower.",
            prioridade: "opcional",
            ordem: 3,
            imagem: "/images/mori-garden.webp",
            imagemAlt: "Lago do Mori Garden com cerejeiras floridas e o Mori Tower ao fundo, em Roppongi Hills",
          },
          {
            title: "Hinokicho Park",
            description:
              "Parque tranquilo no coração de Roppongi, a poucos minutos a pé do Mori Tower.",
            prioridade: "opcional",
            ordem: 4,
            imagem: "/images/hinokicho-park.webp",
            imagemAlt: "Escultura moderna de metal no gramado do Hinokicho Park, em Roppongi",
          },
        ],
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
  resumoDia: {
    passos: [
      { titulo: "Saída do Hotel", horario: "06:00", foto: "/images/icone-hotel2.webp" },
      { titulo: "Templo Kiyomizu-dera", horario: "06:30", foto: "/images/dia5-kiyomizudera.webp" },
      { titulo: "Café da Manhã e Doces Tradicionais", horario: "09:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Distrito de Gion", horario: "11:00", foto: "/images/dia5-gion-v2.webp" },
      { titulo: "Jantar Kaiseki ou Obanzai", horario: "19:00", foto: "/images/icone-gastronomia.webp" },
    ],
  },
  gradeHorarios: {
    titulo: "Mapa por Horário",
    itens: [
      {
        horario: "06:00",
        evento: "Ônibus 100/206 até Kiyomizu-dera",
        tag: "Deslocamento",
      },
      {
        horario: "06:20",
        evento: "Desembarque e caminhada até o templo (~10 min subindo)",
        tag: "Deslocamento",
      },
      {
        horario: "06:30",
        evento: "Templo Kiyomizu-dera",
        destaque: true,
        tag: "Atração",
      },
      { horario: "08:00", evento: "Ninenzaka e Sannenzaka" },
      {
        horario: "09:00",
        evento: "Café da manhã e doces tradicionais (matcha, yatsuhashi)",
        tag: "Refeição",
      },
      {
        horario: "10:30",
        evento: "Caminhada até Gion (~15–20 min pelas ladeiras históricas)",
        tag: "Deslocamento",
      },
      {
        horario: "11:00",
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
  diaEmNumeros: {
    atracoes: "2 atrações principais",
    caminhada: "A definir",
    transporte: "~20 min de ônibus no total",
    linhasMetro: "1 linha de ônibus, sem baldeação",
    ritmo: "Moderado",
    saida: "06:00",
    retorno: "A definir",
  },
  manha: {
    percursoEssencial: {
      duracao: "~2h30 (Kiyomizu-dera, Sannenzaka e Ninenzaka)",
      passos: [
        {
          titulo: "Templo Kiyomizu-dera",
          foto: "/images/dia5-kiyomizudera.webp",
          horario: "06:30",
          descricao: "Um dos templos mais icônicos do Japão, aos pés das colinas de Higashiyama.",
        },
        {
          titulo: "Sannenzaka",
          foto: "/images/higashiyama-sannenzaka.webp",
          horario: "~08:00",
          descricao: "Ladeira histórica de casas tradicionais, logo na descida a partir do templo.",
        },
        {
          titulo: "Ninenzaka",
          foto: "/images/higashiyama-ninenzaka.webp",
          horario: "~08:20",
          descricao: "Continuação de Sannenzaka, descendo rumo a Gion.",
        },
        {
          titulo: "Café % Arabica Kyoto Higashiyama",
          foto: "/images/higashiyama-arabica-kyoto.webp",
          horario: "09:00",
          descricao: "Cafeteria minimalista muito concorrida, a poucos passos da Pagode Yasaka.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Kiyomizu-dera & Higashiyama",
      imagem: "/images/raiox-kiyomizu-higashiyama.webp",
      imagemAlt: "Raio-X Alpinea de Kiyomizu-dera e Higashiyama com Nio-mon Gate, Sannenzaka, Ninenzaka, % Arabica, Hokan-ji e a região de Gion ao fundo",
      comentarios: [
        "Assim que você chegar a Kyoto, provavelmente vai perceber uma coisa imediatamente: Kyoto funciona de uma maneira completamente diferente de Tóquio.",
        "Em Tóquio, praticamente qualquer região importante possui uma estação de metrô ou trem próxima. Algumas estações possuem dez, quinze, vinte saídas diferentes e você consegue atravessar boa parte da cidade utilizando somente os trilhos. Em Kyoto, essa lógica muda bastante.",
        "Primeiro, entenda como se locomover em Kyoto: apesar de você estar hospedado próximo à Kyoto Station, que é uma estação enorme e extremamente bem conectada, grande parte das atrações que vamos visitar não fica convenientemente próxima de uma estação de trem ou metrô.",
        "Kyoto possui metrô e várias linhas ferroviárias, mas a cobertura é muito menos abrangente do que em Tóquio. Em determinadas regiões, principalmente conforme você se afasta do centro, as distâncias entre estações e atrações ficam consideravelmente maiores.",
        "Em alguns momentos você pode inclusive ter a sensação de ter saído completamente de uma grande cidade: bairros residenciais baixos, ruas tranquilas e estações pequenas cercadas praticamente apenas por casas. Por isso, o ônibus passa a ser muito mais importante em Kyoto.",
        "Se ainda não fez isso, recomendo fortemente que leia o Guia de Ônibus de Kyoto que deixei nos cards deste roteiro. Ele está ali especificamente porque utilizar os ônibus daqui pode ser um pouco confuso para quem acabou de chegar. O sistema funciona bem e é barato, mas exige mais atenção do que o transporte de Tóquio.",
        "Sempre que o deslocamento ficar excessivamente complicado, considere também pegar um táxi. Sei que buscamos manter um bom custo-benefício durante a viagem e, naturalmente, o ônibus será mais econômico. Mas existem trajetos em Kyoto em que o táxi pode economizar bastante tempo e simplificar muito o dia.",
        "Em Kyoto, horário é estratégia: existe outra diferença fundamental entre Kyoto e Tóquio — o impacto do turismo excessivo é muito mais perceptível aqui.",
        "Em Tóquio, talvez você tenha encontrado multidões em alguns lugares, mas, seguindo os horários que indiquei, provavelmente conseguiu evitar boa parte dos momentos mais complicados. Em Kyoto, isso passa a ser ainda mais importante.",
        "Foi justamente por isso que organizei o roteiro colocando as atrações mais sensíveis à lotação logo no começo da manhã. Quando eu digo para chegar próximo ao horário de abertura, aqui não é apenas uma sugestão para \"evitar um pouco de fila\" — pode mudar completamente a experiência do lugar. E hoje isso começa pelo Kiyomizu-dera.",
        "Kiyomizu-dera — vá direto para lá: ao sair do hotel pela manhã, minha recomendação é simples — vá primeiro ao Kiyomizu-dera e não se distraia pelo caminho. Isso é mais difícil do que parece.",
        "Conforme você se aproxima do templo, começam a aparecer ruas tradicionais, pequenas lojas, construções antigas e vários lugares que naturalmente vão chamar sua atenção. Ignore-os por enquanto.",
        "Nós vamos passar praticamente o dia inteiro nessa região e teremos tempo para voltar a essas ruas depois. A prioridade agora é aproveitar o Kiyomizu-dera enquanto ainda está relativamente tranquilo.",
        "A entrada é paga, mas o ingresso é barato. Entre no complexo, caminhe pelos pavilhões e siga até os principais pontos de observação. O templo fica elevado na encosta de Higashiyama e possui uma das vistas mais bonitas de Kyoto.",
        "Dependendo da época do ano e do horário em que você chegar, você ainda pode pegar aquela transição da primeira luz da manhã sobre a cidade. Além da arquitetura do próprio templo, a altura e a paisagem ao redor fazem muita diferença na experiência.",
        "Não tenha pressa aqui. Caminhe pelo complexo, aproveite os mirantes e procure os ângulos em que você consegue observar e fotografar o famoso pavilhão principal e sua enorme varanda de madeira. Depois disso, aí sim podemos começar a explorar o bairro.",
        "Sannenzaka & Ninenzaka: saindo do Kiyomizu-dera, você entra em uma das regiões históricas mais bonitas de Kyoto. As duas ruas que eu considero fundamentais aqui são Sannenzaka e Ninenzaka — aquelas famosas ruas inclinadas de pedra cercadas por machiya, as casas tradicionais de madeira de Kyoto.",
        "E existe uma experiência interessante se você chegou realmente cedo: provavelmente vai conhecer essas ruas em dois momentos completamente diferentes. Primeiro, ainda praticamente vazias, com boa parte das lojas fechadas. Depois, conforme a manhã avança, as portas começam a abrir, aparecem cafés, lojas, doces, artesanato e cada vez mais pessoas circulando. Eu gosto das duas experiências.",
        "Por isso, depois de visitar o templo, não existe necessidade de correr. Caminhe sem uma rota excessivamente rígida e aproveite Higashiyama.",
        "Depois, pare para comer: depois de explorar Sannenzaka, Ninenzaka e as ruas ao redor, procure algum lugar para almoçar com calma. A partir daqui, o ritmo do dia pode ficar muito mais tranquilo.",
        "Se você encontrar alguma atração, templo, loja ou rua nessa parte de Higashiyama que desperte seu interesse, pode aproveitar. Existem dezenas de pequenas coisas espalhadas pelo bairro e não existe necessidade de transformar todas elas em uma obrigação do roteiro. Depois do almoço, começamos gradualmente a seguir em direção a Gion.",
        "Gion — o distrito das geiko e maiko: aqui entramos em outra das regiões mais famosas de Kyoto. Gion é um dos principais hanamachi, os tradicionais distritos de entretenimento onde trabalham as geiko e maiko.",
        "Uma explicação rápida: em Kyoto, é comum utilizar o termo geiko para as profissionais que em outras regiões do Japão são geralmente chamadas de geisha. Já as maiko são aprendizes que ainda estão passando pelo longo processo de formação.",
        "Você pode eventualmente cruzar com alguma delas se deslocando para um compromisso, especialmente conforme o dia avança. Mas existe uma regra extremamente importante: elas não são uma atração turística — estão trabalhando.",
        "Não bloqueie o caminho, não tente pará-las, não toque nelas e não faça fotografias onde isso seja proibido ou sem respeitar as regras e a privacidade do local. Algumas ruas e propriedades de Gion possuem inclusive restrições específicas de acesso e fotografia — preste atenção à sinalização e permaneça nas áreas públicas permitidas.",
        "A melhor maneira de conhecer Gion é simplesmente caminhar, observar a arquitetura e aproveitar a atmosfera do bairro.",
        "Yasaka Shrine e arredores: uma das principais referências dessa região é o Yasaka Shrine, que funciona praticamente como uma ligação entre Gion e a área do Maruyama Park. Vale entrar, caminhar um pouco pelo complexo e depois continuar explorando os arredores.",
        "Existem vários pequenos pontos interessantes nessa parte de Higashiyama. Alguns vão levar poucos minutos, outros talvez chamem sua atenção e façam você ficar um pouco mais. Você encontrará templos, pequenas ruas históricas, jardins e até trechos de bambu bem menores e muito menos famosos do que Arashiyama.",
        "Aqui eu não criaria uma lista rígida de lugares que precisam ser \"completados\". Explore. Essa é uma das regiões de Kyoto em que sair um pouco do roteiro pode ser mais interessante do que simplesmente correr de atração em atração.",
        "Termine o dia próximo ao Rio Kamo: conforme o final da tarde se aproxima, vá gradualmente em direção ao rio. Do outro lado você volta a encontrar uma Kyoto muito mais comercial e urbana, com lojas, restaurantes e algumas das principais áreas de entretenimento da cidade. Próximo dali fica também Pontocho, uma das vielas mais conhecidas de Kyoto, repleta de pequenos restaurantes e bares.",
        "Minha recomendação é não encerrar o dia cedo demais. Espere anoitecer — a atmosfera ao redor do Kamo muda bastante quando as luzes dos restaurantes começam a aparecer. Dependendo da época do ano, você verá pessoas sentadas às margens do rio, casais caminhando e restaurantes funcionando nas construções tradicionais ao redor de Pontocho. É um ótimo contraponto para terminar um dia que começou ainda muito cedo no Kiyomizu-dera.",
        "E para jantar? Você tem duas opções simples: aproveitar que já está na região de Gion, Pontocho e Kawaramachi e jantar por ali, onde existem inúmeras opções de restaurantes, ou voltar para o hotel e jantar próximo à Kyoto Station.",
        "A própria estação possui vários restaurantes nos andares superiores e existem muitas outras opções nos quarteirões ao redor. Portanto, não existe necessidade de transformar o jantar em mais uma obrigação logística — escolha aquilo que estiver mais conveniente naquele momento.",
        "Hoje parece um dia relativamente tranquilo no papel, porque não estamos tentando encaixar dezenas de atrações. Mas existe um detalhe importante: você começou muito cedo. Então aproveite para terminar a noite com calma e dormir cedo, porque amanhã acontece novamente a mesma coisa — em Kyoto, vamos usar as primeiras horas da manhã a nosso favor.",
      ],
    },
    regiao: {
      nome: "Higashiyama · Kyoto",
      descricao:
        "Bairro aos pés das colinas do leste de Kyoto, preservado desde o período Edo — reúne o Kiyomizu-dera e as ladeiras históricas de Ninenzaka e Sannenzaka, com casas de madeira, lojas tradicionais e vista para a cidade lá embaixo. É o ponto de partida natural para seguir a pé até Gion, logo ao norte.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Kyoto Station (saída Karasuma)",
        distancia: "~1 min a pé do hotel",
        foto: "/images/kyoto-station-entrance.webp",
        mapa: "/images/kyoto-station-map.webp",
        mapaAlt: "Mapa da Estação de Kyoto (portões, plataformas JR e Shinkansen)",
      },
      linha: { codigo: "206", nome: "Kyoto City Bus 100 / 206", cor: "#2E7D32" },
      estacoesIntermediarias: [
        { nome: "Karasuma-Shichijo", nomeJapones: "烏丸七条" },
        { nome: "Shichijo Keihan-mae", nomeJapones: "七条京阪前" },
        { nome: "Museu Sanjusangendo-mae", nomeJapones: "博物館三十三間堂前" },
        { nome: "Higashiyama-Shichijo", nomeJapones: "東山七条" },
      ],
      estacaoDestino: {
        nome: "Parada Gojozaka ou Kiyomizu-michi",
        foto: "/images/gojozaka-bus-stop.webp",
      },
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
        "Do Daiwa Roynet Hotel Kyoto-Ekimae, em frente à Kyoto Station, o ônibus 100 ou 206 leva cerca de 20 minutos até Gojozaka ou Kiyomizu-michi — de lá são mais 10 minutos a pé subindo até o templo. Para chegar por volta das 6h30, logo na abertura, confirme o primeiro horário do ônibus nessa manhã — dependendo da frequência inicial, um táxi pode ser a opção mais confiável nesse horário tão cedo.",
    },
    atracaoPrincipal: "Templo Kiyomizu-dera",
    atracaoPrincipalImagem: "/images/dia5-kiyomizudera.webp",
    detalhesPraticos: [
      { label: "Entrada", valor: "¥500 (adultos)" },
      { label: "Horário", valor: "6h–18h (aprox., varia por temporada)" },
      {
        label: "Acesso",
        valor: "Ladeiras íngremes e degraus de pedra desde o Nio-mon até o salão principal — sem alternativa plana, calçado confortável é essencial.",
      },
      {
        label: "Melhor horário",
        horarioDestaque: "6h–7h",
        valor:
          "Logo na abertura — Kiyomizu-dera é um dos templos mais visitados de Kyoto, e os ônibus de excursão e grupos de turismo começam a chegar em massa a partir do meio da manhã.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/visaogeral-kyoto1.webp",
      imagemAlt: "Mapa com Kiyomizu-dera, Ninenzaka, % Arabica e a região de Gion nas proximidades",
      nota: "Localização de Kiyomizu-dera e das ladeiras de Sannenzaka/Ninenzaka em relação a Gion, logo ao norte.",
    },
    decisoes: [
      {
        titulo: "Vale chegar antes da abertura?",
        resposta: "Kiyomizu-dera é um dos templos mais visitados de Kyoto — chegar por volta das 6h–7h ajuda a evitar as aglomerações do meio da manhã e dos grupos de turismo.",
      },
    ],
    pois: [
      {
        title: "Sannenzaka",
        description:
          "Ladeira histórica de casas tradicionais, logo na descida a partir do templo.",
        prioridade: "recomendado",
        ordem: 1,
        imagem: "/images/higashiyama-sannenzaka.webp",
        imagemAlt: "Ladeira histórica de Sannenzaka, em Higashiyama",
      },
      {
        title: "Ninenzaka",
        description: "Continuação de Sannenzaka, descendo rumo a Gion.",
        prioridade: "recomendado",
        ordem: 2,
        imagem: "/images/higashiyama-ninenzaka.webp",
        imagemAlt: "Ladeira histórica de Ninenzaka, em Higashiyama",
      },
      {
        title: "Café % Arabica Kyoto Higashiyama",
        description:
          "Cafeteria minimalista muito concorrida, a poucos passos da Pagode Yasaka — última parada antes de seguir para Gion.",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/higashiyama-arabica-kyoto.webp",
        imagemAlt: "Café % Arabica Kyoto Higashiyama",
      },
    ],
    gastronomia: {
      itens: [
        { nome: "Matcha de Uji" },
        { nome: "Yatsuhashi" },
        { nome: "Dengaku" },
      ],
      curadoriaLabel: "Opções selecionadas — Chá e doces (~12h)",
      curadoria: [
        {
          nome: "Kiyomizu Junsei Okabeya",
          papel: "Mais prático",
          categoria: "Tofu dengaku (tradicional desde 1902)",
          descricao:
            "Casa histórica de tofu dengaku bem em frente ao Kiyomizu-dera — cardápio multilíngue, ideal pra fazer a pausa assim que descer do templo.",
          foto: "/images/kiyomizu-junsei-okabeya.webp",
          economico: true,
          notaTabelog: "3.41",
          numAvaliacoes: "289 avaliações",
          faixaPreco: "¥2.000–3.999 por pessoa",
          distancia: "Em frente ao Templo Kiyomizu-dera",
          foreignFriendly: "Alto — cardápio multilíngue confirmado (inclusive inglês), 400 lugares.",
          horario: "11h–16h (último pedido 15h), todos os dias",
          reserva: "Obrigatória — reservar com 1 dia de antecedência",
          pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260301/26001215/",
        },
        {
          nome: "MACCHA HOUSE Maccha-kan — Sannenzaka",
          papel: "Melhor custo-benefício",
          categoria: "Matcha (doces e bebidas)",
          descricao:
            "Especializada em sobremesas de matcha, com terraço aberto — direto na descida de Sannenzaka, sem precisar sair do caminho.",
          foto: "/images/maccha-house-sannenzaka.webp",
          economico: true,
          notaTabelog: "3.43",
          numAvaliacoes: "182 avaliações",
          faixaPreco: "¥1.000–1.999 por pessoa",
          distancia: "Na própria Sannenzaka, a poucos minutos do templo",
          foreignFriendly:
            "Médio — sem cardápio em inglês confirmado, mas cardápio simples e visual de doces.",
          horario: "11h–18h (último pedido 17h30), todos os dias",
          reserva: "Não aceita reservas — só balcão (96 lugares, incluindo terraço)",
          pagamento: "Cartão, IC card e QR code aceitos",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260301/26030960/",
        },
        {
          nome: "Rengetsu Jaya",
          papel: "Experiência mais especial",
          categoria: "Yudofu (tofu quente) e kaiseki leve",
          descricao:
            "Casa centenária de yudofu e yuba, com harmonização de sakês locais — mais refeição completa que lanche, perto do Chion-in a caminho de Gion.",
          foto: "/images/rengetsu-jaya.webp",
          notaTabelog: "3.39",
          numAvaliacoes: "154 avaliações",
          faixaPreco: "¥3.000–4.999 por pessoa",
          distancia: "~5 min a pé da Estação Higashiyama, perto do portão norte do Chion-in",
          foreignFriendly:
            "Alto — reserva por telefone com suporte, pagamentos internacionais (Alipay/WeChat Pay) aceitos.",
          horario:
            "seg, qui–dom 11h–14h30 e 17h–21h (fechado terça e quarta) — funciona até acabar o estoque do dia",
          reserva: "Recomendada — por telefone",
          pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260301/26000952/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Higashiyama",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Higashiyama — em produção",
      },
    },
    banheirosProximos: [
      {
        local: "Banheiro público do terreno do Kiyomizu-dera",
        endereco: "Zona sudoeste do complexo (清水寺境内南西)",
        nota: "Duas alas separadas: uma masculina/feminina e outra feminina + multiuso (acessível) — dentro do próprio terreno do templo, sem precisar sair para buscar banheiro.",
      },
    ],
  },
  tarde: {
    label: "Tarde",
    percursoEssencial: {
      duracao: "~5h (Gion, Yasaka Shrine e Pontocho)",
      passos: [
        {
          titulo: "Yasaka Shrine",
          foto: "/images/gion-yasaka-shrine.webp",
          horario: "14:00",
          descricao: "Santuário xintoísta símbolo de Gion.",
        },
        {
          titulo: "Rio Kamo",
          foto: "/images/gion-rio-kamo.webp",
          horario: "~16:00",
          descricao: "Rio que corta Gion — margem tradicional de passeio, com os restaurantes de Pontocho debruçados sobre a água.",
        },
        {
          titulo: "Pontocho",
          foto: "/images/gion-pontocho.webp",
          horario: "~17:00",
          descricao: "Viela tradicional de restaurantes e gueixas, às margens do rio Kamo.",
        },
        {
          titulo: "Jantar Kaiseki ou Obanzai",
          foto: "/images/icone-gastronomia.webp",
          horario: "19:00",
          descricao: "Jantar tradicional em Gion.",
        },
      ],
    },
    regiao: {
      nome: "Gion · Kyoto",
      descricao:
        "O distrito de gueixas mais famoso do Japão, com casas de chá tradicionais ao longo de ruas de pedra, o Santuário Yasaka marcando a entrada e a viela de Pontocho, às margens do rio Kamo, do outro lado do bairro. Preserva desde o período Edo o ambiente ligado às gueixas (geiko) e às aprendizes (maiko).",
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
    atracaoPrincipalImagem: "/images/dia5-gion-v3.webp",
    atracaoPrincipalFoco: "center",
    detalhesPraticos: [
      { label: "Yasaka Shrine", valor: "Entrada gratuita, aberto 24h" },
      { label: "Pontocho", valor: "Restaurantes abrem a partir das 17h–18h" },
      { label: "Fotografia", valor: "Multa de ¥10.000 por fotografar em ruas privadas designadas de Gion — detalhes abaixo" },
      {
        label: "Melhor horário",
        horarioDestaque: "17h–18h",
        valor:
          "É quando Gion ganha o clima do início da noite, com as casas de chá abrindo as portas e menos grupos de turismo do que durante o dia — bom encaixe com o jantar em Pontocho, marcado para as 19h.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/kyoto-visao-geral.webp",
      imagemAlt: "Mapa de Gion com Pontocho Alley, Yasaka Shrine e a ligação a pé com Kiyomizu-dera",
      nota: "Localização de Pontocho e Yasaka Shrine em relação a Kiyomizu-dera, ao sul.",
    },
    decisoes: [
      {
        titulo: "Onde jantar em Gion?",
        resposta: "Kaiseki entrega a experiência gastronômica mais refinada; obanzai (cozinha caseira de Kyoto) é uma alternativa mais informal e acessível — ambas encontradas em Pontocho.",
      },
      {
        titulo: "Como voltar para o hotel à noite?",
        resposta: "O ônibus de volta não é o mesmo da ida: de Shijo Kawaramachi (~3 min a pé de Pontocho, atravessando a Shijo-ohashi) sai o ônibus 4, direto até Kyoto Station em ~15 min, sem baldeação. À noite, depois do jantar, táxi costuma ser a opção mais prática — o trajeto é rápido (~15 min) e evita depender do horário dos ônibus.",
      },
    ],
    pois: [
      {
        title: "Yasaka Shrine",
        description: "Santuário xintoísta símbolo de Gion.",
        prioridade: "opcional",
        ordem: 1,
        imagem: "/images/gion-yasaka-shrine.webp",
        imagemAlt: "Yasaka Shrine, santuário xintoísta símbolo de Gion",
      },
      {
        title: "Rio Kamo",
        description:
          "Rio que corta Gion — margem tradicional de passeio, com os restaurantes de Pontocho debruçados sobre a água, atravessado pela Sanjo-ohashi e pela Shijo-ohashi.",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/gion-rio-kamo.webp",
        imagemAlt: "Margem do Rio Kamo em Gion, à noite",
      },
      {
        title: "Pontocho",
        description: "Viela tradicional de restaurantes e gueixas.",
        prioridade: "recomendado",
        ordem: 3,
        imagem: "/images/gion-pontocho.webp",
        imagemAlt: "Viela tradicional de Pontocho, em Gion",
      },
    ],
    gastronomia: {
      itens: [{ nome: "Kaiseki" }, { nome: "Obanzai" }],
      curadoriaLabel: "Opções selecionadas — Jantar (~19h)",
      curadoria: [
        {
          nome: "Toobanzai Marutakeebisu Mamehachi — Pontocho",
          papel: "Melhor custo-benefício",
          categoria: "Obanzai e tofu",
          descricao:
            "Mais de 100 anos de tradição em cozinha de tofu e obanzai caseiro, direto em Pontocho — equipe multilíngue (inglês).",
          foto: "/images/toobanzai-mamehachi-pontocho.webp",
          economico: true,
          notaTabelog: "3.43",
          numAvaliacoes: "257 avaliações",
          faixaPreco: "¥3.000–4.999 no jantar",
          distancia: "~5 min a pé da Estação Gion-Shijo, dentro de Pontocho",
          foreignFriendly: "Alto — equipe multilíngue (inglês) confirmada.",
          horario: "17h–22h (último pedido 21h30), todos os dias",
          reserva: "Obrigatória — reserva online",
          pagamento: "Cartão e QR code (inclusive Alipay) aceitos",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260201/26021180/",
        },
        {
          nome: "Pontocho Suishin Honten",
          papel: "Mais prático",
          categoria: "Obanzai e vegetais de Kyoto",
          descricao:
            "Pratos de vegetais de Kyoto e obanzai numa machiya tradicional — casa grande (105 lugares), boa opção pra grupo sem espera.",
          foto: "/images/pontocho-suishin-honten.webp",
          economico: true,
          notaTabelog: "3.31",
          numAvaliacoes: "143 avaliações",
          faixaPreco: "¥5.000–7.999 no jantar",
          distancia: "~5 min a pé da Estação Higashiyama-Sanjo, dentro de Pontocho",
          foreignFriendly: "Médio — descrita como atendendo bem famílias, casais e turistas.",
          horario: "17h–23h (último pedido 22h30), todos os dias",
          reserva: "Recomendada — reserva online",
          pagamento: "Cartão aceito — sem IC card nem QR code",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260301/26003336/",
        },
        {
          nome: "Kyoryori Pontocho Fumiya",
          papel: "Experiência mais especial",
          categoria: "Kaiseki (culinária de Kyoto)",
          descricao:
            "Kaiseki tradicional com vista para o Rio Kamo, dois números depois do Pontocho Kaburenjo — a opção mais refinada das três.",
          foto: "/images/kyoryori-pontocho-fumiya.webp",
          notaTabelog: "3.43",
          numAvaliacoes: "330 avaliações",
          faixaPreco: "¥8.000–9.999 no jantar",
          distancia: "~5 min a pé das Estações Gion-Shijo, Kawaramachi ou Sanjo, dentro de Pontocho",
          foreignFriendly: "Médio — sem confirmação de cardápio em inglês.",
          horario: "17h–23h (último pedido de comida 22h), todos os dias",
          reserva: "Obrigatória — reserva online",
          pagamento: "Somente dinheiro — não aceita cartão, IC card nem QR code",
          alerta: "Só dinheiro — leve ienes em espécie (taxa de serviço de 10% no jantar).",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260301/26002618/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Gion",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Gion — em produção",
      },
    },
    infoOperacional: {
      titulo: "Regras importantes em Gion",
      icone: "regras",
      itens: [
        {
          local: "Ruas privadas designadas",
          nota: "Um conselho de moradores e comerciantes locais proibiu fotografar geiko e maiko (ou entrar sem permissão) em ruas privadas específicas de Gion — multa de ¥10.000 por infração, resposta a casos de perseguição e abordagem de turistas.",
        },
        {
          local: "Hanamikoji Street (via pública)",
          nota: "A restrição não vale para as ruas públicas principais, mas é sempre educado pedir permissão antes de fotografar qualquer pessoa — geiko e maiko estão a caminho do trabalho, não posando para turistas.",
        },
      ],
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
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "07:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "08:00", foto: "/images/icone-hotel2.webp" },
      { titulo: "Fushimi Inari Taisha", horario: "08:15", foto: "/images/dia6-fushimiinari.webp" },
      { titulo: "Almoço", horario: "11:00", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Kinkaku-ji", horario: "13:00", foto: "/images/dia6-kinkakuji.webp" },
      { titulo: "Jantar", horario: "19:00", foto: "/images/icone-gastronomia.webp" },
    ],
  },
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
      { horario: "14:30", evento: "Ryoan-ji e Ninna-ji (mesmo circuito de Kinkaku-ji)" },
      {
        horario: "15:15",
        evento: "Museu do Mangá e Nintendo Store — opcional, exige desvio de ~20–30 min até o centro",
      },
      {
        horario: "19:00",
        evento: "Jantar com unagi-don",
        tag: "Refeição",
      },
    ],
    nota: "Horários estimados considerando saída do Daiwa Roynet Hotel Kyoto-Ekimae (em frente à Kyoto Station) — chegar cedo em Fushimi Inari é o que mais compensa nesse dia.",
  },
  diaEmNumeros: {
    atracoes: "2 atrações principais",
    caminhada: "A definir",
    transporte: "~50 min de trem/ônibus no total",
    linhasMetro: "2 linhas, sem baldeações",
    ritmo: "Moderado",
    saida: "08:00",
    retorno: "A definir",
  },
  manha: {
    percursoEssencial: {
      duracao: "~2h (corredor de torii e arredores)",
      passos: [
        {
          titulo: "Torii de entrada",
          horario: "08:15",
          descricao: "Entrada principal do santuário, aos pés da montanha sagrada Inari.",
        },
        {
          titulo: "Senbon Torii",
          foto: "/images/dia6-fushimiinari.webp",
          horario: "~08:30",
          descricao: "O famoso corredor de milhares de torii vermelhos, o cartão-postal do santuário.",
        },
        {
          titulo: "Yotsutsuji (mirante)",
          foto: "/images/fushimi-yotsutsuji.webp",
          horario: "~09:15",
          descricao: "Ponto intermediário na subida com vista sobre Kyoto — boa opção de retorno para quem não quiser subir até o topo.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Fushimi Inari Taisha",
      imagem: "/images/raiox-fushimiinari.webp",
      imagemAlt: "Raio-X Alpinea do Santuário Fushimi Inari com o Portão Principal, Salão Principal, corredor de torii, Yotsuji e o Monte Inari",
      comentarios: [
        "Hoje vamos seguir praticamente a mesma estratégia do dia anterior: acordar cedo.",
        "Só que existe uma diferença importante. O Fushimi Inari Taisha não possui propriamente um \"horário de abertura\" para a área principal da montanha — o complexo permanece acessível 24 horas por dia.",
        "Portanto, quando eu digo para chegar cedo, significa realmente chegar nas primeiras horas da manhã, antes que o grande fluxo de visitantes comece. E aqui o horário faz uma diferença enorme.",
        "Primeiro, entenda o que é Fushimi Inari: não é apenas um templo ou um único monumento. Na prática, estamos falando de um enorme complexo religioso construído ao longo da encosta do Monte Inari, formado pelo santuário principal, milhares de torii, pequenos santuários, altares, trilhas e diferentes pontos espalhados pela montanha.",
        "Os famosos portais vermelhos que você vê nas fotografias são os torii. Eles aparecem em diferentes tamanhos ao longo do percurso e, em determinados trechos, ficam tão próximos uns dos outros que formam verdadeiros corredores pela montanha. É justamente isso que torna o lugar tão impressionante — e também explica por que chegar cedo é tão importante.",
        "Não perca muito tempo na base: ao chegar, naturalmente vale conhecer o santuário principal, observar os edifícios e tirar algumas fotos. Mas minha recomendação é não ficar muito tempo aqui agora — você voltará para essa mesma região na descida e, nesse momento, poderá explorar a base com muito mais calma.",
        "A prioridade pela manhã é outra: entre nos corredores de torii antes da multidão.",
        "Os primeiros corredores são o ponto crítico: os primeiros trechos são os mais famosos e, consequentemente, os mais congestionados. É aqui que ficam alguns daqueles corredores extremamente densos de pequenos torii que aparecem em praticamente todas as fotografias do Fushimi Inari.",
        "Quando estão vazios, são espetaculares. Quando estão lotados, a experiência muda completamente.",
        "Como os caminhos são relativamente estreitos e existe fluxo de pessoas subindo, descendo e parando constantemente para fotografar, conforme a manhã avança alguns trechos podem ficar extremamente congestionados. Você não consegue simplesmente contornar a multidão — o caminho passa por dentro dos corredores.",
        "Por isso, aproveite enquanto estiver vazio: tire suas fotos, faça seus vídeos e observe os detalhes. Mas depois continue subindo — não fique vinte minutos tentando conseguir dezenas de fotografias diferentes no mesmo corredor.",
        "O segredo é avançar. Essa é provavelmente a dica mais importante que posso dar sobre Fushimi Inari: quanto mais você sobe, menos pessoas encontra.",
        "Uma grande parte dos visitantes conhece apenas os primeiros corredores, tira algumas fotografias e começa a retornar. Quando você ultrapassa essa primeira concentração e avança pela montanha, o ambiente começa a mudar — os grupos diminuem, aparecem intervalos maiores entre as pessoas e você finalmente consegue caminhar com mais tranquilidade. É aí que, na minha opinião, Fushimi Inari começa a ficar realmente interessante.",
        "Você precisa chegar ao topo? Não. E aqui eu falo também por experiência própria.",
        "Anos atrás, tive exatamente essa curiosidade: \"Já que estou aqui, o que existe no topo da montanha?\" A resposta é: não existe uma grande atração esperando por você lá em cima.",
        "Completar todo o circuito pode levar algumas horas, dependendo do ritmo e das paradas. O ponto mais alto possui estruturas religiosas e pequenos altares semelhantes a vários outros que você encontrará durante a subida, mas não existe um grande templo, monumento ou mirante final que justifique chegar ao topo apenas para \"completar\" o percurso.",
        "Portanto, não trate o cume como objetivo obrigatório. Prefiro que você explore bem uma parte da montanha e volte quando sentir que a experiência já foi suficiente.",
        "Onde vale a pena parar: conforme você sobe, preste atenção porque Fushimi Inari é muito mais do que apenas os corredores vermelhos. Existem pequenos santuários, estátuas, altares, áreas de floresta e caminhos secundários espalhados pelo percurso.",
        "Você também começará a encontrar alguns pontos de onde é possível observar Kyoto do alto. Um dos mais conhecidos é a região de Yotsutsuji, aproximadamente no meio da subida. Para este roteiro, considero esse tipo de ponto muito mais interessante como objetivo do que necessariamente chegar ao topo do Monte Inari.",
        "Se o tempo estiver bom, pare um pouco. Existem lugares para descansar e, chegando cedo, o ambiente tende a ser muito mais tranquilo. Se tiver comprado alguma coisa para comer ou beber antes de subir, pode ser um bom momento para fazer uma pequena pausa.",
        "A vista lembra um pouco a experiência que tivemos no alto de Higashiyama no dia anterior, mas agora você estará observando Kyoto a partir de outra direção.",
        "Explore também os caminhos menores: durante o percurso você encontrará pequenos desvios e áreas muito menos movimentadas — pequenos cursos d'água, altares escondidos entre as árvores, lagos e trechos em que a sensação é muito mais de estar caminhando por uma montanha do que visitando uma atração turística.",
        "Não existe necessidade de seguir exclusivamente o fluxo principal. Se encontrar um caminho permitido que pareça interessante, vale explorar um pouco.",
        "Na descida, mude o ritmo: quando decidir voltar, faça exatamente o contrário do que fizemos na subida. Agora não existe mais pressa.",
        "Em alguns trechos, você poderá utilizar caminhos diferentes dos corredores pelos quais subiu, passando por áreas muito mais tranquilas e até por partes residenciais próximas ao complexo. Aproveite para observar esse outro lado da região.",
        "Quando você finalmente retornar à base, provavelmente já terá passado um bom tempo desde sua chegada — e o cenário será completamente diferente. As lojas estarão abertas, haverá muito mais movimento e você poderá finalmente explorar aquilo que ignoramos no começo da manhã.",
        "As raposas de Fushimi Inari: você vai perceber que existem raposas por todos os lados. Isso acontece porque as raposas, ou kitsune, são tradicionalmente consideradas mensageiras de Inari, a divindade à qual o santuário é dedicado.",
        "Por isso você encontrará estátuas de raposas ao longo do complexo e vários souvenirs inspirados nelas nas lojas próximas à entrada. Se quiser levar alguma lembrança específica deste lugar, existem pequenos objetos, amuletos e souvenirs com kitsune que são bastante característicos do Fushimi Inari.",
        "A estratégia para hoje, resumindo: chegue muito cedo, aproveite os primeiros corredores enquanto ainda estão vazios e avance rapidamente pela primeira parte da montanha.",
        "Depois disso, diminua o ritmo. Explore os pequenos santuários, observe a floresta, pare nos mirantes e continue subindo enquanto estiver aproveitando a experiência. Não existe obrigação nenhuma de chegar ao topo.",
        "Quando sentir que já viu o suficiente, comece a descida e deixe para conhecer com calma a base, as lojas e os souvenirs no final.",
        "Fushimi Inari é um daqueles lugares em que duas pessoas podem visitar exatamente a mesma atração e ter experiências completamente diferentes simplesmente porque chegaram em horários diferentes. E é justamente por isso que estamos começando o dia tão cedo.",
      ],
    },
    regiao: {
      nome: "Fushimi · Kyoto",
      descricao:
        "Bairro ao sul de Kyoto, historicamente ligado à produção de saquê — hoje conhecido principalmente pelos milhares de torii vermelhos que sobem o Monte Inari a partir do Santuário Fushimi Inari, sede de mais de 30 mil santuários espalhados pelo Japão dedicados à divindade Inari.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Kyoto Station",
        distancia: "~1 min a pé do hotel",
        saida: "Saída Central (Karasuma-guchi)",
        foto: "/images/kyoto-station-entrance.webp",
        mapa: "/images/kyoto-station-map.webp",
        mapaAlt: "Mapa da Estação de Kyoto (portões, plataformas JR e Shinkansen)",
      },
      linha: { codigo: "JR", nome: "JR Nara Line", cor: "#00A650", logo: "/images/jr-logo.webp" },
      estacoesIntermediarias: [{ nome: "Tofukuji", nomeJapones: "東福寺", numero: "D02" }],
      estacaoDestino: {
        nome: "Estação Inari",
        nomeJapones: "稲荷駅",
        saida: "Saída única",
        foto: "/images/inari-station-entrance.webp",
      },
      opcoes: [
        {
          meio: "Trem JR",
          tempo: "≈5 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (JR Nara Line, trem local), sem baldeação — Kyoto Station (D01) até Inari (D03), passando por Tofukuji (D02).",
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
        "Do Daiwa Roynet Hotel Kyoto-Ekimae, em frente à Kyoto Station (D01), o trem local da JR Nara Line leva cerca de 5 minutos até a Estação Inari (D03) — que fica na entrada do santuário. Importante: apenas trens locais param em Inari, expressos não param.",
    },
    atracaoPrincipal: "Fushimi-Inari Taisha",
    atracaoPrincipalImagem: "/images/dia6-fushimiinari.webp",
    detalhesPraticos: [
      { label: "Entrada", valor: "Gratuita" },
      { label: "Horário", valor: "Aberto 24h" },
      {
        label: "Barracas de comida",
        valor: "Funcionam só durante o dia (aprox. 8h–17h) — fora desse horário o santuário continua aberto, mas sem opções de comida no trajeto.",
      },
      {
        label: "Melhor horário",
        horarioDestaque: "Antes das 9h",
        valor:
          "O Senbon Torii fica tomado de grupos de turismo a partir do meio da manhã — chegando cedo, dá pra fotografar o corredor de torii praticamente vazio.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/fushimi-inari-taisha-visaogeral.webp",
      imagemAlt: "Mapa de Fushimi Inari-taisha com Fushimi Inari Yotsuji, Mount Inari, Kobogataki Falls e santuários menores no entorno",
      nota: "Localização do santuário principal e do caminho de torii que sobe o Monte Inari.",
    },
    decisoes: [
      {
        titulo: "Preciso subir até o topo da montanha?",
        resposta: "Não — a experiência principal (Senbon Torii) já acontece nos primeiros minutos de caminhada. Subir até o topo leva ~2h ida e volta e é opcional, recomendado só para quem gosta de trilha.",
      },
    ],
    pois: [
      {
        title: "Torii de Entrada",
        description:
          "O grande torii vermelho na entrada do santuário, com o Salão Principal (Honden) visível ao fundo — primeiro ponto do santuário, antes do início do corredor de Senbon Torii.",
        prioridade: "imperdivel",
        ordem: 1,
        imagem: "/images/dia6-fushimiinari-entrada.webp",
        imagemAlt: "Grande torii vermelho na entrada do Santuário Fushimi Inari, com o Salão Principal ao fundo",
      },
      {
        title: "Yotsutsuji (四ツ辻)",
        description:
          "Cruzamento a meio caminho da subida do Monte Inari, com o mirante mais famoso do circuito depois do Senbon Torii — vista aberta sobre Kyoto entre a torii vermelha e as árvores, especialmente bonita perto do pôr do sol. É onde o trajeto se divide: seguir em frente rumo ao topo ou voltar pelo mesmo caminho.",
        prioridade: "recomendado",
        ordem: 2,
        imagem: "/images/fushimi-yotsutsuji.webp",
        imagemAlt: "Vista de Kyoto ao pôr do sol através de um torii vermelho, no mirante de Yotsutsuji",
      },
      {
        title: "Shin-ike / Kumataka-sha (新池・熊鷹社)",
        description:
          "Pequeno lago cercado pela mata densa do Monte Inari, com o santuário Kumataka-sha às margens — um respiro mais tranquilo e menos fotografado do circuito, com a vegetação refletida na água. Fica além do Yotsutsuji, para quem seguir subindo.",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/fushimi-shinike-kumatakasha.webp",
        imagemAlt: "Lago Shin-ike cercado pela floresta do Monte Inari, com o santuário Kumataka-sha à margem",
      },
      {
        title: "Mitsurugisha / Chōjagamine (御剣社・長者ヶ峰)",
        description:
          "Santuário menor em meio à mata, um pouco mais acima na subida do Monte Inari — um dos pontos ao longo do trajeto de trilha para quem seguir além do Yotsutsuji rumo ao topo.",
        prioridade: "opcional",
        ordem: 4,
        imagem: "/images/fushimi-mitsurugisha.webp",
        imagemAlt: "Pequeno santuário com torii vermelho em meio à floresta, no Monte Inari",
      },
    ],
    gastronomia: {
      itens: [{ nome: "Inari-zushi" }, { nome: "Kitsune Udon" }],
      curadoriaLabel: "Opções selecionadas — Almoço rápido (~11h)",
      curadoria: [
        {
          nome: "Nezame-ya (祢ざめ家)",
          papel: "Experiência mais especial",
          categoria: "Inari-zushi (casa tradicional desde 1540)",
          descricao:
            "Bem em frente à entrada do santuário — casa quase 500 anos mais velha que o próprio complexo de torii, famosa pelo inari-zushi tradicional.",
          foto: "/images/nezameya-inarizushi.webp",
          notaTabelog: "3.45",
          numAvaliacoes: "392 avaliações",
          faixaPreco: "¥1.000–1.999",
          distancia: "Em frente à entrada do santuário / ~2 min a pé da Estação Inari (JR Nara Line)",
          foreignFriendly: "Médio — site em inglês disponível, mas sem confirmação de atendimento em inglês no local.",
          horario: "10h–16h30, todos os dias (fechamento irregular ocasional)",
          pagamento: "Somente dinheiro — não aceita cartão nem pagamento digital",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260601/26003540/",
        },
        {
          nome: "Kendon-ya (けんどん屋)",
          papel: "Melhor custo-benefício",
          categoria: "Kitsune Udon (macarrão artesanal)",
          descricao:
            "Udon feito à mão na hora, com o clássico kitsune (tofu frito) — casa pequena e simples, a poucos minutos a pé do santuário.",
          foto: "/images/kendon-ya-fushimi.webp",
          economico: true,
          notaTabelog: "3.53",
          numAvaliacoes: "313 avaliações",
          faixaPreco: "Até ¥999–1.999",
          distancia: "~5 min a pé da Estação Fushimi Inari (Keihan)",
          foreignFriendly: "Médio — cardápio multilíngue (inglês) disponível.",
          horario: "seg, ter, qui–dom 11h–18h — fechado às quartas",
          pagamento: "Somente dinheiro — não aceita cartão nem pagamento digital",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260601/26003538/",
        },
        {
          nome: "Inafuku (稲福)",
          papel: "Mais prático (para viagem)",
          categoria: "Inari-zushi para levar",
          descricao:
            "Inari-zushi portátil com gergelim e bardana, ideal para comer andando pelo corredor de torii — também serve codorna grelhada.",
          foto: "/images/inafuku-fushimi.webp",
          economico: true,
          notaTabelog: "3.34",
          numAvaliacoes: "183 avaliações",
          faixaPreco: "¥1.000–1.999",
          distancia: "~3 min a pé da Estação Inari (JR Nara Line)",
          foreignFriendly: "Alto — cardápio multilíngue (inglês, chinês simplificado, coreano), equipe com algum inglês.",
          horario: "9h–17h (último pedido 16h30) — fechado às terças",
          pagamento: "Dinheiro e PayPay — não aceita cartão de crédito",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260601/26006258/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Fushimi",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Fushimi — em produção",
      },
    },
    banheirosProximos: [
      {
        local: "Em frente ao Rōmon (portão principal)",
        nota: "Primeiro banheiro do percurso, logo na entrada — fica bem movimentado, cercado pelas barracas de comida.",
      },
      {
        local: "Perto do Okusha Hohaijo",
        endereco: "Logo depois do Senbon Torii",
        nota: "Bem menos concorrido que o da entrada — bom ponto de apoio depois de atravessar o corredor de torii, antes de decidir se sobe mais.",
      },
      {
        local: "Gozentani Hohaijo",
        endereco: "Além do Yotsutsuji, mais acima na montanha",
        nota: "Só relevante para quem seguir além do Yotsutsuji rumo ao topo do Monte Inari — depois desse ponto as opções ficam mais escassas.",
      },
    ],
  },
  tarde: {
    label: "Tarde",
    percursoEssencial: {
      duracao: "~5h30 (Kinkaku-ji e arredores)",
      passos: [
        {
          titulo: "Kinkaku-ji",
          foto: "/images/dia6-kinkakuji.webp",
          horario: "13:00",
          descricao: "O Pavilhão Dourado, um dos templos mais fotografados do Japão.",
        },
        {
          titulo: "Ryoan-ji",
          foto: "/images/kinkakuji-ryoanji.webp",
          horario: "~14:30",
          descricao: "Templo zen famoso pelo jardim de pedras, poucos minutos de distância.",
        },
        {
          titulo: "Ninna-ji",
          foto: "/images/kinkakuji-ninnaji.webp",
          horario: "~15:15",
          descricao: "Templo histórico com belas cerejeiras, no mesmo circuito.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Kinkaku-ji & Kitayama",
      imagem: "/images/raiox-kinkakuji.webp",
      imagemAlt: "Raio-X Alpinea de Kinkaku-ji com Shariden Kinkaku, Kyōko-chi Pond, Ginga-sen, Ryūmon Falls, White Snake Tomb, Fudō-do Temple, General Gate e Entrance",
      comentarios: [
        "Depois de começar o dia muito cedo no Fushimi Inari, seguimos para uma atração completamente diferente: o Kinkaku-ji, o famoso Pavilhão Dourado de Kyoto.",
        "E aqui existe uma mudança importante na nossa estratégia. O Kinkaku-ji também recebe uma quantidade enorme de turistas, mas, diferentemente do Fushimi Inari, você não precisa organizar toda a visita em função de fugir da multidão. O horário importa, sim — mas por outro motivo.",
        "Aqui, o protagonista é a luz: o Kinkaku-ji é revestido externamente por folhas de ouro e fica diante do Kyōko-chi, o lago que cria aquele famoso reflexo do pavilhão na água. Por isso, dependendo da posição do sol, das nuvens, do vento e até da superfície do lago naquele momento, a aparência do templo muda bastante.",
        "Em determinados horários, a luz bate diretamente sobre as paredes douradas e o pavilhão parece muito mais intenso. Em outros, o reflexo na água pode ficar mais interessante. No final da tarde, por exemplo, a luz mais baixa pode criar um tom completamente diferente sobre o ouro — com céu aberto e boas condições, é uma imagem espetacular.",
        "Portanto, não existe um único \"horário perfeito\" garantido. Aqui, o clima e a luz importam mais do que simplesmente chegar primeiro.",
        "Por que a multidão incomoda menos? Existe uma razão muito simples: você não entra no Pavilhão Dourado.",
        "O Kinkaku-ji fica do outro lado do lago e todo o percurso turístico acontece ao redor dele. Isso significa que, mesmo quando existe bastante gente, você continua conseguindo observar o pavilhão de uma distância confortável — uma situação completamente diferente dos corredores estreitos do Fushimi Inari.",
        "Por isso, não precisa ter ansiedade para chegar, tirar uma fotografia rapidamente e sair. Faça o percurso com calma.",
        "Os três ângulos que importam: ao longo da visita, você terá diferentes perspectivas do Kinkaku-ji, mas eu destacaria três momentos principais.",
        "O primeiro é a famosa vista frontal, logo no início do percurso, com o pavilhão refletido no lago — é provavelmente a fotografia mais conhecida do Kinkaku-ji.",
        "Depois, conforme você contorna o lago, terá ângulos laterais, que mostram melhor a arquitetura e a relação do pavilhão com o jardim.",
        "Por fim, o caminho começa a subir e você passa a observar o complexo de uma posição mais elevada, criando uma perspectiva completamente diferente daquela primeira fotografia junto ao lago. Esses são, para mim, os três momentos mais importantes da visita.",
        "Naturalmente, pare sempre que encontrar algum ângulo de que goste, mas não existe necessidade de passar horas procurando atrações escondidas dentro do complexo. O protagonista aqui é realmente o próprio Kinkaku-ji.",
        "Aproveite para experimentar matchá: como esta parte do dia é mais tranquila, aproveite também para fazer uma pausa. Você encontrará várias opções de doces e sobremesas de matchá, o chá-verde em pó que aparece em sorvetes, doces, bebidas e praticamente todo tipo de sobremesa imaginável em Kyoto.",
        "Essa região do Japão possui uma relação muito forte com o matchá, principalmente por causa de Uji, uma pequena cidade ao sul de Kyoto famosa pela produção de chá de altíssima qualidade. Então, se ainda não experimentou, este é um bom momento.",
        "Pegue um sorvete, uma sobremesa ou alguma coisa feita com matchá e simplesmente aproveite a pausa. Depois de duas manhãs começando extremamente cedo, não precisamos transformar cada minuto do roteiro em uma atração turística.",
        "Se quiser fazer uma refeição especial: unagi. Próximo ao Kinkaku-ji há restaurantes especializados em unagi, a enguia japonesa grelhada e normalmente servida sobre uma cama de arroz.",
        "Uma das opções que deixei nas recomendações do dia é o Doi Katsuman. É um restaurante pequeno e a proposta é bastante simples, mas a qualidade do unagi é excelente.",
        "Tenho inclusive pessoas na minha família que consideram o unagi daqui um dos melhores do Japão. Eu acho essa avaliação um pouco exagerada, mas posso confirmar uma coisa: é realmente muito bom.",
        "Não é uma refeição barata. Considere algo na faixa de alguns milhares de ienes por pessoa, dependendo do prato escolhido. Mas, se você quiser investir um pouco mais em uma refeição japonesa tradicional e gosta de peixe, considero uma experiência que vale bastante a pena.",
        "E depois do Kinkaku-ji? A partir daqui, temos uma decisão. Existem outras atrações que poderíamos encaixar em Kyoto.",
        "Relativamente próximo ao Kinkaku-ji fica o Ryōan-ji, famoso pelo seu jardim zen de pedras. Existe também o Ninna-ji, outro grande complexo histórico da região.",
        "Mais para o centro da cidade existem outras possibilidades, como o Kyoto International Manga Museum e a Nintendo KYOTO, a loja oficial da Nintendo na cidade.",
        "Uma curiosidade interessante é que a Nintendo nasceu e continua sediada em Kyoto, não em Tóquio. O prédio da sede não é uma atração turística, mas essa ligação da empresa com a cidade continua muito presente.",
        "O Manga Museum, por sua vez, possui um enorme acervo e funciona em um antigo prédio escolar. Particularmente, não considero uma atração essencial desta viagem, mas, se você tiver bastante interesse em mangá, pode ser uma opção.",
        "O problema é que essas atrações não ficam todas próximas umas das outras. E lembre-se de que estamos na parte norte de Kyoto, onde os deslocamentos já começam a ser menos convenientes.",
        "Minha recomendação: volte para Tóquio hoje. Considerando tudo o que já fizemos em Kyoto, eu voltaria para Tóquio no final do dia.",
        "Não porque Kyoto tenha acabado — seria perfeitamente possível passar muitos outros dias explorando a cidade — mas porque, dentro das prioridades desta viagem, já cobrimos aquilo que considero mais importante.",
        "Além disso, você acordou muito cedo ontem. Acordou muito cedo novamente hoje. Então não existe muita vantagem em adicionar várias atrações secundárias simplesmente porque ainda temos algumas horas disponíveis.",
        "Aproveite o Kinkaku-ji, faça uma boa refeição, passe em mais algum lugar se realmente estiver com vontade e depois siga com calma para a Kyoto Station. De lá, pegue o Shinkansen de volta para Tóquio.",
        "Ou fique mais uma noite: existe, porém, uma segunda opção perfeitamente viável. Se estiver gostando muito de Kyoto e quiser continuar explorando a cidade, você pode dormir aqui novamente e voltar para Tóquio na manhã seguinte.",
        "O roteiro de amanhã não exige que você esteja em uma atração turística no momento exato da abertura, então existe alguma flexibilidade. Se escolher essa alternativa, apenas planeje bem o horário do Shinkansen e evite criar uma manhã excessivamente apertada.",
        "Também recomendo organizar a reserva do trem com antecedência, principalmente se estiver viajando com bagagem ou quiser garantir lugares específicos.",
        "Entre as duas opções, minha preferência continua sendo voltar para Tóquio hoje. Você chega com calma, volta ao hotel, descansa e começa o próximo dia já instalado na cidade. Depois de duas manhãs acordando praticamente junto com Kyoto, um pouco de descanso também faz parte do roteiro.",
      ],
    },
    regiao: {
      nome: "Kitayama · Kyoto",
      descricao:
        "Região arborizada ao norte de Kyoto, onde fica o Kinkaku-ji (Pavilhão Dourado) — um dos templos mais fotografados do Japão, com as folhas de ouro do Shariden refletidas no Kyōko-chi Pond. O circuito de visita é curto e todo ao ar livre, num único sentido pelo jardim.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Kyoto Station",
        saida: "Saída Central (Karasuma-guchi)",
        foto: "/images/kyoto-station-entrance.webp",
        mapa: "/images/kyoto-station-map.webp",
        mapaAlt: "Mapa da Estação de Kyoto (portões, plataformas JR e Shinkansen)",
      },
      linha: { codigo: "205", nome: "Kyoto City Bus 205", cor: "#2E7D32" },
      estacoesIntermediarias: [
        { nome: "Nishioji-Shichijo", nomeJapones: "西大路七条" },
        { nome: "Nishioji-Shijo", nomeJapones: "西大路四条" },
        { nome: "Nishinokyo-Enmachi", nomeJapones: "西ノ京円町" },
        { nome: "Kitano-Hakubaicho", nomeJapones: "北野白梅町" },
      ],
      estacaoDestino: {
        nome: "Parada Kinkakuji-michi",
        foto: "/images/kinkakuji-michi-bus-stop.webp",
      },
      opcoes: [
        {
          meio: "Trem + Ônibus",
          tempo: "≈45–50 min",
          Icon: IconBus,
          recomendado: true,
          detalhes: [
            "JR Nara Line de volta a Kyoto Station (~5 min) + ônibus 205 até Kinkakuji-michi (~40 min) — o 101 que aparece em guias antigos não atende mais esse trecho.",
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
        "Fushimi Inari e Kinkaku-ji ficam em lados opostos de Kyoto — o caminho mais prático é retornar a Kyoto Station e seguir de ônibus 205, cerca de 45 a 50 minutos no total. De táxi, o trajeto direto cai para 16 a 20 minutos.",
    },
    atracaoPrincipal: "Kinkaku-ji",
    atracaoPrincipalImagem: "/images/dia6-kinkakuji.webp",
    detalhesPraticos: [
      { label: "Entrada", valor: "¥500 (adultos)" },
      { label: "Horário", valor: "9h–17h, todos os dias" },
      { label: "Pagamento", valor: "Somente dinheiro na bilheteria" },
      {
        label: "Melhor horário",
        horarioDestaque: "9h–10h",
        valor:
          "Logo na abertura, às 9h — os ônibus de excursão costumam chegar a partir do meio da manhã, e nas primeiras horas dá pra fotografar o pavilhão refletido no lago sem gente na frente.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/kinkakuji-visaogeral.webp",
      imagemAlt: "Mapa de Kinkaku-ji com Shariden Kinkaku, Kyōko-chi Pond, General Gate e Entrance",
      nota: "Localização do Pavilhão Dourado e do circuito de caminhada dentro do templo.",
    },
    decisoes: [
      {
        titulo: "Vale o desvio até o Museu do Mangá e a Nintendo Store?",
        resposta: "Ambos ficam fora da rota de Kinkaku-ji, no centro de Kyoto — exigem um deslocamento à parte (~20–30 min). Vale considerar só se sobrar tempo ou se for prioridade do grupo.",
      },
      {
        titulo: "Como voltar para o hotel no fim do dia?",
        resposta: "O mesmo ônibus 205 faz o caminho de volta — embarque na parada Kinkakuji-michi do lado oposto da rua, sentido Kyoto Station (~40–45 min, sem baldeação). De táxi, o trajeto direto cai para cerca de 20 minutos, uma boa opção para encerrar o dia sem pressa.",
      },
    ],
    pois: [
      {
        title: "Classic Kinkaku Reflection — Kyōko-chi",
        description:
          "O ângulo clássico do Pavilhão Dourado, com a fachada refletida no Kyōko-chi Pond — a foto mais icônica do templo, logo na entrada do circuito.",
        prioridade: "recomendado",
        ordem: 1,
        imagem: "/images/kinkakuji-reflection-kyokochi.webp",
        imagemAlt: "Vista clássica do Kinkaku-ji refletido no Kyōko-chi Pond",
      },
      {
        title: "Close Kinkaku View — lateral do lago",
        description:
          "Vista mais próxima do pavilhão pela lateral do lago, seguindo o circuito — dá pra ver melhor os detalhes da fachada dourada e dos telhados.",
        prioridade: "recomendado",
        ordem: 2,
        imagem: "/images/kinkakuji-close-view-lateral.webp",
        imagemAlt: "Vista lateral e mais próxima do Kinkaku-ji, pela margem do lago",
      },
      {
        title: "Elevated Kinkaku View — Sekkatei",
        description:
          "Vista elevada do pavilhão a partir do Sekkatei, a casa de chá no ponto mais alto do circuito — o fênix dourado (hōō) no topo do telhado fica bem visível daqui.",
        prioridade: "recomendado",
        ordem: 3,
        imagem: "/images/kinkakuji-elevated-view-sekkatei.webp",
        imagemAlt: "Fênix dourado (hōō) no topo do telhado do Kinkaku-ji, visto do Sekkatei",
      },
      {
        title: "Ryoan-ji",
        description:
          "Templo zen famoso pelo jardim de pedras — pega o mesmo ônibus/circuito de Kinkaku-ji, poucos minutos de distância.",
        prioridade: "recomendado",
        ordem: 4,
        imagem: "/images/kinkakuji-ryoanji.webp",
        imagemAlt: "Jardim de pedras do templo zen Ryoan-ji, em Kyoto",
      },
      {
        title: "Ninna-ji",
        description:
          "Templo histórico com belas cerejeiras, um pouco mais além de Ryoan-ji no mesmo circuito.",
        prioridade: "opcional",
        ordem: 5,
        imagem: "/images/kinkakuji-ninnaji.webp",
        imagemAlt: "Templo histórico de Ninna-ji, em Kyoto",
      },
      {
        title: "Museu do Mangá de Kyoto",
        description:
          "Acervo com milhares de títulos de mangá — fica no centro de Kyoto (Karasuma-Oike), fora da rota de Kinkaku-ji: exige um deslocamento à parte (~20-30 min), não dá pra encaixar sem voltar ao centro.",
        prioridade: "opcional",
        ordem: 6,
        imagem: "/images/kyoto-manga-museum.webp",
        imagemAlt: "Museu do Mangá de Kyoto",
      },
      {
        title: "Nintendo Store Kyoto",
        description:
          "Loja oficial da Nintendo no Takashimaya, no centro de Kyoto — também fora da rota de Kinkaku-ji, exige o mesmo deslocamento ao centro do Museu do Mangá.",
        prioridade: "opcional",
        ordem: 7,
        imagem: "/images/nintendo-store-kyoto.webp",
        imagemAlt: "Nintendo Store Kyoto, no Takashimaya",
      },
      {
        title: "Castelo de Nijo",
        description:
          "Antiga residência dos xoguns Tokugawa em Kyoto, Patrimônio Mundial da UNESCO, com o Palácio Ninomaru e jardins amplos — fica mais central, entre Kinkaku-ji e a Kyoto Station, então também exige um deslocamento à parte.",
        prioridade: "opcional",
        ordem: 8,
        imagem: "/images/nijo-castle-kyoto.webp",
        imagemAlt: "Castelo de Nijo em Kyoto, com cerejeiras em flor à frente do Palácio Ninomaru",
      },
    ],
    gastronomia: {
      itens: [{ nome: "Unagi-don", descricao: "Enguia grelhada sobre arroz." }],
      curadoriaLabel: "Opções selecionadas — Jantar com unagi (~19h)",
      curadoria: [
        {
          nome: "Unasho Kinkakuji-ten (鰻匠 金閣寺店) / Charcoal Grilled Eel Doikatsuman Kinkakuji Branch",
          papel: "Mais prático (na rota)",
          categoria: "Unagi (enguia grelhada no carvão)",
          descricao:
            "Especializada em unagi grelhada no carvão, a mais próxima do Kinkaku-ji entre as opções da região. Renomeada de \"Doi Katsuman\" para \"Unasho\" em fev/2024, mas ainda aparece com o nome antigo — Charcoal Grilled Eel Doikatsuman Kinkakuji Branch — no Tripadvisor, SAVOR JAPAN, Wanderlog e KKday: é o mesmo lugar, mesmo endereço e mesma página do Tabelog.",
          foto: "/images/unasho-kinkakuji.webp",
          notaTabelog: "3.10",
          numAvaliacoes: "27 avaliações",
          faixaPreco: "¥3.000–3.999",
          distancia: "~5 min a pé do Kinkaku-ji",
          foreignFriendly: "Alto — cardápio em inglês confirmado, ampla gama de pagamentos digitais.",
          horario: "11h–20h, todos os dias (último pedido 19h)",
          pagamento: "Cartão, IC card e QR code (PayPay, d払い, Rakuten Pay, au PAY) aceitos",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260501/26040795/",
        },
        {
          nome: "Masa-katsu (まさ活)",
          papel: "Melhor custo-benefício",
          categoria: "Unagi (enguia grelhada)",
          descricao:
            "Opção mais em conta da região para unagi-don, na mesma área de Kitano Hakubaicho — perto do Kinkaku-ji.",
          foto: "/images/masakatsu-kinkakuji.webp",
          economico: true,
          notaTabelog: "3.08",
          numAvaliacoes: "25 avaliações",
          faixaPreco: "¥1.000–1.999",
          distancia: "Região de Kitano Hakubaicho, próximo ao Kinkaku-ji",
          foreignFriendly: "Médio — cardápio multilíngue (inglês) disponível; reserva só online.",
          horario: "sáb–dom 11h–22h (aberto no fim de semana) — fechado às quartas",
          pagamento: "Somente dinheiro — não aceita cartão nem pagamento digital",
          linkTabelog: "https://tabelog.com/en/kyoto/A2601/A260501/26014823/",
        },
        {
          nome: "Unagi no Naruse — Kinkaku-ji-ten (鰻の成瀬 金閣寺店)",
          papel: "Opção diferente",
          categoria: "Unagi (rede nacional especializada, unadon a partir de ¥1.600)",
          descricao:
            "Filial (aberta em mar/2026) da maior rede especializada em unagi do Japão, com mais de 150 lojas — padrão de qualidade consistente a preço mais baixo que a média. Bem perto do Kinkaku-ji.",
          foto: "/images/unagi-naruse-kinkakuji.webp",
          economico: true,
          faixaPreco: "A partir de ¥1.600 (unadon)",
          distancia: "Próximo ao Kinkaku-ji (Kinugasa-kaido)",
          foreignFriendly: "Não confirmado — loja nova, recomendamos confirmar cardápio/atendimento em inglês antes de ir.",
          horario: "Não confirmado para esta loja específica — recomendamos checar por telefone ou site antes de ir.",
          alerta:
            "Loja recém-aberta (mar/2026), ainda com poucas avaliações no Tabelog — confirme horário de funcionamento no dia, já que os dados públicos são escassos.",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Kinkaku-ji",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Kinkaku-ji — em produção",
      },
    },
    banheirosProximos: [
      {
        local: "Banheiro público dentro do terreno do templo",
        nota: "Fica ao longo do circuito de visita, que é curto e de sentido único — não é preciso sair do terreno para encontrar um banheiro.",
      },
    ],
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
  resumoDia: {
    passos: [
      { titulo: "Café da Manhã", horario: "08:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Saída do Hotel", horario: "09:15", foto: "/images/icone-hotel2.webp" },
      { titulo: "Passeio por Ningyocho", horario: "09:45", foto: "/images/ningyocho.webp" },
      { titulo: "Almoço", horario: "12:30", foto: "/images/icone-gastronomia.webp" },
      { titulo: "Chegada ao Kokugikan", horario: "14:30", foto: "/images/kokugikan-ryogoku-sumo.webp" },
      { titulo: "Jantar com Chanko Nabe", horario: "18:00", foto: "/images/icone-gastronomia.webp" },
    ],
  },
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
  diaEmNumeros: {
    atracoes: "2 atrações principais",
    caminhada: "A definir",
    transporte: "~15 min de trem no total",
    linhasMetro: "2 linhas, 1 baldeação",
    ritmo: "Moderado",
    saida: "09:15",
    retorno: "A definir",
  },
  manha: {
    percursoEssencial: {
      duracao: "~1h35 (Ningyocho)",
      passos: [
        {
          titulo: "Shigemori Eishindo",
          foto: "/images/ningyoyaki.webp",
          horario: "09:50",
          descricao: "Fundada em 1917, é a casa mais tradicional de ningyoyaki de Ningyocho.",
        },
        {
          titulo: "Início da Amazake Yokocho",
          foto: "/images/amazake-yokocho.webp",
          horario: "10:10",
          descricao: "Viela de cerca de 400 metros que leva até o Teatro Meiji-za.",
        },
        {
          titulo: "Toritada",
          foto: "/images/toritada.webp",
          horario: "10:15",
          descricao: "Avícola fundada em 1911, tradicional em Amazake Yokocho.",
        },
        {
          titulo: "Hikokuro",
          foto: "/images/gyokueido-hikokuro.webp",
          horario: "10:35",
          descricao: "Gyokueido Hikokuro, casa de doces japoneses fundada em 1576 em Kyoto.",
        },
        {
          titulo: "Edo Rakugo Karakuri Yagura",
          foto: "/images/ningyocho.webp",
          horario: "11:00",
          descricao: "Torre-relógio karakuri ao lado do Suitengu.",
        },
        {
          titulo: "Suitengu (opcional)",
          foto: "/images/suitengu.webp",
          horario: "~11:20",
          descricao: "Santuário xintoísta fundado em 1818 — referência nacional em orações por parto seguro. Não é uma visita essencial; como fica bem no caminho, vale entrar rapidamente se estiver passando por perto, mas pode seguir o passeio sem essa parada.",
        },
      ],
    },
    visaoAnotada: {
      titulo: "Ningyocho",
      imagem: "/images/raiox-ningyocho.webp",
      imagemAlt: "Raio-X Alpinea de Ningyocho com Ningyocho Station, Amazake Yokocho, Ningyocho Mechanic Clock, Nihonbashi e Suitengu Shrine",
      comentarios: [
        "Dependendo de como você organizou a volta de Kyoto, você pode ter chegado a Tóquio na noite anterior ou somente nesta manhã.",
        "Hoje isso não é um grande problema, porque começaremos por uma região que não exige chegar extremamente cedo.",
        "E antes de explicar o que fazer, vale entender por que coloquei Ningyocho neste roteiro.",
        "O que é Ningyocho? O nome (人形町) significa literalmente algo próximo de \"bairro das bonecas\".",
        "Durante o período Edo, essa região se desenvolveu como um importante centro de entretenimento popular, com teatros e apresentações. Artesãos ligados à produção de bonecos e marionetes também se estabeleceram por aqui, e essa história acabou permanecendo no próprio nome do bairro.",
        "Hoje, porém, Ningyocho é interessante por outro motivo: é uma oportunidade de conhecer uma Tóquio muito menos turística.",
        "Você não encontrará enormes atrações, arranha-céus ou multidões de estrangeiros. É um bairro relativamente pequeno, tradicional e muito fácil de explorar caminhando.",
        "E foi justamente por isso que coloquei esta região no roteiro. Você comentou que gostaria de conhecer também lugares que fazem parte da vida cotidiana da cidade, e não somente os grandes pontos turísticos — Ningyocho cumpre muito bem esse papel.",
        "Os relógios mecânicos: um dos símbolos curiosos do bairro são os relógios mecânicos de Ningyocho. Eles não são enormes e existem relógios desse tipo muito maiores em outras regiões do Japão, mas aqui eles fazem bastante sentido justamente pela história do bairro.",
        "Em determinados horários, o mecanismo entra em funcionamento e pequenas figuras aparecem no relógio, criando uma espécie de apresentação com personagens relacionados à cultura tradicional de Edo. É uma atração simples, que dura poucos minutos, mas é bastante característica de Ningyocho.",
        "Como esses mecanismos podem passar por manutenção — inclusive um deles pode estar indisponível durante sua viagem — confira no próprio roteiro as informações atualizadas de funcionamento e horários antes de esperar pela apresentação. Se coincidir com o momento em que você estiver passando, vale parar para assistir.",
        "Aqui, a ideia é comer pelo caminho: uma das melhores coisas para fazer em Ningyocho é simplesmente andar e experimentar pequenas coisas.",
        "A região possui várias lojas tradicionais especializadas em doces, biscoitos, senbei, ningyoyaki e outros pequenos alimentos japoneses. Alguns estabelecimentos estão aqui há muitas décadas e existem produtos que você dificilmente encontrará reunidos com essa concentração em outras partes do roteiro.",
        "Minha sugestão é não escolher uma única loja. Entre em uma, compre alguma coisa pequena. Continue caminhando. Encontre outra que pareça interessante, experimente mais alguma coisa. Vá beliscando pelo caminho.",
        "Não precisa transformar isso em uma grande experiência gastronômica. A graça está justamente em caminhar pelo bairro e experimentar aquilo que chamar sua atenção até chegar a hora do almoço.",
        "Suitengu: na região fica também um conhecido santuário xintoísta de Tóquio. Depois de todos os templos e santuários que já vimos durante a viagem, não considero uma visita essencial — arquitetonicamente, provavelmente não será algo mais impressionante do que aquilo que você já conheceu em Kyoto.",
        "Mas você estará praticamente ao lado. Então, se estiver passando pela região e quiser entrar, vale uma visita rápida. Caso contrário, pode seguir o passeio sem nenhuma preocupação.",
        "Almoce em Ningyocho: minha recomendação é fazer o almoço ainda nesta região. Ningyocho possui vários restaurantes tradicionais interessantes e é um ótimo lugar para uma refeição antes de seguirmos para o principal compromisso do dia.",
      ],
      pontos: [
        {
          titulo: "Shigemori Eishindo",
          descricao:
            "Fundada em 1917, é a casa mais tradicional de ningyoyaki de Ningyocho — bolinhos fofos em formato de rosto ou dos sete deuses da sorte, recheados de pasta de feijão azuki. Vende em média 3 mil unidades por dia, chegando a 10 mil em dias de pico.",
          foto: "/images/ningyoyaki.webp",
          ordem: 1,
        },
        {
          titulo: "Início da Amazake Yokocho",
          descricao:
            "Viela de cerca de 400 metros que leva até o Teatro Meiji-za, batizada em homenagem a uma loja de amazake (saquê doce) que ficava na entrada, no início da era Meiji. Sobreviveu ao Grande Terremoto de Kanto e reúne até hoje doçarias, izakayas e lojas de artesanato tradicionais.",
          foto: "/images/amazake-yokocho.webp",
          ordem: 2,
        },
        {
          titulo: "Toritada",
          descricao:
            "Avícola fundada em 1911, tradicional em Amazake Yokocho — trabalha com as três principais raças de frango do Japão e pato fresco. Seu tamagoyaki (omelete enrolada) é o item mais pedido, famoso por durar bem e virar lembrancinha.",
          foto: "/images/toritada.webp",
          ordem: 3,
        },
        {
          titulo: "Hikokuro",
          descricao:
            "Gyokueido Hikokuro, casa de doces japoneses fundada em 1576 em Kyoto, com filial em Nihonbashi desde 1954. Marcas registradas: o torayaki, massa fofa recheada com feijão azuki graúdo de Hokkaido, e a warabi mochi, elástica e macia, finalizada com kinako (farinha de soja torrada).",
          foto: "/images/gyokueido-hikokuro.webp",
          ordem: 4,
        },
        {
          titulo: "Edo Rakugo Karakuri Yagura",
          descricao:
            "Torre-relógio karakuri ao lado do Suitengu, próxima a Nihonbashi-Ningyocho 2-chome — a cada hora cheia (das 11h às 19h), as cortinas se abrem e um boneco contador de rakugo narra, por 2 a 3 minutos, a história de como o bairro ganhou seu nome. A outra torre de Ningyocho, com tema dos machibikeshi (bombeiros de Edo), está temporariamente removida por causa das obras do metrô — por isso não entra como parada garantida.",
          foto: "/images/ningyocho.webp",
          ordem: 5,
        },
        {
          titulo: "Suitengu",
          descricao:
            "Santuário xintoísta fundado em 1818 pelo senhor feudal de Kurume — referência nacional em orações por parto seguro e proteção infantil. A tradição nasceu de uma faixa de barriga feita com o cordão do sino do templo, usada por uma gestante no período Edo. A estátua Kodakara Inu, de uma cadela com seu filhote, é o símbolo do santuário.",
          foto: "/images/suitengu.webp",
          ordem: 6,
        },
      ],
    },
    regiao: {
      nome: "Ningyocho · Tokyo",
      descricao:
        "Bairro do shitamachi de Tóquio, erguido sobre um brejo aterrado no início do período Edo. Ganhou o apelido de \"cidade das bonecas\" por abrigar teatros de kabuki e bunraku e os artesãos que faziam as bonecas usadas nos espetáculos — a produção migrou para Asakusa ainda no século 19, mas o nome ficou.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Takaracho",
        nomeJapones: "宝町駅",
        distancia: "~1 min a pé do remm Tokyo Kyobashi",
        saida: "Saída A7",
      },
      linha: { codigo: "A12", nome: "Toei Asakusa Line", cor: "#D04E3C", logo: "/images/toei-mark.webp" },
      estacoesIntermediarias: [{ nome: "Nihombashi", nomeJapones: "日本橋", numero: "A13" }],
      estacaoDestino: {
        nome: "Estação Ningyocho",
        nomeJapones: "人形町駅",
        saida: "Saída A2",
        foto: "/images/ningyocho-station-entrance.webp",
        mapa: "/images/ningyocho-station-map.webp",
        mapaAlt: "Mapa da Estação Ningyocho/Suitengumae (Hibiya Line e Toei Asakusa Line)",
      },
      opcoes: [
        {
          meio: "Metrô",
          tempo: "≈5 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Linha direta (Toei Asakusa Line), sem baldeação — Takaracho (A12) → Ningyocho (A14), passando por Nihombashi (A13).",
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
    atracaoPrincipalImagem: "/images/ningyocho.webp",
    detalhesPraticos: [
      {
        label: "Comércio tradicional",
        valor: "Boa parte das lojas centenárias de Ningyocho e da Amazake Yokocho prefere dinheiro — nem todas aceitam cartão.",
      },
      { label: "Suitengu", valor: "Terreno aberto 8h–17h · escritório de amuletos até 15h30 (com exceções)" },
      {
        label: "Amazake Yokocho",
        valor: "Viela de ~400 m entre lojas tradicionais e o Teatro Meiji-za, no meio do circuito a pé.",
      },
      {
        label: "Melhor horário",
        horarioDestaque: "09h45–12h30",
        valor:
          "Janela reservada da manhã, com o bairro ainda tranquilo antes do movimento de almoço — dá tempo de terminar no Suitengu e seguir para o almoço das 12h30 sem pressa, antes do deslocamento à tarde para o Kokugikan.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/placeholder-em-producao.webp",
      imagemAlt: "Visão geral do trajeto a pé em Ningyocho — em produção",
      nota: "Mapa de trajeto a pé em produção.",
    },
    pois: [],
    gastronomia: {
      subtitulo: "Almoço · 12:30–13:45",
      itens: [
        {
          nome: "Almoço em Ningyocho",
          descricao:
            "Janela reservada logo após o Suitengu, antes do deslocamento para o Kokugikan — restaurante a confirmar com a equipe Alpinea.",
        },
      ],
      curadoriaLabel: "Opções selecionadas — Almoço (12h30–13h45)",
      curadoria: [
        {
          nome: "Tamahide (玉ひで)",
          papel: "Experiência mais especial",
          categoria: "Oyakodon (berço do prato, desde 1760)",
          descricao:
            "Casa com mais de 250 anos, criadora do oyakodon — receita de família mantida em segredo. A 1 min a pé da Estação Ningyocho.",
          foto: "/images/tamahide-ningyocho.webp",
          notaTabelog: "3.49",
          numAvaliacoes: "1.792 avaliações",
          faixaPreco: "¥2.000–2.999 no almoço",
          distancia: "1 min a pé da Estação Ningyocho",
          foreignFriendly: "Médio — site em inglês/chinês/coreano disponível, sem confirmação de cardápio em inglês.",
          horario: "seg–sáb e feriados 11h30–13h30 · dom 11h30–13h30 (só almoço)",
          pagamento: "Cartão, IC card e QR code (inclusive Alipay/WeChat Pay) aceitos",
          alerta:
            "Costuma formar fila — chegue com folga dado o horário limitado antes do deslocamento ao Kokugikan; atendimento só até 13h30.",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130204/13003073/",
        },
        {
          nome: "Oga Wa (おが和)",
          papel: "Melhor custo-benefício",
          categoria: "Yakitori-jū (arroz com frango grelhado)",
          descricao:
            "Casa tradicional de yakitori famosa pelo \"yakitori-jū\" — arroz coberto de frango grelhado glaceado, ótimo para viagem.",
          foto: "/images/ogawa-ningyocho.webp",
          economico: true,
          notaTabelog: "3.69",
          numAvaliacoes: "1.429 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço",
          distancia: "Em Ningyocho, poucos minutos da Estação Ningyocho",
          foreignFriendly: "Médio — reconhecida no Tabelog 100, reserva só online.",
          horario: "seg–sex 11h25–13h30 e 17h30–21h30 — fechada sáb/dom",
          pagamento: "PayPay aceito — não aceita cartão nem dinheiro eletrônico",
          alerta: "Também costuma ter fila — considere pedir para viagem se o tempo estiver curto.",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130204/13063782/",
        },
        {
          nome: "Yoshoku Koharuken (洋食 小春軒)",
          papel: "Mais prático",
          categoria: "Yoshoku (cozinha ocidental à japonesa) — Katsudon",
          descricao:
            "Casa centenária de yoshoku, famosa pelo katsudon exclusivo da casa — selecionada duas vezes entre os 100 melhores yoshoku do Tabelog.",
          foto: "/images/yoshoku-koharuken.webp",
          economico: true,
          notaTabelog: "3.49",
          numAvaliacoes: "1.149 avaliações",
          faixaPreco: "¥1.000–1.999",
          distancia: "1 min a pé da Estação Ningyocho",
          foreignFriendly: "Médio — página em inglês no Tabelog, sem confirmação de cardápio em inglês.",
          horario: "seg–sex 11h–13h30 e 17h–20h · sáb 11h–13h30 — fechado dom/feriados",
          pagamento: "Dinheiro e cartões de transporte (Suica etc.) — não aceita cartão de crédito nem QR code",
          linkTabelog: "https://tabelog.com/en/tokyo/A1302/A130204/13003031/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Ningyocho",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Ningyocho — em produção",
      },
    },
    banheirosProximos: [
      {
        local: "Estação Ningyocho (A14, Toei Asakusa Line)",
        nota: "Banheiro multifuncional dentro da própria estação — mesma saída A2 usada na chegada.",
      },
      {
        local: "Centro Comunitário de Ningyocho (人形町区民館)",
        endereco: "6º andar",
        nota: "Banheiro acessível \"para todos\", aberto ao público — opção de apoio no meio do circuito a pé.",
      },
    ],
  },
  tarde: {
    label: "Tarde",
    // Sem percursoEssencial aqui de propósito — o "percurso" da tarde é o
    // próprio estádio (entrar e assistir ao torneio), não um circuito a pé
    // pelos arredores. Edo Noren, Santuário Nomi-no-Sukune e Museu de
    // Espadas já aparecem como pois opcionais logo abaixo, sem duplicar.
    visaoAnotada: {
      titulo: "Ryogoku",
      imagem: "/images/raiox-ryogoku.webp",
      imagemAlt: "Raio-X Alpinea dos arredores do Kokugikan com Ryōgoku Kokugikan, Museu Edo-Tokyo, Ryōgoku Edo NOREN, The Japanese Sword Museum e Yokoamicho Park",
      comentarios: [
        "Depois disso, vamos para Ryogoku. É ali que fica o Ryogoku Kokugikan, uma das casas mais importantes do sumô profissional japonês.",
        "O deslocamento é relativamente curto, então procure chegar à região com antecedência em relação às lutas que queremos acompanhar.",
        "Ryogoku — entrando no mundo do sumô: quando você chegar, provavelmente vai perceber imediatamente que o bairro possui uma relação completamente diferente com o esporte.",
        "É comum encontrar referências ao sumô em restaurantes, monumentos, lojas e estabelecimentos da região — e não é raro cruzar com lutadores pelas ruas. Nos dias de torneio, naturalmente, tudo isso fica ainda mais evidente.",
        "A programação do sumô começa cedo e vai aumentando de importância ao longo do dia. As divisões inferiores lutam primeiro e os principais lutadores aparecem mais tarde. Portanto, não precisa necessariamente permanecer dentro do estádio desde o começo da manhã.",
        "A ideia é chegar com antecedência suficiente para conhecer o Kokugikan com calma, encontrar seu lugar e acompanhar a parte mais importante da programação sem correria.",
        "Se sobrar tempo em Ryogoku, existem algumas coisas interessantes nos arredores. Uma delas é o Sumo Museum, localizado no próprio Ryōgoku Kokugikan — um museu pequeno, mas com objetos, gravuras e materiais relacionados à história do esporte. O acesso e funcionamento podem variar durante períodos de torneio, então consulte as informações atualizadas no roteiro.",
        "Existe também o Japanese Sword Museum, dedicado à tradição das espadas japonesas. Não considero uma prioridade desta viagem, mas, se você tiver interesse específico em nihonto, pode ser uma visita interessante — uma oportunidade de observar de perto peças históricas e entender um pouco melhor a importância artesanal e cultural da espada no Japão.",
        "Edo-Tokyo Museum: outra atração extremamente importante da região, e essa, particularmente, considero muito mais interessante.",
        "O museu conta a transformação de Edo na metrópole que hoje conhecemos como Tóquio, utilizando reconstruções, objetos históricos e grandes maquetes para mostrar como a cidade se desenvolveu ao longo dos séculos — é um museu bastante visual e diferente de simplesmente caminhar por salas cheias de objetos em vitrines.",
        "O edifício passou por uma longa reforma e, portanto, a possibilidade de visita dependerá da situação de funcionamento nas datas da sua viagem. Se estiver aberto, houver tempo disponível e você quiser acrescentar um museu ao dia, é minha principal recomendação nesta região.",
        "Uma curiosidade: os Yokozuna. O título máximo que um lutador pode alcançar no sumô é Yokozuna — não é simplesmente uma divisão superior, mas uma distinção concedida apenas aos grandes campeões que atingem critérios excepcionais dentro do esporte.",
        "Existe em Tóquio um monumento chamado Yokozuna Rikishi-hi, onde estão registrados os grandes lutadores que receberam esse título ao longo da história. Ele fica no Tomioka Hachimangu, não exatamente ao lado do Kokugikan, então eu não faria um deslocamento específico até lá hoje apenas para conhecê-lo — mas vale saber que existe, porque demonstra o peso histórico que o título de Yokozuna possui dentro da cultura japonesa.",
        "E depois do sumô: chanko-nabe? Para terminar, existe uma experiência gastronômica que faz bastante sentido justamente em Ryogoku.",
        "É um grande nabe, uma espécie de panela quente japonesa preparada com caldo, carnes, peixes, tofu e vegetais. Ele ficou famoso principalmente por sua associação com os lutadores de sumô, que tradicionalmente consomem refeições extremamente nutritivas e calóricas durante seus treinamentos.",
        "E já deixo um aviso: é bastante comida. As opções que coloquei no roteiro tendem a servir refeições generosas, então não vá esperando um jantar particularmente leve.",
        "Você também não precisa jantar em Ryogoku. Se estiver cansado ou simplesmente não estiver com fome depois do torneio, pode voltar para outra região e comer qualquer outra coisa.",
        "Mas existe um motivo para eu ter colocado essa sugestão aqui: você encontrará chanko-nabe em outros lugares do Japão, naturalmente, mas em nenhum outro lugar essa refeição estará tão ligada ao contexto do dia quanto em Ryogoku.",
        "Você acabou de assistir a um torneio de sumô, está no bairro historicamente associado ao esporte e provavelmente passou o dia inteiro vendo referências aos lutadores. Então, se tiver curiosidade, este é o momento.",
        "Mais do que simplesmente jantar, é uma maneira de terminar o dia continuando a experiência cultural que começou dentro do Kokugikan.",
      ],
    },
    regiao: {
      nome: "Ryogoku · Tokyo",
      descricao:
        "Bairro às margens do Rio Sumida onde fica o Kokugikan, o estádio nacional de sumô — coração do esporte em Tóquio, com estábulos de lutadores (heya), restaurantes de chanko nabe e uma vila gastronômica temática, a Ryōgoku Edo NOREN, bem na entrada da estação.",
    },
    deslocamento: {
      estacaoOrigem: {
        nome: "Estação Ningyocho",
        nomeJapones: "人形町駅",
        saida: "Saída A2",
        foto: "/images/ningyocho-station-entrance.webp",
        mapa: "/images/ningyocho-station-map.webp",
        mapaAlt: "Mapa da Estação Ningyocho/Suitengumae (Hibiya Line e Toei Asakusa Line)",
      },
      linha: { codigo: "A14", nome: "Toei Asakusa Line", cor: "#D04E3C", logo: "/images/toei-mark.webp" },
      estacoesIntermediarias: [{ nome: "Asakusabashi", nomeJapones: "浅草橋", numero: "A16" }],
      baldeacao: true,
      estacaoDestino: {
        nome: "Estação Ryogoku",
        nomeJapones: "両国駅",
        saida: "Saída Oeste (Nishi-guchi)",
        foto: "/images/ryogoku-station-entrance.webp",
      },
      opcoes: [
        {
          meio: "Metrô + JR",
          tempo: "≈10 min",
          Icon: IconMetro,
          recomendado: true,
          detalhes: [
            "Toei Asakusa Line até Asakusabashi (A16, ~5 min, passando por Higashi-Nihombashi A15) + baldeação para a JR Sobu Line até Ryogoku (~5 min).",
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
    atracaoPrincipalImagem: "/images/kokugikan-ryogoku-sumo.webp",
    atracaoPrincipalFoco: "center",
    detalhesPraticos: [
      { label: "Entrada geral (no dia)", valor: "A partir de ¥2.200" },
      { label: "Cadeira", valor: "~¥3.500–8.500" },
      { label: "Box tatami (por pessoa)", valor: "~¥8.000–15.000" },
      {
        label: "Melhor horário",
        horarioDestaque: "14h30",
        valor:
          "É quando começa a cerimônia de entrada da 2ª divisão (Jūryō) — a partir daí o nível das lutas sobe, culminando na divisão principal (Makuuchi) às 15h45, sem precisar sentar pela manhã inteira para acompanhar as categorias inferiores.",
      },
    ],
    mapaVisaoGeral: {
      imagem: "/images/visaogeral-ryogoku.webp",
      imagemAlt: "Mapa dos arredores do Kokugikan com Ryōgoku Kokugikan, Museu Edo-Tokyo, Ryōgoku Edo NOREN, Yokoamicho Park e o Museu da Espada Japonesa",
      nota: "Localização do Kokugikan em relação ao Museu Edo-Tokyo, ao Yokoamicho Park e à vila gastronômica Ryōgoku Edo NOREN.",
    },
    decisoes: [
      {
        titulo: "Qual tipo de ingresso escolher?",
        resposta: "Entrada geral (a partir de ¥2.200) é a opção mais econômica; cadeira numerada (~¥3.500–8.500) garante lugar reservado; box tatami (~¥8.000–15.000 por pessoa, dividido entre até 4 pessoas) é a experiência mais tradicional, sentado no estilo japonês.",
      },
    ],
    pois: [
      {
        title: "Edo-Tokyo Museum",
        description:
          "Conta a transformação de Edo na metrópole que hoje conhecemos como Tóquio, usando reconstruções, objetos históricos e grandes maquetes — um museu bastante visual, diferente de simplesmente caminhar por salas de vitrines. O prédio passou por uma longa reforma, então a visita depende da situação de funcionamento nas datas da viagem — se estiver aberto e houver tempo disponível, é a principal recomendação de museu da região.",
        prioridade: "recomendado",
        ordem: 1,
      },
      {
        title: "Edo Noren (Área Externa do Kokugikan)",
        description: "Vila gastronômica temática de sumô, na entrada do estádio.",
        prioridade: "opcional",
        ordem: 2,
        imagem: "/images/edo-noren-ryogoku.webp",
        imagemAlt: "Interior do Ryōgoku Edo NOREN, réplica de um dohyō (ringue de sumô) cercada por lojas e restaurantes temáticos ao estilo de vila antiga",
      },
      {
        title: "Santuário Nomi-no-Sukune",
        description:
          "Monumento com os nomes de todos os Yokozuna (Título máximo de lutador de Sumô) — pertinho do Kokugikan.",
        prioridade: "opcional",
        ordem: 3,
        imagem: "/images/santuario-nomi-no-sukune.webp",
        imagemAlt: "Estátua de pedra de um lutador de sumô no Santuário Nomi-no-Sukune, cercada por árvores",
      },
      {
        title: "Museu de Espadas",
        description:
          "Coleção de espadas samurai tradicionais, a alguns minutos a pé do estádio — não é uma prioridade da viagem, mas pode valer a visita para quem tiver interesse específico em nihonto.",
        prioridade: "opcional",
        ordem: 4,
        imagem: "/images/museu-espadas-ryogoku.webp",
        imagemAlt: "Espadas samurai (katana) tradicionais em exibição no Museu de Espadas de Ryogoku",
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
      curadoriaLabel: "Opções selecionadas — Jantar com chanko nabe (~18h)",
      curadoria: [
        {
          nome: "Chanko Kirishima — Ryogoku Edo NOREN (両国江戸NOREN店)",
          papel: "Experiência mais especial",
          categoria: "Chanko Nabe (dirigida por ex-Ozeki Kirishima)",
          descricao:
            "Casa do ex-Ozeki (vice-campeão) de sumô Kirishima, dentro do complexo gastronômico Ryogoku Edo NOREN — a 1 min a pé do Kokugikan.",
          foto: "/images/chanko-kirishima-ryogoku.webp",
          notaTabelog: "3.44",
          numAvaliacoes: "324 avaliações",
          faixaPreco: "¥5.000–5.999 no jantar",
          distancia: "1 min a pé do Kokugikan (dentro do Ryogoku Edo NOREN)",
          foreignFriendly: "Alto — cardápio multilíngue (inglês, chinês, coreano), reserva online sem telefone.",
          horario: "11h–15h e 17h–22h — fechada às quartas",
          pagamento: "Cartão, IC card e QR code (PayPay, au PAY) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1312/A131201/13202196/",
        },
        {
          nome: "Ami Ryogoku (安美 両国)",
          papel: "Melhor custo-benefício",
          categoria: "Chanko Nabe (receita de heya/estábulo de sumô)",
          descricao:
            "Chanko nabe autêntico, receita passada por um estábulo (heya) de sumô — a um passo da Estação Ryogoku, aberta todos os dias.",
          foto: "/images/ami-ryogoku.webp",
          economico: true,
          notaTabelog: "3.47",
          numAvaliacoes: "513 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço / a partir de ¥6.000 no jantar em grupo — pratos avulsos ficam abaixo disso",
          distancia: "1 min a pé da Estação Ryogoku",
          foreignFriendly: "Alto — cardápio multilíngue em inglês, reserva online.",
          horario: "11h–0h, todos os dias (último pedido 23h30)",
          pagamento: "Cartão, IC card (Suica) e QR code (PayPay, nanaco, WAON) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1312/A131201/13025866/",
        },
        {
          nome: "Chanko Dojo Honten (ちゃんこ道場本店)",
          papel: "Mais prático (na rota)",
          categoria: "Chanko Nabe (9 tipos, com frutos do mar de Toyosu)",
          descricao:
            "Nove variedades de chanko nabe com ingredientes frescos direto do mercado de Toyosu — a 1 min a pé da Estação Ryogoku.",
          foto: "/images/chanko-dojo-honten.webp",
          economico: true,
          notaTabelog: "3.35",
          numAvaliacoes: "127 avaliações",
          faixaPreco: "¥1.000–1.999 no almoço / ¥4.000–4.999 no jantar",
          distancia: "1 min a pé da Estação Ryogoku",
          foreignFriendly: "Médio — página em inglês no Tabelog, reserva online.",
          horario: "seg, ter, sex–dom 11h30–14h e 17h–23h · qua–qui só jantar 17h–23h",
          pagamento: "Cartão, IC card, Edy, iD, QUICPay e QR code (inclusive Alipay/WeChat Pay) aceitos",
          linkTabelog: "https://tabelog.com/en/tokyo/A1312/A131201/13038737/",
        },
      ],
      mapa: {
        titulo: "Mapa — Refeições em Ryogoku",
        imagem: "/images/placeholder-em-producao.webp",
        imagemAlt: "Mapa de restaurantes em Ryogoku — em produção",
      },
    },
    galeria: {
      titulo: "Kokugikan em Detalhes",
      imagens: [
        {
          src: "/images/kokugikan-mapa-assentos.webp",
          alt: "Diagrama dos tipos de assento do Kokugikan — Isu-seki (cadeiras, 2F), Tamari-seki/Suna-kaburi (primeira fileira, saída da arena) e Masuseki (cabines de almofada, 1F)",
          legenda: "Tipos de assento: Isu-seki, Tamari-seki (Suna-kaburi) e Masuseki",
        },
      ],
    },
    infoOperacional: {
      titulo: "Regras da Associação de Sumô no Kokugikan",
      icone: "regras",
      itens: [
        {
          local: "Bagagem",
          nota: "Malas grandes que ultrapassem o espaço do próprio assento não são permitidas — só carrinhos de bebê, que ficam na recepção.",
        },
        {
          local: "Comida e bebida",
          nota: "Proibido entrar com garrafas, latas ou caixas térmicas — mas dá pra comprar chanko nabe e outras opções dentro do próprio Kokugikan.",
        },
        {
          local: "Fotografia",
          nota: "Flash e luzes são proibidos durante as lutas, tratados como ato de interferência pela Associação de Sumô.",
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
  badge: "HND-DXB",
  city: "Partida",
  date: "12 Mai",
  travel: true,
  travelNote:
    "Voo de volta decola às 00:05 pelo Aeroporto de Haneda (HND) — voo EK313, terminal 3 —, logo após a virada do dia. Dia reservado para preparar a bagagem e seguir para o aeroporto — sem tempo útil para passeios.",
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
        : "border-[#D04E3C]/40 bg-[#D04E3C]/10 text-[#D04E3C]";
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
                loading="lazy"
              src={imagens[0].src}
              alt={imagens[0].alt}
              style={poi.imagemPosicao ? { objectPosition: poi.imagemPosicao } : undefined}
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
                  <img
                loading="lazy" src={img.src} alt={img.alt} className="h-full w-full object-cover" />
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
          <span className={`text-sm font-semibold ${s.text}`}>
            {poi.title}
          </span>
          {poi.prioridade === "opcional" ? (
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
        {poi.horario && (
          <p className={`flex items-center gap-1 text-[11px] font-medium ${s.muted}`}>
            <IconClock className="h-3 w-3 shrink-0" />
            {poi.horario}
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
        {poi.alerta && <InlineAlert text={poi.alerta} />}
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
                loading="lazy"
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

function BanheirosProximosBlock({
  itens,
}: {
  itens: NonNullable<Period["banheirosProximos"]>;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/60">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-7"
      >
        <IconToilet className="h-20 w-20 shrink-0 text-[#000000]" />
        <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#24211D]/70 sm:text-lg">
          Banheiros Públicos Mais Próximos
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-[#24211D]/45 transition-transform duration-200 ${
            aberto ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {aberto && (
        <div className="space-y-3.5 px-5 pb-5">
          {itens.map((b, i) => (
            <div key={b.local} className={i > 0 ? "border-t border-[#DDD8CF] pt-3.5" : ""}>
              <p className="text-sm font-semibold text-[#24211D]">{b.local}</p>
              {b.endereco && (
                <p className="mt-0.5 text-xs text-[#24211D]/60">{b.endereco}</p>
              )}
              {b.nota && (
                <p className="mt-1 text-xs leading-5 text-[#24211D]/70">{b.nota}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const INFO_OPERACIONAL_ICONS: Record<
  NonNullable<Period["infoOperacional"]>["icone"],
  (props: { className?: string }) => ReactElement
> = {
  acessibilidade: IconAccessible,
  bagagem: IconSuitcase,
  encontro: IconMeetingPoint,
  entrada: IconDoorEnter,
  reserva: IconTicket,
  regras: IconAlertTriangle,
  chuva: IconUmbrella,
  descanso: IconBench,
};

function InfoOperacionalBlock({
  info,
}: {
  info: NonNullable<Period["infoOperacional"]>;
}) {
  const [abertoState, setAberto] = useState(false);
  const Icon = INFO_OPERACIONAL_ICONS[info.icone];
  // Cards de "regras" carregam risco real (multa, restrição) — destacados em
  // vermelho, diferente dos demais temas (acessibilidade, bagagem etc.), que
  // seguem o laranja neutro padrão.
  const isRegra = info.icone === "regras";
  const aberto = info.semExpandir || abertoState;

  return (
    <div
      className={`mb-5 rounded-2xl border ${
        isRegra ? "border-red-200 bg-red-50/60" : "border-orange-200 bg-orange-50/60"
      }`}
    >
      {info.semExpandir ? (
        <div className="flex w-full items-center gap-4 p-5 text-left sm:p-7">
          {/* h-20 w-20 casa com a caixa dos ícones em PNG (Informações
              Iniciais, Melhor Horário) — mas esses ícones em SVG ocupam o
              viewBox quase de ponta a ponta, sem a margem interna que os
              PNGs já trazem embutida. Por isso o glyph em si fica menor
              (h-12), centralizado na mesma caixa h-20, pra ter o mesmo peso
              visual dos outros cards. */}
          <span className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Icon className={`h-12 w-12 ${isRegra ? "text-red-600" : "text-[#000000]"}`} />
          </span>
          <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#24211D]/70 sm:text-lg">
            {info.titulo}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-center gap-4 p-5 text-left sm:p-7"
        >
          <span className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Icon className={`h-12 w-12 ${isRegra ? "text-red-600" : "text-[#000000]"}`} />
          </span>
          <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#24211D]/70 sm:text-lg">
            {info.titulo}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 text-[#24211D]/45 transition-transform duration-200 ${
              aberto ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
      {aberto && (
        <div className="space-y-3.5 px-5 pb-5">
          {info.itens.map((b, i) => (
            <div key={b.local} className={i > 0 ? "border-t border-[#DDD8CF] pt-3.5" : ""}>
              <p className="text-sm font-semibold text-[#24211D]">{b.local}</p>
              {b.endereco && (
                <p className="mt-0.5 text-xs text-[#24211D]/60">{b.endereco}</p>
              )}
              {b.nota && (
                <p className="mt-1 text-xs leading-5 text-[#24211D]/70">{b.nota}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Card de horário loja a loja — sempre aberto (sem accordion), já que essa
// é justamente a informação que o usuário quer ver de cara, sem precisar
// clicar. Cada loja citada no roteiro aparece com seu próprio horário.
function HorarioLojasBlock({
  itens,
}: {
  itens: NonNullable<Period["horarioLojas"]>;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/60 p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3 sm:gap-4">
        <IconClock className="h-14 w-14 shrink-0 text-[#000000] sm:h-20 sm:w-20" />
        <span className="min-w-0 flex-1 text-sm font-bold uppercase tracking-[0.12em] text-[#24211D]/70 sm:text-lg sm:tracking-[0.2em]">
          Horário das Lojas
        </span>
      </div>
      <div className="space-y-3">
        {itens.map((b, i) => (
          <div
            key={b.nome}
            className={`flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
              i > 0 ? "border-t border-[#DDD8CF] pt-3" : ""
            }`}
          >
            <p className="min-w-0 text-sm font-semibold text-[#24211D] sm:flex-1">{b.nome}</p>
            <p className="text-xs text-[#24211D]/70 sm:shrink-0 sm:text-right">{b.horario}</p>
          </div>
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
    <div className="mb-10 rounded-2xl bg-black p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white">
          Resumo do Dia
        </p>
        <p className="shrink-0 text-[10px] font-medium text-white/45">
          Arraste para o lado →
        </p>
      </div>
      <div className="relative">
        <div className="overflow-x-auto pb-1">
        <div className="flex w-max shrink-0 mx-auto">
        {resumo.passos.map((passo, i) => (
          <div key={passo.titulo + i} className="flex shrink-0 items-start">
            <div className="group flex w-20 shrink-0 cursor-default flex-col items-center text-center sm:w-24">
              {passo.foto ? (
                passo.foto.includes("/images/icone-") ? (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition duration-200 group-hover:scale-110 group-hover:shadow-[0_0_0_3px_rgba(255,255,255,0.25)] sm:h-11 sm:w-11 ${
                      passo.foto.includes("icone-gastronomia")
                        ? "bg-amber-50"
                        : passo.foto.includes("icone-hotel")
                          ? "bg-[#E7F4E9]"
                          : "bg-white"
                    }`}
                  >
                    <img
                loading="lazy"
                      src={passo.foto}
                      alt={passo.titulo}
                      className={
                        passo.foto.includes("icone-gastronomia")
                          ? "h-9 w-9 object-contain sm:h-10 sm:w-10"
                          : passo.foto.includes("icone-hotel")
                            ? "h-7 w-7 object-contain sm:h-8 sm:w-8"
                            : "h-7 w-7 object-contain sm:h-7 sm:w-7"
                      }
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm transition duration-200 group-hover:scale-110 group-hover:shadow-[0_0_0_3px_rgba(255,255,255,0.25)] sm:h-11 sm:w-11">
                    <img
                loading="lazy"
                      src={passo.foto}
                      alt={passo.titulo}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-white/25 text-white/40 transition duration-200 group-hover:scale-110 group-hover:border-white/50 group-hover:text-white/70 sm:h-11 sm:w-11">
                  <IconClock className="h-4 w-4" />
                </div>
              )}
              <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-tight text-white transition duration-200 group-hover:text-white/80 sm:text-xs">
                {passo.titulo}
              </p>
              {passo.horario && (
                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium tracking-wide text-white/55">
                  {passo.horario}
                </p>
              )}
            </div>
            {i < resumo.passos.length - 1 && (
              <span className="mt-5 h-[2px] w-3 shrink-0 rounded-full bg-white/20 sm:mt-5 sm:w-4" />
            )}
          </div>
        ))}
        </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
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
  const [zoomedFoto, setZoomedFoto] = useState<{ src: string; alt: string; endereco?: string } | null>(null);
  const temRestaurantes = gastronomia.restaurantes && gastronomia.restaurantes.length > 0;
  const temCuradoria = gastronomia.curadoria && gastronomia.curadoria.length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <img
                loading="lazy"
          src="/images/icone-gastronomia.webp"
          alt=""
          className="h-20 w-20 shrink-0 object-contain"
          style={{ filter: "brightness(0) saturate(100%)" }}
        />
        <div>
          <p className="text-base font-bold uppercase tracking-[0.2em] text-[#24211D]/70 sm:text-lg">
            {gastronomia.titulo ?? "Gastronomia"}
          </p>
          {gastronomia.subtitulo && (
            <p className="mt-1 text-sm text-[#24211D]/65">
              {gastronomia.subtitulo}
            </p>
          )}
        </div>
      </div>

      {gastronomia.intro && (
        <p className="mt-3 text-sm leading-6 text-[#24211D]/78">
          {gastronomia.intro}
        </p>
      )}

      {gastronomia.alerta && <InlineAlert text={gastronomia.alerta} />}

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
                loading="lazy"
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
                    <div className="mt-3 space-y-1.5 border-t border-[#DDD8CF] pt-3 text-[11px] leading-5 text-[#24211D]/60">
                      {r.localizacao && (
                        <p className="flex items-center gap-1.5">
                          <IconPin className="h-3 w-3 shrink-0" />
                          <span>{r.localizacao}</span>
                        </p>
                      )}
                      {r.preco && (
                        <p className="flex items-center gap-1.5">
                          <span className="w-3 shrink-0 text-center text-[10px] font-semibold">¥</span>
                          <span>{r.preco}</span>
                        </p>
                      )}
                      {r.horario && (
                        <p className="flex items-center gap-1.5">
                          <IconClockOutline className="h-3 w-3 shrink-0" />
                          <span>{r.horario}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {temCuradoria && (
        <>
          {gastronomia.curadoriaLabel && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#24211D]/45">
              {gastronomia.curadoriaLabel}
            </p>
          )}
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${gastronomia.curadoriaLabel ? "mt-2" : "mt-4"}`}>
            {gastronomia.curadoria!.map((r) => (
              <div
                key={r.nome}
                className={`flex flex-col overflow-hidden rounded-2xl border ${
                  r.economico
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-[#DDD8CF] bg-[#FDFCF9]"
                }`}
              >
                {r.foto && (
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedFoto({ src: r.foto!, alt: r.nome, endereco: r.distancia })
                    }
                    className="group relative block aspect-[4/3] w-full overflow-hidden"
                  >
                    <img
                loading="lazy"
                      src={r.foto}
                      alt={r.nome}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {r.papel.toLowerCase().includes("custo-benefício") && (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        {r.papel}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                      <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <IconZoom className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                )}
                <div className="flex flex-1 flex-col p-4">
                  {!r.foto && r.papel.toLowerCase().includes("custo-benefício") && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {r.papel}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-[#24211D]">{r.nome}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#24211D]/45">
                    {r.categoria}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#24211D]/78">
                    {r.descricao}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-[#DDD8CF] pt-3 text-[11px] leading-5 text-[#24211D]/65">
                    {r.notaTabelog && (
                      <p className="flex items-center gap-1.5">
                        <IconStarKit className="h-3 w-3 shrink-0 text-[#B96432]" />
                        <span>
                          {r.notaTabelog} no Tabelog
                          {r.numAvaliacoes ? ` (${r.numAvaliacoes})` : ""}
                        </span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <span className="w-3 shrink-0 text-center text-[10px] font-semibold">¥</span>
                      <span>{r.faixaPreco}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <IconPin className="h-3 w-3 shrink-0" />
                      <span>{r.distancia}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <IconClockOutline className="h-3 w-3 shrink-0" />
                      <span>{r.horario}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <IconGlobe className="h-3 w-3 shrink-0" />
                      <span>{r.foreignFriendly}</span>
                    </p>
                    {r.nivelFila && (
                      <p className="flex items-center gap-1.5">
                        <IconHourglass className="h-3 w-3 shrink-0" />
                        <span>{r.nivelFila}</span>
                      </p>
                    )}
                    {r.reserva && (
                      <p className="flex items-center gap-1.5">
                        <IconCalendar className="h-3 w-3 shrink-0" />
                        <span>{r.reserva}</span>
                      </p>
                    )}
                    {r.pagamento && (
                      <p className="flex items-center gap-1.5">
                        <IconCreditCardSmall className="h-3 w-3 shrink-0" />
                        <span>{r.pagamento}</span>
                      </p>
                    )}
                  </div>

                  {r.alerta && <InlineAlert text={r.alerta} />}

                  {r.linkTabelog && (
                    <a
                      href={r.linkTabelog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2C6CA6] hover:underline"
                    >
                      Ver no Tabelog →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
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
                loading="lazy"
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
                loading="lazy"
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
    <div className="mb-8 rounded-2xl border-2 border-red-300/60 bg-red-50 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <IconShinkansen className="h-12 w-12" />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-700">
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
                loading="lazy"
      src="/images/icone-relogio.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function AlertaBlock({ alerta }: { alerta: AlertaSugerido }) {
  return (
    <div className="mb-8">
      <ContentCard
        variant="warning"
        icon={IconAlertTriangle}
        eyebrow={alerta.titulo}
        headline={alerta.horario}
      >
        {alerta.mensagem}
      </ContentCard>
    </div>
  );
}

// Aviso compacto usado DENTRO de outro card (poi, restaurante, seção de
// gastronomia) — mesma cor semântica do ContentCard variant="warning", só
// que em escala menor e sem o eyebrow, já que aqui o card-pai já dá
// contexto. Substitui os antigos avisos com emoji "⚠️".
function InlineAlert({ text }: { text: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-2">
      <IconAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
      <p className="text-[11px] leading-4 text-red-800">{text}</p>
    </div>
  );
}

// Bloco de transporte Narita ↔ Tóquio mostrado no dia de CHEGADA (a chegada
// em Tóquio é sempre por Narita/NRT, confirmado pela passagem real) — duas
// opções (Airport Limousine Bus e Narita Express) até o lyf Ginza Tokyo, com
// a recomendação final da Alpinea. O variant "partida" fica pronto para uso
// futuro, mas NÃO é usado hoje: a passagem real mostra que a volta embarca
// pelo Aeroporto de Haneda (HND), não Narita — precisa de conteúdo próprio
// para Haneda antes de ser habilitado no dia de partida.
function TransporteNaritaTokyoBlock({ variant }: { variant: "chegada" | "partida" }) {
  const rotaLabel =
    variant === "chegada" ? "Chegada — Narita → lyf Ginza Tokyo" : "Volta — remm Tokyo Kyobashi → Narita";

  return (
    <div className="mb-8 space-y-5 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:p-8">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/60">
          <IconPlane className="h-4 w-4" />
          Narita ↔ Tóquio
        </p>
        <h3 className="text-lg font-semibold text-[#24211D] sm:text-xl">Duas Opções de Transporte</h3>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/80">
          Para o deslocamento entre o Aeroporto Internacional de Narita (NRT) e a região de
          Ginza/Kyobashi, você possui duas excelentes alternativas: o Airport Limousine Bus e o
          Narita Express (N&apos;EX). Ambas são seguras, confortáveis e adequadas para viajar com
          malas. A escolha depende principalmente da preferência entre maior praticidade com a
          bagagem ou maior previsibilidade no tempo de viagem.
        </p>
      </div>

      {/* Opção 1 — Airport Limousine Bus (recomendada) */}
      <div className="rounded-xl border-2 border-[#3E5FA8] bg-[#EDF3FC] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#3E5FA8]">
            <IconBus className="h-6 w-6" />
            Opção 1 — Airport Limousine Bus
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#3E5FA8]/40 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E5FA8]">
            <IconCheckSmall className="h-3 w-3" />
            Recomendada pela Alpinea
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/85">
          O Airport Limousine Bus é a alternativa mais prática para quem está viajando com malas.
          As bagagens maiores são entregues ao funcionário antes do embarque e transportadas no
          compartimento inferior do ônibus. Você evita plataformas, escadas, corredores e a
          necessidade de circular por grandes estações carregando as malas.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">{rotaLabel}</p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
            {variant === "chegada"
              ? "Narita Terminal 2 → Airport Limousine Bus → Tokyo Station/Yaesu → táxi curto → lyf Ginza Tokyo."
              : "remm Tokyo Kyobashi → táxi curto → ponto do Airport Limousine Bus → Narita Terminal 2."}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/75">
            {variant === "chegada"
              ? "Ao chegar à região de Tokyo Station, basta retirar as malas e utilizar um táxi para o pequeno trecho final até o hotel."
              : "Na volta, recomendamos sair com margem confortável de segurança, pois o tempo de viagem pode variar de acordo com as condições do trânsito."}
          </p>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
          Por que recomendamos esta opção?
        </p>
        <div className="mt-2 space-y-1.5">
          {[
            "Menos esforço com as malas",
            "Não é necessário circular pelas plataformas de Tokyo Station",
            "Assentos confortáveis durante todo o percurso",
            "Bagagens transportadas no compartimento inferior",
            "Processo muito simples mesmo para quem não fala japonês",
            "Excelente opção tanto na chegada quanto no retorno ao aeroporto",
          ].map((d) => (
            <div key={d} className="flex items-start gap-2">
              <IconCheckSmall className="mt-0.5 h-3 w-3 shrink-0 text-[#3E5FA8]" />
              <p className="text-xs leading-5 text-[#24211D]/75">{d}</p>
            </div>
          ))}
        </div>

        {variant === "partida" && (
          <InlineAlert text="O ônibus está sujeito às condições do trânsito. No retorno a Narita, siga o horário de saída indicado no roteiro e evite utilizar um ônibus posterior ao recomendado." />
        )}
      </div>

      {/* Opção 2 — Narita Express (N'EX) */}
      <div className="rounded-xl border border-[#CBD9F2] bg-[#EDF3FC]/60 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
          <IconShinkansen className="h-6 w-6" />
          Opção 2 — Narita Express (N&apos;EX)
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#24211D]/55">Alternativa mais previsível</p>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/85">
          O Narita Express, ou N&apos;EX, é o trem expresso da JR que conecta o Aeroporto de Narita
          diretamente a Tokyo Station. Possui assentos reservados e áreas destinadas às bagagens,
          sendo uma alternativa confortável para quem prefere viajar de trem.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">{rotaLabel}</p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
            {variant === "chegada"
              ? "Narita Terminal 2 → Narita Express → Tokyo Station → táxi curto → lyf Ginza Tokyo."
              : "remm Tokyo Kyobashi → táxi curto → Tokyo Station → Narita Express → Narita Terminal 2."}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#24211D]/80">
          A principal vantagem do N&apos;EX é a previsibilidade: como o percurso é ferroviário, o
          tempo de viagem não sofre influência do trânsito. Por outro lado, é necessário circular
          por Tokyo Station, uma das maiores e mais movimentadas estações do Japão, além de
          administrar a própria bagagem durante o deslocamento pela estação.
        </p>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">Vantagens</p>
        <div className="mt-2 space-y-1.5">
          {[
            "Ligação direta entre Tokyo Station e Narita",
            "Assento reservado",
            "Espaço para bagagens",
            "Tempo de viagem bastante previsível",
            "Não depende das condições do trânsito",
          ].map((d) => (
            <div key={d} className="flex items-start gap-2">
              <IconCheckSmall className="mt-0.5 h-3 w-3 shrink-0 text-[#3E5FA8]/60" />
              <p className="text-xs leading-5 text-[#24211D]/75">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendação final */}
      <ContentCard variant="info" icon={IconStarKit} eyebrow="Recomendação Alpinea" size="sm">
        <p>
          Para este roteiro, nossa primeira opção é o Airport Limousine Bus, principalmente pela
          facilidade para viajar com malas e pela experiência mais simples depois de um voo
          internacional. O Narita Express permanece como excelente alternativa, principalmente
          caso você prefira o trem ou queira eliminar a variável do trânsito.
        </p>
        <div className="mt-4 rounded-lg bg-white/70 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B4A73]/70">
            {variant === "chegada" ? "Chegada · 04/05" : "Retorno · 11/05 à noite"}
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#1B4A73]">
            {variant === "chegada"
              ? "Narita T2 → Airport Limousine Bus → táxi → lyf Ginza Tokyo"
              : "remm Tokyo Kyobashi → táxi → Airport Limousine Bus → Narita T2"}
          </p>
        </div>
      </ContentCard>

      {variant === "partida" && (
        <ContentCard variant="warning" icon={IconAlertTriangle} eyebrow="Atenção à Data do Voo de Volta" size="sm">
          <p>
            Seu voo está programado para 00:05 do dia 12/05. Portanto, você deverá sair do hotel e
            seguir para o Aeroporto de Narita na noite do dia 11/05.
          </p>
          <p className="mt-3">
            <span className="font-semibold">Dica Alpinea:</span> os horários específicos dos
            transportes serão confirmados mais próximo da viagem. No retorno, será indicado um
            horário de Limousine Bus que ofereça uma margem confortável para eventuais variações
            no trânsito.
          </p>
        </ContentCard>
      )}
    </div>
  );
}

// Bloco de transporte do dia de partida (HND-DXB) — hotel remm Tokyo
// Kyobashi até o Terminal 3 do Aeroporto de Haneda. Conteúdo fornecido
// integralmente pelo cliente/Alpinea (nenhum valor foi estimado ou
// inventado aqui); mantém o mesmo "template" visual do bloco de
// transporte Narita ↔ Tóquio (TransporteNaritaTokyoBlock) — cabeçalho,
// cards de opção com badge de recomendação, cards de etapa e
// recomendação final — só que com 3 opções em vez de 2, mais o
// comparativo em tabela.
function TransporteHanedaTokyoBlock() {
  return (
    <div className="mb-8 space-y-5 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:p-8">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/60">
          <IconPlane className="h-4 w-4" />
          Tóquio ↔ Haneda
        </p>
        <h3 className="text-lg font-semibold text-[#24211D] sm:text-xl">
          remm Tokyo Kyobashi → Haneda Airport T3
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/80">
          Como você estará viajando com 3 malas grandes de aproximadamente 20 kg, recomendamos
          priorizar opções que evitem caminhadas, escadas, catracas e deslocamentos por estações
          com a bagagem. Abaixo estão as três opções, em nossa ordem de recomendação. Os valores
          apresentados consideram uma margem conservadora de custo, para evitar surpresas durante
          a viagem.
        </p>
      </div>

      {/* Opção 1 — Táxi + Airport Limousine Bus (recomendada) */}
      <div className="rounded-xl border-2 border-[#3E5FA8] bg-[#EDF3FC] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#3E5FA8]">
            <IconBus className="h-6 w-6" />
            Opção 1 — Táxi + Airport Limousine Bus
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#3E5FA8]/40 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E5FA8]">
            <IconCheckSmall className="h-3 w-3" />
            Recomendada pela Alpinea
          </span>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#24211D]/55">
          Melhor equilíbrio entre conforto e custo
        </p>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/85">
          remm Tokyo Kyobashi → táxi → Tokyo City Air Terminal (T-CAT) → Airport Limousine Bus →
          Haneda Airport Terminal 3.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
            Etapa 1 · Hotel → T-CAT
          </p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
            Peça na recepção do remm um táxi até a Tokyo City Air Terminal — T-CAT (東京シティエアターミナル).
            Informe que você está viajando com 3 malas grandes, para que seja utilizado um veículo
            com espaço adequado.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tempo
              </p>
              <p className="text-sm font-semibold text-[#24211D]">≈10–15 min</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Táxi
              </p>
              <p className="text-sm font-semibold text-[#24211D]">até ¥4.000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Bagagem
              </p>
              <p className="text-sm font-semibold text-[#24211D]">No porta-malas</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
            Etapa 2 · T-CAT → Haneda T3
          </p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
            Ao chegar ao T-CAT, siga para o embarque do Airport Limousine Bus com destino a Haneda
            Airport. Entregue as malas à equipe antes do embarque — elas ficam no compartimento
            inferior do ônibus e são devolvidas no desembarque, já no Terminal 3.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tempo
              </p>
              <p className="text-sm font-semibold text-[#24211D]">≈25 min</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tarifa
              </p>
              <p className="text-sm font-semibold text-[#24211D]">
                ¥1.000/pessoa · ¥2.000 (2 pessoas)
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Bagagem
              </p>
              <p className="text-sm font-semibold text-[#24211D]">No bagageiro do ônibus</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white/70 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3E5FA8]/70">
            Tempo e Custo Total
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#24211D]">
            ≈45–60 min (incluindo a troca e uma margem de espera pelo ônibus) · ¥3.500–6.000 para 2
            pessoas
          </p>
          <p className="mt-1 text-xs leading-5 text-[#24211D]/60">
            O limite superior considera uma margem conservadora para o táxi até o T-CAT.
          </p>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
          Por que recomendamos esta opção?
        </p>
        <p className="mt-2 text-xs leading-5 text-[#24211D]/75">
          Você utiliza o táxi justamente no trecho em que as malas seriam mais inconvenientes e,
          depois, entrega toda a bagagem à equipe do Limousine Bus. É a melhor combinação entre
          conforto, facilidade e custo.
        </p>
      </div>

      {/* Opção 2 — Táxi direto para Haneda */}
      <div className="rounded-xl border border-[#CBD9F2] bg-[#EDF3FC]/60 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
          <IconCar className="h-6 w-6" />
          Opção 2 — Táxi Direto para Haneda
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#24211D]/55">
          Mais simples e confortável
        </p>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/85">
          Peça na recepção um táxi ou veículo maior diretamente para o Haneda Airport Terminal 3
          (羽田空港 第3ターミナル). Informe antecipadamente que você possui 3 malas grandes de
          aproximadamente 20 kg, pois um táxi convencional pode não ter espaço suficiente.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Tempo
            </p>
            <p className="text-sm font-semibold text-[#24211D]">≈25–40 min</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Custo
            </p>
            <p className="text-sm font-semibold text-[#24211D]">≈¥8.000–15.000/veículo</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Trocas
            </p>
            <p className="text-sm font-semibold text-[#24211D]">Nenhuma</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Caminhada
            </p>
            <p className="text-sm font-semibold text-[#24211D]">Praticamente zero</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#24211D]/70">
          O valor máximo considera uma margem conservadora para trânsito, pedágios, horário e a
          necessidade de um veículo adequado à quantidade de bagagem.
        </p>
        <p className="mt-3 text-xs leading-5 text-[#24211D]/75">
          <span className="font-semibold text-[#24211D]/85">Quando escolher:</span> é a melhor
          alternativa caso você queira eliminar qualquer preocupação com conexões ou horários —
          você sai da porta do hotel e desembarca diretamente na área de embarque do Terminal 3.
        </p>
      </div>

      {/* Opção 3 — Trem via Takaracho */}
      <div className="rounded-xl border border-[#DDD8CF] bg-white/60 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#24211D]/70">
          <IconMetro className="h-6 w-6" />
          Opção 3 — Trem via Takaracho
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#24211D]/55">
          Mais econômica · última opção com 3 malas grandes
        </p>
        <p className="mt-3 text-sm leading-6 text-[#24211D]/85">
          A estação Takaracho (宝町) fica a aproximadamente 3 minutos a pé do hotel. Alguns
          serviços da Toei Asakusa Line seguem diretamente pela Keikyu Airport Line até Haneda.
        </p>

        <div className="mt-4 rounded-lg bg-[#FAF9F6] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#24211D]/60">
            Etapa 1 · Hotel → Takaracho
          </p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
            Caminhada de aproximadamente 3 minutos, sem custo. Você deverá transportar
            pessoalmente as 3 malas — dentro da estação, utilize os elevadores sempre que possível
            para chegar à plataforma.
          </p>
        </div>
        <div className="mt-3 rounded-lg bg-[#FAF9F6] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#24211D]/60">
            Etapa 2 · Takaracho → Haneda T3
          </p>
          <p className="mt-2 text-sm leading-6 text-[#24211D]/80">
            Antes de embarcar, confirme no painel se o trem segue para 羽田空港 — Haneda Airport:
            nem todos os trens que passam por Takaracho seguem até o aeroporto. Tempo no trem de
            aproximadamente 30–40 minutos, ¥500–750 por pessoa (até ¥1.500 para 2 pessoas) — você
            permanece responsável pelas malas durante todo o trajeto.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-[#FAF9F6] p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/55">
            Tempo e Custo Total
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#24211D]">
            ≈40–55 min · até ¥1.500 para 2 pessoas
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#24211D]/70">
          Apesar de ser a alternativa mais econômica, não recomendamos esta opção neste caso: com
          três malas grandes, será necessário movimentar aproximadamente 60 kg de bagagem pela
          calçada, entrada da estação, catracas, elevadores, plataforma e interior do trem.
        </p>
      </div>

      {/* Comparativo */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#24211D]/55">
          Comparativo
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#DDD8CF]">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#F1F0EC] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#24211D]/60">
                <th className="px-4 py-3">Opção</th>
                <th className="px-4 py-3">Tempo Total</th>
                <th className="px-4 py-3">Custo (2 pessoas)</th>
                <th className="px-4 py-3">Bagagem</th>
                <th className="px-4 py-3">Recomendação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#DDD8CF] bg-[#EDF3FC]/40">
                <td className="px-4 py-3 font-semibold text-[#24211D]">Táxi + Limousine Bus</td>
                <td className="px-4 py-3 text-[#24211D]/80">45–60 min</td>
                <td className="px-4 py-3 text-[#24211D]/80">¥3.500–6.000</td>
                <td className="px-4 py-3 text-[#24211D]/80">Fácil</td>
                <td className="px-4 py-3 font-semibold text-[#3E5FA8]">Recomendada</td>
              </tr>
              <tr className="border-t border-[#DDD8CF]">
                <td className="px-4 py-3 font-semibold text-[#24211D]">Táxi Direto</td>
                <td className="px-4 py-3 text-[#24211D]/80">25–40 min</td>
                <td className="px-4 py-3 text-[#24211D]/80">¥8.000–15.000</td>
                <td className="px-4 py-3 text-[#24211D]/80">Muito fácil</td>
                <td className="px-4 py-3 text-[#24211D]/70">Mais confortável</td>
              </tr>
              <tr className="border-t border-[#DDD8CF]">
                <td className="px-4 py-3 font-semibold text-[#24211D]">Trem</td>
                <td className="px-4 py-3 text-[#24211D]/80">40–55 min</td>
                <td className="px-4 py-3 text-[#24211D]/80">até ¥1.500</td>
                <td className="px-4 py-3 text-[#24211D]/80">Difícil</td>
                <td className="px-4 py-3 text-[#24211D]/70">Mais econômica</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendação final */}
      <ContentCard variant="info" icon={IconStarKit} eyebrow="Recomendação Alpinea" size="sm">
        <p>
          <span className="font-semibold">1º · Táxi + Airport Limousine Bus.</span> Nossa
          recomendação principal — evita completamente o transporte das malas por estações e
          oferece excelente equilíbrio entre conforto e custo.
        </p>
        <p className="mt-3">
          <span className="font-semibold">2º · Táxi direto para Haneda.</span> A alternativa mais
          confortável e rápida — recomendada caso você prefira pagar um pouco mais para fazer todo
          o percurso porta a porta.
        </p>
        <p className="mt-3">
          <span className="font-semibold">3º · Trem via Takaracho.</span> A alternativa mais
          barata, porém pouco conveniente com três malas grandes — recomendamos apenas caso
          economia seja a prioridade.
        </p>
        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-sm leading-6 text-[#1B4A73]">
            <span className="font-semibold">Dica Alpinea:</span> independentemente da opção
            escolhida, confirme sempre &ldquo;Haneda Airport Terminal 3 / 羽田空港 第3ターミナル&rdquo; como
            destino. Horários e tarifas devem ser reconfirmados próximo à data da viagem.
          </p>
        </div>
      </ContentCard>
    </div>
  );
}

// =============================================================================
// Passagem Aérea — dados reais extraídos diretamente dos e-tickets Emirates
// enviados pelo cliente (bilhete 176 2213785892-93). Nenhum dado abaixo foi
// inventado: cada campo (código IATA, voo, terminal, data, horário) veio de
// uma captura de tela real da Emirates. Confirmado: a ida chega em Tóquio
// por Narita (NRT) e a volta embarca por Haneda (HND) — dois aeroportos
// diferentes na mesma cidade, exatamente como o bilhete real mostra.
// =============================================================================

type PassagemSegmento = {
  numeroSegmento: string;
  voo: string;
  classe: string;
  origem: { iata: string; cidade: string; terminal: string | null };
  destino: { iata: string; cidade: string; terminal: string | null };
  partida: { data: string; hora: string };
  chegada: { data: string; hora: string };
  bagagem: string;
};

// Número do bilhete NÃO é armazenado nem exibido aqui — é dado confidencial
// do cliente e não deve constar no painel.

const PASSAGEM_IDA: PassagemSegmento[] = [
  {
    numeroSegmento: "1 de 4",
    voo: "EK 262",
    classe: "Economy Saver",
    origem: { iata: "GRU", cidade: "São Paulo", terminal: "3" },
    destino: { iata: "DXB", cidade: "Dubai", terminal: "3" },
    partida: { data: "03 Mai 2027", hora: "01:35" },
    chegada: { data: "03 Mai 2027", hora: "23:00" },
    bagagem: "2 peças",
  },
  {
    numeroSegmento: "2 de 4",
    voo: "EK 318",
    classe: "Economy Saver",
    origem: { iata: "DXB", cidade: "Dubai", terminal: "3" },
    destino: { iata: "NRT", cidade: "Tóquio", terminal: "2" },
    partida: { data: "04 Mai 2027", hora: "02:40" },
    chegada: { data: "04 Mai 2027", hora: "17:35" },
    bagagem: "2 peças",
  },
];

const PASSAGEM_VOLTA: PassagemSegmento[] = [
  {
    numeroSegmento: "3 de 4",
    voo: "EK 313",
    classe: "Economy Saver",
    origem: { iata: "HND", cidade: "Tóquio", terminal: "3" },
    destino: { iata: "DXB", cidade: "Dubai", terminal: "3" },
    partida: { data: "12 Mai 2027", hora: "00:05" },
    chegada: { data: "12 Mai 2027", hora: "06:25" },
    bagagem: "2 peças",
  },
  {
    numeroSegmento: "4 de 4",
    voo: "EK 261",
    classe: "Economy Saver",
    origem: { iata: "DXB", cidade: "Dubai", terminal: "3" },
    destino: { iata: "GRU", cidade: "São Paulo", terminal: "3" },
    partida: { data: "12 Mai 2027", hora: "09:05" },
    chegada: { data: "12 Mai 2027", hora: "17:40" },
    bagagem: "2 peças",
  },
];

// Direções exibidas — rótulo/período fixos (datas já
// conhecidas e conferidas contra o bilhete real) + nota final explicando
// por qual aeroporto de Tóquio se chega/sai (Narita na ida, Haneda na
// volta — dois aeroportos diferentes, conforme o bilhete real).
const PASSAGEM_DIRECOES: {
  label: "IDA" | "VOLTA";
  periodo: string;
  segmentos: PassagemSegmento[];
  notaFinal: string;
}[] = [
  {
    label: "IDA",
    periodo: "03–04 Mai 2027",
    segmentos: PASSAGEM_IDA,
    notaFinal: "Chegada em Tóquio pelo Aeroporto de Narita (NRT), Terminal 2",
  },
  {
    label: "VOLTA",
    periodo: "12 Mai 2027",
    segmentos: PASSAGEM_VOLTA,
    notaFinal: "Saída de Tóquio pelo Aeroporto de Haneda (HND), Terminal 3",
  },
];

// Grade Ida/Volta em formato compacto — reproduz exatamente o card que já
// existia em app/rf3vk8mp/page.tsx (seção "Dados do Cliente"), agora
// movido para cá e alimentado pelos dados de PASSAGEM_IDA/PASSAGEM_VOLTA
// (conferidos contra o bilhete real) em vez de texto fixo.
function PassagemBasicaGrade() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {PASSAGEM_DIRECOES.map((direcao) => (
        <div key={direcao.label} className="rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#24211D]/65">
            {direcao.label === "IDA" ? "Ida" : "Volta"} · {direcao.periodo}
          </p>
          <div className="space-y-1.5 text-sm text-[#24211D]/90">
            {direcao.segmentos.map((seg) => (
              <p key={seg.numeroSegmento}>
                <span className="font-semibold text-[#24211D]">{seg.voo.replace(" ", "")}</span>
                {" · "}
                {seg.origem.iata} → {seg.destino.iata} · {seg.partida.hora} → {seg.chegada.hora}
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#24211D]/65">{direcao.notaFinal}</p>
        </div>
      ))}
    </div>
  );
}

// Seção "Passagem Aérea" embutida na área "Dados do Cliente" da página
// (app/rf3vk8mp/page.tsx) — substitui o card estático que já existia ali.
// Só a grade compacta (layout original) — sem alternância de versão.
export function PassagemAereaSecao() {
  return (
    <div>
      <div className="mt-6 flex items-center gap-3">
        <img
                loading="lazy"
          src="/images/emirates-logo.webp"
          alt="Emirates"
          className="h-24 w-auto rounded-md object-contain sm:h-28"
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#24211D]/65">
            Companhia Aérea
          </p>
          <p className="text-sm font-semibold text-[#24211D]">Emirates</p>
        </div>
      </div>

      <div className="mt-5">
        <PassagemBasicaGrade />
      </div>
    </div>
  );
}

function ComparacaoTabelaBlock({ comparacao }: { comparacao: ComparacaoTabela }) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-black p-5 sm:p-7">
      <p className="mb-5 text-lg font-medium text-white sm:text-xl">
        {comparacao.titulo ?? "Comparação Rápida"}
      </p>

      <div className="overflow-x-auto">
        <div className="grid min-w-[460px] grid-cols-[1.3fr_1fr_1fr] gap-x-3">
          {comparacao.badges && (
            <>
              <div />
              {comparacao.badges.map((badge, i) => (
                <span
                  key={i}
                  className="mb-3 inline-block w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-white"
                  style={{ backgroundColor: "#2C6CA6" }}
                >
                  {badge}
                </span>
              ))}
            </>
          )}

          {comparacao.conclusao && (
            <>
              <div />
              {comparacao.conclusao.map((texto, i) => (
                <p key={i} className="mb-5 text-[13px] leading-5 text-white/85">
                  {texto}
                </p>
              ))}
            </>
          )}

          <div className="col-span-3 mb-1 border-b border-white/20" />
          <p className="pb-2 pt-3 text-sm font-bold text-white">{comparacao.colunas[0]}</p>
          <p className="pb-2 pt-3 text-sm font-bold text-white">{comparacao.colunas[1]}</p>
          <div />

          {comparacao.grupos.map((grupo, gi) => (
            <div key={grupo.titulo} className="contents">
              <p
                className={`col-span-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ${
                  gi === 0 ? "mt-1" : "mt-5 border-t border-white/10 pt-4"
                }`}
              >
                {grupo.titulo}
              </p>
              {grupo.linhas.map((linha) => (
                <div key={linha.label} className="contents">
                  <p className="self-center pb-3 text-xs leading-5 text-white/60">{linha.label}</p>
                  {linha.estrelas ? (
                    <>
                      <ComparacaoEstrelas value={linha.estrelas[0]} />
                      <ComparacaoEstrelas value={linha.estrelas[1]} />
                    </>
                  ) : linha.pontos ? (
                    <>
                      <ComparacaoPontos value={linha.pontos[0]} />
                      <ComparacaoPontos value={linha.pontos[1]} />
                    </>
                  ) : (
                    <>
                      <p className="self-center pb-3 text-sm leading-5 text-white/90">{linha.valores?.[0]}</p>
                      <p className="self-center pb-3 text-sm leading-5 text-white/90">{linha.valores?.[1]}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {comparacao.rodape && (
        <div className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] p-4 sm:p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            {comparacao.rodape.titulo}
          </p>
          <ul className="space-y-2">
            {comparacao.rodape.itens.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-5 text-white/80">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ComparacaoEstrelas({ value }: { value: number }) {
  return (
    <span className="self-center pb-3 text-sm tracking-tight text-amber-400">
      {"★".repeat(value)}
      <span className="text-white/20">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function ComparacaoPontos({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1 self-center pb-3">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: i < value ? "#2C6CA6" : "rgba(255,255,255,0.15)" }}
        />
      ))}
    </span>
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
  const [zoomMapa, setZoomMapa] = useState<{ src: string; alt: string } | null>(null);
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
            ? "mb-5 sm:mb-20"
            : "mb-5"
        }`}
      >
        {(() => {
          const Icon = deslocamento.opcoes.find((o) => o.recomendado)?.Icon ?? IconMetro;
          return <Icon className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />;
        })()}
        {deslocamento.linha.logo && `${deslocamento.linha.codigo} · `}
        {deslocamento.linha.nome} · {deslocamento.baldeacao ? "com baldeação" : "sem baldeação"}
      </p>
      {/* Grid (não flex) pra origem/destino: cada lado é dividido em duas
          linhas de grid — "info" (foto/nome/distância/mapa) e "saída"
          (card verde) — de modo que os dois cards verdes sempre comecem
          na mesma altura, mesmo quando um lado tem mais texto que o
          outro. A coluna central (traço + estações intermediárias) ocupa
          as duas linhas. */}
      {/* Versão mobile: layout vertical (empilhado) em vez do grid de 3
          colunas — abaixo de sm não há largura suficiente pro traço
          horizontal com estações intermediárias, então aqui a linha
          desce de cima pra baixo, com um marcador por estação e o nome
          ao lado (em vez de rótulos girados). */}
      <div className="flex flex-col items-center sm:hidden">
        <div className="flex w-full max-w-[220px] flex-col items-center text-center">
          {deslocamento.estacaoOrigem.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                loading="lazy"
                src={deslocamento.estacaoOrigem.foto}
                alt={`Entrada da ${deslocamento.estacaoOrigem.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                loading="lazy"
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
            <div className="mt-3 flex w-full flex-col items-center justify-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                loading="lazy"
                src="/images/icone-saida2.webp"
                alt=""
                className="h-16 w-16 object-contain"
              />
              <p className="text-xs font-bold uppercase leading-snug tracking-[0.04em] text-emerald-800">
                {deslocamento.estacaoOrigem.saida}
              </p>
            </div>
          )}
        </div>

        {/* Trilho vertical: uma única coluna de largura fixa (w-6) contém o
            conector inicial, os círculos das estações intermediárias, as
            barras entre eles e a seta final — tudo alinhado no mesmo eixo
            central, em vez de ter o conector inicial centralizado no
            container inteiro (largura variável) enquanto os círculos ficam
            à esquerda de uma coluna mais estreita, o que quebrava/desalinhava
            a faixa. */}
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full max-w-[260px] flex-col">
            {deslocamento.estacoesIntermediarias &&
            deslocamento.estacoesIntermediarias.length > 0 ? (
              deslocamento.estacoesIntermediarias.map((estacao, i) => (
                <div key={estacao.nome} className="flex w-full items-stretch gap-3">
                  <div className="flex w-6 shrink-0 flex-col items-center">
                    {i === 0 && (
                      <span
                        className="h-6 w-1.5 rounded-full"
                        style={{ background: deslocamento.linha.cor || "#B96432" }}
                      />
                    )}
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold leading-none"
                      style={{
                        borderColor: deslocamento.linha.cor || "#B96432",
                        color: deslocamento.linha.cor || "#B96432",
                      }}
                    >
                      {estacao.numero ?? "•"}
                    </span>
                    <span
                      className="w-1.5 flex-1 rounded-full"
                      style={{ background: deslocamento.linha.cor || "#B96432" }}
                    />
                  </div>
                  <div className="flex-1 pb-4 pt-0.5 text-left">
                    <p className="text-xs font-semibold text-[#24211D]">
                      {estacao.nome}
                    </p>
                    {estacao.nomeJapones && (
                      <p className="text-[11px] text-[#24211D]/60">
                        {estacao.nomeJapones}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex w-full items-stretch gap-3">
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <span
                    className="h-10 w-1.5 rounded-full"
                    style={{ background: deslocamento.linha.cor || "#B96432" }}
                  />
                </div>
                <div className="flex-1" />
              </div>
            )}
            <div className="flex w-full items-start gap-3">
              <div className="flex w-6 shrink-0 items-center justify-center">
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "9px solid transparent",
                    borderRight: "9px solid transparent",
                    borderTop: `16px solid ${deslocamento.linha.cor || "#B96432"}`,
                  }}
                />
              </div>
              <div className="flex-1" />
            </div>
          </div>
        </div>

        {(() => {
          const mapa = deslocamento.estacaoDestino.mapa
            ? deslocamento.estacaoDestino
            : deslocamento.estacaoOrigem.mapa
              ? deslocamento.estacaoOrigem
              : null;
          if (!mapa?.mapa) return null;
          return (
            <button
              type="button"
              onClick={() =>
                setZoomMapa({
                  src: mapa.mapa!,
                  alt: mapa.mapaAlt ?? `Mapa da ${mapa.nome}`,
                })
              }
              className="group relative mb-4 block h-32 w-full max-w-[260px] overflow-hidden rounded-xl border border-[#DDD8CF] bg-white shadow-sm"
            >
              <img
                loading="lazy"
                src={mapa.mapa}
                alt={mapa.mapaAlt ?? ""}
                className="h-full w-full object-contain p-2"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#000000] opacity-90 shadow-md">
                  <IconZoom className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })()}

        <div className="flex w-full max-w-[220px] flex-col items-center text-center">
          {deslocamento.estacaoDestino.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                loading="lazy"
                src={deslocamento.estacaoDestino.foto}
                alt={`Entrada da ${deslocamento.estacaoDestino.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                loading="lazy"
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
            <div className="mt-3 flex w-full flex-col items-center justify-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                loading="lazy"
                src="/images/icone-saida2.webp"
                alt=""
                className="h-16 w-16 object-contain"
              />
              <p className="text-xs font-bold uppercase leading-snug tracking-[0.04em] text-emerald-800">
                {deslocamento.estacaoDestino.saida}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden grid-cols-[auto_minmax(32px,1fr)_auto] items-start gap-3 text-center sm:grid sm:gap-5">
        <div className="col-start-1 row-start-1 flex w-32 min-w-0 flex-col items-center sm:w-40">
          {deslocamento.estacaoOrigem.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                loading="lazy"
                src={deslocamento.estacaoOrigem.foto}
                alt={`Entrada da ${deslocamento.estacaoOrigem.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                loading="lazy"
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
        </div>
        <div className="col-start-1 row-start-2 flex h-full w-32 min-w-0 flex-col items-center self-stretch sm:w-40">
          {deslocamento.estacaoOrigem.saida && (
            <div className="mt-3 flex w-full flex-1 flex-col items-center justify-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                loading="lazy"
                src="/images/icone-saida2.webp"
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
        <div className="col-start-2 row-start-1 flex min-w-[32px] flex-1 flex-col justify-start pt-10 sm:min-w-[64px]">
          {deslocamento.estacoesIntermediarias &&
            deslocamento.estacoesIntermediarias.length > 0 && (
              <div className="relative hidden h-0 w-full sm:block">
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
            className="relative h-2 w-full"
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
            {/* Ponta da seta — triângulo CSS nítido (bordas retas, sem
                nenhum arredondamento), maior e mais grosso que o traço pra
                ler como uma seta de verdade, não como um "alfinete" preso
                numa linha fina. */}
            <span
              className="absolute -right-px top-1/2 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: "13px solid transparent",
                borderBottom: "13px solid transparent",
                borderLeft: `22px solid ${deslocamento.linha.cor || "#B96432"}`,
              }}
            />
          </div>
          {deslocamento.estacoesIntermediarias &&
            deslocamento.estacoesIntermediarias.length > 0 && (
              <div className="relative hidden h-16 w-full sm:block sm:h-20">
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

        {/* Mapa da estação (chegada) — mesma linha/altura/base dos cards
            de saída (row-start-2), pra formar uma fileira única e
            uniforme com eles. Prioriza o mapa do destino (é onde o
            cliente está chegando); usa o da origem se for o único
            disponível. */}
        <div className="col-start-2 row-start-2 flex h-full min-w-[32px] flex-1 flex-col self-stretch">
          {(() => {
            const mapa = deslocamento.estacaoDestino.mapa
              ? deslocamento.estacaoDestino
              : deslocamento.estacaoOrigem.mapa
                ? deslocamento.estacaoOrigem
                : null;
            if (!mapa?.mapa) return null;
            return (
              <button
                type="button"
                onClick={() =>
                  setZoomMapa({
                    src: mapa.mapa!,
                    alt: mapa.mapaAlt ?? `Mapa da ${mapa.nome}`,
                  })
                }
                className="group relative mt-3 block h-full w-full flex-1 overflow-hidden rounded-xl border border-[#DDD8CF] bg-white shadow-sm"
              >
                <img
                loading="lazy"
                  src={mapa.mapa}
                  alt={mapa.mapaAlt ?? ""}
                  className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/10">
                  <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/95 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <IconZoom className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })()}
        </div>

        <div className="col-start-3 row-start-1 flex w-32 min-w-0 flex-col items-center sm:w-40">
          {deslocamento.estacaoDestino.foto ? (
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#DDD8CF] shadow-sm">
              <img
                loading="lazy"
                src={deslocamento.estacaoDestino.foto}
                alt={`Entrada da ${deslocamento.estacaoDestino.nome}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            deslocamento.linha.logo && (
              <div className="mb-3 flex h-20 w-20 items-center justify-center">
                <img
                loading="lazy"
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
        </div>
        <div className="col-start-3 row-start-2 flex h-full w-32 min-w-0 flex-col items-center self-stretch sm:w-40">
          {deslocamento.estacaoDestino.saida && (
            <div className="mt-3 flex w-full flex-1 flex-col items-center justify-center gap-1 break-words rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 shadow-sm">
              <img
                loading="lazy"
                src="/images/icone-saida2.webp"
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

      {deslocamento.mapaAndares && (
        <MapaAndaresBlock mapaAndares={deslocamento.mapaAndares} />
      )}

      {zoomMapa && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setZoomMapa(null)}
        >
          <button
            type="button"
            onClick={() => setZoomMapa(null)}
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
                loading="lazy"
              src={zoomMapa.src}
              alt={zoomMapa.alt}
              className="max-h-[80vh] max-w-[92vw] rounded-2xl bg-white object-contain"
            />
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
              {zoomMapa.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de zoom real (não só "caber na tela") — usado em mapas densos
// (plantas de estação, rotas) onde o texto é pequeno demais pra ler só
// ajustando à largura da tela. Roda/scroll ou os botões +/- aumentam a
// escala de verdade; arrastar (mouse ou toque) navega pela imagem ampliada.
function ZoomableImageModal({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  // Fecha com Esc — precisa do listener aqui porque o modal é renderizado
  // via portal (fora da árvore normal), então o teclado não passa por um
  // onKeyDown de container pai.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function setClampedScale(next: number) {
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(s);
    if (s === MIN_SCALE) setPos({ x: 0, y: 0 });
    return s;
  }

  function handleWheel(e: ReactWheelEvent) {
    e.preventDefault();
    setClampedScale(scale + (e.deltaY < 0 ? 0.4 : -0.4));
  }

  function handleDoubleClick() {
    if (scale > 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    } else {
      setClampedScale(2.5);
    }
  }

  function handlePointerDown(e: ReactPointerEvent) {
    if (scale <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = { x: e.clientX, y: e.clientY, startPos: pos };
    setIsDragging(true);
  }
  function handlePointerMove(e: ReactPointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.x;
    const dy = e.clientY - dragging.current.y;
    setPos({ x: dragging.current.startPos.x + dx, y: dragging.current.startPos.y + dy });
  }
  function handlePointerUp() {
    dragging.current = null;
    setIsDragging(false);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-black/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Fechar"
      >
        <IconX className="h-5 w-5" />
      </button>

      <div
        className="relative flex h-[70vh] w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl sm:h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: scale > 1 ? "none" : "pinch-zoom" }}
      >
        <img
                loading="lazy"
          src={src}
          alt={alt}
          draggable={false}
          onClick={(e) => {
            e.stopPropagation();
            if (scale <= 1) setClampedScale(2.5);
          }}
          className="max-h-full max-w-full select-none rounded-2xl bg-white object-contain"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 150ms ease-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>

      {/* No mobile, controles de +/-/porcentagem somem — dar zoom com o
          gesto de pinça é mais intuitivo que apertar botão, e é isso que
          agora fica disponível (touchAction acima permite o pinch nativo
          do celular). O aviso substitui os botões só até sm; a partir daí
          (mouse/trackpad, sem gesto de pinça) os controles continuam. */}
      <p
        className="max-w-xs px-4 text-center text-xs font-medium text-white/70 sm:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        Use dois dedos para ampliar a imagem
      </p>
      <div
        className="hidden items-center gap-3 rounded-full bg-white/10 px-3 py-2 sm:flex"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setClampedScale(scale - 0.5)}
          disabled={scale <= MIN_SCALE}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg font-bold leading-none text-white transition hover:bg-white/25 disabled:opacity-30"
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <span className="min-w-[3.5rem] text-center text-xs font-semibold text-white/85">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setClampedScale(scale + 0.5)}
          disabled={scale >= MAX_SCALE}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg font-bold leading-none text-white transition hover:bg-white/25 disabled:opacity-30"
          aria-label="Aumentar zoom"
        >
          +
        </button>
      </div>
      {caption && (
        <p className="max-w-2xl px-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
          {caption}
        </p>
      )}
    </div>,
    document.body
  );
}

function MapaAndaresBlock({
  mapaAndares,
}: {
  mapaAndares: NonNullable<Deslocamento["mapaAndares"]>;
}) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const atual = mapaAndares.mapas[selected];
  const outros = mapaAndares.mapas
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.index !== selected);

  return (
    <div className="mt-5">
      {mapaAndares.titulo && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/55">
          {mapaAndares.titulo}
        </p>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#DDD8CF] bg-white"
      >
        <img
                loading="lazy"
          src={atual.imagem}
          alt={atual.imagemAlt}
          className="block h-auto w-full transition duration-300 group-hover:scale-[1.01]"
        />
        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md ring-2 ring-white/70">
          {atual.andar}
        </span>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/15">
          <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
            <IconZoom className="h-4 w-4" />
          </span>
        </div>
      </button>

      {outros.length > 0 && (
        <div className={`mt-3 grid grid-cols-1 gap-3 sm:grid-cols-${Math.min(outros.length, 3)}`}>
          {outros.map((m) => (
            <button
              key={m.andar}
              type="button"
              onClick={() => setSelected(m.index)}
              className="group flex items-center gap-3 overflow-hidden rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] p-3 text-left transition hover:border-[#2C6CA6]/50 hover:bg-[#EAF3FC]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F1ED] text-sm font-bold text-[#24211D]/70 transition group-hover:bg-[#2C6CA6] group-hover:text-white">
                {m.andar}
              </span>
              <span className="min-w-0 text-xs font-medium text-[#24211D]/80">
                Ver mapa do {m.andar}
              </span>
              <span className="ml-auto shrink-0 text-lg text-[#24211D]/40 transition group-hover:text-[#2C6CA6]">
                →
              </span>
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <ZoomableImageModal
          src={atual.imagem}
          alt={atual.imagemAlt}
          caption={atual.imagemAlt}
          onClose={() => setZoom(false)}
        />
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
        <img
                loading="lazy"
          src={mapa.imagem}
          alt={mapa.imagemAlt}
          className="block h-auto max-h-[70vh] w-full object-contain transition duration-300 group-hover:scale-[1.02]"
        />
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
        <ZoomableImageModal
          src={mapa.imagem}
          alt={mapa.imagemAlt}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}

// Corpo de comentários do card preto do Raio-X Alpinea. Quando o texto é
// curto (2-3 parágrafos, como na maioria das seções), mostra tudo direto,
// sem alterar a aparência de antes. Quando é uma leitura mais longa,
// mostra só os 2 primeiros parágrafos e oferece "Ler leitura completa"
// para expandir o resto — evita que o card fique gigante e quebre a
// consistência visual com as demais seções do dia.
function ComentariosSecao({ comentarios }: { comentarios: string[] }) {
  const [expandido, setExpandido] = useState(false);
  const LIMITE_VISIVEL = 2;
  const precisaExpandir = comentarios.length > LIMITE_VISIVEL + 1;
  const visiveis =
    expandido || !precisaExpandir
      ? comentarios
      : comentarios.slice(0, LIMITE_VISIVEL);
  return (
    <div className="space-y-3">
      {visiveis.map((c, i) => (
        <p key={i} className="text-sm leading-6 text-white/80">
          {c}
        </p>
      ))}
      {precisaExpandir && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="mt-1 inline-block rounded-full bg-[#2C6CA6] px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#245a8c]"
        >
          {expandido ? "Ler menos" : "Ler leitura completa"}
        </button>
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
            className={`mb-5 flex min-h-[240px] w-full flex-col rounded-2xl bg-black bg-cover px-6 py-6 text-center sm:min-h-[300px] ${
              visaoAnotada.fundo ? "justify-between bg-top" : "justify-center bg-center"
            }`}
            style={
              visaoAnotada.fundo
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.94), rgba(0,0,0,0.98)), url(${visaoAnotada.fundo})`,
                  }
                : undefined
            }
          >
            <p className={`${displayClassName} text-2xl font-medium text-white md:text-3xl`}>
              Raio-X Alpinea{visaoAnotada.titulo && ` — ${visaoAnotada.titulo}`}
            </p>
            <div className="mx-auto my-4 h-px w-24 bg-white/40" />
            {visaoAnotada.comentarios && visaoAnotada.comentarios.length > 0 && (
              <div className="mx-auto max-w-2xl text-left">
                <ComentariosSecao comentarios={visaoAnotada.comentarios} />
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setZoom({ src: visaoAnotada.imagem, alt: visaoAnotada.imagemAlt })}
          className="group relative block w-full overflow-hidden rounded-2xl border border-[#DDD8CF]"
        >
          <img
                loading="lazy"
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
                loading="lazy"
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
              <ComentariosSecao comentarios={visaoAnotada.comentarios} />
            </div>
          )}
        </div>
      )}

      {/* Mapa centralizado, sozinho — nada ao lado. */}
      <button
        type="button"
        onClick={() => setZoom({ src: visaoAnotada.imagem, alt: visaoAnotada.imagemAlt })}
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#DDD8CF]"
      >
        <img
                loading="lazy"
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
                loading="lazy"
                    src={ponto.foto}
                    alt={ponto.titulo}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    style={ponto.fotoPosicao ? { objectPosition: ponto.fotoPosicao } : undefined}
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
                loading="lazy"
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
                loading="lazy"
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
            className={`flex flex-col overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#FDFCF9] ${
              galeria.imagens.length === 1 ? "sm:col-span-2" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setZoom({ src: img.src, alt: img.alt })}
              className={`group relative block w-full shrink-0 overflow-hidden ${
                galeria.imagens.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]"
              }`}
            >
              <img
                loading="lazy"
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
              {galeria.imagens.length > 1 && (
                <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md ring-2 ring-white/70">
                  {i + 1}
                </span>
              )}
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

      {galeria.mapas && galeria.mapas.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {galeria.mapas.map((mapa) => (
            <button
              key={mapa.imagem}
              type="button"
              onClick={() => setZoom({ src: mapa.imagem, alt: mapa.imagemAlt })}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-3.5 text-left transition hover:border-[#2C6CA6]/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2C6CA6]">
                <IconMap className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#1B4A73]">
                  {mapa.titulo}
                </span>
                <span className="block text-xs text-[#2C6CA6]/70">
                  Toque para ampliar
                </span>
              </span>
              <span className="ml-auto shrink-0 text-lg text-[#2C6CA6]/60">
                →
              </span>
            </button>
          ))}
        </div>
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
                loading="lazy"
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
                loading="lazy"
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
            <p className="absolute inset-x-5 bottom-14 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:inset-x-10">
              Atração
            </p>
            <h3
              className={`${displayClassName} absolute inset-x-5 bottom-4 font-medium leading-snug text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] sm:inset-x-10 ${
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

      {period.visaoAnotada && period.visaoAnotadaNoTopo && (
        <VisaoAnotadaBlock
          visaoAnotada={period.visaoAnotada}
          displayClassName={displayClassName}
        />
      )}

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
            <div className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-2.5 text-right">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B96432]">
                  Tempo estimado de visitação
                </p>
                <p className="mt-0.5 text-lg font-bold leading-snug text-[#000000] sm:text-xl">
                  {period.percursoEssencial.duracao}
                </p>
              </div>
              <IconClock className="h-9 w-9 shrink-0 text-[#B96432] sm:h-10 sm:w-10" />
            </div>
          </div>
          <p className="mt-4 text-right text-[10px] font-medium text-[#000000]/40">
            Arraste para o lado →
          </p>
          <div className="relative mt-1">
            <div className="overflow-x-auto pb-1">
            <div className="mx-auto flex w-max shrink-0">
            {(() => {
              let numero = 0;
              return period.percursoEssencial!.passos.map((passo, i) => {
                if (passo.foto) numero += 1;
                return (
                  <div key={passo.titulo} className="flex shrink-0 items-start">
                    <div className="flex w-24 shrink-0 flex-col items-center text-center sm:w-28">
                      {passo.foto ? (
                        <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                          <div className="h-full w-full overflow-hidden rounded-full border-2 border-white shadow-sm">
                            <img
                loading="lazy"
                              src={passo.foto}
                              alt={passo.titulo}
                              className="h-full w-full object-cover"
                              style={
                                passo.fotoPosicao
                                  ? {
                                      objectPosition: passo.fotoPosicao,
                                      transform: "scale(1.6)",
                                    }
                                  : undefined
                              }
                            />
                          </div>
                          <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1B4A73] text-xs font-bold text-white shadow-sm">
                            {numero}
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-[#2C6CA6]/35 text-[#2C6CA6]/50 sm:h-16 sm:w-16">
                          <IconWalk className="h-7 w-7" />
                        </div>
                      )}
                      {passo.horario && (
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#B96432]">
                          {passo.horario}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-semibold leading-tight text-[#000000]">
                        {passo.titulo}
                      </p>
                    </div>
                    {i < period.percursoEssencial!.passos.length - 1 && (
                      <span className="mt-7 h-[2px] w-10 shrink-0 rounded-full bg-[#000000]/20 sm:mt-8 sm:w-12" />
                    )}
                  </div>
                );
              });
            })()}
            </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F8FAF9] to-transparent" />
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
                const gridColsClass =
                  outros.length >= 4
                    ? "sm:grid-cols-4"
                    : outros.length === 3
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2";
                return (
                  outros.length > 0 && (
                    <div className="mb-5 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-5 sm:p-7">
                      <div className="mb-5 flex items-center gap-3 sm:gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                          <IconInfoCircle className="h-8 w-8 text-[#8A7049] sm:h-12 sm:w-12" />
                        </span>
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#24211D]/70 sm:text-lg sm:tracking-[0.2em]">
                          Informações Iniciais
                        </p>
                      </div>
                      <div
                        className={`grid grid-cols-1 gap-x-6 gap-y-4 ${gridColsClass}`}
                      >
                        {outros.map((item) => (
                          <div key={item.label} className="text-center">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#24211D]/55">
                              {item.label}
                            </p>
                            <p className="text-sm font-semibold text-[#24211D]">
                              {item.valor}
                            </p>
                          </div>
                        ))}
                      </div>
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
                      className="mb-5 flex items-center gap-3 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-5 sm:gap-4 sm:p-7"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                        <IconClockOutline className="h-8 w-8 text-[#2C6CA6] sm:h-12 sm:w-12" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2C6CA6]/85 sm:text-lg sm:tracking-[0.2em]">
                          Melhor Horário
                        </p>
                        <p className="mt-0.5 text-2xl font-semibold leading-tight text-[#1B4A73] sm:text-4xl">
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
                loading="lazy"
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
                      className="mb-5 flex items-center gap-3 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-5 sm:gap-4 sm:p-7"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                        <IconClockOutline className="h-8 w-8 text-[#2C6CA6] sm:h-12 sm:w-12" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2C6CA6]/85 sm:text-lg sm:tracking-[0.2em]">
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
            <div className="mb-5 rounded-2xl border border-[#BFDCF2] bg-[#EAF3FC] p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center">
                  <IconTicketOutline className="h-12 w-12 text-[#2C6CA6]" />
                </span>
                <p className="text-base font-bold uppercase tracking-[0.2em] text-[#2C6CA6]/85 sm:text-lg">
                  Ingressos & Preços
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {period.listasPraticas.map((lista) => (
                  <div key={lista.titulo}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1B4A73]/70">
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
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center">
                  <IconQuestionBubble className="h-12 w-12 text-emerald-700" />
                </span>
                <p className="text-base font-bold uppercase tracking-[0.2em] text-emerald-900 sm:text-lg">
                  Dúvidas Frequentes
                </p>
              </div>
              <div className="space-y-5">
                {period.decisoes.map((d) => (
                  <div key={d.titulo}>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-900">
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

          {period.horarioLojas && period.horarioLojas.length > 0 && (
            <HorarioLojasBlock itens={period.horarioLojas} />
          )}
          {period.banheirosProximos && period.banheirosProximos.length > 0 && (
            <BanheirosProximosBlock itens={period.banheirosProximos} />
          )}
          {period.infoOperacional && period.infoOperacional.itens.length > 0 && (
            <InfoOperacionalBlock info={period.infoOperacional} />
          )}

          {period.gradeHorarios && (
            <GradeHorariosBlock grade={period.gradeHorarios} />
          )}
        </>
      </NumberedStep>

      {period.visaoAnotada && !period.visaoAnotadaNoTopo && (
        <VisaoAnotadaBlock
          visaoAnotada={period.visaoAnotada}
          displayClassName={displayClassName}
        />
      )}

      {period.visaoAnotadaSecundaria && (
        <VisaoAnotadaBlock
          visaoAnotada={period.visaoAnotadaSecundaria}
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
        <NumberedStep number={passoRefeicao!} label="Gastronomia">
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
                loading="lazy"
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
      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center">
          <IconCalendar className="h-12 w-12 text-[#000000]" />
        </span>
        <p className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#24211D]/70 sm:text-lg">
          {grade.titulo ?? "Grade de Horários"}
        </p>
      </div>
      <div>
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

      {subAtracao.deslocamento && (
        <div className="mb-6">
          <DeslocamentoCard deslocamento={subAtracao.deslocamento} />
        </div>
      )}

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
                loading="lazy"
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
                loading="lazy"
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

      {subAtracao.alerta && <AlertaBlock alerta={subAtracao.alerta} />}

      {subAtracao.comparacao && (
        <ComparacaoTabelaBlock comparacao={subAtracao.comparacao} />
      )}

      {subAtracao.mapaVisaoGeral && (
        <MapaVisaoGeralBlock mapa={subAtracao.mapaVisaoGeral} />
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

      {subAtracao.banheirosProximos && subAtracao.banheirosProximos.length > 0 && (
        <BanheirosProximosBlock itens={subAtracao.banheirosProximos} />
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

// SVG (currentColor) usados nos cards de "Atração" — substituem os PNGs com
// filtro preto fixo (icone-informacoes-iniciais.png, icone-duvidas-
// frequentes.png), que não conseguiam herdar a cor de cada card (dourado,
// azul, verde). Referência visual aprovada: cards do dia do Kokugikan
// (app/rf3vk8mp).
function IconInfoCircle({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconQuestionBubble({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      <path d="M9.6 9.2a2.5 2.5 0 0 1 4.85.85c0 1.6-2.45 2-2.45 3.55" />
      <circle cx="12" cy="16.6" r="0.1" fill="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconTicketOutline({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" />
      <line x1="12" y1="7.5" x2="12" y2="16.5" strokeDasharray="2 2" />
    </svg>
  );
}

// Ícones pequenos usados nas linhas de fato do RestauranteCurado (preço,
// distância, horário, idioma, fila, reserva, pagamento) — substituem os
// emojis usados antes, pra manter um único estilo de ícone (linha, mesma
// espessura) em vez de misturar emoji com SVG.
function IconPin({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconClockOutline({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 4 5.8 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.8-4-9s1.4-6.4 4-9Z" />
    </svg>
  );
}

function IconHourglass({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M7 3c0 4.5 3 6 5 7.5C10 12 7 13.5 7 21" />
      <path d="M17 3c0 4.5-3 6-5 7.5 2 1.5 5 3 5 10.5" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function IconCreditCardSmall({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 15h4" />
    </svg>
  );
}

function IconPlane({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-aeroporto.webp"
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
                loading="lazy"
      src="/images/icone-trem.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconBus({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-onibus-v2.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconCar({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-taxi.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconWalk({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-andando-a-pe.webp"
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
                loading="lazy"
      src="/images/icone-trem-bala-shinkansen.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconExchange({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-cambio-dinheiro.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconCustoms({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-costumes.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconWords({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-frases-palavras-comuns.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconInsurance({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-seguro-viagem-v2.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconMedicalEmergency({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-emergencia-medica-v2.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

const INFO_CARDS = [
  { label: "Aeroporto DXB", Icon: IconPlane, view: "dxb" as const },
  {
    label: "Aeroporto NRT (Narita)",
    Icon: IconPlane,
    view: "narita" as const,
    subLabel: "CHEGADA",
  },
  {
    label: "Aeroporto HND (Haneda)",
    Icon: IconPlane,
    view: "haneda" as const,
    subLabel: "RETORNO",
  },
  { label: "Metrô", Icon: IconMetro, view: "trem" as const },
  { label: "Ônibus", Icon: IconBus, view: "onibus" as const },
  { label: "Trem Bala (Shinkansen)", Icon: IconShinkansen, view: "shinkansen" as const },
  { label: "Câmbio", Icon: IconExchange, view: "cambio" as const },
  { label: "Costumes", Icon: IconCustoms, view: "costumes" as const },
  { label: "Palavras Comuns", Icon: IconWords, view: "palavras" as const },
];

const SERVICOS_ADICIONAIS_CARDS = [
  { label: "Apólice Seguro Viagem", Icon: IconInsurance },
  { label: "Emergência Médica / Ativação de Sinistro", Icon: IconMedicalEmergency },
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
                loading="lazy"
      src="/images/icone-compras.webp"
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
                loading="lazy"
      src="/images/icone-banheiro.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconTicket({ className }: { className?: string }) {
  return (
    <img
                loading="lazy"
      src="/images/icone-ingressos.webp"
      alt=""
      className={`${className ?? ""} object-contain`}
    />
  );
}

function IconAccessible({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
      <path d="M10.5 8.5v3.5l-3.5 2M10.5 8.5h6M10.5 8.5l1.5 5 4.5 1.5M12 12l3.5 8" />
      <circle cx="9" cy="18" r="3" />
    </svg>
  );
}

function IconBench({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="4" y1="11" x2="4" y2="19" />
      <line x1="20" y1="11" x2="20" y2="19" />
      <line x1="6" y1="7" x2="6" y2="11" />
      <line x1="18" y1="7" x2="18" y2="11" />
      <line x1="6" y1="7" x2="18" y2="7" />
    </svg>
  );
}

function IconUmbrella({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12a9 9 0 0 1 18 0Z" />
      <line x1="12" y1="12" x2="12" y2="20" />
      <path d="M12 20a2 2 0 0 1-4 0" />
      <line x1="12" y1="3" x2="12" y2="5" />
    </svg>
  );
}

function IconMeetingPoint({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function IconDoorEnter({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 3h9v18H6" />
      <path d="M15 3l3 1v16l-3 1" />
      <line x1="10" y1="12" x2="10.01" y2="12" />
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
// public/images/lyf-mapa-arredores.webp.
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
    fotoHero: "/images/lyf-mural-fachada.webp",
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
          imagem: "/images/kyobashi-station-logo.webp",
          imagemAlt: "Sinalização da Estação Kyobashi — G10, Tokyo Metro Ginza Line",
        },
        {
          nome: "Estação Takaracho",
          imagem: "/images/takaracho-station-logo.webp",
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
      imagem: "/images/lyf-fachada-real.webp",
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
          imagem: "/images/lyf-rota-estacao-kyobashi.webp",
          imagemAlt: "Rota a pé da Estação Kyobashi até o lyf Ginza Tokyo",
        },
        {
          label: "Estação Takaracho",
          imagem: "/images/lyf-rota-takaracho.webp",
          imagemAlt: "Rota a pé da Estação Takaracho até o lyf Ginza Tokyo",
        },
        {
          label: "7-Eleven",
          imagem: "/images/lyf-rota-seven-eleven.webp",
          imagemAlt: "Rota a pé do 7-Eleven até o lyf Ginza Tokyo",
        },
        {
          label: "Lawson",
          imagem: "/images/lyf-rota-lawson.webp",
          imagemAlt: "Rota a pé do Lawson até o lyf Ginza Tokyo",
        },
        {
          label: "Saída 6 (Estação Kyobashi)",
          imagem: "/images/lyf-estacao-kyobashi-saida6.webp",
          imagemAlt: "Vista de rua da Saída 6 da Estação Kyobashi",
        },
        {
          label: "Farmácia Welcia",
          imagem: "/images/lyf-rota-welcia.webp",
          imagemAlt: "Rota a pé da Farmácia Welcia mais próxima até o lyf Ginza Tokyo",
        },
        {
          label: "St. Luke's International Hospital",
          imagem: "/images/lyf-rota-st-lukes.webp",
          imagemAlt: "Rota de carro até o St. Luke's International Hospital",
        },
        {
          label: "Kameda Kyobashi Clinic",
          imagem: "/images/lyf-rota-kameda-clinic.webp",
          imagemAlt: "Rota a pé até a Kameda Kyobashi Clinic",
        },
      ],
    },
  },
  {
    cidade: "Kyoto",
    nome: "Daiwa Roynet Hotel Kyoto-Ekimae PREMIER",
    fotoHero: "/images/daiwa-roynet-fotohero.webp",
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
        nome: "Matsumoto Kiyoshi — Kyoto Tower Sando",
        detalhe: "1F do Kyoto Tower Sando, ao lado do hotel — Tax Free, aberta das 10h às 23h",
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
      imagem: "/images/daiwa-roynet-mapa-arredores.webp",
      imagemAlt: "Mapa dos arredores do Daiwa Roynet Hotel Kyoto-Ekimae PREMIER, com Matsumoto Kiyoshi (Kyoto Tower Sando), LAWSON Kyoto Station, Koseikai Takeda Hospital e a Saída Karasuma da Kyoto Station",
      nota: "Localização do hotel em relação à Kyoto Station (saída Karasuma), à farmácia, à conveniência e ao hospital de referência listados acima.",
      pontos: [],
      rotas: [
        {
          label: "Kyoto Station (Saída Karasuma)",
          imagem: "/images/daiwa-roynet-rota-karasuma-exit.webp",
          imagemAlt: "Rota a pé do hotel até a Saída Karasuma da Kyoto Station",
        },
        {
          label: "Lawson",
          imagem: "/images/daiwa-roynet-rota-lawson.webp",
          imagemAlt: "Rota a pé do hotel até o Lawson Karasuma Shichijo (~3 min, 210 m)",
        },
        {
          label: "Koseikai Takeda Hospital",
          imagem: "/images/daiwa-roynet-rota-koseikai-hospital.webp",
          imagemAlt: "Rota a pé do hotel até o Koseikai Takeda Hospital",
        },
        {
          label: "Matsumoto Kiyoshi (farmácia)",
          imagem: "/images/daiwa-roynet-rota-matsumoto-kiyoshi.webp",
          imagemAlt: "Rota a pé do hotel até a Matsumoto Kiyoshi — Kyoto Tower Sando (~3 min, 200 m)",
        },
      ],
    },
  },
  {
    cidade: "Tokyo 2",
    nome: "remm Tokyo Kyobashi",
    fotoHero: "/images/remm-tokyo-kyobashi-fotohero.webp",
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
        nome: "Welcia — Tokyo Square Garden",
        detalhe: "Tokyo Square Garden — mesmo prédio da Kameda Kyobashi Clinic",
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
        "As duas estações mais próximas do remm Tokyo Kyobashi são Kyobashi (Tokyo Metro Ginza Line) e Takaracho (Toei Asakusa Line) — cada uma faz parte de uma linha diferente. Dependendo do dia, o roteiro indica uma ou outra: preste atenção às instruções de cada deslocamento, porque usar a linha errada pode aumentar bastante o tempo de trajeto.",
      estacoes: [
        {
          nome: "Estação Kyobashi",
          imagem: "/images/kyobashi-station-logo.webp",
          imagemAlt: "Sinalização da Estação Kyobashi — G10, Tokyo Metro Ginza Line",
        },
        {
          nome: "Estação Takaracho",
          imagem: "/images/takaracho-station-logo.webp",
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
      imagem: "/images/remm-fachada-real.webp",
      imagemAlt: "Fachada do remm Tokyo Kyobashi",
      pontos: [],
      rotas: [
        {
          label: "Estação Kyobashi",
          imagem: "/images/remm-rota-estacao-kyobashi.webp",
          imagemAlt: "Rota a pé da Estação Kyobashi até o remm Tokyo Kyobashi",
        },
        {
          label: "7-Eleven",
          imagem: "/images/remm-rota-7eleven.webp",
          imagemAlt: "Localização do 7-Eleven em relação ao remm Tokyo Kyobashi",
        },
        {
          label: "Kameda Kyobashi Clinic",
          imagem: "/images/remm-rota-kameda-clinic.webp",
          imagemAlt: "Rota a pé até a Kameda Kyobashi Clinic",
        },
        {
          label: "St. Luke's International Hospital",
          imagem: "/images/remm-rota-st-luke-hospital.webp",
          imagemAlt: "Rota a pé até o St. Luke's International Hospital",
        },
        {
          label: "Welcia (farmácia)",
          imagem: "/images/remm-rota-welcia.webp",
          imagemAlt: "Rota a pé do remm Tokyo Kyobashi até a Welcia — Tokyo Square Garden",
        },
      ],
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
                loading="lazy"
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
  "Farmácia": ["Farmácia Welcia", "Matsumoto Kiyoshi (farmácia)", "Welcia (farmácia)"],
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
  const [viewMode, setViewMode] = useState<
    | "dia"
    | "hotel"
    | "narita"
    | "haneda"
    | "trem"
    | "costumes"
    | "palavras"
    | "shinkansen"
    | "dxb"
    | "onibus"
    | "cambio"
  >("dia");
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
          <p className="mx-auto mb-5 inline-block rounded-full bg-black px-5 py-2 text-xs uppercase tracking-[0.3em] text-white">
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
          {/* Os cards de dia ficam sempre visíveis (quebra de linha), sem
              rolagem horizontal — o cliente precisa ver todas as opções de
              uma vez, não descobrir que precisa arrastar pro lado. */}
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
                      ? `text-[9px] tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)] ${
                          active ? "" : "hover:-translate-y-0.5 hover:!shadow-[0_0_0_2px_#DC2626]"
                        }`
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
                      <span
                        className="mt-0.5 text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: "#2C6CA6" }}
                      >
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
                      ? "border-[#000000] bg-[#E7F4E9] text-[#24211D] hover:border-transparent hover:bg-[#000000] hover:text-white"
                      : "border-[#DDD8CF] bg-[#E7F4E9] text-[#24211D]/72 hover:border-transparent hover:bg-[#000000] hover:text-white"
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
          {INFO_CARDS.map(({ label, Icon, view, subLabel }) => {
            const cardClassName =
              "group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#DCE7F2] bg-[#F1F6FB] px-3 py-4 text-center text-xs leading-5 text-[#24211D]/75 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#2C6CA6]/35 hover:bg-[#E9F1FA] hover:text-[#000000] hover:shadow-[0_10px_30px_-15px_rgba(23,59,69,0.35)]";
            const content = (
              <>
                <Icon
                  className={
                    label === "Trem Bala (Shinkansen)"
                      ? "h-20 w-20"
                      : label === "Ônibus"
                        ? "h-[4.5rem] w-[4.5rem]"
                        : "h-14 w-14"
                  }
                />
                <span>
                  {label}
                  {subLabel ? (
                    <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#C0392B]">
                      {subLabel}
                    </span>
                  ) : null}
                </span>
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

        <div className="flex flex-wrap items-center gap-2.5 px-6 pt-8 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#24211D]/60">
            Serviços Adicionais Contratados
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-[#DDD8CF] px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {SERVICOS_ADICIONAIS_CARDS.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex min-h-[112px] flex-col items-center justify-center gap-2.5 rounded-xl border border-[#F0DFA8] bg-[#FDF8E9] px-3 py-4 text-center text-xs leading-5 text-[#24211D]/75"
            >
              <Icon
                className={
                  label === "Emergência Médica / Ativação de Sinistro"
                    ? "h-[4.5rem] w-[4.5rem]"
                    : "h-20 w-20"
                }
              />
              {label}
            </div>
          ))}
        </div>

        <div ref={contentRef} className="scroll-mt-6 px-6 py-8 sm:px-10 sm:py-10">
          {viewMode === "dxb" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Conexão em Dubai (DXB)
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <DXBGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "onibus" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Ônibus em Kyoto
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <OnibusGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "cambio" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Onde Trocar Dinheiro
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <CambioGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "narita" ? (
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
          ) : viewMode === "haneda" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Aeroporto de Haneda (HND)
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <HanedaGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "trem" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Metrô e Trens no Japão
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <TremGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "costumes" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Costumes & Etiqueta
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <CostumesGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "palavras" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Palavras e Expressões Úteis
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <PalavrasGuideContent displayClassName={displayClassName} internal={false} />
              </div>
            </>
          ) : viewMode === "shinkansen" ? (
            <>
              <p className="mb-5 inline-block rounded-full border border-[#000000]/20 bg-[#F8FAF9] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#000000]">
                Trem Bala (Shinkansen)
              </p>
              <div className="-mx-6 overflow-hidden rounded-2xl sm:-mx-10">
                <ShinkansenGuideContent displayClassName={displayClassName} internal={false} />
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
            <>
              <div className="mb-8 rounded-2xl border border-[#DDD8CF] bg-[#FAF9F6] p-6 text-center sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#24211D]/65">
                  {current.city} · {current.date}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#24211D]/75">
                  {current.travelNote}
                </p>
              </div>
              {current.badge === "DXB-NRT" && <TransporteNaritaTokyoBlock variant="chegada" />}
              {current.badge === "HND-DXB" && <TransporteHanedaTokyoBlock />}
            </>
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

      {/* Botão fixo lateral — visível em qualquer ponto da rolagem, em
          qualquer viewMode, pra voltar rápido ao menu principal (grade de
          dias/hotéis/informações no topo do painel). Encostado na quina
          direita, bem acima da borda inferior: fora da faixa onde o Safari
          do iPhone "rouba" o primeiro toque pra reexibir a barra do
          navegador, e fora do caminho onde o polegar costuma arrastar pra
          rolar a página (o que também podia fazer o toque virar rolagem em
          vez de clique). */}
      <button
        type="button"
        onClick={scrollToDaysMenu}
        className="fixed right-3 z-50 flex flex-col items-center gap-1 rounded-2xl bg-black px-2.5 py-2.5 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition hover:-translate-x-0.5 sm:right-5"
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <img
                loading="lazy"
          src="/images/dragonball-4-star-tight.webp"
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
        <span className="text-[8px] font-bold uppercase leading-tight tracking-[0.1em]">
          Menu
        </span>
      </button>
    </>
  );
}
