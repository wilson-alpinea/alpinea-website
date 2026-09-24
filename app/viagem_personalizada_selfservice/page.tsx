"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import {
  NumberStepper,
  LabelNumerado,
  DESTINOS,
  CIDADE_MULTIPLICADOR_HOTEL,
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  TIPO_QUARTO_LABEL,
  FATOR_QUARTO,
  DIARIA_HOTEL,
  CLASSES_AEREO,
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_PREMIUM_ECONOMY_USD,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
  DIARIA_SEGURO_VIAGEM,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
  DIARIA_ESIM_USD_PAX,
  PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX,
  PRECO_MALA_INTERMUNICIPAL_USD,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  PRECO_TRANSFER_ONIBUS_USD_PAX,
  PRECO_RESERVA_RESTAURANTE_USD,
  PRECO_EXPERIENCIA_SOB_MEDIDA_USD,
  DIARIA_CONCIERGE_USD,
  ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA,
  JR_PASS_DIAS_OPCOES,
  JR_PASS_PRECO_USD,
  JR_PASS_PRECO_USD_GREEN,
  DIARIA_GUIA_USD,
  DIARIA_GUIA_ESTRANGEIRO_USD,
  GUIA_TAMANHO_GRUPO,
  DIARIA_MOTORISTA_PRIVADO_USD,
  MOTORISTA_TAMANHO_GRUPO,
  PRECO_CAMBIO_BRASIL,
} from "../components/CustomPackageCard";
import { useCambioIene, CIDADES_CAMBIO_IENE, type CidadeCambioIeneSlug } from "../hooks/useCambioIene";
import { COTACAO_FALLBACK_BRL_POR_JPY } from "../lib/cambioIene";
import { useCambioUSD, formatBRL } from "../hooks/useCambioUSD";
import {
  INGRESSOS_PUBLICOS,
  USJ_EXPRESS_PASS_PUBLICO,
  SERVICOS_PUBLICOS,
  IDADE_LIMITE_SEGURO,
  multiplicadorSeguroPorIdade,
  TEMAS,
  MAX_TEMAS_SIMULTANEOS,
  MAX_CIDADES_ROTEIRO,
  CAMBIO_IENES_MINIMO,
  FATOR_CAMBIO_IENE,
  EXTENSOES_INTERNACIONAIS,
  DIARIA_HOTEL_EXTENSAO_USD,
  CATEGORIAS_HOTEL_EXTENSAO,
  type TemaKey,
  type ExtensaoInternacionalKey,
  type CategoriaHotelExtensao,
  TEMPORADAS,
  TEMPORADA_MULTIPLICADOR_HOTEL,
  MESES_NOME,
  MES_PARA_TEMPORADA,
  ORIGENS_VOO,
  BAGAGEM_OPCOES,
  type TemporadaKey,
  type OrigemVooKey,
  type BagagemKey,
  type IngressoKey,
  type UsjTierKey,
  type ServicoKey,
} from "../lib/calculadoraCatalogoPublico";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

// Página pública, self-service: o cliente estima a própria viagem sem
// depender de um vendedor pra rodar a Calculadora Reversa interna
// (/calculadora_reversa). De propósito, só cobre o essencial — Roteiro +
// Aéreo + Hotel + Seguro — pra não sobrecarregar quem está apenas
// pesquisando. Itens vendidos à parte (JR Pass, guia, motorista, wi-fi,
// ingressos, extensões internacionais) ficam pra conversa com a equipe
// depois que o lead cai no CRM — ver app/api/viagem-personalizada-selfservice.
const MIN_DIAS = 5;
const MAX_DIAS = 30;
const MIN_PESSOAS = 1;
const MAX_PESSOAS = 12;
const MIN_ORCAMENTO = 20000;
const MAX_ORCAMENTO = 1000000;
const MAX_CIDADES = MAX_CIDADES_ROTEIRO;

type DestinoKey = (typeof DESTINOS)[number]["key"];
type CategoriaHotel = (typeof CATEGORIAS_HOTEL)[number];
type ClasseAereo = (typeof CLASSES_AEREO)[number];
type TipoQuarto = (typeof TIPOS_QUARTO)[number];

// Subconjunto de DESTINOS oferecido nessa página — os destinos mais
// procurados, pra não expor as ~30 cidades da Calculadora Reversa interna
// (a maioria delas só existe ali pra cobrir os "Temas" do vendedor).
const CIDADES_OFERECIDAS: DestinoKey[] = [
  "tokyo",
  "kyoto",
  "osaka",
  "hakone",
  "nara",
  "hiroshima",
  "nagoya",
  "kanazawa",
  "hokkaido",
  "okinawa",
];

function precoRoteiro(dias: number) {
  return ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
}

function multiplicadorCidades(cidades: DestinoKey[]) {
  if (cidades.length === 0) return 1;
  const soma = cidades.reduce((s, c) => s + (CIDADE_MULTIPLICADOR_HOTEL[c] ?? 1), 0);
  return soma / cidades.length;
}

function precoHotelCalc(
  categoria: CategoriaHotel,
  dias: number,
  pessoas: number,
  tipoQuarto: TipoQuarto,
  multCidade: number,
) {
  return Math.round(DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multCidade * pessoas);
}

function precoAereoCalc(classe: ClasseAereo, pessoas: number, cambioCotacao: number, ajustePorPessoa = 0) {
  const ajuste = Math.round(ajustePorPessoa * pessoas);
  if (classe === "First Class") return Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas) + ajuste;
  if (classe === "Business") return Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas) + ajuste;
  if (classe === "Premium Economy")
    return Math.round(PRECO_AEREO_PREMIUM_ECONOMY_USD * cambioCotacao * pessoas) + ajuste;
  return PRECO_AEREO_ECONOMY_BRL * pessoas + ajuste;
}

function multiplicadorTemporadaCidades(cidades: DestinoKey[], temporada: TemporadaKey) {
  if (cidades.length === 0) return 1;
  return cidades.reduce((s, c) => s + (TEMPORADA_MULTIPLICADOR_HOTEL[c]?.[temporada] ?? 1), 0) / cidades.length;
}

type LinhaExtra = { label: string; precoBRL: number };

function precoExtensaoPorCategoria(
  extensao: (typeof EXTENSOES_INTERNACIONAIS)[number],
  categoria: CategoriaHotelExtensao,
  tipoQuarto: TipoQuarto,
  pessoas: number,
  cambioCotacao: number,
) {
  const hotel = extensao.cidades.reduce(
    (soma, cidade) =>
      soma +
      Math.round(
        DIARIA_HOTEL_EXTENSAO_USD[cidade.key][categoria] * cidade.dias * FATOR_QUARTO[tipoQuarto] * pessoas * cambioCotacao,
      ),
    0,
  );
  const deslocamento = extensao.deslocamento.reduce(
    (soma, trecho) => soma + Math.round(trecho.precoUSDPax * cambioCotacao * pessoas),
    0,
  );
  return { hotel, deslocamento, total: hotel + deslocamento };
}

