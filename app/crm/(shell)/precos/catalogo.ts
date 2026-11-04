// Rótulos, grupos e unidades dos parâmetros de preço para a tela /crm/precos
// (só servidor). Os valores padrão NÃO ficam aqui: vêm do próprio código,
// via P(id, padrão) — ver app/lib/parametrosPreco.ts.
import "@/app/lib/parametrosPreco.todos";
import { padroesRegistrados } from "@/app/lib/parametrosPreco";
import { ROTAS_MOTORISTA, VEICULOS_MOTORISTA } from "@/app/lib/motoristaPrivadoRotas";
import { TABELA_CONSULADOS_BASE } from "@/app/documentacao/conteudo";
import { TEMPORADAS } from "@/app/lib/calculadoraCatalogoPublico";

/** mult = multiplicador (1,30 = +30%); fracao = guardado 0,2 e mostrado 20%;
 * pct = guardado e mostrado em % (50 = 50%). */
export type UnidadeParametro = "mult" | "fracao" | "pct" | "BRL" | "USD" | "JPY" | "num";
/** Como o custo vira preço de venda (para a prévia "venda ≈"). */
export type Aplica = "padrao" | "motorista" | "transfer" | "jrpass" | "guiaBr" | "guiaEstr" | "limousine" | "imposto";

export type DescricaoParametro = {
  grupo: string;
  secao: string;
  rotulo: string;
  /** Quando presente, a seção vira tabela (linhas = rótulo, colunas = coluna). */
  coluna?: string;
  unidade: UnidadeParametro;
  aplica?: Aplica;
  nota?: string;
};

// Menu da tela /crm/precos (Wilson, 04/nov/2026: "separe os produtos num
// menu mais fácil de entender"): um item por produto, agrupado por unidade.
// Cada parâmetro cai no produto que ele afeta (produtoDe, abaixo) — a margem
// própria de cada produto fica no próprio produto; "Margens e impostos" só
// tem o que vale para o site inteiro.
export type CategoriaId = "geral" | "agencia" | "cambio" | "seguro" | "documentacao" | "empregos";
export const CATEGORIAS: { id: CategoriaId; nome: string; cor: string }[] = [
  { id: "geral", nome: "Base do site", cor: "#20252B" },
  { id: "agencia", nome: "Viagens — Agência", cor: "#24476B" },
  { id: "cambio", nome: "Câmbio", cor: "#9A6B12" },
  { id: "seguro", nome: "Seguro viagem & eSIM", cor: "#75608B" },
  { id: "documentacao", nome: "Documentação", cor: "#8A5A3C" },
  { id: "empregos", nome: "Empregos", cor: "#27675B" },
];

