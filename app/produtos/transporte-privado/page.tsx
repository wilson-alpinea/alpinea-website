"use client";

// Transporte Privado (motorista particular) ganhou página própria — antes
// era o TransporteModal dentro de /produtos. Pedido do Wilson, 29/set/2026:
// "novo hero para motorista particular, não teremos pagamento automatico,
// mas pode reformatar a pagina de maneira a seguir o template da pagina de
// jr pass, cambio e seguro viagem". Mesma moldura das outras três páginas
// (barra de voltar fixa, banner hero com o título dentro da foto, "Como
// funciona", passos numerados, termos com rolagem obrigatória e o rodapé
// enxuto compartilhado — RodapeCheckout), mas SEM pagamento automático:
// o botão só registra o pedido no CRM (/api/transporte-privado-selfservice,
// inalterada) e a equipe fecha logística e pagamento pelo WhatsApp. Toda a
// lógica de preço/seleção (MotoristaPrivadoPicker, motoristaPrivadoRotas)
// e o texto dos termos vieram do modal antigo sem mudança.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { MotoristaPrivadoPicker } from "../../components/MotoristaPrivadoPicker";
import { ROTEIRO_PRECO_BASE } from "../../components/CustomPackageCard";
import {
  SELECAO_MOTORISTA_VAZIA,
  calcularTotalMotoristaUSD,
  contarItensMotorista,
  resumoSelecaoMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type SelecaoMotorista,
} from "../../lib/motoristaPrivadoRotas";
import { type FormaPagamentoEscolhida } from "../../lib/calculadoraCatalogoPublico";
import { display, WHATSAPP_NUMBER, FormasPagamento, descricaoFormaPagamento } from "../page";
import { RodapeCheckout } from "../RodapeCheckout";

const inter = Inter({ subsets: ["latin"], weight: ["500", "700"] });

// Ícones PROVISÓRIOS do "Como funciona" (traço simples, cor da marca) — o
// Wilson manda as artes definitivas depois, como fez nas outras páginas.
function IconePasso({ tipo }: { tipo: "rota" | "pedido" | "whatsapp" | "motorista" }) {
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
      {tipo === "rota" && (
        <g {...comum}>
          <circle cx="16" cy="16" r="3" />
          <circle cx="32" cy="32" r="3" />
          <path d="M18.5 17.5c6 1 1 7.5 6 9s5 1.5 5 3" />
        </g>
      )}
      {tipo === "pedido" && (
        <g {...comum}>
          <rect x="15" y="12" width="18" height="24" rx="2" />
          <path d="M19 19h10M19 24h10M19 29h6" />
        </g>
      )}
      {tipo === "whatsapp" && (
        <g {...comum}>
          <path d="M14 18h20v13H22l-6 5v-5h-2z" />
          <path d="M20 24l3 3 5-5" />
        </g>
      )}
      {tipo === "motorista" && (
        <g {...comum}>
          <path d="M13 29v-6l3-6h16l3 6v6z" />
          <circle cx="18" cy="30" r="2.5" />
          <circle cx="30" cy="30" r="2.5" />
          <path d="M16 23h16" />
        </g>
      )}
    </svg>
  );
}

