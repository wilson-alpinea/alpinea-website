"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ContentCard, IconStar as IconStarKit, IconWarning, TrajetoArrow, TrajetoArrowHead } from "../components/AirportGuideKit";
import { NaritaGuideContent } from "../components/NaritaGuideContent";
import { HanedaGuideContent } from "../components/HanedaGuideContent";
import { TremGuideContent } from "../components/TremGuideContent";
import { CostumesGuideContent } from "../components/CostumesGuideContent";
import { PalavrasGuideContent } from "../components/PalavrasGuideContent";
import { ShinkansenGuideContent } from "../components/ShinkansenGuideContent";
import { DXBGuideContent } from "../components/DXBGuideContent";
import { OnibusGuideContent } from "../components/OnibusGuideContent";
import { CambioGuideContent } from "../components/CambioGuideContent";

// DEMONSTRAÇÃO (Wilson, 04/nov/2026) — cópia de app/rf3vk8mp sem dados
// pessoais do cliente e com só 2 dias abertos (Dia 1 e Dia 4). Não editar o
// roteiro do cliente por aqui.
//
// Painel interativo do roteiro personalizado — mesma lógica visual do Painel
// Interativo usado em /ajisairoteiros (pílulas, abas de dia, tipografia
// Bodoni Moda), mas em tema claro e sem hero.

type Poi = {
  category?: string;
  bairro?: "Sumida" | "Ryogoku" | "Jinbocho";
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
  // Força o card a usar a paleta laranja de destaque, independente do
  // `bairro` — usado para POIs que merecem atenção visual (ex.: fica em
  // outro lado do bairro do que o resto do roteiro do dia), sem que isso
  // implique mostrar um selo de bairro (que `bairro` mostraria).
  estiloDestaque?: "laranja";
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
  // Card extra com horários reais de saída (ônibus/trem) — usado quando o
  // primeiro horário da manhã é sensível (ex.: chegar no templo na abertura)
  // e vale mostrar a grade de horários em vez de só "confirme o horário".
  gradeSaidas?: GradeSaidas;
};

type GradeSaidas = {
  // Card de destaque com o primeiro horário recomendado (opcional) — usado
  // quando faz sentido chamar atenção pra uma saída específica em vez de só
  // listar a grade.
  destaque?: {
    titulo: string; // ex.: "Primeiro ônibus do dia (recomendado)"
    linha: string; // ex.: "Ônibus 206"
    subtitulo?: string; // ex.: "Via Kiyomizu-dera"
    horario: string; // ex.: "05:31"
    embarque?: string;
    desembarque?: string;
    tempo?: string;
    tarifa?: string;
    resultado?: string; // ex.: "Assim, você chega ao portão do templo por volta de 05:55–06:00..."
  };
  titulo?: string; // rótulo acima da tabela, ex.: "Próximas saídas da linha 206"
  colunas: string[]; // cabeçalhos da tabela, ex.: ["Horário"] ou ["Saída Kyoto","Chegada Inari","Duração"]
  linhas: string[][]; // valores de cada linha, na mesma ordem de `colunas`
  nota?: string; // fonte/observação sobre os horários, exibida abaixo da tabela
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
  // Tabelas de horários reais de trens — usadas quando há uma ou mais janelas
  // específicas de saída a considerar no dia (ex.: opções de manhã e opções
  // à noite). Cada tabela pode ter seu próprio texto de contexto, cabeçalhos
  // e nota de rodapé, já que os dois lados de uma viagem (ida/volta) costumam
  // ter colunas diferentes (ex.: "JR Pass" na ida, "Observação" na volta).
  tabelasHorarios?: TabelaHorarios[];
};

type TabelaHorarios = {
  // Texto de contexto acima da tabela (ex.: explicação da regra do JR Pass,
  // ou "algumas das melhores opções de Hikari são:").
  descricao?: string;
  // Rótulo/título da tabela em si, exibido em destaque acima do cabeçalho.
  titulo?: string;
  colunas: string[];
  linhas: string[][];
  // Nota de rodapé (ex.: fonte/data do timetable), exibida abaixo da tabela.
  nota?: string;
};

type AlertaSugerido = {
  titulo: string;
  horario: string;
  mensagem: string;
};

type DayContent = {
  day: number;
  /** Demonstração: dia fora da amostra (só aparece no menu, sem conteúdo). */
  bloqueado?: boolean;
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
  bloqueado: true,
};

const DAY_3: DayContent = {
  day: 3,
  city: "Tokyo",
  date: "07 Mai",
  bloqueado: true,
};

const DAY_4: DayContent = {
  day: 2,
  city: "Tokyo",
  date: "06 Mai",
  bloqueado: true,
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
      gradeSaidas: {
        destaque: {
          titulo: "Primeiro ônibus do dia (recomendado)",
          linha: "Ônibus 206",
          subtitulo: "Via Kiyomizu-dera",
          horario: "05:31",
          embarque: "Plataforma D2 (Karasuma Exit)",
          desembarque: "Gojozaka ou Kiyomizu-michi",
          tempo: "15–20 min + 10 min de caminhada",
          tarifa: "¥230",
          resultado:
            "Assim, você chega ao portão do templo por volta de 05:55–06:00, praticamente sem multidões.",
        },
        titulo: "Próximas saídas da linha 206",
        colunas: ["Horário"],
        linhas: [
          ["05:31"],
          ["06:11"],
          ["06:20"],
          ["06:32"],
          ["06:39"],
          ["06:52"],
          ["06:58"],
        ],
        nota: "Horários de referência da linha 206 (Kyoto City Bus), com base no Kyoto City Info e outras fontes locais — confirme no painel da parada no dia, já que a frequência pode variar por temporada.",
      },
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
  bloqueado: true,
};

const DAY_7: DayContent = {
  day: 6,
  city: "Tokyo",
  date: "10 Mai",
  bloqueado: true,
};

const CHEGADA: DayContent = {
  day: 0,
  badge: "FRA-HND",
  city: "Chegada",
  date: "04 Mai",
  travel: true,
  bloqueado: true,
};

const PARTIDA: DayContent = {
  day: 8,
  badge: "HND-FRA",
  city: "Partida",
  date: "12 Mai",
  travel: true,
  bloqueado: true,
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

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

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

// Círculo colorido por cidade no menu de dias (Wilson, 04/nov/2026: "mudar
// as dragonballs por círculos coloridos").
const COR_CIDADE: Record<string, [string, string]> = {
  Tokyo: ["#5AA6E6", "#1C6EA8"],
  Kyoto: ["#E39A68", "#B96432"],
};
function corCidade(cidade: string) {
  const [claro, escuro] = COR_CIDADE[cidade] ?? ["#8FA3B8", "#4A6178"];
  return `radial-gradient(circle at 35% 30%, ${claro} 0%, ${escuro} 75%)`;
}

// Demonstração (Wilson, 04/nov/2026): só o Dia 1 (Tokyo) e o Dia 4 (Kyoto)
// têm conteúdo; os outros aparecem no menu com cadeado.
const DIAS_LIBERADOS_TEXTO = (() => {
  const l = DAYS.filter((d) => !d.bloqueado).map((d) => `o Dia ${d.day}`);
  return l.length > 1 ? `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}` : l[0];
})();

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
    muted: "text-[#000000]/70",
    starMuted: "text-[#2C6CA6]/25",
    badge: "border-[#2C6CA6]/30 bg-[#2C6CA6]/10 text-[#2C6CA6]",
    chip: "border-[#2C6CA6]/25 bg-[#FFFFFF] text-[#2C6CA6]",
  },
  Ryogoku: {
    border: "border-[#B96432]",
    bg: "bg-[#F5E9DF]",
    circle: "bg-[#B96432]",
    text: "text-[#B96432]",
    muted: "text-[#B96432]/70",
    starMuted: "text-[#B96432]/25",
    badge: "border-[#B96432]/30 bg-[#B96432]/10 text-[#B96432]",
    chip: "border-[#B96432]/25 bg-[#FFFFFF] text-[#B96432]",
  },
  // Laranja — usado para destacar POIs que ficam fora do bairro principal do
  // dia (ex.: Jinbocho, citado dentro do dia de Kanda, mas é um bairro à parte).
  Jinbocho: {
    border: "border-[#B96432]",
    bg: "bg-[#F5E9DF]",
    circle: "bg-[#B96432]",
    text: "text-[#B96432]",
    muted: "text-[#B96432]/70",
    starMuted: "text-[#B96432]/25",
    badge: "border-[#B96432]/30 bg-[#B96432]/10 text-[#B96432]",
    chip: "border-[#B96432]/25 bg-[#FFFFFF] text-[#B96432]",
  },
} as const;

