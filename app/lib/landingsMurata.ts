// Conteúdo das landing pages de recrutamento Murata (/empregos/izumo e
// /empregos/echizen), renderizadas por app/components/empregos/LandingMurata.tsx.
//
// 07/out/2026 — v2, pedido do Wilson: "reformule a pagina, está fora dos
// nossos padrões (ex.: /produtos/passagens-aereas), falta o logo da empresa
// e tem erros graves como dizer Jutsai, comunicação sobre a Fujiarte etc.
// Simplifique a página e use as imagens" (fotos de Izumo enviadas por ele).
//
// 07/out/2026 — salário, progressão, adicionais, dias por mês e
// eletrodomésticos conferidos com as fichas oficiais enviadas pelo Wilson:
// "CSR - IZUMO (2026.07.10更新)" e "CSR - FUKUI (2026.07.03更新)".
//
// COMPLIANCE (vale para qualquer edição deste arquivo):
// - A marca é AJISAI. Não citar "Jutsai" nem a Fujiarte na página.
// - Nunca mencionar bônus trimestral, bônus/prêmio de produtividade,
//   prêmio de assiduidade ou valores não fornecidos.
// - Nunca afirmar moradia gratuita, emprego/visto/embarque/aprovação
//   garantidos.
// - Custo zero sempre "para candidatos elegíveis" e "sujeito à análise e
//   disponibilidade"; nunca linguagem de empréstimo/financiamento nem
//   "devolver depois".
// - Auxílio Embarque é uma campanha da Ajisai — nunca chamar de salário nem
//   de bônus da Murata. Não sugerir relação societária entre as empresas.

type Imagem = { src: string; alt: string };

export type Planta = {
  tipo: string;
  titulo: string;
  ambientes: string;
  indicado: string;
  aluguel: string;
  imagem: Imagem;
};

export type ConfigLanding = {
  slug: "izumo" | "echizen";
  vagaId: string;
  vagaTitulo: string;
  cidade: string;
  provincia: string;
  fabrica: string;
  meta: { titulo: string; descricao: string };
  hero: { kicker: string; titulo: string; subtitulo: string; imagem: Imagem };
  // Fatos-chave: aparecem no cartão "Resumo da vaga" (lateral no desktop).
  resumo: { rotulo: string; valor: string; detalhe?: string }[];
  vaga: {
    titulo: string;
    texto: string;
    imagem: Imagem;
    imagemDetalhe?: Imagem;
    itens: { rotulo: string; valor: string }[];
  };
  salario: {
    valor: string;
    legenda: string;
    progressao?: { faixa: string; valor: string }[];
    adicionais: string;
  };
  turnos: { texto: string; unidades?: { nome: string; diurno: string; noturno: string }[]; imagem?: Imagem };
  custoZero: { titulo: string; texto: string; itens: string[]; imagem?: Imagem };
  reentry: string;
  moradia: {
    texto: string;
    valores: { rotulo: string; valor: string }[];
    notas: string[];
    imagem?: Imagem;
    // Plantas conceituais (galeria estilo imobiliária de alto padrão).
    plantas?: Planta[];
  };
  cidadeSecao: {
    titulo: string;
    texto: string;
    imagem: Imagem;
    destaques: { titulo: string; texto: string }[];
    // Bloco extra com foto (ex.: transporte até a fábrica em Echizen).
    extra?: { imagem: Imagem; titulo: string; texto: string };
  };
  // Simulador de ganhos líquidos (Wilson, 07/out/2026: "fazer uma
  // estimativa de quanto dinheiro um trabalhador consegue gerar em reais e
  // em ienes, deduzir gastos com moradia ou algo que seja obrigatório").
  simulacao: {
    valoresHora: { rotulo: string; valor: number }[];
    turno: "fixo" | "alternado";
    // Dias trabalhados por mês na escala 4×2 (ficha CSR: Izumo ≈ 18,
    // Fukui ≈ 20). Sem valor = 20.
    diasMes?: number;
    // aluguel = ponto médio da faixa informada; contas = estimativa de
    // água/luz/gás (não informado pela operação — referência de mercado).
    moradias: { rotulo: string; aluguel: number; contas: number }[];
  };
  processo: string[];
  faq: { pergunta: string; resposta: string }[];
};

