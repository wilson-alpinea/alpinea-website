"use client";

// Guia Turístico — página de produto no mesmo template do Transporte
// Privado, Transfer Aeroporto, Passagens Aéreas e Hotéis (pedido do
// Wilson, 30/set/2026: "hero de guia turistico, pagina de guia turistico
// deve ser atualizada também"). Substitui a antiga /guia-turistico (tela
// preta com botão de WhatsApp), que agora redireciona para cá. Checkout
// manual: o envio registra o pedido no CRM (/api/guia-selfservice) e a
// equipe confirma o guia e o pagamento pelo WhatsApp.
//
// 5 etapas: 1 Viagem (período + pessoas) → 2 Guia (brasileiro ou
// estrangeiro) → 3 Dias (quais dias e em que cidade) → 4 Dados →
// 5 Revisão (termos numa caixa na página).
//
// Preço = mesma regra do motor de preço (CustomPackageCard.tsx):
// DIARIA_GUIA_USD (brasileiro, +40%) ou DIARIA_GUIA_ESTRANGEIRO_USD por dia,
// um guia a cada GUIA_TAMANHO_GRUPO pessoas. O card em /produtos diz
// "Requer Roteiro Personalizado" — por isso o Roteiro entra no total, a
// menos que o cliente marque que já contratou.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import {
  DIARIA_GUIA_USD,
  DIARIA_GUIA_ESTRANGEIRO_USD,
  GUIA_TAMANHO_GRUPO,
  ROTEIRO_PRECO_BASE,
} from "../../components/CustomPackageCard";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  IconeResumo,
  diasEntre,
  formatarDataCurta,
  formatarDiaMes,
  mascararWhatsapp,
  IconeCheck,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
} from "../../components/transporte/compartilhado";
import { EscopoServico, type VideoExplicativo } from "../../components/EscopoServico";

const ETAPAS = ["Viagem", "Guia", "Dias", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4 | 5;

const MAX_DIAS = 45;
const MAX_PESSOAS = 20;

type TipoGuia = "brasileiro" | "estrangeiro";
const GUIAS: { key: TipoGuia; nome: string; perfil: string; diariaUSD: number }[] = [
  {
    key: "brasileiro",
    nome: "Guia brasileiro",
    perfil: "Fala português como língua nativa e entende o que o viajante brasileiro procura",
    diariaUSD: DIARIA_GUIA_USD,
  },
  {
    key: "estrangeiro",
    nome: "Guia local",
    perfil: "Guia japonês ou estrangeiro, com português limitado ou em inglês",
    diariaUSD: DIARIA_GUIA_ESTRANGEIRO_USD,
  },
];

const CIDADES = ["Tóquio", "Kyoto", "Osaka", "Nara", "Hakone", "Nikko", "Kamakura", "Hiroshima", "Kanazawa", "Outra"];

// Escopo do guia — Wilson, 06/out/2026: "deixar claro o que está sendo
// contratado e escopo de funções / guia não é motorista particular, guia não
// carrega malas, guia fala português não necessariamente é brasileiro, não
// está esperando você no aeroporto, não é responsável pela sua alimentação,
// não precisa pagar alimentação do guia, não precisa pagar transporte".
const INCLUIDO_GUIA = [
  "Guia dedicado só ao seu grupo, nos dias contratados (horário combinado na confirmação)",
  "Condução a pé e em transporte público pelos pontos do seu roteiro",
  "Explicações sobre história, cultura e costumes dos lugares visitados",
  "Ajuda com idioma: tradução em lojas, restaurantes, templos e bilheterias",
  "Orientação de trajetos, horários e como evitar filas",
  "Alimentação e transporte do próprio guia durante o passeio — você não paga nada a mais por isso",
];
const NAO_INCLUIDO_GUIA = [
  "O guia não é motorista particular — não dirige nem leva carro (veja Transporte Privado)",
  "O guia não carrega malas nem bagagem",
  "O guia não espera você no aeroporto (para isso, veja Transfer Aeroporto)",
  "O guia não é responsável pela sua alimentação: refeições do grupo são pagas à parte",
  "Ingressos, passagens de trem/metrô/táxi do grupo e compras não estão incluídos",
  "Guia que fala português não é necessariamente brasileiro (o guia brasileiro é uma opção específica)",
  "Não é babá nem acompanhante de crianças sem os pais",
];
const DIFERENCIAIS_GUIA = [
  "Guias selecionados pela Ajisai, com anos de experiência no Japão",
  "Trabalha em cima do seu Roteiro Personalizado, não de um tour genérico",
  "Contratado por dia — você escolhe só os dias que precisa",
  "Opção de guia brasileiro, nativo em português",
];
// Vídeo explicativo (Wilson, 06/out/2026). Aguardando o material: quando o
// vídeo existir, preencher, ex.: { tipo: "mp4", src: "/videos/guia-turistico.mp4" }
// ou { tipo: "youtube", id: "XXXXXXXXXXX" }. null = bloco de vídeo oculto.
const VIDEO_GUIA: VideoExplicativo | null = null;

function Contador({ rotulo, ajuda, valor, min, total, onChange }: { rotulo: string; ajuda: string; valor: number; min: number; total: number; onChange: (n: number) => void }) {
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
          onClick={() => onChange(valor + 1)}
          disabled={total >= MAX_PESSOAS}
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          +
        </button>
      </span>
    </div>
  );
}