export const PRODUTOS = [
  { id: "margens", categoria: "geral", nome: "Margens e impostos", icone: "svg:percent", onde: "Vale para todos os itens marcados com “margem padrão”.", descricao: "Imposto e margem padrão do site: preço de venda = custo × imposto × margem." },
  { id: "pagamento", categoria: "geral", nome: "Parcelamento", icone: "/images/icone-cartao-credito.png", onde: "Viagem Personalizada e Calculadora Reversa.", descricao: "Taxas do cartão e do Pix parcelado usadas na simulação de pagamento." },
  { id: "roteiro", categoria: "agencia", nome: "Roteiro Personalizado", icone: "/images/produtos/roteiro-personalizado.png", onde: "/produtos/roteiro-personalizado, /ajisairoteiros, Viagem Personalizada e Calculadora Reversa.", descricao: "Preço do roteiro até 15 dias, dia extra e taxa de grupo do roteiro avulso." },
  { id: "viagemPersonalizada", categoria: "agencia", nome: "Viagem Personalizada", icone: "/images/produtos/viagem-personalizada-icone-v2.png", onde: "Simulador /viagem_personalizada_selfservice e Calculadora Reversa.", descricao: "Taxa de grupo, extensões internacionais e ritmo do viajante." },
  { id: "pacotes", categoria: "agencia", nome: "Pacotes prontos", icone: "/images/produtos/pacote-de-viagem.png", onde: "/pacotes e “a partir de” em /produtos.", descricao: "Preço final dos pacotes Caravana e Individual." },
  { id: "hotel", categoria: "agencia", nome: "Hotéis", icone: "/images/produtos/hoteis.png", onde: "Viagem Personalizada, Calculadora Reversa e /produtos/hoteis.", descricao: "Diária por categoria, café da manhã, tipo de quarto, cidade e temporada." },
  { id: "aereo", categoria: "agencia", nome: "Passagem aérea", icone: "/images/produtos/passagem-aerea.png", onde: "Viagem Personalizada, Calculadora Reversa e /produtos/passagens-aereas.", descricao: "Aéreo internacional por classe." },
  { id: "transporte", categoria: "agencia", nome: "Transporte Privado", icone: "/images/produtos/transporte-privado.png", onde: "/produtos/transporte-privado, Viagem Personalizada e Calculadora Reversa.", descricao: "Motorista à disposição, tours de 10 h e rotas dentro da cidade." },
  { id: "transfer", categoria: "agencia", nome: "Transfer Aeroporto", icone: "/images/icone-transfer-aeroporto.png", onde: "/produtos/transfer-aeroporto e calculadoras.", descricao: "Rotas aeroporto ↔ hotel por veículo." },
  { id: "guia", categoria: "agencia", nome: "Guia Turístico", icone: "/images/produtos/guia-turistico.png", onde: "/produtos/guia-turistico, Viagem Personalizada e Calculadora Reversa.", descricao: "Guia brasileiro e estrangeiro." },
  { id: "jrpass", categoria: "agencia", nome: "JR Pass", icone: "/images/icone-trem-bala-shinkansen.png", onde: "/produtos/jrpass e calculadoras.", descricao: "Custo do passe, margem, dólar turismo e frete SEDEX do voucher." },
  { id: "ingressos", categoria: "agencia", nome: "Ingressos", icone: "/images/icone-ingressos.png", onde: "Viagem Personalizada e Calculadora Reversa.", descricao: "Disney, Universal, Express Pass e teamLab." },
  { id: "servicos", categoria: "agencia", nome: "Restaurantes e serviços", icone: "/images/icone-servico-restaurantes-highend.png", onde: "/produtos/reserva-restaurantes, Viagem Personalizada e Calculadora Reversa.", descricao: "Reservas de restaurantes, concierge, malas e experiências." },
  { id: "shopping", categoria: "agencia", nome: "Ajisai Shopping", icone: "/images/icone-servico-ajisai-shopping.png", onde: "/produtos/ajisai-shopping e Calculadora Reversa.", descricao: "Comissão sobre as compras acompanhadas." },
  { id: "limousine", categoria: "agencia", nome: "Limousine Bus", icone: "/images/icone-onibus-v2.png", onde: "Serviços adicionais (self-checkout).", descricao: "Ônibus aeroporto ↔ Tóquio." },
  { id: "cambio", categoria: "cambio", nome: "Câmbio de ienes", icone: "/images/icone-cambio-dinheiro.png", onde: "/produtos/cambio, Viagem Personalizada e Calculadora Reversa.", descricao: "Spread sobre a cotação, taxa de entrega e pedido mínimo." },
  { id: "seguro", categoria: "seguro", nome: "Seguro viagem", icone: "/images/icone-seguro-viagem-v2.png", onde: "/produtos/seguro-viagem (parceiro) e calculadoras.", descricao: "Margens do seguro do parceiro e diária do seguro das calculadoras." },
  { id: "esim", categoria: "seguro", nome: "eSIM e Wi-fi", icone: "/images/icone-esim-v2.png", onde: "Viagem Personalizada e Calculadora Reversa.", descricao: "Conectividade dentro do pacote. O eSIM avulso usa o custo da Simpremium × margem padrão." },
  { id: "documentacao", categoria: "documentacao", nome: "Visto e COE", icone: "/images/icone-documentacao-visto.png", onde: "/documentacao (visto específico e Certificado de Elegibilidade).", descricao: "Valores do parceiro por consulado e adicional Ajisai por pessoa." },
  { id: "empregos", categoria: "empregos", nome: "Financiamento de candidatos", icone: "/images/icone-crm-empregos.png", onde: "Proposta de financiamento em /empregos.", descricao: "Visto, certificado, passagem e cesta de serviços." },
] as const satisfies readonly { id: string; categoria: CategoriaId; nome: string; icone: string; onde: string; descricao: string }[];
export type GrupoId = (typeof PRODUTOS)[number]["id"];

