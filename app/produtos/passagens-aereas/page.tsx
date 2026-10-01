"use client";

// Passagens Aéreas — página de produto no mesmo template do Transporte
// Privado (pedido do Wilson, 30/set/2026: "ajustar pagina de passagens
// aereas para ser igual temos na pagina de transporte privado, mesmo
// template geral, checkout deve ser manual e não automatico via Stone").
// Sem pagamento no site: o envio registra o pedido de cotação no CRM
// (/api/passagens-selfservice) e a equipe fecha tarifa, emissão e
// pagamento pelo WhatsApp.
//
// 4 etapas: 1 Viagem (tipo, origem, destino, datas, passageiros — no
// estilo da SIXT) → 2 Cabine (valor de referência por passageiro +
// preferências) → 3 Dados → 4 Revisão (termos numa caixa na página).
//
// Valores de referência = os mesmos do motor de preço
// (PRECO_AEREO_* em CustomPackageCard.tsx): ida e volta por passageiro.
// A tarifa real depende de datas e disponibilidade — por isso a página
// fala sempre em "valor de referência" e o total é "estimado".

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import {
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_PREMIUM_ECONOMY_USD,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
} from "../../components/CustomPackageCard";
import { DIFERENCIAIS_AEREO } from "../../lib/diferenciaisAereo";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  IconeResumo,
  formatarDataCurta,
  formatarDiaMes,
  mascararWhatsapp,
  IconeCheck,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
} from "../../components/transporte/compartilhado";

const ETAPAS = ["Viagem", "Cabine", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

type Modo = "ida-volta" | "so-ida";
const MODOS: { key: Modo; nome: string }[] = [
  { key: "ida-volta", nome: "Ida e volta" },
  { key: "so-ida", nome: "Só ida" },
];

const ORIGENS = [
  { id: "GRU", nome: "São Paulo (GRU)" },
  { id: "GIG", nome: "Rio de Janeiro (GIG)" },
  { id: "BSB", nome: "Brasília (BSB)" },
  { id: "CNF", nome: "Belo Horizonte (CNF)" },
  { id: "CWB", nome: "Curitiba (CWB)" },
  { id: "POA", nome: "Porto Alegre (POA)" },
  { id: "SSA", nome: "Salvador (SSA)" },
  { id: "REC", nome: "Recife (REC)" },
  { id: "FOR", nome: "Fortaleza (FOR)" },
  { id: "OUTRA", nome: "Outra cidade" },
];
const DESTINOS = [
  { id: "TYO", nome: "Tóquio (NRT/HND)" },
  { id: "KIX", nome: "Osaka (KIX)" },
  { id: "NGO", nome: "Nagoya (NGO)" },
  { id: "FUK", nome: "Fukuoka (FUK)" },
  { id: "CTS", nome: "Sapporo (CTS)" },
];
const nomeOrigem = (id: string) => ORIGENS.find((o) => o.id === id)?.nome ?? id;
const nomeDestino = (id: string) => DESTINOS.find((d) => d.id === id)?.nome ?? id;

type Cabine = "economy" | "premium" | "business" | "first";
const CABINES: { key: Cabine; nome: string; perfil: string }[] = [
  { key: "economy", nome: "Econômica", perfil: "Tarifa mais acessível, com bagagem conforme a companhia" },
  { key: "premium", nome: "Premium Economy", perfil: "Mais espaço para as pernas e serviço de bordo superior" },
  { key: "business", nome: "Executiva", perfil: "Assento que vira cama, sala VIP e prioridade no embarque" },
  { key: "first", nome: "Primeira Classe", perfil: "Suíte privativa e o serviço mais exclusivo da companhia" },
];

// Companhias com que a Ajisai emite para o Japão (mesma lista de /passagens).
const COMPANHIAS = ["Emirates", "Qatar Airways", "Air France", "KLM", "Lufthansa", "Swiss", "Ethiopian"];

const MAX_POR_FAIXA = 9;

function Contador({
  rotulo,
  ajuda,
  valor,
  min,
  onChange,
}: {
  rotulo: string;
  ajuda: string;
  valor: number;
  min: number;
  onChange: (n: number) => void;
}) {
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
          onClick={() => onChange(Math.min(MAX_POR_FAIXA, valor + 1))}
          disabled={valor >= MAX_POR_FAIXA}
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          +
        </button>
      </span>
    </div>
  );
}

