"use client";

// Seguro Viagem — cliente final cota e compra pelo parceiro Real Seguro
// Viagem (Wilson, 26/out/2026). A página antiga (Affinity/GTA/MTA com preço
// próprio e Stone) está guardada em PaginaSeguroLegado.tsx.
//
// Fluxo: datas + nascimentos → /api/seguro-viagem/cotacao (3 níveis
// curados, preço final já com a margem por idade) → dados dos viajantes →
// /api/seguro-viagem/checkout (modo comissionado) → o cliente paga no link
// do fornecedor, em nova aba.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { inter, mascararWhatsapp, Campo, classeInput } from "../../components/transporte/compartilhado";
import { formatBRL } from "../../hooks/useCambioUSD";
import { display, WHATSAPP_NUMBER, hojeISO, formatarDataBR } from "../page";
import { RodapeCheckout } from "../RodapeCheckout";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba } from "../pagamentoNovaAba";
import { IDADE_MAXIMA_ONLINE, NIVEIS, idadeNaData, type PlanoNivel } from "../../lib/margemSeguroViagemParceiro";

const MAX_VIAJANTES = 10;

const COMO_FUNCIONA = [
  { icone: "/images/produtos/seguro-passo-1-pedido.png", titulo: "Cote em segundos", texto: "Informe as datas e a idade de quem viaja e compare 3 níveis de cobertura." },
  { icone: "/images/produtos/seguro-passo-2-apolice.png", titulo: "Pague online", texto: "Pix ou cartão na página segura da Real Seguro Viagem, nossa parceira." },
  { icone: "/images/produtos/seguro-passo-3-viagem.png", titulo: "Receba a apólice", texto: "Após o pagamento, a seguradora tem até 24 horas para enviar a apólice por e-mail." },
  { icone: "/images/produtos/seguro-passo-4-assistencia.png", titulo: "Acione quando precisar", texto: "Durante a viagem, fale direto com a central 24 h da seguradora." },
];

const TERMOS = [
  "O seguro é contratado com a seguradora indicada no plano, por intermédio da Real Seguro Viagem, parceira da Ajisai. O pagamento é feito na página segura do fornecedor.",
  "Coberturas, limites, carências e exclusões seguem as Condições Gerais da seguradora (link em cada plano). Leia antes de contratar.",
  "Os dados dos viajantes (nome, data de nascimento e CPF ou passaporte) precisam estar corretos: são eles que constam na apólice.",
  "Após a confirmação do pagamento, a seguradora tem até 24 horas para emitir e enviar a apólice por e-mail. Cancelamentos e reembolsos seguem as regras da seguradora.",
  "Em caso de necessidade durante a viagem, acione a central de atendimento da seguradora antes de fazer despesas por conta própria.",
];

type Viajante = { nascimento: string; nome: string; tipoDocumento: "cpf" | "passaporte"; documento: string };
const viajanteVazio = (): Viajante => ({ nascimento: "", nome: "", tipoDocumento: "cpf", documento: "" });

function TituloPasso({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f80c9] text-[10px] font-semibold text-white">{numero}</span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-black">{titulo}</p>
    </div>
  );
}

const classeData =
  "block min-h-[46px] w-full min-w-0 appearance-none rounded-lg border border-black/15 bg-white px-3 py-2.5 text-left text-sm text-black focus:border-[#2f80c9] focus:outline-none";

