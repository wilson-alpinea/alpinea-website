"use client";

// Ajisai Shopping — página de produto no mesmo template do Transporte
// Privado, Hotéis, Guia etc. (pedido do Wilson, 30/set/2026: "novo hero
// para ajisai shopping"). Antes era só um popup em /produtos
// (ServicoAvulsoModal). Checkout manual: o envio registra o pedido no CRM
// (/api/ajisai-shopping-selfservice) e a equipe combina tudo pelo WhatsApp.
//
// 5 etapas: 1 Viagem (período) → 2 Compras (o que procura e
// quanto pretende gastar) → 3 Dias (quando e em que cidade) → 4 Dados →
// 5 Revisão (termos numa caixa na página).
//
// Preço: comissão de COMISSAO_AJISAI_SHOPPING_PCT (20%) sobre o valor das
// compras feitas com o acompanhamento — sem diária. Desde 06/out/2026 a
// página não estima comissão sobre orçamento; o total mostrado é só a
// referência dos itens de interesse escolhidos nos catálogos.

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { COMISSAO_AJISAI_SHOPPING_PCT } from "../../components/CustomPackageCard";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import { CATALOGOS_AJISAI_SHOPPING, chaveItemCatalogo } from "../../lib/catalogoAjisaiShopping";
import { JPY_POR_USD_REFERENCIA } from "../../lib/servicosAdicionaisCatalogo";
import {
  inter,
  IconeResumo,
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

const ETAPAS = ["Viagem", "Compras", "Dias", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4 | 5;

const MAX_DIAS = 45;
const COMISSAO_PCT = Math.round(COMISSAO_AJISAI_SHOPPING_PCT * 100);

const CATEGORIAS = [
  "Relógios",
  "Câmeras e lentes",
  "Bolsas e moda",
  "Joias",
  "Facas japonesas",
  "Eletrônicos",
  "Cosméticos",
  "Arte, cerâmica e antiguidades",
  "Itens vintage e colecionáveis",
  "Outros",
];

// Wilson, 06/out/2026: "simplificar pra Tokyo, Osaka, Kyoto e Kobe" e
// "20% sobre R$ 60.000, remover isso" (saiu a faixa de orçamento e a
// estimativa de comissão) + "não tem número de pessoas, é só o produto".
const CIDADES = ["Tóquio", "Osaka", "Kyoto", "Kobe"];

const DESTAQUES = [
  "Lojas certas para o que você procura, com tradução e negociação",
  "Apoio com tax free, envio e logística das compras",
  "Sem diária: comissão só sobre o que você comprar",
];

function TextoTermosShopping() {
  return (
    <>
      <p className="font-medium text-black/80">Serviço</p>
      <p className="mt-1">
        Uma pessoa da equipe Ajisai acompanha o grupo nas lojas combinadas, com tradução, negociação e apoio logístico. Os
        dias, cidades e lojas são combinados com antecedência pelo WhatsApp.
      </p>
      <p className="mt-3 font-medium text-black/80">Comissão</p>
      <p className="mt-1">
        A Ajisai cobra {COMISSAO_PCT}% sobre o valor das compras feitas com o acompanhamento, calculada sobre o que for
        efetivamente comprado.
      </p>
      <p className="mt-3 font-medium text-black/80">Catálogos</p>
      <p className="mt-1">
        Os itens e preços dos catálogos são referências públicas das lojas parceiras, em ienes e tax-free (sem o imposto de
        consumo de 10%), e mudam diariamente. Disponibilidade e preço são confirmados na loja no dia da compra.
      </p>
      <p className="mt-3 font-medium text-black/80">Compras</p>
      <p className="mt-1">
        As compras são pagas diretamente às lojas pelo cliente. Preço, disponibilidade, garantia, trocas e devoluções seguem
        as regras de cada loja e do fabricante.
      </p>
      <p className="mt-3 font-medium text-black/80">Bagagem, tax free e alfândega</p>
      <p className="mt-1">
        Apoiamos com o processo de tax free e com envio ou despacho das compras, mas limites de bagagem, impostos de
        importação e declarações à alfândega no retorno são responsabilidade do cliente.
      </p>
      <p className="mt-3 font-medium text-black/80">Pagamento</p>
      <p className="mt-1">
        Nenhum valor é cobrado nesta página. Forma de pagamento da comissão é combinada com a nossa equipe pelo WhatsApp.
      </p>
    </>
  );
}

export default function AjisaiShoppingPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  // Itens de interesse escolhidos nos catálogos.
  const [itensInteresse, setItensInteresse] = useState<string[]>([]);
  const [catalogoAberto, setCatalogoAberto] = useState<string | null>(CATALOGOS_AJISAI_SHOPPING[0]?.categoria ?? null);

  const [categorias, setCategorias] = useState<string[]>([]);
  // Dias com acompanhamento → cidade de cada dia.
  const [diasGuia, setDiasGuia] = useState<Record<string, string>>({});

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
  const diasViagem = periodoValido ? diasEntre(dataChegada, dataPartida) : [];

  const diasEscolhidos = diasViagem.filter((d) => d in diasGuia);
  const diasForaDoPeriodo = Object.keys(diasGuia).filter((d) => !diasViagem.includes(d));
  // Referência dos itens de interesse (pagos direto à loja) — ienes → US$ → R$.
  const itensCatalogoEscolhidos = CATALOGOS_AJISAI_SHOPPING.flatMap((c) => c.itens).filter((i) => itensInteresse.includes(chaveItemCatalogo(i)));
  const referenciaJPY = itensCatalogoEscolhidos.reduce((s, i) => s + i.precoJPY, 0);
  const totalUSD = referenciaJPY / JPY_POR_USD_REFERENCIA;
  const totalBRL = totalUSD * cambioCotacao;

  const avisos: string[] = [];
  if (diasEscolhidos.some((d) => d === dataChegada || d === dataPartida)) {
    avisos.push("Compras no dia de chegada ou de partida — o tempo útil depende do horário do voo; combinamos pelo WhatsApp.");
  }
  if (diasEscolhidos.some((d) => diasGuia[d] === "Outra")) avisos.push("Cidade “Outra” — informe qual nas observações.");
  if (itensCatalogoEscolhidos.length > 0) {
    avisos.push("Compras de valor alto: verifique a cota de isenção e a declaração à alfândega no retorno ao Brasil.");
  }

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

  const etapa1Ok = periodoValido;
  const etapa2Ok = categorias.length > 0 || itensInteresse.length > 0;
  const etapa3Ok = diasEscolhidos.length > 0;
  const etapa4Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok, etapa4Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && etapa4Ok && termosAceitos;

  const textoPeriodo = periodoValido
    ? `${formatarDiaMes(dataChegada)} a ${formatarDiaMes(dataPartida)} · ${diasViagem.length} ${diasViagem.length === 1 ? "dia" : "dias"}`
    : "";
  const textoItens = itensInteresse.length ? `${itensInteresse.length} ${itensInteresse.length === 1 ? "item de interesse" : "itens de interesse"}` : "";

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
      ? { rotulo: "Continuar", ativo: true, falta: etapa1Ok ? null : "Informe chegada e partida para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Conte o que procura", ativo: false, falta: "Escolha uma categoria ou um item do catálogo para continuar" }
        : etapa === 3
          ? etapa3Ok
            ? { rotulo: "Continuar", ativo: true, falta: null }
            : { rotulo: "Escolha os dias", ativo: false, falta: "Escolha ao menos um dia de compras" }
          : etapa === 4
            ? { rotulo: "Continuar", ativo: etapa4Ok, falta: etapa4Ok ? null : "Complete seus dados para continuar" }
            : {
                rotulo: status === "enviando" ? "Enviando…" : "Solicitar Ajisai Shopping",
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
      const resposta = await fetch("/api/ajisai-shopping-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataChegada,
          dataPartida,
          itensInteresse: itensCatalogoEscolhidos.map((i) => `${chaveItemCatalogo(i)} — ¥${i.precoJPY.toLocaleString("pt-BR")} (tax-free)`),
          categorias,
          comissaoPct: COMISSAO_PCT,
          dias: diasEscolhidos.map((d) => ({ data: d, cidade: diasGuia[d] })),
          resumo: resumoDias,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir o Ajisai Shopping pelo site da Ajisai — ${listarNatural(categorias)}; ${resumoDias}.${nome ? ` Meu nome é ${nome}.` : ""}`;

  const totalExibidoUSD: number | null = referenciaJPY > 0 ? totalUSD : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seu Ajisai Shopping</p>
      <p className="mt-2 text-sm text-black/80">
        {textoPeriodo || <span className="text-black/45">Período a definir</span>}
        {textoItens && <span className="text-black/50"> · {textoItens}</span>}
      </p>
      {categorias.length > 0 ? (
        <p className="mt-1 text-sm text-black/80">{listarNatural(categorias)}</p>
      ) : (
        <p className="mt-1 text-sm text-black/45">Nada escolhido ainda</p>
      )}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {diasEscolhidos.length === 0 ? (
          <p className="text-sm text-black/45">Nenhum dia escolhido</p>
        ) : (
          <div className="flex items-center gap-2.5 text-sm text-black/80">
            <IconeResumo src="/images/icone-servico-ajisai-shopping.png" />
            <span className="min-w-0">
              <span className="block">
                {diasEscolhidos.length} {diasEscolhidos.length === 1 ? "dia" : "dias"} de compras
              </span>
              <span className="block text-xs text-black/50">{diasEscolhidos.map((d) => `${formatarDiaMes(d)} ${diasGuia[d]}`).join(" · ")}</span>
            </span>
          </div>
        )}
        {itensCatalogoEscolhidos.map((i) => (
          <div key={chaveItemCatalogo(i)} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 text-black/70">
              {i.marca} {i.modelo} <span className="text-black/45">{i.referencia}</span>
            </span>
            <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>¥{i.precoJPY.toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>
      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-black/50">Referência dos itens</p>
        <p
          key={Math.round(totalExibidoUSD ?? 0)}
          className={`${inter.className} mt-0.5 rounded-md text-3xl font-bold tabular-nums tracking-[-0.02em] text-[#0A2540]`}
          style={totalExibidoUSD !== null ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
        >
          {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
        </p>
        {totalExibidoUSD !== null && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>
            ≈ {formatBRL(totalBRL)} · tax-free, pago direto à loja · comissão de {COMISSAO_PCT}% sobre o que for comprado
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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Ajisai Shopping</p>
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
            Nossa equipe combina lojas, dias e horários com você pelo WhatsApp — em geral no mesmo dia útil.
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
                  src="/images/produtos/ajisai-shopping-header.jpg"
                  alt="Família sendo atendida em uma loja de relógios e câmeras no Japão"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[50%_35%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Ajisai Shopping</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Compras no Japão com quem conhece cada loja
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
                    Quando você estará no Japão?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Informe o período no Japão. Depois você conta o que procura e em quais dias quer o acompanhamento.</p>

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
                        {diasViagem.length > 0 ? `${diasViagem.length} ${diasViagem.length === 1 ? "dia" : "dias"} no Japão.` : "Os dias de compras ficam dentro desse período."}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end border-t border-black/[0.08] pt-4">
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2">
                    {DESTAQUES.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-black/65">
                        <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2f80c9]" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── ETAPA 2 — COMPRAS ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    O que você procura?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Marque quantos quiser — usamos isso para montar o roteiro de lojas.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {CATEGORIAS.map((c) => {
                      const ativo = categorias.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => setCategorias((atual) => (ativo ? atual.filter((x) => x !== c) : [...atual, c]))}
                          className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm transition ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06] font-medium text-[#0A2540]" : "border-black/15 text-black/70 hover:border-black/35"
                          }`}
                        >
                          {ativo && <IconeCheck className="h-3.5 w-3.5 text-[#2f80c9]" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  {/* Catálogos integrados (Wilson, 06/out/2026) — top 10 por categoria. */}
                  <div className="mt-8 border-t border-black/10 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Catálogos — os mais vendidos</p>
                    <p className="mt-1 text-xs text-black/50">
                      Marque os itens que te interessam e nós conferimos estoque e preço antes do dia das compras. Preços de
                      referência em ienes, tax-free.
                    </p>
                    <div className="mt-3 space-y-3">
                      {CATALOGOS_AJISAI_SHOPPING.filter((c) => c.itens.length > 0).map((c) => {
                        const aberto = catalogoAberto === c.categoria;
                        return (
                          <div key={c.categoria} className="rounded-xl border border-black/10">
                            <button
                              type="button"
                              onClick={() => setCatalogoAberto(aberto ? null : c.categoria)}
                              aria-expanded={aberto}
                              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                            >
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-black">{c.categoria} · Top {c.itens.length}</span>
                                <span className="block text-xs text-black/50">{c.loja}</span>
                              </span>
                              <span className="text-xs font-medium text-[#1f6fb8]">{aberto ? "Fechar" : "Ver"}</span>
                            </button>
                            {aberto && (
                              <div className="border-t border-black/[0.06] px-4 pb-3">
                                <ol className="divide-y divide-black/[0.05]">
                                  {c.itens.map((item, idx) => {
                                    const chave = chaveItemCatalogo(item);
                                    const marcado = itensInteresse.includes(chave);
                                    return (
                                      <li key={chave}>
                                        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 py-1.5">
                                          <input
                                            type="checkbox"
                                            checked={marcado}
                                            onChange={() =>
                                              setItensInteresse((atual) => (marcado ? atual.filter((x) => x !== chave) : [...atual, chave]))
                                            }
                                            className="h-4 w-4 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                                          />
                                          <span className={`${inter.className} w-5 shrink-0 text-xs font-semibold tabular-nums text-black/40`}>{idx + 1}</span>
                                          <span className="min-w-0 flex-1">
                                            <span className="block text-sm text-black/85">
                                              {item.marca} {item.modelo} <span className="text-black/50">Ref. {item.referencia}</span>
                                            </span>
                                            <span className="block text-xs text-black/50">{item.detalhe}</span>
                                          </span>
                                          <span className={`${inter.className} shrink-0 text-right text-sm font-semibold tabular-nums text-[#0A2540]`}>
                                            ¥{item.precoJPY.toLocaleString("pt-BR")}
                                            <span className="block text-[10px] font-normal text-black/45">
                                              ≈ {formatBRL((item.precoJPY / JPY_POR_USD_REFERENCIA) * cambioCotacao)}
                                            </span>
                                          </span>
                                        </label>
                                      </li>
                                    );
                                  })}
                                </ol>
                                <p className="mt-2 text-[11px] leading-4 text-black/45">
                                  {c.observacao} Fonte: catálogo da loja, atualizado em {c.atualizadoEm}.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                    Marque os dias com acompanhamento e a cidade de cada um. Período:{" "}
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
                                                </li>
                      );
                    })}
                  </ul>
                  {diasForaDoPeriodo.length > 0 && (
                    <p className="mt-2 text-xs text-black/50">Dias fora do novo período foram desconsiderados.</p>
                  )}

                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
                </section>
              )}

              {/* ── ETAPA 4 — DADOS ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para combinar as compras com você.</p>
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
                          placeholder="Marcas, modelos ou lojas que você já tem em mente."
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
                        rotulo: "Período",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <>
                            {textoPeriodo}

                          </>
                        ),
                      },
                      {
                        rotulo: "Compras",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <>
                            {listarNatural(categorias)}
                            {itensCatalogoEscolhidos.length > 0 && (
                              <span className="block text-black/55">
                                Interesse: {itensCatalogoEscolhidos.map((i) => `${i.marca} ${i.modelo} ${i.referencia}`).join(", ")}
                              </span>
                            )}
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
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-1.5">Referência dos itens</dt>
                      <dd>
                        <span className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>{formatUSD(totalUSD)}</span>
                        <span className={`${inter.className} ml-2 text-sm tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)}</span>
                        <p className="mt-0.5 text-xs text-black/50">
                          Itens de interesse, preço tax-free pago direto à loja. Comissão de {COMISSAO_PCT}% sobre o que for efetivamente comprado.
                        </p>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições do Ajisai Shopping"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosShopping />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições do Ajisai Shopping.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar o Ajisai Shopping.</p>}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe combina lojas, dias e a forma de pagamento com você pelo WhatsApp.
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
                  {diasEscolhidos.length > 0 ? `${diasEscolhidos.length} ${diasEscolhidos.length === 1 ? "dia" : "dias"} de compras` : "Referência dos itens"}
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
