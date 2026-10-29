"use client";

// Solicitação 100% online do visto específico e do Certificado de
// Elegibilidade (Wilson, 29/out/2026: "formulario online para solicitacao
// 100% online com passos bem numerados, como se fosse uma candidatura de
// emprego que temos no site /empregos, bem detalhado, pagamento online via
// stone e registro no CRM").
//
// Perfil → valor → dados e cadastro (→ garantidor) → ficha dos solicitantes
// → endereço/ascendência (e garantidor) → documentos → contrato (aceite
// eletrônico) → pagamento pela Stone. O processo nasce no CRM de
// Documentação no fim do cadastro (/api/documentacao-selfservice, com o
// valor calculado no servidor); daí em diante usa as mesmas APIs do portal
// (ficha, arquivo, contrato, pagamento). Se a pessoa fechar a página, segue
// pelo link do portal que recebeu por e-mail.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CampoPergunta, Pilulas, VERDE, display } from "./componentes";
import { Campo, classeInput, mascararWhatsapp } from "../components/transporte/compartilhado";
import { formatBRL, formatJPY } from "../hooks/useCambioUSD";
import { WHATSAPP_NUMBER } from "../produtos/page";
import { formatarCpf } from "../lib/fichaCadastral";
import { CONSULADOS, PALAVRAS_RACA_RESTRITA, PERGUNTAS_GARANTIDOR, PERGUNTAS_PET, PERGUNTAS_PET_TUTOR, PERGUNTAS_VISTO, PRAZO_VISTO, VERSAO_TERMOS_DOC, type Pergunta } from "./conteudo";
import { documentosServico, errosFicha, estruturaFicha, urlPortal, type FichaDoc } from "./processo";
import { Bloco, CampoDinamico, Documentos, PagarStone, type Contrato, type DocPublico } from "./processo/[id]/PortalProcesso";
import { MAX_PESSOAS_ONLINE, precoOnline } from "@/lib/documentacao/precoOnline";
import { InfoEtapa } from "./InfoSolicitacao";
import { PagamentoCOE } from "./PagamentoCOE";

type Servico = "visto" | "elegibilidade" | "pet";
type PassoId = "perfil" | "valor" | "dados" | "garantidor" | "solicitantes" | "titular" | "documentos" | "contrato" | "pagamento" | "pet" | "analise";

const PERFIS = [
  "Sou nissei (filho de japonês)",
  "Sou sansei (neto de japonês)",
  "Sou cônjuge de nissei ou sansei",
  "Sou filho(a) dependente, até 18 anos",
  "Nenhuma das opções",
];
const PERFIL_FORA = "Nenhuma das opções";
const NOME: Record<Servico, string> = { visto: "Visto específico", elegibilidade: "Certificado de Elegibilidade", pet: "Exportação de pet" };

const PASSOS: Record<Servico, { id: PassoId; titulo: string; descricao: string }[]> = {
  visto: [
    { id: "perfil", titulo: "Perfil", descricao: "Confirme que o visto específico é para você." },
    { id: "valor", titulo: "Consulado e valor", descricao: "Escolha o consulado e o número de pessoas para ver o valor final — sem surpresa depois." },
    { id: "dados", titulo: "Seus dados e cadastro", descricao: "Contato do responsável e as perguntas do caso." },
    { id: "solicitantes", titulo: "Solicitantes", descricao: "Dados de cada pessoa, como estão no passaporte." },
    { id: "titular", titulo: "Endereço e ascendência", descricao: "Onde você mora e de quem vem a ascendência japonesa." },
    { id: "documentos", titulo: "Documentos", descricao: "Envie foto ou PDF de cada documento. Celular serve." },
    { id: "contrato", titulo: "Contrato", descricao: "Leia e aceite eletronicamente com nome e CPF." },
    { id: "pagamento", titulo: "Pagamento", descricao: "Cartão de crédito ou Pix pela Stone." },
  ],
  elegibilidade: [
    { id: "perfil", titulo: "Perfil", descricao: "Confirme que o certificado é para você." },
    { id: "valor", titulo: "Pessoas e valor", descricao: "Valor final do pacote, em ienes, cobrado em reais pela PTAX." },
    { id: "dados", titulo: "Seus dados e cadastro", descricao: "Contato do responsável e as perguntas do caso." },
    { id: "garantidor", titulo: "Garantidor no Japão", descricao: "Se não souber alguma resposta, confirme com ele antes de seguir." },
    { id: "solicitantes", titulo: "Solicitantes", descricao: "Dados de cada pessoa, como estão no passaporte." },
    { id: "titular", titulo: "Ascendência e garantidor", descricao: "Endereço, ascendente japonês e dados completos do garantidor." },
    { id: "documentos", titulo: "Documentos", descricao: "Envie foto ou PDF de cada documento. Celular serve." },
    { id: "contrato", titulo: "Contrato", descricao: "Leia e aceite eletronicamente com nome e CPF." },
    { id: "pagamento", titulo: "Pagamento", descricao: "1ª parcela (50%) em reais pela Stone ou em ienes por depósito no Japão." },
  ],
  // Pet (Wilson, 29/out/2026: "etapa 1 como se já estivesse preenchendo"):
  // valor ainda sob consulta, então termina em análise da equipe; contrato e
  // pagamento pela Stone seguem no link do portal.
  pet: [
    { id: "pet", titulo: "Seu pet", descricao: "Comece pelo pet: tipo, raça, porte e situação da sorologia." },
    { id: "dados", titulo: "Seus dados", descricao: "Contato do tutor e as confirmações do serviço." },
    { id: "titular", titulo: "Tutor, viagem e pet", descricao: "Documentos do tutor, data da viagem e dados completos do pet." },
    { id: "documentos", titulo: "Documentos", descricao: "Envie foto ou PDF de cada documento. Celular serve." },
    { id: "analise", titulo: "Análise e proposta", descricao: "A equipe confere a raça e a data da viagem e libera o contrato com o valor." },
  ],
};