// Itens opcionais escolhidos pelo cliente (eSIM, ingressos, serviços) +
// seguro por idade. Entram como valor fixo no pacote: o preenchimento por
// orçamento (hotel/voo) só usa o que sobra depois deles.
function calcularExtras(p: {
  dias: number;
  pessoas: number;
  cidadesQtd: number;
  cambioCotacao: number;
  idades: number[];
  esimPessoas: number;
  ingressos: Set<IngressoKey>;
  premierAtracoes: number;
  usjTier: UsjTierKey;
  servicos: Set<ServicoKey>;
  tipoQuarto: TipoQuarto;
  jrPessoas: number;
  jrDias: (typeof JR_PASS_DIAS_OPCOES)[number];
  jrClasse: "comum" | "green";
  guiaDias: number;
  guiaTipo: "brasileiro" | "estrangeiro";
  motoristaDias: number;
  extensoes: Set<ExtensaoInternacionalKey>;
  extCategorias: Record<ExtensaoInternacionalKey, CategoriaHotelExtensao>;
  cotacaoIene: number;
  quantidadeIenes: number;
}) {
  const { dias, pessoas, cambioCotacao: c } = p;
  const linhas: LinhaExtra[] = [];
  const fora = p.idades.filter((i) => i > IDADE_LIMITE_SEGURO).length;
  const precoSeguro = Math.round(
    p.idades.reduce((soma, idade) => soma + DIARIA_SEGURO_VIAGEM * dias * (multiplicadorSeguroPorIdade(idade) ?? 0), 0),
  );
  const avisoSeguro =
    fora > 0
      ? `${fora} ${fora === 1 ? "passageiro está" : "passageiros estão"} acima do limite de ${IDADE_LIMITE_SEGURO} anos do seguro viagem — não incluído no preço; nossa equipe cota diretamente com a seguradora.`
      : null;

  if (p.esimPessoas > 0) {
    linhas.push({
      label: `eSIM (${p.esimPessoas} ${p.esimPessoas === 1 ? "pessoa" : "pessoas"})`,
      precoBRL: Math.round(DIARIA_ESIM_USD_PAX * dias * p.esimPessoas * c),
    });
  }

  for (const ing of INGRESSOS_PUBLICOS) {
    if (!p.ingressos.has(ing.key)) continue;
    const ehDisney = ing.key === "disneyland" || ing.key === "disneysea";
    let fastUSD = 0;
    let nomeFast = "";
    if (ehDisney && p.premierAtracoes > 0) {
      fastUSD = PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX * p.premierAtracoes;
      nomeFast = `Premier Access (${p.premierAtracoes} ${p.premierAtracoes === 1 ? "atração" : "atrações"})`;
    } else if (ing.key === "usj" && p.usjTier !== "nenhum") {
      const t = USJ_EXPRESS_PASS_PUBLICO.find((x) => x.key === p.usjTier);
      fastUSD = t?.precoUSD ?? 0;
      nomeFast = t?.label ?? "";
    }
    linhas.push({
      label: `Ingresso — ${ing.nome}${nomeFast ? ` + ${nomeFast}` : ""}`,
      precoBRL: Math.round((ing.precoUSD + fastUSD) * pessoas * c),
    });
  }

  if (p.servicos.has("malasIntermunicipal")) {
    const trechos = Math.max(1, p.cidadesQtd - 1);
    linhas.push({
      label: `Transporte de malas inter-municipal (${pessoas} ${pessoas === 1 ? "mala" : "malas"} × ${trechos} ${trechos === 1 ? "trecho" : "trechos"})`,
      precoBRL: Math.round(PRECO_MALA_INTERMUNICIPAL_USD * pessoas * trechos * c),
    });
  }
  if (p.servicos.has("restaurantesHighEnd") && pessoas <= RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
    linhas.push({ label: "Reserva de restaurantes high-end", precoBRL: Math.round(PRECO_RESTAURANTES_HIGHEND_USD * c) });
  }
  if (p.servicos.has("transferOnibus")) {
    linhas.push({ label: "Transfer de ônibus (Limousine Bus)", precoBRL: Math.round(PRECO_TRANSFER_ONIBUS_USD_PAX * pessoas * c) });
  }
  if (p.servicos.has("reservaRestaurante")) {
    linhas.push({ label: "Reserva de restaurante", precoBRL: Math.round(PRECO_RESERVA_RESTAURANTE_USD * c) });
  }
  if (p.servicos.has("experienciaSobMedida")) {
    linhas.push({ label: "Experiência sob medida (curadoria)", precoBRL: Math.round(PRECO_EXPERIENCIA_SOB_MEDIDA_USD * c) });
  }
  if (p.servicos.has("concierge")) {
    linhas.push({ label: `Concierge dedicado (${dias} dias)`, precoBRL: Math.round(DIARIA_CONCIERGE_USD * dias * c) });
  }

  if (p.servicos.has("cambioBrasil")) {
    linhas.push({
      label: `Câmbio no Brasil (¥ ${p.quantidadeIenes.toLocaleString("pt-BR")} em espécie)`,
      precoBRL: Math.round(PRECO_CAMBIO_BRASIL + p.quantidadeIenes * p.cotacaoIene * FATOR_CAMBIO_IENE),
    });
  }

  if (p.jrPessoas > 0) {
    const tabela = p.jrClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD;
    linhas.push({
      label: `JR Pass — ${p.jrDias} dias${p.jrClasse === "green" ? " · Green Car" : ""} (${p.jrPessoas} ${p.jrPessoas === 1 ? "pessoa" : "pessoas"})`,
      precoBRL: Math.round(tabela[p.jrDias] * c * p.jrPessoas),
    });
  }

  if (p.guiaDias > 0) {
    const diaria = p.guiaTipo === "brasileiro" ? DIARIA_GUIA_USD : DIARIA_GUIA_ESTRANGEIRO_USD;
    linhas.push({
      label: `Guia turístico ${p.guiaTipo === "brasileiro" ? "brasileiro" : "estrangeiro"} (${p.guiaDias} ${p.guiaDias === 1 ? "dia" : "dias"})`,
      precoBRL: Math.round(diaria * p.guiaDias * Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO)) * c),
    });
  }

  if (p.motoristaDias > 0) {
    linhas.push({
      label: `Motorista privado (${p.motoristaDias} ${p.motoristaDias === 1 ? "dia" : "dias"})`,
      precoBRL: Math.round(
        DIARIA_MOTORISTA_PRIVADO_USD * p.motoristaDias * Math.max(1, Math.ceil(pessoas / MOTORISTA_TAMANHO_GRUPO)) * c,
      ),
    });
  }

  for (const ext of EXTENSOES_INTERNACIONAIS) {
    if (!p.extensoes.has(ext.key)) continue;
    const categoria = p.extCategorias[ext.key];
    linhas.push({
      label: `Extensão ${ext.nome} — ${categoria} (+${ext.dias} dias)`,
      precoBRL: precoExtensaoPorCategoria(ext, categoria, p.tipoQuarto, pessoas, c).total,
    });
  }

  return { linhas, total: linhas.reduce((s, l) => s + l.precoBRL, 0), precoSeguro, avisoSeguro };
}