const COMO_FUNCIONA = [
  { icone: "rota" as const, titulo: "Monte seu trajeto", texto: "Escolha o veículo e as rotas ou tours de que precisa." },
  { icone: "pedido" as const, titulo: "Envie o pedido", texto: "Você vê o valor na hora e envia o pedido direto pelo site." },
  { icone: "whatsapp" as const, titulo: "Confirmamos", texto: "Nossa equipe confirma horários, logística e pagamento pelo WhatsApp." },
  { icone: "motorista" as const, titulo: "Motorista te espera", texto: "Veículo exclusivo do seu grupo, no local e horário combinados." },
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

export default function TransportePrivadoPage() {
  const cambio = useCambioUSD();
  const [selecao, setSelecao] = useState<SelecaoMotorista>(SELECAO_MOTORISTA_VAZIA);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoEscolhida | null>(null);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");
  // Termos com rolagem obrigatória até o fim — mesmas regras do modal
  // antigo (Wilson, 25/set e 28/set/2026).
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) setTermosRolados(true);
  }, []);

  const cambioCotacao = cambio?.cotacao ?? 5.3;
  const quantidadeItens = contarItensMotorista(selecao);
  const motoristaUSD = calcularTotalMotoristaUSD(selecao);
  // "Transporte Privado" inclui o Roteiro Personalizado (mesma regra do
  // modal antigo) — só entra com pelo menos 1 serviço selecionado.
  const roteiroUSD = quantidadeItens > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const totalUSD = motoristaUSD + roteiroUSD;
  const totalBRL = totalUSD * cambioCotacao;
  const resumoSelecao = resumoSelecaoMotorista(selecao);
  const descricaoPagamentoEscolhido = descricaoFormaPagamento(
    formaPagamento,
    quantidadeItens > 0 ? totalBRL : null,
    "",
  );

  const formValido =
    nome.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeItens > 0 &&
    termosAceitos;

  const pendenciasFinalizar: string[] = [];
  if (quantidadeItens === 0) pendenciasFinalizar.push("Selecione ao menos uma rota ou tour.");
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\S+@\S+\.\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do transporte privado."
        : "Leia os termos e condições do transporte privado até o fim pra poder aceitá-los.",
    );
  }

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/transporte-privado-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veiculo: selecao.veiculo,
          itens: selecao.itens,
          resumo: resumoSelecao,
          motoristaUSD,
          roteiroUSD,
          totalUSD,
          totalBRL,
          formaPagamento: descricaoPagamentoEscolhido || null,
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
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar meu transporte privado pelo site da Ajisai — ${resumoSelecao}.${
    nome ? ` Meu nome é ${nome}.` : ""
  }`;

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
      // Mesmos ajustes de mobile/iOS das outras páginas de produto.
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
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>Transporte Privado</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl p-5 md:p-8">
        {status === "enviado" ? (
          <div className="py-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#1c6ea8]">Pedido registrado</p>
            <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
              Recebemos seu pedido de transporte privado
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/75">
              Nossa equipe confirma a logística, os horários e a forma de pagamento direto com você pelo
              WhatsApp.
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
            {/* Banner hero — foto enviada pelo Wilson em 29/set/2026. Mesmo
                esquema do Seguro Viagem/JR Pass: a família fica do lado
                esquerdo da foto, então ela ocupa só os ~64% da direita do
                banner (van e motorista à direita) e o título vai no
                azul-marinho liso à esquerda. No celular: foto em cima,
                texto embaixo. */}
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-64 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
                <Image
                  src="/images/produtos/transporte-privado-header.jpg"
                  alt="Família sendo recebida pelo motorista particular ao lado da van, em frente a um templo no Japão"
                  fill
                  priority
                  sizes="(min-width: 640px) 620px, 100vw"
                  className="object-cover object-[40%_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-12 px-5 pb-8 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-12 md:min-h-[380px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Transporte Privado</p>
                <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>
                  Motorista particular, sem compartilhar veículo
                </h1>
              </div>
            </section>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-black/75">
              Escolha o veículo e as rotas ou tours que precisa e veja o investimento exato, direto da tabela
              do nosso fornecedor no Japão — já com o Roteiro Personalizado incluso.
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
                    <IconePasso tipo={passo.icone} />
                    <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
                    <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 1 — Veículo e rotas */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={1} titulo="Veículo e rotas" />
              <div className="mt-5">
                <MotoristaPrivadoPicker selecao={selecao} onChange={setSelecao} cambioCotacao={cambioCotacao} />
              </div>
            </div>

            {/* Importante — mesmos avisos do modal antigo. */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">Importante</p>
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Não incluso:</span> trânsito
                    inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai por estrada).
                    Os valores acima já incluem imposto, estacionamento, pedágio (ETC) e combustível.
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Adicionais opcionais</span> (sob
                    consulta, cobrados à parte): recepção com placa de identificação (Meet &amp;
                    Greet) — {formatUSD(ADICIONAL_MEET_GREET_USD)}; cadeirinha infantil —{" "}
                    {formatUSD(ADICIONAL_CADEIRINHA_USD)}.
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    <span className="font-semibold text-black/80">Cancelamento:</span>{" "}
                    {POLITICA_CANCELAMENTO_MOTORISTA}
                  </p>
                </div>
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
                  <p className="text-xs leading-5 text-amber-800">
                    <span className="font-semibold text-amber-900">
                      Motorista bilíngue (português/inglês):
                    </span>{" "}
                    disponível mediante consulta, com valor adicional — a disponibilidade desse
                    perfil é bem menor que a de motoristas sem esse requisito. Recomendamos
                    solicitar com grande antecedência, idealmente 70 dias antes da viagem.
                  </p>
                </div>
              </div>

            {/* 2 — Seus dados */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={2} titulo="Seus dados" />
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
                <span className="text-[10px] uppercase tracking-[0.15em] text-black">Observações (opcional)</span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Datas da viagem, horários de voo, preferência de veículo, etc."
                  className={classeInput}
                />
              </label>
            </div>

            {/* 3 — Forma de pagamento preferida (sem cobrança automática: só
                informa a equipe, que fecha o pagamento pelo WhatsApp). */}
            <FormasPagamento
              numeroPasso={3}
              totalBRL={quantidadeItens > 0 ? totalBRL : null}
              dataViagem=""
              formaPagamento={formaPagamento}
              onEscolher={setFormaPagamento}
            />

            {/* 4 — Termos e condições (texto do modal antigo, sem mudança). */}
            <div id="checkout-ultimo-passo" className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={4} titulo="Termos e condições" />
              <div
                ref={termosBoxRef}
                className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/75"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setTermosRolados(true);
                }}
              >
                  <p className="font-medium text-black/80">Fornecimento do serviço</p>
                  <p className="mt-1">
                    O motorista e o veículo são fornecidos por um parceiro especializado no Japão
                    — a Alpinea atua como intermediária entre o cliente e esse fornecedor. O veículo
                    é exclusivo do grupo contratante, sem compartilhamento com outros passageiros.
                  </p>
                  <p className="mt-3 font-medium text-black/80">O que está incluído</p>
                  <p className="mt-1">
                    Os valores já incluem imposto, estacionamento, pedágio (ETC) e combustível. Cada
                    rota tem um tempo livre incluso (normalmente 90 min no trecho de chegada/pickup,
                    30 min no trecho de partida, ou as 10 horas inteiras nos tours de dia inteiro) —
                    ver detalhe de cada rota na calculadora acima.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Hora extra</p>
                  <p className="mt-1">
                    Tempo de uso além do período já incluso na rota escolhida é cobrado em blocos de
                    30 minutos (sempre arredondado pra cima), com tarifa específica por veículo e
                    rota, cobrado à parte.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Adicionais opcionais</p>
                  <p className="mt-1">
                    Recepção com placa de identificação (Meet &amp; Greet) e cadeirinha infantil
                    estão disponíveis mediante consulta, com valor adicional — não estão incluídos
                    no preço-base da rota.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Motorista bilíngue</p>
                  <p className="mt-1">
                    Motorista com português ou inglês está disponível mediante consulta e valor
                    adicional — disponibilidade limitada, recomendamos solicitar com grande
                    antecedência (idealmente 70 dias antes da viagem). Sem essa solicitação expressa,
                    o motorista fornecido fala japonês.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Não incluído</p>
                  <p className="mt-1">
                    Trânsito inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai
                    por estrada) não está coberto pelas rotas/tours listados acima.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Cancelamento</p>
                  <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
                  <p className="mt-3 font-medium text-black/80">Pagamento e responsabilidade dos dados</p>
                  <p className="mt-1">
                    O valor final em reais é convertido pela cotação de câmbio do dia da confirmação.
                    A exatidão dos dados informados (nome, telefone/WhatsApp, horários de voo e locais
                    de embarque) é de responsabilidade do cliente — divergências podem prejudicar o
                    pickup e não são de responsabilidade da Alpinea nem do fornecedor. Isso não
                    confirma pagamento — nossa equipe entra em contato pelo WhatsApp pra fechar a
                    logística antes de qualquer cobrança.
                  </p>
              </div>
              <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/80">
                <input
                  type="checkbox"
                  checked={termosAceitos}
                  disabled={!termosRolados}
                  onChange={(e) => setTermosAceitos(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
                />
                Li e aceito os termos e condições de contratação do motorista privado acima.
              </label>
              {!termosRolados && (
                <p className="mt-1.5 pl-8 text-xs text-black/55">Role o texto acima até o fim para habilitar o aceite.</p>
              )}
            </div>

            {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
          </>
        )}
      </div>

      {/* Rodapé enxuto compartilhado — sem selo da Stone (não há pagamento
          automático aqui; o botão só envia o pedido). */}
      {status !== "enviado" && (
        <RodapeCheckout
          containerRef={rodapeRef}
          pendencias={pendenciasFinalizar}
          formValido={formValido}
          enviando={status === "enviando"}
          onFinalizar={enviar}
          rotuloValor="Total estimado"
          valor={quantidadeItens > 0 ? formatBRL(totalBRL) : null}
          detalhe={quantidadeItens > 0 ? `${resumoSelecao} · ${formatUSD(totalUSD)}` : undefined}
          semValor="Selecione ao menos uma rota ou tour para ver o valor."
          rotuloBotao="Solicitar transporte"
          mostrarStone={false}
          sentinelaId="checkout-ultimo-passo"
          classeValor={inter.className}
        />
      )}
    </main>
  );
}
