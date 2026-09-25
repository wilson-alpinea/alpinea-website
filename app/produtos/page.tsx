"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { PriceCalculator } from "../components/PriceCalculator";
import { MotoristaPrivadoPicker } from "../components/MotoristaPrivadoPicker";
import {
  SELECAO_MOTORISTA_VAZIA,
  calcularTotalMotoristaUSD,
  contarItensMotorista,
  resumoSelecaoMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type SelecaoMotorista,
} from "../lib/motoristaPrivadoRotas";
import {
  useCambioUSD,
  brlParaUSDLabel,
  formatBRL,
  formatUSD,
  type Cambio,
} from "../hooks/useCambioUSD";
import { useCambioEUR, formatEUR } from "../hooks/useCambioEUR";
import { useCambioDolarTurismo } from "../hooks/useCambioDolarTurismo";
import { useCambioIene, CIDADES_CAMBIO_IENE, type CidadeCambioIeneSlug, type DirecaoCambioIene } from "../hooks/useCambioIene";
import { CambioLabel } from "../components/CambioLabel";
import {
  HotelExemplosPropriedades,
  JR_PASS_PRECO_USD,
  JR_PASS_PRECO_USD_GREEN,
  JR_PASS_DIAS_OPCOES,
  DIARIA_SEGURO_VIAGEM,
  PRECO_CAMBIO_BRASIL,
  CUSTO_ENTREGA_AEROPORTO_CAMBIO,
  COMISSAO_AJISAI_SHOPPING_PCT,
  ROTEIRO_PRECO_BASE,
} from "../components/CustomPackageCard";
import { HotelQuoteCalculator } from "../components/HotelQuoteCalculator";
import { ContactCTA } from "../components/ContactCTA";
import {
  IDADE_LIMITE_SEGURO,
  multiplicadorSeguroPorIdade,
  TAXA_MAQUINA_CARTAO,
  TAXA_JUROS_CARTAO_MES,
  TAXA_JUROS_PIX_MES,
  calcularSimulacaoCartao,
  calcularParcelasMaxPix,
  calcularSimulacaoPix,
  SPREAD_CAMBIO_IENE_PUBLICO_COMPRA,
  SPREAD_CAMBIO_IENE_PUBLICO_VENDA,
  SPREAD_DOLAR_TURISMO_PUBLICO,
  CAMBIO_IENES_MINIMO_PUBLICO,
  MOEDAS_TRANSACAO_CAMBIO,
  type FormaPagamentoEscolhida,
  type MoedaTransacaoCambio,
} from "../lib/calculadoraCatalogoPublico";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_NUMBER = "5511930300101";

type ProdutoKey = "roteiro" | "caravana" | "individual" | "personalizado" | "guia";

// Usado na tela de qualificação e para montar a mensagem
// final do WhatsApp — uma única fonte de verdade para nome/preço.
const PRODUTOS: Record<
  ProdutoKey,
  { nome: string; precoBRL: number | null; precoUSD?: number; href: string }
> = {
  roteiro: {
    nome: "Roteiro Personalizado",
    precoBRL: 1500,
    href: "/ajisairoteiros",
  },
  caravana: {
    nome: "Caravana",
    // Preço "a partir de" — menor valor entre os pacotes Sakura de 7 dias
    // (Sakura 2 - Maio 2027), já em dólar fixo (ver /pacotes).
    precoBRL: null,
    precoUSD: 4280,
    href: "/pacotes#pacotes",
  },
  individual: {
    nome: "Individual ou Pequenos Grupos",
    // Preço "a partir de" — menor valor entre os pacotes Sakura de 7 dias
    // (Sakura 2 - Maio 2027), já em dólar fixo (ver /pacotes).
    precoBRL: null,
    precoUSD: 2490,
    href: "/pacotes#individuais",
  },
  personalizado: {
    nome: "Viagem Personalizada",
    precoBRL: null,
    href: "/viagem-personalizada",
  },
  guia: {
    nome: "Guia Turístico Avulso",
    // Diária cotada nativamente em dólar (não é conversão de um valor em
    // reais) — precoUSD tem prioridade sobre precoBRL no cálculo do preço.
    // US$ 350/dia, cobre até 4 pessoas (mesmo valor usado no calculador do
    // Pacote Personalizado — ver DIARIA_GUIA_USD em CustomPackageCard.tsx).
    precoBRL: null,
    precoUSD: 350,
    href: "/guia-turistico",
  },
};

