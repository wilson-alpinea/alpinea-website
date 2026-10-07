// Conteúdo das landing pages de recrutamento Murata — Wilson, 07/out/2026:
// "agora vamos criar o site que irá abrir ao clicar nesses dois banners,
// teremos 1 pra Echizen e outro para Izumo" (briefings completos enviados
// por ele na mesma mensagem). Renderizadas por
// app/components/empregos/LandingMurata.tsx em /empregos/izumo e
// /empregos/echizen.
//
// COMPLIANCE (regra do Wilson, vale para qualquer edição deste arquivo):
// - Nunca mencionar bônus trimestral, bônus/prêmio de produtividade,
//   prêmio de assiduidade ou valores não fornecidos.
// - Nunca afirmar moradia gratuita, emprego/visto/embarque/aprovação
//   garantidos.
// - Custo zero sempre "para candidatos elegíveis"; nunca linguagem de
//   empréstimo/financiamento nem "devolver depois".
// - O Auxílio Embarque é da Jutsai — nunca atribuir à Murata/Fujiarte.

export type IconeLanding =
  | "aviao"
  | "documento"
  | "assessoria"
  | "mala"
  | "relogio"
  | "fabrica"
  | "casa"
  | "chip"
  | "natureza"
  | "mar"
  | "montanha"
  | "santuario"
  | "onsen"
  | "comercio"
  | "saude"
  | "transporte"
  | "cidade"
  | "kit";

export type CampoFormulario = "estadoSeparado" | "ondeEsta";

export type ConfigLanding = {
  slug: "izumo" | "echizen";
  vagaId: string;
  vagaTitulo: string;
  cidade: string;
  provincia: string;
  fabrica: string;
  meta: { titulo: string; descricao: string };
  hero: {
    eyebrow: string;
    titulo: string;
    subtitulo: string;
    ctaPrimario: string;
    ctaSecundario: string;
    ctaSecundarioAlvo: string;
    imagem: string;
    imagemAlt: string;
    // Posição do recorte no celular (a foto é larga).
    posicaoMobile: string;
  };
  destaques: { kicker: string; titulo: string; texto?: string; cards: { icone: IconeLanding; titulo: string; texto: string }[] };
  vaga: {
    titulo: string;
    texto?: string;
    imagem: string;
    imagemAlt: string;
    itens: { rotulo: string; valor: string }[];
    usos: string[];
  };
  salario: {
    titulo: string;
    valor: string;
    legenda: string;
    progressao?: { faixa: string; valor: string }[];
    notaProgressao?: string;
    adicionais: { rotulo: string; valor?: string }[];
    textoAdicionais: string;
  };
  turnos: {
    titulo: string;
    texto: string;
    escala: ("trabalho" | "folga")[];
    alternado: boolean;
    unidades?: { nome: string; horarios: { rotulo: string; horario: string }[] }[];
    nota: string;
  };
  custoZero: { titulo: string; condicoes: string[]; cta?: string };
  reentry: { titulo: string; texto: string };
  moradia: {
    titulo: string;
    texto: string;
    tipos: string[];
    valores: { rotulo: string; valor: string }[];
    notas: string[];
  };
  kit?: { titulo: string; texto: string; itens: string[] };
  cidadeSecao: {
    id: string;
    kicker: string;
    titulo: string;
    texto: string[];
    imagem: string;
    imagemAlt: string;
    blocos: { icone: IconeLanding; titulo: string; texto: string }[];
  };
  apoio?: { titulo: string; cards: { icone: IconeLanding; titulo: string; texto: string }[] };
  processo: { titulo: string; passos: { titulo: string; texto?: string }[]; cta: string };
  murata?: { titulo: string; texto: string };
  faq: { pergunta: string; resposta: string }[];
  final: { titulo: string; texto: string; cta: string; rodape: string };
  formulario: { titulo: string; texto: string; botao: string; campos: CampoFormulario[] };
};

const ESCALA_4X2: ("trabalho" | "folga")[] = ["trabalho", "trabalho", "trabalho", "trabalho", "folga", "folga"];

