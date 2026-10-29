"use client";

// eSIM — página de produto com compra automatizada (Wilson, 26/out/2026):
// "vamos integrar nosso parceiro para compra direto pelo site [...]
// ofereceremos somente plano ilimitado" + "vamos usar nossa integração com
// Stone". Catálogo e preço vêm da Simpremium via /api/esim-planos (sem o
// NET); o pedido vai para /api/esim-selfservice, que recalcula o valor,
// grava no CRM e devolve o link da Stone. Com o pagamento confirmado, o
// webhook da Pagar.me emite o eSIM na Simpremium.

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL } from "../../hooks/useCambioUSD";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import { inter, mascararWhatsapp, formatarDiaMes, Campo, classeInput } from "../../components/transporte/compartilhado";
import { AvisoPagamentoConcluido } from "../AvisoPagamentoConcluido";
import { RodapeCheckout } from "../RodapeCheckout";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba, BlocoPagamentoNovaAba } from "../pagamentoNovaAba";
import { diasEsim, faixaParaViagem, MAX_DIAS_ESIM, MIN_DIAS_ESIM, MAX_ESIMS_POR_PEDIDO, type FaixaPreco } from "../../lib/precoEsim";
import { COMO_FUNCIONA_ESIM_SIMPREMIUM, TERMOS_ESIM_SIMPREMIUM } from "../../lib/esimConteudo";

type FaixaPublica = { minDays: number; maxDays: number; precoUSD: number; precoBRL: number };
type PlanoPublico = { id: string; nome: string; faixas: FaixaPublica[] };
type Catalogo = { carregando: boolean; disponivel: boolean; planos: PlanoPublico[] };

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

// A tabela da Simpremium vem com priceUsd; a pública já traz o preço
// Ajisai — adapta para reaproveitar faixaParaViagem.
function escolherFaixa(plano: PlanoPublico, dias: number) {
  const faixas: FaixaPreco[] = plano.faixas.map((f) => ({ minDays: f.minDays, maxDays: f.maxDays, priceUsd: f.precoUSD }));
  const escolha = faixaParaViagem(faixas, dias);
  if (!escolha) return null;
  const faixa = plano.faixas.find((f) => f.minDays === escolha.faixa.minDays && f.maxDays === escolha.faixa.maxDays)!;
  return { faixa, diasPedido: escolha.diasPedido };
}

