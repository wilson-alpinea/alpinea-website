// Dados das seguradoras parceiras e do roteiro do Seguro Viagem — movidos
// de app/produtos/page.tsx (antigo SeguroViagemModal) em 29/set/2026,
// quando o Seguro Viagem ganhou página própria (/produtos/seguro-viagem).
// Conteúdo e histórico de decisões preservados como estavam.

// As 3 seguradoras parceiras de hoje (Wilson, 25/set/2026: "hoje
// trabalhamos com 3 empresas Affinity, GTA e MTA, o cliente pode escolher
// qualquer 1 dos 3"). Dados de cobertura pesquisados nos sites oficiais
// (affinityseguroviagem.com.br, gtaassist.com.br/segurogta.com.br,
// mytravelassist.com.br) em 25/set/2026 — nenhum dos três expõe uma
// tabela estática de plano×preço (o preço só sai depois de rodar a
// cotação com destino/datas/idade no site deles), então aqui entram só
// fatos que consegui confirmar com confiança:
// - Affinity 40 Essential: cobertura e preço exatamente como o Wilson
//   mandou print (25/set/2026) — US$ 40.000 em despesas médicas, US$ 500
//   em bagagem, "não atende EUA/Canadá".
// - MTA (My Travel Assist): a faixa de planos internacionais (MTA
//   15/30/40/60/150, US$ 15 mil a US$ 150 mil) veio de uma matéria da
//   Segurospromo sobre a seguradora — consistente com a nomenclatura do
//   Affinity 40 (número do plano = cobertura em milhares de dólar).
// - GTA (Global Travel Assistance): tentei o mesmo pros planos GTA, mas
//   os nomes/valores que encontrei em fontes diferentes não bateram entre
//   si (o site tem várias famílias de plano por região — Europa, EUA/
//   Canadá, América Latina, Mundial — e cada busca voltou uma tabela
//   diferente). Preferi não arriscar um plano/valor errado numa página
//   de venda pra cliente de alta renda — fica só a faixa ampla que se
//   repetiu em mais de uma fonte (US$ 36 mil a mais de US$ 300 mil,
//   conforme o plano), sem fixar nome de plano específico.
// O valor de referência mostrado no formulário (abaixo) é sempre o preço
// interno da Ajisai (DIARIA_SEGURO_VIAGEM × dias × multiplicador de
// idade — mesma fórmula usada na Calculadora Reversa e no self-service de
// Viagem Personalizada) — não é o preço de nenhuma seguradora específica;
// o plano e o valor final de cada uma são confirmados no fechamento.
//
// Ajuste 25/set/2026 (mesmo dia, pedido seguinte do Wilson): "incluir
// informações essenciais dos tipos de seguro viagem disponivel em cada
// uma das seguradoras e adicionar apolice e termos e condições de cada
// um". `tiposPlano` e `termosUrl`/`termosNota` abaixo vieram de nova
// pesquisa nos sites oficiais (25/set/2026):
// - Affinity: categorias de plano confirmadas na página oficial
//   (affinityseguroviagem.com.br) — Internacional/Nacional, Europa
//   (Schengen), Anual, Estudante, Esportes, Cruzeiros, Corporativo. PDF
//   de condições gerais linkado direto no rodapé do site oficial.
// - MTA: mantive a faixa MTA 15/30/40/60/150 já confirmada (fonte
//   Segurospromo) como os "tipos" — a My Travel Assist não nomeia planos
//   por categoria de viagem como as outras duas, só por faixa de
//   cobertura médica. PDF de condições gerais linkado no site oficial
//   parceiro (travelassist.com.br), que é quem opera a venda da MTA.
// - GTA: o site oficial não organiza os planos por nome/valor fixo, e
//   sim por destino (EUA, Europa, Brasil, América Latina, Canadá, Outros
//   destinos, Cruzeiros, Mundial, Copa do Mundo), por perfil (Lazer,
//   Estudante, Cruzeiro, Multiviagem, Receptivo, Esporte profissional) e
//   por faixa etária (até 64 / 65–85 / 86–89 anos) — usei exatamente essa
//   classificação oficial, sem inventar nome de plano. As condições
//   gerais da GTA também não são um PDF único: o site oficial lista uma
//   página-índice com vários PDFs, um por seguradora reguladora (IZA,
//   Chubb, Sancor, Sompo) e por data de vigência — linkei essa
//   página-índice e expliquei isso no texto, em vez de escolher um PDF
//   arbitrariamente.
//
// Ajuste no mesmo dia, depois de o Wilson abrir os PDFs e estranhar
// ("sabemi? ezze seguros? que diabos é isso? colocou material de
// seguradoras concorrentes em vez de informacao do site oficial?"):
// conferi de novo, abrindo os PDFs de verdade. Não é material de
// concorrente — é o documento oficial certo, só que assinado pela
// SEGURADORA REGULADORA (a empresa com registro na SUSEP que responde
// pela apólice), que é uma empresa diferente da marca comercial de
// assistência-viagem (GTA/MTA/Affinity não são seguradoras licenciadas
// — são administradoras do programa de assistência, o seguro em si é
// emitido por uma parceira regulada). Confirmado abrindo os PDFs:
// - O PDF oficial da MTA (travelassist.com.br) é emitido pela EZZE
//   Seguros S.A. (CNPJ 31.534.848/0001-24, SUSEP 15414.649792/2026-78)
//   — "My Travel Assist"/"MTA" não aparece em nenhum lugar do documento.
// - O índice de condições gerais da GTA lista PDFs históricos assinados
//   por IZA, Chubb, Sancor e Sompo (nenhum "Sabemi" nessa lista, pelo
//   menos até onde consegui ver) — qual seguradora aparece depende de
//   qual PDF específico da lista o cliente abre.
// - O PDF da Affinity é ainda mais estranho: em vez de mostrar um nome
//   de seguradora de verdade, usa um placeholder literal
//   "(SEGURADORA) SEGUROS S/A" — parece um modelo/template que a
//   Affinity não preencheu direito no site oficial deles. Vale
//   confirmar direto com a Affinity qual seguradora responde pela
//   apólice antes de apresentar isso pra cliente.
//
// Decisão final do Wilson, mesmo dia, depois de ver os PDFs de novo:
// "já pedi pra substituir isso pelas informacoes oficiais você nunca
// deve usar material de empresas concorrentes" — regra clara,
// independente da explicação técnica acima (marca vs. seguradora
// reguladora): não expor nesta página nenhum documento assinado por
// uma empresa diferente da marca escolhida pelo cliente. Removi os
// links de "condições gerais" da GTA e da MTA (`termosUrl`/
// `termosLabel` = null) — o `termosNota` de cada uma explica que o
// documento completo é enviado junto com a apólice no fechamento, sem
// linkar um PDF assinado pela seguradora parceira. Mantive o link da
// Affinity: o PDF dela é hospedado no domínio oficial dela e não tem
// nome nem logo de nenhuma outra empresa (só o placeholder genérico
// "(SEGURADORA) SEGUROS S/A" — problema de template, não material de
// concorrente).
// Apólice contratada + valores de cobertura — substituem os "tipos de
// plano" (Wilson, 06/out/2026: "remover tipos de planos das seguradoras,
// adicionar informações das apólices contratadas e valor da cobertura").
// Wilson vai enviar os dados oficiais de cada apólice: `valor: null` =
// ainda não informado (a página mostra "consta na apólice"). Preencher aqui.
export type CoberturaApolice = { item: string; valor: string | null };
export type ApoliceSeguradora = { plano: string | null; coberturas: CoberturaApolice[] };

