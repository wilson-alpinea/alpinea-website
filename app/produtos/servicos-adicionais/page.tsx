"use client";

// Serviços Adicionais — página de produto no mesmo template do Transporte
// Privado, Hotéis, Guia etc. (Wilson, 30/set/2026). Checkout manual (o
// pedido vai para o CRM via /api/servicos-adicionais-selfservice e a equipe
// confirma pelo WhatsApp), EXCETO o Limousine Bus, que tem pagamento online
// (self-checkout Stone) desde 06/out/2026.
//
// Reestruturação de 06/out/2026 (Wilson):
// - "mover etapa 2 para página 1, ele escolhe antes o serviço adicional e
//   depois segue" → 1 Serviços → 2 Viagem → 3 Dados → 4 Revisão.
// - eSIM com 3 planos, cada um com descritivo, termos de uso e explicação.
// - Reserva de restaurantes "um nível acima": primeiro serviço da lista,
//   com rol de restaurantes, estimativa de cada um, valores das refeições
//   não inclusos, termos de uso e aceite próprio.
// - Limousine Bus com margem de 50%, endereços de saída/chegada e faixa de
//   horários conforme o site oficial, e pagamento online.
// - Removidos: transporte de malas, experiência sob medida, restaurantes
//   high-end, Ajisai Shopping e concierge dedicado.
// Catálogo e preços: app/lib/servicosAdicionaisCatalogo.ts.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { PRECO_RESERVA_RESTAURANTE_USD } from "../../components/CustomPackageCard";
import {
  PLANOS_ESIM,
  precoEsimUSD,
  COMO_FUNCIONA_ESIM,
  TERMOS_ESIM,
  RESTAURANTES_ROL,
  estimativaRestauranteUSD,
  TERMOS_RESTAURANTES,
  SENTIDOS_LIMOUSINE,
  PONTOS_LIMOUSINE_TOQUIO,
  EMBARQUE_AEROPORTO_LIMOUSINE,
  HORARIOS_LIMOUSINE,
  DURACAO_LIMOUSINE,
  TARIFA_LIMOUSINE_JPY,
  precoLimousineUSD,
  type AeroportoLimousine,
  type SentidoLimousine,
} from "../../lib/servicosAdicionaisCatalogo";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  IconeResumo,
  diasEntre,
  formatarDiaMes,
  mascararWhatsapp,
  IconeCheck,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
  CLASSE_SELECT,
} from "../../components/transporte/compartilhado";
import { AvisoPagamentoConcluido } from "../AvisoPagamentoConcluido";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba, BlocoPagamentoNovaAba } from "../pagamentoNovaAba";

