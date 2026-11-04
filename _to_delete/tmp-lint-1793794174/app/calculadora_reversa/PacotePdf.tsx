"use client";

import { Document, Page, Text, View, StyleSheet, Image, Link, Svg, Path, Circle, Rect, pdf } from "@react-pdf/renderer";
import { formatValor, type MoedaExibicao } from "../lib/currency";

// PDF de proposta enviado ao cliente — pedido do Wilson, 08/set/2026:
// "adicionar um icone para gerar um PDF que vai conter todos os detalhes
// que estão no pacote dele [+] Formas de Pagamento, explicação detalhada
// sobre o que é cada item com link dos vídeos explicativos, Termos e
// Condições, Diferenciais Ajisai/Alpinea (pode ser checado na página de
// /produtos)". Vídeos: só existem prontos "Roteiro Personalizado" (vídeo
// detalhado) e o vídeo geral "como funciona um pacote"; os demais itens
// ficam com placeholder "vídeo em breve", por pedido explícito do Wilson
// ("temos videos que já estao prontos, os demais deixe placeholder").

// Logo do cabeçalho — pedido do Wilson, 16/set/2026: "usar o logo que
// está no rodapé do site de produtos para a calculadora reversa e pdf e
// word" (antes era ajisai-group-logo-crop.png). Fonte real:
// public/images/AJISAI-LOGO.avif — a mesma arte usada no rodapé de
// /produtos, onde a classe CSS `invert` deixa o logo preto sobre fundo
// branco (a arte original é clara/quase branca, pensada pra fundo
// escuro). @react-pdf/renderer não aplica filtro CSS, então o preto foi
// gerado de verdade: AVIF convertido pra PNG com os canais RGB
// invertidos (mantendo o alfa), reencodado em base64 — @react-pdf/
// renderer precisa de um data URI, não aceita caminho relativo de
// arquivo estático. Proporção 344×86 (4:1) — mais larga que o logo
// anterior (~2,88:1); como styles.logo usa objectFit: "contain", o
// logo só fica proporcionalmente menor dentro da mesma caixa, sem
// distorcer.
export const LOGO_DATA_URI =
  "data:image/png;base64,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";

const SITE_URL = "https://www.alpinea.io";
const WHATSAPP_URL = "https://wa.me/5511930300101";
const YOUTUBE_URL = "https://www.youtube.com/@alpinea.private";

export type PacotePdfItem = {
  chave: string;
  label: string;
  detalhe: string[];
  precoBRL: number;
};

export type PacotePdfProps = {
  tituloPacote: string;
  dias: number;
  tipoQuarto: string;
  pessoas: number;
  geradoEmLabel: string;
  cambioLabel: string;
  itens: PacotePdfItem[];
  totalBRL: number;
  orcamentoBRL: number;
  saldoBRL: number;
  // Pedido do Wilson, 10/set/2026: apresentar o "Orçamento de referência"
  // pro cliente gerou confusão na apresentação — com esse campo marcado,
  // o PDF/Word deixam de mostrar "Orçamento de referência" e "Saldo",
  // mostrando só o total do pacote (e o valor por passageiro).
  ocultarOrcamentoReferencia?: boolean;
  // Moeda de exibição — pedido do Wilson, 14/set/2026: "criar botões para
  // transformar tudo em BRL, USD ou IENE". O valor de referência interno
  // de cada item (precoBRL/totalBRL) continua sempre em reais; esses 3
  // campos são só a taxa de conversão pra exibir no documento na moeda
  // escolhida pelo vendedor na tela da calculadora.
  moedaExibicao: MoedaExibicao;
  cambioCotacao: number;
  brlPorJPY: number;
  // Bloco administrativo da proposta — pedido do Wilson, 14/set/2026.
  // Client-facing (aparecem no PDF/Word) — diferente de "Observações
  // internas" e "Margem", que ficam só na tela da calculadora e nunca
  // entram aqui.
  nomeCliente?: string;
  consultor?: string;
  validadeLabel?: string;
  // Roteiro básico sugerido (com fotos) — pedido do Wilson, 25/set/2026:
  // "adicionar roteiro basico sugerido com imagens" no PDF. Lista simples
  // das cidades do roteiro (nome + foto, quando existir) — não é um
  // dia-a-dia detalhado (isso já vive no painel digital do Roteiro
  // Personalizado, ver EXPLICACOES_ITEM.roteiro), é só uma prévia visual
  // de quais cidades fazem parte da viagem. `imagemUrl` já vem como URL
  // completa (SITE_URL + caminho da foto em DESTINOS) — o
  // @react-pdf/renderer não resolve caminho relativo de arquivo estático
  // do Next, precisa de uma URL de verdade pra buscar a imagem.
  cidadesRoteiro?: { nome: string; imagemUrl: string | null }[];
};