export const AUXILIO_EMBARQUE_BRL = "R$ 1.000";
export const CONDICAO_CUSTO_ZERO = "Para candidatos elegíveis, sujeito à análise e disponibilidade.";

const IMG_EMBARQUE: Imagem = { src: "/images/empregos/izumo-embarque.webp", alt: "Casal com malas caminhando no saguão de um aeroporto no Japão" };

export const LANDING_IZUMO: ConfigLanding = {
  slug: "izumo",
  vagaId: "murata-izumo",
  vagaTitulo: "Operador de máquinas / inspeção — Izumo Murata Manufacturing",
  cidade: "Izumo",
  provincia: "Shimane",
  fabrica: "Izumo Murata Manufacturing",
  meta: {
    titulo: "Trabalhe e More em Izumo — Murata | Ajisai Empregos",
    descricao:
      "Vaga na Izumo Murata Manufacturing, em Shimane, com custo inicial zero de embarque para candidatos elegíveis: passagem, documentação e preparação para o embarque.",
  },
  hero: {
    kicker: "Izumo · Shimane",
    titulo: "Trabalhe e more em Izumo",
    subtitulo: "Operador na Murata, com turno fixo e custo inicial zero de embarque para candidatos elegíveis.",
    imagem: { src: "/images/empregos/izumo-fabrica.webp", alt: "Fábrica entre campos de arroz e montanhas em Izumo, Shimane" },
  },
  resumo: [
    { rotulo: "Salário inicial", valor: "¥1.500/h", detalhe: "chega a ¥1.650/h" },
    { rotulo: "Turno", valor: "Fixo, escala 4×2", detalhe: "sem alternar dia e noite" },
    { rotulo: "Custo inicial", valor: "R$ 0", detalhe: "para candidatos elegíveis" },
    { rotulo: "Moradia", valor: "Organizada", detalhe: "aluguel a partir de ¥45.000" },
  ],
  vaga: {
    titulo: "Operador de máquinas e inspeção",
    texto:
      "Produção de componentes eletrônicos — principalmente capacitores cerâmicos, usados em smartphones, automóveis, eletrodomésticos e equipamentos diversos.",
    imagem: { src: "/images/empregos/izumo-operador.webp", alt: "Operador trabalhando em máquina de produção de componentes eletrônicos" },
    imagemDetalhe: { src: "/images/empregos/izumo-componentes.webp", alt: "Capacitores cerâmicos multicamada em close" },
    itens: [
      { rotulo: "Empresa", valor: "Izumo Murata Manufacturing" },
      { rotulo: "Local", valor: "Izumo, Shimane" },
      { rotulo: "Função", valor: "Operador de máquinas / inspeção" },
      { rotulo: "Produto", valor: "Capacitores cerâmicos" },
    ],
  },
  salario: {
    valor: "¥1.500/h",
    legenda: "Salário inicial",
    progressao: [
      { faixa: "0–12 meses", valor: "¥1.500" },
      { faixa: "13–24 meses", valor: "¥1.550" },
      { faixa: "25–36 meses", valor: "¥1.600" },
      { faixa: "37+ meses", valor: "¥1.650" },
    ],
    adicionais: "Adicionais legais: hora extra +25%, horário noturno (22h–5h) +25%, domingos +35%. Mesmo valor para homens e mulheres. Pagamento todo dia 15, referente ao mês anterior.",
  },
  turnos: {
    texto:
      "Em Izumo há dois turnos fixos (diurno ou noturno), sem alternar entre dia e noite: 4 dias de trabalho para 2 de folga, cerca de 18 dias trabalhados por mês. Horário definido na alocação.",
  },
  custoZero: {
    titulo: "Custo inicial zero",
    texto: "Seu projeto no Japão não precisa começar com uma grande despesa.",
    itens: ["Passagem aérea", "Assessoria", "Documentação", "Preparação para o embarque"],
    imagem: IMG_EMBARQUE,
  },
  reentry:
    "Já tem reentry válido e pode embarcar logo? Candidatos elegíveis podem receber o Auxílio Embarque Ajisai, conforme as condições da campanha vigente.",
  moradia: {
    texto: "Apartamentos para solteiros, casais ou famílias (1K a 3DK), conforme composição familiar e disponibilidade.",
    valores: [
      { rotulo: "1K / 1DK sem internet", valor: "¥45.000 – ¥55.000" },
      { rotulo: "1K / 1DK com internet", valor: "¥60.000 – ¥65.000" },
      { rotulo: "2DK ou maior", valor: "¥55.000 – ¥75.000" },
    ],
    notas: [
      "Aluguel mensal aproximado, pago pelo trabalhador. Água, luz e gás à parte.",
      "Todos os imóveis têm ar-condicionado. No Leopalace, TV, geladeira e máquina de lavar já estão incluídas no aluguel. Nos demais, geladeira e máquina de lavar já vêm no apartamento por ¥1.550/mês cada (TV opcional, ¥2.350/mês) e podem ser devolvidas se não forem necessárias.",
      "Do apartamento até a fábrica: cerca de 20 minutos a pé ou 30 minutos no ônibus fretado.",
    ],
    imagem: { src: "/images/empregos/izumo-moradia.webp", alt: "Apartamento 1K mobiliado no Japão, com cozinha compacta e quarto" },
    // Plantas enviadas pelo Wilson em 07/out/2026 ("as 5 plantas de Izumo,
    // deixe parecido com imobiliária de alto padrão como Cyrela").
    // Aluguel = faixas de referência acima; "indicado" conforme a
    // composição familiar, sempre sujeito à disponibilidade.
    plantas: [
      {
        tipo: "1K",
        titulo: "1 quarto + cozinha compacta",
        ambientes: "Quarto, cozinha no corredor, banho, WC e varanda",
        indicado: "Solteiros",
        aluguel: "¥45.000 – ¥65.000",
        imagem: { src: "/images/empregos/izumo-planta-1k.webp", alt: "Planta conceitual de apartamento 1K em Izumo" },
      },
      {
        tipo: "1DK",
        titulo: "1 quarto + cozinha separada",
        ambientes: "Quarto, cozinha com mesa, banho, WC, armário e varanda",
        indicado: "Solteiros ou casais",
        aluguel: "¥45.000 – ¥65.000",
        imagem: { src: "/images/empregos/izumo-planta-1dk.webp", alt: "Planta conceitual de apartamento 1DK em Izumo" },
      },
      {
        tipo: "2DK",
        titulo: "2 quartos + cozinha separada",
        ambientes: "2 quartos, cozinha com mesa, banho, WC e varanda",
        indicado: "Casais ou famílias pequenas",
        aluguel: "¥55.000 – ¥75.000",
        imagem: { src: "/images/empregos/izumo-planta-2dk.webp", alt: "Planta conceitual de apartamento 2DK em Izumo" },
      },
      {
        tipo: "2LDK",
        titulo: "2 quartos + sala + cozinha",
        ambientes: "2 quartos, sala integrada à cozinha, banho, WC e varanda",
        indicado: "Famílias",
        aluguel: "¥55.000 – ¥75.000",
        imagem: { src: "/images/empregos/izumo-planta-2ldk.webp", alt: "Planta conceitual de apartamento 2LDK em Izumo" },
      },
      {
        tipo: "3DK",
        titulo: "3 quartos + cozinha separada",
        ambientes: "3 quartos, cozinha com mesa, banho, WC e varanda",
        indicado: "Famílias maiores",
        aluguel: "¥55.000 – ¥75.000",
        imagem: { src: "/images/empregos/izumo-planta-3dk.webp", alt: "Planta conceitual de apartamento 3DK em Izumo" },
      },
    ],
  },
  cidadeSecao: {
    titulo: "Viver em Izumo",
    texto:
      "Izumo fica em Shimane, região de natureza, história e forte ligação com a mitologia japonesa — com supermercados, shoppings, hospitais e restaurantes para o dia a dia.",
    imagem: { src: "/images/empregos/izumo-cidade.webp", alt: "Rua residencial tranquila em Izumo, com casas e montanhas ao fundo" },
    destaques: [
      { titulo: "Izumo Taisha", texto: "Um dos santuários mais antigos do Japão" },
      { titulo: "Natureza", texto: "Montanhas, mar e quatro estações" },
      { titulo: "Onsen", texto: "Águas termais para os dias de folga" },
    ],
  },
  simulacao: {
    valoresHora: [
      { rotulo: "0–12 meses", valor: 1500 },
      { rotulo: "13–24 meses", valor: 1550 },
      { rotulo: "25–36 meses", valor: 1600 },
      { rotulo: "37+ meses", valor: 1650 },
    ],
    turno: "fixo",
    diasMes: 18,
    moradias: [
      { rotulo: "1K / 1DK sem internet", aluguel: 50000, contas: 12000 },
      { rotulo: "1K / 1DK com internet", aluguel: 62500, contas: 12000 },
      { rotulo: "2DK ou maior", aluguel: 65000, contas: 18000 },
    ],
  },
  processo: ["Candidatura pela vaga", "Processo seletivo", "Documentação e preparação", "Embarque para o Japão"],
  faq: [
    {
      pergunta: "Preciso pagar a passagem aérea?",
      resposta: "Para candidatos elegíveis dentro desta campanha, a passagem faz parte da estrutura de embarque, sem cobrança inicial ao candidato.",
    },
    {
      pergunta: "O apartamento é gratuito?",
      resposta: "Não. A moradia é organizada, mas o aluguel e as despesas de consumo são de responsabilidade do trabalhador.",
    },
    {
      pergunta: "Posso ir com meu cônjuge?",
      resposta: "Existem apartamentos para solteiros e famílias, mas a viabilidade é analisada individualmente.",
    },
    { pergunta: "Preciso falar japonês?", resposta: "Os requisitos linguísticos serão avaliados de acordo com o perfil e a vaga." },
    {
      pergunta: "Tenho reentry. Tenho alguma vantagem?",
      resposta: `Com a documentação pronta, o embarque pode ser mais rápido e, quando elegível à campanha vigente, você pode receber o Auxílio Embarque Ajisai de ${AUXILIO_EMBARQUE_BRL}.`,
    },
  ],
};

