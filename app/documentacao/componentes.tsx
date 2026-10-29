"use client";

// Peças compartilhadas da seção Documentação (/documentacao) — Wilson,
// 29/out/2026. Marca Ajisai, mesmo cabeçalho de /produtos; verde do banner
// principal como cor de destaque da seção.

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { display, WHATSAPP_NUMBER } from "../produtos/page";
import { MenuProdutos } from "../components/MenuProdutos";
import { Campo, classeInput, mascararWhatsapp } from "../components/transporte/compartilhado";
import { VERSAO_TERMOS_DOC, type Pergunta, type ServicoDoc } from "./conteudo";

export const VERDE = "#0B3D30";
export { display };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function CabecalhoAjisai() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-16 md:py-5">
        <Link href="/produtos" aria-label="Ajisai — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-9 w-auto object-contain invert md:h-11" />
        </Link>
        <MenuProdutos />
      </div>
    </header>
  );
}

// Rodapé da Documentação (Wilson, 29/out/2026): mesmo layout do rodapé de
// /empregos, em verde-escuro (VERDE) com logo e textos em branco.
export function RodapeAjisai() {
  return (
    <footer className="px-8 pb-20 pt-16 text-white md:px-16 md:pb-20 md:pt-20" style={{ background: VERDE }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-11 w-auto object-contain md:h-12" />
        <p className="max-w-sm text-sm leading-relaxed text-white/75">
          Visto, Certificado de Elegibilidade e exportação de pet para o Japão — com a Ajisai em cada etapa.
        </p>
        <p className="text-[11px] leading-relaxed text-white/45">
          © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos Reservados — CNPJ:
          43.544.605/0001-56
        </p>
      </div>
    </footer>
  );
}

// Hero compacto das subpáginas (o banner com foto fica só no hub).
// `fundo` (Wilson, 29/out/2026): foto do documento como fundo do banner,
// com degradê verde-escuro por cima para dar leitura aos textos. `cta`:
// botão que leva à solicitação online na própria página.
export function HeroServico({ kicker, titulo, subtitulo, voltar = true, imagem, alt = "", fundo, cta }: { kicker: string; titulo: string; subtitulo: string; voltar?: boolean; imagem?: string; alt?: string; fundo?: string; cta?: { href: string; rotulo: string } }) {
  const comFoto = Boolean(imagem) && !fundo;
  return (
    <section className="relative isolate overflow-hidden pt-[72px] text-white md:pt-[84px]" style={{ background: `linear-gradient(160deg, #06261E 0%, ${VERDE} 60%, #12503F 100%)` }}>
      {fundo && (
        <>
          <Image src={fundo} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
          <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: `linear-gradient(90deg, rgba(6,38,30,0.93) 0%, rgba(11,61,48,0.8) 35%, rgba(11,61,48,0.38) 65%, rgba(11,61,48,0.08) 100%)` }} />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/3" style={{ background: "linear-gradient(0deg, rgba(6,38,30,0.45), transparent)" }} />
        </>
      )}
      <div className={`mx-auto max-w-5xl px-5 pb-12 pt-10 md:px-8 md:pb-20 md:pt-16 ${comFoto ? "md:grid md:grid-cols-[1.25fr_1fr] md:items-center md:gap-10" : ""}`}>
        <div className={fundo ? "max-w-2xl" : ""}>
        {voltar && (
          <Link href="/documentacao" className="mb-6 inline-flex min-h-[44px] items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            Documentação
          </Link>
        )}
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">{kicker}</p>
        <h1 className={`${display.className} mt-3 text-[clamp(2rem,6vw,3.4rem)] font-normal leading-[1.08] [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]`}>{titulo}</h1>
        <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-white/85 md:text-base">{subtitulo}</p>
        {cta && (
          <a href={cta.href} className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:-translate-y-0.5" style={{ color: VERDE }}>
            {cta.rotulo}
          </a>
        )}
        </div>
        {comFoto && (
          <Image src={imagem!} alt={alt} width={1254} height={1254} priority sizes="(min-width: 768px) 400px, 100vw" className="mt-8 block aspect-square h-auto w-full rounded-2xl object-cover md:mt-0" />
        )}
      </div>
    </section>
  );
}

