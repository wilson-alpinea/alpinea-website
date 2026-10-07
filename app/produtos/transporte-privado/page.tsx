"use client";

// Transporte Privado — configurador em 5 etapas (era 4 até 30/set/2026,
// quando Período + Passageiros virou a 1ª etapa). Desde 30/set/2026 cada
// serviço tem dia e veículo próprios, com avisos de dias sem veículo e de
// transfer de aeroporto sem o par (ver ServicoPedido abaixo); os Termos
// ficam numa caixa na própria etapa de revisão.
//
// Redesenho de UX pedido pelo Wilson em 29/set/2026 ("Melhore
// profundamente a UX desta página de contratação de Transporte Privado,
// sem descaracterizar o visual premium/silent luxury atual [...] a
// experiência deve deixar de parecer 'um formulário longo com várias
// opções' e passar a parecer 'um configurador premium de transporte
// privado em quatro etapas'"). O que mudou em relação à versão anterior
// (que ainda era o antigo TransporteModal esticado numa página):
// - Hero mais baixo, frase objetiva e "Como funciona" compacto numa linha.
// - Fluxo progressivo 1 Veículo → 2 Trajeto → 3 Dados → 4 Revisão, com
//   stepper fixo no topo (etapa atual em azul) — só uma etapa aparece por
//   vez, em vez de veículos + todas as rotas + formulário + termos juntos.
// - Veículos com capacidade em destaque ("Até 10 passageiros") e uma
//   diferenciação curta; selecionado com borda azul, fundo azul claro e
//   check. Rotas separadas em abas (Aeroporto | Cidade | Passeios 10h) +
//   filtro de região, cada rota como card selecionável com preço em
//   destaque; várias rotas podem ser somadas ao mesmo pedido.
// - Resumo do pedido sempre visível (painel lateral fixo no desktop,
//   barra inferior compacta e expansível no celular), com o total
//   "piscando" a cada mudança, e um CTA que muda conforme a etapa.
// - Nada de lista "Faltam N itens": validação ao lado de cada campo e,
//   no resumo, só uma frase do que falta.
// - Incluído / Não incluído / Opcionais perto da escolha das rotas, com
//   "Ver regras e adicionais" num modal; motorista bilíngue virou um
//   opcional (checkbox), não um alerta amarelo.
// - Termos: checkbox + "Ler Termos e Condições" em modal — acabou a caixa
//   com rolagem obrigatória até o fim.
// - Data do serviço, horário aproximado e número do voo em campos
//   próprios; etapa final de revisão antes de enviar.
// Sem pagamento automático (decisão do Wilson para este produto): o envio
// registra o pedido no CRM (/api/transporte-privado-selfservice) e a
// equipe fecha logística e pagamento pelo WhatsApp. Preços, veículos e
// rotas continuam vindo de app/lib/motoristaPrivadoRotas.ts (mesma fonte
// da Calculadora Reversa e do self-service).

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { ROTEIRO_PRECO_BASE } from "../../components/CustomPackageCard";
import {
  VEICULOS_MOTORISTA,
  ROTAS_MOTORISTA,
  REGIOES_MOTORISTA,
  encontrarRotaMotorista,
  encontrarVeiculoMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type RegiaoRotaMotorista,
  type VeiculoMotoristaId,
} from "../../lib/motoristaPrivadoRotas";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  VEICULO_CURTO,
  PRECO_MINIMO_VEICULO,
  LOCAIS,
  nomeLocal,
  TRECHOS_INTERESTADUAL,
  ICONE_CATEGORIA_ROTA,
  IconeResumo,
  CLASSE_SELECT,
  MAX_PASSAGEIROS,
  MAX_DIAS_VIAGEM,
  diasEntre,
  formatarDataCurta,
  formatarDiaMes,
  listarNatural,
  mascararWhatsapp,
  IconeCheck,
  Modal,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
  TextoTermosTransporte,
  type LocalId,
} from "../../components/transporte/compartilhado";
import { EscopoServico } from "../../components/EscopoServico";
import { AvisoPagamentoConcluido } from "../AvisoPagamentoConcluido";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba, BlocoPagamentoNovaAba } from "../pagamentoNovaAba";
import { gerarContratoTransporte, type DadosContratoTransporte } from "../../lib/contratoTransportePrivado";

// Transfer de aeroporto saiu desta página e virou produto próprio
// (/produtos/transfer-aeroporto) — pedido do Wilson, 30/set/2026. Aqui
// ficou só o motorista à disposição: dentro/entre cidades e passeio 10h.
// "Dentro da cidade" virou aba própria (Wilson, 06/out/2026: "no transporte
// interestadual, no campo indo para, só pode aparecer outra cidade, não a
// mesma de origem").
type TipoServico = "cidade" | "interestadual" | "passeio";

// Tempo estimado de trajeto por rota (referência de trânsito normal) —
// Wilson, 06/out/2026: "adicionar tempo estimado de trajeto + deslocamento
// até o carro". Estimativas, não garantia.
const DURACAO_ROTA: Record<string, string> = {
  "dentro-tokyo": "20 a 60 min",
  "dentro-osaka": "20 a 50 min",
  "dentro-kyoto-ou-kyoto-osaka": "20 a 50 min dentro de Kyoto · 60 a 80 min até Osaka",
};
const DESLOCAMENTO_ATE_CARRO = "+ 5 a 15 min a pé até o ponto de embarque permitido para o veículo";
const duracaoRota = (rotaId: string, categoria?: string) =>
  categoria === "tour-dia-inteiro" ? "10 horas à disposição" : (DURACAO_ROTA[rotaId] ?? "a confirmar");

// Objetivo do serviço (Wilson, 06/out/2026: "qual objetivo do serviço,
// reunião de negócios, família etc.") — usado na sugestão de veículo.
const OBJETIVOS = [
  { id: "negocios", nome: "Reunião de negócios" },
  { id: "familia", nome: "Viagem em família" },
  { id: "casal", nome: "Casal / lua de mel" },
  { id: "amigos", nome: "Grupo de amigos" },
  { id: "compras", nome: "Compras" },
  { id: "passeio", nome: "Passeio turístico" },
] as const;
type ObjetivoId = (typeof OBJETIVOS)[number]["id"];

// Sugestão de veículo pelos dados da etapa 1 (Wilson, 06/out/2026: "na
// página de veículos gerar uma sugestão baseada nos inputs do cliente").
// Regra: o Alphard é a opção premium mas tem porta-malas pequeno (cabe bem
// até ~5 pessoas com 1 mala grande cada); acima disso, a van/ônibus que
// comporta passageiros + malas com folga.
function sugerirVeiculo(passageiros: number, malas: number, objetivo: ObjetivoId | ""): { id: VeiculoMotoristaId; motivo: string } {
  const premium = objetivo === "negocios" || objetivo === "casal";
  if (passageiros <= 5 && malas <= 5 && (premium || malas <= passageiros))
    return { id: "alphard8", motivo: premium ? "Mais conforto e silêncio para o seu objetivo" : "Conforto premium para o tamanho do grupo" };
  const lugares = passageiros + Math.ceil(Math.max(0, malas - passageiros) / 2);
  if (lugares <= 9) return { id: "hiace10", motivo: "Espaço para o grupo e para as malas" };
  if (lugares <= 13) return { id: "hiace14", motivo: "Grupo médio com bagagem" };
  if (lugares <= 17) return { id: "coaster18", motivo: "Grupo grande com bagagem" };
  if (lugares <= 20) return { id: "coaster21", motivo: "Grupo grande com bagagem" };
  return { id: "coaster29", motivo: "Maior capacidade disponível" };
}