export const LANDING_ECHIZEN: ConfigLanding = {
  slug: "echizen",
  vagaId: "murata-echizen",
  vagaTitulo: "Operador de máquinas / inspeção — Fukui Murata Manufacturing",
  cidade: "Echizen",
  provincia: "Fukui",
  fabrica: "Fukui Murata Manufacturing",
  meta: {
    titulo: "Trabalhe e More em Echizen — Murata | Ajisai Empregos",
    descricao:
      "Vaga na Fukui Murata Manufacturing, em Echizen, com custo inicial zero de embarque para candidatos elegíveis: passagem, documentação e preparação para o embarque.",
  },
  hero: {
    kicker: "Echizen · Fukui",
    titulo: "Trabalhe e more em Echizen",
    subtitulo: "Operador na Murata, com salário que cresce com o tempo de casa e custo inicial zero de embarque para candidatos elegíveis.",
    imagem: { src: "/images/empregos/echizen-fabrica.webp", alt: "Fábrica entre campos de arroz e montanhas com neblina em Echizen, Fukui" },
  },
  resumo: [
    { rotulo: "Salário inicial", valor: "¥1.500/h", detalhe: "chega a ¥1.650/h" },
    { rotulo: "Turno", valor: "Alternado, 4×2", detalhe: "diurno e noturno" },
    { rotulo: "Custo inicial", valor: "R$ 0", detalhe: "para candidatos elegíveis" },
    { rotulo: "Moradia", valor: "Organizada", detalhe: "aluguel a partir de ¥40.000" },
  ],
  vaga: {
    titulo: "Operador de máquinas e inspeção",
    texto: "Produção de componentes eletrônicos usados em smartphones, automóveis, aparelhos eletrônicos e equipamentos tecnológicos.",
    imagem: { src: "/images/empregos/echizen-operador.webp", alt: "Operadora inspecionando placas eletrônicas em estação com microscópio" },
    imagemDetalhe: { src: "/images/empregos/izumo-componentes.webp", alt: "Capacitores cerâmicos multicamada em close" },
    itens: [
      { rotulo: "Empresa", valor: "Fukui Murata Manufacturing" },
      { rotulo: "Local", valor: "Echizen, Fukui" },
      { rotulo: "Função", valor: "Operador de máquinas / inspeção" },
      { rotulo: "Produto", valor: "Componentes eletrônicos" },
    ],
  },
  salario: {
    valor: "¥1.500/h",
    legenda: "Salário inicial de referência",
    progressao: [
      { faixa: "0–12 meses", valor: "¥1.500" },
      { faixa: "13–24 meses", valor: "¥1.550" },
      { faixa: "25–36 meses", valor: "¥1.600" },
      { faixa: "37+ meses", valor: "¥1.650" },
    ],
    adicionais: "Adicionais legais: hora extra +25%, horário noturno +25%, domingos e descanso legal +35%. Valores sujeitos à confirmação na contratação.",
  },
  turnos: {
    texto: "Escala 4×2 (4 dias de trabalho, 2 de folga), alternando períodos diurnos e noturnos. Horários e unidade confirmados durante o processo.",
    unidades: [
      { nome: "Unidade Okamoto", diurno: "8:50 – 19:00", noturno: "20:50 – 7:00" },
      { nome: "Unidade Miyazaki", diurno: "8:30 – 18:40", noturno: "20:30 – 6:40" },
    ],
    imagem: { src: "/images/empregos/echizen-turnos.webp", alt: "A mesma fábrica de dia e à noite, representando os turnos diurno e noturno" },
  },
  custoZero: {
    titulo: "Custo inicial zero",
    texto: "Comece seu projeto no Japão sem uma grande despesa inicial.",
    itens: ["Passagem aérea", "Assessoria", "Documentação", "Preparação para o embarque"],
    imagem: IMG_EMBARQUE,
  },
  reentry:
    "Já tem reentry válido e pode embarcar logo? Candidatos elegíveis podem receber o Auxílio Embarque Ajisai, conforme as condições da campanha vigente.",
  moradia: {
    texto:
      "A maioria das moradias fica em Echizen e Sabae, de 1K a 3DK, conforme perfil familiar e disponibilidade. Na chegada, um kit de boas-vindas com utensílios, higiene, cozinha e futon.",
    valores: [
      { rotulo: "1K / 1DK", valor: "¥40.000 – ¥65.000" },
      { rotulo: "2DK ou maior", valor: "¥50.000 – ¥80.000" },
      { rotulo: "Leopalace", valor: "≈ ¥50.000 – ¥55.000" },
    ],
    notas: [
      "Aluguel mensal aproximado, pago pelo trabalhador. Água, luz e gás à parte.",
      "Todos os imóveis têm ar-condicionado. No Leopalace, TV, geladeira, máquina de lavar e micro-ondas já estão incluídos no aluguel. Nos demais, geladeira e máquina de lavar podem ser alugadas por ¥1.550/mês cada.",
    ],
    imagem: { src: "/images/empregos/echizen-moradia.webp", alt: "Apartamento 1DK mobiliado no Japão, com cozinha, geladeira, máquina de lavar e sala" },
    // Plantas enviadas pelo Wilson em 07/out/2026 (mesmo tratamento de Izumo).
    plantas: [
      {
        tipo: "1K",
        titulo: "1 quarto + cozinha compacta",
        ambientes: "Quarto, cozinha no corredor, banho, WC, armário e varanda",
        indicado: "Solteiros",
        aluguel: "¥40.000 – ¥65.000",
        imagem: { src: "/images/empregos/echizen-planta-1k.webp", alt: "Planta conceitual de apartamento 1K em Echizen" },
      },
      {
        tipo: "1DK",
        titulo: "1 quarto + cozinha separada",
        ambientes: "Quarto, cozinha com mesa, banho, WC, armário e varanda",
        indicado: "Solteiros ou casais",
        aluguel: "¥40.000 – ¥65.000",
        imagem: { src: "/images/empregos/echizen-planta-1dk.webp", alt: "Planta conceitual de apartamento 1DK em Echizen" },
      },
      {
        tipo: "2DK",
        titulo: "2 quartos + cozinha separada",
        ambientes: "2 quartos, cozinha com mesa, banho, WC e varanda",
        indicado: "Casais ou famílias pequenas",
        aluguel: "¥50.000 – ¥80.000",
        imagem: { src: "/images/empregos/echizen-planta-2dk.webp", alt: "Planta conceitual de apartamento 2DK em Echizen" },
      },
      {
        tipo: "2LDK",
        titulo: "2 quartos + sala + cozinha",
        ambientes: "2 quartos, sala integrada à cozinha, banho, WC e varanda",
        indicado: "Famílias",
        aluguel: "¥50.000 – ¥80.000",
        imagem: { src: "/images/empregos/echizen-planta-2ldk.webp", alt: "Planta conceitual de apartamento 2LDK em Echizen" },
      },
      {
        tipo: "3DK",
        titulo: "3 quartos + cozinha separada",
        ambientes: "3 quartos, cozinha com mesa, banho, WC e varanda",
        indicado: "Famílias maiores",
        aluguel: "¥50.000 – ¥80.000",
        imagem: { src: "/images/empregos/echizen-planta-3dk.webp", alt: "Planta conceitual de apartamento 3DK em Echizen" },
      },
    ],
  },
  cidadeSecao: {
    titulo: "Por que Echizen",
    texto:
      "Uma vida mais tranquila em Fukui, entre o Mar do Japão e as montanhas, com supermercados, hospitais e boa conexão regional.",
    imagem: { src: "/images/empregos/echizen-cidade.webp", alt: "Rua residencial tranquila em Echizen, com casas e montanhas ao fundo" },
    destaques: [
      { titulo: "Natureza", texto: "Litoral, montanhas e quatro estações" },
      { titulo: "Tranquilidade", texto: "Menos congestionada que os grandes centros" },
      { titulo: "Estrutura", texto: "Comércio e saúde perto das moradias" },
    ],
    extra: {
      imagem: { src: "/images/empregos/echizen-transporte.webp", alt: "Trabalhadores embarcando em micro-ônibus em frente ao prédio de apartamentos" },
      titulo: "Transporte até a fábrica",
      texto: "Dependendo da unidade e da moradia, há deslocamento organizado. Na unidade Miyazaki há transporte entre apartamento e fábrica.",
    },
  },
  simulacao: {
    valoresHora: [
      { rotulo: "0–12 meses", valor: 1500 },
      { rotulo: "13–24 meses", valor: 1550 },
      { rotulo: "25–36 meses", valor: 1600 },
      { rotulo: "37+ meses", valor: 1650 },
    ],
    turno: "alternado",
    diasMes: 20,
    moradias: [
      { rotulo: "1K / 1DK", aluguel: 52500, contas: 12000 },
      { rotulo: "2DK ou maior", aluguel: 65000, contas: 18000 },
      { rotulo: "Leopalace", aluguel: 52500, contas: 12000 },
    ],
  },
  processo: ["Candidatura pela vaga", "Entrevista e análise da vaga", "Documentação", "Preparação e viagem", "Integração e início"],
  faq: [
    {
      pergunta: "O embarque pode mesmo ter custo inicial zero?",
      resposta: "Para candidatos elegíveis dentro da campanha, passagem aérea e preparação fazem parte da estrutura de embarque, sem cobrança inicial.",
    },
    {
      pergunta: "Preciso pagar aluguel?",
      resposta: "Sim. A moradia é organizada, mas aluguel e despesas como água, energia e gás são de responsabilidade do trabalhador.",
    },
    {
      pergunta: "Posso ir com minha família?",
      resposta: "Existem apartamentos para diferentes composições familiares; disponibilidade e elegibilidade são avaliadas individualmente.",
    },
    { pergunta: "Preciso falar japonês?", resposta: "Os requisitos linguísticos serão avaliados de acordo com o perfil e a vaga." },
    {
      pergunta: "Já tenho reentry. O que muda?",
      resposta: `Com a documentação pronta, o processo pode ser mais rápido e você pode se enquadrar no Auxílio Embarque Ajisai de ${AUXILIO_EMBARQUE_BRL}, conforme as condições da campanha.`,
    },
  ],
};

// Hot site de cada vaga do catálogo (a página própria da vaga linka para
// cá, e o hot site lista a vaga — Wilson, 07/out/2026).
export const LANDINGS_MURATA: ConfigLanding[] = [LANDING_IZUMO, LANDING_ECHIZEN];
export const HOTSITE_POR_VAGA: Record<string, string> = Object.fromEntries(
  LANDINGS_MURATA.map((l) => [l.vagaId, `/empregos/${l.slug}`]),
);
