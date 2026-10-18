// Etapa 3 da candidatura de /empregos — proposta de financiamento.
// Wilson, 06/out/2026: "somente necessário quando empreiteira não custeia
// os valores". Valores fixos definidos por ele:
//   1) Visto: R$ 1.200 por pessoa (consulado pode alterar sem aviso — o
//      novo valor é repassado ao cliente)
//   2) Certificado de Elegibilidade: ¥70.000 por pessoa
//   3) Passagem aérea: ¥200.000 por pessoa (pode subir conforme urgência da
//      empresa/turmas novas) + ¥50.000 por pessoa saindo de aeroporto do
//      Norte/Nordeste
//   4) Cesta de serviços extras: ¥100.000 fixo (não multiplica por pessoa)
// Variável: quantidade de proponentes. Cada valor pode ser exibido em
// reais ou ienes (toggle por card); a conversão usa a cotação de compra de
// iene em papel-moeda (mesma fonte da página de Câmbio).
// Pure module: usado pela página (cliente) e recalculado na API.

export const PRECOS = {
  vistoBRL: 1200,
  certificadoJPY: 70000,
  passagemJPY: 200000,
  adicionalNorteNordesteJPY: 50000,
  cestaExtrasJPY: 100000,
} as const;

export const MAX_PROPONENTES = 10;

export const SERVICOS_CESTA = [
  "Assistência pré-embarque",
  "Assistência de colocação no Japão",
  "Seguro viagem",
  "Pós-venda: 90 dias de acompanhamento",
];

export const UFS_NORTE_NORDESTE = ["AC", "AM", "AP", "PA", "RO", "RR", "TO", "AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"];

