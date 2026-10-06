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
} from "@/lib/crm/empregos";
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