const ACEITES_PET = [
  { id: "origem", resumo: "Confirmou origem Brasil", texto: "Confirmo que o passageiro e o pet vão sair do Brasil." },
  { id: "racas", resumo: "Leu e aceitou as restrições de raças no transporte aéreo", texto: "Li e aceito os termos de aceite de animais no transporte aéreo internacional e a lista de raças NÃO aceitas desta página." },
  { id: "termos", resumo: "Li e aceito os termos e condições do serviço (não reembolsável)", texto: "Li e aceito os termos e condições do serviço, incluindo que não há cancelamento com reembolso e que, se a raça for omitida ou declarada de forma incorreta, não há reembolso em nenhuma hipótese." },
];
const DECLARACAO_RACA = "Declarou que a raça do pet (inclusive cruzamento) não está na lista de raças NÃO aceitas";
const racaRestrita = (raca: string) => {
  const r = raca.toLowerCase();
  return r.length >= 3 && PALAVRAS_RACA_RESTRITA.some((p) => r.includes(p));
};

const ACEITES = [
  { id: "termos", resumo: "Li e aceito os termos e condições do serviço", texto: "Li e aceito os termos e condições do serviço (acima, nesta etapa)." },
  { id: "garantia", resumo: "Ciente: pagamento e documentos não garantem aprovação; serviço não reembolsável", texto: "Entendo que o pagamento e o envio dos documentos não garantem a aprovação — a decisão é das autoridades japonesas — e que o serviço não é reembolsável, inclusive em caso de negativa." },
];

type Ptax = { brlPorJPY: number; data: string | null; fallback: boolean };
type Sessao = { id: string; token: string; nome: string };

const semAssinatura = () => () => {};
const botao = "flex min-h-[52px] items-center justify-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.2em] transition disabled:opacity-50";