export const SEGURADORAS_VIAGEM: {
  key: "affinity" | "gta" | "mta";
  nome: string;
  logo: string;
  descricao: string;
  observacao: string | null;
  apolice: ApoliceSeguradora;
  termosUrl: string | null;
  termosLabel: string | null;
  termosNota: string;
}[] = [
  {
    key: "affinity",
    nome: "Affinity",
    // Logo enviado pelo Wilson, 25/set/2026.
    logo: "/images/Affinity-Logo.png",
    descricao:
      "Plano de referência: 40 Essential — cobertura médica de US$ 40.000 e US$ 500 em bagagem extraviada.",
    observacao: "Não atende EUA/Canadá — para esses destinos a Affinity tem planos de cobertura maior.",
    // "Europa (Schengen)" removido daqui — pedido do Wilson, 25/set/2026
    // ("você lista tipos de seguro que não tem aplicacao para Japao e
    // Asia, qual o racional?"): é uma faixa específica pra destinos do
    // Espaço Schengen, não cobre Japão nem o resto da Ásia, então não
    // faz sentido mostrar numa página de venda focada em Japão. Mantidos
    // só os tipos que não são restritos a outra região (a Affinity não
    // tem uma faixa "Ásia" própria — cobertura pra Japão entra no
    // "Internacional/Nacional").
    apolice: {
      plano: "Affinity 40 Essential",
      coberturas: [
        { item: "Despesas médicas e hospitalares", valor: "US$ 40.000" },
        { item: "Despesas odontológicas", valor: null },
        { item: "Traslado médico e repatriação sanitária", valor: null },
        { item: "Repatriação funerária", valor: null },
        { item: "Bagagem extraviada", valor: "US$ 500" },
        { item: "Cancelamento de viagem", valor: null },
      ],
    },
    termosUrl: "https://affinityseguroviagem.com.br/condicoes-gerais/afinity.pdf",
    termosLabel: "Condições gerais (PDF)",
    termosNota:
      "PDF oficial da Affinity. Repare que ele não nomeia a seguradora reguladora (usa um texto genérico no lugar) — confirmamos qual seguradora responde pela apólice antes de fechar.",
  },
  {
    key: "gta",
    nome: "GTA",
    // Logo enviado pelo Wilson, 25/set/2026 (mandou depois dos outros
    // dois, no mesmo dia).
    logo: "/images/GTA-Logo.png",
    descricao:
      "Global Travel Assistance — uma das seguradoras de viagem mais tradicionais do Brasil, com planos de US$ 36 mil a mais de US$ 300 mil em cobertura médica.",
    observacao:
      "Para Japão/Ásia o plano correto é o Mundial — a GTA não tem faixa própria pra esses destinos, e as faixas EUA/Europa/Brasil/América Latina/Canadá não se aplicam. Cobertura varia dentro do Mundial — confirmamos o plano exato no fechamento.",
    // "Por destino" filtrado — pedido do Wilson, 25/set/2026 ("você
    // lista tipos de seguro que não tem aplicacao para Japao e Asia,
    // qual o racional?"): a lista completa da GTA (EUA, Europa, Brasil,
    // América Latina, Canadá, Mundial, Cruzeiros) tinha 5 faixas que não
    // cobrem Japão/Ásia. A GTA não vende uma faixa "Ásia" específica —
    // pra esses destinos o cliente cai no Mundial por eliminação, então
    // é a única faixa de destino que faz sentido mostrar aqui.
    apolice: {
      plano: "GTA Mundial",
      coberturas: [
        { item: "Despesas médicas e hospitalares", valor: null },
        { item: "Despesas odontológicas", valor: null },
        { item: "Traslado médico e repatriação sanitária", valor: null },
        { item: "Repatriação funerária", valor: null },
        { item: "Bagagem extraviada", valor: null },
        { item: "Cancelamento de viagem", valor: null },
      ],
    },
    termosUrl: null,
    termosLabel: null,
    termosNota:
      "Condições gerais completas — fornecidas junto com a apólice no fechamento. O documento oficial da GTA vem assinado por uma seguradora parceira (histórico: IZA, Chubb, Sancor, Sompo), por isso não linkamos aqui um PDF assinado por outra marca.",
  },
  {
    key: "mta",
    nome: "MTA",
    // Logo enviado pelo Wilson, 25/set/2026.
    logo: "/images/MTA-Logo.png",
    descricao:
      "My Travel Assist — planos internacionais de US$ 15 mil a US$ 150 mil em cobertura médica (MTA 15/30/40/60/150), com mais de 30 coberturas e assistências.",
    observacao: null,
    apolice: {
      plano: null,
      coberturas: [
        { item: "Despesas médicas e hospitalares", valor: null },
        { item: "Despesas odontológicas", valor: null },
        { item: "Traslado médico e repatriação sanitária", valor: null },
        { item: "Repatriação funerária", valor: null },
        { item: "Bagagem extraviada", valor: null },
        { item: "Cancelamento de viagem", valor: null },
      ],
    },
    termosUrl: null,
    termosLabel: null,
    termosNota:
      "Condições gerais completas — fornecidas junto com a apólice no fechamento. O documento oficial da MTA vem assinado pela seguradora parceira EZZE Seguros, por isso não linkamos aqui um PDF assinado por outra marca.",
  },
];
export type SeguradoraKey = (typeof SEGURADORAS_VIAGEM)[number]["key"];