/** Produto (item do menu) de cada parâmetro. */
function produtoDe(id: string, rotaTransfer: boolean): GrupoId {
  if (id.startsWith("motorista.rota.")) return rotaTransfer ? "transfer" : "transporte";
  const regras: [RegExp, GrupoId][] = [
    [/^geral\./, "margens"],
    [/^pagamento\./, "pagamento"],
    [/^roteiro\./, "roteiro"],
    [/^(perfil|extensao|grupo)\./, "viagemPersonalizada"],
    [/^pacotes\./, "pacotes"],
    [/^hotel\./, "hotel"],
    [/^aereo\./, "aereo"],
    [/^(motorista|transporte)\./, "transporte"],
    [/^transfer\./, "transfer"],
    [/^guia\./, "guia"],
    [/^(jrpass|frete)\.|^cambio\.spreadDolarTurismo$/, "jrpass"],
    [/^ingressos\./, "ingressos"],
    [/^servicos\./, "servicos"],
    [/^shopping\./, "shopping"],
    [/^limousine\./, "limousine"],
    [/^cambio\./, "cambio"],
    [/^seguro(Parceiro)?\./, "seguro"],
    [/^conectividade\./, "esim"],
    [/^doc\./, "documentacao"],
    [/^empregos\./, "empregos"],
  ];
  return regras.find(([r]) => r.test(id))?.[1] ?? "margens";
}

const CIDADES: Record<string, string> = {
  tokyo: "Tokyo", kyoto: "Kyoto", osaka: "Osaka", hokkaido: "Hokkaido (Sapporo)", okinawa: "Okinawa", hiroshima: "Hiroshima", nara: "Nara", hakone: "Hakone", nikko: "Nikko", kanazawa: "Kanazawa", takayama: "Takayama", kamakura: "Kamakura", nagoya: "Nagoya", fukuoka: "Fukuoka", kobe: "Kobe", yokohama: "Yokohama", miyajima: "Miyajima", nagano: "Nagano", ishigaki: "Ishigaki", yakushima: "Yakushima", fuji: "Fuji / Kawaguchiko", motegi: "Motegi", suzuka: "Suzuka", koyasan: "Koyasan", kamikochi: "Kamikochi", kinosaki: "Kinosaki Onsen", kusatsu: "Kusatsu Onsen", niseko: "Niseko", hakuba: "Hakuba", nozawa: "Nozawa Onsen",
};
const PERFIS: Record<string, string> = { cadenciado: "Cadenciado", equilibrado: "Equilibrado", acelerado: "Acelerado" };
const CATEGORIAS_RITMO: Record<string, string> = { ingressos: "Ingressos", transporteUrbano: "Transporte urbano", experienciasReservas: "Experiências e reservas", complexidadeOperacional: "Complexidade operacional" };

