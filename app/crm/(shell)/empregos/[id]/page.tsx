import Link from "next/link";
import { VoltarLista } from "../../components/VoltarLista";
import { CardsCandidatura } from "./CardsCandidatura";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { atualizarCandidatura, liberarFichaCandidatura, reclassificarCandidatura, registrarAndamentoCandidatura, salvarEmbarqueCandidatura } from "@/app/crm/actions";
import { MODELOS_ORIGINAIS } from "@/lib/empregos/valoresModelos";
import { ETAPAS_MANUAIS, dataHoraSP, lerAndamentoManual } from "@/lib/crm/andamentoManual";
import { dataCurtaSP, linhaTempoCandidatura } from "@/lib/crm/linhaTempoCandidatura";
import { fichaLiberada, linhasFicha, type FichaCadastral } from "@/app/lib/fichaCadastral";
import {
  CLASSIFICACOES,
  STATUS_CANDIDATURA,
  isClassificacao,
  linhasPerfil,
  linhasTriagemBasica,
  urlArquivoCandidato,
  PASTA_ANEXOS_EQUIPE,
  TIPOS_DOCUMENTO_CANDIDATO,
  progressoCandidatura,
} from "@/lib/crm/empregos";
import { formatarMoeda, type Proposta } from "@/app/lib/financiamentoEmpregos";
import type { PerfilCandidato } from "@/app/lib/triagemPerfil";
import { INFO_TESTES, ORDEM_TESTES, lerEstadoTestes, testesAptidaoPendentes, urlAposMatch, vagaExigeTestesAptidao } from "@/app/lib/testesAptidao";

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
  // Anexos manuais da equipe (Wilson, 15/out/2026) — listados pelo prefixo
  // do id da candidatura na pasta anexos-equipe/.
  const { data: anexosEquipe } = await createAdminClient()
    .storage.from("curriculos-candidatos")
    .list(PASTA_ANEXOS_EQUIPE, { search: `${id}__`, limit: 100, sortBy: { column: "created_at", order: "asc" } });
  // Documentos anexados pela equipe, agrupados pelo tipo escolhido no menu.
  const documentos: { tipo: string; nome: string; href: string }[] = [];
  for (const a of anexosEquipe ?? []) {
    if (!a.name.startsWith(`${id}__`)) continue;
    const partes = a.name.split("__");
    const temTipo = partes.length >= 4 && TIPOS_DOCUMENTO_CANDIDATO.some((t) => t.key === partes[2]);
    documentos.push({
      tipo: temTipo ? partes[2] : "outros",
      nome: (temTipo ? partes.slice(3) : partes.slice(2)).join("__") || a.name,
      href: urlArquivoCandidato("curriculos-candidatos", `${PASTA_ANEXOS_EQUIPE}/${a.name}`),
    });
  }

  const salvar = atualizarCandidatura.bind(null, id);
  const ficha = (c.ficha ?? null) as FichaCadastral | null;
  // Vagas com testes de aptidão: a ficha só abre com os testes aprovados
  // (ou liberada à mão aqui).
  const etapa2Aberta = fichaLiberada(c) && !testesAptidaoPendentes(c);
  const linkFicha = c.ficha_token ? `https://www.alpinea.io${urlAposMatch(c.vaga_id, c.id, c.ficha_token)}` : null;
  const { data: entrevista } = await supabase
    .from("entrevistas_agendadas")
    .select("inicio, status")
    .eq("candidatura_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const progresso = progressoCandidatura(c, entrevista?.status === "agendada" ? entrevista.inicio : null);
  const proposta = (c.proposta_financiamento ?? null) as Proposta | null;
  const dataCurta = dataCurtaSP;
  // Andamento manual (Wilson, 15/out/2026): o operador marca etapas — as
  // automáticas e as posteriores (empreiteira, COE, visto, embarque).
  // Linha do tempo compartilhada com o portal da empreiteira.
  const andamento = lerAndamentoManual(c.andamento_manual);
  const linhaTempo = linhaTempoCandidatura(c, entrevista ?? null);
  const etapasPendentes = linhaTempo.filter((e) => e.id && !e.ok);
  const registrarAndamento = registrarAndamentoCandidatura.bind(null, id);
  const salvarEmbarque = salvarEmbarqueCandidatura.bind(null, id);
  const reclassificar = reclassificarCandidatura.bind(null, id);
  const reclassificacao = andamento.reclassificacoes.at(-1);
  const eliminadoAgora = classificacao === "eliminado";
  const alternarLiberacao = liberarFichaCandidatura.bind(null, id, !c.ficha_liberada);

  return (
    <div>
      {/* Cabeçalho + cards Triagem / Processo seletivo (redesenho 23/out/2026). */}
      <VoltarLista chave="crm.empregos.retorno" base="/crm/empregos" rotulo="Candidatos" className="text-[13px] text-[#626E69] hover:text-[#27675B]" />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="break-words text-[#202B28]">
            {c.nome} {c.sobrenome}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#202B28]">
            {c.vaga_empresa} — <span className="font-normal">{c.vaga_titulo}</span>
          </p>
          <p className="mt-0.5 text-sm text-[#626E69]">
            {[c.email, c.telefone, c.idade ? `${c.idade} anos` : null].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-0.5 text-[13px] tabular-nums text-[#626E69]">
            Candidatura recebida em {new Date(c.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {/* Foto enviada pelo candidato (Wilson, 15/out/2026). */}
        {c.foto_path ? (
          <a
            href={urlArquivoCandidato("fotos-candidatos", c.foto_path)}
            target="_blank"
            rel="noreferrer"
            title="Abrir a foto em tamanho real"
            className="block h-[120px] w-[96px] shrink-0 overflow-hidden rounded-2xl border border-[#DEE6E2] bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urlArquivoCandidato("fotos-candidatos", c.foto_path)} alt={`Foto de ${c.nome}`} className="h-full w-full object-cover" />
          </a>
        ) : (
          <div className="flex h-[120px] w-[96px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#DEE6E2] bg-white px-2 text-center text-[13px] leading-4 text-[#626E69]">
            Foto ainda não enviada
          </div>
        )}
      </div>

      <div className="mt-6">
        <CardsCandidatura
          classificacao={classificacao}
          pontuacao={typeof c.pontuacao === "number" ? c.pontuacao : null}
          motivos={motivos.length}
          pontosRevisar={revisar.length}
          reclassificacao={reclassificacao ? `Reclassificado manualmente por ${reclassificacao.por} em ${dataHoraSP(reclassificacao.em)}` : null}
          status={c.status ?? "novo"}
          etapas={linhaTempo.map((e) => ({ label: e.label, quando: e.quando, ok: e.ok }))}
        />
      </div>

      {salvo && <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Alterações salvas.</p>}
      {erro && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {motivos.length > 0 && (
            <section className="rounded-2xl border border-t-[3px] border-[#B42318]/20 border-t-[#B42318] bg-[#FDECEA] p-5">
              <h2 className="text-[#B42318]">
                Motivos da eliminação
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#20252B]">
                {motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          )}
          {revisar.length > 0 && (
            <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#93703D] bg-[#FAF5EB] p-5">
              <h2 className="text-[#93703D]">Pontos para revisar</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {revisar.map((r) => (
                  <span key={r} className="rounded-full bg-white px-2.5 py-1 text-[13px] text-[#6E5430]">
                    {r}
                  </span>
                ))}
              </div>
            </section>
          )}

          {criterios.length > 0 && (
            <section id="criterios" className="scroll-mt-28 rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#75608B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
              <h2 className="text-[#202B28]">Composição do score</h2>
              <div className="mt-3 space-y-3">
                {criterios.map((cr) => (
                  <div key={cr.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#20252B]">{cr.label}</span>
                      <span className="tabular-nums text-[#626B75]">
                        {cr.pontosObtidos}/{cr.pontosMaximos}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                      <div className="h-full rounded-full bg-[#1C3A5E]" style={{ width: `${cr.pontosMaximos ? (cr.pontosObtidos / cr.pontosMaximos) * 100 : 0}%` }} />
                    </div>
                    <p className="mt-1 text-[13px] text-[#626B75]">{cr.detalhe}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vagaExigeTestesAptidao(c.vaga_id) && (
            <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#75608B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[#202B28]">Testes de aptidão</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
                    c.testes_aptidao_aprovado === true
                      ? "bg-emerald-50 text-emerald-700"
                      : c.testes_aptidao_aprovado === false
                        ? "bg-red-50 text-red-700"
                        : "bg-black/[0.05] text-[#626B75]"
                  }`}
                >
                  {c.testes_aptidao_aprovado === true ? "Aprovado" : c.testes_aptidao_aprovado === false ? "Reprovado" : "Em andamento / não feito"}
                </span>
              </div>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {ORDEM_TESTES.map((k) => {
                  const r = lerEstadoTestes(c.testes_aptidao).resultados[k];
                  return (
                    <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                      <dt className="text-[#626B75]">
                        {INFO_TESTES[k].titulo}
                        {!INFO_TESTES[k].eliminatorio && <span className="block text-[13px]">não elimina</span>}
                      </dt>
                      <dd className={r ? (r.aprovado ? "text-[#20252B]" : INFO_TESTES[k].eliminatorio ? "text-red-700" : "text-[#20252B]") : "text-[#626B75]"}>
                        {r ? `${r.aprovado ? "✓" : INFO_TESTES[k].eliminatorio ? "✗" : "•"} ${r.resumo}` : "Não feito"}
                        {r && k === "nihongo" && (
                          <span className="mt-1 block text-[13px] text-[#626B75]">
                            {Object.entries(r.respostas as Record<string, string>)
                              .filter(([, v]) => v)
                              .map(([q, v]) => `${q}: ${v}`)
                              .join(" · ")}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {c.testes_aptidao_aprovado === false && !c.ficha_liberada && (
                <p className="mt-2 text-[13px] text-amber-700">Ficha bloqueada pelos testes — use “Liberar etapa 2” para seguir mesmo assim.</p>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#75608B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Triagem</h2>
            <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
              {linhasTriagemBasica(respostas).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                  <dt className="text-[#626B75]">{k}</dt>
                  <dd className="text-[#20252B]">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {linhasPerfil(perfil).map((g) => (
            <section key={g.grupo} className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
              <h2 className="text-[#202B28]">{g.grupo}</h2>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {g.linhas.map(([k, v, atencao]) => (
                  <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                    <dt className="text-[#626B75]">{k}</dt>
                    <dd className={atencao ? "font-medium text-[#93703D]" : "text-[#20252B]"}>
                      {atencao && "⚠ "}
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {ficha && (
            <h2 className="pt-4 text-[#202B28]">Etapa 2 — ficha cadastral</h2>
          )}
          {linhasFicha(ficha).map((g) => (
            <section key={`ficha-${g.grupo}`} className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
              <h2 className="text-[#202B28]">{g.grupo}</h2>
              <dl className="mt-3 divide-y divide-black/[0.06] text-sm">
                {g.linhas.map(([k, v, atencao], i) => (
                  <div key={`${k}-${i}`} className="grid grid-cols-[180px_1fr] gap-3 py-2">
                    <dt className="text-[#626B75]">{k}</dt>
                    <dd className={atencao ? "font-medium text-[#93703D]" : "text-[#20252B]"}>
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
          <section id="andamento" className="scroll-mt-28 rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#27675B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Andamento</h2>
            <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[13px]" style={{ color: progresso.cor, background: `${progresso.cor}14` }}>
              {progresso.label}
            </span>
            <ol className="mt-4 space-y-3">
              {linhaTempo.map((e) => (
                <li key={e.label} className="flex gap-2.5 text-[13px]">
                  <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${e.ok ? "bg-emerald-600" : "border border-black/20"}`} />
                  <span>
                    <span className={e.ok ? "text-[#20252B]" : "text-[#626B75]"}>{e.label}</span>
                    {e.quando && <span className="block text-[#626B75]">{e.quando}</span>}
                    {e.manual && <span className="block text-[13px] text-[#626B75]">marcado por {e.manual.por}</span>}
                  </span>
                </li>
              ))}
            </ol>
            {entrevista?.status === "agendada" && (
              <Link href="/crm/empregos/agenda" className="mt-4 block text-[13px] text-[#1C3A5E] underline">
                Ver na agenda
              </Link>
            )}

            {/* Data prevista de embarque — aparece no portal da empreiteira (Wilson, 21/out/2026). */}
            <form action={salvarEmbarque} className="mt-4 flex flex-wrap items-end gap-2 border-t border-black/10 pt-4">
              <label className="min-w-0 flex-1">
                <span className="text-[13px] text-[#626B75]">Data prevista de embarque</span>
                <input
                  type="date"
                  name="data_embarque_prevista"
                  defaultValue={c.data_embarque_prevista ?? ""}
                  className="mt-1 block w-full rounded-lg border border-black/15 px-2.5 py-1.5 text-sm"
                />
              </label>
              <button type="submit" className="rounded-lg border border-black/15 px-3 py-1.5 text-[13px] text-[#20252B] hover:border-black/40">
                Salvar
              </button>
            </form>

            {/* Avançar etapa manualmente + comentário (Wilson, 15/out/2026). */}
            <form action={registrarAndamento} className="mt-4 space-y-2 border-t border-black/10 pt-4">
              <label className="text-[13px] text-[#626B75]" htmlFor="etapa-manual">
                Avançar candidato para a próxima etapa
              </label>
              <select id="etapa-manual" name="etapa" defaultValue="" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B] outline-none focus:border-[#1C3A5E]">
                <option value="">Só comentar (sem avançar)</option>
                {etapasPendentes.map((e) => (
                  <option key={e.id} value={e.id}>
                    Marcar: {e.label}
                  </option>
                ))}
              </select>
              <textarea
                name="comentario"
                rows={3}
                placeholder="Comentário (opcional ao avançar)"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[#20252B] outline-none focus:border-[#1C3A5E]"
              />
              <button type="submit" className="w-full rounded-xl bg-[#1C3A5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3A5E]/90">
                Salvar
              </button>
            </form>

            {andamento.comentarios.length > 0 && (
              <div className="mt-4 border-t border-black/10 pt-4">
                <p className="text-[13px] text-[#626B75]">Comentários</p>
                <ul className="mt-2 space-y-3">
                  {[...andamento.comentarios].reverse().map((cm, i) => (
                    <li key={`${cm.em}-${i}`} className="text-[13px]">
                      <p className="whitespace-pre-wrap text-[#20252B]">{cm.texto}</p>
                      <p className="mt-0.5 text-[13px] text-[#626B75]">
                        {dataCurta(cm.em)} · {cm.por}
                        {cm.etapa ? ` · ${ETAPAS_MANUAIS.find((x) => x.id === cm.etapa)?.label ?? ""}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Documento de Apresentação para Empreiteira</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#626B75]">
              PDF resumido no padrão Ajisai, com foto — sem contato, CPF nem RG. As fichas das empreiteiras ficam na seção abaixo,
              no arquivo original.
            </p>
            <form action={`/crm/empregos/${id}/apresentacao`} method="get" target="_blank" className="mt-3 space-y-2">
              {/* Modelos das empreiteiras saem no arquivo original (seção abaixo). */}
              <input type="hidden" name="modelo" value="alpinea" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-[#1C3A5E] px-3 py-2 text-sm font-medium text-white">
                  Gerar PDF
                </button>
                <button type="submit" name="download" value="1" className="rounded-xl border border-[#1C3A5E] px-3 py-2 text-sm font-medium text-[#1C3A5E]">
                  Baixar
                </button>
              </div>
            </form>
            {!c.ficha_enviada_em && <p className="mt-2 text-[13px] text-amber-700">Ficha da etapa 2 ainda não enviada — o PDF sai só com os dados da etapa 1.</p>}
          </section>

          {/* Ficha ORIGINAL de cada empreiteira (o Word/Excel que ela manda)
              preenchida com os dados do candidato — Wilson, 15/out/2026. */}
          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Fichas das empreiteiras (arquivo original)</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#626B75]">
              Preenche o próprio Word/Excel da empreiteira com os dados do candidato. Confira e complete os campos da agência antes de enviar.
            </p>
            <form action={`/crm/empregos/${id}/ficha-original`} method="get" className="mt-3 space-y-2">
              <select name="modelo" defaultValue="fujiarte" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B]">
                {MODELOS_ORIGINAIS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.arquivo.endsWith(".docx") ? "Word" : "Excel"})
                  </option>
                ))}
                <option value="todos">Todas as 4 fichas (.zip)</option>
              </select>
              <button type="submit" className="w-full rounded-xl bg-[#1C3A5E] px-3 py-2 text-sm font-medium text-white">
                Preencher e baixar
              </button>
            </form>
            {!c.ficha_enviada_em && <p className="mt-2 text-[13px] text-amber-700">Ficha da etapa 2 ainda não enviada — a maior parte dos campos vai sair em branco.</p>}
          </section>

          {proposta && (
            <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#75608B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
              <h2 className="text-[#202B28]">
                Etapa 3 — proposta {c.proposta_status === "aceita" ? "aceita" : "· quer falar com a Ajisai"}
              </h2>
              <p className="mt-1 text-[13px] text-[#626B75]">
                {proposta.selecao.proponentes} pessoa(s) · saída {proposta.selecao.aeroporto} · ¥1 = R$ {proposta.cotacaoBRLPorJPY.toFixed(4)}
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px]">
                {proposta.itens.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span className="text-[#20252B]">{i.label}</span>
                    <span className="tabular-nums text-[#20252B]">{formatarMoeda(i.totalJPY, "JPY")}</span>
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
          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Etapa 2 — ficha cadastral</h2>
            <p className="mt-2 text-sm text-[#626B75]">
              {c.ficha_enviada_em
                ? `Enviada em ${new Date(c.ficha_enviada_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}${c.foto_path ? " · com foto" : " · sem foto"}`
                : etapa2Aberta
                  ? "Liberada — aguardando o candidato."
                  : testesAptidaoPendentes(c) && fichaLiberada(c)
                    ? c.testes_aptidao_aprovado === false
                      ? "Bloqueada — reprovado nos testes de aptidão."
                      : "Aguardando os testes de aptidão."
                    : "Bloqueada — candidato eliminado (pode liberar abaixo)."}
            </p>
            {linkFicha && (etapa2Aberta || (fichaLiberada(c) && c.testes_aptidao_aprovado == null)) && (
              <div className="mt-3">
                <p className="text-[13px] text-[#626B75]">Link para enviar ao candidato</p>
                <input readOnly value={linkFicha} className="mt-1 w-full rounded-lg border border-black/10 bg-black/[0.02] px-2 py-1.5 text-[13px] text-[#20252B]" />
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
          {/* Reclassificação manual aprovado ⇄ eliminado, sempre registrada
              com e-mail do operador, data/hora e motivo (Wilson, 15/out/2026). */}
          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#75608B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Reclassificar candidato</h2>
            <p className="mt-1 text-[13px] text-[#626B75]">
              Classificação atual: <strong style={{ color: tipo.cor }}>{tipo.label}</strong>
              {reclassificacao ? " (manual)" : " (automática pelo questionário)"}
            </p>
            {andamento.reclassificacoes.length > 0 && (
              <ul className="mt-3 space-y-2 border-l-2 border-[#b7791f]/40 pl-3 text-[13px]">
                {[...andamento.reclassificacoes].reverse().map((r, i) => (
                  <li key={i}>
                    <p className="font-medium text-[#20252B]">
                      {r.para === "eliminado" ? "Eliminado" : "Aprovado"} manualmente
                    </p>
                    <p className="text-[#626B75]">
                      {r.por} · {dataHoraSP(r.em)}
                    </p>
                    <p className="text-[#626B75]">Motivo: {r.motivo}</p>
                  </li>
                ))}
              </ul>
            )}
            <form action={reclassificar} className="mt-3 space-y-2">
              <input type="hidden" name="para" value={eliminadoAgora ? "aprovado" : "eliminado"} />
              <textarea
                name="motivo"
                required
                rows={2}
                placeholder="Motivo (obrigatório)"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-[#20252B] outline-none focus:border-[#1C3A5E]"
              />
              <button
                type="submit"
                className={`w-full rounded-xl px-4 py-2 text-sm font-medium text-white ${eliminadoAgora ? "bg-[#2f7a52]" : "bg-[#b23b3b]"}`}
              >
                {eliminadoAgora ? "Reclassificar como aprovado" : "Reclassificar como eliminado"}
              </button>
              <p className="text-[13px] text-[#626B75]">Fica registrado como alteração manual, com seu e-mail, data e hora.</p>
            </form>
          </section>
          <form action={salvar} className="space-y-4 rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#27675B] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Decisão da equipe</h2>
            <label className="block text-[13px] text-[#626B75]">
              Status da análise (coluna “Status” da lista)
              <select name="status" defaultValue={c.status} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B]">
                {STATUS_CANDIDATURA.map((x) => (
                  <option key={x.valor} value={x.valor}>
                    {x.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[13px] leading-4 text-[#626B75]">
                Não muda a etapa. Para mandar o candidato à próxima etapa, use “Avançar candidato” no quadro Andamento.
              </span>
            </label>
            <label className="block text-[13px] text-[#626B75]">
              Observações internas
              <textarea
                name="observacoes_equipe"
                rows={5}
                defaultValue={c.observacoes_equipe ?? ""}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-[#20252B] outline-none focus:border-[#1C3A5E]"
              />
            </label>
            <button type="submit" className="w-full rounded-xl bg-[#1C3A5E] px-4 py-2.5 text-sm font-medium text-white">
              Salvar
            </button>
          </form>

          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#5D6C70] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Arquivos</h2>
            {arquivos.length === 0 ? (
              <p className="mt-2 text-sm text-[#626B75]">Nenhum arquivo enviado.</p>
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

          {/* Documentos do candidato — lista só do CRM, com o que já foi
              anexado pela equipe e o que falta (Wilson, 15/out/2026). */}
          <section className="rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#202B28]">Documentos</h2>
            <ul className="mt-3 divide-y divide-black/[0.06] text-sm">
              {TIPOS_DOCUMENTO_CANDIDATO.filter((t) => t.key !== "outros" || documentos.some((d) => d.tipo === "outros")).map((t) => {
                const docs = documentos.filter((d) => d.tipo === t.key);
                return (
                  <li key={t.key} className="flex items-start gap-2 py-2">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[13px] ${docs.length ? "bg-emerald-600 text-white" : "border border-black/20"}`}>
                      {docs.length ? "✓" : ""}
                    </span>
                    <div className="min-w-0">
                      <p className={docs.length ? "text-[#20252B]" : "text-[#626B75]"}>{t.label}</p>
                      {docs.map((d) => (
                        <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer" className="block truncate text-[13px] text-[#1C3A5E] underline underline-offset-2">
                          {d.nome}
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <form action="/crm/empregos/anexo" method="post" encType="multipart/form-data" className="mt-4 border-t border-black/10 pt-4">
              <input type="hidden" name="candidaturaId" value={id} />
              <label className="text-[13px] text-[#626B75]" htmlFor="tipo-doc">
                Tipo de documento
              </label>
              <select id="tipo-doc" name="tipo" required defaultValue="" className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B] outline-none focus:border-[#1C3A5E]">
                <option value="" disabled>
                  Selecione…
                </option>
                {TIPOS_DOCUMENTO_CANDIDATO.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="file"
                name="arquivo"
                multiple
                required
                className="mt-2 w-full text-[13px] text-[#626B75] file:mr-3 file:rounded-lg file:border-0 file:bg-black/[0.05] file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-[#20252B]"
              />
              <p className="mt-1 text-[13px] text-[#626B75]">PDF, imagem ou documento — até 4 MB cada. Fica privado, só para a equipe.</p>
              <button type="submit" className="mt-3 w-full rounded-xl border border-[#1C3A5E] px-4 py-2 text-sm font-medium text-[#1C3A5E] hover:bg-[#1C3A5E]/5">
                Anexar
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