type Resultado = {
  precoCafe: number;
  avisoCategoriaTemporada: string | null;
  extras: LinhaExtra[];
  avisoSeguro: string | null;
  categoriaHotel: CategoriaHotel;
  classeAereo: ClasseAereo;
  precoRoteiro: number;
  precoHotel: number;
  precoAereo: number;
  precoSeguro: number;
  total: number;
  coube: boolean;
};

// Preenchimento automático por orçamento, versão simplificada da mesma
// lógica da Calculadora Reversa interna (app/calculadora_reversa/page.tsx):
// sobe a categoria do hotel enquanto couber (com aéreo Economy fixo) e, no
// que sobrar, sobe a classe do aéreo. Sem downgrade de dias/pessoas — se
// não couber nem no básico, devolve a configuração mais barata mesmo
// assim, com `coube: false`, pra a pessoa ver o tamanho do gap.
function simular(params: {
  orcamento: number;
  dias: number;
  pessoas: number;
  tipoQuarto: TipoQuarto;
  cidades: DestinoKey[];
  cambioCotacao: number;
  precoSeguro: number;
  avisoSeguro: string | null;
  extras: LinhaExtra[];
  hotelMax: CategoriaHotel;
  classeMax: ClasseAereo;
  comCafe: boolean;
  temporada: TemporadaKey;
  ajusteAereoPorPessoa: number;
}): Resultado {
  const { orcamento, dias, pessoas, tipoQuarto, cidades, cambioCotacao } = params;
  const extrasTotal = params.extras.reduce((s, l) => s + l.precoBRL, 0);
  const multCidadeBase = multiplicadorCidades(cidades);
  const multTemporada = multiplicadorTemporadaCidades(cidades, params.temporada);
  const roteiro = precoRoteiro(dias);
  const seguro = params.precoSeguro;
  const ajusteAereo = params.ajusteAereoPorPessoa;
  const indiceHotelMax = CATEGORIAS_HOTEL.indexOf(params.hotelMax);
  const indiceClasseMax = CLASSES_AEREO.indexOf(params.classeMax);
  const aereoEconomy = precoAereoCalc("Economy", pessoas, cambioCotacao, ajusteAereo);

  function categoriaPara(multTemp: number): CategoriaHotel {
    let escolhida: CategoriaHotel = CATEGORIAS_HOTEL[0];
    for (const cat of CATEGORIAS_HOTEL) {
      if (CATEGORIAS_HOTEL.indexOf(cat) > indiceHotelMax) break;
      const hotel = precoHotelCalc(cat, dias, pessoas, tipoQuarto, multCidadeBase * multTemp);
      if (roteiro + seguro + extrasTotal + hotel + aereoEconomy <= orcamento) {
        escolhida = cat;
      } else {
        break;
      }
    }
    return escolhida;
  }

  const categoriaHotel = categoriaPara(multTemporada);
  const categoriaForaDeTemporada = params.temporada !== "baixa" ? categoriaPara(1) : categoriaHotel;
  const avisoCategoriaTemporada =
    CATEGORIAS_HOTEL.indexOf(categoriaHotel) < CATEGORIAS_HOTEL.indexOf(categoriaForaDeTemporada)
      ? `Categoria de hotel ajustada de ${categoriaForaDeTemporada} para ${categoriaHotel} para caber no orçamento nesta temporada.`
      : null;

  const hotelEscolhido = precoHotelCalc(categoriaHotel, dias, pessoas, tipoQuarto, multCidadeBase * multTemporada);
  const precoCafe = params.comCafe
    ? Math.round(ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA[categoriaHotel] * dias * pessoas)
    : 0;

  let classeAereo: ClasseAereo = CLASSES_AEREO[0];
  for (const classe of CLASSES_AEREO) {
    if (CLASSES_AEREO.indexOf(classe) > indiceClasseMax) break;
    const aereo = precoAereoCalc(classe, pessoas, cambioCotacao, ajusteAereo);
    if (roteiro + seguro + extrasTotal + hotelEscolhido + precoCafe + aereo <= orcamento) {
      classeAereo = classe;
    } else {
      break;
    }
  }

  const aereoEscolhido = precoAereoCalc(classeAereo, pessoas, cambioCotacao, ajusteAereo);
  const total = roteiro + seguro + extrasTotal + hotelEscolhido + precoCafe + aereoEscolhido;

  return {
    precoCafe,
    avisoCategoriaTemporada,
    categoriaHotel,
    classeAereo,
    precoRoteiro: roteiro,
    precoHotel: hotelEscolhido,
    precoAereo: aereoEscolhido,
    precoSeguro: seguro,
    extras: params.extras,
    avisoSeguro: params.avisoSeguro,
    total,
    coube: total <= orcamento,
  };
}

