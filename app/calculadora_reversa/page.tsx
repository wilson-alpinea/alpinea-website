"use client";

import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { useMemo, useState } from "react";
import { gerarEBaixarPdf } from "./PacotePdf";
import { gerarEBaixarTexto } from "./PacoteTexto";
import { useCambioIene, CIDADES_CAMBIO_IENE, type CidadeCambioIeneSlug } from "../hooks/useCambioIene";
import { COTACAO_FALLBACK_BRL_POR_JPY } from "../lib/cambioIene";
import {
  NumberStepper,
  LabelNumerado,
  DESTINOS,
  CIDADE_MULTIPLICADOR_HOTEL,
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  FATOR_QUARTO,
  DIARIA_HOTEL,
  CLASSES_AEREO,
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_PREMIUM_ECONOMY_USD,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
  DIARIA_TRANSPORTE,
  DIARIA_GUIA_USD,
  GUIA_TAMANHO_GRUPO,
  DIARIA_SEGURO_VIAGEM,
  JR_PASS_DIAS_OPCOES,
  JR_PASS_PRECO_USD,
  JR_PASS_PRECO_USD_GREEN,
  DIARIA_ESIM_USD_PAX,
  DIARIA_POCKET_WIFI_USD,
  WIFI_TAMANHO_GRUPO,
  PRECO_CAMBIO_BRASIL,
  DIARIA_MOTORISTA_PRIVADO_USD,
  MOTORISTA_TAMANHO_GRUPO,
  PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX,
  PRECO_INGRESSO_DISNEYSEA_USD_PAX,
  PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX,
  PRECO_INGRESSO_USJ_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_4_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_5_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_7_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_8_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX,
  PRECO_MALA_INTERMUNICIPAL_USD,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  RESTAURANTES_HIGHEND_QTD,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
  comMargemEImposto,
} from "../components/CustomPackageCard";
import { useCambioUSD, formatBRL, formatUSD, brlParaUSDLabel } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

type IngressoKey = "disneyland" | "disneysea" | "usj" | "teamlabTokyo" | "teamlabKyoto";

// Catálogo de ingressos/experiências oferecidos na Calculadora Reversa —
// cada um vira um candidato do preenchimento por orçamento quando marcado
// pelo vendedor (ver ingressosSelecionados). Preços em CustomPackageCard.tsx.
const CATALOGO_INGRESSOS: { key: IngressoKey; nome: string; precoUSD: number; icone?: string }[] = [
  { key: "disneyland", nome: "Disneyland Tokyo", precoUSD: PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX, icone: "/images/ingressos/disneyland-logo.png" },
  { key: "disneysea", nome: "DisneySea Tokyo", precoUSD: PRECO_INGRESSO_DISNEYSEA_USD_PAX, icone: "/images/ingressos/disneysea-logo.png" },
  { key: "usj", nome: "Universal Studios Japan", precoUSD: PRECO_INGRESSO_USJ_USD_PAX, icone: "/images/ingressos/usj-logo.png" },
  {
    key: "teamlabTokyo",
    nome: "teamLab Tokyo",
    precoUSD: PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX,
    icone: "/images/ingressos/teamlab-logo.png",
  },
  {
    key: "teamlabKyoto",
    nome: "teamLab Kyoto",
    precoUSD: PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX,
    icone: "/images/ingressos/teamlab-logo.png",
  },
];

type ServicoAdicionalKey = "malasIntermunicipal";

// Catálogo de serviços adicionais/avulsos que ainda não tinham item
// próprio na Calculadora Reversa — pedido do Wilson, 10/set/2026, no
// mesmo espírito visual/funcional do catálogo de Ingressos acima
// (card com ícone + nome + preço, marcação vira candidato do
// preenchimento por orçamento). Auditado contra a lista de "Serviços
// avulsos" (SERVICOS_AVULSOS, em app/lib/servicosAvulsos.ts) — todos os
// outros itens de lá (JR Pass, Seguro Viagem, Câmbio no Brasil, eSIM,
// Reserva de Restaurantes) já têm seção própria na calculadora; só o
// transporte de malas era novo. Preço "porTrecho": true significa que
// multiplica pelo número de trechos entre cidades do roteiro
// (destinosSelecionados.length - 1, mínimo 1) além de pessoas.
const CATALOGO_SERVICOS_ADICIONAIS: {
  key: ServicoAdicionalKey;
  nome: string;
  descricao: string;
  precoUSD: number;
  porTrecho?: boolean;
}[] = [
  {
    key: "malasIntermunicipal",
    nome: "Transporte de Malas Inter-Municipal",
    descricao:
      "Takkyubin — a mala é despachada no hotel de origem e chega no hotel da próxima cidade no dia seguinte, sem o cliente precisar carregá-la no Shinkansen. Por mala, por trecho entre cidades.",
    precoUSD: PRECO_MALA_INTERMUNICIPAL_USD,
    porTrecho: true,
  },
];

// Catálogo de referência dos combos reais vendidos para o USJ Express Pass.
// A USJ e revendedores (Klook, KKday etc.) vendem dezenas de combinações
// diferentes de atrações a cada tier — o valor cobrado no calculadora é uma
// média/estimativa por tier (PRECO_EXPRESS_PASS_USJ_*_USD_PAX), então este
// catálogo serve só para o vendedor entender o que costuma vir incluso e
// dar transparência sobre o que varia. Preços de referência em BRL vêm de
// revenda (Klook, capturado 04/set/2026) — cobram markup sobre o oficial da
// USJ, por isso divergem do custo interno usado no cálculo. Fonte: print
// enviado pelo Wilson (listagem Klook) + usjexpresspass.com/guide (04/set/2026).
const USJ_EXPRESS_PASS_DETALHES: {
  tier: "4" | "5" | "7" | "8" | "premium";
  atracoesTipicas: string[];
  nintendoWorld: string;
  wizardingWorld: string;
  faixaPrecoReferenciaBRL: string;
  observacao: string;
}[] = [
  {
    tier: "4",
    atracoesTipicas: [
      "Combos com foco em Mario/Donkey Kong: Mine-Cart Madness (Mario Kart: Bowser's Challenge) + Donkey Kong Country: Mine-Cart Madness",
      "Combos com Flying Dinosaur: Jurassic Park The Flying Dinosaur + JAWS/Backdrop/Theater",
      "Combos sazonais: Halloween Horror Nights (Chainsaw Man, Resident Evil Requiem)",
    ],
    nintendoWorld:
      "Só nos combos que citam Mine-Cart/Mario/Koopa's Challenge — não vem em todo Express 4 (ex.: combo “Adventure for all” não inclui)",
    wizardingWorld: "Normalmente não incluso — checar o combo específico antes de vender",
    faixaPrecoReferenciaBRL: "R$ 385 – 620/pessoa (revenda) — varia por combo, data e temporada",
    observacao:
      "É o tier mais fragmentado: cada operadora vende dezenas de combinações diferentes de 4 atrações, cada uma com nome e preço próprios.",
  },
  {
    tier: "5",
    atracoesTipicas: [
      "Combo “Adventure Special”: Mario Kart Koopa's Challenge + Yoshi's Adventure + Flying Dinosaur + Despicable Me: Minion Mayhem + Hollywood Dream – The Ride",
      "Combo “Race & Minecart Special”: Mario Kart Koopa's Challenge + Mine Cart Madness + Illumination's Villain-Con Minion Blast + Flying Dinosaur + Harry Potter and the Forbidden Journey",
      "Combo “Race & Minion Special”: Mario Kart Koopa's Challenge + Illumination's Villain-Con Minion Blast + Despicable Me: Minion Mayhem + Harry Potter and the Forbidden Journey + escolha 1 entre JAWS/Jurassic Park",
    ],
    nintendoWorld:
      "Depende do combo — “Race & Minecart Special” e “Race & Minion Special” incluem Minion Blast; nenhum dos três combos citados garante as duas atrações do Nintendo World ao mesmo tempo",
    wizardingWorld: "Incluso só nos combos “Race & Minecart Special” e “Race & Minion Special”",
    faixaPrecoReferenciaBRL: "Sem preço de revenda confirmado — preço interno é estimativa, ver aviso na calculadora",
    observacao:
      "Tier intermediário entre o 4 e o 7 — preço ainda não confirmado oficialmente (ver ⚠️ na calculadora).",
  },
  {
    tier: "7",
    atracoesTipicas: [
      "Super Nintendo World completo: Mine-Cart Madness (Mario Kart) + Yoshi's Adventure",
      "Jurassic Park The Flying Dinosaur",
      "The Wizarding World of Harry Potter (Forbidden Journey ou Flight of the Hippogriff)",
      "+ 2–3 atrações à escolha do cliente (Minion Mayhem, Space Fantasy etc.)",
    ],
    nintendoWorld: "Incluso — acesso garantido às duas atrações do Super Nintendo World",
    wizardingWorld: "Incluso — pelo menos uma atração do Wizarding World",
    faixaPrecoReferenciaBRL: "R$ 843 – 912/pessoa (revenda) — também vendido como “Express 8” quando soma 1 atração extra",
    observacao: "É o tier de referência para quem quer Nintendo World + Harry Potter garantidos sem pagar o Premium.",
  },
  {
    tier: "8",
    atracoesTipicas: [
      "Tudo do Express 7 (Super Nintendo World completo + Jurassic Park The Flying Dinosaur + Wizarding World)",
      "+ Illumination's Villain-Con Minion Blast (a atração extra que diferencia do Express 7)",
      "+ escolha 1 entre Flying Dinosaur / Despicable Me: Minion Mayhem / Hollywood Dream – The Ride",
      "+ escolha 1 entre Jurassic Park The Ride / JAWS",
    ],
    nintendoWorld: "Incluso — acesso garantido às atrações do Super Nintendo World + Minion Blast",
    wizardingWorld: "Incluso — Harry Potter and the Forbidden Journey garantido",
    faixaPrecoReferenciaBRL: "Sem preço de revenda confirmado — preço interno é estimativa, ver aviso na calculadora",
    observacao:
      "É basicamente o Express 7 + Minion Blast — mesma base do 7, preço ainda não confirmado oficialmente (ver ⚠️ na calculadora).",
  },
  {
    tier: "premium",
    atracoesTipicas: [
      "Todo o Super Nintendo World",
      "Todo o Wizarding World of Harry Potter",
      "Praticamente toda a linha principal do parque — até 13-16 atrações, sem necessidade de horário marcado",
    ],
    nintendoWorld: "Incluso — entrada garantida, sem depender da senha grátis do app",
    wizardingWorld: "Incluso",
    faixaPrecoReferenciaBRL: "R$ 1.569 – 3.235/pessoa (revenda) — Premium limitado x Premium Unlimited",
    observacao: "Existe uma versão “Unlimited” (sem limite de repetições nas atrações) bem mais cara que a Premium padrão.",
  },
];

// Tabela comparativa completa dos combos de Express Pass do USJ — dados
// vindos de prints do Klook enviados pelo Wilson (04/set/2026), cobrindo
// os principais combos vendidos hoje pra cada tier (a USJ e revendedores
// trocam esses combos por temporada, então isso é uma fotografia do que
// estava disponível na data acima — confirmar disponibilidade e nome
// exato do combo antes de vender). "Escolha 1" = o cliente escolhe uma
// atração entre as marcadas com o mesmo grupo, dentro daquele combo.
type UsjComboCelula = true | undefined | { grupo: string } | { texto: string };

type UsjTabelaComparativa = {
  titulo: string;
  colunas: string[];
  linhas: { atracao: string; valores: UsjComboCelula[] }[];
  notas: string[];
};

const USJ_TABELAS_COMPARATIVAS: UsjTabelaComparativa[] = [
  {
    titulo: "Express 7 & 8",
    colunas: [
      "Express 7 — Minecart & Selection",
      "Express 8 — Minion & Minecart Special",
      "Express 8 — Minicart & Flying Dinosaur Special",
    ],
    linhas: [
      { atracao: "Entrada com horário marcado no Super Nintendo World", valores: [true, true, true] },
      { atracao: "Mario Kart: Koopa's Challenge", valores: [true, true, true] },
      { atracao: "Yoshi's Adventure", valores: [true, true, true] },
      { atracao: "Mine Cart Madness", valores: [true, true, true] },
      { atracao: "Illumination's Villain-Con Minion Blast", valores: [undefined, true, true] },
      { atracao: "The Flying Dinosaur", valores: [{ grupo: "A" }, { grupo: "A" }, { grupo: "A" }] },
      { atracao: "Despicable Me: Minion Mayhem", valores: [{ grupo: "A" }, { grupo: "A" }, { grupo: "A" }] },
      { atracao: "Hollywood Dream – The Ride", valores: [{ grupo: "A" }, { grupo: "A" }, { grupo: "A" }] },
      { atracao: "Jurassic Park – The Ride", valores: [{ grupo: "B" }, { grupo: "B" }, { grupo: "B" }] },
      { atracao: "JAWS", valores: [{ grupo: "B" }, { grupo: "B" }, { grupo: "B" }] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [true, true, true] },
    ],
    notas: [
      "Escolha 1 (grupo A): The Flying Dinosaur, Despicable Me: Minion Mayhem ou Hollywood Dream – The Ride.",
      "Escolha 1 (grupo B): Jurassic Park – The Ride ou JAWS.",
      "Express 8 = Express 7 + Illumination's Villain-Con Minion Blast.",
    ],
  },
  {
    titulo: "Express 5",
    colunas: ["Adventure Special", "Race & Minecart Special", "Race & Minion Special"],
    linhas: [
      { atracao: "Entrada com horário marcado no Super Nintendo World", valores: [true, true, true] },
      { atracao: "Mario Kart: Koopa's Challenge", valores: [true, true, true] },
      { atracao: "Yoshi's Adventure", valores: [true, undefined, undefined] },
      { atracao: "Mine Cart Madness", valores: [undefined, true, undefined] },
      { atracao: "Illumination's Villain-Con Minion Blast", valores: [undefined, true, true] },
      { atracao: "The Flying Dinosaur", valores: [true, true, undefined] },
      { atracao: "Despicable Me: Minion Mayhem", valores: [true, undefined, true] },
      { atracao: "Hollywood Dream – The Ride", valores: [true, undefined, undefined] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [undefined, true, true] },
      { atracao: "JAWS", valores: [undefined, undefined, { grupo: "C" }] },
      { atracao: "Jurassic Park – The Ride", valores: [undefined, undefined, { grupo: "C" }] },
    ],
    notas: ["Escolha 1 (grupo C): JAWS ou Jurassic Park – The Ride (só no combo Race & Minion Special)."],
  },
  {
    titulo: "Express 4 — inclusive Area Timed Entry (Parte 1)",
    colunas: ["Minion & Theatre", "Race & Theatre", "Race & JAWS"],
    linhas: [
      { atracao: "Entrada com horário marcado no Super Nintendo World", valores: [true, true, true] },
      { atracao: "Yoshi's Adventure", valores: [true, true, undefined] },
      { atracao: "Illumination's Villain-Con Minion Blast", valores: [true, undefined, undefined] },
      { atracao: "Mario Kart: Koopa's Challenge", valores: [undefined, true, true] },
      { atracao: "JAWS", valores: [{ grupo: "D" }, undefined, { grupo: "E" }] },
      { atracao: "Detective Conan 4-D Live Show: Jewel Under the Starry Sky", valores: [{ grupo: "D" }, undefined, undefined] },
      { atracao: "Jurassic Park – The Ride", valores: [undefined, undefined, { grupo: "E" }] },
      { atracao: "Despicable Me: Minion Mayhem", valores: [true, undefined, true] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [undefined, true, true] },
    ],
    notas: [
      "Escolha 1 (grupo D): JAWS ou Detective Conan 4-D Live Show: Jewel Under the Starry Sky (combo Minion & Theatre).",
      "Escolha 1 (grupo E): JAWS ou Jurassic Park – The Ride (combo Race & JAWS).",
    ],
  },
  {
    titulo: "Express 4 — inclusive Area Timed Entry (Parte 2)",
    colunas: [
      "Minecart & JAWS",
      "Minecart & Jurassic Park",
      "Minion & Hollywood Dream The Ride",
      "One More Race & Flying Dinosaur",
      "Theatre & Flying Dinosaur",
    ],
    linhas: [
      { atracao: "Entrada com horário marcado no Super Nintendo World", valores: [true, true, true, true, true] },
      { atracao: "Mario Kart: Koopa's Challenge", valores: [true, undefined, undefined, { texto: "✓ 2x" }, true] },
      { atracao: "Mine Cart Madness", valores: [true, true, true, undefined, undefined] },
      { atracao: "Yoshi's Adventure", valores: [undefined, true, undefined, undefined, undefined] },
      { atracao: "Hollywood Dream – The Ride: Backdrop", valores: [undefined, undefined, undefined, undefined, true] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [{ grupo: "F" }, { grupo: "G" }, true, true, { grupo: "H" }] },
      { atracao: "JAWS", valores: [{ grupo: "F" }, undefined, undefined, undefined, undefined] },
      { atracao: "Jurassic Park – The Ride", valores: [undefined, { grupo: "G" }, undefined, undefined, undefined] },
      { atracao: "The Flying Dinosaur", valores: [undefined, undefined, undefined, true, undefined] },
      { atracao: "Hollywood Dream – The Ride", valores: [undefined, undefined, undefined, undefined, { grupo: "H" }] },
      { atracao: "Despicable Me: Minion Mayhem", valores: [undefined, true, true, undefined, undefined] },
      { atracao: "Detective Conan 4-D Live Show: Jewel Under the Starry Sky", valores: [undefined, undefined, undefined, undefined, true] },
    ],
    notas: [
      "Escolha 1 (grupo F): Harry Potter and the Forbidden Journey ou JAWS (combo Minecart & JAWS).",
      "Escolha 1 (grupo G): Harry Potter and the Forbidden Journey ou Jurassic Park – The Ride (combo Minecart & Jurassic Park).",
      "Escolha 1 (grupo H): Harry Potter and the Forbidden Journey ou Hollywood Dream – The Ride (combo Theatre & Flying Dinosaur).",
      "No combo One More Race & Flying Dinosaur, Mario Kart: Koopa's Challenge vale 2 corridas.",
    ],
  },
  {
    titulo: "Express 4 — sem Area Timed Entry",
    colunas: ["Backdrop & Flying Dinosaur", "Thrills MAX", "Classic & Show"],
    linhas: [
      { atracao: "Flight of the Hippogriff", valores: [true, undefined, undefined] },
      { atracao: "Hollywood Dream – The Ride: Backdrop", valores: [true, true, undefined] },
      { atracao: "The Flying Dinosaur", valores: [true, true, undefined] },
      { atracao: "Hollywood Dream – The Ride", valores: [undefined, true, undefined] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [true, undefined, { grupo: "I" }] },
      { atracao: "Jurassic Park – The Ride", valores: [undefined, undefined, { grupo: "I" }] },
      { atracao: "JAWS", valores: [undefined, undefined, true] },
      { atracao: "Universal Monsters Live: Rock and Roll Show", valores: [undefined, undefined, true] },
      { atracao: "WaterWorld", valores: [undefined, undefined, true] },
    ],
    notas: [
      "Escolha 1 (grupo I): Harry Potter and the Forbidden Journey ou Jurassic Park – The Ride (combo Classic & Show).",
      "Este tier não inclui a entrada com horário marcado no Super Nintendo World — é vendido separadamente.",
      "No combo Thrills MAX, depois das atrações acima o cliente ainda escolhe mais 1 entre Jurassic Park – The Ride, The Flying Dinosaur e Hollywood Dream – The Ride.",
    ],
  },
  {
    titulo: "Express 4 — Halloween Horror Nights",
    colunas: [
      "Halloween Set — Chainsaw Man: The Chaos 4-D",
      "Halloween Set — Resident Evil Requiem: The Dive",
      "Halloween Set — Factory of Fear: Zombie Tour",
    ],
    linhas: [
      { atracao: "Jurassic Park – The Ride: In the Dark", valores: [true, true, undefined] },
      { atracao: "Factory of Fear: Zombie Tour", valores: [true, undefined, true] },
      { atracao: "Resident Evil Requiem: The Dive", valores: [undefined, true, true] },
      { atracao: "Hollywood Dream – The Ride", valores: [true, true, undefined] },
      { atracao: "Chainsaw Man: The Chaos 4-D", valores: [true, undefined, undefined] },
      { atracao: "Sadako's Curse: Dark Horror Ride", valores: [undefined, true, undefined] },
      { atracao: "Harry Potter and the Forbidden Journey", valores: [undefined, undefined, true] },
      { atracao: "JAWS: Red Alert", valores: [undefined, undefined, true] },
    ],
    notas: ["Disponível só durante o evento sazonal Halloween Horror Nights (geralmente set–nov)."],
  },
];

