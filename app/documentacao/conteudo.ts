// Documentação (visto específico, Certificado de Elegibilidade e exportação
// de pet) — Wilson, 29/out/2026. Conteúdo e preços vêm do parceiro de
// documentação (mensagens de 29/out + PDFs "VISTO JAPONES", "Proposta de
// Serviço - Certificado de Elegibilidade" e "EXPORTAÇÃO PET PARA O JAPÃO").
// Tudo sob a marca Ajisai. Preço é sempre o valor final — nunca abrir por
// item como na proposta comercial (pedido do parceiro).

export type ServicoDoc = "visto" | "elegibilidade" | "pet";

// ── Números de experiência (áudio do Wilson, 29/out/2026) ──
export const EXPERIENCIA = { vistos: "+500", elegibilidades: "+150", pets: "+20" };

// ── Visto específico — preço por pessoa, por consulado (já inclui a taxa consular) ──
export type Consulado = { id: string; nome: string; comCOE: number; semCOE: number; dica?: string };
export const CONSULADOS: Consulado[] = [
  { id: "sao-paulo", nome: "São Paulo", comCOE: 790, semCOE: 1590, dica: "SP, MS e Triângulo Mineiro" },
  { id: "rio-de-janeiro", nome: "Rio de Janeiro", comCOE: 990, semCOE: 1790 },
  { id: "curitiba", nome: "Curitiba", comCOE: 990, semCOE: 1790 },
  { id: "brasilia", nome: "Brasília (Embaixada)", comCOE: 1190, semCOE: 1980 },
  { id: "manaus", nome: "Manaus", comCOE: 1290, semCOE: 2090 },
  { id: "belem", nome: "Belém", comCOE: 1290, semCOE: 2090 },
  { id: "recife", nome: "Recife", comCOE: 1390, semCOE: 2190 },
];
export const PRAZO_VISTO = { comCOE: "cerca de 2 semanas", semCOE: "cerca de 3 meses" };

// ── Certificado de Elegibilidade — valor final do pacote, em ienes ──
export const COE_INDIVIDUAL_JPY = { descendente: 79000, conjuge: 89000 };
export const COE_FAMILIA_JPY: Record<number, number> = { 2: 149000, 3: 199000, 4: 229000, 5: 259000 };
export const COE_MAX_PESSOAS_SITE = 5; // acima disso, sob consulta

export function precoCOEJPY(pessoas: number, perfilIndividual: "descendente" | "conjuge"): number | null {
  if (pessoas < 1) return null;
  if (pessoas === 1) return COE_INDIVIDUAL_JPY[perfilIndividual];
  return COE_FAMILIA_JPY[pessoas] ?? null;
}

// ── Exportação de pet ──
// PDF do parceiro mostra R$ 9.587,52, mas só a sorologia custa ~R$ 5.500.
// Enquanto o Wilson não confirmar o valor atual, o site mostra "sob consulta".
export const PRECO_PET_BRL: number | null = null;

// ── Perguntas — todas obrigatórias (parceiro, 29/out/2026) ──
export type Pergunta =
  | { id: string; rotulo: string; tipo: "texto" | "email" | "tel" | "data" | "textarea"; ajuda?: string; placeholder?: string }
  | { id: string; rotulo: string; tipo: "numero"; min?: number; max?: number; ajuda?: string; sufixo?: string }
  | { id: string; rotulo: string; tipo: "opcoes"; opcoes: string[]; ajuda?: string }
  | { id: string; rotulo: string; tipo: "lista"; opcoes: string[]; ajuda?: string };

export const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export const PROVINCIAS_JAPAO = [
  "Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma",
  "Saitama","Chiba","Tóquio","Kanagawa","Niigata","Toyama","Ishikawa","Fukui","Yamanashi","Nagano",
  "Gifu","Shizuoka","Aichi","Mie","Shiga","Quioto","Osaka","Hyogo","Nara","Wakayama",
  "Tottori","Shimane","Okayama","Hiroshima","Yamaguchi","Tokushima","Kagawa","Ehime","Kochi","Fukuoka",
  "Saga","Nagasaki","Kumamoto","Oita","Miyazaki","Kagoshima","Okinawa",
];