// Categoriza um item pela `chave` estável (não pelo label, que muda de
// texto conforme categoria/classe/dias escolhidos) — mesmo critério usado
// em chaveDoItem() na calculadora.
type CategoriaItem =
  | "roteiro"
  | "aereo"
  | "hotel"
  | "seguro"
  | "extensao"
  | "transporte"
  | "guia"
  | "jrpass"
  | "wifi"
  | "motorista"
  | "cambio"
  | "ingresso"
  | "restaurantes"
  | "outro";

function categoriaDoItem(chave: string): CategoriaItem {
  if (chave === "roteiro") return "roteiro";
  if (chave === "aereo") return "aereo";
  if (chave === "hotel") return "hotel";
  if (chave === "seguro") return "seguro";
  if (chave.startsWith("extensao-")) return "extensao";
  if (chave === "jrpass") return "jrpass";
  if (chave === "wifi") return "wifi";
  if (chave === "motorista") return "motorista";
  if (chave.startsWith("ingresso-")) return "ingresso";
  if (chave === "Transporte") return "transporte";
  if (chave === "Guia Turístico") return "guia";
  if (chave === "cambio" || chave === "Câmbio no Brasil") return "cambio";
  if (chave === "Reserva de Restaurantes High-End") return "restaurantes";
  return "outro";
}

// Ícones pequenos por categoria de item — pedido do Wilson, 25/set/2026:
// "usar mais icones pequenos". @react-pdf/renderer não suporta fontes de
// ícone (Font Awesome etc.) nem imagens vetoriais externas — os ícones
// abaixo são desenhados na mão com as primitivas de SVG do próprio
// react-pdf (Svg/Path/Circle/Rect), num estilo linear simples e
// monocromático (mesmo azul #2f80c9 de destaque do resto do documento),
// só pra dar uma pista visual rápida da categoria do item — não
// substituem o texto do item, que continua sendo a fonte de verdade.
function tracosDoIcone(categoria: CategoriaItem) {
  const props = { fill: "none", stroke: "#2f80c9", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (categoria) {
    case "roteiro":
      return (
        <>
          <Path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" {...props} />
          <Circle cx={12} cy={9} r={2.3} {...props} />
        </>
      );
    case "aereo":
      return (
        <>
          <Path d="M22 2L11 13" {...props} />
          <Path d="M22 2l-7 20-4-9-9-4 20-7z" {...props} />
        </>
      );
    case "hotel":
      return (
        <>
          <Path d="M3 11l9-8 9 8" {...props} />
          <Path d="M5 10v10h14V10" {...props} />
          <Path d="M10 20v-6h4v6" {...props} />
        </>
      );
    case "seguro":
      return (
        <>
          <Path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" {...props} />
          <Path d="M9 12l2 2 4-4" {...props} />
        </>
      );
    case "extensao":
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...props} />
          <Path d="M3 12h18" {...props} />
          <Path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...props} />
        </>
      );
    case "transporte":
    case "motorista":
      return (
        <>
          <Rect x={3} y={11} width={18} height={6} rx={2} {...props} />
          <Path d="M5 11l2-5h10l2 5" {...props} />
          <Circle cx={7.5} cy={18} r={1.4} {...props} />
          <Circle cx={16.5} cy={18} r={1.4} {...props} />
        </>
      );
    case "guia":
      return (
        <>
          <Circle cx={12} cy={7} r={4} {...props} />
          <Path d="M4 21v-2a8 8 0 0 1 16 0v2" {...props} />
        </>
      );
    case "jrpass":
      return (
        <>
          <Rect x={5} y={4} width={14} height={12} rx={2} {...props} />
          <Circle cx={8.5} cy={13} r={1} {...props} />
          <Circle cx={15.5} cy={13} r={1} {...props} />
          <Path d="M5 12h14" {...props} />
          <Path d="M8 20l-2 2M16 20l2 2" {...props} />
        </>
      );
    case "wifi":
      return (
        <>
          <Path d="M2 8.5a16 16 0 0 1 20 0" {...props} />
          <Path d="M5.5 12a11 11 0 0 1 13 0" {...props} />
          <Path d="M9 15.5a6 6 0 0 1 6 0" {...props} />
          <Circle cx={12} cy={19} r={1.1} fill="#2f80c9" stroke="none" />
        </>
      );
    case "cambio":
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...props} />
          <Path d="M9 12h6M12 9v6" {...props} />
        </>
      );
    case "ingresso":
      return (
        <Path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" {...props} />
      );
    case "restaurantes":
      return (
        <>
          <Path d="M7 2v20M4 2v6a3 3 0 0 0 3 3M10 2v6a3 3 0 0 1-3 3" {...props} />
          <Path d="M17 2s-2 2-2 6 2 4 2 4v10" {...props} />
        </>
      );
    default:
      return <Path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" {...props} />;
  }
}