function CelulaUsjTabela({ celula }: { celula: UsjComboCelula }) {
  if (celula === true) {
    return <span className="font-semibold text-emerald-600">✓</span>;
  }
  if (celula && "texto" in celula) {
    return <span className="font-semibold text-emerald-600">{celula.texto}</span>;
  }
  if (celula && "grupo" in celula) {
    return (
      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        Escolha 1 · {celula.grupo}
      </span>
    );
  }
  return <span className="text-black/20">—</span>;
}

type DestinoKey = (typeof DESTINOS)[number]["key"];

type TemporadaKey = "sakura" | "primavera" | "julho" | "outono" | "inverno" | "baixa";

// 6 janelas de temporada — 4 pedidas originalmente (08/set/2026) + 2 novas
// (Primavera e Inverno, pedidas no mesmo dia, com o antigo card
// "Primavera" renomeado pra "Sakura (Cerejeiras)" pra não confundir com o
// novo). "Baixa" é o baseline (multiplicador 1.0 em toda cidade
// pesquisada) — os outros multiplicadores são o quanto a diária média sobe
// em relação a esse baseline.
const TEMPORADAS: { key: TemporadaKey; nome: string; periodo: string; icone: string }[] = [
  {
    key: "sakura",
    nome: "Sakura (Cerejeiras)",
    periodo: "florada das cerejeiras · final de mar. a início de abr.",
    icone: "/images/temporada/01-primavera.png",
  },
  {
    key: "primavera",
    nome: "Primavera",
    periodo: "flores + Golden Week · meados de abr. a fim de mai.",
    icone: "/images/temporada/05-primavera.png",
  },
  {
    key: "julho",
    nome: "Férias Escolares (Julho)",
    periodo: "julho (fim das chuvas/verão japonês)",
    icone: "/images/temporada/02-julho.png",
  },
  {
    key: "outono",
    nome: "Outono",
    periodo: "folhas de outono · meados de out. a meados de nov.",
    icone: "/images/temporada/03-outono.png",
  },
  {
    key: "inverno",
    nome: "Inverno",
    periodo: "neve e Ano Novo · dez. a fev.",
    icone: "/images/temporada/06-inverno.png",
  },
  {
    key: "baixa",
    nome: "Fora de alta temporada",
    periodo: "restante do ano",
    icone: "/images/temporada/04-baixa.png",
  },
];

// Multiplicador de diária de hotel por cidade e temporada — pesquisa de
// mercado real (ADR/RevPAR de cadeias e agregadores, JNTO/STR/HotelBank,
// comparações Golden Week 2026 etc.). "sakura", "julho", "outono" e
// "baixa" foram pesquisados em 08/set/2026; "primavera" e "inverno" foram
// adicionados no mesmo dia (ver comentário no topo do patch que introduziu
// isso, com as fontes). Cobre as 10 maiores cidades da lista de destinos +
// Niseko (destino de inverno caro, citado explicitamente pelo Wilson).
// Cidades fora dessa tabela (Nara, Hakone, Nikko etc.) usam 1.0 em
// qualquer temporada — mercados pequenos/pouco usados, que o Wilson pediu
// pra não pesquisar agora.
//
// "primavera" (novo) = resto da primavera + Golden Week (meados de abr. a
// fim de mai.), DEPOIS da janela de "sakura". Dado de mercado (HotelBank,
// Golden Week 2026): abril/maio como um todo sobem mais que a própria
// semana de feriado, e o efeito é mais forte em destinos de turismo
// doméstico (Okinawa, Hokkaido) do que na semana da sakura, que puxa mais
// turista internacional pra Kyoto/Tokyo/Osaka — por isso Okinawa e
// Hokkaido aqui ficam ACIMA do valor de "sakura", ao contrário das cidades
// de sakura clássica.
//
// "inverno" (novo) = dez.–fev. Pra a maioria das cidades é temporada mais
// fraca (jan. pós-Ano-Novo é citado como o mês mais barato do ano no
// mercado japonês), com uma leve alta média por causa do pico de
// Natal/Ano Novo — por isso ficou só um pouco acima de 1.0 na maioria das
// cidades. Exceção: Hokkaido/Niseko, onde dez.–fev. é a temporada de neve
// e a alta temporada REAL (turismo de esqui) — Niseko usa um valor bem
// mais alto, dentro da faixa de 2×–4× sobre a temporada verde já
// sinalizada neste arquivo; o Ano Novo especificamente em Niseko pode
// passar disso ainda mais.
const TEMPORADA_MULTIPLICADOR_HOTEL: Partial<Record<DestinoKey, Record<TemporadaKey, number>>> = {
  tokyo: { sakura: 1.45, primavera: 1.35, julho: 1.1, outono: 1.3, inverno: 1.1, baixa: 1.0 },
  yokohama: { sakura: 1.25, primavera: 1.2, julho: 1.05, outono: 1.15, inverno: 1.05, baixa: 1.0 },
  kyoto: { sakura: 1.85, primavera: 1.6, julho: 1.15, outono: 1.75, inverno: 1.15, baixa: 1.0 },
  osaka: { sakura: 1.4, primavera: 1.3, julho: 1.1, outono: 1.2, inverno: 1.05, baixa: 1.0 },
  nagoya: { sakura: 1.1, primavera: 1.1, julho: 1.05, outono: 1.12, inverno: 1.0, baixa: 1.0 },
  kobe: { sakura: 1.08, primavera: 1.08, julho: 1.05, outono: 1.1, inverno: 1.0, baixa: 1.0 },
  hiroshima: { sakura: 1.15, primavera: 1.15, julho: 1.1, outono: 1.2, inverno: 1.0, baixa: 1.0 },
  fukuoka: { sakura: 1.12, primavera: 1.15, julho: 1.1, outono: 1.12, inverno: 1.0, baixa: 1.0 },
  hokkaido: { sakura: 1.12, primavera: 1.2, julho: 1.15, outono: 1.05, inverno: 1.55, baixa: 1.0 },
  okinawa: { sakura: 1.1, primavera: 1.35, julho: 1.4, outono: 1.03, inverno: 0.85, baixa: 1.0 },
  niseko: { sakura: 0.85, primavera: 0.85, julho: 1.08, outono: 1.1, inverno: 2.8, baixa: 1.0 },
};

type ExtensaoInternacionalKey = "coreiaDoSul" | "china";

// Categorias de hotel selecionáveis para uma extensão internacional —
// pacotes de 3/4/5 estrelas (pedido do Wilson, 10/set/2026). Sem "Elite":
// as extensões são um add-on ao pacote principal do Japão, não o destino
// central da proposta, então o teto de categoria fica em 5 estrelas.
const CATEGORIAS_HOTEL_EXTENSAO = ["3 estrelas", "4 estrelas", "5 estrelas"] as const;
type CategoriaHotelExtensao = (typeof CATEGORIAS_HOTEL_EXTENSAO)[number];

// Deslocamento (voo/trem) entre o Japão e/ou entre as cidades de uma
// extensão internacional. Preços de referência em classe econômica,
// pesquisados em 10/set/2026 (Kayak/Skyscanner/Momondo/Trip.com/
// TravelChinaGuide, trecho de ida): Tóquio → Seoul ≈ US$ 210/pax (faixa
// US$ 115–350 conforme cia aérea e antecedência); Tóquio → Pequim ≈
// US$ 280/pax (faixa US$ 160–450); Pequim → Xangai de trem-bala 2ª
// classe ≈ US$ 85/pax (CNY 576) — preferido ao voo doméstico (≈
// US$ 180/pax) por ser mais previsível, central-a-central e com menos
// tempo de deslocamento até o aeroporto. Confiança média (tarifa aérea
// varia bastante por antecedência/temporada) — revisar quando houver
// cotação real de emissão.
const PRECO_VOO_TOQUIO_SEOUL_USD_PAX = comMargemEImposto(210);
const PRECO_VOO_TOQUIO_PEQUIM_USD_PAX = comMargemEImposto(280);
const PRECO_TREM_PEQUIM_XANGAI_USD_PAX = comMargemEImposto(85);

type ExtensaoCidadeKey = "seoul" | "beijing" | "shanghai";

// Diária de hotel por categoria, pesquisada DIRETAMENTE por cidade de
// extensão (Seoul/Beijing/Shanghai) — substitui a abordagem anterior de
// "multiplicador relativo a Tóquio", que só tinha sido calibrada contra
// ADR de hotéis flagship 5 estrelas e, aplicada aos outros tiers,
// subestimava fortemente o 4 estrelas de Seoul. Pedido do Wilson,
// 10/set/2026 ("preços não estão baratos demais?"). Valores em US$/noite,
// pesquisados em 10/set/2026 (Booking/Trip.com/HotelsCombined/Kayak/
// Momondo/Agoda), convertidos pra reais pela cotação do dia
// (cambioCotacao), não por uma cotação fixa: Seoul — 3★ ~US$55–90 (ex.:
// Lotte City Hotel Guro, uso US$75); 4★ ~US$200–450 (ex.: Westin Josun
// Seoul ~US$377–445, uso US$350 pra evitar picos de data); 5★ ~US$500–800
// (ex.: Four Seasons Seoul ~US$567+, uso US$600). Beijing — 3★ ~US$35–90
// (uso US$65); 4★ ~US$120–250 (ex.: JW Marriott Beijing ~US$162, uso
// US$170); 5★ ~US$500–700 (ex.: Bulgari Beijing ~US$604, uso US$600).
// Shanghai — 3★ ~US$30–110 (uso US$70); 4★ ~US$110–200 (ex.: The Westin
// Bund Center ~US$106–199, uso US$150); 5★ ~US$300–500 (ex.: The
// Peninsula Shanghai ~US$334, uso US$380 — mais perto do Mandarin
// Oriental Pudong, mesma categoria). Confiança média (tarifa hoteleira
// varia por antecedência/temporada) — revisar quando houver dado de
// reserva real ou tabela de parceiros.
const DIARIA_HOTEL_EXTENSAO_USD: Record<ExtensaoCidadeKey, Record<CategoriaHotelExtensao, number>> = {
  seoul: {
    "3 estrelas": comMargemEImposto(75),
    "4 estrelas": comMargemEImposto(350),
    "5 estrelas": comMargemEImposto(600),
  },
  beijing: {
    "3 estrelas": comMargemEImposto(65),
    "4 estrelas": comMargemEImposto(170),
    "5 estrelas": comMargemEImposto(600),
  },
  shanghai: {
    "3 estrelas": comMargemEImposto(70),
    "4 estrelas": comMargemEImposto(150),
    "5 estrelas": comMargemEImposto(380),
  },
};

// Extensões internacionais — dias adicionais FORA do Japão, somados ao
// total da viagem quando o vendedor ativa o card (não dividem os dias já
// definidos no roteiro do Japão). Categoria de hotel é selecionável por
// extensão (3/4/5 estrelas, independente da categoria do resto do
// pacote) — ver extensaoCategoriaHotel. O deslocamento (voo/trem) de cada
// trecho entra no cálculo somado ao hotel; assume-se trecho ONE-WAY (o
// cliente segue viagem/retorna direto da última cidade da extensão, sem
// voltar ao Japão antes do voo internacional de volta). Seguro e guia
// dessa extensão ainda não entram no cálculo — cotados à parte por
// enquanto.
// Roteiro dia a dia de cada dia de uma extensão internacional — vira os
// cards com imagem que aparecem ao marcar o país em "10. Extensão
// internacional" (pedido do Wilson, 10/set/2026, no mesmo espírito visual
// dos cards de Temas/Cidades recomendadas). `imagem: null` quando ainda
// não temos uma foto própria pra esse dia — o card mostra um placeholder
// em vez de imagem até a foto entrar.
type DiaRoteiroExtensao = {
  cidade: string;
  dia: number;
  titulo: string;
  imagem: string | null;
  // Ponto focal do corte (object-position em CSS) — só precisa ser
  // definido quando o padrão "center" corta o assunto principal da foto
  // de um jeito ruim (ex.: uma torre alta virando só uma faixa de luz
  // desfocada quando o card é baixo e largo). Padrão: "center".
  posicaoImagem?: string;
  pontos: string[];
  conceito: string;
  observacao?: string;
};

type TrechoDeslocamentoExtensao = { label: string; precoUSDPax: number };

const EXTENSOES_INTERNACIONAIS: {
  key: ExtensaoInternacionalKey;
  nome: string;
  icone: string;
  dias: number;
  cidades: { key: ExtensaoCidadeKey; nome: string; dias: number }[];
  deslocamento: TrechoDeslocamentoExtensao[];
  roteiro: DiaRoteiroExtensao[];
}[] = [
  {
    key: "coreiaDoSul",
    nome: "Coréia do Sul",
    icone: "/images/paises/coreia-do-sul.png",
    dias: 3,
    cidades: [{ key: "seoul", nome: "Seoul", dias: 3 }],
    deslocamento: [{ label: "Voo Tóquio → Seoul (econômica)", precoUSDPax: PRECO_VOO_TOQUIO_SEOUL_USD_PAX }],
    roteiro: [
      {
        cidade: "Seoul",
        dia: 1,
        titulo: "Seoul Histórica",
        imagem: "/images/paises/roteiro/seoul-dia1-gyeongbokgung.jpg",
        pontos: [
          "Gwanghwamun Square",
          "Gyeongbokgung Palace",
          "Bukchon Hanok Village",
          "Insadong",
          "Ikseon-dong",
          "Gwangjang Market",
          "Cheonggyecheon",
        ],
        conceito: "Palácios, arquitetura tradicional coreana, bairros históricos e gastronomia local.",
      },
      {
        cidade: "Seoul",
        dia: 2,
        titulo: "Centro + Skyline",
        imagem: "/images/paises/roteiro/seoul-dia2-nseoultower.jpg",
        // Foto original é vertical (torre + beiral de telhado tradicional) —
        // testado com recortes reais: "top" puro cortava a torre no meio
        // do mirante. 35% verticaliza melhor, mostrando a torre inteira
        // (base ao mirante/antena) como assunto principal, com o telhado
        // como elemento secundário à direita.
        posicaoImagem: "center 35%",
        pontos: ["Namdaemun Market", "Myeongdong", "Namsan Park", "N Seoul Tower", "Itaewon ou Euljiro à noite"],
        conceito: "Centro de Seoul, mercados, vida urbana e uma das melhores vistas panorâmicas da cidade.",
      },
      {
        cidade: "Seoul",
        dia: 3,
        titulo: "Seoul Moderna",
        imagem: "/images/paises/roteiro/seoul-dia3-starfield.jpg",
        // Puxa pro topo pra manter o letreiro em coreano "별마당 도서관"
        // (Starfield Library) visível — o corte central cortava o nome
        // fora e mostrava só prateleiras + escada rolante.
        posicaoImagem: "center 10%",
        pontos: ["Bongeunsa Temple", "COEX", "Starfield Library", "Gangnam", "Seongsu-dong", "Seoul Forest", "Han River"],
        conceito: "O contraste entre templos tradicionais e a Seoul contemporânea, criativa e tecnológica.",
      },
    ],
  },
  {
    key: "china",
    nome: "China",
    icone: "/images/paises/china.png",
    dias: 4,
    cidades: [
      { key: "beijing", nome: "Beijing", dias: 2 },
      { key: "shanghai", nome: "Shanghai", dias: 2 },
    ],
    deslocamento: [
      { label: "Voo Tóquio → Pequim (econômica)", precoUSDPax: PRECO_VOO_TOQUIO_PEQUIM_USD_PAX },
      { label: "Trem-bala Pequim → Xangai (2ª classe)", precoUSDPax: PRECO_TREM_PEQUIM_XANGAI_USD_PAX },
    ],
    roteiro: [
      {
        cidade: "Beijing",
        dia: 1,
        titulo: "China Imperial",
        imagem: "/images/paises/roteiro/beijing-dia1-temple-of-heaven.jpg",
        pontos: [
          "Temple of Heaven",
          "Tiananmen Square",
          "Forbidden City",
          "Jingshan Park",
          "Shichahai / Houhai",
          "Hutongs",
          "Jantar de Peking Duck",
        ],
        conceito: "O coração histórico e imperial da China.",
      },
      {
        cidade: "Beijing",
        dia: 2,
        titulo: "Grande Muralha",
        imagem: "/images/paises/roteiro/beijing-dia2-great-wall.jpg",
        pontos: ["Mutianyu Great Wall", "Summer Palace", "Wangfujing à noite"],
        conceito:
          "Grande Muralha pela manhã e um dos mais importantes complexos imperiais de Beijing à tarde.",
        observacao: "Recomendar motorista/transfer privado para o dia da Grande Muralha.",
      },
      {
        cidade: "Shanghai",
        dia: 1,
        titulo: "Shanghai Clássica + Futurista",
        imagem: "/images/paises/roteiro/shanghai-dia1-the-bund.jpg",
        // Foto original tinha marca d'água de um site concorrente
        // (chinadiscovery.com) no canto inferior direito — recortada pra
        // remover a marca, mantendo o skyline completo (Oriental Pearl
        // Tower, WFC, Shanghai Tower, Garden Bridge) enquadrado.
        pontos: ["Yu Garden", "Old City", "Nanjing Road", "The Bund", "Lujiazui", "Shanghai Tower", "Bund iluminado à noite"],
        conceito: "Da Shanghai tradicional ao skyline futurista de Pudong.",
      },
      {
        cidade: "Shanghai",
        dia: 2,
        titulo: "French Concession",
        imagem: "/images/paises/roteiro/shanghai-dia2-wukang-road.jpg",
        // Foto vertical do prédio (Wukang Mansion/Normandie Apartments) —
        // puxa pro topo pra manter a fachada arredondada característica
        // visível em vez de cortar só o nível da rua.
        posicaoImagem: "top",
        pontos: [
          "Wukang Road",
          "Former French Concession",
          "Anfu Road",
          "Jing'an Temple",
          "Xintiandi",
          "Huangpu River Cruise à noite",
        ],
        conceito: "Arquitetura histórica, ruas arborizadas, cafés, bairros sofisticados e Shanghai vista do rio.",
      },
    ],
  },
];