export type Aeroporto = { iata: string; nome: string; cidade: string; uf: string };
export const AEROPORTOS: Aeroporto[] = [
  { iata: "RBR", nome: "Aeroporto de Rio Branco", cidade: "Rio Branco", uf: "AC" },
  { iata: "MCZ", nome: "Aeroporto Zumbi dos Palmares", cidade: "Maceió", uf: "AL" },
  { iata: "MCP", nome: "Aeroporto de Macapá", cidade: "Macapá", uf: "AP" },
  { iata: "MAO", nome: "Aeroporto Eduardo Gomes", cidade: "Manaus", uf: "AM" },
  { iata: "SSA", nome: "Aeroporto de Salvador", cidade: "Salvador", uf: "BA" },
  { iata: "IOS", nome: "Aeroporto de Ilhéus", cidade: "Ilhéus", uf: "BA" },
  { iata: "BPS", nome: "Aeroporto de Porto Seguro", cidade: "Porto Seguro", uf: "BA" },
  { iata: "VDC", nome: "Aeroporto de Vitória da Conquista", cidade: "Vitória da Conquista", uf: "BA" },
  { iata: "FOR", nome: "Aeroporto Pinto Martins", cidade: "Fortaleza", uf: "CE" },
  { iata: "JDO", nome: "Aeroporto de Juazeiro do Norte", cidade: "Juazeiro do Norte", uf: "CE" },
  { iata: "BSB", nome: "Aeroporto de Brasília", cidade: "Brasília", uf: "DF" },
  { iata: "VIX", nome: "Aeroporto de Vitória", cidade: "Vitória", uf: "ES" },
  { iata: "GYN", nome: "Aeroporto de Goiânia", cidade: "Goiânia", uf: "GO" },
  { iata: "SLZ", nome: "Aeroporto de São Luís", cidade: "São Luís", uf: "MA" },
  { iata: "IMP", nome: "Aeroporto de Imperatriz", cidade: "Imperatriz", uf: "MA" },
  { iata: "CGB", nome: "Aeroporto Marechal Rondon", cidade: "Cuiabá", uf: "MT" },
  { iata: "CGR", nome: "Aeroporto de Campo Grande", cidade: "Campo Grande", uf: "MS" },
  { iata: "CNF", nome: "Aeroporto de Confins", cidade: "Belo Horizonte", uf: "MG" },
  { iata: "UDI", nome: "Aeroporto de Uberlândia", cidade: "Uberlândia", uf: "MG" },
  { iata: "MOC", nome: "Aeroporto de Montes Claros", cidade: "Montes Claros", uf: "MG" },
  { iata: "IZA", nome: "Aeroporto da Zona da Mata", cidade: "Juiz de Fora", uf: "MG" },
  { iata: "BEL", nome: "Aeroporto de Belém", cidade: "Belém", uf: "PA" },
  { iata: "STM", nome: "Aeroporto de Santarém", cidade: "Santarém", uf: "PA" },
  { iata: "MAB", nome: "Aeroporto de Marabá", cidade: "Marabá", uf: "PA" },
  { iata: "JPA", nome: "Aeroporto Castro Pinto", cidade: "João Pessoa", uf: "PB" },
  { iata: "CPV", nome: "Aeroporto de Campina Grande", cidade: "Campina Grande", uf: "PB" },
  { iata: "CWB", nome: "Aeroporto Afonso Pena", cidade: "Curitiba", uf: "PR" },
  { iata: "LDB", nome: "Aeroporto de Londrina", cidade: "Londrina", uf: "PR" },
  { iata: "MGF", nome: "Aeroporto de Maringá", cidade: "Maringá", uf: "PR" },
  { iata: "IGU", nome: "Aeroporto de Foz do Iguaçu", cidade: "Foz do Iguaçu", uf: "PR" },
  { iata: "CAC", nome: "Aeroporto de Cascavel", cidade: "Cascavel", uf: "PR" },
  { iata: "REC", nome: "Aeroporto do Recife", cidade: "Recife", uf: "PE" },
  { iata: "PNZ", nome: "Aeroporto de Petrolina", cidade: "Petrolina", uf: "PE" },
  { iata: "THE", nome: "Aeroporto de Teresina", cidade: "Teresina", uf: "PI" },
  { iata: "GIG", nome: "Aeroporto do Galeão", cidade: "Rio de Janeiro", uf: "RJ" },
  { iata: "SDU", nome: "Aeroporto Santos Dumont", cidade: "Rio de Janeiro", uf: "RJ" },
  { iata: "NAT", nome: "Aeroporto de Natal", cidade: "Natal", uf: "RN" },
  { iata: "POA", nome: "Aeroporto Salgado Filho", cidade: "Porto Alegre", uf: "RS" },
  { iata: "CXJ", nome: "Aeroporto de Caxias do Sul", cidade: "Caxias do Sul", uf: "RS" },
  { iata: "PVH", nome: "Aeroporto de Porto Velho", cidade: "Porto Velho", uf: "RO" },
  { iata: "BVB", nome: "Aeroporto de Boa Vista", cidade: "Boa Vista", uf: "RR" },
  { iata: "FLN", nome: "Aeroporto Hercílio Luz", cidade: "Florianópolis", uf: "SC" },
  { iata: "NVT", nome: "Aeroporto de Navegantes", cidade: "Navegantes", uf: "SC" },
  { iata: "JOI", nome: "Aeroporto de Joinville", cidade: "Joinville", uf: "SC" },
  { iata: "XAP", nome: "Aeroporto de Chapecó", cidade: "Chapecó", uf: "SC" },
  { iata: "GRU", nome: "Aeroporto de Guarulhos", cidade: "São Paulo", uf: "SP" },
  { iata: "CGH", nome: "Aeroporto de Congonhas", cidade: "São Paulo", uf: "SP" },
  { iata: "VCP", nome: "Aeroporto de Viracopos", cidade: "Campinas", uf: "SP" },
  { iata: "RAO", nome: "Aeroporto de Ribeirão Preto", cidade: "Ribeirão Preto", uf: "SP" },
  { iata: "SJP", nome: "Aeroporto de São José do Rio Preto", cidade: "São José do Rio Preto", uf: "SP" },
  { iata: "PPB", nome: "Aeroporto de Presidente Prudente", cidade: "Presidente Prudente", uf: "SP" },
  { iata: "AJU", nome: "Aeroporto de Aracaju", cidade: "Aracaju", uf: "SE" },
  { iata: "PMW", nome: "Aeroporto de Palmas", cidade: "Palmas", uf: "TO" },
];

export const aeroportoNorteNordeste = (iata: string) => {
  const a = AEROPORTOS.find((x) => x.iata === iata);
  return !!a && UFS_NORTE_NORDESTE.includes(a.uf);
};