function TextoTermosGuia() {
  return (
    <>
      <p className="font-medium text-black/80">Serviço</p>
      <p className="mt-1">
        O guia acompanha o grupo nos dias contratados, seguindo o roteiro combinado com a nossa equipe. Cada guia atende até{" "}
        {GUIA_TAMANHO_GRUPO} pessoas; grupos maiores recebem guias adicionais, cobrados proporcionalmente.
      </p>
      <p className="mt-3 font-medium text-black/80">Escopo do guia</p>
      <p className="mt-1">
        O guia conduz o grupo a pé e em transporte público, explica os locais e ajuda com o idioma. O guia não é motorista
        particular, não carrega malas, não recepciona no aeroporto e não é responsável pela alimentação do grupo. Guia que
        fala português não é necessariamente brasileiro — o guia brasileiro é uma opção específica.
      </p>
      <p className="mt-3 font-medium text-black/80">O que não está incluído</p>
      <p className="mt-1">
        Ingressos, refeições e transporte (trem, metrô, táxi ou motorista) do grupo são pagos à parte. A alimentação e o
        transporte do próprio guia durante o passeio já estão incluídos — o cliente não paga nada a mais por eles.
      </p>
      <p className="mt-3 font-medium text-black/80">Roteiro Personalizado</p>
      <p className="mt-1">
        O guia trabalha a partir do Roteiro Personalizado da Ajisai, que define atrações, horários e deslocamentos de cada
        dia. Quem ainda não tem o roteiro com a Ajisai o contrata junto.
      </p>
      <p className="mt-3 font-medium text-black/80">Disponibilidade e confirmação</p>
      <p className="mt-1">
        Os valores desta página são estimativas. O guia é confirmado conforme a disponibilidade para as datas e cidades
        escolhidas, e a reserva só é feita depois da sua aprovação e da confirmação do pagamento.
      </p>
      <p className="mt-3 font-medium text-black/80">Cancelamento e alterações</p>
      <p className="mt-1">
        Condições de cancelamento e de alteração de datas são informadas junto com a confirmação do guia, antes de qualquer
        cobrança.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        Nenhum valor é cobrado nesta página. Forma de pagamento e parcelamento são combinados com a nossa equipe pelo
        WhatsApp; valores em dólar são convertidos pela cotação do dia da confirmação.
      </p>
    </>
  );
}

