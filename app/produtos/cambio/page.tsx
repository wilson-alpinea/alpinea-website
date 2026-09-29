"use client";

// Câmbio ganhou página própria (antes era o CambioModal dentro de
// /produtos) — pedido do Wilson, 29/set/2026: "agora faça o mesmo para
// cambio na pagina de produtos" (mesmo tratamento dado ao JR Pass e ao
// Seguro Viagem) + "cambio só tem PIX". Mesma moldura das outras duas
// páginas: barra de voltar fixa, topo, "Como funciona", passos numerados
// e rodapé fixo com checklist + resumo + botão de pagamento Stone.
//
// Decisões do Wilson nesta data (AskUserQuestion):
// - Pagamento: SÓ Pix ("cambio só tem PIX"). Compra de ienes → Pix pela
//   Stone/Pagar.me na hora. Venda (a Ajisai compra os ienes do cliente) →
//   fluxo MANUAL ("no caso de nós comprarmos o iene do cliente é fluxo
//   manual"): o pedido vai pro CRM e a equipe paga o cliente via Pix
//   depois de receber os ienes — sem cobrança na Stone.
// - Sem caixa de termos e condições ("sem termos e condições, use a
//   lógica que temos na calculadora reversa").
// - Regra de preço inalterada (mesma do modal antigo, 25/set/2026) — agora
//   centralizada em app/lib/precoCambioIene.ts, que o servidor também usa
//   pra recalcular o valor antes de gerar o Pix.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { formatBRL } from "../../hooks/useCambioUSD";
import { useCambioIene, CIDADES_CAMBIO_IENE, type CidadeCambioIeneSlug, type DirecaoCambioIene } from "../../hooks/useCambioIene";
import { CAMBIO_IENES_MINIMO_PUBLICO, calcularPrecoCambioIene } from "../../lib/precoCambioIene";
import { display, WHATSAPP_NUMBER, IconCheck } from "../page";

// Inter só para valores em dinheiro — mesmo padrão do JR Pass.
const inter = Inter({ subsets: ["latin"], weight: ["500", "700"] });

const ICONE_MOEDA_IENE = "/images/icone-moeda-iene.png";

// Atalhos de quantidade — facilitam o celular (digitar ¥ com muitos zeros
// é o ponto mais chato do formulário). Todos acima do mínimo.
const ATALHOS_IENES = [100000, 200000, 300000, 500000];

// Ícones PROVISÓRIOS do "Como funciona" — o Wilson manda as artes depois,
// como fez no JR Pass.
function IconePasso({ tipo }: { tipo: "pedido" | "pix" | "confirmacao" | "retirada" }) {
  const comum = {
    fill: "none",
    stroke: "#2f80c9",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 48 48" className="mt-2 h-20 w-20" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#dcecf8" />
      {tipo === "pedido" && (
        <g {...comum}>
          <rect x="15" y="12" width="18" height="24" rx="2" />
          <path d="M19 19h10M19 24h10M19 29h6" />
        </g>
      )}
      {tipo === "pix" && (
        <g {...comum}>
          <path d="M24 12l12 12-12 12-12-12z" />
          <path d="M19 24h10" />
        </g>
      )}
      {tipo === "confirmacao" && (
        <g {...comum}>
          <path d="M14 18h20v13H22l-6 5v-5h-2z" />
          <path d="M20 24l3 3 5-5" />
        </g>
      )}
      {tipo === "retirada" && (
        <g {...comum}>
          <rect x="12" y="17" width="24" height="14" rx="2" />
          <circle cx="24" cy="24" r="3.5" />
          <path d="M16 21v6M32 21v6" />
        </g>
      )}
    </svg>
  );
}

const COMO_FUNCIONA = [
  {
    icone: "pedido" as const,
    titulo: "Faça seu pedido",
    texto: "Escolha compra ou venda, a cidade e a quantidade de ienes.",
  },
  {
    icone: "pix" as const,
    titulo: "Pix",
    texto: "Na compra, você paga via Pix pela Stone. Na venda, a Ajisai te paga via Pix.",
  },
  {
    icone: "confirmacao" as const,
    titulo: "Confirmamos",
    texto: "Nossa equipe confirma o pedido e combina data e local pelo WhatsApp.",
  },
  {
    icone: "retirada" as const,
    titulo: "Retire ou entregue",
    texto: "Os ienes em espécie são entregues (ou recebidos) na cidade escolhida.",
  },
];

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

