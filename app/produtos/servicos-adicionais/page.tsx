"use client";

// Serviços Adicionais — página de produto no mesmo template do Transporte
// Privado, Hotéis, Guia etc. (pedido do Wilson, 30/set/2026: "transformar
// pagina atual em template novo aonde você pode selecionar os serviços
// extras"). Substitui a antiga /servicos-adicionais (cards soltos com
// "Adicionar ao meu pacote"), que agora redireciona para cá. Checkout
// manual: o envio registra o pedido no CRM
// (/api/servicos-adicionais-selfservice) e a equipe confirma pelo WhatsApp.
//
// 4 etapas: 1 Viagem (período + pessoas) → 2 Serviços (catálogo com
// seleção e quantidades) → 3 Dados → 4 Revisão (termos numa caixa).
//
// Catálogo e preços = os mesmos da seção de serviços adicionais da
// Calculadora Reversa (constantes em CustomPackageCard.tsx), para o cliente
// ver o mesmo valor que o vendedor. Transfer aeroporto, Câmbio, JR Pass e
// Seguro Viagem têm página própria e aparecem só como atalho.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import {
  DIARIA_WIFI_USD_PAX,
  PRECO_MALA_INTERMUNICIPAL_USD,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_QTD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  PRECO_TRANSFER_ONIBUS_USD_PAX,
  PRECO_RESERVA_RESTAURANTE_USD,
  PRECO_EXPERIENCIA_SOB_MEDIDA_USD,
  DIARIA_CONCIERGE_USD,
  COMISSAO_AJISAI_SHOPPING_PCT,
} from "../../components/CustomPackageCard";
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
} from "../../components/transporte/compartilhado";

