"use client";

// Seguro Viagem ganhou página própria (antes era o SeguroViagemModal
// dentro de /produtos) — pedido do Wilson, 29/set/2026: "vamos trabalhar
// agora dentro da página de produtos > seguro viagem, iremos dar o mesmo
// tratamento que demos em JR Pass [...] aqui também será inserido o
// processo de pagamento self-service da Stone". Mesma moldura da página
// do JR Pass (barra de voltar fixa, topo com imagem, "Como funciona",
// passos numerados, termos com rolagem obrigatória e rodapé fixo com
// checklist + resumo + botão de pagamento Stone). Toda a lógica de
// negócio (seguradoras, faixas de idade, residência, roteiro, passagem)
// veio do modal antigo sem mudança de regra.
//
// Decisões do Wilson nesta mesma data (AskUserQuestion):
// - Preço: o valor calculado vira o preço final Ajisai, cobrado direto na
//   Stone (igual ao JR Pass) — por isso o texto de "valor de referência"
//   saiu da página. O servidor recalcula o valor antes de cobrar (ver
//   app/lib/precoSeguroViagem.ts e /api/seguro-viagem-selfservice).
// - Termos e condições: texto enviado pelo próprio Wilson (seção 8).
// - Imagem do topo e ícones do "Como funciona": provisórios, até ele
//   mandar as artes definitivas.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { formatBRL } from "../../hooks/useCambioUSD";
import { type FormaPagamentoEscolhida } from "../../lib/calculadoraCatalogoPublico";
import {
  IDADE_LIMITE_SEGURO,
  MULTIPLICADOR_ROTEIRO_MULTIDESTINO,
  calcularValorSeguroViagemBRL,
  diasEntreDatas,
} from "../../lib/precoSeguroViagem";
import {
  display,
  WHATSAPP_NUMBER,
  FormasPagamento,
  descricaoFormaPagamento,
  hojeISO,
  formatarDataBR,
  IconCheck,
} from "../page";
import { SEGURADORAS_VIAGEM, PAISES_ASIA_ADICIONAIS, type SeguradoraKey } from "./seguradoras";

// Fonte Inter só para valores em dinheiro — mesmo padrão do JR Pass
// (Wilson, 29/set/2026: "a fonte padrão de numeros deve ser INTER").
const inter = Inter({ subsets: ["latin"], weight: ["500", "700"] });

// Recomendação de seguradora por idade — pedido do Wilson, 25/set/2026:
// "affinity e MTA até 64 anos, acima de 64 anos GTA tem melhor preço".
const IDADE_RECOMENDACAO_GTA = 64;

// Ícones do "Como funciona" — enviados pelo Wilson em 29/set/2026
// ("novos icones para os passo a passo de seguro viagem"), substituindo
// os SVGs provisórios. Recortados com margem uniforme e salvos em 480px
// (fundo transparente) em public/images/produtos/.
const COMO_FUNCIONA = [
  {
    icone: "/images/produtos/seguro-passo-1-pedido.png",
    titulo: "Faça seu pedido",
    texto: "Escolha a seguradora, informe quem viaja e finalize o pagamento aqui no site.",
  },
  {
    icone: "/images/produtos/seguro-passo-2-apolice.png",
    titulo: "Receba a apólice",
    texto: "Emitimos a apólice com a seguradora e enviamos por e-mail e WhatsApp.",
  },
  {
    icone: "/images/produtos/seguro-passo-3-viagem.png",
    titulo: "Viaje protegido",
    texto: "A cobertura vale a partir da data de início indicada na apólice.",
  },
  {
    icone: "/images/produtos/seguro-passo-4-assistencia.png",
    titulo: "Acione quando precisar",
    texto: "Durante a viagem, fale direto com a central de atendimento da seguradora.",
  },
];

// Selo numérico dos passos — mesmo visual do JR Pass.
function TituloPasso({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">
        {numero}
      </span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-black">{titulo}</p>
    </div>
  );
}

const classeInput =
  "w-full min-w-0 rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none";
const classeInputData =
  "block min-h-[46px] w-full min-w-0 appearance-none rounded-lg border border-black/15 bg-white px-3 py-2.5 text-left text-sm text-black focus:border-[#2f80c9] focus:outline-none";

function classeOpcao(selecionado: boolean, alerta = false) {
  if (selecionado && alerta) return "border-amber-600 bg-amber-50 font-medium text-amber-800";
  if (selecionado) return "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]";
  return "border-black/15 text-black/70 hover:border-black/30";
}

