// Catálogo de vagas de /empregos — extraído de app/empregos/page.tsx em
// 25/set/2026 pra poder ser importado tanto pela página (client) quanto
// pela nova API de candidatura (server, app/api/empregos-candidatura/
// route.ts), que precisa consultar setor/idioma/perfil da vaga pra pontuar
// o currículo do candidato. Mesmo padrão de extração já usado em
// app/lib/calculadoraCatalogoPublico.ts (separar dado puro de componente
// "use client" — API routes não podem importar de um módulo "use
// client"). Nenhum dado foi alterado, é uma cópia exata do que já estava
// em page.tsx.

export type PublicoKey = "brasil" | "japao";

export type SetorKey = "automotivo" | "eletronicos" | "alimenticio" | "materiais";

export type StatusVaga = "aberta" | "consulta";

export type Vaga = {
  /** Slug da URL (/empregos/vagas/[id]) e chave no banco — nunca mude. */
  id: string;
  // ID e data de postagem — Wilson, 08/out/2026: "preciso que cada vaga
  // tenha um ID e data de postagem". Obrigatórios: vaga nova não compila
  // sem eles.
  /** Código público sequencial, "AJ-0001"… — use o próximo número livre (ver PROXIMO_CODIGO_VAGA). */
  codigo: string;
  /** Data em que a vaga entrou no site, AAAA-MM-DD. As 29 primeiras vieram
   * do histórico do git (catálogo publicado em 19/set/2026). */
  publicadaEm: string;
  empresa: string;
  titulo: string;
  setor: SetorKey;
  regiao: string;
  cidade: string;
  publico: PublicoKey[];
  turno: string;
  contrato: string;
  salario: string;
  status: StatusVaga;
  idioma?: string;
  perfil?: string;
  logo?: string;
  conducao?: string;
  observacoes?: string;
  fonteContrato?: "ut-suriemu";
  // Detalhes obrigatórios de toda vaga — pedido do Wilson, 06/out/2026:
  // "cada vaga deve ter dados obrigatorios sobre: moradia, lista de
  // beneficios, kit de boas vindas, bonus (bimestral/semestral), seção que
  // fala sobre a cidade e principais diferenciais da hospedagem". O campo
  // `info` é obrigatório no tipo (o TypeScript não deixa cadastrar vaga
  // nova sem ele), mas cada item pode ficar `null`/vazio enquanto o dado
  // real ainda não chegou — a página mostra "A confirmar com a nossa
  // equipe" nesses casos, em vez de inventar informação.
  info: InfoVaga;
  // Peso de experiência e Re-Entry nesta vaga (eliminatório ou
  // qualificatório) — opcional; sem isso vale CRITERIOS_TRIAGEM_PADRAO em
  // app/lib/candidaturaScoring.ts. Wilson, 06/out/2026.
  // Qualquer campo de CriteriosTriagem (candidaturaScoring.ts) pode ser
  // sobrescrito aqui — ex.: { reEntry: "eliminatorio", imcMaximo: 30 }.
  // true quando a empresa paga taxa de contratação, passagem e
  // documentação — aí a pergunta de financiamento não aparece. Sem dado =
  // pergunta aparece (Wilson, 06/out/2026).
  custosCobertosPelaEmpresa?: boolean;
  // true quando a vaga exige os testes de aptidão em papel da empreiteira,
  // feitos online numa etapa própria entre o match e a ficha
  // (app/lib/testesAptidao.ts). Wilson, 08/out/2026.
  testesAptidao?: boolean;
  criteriosTriagem?: Partial<import("./candidaturaScoring").CriteriosTriagem>;
};

export type InfoVaga = {
  /** Tipo de moradia, valor/desconto do aluguel, o que está incluso. */
  moradia: string | null;
  /** Lista de benefícios (transporte, refeitório, seguro, uniforme...). */
  beneficios: string[];
  /** O que vem no kit de boas-vindas (futon, utensílios, chip, etc.). */
  kitBoasVindas: string | null;
  /** Bônus — periodicidade (bimestral/semestral/anual) e valor/regra. */
  bonus: string | null;
  /** Texto curto sobre a cidade: clima, custo de vida, comunidade brasileira, acesso. */
  sobreCidade: string | null;
  /** Principais diferenciais da hospedagem (mobiliada, perto da fábrica, individual...). */
  diferenciaisHospedagem: string[];
};

// Todas as vagas abaixo começaram (06/out/2026) com `info` vazio — o
// bloco está escrito em cada vaga, e não num valor compartilhado, pra
// ficar explícito, vaga por vaga, o que falta preencher.

/** "Cidade, Província" — sem repetir quando são iguais (ex.: "Fukui"). */
export const localVaga = (v: { cidade: string; regiao: string }) => (v.cidade === v.regiao ? v.cidade : `${v.cidade}, ${v.regiao}`);

// Texto comum das vagas da campanha custo zero (regulamento 15/10/2026 a
// 28/02/2027) — o que vale para o candidato; regras de agência ficam de fora.
const OBS_CAMPANHA_CUSTO_ZERO =
  "Campanha custo zero: a empresa paga a passagem aérea, o seguro-viagem e o visto de quem desembarcar no Japão entre 15/10/2026 e 28/02/2027. É preciso ficar no mínimo 6 meses na fábrica — quem sair antes tem desconto de ¥250.000, referente a essas despesas. Fora do período da campanha, passagem e visto (¥250.000) são financiados e descontados em 5 parcelas. Casais com filhos: pode haver um período de adaptação (konarashi) para um dos responsáveis; as despesas desse período são pagas no Brasil e devolvidas na folha de pagamento depois do início do trabalho.";

/** Auxílio embarque da vaga Panasonic Unnan (Wilson, 18/out/2026). */
export const AUXILIO_EMBARQUE_PANASONIC_UNNAN = "R$ 1.000,00";

