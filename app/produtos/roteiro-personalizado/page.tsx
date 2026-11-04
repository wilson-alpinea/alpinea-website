"use client";

// Roteiro Personalizado — página de produto no template novo de /produtos
// (Wilson, 03/nov/2026: "os cards roteiro personalizado e viagem
// personalizada estão no template antigo, altere para o novo"). Substitui o
// pop-up antigo de /produtos. O pedido cai no CRM (tag SELF-SERVICE,
// /api/roteiro-selfservice) e, desde 04/nov/2026, é pago online pela Stone
// (Pix ou cartão) em nova aba — o servidor recalcula o total. Se o link da
// Stone não abrir, a equipe envia o pagamento pelo WhatsApp.
// Preço = mesma regra da calculadora do pop-up antigo (PriceCalculator).

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import { inter, mascararWhatsapp, Campo, classeInput } from "../../components/transporte/compartilhado";
import { EscopoServico } from "../../components/EscopoServico";
import { RodapeCheckout } from "../RodapeCheckout";
import { AvisoPagamentoConcluido } from "../AvisoPagamentoConcluido";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba, BlocoPagamentoNovaAba } from "../pagamentoNovaAba";
import { BarraProduto, ComoFunciona, Contador, TelaEnviado, TituloPasso, type PassoComoFunciona } from "../templateProduto";
import {
  BASE_DAYS,
  MAX_DAYS,
  MAX_PASSENGERS,
  MIN_DAYS,
  MIN_PASSENGERS,
  TAXA_USD_A_CADA_2_PASSAGEIROS,
  calculatePrice,
  calcularGruposExtras,
} from "../../components/PriceCalculator";

const COMO_FUNCIONA: PassoComoFunciona[] = [
  { icone: "/images/produtos/seguro-passo-1-pedido.png", titulo: "Faça o pedido", texto: "Informe dias, pessoas e seus dados. O valor aparece na hora." },
  { icone: "/images/produtos/cambio-passo-3-confirmacao.png", titulo: "Briefing", texto: "Nossa equipe fala com você pelo WhatsApp para entender o seu perfil e ritmo." },
  { icone: "/images/icone-esim-passo-datas.png", titulo: "Planejamos cada dia", texto: "Cidade, horário, atração, deslocamento e refeição, dia a dia." },
  { icone: "/images/icone-esim-passo-conecte.png", titulo: "Painel no celular", texto: "Você recebe o painel digital e consulta do embarque ao último dia." },
];

const INCLUIDO = [
  "Cada dia planejado de acordo com o seu perfil: cidade, horário, atração, deslocamento e refeição",
  "Cada atração com melhor horário, tempo de visita, estação, transporte recomendado e ingressos",
  "Hotéis, restaurantes, logística e anexos especiais organizados num único painel",
  "Painel digital acessível pelo celular, do início ao fim da viagem",
];
const NAO_INCLUIDO = [
  "Reservas e compras: hotéis, passagens, ingressos e transporte ficam por sua conta (ou contrate a Viagem Personalizada)",
  "Guia ou acompanhamento presencial durante a viagem",
];