export const PERGUNTAS_VISTO: Pergunta[] = [
  { id: "qtd", rotulo: "Quantidade de solicitantes do visto", tipo: "numero", min: 1, max: 15, sufixo: "pessoa(s)" },
  { id: "ascendencia", rotulo: "Ascendência do solicitante titular", tipo: "opcoes", opcoes: ["Nissei", "Sansei", "Sem ascendência (cônjuge)", "Dependente menor de idade"] },
  { id: "cidade", rotulo: "Cidade onde o solicitante e os dependentes residem", tipo: "texto" },
  { id: "uf", rotulo: "Estado", tipo: "lista", opcoes: UFS },
  { id: "idadeDependentes", rotulo: "Idade dos dependentes", tipo: "texto", placeholder: "Ex.: 8 e 12 anos — ou “não se aplica”" },
  { id: "vistoAntes", rotulo: "O solicitante já tirou visto para o Japão antes?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
  { id: "ajudaGoverno", rotulo: "O solicitante ou seus dependentes tiveram ajuda do governo?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
  { id: "koseki", rotulo: "Possui cópia do koseki tohon ou o original?", tipo: "opcoes", opcoes: ["Sim, cópia", "Sim, original", "Não"] },
  { id: "embarque", rotulo: "Previsão de embarque", tipo: "opcoes", opcoes: ["O mais brevemente possível", "Dentro de 3 meses", "Dentro de 6 meses", "Sem data definida"] },
  {
    id: "emprego",
    rotulo: "Possui emprego no Japão definido?",
    tipo: "opcoes",
    opcoes: [
      "Sim, tenho emprego definido com contrato de trabalho",
      "Sim, mas sem contrato de trabalho",
      "Não, mas gostaria de avaliar uma oportunidade com vocês",
      "Não tenho emprego definido e não gostaria de trabalhar no Japão",
    ],
  },
];

export const PERGUNTAS_GARANTIDOR: Pergunta[] = [
  { id: "g_parentesco", rotulo: "Grau de parentesco com o garantidor no Japão", tipo: "opcoes", opcoes: ["Primeiro grau", "Segundo grau", "Empresa", "Amigo", "Outro"] },
  { id: "g_visto", rotulo: "Visto do garantidor no Japão", tipo: "opcoes", opcoes: ["Visto permanente", "Residente de longo prazo", "Cidadão japonês", "Outro"] },
  { id: "g_anos", rotulo: "Há quanto tempo o garantidor reside no Japão", tipo: "opcoes", opcoes: ["Até 1 ano", "De 1 a 3 anos", "De 3 a 5 anos", "Mais de 5 anos"] },
  { id: "g_renda", rotulo: "Renda mensal estimada do garantidor", tipo: "opcoes", opcoes: ["Sem renda", "Até ¥200 mil", "De ¥201 a ¥350 mil", "De ¥351 a ¥500 mil", "Acima de ¥501 mil"] },
  { id: "g_dependentes", rotulo: "Quantos dependentes o garantidor possui", tipo: "opcoes", opcoes: ["Nenhum", "1 dependente", "2 dependentes", "3 dependentes", "4 ou mais"] },
  { id: "g_provincia", rotulo: "Província de residência do garantidor", tipo: "lista", opcoes: PROVINCIAS_JAPAO },
  { id: "g_cidade", rotulo: "Cidade de residência do garantidor", tipo: "texto" },
  { id: "g_ocupacao", rotulo: "Ocupação do garantidor", tipo: "opcoes", opcoes: ["Assalariado", "Autônomo", "Empresário", "Arubaito", "Desempregado"] },
  { id: "g_nome", rotulo: "Nome do garantidor", tipo: "texto" },
  { id: "g_whatsapp", rotulo: "Telefone do garantidor (com WhatsApp)", tipo: "tel", placeholder: "+81 90 0000 0000" },
  { id: "g_tentativa", rotulo: "Já tentou tirar o Certificado de Elegibilidade antes?", tipo: "opcoes", opcoes: ["Sim, e deu certo", "Sim, e não deu certo", "Primeira vez"] },
  { id: "g_imigracao", rotulo: "O garantidor tem disponibilidade para ir até a imigração, se necessário?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
  { id: "g_contato", rotulo: "Você tem contato direto com o garantidor?", tipo: "opcoes", opcoes: ["Sim, possuo", "Não, mas um parente possui", "Não"] },
  { id: "g_ajudaRetorno", rotulo: "Você ou um dos seus pais recebeu ajuda do governo para retornar ao Brasil?", tipo: "opcoes", opcoes: ["Sim, todos nós", "Sim, somente um dos pais ou ambos", "Não recebemos ajuda do governo"] },
];

export const PERGUNTAS_PET_TUTOR: Pergunta[] = [
  { id: "t_nascimento", rotulo: "Data de nascimento do tutor", tipo: "data" },
  { id: "t_endereco", rotulo: "Endereço completo", tipo: "textarea", placeholder: "Rua, número, complemento, bairro, cidade, UF e CEP" },
];

export const PERGUNTAS_PET: Pergunta[] = [
  { id: "p_nome", rotulo: "Nome do pet", tipo: "texto" },
  { id: "p_tipo", rotulo: "Tipo de pet", tipo: "opcoes", opcoes: ["Cachorro", "Gato"], ajuda: "Só aceitamos cães e gatos." },
  { id: "p_raca", rotulo: "Raça", tipo: "texto", placeholder: "Ex.: Shiba, SRD, Maine Coon", ajuda: "Informe a raça real do pet — inclusive em cruzamentos." },
  // Eliminatória (Wilson, 29/out/2026): raça restrita não segue para a contratação.
  { id: "p_racaRestrita", rotulo: "A raça do seu pet (ou do cruzamento) está na lista de raças NÃO aceitas desta página?", tipo: "opcoes", opcoes: ["Não, não está na lista", "Sim, está na lista"] }, // sem "Não sei" (Wilson, 29/out/2026: a lista com fotos está na mesma etapa)
  { id: "p_idade", rotulo: "Idade ou data de nascimento do pet", tipo: "texto" },
  { id: "p_porte", rotulo: "Porte", tipo: "opcoes", opcoes: ["Pequeno", "Médio", "Grande"] },
  { id: "p_altura", rotulo: "Altura", tipo: "numero", min: 1, max: 150, sufixo: "cm" },
  { id: "p_comprimento", rotulo: "Comprimento", tipo: "numero", min: 1, max: 200, sufixo: "cm" },
  { id: "p_largura", rotulo: "Largura", tipo: "numero", min: 1, max: 100, sufixo: "cm" },
  { id: "p_peso", rotulo: "Peso", tipo: "numero", min: 1, max: 100, sufixo: "kg" },
  { id: "p_viagemIntl", rotulo: "O pet já fez uma viagem internacional?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
  { id: "p_sorologia", rotulo: "Já possui sorologia pronta?", tipo: "opcoes", opcoes: ["Sim", "Não", "Não se aplica"] },
  { id: "p_quarentena", rotulo: "Já cumpriu os 180 dias de espera após a sorologia?", tipo: "opcoes", opcoes: ["Sim", "Não", "Não se aplica"] },
  { id: "p_caixa", rotulo: "Já possui caixa transportadora?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
];

// ── Restrições de raça no transporte aéreo (texto do parceiro) ──
// Fotos (Wilson, 29/out/2026) em /public/images/racas/ — nomes de arquivo
// exatamente como estão (servidor diferencia maiúsculas).
export type RacaRestrita = { nome: string; foto: string; nota?: string };
export const RACAS_RESTRITAS_CAES: RacaRestrita[] = [
  { nome: "Bulldog Inglês", foto: "cao-bulldog-ingles.webp" },
  { nome: "Bulldog Francês", foto: "cao-bulldog-frances.webp" },
  { nome: "Bulldog Americano", foto: "cao-bulldog-americano.webp" },
  { nome: "Pug", foto: "cao-pug.webp" },
  { nome: "Boston Terrier", foto: "cao-boston-terrier.webp" },
  { nome: "Boxer", foto: "cao-boxer.webp" },
  { nome: "Shih Tzu", foto: "cao-shih-tzu.webp" },
  { nome: "Pequinês", foto: "cao-pequines.webp" },
  { nome: "Lhasa Apso", foto: "cao-lhasa-apso.webp" },
  { nome: "Cavalier King Charles Spaniel", foto: "cao-cavalier-king-charles.webp" },
  { nome: "Chow Chow", foto: "cao-chow-chow.webp" },
  { nome: "Shar Pei", foto: "cao-shar-pei.webp" },
  { nome: "Affenpinscher", foto: "cao-affenpinscher.webp" },
  { nome: "Brussels Griffon", foto: "cao-brussels-griffon.webp" },
  { nome: "Japanese Chin", foto: "cao-japanese-chin.webp" },
  { nome: "Mastiff", foto: "cao-mastiff.webp" },
  { nome: "Bullmastiff", foto: "cao-bullmastiff.webp" },
  { nome: "Cane Corso", foto: "cao-cane-corso.webp" },
  { nome: "Dogue de Bordeaux", foto: "cao-dogue-de-bordeaux.webp" },
  { nome: "American Staffordshire Terrier", foto: "cao-american-staffordshire.webp" },
  { nome: "Staffordshire Bull Terrier", foto: "cao-staffordshire-bull-terrier.webp" },
];
export const RACAS_RESTRITAS_GATOS: RacaRestrita[] = [
  { nome: "Persa", foto: "gato-persa.webp" },
  { nome: "Himalaio", foto: "gato-himalaio.webp" },
  { nome: "Exotic Shorthair", foto: "gato-exotic-shorthair.webp" },
  { nome: "Burmês", foto: "gato-burmes.webp" },
  { nome: "Scottish Fold", foto: "gato-scottish-fold.webp" },
];
// Palavras para avisar no formulário (não bloqueia — a confirmação é da cia aérea).
export const PALAVRAS_RACA_RESTRITA = [
  "bulldog","buldogue","pug","boston","boxer","shih","pequin","pekingese","lhasa","cavalier","chow","shar pei","sharpei",
  "affenpinscher","griffon","grifon","japanese chin","chin japon","mastiff","mastim","cane corso","dogue","staffordshire","pit bull","pitbull","tosa","dogo",
  "persa","himalaio","exotic","burm","scottish",
];

export const TERMOS_RACAS = [
  ["Aceite exclusivo de raças permitidas", "Serão aceitos apenas cães e gatos de raças (ou cruzamentos) que sejam permitidos pelas companhias aéreas, regulamentações de transporte aéreo internacional (incluindo IATA) e normas dos países de origem, trânsito e destino. O aceite está condicionado à confirmação prévia da companhia aérea e à apresentação de documentação sanitária válida."],
  ["Responsabilidade do tutor", "O tutor é o único responsável por verificar, antes da reserva e do embarque, se a raça do animal é aceita pela companhia aérea escolhida e pelas autoridades dos países envolvidos. Raças não permitidas serão recusadas no check-in ou no embarque, sem direito a reembolso de taxas de transporte ou compensação por prejuízos decorrentes da recusa."],
  ["Raças NÃO aceitas", "Não são aceitos animais pertencentes a raças braquicefálicas (de focinho curto) ou classificadas como proibidas pela maioria das companhias aéreas internacionais devido a riscos respiratórios, de termorregulação ou de segurança no porão de carga. Também se incluem raças consideradas de risco em determinadas rotas ou países."],
  ["Documentação e condições de saúde", "É obrigatória a apresentação de certificado de saúde veterinário internacional, vacinação antirrábica válida, microchip (quando exigido) e demais documentos solicitados. Animais com problemas respiratórios, cardíacos ou outras condições de saúde que possam agravar-se durante o voo serão recusados."],
  ["Disposições finais", "Estas condições não substituem as regras específicas de cada companhia aérea nem a legislação dos países de destino. O não cumprimento implicará na recusa do transporte do animal. O tutor assume total responsabilidade por qualquer incidente decorrente do transporte de raça não autorizada."],
] as const;

// ── Disclaimer comum (resumo das propostas do parceiro) ──
export const DISCLAIMER_COMUM = [
  "Os prazos são estimados, não determinados: dependem de órgãos públicos e privados no Brasil e no Japão (consulado, imigração, correios, Receita Federal), que a Ajisai não controla.",
  "A Ajisai não se responsabiliza por vistos ou certificados concedidos parcialmente ou negados — a decisão é exclusiva das autoridades japonesas.",
  "A emissão do visto não garante a entrada no Japão: ela é homologada pela imigração no aeroporto de chegada.",
  "Um visto ou categoria aprovados no passado não garantem a mesma aprovação agora.",
];

// ── Termos e condições (Wilson, 29/out/2026) ──
// Ponto central: pagar, enviar documentos ou ser pré-aprovado no cadastro não
// garante aprovação — a decisão é só das autoridades — e nenhum dos três
// serviços é reembolsável. O aceite no site é registrado com data, IP e
// versão dos termos; contrato digital com assinatura entra numa próxima etapa.
// Texto a revisar com o parceiro antes de publicar.
export const VERSAO_TERMOS_DOC = "documentacao-v1-2026-10-29";

export const TERMOS_VISTO_COE: [string, string][] = [
  ["Natureza do serviço", "A Ajisai presta assessoria e intermediação na preparação e no protocolo da documentação. A Ajisai não tem nenhuma relação com o consulado, a embaixada ou a imigração do Japão, nem poder de decisão sobre os processos."],
  ["Sem garantia de aprovação", "O pagamento, o envio de documentos e a pré-aprovação no cadastro não garantem a emissão do visto nem do Certificado de Elegibilidade. A análise é feita exclusivamente pelas autoridades japonesas, de acordo com os seus critérios. O visto emitido também não garante a entrada no Japão, que é homologada pela imigração no aeroporto de chegada."],
  ["Pré-análise do cadastro", "A avaliação do caso é feita com base nas respostas informadas no cadastro. Informações incompletas ou incorretas são responsabilidade do cliente. A Ajisai pode recusar casos que não atendam aos critérios mínimos, antes de qualquer pagamento."],
  ["Pagamento e reembolso", "O valor é final, sem cobrança por item. Visto: 100% na contratação. Certificado de Elegibilidade: 50% antes do início e 50% antes da entrada na imigração, em reais pela PTAX do dia do pagamento. Não há cancelamento com reembolso em nenhum momento: os serviços não são reembolsáveis, inclusive em caso de negativa, aprovação parcial, desistência ou pedido de documentos adicionais pelas autoridades."],
  ["Prazos", "Os prazos são estimados e dependem de órgãos públicos e privados no Brasil e no Japão (consulado, imigração, correios, Receita Federal), que a Ajisai não controla."],
  ["Documentos", "O cliente e o garantidor são responsáveis pela veracidade, validade e envio dos documentos solicitados. O envio por Sedex dentro do Brasil não está incluso."],
  ["Validade das condições", "As condições e valores apresentados valem por 30 dias e podem ser revistos pela Ajisai até a quitação integral do serviço. Aprovações anteriores de visto ou de categoria não garantem a mesma aprovação agora."],
];

export const TERMOS_PET: [string, string][] = [
  ["Escopo", "Documentação de exportação de cães e gatos do Brasil para o Japão. Não inclui passagem aérea, taxas da companhia aérea para o transporte do animal nem caixa transportadora. Não atendemos outros animais nem a rota Japão → Brasil."],
  ["Raças", "O tutor declara a raça real do animal, inclusive em cruzamentos, e é responsável por confirmar a aceitação pela companhia aérea. Raças braquicefálicas e as demais raças da lista de raças NÃO aceitas não são aceitas para contratação, porque as companhias aéreas recusam o embarque mesmo com a documentação pronta."],
  ["Saúde do animal", "O tutor é responsável pelo estado de saúde do animal. Os resultados de exames, como a sorologia, não dependem da Ajisai. Animais com problemas respiratórios, cardíacos ou outras condições que possam se agravar no voo podem ser recusados."],
  ["Sem garantia de aprovação", "A liberação depende da quarentena animal do Japão e das autoridades sanitárias brasileiras. Pets que não cumprirem os 180 dias após a sorologia ficam em quarentena no Japão pelo tempo que faltar."],
  ["Pagamento, cancelamento e reembolso", "Pagamento de 100% na contratação. Não há cancelamento com reembolso em nenhum momento, inclusive por desistência: os maiores custos — vacinas, exames e sorologia com envio ao laboratório nos EUA — acontecem logo no início do processo."],
  ["Única exceção: raça não aceita declarada corretamente", "Se, antes do início da prestação do serviço, a Ajisai identificar que a raça corretamente declarada pelo tutor está na lista de raças NÃO aceitas, o contrato é desfeito e 80% do valor pago é devolvido; 20% ficam retidos para cobrir custos administrativos, tributários e operacionais do desfazimento."],
  ["Declaração falsa ou omissão", "Se a raça for omitida ou declarada de forma incorreta (por exemplo, informada como sem raça definida), não há reembolso em nenhuma hipótese, e o tutor assume integralmente as consequências, incluindo a recusa de embarque pelas companhias aéreas."],
  ["Prazos", "O processo leva em média 9 meses e os prazos são estimados, pois dependem de clínicas, laboratório, companhias aéreas e órgãos oficiais."],
];