function poiStyles(bairro?: Poi["bairro"], estiloDestaque?: Poi["estiloDestaque"]) {
  if (estiloDestaque === "laranja") return BAIRRO_STYLES.Ryogoku;
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
  const s = poiStyles(poi.bairro, poi.estiloDestaque);
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
    <div className="mb-10 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-5 sm:p-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/68">
        Contexto
      </p>
      <div className="space-y-3">
        {contexto.map((paragrafo, index) => (
          <p key={index} className="text-sm leading-6 text-[#000000]/85">
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
        <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#000000]/70 sm:text-lg">
          Banheiros Públicos Mais Próximos
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-[#000000]/45 transition-transform duration-200 ${
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
            <div key={b.local} className={i > 0 ? "border-t border-[#E3E6EA] pt-3.5" : ""}>
              <p className="text-sm font-semibold text-[#000000]">{b.local}</p>
              {b.endereco && (
                <p className="mt-0.5 text-xs text-[#000000]/60">{b.endereco}</p>
              )}
              {b.nota && (
                <p className="mt-1 text-xs leading-5 text-[#000000]/70">{b.nota}</p>
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
          <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#000000]/70 sm:text-lg">
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
          <span className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#000000]/70 sm:text-lg">
            {info.titulo}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 text-[#000000]/45 transition-transform duration-200 ${
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
            <div key={b.local} className={i > 0 ? "border-t border-[#E3E6EA] pt-3.5" : ""}>
              <p className="text-sm font-semibold text-[#000000]">{b.local}</p>
              {b.endereco && (
                <p className="mt-0.5 text-xs text-[#000000]/60">{b.endereco}</p>
              )}
              {b.nota && (
                <p className="mt-1 text-xs leading-5 text-[#000000]/70">{b.nota}</p>
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
        <span className="min-w-0 flex-1 text-sm font-bold uppercase tracking-[0.12em] text-[#000000]/70 sm:text-lg sm:tracking-[0.2em]">
          Horário das Lojas
        </span>
      </div>
      <div className="space-y-3">
        {itens.map((b, i) => (
          <div
            key={b.nome}
            className={`flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
              i > 0 ? "border-t border-[#E3E6EA] pt-3" : ""
            }`}
          >
            <p className="min-w-0 text-sm font-semibold text-[#000000] sm:flex-1">{b.nome}</p>
            <p className="text-xs text-[#000000]/70 sm:shrink-0 sm:text-right">{b.horario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Carrossel mobile genérico para as "linhas do tempo" horizontais do
// roteiro (Resumo do Dia, Percurso Essencial, e qualquer futura sequência
// de passos com foto/ícone + horário). Resolve os dois problemas de UX
// que existiam nas duas implementações antigas (cada uma com sua própria
// cópia quase-idêntica do padrão):
//   1) o carrossel não deixava óbvio que havia mais conteúdo fora da tela
//      (só um "Arraste para o lado" minúsculo) e não tinha scroll-snap,
//      indicador de posição nem setas;
//   2) a linha conectando os marcadores era desenhada como vários
//      segmentinhos independentes (um `<span>` entre cada par de cards)
//      em vez de uma única linha contínua no mesmo eixo Y.
// Aqui a linha é UM único elemento absoluto atravessando todo o trilho, e
// cada card reserva uma "zona de marcador" de altura fixa (h-16) — como
// essa altura é igual pra todos os cards (não depende do conteúdo de cada
// um), o centro vertical de todo marcador cai automaticamente na mesma
// coordenada, sem nenhum ajuste manual de offset por estação/passo.
function StepTimelineCarousel<T extends { titulo: string; horario?: string }>({
  passos,
  variant,
  fadeFromColor,
  renderMarker,
}: {
  passos: T[];
  variant: "dark" | "light";
  // Cor de fundo do container que envolve o carrossel — usada só pro
  // degradê de borda direita (indicando conteúdo cortado) se fundir sem
  // costura com o fundo real do card, que muda conforme o contexto.
  fadeFromColor: string;
  renderMarker: (passo: T, index: number) => ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false, progress: 0 });

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setScrollState({ atStart: true, atEnd: true, progress: 0 });
      return;
    }
    setScrollState({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft >= maxScroll - 4,
      progress: Math.min(1, Math.max(0, el.scrollLeft / maxScroll)),
    });
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passos.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-step-card]");
    const step = firstCard ? firstCard.offsetWidth + 32 : el.clientWidth * 0.6;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const isDark = variant === "dark";
  const canScroll = !(scrollState.atStart && scrollState.atEnd);
  const hint = !canScroll
    ? null
    : scrollState.atStart
      ? "DESLIZE PARA EXPLORAR →"
      : scrollState.atEnd
        ? "← DESLIZE PARA EXPLORAR"
        : "← DESLIZE PARA EXPLORAR →";

  const lineColor = isDark ? "rgba(255,255,255,0.22)" : "rgba(36,33,29,0.16)";
  const arrowBtnClass = isDark
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-white text-[#000000] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] border border-[#E3E6EA] hover:bg-[#F5F3EE]";

  return (
    <div>
      {hint && (
        <p
          className={`mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isDark ? "text-white/65" : "text-[#000000]/55"
          }`}
        >
          {hint}
        </p>
      )}
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          <div className="relative flex w-max gap-8 pb-1 pr-8">
            {/* Linha única contínua — não um segmento por passo. */}
            <div
              className="pointer-events-none absolute left-0 right-8 top-8 h-[2px]"
              style={{ background: lineColor }}
            />
            {passos.map((passo, i) => (
              <div
                key={passo.titulo + i}
                data-step-card
                className="relative flex w-24 shrink-0 flex-col items-center text-center sm:w-28"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Zona do marcador: altura fixa (h-16) igual em todo
                    card — é isso que garante o mesmo eixo Y pra todos,
                    em vez de alinhar "no olho" com margin/top por item. */}
                <div className="relative z-10 flex h-16 w-full items-center justify-center">
                  {renderMarker(passo, i)}
                </div>
                {passo.horario && (
                  <p
                    className={`mt-2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.08em] ${
                      isDark ? "text-white/55" : "text-[#B96432]"
                    }`}
                  >
                    {passo.horario}
                  </p>
                )}
                <p
                  className={`mt-0.5 line-clamp-2 text-xs font-semibold leading-tight ${
                    isDark ? "text-white" : "text-[#000000]"
                  }`}
                >
                  {passo.titulo}
                </p>
              </div>
            ))}
          </div>
        </div>
        {!scrollState.atEnd && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent"
            style={{ ["--tw-gradient-from" as string]: fadeFromColor }}
          />
        )}
        {canScroll && (
          <>
            {/* Botão em si é a área de toque real (44x44, conforme
                especificação) mas fica invisível — só o círculo interno
                menor é visível, pra não parecer que "vaza" pro padding do
                card ao ficar meio pra dentro, meio pra fora da borda. */}
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollByCard(-1)}
              disabled={scrollState.atStart}
              className="absolute left-0 top-8 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center disabled:pointer-events-none disabled:opacity-0"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition ${arrowBtnClass}`}>
                ‹
              </span>
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => scrollByCard(1)}
              disabled={scrollState.atEnd}
              className="absolute right-0 top-8 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center disabled:pointer-events-none disabled:opacity-0"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition ${arrowBtnClass}`}>
                ›
              </span>
            </button>
          </>
        )}
      </div>
      {canScroll && (
        <CarouselProgress count={passos.length} progress={scrollState.progress} isDark={isDark} />
      )}
    </div>
  );
}

function CarouselProgress({
  count,
  progress,
  isDark,
}: {
  count: number;
  progress: number;
  isDark: boolean;
}) {
  if (count <= 6) {
    const activeIndex = Math.round(progress * (count - 1));
    return (
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? 18 : 6,
              backgroundColor: isDark
                ? i === activeIndex
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.25)"
                : i === activeIndex
                  ? "rgba(36,33,29,0.7)"
                  : "rgba(36,33,29,0.16)",
            }}
          />
        ))}
      </div>
    );
  }
  const thumbPct = Math.max(15, 100 / count);
  const travel = thumbPct >= 100 ? 0 : (100 / thumbPct - 1) * 100;
  return (
    <div
      className={`mt-3 h-1 w-full overflow-hidden rounded-full ${
        isDark ? "bg-white/15" : "bg-[#000000]/10"
      }`}
    >
      <div
        className={`h-full rounded-full ${isDark ? "bg-white/70" : "bg-[#000000]/45"}`}
        style={{ width: `${thumbPct}%`, transform: `translateX(${progress * travel}%)` }}
      />
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
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white">
        Resumo do Dia
      </p>
      <StepTimelineCarousel
        passos={resumo.passos}
        variant="dark"
        fadeFromColor="#000000"
        renderMarker={(passo) =>
          passo.foto ? (
            passo.foto.includes("/images/icone-") ? (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm ${
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
                      ? "h-10 w-10 object-contain"
                      : passo.foto.includes("icone-hotel")
                        ? "h-8 w-8 object-contain"
                        : "h-7 w-7 object-contain"
                  }
                />
              </div>
            ) : (
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <img
                loading="lazy"
                  src={passo.foto}
                  alt={passo.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            )
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-white/25 text-white/40">
              <IconClock className="h-4 w-4" />
            </div>
          )
        }
      />
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
    <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF] p-5 sm:grid-cols-3 sm:p-6">
      {itens.map((item) => (
        <div key={item.label}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#000000]/45">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-[#000000]">{item.valor}</p>
        </div>
      ))}
    </div>
  );
}

function GastronomiaBlock({ gastronomia }: { gastronomia: Gastronomia }) {
  const [zoomedFoto, setZoomedFoto] = useState<{ src: string; alt: string; endereco?: string } | null>(null);
  const temItens = gastronomia.itens && gastronomia.itens.length > 0;
  const temRestaurantes = gastronomia.restaurantes && gastronomia.restaurantes.length > 0;
  const temCuradoria = gastronomia.curadoria && gastronomia.curadoria.length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <img
                loading="lazy"
          src="/images/icone-gastronomia.webp"
          alt=""
          className="h-20 w-20 shrink-0 object-contain"
          style={{ filter: "brightness(0) saturate(100%)" }}
        />
        <div>
          <p className="text-base font-bold uppercase tracking-[0.2em] text-[#000000]/70 sm:text-lg">
            {gastronomia.titulo ?? "Gastronomia"}
          </p>
          {gastronomia.subtitulo && (
            <p className="mt-1 text-sm text-[#000000]/65">
              {gastronomia.subtitulo}
            </p>
          )}
        </div>
      </div>

      {gastronomia.intro && (
        <p className="mt-3 text-sm leading-6 text-[#000000]/78">
          {gastronomia.intro}
        </p>
      )}

      {gastronomia.alerta && <InlineAlert text={gastronomia.alerta} />}

      {temItens && (
        <>
          {gastronomia.itensLabel && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#000000]/45">
              {gastronomia.itensLabel}
            </p>
          )}
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${gastronomia.itensLabel ? "mt-2" : "mt-4"}`}>
            {gastronomia.itens!.map((item) => (
              <div
                key={item.nome}
                className="overflow-hidden rounded-xl border border-[#E3E6EA] bg-[#FFFFFF]"
              >
                {item.foto && (
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedFoto({ src: item.foto!, alt: item.nome, endereco: item.localizacao })
                    }
                    className="group relative block aspect-square w-full overflow-hidden"
                  >
                    <img
                      loading="lazy"
                      src={item.foto}
                      alt={item.nome}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
                      <span className="flex h-7 w-7 scale-75 items-center justify-center rounded-full bg-white/90 text-[#000000] opacity-0 shadow-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <IconZoom className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold leading-tight text-[#000000]">{item.nome}</p>
                  {item.descricao && (
                    <p className="mt-1 text-[11px] leading-5 text-[#000000]/65">{item.descricao}</p>
                  )}
                  {(item.localizacao || item.preco) && (
                    <div className="mt-2 space-y-1 border-t border-[#E3E6EA] pt-2 text-[10px] leading-4 text-[#000000]/55">
                      {item.localizacao && (
                        <p className="flex items-start gap-1">
                          <IconPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{item.localizacao}</span>
                        </p>
                      )}
                      {item.preco && (
                        <p className="flex items-center gap-1">
                          <span className="w-3 shrink-0 text-center text-[10px] font-semibold">¥</span>
                          <span>{item.preco}</span>
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

      {temRestaurantes && (
        <>
          {gastronomia.restaurantesLabel && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#000000]/45">
              {gastronomia.restaurantesLabel}
            </p>
          )}
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${gastronomia.restaurantesLabel ? "mt-2" : "mt-4"}`}>
            {gastronomia.restaurantes!.map((r) => (
              <div
                key={r.nome}
                className="overflow-hidden rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF]"
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
                  <p className="text-sm font-semibold text-[#000000]">
                    {r.nome}
                  </p>
                  {r.descricao && (
                    <p className="mt-0.5 text-xs text-[#B96432]">
                      {r.descricao}
                    </p>
                  )}
                  {(r.localizacao || r.preco || r.horario) && (
                    <div className="mt-3 space-y-1.5 border-t border-[#E3E6EA] pt-3 text-[11px] leading-5 text-[#000000]/60">
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
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#000000]/45">
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
                    : "border-[#E3E6EA] bg-[#FFFFFF]"
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
                  <p className="text-sm font-semibold text-[#000000]">{r.nome}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#000000]/45">
                    {r.categoria}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#000000]/78">
                    {r.descricao}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-[#E3E6EA] pt-3 text-[11px] leading-5 text-[#000000]/65">
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
    <div className="mt-6 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/68">
        Compras Exclusivas
      </p>
      <p className="mt-2 text-sm leading-6 text-[#000000]/78">
        {compras.descricao}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {compras.itens.map((item) => (
          <div
            key={item.nome}
            className="overflow-hidden rounded-xl border border-[#E3E6EA] bg-[#FFFFFF]"
          >
            {item.imagem ? (
              <img
                loading="lazy"
                src={item.imagem}
                alt={item.nome}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-[#F6F8FA] text-[10px] uppercase tracking-wide text-[#000000]/55">
                Sem imagem
              </div>
            )}
            <p className="p-2 text-center text-xs font-medium leading-4 text-[#000000]/90">
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
      <p className="text-lg font-semibold text-[#000000]">{transporte.linha}</p>
      <p className="mt-1 text-sm text-[#000000]/78">{transporte.tempo}</p>
      <p className="mt-3 text-sm leading-6 text-[#000000]/90">
        {transporte.recomendacao}
      </p>
      {transporte.tabelasHorarios?.map((tabela, idx) => (
        <div key={idx} className="mt-4">
          {tabela.descricao && (
            <p className="mb-2 text-sm leading-6 text-[#000000]/90">{tabela.descricao}</p>
          )}
          {tabela.titulo && (
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-700">
              {tabela.titulo}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-red-200 bg-white">
            <table className="w-full min-w-[380px] text-left text-xs">
              <thead>
                <tr className="border-b border-red-200 bg-red-50/60 text-[10px] uppercase tracking-wide text-red-800">
                  {tabela.colunas.map((c) => (
                    <th key={c} className="px-3 py-2 font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabela.linhas.map((linha, i) => (
                  <tr key={i} className={i > 0 ? "border-t border-red-100" : undefined}>
                    {linha.map((valor, j) => (
                      <td
                        key={j}
                        className={`whitespace-nowrap px-3 py-2 ${
                          j === 0 ? "font-semibold text-[#000000]" : "text-[#000000]/85"
                        }`}
                      >
                        {valor}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tabela.nota && (
            <p className="mt-2 text-[11px] leading-4 text-[#000000]/60">{tabela.nota}</p>
          )}
        </div>
      ))}
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
    <div className="mb-8 space-y-5 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-5 sm:p-8">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/60">
          <IconPlane className="h-4 w-4" />
          Narita ↔ Tóquio
        </p>
        <h3 className="text-lg font-semibold text-[#000000] sm:text-xl">Duas Opções de Transporte</h3>
        <p className="mt-3 text-sm leading-6 text-[#000000]/80">
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
        <p className="mt-3 text-sm leading-6 text-[#000000]/85">
          O Airport Limousine Bus é a alternativa mais prática para quem está viajando com malas.
          As bagagens maiores são entregues ao funcionário antes do embarque e transportadas no
          compartimento inferior do ônibus. Você evita plataformas, escadas, corredores e a
          necessidade de circular por grandes estações carregando as malas.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">{rotaLabel}</p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/85">
            {variant === "chegada"
              ? "Narita Terminal 2 → Airport Limousine Bus → Tokyo Station/Yaesu → táxi curto → lyf Ginza Tokyo."
              : "remm Tokyo Kyobashi → táxi curto → ponto do Airport Limousine Bus → Narita Terminal 2."}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/75">
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
              <p className="text-xs leading-5 text-[#000000]/75">{d}</p>
            </div>
          ))}
        </div>

        {variant === "chegada" && (
          <div className="mt-4 space-y-3 rounded-lg bg-white/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
              Como Comprar o Bilhete do Limousine Bus
            </p>

            <img
              loading="lazy"
              src="/images/narita-limousine-bus-balcao-terminal.webp"
              alt="Balcão de venda de bilhetes do Airport Limousine Bus, com atendentes no saguão do terminal"
              className="aspect-[16/10] w-full rounded-lg border border-[#CBD9F2] object-cover sm:aspect-[16/9]"
            />
            <p className="text-center text-xs text-[#000000]/55">Bus Ticket Counter — balcão de venda dos bilhetes</p>

            <img
              loading="lazy"
              src="/images/narita-limousine-bus-ponto-embarque.webp"
              alt="Ponto de embarque do Airport Limousine Bus, com funcionários organizando as bagagens dos passageiros"
              className="aspect-[16/10] w-full rounded-lg border border-[#CBD9F2] object-cover sm:aspect-[16/9]"
            />
            <p className="text-center text-xs text-[#000000]/55">Ponto de embarque — funcionários cuidam das bagagens</p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  1
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  Depois de desembarcar, ao passar pela Imigração, retirar as malas e passar pela
                  Alfândega, você sai direto no{" "}
                  <span className="font-semibold">Terminal 2, 1º andar (1F), International Arrivals
                  Lobby</span> — sem precisar subir ou descer de andar. Os balcões de ônibus ficam
                  no próprio saguão de desembarque, perto das áreas de chegada internacional A e B.
                  Procure pelas placas <span className="font-semibold">BUS TICKETS / BUS TICKET
                  COUNTER</span> ou pelo nome <span className="font-semibold">Airport Limousine /
                  Limousine Bus</span>.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  2
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Onde comprar:</span> no Bus Ticket Counter, que
                  funciona atualmente das <span className="font-semibold">06:30 às 23:00</span>{" "}
                  aproximadamente. No balcão, informe ao atendente o destino — pode simplesmente
                  mostrar no celular, por exemplo &ldquo;Airport Limousine Bus to Tokyo Station,
                  please&rdquo;, ou o nome do hotel/ponto de desembarque do seu roteiro. O atendente
                  confere os próximos ônibus disponíveis e indica o melhor horário.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  3
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Escolha o horário</span> com alguma folga — os
                  bilhetes saem vinculados a uma saída específica, então considere o tempo de comprar
                  o bilhete, ir até o ponto, entregar as malas e embarcar. A vantagem de comprar só
                  depois da Imigração é não precisar se preocupar caso o voo atrase ou a Imigração
                  demore mais que o previsto.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  4
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Confira o bilhete</span> antes de sair do balcão:
                  DESTINATION (destino), DEPARTURE TIME (horário de saída) e BUS STOP / PLATFORM
                  (número do ponto) — este último é especialmente importante, já que várias linhas
                  com destinos diferentes saem do Terminal 2.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  5
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Vá para o ponto de ônibus</span> seguindo as placas
                  BUS / BUS STOPS — as paradas ficam do lado de fora do Terminal 2, ainda no mesmo
                  1F, sem precisar de elevador, escada ou trem. Saia pela porta indicada e procure o
                  número do ponto impresso no bilhete.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  6
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Entregue as malas</span> ao funcionário no ponto,
                  alguns minutos antes do horário — as malas grandes vão no bagageiro inferior do
                  ônibus, e você recebe um comprovante/etiqueta de bagagem. Guarde essa etiqueta até
                  retirar a mala no destino.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#CBD9F2] bg-white p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3E5FA8]/40 text-xs font-medium text-[#3E5FA8]">
                  7
                </span>
                <p className="text-sm leading-6 text-[#000000]/85">
                  <span className="font-semibold">Embarque:</span> quando o ônibus chegar, confirme
                  no painel frontal/lateral se o destino corresponde ao do seu bilhete, apresente o
                  bilhete ou QR Code e embarque — os assentos são individuais.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ContentCard variant="warning" icon={IconAlertTriangle} eyebrow="Atenção" size="sm">
                <p>
                  Não desça para o B1F — é onde ficam as estações dos trens JR e Keisei. Os bilhetes
                  de ônibus são vendidos no 1F, no mesmo andar do desembarque.
                </p>
              </ContentCard>
              <ContentCard variant="warning" icon={IconAlertTriangle} eyebrow="Atenção" size="sm">
                <p>
                  Não confunda com o balcão identificado como LCB / Low Cost Bus — é um serviço
                  diferente do Airport Limousine Bus.
                </p>
              </ContentCard>
            </div>
          </div>
        )}

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
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#000000]/55">Alternativa mais previsível</p>
        <p className="mt-3 text-sm leading-6 text-[#000000]/85">
          O Narita Express, ou N&apos;EX, é o trem expresso da JR que conecta o Aeroporto de Narita
          diretamente a Tokyo Station. Possui assentos reservados e áreas destinadas às bagagens,
          sendo uma alternativa confortável para quem prefere viajar de trem.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">{rotaLabel}</p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/85">
            {variant === "chegada"
              ? "Narita Terminal 2 → Narita Express → Tokyo Station → táxi curto → lyf Ginza Tokyo."
              : "remm Tokyo Kyobashi → táxi curto → Tokyo Station → Narita Express → Narita Terminal 2."}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#000000]/80">
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
              <p className="text-xs leading-5 text-[#000000]/75">{d}</p>
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
    <div className="mb-8 space-y-5 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-5 sm:p-8">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/60">
          <IconPlane className="h-4 w-4" />
          Tóquio ↔ Haneda
        </p>
        <h3 className="text-lg font-semibold text-[#000000] sm:text-xl">
          remm Tokyo Kyobashi → Haneda Airport T3
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#000000]/80">
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
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#000000]/55">
          Melhor equilíbrio entre conforto e custo
        </p>
        <p className="mt-3 text-sm leading-6 text-[#000000]/85">
          remm Tokyo Kyobashi → táxi → Tokyo City Air Terminal (T-CAT) → Airport Limousine Bus →
          Haneda Airport Terminal 3.
        </p>

        <div className="mt-4 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
            Etapa 1 · Hotel → T-CAT
          </p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/85">
            Peça na recepção do remm um táxi até a Tokyo City Air Terminal — T-CAT (東京シティエアターミナル).
            Informe que você está viajando com 3 malas grandes, para que seja utilizado um veículo
            com espaço adequado.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tempo
              </p>
              <p className="text-sm font-semibold text-[#000000]">≈10–15 min</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Táxi
              </p>
              <p className="text-sm font-semibold text-[#000000]">até ¥4.000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Bagagem
              </p>
              <p className="text-sm font-semibold text-[#000000]">No porta-malas</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
            Etapa 2 · T-CAT → Haneda T3
          </p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/85">
            Ao chegar ao T-CAT, siga para o embarque do Airport Limousine Bus com destino a Haneda
            Airport. Entregue as malas à equipe antes do embarque — elas ficam no compartimento
            inferior do ônibus e são devolvidas no desembarque, já no Terminal 3.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tempo
              </p>
              <p className="text-sm font-semibold text-[#000000]">≈25 min</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tarifa
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                ¥1.000/pessoa · ¥2.000 (2 pessoas)
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Bagagem
              </p>
              <p className="text-sm font-semibold text-[#000000]">No bagageiro do ônibus</p>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-3 rounded-lg bg-white/70 p-4">
          <div className="flex items-center gap-2">
            <img
              loading="lazy"
              src="/images/tcat-logo-mascote.webp"
              alt="Mascote do T-CAT (Tokyo City Air Terminal)"
              className="h-9 w-9 shrink-0 object-contain"
            />
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
              Como Comprar a Passagem no T-CAT
            </p>
          </div>

          <img
            loading="lazy"
            src="/images/tcat-plataforma-limousine-bus.webp"
            alt="Plataforma de embarque do Airport Limousine Bus no T-CAT, com ônibus e passageiros"
            className="aspect-[16/10] w-full rounded-lg border border-[#CBD9F2] object-cover sm:aspect-[16/9]"
          />

          <p className="text-sm leading-6 text-[#000000]/85">
            Ao entrar no <span className="font-semibold">T-CAT Main Building, 1º andar (1F)</span>,
            procure pelas indicações <span className="font-semibold">LIMOUSINE BUS</span>,{" "}
            <span className="font-semibold">HANEDA AIRPORT</span> e{" "}
            <span className="font-semibold">BUS TICKET</span> — o balcão de passagens, as máquinas
            automáticas e a própria área de embarque ficam todos nesse mesmo andar.
          </p>
          <p className="text-sm leading-6 text-[#000000]/85">
            Você pode comprar no balcão do Airport Limousine Bus, em máquinas automáticas, ou
            antecipadamente pela internet. Para quem usa o serviço pela primeira vez, o balcão é o
            mais simples, pois o atendente confirma o terminal correto — diga{" "}
            <span className="font-semibold">&ldquo;Haneda Airport, Terminal 3, please&rdquo;</span> ou
            mostre no celular <span className="font-semibold">HANEDA AIRPORT — TERMINAL 3</span>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tarifa Adulto
              </p>
              <p className="text-sm font-semibold text-[#000000]">¥1.000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
                Tarifa Criança (6–11 anos)
              </p>
              <p className="text-sm font-semibold text-[#000000]">¥500</p>
            </div>
          </div>

          <p className="text-sm leading-6 text-[#000000]/85">
            Aceita pagamento em dinheiro, cartão de crédito ou IC Card (Suica/Pasmo). Antes de sair
            do balcão, confira no bilhete: <span className="font-semibold">DESTINATION</span>{" "}
            (Haneda Airport), <span className="font-semibold">TERMINAL</span> e{" "}
            <span className="font-semibold">DEPARTURE TIME</span> — Haneda tem três terminais, e o
            mais importante é confirmar o terminal certo.
          </p>
          <p className="text-sm leading-6 text-[#000000]/85">
            O embarque é no próprio T-CAT Main Building, 1F — basta seguir as placas{" "}
            <span className="font-semibold">HANEDA AIRPORT / LIMOUSINE BUS</span>, sem precisar sair
            procurando um ponto na rua. Chegue alguns minutos antes do horário do bilhete, apresente-o
            ao funcionário e entregue as malas grandes — elas vão no compartimento inferior do ônibus
            e você recebe uma etiqueta/comprovante de bagagem. Mantenha com você, dentro do ônibus,
            documentos, passaporte, dinheiro, medicamentos e outros objetos de valor.
          </p>
          <p className="text-sm leading-6 text-[#000000]/85">
            Ao chegar em Haneda, retire as malas do compartimento, tenha o comprovante em mãos e siga
            para <span className="font-semibold">DEPARTURES / 出発</span> — depois, procure o balcão de
            check-in da sua companhia aérea nos painéis do terminal.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <ContentCard variant="warning" icon={IconWarning} eyebrow="Atenção" size="sm">
              <p>
                Confirme sempre qual terminal consta na sua passagem aérea antes de comprar o
                bilhete — Haneda tem três terminais.
              </p>
            </ContentCard>
            <ContentCard variant="warning" icon={IconWarning} eyebrow="Atenção" size="sm">
              <p>
                Os ≈25 minutos entre T-CAT e Haneda são uma estimativa — por ser transporte
                rodoviário, trânsito pode aumentar o tempo. Mantenha uma margem confortável para um
                voo internacional.
              </p>
            </ContentCard>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white/70 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3E5FA8]/70">
            Tempo e Custo Total
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#000000]">
            ≈45–60 min (incluindo a troca e uma margem de espera pelo ônibus) · ¥3.500–6.000 para 2
            pessoas
          </p>
          <p className="mt-1 text-xs leading-5 text-[#000000]/60">
            O limite superior considera uma margem conservadora para o táxi até o T-CAT.
          </p>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/80">
          Por que recomendamos esta opção?
        </p>
        <p className="mt-2 text-xs leading-5 text-[#000000]/75">
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
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#000000]/55">
          Mais simples e confortável
        </p>
        <p className="mt-3 text-sm leading-6 text-[#000000]/85">
          Peça na recepção um táxi ou veículo maior diretamente para o Haneda Airport Terminal 3
          (羽田空港 第3ターミナル). Informe antecipadamente que você possui 3 malas grandes de
          aproximadamente 20 kg, pois um táxi convencional pode não ter espaço suficiente.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Tempo
            </p>
            <p className="text-sm font-semibold text-[#000000]">≈25–40 min</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Custo
            </p>
            <p className="text-sm font-semibold text-[#000000]">≈¥8.000–15.000/veículo</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Trocas
            </p>
            <p className="text-sm font-semibold text-[#000000]">Nenhuma</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E5FA8]/70">
              Caminhada
            </p>
            <p className="text-sm font-semibold text-[#000000]">Praticamente zero</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#000000]/70">
          O valor máximo considera uma margem conservadora para trânsito, pedágios, horário e a
          necessidade de um veículo adequado à quantidade de bagagem.
        </p>
        <p className="mt-3 text-xs leading-5 text-[#000000]/75">
          <span className="font-semibold text-[#000000]/85">Quando escolher:</span> é a melhor
          alternativa caso você queira eliminar qualquer preocupação com conexões ou horários —
          você sai da porta do hotel e desembarca diretamente na área de embarque do Terminal 3.
        </p>
      </div>

      {/* Opção 3 — Trem via Takaracho */}
      <div className="rounded-xl border border-[#E3E6EA] bg-white/60 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#000000]/70">
          <IconMetro className="h-6 w-6" />
          Opção 3 — Trem via Takaracho
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#000000]/55">
          Mais econômica · última opção com 3 malas grandes
        </p>
        <p className="mt-3 text-sm leading-6 text-[#000000]/85">
          A estação Takaracho (宝町) fica a aproximadamente 3 minutos a pé do hotel. Alguns
          serviços da Toei Asakusa Line seguem diretamente pela Keikyu Airport Line até Haneda.
        </p>

        <div className="mt-4 rounded-lg bg-[#F6F8FA] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#000000]/60">
            Etapa 1 · Hotel → Takaracho
          </p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/80">
            Caminhada de aproximadamente 3 minutos, sem custo. Você deverá transportar
            pessoalmente as 3 malas — dentro da estação, utilize os elevadores sempre que possível
            para chegar à plataforma.
          </p>
        </div>
        <div className="mt-3 rounded-lg bg-[#F6F8FA] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#000000]/60">
            Etapa 2 · Takaracho → Haneda T3
          </p>
          <p className="mt-2 text-sm leading-6 text-[#000000]/80">
            Antes de embarcar, confirme no painel se o trem segue para 羽田空港 — Haneda Airport:
            nem todos os trens que passam por Takaracho seguem até o aeroporto. Tempo no trem de
            aproximadamente 30–40 minutos, ¥500–750 por pessoa (até ¥1.500 para 2 pessoas) — você
            permanece responsável pelas malas durante todo o trajeto.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-[#F6F8FA] p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/55">
            Tempo e Custo Total
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#000000]">
            ≈40–55 min · até ¥1.500 para 2 pessoas
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#000000]/70">
          Apesar de ser a alternativa mais econômica, não recomendamos esta opção neste caso: com
          três malas grandes, será necessário movimentar aproximadamente 60 kg de bagagem pela
          calçada, entrada da estação, catracas, elevadores, plataforma e interior do trem.
        </p>
      </div>

      {/* Comparativo */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/55">
          Comparativo
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#E3E6EA]">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#F1F0EC] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#000000]/60">
                <th className="px-4 py-3">Opção</th>
                <th className="px-4 py-3">Tempo Total</th>
                <th className="px-4 py-3">Custo (2 pessoas)</th>
                <th className="px-4 py-3">Bagagem</th>
                <th className="px-4 py-3">Recomendação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#E3E6EA] bg-[#EDF3FC]/40">
                <td className="px-4 py-3 font-semibold text-[#000000]">Táxi + Limousine Bus</td>
                <td className="px-4 py-3 text-[#000000]/80">45–60 min</td>
                <td className="px-4 py-3 text-[#000000]/80">¥3.500–6.000</td>
                <td className="px-4 py-3 text-[#000000]/80">Fácil</td>
                <td className="px-4 py-3 font-semibold text-[#3E5FA8]">Recomendada</td>
              </tr>
              <tr className="border-t border-[#E3E6EA]">
                <td className="px-4 py-3 font-semibold text-[#000000]">Táxi Direto</td>
                <td className="px-4 py-3 text-[#000000]/80">25–40 min</td>
                <td className="px-4 py-3 text-[#000000]/80">¥8.000–15.000</td>
                <td className="px-4 py-3 text-[#000000]/80">Muito fácil</td>
                <td className="px-4 py-3 text-[#000000]/70">Mais confortável</td>
              </tr>
              <tr className="border-t border-[#E3E6EA]">
                <td className="px-4 py-3 font-semibold text-[#000000]">Trem</td>
                <td className="px-4 py-3 text-[#000000]/80">40–55 min</td>
                <td className="px-4 py-3 text-[#000000]/80">até ¥1.500</td>
                <td className="px-4 py-3 text-[#000000]/80">Difícil</td>
                <td className="px-4 py-3 text-[#000000]/70">Mais econômica</td>
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
// Passagem Aérea — DEMONSTRAÇÃO (Wilson, 04/nov/2026: "em vez de emirates,
// use um voo da Lufthansa genérico"). Voos e horários ilustrativos, via
// Frankfurt, chegando e saindo por Haneda — não é a reserva de nenhum cliente.
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

const PASSAGEM_IDA: PassagemSegmento[] = [
  {
    numeroSegmento: "1 de 4",
    voo: "LH 507",
    classe: "Economy",
    origem: { iata: "GRU", cidade: "São Paulo", terminal: "3" },
    destino: { iata: "FRA", cidade: "Frankfurt", terminal: "1" },
    partida: { data: "02 Mai 2027", hora: "18:10" },
    chegada: { data: "03 Mai 2027", hora: "10:40" },
    bagagem: "1 peça",
  },
  {
    numeroSegmento: "2 de 4",
    voo: "LH 716",
    classe: "Economy",
    origem: { iata: "FRA", cidade: "Frankfurt", terminal: "1" },
    destino: { iata: "HND", cidade: "Tóquio", terminal: "3" },
    partida: { data: "03 Mai 2027", hora: "17:45" },
    chegada: { data: "04 Mai 2027", hora: "13:30" },
    bagagem: "1 peça",
  },
];

const PASSAGEM_VOLTA: PassagemSegmento[] = [
  {
    numeroSegmento: "3 de 4",
    voo: "LH 717",
    classe: "Economy",
    origem: { iata: "HND", cidade: "Tóquio", terminal: "3" },
    destino: { iata: "FRA", cidade: "Frankfurt", terminal: "1" },
    partida: { data: "12 Mai 2027", hora: "08:00" },
    chegada: { data: "12 Mai 2027", hora: "14:55" },
    bagagem: "1 peça",
  },
  {
    numeroSegmento: "4 de 4",
    voo: "LH 506",
    classe: "Economy",
    origem: { iata: "FRA", cidade: "Frankfurt", terminal: "1" },
    destino: { iata: "GRU", cidade: "São Paulo", terminal: "3" },
    partida: { data: "12 Mai 2027", hora: "22:15" },
    chegada: { data: "13 Mai 2027", hora: "05:10" },
    bagagem: "1 peça",
  },
];

const PASSAGEM_DIRECOES: {
  label: "IDA" | "VOLTA";
  periodo: string;
  segmentos: PassagemSegmento[];
  notaFinal: string;
}[] = [
  {
    label: "IDA",
    periodo: "02–04 Mai 2027",
    segmentos: PASSAGEM_IDA,
    notaFinal: "Chegada em Tóquio pelo Aeroporto de Haneda (HND), Terminal 3 · voos de exemplo",
  },
  {
    label: "VOLTA",
    periodo: "12–13 Mai 2027",
    segmentos: PASSAGEM_VOLTA,
    notaFinal: "Saída de Tóquio pelo Aeroporto de Haneda (HND), Terminal 3 · voos de exemplo",
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
        <div key={direcao.label} className="rounded-xl border border-[#E3E6EA] bg-[#FFFFFF] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#000000]/65">
            {direcao.label === "IDA" ? "Ida" : "Volta"} · {direcao.periodo}
          </p>
          <div className="space-y-1.5 text-sm text-[#000000]/90">
            {direcao.segmentos.map((seg) => (
              <p key={seg.numeroSegmento}>
                <span className="font-semibold text-[#000000]">{seg.voo.replace(" ", "")}</span>
                {" · "}
                {seg.origem.iata} → {seg.destino.iata} · {seg.partida.hora} → {seg.chegada.hora}
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#000000]/65">{direcao.notaFinal}</p>
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
          src="/images/lufthansa-logo.png"
          alt="Lufthansa"
          className="h-16 w-16 object-contain sm:h-20 sm:w-20"
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#000000]/65">
            Companhia Aérea
          </p>
          <p className="text-sm font-semibold text-[#000000]">Lufthansa</p>
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
    <div className="rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF] p-6 sm:p-7">
      {/* Mesmo template de card de estação do /ajisairoteiros: logo da
          companhia operadora, nome da estação e nome em japonês — repetido
          pra origem e destino, ligados por uma seta. Fotos de estação em si
          (fachada/entrada) não entram aqui — ficam só no guia do hotel. */}
      <p
        className={`flex items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#000000]/65 ${
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
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#E3E6EA] shadow-sm">
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
          <p className="text-sm font-semibold text-[#000000]">
            {deslocamento.estacaoOrigem.nome}
          </p>
          {deslocamento.estacaoOrigem.nomeJapones && (
            <p className="text-base text-[#000000]/55">
              {deslocamento.estacaoOrigem.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoOrigem.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#000000]/65">
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
                    <p className="text-xs font-semibold text-[#000000]">
                      {estacao.nome}
                    </p>
                    {estacao.nomeJapones && (
                      <p className="text-[11px] text-[#000000]/60">
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
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <TrajetoArrowHead
                  orientation="vertical"
                  color={deslocamento.linha.cor || "#B96432"}
                  className="h-full w-full"
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
              className="group relative mb-4 block h-32 w-full max-w-[260px] overflow-hidden rounded-xl border border-[#E3E6EA] bg-white shadow-sm"
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
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#E3E6EA] shadow-sm">
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
          <p className="text-sm font-semibold text-[#000000]">
            {deslocamento.estacaoDestino.nome}
          </p>
          {deslocamento.estacaoDestino.nomeJapones && (
            <p className="text-base text-[#000000]/55">
              {deslocamento.estacaoDestino.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoDestino.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#000000]/65">
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
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#E3E6EA] shadow-sm">
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
          <p className="text-sm font-semibold text-[#000000]">
            {deslocamento.estacaoOrigem.nome}
          </p>
          {deslocamento.estacaoOrigem.nomeJapones && (
            <p className="text-base text-[#000000]/55">
              {deslocamento.estacaoOrigem.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoOrigem.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#000000]/65">
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
        <div className="col-start-2 row-start-1 flex min-w-[32px] flex-1 flex-col justify-start pt-6 sm:min-w-[64px]">
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
                      className="absolute bottom-2 origin-bottom-left -rotate-45 whitespace-nowrap text-[11px] font-semibold leading-tight text-[#000000] sm:text-xs"
                      style={{ left: `${pct}%` }}
                    >
                      {estacao.nome}
                    </span>
                  );
                })}
              </div>
            )}
          <div className="relative h-7 w-full">
            {/* Seta de trajeto — mesmo componente/padrão geométrico usado em
                todo o site (haste + ponta como uma única forma vetorial
                sólida), não uma linha fina com triângulo colado. */}
            <TrajetoArrow
              orientation="horizontal"
              color={deslocamento.linha.cor || "#B96432"}
              className="absolute inset-0 h-full w-full"
            />
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
                      className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium leading-none text-[#000000]/70 sm:top-5 sm:text-xs"
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
                className="group relative mt-3 block h-full w-full flex-1 overflow-hidden rounded-xl border border-[#E3E6EA] bg-white shadow-sm"
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
            <div className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-[#E3E6EA] shadow-sm">
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
          <p className="text-sm font-semibold text-[#000000]">
            {deslocamento.estacaoDestino.nome}
          </p>
          {deslocamento.estacaoDestino.nomeJapones && (
            <p className="text-base text-[#000000]/55">
              {deslocamento.estacaoDestino.nomeJapones}
            </p>
          )}
          {deslocamento.estacaoDestino.distancia && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#000000]/65">
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
                <p className="text-lg font-semibold text-[#000000]">
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
                  <p className="text-xs leading-5 text-[#000000]/72">{d}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {deslocamento.recomendacao && (
        <p className="mt-5 border-t border-[#E3E6EA] pt-4 text-sm leading-6 text-[#000000]/80">
          {deslocamento.recomendacao}
        </p>
      )}

      {deslocamento.gradeSaidas && (
        <div className="mt-5 border-t border-[#E3E6EA] pt-5">
          {deslocamento.gradeSaidas.destaque && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#000000]/65">
                {deslocamento.gradeSaidas.destaque.titulo}
              </p>
              <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#000000]">
                      {deslocamento.gradeSaidas.destaque.linha}
                    </p>
                    {deslocamento.gradeSaidas.destaque.subtitulo && (
                      <p className="text-xs text-[#000000]/65">
                        {deslocamento.gradeSaidas.destaque.subtitulo}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                    {deslocamento.gradeSaidas.destaque.horario}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-4">
                  {deslocamento.gradeSaidas.destaque.embarque && (
                    <div>
                      <p className="font-medium uppercase tracking-wide text-[#000000]/55">Embarque</p>
                      <p className="mt-0.5 font-semibold text-[#000000]">
                        {deslocamento.gradeSaidas.destaque.embarque}
                      </p>
                    </div>
                  )}
                  {deslocamento.gradeSaidas.destaque.desembarque && (
                    <div>
                      <p className="font-medium uppercase tracking-wide text-[#000000]/55">Desembarque</p>
                      <p className="mt-0.5 font-semibold text-[#000000]">
                        {deslocamento.gradeSaidas.destaque.desembarque}
                      </p>
                    </div>
                  )}
                  {deslocamento.gradeSaidas.destaque.tempo && (
                    <div>
                      <p className="font-medium uppercase tracking-wide text-[#000000]/55">Tempo</p>
                      <p className="mt-0.5 font-semibold text-[#000000]">
                        {deslocamento.gradeSaidas.destaque.tempo}
                      </p>
                    </div>
                  )}
                  {deslocamento.gradeSaidas.destaque.tarifa && (
                    <div>
                      <p className="font-medium uppercase tracking-wide text-[#000000]/55">Tarifa</p>
                      <p className="mt-0.5 font-semibold text-[#000000]">
                        {deslocamento.gradeSaidas.destaque.tarifa}
                      </p>
                    </div>
                  )}
                </div>
                {deslocamento.gradeSaidas.destaque.resultado && (
                  <p className="mt-3 border-t border-emerald-200 pt-3 text-xs leading-5 text-[#000000]/80">
                    {deslocamento.gradeSaidas.destaque.resultado}
                  </p>
                )}
              </div>
            </div>
          )}
          {deslocamento.gradeSaidas.titulo && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#000000]/65">
              {deslocamento.gradeSaidas.titulo}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-[#E3E6EA]">
            <table className="w-full min-w-[320px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E6EA] bg-[#F5F3EE] text-[10px] uppercase tracking-wide text-[#000000]/65">
                  {deslocamento.gradeSaidas.colunas.map((c) => (
                    <th key={c} className="px-3 py-2 font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deslocamento.gradeSaidas.linhas.map((linha, i) => (
                  <tr key={i} className={i > 0 ? "border-t border-[#E3E6EA]/70" : undefined}>
                    {linha.map((valor, j) => (
                      <td
                        key={j}
                        className={`whitespace-nowrap px-3 py-2 ${
                          j === 0 ? "font-semibold text-[#000000]" : "text-[#000000]/80"
                        }`}
                      >
                        {valor}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deslocamento.gradeSaidas.nota && (
            <p className="mt-2 text-[11px] leading-4 text-[#000000]/55">
              {deslocamento.gradeSaidas.nota}
            </p>
          )}
        </div>
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
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/55">
          {mapaAndares.titulo}
        </p>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white"
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
              className="group flex items-center gap-3 overflow-hidden rounded-xl border border-[#E3E6EA] bg-[#FFFFFF] p-3 text-left transition hover:border-[#2C6CA6]/50 hover:bg-[#EAF3FC]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F5F7] text-sm font-bold text-[#000000]/70 transition group-hover:bg-[#2C6CA6] group-hover:text-white">
                {m.andar}
              </span>
              <span className="min-w-0 text-xs font-medium text-[#000000]/80">
                Ver mapa do {m.andar}
              </span>
              <span className="ml-auto shrink-0 text-lg text-[#000000]/40 transition group-hover:text-[#2C6CA6]">
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
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#E3E6EA]"
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
        <p className="mt-2 text-xs leading-5 text-[#000000]/60">{mapa.nota}</p>
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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/55">
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
          className="group relative block w-full overflow-hidden rounded-2xl border border-[#E3E6EA]"
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
          <p className="mt-2 text-center text-xs leading-5 text-[#000000]/60">
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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/55">
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
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#E3E6EA]"
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
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF]"
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
              <p className="text-base font-semibold text-[#000000]">
                {ponto.titulo}
              </p>
              {ponto.nomeJapones && (
                <p className="mt-0.5 text-[21px] font-normal text-[#000000]/50">
                  {ponto.nomeJapones}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-[#000000]/75">
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
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/55">
          {galeria.titulo}
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {galeria.imagens.map((img, i) => (
          <div
            key={img.src}
            className={`flex flex-col overflow-hidden rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF] ${
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
                <p className="text-sm font-semibold leading-6 text-[#000000]">
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
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/65">
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
          <div className="mt-4">
            {(() => {
              let numero = 0;
              const numerados = period.percursoEssencial!.passos.map((passo) => {
                if (passo.foto) numero += 1;
                return { ...passo, __numero: numero };
              });
              return (
                <StepTimelineCarousel
                  passos={numerados}
                  variant="light"
                  fadeFromColor="#F8FAF9"
                  renderMarker={(passo) =>
                    passo.foto ? (
                      <div className="relative h-16 w-16 shrink-0">
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
                          {passo.__numero}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-[#2C6CA6]/35 text-[#2C6CA6]/50">
                        <IconWalk className="h-7 w-7" />
                      </div>
                    )
                  }
                />
              );
            })()}
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
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#000000]/68">
                {period.regiao.nome}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[#000000]/78">
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
                    <div className="mb-5 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-5 sm:p-7">
                      <div className="mb-5 flex items-center gap-3 sm:gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                          <IconInfoCircle className="h-8 w-8 text-[#8A7049] sm:h-12 sm:w-12" />
                        </span>
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#000000]/70 sm:text-lg sm:tracking-[0.2em]">
                          Informações Iniciais
                        </p>
                      </div>
                      <div
                        className={`grid grid-cols-1 gap-x-6 gap-y-4 ${gridColsClass}`}
                      >
                        {outros.map((item) => (
                          <div key={item.label} className="text-center">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#000000]/55">
                              {item.label}
                            </p>
                            <p className="text-sm font-semibold text-[#000000]">
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

            <p className="mb-5 text-xs text-[#000000]/65">
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
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/45">
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
    <div className="mb-6 rounded-2xl border border-[#E3E6EA] bg-[#FFFFFF] p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center">
          <IconCalendar className="h-12 w-12 text-[#000000]" />
        </span>
        <p className="min-w-0 flex-1 text-base font-bold uppercase tracking-[0.2em] text-[#000000]/70 sm:text-lg">
          {grade.titulo ?? "Grade de Horários"}
        </p>
      </div>
      <div>
        {grade.itens.map((item, i) => (
          <div
            key={item.evento}
            className={`flex items-baseline gap-5 py-3 ${
              i !== grade.itens.length - 1 ? "border-b border-[#E3E6EA]/55" : ""
            } ${item.recomendado ? "border-l border-[#B96432] pl-4" : ""}`}
          >
            <span
              className={`w-12 shrink-0 text-sm font-semibold tabular-nums tracking-tight ${
                item.recomendado ? "text-[#B96432]" : "text-[#000000]/80"
              }`}
            >
              {item.horario}
            </span>
            <span
              className={`min-w-0 flex-1 text-sm leading-6 ${
                item.destaque ? "font-semibold" : "font-normal"
              } ${item.recomendado ? "text-[#B96432]" : "text-[#000000]/75"}`}
            >
              {item.evento}
              {item.tag && (
                <span className="ml-2.5 inline-block align-middle text-[9px] font-semibold uppercase tracking-[0.2em] text-[#000000]/40">
                  {item.tag}
                </span>
              )}
            </span>
            {item.permanencia && (
              <span className="shrink-0 text-right text-xs font-medium tabular-nums text-[#000000]/45">
                {item.permanencia}
              </span>
            )}
          </div>
        ))}
      </div>
      {grade.nota && (
        <p className="mt-5 border-t border-[#E3E6EA] pt-4 text-xs leading-5 text-[#000000]/55">
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
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E3E6EA] bg-[#F6F8FA] text-[#000000]/55">
          <IconArrowDown className="h-4 w-4" />
        </span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-[#B96432]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/65">
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
            <p className="mb-6 text-sm leading-6 text-[#000000]/78">
              {subAtracao.descricao}
            </p>
          )}
          <VisaoAnotadaBlock
            visaoAnotada={subAtracao.visaoAnotada}
            displayClassName={displayClassName}
          />
        </>
      ) : subAtracao.compacta ? (
        <div className="mx-auto flex max-w-lg items-center gap-4 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-3">
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
              className={`${displayClassName} text-base font-medium leading-snug text-[#000000] md:text-lg`}
            >
              {subAtracao.titulo}
            </h3>
            {subAtracao.descricao && (
              <p className="mt-1 text-xs leading-5 text-[#000000]/78">
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
            <p className="mb-5 text-sm leading-6 text-[#000000]/78">
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
          <p className="mb-5 text-xs text-[#000000]/65">
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

function IconWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.001 2C6.477 2 2 6.477 2 12c0 1.75.457 3.443 1.32 4.943L2 22l5.198-1.362A9.955 9.955 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.05a8.033 8.033 0 0 1-4.42-1.318l-.317-.19-3.13.821.836-3.05-.207-.31A8.03 8.03 0 0 1 3.95 12c0-4.44 3.611-8.05 8.05-8.05 4.44 0 8.05 3.61 8.05 8.05 0 4.44-3.61 8.05-8.05 8.05z" />
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}

// Demonstração (Wilson, 04/nov/2026): só Ônibus e Trem Bala em
// "Informações Detalhadas".
const INFO_CARDS: { label: string; Icon: (p: { className?: string }) => ReactElement; view: "onibus" | "shinkansen"; subLabel?: string }[] = [
  { label: "Ônibus", Icon: IconBus, view: "onibus" },
  { label: "Trem Bala (Shinkansen)", Icon: IconShinkansen, view: "shinkansen" },
];

// Demonstração: sem número de apólice, sem voucher e sem contato do sinistro
// (dados do cliente real). Os cards ficam só para mostrar o recurso.
const SERVICOS_ADICIONAIS_CARDS: {
  label: string;
  Icon: (p: { className?: string }) => ReactElement;
  apoliceNumero?: string;
  documentoImagens?: string[];
  whatsapp?: string;
}[] = [
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
    <div className="overflow-hidden rounded-2xl border border-[#E3E6EA]">
      {/* 1. Informações do hotel — fundo com o mural/foto + etiqueta com o nome */}
      {hotel.fotoHero && (
        <div className="relative flex min-h-[150px] items-end overflow-hidden border-b border-[#E3E6EA] p-5 sm:min-h-[190px] sm:p-8">
          <Image
            src={hotel.fotoHero}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 800px"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#F6F8FA]/45" />
          <span className="relative rounded-lg bg-[#0B2530] px-5 py-3 text-lg font-bold text-white sm:px-6 sm:py-3.5 sm:text-xl">
            {hotel.nome}
          </span>
        </div>
      )}

      {/* Identificação — endereço, telefone, site e horários */}
      <div className="border-b border-[#E3E6EA] bg-[#F6F8FA] px-5 py-6 text-center sm:px-8">
        {!hotel.fotoHero && (
          <p className="text-base font-semibold text-[#000000] sm:text-lg">
            {hotel.nome}
          </p>
        )}
        <p className={`text-sm text-[#000000]/80 sm:text-base ${!hotel.fotoHero ? "mt-1" : ""}`}>
          {hotel.endereco}
        </p>
        {hotel.enderecoJapones && (
          <p className="mt-1 text-sm text-[#000000]/65 sm:text-base">{hotel.enderecoJapones}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[#000000]/80">
          {hotel.telefone && <span>{hotel.telefone}</span>}
          {hotel.telefone && hotel.site && <span className="text-[#000000]/35">·</span>}
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
      <div className="border-t border-[#E3E6EA] bg-[#FFFFFF] p-5 sm:p-8">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/68">
          Estrutura &amp; Serviços
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {hotel.estrutura.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#000000]/[0.08] text-[#000000]">
                <item.Icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-sm leading-5 text-[#000000]/92">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transporte — sinalização oficial das estações próximas, só quando
          existe mais de uma opção de linha e vale destacar a diferença. */}
      {hotel.transporte && (
        <div className="border-t border-[#E3E6EA] bg-[#FFFFFF] p-5 sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/68">
            Transporte
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {hotel.transporte.estacoes.map((estacao) => (
              <div
                key={estacao.nome}
                className="overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white"
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
                <p className="border-t border-[#E3E6EA] px-3 py-2.5 text-center text-xs font-semibold text-[#000000]/85">
                  {estacao.nome}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#000000]/80">
            {hotel.transporte.nota}
          </p>
        </div>
      )}

      {/* 3. Localização & Arredores — foto da fachada, lista e rotas, no
          mesmo bloco de largura total */}
      <div className="border-t border-[#E3E6EA] bg-[#FFFFFF] p-5 sm:p-8">
        {hotel.mapa && (
          <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E3E6EA] sm:aspect-[2/1]">
            <Image
              src={hotel.mapa.imagem}
              alt={hotel.mapa.imagemAlt}
              fill
              sizes="(max-width: 640px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/68">
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#000000]/65">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold leading-5 text-[#000000]">
                    {item.nome}
                  </p>
                  {item.detalhe && (
                    <p className="mt-0.5 text-xs leading-5 text-[#000000]/75">
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
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#E3E6EA] hover:bg-[#F6F8FA]"
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
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/58">
                  Rotas a pé (prints do Google Maps)
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {hotel.mapa.rotas.map((rota) => (
                    <button
                      key={rota.label}
                      type="button"
                      onClick={() => openRotas([rota])}
                      className="group block overflow-hidden rounded-xl border border-[#E3E6EA] bg-[#F8FAF9] text-left"
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
                      <p className="px-2.5 py-2 text-[10px] font-semibold leading-tight text-[#000000]/85">
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
        <div className="border-t border-[#E3E6EA] bg-[#F6F8FA] p-5 sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#000000]/68">
            Informações Úteis
          </p>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {hotel.informacoesUteis.map((item) => (
              <div key={item.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B96432]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#000000]/85">{item.texto}</p>
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
  const [zoomDocumentoSeguro, setZoomDocumentoSeguro] = useState(false);

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
        {/* Demonstração no padrão atual do site: card branco, sombra suave. */}
        <div
          className="overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white sm:rounded-[2rem]"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 50px -30px rgba(10,37,64,0.35)" }}
        >
        <div className="border-b border-[#E3E6EA] px-6 py-7 text-center sm:px-10">
          <p className="mx-auto mb-5 inline-block rounded-full bg-[#0A2540] px-5 py-2 text-xs uppercase tracking-[0.3em] text-white">
            Demonstração · Roteiro de 7 dias
          </p>
          <h2 className={`${displayClassName} text-2xl font-medium text-[#000000] md:text-3xl`}>
            Painel Interativo
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#000000]/72">
            Amostra com {DIAS_LIBERADOS_TEXTO} abertos. Os demais dias, hotéis e guias mostram como o painel funciona.
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
                className={`group flex flex-col items-center gap-2.5 ${d.bloqueado ? "opacity-45" : ""}`}
                aria-label={d.bloqueado ? `${d.city} ${d.date ?? ""} — disponível no roteiro completo` : undefined}
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
                          background: "#0A2540",
                          boxShadow:
                            "inset 0 0 8px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.15)",
                        }
                      : undefined
                  }
                >
                  {d.badge ? (
                    d.badge
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center rounded-full text-lg font-semibold text-white"
                      style={{ background: corCidade(d.city) }}
                    >
                      {d.day}
                    </span>
                  )}
                </span>
                <span
                  className={`flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-[#000000]" : "text-[#000000]/65"
                  }`}
                >
                  {d.bloqueado && <IconLock className="h-2.5 w-2.5 shrink-0" />}
                  {d.city}
                </span>
                {d.date && (
                  <span
                    className={`flex flex-col items-center leading-tight tracking-[0.1em] ${
                      active ? "text-[#000000]/72" : "text-[#000000]/55"
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

        <p className="px-6 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/60 sm:px-10">
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
                      ? "border-[#000000] bg-[#E7F4E9] text-[#000000] hover:border-transparent hover:bg-[#000000] hover:text-white"
                      : "border-[#E3E6EA] bg-[#E7F4E9] text-[#000000]/72 hover:border-transparent hover:bg-[#000000] hover:text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    active ? "text-[#000000]" : "text-[#000000]/65"
                  }`}
                >
                  {HOTEIS[index].cidade}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 px-6 pt-8 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/60">
            Informações Detalhadas
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-[#E3E6EA] px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {INFO_CARDS.map(({ label, Icon, view, subLabel }) => {
            const cardClassName =
              "group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#DCE7F2] bg-[#F1F6FB] px-3 py-4 text-center text-xs leading-5 text-[#000000]/75 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#2C6CA6]/35 hover:bg-[#E9F1FA] hover:text-[#000000] hover:shadow-[0_10px_30px_-15px_rgba(23,59,69,0.35)]";
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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/60">
            Serviços Adicionais Contratados
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-[#E3E6EA] px-6 pb-6 pt-3 sm:grid-cols-4 sm:px-10">
          {SERVICOS_ADICIONAIS_CARDS.map(({ label, Icon, apoliceNumero, documentoImagens, whatsapp }) => {
            const iconClassName =
              label === "Emergência Médica / Ativação de Sinistro" ? "h-[4.5rem] w-[4.5rem]" : "h-20 w-20";
            const cardContent = (
              <>
                <Icon className={iconClassName} />
                <span>
                  {label}
                  {apoliceNumero && (
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#C0392B]">
                      Apólice: {apoliceNumero}
                    </span>
                  )}
                </span>
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 flex items-center gap-1.5 rounded-full bg-[#25D366]/12 px-2.5 py-1 text-[10px] font-semibold text-[#128C4A] transition hover:bg-[#25D366]/20"
                  >
                    <IconWhatsapp className="h-3.5 w-3.5 shrink-0" />
                    +{whatsapp.replace(/^1/, "1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")}
                  </a>
                )}
              </>
            );
            if (documentoImagens) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setZoomDocumentoSeguro(true)}
                  className="group flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-[#F0DFA8] bg-[#FDF8E9] px-3 py-4 text-center text-xs leading-5 text-[#000000]/75 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#C0392B]/35 hover:shadow-[0_10px_30px_-15px_rgba(23,59,69,0.35)]"
                >
                  {cardContent}
                </button>
              );
            }
            return (
              <div
                key={label}
                className="flex min-h-[112px] flex-col items-center justify-center gap-2.5 rounded-xl border border-[#F0DFA8] bg-[#FDF8E9] px-3 py-4 text-center text-xs leading-5 text-[#000000]/75"
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {zoomDocumentoSeguro && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setZoomDocumentoSeguro(false)}
          >
            <button
              type="button"
              onClick={() => setZoomDocumentoSeguro(false)}
              className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
              aria-label="Fechar"
            >
              <IconX className="h-5 w-5" />
            </button>
            <div
              className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              {SERVICOS_ADICIONAIS_CARDS.find((c) => c.documentoImagens)?.documentoImagens?.map(
                (src, i) => (
                  <img
                    loading="lazy"
                    key={src}
                    src={src}
                    alt={`Apólice do Seguro Viagem — página ${i + 1}`}
                    className="w-full rounded-2xl bg-white object-contain shadow-lg"
                  />
                ),
              )}
              <p className="pb-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/85">
                Apólice do Seguro Viagem
              </p>
            </div>
          </div>
        )}

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
          ) : current.bloqueado ? (
            <div className="rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] px-6 py-10 text-center sm:px-10">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <IconLock className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/65">
                {current.travel ? current.city : `Dia ${current.day} · ${current.city}`} · {current.date}
              </p>
              <p className={`${displayClassName} mx-auto mt-3 max-w-md text-xl text-[#000000]`}>
                Disponível no roteiro completo
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#000000]/72">
                Esta é uma demonstração com {DIAS_LIBERADOS_TEXTO} abertos. No seu roteiro, todos os dias vêm detalhados assim: horários,
                deslocamentos, restaurantes e pontos de interesse.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {DAYS.map((d, index) =>
                  d.bloqueado ? null : (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => {
                        setActiveDay(index);
                        scrollToContent();
                      }}
                      className="rounded-full border border-black/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#000000] transition hover:bg-black hover:text-white"
                    >
                      Ver Dia {d.day} · {d.city}
                    </button>
                  ),
                )}
                <a
                  href="/produtos/roteiro-personalizado"
                  className="rounded-full bg-black px-5 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
                >
                  Quero meu roteiro
                </a>
              </div>
            </div>
          ) : current.travel ? (
            <>
              <div className="mb-8 rounded-2xl border border-[#E3E6EA] bg-[#F6F8FA] p-6 text-center sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#000000]/65">
                  {current.city} · {current.date}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#000000]/75">
                  {current.travelNote}
                </p>
              </div>
              {current.badge === "HND-FRA" && <TransporteHanedaTokyoBlock />}
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
        className="fixed right-3 z-50 flex flex-col items-center gap-1 rounded-2xl bg-[#0A2540] px-2.5 py-2.5 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition hover:-translate-x-0.5 sm:right-5"
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: corCidade("Tokyo") }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M5 7h14M5 12h14M5 17h14" />
          </svg>
        </span>
        <span className="text-[8px] font-bold uppercase leading-tight tracking-[0.1em]">
          Menu
        </span>
      </button>
    </>
  );
}