export const AUXILIO_EMBARQUE_BRL = "R$ 1.000";

export const LANDING_IZUMO: ConfigLanding = {
  slug: "izumo",
  vagaId: "murata-izumo",
  vagaTitulo: "Operador de máquinas / inspeção — Izumo Murata Manufacturing",
  cidade: "Izumo",
  provincia: "Shimane",
  fabrica: "Izumo Murata Manufacturing",
  meta: {
    titulo: "Trabalhe e More em Izumo — Murata | Recrutamento Jutsai",
    descricao:
      "Vaga na Izumo Murata Manufacturing, em Shimane, com custo inicial zero de embarque para candidatos elegíveis: passagem, documentação e suporte incluídos.",
  },
  hero: {
    eyebrow: "Izumo · Shimane · Japão",
    titulo: "Seu próximo capítulo pode começar no Japão.",
    subtitulo:
      "Trabalhe na Murata em Izumo com passagem aérea, documentação e suporte de embarque incluídos para candidatos elegíveis.",
    ctaPrimario: "Quero saber se sou elegível",
    ctaSecundario: "Conhecer a vaga",
    ctaSecundarioAlvo: "vaga",
    imagem: "/images/empregos/lp-izumo-hero.webp",
    imagemAlt: "Izumo, com o Grande Santuário e a fábrica da Murata entre montanhas, e operadores na linha de produção",
    posicaoMobile: "object-[22%_50%]",
  },
  destaques: {
    kicker: "Por que esta vaga é especial",
    titulo: "Uma das nossas principais oportunidades no Japão.",
    texto: "Izumo reúne o que mais pesa na decisão de quem vai começar no Japão: embarque sem custo inicial para candidatos elegíveis, turno fixo e uma operação de grande porte.",
    cards: [
      { icone: "aviao", titulo: "Custo inicial zero", texto: "Passagem aérea, assessoria e preparação documental incluídas para candidatos elegíveis." },
      { icone: "relogio", titulo: "Turno fixo", texto: "Um dos grandes diferenciais de Izumo: a possibilidade de trabalhar em turno fixo, com uma rotina mais previsível." },
      { icone: "fabrica", titulo: "Empresa japonesa de grande porte", texto: "Trabalho na operação da Murata, referência global em componentes eletrônicos." },
      { icone: "casa", titulo: "Moradia organizada", texto: "A Fujiarte organiza apartamentos para solteiros, casais ou famílias, conforme disponibilidade." },
    ],
  },
  vaga: {
    titulo: "Trabalhe na fabricação de componentes que estão em milhões de produtos.",
    imagem: "/images/empregos/lp-izumo-fabrica.webp",
    imagemAlt: "Operadores com uniforme da Murata na linha de produção",
    itens: [
      { rotulo: "Função", valor: "Operador de máquinas / inspeção" },
      { rotulo: "Setor", valor: "Fabricação de componentes eletrônicos" },
      { rotulo: "Produto", valor: "Principalmente capacitores cerâmicos" },
      { rotulo: "Local", valor: "Izumo Murata Manufacturing — Izumo, Shimane" },
      { rotulo: "Contratação", valor: "Fujiarte, com alocação na operação da Murata" },
    ],
    usos: ["Smartphones", "Automóveis", "Eletrodomésticos", "Equipamentos diversos"],
  },
  salario: {
    titulo: "Salário inicial",
    valor: "¥1.500/h",
    legenda: "salário inicial",
    adicionais: [{ rotulo: "Hora extra" }, { rotulo: "Trabalho noturno" }, { rotulo: "Dias de descanso legal" }],
    textoAdicionais: "Além do valor por hora, existem os adicionais previstos na lei japonesa, aplicados conforme a jornada.",
  },
  turnos: {
    titulo: "Uma rotina mais previsível.",
    texto: "Em Izumo existem opções de turno fixo — sem alternar entre dia e noite. A escala de referência é de 4 dias de trabalho para 2 de folga.",
    escala: ESCALA_4X2,
    alternado: false,
    nota: "Horários e turno definidos na alocação, conforme a vaga.",
  },
  custoZero: {
    titulo: "Seu projeto de trabalhar no Japão não precisa começar com uma grande despesa.",
    condicoes: ["O processo está sujeito à análise de elegibilidade, aprovação da vaga e disponibilidade."],
  },
  reentry: {
    titulo: "Já tem reentry? Seu embarque pode acontecer ainda mais rápido.",
    texto: "Candidatos elegíveis que já possuem reentry válido e estão prontos para embarcar podem receber o Auxílio Embarque Jutsai — uma campanha exclusiva da Jutsai.",
  },
  moradia: {
    titulo: "Chegue ao Japão sabendo onde vai morar.",
    texto: "A Fujiarte organiza a moradia em Izumo. O tipo de imóvel depende da composição familiar e da disponibilidade.",
    tipos: ["1K", "1DK", "2DK", "2LDK", "3DK"],
    valores: [
      { rotulo: "1K / 1DK sem internet", valor: "¥45.000 – ¥55.000" },
      { rotulo: "1K / 1DK com internet", valor: "¥60.000 – ¥65.000" },
      { rotulo: "2DK ou maior", valor: "¥55.000 – ¥75.000" },
    ],
    notas: [
      "Valores aproximados de aluguel mensal, de responsabilidade do trabalhador.",
      "Água, luz e gás são cobrados separadamente.",
      "Alguns imóveis já têm equipamentos domésticos; em outros, os equipamentos podem ser disponibilizados ou alugados conforme a modalidade do apartamento.",
    ],
  },
  cidadeSecao: {
    id: "izumo",
    kicker: "Viver em Izumo",
    titulo: "Conheça Izumo.",
    texto: [
      "Izumo está em Shimane, região conhecida pela natureza, pela história e pela forte ligação com a mitologia japonesa.",
      "A cidade tem supermercados, shopping centers, hospitais, restaurantes e toda a estrutura para a vida cotidiana.",
    ],
    imagem: "/images/empregos/lp-izumo-cidade.webp",
    imagemAlt: "Vista de Izumo com o Grande Santuário de Izumo, campos de arroz e montanhas",
    blocos: [
      { icone: "santuario", titulo: "Izumo Taisha", texto: "Um dos santuários mais antigos e importantes do Japão." },
      { icone: "montanha", titulo: "Natureza", texto: "Montanhas, campos de arroz e quatro estações." },
      { icone: "mar", titulo: "Mar", texto: "Litoral do Mar do Japão a poucos minutos." },
      { icone: "cidade", titulo: "Cidade", texto: "Centro urbano com serviços e transporte regional." },
      { icone: "comercio", titulo: "Comércio", texto: "Supermercados, shoppings e restaurantes." },
      { icone: "onsen", titulo: "Onsen", texto: "Águas termais para os dias de folga." },
    ],
  },
  processo: {
    titulo: "Sua chegada, passo a passo.",
    passos: [
      { titulo: "Pré-análise", texto: "Verificamos elegibilidade e documentação." },
      { titulo: "Processo seletivo", texto: "Seu perfil é apresentado para a oportunidade adequada." },
      { titulo: "Documentação e preparação", texto: "A equipe acompanha as etapas necessárias." },
      { titulo: "Embarque para o Japão", texto: "Após aprovação e liberação do processo." },
    ],
    cta: "Quero iniciar minha pré-análise",
  },
  faq: [
    {
      pergunta: "Preciso pagar a passagem aérea?",
      resposta: "Para candidatos elegíveis dentro desta campanha, a passagem faz parte da estrutura de embarque organizada sem cobrança inicial ao candidato.",
    },
    {
      pergunta: "O apartamento é gratuito?",
      resposta: "Não. A moradia é organizada pela estrutura da operação, mas aluguel e despesas de consumo são de responsabilidade do trabalhador.",
    },
    {
      pergunta: "Posso ir com meu cônjuge?",
      resposta: "Existem modalidades de apartamento para solteiros e famílias, mas a viabilidade deve ser analisada individualmente.",
    },
    { pergunta: "Preciso falar japonês?", resposta: "Os requisitos linguísticos serão avaliados de acordo com o perfil e a vaga." },
    {
      pergunta: "Quem me contrata?",
      resposta: "A contratação e a gestão do trabalhador no Japão são realizadas pela Fujiarte, com alocação na operação da Murata.",
    },
    {
      pergunta: "Tenho reentry. Tenho alguma vantagem?",
      resposta: `Candidatos com documentação pronta podem ter um processo de embarque mais rápido e, quando elegíveis à campanha vigente, podem receber o Auxílio Embarque Jutsai de ${AUXILIO_EMBARQUE_BRL}.`,
    },
  ],
  final: {
    titulo: "O Japão pode estar mais perto do que você imagina.",
    texto: "Faça uma pré-análise gratuita e descubra se você pode participar da campanha.",
    cta: "Verificar minha elegibilidade",
    rodape: "Sem compromisso.",
  },
  formulario: {
    titulo: "Pré-candidatura",
    texto: "Leva menos de 1 minuto. Nossa equipe responde pelo WhatsApp.",
    botao: "Enviar pré-candidatura",
    campos: [],
  },
};