function IconeCategoria({ categoria }: { categoria: CategoriaItem }) {
  return (
    <Svg viewBox="0 0 24 24" style={styles.iconeCategoria}>
      {tracosDoIcone(categoria)}
    </Svg>
  );
}

const EXPLICACOES_ITEM: Record<
  CategoriaItem,
  { texto: string; videoUrl: string | null; linkUrl?: string; linkLabel?: string }
> = {
  roteiro: {
    texto:
      "Roteiro dia a dia elaborado sob medida para o grupo, com atrações, deslocamentos, refeições e as informações práticas de aeroporto que vocês vão precisar. Fica disponível num painel digital Ajisai, acessível pelo celular durante toda a viagem — sem depender de papel ou de internet no exterior.",
    videoUrl: `${SITE_URL}/videos/roteiro-personalizado-detalhado.mp4`,
  },
  aereo: {
    texto:
      "Passagem aérea internacional de ida e volta, já incluindo a franquia de bagagem despachada da companhia. A classe pode variar entre Economy, Premium Economy, Business e First Class conforme o pacote escolhido — o valor exibido já reflete a classe confirmada nesta proposta.",
    videoUrl: null,
    // Pedido do Wilson, 16/set/2026: "adicionar link na parte de passagem
    // aerea para duvidas comuns, por exemplo mala, quais tamanhos, o que
    // pode levar dentro e fora do aviao" — ver /duvidas-frequentes#bagagem.
    linkUrl: `${SITE_URL}/duvidas-frequentes#bagagem`,
    linkLabel: "Dúvidas sobre bagagem — tamanhos e o que pode levar",
  },
  hotel: {
    texto:
      "Hospedagem na categoria indicada (3 a 5 estrelas, ou Elite para propriedades super exclusivas), com diárias calculadas por cidade e por época do ano, no tipo de quarto escolhido pelo grupo. A Alpinea seleciona hotéis com localização, serviço e padrão compatíveis com o público de alto padrão que atendemos.",
    videoUrl: null,
    // Pedido do Wilson, 16/set/2026: "em hotel, colocar link para
    // detalhes do serviço para que ele possa ver o que tem em cada
    // categoria em detalhes" — abre /produtos já com o card de hotéis
    // expandido (ver ?abrir=hoteis em app/produtos/page.tsx).
    linkUrl: `${SITE_URL}/produtos?abrir=hoteis`,
    linkLabel: "Ver o que tem em cada categoria de hotel",
  },
  seguro: {
    texto:
      "Seguro viagem com cobertura médico-hospitalar (mínimo de US$ 30 mil, com opção de upgrade para US$ 60 mil), bagagem extraviada, cancelamento de viagem e assistência 24 horas em português — item obrigatório em todos os pacotes Ajisai.",
    videoUrl: null,
    // Pedido do Wilson, 16/set/2026: "adicionar link para apolice padrao
    // e condicoes de uso (depois envio os documentos, deixar
    // placeholder)" — ver placeholder em /duvidas-frequentes#seguro-viagem.
    linkUrl: `${SITE_URL}/duvidas-frequentes#seguro-viagem`,
    linkLabel: "Apólice padrão e condições de uso",
  },
  extensao: {
    texto:
      "Extensão internacional que soma dias à viagem, com hospedagem calculada à parte na mesma categoria do restante do pacote. Transporte, seguro e guia dessa extensão ainda não estão incluídos neste valor — são cotados separadamente.",
    videoUrl: null,
  },
  transporte: {
    texto:
      "Transfers e deslocamentos privados do roteiro — aeroporto, entre cidades e até as atrações — em van dedicada (Toyota Alphard ou Hiace, conforme o tamanho do grupo), sem compartilhar veículo com outros grupos durante toda a viagem.",
    videoUrl: null,
  },
  guia: {
    texto:
      "Guia particular fluente em português acompanhando o roteiro, ajudando com trajetos, horários e filas — para o grupo aproveitar a experiência sem se preocupar com logística ou idioma.",
    videoUrl: null,
  },
  jrpass: {
    texto:
      "Passe ferroviário que dá direito a deslocamentos ilimitados nas linhas JR durante o período contratado, incluindo a maioria dos trens-bala (Shinkansen). É a forma mais prática de se locomover entre cidades no Japão. Venda restrita a turistas estrangeiros (\"Temporary Visitor\") e a japoneses comprovadamente residentes no exterior — japoneses residentes no Japão não têm direito ao passe.",
    videoUrl: null,
    // Pedido do Wilson, 16/set/2026: "em JR Pass, deixar link para termos
    // e condições, deixar claro informações sobre condicoes de
    // eligbilidade, por exemplo ser japonês etc".
    linkUrl: `${SITE_URL}/duvidas-frequentes#jr-pass`,
    linkLabel: "Termos e condições de elegibilidade",
  },
  wifi: {
    // Pocket Wi-Fi removido — pedido do Wilson, 16/set/2026.
    texto:
      "Conexão de internet móvel durante toda a viagem — eSIM direto no celular de cada viajante, sem aparelho extra pra carregar ou devolver.",
    videoUrl: null,
  },
  motorista: {
    texto:
      "Motorista particular à disposição exclusiva do grupo, sem compartilhar veículo — mais privacidade e flexibilidade de horário do que o transporte padrão do roteiro. Recomendado para cidades onde o transporte público não é suficiente.",
    videoUrl: null,
  },
  cambio: {
    texto:
      "Retirada de ienes em espécie ainda no Brasil, com cotação comercial fechada antes do embarque — evita depender só de caixas eletrônicos ou casas de câmbio no Japão logo nos primeiros dias de viagem.",
    videoUrl: null,
  },
  ingresso: {
    texto:
      "Ingressos para parques e atrações (Disney, Universal Studios Japan e afins), com a opção de fast pass para pular fila nas atrações participantes, quando contratado.",
    videoUrl: null,
  },
  restaurantes: {
    texto:
      "Reservas fechadas em restaurantes Michelin ou Tabelog Awards (ou equivalente) — mesas que normalmente exigem meses de antecedência ou contato local, garantidas pela rede de relacionamento da Alpinea no Japão.",
    videoUrl: null,
  },
  outro: {
    texto: "Item incluído nesta proposta — detalhes na tabela acima.",
    videoUrl: null,
  },
};

