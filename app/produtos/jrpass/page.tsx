"use client";

// JR Pass ganhou página própria (antes era um pop-up dentro de
// /produtos) — pedido do Wilson, 28/set/2026: "em vez de um pop-up, JR
// Pass agora tem uma pagina propria" + "deve haver um botão voltar para
// a pagina anterior de produtos". Toda a lógica e o conteúdo abaixo são
// os mesmos do antigo JrPassModal (só a moldura mudou: sem overlay
// escuro nem botão "×", com uma barra de voltar de verdade no topo e o
// rodapé fixo virando `fixed` de página em vez de rodapé de modal).
// Helpers compartilhados (display, FormasPagamento, IconCheck etc.)
// continuam vindo de app/produtos/page.tsx — são usados também pelos
// outros pop-ups (Câmbio, Seguro Viagem, Transporte Privado) que
// permanecem como modal por enquanto.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { formatBRL, formatUSD, type Cambio } from "../../hooks/useCambioUSD";
import { useCambioDolarTurismo } from "../../hooks/useCambioDolarTurismo";
import { CambioLabel } from "../../components/CambioLabel";
import {
  JR_PASS_PRECO_USD,
  JR_PASS_PRECO_USD_GREEN,
  JR_PASS_DIAS_OPCOES,
} from "../../components/CustomPackageCard";
import {
  SPREAD_DOLAR_TURISMO_PUBLICO,
  type FormaPagamentoEscolhida,
} from "../../lib/calculadoraCatalogoPublico";
import {
  display,
  WHATSAPP_NUMBER,
  FormasPagamento,
  descricaoFormaPagamento,
  hojeISO,
  formatarDataBR,
  IconCheck,
} from "../page";
import { RodapeCheckout } from "../RodapeCheckout";
import { ProdutoTestePagamento } from "../ProdutoTestePagamento";

// Fonte Inter só para os valores em dinheiro (R$/US$) — pedido do
// Wilson, 29/set/2026: "a fonte padrão de numeros deve ser INTER".
// Títulos e nomes de classe continuam na serifada (Bodoni/`display`).
const inter = Inter({ subsets: ["latin"], weight: ["500", "700"] });

// Passos da compra — pedido do Wilson, 28/set/2026: "adicionar tambem os
// passos para a compra (exemplo imagem 2)", com os 4 ícones que ele
// enviou. Adaptado pro nosso fluxo (a compra acontece aqui no site, não
// precisa buscar o passe presencialmente numa loja JR fora do Japão).
const COMO_FUNCIONA = [
  {
    icone: "/images/produtos/jrpass-passo-1-pedido.png",
    titulo: "Faça seu pedido",
    texto: "Escolha o tipo de passe e finalize a compra aqui no site.",
  },
  {
    icone: "/images/produtos/jrpass-passo-2-troca.png",
    titulo: "Receba o voucher",
    texto: "Enviamos o voucher por e-mail e WhatsApp assim que confirmamos o pedido.",
  },
  {
    icone: "/images/produtos/jrpass-passo-3-ativacao.png",
    titulo: "Ative no Japão",
    texto: "Troque o voucher pelo passe físico em um balcão JR na chegada.",
  },
  {
    icone: "/images/produtos/jrpass-passo-4-viagens.png",
    titulo: "Viaje sem limites",
    texto: "Use o passe livremente na rede JR pelo número de dias contratado.",
  },
];

