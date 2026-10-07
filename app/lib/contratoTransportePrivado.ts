// Contrato de Transporte Privado gerado automaticamente com os dados do
// pedido, para assinatura eletrônica no próprio checkout — pedido do Wilson,
// 06/out/2026: "teremos self-checkout pagamento online igual JR Pass,
// adicionar termos e condições e contrato gerado automaticamente para ser
// assinado digitalmente".
//
// Puro TypeScript (sem React) para ser usado nos dois lados: a página
// mostra o texto antes da assinatura e /api/transporte-privado-selfservice
// gera o MESMO texto a partir dos dados recebidos, calcula o hash SHA-256 e
// guarda texto + hash + IP + data/hora + nome digitado no CRM (assinatura
// eletrônica simples, MP 2.200-2/2001, art. 10, §2º). Ao mudar o texto de
// forma relevante, subir CONTRATO_TRANSPORTE_VERSAO.
//
// ⚠️ Modelo de referência baseado em contratos/Modelo_Contrato_Ajisai_v2 —
// deve ser revisado por advogado antes do uso com clientes reais (mesma
// nota do modelo original).

export const CONTRATO_TRANSPORTE_VERSAO = "contrato-transporte-privado-2026-10-06";

export const CONTRATADA_TRANSPORTE = {
  razaoSocial: "Alpinea Agências de Viagens LTDA",
  cnpj: "66.491.067/0001-84",
  sede: "São Paulo/SP",
  marca: "Ajisai",
};

export type ServicoContrato = {
  data: string; // ISO
  horario: string;
  rota: string;
  veiculo: string;
  enderecoPartida: string;
  enderecoDestino: string;
  duracaoEstimada: string;
  valorUSD: number;
};

export type DadosContratoTransporte = {
  nome: string;
  cpf: string;
  email: string;
  whatsapp: string;
  passageiros: number;
  dataChegada: string;
  dataPartida: string;
  servicos: ServicoContrato[];
  opcionais: string[];
  totalUSD: number;
  totalBRL: number;
  politicaCancelamento: string;
};

export type ClausulaContrato = { titulo: string; paragrafos: string[] };