export const LANDING_ECHIZEN: ConfigLanding = {
  slug: "echizen",
  vagaId: "murata-echizen",
  vagaTitulo: "Operador de máquinas / inspeção — Fukui Murata Manufacturing",
  cidade: "Echizen",
  provincia: "Fukui",
  fabrica: "Fukui Murata Manufacturing",
  meta: {
    titulo: "Trabalhe e More em Echizen — Murata | Recrutamento Jutsai",
    descricao:
      "Vaga na Fukui Murata Manufacturing, em Echizen, com custo inicial zero de embarque para candidatos elegíveis: passagem, documentação e suporte incluídos.",
  },
  hero: {
    eyebrow: "Trabalhe e more no Japão",
    titulo: "Já pensou em morar e trabalhar em Echizen?",
    subtitulo:
      "Faça parte da operação da Murata em Fukui e embarque com passagem aérea, documentação e suporte incluídos para candidatos elegíveis.",
    ctaPrimario: "Quero saber se posso participar",
    ctaSecundario: "Conhecer Echizen",
    ctaSecundarioAlvo: "echizen",
    imagem: "/images/empregos/lp-echizen-hero.webp",
    imagemAlt: "Echizen com rio, cerejeiras e montanhas ao lado da fábrica da Murata, e operadores na linha de produção",
    posicaoMobile: "object-[24%_50%]",
  },
  destaques: {
    kicker: "Uma nova rotina no Japão",
    titulo: "Trabalho, moradia e estrutura para começar uma nova etapa.",
    texto: "Trabalhe em uma grande indústria japonesa e construa uma nova rotina em uma das regiões mais tranquilas do Japão.",
    cards: [
      { icone: "aviao", titulo: "Passagem aérea incluída", texto: "Para candidatos elegíveis." },
      { icone: "documento", titulo: "Assessoria documental", texto: "Acompanhamento durante toda a preparação." },
      { icone: "casa", titulo: "Moradia organizada", texto: "Opções para solteiros, casais e famílias." },
      { icone: "fabrica", titulo: "Grande indústria japonesa", texto: "Fabricação de componentes eletrônicos." },
    ],
  },
  vaga: {
    titulo: "A oportunidade: Fukui Murata Manufacturing.",
    texto: "Produção de componentes eletrônicos usados em produtos do mundo inteiro.",
    imagem: "/images/empregos/lp-echizen-fabrica.webp",
    imagemAlt: "Operadores com uniforme da Murata na linha de produção",
    itens: [
      { rotulo: "Empresa", valor: "Fukui Murata Manufacturing" },
      { rotulo: "Local", valor: "Echizen-shi, Fukui-ken" },
      { rotulo: "Funções", valor: "Operador de máquinas · Inspeção" },
      { rotulo: "Atividade", valor: "Produção de componentes eletrônicos" },
      { rotulo: "Contratação", valor: "Fujiarte, com alocação na operação da Murata" },
    ],
    usos: ["Smartphones", "Automóveis", "Aparelhos eletrônicos", "Equipamentos tecnológicos"],
  },
  salario: {
    titulo: "Salário com progressão por tempo de empresa.",
    valor: "¥1.500/h",
    legenda: "salário inicial de referência no turno alternado",
    progressao: [
      { faixa: "0–12 meses", valor: "¥1.500/h" },
      { faixa: "13–24 meses", valor: "¥1.550/h" },
      { faixa: "25–36 meses", valor: "¥1.600/h" },
      { faixa: "37+ meses", valor: "¥1.650/h" },
    ],
    notaProgressao: "Valores de referência conforme as condições fornecidas pela operação e sujeitos à confirmação no momento da contratação.",
    adicionais: [
      { rotulo: "Hora extra", valor: "+25%" },
      { rotulo: "Horário noturno", valor: "+25%" },
      { rotulo: "Domingos / descanso legal", valor: "+35%" },
    ],
    textoAdicionais: "Adicionais legais aplicados sobre o valor por hora, conforme a jornada.",
  },
  turnos: {
    titulo: "Turnos alternados em escala 4×2.",
    texto: "O regime padrão alterna períodos diurnos e noturnos: 4 dias de trabalho, 2 dias de folga.",
    escala: ESCALA_4X2,
    alternado: true,
    unidades: [
      {
        nome: "Unidade Okamoto",
        horarios: [
          { rotulo: "Diurno", horario: "8:50 – 19:00" },
          { rotulo: "Noturno", horario: "20:50 – 7:00" },
        ],
      },
      {
        nome: "Unidade Miyazaki",
        horarios: [
          { rotulo: "Diurno", horario: "8:30 – 18:40" },
          { rotulo: "Noturno", horario: "20:30 – 6:40" },
        ],
      },
    ],
    nota: "Os horários e a alocação final serão confirmados durante o processo.",
  },
  custoZero: {
    titulo: "Comece seu projeto Japão sem uma grande despesa inicial.",
    condicoes: ["Elegibilidade", "Aprovação no processo", "Documentação", "Disponibilidade da vaga"],
    cta: "Fazer pré-análise",
  },
  reentry: {
    titulo: "Tem reentry e pode embarcar rápido?",
    texto: "Candidatos elegíveis que já possuem reentry válido podem se enquadrar na campanha de auxílio embarque da Jutsai.",
  },
  moradia: {
    titulo: "Uma estrutura preparada para quem está começando a vida no Japão.",
    texto: "A maioria das moradias fica em Echizen e Sabae. O tipo de imóvel depende do perfil familiar e da disponibilidade.",
    tipos: ["1K", "1DK", "2DK", "2LDK", "3DK"],
    valores: [
      { rotulo: "1K / 1DK", valor: "¥40.000 – ¥65.000" },
      { rotulo: "2DK ou maior", valor: "¥50.000 – ¥80.000" },
      { rotulo: "Leopalace", valor: "≈ ¥50.000 – ¥55.000" },
    ],
    notas: ["Valores aproximados de aluguel mensal, de responsabilidade do trabalhador.", "Água, luz e gás são pagos separadamente."],
  },
  kit: {
    titulo: "Kit de boas-vindas disponibilizado pela operação.",
    texto: "Para facilitar os primeiros dias, itens básicos de chegada podem incluir:",
    itens: ["Utensílios", "Produtos de higiene", "Itens para cozinha", "Futon", "Itens domésticos"],
  },
  cidadeSecao: {
    id: "echizen",
    kicker: "Por que Echizen?",
    titulo: "Uma vida mais tranquila, sem abrir mão da infraestrutura japonesa.",
    texto: [
      "Echizen fica em Fukui, entre o litoral do Mar do Japão e as montanhas — com pesca, ski no inverno, comércio, supermercados e hospitais por perto.",
    ],
    imagem: "/images/empregos/lp-echizen-cidade.webp",
    imagemAlt: "Echizen com rio, ponte, cerejeiras floridas e montanhas nevadas ao fundo",
    blocos: [
      { icone: "natureza", titulo: "Natureza", texto: "Fukui tem litoral, montanhas e quatro estações bem definidas." },
      { icone: "casa", titulo: "Qualidade de vida", texto: "Uma região menos congestionada e mais tranquila que os grandes centros." },
      { icone: "transporte", titulo: "Acesso", texto: "Boa conexão regional com outras áreas do Japão." },
    ],
  },
  apoio: {
    titulo: "Apoio ao trabalhador.",
    cards: [
      {
        icone: "transporte",
        titulo: "Transporte",
        texto: "Dependendo da unidade e da moradia, há opções de deslocamento organizadas. Na unidade Miyazaki há transporte entre apartamento e fábrica.",
      },
      { icone: "comercio", titulo: "Comércio", texto: "Supermercados, restaurantes e serviços próximos às áreas residenciais." },
      { icone: "saude", titulo: "Saúde", texto: "Hospitais na região e orientação da equipe em situações que exijam suporte." },
      { icone: "casa", titulo: "Moradia", texto: "Opções conforme o perfil familiar e a disponibilidade." },
    ],
  },
  processo: {
    titulo: "Do Brasil à fábrica, em seis etapas.",
    passos: [
      { titulo: "Pré-análise do perfil" },
      { titulo: "Entrevista e análise da vaga" },
      { titulo: "Documentação" },
      { titulo: "Preparação do embarque" },
      { titulo: "Viagem ao Japão" },
      { titulo: "Integração e início do trabalho" },
    ],
    cta: "Fazer pré-análise",
  },
  murata: {
    titulo: "Tecnologia japonesa presente no mundo inteiro.",
    texto: "A Murata fabrica componentes eletrônicos usados em uma grande variedade de produtos tecnológicos e automotivos — de smartphones a carros.",
  },
  faq: [
    {
      pergunta: "O embarque realmente pode ter custo inicial zero?",
      resposta: "Para candidatos elegíveis dentro da campanha, passagem aérea e suporte de preparação fazem parte da estrutura de embarque sem cobrança inicial.",
    },
    {
      pergunta: "Preciso pagar aluguel?",
      resposta: "Sim. A moradia é organizada, mas aluguel e despesas como água, energia e gás são responsabilidade do trabalhador.",
    },
    {
      pergunta: "Como funcionam os turnos?",
      resposta: "A operação de Fukui utiliza principalmente escala 4×2 com alternância de turnos diurnos e noturnos.",
    },
    {
      pergunta: "Posso ir com minha família?",
      resposta: "Existem opções de apartamento para diferentes composições familiares, mas disponibilidade e elegibilidade precisam ser avaliadas individualmente.",
    },
    {
      pergunta: "Quem será meu empregador?",
      resposta: "A contratação é realizada pela Fujiarte no Japão e o trabalhador é alocado na operação da Murata.",
    },
    {
      pergunta: "Já tenho reentry. O que muda?",
      resposta: `Candidatos com documentação pronta podem ter um processo mais rápido e podem se enquadrar no Auxílio Embarque Jutsai de ${AUXILIO_EMBARQUE_BRL}, conforme as condições da campanha.`,
    },
  ],
  final: {
    titulo: "Descubra se esta oportunidade combina com o seu perfil.",
    texto: "Faça uma pré-análise gratuita. Sujeito à análise e disponibilidade.",
    cta: "Verificar minha elegibilidade",
    rodape: "Sem compromisso.",
  },
  formulario: {
    titulo: "Descubra se esta oportunidade combina com o seu perfil.",
    texto: "Duas etapas rápidas. Nossa equipe responde pelo WhatsApp.",
    botao: "Verificar minha elegibilidade",
    campos: ["estadoSeparado", "ondeEsta"],
  },
};