export default function SeguroViagemPage() {
  const [seguradoraSelecionada, setSeguradora] = useState<SeguradoraKey | null>(null);
  const [numViajantes, setNumViajantes] = useState(1);
  const [idades, setIdades] = useState<(number | "")[]>([""]);
  // CPF e endereço de cada viajante — pedido do Wilson, 25/set/2026:
  // "precisa ter cpf e endereco de cada um dos passageiros, pra ser
  // preenchido na proxima etapa". Continua opcional aqui.
  const [cpfs, setCpfs] = useState<string[]>([""]);
  const [enderecos, setEnderecos] = useState<string[]>([""]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paisesAdicionais, setPaisesAdicionais] = useState<string[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);
  const [nome, setNome] = useState("");
  // Nome de quem paga, quando diferente do viajante principal — mesma
  // evidência de chargeback adotada no JR Pass (Wilson, 29/set/2026).
  const [nomeComprador, setNomeComprador] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  // Onde mora (Brasil / Japão = só GTA / outro país = bloqueado) e país de
  // destino — regras do Wilson, 25/set/2026 (ver histórico no modal antigo).
  const [moraEm, setMoraEm] = useState<"brasil" | "japao" | "outro" | null>(null);
  const [paisDestino, setPaisDestino] = useState<"brasil" | "japao" | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Passagem aérea (opcional) — pedido do Wilson, 25/set/2026.
  const [passagemComprada, setPassagemComprada] = useState<"sim" | "nao" | null>(null);
  const [numeroVoo, setNumeroVoo] = useState("");
  const [dataIdaVoo, setDataIdaVoo] = useState("");
  const [dataVoltaVoo, setDataVoltaVoo] = useState("");
  const [emitirPassagemAjisai, setEmitirPassagemAjisai] = useState(false);

  // Termos com rolagem obrigatória até o fim antes do aceite — mesmo
  // comportamento do JR Pass (Wilson, 28/set/2026).
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) setTermosRolados(true);
  }, []);

  function alternarPaisAdicional(pais: string) {
    setPaisesAdicionais((atual) =>
      atual.includes(pais) ? atual.filter((p) => p !== pais) : [...atual, pais],
    );
  }

  function ajustarNumViajantes(novo: number) {
    const quantidade = Math.max(1, Math.min(8, novo));
    setNumViajantes(quantidade);
    const ajustar = <T,>(atual: T[], vazio: T) => {
      const proximo = atual.slice(0, quantidade);
      while (proximo.length < quantidade) proximo.push(vazio);
      return proximo;
    };
    setIdades((atual) => ajustar<number | "">(atual, ""));
    setCpfs((atual) => ajustar(atual, ""));
    setEnderecos((atual) => ajustar(atual, ""));
  }

  const idadesNumericas = idades.filter((i): i is number => typeof i === "number");
  const idadesForaLimite = idadesNumericas.filter((i) => i > IDADE_LIMITE_SEGURO).length;
  const algumViajanteAcimaDe64 = idadesNumericas.some((i) => i > IDADE_RECOMENDACAO_GTA);
  const apenasGtaDisponivel = algumViajanteAcimaDe64 || moraEm === "japao";
  const residenciaBloqueada = moraEm === "outro";
  const dias = diasEntreDatas(dataInicio, dataFim);
  const roteiroSoDestino = paisesAdicionais.length === 0;
  const nomePaisDestino = paisDestino === "brasil" ? "Brasil" : "Japão";

  // Se a seguradora escolhida deixar de estar disponível (ex.: alguém
  // informou idade 65+ ou residência no Japão depois), a escolha deixa de
  // valer em vez de continuar ativa sem aparecer na tela.
  const seguradora =
    apenasGtaDisponivel && seguradoraSelecionada !== "gta" ? null : seguradoraSelecionada;

  const todasIdadesPreenchidas = idadesNumericas.length === numViajantes;
  const valorTotalBRL = todasIdadesPreenchidas
    ? calcularValorSeguroViagemBRL({ dias, idades: idadesNumericas, multidestino: !roteiroSoDestino })
    : null;
  const descricaoPagamentoEscolhido = descricaoFormaPagamento(formaPagamento, valorTotalBRL, dataInicio);
  const seguradoraEscolhida = SEGURADORAS_VIAGEM.find((s) => s.key === seguradora) ?? null;

  const formValido =
    !!seguradora &&
    (moraEm === "brasil" || moraEm === "japao") &&
    !!paisDestino &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    dias > 0 &&
    todasIdadesPreenchidas &&
    idadesForaLimite === 0 &&
    valorTotalBRL !== null &&
    valorTotalBRL > 0 &&
    termosAceitos;

  // Checklist do rodapé — mesma ordem em que os passos aparecem na página.
  const pendenciasFinalizar: string[] = [];
  if (!todasIdadesPreenchidas) pendenciasFinalizar.push("Preencha a idade de todos os viajantes.");
  if (idadesForaLimite > 0) {
    pendenciasFinalizar.push(
      `Viajante acima de ${IDADE_LIMITE_SEGURO} anos precisa de cotação direta — fale com a gente pelo WhatsApp.`,
    );
  }
  if (moraEm === null) pendenciasFinalizar.push("Informe onde você mora.");
  else if (residenciaBloqueada) {
    pendenciasFinalizar.push("Sua residência não é elegível pra esse seguro — veja o aviso no passo 2.");
  }
  if (!paisDestino) pendenciasFinalizar.push("Escolha o país de destino.");
  if (!dataInicio) pendenciasFinalizar.push("Preencha a data de início da viagem.");
  if (!dataFim) pendenciasFinalizar.push("Preencha a data de término da viagem.");
  if (dataInicio && dataFim && dias <= 0) {
    pendenciasFinalizar.push("A data de término precisa ser depois da data de início.");
  }
  if (!seguradora) pendenciasFinalizar.push("Escolha a seguradora.");
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\S+@\S+\.\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do Seguro Viagem."
        : "Leia os termos e condições do Seguro Viagem até o fim pra poder aceitá-los.",
    );
  }

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/seguro-viagem-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguradora,
          dataInicio,
          dataFim,
          dias,
          idades: idadesNumericas,
          cpfs: cpfs.map((c) => c.trim()),
          enderecos: enderecos.map((e) => e.trim()),
          paises: [nomePaisDestino, ...paisesAdicionais],
          paisDestino: nomePaisDestino,
          valorTotalBRL,
          formaPagamento: descricaoPagamentoEscolhido || null,
          nome,
          nomeComprador,
          email,
          whatsapp,
          moraEm,
          paisResidencia:
            moraEm === "brasil" ? "Brasil" : moraEm === "japao" ? "Japão (residente)" : "",
          observacoes,
          passagemComprada,
          numeroVoo: passagemComprada === "sim" ? numeroVoo : "",
          dataIdaVoo: passagemComprada === "sim" ? dataIdaVoo : "",
          dataVoltaVoo: passagemComprada === "sim" ? dataVoltaVoo : "",
          emitirPassagemAjisai: passagemComprada === "nao" ? emitirPassagemAjisai : false,
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      // Com a Stone/Pagar.me configurada, a API devolve o link do
      // checkout hospedado e o cliente vai direto pagar (mesmo fluxo do
      // JR Pass). Sem a integração, cai na tela "pedido registrado".
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

  const mensagemWhatsapp = `Olá! Acabei de fazer o pedido do Seguro Viagem${
    seguradoraEscolhida ? ` (${seguradoraEscolhida.nome})` : ""
  } pelo site da Ajisai${nome ? ` — meu nome é ${nome}` : ""}.`;

  // Altura real do rodapé fixo — mesmo padrão do JR Pass, pro fim da
  // página não ficar escondido atrás dele.
  const rodapeRef = useRef<HTMLDivElement | null>(null);
  const [checklistAberto, setChecklistAberto] = useState(false);
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
      // Mesmos ajustes de mobile/iOS do JR Pass (29/set/2026): sem
      // rolagem lateral e campos com 16px no celular (evita o zoom
      // automático do Safari ao tocar num campo).
      className="min-h-screen overflow-x-clip bg-white pt-14 text-black [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm"
      style={status !== "enviado" ? { paddingBottom: alturaRodape + 56 } : undefined}
    >
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
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>Seguro Viagem</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl p-5 md:p-8">
        {status === "enviado" ? (
          <div className="py-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
            <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
              Recebemos seu pedido de Seguro Viagem
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/75">
              Nossa equipe confere os dados com a {seguradoraEscolhida?.nome ?? "seguradora escolhida"} e te
              envia o link de pagamento (Pix ou cartão) pelo WhatsApp e por e-mail. Depois do pagamento,
              emitimos a apólice e enviamos pra você.
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
            {/* Banner hero — pedido do Wilson, 29/set/2026: título "dentro do
                banner hero, algo na linha desse template" (referência: banner
                com fundo escuro à esquerda, texto branco, foto aparecendo à
                direita com degradê). A foto (casal em Kyoto, enviada no mesmo
                dia) tem o casal no centro — por isso ela ocupa só a parte
                direita do banner no desktop (~62%) e o degradê azul-marinho da
                marca (#0A2540, mesmo da barra do topo) cobre a emenda; assim o
                texto fica sobre o fundo liso e não em cima das pessoas. No
                celular a foto fica em cima e o texto embaixo, com degradê
                vertical ligando os dois. */}
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-64 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[62%]">
                <Image
                  src="/images/produtos/seguro-viagem-header.jpg"
                  alt="Casal caminhando por uma rua tradicional de Kyoto"
                  fill
                  priority
                  sizes="(min-width: 640px) 660px, 100vw"
                  className="object-cover object-[50%_35%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-12 px-5 pb-8 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[46%] sm:flex-col sm:justify-center sm:px-10 sm:py-12 md:min-h-[380px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Seguro Viagem</p>
                <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>
                  Cobertura médica e assistência para toda a viagem
                </h1>
              </div>
            </section>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-black/75">
              Trabalhamos com três seguradoras parceiras — Affinity, GTA e MTA. Escolha a sua, informe quem
              viaja e as datas, e finalize a compra aqui mesmo: a apólice é emitida pela seguradora e enviada
              por e-mail e WhatsApp.
            </p>

            <div className="mt-8 rounded-2xl bg-[#eef6fb] p-5 sm:p-6">
              <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-[#1c6ea8]">
                Como funciona
              </p>
              <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
                {COMO_FUNCIONA.map((passo, index) => (
                  <div key={passo.titulo} className="flex min-w-0 flex-col items-center text-center">
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

            {/* 1 — Viajantes (idade vem antes da seguradora: 65+ filtra só GTA). */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={1} titulo="Viajantes" />
              <p className="mt-1 text-sm text-[#1C1C1A]/70">
                Quantas pessoas viajam e a idade de cada uma — o valor depende da idade.
              </p>
              <div className="mt-5 max-w-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ajustarNumViajantes(numViajantes - 1)}
                    aria-label="Diminuir viajantes"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                  >
                    −
                  </button>
                  <span className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/15 bg-black/[0.02] text-sm text-black">
                    {numViajantes} {numViajantes === 1 ? "viajante" : "viajantes"}
                  </span>
                  <button
                    type="button"
                    onClick={() => ajustarNumViajantes(numViajantes + 1)}
                    aria-label="Aumentar viajantes"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/15 text-black transition hover:border-black/30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {idades.map((idade, index) => (
                  <div key={index} className="rounded-xl border border-black/10 bg-black/[0.015] p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/60">Viajante {index + 1}</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-[120px_1fr_2fr]">
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black">Idade</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={120}
                          value={idade}
                          onChange={(e) => {
                            const valor =
                              e.target.value === "" ? "" : Math.max(0, Math.min(120, Number(e.target.value)));
                            setIdades((atual) => atual.map((v, i) => (i === index ? valor : v)));
                          }}
                          className={classeInput}
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                          CPF (opcional agora)
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cpfs[index] ?? ""}
                          onChange={(e) => {
                            const valor = e.target.value;
                            setCpfs((atual) => atual.map((v, i) => (i === index ? valor : v)));
                          }}
                          placeholder="000.000.000-00"
                          className={classeInput}
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                          Endereço (opcional agora)
                        </span>
                        <input
                          type="text"
                          value={enderecos[index] ?? ""}
                          onChange={(e) => {
                            const valor = e.target.value;
                            setEnderecos((atual) => atual.map((v, i) => (i === index ? valor : v)));
                          }}
                          placeholder="Rua, número, cidade, CEP"
                          className={classeInput}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-black/60">
                CPF e endereço são necessários pra emitir a apólice — pode preencher agora ou confirmar
                com a nossa equipe antes da emissão.
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icone-ssl-lock.png" alt="" className="h-6 w-6 shrink-0 object-contain" />
                <p className="text-sm leading-5 text-black/70">
                  Conexão segura (SSL) — seus dados trafegam criptografados.
                </p>
              </div>
              {idadesForaLimite > 0 && (
                <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-800">
                  {idadesForaLimite === 1 ? "Um viajante tem" : `${idadesForaLimite} viajantes têm`} mais de{" "}
                  {IDADE_LIMITE_SEGURO} anos — nesse caso a cotação é feita direto com a seguradora.{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      "Olá! Quero cotar um Seguro Viagem para viajante acima de 82 anos.",
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-2"
                  >
                    Fale com a gente pelo WhatsApp
                  </a>
                  .
                </p>
              )}
            </div>

            {/* 2 — Residência e destino */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={2} titulo="Residência e destino" />
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">Onde você mora</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMoraEm("brasil");
                        setPaisDestino((atual) => atual ?? "japao");
                      }}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${classeOpcao(moraEm === "brasil")}`}
                    >
                      Brasil
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoraEm("japao");
                        setPaisDestino((atual) => atual ?? "brasil");
                      }}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${classeOpcao(moraEm === "japao")}`}
                    >
                      Japão
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoraEm("outro")}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${classeOpcao(moraEm === "outro", true)}`}
                    >
                      Outro país
                    </button>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">País de destino</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPaisDestino("japao")}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${classeOpcao(paisDestino === "japao")}`}
                    >
                      Japão
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaisDestino("brasil")}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition ${classeOpcao(paisDestino === "brasil")}`}
                    >
                      Brasil
                    </button>
                  </div>
                </div>
              </div>

              {residenciaBloqueada && (
                <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-800">
                  Esse seguro viagem é pra quem ainda está no Brasil antes de embarcar (ou mora no Japão) —
                  como você mora em outro país, não conseguimos emitir essa apólice por aqui. Fale com a
                  gente pelo WhatsApp pra ver as opções pra sua situação.
                </p>
              )}

              {/* Roteiro — destino obrigatório + outros países da Ásia
                  opcionais (+12% de cobertura multidestino). */}
              <div className="mt-6">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black">
                  Outros países no roteiro (opcional)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="flex items-center gap-1.5 rounded-full border border-[#2f80c9] bg-[#2f80c9]/10 px-3 py-1.5 text-xs font-medium text-[#1c6ea8]">
                    <IconCheck className="h-3 w-3" />
                    {nomePaisDestino}
                  </span>
                  {PAISES_ASIA_ADICIONAIS.map((pais) => {
                    const selecionado = paisesAdicionais.includes(pais);
                    return (
                      <button
                        key={pais}
                        type="button"
                        onClick={() => alternarPaisAdicional(pais)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${classeOpcao(selecionado)}`}
                      >
                        {selecionado ? "✓ " : "+ "}
                        {pais}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-black/60">
                  {roteiroSoDestino
                    ? `Viagem só pro ${nomePaisDestino} — plano de destino único.`
                    : `Roteiro com mais ${paisesAdicionais.length} ${
                        paisesAdicionais.length === 1 ? "país" : "países"
                      } — precisa de cobertura multidestino (+${Math.round(
                        (MULTIPLICADOR_ROTEIRO_MULTIDESTINO - 1) * 100,
                      )}%, já incluído no valor).`}
                </p>
              </div>
            </div>

            {/* 3 — Datas da viagem */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={3} titulo="Datas da viagem" />
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">Início da viagem</span>
                  <input
                    type="date"
                    value={dataInicio}
                    min={hojeISO()}
                    onChange={(e) => {
                      const novoInicio = e.target.value;
                      setDataInicio(novoInicio);
                      if (dataFim && novoInicio && dataFim < novoInicio) setDataFim("");
                    }}
                    className={classeInputData}
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">Término da viagem</span>
                  <input
                    type="date"
                    value={dataFim}
                    min={dataInicio || hojeISO()}
                    onChange={(e) => setDataFim(e.target.value)}
                    className={classeInputData}
                  />
                </label>
              </div>
              {dataInicio && dataFim && dias === 0 ? (
                <p className="mt-2 text-[11px] text-red-600">A data de término precisa ser depois da data de início.</p>
              ) : dias > 0 ? (
                <p className="mt-2 text-[11px] leading-5 text-black/60">
                  {dias} {dias === 1 ? "dia" : "dias"} de cobertura ({formatarDataBR(dataInicio)} a{" "}
                  {formatarDataBR(dataFim)}).
                </p>
              ) : null}
            </div>

            {/* 4 — Seguradora */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={4} titulo="Escolha a seguradora" />
              <p className="mt-1 text-sm text-[#1C1C1A]/70">
                O valor é o mesmo nas três — escolha pela seguradora de sua preferência.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {SEGURADORAS_VIAGEM.filter((s) => !apenasGtaDisponivel || s.key === "gta").map((s) => {
                  const selecionado = seguradora === s.key;
                  return (
                    <div
                      key={s.key}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selecionado}
                      onClick={() => setSeguradora(s.key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSeguradora(s.key);
                        }
                      }}
                      className={`relative flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border p-5 text-left shadow-[0_18px_45px_-14px_rgba(37,99,235,0.55)] transition-colors duration-150 hover:shadow-[0_22px_55px_-12px_rgba(37,99,235,0.65)] ${
                        selecionado ? "border-[#252522] bg-[#FAF9F6]" : "border-[#E4E1DC] bg-white hover:border-black/25"
                      }`}
                    >
                      {selecionado && (
                        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#252522] px-2.5 py-1 text-[10px] font-medium text-white">
                          <IconCheck className="h-3 w-3" />
                          Selecionado
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo} alt={s.nome} className="h-11 w-auto max-w-[140px] object-contain object-left" />
                      {s.key === "gta" && algumViajanteAcimaDe64 && (
                        <span className="mt-3 inline-flex w-fit items-center rounded-full bg-emerald-600/10 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                          Recomendado para 65+ anos
                        </span>
                      )}
                      {(s.key === "affinity" || s.key === "mta") &&
                        !algumViajanteAcimaDe64 &&
                        idadesNumericas.length > 0 && (
                          <span className="mt-3 inline-flex w-fit items-center rounded-full bg-[#2f80c9]/10 px-2.5 py-1 text-[10px] font-medium text-[#1c6ea8]">
                            Boa opção até 64 anos
                          </span>
                        )}
                      <p className="mt-3 flex-1 text-sm leading-6 text-[#1C1C1A]">{s.descricao}</p>
                      {s.observacao && <p className="mt-2 text-[11px] leading-5 text-black/60">{s.observacao}</p>}

                      <div className="mt-4 border-t border-[#E4E1DC] pt-4">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#77736D]">Tipos de plano</p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {s.tiposPlano.map((tipo) => (
                            <li
                              key={tipo}
                              className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[11px] leading-tight text-black/70"
                            >
                              {tipo}
                            </li>
                          ))}
                        </ul>
                        {s.termosUrl && (
                          <a
                            href={s.termosUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#1c6ea8] underline decoration-[#1c6ea8]/40 underline-offset-2 hover:text-[#2f80c9]"
                          >
                            {s.termosLabel} ↗
                          </a>
                        )}
                        {s.termosNota && <p className="mt-2 text-[10px] leading-4 text-black/50">{s.termosNota}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {apenasGtaDisponivel && (
                <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] leading-5 text-emerald-800">
                  Só a GTA está disponível para o seu caso
                  {algumViajanteAcimaDe64 && moraEm === "japao"
                    ? " — viajante(s) acima de 64 anos e residente no Japão."
                    : algumViajanteAcimaDe64
                      ? " — viajante(s) acima de 64 anos."
                      : " — seguro viagem pra quem mora no Japão."}
                </p>
              )}
              <p className="mt-3 text-[11px] leading-5 text-black/60">
                Valor total para o grupo, já com taxas incluídas. O plano exato de cada seguradora para o
                seu perfil é confirmado pela nossa equipe antes da emissão da apólice.
              </p>
            </div>

            {/* 5 — Passagem aérea (opcional) */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={5} titulo="Passagem aérea (opcional)" />
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPassagemComprada("sim")}
                  className={`rounded-full border px-4 py-2.5 text-sm transition ${classeOpcao(passagemComprada === "sim")}`}
                >
                  Já comprei a passagem
                </button>
                <button
                  type="button"
                  onClick={() => setPassagemComprada("nao")}
                  className={`rounded-full border px-4 py-2.5 text-sm transition ${classeOpcao(passagemComprada === "nao")}`}
                >
                  Ainda não comprei
                </button>
              </div>

              {passagemComprada === "sim" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black">Número do voo</span>
                    <input
                      type="text"
                      value={numeroVoo}
                      onChange={(e) => setNumeroVoo(e.target.value)}
                      placeholder="ex.: JL0034"
                      className={classeInput}
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black">Data de ida</span>
                    <input
                      type="date"
                      value={dataIdaVoo}
                      min={hojeISO()}
                      onChange={(e) => {
                        const novaIda = e.target.value;
                        setDataIdaVoo(novaIda);
                        if (dataVoltaVoo && novaIda && dataVoltaVoo < novaIda) setDataVoltaVoo("");
                      }}
                      className={classeInputData}
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-black">Data de volta</span>
                    <input
                      type="date"
                      value={dataVoltaVoo}
                      min={dataIdaVoo || hojeISO()}
                      onChange={(e) => setDataVoltaVoo(e.target.value)}
                      className={classeInputData}
                    />
                  </label>
                </div>
              )}

              {passagemComprada === "nao" && (
                <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-black/80">
                  <input
                    type="checkbox"
                    checked={emitirPassagemAjisai}
                    onChange={(e) => setEmitirPassagemAjisai(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                  />
                  Quero que a Ajisai emita minha passagem aérea
                </label>
              )}
            </div>

            {/* 6 — Seus dados */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={6} titulo="Seus dados" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                    Nome completo (viajante principal)
                  </span>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={classeInput} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">E-mail</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={classeInput} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">WhatsApp</span>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={classeInput}
                  />
                </label>
              </div>
              <label className="mt-4 flex min-w-0 flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">
                  Nome do comprador (opcional — só se for diferente do viajante)
                </span>
                <input
                  type="text"
                  value={nomeComprador}
                  onChange={(e) => setNomeComprador(e.target.value)}
                  placeholder="Preencha só se quem está pagando não é quem viaja"
                  className={classeInput}
                />
              </label>
              <label className="mt-4 flex min-w-0 flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">Observações (opcional)</span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Condição de saúde pré-existente, prática de esportes na viagem, etc."
                  className={classeInput}
                />
              </label>
            </div>

            {/* 7 — Formas de pagamento */}
            <FormasPagamento
              numeroPasso={7}
              totalBRL={valorTotalBRL}
              dataViagem={dataInicio}
              formaPagamento={formaPagamento}
              onEscolher={setFormaPagamento}
            />

            {/* 8 — Termos e condições — texto enviado pelo Wilson,
                29/set/2026 ("Termos e Condições — Seguro Viagem, última
                atualização: setembro de 2026"). Ao mudar este texto de
                forma relevante, atualizar TERMOS_VERSAO_SEGURO_VIAGEM em
                app/api/seguro-viagem-selfservice/route.ts. */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={8} titulo="Termos e condições" />
              <div
                id="termos-seguro-viagem"
                ref={termosBoxRef}
                className="mt-5 max-h-96 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/75"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setTermosRolados(true);
                }}
              >
                <TermosSeguroViagem />
              </div>
              <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/80">
                <input
                  type="checkbox"
                  checked={termosAceitos}
                  disabled={!termosRolados}
                  onChange={(e) => setTermosAceitos(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
                />
                Li e aceito os Termos e Condições do Seguro Viagem e estou ciente de que a cobertura, o
                preço final e as condições aplicáveis serão confirmados antes da emissão.
              </label>
              {!termosRolados && (
                <p className="mt-1.5 pl-8 text-xs text-black/55">Role o texto acima até o fim para habilitar o aceite.</p>
              )}
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-8 text-xs">
                <a
                  href="#termos-seguro-viagem"
                  className="font-medium text-[#1c6ea8] underline decoration-[#1c6ea8]/40 underline-offset-2"
                >
                  Termos e Condições
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#1c6ea8] underline decoration-[#1c6ea8]/40 underline-offset-2"
                >
                  Política de Privacidade ↗
                </a>
              </p>
            </div>

            {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
          </>
        )}
      </div>

      {/* Rodapé fixo — mesmo componente visual do JR Pass (checklist
          "Antes de finalizar" + resumo + botão Stone), com o checklist
          recolhível no celular. */}
      {status !== "enviado" && (
        <div
          ref={rodapeRef}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[75svh] overflow-y-auto border-t border-white/10 bg-[#0A263D] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.3)] md:max-h-[85vh] md:px-8 md:py-5"
        >
          <button
            type="button"
            onClick={() => setChecklistAberto((v) => !v)}
            aria-expanded={checklistAberto}
            className="flex w-full items-center justify-between gap-3 text-left md:hidden"
          >
            <span className="text-[13px] font-semibold text-[#E6D4A3]">
              {pendenciasFinalizar.length > 0
                ? `Falta${pendenciasFinalizar.length === 1 ? "" : "m"} ${pendenciasFinalizar.length} ${
                    pendenciasFinalizar.length === 1 ? "item" : "itens"
                  } para finalizar`
                : "Tudo certo — pode finalizar"}
            </span>
            {pendenciasFinalizar.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#A5B3BE]">
                {checklistAberto ? "Ocultar" : "Ver"}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3.5 w-3.5 transition-transform ${checklistAberto ? "" : "rotate-180"}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            )}
          </button>

          <div className="mx-auto grid max-w-[1150px] gap-3 md:grid-cols-[65fr_35fr] md:gap-6">
            <div className={`${checklistAberto ? "block" : "hidden"} pt-2 md:block md:pt-0`}>
              <p className="hidden text-[15px] font-semibold text-[#E6D4A3] md:block">Antes de finalizar</p>
              {pendenciasFinalizar.length > 0 ? (
                <ul className="space-y-2.5 md:mt-3 md:space-y-3.5">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] leading-[1.4] text-[#F1EEE7] md:text-sm">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#BFA76A]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 hidden items-center gap-2 text-sm text-[#F1EEE7] md:flex">
                  <IconCheck className="h-4 w-4 shrink-0 text-[#BFA76A]" />
                  Tudo certo — pode finalizar.
                </p>
              )}
              <p className="mt-3 text-[11px] leading-5 text-[#A5B3BE] md:mt-5 md:text-xs">
                Ao finalizar, você é levado direto pra página de pagamento segura da Stone (Pix ou cartão).
                Após a confirmação, nossa equipe confirma o plano com a seguradora, emite a apólice e envia
                pelo WhatsApp e por e-mail.
              </p>
            </div>

            <div className="md:rounded-xl md:border md:border-[#8E794B]/30 md:bg-[#18343F] md:p-5">
              <p className="hidden text-[10px] uppercase tracking-[0.15em] text-[#8498A8] md:block">Sua escolha</p>
              {valorTotalBRL !== null && valorTotalBRL > 0 ? (
                <div className="flex items-baseline justify-between gap-3 md:block">
                  <p
                    className={`${inter.className} text-2xl font-bold tracking-[-0.02em] tabular-nums text-[#C2A66A] md:mt-1 md:text-3xl`}
                  >
                    {formatBRL(valorTotalBRL)}
                  </p>
                  <div className="text-right md:text-left">
                    <p className="text-xs text-[#A5B3BE] md:mt-1 md:text-sm">
                      {seguradoraEscolhida ? `${seguradoraEscolhida.nome} · ` : ""}
                      {dias} {dias === 1 ? "dia" : "dias"} · {numViajantes}{" "}
                      {numViajantes === 1 ? "viajante" : "viajantes"}
                    </p>
                    {descricaoPagamentoEscolhido && (
                      <p className="mt-1 hidden text-[11px] text-[#8498A8] md:block">{descricaoPagamentoEscolhido}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-1 hidden text-sm text-[#B8C5CE] md:block">
                  Preencha a idade dos viajantes e as datas da viagem para ver o valor.
                </p>
              )}

              <div className="my-4 hidden h-px bg-white/10 md:block" />

              <button
                type="button"
                onClick={enviar}
                disabled={!formValido || status === "enviando"}
                className={`mt-3 flex h-12 w-full items-center justify-center rounded-full text-sm font-medium uppercase tracking-[0.06em] transition-colors duration-200 md:mt-0 md:h-14 ${
                  formValido && status !== "enviando"
                    ? "bg-[#E7DFD0] text-[#122D40] hover:bg-[#F0EADF]"
                    : "cursor-not-allowed bg-[#2F4F69] text-[#9DB0BD]"
                }`}
              >
                {status === "enviando" ? "Enviando…" : "Finalizar compra"}
              </button>

              <div className="mt-2 flex items-center justify-center gap-2 md:mt-4 md:flex-col md:gap-1">
                <span className="text-[11px] text-[#A9B0B2] md:text-xs">Pagamento seguro</span>
                <Image
                  src="/images/produtos/stone-logo-white.png"
                  alt="Stone"
                  width={102}
                  height={37}
                  className="h-5 w-auto opacity-90 md:h-9"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Texto integral enviado pelo Wilson em 29/set/2026 — só a formatação
// (títulos/listas) foi adaptada pra caixa com rolagem.
function T({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 font-medium text-black">{children}</p>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-1">{children}</p>;
}
function TermosSeguroViagem() {
  return (
    <>
      <p className="font-medium text-black">Termos e Condições — Seguro Viagem</p>
      <p className="mt-0.5 text-black/55">Última atualização: setembro de 2026</p>
      <P>
        Ao solicitar a contratação de seguro viagem por meio da Ajisai, o cliente declara que leu e concorda
        com os termos abaixo.
      </P>

      <T>1. Sobre o serviço</T>
      <P>
        A Ajisai disponibiliza ao cliente opções de seguro viagem oferecidas por seguradoras e/ou empresas de
        assistência parceiras, conforme disponibilidade para o destino, período da viagem, idade dos
        viajantes e demais informações fornecidas.
      </P>
      <P>
        A apresentação de seguradoras, planos, valores ou coberturas nesta página não constitui garantia de
        contratação ou de aceitação do risco.
      </P>
      <P>
        A contratação somente estará concluída após a confirmação do plano, pagamento quando aplicável e
        emissão da respectiva apólice, bilhete ou certificado pela seguradora responsável.
      </P>

      <T>2. Escolha da seguradora e do plano</T>
      <P>
        O cliente poderá indicar a seguradora de sua preferência entre as opções disponibilizadas.
      </P>
      <P>
        As informações apresentadas pela Ajisai antes da emissão, incluindo valores, limites de cobertura e
        características dos planos, poderão possuir caráter estimativo ou de referência até a confirmação
        definitiva pela seguradora.
      </P>
      <P>
        Antes da conclusão da contratação, serão informados ao cliente o plano selecionado, o valor final, os
        principais limites de cobertura e, quando aplicável, franquias, carências e demais condições
        relevantes.
      </P>
      <P>
        As coberturas efetivamente contratadas serão exclusivamente aquelas constantes da apólice, bilhete,
        certificado e respectivas Condições Gerais e Especiais emitidas pela seguradora.
      </P>
      <P>
        A SUSEP ressalta que as condições contratuais podem conter restrições de cobertura e riscos excluídos,
        que devem ser conhecidos pelo segurado antes da contratação.
      </P>

      <T>3. Informações fornecidas pelo cliente</T>
      <P>
        O cliente é responsável pela exatidão das informações fornecidas para todos os viajantes, incluindo,
        entre outras:
      </P>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>nome completo;</li>
        <li>data de nascimento ou idade;</li>
        <li>CPF, quando necessário;</li>
        <li>endereço;</li>
        <li>destino da viagem;</li>
        <li>datas de início e término da viagem;</li>
        <li>telefone e e-mail;</li>
        <li>demais informações solicitadas pela seguradora.</li>
      </ul>
      <P>O nome dos segurados deverá corresponder aos documentos utilizados durante a viagem.</P>
      <P>
        Informações incorretas, incompletas ou omitidas poderão impedir a emissão do seguro ou afetar a
        análise de eventual sinistro, de acordo com as regras da seguradora e a legislação aplicável.
      </P>

      <T>4. Coberturas</T>
      <P>
        As coberturas variam conforme a seguradora e o plano escolhido. Poderão incluir, entre outras,
        despesas médicas, hospitalares ou odontológicas em viagem, traslado médico, repatriação, acidentes
        pessoais, bagagem e outras assistências previstas no plano contratado.
      </P>
      <P>
        Em viagens internacionais, a regulamentação aplicável ao seguro viagem determina a existência de
        cobertura de despesas médicas, hospitalares e/ou odontológicas em viagem, não limitada exclusivamente
        a eventos decorrentes de acidentes pessoais.
      </P>
      <P>
        Os valores máximos de cobertura, eventos abrangidos, exclusões, franquias e procedimentos de
        utilização serão aqueles estabelecidos pela seguradora no plano efetivamente contratado.
      </P>

      <T>5. Condições Gerais da seguradora</T>
      <P>
        Cada seguro possui Condições Gerais, Especiais e, quando aplicável, Particulares próprias. Esses
        documentos integram o contrato de seguro e prevalecem na definição de coberturas, limites, exclusões,
        obrigações das partes, procedimentos para atendimento e regras para indenização.
      </P>
      <P>O cliente deverá ler esses documentos antes da conclusão da contratação.</P>
      <P>
        Quando disponibilizado pela seguradora, o respectivo número de processo SUSEP também poderá ser
        consultado para identificação do produto registrado. O registro de um produto na SUSEP não representa
        recomendação ou aprovação comercial do produto pela autarquia.
      </P>

      <T>6. Valor e pagamento</T>
      <P>O valor do seguro depende de fatores como:</P>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>destino;</li>
        <li>duração da viagem;</li>
        <li>idade dos viajantes;</li>
        <li>plano escolhido;</li>
        <li>limites de cobertura; e</li>
        <li>condições comerciais vigentes no momento da contratação.</li>
      </ul>
      <P>Valores exibidos previamente nesta página poderão ser utilizados exclusivamente como referência.</P>
      <P>O preço final será informado antes da confirmação da contratação.</P>
      <P>
        Quando esta página funcionar apenas como uma solicitação de proposta, o envio do formulário não
        representa cobrança, pagamento ou contratação automática do seguro.
      </P>

      <T>7. Emissão</T>
      <P>
        Após a confirmação dos dados necessários e, quando aplicável, do pagamento, a solicitação será
        encaminhada para emissão.
      </P>
      <P>
        A cobertura somente deverá ser considerada ativa de acordo com a data de vigência indicada no
        documento emitido pela seguradora.
      </P>
      <P>
        O cliente deverá conferir imediatamente os dados constantes da apólice, bilhete ou certificado e
        comunicar eventuais divergências assim que identificadas.
      </P>

      <T>8. Alterações e cancelamento</T>
      <P>Pedidos de alteração ou cancelamento estarão sujeitos:</P>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>às regras da seguradora responsável;</li>
        <li>às condições do plano contratado;</li>
        <li>ao momento da solicitação; e</li>
        <li>à legislação aplicável.</li>
      </ul>
      <P>
        Eventuais multas, retenções ou impossibilidade de cancelamento somente poderão ser aplicadas quando
        previstas no contrato e permitidas pela legislação.
      </P>
      <P>
        Caso o cliente solicite alteração de destino, período de viagem, segurado ou cobertura após a emissão,
        poderá ser necessário cancelar e emitir uma nova contratação.
      </P>

      <T>9. Atendimento durante a viagem</T>
      <P>
        Em caso de necessidade de assistência durante a viagem, o segurado deverá seguir os canais e
        procedimentos indicados pela seguradora em sua apólice, certificado ou cartão de assistência.
      </P>
      <P>
        Sempre que possível, o segurado deverá entrar em contato com a central de atendimento da seguradora
        antes de realizar despesas por conta própria.
      </P>
      <P>
        Pedidos de reembolso, quando previstos, estão sujeitos aos limites, documentos, procedimentos e demais
        condições estabelecidas no plano contratado.
      </P>

      <T>10. Sinistros e indenizações</T>
      <P>
        A análise, regulação e pagamento de qualquer sinistro são de responsabilidade da seguradora
        responsável pelo seguro contratado.
      </P>
      <P>
        A Ajisai poderá auxiliar o cliente na identificação dos canais de atendimento e documentos
        necessários, mas não decide sobre aprovação, negativa ou valor de indenizações.
      </P>
      <P>
        A existência de cobertura para determinado evento será analisada conforme a apólice e as Condições
        Gerais e Especiais aplicáveis.
      </P>

      <T>11. Exclusões e limitações</T>
      <P>
        Determinados eventos poderão não estar cobertos pelo seguro. As exclusões variam de acordo com
        seguradora e plano e estarão descritas nos respectivos documentos contratuais.
      </P>
      <P>
        O cliente deverá analisar especialmente condições relativas a doenças ou condições preexistentes,
        práticas esportivas, gestação, idade máxima, consumo de álcool ou outras substâncias, atividades de
        risco, cancelamento de viagem e bagagem, quando aplicáveis.
      </P>
      <P>Nenhuma descrição resumida apresentada no site substitui a leitura das condições oficiais do plano.</P>

      <T>12. Documentação de viagem</T>
      <P>A contratação de seguro viagem não garante entrada ou permanência em qualquer país.</P>
      <P>
        É responsabilidade exclusiva do viajante verificar requisitos de imigração, visto, passaporte, vacinas
        e valores mínimos de cobertura eventualmente exigidos pelo país de destino.
      </P>

      <T>13. Proteção de dados pessoais</T>
      <P>
        Os dados fornecidos serão utilizados para atendimento da solicitação, obtenção de cotações, emissão do
        seguro, comunicação com o cliente e demais atividades necessárias à prestação do serviço.
      </P>
      <P>
        Quando necessário para a contratação, os dados poderão ser compartilhados com a seguradora escolhida,
        seus representantes e prestadores envolvidos na operação.
      </P>
      <P>
        O tratamento dos dados deverá observar a legislação brasileira aplicável à proteção de dados pessoais
        e a Política de Privacidade da Ajisai.
      </P>

      <T>14. Comunicações</T>
      <P>
        O cliente autoriza o contato da Ajisai pelos canais informados durante a solicitação, incluindo
        WhatsApp, telefone e e-mail, para tratar da cotação, confirmação de dados, emissão do seguro e
        atendimento relacionado à contratação solicitada.
      </P>
      <P>
        Essa autorização não implica consentimento automático para recebimento de comunicações publicitárias
        não relacionadas à solicitação.
      </P>

      <T>15. Responsabilidade da Ajisai</T>
      <P>
        A Ajisai atua na apresentação e facilitação da contratação das opções disponibilizadas nesta
        plataforma, dentro dos limites da atividade efetivamente exercida.
      </P>
      <P>
        A seguradora identificada na apólice é responsável pelas coberturas do seguro, pela análise dos
        sinistros e pelas indenizações previstas no contrato.
      </P>
      <P>
        A Ajisai não poderá alterar ou ampliar coberturas, limites ou condições estabelecidos pela seguradora
        sem a correspondente formalização pela própria seguradora.
      </P>

      <T>16. Divergência de informações</T>
      <P>
        Caso exista qualquer divergência entre informações resumidas apresentadas no site e os documentos
        oficiais emitidos para o plano contratado, deverão ser consideradas as condições formalmente
        apresentadas e aceitas na contratação, observada a legislação aplicável e os direitos do consumidor.
      </P>

      <T>17. Aceite</T>
      <P>
        Ao marcar a opção “Li e aceito os Termos e Condições do Seguro Viagem” e prosseguir com a
        solicitação, o cliente declara:
      </P>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>que as informações fornecidas são verdadeiras;</li>
        <li>que compreende que diferentes seguradoras possuem diferentes coberturas e exclusões;</li>
        <li>que terá acesso às condições do plano antes da conclusão da contratação; e</li>
        <li>
          que compreende que o envio da solicitação, por si só, não significa que uma apólice já tenha sido
          emitida.
        </li>
      </ul>
    </>
  );
}
