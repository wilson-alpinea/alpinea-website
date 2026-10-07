"use client";

// Hotéis — página de produto no mesmo template do Transporte Privado,
// Transfer Aeroporto e Passagens Aéreas (pedido do Wilson, 30/set/2026:
// "sim, monte a página" depois de enviar o hero de hotéis). Checkout
// manual: o envio registra o pedido no CRM (/api/hoteis-selfservice) e a
// equipe confirma disponibilidade, hotel e pagamento pelo WhatsApp.
//
// 5 etapas: 1 Viagem (período no Japão + hóspedes, estilo SIXT) →
// 2 Categoria (padrão das estadias) → 3 Hospedagem (uma estadia por
// cidade, com check-in/check-out dentro do período, quartos e café da
// manhã) → 4 Dados → 5 Revisão (termos numa caixa na página).
//
// Mesma lógica de datas do Transporte Privado: cada estadia é ligada às
// datas da viagem, e o resumo avisa noites sem hotel, estadias
// sobrepostas e quartos que não comportam todos os hóspedes (avisos só
// informam, não bloqueiam — decisão do Wilson para o transporte).
//
// Preço = a mesma conta do orçamento de hotéis que já existia
// (HotelQuoteCalculator): DIARIA_HOTEL × CIDADE_MULTIPLICADOR_HOTEL ×
// FATOR_QUARTO × CAPACIDADE_QUARTO por quarto/noite, + café da manhã
// opcional (ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA). Valores em reais na
// origem, mostrados em US$ com ≈ R$ como nas outras páginas.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import {
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  CAPACIDADE_QUARTO,
  DIARIA_HOTEL,
  CIDADE_MULTIPLICADOR_HOTEL,
  CIDADES_HOTEL_EXEMPLO,
  EXEMPLOS_HOTEIS_POR_CIDADE,
  INFO_CATEGORIA_HOTEL,
  FATOR_QUARTO,
  ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA,
  DESTINOS,
} from "../../components/CustomPackageCard";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  IconeResumo,
  CLASSE_SELECT,
  diasEntre,
  formatarDataCurta,
  formatarDiaMes,
  listarNatural,
  mascararWhatsapp,
  IconeCheck,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
} from "../../components/transporte/compartilhado";
import { AvisoPagamentoConcluido } from "../AvisoPagamentoConcluido";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba, BlocoPagamentoNovaAba } from "../pagamentoNovaAba";

type Categoria = (typeof CATEGORIAS_HOTEL)[number];
type TipoQuarto = (typeof TIPOS_QUARTO)[number];
type Cidade = (typeof CIDADES_HOTEL_EXEMPLO)[number];