/** Vagas do destaque "Custo zero" (carrossel de /empregos). */
// Panasonic Unnan saiu deste grupo e ganhou card próprio (Wilson, 18/out/2026).
export const VAGAS_CAMPANHA_CUSTO_ZERO = ["niticon-ohno", "zest-higashiomi", "sun-denshi-masuda", "sun-denshi-izumo", "hichifuku-konan"];

export const VAGAS: Vaga[] = [
  // ── Campanha custo zero — fichas "Proposta de trabalho" + regulamento
  // da campanha (15/10/2026 a 28/02/2027), Wilson, 18/out/2026: "será o
  // novo destaque principal". Ordem = destaque. Valores de shoukai/bônus
  // do regulamento são da agência — NUNCA vão para o site.
  {
    id: "niticon-ohno",
    codigo: "AJ-0031",
    publicadaEm: "2026-10-18",
    empresa: "Niticon",
    titulo: "Montagem e inspeção de capacitores eletrônicos",
    setor: "eletronicos",
    regiao: "Fukui",
    cidade: "Ohno",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente — diurno 8:30–17:45 / noturno 20:30–5:40, 4x2. Hora extra conforme a necessidade da empresa, de 20 a 30 horas por mês.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.450/hora (aumento conforme o desempenho)",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: auxílio-combustível da empresa para quem usa transporte próprio.",
    observacoes: OBS_CAMPANHA_CUSTO_ZERO,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥36.000 a ¥45.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000, que pode ser pedido após 2 semanas de trabalho",
        "Refeitório nos dois turnos e loja 24 horas; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Fechamento do ponto no dia 20 e pagamento no dia 10 do mês seguinte, em conta",
      ],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  {
    id: "zest-higashiomi",
    codigo: "AJ-0033",
    publicadaEm: "2026-10-18",
    empresa: "Zest",
    titulo: "Produção de tecidos de fibra de vidro em rolos",
    setor: "materiais",
    regiao: "Shiga",
    cidade: "Higashiomi",
    publico: ["brasil"],
    turno: "3 turnos, alternados a cada dois dias — 6:55–15:10, 14:55–22:40 e 22:25–7:10 — 6x2. Hora extra de 2 a 3 horas.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.400/hora",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: auxílio-combustível de ¥5.000 a ¥10.000 para quem usa transporte próprio.",
    observacoes: OBS_CAMPANHA_CUSTO_ZERO,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥45.000 a ¥50.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000 por mês",
        "Refeitório em todos os turnos e loja 24 horas; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Fechamento do ponto no dia 20 e pagamento no dia 10 do mês seguinte, em conta",
      ],
      kitBoasVindas: null,
      bonus: "Prêmio de admissão de ¥20.000, conforme as regras da empresa.",
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  {
    id: "sun-denshi-masuda",
    codigo: "AJ-0034",
    publicadaEm: "2026-10-18",
    empresa: "Sun-Denshi",
    titulo: "Produção de componentes eletrônicos para geradores fotovoltaicos",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Masuda",
    publico: ["brasil"],
    turno: "Nos 3 primeiros meses (experiência), só diurno em horário comercial, 8 horas. Depois, turnos de 12 horas — 8:30–20:30 (diurno) / 20:30–8:30 (noturno) — no sistema 3x3 (3 dias de trabalho, 3 de folga). Hora extra de 45 a 60 horas por mês.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.450/hora (aumento conforme o desempenho)",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: não há transporte gratuito; pode ir de carro (ajuda de combustível calculada por rota), de bicicleta ou a pé.",
    observacoes: OBS_CAMPANHA_CUSTO_ZERO,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥50.000 a ¥75.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000, que pode ser pedido após 2 semanas de trabalho",
        "Refeitório nos dois turnos; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Primeiro uniforme gratuito (cobrado se sair antes de 3 meses)",
        "Fechamento do ponto no dia 20 e pagamento no dia 10 do mês seguinte, em conta",
      ],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  {
    id: "sun-denshi-izumo",
    codigo: "AJ-0035",
    publicadaEm: "2026-10-18",
    empresa: "Sun-Denshi",
    titulo: "Produção de componentes eletrônicos para geradores fotovoltaicos",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Izumo",
    publico: ["brasil"],
    turno: "Nos 3 primeiros meses (experiência), só diurno em horário comercial, 8 horas. Depois, diurno 8:30–17:30 / noturno 20:30–5:30, 5x2. Hora extra de 1 a 3 horas.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.450/hora (aumento conforme o desempenho)",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: transporte gratuito; também pode ir de carro (ajuda de combustível calculada por rota).",
    observacoes: OBS_CAMPANHA_CUSTO_ZERO,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥50.000 a ¥75.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000, que pode ser pedido após 2 semanas de trabalho",
        "Refeitório nos dois turnos; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Primeiro uniforme gratuito (cobrado se sair antes de 3 meses)",
        "Fechamento do ponto no dia 20 e pagamento no dia 10 do mês seguinte, em conta",
      ],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  {
    id: "hichifuku-konan",
    codigo: "AJ-0036",
    publicadaEm: "2026-10-18",
    empresa: "Hichifuku",
    titulo: "Produção de treliças e andaimes para construção civil — abastecimento de robô de solda",
    setor: "materiais",
    regiao: "Shiga",
    cidade: "Konan",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente — diurno 8:00–17:00 / noturno 20:00–5:00, 5x2 (folga sábado e domingo). Hora extra conforme a necessidade da empresa, de 45 a 60 horas por mês.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.450/hora",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: auxílio-combustível da empresa para quem usa transporte próprio.",
    observacoes: OBS_CAMPANHA_CUSTO_ZERO,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥40.000 a ¥55.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000, que pode ser pedido após 2 semanas de trabalho",
        "Loja 24 horas dentro do refeitório; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Fechamento do ponto no último dia do mês e pagamento no dia 15 do mês seguinte, em conta",
      ],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  {
    id: "panasonic-unnan",
    codigo: "AJ-0032",
    publicadaEm: "2026-10-18",
    empresa: "Panasonic",
    titulo: "Fabricação de conversores elétricos para painéis solares",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Unnan",
    publico: ["brasil"],
    turno: "Turno fixo noturno, 17:20–2:00, 5x2 (folga sexta e sábado ou sábado e domingo). Hora extra conforme a necessidade da empresa, de 45 a 60 horas por mês.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.500/hora (progressão conforme o desempenho e a avaliação da liderança)",
    status: "aberta",
    // Campanha custo zero (passagem, seguro-viagem e visto pagos) para
    // desembarque de 15/10/2026 a 28/02/2027 — sem etapa de proposta.
    custosCobertosPelaEmpresa: true,
    logo: "/images/logo-cliente-panasonic.png",
    conducao: "Perto da fábrica: a pé ou de bicicleta própria registrada (bōhan tōroku e seguro). Na área central da cidade: auxílio-combustível da empresa para quem usa transporte próprio.",
    // Auxílio embarque de R$ 1.000 — Wilson, 18/out/2026.
    observacoes: `Auxílio embarque de ${AUXILIO_EMBARQUE_PANASONIC_UNNAN}. ${OBS_CAMPANHA_CUSTO_ZERO}`,
    info: {
      moradia: "Apartamento da empresa: 1 quarto de ¥50.000 a ¥70.000/mês. Não é obrigatório morar no apartamento oferecido — dá para alugar um imóvel por conta própria. Água, gás e luz por conta do trabalhador. Eletrodomésticos e mobília são alugados (exemplo: geladeira ¥400/mês, máquina de lavar ¥400/mês, fogão a gás ¥200/mês, luminária ¥40/mês); casal ou apartamento compartilhado divide o aluguel dos eletrodomésticos. Conjunto de futon opcional: ¥7.700.",
      beneficios: [
        "Auxílio embarque de R$ 1.000,00",
        "Seguro saúde, previdência e seguro-desemprego desde a admissão",
        "Vale de até ¥30.000, que pode ser pedido após 2 semanas de trabalho",
        "Loja 24 horas dentro do refeitório; marmita pode ser trazida de casa ou comprada no konbini (micro-ondas à disposição)",
        "Fechamento do ponto no dia 15 e pagamento no último dia do mês, em conta",
      ],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Não é obrigatório morar no apartamento da empresa",
      ],
    },
  },
  // ── Avance RH/Corporation — comunicado + fichas individuais ──
  {
    id: "fuji-seat-higashiomi",
    codigo: "AJ-0001",
    publicadaEm: "2026-09-19",
    empresa: "Fuji Seat",
    titulo: "Montagem e inspeção de bancos de carro",
    setor: "automotivo",
    regiao: "Shiga",
    cidade: "Higashiomi",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente (diurno/noturno), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora",
    status: "aberta",
    idioma: "Não mandatório",
    perfil: "Homens até 45 anos",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "aisin-shinwa-toyama",
    codigo: "AJ-0002",
    publicadaEm: "2026-09-19",
    empresa: "Aisin Shinwa",
    titulo: "Processamento e inspeção de autopeças",
    setor: "automotivo",
    regiao: "Toyama",
    cidade: "Shimoniikawa Gun",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.600/hora",
    status: "aberta",
    logo: "/images/logo-cliente-aisin.png",
    idioma: "Básico (N4), preferência razoável (N3)",
    perfil: "Homens até 45 anos — precisa ter carro próprio e experiência em fábrica no Brasil ou no Japão",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "marugo-gomu-okayama",
    codigo: "AJ-0003",
    publicadaEm: "2026-09-19",
    empresa: "Marugo Gomu",
    titulo: "Vulcanização, acabamento e inspeção de mangueiras automotivas",
    setor: "automotivo",
    regiao: "Okayama",
    cidade: "Oda Yakage-cho",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.250–1.530/hora, conforme a função",
    status: "aberta",
    idioma: "Não mandatório",
    perfil: "Homens e mulheres até 50 anos",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "murata-izumo",
    codigo: "AJ-0004",
    publicadaEm: "2026-09-19",
    empresa: "Murata",
    titulo: "Produção de componentes eletrônicos (condensador cerâmico)",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Izumo",
    publico: ["brasil"],
    turno: "Turno fixo, diurno ou noturno, 4x2 (cerca de 18 dias trabalhados por mês)",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.500/hora (até ¥1.650/hora conforme o tempo de casa)",
    status: "aberta",
    // Murata é custo zero para o candidato — sem pergunta de financiamento
    // nem etapa de proposta (Wilson, 15/out/2026).
    custosCobertosPelaEmpresa: true,
    logo: "/images/logo-cliente-murata.png",
    idioma: "Não mandatório",
    perfil: "Homem, mulher ou casal até 59 anos", // limite confirmado pelo Wilson em 15/out/2026
    // Dados da ficha oficial "CSR - IZUMO (2026.07.10更新)" (07/out/2026).
    // Bônus fica null: a ficha só cita campanha de admissão sem valor, e a
    // regra de compliance é não mencionar bônus sem valor fornecido.
    info: {
      moradia:
        "Apartamentos de 1K a 3DK na cidade de Izumo, conforme composição familiar e disponibilidade. Aluguel aproximado: 1K/1DK sem internet ¥45.000–55.000, com internet ¥60.000–65.000; 2DK ou maior ¥55.000–75.000. Apartamentos prontos para morar; o trabalhador paga só o aluguel e as contas de água, luz e internet, sem taxas adicionais. Todas as moradias ficam no raio do transporte da empresa até a fábrica. Valores de aluguel e de eletrodomésticos podem ser alterados pela empreiteira; baseados no histórico recente.",
      beneficios: [
        "Seguro saúde, previdência (kōsei nenkin) e seguro-desemprego",
        "Refeitório na fábrica, refeição em torno de ¥300 (com pratos brasileiros no cardápio)",
        "Ônibus fretado do apartamento até a fábrica",
        "Intérprete para acompanhamento ao hospital, mediante solicitação prévia",
        "Mesmo salário para homens e mulheres",
        "Festival de verão e churrasco anual na empresa",
      ],
      kitBoasVindas:
        "Kit gratuito na chegada: jogo de futon, frigideira, pratos, talheres, copo, detergente e esponja, lenço e papel higiênico, shampoo, condicionador, sabonete líquido, despertador e adaptador de tomada. Quem sair antes de 6 meses devolve o valor do futon (¥7.500).",
      bonus: null,
      sobreCidade:
        "Izumo fica em Shimane, entre o Mar do Japão e o lago Shinji, e é a cidade do Grande Santuário de Izumo (Izumo Taisha). Tem shoppings (Aeon Mall, Yume Town, com cinema), supermercados, hospital geral e restaurante brasileiro. Praias no verão, estação de esqui a cerca de 1h30 de carro no inverno e onsen. Osaka fica a cerca de 4h30 de trem ou 1 hora de avião.",
      diferenciaisHospedagem: [
        "Leopalace com TV, geladeira e máquina de lavar incluídas no aluguel",
        "Nos demais imóveis, geladeira e máquina de lavar já instaladas (¥1.550/mês cada, podem ser devolvidas)",
        "Cerca de 20 minutos a pé ou 30 minutos de ônibus até a fábrica",
        "Supermercados e comércio perto dos apartamentos",
      ],
    },
  },
  {
    id: "murata-oda",
    codigo: "AJ-0005",
    publicadaEm: "2026-09-19",
    empresa: "Murata",
    titulo: "Produção de componentes eletrônicos (condensador cerâmico)",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Oda",
    publico: ["brasil"],
    // Wilson, 15/out/2026: em Oda o turno é alternado, não fixo.
    turno: "Turno alternado (diurno/noturno), 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.340/hora (até ¥1.560/hora conforme desempenho)",
    status: "aberta",
    // Murata é custo zero para o candidato — sem pergunta de financiamento
    // nem etapa de proposta (Wilson, 15/out/2026).
    custosCobertosPelaEmpresa: true,
    logo: "/images/logo-cliente-murata.png",
    idioma: "Não mandatório",
    perfil: "Homem, mulher ou casal até 59 anos", // limite confirmado pelo Wilson em 15/out/2026
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  // Vaga da landing /empregos/echizen — já anunciada no site, mas não
  // estava no catálogo. Incluída em 07/out/2026 (Wilson: "o candidato tem
  // que se candidatar pelas vagas que já estão no site, não existe caminho
  // especial"), com os dados da própria landing (app/lib/landingsMurata.ts).
  {
    id: "murata-echizen",
    codigo: "AJ-0030",
    publicadaEm: "2026-10-08",
    empresa: "Murata",
    titulo: "Operador de máquinas, inspeção de peças ou abastecimento de linha — componentes eletrônicos",
    setor: "eletronicos",
    regiao: "Fukui",
    cidade: "Fukui", // antes "Echizen" — Wilson, 15/out/2026: usar Fukui em todas as comunicações
    publico: ["brasil"],
    turno: "Turno alternado (diurno/noturno), 4x2 — Okamoto 8:50–19:00 / 20:50–7:00; Miyazaki 8:30–18:40 / 20:30–6:40. Turnos de cerca de 12 horas: 8 horas de trabalho, 2 pausas programadas e 1 pausa para refeição.",
    contrato: "A confirmar com a nossa equipe",
    salario: "¥1.500/hora em turno alternado (até ¥1.650/hora conforme o tempo de casa); ¥1.300–1.450/hora em diurno fixo",
    status: "aberta",
    // Murata é custo zero para o candidato — sem pergunta de financiamento
    // nem etapa de proposta (Wilson, 15/out/2026).
    custosCobertosPelaEmpresa: true,
    perfil: "Até 59 anos", // limite confirmado pelo Wilson em 15/out/2026
    logo: "/images/logo-cliente-murata.png",
    // Dados da ficha oficial "CSR - FUKUI (2026.07.03更新)" (07/out/2026).
    info: {
      moradia:
        "Apartamentos de 1K a 3DK na região da fábrica, em Fukui, conforme composição familiar e disponibilidade. Aluguel aproximado: 1K/1DK ¥40.000–65.000; 2DK ou maior ¥50.000–80.000; Leopalace ¥50.000–55.000. Apartamentos prontos para morar; o trabalhador paga só o aluguel e as contas de água, luz e internet, sem taxas adicionais. Todas as moradias ficam no raio do transporte da empresa até a fábrica. Valores de aluguel e de eletrodomésticos podem ser alterados pela empreiteira; baseados no histórico recente.",
      beneficios: [
        "Seguro saúde, previdência (kōsei nenkin) e seguro-desemprego",
        "Refeitório na fábrica (diurno), refeição em torno de ¥300, pago pelo app PayPay",
        "Transporte da empresa entre o apartamento e a fábrica — todas as moradias ficam no raio atendido (20 a 45 minutos)",
        "Acompanhamento ao hospital, mediante consulta ao escritório",
        "Hora extra não é obrigatória",
        "Mesmo salário para homens e mulheres",
        "Churrasco anual de confraternização",
      ],
      kitBoasVindas:
        "Kit gratuito na chegada: colchonete e coberta (futon), pratos, talheres, copo, panela, tábua de corte, detergente e esponja, sabão em pó, shampoo e condicionador, lenço e papel higiênico, sacos de lixo, máscaras e pincel atômico.",
      bonus: null,
      sobreCidade:
        "Fukui é conhecida pela longevidade e pelas quatro estações bem marcadas: praia e pesca no litoral no verão, esqui em Katsuyama no inverno e o Museu dos Dinossauros. Sem aeroporto nem shinkansen na província, mas o aeroporto de Komatsu fica a cerca de 45 minutos de trem e a estação Maibara (Tokaido Shinkansen) a cerca de 55 minutos.",
      diferenciaisHospedagem: [
        "Leopalace com TV, geladeira, máquina de lavar e micro-ondas incluídos no aluguel",
        "Nos demais imóveis, geladeira e máquina de lavar para alugar (¥1.550/mês cada)",
        "Supermercados, restaurantes e hospital a pé dos apartamentos",
        "Cerca de 20 a 25 minutos a pé da estação de Takefu",
      ],
    },
  },
  {
    id: "daikin-kusatsu",
    codigo: "AJ-0006",
    publicadaEm: "2026-09-19",
    empresa: "Daikin",
    titulo: "Produção, montagem e inspeção de ar-condicionado",
    setor: "eletronicos",
    regiao: "Shiga",
    cidade: "Kusatsu",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente (diurno/noturno), 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora (até ¥1.650/hora conforme desempenho)",
    status: "consulta",
    logo: "/images/logo-cliente-daikin.png",
    idioma: "Básico (N4)",
    perfil: "Homens e mulheres até 45 anos — previsão de vagas a partir de outubro/novembro",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "cs-nakatsugawa-gifu",
    codigo: "AJ-0007",
    publicadaEm: "2026-09-19",
    empresa: "CS Nakatsugawa",
    titulo: "Produção e inspeção de sensores automotivos",
    setor: "automotivo",
    regiao: "Gifu",
    cidade: "Nakatsugawa",
    publico: ["brasil"],
    turno: "Turno fixo ou alternado, 5x2 ou 6x1",
    contrato: "Haken ou ukeoi, conforme a vaga",
    salario: "¥1.400/hora",
    status: "consulta",
    idioma: "Preferencialmente com conhecimento de japonês",
    perfil: "Homens até 55 anos, não fumante",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "ntk-kani-gifu",
    codigo: "AJ-0008",
    publicadaEm: "2026-09-19",
    empresa: "NTK Kani",
    titulo: "Operação de máquina e inspeção de velas automotivas",
    setor: "automotivo",
    regiao: "Gifu",
    cidade: "Kani",
    publico: ["brasil"],
    turno: "Turno alternado mensalmente, 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300–1.400/hora, conforme o setor",
    status: "consulta",
    idioma: "Zero ou razoável (N3), a depender do setor",
    perfil: "Homem, mulher ou casal até 45 anos",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "nitto-boseki-fukushima",
    codigo: "AJ-0009",
    publicadaEm: "2026-09-19",
    empresa: "Nitto Boseki",
    titulo: "Produção de peças de fibra de vidro",
    setor: "materiais",
    regiao: "Fukushima",
    cidade: "Fukushima",
    publico: ["brasil"],
    turno: "3 turnos (05:55–14:15 / 13:55–22:15 / 21:55–06:15)",
    contrato: "Terceirizado (Out-Sourcing)",
    salario: "¥1.300/hora",
    status: "consulta",
    idioma: "Básico (N4)",
    perfil: "Homens até 50 anos — previsão de vagas a partir de setembro",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  // ── UT Suri-emu — fichas de contrato por empresa ──
  {
    id: "subaru-oizumi",
    codigo: "AJ-0010",
    publicadaEm: "2026-09-19",
    empresa: "Subaru",
    titulo: "Produção de transmissões automotivas",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Oizumi",
    publico: ["brasil"],
    turno: "Turno alternado 5x2 (2 turnos ou sankoutai, a partir de 6:30) ou 4x2 (diurno 7:30–18:00 / noturno 19:30–6:00), conforme a escala",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.900/hora (extra e feriados ¥2.375/hora; noturno +¥475/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-subaru.png",
    conducao: "Bicicleta (alugada pela empresa) — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
    observacoes: "Proibido fumar — descumprimento pode impedir a renovação do contrato.",
    // Ficha UT Suri-emu – Subaru (Oizumi), revisão 16/09/2026 (enviada pelo Wilson em 08/out/2026).
    info: {
      moradia:
        "Apartamento organizado pela empresa. Aluguel integral (aproximadamente 60 a 70 mil ienes) + água, luz, gás e taxa da Associação Comunitária, pagos pelo trabalhador; contratos de água, luz e gás em nome do morador (o gás pode pedir caução de ¥10.000–20.000, devolvida no fim do contrato). Tamanho e estacionamento conforme a disponibilidade na contratação. Geladeira, máquina de lavar e fogão podem ser alugados (média de ¥8.000–9.000/mês).",
      beneficios: [
        "Shakai hoken desde o 1º mês: seguro saúde (cobre 70% das despesas médicas), aposentadoria e seguro-desemprego (desconto total de cerca de 14%)",
        "Exame médico admissional e anual gratuito",
        "Primeiro kit de uniforme gratuito",
        "Refeitório na unidade (ou marmita de casa)",
        "Bicicleta alugada pela empresa para ir ao trabalho",
        "Pagamento todo dia 20, referente ao mês anterior",
      ],
      kitBoasVindas:
        "Kit de futon (colchão, colchonete e edredom) comprado pela empresa e descontado no 1º pagamento (cerca de ¥15.000).",
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Apartamentos Leopalace geralmente incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas, sem custo extra (pode variar conforme a unidade)",
        "Aluguel do 1º mês proporcional aos dias morados",
      ],
    },
  },
  {
    id: "subaru-ota",
    codigo: "AJ-0011",
    publicadaEm: "2026-09-19",
    empresa: "Subaru",
    titulo: "Montagem final de veículos (setor de acabamento)",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Ota",
    publico: ["brasil"],
    turno: "Turno alternado 5x2 (diurno 6:30–15:15 / noturno 16:45–1:30)",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.900/hora (extra e feriados ¥2.375/hora; noturno +¥475/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-subaru.png",
    conducao: "Bicicleta (alugada pela empresa) — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
    observacoes: "Fábrica principal da Subaru em Gunma (Levorg, Impreza, Crosstrek, WRX, BRZ). Trabalho de linha fisicamente puxado: treinamento de 2–3 dias no dojo e instrutor individual por 1–2 semanas. Proibido fumar.",
    // Ficha UT Suri-emu – Subaru (Ota), revisão 11/09/2026, com prospecto (enviada pelo Wilson em 08/out/2026).
    info: {
      moradia:
        "Apartamento organizado pela empresa. Aluguel integral (aproximadamente 60 a 70 mil ienes) + água, luz, gás e taxa da Associação Comunitária, pagos pelo trabalhador; contratos de água, luz e gás em nome do morador (o gás pode pedir caução de ¥10.000–20.000, devolvida no fim do contrato). Tamanho e estacionamento conforme a disponibilidade na contratação. Geladeira, máquina de lavar e fogão podem ser alugados (média de ¥8.000–9.000/mês).",
      beneficios: [
        "Shakai hoken desde o 1º mês: seguro saúde (cobre 70% das despesas médicas), aposentadoria e seguro-desemprego (desconto total de cerca de 14%)",
        "Exame médico admissional e anual gratuito",
        "Primeiro kit de uniforme gratuito",
        "Treinamento no dojo e acompanhamento individual de instrutor até trabalhar sozinho",
        "Refeitório na unidade (ou marmita de casa)",
        "Bicicleta alugada pela empresa para ir ao trabalho",
        "Pagamento todo dia 20, referente ao mês anterior",
      ],
      kitBoasVindas:
        "Kit de futon (colchão, colchonete e edredom) comprado pela empresa e descontado no 1º pagamento (cerca de ¥15.000).",
      bonus: null,
      sobreCidade: "A fábrica fica a 5 minutos a pé da estação de Ota (Gunma). Perto há Aeon Mall, Don Quijote, hospital (Ota Memorial), restaurantes como McDonald's, Sukiya e Saizeriya, e a Brazil Town de Oizumi, com lojas, restaurantes e eventos brasileiros.",
      diferenciaisHospedagem: [
        "Apartamentos Leopalace geralmente incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas, sem custo extra (pode variar conforme a unidade)",
        "Aluguel do 1º mês proporcional aos dias morados",
      ],
    },
  },
  {
    id: "mitsubishi-fuso-toyama",
    codigo: "AJ-0012",
    publicadaEm: "2026-09-19",
    empresa: "Mitsubishi Fuso",
    titulo: "Produção de ônibus — inspeção, soldagem, pintura e montagem",
    setor: "automotivo",
    regiao: "Toyama",
    cidade: "Toyama",
    publico: ["brasil"],
    turno: "Turno fixo ou alternado (diurno/noturno), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.700/hora",
    status: "aberta",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "yamase-miyagi",
    codigo: "AJ-0013",
    publicadaEm: "2026-09-19",
    empresa: "Yamase Electronics",
    titulo: "Montagem e inspeção de peças eletrônicas automotivas",
    setor: "automotivo",
    regiao: "Miyagi",
    cidade: "Osaki",
    publico: ["brasil"],
    turno: "Turno fixo, diurno ou noturno, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200/hora (até ¥1.250/hora após o 3º mês)",
    status: "aberta",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "fujifilm-miyagi",
    codigo: "AJ-0014",
    publicadaEm: "2026-09-19",
    empresa: "Fuji Film",
    titulo: "Montagem e inspeção de lentes de câmeras digitais",
    setor: "eletronicos",
    regiao: "Miyagi",
    cidade: "Taiwa",
    publico: ["brasil"],
    turno: "Diurno fixo, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200–1.250/hora",
    status: "aberta",
    logo: "/images/logo-cliente-fujifilm.png",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "yokohama-gomu-aichi",
    codigo: "AJ-0015",
    publicadaEm: "2026-09-19",
    empresa: "Yokohama Gomu",
    titulo: "Montagem de borracha, regulagem de aro, inspeção final e abastecimento de linha",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Shinshiro",
    publico: ["brasil"],
    turno: "Turno alternado 4x2 (diurno 7:50–17:00 / noturno 23:05–8:00)",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.430/hora (extra e feriados ¥1.788/hora; noturno +¥358/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-yokohama-tyres.png",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    observacoes: "Uniforme cobrado à parte, ¥6.450. Fumar só nos dias, horários e locais permitidos pela fábrica.",
    fonteContrato: "ut-suriemu",
    // Ficha UT Suri-emu – Yokohama Gomu (Shinshiro), revisão 07/05/2025 (enviada pelo Wilson em 08/out/2026).
    info: {
      moradia:
        "Apartamento organizado pela empresa. Aluguel integral (aproximadamente 60 a 70 mil ienes) + água, luz, gás e taxa da Associação Comunitária, pagos pelo trabalhador; contratos de água, luz e gás em nome do morador (o gás pode pedir caução de ¥10.000–20.000, devolvida no fim do contrato). Tamanho e estacionamento conforme a disponibilidade na contratação. Geladeira, máquina de lavar e fogão podem ser alugados (média de ¥8.000–9.000/mês).",
      beneficios: [
        "Shakai hoken desde o 1º mês: seguro saúde (cobre 70% das despesas médicas), aposentadoria e seguro-desemprego (desconto total de cerca de 14%)",
        "Exame médico admissional e anual gratuito",
        "Vans/ônibus gratuitos até a fábrica",
        "Refeitório na unidade (ou marmita de casa)",
        "Pagamento todo dia 20, referente ao mês anterior",
      ],
      kitBoasVindas:
        "Kit de futon (colchão, colchonete e edredom) comprado pela empresa e descontado no 1º pagamento (cerca de ¥15.000).",
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Apartamentos Leopalace geralmente incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas, sem custo extra (pode variar conforme a unidade)",
        "Aluguel do 1º mês proporcional aos dias morados",
      ],
    },
  },
  {
    id: "sony-aichi",
    codigo: "AJ-0016",
    publicadaEm: "2026-09-19",
    empresa: "Sony",
    titulo: "Montagem e inspeção de filmadoras e lentes digitais",
    setor: "eletronicos",
    regiao: "Aichi",
    cidade: "Kohda",
    publico: ["brasil"],
    turno: "Diurno ou noturno fixo, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.100/hora",
    status: "aberta",
    logo: "/images/logo-cliente-sony.png",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "mitsubishi-denki-himeji",
    codigo: "AJ-0017",
    publicadaEm: "2026-09-19",
    empresa: "Mitsubishi Denki",
    titulo: "Produção de alternadores automotivos",
    setor: "automotivo",
    regiao: "Hyogo",
    cidade: "Himeji",
    publico: ["brasil"],
    turno: "Diurno fixo (8:30–17:00), noturno fixo (20:45–5:30) ou alternado, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (extra ¥1.625/hora; noturno +¥325/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-mitsubishi-denki.png",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "daihatsu-nakatsu",
    codigo: "AJ-0018",
    publicadaEm: "2026-09-19",
    empresa: "Daihatsu",
    titulo: "Montagem de automóveis, inspeção, linha de produção e abastecimento de peças",
    setor: "automotivo",
    regiao: "Oita",
    cidade: "Nakatsu",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:10 / vespertino 18:30–2:40), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.800/hora (extra e feriados ¥2.250/hora; noturno +¥450/hora) + bônus de permanência de ¥500.000 nos primeiros 13 meses",
    status: "aberta",
    idioma: "Básico",
    perfil: "18 a 39 anos (até 45 com experiência); altura entre 155 e 185 cm; IMC até 30,5; não aceita daltonismo (casos leves avaliados); tatuagem só se coberta pelo uniforme e luvas",
    conducao: "Vans/ônibus fretados (gratuito) ou a pé — condução própria (bicicleta, carro ou moto) possível, consultar a unidade.",
    observacoes: "Fábrica de Oita (Nakatsu) da Daihatsu Kyushu: kei cars, kei trucks e kei vans. Média de 20 horas extras por mês. Admissões toda segunda-feira. Proibido fumar no horário de trabalho.",
    fonteContrato: "ut-suriemu",
    criteriosTriagem: { alturaMinimaCm: 155, alturaMaximaCm: 185, imcMaximo: 30.5 },
    // Ficha UT Suri-emu – Daihatsu (Nakatsu), revisão 10/07/2026, com prospecto (enviada pelo Wilson em 08/out/2026).
    info: {
      moradia:
        "Apartamento organizado pela empresa. Aluguel integral (aproximadamente 40 a 60 mil ienes) + água, luz, gás e taxa da Associação Comunitária, pagos pelo trabalhador; contratos de água, luz e gás em nome do morador (o gás pode pedir caução de ¥10.000–20.000, devolvida no fim do contrato). Tamanho e estacionamento conforme a disponibilidade na contratação. Geladeira, máquina de lavar e fogão podem ser alugados (média de ¥8.000–9.000/mês).",
      beneficios: [
        "Shakai hoken desde o 1º mês: seguro saúde (cobre 70% das despesas médicas), aposentadoria e seguro-desemprego (desconto total de cerca de 14%)",
        "Exame médico admissional e anual gratuito",
        "Primeiro kit de uniforme gratuito",
        "Refeitório com refeições de ¥200 a ¥600 e loja de conveniência na fábrica",
        "Área de descanso em cada setor, com micro-ondas e geladeira",
        "Transporte fretado gratuito até a fábrica",
        "Pagamento todo dia 20, referente ao mês anterior",
      ],
      kitBoasVindas:
        "Kit de futon (colchão, colchonete e edredom) comprado pela empresa e descontado no 1º pagamento (cerca de ¥15.000).",
      bonus: "Bônus de permanência de ¥500.000 no total: ¥50.000 no 1º mês, ¥100.000 no 4º, 7º e 10º meses e ¥150.000 no 13º mês após a alocação. A partir de 18 meses, ¥150.000 a cada 6 meses completos. Em cada mês são permitidas até 2 folgas avisadas; 3 atrasos ou saídas antecipadas contam como 1 falta.",
      sobreCidade: null,
      diferenciaisHospedagem: [
        "Apartamentos Leopalace geralmente incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas, sem custo extra (pode variar conforme a unidade)",
        "Aluguel do 1º mês proporcional aos dias morados",
      ],
    },
  },
  {
    id: "fruehauf-atsugi",
    codigo: "AJ-0019",
    publicadaEm: "2026-09-19",
    empresa: "Fruehauf",
    titulo: "Montagem e pintura de carrocerias de caminhão",
    setor: "automotivo",
    regiao: "Kanagawa",
    cidade: "Atsugi",
    publico: ["brasil"],
    turno: "Diurno fixo (8:05–17:00), 5x2 — sem turno noturno",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.600/hora (extra ¥2.000/hora; noturno +¥400/hora)",
    status: "aberta",
    idioma: "Básico (identificar avisos e placas de segurança)",
    perfil: "Homens até 50 anos (acima de 45 com experiência) — vagas femininas em negociação; requer visita à fábrica antes da alocação",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    observacoes: "Estacionamento por conta do funcionário, ¥2.200/mês.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "gs-yuasa-ritto",
    codigo: "AJ-0020",
    publicadaEm: "2026-09-19",
    empresa: "GS Yuasa",
    titulo: "Produção de baterias para veículos elétricos e híbridos",
    setor: "automotivo",
    regiao: "Shiga",
    cidade: "Ritto",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 9:00–21:00 / noturno 21:00–9:00), 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora, com reajuste semestral por assiduidade até ¥1.500/hora",
    status: "aberta",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  // ── Fujiarte Co. Ltd. — fichas "Condições de Contrato" (Inoac e Futaba
  // Sangyou, propostas atualizadas de 1/abr/2026) ──
  {
    id: "inoac-sakurai",
    codigo: "AJ-0021",
    publicadaEm: "2026-09-19",
    empresa: "Inoac Corporation",
    titulo: "Produção de peças de aerofólio automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Anjo",
    publico: ["brasil"],
    turno: "Turno alternado (7:00–16:00 / 19:00–4:00), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (após 3 meses, ¥1.400/hora) + moradia ¥55.000–60.000",
    status: "aberta",
    testesAptidao: true,
    perfil: "Homens solteiros ou casais — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "inoac-kira",
    codigo: "AJ-0022",
    publicadaEm: "2026-09-19",
    empresa: "Inoac Corporation",
    titulo: "Fabricação de encosto de cabeça e apoio de copos automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Kira",
    publico: ["brasil"],
    turno: "Turno alternado (7:00–16:00 / 18:00–3:00), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (após 3 meses, ¥1.400/hora) + moradia ¥45.000–65.000",
    status: "aberta",
    testesAptidao: true,
    perfil: "Homens solteiros ou casais — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "futaba-mutsumi",
    codigo: "AJ-0023",
    publicadaEm: "2026-09-19",
    empresa: "Futaba Sangyou",
    titulo: "Fabricação de peças de chassi automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Okazaki",
    publico: ["brasil"],
    turno: "Turno alternado (8:00–16:45 / 20:00–4:45), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.550/hora (após 6 meses, ¥1.650/hora) + moradia ¥45.000–60.000",
    status: "aberta",
    testesAptidao: true,
    perfil: "Homens solteiros ou casais com filhos — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família. Alocação entre Kota, Mutsumi e Okazaki definida só após a chegada ao Japão",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "futaba-kota",
    codigo: "AJ-0024",
    publicadaEm: "2026-09-19",
    empresa: "Futaba Sangyou",
    titulo: "Fabricação de escapamento automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Kota",
    publico: ["brasil"],
    turno: "Turno alternado (8:00–16:45 / 20:00–4:45), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.550/hora (após 6 meses, ¥1.650/hora) + moradia ¥45.000–60.000",
    status: "aberta",
    testesAptidao: true,
    perfil: "Homens solteiros ou casais com filhos — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "fujifilm-kanagawa",
    codigo: "AJ-0025",
    publicadaEm: "2026-09-19",
    empresa: "Fuji Film",
    titulo: "Embalamento de filmes instantâneos para câmeras fotográficas",
    setor: "eletronicos",
    regiao: "Kanagawa",
    cidade: "Minami Ashigara",
    publico: ["brasil"],
    turno: "Diurno fixo (7:00–16:00) ou noturno fixo (19:00–4:00), 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.350/hora (extra ¥1.688/hora; noturno +¥338/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-fujifilm.png",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria de carro possível, consultar a unidade.",
    observacoes: "Apartamentos Leopalace geralmente já incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "hino-jidousha-ota",
    codigo: "AJ-0026",
    publicadaEm: "2026-09-19",
    empresa: "Hino Jidosha",
    titulo: "Montagem e usinagem de peças de motor de caminhão",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Ota",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:20 / noturno 17:15–2:05), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥2.000/hora (extra ¥2.500/hora; noturno +¥500/hora)",
    status: "aberta",
    conducao: "A pé — bicicleta própria possível, consultar a unidade.",
    observacoes: "Refeitório na unidade com geladeira e micro-ondas.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "hino-jidousha-hamura",
    codigo: "AJ-0027",
    publicadaEm: "2026-09-19",
    empresa: "Hino Jidosha",
    titulo: "Montagem, abastecimento e inspeção de veículos",
    setor: "automotivo",
    regiao: "Tokyo",
    cidade: "Hamura",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:20 / noturno 17:15–2:05), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥2.000/hora (extra ¥2.500/hora; noturno +¥500/hora)",
    status: "aberta",
    conducao: "A pé — bicicleta própria possível, consultar a unidade.",
    observacoes: "Refeitório com sistema de recarga (depósito-caução de ¥1.000); cada refeição custa em torno de ¥500.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "kitz-ina-nagano",
    codigo: "AJ-0028",
    publicadaEm: "2026-09-19",
    empresa: "Kitz",
    titulo: "Produção de válvulas de água — montagem, usinagem e inspeção",
    setor: "materiais",
    regiao: "Nagano",
    cidade: "Ina",
    publico: ["brasil"],
    turno: "Diurno fixo (8:25–17:25) ou alternado (hayaban 5:00–13:20 / osoban 13:15–21:35), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200/hora (mulheres) ou ¥1.300/hora (homens)",
    status: "aberta",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
  {
    id: "panasonic-gunma",
    codigo: "AJ-0029",
    publicadaEm: "2026-09-19",
    empresa: "Panasonic",
    titulo: "Produção de eletrodomésticos — tratamento térmico, máquina e montagem",
    setor: "eletronicos",
    regiao: "Gunma",
    cidade: "Oizumi",
    publico: ["brasil"],
    turno: "Diurno fixo (8:25–17:00), 5x2 — possibilidade de turno noturno conforme a necessidade",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300–1.500/hora, conforme japonês e habilidades (até ¥1.600/hora em lift, até ¥1.900/hora em solda)",
    status: "aberta",
    logo: "/images/logo-cliente-panasonic.png",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
    info: {
      moradia: null,
      beneficios: [],
      kitBoasVindas: null,
      bonus: null,
      sobreCidade: null,
      diferenciaisHospedagem: [],
    },
  },
];

export function encontrarVaga(id: string): Vaga | null {
  return VAGAS.find((v) => v.id === id) ?? null;
}

// Próximo código livre para a próxima vaga cadastrada (atualize ao usar).
export const PROXIMO_CODIGO_VAGA = "AJ-0037";

export function formatarDataPostagem(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

// Trava contra código repetido (só avisa em desenvolvimento).
if (process.env.NODE_ENV !== "production") {
  const vistos = new Set<string>();
  for (const v of VAGAS) {
    if (vistos.has(v.codigo)) console.error(`vagasCatalogo: código ${v.codigo} repetido (${v.id}).`);
    vistos.add(v.codigo);
  }
}