function TextoTermosPassagens() {
  return (
    <>
      <p className="font-medium text-black/80">Cotação e emissão</p>
      <p className="mt-1">
        Os valores mostrados nesta página são de referência, por passageiro, e servem para planejamento. A tarifa final
        depende das datas, da disponibilidade e das regras da companhia aérea no momento da emissão. Nossa equipe envia a
        cotação pelo WhatsApp e a passagem só é emitida depois da sua aprovação e da confirmação do pagamento.
      </p>
      <p className="mt-3 font-medium text-black/80">Regras da tarifa</p>
      <p className="mt-1">
        Bagagem, marcação de assento, remarcação, cancelamento e reembolso seguem as regras da tarifa escolhida e da
        companhia aérea. Informamos essas regras junto com a cotação, antes de qualquer cobrança.
      </p>
      <p className="mt-3 font-medium text-black/80">Dados dos passageiros</p>
      <p className="mt-1">
        Nomes, datas de nascimento e documentos precisam ser informados exatamente como no passaporte. Divergências podem
        impedir o embarque e gerar custos de correção cobrados pela companhia aérea.
      </p>
      <p className="mt-3 font-medium text-black/80">Documentação</p>
      <p className="mt-1">
        Passaporte válido, vistos e demais exigências de entrada e de conexão são responsabilidade do passageiro. Nossa
        equipe orienta sobre o Visit Japan Web e o protocolo pré-embarque.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        Nenhum valor é cobrado nesta página. Forma de pagamento, parcelamento e câmbio são combinados com a nossa equipe
        pelo WhatsApp; valores em dólar são convertidos pela cotação do dia da confirmação.
      </p>
    </>
  );
}