export function Secao({ kicker, titulo, children, id, cinza = false }: { kicker?: string; titulo: string; children: ReactNode; id?: string; cinza?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-24 border-b border-black/5 ${cinza ? "bg-[#F6F7F5]" : "bg-white"}`}>
      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        {/* Kicker mais legível (Wilson, 29/out/2026: "passo 1 é praticamente impossível de enxergar"). */}
        {kicker && (
          <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: VERDE }}>
            <span aria-hidden="true" className="h-[2px] w-6 rounded-full" style={{ background: VERDE }} />
            {kicker}
          </p>
        )}
        <h2 className={`${display.className} mt-2 text-2xl font-medium text-black md:text-3xl`}>{titulo}</h2>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

export function IconeCheckVerde() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ListaCheck({ itens, className = "" }: { itens: ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {itens.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-6 text-black/75">
          <IconeCheckVerde />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Etapas({ itens }: { itens: { titulo: string; texto?: string }[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {itens.map((e, i) => (
        <li key={e.titulo} className="rounded-2xl border border-black/10 bg-white p-5">
          <span className={`${display.className} text-3xl`} style={{ color: VERDE }}>{String(i + 1).padStart(2, "0")}</span>
          <p className="mt-2 text-sm font-medium text-black">{e.titulo}</p>
          {e.texto && <p className="mt-1.5 text-xs leading-5 text-black/55">{e.texto}</p>}
        </li>
      ))}
    </ol>
  );
}

export function Prazos({ itens, nota }: { itens: { etapa: string; prazo: string }[]; nota?: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        {itens.map((p, i) => (
          <div key={p.etapa} className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${i ? "border-t border-black/5" : ""}`}>
            <span className="text-sm text-black/70">{p.etapa}</span>
            <span className="text-sm font-medium text-black">{p.prazo}</span>
          </div>
        ))}
      </div>
      {nota && <p className="mt-3 text-xs leading-5 text-black/50">{nota}</p>}
    </div>
  );
}

export function Disclaimer({ itens }: { itens: string[] }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-black">
        Condições importantes
        <span className="text-black/40 transition group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-black/60">
        {itens.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </details>
  );
}

export function Termos({ clausulas, titulo = "Termos e condições do serviço" }: { clausulas: [string, string][]; titulo?: string }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white p-5 md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-black">
        {titulo}
        <span className="text-xs font-normal text-black/45 group-open:hidden">Ler</span>
        <span className="hidden text-xs font-normal text-black/45 group-open:inline">Fechar</span>
      </summary>
      <ol className="mt-4 space-y-3 text-xs leading-5 text-black/65">
        {clausulas.map(([t, txt], i) => (
          <li key={t}><strong className="font-medium text-black">{i + 1}. {t}.</strong> {txt}</li>
        ))}
      </ol>
    </details>
  );
}