// Roteiro do Seguro Viagem — Japão é obrigatório (é o produto do site),
// mas o cliente pode incluir outros países da Ásia na mesma viagem. Pedido
// do Wilson, 25/set/2026: "escolher pais, japão é o obrigatorio, mas
// cliente pode colocar outros paises da Asia na lista, calcular como isso
// afeta o preço e também o preço de cada subtipo de planos".
//
// Pesquisei se Affinity/GTA/MTA publicam preço por país — não publicam:
// as 3 só geram cotação depois de rodar destino+datas+idade no site delas
// (mesmo achado já registrado acima pra tabela de plano×preço). Não achei
// nenhuma fonte confiável mostrando quanto cada seguradora cobra a mais
// por incluir outro país da Ásia no roteiro, então NÃO fabriquei esse
// número por seguradora nem por subtipo de plano (os "tipos de plano" de
// cada seguradora, como Internacional/Europa/Anual da Affinity ou os
// tiers MTA 15/30/40/60/150, são categorias qualitativas — nenhuma delas
// tem tabela pública de preço por categoria).
//
// O que apliquei foi só o ajuste de REFERÊNCIA INTERNA da Ajisai: viagem
// só pro Japão usa a tarifa diária padrão (DIARIA_SEGURO_VIAGEM); ao
// incluir qualquer outro país, o roteiro deixa de ser "destino único" e
// passa a precisar de cobertura ampliada (o que as 3 seguradoras chamam
// de plano "Mundial"/multidestino em vez do plano de destino único) — por
// isso a referência sobe um percentual fixo, do mesmo jeito que o resto
// dessa tela já é só a estimativa interna da Ajisai (não o preço de
// nenhuma seguradora). Isso fica bem explícito no texto da página; o
// plano/subtipo e o valor exatos de cada seguradora continuam sendo
// confirmados no fechamento, como já era.
export const PAISES_ASIA_ADICIONAIS = [
  "Coreia do Sul",
  "China",
  "Taiwan",
  "Hong Kong",
  "Tailândia",
  "Vietnã",
  "Cingapura",
  "Filipinas",
  "Indonésia",
  "Malásia",
  "Índia",
] as const;
// MULTIPLICADOR_ROTEIRO_MULTIDESTINO (o ajuste de +12% descrito acima) mora
// em app/lib/precoSeguroViagem.ts, junto do resto do motor de preço.