const DIFERENCIAIS_AJISAI: { titulo: string; texto: string }[] = [
  {
    titulo: "+12 anos de experiência",
    texto:
      "Mais de uma década de vivência no Japão, entre gastronomia, hotelaria, cultura, logística e relações locais.",
  },
  {
    titulo: "Exclusividade de serviços",
    texto:
      "Curadoria de restaurantes, hotelaria e consumo desenvolvida a partir de experiência própria, fluência no idioma e uma rede construída ao longo de mais de uma década no Japão.",
  },
  {
    titulo: "Referência na conexão Brasil–Japão",
    texto:
      "Entre os 3 maiores emissores de passagens aéreas dessa rota no mundo, unimos conhecimento operacional à curadoria de experiências privadas.",
  },
  {
    titulo: "Operação própria no Japão",
    texto:
      "Atendimento sem intermediários, com maior flexibilidade, controle e proximidade dos melhores parceiros locais.",
  },
];

// Redesenho estético, pedido do Wilson, 16/set/2026: "melhorar tanto no
// pdf e word a parte estetica do arquivo, hoje está meio feio, podemos
// deixar mais bonito". Mesma paleta já usada no resto do site (azul
// #2f80c9 de destaque, roxo #b79ce6 como contraponto, navy #0A2540 pra
// texto de autoridade) — @react-pdf/renderer não tem box-shadow nem
// gradiente, então o ganho vem de: barra de destaque sob o título, header
// com borda colorida (em vez de navy neutro), zebra-striping nos itens,
// caixas com borda lateral colorida em vez de só fundo cinza plano.
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0A2540",
  },
  logo: { width: 110, height: 38.28, objectFit: "contain", marginBottom: 16 },
  eyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: "#2f80c9",
    marginBottom: 5,
  },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4, color: "#0A2540" },
  headerRule: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2f80c9",
    marginBottom: 12,
  },
  h2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: "#2f80c9",
    color: "#0A2540",
  },
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  tag: {
    backgroundColor: "#2f80c9",
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  metaText: { fontSize: 8, color: "#6b7688", marginBottom: 2 },
  // Itens inclusos virou cartão de verdade em vez de linha com borda
  // embaixo — pedido do Wilson, 25/set/2026: "usar mais cards no pdf tbm
  // das selecoes da calculadora reversa" (depois de já ter pedido "o
  // estetico pode ser melhor" pro documento como um todo). Borda
  // completa + cantos arredondados + borda lateral azul (mesmo padrão já
  // usado em totalsBox/diferencialBox/contratoBox), com espaço entre os
  // cards em vez do zebra-striping anterior.
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    marginBottom: 7,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3e7ed",
    borderLeftWidth: 3,
    borderLeftColor: "#2f80c9",
    borderRadius: 7,
  },
  iconeCategoria: { width: 15, height: 15, marginTop: 1.5 },
  itemLabel: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 2, color: "#0A2540" },
  itemDetalhe: { fontSize: 8.5, color: "#4a5568", lineHeight: 1.4 },
  itemPreco: { fontFamily: "Helvetica-Bold", fontSize: 10, marginLeft: 12, color: "#0A2540" },
  // Grid de cidades do "Roteiro básico sugerido" — pedido do Wilson,
  // 25/set/2026: "adicionar roteiro basico sugerido com imagens".
  cidadeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4, marginBottom: 6 },
  cidadeCard: { width: 76, alignItems: "center" },
  cidadeImg: { width: 76, height: 54, borderRadius: 6, objectFit: "cover", marginBottom: 3 },
  cidadeImgPlaceholder: {
    width: 76,
    height: 54,
    borderRadius: 6,
    marginBottom: 3,
    backgroundColor: "#eef1f4",
    borderWidth: 1,
    borderColor: "#dcdfe4",
  },
  cidadeNome: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#0A2540", textAlign: "center" },
  totalsBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#f2f5f8",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2f80c9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalsLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#6b7688" },
  totalsValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#2f80c9", marginTop: 3 },
  explicacaoBloco: {
    marginBottom: 14,
    paddingLeft: 11,
    paddingBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#cfe1f2",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eef1f4",
  },
  explicacaoTitulo: { fontFamily: "Helvetica-Bold", fontSize: 10.5, marginBottom: 3, color: "#0A2540" },
  explicacaoTexto: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  videoLink: { fontSize: 8.5, color: "#2f80c9", marginTop: 4, fontFamily: "Helvetica-Bold" },
  videoPlaceholder: { fontSize: 8.5, color: "#9aa3b2", marginTop: 4, fontStyle: "italic" },
  saibaMaisLink: { fontSize: 8.5, color: "#7c5cbf", marginTop: 4, fontFamily: "Helvetica-Bold" },
  paragrafo: { fontSize: 9, color: "#374151", lineHeight: 1.5, marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 6 },
  bulletDot: { fontSize: 9, color: "#2f80c9", marginRight: 7 },
  bulletTexto: { fontSize: 9, color: "#374151", lineHeight: 1.5, flex: 1 },
  diferencialBox: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#b79ce6",
  },
  diferencialTitulo: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 3, color: "#0A2540" },
  diferencialTexto: { fontSize: 8.5, color: "#4a5568", lineHeight: 1.4 },
  contratoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#eef4fb",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2f80c9",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#dcdfe4",
    paddingTop: 8,
  },
  // Pedido do Wilson, 14/set/2026: "isso aqui está horrivel, parece
  // serviço mal feito, organize em 2 linhas separadas" — antes era uma
  // frase única e comprida (razão social + CNPJ das duas empresas + site)
  // que quebrava no meio de uma palavra, de forma acidental. Agora são 2
  // linhas fixas e intencionais: razões sociais/CNPJs em cima, site embaixo.
  footerLinha1: {
    fontSize: 7,
    color: "#9aa3b2",
    textAlign: "center",
    lineHeight: 1.5,
  },
  footerLinha2: {
    fontSize: 7,
    color: "#9aa3b2",
    textAlign: "center",
    marginTop: 2,
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 40,
    fontSize: 7,
    color: "#9aa3b2",
  },
});

