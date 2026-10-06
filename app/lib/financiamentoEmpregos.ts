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
  "As condições do financiamento (parcelas, forma de desconto e prazo) são confirmadas pela empresa contratante antes do embarque.",
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
    `Olá, equipe Ajisai! Sou ${p.nome}, candidato(a) à vaga ${p.vagaTitulo} (${p.vagaEmpresa}) pelo Alpinea Empregos.`,
    `Recebi a proposta de financiamento${total} e gostaria de conversar antes de aceitar.`,
  ].join("\n");
}