export default function ViagemPersonalizadaSelfServicePage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataViagem, setDataViagem] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [orcamento, setOrcamento] = useState(80000);
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [tipoQuarto, setTipoQuarto] = useState<TipoQuarto>("Duplo (casal)");
  const [cidades, setCidades] = useState<DestinoKey[]>(["tokyo", "kyoto"]);

  const [temasSelecionados, setTemasSelecionados] = useState<Set<TemaKey>>(() => new Set());
  const [jrPessoas, setJrPessoas] = useState(0);
  const [jrDias, setJrDias] = useState<(typeof JR_PASS_DIAS_OPCOES)[number]>(JR_PASS_DIAS_OPCOES[0]);
  const [jrClasse, setJrClasse] = useState<"comum" | "green">("comum");
  const [guiaTipo, setGuiaTipo] = useState<"brasileiro" | "estrangeiro">("brasileiro");
  const [guiaDias, setGuiaDias] = useState(0);
  const [motoristaDias, setMotoristaDias] = useState(0);
  const [extensoes, setExtensoes] = useState<Set<ExtensaoInternacionalKey>>(new Set());
  const [extCategorias, setExtCategorias] = useState<Record<ExtensaoInternacionalKey, CategoriaHotelExtensao>>({
    coreiaDoSul: "4 estrelas",
    china: "4 estrelas",
  });
  const [cambioCidade, setCambioCidade] = useState<CidadeCambioIeneSlug>("sao-paulo");
  const [quantidadeIenes, setQuantidadeIenes] = useState(CAMBIO_IENES_MINIMO);
  const [cambioExpandido, setCambioExpandido] = useState(false);
  const cambioIene = useCambioIene(cambioCidade);
  const cotacaoIene = cambioIene?.cotacaoBRLPorJPY ?? COTACAO_FALLBACK_BRL_POR_JPY;
  const cidadesDisponiveis = [...CIDADES_OFERECIDAS, ...cidades.filter((c) => !CIDADES_OFERECIDAS.includes(c))];

  const cidadesTemasAtivos = useMemo(() => {
    const mapa = new Map<DestinoKey, { key: DestinoKey; destaques: { tema: string; texto: string }[] }>();
    temasSelecionados.forEach((temaKey) => {
      const tema = TEMAS.find((t) => t.key === temaKey);
      tema?.cidades.forEach((c) => {
        const atual = mapa.get(c.key);
        if (atual) atual.destaques.push({ tema: tema.nome, texto: c.destaque });
        else mapa.set(c.key, { key: c.key, destaques: [{ tema: tema.nome, texto: c.destaque }] });
      });
    });
    return Array.from(mapa.values());
  }, [temasSelecionados]);

  function alternarTema(temaKey: TemaKey | null) {
    if (temaKey === null) {
      setTemasSelecionados(new Set());
      setCidades(["tokyo"]);
      return;
    }
    const novo = new Set(temasSelecionados);
    if (novo.has(temaKey)) novo.delete(temaKey);
    else if (novo.size < MAX_TEMAS_SIMULTANEOS) novo.add(temaKey);
    else return;
    setTemasSelecionados(novo);

    const uniao: DestinoKey[] = [];
    novo.forEach((key) => {
      const tema = TEMAS.find((t) => t.key === key);
      const classicoLongo = key === "roteiroClassico" && dias > 10;
      tema?.cidades
        .filter((c) => c.padrao || (classicoLongo && (c.key === "fuji" || c.key === "hakone")))
        .forEach((c) => {
          if (!uniao.includes(c.key)) uniao.push(c.key);
        });
    });
    setCidades(uniao.length > 0 ? uniao.slice(0, MAX_CIDADES) : ["tokyo"]);

    if (novo.has("parquesEntretenimento")) {
      setIngressos((a) => {
        const n = new Set(a);
        n.add("disneyland");
        n.add("disneysea");
        n.add("usj");
        return n;
      });
    }
  }
  function alternarExtensao(k: ExtensaoInternacionalKey) {
    setExtensoes((a) => {
      const n = new Set(a);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  const [hotelMax, setHotelMax] = useState<CategoriaHotel>("Elite");
  const [classeMax, setClasseMax] = useState<ClasseAereo>("First Class");
  const [comCafe, setComCafe] = useState(true);
  const [temporada, setTemporada] = useState<TemporadaKey>("baixa");
  const [mesEstimado, setMesEstimado] = useState<number | null>(null);
  const [origemVoo, setOrigemVoo] = useState<OrigemVooKey>("saoPaulo");
  const [bagagem, setBagagem] = useState<BagagemKey>("uma");
  const ajusteOrigem = ORIGENS_VOO.find((o) => o.key === origemVoo)?.ajusteBRL ?? 0;
  const ajusteBagagem = BAGAGEM_OPCOES.find((b) => b.key === bagagem)?.ajusteBRL ?? 0;
  const [idades, setIdades] = useState<number[]>([]);
  const [esimSelecionado, setEsimSelecionado] = useState<number | null>(null);
  const [ingressos, setIngressos] = useState<Set<IngressoKey>>(new Set());
  const [premierAtracoes, setPremierAtracoes] = useState(0);
  const [usjTier, setUsjTier] = useState<UsjTierKey>("nenhum");
  const [servicos, setServicos] = useState<Set<ServicoKey>>(new Set());

  const jrPessoasEfetivo = Math.min(jrPessoas, pessoas);
  const guiaDiasEfetivo = Math.min(guiaDias, dias);
  const motoristaDiasEfetivo = Math.min(motoristaDias, dias);
  const idadesConsideradas = Array.from({ length: pessoas }, (_, i) => idades[i] ?? 35);
  const esimPessoas = Math.min(esimSelecionado ?? pessoas, pessoas);

  function definirIdade(i: number, valor: number) {
    setIdades((atual) => {
      const novo = [...atual];
      while (novo.length <= i) novo.push(35);
      novo[i] = Math.max(0, Math.min(120, valor));
      return novo;
    });
  }
  function alternarIngresso(k: IngressoKey) {
    setIngressos((a) => {
      const n = new Set(a);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }
  function alternarServico(k: ServicoKey) {
    setServicos((a) => {
      const n = new Set(a);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }
  const rotuloUSD = (usd: number) => formatBRL(Math.round(usd * cambioCotacao));

  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function alternarCidade(key: DestinoKey) {
    setCidades((atual) => {
      if (atual.includes(key)) return atual.filter((c) => c !== key);
      if (atual.length >= MAX_CIDADES) return atual;
      return [...atual, key];
    });
  }

  const nomesCidadesSelecionadas = useMemo(
    () => cidades.map((c) => DESTINOS.find((d) => d.key === c)?.nome ?? c),
    [cidades],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    if (!whatsapp.trim() && !email.trim()) {
      setStatus("erro");
      setErro("Informe pelo menos o WhatsApp ou o e-mail para receber a simulação.");
      return;
    }

    const extrasCalculados = calcularExtras({
      dias,
      pessoas,
      cidadesQtd: cidades.length,
      cambioCotacao,
      idades: idadesConsideradas,
      esimPessoas,
      ingressos,
      premierAtracoes,
      usjTier,
      servicos,
      tipoQuarto,
      jrPessoas: jrPessoasEfetivo,
      jrDias,
      jrClasse,
      guiaDias: guiaDiasEfetivo,
      guiaTipo,
      motoristaDias: motoristaDiasEfetivo,
      extensoes,
      extCategorias,
      cotacaoIene,
      quantidadeIenes,
    });
    const resultadoCalculado = simular({
      orcamento,
      dias,
      pessoas,
      tipoQuarto,
      cidades,
      cambioCotacao,
      precoSeguro: extrasCalculados.precoSeguro,
      avisoSeguro: extrasCalculados.avisoSeguro,
      extras: extrasCalculados.linhas,
      hotelMax,
      classeMax,
      comCafe,
      temporada,
      ajusteAereoPorPessoa: ajusteOrigem + ajusteBagagem,
    });
    setResultado(resultadoCalculado);
    setStatus("enviando");
    setErro("");

    try {
      const res = await fetch("/api/viagem-personalizada-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          whatsapp,
          dataViagem,
          observacoes,
          orcamento,
          dias,
          pessoas,
          tipoQuarto,
          cidades: nomesCidadesSelecionadas,
          categoriaHotel: resultadoCalculado.categoriaHotel,
          classeAereo: resultadoCalculado.classeAereo,
          valorEstimado: resultadoCalculado.total,
          idades: idadesConsideradas,
          temas: TEMAS.filter((t) => temasSelecionados.has(t.key)).map((t) => t.nome),
          hotelMax,
          classeMax,
          comCafe,
          temporada: TEMPORADAS.find((t) => t.key === temporada)?.nome ?? temporada,
          origemVoo: ORIGENS_VOO.find((o) => o.key === origemVoo)?.nome ?? origemVoo,
          bagagem: BAGAGEM_OPCOES.find((b) => b.key === bagagem)?.nome ?? bagagem,
          extras: resultadoCalculado.extras,
          interesses: SERVICOS_PUBLICOS.filter((sv) => sv.sobConsulta && servicos.has(sv.key)).map((sv) => sv.nome),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível enviar.");
      setStatus("enviado");
    } catch (err) {
      setStatus("erro");
      setErro(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  }

  if (status === "enviado" && resultado) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white md:px-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="mx-auto h-11 w-auto object-contain"
            />
          </Link>
          <h1 className={`${display.className} mt-8 text-3xl font-medium md:text-4xl`}>
            Sua simulação está pronta
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Recebemos seus dados — nossa equipe já pode acompanhar sua simulação e vai entrar em
            contato pelo WhatsApp em breve.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Sugestão inicial</p>
            <p className={`${display.className} mt-2 text-2xl font-medium text-[#6ec3d9]`}>
              Hotel {resultado.categoriaHotel} · Aéreo {resultado.classeAereo}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {dias} dias · {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}
              {nomesCidadesSelecionadas.length > 0 ? ` · ${nomesCidadesSelecionadas.join(", ")}` : ""}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Roteiro</span>
                <span>{formatBRL(resultado.precoRoteiro)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Aéreo ({resultado.classeAereo})</span>
                <span>{formatBRL(resultado.precoAereo)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Hotel ({resultado.categoriaHotel})</span>
                <span>{formatBRL(resultado.precoHotel)}</span>
              </div>
              {resultado.precoCafe > 0 && (
                <div className="flex justify-between text-white/60">
                  <span>Café da manhã — Hotel {resultado.categoriaHotel}</span>
                  <span>{formatBRL(resultado.precoCafe)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Seguro viagem</span>
                <span>{formatBRL(resultado.precoSeguro)}</span>
              </div>
              {resultado.extras.map((l) => (
                <div key={l.label} className="flex justify-between gap-4 text-white/60">
                  <span>{l.label}</span>
                  <span className="shrink-0">{formatBRL(l.precoBRL)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium text-white">
                <span>Total estimado</span>
                <span>{formatBRL(resultado.total)}</span>
              </div>
            </div>

            {resultado.avisoCategoriaTemporada && (
              <p className="mt-4 text-xs leading-5 text-amber-400/90">{resultado.avisoCategoriaTemporada}</p>
            )}
            {ajusteOrigem > 0 && (
              <p className="mt-4 text-xs leading-5 text-white/45">
                O aéreo já inclui {formatBRL(ajusteOrigem)}/pessoa por não sair de São Paulo/GRU.
              </p>
            )}
            {resultado.avisoSeguro && (
              <p className="mt-4 text-xs leading-5 text-amber-400/90">{resultado.avisoSeguro}</p>
            )}

            {!resultado.coube && (
              <p className="mt-4 text-xs leading-5 text-amber-400/90">
                Esse é o pacote mais simples que oferecemos e ainda assim passa um pouco do
                orçamento informado — nossa equipe pode ajudar a ajustar dias, pessoas ou destinos
                pra caber melhor.
              </p>
            )}

            <p className="mt-6 text-[11px] leading-5 text-white/35">
              Estimativa automática, não uma proposta fechada — os valores finais dependem de
              datas, disponibilidade e curadoria da nossa equipe.
            </p>
          </div>

          <a
            href="https://wa.me/5511930300101"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#279E52] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#1f7d41]"
          >
            Falar agora no WhatsApp
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Simulador de viagem personalizada
          </p>
          <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight md:text-4xl`}>
            Monte uma estimativa da sua viagem ao Japão
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            Diga seu orçamento e o formato da viagem — mostramos, na hora, até onde ele rende em
            hotel e classe do voo. Depois é só confirmar seus dados que nossa equipe assume dali.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 md:p-8">
            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="1. Orçamento máximo (R$)" />
              </span>
              <input
                type="number"
                min={MIN_ORCAMENTO}
                max={MAX_ORCAMENTO}
                step={500}
                value={orcamento}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v)) setOrcamento(v);
                }}
                className="h-12 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 text-lg font-medium text-white outline-none focus:border-white/40"
              />
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

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="4. Tipo de quarto" />
              </span>
              <select
                value={tipoQuarto}
                onChange={(e) => setTipoQuarto(e.target.value as TipoQuarto)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              >
                {TIPOS_QUARTO.map((t) => (
                  <option key={t} value={t} className="bg-black">
                    {TIPO_QUARTO_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="5. Categoria máxima de hotel" />
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_HOTEL.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setHotelMax(cat)}
                    aria-pressed={hotelMax === cat}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                        hotelMax === cat
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 text-white/60 hover:border-white/30"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                {hotelMax === "Elite"
                  ? "Sem limite — sobe o máximo que o orçamento permitir."
                  : `A simulação não passa de ${hotelMax}, mesmo sobrando orçamento.`}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="6. Classe desejada do voo" />
              </span>
              <div className="flex flex-wrap gap-2">
                {CLASSES_AEREO.map((cl) => (
                  <button
                    key={cl}
                    type="button"
                    onClick={() => setClasseMax(cl)}
                    aria-pressed={classeMax === cl}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                        classeMax === cl
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 text-white/60 hover:border-white/30"
                      }`}
                  >
                    {cl}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                {classeMax === "First Class"
                  ? "Sem limite — sobe o máximo que o orçamento permitir."
                  : `A simulação não passa de ${classeMax}, mesmo sobrando orçamento.`}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col">
                  <span className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Origem do voo</span>
                  <select
                    value={origemVoo}
                    onChange={(e) => setOrigemVoo(e.target.value as OrigemVooKey)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
                  >
                    {ORIGENS_VOO.map((o) => (
                      <option key={o.key} value={o.key} className="bg-black">
                        {o.nome}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 text-[11px] text-white/35">
                    {ajusteOrigem === 0
                      ? "Referência — sem ajuste no aéreo."
                      : `+ ${formatBRL(ajusteOrigem)}/pessoa no aéreo (trecho doméstico até um hub internacional).`}
                  </span>
                </label>
                <label className="flex flex-col">
                  <span className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Bagagem</span>
                  <select
                    value={bagagem}
                    onChange={(e) => setBagagem(e.target.value as BagagemKey)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
                  >
                    {BAGAGEM_OPCOES.map((b) => (
                      <option key={b.key} value={b.key} className="bg-black">
                        {b.nome}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 text-[11px] text-white/35">
                    {ajusteBagagem === 0
                      ? "Referência — sem ajuste no aéreo."
                      : `Ajuste estimado de +${formatBRL(ajusteBagagem)}/pessoa (taxa de mala extra) — confirmamos o valor exato com a companhia aérea.`}
                  </span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="7. Café da manhã" />
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {[
                  { v: true, nome: "Com café da manhã", sub: "Buffet incluso — adicional varia por categoria", img: "/images/com-cafe-da-manha.png" },
                  { v: false, nome: "Sem café da manhã", sub: "Diária \"room only\"", img: "/images/sem-cafe-da-manha.png" },
                ].map((o) => (
                  <button
                    key={String(o.v)}
                    type="button"
                    onClick={() => setComCafe(o.v)}
                    aria-pressed={comCafe === o.v}
                    className={`flex h-[13.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                      comCafe === o.v
                        ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                        : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                    }`}
                  >
                    <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.img} alt="" className="h-16 w-16 object-contain" />
                    </div>
                    <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{o.nome}</span>
                    <span className="text-[10px] font-normal leading-tight text-white/40">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="8. Temporada" />
              </span>
              <label className="mb-3 flex max-w-xs flex-col">
                <span className="mb-1 text-[10px] uppercase tracking-wide text-white/40">
                  Mês estimado da viagem (opcional — sugere a temporada)
                </span>
                <select
                  value={mesEstimado ?? ""}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    setMesEstimado(v);
                    if (v) setTemporada(MES_PARA_TEMPORADA[v]);
                  }}
                  className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
                >
                  <option value="" className="bg-black">Ainda não definido</option>
                  {MESES_NOME.map((nome, i) => (
                    <option key={nome} value={i + 1} className="bg-black">
                      {nome}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {TEMPORADAS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemporada(t.key)}
                    aria-pressed={temporada === t.key}
                    className={`flex h-[13.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                      temporada === t.key
                        ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                        : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                    }`}
                  >
                    <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.icone} alt="" className="h-16 w-16 object-contain" />
                    </div>
                    <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{t.nome}</span>
                    <span className="text-[10px] font-normal leading-tight text-white/40">{t.periodo}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="9. Temas" />{" "}
                <span className="normal-case tracking-normal text-white/35">
                  (opcional — selecione até {MAX_TEMAS_SIMULTANEOS} pra misturar)
                </span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                <button
                  type="button"
                  onClick={() => alternarTema(null)}
                  aria-pressed={temasSelecionados.size === 0}
                  className={`flex h-[9.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                    temasSelecionados.size === 0 ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/temas/01-sem-tema.png" alt="" className="h-16 w-16 object-contain" />
                  </div>
                  <span className="flex flex-1 items-center leading-tight">Sem tema</span>
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
                      aria-pressed={marcado}
                      className={`flex h-[9.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        marcado
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : desabilitado
                            ? "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30"
                            : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tema.icone} alt="" className={`h-16 w-16 object-contain ${desabilitado ? "opacity-40" : ""}`} />
                      </div>
                      <span className="flex flex-1 items-center leading-tight">{tema.nome}</span>
                    </button>
                  );
                })}
              </div>

              {temasSelecionados.size > 0 && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <div className="bg-white/[0.06] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-white/60">
                    Cidades recomendadas — destaques do{temasSelecionados.size > 1 ? "s temas" : " tema"}
                  </div>
                  {cidadesTemasAtivos.map((c) => {
                    const destino = DESTINOS.find((d) => d.key === c.key);
                    const marcado = cidades.includes(c.key);
                    return (
                      <label
                        key={c.key}
                        className="grid cursor-pointer grid-cols-[minmax(120px,auto)_1fr] items-start gap-x-4 border-t border-white/10 px-4 py-3"
                      >
                        <span className="flex items-center gap-2 text-sm text-white/80">
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={() => alternarCidade(c.key)}
                            className="h-4 w-4 shrink-0 accent-[#6ec3d9]"
                          />
                          {destino?.nome ?? c.key}
                        </span>
                        <span className="text-xs leading-5 text-white/50">
                          {c.destaques.map((d, i) => (
                            <span key={i} className={i > 0 ? "mt-1 block" : "block"}>
                              {temasSelecionados.size > 1 && <span className="text-white/35">({d.tema}) </span>}
                              {d.texto}
                            </span>
                          ))}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="10. Cidades do roteiro" />{" "}
                <span className="normal-case tracking-normal text-white/35">
                  (até {MAX_CIDADES}, opcional)
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {cidadesDisponiveis.map((key) => {
                  const destino = DESTINOS.find((d) => d.key === key);
                  const marcado = cidades.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => alternarCidade(key)}
                      aria-pressed={marcado}
                      className={`rounded-full border px-4 py-2 text-xs transition ${
                        marcado
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {destino?.nome ?? key}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="11. Extensão internacional" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional — soma dias ao total da viagem)</span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {EXTENSOES_INTERNACIONAIS.map((ext) => {
                  const marcado = extensoes.has(ext.key);
                  return (
                    <button
                      key={ext.key}
                      type="button"
                      onClick={() => alternarExtensao(ext.key)}
                      aria-pressed={marcado}
                      className={`flex h-[11.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        marcado ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ext.icone} alt="" className="h-full w-full object-contain" />
                      </div>
                      <span className="leading-tight">{ext.nome}</span>
                      <span className="text-[10px] font-normal leading-tight text-white/40">
                        +{ext.dias} dias · {ext.cidades.map((c) => c.nome).join(" + ")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {EXTENSOES_INTERNACIONAIS.filter((ext) => extensoes.has(ext.key)).map((ext) => (
                <div key={ext.key} className="mt-5">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-white/40">
                    Pacote da extensão {ext.nome} — hotel {tipoQuarto} + deslocamento
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {CATEGORIAS_HOTEL_EXTENSAO.map((categoria) => {
                      const precos = precoExtensaoPorCategoria(ext, categoria, tipoQuarto, pessoas, cambioCotacao);
                      const selecionado = extCategorias[ext.key] === categoria;
                      return (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => setExtCategorias((a) => ({ ...a, [ext.key]: categoria }))}
                          aria-pressed={selecionado}
                          className={`rounded-xl border px-3 py-2.5 text-left transition ${
                            selecionado ? "border-[#6ec3d9] bg-[#6ec3d9]/15" : "border-white/15 bg-white/[0.04] hover:border-white/30"
                          }`}
                        >
                          <span aria-hidden className="block text-base leading-none tracking-[1.5px] text-[#6ec3d9]">
                            {"★".repeat(parseInt(categoria, 10))}
                          </span>
                          <span className={`mt-1 block text-xs font-medium ${selecionado ? "text-[#6ec3d9]" : "text-white/70"}`}>
                            {categoria}
                          </span>
                          <span className="mt-0.5 block text-sm font-semibold text-white">{formatBRL(precos.total)}</span>
                          <span className="mt-0.5 block text-[10px] text-white/40">
                            Hotel {formatBRL(precos.hotel)} + deslocamento {formatBRL(precos.deslocamento)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-white/40">
                    {ext.deslocamento.map((trecho) => (
                      <span key={trecho.label}>✈ {trecho.label}</span>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {ext.roteiro.map((dia) => (
                      <div
                        key={`${ext.key}-${dia.cidade}-${dia.dia}`}
                        className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                      >
                        {dia.imagem ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dia.imagem}
                            alt=""
                            className="h-32 w-full object-cover"
                            style={{ objectPosition: dia.posicaoImagem ?? "center" }}
                          />
                        ) : null}
                        <div className="p-3">
                          <p className="text-[9px] uppercase tracking-[0.15em] text-[#6ec3d9]">
                            {ext.cidades.length > 1 ? `${dia.cidade} · ` : ""}Dia {dia.dia}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-white">{dia.titulo}</p>
                          <ul className="mt-2 space-y-0.5 text-[11px] leading-4 text-white/55">
                            {dia.pontos.map((ponto) => (
                              <li key={ponto}>• {ponto}</li>
                            ))}
                          </ul>
                          <p className="mt-2 text-[11px] italic leading-4 text-white/40">{dia.conceito}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="12. JR Pass — validade e classe" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-white/40">Validade</span>
                  <div className="flex flex-wrap gap-2">
                    {JR_PASS_DIAS_OPCOES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setJrDias(d)}
                        aria-pressed={jrDias === d}
                        className={`flex h-20 w-28 items-center justify-center rounded-lg border px-2 text-center text-sm transition ${
                          jrDias === d ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                        }`}
                      >
                        {d} dias
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-white/40">Classe</span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { key: "comum", label: "Comum (Ordinary)", icone: "/images/ingressos/shinkansen-ordinary.png" },
                        { key: "green", label: "Green Car", icone: "/images/ingressos/jr-green-car.png" },
                      ] as const
                    ).map((cl) => (
                      <button
                        key={cl.key}
                        type="button"
                        onClick={() => setJrClasse(cl.key)}
                        aria-pressed={jrClasse === cl.key}
                        className={`flex h-20 w-28 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-center text-xs transition ${
                          jrClasse === cl.key ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cl.icone} alt="" className="h-8 w-8 shrink-0 rounded bg-white/90 object-contain p-0.5" />
                        <span>{cl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                {rotuloUSD((jrClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD)[jrDias])} por pessoa
              </p>
              <div className="mt-2 max-w-xs">
                <NumberStepper
                  label="Quantas pessoas usam o JR Pass"
                  value={jrPessoasEfetivo}
                  onChange={setJrPessoas}
                  min={0}
                  max={pessoas}
                  formatValue={(v) => (v === 0 ? "Sem JR Pass" : `${v} de ${pessoas} viajante${pessoas === 1 ? "" : "s"}`)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="13. Guia turístico" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(["brasileiro", "estrangeiro"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGuiaTipo(t)}
                    aria-pressed={guiaTipo === t}
                    className={`h-10 rounded-lg border px-4 text-sm transition ${
                      guiaTipo === t ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                    }`}
                  >
                    {t === "brasileiro" ? "Guia brasileiro" : "Guia estrangeiro"}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                {guiaTipo === "brasileiro" ? "Fluente em português." : "Português limitado ou inglês."}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="max-w-xs flex-1">
                  <NumberStepper
                    label="Quantos dias você quer guia"
                    value={guiaDiasEfetivo}
                    onChange={setGuiaDias}
                    min={0}
                    max={dias}
                    formatValue={(v) => (v === 0 ? "Sem guia" : `${v} de ${dias} dia${dias === 1 ? "" : "s"}`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setGuiaDias(0)}
                  aria-pressed={guiaDiasEfetivo === 0}
                  className={`h-10 shrink-0 rounded-lg border px-3 text-xs font-medium transition ${
                    guiaDiasEfetivo === 0 ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]" : "border-white/15 text-white/55 hover:border-white/30"
                  }`}
                >
                  Sem guia
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                {rotuloUSD(guiaTipo === "brasileiro" ? DIARIA_GUIA_USD : DIARIA_GUIA_ESTRANGEIRO_USD)}/dia a cada{" "}
                {GUIA_TAMANHO_GRUPO} pessoas
              </p>
            </div>

            <div className="sm:col-span-2 sm:max-w-xs">
              <NumberStepper
                label="14. Motorista privado — dias"
                value={motoristaDiasEfetivo}
                onChange={setMotoristaDias}
                min={0}
                max={dias}
                formatValue={(v) => (v === 0 ? "Sem motorista" : `${v} de ${dias} dia${dias === 1 ? "" : "s"}`)}
              />
              <p className="mt-1.5 text-[11px] text-white/35">
                {rotuloUSD(DIARIA_MOTORISTA_PRIVADO_USD)}/dia para até {MOTORISTA_TAMANHO_GRUPO} pessoas — não inclui o
                transfer aeroporto ↔ hotel.
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="15. Câmbio de ienes" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              {!(cambioExpandido || servicos.has("cambioBrasil")) ? (
                <button
                  type="button"
                  onClick={() => {
                    setCambioExpandido(true);
                    setServicos((a) => new Set(a).add("cambioBrasil"));
                  }}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-white/25 px-3 py-2 text-xs text-white/50 transition hover:border-white/40 hover:text-white/70"
                >
                  <span aria-hidden className="text-sm leading-none">+</span>
                  Incluir câmbio de ienes no Brasil
                </button>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col">
                      <span className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Cidade</span>
                      <select
                        value={cambioCidade}
                        onChange={(e) => setCambioCidade(e.target.value as CidadeCambioIeneSlug)}
                        className="h-10 w-40 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
                      >
                        {CIDADES_CAMBIO_IENE.map((c) => (
                          <option key={c.slug} value={c.slug} className="bg-black">
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col">
                      <span className="mb-1 text-[10px] uppercase tracking-wide text-white/40">
                        Quantidade de ienes (mín. ¥{CAMBIO_IENES_MINIMO.toLocaleString("pt-BR")})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/40">¥</span>
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
                          className="h-10 w-32 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
                        />
                      </div>
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/35">
                    {servicos.has("cambioBrasil")
                      ? `Valor estimado: ${formatBRL(Math.round(PRECO_CAMBIO_BRASIL + quantidadeIenes * cotacaoIene * FATOR_CAMBIO_IENE))} (taxa de serviço + ienes em espécie).`
                      : "Marque “Câmbio no Brasil” em Serviços adicionais para incluir no pacote."}
                  </p>
                </>
              )}
            </div>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="16. Data prevista da viagem" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <input
                type="date"
                value={dataViagem}
                onChange={(e) => {
                  setDataViagem(e.target.value);
                  const mes = Number(e.target.value.split("-")[1]);
                  if (mes >= 1 && mes <= 12) {
                    setMesEstimado(mes);
                    setTemporada(MES_PARA_TEMPORADA[mes]);
                  }
                }}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40 [color-scheme:dark]"
              />
            </label>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="17. Seguro viagem — idade dos passageiros" />
              </span>
              <div className="flex flex-wrap gap-2">
                {idadesConsideradas.map((idade, i) => (
                  <div key={i} className="w-36 rounded-lg border border-white/15 bg-white/[0.04] p-3">
                    <p className="text-[10px] uppercase tracking-wide text-white/40">Passageiro {i + 1}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={idade}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) definirIdade(i, v);
                        }}
                        className="h-9 w-16 rounded-md border border-white/15 bg-white/[0.06] px-2 text-sm text-white outline-none focus:border-white/40"
                      />
                      <span className="text-xs text-white/50">anos</span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-4 text-white/35">
                      {idade > IDADE_LIMITE_SEGURO
                        ? `Acima de ${IDADE_LIMITE_SEGURO} anos — sob consulta`
                        : (multiplicadorSeguroPorIdade(idade) ?? 1) > 1
                          ? "Valor ajustado pela idade"
                          : "Valor padrão"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 sm:max-w-xs">
              <NumberStepper
                label="18. Conexão de internet — eSIM"
                value={esimPessoas}
                onChange={setEsimSelecionado}
                min={0}
                max={pessoas}
                formatValue={(v) => `${v} de ${pessoas} viajante${pessoas === 1 ? "" : "s"}`}
              />
              <p className="mt-1.5 text-[11px] text-white/35">Um eSIM por pessoa, plano ilimitado.</p>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="19. Ingressos e experiências" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {INGRESSOS_PUBLICOS.map((ing) => {
                  const marcado = ingressos.has(ing.key);
                  return (
                    <label
                      key={ing.key}
                      className={`flex h-[13.5rem] w-32 cursor-pointer flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        marcado
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <input type="checkbox" checked={marcado} onChange={() => alternarIngresso(ing.key)} className="sr-only" />
                      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                        <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ing.icone} alt="" className="max-h-16 w-auto max-w-full object-contain" />
                        </div>
                        <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{ing.nome}</span>
                      </div>
                      <span className="flex min-h-[2.5rem] w-full items-center justify-center rounded-md bg-[#6ec3d9]/10 px-2 py-1 text-[11px] font-semibold leading-tight text-[#6ec3d9]">
                        {rotuloUSD(ing.precoUSD)}/pessoa
                      </span>
                    </label>
                  );
                })}
              </div>

              {(ingressos.has("disneyland") || ingressos.has("disneysea")) && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-medium text-white/80">+ Disney Premier Access (fast pass pago)</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-white/40">
                    Vendido por atração, conforme a popularidade — escolha quantas quiser.
                  </p>
                  <div className="mt-2 max-w-xs">
                    <NumberStepper
                      label="Quantidade de atrações"
                      value={premierAtracoes}
                      onChange={setPremierAtracoes}
                      min={0}
                      max={8}
                      formatValue={(v) =>
                        v === 0
                          ? "Sem Premier Access"
                          : `${v} ${v === 1 ? "atração" : "atrações"} · ${rotuloUSD(v * PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX)}/pessoa`
                      }
                    />
                  </div>
                </div>
              )}

              {ingressos.has("usj") && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-medium text-white/80">+ USJ Express Pass (fast pass pago)</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-white/40">
                    Fura-fila em um número variável de atrações; o combo exato varia por temporada e nossa equipe
                    confirma com você antes de fechar.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {USJ_EXPRESS_PASS_PUBLICO.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setUsjTier(t.key)}
                        aria-pressed={usjTier === t.key}
                        className={`rounded-lg border px-3 py-2 text-center text-xs transition ${
                          usjTier === t.key
                            ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                            : "border-white/15 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <span className="block">{t.label}</span>
                        {t.precoUSD > 0 && <span className="block text-[10px] opacity-70">{rotuloUSD(t.precoUSD)}/pessoa</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="20. Serviços adicionais" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {SERVICOS_PUBLICOS.map((sv) => {
                  const marcado = servicos.has(sv.key);
                  const desabilitado = sv.key === "restaurantesHighEnd" && pessoas > RESTAURANTES_HIGHEND_LIMITE_PESSOAS;
                  const precoLabel =
                    sv.sobConsulta
                      ? "Sob consulta"
                      : sv.key === "cambioBrasil"
                        ? `*${formatBRL(PRECO_CAMBIO_BRASIL)} + valor dos ienes`
                        : sv.key === "malasIntermunicipal"
                        ? `*${rotuloUSD(PRECO_MALA_INTERMUNICIPAL_USD)}/mala/trecho`
                        : sv.key === "restaurantesHighEnd"
                          ? `*${rotuloUSD(PRECO_RESTAURANTES_HIGHEND_USD)} · até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas`
                          : sv.key === "transferOnibus"
                            ? `*${rotuloUSD(PRECO_TRANSFER_ONIBUS_USD_PAX)}/pessoa · ida e volta`
                            : sv.key === "reservaRestaurante"
                              ? `*${rotuloUSD(PRECO_RESERVA_RESTAURANTE_USD)}/reserva`
                              : sv.key === "experienciaSobMedida"
                                ? `*${rotuloUSD(PRECO_EXPERIENCIA_SOB_MEDIDA_USD)}/experiência`
                                : `*${rotuloUSD(DIARIA_CONCIERGE_USD)}/dia`;
                  return (
                    <label
                      key={sv.key}
                      className={`flex h-[13.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        desabilitado
                          ? "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30"
                          : marcado
                            ? "cursor-pointer border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                            : "cursor-pointer border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado && !desabilitado}
                        disabled={desabilitado}
                        onChange={() => alternarServico(sv.key)}
                        className="sr-only"
                      />
                      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                        <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sv.icone} alt="" className={`h-16 w-16 object-contain ${desabilitado ? "opacity-40" : ""}`} />
                        </div>
                        <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{sv.nome}</span>
                      </div>
                      <span
                        className={`flex min-h-[2.5rem] w-full items-center justify-center rounded-md px-2 py-1 text-[11px] font-semibold leading-tight ${
                          desabilitado ? "bg-white/5 text-white/30" : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {precoLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/35">
                * preço inicial — pode variar conforme grupo, trecho e disponibilidade. Itens “sob consulta” são
                cotados pela nossa equipe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:col-span-2">
              Seus dados, pra receber a simulação
            </p>

            <label className="flex flex-col">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Nome completo
              </span>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                WhatsApp (ou e-mail abaixo)
              </span>
              <input
                type="tel"
                placeholder="+55 11 91234-5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                E-mail (ou WhatsApp ao lado)
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Observações (opcional)
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/40"
              />
            </label>
          </div>

          {status === "erro" && (
            <p className="text-center text-sm text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={status === "enviando"}
            className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          >
            {status === "enviando" ? "Calculando…" : "Ver minha simulação"}
          </button>
        </form>
      </div>
    </main>
  );
}