type Fixo = Omit<DescricaoParametro, "grupo" | "secao"> & { grupo: string; secao?: string };
const FIXOS: Record<string, Fixo> = {
  // Margens
  "geral.imposto": { grupo: "margens", secao: "Padrão do site", rotulo: "Imposto sobre o lucro", unidade: "mult", nota: "Lucro Presumido — 1,15 = +15%. Entra antes da margem." },
  "geral.margemPadrao": { grupo: "margens", secao: "Padrão do site", rotulo: "Margem padrão (sobre o valor com imposto)", unidade: "mult", nota: "Preço = custo × imposto × margem. Também calibra o Perfil do viajante." },
  "motorista.margem": { grupo: "margens", secao: "Margem", rotulo: "Motorista privado e tours", unidade: "mult" },
  "transfer.margem": { grupo: "margens", secao: "Margem", rotulo: "Transfer aeroporto ↔ hotel", unidade: "mult" },
  "jrpass.margem": { grupo: "margens", secao: "Margem", rotulo: "JR Pass", unidade: "mult" },
  "guia.margemBrasileiro": { grupo: "margens", secao: "Margem", rotulo: "Guia brasileiro", unidade: "mult" },
  "limousine.margem": { grupo: "margens", secao: "Margem", rotulo: "Limousine Bus", unidade: "mult" },
  "shopping.comissao": { grupo: "margens", secao: "Margem", rotulo: "Ajisai Shopping — comissão sobre compras", unidade: "fracao" },
  "cambio.spreadIeneCompra": { grupo: "margens", secao: "Spread sobre a cotação", rotulo: "Iene — venda ao cliente (página Câmbio)", unidade: "mult", nota: "Cotação de rua × este fator." },
  "cambio.spreadIeneVenda": { grupo: "margens", secao: "Spread sobre a cotação", rotulo: "Iene — compra do cliente (página Câmbio)", unidade: "mult", nota: "Cotação de rua × este fator (abaixo de 1)." },
  "cambio.fatorIeneCalculadoras": { grupo: "margens", secao: "Spread sobre a cotação", rotulo: "Iene — Viagem Personalizada e Calculadora Reversa", unidade: "mult" },
  "cambio.spreadDolarTurismo": { grupo: "margens", secao: "Dólar turismo (cotação usada no JR Pass)", rotulo: "Dólar turismo (JR Pass)", unidade: "mult" },
  "seguroParceiro.margemAte60": { grupo: "margens", secao: "Seguro viagem do parceiro (venda online)", rotulo: "Margem até 60 anos", unidade: "pct", nota: "Nunca passa do preço de balcão do plano." },
  "seguroParceiro.margem80": { grupo: "margens", secao: "Seguro viagem do parceiro (venda online)", rotulo: "Margem aos 80 anos (sobe em linha reta a partir dos 61)", unidade: "pct" },
  "seguroParceiro.margemCanalDireto": { grupo: "margens", secao: "Seguro viagem do parceiro (venda online)", rotulo: "Margem do canal direto (/seguro-viagem/direto)", unidade: "pct" },
  // Hotel
  "transporte.diariaCusto": { grupo: "transporte", secao: "Diárias e adicionais", rotulo: "Transporte privado durante o roteiro — diária (custo)", unidade: "BRL", aplica: "padrao" },
  "motorista.diariaCustoUSD": { grupo: "transporte", secao: "Diárias e adicionais", rotulo: "Motorista à disposição — diária até 4 pessoas (custo)", unidade: "USD", aplica: "motorista" },
  "motorista.meetGreetCustoUSD": { grupo: "transporte", secao: "Diárias e adicionais", rotulo: "Adicional meet & greet (custo)", unidade: "USD", aplica: "motorista" },
  "motorista.cadeirinhaCustoUSD": { grupo: "transporte", secao: "Diárias e adicionais", rotulo: "Adicional cadeirinha (custo)", unidade: "USD", aplica: "motorista" },
  // Aéreo
  "aereo.economyCustoBRL": { grupo: "aereo", secao: "Aéreo internacional (por pessoa)", rotulo: "Economy (custo)", unidade: "BRL", aplica: "padrao" },
  "aereo.premiumEconomyCustoUSD": { grupo: "aereo", secao: "Aéreo internacional (por pessoa)", rotulo: "Premium Economy (custo)", unidade: "USD", aplica: "padrao" },
  "aereo.businessCustoUSD": { grupo: "aereo", secao: "Aéreo internacional (por pessoa)", rotulo: "Business (custo)", unidade: "USD", aplica: "padrao" },
  "aereo.firstCustoUSD": { grupo: "aereo", secao: "Aéreo internacional (por pessoa)", rotulo: "First Class (custo — só imposto, sem margem)", unidade: "USD", aplica: "imposto" },
  "extensao.vooToquioSeoulUSD": { grupo: "aereo", secao: "Extensões — deslocamentos (por pessoa)", rotulo: "Voo Tóquio → Seoul (custo)", unidade: "USD", aplica: "padrao" },
  "extensao.vooToquioPequimUSD": { grupo: "aereo", secao: "Extensões — deslocamentos (por pessoa)", rotulo: "Voo Tóquio → Pequim (custo)", unidade: "USD", aplica: "padrao" },
  "extensao.tremPequimXangaiUSD": { grupo: "aereo", secao: "Extensões — deslocamentos (por pessoa)", rotulo: "Trem-bala Pequim → Xangai (custo)", unidade: "USD", aplica: "padrao" },
  // Guia
  "guia.brasileiroCustoUSD": { grupo: "guia", secao: "Diárias", rotulo: "Guia brasileiro — diária (custo)", unidade: "USD", aplica: "guiaBr" },
  "guia.estrangeiroCustoJPY": { grupo: "guia", secao: "Diárias", rotulo: "Guia estrangeiro — diária (custo HK Tourist)", unidade: "JPY", aplica: "guiaEstr" },
  "guia.gorjetaUSD": { grupo: "guia", secao: "Diárias", rotulo: "Gorjeta por pessoa/dia (repasse, sem margem)", unidade: "USD" },
  "guia.adicionalFujiUSD": { grupo: "guia", secao: "Diárias", rotulo: "Adicional Monte Fuji por guia/dia (valor final)", unidade: "USD" },
  "geral.jpyPorUsdReferencia": { grupo: "guia", secao: "Cotação de referência", rotulo: "Iene por dólar (¥/US$) — usada no guia estrangeiro e na Limousine", unidade: "num" },
  // Roteiro
  "roteiro.baseCusto": { grupo: "roteiro", secao: "Preço do roteiro", rotulo: "Roteiro Personalizado — até 15 dias (custo)", unidade: "BRL", aplica: "padrao" },
  "roteiro.diaExtraCusto": { grupo: "roteiro", secao: "Preço do roteiro", rotulo: "Roteiro Personalizado — por dia extra (custo)", unidade: "BRL", aplica: "padrao" },
  "roteiro.taxaUSDCada2Pessoas": { grupo: "roteiro", secao: "Preço do roteiro", rotulo: "Roteiro avulso — taxa a cada 2 pessoas acima de 3 (valor final)", unidade: "USD" },
  "grupo.taxaPassageiroExtraCusto": { grupo: "roteiro", secao: "Taxa de grupo", rotulo: "Pacote — taxa por passageiro acima de 3 (custo)", unidade: "BRL", aplica: "padrao" },
  // Ingressos
  "ingressos.disneyUniversal": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "Disney/Universal — ingresso avulso (Viagem Personalizada)", unidade: "USD", aplica: "padrao" },
  "ingressos.disneyland": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "Tokyo Disneyland", unidade: "USD", aplica: "padrao" },
  "ingressos.disneysea": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "Tokyo DisneySea", unidade: "USD", aplica: "padrao" },
  "ingressos.disneyPremierAccess": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "Disney Premier Access — por atração", unidade: "USD", aplica: "padrao" },
  "ingressos.usj": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "Universal Studios Japan", unidade: "USD", aplica: "padrao" },
  "ingressos.usjExpress4": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "USJ Express Pass 4", unidade: "USD", aplica: "padrao" },
  "ingressos.usjExpress5": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "USJ Express Pass 5", unidade: "USD", aplica: "padrao" },
  "ingressos.usjExpress7": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "USJ Express Pass 7", unidade: "USD", aplica: "padrao" },
  "ingressos.usjExpress8": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "USJ Express Pass 8", unidade: "USD", aplica: "padrao" },
  "ingressos.usjExpressPremium": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "USJ Express Pass Premium", unidade: "USD", aplica: "padrao" },
  "ingressos.teamlabTokyo": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "teamLab Tokyo", unidade: "USD", aplica: "padrao" },
  "ingressos.teamlabKyoto": { grupo: "ingressos", secao: "Custo por pessoa", rotulo: "teamLab Kyoto", unidade: "USD", aplica: "padrao" },
  // Serviços
  "servicos.malaIntermunicipal": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Envio de mala entre cidades (custo)", unidade: "USD", aplica: "padrao" },
  "servicos.restaurantesHighEnd": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Pacote de restaurantes high-end (custo)", unidade: "USD", aplica: "padrao" },
  "servicos.reservaRestaurante": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Reserva de restaurante — por reserva (custo)", unidade: "USD", aplica: "padrao" },
  "servicos.transferOnibus": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Transfer de ônibus — por pessoa (custo)", unidade: "USD", aplica: "padrao" },
  "servicos.experienciaSobMedida": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Experiência sob medida (custo)", unidade: "USD", aplica: "padrao" },
  "servicos.concierge": { grupo: "servicos", secao: "Serviços do calculador", rotulo: "Concierge — diária (custo)", unidade: "USD", aplica: "padrao" },
  "conectividade.wifiCustoUSD": { grupo: "servicos", secao: "Conectividade (calculadoras)", rotulo: "Wi-fi/eSIM do pacote — por pessoa/dia (custo)", unidade: "USD", aplica: "padrao" },
  "conectividade.esimCustoUSD": { grupo: "servicos", secao: "Conectividade (calculadoras)", rotulo: "eSIM da Calculadora Reversa — por pessoa/dia (custo)", unidade: "USD", aplica: "padrao", nota: "O eSIM avulso de /produtos usa o preço da Simpremium × margem padrão." },
  "limousine.tarifaJPY.narita": { grupo: "servicos", secao: "Limousine Bus (tarifa adulto por trecho)", rotulo: "Narita", unidade: "JPY", aplica: "limousine" },
  "limousine.tarifaJPY.haneda": { grupo: "servicos", secao: "Limousine Bus (tarifa adulto por trecho)", rotulo: "Haneda", unidade: "JPY", aplica: "limousine" },
  // Câmbio
  "cambio.taxaServicoCusto": { grupo: "cambio", secao: "Taxas e pedido mínimo", rotulo: "Taxa de serviço/entrega dos ienes (custo)", unidade: "BRL", aplica: "padrao" },
  "cambio.entregaAeroporto": { grupo: "cambio", secao: "Taxas e pedido mínimo", rotulo: "Entrega no Aeroporto de Guarulhos (valor final)", unidade: "BRL" },
  "cambio.minimoIenes": { grupo: "cambio", secao: "Taxas e pedido mínimo", rotulo: "Pedido mínimo (ienes)", unidade: "JPY" },
  "cambio.minimoIenesAeroporto": { grupo: "cambio", secao: "Taxas e pedido mínimo", rotulo: "Pedido mínimo com entrega/retirada no aeroporto (ienes)", unidade: "JPY" },
  // Seguro
  "seguro.diariaCusto": { grupo: "seguro", secao: "Seguro das calculadoras", rotulo: "Diária por pessoa até 60 anos (custo)", unidade: "BRL", aplica: "padrao" },
  "seguro.multidestino": { grupo: "seguro", secao: "Seguro das calculadoras", rotulo: "Ajuste para roteiro com outro país (multidestino)", unidade: "mult" },
  // Pagamento
  "pagamento.taxaMaquinaCartao": { grupo: "pagamento", secao: "Cartão de crédito", rotulo: "Taxa da maquininha (sobre o valor financiado)", unidade: "fracao" },
  "pagamento.jurosCartaoMes": { grupo: "pagamento", secao: "Cartão de crédito", rotulo: "Juros do cartão ao mês", unidade: "fracao" },
  "pagamento.entradaPix": { grupo: "pagamento", secao: "Pix parcelado", rotulo: "Entrada no Pix parcelado", unidade: "fracao" },
  "pagamento.jurosPixMes": { grupo: "pagamento", secao: "Pix parcelado", rotulo: "Juros do Pix parcelado ao mês", unidade: "fracao" },
  // Perfil
  "perfil.feePorCidadeAdicional": { grupo: "perfil", secao: "Outros", rotulo: "Fee de planejamento — acréscimo por cidade além da primeira", unidade: "fracao" },
  "perfil.contingencia": { grupo: "perfil", secao: "Outros", rotulo: "Contingência sobre o custo", unidade: "fracao" },
  "perfil.taxaServico": { grupo: "perfil", secao: "Outros", rotulo: "Taxa de serviço", unidade: "fracao" },
  // Documentação
  "doc.adicionalBRLPessoa": { grupo: "documentacao", secao: "Adicional Ajisai por pessoa", rotulo: "Visto — adicional por pessoa", unidade: "BRL" },
  "doc.adicionalJPYPessoa": { grupo: "documentacao", secao: "Adicional Ajisai por pessoa", rotulo: "COE — adicional por pessoa", unidade: "JPY" },
  "doc.coe.descendente": { grupo: "documentacao", secao: "Certificado de Elegibilidade (valor do parceiro)", rotulo: "Individual — descendente", unidade: "JPY" },
  "doc.coe.conjuge": { grupo: "documentacao", secao: "Certificado de Elegibilidade (valor do parceiro)", rotulo: "Individual — cônjuge", unidade: "JPY" },
  // Empregos
  "empregos.vistoBRL": { grupo: "empregos", secao: "Valores por pessoa", rotulo: "Serviço do visto — por pessoa", unidade: "BRL" },
  "empregos.certificadoJPY": { grupo: "empregos", secao: "Valores por pessoa", rotulo: "Certificado de Elegibilidade — por pessoa", unidade: "JPY" },
  "empregos.passagemJPY": { grupo: "empregos", secao: "Valores por pessoa", rotulo: "Passagem aérea — por pessoa", unidade: "JPY" },
  "empregos.adicionalNorteNordesteJPY": { grupo: "empregos", secao: "Valores por pessoa", rotulo: "Adicional aeroporto Norte/Nordeste — por pessoa", unidade: "JPY" },
  "empregos.cestaExtrasJPY": { grupo: "empregos", secao: "Valores por pessoa", rotulo: "Cesta de serviços extras (valor fixo)", unidade: "JPY" },
};