function Rodape() {
  return (
    <>
      {/* Pedido do Wilson, 14/set/2026: "no pdf e word tem que constar
          os dois cnpjs da ajisai de da alpinea" — antes só tinha o CNPJ
          da Ajisai. CNPJ da Alpinea (66.491.067/0001-84 — Alpinea
          Agências de Viagens LTDA) conferido no rodapé do próprio site
          (alpinea.io), igual ao da Ajisai (43.544.605/0001-56 —
          AjisaiWork Japan Agência de Viagens LTDA, já usado aqui e em
          /produtos). Pedido do Wilson, mesma data, depois de ver o
          resultado: "isso aqui está horrivel ... organize em 2 linhas
          separadas" — a frase única quebrava sozinha, no meio de uma
          palavra; agora são 2 linhas fixas dentro de um View próprio
          (position:absolute só no wrapper, não em cada linha). */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerLinha1}>
          Ajisai · Alpinea — AjisaiWork Japan Agência de Viagens LTDA (CNPJ 43.544.605/0001-56) e Alpinea
          Agências de Viagens LTDA (CNPJ 66.491.067/0001-84)
        </Text>
        <Text style={styles.footerLinha2}>www.alpinea.io</Text>
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </>
  );
}

export function PacotePdfDocument(props: PacotePdfProps) {
  const {
    tituloPacote,
    dias,
    tipoQuarto,
    pessoas,
    geradoEmLabel,
    cambioLabel,
    itens,
    totalBRL,
    moedaExibicao,
    cambioCotacao,
    brlPorJPY,
    nomeCliente,
    consultor,
    validadeLabel,
    cidadesRoteiro,
    // orcamentoBRL, saldoBRL e ocultarOrcamentoReferencia não são mais
    // exibidos (ver comentário 14/set/2026 acima) — deixados no tipo
    // PacotePdfProps por compatibilidade com quem chama, mas não
    // desestruturados aqui pra não sobrar variável sem uso.
  } = props;
  const valorPorPassageiroBRL = pessoas > 0 ? totalBRL / pessoas : totalBRL;
  // Pedido do Wilson, 14/set/2026: "criar botões para transformar tudo em
  // BRL, USD ou IENE" — mesma conversão usada na tela, aplicada aqui no
  // PDF (o valor de referência de cada item continua sempre em reais).
  const formatPreco = (valor: number) => formatValor(valor, moedaExibicao, cambioCotacao, brlPorJPY);
  const nomeMoeda = moedaExibicao === "USD" ? "Dólar (US$)" : moedaExibicao === "JPY" ? "Iene (¥)" : null;

  return (
    <Document title={`Proposta Ajisai - ${tituloPacote}`} author="Ajisai · Alpinea">
      {/* ── PÁGINA 1 — RESUMO DO PACOTE ── */}
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image aqui é do @react-pdf/renderer, não HTML/next-image; não aceita alt */}
        <Image src={LOGO_DATA_URI} style={styles.logo} />
        <Text style={styles.eyebrow}>Proposta de viagem personalizada</Text>
        <Text style={styles.h1}>{tituloPacote}</Text>
        <View style={styles.headerRule} />
        {nomeCliente && <Text style={styles.metaText}>Proposta para {nomeCliente}</Text>}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{dias} {dias === 1 ? "dia" : "dias"}</Text>
          <Text style={styles.tag}>{tipoQuarto}</Text>
          <Text style={styles.tag}>{pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}</Text>
        </View>
        <Text style={styles.metaText}>
          Ajisai · proposta gerada em {geradoEmLabel}
          {consultor ? ` · Consultor: ${consultor}` : ""}
        </Text>
        {validadeLabel && <Text style={styles.metaText}>Proposta válida até {validadeLabel}</Text>}
        <Text style={styles.metaText}>{cambioLabel}</Text>
        {nomeMoeda && (
          <Text style={styles.metaText}>
            Valores exibidos em {nomeMoeda} — conversão de referência, sujeita à cotação do dia.
          </Text>
        )}

        {cidadesRoteiro && cidadesRoteiro.length > 0 && (
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.h2}>Roteiro básico sugerido</Text>
            <Text style={{ fontSize: 8, color: "#6b7688", marginBottom: 6 }}>
              Cidades previstas nesta proposta — o dia a dia completo, com atrações e
              deslocamentos, fica no painel digital do Roteiro Personalizado.
            </Text>
            <View style={styles.cidadeGrid}>
              {cidadesRoteiro.map((c) => (
                <View key={c.nome} style={styles.cidadeCard} wrap={false}>
                  {c.imagemUrl ? (
                    /* eslint-disable-next-line jsx-a11y/alt-text -- Image aqui é do @react-pdf/renderer, não aceita alt */
                    <Image src={c.imagemUrl} style={styles.cidadeImg} />
                  ) : (
                    <View style={styles.cidadeImgPlaceholder} />
                  )}
                  <Text style={styles.cidadeNome}>{c.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.h2}>Itens inclusos</Text>
        {itens.map((item) => (
          <View key={item.chave} style={styles.itemCard} wrap={false}>
            <IconeCategoria categoria={categoriaDoItem(item.chave)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {item.detalhe.map((linha, j) => (
                <Text key={j} style={styles.itemDetalhe}>{linha}</Text>
              ))}
            </View>
            <Text style={styles.itemPreco}>{formatPreco(item.precoBRL)}</Text>
          </View>
        ))}

        {/* Pedido do Wilson, 16/set/2026: "no pdf e word esta quebrando,
            tem que ficar tudo numa pagina só" — a caixa de total estava
            quebrando ao meio entre páginas (label numa página, valor na
            seguinte). wrap={false} força o @react-pdf/renderer a tratar
            essa View como um bloco indivisível: se não couber no resto da
            página, o bloco inteiro pula pra próxima, mas nunca é cortado
            no meio. */}
        <View style={styles.totalsBox} wrap={false}>
          <View>
            <Text style={styles.totalsLabel}>Total do pacote sugerido</Text>
            <Text style={styles.totalsValue}>{formatPreco(totalBRL)}</Text>
            <Text style={{ fontSize: 9, color: "#6b7688", marginTop: 2 }}>
              {formatPreco(valorPorPassageiroBRL)} por passageiro ({pessoas}{" "}
              {pessoas === 1 ? "pessoa" : "pessoas"})
            </Text>
          </View>
          {/* Pedido do Wilson, 14/set/2026: "valor do orçamento nao deve
              aparecer em nenhum documento como pdf e word editavel" —
              "Orçamento de referência" e "Saldo" nunca mais aparecem no
              PDF, incondicionalmente (antes dependia do checkbox
              ocultarOrcamentoReferencia; agora esse é sempre o
              comportamento). Prop mantida por compatibilidade, mas não
              tem mais efeito aqui — sempre oculto. */}
        </View>
        {/* Pedido do Wilson, 14/set/2026, sobre a versão antiga desse aviso
            ("itens sem preço fixo... não entram nesse cálculo"): "quem
            disse que nao tem preço? [...] é pra incluir os preços e
            discriminar nas linhas deles dentro do valor final" —
            concierge, experiência sob medida, transfer de ônibus e
            reserva de restaurante agora são itens precificados, com preço
            de referência, e aparecem na lista de itens inclusos acima
            quando o vendedor marca. */}
        <Text style={{ fontSize: 7.5, color: "#9aa3b2", marginTop: 8 }}>
          Concierge, experiências sob medida, transfer de ônibus e reservas de restaurante avulsas
          já têm preço de referência e entram no total quando incluídos na proposta — ajustados
          conforme o pedido do cliente. Valor final sujeito a confirmação da Ajisai.
        </Text>

        <Rodape />
      </Page>

      {/* ── PÁGINA 2 — EXPLICAÇÃO DE CADA ITEM ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>O que é cada item do seu pacote</Text>
        <Text style={styles.paragrafo}>
          Um resumo do que está incluído em cada item da proposta, para deixar claro o que vocês
          estão contratando. Sempre que houver um vídeo explicativo pronto, o link está logo abaixo
          do texto.
        </Text>
        <View style={styles.explicacaoBloco} wrap={false}>
          <Text style={styles.explicacaoTitulo}>Como funciona um pacote Ajisai (vídeo geral)</Text>
          <Text style={styles.explicacaoTexto}>
            Uma visão geral de como a Ajisai monta, cota e acompanha um pacote de viagem do início
            ao fim.
          </Text>
          <Link src={`${SITE_URL}/videos/pacotes-explicacao.mp4`} style={styles.videoLink}>
            ▶ Assistir vídeo explicativo
          </Link>
        </View>
        {Array.from(new Map(itens.map((item) => [categoriaDoItem(item.chave), item.label])).entries()).map(
          ([categoria, labelExemplo]) => {
            const explicacao = EXPLICACOES_ITEM[categoria];
            return (
              <View key={categoria} style={styles.explicacaoBloco} wrap={false}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <IconeCategoria categoria={categoria} />
                  <Text style={[styles.explicacaoTitulo, { marginBottom: 0 }]}>{labelExemplo}</Text>
                </View>
                <Text style={styles.explicacaoTexto}>{explicacao.texto}</Text>
                {explicacao.videoUrl ? (
                  <Link src={explicacao.videoUrl} style={styles.videoLink}>
                    ▶ Assistir vídeo explicativo
                  </Link>
                ) : (
                  <Text style={styles.videoPlaceholder}>Vídeo explicativo em breve</Text>
                )}
                {explicacao.linkUrl && explicacao.linkLabel && (
                  <Link src={explicacao.linkUrl} style={styles.saibaMaisLink}>
                    🔗 {explicacao.linkLabel}
                  </Link>
                )}
              </View>
            );
          },
        )}
        <Rodape />
      </Page>

      {/* ── PÁGINA 3 — PAGAMENTO E TERMOS ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Formas de pagamento</Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>PIX.</Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>Cartão de crédito, em até 12x + juros mensais.</Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          {/* Pedido do Wilson, 16/set/2026: "mudar para TED/PIX" (no lugar
              de "Transferência internacional"). */}
          <Text style={styles.bulletTexto}>TED/PIX.</Text>
        </View>
        <Text style={{ ...styles.paragrafo, marginTop: 6, fontSize: 8, color: "#6b7688" }}>
          Condições de entrada, parcelas e prazos são confirmadas individualmente com o time
          Ajisai antes da emissão dos serviços.
        </Text>

        <Text style={styles.h2}>Termos e condições (resumo)</Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>
            A execução do serviço é considerada iniciada a partir da entrevista/briefing inicial,
            do envio de qualquer material personalizado pela Ajisai, ou do início de gestão de
            reservas junto a fornecedores — o pagamento, por si só, não configura início de
            execução.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>
            Cancelamento antes do início da execução: reembolso integral dos valores pagos à
            Ajisai, deduzidas eventuais taxas bancárias ou de processamento de pagamento.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>
            Valores antecipados para fornecedores terceiros (hotéis, restaurantes, experiências
            etc.) seguem exclusivamente a política de cancelamento de cada fornecedor — a Ajisai
            envida seus melhores esforços para obter reembolso, sem garantia de resultado.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>
            O viajante é responsável por possuir passaporte válido, vistos quando aplicáveis,
            documentação sanitária quando aplicável, meios de pagamento adequados e reservas
            confirmadas.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>
            Fornecedores podem exigir dados pessoais, cartão de crédito, pagamento antecipado,
            depósito, garantia, política de cancelamento própria, taxa de no-show, horário de
            chegada ou código de vestimenta.
          </Text>
        </View>
        <Text style={{ fontSize: 8.5, marginTop: 6 }}>
          Este é um resumo. Os Termos e Condições completos estão disponíveis em{" "}
          <Link src={`${SITE_URL}/legal`} style={{ color: "#2f80c9" }}>
            {SITE_URL}/legal
          </Link>
          .
        </Text>
        <Rodape />
      </Page>

      {/* ── PÁGINA 4 — DIFERENCIAIS AJISAI/ALPINEA ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Por que viajar com a Ajisai</Text>
        {DIFERENCIAIS_AJISAI.map((d) => (
          <View key={d.titulo} style={styles.diferencialBox} wrap={false}>
            <Text style={styles.diferencialTitulo}>{d.titulo}</Text>
            <Text style={styles.diferencialTexto}>{d.texto}</Text>
          </View>
        ))}
        <View style={styles.diferencialBox} wrap={false}>
          <Text style={styles.diferencialTitulo}>Avaliações e verificações</Text>
          <Text style={styles.diferencialTexto}>
            4,8 de 5,0 no Google, com mais de 180 avaliações · Verificada pelo Reclame Aqui ·
            Registro Cadastur como agência de turismo.
          </Text>
        </View>
        <Text style={{ fontSize: 8.5, marginTop: 10 }}>
          Veja mais avaliações e detalhes em{" "}
          <Link src={`${SITE_URL}/produtos`} style={{ color: "#2f80c9" }}>
            {SITE_URL}/produtos
          </Link>{" "}
          ou no canal{" "}
          <Link src={YOUTUBE_URL} style={{ color: "#2f80c9" }}>
            @alpinea.private
          </Link>{" "}
          no YouTube.
        </Text>
        <Text style={{ fontSize: 8.5, marginTop: 14 }}>
          Dúvidas sobre esta proposta? Fale com a gente pelo{" "}
          <Link src={WHATSAPP_URL} style={{ color: "#2f80c9" }}>
            WhatsApp
          </Link>
          .
        </Text>

        {/* Pedido do Wilson, 16/set/2026: "no pdf e word editavel,
            adicionar link pro contrato ao final do documento" — placeholder
            até o Wilson enviar o arquivo real do contrato padrão. */}
        <View style={styles.contratoBox} wrap={false}>
          <Text style={styles.diferencialTitulo}>Contrato</Text>
          <Text style={styles.diferencialTexto}>
            O contrato de prestação de serviços completo desta proposta está disponível em:
          </Text>
          <Link src={`${SITE_URL}/documentos/contrato-padrao-ajisai.pdf`} style={styles.videoLink}>
            📄 Ler o contrato completo
          </Link>
        </View>

        <Rodape />
      </Page>
    </Document>
  );
}

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function gerarEBaixarPdf(props: PacotePdfProps) {
  const blob = await pdf(<PacotePdfDocument {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proposta-ajisai-${slugify(props.tituloPacote)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