const ETAPAS = ["Viagem", "Categoria", "Hospedagem", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4 | 5;

const MAX_NOITES_VIAGEM = 60;
const MAX_HOSPEDES = 20;
const MAX_QUARTOS = 10;

const nomeCidade = (c: Cidade) => DESTINOS.find((d) => d.key === c)?.nome ?? c;
const PERFIL_CATEGORIA: Record<Categoria, string> = {
  "3 estrelas": "Hotel executivo bem localizado, quarto compacto",
  "4 estrelas": "Rede internacional, mais espaço e restaurante",
  "5 estrelas": "Luxo, com spa, piscina e serviço completo",
  Elite: "Ultra-luxo: Aman, Peninsula, ryokans históricos",
};

// Preferência de camas (Wilson, 06/out/2026: "preferências da cama,
// solteiro, duplo, casal, etc / 1 ou 2 camas / quartos separados"). Cada
// configuração aponta para o tipo de quarto usado no preço.
const CONFIG_CAMAS: { id: string; rotulo: string; tipo: TipoQuarto }[] = [
  { id: "casal", rotulo: "1 cama de casal (até 2 pessoas)", tipo: "Duplo (casal)" },
  { id: "twin", rotulo: "2 camas de solteiro (até 2 pessoas)", tipo: "Duplo (compartilhado)" },
  { id: "solteiro", rotulo: "1 cama de solteiro (1 pessoa)", tipo: "Individual" },
  { id: "casal-solteiro", rotulo: "1 casal + 1 solteiro (até 3 pessoas)", tipo: "Triplo" },
  { id: "tres-solteiro", rotulo: "3 camas de solteiro (até 3 pessoas)", tipo: "Triplo" },
];
const configCamas = (id: string) => CONFIG_CAMAS.find((c) => c.id === id) ?? CONFIG_CAMAS[0];
const PREFERENCIAS_QUARTOS: { id: string; rotulo: string }[] = [
  { id: "indiferente", rotulo: "Sem preferência" },
  { id: "proximos", rotulo: "Quartos próximos (mesmo andar)" },
  { id: "conectados", rotulo: "Quartos conectados (porta interna)" },
  { id: "separados", rotulo: "Quartos separados (andares/alas diferentes)" },
];
const rotuloPreferencia = (id: string) => PREFERENCIAS_QUARTOS.find((p) => p.id === id)?.rotulo ?? "";

// Comodidades por categoria (mesma base de INFO_CATEGORIA_HOTEL) — Wilson,
// 06/out/2026: "quais amenidades estão disponíveis".
const AMENIDADES_ROTULO: { chave: "restaurante" | "academia" | "piscina" | "sauna"; rotulo: string }[] = [
  { chave: "restaurante", rotulo: "Restaurante" },
  { chave: "academia", rotulo: "Academia" },
  { chave: "piscina", rotulo: "Piscina" },
  { chave: "sauna", rotulo: "Spa / sauna" },
];
const AMENIDADES_TODAS = ["Wi-Fi gratuito", "Ar-condicionado", "Amenities de banheiro", "Recepção 24h"];

type Estadia = {
  uid: string;
  cidade: Cidade;
  checkin: string;
  checkout: string;
  categoria: Categoria;
  tipoQuarto: TipoQuarto;
  camas: string;
  preferenciaQuartos: string;
  quartos: number;
  cafe: boolean;
};

// Conta de preço (em R$) — mesma do HotelQuoteCalculator.
function precoQuartoNoiteBRL(categoria: Categoria, cidade: Cidade, tipo: TipoQuarto) {
  return Math.round(DIARIA_HOTEL[categoria] * CIDADE_MULTIPLICADOR_HOTEL[cidade] * FATOR_QUARTO[tipo] * CAPACIDADE_QUARTO[tipo]);
}
function noitesEntre(checkin: string, checkout: string) {
  if (!checkin || !checkout || checkout <= checkin) return 0;
  return diasEntre(checkin, checkout).length - 1;
}

function TextoTermosHoteis() {
  return (
    <>
      <p className="font-medium text-black/80">Orçamento e reserva</p>
      <p className="mt-1">
        Os valores desta página são estimativas por categoria e cidade, para planejamento. O valor final depende do hotel,
        das datas e da disponibilidade no momento da reserva. Nossa equipe envia as opções de hotel pelo WhatsApp e a reserva
        só é feita depois da sua aprovação e da confirmação do pagamento.
      </p>
      <p className="mt-3 font-medium text-black/80">Escolha do hotel</p>
      <p className="mt-1">
        Os hotéis citados são exemplos da categoria em cada cidade. A Ajisai seleciona a propriedade conforme o seu roteiro, o
        perfil do grupo e a disponibilidade, e confirma com você antes de reservar.
      </p>
      <p className="mt-3 font-medium text-black/80">Cancelamento e alterações</p>
      <p className="mt-1">
        Cada hotel tem a própria política de cancelamento, alteração e no-show, informada junto com a opção de hotel antes de
        qualquer cobrança. Tarifas promocionais podem não ser reembolsáveis.
      </p>
      <p className="mt-3 font-medium text-black/80">Hóspedes e check-in</p>
      <p className="mt-1">
        Nomes e número de hóspedes precisam corresponder aos documentos apresentados no check-in. Horários de check-in e
        check-out seguem as regras de cada hotel; entrada antecipada e saída tardia são sob consulta.
      </p>
      <p className="mt-3 font-medium text-black/80">Hóspedes e crianças</p>
      <p className="mt-1">
        Crianças a partir de 3 anos contam como hóspede (ocupam lugar no quarto e entram no cálculo). Bebês de até 2 anos não
        contam como hóspede; berço depende da disponibilidade de cada hotel. Preferências de cama e de localização dos
        quartos são solicitadas ao hotel e não podem ser garantidas.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        Você pode pagar online agora (Pix ou cartão, na página segura da Stone) ou combinar a forma de pagamento com a nossa
        equipe pelo WhatsApp. No pagamento online, o valor estimado é cobrado e qualquer diferença em relação ao hotel
        confirmado (para mais ou para menos) é ajustada antes da reserva — se não houver opção que você aprove, o valor é
        devolvido integralmente. Valores em dólar são convertidos pela cotação do dia.
      </p>
    </>
  );
}

function ContadorHospedes({ rotulo, ajuda, valor, min, total, onChange }: { rotulo: string; ajuda: string; valor: number; min: number; total: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm text-black/85">{rotulo}</span>
        <span className="block text-xs text-black/45">{ajuda}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, valor - 1))}
          disabled={valor <= min}
          aria-label={`Menos ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          −
        </button>
        <span className={`${inter.className} w-7 text-center text-base font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">
          {valor}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_HOSPEDES, valor + 1))}
          disabled={total >= MAX_HOSPEDES}
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          +
        </button>
      </span>
    </div>
  );
}
export default function HoteisPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [adultos, setAdultos] = useState(2);
  // Crianças de 3 a 11 anos contam como hóspede; bebês (0–2) não — Wilson,
  // 06/out/2026: "a partir de 3 anos é hóspede full, menos de 3 anos é bebê
  // e não é considerado hóspede".
  const [criancas, setCriancas] = useState(0);
  const [idadesCriancas, setIdadesCriancas] = useState<(number | "")[]>([]);
  const [bebes, setBebes] = useState(0);
  const [pagarOnline, setPagarOnline] = useState<boolean | null>(null);
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  function ajustarCriancas(n: number) {
    setCriancas(n);
    setIdadesCriancas((atual) => {
      const prox = atual.slice(0, n);
      while (prox.length < n) prox.push("");
      return prox;
    });
  }

  const [categoriaEscolhida, setCategoriaEscolhida] = useState(false);
  const [categoriaPadrao, setCategoriaPadrao] = useState<Categoria>("4 estrelas");

  const [estadias, setEstadias] = useState<Estadia[]>([]);
  const [novaCidade, setNovaCidade] = useState<Cidade | "">("");
  const [novoCheckin, setNovoCheckin] = useState("");
  const [novoCheckout, setNovoCheckout] = useState("");
  const [novaCategoria, setNovaCategoria] = useState<Categoria | "">("");
  const [novasCamas, setNovasCamas] = useState("casal");
  const [novaPreferencia, setNovaPreferencia] = useState("indiferente");
  const novoTipo: TipoQuarto = configCamas(novasCamas).tipo;
  const [novosQuartos, setNovosQuartos] = useState<number | null>(null);
  const [novoCafe, setNovoCafe] = useState(true);
  const [ultimoAdicionado, setUltimoAdicionado] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarViagem, setTentouAvancarViagem] = useState(false);
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);
  const proximoUid = useRef(0);

  const hospedes = adultos + criancas;

  // ── Período ──
  const erroDataChegada = !dataChegada ? "Informe a data de chegada." : dataChegada < hojeISO() ? "A chegada precisa ser hoje ou depois." : null;
  const erroDataPartida = !dataPartida
    ? "Informe a data de partida."
    : dataChegada && dataPartida <= dataChegada
      ? "A partida precisa ser depois da chegada."
      : dataChegada && noitesEntre(dataChegada, dataPartida) > MAX_NOITES_VIAGEM
        ? `Para viagens com mais de ${MAX_NOITES_VIAGEM} noites, fale com a nossa equipe.`
        : null;
  const periodoValido = erroDataChegada === null && erroDataPartida === null;
  // Noites da viagem = cada data de check-in possível (chegada até a véspera da partida).
  const noitesViagem = periodoValido ? diasEntre(dataChegada, dataPartida).slice(0, -1) : [];
  const diasViagem = periodoValido ? diasEntre(dataChegada, dataPartida) : [];
  const totalNoitesViagem = noitesViagem.length;

  // ── Estadias ──
  const estadiasOrdenadas = [...estadias].sort((a, b) => a.checkin.localeCompare(b.checkin));
  const noitesDe = (e: Estadia) => noitesEntre(e.checkin, e.checkout);
  const pessoasCafe = (e: Estadia) => Math.min(hospedes, e.quartos * CAPACIDADE_QUARTO[e.tipoQuarto]);
  const precoEstadiaBRL = (e: Estadia) =>
    precoQuartoNoiteBRL(e.categoria, e.cidade, e.tipoQuarto) * e.quartos * noitesDe(e) +
    (e.cafe ? ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA[e.categoria] * pessoasCafe(e) * noitesDe(e) : 0);
  const totalBRL = estadias.reduce((s, e) => s + precoEstadiaBRL(e), 0);
  const totalUSD = totalBRL / cambioCotacao;
  const quantidadeEstadias = estadias.length;

  const problemaEstadia = (e: Estadia): string | null => {
    if (noitesDe(e) < 1) return "O check-out precisa ser depois do check-in.";
    if (diasViagem.length > 0 && (e.checkin < dataChegada || e.checkout > dataPartida)) return "Datas fora do período da viagem — ajuste o check-in ou o check-out.";
    return null;
  };
  const estadiasComProblema = estadias.filter((e) => problemaEstadia(e) !== null).length;

  // Avisos (só informam).
  const avisos: string[] = [];
  if (estadias.length > 0 && noitesViagem.length > 0) {
    const cobertas = (n: string) => estadias.some((e) => n >= e.checkin && n < e.checkout);
    const semHotel = noitesViagem.filter((n) => !cobertas(n));
    if (semHotel.length > 0) {
      avisos.push(
        `${semHotel.length === 1 ? "1 noite" : `${semHotel.length} noites`} sem hotel: ${listarNatural(semHotel.map(formatarDiaMes))}.`,
      );
    }
    const sobrepostas = noitesViagem.filter((n) => estadias.filter((e) => n >= e.checkin && n < e.checkout).length > 1);
    if (sobrepostas.length > 0) avisos.push(`Duas estadias na mesma noite: ${listarNatural(sobrepostas.map(formatarDiaMes))}.`);
    estadiasOrdenadas.forEach((e) => {
      const capacidade = e.quartos * CAPACIDADE_QUARTO[e.tipoQuarto];
      if (capacidade < hospedes) {
        avisos.push(`${nomeCidade(e.cidade)}: ${e.quartos} ${e.quartos === 1 ? "quarto" : "quartos"} para até ${capacidade} ${capacidade === 1 ? "pessoa" : "pessoas"}, e o grupo tem ${hospedes}.`);
      }
    });
  }

  // ── Validação de dados ──
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

  const idadesOk = idadesCriancas.every((i) => typeof i === "number");
  const etapa1Ok = periodoValido && adultos >= 1 && idadesOk;
  const etapa2Ok = categoriaEscolhida;
  const etapa3Ok = quantidadeEstadias > 0 && estadiasComProblema === 0;
  const etapa4Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok, etapa4Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && etapa4Ok && termosAceitos && pagarOnline !== null;

  const textoPeriodo = periodoValido
    ? `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${totalNoitesViagem} ${totalNoitesViagem === 1 ? "noite" : "noites"}`
    : "";
  const textoHospedes = `${adultos} ${adultos === 1 ? "adulto" : "adultos"}${criancas ? `, ${criancas} ${criancas === 1 ? "criança" : "crianças"}` : ""}${
    bebes ? `, ${bebes} ${bebes === 1 ? "bebê" : "bebês"}` : ""
  }`;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function atualizarEstadia(uid: string, mudanca: Partial<Estadia>) {
    setEstadias((lista) => lista.map((e) => (e.uid === uid ? { ...e, ...mudanca } : e)));
  }
  function removerEstadia(uid: string) {
    setEstadias((lista) => lista.filter((e) => e.uid !== uid));
  }

  // Sugestões da próxima estadia: check-in = primeira noite sem hotel;
  // check-out = partida (ou a próxima estadia já marcada); quartos que
  // comportam o grupo no tipo escolhido.
  const primeiraNoiteLivre = noitesViagem.find((n) => !estadias.some((e) => n >= e.checkin && n < e.checkout)) ?? "";
  const checkinSugerido = primeiraNoiteLivre;
  const proximaDepois = estadiasOrdenadas.find((e) => e.checkin > checkinSugerido)?.checkin;
  const checkoutSugerido = checkinSugerido ? (proximaDepois ?? dataPartida) : "";
  const checkinNovo = novoCheckin && diasViagem.includes(novoCheckin) ? novoCheckin : checkinSugerido;
  const checkoutNovo = novoCheckout && diasViagem.includes(novoCheckout) && novoCheckout > checkinNovo ? novoCheckout : checkoutSugerido;
  const categoriaNova: Categoria = novaCategoria || categoriaPadrao;
  const quartosSugeridos = Math.min(MAX_QUARTOS, Math.max(1, Math.ceil(hospedes / CAPACIDADE_QUARTO[novoTipo])));
  const quartosNovos = novosQuartos ?? quartosSugeridos;
  const noitesNovas = noitesEntre(checkinNovo, checkoutNovo);
  const previaNova: Estadia | null =
    novaCidade && noitesNovas > 0
      ? {
          uid: "previa",
          cidade: novaCidade,
          checkin: checkinNovo,
          checkout: checkoutNovo,
          categoria: categoriaNova,
          tipoQuarto: novoTipo,
          camas: novasCamas,
          preferenciaQuartos: quartosNovos > 1 ? novaPreferencia : "indiferente",
          quartos: quartosNovos,
          cafe: novoCafe,
        }
      : null;

  function adicionarEstadia() {
    if (!previaNova) return;
    proximoUid.current += 1;
    const uid = `estadia-${proximoUid.current}`;
    setEstadias((lista) => [...lista, { ...previaNova, uid }]);
    setUltimoAdicionado(uid);
    setNovaCidade("");
    setNovoCheckin("");
    setNovoCheckout("");
    setNovaCategoria("");
    setNovosQuartos(null);
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? {
          rotulo: "Ver categorias",
          ativo: true,
          falta: etapa1Ok ? null : periodoValido && !idadesOk ? "Informe a idade de cada criança" : "Informe chegada e partida para continuar",
        }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha a categoria", ativo: false, falta: "Escolha uma categoria para continuar" }
        : etapa === 3
          ? etapa3Ok
            ? { rotulo: "Continuar", ativo: true, falta: null }
            : quantidadeEstadias === 0
              ? { rotulo: "Adicione uma estadia", ativo: false, falta: "Adicione ao menos uma estadia para continuar" }
              : { rotulo: "Revise as estadias", ativo: false, falta: "Corrija as estadias marcadas em vermelho" }
          : etapa === 4
            ? { rotulo: "Continuar", ativo: etapa4Ok, falta: etapa4Ok ? null : "Complete seus dados para continuar" }
            : {
                rotulo: status === "enviando" ? "Enviando…" : pagarOnline ? "Solicitar e pagar online" : "Solicitar hotéis",
                ativo: podeEnviar && status !== "enviando",
                falta: pagarOnline === null ? "Escolha como prefere pagar" : termosAceitos ? null : "Aceite os Termos e Condições para solicitar",
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
    if (!termosAceitos || pagarOnline === null) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = etapasOk.filter((ok) => !ok).length;

  const resumoEstadias = estadiasOrdenadas
    .map(
      (e) =>
        `${nomeCidade(e.cidade)} ${formatarDiaMes(e.checkin)}–${formatarDiaMes(e.checkout)} (${noitesDe(e)} noites) — ${e.categoria}, ${e.quartos}× ${configCamas(e.camas).rotulo}${e.quartos > 1 && e.preferenciaQuartos !== "indiferente" ? `, ${rotuloPreferencia(e.preferenciaQuartos).toLowerCase()}` : ""}${e.cafe ? ", com café da manhã" : ""}`,
    )
    .join("; ");

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const janelaPagamento = pagarOnline ? abrirAbaPagamento() : null;
    try {
      const resposta = await fetch("/api/hoteis-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataChegada,
          dataPartida,
          adultos,
          criancas,
          idadesCriancas,
          bebes,
          pagarOnline,
          estadias: estadiasOrdenadas.map((e) => ({
            cidade: nomeCidade(e.cidade),
            checkin: e.checkin,
            checkout: e.checkout,
            noites: noitesDe(e),
            categoria: e.categoria,
            tipoQuarto: e.tipoQuarto,
            camas: configCamas(e.camas).rotulo,
            preferenciaQuartos: e.quartos > 1 ? rotuloPreferencia(e.preferenciaQuartos) : "",
            quartos: e.quartos,
            cafe: e.cafe,
            valorBRL: Math.round(precoEstadiaBRL(e)),
          })),
          resumo: resumoEstadias,
          avisos,
          totalUSD: Math.round(totalUSD),
          totalBRL: Math.round(totalBRL),
          nome,
          email,
          whatsapp,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir hotéis pelo site da Ajisai — ${resumoEstadias}.${nome ? ` Meu nome é ${nome}.` : ""}`;

  // Sem estadia: "a partir de" = diária da categoria padrão na cidade mais
  // barata × quartos necessários × noites da viagem.
  const quartosGrupo = Math.max(1, Math.ceil(hospedes / 2));
  const aPartirDeBRL =
    categoriaEscolhida && totalNoitesViagem > 0
      ? Math.min(...CIDADES_HOTEL_EXEMPLO.map((c) => precoQuartoNoiteBRL(categoriaPadrao, c, "Duplo (casal)"))) * quartosGrupo * totalNoitesViagem
      : null;
  const totalExibidoUSD: number | null = quantidadeEstadias > 0 ? totalUSD : aPartirDeBRL !== null ? aPartirDeBRL / cambioCotacao : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Sua hospedagem</p>
      <p className="mt-2 text-sm text-black/80">
        {textoPeriodo || <span className="text-black/45">Período a definir</span>}
        <span className="text-black/50"> · {textoHospedes}</span>
      </p>
      {estadias.length === 0 &&
        (categoriaEscolhida ? (
          <p className="mt-1 text-sm text-black/80">{categoriaPadrao}</p>
        ) : (
          <p className="mt-1 text-sm text-black/45">Nenhuma categoria escolhida</p>
        ))}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {estadiasOrdenadas.length === 0 ? (
          <p className="text-sm text-black/45">Nenhuma estadia adicionada</p>
        ) : (
          estadiasOrdenadas.map((e) => (
            <div key={e.uid} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                <IconeResumo src="/images/icone-hotel.png" />
                <span className="min-w-0">
                  <span className="block">
                    {nomeCidade(e.cidade)} · {e.categoria}
                  </span>
                  <span className={`block text-xs ${problemaEstadia(e) ? "text-red-600" : "text-black/50"}`}>
                    {formatarDiaMes(e.checkin)} a {formatarDiaMes(e.checkout)} · {noitesDe(e)} {noitesDe(e) === 1 ? "noite" : "noites"} · {e.quartos}{" "}
                    {e.quartos === 1 ? "quarto" : "quartos"}
                    {e.cafe && " · café"}
                  </span>
                </span>
              </span>
              <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(precoEstadiaBRL(e) / cambioCotacao)}</span>
            </div>
          ))
        )}
      </div>
      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-black/50">Total estimado</p>
        <p
          key={Math.round(totalExibidoUSD ?? 0)}
          className={`${inter.className} mt-0.5 rounded-md text-3xl font-bold tabular-nums tracking-[-0.02em] text-[#0A2540]`}
          style={totalExibidoUSD !== null ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
        >
          {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
        </p>
        {quantidadeEstadias === 0 && totalExibidoUSD !== null && (
          <p className="text-xs text-black/50">a partir de, {categoriaPadrao.toLowerCase()} · valor final após montar as estadias</p>
        )}
        {quantidadeEstadias > 0 && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)} · estimativa, o valor final vem com as opções de hotel</p>
        )}
      </div>
    </div>
  );

  const botaoCta = () => (
    <button
      type="button"
      onClick={acionarCta}
      aria-disabled={!cta.ativo}
      className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
        cta.ativo ? "bg-[#1f6fb8] text-white shadow-sm hover:bg-[#2f80c9]" : "cursor-default bg-[#dce6ef] text-[#5b7a95]"
      }`}
    >
      {cta.rotulo}
    </button>
  );

  const textoStatus =
    cta.falta ?? (etapa < 5 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

  const classeDataCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent px-3 pt-4 text-base text-black focus:outline-none sm:h-12 sm:pt-0 md:text-[15px]";
  const rotuloMobile = "pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45 sm:hidden";
  const classeSelectPequeno =
    "h-9 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-sm text-black focus:border-[#2f80c9] focus:outline-none sm:w-auto";



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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Hotéis</p>
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
            Nossa equipe envia as opções de hotel pelo WhatsApp — em geral no mesmo dia útil. A reserva só é feita depois da
            sua aprovação.
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
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
                <Image
                  src="/images/produtos/hoteis-header.jpg"
                  alt="Família fazendo check-in na recepção de um hotel no Japão"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[55%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Hotéis</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Hotéis escolhidos pelo seu roteiro
                </h1>
              </div>
            </section>
          </div>

          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <AvisoPagamentoConcluido />
          </div>
          <div ref={stepperRef} aria-hidden="true" />
          <div className="sticky top-14 z-40 mt-6 bg-[#1f6fb8] shadow-[0_4px_16px_rgba(10,37,64,0.12)]">
            <nav aria-label="Etapas" className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto px-5 py-3 md:gap-3 md:px-8">
              {ETAPAS.map((nomeEtapa, i) => {
                const numero = (i + 1) as Etapa;
                const atual = etapa === numero;
                const concluida = numero < etapa && etapasOk[numero - 1];
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
                          atual ? "bg-white text-[#1f6fb8]" : concluida ? "bg-white/20 text-white" : "border border-white/40 text-white/60"
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
              {/* ── ETAPA 1 — VIAGEM ── */}
              {etapa === 1 && (
                <section aria-labelledby="titulo-etapa-1">
                  <h2 id="titulo-etapa-1" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Quando e quantas pessoas?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Informe o período no Japão. Depois você monta as estadias cidade por cidade.</p>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] sm:p-5">
                    <div className="mb-1.5 hidden grid-cols-2 text-xs font-medium text-black/60 sm:grid">
                      <span>Chegada ao Japão</span>
                      <span className="pl-3">Partida do Japão</span>
                    </div>
                    <div
                      className={`grid grid-cols-2 overflow-hidden rounded-xl border bg-white ${
                        mostrarErro("dataChegada") || mostrarErro("dataPartida") ? "border-red-400" : "border-black/15"
                      } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                    >
                      <label className="relative block min-w-0">
                        <span className={rotuloMobile}>Chegada</span>
                        <input
                          type="date"
                          min={hojeISO()}
                          value={dataChegada}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDataChegada(v);
                            if (v && dataPartida && dataPartida <= v) setDataPartida("");
                          }}
                          onBlur={() => tocar("dataChegada")}
                          className={classeDataCaixa}
                        />
                      </label>
                      <label className="relative block min-w-0 border-l border-black/10">
                        <span className={rotuloMobile}>Partida</span>
                        <input
                          type="date"
                          min={dataChegada || hojeISO()}
                          value={dataPartida}
                          onChange={(e) => setDataPartida(e.target.value)}
                          onBlur={() => tocar("dataPartida")}
                          className={classeDataCaixa}
                        />
                      </label>
                    </div>
                    {mostrarErro("dataChegada") || mostrarErro("dataPartida") ? (
                      <p className="mt-1.5 text-xs text-red-600">{mostrarErro("dataChegada") || mostrarErro("dataPartida")}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-black/45">
                        {totalNoitesViagem > 0 ? `${totalNoitesViagem} ${totalNoitesViagem === 1 ? "noite" : "noites"} no Japão.` : "Cada estadia terá check-in e check-out dentro desse período."}
                      </p>
                    )}

                    <div className="mt-4 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="divide-y divide-black/[0.06] sm:max-w-sm">
                        <ContadorHospedes rotulo="Adultos" ajuda="12 anos ou mais" valor={adultos} min={1} total={hospedes} onChange={setAdultos} />
                        <ContadorHospedes rotulo="Crianças" ajuda="3 a 11 anos · contam como hóspede" valor={criancas} min={0} total={hospedes} onChange={ajustarCriancas} />
                        <ContadorHospedes rotulo="Bebês" ajuda="0 a 2 anos · não contam como hóspede" valor={bebes} min={0} total={0} onChange={(n) => setBebes(Math.min(6, n))} />
                        {criancas > 0 && (
                          <div className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-3">
                            {idadesCriancas.map((idade, i) => (
                              <label key={i} className="block">
                                <span className="mb-1 block text-xs text-black/60">Idade da criança {i + 1}</span>
                                <span className="relative block">
                                  <select
                                    value={idade}
                                    onChange={(e) =>
                                      setIdadesCriancas((atual) => atual.map((v, j) => (j === i ? (e.target.value === "" ? "" : Number(e.target.value)) : v)))
                                    }
                                    className={classeSelectPequeno}
                                  >
                                    <option value="">Idade</option>
                                    {[3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                                      <option key={n} value={n}>
                                        {n} anos
                                      </option>
                                    ))}
                                  </select>
                                  <IconeSeta />
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Ver categorias
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — CATEGORIA ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha a categoria
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Esta será a categoria padrão — na próxima etapa você pode trocar em cada cidade. Diária média por quarto duplo.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {CATEGORIAS_HOTEL.map((c) => {
                      const ativo = categoriaEscolhida && categoriaPadrao === c;
                      const info = INFO_CATEGORIA_HOTEL[c];
                      const diariaMin = Math.min(...CIDADES_HOTEL_EXEMPLO.map((cid) => precoQuartoNoiteBRL(c, cid, "Duplo (casal)")));
                      const comodidades = [
                        info.amenidades.restaurante && "restaurante",
                        info.amenidades.academia && "academia",
                        info.amenidades.piscina && "piscina",
                        info.amenidades.sauna && "spa/sauna",
                      ].filter(Boolean) as string[];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategoriaPadrao(c);
                            setCategoriaEscolhida(true);
                          }}
                          aria-pressed={ativo}
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition sm:p-5 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="block pr-8 text-[15px] font-medium text-black">{c}</span>
                          <span className="mt-0.5 block text-xs text-black/55">{PERFIL_CATEGORIA[c]}</span>
                          <span className="mt-2 block text-xs text-black/55">Quartos de {info.m2Medio}</span>
                          <span className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                            {AMENIDADES_ROTULO.map((a) => {
                              const tem = info.amenidades[a.chave];
                              return (
                                <span key={a.chave} className={`flex items-center gap-1.5 text-xs ${tem ? "text-black/75" : "text-black/35 line-through"}`}>
                                  {tem ? <IconeCheck className="h-3.5 w-3.5 text-[#2f80c9]" /> : <span aria-hidden className="w-3.5 text-center">–</span>}
                                  {a.rotulo}
                                  <span className="sr-only">{tem ? "disponível" : "não disponível"}</span>
                                </span>
                              );
                            })}
                            {AMENIDADES_TODAS.map((a) => (
                              <span key={a} className="flex items-center gap-1.5 text-xs text-black/75">
                                <IconeCheck className="h-3.5 w-3.5 text-[#2f80c9]" />
                                {a}
                              </span>
                            ))}
                          </span>
                          <span className="sr-only">{comodidades.join(", ")}</span>
                          <span className={`${inter.className} mt-3 block text-sm font-semibold tabular-nums text-[#0A2540]`}>
                            a partir de {formatUSD(diariaMin / cambioCotacao)}
                            <span className="text-xs font-normal text-black/45"> / noite</span>
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
                </section>
              )}

              {/* ── ETAPA 3 — HOSPEDAGEM ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Monte suas estadias
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Uma estadia por cidade, com check-in e check-out. Período:{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPeriodo}
                    </button>
                    .
                  </p>

                  <div className="mt-6 rounded-2xl border border-black/10 p-4 sm:p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Cidade</span>
                        <span className="relative block">
                          <select value={novaCidade} onChange={(e) => setNovaCidade(e.target.value as Cidade | "")} className={CLASSE_SELECT}>
                            <option value="">Escolha a cidade</option>
                            {CIDADES_HOTEL_EXEMPLO.map((c) => (
                              <option key={c} value={c}>{nomeCidade(c)}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Check-in</span>
                        <span className="relative block">
                          <select value={checkinNovo} onChange={(e) => setNovoCheckin(e.target.value)} className={CLASSE_SELECT}>
                            {!checkinNovo && <option value="">Todas as noites já têm hotel</option>}
                            {noitesViagem.map((d) => (
                              <option key={d} value={d}>{formatarDataCurta(d)}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Check-out</span>
                        <span className="relative block">
                          <select value={checkoutNovo} onChange={(e) => setNovoCheckout(e.target.value)} className={CLASSE_SELECT}>
                            {!checkoutNovo && <option value="">—</option>}
                            {diasViagem
                              .filter((d) => d > checkinNovo)
                              .map((d) => (
                                <option key={d} value={d}>
                                  {formatarDataCurta(d)} · {noitesEntre(checkinNovo, d)} {noitesEntre(checkinNovo, d) === 1 ? "noite" : "noites"}
                                </option>
                              ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Categoria</span>
                        <span className="relative block">
                          <select value={categoriaNova} onChange={(e) => setNovaCategoria(e.target.value as Categoria)} className={CLASSE_SELECT}>
                            {CATEGORIAS_HOTEL.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Camas por quarto</span>
                        <span className="relative block">
                          <select
                            value={novasCamas}
                            onChange={(e) => {
                              setNovasCamas(e.target.value);
                              setNovosQuartos(null);
                            }}
                            className={CLASSE_SELECT}
                          >
                            {CONFIG_CAMAS.map((c) => (
                              <option key={c.id} value={c.id}>{c.rotulo}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                      <div className="min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Quartos</span>
                        <div className="flex h-12 items-center justify-between rounded-xl border border-black/15 bg-white px-2">
                          <button
                            type="button"
                            onClick={() => setNovosQuartos(Math.max(1, quartosNovos - 1))}
                            disabled={quartosNovos <= 1}
                            aria-label="Menos um quarto"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className={`${inter.className} text-base font-semibold tabular-nums text-[#0A2540]`}>{quartosNovos}</span>
                          <button
                            type="button"
                            onClick={() => setNovosQuartos(Math.min(MAX_QUARTOS, quartosNovos + 1))}
                            disabled={quartosNovos >= MAX_QUARTOS}
                            aria-label="Mais um quarto"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {quartosNovos > 1 && (
                      <label className="mt-3 block max-w-md">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Localização dos {quartosNovos} quartos</span>
                        <span className="relative block">
                          <select value={novaPreferencia} onChange={(e) => setNovaPreferencia(e.target.value)} className={CLASSE_SELECT}>
                            {PREFERENCIAS_QUARTOS.map((p) => (
                              <option key={p.id} value={p.id}>{p.rotulo}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                        <span className="mt-1 block text-xs text-black/45">Pedido ao hotel, sujeito à disponibilidade.</span>
                      </label>
                    )}

                    <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={novoCafe}
                        onChange={(e) => setNovoCafe(e.target.checked)}
                        className="h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                      />
                      <span className="text-sm text-black/85">
                        Com café da manhã
                        <span className="ml-1.5 text-xs text-black/50">
                          {formatUSD(ADICIONAL_CAFE_MANHA_POR_PESSOA_DIA[categoriaNova] / cambioCotacao)} por pessoa/dia
                        </span>
                      </span>
                    </label>

                    {novaCidade && (
                      <p className="mt-2 text-xs leading-5 text-black/50">
                        Exemplos {categoriaNova === "Elite" ? "de propriedade Elite" : `de ${categoriaNova}`} em {nomeCidade(novaCidade)}:{" "}
                        {EXEMPLOS_HOTEIS_POR_CIDADE[novaCidade][categoriaNova].slice(0, 3).join(" · ")}
                      </p>
                    )}

                    <div className="mt-4 flex min-h-[64px] items-center justify-between gap-4 border-t border-black/[0.08] pt-4">
                      {previaNova ? (
                        <>
                          <div className="min-w-0">
                            <p className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>
                              {formatUSD(precoEstadiaBRL(previaNova) / cambioCotacao)}
                            </p>
                            <p className="text-xs text-black/55">
                              {noitesNovas} {noitesNovas === 1 ? "noite" : "noites"} · {quartosNovos} {quartosNovos === 1 ? "quarto" : "quartos"} ·{" "}
                              {formatUSD(precoQuartoNoiteBRL(categoriaNova, novaCidade as Cidade, novoTipo) / cambioCotacao)} por quarto/noite
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={adicionarEstadia}
                            className="h-11 shrink-0 rounded-full bg-[#1f6fb8] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f80c9]"
                          >
                            Adicionar
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-black/45">{novaCidade ? "Escolha check-in e check-out para ver o valor." : "Escolha a cidade para ver o valor."}</p>
                      )}
                    </div>
                  </div>

                  {estadiasOrdenadas.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">No seu pedido</p>
                      <ul className="mt-2 divide-y divide-black/[0.06] rounded-xl border border-black/10">
                        {estadiasOrdenadas.map((e) => {
                          const problema = problemaEstadia(e);
                          return (
                            <li key={e.uid} className={`px-4 py-3 ${problema ? "bg-red-50/60" : ultimoAdicionado === e.uid ? "bg-[#2f80c9]/[0.05]" : ""}`}>
                              <div className="flex items-start gap-3">
                                <IconeResumo src="/images/icone-hotel.png" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="min-w-0 pt-2 text-sm text-black/85">
                                      {nomeCidade(e.cidade)}{" "}
                                      <span className="text-black/50">
                                        · {noitesDe(e)} {noitesDe(e) === 1 ? "noite" : "noites"}
                                      </span>
                                    </p>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className={`${inter.className} text-sm font-semibold tabular-nums text-[#0A2540]`}>
                                      {formatUSD(precoEstadiaBRL(e) / cambioCotacao)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removerEstadia(e.uid)}
                                      aria-label={`Remover estadia em ${nomeCidade(e.cidade)}`}
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                                    <span className="relative block">
                                      <select
                                        aria-label={`Check-in em ${nomeCidade(e.cidade)}`}
                                        value={e.checkin}
                                        onChange={(ev) => atualizarEstadia(e.uid, { checkin: ev.target.value })}
                                        className={classeSelectPequeno}
                                      >
                                        {!noitesViagem.includes(e.checkin) && <option value={e.checkin}>{formatarDataCurta(e.checkin)}</option>}
                                        {noitesViagem.map((d) => (
                                          <option key={d} value={d}>{formatarDataCurta(d)}</option>
                                        ))}
                                      </select>
                                      <IconeSeta />
                                    </span>
                                    <span className="hidden text-xs text-black/40 sm:inline">→</span>
                                    <span className="relative block">
                                      <select
                                        aria-label={`Check-out em ${nomeCidade(e.cidade)}`}
                                        value={e.checkout}
                                        onChange={(ev) => atualizarEstadia(e.uid, { checkout: ev.target.value })}
                                        className={classeSelectPequeno}
                                      >
                                        {!diasViagem.includes(e.checkout) && <option value={e.checkout}>{formatarDataCurta(e.checkout)}</option>}
                                        {diasViagem.slice(1).map((d) => (
                                          <option key={d} value={d}>{formatarDataCurta(d)}</option>
                                        ))}
                                      </select>
                                      <IconeSeta />
                                    </span>
                                    <span className="relative col-span-2 block">
                                      <select
                                        aria-label={`Categoria em ${nomeCidade(e.cidade)}`}
                                        value={e.categoria}
                                        onChange={(ev) => atualizarEstadia(e.uid, { categoria: ev.target.value as Categoria })}
                                        className={classeSelectPequeno}
                                      >
                                        {CATEGORIAS_HOTEL.map((c) => (
                                          <option key={c} value={c}>{c}</option>
                                        ))}
                                      </select>
                                      <IconeSeta />
                                    </span>
                                  </div>
                                  <p className="mt-1.5 text-xs text-black/50">
                                    {e.quartos}× {configCamas(e.camas).rotulo.replace(/ \(.*\)$/, "")}
                                    {e.cafe ? " · com café da manhã" : " · sem café da manhã"}
                                  </p>
                                  {problema && <p className="mt-1 text-xs text-red-600">{problema}</p>}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-3" />}
                    </div>
                  )}
                </section>
              )}

              {/* ── ETAPA 4 — DADOS ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para enviar as opções de hotel e confirmar a reserva.</p>
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
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Hotel que você já tem em mente, berço para bebê, ocasião especial."
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
                        rotulo: "Período e hóspedes",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <>
                            {textoPeriodo}
                            <span className="text-black/50"> · {textoHospedes}</span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Estadias",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-1.5">
                            {estadiasOrdenadas.map((e) => (
                              <p key={e.uid} className="flex justify-between gap-3">
                                <span className="min-w-0">
                                  <span className="text-black/55">
                                    {formatarDiaMes(e.checkin)} a {formatarDiaMes(e.checkout)} ·{" "}
                                  </span>
                                  {nomeCidade(e.cidade)} · {e.categoria}
                                  <span className="text-black/55">
                                    {" "}
                                    · {e.quartos}× {configCamas(e.camas).rotulo.replace(/ \(.*\)$/, "")}
                                    {e.cafe && " · café"}
                                  </span>
                                </span>
                                <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(precoEstadiaBRL(e) / cambioCotacao)}</span>
                              </p>
                            ))}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Seus dados",
                        voltar: 4 as Etapa,
                        conteudo: (
                          <div className="space-y-0.5">
                            <p>{nome}</p>
                            <p className="text-black/60">{whatsapp}</p>
                            <p className="text-black/60">{email}</p>
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
                        <p className="mt-0.5 text-xs text-black/50">Estimativa. O valor final vem com as opções de hotel.</p>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  {/* Pagamento online opcional (Wilson, 06/out/2026). */}
                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Como prefere pagar?</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        valor: true,
                        titulo: "Pagar online agora",
                        texto: "Pix ou cartão (até 12x) na página segura da Stone. Diferenças para o hotel confirmado são ajustadas antes da reserva.",
                      },
                      {
                        valor: false,
                        titulo: "Combinar pelo WhatsApp",
                        texto: "Recebo as opções de hotel e combino a forma de pagamento com a equipe.",
                      },
                    ].map((op) => (
                      <button
                        key={String(op.valor)}
                        type="button"
                        onClick={() => setPagarOnline(op.valor)}
                        aria-pressed={pagarOnline === op.valor}
                        className={`rounded-xl border p-4 text-left transition ${
                          pagarOnline === op.valor ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 hover:border-black/25"
                        }`}
                      >
                        <span className="block text-sm font-medium text-black">{op.titulo}</span>
                        <span className="mt-1 block text-xs leading-5 text-black/60">{op.texto}</span>
                      </button>
                    ))}
                  </div>
                  {tentouEnviar && pagarOnline === null && <p className="mt-1.5 text-xs text-red-600">Escolha como prefere pagar.</p>}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições da hospedagem"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosHoteis />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições da hospedagem.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar os hotéis.</p>}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    {pagarOnline
                      ? "Ao solicitar, a página de pagamento da Stone abre em uma nova aba. Nossa equipe envia as opções de hotel pelo WhatsApp."
                      : "Nenhum valor é cobrado agora. Nossa equipe envia as opções de hotel e combina a forma de pagamento com você pelo WhatsApp."}
                  </p>
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

            <aside className="hidden lg:block" aria-label="Resumo do pedido">
              <div className="sticky top-[8.5rem] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(10,37,64,0.35)]">
                {conteudoResumo}
                <div className="mt-6">{botaoCta()}</div>
                {textoStatus && <p className="mt-2.5 text-center text-xs text-black/55">{textoStatus}</p>}
              </div>
            </aside>
          </div>

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
                  {quantidadeEstadias > 0 ? `${quantidadeEstadias} ${quantidadeEstadias === 1 ? "estadia" : "estadias"}` : "Total estimado"}
                  {periodoValido && ` · ${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)}`}
                </span>
                <span
                  key={Math.round(totalExibidoUSD ?? 0)}
                  className={`${inter.className} block rounded text-xl font-bold tabular-nums text-[#0A2540]`}
                  style={totalExibidoUSD !== null ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
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
    </main>
  );
}