const FRETE: Record<string, string> = { spCapital: "São Paulo capital e Grande SP", spInterior: "Interior de São Paulo", sudeste: "RJ, MG, ES e PR", sul: "SC e RS", centroOeste: "DF, GO e MS", centroNorte: "MT e TO", nordeste: "Nordeste", norte: "Norte" };
const PACOTES: Record<string, string> = { caravanaCerejeiras: "Caravana — Cerejeiras 2027", caravanaMaio: "Caravana — Maio 2027", individualCerejeiras: "Individual — Cerejeiras 2027", individualMaio: "Individual — Maio 2027" };
const SEGURO_IDADE: Record<string, string> = { ate60: "Até 60 anos", ate65: "61 a 65", ate70: "66 a 70", ate75: "71 a 75", ate80: "76 a 80", ate82: "81 a 82" };
const QUARTO: Record<string, string> = { Individual: "Individual", "Duplo (casal)": "Duplo (casal)", "Duplo (compartilhado)": "Duplo (compartilhado)", Triplo: "Triplo" };
const EXT_CIDADE: Record<string, string> = { seoul: "Seoul", beijing: "Pequim", shanghai: "Xangai" };
const FLEX: Record<string, string> = { fixas: "Datas fixas", tres: "± 3 dias", sete: "± 7 dias", flexivel: "Flexível" };