const dataBR = (iso: string) => {
  const [a, m, d] = iso.split("-");
  return a && m && d ? `${d}/${m}/${a}` : iso;
};
const usd = (v: number) => `US$ ${Math.round(v).toLocaleString("pt-BR")}`;
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function gerarContratoTransporte(d: DadosContratoTransporte): ClausulaContrato[] {
  const c = CONTRATADA_TRANSPORTE;
  return [
    {
      titulo: "1. Das partes",
      paragrafos: [
        `CONTRATADA: ${c.razaoSocial}, inscrita no CNPJ sob o nº ${c.cnpj}, com sede em ${c.sede}, que comercializa este serviço sob a marca ${c.marca}.`,
        `CONTRATANTE: ${d.nome || "[nome]"}, inscrito(a) no CPF sob o nº ${d.cpf || "[CPF]"}, e-mail ${d.email || "[e-mail]"}, WhatsApp ${d.whatsapp || "[WhatsApp]"}.`,
      ],
    },
    {
      titulo: "2. Do objeto",
      paragrafos: [
        `Prestação de serviço de transporte privado com motorista no Japão, em veículo exclusivo do grupo do CONTRATANTE (${d.passageiros} ${d.passageiros === 1 ? "passageiro" : "passageiros"}), no período de ${dataBR(d.dataChegada)} a ${dataBR(d.dataPartida)}, conforme os serviços abaixo:`,
        ...d.servicos.map(
          (s, i) =>
            `${i + 1}) ${dataBR(s.data)}${s.horario ? ` às ${s.horario}` : ""} — ${s.rota}, veículo ${s.veiculo}. Partida: ${s.enderecoPartida || "[a informar]"}. Destino: ${s.enderecoDestino || "[a informar]"}. Duração estimada: ${s.duracaoEstimada}. Valor: ${usd(s.valorUSD)}.`,
        ),
        d.opcionais.length ? `Opcionais solicitados: ${d.opcionais.join("; ")}.` : "Sem opcionais solicitados.",
        "O motorista e o veículo são fornecidos por parceiro especializado no Japão; a CONTRATADA intermedeia, contrata e acompanha a execução do serviço.",
      ],
    },
    {
      titulo: "3. O que está incluído e o que não está",
      paragrafos: [
        "Incluídos: motorista profissional, veículo exclusivo, combustível, pedágios (ETC), estacionamento e impostos, dentro do tempo incluído em cada rota (normalmente 30 a 90 minutos por trecho, ou 10 horas nos passeios de dia inteiro).",
        "Não incluídos: tempo além do incluído (hora extra, cobrada em blocos de 30 minutos), trechos e paradas fora das rotas contratadas, transfer aeroporto ↔ hotel (contratado em Transfer Aeroporto), ingressos, refeições, guia turístico e carregamento de bagagem além do embarque e desembarque no veículo. O motorista fala japonês, salvo contratação expressa de motorista bilíngue.",
        "Os tempos de trajeto informados são estimativas e podem variar com o trânsito; somam-se a eles alguns minutos de deslocamento a pé até o ponto de embarque permitido para o veículo.",
      ],
    },
    {
      titulo: "4. Do preço e do pagamento",
      paragrafos: [
        `Valor total: ${usd(d.totalUSD)}, equivalente a ${brl(d.totalBRL)} na cotação do dia da contratação, pago online por Pix ou cartão de crédito na página segura da Stone (parcelamento com juros a partir de 2x). O serviço é confirmado após a aprovação do pagamento e da disponibilidade do fornecedor; se não houver disponibilidade, o valor é devolvido integralmente.`,
      ],
    },
    {
      titulo: "5. Do cancelamento",
      paragrafos: [
        d.politicaCancelamento,
        "Nas contratações feitas pela internet, fica assegurado o direito de arrependimento em até 7 (sete) dias contados da contratação (art. 49 do Código de Defesa do Consumidor), desde que o serviço ainda não tenha sido prestado.",
      ],
    },
    {
      titulo: "6. Das obrigações do CONTRATANTE",
      paragrafos: [
        "Informar endereços completos, horários, número de voo e quantidade de passageiros e bagagens corretos; estar no ponto de embarque no horário combinado; respeitar a lotação e as regras de segurança do veículo (incluindo cadeirinha para crianças, quando exigida). Divergências de informação que impeçam o serviço não geram reembolso.",
      ],
    },
    {
      titulo: "7. Das responsabilidades da CONTRATADA",
      paragrafos: [
        "Contratar e acompanhar o serviço junto ao fornecedor, informar ao CONTRATANTE os dados do motorista e do ponto de encontro e oferecer suporte pelo WhatsApp durante a execução. A CONTRATADA não responde por atrasos causados por trânsito, condições climáticas, desastres naturais ou determinações de autoridades, sem prejuízo dos direitos do consumidor.",
      ],
    },
    {
      titulo: "8. Dos dados pessoais",
      paragrafos: [
        "Os dados informados são usados para executar o serviço e são compartilhados com o fornecedor no Japão apenas no necessário, conforme a Lei Geral de Proteção de Dados e a Política de Privacidade da CONTRATADA.",
      ],
    },
    {
      titulo: "9. Da assinatura eletrônica e do foro",
      paragrafos: [
        "As partes reconhecem a validade da assinatura eletrônica deste contrato (MP 2.200-2/2001), realizada pelo aceite e pela digitação do nome completo do CONTRATANTE, com registro de data, hora, endereço IP e código de integridade (hash) do texto. Fica eleito o foro do domicílio do CONTRATANTE.",
      ],
    },
  ];
}

export function textoContratoTransporte(d: DadosContratoTransporte): string {
  return [
    "CONTRATO DE PRESTAÇÃO DE SERVIÇO DE TRANSPORTE PRIVADO NO JAPÃO",
    `Versão: ${CONTRATO_TRANSPORTE_VERSAO}`,
    "",
    ...gerarContratoTransporte(d).flatMap((cl) => [cl.titulo, ...cl.paragrafos, ""]),
  ].join("\n");
}