export default function RoteiroPersonalizadoPage() {
  const cambio = useCambioUSD();
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [dataViagem, setDataViagem] = useState("");
  const [cidades, setCidades] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [escopoCiente, setEscopoCiente] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const rodapeRef = useRef<HTMLDivElement | null>(null);
  const [alturaRodape, setAlturaRodape] = useState(0);
  useEffect(() => {
    const elemento = rodapeRef.current;
    if (!elemento) return setAlturaRodape(0);
    const observer = new ResizeObserver(() => setAlturaRodape(elemento.offsetHeight));
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [status]);

  // Preço-base em reais (fonte única em app/lib/precoRoteiro.ts: R$ 2.243 até 15 dias + R$ 179 por dia extra) e
  // taxa de grupo em dólar (US$ 80 a cada 2 pessoas acima de 3).
  const baseBRL = calculatePrice(dias);
  const taxaGrupoUSD = calcularGruposExtras(pessoas) * TAXA_USD_A_CADA_2_PASSAGEIROS;
  const totalBRL = cambio ? Math.round((baseBRL + taxaGrupoUSD * cambio.cotacao) * 100) / 100 : null;
  const totalUSD = cambio ? baseBRL / cambio.cotacao + taxaGrupoUSD : null;

  const hoje = hojeISO();
  const pendencias: string[] = [];
  if (dataViagem && dataViagem < hoje) pendencias.push("Data prevista a partir de hoje (ou deixe em branco)");
  if (nome.trim().length < 3) pendencias.push("Nome completo");
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) pendencias.push("E-mail válido");
  if (whatsapp.replace(/\D/g, "").length < 10) pendencias.push("WhatsApp com DDD");
  if (!escopoCiente) pendencias.push("Confirmar o que está incluído");
  if (!termosAceitos) pendencias.push("Aceitar a Política de Privacidade");
  const formValido = pendencias.length === 0;

  const mensagemWhatsapp = [
    "Olá! Fiz o pedido do Roteiro Personalizado pelo site da Ajisai.",
    nome && `Nome: ${nome}`,
    `${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
    totalBRL !== null && `Valor: ${formatBRL(totalBRL)}`,
  ]
    .filter(Boolean)
    .join("\n");
  const linkWhatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`;

  async function enviar() {
    if (!formValido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    // Pagamento Stone em nova aba, aberta no clique (antes do fetch, senão o
    // navegador bloqueia o pop-up) — mesmo fluxo do Guia Turístico.
    const janelaPagamento = abrirAbaPagamento();
    try {
      const resposta = await fetch("/api/roteiro-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, whatsapp, dias, pessoas, dataViagem, cidades, observacoes, totalBRL, totalUSD, cotacao: cambio?.cotacao ?? null, escopoCiente, termosAceitos, pagarOnline: true }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados?.error || "Não foi possível enviar seu pedido agora. Tente de novo.");
      window.gtag?.("event", "generate_lead", { form_name: "roteiro_personalizado", contact_channel: "site" });
      if (dados?.checkoutUrl) {
        if (!enviarParaPagamento(janelaPagamento, dados.checkoutUrl)) return; // a página atual foi para a Stone
        setLinkPagamento(dados.checkoutUrl);
      } else {
        fecharAba(janelaPagamento);
      }
      setStatus("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      fecharAba(janelaPagamento);
      setErro(e instanceof Error ? e.message : "Não foi possível enviar seu pedido agora.");
      setStatus("erro");
    }
  }

  return (
    <main
      className="min-h-screen overflow-x-clip bg-white pt-14 text-black [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm"
      style={status !== "enviado" ? { paddingBottom: alturaRodape + 32 } : undefined}
    >
      <BarraProduto titulo="Roteiro Personalizado" />

      {status === "enviado" ? (
        <>
          {linkPagamento && (
            <div className="px-5 pt-10">
              <BlocoPagamentoNovaAba url={linkPagamento} />
            </div>
          )}
          <TelaEnviado
            titulo="Recebemos seu pedido"
            texto={
              linkPagamento
                ? "Conclua o pagamento na aba da Stone. Depois da confirmação, nossa equipe fala com você pelo WhatsApp para o briefing — em geral no mesmo dia útil."
                : "Não conseguimos abrir o pagamento online agora. Nossa equipe envia o link de pagamento e marca o briefing com você pelo WhatsApp — em geral no mesmo dia útil."
            }
            linkWhatsapp={linkWhatsapp}
          />
        </>
      ) : (
        <div className="mx-auto max-w-5xl px-5 pt-5 md:px-8 md:pt-8">
          <AvisoPagamentoConcluido />
          {/* Banner */}
          <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
            <div className="relative h-72 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[50%]">
              <Image
                src="/images/mock-roteiro-iphone.png"
                alt="Painel do Roteiro Personalizado no celular — dias, atrações e logística"
                fill
                priority
                sizes="(min-width: 640px) 500px, 100vw"
                className="object-contain object-center py-4"
              />
            </div>
            <div className="relative px-5 pb-8 sm:flex sm:min-h-[380px] sm:max-w-[52%] sm:flex-col sm:justify-center sm:px-10 sm:py-12">
              <p className="text-xs uppercase tracking-[0.3em] text-white/75">Roteiro Personalizado</p>
              <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>Isto não é uma lista de lugares para visitar</h1>
              <p className="mt-3 text-sm leading-6 text-white/70">
                É um painel digital onde cada dia da sua viagem é planejado de acordo com o seu perfil. Nós planejamos; você reserva e viaja por
                conta própria.
              </p>
              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-white/55">A partir de</p>
              <p className={`${inter.className} text-2xl font-bold tabular-nums text-white`}>
                {formatBRL(calculatePrice(MIN_DAYS))}
                <span className="ml-2 text-sm font-medium text-white/60">até {BASE_DAYS} dias</span>
              </p>
            </div>
          </section>

          <ComoFunciona passos={COMO_FUNCIONA} />

          <EscopoServico
            titulo="O que você está contratando"
            incluido={INCLUIDO}
            naoIncluido={NAO_INCLUIDO}
            video={{ tipo: "mp4", src: "/videos/roteiro-personalizado-short.mp4", poster: "/videos/roteiro-personalizado-short-poster.jpg" }}
            tituloVideo="Demonstração do Roteiro Personalizado"
          />
          <details className="mt-3 rounded-2xl border border-black/10 p-4 sm:p-5">
            <summary className="cursor-pointer text-sm font-medium text-[#1c6ea8]">Quer ver mais? Versão completa do painel · 8:08</summary>
            <div className="mt-3 overflow-hidden rounded-xl bg-black">
              <video controls playsInline preload="none" poster="/videos/roteiro-personalizado-detalhado-poster.jpg" className="aspect-video h-auto w-full">
                <source src="/videos/roteiro-personalizado-detalhado.mp4" type="video/mp4" />
              </video>
            </div>
            <a href="/ajisairoteiros" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-[#1c6ea8] underline underline-offset-2">
              Ver um roteiro completo de exemplo
            </a>
          </details>

          {/* 1 — Viagem */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <TituloPasso numero={1} titulo="Sua viagem" />
            <p className="mt-1 text-sm text-black/70">
              Até {BASE_DAYS} dias o valor é fixo; acima disso, {formatBRL(calculatePrice(BASE_DAYS + 1) - calculatePrice(BASE_DAYS))} por dia extra.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Contador rotulo="Dias de viagem" valor={dias} min={MIN_DAYS} max={MAX_DAYS} formatar={(n) => `${n} dias`} onChange={setDias} />
              <Contador
                rotulo="Pessoas"
                valor={pessoas}
                min={MIN_PASSENGERS}
                max={MAX_PASSENGERS}
                formatar={(n) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`}
                onChange={setPessoas}
              />
              <Campo rotulo="Data prevista (opcional)" erro={dataViagem && dataViagem < hoje ? "A data precisa ser hoje ou depois." : null}>
                <input type="date" min={hoje} value={dataViagem} onChange={(e) => setDataViagem(e.target.value)} className={classeInput(false)} />
              </Campo>
              <Campo rotulo="Cidades de interesse (opcional)" ajuda="Ex.: Tóquio, Kyoto, Osaka">
                <input value={cidades} onChange={(e) => setCidades(e.target.value)} className={classeInput(false)} />
              </Campo>
            </div>
            {taxaGrupoUSD > 0 && (
              <p className="mt-4 text-xs text-black/55">
                Grupos acima de 3 pessoas: {formatUSD(TAXA_USD_A_CADA_2_PASSAGEIROS)} a cada 2 pessoas adicionais ({formatUSD(taxaGrupoUSD)} no total).
              </p>
            )}
          </div>

          {/* 2 — Dados */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <TituloPasso numero={2} titulo="Seus dados" />
            <p className="mt-1 text-sm text-black/70">O comprovante chega por e-mail; nossa equipe entra em contato por este WhatsApp para o briefing.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome completo">
                <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={classeInput(false)} />
              </Campo>
              <Campo rotulo="E-mail">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={classeInput(false)} />
              </Campo>
              <Campo rotulo="WhatsApp">
                <input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))} autoComplete="tel" className={classeInput(false)} />
              </Campo>
              <div className="sm:col-span-2">
                <Campo rotulo="Observações (opcional)">
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    placeholder="Ritmo, interesses, restrições alimentares, ocasião especial…"
                    className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                  />
                </Campo>
              </div>
            </div>
          </div>

          {/* 3 — Confirmação */}
          <div id="checkout-ultimo-passo" className="mt-8 border-t border-black/10 pt-6">
            <TituloPasso numero={3} titulo="Confirmação" />
            <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-black/80">
              <input
                type="checkbox"
                checked={escopoCiente}
                onChange={(e) => setEscopoCiente(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
              />
              Entendi que o Roteiro Personalizado é o planejamento da viagem — reservas e compras ficam por minha conta.
            </label>
            <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/80">
              <input
                type="checkbox"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
              />
              <span>
                Li e aceito a{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-[#1c6ea8] underline underline-offset-2">
                  Política de Privacidade
                </a>
                .
              </span>
            </label>
            <p className="mt-4 text-xs leading-5 text-black/55">
              Ao continuar, o pagamento abre em uma nova aba, pela Stone (Pix ou cartão). Depois da confirmação, nossa equipe fala com você pelo
              WhatsApp para o briefing.
            </p>
            {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
          </div>
        </div>
      )}

      {status !== "enviado" && (
        <RodapeCheckout
          containerRef={rodapeRef}
          pendencias={pendencias}
          formValido={formValido}
          enviando={status === "enviando"}
          onFinalizar={enviar}
          rotuloValor="Total"
          valor={totalBRL !== null ? formatBRL(totalBRL) : null}
          detalhe={`${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}${totalUSD !== null ? ` · ${formatUSD(totalUSD)}` : ""}`}
          semValor="Carregando a cotação do dia…"
          semValorAviso={false}
          rotuloBotao="Ir para o pagamento"
          mostrarStone
          sentinelaId="checkout-ultimo-passo"
          classeValor={inter.className}
        />
      )}
    </main>
  );
}