/** Descrição de um parâmetro (null = sem rótulo — aparece em "Outros"). */
function descreverBase(id: string): DescricaoParametro | null {
  const f = FIXOS[id];
  if (f) return { ...f, secao: f.secao ?? "" };
  let m: RegExpExecArray | null;
  if ((m = /^hotel\.diariaCusto\.(.+)$/.exec(id))) return { grupo: "hotel", secao: "Diária e café da manhã (custo, room only)", rotulo: m[1], coluna: "Diária do quarto", unidade: "BRL", aplica: "padrao" };
  if ((m = /^hotel\.cafeCusto\.(.+)$/.exec(id))) return { grupo: "hotel", secao: "Diária e café da manhã (custo, room only)", rotulo: m[1], coluna: "Café por pessoa/dia", unidade: "BRL", aplica: "padrao" };
  if ((m = /^hotel\.fatorQuarto\.(.+)$/.exec(id))) return { grupo: "hotel", secao: "Fator por tipo de quarto (por pessoa)", rotulo: QUARTO[m[1]] ?? m[1], unidade: "mult" };
  if ((m = /^hotel\.cidade\.(.+)$/.exec(id))) return { grupo: "hotel", secao: "Multiplicador por cidade", rotulo: CIDADES[m[1]] ?? m[1], unidade: "mult" };
  if ((m = /^hotel\.temporada\.([^.]+)\.(.+)$/.exec(id))) {
    const t = TEMPORADAS.find((x) => x.key === m![2]);
    return { grupo: "hotel", secao: "Multiplicador por temporada (cidades pesquisadas)", rotulo: CIDADES[m[1]] ?? m[1], coluna: t?.nome ?? m[2], unidade: "mult" };
  }
  if ((m = /^extensao\.hotel\.([^.]+)\.(\d)estrelas$/.exec(id))) return { grupo: "aereo", secao: "Extensões — diária de hotel (custo)", rotulo: EXT_CIDADE[m[1]] ?? m[1], coluna: `${m[2]} estrelas`, unidade: "USD", aplica: "padrao" };
  if ((m = /^aereo\.economiaFlexibilidade\.(.+)$/.exec(id))) return { grupo: "aereo", secao: "Economia estimada com datas flexíveis (nota da Calculadora Reversa)", rotulo: FLEX[m[1]] ?? m[1], unidade: "fracao" };
  if ((m = /^jrpass\.(custoUSD|custoGreenUSD)\.(\d+)$/.exec(id))) return { grupo: "jrpass", secao: "Custo do passe", rotulo: `${m[2]} dias`, coluna: m[1] === "custoUSD" ? "Ordinary" : "Green", unidade: "USD", aplica: "jrpass" };
  if ((m = /^motorista\.rota\.(.+)\.(preco|overtime)\.([^.]+)$/.exec(id))) {
    const rota = ROTAS_MOTORISTA.find((r) => r.id === m![1]);
    const veiculo = VEICULOS_MOTORISTA.find((v) => v.id === m![3]);
    return {
      grupo: "rotas",
      secao: rota ? rota.nome : m[1],
      rotulo: veiculo ? veiculo.nome : m[3],
      coluna: m[2] === "preco" ? "Serviço (custo)" : "Hora extra / 30 min (custo)",
      unidade: "USD",
      aplica: rota?.categoria === "transfer-aeroporto" ? "transfer" : "motorista",
    };
  }
  if ((m = /^seguro\.idade\.(.+)$/.exec(id))) return { grupo: "seguro", secao: "Seguro das calculadoras — multiplicador por faixa etária", rotulo: SEGURO_IDADE[m[1]] ?? m[1], unidade: "mult" };
  if ((m = /^perfil\.(travelPaceIndex|atracoesPorDia|feePlanejamento)\.(.+)$/.exec(id))) {
    const nome = { travelPaceIndex: "Índice de ritmo (travel pace)", atracoesPorDia: "Atrações por dia ativo", feePlanejamento: "Fator do fee de planejamento" }[m[1]]!;
    return { grupo: "perfil", secao: "Por perfil", rotulo: nome, coluna: PERFIS[m[2]] ?? m[2], unidade: m[1] === "atracoesPorDia" ? "num" : "mult" };
  }
  if ((m = /^perfil\.fator\.([^.]+)\.(.+)$/.exec(id))) return { grupo: "perfil", secao: "Fator por categoria", rotulo: CATEGORIAS_RITMO[m[1]] ?? m[1], coluna: PERFIS[m[2]] ?? m[2], unidade: "mult" };
  if ((m = /^perfil\.custoDia\.(.+)$/.exec(id))) return { grupo: "perfil", secao: "Custo médio por dia ativo (custo, nível Equilibrado)", rotulo: CATEGORIAS_RITMO[m[1]] ?? m[1], unidade: "USD", aplica: "padrao" };
  if ((m = /^pacotes\.([^.]+)\.(7d|14d)$/.exec(id))) return { grupo: "pacotes", secao: "Preço final por pacote", rotulo: PACOTES[m[1]] ?? m[1], coluna: m[2] === "7d" ? "7 dias" : "14 dias", unidade: "USD" };
  if ((m = /^doc\.visto\.(.+)\.(comCOE|semCOE)$/.exec(id))) {
    const c = TABELA_CONSULADOS_BASE.find((x) => x.id === m![1]);
    return { grupo: "documentacao", secao: "Visto específico por consulado (valor do parceiro, por pessoa)", rotulo: c?.nome ?? m[1], coluna: m[2] === "comCOE" ? "Com COE" : "Sem COE", unidade: "BRL" };
  }
  if ((m = /^doc\.coe\.familia(\d)$/.exec(id))) return { grupo: "documentacao", secao: "Certificado de Elegibilidade (valor do parceiro)", rotulo: `Família — ${m[1]} pessoas`, unidade: "JPY" };
  if ((m = /^frete\.(.+)$/.exec(id))) return { grupo: "frete", secao: "Frete SEDEX do voucher (por região)", rotulo: FRETE[m[1]] ?? m[1], unidade: "BRL" };
  return null;
}

export function descrever(id: string): DescricaoParametro | null {
  const d = descreverBase(id);
  if (!d) return null;
  const rota = /^motorista\.rota\.(.+)\.(preco|overtime)\./.exec(id);
  const transfer = !!rota && ROTAS_MOTORISTA.find((r) => r.id === rota[1])?.categoria === "transfer-aeroporto";
  return { ...d, grupo: produtoDe(id, transfer) };
}

export type ItemParametro = DescricaoParametro & { id: string; padrao: number };

/** Todos os parâmetros registrados no código, com rótulo. */
export function listarParametros(): ItemParametro[] {
  const out: ItemParametro[] = [];
  for (const [id, padrao] of padroesRegistrados()) {
    const d = descrever(id) ?? { grupo: "margens", secao: "Outros", rotulo: id, unidade: "num" as const };
    out.push({ ...d, id, padrao });
  }
  return out;
}