type TemaKey =
  | "roteiroClassico"
  | "automobilismo"
  | "gastronomia"
  | "animeGames"
  | "japaoTradicional"
  | "naturezaPaisagens"
  | "onsenRyokan"
  | "luxoCompras"
  | "esportesEventos"
  | "parquesEntretenimento"
  | "neveInverno";

type TemaCidade = {
  key: DestinoKey;
  /** Texto de destaque mostrado ao lado da cidade quando o tema está
   * selecionado — descreve o motivo da cidade estar nesse tema. */
  destaque: string;
  /** Vem marcada por padrão quando o tema é selecionado — cidades
   * principais/multiuso do tema; as demais (secundárias, mais distantes
   * ou de proposito único) ficam desmarcadas até o vendedor confirmar. */
  padrao: boolean;
  /** Aviso de que ingresso é obrigatório para assistir provas ao vivo
   * nesse circuito, com as principais datas do ano e a dificuldade de
   * compra do ingresso em uma escala de 0 (fácil, sempre disponível) a
   * 10 (extremamente concorrido, esgota em minutas/horas). Fontes:
   * suzukacircuit.jp/eng, mr-motegi.jp/eng, honda.racing (calendários
   * oficiais Super Formula/MotoGP 2026), fiawec.com (WEC 2026),
   * total-motorsport.com (demanda de ingressos F1 2026). Pesquisado
   * 04/set/2026. */
  notaIngresso?: string;
};

// Catálogo de Temas — cada um sugere um grupo de cidades (com destaque
// próprio) pra montar rapidamente o roteiro e a cidade de referência do
// hotel. Selecionar um tema marca as cidades "padrao" dele em
// destinosSelecionados (o vendedor pode ajustar cidade por cidade depois);
// "Sem Tema" limpa a seleção. Pedido do Wilson, 04/set/2026.
// Máximo de temas que podem ficar ativos ao mesmo tempo (misturar temas
// pra montar a viagem do cliente). Pedido do Wilson, 04/set/2026.
const MAX_TEMAS_SIMULTANEOS = 3;
const MAX_CIDADES_ROTEIRO = 5;
// Câmbio de ienes — spread da Alpinea sobre a cotação de papel-moeda do
// melhorcambio.com, e piso mínimo pedido pelo Wilson (08/set/2026).
const SPREAD_CAMBIO_IENE = 1.15;
const CAMBIO_IENES_MINIMO = 100000;

const TEMAS: { key: TemaKey; nome: string; icone: string; cidades: TemaCidade[] }[] = [
  {
    key: "roteiroClassico",
    nome: "Roteiro Clássico (Recomendado)",
    icone: "/images/temas/00-roteiro-classico.png",
    cidades: [
      { key: "tokyo", destaque: "Capital e porta de entrada do Japão — base clássica de qualquer primeira viagem", padrao: true },
      { key: "osaka", destaque: "Gastronomia informal, Dotonbori e proximidade com Kyoto", padrao: true },
      { key: "kyoto", destaque: "Templos, tradição e cultura japonesa clássica", padrao: true },
      { key: "fuji", destaque: "Vista do Monte Fuji — entra automaticamente em roteiros de mais de 10 dias", padrao: false },
      { key: "hakone", destaque: "Onsen e vistas do Fuji a caminho de Tokyo — entra automaticamente em roteiros de mais de 10 dias", padrao: false },
    ],
  },
  {
    key: "automobilismo",
    nome: "Automobilismo",
    icone: "/images/temas/02-automobilismo.png",
    cidades: [
      { key: "tokyo", destaque: "Cultura JDM e encontros automotivos — A PIT Autobacs · Nissan Crossing · Daikoku PA", padrao: true },
      { key: "fuji", destaque: "Circuito e história do automobilismo — Fuji Speedway · Fuji Motorsports Museum", padrao: true, notaIngresso: "Ingresso obrigatório para assistir às provas. 2026: WEC 6 Hours of Fuji (25–27/set — dificuldade de compra 4/10) · Super Formula (18–19/jul e 10–11/out — dificuldade 2/10). Super GT e Super Taikyu também correm em Fuji; datas variam a cada ano — confirmar no calendário oficial (fujispeedway.co.jp)." },
      { key: "nagoya", destaque: "História da indústria automobilística japonesa — Toyota Automobile Museum · Toyota Commemorative Museum", padrao: true },
      { key: "motegi", destaque: "Honda e motorsports — Honda Collection Hall · Mobility Resort Motegi", padrao: false, notaIngresso: "Ingresso obrigatório para assistir às provas. 2026: MotoGP Japão (2–4/out — dificuldade de compra 5/10) · Super Formula (4–5/abr — dificuldade 2/10). Super GT também corre em Motegi; data varia a cada ano — confirmar no calendário oficial (mr-motegi.jp)." },
      { key: "suzuka", destaque: "Um dos circuitos mais emblemáticos do Japão — Suzuka Circuit", padrao: false, notaIngresso: "Ingresso obrigatório para assistir às provas. 2026: F1 GP do Japão (27–29/mar — dificuldade de compra 8/10, ingressos premium esgotam meses antes) · Suzuka 8 Hours (3–5/jul — dificuldade 6/10) · Suzuka 1000km/Super GT (11–13/set — dificuldade 3/10) · Super Formula (23–24/mai e 21–22/nov — dificuldade 2/10)." },
    ],
  },
  {
    key: "gastronomia",
    nome: "Gastronomia",
    icone: "/images/temas/03-gastronomia.png",
    cidades: [
      { key: "tokyo", destaque: "Omakase, sushi, yakiniku, alta gastronomia e enorme variedade regional japonesa", padrao: true },
      { key: "kyoto", destaque: "Kaiseki, cozinha Kyo-ryori, chá, tofu e restaurantes tradicionais", padrao: true },
      { key: "osaka", destaque: "Cultura gastronômica mais informal — Dotonbori, takoyaki, okonomiyaki, kushikatsu e mercados", padrao: true },
    ],
  },
  {
    key: "animeGames",
    nome: "Anime, Games & Cultura Pop",
    icone: "/images/temas/04-anime-games-cultura-pop.png",
    cidades: [
      { key: "tokyo", destaque: "Akihabara, Ikebukuro, Nakano Broadway, Pokémon Centers e lojas especializadas", padrao: true },
      { key: "osaka", destaque: "Den Den Town, Nipponbashi e cultura pop concentrada em Namba", padrao: true },
      { key: "nagoya", destaque: "Ghibli Park e grandes lojas de anime/games", padrao: false },
      { key: "kyoto", destaque: "Nintendo Museum e Kyoto International Manga Museum", padrao: false },
    ],
  },
  {
    key: "japaoTradicional",
    nome: "Japão Tradicional",
    icone: "/images/temas/05-japao-tradicional.png",
    cidades: [
      { key: "kyoto", destaque: "Templos, jardins, Gion, cerimônia do chá e arquitetura histórica", padrao: true },
      { key: "nara", destaque: "Tōdai-ji, Kasuga Taisha, parque e patrimônio do período clássico japonês", padrao: true },
      { key: "kanazawa", destaque: "Kenroku-en, bairros de gueixas e samurais, artesanato tradicional", padrao: false },
      { key: "takayama", destaque: "Centro histórico, casas tradicionais e cultura de Hida", padrao: false },
      { key: "koyasan", destaque: "Complexo monástico, Okunoin e hospedagem em templo", padrao: false },
    ],
  },
  {
    key: "naturezaPaisagens",
    nome: "Natureza & Paisagens",
    icone: "/images/temas/06-natureza-paisagens.png",
    cidades: [
      { key: "fuji", destaque: "Vistas do Monte Fuji, Chureito, Lago Kawaguchi e Oishi Park", padrao: true },
      { key: "hakone", destaque: "Lago Ashi, Owakudani e paisagem montanhosa", padrao: true },
      { key: "nikko", destaque: "Florestas, montanhas, lago Chuzenji e Kegon Falls", padrao: false },
      { key: "kamikochi", destaque: "Alpes Japoneses, trilhas e paisagens de montanha", padrao: false },
    ],
  },
  {
    key: "onsenRyokan",
    nome: "Onsen & Ryokan",
    icone: "/images/temas/07-onsen-ryokan.png",
    cidades: [
      { key: "hakone", destaque: "Grande variedade de ryokans premium e onsen privados perto de Tokyo", padrao: true },
      { key: "kinosaki", destaque: "Cidade termal tradicional com circuito de sete banhos públicos", padrao: false },
      { key: "kusatsu", destaque: "Uma das águas termais mais famosas do Japão e o Yubatake", padrao: false },
      { key: "fuji", destaque: "Ryokans e onsen com vistas para o Monte Fuji", padrao: false },
    ],
  },
  {
    key: "luxoCompras",
    nome: "Luxo & Compras",
    icone: "/images/temas/08-luxo-compras.png",
    cidades: [
      { key: "tokyo", destaque: "Ginza, Omotesando, Aoyama e departamentos de luxo; moda, relojoaria e design japonês", padrao: true },
      { key: "kyoto", destaque: "Artesanato, cerâmica, quimonos, chá e produtos tradicionais de alto padrão", padrao: true },
      { key: "osaka", destaque: "Shinsaibashi, Umeda e grandes lojas de luxo e departamentos", padrao: true },
    ],
  },
  {
    key: "esportesEventos",
    nome: "Esportes & Eventos",
    icone: "/images/temas/09-esportes-eventos.png",
    cidades: [
      { key: "tokyo", destaque: "Sumô, baseball, futebol e grandes eventos em arenas e estádios", padrao: true },
      { key: "osaka", destaque: "Baseball, futebol e eventos esportivos de grande porte", padrao: false },
      { key: "nagoya", destaque: "Sumô, baseball e eventos no eixo Aichi/Nagoya", padrao: false },
    ],
  },
  {
    key: "parquesEntretenimento",
    nome: "Parques & Entretenimento",
    icone: "/images/temas/10-parques-entretenimento.png",
    cidades: [
      { key: "tokyo", destaque: "Tokyo Disneyland, Tokyo DisneySea e experiências de entretenimento imersivo", padrao: true },
      { key: "osaka", destaque: "Universal Studios Japan e Super Nintendo World", padrao: true },
      { key: "nagoya", destaque: "Ghibli Park", padrao: true },
    ],
  },
  {
    key: "neveInverno",
    nome: "Neve & Inverno",
    icone: "/images/temas/11-neve-inverno.png",
    cidades: [
      { key: "niseko", destaque: "Powder snow, resorts internacionais, ski e hotéis premium", padrao: true },
      { key: "hakuba", destaque: "Grande área esquiável nos Alpes Japoneses, fácil combinação com Tokyo", padrao: false },
      { key: "nozawa", destaque: "Ski combinado com vila tradicional e cultura de onsen", padrao: false },
    ],
  },
];

// Cidades onde o transporte público (trem/ônibus) não dá conta sozinho do
// roteiro — pesquisa 04/set/2026, a pedido do Wilson ("avaliar quais
// cidades precisam de motorista particular obrigatório devido a logística
// de trem e ônibus ser insuficiente"). "obrigatorio" = sem carro/motorista
// o roteiro não fecha (ilha com ônibus raro, resort de ski disperso,
// acesso restrito etc.); "recomendado" = dá pra fazer de transporte
// público, mas com bagagem/tempo/conforto prejudicados. Cidades fora
// dessa lista têm trem/ônibus/metrô que cobrem bem o roteiro sozinhos
// (inclusive Koyasan e Kinosaki, que apesar de remotas/pequenas têm
// trem+funicular ou trem-bala dedicados e são andáveis por dentro).
const CIDADE_MOTORISTA_NOTA: Partial<
  Record<DestinoKey, { nivel: "obrigatorio" | "recomendado"; motivo: string }>
> = {
  yakushima: {
    nivel: "obrigatorio",
    motivo: "Ônibus local roda poucas vezes ao dia; trilhas e atrações ficam espalhadas pela ilha.",
  },
  motegi: {
    nivel: "obrigatorio",
    motivo: "Ônibus até o circuito só é confiável em dia de evento — fora disso o transporte público é muito limitado.",
  },
  kamikochi: {
    nivel: "obrigatorio",
    motivo: "Carro particular é proibido dentro do vale — mesmo com motorista contratado, o trecho final é de ônibus/táxi lançadeira a partir do portão (Sawando/Nakanoyu).",
  },
  ishigaki: {
    nivel: "recomendado",
    motivo: "Praias e pontos turísticos ficam espalhados pela ilha, com ônibus infrequente.",
  },
  fuji: {
    nivel: "recomendado",
    motivo: "Ônibus da Fujikyu cobrem os principais pontos, mas com frequência baixa entre os mirantes.",
  },
  suzuka: {
    nivel: "recomendado",
    motivo: "Shuttle até o circuito existe, mas com frequência reduzida fora de dias de evento.",
  },
  kusatsu: {
    nivel: "recomendado",
    motivo: "Acesso via ônibus a partir da estação de trem-bala, com frequência limitada — motorista facilita bastante com bagagem.",
  },
  niseko: {
    nivel: "recomendado",
    motivo: "Shuttle entre as vilas do resort funciona bem na temporada de neve; fora dela, transporte público é escasso e o aeroporto fica a ~2h30.",
  },
  hakuba: {
    nivel: "recomendado",
    motivo: "As vilas do resort ficam espalhadas, com ônibus local limitado — ~70 min de ônibus desde a estação de Nagano.",
  },
  okinawa: {
    nivel: "recomendado",
    motivo: "Monotrilho e ônibus cobrem Naha, mas as atrações do norte da ilha (Churaumi etc.) têm pouca cobertura de transporte público.",
  },
};

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Mês/quinzena de referência da tabela de preços do JR Pass usada em
// JR_PASS_PRECO_USD / JR_PASS_PRECO_USD_GREEN (CustomPackageCard.tsx) —
// atualizar aqui junto com os valores toda vez que o fornecedor mandar uma
// tabela nova (tabela é renovada quinzenalmente).
const JR_PASS_TABELA_VALIDADE = "01–15/set/2026";

const MIN_DIAS = 3;
const MAX_DIAS = 30;
const MIN_PESSOAS = 1;
const MAX_PESSOAS = 20;
const MIN_ORCAMENTO_BRL = 5000;
const MAX_ORCAMENTO_BRL = 2000000;

type ItemPacote = {
  label: string;
  detalhe: string[];
  precoBRL: number;
  /** Chave estável de identificação do item - usada em vez do label nos
   * controles de selecao e ajuste manual, porque o label de alguns itens
   * muda (categoria de hotel, classe do aereo, dias/classe do JR Pass,
   * tipo de wi-fi) e nao pode servir de chave. Itens com label fixo nao
   * precisam declarar chave (o codigo usa o label como chave nesse caso). */
  chave?: string;
  /** Se o item coube no orçamento pela regra automática (prioridade
   * greedy) no momento em que a proposta foi calculada. Itens
   * configurados pelo vendedor (JR Pass, wi-fi, ingressos, motorista
   * etc.) SEMPRE aparecem na lista, mesmo quando não cabem — ficam
   * desmarcados por padrão (não somem mais), e o vendedor pode marcar
   * manualmente pra forçar a inclusão. Ausente = sempre recomendado
   * (itens fixos: Roteiro, Aéreo, Hotel). */
  recomendado?: boolean;
};

function chaveDoItem(item: ItemPacote) {
  return item.chave ?? item.label;
}