export default function JrPassPage() {
  // Pedido do Wilson, 25/set/2026: "na pagina de JR Pass, nós vamos usar
  // o valor de dólar turismo" (em vez do PTAX usado no resto do site) +
  // "adicionar spread cambial também" — confirmado via AskUserQuestion:
  // 20%, mesmo spread já usado no câmbio público de ienes (nunca exposto
  // em texto público). Ver app/lib/cambioDolarTurismo.ts pro contexto
  // completo — só o JR Pass usa essa cotação, o resto do modal usa o
  // mesmo padrão CambioLabel/Cambio de sempre, só que alimentado por
  // essa fonte em vez do PTAX.
  const cambioDolarTurismo = useCambioDolarTurismo();
  const cambio: Cambio | null = cambioDolarTurismo
    ? {
        cotacao: cambioDolarTurismo.cotacao * SPREAD_DOLAR_TURISMO_PUBLICO,
        data: cambioDolarTurismo.data,
        fonte: "Dólar Turismo",
        fallback: cambioDolarTurismo.fallback,
      }
    : null;
  // Pedido do Wilson, 25/set/2026: "não consigo selecionar o tipo e nem a
  // duração do JR Pass, lembre-se que é uma pagina self-service, também
  // precisa haver no rodapé da pagina o preço da minha escolha e o que
  // escolhi com o botão 'Finalizar Compra Via Whatsapp'" — a tabela de
  // tipos e preços virou seletor de verdade (clique numa linha de dias
  // escolhe classe + duração juntos) e ganhou uma barra fixa no rodapé
  // do modal mostrando a escolha e o preço, com o CTA de WhatsApp já
  // preenchido com a seleção.
  const [classeSelecionada, setClasseSelecionada] = useState<"comum" | "green" | null>(null);
  const [diasSelecionados, setDiasSelecionados] = useState<(typeof JR_PASS_DIAS_OPCOES)[number] | null>(
    null,
  );
  // Datas da viagem + forma de pagamento — pedido do Wilson, 25/set/2026:
  // "falta adicionar a data de inicio e encerramento da viagem" e
  // "adicionar formas de pagamento igual temos na pagina de calculadora
  // reversa". Só entram na mensagem de WhatsApp (o JR Pass não tem
  // checkout com lead no CRM, diferente do Seguro Viagem).
  const [dataInicioViagem, setDataInicioViagem] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);

  // Data de encerramento — nunca é escolha livre: o JR Pass cobre
  // sempre N dias corridos (7/14/21) a partir da data de ativação, então
  // o fim é matematicamente início + (N-1) dias.
  const dataFimViagemCalculada = (() => {
    if (!dataInicioViagem || !diasSelecionados) return "";
    const inicio = new Date(`${dataInicioViagem}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) return "";
    inicio.setDate(inicio.getDate() + (diasSelecionados - 1));
    const ano = inicio.getFullYear();
    const mes = String(inicio.getMonth() + 1).padStart(2, "0");
    const dia = String(inicio.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  })();

  // Dados de contato + CRM — pedido do Wilson, 25/set/2026: "adicionar
  // nome, e-mail e telefone nessa página, registrar no CRM ao proceder
  // para pagamento" — mesmo padrão de Câmbio/Seguro Viagem/Transporte
  // Privado (ver /api/jrpass-selfservice).
  const [nome, setNome] = useState("");
  // Nome de quem está pagando, quando é diferente de quem viaja (ex.:
  // alguém comprando o passe pra um familiar) — pedido do Wilson,
  // 29/set/2026, como parte das evidências de checkout pra defesa de
  // chargeback ("nome do passageiro + nome do comprador"). Opcional:
  // quando vazio, o comprador e o passageiro são a mesma pessoa.
  const [nomeComprador, setNomeComprador] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Documento (passaporte OU passagem) — pedido do Wilson, 25/set/2026:
  // "precisa capturar a foto do passaporte do cliente, criar um
  // validador de foto script simples de checagem" + depois "foto do
  // passaporte ou foto da passagem, a o JR pass só pode ser emitido se
  // ele estiver no Japao em até 90 dias" (qualquer um dos dois documentos
  // comprova a janela de 90 dias). Passo obrigatório desde 29/set/2026
  // ("tornar passo 4 obrigatorio") — a opção de anexar depois foi
  // removida. Upload + OCR best-effort em /api/jrpass-documento — ver
  // lib/ocr/validarDocumentoJrPass.ts pro motivo de nunca bloquear o
  // cliente com base no resultado do OCR.
  const [referenciaDocumento] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [documentoTipo, setDocumentoTipo] = useState<"passaporte" | "passagem" | null>(null);
  const [documentoNomeArquivo, setDocumentoNomeArquivo] = useState("");
  const [documentoStatus, setDocumentoStatus] = useState<
    "vazio" | "enviando" | "validado" | "incerto" | "erro"
  >("vazio");
  const [documentoErro, setDocumentoErro] = useState("");
  const [documentoStoragePath, setDocumentoStoragePath] = useState<string | null>(null);
  const [documentoValidacaoMotivo, setDocumentoValidacaoMotivo] = useState("");

  async function lidarComArquivoDocumento(tipo: "passaporte" | "passagem", file: File) {
    setDocumentoTipo(tipo);
    setDocumentoNomeArquivo(file.name);
    setDocumentoStatus("enviando");
    setDocumentoErro("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(file);
      });
      const resposta = await fetch("/api/jrpass-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referencia: referenciaDocumento,
          tipo,
          arquivoBase64: base64,
          contentType: file.type,
        }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setDocumentoStatus("erro");
        setDocumentoErro(dados.error || "Não foi possível enviar o documento agora.");
        return;
      }
      setDocumentoStoragePath(dados.path || null);
      setDocumentoValidacaoMotivo(dados.validacao?.motivo || "");
      setDocumentoStatus(dados.validacao?.ok ? "validado" : "incerto");
    } catch {
      setDocumentoStatus("erro");
      setDocumentoErro("Não foi possível enviar o documento agora — tente de novo.");
    }
  }

  // Termos e condições — pedido do Wilson, 25/set/2026: "temos que
  // adicionar um tick box no termos e condições para finalizar o
  // pagamento, tem que ser um scroll com os termos e condições de
  // aceite do jr pASS".
  const [termosAceitos, setTermosAceitos] = useState(false);
  // Só libera o tickbox depois que o cliente rolar os termos até o fim —
  // pedido do Wilson, 28/set/2026: "só pode clicar em li e aceito ao dar
  // scroll em todo documento".
  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) {
      setTermosRolados(true);
    }
  }, []);
  // Número de pessoas — pedido do Wilson, 25/set/2026: "falta numero de
  // pessoas" (o JR Pass é vendido por pessoa — cada viajante precisa do
  // próprio passe). Mesmo padrão de stepper já usado em "Viajantes" no
  // Seguro Viagem.
  const [numeroAdultos, setNumeroAdultos] = useState(1);
  function ajustarNumeroAdultos(novo: number) {
    setNumeroAdultos(Math.max(1, Math.min(10, novo)));
  }

  // Preço de criança — pedido do Wilson, 25/set/2026: "quando é criança o
  // cliente paga metade do valor, criança entre 6 a 12 anos incompletos"
  // + "tem que ter um campo com numero de crianças e idade da criança
  // para ser selecionada" — cada criança tem um seletor de idade próprio.
  // Confirmado com a tabela oficial do fornecedor enviada no mesmo dia
  // (Century Travel, "JRP-Tab-de-precos-16-a-30SEP26.pdf", nota 3): "Tarifas
  // para crianças: entre 6 anos completos e 12 anos incompletos. Crianças
  // menores de 6 anos não pagam, porém não tem direito a assento." — por
  // isso são 3 faixas, não só desconto/sem desconto: <6 grátis, 6–11
  // metade do preço, 12+ conta como adulto (preço cheio).
  const IDADE_CRIANCA_JRPASS_GRATIS_MAX = 5; // menor de 6 anos = grátis
  const IDADE_CRIANCA_JRPASS_MEIA_MIN = 6;
  const IDADE_CRIANCA_JRPASS_MEIA_MAX = 11; // "12 incompletos"
  function multiplicadorPorIdadeCrianca(idade: number): number {
    if (idade <= IDADE_CRIANCA_JRPASS_GRATIS_MAX) return 0;
    if (idade <= IDADE_CRIANCA_JRPASS_MEIA_MAX) return 0.5;
    return 1;
  }
  const [numeroCriancas, setNumeroCriancas] = useState(0);
  const [idadesCriancas, setIdadesCriancas] = useState<(number | "")[]>([]);
  function ajustarNumeroCriancas(novo: number) {
    const seguro = Math.max(0, Math.min(10, novo));
    setNumeroCriancas(seguro);
    setIdadesCriancas((atual) => {
      const proximo = atual.slice(0, seguro);
      while (proximo.length < seguro) proximo.push("");
      return proximo;
    });
  }
  const idadesCriancasPreenchidas = idadesCriancas.filter((idade): idade is number => typeof idade === "number");
  const criancasGratis = idadesCriancasPreenchidas.filter((i) => i <= IDADE_CRIANCA_JRPASS_GRATIS_MAX).length;
  const criancasComDesconto = idadesCriancasPreenchidas.filter(
    (i) => i >= IDADE_CRIANCA_JRPASS_MEIA_MIN && i <= IDADE_CRIANCA_JRPASS_MEIA_MAX,
  ).length;
  const criancasComoAdulto = idadesCriancasPreenchidas.filter((i) => i > IDADE_CRIANCA_JRPASS_MEIA_MAX).length;
  // Crianças com idade ainda não preenchida contam como preço cheio até o
  // campo ser preenchido — evita mostrar um total menor do que o real
  // antes da idade ser informada.
  const somaMultiplicadorCriancas = idadesCriancas.reduce(
    (soma: number, idade) => soma + (typeof idade === "number" ? multiplicadorPorIdadeCrianca(idade) : 1),
    0,
  );
  // Total de pessoas é derivado (adultos + crianças) — deixou de ser um
  // valor editável diretamente, exatamente pra acabar com a confusão de
  // "número total" vs. "quantas dessas são crianças".
  const numeroPessoas = numeroAdultos + numeroCriancas;
  const multiplicadorPessoas = numeroAdultos + somaMultiplicadorCriancas;

  const TIPOS = [
    {
      key: "comum" as const,
      classe: "Segunda Classe",
      subtitulo: "Classe padrão",
      icone: "/images/ingressos/shinkansen-ordinary.png",
      precoUSD: JR_PASS_PRECO_USD,
      beneficios: [
        "Confortável para viagens longas",
        "Reserva de assento disponível",
        "Ideal para a maioria dos viajantes",
      ],
    },
    {
      key: "green" as const,
      classe: "Primeira Classe (Green Car)",
      subtitulo: "Mais espaço e conforto",
      icone: "/images/ingressos/jr-green-car.png",
      precoUSD: JR_PASS_PRECO_USD_GREEN,
      beneficios: [
        "Assentos mais espaçosos",
        "Mais espaço entre passageiros",
        "Ambiente mais tranquilo",
      ],
    },
  ];

  // Ícones enviados pelo Wilson, 25/set/2026 ("segue icones para esses 4
  // cards"), um por critério de elegibilidade — substituem o ícone
  // genérico de check azul que tinha antes.
  const ELEGIBILIDADE = [
    {
      titulo: "Turista estrangeiro",
      texto:
        "Entrada no Japão com status de imigração \"Temporary Visitor\" para turismo, com estadia autorizada de 15 ou 90 dias — precisa do carimbo ou adesivo \"Temporary Visitor\" no passaporte.",
      icone: "/images/icone-elegibilidade-turista-estrangeiro.png",
    },
    {
      titulo: "Japonês residente no exterior",
      // Pedido do Wilson, 25/set/2026: "aqui é necessário adicionar,
      // precisa ter pelo menos de 10 anos morando fora do país".
      texto:
        "Também pode comprar, sob condições específicas — precisa ter pelo menos 10 anos morando fora do Japão, e só pela modalidade de compra feita fora do país, antes da viagem.",
      icone: "/images/icone-elegibilidade-residente-exterior.png",
    },
    {
      titulo: "Atenção ao carimbo",
      texto:
        "Portão eletrônico de imigração no aeroporto não carimba o passaporte — é preciso passar pelo balcão com atendente (ou pedir o carimbo manualmente) para conseguir trocar o passe depois.",
      icone: "/images/icone-elegibilidade-carimbo.png",
    },
    {
      titulo: "Não vale para todo visto",
      texto:
        "Quem entra como \"Trainee\", \"Entertainer\" ou com \"Reentry Permit\" não pode usar o passe — mesmo já tendo comprado online, a troca é recusada sem o carimbo correto.",
      icone: "/images/icone-elegibilidade-visto-invalido.png",
    },
  ];

  // Ícones enviados pelo Wilson, 25/set/2026 ("icones para essa aprte",
  // junto de um print da seção "Regras de uso") — substituem o
  // IconCheck genérico que tinha antes, um por regra.
  const REGRAS_DE_USO = [
    {
      titulo: "Cobertura",
      texto:
        "Shinkansen, trens expressos, expressos limitados e locais da JR, além de ônibus JR e do Tokyo Monorail — exceto os trens-bala Nozomi e Mizuho, que exigem bilhete separado.",
      icone: "/images/icone-regras-cobertura.png",
    },
    {
      titulo: "Reservas de assento",
      texto:
        "Gratuitas, mas recomendadas — alguns trens não têm vagão sem reserva. Limite de 110 reservas por passe; cancelamento precisa ser feito antes do horário de partida.",
      icone: "/images/icone-regras-reservas-assento.png",
    },
    {
      titulo: "Pessoal e intransferível",
      texto:
        "Vinculado a um passaporte específico — não dá pra comprar dois passes sobrepostos no mesmo passaporte, nem trocar de titular. O passaporte precisa estar sempre junto do passe.",
      icone: "/images/icone-regras-pessoal-intransferivel.png",
    },
    {
      titulo: "Reembolso e validade",
      texto:
        "Reembolso só é possível antes da data de início de uso; depois de ativado, o período não pode ser estendido. Passe perdido ou roubado não tem reposição.",
      icone: "/images/icone-regras-reembolso-validade.png",
    },
  ];

  const tipoEscolhido = TIPOS.find((t) => t.key === classeSelecionada) ?? null;
  // Preço por pessoa (o que já existia) — usado na grade "Tipos e
  // preços", que sempre mostra o valor individual de cada opção.
  const precoEscolhidoUSD =
    tipoEscolhido && diasSelecionados ? tipoEscolhido.precoUSD[diasSelecionados] : null;
  const precoEscolhidoBRL = precoEscolhidoUSD !== null && cambio ? precoEscolhidoUSD * cambio.cotacao : null;
  // Preço total (por pessoa × número de pessoas, já com o desconto de
  // criança 6–11 anos aplicado via multiplicadorPessoas) — usado no
  // rodapé, na simulação de forma de pagamento e na mensagem de
  // WhatsApp, já que o passe é vendido individualmente e cada viajante
  // precisa do próprio.
  const precoTotalUSD = precoEscolhidoUSD !== null ? precoEscolhidoUSD * multiplicadorPessoas : null;
  const precoTotalBRL = precoEscolhidoBRL !== null ? precoEscolhidoBRL * multiplicadorPessoas : null;
  const selecaoCompleta = !!tipoEscolhido && !!diasSelecionados;
  const descricaoPagamentoEscolhido = descricaoFormaPagamento(
    formaPagamento,
    precoTotalBRL,
    dataInicioViagem,
  );
  const detalheCriancasTexto =
    numeroCriancas > 0
      ? ` (sendo ${numeroCriancas} ${numeroCriancas === 1 ? "criança" : "crianças"}${
          criancasComDesconto > 0 ? `, ${criancasComDesconto} com meia-entrada 6-11 anos` : ""
        })`
      : "";
  const mensagemWhatsapp = selecaoCompleta
    ? `Olá! Quero finalizar a compra do JR Pass${nome ? ` — meu nome é ${nome}` : ""} — ${tipoEscolhido!.classe}, ${diasSelecionados} dias, ${numeroPessoas} ${
        numeroPessoas === 1 ? "pessoa" : "pessoas"
      }${detalheCriancasTexto}${
        precoTotalBRL !== null ? ` (total ${formatBRL(precoTotalBRL)})` : ""
      }.${
        dataInicioViagem && dataFimViagemCalculada
          ? ` Viagem de ${formatarDataBR(dataInicioViagem)} a ${formatarDataBR(dataFimViagemCalculada)}.`
          : ""
      }${descricaoPagamentoEscolhido ? ` Forma de pagamento: ${descricaoPagamentoEscolhido}.` : ""}`
    : "";

  // Pedido do Wilson, 25/set/2026: "adicionar nome, e-mail e telefone
  // nessa página, registrar no CRM ao proceder para pagamento" — só
  // libera o botão "Finalizar Compra" com seleção completa, contato
  // válido, termos aceitos, e documento anexado — pedido do Wilson,
  // 29/set/2026: "tornar passo 4 obrigatorio" (documento deixou de ter
  // opção de "anexar depois"; nunca trava no resultado do OCR em si, só
  // exige que algum arquivo tenha sido enviado).
  const formValido =
    selecaoCompleta &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    termosAceitos &&
    (documentoStatus === "validado" || documentoStatus === "incerto");

  // Lista do que falta pra liberar o "Finalizar Compra" — pedido do
  // Wilson, 28/set/2026: "precisa exibir uma mensagem avisando o que
  // falta pra poder seguir, mensagens de alerta em amarelo". Só avisa
  // sobre tipo/duração se o resto já foi preenchido (senão duplica o
  // aviso "Selecione o tipo..." que já aparece no lugar do preço).
  const pendenciasFinalizar: string[] = [];
  if (!selecaoCompleta) {
    pendenciasFinalizar.push("Selecione o tipo (Comum ou Green Car) e a duração do passe.");
  }
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\S+@\S+\.\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!(documentoStatus === "validado" || documentoStatus === "incerto")) {
    pendenciasFinalizar.push("Anexe o documento (foto do passaporte ou da passagem).");
  }
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do JR Pass."
        : "Leia os termos e condições do JR Pass até o fim pra poder aceitá-los.",
    );
  }

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/jrpass-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classe: tipoEscolhido?.classe,
          dias: diasSelecionados,
          numeroPessoas,
          numeroCriancas,
          idadesCriancas: idadesCriancasPreenchidas,
          dataInicioViagem,
          dataFimViagem: dataFimViagemCalculada,
          precoTotalBRL,
          precoTotalUSD,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          nomeComprador,
          email,
          whatsapp,
          observacoes,
          documentoTipo,
          documentoStoragePath,
          documentoValidacaoMotivo,
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      // Pagamento de verdade via Pagar.me (ver app/api/jrpass-
      // selfservice + lib/pagarme/client.ts) — quando a integração está
      // configurada, a API devolve o link do checkout hospedado da
      // Pagar.me e o cliente é levado direto pra lá pra pagar. Sem a
      // integração configurada, cai no fluxo antigo (tela "pedido
      // registrado" + link manual por WhatsApp/e-mail).
      if (dadosResposta?.checkoutUrl) {
        window.location.assign(dadosResposta.checkoutUrl);
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  // Altura real do rodapé fixo, medida ao vivo — o card cresce/encolhe
  // conforme a lista de pendências, então o padding do <main> precisa
  // acompanhar pra não tampar o fim da página.
  const rodapeRef = useRef<HTMLDivElement | null>(null);
  // Mobile: o checklist "Antes de finalizar" fica recolhido por padrão —
  // aberto, o rodapé fixo ocupava ~85% da tela do celular e escondia a
  // página inteira (reclamação do Wilson, 29/set/2026). No desktop
  // continua sempre visível.
  const [alturaRodape, setAlturaRodape] = useState(0);

  useEffect(() => {
    const elemento = rodapeRef.current;
    if (!elemento) {
      setAlturaRodape(0);
      return;
    }
    const observer = new ResizeObserver((entries) => {
      setAlturaRodape(entries[0]?.contentRect.height ?? elemento.offsetHeight);
    });
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [status]);

  return (
    <main
      // Mobile/iOS — pedido do Wilson, 29/set/2026 ("site fica saindo da
      // tela"): (1) overflow-x-clip impede a página de "escorregar" pro
      // lado; (2) campos com 16px no celular — abaixo disso o Safari iOS dá
      // zoom automático ao tocar no campo e a página sai do enquadramento.
      className="min-h-screen overflow-x-clip bg-white pt-14 text-black [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm"
      style={status !== "enviado" ? { paddingBottom: alturaRodape + 56 } : undefined}
    >
      {/* Barra de voltar — pedido do Wilson, 28/set/2026: "essa parte deve
          ser fixa, aonde o usuario for ele deve acompanhar" (era só
          `sticky`, que só acompanha dentro do próprio container — virou
          `fixed` de verdade, acompanhando o scroll da página inteira) +
          "o fundo deve ser azul escuro, ajustar cores das letras para
          branco" — mesmo azul-marinho da marca usado noutras páginas
          (#0A2540, ver app/calculadora_reversa/page.tsx). */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link
          href="/produtos"
          className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>JR Pass</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de JR Pass
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/75">
                Nossa equipe confere o documento enviado (ou aguarda o que você anexar depois),
                confirma a elegibilidade e te manda o link de pagamento (Pix ou cartão) pelo
                WhatsApp e por e-mail — junto com a explicação completa de como funciona a troca do
                voucher pelo passe físico no Japão.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <>
          {/* Banner hero — foto enviada pelo Wilson em 29/set/2026 ("novo
              hero para jrpass, substituir a imagem que temos hoje e colocar
              texto dentro da imagem como fizemos com cambio e seguro
              viagem"), no lugar da foto do passe. Mesmo esquema do Seguro
              Viagem: o casal ocupa o centro-esquerda da foto, então ela fica
              só nos ~66% da direita do banner (Monte Fuji na janela à
              direita) e o texto vai no azul-marinho liso à esquerda. No
              celular: foto em cima, texto embaixo. A foto do passe continua
              sendo a imagem de compartilhamento do link (layout.tsx). */}
          <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
            <div className="relative h-64 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[66%]">
              <Image
                src="/images/produtos/jrpass-header.jpg"
                alt="Casal viajando de Shinkansen com o Monte Fuji na janela"
                fill
                priority
                sizes="(min-width: 640px) 640px, 100vw"
                className="object-cover object-[45%_40%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
              />
            </div>
            <div className="relative -mt-12 px-5 pb-8 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[40%] sm:flex-col sm:justify-center sm:px-10 sm:py-12 md:min-h-[380px]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/75">Japan Rail Pass</p>
              <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>
                Deslocamentos ilimitados de trem-bala em todo o Japão
              </h1>
            </div>
          </section>
          {/* Produto de teste de R$ 1 — só aparece com ?teste=1 (Wilson, 30/set/2026). */}
          <ProdutoTestePagamento produto="jrpass" />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-black/75">
            Passe ferroviário oficial dos seis grupos JR, vendido em faixas fixas de 7, 14 ou 21 dias
            corridos — cobre a maior parte da rede Shinkansen, trens expressos, locais, ônibus JR e o
            Tokyo Monorail.
          </p>

          {/* Como funciona — pedido do Wilson, 28/set/2026: "adicionar
              também os passos para a compra" (mesmo formato do site
              oficial japanrailpass.net: pedido → recebe o voucher → ativa
              no Japão → viaja ilimitado), com os 4 ícones que ele mandou,
              adaptado pro nosso fluxo (compra aqui no site, não no site
              oficial). Só uma explicação visual — não é um passo de
              decisão, por isso sem numeração. */}
          <div className="mt-8 rounded-2xl bg-[#eef6fb] p-5 sm:p-6">
            <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-[#1c6ea8]">
              Como funciona
            </p>
            <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
              {COMO_FUNCIONA.map((passo, index) => (
                <div key={passo.titulo} className="flex flex-col items-center text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">
                    Passo {index + 1}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={passo.icone} alt="" className="mt-2 h-20 w-20 object-contain" />
                  <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
                  <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Escolha seu JR Pass — redesenho pedido pelo Wilson,
              29/set/2026: reduzir carga cognitiva de "6 combinações
              simultâneas" (2 classes × 3 durações) pra uma decisão
              sequencial — primeiro a duração (segmented control), depois
              a classe (2 cards, só com o preço da duração já escolhida). */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                1
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Escolha seu JR Pass</p>
            </div>
            <p className="mt-1 text-sm text-[#1C1C1A]/70">
              Selecione a duração e a classe da sua viagem.
            </p>

            {/* Passo 1 — duração */}
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#77736D]">
              Duração
            </p>
            <div className="mt-2 flex w-full rounded-xl border border-[#E4E1DC] bg-[#FBFAF7] p-1 sm:max-w-[calc((100%-1rem)/2)]">
              {JR_PASS_DIAS_OPCOES.map((dias, index) => {
                const selecionado = diasSelecionados === dias;
                const proximoSelecionado = diasSelecionados === JR_PASS_DIAS_OPCOES[index + 1];
                const mostrarSeparador =
                  index < JR_PASS_DIAS_OPCOES.length - 1 && !selecionado && !proximoSelecionado;
                return (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => setDiasSelecionados(dias)}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      selecionado ? "bg-[#252522] text-white" : "text-[#1C1C1A] hover:bg-black/5"
                    } ${mostrarSeparador ? "border-r border-[#E4E1DC]" : ""}`}
                  >
                    {dias} dias
                  </button>
                );
              })}
            </div>

            {/* Passo 2 — classe */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {TIPOS.map((tipo) => {
                const selecionado = classeSelecionada === tipo.key;
                const precoUSDAtual = diasSelecionados ? tipo.precoUSD[diasSelecionados] : null;
                const precoBRLAtual = precoUSDAtual !== null && cambio ? precoUSDAtual * cambio.cotacao : null;
                return (
                  <button
                    key={tipo.key}
                    type="button"
                    onClick={() => setClasseSelecionada(tipo.key)}
                    className={`relative flex flex-col rounded-2xl border p-5 text-left shadow-[0_18px_45px_-14px_rgba(37,99,235,0.55)] transition-colors duration-150 hover:shadow-[0_22px_55px_-12px_rgba(37,99,235,0.65)] ${
                      selecionado ? "border-[#252522] bg-[#FAF9F6]" : "border-[#E4E1DC] bg-white hover:border-black/25"
                    }`}
                  >
                    {selecionado && (
                      <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#252522] px-2.5 py-1 text-[10px] font-medium text-white">
                        <IconCheck className="h-3 w-3" />
                        Selecionado
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tipo.icone} alt="" className="h-10 w-10 shrink-0 object-contain" />
                      <div>
                        <p className={`${display.className} text-base font-medium text-[#1C1C1A]`}>
                          {tipo.classe}
                        </p>
                        <p className="text-sm text-[#77736D]">{tipo.subtitulo}</p>
                      </div>
                    </div>

                    {precoBRLAtual !== null ? (
                      <div className="mt-4">
                        <p className={`${inter.className} text-2xl font-bold tracking-[-0.02em] tabular-nums text-[#1C1C1A]`}>
                          {formatBRL(precoBRLAtual)}
                        </p>
                        <p className={`${inter.className} text-xs font-medium tabular-nums text-[#77736D]`}>
                          {formatUSD(precoUSDAtual!)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-[#77736D]">Selecione a duração acima.</p>
                    )}

                    <ul className="mt-4 space-y-1.5 border-t border-[#E4E1DC] pt-4">
                      {tipo.beneficios.map((beneficio) => (
                        <li key={beneficio} className="flex items-start gap-2 text-sm text-[#1C1C1A]">
                          <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-[#A8997E]" />
                          {beneficio}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Preço já aparece nos cards de classe acima e no resumo do
                rodapé fixo — pedido do Wilson, 29/set/2026: removida a
                barra "Sua escolha" que duplicava classe/dias/preço. Fica
                só o texto de transparência de preço e o câmbio do dia,
                que não estão no rodapé. */}
            <p className="mt-5 text-[11px] leading-5 text-black/60">
              Valor por pessoa, já com taxas incluídas, convertido pela cotação do dia.
            </p>
            <div className="mt-1.5 inline-flex rounded-lg bg-[#eef6fb] px-3 py-1.5">
              <CambioLabel cambio={cambioDolarTurismo} className="text-[11px] text-[#1c6ea8]" />
            </div>
          </div>

          {/* Datas da viagem — pedido do Wilson, 25/set/2026: "falta
              adicionar a data de inicio e encerramento da viagem". Mesmo
              padrão de campo de data do Seguro Viagem; entram na mensagem
              de WhatsApp pro time já saber o período. */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                2
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Dados da viagem</p>
            </div>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Data de ida
                </span>
                <input
                  type="date"
                  value={dataInicioViagem}
                  min={hojeISO()}
                  onChange={(e) => setDataInicioViagem(e.target.value)}
                  className="block min-h-[46px] w-full min-w-0 appearance-none bg-white text-left rounded-lg border border-black/15 px-4 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Data de encerramento
                </span>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={dataFimViagemCalculada ? formatarDataBR(dataFimViagemCalculada) : "—"}
                  className="w-full rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/60"
                />
                <span className="text-[10px] leading-4 text-black/60">
                  Calculada automaticamente: início + duração do passe escolhida no passo 1.
                </span>
              </label>
            </div>
          </div>

          {/* Número de pessoas — pedido do Wilson, 25/set/2026: "falta
              numero de pessoas". O JR Pass é vendido por pessoa (cada
              viajante precisa do próprio passe), então o preço final no
              rodapé é o valor por pessoa (grade acima) × esse número.
              Mesmo stepper do "Viajantes" do Seguro Viagem. Desconto de
              criança (6–11 anos, metade do preço) é o bloco logo abaixo. */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                3
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Número de pessoas</p>
            </div>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex h-9 flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                    Adultos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ajustarNumeroAdultos(numeroAdultos - 1)}
                    aria-label="Diminuir número de adultos"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                  >
                    −
                  </button>
                  <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                    {numeroAdultos} {numeroAdultos === 1 ? "adulto" : "adultos"}
                  </span>
                  <button
                    type="button"
                    onClick={() => ajustarNumeroAdultos(numeroAdultos + 1)}
                    aria-label="Aumentar número de adultos"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Crianças com desconto — pedido do Wilson, 25/set/2026:
                  "quando é criança o cliente paga metade do valor, criança
                  entre 6 a 12 anos incompletos" + "tem que ter um campo com
                  numero de crianças e idade da criança para ser
                  selecionada" — stepper de quantas das pessoas acima são
                  crianças, e um seletor de idade por criança (mesmo padrão
                  da grade de idades do Seguro Viagem), pra confirmar se
                  cada uma cai mesmo na faixa 6–11 que dá direito à
                  meia-entrada. Lado a lado com o stepper de pessoas —
                  pedido do Wilson, 29/set/2026: "campos de numero de
                  adultos e crianças devem estar lado a lado e não um
                  embaixo do outro". */}
              <div>
                <div className="mb-2 flex h-9 flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">Crianças</span>
                  <span className="mt-0.5 text-[10px] normal-case tracking-normal text-black/50">
                    6 a 11 anos · 50% do valor
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ajustarNumeroCriancas(numeroCriancas - 1)}
                    aria-label="Diminuir número de crianças"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                  >
                    −
                  </button>
                  <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                    {numeroCriancas} {numeroCriancas === 1 ? "criança" : "crianças"}
                  </span>
                  <button
                    type="button"
                    onClick={() => ajustarNumeroCriancas(numeroCriancas + 1)}
                    aria-label="Aumentar número de crianças"
                    disabled={numeroCriancas >= 10}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-black transition ${
                      numeroCriancas >= 10
                        ? "cursor-not-allowed border-black/10 text-black/25"
                        : "border-black/15 hover:border-black/30"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-black/60">
              Cada viajante precisa do próprio passe — o preço no rodapé já é o total pras{" "}
              {numeroPessoas} {numeroPessoas === 1 ? "pessoa" : "pessoas"}.
            </p>

            {numeroCriancas > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {idadesCriancas.map((idade, index) => {
                  const multiplicador = typeof idade === "number" ? multiplicadorPorIdadeCrianca(idade) : null;
                  const rotuloFaixa =
                    multiplicador === 0
                      ? "Grátis (menor de 6)"
                      : multiplicador === 0.5
                        ? "50% (6 a 11 anos)"
                        : multiplicador === 1
                          ? "Valor cheio (12+)"
                          : null;
                  return (
                    <label key={index} className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                        Idade — criança {index + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={17}
                        value={idade}
                        onChange={(e) => {
                          const valor =
                            e.target.value === "" ? "" : Math.max(0, Math.min(17, Number(e.target.value)));
                          setIdadesCriancas((atual) => atual.map((v, i) => (i === index ? valor : v)));
                        }}
                        className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                      />
                      {rotuloFaixa && (
                        <span
                          className={`text-[10px] ${
                            multiplicador === 0
                              ? "text-emerald-700"
                              : multiplicador === 0.5
                                ? "text-[#1c6ea8]"
                                : "text-black/60"
                          }`}
                        >
                          {rotuloFaixa}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Resumo das faixas — nota 3 da tabela do fornecedor
                (Century Travel, 25/set/2026): menor de 6 não paga, 6 a
                11 completa paga metade, 12+ conta como adulto. */}
            {(criancasGratis > 0 || criancasComDesconto > 0 || criancasComoAdulto > 0) && (
              <p className="mt-2 text-[11px] leading-5 text-black/60">
                {criancasGratis > 0 && `${criancasGratis} grátis (menor de 6 anos)`}
                {criancasGratis > 0 && (criancasComDesconto > 0 || criancasComoAdulto > 0) && " · "}
                {criancasComDesconto > 0 && `${criancasComDesconto} com 50% de desconto (6 a 11 anos)`}
                {criancasComDesconto > 0 && criancasComoAdulto > 0 && " · "}
                {criancasComoAdulto > 0 &&
                  `${criancasComoAdulto} no valor cheio de adulto (12 anos ou mais)`}
                {" "}— já aplicado no total abaixo.
              </p>
            )}
          </div>

          {/* Critérios de elegibilidade */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black">
              Critérios de elegibilidade
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {ELEGIBILIDADE.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-16 w-16 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/65">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras de uso */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black">Regras de uso</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {REGRAS_DE_USO.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-16 w-16 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/65">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documento — pedido do Wilson, 25/set/2026: "precisa capturar a
              foto do passaporte do cliente, criar um validador de foto
              script simples de checagem" + "foto do passaporte ou foto da
              passagem, a o JR pass só pode ser emitido se ele estiver no
              Japao em até 90 dias" + "colocar opção de anexar documentos
              depois também". */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                4
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Documento — passaporte ou passagem</p>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-black/65">
              O JR Pass só pode ser emitido pra quem já está no Japão (ou vai entrar) dentro da
              janela de 90 dias — a data do voo na passagem confirma isso. Anexe a foto do
              passaporte ou da passagem agora para continuar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(["passaporte", "passagem"] as const).map((tipo) => (
                <label
                  key={tipo}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-xs transition ${
                    documentoTipo === tipo
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                      : "border-black/15 text-black/75 hover:border-black/30"
                  }`}
                >
                  <Image
                    src={
                      tipo === "passaporte"
                        ? "/images/produtos/jrpass-doc-passaporte.png"
                        : "/images/produtos/jrpass-doc-passagem.png"
                    }
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9"
                  />
                  {tipo === "passaporte" ? "Foto do passaporte" : "Foto da passagem"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo) void lidarComArquivoDocumento(tipo, arquivo);
                      e.target.value = "";
                    }}
                  />
                </label>
              ))}
            </div>

            {documentoStatus === "enviando" && (
              <p className="mt-3 text-[11px] text-black/65">Enviando {documentoNomeArquivo}…</p>
            )}
            {documentoStatus === "validado" && (
              <p className="mt-3 text-[11px] text-emerald-700">
                Documento recebido — {documentoValidacaoMotivo || "conferência automática ok."}
              </p>
            )}
            {documentoStatus === "incerto" && (
              <p className="mt-3 text-[11px] text-amber-700">
                Documento recebido — {documentoValidacaoMotivo || "não conseguimos confirmar automaticamente."}{" "}
                Nossa equipe revisa manualmente antes da emissão.
              </p>
            )}
            {documentoStatus === "erro" && (
              <p className="mt-3 text-[11px] text-red-600">{documentoErro}</p>
            )}
            {/* Selo de conexão segura — pedido do Wilson, 25/set/2026
                ("adicionar SSL"), no mesmo pedido que trouxe CPF/endereço
                pro Seguro Viagem. O site já roda inteiro em HTTPS/SSL
                (certificado provisionado automaticamente pelo Vercel no
                domínio alpinea.io) — isso só deixa esse cuidado visível
                pro cliente bem ao lado do upload de documento. */}
            <div className="mt-3 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icone-ssl-lock.png" alt="" className="h-6 w-6 shrink-0 object-contain" />
              <p className="text-sm leading-5 text-black/70">
                Conexão segura (SSL) — seu documento trafega e fica armazenado criptografado.
              </p>
            </div>
          </div>

          {/* Dados de contato — pedido do Wilson, 25/set/2026: "adicionar
              nome, e-mail e telefone nessa página, registrar no CRM ao
              proceder para pagamento". */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                5
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Seus dados</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Nome completo (do passageiro)
                </span>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">WhatsApp</span>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                Nome do comprador (opcional — só se for diferente do passageiro)
              </span>
              <input
                type="text"
                value={nomeComprador}
                onChange={(e) => setNomeComprador(e.target.value)}
                placeholder="Preencha só se quem está pagando não é quem viaja"
                className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
              />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                Observações (opcional)
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
              />
            </label>
          </div>

          <div>
            <FormasPagamento
              numeroPasso={6}
              totalBRL={precoTotalBRL}
              dataViagem={dataInicioViagem}
              formaPagamento={formaPagamento}
              onEscolher={setFormaPagamento}
            />
          </div>

          {/* Termos e condições — pedido do Wilson, 25/set/2026: "temos
              que adicionar um tick box no termos e condições para
              finalizar o pagamento, tem que ser um scroll com os termos
              e condições de aceite do jr pASS". Conteúdo vem das mesmas
              fontes já usadas em Regras de uso/Critérios de elegibilidade
              acima (sites oficiais JR) + tabela do fornecedor Century
              Travel (cancelamento, reembolso, validade do voucher). */}
          <div id="checkout-ultimo-passo" className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                7
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Termos e condições</p>
            </div>
            <div
              ref={termosBoxRef}
              className="mt-5 max-h-96 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/75"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
                  setTermosRolados(true);
                }
              }}
            >
              <p className="font-medium text-black">Termos e condições de compra — Japan Rail Pass</p>
              <p className="mt-1">
                Ao concluir a compra do Japan Rail Pass por meio da Alpinea, o cliente declara ter
                lido e compreendido as condições abaixo, que integram a contratação, sem prejuízo
                dos direitos assegurados pela legislação brasileira aplicável, especialmente o
                Código de Defesa do Consumidor.
              </p>

              <p className="mt-3 font-medium text-black">1. Emissão e elegibilidade</p>
              <p className="mt-1">
                O Japan Rail Pass é comercializado por meio de voucher ou documento de troca
                (&quot;Exchange Order&quot;), que deverá ser apresentado no Japão para obtenção do
                passe correspondente, conforme as regras vigentes estabelecidas pelo emissor e
                pelas empresas integrantes do Japan Railways Group.
              </p>
              <p className="mt-1">
                A utilização do passe está sujeita ao cumprimento dos requisitos de elegibilidade
                estabelecidos pelo Japan Railways Group e pelas autoridades japonesas.
              </p>
              <p className="mt-1">
                É responsabilidade do viajante verificar se possui o status migratório exigido
                para utilização do passe. Quando exigido o status &quot;Temporary Visitor&quot;, o
                viajante deverá assegurar que sua entrada no Japão tenha sido registrada
                adequadamente pelas autoridades de imigração.
              </p>
              <p className="mt-1">
                Caso seja necessário registro ou carimbo físico no passaporte para comprovação da
                elegibilidade, caberá ao viajante realizar o procedimento apropriado junto à
                imigração japonesa.
              </p>
              <p className="mt-1">
                Cidadãos japoneses residentes permanentemente fora do Japão somente poderão
                adquirir ou utilizar o passe quando atenderem integralmente às condições
                específicas estabelecidas pelo Japan Railways Group.
              </p>
              <p className="mt-1">
                A Alpinea fornecerá, antes da conclusão da compra, as informações disponíveis
                sobre os requisitos aplicáveis, não podendo garantir a elegibilidade quando ela
                depender de condição migratória, documentação ou circunstância pessoal do
                viajante.
              </p>

              <p className="mt-3 font-medium text-black">2. Dados fornecidos pelo cliente</p>
              <p className="mt-1">
                O cliente deverá conferir cuidadosamente, antes de concluir a compra:
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>nome completo conforme consta no passaporte;</li>
                <li>número do passaporte, quando solicitado;</li>
                <li>nacionalidade;</li>
                <li>datas da viagem;</li>
                <li>tipo e classe do passe;</li>
                <li>quantidade de passageiros; e</li>
                <li>demais informações necessárias para emissão.</li>
              </ul>
              <p className="mt-1">
                O nome utilizado na emissão deverá corresponder ao documento apresentado pelo
                passageiro no momento da troca ou utilização do passe.
              </p>
              <p className="mt-1">
                Antes da confirmação definitiva da contratação, a Alpinea disponibilizará ao
                cliente oportunidade para revisão e correção dos dados fornecidos.
              </p>
              <p className="mt-1">
                Após a emissão do voucher, alterações poderão estar sujeitas às regras, prazos,
                custos e limitações do fornecedor emissor.
              </p>
              <p className="mt-1">
                Caso uma informação incorreta tenha sido fornecida pelo cliente e seja necessária
                nova emissão, cancelamento ou alteração, os respectivos custos poderão ser
                cobrados do cliente, desde que previamente informados e desde que não decorram de
                erro da Alpinea ou do fornecedor.
              </p>
              <p className="mt-1">
                Essa disposição não limita os direitos do consumidor nos casos de erro, falha na
                prestação do serviço ou informação incorreta imputável à Alpinea ou aos seus
                fornecedores.
              </p>

              <p className="mt-3 font-medium text-black">3. Validade do voucher</p>
              <p className="mt-1">
                Salvo indicação diferente apresentada no momento da compra, o Exchange Order
                deverá ser trocado pelo Japan Rail Pass dentro do prazo estabelecido pelo
                fornecedor emissor, contado da respectiva data de emissão.
              </p>
              <p className="mt-1">O cliente deverá observar a data de validade indicada no documento recebido.</p>
              <p className="mt-1">
                O passe é pessoal e intransferível e poderá ser vinculado ao passageiro e ao
                respectivo documento de viagem.
              </p>
              <p className="mt-1">
                A ausência de utilização dentro do período de validade poderá inviabilizar sua
                utilização ou reembolso, observadas as condições do fornecedor e os direitos
                assegurados pela legislação brasileira.
              </p>

              <p className="mt-3 font-medium text-black">4. Preço, câmbio e pagamento</p>
              <p className="mt-1">O preço total da contratação será informado ao cliente antes da conclusão da compra.</p>
              <p className="mt-1">
                Quando o produto ou serviço for originalmente precificado em moeda estrangeira, o
                valor em reais poderá ser calculado conforme a cotação de venda aplicável
                informada no momento da compra.
              </p>
              <p className="mt-1">
                Uma vez concluída e autorizada a transação, oscilações cambiais posteriores não
                alterarão o valor já contratado, salvo se houver uma nova operação solicitada pelo
                cliente.
              </p>
              <p className="mt-1">
                Eventuais impostos, tarifas, custos financeiros ou encargos adicionais serão
                informados antes da conclusão da contratação sempre que forem cobrados pela
                Alpinea.
              </p>
              <p className="mt-1">
                No pagamento por cartão, eventual parcelamento, juros ou condições financeiras
                serão apresentados antes da confirmação da compra.
              </p>

              <p className="mt-3 font-medium text-black">5. Autorização do pagamento e prevenção a fraudes</p>
              <p className="mt-1">
                Para proteção do cliente e da Alpinea, determinadas transações poderão passar por
                procedimentos de autenticação e prevenção a fraudes realizados pela Alpinea, pelo
                processador de pagamentos, pela instituição financeira ou pela administradora do
                cartão.
              </p>
              <p className="mt-1">
                Poderão ser solicitadas informações ou documentos adicionais estritamente
                necessários para confirmação da identidade do comprador, da titularidade do meio
                de pagamento ou da legitimidade da transação.
              </p>
              <p className="mt-1">
                A análise poderá resultar na não aprovação da operação quando existirem indícios
                razoáveis de fraude ou inconsistências relevantes, sem prejuízo dos direitos do
                consumidor.
              </p>
              <p className="mt-1">
                Quando o cartão ou outro meio de pagamento pertencer a terceiro, o comprador
                declara possuir autorização legítima do respectivo titular para utilização daquele
                meio de pagamento.
              </p>
              <p className="mt-1">
                A aprovação inicial pela instituição financeira não impede verificações adicionais
                destinadas à prevenção de fraude.
              </p>

              <p className="mt-3 font-medium text-black">6. Confirmação e emissão</p>
              <p className="mt-1">
                A simples solicitação de compra não representa necessariamente a emissão imediata
                do Japan Rail Pass.
              </p>
              <p className="mt-1">A contratação será considerada confirmada após:</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>aprovação do pagamento;</li>
                <li>confirmação dos dados necessários à emissão; e</li>
                <li>confirmação da emissão ou reserva pelo respectivo fornecedor, quando aplicável.</li>
              </ol>
              <p className="mt-1">Após a contratação, a Alpinea enviará confirmação ao cliente por meio eletrônico.</p>
              <p className="mt-1">
                O voucher ou documento equivalente será encaminhado pelo canal informado durante a
                contratação, dentro do prazo apresentado ao consumidor.
              </p>
              <p className="mt-1">
                Caso a emissão não possa ser concluída por indisponibilidade do fornecedor ou
                circunstância não imputável ao cliente, este será informado e poderá optar pelas
                alternativas legalmente aplicáveis, incluindo restituição dos valores pagos quando
                cabível.
              </p>

              <p className="mt-3 font-medium text-black">7. Direito de arrependimento</p>
              <p className="mt-1">
                Nas contratações realizadas pela internet ou fora do estabelecimento comercial,
                serão integralmente respeitados os direitos assegurados pelo artigo 49 do Código
                de Defesa do Consumidor e demais normas aplicáveis.
              </p>
              <p className="mt-1">
                Quando juridicamente aplicável, o consumidor poderá exercer o direito de
                arrependimento no prazo legal de 7 (sete) dias, contado na forma prevista pela
                legislação.
              </p>
              <p className="mt-1">
                O exercício válido do direito de arrependimento dentro do prazo legal será
                realizado sem cobrança das penalidades comerciais previstas para cancelamentos
                voluntários posteriores.
              </p>
              <p className="mt-1">
                A Alpinea disponibilizará canal eletrônico para solicitação de cancelamento e
                enviará confirmação do recebimento da solicitação.
              </p>
              <p className="mt-1">
                Quando cabível o estorno, a Alpinea solicitará imediatamente seu processamento
                junto à instituição financeira, operadora ou processadora de pagamento
                responsável, sendo o prazo de efetiva visualização do crédito ou estorno na fatura
                também sujeito aos procedimentos da respectiva instituição.
              </p>

              <p className="mt-3 font-medium text-black">8. Cancelamento após o período legal de arrependimento</p>
              <p className="mt-1">
                Após o término de eventual prazo legal de arrependimento, os cancelamentos
                voluntários solicitados pelo cliente estarão sujeitos às regras do fornecedor
                emissor informadas no momento da contratação.
              </p>
              <p className="mt-1">Quando aplicáveis ao produto adquirido, poderão existir:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>prazo máximo para solicitação de cancelamento;</li>
                <li>taxa administrativa ou operacional;</li>
                <li>percentual de retenção estabelecido pelo fornecedor;</li>
                <li>restrições depois da troca do Exchange Order pelo passe; e</li>
                <li>impossibilidade de restituição após utilização total ou parcial do produto.</li>
              </ul>
              <p className="mt-1">
                Quando as condições comerciais aplicáveis ao produto adquirido previrem
                cancelamento apenas dentro do mês de emissão, taxa administrativa de US$ 10 por
                voucher e retenção de 15% do valor do passe, essas condições serão aplicadas
                apenas fora das hipóteses em que a legislação brasileira assegurar ao consumidor
                condição mais favorável.
              </p>
              <p className="mt-1">
                O valor exato da eventual retenção ou taxa aplicável será informado ao cliente
                antes da conclusão da compra ou da confirmação do cancelamento.
              </p>
              <p className="mt-1">
                Nenhuma disposição desta seção limita os direitos do consumidor em caso de falha
                na prestação do serviço, descumprimento da oferta ou outra hipótese protegida pela
                legislação aplicável.
              </p>

              <p className="mt-3 font-medium text-black">9. Perda, roubo ou inutilização</p>
              <p className="mt-1">
                Depois de realizada a troca do voucher pelo passe ou iniciada sua utilização,
                eventual perda, roubo ou extravio estará sujeito às regras estabelecidas pelo
                Japan Railways Group.
              </p>
              <p className="mt-1">
                Quando as regras do emissor não permitirem segunda via, reposição ou reembolso
                nessas situações, a Alpinea não terá capacidade operacional para emitir
                unilateralmente novo passe.
              </p>
              <p className="mt-1">
                Essa limitação não se aplica quando a perda do direito de utilização decorrer de
                falha atribuível à própria Alpinea ou a fornecedor pelo qual ela legalmente
                responda.
              </p>

              <p className="mt-3 font-medium text-black">10. Utilização do Japan Rail Pass</p>
              <p className="mt-1">
                A cobertura do Japan Rail Pass será aquela oficialmente estabelecida pelo Japan
                Railways Group para a modalidade adquirida.
              </p>
              <p className="mt-1">
                O passe poderá abranger determinados serviços ferroviários, linhas JR, ônibus JR e
                outros serviços incluídos pelo emissor.
              </p>
              <p className="mt-1">Serviços excluídos ou sujeitos a suplemento deverão ser contratados separadamente.</p>
              <p className="mt-1">
                A disponibilidade de assentos, horários e serviços de transporte depende da
                operação das respectivas empresas ferroviárias e poderá sofrer alterações.
              </p>
              <p className="mt-1">
                A possibilidade de realizar gratuitamente reservas de assento não constitui
                garantia de disponibilidade em determinado trem, horário, rota ou classe.
              </p>
              <p className="mt-1">
                Por esse motivo, especialmente em períodos de maior demanda, recomenda-se que o
                passageiro faça suas reservas com antecedência.
              </p>

              <p className="mt-3 font-medium text-black">11. Alterações operacionais no Japão</p>
              <p className="mt-1">
                Horários, plataformas, itinerários, categorias de trem e disponibilidade de
                assentos podem ser alterados pelos operadores ferroviários.
              </p>
              <p className="mt-1">
                Também podem ocorrer interrupções ou alterações causadas por condições
                meteorológicas, terremotos, tufões, acidentes, manutenção, determinações
                governamentais ou outras circunstâncias operacionais.
              </p>
              <p className="mt-1">
                Quando a execução do transporte for diretamente realizada por terceiro, eventual
                compensação ou alternativa operacional observará as regras da empresa responsável
                pelo serviço e a legislação aplicável.
              </p>
              <p className="mt-1">
                A Alpinea prestará ao cliente as informações e o suporte que estejam dentro de sua
                esfera de atuação, sem prejuízo das responsabilidades que legalmente lhe forem
                atribuíveis.
              </p>

              <p className="mt-3 font-medium text-black">12. Contestação de pagamento e chargeback</p>
              <p className="mt-1">
                Caso o cliente identifique cobrança que não reconheça, valor incorreto,
                duplicidade, não recebimento do produto ou qualquer outro problema relacionado à
                contratação, recomenda-se o contato imediato com a Alpinea por meio dos canais de
                atendimento disponibilizados, para que a situação possa ser investigada e
                solucionada.
              </p>
              <p className="mt-1">
                Essa recomendação não restringe o direito do cliente de procurar sua instituição
                financeira, administradora do cartão, órgãos de defesa do consumidor ou o Poder
                Judiciário.
              </p>
              <p className="mt-1">
                A abertura de procedimento de chargeback ou contestação financeira não constitui,
                por si só, pedido de cancelamento do produto ou serviço perante a Alpinea ou
                perante o fornecedor emissor.
              </p>

              <p className="mt-3 font-medium text-black">12.1 Contestação de uma transação legítima</p>
              <p className="mt-1">
                Quando houver contestação de uma transação efetivamente autorizada pelo comprador
                e regularmente cumprida pela Alpinea, a empresa poderá apresentar à instituição
                financeira, adquirente, bandeira ou processadora de pagamentos os documentos
                necessários à demonstração da legitimidade da operação.
              </p>
              <p className="mt-1">Essas informações poderão incluir, quando disponíveis e pertinentes:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>confirmação da contratação;</li>
                <li>identificação do comprador;</li>
                <li>registro da autorização do pagamento;</li>
                <li>registros de autenticação do pagamento;</li>
                <li>aceite destes Termos e Condições;</li>
                <li>data e horário da contratação;</li>
                <li>endereço IP e registros técnicos relacionados à operação;</li>
                <li>histórico de comunicações;</li>
                <li>comprovantes de emissão;</li>
                <li>comprovantes de envio ou disponibilização do voucher;</li>
                <li>informações fornecidas pelo próprio cliente durante a contratação; e</li>
                <li>registros de utilização, cancelamento ou troca do produto, quando disponíveis.</li>
              </ul>
              <p className="mt-1">
                O tratamento e o compartilhamento dessas informações serão limitados ao necessário
                para prevenção de fraudes, execução da contratação, exercício regular de direitos
                e defesa de interesses legítimos, observada a legislação aplicável sobre proteção
                de dados.
              </p>

              <p className="mt-3 font-medium text-black">12.2 Efeito do chargeback sobre obrigações legitimamente constituídas</p>
              <p className="mt-1">
                A realização de um chargeback não determina automaticamente a inexistência da
                contratação ou da obrigação que lhe deu origem.
              </p>
              <p className="mt-1">
                Caso a instituição financeira efetue provisoriamente ou definitivamente a reversão
                de uma transação e posteriormente fique demonstrado que:
              </p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>a compra foi regularmente autorizada;</li>
                <li>o produto ou serviço contratado foi regularmente fornecido;</li>
                <li>não havia hipótese legal ou contratual que justificasse o cancelamento; e</li>
                <li>o consumidor permaneceu beneficiário do produto ou serviço contratado,</li>
              </ol>
              <p className="mt-1">
                a Alpinea poderá buscar o recebimento do valor legitimamente devido pelos meios
                permitidos pela legislação brasileira.
              </p>
              <p className="mt-1">
                Qualquer cobrança será realizada de maneira proporcional, transparente e sem
                constrangimento ao consumidor, observando-se integralmente o Código de Defesa do
                Consumidor.
              </p>
              <p className="mt-1">
                Nenhuma disposição desta cláusula impede ou dificulta a apresentação de
                contestação legítima pelo consumidor nos casos de fraude, transação não
                autorizada, duplicidade, descumprimento da oferta, não fornecimento do serviço ou
                outra hipótese legalmente protegida.
              </p>

              <p className="mt-3 font-medium text-black">12.3 Fraude ou utilização não autorizada</p>
              <p className="mt-1">
                Caso o titular do meio de pagamento informe que a operação foi realizada sem sua
                autorização, a Alpinea poderá suspender temporariamente emissões ainda não
                concluídas enquanto investiga a operação.
              </p>
              <p className="mt-1">
                Confirmada fraude ou utilização não autorizada, serão adotadas as providências
                cabíveis junto ao processador de pagamento e demais instituições envolvidas.
              </p>

              <p className="mt-3 font-medium text-black">13. Cooperação em caso de divergência</p>
              <p className="mt-1">
                O cliente compromete-se a fornecer informações verdadeiras e, quando necessário,
                cooperar razoavelmente com a investigação de divergências relacionadas à
                contratação.
              </p>
              <p className="mt-1">
                A Alpinea poderá solicitar documentos ou esclarecimentos estritamente relacionados
                à compra, emissão, pagamento ou eventual contestação.
              </p>
              <p className="mt-1">
                A ausência de envio desses documentos não implicará automaticamente perda de
                direitos do consumidor, mas poderá limitar a possibilidade de confirmação de
                determinadas informações ou conclusão de procedimentos dependentes desses dados.
              </p>

              <p className="mt-3 font-medium text-black">14. Papel da Alpinea e fornecedores terceiros</p>
              <p className="mt-1">
                A Alpinea poderá atuar na comercialização, intermediação e facilitação da emissão
                de produtos fornecidos ou operacionalizados por terceiros.
              </p>
              <p className="mt-1">
                A existência de fornecedor ou operador estrangeiro não exclui direitos assegurados
                ao consumidor pela legislação brasileira quando esta for aplicável.
              </p>
              <p className="mt-1">
                A Alpinea não poderá controlar atos exclusivamente atribuíveis às autoridades
                migratórias japonesas, decisões governamentais ou alterações operacionais
                realizadas diretamente pelas companhias ferroviárias.
              </p>
              <p className="mt-1">
                Essa disposição não representa exclusão ou limitação de responsabilidade da
                Alpinea em situações nas quais a legislação determine sua responsabilidade.
              </p>

              <p className="mt-3 font-medium text-black">15. Documentação migratória</p>
              <p className="mt-1">A aquisição de um Japan Rail Pass não garante:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>entrada no Japão;</li>
                <li>concessão de visto;</li>
                <li>concessão do status migratório necessário;</li>
                <li>aceitação do passageiro pela imigração;</li>
                <li>validade de passaporte ou documentação pessoal; ou</li>
                <li>elegibilidade individual ao passe.</li>
              </ul>
              <p className="mt-1">
                Cabe ao passageiro possuir documentação válida e cumprir os requisitos
                estabelecidos pelas autoridades japonesas.
              </p>
              <p className="mt-1">
                A Alpinea deverá fornecer informações corretas sobre requisitos de que tenha
                conhecimento, mas não substitui autoridades migratórias, consulados ou órgãos
                governamentais.
              </p>

              <p className="mt-3 font-medium text-black">16. Proteção de dados pessoais</p>
              <p className="mt-1">
                Os dados pessoais fornecidos durante a contratação poderão ser tratados pela
                Alpinea para:
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>processamento da compra;</li>
                <li>emissão do produto;</li>
                <li>atendimento ao cliente;</li>
                <li>prevenção a fraudes;</li>
                <li>processamento e defesa de contestações financeiras;</li>
                <li>cumprimento de obrigações legais ou regulatórias;</li>
                <li>exercício regular de direitos; e</li>
                <li>demais finalidades necessárias à execução da contratação.</li>
              </ul>
              <p className="mt-1">
                Quando necessário para emissão ou operação do produto, determinadas informações
                poderão ser compartilhadas com fornecedores, operadores ferroviários,
                processadores de pagamento, instituições financeiras ou prestadores de serviços
                envolvidos na execução da contratação, inclusive quando localizados no exterior,
                observada a legislação aplicável.
              </p>
              <p className="mt-1">
                A Alpinea adotará medidas razoáveis de segurança destinadas à proteção das
                informações sob sua responsabilidade.
              </p>
              <p className="mt-1">
                O tratamento de dados pessoais observará a Política de Privacidade da Alpinea e a
                legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais.
              </p>

              <p className="mt-3 font-medium text-black">17. Comunicações e comprovantes eletrônicos</p>
              <p className="mt-1">
                O cliente concorda que documentos relacionados à contratação poderão ser
                disponibilizados por meio eletrônico, incluindo e-mail, área do cliente ou outro
                canal indicado durante a compra.
              </p>
              <p className="mt-1">
                Recomenda-se que o cliente mantenha seus dados de contato atualizados e conserve
                os comprovantes e documentos recebidos.
              </p>
              <p className="mt-1">
                Os registros eletrônicos da contratação poderão ser utilizados para comprovar
                informações relativas à compra, sem prejuízo do direito do consumidor de contestar
                sua autenticidade ou conteúdo.
              </p>

              <p className="mt-3 font-medium text-black">18. Atendimento e resolução de problemas</p>
              <p className="mt-1">
                Em caso de dúvida, erro de emissão, solicitação de alteração, cancelamento ou
                problema relacionado ao produto, o cliente poderá entrar em contato pelos canais
                oficiais de atendimento da Alpinea.
              </p>
              <p className="mt-1">
                A Alpinea buscará solucionar as solicitações dentro dos prazos legalmente
                aplicáveis e manterá registros das comunicações relacionadas à contratação.
              </p>
              <p className="mt-1">
                O consumidor permanece livre para utilizar os mecanismos administrativos e
                judiciais de proteção disponíveis no Brasil.
              </p>

              <p className="mt-3 font-medium text-black">19. Alterações destes termos</p>
              <p className="mt-1">
                As condições aplicáveis à compra serão aquelas disponibilizadas e aceitas no
                momento da contratação.
              </p>
              <p className="mt-1">
                Alterações posteriores destes Termos e Condições não poderão modificar
                retroativamente condições essenciais de uma compra já concluída em prejuízo do
                consumidor.
              </p>
              <p className="mt-1">
                Alterações realizadas por fornecedores ou autoridades após a contratação serão
                comunicadas quando relevantes e quando a Alpinea tiver conhecimento delas.
              </p>

              <p className="mt-3 font-medium text-black">20. Legislação aplicável</p>
              <p className="mt-1">
                A contratação observará a legislação brasileira aplicável às relações de consumo,
                inclusive o Código de Defesa do Consumidor, sem prejuízo das normas estrangeiras
                necessariamente relacionadas à utilização e operação do produto no Japão.
              </p>
              <p className="mt-1">
                Nenhuma disposição destes Termos deverá ser interpretada como renúncia a direito
                indisponível assegurado ao consumidor.
              </p>
              <p className="mt-1">
                Caso alguma disposição seja considerada inválida ou inexequível, as demais
                permanecerão válidas na medida permitida pela legislação.
              </p>
              <p className="mt-1">
                Eventuais conflitos poderão ser solucionados pelos meios legalmente disponíveis ao
                consumidor, inclusive perante o foro competente determinado pela legislação
                aplicável.
              </p>
            </div>
            <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/80">
              <input
                type="checkbox"
                checked={termosAceitos}
                disabled={!termosRolados}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
              />
              Li e aceito os termos e condições de emissão, cancelamento, reembolso e uso do JR
              Pass acima.
            </label>
            {!termosRolados && (
              <p className="mt-1.5 pl-8 text-xs text-black/55">
                Role o texto acima até o fim para habilitar o aceite.
              </p>
            )}
          </div>

          {erro && (
            <p className="mt-4 text-sm text-red-600">{erro}</p>
          )}
            </>
          )}
      </div>

      {/* Rodapé fixo enxuto (app/produtos/RodapeCheckout.tsx) — pedido do
          Wilson, 29/set/2026: lista de pendências só aparece quando o
          cliente está quase finalizando ou tenta finalizar com algo faltando. */}
      {status !== "enviado" && (
        <RodapeCheckout
          containerRef={rodapeRef}
          pendencias={pendenciasFinalizar}
          formValido={formValido}
          enviando={status === "enviando"}
          onFinalizar={enviar}
          rotuloValor="Total"
          valor={selecaoCompleta && precoTotalBRL !== null ? formatBRL(precoTotalBRL) : null}
          detalhe={
            selecaoCompleta
              ? `${tipoEscolhido!.classe} · ${diasSelecionados} dias · ${numeroPessoas} ${numeroPessoas === 1 ? "pessoa" : "pessoas"}`
              : undefined
          }
          semValor="Escolha a duração e a classe do passe para ver o valor."
          rotuloBotao="Finalizar compra"
          sentinelaId="checkout-ultimo-passo"
          classeValor={inter.className}
        />
      )}

    </main>
  );
}