export default function EsimPage() {
  const [catalogo, setCatalogo] = useState<Catalogo>({ carregando: true, disponivel: false, planos: [] });
  const [dataChegada, setDataChegada] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [planoId, setPlanoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [nomesAparelhos, setNomesAparelhos] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [aparelhoCompativel, setAparelhoCompativel] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const rodapeRef = useRef<HTMLDivElement | null>(null);
  // Espaço no fim da página = altura real do rodapé fixo (que cresce quando
  // a lista "Faltam X itens" aparece). Com o pb-48 fixo, os Termos e o que
  // vinha abaixo ficavam escondidos atrás do rodapé e a rolagem parava
  // antes (Wilson, 26/out/2026). Mesmo padrão do JR Pass.
  const [alturaRodape, setAlturaRodape] = useState(0);
  useEffect(() => {
    const elemento = rodapeRef.current;
    if (!elemento) {
      setAlturaRodape(0);
      return;
    }
    const observer = new ResizeObserver(() => setAlturaRodape(elemento.offsetHeight));
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [status]);

  useEffect(() => {
    let ativo = true;
    fetch("/api/esim-planos")
      .then((r) => r.json())
      .then((d: { disponivel?: boolean; planos?: PlanoPublico[] }) => {
        if (!ativo) return;
        const planos = Array.isArray(d.planos) ? d.planos : [];
        setCatalogo({ carregando: false, disponivel: Boolean(d.disponivel) && planos.length > 0, planos });
        if (planos.length === 1) setPlanoId(planos[0]!.id);
      })
      .catch(() => ativo && setCatalogo({ carregando: false, disponivel: false, planos: [] }));
    return () => {
      ativo = false;
    };
  }, []);

  const hoje = hojeISO();
  const erroChegada = !dataChegada ? "Informe a data de chegada." : dataChegada < hoje ? "A chegada precisa ser hoje ou depois." : null;
  const dias = diasEsim(dataChegada, dataPartida);
  const erroPartida = !dataPartida
    ? "Informe a data de partida."
    : dataChegada && dataPartida < dataChegada
      ? "A partida precisa ser no dia da chegada ou depois."
      : dias > MAX_DIAS_ESIM
        ? `Para mais de ${MAX_DIAS_ESIM} dias, fale com a nossa equipe.`
        : null;
  const periodoValido = !erroChegada && !erroPartida && dias > 0;

  const plano = catalogo.planos.find((p) => p.id === planoId) ?? null;
  const escolha = useMemo(() => (plano && periodoValido ? escolherFaixa(plano, dias) : null), [plano, periodoValido, dias]);
  const totalBRL = escolha ? Math.round(escolha.faixa.precoBRL * quantidade * 100) / 100 : null;

  const cpfDigitos = cpf.replace(/\D/g, "");
  const pendencias: string[] = [];
  if (!periodoValido) pendencias.push("Datas de chegada e partida");
  if (!plano) pendencias.push("Escolha do plano");
  else if (periodoValido && !escolha) pendencias.push("Plano disponível para essa quantidade de dias");
  if (nome.trim().length < 3) pendencias.push("Nome completo");
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) pendencias.push("E-mail válido");
  if (whatsapp.replace(/\D/g, "").length < 10) pendencias.push("WhatsApp com DDD");
  if (cpfDigitos && cpfDigitos.length !== 11) pendencias.push("CPF com 11 dígitos (ou deixe em branco)");
  if (!aparelhoCompativel) pendencias.push("Confirmar aparelho compatível e desbloqueado");
  if (!termosAceitos) pendencias.push("Aceitar os termos do eSIM");
  const formValido = pendencias.length === 0 && catalogo.disponivel;

  function alterarQuantidade(n: number) {
    const q = Math.max(1, Math.min(MAX_ESIMS_POR_PEDIDO, n));
    setQuantidade(q);
    setNomesAparelhos((atual) => atual.slice(0, q));
  }

  async function enviar() {
    if (!formValido || status === "enviando") return;
    const janela = abrirAbaPagamento();
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/esim-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planoId,
          dataChegada,
          dataPartida,
          quantidade,
          nomesAparelhos: Array.from({ length: quantidade }, (_, i) => (i === 0 ? nome.trim() : (nomesAparelhos[i] ?? "").trim())),
          nome,
          email,
          whatsapp,
          cpf,
          observacoes,
          aparelhoCompativel,
          termosAceitos,
          totalBRL,
        }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !dados?.checkoutUrl) {
        fecharAba(janela);
        setErro(dados?.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      if (enviarParaPagamento(janela, dados.checkoutUrl)) {
        setLinkPagamento(dados.checkoutUrl);
        setStatus("enviado");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      fecharAba(janela);
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Quero ajuda com o eSIM para o Japão pelo site da Ajisai.${nome ? ` Meu nome é ${nome}.` : ""}`;
  const linkWhatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`;
  const classeData =
    "block min-h-[46px] w-full min-w-0 appearance-none rounded-lg border border-black/15 bg-white px-3 py-2.5 text-left text-sm text-black focus:border-[#2f80c9] focus:outline-none";

  return (
    <main className="min-h-screen overflow-x-clip bg-white pt-14 text-black [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm"
      style={status !== "enviado" ? { paddingBottom: alturaRodape + 32 } : undefined}
    >
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link href="/produtos" className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>eSIM</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl px-5 pt-5 md:px-8 md:pt-8">
        {status === "enviado" ? (
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>Recebemos seu pedido</h1>
            {linkPagamento && <BlocoPagamentoNovaAba url={linkPagamento} />}
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-black/70">
              Assim que a Stone confirmar o pagamento, o seu eSIM é emitido automaticamente e as instruções de instalação chegam
              por e-mail.
            </p>
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
            >
              Falar com a equipe
            </a>
          </div>
        ) : (
          <>
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-64 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[62%]">
                <Image src="/images/banner-esim-japao.webp" alt="Casal usando o celular em um café em Asakusa, Tóquio" fill priority sizes="(min-width: 640px) 660px, 100vw" className="object-cover object-[72%_40%]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent" />
              </div>
              <div className="relative -mt-12 px-5 pb-8 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[46%] sm:flex-col sm:justify-center sm:px-10 sm:py-12 md:min-h-[380px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">eSIM Japão</p>
                <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>Internet ilimitada desde o desembarque</h1>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Sem retirar nem devolver aparelho: o eSIM é instalado no seu celular e o seu chip brasileiro continua funcionando.
                </p>
              </div>
            </section>

            <AvisoPagamentoConcluido />

            <div className="mt-8 rounded-2xl bg-[#eef6fb] p-5 sm:p-6">
              <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-[#1c6ea8]">Como funciona</p>
              <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
                {COMO_FUNCIONA_ESIM_SIMPREMIUM.map((passo, i) => (
                  <div key={passo.titulo} className="flex min-w-0 flex-col items-center text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">Passo {i + 1}</p>
                    <Image src={passo.icone} alt="" width={256} height={256} className="mt-2 h-20 w-20 object-contain" />
                    <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
                    <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {!catalogo.carregando && !catalogo.disponivel && (
              <div className="mt-8 rounded-2xl border border-amber-300/70 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                A compra online de eSIM está indisponível neste momento.{" "}
                <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                  Fale com a nossa equipe pelo WhatsApp
                </a>{" "}
                e emitimos para você.
              </div>
            )}

            {/* 1 — Datas */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={1} titulo="Datas no Japão" />
              <p className="mt-1 text-sm text-black/70">O plano começa a contar na data de chegada.</p>
              <div className="mt-5 grid gap-4 sm:max-w-lg sm:grid-cols-2">
                <Campo rotulo="Chegada" erro={dataChegada ? erroChegada : null}>
                  <input type="date" min={hoje} value={dataChegada} onChange={(e) => setDataChegada(e.target.value)} className={classeData} />
                </Campo>
                <Campo rotulo="Partida" erro={dataPartida ? erroPartida : null}>
                  <input type="date" min={dataChegada || hoje} value={dataPartida} onChange={(e) => setDataPartida(e.target.value)} className={classeData} />
                </Campo>
              </div>
              {periodoValido && (
                <p className="mt-3 text-sm text-black/70">
                  {formatarDiaMes(dataChegada)} a {formatarDiaMes(dataPartida)} · <strong className="font-semibold text-black">{dias} {dias === 1 ? "dia" : "dias"}</strong> de internet
                </p>
              )}
            </div>

            {/* 2 — Plano */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={2} titulo="Plano" />
              {catalogo.carregando ? (
                <p className="mt-4 text-sm text-black/50">Carregando planos…</p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {catalogo.planos.map((p) => {
                    const ativo = p.id === planoId;
                    const e = periodoValido ? escolherFaixa(p, dias) : null;
                    const aPartir = Math.min(...p.faixas.map((f) => f.precoBRL));
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setPlanoId(p.id)}
                          aria-pressed={ativo}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition sm:p-5 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.03] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <Image src="/images/icone-esim-v2.png" alt="" width={803} height={803} className="h-11 w-11 shrink-0 object-contain" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-medium text-black">{p.nome}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-black/60">Dados ilimitados · 5G/4G</span>
                            <span className={`${inter.className} mt-2 block text-lg font-bold tabular-nums text-[#0A2540]`}>
                              {e ? formatBRL(e.faixa.precoBRL) : `a partir de ${formatBRL(aPartir)}`}
                            </span>
                            {e && (
                              <span className="block text-xs text-black/50">
                                por eSIM · {e.diasPedido} dias{e.diasPedido > dias ? (dias < MIN_DIAS_ESIM ? ` (duração mínima de ${MIN_DIAS_ESIM} dias)` : ` (menor plano que cobre ${dias} dias)`) : ""}
                              </span>
                            )}
                            {periodoValido && !e && <span className="block text-xs text-red-600">Sem plano para {dias} dias.</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 3 — Quantidade */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={3} titulo="Quantos eSIMs" />
              <p className="mt-1 text-sm text-black/70">Um por celular.</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alterarQuantidade(quantidade - 1)}
                  disabled={quantidade <= 1}
                  aria-label="Menos eSIMs"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                >
                  −
                </button>
                <span className={`${inter.className} w-8 text-center text-lg font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => alterarQuantidade(quantidade + 1)}
                  disabled={quantidade >= MAX_ESIMS_POR_PEDIDO}
                  aria-label="Mais eSIMs"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                >
                  +
                </button>
              </div>
              {quantidade > 1 && (
                <div className="mt-4 grid gap-3 sm:max-w-lg">
                  <p className="text-xs text-black/55">Nome de quem vai usar cada eSIM (opcional — o primeiro é o seu).</p>
                  {Array.from({ length: quantidade - 1 }, (_, i) => i + 1).map((i) => (
                    <input
                      key={i}
                      value={nomesAparelhos[i] ?? ""}
                      onChange={(e) =>
                        setNomesAparelhos((atual) => {
                          const novo = [...atual];
                          novo[i] = e.target.value;
                          return novo;
                        })
                      }
                      placeholder={`eSIM ${i + 1} — nome`}
                      className={classeInput(false)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 4 — Dados */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={4} titulo="Seus dados" />
              <p className="mt-1 text-sm text-black/70">O eSIM e as instruções de instalação chegam neste e-mail.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Nome completo">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={classeInput(false)} />
                </Campo>
                <Campo rotulo="E-mail">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={classeInput(false)} />
                </Campo>
                <Campo rotulo="WhatsApp">
                  <input
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                    autoComplete="tel"
                    className={classeInput(false)}
                  />
                </Campo>
                <Campo rotulo="CPF (opcional)">
                  <input inputMode="numeric" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/[^\d.-]/g, "").slice(0, 14))} className={classeInput(false)} />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo rotulo="Observações (opcional)">
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none"
                    />
                  </Campo>
                </div>
              </div>
            </div>

            {/* 5 — Termos */}
            <div id="checkout-ultimo-passo" className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={5} titulo="Termos do eSIM" />
              <ul className="mt-4 list-disc space-y-1.5 rounded-xl border border-black/10 bg-black/[0.02] p-4 pl-8 text-xs leading-5 text-black/75">
                {TERMOS_ESIM_SIMPREMIUM.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-black/80">
                <input
                  type="checkbox"
                  checked={aparelhoCompativel}
                  onChange={(e) => setAparelhoCompativel(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                />
                Confirmo que {quantidade === 1 ? "o celular é compatível" : "os celulares são compatíveis"} com eSIM e desbloqueado{quantidade === 1 ? "" : "s"}.
              </label>
              <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-black/80">
                <input
                  type="checkbox"
                  checked={termosAceitos}
                  onChange={(e) => setTermosAceitos(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                />
                <span>
                  Li e aceito os termos do eSIM e a{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-[#1c6ea8] underline underline-offset-2">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
              {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
            </div>
          </>
        )}
      </div>

      {status !== "enviado" && (
        <RodapeCheckout
          containerRef={rodapeRef}
          pendencias={pendencias}
          formValido={formValido}
          enviando={status === "enviando"}
          onFinalizar={enviar}
          rotuloValor="Total"
          valor={totalBRL !== null ? formatBRL(totalBRL) : null}
          detalhe={escolha ? `Ilimitado · ${escolha.diasPedido} dias · ${quantidade} ${quantidade === 1 ? "eSIM" : "eSIMs"}` : undefined}
          semValor="Informe as datas da viagem para ver o valor."
          rotuloBotao="Finalizar compra"
          sentinelaId="checkout-ultimo-passo"
          classeValor={inter.className}
        />
      )}
    </main>
  );
}