const ETAPAS = ["Viagem", "Serviços", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

const MAX_DIAS = 60;
const MAX_PESSOAS = 20;

type Ctx = { pessoas: number; dias: number };
type CampoQtd = { rotulo: string; padrao: (c: Ctx) => number; min: number; max: number };
type Servico = {
  key: string;
  crm: string | null;
  nome: string;
  descricao: string;
  icone: string;
  campos: CampoQtd[];
  /** Valor em US$ para as quantidades escolhidas; null = sob consulta. */
  preco: (q: number[]) => number | null;
  unidade: string;
  nota?: string;
};

const SERVICOS: Servico[] = [
  {
    key: "esim",
    crm: "esim",
    nome: "eSIM",
    descricao: "Internet 5G direto no celular, sem retirar nem devolver aparelho.",
    icone: "/images/icone-esim.svg",
    campos: [
      { rotulo: "Pessoas", padrao: (c) => c.pessoas, min: 1, max: MAX_PESSOAS },
      { rotulo: "Dias", padrao: (c) => c.dias, min: 1, max: MAX_DIAS },
    ],
    preco: ([p, d]) => DIARIA_WIFI_USD_PAX * p * d,
    unidade: `${formatUSD(DIARIA_WIFI_USD_PAX)} por pessoa/dia`,
  },
  {
    key: "malas",
    crm: null,
    nome: "Transporte de malas entre cidades",
    descricao: "A mala sai do hotel de uma cidade e chega no hotel da próxima no dia seguinte — sem carregar no Shinkansen.",
    icone: "/images/icone-servico-malas-intermunicipal.png",
    campos: [
      { rotulo: "Malas", padrao: (c) => c.pessoas, min: 1, max: 40 },
      { rotulo: "Trechos", padrao: () => 1, min: 1, max: 10 },
    ],
    preco: ([m, t]) => PRECO_MALA_INTERMUNICIPAL_USD * m * t,
    unidade: `${formatUSD(PRECO_MALA_INTERMUNICIPAL_USD)} por mala/trecho`,
  },
  {
    key: "restaurantesHighEnd",
    crm: "reserva_restaurantes",
    nome: "Restaurantes High-End",
    descricao: `Pacote de ${RESTAURANTES_HIGHEND_QTD} reservas em restaurantes Michelin, Tabelog Award ou equivalentes, para até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas.`,
    icone: "/images/icone-servico-restaurantes-highend.png",
    campos: [],
    preco: () => PRECO_RESTAURANTES_HIGHEND_USD,
    unidade: `pacote de ${RESTAURANTES_HIGHEND_QTD} reservas`,
    nota: "+ valor das refeições",
  },
  {
    key: "reservaRestaurante",
    crm: "reserva_restaurantes",
    nome: "Reserva de restaurante",
    descricao: "Nossa equipe consegue mesa em restaurantes concorridos fora do pacote High-End.",
    icone: "/images/icone-servico-reserva-restaurante.png",
    campos: [{ rotulo: "Reservas", padrao: () => 1, min: 1, max: 20 }],
    preco: ([r]) => PRECO_RESERVA_RESTAURANTE_USD * r,
    unidade: `${formatUSD(PRECO_RESERVA_RESTAURANTE_USD)} por reserva`,
    nota: "+ valor das refeições",
  },
  {
    key: "experiencia",
    crm: null,
    nome: "Experiência sob medida",
    descricao: "Cerimônia do chá particular, acessos exclusivos e experiências fora do catálogo — pesquisamos, negociamos e agendamos.",
    icone: "/images/icone-servico-experiencia-sob-medida.png",
    campos: [{ rotulo: "Experiências", padrao: () => 1, min: 1, max: 10 }],
    preco: ([e]) => PRECO_EXPERIENCIA_SOB_MEDIDA_USD * e,
    unidade: `${formatUSD(PRECO_EXPERIENCIA_SOB_MEDIDA_USD)} por experiência`,
    nota: "+ custo da experiência, cotado à parte",
  },
  {
    key: "concierge",
    crm: null,
    nome: "Concierge dedicado",
    descricao: "Suporte e tradução por WhatsApp e telefone durante a viagem, para o que surgir.",
    icone: "/images/icone-servico-concierge.png",
    campos: [{ rotulo: "Dias", padrao: (c) => c.dias, min: 1, max: MAX_DIAS }],
    preco: ([d]) => DIARIA_CONCIERGE_USD * d,
    unidade: `${formatUSD(DIARIA_CONCIERGE_USD)} por dia`,
  },
  {
    key: "transferOnibus",
    crm: null,
    nome: "Limousine Bus (aeroporto ↔ Tóquio)",
    descricao: "Ônibus executivo entre o aeroporto e o hotel em Tóquio, ida e volta, com reserva e orientação da nossa equipe.",
    icone: "/images/icone-servico-transfer-onibus.png",
    campos: [{ rotulo: "Pessoas", padrao: (c) => c.pessoas, min: 1, max: MAX_PESSOAS }],
    preco: ([p]) => PRECO_TRANSFER_ONIBUS_USD_PAX * p,
    unidade: `${formatUSD(PRECO_TRANSFER_ONIBUS_USD_PAX)} por pessoa`,
  },
  {
    key: "ajisaiShopping",
    crm: "ajisai_shopping",
    nome: "Ajisai Shopping",
    descricao: "Acompanhamento pessoal em compras — negociação, tradução e apoio logístico nas lojas.",
    icone: "/images/icone-servico-ajisai-shopping.png",
    campos: [],
    preco: () => null,
    unidade: `${Math.round(COMISSAO_AJISAI_SHOPPING_PCT * 100)}% sobre o valor das compras`,
  },
];

// Produtos com página própria — só atalhos aqui.
const OUTROS_PRODUTOS = [
  { nome: "Transfer Aeroporto", href: "/produtos/transfer-aeroporto" },
  { nome: "Câmbio", href: "/produtos/cambio" },
  { nome: "JR Pass", href: "/produtos/jrpass" },
  { nome: "Seguro Viagem", href: "/produtos/seguro-viagem" },
];

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

function TextoTermosServicos() {
  return (
    <>
      <p className="font-medium text-black/80">Pedido e confirmação</p>
      <p className="mt-1">
        Os valores desta página são de referência. Nossa equipe confirma disponibilidade, datas e detalhes de cada serviço pelo
        WhatsApp, e os serviços só são contratados depois da sua aprovação e da confirmação do pagamento.
      </p>
      <p className="mt-3 font-medium text-black/80">Custos de terceiros</p>
      <p className="mt-1">
        Refeições em restaurantes, o custo das experiências sob medida e as compras feitas com o Ajisai Shopping são pagos à
        parte. O valor desta página é o do serviço da Ajisai.
      </p>
      <p className="mt-3 font-medium text-black/80">Reservas</p>
      <p className="mt-1">
        Restaurantes e experiências dependem da disponibilidade de cada estabelecimento. Quando uma reserva não é possível,
        oferecemos alternativas equivalentes. Políticas de cancelamento e no-show de restaurantes e parceiros são repassadas
        antes da confirmação.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        Nenhum valor é cobrado nesta página. Forma de pagamento e parcelamento são combinados com a nossa equipe pelo
        WhatsApp; valores em dólar são convertidos pela cotação do dia da confirmação.
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

  // Serviço marcado → quantidades de cada campo.
  const [selecionados, setSelecionados] = useState<Record<string, number[]>>({});

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
  const ctx: Ctx = { pessoas, dias: Math.max(1, dias) };

  const escolhidos = SERVICOS.filter((s) => s.key in selecionados);
  const precoDe = (s: Servico) => s.preco(selecionados[s.key] ?? s.campos.map((c) => c.padrao(ctx)));
  const totalUSD = escolhidos.reduce((soma, s) => soma + (precoDe(s) ?? 0), 0);
  const totalBRL = totalUSD * cambioCotacao;

  const avisos: string[] = [];
  if ("restaurantesHighEnd" in selecionados && pessoas > RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
    avisos.push(`O pacote High-End é para até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas — para ${pessoas}, confirmamos a disponibilidade com você.`);
  }
  escolhidos.forEach((s) => {
    const q = selecionados[s.key];
    s.campos.forEach((c, i) => {
      if (c.rotulo === "Dias" && dias > 0 && q[i] > dias) avisos.push(`${s.nome}: ${q[i]} dias, mas a viagem tem ${dias}.`);
      if (c.rotulo === "Pessoas" && q[i] > pessoas) avisos.push(`${s.nome}: ${q[i]} pessoas, mas o grupo tem ${pessoas}.`);
    });
  });
  if ("ajisaiShopping" in selecionados) avisos.push("Ajisai Shopping é cobrado como porcentagem das compras — não entra no total estimado.");

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

  const etapa1Ok = periodoValido && pessoas >= 1;
  const etapa2Ok = escolhidos.length > 0;
  const etapa3Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos;

  const textoPeriodo = periodoValido ? `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${dias} ${dias === 1 ? "dia" : "dias"}` : "";
  const textoPessoas = `${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`;
  const detalheQtd = (s: Servico) =>
    s.campos
      .map((c, i) => {
        const n = selecionados[s.key]?.[i] ?? c.padrao(ctx);
        const rotulo = c.rotulo.toLowerCase();
        return `${n} ${n === 1 ? rotulo.replace(/s$/, "") : rotulo}`;
      })
      .join(" · ");

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function alternar(s: Servico) {
    setSelecionados((atual) => {
      const novo = { ...atual };
      if (s.key in novo) delete novo[s.key];
      else novo[s.key] = s.campos.map((c) => c.padrao(ctx));
      return novo;
    });
  }
  function ajustar(s: Servico, i: number, valor: number) {
    setSelecionados((atual) => {
      const q = [...(atual[s.key] ?? [])];
      q[i] = valor;
      return { ...atual, [s.key]: q };
    });
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? { rotulo: "Ver serviços", ativo: true, falta: etapa1Ok ? null : "Informe chegada e partida para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha um serviço", ativo: false, falta: "Escolha ao menos um serviço para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : "Solicitar serviços",
              ativo: podeEnviar && status !== "enviando",
              falta: termosAceitos ? null : "Aceite os Termos e Condições para solicitar",
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
  const resumoServicos = escolhidos
    .map((s) => {
      const p = precoDe(s);
      return `${s.nome}${s.campos.length ? ` (${detalheQtd(s)})` : ""} — ${p === null ? s.unidade : `US$ ${Math.round(p)}`}`;
    })
    .join("; ");

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
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
            crm: s.crm,
            detalhe: detalheQtd(s),
            valorUSD: precoDe(s) === null ? null : Math.round(precoDe(s) as number),
            unidade: s.unidade,
          })),
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
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
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
          escolhidos.map((s) => {
            const p = precoDe(s);
            return (
              <div key={s.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                  <IconeResumo src={s.icone} />
                  <span className="min-w-0">
                    <span className="block">{s.nome}</span>
                    {s.campos.length > 0 && <span className="block text-xs text-black/50">{detalheQtd(s)}</span>}
                  </span>
                </span>
                {p === null ? (
                  <span className="shrink-0 text-xs text-black/50">sob consulta</span>
                ) : (
                  <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(p)}</span>
                )}
              </div>
            );
          })
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
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)} na cotação do dia</p>
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
                  <p className="mt-1.5 text-sm text-black/60">Usamos o período e o grupo para já sugerir as quantidades de cada serviço.</p>

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
                        Ver serviços
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — SERVIÇOS ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha os serviços
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Marque quantos quiser. As quantidades já vêm pelo período e pelo grupo:{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPeriodo} · {textoPessoas}
                    </button>
                    .
                  </p>

                  <ul className="mt-6 space-y-3">
                    {SERVICOS.map((s) => {
                      const ativo = s.key in selecionados;
                      const p = precoDe(s);
                      return (
                        <li
                          key={s.key}
                          className={`rounded-xl border transition ${ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.04] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"}`}
                        >
                          <label className="flex cursor-pointer items-start gap-3 p-4">
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => alternar(s)}
                              className="mt-3 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                            />
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                              <Image src={s.icone} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                                <span className="text-[15px] font-medium text-black">{s.nome}</span>
                                <span className={`${inter.className} text-sm font-semibold tabular-nums text-[#0A2540]`}>
                                  {ativo ? (p === null ? "sob consulta" : formatUSD(p)) : ""}
                                </span>
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-black/55">{s.descricao}</span>
                              <span className="mt-1 block text-xs text-black/45">
                                {s.unidade}
                                {s.nota && ` · ${s.nota}`}
                              </span>
                            </span>
                          </label>
                          {ativo && s.campos.length > 0 && (
                            <div className="grid gap-x-6 border-t border-black/[0.06] px-4 pb-2 pt-1 sm:ml-[92px] sm:grid-cols-2 sm:border-t-0 sm:px-0 sm:pr-4">
                              {s.campos.map((c, i) => (
                                <Contador
                                  key={c.rotulo}
                                  rotulo={c.rotulo}
                                  valor={selecionados[s.key][i]}
                                  min={c.min}
                                  max={c.max}
                                  onChange={(n) => ajustar(s, i, n)}
                                />
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
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
                          placeholder="Restaurantes ou experiências que você tem em mente, cidades e datas de cada serviço."
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
                        rotulo: "Período e pessoas",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <>
                            {textoPeriodo}
                            <span className="text-black/50"> · {textoPessoas}</span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Serviços",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <div className="space-y-1.5">
                            {escolhidos.map((s) => {
                              const p = precoDe(s);
                              return (
                                <p key={s.key} className="flex justify-between gap-3">
                                  <span className="min-w-0">
                                    {s.nome}
                                    {s.campos.length > 0 && <span className="text-black/55"> · {detalheQtd(s)}</span>}
                                  </span>
                                  <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{p === null ? "sob consulta" : formatUSD(p)}</span>
                                </p>
                              );
                            })}
                          </div>
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
                    Nenhum valor é cobrado agora. Nossa equipe confirma os serviços e combina a forma de pagamento com você pelo
                    WhatsApp.
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