// Botões de escolha (pílulas) — usado no filtro e no formulário.
export function Pilulas({ opcoes, valor, onChange, nome }: { opcoes: string[]; valor: string; onChange: (v: string) => void; nome: string }) {
  return (
    <div role="radiogroup" aria-label={nome} className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const ativo = valor === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(o)}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-left text-sm transition ${ativo ? "border-transparent text-white" : "border-black/15 bg-white text-black/75 hover:border-black/35"}`}
            style={ativo ? { background: VERDE } : undefined}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function CampoPergunta({ p, valor, onChange, erro }: { p: Pergunta; valor: string; onChange: (v: string) => void; erro: string | null }) {
  const temErro = Boolean(erro);
  if (p.tipo === "opcoes") {
    return (
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">{p.rotulo}</span>
        <Pilulas opcoes={p.opcoes} valor={valor} onChange={onChange} nome={p.rotulo} />
        {erro ? <span className="text-xs text-red-600">{erro}</span> : p.ajuda ? <span className="text-xs text-black/50">{p.ajuda}</span> : null}
      </div>
    );
  }
  if (p.tipo === "lista") {
    return (
      <Campo rotulo={p.rotulo} erro={erro} ajuda={p.ajuda}>
        <select value={valor} onChange={(e) => onChange(e.target.value)} className={classeInput(temErro)}>
          <option value="">Selecione</option>
          {p.opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Campo>
    );
  }
  if (p.tipo === "textarea") {
    return (
      <div className="sm:col-span-2">
        <Campo rotulo={p.rotulo} erro={erro} ajuda={p.ajuda}>
          <textarea rows={3} value={valor} placeholder={p.placeholder} onChange={(e) => onChange(e.target.value)} className={`${classeInput(temErro)} h-auto py-3`} />
        </Campo>
      </div>
    );
  }
  if (p.tipo === "numero") {
    return (
      <Campo rotulo={p.sufixo ? `${p.rotulo} (${p.sufixo})` : p.rotulo} erro={erro} ajuda={p.ajuda}>
        <input type="number" inputMode="decimal" min={p.min} max={p.max} value={valor} onChange={(e) => onChange(e.target.value)} className={classeInput(temErro)} />
      </Campo>
    );
  }
  const tipoInput = p.tipo === "data" ? "date" : p.tipo === "email" ? "email" : p.tipo === "tel" ? "tel" : "text";
  return (
    <Campo rotulo={p.rotulo} erro={erro} ajuda={p.ajuda}>
      <input
        type={tipoInput}
        value={valor}
        placeholder={"placeholder" in p ? p.placeholder : undefined}
        onChange={(e) => onChange(p.tipo === "tel" ? mascararWhatsapp(e.target.value) : e.target.value)}
        className={classeInput(temErro)}
      />
    </Campo>
  );
}

export type GrupoPerguntas = { titulo: string; perguntas: Pergunta[] };
export type Aceite = { id: string; texto: ReactNode; resumo: string };

const NOME_SERVICO: Record<ServicoDoc, string> = {
  visto: "Visto específico",
  elegibilidade: "Certificado de Elegibilidade",
  pet: "Exportação de pet",
};

// Formulário de cadastro — todas as perguntas são obrigatórias (parceiro,
// 29/out/2026). Grava o lead no CRM (/api/documentacao-selfservice) e
// depois abre o WhatsApp; pagamento é combinado pela equipe (sem Stone).
export function FormularioDocumentacao({
  servico,
  grupos,
  aceites = [],
  contexto = [],
  respostasIniciais = {},
  valorReferenciaBRL = null,
  aviso,
  bloqueio,
  camposExtras = {},
}: {
  servico: ServicoDoc;
  grupos: GrupoPerguntas[];
  aceites?: Aceite[];
  contexto?: [string, string][];
  respostasIniciais?: Record<string, string>;
  valorReferenciaBRL?: number | null;
  aviso?: (respostas: Record<string, string>) => ReactNode;
  // Resposta eliminatória: devolve a mensagem e impede o envio.
  bloqueio?: (respostas: Record<string, string>) => string | null;
  // Dados da simulação (consulado, perfil…) gravados junto no CRM de Documentação.
  camposExtras?: Record<string, string>;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>(respostasIniciais);
  const [aceitos, setAceitos] = useState<Record<string, boolean>>({});
  const [tentou, setTentou] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erroEnvio, setErroEnvio] = useState("");

  const todas = useMemo(() => grupos.flatMap((g) => g.perguntas), [grupos]);

  function erroDe(p: Pergunta): string | null {
    const v = (respostas[p.id] ?? "").trim();
    if (!v) return "Campo obrigatório.";
    if (p.tipo === "numero") {
      const n = Number(v);
      if (!Number.isFinite(n) || (p.min !== undefined && n < p.min) || (p.max !== undefined && n > p.max)) return "Valor inválido.";
    }
    if (p.tipo === "tel" && v.replace(/\D/g, "").length < 8) return "Telefone incompleto.";
    return null;
  }

  const erroNome = nome.trim().length < 3 ? "Informe o nome completo." : null;
  const erroEmail = !/^\S+@\S+\.\S+$/.test(email.trim()) ? "E-mail inválido." : null;
  const erroWhats = whatsapp.replace(/\D/g, "").length < 10 ? "WhatsApp com DDD." : null;
  const pendentes = [erroNome, erroEmail, erroWhats].filter(Boolean).length + todas.filter((p) => erroDe(p)).length + aceites.filter((a) => !aceitos[a.id]).length;

  const motivoBloqueio = bloqueio?.(respostas) ?? null;

  async function enviar() {
    setTentou(true);
    if (pendentes > 0 || motivoBloqueio || status === "enviando") return;
    setStatus("enviando");
    setErroEnvio("");
    const linhas: [string, string][] = [
      ...contexto,
      ...grupos.flatMap((g) => g.perguntas.map((p) => [p.rotulo, respostas[p.id] ?? ""] as [string, string])),
      ...aceites.map((a) => [a.resumo, "Aceito"] as [string, string]),
    ];
    try {
      const r = await fetch("/api/documentacao-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servico, nome, email, whatsapp, respostas: linhas, campos: { ...camposExtras, ...respostas }, valorReferenciaBRL, termosVersao: VERSAO_TERMOS_DOC, aceites: aceites.map((a) => a.resumo) }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErroEnvio(d?.error || "Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.");
        setStatus("erro");
        return;
      }
      window.gtag?.("event", "generate_lead", { form_name: `documentacao_${servico}`, contact_channel: "site" });
      // Segue direto para o portal do processo (ficha completa e documentos).
      if (typeof d?.portalUrl === "string" && d.portalUrl.startsWith("/documentacao/processo/")) {
        window.location.href = d.portalUrl;
        return;
      }
      setStatus("enviado");
    } catch {
      setErroEnvio("Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.");
      setStatus("erro");
    }
  }

  const textoWhats = encodeURIComponent(`Olá! Acabei de enviar meu cadastro de ${NOME_SERVICO[servico]} pelo site da Ajisai. Meu nome é ${nome.trim()}.`);
  const linkWhats = `https://wa.me/${WHATSAPP_NUMBER}?text=${textoWhats}`;

  if (status === "enviado") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center md:p-10">
        <p className={`${display.className} text-2xl font-medium text-black`}>Cadastro recebido.</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/60">
          Nossa equipe de documentação analisa o seu caso e responde pelo WhatsApp com a confirmação de elegibilidade, o valor final e os próximos passos.
        </p>
        <a href={linkWhats} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-white" style={{ background: VERDE }}>
          Falar agora no WhatsApp
        </a>
      </div>
    );
  }

  const mostrar = (e: string | null) => (tentou ? e : null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
        <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">Seus dados</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo rotulo="Nome completo" erro={mostrar(erroNome)}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className={classeInput(Boolean(mostrar(erroNome)))} autoComplete="name" />
            </Campo>
          </div>
          <Campo rotulo="E-mail" erro={mostrar(erroEmail)}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={classeInput(Boolean(mostrar(erroEmail)))} autoComplete="email" />
          </Campo>
          <Campo rotulo="WhatsApp" erro={mostrar(erroWhats)}>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))} className={classeInput(Boolean(mostrar(erroWhats)))} placeholder="(11) 90000-0000" autoComplete="tel" />
          </Campo>
        </div>
      </div>

      {grupos.map((g) => (
        <div key={g.titulo} className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
          <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">{g.titulo}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {g.perguntas.map((p) => (
              <CampoPergunta key={p.id} p={p} valor={respostas[p.id] ?? ""} erro={mostrar(erroDe(p))} onChange={(v) => setRespostas((r) => ({ ...r, [p.id]: v }))} />
            ))}
          </div>
        </div>
      ))}

      {aviso?.(respostas)}

      {aceites.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 md:p-7">
          {aceites.map((a) => (
            <label key={a.id} className="flex cursor-pointer gap-3 text-sm leading-6 text-black/75">
              <input type="checkbox" checked={Boolean(aceitos[a.id])} onChange={(e) => setAceitos((s) => ({ ...s, [a.id]: e.target.checked }))} className="mt-1 h-4 w-4 shrink-0 accent-[#0B3D30]" />
              <span>{a.texto}</span>
            </label>
          ))}
          {tentou && aceites.some((a) => !aceitos[a.id]) && <p className="text-xs text-red-600">Confirme os itens acima para continuar.</p>}
        </div>
      )}

      {motivoBloqueio && (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm leading-6 text-red-800">{motivoBloqueio}</div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={enviar}
          disabled={status === "enviando" || Boolean(motivoBloqueio)}
          className="flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(11,61,48,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: VERDE }}
        >
          {status === "enviando" ? "Enviando…" : "Enviar cadastro e continuar"}
        </button>
        {tentou && pendentes > 0 && <p className="text-xs text-red-600">Faltam {pendentes} campo(s) obrigatório(s).</p>}
        {status === "erro" && <p className="text-center text-xs text-red-600">{erroEnvio}</p>}
        <p className="text-center text-xs text-black/45">Nada é cobrado agora. Em seguida você preenche a ficha completa e envia os documentos, tudo online. A equipe confirma seu caso antes de qualquer pagamento.</p>
      </div>
    </div>
  );
}