// Espelha os 4 blocos do roteiro-vídeo descrito: perfil do dia, detalhe da
// atração, hotéis/restaurantes/anexos e o "nós planejamos, você reserva".
const ROTEIRO_DESTAQUES = [
  "Cada dia planejado de acordo com seu perfil: cidade, horário, atração, deslocamento e refeição.",
  "Cada atração com melhor horário, tempo de visita, estação, transporte recomendado e ingressos.",
  "Hotéis, restaurantes, logística e anexos especiais organizados em um único painel.",
  "Nós planejamos. Você reserva e viaja por conta própria.",
];
export default function ProdutosPage() {
  const cambio = useCambioUSD();

  function precoProdutoLabel(produto: (typeof PRODUTOS)[ProdutoKey], comPrefixo: boolean) {
    if (produto.precoUSD != null) {
      const valor = formatUSD(produto.precoUSD);
      return comPrefixo ? `A partir de ${valor}` : valor;
    }
    if (produto.precoBRL == null) return "Sob consulta";
    const valor = brlParaUSDLabel(produto.precoBRL, cambio);
    return comPrefixo ? `A partir de ${valor}` : valor;
  }

  // Linha "ou R$ X" mostrada junto do preço em dólar — null quando o
  // produto não tem preço fixo (ex: Pacote Personalizado, "Sob consulta").
  function precoBRLProdutoLabel(produto: (typeof PRODUTOS)[ProdutoKey]) {
    if (produto.precoUSD != null) {
      if (!cambio) return null;
      return `ou ${formatBRL(produto.precoUSD * cambio.cotacao)}`;
    }
    if (produto.precoBRL == null) return null;
    return `ou ${formatBRL(produto.precoBRL)}`;
  }

  const [qualProduto, setQualProduto] = useState<ProdutoKey | null>(null);
  const [nome, setNome] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [viajantes, setViajantes] = useState("");
  const [passagens, setPassagens] = useState<"sim" | "nao" | "">("");
  const [primeiraViagem, setPrimeiraViagem] = useState<"sim" | "nao" | "">("");
  const [enviado, setEnviado] = useState(false);
  const [roteiroModalOpen, setRoteiroModalOpen] = useState(false);
  const [pacotesModalOpen, setPacotesModalOpen] = useState(false);
  const [viagemModalOpen, setViagemModalOpen] = useState(false);
  const [passagensModalOpen, setPassagensModalOpen] = useState(false);
  const [guiaModalOpen, setGuiaModalOpen] = useState(false);
  const [servicosModalOpen, setServicosModalOpen] = useState(false);
  const [transporteModalOpen, setTransporteModalOpen] = useState(false);
  // Hoteis abre um popup avulso e leve com os exemplos de propriedade por
  // categoria — nao carrega a Viagem Personalizada (iframe) atras dele.
  const [hoteisModalOpen, setHoteisModalOpen] = useState(false);
  // Pedido do Wilson, 16/set/2026: "JR Pass, Cambio e Seguro Viagem
  // retirar do serviços avulsos, devem virar cards principais [...] seguir
  // mesmo template de layout" — mesmo padrão leve do popup de Hotéis (sem
  // iframe), já que são serviços simples, sem página própria.
  const [jrPassModalOpen, setJrPassModalOpen] = useState(false);
  const [seguroViagemModalOpen, setSeguroViagemModalOpen] = useState(false);
  const [cambioModalOpen, setCambioModalOpen] = useState(false);
  // Pedido do Wilson, 16/set/2026: "criar na pagina de calculadora reversa
  // e produtos um card novo de serviço chamado Ajisai Shopping" — mesmo
  // padrão leve do popup de JR Pass/Câmbio/Seguro Viagem (ServicoAvulsoModal).
  const [ajisaiShoppingModalOpen, setAjisaiShoppingModalOpen] = useState(false);

  // Deep link ?abrir=hoteis — pedido do Wilson, 16/set/2026: "em hotel,
  // colocar link para detalhes do serviço para que ele possa ver o que
  // tem em cada categoria em detalhes" (no PDF/Word da proposta, ver
  // EXPLICACOES_ITEM em PacotePdf.tsx). Lido direto de window.location
  // em vez de useSearchParams (next/navigation) pra não exigir um
  // Suspense boundary só por causa desse popup.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("abrir") === "hoteis") {
      setHoteisModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (
      !roteiroModalOpen &&
      !pacotesModalOpen &&
      !viagemModalOpen &&
      !passagensModalOpen &&
      !guiaModalOpen &&
      !servicosModalOpen &&
      !transporteModalOpen &&
      !hoteisModalOpen &&
      !jrPassModalOpen &&
      !seguroViagemModalOpen &&
      !cambioModalOpen &&
      !ajisaiShoppingModalOpen
    )
      return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRoteiroModalOpen(false);
        setPacotesModalOpen(false);
        setViagemModalOpen(false);
        setPassagensModalOpen(false);
        setGuiaModalOpen(false);
        setServicosModalOpen(false);
        setTransporteModalOpen(false);
        setHoteisModalOpen(false);
        setJrPassModalOpen(false);
        setSeguroViagemModalOpen(false);
        setCambioModalOpen(false);
        setAjisaiShoppingModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    roteiroModalOpen,
    pacotesModalOpen,
    viagemModalOpen,
    passagensModalOpen,
    guiaModalOpen,
    servicosModalOpen,
    transporteModalOpen,
    jrPassModalOpen,
    seguroViagemModalOpen,
    cambioModalOpen,
    ajisaiShoppingModalOpen,
    hoteisModalOpen,
  ]);

  // Entrada direta (CTA de cada produto) — vai direto para a qualificação,
  // já com o produto marcado.
  function escolherProduto(produto: ProdutoKey) {
    const produtoSelecionado = PRODUTOS[produto];
    const text = encodeURIComponent(
      `Olá! Tenho interesse em ${produtoSelecionado.nome} e gostaria de receber mais informações.`,
    );

    window.gtag?.("event", "whatsapp_click", {
      form_name: "produtos_interesse_direto",
      produto: produtoSelecionado.nome,
    });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  function trocarProduto() {
    setQualProduto(null);
    setEnviado(false);
  }

  function handleQualificar() {
    if (!qualProduto || !nome) return;
    const produto = PRODUTOS[qualProduto];

    const lines = [
      `Olá! Meu nome é ${nome}.`,
      "Conheci as opções no site e tenho interesse em:",
      "",
      produto.nome,
      periodo && `Período: ${periodo}`,
      viajantes && `Viajantes: ${viajantes}`,
      passagens && `Já possui passagens aéreas: ${passagens === "sim" ? "Sim" : "Não"}`,
      primeiraViagem && `Primeira viagem ao Japão: ${primeiraViagem === "sim" ? "Sim" : "Não"}`,
    ].filter((line): line is string => Boolean(line) || line === "");

    const text = encodeURIComponent(lines.join("\n"));

    window.gtag?.("event", "whatsapp_click", { form_name: "produtos_qualificacao" });
    window.gtag?.("event", "generate_lead", {
      form_name: "produtos_qualificacao",
      contact_channel: "whatsapp",
    });
    window.gtag?.("event", "conversion", {
      send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE",
      value: 1.0,
      currency: "BRL",
    });

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setEnviado(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* ── HEADER ── */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
          <Link href="/">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />
          </Link>
        </div>
      </header>

      {/* ── HERO — PRODUTOS ── */}
      <section className="relative border-b border-black/10 bg-white">
        {/*
          HERO RESPONSIVO SEM DEFORMAÇÃO
          - Usa a imagem original /images/produtos-hero.png
          - Mantém a proporção nativa 1402 x 1122
          - Nunca amplia além de 1402px
          - Em widescreen, sobra área preta nas laterais
          - Em telas menores, reduz proporcionalmente
          - Sem object-cover, sem vh, sem crop
        */}
        <div className="relative mx-auto w-full max-w-[1402px] overflow-hidden">
          <Image
            src="/images/produtos-hero.png"
            alt="Estrada coberta de neve diante do Monte Fuji no Japão"
            width={1402}
            height={1122}
            priority
            sizes="(min-width: 1402px) 1402px, 100vw"
            className="block h-auto w-full"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black via-black/45 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-5 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-10">
            <h1
              className={`${display.className} max-w-5xl text-center text-[clamp(1.8rem,5vw,3.6rem)] font-normal leading-[1.08] tracking-[-0.015em] text-white`}
              style={{ textShadow: "0 3px 18px rgba(0,0,0,0.72)" }}
            >
              Como você quer viajar pelo Japão?
            </h1>
          </div>
        </div>

        {/* ── SELETOR DE PRODUTOS ── */}
        <div className="bg-white px-5 py-10 sm:px-6 sm:py-12 md:px-10 md:py-14 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <h2 className={`${display.className} mb-6 text-2xl font-medium text-black md:text-3xl`}>
              Como você quer organizar sua viagem?
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProductSelectorCard
                href="#roteiro-personalizado"
                onClick={() => setRoteiroModalOpen(true)}
                icon="/images/produtos/roteiro-personalizado.png"
                iconWidth={439}
                iconHeight={504}
                title="Roteiro Personalizado"
                description="Receba um planejamento completo, criado para sua viagem, e faça suas próprias reservas."
                cta="Conhecer o roteiro"
              />
              <ProductSelectorCard
                href="/pacotes"
                onClick={() => setPacotesModalOpen(true)}
                icon="/images/produtos/pacote-de-viagem.png"
                iconWidth={350}
                iconHeight={532}
                title="Pacote de Viagem"
                description="Escolha uma viagem já estruturada e deixe reservas e organização por nossa conta."
                cta="Ver pacotes"
              />
              <ProductSelectorCard
                href="/viagem-personalizada"
                onClick={() => setViagemModalOpen(true)}
                icon="/images/produtos/viagem-personalizada-icone-v2.png"
                iconWidth={1254}
                iconHeight={1254}
                title="Viagem Personalizada"
                description="Criamos e organizamos sua viagem do zero, inteiramente de acordo com você."
                cta="Criar minha viagem"
                featured
              />
            </div>

            <h2 className={`${display.className} mb-6 mt-12 text-2xl font-medium text-black md:mt-16 md:text-3xl`}>
              Complete sua viagem
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <ProductSelectorCard
                href="/passagens"
                onClick={() => setPassagensModalOpen(true)}
                icon="/images/produtos/passagem-aerea.png"
                iconWidth={449}
                iconHeight={284}
                title="Passagem Aérea"
                description="Emissão de passagens com suporte antes, durante e depois da sua viagem."
                cta="Ver passagens"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/viagem-personalizada?abrir=hotel"
                onClick={() => setHoteisModalOpen(true)}
                icon="/images/produtos/hoteis.png"
                iconWidth={435}
                iconHeight={366}
                title="Hotéis"
                description="Curadoria e reserva de hotéis escolhidos pelo perfil e pela logística da sua viagem."
                cta="Ver hotéis"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/guia-turistico"
                onClick={() => setGuiaModalOpen(true)}
                icon="/images/produtos/guia-turistico.png"
                iconWidth={359}
                iconHeight={444}
                title="Guia Turístico"
                description="Acompanhamento particular no Japão para os dias e experiências que você escolher."
                requirement="Requer Roteiro Personalizado"
                cta="Conhecer o serviço"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/viagem-personalizada"
                onClick={() => setTransporteModalOpen(true)}
                icon="/images/produtos/transporte-privado.png"
                iconWidth={1536}
                iconHeight={1024}
                title="Transporte Privado"
                description="Transfers e deslocamentos privativos com conforto e motorista particular."
                requirement="Inclui Roteiro Personalizado"
                cta="Calcular meu transporte"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/servicos-adicionais"
                onClick={() => setServicosModalOpen(true)}
                icon="/images/produtos/servicos-adicionais.png"
                iconWidth={1254}
                iconHeight={1254}
                title="Serviços adicionais"
                description="Conectividade, ingressos e outros serviços para completar sua viagem."
                cta="Ver serviços"
                className="lg:col-span-2"
              />
              {/* Pedido do Wilson, 16/set/2026: "JR Pass, Cambio e Seguro
                  Viagem retirar do serviços avulsos, devem virar cards
                  principais como esses listados na imagem, seguir mesmo
                  template de layout" — mesmo componente ProductSelectorCard,
                  mesmos preços de referência já usados no motor de preço
                  (JR_PASS_PRECO_USD, DIARIA_SEGURO_VIAGEM,
                  PRECO_CAMBIO_BRASIL, em CustomPackageCard.tsx). */}
              <ProductSelectorCard
                href="/servicos-adicionais"
                onClick={() => setJrPassModalOpen(true)}
                icon="/images/icone-trem-bala-shinkansen.png"
                iconWidth={1536}
                iconHeight={744}
                title="JR Pass"
                description="Passe ferroviário com deslocamentos ilimitados de trem-bala. Vendido em faixas de 7, 14 ou 21 dias."
                cta="Ver JR Pass"
                className="lg:col-span-2"
              />
              {/* col-start-2 removido — pedido do Wilson, 16/set/2026: "na
                  pagina de produtos o card de ajisai shopping esta
                  totalmente desalinhado, ele deve ir pra fileira de cima".
                  O col-start-2 centralizava a fileira quando só havia 2
                  cards (Câmbio + Seguro Viagem); com o Ajisai Shopping como
                  3º card, ele sobrava sozinho numa linha nova. Sem o
                  offset, os 3 cards (Câmbio, Seguro Viagem, Ajisai
                  Shopping) preenchem a fileira inteira, igual às fileiras
                  acima. */}
              <ProductSelectorCard
                href="/servicos-adicionais"
                onClick={() => setCambioModalOpen(true)}
                icon="/images/icone-cambio-dinheiro.png"
                iconWidth={258}
                iconHeight={320}
                title="Câmbio"
                description="Compra e venda de ienes com cotação em tempo real, direto pelo site."
                cta="Ver câmbio"
                className="lg:col-span-2"
              />
              <ProductSelectorCard
                href="/servicos-adicionais"
                onClick={() => setSeguroViagemModalOpen(true)}
                icon="/images/icone-seguro-viagem-v2.png"
                iconWidth={1288}
                iconHeight={1157}
                title="Seguro Viagem"
                description="Cobertura médica e assistência durante toda a viagem."
                cta="Ver seguro viagem"
                className="lg:col-span-2"
              />
              {/* Pedido do Wilson, 16/set/2026: "criar na pagina de
                  calculadora reversa e produtos um card novo de serviço
                  chamado Ajisai Shopping, será um serviço de compra
                  durante a viagem no japao" — mesmo template dos cards
                  acima, comissão de 20% sobre o valor das compras (não uma
                  diária/valor fixo). */}
              <ProductSelectorCard
                href="/servicos-adicionais"
                onClick={() => setAjisaiShoppingModalOpen(true)}
                icon="/images/icone-servico-ajisai-shopping.png"
                iconWidth={1254}
                iconHeight={1254}
                title="Ajisai Shopping"
                description="Acompanhamento pessoal em compras durante a viagem no Japão, com negociação, tradução e apoio logístico nas lojas."
                cta="Ver Ajisai Shopping"
                className="lg:col-span-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── VÍDEO — EXPLICAÇÃO DOS PRODUTOS ── */}
      <section className="border-b border-black/10 bg-white px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">
            Assista antes de escolher
          </p>
          <h2
            className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}
          >
            Como funcionam os produtos Ajisai
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-6 text-black/55">
            Em poucos minutos, entenda a diferença entre Roteiro Personalizado,
            Pacotes de Viagem e Guia Turístico Avulso — e qual encaixa melhor
            no seu jeito de viajar.
          </p>
          <VideoPlaceholder
            titulo="Explicação dos produtos Ajisai"
            descricao="Vídeo institucional, apresentando as 3 formas de viajar com a Ajisai."
            className="mx-auto mt-8 max-w-2xl"
          />
        </div>
      </section>

      {/* ── ROTEIRO PERSONALIZADO — DEMONSTRAÇÃO ── */}
      {roteiroModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="roteiro-modal-title"
          onClick={() => setRoteiroModalOpen(false)}
        >
          <section
            id="roteiro-personalizado"
            className="relative max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-t-3xl border border-black/10 bg-white px-6 py-16 shadow-2xl md:rounded-3xl md:px-16 md:py-20"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setRoteiroModalOpen(false)}
              aria-label="Fechar informações do Roteiro Personalizado"
              className="sticky right-0 top-0 z-20 ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/70 text-2xl leading-none text-black/65 backdrop-blur transition hover:border-black/40 hover:text-black"
            >
              ×
            </button>
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">
              Roteiro Personalizado
            </p>
            <h2
              id="roteiro-modal-title"
              className={`${display.className} mt-3 text-3xl font-medium leading-tight text-black md:text-4xl`}
            >
              Isto não é uma lista de lugares para visitar.
            </h2>
            <p className="mt-5 text-sm font-light leading-6 text-black/60 md:text-base md:leading-7">
              É um painel digital onde cada dia da sua viagem é planejado de
              acordo com o seu perfil — acessível pelo celular, do início ao
              fim da viagem.
            </p>

            <ul className="mt-6 space-y-3">
              {ROTEIRO_DESTAQUES.map((item) => (
                <li
                  key={item}
                  className={`flex items-start gap-2.5 text-sm leading-6 ${
                    item.startsWith("Nós planejamos") ? "font-medium text-[#1c6ea8]" : "text-black/65"
                  }`}
                >
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1c6ea8]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">A partir de</p>
                <p className={`${display.className} text-4xl font-medium text-black`}>
                  {precoProdutoLabel(PRODUTOS.roteiro, false)}
                </p>
                {precoBRLProdutoLabel(PRODUTOS.roteiro) && (
                  <p className="mt-1 text-lg font-semibold leading-none text-[#2f74ab]">
                    {precoBRLProdutoLabel(PRODUTOS.roteiro)}
                  </p>
                )}
                <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-black/40" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setRoteiroModalOpen(false);
                  escolherProduto("roteiro");
                }}
                className="rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Quero meu roteiro personalizado →
              </button>
            </div>
            <div>
              <PriceCalculator />
            </div>
            <Link
              href="/ajisairoteiros"
              className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-black/40 underline underline-offset-4 transition hover:text-black"
            >
              Ver o roteiro completo →
            </Link>
          </div>

          <div className="flex justify-center">
            <a
              href="/images/mock-roteiro-iphone.png"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver painel do roteiro em tamanho maior"
              className="group relative w-[320px] overflow-visible rounded-[36px] shadow-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(110,195,217,0.25)] md:w-[400px]"
            >
              <div className="relative aspect-[1024/1536] w-full">
                <Image
                  src="/images/mock-roteiro-iphone.png"
                  alt="Painel Ajisai — roteiro diário, atrações e logística organizados"
                  fill
                  sizes="400px"
                  className="object-contain transition duration-700 group-hover:scale-[1.015]"
                />
              </div>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">
            Veja funcionando
          </p>
          <h3
            className={`${display.className} mt-2 text-center text-xl font-medium text-black md:text-2xl`}
          >
            Demonstração do Roteiro Personalizado
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm font-light leading-6 text-black/55">
            Duas versões — escolha a que preferir: a rápida dura só 1:46, a
            completa mostra o painel com todos os detalhes.
          </p>
          <div className="mx-auto mt-8 w-full">
            <DemoVideo
              src="/videos/roteiro-personalizado-short.mp4"
              poster="/videos/roteiro-personalizado-short-poster.jpg"
              label="Versão Rápida · 1:46"
              descricao="Visão geral direto ao ponto, em menos de 2 minutos."
            />
          </div>

          <div className="mx-auto mt-10 max-w-sm">
            <p className="text-center text-sm uppercase tracking-[0.2em] text-black/50">
              Quer ver mais?
            </p>
            <div className="mt-3">
              <DemoVideo
                src="/videos/roteiro-personalizado-detalhado.mp4"
                poster="/videos/roteiro-personalizado-detalhado-poster.jpg"
                label="Versão Completa · 8:08"
                descricao="Navegação real pelo painel — dia a dia, atrações, deslocamento e logística."
              />
            </div>
          </div>
        </div>
          </section>
        </div>
      )}

      {pacotesModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pacotes-modal-title"
          onClick={() => setPacotesModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="pacotes-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Pacotes de Viagem
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/pacotes"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c6ea8] transition hover:text-black sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setPacotesModalOpen(false)}
                  aria-label="Fechar Pacotes de Viagem"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/pacotes"
              title="Conteúdo completo de Pacotes de Viagem"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {viagemModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="viagem-modal-title"
          onClick={() => setViagemModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-[#6ec3d9]/30 bg-white shadow-[0_0_60px_-20px_rgba(110,195,217,0.45)] md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="viagem-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Viagem Personalizada
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/viagem-personalizada"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c6ea8] transition hover:text-black sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setViagemModalOpen(false)}
                  aria-label="Fechar Viagem Personalizada"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/viagem-personalizada"
              title="Configurador completo de Viagem Personalizada"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {passagensModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="passagens-modal-title"
          onClick={() => setPassagensModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="passagens-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Passagens Aéreas
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/passagens"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c6ea8] transition hover:text-black sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setPassagensModalOpen(false)}
                  aria-label="Fechar Passagens Aéreas"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/passagens"
              title="Diferenciais Ajisai para Passagens Aéreas"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {guiaModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guia-modal-title"
          onClick={() => setGuiaModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="guia-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Guia Turístico Avulso
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/guia-turistico"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c6ea8] transition hover:text-black sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setGuiaModalOpen(false)}
                  aria-label="Fechar Guia Turístico Avulso"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/guia-turistico"
              title="Guia Turístico Avulso"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {servicosModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="servicos-modal-title"
          onClick={() => setServicosModalOpen(false)}
        >
          <div
            className="relative h-[96vh] w-full max-w-[1500px] overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:h-[94vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="servicos-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Serviços Adicionais
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/servicos-adicionais"
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c6ea8] transition hover:text-black sm:block"
                >
                  Abrir página completa
                </Link>
                <button
                  type="button"
                  onClick={() => setServicosModalOpen(false)}
                  aria-label="Fechar Serviços Adicionais"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src="/servicos-adicionais"
              title="Serviços avulsos Ajisai"
              className="h-full w-full border-0 pt-14"
            />
          </div>
        </div>
      )}

      {/* ── QUALIFICAÇÃO → WHATSAPP ── */}
      <section id="recomendador" className="hidden">
        <div className="mx-auto max-w-2xl">
          {enviado ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">WhatsApp aberto</p>
              <h2 className={`${display.className} text-2xl font-medium text-black`}>Quase lá.</h2>
              <p className="max-w-xs text-sm leading-6 text-black/55">
                Finalize o envio da mensagem na aba do WhatsApp que abrimos
                para você. A equipe Ajisai responde em breve.
              </p>
              <button
                type="button"
                onClick={trocarProduto}
                className="mt-2 rounded-full border border-black/20 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-black/80 transition hover:border-black/50 hover:text-black"
              >
                Fazer outra solicitação
              </button>
            </div>
          ) : (
            <>
              {qualProduto && (
                <div className="mb-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6 text-center md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Produto selecionado
                  </p>
                  <p className={`${display.className} mt-1.5 text-xl font-medium text-black`}>
                    {PRODUTOS[qualProduto].nome}
                  </p>
                  <p className="mt-1 text-xs text-black/50">
                    {precoProdutoLabel(PRODUTOS[qualProduto], true)}
                  </p>
                  {precoBRLProdutoLabel(PRODUTOS[qualProduto]) && (
                    <p className="mt-0.5 text-[11px] text-black/40">
                      {precoBRLProdutoLabel(PRODUTOS[qualProduto])}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={trocarProduto}
                    className="mt-3 text-[11px] uppercase tracking-[0.15em] text-black/40 underline underline-offset-4 transition hover:text-black"
                  >
                    Trocar produto
                  </button>
                </div>
              )}

              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">
                Fale com a Ajisai
              </p>
              <h2
                className={`${display.className} mt-3 text-center text-3xl font-medium leading-tight text-black`}
              >
                Conte um pouco sobre sua viagem
              </h2>
              <p className="mt-3 text-center text-sm leading-6 text-black/55">
                Três perguntas rápidas — assim nossa equipe já entra na
                conversa sabendo exatamente o que você precisa.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-black/15 bg-black/5 px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40 sm:col-span-2"
                />
                <input
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Quando pretende viajar?"
                  className="w-full rounded-lg border border-black/15 bg-black/5 px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40"
                />
                <input
                  value={viajantes}
                  onChange={(e) => setViajantes(e.target.value)}
                  placeholder="Quantas pessoas viajarão?"
                  className="w-full rounded-lg border border-black/15 bg-black/5 px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40"
                />
              </div>

              <div className="mt-5">
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Já possui passagens aéreas?
                </p>
                <div className="flex gap-2.5">
                  {(["sim", "nao"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setPassagens(valor)}
                      className={`rounded-full border px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                        passagens === valor
                          ? "border-transparent text-white"
                          : "border-black/20 text-black/60 hover:border-black/50 hover:text-black"
                      }`}
                      style={passagens === valor ? { backgroundColor: "#2f80c9" } : undefined}
                    >
                      {valor === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Primeira viagem ao Japão?
                </p>
                <div className="flex gap-2.5">
                  {(["sim", "nao"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setPrimeiraViagem(valor)}
                      className={`rounded-full border px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                        primeiraViagem === valor
                          ? "border-transparent text-white"
                          : "border-black/20 text-black/60 hover:border-black/50 hover:text-black"
                      }`}
                      style={primeiraViagem === valor ? { backgroundColor: "#2f80c9" } : undefined}
                    >
                      {valor === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleQualificar}
                disabled={!qualProduto || !nome}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "#2f80c9" }}
              >
                Falar no WhatsApp →
              </button>
              {(!qualProduto || !nome) && (
                <p className="mt-2 text-center text-[11px] text-black/35">
                  Escolha um produto e informe seu nome para continuar.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Pedido do Wilson, 25/set/2026: "enriquecer nossa pagina de
          motorista privado tanto na /produtos quanto calculadora reversa e
          self-service [...] adicionar coaster na /produtos" e depois,
          vendo o resultado ainda no template antigo (deploy não tinha
          publicado o commit novo ainda), "usar template atual igual
          cambio, jr pass, etc" — confirmado via AskUserQuestion: fluxo
          completo de self-checkout (formulário + Formas de Pagamento +
          lead no CRM), não só um botão de WhatsApp. Transporte Privado
          saiu do componente próprio TransportePrivadoCalculator.tsx
          (arquivo removido) e virou TransporteModal aqui dentro, no
          mesmo padrão grande (max-w-5xl) do JrPassModal/CambioModal/
          SeguroViagemModal logo abaixo. */}
      {transporteModalOpen && (
        <TransporteModal cambio={cambio} onClose={() => setTransporteModalOpen(false)} />
      )}

      {hoteisModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hoteis-modal-title"
          onClick={() => setHoteisModalOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
              <p
                id="hoteis-modal-title"
                className={`${display.className} text-lg font-medium text-black md:text-xl`}
              >
                Hotéis
              </p>
              <button
                type="button"
                onClick={() => setHoteisModalOpen(false)}
                aria-label="Fechar Hotéis"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
              >
                ×
              </button>
            </div>
            <div className="p-5 md:p-8">
              <p className="max-w-2xl text-sm leading-relaxed text-black/60">
                Curadoria e reserva de hotéis escolhidos pelo perfil e pela logística da sua
                viagem — veja exemplos de propriedades por categoria.
              </p>
              {/* Pedido do Wilson, 16/set/2026: "melhorar a parte de hotéis
                  [...] quero algo similar a uma empresa que aluga hotéis
                  como SIXT, o cliente escolhe a categoria, e precisa
                  deixar opção pra escolher número de noites, datas e
                  cidades e tipo de quarto para poder gerar orçamento
                  inicial provisório" — inserido dentro do mesmo modal
                  "Hotéis" já existente, acima dos exemplos de propriedade
                  (que continuam disponíveis pra quem quiser só navegar). */}
              <div className="mt-6">
                <HotelQuoteCalculator />
              </div>
              <div className="mt-8 border-t border-black/10 pt-6">
                <HotelExemplosPropriedades light />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pedido do Wilson, 25/set/2026: "o pop-up está ocupando uma parte
          muito pequena, ele tem que ocupar praticamente o mesmo espaço da
          /produtos" + "ao clicar em JR Pass, eu preciso que nessa nova
          página tenham todos os detalhes desde os tipos de JR Pass
          disponiveis, dias, preços etc [...] Criteirios de eligibilidade
          [...] Usar sites oficiais da JR" — JR Pass saiu do
          ServicoAvulsoModal genérico (pequeno, max-w-lg) e ganhou o
          próprio componente, no mesmo padrão de tamanho do modal
          "Hotéis" (max-w-5xl, quase tela cheia). Câmbio, Seguro Viagem e
          Ajisai Shopping continuam no popup pequeno — só o JR Pass foi
          pedido maior/mais detalhado. */}
      {jrPassModalOpen && <JrPassModal onClose={() => setJrPassModalOpen(false)} />}

      {/* Pedido do Wilson, 25/set/2026: "vamos trabalhar agora na página de
          câmbio, primeiro de tudo deixar com o mesmo template visual que a
          pagina de jr pass e seguro viagem, segundo lugar, importar dados
          de preço e etc da calculadora reversa, terceiro lugar,
          desenvolver um algoritmo que baseado na escolha da cidade da
          pessoa, o sistema faz uma busca em tempo real em sites como
          melhores câmbios, etc e adicionar uma margem de 20% sobre o
          valor e já deixa o pedido pronto para checkout, quarto lugar,
          deixar disponivel tanto compra quanto venda de iene, e deixar
          pelo menos 3 moedas disponiveis para transação Real, Euro e
          Dolar" — mesmo tratamento dado ao JR Pass e Seguro Viagem: saiu
          do ServicoAvulsoModal pequeno e ganhou o próprio componente
          grande (CambioModal), reaproveitando a mesma raspagem em tempo
          real do melhorcambio.com já usada na Calculadora Reversa
          (useCambioIene), com uma margem pública de 20% separada da
          margem interna (ver SPREAD_CAMBIO_IENE_PUBLICO_COMPRA/VENDA em
          app/lib/calculadoraCatalogoPublico.ts) e o mesmo padrão de
          self-checkout do Seguro Viagem (lead no CRM, tag SELF-SERVICE,
          sem gateway de pagamento no site). */}
      {cambioModalOpen && <CambioModal onClose={() => setCambioModalOpen(false)} />}

      {/* Pedido do Wilson, 25/set/2026: "vamos fazer o mesmo para seguro
          viagem, hoje trabalhamos com 3 empresas Affinity, GTA e MTA, o
          cliente pode escolher qualquer 1 dos 3, pegar preços do site da
          calculadora reversa, e ajustar pagina do seguro viagem para ter
          todas as informacoes e campos necessarios para self-checkout" —
          mesmo tratamento dado ao JR Pass: saiu do ServicoAvulsoModal
          pequeno e ganhou o próprio componente grande (SeguroViagemModal),
          agora com comparação das 3 seguradoras e formulário completo de
          self-checkout (mesmo padrão confirmado com o Wilson via
          AskUserQuestion: lead cai no CRM com tag SELF-SERVICE, sem
          gateway de pagamento real no site — igual
          /viagem_personalizada_selfservice). */}
      {seguroViagemModalOpen && (
        <SeguroViagemModal cambio={cambio} onClose={() => setSeguroViagemModalOpen(false)} />
      )}

      {ajisaiShoppingModalOpen && (
        <ServicoAvulsoModal
          titulo="Ajisai Shopping"
          descricao="Acompanhamento pessoal em compras durante a viagem no Japão — negociação, tradução e apoio logístico nas lojas, do início ao fim da experiência de compra."
          precoLabel={`${(COMISSAO_AJISAI_SHOPPING_PCT * 100).toFixed(0)}% sobre as compras`}
          notaPreco="Comissão sobre o valor das compras realizadas com o acompanhamento — sem diária fixa. Valor final sob consulta, conforme o que for efetivamente gasto na viagem."
          cambio={cambio}
          onClose={() => setAjisaiShoppingModalOpen(false)}
        />
      )}

      <section aria-label="Por que escolher a Ajisai" className="border-t border-black/10 bg-white">
        <InstitutionalContent />
      </section>

      <footer className="bg-white px-8 pb-20 pt-16 text-black md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <img
            src="/images/AJISAI-LOGO.avif"
            alt="Ajisai"
            className="h-11 w-auto object-contain invert md:h-12"
          />
          <p className="max-w-sm text-sm leading-relaxed text-black/50">
            Pacotes de viagem e roteiros personalizados para o Japão.
          </p>
          <p className="text-[11px] leading-relaxed text-black/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos
            Reservados — CNPJ: 43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}

function InstitutionalContent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(1800);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  function syncHeight() {
    const documentElement = iframeRef.current?.contentDocument?.documentElement;
    if (!documentElement) return;

    const updateHeight = () => {
      const iframeDocument = iframeRef.current?.contentDocument;
      if (!iframeDocument) return;
      setHeight(
        Math.max(
          iframeDocument.documentElement.scrollHeight,
          iframeDocument.body.scrollHeight,
        ),
      );
    };

    updateHeight();
    observerRef.current?.disconnect();
    observerRef.current = new ResizeObserver(updateHeight);
    observerRef.current.observe(documentElement);
  }

  return (
    <iframe
      ref={iframeRef}
      src="/pacotes?view=institutional"
      title="Por que escolher a Ajisai e avaliações de clientes"
      onLoad={syncHeight}
      scrolling="no"
      className="block w-full overflow-hidden border-0 bg-white"
      style={{ height }}
    />
  );
}

function ProductSelectorCard({
  href,
  onClick,
  icon,
  iconWidth,
  iconHeight,
  title,
  description,
  requirement,
  cta,
  featured = false,
  className = "",
}: {
  href: string;
  onClick?: () => void;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  title: string;
  description: string;
  requirement?: string;
  cta: string;
  featured?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!onClick) return;
        event.preventDefault();
        onClick();
      }}
      className={`group relative flex h-[350px] flex-col overflow-hidden rounded-2xl border p-6 text-left transition md:p-8 ${
        featured
          ? "border-[#6ec3d9]/45 bg-[#6ec3d9]/[0.055] shadow-[0_0_34px_-12px_rgba(110,195,217,0.42)] hover:border-[#6ec3d9]/70 hover:bg-[#6ec3d9]/[0.075]"
          : "border-black/10 bg-black/[0.02] shadow-[0_18px_45px_-14px_rgba(37,99,235,0.55)] hover:border-black/25 hover:bg-black/[0.04] hover:shadow-[0_22px_55px_-12px_rgba(37,99,235,0.65)]"
      } ${className}`}
    >
      <Image
        src={icon}
        alt=""
        width={iconWidth}
        height={iconHeight}
        className={`absolute object-contain ${
          title === "Transporte Privado"
            ? "right-4 top-3 h-20 w-20 opacity-90 invert md:right-6 md:top-5"
            : // Pedido do Wilson, 16/set/2026: JR Pass/Câmbio/Seguro Viagem
              // reaproveitam os mesmos ícones já usados em
              // /servicos-adicionais — arte já escura, feita pra fundo
              // claro, então não precisa do invert/brightness-0 usado nos
              // ícones antigos de /images/produtos (esses sim, arte clara
              // pensada pra fundo escuro). Ajisai Shopping (ícone enviado
              // pelo Wilson, 16/set/2026) é a mesma convenção — arte escura
              // — e entrou aqui pelo mesmo motivo, corrigindo um bug onde
              // o ícone ficava invisível (invert numa arte já escura).
              title === "JR Pass" ||
              title === "Câmbio" ||
              title === "Seguro Viagem" ||
              title === "Ajisai Shopping"
              ? "right-6 top-5 h-14 w-14 opacity-80 md:right-8 md:top-7"
              : `right-6 top-5 h-14 w-14 md:right-8 md:top-7 ${
                  title === "Serviços adicionais" ? "brightness-0" : "opacity-90 invert"
                }`
        }`}
      />
      <div className="h-4" aria-hidden="true" />
      <h3 className={`${display.className} mt-3 pr-16 text-2xl font-medium text-black md:text-3xl`}>
        {title}
      </h3>
      <p className="mt-3 max-w-[34ch] flex-1 text-sm font-light leading-6 text-black/55">
        {description}
      </p>
      {requirement && (
        <span className="mt-4 w-fit rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-red-700">
          {requirement}
        </span>
      )}
      <span className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-[#2f80c9] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(47,128,201,0.22)] transition group-hover:bg-[#3b91dc] group-hover:shadow-[0_10px_28px_rgba(47,128,201,0.35)]">
        {cta}
      </span>
    </a>
  );
}

// Tabela oficial do Japan Rail Pass, em ienes — só referência educativa
// nesta seção (o preço que a Ajisai efetivamente cobra é o de
// JR_PASS_PRECO_USD/JR_PASS_PRECO_USD_GREEN, tabela do fornecedor
// AjisaiWork em dólar, a mesma usada na Calculadora Reversa). Capturado
// em 25/set/2026 direto do site oficial japanrailpass.net: a tabela
// vigente até 30/set/2026 (adulto) é Comum ¥50.000/80.000/100.000 e
// Green ¥70.000/110.000/140.000 (7/14/21 dias); a partir de 1/out/2026
// (japanrailpass.net/assets/pdf/JRP_Price_Changes_En.pdf) sobe para os
// valores abaixo — como a mudança é em poucos dias, já uso a tabela nova
// pra não desatualizar rápido.
const JR_PASS_OFICIAL_JPY: Record<"comum" | "green", Record<(typeof JR_PASS_DIAS_OPCOES)[number], number>> = {
  comum: { 7: 53000, 14: 84000, 21: 105000 },
  green: { 7: 74000, 14: 116000, 21: 147000 },
};

function formatJPY(valor: number) {
  return `¥${valor.toLocaleString("ja-JP")}`;
}

// Pop-up dedicado do JR Pass — bem maior que o ServicoAvulsoModal genérico
// dos outros serviços avulsos, no mesmo padrão de tamanho do modal
// "Hotéis" (max-w-5xl, cabeçalho fixo com título + fechar, conteúdo
// rolável). Pedido do Wilson, 25/set/2026: "o pop-up está ocupando uma
// parte muito pequena, ele tem que ocupar praticamente o mesmo espaço da
// /produtos" + "tenham todos os detalhes desde os tipos de JR Pass
// disponiveis, dias, preços etc" + "Criteirios de eligibilidade" +
// "Usar sites oficiais da JR para capturar dados importantes". Critérios
// de elegibilidade e regras de uso abaixo vieram de japanrailpass.net/en
// (páginas "Eligibility for use" e "Conditions for use"), não inventados.
// Seção "Formas de pagamento" (cartão + Pix), reaproveitada nos dois
// self-checkouts de /produtos (JR Pass e Seguro Viagem). Pedido do Wilson,
// 25/set/2026: "adicionar formas de pagamento igual temos na pagina de
// calculadora reversa (adicionar dados de pagamento também na pagina de
// seguro viagem)". Mesmo visual/seleção da Calculadora Reversa
// (app/calculadora_reversa/page.tsx, seção "Simulação de pagamento") —
// não toquei nesse arquivo, só generalizei a mesma conta em
// app/lib/calculadoraCatalogoPublico.ts (calcularSimulacaoCartao/
// calcularSimulacaoPix/calcularParcelasMaxPix) pra reusar aqui.
function FormasPagamento({
  totalBRL,
  dataViagem,
  formaPagamento,
  onEscolher,
  somenteAVista = false,
  metodos = ["cartao", "pix"],
}: {
  totalBRL: number | null;
  /** Data de início da viagem (AAAA-MM-DD) — limita quantas parcelas de Pix fazem sentido. */
  dataViagem: string;
  formaPagamento: FormaPagamentoEscolhida | null;
  onEscolher: (forma: FormaPagamentoEscolhida) => void;
  /** Pedido do Wilson, 25/set/2026: "câmbio é sempre a vista" — desliga
   * parcelamento (cartão e Pix) só pra esse produto; JR Pass e Seguro
   * Viagem continuam com as opções normais (prop não passada = false). */
  somenteAVista?: boolean;
  /** Quais blocos aparecem — pedido do Wilson, 25/set/2026: "metodo de
   * pagamento é só pix e ted" (só pro Câmbio; os outros produtos continuam
   * com o padrão ["cartao", "pix"]). */
  metodos?: ("cartao" | "pix" | "ted")[];
}) {
  if (totalBRL === null || totalBRL <= 0) return null;

  const mostrarCartao = metodos.includes("cartao");
  const mostrarPix = metodos.includes("pix");
  const mostrarTed = metodos.includes("ted");

  const simulacaoCartaoCompleta = calcularSimulacaoCartao(totalBRL);
  const simulacaoCartao = somenteAVista
    ? simulacaoCartaoCompleta.filter((op) => op.parcelas === 1)
    : simulacaoCartaoCompleta;
  const parcelasMaxPix = calcularParcelasMaxPix(dataViagem);
  const simulacaoPix = somenteAVista ? [] : calcularSimulacaoPix(totalBRL, parcelasMaxPix);

  return (
    <div className="mt-8 border-t border-black/10 pt-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Formas de pagamento</p>
      <p className="mt-1 text-[11px] leading-5 text-black/45">
        Simulação pra referência — valores sujeitos a confirmação no fechamento.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {/* Cartão de crédito */}
        {mostrarCartao && (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f80c9]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icone-cartao-credito.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <div>
              <p className="text-sm font-medium text-black">Cartão de crédito</p>
              <p className="mt-0.5 text-[10px] text-black/50">
                {somenteAVista
                  ? `maquininha ${(TAXA_MAQUINA_CARTAO * 100).toFixed(2).replace(".", ",")}% — à vista`
                  : `maquininha ${(TAXA_MAQUINA_CARTAO * 100).toFixed(2).replace(".", ",")}% + juros de ${(TAXA_JUROS_CARTAO_MES * 100).toFixed(2).replace(".", ",")}% a.m. por parcela`}
              </p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-black/[0.06] border-t border-black/[0.06]">
            {simulacaoCartao.map((op) => {
              const selecionado =
                formaPagamento?.metodo === "cartao" && formaPagamento.parcelas === op.parcelas;
              return (
                <label
                  key={op.parcelas}
                  className={`-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition ${
                    selecionado ? "bg-[#2f80c9]/[0.07]" : "hover:bg-black/[0.02]"
                  }`}
                >
                  <input
                    type="radio"
                    name="formaPagamento"
                    checked={selecionado}
                    onChange={() => onEscolher({ metodo: "cartao", parcelas: op.parcelas })}
                    className="h-4 w-4 shrink-0 accent-[#2f80c9]"
                  />
                  <span className="w-9 shrink-0 text-xs text-black/55">{op.parcelas}x</span>
                  <span className="flex-1 text-sm font-medium text-black">
                    {formatBRL(op.valorParcela)}
                  </span>
                  <span className="shrink-0 text-[11px] text-black/45">
                    total {formatBRL(op.valorTotal)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        )}

        {/* Pix */}
        {mostrarPix && (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f80c9]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icone-pix.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <p className="text-sm font-medium text-black">Pix</p>
          </div>

          <label
            className={`mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 transition ${
              formaPagamento?.metodo === "pixVista"
                ? "bg-[#2f80c9]/[0.12]"
                : "bg-[#2f80c9]/5 hover:bg-[#2f80c9]/[0.08]"
            }`}
          >
            <input
              type="radio"
              name="formaPagamento"
              checked={formaPagamento?.metodo === "pixVista"}
              onChange={() => onEscolher({ metodo: "pixVista", parcelas: 1 })}
              className="h-4 w-4 shrink-0 accent-[#2f80c9]"
            />
            <span className="flex-1 text-xs text-black/60">à vista</span>
            <span className="text-sm font-medium text-black">{formatBRL(totalBRL)}</span>
          </label>

          {!somenteAVista &&
            (simulacaoPix.length > 0 ? (
              <div className="mt-3">
                <p className="text-[10px] text-black/50">
                  parcelado — entrada de {formatBRL(simulacaoPix[0].entrada)} (30%) + parcelas a{" "}
                  {(TAXA_JUROS_PIX_MES * 100).toFixed(2).replace(".", ",")}% a.m.
                </p>
                <div className="mt-1.5 divide-y divide-black/[0.06] border-t border-black/[0.06]">
                  {simulacaoPix.map((op) => {
                    const selecionado =
                      formaPagamento?.metodo === "pixParcelado" && formaPagamento.parcelas === op.parcelas;
                    return (
                      <label
                        key={op.parcelas}
                        className={`-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition ${
                          selecionado ? "bg-[#2f80c9]/[0.07]" : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="formaPagamento"
                          checked={selecionado}
                          onChange={() => onEscolher({ metodo: "pixParcelado", parcelas: op.parcelas })}
                          className="h-4 w-4 shrink-0 accent-[#2f80c9]"
                        />
                        <span className="w-9 shrink-0 text-xs text-black/55">{op.parcelas}x</span>
                        <span className="flex-1 text-sm font-medium text-black">
                          {formatBRL(op.valorParcela)}
                        </span>
                        <span className="shrink-0 text-[11px] text-black/45">
                          total {formatBRL(op.valorTotal)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              dataViagem && (
                <p className="mt-3 text-[11px] text-black/45">
                  Viagem muito próxima — sem prazo pra parcelar no Pix, só à vista.
                </p>
              )
            ))}
        </div>
        )}

        {/* TED — pedido do Wilson, 25/set/2026: "metodo de pagamento é só
            pix e ted" (só aparece quando `metodos` inclui "ted"; hoje só
            o Câmbio passa isso). Sempre à vista — TED não parcela. */}
        {mostrarTed && (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f80c9]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icone-pix.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <div>
              <p className="text-sm font-medium text-black">TED</p>
              <p className="mt-0.5 text-[10px] text-black/50">transferência bancária — à vista</p>
            </div>
          </div>
          <label
            className={`mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 transition ${
              formaPagamento?.metodo === "ted"
                ? "bg-[#2f80c9]/[0.12]"
                : "bg-[#2f80c9]/5 hover:bg-[#2f80c9]/[0.08]"
            }`}
          >
            <input
              type="radio"
              name="formaPagamento"
              checked={formaPagamento?.metodo === "ted"}
              onChange={() => onEscolher({ metodo: "ted", parcelas: 1 })}
              className="h-4 w-4 shrink-0 accent-[#2f80c9]"
            />
            <span className="flex-1 text-xs text-black/60">à vista</span>
            <span className="text-sm font-medium text-black">{formatBRL(totalBRL)}</span>
          </label>
          <p className="mt-2 text-[10px] leading-4 text-black/40">
            Dados bancários da Alpinea enviados pela equipe no fechamento pelo WhatsApp.
          </p>
        </div>
        )}
      </div>
    </div>
  );
}

/** Texto curto descrevendo a forma de pagamento escolhida — usado na
 * mensagem de WhatsApp e no resumo do lead. Mesma lógica de
 * `descricaoFormaPagamentoEscolhida` da Calculadora Reversa. */
function descricaoFormaPagamento(
  forma: FormaPagamentoEscolhida | null,
  totalBRL: number | null,
  dataViagem: string,
): string {
  if (!forma || totalBRL === null || totalBRL <= 0) return "";
  if (forma.metodo === "cartao") {
    const op = calcularSimulacaoCartao(totalBRL).find((o) => o.parcelas === forma.parcelas);
    if (!op) return "";
    return op.parcelas === 1
      ? `Cartão de crédito à vista (1x) de ${formatBRL(op.valorParcela)}`
      : `Cartão de crédito em ${op.parcelas}x de ${formatBRL(op.valorParcela)} (total ${formatBRL(op.valorTotal)})`;
  }
  if (forma.metodo === "pixVista") {
    return `Pix à vista de ${formatBRL(totalBRL)}`;
  }
  if (forma.metodo === "ted") {
    return `TED à vista de ${formatBRL(totalBRL)}`;
  }
  const parcelasMaxPix = calcularParcelasMaxPix(dataViagem);
  const op = calcularSimulacaoPix(totalBRL, parcelasMaxPix).find((o) => o.parcelas === forma.parcelas);
  if (!op) return "";
  return `Pix parcelado — entrada de ${formatBRL(op.entrada)} (30%) + ${op.parcelas}x de ${formatBRL(op.valorParcela)} (total ${formatBRL(op.valorTotal)})`;
}

// Pedido do Wilson, 25/set/2026 (com o PDF de preço de custo do
// fornecedor DAIKICHI/HK TOURIST + foto do Coaster em anexo):
// "enriquecer nossa pagina de motorista privado tanto na /produtos
// quanto calculadora reversa e self-service, colocar mesma margem que já
// usamos hoje, os preços na tabela anexa são preço de custo" +
// "adicionar coaster na /produtos". Confirmado via AskUserQuestion:
// trocar o antigo modelo de diária fixa por cidade pelo catálogo de
// rotas exatas do fornecedor (Alphard, Hiace 10/14, Coaster 18/21/29 —
// ver app/lib/motoristaPrivadoRotas.ts, componente compartilhado
// MotoristaPrivadoPicker). Depois, vendo o resultado ainda no template
// antigo (o deploy da Vercel não tinha publicado o commit novo ainda —
// não era cache do navegador), Wilson pediu: "usar template atual igual
// cambio, jr pass, etc" — confirmado via AskUserQuestion: fluxo completo
// de self-checkout (formulário de contato + Formas de Pagamento + lead
// no CRM com tag SELF-SERVICE), no mesmo padrão grande (max-w-5xl) do
// CambioModal logo abaixo, em vez do antigo botão avulso de WhatsApp.
function TransporteModal({ cambio, onClose }: { cambio: Cambio | null; onClose: () => void }) {
  const [selecao, setSelecao] = useState<SelecaoMotorista>(SELECAO_MOTORISTA_VAZIA);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const cambioCotacao = cambio?.cotacao ?? 5.3;
  const quantidadeItens = contarItensMotorista(selecao);
  const motoristaUSD = calcularTotalMotoristaUSD(selecao);
  // "Transporte Privado" exige Roteiro Personalizado (ver requisito no
  // card em /produtos) — mesma regra do modelo antigo, só que agora o
  // roteiro nasce em reais (ROTEIRO_PRECO_BASE) e é somado convertido em
  // dólar. Só entra quando há pelo menos 1 serviço selecionado.
  const roteiroUSD = quantidadeItens > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const totalUSD = motoristaUSD + roteiroUSD;
  const totalBRL = totalUSD * cambioCotacao;
  const totalUSDLabel = quantidadeItens > 0 ? formatUSD(totalUSD) : null;
  const totalBRLLabel = quantidadeItens > 0 ? formatBRL(totalBRL) : null;
  const resumoSelecao = resumoSelecaoMotorista(selecao);

  const descricaoPagamentoEscolhido = descricaoFormaPagamento(
    formaPagamento,
    quantidadeItens > 0 ? totalBRL : null,
    "",
  );

  const formValido =
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeItens > 0;

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/transporte-privado-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veiculo: selecao.veiculo,
          itens: selecao.itens,
          resumo: resumoSelecao,
          motoristaUSD,
          roteiroUSD,
          totalUSD,
          totalBRL,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          email,
          whatsapp,
          observacoes,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar meu transporte privado pelo site da Ajisai — ${resumoSelecao}. Meu nome é ${nome}.`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transporte-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <p
            id="transporte-modal-title"
            className={`${display.className} text-lg font-medium text-black md:text-xl`}
          >
            Transporte Privado
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Transporte Privado"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de transporte privado
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
                Nossa equipe confirma a logística e fecha os detalhes do motorista direto com você
                pelo WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Calculadora</p>
              <h3
                className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
              >
                Motorista particular, sem compartilhar veículo
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
                Escolha o veículo e as rotas/tours que precisa e veja o investimento exato, direto
                da tabela do nosso fornecedor no Japão — já com o Roteiro Personalizado incluso.
              </p>

              <div className="mt-8 border-t border-black/10 pt-6">
                <MotoristaPrivadoPicker selecao={selecao} onChange={setSelecao} cambioCotacao={cambioCotacao} />
              </div>

              {/* Importante — mesmos avisos do modelo anterior (trânsito
                  inter-municipal, adicionais opcionais, cancelamento),
                  sourceados de app/lib/motoristaPrivadoRotas.ts. */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Importante</p>
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Não incluso:</span> trânsito
                    inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai por estrada).
                    Os valores acima já incluem imposto, estacionamento, pedágio (ETC) e combustível.
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Adicionais opcionais</span> (sob
                    consulta, cobrados à parte): recepção com placa de identificação (Meet &amp;
                    Greet) — {formatUSD(ADICIONAL_MEET_GREET_USD)}; cadeirinha infantil —{" "}
                    {formatUSD(ADICIONAL_CADEIRINHA_USD)}.
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Cancelamento:</span>{" "}
                    {POLITICA_CANCELAMENTO_MOTORISTA}
                  </p>
                </div>
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
                  <p className="text-xs leading-5 text-amber-800">
                    <span className="font-semibold text-amber-900">
                      Motorista bilíngue (português/inglês):
                    </span>{" "}
                    disponível mediante consulta, com valor adicional — a disponibilidade desse
                    perfil é bem menor que a de motoristas sem esse requisito. Recomendamos
                    solicitar com grande antecedência, idealmente 70 dias antes da viagem.
                  </p>
                </div>
              </div>

              {/* Dados de contato */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Seus dados</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Nome completo
                    </span>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">E-mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">WhatsApp</span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                </div>
                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                    Observações (opcional)
                  </span>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    placeholder="Datas da viagem, horários de voo, preferência de veículo, etc."
                    className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                  />
                </label>
              </div>

              <FormasPagamento
                totalBRL={quantidadeItens > 0 ? totalBRL : null}
                dataViagem=""
                formaPagamento={formaPagamento}
                onEscolher={setFormaPagamento}
              />

              {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </>
          )}
        </div>

        {status !== "enviado" && (
          <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div>
                {totalUSDLabel ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">Sua escolha</p>
                    <p className={`${display.className} text-xl font-medium text-[#2f80c9] sm:text-2xl`}>
                      {totalUSDLabel}
                    </p>
                    <p className="text-xs text-black/45">
                      {resumoSelecao}
                      {totalBRLLabel && ` · ${totalBRLLabel}`}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-0.5 text-[11px] text-black/40">{descricaoPagamentoEscolhido}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-black/45">
                    Selecione ao menos uma rota ou tour para calcular o investimento.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition ${
                  formValido && status !== "enviando"
                    ? "bg-[#2f80c9] hover:bg-[#3b91dc]"
                    : "cursor-not-allowed bg-black/20"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Solicitar Transporte Privado"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra
              fechar a logística do seu transporte privado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function JrPassModal({ onClose }: { onClose: () => void }) {
  // Pedido do Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar
  // o valor de dólar turismo" (em vez do PTAX usado no resto do site) +
  // "adicionar spread cambial também" — confirmado via AskUserQuestion:
  // 20%, mesmo spread já usado no câmbio público de ienes (nunca exposto
  // em texto público). Ver app/lib/cambioDolarTurismo.ts pro contexto
  // completo — só o JR Pass usa essa cotação, o resto do modal usa o
  // mesmo padrão CambioLabel/Cambio de sempre, só que alimentado por
  // essa fonte em vez do PTAX.
  const cambioDolarTurismo = useCambioDolarTurismo();
  const cambio: Cambio | null = cambioDolarTurismo
    ? {
        cotacao: cambioDolarTurismo.cotacao * SPREAD_DOLAR_TURISMO_PUBLICO,
        data: cambioDolarTurismo.data,
        fonte: "Dólar Turismo — melhorcambio.com",
        fallback: cambioDolarTurismo.fallback,
      }
    : null;
  // Pedido do Wilson, 25/set/2026: "não consigo selecionar o tipo e nem a
  // duração do JR Pass, lembre-se que é uma pagina self-service, também
  // precisa haver no rodapé da pagina o preço da minha escolha e o que
  // escolhi com o botão 'Finalizar Compra Via Whatsapp'" — a tabela de
  // tipos e preços virou seletor de verdade (clique numa linha de dias
  // escolhe classe + duração juntos) e ganhou uma barra fixa no rodapé
  // do modal mostrando a escolha e o preço, com o CTA de WhatsApp já
  // preenchido com a seleção.
  const [classeSelecionada, setClasseSelecionada] = useState<"comum" | "green" | null>(null);
  const [diasSelecionados, setDiasSelecionados] = useState<(typeof JR_PASS_DIAS_OPCOES)[number] | null>(
    null,
  );
  // Datas da viagem + forma de pagamento — pedido do Wilson, 25/set/2026:
  // "falta adicionar a data de inicio e encerramento da viagem" e
  // "adicionar formas de pagamento igual temos na pagina de calculadora
  // reversa". Só entram na mensagem de WhatsApp (o JR Pass não tem
  // checkout com lead no CRM, diferente do Seguro Viagem).
  const [dataInicioViagem, setDataInicioViagem] = useState("");
  const [dataFimViagem, setDataFimViagem] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);

  // Dados de contato + CRM — pedido do Wilson, 25/set/2026: "adicionar
  // nome, e-mail e telefone nessa página, registrar no CRM ao proceder
  // para pagamento" — mesmo padrão de Câmbio/Seguro Viagem/Transporte
  // Privado (ver /api/jrpass-selfservice).
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Documento (passaporte OU passagem) — pedido do Wilson, 25/set/2026:
  // "precisa capturar a foto do passaporte do cliente, criar um
  // validador de foto script simples de checagem" + depois "foto do
  // passaporte ou foto da passagem, a o JR pass só pode ser emitido se
  // ele estiver no Japao em até 90 dias" (qualquer um dos dois documentos
  // comprova a janela de 90 dias) + "colocar opção de anexar documentos
  // depois também" (daí documentoAdiado, que libera o botão de finalizar
  // sem bloquear o cliente). Upload + OCR best-effort em
  // /api/jrpass-documento — ver lib/ocr/validarDocumentoJrPass.ts pro
  // motivo de nunca bloquear o cliente com base no resultado do OCR.
  const [referenciaDocumento] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [documentoTipo, setDocumentoTipo] = useState<"passaporte" | "passagem" | null>(null);
  const [documentoNomeArquivo, setDocumentoNomeArquivo] = useState("");
  const [documentoStatus, setDocumentoStatus] = useState<
    "vazio" | "enviando" | "validado" | "incerto" | "erro"
  >("vazio");
  const [documentoErro, setDocumentoErro] = useState("");
  const [documentoStoragePath, setDocumentoStoragePath] = useState<string | null>(null);
  const [documentoValidacaoMotivo, setDocumentoValidacaoMotivo] = useState("");
  const [documentoAdiado, setDocumentoAdiado] = useState(false);

  async function lidarComArquivoDocumento(tipo: "passaporte" | "passagem", file: File) {
    setDocumentoTipo(tipo);
    setDocumentoAdiado(false);
    setDocumentoNomeArquivo(file.name);
    setDocumentoStatus("enviando");
    setDocumentoErro("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(file);
      });
      const resposta = await fetch("/api/jrpass-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referencia: referenciaDocumento,
          tipo,
          arquivoBase64: base64,
          contentType: file.type,
        }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setDocumentoStatus("erro");
        setDocumentoErro(dados.error || "Não foi possível enviar o documento agora.");
        return;
      }
      setDocumentoStoragePath(dados.path || null);
      setDocumentoValidacaoMotivo(dados.validacao?.motivo || "");
      setDocumentoStatus(dados.validacao?.ok ? "validado" : "incerto");
    } catch {
      setDocumentoStatus("erro");
      setDocumentoErro("Não foi possível enviar o documento agora — tente de novo ou anexe depois.");
    }
  }

  // Termos e condições — pedido do Wilson, 25/set/2026: "temos que
  // adicionar um tick box no termos e condições para finalizar o
  // pagamento, tem que ser um scroll com os termos e condições de
  // aceite do jr pASS".
  const [termosAceitos, setTermosAceitos] = useState(false);
  // Número de pessoas — pedido do Wilson, 25/set/2026: "falta numero de
  // pessoas" (o JR Pass é vendido por pessoa — cada viajante precisa do
  // próprio passe). Mesmo padrão de stepper já usado em "Viajantes" no
  // Seguro Viagem.
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  function ajustarNumeroPessoas(novo: number) {
    const seguro = Math.max(1, Math.min(12, novo));
    setNumeroPessoas(seguro);
    // Nunca deixa o número de crianças (nem a lista de idades) passar do
    // número total de pessoas.
    setNumeroCriancas((atual) => Math.min(atual, seguro));
    setIdadesCriancas((atual) => atual.slice(0, seguro));
  }

  // Preço de criança — pedido do Wilson, 25/set/2026: "quando é criança o
  // cliente paga metade do valor, criança entre 6 a 12 anos incompletos"
  // + "tem que ter um campo com numero de crianças e idade da criança
  // para ser selecionada" — cada criança tem um seletor de idade próprio.
  // Confirmado com a tabela oficial do fornecedor enviada no mesmo dia
  // (Century Travel, "JRP-Tab-de-precos-16-a-30SEP26.pdf", nota 3): "Tarifas
  // para crianças: entre 6 anos completos e 12 anos incompletos. Crianças
  // menores de 6 anos não pagam, porém não tem direito a assento." — por
  // isso são 3 faixas, não só desconto/sem desconto: <6 grátis, 6–11
  // metade do preço, 12+ conta como adulto (preço cheio).
  const IDADE_CRIANCA_JRPASS_GRATIS_MAX = 5; // menor de 6 anos = grátis
  const IDADE_CRIANCA_JRPASS_MEIA_MIN = 6;
  const IDADE_CRIANCA_JRPASS_MEIA_MAX = 11; // "12 incompletos"
  function multiplicadorPorIdadeCrianca(idade: number): number {
    if (idade <= IDADE_CRIANCA_JRPASS_GRATIS_MAX) return 0;
    if (idade <= IDADE_CRIANCA_JRPASS_MEIA_MAX) return 0.5;
    return 1;
  }
  const [numeroCriancas, setNumeroCriancas] = useState(0);
  const [idadesCriancas, setIdadesCriancas] = useState<(number | "")[]>([]);
  function ajustarNumeroCriancas(novo: number) {
    const seguro = Math.max(0, Math.min(numeroPessoas, novo));
    setNumeroCriancas(seguro);
    setIdadesCriancas((atual) => {
      const proximo = atual.slice(0, seguro);
      while (proximo.length < seguro) proximo.push("");
      return proximo;
    });
  }
  const idadesCriancasPreenchidas = idadesCriancas.filter((idade): idade is number => typeof idade === "number");
  const criancasGratis = idadesCriancasPreenchidas.filter((i) => i <= IDADE_CRIANCA_JRPASS_GRATIS_MAX).length;
  const criancasComDesconto = idadesCriancasPreenchidas.filter(
    (i) => i >= IDADE_CRIANCA_JRPASS_MEIA_MIN && i <= IDADE_CRIANCA_JRPASS_MEIA_MAX,
  ).length;
  const criancasComoAdulto = idadesCriancasPreenchidas.filter((i) => i > IDADE_CRIANCA_JRPASS_MEIA_MAX).length;
  // Crianças com idade ainda não preenchida contam como preço cheio até o
  // campo ser preenchido — evita mostrar um total menor do que o real
  // antes da idade ser informada.
  const somaMultiplicadorCriancas = idadesCriancas.reduce(
    (soma: number, idade) => soma + (typeof idade === "number" ? multiplicadorPorIdadeCrianca(idade) : 1),
    0,
  );
  const multiplicadorPessoas = numeroPessoas - numeroCriancas + somaMultiplicadorCriancas;

  const TIPOS = [
    {
      key: "comum" as const,
      classe: "Comum (Ordinary)",
      icone: "/images/ingressos/shinkansen-ordinary.png",
      precoUSD: JR_PASS_PRECO_USD,
    },
    {
      key: "green" as const,
      classe: "Green Car (luxo)",
      icone: "/images/ingressos/jr-green-car.png",
      precoUSD: JR_PASS_PRECO_USD_GREEN,
    },
  ];

  // Ícones enviados pelo Wilson, 25/set/2026 ("segue icones para esses 4
  // cards"), um por critério de elegibilidade — substituem o ícone
  // genérico de check azul que tinha antes.
  const ELEGIBILIDADE = [
    {
      titulo: "Turista estrangeiro",
      texto:
        "Entrada no Japão com status de imigração \"Temporary Visitor\" para turismo, com estadia autorizada de 15 ou 90 dias — precisa do carimbo ou adesivo \"Temporary Visitor\" no passaporte.",
      icone: "/images/icone-elegibilidade-turista-estrangeiro.png",
    },
    {
      titulo: "Japonês residente no exterior",
      // Pedido do Wilson, 25/set/2026: "aqui é necessário adicionar,
      // precisa ter pelo menos de 10 anos morando fora do país".
      texto:
        "Também pode comprar, sob condições específicas — precisa ter pelo menos 10 anos morando fora do Japão, e só pela modalidade de compra feita fora do país, antes da viagem.",
      icone: "/images/icone-elegibilidade-residente-exterior.png",
    },
    {
      titulo: "Atenção ao carimbo",
      texto:
        "Portão eletrônico de imigração no aeroporto não carimba o passaporte — é preciso passar pelo balcão com atendente (ou pedir o carimbo manualmente) para conseguir trocar o passe depois.",
      icone: "/images/icone-elegibilidade-carimbo.png",
    },
    {
      titulo: "Não vale para todo visto",
      texto:
        "Quem entra como \"Trainee\", \"Entertainer\" ou com \"Reentry Permit\" não pode usar o passe — mesmo já tendo comprado online, a troca é recusada sem o carimbo correto.",
      icone: "/images/icone-elegibilidade-visto-invalido.png",
    },
  ];

  // Ícones enviados pelo Wilson, 25/set/2026 ("icones para essa aprte",
  // junto de um print da seção "Regras de uso") — substituem o
  // IconCheck genérico que tinha antes, um por regra.
  const REGRAS_DE_USO = [
    {
      titulo: "Cobertura",
      texto:
        "Shinkansen, trens expressos, expressos limitados e locais da JR, além de ônibus JR e do Tokyo Monorail — exceto os trens-bala Nozomi e Mizuho, que exigem bilhete separado.",
      icone: "/images/icone-regras-cobertura.png",
    },
    {
      titulo: "Reservas de assento",
      texto:
        "Gratuitas, mas recomendadas — alguns trens não têm vagão sem reserva. Limite de 110 reservas por passe; cancelamento precisa ser feito antes do horário de partida.",
      icone: "/images/icone-regras-reservas-assento.png",
    },
    {
      titulo: "Pessoal e intransferível",
      texto:
        "Vinculado a um passaporte específico — não dá pra comprar dois passes sobrepostos no mesmo passaporte, nem trocar de titular. O passaporte precisa estar sempre junto do passe.",
      icone: "/images/icone-regras-pessoal-intransferivel.png",
    },
    {
      titulo: "Reembolso e validade",
      texto:
        "Reembolso só é possível antes da data de início de uso; depois de ativado, o período não pode ser estendido. Passe perdido ou roubado não tem reposição.",
      icone: "/images/icone-regras-reembolso-validade.png",
    },
  ];

  const tipoEscolhido = TIPOS.find((t) => t.key === classeSelecionada) ?? null;
  // Preço por pessoa (o que já existia) — usado na grade "Tipos e
  // preços", que sempre mostra o valor individual de cada opção.
  const precoEscolhidoUSD =
    tipoEscolhido && diasSelecionados ? tipoEscolhido.precoUSD[diasSelecionados] : null;
  const precoEscolhidoBRL = precoEscolhidoUSD !== null && cambio ? precoEscolhidoUSD * cambio.cotacao : null;
  // Preço total (por pessoa × número de pessoas, já com o desconto de
  // criança 6–11 anos aplicado via multiplicadorPessoas) — usado no
  // rodapé, na simulação de forma de pagamento e na mensagem de
  // WhatsApp, já que o passe é vendido individualmente e cada viajante
  // precisa do próprio.
  const precoTotalUSD = precoEscolhidoUSD !== null ? precoEscolhidoUSD * multiplicadorPessoas : null;
  const precoTotalBRL = precoEscolhidoBRL !== null ? precoEscolhidoBRL * multiplicadorPessoas : null;
  const selecaoCompleta = !!tipoEscolhido && !!diasSelecionados;
  const descricaoPagamentoEscolhido = descricaoFormaPagamento(
    formaPagamento,
    precoTotalBRL,
    dataInicioViagem,
  );
  const detalheCriancasTexto =
    numeroCriancas > 0
      ? ` (sendo ${numeroCriancas} ${numeroCriancas === 1 ? "criança" : "crianças"}${
          criancasComDesconto > 0 ? `, ${criancasComDesconto} com meia-entrada 6-11 anos` : ""
        })`
      : "";
  const mensagemWhatsapp = selecaoCompleta
    ? `Olá! Quero finalizar a compra do JR Pass${nome ? ` — meu nome é ${nome}` : ""} — ${tipoEscolhido!.classe}, ${diasSelecionados} dias, ${numeroPessoas} ${
        numeroPessoas === 1 ? "pessoa" : "pessoas"
      }${detalheCriancasTexto}${
        precoTotalBRL !== null ? ` (total ${formatBRL(precoTotalBRL)})` : ""
      }.${
        dataInicioViagem && dataFimViagem
          ? ` Viagem de ${formatarDataBR(dataInicioViagem)} a ${formatarDataBR(dataFimViagem)}.`
          : ""
      }${descricaoPagamentoEscolhido ? ` Forma de pagamento: ${descricaoPagamentoEscolhido}.` : ""}`
    : "";

  // Pedido do Wilson, 25/set/2026: "adicionar nome, e-mail e telefone
  // nessa página, registrar no CRM ao proceder para pagamento" — só
  // libera o botão "Finalizar Compra" com seleção completa, contato
  // válido, termos aceitos, e alguma decisão sobre o documento (anexado
  // OU explicitamente adiado — nunca trava no resultado do OCR, só exige
  // que o cliente tenha feito uma escolha).
  const formValido =
    selecaoCompleta &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    termosAceitos &&
    (documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto");

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/jrpass-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classe: tipoEscolhido?.classe,
          dias: diasSelecionados,
          numeroPessoas,
          numeroCriancas,
          idadesCriancas: idadesCriancasPreenchidas,
          dataInicioViagem,
          dataFimViagem,
          precoTotalBRL,
          precoTotalUSD,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          email,
          whatsapp,
          observacoes,
          documentoTipo,
          documentoStoragePath,
          documentoValidacaoMotivo,
          documentoAdiado,
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jr-pass-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <p
            id="jr-pass-modal-title"
            className={`${display.className} text-lg font-medium text-black md:text-xl`}
          >
            JR Pass
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar JR Pass"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de JR Pass
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
                Nossa equipe confere o documento enviado (ou aguarda o que você anexar depois),
                confirma a elegibilidade e te manda o link de pagamento (Pix ou cartão) pelo
                WhatsApp e por e-mail — junto com a explicação completa de como funciona a troca do
                voucher pelo passe físico no Japão.
              </p>
              {documentoAdiado && (
                <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-amber-700">
                  Você optou por anexar o documento (passaporte ou passagem) depois — pode mandar
                  direto pelo WhatsApp assim que tiver em mãos.
                </p>
              )}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <>
          <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Japan Rail Pass</p>
          <h3
            className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
          >
            Deslocamentos ilimitados de trem-bala em todo o Japão
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
            Passe ferroviário oficial dos seis grupos JR, vendido em faixas fixas de 7, 14 ou 21
            dias corridos — cobre a maior parte da rede Shinkansen, trens expressos, locais,
            ônibus JR e o Tokyo Monorail.
          </p>

          {/* Tipos e preços */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Tipos e preços</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {TIPOS.map((tipo) => (
                <div
                  key={tipo.key}
                  className={`rounded-2xl border p-5 transition ${
                    classeSelecionada === tipo.key
                      ? "border-[#2f80c9] bg-[#2f80c9]/5"
                      : "border-black/10 bg-black/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tipo.icone} alt="" className="h-10 w-10 shrink-0 object-contain" />
                    <p className={`${display.className} text-base font-medium text-black`}>
                      {tipo.classe}
                    </p>
                  </div>
                  <div className="mt-4">
                    {JR_PASS_DIAS_OPCOES.map((dias) => {
                      const selecionado = classeSelecionada === tipo.key && diasSelecionados === dias;
                      return (
                        <button
                          key={dias}
                          type="button"
                          onClick={() => {
                            setClasseSelecionada(tipo.key);
                            setDiasSelecionados(dias);
                          }}
                          className="flex w-full items-center justify-between border-t border-black/5 py-2.5 text-left first:border-t-0 first:pt-0"
                        >
                          <span className="flex items-center gap-2 text-xs text-black/55">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selecionado ? "border-[#2f80c9] bg-[#2f80c9]" : "border-black/20"
                              }`}
                            >
                              {selecionado && <IconCheck className="h-2.5 w-2.5 text-white" />}
                            </span>
                            {dias} dias
                          </span>
                          <span className="text-right">
                            <span
                              className={`block text-sm font-medium ${selecionado ? "text-[#2f80c9]" : "text-black"}`}
                            >
                              {formatUSD(tipo.precoUSD[dias])}
                            </span>
                            {cambio && (
                              <span className="block text-[11px] text-black/40">
                                {formatBRL(tipo.precoUSD[dias] * cambio.cotacao)}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 border-t border-black/5 pt-3 text-[10px] leading-4 text-black/35">
                    Tabela oficial JR (ienes, vigente a partir de 1/out/2026):{" "}
                    {JR_PASS_DIAS_OPCOES.map((dias, index) => (
                      <span key={dias}>
                        {index > 0 && " · "}
                        {dias}d {formatJPY(JR_PASS_OFICIAL_JPY[tipo.key][dias])}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-black/40">
              Valor por pessoa, já com taxas incluídas, convertido pela cotação do dia.
            </p>
            <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/35" />
          </div>

          {/* Datas da viagem — pedido do Wilson, 25/set/2026: "falta
              adicionar a data de inicio e encerramento da viagem". Mesmo
              padrão de campo de data do Seguro Viagem; entram na mensagem
              de WhatsApp pro time já saber o período. */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Dados da viagem</p>
            <div className="mt-4 grid gap-4 sm:max-w-md sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                  Início da viagem
                </span>
                <input
                  type="date"
                  value={dataInicioViagem}
                  onChange={(e) => setDataInicioViagem(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                  Término da viagem
                </span>
                <input
                  type="date"
                  value={dataFimViagem}
                  onChange={(e) => setDataFimViagem(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Número de pessoas — pedido do Wilson, 25/set/2026: "falta
              numero de pessoas". O JR Pass é vendido por pessoa (cada
              viajante precisa do próprio passe), então o preço final no
              rodapé é o valor por pessoa (grade acima) × esse número.
              Mesmo stepper do "Viajantes" do Seguro Viagem. Desconto de
              criança (6–11 anos, metade do preço) é o bloco logo abaixo. */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Número de pessoas</p>
            <div className="mt-4 flex max-w-xs items-center gap-2">
              <button
                type="button"
                onClick={() => ajustarNumeroPessoas(numeroPessoas - 1)}
                aria-label="Diminuir número de pessoas"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
              >
                −
              </button>
              <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                {numeroPessoas} {numeroPessoas === 1 ? "pessoa" : "pessoas"}
              </span>
              <button
                type="button"
                onClick={() => ajustarNumeroPessoas(numeroPessoas + 1)}
                aria-label="Aumentar número de pessoas"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-black/40">
              Cada viajante precisa do próprio passe — o preço no rodapé já é o total pras{" "}
              {numeroPessoas} {numeroPessoas === 1 ? "pessoa" : "pessoas"}.
            </p>

            {/* Crianças com desconto — pedido do Wilson, 25/set/2026:
                "quando é criança o cliente paga metade do valor, criança
                entre 6 a 12 anos incompletos" + "tem que ter um campo com
                numero de crianças e idade da criança para ser
                selecionada" — stepper de quantas das pessoas acima são
                crianças, e um seletor de idade por criança (mesmo padrão
                da grade de idades do Seguro Viagem), pra confirmar se
                cada uma cai mesmo na faixa 6–11 que dá direito à
                meia-entrada. */}
            <div className="mt-6 border-t border-black/10 pt-5">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black/50">
                Crianças (opcional) — 6 a 11 anos pagam metade
              </span>
              <div className="flex max-w-xs items-center gap-2">
                <button
                  type="button"
                  onClick={() => ajustarNumeroCriancas(numeroCriancas - 1)}
                  aria-label="Diminuir número de crianças"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                >
                  −
                </button>
                <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                  {numeroCriancas} {numeroCriancas === 1 ? "criança" : "crianças"}
                </span>
                <button
                  type="button"
                  onClick={() => ajustarNumeroCriancas(numeroCriancas + 1)}
                  aria-label="Aumentar número de crianças"
                  disabled={numeroCriancas >= numeroPessoas}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-black transition ${
                    numeroCriancas >= numeroPessoas
                      ? "cursor-not-allowed border-black/10 text-black/25"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  +
                </button>
              </div>

              {numeroCriancas > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {idadesCriancas.map((idade, index) => {
                    const multiplicador = typeof idade === "number" ? multiplicadorPorIdadeCrianca(idade) : null;
                    const rotuloFaixa =
                      multiplicador === 0
                        ? "Grátis (menor de 6)"
                        : multiplicador === 0.5
                          ? "50% (6 a 11 anos)"
                          : multiplicador === 1
                            ? "Valor cheio (12+)"
                            : null;
                    return (
                      <label key={index} className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                          Idade — criança {index + 1}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={17}
                          value={idade}
                          onChange={(e) => {
                            const valor =
                              e.target.value === "" ? "" : Math.max(0, Math.min(17, Number(e.target.value)));
                            setIdadesCriancas((atual) => atual.map((v, i) => (i === index ? valor : v)));
                          }}
                          className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                        />
                        {rotuloFaixa && (
                          <span
                            className={`text-[10px] ${
                              multiplicador === 0
                                ? "text-emerald-700"
                                : multiplicador === 0.5
                                  ? "text-[#1c6ea8]"
                                  : "text-black/40"
                            }`}
                          >
                            {rotuloFaixa}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Resumo das faixas — nota 3 da tabela do fornecedor
                  (Century Travel, 25/set/2026): menor de 6 não paga, 6 a
                  11 completa paga metade, 12+ conta como adulto. */}
              {(criancasGratis > 0 || criancasComDesconto > 0 || criancasComoAdulto > 0) && (
                <p className="mt-2 text-[11px] leading-5 text-black/40">
                  {criancasGratis > 0 && `${criancasGratis} grátis (menor de 6 anos)`}
                  {criancasGratis > 0 && (criancasComDesconto > 0 || criancasComoAdulto > 0) && " · "}
                  {criancasComDesconto > 0 && `${criancasComDesconto} com 50% de desconto (6 a 11 anos)`}
                  {criancasComDesconto > 0 && criancasComoAdulto > 0 && " · "}
                  {criancasComoAdulto > 0 &&
                    `${criancasComoAdulto} no valor cheio de adulto (12 anos ou mais)`}
                  {" "}— já aplicado no total abaixo.
                </p>
              )}
            </div>
          </div>

          {/* Critérios de elegibilidade */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Critérios de elegibilidade
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {ELEGIBILIDADE.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras de uso */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Regras de uso</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {REGRAS_DE_USO.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-black/35">
              Fonte: sites oficiais do Japan Rail Pass (japanrailpass.net/en) — páginas de
              elegibilidade, condições de uso e tabela de preços.
            </p>
          </div>

          {/* Documento — pedido do Wilson, 25/set/2026: "precisa capturar a
              foto do passaporte do cliente, criar um validador de foto
              script simples de checagem" + "foto do passaporte ou foto da
              passagem, a o JR pass só pode ser emitido se ele estiver no
              Japao em até 90 dias" + "colocar opção de anexar documentos
              depois também". */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Documento — passaporte ou passagem
            </p>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-black/50">
              O JR Pass só pode ser emitido pra quem já está no Japão (ou vai entrar) dentro da
              janela de 90 dias — o carimbo de entrada no passaporte ou a data do voo na passagem
              confirmam isso. Pode anexar um dos dois agora, ou deixar pra depois.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["passaporte", "passagem"] as const).map((tipo) => (
                <label
                  key={tipo}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                    documentoTipo === tipo
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                      : "border-black/15 text-black/60 hover:border-black/30"
                  }`}
                >
                  {tipo === "passaporte" ? "Foto do passaporte" : "Foto da passagem/itinerário"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo) void lidarComArquivoDocumento(tipo, arquivo);
                      e.target.value = "";
                    }}
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDocumentoAdiado(true);
                  setDocumentoStatus("vazio");
                  setDocumentoTipo(null);
                  setDocumentoNomeArquivo("");
                }}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  documentoAdiado
                    ? "border-black/40 bg-black/5 font-medium text-black"
                    : "border-black/15 text-black/50 hover:border-black/30"
                }`}
              >
                Anexar depois
              </button>
            </div>

            {documentoStatus === "enviando" && (
              <p className="mt-3 text-[11px] text-black/45">Enviando {documentoNomeArquivo}…</p>
            )}
            {documentoStatus === "validado" && (
              <p className="mt-3 text-[11px] text-emerald-700">
                Documento recebido — {documentoValidacaoMotivo || "conferência automática ok."}
              </p>
            )}
            {documentoStatus === "incerto" && (
              <p className="mt-3 text-[11px] text-amber-700">
                Documento recebido — {documentoValidacaoMotivo || "não conseguimos confirmar automaticamente."}{" "}
                Nossa equipe revisa manualmente antes da emissão.
              </p>
            )}
            {documentoStatus === "erro" && (
              <p className="mt-3 text-[11px] text-red-600">{documentoErro}</p>
            )}
            {documentoAdiado && (
              <p className="mt-3 text-[11px] text-black/45">
                Sem problema — pode mandar o documento pelo WhatsApp assim que tiver em mãos.
              </p>
            )}
          </div>

          {/* Dados de contato — pedido do Wilson, 25/set/2026: "adicionar
              nome, e-mail e telefone nessa página, registrar no CRM ao
              proceder para pagamento". */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Seus dados</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                  Nome completo
                </span>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">WhatsApp</span>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                Observações (opcional)
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                placeholder="Nome exatamente como está no passaporte, se diferente do nome acima, etc."
                className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
              />
            </label>
          </div>

          <FormasPagamento
            totalBRL={precoTotalBRL}
            dataViagem={dataInicioViagem}
            formaPagamento={formaPagamento}
            onEscolher={setFormaPagamento}
          />

          {/* Termos e condições — pedido do Wilson, 25/set/2026: "temos
              que adicionar um tick box no termos e condições para
              finalizar o pagamento, tem que ser um scroll com os termos
              e condições de aceite do jr pASS". Conteúdo vem das mesmas
              fontes já usadas em Regras de uso/Critérios de elegibilidade
              acima (sites oficiais JR) + tabela do fornecedor Century
              Travel (cancelamento, reembolso, validade do voucher). */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Termos e condições
            </p>
            <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60">
              <p className="font-medium text-black/80">Emissão e elegibilidade</p>
              <p className="mt-1">
                O Japan Rail Pass é vendido como um voucher (Exchange Order), trocado pelo passe
                físico só no Japão. Só pode ser emitido pra quem tem status de imigração
                &quot;Temporary Visitor&quot; carimbado no passaporte — o portão eletrônico não
                carimba, é preciso passar no balcão manual da imigração. Turistas estrangeiros têm
                estadia autorizada de até 90 dias; japoneses residentes no exterior há pelo menos
                10 anos podem comprar sob condições específicas, só pela modalidade de compra fora
                do Japão, antes da viagem.
              </p>
              <p className="mt-3 font-medium text-black/80">Validade do voucher</p>
              <p className="mt-1">
                O voucher tem validade de 3 meses a partir da emissão pra ser trocado pelo passe
                físico. O passe em si é pessoal e intransferível, vinculado a um passaporte
                específico — o nome informado precisa ser idêntico ao do passaporte que será usado
                na troca.
              </p>
              <p className="mt-3 font-medium text-black/80">Cancelamento e reembolso</p>
              <p className="mt-1">
                Cancelamento só é aceito dentro do mês de emissão do voucher, mediante taxa de
                serviço de US$ 10 por cupom. Reembolso (quando ainda cabível) tem taxa de 15% do
                valor do passe, com prazo máximo de 1 ano a partir da emissão. Se o voucher já foi
                trocado pelo passe físico, ou em caso de perda ou roubo, não há reembolso nem
                reposição.
              </p>
              <p className="mt-3 font-medium text-black/80">Uso do passe</p>
              <p className="mt-1">
                Cobre Shinkansen, trens expressos, expressos limitados e locais da JR, ônibus JR e
                o Tokyo Monorail — exceto os trens-bala Nozomi e Mizuho, que exigem bilhete
                especial à parte. Reservas de assento são gratuitas (limite de 110 por passe), mas
                recomendadas.
              </p>
              <p className="mt-3 font-medium text-black/80">Pagamento e responsabilidade dos dados</p>
              <p className="mt-1">
                O valor final é convertido pela cotação de câmbio turismo de venda do dia da
                compra. A Alpinea atua como intermediária entre o cliente e o fornecedor emissor —
                a exatidão dos dados e documentos enviados (nome, passaporte, datas de viagem) é de
                responsabilidade do cliente, já que divergências podem impedir a troca do voucher
                no Japão.
              </p>
            </div>
            <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
              <input
                type="checkbox"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9]"
              />
              Li e aceito os termos e condições de emissão, cancelamento, reembolso e uso do JR
              Pass acima.
            </label>
          </div>

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </>
          )}
        </div>

        {/* Rodapé fixo com a escolha atual — pedido do Wilson, 25/set/2026:
            "também precisa haver no rodapé da pagina o preço da minha
            escolha e o que escolhi com o botão 'Finalizar Compra Via
            Whatsapp'". Fica fora da área rolável (acima é overflow-y-auto),
            sempre visível enquanto o cliente decide tipo e duração.
            Redesenhado no mesmo dia, ainda 25/set/2026, a pedido do Wilson
            ("modal que msotra peço não está bom, use o mesmo ou similar
            que usamos na pagina de calculadora reversa no rodapé fixo") —
            segue a mesma hierarquia visual da "barra fixa" da calculadora
            reversa (label minúsculo, preço grande em destaque como âncora
            visual, linha secundária discreta), adaptada pro tema claro
            do /produtos em vez das cores escuras do original.

            Botão trocado de link direto de WhatsApp pra "Finalizar
            Compra" de verdade — pedido do Wilson, 25/set/2026: "aqui o
            finalizar compra vai gerar uma nova tela" + "adicionar nome,
            e-mail e telefone nessa página, registrar no CRM ao proceder
            para pagamento". Some no rodapé quando status vira "enviado"
            (a tela de confirmação já ocupa o corpo do modal). */}
        {status !== "enviado" && (
          <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div>
                {selecaoCompleta ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">Sua escolha</p>
                    <p className={`${display.className} text-xl font-medium text-[#2f80c9] sm:text-2xl`}>
                      {precoTotalBRL !== null ? formatBRL(precoTotalBRL) : "—"}
                    </p>
                    <p className="text-xs text-black/45">
                      {tipoEscolhido!.classe} · {diasSelecionados} dias · {numeroPessoas}{" "}
                      {numeroPessoas === 1 ? "pessoa" : "pessoas"}
                      {numeroCriancas > 0 &&
                        ` (${numeroCriancas} ${numeroCriancas === 1 ? "criança" : "crianças"}${
                          criancasComDesconto > 0 ? `, ${criancasComDesconto} c/ 50%` : ""
                        })`}
                      {precoTotalUSD !== null && ` · ${formatUSD(precoTotalUSD)}`}
                      {numeroPessoas > 1 && numeroCriancas === 0 && precoEscolhidoBRL !== null && (
                        <> · {formatBRL(precoEscolhidoBRL)}/pessoa</>
                      )}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-0.5 text-[11px] text-black/40">{descricaoPagamentoEscolhido}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-black/45">
                    Selecione o tipo (Comum ou Green Car) e a duração do passe acima.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition ${
                  formValido && status !== "enviando"
                    ? "bg-[#2f80c9] hover:bg-[#3b91dc]"
                    : "cursor-not-allowed bg-black/20"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Finalizar Compra"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — nossa equipe confirma a elegibilidade e envia o link de
              pagamento (Pix ou cartão) pelo WhatsApp e por e-mail.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// As 3 seguradoras parceiras de hoje (Wilson, 25/set/2026: "hoje
// trabalhamos com 3 empresas Affinity, GTA e MTA, o cliente pode escolher
// qualquer 1 dos 3"). Dados de cobertura pesquisados nos sites oficiais
// (affinityseguroviagem.com.br, gtaassist.com.br/segurogta.com.br,
// mytravelassist.com.br) em 25/set/2026 — nenhum dos três expõe uma
// tabela estática de plano×preço (o preço só sai depois de rodar a
// cotação com destino/datas/idade no site deles), então aqui entram só
// fatos que consegui confirmar com confiança:
// - Affinity 40 Essential: cobertura e preço exatamente como o Wilson
//   mandou print (25/set/2026) — US$ 40.000 em despesas médicas, US$ 500
//   em bagagem, "não atende EUA/Canadá".
// - MTA (My Travel Assist): a faixa de planos internacionais (MTA
//   15/30/40/60/150, US$ 15 mil a US$ 150 mil) veio de uma matéria da
//   Segurospromo sobre a seguradora — consistente com a nomenclatura do
//   Affinity 40 (número do plano = cobertura em milhares de dólar).
// - GTA (Global Travel Assistance): tentei o mesmo pros planos GTA, mas
//   os nomes/valores que encontrei em fontes diferentes não bateram entre
//   si (o site tem várias famílias de plano por região — Europa, EUA/
//   Canadá, América Latina, Mundial — e cada busca voltou uma tabela
//   diferente). Preferi não arriscar um plano/valor errado numa página
//   de venda pra cliente de alta renda — fica só a faixa ampla que se
//   repetiu em mais de uma fonte (US$ 36 mil a mais de US$ 300 mil,
//   conforme o plano), sem fixar nome de plano específico.
// O valor de referência mostrado no formulário (abaixo) é sempre o preço
// interno da Ajisai (DIARIA_SEGURO_VIAGEM × dias × multiplicador de
// idade — mesma fórmula usada na Calculadora Reversa e no self-service de
// Viagem Personalizada) — não é o preço de nenhuma seguradora específica;
// o plano e o valor final de cada uma são confirmados no fechamento.
//
// Ajuste 25/set/2026 (mesmo dia, pedido seguinte do Wilson): "incluir
// informações essenciais dos tipos de seguro viagem disponivel em cada
// uma das seguradoras e adicionar apolice e termos e condições de cada
// um". `tiposPlano` e `termosUrl`/`termosNota` abaixo vieram de nova
// pesquisa nos sites oficiais (25/set/2026):
// - Affinity: categorias de plano confirmadas na página oficial
//   (affinityseguroviagem.com.br) — Internacional/Nacional, Europa
//   (Schengen), Anual, Estudante, Esportes, Cruzeiros, Corporativo. PDF
//   de condições gerais linkado direto no rodapé do site oficial.
// - MTA: mantive a faixa MTA 15/30/40/60/150 já confirmada (fonte
//   Segurospromo) como os "tipos" — a My Travel Assist não nomeia planos
//   por categoria de viagem como as outras duas, só por faixa de
//   cobertura médica. PDF de condições gerais linkado no site oficial
//   parceiro (travelassist.com.br), que é quem opera a venda da MTA.
// - GTA: o site oficial não organiza os planos por nome/valor fixo, e
//   sim por destino (EUA, Europa, Brasil, América Latina, Canadá, Outros
//   destinos, Cruzeiros, Mundial, Copa do Mundo), por perfil (Lazer,
//   Estudante, Cruzeiro, Multiviagem, Receptivo, Esporte profissional) e
//   por faixa etária (até 64 / 65–85 / 86–89 anos) — usei exatamente essa
//   classificação oficial, sem inventar nome de plano. As condições
//   gerais da GTA também não são um PDF único: o site oficial lista uma
//   página-índice com vários PDFs, um por seguradora reguladora (IZA,
//   Chubb, Sancor, Sompo) e por data de vigência — linkei essa
//   página-índice e expliquei isso no texto, em vez de escolher um PDF
//   arbitrariamente.
//
// Ajuste no mesmo dia, depois de o Wilson abrir os PDFs e estranhar
// ("sabemi? ezze seguros? que diabos é isso? colocou material de
// seguradoras concorrentes em vez de informacao do site oficial?"):
// conferi de novo, abrindo os PDFs de verdade. Não é material de
// concorrente — é o documento oficial certo, só que assinado pela
// SEGURADORA REGULADORA (a empresa com registro na SUSEP que responde
// pela apólice), que é uma empresa diferente da marca comercial de
// assistência-viagem (GTA/MTA/Affinity não são seguradoras licenciadas
// — são administradoras do programa de assistência, o seguro em si é
// emitido por uma parceira regulada). Confirmado abrindo os PDFs:
// - O PDF oficial da MTA (travelassist.com.br) é emitido pela EZZE
//   Seguros S.A. (CNPJ 31.534.848/0001-24, SUSEP 15414.649792/2026-78)
//   — "My Travel Assist"/"MTA" não aparece em nenhum lugar do documento.
// - O índice de condições gerais da GTA lista PDFs históricos assinados
//   por IZA, Chubb, Sancor e Sompo (nenhum "Sabemi" nessa lista, pelo
//   menos até onde consegui ver) — qual seguradora aparece depende de
//   qual PDF específico da lista o cliente abre.
// - O PDF da Affinity é ainda mais estranho: em vez de mostrar um nome
//   de seguradora de verdade, usa um placeholder literal
//   "(SEGURADORA) SEGUROS S/A" — parece um modelo/template que a
//   Affinity não preencheu direito no site oficial deles. Vale
//   confirmar direto com a Affinity qual seguradora responde pela
//   apólice antes de apresentar isso pra cliente.
//
// Decisão final do Wilson, mesmo dia, depois de ver os PDFs de novo:
// "já pedi pra substituir isso pelas informacoes oficiais você nunca
// deve usar material de empresas concorrentes" — regra clara,
// independente da explicação técnica acima (marca vs. seguradora
// reguladora): não expor nesta página nenhum documento assinado por
// uma empresa diferente da marca escolhida pelo cliente. Removi os
// links de "condições gerais" da GTA e da MTA (`termosUrl`/
// `termosLabel` = null) — o `termosNota` de cada uma explica que o
// documento completo é enviado junto com a apólice no fechamento, sem
// linkar um PDF assinado pela seguradora parceira. Mantive o link da
// Affinity: o PDF dela é hospedado no domínio oficial dela e não tem
// nome nem logo de nenhuma outra empresa (só o placeholder genérico
// "(SEGURADORA) SEGUROS S/A" — problema de template, não material de
// concorrente).
const SEGURADORAS_VIAGEM = [
  {
    key: "affinity" as const,
    nome: "Affinity",
    // Logo enviado pelo Wilson, 25/set/2026.
    logo: "/images/Affinity-Logo.png",
    descricao:
      "Plano de referência: 40 Essential — cobertura médica de US$ 40.000 e US$ 500 em bagagem extraviada.",
    observacao: "Não atende EUA/Canadá — para esses destinos a Affinity tem planos de cobertura maior.",
    // "Europa (Schengen)" removido daqui — pedido do Wilson, 25/set/2026
    // ("você lista tipos de seguro que não tem aplicacao para Japao e
    // Asia, qual o racional?"): é uma faixa específica pra destinos do
    // Espaço Schengen, não cobre Japão nem o resto da Ásia, então não
    // faz sentido mostrar numa página de venda focada em Japão. Mantidos
    // só os tipos que não são restritos a outra região (a Affinity não
    // tem uma faixa "Ásia" própria — cobertura pra Japão entra no
    // "Internacional/Nacional").
    tiposPlano: [
      "Internacional/Nacional",
      "Anual (multiviagem)",
      "Estudante",
      "Esportes",
      "Cruzeiros",
      "Corporativo",
    ],
    termosUrl: "https://affinityseguroviagem.com.br/condicoes-gerais/afinity.pdf",
    termosLabel: "Condições gerais (PDF)",
    termosNota:
      "PDF oficial da Affinity. Repare que ele não nomeia a seguradora reguladora (usa um texto genérico no lugar) — confirmamos qual seguradora responde pela apólice antes de fechar.",
  },
  {
    key: "gta" as const,
    nome: "GTA",
    // Logo enviado pelo Wilson, 25/set/2026 (mandou depois dos outros
    // dois, no mesmo dia).
    logo: "/images/GTA-Logo.png",
    descricao:
      "Global Travel Assistance — uma das seguradoras de viagem mais tradicionais do Brasil, com planos de US$ 36 mil a mais de US$ 300 mil em cobertura médica.",
    observacao:
      "Para Japão/Ásia o plano correto é o Mundial — a GTA não tem faixa própria pra esses destinos, e as faixas EUA/Europa/Brasil/América Latina/Canadá não se aplicam. Cobertura varia dentro do Mundial — confirmamos o plano exato no fechamento.",
    // "Por destino" filtrado — pedido do Wilson, 25/set/2026 ("você
    // lista tipos de seguro que não tem aplicacao para Japao e Asia,
    // qual o racional?"): a lista completa da GTA (EUA, Europa, Brasil,
    // América Latina, Canadá, Mundial, Cruzeiros) tinha 5 faixas que não
    // cobrem Japão/Ásia. A GTA não vende uma faixa "Ásia" específica —
    // pra esses destinos o cliente cai no Mundial por eliminação, então
    // é a única faixa de destino que faz sentido mostrar aqui.
    tiposPlano: [
      "Por destino: Mundial (cobre Japão e Ásia)",
      "Por perfil: Lazer, Estudante, Cruzeiro, Multiviagem, Esporte profissional",
      "Por idade: até 64 / 65–85 / 86–89 anos",
    ],
    termosUrl: null,
    termosLabel: null,
    termosNota:
      "Condições gerais completas — fornecidas junto com a apólice no fechamento. O documento oficial da GTA vem assinado por uma seguradora parceira (histórico: IZA, Chubb, Sancor, Sompo), por isso não linkamos aqui um PDF assinado por outra marca.",
  },
  {
    key: "mta" as const,
    nome: "MTA",
    // Logo enviado pelo Wilson, 25/set/2026.
    logo: "/images/MTA-Logo.png",
    descricao:
      "My Travel Assist — planos internacionais de US$ 15 mil a US$ 150 mil em cobertura médica (MTA 15/30/40/60/150), com mais de 30 coberturas e assistências.",
    observacao: null,
    tiposPlano: ["MTA 15", "MTA 30", "MTA 40", "MTA 60", "MTA 150"],
    termosUrl: null,
    termosLabel: null,
    termosNota:
      "Condições gerais completas — fornecidas junto com a apólice no fechamento. O documento oficial da MTA vem assinado pela seguradora parceira EZZE Seguros, por isso não linkamos aqui um PDF assinado por outra marca.",
  },
];
type SeguradoraKey = (typeof SEGURADORAS_VIAGEM)[number]["key"];

/** "AAAA-MM-DD" (input type=date) → "DD/MM/AAAA", pra mensagens de WhatsApp
 * e resumos legíveis. */
function formatarDataBR(data: string): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

function diasEntreDatas(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;
  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T00:00:00`);
  const diffMs = dataFim.getTime() - dataInicio.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0;
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

// Roteiro do Seguro Viagem — Japão é obrigatório (é o produto do site),
// mas o cliente pode incluir outros países da Ásia na mesma viagem. Pedido
// do Wilson, 25/set/2026: "escolher pais, japão é o obrigatorio, mas
// cliente pode colocar outros paises da Asia na lista, calcular como isso
// afeta o preço e também o preço de cada subtipo de planos".
//
// Pesquisei se Affinity/GTA/MTA publicam preço por país — não publicam:
// as 3 só geram cotação depois de rodar destino+datas+idade no site delas
// (mesmo achado já registrado acima pra tabela de plano×preço). Não achei
// nenhuma fonte confiável mostrando quanto cada seguradora cobra a mais
// por incluir outro país da Ásia no roteiro, então NÃO fabriquei esse
// número por seguradora nem por subtipo de plano (os "tipos de plano" de
// cada seguradora, como Internacional/Europa/Anual da Affinity ou os
// tiers MTA 15/30/40/60/150, são categorias qualitativas — nenhuma delas
// tem tabela pública de preço por categoria).
//
// O que apliquei foi só o ajuste de REFERÊNCIA INTERNA da Ajisai: viagem
// só pro Japão usa a tarifa diária padrão (DIARIA_SEGURO_VIAGEM); ao
// incluir qualquer outro país, o roteiro deixa de ser "destino único" e
// passa a precisar de cobertura ampliada (o que as 3 seguradoras chamam
// de plano "Mundial"/multidestino em vez do plano de destino único) — por
// isso a referência sobe um percentual fixo, do mesmo jeito que o resto
// dessa tela já é só a estimativa interna da Ajisai (não o preço de
// nenhuma seguradora). Isso fica bem explícito no texto da página; o
// plano/subtipo e o valor exatos de cada seguradora continuam sendo
// confirmados no fechamento, como já era.
const PAISES_ASIA_ADICIONAIS = [
  "Coreia do Sul",
  "China",
  "Taiwan",
  "Hong Kong",
  "Tailândia",
  "Vietnã",
  "Cingapura",
  "Filipinas",
  "Indonésia",
  "Malásia",
  "Índia",
] as const;
/** Ajuste de referência interna quando o roteiro inclui outro país além do
 * Japão (deixa de ser "destino único") — ver comentário acima. */
const MULTIPLICADOR_ROTEIRO_MULTIDESTINO = 1.12;

// Pop-up dedicado do Seguro Viagem — mesmo tratamento dado ao JR Pass em
// 25/set/2026: saiu do ServicoAvulsoModal pequeno, ganhou o próprio
// componente no padrão de tamanho do modal "Hotéis" (max-w-5xl), com
// comparação das 3 seguradoras e um formulário de self-checkout completo
// (viajantes, idades, datas, contato). "Self-checkout" aqui é o mesmo
// fluxo já confirmado com o Wilson (AskUserQuestion, 25/set/2026) do
// /viagem_personalizada_selfservice: não existe gateway de pagamento no
// site — o formulário grava um lead no CRM (tag SELF-SERVICE) e o time
// fecha o pagamento de verdade pelo WhatsApp.
function SeguroViagemModal({ cambio, onClose }: { cambio: Cambio | null; onClose: () => void }) {
  const [seguradora, setSeguradora] = useState<SeguradoraKey | null>(null);
  const [numViajantes, setNumViajantes] = useState(1);
  const [idades, setIdades] = useState<(number | "")[]>([""]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  // Roteiro — Japão é fixo/obrigatório, cliente pode somar outros países
  // da Ásia. Pedido do Wilson, 25/set/2026 (ver comentário completo em
  // PAISES_ASIA_ADICIONAIS, acima).
  const [paisesAdicionais, setPaisesAdicionais] = useState<string[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  // País de residência — pedido do Wilson, 25/set/2026: "adicionar pais
  // em que reside" (relevante pro seguro viagem — algumas seguradoras
  // variam cobertura/elegibilidade conforme o país de residência do
  // segurado, não só o destino da viagem).
  // Onde mora — pedido do Wilson, 25/set/2026: "precisa colocar se ele
  // mora no brasil ou mora em outro país, se o cliente mora em outro
  // país, deve subir uma mensagem de que ele não pode contratar seguro
  // viagem por já estar em outro país" + depois: "adicionar também o
  // caminho de seguro viagem para quem mora no Japao, nesse caso só tem
  // GTA disponivel". Três estados: Brasil (fluxo normal), Japão (só GTA
  // — mesma restrição de quem tem 65+ anos, ver apenasGtaDisponivel mais
  // abaixo) e outro país (bloqueado — seguro viagem internacional só
  // pode ser contratado por quem ainda está no Brasil antes de embarcar).
  const [moraEm, setMoraEm] = useState<"brasil" | "japao" | "outro" | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Passagem aérea — pedido do Wilson, 25/set/2026: "tem que adicionar
  // check-box se o cliente já comprou a passagem ou não, adicionar campo
  // para dados da passagem como numero do voo e data de inicio e volta
  // da passagem aerea, adicionar campo para emitir passagem aérea via
  // ajisai". Não é obrigatório pro seguro em si — é informação extra que
  // ajuda a equipe a fechar o atendimento.
  const [passagemComprada, setPassagemComprada] = useState<"sim" | "nao" | null>(null);
  const [numeroVoo, setNumeroVoo] = useState("");
  const [dataIdaVoo, setDataIdaVoo] = useState("");
  const [dataVoltaVoo, setDataVoltaVoo] = useState("");
  const [emitirPassagemAjisai, setEmitirPassagemAjisai] = useState(false);

  function alternarPaisAdicional(pais: string) {
    setPaisesAdicionais((atual) =>
      atual.includes(pais) ? atual.filter((p) => p !== pais) : [...atual, pais],
    );
  }

  function ajustarNumViajantes(novo: number) {
    const seguro = Math.max(1, Math.min(8, novo));
    setNumViajantes(seguro);
    setIdades((atual) => {
      const proximo = atual.slice(0, seguro);
      while (proximo.length < seguro) proximo.push("");
      return proximo;
    });
  }

  const idadesNumericas = idades.filter((i): i is number => typeof i === "number");
  const idadesForaLimite = idadesNumericas.filter((i) => i > IDADE_LIMITE_SEGURO).length;
  // Recomendação de seguradora por idade — pedido do Wilson, 25/set/2026:
  // "affinity e MTA até 64 anos, acima de 64 anos GTA tem melhor preço"
  // (a própria GTA já tem faixa etária própria que passa dos 64 — ver
  // "Por idade: até 64 / 65–85 / 86–89 anos" em SEGURADORAS_VIAGEM). Só
  // uma sugestão visual — não força a escolha.
  const IDADE_RECOMENDACAO_GTA = 64;
  const algumViajanteAcimaDe64 = idadesNumericas.some((i) => i > IDADE_RECOMENDACAO_GTA);
  // "Só GTA disponível" — combina as duas restrições pedidas pelo Wilson,
  // 25/set/2026: viajante(s) acima de 64 anos ("se o cliente tem 65 anos,
  // deve ter só GTA") e residente no Japão ("quem mora no Japao, nesse
  // caso só tem GTA disponivel").
  const apenasGtaDisponivel = algumViajanteAcimaDe64 || moraEm === "japao";
  const residenciaBloqueada = moraEm === "outro";
  const dias = diasEntreDatas(dataInicio, dataFim);
  const multiplicadorTotal = idadesNumericas.reduce(
    (soma, idade) => soma + (multiplicadorSeguroPorIdade(idade) ?? 0),
    0,
  );
  const roteiroSoJapao = paisesAdicionais.length === 0;
  const multiplicadorDestino = roteiroSoJapao ? 1 : MULTIPLICADOR_ROTEIRO_MULTIDESTINO;
  // Seguro Viagem é nativo em BRL (DIARIA_SEGURO_VIAGEM já sai em reais,
  // com imposto+margem — ver comentário em CustomPackageCard.tsx),
  // diferente de JR Pass/guia/motorista/câmbio-aeroporto que são nativos
  // em dólar. Corrigido 25/set/2026 — antes multiplicava por
  // cambio.cotacao como se fosse dólar, inflando o preço em ~5x (pedido
  // do Wilson: "valores estao mto diferentes do seguro viagem da
  // calculadora reversa... está muito fora").
  const valorReferenciaBRL =
    dias > 0 ? DIARIA_SEGURO_VIAGEM * dias * multiplicadorTotal * multiplicadorDestino : 0;
  const descricaoPagamentoEscolhido = descricaoFormaPagamento(formaPagamento, valorReferenciaBRL, dataInicio);

  const formValido =
    !!seguradora &&
    !residenciaBloqueada &&
    (moraEm === "brasil" || moraEm === "japao") &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    !!dataInicio &&
    !!dataFim &&
    dias > 0 &&
    idadesNumericas.length === numViajantes;

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/seguro-viagem-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguradora,
          dataInicio,
          dataFim,
          dias,
          idades: idadesNumericas,
          paises: ["Japão", ...paisesAdicionais],
          valorReferenciaBRL,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          email,
          whatsapp,
          paisResidencia:
            moraEm === "brasil"
              ? "Brasil"
              : moraEm === "japao"
                ? "Japão (residente)"
                : moraEm === "outro"
                  ? "Outro país (fora do Brasil e do Japão)"
                  : "",
          observacoes,
          passagemComprada,
          numeroVoo: passagemComprada === "sim" ? numeroVoo : "",
          dataIdaVoo: passagemComprada === "sim" ? dataIdaVoo : "",
          dataVoltaVoo: passagemComprada === "sim" ? dataVoltaVoo : "",
          emitirPassagemAjisai: passagemComprada === "nao" ? emitirPassagemAjisai : false,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const seguradoraEscolhida = SEGURADORAS_VIAGEM.find((s) => s.key === seguradora);
  const mensagemWhatsapp = `Olá! Acabei de solicitar o Seguro Viagem (${
    seguradoraEscolhida?.nome ?? ""
  }) pelo site da Ajisai — meu nome é ${nome}.`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seguro-viagem-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <p
            id="seguro-viagem-modal-title"
            className={`${display.className} text-lg font-medium text-black md:text-xl`}
          >
            Seguro Viagem
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Seguro Viagem"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de Seguro Viagem
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
                Nossa equipe confirma o plano exato e o valor final direto com a{" "}
                {seguradoraEscolhida?.nome ?? "seguradora escolhida"} e fecha com você pelo WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Seguro Viagem</p>
              <h3
                className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
              >
                Cobertura médica e assistência para toda a viagem
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
                A Ajisai trabalha hoje com três seguradoras parceiras — escolha a que preferir, preencha os
                dados da viagem e do grupo, e nossa equipe confirma o plano exato e fecha com você.
              </p>

              {/* Comparação das seguradoras */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Escolha a seguradora</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {SEGURADORAS_VIAGEM.filter((s) => !apenasGtaDisponivel || s.key === "gta").map((s) => (
                    <div
                      key={s.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSeguradora(s.key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSeguradora(s.key);
                        }
                      }}
                      className={`flex h-full cursor-pointer flex-col rounded-2xl border p-5 text-left transition ${
                        seguradora === s.key
                          ? "border-[#2f80c9] bg-[#2f80c9]/5"
                          : "border-black/10 bg-white hover:border-black/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt={s.nome} className="h-11 w-auto max-w-[160px] object-contain" />
                        ) : (
                          <p className={`${display.className} text-base font-medium text-black`}>{s.nome}</p>
                        )}
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            seguradora === s.key ? "border-[#2f80c9] bg-[#2f80c9]" : "border-black/20"
                          }`}
                        >
                          {seguradora === s.key && <IconCheck className="h-3.5 w-3.5 text-white" />}
                        </span>
                      </div>
                      {/* Recomendação por idade — pedido do Wilson,
                          25/set/2026: "affinity e MTA até 64 anos, acima
                          de 64 anos GTA tem melhor preço". */}
                      {s.key === "gta" && algumViajanteAcimaDe64 && (
                        <span className="mt-2 inline-flex w-fit items-center rounded-full bg-emerald-600/10 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                          Recomendado — melhor preço para 65+ anos
                        </span>
                      )}
                      {(s.key === "affinity" || s.key === "mta") && !algumViajanteAcimaDe64 && idadesNumericas.length > 0 && (
                        <span className="mt-2 inline-flex w-fit items-center rounded-full bg-[#2f80c9]/10 px-2.5 py-1 text-[10px] font-medium text-[#1c6ea8]">
                          Boa opção até 64 anos
                        </span>
                      )}
                      <p className="mt-3 flex-1 text-[11px] leading-5 text-black/70">{s.descricao}</p>
                      {s.observacao && (
                        <p className="mt-2 text-[10px] leading-4 text-black/50">{s.observacao}</p>
                      )}

                      {/* Tipos de plano + condições gerais — pedido do
                          Wilson, 25/set/2026: "incluir informações
                          essenciais dos tipos de seguro viagem disponivel
                          em cada uma das seguradoras e adicionar apolice
                          e termos e condições de cada um". */}
                      <div className="mt-3 border-t border-black/10 pt-3">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                          Tipos de plano
                        </p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {s.tiposPlano.map((tipo) => (
                            <li
                              key={tipo}
                              className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[10px] leading-none text-black/65"
                            >
                              {tipo}
                            </li>
                          ))}
                        </ul>
                        {s.termosUrl && (
                          <a
                            href={s.termosUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-medium text-[#1c6ea8] underline decoration-[#1c6ea8]/40 underline-offset-2 hover:text-[#2f80c9]"
                          >
                            {s.termosLabel} ↗
                          </a>
                        )}
                        {s.termosNota && (
                          <p className="mt-2 text-[10px] leading-4 text-black/40">{s.termosNota}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {apenasGtaDisponivel && (
                  <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] leading-5 text-emerald-800">
                    Só a GTA está disponível para o seu caso
                    {algumViajanteAcimaDe64 && moraEm === "japao"
                      ? " — viajante(s) acima de 64 anos e residente no Japão."
                      : algumViajanteAcimaDe64
                        ? " — viajante(s) acima de 64 anos."
                        : " — seguro viagem pra quem já mora no Japão."}
                  </p>
                )}
                <p className="mt-3 text-[11px] leading-5 text-black/40">
                  Nenhuma das três seguradoras publica tabela fixa de plano e preço — o valor final depende
                  de destino, datas e idade de cada viajante. O valor abaixo é a referência interna da
                  Ajisai; o plano e o preço exatos são confirmados com a seguradora escolhida no fechamento.
                </p>
              </div>

              {/* Formulário de self-checkout */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Dados da viagem</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Início da viagem
                    </span>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Término da viagem
                    </span>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                </div>
                {dataInicio && dataFim && dias === 0 && (
                  <p className="mt-2 text-[11px] text-red-600">
                    A data de término precisa ser depois da data de início.
                  </p>
                )}

                {/* Roteiro — Japão obrigatório, outros países da Ásia
                    opcionais. Pedido do Wilson, 25/set/2026: "escolher
                    pais, japão é o obrigatorio, mas cliente pode colocar
                    outros paises da Asia na lista, calcular como isso
                    afeta o preço" — ver comentário completo em
                    PAISES_ASIA_ADICIONAIS sobre por que o efeito no preço
                    é só um ajuste de referência interna da Ajisai (as 3
                    seguradoras não publicam preço por país). */}
                <div className="mt-5">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black/50">
                    Roteiro
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1.5 rounded-full border border-[#2f80c9] bg-[#2f80c9]/10 px-3 py-1.5 text-[11px] font-medium text-[#1c6ea8]">
                      <IconCheck className="h-3 w-3" />
                      Japão (obrigatório)
                    </span>
                    {PAISES_ASIA_ADICIONAIS.map((pais) => {
                      const selecionado = paisesAdicionais.includes(pais);
                      return (
                        <button
                          key={pais}
                          type="button"
                          onClick={() => alternarPaisAdicional(pais)}
                          className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                            selecionado
                              ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                              : "border-black/15 text-black/55 hover:border-black/30"
                          }`}
                        >
                          {selecionado ? "✓ " : "+ "}
                          {pais}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-black/40">
                    {roteiroSoJapao
                      ? "Viagem só pro Japão — referência de preço abaixo usa a tarifa de destino único."
                      : `Roteiro com mais ${paisesAdicionais.length} ${
                          paisesAdicionais.length === 1 ? "país" : "países"
                        } além do Japão — deixa de ser destino único, então a referência abaixo já soma um adicional interno da Ajisai (+${Math.round(
                          (MULTIPLICADOR_ROTEIRO_MULTIDESTINO - 1) * 100,
                        )}%) pra cobertura mundial/multidestino. O tipo de plano e o valor exatos são confirmados com a seguradora escolhida.`}
                  </p>
                </div>

                <div className="mt-5 max-w-xs">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black/50">
                    Viajantes
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ajustarNumViajantes(numViajantes - 1)}
                      aria-label="Diminuir viajantes"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                    >
                      −
                    </button>
                    <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                      {numViajantes} {numViajantes === 1 ? "viajante" : "viajantes"}
                    </span>
                    <button
                      type="button"
                      onClick={() => ajustarNumViajantes(numViajantes + 1)}
                      aria-label="Aumentar viajantes"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {idades.map((idade, index) => (
                    <label key={index} className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                        Idade — viajante {index + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={idade}
                        onChange={(e) => {
                          const valor = e.target.value === "" ? "" : Math.max(0, Math.min(120, Number(e.target.value)));
                          setIdades((atual) => atual.map((v, i) => (i === index ? valor : v)));
                        }}
                        className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
                {idadesForaLimite > 0 && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    {idadesForaLimite} {idadesForaLimite === 1 ? "viajante acima" : "viajantes acima"} de{" "}
                    {IDADE_LIMITE_SEGURO} anos — fora da faixa de cálculo automático; cotamos direto com a
                    seguradora.
                  </p>
                )}
              </div>

              {/* Passagem aérea — pedido do Wilson, 25/set/2026: "tem que
                  adicionar check-box se o cliente já comprou a passagem
                  ou não, adicionar campo para dados da passagem como
                  numero do voo e data de inicio e volta da passagem
                  aerea, adicionar campo para emitir passagem aérea via
                  ajisai". */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Passagem aérea</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPassagemComprada("sim")}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      passagemComprada === "sim"
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                        : "border-black/15 text-black/60 hover:border-black/30"
                    }`}
                  >
                    Já comprei a passagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassagemComprada("nao")}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      passagemComprada === "nao"
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                        : "border-black/15 text-black/60 hover:border-black/30"
                    }`}
                  >
                    Ainda não comprei
                  </button>
                </div>

                {passagemComprada === "sim" && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                        Número do voo
                      </span>
                      <input
                        type="text"
                        value={numeroVoo}
                        onChange={(e) => setNumeroVoo(e.target.value)}
                        placeholder="ex.: JL0034"
                        className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                        Data de ida
                      </span>
                      <input
                        type="date"
                        value={dataIdaVoo}
                        onChange={(e) => setDataIdaVoo(e.target.value)}
                        className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                        Data de volta
                      </span>
                      <input
                        type="date"
                        value={dataVoltaVoo}
                        onChange={(e) => setDataVoltaVoo(e.target.value)}
                        className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                      />
                    </label>
                  </div>
                )}

                {passagemComprada === "nao" && (
                  <label className="mt-4 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
                    <input
                      type="checkbox"
                      checked={emitirPassagemAjisai}
                      onChange={(e) => setEmitirPassagemAjisai(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    Quero que a Ajisai emita minha passagem aérea
                  </label>
                )}
              </div>

              {/* Seus dados — inclui país de residência, pedido do
                  Wilson, 25/set/2026: "adicionar pais em que reside". */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Seus dados</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Nome completo
                    </span>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">E-mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">WhatsApp</span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Onde você mora
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMoraEm("brasil")}
                        className={`rounded-lg border px-2.5 py-2.5 text-[11px] transition ${
                          moraEm === "brasil"
                            ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                            : "border-black/15 text-black/60 hover:border-black/30"
                        }`}
                      >
                        Brasil
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoraEm("japao")}
                        className={`rounded-lg border px-2.5 py-2.5 text-[11px] transition ${
                          moraEm === "japao"
                            ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                            : "border-black/15 text-black/60 hover:border-black/30"
                        }`}
                      >
                        Japão
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoraEm("outro")}
                        className={`rounded-lg border px-2.5 py-2.5 text-[11px] transition ${
                          moraEm === "outro"
                            ? "border-amber-600 bg-amber-50 font-medium text-amber-800"
                            : "border-black/15 text-black/60 hover:border-black/30"
                        }`}
                      >
                        Outro país
                      </button>
                    </div>
                  </div>
                </div>

                {residenciaBloqueada && (
                  <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-800">
                    Esse seguro viagem é pra quem ainda está no Brasil antes de embarcar — como você já
                    mora fora do Brasil e do Japão, não conseguimos emitir essa apólice por aqui. Fale com
                    a gente pelo WhatsApp pra ver as opções disponíveis pra sua situação.
                  </p>
                )}

                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                    Observações (opcional)
                  </span>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    placeholder="Condição de saúde pré-existente, prática de esportes na viagem, etc."
                    className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                  />
                </label>
              </div>

              {/* Resumo de preço */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Valor de referência Ajisai
                </p>
                {valorReferenciaBRL && valorReferenciaBRL > 0 ? (
                  <>
                    <p className={`${display.className} mt-1 text-3xl font-medium text-black`}>
                      {formatBRL(valorReferenciaBRL)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-black/50">
                      ou {formatUSD(valorReferenciaUSD)}
                    </p>
                    <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/35" />
                  </>
                ) : (
                  <p className="mt-1 text-sm text-black/50">
                    Preencha as datas da viagem e a idade de cada viajante para ver o valor de referência.
                  </p>
                )}
              </div>

              <FormasPagamento
                totalBRL={valorReferenciaBRL}
                dataViagem={dataInicio}
                formaPagamento={formaPagamento}
                onEscolher={setFormaPagamento}
              />

              {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </>
          )}
        </div>

        {/* Rodapé fixo com o valor de referência e o botão de solicitar —
            pedido do Wilson, 25/set/2026: "adicionar modal de preço no
            rodapé na pagina de seguro viagem tambem", mesmo padrão da
            "barra fixa" recém-aplicada no JrPassModal (label minúsculo +
            preço grande em destaque + botão de ação), fica fora da área
            rolável e some na tela de confirmação. */}
        {status !== "enviado" && (
          <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div>
                {valorReferenciaBRL && valorReferenciaBRL > 0 ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Valor de referência
                    </p>
                    <p className={`${display.className} text-xl font-medium text-[#2f80c9] sm:text-2xl`}>
                      {formatBRL(valorReferenciaBRL)}
                    </p>
                    <p className="text-xs text-black/45">
                      {seguradoraEscolhida ? `${seguradoraEscolhida.nome} · ` : ""}
                      {formatUSD(valorReferenciaUSD)}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-0.5 text-[11px] text-black/40">{descricaoPagamentoEscolhido}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-black/45">
                    Escolha a seguradora e preencha as datas da viagem para ver o valor de referência.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition ${
                  formValido && status !== "enviando"
                    ? "bg-[#2f80c9] hover:bg-[#3b91dc]"
                    : "cursor-not-allowed bg-black/20"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Solicitar Seguro Viagem"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra fechar o
              plano exato com a seguradora escolhida.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ícones de moeda enviados pelo Wilson, 25/set/2026, junto do pedido do
// Câmbio: ¥ (iene, ao lado do campo de quantidade) e R$/€/US$ (moeda de
// pagamento escolhida pelo cliente — ver MOEDAS_TRANSACAO_CAMBIO em
// app/lib/calculadoraCatalogoPublico.ts).
const ICONE_MOEDA_IENE = "/images/icone-moeda-iene.png";

// Pop-up dedicado do Câmbio — mesmo tratamento dado ao JR Pass e ao
// Seguro Viagem em 25/set/2026: saiu do ServicoAvulsoModal pequeno,
// ganhou o próprio componente no padrão de tamanho do modal "Hotéis"
// (max-w-5xl). Pedido do Wilson, 25/set/2026 (mensagem completa
// registrada acima, onde esse componente é usado): template visual igual
// JR Pass/Seguro Viagem, cotação em tempo real por cidade (reaproveitando
// useCambioIene, já usado na Calculadora Reversa), margem pública de 20%
// separada da margem interna, compra e venda de ienes, e pelo menos 3
// moedas de pagamento (Real, Euro, Dólar). Self-checkout no mesmo padrão
// do Seguro Viagem (lead no CRM com tag SELF-SERVICE via
// /api/cambio-selfservice — sem gateway de pagamento real no site).
// Pedido do Wilson, 25/set/2026: "moeda de pagamento é só real" — não
// recebe mais `cambio` (PTAX/USD) como prop porque não converte mais pra
// dólar/euro; só usava isso pra mostrar o total em USD/EUR.
function CambioModal({ onClose }: { onClose: () => void }) {
  const [direcao, setDirecao] = useState<DirecaoCambioIene>("compra");
  const [cidade, setCidade] = useState<CidadeCambioIeneSlug>("sao-paulo");
  const [quantidadeIenes, setQuantidadeIenes] = useState(CAMBIO_IENES_MINIMO_PUBLICO);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Cotação de rua (melhorcambio.com, papel-moeda) na cidade e direção
  // escolhidas — mesma fonte/hook já usado internamente na Calculadora
  // Reversa (app/calculadora_reversa/page.tsx), agora também com a
  // direção "venda". A margem pública (20%) é aplicada aqui, em cima da
  // cotação de rua — nunca mostrada ao cliente (mesma regra do JR Pass e
  // Seguro Viagem: nunca revelar margem/fornecedor em texto público).
  const cambioIene = useCambioIene(cidade, direcao);

  const cotacaoRuaBRLporJPY = cambioIene?.cotacaoBRLPorJPY ?? null;
  const spreadPublico = direcao === "compra" ? SPREAD_CAMBIO_IENE_PUBLICO_COMPRA : SPREAD_CAMBIO_IENE_PUBLICO_VENDA;
  const cotacaoFinalBRLporJPY = cotacaoRuaBRLporJPY !== null ? cotacaoRuaBRLporJPY * spreadPublico : null;
  const valorIenesBRL = cotacaoFinalBRLporJPY !== null ? quantidadeIenes * cotacaoFinalBRLporJPY : null;
  // Taxa de serviço (retirada/entrega em espécie) — mesma referência já
  // usada no card/produto de Câmbio (PRECO_CAMBIO_BRASIL, em
  // CustomPackageCard.tsx), aplicada nas duas direções (a logística de
  // entregar ou recolher o dinheiro em espécie existe nos dois sentidos).
  // Taxa extra de entrega no Aeroporto de Guarulhos — pedido do Wilson,
  // 25/set/2026: "custo de entrega para entrega no aeroporto de
  // guarulhos de R$ 190.00 caso cliente opte por isso" — só entra quando
  // a cidade escolhida é a opção de aeroporto.
  const taxaEntregaAeroporto = cidade === "aeroporto-guarulhos" ? CUSTO_ENTREGA_AEROPORTO_CAMBIO : 0;
  const totalBRL =
    valorIenesBRL !== null ? valorIenesBRL + PRECO_CAMBIO_BRASIL + taxaEntregaAeroporto : null;

  // Pedido do Wilson, 25/set/2026: "moeda de pagamento é só real" — o
  // seletor de moeda (Real/Euro/Dólar) saiu; total sempre em BRL.
  const totalLabel = totalBRL === null ? null : formatBRL(totalBRL);

  const cidadeNome = CIDADES_CAMBIO_IENE.find((c) => c.slug === cidade)?.nome ?? cidade;
  const direcaoLabel = direcao === "compra" ? "Compra de ienes" : "Venda de ienes";

  const descricaoPagamentoEscolhido = descricaoFormaPagamento(formaPagamento, totalBRL, "");

  const formValido =
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeIenes >= CAMBIO_IENES_MINIMO_PUBLICO &&
    totalBRL !== null;

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/cambio-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direcao,
          cidade,
          moedaTransacao: "BRL",
          quantidadeIenes,
          totalBRL,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          email,
          whatsapp,
          observacoes,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar ${
    direcao === "compra" ? "a compra" : "a venda"
  } de ¥${quantidadeIenes.toLocaleString("pt-BR")} pelo site da Ajisai — meu nome é ${nome}.`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cambio-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <p
            id="cambio-modal-title"
            className={`${display.className} text-lg font-medium text-black md:text-xl`}
          >
            Câmbio de Ienes
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Câmbio"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de câmbio
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
                Nossa equipe confirma a cotação final e combina{" "}
                {direcao === "compra" ? "a entrega" : "a devolução"} dos ienes direto com você pelo
                WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Câmbio no Brasil</p>
              <h3
                className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
              >
                Compra e venda de ienes antes e depois da viagem
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
                Retire ienes em espécie antes de embarcar — ou devolva o que sobrou da viagem — sem
                precisar trocar dinheiro no Japão. Cotação em tempo real por cidade, com o pedido já
                pronto pra fechar pelo WhatsApp.
              </p>

              {/* Direção — subtítulo "O que você quer fazer" removido a
                  pedido do Wilson, 25/set/2026 ("remover esse subtitulo,
                  é irrelevante"): os dois cards abaixo já são
                  autoexplicativos. */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDirecao("compra")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      direcao === "compra"
                        ? "border-[#2f80c9] bg-[#2f80c9]/5"
                        : "border-black/10 bg-black/[0.02] hover:border-black/25"
                    }`}
                  >
                    <p className="text-sm font-medium text-black">Comprar ienes</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">
                      Retirar ienes em espécie antes de embarcar.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirecao("venda")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      direcao === "venda"
                        ? "border-[#2f80c9] bg-[#2f80c9]/5"
                        : "border-black/10 bg-black/[0.02] hover:border-black/25"
                    }`}
                  >
                    <p className="text-sm font-medium text-black">Vender ienes</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">
                      Devolver o que sobrou da viagem, trocando de volta por reais, euros ou dólares.
                    </p>
                  </button>
                </div>
              </div>

              {/* Cidade */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Cidade de retirada
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {CIDADES_CAMBIO_IENE.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setCidade(c.slug)}
                      className={`rounded-full border px-4 py-2 text-xs transition ${
                        cidade === c.slug
                          ? "border-[#2f80c9] bg-[#2f80c9]/10 text-[#1c6ea8]"
                          : "border-black/15 text-black/60 hover:border-black/30"
                      }`}
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade — seletor de moeda de pagamento (Real/Euro/
                  Dólar) removido a pedido do Wilson, 25/set/2026: "moeda
                  de pagamento é só real". */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Quantidade de ienes
                </p>
                <div className="mt-4 flex max-w-xs items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ICONE_MOEDA_IENE} alt="" className="h-9 w-9 shrink-0 object-contain" />
                  <input
                    type="number"
                    min={CAMBIO_IENES_MINIMO_PUBLICO}
                    step={10000}
                    value={quantidadeIenes}
                    onChange={(e) => setQuantidadeIenes(Number(e.target.value) || 0)}
                    onBlur={() => setQuantidadeIenes((v) => Math.max(CAMBIO_IENES_MINIMO_PUBLICO, v))}
                    className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-[11px] leading-5 text-black/40">
                  Mínimo de ¥{CAMBIO_IENES_MINIMO_PUBLICO.toLocaleString("pt-BR")}.
                </p>
              </div>

              {/* Resumo de preço */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Valor estimado — {direcaoLabel.toLowerCase()}
                </p>
                {totalLabel ? (
                  <>
                    <p className={`${display.className} mt-1 text-3xl font-medium text-black`}>
                      {totalLabel}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-black/40">
                      ¥{quantidadeIenes.toLocaleString("pt-BR")} em {cidadeNome}, já com taxas
                      incluídas
                      {taxaEntregaAeroporto > 0 && ` (inclui taxa de entrega no aeroporto de ${formatBRL(taxaEntregaAeroporto)})`}
                      .
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-black/50">Carregando cotação do dia…</p>
                )}
              </div>

              {/* Dados de contato */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Seus dados</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Nome completo
                    </span>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">E-mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">WhatsApp</span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </label>
                </div>
                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                    Observações (opcional)
                  </span>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    placeholder="Data prevista de retirada, preferência de local, etc."
                    className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                  />
                </label>
              </div>

              <FormasPagamento
                totalBRL={totalBRL}
                dataViagem=""
                formaPagamento={formaPagamento}
                onEscolher={setFormaPagamento}
                somenteAVista
                // Pedido do Wilson, 25/set/2026: "metodo de pagamento é só
                // pix e ted" — sem cartão de crédito no Câmbio.
                metodos={["pix", "ted"]}
              />

              <p className="mt-6 text-[11px] leading-5 text-black/35">
                Fonte da cotação: melhorcambio.com (papel-moeda, {cidadeNome}). Cotação sujeita a
                variação até a confirmação do pedido.
              </p>

              {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </>
          )}
        </div>

        {status !== "enviado" && (
          <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div>
                {totalLabel ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">Sua escolha</p>
                    <p className={`${display.className} text-xl font-medium text-[#2f80c9] sm:text-2xl`}>
                      {totalLabel}
                    </p>
                    <p className="text-xs text-black/45">
                      {direcaoLabel} · ¥{quantidadeIenes.toLocaleString("pt-BR")} · {cidadeNome}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-0.5 text-[11px] text-black/40">{descricaoPagamentoEscolhido}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-black/45">
                    Escolha a cidade e a quantidade de ienes para ver o valor.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition ${
                  formValido && status !== "enviando"
                    ? "bg-[#2f80c9] hover:bg-[#3b91dc]"
                    : "cursor-not-allowed bg-black/20"
                }`}
              >
                {status === "enviando"
                  ? "Enviando…"
                  : direcao === "compra"
                    ? "Solicitar Compra de Ienes"
                    : "Solicitar Venda de Ienes"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra
              fechar {direcao === "compra" ? "a entrega" : "a devolução"} dos ienes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Popup leve pra um serviço avulso simples (Ajisai Shopping) — mesmo
// padrão visual do popup de Hotéis, sem iframe, já que esses serviços não
// têm (e não precisam de) página própria. Pedido do Wilson, 16/set/2026:
// "JR Pass, Cambio e Seguro Viagem retirar do serviços avulsos, devem
// virar cards principais [...] seguir mesmo template de layout". JR
// Pass, Seguro Viagem e Câmbio saíram daqui em 25/set/2026 — ganharam
// componente próprio (JrPassModal, SeguroViagemModal, CambioModal),
// maiores e mais detalhados.
function ServicoAvulsoModal({
  titulo,
  descricao,
  precoLabel,
  precoBRLLabel,
  notaPreco,
  cambio,
  onClose,
}: {
  titulo: string;
  descricao: string;
  precoLabel: string;
  /** "ou R$ X" — null quando o preço já nasce em reais (não precisa de
   * uma segunda linha convertida). */
  precoBRLLabel?: string | null;
  notaPreco?: string;
  cambio: Cambio | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="servico-avulso-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-black/10 bg-white p-6 shadow-2xl sm:rounded-3xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Fechar ${titulo}`}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"
        >
          ×
        </button>

        <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Serviço adicional</p>
        <h3
          id="servico-avulso-modal-title"
          className={`${display.className} mt-2 text-2xl font-medium text-black md:text-3xl`}
        >
          {titulo}
        </h3>
        <p className="mt-3 text-sm font-light leading-6 text-black/60">{descricao}</p>

        <div className="mt-6 border-t border-black/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">A partir de</p>
          <p className={`${display.className} mt-1 text-3xl font-medium text-black`}>
            {precoLabel}
          </p>
          {precoBRLLabel && (
            <p className="mt-1 text-sm font-medium text-black/50">ou {precoBRLLabel}</p>
          )}
          {notaPreco && <p className="mt-1.5 text-[11px] text-black/40">{notaPreco}</p>}
          <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/35" />
        </div>

        <ContactCTA
          mode="single"
          channel="whatsapp"
          whatsappNumber={WHATSAPP_NUMBER}
          brand="Ajisai"
          label={`Falar sobre ${titulo}`}
          buttonClassName="mt-7 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
          packageOptions={[titulo]}
          defaultPackage={titulo}
        />
      </div>
    </div>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.56.87l10.99-6.86a1 1 0 0 0 0-1.7L9.56 4.27A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

// Vídeo real de demonstração — player nativo com poster, sem autoplay
// (carrega só metadata até o clique, pra não pesar a página).
function DemoVideo({
  src,
  poster,
  label,
  descricao,
}: {
  src: string;
  poster: string;
  label: string;
  descricao?: string;
}) {
  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black">
        <video
          controls
          preload="metadata"
          poster={poster}
          playsInline
          className="h-full w-full bg-black object-contain fullscreen:h-screen fullscreen:w-screen fullscreen:object-contain"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">
        {label}
      </p>
      {descricao && (
        <p className="mx-auto mt-1 max-w-xs text-center text-xs leading-5 text-black/50">
          {descricao}
        </p>
      )}
    </div>
  );
}

// Placeholder de vídeo — sem player/arquivo real ainda. Troque o miolo por
// um <video>/embed quando o material estiver pronto; mantém o mesmo espaço
// e legenda pra não quebrar o layout.
function VideoPlaceholder({
  titulo,
  descricao,
  className = "",
}: {
  titulo: string;
  descricao?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-black/25 bg-black/10 backdrop-blur transition group-hover:scale-105 group-hover:bg-black/20">
          <IconPlay className="h-5 w-5 translate-x-0.5 text-black" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
          Vídeo em breve
        </p>
        <p className={`${display.className} max-w-xs text-base font-medium text-black md:text-lg`}>
          {titulo}
        </p>
        {descricao && (
          <p className="max-w-sm text-xs leading-5 text-black/50">{descricao}</p>
        )}
      </div>
    </div>
  );
}
