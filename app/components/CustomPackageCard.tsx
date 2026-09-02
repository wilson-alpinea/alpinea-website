"use client";

import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart } from "./CartContext";
import { useCambioUSD, brlParaUSDLabel, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { CambioLabel } from "./CambioLabel";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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

function IconCart({ className }: { className?: string }) {
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
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l1.8 11a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6l1.4-7.4H6.1" />
    </svg>
  );
}

function IconDocument({ className }: { className?: string }) {
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
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
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
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export const CATEGORIAS_HOTEL = ["3 estrelas", "4 estrelas", "5 estrelas", "Elite"] as const;
export const TIPOS_QUARTO = [
  "Individual",
  "Duplo (casal)",
  "Duplo (compartilhado)",
  "Triplo",
] as const;

type PrecoCtx = {
  dias: number;
  pessoas: number;
  categoriaHotel: (typeof CATEGORIAS_HOTEL)[number];
  tipoQuarto: (typeof TIPOS_QUARTO)[number];
  classeAereo: (typeof CLASSES_AEREO)[number];
  /** Duração do JR Pass escolhida pelo cliente — passe tem preço fixo por
   * faixa (7/14/21 dias corridos), não por diária do roteiro. */
  jrPassDias: (typeof JR_PASS_DIAS_OPCOES)[number];
  /** Cotação do dia (R$ por US$) — usada só pelos itens com valor fixo em
   * dólar (aéreo Business, guia, motorista privado, JR Pass, wi-fi,
   * ingressos), pra converter pro BRL antes de somar no total (todo o
   * resto do calculador é nativamente em reais — ver "total" no
   * componente). */
  cambioCotacao: number;
  /** Ajuste de preço da diária de hotel conforme a(s) cidade(s) do
   * roteiro — média dos multiplicadores das cidades selecionadas em
   * "Destinos" (1 quando nenhuma está selecionada, ver
   * CIDADE_MULTIPLICADOR_HOTEL). */
  multiplicadorCidadeHotel: number;
};

// Todo preço do calculador do Personalizado precisa embutir imposto +
// margem de lucro (pedido do Wilson, 25/ago/2026) — margem calculada por
// cima do valor já com imposto: primeiro soma-se o imposto sobre o lucro
// (15% — referência Lucro Presumido pra agência de viagem: IRPJ+CSLL na
// base presumida de 32%, mais PIS/COFINS e ISS; ajuste aqui se sua
// contabilidade usar uma alíquota efetiva diferente), depois 30% de
// margem sobre esse valor. Fórmula: preço final = custo × 1,15 × 1,30.
//
// Os valores documentados em cada comentário abaixo (pesquisa de mercado,
// custo do fornecedor etc.) continuam sendo o CUSTO puro — a constante
// final já sai com o multiplicador aplicado, pra manter a fonte de cada
// número auditável sem misturar custo com markup.
const IMPOSTO_SOBRE_LUCRO = 1.15;
const MARGEM_SOBRE_IMPOSTO = 1.3;
const MULTIPLICADOR_PRECO_FINAL = IMPOSTO_SOBRE_LUCRO * MARGEM_SOBRE_IMPOSTO; // 1,495
export function comMargemEImposto(custo: number) {
  return Math.round(custo * MULTIPLICADOR_PRECO_FINAL);
}

// Diária de hotel por categoria — usada pra calcular o total do pacote
// conforme categoria do hotel, tipo de quarto e quantidade de dias.
// Calibrado com base em pesquisa de mercado (Tokyo, referência ago/2026):
// 3 estrelas ~US$ 47–93/noite (business hotel), 4 estrelas ~US$ 100–200/noite
// (mid-range), 5 estrelas ~US$ 300–500+/noite em propriedades de luxo de
// verdade (ex.: Park Hyatt Tokyo, listado a partir de ~US$ 504/noite),
// Elite ~US$ 1.400+/noite em propriedades ultra-luxo (ex.: Aman Tokyo,
// listado a partir de ~US$ 1.426/noite) — fontes:
// japantripcost.com/blog/average-hotel-prices-tokyo-2026,
// selfguidejapan.com/blog/japan-hotel-prices-2026, momondo.com (Park Hyatt
// Tokyo e Aman Tokyo). Convertido pra reais na cotação de referência
// (~R$ 5,15/US$) e arredondado. Ainda uma média de mercado, não a diária
// negociada com cada fornecedor específico — ajuste se tiver uma tabela de
// parceiros mais precisa.
export const DIARIA_HOTEL: Record<(typeof CATEGORIAS_HOTEL)[number], number> = {
  "3 estrelas": comMargemEImposto(400),
  "4 estrelas": comMargemEImposto(800),
  "5 estrelas": comMargemEImposto(2600),
  "Elite": comMargemEImposto(7500),
};

// Exemplos de propriedades por categoria, para o "Ver detalhes" do item
// Hotel — referência de m² médio, tipo de quarto padrão e comodidades mais
// comuns em cada faixa (pesquisa de mercado, Tokyo, ago/2026). Nomes de
// hotéis são apenas exemplos ilustrativos da categoria, não parceiros
// fixos — a Ajisai seleciona a propriedade conforme roteiro e disponibilidade.
const EXEMPLOS_HOTEIS: Record<
  (typeof CATEGORIAS_HOTEL)[number],
  {
    m2Medio: string;
    tipoQuarto: string;
    amenidades: { piscina: boolean; academia: boolean; sauna: boolean; restaurante: boolean };
    exemplos: string[];
  }
> = {
  "3 estrelas": {
    m2Medio: "~23–25 m²",
    tipoQuarto: "Quarto padrão compacto — cama + escrivaninha, banheiro integrado",
    amenidades: { piscina: false, academia: false, sauna: false, restaurante: false },
    exemplos: ["APA Hotel", "Mitsui Garden Hotel", "Richmond Hotel"],
  },
  "4 estrelas": {
    m2Medio: "~30 m²",
    tipoQuarto: "Quarto standard/superior — mais espaço de estar, amenidades de mid-range",
    amenidades: { piscina: false, academia: true, sauna: false, restaurante: true },
    exemplos: ["Hotel Gracery", "Shinagawa Prince Hotel", "Hilton Tokyo"],
  },
  "5 estrelas": {
    m2Medio: "~36 m²+",
    tipoQuarto: "Quarto de luxo/suíte — enxoval premium, área de estar separada",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    exemplos: ["Park Hyatt Tokyo", "Conrad Tokyo", "The Ritz-Carlton Tokyo"],
  },
  "Elite": {
    m2Medio: "~70–80 m²+",
    tipoQuarto: "Suíte ultra-luxo — living room, banheira separada, vista panorâmica",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    exemplos: ["Aman Tokyo", "Janu Tokyo", "Mandarin Oriental Tokyo"],
  },
};

// Fator por tipo de quarto — quarto compartilhado dilui o custo por pessoa.
export const FATOR_QUARTO: Record<(typeof TIPOS_QUARTO)[number], number> = {
  Individual: 1,
  "Duplo (casal)": 0.65,
  "Duplo (compartilhado)": 0.65,
  Triplo: 0.5,
};

export const DIARIA_TRANSPORTE = comMargemEImposto(150);
// Guia: custo de US$ 350/dia a cada 4 pessoas — grupos maiores precisam de
// mais de um guia, cobrado proporcionalmente. Valor nativo em dólar —
// convertido pra reais com a cotação do dia antes de entrar no total (ver
// calcPreco abaixo e cambioCotacao em PrecoCtx). Preço final já com
// imposto+margem.
export const DIARIA_GUIA_USD = comMargemEImposto(350);
export const GUIA_TAMANHO_GRUPO = 4;
// Japan Rail Pass — vendido em faixas fixas de dias CORRIDOS (7, 14 ou 21),
// não por diária do roteiro; preço não escala com ctx.dias. Pesquisa
// set/2026: tarifa oficial vigente a partir de 01/out/2026 para compra via
// agência fora do Japão — JPY 53.000 / 84.000 / 105.000 (fonte:
// selfguidejapan.com/blog/japan-rail-pass-price-2026), convertida em dólar
// na cotação de referência USD/JPY ≈ 159,97 (xe.com, 01/set/2026). Nativo
// em dólar — convertido pra reais com a cotação do dia, igual guia/
// motorista/wifi/ingressos. Preço final já com imposto+margem.
export const JR_PASS_DIAS_OPCOES = [7, 14, 21] as const;
export const JR_PASS_PRECO_USD: Record<(typeof JR_PASS_DIAS_OPCOES)[number], number> = {
  7: comMargemEImposto(331),
  14: comMargemEImposto(525),
  21: comMargemEImposto(656),
};
export const DIARIA_SEGURO_VIAGEM = comMargemEImposto(35);
// Motorista privado: custo de US$ 700/dia, cobre até 4 pessoas — mesma
// lógica de grupo do guia, também nativo em dólar. Preço final já com
// imposto+margem.
export const DIARIA_MOTORISTA_PRIVADO_USD = comMargemEImposto(700);
export const MOTORISTA_TAMANHO_GRUPO = 4;
export const PRECO_CAMBIO_BRASIL = comMargemEImposto(150);
// Wi-fi e ingressos Disney/Universal: valores de referência da planilha
// "Simulação de Orçamento v2.1" (JPY convertido pra dólar) — não foram
// passados valores explícitos por você para esses dois itens. Também
// nativos em dólar.
export const DIARIA_WIFI_USD_PAX = comMargemEImposto(7); // ≈ JPY 1000/dia/pax (custo)
export const PRECO_INGRESSO_DISNEY_UNIVERSAL_USD_PAX = comMargemEImposto(83); // ≈ JPY 12000/pax (custo, ingresso avulso)
// Reserva de restaurantes high-end: pacote fechado de 7 reservas em
// restaurantes categoria Michelin/Tabelog Awards (ou equivalente), valor
// fixo até 3 pessoas — não escala por dia nem por pessoa dentro do limite.
export const PRECO_RESTAURANTES_HIGHEND_USD = comMargemEImposto(1000);
export const RESTAURANTES_HIGHEND_QTD = 7;
export const RESTAURANTES_HIGHEND_LIMITE_PESSOAS = 3;

// Roteiro Personalizado: mesma regra de preço do produto standalone
// vendido em /ajisairoteiros (ver PriceCalculator.tsx) — preço-base fixo
// até 15 dias, + valor por dia extra acima disso. Nativo em reais, igual
// hotel/transporte. A taxa por passageiro extra do roteiro standalone NÃO
// é replicada aqui porque o pacote já cobra sua própria taxa de grupo
// (TAXA_POR_PASSAGEIRO_EXTRA, abaixo) sobre o total — duplicar cobraria
// duas vezes pelo mesmo grupo grande. Preço final já com imposto+margem
// (o produto standalone em /ajisairoteiros não foi alterado por este
// pedido, que era específico do calculador do Personalizado).
export const ROTEIRO_BASE_DIAS = 15;
export const ROTEIRO_PRECO_BASE = comMargemEImposto(1500);
export const ROTEIRO_PRECO_DIA_EXTRA = comMargemEImposto(120);

// Aéreo: Economy segue o valor de referência original (nativo em reais,
// como todo o resto do calculador). Business é o valor exato que você
// passou — US$ 6.000 fixo, nativo em dólar — convertido pra reais com a
// cotação do dia antes de entrar no total, igual guia/motorista/wifi/
// ingressos acima.
//
// First Class: pesquisado em cima da Qatar Airways (First Class só existe
// nos voos com A380, que em 2026 NÃO cobre a rota GRU↔Japão — só
// Londres/Bangkok e, sazonalmente, Cingapura/Sydney/Paris a partir de
// Doha). Não existe tarifa oficial pra essa rota específica, então usei
// como referência a faixa de mercado pra itinerários ultra-longos com dois
// trechos igualmente longos (ex.: Sydney↔Londres via Doha, que a Qatar
// cobra ida e volta entre US$ 10.000 e US$ 15.000 — fonte: Simple Flying,
// maio/2026) — ponto médio US$ 12.500 — com margem de 40% aplicada por
// pedido seu: 12.500 × 1,4 = US$ 17.500. AJUSTE assim que tiver uma
// cotação real da rota.
//
// O First Class já sai com 40% de margem embutida (decisão anterior,
// específica dessa classe) — por isso NÃO leva o multiplicador de margem
// de novo aqui (senão dobraria a margem); leva só o imposto sobre o lucro,
// pra ficar no mesmo padrão de carga tributária dos demais itens.
export const CLASSES_AEREO = ["Economy", "Business", "First Class"] as const;
export const PRECO_AEREO_ECONOMY_BRL = comMargemEImposto(8000);
export const PRECO_AEREO_BUSINESS_USD = comMargemEImposto(6000);
export const PRECO_AEREO_FIRST_USD = Math.round(17500 * IMPOSTO_SOBRE_LUCRO);

// Preços por item — aéreo, câmbio e serviços adicionais têm valor fixo por
// viagem; hotel, transporte, guia, JR Pass, seguro viagem e motorista
// privado variam conforme categoria do hotel, tipo de quarto e quantidade
// de dias selecionados acima.
const OPCOES = [
  {
    key: "aereo",
    categoria: "essencial",
    label: "Aéreo",
    icone: "✈️",
    descricao: "Passagem internacional ida e volta — Economy, Business ou First Class",
    detalhe:
      "Bilhete aéreo internacional de ida e volta, com a Ajisai buscando as melhores opções de conexão disponíveis para as datas escolhidas. Inclui bagagem conforme a franquia da companhia aérea selecionada. Disponível em Economy, Business ou First Class.\n\nDiferenciais Ajisai para quem compra a passagem com a gente:\n\nConcierge no Aeroporto de Guarulhos — equipe especializada apoia todos os passageiros no balcão de check-in, esclarece dúvidas, resolve reserva de assento e intermedia com a companhia aérea. Acesso direto à gerência das companhias no aeroporto — fundamental em cancelamento, remarcação e direitos do passageiro.\n\nProtocolo pré-embarque (Visit Japan Web) — um membro da equipe Ajisai preenche o VJW com os dados do passageiro, cria e cadastra a conta e envia pronta pra você, substituindo o papelado na chegada ao Japão. Inclui sessão dedicada ao aéreo, explicando o itinerário e tirando dúvidas antes do embarque.\n\nMonitoramento de viagem — central de WhatsApp com equipe emergencial Ajisai, funcionando quase 24 horas por dia, cobrindo conexões, gestão de reserva antes da viagem e imprevistos durante a viagem. Atendimento humano, com apoio de tradutor por telefone quando necessário.\n\nResponsabilidade da Agência — passagem emitida pela Ajisai tem responsabilidade solidária da agência e negociação direta com as companhias aéreas, muito além do que dá pra resolver sozinho numa reserva comprada por conta própria — mais proteção e prioridade, mesmo pelo mesmo preço.",
    calcPreco: (ctx: PrecoCtx) => {
      // Cada passageiro paga sua própria passagem — sem desconto por
      // grupo (diferente do hotel, que dilui custo por quarto compartilhado).
      if (ctx.classeAereo === "First Class")
        return Math.round(PRECO_AEREO_FIRST_USD * ctx.cambioCotacao * ctx.pessoas);
      if (ctx.classeAereo === "Business")
        return Math.round(PRECO_AEREO_BUSINESS_USD * ctx.cambioCotacao * ctx.pessoas);
      return PRECO_AEREO_ECONOMY_BRL * ctx.pessoas;
    },
  },
  {
    key: "hotel",
    categoria: "essencial",
    label: "Hotel",
    icone: "🏨",
    descricao: "Hospedagem selecionada durante toda a viagem",
    detalhe:
      "Hospedagem selecionada por categoria (3 estrelas a Elite) e tipo de quarto, em localizações estratégicas para o roteiro escolhido — sempre com curadoria Ajisai. Café da manhã incluso.",
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(
        DIARIA_HOTEL[ctx.categoriaHotel] *
          ctx.dias *
          FATOR_QUARTO[ctx.tipoQuarto] *
          ctx.multiplicadorCidadeHotel,
      ),
  },
  {
    key: "transporte",
    categoria: "essencial",
    label: "Transporte Privado",
    icone: "🚐",
    descricao: "Transfers e deslocamentos do roteiro",
    detalhe:
      "Transfers e deslocamentos previstos no roteiro dia a dia — do aeroporto ao hotel, entre cidades e até as atrações, conforme a logística definida no seu Roteiro Digital.\n\nOs veículos variam conforme o tamanho do grupo e a categoria contratada — os dois modelos mais usados são a Toyota Alphard e a Toyota Hiace.\n\nToyota Alphard — minivan premium, bancos de couro tipo poltrona (captain seats) na segunda fila, cabine mais silenciosa e acabamento de categoria superior. Por causa das poltronas reclináveis, o porta-malas é menor — ideal pra grupos de até 4 pessoas com bagagem média.\n\nToyota Hiace — van maior, com bancos mais simples, mas bagageiro bem mais amplo. Vale mais a pena pra grupos maiores ou com bastante bagagem (malas grandes, equipamento extra), mesmo com o acabamento interno menos luxuoso.\n\nOu seja: a Alphard custa mais por causa do conforto e categoria do veículo, não por ser maior — na prática ela carrega menos bagagem que a Hiace. A Ajisai indica o modelo mais adequado conforme grupo e volume de mala na hora da cotação.",
    calcPreco: (ctx: PrecoCtx) => DIARIA_TRANSPORTE * ctx.dias,
  },
  {
    key: "guia",
    categoria: "essencial",
    label: "Guia",
    icone: "🧭",
    descricao: `Guia turístico acompanhando o roteiro — US$ ${DIARIA_GUIA_USD}/dia a cada ${GUIA_TAMANHO_GRUPO} pessoas`,
    detalhe:
      `Guia particular fluente em português, dedicado ao seu grupo, acompanhando pontos-chave do roteiro — ajuda com trajetos, horários e como evitar filas nas atrações. US$ ${DIARIA_GUIA_USD} por dia a cada ${GUIA_TAMANHO_GRUPO} pessoas; grupos maiores recebem guias adicionais, cobrados proporcionalmente.`,
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(
        DIARIA_GUIA_USD *
          ctx.dias *
          Math.max(1, Math.ceil(ctx.pessoas / GUIA_TAMANHO_GRUPO)) *
          ctx.cambioCotacao,
      ),
  },
  {
    key: "jrpass",
    categoria: "opcional",
    label: "JR Pass",
    icone: "🚄",
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala — escolha 7, 14 ou 21 dias em Ver detalhes",
    detalhe:
      "Passe ferroviário JR, com deslocamentos ilimitados nas linhas JR (incluindo a maioria dos trens-bala/Shinkansen) — vale a pena principalmente em roteiros com várias cidades. Vendido em faixas fixas de dias corridos de validade (não por diária do roteiro): escolha abaixo a duração que melhor cobre os deslocamentos do seu grupo.",
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(JR_PASS_PRECO_USD[ctx.jrPassDias] * ctx.cambioCotacao),
  },
  {
    key: "seguro",
    categoria: "opcional",
    label: "Seguro Viagem",
    icone: "🛡️",
    descricao: "Cobertura médica e assistência durante toda a viagem",
    detalhe:
      "Cobertura médico-hospitalar e assistência durante toda a duração da viagem contratada. Passageiros a partir de 85 anos entram sob consulta, já que a maioria das seguradoras aplica condições diferenciadas para essa faixa etária.\n\nApólice padrão Ajisai para o Japão — referência de mercado para o destino:\n\nDespesas Médicas e Hospitalares (DMH): mínimo de US$ 30 mil, com opção de upgrade para US$ 60 mil (recomendado para gestantes, idosos e quem tem doença preexistente). O sistema de saúde japonês é excelente, mas turista paga 100% do custo — sem seguro, uma internação simples pode passar de dezenas de milhares de dólares.\n\nBagagem extraviada ou danificada: cobertura mínima de US$ 750.\n\nCancelamento de viagem: reembolso por cancelamento por motivo de saúde, imprevisto familiar ou problema de documentação.\n\nTraslado médico e repatriação sanitária, em casos graves.\n\nCentral de assistência 24h em português, com acionamento por telefone ou WhatsApp.\n\nValores e seguradora exatos dependem da idade e do perfil dos passageiros — a Ajisai cota a apólice ideal junto às principais seguradoras do mercado antes da confirmação.",
    calcPreco: (ctx: PrecoCtx) => DIARIA_SEGURO_VIAGEM * ctx.dias,
  },
  {
    key: "cambio",
    categoria: "opcional",
    label: "Câmbio no Brasil",
    icone: "💴",
    descricao: "Retirada de ienes com câmbio comercial antes do embarque",
    detalhe:
      "Retirada de ienes em espécie ainda no Brasil, com cotação comercial fechada antes do embarque — evita depender só de caixas eletrônicos ou casas de câmbio no Japão nos primeiros dias de viagem.",
    calcPreco: () => PRECO_CAMBIO_BRASIL,
  },
  {
    key: "motorista",
    categoria: "opcional",
    label: "Motorista Privado",
    icone: "🚗",
    descricao: `Traslados exclusivos com motorista particular — US$ ${DIARIA_MOTORISTA_PRIVADO_USD}/dia para até ${MOTORISTA_TAMANHO_GRUPO} pessoas`,
    detalhe:
      `Traslados exclusivos com motorista particular, sem compartilhar veículo com outros grupos — ideal para famílias com bagagem extra, crianças pequenas ou quem prefere mais privacidade e flexibilidade de horário. US$ ${DIARIA_MOTORISTA_PRIVADO_USD} por dia, cobrindo até ${MOTORISTA_TAMANHO_GRUPO} pessoas; grupos maiores recebem veículos adicionais, cobrados proporcionalmente.`,
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(
        DIARIA_MOTORISTA_PRIVADO_USD *
          ctx.dias *
          Math.max(1, Math.ceil(ctx.pessoas / MOTORISTA_TAMANHO_GRUPO)) *
          ctx.cambioCotacao,
      ),
  },
  {
    key: "reservasRestaurantes",
    categoria: "opcional",
    label: "Reservas de Restaurantes",
    icone: "🍽️",
    descricao: "Reservas em restaurantes concorridos durante a viagem",
    detalhe:
      "Reservas em restaurantes concorridos ao longo do roteiro, conforme o interesse do grupo — sob consulta.",
    calcPreco: () => 0,
  },
  {
    key: "restaurantesHighEnd",
    categoria: "opcional",
    label: "Reserva de Restaurantes High-End",
    icone: "🍾",
    descricao: `${RESTAURANTES_HIGHEND_QTD} restaurantes Michelin/Tabelog Awards — US$ ${PRECO_RESTAURANTES_HIGHEND_USD} até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas`,
    detalhe:
      `Pacote fechado de ${RESTAURANTES_HIGHEND_QTD} reservas em restaurantes de alto padrão — categoria Estrela Michelin, Tabelog Awards ou equivalente — nas cidades do seu roteiro. A Ajisai cuida de toda a articulação: muitos desses lugares têm poucas mesas por noite e não aceitam reserva direta de estrangeiros sem contato local.\n\nValor fixo de US$ ${PRECO_RESTAURANTES_HIGHEND_USD}, para grupos de até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas. Grupos maiores, consulte.`,
    calcPreco: (ctx: PrecoCtx) => Math.round(PRECO_RESTAURANTES_HIGHEND_USD * ctx.cambioCotacao),
  },
  {
    key: "concierge",
    categoria: "opcional",
    label: "Concierge Durante a Viagem",
    icone: "🛎️",
    descricao: "Suporte dedicado para pedidos e imprevistos no roteiro",
    detalhe:
      "Concierge dedicado durante toda a viagem, para pedidos, ajustes de roteiro e imprevistos — sob consulta conforme o interesse do grupo.",
    calcPreco: () => 0,
  },
  {
    key: "experienciasSobMedida",
    categoria: "opcional",
    label: "Experiências Sob Medida",
    icone: "✨",
    descricao: "Ingressos especiais, eventos sazonais e atividades personalizadas",
    detalhe:
      "Experiências sob medida — ingressos especiais, eventos sazonais e atividades personalizadas — conforme o interesse do grupo. Sob consulta.",
    calcPreco: () => 0,
  },
  {
    key: "roteiro",
    categoria: "essencial",
    label: "Roteiro Personalizado",
    icone: "📱",
    descricao: "Painel digital Ajisai com o roteiro sob medida do seu grupo",
    detalhe:
      "Roteiro Digital Ajisai personalizado dia a dia — atrações, deslocamento, refeições e informações práticas dos aeroportos, montado sob medida para o seu grupo e acessível pelo navegador do celular durante toda a viagem. Incluso em toda Viagem Personalizada.",
    calcPreco: (ctx: PrecoCtx) =>
      ROTEIRO_PRECO_BASE + Math.max(0, ctx.dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA,
  },
  {
    key: "transferOnibus",
    categoria: "opcional",
    label: "Transfer de Ônibus Aeroporto ↔ Centro de Tóquio",
    icone: "🚌",
    descricao: "Aeroporto → Centro de Tóquio (chegada) e Centro de Tóquio → Aeroporto (saída)",
    detalhe:
      "Transfer de ônibus entre o aeroporto (Narita ou Haneda) e o centro de Tóquio, nos dois sentidos: do aeroporto até o centro na chegada, e do centro até o aeroporto na saída. Valor sob consulta, conforme aeroporto e horário do voo.",
    calcPreco: () => 0,
  },
  {
    key: "wifi",
    categoria: "opcional",
    label: "Wi-fi",
    icone: "📶",
    descricao: "Conexão disponível durante todo o roteiro",
    detalhe:
      "Pocket Wi-Fi ou eSIM 5G com conexão de dados disponível durante todo o roteiro, para todo o grupo.",
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(DIARIA_WIFI_USD_PAX * ctx.dias * ctx.pessoas * ctx.cambioCotacao),
  },
  {
    key: "ingressos",
    categoria: "opcional",
    label: "Ingressos para Atrações: Disney e Universal",
    icone: "🎟️",
    descricao: "Ingresso avulso, por pessoa",
    detalhe:
      "Ingresso para Tokyo Disney Resort ou Universal Studios Japan, por pessoa.",
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(PRECO_INGRESSO_DISNEY_UNIVERSAL_USD_PAX * ctx.pessoas * ctx.cambioCotacao),
  },
] as const;

type OpcaoKey = (typeof OPCOES)[number]["key"];

// Itens essenciais vêm pré-selecionados; os complementares (JR Pass, seguro
// viagem, câmbio, motorista privado) ficam disponíveis pra adicionar sob
// demanda.
const ITENS_PADRAO: OpcaoKey[] = ["aereo", "hotel", "roteiro"];

// Os 20 destinos mais procurados do Japão pra turismo de lazer — mistura de
// grandes cidades, cultura tradicional, natureza e praia/ilhas. Só Tokyo,
// Osaka, Kyoto e Hakone têm foto na biblioteca de imagens por enquanto; os
// demais seguem com fundo sólido (só o nome) até você subir fotos reais.
export const DESTINOS = [
  { key: "tokyo", nome: "Tokyo", imagem: "/images/tokyo.jpg" },
  { key: "kyoto", nome: "Kyoto", imagem: "/images/kyoto-maiko-street.png" },
  { key: "osaka", nome: "Osaka", imagem: "/images/osaka-castle.png" },
  { key: "hokkaido", nome: "Hokkaido (Sapporo)", imagem: "/images/sapporo.jpg" },
  { key: "okinawa", nome: "Okinawa", imagem: "/images/okinawa.jpg" },
  { key: "hiroshima", nome: "Hiroshima", imagem: "/images/hiroshima.jpg" },
  { key: "nara", nome: "Nara", imagem: null },
  { key: "hakone", nome: "Hakone", imagem: "/images/fuji.JPG" },
  { key: "nikko", nome: "Nikko", imagem: "/images/nikko.jpg" },
  { key: "kanazawa", nome: "Kanazawa", imagem: "/images/kanazawa.jpg" },
  { key: "takayama", nome: "Takayama", imagem: "/images/takayama.jpg" },
  { key: "kamakura", nome: "Kamakura", imagem: "/images/kamakura.jpg" },
  { key: "nagoya", nome: "Nagoya", imagem: "/images/nagoya.webp" },
  { key: "fukuoka", nome: "Fukuoka", imagem: "/images/fukuoka.jpg" },
  { key: "kobe", nome: "Kobe", imagem: "/images/kobe.jpg" },
  { key: "yokohama", nome: "Yokohama", imagem: "/images/yokohama.jpg" },
  { key: "miyajima", nome: "Miyajima", imagem: "/images/miyajima.jpg" },
  { key: "nagano", nome: "Nagano", imagem: "/images/nagano.webp" },
  { key: "ishigaki", nome: "Ishigaki", imagem: "/images/ishigaki.jpg" },
  { key: "yakushima", nome: "Yakushima", imagem: "/images/yakushima.jpg" },
] as const;

type DestinoKey = (typeof DESTINOS)[number]["key"];

// Ajuste de preço de hotel por cidade — mercados de hospedagem mais
// concorridos (Tokyo, Kyoto e destinos turísticos densos como Hakone e
// Ishigaki) custam mais que cidades menores/regionais. Ajuste relativo de
// mercado, não uma tabela de diária negociada por cidade — pedido do
// Wilson, 01/set/2026: "a cidade também deve influenciar a calculadora do
// hotel", como um multiplicador simples sobre o preço por categoria.
export const CIDADE_MULTIPLICADOR_HOTEL: Record<DestinoKey, number> = {
  tokyo: 1.15,
  kyoto: 1.1,
  osaka: 1.0,
  hokkaido: 0.95,
  okinawa: 1.05,
  hiroshima: 0.9,
  nara: 0.9,
  hakone: 1.05,
  nikko: 0.9,
  kanazawa: 0.9,
  takayama: 0.85,
  kamakura: 0.95,
  nagoya: 0.9,
  fukuoka: 0.9,
  kobe: 0.95,
  yokohama: 1.0,
  miyajima: 0.9,
  nagano: 0.85,
  ishigaki: 1.05,
  yakushima: 0.9,
};

const MIN_DIAS = 3;
const MAX_DIAS = 30;

const MIN_PESSOAS = 1;
const MAX_PESSOAS = 20;

// Grupos acima de 3 pessoas têm custo adicional de logística (veículo maior,
// guia/motorista ajustado etc.) — cobrado por passageiro excedente. Preço
// final já com imposto+margem.
const LIMITE_PESSOAS_SEM_TAXA = 3;
const TAXA_POR_PASSAGEIRO_EXTRA = comMargemEImposto(350);

export function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  formatValue,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  formatValue?: (value: number) => string;
}) {
  return (
    <label className="flex h-full flex-col">
      <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-[#0A2540]/50">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Diminuir — ${label}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-[#0A2540] transition hover:border-black/30"
        >
          −
        </button>
        <span className="flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-black/15 bg-black/[0.03] px-1 text-center text-sm text-[#0A2540]">
          {formatValue ? formatValue(value) : value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Aumentar — ${label}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-[#0A2540] transition hover:border-black/30"
        >
          +
        </button>
      </div>
    </label>
  );
}

export function CustomPackageCard({
  focoInicial,
}: {
  // Abre direto o popup "Ver detalhes" de um item ao montar — usado pelo
  // card "Hoteis" em /produtos pra levar direto pros exemplos de
  // propriedade por categoria (Elite etc.), sem precisar navegar/clicar.
  focoInicial?: "hotel";
} = {}) {
  const { addItem } = useCart();
  const cambio = useCambioUSD();
  const [data, setData] = useState("");
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [acima60, setAcima60] = useState(0);
  const [menoresIdade, setMenoresIdade] = useState(0);
  const [criancas, setCriancas] = useState(0);
  const [categoriaHotel, setCategoriaHotel] =
    useState<(typeof CATEGORIAS_HOTEL)[number]>("4 estrelas");
  const [tipoQuarto, setTipoQuarto] =
    useState<(typeof TIPOS_QUARTO)[number]>("Individual");
  const [classeAereo, setClasseAereo] =
    useState<(typeof CLASSES_AEREO)[number]>("Economy");
  const [selecionados, setSelecionados] = useState<Set<OpcaoKey>>(
    () => new Set(ITENS_PADRAO),
  );
  const [destinosSelecionados, setDestinosSelecionados] = useState<Set<DestinoKey>>(
    () => new Set(),
  );
  const [observacoes, setObservacoes] = useState("");
  const [mostrarTodosDestinos, setMostrarTodosDestinos] = useState(false);
  const [adicionado, setAdicionado] = useState(false);
  const [opcaoAberta, setOpcaoAberta] = useState<(typeof OPCOES)[number] | null>(null);
  // JR Pass tem preço por faixa de dias (7/14/21), não por diária — o
  // cliente precisa escolher; a escolha fica disponível em "Ver detalhes".
  const [jrPassDias, setJrPassDias] =
    useState<(typeof JR_PASS_DIAS_OPCOES)[number]>(7);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (focoInicial === "hotel") {
      const item = OPCOES.find((o) => o.key === "hotel");
      if (item) setOpcaoAberta(item);
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Média dos multiplicadores de cidade das cidades selecionadas em
  // "Destinos" — 1 (sem ajuste) enquanto nenhuma cidade estiver marcada.
  const multiplicadorCidadeHotel = useMemo(() => {
    if (destinosSelecionados.size === 0) return 1;
    let soma = 0;
    destinosSelecionados.forEach((key) => {
      soma += CIDADE_MULTIPLICADOR_HOTEL[key];
    });
    return soma / destinosSelecionados.size;
  }, [destinosSelecionados]);

  const precoCtx = useMemo<PrecoCtx>(
    () => ({
      dias,
      pessoas,
      categoriaHotel,
      tipoQuarto,
      classeAereo,
      jrPassDias,
      // Mesmo fallback usado internamente por useCambioUSD enquanto a
      // cotação do dia ainda não carregou.
      cambioCotacao: cambio?.cotacao ?? 5.3,
      multiplicadorCidadeHotel,
    }),
    [
      dias,
      pessoas,
      categoriaHotel,
      tipoQuarto,
      classeAereo,
      jrPassDias,
      cambio,
      multiplicadorCidadeHotel,
    ],
  );

  const itensSelecionados = useMemo(
    () => OPCOES.filter((o) => selecionados.has(o.key)),
    [selecionados],
  );

  const opcoesEssenciais = useMemo(
    () => OPCOES.filter((o) => o.categoria === "essencial"),
    [],
  );
  const opcoesOpcionais = useMemo(
    () => OPCOES.filter((o) => o.categoria === "opcional"),
    [],
  );

  function renderOpcaoCard(opcao: (typeof OPCOES)[number]) {
    const ativo = selecionados.has(opcao.key);
    return (
      <div
        key={opcao.key}
        role="button"
        tabIndex={0}
        onClick={() => toggleOpcao(opcao.key)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpcao(opcao.key);
          }
        }}
        aria-pressed={ativo}
        className={`flex h-full cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
          ativo
            ? "border-[#2f80c9]/50 bg-[#2f80c9]/10"
            : "border-black/10 bg-black/[0.02] hover:border-black/20"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
              ativo
                ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                : "border-black/25 text-transparent"
            }`}
          >
            <IconCheck className="h-3 w-3" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-medium text-[#0A2540]">
            {opcao.icone} {opcao.label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpcaoAberta(opcao);
            }}
            aria-label={`Ver detalhes — ${opcao.label}`}
            className="flex shrink-0 items-center gap-1 rounded-full border border-black/15 px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[#0A2540]/50 transition hover:border-black/35 hover:text-[#0A2540]"
          >
            <IconDocument className="h-3 w-3" />
            Ver detalhes
          </button>
        </div>
        <span className="block flex-1 pl-8 text-xs leading-5 text-[#0A2540]/50">
          {opcao.descricao}
        </span>
        {opcao.key === "jrpass" && ativo && (
          <span
            className="ml-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#2f80c9]/30 bg-[#2f80c9]/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2f80c9]"
            onClick={(e) => e.stopPropagation()}
          >
            {jrPassDias} dias · {formatUSD(JR_PASS_PRECO_USD[jrPassDias])}
          </span>
        )}
      </div>
    );
  }

  const passageirosExtras = Math.max(0, pessoas - LIMITE_PESSOAS_SEM_TAXA);
  const taxaGrupo = passageirosExtras * TAXA_POR_PASSAGEIRO_EXTRA;

  const total = useMemo(
    () =>
      itensSelecionados.reduce((soma, o) => soma + o.calcPreco(precoCtx), 0) +
      taxaGrupo,
    [itensSelecionados, precoCtx, taxaGrupo],
  );

  function toggleOpcao(key: OpcaoKey) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleDestino(key: DestinoKey) {
    setDestinosSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const DESTINOS_TOP5 = 5;
  const destinosVisiveis = mostrarTodosDestinos ? DESTINOS : DESTINOS.slice(0, DESTINOS_TOP5);
  const destinosOcultos = DESTINOS.length - DESTINOS_TOP5;

  const nomesDestinos = useMemo(
    () => DESTINOS.filter((d) => destinosSelecionados.has(d.key)).map((d) => d.nome),
    [destinosSelecionados],
  );

  const detalhesPacote = useMemo(() => {
    const linhas: string[] = [];
    linhas.push(`Passageiros: ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`);
    if (acima60 > 0)
      linhas.push(`Acima de 60 anos: ${acima60}`);
    if (menoresIdade > 0)
      linhas.push(`Menores de idade (12–17 anos): ${menoresIdade}`);
    if (criancas > 0)
      linhas.push(`Crianças (até 11 anos): ${criancas}`);
    if (taxaGrupo > 0)
      linhas.push(
        `Taxa de grupo: R$ ${taxaGrupo.toLocaleString("pt-BR")} (${passageirosExtras} ${
          passageirosExtras === 1 ? "passageiro" : "passageiros"
        } acima de ${LIMITE_PESSOAS_SEM_TAXA})`,
      );
    if (nomesDestinos.length) linhas.push(`Destinos: ${nomesDestinos.join(", ")}`);
    if (observacoes) linhas.push(`Preferências: ${observacoes}`);
    return linhas;
  }, [
    pessoas,
    acima60,
    menoresIdade,
    criancas,
    taxaGrupo,
    passageirosExtras,
    nomesDestinos,
    observacoes,
  ]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const dataFormatada = data
      ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Data a combinar";

    addItem({
      divisao: "Viagem Personalizada",
      nome: "Viagem Personalizada",
      variante: `Data solicitada: ${dataFormatada}`,
      duracao: `${dias} dias`,
      periodo: dataFormatada,
      acomodacao: `${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"} · ${tipoQuarto} · Hotel ${categoriaHotel}`,
      itens: itensSelecionados.map((o) => {
        if (o.key === "hotel") return { icone: o.icone, texto: `${o.label} — ${categoriaHotel}` };
        if (o.key === "aereo") return { icone: o.icone, texto: `${o.label} — ${classeAereo}` };
        return { icone: o.icone, texto: o.label };
      }),
      detalhes: detalhesPacote.length > 0 ? detalhesPacote : undefined,
      precoLabel: total > 0 ? brlParaUSDLabel(total, cambio) : "Sob consulta",
      precoSufixo:
        total > 0
          ? `estimativa, sujeita a confirmação — câmbio do dia${
              cambio?.data ? ` (${cambio.data})` : ""
            }: US$ 1 = R$ ${cambio ? cambio.cotacao.toFixed(2).replace(".", ",") : "—"}`
          : undefined,
      imagem: "/images/personalizado-hero.png",
    });

    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <>
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:rounded-[2rem] md:p-8">
      <p className={`${display.className} text-3xl font-semibold uppercase tracking-[0.08em] text-black md:text-4xl`}>
        Viagem Personalizada
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/50">
              Total estimado
            </p>
            <p
              className={`${display.className} mt-1 text-4xl font-semibold`}
              style={{ color: "#1f6f9c" }}
            >
              {total > 0 ? brlParaUSDLabel(total, cambio) : "Sob consulta"}
            </p>
            {total > 0 && (
              <p className="mt-1 text-sm font-medium text-[#0A2540]/60">ou {formatBRL(total)}</p>
            )}
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#0A2540]/45">
              Por pessoa · Quarto {tipoQuarto}
            </p>
            {total > 0 && (
              <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-[#0A2540]/45" />
            )}
            {taxaGrupo > 0 && (
              <p className="mt-1 text-[11px] leading-5 text-[#0A2540]/55">
                Inclui taxa de grupo: R$ {taxaGrupo.toLocaleString("pt-BR")} (
                {passageirosExtras} {passageirosExtras === 1 ? "passageiro" : "passageiros"}{" "}
                acima de {LIMITE_PESSOAS_SEM_TAXA})
              </p>
            )}
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
              <p className="text-sm font-medium leading-5 text-amber-900">
                Valor calculado conforme os itens selecionados acima — a
                Ajisai confirma o preço final por consulta.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!cambio}
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:px-8"
            style={{ backgroundColor: adicionado ? "#2f9e6e" : "#2f80c9" }}
          >
            {adicionado ? (
              <>
                <IconCheck className="h-4 w-4" /> Adicionado ao carrinho
              </>
            ) : (
              <>
                <IconCart className="h-4 w-4" /> Adicionar ao carrinho
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-[#0A2540]/50">
              Data preferida
            </span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none [color-scheme:light] focus:border-black/30"
            />
          </label>

          <NumberStepper
            label="Quantidade de dias"
            value={dias}
            onChange={setDias}
            min={MIN_DIAS}
            max={MAX_DIAS}
            formatValue={(v) => `${v} ${v === 1 ? "dia" : "dias"}`}
          />

          <NumberStepper
            label="Número de pessoas"
            value={pessoas}
            onChange={setPessoas}
            min={MIN_PESSOAS}
            max={MAX_PESSOAS}
            formatValue={(v) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`}
          />

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-[#0A2540]/50">
              Categoria do hotel
            </span>
            <select
              value={categoriaHotel}
              onChange={(e) =>
                setCategoriaHotel(e.target.value as (typeof CATEGORIAS_HOTEL)[number])
              }
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none focus:border-black/30"
            >
              {CATEGORIAS_HOTEL.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-[#0A2540]/50">
              Tipo de quarto
            </span>
            <select
              value={tipoQuarto}
              onChange={(e) => setTipoQuarto(e.target.value as (typeof TIPOS_QUARTO)[number])}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none focus:border-black/30"
            >
              {TIPOS_QUARTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-[#0A2540]/50">
              Classe do voo
            </span>
            <select
              value={classeAereo}
              onChange={(e) => setClasseAereo(e.target.value as (typeof CLASSES_AEREO)[number])}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none focus:border-black/30"
            >
              {CLASSES_AEREO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        {pessoas > LIMITE_PESSOAS_SEM_TAXA && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
            <p className="text-sm font-medium leading-6 text-amber-700">
              Grupos acima de {LIMITE_PESSOAS_SEM_TAXA} pessoas têm taxa adicional de R${" "}
              {TAXA_POR_PASSAGEIRO_EXTRA.toLocaleString("pt-BR")} por passageiro excedente —
              já incluída no total estimado abaixo.
            </p>
          </div>
        )}

        <div>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/50">
            Perfil dos passageiros{" "}
            <span className="normal-case tracking-normal text-[#0A2540]/30">(opcional)</span>
          </span>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <NumberStepper
              label="Acima de 60 anos"
              value={acima60}
              onChange={setAcima60}
              min={0}
              max={pessoas}
            />
            <NumberStepper
              label="Menores de idade (12–17 anos)"
              value={menoresIdade}
              onChange={setMenoresIdade}
              min={0}
              max={pessoas}
            />
            <NumberStepper
              label="Crianças (até 11 anos)"
              value={criancas}
              onChange={setCriancas}
              min={0}
              max={pessoas}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/50">
              Monte seu pacote
            </span>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">
              Essenciais
            </p>
            <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2">
              {opcoesEssenciais.map((opcao) => renderOpcaoCard(opcao))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0A2540]/45">
              Opcionais
            </p>
            <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2">
              {opcoesOpcionais.map((opcao) => renderOpcaoCard(opcao))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/50">
            Destinos
          </span>
          <p className="mb-2.5 text-xs text-[#0A2540]/50">
            As cidades marcadas também ajustam o preço da diária de hotel.
          </p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {destinosVisiveis.map((destino) => {
              const ativo = destinosSelecionados.has(destino.key);
              return (
                <button
                  key={destino.key}
                  type="button"
                  onClick={() => toggleDestino(destino.key)}
                  aria-pressed={ativo}
                  className={`group relative aspect-square overflow-hidden rounded-xl border text-left transition ${
                    ativo
                      ? "border-[#2f80c9] shadow-[0_0_0_1px_rgba(47,128,201,0.5)]"
                      : "border-black/10 hover:border-black/25"
                  }`}
                >
                  {destino.imagem ? (
                    <Image
                      src={destino.imagem}
                      alt={destino.nome}
                      fill
                      sizes="140px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c2b45] to-[#0a0f1c]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 right-2 text-center text-xs font-medium leading-tight text-white">
                    {destino.nome}
                  </span>
                  <span
                    className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition ${
                      ativo
                        ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                        : "border-white/40 bg-black/30 text-transparent"
                    }`}
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                </button>
              );
            })}

            {!mostrarTodosDestinos && destinosOcultos > 0 && (
              <button
                type="button"
                onClick={() => setMostrarTodosDestinos(true)}
                className="group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/20 bg-black/[0.02] text-[#0A2540]/60 transition hover:border-black/35 hover:bg-black/[0.05] hover:text-[#0A2540]"
              >
                <span className="text-lg font-semibold">+{destinosOcultos}</span>
                <span className="text-[10px] uppercase tracking-[0.1em]">Ver mais</span>
              </button>
            )}
          </div>

          {mostrarTodosDestinos && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setMostrarTodosDestinos(false)}
                className="inline-flex items-center gap-2 rounded-full border border-[#2f80c9]/40 bg-[#2f80c9]/10 px-6 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9] transition hover:bg-[#2f80c9]/20"
              >
                <span aria-hidden="true">↑</span> Ver menos destinos
              </button>
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/50">
            O que você gostaria de incluir? (opcional)
          </span>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Ex: passeio noturno em Ginza, compras em Ginza, jantar especial..."
            className="w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 py-2.5 text-sm text-[#0A2540] outline-none placeholder:text-[#0A2540]/30 focus:border-black/30"
          />
        </label>
      </form>
    </div>

    {mounted &&
      opcaoAberta &&
      createPortal(
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setOpcaoAberta(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[24px] border border-white/10 bg-[#0a0a0a] p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpcaoAberta(null)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
            <p className="pr-8 text-base font-medium text-white">
              {opcaoAberta.icone} {opcaoAberta.label}
            </p>
            {opcaoAberta.key === "roteiro" && (
              <div className="mt-3">
                <video
                  src="/videos/roteiro-personalizado-short.mp4"
                  poster="/videos/roteiro-personalizado-short-poster.jpg"
                  controls
                  playsInline
                  className="w-full rounded-xl border border-white/10"
                />
              </div>
            )}
            {opcaoAberta.key === "jrpass" && (
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Escolha a duração — o cliente precisa selecionar uma faixa
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {JR_PASS_DIAS_OPCOES.map((d) => {
                    const ativo = d === jrPassDias;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setJrPassDias(d);
                          setSelecionados((prev) => new Set(prev).add("jrpass"));
                        }}
                        aria-pressed={ativo}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 transition ${
                          ativo
                            ? "border-[#2f80c9] bg-[#2f80c9]/15"
                            : "border-white/15 bg-white/[0.03] hover:border-white/30"
                        }`}
                      >
                        <span className="text-sm font-semibold text-white">{d} dias</span>
                        <span className="text-[10px] text-white/50">
                          {formatUSD(JR_PASS_PRECO_USD[d])}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {opcaoAberta.key === "hotel" && (
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Exemplos de Propriedades
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {CATEGORIAS_HOTEL.map((cat) => {
                    const info = EXEMPLOS_HOTEIS[cat];
                    const ativo = cat === categoriaHotel;
                    const amenidadeLabel: [keyof typeof info.amenidades, string][] = [
                      ["piscina", "Piscina"],
                      ["academia", "Academia"],
                      ["sauna", "Sauna"],
                      ["restaurante", "Restaurante"],
                    ];
                    return (
                      <div
                        key={cat}
                        className={`rounded-xl border p-3 ${
                          ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06]" : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white">
                          {cat}
                        </p>
                        <p className="mt-1 text-[11px] text-white/50">{info.exemplos.join(" · ")}</p>
                        <p className="mt-2 text-[11px] text-white/65">
                          <span className="text-white/40">m² médio:</span> {info.m2Medio}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/65">
                          <span className="text-white/40">Quarto:</span> {info.tipoQuarto}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {amenidadeLabel.map(([key, label]) => (
                            <span
                              key={key}
                              className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.05em] ${
                                info.amenidades[key]
                                  ? "border-[#6ec3d9]/40 bg-[#6ec3d9]/[0.08] text-[#6ec3d9]"
                                  : "border-white/10 text-white/30 line-through"
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {opcaoAberta.key === "transporte" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/10 bg-black">
                    <Image
                      src="/images/toyota-alphard.jpg"
                      alt="Toyota Alphard"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.1em] text-white/50">
                    Toyota Alphard
                  </p>
                </div>
                <div>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/10 bg-black">
                    <Image
                      src="/images/toyota-hiace.jpg"
                      alt="Toyota Hiace"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.1em] text-white/50">
                    Toyota Hiace
                  </p>
                </div>
              </div>
            )}
            <p className="mt-3 whitespace-pre-line text-sm font-light leading-6 text-white/65">
              {opcaoAberta.detalhe}
            </p>
            {opcaoAberta.key === "roteiro" && (
              <div className="relative mx-auto mt-4 aspect-[1024/1536] w-full max-w-[140px] overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/mock-roteiro-iphone.png"
                  alt="Painel Ajisai — roteiro diário personalizado"
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