// "Botão de volume" — desliza entre um teto mínimo (nível base) e máximo
// (nível mais alto) de uma lista de opções ordenadas. Usado pra limitar até
// onde o preenchimento automático por orçamento pode subir a categoria do
// hotel ou a classe do voo, sem precisar de um dropdown (pedido do Wilson:
// "isso deve vir como se fosse um botão de volume").
// "Botão de volume" — barra horizontal de segmentos clicáveis, como o
// controle de volume de uma TV/som (não um slider nativo, que passava
// despercebido). Clicar em qualquer segmento define o teto naquele nível;
// os segmentos até ali (inclusive) acendem, os seguintes ficam apagados —
// leitura visual imediata de "quanto está liberado".
function VolumeSlider<T extends string>({
  label,
  opcoes,
  value,
  onChange,
  nota,
}: {
  label: string;
  opcoes: readonly T[];
  value: T;
  onChange: (v: T) => void;
  nota?: string;
}) {
  const indice = Math.max(0, opcoes.indexOf(value));
  return (
    <div className="flex h-full flex-col">
      <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
        <LabelNumerado texto={label} />
      </span>
      <div className="flex items-center gap-2 rounded-lg border border-black/15 bg-black/[0.03] px-3 h-12">
        <span aria-hidden className="shrink-0 text-base font-semibold text-black/30">
          −
        </span>
        <div className="flex flex-1 items-center gap-1">
          {opcoes.map((o, i) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-label={o}
              aria-pressed={i <= indice}
              className={`h-6 flex-1 rounded-sm transition ${
                i <= indice ? "bg-[#2f80c9]" : "bg-black/10 hover:bg-black/20"
              }`}
              style={{ height: `${14 + i * 6}px` }}
            />
          ))}
        </div>
        <span aria-hidden className="shrink-0 text-base font-semibold text-black/30">
          +
        </span>
      </div>
      <div className="mt-1.5 flex justify-between gap-1 text-[9px] uppercase tracking-wide text-black/35">
        {opcoes.map((o) => (
          <span key={o} className={o === value ? "font-semibold text-[#2f80c9]" : ""}>
            {o}
          </span>
        ))}
      </div>
      {nota && <span className="mt-1 text-[11px] leading-4 text-black/40">{nota}</span>}
    </div>
  );
}