export default function PassagensAereasPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [modo, setModo] = useState<Modo>("ida-volta");
  const [origem, setOrigem] = useState("");
  const [origemOutra, setOrigemOutra] = useState("");
  const [destino, setDestino] = useState("");
  const [destinoVolta, setDestinoVolta] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [bebes, setBebes] = useState(0);

  const [cabine, setCabine] = useState<Cabine | "">("");
  const [companhia, setCompanhia] = useState("");
  const [datasFlexiveis, setDatasFlexiveis] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nomesPassageiros, setNomesPassageiros] = useState("");
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

  const temVolta = modo === "ida-volta";
  const voltaDe = destinoVolta || destino;
  const passageirosPagantes = adultos + criancas;
  const totalPassageiros = adultos + criancas + bebes;

  // ── Validação ──
  const errosViagem: Record<string, string | null> = {
    origem: !origem ? "Escolha a cidade de origem." : origem === "OUTRA" && origemOutra.trim().length < 2 ? "Informe a cidade de origem." : null,
    destino: !destino ? "Escolha o destino no Japão." : null,
    dataIda: !dataIda ? "Informe a data de ida." : dataIda < hojeISO() ? "A ida precisa ser hoje ou depois." : null,
    dataVolta: !temVolta
      ? null
      : !dataVolta
        ? "Informe a data de volta."
        : dataIda && dataVolta < dataIda
          ? "A volta precisa ser no dia da ida ou depois."
          : null,
    bebes: bebes > adultos ? "Cada bebê precisa viajar no colo de um adulto." : null,
  };
  const viagemValida = Object.values(errosViagem).every((e) => e === null);

  const digitosWhatsapp = whatsapp.replace(/\D/g, "").length;
  const errosDados: Record<string, string | null> = {
    nome: nome.trim().length < 3 ? "Informe seu nome completo." : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Informe um e-mail válido.",
    whatsapp: digitosWhatsapp >= 10 ? null : "Informe um WhatsApp com DDD.",
  };
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

  // ── Valores de referência (ida e volta, por passageiro, em US$) ──
  const referenciaUSD = (c: Cabine) =>
    c === "economy"
      ? PRECO_AEREO_ECONOMY_BRL / cambioCotacao
      : c === "premium"
        ? PRECO_AEREO_PREMIUM_ECONOMY_USD
        : c === "business"
          ? PRECO_AEREO_BUSINESS_USD
          : PRECO_AEREO_FIRST_USD;
  const porPassageiroUSD = cabine ? referenciaUSD(cabine) : 0;
  const totalUSD = porPassageiroUSD * passageirosPagantes;
  const totalBRL = totalUSD * cambioCotacao;
  const nomeCabine = CABINES.find((c) => c.key === cabine)?.nome ?? "";
  const menorReferencia = referenciaUSD("economy") * passageirosPagantes;

  // Avisos (só informam).
  const avisos: string[] = [];
  if (viagemValida && !temVolta) avisos.push("Passagem só de ida — confirme com a nossa equipe as exigências de entrada no Japão sem bilhete de volta.");
  if (viagemValida && temVolta && voltaDe !== destino) avisos.push(`Chegada em ${nomeDestino(destino)} e volta saindo de ${nomeDestino(voltaDe)} — o deslocamento entre as cidades no Japão não está incluído.`);
  if (bebes > 0) avisos.push("Bebês (até 2 anos) viajam no colo, com tarifa própria da companhia — cotamos junto.");

  const etapa1Ok = viagemValida && adultos >= 1;
  const etapa2Ok = cabine !== "";
  const etapa3Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos;

  const textoOrigem = origem === "OUTRA" ? origemOutra.trim() || "Outra cidade" : nomeOrigem(origem);
  const textoPassageiros = [
    `${adultos} ${adultos === 1 ? "adulto" : "adultos"}`,
    criancas ? `${criancas} ${criancas === 1 ? "criança" : "crianças"}` : "",
    bebes ? `${bebes} ${bebes === 1 ? "bebê" : "bebês"}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? { rotulo: "Ver cabines", ativo: true, falta: etapa1Ok ? null : "Preencha origem, destino e datas para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha a cabine", ativo: false, falta: "Escolha uma cabine para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : "Solicitar cotação",
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

  const resumoVoo = `${MODOS.find((m) => m.key === modo)?.nome}: ${textoOrigem} → ${nomeDestino(destino)} em ${dataIda}${
    temVolta ? `; volta ${nomeDestino(voltaDe)} → ${textoOrigem} em ${dataVolta}` : ""
  }`;

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/passagens-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumo: resumoVoo,
          modo,
          origem: textoOrigem,
          destino: nomeDestino(destino),
          destinoVolta: temVolta ? nomeDestino(voltaDe) : "",
          dataIda,
          dataVolta: temVolta ? dataVolta : "",
          adultos,
          criancas,
          bebes,
          cabine: nomeCabine,
          companhia: companhia || "Sem preferência",
          datasFlexiveis,
          referenciaPorPassageiroUSD: Math.round(porPassageiroUSD),
          totalUSD: Math.round(totalUSD),
          totalBRL: Math.round(totalBRL),
          avisos,
          nome,
          email,
          whatsapp,
          nomesPassageiros,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir uma cotação de passagem aérea pelo site da Ajisai — ${resumoVoo}, ${nomeCabine}, ${textoPassageiros}.${
    nome ? ` Meu nome é ${nome}.` : ""
  }`;

  const totalExibidoUSD: number | null = cabine ? totalUSD : etapa1Ok ? menorReferencia : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Sua passagem</p>
      <p className="mt-2 text-sm text-black/80">
        {MODOS.find((m) => m.key === modo)?.nome}
        <span className="text-black/50"> · {textoPassageiros}</span>
      </p>
      {cabine ? (
        <p className="mt-1 text-sm text-black/80">{nomeCabine}</p>
      ) : (
        <p className="mt-1 text-sm text-black/45">Nenhuma cabine escolhida</p>
      )}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {!origem || !destino ? (
          <p className="text-sm text-black/45">Nenhum trecho escolhido</p>
        ) : (
          <>
            <div className="flex items-center gap-2.5 text-sm text-black/80">
              <IconeResumo src="/images/icone-decolagem.png" />
              <span className="min-w-0">
                <span className="block">
                  {textoOrigem} → {nomeDestino(destino)}
                </span>
                <span className="block text-xs text-black/50">Ida{dataIda && !errosViagem.dataIda && ` · ${formatarDataCurta(dataIda)}`}</span>
              </span>
            </div>
            {temVolta && (
              <div className="flex items-center gap-2.5 text-sm text-black/80">
                <IconeResumo src="/images/icone-pousando.png" />
                <span className="min-w-0">
                  <span className="block">
                    {nomeDestino(voltaDe)} → {textoOrigem}
                  </span>
                  <span className="block text-xs text-black/50">
                    Volta{dataVolta && !errosViagem.dataVolta && ` · ${formatarDataCurta(dataVolta)}`}
                  </span>
                </span>
              </div>
            )}
          </>
        )}
        {cabine && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/65">
              {passageirosPagantes} × {formatUSD(porPassageiroUSD)}
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(totalUSD)}</span>
          </div>
        )}
        {bebes > 0 && cabine && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/65">
              {bebes} {bebes === 1 ? "bebê" : "bebês"} de colo
            </span>
            <span className="shrink-0 text-xs text-black/50">sob consulta</span>
          </div>
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
        {totalExibidoUSD !== null && !cabine && <p className="text-xs text-black/50">a partir de, na Econômica · valor de referência</p>}
        {totalExibidoUSD !== null && cabine && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>
            ≈ {formatBRL(totalBRL)} · valor de referência, a tarifa final vem na cotação
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

  // No celular as células empilham e os rótulos de cima somem — cada
  // célula ganha um rótulo pequeno interno (sm:hidden).
  const classeSelectCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent pl-3 pr-9 pt-4 text-base text-black focus:outline-none disabled:text-black/35 sm:h-12 sm:pt-0 md:text-[15px]";
  const classeDataCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent px-3 pt-4 text-base text-black focus:outline-none sm:h-12 sm:pt-0 md:text-[15px]";
  const rotuloMobile = "pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45 sm:hidden";
  const celula = "relative block min-w-0 border-t border-black/10 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0";
  const erroTrecho = mostrarErro("origem") || mostrarErro("destino");
  const erroDatas = mostrarErro("dataIda") || mostrarErro("dataVolta");

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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Passagens Aéreas</p>
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
            Nossa equipe envia a cotação com as melhores opções de voo pelo WhatsApp — em geral no mesmo dia útil. A
            passagem só é emitida depois da sua aprovação.
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
                  src="/images/produtos/passagens-aereas-header.jpg"
                  alt="Família com malas no terminal do aeroporto, com o avião ao fundo"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[35%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Passagens Aéreas</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Brasil ↔ Japão, com suporte do check-in ao desembarque
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
                    Para onde e quando?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Buscamos as melhores conexões para as suas datas e enviamos a cotação pelo WhatsApp.</p>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] sm:p-5">
                    <div role="radiogroup" aria-label="Tipo de passagem" className="inline-flex gap-1 rounded-full bg-black/[0.04] p-1">
                      {MODOS.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          role="radio"
                          aria-checked={modo === m.key}
                          onClick={() => setModo(m.key)}
                          className={`h-9 rounded-full px-4 text-sm transition ${
                            modo === m.key ? "bg-[#0A2540] font-semibold text-white" : "font-medium text-black/60 hover:text-black"
                          }`}
                        >
                          {m.nome}
                        </button>
                      ))}
                    </div>

                    {/* Trecho: origem | destino (| volta saindo de) */}
                    <div className="mt-5">
                      <div
                        className={`mb-1.5 hidden text-xs font-medium text-black/60 sm:grid ${
                          temVolta ? "grid-cols-3" : "grid-cols-2"
                        }`}
                      >
                        <span>Saindo de</span>
                        <span className="pl-3">Destino no Japão</span>
                        {temVolta && <span className="pl-3">Volta saindo de</span>}
                      </div>
                      <div
                        className={`grid grid-cols-1 overflow-hidden rounded-xl border bg-white ${temVolta ? "sm:grid-cols-3" : "sm:grid-cols-2"} ${
                          erroTrecho ? "border-red-400" : "border-black/15"
                        } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                      >
                        <label className={celula}>
                          <span className={rotuloMobile}>Saindo de</span>
                          <select value={origem} onChange={(e) => setOrigem(e.target.value)} onBlur={() => tocar("origem")} className={classeSelectCaixa}>
                            <option value="">Saindo de</option>
                            {ORIGENS.map((o) => (
                              <option key={o.id} value={o.id}>{o.nome}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </label>
                        <label className={celula}>
                          <span className={rotuloMobile}>Destino no Japão</span>
                          <select value={destino} onChange={(e) => setDestino(e.target.value)} onBlur={() => tocar("destino")} className={classeSelectCaixa}>
                            <option value="">Destino no Japão</option>
                            {DESTINOS.map((d) => (
                              <option key={d.id} value={d.id}>{d.nome}</option>
                            ))}
                          </select>
                          <IconeSeta />
                        </label>
                        {temVolta && (
                          <label className={celula}>
                            <span className={rotuloMobile}>Volta saindo de</span>
                            <select value={voltaDe} disabled={!destino} onChange={(e) => setDestinoVolta(e.target.value)} className={classeSelectCaixa}>
                              {!destino && <option value="">Escolha o destino</option>}
                              {DESTINOS.map((d) => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                        )}
                      </div>
                      {erroTrecho && <p className="mt-1.5 text-xs text-red-600">{erroTrecho}</p>}
                      {origem === "OUTRA" && (
                        <input
                          type="text"
                          value={origemOutra}
                          onChange={(e) => setOrigemOutra(e.target.value)}
                          onBlur={() => tocar("origem")}
                          placeholder="Qual cidade?"
                          className={`${classeInput(false)} mt-2`}
                        />
                      )}
                    </div>

                    {/* Datas */}
                    <div className="mt-4">
                      <div className={`mb-1.5 hidden text-xs font-medium text-black/60 sm:grid ${temVolta ? "grid-cols-2" : "grid-cols-1"}`}>
                        <span>Data de ida</span>
                        {temVolta && <span className="pl-3">Data de volta</span>}
                      </div>
                      <div
                        className={`grid overflow-hidden rounded-xl border bg-white ${temVolta ? "grid-cols-2" : "grid-cols-1"} ${
                          erroDatas ? "border-red-400" : "border-black/15"
                        } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                      >
                        <label className="relative block min-w-0">
                          <span className={rotuloMobile}>Ida</span>
                          <input
                            type="date"
                            min={hojeISO()}
                            value={dataIda}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDataIda(v);
                              if (v && dataVolta && dataVolta < v) setDataVolta(v);
                            }}
                            onBlur={() => tocar("dataIda")}
                            className={classeDataCaixa}
                          />
                        </label>
                        {temVolta && (
                          <label className="relative block min-w-0 border-l border-black/10">
                            <span className={rotuloMobile}>Volta</span>
                            <input
                              type="date"
                              min={dataIda || hojeISO()}
                              value={dataVolta}
                              onChange={(e) => setDataVolta(e.target.value)}
                              onBlur={() => tocar("dataVolta")}
                              className={classeDataCaixa}
                            />
                          </label>
                        )}
                      </div>
                      {erroDatas && <p className="mt-1.5 text-xs text-red-600">{erroDatas}</p>}
                    </div>

                    {/* Passageiros + avançar */}
                    <div className="mt-5 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="divide-y divide-black/[0.06] sm:max-w-sm">
                        <Contador rotulo="Adultos" ajuda="12 anos ou mais" valor={adultos} min={1} onChange={setAdultos} />
                        <Contador rotulo="Crianças" ajuda="2 a 11 anos" valor={criancas} min={0} onChange={setCriancas} />
                        <Contador rotulo="Bebês" ajuda="Até 2 anos, no colo" valor={bebes} min={0} onChange={setBebes} />
                        {mostrarErro("bebes") && <p className="pt-1.5 text-xs text-red-600">{mostrarErro("bebes")}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Ver cabines
                      </button>
                    </div>
                  </div>

                  {/* Diferenciais — o conteúdo da antiga /passagens, compacto. */}
                  <div className="mt-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Passagem comprada com a Ajisai</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {DIFERENCIAIS_AEREO.map((d) => (
                        <div key={d.titulo} className="flex gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6ec3d9]/20">
                            <Image src={d.imagem} alt="" width={44} height={44} className="h-8 w-8 object-contain" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-[#0A2540]">{d.titulo}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-black/60">{d.texto}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — CABINE ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha a cabine
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Valor de referência por passageiro, {temVolta ? "ida e volta" : "ida"}, para{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPassageiros}
                    </button>
                    . A tarifa final vem na cotação.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {CABINES.map((c) => {
                      const ativo = cabine === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setCabine(c.key)}
                          aria-pressed={ativo}
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition sm:p-5 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="block pr-8 text-[15px] font-medium text-black">{c.nome}</span>
                          <span className="mt-0.5 block text-xs text-black/55">{c.perfil}</span>
                          <span className={`${inter.className} mt-3 block text-sm font-semibold tabular-nums text-[#0A2540]`}>
                            {formatUSD(referenciaUSD(c.key))}
                            <span className="text-xs font-normal text-black/45"> por passageiro</span>
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

                  <div className="mt-8 grid gap-5 border-t border-black/10 pt-6 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Companhia preferida</span>
                      <span className="relative block">
                        <select
                          value={companhia}
                          onChange={(e) => setCompanhia(e.target.value)}
                          className="h-12 w-full appearance-none rounded-xl border border-black/15 bg-white pl-4 pr-10 text-base text-black focus:border-[#2f80c9] focus:outline-none focus:ring-1 focus:ring-[#2f80c9] md:text-[15px]"
                        >
                          <option value="">Sem preferência</option>
                          {COMPANHIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <IconeSeta />
                      </span>
                    </label>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 sm:mt-6">
                      <input
                        type="checkbox"
                        checked={datasFlexiveis}
                        onChange={(e) => setDatasFlexiveis(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                      />
                      <span className="text-sm text-black/85">
                        Tenho flexibilidade de até 3 dias nas datas
                        <span className="block text-xs text-black/50">Ajuda a encontrar tarifas e conexões melhores.</span>
                      </span>
                    </label>
                  </div>
                </section>
              )}

              {/* ── ETAPA 3 — DADOS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para enviar a cotação e, depois da aprovação, emitir as passagens.</p>
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
                      <Campo rotulo="Nomes dos passageiros (opcional)" ajuda="Como no passaporte. Pode enviar depois, antes da emissão.">
                        <textarea
                          value={nomesPassageiros}
                          onChange={(e) => setNomesPassageiros(e.target.value)}
                          rows={3}
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Programa de milhas, preferência de horário, assento ou refeição especial."
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
                        rotulo: "Voos",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <div className="space-y-1">
                            <p>
                              <span className="text-black/55">Ida · {formatarDataCurta(dataIda)} · </span>
                              {textoOrigem} → {nomeDestino(destino)}
                            </p>
                            {temVolta && (
                              <p>
                                <span className="text-black/55">Volta · {formatarDataCurta(dataVolta)} · </span>
                                {nomeDestino(voltaDe)} → {textoOrigem}
                              </p>
                            )}
                            <p className="text-black/55">{textoPassageiros}</p>
                          </div>
                        ),
                      },
                      {
                        rotulo: "Cabine",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <div className="space-y-1">
                            <p>
                              {nomeCabine} <span className="text-black/50">· {formatUSD(porPassageiroUSD)} por passageiro (referência)</span>
                            </p>
                            <p className="text-black/55">
                              {companhia || "Sem preferência de companhia"}
                              {datasFlexiveis && " · datas flexíveis (±3 dias)"}
                            </p>
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
                        <p className="mt-0.5 text-xs text-black/50">Valor de referência. A tarifa final vem na cotação.</p>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições das passagens aéreas"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosPassagens />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições das passagens aéreas.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && (
                    <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar a cotação.</p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe envia a cotação e combina a forma de pagamento com você pelo
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
                  {cabine ? `${nomeCabine} · ` : ""}
                  {totalPassageiros} {totalPassageiros === 1 ? "passageiro" : "passageiros"}
                  {dataIda && !errosViagem.dataIda && ` · ${formatarDiaMes(dataIda)}`}
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