export type SelecaoProposta = {
  proponentes: number;
  visto: boolean;
  certificado: boolean;
  aeroporto: string; // IATA
  cestaExtras: boolean;
};

export type Moeda = "BRL" | "JPY";

export type ItemProposta = {
  id: "visto" | "certificado" | "passagem" | "adicionalNorteNordeste" | "cestaExtras";
  label: string;
  moedaBase: Moeda;
  unitario: number; // na moeda base
  quantidade: number;
  totalBRL: number;
  totalJPY: number;
  nota?: string;
};

export type Proposta = {
  selecao: SelecaoProposta;
  itens: ItemProposta[];
  totalBRL: number;
  totalJPY: number;
  cotacaoBRLPorJPY: number;
};

export const NOTA_VISTO = "O consulado tem autonomia para alterar o valor sem aviso prévio; qualquer alteração é repassada ao cliente.";
export const NOTA_PASSAGEM =
  "O valor pode ser maior dependendo da urgência da empresa em receber o candidato ou do agendamento de turmas novas.";

export function parseSelecao(bruto: unknown): SelecaoProposta | null {
  const o = (bruto && typeof bruto === "object" ? bruto : {}) as Record<string, unknown>;
  const n = Math.round(Number(o.proponentes));
  const aeroporto = String(o.aeroporto ?? "").toUpperCase();
  if (!Number.isFinite(n) || n < 1 || n > MAX_PROPONENTES) return null;
  if (!AEROPORTOS.some((a) => a.iata === aeroporto)) return null;
  return { proponentes: n, visto: o.visto === true, certificado: o.certificado === true, aeroporto, cestaExtras: o.cestaExtras === true };
}

export function calcularProposta(selecao: SelecaoProposta, cotacaoBRLPorJPY: number): Proposta {
  const n = selecao.proponentes;
  const itens: ItemProposta[] = [];
  const add = (id: ItemProposta["id"], label: string, moedaBase: Moeda, unitario: number, quantidade: number, nota?: string) => {
    const base = unitario * quantidade;
    itens.push({
      id,
      label,
      moedaBase,
      unitario,
      quantidade,
      totalBRL: Math.round(moedaBase === "BRL" ? base : base * cotacaoBRLPorJPY),
      totalJPY: Math.round(moedaBase === "JPY" ? base : base / cotacaoBRLPorJPY),
      nota,
    });
  };
  if (selecao.visto) add("visto", "Serviço do visto", "BRL", PRECOS.vistoBRL, n, NOTA_VISTO);
  if (selecao.certificado) add("certificado", "Certificado de Elegibilidade", "JPY", PRECOS.certificadoJPY, n);
  add("passagem", `Passagem aérea (saindo de ${selecao.aeroporto})`, "JPY", PRECOS.passagemJPY, n, NOTA_PASSAGEM);
  if (aeroportoNorteNordeste(selecao.aeroporto))
    add("adicionalNorteNordeste", "Adicional aeroporto Norte/Nordeste", "JPY", PRECOS.adicionalNorteNordesteJPY, n);
  if (selecao.cestaExtras) add("cestaExtras", "Cesta de serviços extras", "JPY", PRECOS.cestaExtrasJPY, 1);
  return {
    selecao,
    itens,
    totalBRL: itens.reduce((s, i) => s + i.totalBRL, 0),
    totalJPY: itens.reduce((s, i) => s + i.totalJPY, 0),
    cotacaoBRLPorJPY,
  };
}

export const formatarMoeda = (v: number, moeda: Moeda) =>
  moeda === "BRL"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : `¥${Math.round(v).toLocaleString("pt-BR")}`;

// Rascunho dos termos — revisar com o jurídico antes de usar em produção.
export const TERMOS_PROPOSTA = [
  "Os valores desta proposta são estimativas por pessoa (exceto a cesta de serviços extras, de valor fixo) e servem de base para o financiamento dos custos de contratação.",
  "Valores em ienes são convertidos para reais pela cotação do dia; o valor final em reais pode variar com o câmbio na data do pagamento.",
  NOTA_VISTO,
  `Passagem aérea: ${NOTA_PASSAGEM.charAt(0).toLowerCase()}${NOTA_PASSAGEM.slice(1)}`,
  "Saídas de aeroportos das regiões Norte e Nordeste têm adicional de ¥50.000 por pessoa.",
  "O financiamento é pago diretamente à AjisaiWork em 2 parcelas após a chegada ao Japão (1º e 2º pagamento de salário), conforme o Termo de Dívida abaixo — não é descontado em folha de pagamento.",
  "O aceite desta proposta não garante a contratação; a vaga depende da pré-entrevista e da aprovação da empresa.",
];

