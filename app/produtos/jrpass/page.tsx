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
        fonte: "Dólar Turismo — melhorcambio.com",
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
        window.location.href = dadosResposta.checkoutUrl;
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
      className="min-h-screen bg-white pt-14 text-black"
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
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Japan Rail Pass</p>
              <h3
                className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
              >
                Deslocamentos ilimitados de trem-bala em todo o Japão
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/75">
                Passe ferroviário oficial dos seis grupos JR, vendido em faixas fixas de 7, 14 ou 21
                dias corridos — cobre a maior parte da rede Shinkansen, trens expressos, locais,
                ônibus JR e o Tokyo Monorail.
              </p>
            </div>
            <Image
              src="/images/produtos/jrpass-ticket-exemplo.png"
              alt="Exemplo do passe físico Japan Rail Pass"
              width={1536}
              height={1024}
              className="mx-auto w-56 shrink-0 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.18)] sm:mx-0 sm:w-72"
            />
          </div>

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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
            <div className="mt-2 flex w-full max-w-sm rounded-xl border border-[#E4E1DC] bg-[#FBFAF7] p-1">
              {JR_PASS_DIAS_OPCOES.map((dias) => {
                const selecionado = diasSelecionados === dias;
                return (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => setDiasSelecionados(dias)}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      selecionado ? "bg-[#252522] text-white" : "text-[#1C1C1A] hover:bg-black/5"
                    }`}
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

            {/* "Sua escolha" — resumo horizontal e compacto, atualiza
                sozinho conforme duração/classe mudam. Sem botão
                "Continuar" — pedido do Wilson, 29/set/2026: fluxo
                vertical contínuo até o único CTA no rodapé. */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#E4E1DC] bg-[#FBFAF7] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#77736D]">Sua escolha</p>
                <p className="mt-0.5 truncate text-sm text-[#1C1C1A]">
                  {selecaoCompleta
                    ? `${tipoEscolhido!.classe} · ${diasSelecionados} dias`
                    : "Selecione a duração e a classe."}
                </p>
              </div>
              {precoEscolhidoBRL !== null && (
                <p className={`${inter.className} shrink-0 text-lg font-bold tracking-[-0.02em] tabular-nums text-[#1C1C1A]`}>
                  {formatBRL(precoEscolhidoBRL)}
                </p>
              )}
            </div>

            <p className="mt-3 text-[11px] leading-5 text-black/60">
              Valor por pessoa, já com taxas incluídas, convertido pela cotação do dia.
            </p>
            <div className="mt-1.5 inline-flex rounded-lg bg-[#eef6fb] px-3 py-1.5">
              <CambioLabel cambio={cambio} className="text-[11px] text-[#1c6ea8]" />
            </div>
          </div>

          {/* Datas da viagem — pedido do Wilson, 25/set/2026: "falta
              adicionar a data de inicio e encerramento da viagem". Mesmo
              padrão de campo de data do Seguro Viagem; entram na mensagem
              de WhatsApp pro time já saber o período. */}
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                2
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Dados da viagem</p>
            </div>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Data de ida
                </span>
                <input
                  type="date"
                  value={dataInicioViagem}
                  min={hojeISO()}
                  onChange={(e) => setDataInicioViagem(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                5
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Seus dados</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Nome completo
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

          <div className="mx-auto max-w-[820px]">
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
          <div className="mx-auto mt-8 max-w-[820px] border-t border-black/10 pt-6">
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
              <p className="font-medium text-black">Emissão e elegibilidade</p>
              <p className="mt-1">
                O Japan Rail Pass é vendido como um voucher (Exchange Order), trocado pelo passe
                físico só no Japão. Só pode ser emitido pra quem tem status de imigração
                &quot;Temporary Visitor&quot; carimbado no passaporte — o portão eletrônico não
                carimba, é preciso passar no balcão manual da imigração. Turistas estrangeiros têm
                estadia autorizada de até 90 dias; japoneses residentes no exterior há pelo menos
                10 anos podem comprar sob condições específicas, só pela modalidade de compra fora
                do Japão, antes da viagem.
              </p>
              <p className="mt-3 font-medium text-black">Validade do voucher</p>
              <p className="mt-1">
                O voucher tem validade de 3 meses a partir da emissão pra ser trocado pelo passe
                físico. O passe em si é pessoal e intransferível, vinculado a um passaporte
                específico — o nome informado precisa ser idêntico ao do passaporte que será usado
                na troca.
              </p>
              <p className="mt-3 font-medium text-black">Cancelamento e reembolso</p>
              <p className="mt-1">
                Cancelamento só é aceito dentro do mês de emissão do voucher, mediante taxa de
                serviço de US$ 10 por cupom. Reembolso (quando ainda cabível) tem taxa de 15% do
                valor do passe, com prazo máximo de 1 ano a partir da emissão. Se o voucher já foi
                trocado pelo passe físico, ou em caso de perda ou roubo, não há reembolso nem
                reposição.
              </p>
              <p className="mt-3 font-medium text-black">Uso do passe</p>
              <p className="mt-1">
                Cobre Shinkansen, trens expressos, expressos limitados e locais da JR, ônibus JR e
                o Tokyo Monorail — exceto os trens-bala Nozomi e Mizuho, que exigem bilhete
                especial à parte. Reservas de assento são gratuitas (limite de 110 por passe), mas
                recomendadas.
              </p>
              <p className="mt-3 font-medium text-black">Pagamento e responsabilidade dos dados</p>
              <p className="mt-1">
                O valor final é convertido pela cotação de câmbio turismo de venda do dia da
                compra. A Alpinea atua como intermediária entre o cliente e o fornecedor emissor —
                a exatidão dos dados e documentos enviados (nome, passaporte, datas de viagem) é de
                responsabilidade do cliente, já que divergências podem impedir a troca do voucher
                no Japão.
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
            <p className="mx-auto mt-4 max-w-[820px] text-sm text-red-600">{erro}</p>
          )}
            </>
          )}
      </div>

      {status !== "enviado" && (
        <div
          ref={rodapeRef}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t border-white/10 bg-[#0A263D] px-5 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.3)] md:px-8"
        >
          <div className="mx-auto grid max-w-[1150px] gap-6 md:grid-cols-[65fr_35fr]">
            {/* Coluna esquerda — checklist "Antes de finalizar" */}
            <div>
              <p className="text-[15px] font-semibold text-[#E6D4A3]">Antes de finalizar</p>
              {pendenciasFinalizar.length > 0 ? (
                <ul className="mt-3 space-y-3.5">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-[1.4] text-[#F1EEE7]">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#BFA76A]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-[#F1EEE7]">
                  <IconCheck className="h-4 w-4 shrink-0 text-[#BFA76A]" />
                  Tudo certo — pode finalizar.
                </p>
              )}
              <p className="mt-5 text-xs leading-5 text-[#A5B3BE]">
                Ao finalizar, você é levado direto pra página de pagamento segura da Stone (Pix ou
                cartão). Após a confirmação, nossa equipe faz a checagem final da elegibilidade e
                envia as instruções de retirada do passe físico no Japão pelo WhatsApp e por e-mail.
              </p>
            </div>

            {/* Coluna direita — resumo da compra + CTA */}
            <div className="rounded-xl border border-[#8E794B]/30 bg-[#18343F] p-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8498A8]">Sua escolha</p>
              {selecaoCompleta ? (
                <>
                  <p className={`${inter.className} mt-1 text-3xl font-bold tracking-[-0.02em] tabular-nums text-[#C2A66A]`}>
                    {precoTotalBRL !== null ? formatBRL(precoTotalBRL) : "—"}
                  </p>
                  <p className="mt-1 text-sm text-[#A5B3BE]">
                    {tipoEscolhido!.classe} · {diasSelecionados} dias · {numeroPessoas}{" "}
                    {numeroPessoas === 1 ? "pessoa" : "pessoas"}
                    {numeroCriancas > 0 &&
                      ` (${numeroCriancas} ${numeroCriancas === 1 ? "criança" : "crianças"}${
                        criancasComDesconto > 0 ? `, ${criancasComDesconto} c/ 50%` : ""
                      })`}
                  </p>
                  {precoTotalUSD !== null && (
                    <p className={`${inter.className} text-xs font-medium tabular-nums text-[#8498A8]`}>
                      {formatUSD(precoTotalUSD)}
                    </p>
                  )}
                  {numeroPessoas > 1 && numeroCriancas === 0 && precoEscolhidoBRL !== null && (
                    <p className={`${inter.className} text-xs font-medium tabular-nums text-[#8498A8]`}>
                      {formatBRL(precoEscolhidoBRL)}/pessoa
                    </p>
                  )}
                  {descricaoPagamentoEscolhido && (
                    <p className="mt-1 text-[11px] text-[#8498A8]">{descricaoPagamentoEscolhido}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-[#B8C5CE]">
                  Selecione o tipo (Comum ou Green Car) e a duração do passe acima.
                </p>
              )}

              <div className="my-4 h-px bg-white/10" />

              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`flex h-14 w-full items-center justify-center rounded-full text-sm font-medium uppercase tracking-[0.06em] transition-colors duration-200 ${
                  formValido && status !== "enviando"
                    ? "bg-[#E7DFD0] text-[#122D40] hover:bg-[#F0EADF]"
                    : "cursor-not-allowed bg-[#2F4F69] text-[#9DB0BD]"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Finalizar compra"}
              </button>

              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="text-xs text-[#A9B0B2]">Pagamento seguro</span>
                <Image
                  src="/images/produtos/stone-logo-white.png"
                  alt="Stone"
                  width={102}
                  height={37}
                  className="h-9 w-auto opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