export default function GuiaTuristicoPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [adultos, setAdultos] = useState(2);
  const [criancas, setCriancas] = useState(0);
  // Ciência do escopo (o que está e o que não está incluído) — obrigatória.
  const [escopoCiente, setEscopoCiente] = useState(false);

  const [tipoGuia, setTipoGuia] = useState<TipoGuia | "">("");
  // Dias com guia → cidade de cada dia.
  const [diasGuia, setDiasGuia] = useState<Record<string, string>>({});
  const [temRoteiro, setTemRoteiro] = useState(false);

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

  const pessoas = adultos + criancas;
  const guiasPorDia = Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO));

  const erroDataChegada = !dataChegada ? "Informe a data de chegada." : dataChegada < hojeISO() ? "A chegada precisa ser hoje ou depois." : null;
  const erroDataPartida = !dataPartida
    ? "Informe a data de partida."
    : dataChegada && dataPartida < dataChegada
      ? "A partida precisa ser no dia da chegada ou depois."
      : dataChegada && diasEntre(dataChegada, dataPartida).length > MAX_DIAS
        ? `Para viagens com mais de ${MAX_DIAS} dias, fale com a nossa equipe.`
        : null;
  const periodoValido = erroDataChegada === null && erroDataPartida === null;
  const diasViagem = periodoValido ? diasEntre(dataChegada, dataPartida) : [];

  const diasEscolhidos = diasViagem.filter((d) => d in diasGuia);
  const diasForaDoPeriodo = Object.keys(diasGuia).filter((d) => !diasViagem.includes(d));
  const guia = GUIAS.find((g) => g.key === tipoGuia);
  const diariaUSD = guia?.diariaUSD ?? 0;
  const guiaUSD = diariaUSD * guiasPorDia * diasEscolhidos.length;
  const roteiroUSD = diasEscolhidos.length > 0 && !temRoteiro ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const totalUSD = guiaUSD + roteiroUSD;
  const totalBRL = totalUSD * cambioCotacao;

  const avisos: string[] = [];
  if (diasEscolhidos.some((d) => d === dataChegada || d === dataPartida)) {
    avisos.push("Guia no dia de chegada ou de partida — o tempo útil depende do horário do voo; combinamos pelo WhatsApp.");
  }
  if (guiasPorDia > 1) avisos.push(`Grupo de ${pessoas} pessoas: ${guiasPorDia} guias por dia (1 a cada ${GUIA_TAMANHO_GRUPO}).`);
  if (diasEscolhidos.some((d) => diasGuia[d] === "Outra")) avisos.push("Cidade “Outra” — informe qual nas observações.");

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

  const etapa1Ok = periodoValido && adultos >= 1 && escopoCiente;
  const etapa2Ok = tipoGuia !== "";
  const etapa3Ok = diasEscolhidos.length > 0;
  const etapa4Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok, etapa4Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && etapa4Ok && termosAceitos;

  const textoPeriodo = periodoValido
    ? `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${diasViagem.length} ${diasViagem.length === 1 ? "dia" : "dias"}`
    : "";
  const textoPessoas = `${adultos} ${adultos === 1 ? "adulto" : "adultos"}${criancas ? `, ${criancas} ${criancas === 1 ? "criança" : "crianças"}` : ""}`;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  // Liga/desliga um dia; a cidade sugerida é a do dia anterior escolhido.
  function alternarDia(d: string) {
    setDiasGuia((atual) => {
      const novo = { ...atual };
      if (d in novo) {
        delete novo[d];
        return novo;
      }
      const anterior = [...diasViagem].reverse().find((x) => x < d && x in novo);
      novo[d] = anterior ? novo[anterior] : "Tóquio";
      return novo;
    });
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? {
          rotulo: "Ver guias",
          ativo: true,
          falta: etapa1Ok
            ? null
            : periodoValido && !escopoCiente
              ? "Confirme que leu o que está e o que não está incluído"
              : "Informe chegada e partida para continuar",
        }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha o guia", ativo: false, falta: "Escolha o tipo de guia para continuar" }
        : etapa === 3
          ? etapa3Ok
            ? { rotulo: "Continuar", ativo: true, falta: null }
            : { rotulo: "Escolha os dias", ativo: false, falta: "Escolha ao menos um dia com guia" }
          : etapa === 4
            ? { rotulo: "Continuar", ativo: etapa4Ok, falta: etapa4Ok ? null : "Complete seus dados para continuar" }
            : {
                rotulo: status === "enviando" ? "Enviando…" : "Solicitar guia",
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
      return;
    }
    if (etapa === 4) {
      if (etapa4Ok) irPara(5);
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
  const resumoDias = diasEscolhidos.map((d) => `${formatarDataCurta(d)} — ${diasGuia[d]}`).join("; ");

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/guia-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataChegada,
          dataPartida,
          adultos,
          criancas,
          tipoGuia: guia?.nome ?? "",
          diariaUSD,
          guiasPorDia,
          dias: diasEscolhidos.map((d) => ({ data: d, cidade: diasGuia[d] })),
          resumo: resumoDias,
          temRoteiro,
          guiaUSD: Math.round(guiaUSD),
          roteiroUSD: Math.round(roteiroUSD),
          totalUSD: Math.round(totalUSD),
          totalBRL: Math.round(totalBRL),
          avisos,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir guia turístico pelo site da Ajisai — ${guia?.nome ?? ""}, ${resumoDias}.${nome ? ` Meu nome é ${nome}.` : ""}`;

  const totalExibidoUSD: number | null =
    diasEscolhidos.length > 0 && guia ? totalUSD : guia ? diariaUSD * guiasPorDia : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seu guia</p>
      <p className="mt-2 text-sm text-black/80">
        {textoPeriodo || <span className="text-black/45">Período a definir</span>}
        <span className="text-black/50"> · {textoPessoas}</span>
      </p>
      {guia ? (
        <p className="mt-1 text-sm text-black/80">
          {guia.nome}
          {guiasPorDia > 1 && <span className="text-black/50"> · {guiasPorDia} guias por dia</span>}
        </p>
      ) : (
        <p className="mt-1 text-sm text-black/45">Nenhum guia escolhido</p>
      )}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {diasEscolhidos.length === 0 ? (
          <p className="text-sm text-black/45">Nenhum dia escolhido</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                <IconeResumo src="/images/produtos/guia-turistico.png" />
                <span className="min-w-0">
                  <span className="block">
                    {diasEscolhidos.length} {diasEscolhidos.length === 1 ? "dia" : "dias"} com guia
                  </span>
                  <span className="block text-xs text-black/50">
                    {diasEscolhidos.map((d) => `${formatarDiaMes(d)} ${diasGuia[d]}`).join(" · ")}
                  </span>
                </span>
              </span>
              <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(guiaUSD)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/55">
                <IconeResumo src="/images/icone-servico-experiencia-sob-medida.png" />
                Roteiro Personalizado{temRoteiro ? " (já contratado)" : ""}
              </span>
              <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{temRoteiro ? "—" : formatUSD(roteiroUSD)}</span>
            </div>
          </>
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
        {totalExibidoUSD !== null && diasEscolhidos.length === 0 && <p className="text-xs text-black/50">por dia · valor final após escolher os dias</p>}
        {diasEscolhidos.length > 0 && guia && (
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
    cta.falta ?? (etapa < 5 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Guia Turístico</p>
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
            Nossa equipe confirma a disponibilidade do guia e combina os detalhes com você pelo WhatsApp — em geral no mesmo dia
            útil.
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
                  src="/images/produtos/guia-turistico-header.jpg"
                  alt="Guia apresentando uma rua histórica de Kyoto a uma família"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[50%_30%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Guia Turístico</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Um guia só seu, nos dias que você escolher
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
                  <p className="mt-1.5 text-sm text-black/60">Informe o período no Japão. Depois você escolhe em quais dias quer o guia.</p>

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
                      <p className="mt-1.5 text-xs text-black/45">
                        {diasViagem.length > 0 ? `${diasViagem.length} ${diasViagem.length === 1 ? "dia" : "dias"} no Japão.` : "Os dias com guia ficam dentro desse período."}
                      </p>
                    )}

                    <div className="mt-4 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="divide-y divide-black/[0.06] sm:max-w-sm">
                        <Contador rotulo="Adultos" ajuda="12 anos ou mais" valor={adultos} min={1} total={pessoas} onChange={setAdultos} />
                        <Contador rotulo="Crianças" ajuda="Até 11 anos" valor={criancas} min={0} total={pessoas} onChange={setCriancas} />
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Ver guias
                      </button>
                    </div>
                  </div>

                  <EscopoServico
                    titulo="O que você está contratando"
                    incluido={INCLUIDO_GUIA}
                    naoIncluido={NAO_INCLUIDO_GUIA}
                    diferenciais={DIFERENCIAIS_GUIA}
                    video={VIDEO_GUIA}
                    tituloVideo="Como funciona o guia turístico da Ajisai"
                  />
                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={escopoCiente}
                      onChange={(e) => setEscopoCiente(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e entendi o que está e o que não está incluído no serviço de guia.</span>
                  </label>
                  {tentouAvancarViagem && periodoValido && !escopoCiente && (
                    <p className="ml-8 text-xs text-red-600">Confirme para continuar.</p>
                  )}
                </section>
              )}

              {/* ── ETAPA 2 — GUIA ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha o guia
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Diária por guia, para até {GUIA_TAMANHO_GRUPO} pessoas.
                    {guiasPorDia > 1 && ` O seu grupo precisa de ${guiasPorDia} guias por dia.`}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {GUIAS.map((g) => {
                      const ativo = tipoGuia === g.key;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => setTipoGuia(g.key)}
                          aria-pressed={ativo}
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition sm:p-5 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="block pr-8 text-[15px] font-medium text-black">{g.nome}</span>
                          <span className="mt-0.5 block text-xs text-black/55">{g.perfil}</span>
                          <span className={`${inter.className} mt-3 block text-sm font-semibold tabular-nums text-[#0A2540]`}>
                            {formatUSD(g.diariaUSD)}
                            <span className="text-xs font-normal text-black/45"> / dia</span>
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

              {/* ── ETAPA 3 — DIAS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Em quais dias?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Marque os dias com guia e a cidade de cada um. Período:{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPeriodo}
                    </button>
                    .
                  </p>

                  <ul className="mt-6 divide-y divide-black/[0.06] rounded-xl border border-black/10">
                    {diasViagem.map((d) => {
                      const ativo = d in diasGuia;
                      return (
                        <li key={d} className={`flex items-center gap-3 px-4 py-2.5 ${ativo ? "bg-[#2f80c9]/[0.04]" : ""}`}>
                          <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => alternarDia(d)}
                              className="h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                            />
                            <span className="text-sm text-black/85">
                              {formatarDataCurta(d)}
                              {d === dataChegada && <span className="text-xs text-black/45"> · chegada</span>}
                              {d === dataPartida && d !== dataChegada && <span className="text-xs text-black/45"> · partida</span>}
                            </span>
                          </label>
                          {ativo && (
                            <span className="relative block w-36 shrink-0">
                              <select
                                aria-label={`Cidade em ${formatarDataCurta(d)}`}
                                value={diasGuia[d]}
                                onChange={(e) => setDiasGuia((atual) => ({ ...atual, [d]: e.target.value }))}
                                className="h-9 w-full appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-8 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                              >
                                {CIDADES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <IconeSeta />
                            </span>
                          )}
                          {ativo && guia && (
                            <span className={`${inter.className} hidden w-20 shrink-0 text-right text-sm tabular-nums text-black/70 sm:block`}>
                              {formatUSD(diariaUSD * guiasPorDia)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {diasForaDoPeriodo.length > 0 && (
                    <p className="mt-2 text-xs text-black/50">Dias fora do novo período foram desconsiderados.</p>
                  )}

                  <label className="mt-6 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={temRoteiro}
                      onChange={(e) => setTemRoteiro(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">
                      Já contratei o Roteiro Personalizado com a Ajisai
                      <span className="block text-xs text-black/50">
                        O guia trabalha a partir do Roteiro Personalizado. Se você ainda não tem, ele entra no pedido.
                      </span>
                    </span>
                  </label>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
                </section>
              )}

              {/* ── ETAPA 4 — DADOS ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para confirmar o guia com você.</p>
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
                          placeholder="Lugares que quer visitar, ritmo do grupo, idade das crianças, mobilidade."
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
                        rotulo: "Guia",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <>
                            {guia?.nome}
                            <span className="text-black/50">
                              {" "}
                              · {formatUSD(diariaUSD)} por dia{guiasPorDia > 1 && ` · ${guiasPorDia} guias por dia`}
                            </span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Dias",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-1">
                            {diasEscolhidos.map((d) => (
                              <p key={d}>
                                <span className="text-black/55">{formatarDataCurta(d)} · </span>
                                {diasGuia[d]}
                              </p>
                            ))}
                            <p className="text-black/55">Roteiro Personalizado: {temRoteiro ? "já contratado" : `incluído (${formatUSD(roteiroUSD)})`}</p>
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
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições do guia turístico"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosGuia />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições do guia turístico.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar o guia.</p>}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe confirma o guia e combina a forma de pagamento com você pelo WhatsApp.
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
                  {diasEscolhidos.length > 0 ? `${diasEscolhidos.length} ${diasEscolhidos.length === 1 ? "dia" : "dias"} com guia` : "Total estimado"}
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