export function mensagemWhatsappProposta(p: {
  nome: string;
  vagaTitulo: string;
  vagaEmpresa: string;
  candidaturaId: string;
  proposta: Proposta | null;
}) {
  const total = p.proposta
    ? ` (total estimado ${formatarMoeda(p.proposta.totalJPY, "JPY")} / ${formatarMoeda(p.proposta.totalBRL, "BRL")} para ${p.proposta.selecao.proponentes} pessoa${p.proposta.selecao.proponentes > 1 ? "s" : ""})`
    : "";
  return [
    `[EMPREGOS · PROPOSTA ETAPA 3 · #${p.candidaturaId.slice(0, 8)}]`,
    `Olá, equipe Ajisai! Sou ${p.nome}, candidato(a) à vaga ${p.vagaTitulo} (${p.vagaEmpresa}) pelo site da Ajisai.`,
    `Recebi a proposta de financiamento${total} e gostaria de conversar antes de aceitar.`,
  ].join("\n");
}

// ── Termo de Dívida (termo de financiamento) ──
// Wilson, 18/out/2026: "para vagas que não possuem custo zero vamos
// adicionar os termos de financiamento na página de financiamento".
// Base: os Termos de Financiamento .docx da AjisaiWork + a "Linha do tempo
// para pagamento do valor em aberto no Japão" (2 parcelas iguais, no 1º e
// no 2º pagamento de salário, pagas DIRETAMENTE à AjisaiWork, sem desconto
// em folha) + o "Guia Transferência Yucho - JP Bank". Decisão do Wilson
// (18/out): vale o pagamento direto à Ajisai — saíram do .docx a cláusula
// de desconto em folha/retenção pela empreiteira e qualquer nome de
// empreiteira. Rascunho — revisar com o jurídico antes de usar em produção.

export const CREDOR_FINANCIAMENTO = {
  nome: "AjisaiWork Japan",
  razaoSocial: "AjisaiWork Japan Agência de Viagens LTDA",
  cnpj: "43.544.605/0001-56",
} as const;

// Conta de recebimento no JP Bank (ゆうちょ銀行) — do guia de transferência.
export const CONTA_JP_BANK_AJISAI = {
  codeNumber: "14360",
  accountNumber: "97147191",
  titularKatakana: "イダ ブラッズ ヴィニシウス オーガスト",
} as const;

export const NUM_PARCELAS = 2;

export type Parcela = { numero: number; valorJPY: number; quando: string };

/** Divide o total em 2 parcelas de ienes inteiros (a 1ª leva o iene que sobrar). */
export function parcelasFinanciamento(totalJPY: number): Parcela[] {
  const total = Math.max(0, Math.round(totalJPY));
  const segunda = Math.floor(total / NUM_PARCELAS);
  return [
    { numero: 1, valorJPY: total - segunda, quando: "Data do primeiro pagamento de salário" },
    { numero: 2, valorJPY: segunda, quando: "Data do segundo pagamento de salário" },
  ];
}

// Passo a passo do caixa eletrônico do JP Bank (guia em PDF da AjisaiWork).
export const PASSOS_TRANSFERENCIA_JP_BANK = [
  "Procure um caixa eletrônico exclusivo do JP Bank (ゆうちょ銀行 — 銀行ATM verde). Leve o seu Cash Card do JP Bank e tenha saldo suficiente na conta.",
  "Insira o seu cartão do JP Bank no local indicado e digite a sua senha de 4 dígitos.",
  "Para facilitar, mude o idioma para o inglês: toque em \"English Guide\", no canto inferior direito da tela.",
  "No menu, toque em \"REMITTANCE\" (transferência).",
  `Digite os dados do recebedor: CODE NUMBER ${CONTA_JP_BANK_AJISAI.codeNumber} e ACCOUNT NUMBER ${CONTA_JP_BANK_AJISAI.accountNumber}, e toque em ENTER.`,
  "Digite o valor da parcela em ienes e toque no botão 円 (ienes); depois confirme o valor a ser transferido.",
  `Confira com atenção, na tela, o code number, o account number, o nome do titular (${CONTA_JP_BANK_AJISAI.titularKatakana}) e o valor. Confira novamente e confirme a transação.`,
  "Retire o recibo de transferência do caixa eletrônico.",
  "Tire uma foto do recibo e envie no WhatsApp para o seu atendente da Ajisai. Aguarde o retorno do atendente para finalizar.",
];