const ETAPAS = ["Serviços", "Viagem", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

const MAX_DIAS = 60;
const MAX_PESSOAS = 20;

// Produtos com página própria — só atalhos aqui.
const OUTROS_PRODUTOS = [
  { nome: "Transfer Aeroporto", href: "/produtos/transfer-aeroporto" },
  { nome: "Câmbio", href: "/produtos/cambio" },
  { nome: "JR Pass", href: "/produtos/jrpass" },
  { nome: "Seguro Viagem", href: "/produtos/seguro-viagem" },
];

const CIDADES_ROL = ["Tóquio", "Kyoto", "Osaka", "Kobe"] as const;

function Contador({ rotulo, ajuda, valor, min, max, onChange }: { rotulo: string; ajuda?: string; valor: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm text-black/85">{rotulo}</span>
        {ajuda && <span className="block text-xs text-black/45">{ajuda}</span>}
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
          onClick={() => onChange(Math.min(max, valor + 1))}
          disabled={valor >= max}
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          +
        </button>
      </span>
    </div>
  );
}

function ListaTermos({ itens }: { itens: string[] }) {
  return (
    <ul className="mt-1 list-disc space-y-1 pl-5">
      {itens.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function TextoTermosServicos() {
  return (
    <>
      <p className="font-medium text-black/80">Pedido e confirmação</p>
      <p className="mt-1">
        Os valores desta página são de referência. Nossa equipe confirma disponibilidade, datas e detalhes de cada serviço pelo
        WhatsApp. Reservas de restaurante e eSIM só são contratados depois da sua aprovação e da confirmação do pagamento.
      </p>
      <p className="mt-3 font-medium text-black/80">Reserva de restaurantes</p>
      <ListaTermos itens={TERMOS_RESTAURANTES} />
      <p className="mt-3 font-medium text-black/80">eSIM</p>
      <ListaTermos itens={TERMOS_ESIM} />
      <p className="mt-3 font-medium text-black/80">Limousine Bus</p>
      <p className="mt-1">
        O Limousine Bus é um ônibus regular (compartilhado) operado pela Airport Limousine Bus. O valor é pago online nesta
        página, na página segura da Stone (Pix ou cartão emitido no Brasil). Enviamos o voucher/reserva por e-mail e WhatsApp.
        {" "}{HORARIOS_LIMOUSINE} Cada passageiro tem direito a até 2 malas despachadas. Atrasos de voo e trânsito podem exigir
        troca de horário no balcão do aeroporto. Cancelamento gratuito até 48h antes do horário reservado; depois disso, o
        valor não é reembolsável.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        O Limousine Bus é pago online ao finalizar. Os demais serviços (reserva de restaurantes e eSIM) têm a forma de
        pagamento combinada com a nossa equipe pelo WhatsApp; valores em dólar são convertidos pela cotação do dia.
      </p>
    </>
  );
}

export default function ServicosAdicionaisPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [pessoas, setPessoas] = useState(2);

  // ── Reserva de restaurantes ──
  const [comRestaurantes, setComRestaurantes] = useState(false);
  const [restaurantesEscolhidos, setRestaurantesEscolhidos] = useState<string[]>([]);
  const [outroRestaurante, setOutroRestaurante] = useState(false);
  const [restricoesAlimentares, setRestricoesAlimentares] = useState("");
  const [cienteRefeicoes, setCienteRefeicoes] = useState(false);
  // ── eSIM ──
  const [comEsim, setComEsim] = useState(false);
  const [planoEsim, setPlanoEsim] = useState(PLANOS_ESIM[1].id);
  const [qtdEsim, setQtdEsim] = useState(2);
  const [esimAberto, setEsimAberto] = useState<string | null>(null);
  // ── Limousine Bus ──
  const [comLimousine, setComLimousine] = useState(false);
  const [aeroportoLimo, setAeroportoLimo] = useState<AeroportoLimousine>("narita");
  const [sentidoLimo, setSentidoLimo] = useState<SentidoLimousine>("ida-volta");
  const [adultosLimo, setAdultosLimo] = useState(2);
  const [criancasLimo, setCriancasLimo] = useState(0);
  const [pontoLimo, setPontoLimo] = useState<string>(PONTOS_LIMOUSINE_TOQUIO[0]);
  const [hotelLimo, setHotelLimo] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarViagem, setTentouAvancarViagem] = useState(false);
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);
  const [tentouAvancarServicos, setTentouAvancarServicos] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);

  const erroDataChegada = !dataChegada ? "Informe a data de chegada." : dataChegada < hojeISO() ? "A chegada precisa ser hoje ou depois." : null;
  const erroDataPartida = !dataPartida
    ? "Informe a data de partida."
    : dataChegada && dataPartida < dataChegada
      ? "A partida precisa ser no dia da chegada ou depois."
      : dataChegada && diasEntre(dataChegada, dataPartida).length > MAX_DIAS
        ? `Para viagens com mais de ${MAX_DIAS} dias, fale com a nossa equipe.`
        : null;
  const periodoValido = erroDataChegada === null && erroDataPartida === null;
  const dias = periodoValido ? diasEntre(dataChegada, dataPartida).length : 0;

  // ── Preços ──
  const qtdReservas = restaurantesEscolhidos.length + (outroRestaurante ? 1 : 0);
  const restaurantesUSD = comRestaurantes ? PRECO_RESERVA_RESTAURANTE_USD * qtdReservas : 0;
  const refeicoesEstimadasUSD = comRestaurantes
    ? RESTAURANTES_ROL.filter((r) => restaurantesEscolhidos.includes(r.id)).reduce((s, r) => s + estimativaRestauranteUSD(r) * pessoas, 0)
    : 0;
  const plano = PLANOS_ESIM.find((p) => p.id === planoEsim) ?? PLANOS_ESIM[0];
  const esimUSD = comEsim ? precoEsimUSD(plano) * qtdEsim : 0;
  const limousineUSD = comLimousine ? precoLimousineUSD({ aeroporto: aeroportoLimo, sentido: sentidoLimo, adultos: adultosLimo, criancas: criancasLimo }) : 0;
  const totalUSD = restaurantesUSD + esimUSD + limousineUSD;
  const totalBRL = totalUSD * cambioCotacao;
  const limousineBRL = limousineUSD * cambioCotacao;

  type ItemResumo = { key: string; nome: string; detalhe: string; valorUSD: number; icone: string };
  const escolhidos: ItemResumo[] = [
    ...(comRestaurantes
      ? [
          {
            key: "restaurantes",
            nome: "Reserva de restaurantes",
            detalhe: `${qtdReservas} ${qtdReservas === 1 ? "reserva" : "reservas"} · refeições não inclusas`,
            valorUSD: restaurantesUSD,
            icone: "/images/icone-servico-reserva-restaurante.png",
          },
        ]
      : []),
    ...(comEsim
      ? [{ key: "esim", nome: `eSIM — ${plano.dias} dias`, detalhe: `${qtdEsim} ${qtdEsim === 1 ? "eSIM" : "eSIMs"} · dados ilimitados`, valorUSD: esimUSD, icone: "/images/icone-esim.svg" }]
      : []),
    ...(comLimousine
      ? [
          {
            key: "limousine",
            nome: `Limousine Bus — ${aeroportoLimo === "narita" ? "Narita" : "Haneda"}`,
            detalhe: `${SENTIDOS_LIMOUSINE.find((x) => x.id === sentidoLimo)?.nome} · ${adultosLimo + criancasLimo} ${adultosLimo + criancasLimo === 1 ? "pessoa" : "pessoas"} · pago online`,
            valorUSD: limousineUSD,
            icone: "/images/icone-servico-transfer-onibus.png",
          },
        ]
      : []),
  ];

  const avisos: string[] = [];
  if (comEsim && dias > 0 && dias > plano.dias) avisos.push(`eSIM de ${plano.dias} dias, mas a viagem tem ${dias} — considere um plano maior.`);
  if (comEsim && qtdEsim > pessoas) avisos.push(`${qtdEsim} eSIMs para um grupo de ${pessoas} pessoas.`);
  if (comLimousine && adultosLimo + criancasLimo > pessoas) avisos.push(`Limousine Bus para ${adultosLimo + criancasLimo} pessoas, mas o grupo tem ${pessoas}.`);
  if (comRestaurantes && refeicoesEstimadasUSD > 0)
    avisos.push(`Refeições estimadas em ${formatUSD(refeicoesEstimadasUSD)} para ${pessoas} pessoas — pagas direto aos restaurantes, fora do total.`);

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

  const problemasServicos: string[] = [];
  if (comRestaurantes && qtdReservas === 0) problemasServicos.push("Escolha ao menos um restaurante.");
  if (comRestaurantes && !cienteRefeicoes) problemasServicos.push("Confirme que o valor das refeições não está incluso.");
  if (comLimousine && adultosLimo + criancasLimo === 0) problemasServicos.push("Informe os passageiros do Limousine Bus.");
  if (comLimousine && pontoLimo.startsWith("Outro") && hotelLimo.trim().length < 3) problemasServicos.push("Informe o hotel/ponto do Limousine Bus.");

  const etapa1Ok = escolhidos.length > 0 && problemasServicos.length === 0;
  const etapa2Ok = periodoValido && pessoas >= 1;
  const etapa3Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos;

  const textoPeriodo = periodoValido ? `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${dias} ${dias === 1 ? "dia" : "dias"}` : "";
  const textoPessoas = `${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function alternarRestaurante(id: string) {
    setRestaurantesEscolhidos((atual) => (atual.includes(id) ? atual.filter((r) => r !== id) : [...atual, id]));
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? etapa1Ok
        ? { rotulo: "Continuar", ativo: true, falta: null }
        : { rotulo: "Continuar", ativo: true, falta: escolhidos.length === 0 ? "Escolha ao menos um serviço para continuar" : problemasServicos[0] }
      : etapa === 2
        ? { rotulo: "Continuar", ativo: true, falta: etapa2Ok ? null : "Informe chegada e partida para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : comLimousine ? "Solicitar e pagar Limousine" : "Solicitar serviços",
              ativo: podeEnviar && status !== "enviando",
              falta: termosAceitos ? null : "Aceite os Termos e Condições para solicitar",
            };

  function acionarCta() {
    if (etapa === 1) {
      if (etapa1Ok) irPara(2);
      else setTentouAvancarServicos(true);
      return;
    }
    if (etapa === 2) {
      if (etapa2Ok) irPara(3);
      else setTentouAvancarViagem(true);
      return;
    }
    if (etapa === 3) {
      if (etapa3Ok) irPara(4);
      else setTentouAvancarDados(true);
      return;
    }
    if (!termosAceitos) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = etapasOk.filter((ok) => !ok).length;
  const nomesRestaurantes = [
    ...RESTAURANTES_ROL.filter((r) => restaurantesEscolhidos.includes(r.id)).map((r) => `${r.nome} (${r.cidade})`),
    ...(outroRestaurante ? ["Outro restaurante (ver observações)"] : []),
  ];
  const resumoServicos = escolhidos.map((s) => `${s.nome} (${s.detalhe}) — US$ ${Math.round(s.valorUSD)}`).join("; ");

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const janelaPagamento = comLimousine ? abrirAbaPagamento() : null;
    try {
      const resposta = await fetch("/api/servicos-adicionais-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataChegada,
          dataPartida,
          pessoas,
          servicos: escolhidos.map((s) => ({
            nome: s.nome,
            crm: s.key === "restaurantes" ? "reserva_restaurantes" : s.key === "esim" ? "esim" : null,
            detalhe: s.detalhe,
            valorUSD: Math.round(s.valorUSD),
            unidade: "",
          })),
          restaurantes: comRestaurantes
            ? { nomes: nomesRestaurantes, restricoes: restricoesAlimentares, refeicoesEstimadasUSD, cienteRefeicoes }
            : null,
          esim: comEsim ? { plano: plano.nome, quantidade: qtdEsim } : null,
          limousine: comLimousine
            ? {
                aeroporto: aeroportoLimo,
                sentido: sentidoLimo,
                adultos: adultosLimo,
                criancas: criancasLimo,
                ponto: pontoLimo,
                hotel: hotelLimo,
                cotacao: cambioCotacao,
              }
            : null,
          resumo: resumoServicos,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir serviços adicionais pelo site da Ajisai — ${resumoServicos}.${nome ? ` Meu nome é ${nome}.` : ""}`;
  const totalExibidoUSD: number | null = escolhidos.length > 0 ? totalUSD : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seus serviços</p>
      <p className="mt-2 text-sm text-black/80">
        {textoPeriodo || <span className="text-black/45">Período a definir</span>}
        <span className="text-black/50"> · {textoPessoas}</span>
      </p>
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {escolhidos.length === 0 ? (
          <p className="text-sm text-black/45">Nenhum serviço escolhido</p>
        ) : (
          escolhidos.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                <IconeResumo src={s.icone} />
                <span className="min-w-0">
                  <span className="block">{s.nome}</span>
                  <span className="block text-xs text-black/50">{s.detalhe}</span>
                </span>
              </span>
              <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(s.valorUSD)}</span>
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
        {totalExibidoUSD !== null && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>
            ≈ {formatBRL(totalBRL)} na cotação do dia{comLimousine ? ` · Limousine pago online: ${formatBRL(limousineBRL)}` : ""}
          </p>
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
    cta.falta ?? (etapa < 4 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

  const classeDataCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent px-3 pt-4 text-base text-black focus:outline-none sm:h-12 sm:pt-0 md:text-[15px]";
  const rotuloMobile = "pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45 sm:hidden";

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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Serviços Adicionais</p>
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
            Nossa equipe confirma cada serviço com você pelo WhatsApp — em geral no mesmo dia útil.
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
                  src="/images/produtos/servicos-adicionais-header.jpg"
                  alt="Serviços da Ajisai no Japão: eSIM, transporte de malas, experiência de cerimônia do chá e motorista"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[40%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Serviços Adicionais</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Os detalhes que completam a viagem
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
              {/* ── ETAPA 1 — SERVIÇOS (vem antes da viagem desde 06/out/2026) ── */}
              {etapa === 1 && (
                <section aria-labelledby="titulo-etapa-1">
                  <h2 id="titulo-etapa-1" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha os serviços
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Marque o que quiser contratar. Depois você informa as datas da viagem.</p>

                  <ul className="mt-6 space-y-4">
                    {/* Reserva de restaurantes — em destaque */}
                    <li className={`rounded-2xl border transition ${comRestaurantes ? "border-[#2f80c9] bg-[#2f80c9]/[0.03] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"}`}>
                      <label className="flex cursor-pointer items-start gap-3 p-4 sm:p-5">
                        <input
                          type="checkbox"
                          checked={comRestaurantes}
                          onChange={(e) => setComRestaurantes(e.target.checked)}
                          className="mt-3 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                        />
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                          <Image src="/images/icone-servico-reserva-restaurante.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-medium text-black">Reserva de restaurantes</span>
                            <span className="rounded-full bg-[#0A2540] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Curadoria Ajisai</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-black/60">
                            Conseguimos mesa nos restaurantes mais concorridos do Japão — muitos não aceitam reserva direta de estrangeiros.
                            Escolha da nossa lista e veja a estimativa de cada um.
                          </span>
                          <span className="mt-1 block text-xs text-black/50">
                            {formatUSD(PRECO_RESERVA_RESTAURANTE_USD)} por reserva ·{" "}
                            <strong className="font-semibold text-red-700">valor das refeições não incluso</strong>
                          </span>
                        </span>
                      </label>
                      {comRestaurantes && (
                        <div className="border-t border-black/[0.06] px-4 pb-4 pt-3 sm:px-5">
                          {CIDADES_ROL.map((cidade) => (
                            <div key={cidade} className="mt-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55">{cidade}</p>
                              <ul className="mt-1 divide-y divide-black/[0.05]">
                                {RESTAURANTES_ROL.filter((r) => r.cidade === cidade).map((r) => (
                                  <li key={r.id}>
                                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 py-1.5">
                                      <input
                                        type="checkbox"
                                        checked={restaurantesEscolhidos.includes(r.id)}
                                        onChange={() => alternarRestaurante(r.id)}
                                        className="h-4 w-4 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                                      />
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-sm text-black/85">{r.nome}</span>
                                        <span className="block text-xs text-black/50">{r.cozinha}</span>
                                      </span>
                                      <span className={`${inter.className} shrink-0 text-right text-xs tabular-nums text-black/60`}>
                                        ~¥{r.estimativaJPY.toLocaleString("pt-BR")}
                                        <span className="block text-[10px] text-black/45">≈ {formatUSD(estimativaRestauranteUSD(r))} / pessoa</span>
                                      </span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={outroRestaurante}
                              onChange={(e) => setOutroRestaurante(e.target.checked)}
                              className="h-4 w-4 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                            />
                            <span className="text-sm text-black/85">Outro restaurante (indique nas observações)</span>
                          </label>
                          <p className="mt-2 text-[11px] leading-5 text-black/50">
                            Estimativa por pessoa: menu degustação de jantar, sem bebidas e taxas — referência que pode mudar. As datas e
                            horários de cada reserva são combinados pelo WhatsApp.
                          </p>
                          <label className="mt-3 block">
                            <span className="mb-1.5 block text-xs font-medium text-black/60">Restrições alimentares ou alergias (opcional)</span>
                            <input
                              type="text"
                              value={restricoesAlimentares}
                              onChange={(e) => setRestricoesAlimentares(e.target.value)}
                              placeholder="Ex.: sem frutos do mar, vegetariano, alergia a amendoim"
                              className={classeInput(false)}
                            />
                          </label>
                          <details className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-xs leading-5 text-black/70">
                            <summary className="cursor-pointer font-medium text-black/80">Termos de uso da reserva de restaurantes</summary>
                            <ListaTermos itens={TERMOS_RESTAURANTES} />
                          </details>
                          <label className="mt-3 flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={cienteRefeicoes}
                              onChange={(e) => setCienteRefeicoes(e.target.checked)}
                              className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                            />
                            <span className="text-sm text-black/85">
                              Li e aceito os termos de uso e estou ciente de que o valor das refeições não está incluso e é pago direto ao
                              restaurante.
                            </span>
                          </label>
                        </div>
                      )}
                    </li>

                    {/* eSIM — 3 planos */}
                    <li className={`rounded-2xl border transition ${comEsim ? "border-[#2f80c9] bg-[#2f80c9]/[0.03] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"}`}>
                      <label className="flex cursor-pointer items-start gap-3 p-4 sm:p-5">
                        <input
                          type="checkbox"
                          checked={comEsim}
                          onChange={(e) => setComEsim(e.target.checked)}
                          className="mt-3 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                        />
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                          <Image src="/images/icone-esim.svg" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-medium text-black">eSIM — internet no Japão</span>
                          <span className="mt-0.5 block text-xs leading-5 text-black/60">
                            Dados ilimitados direto no celular, sem retirar nem devolver aparelho. Escolha o plano pela duração da viagem.
                          </span>
                          <span className="mt-1 block text-xs text-black/50">a partir de {formatUSD(precoEsimUSD(PLANOS_ESIM[0]))} por eSIM</span>
                        </span>
                      </label>
                      {comEsim && (
                        <div className="border-t border-black/[0.06] px-4 pb-4 pt-3 sm:px-5">
                          <div className="grid gap-3 sm:grid-cols-3">
                            {PLANOS_ESIM.map((p) => {
                              const ativo = planoEsim === p.id;
                              return (
                                <div key={p.id} className={`rounded-xl border p-3 ${ativo ? "border-[#2f80c9] bg-white ring-1 ring-[#2f80c9]" : "border-black/10 bg-white"}`}>
                                  <button type="button" onClick={() => setPlanoEsim(p.id)} aria-pressed={ativo} className="block w-full text-left">
                                    <span className="block text-sm font-semibold text-[#0A2540]">{p.dias} dias · ilimitado</span>
                                    <span className={`${inter.className} mt-1 block text-lg font-bold tabular-nums text-black`}>{formatUSD(precoEsimUSD(p))}</span>
                                    <span className="mt-1 block text-xs leading-5 text-black/60">{p.resumo}</span>
                                    <span className="mt-1 block text-xs text-black/45">{p.indicado}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEsimAberto(esimAberto === p.id ? null : p.id)}
                                    className="mt-2 text-xs font-medium text-[#1f6fb8] underline underline-offset-2"
                                  >
                                    {esimAberto === p.id ? "Fechar detalhes" : "Como funciona e termos"}
                                  </button>
                                  {esimAberto === p.id && (
                                    <div className="mt-2 text-[11px] leading-5 text-black/70">
                                      <p className="font-medium text-black/80">Como funciona</p>
                                      <ListaTermos itens={COMO_FUNCIONA_ESIM} />
                                      <p className="mt-2 font-medium text-black/80">Termos de uso</p>
                                      <ListaTermos itens={TERMOS_ESIM} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 sm:max-w-sm">
                            <Contador rotulo="Quantidade de eSIMs" ajuda="Um por celular" valor={qtdEsim} min={1} max={MAX_PESSOAS} onChange={setQtdEsim} />
                          </div>
                        </div>
                      )}
                    </li>

                    {/* Limousine Bus — pagamento online */}
                    <li className={`rounded-2xl border transition ${comLimousine ? "border-[#2f80c9] bg-[#2f80c9]/[0.03] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"}`}>
                      <label className="flex cursor-pointer items-start gap-3 p-4 sm:p-5">
                        <input
                          type="checkbox"
                          checked={comLimousine}
                          onChange={(e) => setComLimousine(e.target.checked)}
                          className="mt-3 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                        />
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                          <Image src="/images/icone-servico-transfer-onibus.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-medium text-black">Limousine Bus (aeroporto ↔ Tóquio)</span>
                            <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">Pagamento online</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-black/60">
                            Ônibus executivo regular entre Narita/Haneda e os principais hotéis e estações de Tóquio. Compramos e enviamos o voucher.
                          </span>
                        </span>
                      </label>
                      {comLimousine && (
                        <div className="border-t border-black/[0.06] px-4 pb-4 pt-3 sm:px-5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-medium text-black/60">Aeroporto</span>
                              <span className="relative block">
                                <select value={aeroportoLimo} onChange={(e) => setAeroportoLimo(e.target.value as AeroportoLimousine)} className={CLASSE_SELECT}>
                                  <option value="narita">Narita (NRT) — ¥{TARIFA_LIMOUSINE_JPY.narita.toLocaleString("pt-BR")} tarifa oficial</option>
                                  <option value="haneda">Haneda (HND) — até ¥{TARIFA_LIMOUSINE_JPY.haneda.toLocaleString("pt-BR")} tarifa oficial</option>
                                </select>
                                <IconeSeta />
                              </span>
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-medium text-black/60">Trecho</span>
                              <span className="relative block">
                                <select value={sentidoLimo} onChange={(e) => setSentidoLimo(e.target.value as SentidoLimousine)} className={CLASSE_SELECT}>
                                  {SENTIDOS_LIMOUSINE.map((x) => (
                                    <option key={x.id} value={x.id}>{x.nome}</option>
                                  ))}
                                </select>
                                <IconeSeta />
                              </span>
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="mb-1.5 block text-xs font-medium text-black/60">Ponto em Tóquio (saída/chegada)</span>
                              <span className="relative block">
                                <select value={pontoLimo} onChange={(e) => setPontoLimo(e.target.value)} className={CLASSE_SELECT}>
                                  {PONTOS_LIMOUSINE_TOQUIO.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                                <IconeSeta />
                              </span>
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="mb-1.5 block text-xs font-medium text-black/60">
                                Hotel{pontoLimo.startsWith("Outro") ? "/ponto (obrigatório)" : " (opcional)"}
                              </span>
                              <input
                                type="text"
                                value={hotelLimo}
                                onChange={(e) => setHotelLimo(e.target.value)}
                                placeholder="Nome e endereço do hotel"
                                className={classeInput(false)}
                              />
                            </label>
                          </div>
                          <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
                            <Contador rotulo="Adultos" ajuda="12 anos ou mais" valor={adultosLimo} min={0} max={MAX_PESSOAS} onChange={setAdultosLimo} />
                            <Contador rotulo="Crianças" ajuda="6 a 11 anos · meia tarifa" valor={criancasLimo} min={0} max={MAX_PESSOAS} onChange={setCriancasLimo} />
                          </div>
                          <div className="mt-3 space-y-1.5 rounded-lg bg-black/[0.03] px-3 py-2.5 text-xs leading-5 text-black/70">
                            <p>
                              <strong className="font-semibold">Embarque no aeroporto:</strong> {EMBARQUE_AEROPORTO_LIMOUSINE[aeroportoLimo]}
                            </p>
                            <p>
                              <strong className="font-semibold">Em Tóquio:</strong> {pontoLimo}
                              {hotelLimo ? ` — ${hotelLimo}` : ""}. O ponto exato da sua linha vem no voucher.
                            </p>
                            <p>
                              <strong className="font-semibold">Horários:</strong> {HORARIOS_LIMOUSINE}
                            </p>
                            <p>
                              <strong className="font-semibold">Duração:</strong> {DURACAO_LIMOUSINE[aeroportoLimo]} conforme o trânsito. Até 2 malas por pessoa.
                              Menores de 6 anos no colo não pagam.
                            </p>
                          </div>
                          <p className={`${inter.className} mt-3 text-sm font-semibold tabular-nums text-[#0A2540]`}>
                            {formatUSD(limousineUSD)} <span className="text-xs font-normal text-black/50">≈ {formatBRL(limousineBRL)} · pago online ao finalizar</span>
                          </p>
                        </div>
                      )}
                    </li>
                  </ul>
                  {tentouAvancarServicos && !etapa1Ok && (
                    <p className="mt-3 text-sm text-red-600">{escolhidos.length === 0 ? "Escolha ao menos um serviço." : problemasServicos[0]}</p>
                  )}
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}

                  <div className="mt-8 border-t border-black/10 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Também com página própria</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {OUTROS_PRODUTOS.map((o) => (
                        <Link
                          key={o.href}
                          href={o.href}
                          className="rounded-full border border-black/15 px-4 py-2 text-sm text-[#1f6fb8] transition hover:border-[#2f80c9]"
                        >
                          {o.nome} →
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — VIAGEM ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Quando e quantas pessoas?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos o período e o grupo para conferir as quantidades de cada serviço.</p>

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
                            if (v && (!dataPartida || dataPartida < v)) setDataPartida(v);
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
                      <p className="mt-1.5 text-xs text-black/45">{dias > 0 ? `${dias} ${dias === 1 ? "dia" : "dias"} no Japão.` : " "}</p>
                    )}

                    <div className="mt-4 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="sm:max-w-sm">
                        <Contador rotulo="Pessoas" ajuda="Incluindo crianças" valor={pessoas} min={1} max={MAX_PESSOAS} onChange={setPessoas} />
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 3 — DADOS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para confirmar os serviços com você.</p>
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
                          placeholder="Datas e horários preferidos para cada restaurante, outro restaurante desejado, ocasião especial."
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 4 — REVISÃO ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Revise seu pedido
                  </h2>
                  <dl className="mt-6 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                    {[
                      {
                        rotulo: "Serviços",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <div className="space-y-1.5">
                            {escolhidos.map((s) => (
                              <p key={s.key} className="flex justify-between gap-3">
                                <span className="min-w-0">
                                  {s.nome}
                                  <span className="text-black/55"> · {s.detalhe}</span>
                                </span>
                                <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(s.valorUSD)}</span>
                              </p>
                            ))}
                            {comRestaurantes && nomesRestaurantes.length > 0 && (
                              <p className="text-xs text-black/55">Restaurantes: {nomesRestaurantes.join(", ")}</p>
                            )}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Período e pessoas",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <>
                            {textoPeriodo}
                            <span className="text-black/50"> · {textoPessoas}</span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Seus dados",
                        voltar: 3 as Etapa,
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
                        {comRestaurantes && <p className="mt-0.5 text-xs text-black/50">Não inclui o valor das refeições nos restaurantes.</p>}
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições dos serviços adicionais"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosServicos />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições dos serviços adicionais.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar os serviços.</p>}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    {comLimousine
                      ? `O Limousine Bus (${formatBRL(limousineBRL)}) é pago online na página segura da Stone, que abre em uma nova aba. ${
                          escolhidos.length > 1 ? "Os demais serviços são confirmados e cobrados pelo WhatsApp." : ""
                        }`
                      : "Nenhum valor é cobrado agora. Nossa equipe confirma os serviços e combina a forma de pagamento com você pelo WhatsApp."}
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
                  {escolhidos.length > 0 ? `${escolhidos.length} ${escolhidos.length === 1 ? "serviço" : "serviços"}` : "Total estimado"}
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