export function SolicitacaoOnline({ servico }: { servico: Servico }) {
  const passos = PASSOS[servico];
  const chave = `ajisai-doc-online-${servico}`;
  const [idx, setIdx] = useState(0);
  const passo = passos[idx];
  const topo = useRef<HTMLDivElement>(null);

  // ── Passos 1 e 2 ──
  const [perfil, setPerfil] = useState("");
  const [consuladoId, setConsuladoId] = useState("");
  const [temCOE, setTemCOE] = useState("");
  const [pessoas, setPessoas] = useState(1);
  const [ptax, setPtax] = useState<Ptax | null>(null);
  useEffect(() => {
    if (servico !== "elegibilidade") return;
    fetch("/api/cambio-iene-ptax").then((r) => r.json()).then((d: Ptax) => setPtax(d)).catch(() => setPtax(null));
  }, [servico]);

  const consulado = CONSULADOS.find((c) => c.id === consuladoId) ?? null;
  const camposPreco = { qtd: String(pessoas), consuladoId, temCOE, perfil };
  const preco = precoOnline(servico, camposPreco);
  const brlAprox = preco?.moeda === "JPY" && ptax ? Math.round(preco.total * ptax.brlPorJPY * 100) / 100 : null;
  const textoPreco = preco ? (preco.moeda === "JPY" ? formatJPY(preco.total) : formatBRL(preco.total)) : null;

  // ── Passo 3 (e garantidor) ──
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [aceitos, setAceitos] = useState<Record<string, boolean>>({});
  const perguntasDados = useMemo(() => (servico === "pet" ? PERGUNTAS_PET_TUTOR : PERGUNTAS_VISTO.filter((p) => p.id !== "qtd")), [servico]);
  const aceitesServico = servico === "pet" ? ACEITES_PET : ACEITES;

  // ── Processo criado no CRM ──
  const [sessao, setSessao] = useState<Sessao | null>(null);
  // Solicitação começada antes neste aparelho (link do portal guardado).
  const [descartada, setDescartada] = useState(false);
  const bruto = useSyncExternalStore(
    semAssinatura,
    () => {
      try {
        return window.localStorage.getItem(chave);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const anterior = useMemo<Sessao | null>(() => {
    if (!bruto || descartada) return null;
    try {
      return JSON.parse(bruto) as Sessao;
    } catch {
      return null;
    }
  }, [bruto, descartada]);

  // ── Ficha ──
  const est = useMemo(() => estruturaFicha(servico), [servico]);
  const [ficha, setFicha] = useState<FichaDoc>({ pessoas: [], dados: {} });
  const [docs, setDocs] = useState<DocPublico[]>([]);
  const [contrato, setContrato] = useState<{ texto: Contrato; valorFinal: string } | null>(null);

  // ── Aceite ──
  const [assNome, setAssNome] = useState("");
  const [assCpf, setAssCpf] = useState("");
  const [assTermos, setAssTermos] = useState(false);
  const [assGarantia, setAssGarantia] = useState(false);

  const [tentou, setTentou] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<"" | "salvando" | "salvo">("");

  // Rascunho da ficha no servidor (dá para continuar pelo link do portal).
  const primeiraFicha = useRef(true);
  useEffect(() => {
    if (!sessao) return;
    if (primeiraFicha.current) {
      primeiraFicha.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setRascunho("salvando");
      const r = await fetch("/api/documentacao-processo/ficha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sessao.id, token: sessao.token, ficha, enviar: false }) }).catch(() => null);
      setRascunho(r?.ok ? "salvo" : "");
    }, 1500);
    return () => clearTimeout(t);
  }, [ficha, sessao]);

  const errosDaFicha = errosFicha(servico, ficha, pessoas);
  const faltamDocs = documentosServico(servico).filter((t) => t.obrigatorio && !docs.some((d) => d.tipo === t.id));

  function erroPergunta(p: Pergunta): string | null {
    const v = (respostas[p.id] ?? "").trim();
    if (!v) return "Campo obrigatório.";
    if (p.tipo === "tel" && v.replace(/\D/g, "").length < 8) return "Telefone incompleto.";
    return null;
  }
  const erroNome = nome.trim().length < 3 ? "Informe o nome completo." : null;
  const erroEmail = !/^\S+@\S+\.\S+$/.test(email.trim()) ? "E-mail inválido." : null;
  const erroWhats = whatsapp.replace(/\D/g, "").length < 10 ? "WhatsApp com DDD." : null;

  /** Pendências do passo atual (lista legível). */
  function pendencias(id: PassoId): string[] {
    switch (id) {
      case "perfil":
        return !perfil ? ["Escolha o seu perfil."] : perfil === PERFIL_FORA ? ["Este serviço atende só o visto específico."] : [];
      case "valor":
        if (servico === "visto") return [!consuladoId && "Escolha o consulado.", !temCOE && "Responda se já tem o Certificado de Elegibilidade."].filter(Boolean) as string[];
        return pessoas > MAX_PESSOAS_ONLINE.elegibilidade ? ["Para 6 pessoas ou mais, fale com a equipe."] : [];
      case "dados":
        return [erroNome && "Nome completo", erroEmail && "E-mail", erroWhats && "WhatsApp", ...perguntasDados.filter((p) => erroPergunta(p)).map((p) => p.rotulo), ...aceitesServico.filter((a) => !aceitos[a.id]).map((a) => a.resumo)].filter(Boolean) as string[];
      case "pet": {
        const r = PERGUNTAS_PET.filter((p) => erroPergunta(p)).map((p) => p.rotulo);
        if (respostas.p_racaRestrita === "Sim, está na lista") r.push("Raça NÃO aceita pelas companhias aéreas — não conseguimos atender.");
        if (!aceitos.racaDeclarada) r.push("Declaração de que a raça do pet não está na lista de raças NÃO aceitas");
        return r;
      }
      case "garantidor":
        return PERGUNTAS_GARANTIDOR.filter((p) => erroPergunta(p)).map((p) => p.rotulo);
      case "solicitantes":
        return Object.entries(errosDaFicha)
          .filter(([k]) => k.startsWith("p") || k === "titular")
          .map(([k, v]) => (k === "titular" || k === "pessoas" ? v : `Solicitante ${Number(k.slice(1, k.indexOf("."))) + 1}: ${est.porPessoa?.find((c) => c.id === k.split(".")[1])?.rotulo ?? k} — ${v}`));
      case "titular":
        return Object.entries(errosDaFicha)
          .filter(([k]) => k.startsWith("dados."))
          .map(([k, v]) => `${est.grupos.flatMap((g) => g.campos).find((c) => c.id === k.slice(6))?.rotulo ?? k} — ${v}`);
      case "documentos":
        return faltamDocs.map((d) => d.rotulo);
      case "contrato":
        return [assNome.trim().length < 3 && "Nome completo do titular", assCpf.replace(/\D/g, "").length !== 11 && "CPF do titular", !assTermos && "Confirme a leitura do contrato", !assGarantia && "Confirme a ciência sobre aprovação e reembolso"].filter(Boolean) as string[];
      default:
        return [];
    }
  }
  const faltas = pendencias(passo.id);
  const criado = !!sessao;
  const idxCriacao = passos.findIndex((p) => p.id === (servico === "pet" ? "titular" : "solicitantes"));

  function irPara(n: number) {
    setIdx(n);
    setTentou(false);
    setErro(null);
    setTimeout(() => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  async function criarProcesso(): Promise<boolean> {
    const contexto: [string, string][] = [
      ["Solicitação", "100% online pelo site"],
      ["Perfil", perfil],
      ...(servico === "visto" ? ([["Consulado", consulado?.nome ?? "—"], ["Já tem Certificado de Elegibilidade", temCOE]] as [string, string][]) : []),
      ["Solicitantes", String(pessoas)],
      ["Valor pela tabela", textoPreco ?? "—"],
    ];
    const grupos = servico === "elegibilidade" ? [...perguntasDados, ...PERGUNTAS_GARANTIDOR] : servico === "pet" ? [...PERGUNTAS_PET, ...perguntasDados] : perguntasDados;
    const ctx: [string, string][] = servico === "pet" ? [["Solicitação", "Online pelo site"], ["País de origem do passageiro e do pet", "Brasil (confirmado no cadastro)"]] : contexto;
    const linhas: [string, string][] = [
      ...ctx,
      ...grupos.map((p) => [p.rotulo, respostas[p.id] ?? ""] as [string, string]),
      ...(servico === "pet" ? ([[DECLARACAO_RACA, "Aceito"]] as [string, string][]) : []),
      ...aceitesServico.map((a) => [a.resumo, "Aceito"] as [string, string]),
    ];
    const r = await fetch("/api/documentacao-selfservice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        online: servico !== "pet",
        servico,
        nome,
        email,
        whatsapp,
        respostas: linhas,
        campos: servico === "pet" ? { ...respostas } : { ...respostas, perfil, qtd: String(pessoas), consuladoId, consulado: consulado?.nome ?? "", temCOE },
        valorReferenciaBRL: preco?.moeda === "BRL" ? preco.total : brlAprox,
        termosVersao: VERSAO_TERMOS_DOC,
        aceites: [...(servico === "pet" ? [DECLARACAO_RACA] : []), ...aceitesServico.map((a) => a.resumo)],
      }),
    }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok || !d?.id || !d?.token) {
      setErro(d?.error || "Não foi possível registrar a solicitação agora. Tente novamente ou fale pelo WhatsApp.");
      return false;
    }
    const s = { id: d.id as string, token: d.token as string, nome };
    setSessao(s);
    try {
      window.localStorage.setItem(chave, JSON.stringify(s));
    } catch {}
    window.gtag?.("event", "generate_lead", { form_name: `documentacao_${servico}_online`, contact_channel: "site" });
    // Ficha já começa com o titular e o nome do responsável.
    setFicha(servico === "pet" ? { pessoas: [], dados: { nome } } : { pessoas: Array.from({ length: pessoas }, (_, i): Record<string, string> => (i === 0 ? { relacao: "Titular", nome } : {})), dados: {} });
    setAssNome(nome);
    return true;
  }

  async function enviarFicha(): Promise<boolean> {
    if (!sessao) return false;
    const r = await fetch("/api/documentacao-processo/ficha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sessao.id, token: sessao.token, ficha, enviar: true }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) {
      setErro(d?.error || "Não foi possível enviar a ficha agora. Tente novamente.");
      return false;
    }
    if (servico === "pet") return true; // segue para a análise da equipe
    if (!d?.contratoLiberado || !d?.contrato) {
      setErro("Recebemos sua ficha. A equipe vai conferir o caso e liberar o contrato pelo seu link de acesso.");
      return false;
    }
    setContrato({ texto: d.contrato, valorFinal: d.valorFinal });
    return true;
  }

  async function aceitarContrato(): Promise<boolean> {
    if (!sessao) return false;
    const r = await fetch("/api/documentacao-processo/contrato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sessao.id, token: sessao.token, nome: assNome, cpf: assCpf, aceites: ["termos", "garantia"] }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) {
      setErro(d?.error || "Não foi possível registrar o aceite.");
      return false;
    }
    return true;
  }

  async function avancar() {
    setTentou(true);
    setErro(null);
    if (faltas.length) return;
    setOcupado(true);
    try {
      let ok = true;
      if (idx + 1 === idxCriacao && !criado) ok = await criarProcesso();
      else if (passo.id === "documentos") ok = await enviarFicha();
      else if (passo.id === "contrato") ok = await aceitarContrato();
      if (ok) irPara(idx + 1);
    } finally {
      setOcupado(false);
    }
  }

  const zap = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Estou fazendo a solicitação online de ${NOME[servico]} e tenho uma dúvida.`)}`;
  const mostrar = (e: string | null | undefined) => (tentou ? e ?? null : null);
  const pct = Math.round(((idx + 1) / passos.length) * 100);
  const podeVoltar = idx > 0 && !(criado && idx <= idxCriacao) && passo.id !== "pagamento" && passo.id !== "analise";

  return (
    <div ref={topo} className="scroll-mt-24">
      {anterior && !sessao && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm" style={{ borderColor: `${VERDE}40`, background: `${VERDE}0D` }}>
          <span className="text-black/75">Você já começou uma solicitação{anterior.nome ? ` em nome de ${anterior.nome.split(" ")[0]}` : ""}. Continue de onde parou:</span>
          <span className="flex gap-2">
            <a href={urlPortal(anterior.id, anterior.token)} className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: VERDE }}>Continuar</a>
            <button type="button" onClick={() => { try { window.localStorage.removeItem(chave); } catch {} setDescartada(true); }} className="rounded-full border border-black/15 px-4 py-2 text-xs text-black/60">Começar nova</button>
          </span>
        </div>
      )}

      {/* Progresso */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-black">
          Etapa {idx + 1} de {passos.length} <span className="font-normal text-black/50">· {passo.titulo}</span>
        </p>
        <p className="shrink-0 text-xs font-medium tabular-nums" style={{ color: VERDE }}>{pct}%</p>
      </div>
      <div className="mt-2 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={passos.length} aria-valuenow={idx + 1} aria-valuetext={`Etapa ${idx + 1} de ${passos.length}: ${passo.titulo}`}>
        {passos.map((p, i) => (
          <div key={p.id} title={`${i + 1}. ${p.titulo}`} className={`h-2.5 flex-1 rounded-full transition-colors ${i === idx ? "ring-2 ring-offset-1" : ""}`} style={{ background: i <= idx ? VERDE : "rgba(0,0,0,0.08)", ["--tw-ring-color" as string]: `${VERDE}55` }} />
        ))}
      </div>
      <ol className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 md:flex">
        {passos.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2 text-xs" style={{ color: i === idx ? VERDE : i < idx ? "#111" : "rgba(0,0,0,0.6)" }}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${i <= idx ? "text-white" : "border border-black/30 bg-white"}`} style={i <= idx ? { background: i === idx ? VERDE : "#5f8a7c" } : undefined}>
              {i < idx ? "✓" : i + 1}
            </span>
            <span className={i === idx ? "font-semibold" : ""}>{p.titulo}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-8">
        <p className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ color: VERDE, backgroundColor: `${VERDE}14` }}>
          Etapa {idx + 1} de {passos.length}
        </p>
        <h3 className={`${display.className} text-2xl font-medium text-black`}>{passo.titulo}</h3>
        <p className="mt-1 text-sm leading-6 text-black/55">{passo.descricao}</p>

        <div className="mt-6 space-y-6">
          <InfoEtapa servico={servico} passo={passo.id} />
          {passo.id === "perfil" && (
            <>
              <Pilulas opcoes={PERFIS} valor={perfil} onChange={setPerfil} nome="Perfil do solicitante" />
              {perfil === PERFIL_FORA && (
                <div className="mt-5 rounded-2xl border border-black/10 bg-[#F6F7F5] p-5 text-sm leading-6 text-black/70">
                  Hoje trabalhamos só com o visto específico{servico === "elegibilidade" ? " e o certificado ligado a ele" : ""}, por isso não conseguimos seguir online com o seu caso.{" "}
                  <a href={zap} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: VERDE }}>Fale com a equipe</a> se a sua situação familiar for diferente.
                </div>
              )}
            </>
          )}

          {passo.id === "valor" && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {servico === "visto" && (
                  <Campo rotulo="Consulado" ajuda={consulado?.dica ?? "O consulado responsável pela região onde você mora."} erro={mostrar(!consuladoId ? "Escolha o consulado." : null)}>
                    <select value={consuladoId} onChange={(e) => setConsuladoId(e.target.value)} className={classeInput(Boolean(mostrar(!consuladoId ? "x" : null)))}>
                      <option value="">Selecione</option>
                      {CONSULADOS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </Campo>
                )}
                <Campo rotulo="Quantas pessoas no processo?" ajuda={servico === "elegibilidade" ? "Família no mesmo processo tem desconto." : "Titular, cônjuge e filhos dependentes."}>
                  <select value={pessoas} onChange={(e) => setPessoas(Number(e.target.value))} className={classeInput(false)}>
                    {Array.from({ length: (servico === "visto" ? MAX_PESSOAS_ONLINE.visto : MAX_PESSOAS_ONLINE.elegibilidade) + (servico === "elegibilidade" ? 1 : 0) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{servico === "elegibilidade" && n > MAX_PESSOAS_ONLINE.elegibilidade ? `${n} ou mais` : `${n} ${n === 1 ? "pessoa" : "pessoas"}`}</option>
                    ))}
                  </select>
                </Campo>
                {servico === "visto" && (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Já tem o Certificado de Elegibilidade emitido?</span>
                    <Pilulas opcoes={["Sim", "Não"]} valor={temCOE} onChange={setTemCOE} nome="Certificado de Elegibilidade" />
                    {mostrar(!temCOE ? "Responda para calcular o valor." : null) && <span className="text-xs text-red-600">Responda para calcular o valor.</span>}
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-2xl p-6 text-white md:p-8" style={{ background: VERDE }}>
                {preco ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Valor final para {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}</p>
                    <p className={`${display.className} mt-2 text-4xl`}>{textoPreco}</p>
                    {preco.moeda === "BRL" ? (
                      <p className="mt-2 text-sm text-white/75">
                        {formatBRL(preco.porPessoa!)} por pessoa · taxa consular inclusa · 100% na contratação · prazo no consulado de {temCOE === "Sim" ? PRAZO_VISTO.comCOE : PRAZO_VISTO.semCOE}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-white/75">
                        {brlAprox ? `≈ ${formatBRL(brlAprox)} pela PTAX ${ptax?.data ? `de ${ptax.data}` : "do dia"}` : "Carregando a cotação…"} · 50% agora e 50% antes da entrada na imigração
                      </p>
                    )}
                  </>
                ) : servico === "elegibilidade" && pessoas > MAX_PESSOAS_ONLINE.elegibilidade ? (
                  <p className="text-sm text-white/80">
                    Para 6 pessoas ou mais o valor é sob consulta. <a href={zap} target="_blank" rel="noopener noreferrer" className="underline">Fale com a equipe pelo WhatsApp</a>.
                  </p>
                ) : (
                  <p className="text-sm text-white/75">Escolha o consulado e responda se já tem o certificado para ver o valor final.</p>
                )}
              </div>
            </>
          )}

          {passo.id === "dados" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Campo rotulo={servico === "pet" ? "Nome completo do tutor" : "Nome completo do titular"} erro={mostrar(erroNome)}>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} className={classeInput(Boolean(mostrar(erroNome)))} autoComplete="name" />
                  </Campo>
                </div>
                <Campo rotulo="E-mail" erro={mostrar(erroEmail)} ajuda="Enviamos o link do processo e o contrato para este e-mail.">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={classeInput(Boolean(mostrar(erroEmail)))} autoComplete="email" />
                </Campo>
                <Campo rotulo="WhatsApp" erro={mostrar(erroWhats)}>
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))} className={classeInput(Boolean(mostrar(erroWhats)))} placeholder="(11) 90000-0000" autoComplete="tel" />
                </Campo>
              </div>
              <div className="grid gap-5 border-t border-black/5 pt-6 sm:grid-cols-2">
                {perguntasDados.map((p) => (
                  <CampoPergunta key={p.id} p={p} valor={respostas[p.id] ?? ""} erro={mostrar(erroPergunta(p))} onChange={(v) => setRespostas((r) => ({ ...r, [p.id]: v }))} />
                ))}
              </div>
              <div className="space-y-3 border-t border-black/5 pt-6">
                {aceitesServico.map((a) => (
                  <label key={a.id} className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
                    <input type="checkbox" checked={Boolean(aceitos[a.id])} onChange={(e) => setAceitos((s) => ({ ...s, [a.id]: e.target.checked }))} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
                    <span>{a.texto}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {passo.id === "pet" && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {PERGUNTAS_PET.map((p) => (
                  <CampoPergunta key={p.id} p={p} valor={respostas[p.id] ?? ""} erro={mostrar(erroPergunta(p))} onChange={(v) => setRespostas((r) => ({ ...r, [p.id]: v }))} />
                ))}
              </div>
              <label
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm leading-6 ${tentou && !aceitos.racaDeclarada ? "border-red-300 bg-red-50 text-red-800" : "border-black/10 bg-white text-black/80"}`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(aceitos.racaDeclarada)}
                  onChange={(e) => setAceitos((s) => ({ ...s, racaDeclarada: e.target.checked }))}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]"
                />
                <span>
                  <strong className="font-semibold text-black">Obrigatório:</strong> conferi a lista de raças NÃO aceitas acima e declaro que a raça do meu pet —
                  inclusive em caso de cruzamento — <strong className="font-semibold">não está na lista</strong>. Estou ciente de que, se a raça for omitida ou
                  declarada de forma incorreta, não há reembolso em nenhuma hipótese.
                </span>
              </label>
              <p className="text-xs leading-5 text-black/55"> Para mais de um pet, faça uma solicitação por animal.
              </p>
              {racaRestrita(respostas.p_raca ?? "") && respostas.p_racaRestrita !== "Sim, está na lista" && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                  A raça informada parece estar na lista de raças NÃO aceitas. Confira a lista: essas raças não podem ser contratadas, e declarar a raça de forma incorreta tira o direito a qualquer reembolso.
                </div>
              )}
              {respostas.p_racaRestrita === "Sim, está na lista" && (
                <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm leading-6 text-red-800">
                  Infelizmente não conseguimos atender: as companhias aéreas não embarcam essas raças para o Japão, mesmo com toda a documentação pronta.
                </div>
              )}
            </div>
          )}

          {passo.id === "analise" && sessao && (
            <div className="rounded-2xl p-6 text-center md:p-10" style={{ background: `${VERDE}0D` }}>
              <p className={`${display.className} text-2xl text-black`}>Ficha e documentos recebidos.</p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/65">
                A equipe confere a raça, a situação da sorologia e a data da viagem e libera o contrato com o valor no seu link de acesso — o mesmo que enviamos para {email || "o seu e-mail"}. O pagamento é feito ali mesmo, pela Stone (cartão ou Pix).
              </p>
              <Link href={urlPortal(sessao.id, sessao.token)} className="mt-6 inline-flex min-h-[48px] items-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-white" style={{ background: VERDE }}>
                Acompanhar meu processo
              </Link>
            </div>
          )}

          {passo.id === "garantidor" && (
            <div className="grid gap-5 sm:grid-cols-2">
              {PERGUNTAS_GARANTIDOR.map((p) => (
                <CampoPergunta key={p.id} p={p} valor={respostas[p.id] ?? ""} erro={mostrar(erroPergunta(p))} onChange={(v) => setRespostas((r) => ({ ...r, [p.id]: v }))} />
              ))}
            </div>
          )}

          {passo.id === "solicitantes" && est.porPessoa && (
            <div className="space-y-5">
              {ficha.pessoas.map((p, i) => (
                <Bloco key={i} titulo={`Solicitante ${i + 1}${p.nome ? ` — ${p.nome}` : ""}`}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {est.porPessoa!.map((c) => (
                      <CampoDinamico key={c.id} c={c} valor={p[c.id] ?? ""} erro={mostrar(errosDaFicha[`p${i}.${c.id}`])} onChange={(v) => setFicha((f) => ({ ...f, pessoas: f.pessoas.map((x, j) => (j === i ? { ...x, [c.id]: v } : x)) }))} />
                    ))}
                  </div>
                </Bloco>
              ))}
              {mostrar(errosDaFicha.titular) && <p className="text-xs text-red-600">{errosDaFicha.titular}</p>}
            </div>
          )}

          {passo.id === "titular" && (
            <div className="space-y-5">
              {est.grupos.map((g) => (
                <Bloco key={g.id} titulo={g.titulo}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {g.campos.map((c) => (
                      <CampoDinamico key={c.id} c={c} valor={ficha.dados[c.id] ?? ""} erro={mostrar(errosDaFicha[`dados.${c.id}`])} onChange={(v) => setFicha((f) => ({ ...f, dados: { ...f.dados, [c.id]: v } }))} />
                    ))}
                  </div>
                </Bloco>
              ))}
            </div>
          )}

          {passo.id === "documentos" && sessao && (
            <Documentos id={sessao.id} token={sessao.token} servico={servico} docs={docs} setDocs={setDocs} tipos={documentosServico(servico)} podeRemover />
          )}

          {passo.id === "contrato" && contrato && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6 text-white" style={{ background: VERDE }}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Valor final</p>
                {servico === "elegibilidade" && preco?.moeda === "JPY" ? (
                  <>
                    <p className={`${display.className} mt-2 text-3xl`}>{formatJPY(preco.total)}</p>
                    <p className="mt-1 text-sm text-white/75">Em 2 parcelas de {formatJPY(preco.total / 2)} — a 1ª agora, a 2ª antes da entrada na imigração. Você escolhe pagar em reais ou em ienes no próximo passo.</p>
                  </>
                ) : (
                  <p className={`${display.className} mt-2 text-3xl`}>{contrato.valorFinal}</p>
                )}
              </div>
              <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-[#F6F7F5] p-4 text-xs leading-5 text-black/70">
                <p className="font-semibold text-black">{contrato.texto.titulo}</p>
                {contrato.texto.clausulas.map((c, i) => <p key={i}>{c}</p>)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Nome completo do titular" erro={mostrar(assNome.trim().length < 3 ? "Informe o nome." : null)}>
                  <input value={assNome} onChange={(e) => setAssNome(e.target.value)} className={classeInput(false)} autoComplete="name" />
                </Campo>
                <Campo rotulo="CPF do titular" erro={mostrar(assCpf.replace(/\D/g, "").length !== 11 ? "CPF incompleto." : null)}>
                  <input value={assCpf} inputMode="numeric" onChange={(e) => setAssCpf(formatarCpf(e.target.value))} className={classeInput(false)} placeholder="000.000.000-00" />
                </Campo>
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
                  <input type="checkbox" checked={assTermos} onChange={(e) => setAssTermos(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
                  Li o contrato inteiro e aceito todas as cláusulas.
                </label>
                <label className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
                  <input type="checkbox" checked={assGarantia} onChange={(e) => setAssGarantia(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
                  Entendo que o pagamento e o envio dos documentos não garantem a aprovação, que a decisão é das autoridades e que o serviço não é reembolsável.
                </label>
              </div>
              <p className="text-xs leading-5 text-black/45">Os termos acima também estão neste contrato. O aceite fica registrado com data, hora, IP e código de integridade do texto, e uma cópia vai para o seu e-mail.</p>
            </div>
          )}

          {passo.id === "pagamento" && sessao && (
            <div className="space-y-4">
              {servico === "elegibilidade" ? (
                <PagamentoCOE
                  id={sessao.id}
                  token={sessao.token}
                  totalJPY={preco?.moeda === "JPY" ? preco.total : null}
                  zap={zap}
                  info={{ devida: 1, totalParcelas: 2, pagas: [], online: true, moeda: "JPY", voltouDoCheckout: false }}
                />
              ) : (
              <>
              {contrato && <p className={`${display.className} text-2xl`}>{contrato.valorFinal}</p>}
              <PagarStone
                id={sessao.id}
                token={sessao.token}
                zap={zap}
                info={{ devida: 1, totalParcelas: 1, pagas: [], online: true, moeda: preco?.moeda ?? "BRL", voltouDoCheckout: false }}
              />
              </>
              )}
              <p className="text-xs leading-5 text-black/50">
                Contrato aceito e registrado no seu processo. Se preferir pagar depois, use o link de acesso que enviamos para {email || "o seu e-mail"}:{" "}
                <Link href={urlPortal(sessao.id, sessao.token)} className="underline" style={{ color: VERDE }}>abrir meu processo</Link>.
              </p>
            </div>
          )}
        </div>

        {tentou && faltas.length > 0 && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-700">
            <p className="font-medium">Faltou preencher:</p>
            <ul className="mt-1 list-disc pl-5">
              {faltas.slice(0, 12).map((f) => <li key={f}>{f}</li>)}
              {faltas.length > 12 && <li>e mais {faltas.length - 12}…</li>}
            </ul>
          </div>
        )}
        {erro && <p role="alert" className="mt-4 text-sm text-red-600">{erro}</p>}

        {passo.id !== "pagamento" && passo.id !== "analise" && (
          <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {podeVoltar ? (
              <button type="button" onClick={() => irPara(idx - 1)} className={`${botao} border border-black/15 text-black/70`}>
                Voltar
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <button type="button" onClick={() => void avancar()} disabled={ocupado} className={`${botao} min-w-[240px] text-white shadow-[0_10px_30px_rgba(11,61,48,0.3)]`} style={{ background: VERDE }}>
                {ocupado
                  ? "Aguarde…"
                  : idx + 1 === idxCriacao && !criado
                    ? "Registrar e continuar"
                    : passo.id === "documentos"
                      ? servico === "pet" ? "Enviar para análise" : "Enviar ficha e ver contrato"
                      : passo.id === "contrato"
                        ? "Aceitar contrato e pagar"
                        : "Continuar"}
              </button>
              {criado && ["solicitantes", "titular"].includes(passo.id) && (
                <span className="text-xs text-black/45">{rascunho === "salvando" ? "Salvando…" : rascunho === "salvo" ? "Rascunho salvo automaticamente." : "Salvamos automaticamente enquanto você preenche."}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-black/45">
        Dúvidas? <a href={zap} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: VERDE }}>Fale com a equipe pelo WhatsApp</a>. Nada é cobrado antes do contrato.
      </p>
    </div>
  );
}