export type DadosTermo = {
  nomeCompleto: string;
  passaporte: string;
  totalJPY: number;
  totalBRL: number;
  cotacaoBRLPorJPY: number;
  /** Data do termo, AAAA-MM-DD (fuso de São Paulo). */
  data: string;
};

export type TermoFinanciamento = {
  titulo: string;
  textoJapones: string;
  clausulas: string[];
  parcelas: Parcela[];
  dados: DadosTermo;
};

export const dataHojeSaoPaulo = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const dataBR = (iso: string) => {
  const [a, m, d] = iso.split("-");
  return a && m && d ? `${d}/${m}/${a}` : iso;
};

export function termoFinanciamento(d: DadosTermo): TermoFinanciamento {
  const parcelas = parcelasFinanciamento(d.totalJPY);
  const ienes = (v: number) => formatarMoeda(v, "JPY");
  const [p1, p2] = parcelas;
  return {
    titulo: "Termo de Dívida",
    // Versão japonesa adaptada ao pagamento direto (sem 給料控除).
    textoJapones:
      "私は日本国で就労する為、ブラジルの人材紹介事業者（AjisaiWork Japan Agência de Viagens LTDA）から渡航費の立替金として前借を致しました。立替金は、来日後の最初の給料日及び二回目の給料日に、二回の分割にて、同社指定のゆうちょ銀行口座へ直接振り込むことにより返済する事を約束します。尚、人材紹介事業者名、金額、条件は下記の通りであることに同意します。返済を怠った場合は、現行法律にて罰せられる事を認識し、いかなる場合も返済義務は免責されないことを予め同意します。",
    clausulas: [
      `Declaro neste ato, para todos os fins, que realizei um empréstimo junto à ${CREDOR_FINANCIAMENTO.razaoSocial} (CNPJ ${CREDOR_FINANCIAMENTO.cnpj}, doravante "Agência"), credora deste termo, em moeda japonesa (iene), no valor total de ${ienes(d.totalJPY)}, para cobrir as despesas de viagem ao Japão descritas nesta proposta.`,
      `Comprometo-me a pagar o valor do financiamento diretamente à Agência, em ${NUM_PARCELAS} parcelas após a minha chegada ao Japão: ${ienes(p1.valorJPY)} na data do meu primeiro pagamento de salário e ${ienes(p2.valorJPY)} na data do meu segundo pagamento de salário, por transferência para a conta da Agência no JP Bank (ゆうちょ銀行). O pagamento é feito diretamente à Agência e não é debitado em folha de pagamento.`,
      "Em caso de inadimplemento ou não cumprimento do pagamento da forma descrita neste termo, com base em moeda japonesa (iene), estou ciente e de acordo que devo pagar o saldo em aberto diretamente à Agência e que serei submetido(a) às penalidades previstas nas leis vigentes do Japão. A obrigação de pagamento não é dispensada em nenhuma hipótese.",
      "Caso eu venha a me desligar num período inferior a 6 meses, estou ciente de que deverei arcar com o transporte do deslocamento doméstico e/ou demais despesas de locomoção dentro do território japonês (ônibus, via expressa, combustível, trem etc.). Essas despesas serão calculadas após a minha chegada ao Japão e acrescidas ao valor total do financiamento.",
      `Valor de referência em reais: ${formatarMoeda(d.totalBRL, "BRL")} (¥1 = R$ ${d.cotacaoBRLPorJPY.toFixed(4).replace(".", ",")}, cotação de ${dataBR(d.data)}). A dívida é em ienes; o valor em reais será definido pelo câmbio da data de emissão da passagem aérea.`,
      "O aceite eletrônico deste termo, nesta página, fica registrado com data e hora e substitui a assinatura conforme o passaporte.",
    ],
    parcelas,
    dados: d,
  };
}