function classeOpcao(selecionado: boolean) {
  return selecionado
    ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#1c6ea8]"
    : "border-black/15 text-black/70 hover:border-black/30";
}

export default function CambioPage() {
  const [direcao, setDirecao] = useState<DirecaoCambioIene>("compra");
  const [cidade, setCidade] = useState<CidadeCambioIeneSlug>("sao-paulo");
  const [quantidadeIenes, setQuantidadeIenes] = useState(CAMBIO_IENES_MINIMO_PUBLICO);
  const [nome, setNome] = useState("");
  const [nomeComprador, setNomeComprador] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  // Cotação de rua na cidade/direção escolhidas (mesmo hook de sempre). A
  // margem pública fica dentro de calcularPrecoCambioIene — nunca exibida.
  const cambioIene = useCambioIene(cidade, direcao);
  // Cotação de fallback (fonte fora do ar) não pode virar cobrança: a
  // página mostra o valor como estimativa e trava o pagamento.
  const cotacaoIndisponivel = cambioIene?.fallback === true;
  const preco =
    cambioIene && quantidadeIenes > 0
      ? calcularPrecoCambioIene({
          cotacaoRuaBRLporJPY: cambioIene.cotacaoBRLPorJPY,
          direcao,
          cidade,
          quantidadeIenes,
        })
      : null;
  const totalBRL = preco?.totalBRL ?? null;

  const cidadeNome = CIDADES_CAMBIO_IENE.find((c) => c.slug === cidade)?.nome ?? cidade;
  const direcaoLabel = direcao === "compra" ? "Compra de ienes" : "Venda de ienes";
  const ehCompra = direcao === "compra";

  const formValido =
    !!cambioIene &&
    // Na compra a cotação vira cobrança na hora — não pode ser estimativa.
    // Na venda (manual) a equipe confirma o valor antes de pagar o cliente.
    (!ehCompra || !cotacaoIndisponivel) &&
    quantidadeIenes >= CAMBIO_IENES_MINIMO_PUBLICO &&
    totalBRL !== null &&
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8;

  const pendenciasFinalizar: string[] = [];
  if (!cambioIene) pendenciasFinalizar.push("Aguarde a cotação do dia carregar.");
  else if (cotacaoIndisponivel && ehCompra) {
    pendenciasFinalizar.push("Cotação do dia indisponível no momento — tente de novo em alguns minutos.");
  }
  if (quantidadeIenes < CAMBIO_IENES_MINIMO_PUBLICO) {
    pendenciasFinalizar.push(`A quantidade mínima é ¥${CAMBIO_IENES_MINIMO_PUBLICO.toLocaleString("pt-BR")}.`);
  }
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\S+@\S+\.\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/cambio-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direcao,
          cidade,
          moedaTransacao: "BRL",
          quantidadeIenes,
          totalBRL,
          formaPagamento:
            totalBRL === null
              ? null
              : ehCompra
                ? `Pix à vista de ${formatBRL(totalBRL)} (cliente paga pela Stone)`
                : `Ajisai paga ${formatBRL(totalBRL)} ao cliente via Pix (fluxo manual)`,
          nome,
          nomeComprador,
          email,
          whatsapp,
          observacoes,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      // Com a Stone/Pagar.me configurada, a API devolve o link do Pix e o
      // cliente vai direto pagar (mesmo fluxo do JR Pass/Seguro Viagem).
      if (dadosResposta?.checkoutUrl) {
        window.location.assign(dadosResposta.checkoutUrl);
        return;
      }
      setStatus("enviado");
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de fazer o pedido de ${
    direcao === "compra" ? "compra" : "venda"
  } de ¥${quantidadeIenes.toLocaleString("pt-BR")} pelo site da Ajisai${nome ? ` — meu nome é ${nome}` : ""}.`;

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
      // Mesmos ajustes de mobile/iOS do JR Pass: sem rolagem lateral e
      // campos com 16px no celular (evita o zoom automático do Safari).
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
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>Câmbio</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl p-5 md:p-8">
        {status === "enviado" ? (
          <div className="py-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
            <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
              Recebemos seu pedido de câmbio
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/75">
              {ehCompra
                ? `Nossa equipe te envia o Pix pelo WhatsApp e por e-mail e combina a entrega dos ienes em ${cidadeNome}.`
                : `Nossa equipe confirma o valor e combina com você, pelo WhatsApp, onde receber os ienes em ${cidadeNome}. O pagamento pra você é feito via Pix assim que recebermos os ienes.`}
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
            {/* Topo — imagem PROVISÓRIA (ícone do câmbio) até o Wilson
                mandar a arte definitiva. */}
            <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Câmbio de ienes</p>
                <h3 className={`${display.className} mt-2 max-w-2xl text-2xl font-medium text-black md:text-3xl`}>
                  Ienes em espécie antes e depois da viagem
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/75">
                  Retire ienes em espécie antes de embarcar — ou troque de volta o que sobrou da viagem —
                  em São Paulo, Rio de Janeiro, Curitiba ou no Aeroporto de Guarulhos. Cotação do dia e
                  pagamento via Pix, direto pelo site.
                </p>
              </div>
              <Image
                src="/images/icone-cambio-dinheiro.png"
                alt="Câmbio de ienes"
                width={258}
                height={320}
                className="mx-auto w-24 shrink-0 sm:mx-0 sm:w-32"
              />
            </div>

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
                    <IconePasso tipo={passo.icone} />
                    <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
                    <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 1 — Operação */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={1} titulo="O que você quer fazer" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    { key: "compra", titulo: "Comprar ienes", texto: "Retirar ienes em espécie antes de embarcar." },
                    { key: "venda", titulo: "Vender ienes", texto: "Trocar de volta por reais os ienes que sobraram da viagem." },
                  ] as const
                ).map((op) => {
                  const selecionado = direcao === op.key;
                  return (
                    <button
                      key={op.key}
                      type="button"
                      onClick={() => setDirecao(op.key)}
                      className={`relative flex min-w-0 flex-col rounded-2xl border p-5 text-left shadow-[0_18px_45px_-14px_rgba(37,99,235,0.55)] transition-colors duration-150 hover:shadow-[0_22px_55px_-12px_rgba(37,99,235,0.65)] ${
                        selecionado ? "border-[#252522] bg-[#FAF9F6]" : "border-[#E4E1DC] bg-white hover:border-black/25"
                      }`}
                    >
                      {selecionado && (
                        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#252522] px-2.5 py-1 text-[10px] font-medium text-white">
                          <IconCheck className="h-3 w-3" />
                          Selecionado
                        </span>
                      )}
                      <p className={`${display.className} pr-24 text-base font-medium text-[#1C1C1A]`}>{op.titulo}</p>
                      <p className="mt-1 text-sm text-[#77736D]">{op.texto}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 — Cidade */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={2} titulo={direcao === "compra" ? "Cidade de retirada" : "Cidade de entrega dos ienes"} />
              <div className="mt-5 flex flex-wrap gap-2">
                {CIDADES_CAMBIO_IENE.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCidade(c.slug)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition ${classeOpcao(cidade === c.slug)}`}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
              {preco && preco.taxaAeroportoBRL > 0 && (
                <p className="mt-2 text-[11px] leading-5 text-black/60">
                  No aeroporto há uma taxa de {formatBRL(preco.taxaAeroportoBRL)}, já{" "}
                  {ehCompra ? "incluída no total" : "descontada do valor"}.
                </p>
              )}
            </div>

            {/* 3 — Quantidade */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={3} titulo="Quantidade de ienes" />
              <div className="mt-5 flex max-w-xs items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ICONE_MOEDA_IENE} alt="" className="h-9 w-9 shrink-0 object-contain" />
                <input
                  type="number"
                  inputMode="numeric"
                  min={CAMBIO_IENES_MINIMO_PUBLICO}
                  step={10000}
                  value={quantidadeIenes}
                  onChange={(e) => setQuantidadeIenes(Number(e.target.value) || 0)}
                  onBlur={() => setQuantidadeIenes((v) => Math.max(CAMBIO_IENES_MINIMO_PUBLICO, v))}
                  className={classeInput}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ATALHOS_IENES.map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setQuantidadeIenes(valor)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${classeOpcao(quantidadeIenes === valor)}`}
                  >
                    ¥{valor.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-black/60">
                Mínimo de ¥{CAMBIO_IENES_MINIMO_PUBLICO.toLocaleString("pt-BR")}.
              </p>

              <div className="mt-5 rounded-xl bg-[#eef6fb] px-4 py-3">
                {preco ? (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#1c6ea8]">
                      {direcaoLabel} · {cidadeNome}
                    </p>
                    <p className="mt-1 text-[11px] text-black/60">{ehCompra ? "Você paga" : "Você recebe"}</p>
                    <p className={`${inter.className} text-2xl font-bold tabular-nums text-[#1C1C1A]`}>
                      {formatBRL(preco.totalBRL)}
                    </p>
                    <p className={`${inter.className} mt-0.5 text-xs tabular-nums text-black/60`}>
                      ¥{quantidadeIenes.toLocaleString("pt-BR")} · R$ {preco.cotacaoFinalBRLporJPY.toFixed(4).replace(".", ",")} por
                      iene · {ehCompra ? "já com taxas incluídas" : "já descontadas as taxas"}
                    </p>
                    {cotacaoIndisponivel && (
                      <p className="mt-2 text-[11px] leading-5 text-amber-700">
                        {ehCompra
                          ? "Cotação do dia indisponível no momento — o valor acima é só uma estimativa e o pagamento fica liberado assim que a cotação voltar."
                          : "Cotação do dia indisponível no momento — o valor acima é uma estimativa; nossa equipe confirma o valor final antes de pagar."}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-black/60">Carregando a cotação do dia…</p>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-black/60">
                {ehCompra
                  ? "A cotação vale no momento do pedido e fica travada quando você paga o Pix."
                  : "Valor confirmado pela nossa equipe na conferência dos ienes, antes do Pix."}
              </p>
            </div>

            {/* 4 — Seus dados */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={4} titulo="Seus dados" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black">Nome completo</span>
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
                  Nome de quem paga (opcional — só se for outra pessoa)
                </span>
                <input
                  type="text"
                  value={nomeComprador}
                  onChange={(e) => setNomeComprador(e.target.value)}
                  placeholder="Preencha só se o Pix sair da conta de outra pessoa"
                  className={classeInput}
                />
              </label>
              <label className="mt-4 flex min-w-0 flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">Observações (opcional)</span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Data prevista de retirada, preferência de local, etc."
                  className={classeInput}
                />
              </label>
            </div>

            {/* 5 — Pagamento (só Pix — Wilson, 29/set/2026). Compra: cliente
                paga pela Stone. Venda: fluxo manual, a Ajisai paga o cliente. */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={5} titulo={ehCompra ? "Pagamento" : "Recebimento"} />
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#2f80c9] bg-[#2f80c9]/5 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black">{ehCompra ? "Pix à vista" : "Pix pra você"}</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-black/60">
                    {ehCompra
                      ? "Única forma de pagamento do câmbio. O QR Code aparece na página segura da Stone."
                      : "Depois de receber e conferir os ienes, a Ajisai faz o Pix pra você. A chave Pix é combinada pelo WhatsApp."}
                  </p>
                </div>
                {totalBRL !== null && (
                  <p className={`${inter.className} shrink-0 text-lg font-bold tabular-nums text-[#1C1C1A]`}>
                    {formatBRL(totalBRL)}
                  </p>
                )}
              </div>
            </div>

            {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
          </>
        )}
      </div>

      {/* Rodapé fixo — mesmo componente visual do JR Pass/Seguro Viagem,
          com checklist recolhível no celular. */}
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
                {ehCompra
                  ? "Ao finalizar, você é levado direto pra página de pagamento segura da Stone (Pix). Após a confirmação, nossa equipe combina a entrega dos ienes pelo WhatsApp."
                  : "Ao enviar, o pedido chega na nossa equipe, que combina com você pelo WhatsApp a entrega dos ienes. O Pix pra você é feito depois da conferência."}
              </p>
            </div>

            <div className="md:rounded-xl md:border md:border-[#8E794B]/30 md:bg-[#18343F] md:p-5">
              <p className="hidden text-[10px] uppercase tracking-[0.15em] text-[#8498A8] md:block">
                {ehCompra ? "Você paga" : "Você recebe"}
              </p>
              {preco ? (
                <div className="flex items-baseline justify-between gap-3 md:block">
                  <p
                    className={`${inter.className} text-2xl font-bold tracking-[-0.02em] tabular-nums text-[#C2A66A] md:mt-1 md:text-3xl`}
                  >
                    {formatBRL(preco.totalBRL)}
                  </p>
                  <p className="text-right text-xs text-[#A5B3BE] md:mt-1 md:text-left md:text-sm">
                    {direcaoLabel} · ¥{quantidadeIenes.toLocaleString("pt-BR")} · {cidadeNome}
                  </p>
                </div>
              ) : (
                <p className="mt-1 hidden text-sm text-[#B8C5CE] md:block">Carregando a cotação do dia…</p>
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
                {status === "enviando" ? "Enviando…" : ehCompra ? "Pagar com Pix" : "Enviar pedido de venda"}
              </button>

              {ehCompra && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
