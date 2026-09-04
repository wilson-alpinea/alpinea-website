"use client";

import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { useMemo, useState } from "react";
import {
  NumberStepper,
  DESTINOS,
  CIDADE_MULTIPLICADOR_HOTEL,
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  FATOR_QUARTO,
  DIARIA_HOTEL,
  CLASSES_AEREO,
  PRECO_AEREO_ECONOMY_BRL,
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
  PRECO_DISNEY_PREMIER_ACCESS_USD_PAX,
  PRECO_INGRESSO_USJ_USD_PAX,
  PRECO_EXPRESS_PASS_USJ_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX,
  PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
} from "../components/CustomPackageCard";
import { useCambioUSD, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

type IngressoKey = "disneyland" | "disneysea" | "usj" | "teamlabTokyo" | "teamlabKyoto";

// Catálogo de ingressos/experiências oferecidos na Calculadora Reversa —
// cada um vira um candidato do preenchimento por orçamento quando marcado
// pelo vendedor (ver ingressosSelecionados). Preços em CustomPackageCard.tsx.
const CATALOGO_INGRESSOS: { key: IngressoKey; nome: string; precoUSD: number }[] = [
  { key: "disneyland", nome: "Disneyland Tokyo", precoUSD: PRECO_INGRESSO_DISNEYLAND_TOKYO_USD_PAX },
  { key: "disneysea", nome: "DisneySea Tokyo", precoUSD: PRECO_INGRESSO_DISNEYSEA_USD_PAX },
  { key: "usj", nome: "Universal Studios Japan", precoUSD: PRECO_INGRESSO_USJ_USD_PAX },
  { key: "teamlabTokyo", nome: "teamLab Tokyo", precoUSD: PRECO_INGRESSO_TEAMLAB_TOKYO_USD_PAX },
  { key: "teamlabKyoto", nome: "teamLab Kyoto", precoUSD: PRECO_INGRESSO_TEAMLAB_KYOTO_USD_PAX },
];

type DestinoKey = (typeof DESTINOS)[number]["key"];
type TemaKey =
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
};