// Combobox de cidade — input de texto com busca + lista filtrada, em vez de
// um <select> nativo (a lista de DESTINOS passa de 30 cidades e rolar um
// dropdown pra achar uma é ruim; digitar e filtrar é bem mais rápido).
// onMouseDown com preventDefault nas opções evita que o blur do input feche
// a lista antes do clique registrar (truque padrão de combobox).
function CidadeCombobox({
  value,
  onChange,
  todasSelecionadas,
}: {
  value: DestinoKey;
  onChange: (key: DestinoKey) => void;
  /** Cidades já usadas por outras linhas do roteiro — ficam de fora das
   * opções, exceto a da própria linha (senão ela sumiria da lista). */
  todasSelecionadas: DestinoKey[];
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const nomeAtual = DESTINOS.find((d) => d.key === value)?.nome ?? value;
  const opcoes = DESTINOS.filter(
    (d) =>
      (d.key === value || !todasSelecionadas.includes(d.key)) &&
      d.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={aberto ? busca : nomeAtual}
        onChange={(e) => setBusca(e.target.value)}
        onFocus={(e) => {
          setBusca("");
          setAberto(true);
          e.target.select();
        }}
        onBlur={() => setTimeout(() => setAberto(false), 120)}
        placeholder="Digite pra buscar uma cidade…"
        title="Clique para trocar a cidade"
        className="h-10 w-full cursor-pointer rounded-lg border border-black/15 bg-black/[0.03] px-3 pr-7 text-center text-sm outline-none focus:border-black/30"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-black/35"
      >
        ▾
      </span>
      {aberto && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-black/15 bg-white shadow-lg">
          {opcoes.length === 0 ? (
            <p className="px-3 py-2 text-sm text-black/40">Nenhuma cidade encontrada</p>
          ) : (
            opcoes.map((d) => (
              <button
                key={d.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(d.key);
                  setBusca("");
                  setAberto(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-[#2f80c9]/10 ${
                  d.key === value ? "bg-[#2f80c9]/10 font-medium text-[#2f80c9]" : "text-black/70"
                }`}
              >
                {d.nome}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Ordem em que os itens entram no pacote sugerido, depois dos itens fixos
// (Roteiro + Aéreo Economy + Hotel 3 estrelas). Cada passo só é aplicado se
// couber no saldo restante do orçamento — greedy, nessa ordem de prioridade.
// Upgrades de categoria de hotel e classe do voo são os itens de maior
// impacto na experiência (perfil de cliente de alta/altíssima renda), por
// isso entram antes dos complementares.
function IconPdf({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 2.75h8.379a1 1 0 0 1 .707.293l3.871 3.871a1 1 0 0 1 .293.707V19.5A1.75 1.75 0 0 1 17.5 21.25h-11.5A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 2.75V6.5a1 1 0 0 0 1 1h3.75" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="6.2" fontWeight="700" fill="currentColor" stroke="none">
        PDF
      </text>
    </svg>
  );
}

// Ícone do arquivo de texto editável (.doc) — mesmo desenho de página do
// IconPdf, só troca o rótulo, pra ficar visualmente parelho ao botão de
// PDF. Pedido do Wilson, 10/set/2026.
function IconDoc({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 2.75h8.379a1 1 0 0 1 .707.293l3.871 3.871a1 1 0 0 1 .293.707V19.5A1.75 1.75 0 0 1 17.5 21.25h-11.5A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 2.75V6.5a1 1 0 0 0 1 1h3.75" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="currentColor" stroke="none">
        DOC
      </text>
    </svg>
  );
}

// Ícone de mala (linha simples, mesmo peso de traço dos outros ícones
// inline da página) — usado no card de "Transporte de Malas
// Inter-Municipal" enquanto não existe um ícone próprio no mesmo estilo
// dos demais em /public/images/icone-*.png. Trocar por um ícone da
// mesma identidade visual quando o Wilson tiver um pronto.
function IconMala({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="8" width="17" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 8V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 11v6.5M14.5 11v6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function CalculadoraReversaPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [orcamento, setOrcamento] = useState(60000);
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [tipoQuarto, setTipoQuarto] =
    useState<(typeof TIPOS_QUARTO)[number]>("Duplo (casal)");
  // Cidades do roteiro — multi-seleção (média dos multiplicadores de
  // hotel das cidades marcadas, mesmo critério do calculador do
  // Personalizado). "Temas" abaixo é um atalho que pré-marca esse set;
  // o vendedor pode sempre ajustar cidade por cidade depois.
  const [destinosSelecionados, setDestinosSelecionados] = useState<DestinoKey[]>(
    () => ["tokyo"],
  );
  // Temporada da viagem — ajusta a diária de hotel por cidade (pesquisa de
  // mercado). Pedido do Wilson, 08/set/2026.
  const [temporada, setTemporada] = useState<TemporadaKey>("baixa");
  // Extensões internacionais (Coréia do Sul / China) — pedido do Wilson,
  // 08/set/2026. Independentes do roteiro do Japão: podem ficar ativas
  // junto com qualquer Tema/seleção de cidades.
  const [extensoesSelecionadas, setExtensoesSelecionadas] = useState<Set<ExtensaoInternacionalKey>>(
    () => new Set(),
  );
  // Categoria de hotel de cada extensão (pacote 3/4/5 estrelas), escolhida
  // de forma independente da categoria do resto do pacote. Pedido do
  // Wilson, 10/set/2026. Padrão em "4 estrelas" — meio-termo.
  const [extensaoCategoriaHotel, setExtensaoCategoriaHotel] = useState<
    Record<ExtensaoInternacionalKey, CategoriaHotelExtensao>
  >({ coreiaDoSul: "4 estrelas", china: "4 estrelas" });
  const [cambioIeneCidade, setCambioIeneCidade] = useState<CidadeCambioIeneSlug>("sao-paulo");
  const [quantidadeIenes, setQuantidadeIenes] = useState(CAMBIO_IENES_MINIMO);
  const cambioIene = useCambioIene(cambioIeneCidade);
  // Até MAX_TEMAS_SIMULTANEOS temas podem ficar ativos ao mesmo tempo —
  // permite montar uma viagem misturando temas (ex.: Automobilismo +
  // Gastronomia). Pedido do Wilson, 04/set/2026.
  const [temasSelecionados, setTemasSelecionados] = useState<Set<TemaKey>>(() => new Set());

  // Valor manual — sobrescreve o cálculo automático quando o time já tem
  // uma cotação real (hotel negociado, tarifa aérea específica etc.),
  // em vez de usar a tabela de referência de mercado.
  const [hotelManual, setHotelManual] = useState(false);
  const [hotelDiariaManual, setHotelDiariaManual] = useState(0);
  // Categoria do hotel quando a diária é manual — a diária não varia por
  // categoria nesse modo (é o valor real que o vendedor já tem), mas a
  // categoria ainda entra no rótulo da proposta e na mensagem final.
  const [hotelCategoriaManual, setHotelCategoriaManual] =
    useState<(typeof CATEGORIAS_HOTEL)[number]>("3 estrelas");
  const [aereoManual, setAereoManual] = useState(false);
  const [aereoValorManual, setAereoValorManual] = useState(0);

  // Teto manual de upgrade — "botão de volume" que limita até onde o
  // preenchimento automático por orçamento pode subir a categoria do
  // hotel / a classe do voo. Por padrão fica no máximo (Elite / First
  // Class), ou seja, comportamento idêntico ao anterior; o vendedor só
  // mexe quando quer reservar orçamento pra outros itens (ex.: JR Pass)
  // mesmo sobrando dinheiro pra um upgrade de hotel ou aéreo.
  const [hotelCategoriaMaxima, setHotelCategoriaMaxima] =
    useState<(typeof CATEGORIAS_HOTEL)[number]>("Elite");
  const [classeAereoMaxima, setClasseAereoMaxima] =
    useState<(typeof CLASSES_AEREO)[number]>("First Class");

  // Alteração manual da seleção padrão dos itens do pacote sugerido: cada
  // chave presente no set INVERTE o padrão automático (item.recomendado)
  // daquele item — assim o vendedor tanto pode tirar um item recomendado
  // quanto adicionar de volta um item que não coube no orçamento (JR
  // Pass, wi-fi, ingressos, motorista etc. continuam sempre visíveis na
  // lista, mesmo quando não recomendados — só ficam desmarcados por
  // padrão). Também guarda o timestamp de quando a proposta foi montada,
  // pra constar na mensagem enviada.
  const [itensAlterados, setItensAlterados] = useState<Set<string>>(new Set());
  const [geradoEm] = useState(() => new Date());
  const [gerandoPdf, setGerandoPdf] = useState(false);

  // Ajuste manual de valor - sobrescreve o preco calculado de um item
  // especifico (ex.: negociacao pontual) sem perder o calculo automatico
  // dos demais, que continua reagindo a orcamento/dias/pessoas. Chave por
  // chaveDoItem(item), nao pelo objeto em si.
  const [itemAjustes, setItemAjustes] = useState<Record<string, number>>({});
  // Ajuste manual do total final - sobrescreve a soma dos itens
  // selecionados quando o vendedor precisa fechar num valor redondo ou
  // negociado, sem precisar editar item por item.
  const [totalManual, setTotalManual] = useState(false);
  const [totalValorManual, setTotalValorManual] = useState(0);

  // JR Pass - faixa de dias e classe (Comum/Green) escolhidas; preco vem
  // da tabela do fornecedor (AjisaiWork), nao escala com ctx.dias.
  const [jrPassDias, setJrPassDias] =
    useState<(typeof JR_PASS_DIAS_OPCOES)[number]>(7);
  const [jrPassClasse, setJrPassClasse] = useState<"comum" | "green">("comum");
  // Quantas pessoas do grupo efetivamente compram o JR Pass — começa igual
  // a `pessoas`, mas é editável separadamente (ex.: crianças pequenas ou
  // quem já tem passe não entram na conta).
  const [jrPassPessoas, setJrPassPessoas] = useState(pessoas);
  const [guiaDias, setGuiaDias] = useState(dias);

  // Wi-fi - eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado,
  // cobre varias pessoas). Ambos escalam com a quantidade de dias.
  const [wifiTipo, setWifiTipo] = useState<"esim" | "pocket">("esim");
  // Para eSIM: quantas pessoas usam eSIM próprio. Para Pocket Wi-Fi:
  // quantos aparelhos estão sendo cobrados. Começa no valor padrão
  // (pessoas / aparelhos calculados a partir de WIFI_TAMANHO_GRUPO) mas é
  // editável — o vendedor pode ajustar se nem todo mundo precisa.
  const [wifiPessoasOuUnidades, setWifiPessoasOuUnidades] = useState(pessoas);

  function alternarWifiTipo(tipo: "esim" | "pocket") {
    setWifiTipo(tipo);
    setWifiPessoasOuUnidades(
      tipo === "esim" ? pessoas : Math.max(1, Math.ceil(pessoas / WIFI_TAMANHO_GRUPO)),
    );
  }

  // Ingressos e experiências - o vendedor marca quais parques/experiências
  // o cliente quer (nenhum vem pré-selecionado); cada um marcado entra como
  // candidato do preenchimento por orçamento, igual aos outros
  // complementares. Premier Access (Disney) e Express Pass (USJ) são
  // acréscimos opcionais sobre o ingresso base.
  const [ingressosSelecionados, setIngressosSelecionados] = useState<Set<IngressoKey>>(new Set());
  // Premier Access é vendido por atração (preço médio ponderado das
  // faixas reais ¥1.000-3.500/atração) — o vendedor escolhe a quantidade,
  // não um pacote fechado. Express Pass da USJ tem 3 produtos oficiais
  // com preços bem diferentes entre si.
  const [premierAccessAtracoes, setPremierAccessAtracoes] = useState(0);
  const [usjExpressPassTier, setUsjExpressPassTier] = useState<
    "nenhum" | "4" | "5" | "7" | "8" | "premium"
  >("nenhum");
  const [mostrarDetalhesUsjExpressPass, setMostrarDetalhesUsjExpressPass] = useState(false);
  const [mostrarTabelaComparativaUsj, setMostrarTabelaComparativaUsj] = useState(false);
  // Serviços adicionais (ex.: transporte de malas inter-municipal) — mesmo
  // padrão de seleção dos ingressos. Pedido do Wilson, 10/set/2026.
  const [servicosAdicionaisSelecionados, setServicosAdicionaisSelecionados] = useState<
    Set<ServicoAdicionalKey>
  >(new Set());

  function alternarIngresso(key: IngressoKey) {
    setIngressosSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  }

  function alternarServicoAdicional(key: ServicoAdicionalKey) {
    setServicosAdicionaisSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  }

  function alternarDestino(key: DestinoKey) {
    setDestinosSelecionados((atual) =>
      atual.includes(key) ? atual.filter((k) => k !== key) : [...atual, key],
    );
  }

  // Seletor manual de cidades (sem Tema ativo) — até MAX_CIDADES_ROTEIRO
  // slots posicionais, cada um com seu próprio <select>.
  function substituirDestinoManual(indice: number, novaCidade: DestinoKey) {
    setDestinosSelecionados((atual) => atual.map((k, i) => (i === indice ? novaCidade : k)));
  }

  function removerDestinoManual(indice: number) {
    setDestinosSelecionados((atual) => atual.filter((_, i) => i !== indice));
  }

  function adicionarDestinoManual() {
    setDestinosSelecionados((atual) => {
      if (atual.length >= MAX_CIDADES_ROTEIRO) return atual;
      const proxima = DESTINOS.find((d) => !atual.includes(d.key))?.key;
      return proxima ? [...atual, proxima] : atual;
    });
  }

  function alternarExtensao(key: ExtensaoInternacionalKey) {
    setExtensoesSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  }

  function definirCategoriaExtensao(key: ExtensaoInternacionalKey, categoria: CategoriaHotelExtensao) {
    setExtensaoCategoriaHotel((atual) => ({ ...atual, [key]: categoria }));
  }

  // Até 3 temas podem ficar ativos ao mesmo tempo (misturar Automobilismo +
  // Gastronomia, por exemplo). Cada clique liga/desliga um tema; ao atingir
  // o limite, um 4º clique é ignorado. As cidades marcadas viram a união
  // das cidades "padrao" de todos os temas ativos — perde ajustes manuais
  // de cidade feitos antes, igual já acontecia com 1 tema só. "Sem Tema"
  // (temaKey null) limpa tudo e volta pra Tokyo, igual ao estado inicial.
  // "Parques & Entretenimento" continua auto-marcando os ingressos
  // correspondentes quando entra no conjunto de temas ativos.
  function alternarTema(temaKey: TemaKey | null) {
    if (temaKey === null) {
      setTemasSelecionados(new Set());
      setDestinosSelecionados(["tokyo"]);
      return;
    }

    const novo = new Set(temasSelecionados);
    if (novo.has(temaKey)) {
      novo.delete(temaKey);
    } else if (novo.size < MAX_TEMAS_SIMULTANEOS) {
      novo.add(temaKey);
    } else {
      return; // já tem 3 temas ativos — ignora até o vendedor desmarcar algum
    }
    setTemasSelecionados(novo);

    const cidadesUniao: DestinoKey[] = [];
    novo.forEach((key) => {
      const tema = TEMAS.find((t) => t.key === key);
      // Roteiro Clássico soma Fuji e Hakone automaticamente quando o
      // roteiro passa de 10 dias — pedido do Wilson, 08/set/2026.
      const ehRoteiroClassicoLongo = key === "roteiroClassico" && dias > 10;
      tema?.cidades
        .filter((c) => c.padrao || (ehRoteiroClassicoLongo && (c.key === "fuji" || c.key === "hakone")))
        .forEach((c) => {
          if (!cidadesUniao.includes(c.key)) cidadesUniao.push(c.key);
        });
    });
    setDestinosSelecionados(cidadesUniao.length > 0 ? cidadesUniao : ["tokyo"]);

    if (novo.has("parquesEntretenimento")) {
      setIngressosSelecionados((atual) => {
        const novoIngressos = new Set(atual);
        novoIngressos.add("disneyland");
        novoIngressos.add("disneysea");
        novoIngressos.add("usj");
        return novoIngressos;
      });
    }
  }

  // Média dos multiplicadores das cidades marcadas — mesmo critério do
  // calculador do Personalizado (multiplicadorCidadeHotel, em
  // CustomPackageCard.tsx); 1 (sem ajuste) se nenhuma cidade estiver marcada.
  const multiplicadorCidade =
    destinosSelecionados.length === 0
      ? 1
      : destinosSelecionados.reduce(
          (soma, key) => soma + CIDADE_MULTIPLICADOR_HOTEL[key],
          0,
        ) / destinosSelecionados.length;
  const nomesDestinos = destinosSelecionados
    .map((key) => DESTINOS.find((d) => d.key === key)?.nome ?? key)
    .join(" · ");

  // Média dos multiplicadores de temporada das cidades marcadas — cidades
  // fora de TEMPORADA_MULTIPLICADOR_HOTEL entram como 1.0 (sem pesquisa).
  const multiplicadorTemporada =
    destinosSelecionados.length === 0
      ? 1
      : destinosSelecionados.reduce(
          (soma, key) => soma + (TEMPORADA_MULTIPLICADOR_HOTEL[key]?.[temporada] ?? 1),
          0,
        ) / destinosSelecionados.length;

  // União das cidades de todos os temas ativos, com os destaques de cada
  // tema que recomenda aquela cidade (uma cidade recomendada por 2 temas
  // mostra os 2 destaques). notaIngresso vem do primeiro tema ativo que
  // define esse aviso pra cidade (hoje só existe em Automobilismo).
  const cidadesTemasAtivos = useMemo(() => {
    const mapa = new Map<
      DestinoKey,
      { key: DestinoKey; destaques: { tema: string; texto: string }[]; notaIngresso?: string }
    >();
    temasSelecionados.forEach((temaKey) => {
      const tema = TEMAS.find((t) => t.key === temaKey);
      if (!tema) return;
      tema.cidades.forEach((c) => {
        const atual = mapa.get(c.key);
        if (atual) {
          atual.destaques.push({ tema: tema.nome, texto: c.destaque });
          if (c.notaIngresso && !atual.notaIngresso) atual.notaIngresso = c.notaIngresso;
        } else {
          mapa.set(c.key, {
            key: c.key,
            destaques: [{ tema: tema.nome, texto: c.destaque }],
            notaIngresso: c.notaIngresso,
          });
        }
      });
    });
    return Array.from(mapa.values());
  }, [temasSelecionados]);

  // Estimativa de dias mínimos pra dar tempo de fazer tudo: 1 dia por
  // cidade selecionada (base de deslocamento/city sightseeing) + 1 dia
  // extra por parque de dia inteiro (Disney/USJ — teamLab é meio período
  // e cabe dentro de um dia de cidade). É uma estimativa pra alertar o
  // vendedor, não um cálculo de roteiro dia a dia.
  const diasParquesDiaInteiro = (["disneyland", "disneysea", "usj"] as const).filter((k) =>
    ingressosSelecionados.has(k),
  ).length;
  const diasMinimosSugeridos = Math.max(1, destinosSelecionados.length) + diasParquesDiaInteiro;
  const diasInsuficientes = dias < diasMinimosSugeridos;

  const resultado = useMemo(() => {
    const precoRoteiro =
      ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
    const precoAereoEconomy = aereoManual
      ? Math.round(aereoValorManual * pessoas)
      : PRECO_AEREO_ECONOMY_BRL * pessoas;
    const precoAereoPremiumEconomy = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_PREMIUM_ECONOMY_USD * cambioCotacao * pessoas);
    const precoAereoBusiness = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas);
    const precoAereoFirst = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas);

    function precoClasseAereo(classe: (typeof CLASSES_AEREO)[number]) {
      if (classe === "First Class") return precoAereoFirst;
      if (classe === "Business") return precoAereoBusiness;
      if (classe === "Premium Economy") return precoAereoPremiumEconomy;
      return precoAereoEconomy;
    }

    function precoHotel(
      categoria: (typeof CATEGORIAS_HOTEL)[number],
      multTemporada: number = multiplicadorTemporada,
    ) {
      if (hotelManual) return Math.round(hotelDiariaManual * dias);
      return Math.round(
        DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multiplicadorCidade * multTemporada * pessoas,
      );
    }

    // Simula em qual categoria de hotel o preenchimento automático pararia
    // com um multiplicador de temporada diferente do real — usado só pra
    // comparar com "fora de alta temporada" (multiplicador 1) e avisar
    // quando a alta temporada obriga a rebaixar a categoria pra caber no
    // orçamento.
    function categoriaHotelComMultiplicador(multTemporada: number) {
      if (hotelManual) return hotelCategoriaManual;
      let categoria: (typeof CATEGORIAS_HOTEL)[number] = "3 estrelas";
      let gastoSimulado = precoRoteiro + precoAereoEconomy + precoHotel("3 estrelas", multTemporada);
      const indiceMaximoHotel = CATEGORIAS_HOTEL.indexOf(hotelCategoriaMaxima);
      for (const cat of ["4 estrelas", "5 estrelas", "Elite"] as const) {
        if (CATEGORIAS_HOTEL.indexOf(cat) > indiceMaximoHotel) break;
        const precoAtual = precoHotel(categoria, multTemporada);
        const precoNovo = precoHotel(cat, multTemporada);
        const diferenca = precoNovo - precoAtual;
        if (gastoSimulado + diferenca <= orcamento) {
          gastoSimulado += diferenca;
          categoria = cat;
        } else break;
      }
      return categoria;
    }

    // Seguro Viagem é item fixo/obrigatório no pacote — igual Roteiro,
    // Aéreo e Hotel — pedido do Wilson, 08/set/2026: "no pacote final,
    // seguro viagem deve ser obrigatorio igual roteiro personalizado".
    const precoSeguro = DIARIA_SEGURO_VIAGEM * dias * pessoas;

    const incluidos: ItemPacote[] = [
      {
        chave: "roteiro",
        label: "Roteiro Personalizado",
        detalhe: [
          "Painel digital Ajisai com o roteiro dia a dia.",
          "Atrações, deslocamentos, refeições e informações práticas dos aeroportos.",
          "Sob medida para o grupo e acessível pelo celular durante toda a viagem.",
        ],
        precoBRL: precoRoteiro,
      },
      {
        chave: "aereo",
        label: "Aéreo — Economy",
        detalhe: [
          `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}.`,
          "Bagagem despachada incluída conforme a franquia da companhia aérea.",
        ],
        precoBRL: precoAereoEconomy,
      },
      {
        chave: "hotel",
        label: "Hotel — 3 estrelas",
        detalhe: [`${dias} diárias`, tipoQuarto, "Categoria mínima"],
        precoBRL: precoHotel("3 estrelas"),
      },
      {
        chave: "seguro",
        label: "Seguro Viagem",
        detalhe: [
          "Cobertura médico-hospitalar (mínimo US$ 30 mil, com upgrade para US$ 60 mil).",
          "Bagagem extraviada, cancelamento de viagem e assistência 24h em português.",
          `${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        ],
        precoBRL: precoSeguro,
      },
    ];

    let gasto = incluidos.reduce((soma, item) => soma + item.precoBRL, 0);
    // No modo manual a diária não varia por categoria — a categoria final é
    // a que o vendedor escolheu manualmente (hotelCategoriaManual), não
    // necessariamente "3 estrelas".
    let categoriaHotelFinal: (typeof CATEGORIAS_HOTEL)[number] = hotelManual
      ? hotelCategoriaManual
      : "3 estrelas";
    let classeAereoFinal: (typeof CLASSES_AEREO)[number] = "Economy";

    function cabe(valor: number) {
      return gasto + valor <= orcamento;
    }

    // 1) Upgrade de hotel, categoria por categoria (não pula nível) — pulado
    // quando a diária é manual, já que o valor não varia por categoria.
    if (!hotelManual) {
      const indiceMaximoHotel = CATEGORIAS_HOTEL.indexOf(hotelCategoriaMaxima);
      for (const categoria of ["4 estrelas", "5 estrelas", "Elite"] as const) {
        if (CATEGORIAS_HOTEL.indexOf(categoria) > indiceMaximoHotel) break;
        const precoAtual = precoHotel(categoriaHotelFinal);
        const precoNovo = precoHotel(categoria);
        const diferenca = precoNovo - precoAtual;
        if (cabe(diferenca)) {
          gasto += diferenca;
          categoriaHotelFinal = categoria;
        } else break;
      }
    }

    // Categoria que o preenchimento automático alcançaria fora de alta
    // temporada (multiplicador 1), pro mesmo orçamento — só calculado
    // quando faz diferença (fora do modo manual, e fora de "baixa", já que
    // aí o multiplicador real já é 1).
    const categoriaHotelForaDeTemporada =
      !hotelManual && temporada !== "baixa" ? categoriaHotelComMultiplicador(1) : categoriaHotelFinal;
    const avisoCategoriaTemporada =
      !hotelManual &&
      temporada !== "baixa" &&
      CATEGORIAS_HOTEL.indexOf(categoriaHotelFinal) < CATEGORIAS_HOTEL.indexOf(categoriaHotelForaDeTemporada)
        ? `Categoria de hotel ajustada de ${categoriaHotelForaDeTemporada} para ${categoriaHotelFinal} para caber no orçamento nesta temporada.`
        : null;

    // 1.5) Extensões internacionais (Coréia do Sul / China) — dias somam
    // ao total da viagem. Categoria de hotel (3/4/5 estrelas) escolhida de
    // forma independente por extensão, mais o deslocamento (voo/trem) de
    // cada trecho. Item fixo assim que o card é ativado (não passa pelo
    // preenchimento automático por orçamento). precosExtensaoPorCategoria
    // guarda o preço das 3 categorias pra cada extensão selecionada, pra
    // UI mostrar os 3 pacotes lado a lado antes do vendedor escolher.
    function precoHotelExtensao(
      extensao: (typeof EXTENSOES_INTERNACIONAIS)[number],
      categoria: CategoriaHotelExtensao,
    ) {
      return extensao.cidades.reduce(
        (soma, cidade) =>
          soma +
          Math.round(
            DIARIA_HOTEL_EXTENSAO_USD[cidade.key][categoria] *
              cidade.dias *
              FATOR_QUARTO[tipoQuarto] *
              pessoas *
              cambioCotacao,
          ),
        0,
      );
    }
    function precoDeslocamentoExtensao(extensao: (typeof EXTENSOES_INTERNACIONAIS)[number]) {
      return extensao.deslocamento.reduce(
        (soma, trecho) => soma + Math.round(trecho.precoUSDPax * cambioCotacao * pessoas),
        0,
      );
    }

    const precosExtensaoPorCategoria = {} as Record<
      ExtensaoInternacionalKey,
      Record<CategoriaHotelExtensao, { hotel: number; deslocamento: number; total: number }>
    >;

    extensoesSelecionadas.forEach((key) => {
      const extensao = EXTENSOES_INTERNACIONAIS.find((e) => e.key === key);
      if (!extensao) return;
      const deslocamento = precoDeslocamentoExtensao(extensao);
      const porCategoria = {} as Record<CategoriaHotelExtensao, { hotel: number; deslocamento: number; total: number }>;
      CATEGORIAS_HOTEL_EXTENSAO.forEach((categoria) => {
        const hotel = precoHotelExtensao(extensao, categoria);
        porCategoria[categoria] = { hotel, deslocamento, total: hotel + deslocamento };
      });
      precosExtensaoPorCategoria[key] = porCategoria;

      const categoriaEscolhida = extensaoCategoriaHotel[key];
      const precoExtensao = porCategoria[categoriaEscolhida].total;
      gasto += precoExtensao;
      incluidos.push({
        chave: `extensao-${extensao.key}`,
        label: `Extensão ${extensao.nome} — ${categoriaEscolhida} (${extensao.cidades.map((c) => c.nome).join(" + ")})`,
        detalhe: [
          `Hotel ${categoriaEscolhida} · +${extensao.dias} dias · ${tipoQuarto} — ${formatBRL(porCategoria[categoriaEscolhida].hotel)}`,
          ...extensao.deslocamento.map(
            (trecho) => `${trecho.label} — ${formatBRL(Math.round(trecho.precoUSDPax * cambioCotacao * pessoas))}`,
          ),
          "Seguro e guia dessa extensão cotados à parte, por enquanto.",
        ],
        precoBRL: precoExtensao,
      });
    });

    // 2) Complementares essenciais (transporte, seguro, guia)
    const precoTransporte = DIARIA_TRANSPORTE * dias;
    const transporteRecomendado = cabe(precoTransporte);
    if (transporteRecomendado) gasto += precoTransporte;
    incluidos.push({
      label: "Transporte",
      detalhe: [
        "Transfers e deslocamentos privados do roteiro (aeroporto, entre cidades e até as atrações).",
        "Van dedicada — Toyota Alphard ou Hiace, conforme tamanho do grupo/bagagem.",
        `Sem compartilhar veículo com outros grupos — ${dias} dias.`,
        "Não inclui o transfer de ônibus (limousine bus) aeroporto ↔ centro de Tóquio, cotado à parte.",
      ],
      precoBRL: precoTransporte,
      recomendado: transporteRecomendado,
    });

    const precoGuia = Math.round(
      DIARIA_GUIA_USD * guiaDias * Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO)) * cambioCotacao,
    );
    if (guiaDias > 0) {
      const guiaRecomendado = cabe(precoGuia);
      if (guiaRecomendado) gasto += precoGuia;
      incluidos.push({
        chave: "guia",
        label: "Guia Turístico",
        detalhe: [
          "Guia particular fluente em português acompanhando o roteiro.",
          "Ajuda com trajetos, horários e filas.",
          `US$ ${DIARIA_GUIA_USD}/dia a cada ${GUIA_TAMANHO_GRUPO} pessoas`,
          `${guiaDias} de ${dias} dia${dias === 1 ? "" : "s"} da viagem`,
        ],
        precoBRL: precoGuia,
        recomendado: guiaRecomendado,
      });
    }

    // 3) JR Pass — faixa de dias e classe escolhidas pelo vendedor; só
    // entra quantidade de gente que realmente compra o passe (editável,
    // pode ser menor que `pessoas`).
    const tabelaJrPass = jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD;
    const precoJrPass = Math.round(tabelaJrPass[jrPassDias] * cambioCotacao * jrPassPessoas);
    if (jrPassPessoas > 0) {
      const jrPassRecomendado = cabe(precoJrPass);
      if (jrPassRecomendado) gasto += precoJrPass;
      incluidos.push({
        chave: "jrpass",
        label: `JR Pass — ${jrPassDias} dias${jrPassClasse === "green" ? " · Green Car" : ""}`,
        detalhe: [
          "Passe ferroviário JR, com deslocamentos ilimitados nas linhas JR.",
          `Incluindo a maioria dos trens-bala (Shinkansen)${jrPassClasse === "green" ? ", classe Green Car" : ""}.`,
          `Durante ${jrPassDias} dias corridos de validade.`,
          `${jrPassPessoas} de ${pessoas} viajante${pessoas === 1 ? "" : "s"} · tabela ${JR_PASS_TABELA_VALIDADE}`,
        ],
        precoBRL: precoJrPass,
        recomendado: jrPassRecomendado,
      });
    }

    // 4) Wi-fi — eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado).
    // wifiPessoasOuUnidades é editável: pessoas cobertas (eSIM) ou
    // quantidade de aparelhos (Pocket Wi-Fi).
    const precoWifi =
      wifiTipo === "esim"
        ? Math.round(DIARIA_ESIM_USD_PAX * dias * wifiPessoasOuUnidades * cambioCotacao)
        : Math.round(DIARIA_POCKET_WIFI_USD * dias * Math.max(0, wifiPessoasOuUnidades) * cambioCotacao);
    if (wifiPessoasOuUnidades > 0) {
      const wifiRecomendado = cabe(precoWifi);
      if (wifiRecomendado) gasto += precoWifi;
      incluidos.push({
        chave: "wifi",
        label: wifiTipo === "esim" ? "eSIM" : "Pocket Wi-Fi",
        detalhe:
          wifiTipo === "esim"
            ? [
                "eSIM com conexão 5G direto no celular de cada viajante.",
                "Sem aparelho extra pra carregar.",
                `${wifiPessoasOuUnidades} de ${pessoas} viajante${pessoas === 1 ? "" : "s"} · ${dias} dias`,
              ]
            : [
                "Pocket Wi-Fi — aparelho físico compartilhado entre o grupo.",
                `${wifiPessoasOuUnidades} aparelho${wifiPessoasOuUnidades === 1 ? "" : "s"} (até ${WIFI_TAMANHO_GRUPO} pessoas por unidade).`,
                `${dias} dias`,
              ],
        precoBRL: precoWifi,
        recomendado: wifiRecomendado,
      });
    }

    // 5) Upgrade de classe do voo — pulado quando o valor da passagem é manual.
    if (!aereoManual) {
      const indiceMaximoAereo = CLASSES_AEREO.indexOf(classeAereoMaxima);
      for (const classe of ["Premium Economy", "Business", "First Class"] as const) {
        if (CLASSES_AEREO.indexOf(classe) > indiceMaximoAereo) break;
        const precoAtual = precoClasseAereo(classeAereoFinal);
        const precoNovo = precoClasseAereo(classe);
        const diferenca = precoNovo - precoAtual;
        if (cabe(diferenca)) {
          gasto += diferenca;
          classeAereoFinal = classe;
        } else break;
      }
    }

    // 6) Motorista Privado (upgrade sobre o transporte compartilhado)
    const precoMotorista = Math.round(
      DIARIA_MOTORISTA_PRIVADO_USD *
        dias *
        Math.max(1, Math.ceil(pessoas / MOTORISTA_TAMANHO_GRUPO)) *
        cambioCotacao,
    );
    const motoristaRecomendado = cabe(precoMotorista);
    if (motoristaRecomendado) gasto += precoMotorista;
    incluidos.push({
      chave: "motorista",
      label: "Motorista Privado",
      detalhe: [
        "Motorista particular à disposição do grupo, sem compartilhar veículo.",
        "Mais privacidade e flexibilidade de horário que o transporte padrão do roteiro.",
        `US$ ${DIARIA_MOTORISTA_PRIVADO_USD}/dia para até ${MOTORISTA_TAMANHO_GRUPO} pessoas`,
      ],
      precoBRL: precoMotorista,
      recomendado: motoristaRecomendado,
    });

    // 7) Câmbio no Brasil
    const cotacaoIeneAtual = cambioIene?.cotacaoBRLPorJPY ?? COTACAO_FALLBACK_BRL_POR_JPY;
    const precoIenes = Math.round(quantidadeIenes * cotacaoIeneAtual * SPREAD_CAMBIO_IENE);
    const nomeCidadeCambio =
      CIDADES_CAMBIO_IENE.find((c) => c.slug === cambioIeneCidade)?.nome ?? cambioIeneCidade;
    const precoCambioTotal = PRECO_CAMBIO_BRASIL + precoIenes;
    const cambioRecomendado = cabe(precoCambioTotal);
    if (cambioRecomendado) gasto += precoCambioTotal;
    incluidos.push({
      chave: "cambio",
      label: "Câmbio no Brasil",
      detalhe: [
        `¥ ${quantidadeIenes.toLocaleString("pt-BR")} em espécie — cotação de ${nomeCidadeCambio} + spread de 15%.`,
        "Retirada de ienes em espécie ainda no Brasil, com cotação fechada antes do embarque.",
        "Evita depender só de caixas eletrônicos ou casas de câmbio no Japão nos primeiros dias de viagem.",
      ],
      precoBRL: precoCambioTotal,
      recomendado: cambioRecomendado,
    });

    // 8) Ingressos e experiências — só entram os parques marcados pelo
    // vendedor (nenhum vem por padrão). Premier Access (Disney, por
    // atração) e Express Pass (USJ, por tier — cada um com preço
    // diferente) somam ao ingresso base do parque correspondente.
    for (const ingresso of CATALOGO_INGRESSOS) {
      if (!ingressosSelecionados.has(ingresso.key)) continue;
      const ehDisney = ingresso.key === "disneyland" || ingresso.key === "disneysea";
      let precoFastPassUSD = 0;
      let nomeFastPass = "";
      if (ehDisney && premierAccessAtracoes > 0) {
        precoFastPassUSD = PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX * premierAccessAtracoes;
        nomeFastPass = `Premier Access (${premierAccessAtracoes} ${premierAccessAtracoes === 1 ? "atração" : "atrações"})`;
      } else if (ingresso.key === "usj" && usjExpressPassTier !== "nenhum") {
        precoFastPassUSD =
          usjExpressPassTier === "4"
            ? PRECO_EXPRESS_PASS_USJ_4_USD_PAX
            : usjExpressPassTier === "5"
              ? PRECO_EXPRESS_PASS_USJ_5_USD_PAX
              : usjExpressPassTier === "7"
                ? PRECO_EXPRESS_PASS_USJ_7_USD_PAX
                : usjExpressPassTier === "8"
                  ? PRECO_EXPRESS_PASS_USJ_8_USD_PAX
                  : PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX;
        nomeFastPass = `Express Pass ${usjExpressPassTier === "premium" ? "Premium" : usjExpressPassTier}`;
      }
      const temFastPass = precoFastPassUSD > 0;
      const precoIngresso = Math.round(
        (ingresso.precoUSD + precoFastPassUSD) * pessoas * cambioCotacao,
      );
      const ingressoRecomendado = cabe(precoIngresso);
      if (ingressoRecomendado) gasto += precoIngresso;
      incluidos.push({
        chave: `ingresso-${ingresso.key}`,
        label: `Ingresso — ${ingresso.nome}${temFastPass ? ` + ${nomeFastPass}` : ""}`,
        detalhe: [
          "Ingresso de 1 dia, por pessoa.",
          ...(temFastPass
            ? [`+ ${nomeFastPass} — fast pass pago à parte.`, "Pula fila nas atrações participantes."]
            : []),
        ],
        precoBRL: precoIngresso,
        recomendado: ingressoRecomendado,
      });
    }

    // 8.5) Serviços adicionais (ex.: transporte de malas inter-municipal)
    // — mesmo padrão dos ingressos: marcado pelo vendedor, entra como
    // candidato do preenchimento por orçamento. "porTrecho" multiplica
    // pelo número de trechos entre cidades do roteiro (destinos - 1,
    // mínimo 1) além de pessoas.
    const trechosEntreCidades = Math.max(1, destinosSelecionados.length - 1);
    for (const servico of CATALOGO_SERVICOS_ADICIONAIS) {
      if (!servicosAdicionaisSelecionados.has(servico.key)) continue;
      const multiplicadorTrecho = servico.porTrecho ? trechosEntreCidades : 1;
      const precoServico = Math.round(servico.precoUSD * pessoas * multiplicadorTrecho * cambioCotacao);
      const servicoRecomendado = cabe(precoServico);
      if (servicoRecomendado) gasto += precoServico;
      incluidos.push({
        chave: `servico-${servico.key}`,
        label: servico.nome,
        detalhe: [
          servico.descricao,
          servico.porTrecho
            ? `${pessoas} ${pessoas === 1 ? "mala" : "malas"} × ${trechosEntreCidades} ${trechosEntreCidades === 1 ? "trecho" : "trechos"} entre cidades.`
            : `${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}.`,
        ],
        precoBRL: precoServico,
        recomendado: servicoRecomendado,
      });
    }

    // 9) Reserva de Restaurantes High-End
    if (pessoas <= RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
      const precoRestaurantes = Math.round(PRECO_RESTAURANTES_HIGHEND_USD * cambioCotacao);
      const restaurantesRecomendado = cabe(precoRestaurantes);
      if (restaurantesRecomendado) gasto += precoRestaurantes;
      incluidos.push({
        label: "Reserva de Restaurantes High-End",
        detalhe: [
          `Pacote fechado de ${RESTAURANTES_HIGHEND_QTD} reservas em restaurantes Michelin/Tabelog Awards ou equivalente.`,
          `Até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas.`,
        ],
        precoBRL: precoRestaurantes,
        recomendado: restaurantesRecomendado,
      });
    }

    // Atualiza os itens fixos de hotel/aéreo com a categoria/classe final
    incluidos[1] = {
      chave: "aereo",
      label: aereoManual ? "Aéreo — valor manual" : `Aéreo — ${classeAereoFinal}`,
      detalhe: [
        `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}.`,
        "Bagagem despachada incluída conforme a franquia da companhia aérea.",
      ],
      precoBRL: precoClasseAereo(classeAereoFinal),
    };
    incluidos[2] = {
      chave: "hotel",
      label: hotelManual
        ? `Hotel — ${categoriaHotelFinal} (valor manual)`
        : `Hotel — ${categoriaHotelFinal}`,
      detalhe: [`${dias} diárias`, tipoQuarto, nomesDestinos || "—"],
      precoBRL: precoHotel(categoriaHotelFinal),
    };

    const precoMinimo = precoRoteiro + precoAereoEconomy + precoHotel("3 estrelas") + precoSeguro;
    const saldo = orcamento - gasto;

    return {
      incluidos,
      gasto,
      saldo,
      categoriaHotelFinal,
      classeAereoFinal,
      avisoCategoriaTemporada,
      cabeNoOrcamento: orcamento >= precoMinimo,
      precoMinimo,
      precosExtensaoPorCategoria,
    };
  }, [
    orcamento,
    dias,
    pessoas,
    tipoQuarto,
    multiplicadorCidade,
    multiplicadorTemporada,
    temporada,
    nomesDestinos,
    extensoesSelecionadas,
    extensaoCategoriaHotel,
    guiaDias,
    cambioIene,
    cambioIeneCidade,
    quantidadeIenes,
    cambioCotacao,
    hotelManual,
    hotelDiariaManual,
    hotelCategoriaManual,
    hotelCategoriaMaxima,
    classeAereoMaxima,
    aereoManual,
    aereoValorManual,
    jrPassDias,
    jrPassClasse,
    jrPassPessoas,
    wifiTipo,
    wifiPessoasOuUnidades,
    ingressosSelecionados,
    premierAccessAtracoes,
    usjExpressPassTier,
    servicosAdicionaisSelecionados,
    destinosSelecionados,
  ]);

  const extensoesLabel = EXTENSOES_INTERNACIONAIS.filter((extensao) => extensoesSelecionadas.has(extensao.key))
    .map((extensao) => `+ ${extensao.dias} dias ${extensao.nome}`)
    .join(" · ");
  const pacoteSugeridoLabel = `Hotel ${resultado.categoriaHotelFinal} · Aéreo ${resultado.classeAereoFinal} · ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}${extensoesLabel ? ` · ${extensoesLabel}` : ""} · orçamento ${formatBRL(orcamento)}`;

  function alternarItem(chave: string) {
    setItensAlterados((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  // item.recomendado ausente = sempre recomendado (itens fixos: Roteiro,
  // Aéreo, Hotel). Um item está selecionado quando seu padrão
  // (recomendado) não foi invertido pelo vendedor em itensAlterados —
  // é assim que um item fora do orçamento (motorista, JR Pass etc.) pode
  // ser marcado manualmente sem nunca sumir da lista.
  function itemRecomendado(item: ItemPacote) {
    return item.recomendado !== false;
  }
  function itemSelecionado(item: ItemPacote) {
    return itemRecomendado(item) !== itensAlterados.has(chaveDoItem(item));
  }

  // Valor efetivo de um item: o ajuste manual, quando existir, sobrescreve
  // o preco calculado automaticamente.
  function valorItem(item: ItemPacote) {
    const ajuste = itemAjustes[chaveDoItem(item)];
    return ajuste ?? item.precoBRL;
  }

  function ajustarValorItem(item: ItemPacote, valor: number) {
    setItemAjustes((atual) => ({ ...atual, [chaveDoItem(item)]: valor }));
  }

  function restaurarValorItem(item: ItemPacote) {
    setItemAjustes((atual) => {
      const novo = { ...atual };
      delete novo[chaveDoItem(item)];
      return novo;
    });
  }

  const itensSelecionados = resultado.incluidos.filter(itemSelecionado);
  const totalCalculado = itensSelecionados.reduce((soma, item) => soma + valorItem(item), 0);
  const totalSelecionado = totalManual ? totalValorManual : totalCalculado;
  const saldoSelecionado = orcamento - totalSelecionado;

  // Cidades marcadas que exigem motorista particular (transporte público
  // insuficiente) mas cujo item "Motorista Privado" não está na proposta
  // final — alerta pro vendedor não fechar um pacote sem transporte viável.
  const motoristaNaProposta = itensSelecionados.some((item) => chaveDoItem(item) === "motorista");
  const cidadesSemMotoristaObrigatorio = motoristaNaProposta
    ? []
    : destinosSelecionados
        .map((key) => ({ key, nota: CIDADE_MOTORISTA_NOTA[key] }))
        .filter((c): c is { key: DestinoKey; nota: NonNullable<(typeof CIDADE_MOTORISTA_NOTA)[DestinoKey]> } =>
          c.nota?.nivel === "obrigatorio",
        );

  const geradoEmLabel = `${geradoEm.toLocaleDateString("pt-BR")} às ${geradoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  async function handleGerarPdf() {
    setGerandoPdf(true);
    try {
      await gerarEBaixarPdf({
        tituloPacote: pacoteSugeridoLabel,
        dias,
        tipoQuarto,
        pessoas,
        geradoEmLabel,
        cambioLabel: cambio
          ? cambio.fallback
            ? `Câmbio estimado: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")} — cotação do Banco Central indisponível no momento.`
            : `Câmbio do dia: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")}${cambio.data ? ` (PTAX Banco Central, ${cambio.data})` : " (PTAX Banco Central)"}`
          : "Cotação do dia indisponível",
        itens: itensSelecionados.map((item) => ({
          chave: chaveDoItem(item),
          label: item.label,
          detalhe: item.detalhe,
          precoBRL: valorItem(item),
        })),
        totalBRL: totalSelecionado,
        orcamentoBRL: orcamento,
        saldoBRL: saldoSelecionado,
      });
    } catch (erro) {
      console.error("Falha ao gerar PDF da proposta:", erro);
      window.alert("Não foi possível gerar o PDF agora. Tente novamente em alguns segundos.");
    } finally {
      setGerandoPdf(false);
    }
  }

  // Arquivo de texto editável (.doc) da proposta — mesmos dados do PDF,
  // pra quando o vendedor precisa editar o texto antes de mandar pro
  // cliente (ajustar valor negociado, remover item, mudar o tom).
  function handleGerarTexto() {
    try {
      gerarEBaixarTexto({
        tituloPacote: pacoteSugeridoLabel,
        dias,
        tipoQuarto,
        pessoas,
        geradoEmLabel,
        cambioLabel: cambio
          ? cambio.fallback
            ? `Câmbio estimado: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")} — cotação do Banco Central indisponível no momento.`
            : `Câmbio do dia: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")}${cambio.data ? ` (PTAX Banco Central, ${cambio.data})` : " (PTAX Banco Central)"}`
          : "Cotação do dia indisponível",
        itens: itensSelecionados.map((item) => ({
          chave: chaveDoItem(item),
          label: item.label,
          detalhe: item.detalhe,
          precoBRL: valorItem(item),
        })),
        totalBRL: totalSelecionado,
        orcamentoBRL: orcamento,
        saldoBRL: saldoSelecionado,
      });
    } catch (erro) {
      console.error("Falha ao gerar arquivo de texto da proposta:", erro);
      window.alert("Não foi possível gerar o arquivo de texto agora. Tente novamente em alguns segundos.");
    }
  }

  const mensagemWhatsapp = [
    `Proposta Ajisai — ${pacoteSugeridoLabel}`,
    "",
    ...itensSelecionados.map((item) => `• ${item.label}: ${formatBRL(valorItem(item))}`),
    "",
    `Total: ${formatBRL(totalSelecionado)}${totalManual ? " (ajustado manualmente)" : ""}`,
    cambio
      ? `Câmbio do dia: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")}${cambio.data ? ` (PTAX Banco Central, ${cambio.data})` : ""}`
      : "",
    `Gerado em ${geradoEmLabel} — Ajisai`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <main className="min-h-screen bg-white px-5 pt-12 pb-32 text-[#0A2540] sm:px-8 md:px-16 md:pt-16 md:pb-36">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <img
            src="/images/ajisai-group-logo-crop.png"
            alt="Ajisai · Alpinea"
            className="h-12 w-auto object-contain md:h-16"
          />
          <Link
            href="/produtos"
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-100"
          >
            ← Voltar para Produtos
          </Link>
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
          Ferramenta interna — não listada no site
        </p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium md:text-4xl`}>
          Calculadora Reversa
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-black/55">
          Informe o orçamento máximo do cliente e a calculadora monta, dentro
          desse valor, a melhor combinação possível de hotel, aéreo e
          serviços — começando pelo essencial e priorizando os upgrades de
          maior impacto na experiência.
        </p>

        {/* ── ENTRADAS ── */}
        <div className="mt-8 grid gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:grid-cols-2 md:p-8">
          <label className="flex h-full flex-col sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="1. Orçamento máximo (R$)" />
            </span>
            <input
              type="number"
              min={MIN_ORCAMENTO_BRL}
              max={MAX_ORCAMENTO_BRL}
              step={500}
              value={orcamento}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) setOrcamento(v);
              }}
              className="h-12 w-full rounded-lg border border-black/15 bg-black/[0.03] px-4 text-lg font-medium outline-none focus:border-black/30"
            />
            {cambio && (
              <span className="mt-1.5 text-[11px] text-black/40">
                ≈ {formatUSD(orcamento / cambioCotacao)}
              </span>
            )}
          </label>

          <NumberStepper
            label="2. Quantidade de dias"
            value={dias}
            onChange={setDias}
            min={MIN_DIAS}
            max={MAX_DIAS}
            formatValue={(v) => `${v} dias`}
          />

          <NumberStepper
            label="3. Número de pessoas"
            value={pessoas}
            onChange={setPessoas}
            min={MIN_PESSOAS}
            max={MAX_PESSOAS}
            formatValue={(v) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`}
          />

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
              <LabelNumerado texto="4. Tipo de quarto" />
            </span>
            <select
              value={tipoQuarto}
              onChange={(e) => setTipoQuarto(e.target.value as (typeof TIPOS_QUARTO)[number])}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
            >
              {TIPOS_QUARTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <VolumeSlider
            label="5. Categoria máxima de hotel"
            opcoes={CATEGORIAS_HOTEL}
            value={hotelCategoriaMaxima}
            onChange={setHotelCategoriaMaxima}
            nota={
              hotelManual
                ? "Diária manual — este teto não se aplica"
                : hotelCategoriaMaxima === "Elite"
                  ? "Sem limite — sobe o máximo que o orçamento permitir"
                  : `Preenchimento automático não passa de ${hotelCategoriaMaxima}, mesmo sobrando orçamento`
            }
          />

          <VolumeSlider
            label="6. Classe máxima do voo"
            opcoes={CLASSES_AEREO}
            value={classeAereoMaxima}
            onChange={setClasseAereoMaxima}
            nota={
              aereoManual
                ? "Valor manual — este teto não se aplica"
                : classeAereoMaxima === "First Class"
                  ? "Sem limite — sobe o máximo que o orçamento permitir"
                  : `Preenchimento automático não passa de ${classeAereoMaxima}, mesmo sobrando orçamento`
            }
          />

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="7. Temporada" />
            </span>
            <div className="flex flex-wrap gap-2">
              {TEMPORADAS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemporada(t.key)}
                  className={`flex w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                    temporada === t.key
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                      : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.icone} alt="" className="h-20 w-20 shrink-0" />
                  <span>{t.nome}</span>
                  <span className="text-[10px] font-normal normal-case tracking-normal text-black/40">
                    {t.periodo}
                  </span>
                </button>
              ))}
            </div>
            {destinosSelecionados.includes("niseko") && temporada !== "inverno" && (
              <p className="mt-1.5 max-w-md text-[11px] leading-4 text-amber-600">
                ⚠️ Niseko é destino de esqui — dez.–fev. é a alta temporada real (turismo de
                neve), com diárias bem acima da temporada verde (Ano Novo pode passar disso
                ainda mais). Selecione o card &quot;Inverno&quot; para refletir isso no preço, ou
                ajuste a diária de hotel manualmente.
              </p>
            )}

            <span className="mb-2 mt-6 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="8. Temas" /> <span className="normal-case tracking-normal text-black/35">(selecione até {MAX_TEMAS_SIMULTANEOS} pra misturar)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => alternarTema(null)}
                className={`flex w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                  temasSelecionados.size === 0
                    ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                    : "border-red-200 bg-red-50 text-red-700/70 hover:border-red-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/temas/01-sem-tema.png" alt="" className="h-20 w-20 shrink-0" />
                Sem tema
              </button>
              {TEMAS.map((tema) => {
                const marcado = temasSelecionados.has(tema.key);
                const desabilitado = !marcado && temasSelecionados.size >= MAX_TEMAS_SIMULTANEOS;
                return (
                  <button
                    key={tema.key}
                    type="button"
                    onClick={() => alternarTema(tema.key)}
                    disabled={desabilitado}
                    className={`flex w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                      marcado
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : desabilitado
                          ? "cursor-not-allowed border-black/10 bg-black/[0.02] text-black/30"
                          : tema.key === "roteiroClassico"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700/80 hover:border-emerald-300"
                            : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tema.icone}
                      alt=""
                      className={`h-20 w-20 shrink-0 ${desabilitado ? "opacity-40" : ""}`}
                    />
                    {tema.nome}
                  </button>
                );
              })}
            </div>

            {temasSelecionados.size === 0 ? (
              <div className="mt-4">
                <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
                  <LabelNumerado texto="9. Cidades do roteiro" />{" "}
                  <span className="normal-case tracking-normal text-black/35">
                    (até {MAX_CIDADES_ROTEIRO})
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {destinosSelecionados.map((cidade, indice) => (
                    <div
                      key={indice}
                      className="relative flex w-32 flex-col items-center justify-center gap-1 rounded-lg border border-black/15 bg-black/[0.03] px-2 py-3"
                    >
                      <CidadeCombobox
                        value={cidade}
                        onChange={(key) => substituirDestinoManual(indice, key)}
                        todasSelecionadas={destinosSelecionados}
                      />
                      {destinosSelecionados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerDestinoManual(indice)}
                          aria-label="Remover cidade"
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black/15 bg-white text-[10px] text-black/40 transition hover:border-red-300 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {destinosSelecionados.length < MAX_CIDADES_ROTEIRO && (
                    <button
                      type="button"
                      onClick={adicionarDestinoManual}
                      className="flex w-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 px-2 py-3 text-center text-xs text-black/50 transition hover:border-[#2f80c9]/50 hover:text-[#2f80c9]"
                    >
                      <span className="text-lg leading-none">+</span>
                      <span>Adicionar cidade</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
                <div className="grid grid-cols-[minmax(140px,auto)_1fr] gap-x-6 bg-[#0A2540] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-white/70">
                  <span className="flex items-center"><LabelNumerado texto="9. Cidades recomendadas" /></span>
                  <span>Destaques do{temasSelecionados.size > 1 ? "s temas" : " tema"}</span>
                </div>
                {cidadesTemasAtivos.map((c) => {
                  const destino = DESTINOS.find((d) => d.key === c.key);
                  const marcado = destinosSelecionados.includes(c.key);
                  const notaMotorista = CIDADE_MOTORISTA_NOTA[c.key];
                  return (
                    <label
                      key={c.key}
                      className="grid cursor-pointer grid-cols-[minmax(140px,auto)_1fr] items-start gap-x-6 gap-y-1 border-t border-black/10 px-4 py-3"
                    >
                      <span className="flex flex-wrap items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => alternarDestino(c.key)}
                          className="h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                        />
                        {destino?.nome ?? c.key}
                        {notaMotorista && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${
                              notaMotorista.nivel === "obrigatorio"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {notaMotorista.nivel === "obrigatorio" ? "Motorista obrigatório" : "Motorista recomendado"}
                          </span>
                        )}
                      </span>
                      <span className="text-xs leading-5 text-black/55">
                        {c.destaques.map((d, i) => (
                          <span key={i} className={i > 0 ? "mt-1 block" : "block"}>
                            <strong className="font-medium text-[#0A2540]">
                              {destino?.nome ?? c.key}
                            </strong>
                            {temasSelecionados.size > 1 && (
                              <span className="text-black/35"> ({d.tema})</span>
                            )}{" "}
                            — {d.texto}
                          </span>
                        ))}
                        {notaMotorista && (
                          <span className="mt-0.5 block text-[11px] font-medium text-red-600">
                            🚗 {notaMotorista.motivo}
                          </span>
                        )}
                        {c.notaIngresso && (
                          <span className="mt-0.5 block text-[11px] font-medium text-red-600">
                            🎫 {c.notaIngresso}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            <span className="mb-2 mt-4 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="10. Extensão internacional" />{" "}
              <span className="normal-case tracking-normal text-black/35">(opcional — soma dias ao total da viagem)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {EXTENSOES_INTERNACIONAIS.map((extensao) => {
                const marcado = extensoesSelecionadas.has(extensao.key);
                return (
                  <button
                    key={extensao.key}
                    type="button"
                    onClick={() => alternarExtensao(extensao.key)}
                    className={`flex w-32 flex-col items-center gap-2 rounded-lg border px-1 py-3 text-center text-xs transition ${
                      marcado
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={extensao.icone} alt="" className="h-24 w-28 shrink-0 object-contain" />
                    <span>{extensao.nome}</span>
                    <span className="text-[10px] font-normal normal-case tracking-normal text-black/40">
                      +{extensao.dias} dias · {extensao.cidades.map((c) => c.nome).join(" + ")}
                    </span>
                  </button>
                );
              })}
            </div>

            {extensoesSelecionadas.size > 0 && (
              <div className="mt-4 space-y-5">
                {EXTENSOES_INTERNACIONAIS.filter((extensao) => extensoesSelecionadas.has(extensao.key)).map(
                  (extensao) => (
                    <div key={extensao.key}>
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#0A2540] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-white/70">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={extensao.icone} alt="" className="h-5 w-6 shrink-0 object-contain" />
                        <span>Roteiro dia a dia — {extensao.nome}</span>
                      </div>

                      <span className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-black/40">
                        Pacote da extensão — hotel {tipoQuarto} + deslocamento
                        {extensao.cidades.map((c) => ` · ${c.nome}`).join("")}
                      </span>
                      <div className="mb-4 grid gap-2 sm:grid-cols-3">
                        {CATEGORIAS_HOTEL_EXTENSAO.map((categoria) => {
                          const precos = resultado.precosExtensaoPorCategoria[extensao.key]?.[categoria];
                          const selecionado = extensaoCategoriaHotel[extensao.key] === categoria;
                          return (
                            <button
                              key={categoria}
                              type="button"
                              onClick={() => definirCategoriaExtensao(extensao.key, categoria)}
                              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                                selecionado
                                  ? "border-[#2f80c9] bg-[#2f80c9]/10"
                                  : "border-black/15 bg-white hover:border-black/30"
                              }`}
                            >
                              <span aria-hidden className="block text-xs leading-none tracking-[1px] text-amber-400">
                                {"★".repeat(parseInt(categoria, 10))}
                              </span>
                              <span
                                className={`mt-1 block text-xs font-medium ${
                                  selecionado ? "text-[#2f80c9]" : "text-black/70"
                                }`}
                              >
                                {categoria}
                              </span>
                              <span className="mt-0.5 block text-sm font-semibold text-black">
                                {precos ? formatBRL(precos.total) : "—"}
                              </span>
                              <span className="mt-0.5 block text-[10px] text-black/40">
                                {precos
                                  ? `Hotel ${formatBRL(precos.hotel)} + deslocamento ${formatBRL(precos.deslocamento)}`
                                  : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-black/40">
                        {extensao.deslocamento.map((trecho) => (
                          <span key={trecho.label}>✈ {trecho.label}</span>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {extensao.roteiro.map((diaInfo) => (
                          <div
                            key={`${extensao.key}-${diaInfo.cidade}-${diaInfo.dia}`}
                            className="overflow-hidden rounded-xl border border-black/10 bg-white"
                          >
                            {diaInfo.imagem ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={diaInfo.imagem}
                                alt=""
                                className="h-36 w-full rounded-t-xl object-cover"
                                style={{ objectPosition: diaInfo.posicaoImagem ?? "center" }}
                              />
                            ) : (
                              <div className="flex h-36 w-full items-center justify-center rounded-t-xl bg-black/5 text-center text-[10px] uppercase tracking-wide text-black/30">
                                Imagem pendente
                              </div>
                            )}
                            <div className="p-3">
                              <p className="text-[9px] uppercase tracking-[0.15em] text-[#2f80c9]">
                                {extensao.cidades.length > 1 ? `${diaInfo.cidade} · ` : ""}Dia {diaInfo.dia}
                              </p>
                              <p className="mt-0.5 text-sm font-medium text-black">{diaInfo.titulo}</p>
                              <ul className="mt-2 space-y-0.5 text-[11px] leading-4 text-black/60">
                                {diaInfo.pontos.map((ponto) => (
                                  <li key={ponto}>• {ponto}</li>
                                ))}
                              </ul>
                              <p className="mt-2 text-[11px] italic leading-4 text-black/45">{diaInfo.conceito}</p>
                              {diaInfo.observacao && (
                                <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium leading-4 text-amber-700">
                                  ⚠️ {diaInfo.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <span className="mt-1.5 block text-[11px] text-black/40">
              {destinosSelecionados.length === 0
                ? "Nenhuma cidade selecionada — diária de hotel sem ajuste de mercado por cidade"
                : `Ajuste de mercado do hotel: ${nomesDestinos} · cidade ${multiplicadorCidade.toFixed(2)}× · temporada ${multiplicadorTemporada.toFixed(2)}×`}
            </span>

            {diasInsuficientes && (
              <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-[11px] font-medium leading-4 text-red-700">
                ⚠️ Com {destinosSelecionados.length} cidade{destinosSelecionados.length === 1 ? "" : "s"}
                {diasParquesDiaInteiro > 0
                  ? ` e ${diasParquesDiaInteiro} parque${diasParquesDiaInteiro === 1 ? "" : "s"} de dia inteiro`
                  : ""}{" "}
                selecionados, o roteiro atual de {dias} dia{dias === 1 ? "" : "s"} tende a ficar
                corrido. Sugestão: pelo menos {diasMinimosSugeridos} dias (estimativa) — considere
                aumentar a duração da viagem ou reduzir cidades/atrações.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="11. JR Pass — validade e classe" />
            </span>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
                <span className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-black/40">
                  Validade
                </span>
                <div className="flex gap-2">
                  {JR_PASS_DIAS_OPCOES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setJrPassDias(d)}
                      className={`flex h-24 w-28 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-center text-sm transition ${
                        jrPassDias === d
                          ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                          : "border-black/15 bg-white text-black/60 hover:border-black/30"
                      }`}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
                <span className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-black/40">
                  Classe
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "comum", label: "Comum (Ordinary)", icone: "/images/ingressos/shinkansen-ordinary.png" },
                      { key: "green", label: "Green Car", icone: "/images/ingressos/jr-green-car.png" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setJrPassClasse(c.key)}
                      className={`flex h-24 w-28 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-center text-xs transition ${
                        jrPassClasse === c.key
                          ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                          : "border-black/15 bg-white text-black/60 hover:border-black/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.icone} alt="" className="h-10 w-10 shrink-0 object-contain" />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {formatUSD(
                (jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD)[jrPassDias],
              )}{" "}
              por pessoa · tabela do fornecedor válida {JR_PASS_TABELA_VALIDADE}
            </span>
            <div className="mt-2 max-w-xs">
              <NumberStepper
                label="Quantas pessoas usam o JR Pass"
                value={jrPassPessoas}
                onChange={setJrPassPessoas}
                min={0}
                max={pessoas}
                formatValue={(v) => `${v} de ${pessoas} viajante${pessoas === 1 ? "" : "s"}`}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="12. Guia Turístico" />
            </span>
            <div className="max-w-xs">
              <NumberStepper
                label="Quantos dias o cliente quer guia"
                value={guiaDias}
                onChange={setGuiaDias}
                min={0}
                max={dias}
                formatValue={(v) => (v === 0 ? "Sem guia" : `${v} de ${dias} dia${dias === 1 ? "" : "s"}`)}
              />
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              US$ {DIARIA_GUIA_USD}/dia a cada {GUIA_TAMANHO_GRUPO} pessoas
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="13. Câmbio de ienes" />
            </span>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col">
                <span className="mb-1 text-[10px] uppercase tracking-wide text-black/40">Cidade</span>
                <select
                  value={cambioIeneCidade}
                  onChange={(e) => setCambioIeneCidade(e.target.value as CidadeCambioIeneSlug)}
                  className="h-10 w-40 rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                >
                  {CIDADES_CAMBIO_IENE.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="mb-1 text-[10px] uppercase tracking-wide text-black/40">
                  Quantidade de ienes (mín. ¥{CAMBIO_IENES_MINIMO.toLocaleString("pt-BR")})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/40">¥</span>
                  <input
                    type="number"
                    value={quantidadeIenes}
                    step={10000}
                    min={CAMBIO_IENES_MINIMO}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isNaN(v)) setQuantidadeIenes(v);
                    }}
                    onBlur={() => setQuantidadeIenes((v) => Math.max(CAMBIO_IENES_MINIMO, v))}
                    className="h-10 w-32 rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                  />
                </div>
              </label>
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {!cambioIene
                ? "Buscando cotação do iene…"
                : cambioIene.fallback
                  ? `Cotação estimada: R$ ${cambioIene.cotacaoBRLPorJPY.toFixed(4).replace(".", ",")} por iene — melhorcambio.com indisponível no momento.`
                  : `Cotação: R$ ${cambioIene.cotacaoBRLPorJPY.toFixed(4).replace(".", ",")} por iene em ${CIDADES_CAMBIO_IENE.find((c) => c.slug === cambioIene.cidade)?.nome} (melhorcambio.com, papel moeda) + spread de 15%.`}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="14. Conexão de internet" />
            </span>
            <div className="flex gap-2">
              {(["esim", "pocket"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => alternarWifiTipo(t)}
                  className={`h-10 rounded-lg border px-4 text-sm transition ${
                    wifiTipo === t
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                      : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                  }`}
                >
                  {t === "esim" ? "eSIM (por pessoa)" : "Pocket Wi-Fi (compartilhado)"}
                </button>
              ))}
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {wifiTipo === "esim"
                ? "Um eSIM por pessoa — tipo Airalo/Holafly, plano ilimitado"
                : `Aparelho compartilhado — até ${WIFI_TAMANHO_GRUPO} pessoas por unidade`}
            </span>
            <div className="mt-2 max-w-xs">
              <NumberStepper
                label={wifiTipo === "esim" ? "Quantas pessoas usam eSIM" : "Quantos aparelhos Pocket Wi-Fi"}
                value={wifiPessoasOuUnidades}
                onChange={setWifiPessoasOuUnidades}
                min={0}
                max={wifiTipo === "esim" ? pessoas : Math.max(1, pessoas)}
                formatValue={(v) =>
                  wifiTipo === "esim"
                    ? `${v} de ${pessoas} viajante${pessoas === 1 ? "" : "s"}`
                    : `${v} aparelho${v === 1 ? "" : "s"}`
                }
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="15. Ingressos e experiências" />
            </span>
            <div className="flex flex-wrap gap-2">
              {CATALOGO_INGRESSOS.map((ingresso) => {
                const marcado = ingressosSelecionados.has(ingresso.key);
                return (
                  <label
                    key={ingresso.key}
                    className={`flex w-28 cursor-pointer flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                      marcado
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarIngresso(ingresso.key)}
                      className="sr-only"
                    />
                    {ingresso.icone ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ingresso.icone}
                        alt=""
                        className={`w-auto max-w-full shrink-0 object-contain ${
                          ingresso.key.startsWith("teamlab") ? "h-9" : "h-16"
                        }`}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/images/icone-ingressos.png"
                        alt=""
                        className="h-14 w-14 shrink-0 object-contain"
                      />
                    )}
                    <span>{ingresso.nome}</span>
                    <span className="text-[10px] font-normal text-black/35">
                      {formatUSD(ingresso.precoUSD)}/pessoa
                    </span>
                  </label>
                );
              })}
            </div>
            {(ingressosSelecionados.has("disneyland") || ingressosSelecionados.has("disneysea")) && (
              <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.02] p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#0A2540]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/ingressos/disneyland-logo.png" alt="" className="h-10 w-auto max-w-[7rem] shrink-0 object-contain" />
                  + Disney Premier Access (fast pass pago)
                </p>
                <p className="mt-0.5 text-[10px] text-black/40">
                  Vendido por atração (¥1.000 a ¥3.500 cada, conforme popularidade) — escolha
                  quantas o cliente quer, não é um pacote fechado.
                </p>
                <div className="mt-2 max-w-xs">
                  <NumberStepper
                    label="Quantidade de atrações"
                    value={premierAccessAtracoes}
                    onChange={setPremierAccessAtracoes}
                    min={0}
                    max={8}
                    formatValue={(v) =>
                      v === 0
                        ? "Sem Premier Access"
                        : `${v} ${v === 1 ? "atração" : "atrações"} · ${formatUSD(
                            v * PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX,
                          )}/pessoa`
                    }
                  />
                </div>
              </div>
            )}
            {ingressosSelecionados.has("usj") && (
              <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.02] p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#0A2540]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/ingressos/usj-logo.png" alt="" className="h-10 w-auto max-w-[7rem] shrink-0 object-contain" />
                  + USJ Express Pass (fast pass pago)
                </p>
                <p className="mt-0.5 text-xs leading-5 text-black/40">
                  <strong className="font-medium text-black/55">Express 4</strong> — fura-fila em 4 atrações (mix de clássicos, ex.: Jurassic World, Minion Mayhem, Harry Potter, Flying Dinosaur — o combo exato varia por temporada).{" "}
                  <strong className="font-medium text-black/55">Express 5</strong> — fura-fila em 5 atrações, meio-termo entre o 4 e o 7.{" "}
                  <strong className="font-medium text-black/55">Express 7</strong> — fura-fila em 7 atrações, cobrindo mais opções do Wizarding World e headliners.{" "}
                  <strong className="font-medium text-black/55">Express 8</strong> — o Express 7 + 1 atração extra (geralmente Minion Blast).{" "}
                  <strong className="font-medium text-black/55">Premium</strong> — fura-fila em praticamente toda a linha de atrações do parque (13 a 16, dependendo da versão vendida no dia).
                </p>
                <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs leading-5 text-amber-800">
                  ⚠️ Super Nintendo World (Mario Kart: Koopa&apos;s Challenge, Yoshi&apos;s Adventure) e o Wizarding World (Harry Potter) <strong>variam por combo específico</strong> dentro de cada tier — a entrada garantida na área do Nintendo World sem depender da senha grátis do app da USJ só vem em combos que citam isso explicitamente. Veja a tabela comparativa completa abaixo pra confirmar exatamente o que entra em cada combo antes de vender.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { key: "nenhum", label: "Sem Express Pass", preco: 0, nintendoWorld: false, wizardingWorld: false, estimado: false },
                      { key: "4", label: "Express 4", preco: PRECO_EXPRESS_PASS_USJ_4_USD_PAX, nintendoWorld: false, wizardingWorld: false, estimado: false },
                      { key: "5", label: "Express 5", preco: PRECO_EXPRESS_PASS_USJ_5_USD_PAX, nintendoWorld: false, wizardingWorld: false, estimado: true },
                      { key: "7", label: "Express 7", preco: PRECO_EXPRESS_PASS_USJ_7_USD_PAX, nintendoWorld: true, wizardingWorld: true, estimado: false },
                      { key: "8", label: "Express 8", preco: PRECO_EXPRESS_PASS_USJ_8_USD_PAX, nintendoWorld: true, wizardingWorld: true, estimado: true },
                      { key: "premium", label: "Premium", preco: PRECO_EXPRESS_PASS_USJ_PREMIUM_USD_PAX, nintendoWorld: true, wizardingWorld: true, estimado: false },
                    ] as const
                  ).map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setUsjExpressPassTier(tier.key)}
                      className={`flex w-36 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        usjExpressPassTier === tier.key
                          ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                          : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                      }`}
                    >
                      {(tier.nintendoWorld || tier.wizardingWorld) ? (
                        <span className="flex h-16 items-center justify-center gap-1.5">
                          {tier.nintendoWorld && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src="/images/ingressos/super-nintendo-world-logo.png"
                              alt=""
                              className="h-14 w-14 shrink-0 rounded object-contain"
                            />
                          )}
                          {tier.wizardingWorld && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src="/images/ingressos/harry-potter-logo.png"
                              alt=""
                              className="h-11 w-20 shrink-0 object-contain"
                            />
                          )}
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/images/icone-ingressos.png"
                          alt=""
                          className="h-16 w-16 shrink-0 object-contain"
                        />
                      )}
                      <span>{tier.label}</span>
                      {tier.preco > 0 && (
                        <span className="text-[10px] font-normal text-black/35">
                          {formatUSD(tier.preco)}/pessoa
                        </span>
                      )}
                      {tier.estimado && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-red-700">
                          confirmar preço
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {(usjExpressPassTier === "5" || usjExpressPassTier === "8") && (
                  <p className="mt-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs leading-5 text-red-700">
                    ⚠️ Preço deste tier ainda é uma estimativa (Express 5 e Express 8 não têm custo
                    oficial confirmado) — confirme o valor antes de fechar com o cliente.
                  </p>
                )}
                {(usjExpressPassTier === "7" || usjExpressPassTier === "8" || usjExpressPassTier === "premium") && (
                  <p className="mt-1.5 flex items-center gap-2 text-xs leading-5 text-emerald-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ingressos/super-nintendo-world-logo.png"
                      alt=""
                      className="h-6 w-6 shrink-0 rounded object-contain"
                    />
                    ✅ Este tier inclui entrada garantida na Super Nintendo World.
                  </p>
                )}
                {(usjExpressPassTier === "7" || usjExpressPassTier === "8" || usjExpressPassTier === "premium") && (
                  <p className="mt-1.5 flex items-center gap-2 text-xs leading-5 text-emerald-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ingressos/harry-potter-logo.png"
                      alt=""
                      className="h-6 w-10 shrink-0 object-contain"
                    />
                    ✅ Este tier inclui atrações do The Wizarding World of Harry Potter.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarDetalhesUsjExpressPass((v) => !v)}
                  className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    mostrarDetalhesUsjExpressPass
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 text-[#2f80c9]"
                      : "border-[#2f80c9]/40 text-[#2f80c9] hover:bg-[#2f80c9]/5"
                  }`}
                >
                  {mostrarDetalhesUsjExpressPass ? "Ocultar" : "Ver"} informação completa de cada pass
                  <span
                    aria-hidden
                    className={`transition-transform ${mostrarDetalhesUsjExpressPass ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>

                {mostrarDetalhesUsjExpressPass && (
                  <div className="mt-3 space-y-3">
                    {USJ_EXPRESS_PASS_DETALHES.map((d) => (
                      <div key={d.tier} className="rounded-lg border border-black/10 bg-white p-4">
                        <p className="text-sm font-semibold text-[#0A2540]">
                          Express {d.tier === "premium" ? "Premium" : d.tier}
                        </p>
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs leading-5 text-black/60">
                          {d.atracoesTipicas.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs leading-5 text-black/60">
                          🎮 Super Nintendo World: {d.nintendoWorld}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-black/60">
                          🪄 Wizarding World: {d.wizardingWorld}
                        </p>
                        <p className="mt-2 text-xs font-medium text-black/55">
                          Preço de referência (revenda): {d.faixaPrecoReferenciaBRL}
                        </p>
                        <p className="mt-1 text-xs italic leading-5 text-black/45">
                          {d.observacao}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarTabelaComparativaUsj((v) => !v)}
                  className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    mostrarTabelaComparativaUsj
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 text-[#2f80c9]"
                      : "border-[#2f80c9]/40 text-[#2f80c9] hover:bg-[#2f80c9]/5"
                  }`}
                >
                  {mostrarTabelaComparativaUsj ? "Ocultar" : "Ver"} tabela comparativa completa (atração por combo)
                  <span
                    aria-hidden
                    className={`transition-transform ${mostrarTabelaComparativaUsj ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>

                {mostrarTabelaComparativaUsj && (
                  <div className="mt-3 space-y-5">
                    {USJ_TABELAS_COMPARATIVAS.map((tabela) => (
                      <div key={tabela.titulo} className="rounded-lg border border-black/10 bg-white p-4">
                        <p className="text-sm font-semibold text-[#0A2540]">{tabela.titulo}</p>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full min-w-[560px] border-collapse text-xs">
                            <thead>
                              <tr>
                                <th className="border-b border-black/10 py-1.5 pr-2 text-left font-medium text-black/50">
                                  Atração / área
                                </th>
                                {tabela.colunas.map((coluna) => (
                                  <th
                                    key={coluna}
                                    className="border-b border-black/10 px-2 py-1.5 text-center font-medium text-black/50"
                                  >
                                    {coluna}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tabela.linhas.map((linha) => (
                                <tr key={linha.atracao} className="border-b border-black/5">
                                  <td className="py-1.5 pr-2 text-black/70">{linha.atracao}</td>
                                  {linha.valores.map((valor, i) => (
                                    <td key={i} className="px-2 py-1.5 text-center">
                                      <CelulaUsjTabela celula={valor} />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {tabela.notas.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-[11px] leading-4 text-black/45">
                            {tabela.notas.map((nota, i) => (
                              <li key={i}>· {nota}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    <p className="text-[11px] italic leading-4 text-black/40">
                      Fonte: prints do Klook enviados pelo Wilson (04/set/2026) — combos e nomes mudam por
                      temporada e operadora, confirmar disponibilidade exata antes de vender.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 flex items-center text-[10px] uppercase tracking-[0.2em] text-black/50">
              <LabelNumerado texto="16. Serviços adicionais" />
            </span>
            <div className="flex flex-wrap gap-2">
              {CATALOGO_SERVICOS_ADICIONAIS.map((servico) => {
                const marcado = servicosAdicionaisSelecionados.has(servico.key);
                return (
                  <label
                    key={servico.key}
                    className={`flex w-40 cursor-pointer flex-col items-center gap-2 rounded-lg border px-3 py-3 text-center text-xs transition ${
                      marcado
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarServicoAdicional(servico.key)}
                      className="sr-only"
                    />
                    <IconMala className={`h-9 w-9 shrink-0 ${marcado ? "text-[#2f80c9]" : "text-black/45"}`} />
                    <span>{servico.nome}</span>
                    <span className="text-[10px] font-normal text-black/35">
                      {formatUSD(servico.precoUSD)}/mala{servico.porTrecho ? "/trecho" : ""}
                    </span>
                  </label>
                );
              })}
            </div>
            {servicosAdicionaisSelecionados.size > 0 && (
              <p className="mt-2 text-[11px] leading-4 text-black/40">
                {CATALOGO_SERVICOS_ADICIONAIS.filter((s) => servicosAdicionaisSelecionados.has(s.key)).map(
                  (s) => s.descricao,
                ).join(" ")}
              </p>
            )}
          </div>
        </div>

        {/* ── VALORES MANUAIS (OPCIONAL) ── */}
        <div className="mt-4 grid gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:grid-cols-2 md:p-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-700 sm:col-span-2">
            Valores manuais (opcional) — use quando já tiver uma cotação real de hotel ou aéreo,
            em vez do valor de referência de mercado
          </p>

          <div>
            <label className="flex items-center gap-3 text-xs font-medium text-red-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/icone-hotel2.png"
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hotelManual}
                  onChange={(e) => setHotelManual(e.target.checked)}
                  className="h-4 w-4 rounded border-red-300 accent-red-600"
                />
                Informar diária do hotel manualmente
              </span>
            </label>
            {hotelManual && (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 flex-col">
                  <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-red-700/70">
                    Diária do hotel (R$)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={hotelDiariaManual}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isNaN(v)) setHotelDiariaManual(v);
                    }}
                    className="h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm outline-none focus:border-red-400"
                  />
                </label>
                <label className="flex flex-1 flex-col">
                  <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-red-700/70">
                    Categoria do hotel
                  </span>
                  <select
                    value={hotelCategoriaManual}
                    onChange={(e) =>
                      setHotelCategoriaManual(
                        e.target.value as (typeof CATEGORIAS_HOTEL)[number],
                      )
                    }
                    className="h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm outline-none focus:border-red-400"
                  >
                    {CATEGORIAS_HOTEL.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 text-xs font-medium text-red-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/icone-passagem-aerea.png"
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aereoManual}
                  onChange={(e) => setAereoManual(e.target.checked)}
                  className="h-4 w-4 rounded border-red-300 accent-red-600"
                />
                Informar valor da passagem manualmente
              </span>
            </label>
            {aereoManual && (
              <label className="mt-2 flex flex-col">
                <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-red-700/70">
                  Passagem por pessoa (R$)
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={aereoValorManual}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setAereoValorManual(v);
                  }}
                  className="h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm outline-none focus:border-red-400"
                />
              </label>
            )}
          </div>
        </div>

        {/* ── RESULTADO ── */}
        <div className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6 md:p-8">
          {!resultado.cabeNoOrcamento ? (
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-700">
                Orçamento insuficiente
              </p>
              <p className={`${display.className} mt-2 text-2xl font-medium`}>
                Itens essenciais mínimos custam {formatBRL(resultado.precoMinimo)}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-black/55">
                Com {formatBRL(orcamento)}, ainda falta {formatBRL(resultado.precoMinimo - orcamento)}{" "}
                para cobrir Roteiro Personalizado + Aéreo Economy + Hotel 3 estrelas + Seguro Viagem{" "}
                para{" "}
                {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"} em {dias} dias. Aumente o
                orçamento ou reduza dias/pessoas.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Pacote sugerido
              </p>
              <h2 className={`${display.className} mt-2 text-2xl font-medium md:text-3xl`}>
                Hotel {resultado.categoriaHotelFinal} · Aéreo {resultado.classeAereoFinal}
              </h2>

              {resultado.avisoCategoriaTemporada && (
                <p className="mt-2 max-w-md text-xs leading-4 text-amber-600">
                  ⚠️ {resultado.avisoCategoriaTemporada}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#0A2540] px-3 py-1 text-xs font-semibold text-white">
                  {dias} {dias === 1 ? "dia" : "dias"}
                </span>
                <span className="rounded-full bg-[#0A2540] px-3 py-1 text-xs font-semibold text-white">
                  {tipoQuarto}
                </span>
                <span className="rounded-full bg-[#0A2540] px-3 py-1 text-xs font-semibold text-white">
                  {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}
                </span>
                {EXTENSOES_INTERNACIONAIS.filter((extensao) => extensoesSelecionadas.has(extensao.key)).map(
                  (extensao) => (
                    <span
                      key={extensao.key}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      + {extensao.dias} dias · {extensao.nome}
                    </span>
                  ),
                )}
              </div>

              <p className="mt-2 text-[11px] text-black/35">
                Ajisai · proposta gerada em {geradoEmLabel}
              </p>

              {cidadesSemMotoristaObrigatorio.length > 0 && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-red-700">
                    ⚠ Motorista particular obrigatório
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-5 text-red-800">
                    {cidadesSemMotoristaObrigatorio.map(({ key, nota }) => (
                      <li key={key}>
                        <strong>{DESTINOS.find((d) => d.key === key)?.nome ?? key}</strong> — {nota.motivo}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11px] text-red-700/80">
                    O item &quot;Motorista Privado&quot; não está nessa proposta — marque manualmente
                    ou ajuste o orçamento pra incluir.
                  </p>
                </div>
              )}

              {Object.keys(itemAjustes).length > 0 && (
                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Valores em verde foram alterados manualmente
                </p>
              )}

              <div className="mt-6 space-y-2.5">
                {resultado.incluidos.map((item) => {
                  const chave = chaveDoItem(item);
                  const removido = !itemSelecionado(item);
                  const ajustado = itemAjustes[chave] !== undefined;
                  const valor = valorItem(item);
                  return (
                    <div
                      key={chave}
                      className={`flex items-start justify-between gap-4 border-b border-black/10 pb-2.5 transition ${
                        removido ? "opacity-40" : ""
                      }`}
                    >
                      <label className="flex flex-1 cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!removido}
                          onChange={() => alternarItem(chave)}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                        />
                        <div>
                          <p className={`text-sm font-medium ${removido ? "line-through" : ""}`}>
                            {item.label}
                          </p>
                          {item.detalhe.map((linha, i) => (
                            <p key={i} className="mt-0.5 text-xs text-black/50">
                              {linha}
                            </p>
                          ))}
                          {removido && !itemRecomendado(item) && (
                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-600">
                              Fora do orçamento — marque a caixa para incluir mesmo assim
                            </p>
                          )}
                        </div>
                      </label>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-black/30">R$</span>
                          <input
                            type="number"
                            disabled={removido}
                            value={Math.round(valor)}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (!Number.isNaN(v)) ajustarValorItem(item, v);
                            }}
                            className={`h-8 w-28 rounded-md border px-2 text-right text-sm font-semibold outline-none focus:border-[#2f80c9]/60 disabled:opacity-40 ${
                              removido ? "line-through" : ""
                            } ${
                              ajustado
                                ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700"
                                : "border-black/15 bg-transparent"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-black/35">
                          {brlParaUSDLabel(valor, cambio)}
                        </span>
                        {ajustado && (
                          <button
                            type="button"
                            onClick={() => restaurarValorItem(item)}
                            className="text-[10px] uppercase tracking-wide text-emerald-600 underline underline-offset-2"
                          >
                            restaurar automático
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Total do pacote sugerido
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`${display.className} text-4xl font-medium text-[#2f80c9]`}>
                      R$
                    </span>
                    <input
                      type="number"
                      value={Math.round(totalManual ? totalValorManual : totalCalculado)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) {
                          setTotalValorManual(v);
                          setTotalManual(true);
                        }
                      }}
                      className={`${display.className} h-12 w-44 rounded-lg border px-2 text-3xl font-medium text-[#2f80c9] outline-none focus:border-[#2f80c9]/60 ${
                        totalManual
                          ? "border-[#2f80c9]/40 bg-[#2f80c9]/5"
                          : "border-black/15 bg-transparent"
                      }`}
                    />
                  </div>
                  <p className="text-sm text-black/40">{brlParaUSDLabel(totalSelecionado, cambio)}</p>
                  {totalManual && (
                    <button
                      type="button"
                      onClick={() => setTotalManual(false)}
                      className="mt-1 text-[10px] uppercase tracking-wide text-black/40 underline underline-offset-2 hover:text-black/60"
                    >
                      usar total calculado automaticamente
                    </button>
                  )}
                  <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-black/30" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Saldo restante do orçamento
                  </p>
                  <p
                    className={`${display.className} mt-1 text-2xl font-medium ${
                      saldoSelecionado > 0 ? "text-black" : "text-black/40"
                    }`}
                  >
                    {formatBRL(saldoSelecionado)}
                  </p>
                  <p className="text-xs text-black/35">{brlParaUSDLabel(saldoSelecionado, cambio)}</p>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-black/40">
                Itens sem preço fixo (concierge, experiências sob medida, transfer de ônibus,
                reservas de restaurantes fora do pacote high-end) não entram nesse cálculo —
                cotados à parte, sob consulta. Valor final sujeito a confirmação da Ajisai.
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://wa.me/5511930300101?text=${encodeURIComponent(mensagemWhatsapp)}`,
                      "_blank",
                    )
                  }
                  className="w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
                >
                  Falar sobre esse pacote no WhatsApp
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGerarPdf}
                    disabled={gerandoPdf}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#2f80c9]/40 px-4 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-[#2f80c9] transition hover:bg-[#2f80c9]/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconPdf className="h-4 w-4 shrink-0" />
                    <span>{gerandoPdf ? "Gerando…" : "PDF da proposta"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGerarTexto}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#2f80c9]/40 px-4 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-[#2f80c9] transition hover:bg-[#2f80c9]/5"
                  >
                    <IconDoc className="h-4 w-4 shrink-0" />
                    <span>Texto editável (Word)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── BARRA FIXA: total + saldo sempre visíveis ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/97 px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.35)] backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              Total do pacote sugerido
            </p>
            <p className={`${display.className} text-xl font-medium text-[#5b9bd9] sm:text-2xl`}>
              {resultado.cabeNoOrcamento ? formatBRL(totalSelecionado) : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              Saldo restante
            </p>
            <p
              className={`${display.className} text-lg font-medium sm:text-xl ${
                !resultado.cabeNoOrcamento || saldoSelecionado > 0 ? "text-white" : "text-white/40"
              }`}
            >
              {resultado.cabeNoOrcamento ? formatBRL(saldoSelecionado) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!resultado.cabeNoOrcamento || gerandoPdf}
              onClick={handleGerarPdf}
              aria-label="Gerar PDF da proposta"
              title="Gerar PDF da proposta"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5b9bd9]/50 text-[#5b9bd9] transition hover:bg-[#5b9bd9]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconPdf className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!resultado.cabeNoOrcamento}
              onClick={handleGerarTexto}
              aria-label="Gerar texto editável (Word) da proposta"
              title="Gerar texto editável (Word) da proposta"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5b9bd9]/50 text-[#5b9bd9] transition hover:bg-[#5b9bd9]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconDoc className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!resultado.cabeNoOrcamento}
              onClick={() =>
                window.open(
                  `https://wa.me/5511930300101?text=${encodeURIComponent(mensagemWhatsapp)}`,
                  "_blank",
                )
              }
              className="rounded-full bg-[#2f80c9] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-40"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
