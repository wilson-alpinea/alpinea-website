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
  JR_PASS_OFICIAL_JPY,
  formatJPY,
  FormasPagamento,
  descricaoFormaPagamento,
  hojeISO,
  formatarDataBR,
  IconCheck,
} from "../page";

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
  const [dataFimViagem, setDataFimViagem] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);

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
  // comprova a janela de 90 dias) + "colocar opção de anexar documentos
  // depois também" (daí documentoAdiado, que libera o botão de finalizar
  // sem bloquear o cliente). Upload + OCR best-effort em
  // /api/jrpass-documento — ver lib/ocr/validarDocumentoJrPass.ts pro
  // motivo de nunca bloquear o cliente com base no resultado do OCR.
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
  const [documentoAdiado, setDocumentoAdiado] = useState(false);

  async function lidarComArquivoDocumento(tipo: "passaporte" | "passagem", file: File) {
    setDocumentoTipo(tipo);
    setDocumentoAdiado(false);
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
      setDocumentoErro("Não foi possível enviar o documento agora — tente de novo ou anexe depois.");
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
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  function ajustarNumeroPessoas(novo: number) {
    const seguro = Math.max(1, Math.min(12, novo));
    setNumeroPessoas(seguro);
    // Nunca deixa o número de crianças (nem a lista de idades) passar do
    // número total de pessoas.
    setNumeroCriancas((atual) => Math.min(atual, seguro));
    setIdadesCriancas((atual) => atual.slice(0, seguro));
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
    const seguro = Math.max(0, Math.min(numeroPessoas, novo));
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
  const multiplicadorPessoas = numeroPessoas - numeroCriancas + somaMultiplicadorCriancas;

  const TIPOS = [
    {
      key: "comum" as const,
      classe: "Comum (Ordinary)",
      icone: "/images/ingressos/shinkansen-ordinary.png",
      precoUSD: JR_PASS_PRECO_USD,
    },
    {
      key: "green" as const,
      classe: "Green Car (luxo)",
      icone: "/images/ingressos/jr-green-car.png",
      precoUSD: JR_PASS_PRECO_USD_GREEN,
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
        dataInicioViagem && dataFimViagem
          ? ` Viagem de ${formatarDataBR(dataInicioViagem)} a ${formatarDataBR(dataFimViagem)}.`
          : ""
      }${descricaoPagamentoEscolhido ? ` Forma de pagamento: ${descricaoPagamentoEscolhido}.` : ""}`
    : "";

  // Pedido do Wilson, 25/set/2026: "adicionar nome, e-mail e telefone
  // nessa página, registrar no CRM ao proceder para pagamento" — só
  // libera o botão "Finalizar Compra" com seleção completa, contato
  // válido, termos aceitos, e alguma decisão sobre o documento (anexado
  // OU explicitamente adiado — nunca trava no resultado do OCR, só exige
  // que o cliente tenha feito uma escolha).
  const formValido =
    selecaoCompleta &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    termosAceitos &&
    (documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto");

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
  if (!(documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto")) {
    pendenciasFinalizar.push('Anexe o documento (passaporte ou passagem) ou escolha "Anexar depois".');
  }
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do JR Pass."
        : "Role os termos e condições do JR Pass até o fim pra poder aceitá-los.",
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
          dataFimViagem,
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
          documentoAdiado,
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

  // Altura real do rodapé fixo, medida ao vivo — corrige o bug (Wilson,
  // 28/set/2026) de o rodapé tampar o fim da página quando a lista de
  // pendências cresce e ele fica mais alto que um padding fixo chutado.
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
      style={status !== "enviado" ? { paddingBottom: alturaRodape + 24 } : undefined}
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
      </div>

      <div className="mx-auto max-w-5xl p-5 md:p-8">
          {status === "enviado" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
              <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
                Recebemos seu pedido de JR Pass
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
                Nossa equipe confere o documento enviado (ou aguarda o que você anexar depois),
                confirma a elegibilidade e te manda o link de pagamento (Pix ou cartão) pelo
                WhatsApp e por e-mail — junto com a explicação completa de como funciona a troca do
                voucher pelo passe físico no Japão.
              </p>
              {documentoAdiado && (
                <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-amber-700">
                  Você optou por anexar o documento (passaporte ou passagem) depois — pode mandar
                  direto pelo WhatsApp assim que tiver em mãos.
                </p>
              )}
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
          <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Japan Rail Pass</p>
          <h3
            className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}
          >
            Deslocamentos ilimitados de trem-bala em todo o Japão
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
            Passe ferroviário oficial dos seis grupos JR, vendido em faixas fixas de 7, 14 ou 21
            dias corridos — cobre a maior parte da rede Shinkansen, trens expressos, locais,
            ônibus JR e o Tokyo Monorail.
          </p>

          {/* Tipos e preços */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                1
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Tipos e preços</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {TIPOS.map((tipo) => (
                <div
                  key={tipo.key}
                  className={`rounded-2xl border p-5 transition ${
                    classeSelecionada === tipo.key
                      ? "border-[#2f80c9] bg-[#2f80c9]/5"
                      : "border-black/10 bg-black/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tipo.icone} alt="" className="h-10 w-10 shrink-0 object-contain" />
                    <p className={`${display.className} text-base font-medium text-black`}>
                      {tipo.classe}
                    </p>
                  </div>
                  <div className="mt-4">
                    {JR_PASS_DIAS_OPCOES.map((dias) => {
                      const selecionado = classeSelecionada === tipo.key && diasSelecionados === dias;
                      return (
                        <button
                          key={dias}
                          type="button"
                          onClick={() => {
                            setClasseSelecionada(tipo.key);
                            setDiasSelecionados(dias);
                          }}
                          className="flex w-full items-center justify-between border-t border-black/5 py-2.5 text-left first:border-t-0 first:pt-0"
                        >
                          <span className="flex items-center gap-2 text-xs text-black/55">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selecionado ? "border-[#2f80c9] bg-[#2f80c9]" : "border-black/20"
                              }`}
                            >
                              {selecionado && <IconCheck className="h-2.5 w-2.5 text-white" />}
                            </span>
                            {dias} dias
                          </span>
                          <span className="text-right">
                            <span
                              className={`block text-sm font-medium ${selecionado ? "text-[#2f80c9]" : "text-black"}`}
                            >
                              {formatUSD(tipo.precoUSD[dias])}
                            </span>
                            {cambio && (
                              <span className="block text-[11px] text-black/40">
                                {formatBRL(tipo.precoUSD[dias] * cambio.cotacao)}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 border-t border-black/5 pt-3 text-[10px] leading-4 text-black/35">
                    Tabela oficial JR (ienes, vigente a partir de 1/out/2026):{" "}
                    {JR_PASS_DIAS_OPCOES.map((dias, index) => (
                      <span key={dias}>
                        {index > 0 && " · "}
                        {dias}d {formatJPY(JR_PASS_OFICIAL_JPY[tipo.key][dias])}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-black/40">
              Valor por pessoa, já com taxas incluídas, convertido pela cotação do dia.
            </p>
            <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/35" />
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Dados da viagem</p>
            </div>
            <div className="mt-4 grid gap-4 sm:max-w-md sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                  Início da viagem
                </span>
                <input
                  type="date"
                  value={dataInicioViagem}
                  min={hojeISO()}
                  onChange={(e) => {
                    const novoInicio = e.target.value;
                    setDataInicioViagem(novoInicio);
                    if (dataFimViagem && novoInicio && dataFimViagem < novoInicio) {
                      setDataFimViagem("");
                    }
                  }}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                  Término da viagem
                </span>
                <input
                  type="date"
                  value={dataFimViagem}
                  min={dataInicioViagem || hojeISO()}
                  onChange={(e) => setDataFimViagem(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Número de pessoas</p>
            </div>
            <div className="mt-4 flex max-w-xs items-center gap-2">
              <button
                type="button"
                onClick={() => ajustarNumeroPessoas(numeroPessoas - 1)}
                aria-label="Diminuir número de pessoas"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
              >
                −
              </button>
              <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                {numeroPessoas} {numeroPessoas === 1 ? "pessoa" : "pessoas"}
              </span>
              <button
                type="button"
                onClick={() => ajustarNumeroPessoas(numeroPessoas + 1)}
                aria-label="Aumentar número de pessoas"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-black/40">
              Cada viajante precisa do próprio passe — o preço no rodapé já é o total pras{" "}
              {numeroPessoas} {numeroPessoas === 1 ? "pessoa" : "pessoas"}.
            </p>

            {/* Crianças com desconto — pedido do Wilson, 25/set/2026:
                "quando é criança o cliente paga metade do valor, criança
                entre 6 a 12 anos incompletos" + "tem que ter um campo com
                numero de crianças e idade da criança para ser
                selecionada" — stepper de quantas das pessoas acima são
                crianças, e um seletor de idade por criança (mesmo padrão
                da grade de idades do Seguro Viagem), pra confirmar se
                cada uma cai mesmo na faixa 6–11 que dá direito à
                meia-entrada. */}
            <div className="mt-6">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black/50">
                Crianças (opcional) — 6 a 11 anos pagam metade
              </span>
              <div className="flex max-w-xs items-center gap-2">
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
                  disabled={numeroCriancas >= numeroPessoas}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-black transition ${
                    numeroCriancas >= numeroPessoas
                      ? "cursor-not-allowed border-black/10 text-black/25"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  +
                </button>
              </div>

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
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
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
                                  : "text-black/40"
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
                <p className="mt-2 text-[11px] leading-5 text-black/40">
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
          </div>

          {/* Critérios de elegibilidade */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Critérios de elegibilidade
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {ELEGIBILIDADE.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras de uso */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Regras de uso</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {REGRAS_DE_USO.map((item) => (
                <div key={item.titulo} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icone} alt="" className="mt-0.5 h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-medium text-black">{item.titulo}</p>
                    <p className="mt-1 text-[11px] leading-5 text-black/50">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-black/35">
              Fonte: sites oficiais do Japan Rail Pass (japanrailpass.net/en) — páginas de
              elegibilidade, condições de uso e tabela de preços.
            </p>
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Documento — passaporte ou passagem</p>
            </div>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-black/50">
              O JR Pass só pode ser emitido pra quem já está no Japão (ou vai entrar) dentro da
              janela de 90 dias — o carimbo de entrada no passaporte ou a data do voo na passagem
              confirmam isso. Pode anexar um dos dois agora, ou deixar pra depois.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["passaporte", "passagem"] as const).map((tipo) => (
                <label
                  key={tipo}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                    documentoTipo === tipo
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
                      : "border-black/15 text-black/60 hover:border-black/30"
                  }`}
                >
                  <Image
                    src={
                      tipo === "passaporte"
                        ? "/images/produtos/jrpass-doc-passaporte.png"
                        : "/images/produtos/jrpass-doc-passagem.png"
                    }
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  {tipo === "passaporte" ? "Foto do passaporte" : "Foto da passagem/itinerário"}
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
              <button
                type="button"
                onClick={() => {
                  setDocumentoAdiado(true);
                  setDocumentoStatus("vazio");
                  setDocumentoTipo(null);
                  setDocumentoNomeArquivo("");
                }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                  documentoAdiado
                    ? "border-black/40 bg-black/5 font-medium text-black"
                    : "border-black/15 text-black/50 hover:border-black/30"
                }`}
              >
                <Image
                  src="/images/produtos/jrpass-doc-anexar-depois.png"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                Anexar depois
              </button>
            </div>

            {documentoStatus === "enviando" && (
              <p className="mt-3 text-[11px] text-black/45">Enviando {documentoNomeArquivo}…</p>
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
            {documentoAdiado && (
              <p className="mt-3 text-[11px] text-black/45">
                Sem problema — pode mandar o documento pelo WhatsApp assim que tiver em mãos.
              </p>
            )}
            {/* Selo de conexão segura — pedido do Wilson, 25/set/2026
                ("adicionar SSL"), no mesmo pedido que trouxe CPF/endereço
                pro Seguro Viagem. O site já roda inteiro em HTTPS/SSL
                (certificado provisionado automaticamente pelo Vercel no
                domínio alpinea.io) — isso só deixa esse cuidado visível
                pro cliente bem ao lado do upload de documento. */}
            <p className="mt-3 text-[11px] leading-5 text-black/40">
              🔒 Conexão segura (SSL) — seu documento trafega e fica armazenado criptografado.
            </p>
          </div>

          {/* Dados de contato — pedido do Wilson, 25/set/2026: "adicionar
              nome, e-mail e telefone nessa página, registrar no CRM ao
              proceder para pagamento". */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                5
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Seus dados</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
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
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">WhatsApp</span>
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
              <span className="text-[10px] uppercase tracking-[0.15em] text-black/50">
                Observações (opcional)
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                placeholder="Nome exatamente como está no passaporte, se diferente do nome acima, etc."
                className="rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
              />
            </label>
          </div>

          <FormasPagamento
            numeroPasso={6}
            totalBRL={precoTotalBRL}
            dataViagem={dataInicioViagem}
            formaPagamento={formaPagamento}
            onEscolher={setFormaPagamento}
          />

          {/* Termos e condições — pedido do Wilson, 25/set/2026: "temos
              que adicionar um tick box no termos e condições para
              finalizar o pagamento, tem que ser um scroll com os termos
              e condições de aceite do jr pASS". Conteúdo vem das mesmas
              fontes já usadas em Regras de uso/Critérios de elegibilidade
              acima (sites oficiais JR) + tabela do fornecedor Century
              Travel (cancelamento, reembolso, validade do voucher). */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
                7
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Termos e condições</p>
            </div>
            <div
              ref={termosBoxRef}
              className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
                  setTermosRolados(true);
                }
              }}
            >
              <p className="font-medium text-black/80">Emissão e elegibilidade</p>
              <p className="mt-1">
                O Japan Rail Pass é vendido como um voucher (Exchange Order), trocado pelo passe
                físico só no Japão. Só pode ser emitido pra quem tem status de imigração
                &quot;Temporary Visitor&quot; carimbado no passaporte — o portão eletrônico não
                carimba, é preciso passar no balcão manual da imigração. Turistas estrangeiros têm
                estadia autorizada de até 90 dias; japoneses residentes no exterior há pelo menos
                10 anos podem comprar sob condições específicas, só pela modalidade de compra fora
                do Japão, antes da viagem.
              </p>
              <p className="mt-3 font-medium text-black/80">Validade do voucher</p>
              <p className="mt-1">
                O voucher tem validade de 3 meses a partir da emissão pra ser trocado pelo passe
                físico. O passe em si é pessoal e intransferível, vinculado a um passaporte
                específico — o nome informado precisa ser idêntico ao do passaporte que será usado
                na troca.
              </p>
              <p className="mt-3 font-medium text-black/80">Cancelamento e reembolso</p>
              <p className="mt-1">
                Cancelamento só é aceito dentro do mês de emissão do voucher, mediante taxa de
                serviço de US$ 10 por cupom. Reembolso (quando ainda cabível) tem taxa de 15% do
                valor do passe, com prazo máximo de 1 ano a partir da emissão. Se o voucher já foi
                trocado pelo passe físico, ou em caso de perda ou roubo, não há reembolso nem
                reposição.
              </p>
              <p className="mt-3 font-medium text-black/80">Uso do passe</p>
              <p className="mt-1">
                Cobre Shinkansen, trens expressos, expressos limitados e locais da JR, ônibus JR e
                o Tokyo Monorail — exceto os trens-bala Nozomi e Mizuho, que exigem bilhete
                especial à parte. Reservas de assento são gratuitas (limite de 110 por passe), mas
                recomendadas.
              </p>
              <p className="mt-3 font-medium text-black/80">Pagamento e responsabilidade dos dados</p>
              <p className="mt-1">
                O valor final é convertido pela cotação de câmbio turismo de venda do dia da
                compra. A Alpinea atua como intermediária entre o cliente e o fornecedor emissor —
                a exatidão dos dados e documentos enviados (nome, passaporte, datas de viagem) é de
                responsabilidade do cliente, já que divergências podem impedir a troca do voucher
                no Japão.
              </p>
            </div>
            <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
              <input
                type="checkbox"
                checked={termosAceitos}
                disabled={!termosRolados}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
              />
              Li e aceito os termos e condições de emissão, cancelamento, reembolso e uso do JR
              Pass acima.
            </label>
            {!termosRolados && (
              <p className="mt-1.5 pl-[26px] text-[10px] text-black/35">
                Role o texto acima até o fim para habilitar o aceite.
              </p>
            )}
          </div>

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </>
          )}
      </div>

        {/* Rodapé fixo com a escolha atual — pedido do Wilson, 25/set/2026:
            "também precisa haver no rodapé da pagina o preço da minha
            escolha e o que escolhi com o botão 'Finalizar Compra Via
            Whatsapp'". Fica fora da área rolável (acima é overflow-y-auto),
            sempre visível enquanto o cliente decide tipo e duração.
            Redesenhado no mesmo dia, ainda 25/set/2026, a pedido do Wilson
            ("modal que msotra peço não está bom, use o mesmo ou similar
            que usamos na pagina de calculadora reversa no rodapé fixo") —
            segue a mesma hierarquia visual da "barra fixa" da calculadora
            reversa (label minúsculo, preço grande em destaque como âncora
            visual, linha secundária discreta), adaptada pro tema claro
            do /produtos em vez das cores escuras do original.

            Botão trocado de link direto de WhatsApp pra "Finalizar
            Compra" de verdade — pedido do Wilson, 25/set/2026: "aqui o
            finalizar compra vai gerar uma nova tela" + "adicionar nome,
            e-mail e telefone nessa página, registrar no CRM ao proceder
            para pagamento". Some no rodapé quando status vira "enviado"
            (a tela de confirmação já ocupa o corpo do modal). */}
        {status !== "enviado" && (
          <div
            ref={rodapeRef}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:px-8"
          >
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div>
                {selecaoCompleta ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">Sua escolha</p>
                    <p className={`${display.className} text-xl font-medium text-[#2f80c9] sm:text-2xl`}>
                      {precoTotalBRL !== null ? formatBRL(precoTotalBRL) : "—"}
                    </p>
                    <p className="text-xs text-black/45">
                      {tipoEscolhido!.classe} · {diasSelecionados} dias · {numeroPessoas}{" "}
                      {numeroPessoas === 1 ? "pessoa" : "pessoas"}
                      {numeroCriancas > 0 &&
                        ` (${numeroCriancas} ${numeroCriancas === 1 ? "criança" : "crianças"}${
                          criancasComDesconto > 0 ? `, ${criancasComDesconto} c/ 50%` : ""
                        })`}
                      {precoTotalUSD !== null && ` · ${formatUSD(precoTotalUSD)}`}
                      {numeroPessoas > 1 && numeroCriancas === 0 && precoEscolhidoBRL !== null && (
                        <> · {formatBRL(precoEscolhidoBRL)}/pessoa</>
                      )}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-0.5 text-[11px] text-black/40">{descricaoPagamentoEscolhido}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-black/45">
                    Selecione o tipo (Comum ou Green Car) e a duração do passe acima.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition ${
                  formValido && status !== "enviando"
                    ? "bg-[#2f80c9] hover:bg-[#3b91dc]"
                    : "cursor-not-allowed bg-black/20"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Finalizar Compra"}
              </button>
            </div>
            {pendenciasFinalizar.length > 0 && status !== "enviando" && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-5 text-amber-800">
                <p className="font-medium">Falta o seguinte pra finalizar:</p>
                <ul className="mt-1 list-disc pl-4">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Ao finalizar, você é levado direto pra página de pagamento segura da Stone (Pix ou
              cartão). Após a confirmação, nossa equipe faz a checagem final da elegibilidade e
              envia as instruções de retirada do passe físico no Japão pelo WhatsApp e por e-mail.
            </p>
          </div>
        )}

    </main>
  );
}
