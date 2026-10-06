import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { atualizarCandidatura, liberarFichaCandidatura } from "@/app/crm/actions";
import { fichaLiberada, linhasFicha, type FichaCadastral } from "@/app/lib/fichaCadastral";
import {
  CLASSIFICACOES,
  STATUS_CANDIDATURA,
  isClassificacao,
  linhasPerfil,
  linhasTriagemBasica,
  urlArquivoCandidato,
  progressoCandidatura,
} from "@/lib/crm/empregos";
import { MODELOS_APRESENTACAO } from "@/lib/empregos/apresentacaoPdf";
import { formatarMoeda, type Proposta } from "@/app/lib/financiamentoEmpregos";
import { vagaPrecisaProposta } from "@/app/lib/etapasCandidatura";
import type { PerfilCandidato } from "@/app/lib/triagemPerfil";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Candidato — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

type Criterio = { label: string; pontosObtidos: number; pontosMaximos: number; detalhe: string };
type ArquivoRef = { path?: string; nome?: string } | null | undefined;

export default async function CandidatoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  const { id } = await params;
  const { salvo, erro } = await searchParams;
  const supabase = await createClient();
  const { data: c, error } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
  if (error) console.error("Erro ao carregar candidatura:", error);
  if (!c) notFound();

  const classificacao = isClassificacao(c.classificacao) ? c.classificacao : "aprovado_baixo";
  const tipo = CLASSIFICACOES.find((x) => x.valor === classificacao)!;
  const respostas = (c.respostas ?? {}) as Record<string, unknown>;
  const perfil = (respostas.perfil ?? null) as PerfilCandidato | null;
  const criterios = (c.criterios ?? []) as Criterio[];
  const motivos = (c.motivos_eliminacao ?? []) as string[];
  const revisar = (c.pontos_revisar ?? []) as string[];
  const certificado = respostas.certificadoJapones as ArquivoRef;
  const certidao = respostas.certidaoAntecedentes as ArquivoRef;

  const arquivos: { label: string; href: string }[] = [];
  if (c.curriculo_path)
    arquivos.push({ label: `Currículo${c.curriculo_nome_arquivo ? ` (${c.curriculo_nome_arquivo})` : ""}`, href: urlArquivoCandidato("curriculos-candidatos", c.curriculo_path) });
  if (certificado?.path) arquivos.push({ label: "Certificado de japonês", href: urlArquivoCandidato("curriculos-candidatos", certificado.path) });
  if (certidao?.path) arquivos.push({ label: "Certidão de antecedentes (PF)", href: urlArquivoCandidato("curriculos-candidatos", certidao.path) });
  if (c.foto_path) arquivos.push({ label: "Foto", href: urlArquivoCandidato("fotos-candidatos", c.foto_path) });

  const salvar = atualizarCandidatura.bind(null, id);
  const ficha = (c.ficha ?? null) as FichaCadastral | null;
  const etapa2Aberta = fichaLiberada(c);
  const linkFicha = c.ficha_token ? `https://www.alpinea.io/empregos/ficha/${c.id}?t=${c.ficha_token}` : null;
  const { data: entrevista } = await supabase
    .from("entrevistas_agendadas")
    .select("inicio, status")
    .eq("candidatura_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const progresso = progressoCandidatura(c, entrevista?.status === "agendada" ? entrevista.inicio : null);
  const proposta = (c.proposta_financiamento ?? null) as Proposta | null;
  const dataCurta = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;
  const linhaTempo: { label: string; quando: string | null; ok: boolean }[] = [
    { label: "Etapa 1 — candidatura e triagem", quando: dataCurta(c.created_at), ok: true },
    { label: "Etapa 2 — ficha cadastral + foto", quando: dataCurta(c.ficha_enviada_em), ok: Boolean(c.ficha_enviada_em && c.foto_path) },
    ...(vagaPrecisaProposta(c.vaga_id)
      ? [
          {
            label: `Etapa 3 — proposta${c.proposta_status === "falar_ajisai" ? " (pediu para falar com a Ajisai)" : ""}`,
            quando: dataCurta(c.proposta_respondida_em),
            ok: c.proposta_status === "aceita",
          },
        ]
      : []),
    {
      label: `Etapa 4 — pré-entrevista${entrevista && entrevista.status !== "agendada" ? ` (${entrevista.status})` : ""}`,
      quando: dataCurta(entrevista?.inicio),
      ok: Boolean(entrevista && entrevista.status !== "cancelada"),
    },
  ];
  const alternarLiberacao = liberarFichaCandidatura.bind(null, id, !c.ficha_liberada);

  return (
    <div>
      <Link href={`/crm/empregos?tipo=${classificacao}`} className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black">
        ← Empregos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium" style={{ background: tipo.fundo, color: tipo.cor }}>
            {tipo.label}
          </span>
          <h1 className={`${display.className} mt-3 text-3xl font-medium text-black md:text-4xl`}>
            {c.nome} {c.sobrenome}
          </h1>
          <p className="mt-2 text-sm text-black/55">
            {c.vaga_empresa} — {c.vaga_titulo}
          </p>
          <p className="mt-1 text-sm text-black/55">
            {c.email} · {c.telefone}
            {c.idade ? ` · ${c.idade} anos` : ""}
          </p>
          <p className="mt-1 text-xs text-black/40">
            Recebida em {new Date(c.created_at).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white px-6 py-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.15em] text-black/40">Score</p>
          <p className={`${display.className} text-5xl font-medium`} style={{ color: tipo.cor }}>
            {c.pontuacao ?? "—"}
          </p>
          <p className="text-[11px] text-black/40">de 100</p>
        </div>
      </div>

      {salvo && <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Alterações salvas.</p>}
      {erro && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {motivos.length > 0 && (
            <section className="rounded-2xl border p-5" style={{ borderColor: CLASSIFICACOES[2].cor, background: CLASSIFICACOES[2].fundo }}>
              <h2 className="text-sm font-medium" style={{ color: CLASSIFICACOES[2].cor }}>
                Motivos da eliminação
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-black/75">
                {motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          )}
          {revisar.length > 0 && (
            <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <h2 className="text-sm font-medium text-amber-800">Pontos para revisar</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {revisar.map((r) => (
                  <span key={r} className="rounded-full bg-white px-2.5 py-1 text-xs text-amber-800">
                    {r}
                  </span>
                ))}
              </div>
            </section>
          )}

          {criterios.length > 0 && (
            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-medium text-black">Composição do score</h2>
              <div className="mt-3 space-y-3">
                {criterios.map((cr) => (
                  <div key={cr.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/75">{cr.label}</span>
                      <span className="tabular-nums text-black/55">
                        {cr.pontosObtidos}/{cr.pontosMaximos}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                      <div className="h-full rounded-full bg-[#1C3A5E]" style={{ width: `${cr.pontosMaximos ? (cr.pontosObtidos / cr.pontosMaximos) * 100 : 0}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-black/45">{cr.detalhe}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Triagem</h2>
            <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
              {linhasTriagemBasica(respostas).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                  <dt className="text-black/45">{k}</dt>
                  <dd className="text-black/80">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {linhasPerfil(perfil).map((g) => (
            <section key={g.grupo} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-medium text-black">{g.grupo}</h2>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {g.linhas.map(([k, v, atencao]) => (
                  <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                    <dt className="text-black/45">{k}</dt>
                    <dd className={atencao ? "font-medium text-amber-800" : "text-black/80"}>
                      {atencao && "⚠ "}
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {ficha && (
            <h2 className={`${display.className} pt-4 text-2xl font-medium text-black`}>Etapa 2 — ficha cadastral</h2>
          )}
          {linhasFicha(ficha).map((g) => (
            <section key={`ficha-${g.grupo}`} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-medium text-black">{g.grupo}</h2>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {g.linhas.map(([k, v, atencao], i) => (
                  <div key={`${k}-${i}`} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                    <dt className="text-black/45">{k}</dt>
                    <dd className={atencao ? "font-medium text-amber-800" : "text-black/80"}>
                      {atencao && "⚠ "}
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Andamento</h2>
            <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs" style={{ color: progresso.cor, background: `${progresso.cor}14` }}>
              {progresso.label}
            </span>
            <ol className="mt-4 space-y-3">
              {linhaTempo.map((e) => (
                <li key={e.label} className="flex gap-2.5 text-xs">
                  <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${e.ok ? "bg-emerald-600" : "border border-black/20"}`} />
                  <span>
                    <span className={e.ok ? "text-black/80" : "text-black/45"}>{e.label}</span>
                    {e.quando && <span className="block text-black/40">{e.quando}</span>}
                  </span>
                </li>
              ))}
            </ol>
            {entrevista?.status === "agendada" && (
              <Link href="/crm/empregos/agenda" className="mt-4 block text-xs text-[#1C3A5E] underline">
                Ver na agenda
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Documento de Apresentação para Empreiteira</h2>
            <p className="mt-1 text-xs leading-5 text-black/45">
              PDF com foto e dados do candidato. O modelo Alpinea não traz contato, CPF nem RG; os modelos das empreiteiras saem com a
              ficha completa.
            </p>
            <form action={`/crm/empregos/${id}/apresentacao`} method="get" target="_blank" className="mt-3 space-y-2">
              <select name="modelo" defaultValue="alpinea" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black">
                {MODELOS_APRESENTACAO.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-[#1C3A5E] px-3 py-2 text-sm font-medium text-white">
                  Gerar PDF
                </button>
                <button type="submit" name="download" value="1" className="rounded-xl border border-[#1C3A5E] px-3 py-2 text-sm font-medium text-[#1C3A5E]">
                  Baixar
                </button>
              </div>
            </form>
            {!c.ficha_enviada_em && <p className="mt-2 text-[11px] text-amber-700">Ficha da etapa 2 ainda não enviada — o PDF sai só com os dados da etapa 1.</p>}
          </section>

          {proposta && (
            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-medium text-black">
                Etapa 3 — proposta {c.proposta_status === "aceita" ? "aceita" : "· quer falar com a Ajisai"}
              </h2>
              <p className="mt-1 text-xs text-black/45">
                {proposta.selecao.proponentes} pessoa(s) · saída {proposta.selecao.aeroporto} · ¥1 = R$ {proposta.cotacaoBRLPorJPY.toFixed(4)}
              </p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {proposta.itens.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span className="text-black/65">{i.label}</span>
                    <span className="tabular-nums text-black/80">{formatarMoeda(i.totalJPY, "JPY")}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between border-t border-black/[0.06] pt-2 text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatarMoeda(proposta.totalJPY, "JPY")} · {formatarMoeda(proposta.totalBRL, "BRL")}
                </span>
              </p>
            </section>
          )}
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Etapa 2 — ficha cadastral</h2>
            <p className="mt-2 text-sm text-black/60">
              {c.ficha_enviada_em
                ? `Enviada em ${new Date(c.ficha_enviada_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}${c.foto_path ? " · com foto" : " · sem foto"}`
                : etapa2Aberta
                  ? "Liberada — aguardando o candidato."
                  : "Bloqueada (score abaixo de 80 ou eliminado)."}
            </p>
            {linkFicha && etapa2Aberta && (
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-black/40">Link para enviar ao candidato</p>
                <input readOnly value={linkFicha} className="mt-1 w-full rounded-lg border border-black/10 bg-black/[0.02] px-2 py-1.5 text-[11px] text-black/70" />
              </div>
            )}
            {!c.ficha_enviada_em && (c.ficha_liberada || !etapa2Aberta) && (
              <form action={alternarLiberacao} className="mt-3">
                <button type="submit" className="w-full rounded-xl border border-[#1C3A5E] px-4 py-2 text-sm font-medium text-[#1C3A5E] hover:bg-[#1C3A5E]/5">
                  {c.ficha_liberada ? "Cancelar liberação" : "Liberar etapa 2"}
                </button>
              </form>
            )}
          </section>
          <form action={salvar} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Decisão da equipe</h2>
            <label className="block text-xs text-black/50">
              Tipo de candidato
              <select name="classificacao" defaultValue={classificacao} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black">
                {CLASSIFICACOES.map((x) => (
                  <option key={x.valor} value={x.valor}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-black/50">
              Status
              <select name="status" defaultValue={c.status} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black">
                {STATUS_CANDIDATURA.map((x) => (
                  <option key={x.valor} value={x.valor}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-black/50">
              Observações internas
              <textarea
                name="observacoes_equipe"
                rows={5}
                defaultValue={c.observacoes_equipe ?? ""}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-black outline-none focus:border-[#1C3A5E]"
              />
            </label>
            <button type="submit" className="w-full rounded-xl bg-[#1C3A5E] px-4 py-2.5 text-sm font-medium text-white">
              Salvar
            </button>
          </form>

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black">Arquivos</h2>
            {arquivos.length === 0 ? (
              <p className="mt-2 text-sm text-black/40">Nenhum arquivo enviado.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {arquivos.map((a) => (
                  <li key={a.href}>
                    <a href={a.href} target="_blank" rel="noopener noreferrer" className="text-[#1C3A5E] underline underline-offset-2">
                      {a.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