// Escopo (Wilson, 06/out/2026: "igual guia turístico, tem que deixar claro
// o que faz parte e o que não faz parte da contratação, duração de
// deslocamento").
const INCLUIDO_TRANSPORTE = [
  "Motorista profissional e veículo exclusivo do seu grupo",
  "Combustível, pedágios, estacionamento e impostos",
  "Tempo incluído por trecho (30 a 90 min) ou 10 horas no passeio de dia inteiro",
  "Embarque e desembarque nos endereços informados",
];
const NAO_INCLUIDO_TRANSPORTE = [
  "Transfer aeroporto ↔ hotel (contratado em Transfer Aeroporto)",
  "Tempo além do incluído: hora extra cobrada em blocos de 30 min",
  "Paradas e trechos fora dos trajetos contratados",
  "O motorista não é guia turístico e fala japonês (bilíngue sob consulta)",
  "Ingressos, refeições e despesas do grupo",
];
const TOURS = ROTAS_MOTORISTA.filter((r) => r.categoria === "tour-dia-inteiro");
const REGIAO_CURTA: Record<RegiaoRotaMotorista, string> = {
  kanto: "Tóquio",
  kansai: "Osaka/Kyoto",
  hiroshima: "Hiroshima",
};
// 5 etapas (Wilson, 30/set/2026): data e nº de passageiros vêm antes de
// tudo — inspirado na primeira etapa da SIXT (quando + quantos numa
// caixa só, com o botão de avançar ao lado). Veículo passou a ser a 2ª.
const ETAPAS = ["Viagem", "Veículo", "Trajeto", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4 | 5;
// ── Serviços ligados a datas (Wilson, 30/set/2026) ──
// A etapa 1 pede o período no Japão (chegada → partida). Cada serviço
// adicionado tem data (dentro do período), horário opcional e veículo
// próprio — o veículo da etapa 2 é só o padrão pré-selecionado. Com isso o
// resumo aponta dias sem veículo e transfers de aeroporto sem o par
// (chegada sem volta / volta sem chegada). Avisos só informam, não
// bloqueiam (decisão do Wilson).
type ServicoPedido = {
  uid: string;
  rotaId: string;
  veiculo: VeiculoMotoristaId;
  data: string;
  horario: string;
  enderecoPartida: string;
  enderecoDestino: string;
};

export default function TransportePrivadoPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  // Veículo padrão (etapa 2) só conta como "escolhido" depois do clique
  // do cliente. Cada serviço pode trocar de veículo na etapa 3.
  const [veiculoEscolhido, setVeiculoEscolhido] = useState(false);
  const [veiculoPadrao, setVeiculoPadrao] = useState<VeiculoMotoristaId>("hiace10");
  const [servicos, setServicos] = useState<ServicoPedido[]>([]);
  const [tipoServico, setTipoServico] = useState<TipoServico>("cidade");
  const [novoEnderecoA, setNovoEnderecoA] = useState("");
  const [novoEnderecoB, setNovoEnderecoB] = useState("");
  const [objetivo, setObjetivo] = useState<ObjetivoId | "">("");
  const [malas, setMalas] = useState(1);
  const [escopoCiente, setEscopoCiente] = useState(false);
  // Contrato + assinatura eletrônica + pagamento online (Wilson, 06/out/2026).
  const [cpf, setCpf] = useState("");
  const [assinaturaNome, setAssinaturaNome] = useState("");
  const [contratoAssinado, setContratoAssinado] = useState(false);
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [origem, setOrigem] = useState<LocalId | "">("");
  const [destino, setDestino] = useState<LocalId | "">("");
  const [tourId, setTourId] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [novoVeiculo, setNovoVeiculo] = useState<VeiculoMotoristaId | "">("");
  const [ultimoAdicionado, setUltimoAdicionado] = useState<string | null>(null);

  const [opcionalMeetGreet, setOpcionalMeetGreet] = useState(false);
  const [opcionalCadeirinha, setOpcionalCadeirinha] = useState(false);
  const [qtdCadeirinhas, setQtdCadeirinhas] = useState(1);
  const [opcionalBilingue, setOpcionalBilingue] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  // Período no Japão (etapa 1).
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [numeroVoo, setNumeroVoo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);
  const [tentouAvancarViagem, setTentouAvancarViagem] = useState(false);
  const [passageiros, setPassageiros] = useState(1);

  const [termosAceitos, setTermosAceitos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [modalRegras, setModalRegras] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);

  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);
  const proximoUid = useRef(0);

  const veiculo = encontrarVeiculoMotorista(veiculoPadrao);
  const veiculoCurto = VEICULO_CURTO[veiculoPadrao];
  const veiculoComporta = (assentos: number) => assentos >= passageiros;

  // ── Período (etapa 1) ──
  const erroDataChegada = !dataChegada
    ? "Informe a data de chegada."
    : dataChegada < hojeISO()
      ? "A chegada precisa ser hoje ou depois."
      : null;
  const erroDataPartida = !dataPartida
    ? "Informe a data de partida."
    : dataChegada && dataPartida < dataChegada
      ? "A partida precisa ser no dia da chegada ou depois."
      : dataChegada && diasEntre(dataChegada, dataPartida).length > MAX_DIAS_VIAGEM
        ? `Para viagens com mais de ${MAX_DIAS_VIAGEM} dias, fale com a nossa equipe.`
        : null;
  const periodoValido = erroDataChegada === null && erroDataPartida === null;
  const diasViagem = periodoValido ? diasEntre(dataChegada, dataPartida) : [];

  // ── Serviços ──
  const servicosOrdenados = [...servicos].sort((a, b) =>
    a.data === b.data ? (a.horario || "99").localeCompare(b.horario || "99") : a.data.localeCompare(b.data),
  );
  const quantidadeItens = servicos.length;
  const precoServico = (s: ServicoPedido) => encontrarRotaMotorista(s.rotaId)?.precoUSD[s.veiculo] ?? 0;
  const motoristaUSD = servicos.reduce((soma, s) => soma + precoServico(s), 0);
  // Problemas que impedem avançar: veículo menor que o grupo ou data fora
  // do período (pode acontecer se o cliente voltar e mudar a etapa 1).
  const problemaServico = (s: ServicoPedido): string | null => {
    if (!veiculoComporta(encontrarVeiculoMotorista(s.veiculo).assentos))
      return `${VEICULO_CURTO[s.veiculo].nome} leva até ${encontrarVeiculoMotorista(s.veiculo).assentos} passageiros — troque o veículo.`;
    if (diasViagem.length > 0 && !diasViagem.includes(s.data)) return "Data fora do período da viagem — escolha outra data.";
    return null;
  };
  const servicosComProblema = servicos.filter((s) => problemaServico(s) !== null).length;

  // Avisos (só informam — decisão do Wilson): dias sem veículo, transfer
  // de chegada sem a volta ao aeroporto (e vice-versa), transfer fora do
  // dia da chegada/partida e dois passeios de 10h no mesmo dia.
  const avisos: string[] = [];
  if (servicos.length > 0 && diasViagem.length > 0) {
    const diasSemVeiculo = diasViagem.filter((d) => !servicos.some((s) => s.data === d));
    if (diasSemVeiculo.length > 0) {
      avisos.push(
        `${diasSemVeiculo.length === 1 ? "1 dia" : `${diasSemVeiculo.length} dias`} sem veículo contratado: ${listarNatural(diasSemVeiculo.map(formatarDiaMes))}.`,
      );
    }
    const toursPorDia = new Map<string, number>();
    servicos
      .filter((s) => encontrarRotaMotorista(s.rotaId)?.categoria === "tour-dia-inteiro")
      .forEach((s) => toursPorDia.set(s.data, (toursPorDia.get(s.data) ?? 0) + 1));
    toursPorDia.forEach((n, d) => {
      if (n > 1) avisos.push(`${n} passeios de 10h no mesmo dia (${formatarDiaMes(d)}).`);
    });
  }

  // Roteiro Personalizado incluso (mesma regra de sempre do Transporte
  // Privado) — só entra com pelo menos 1 serviço selecionado.
  const roteiroUSD = quantidadeItens > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  // Opcionais com preço fixo entram no total (motorista bilíngue é sob
  // consulta — não soma). Contam assim que marcados, mesmo antes de
  // escolher a rota (o resumo mostra "a partir de" + opcionais).
  const meetGreetUSD = opcionalMeetGreet ? ADICIONAL_MEET_GREET_USD : 0;
  const cadeirinhaUSD = opcionalCadeirinha ? ADICIONAL_CADEIRINHA_USD * qtdCadeirinhas : 0;
  const adicionaisUSD = meetGreetUSD + cadeirinhaUSD;
  const totalUSD = motoristaUSD + roteiroUSD + adicionaisUSD;
  const totalBRL = totalUSD * cambioCotacao;
  // "23/out a 27/out · 5 dias"
  const textoPeriodo = periodoValido
    ? dataChegada === dataPartida
      ? `${formatarDiaMes(dataChegada)} · 1 dia`
      : `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${diasViagem.length} dias`
    : "";
  const resumoSelecao =
    servicosOrdenados.length === 0
      ? "Nenhum serviço de motorista selecionado."
      : servicosOrdenados
          .map(
            (s) =>
              `${formatarDataCurta(s.data)}${s.horario ? ` ${s.horario}` : ""} — ${encontrarRotaMotorista(s.rotaId)?.nome ?? s.rotaId} (${encontrarVeiculoMotorista(s.veiculo).nome}) — de ${s.enderecoPartida} para ${s.enderecoDestino}`,
          )
          .join("; ");

  // ── Validação por campo (mostrada ao lado de cada campo) ──
  const digitosWhatsapp = whatsapp.replace(/\D/g, "").length;
  const errosDados: Record<string, string | null> = {
    nome: nome.trim().length < 3 ? "Informe seu nome completo." : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Informe um e-mail válido.",
    whatsapp: digitosWhatsapp >= 10 ? null : "Informe um WhatsApp com DDD.",
  };
  const errosViagem: Record<string, string | null> = { dataChegada: erroDataChegada, dataPartida: erroDataPartida };
  const dadosValidos = Object.values(errosDados).every((e) => e === null);
  const mostrarErro = (campo: string) =>
    campo in errosViagem
      ? tocados[campo] || tentouAvancarViagem
        ? errosViagem[campo]
        : null
      : tocados[campo] || tentouAvancarDados
        ? errosDados[campo]
        : null;
  const tocar = (campo: string) => setTocados((t) => ({ ...t, [campo]: true }));

  const etapa1Ok = periodoValido && passageiros >= 1 && objetivo !== "" && escopoCiente;
  const sugestao = sugerirVeiculo(passageiros, malas, objetivo);
  const cpfValido = cpf.replace(/\D/g, "").length === 11;
  const normalizar = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");
  const assinaturaValida = nome.trim().length >= 3 && normalizar(assinaturaNome) === normalizar(nome);
  const etapa2Ok = veiculoEscolhido && veiculoComporta(veiculo.assentos);
  const etapa3Ok = quantidadeItens > 0 && servicosComProblema === 0;
  const etapa4Ok = dadosValidos && cpfValido;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok, etapa4Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && etapa4Ok && termosAceitos && contratoAssinado && assinaturaValida;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    // Volta pro topo do configurador (logo abaixo do hero), pra etapa nova
    // começar sempre no mesmo lugar.
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function ajustarPassageiros(novo: number) {
    const n = Math.max(1, Math.min(MAX_PASSAGEIROS, novo));
    setPassageiros(n);
    // Se o veículo padrão não comporta mais o grupo, desmarca — o cliente
    // escolhe de novo na etapa 2. Serviços já adicionados com veículo
    // pequeno ficam marcados em vermelho na etapa 3.
    if (veiculoEscolhido && veiculo.assentos < n) setVeiculoEscolhido(false);
  }

  function escolherVeiculo(id: VeiculoMotoristaId) {
    setVeiculoPadrao(id);
    setVeiculoEscolhido(true);
  }

  function atualizarServico(uid: string, mudanca: Partial<ServicoPedido>) {
    setServicos((lista) => lista.map((s) => (s.uid === uid ? { ...s, ...mudanca } : s)));
  }

  function removerServico(uid: string) {
    setServicos((lista) => lista.filter((s) => s.uid !== uid));
  }

  // CTA principal — muda de rótulo conforme a etapa (o que fazer no
  // clique fica em acionarCta, fora do render).
  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? etapa1Ok
        ? { rotulo: "Ver veículos", ativo: true, falta: null }
        : {
            rotulo: "Ver veículos",
            ativo: true,
            falta: !periodoValido
              ? "Informe chegada e partida para continuar"
              : objetivo === ""
                ? "Informe o objetivo do serviço"
                : "Confirme que leu o que está e o que não está incluído",
          }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha um veículo", ativo: false, falta: "Escolha um veículo para continuar" }
        : etapa === 3
          ? etapa3Ok
            ? { rotulo: "Continuar", ativo: true, falta: null }
            : quantidadeItens === 0
              ? { rotulo: "Escolha uma rota", ativo: false, falta: "Adicione ao menos um serviço para continuar" }
              : { rotulo: "Revise os serviços", ativo: false, falta: "Corrija os serviços marcados em vermelho" }
          : etapa === 4
            ? { rotulo: "Continuar", ativo: etapa4Ok, falta: etapa4Ok ? null : "Complete seus dados (com CPF) para continuar" }
            : {
                rotulo: status === "enviando" ? "Enviando…" : "Assinar e pagar",
                ativo: podeEnviar && status !== "enviando",
                falta: !termosAceitos
                  ? "Aceite os Termos e Condições"
                  : !contratoAssinado || !assinaturaValida
                    ? "Assine o contrato digitando seu nome completo"
                    : null,
              };

  function acionarCta() {
    if (etapa === 1) {
      if (etapa1Ok) irPara(2);
      else setTentouAvancarViagem(true);
      return;
    }
    if (etapa === 2) {
      if (etapa2Ok) irPara(3);
      return;
    }
    if (etapa === 3) {
      if (etapa3Ok) irPara(4);
      return;
    }
    if (etapa === 4) {
      if (etapa4Ok) irPara(5);
      else setTentouAvancarDados(true);
      return;
    }
    if (!termosAceitos || !contratoAssinado || !assinaturaValida) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = etapasOk.filter((ok) => !ok).length;

  const opcionaisSelecionados = [
    opcionalMeetGreet ? "Meet & Greet (placa de recepção)" : null,
    opcionalCadeirinha ? `Cadeirinha infantil (${qtdCadeirinhas}×)` : null,
    opcionalBilingue ? "Motorista bilíngue português/inglês (sob consulta)" : null,
  ].filter(Boolean) as string[];
  const dadosContrato: DadosContratoTransporte = {
    nome: nome.trim(),
    cpf: cpf.trim(),
    email: email.trim(),
    whatsapp: whatsapp.trim(),
    passageiros,
    dataChegada,
    dataPartida,
    servicos: servicosOrdenados.map((s) => {
      const rota = encontrarRotaMotorista(s.rotaId);
      return {
        data: s.data,
        horario: s.horario,
        rota: rota?.nome ?? s.rotaId,
        veiculo: encontrarVeiculoMotorista(s.veiculo).nome,
        enderecoPartida: s.enderecoPartida,
        enderecoDestino: s.enderecoDestino,
        duracaoEstimada: duracaoRota(s.rotaId, rota?.categoria),
        valorUSD: precoServico(s),
      };
    }),
    opcionais: opcionaisSelecionados,
    totalUSD: Math.round(totalUSD),
    totalBRL: Math.round(totalBRL * 100) / 100,
    politicaCancelamento: POLITICA_CANCELAMENTO_MOTORISTA,
  };

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const janelaPagamento = abrirAbaPagamento();
    const opcionais = opcionaisSelecionados;
    const veiculosUsados = Array.from(new Set(servicosOrdenados.map((s) => encontrarVeiculoMotorista(s.veiculo).nome)));
    try {
      const resposta = await fetch("/api/transporte-privado-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto: "transporte-privado",
          veiculo: veiculosUsados.join(" + "),
          itens: servicosOrdenados.map((s) => ({
            rotaId: s.rotaId,
            veiculo: s.veiculo,
            data: s.data,
            horario: s.horario,
            enderecoPartida: s.enderecoPartida,
            enderecoDestino: s.enderecoDestino,
            quantidade: 1,
          })),
          objetivo: OBJETIVOS.find((o) => o.id === objetivo)?.nome ?? "",
          malas,
          cpf,
          contrato: dadosContrato,
          assinaturaNome,
          contratoAssinado,
          pagarOnline: true,
          resumo: resumoSelecao,
          motoristaUSD,
          roteiroUSD,
          adicionaisUSD,
          totalUSD,
          totalBRL,
          formaPagamento: null,
          nome,
          email,
          whatsapp,
          // data_viagem do CRM = chegada ao Japão.
          dataServico: dataChegada,
          dataChegada,
          dataPartida,
          horario: "",
          passageiros,
          numeroVoo,
          opcionais,
          avisos,
          observacoes,
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        fecharAba(janelaPagamento);
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      if (dadosResposta?.checkoutUrl) {
        if (enviarParaPagamento(janelaPagamento, dadosResposta.checkoutUrl)) {
          setLinkPagamento(dadosResposta.checkoutUrl);
          setStatus("enviado");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      fecharAba(janelaPagamento);
      setStatus("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      fecharAba(janelaPagamento);
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar meu transporte privado pelo site da Ajisai — ${resumoSelecao}.${
    nome ? ` Meu nome é ${nome}.` : ""
  }`;

  // Interestadual: só cidades diferentes da origem. Dentro da cidade: aba própria.
  const trechosAtivos = TRECHOS_INTERESTADUAL.filter((t) => (tipoServico === "cidade" ? t.de === t.para : t.de !== t.para));
  const origensPossiveis = LOCAIS.filter((l) => trechosAtivos.some((t) => t.de === l.id));
  const destinosPossiveis = origem ? trechosAtivos.filter((t) => t.de === origem) : [];

  function trocarTipoServico(tipo: TipoServico) {
    setTipoServico(tipo);
    setOrigem("");
    setDestino("");
    setTourId("");
  }
  const rotaEscolhida =
    tipoServico !== "passeio"
      ? encontrarRotaMotorista(trechosAtivos.find((t) => t.de === origem && t.para === destino)?.rotaId ?? "")
      : encontrarRotaMotorista(tourId);

  // Data sugerida pro próximo serviço: o primeiro dia ainda sem veículo
  // (ou a chegada).
  const dataSugerida = diasViagem.find((d) => !servicos.some((s) => s.data === d)) ?? diasViagem[0] ?? "";
  const dataNovoServico = novaData && diasViagem.includes(novaData) ? novaData : dataSugerida;
  const veiculoNovoServico: VeiculoMotoristaId = novoVeiculo || veiculoPadrao;

  const enderecosNovosOk = novoEnderecoA.trim().length >= 8 && (tipoServico === "passeio" || novoEnderecoB.trim().length >= 8);
  function adicionarRotaEscolhida() {
    if (!rotaEscolhida || !dataNovoServico || !enderecosNovosOk) return;
    proximoUid.current += 1;
    const uid = `${rotaEscolhida.id}-${proximoUid.current}`;
    setServicos((lista) => [
      ...lista,
      {
        uid,
        rotaId: rotaEscolhida.id,
        veiculo: veiculoNovoServico,
        data: dataNovoServico,
        horario: novoHorario,
        enderecoPartida: novoEnderecoA.trim(),
        enderecoDestino: tipoServico === "passeio" ? novoEnderecoB.trim() || novoEnderecoA.trim() : novoEnderecoB.trim(),
      },
    ]);
    setNovoEnderecoA("");
    setNovoEnderecoB("");
    setUltimoAdicionado(uid);
    setOrigem("");
    setDestino("");
    setTourId("");
    setNovaData("");
    setNovoHorario("");
    setNovoVeiculo("");
  }

  // Valor mostrado no resumo: total real com rota; sem rota, o preço
  // "a partir de" do veículo somado aos opcionais já marcados.
  const totalExibidoUSD: number | null =
    quantidadeItens > 0 ? totalUSD : veiculoEscolhido ? PRECO_MINIMO_VEICULO[veiculoPadrao] + adicionaisUSD : null;
  const animarTotal = totalExibidoUSD !== null;


  // Conteúdo do resumo — o mesmo no painel lateral (desktop) e na gaveta
  // da barra inferior (celular).
  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seu transporte</p>
      <p className="mt-2 text-sm text-black/80">
        {textoPeriodo || <span className="text-black/45">Período a definir</span>}
        <span className="text-black/50">
          {" "}
          · {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
        </span>
      </p>
      {servicos.length === 0 &&
        (veiculoEscolhido ? (
          <p className="mt-1 text-sm text-black/80">
            {veiculoCurto.nome} <span className="text-black/50">· até {veiculo.assentos} passageiros</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-black/45">Nenhum veículo escolhido</p>
        ))}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {servicosOrdenados.length === 0 ? (
          <p className="text-sm text-black/45">Nenhuma rota escolhida</p>
        ) : (
          <>
            {servicosOrdenados.map((s) => {
              const rota = encontrarRotaMotorista(s.rotaId);
              if (!rota) return null;
              const problema = problemaServico(s);
              return (
                <div key={s.uid} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                    <IconeResumo src={ICONE_CATEGORIA_ROTA[rota.categoria]} />
                    <span className="min-w-0">
                      <span className="block">{rota.nome}</span>
                      <span className={`block text-xs ${problema ? "text-red-600" : "text-black/50"}`}>
                        {formatarDataCurta(s.data)}
                        {s.horario && ` · ${s.horario}`} · {VEICULO_CURTO[s.veiculo].nome}
                      </span>
                    </span>
                  </span>
                  <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(precoServico(s))}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/55">
                <IconeResumo src="/images/icone-servico-experiencia-sob-medida.png" />
                Roteiro Personalizado (incluso)
              </span>
              <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(roteiroUSD)}</span>
            </div>
          </>
        )}
        {meetGreetUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-meet-greet.png" />
              Meet &amp; Greet
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(meetGreetUSD)}</span>
          </div>
        )}
        {cadeirinhaUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-cadeirinha.png" />
              <span>
                {qtdCadeirinhas > 1 && <span className="text-black/50">{qtdCadeirinhas}× </span>}
                Cadeirinha infantil
              </span>
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(cadeirinhaUSD)}</span>
          </div>
        )}
        {opcionalBilingue && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-motorista-bilingue.png" />
              Motorista bilíngue
            </span>
            <span className="shrink-0 text-xs text-black/50">sob consulta</span>
          </div>
        )}
      </div>
      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-black/50">Total estimado</p>
        {/* `key` no total: a cada mudança o elemento remonta e a animação
            de destaque roda de novo — feedback imediato do preço. */}
        <p
          key={Math.round(totalExibidoUSD ?? 0)}
          className={`${inter.className} mt-0.5 rounded-md text-3xl font-bold tabular-nums tracking-[-0.02em] text-[#0A2540]`}
          style={animarTotal ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
        >
          {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
        </p>
        {quantidadeItens === 0 && veiculoEscolhido && (
          <p className="text-xs text-black/50">
            a partir de, por trajeto{adicionaisUSD > 0 ? " + opcionais" : ""} · valor final após escolher a rota
          </p>
        )}
        {quantidadeItens > 0 && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)} na cotação do dia</p>
        )}
      </div>
    </div>
  );

  const botaoCta = (classeExtra = "") => (
    <button
      type="button"
      onClick={acionarCta}
      aria-disabled={!cta.ativo}
      className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
        cta.ativo ? "bg-[#1f6fb8] text-white shadow-sm hover:bg-[#2f80c9]" : "cursor-default bg-[#dce6ef] text-[#5b7a95]"
      } ${classeExtra}`}
    >
      {cta.rotulo}
    </button>
  );

  const textoStatus =
    cta.falta ?? (etapa < 5 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-40 pt-14 text-black lg:pb-16 [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm">
      <style>{`@keyframes ajisai-destaque-preco { 0% { background-color: rgba(47,128,201,0.16); } 100% { background-color: transparent; } }`}</style>

      <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link
          href="/produtos"
          className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>Transporte Privado</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      {status === "enviado" ? (
        <div className="mx-auto max-w-xl px-5 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
            <IconeCheck className="h-6 w-6" />
          </span>
          <h1 className={`${display.className} mt-5 text-2xl font-medium text-black md:text-3xl`}>Recebemos seu pedido</h1>
          {linkPagamento && <BlocoPagamentoNovaAba url={linkPagamento} />}
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70">
            Enviamos a cópia do contrato assinado para o seu e-mail. Depois da confirmação do pagamento, nossa equipe
            confirma motorista, ponto de encontro e horários pelo WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
          >
            Continuar no WhatsApp
          </a>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 md:pt-8">
            {/* Hero — mais baixo que antes (pedido do Wilson: "reduzir
                levemente a altura do Hero"), mesma foto e headline. */}
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
                <Image
                  src="/images/produtos/transporte-privado-header.jpg"
                  alt="Família sendo recebida pelo motorista particular ao lado da van, em frente a um templo no Japão"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[40%_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Transporte Privado</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Motorista particular, sem compartilhar veículo
                </h1>
              </div>
            </section>
          </div>

          {/* Stepper — fixo logo abaixo da barra do topo enquanto rola. */}
          {/* Âncora fora do elemento sticky — ao trocar de etapa, a página
              rola até aqui (a posição do próprio stepper não serve, porque
              quando ele está "grudado" no topo o getBoundingClientRect
              devolve sempre a posição grudada). */}
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <AvisoPagamentoConcluido />
          </div>
          <div ref={stepperRef} aria-hidden="true" />
          <div className="sticky top-14 z-40 mt-6 bg-[#1f6fb8] shadow-[0_4px_16px_rgba(10,37,64,0.12)]">
            {/* w-fit + mx-auto: centralizado; max-w-full + overflow-x-auto:
                se não couber no celular, rola na horizontal sem cortar. */}
            <nav aria-label="Etapas" className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto px-5 py-3 md:gap-3 md:px-8">
              {ETAPAS.map((nomeEtapa, i) => {
                const numero = (i + 1) as Etapa;
                const atual = etapa === numero;
                const concluida = numero < etapa && etapasOk[numero - 1];
                // Pode voltar pra qualquer etapa anterior; pra frente, só
                // se as anteriores estiverem completas.
                const liberada = numero <= etapa || etapasOk.slice(0, numero - 1).every(Boolean);
                return (
                  <div key={nomeEtapa} className="flex shrink-0 items-center gap-1 md:gap-3">
                    <button
                      type="button"
                      onClick={() => liberada && irPara(numero)}
                      disabled={!liberada}
                      aria-current={atual ? "step" : undefined}
                      className={`flex min-h-[44px] items-center gap-2 rounded-full px-2 text-sm transition md:px-3 ${
                        atual ? "text-white" : concluida ? "text-white/85 hover:text-white" : "text-white/50"
                      } ${liberada && !atual ? "cursor-pointer" : ""}`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          atual
                            ? "bg-white text-[#1f6fb8]"
                            : concluida
                              ? "bg-white/20 text-white"
                              : "border border-white/40 text-white/60"
                        }`}
                      >
                        {concluida && !atual ? <IconeCheck className="h-3.5 w-3.5" /> : numero}
                      </span>
                      <span className={`${atual ? "font-semibold" : "font-medium"} ${atual ? "" : "hidden sm:inline"}`}>{nomeEtapa}</span>
                    </button>
                    {i < ETAPAS.length - 1 && <span className="h-px w-4 bg-white/30 md:w-10" aria-hidden="true" />}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {/* ── ETAPA 1 — VIAGEM (data + passageiros, estilo SIXT) ── */}
              {etapa === 1 && (
                <section aria-labelledby="titulo-etapa-1">
                  <h2 id="titulo-etapa-1" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Quando e quantas pessoas?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Informe o período no Japão. Mostramos só os veículos que comportam o seu grupo.</p>
                  <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] sm:p-5">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_auto] md:items-start">
                      <div className="min-w-0">
                        {/* Chegada | Partida numa caixa só (como retirada/devolução
                            na SIXT); rótulos na mesma grade das duas metades. */}
                        <div className="mb-1.5 grid grid-cols-2 text-xs font-medium text-black/60">
                          <span>Chegada ao Japão</span>
                          <span className="pl-3.5">Partida do Japão</span>
                        </div>
                        <div
                          className={`grid grid-cols-2 overflow-hidden rounded-xl border bg-white ${
                            mostrarErro("dataChegada") || mostrarErro("dataPartida") ? "border-red-400" : "border-black/15"
                          } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                        >
                          <label className="flex h-12 min-w-0 items-center px-3">
                            <span className="sr-only">Chegada ao Japão</span>
                            <input
                              type="date"
                              min={hojeISO()}
                              value={dataChegada}
                              onChange={(e) => {
                                const v = e.target.value;
                                setDataChegada(v);
                                // Partida vazia ou antes da chegada: acompanha a chegada.
                                if (v && (!dataPartida || dataPartida < v)) setDataPartida(v);
                              }}
                              onBlur={() => tocar("dataChegada")}
                              className="h-full w-full min-w-0 appearance-none bg-transparent text-base text-black focus:outline-none md:text-[15px]"
                            />
                          </label>
                          <label className="flex h-12 min-w-0 items-center border-l border-black/10 px-3">
                            <span className="sr-only">Partida do Japão</span>
                            <input
                              type="date"
                              min={dataChegada || hojeISO()}
                              value={dataPartida}
                              onChange={(e) => setDataPartida(e.target.value)}
                              onBlur={() => tocar("dataPartida")}
                              className="h-full w-full min-w-0 appearance-none bg-transparent text-base text-black focus:outline-none md:text-[15px]"
                            />
                          </label>
                        </div>
                        {mostrarErro("dataChegada") || mostrarErro("dataPartida") ? (
                          <p className="mt-1.5 text-xs text-red-600">{mostrarErro("dataChegada") || mostrarErro("dataPartida")}</p>
                        ) : (
                          <p className="mt-1.5 text-xs text-black/45">
                            {diasViagem.length > 0
                              ? `${diasViagem.length} ${diasViagem.length === 1 ? "dia" : "dias"} no Japão.`
                              : "Cada serviço terá sua data dentro desse período."}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Passageiros</span>
                        <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-black/15 bg-white px-2">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5 shrink-0 text-black/55" aria-hidden="true">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
                          </svg>
                          <button
                            type="button"
                            onClick={() => ajustarPassageiros(passageiros - 1)}
                            disabled={passageiros <= 1}
                            aria-label="Menos um passageiro"
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className={`${inter.className} w-7 text-center text-base font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">
                            {passageiros}
                          </span>
                          <button
                            type="button"
                            onClick={() => ajustarPassageiros(passageiros + 1)}
                            disabled={passageiros >= MAX_PASSAGEIROS}
                            aria-label="Mais um passageiro"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-black/45">
                          {passageiros >= MAX_PASSAGEIROS ? `Mais de ${MAX_PASSAGEIROS}? Fale com a nossa equipe.` : "Incluindo crianças."}
                        </p>
                      </div>
                      <div>
                        {/* Rótulo invisível: mantém o botão na mesma linha das caixas. */}
                        <span aria-hidden="true" className="mb-1.5 hidden text-xs md:invisible md:block">&nbsp;</span>
                        <button
                          type="button"
                          onClick={acionarCta}
                          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-6 text-sm font-semibold text-white transition hover:bg-[#2f80c9] md:w-auto"
                        >
                          Ver veículos
                        </button>
                      </div>
                    </div>

                    {/* Objetivo e bagagem — base da sugestão de veículo (Wilson, 06/out/2026). */}
                    <div className="mt-4 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-2">
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Objetivo do serviço</span>
                        <span className="relative block">
                          <select value={objetivo} onChange={(e) => setObjetivo(e.target.value as ObjetivoId | "")} className={CLASSE_SELECT}>
                            <option value="">Escolha o objetivo</option>
                            {OBJETIVOS.map((o) => (
                              <option key={o.id} value={o.id}>{o.nome}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                        {tentouAvancarViagem && objetivo === "" && <span className="mt-1 block text-xs text-red-600">Informe o objetivo.</span>}
                      </label>
                      <div>
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Malas grandes (despachadas)</span>
                        <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-black/15 bg-white px-2">
                          <button
                            type="button"
                            onClick={() => setMalas((m) => Math.max(0, m - 1))}
                            disabled={malas <= 0}
                            aria-label="Menos uma mala"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className={`${inter.className} w-7 text-center text-base font-semibold tabular-nums text-[#0A2540]`}>{malas}</span>
                          <button
                            type="button"
                            onClick={() => setMalas((m) => Math.min(40, m + 1))}
                            aria-label="Mais uma mala"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-black/45">Usamos para sugerir o veículo certo.</p>
                      </div>
                    </div>
                  </div>

                  {/* Aviso: aeroporto ↔ hotel é outro produto (Wilson, 06/out/2026). */}
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="note">
                    <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <p>
                      <strong className="font-semibold">Vai do aeroporto para o hotel (ou do hotel para o aeroporto)?</strong> Esse trajeto é
                      contratado na página de Transfer Aeroporto.{" "}
                      <Link href="/produtos/transfer-aeroporto" className="font-semibold text-[#1f6fb8] underline underline-offset-2">
                        Clique aqui
                      </Link>
                      .
                    </p>
                  </div>

                  <EscopoServico titulo="O que você está contratando" incluido={INCLUIDO_TRANSPORTE} naoIncluido={NAO_INCLUIDO_TRANSPORTE} />
                  <p className="mt-2 text-xs leading-5 text-black/55">
                    Duração: cada trajeto mostra o tempo estimado de deslocamento (trânsito normal) {DESLOCAMENTO_ATE_CARRO}.
                  </p>
                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={escopoCiente}
                      onChange={(e) => setEscopoCiente(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e entendi o que está e o que não está incluído no transporte privado.</span>
                  </label>
                  {tentouAvancarViagem && periodoValido && !escopoCiente && <p className="ml-8 text-xs text-red-600">Confirme para continuar.</p>}
                </section>
              )}

              {/* ── ETAPA 2 — VEÍCULO ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha o veículo
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Para{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
                    </button>
                    . Este será o veículo padrão — na próxima etapa você pode trocar em cada serviço.
                  </p>
                  {veiculoComporta(encontrarVeiculoMotorista(sugestao.id).assentos) && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#2f80c9]/30 bg-[#eef6fb] px-4 py-3 text-sm">
                      <span className="rounded-full bg-[#1f6fb8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Sugestão para você</span>
                      <span className="text-black/80">
                        <strong className="font-semibold text-[#0A2540]">{VEICULO_CURTO[sugestao.id].nome}</strong> — {sugestao.motivo} ({passageiros}{" "}
                        {passageiros === 1 ? "passageiro" : "passageiros"}, {malas} {malas === 1 ? "mala" : "malas"}).
                      </span>
                      {!(veiculoEscolhido && veiculoPadrao === sugestao.id) && (
                        <button type="button" onClick={() => escolherVeiculo(sugestao.id)} className="text-sm font-semibold text-[#1f6fb8] underline underline-offset-2">
                          Escolher este
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {VEICULOS_MOTORISTA.filter((v) => veiculoComporta(v.assentos)).map((v) => {
                      const ativo = veiculoEscolhido && veiculoPadrao === v.id;
                      const curto = VEICULO_CURTO[v.id];
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => escolherVeiculo(v.id)}
                          aria-pressed={ativo}
                          className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-3 text-left transition sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
                            ativo
                              ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]"
                              : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#0f1a24] sm:aspect-[3/2] sm:h-auto sm:w-full sm:rounded-none">
                            <Image src={v.foto} alt="" fill sizes="(min-width: 640px) 260px, 112px" className="object-cover" />
                            {/* "MAIS PEDIDO - ETIQUETA LARANJA" (Wilson, 06/out/2026). */}
                            {v.id === "alphard8" && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                                Mais pedido
                              </span>
                            )}
                            {v.id === sugestao.id && (
                              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#1f6fb8] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                                Sugerido
                              </span>
                            )}
                          </span>
                          <span className="block min-w-0 sm:border-t sm:border-black/[0.06] sm:p-4">
                            <span className="block text-[15px] font-medium text-black">{curto.nome}</span>
                            <span className="mt-0.5 block text-sm font-semibold text-[#0A2540]">Até {v.assentos} passageiros</span>
                            <span className="mt-0.5 block text-xs text-black/55">{curto.perfil}</span>
                            <span className={`${inter.className} mt-2 block text-xs text-black/55`}>
                              a partir de{" "}
                              <span className="text-sm font-semibold tabular-nums text-[#0A2540]">{formatUSD(PRECO_MINIMO_VEICULO[v.id])}</span>
                              <span className="text-black/45"> / trajeto</span>
                            </span>
                          </span>
                          {ativo && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f80c9] text-white">
                              <IconeCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {veiculoEscolhido && (
                    <p className="mt-5 flex items-center gap-2 text-sm text-[#1f6fb8]">
                      <IconeCheck className="h-4 w-4" />
                      {veiculoCurto.nome} · Até {veiculo.assentos} passageiros selecionado como padrão
                    </p>
                  )}
                </section>
              )}

              {/* ── ETAPA 3 — TRAJETO ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Monte seus serviços
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Para cada trajeto, escolha o dia e o veículo. Período:{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPeriodo}
                    </button>
                    .
                  </p>
                  <p className="mt-1 text-sm text-black/60">
                    Transfer entre aeroporto e hotel é contratado à parte, em{" "}
                    <Link href="/produtos/transfer-aeroporto" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      Transfer Aeroporto
                    </Link>
                    .
                  </p>

                  <div className="mt-6 rounded-2xl border border-black/10 p-4 sm:p-5">
                    {/* Tipo: dentro/entre cidades (origem → destino) ou passeio de 10h */}
                    <div role="radiogroup" aria-label="Tipo de serviço" className="grid grid-cols-3 gap-1 rounded-xl bg-black/[0.04] p-1">
                      {(
                        [
                          { key: "cidade", nome: "Dentro da cidade", curto: "Na cidade", icone: "/images/icone-interestadual.png", largura: 36 },
                          { key: "interestadual", nome: "Entre cidades", curto: "Entre cidades", icone: "/images/icone-interestadual.png", largura: 36 },
                          { key: "passeio", nome: "Passeio de 10h", curto: "Passeio 10h", icone: "/images/icone-passeio-10h.png", largura: 36 },
                        ] as const
                      ).map((t) => {
                        const ativo = tipoServico === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            role="radio"
                            aria-checked={ativo}
                            onClick={() => trocarTipoServico(t.key)}
                            className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-xs leading-tight transition sm:flex-row sm:gap-2.5 sm:px-2 sm:text-sm ${
                              ativo ? "bg-white font-semibold text-[#0A2540] shadow-sm" : "font-medium text-black/55 hover:text-black"
                            }`}
                          >
                            <Image
                              src={t.icone}
                              alt=""
                              width={t.largura}
                              height={36}
                              className={`h-9 w-auto shrink-0 transition-opacity ${ativo ? "opacity-100" : "opacity-45"}`}
                            />
                            <span className="sm:hidden">{t.curto}</span>
                            <span className="hidden sm:inline">{t.nome}</span>
                          </button>
                        );
                      })}
                    </div>

                    {tipoServico === "cidade" ? (
                      <label className="mt-4 block">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Cidade</span>
                        <span className="relative block">
                          <select
                            value={origem}
                            onChange={(e) => {
                              const nova = e.target.value as LocalId | "";
                              setOrigem(nova);
                              setDestino(nova);
                            }}
                            className={CLASSE_SELECT}
                          >
                            <option value="">Escolha a cidade</option>
                            {origensPossiveis.map((l) => (
                              <option key={l.id} value={l.id}>
                                {encontrarRotaMotorista(trechosAtivos.find((t) => t.de === l.id)?.rotaId ?? "")?.nome.replace(/, ou Kyoto → Osaka/, "") ?? l.nome}
                              </option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                    ) : tipoServico === "interestadual" ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium text-black/60">Saindo de</span>
                          <span className="relative block">
                            <select
                              value={origem}
                              onChange={(e) => {
                                const nova = e.target.value as LocalId | "";
                                setOrigem(nova);
                                // Se só há um destino possível, já preenche.
                                const opcoes = trechosAtivos.filter((t) => t.de === nova);
                                setDestino(opcoes.length === 1 ? opcoes[0].para : "");
                              }}
                              className={CLASSE_SELECT}
                            >
                              <option value="">Escolha a origem</option>
                              {origensPossiveis.some((l) => l.aeroporto) && (
                                <optgroup label="Aeroportos">
                                  {origensPossiveis.filter((l) => l.aeroporto).map((l) => (
                                    <option key={l.id} value={l.id}>{l.nome}</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Cidades">
                                {origensPossiveis.filter((l) => !l.aeroporto).map((l) => (
                                  <option key={l.id} value={l.id}>{l.nome}</option>
                                ))}
                              </optgroup>
                            </select>
                            <IconeSeta />
                          </span>
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium text-black/60">Indo para</span>
                          <span className="relative block">
                            <select
                              value={destino}
                              disabled={!origem}
                              onChange={(e) => setDestino(e.target.value as LocalId | "")}
                              className={CLASSE_SELECT}
                            >
                              <option value="">{origem ? "Escolha o destino" : "Escolha a origem primeiro"}</option>
                              {destinosPossiveis.map((t) => (
                                <option key={t.para} value={t.para}>
                                  {nomeLocal(t.para)}
                                </option>
                              ))}
                            </select>
                            <IconeSeta />
                          </span>
                        </label>
                      </div>
                    ) : (
                      <label className="mt-4 block">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Qual passeio?</span>
                        <span className="relative block">
                          <select value={tourId} onChange={(e) => setTourId(e.target.value)} className={CLASSE_SELECT}>
                            <option value="">Escolha o passeio</option>
                            {REGIOES_MOTORISTA.map((r) => (
                              <optgroup key={r.key} label={REGIAO_CURTA[r.key]}>
                                {TOURS.filter((t) => t.regiao === r.key).map((t) => (
                                  <option key={t.id} value={t.id}>{t.nome.replace(/ — 10 horas$/, "")}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                    )}

                    {/* Dia, horário e veículo deste serviço */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.3fr)]">
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Dia</span>
                        <span className="relative block">
                          <select value={dataNovoServico} onChange={(e) => setNovaData(e.target.value)} className={CLASSE_SELECT}>
                            {diasViagem.map((d) => (
                              <option key={d} value={d}>
                                {formatarDataCurta(d)}
                                {d === dataChegada ? " · chegada" : d === dataPartida ? " · partida" : ""}
                                {servicos.some((s) => s.data === d) ? " ✓" : ""}
                              </option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Horário (opcional)</span>
                        <input
                          type="time"
                          value={novoHorario}
                          onChange={(e) => setNovoHorario(e.target.value)}
                          className="h-12 w-full min-w-0 appearance-none rounded-xl border border-black/15 bg-white px-3.5 text-base text-black transition focus:border-[#2f80c9] focus:outline-none focus:ring-1 focus:ring-[#2f80c9] md:text-[15px]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Veículo</span>
                        <span className="relative block">
                          <select
                            value={veiculoNovoServico}
                            onChange={(e) => setNovoVeiculo(e.target.value as VeiculoMotoristaId)}
                            className={CLASSE_SELECT}
                          >
                            {VEICULOS_MOTORISTA.filter((v) => veiculoComporta(v.assentos)).map((v) => (
                              <option key={v.id} value={v.id}>
                                {VEICULO_CURTO[v.id].nome} · até {v.assentos}
                              </option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                    </div>

                    {/* Endereços completos dos pontos A e B (Wilson, 06/out/2026). */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">
                          {tipoServico === "passeio" ? "Endereço de embarque (ponto A)" : "Endereço completo de partida (ponto A)"}
                        </span>
                        <input
                          type="text"
                          value={novoEnderecoA}
                          onChange={(e) => setNovoEnderecoA(e.target.value)}
                          placeholder="Ex.: Park Hyatt Tokyo, 3-7-1-2 Nishishinjuku, Shinjuku"
                          className="h-12 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3.5 text-base text-black focus:border-[#2f80c9] focus:outline-none md:text-[15px]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">
                          {tipoServico === "passeio" ? "Endereço de retorno (opcional — se diferente)" : "Endereço completo de destino (ponto B)"}
                        </span>
                        <input
                          type="text"
                          value={novoEnderecoB}
                          onChange={(e) => setNovoEnderecoB(e.target.value)}
                          placeholder="Nome do local + endereço"
                          className="h-12 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3.5 text-base text-black focus:border-[#2f80c9] focus:outline-none md:text-[15px]"
                        />
                      </label>
                    </div>

                    {/* Resultado: preço do trecho + adicionar */}
                    <div className="mt-4 flex min-h-[64px] items-center justify-between gap-4 border-t border-black/[0.08] pt-4">
                      {rotaEscolhida ? (
                        <>
                          <div className="min-w-0">
                            <p className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>
                              {formatUSD(rotaEscolhida.precoUSD[veiculoNovoServico])}
                            </p>
                            <p className="text-xs text-black/55">
                              {formatarDataCurta(dataNovoServico)} · {VEICULO_CURTO[veiculoNovoServico].nome} ·{" "}
                              {rotaEscolhida.minutosLivres != null ? `até ${rotaEscolhida.minutosLivres} min incluídos` : "10 horas com motorista"}
                            </p>
                            <p className="mt-0.5 text-xs text-black/55">
                              Trajeto estimado: {duracaoRota(rotaEscolhida.id, rotaEscolhida.categoria)}
                              {rotaEscolhida.categoria !== "tour-dia-inteiro" ? ` ${DESLOCAMENTO_ATE_CARRO}` : ""}
                            </p>
                            {!enderecosNovosOk && <p className="mt-0.5 text-xs text-amber-700">Informe o endereço completo{tipoServico === "passeio" ? " de embarque" : " de partida e de destino"} para adicionar.</p>}
                          </div>
                          <button
                            type="button"
                            onClick={adicionarRotaEscolhida}
                            disabled={!enderecosNovosOk}
                            className="h-11 shrink-0 rounded-full bg-[#1f6fb8] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Adicionar
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-black/45">
                          {tipoServico === "cidade" ? "Escolha a cidade para ver o valor." : tipoServico === "interestadual" ? "Escolha origem e destino para ver o valor." : "Escolha um passeio para ver o valor."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* O que já foi adicionado ao pedido — por dia, com dia e
                      veículo editáveis em cada linha. */}
                  {servicosOrdenados.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">No seu pedido</p>
                      <ul className="mt-2 divide-y divide-black/[0.06] rounded-xl border border-black/10">
                        {servicosOrdenados.map((s) => {
                          const rota = encontrarRotaMotorista(s.rotaId);
                          if (!rota) return null;
                          const problema = problemaServico(s);
                          return (
                            <li
                              key={s.uid}
                              className={`px-4 py-3 ${problema ? "bg-red-50/60" : ultimoAdicionado === s.uid ? "bg-[#2f80c9]/[0.05]" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <IconeResumo src={ICONE_CATEGORIA_ROTA[rota.categoria]} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-black/85">{rota.nome}</p>
                                  <p className="mt-0.5 text-xs text-black/55">
                                    A: {s.enderecoPartida} → B: {s.enderecoDestino}
                                  </p>
                                  <p className="text-xs text-black/45">Trajeto estimado: {duracaoRota(s.rotaId, rota.categoria)}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="relative block">
                                      <select
                                        aria-label={`Dia de ${rota.nome}`}
                                        value={s.data}
                                        onChange={(e) => atualizarServico(s.uid, { data: e.target.value })}
                                        className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                                      >
                                        {!diasViagem.includes(s.data) && <option value={s.data}>{formatarDataCurta(s.data)}</option>}
                                        {diasViagem.map((d) => (
                                          <option key={d} value={d}>
                                            {formatarDataCurta(d)}
                                          </option>
                                        ))}
                                      </select>
                                      <IconeSeta />
                                    </span>
                                    <span className="relative block">
                                      <select
                                        aria-label={`Veículo de ${rota.nome}`}
                                        value={s.veiculo}
                                        onChange={(e) => atualizarServico(s.uid, { veiculo: e.target.value as VeiculoMotoristaId })}
                                        className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                                      >
                                        {VEICULOS_MOTORISTA.filter((v) => veiculoComporta(v.assentos) || v.id === s.veiculo).map((v) => (
                                          <option key={v.id} value={v.id}>
                                            {VEICULO_CURTO[v.id].nome}
                                          </option>
                                        ))}
                                      </select>
                                      <IconeSeta />
                                    </span>
                                    {s.horario && <span className="text-xs text-black/50">{s.horario}</span>}
                                  </div>
                                  {problema && <p className="mt-1.5 text-xs text-red-600">{problema}</p>}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className={`${inter.className} text-sm font-semibold tabular-nums text-[#0A2540]`}>{formatUSD(precoServico(s))}</span>
                                  <button
                                    type="button"
                                    onClick={() => removerServico(s.uid)}
                                    aria-label={`Remover ${rota.nome}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-3" />}
                    </div>
                  )}

                  {/* Incluído / Não incluído / Opcionais — perto da decisão,
                      no lugar do antigo bloco "IMPORTANTE". */}
                  <div className="mt-8 grid gap-5 border-t border-black/10 pt-6 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">{INCLUIDO_TRANSPORTE.join(" · ")}.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Não incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">{NAO_INCLUIDO_TRANSPORTE.join(" · ")}.</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Opcionais</p>
                    <div className="mt-2 divide-y divide-black/[0.06]">
                      {[
                        {
                          marcado: opcionalMeetGreet,
                          alternar: () => setOpcionalMeetGreet((v) => !v),
                          titulo: "Meet & Greet — recepção com placa de identificação",
                          icone: "/images/icone-meet-greet.png",
                          detalhe: `${formatUSD(ADICIONAL_MEET_GREET_USD)}, confirmado pela nossa equipe`,
                        },
                        {
                          marcado: opcionalCadeirinha,
                          alternar: () => setOpcionalCadeirinha((v) => !v),
                          titulo: "Cadeirinha infantil",
                          icone: "/images/icone-cadeirinha.png",
                          detalhe: `${formatUSD(ADICIONAL_CADEIRINHA_USD)} por cadeirinha, confirmado pela nossa equipe`,
                          quantidade: true,
                        },
                        {
                          marcado: opcionalBilingue,
                          alternar: () => setOpcionalBilingue((v) => !v),
                          titulo: "Solicitar motorista bilíngue português/inglês",
                          icone: "/images/icone-motorista-bilingue.png",
                          detalhe: "Sujeito à disponibilidade e valor adicional. Recomendamos solicitar com antecedência.",
                          aviso: true,
                        },
                      ].map((op) => (
                        <div key={op.titulo} className="flex flex-wrap items-center justify-between gap-x-4">
                        <label className="flex min-h-[64px] min-w-0 flex-1 cursor-pointer items-center gap-3 py-3">
                          <input
                            type="checkbox"
                            checked={op.marcado}
                            onChange={op.alternar}
                            className="h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                          />
                          <Image
                            src={op.icone}
                            alt=""
                            width={44}
                            height={44}
                            className={`h-11 w-11 shrink-0 transition-opacity ${op.marcado ? "opacity-100" : "opacity-70"}`}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm text-black/85">{op.titulo}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-black/50">
                              {op.aviso && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />}
                              {op.detalhe}
                            </span>
                          </span>
                        </label>
                        {"quantidade" in op && op.marcado && (
                          <div className="mb-3 ml-[88px] flex items-center gap-1 sm:mb-0 sm:ml-0">
                            <button
                              type="button"
                              onClick={() => setQtdCadeirinhas((q) => Math.max(1, q - 1))}
                              disabled={qtdCadeirinhas <= 1}
                              aria-label="Menos uma cadeirinha"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30 disabled:opacity-40"
                            >
                              −
                            </button>
                            <span className={`${inter.className} w-6 text-center text-sm font-semibold tabular-nums text-[#0A2540]`}>{qtdCadeirinhas}</span>
                            <button
                              type="button"
                              onClick={() => setQtdCadeirinhas((q) => Math.min(6, q + 1))}
                              aria-label="Mais uma cadeirinha"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                            >
                              +
                            </button>
                          </div>
                        )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalRegras(true)}
                      className="mt-2 min-h-[44px] text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2"
                    >
                      Ver regras e adicionais
                    </button>
                  </div>
                </section>
              )}

              {/* ── ETAPA 4 — DADOS ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados só para confirmar o seu transporte.</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Campo rotulo="Nome completo" erro={mostrarErro("nome")}>
                        <input
                          type="text"
                          autoComplete="name"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          onBlur={() => tocar("nome")}
                          className={classeInput(!!mostrarErro("nome"))}
                        />
                      </Campo>
                    </div>
                    <Campo rotulo="E-mail" erro={mostrarErro("email")}>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => tocar("email")}
                        className={classeInput(!!mostrarErro("email"))}
                      />
                    </Campo>
                    <Campo rotulo="WhatsApp" erro={mostrarErro("whatsapp")} ajuda="Com DDD. Para número de fora do Brasil, comece com +.">
                      <input
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                        onBlur={() => tocar("whatsapp")}
                        placeholder="(11) 99999-9999"
                        className={classeInput(!!mostrarErro("whatsapp"))}
                      />
                    </Campo>
                    <Campo rotulo="CPF (para o contrato)" erro={(tocados.cpf || tentouAvancarDados) && !cpfValido ? "Informe um CPF com 11 dígitos." : null}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        onBlur={() => tocar("cpf")}
                        placeholder="000.000.000-00"
                        className={classeInput((tocados.cpf || tentouAvancarDados) && !cpfValido)}
                      />
                    </Campo>
                    <Campo rotulo="Número do voo (opcional)">
                      <input
                        type="text"
                        value={numeroVoo}
                        onChange={(e) => setNumeroVoo(e.target.value.toUpperCase())}
                        placeholder="ex.: JL 34"
                        className={classeInput(false)}
                      />
                    </Campo>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Demais datas, quantidade de bagagem ou solicitações especiais."
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 5 — REVISÃO ── */}
              {etapa === 5 && (
                <section aria-labelledby="titulo-etapa-5">
                  <h2 id="titulo-etapa-5" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Revise seu pedido
                  </h2>
                  <dl className="mt-6 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                    {[
                      {
                        rotulo: "Período e passageiros",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <>
                            {textoPeriodo}
                            <span className="text-black/50">
                              {" "}
                              · {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
                            </span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Serviços",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-1.5">
                            {servicosOrdenados.map((s) => {
                              const rota = encontrarRotaMotorista(s.rotaId);
                              if (!rota) return null;
                              return (
                                <p key={s.uid} className="flex justify-between gap-3">
                                  <span className="min-w-0">
                                    <span className="text-black/55">
                                      {formatarDataCurta(s.data)}
                                      {s.horario && ` ${s.horario}`} ·{" "}
                                    </span>
                                    {rota.nome} <span className="text-black/55">· {VEICULO_CURTO[s.veiculo].nome}</span>
                                  </span>
                                  <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(precoServico(s))}</span>
                                </p>
                              );
                            })}
                            {(opcionalMeetGreet || opcionalCadeirinha || opcionalBilingue) && (
                              <p className="text-black/55">
                                Opcionais:{" "}
                                {[
                                  opcionalMeetGreet && "Meet & Greet",
                                  opcionalCadeirinha && (qtdCadeirinhas > 1 ? `${qtdCadeirinhas} cadeirinhas infantis` : "cadeirinha infantil"),
                                  opcionalBilingue && "motorista bilíngue",
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Dados do passageiro",
                        voltar: 4 as Etapa,
                        conteudo: (
                          <div className="space-y-0.5">
                            <p>{nome}</p>
                            <p className="text-black/60">{whatsapp}</p>
                            <p className="text-black/60">{email}</p>
                            {numeroVoo && <p className="text-black/60">Voo {numeroVoo}</p>}
                          </div>
                        ),
                      },
                    ].map((linha) => (
                      <div key={linha.rotulo} className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:gap-4">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-0.5">{linha.rotulo}</dt>
                        <dd className="min-w-0 text-sm text-black/85">{linha.conteudo}</dd>
                        <button
                          type="button"
                          onClick={() => irPara(linha.voltar)}
                          className="self-start justify-self-start text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2 sm:justify-self-end"
                        >
                          Editar
                        </button>
                      </div>
                    ))}
                    <div className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-1.5">Total estimado</dt>
                      <dd>
                        <span className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>{formatUSD(totalUSD)}</span>
                        <span className={`${inter.className} ml-2 text-sm tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)}</span>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  {/* Termos na própria página, numa caixa com rolagem (pedido
                      do Wilson, 30/set/2026: "termos e condições devem estar
                      numa caixa na pagina, nao para clicar e abrir"). */}
                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições do transporte privado"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosTransporte pagamentoOnline />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições do transporte privado.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && (
                    <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar o transporte.</p>
                  )}

                  {/* Contrato gerado automaticamente + assinatura eletrônica (Wilson, 06/out/2026). */}
                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Contrato de prestação de serviço</p>
                  <div
                    tabIndex={0}
                    aria-label="Contrato de transporte privado"
                    className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-black/10 bg-white px-4 py-3 text-[12.5px] leading-6 text-black/75 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <p className="font-semibold text-black">CONTRATO DE PRESTAÇÃO DE SERVIÇO DE TRANSPORTE PRIVADO NO JAPÃO</p>
                    {gerarContratoTransporte(dadosContrato).map((cl) => (
                      <div key={cl.titulo}>
                        <p className="mt-3 font-medium text-black/85">{cl.titulo}</p>
                        {cl.paragrafos.map((par, i) => (
                          <p key={i} className="mt-1">
                            {par}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-black/10 p-4">
                    <Campo
                      rotulo="Assinatura eletrônica — digite seu nome completo"
                      erro={tentouEnviar && !assinaturaValida ? `Digite exatamente o nome informado nos seus dados (${nome || "nome completo"}).` : null}
                      ajuda="Deve ser igual ao nome informado nos seus dados."
                    >
                      <input
                        type="text"
                        value={assinaturaNome}
                        onChange={(e) => setAssinaturaNome(e.target.value)}
                        autoComplete="off"
                        className={`${classeInput(tentouEnviar && !assinaturaValida)} font-serif italic`}
                      />
                    </Campo>
                    <label className="mt-3 flex min-h-[44px] cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={contratoAssinado}
                        onChange={(e) => setContratoAssinado(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                      />
                      <span className="text-sm text-black/85">
                        Li o contrato acima e o assino eletronicamente. Entendo que ficam registrados data, hora, IP e um código de
                        integridade do texto, e que recebo uma cópia por e-mail.
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
                    <strong>Pagamento online:</strong> ao assinar, a página segura da Stone abre em uma nova aba (Pix ou cartão de
                    crédito emitido no Brasil, até 12x). O serviço é confirmado após o pagamento e a disponibilidade do fornecedor —
                    sem disponibilidade, devolvemos o valor integral.
                  </div>
                  {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
                </section>
              )}

              {etapa > 1 && (
                <button
                  type="button"
                  onClick={() => irPara((etapa - 1) as Etapa)}
                  className="mt-8 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-black"
                >
                  <span aria-hidden="true">←</span> Voltar para {ETAPAS[etapa - 2].toLowerCase()}
                </button>
              )}
            </div>

            {/* Resumo fixo — desktop. */}
            <aside className="hidden lg:block" aria-label="Resumo do pedido">
              <div className="sticky top-[8.5rem] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(10,37,64,0.35)]">
                {conteudoResumo}
                <div className="mt-6">{botaoCta()}</div>
                {textoStatus && <p className="mt-2.5 text-center text-xs text-black/55">{textoStatus}</p>}
              </div>
            </aside>
          </div>

          {/* Resumo compacto — celular/tablet: total sempre visível + CTA
              quase na largura toda; toque no total abre o detalhe. */}
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(10,37,64,0.08)] lg:hidden">
            {resumoAbertoMobile && <div className="max-h-[50svh] overflow-y-auto border-b border-black/10 pb-4 pt-1">{conteudoResumo}</div>}
            <button
              type="button"
              onClick={() => setResumoAbertoMobile((v) => !v)}
              aria-expanded={resumoAbertoMobile}
              className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-black/50">
                  {quantidadeItens > 0
                    ? `${quantidadeItens} ${quantidadeItens === 1 ? "serviço" : "serviços"}${periodoValido ? ` · ${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)}` : ""}`
                    : veiculoEscolhido
                      ? `${veiculoCurto.nome} · a partir de`
                      : "Total estimado"}
                </span>
                <span
                  key={Math.round(totalExibidoUSD ?? 0)}
                  className={`${inter.className} block rounded text-xl font-bold tabular-nums text-[#0A2540]`}
                  style={animarTotal ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
                >
                  {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#1f6fb8]">
                {resumoAbertoMobile ? "Fechar" : "Ver resumo"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${resumoAbertoMobile ? "" : "rotate-180"}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div className="mt-2">{botaoCta()}</div>
            {textoStatus && <p className="mt-1.5 text-center text-[11px] text-black/55">{textoStatus}</p>}
          </div>
        </>
      )}

      <Modal aberto={modalRegras} titulo="Regras e adicionais" onFechar={() => setModalRegras(false)}>
        <p className="font-medium text-black">Incluído no valor</p>
        <p className="mt-1">
          Impostos, estacionamento, pedágios (ETC) e combustível. Cada rota tem um tempo incluído — normalmente 90 min
          nos trechos de chegada, 30 min nos trechos de partida, ou as 10 horas inteiras nos passeios de dia inteiro.
        </p>
        <p className="mt-4 font-medium text-black">Hora extra</p>
        <p className="mt-1">
          Uso além do tempo incluído é cobrado à parte, em blocos de 30 minutos (sempre arredondado pra cima), com
          tarifa por veículo e rota.
        </p>
        <p className="mt-4 font-medium text-black">Não incluído</p>
        <p className="mt-1">
          Trânsito intermunicipal de longa distância entre regiões (ex.: Tóquio↔Kansai por estrada).
        </p>
        <p className="mt-4 font-medium text-black">Adicionais</p>
        <p className="mt-1">
          Meet &amp; Greet (recepção com placa de identificação) — {formatUSD(ADICIONAL_MEET_GREET_USD)}. Cadeirinha
          infantil — {formatUSD(ADICIONAL_CADEIRINHA_USD)}. Motorista bilíngue português/inglês — sob consulta, com valor
          adicional e disponibilidade limitada; recomendamos solicitar com grande antecedência (idealmente 70 dias antes
          da viagem). Sem essa solicitação, o motorista fala japonês.
        </p>
        <p className="mt-4 font-medium text-black">Cancelamento</p>
        <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
      </Modal>

    </main>
  );
}