// Catálogo de Temas — cada um sugere um grupo de cidades (com destaque
// próprio) pra montar rapidamente o roteiro e a cidade de referência do
// hotel. Selecionar um tema marca as cidades "padrao" dele em
// destinosSelecionados (o vendedor pode ajustar cidade por cidade depois);
// "Sem Tema" limpa a seleção. Pedido do Wilson, 04/set/2026.
const TEMAS: { key: TemaKey; nome: string; cidades: TemaCidade[] }[] = [
  {
    key: "automobilismo",
    nome: "Automobilismo",
    cidades: [
      { key: "tokyo", destaque: "Cultura JDM e encontros automotivos — A PIT Autobacs · Nissan Crossing · Daikoku PA", padrao: true },
      { key: "fuji", destaque: "Circuito e história do automobilismo — Fuji Speedway · Fuji Motorsports Museum", padrao: true },
      { key: "nagoya", destaque: "História da indústria automobilística japonesa — Toyota Automobile Museum · Toyota Commemorative Museum", padrao: true },
      { key: "motegi", destaque: "Honda e motorsports — Honda Collection Hall · Mobility Resort Motegi", padrao: false },
      { key: "suzuka", destaque: "Um dos circuitos mais emblemáticos do Japão — Suzuka Circuit", padrao: false },
    ],
  },
  {
    key: "gastronomia",
    nome: "Gastronomia",
    cidades: [
      { key: "tokyo", destaque: "Omakase, sushi, yakiniku, alta gastronomia e enorme variedade regional japonesa", padrao: true },
      { key: "kyoto", destaque: "Kaiseki, cozinha Kyo-ryori, chá, tofu e restaurantes tradicionais", padrao: true },
      { key: "osaka", destaque: "Cultura gastronômica mais informal — Dotonbori, takoyaki, okonomiyaki, kushikatsu e mercados", padrao: true },
    ],
  },
  {
    key: "animeGames",
    nome: "Anime, Games & Cultura Pop",
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
    cidades: [
      { key: "tokyo", destaque: "Ginza, Omotesando, Aoyama e departamentos de luxo; moda, relojoaria e design japonês", padrao: true },
      { key: "kyoto", destaque: "Artesanato, cerâmica, quimonos, chá e produtos tradicionais de alto padrão", padrao: true },
      { key: "osaka", destaque: "Shinsaibashi, Umeda e grandes lojas de luxo e departamentos", padrao: true },
    ],
  },
  {
    key: "esportesEventos",
    nome: "Esportes & Eventos",
    cidades: [
      { key: "tokyo", destaque: "Sumô, baseball, futebol e grandes eventos em arenas e estádios", padrao: true },
      { key: "osaka", destaque: "Baseball, futebol e eventos esportivos de grande porte", padrao: false },
      { key: "nagoya", destaque: "Sumô, baseball e eventos no eixo Aichi/Nagoya", padrao: false },
    ],
  },
  {
    key: "parquesEntretenimento",
    nome: "Parques & Entretenimento",
    cidades: [
      { key: "tokyo", destaque: "Tokyo Disneyland, Tokyo DisneySea e experiências de entretenimento imersivo", padrao: true },
      { key: "osaka", destaque: "Universal Studios Japan e Super Nintendo World", padrao: true },
      { key: "nagoya", destaque: "Ghibli Park", padrao: true },
    ],
  },
  {
    key: "neveInverno",
    nome: "Neve & Inverno",
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
  detalhe: string;
  precoBRL: number;
  /** Chave estável de identificação do item - usada em vez do label nos
   * controles de selecao e ajuste manual, porque o label de alguns itens
   * muda (categoria de hotel, classe do aereo, dias/classe do JR Pass,
   * tipo de wi-fi) e nao pode servir de chave. Itens com label fixo nao
   * precisam declarar chave (o codigo usa o label como chave nesse caso). */
  chave?: string;
};

function chaveDoItem(item: ItemPacote) {
  return item.chave ?? item.label;
}

// Ordem em que os itens entram no pacote sugerido, depois dos itens fixos
// (Roteiro + Aéreo Economy + Hotel 3 estrelas). Cada passo só é aplicado se
// couber no saldo restante do orçamento — greedy, nessa ordem de prioridade.
// Upgrades de categoria de hotel e classe do voo são os itens de maior
// impacto na experiência (perfil de cliente de alta/altíssima renda), por
// isso entram antes dos complementares.
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
  const [destinosSelecionados, setDestinosSelecionados] = useState<Set<DestinoKey>>(
    () => new Set(["tokyo"]),
  );
  const [temaSelecionado, setTemaSelecionado] = useState<TemaKey | null>(null);

  // Valor manual — sobrescreve o cálculo automático quando o time já tem
  // uma cotação real (hotel negociado, tarifa aérea específica etc.),
  // em vez de usar a tabela de referência de mercado.
  const [hotelManual, setHotelManual] = useState(false);
  const [hotelDiariaManual, setHotelDiariaManual] = useState(0);
  const [aereoManual, setAereoManual] = useState(false);
  const [aereoValorManual, setAereoValorManual] = useState(0);

  // Selecao manual dos itens do pacote sugerido (o vendedor pode tirar um
  // item antes de mandar pro cliente) e o timestamp de quando essa
  // proposta foi montada, pra constar na mensagem enviada.
  const [itensRemovidos, setItensRemovidos] = useState<Set<string>>(new Set());
  const [geradoEm] = useState(() => new Date());

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

  // Wi-fi - eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado,
  // cobre varias pessoas). Ambos escalam com a quantidade de dias.
  const [wifiTipo, setWifiTipo] = useState<"esim" | "pocket">("esim");

  // Ingressos e experiências - o vendedor marca quais parques/experiências
  // o cliente quer (nenhum vem pré-selecionado); cada um marcado entra como
  // candidato do preenchimento por orçamento, igual aos outros
  // complementares. Premier Access (Disney) e Express Pass (USJ) são
  // acréscimos opcionais sobre o ingresso base.
  const [ingressosSelecionados, setIngressosSelecionados] = useState<Set<IngressoKey>>(new Set());
  const [disneyPremierAccess, setDisneyPremierAccess] = useState(false);
  const [usjExpressPass, setUsjExpressPass] = useState(false);

  function alternarIngresso(key: IngressoKey) {
    setIngressosSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  }

  function alternarDestino(key: DestinoKey) {
    setDestinosSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  }

  // Selecionar um tema marca as cidades "padrao" dele (substitui a
  // seleção de cidades atual); "Sem Tema" (temaKey null) limpa o tema e
  // volta pra Tokyo como cidade única, igual ao estado inicial da página.
  // "Parques & Entretenimento" já vem com os ingressos correspondentes
  // marcados na seção de Ingressos e experiências.
  function selecionarTema(temaKey: TemaKey | null) {
    setTemaSelecionado(temaKey);
    if (temaKey === null) {
      setDestinosSelecionados(new Set(["tokyo"]));
      return;
    }
    const tema = TEMAS.find((t) => t.key === temaKey);
    if (!tema) return;
    setDestinosSelecionados(new Set(tema.cidades.filter((c) => c.padrao).map((c) => c.key)));
    if (temaKey === "parquesEntretenimento") {
      setIngressosSelecionados((atual) => {
        const novo = new Set(atual);
        novo.add("disneyland");
        novo.add("disneysea");
        novo.add("usj");
        return novo;
      });
    }
  }

  // Média dos multiplicadores das cidades marcadas — mesmo critério do
  // calculador do Personalizado (multiplicadorCidadeHotel, em
  // CustomPackageCard.tsx); 1 (sem ajuste) se nenhuma cidade estiver marcada.
  const multiplicadorCidade =
    destinosSelecionados.size === 0
      ? 1
      : Array.from(destinosSelecionados).reduce(
          (soma, key) => soma + CIDADE_MULTIPLICADOR_HOTEL[key],
          0,
        ) / destinosSelecionados.size;
  const nomesDestinos = Array.from(destinosSelecionados)
    .map((key) => DESTINOS.find((d) => d.key === key)?.nome ?? key)
    .join(" · ");

  const resultado = useMemo(() => {
    const precoRoteiro =
      ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
    const precoAereoEconomy = aereoManual
      ? Math.round(aereoValorManual * pessoas)
      : PRECO_AEREO_ECONOMY_BRL * pessoas;
    const precoAereoBusiness = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas);
    const precoAereoFirst = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas);

    function precoHotel(categoria: (typeof CATEGORIAS_HOTEL)[number]) {
      if (hotelManual) return Math.round(hotelDiariaManual * dias);
      return Math.round(
        DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multiplicadorCidade,
      );
    }

    const incluidos: ItemPacote[] = [
      {
        chave: "roteiro",
        label: "Roteiro Personalizado",
        detalhe: "Painel digital Ajisai com o roteiro sob medida do grupo",
        precoBRL: precoRoteiro,
      },
      {
        chave: "aereo",
        label: "Aéreo — Economy",
        detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        precoBRL: precoAereoEconomy,
      },
      {
        chave: "hotel",
        label: "Hotel — 3 estrelas",
        detalhe: `${dias} diárias · ${tipoQuarto} · categoria mínima`,
        precoBRL: precoHotel("3 estrelas"),
      },
    ];

    let gasto = incluidos.reduce((soma, item) => soma + item.precoBRL, 0);
    let categoriaHotelFinal: (typeof CATEGORIAS_HOTEL)[number] = "3 estrelas";
    let classeAereoFinal: (typeof CLASSES_AEREO)[number] = "Economy";

    function cabe(valor: number) {
      return gasto + valor <= orcamento;
    }

    // 1) Upgrade de hotel, categoria por categoria (não pula nível) — pulado
    // quando a diária é manual, já que o valor não varia por categoria.
    if (!hotelManual) {
      for (const categoria of ["4 estrelas", "5 estrelas", "Elite"] as const) {
        const precoAtual = precoHotel(categoriaHotelFinal);
        const precoNovo = precoHotel(categoria);
        const diferenca = precoNovo - precoAtual;
        if (cabe(diferenca)) {
          gasto += diferenca;
          categoriaHotelFinal = categoria;
        } else break;
      }
    }

    // 2) Complementares essenciais (transporte, seguro, guia)
    const precoTransporte = DIARIA_TRANSPORTE * dias;
    if (cabe(precoTransporte)) {
      gasto += precoTransporte;
      incluidos.push({
        label: "Transporte",
        detalhe: `Transfers e deslocamentos do roteiro — ${dias} dias`,
        precoBRL: precoTransporte,
      });
    }

    const precoSeguro = DIARIA_SEGURO_VIAGEM * dias * pessoas;
    if (cabe(precoSeguro)) {
      gasto += precoSeguro;
      incluidos.push({
        label: "Seguro Viagem",
        detalhe: `Cobertura médica e assistência — ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        precoBRL: precoSeguro,
      });
    }

    const precoGuia = Math.round(
      DIARIA_GUIA_USD * dias * Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO)) * cambioCotacao,
    );
    if (cabe(precoGuia)) {
      gasto += precoGuia;
      incluidos.push({
        label: "Guia Turístico",
        detalhe: `US$ ${DIARIA_GUIA_USD}/dia a cada ${GUIA_TAMANHO_GRUPO} pessoas`,
        precoBRL: precoGuia,
      });
    }

    // 3) JR Pass — faixa de dias e classe escolhidas pelo vendedor
    const tabelaJrPass = jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD;
    const precoJrPass = Math.round(tabelaJrPass[jrPassDias] * cambioCotacao * pessoas);
    if (cabe(precoJrPass)) {
      gasto += precoJrPass;
      incluidos.push({
        chave: "jrpass",
        label: `JR Pass — ${jrPassDias} dias${jrPassClasse === "green" ? " · Green Car" : ""}`,
        detalhe: `Passe ferroviário com trem-bala ilimitado${jrPassClasse === "green" ? ", classe Green Car" : ""}, por pessoa · tabela ${JR_PASS_TABELA_VALIDADE}`,
        precoBRL: precoJrPass,
      });
    }

    // 4) Wi-fi — eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado)
    const precoWifi =
      wifiTipo === "esim"
        ? Math.round(DIARIA_ESIM_USD_PAX * dias * pessoas * cambioCotacao)
        : Math.round(
            DIARIA_POCKET_WIFI_USD *
              dias *
              Math.max(1, Math.ceil(pessoas / WIFI_TAMANHO_GRUPO)) *
              cambioCotacao,
          );
    if (cabe(precoWifi)) {
      gasto += precoWifi;
      incluidos.push({
        chave: "wifi",
        label: wifiTipo === "esim" ? "eSIM" : "Pocket Wi-Fi",
        detalhe:
          wifiTipo === "esim"
            ? `Conexão 5G direto no celular, por pessoa — ${dias} dias`
            : `Aparelho compartilhado (até ${WIFI_TAMANHO_GRUPO} pessoas por unidade) — ${dias} dias`,
        precoBRL: precoWifi,
      });
    }

    // 5) Upgrade de classe do voo — pulado quando o valor da passagem é manual.
    if (!aereoManual) {
      for (const classe of ["Business", "First Class"] as const) {
        const precoAtual =
          classeAereoFinal === "Economy"
            ? precoAereoEconomy
            : classeAereoFinal === "Business"
              ? precoAereoBusiness
              : precoAereoFirst;
        const precoNovo = classe === "Business" ? precoAereoBusiness : precoAereoFirst;
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
    if (cabe(precoMotorista)) {
      gasto += precoMotorista;
      incluidos.push({
        chave: "motorista",
        label: "Motorista Privado",
        detalhe: `US$ ${DIARIA_MOTORISTA_PRIVADO_USD}/dia para até ${MOTORISTA_TAMANHO_GRUPO} pessoas, sem compartilhar veículo`,
        precoBRL: precoMotorista,
      });
    }

    // 7) Câmbio no Brasil
    if (cabe(PRECO_CAMBIO_BRASIL)) {
      gasto += PRECO_CAMBIO_BRASIL;
      incluidos.push({
        label: "Câmbio no Brasil",
        detalhe: "Retirada de ienes com câmbio comercial antes do embarque",
        precoBRL: PRECO_CAMBIO_BRASIL,
      });
    }

    // 8) Ingressos e experiências — só entram os parques marcados pelo
    // vendedor (nenhum vem por padrão); Premier Access/Express Pass somam
    // ao ingresso base do parque correspondente quando marcados.
    for (const ingresso of CATALOGO_INGRESSOS) {
      if (!ingressosSelecionados.has(ingresso.key)) continue;
      const ehDisney = ingresso.key === "disneyland" || ingresso.key === "disneysea";
      const temFastPass = (ehDisney && disneyPremierAccess) || (ingresso.key === "usj" && usjExpressPass);
      const precoFastPassUSD = ehDisney
        ? PRECO_DISNEY_PREMIER_ACCESS_USD_PAX
        : PRECO_EXPRESS_PASS_USJ_USD_PAX;
      const nomeFastPass = ehDisney ? "Premier Access" : "Express Pass";
      const precoIngresso = Math.round(
        (ingresso.precoUSD + (temFastPass ? precoFastPassUSD : 0)) * pessoas * cambioCotacao,
      );
      if (cabe(precoIngresso)) {
        gasto += precoIngresso;
        incluidos.push({
          chave: `ingresso-${ingresso.key}`,
          label: `Ingresso — ${ingresso.nome}${temFastPass ? ` + ${nomeFastPass}` : ""}`,
          detalhe: `Ingresso de 1 dia, por pessoa${temFastPass ? ` + ${nomeFastPass} (fast pass pago)` : ""}`,
          precoBRL: precoIngresso,
        });
      }
    }

    // 9) Reserva de Restaurantes High-End
    if (pessoas <= RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
      const precoRestaurantes = Math.round(PRECO_RESTAURANTES_HIGHEND_USD * cambioCotacao);
      if (cabe(precoRestaurantes)) {
        gasto += precoRestaurantes;
        incluidos.push({
          label: "Reserva de Restaurantes High-End",
          detalhe: `Pacote fechado — até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas`,
          precoBRL: precoRestaurantes,
        });
      }
    }

    // Atualiza os itens fixos de hotel/aéreo com a categoria/classe final
    incluidos[1] = {
      chave: "aereo",
      label: aereoManual ? "Aéreo — valor manual" : `Aéreo — ${classeAereoFinal}`,
      detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
      precoBRL:
        classeAereoFinal === "Economy"
          ? precoAereoEconomy
          : classeAereoFinal === "Business"
            ? precoAereoBusiness
            : precoAereoFirst,
    };
    incluidos[2] = {
      chave: "hotel",
      label: hotelManual ? "Hotel — valor manual" : `Hotel — ${categoriaHotelFinal}`,
      detalhe: `${dias} diárias · ${tipoQuarto} · ${nomesDestinos || "—"}`,
      precoBRL: precoHotel(categoriaHotelFinal),
    };

    const precoMinimo = precoRoteiro + precoAereoEconomy + precoHotel("3 estrelas");
    const saldo = orcamento - gasto;

    return {
      incluidos,
      gasto,
      saldo,
      categoriaHotelFinal,
      classeAereoFinal,
      cabeNoOrcamento: orcamento >= precoMinimo,
      precoMinimo,
    };
  }, [
    orcamento,
    dias,
    pessoas,
    tipoQuarto,
    multiplicadorCidade,
    nomesDestinos,
    cambioCotacao,
    hotelManual,
    hotelDiariaManual,
    aereoManual,
    aereoValorManual,
    jrPassDias,
    jrPassClasse,
    wifiTipo,
    ingressosSelecionados,
    disneyPremierAccess,
    usjExpressPass,
  ]);

  const pacoteSugeridoLabel = `Hotel ${resultado.categoriaHotelFinal} · Aéreo ${resultado.classeAereoFinal} · ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"} · orçamento ${formatBRL(orcamento)}`;

  function alternarItem(chave: string) {
    setItensRemovidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
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

  const itensSelecionados = resultado.incluidos.filter(
    (item) => !itensRemovidos.has(chaveDoItem(item)),
  );
  const totalCalculado = itensSelecionados.reduce((soma, item) => soma + valorItem(item), 0);
  const totalSelecionado = totalManual ? totalValorManual : totalCalculado;
  const saldoSelecionado = orcamento - totalSelecionado;

  // Cidades marcadas que exigem motorista particular (transporte público
  // insuficiente) mas cujo item "Motorista Privado" não está na proposta
  // final — alerta pro vendedor não fechar um pacote sem transporte viável.
  const motoristaNaProposta = itensSelecionados.some((item) => chaveDoItem(item) === "motorista");
  const cidadesSemMotoristaObrigatorio = motoristaNaProposta
    ? []
    : Array.from(destinosSelecionados)
        .map((key) => ({ key, nota: CIDADE_MOTORISTA_NOTA[key] }))
        .filter((c): c is { key: DestinoKey; nota: NonNullable<(typeof CIDADE_MOTORISTA_NOTA)[DestinoKey]> } =>
          c.nota?.nivel === "obrigatorio",
        );

  const geradoEmLabel = `${geradoEm.toLocaleDateString("pt-BR")} às ${geradoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

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
    <main className="min-h-screen bg-white px-5 py-12 text-[#0A2540] sm:px-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <img
            src="/images/ajisai-group-logo-crop.png"
            alt="Ajisai · Alpinea"
            className="h-9 w-auto object-contain md:h-11"
          />
          <Link
            href="/produtos"
            className="text-[10px] uppercase tracking-[0.2em] text-black/40 underline underline-offset-4 transition hover:text-black"
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
            <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-black/50">
              Orçamento máximo (R$)
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
            label="Quantidade de dias"
            value={dias}
            onChange={setDias}
            min={MIN_DIAS}
            max={MAX_DIAS}
            formatValue={(v) => `${v} dias`}
          />

          <NumberStepper
            label="Número de pessoas"
            value={pessoas}
            onChange={setPessoas}
            min={MIN_PESSOAS}
            max={MAX_PESSOAS}
            formatValue={(v) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`}
          />

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
              Tipo de quarto
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

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              Temas
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selecionarTema(null)}
                className={`h-9 rounded-lg border px-3 text-xs transition ${
                  temaSelecionado === null
                    ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                    : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                }`}
              >
                Sem tema
              </button>
              {TEMAS.map((tema) => (
                <button
                  key={tema.key}
                  type="button"
                  onClick={() => selecionarTema(tema.key)}
                  className={`h-9 rounded-lg border px-3 text-xs transition ${
                    temaSelecionado === tema.key
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                      : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                  }`}
                >
                  {tema.nome}
                </button>
              ))}
            </div>

            {temaSelecionado === null ? (
              <label className="mt-4 flex flex-col sm:max-w-xs">
                <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
                  Cidade principal do roteiro
                </span>
                <select
                  value={Array.from(destinosSelecionados)[0] ?? "tokyo"}
                  onChange={(e) =>
                    setDestinosSelecionados(new Set([e.target.value as DestinoKey]))
                  }
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                >
                  {DESTINOS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
                <div className="grid grid-cols-[minmax(140px,auto)_1fr] gap-x-6 bg-black/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-black/40">
                  <span>Cidades recomendadas</span>
                  <span>Destaques do tema</span>
                </div>
                {TEMAS.find((t) => t.key === temaSelecionado)?.cidades.map((c) => {
                  const destino = DESTINOS.find((d) => d.key === c.key);
                  const marcado = destinosSelecionados.has(c.key);
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
                        <strong className="font-medium text-[#0A2540]">
                          {destino?.nome ?? c.key}
                        </strong>{" "}
                        — {c.destaque}
                        {notaMotorista && (
                          <span className="mt-0.5 block text-[11px] text-black/40">
                            🚗 {notaMotorista.motivo}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            <span className="mt-1.5 block text-[11px] text-black/40">
              {destinosSelecionados.size === 0
                ? "Nenhuma cidade selecionada — diária de hotel sem ajuste de mercado por cidade"
                : `Ajuste de mercado do hotel: ${nomesDestinos} · multiplicador médio ${multiplicadorCidade.toFixed(2)}×`}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              JR Pass — validade e classe
            </span>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                {JR_PASS_DIAS_OPCOES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setJrPassDias(d)}
                    className={`h-10 rounded-lg border px-4 text-sm transition ${
                      jrPassDias === d
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["comum", "green"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setJrPassClasse(c)}
                    className={`h-10 rounded-lg border px-4 text-sm transition ${
                      jrPassClasse === c
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {c === "comum" ? "Comum (Ordinary)" : "Green Car"}
                  </button>
                ))}
              </div>
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {formatUSD(
                (jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD)[jrPassDias],
              )}{" "}
              por pessoa · tabela do fornecedor válida {JR_PASS_TABELA_VALIDADE}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              Conexão de internet
            </span>
            <div className="flex gap-2">
              {(["esim", "pocket"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWifiTipo(t)}
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
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              Ingressos e experiências
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {CATALOGO_INGRESSOS.map((ingresso) => (
                <label
                  key={ingresso.key}
                  className="flex items-center gap-2 text-xs font-medium text-[#0A2540]"
                >
                  <input
                    type="checkbox"
                    checked={ingressosSelecionados.has(ingresso.key)}
                    onChange={() => alternarIngresso(ingresso.key)}
                    className="h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                  />
                  {ingresso.nome}
                  <span className="text-[10px] font-normal text-black/35">
                    {formatUSD(ingresso.precoUSD)}/pessoa
                  </span>
                </label>
              ))}
            </div>
            {(ingressosSelecionados.has("disneyland") || ingressosSelecionados.has("disneysea")) && (
              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-[#0A2540]">
                <input
                  type="checkbox"
                  checked={disneyPremierAccess}
                  onChange={(e) => setDisneyPremierAccess(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                />
                + Disney Premier Access (fast pass pago, pacote de atrações principais)
                <span className="text-[10px] font-normal text-black/35">
                  {formatUSD(PRECO_DISNEY_PREMIER_ACCESS_USD_PAX)}/pessoa
                </span>
              </label>
            )}
            {ingressosSelecionados.has("usj") && (
              <label className="mt-2 flex items-center gap-2 text-xs font-medium text-[#0A2540]">
                <input
                  type="checkbox"
                  checked={usjExpressPass}
                  onChange={(e) => setUsjExpressPass(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                />
                + USJ Express Pass (fast pass pago)
                <span className="text-[10px] font-normal text-black/35">
                  {formatUSD(PRECO_EXPRESS_PASS_USJ_USD_PAX)}/pessoa
                </span>
              </label>
            )}
          </div>
        </div>

        {/* ── VALORES MANUAIS (OPCIONAL) ── */}
        <div className="mt-4 grid gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:grid-cols-2 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 sm:col-span-2">
            Valores manuais (opcional) — use quando já tiver uma cotação real de hotel ou aéreo,
            em vez do valor de referência de mercado
          </p>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#0A2540]">
              <input
                type="checkbox"
                checked={hotelManual}
                onChange={(e) => setHotelManual(e.target.checked)}
                className="h-4 w-4 rounded border-black/25 accent-[#2f80c9]"
              />
              Informar diária do hotel manualmente
            </label>
            {hotelManual && (
              <label className="mt-2 flex flex-col">
                <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
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
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                />
              </label>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#0A2540]">
              <input
                type="checkbox"
                checked={aereoManual}
                onChange={(e) => setAereoManual(e.target.checked)}
                className="h-4 w-4 rounded border-black/25 accent-[#2f80c9]"
              />
              Informar valor da passagem manualmente
            </label>
            {aereoManual && (
              <label className="mt-2 flex flex-col">
                <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
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
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
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
                para cobrir Roteiro Personalizado + Aéreo Economy + Hotel 3 estrelas para{" "}
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
              <p className="mt-1 text-[11px] text-black/35">
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

              <div className="mt-6 space-y-2.5">
                {resultado.incluidos.map((item) => {
                  const chave = chaveDoItem(item);
                  const removido = itensRemovidos.has(chave);
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
                          <p className="mt-0.5 text-xs text-black/50">{item.detalhe}</p>
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
                            } ${ajustado ? "border-[#2f80c9]/50 bg-[#2f80c9]/5" : "border-black/15 bg-transparent"}`}
                          />
                        </div>
                        {ajustado && (
                          <button
                            type="button"
                            onClick={() => restaurarValorItem(item)}
                            className="text-[10px] uppercase tracking-wide text-[#2f80c9] underline underline-offset-2"
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
                  {totalManual ? (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`${display.className} text-4xl font-medium text-[#2f80c9]`}>
                        R$
                      </span>
                      <input
                        type="number"
                        value={totalValorManual}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) setTotalValorManual(v);
                        }}
                        className={`${display.className} h-12 w-44 rounded-lg border border-[#2f80c9]/40 bg-[#2f80c9]/5 px-2 text-3xl font-medium text-[#2f80c9] outline-none`}
                      />
                    </div>
                  ) : (
                    <p className={`${display.className} mt-1 text-4xl font-medium text-[#2f80c9]`}>
                      {formatBRL(totalSelecionado)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!totalManual) setTotalValorManual(totalCalculado);
                      setTotalManual((v) => !v);
                    }}
                    className="mt-1 text-[10px] uppercase tracking-wide text-black/40 underline underline-offset-2 hover:text-black/60"
                  >
                    {totalManual ? "usar total calculado" : "ajustar total manualmente"}
                  </button>
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
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-black/40">
                Itens sem preço fixo (concierge, experiências sob medida, transfer de ônibus,
                reservas de restaurantes fora do pacote high-end) não entram nesse cálculo —
                cotados à parte, sob consulta. Valor final sujeito a confirmação da Ajisai.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://wa.me/5511930300101?text=${encodeURIComponent(mensagemWhatsapp)}`,
                    "_blank",
                  )
                }
                className="mt-7 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc] sm:w-auto"
              >
                Falar sobre esse pacote no WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