export default function SeguroViagemPage() {
  const [partida, setPartida] = useState("");
  const [retorno, setRetorno] = useState("");
  const [travelling, setTravelling] = useState<"0" | "1">("0");
  const [viajantes, setViajantes] = useState<Viajante[]>([viajanteVazio()]);
  const [cotando, setCotando] = useState(false);
  const [erroCotacao, setErroCotacao] = useState("");
  const [planos, setPlanos] = useState<PlanoNivel[] | null>(null);
  const [nivelEscolhido, setNivelEscolhido] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado">("form");
  const [erro, setErro] = useState("");
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
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

  const hoje = hojeISO();
  const datasOk = /^\d{4}-\d{2}-\d{2}$/.test(partida) && partida >= hoje && /^\d{4}-\d{2}-\d{2}$/.test(retorno) && retorno >= partida;
  const idades = viajantes.map((v) => (datasOk ? idadeNaData(v.nascimento, partida) : null));
  const nascimentosOk = idades.every((i) => i !== null);
  const acimaDoLimite = idades.some((i) => i !== null && i > IDADE_MAXIMA_ONLINE);
  const podeCotar = datasOk && nascimentosOk && !acimaDoLimite;

  const plano = planos?.find((p) => p.nivel === nivelEscolhido) ?? null;
  const linkWhatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Quero ajuda com o seguro viagem para o Japão pelo site da Ajisai.")}`;

  // Qualquer mudança em datas/viajantes invalida a cotação (o preço depende delas).
  function invalidar() {
    setPlanos(null);
    setNivelEscolhido(null);
  }
  function alterarViajante(i: number, campo: keyof Viajante, valor: string) {
    if (campo === "nascimento") invalidar();
    setViajantes((atual) => atual.map((v, j) => (j === i ? { ...v, [campo]: valor } : v)));
  }
  function alterarQuantidade(n: number) {
    const q = Math.max(1, Math.min(MAX_VIAJANTES, n));
    invalidar();
    setViajantes((atual) => (q > atual.length ? [...atual, ...Array.from({ length: q - atual.length }, viajanteVazio)] : atual.slice(0, q)));
  }

  async function cotar() {
    if (!podeCotar || cotando) return;
    setCotando(true);
    setErroCotacao("");
    try {
      const r = await fetch("/api/seguro-viagem/cotacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partida, retorno, travelling, nascimentos: viajantes.map((v) => v.nascimento) }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !Array.isArray(d.niveis)) {
        setErroCotacao(d.error || "Não foi possível cotar agora. Tente de novo.");
        setPlanos(null);
        return;
      }
      setPlanos(d.niveis);
      setNivelEscolhido(d.niveis.find((p: PlanoNivel) => p.nivel === "recomendado")?.nivel ?? d.niveis[0]?.nivel ?? null);
      setTimeout(() => document.getElementById("passo-planos")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setErroCotacao("Não foi possível cotar agora. Tente de novo.");
    } finally {
      setCotando(false);
    }
  }

  const pendencias: string[] = [];
  if (!datasOk) pendencias.push("Datas da viagem");
  if (!nascimentosOk) pendencias.push("Data de nascimento de todos os viajantes");
  if (!plano) pendencias.push("Cotar e escolher um plano");
  if (nome.trim().length < 3) pendencias.push("Seu nome completo");
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) pendencias.push("E-mail válido");
  if (celular.replace(/\D/g, "").length < 10) pendencias.push("Celular com DDD");
  viajantes.forEach((v, i) => {
    if (v.nome.trim().length < 3) pendencias.push(`Nome do viajante ${i + 1}`);
    const doc = v.tipoDocumento === "cpf" ? v.documento.replace(/\D/g, "").length === 11 : v.documento.trim().length >= 5;
    if (!doc) pendencias.push(`${v.tipoDocumento === "cpf" ? "CPF" : "Passaporte"} do viajante ${i + 1}`);
  });
  if (!termosAceitos) pendencias.push("Aceitar os termos");
  const formValido = pendencias.length === 0;

  async function finalizar() {
    if (!formValido || !plano || status === "enviando") return;
    const janela = abrirAbaPagamento();
    setStatus("enviando");
    setErro("");
    try {
      const r = await fetch("/api/seguro-viagem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: plano.token, nome, email, celular, observacoes, termosAceitos, viajantes }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) {
        fecharAba(janela);
        setErro(d.error || "Não foi possível gerar o pagamento agora. Tente de novo.");
        setStatus("form");
        if (r.status === 409) invalidar();
        return;
      }
      setLinkPagamento(d.url);
      setStatus("enviado");
      enviarParaPagamento(janela, d.url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      fecharAba(janela);
      setErro("Não foi possível gerar o pagamento agora. Tente de novo.");
      setStatus("form");
    }
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white pt-14 text-black [&_input:not([type=checkbox]):not([type=radio])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox]):not([type=radio])]:text-sm md:[&_textarea]:text-sm"
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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Seguro Viagem</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      <div className="mx-auto max-w-5xl px-5 pt-5 md:px-8 md:pt-8">
        {status === "enviado" ? (
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>Falta só o pagamento</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-black/70">
              O pagamento abriu em uma nova aba, na página segura da Real Seguro Viagem. Depois de pagar, a seguradora tem até 24 horas para enviar a apólice por e-mail.
              Também mandamos o link para {email}.
            </p>
            {linkPagamento && (
              <a href={linkPagamento} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-[#1f6fb8] underline underline-offset-2">
                A aba não abriu? Abrir o pagamento →
              </a>
            )}
            <div>
              <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]">
                Falar com a equipe
              </a>
            </div>
          </div>
        ) : (
          <>
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-64 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[62%]">
                <Image src="/images/produtos/seguro-viagem-header.jpg" alt="Casal caminhando por uma rua tradicional de Kyoto" fill priority sizes="(min-width: 640px) 660px, 100vw" className="object-cover object-[50%_35%]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent" />
              </div>
              <div className="relative -mt-12 px-5 pb-8 sm:mt-0 sm:flex sm:min-h-[340px] sm:max-w-[46%] sm:flex-col sm:justify-center sm:px-10 sm:py-12 md:min-h-[380px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Seguro Viagem</p>
                <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-white md:text-4xl`}>Cobertura médica e assistência para toda a viagem</h1>
              </div>
            </section>

            <div className="mt-8 rounded-2xl bg-[#eef6fb] p-5 sm:p-6">
              <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-[#1c6ea8]">Como funciona</p>
              <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
                {COMO_FUNCIONA.map((passo, i) => (
                  <div key={passo.titulo} className="flex min-w-0 flex-col items-center text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">Passo {i + 1}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={passo.icone} alt="" className="mt-2 h-20 w-20 object-contain" />
                    <p className="mt-2 text-sm font-medium text-black">{passo.titulo}</p>
                    <p className="mt-1 text-xs leading-5 text-black/65">{passo.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 1 — Viagem */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={1} titulo="Datas da viagem" />
              <div className="mt-5 grid gap-4 sm:max-w-lg sm:grid-cols-2">
                <Campo rotulo="Início da cobertura">
                  <input type="date" min={hoje} value={partida} onChange={(e) => { setPartida(e.target.value); invalidar(); }} className={classeData} />
                </Campo>
                <Campo rotulo="Fim da cobertura">
                  <input type="date" min={partida || hoje} value={retorno} onChange={(e) => { setRetorno(e.target.value); invalidar(); }} className={classeData} />
                </Campo>
              </div>
              <fieldset className="mt-5">
                <legend className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Onde você está agora</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([["0", "No Brasil, antes de embarcar"], ["1", "Já estou fora do Brasil"]] as const).map(([v, rotulo]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setTravelling(v); invalidar(); }}
                      aria-pressed={travelling === v}
                      className={`rounded-full border px-4 py-2 text-sm transition ${travelling === v ? "border-[#2f80c9] bg-[#2f80c9]/[0.06] text-[#0A2540] ring-1 ring-[#2f80c9]" : "border-black/15 text-black/70 hover:border-black/30"}`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* 2 — Viajantes */}
            <div className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={2} titulo="Quem viaja" />
              <p className="mt-1 text-sm text-black/70">O preço depende da idade de cada viajante na data de início.</p>
              <div className="mt-4 flex items-center gap-2">
                <button type="button" onClick={() => alterarQuantidade(viajantes.length - 1)} disabled={viajantes.length <= 1} aria-label="Menos viajantes" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30">−</button>
                <span className={`${inter.className} w-8 text-center text-lg font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">{viajantes.length}</span>
                <button type="button" onClick={() => alterarQuantidade(viajantes.length + 1)} disabled={viajantes.length >= MAX_VIAJANTES} aria-label="Mais viajantes" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30">+</button>
                <span className="text-sm text-black/60">{viajantes.length === 1 ? "viajante" : "viajantes"}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:max-w-2xl sm:grid-cols-2">
                {viajantes.map((v, i) => (
                  <Campo key={i} rotulo={`Nascimento — viajante ${i + 1}`} erro={idades[i] !== null && idades[i]! > IDADE_MAXIMA_ONLINE ? `Acima de ${IDADE_MAXIMA_ONLINE} anos: cotação pela nossa equipe.` : null}>
                    <input type="date" max={hoje} value={v.nascimento} onChange={(e) => alterarViajante(i, "nascimento", e.target.value)} className={classeData} />
                  </Campo>
                ))}
              </div>
              {acimaDoLimite && (
                <p className="mt-3 text-sm text-black/70">
                  <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="font-medium text-[#1f6fb8] underline underline-offset-2">Fale com a nossa equipe pelo WhatsApp</a> para cotar viajantes acima de {IDADE_MAXIMA_ONLINE} anos.
                </p>
              )}
              <button
                type="button"
                onClick={cotar}
                disabled={!podeCotar || cotando}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-8 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9] disabled:cursor-not-allowed disabled:bg-[#dce6ef] disabled:text-[#5b7a95]"
              >
                {cotando ? "Cotando…" : planos ? "Cotar de novo" : "Ver planos"}
              </button>
              {erroCotacao && <p className="mt-3 text-sm text-red-600">{erroCotacao}</p>}
            </div>

            {/* 3 — Planos */}
            {planos && (
              <div id="passo-planos" className="mt-8 scroll-mt-20 border-t border-black/10 pt-6">
                <TituloPasso numero={3} titulo="Escolha o plano" />
                <p className="mt-1 text-sm text-black/70">
                  {formatarDataBR(partida)} a {formatarDataBR(retorno)} · {viajantes.length} {viajantes.length === 1 ? "viajante" : "viajantes"} · valor total do grupo
                </p>
                <ul className="mt-4 grid gap-4 md:grid-cols-3">
                  {NIVEIS.map((nivel) => {
                    const p = planos.find((x) => x.nivel === nivel.id);
                    if (!p) return null;
                    const ativo = nivelEscolhido === p.nivel;
                    return (
                      <li key={p.nivel}>
                        <button
                          type="button"
                          onClick={() => setNivelEscolhido(p.nivel)}
                          aria-pressed={ativo}
                          className={`relative flex h-full w-full flex-col rounded-2xl border p-5 text-left transition ${ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.03] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"}`}
                        >
                          {p.nivel === "recomendado" && (
                            <span className="absolute -top-2.5 left-5 rounded-full bg-[#0A2540] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">Recomendado para o Japão</span>
                          )}
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">{nivel.titulo}</span>
                          <span className="mt-2 flex items-center gap-2.5">
                            {p.logo && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.logo} alt="" className="h-8 w-16 shrink-0 object-contain" />
                            )}
                            <span className="min-w-0 text-[15px] font-medium leading-snug text-black">{p.nome}</span>
                          </span>
                          <span className="mt-1 text-xs text-black/55">{p.assistencia ? `${p.assistencia} · ` : ""}{p.seguradora}</span>
                          <span className="mt-3 text-sm text-black/80">
                            Despesas médicas: <strong className="font-semibold text-black">{p.coberturaMedica}</strong>
                          </span>
                          <ul className="mt-2 space-y-1 text-xs text-black/65">
                            {p.destaques.map((d) => (
                              <li key={d.rotulo} className="flex justify-between gap-3">
                                <span>{d.rotulo}</span>
                                <span className={d.valor === "não" ? "text-black/35" : "font-medium text-black/80"}>{d.valor}</span>
                              </li>
                            ))}
                          </ul>
                          <span className="mt-auto pt-4">
                            <span className={`${inter.className} block text-2xl font-bold tabular-nums text-[#0A2540]`}>{formatBRL(p.precoPix)}</span>
                            <span className="block text-xs text-black/50">
                              no Pix · {formatBRL(p.precoCartao)} no cartão{p.parcelasMax && p.parcelasMax > 1 ? ` em até ${p.parcelasMax}×` : ""}
                            </span>
                          </span>
                        </button>
                        {p.contrato && (
                          <a href={p.contrato} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-[#1c6ea8] underline underline-offset-2">
                            Condições gerais do plano ↗
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 4 — Dados */}
            {planos && (
              <div className="mt-8 border-t border-black/10 pt-6">
                <TituloPasso numero={4} titulo="Seus dados e dos viajantes" />
                <p className="mt-1 text-sm text-black/70">O link de pagamento chega neste e-mail, e a apólice em até 24 horas após o pagamento.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Campo rotulo="Seu nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={classeInput(false)} /></Campo>
                  <Campo rotulo="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={classeInput(false)} /></Campo>
                  <Campo rotulo="Celular (WhatsApp)"><input inputMode="tel" value={celular} onChange={(e) => setCelular(mascararWhatsapp(e.target.value))} autoComplete="tel" className={classeInput(false)} /></Campo>
                </div>
                <div className="mt-6 space-y-4">
                  {viajantes.map((v, i) => (
                    <div key={i} className="rounded-xl border border-black/10 p-4">
                      <p className="text-sm font-medium text-black">
                        Viajante {i + 1} <span className="font-normal text-black/50">· nascimento {formatarDataBR(v.nascimento)}</span>
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1.5fr]">
                        <Campo rotulo="Nome completo (como no documento)">
                          <input value={v.nome} onChange={(e) => alterarViajante(i, "nome", e.target.value)} className={classeInput(false)} />
                        </Campo>
                        <Campo rotulo="Documento">
                          <select value={v.tipoDocumento} onChange={(e) => alterarViajante(i, "tipoDocumento", e.target.value)} className={classeInput(false)}>
                            <option value="cpf">CPF (brasileiro)</option>
                            <option value="passaporte">Passaporte (estrangeiro)</option>
                          </select>
                        </Campo>
                        <Campo rotulo={v.tipoDocumento === "cpf" ? "CPF" : "Número do passaporte"}>
                          <input inputMode={v.tipoDocumento === "cpf" ? "numeric" : "text"} value={v.documento} onChange={(e) => alterarViajante(i, "documento", e.target.value)} className={classeInput(false)} />
                        </Campo>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Campo rotulo="Observações (opcional)">
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black focus:border-[#2f80c9] focus:outline-none" />
                  </Campo>
                </div>
              </div>
            )}

            {/* 5 — Termos */}
            <div id="checkout-ultimo-passo" className="mt-8 border-t border-black/10 pt-6">
              <TituloPasso numero={5} titulo="Termos" />
              <ul className="mt-4 list-disc space-y-1.5 rounded-xl border border-black/10 bg-black/[0.02] p-4 pl-8 text-xs leading-5 text-black/75">
                {TERMOS.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-black/80">
                <input type="checkbox" checked={termosAceitos} onChange={(e) => setTermosAceitos(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]" />
                <span>
                  Li e aceito os termos acima, as condições gerais do plano escolhido e a{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-[#1c6ea8] underline underline-offset-2">Política de Privacidade</a>.
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
          onFinalizar={finalizar}
          rotuloValor="Total no Pix"
          valor={plano ? formatBRL(plano.precoPix) : null}
          detalhe={plano ? `${plano.nome} · ${viajantes.length} ${viajantes.length === 1 ? "viajante" : "viajantes"}` : undefined}
          semValor="Informe as datas e os viajantes e clique em Ver planos."
          rotuloBotao="Ir para o pagamento"
          mostrarStone={false}
          sentinelaId="checkout-ultimo-passo"
          classeValor={inter.className}
        />
      )}
    </main>
  );
}
